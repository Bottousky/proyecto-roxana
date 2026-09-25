import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle } from '../src/puzzle-model.js';

const source = (await readFile(new URL('../src/puzzles.js', import.meta.url), 'utf8'))
  .replace("import './puzzles.css';", '')
  .replace(/'\.\/(electrical|puzzle-model|bench-evidence)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/${name}.js`)).href));
const { PuzzleWorkbench, BENCH_GUIDANCE, observePuzzle } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function bench(id, state = initialPuzzleSnapshot(id)) {
  const element = { style: { setProperty() {} }, offsetHeight: 0, value: '', scrollTop: 0 };
  const shell = { innerHTML: '', contains: () => false, querySelector: () => element, querySelectorAll: () => [], remove() {} };
  const b = Object.assign(Object.create(PuzzleWorkbench.prototype), { id, puzzle: PUZZLES[id], state, history: [], selected: null, mode: 'wire', showNumbers: false, active: true, feedback: '', shell, callbacks: {} });
  b.evaluate(false);
  b.html = () => { const previous = globalThis.document; globalThis.document = { activeElement: null }; try { b.render(); } finally { globalThis.document = previous; } return shell.innerHTML; };
  return b;
}
const instruction = html => html.match(/class="wb-instruction">.*?<\/span>(.*?)<\/p>/s)?.[1] ?? '';

test('every bench ends its hints with a concrete step that names real terminals', () => {
  for (const id of Object.keys(PUZZLES)) {
    const hints = BENCH_GUIDANCE[id].hints;
    assert.equal(PUZZLES[id].hints.length, hints.length, `${id}: both hint lists agree, so a saved hint count survives reloads`);
    const step = hints.at(-1);
    assert.match(step, /Probá|paso para probar/, `${id}: the last hint proposes an action`);
    const b = bench(id);
    const labels = new Set(PUZZLES[id].ports.map(p => b.portLabel(p.id)));
    for (const [, named] of step.matchAll(/«([^»]+)»/g)) assert.ok(labels.has(named), `${id}: «${named}» is a terminal on this bench`);
  }
});

test('the hint button announces when the next help is a concrete step', () => {
  const b = bench('workshop');
  b.state.hints = BENCH_GUIDANCE.workshop.hints.length - 1;
  assert.match(b.html(), /Mostrame un paso para probar/);
});

test('with the supply on, the board says to switch it off before wiring', () => {
  const previous = globalThis.document;
  globalThis.document = { activeElement: null };
  try {
  const b = bench('distribution');
  assert.match(instruction(b.html()), /apagá la alimentación para mover cables/);
  b.touchPort('clinicOut');
  assert.equal(b.blockedBySupply, true);
  assert.match(b.html(), /wb-power on\s+wb-next-step/, 'the power switch is highlighted as the next step');

  b.state.sourceOn = false; b.blockedBySupply = false; b.evaluate(false);
  assert.match(instruction(b.html()), /Tocá un cable para retirarlo/);
  b.handleClick({ target: { closest: () => ({ dataset: { wire: '1' }, tagName: 'g' }) } });
  assert.equal(b.pendingTest, true);
  assert.match(instruction(b.html()), /encendé la alimentación para probar/);
  } finally { globalThis.document = previous; }
});

test('the first bench never asks to switch off: Ohm is wired live and gently', () => {
  assert.doesNotMatch(instruction(bench('awaken').html()), /apagá/);
});

test('knobs read as brakes, so turning right has an honest meaning', () => {
  const html = bench('irrigation').html();
  assert.match(html, /Freno del calor/);
  assert.match(html, /Freno del agua/);
  assert.doesNotMatch(html, /Mando del calor|Mando del agua/);
  assert.match(html, /Hacia la derecha frena más: pasa menos/);
});

test('observations mark the approach to the working band on both sides', () => {
  const supply = initialPuzzleSnapshot('beacon_supply');
  supply.values.ballast = 6;
  assert.match(observePuzzle('beacon_supply', supply)[0].text, /Casi se sostiene/);
  supply.values.ballast = 20;
  assert.match(observePuzzle('beacon_supply', supply)[0].text, /Tiembla/);

  const lens = { ...initialPuzzleSnapshot('beacon_lens'), wires: [['positive', 'upperA'], ['lowerB', 'negative'], ['tap', 'lensIn'], ['lensOut', 'negative']] };
  lens.values.upper = 15;
  assert.match(observePuzzle('beacon_lens', lens)[0].text, /asoma dorada/);
  lens.values.upper = 10;
  assert.match(observePuzzle('beacon_lens', lens)[0].text, /un poco dura/);
});

test('a protection trip explains what usually causes it', () => {
  const s = initialPuzzleSnapshot('distribution');
  s.tripped = true;
  assert.match(observePuzzle('distribution', s)[0].text, /une \+ y − sin atravesar ningún receptor/);
});

test('the Faro lens needs its divider: the series shortcut would contradict the journal lesson', () => {
  // Series dropper with the initial knob: the lens alone is in range, but the lower arm is idle.
  const shortcut = { ...initialPuzzleSnapshot('beacon_lens'), wires: [['positive', 'upperA'], ['tap', 'lensIn'], ['lensOut', 'negative']] };
  const r = evaluatePuzzle('beacon_lens', shortcut);
  assert.equal(r.operating.lens, true);
  assert.equal(r.solved, false);
  assert.ok(observePuzzle('beacon_lens', shortcut).some(o => o.label === 'El divisor' && /dos brazos/.test(o.text)));

  const divider = { ...initialPuzzleSnapshot('beacon_lens'), wires: [['positive', 'upperA'], ['lowerB', 'negative'], ['tap', 'lensIn'], ['lensOut', 'negative']] };
  divider.values.upper = 12;
  assert.equal(evaluatePuzzle('beacon_lens', divider).solved, true);
  assert.ok(observePuzzle('beacon_lens', divider).every(o => o.label !== 'El divisor'));
});
