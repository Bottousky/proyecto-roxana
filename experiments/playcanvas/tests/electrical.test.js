import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { solveDC, measureVoltage, measureResistance, checkOperatingRange } from '../src/game/electrical.js';

// The workbench's only browser-only import is its stylesheet. Exercise its real
// definitions and validators directly without requiring a DOM or bundler in CI.
const puzzleSource = (await readFile(new URL('../src/game/puzzles.js', import.meta.url), 'utf8'))
  .replace("import './puzzles.css';", '')
  .replace(/'\.\/(electrical|puzzle-model|bench-evidence)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/game/${name}.js`)).href));
const { initialPuzzleSnapshot, evaluatePuzzle, normalizePuzzleSnapshot, PuzzleWorkbench, PUZZLES, BENCH_GUIDANCE, observePuzzle } = await import(`data:text/javascript;base64,${Buffer.from(puzzleSource).toString('base64')}`);
const almost = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`);
const source = voltage => ({ id: 'battery', positive: '+', negative: '-', voltage });

test('series resistors conserve current, voltage and power', () => {
  const r = solveDC({ resistors: [{ id: 'r1', a: '+', b: 'mid', resistance: 10 }, { id: 'r2', a: 'mid', b: '-', resistance: 20 }], sources: [source(12)] });
  assert.equal(r.valid, true);
  almost(r.branches.r1.current, .4);
  almost(r.branches.r2.current, .4);
  almost(r.branches.r1.voltage, 4);
  almost(r.branches.r2.voltage, 8);
  almost(r.sourceCurrents.battery, .4);
  almost(r.branches.r1.power + r.branches.r2.power, 12 * r.sourceCurrents.battery);
});

test('parallel network obeys Kirchhoff current law with distinct branch resistances', () => {
  const r = solveDC({ resistors: [{ id: 'a', a: '+', b: '-', resistance: 18 }, { id: 'b', a: '+', b: '-', resistance: 36 }, { id: 'c', a: '+', b: '-', resistance: 72 }], sources: [source(18)] });
  almost(r.branches.a.voltage, 18); almost(r.branches.b.voltage, 18); almost(r.branches.c.voltage, 18);
  almost(r.sourceCurrents.battery, 1.75);
  almost(r.branches.a.current + r.branches.b.current + r.branches.c.current, r.sourceCurrents.battery);
});

test('an open circuit conducts zero and truly isolated terminals are floating', () => {
  const r = solveDC({ nodes: ['lost'], resistors: [{ id: 'load', a: '+', b: 'end', resistance: 12 }, { id: 'break', a: 'end', b: '-', resistance: Infinity }], sources: [source(6)] });
  almost(r.branches.load.current, 0);
  almost(r.voltages.end, 6);
  assert.equal(r.voltages.lost, null);
  assert.equal(measureVoltage(r, 'lost', '-'), null);
  almost(measureVoltage(r, '-', '+'), -6);
});

test('reversing reference changes voltage and current signs, not resistor power', () => {
  const r = solveDC({ resistors: [{ id: 'load', a: '-', b: '+', resistance: 12 }], sources: [source(6)] });
  almost(r.branches.load.voltage, -6); almost(r.branches.load.current, -.5); almost(r.branches.load.power, 3);
  assert.equal(checkOperatingRange(r.branches.load, { minVoltage: 5, maxVoltage: 7 }), false);
});

test('continuity meter measures the equivalent of the connected passive network', () => {
  const network = { resistors: [{ id: 'a', a: 'x', b: 'y', resistance: 24 }, { id: 'b', a: 'x', b: 'y', resistance: 24 }] };
  almost(measureResistance(network, 'x', 'y'), 12);
  assert.equal(measureResistance(network, 'x', 'isolated'), Infinity);
  assert.equal(measureResistance(network, 'x', 'x'), 0);
});

test('the loaded divider accounts for the load in parallel with its lower arm', () => {
  const resistors = [{ id: 'upper', a: '+', b: 'tap', resistance: 12 }, { id: 'lower', a: 'tap', b: '-', resistance: 24 }];
  const unloaded = solveDC({ resistors, sources: [source(18)] });
  almost(unloaded.voltages.tap, 12);
  const loaded = solveDC({ resistors: [...resistors, { id: 'lens', a: 'tap', b: '-', resistance: 24 }], sources: [source(18)] });
  almost(loaded.voltages.tap, 9);
  almost(loaded.branches.lens.current, .375);
});

test('a source short trips protection and removes supply current before operating checks', () => {
  const s = initialPuzzleSnapshot('awaken');
  s.wires.push(['positive', 'negative']);
  const r = evaluatePuzzle('awaken', s);
  assert.equal(r.overloaded, true);
  assert.ok(r.requestedCurrent > 100);
  assert.equal(r.current, 0);
  assert.equal(r.solved, false);
});

// Each bench's canonical repair lives with the puzzle itself.
const solutions = Object.fromEntries(Object.keys(PUZZLES).map(id => [id, s => PUZZLES[id].solve(s)]));

for (const [id, solve] of Object.entries(solutions)) {
  test(`${id}: initial fault is meaningful and a physical repair reaches operating ranges`, () => {
    const s = initialPuzzleSnapshot(id);
    assert.equal(evaluatePuzzle(id, s).solved, false);
    solve(s);
    const r = evaluatePuzzle(id, s);
    assert.equal(r.overloaded, false);
    assert.equal(r.solved, true, JSON.stringify(r.solution.branches));
    assert.ok(r.current > 0);
    assert.equal(evaluatePuzzle(id, { ...s, sourceOn: false }).solved, false);
    assert.equal(evaluatePuzzle(id, { ...s, tripped: true }).solved, false);
  });
}

test('solutions are operating ranges, not memorized control combinations', () => {
  // Terraces: two agreements (a strong or a gentle forge), each with either warm-bed notch.
  for (const [warmth, forge] of [[12, 6], [18, 6], [12, 12], [18, 12]]) {
    const s = initialPuzzleSnapshot('irrigation');
    s.values.warmth = warmth; s.values.flow = 12; s.values.forge = forge;
    assert.equal(evaluatePuzzle('irrigation', s).solved, true);
  }
  // Lighthouse supply: with both lines sharing the load, two regulator notches hold the core.
  for (const ballast of [1, 2]) {
    const s = initialPuzzleSnapshot('beacon_supply'); PUZZLES.beacon_supply.solve(s); s.values.ballast = ballast;
    assert.equal(evaluatePuzzle('beacon_supply', s).solved, true);
  }
});

test('nonpolar filament lamps work with either polarity while a directional actuator does not', () => {
  const lamps = initialPuzzleSnapshot('distribution');
  lamps.switches.archive = false;
  lamps.wires = [['positive','clinicOut'], ['clinicIn','negative'], ['positive','kitchenOut'], ['kitchenIn','negative']];
  assert.equal(evaluatePuzzle('distribution', lamps).solved, true);
  const actuator = initialPuzzleSnapshot('gate');
  assert.equal(evaluatePuzzle('gate', actuator).solved, false);
});

test('restoring snapshots rejects nonexistent terminals and clamps corrupted settings', () => {
  const s = initialPuzzleSnapshot('irrigation');
  s.values.warmth = 999; s.values.flow = -10; s.wires.push(['missing','positive']); s.wires.push([...s.wires[0]].reverse());
  s.meter = { mode: 'teleport', a: 'missing', b: 'positive' };
  const repaired = normalizePuzzleSnapshot('irrigation', s);
  assert.equal(repaired.values.warmth, 24); assert.equal(repaired.values.flow, 0);
  assert.equal(repaired.wires.length, 9); assert.equal(repaired.meter.mode, 'voltage'); assert.equal(repaired.meter.a, null);
});

test('saved completed state never bypasses electrical validation', () => {
  const s = initialPuzzleSnapshot('beacon_lens'); s.completed = true;
  assert.equal(evaluatePuzzle('beacon_lens', s).solved, false);
});

test('commissioning only commits a currently operating network and never repeats a solved callback', () => {
  const originalDocument = globalThis.document;
  globalThis.document = { removeEventListener() {} };
  try {
    for (const condition of ['working', 'broken-after-working', 'already-commissioned', 'replace-open-panel']) {
      const state = initialPuzzleSnapshot('awaken');
      solutions.awaken(state);
      const events = [];
      const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), {
        active: true, id: 'awaken', state, puzzle: { lesson: 'Closed circuit' },
        callbacks: { onSolve: () => events.push('solve'), onChange: () => events.push('save'), onClose: () => events.push('close') },
        shell: { remove() {} }, previousFocus: null,
      });
      bench.evaluate();
      assert.equal(events.length, 0, 'stable readings alone must not commission');
      if (condition === 'broken-after-working') state.wires.pop();
      if (condition === 'already-commissioned') state.completed = true;
      // Leaving never commissions; only the explicit decision does.
      if (condition === 'working') { bench.close(true); assert.equal(state.completed, false, 'leaving must not put the installation into service'); events.length = 0; bench.active = true; bench.shell = { remove() {} }; }
      bench.close(condition !== 'replace-open-panel', { commission: true });
      assert.deepEqual(events, condition === 'working' ? ['solve', 'save', 'close'] : condition === 'replace-open-panel' ? [] : ['close']);
      if (condition === 'working') assert.equal(state.completed, true);
      bench.close();
      assert.equal(events.filter(e => e === 'solve').length, condition === 'working' ? 1 : 0);
    }
  } finally { globalThis.document = originalDocument; }
});

test('physical observations distinguish direction, faint operation and a successful repair', () => {
  const gate = initialPuzzleSnapshot('gate');
  assert.match(observePuzzle('gate', gate)[0].text, /hacia atrás/);
  solutions.gate(gate);
  assert.match(observePuzzle('gate', gate)[0].text, /deja libre el paso/);
  const pump = initialPuzzleSnapshot('pump');
  assert.match(observePuzzle('pump', pump)[0].text, /apenas/);
  solutions.pump(pump);
  assert.match(observePuzzle('pump', pump)[0].text, /sale pareja/);
  assert.equal(BENCH_GUIDANCE.awaken.tools.length, 0);
  assert.deepEqual(BENCH_GUIDANCE.workshop.tools, ['continuity']);
});

test('observations describe real operation for alternative valid repairs and distinguish overheating', () => {
  const state = initialPuzzleSnapshot('distribution');
  state.switches.archive = false;
  state.wires = [['positive','clinicOut'], ['clinicIn','negative'], ['positive','kitchenOut'], ['kitchenIn','negative']];
  assert.ok(observePuzzle('distribution', state).every(o => /clara y pareja/.test(o.text)));
  const supply = initialPuzzleSnapshot('beacon_supply');
  supply.values.ballast = 0;
  assert.ok(observePuzzle('beacon_supply', supply).some(o => /cobre.*calentando/.test(o.text)));
  PUZZLES.beacon_supply.solve(supply);
  assert.ok(observePuzzle('beacon_supply', supply).every(o => !/calentando/.test(o.text)), 'two lines share the load and neither overheats');
});

test('a novice can observe a safe failure without receiving an unexplained numeric diagnosis', () => {
  const state = initialPuzzleSnapshot('awaken');
  state.wires.push(['positive','negative']);
  const observation = observePuzzle('awaken', state).map(o => o.text).join(' ');
  assert.match(observation, /Nada se rompió/);
  assert.doesNotMatch(observation, /\d|amper|volt|resisten/i);
  state.sourceOn = false;
  assert.match(observePuzzle('awaken', state)[0].text, /apagada/);
});

test('plain continuity reads the actual connected network and numbers are explicitly optional', () => {
  const state = initialPuzzleSnapshot('workshop');
  state.sourceOn = false;
  state.meter = { mode: 'continuity', a: 's2a', b: 's2b', branch: null };
  const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), { id: 'workshop', puzzle: PUZZLES.workshop, state, result: evaluatePuzzle('workshop', state), mode: 'continuity', showNumbers: false });
  assert.equal(bench.presentedReading().value, 'Sin camino');
  solutions.workshop(state);
  bench.result = evaluatePuzzle('workshop', state);
  assert.equal(bench.presentedReading().value, 'Hay camino');
  assert.equal(bench.presentedReading().unit, '');
  bench.showNumbers = true;
  assert.equal(bench.presentedReading().unit, 'Ω');
  bench.showNumbers = false;
  state.sourceOn = true;
  assert.equal(bench.presentedReading().value, 'Primero, apagá');
});

test('comparison requires two valid points and preserves polarity without mandatory numbers', () => {
  const state = initialPuzzleSnapshot('gate');
  const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), { id: 'gate', puzzle: PUZZLES.gate, state, result: evaluatePuzzle('gate', state), mode: 'voltage', showNumbers: false });
  assert.equal(bench.presentedReading().value, 'Apoyá las puntas');
  state.meter.a = 'latchIn';
  assert.equal(bench.presentedReading().value, 'Una punta más');
  state.meter.b = 'latchOut';
  assert.equal(bench.presentedReading().value, 'Al revés');
  bench.showNumbers = true;
  assert.ok(bench.presentedReading().value.startsWith('-'));
  assert.equal(bench.presentedReading().unit, 'V');
});

test('an installation put in service before its bench was redesigned stays in service', () => {
  const old = { ...initialPuzzleSnapshot('workshop'), wires: [['positive', 'spliceA'], ['spliceA', 'spliceB'], ['spliceB', 'lampIn'], ['lampOut', 'negative']], completed: true };
  const restored = normalizePuzzleSnapshot('workshop', old);
  assert.equal(restored.completed, true);
  assert.equal(evaluatePuzzle('workshop', restored).commissionable, true);
  const unfinished = normalizePuzzleSnapshot('workshop', { ...old, completed: false });
  assert.equal(unfinished.completed, false, 'an unfinished old bench simply starts over');
});
