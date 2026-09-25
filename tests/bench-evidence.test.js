import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { appendBenchEvidence, getBenchEvidence, normalizeBenchEvidence } from '../src/bench-evidence.js';
import { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, evaluatePuzzle } from '../src/puzzle-model.js';

const source = (await readFile(new URL('../src/puzzles.js', import.meta.url), 'utf8'))
  .replace("import './puzzles.css';", '')
  .replace(/'\.\/(electrical|puzzle-model|bench-evidence)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/${name}.js`)).href));
const { PuzzleWorkbench } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
function controller(id) {
  const saves = [], sounds = [], solved = [];
  const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), { id, puzzle: PUZZLES[id], state: initialPuzzleSnapshot(id), history: [], selected: null, mode: 'wire', showNumbers: false, active: true,
    render() {}, shell: { remove() {} }, callbacks: { onChange: (_, state) => saves.push(state), onSound: sound => sounds.push(sound), onSolve: id => solved.push(id) } });
  bench.evaluate(false);
  const click = dataset => bench.handleClick({ target: { closest: () => ({ dataset, tagName: 'button' }) } });
  return { bench, click, saves, sounds, solved };
}

test('legacy and malformed evidence cannot manufacture journal history', () => {
  assert.deepEqual(getBenchEvidence('gate', { id: 'gate', completed: true }), []);
  assert.deepEqual(getBenchEvidence('gate', { id: 'pump', evidence: [{ kind: 'measurement', text: 'wrong installation' }] }), []);
  const malformed = [null, 'text', { kind: 'certificate', text: 'knows everything' }, { kind: 'measurement', text: '' }, { kind: 'result', text: 'x'.repeat(900), value: 999, reference: 'y'.repeat(400) }];
  const clean = normalizeBenchEvidence(malformed);
  assert.equal(clean.length, 1); assert.equal(clean[0].text.length, 280); assert.equal(clean[0].reference.length, 240); assert.ok(!('value' in clean[0]));
  const snapshot = initialPuzzleSnapshot('gate');
  for (let i = 0; i < 100; i++) appendBenchEvidence(snapshot, { kind: 'intervention', text: `change ${i}` });
  appendBenchEvidence(snapshot, { kind: 'intervention', text: 'change 99' });
  assert.equal(snapshot.evidence.length, 40); assert.equal(snapshot.evidence[0].text, 'change 60');
  assert.deepEqual(normalizePuzzleSnapshot('gate', snapshot).evidence, snapshot.evidence);
});

test('a completed marker on a broken imported montage cannot lock its controls', () => {
  const broken = initialPuzzleSnapshot('workshop'); broken.completed = true;
  const { bench } = controller('workshop');
  bench.state = normalizePuzzleSnapshot('workshop', broken);
  assert.equal(bench.state.completed, false);
  bench.state.sourceOn = false;
  bench.touchPort('spliceA'); bench.touchPort('spliceB');
  bench.state.sourceOn = true;
  assert.equal(evaluatePuzzle('workshop', bench.state).solved, true);
});

test('wiring waits for isolation and the journal preserves the actual failed attempt', () => {
  const { bench, click, saves } = controller('workshop');
  const original = structuredClone(bench.state.wires);
  bench.touchPort('spliceA');
  assert.deepEqual(bench.state.wires, original); assert.equal(bench.selected, null);
  assert.match(bench.feedback, /apagá/);
  assert.equal(bench.state.evidence.filter(e => e.kind === 'measurement').length, 0);
  click({ action: 'power' });
  bench.touchPort('spliceA'); bench.touchPort('spliceB');
  click({ action: 'power' });
  assert.equal(bench.result.solved, true);
  assert.ok(saves.at(-1).evidence.some(e => e.kind === 'intervention' && /Uní Costura A con Costura B/.test(e.text)));
  assert.ok(saves.at(-1).evidence.some(e => e.kind === 'result' && /clara y pareja/.test(e.text)));
});

test('only an actual probe reading becomes a measurement, and numeric disclosure is respected', () => {
  const { bench, click } = controller('workshop');
  click({ action: 'mode', mode: 'continuity' });
  bench.touchPort('spliceA'); bench.touchPort('spliceB');
  assert.equal(bench.state.evidence.filter(e => e.kind === 'measurement').length, 0);
  click({ action: 'power' });
  const plain = bench.state.evidence.at(-1);
  assert.equal(plain.kind, 'measurement'); assert.equal(plain.value, 'Sin camino');
  assert.match(plain.reference, /Punta roja: Costura A; punta negra: Costura B/);
  assert.doesNotMatch(plain.value, /\d|Ω|V|A/);
  click({ action: 'numbers' });
  assert.equal(bench.state.evidence.at(-1).value, 'ABIERTO');
});

