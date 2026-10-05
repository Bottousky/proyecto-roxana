import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { PUZZLES, HINT_STEPS, initialPuzzleSnapshot, evaluatePuzzle, isPolarized } from '../src/puzzle-model.js';

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
    assert.equal(hints.length, HINT_STEPS, `${id}: every bench offers the same steps, so a saved hint count survives reloads`);
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
  supply.values.ballast = 0;
  assert.match(observePuzzle('beacon_supply', supply)[0].text, /Casi se sostiene/);
  supply.values.ballast = 5;
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

test('with no cable in hand, touching a terminal does not pick up a cable that is not there', () => {
  const previous = globalThis.document;
  globalThis.document = { activeElement: null };
  try {
    const b = bench('awaken');
    b.touchPort('heartOut'); b.touchPort('negative');
    assert.equal(b.result.solved, true, 'the only cable woke Ohm');
    b.touchPort('positive');
    assert.equal(b.selected, null, 'nothing is held after the last cable is placed');
    assert.match(b.feedback, /No te quedan cables en la mano/);
    assert.doesNotMatch(instruction(b.html()), /apoyar el otro extremo/);
    b.state.completed = true;
    b.touchPort('positive');
    assert.equal(b.selected, null);
    assert.match(b.feedback, /practicá con una copia/, 'an installation in service only changes in a practice copy');
  } finally { globalThis.document = previous; }
});

test('a polarized part wired backwards is described as reversed, never as missing strength', () => {
  for (const [id, p] of Object.entries(PUZZLES)) for (const c of p.components.filter(c => isPolarized(c) && c.goal)) {
    const s = initialPuzzleSnapshot(id); p.solve(s); s.sourceOn = true; s.tripped = false;
    s.wires = s.wires.map(w => w.map(n => n === c.a ? c.b : n === c.b ? c.a : n));
    const said = observePuzzle(id, s).find(o => o.label && c.label.startsWith(o.label.split(' ·')[0]))?.text ?? '';
    assert.match(said, /revés|contrario|hacia atrás/, `${id}/${c.id}: «${said}»`);
    assert.doesNotMatch(said, /casi|apenas|falta/, `${id}/${c.id} reversed must not read as too weak: «${said}»`);
    if (id !== 'gate') assert.doesNotMatch(said, /marca de avance/, `${id}/${c.id} has no advance mark`);
  }
});

test('only parts with a reason to care about direction are polarized: plain coils work either way round', () => {
  assert.equal(isPolarized(PUZZLES.gate.components.find(c => c.id === 'latch')), true, 'the gate latch carries a magnet');
  assert.match(PUZZLES.gate.lesson, /imán/, 'the bench says why its coil is polarized');
  for (const [id, cid] of [['beacon_supply', 'core'], ['beacon_network', 'signal']]) {
    const p = PUZZLES[id], c = p.components.find(c => c.id === cid);
    assert.equal(isPolarized(c), false, `${id}/${cid} is a plain coil`);
    const s = initialPuzzleSnapshot(id); p.solve(s); s.sourceOn = true; s.tripped = false;
    s.wires = s.wires.map(w => w.map(n => n === c.a ? c.b : n === c.b ? c.a : n));
    assert.equal(evaluatePuzzle(id, s).operating[cid], true, `${id}/${cid} works with its two wires swapped`);
  }
});

test("Edda's lost bet in the Castillo is what the model shows: the infirmary does not dim when the kitchen gets its own path", async () => {
  const { DIALOGUES } = await import('../src/content.js');
  assert.match(DIALOGUES.edda_castle_after.map(l => l.text).join(' '), /brilla igual/);
  const s = initialPuzzleSnapshot('distribution'); PUZZLES.distribution.solve(s); s.sourceOn = true; s.tripped = false;
  const together = evaluatePuzzle('distribution', s).solution.branches.clinic.voltage;
  s.switches.kitchen = false;
  const alone = evaluatePuzzle('distribution', s).solution.branches.clinic.voltage;
  assert.ok(Math.abs(together - alone) < .05, `infirmary ${together.toFixed(2)} V with the kitchen, ${alone.toFixed(2)} V alone`);
});