test('current insertion is in series, requires isolation and shares the selected branch current', () => {
  const { bench, click } = controller('distribution');
  assert.equal(bench.state.switches.archive, false);
  assert.equal(bench.state.tripped, false, 'the outside isolation must not be silently undone');
  click({ action: 'mode', mode: 'current' });
  click({ branch: 'clinic' });
  assert.equal(bench.state.meter.branch, null);
  click({ action: 'power' }); click({ branch: 'clinic' });
  assert.equal(bench.state.meter.branch, 'clinic');
  assert.match(bench.componentSvg(PUZZLES.distribution.components[0]), /Medidor insertado en serie/);
  click({ action: 'power' }); click({ action: 'numbers' });
  const reading = bench.state.evidence.at(-1);
  assert.equal(reading.kind, 'measurement'); assert.match(reading.reference, /en serie con Enfermería/);
  assert.equal(Number(reading.value.replace(' A', '').replace(',', '.')), Math.round(bench.result.solution.branches.clinic.current * 100) / 100);
  click({ action: 'switch', key: 'archive' });
  assert.equal(bench.state.switches.archive, false, 'external isolation is not a second independent local switch');
});

test('undo and reset retain experiment history instead of rewriting the past', () => {
  const { bench, click } = controller('workshop');
  click({ action: 'power' });
  bench.touchPort('spliceA'); bench.touchPort('spliceB');
  const prior = structuredClone(bench.state.evidence);
  click({ action: 'undo' });
  assert.deepEqual(bench.state.evidence.slice(0, prior.length), prior);
  assert.equal(bench.state.sourceOn, false);
  click({ action: 'reset' });
  assert.deepEqual(bench.state.evidence.slice(0, prior.length), prior);
  assert.equal(bench.state.sourceOn, false);
});

const solvedWires = {
  awaken: [['positive', 'heartIn'], ['heartOut', 'negative']],
  workshop: [...PUZZLES.workshop.initialWires, ['spliceA', 'spliceB']],
  gate: [['positive','trimA'], ['trimB','latchIn'], ['latchOut','negative']],
  pump: [...PUZZLES.pump.initialWires, ['lineA','lineB']],
  distribution: [['positive','clinicIn'], ['clinicOut','negative'], ['positive','kitchenIn'], ['kitchenOut','negative']],
  irrigation: PUZZLES.irrigation.initialWires,
  beacon_supply: PUZZLES.beacon_supply.initialWires,
  beacon_network: [['positive','opticIn'], ['opticOut','negative'], ['positive','bearingIn'], ['bearingOut','negative'], ['positive','signalIn'], ['signalOut','negative']],
  beacon_lens: [['positive','upperA'], ['lowerB','negative'], ['tap','lensIn'], ['lensOut','negative']],
};
const settings = { irrigation: { warmth: 12, flow: 12 }, beacon_supply: { ballast: 3 }, beacon_lens: { upper: 12 } };
for (const id of Object.keys(PUZZLES)) test(`${id}: the real controller still permits a novice repair, records it and commissions once`, () => {
  const { bench, click, solved } = controller(id);
  click({ action: 'power' });
  while (bench.state.wires.length) click({ wire: '0' });
  for (const [a, b] of solvedWires[id]) { bench.touchPort(a); bench.touchPort(b); }
  for (const [key, target] of Object.entries(settings[id] ?? {})) {
    while (bench.state.values[key] !== target) click({ action: 'knob', key, delta: String(Math.sign(target - bench.state.values[key])) });
  }
  click({ action: 'power' });
  assert.equal(bench.result.solved, true, id);
  assert.ok(bench.state.evidence.some(e => e.kind === 'result'));
  assert.equal(bench.state.evidence.filter(e => e.kind === 'measurement').length, 0, 'successful operation must not invent a measurement or require a quiz');
  const previousDocument = globalThis.document;
  globalThis.document = { removeEventListener() {} };
  try { bench.close(); bench.close(); } finally { globalThis.document = previousDocument; }
  assert.deepEqual(solved, [id]);
});
