import test from 'node:test';
import assert from 'node:assert/strict';
import { measureWorld } from '../src/world-circuits.js';
import { initialPuzzleSnapshot, evaluatePuzzle } from '../src/puzzle-model.js';

test('an unfinished loaded-divider montage has the same voltage in the field and on the bench', () => {
  const snapshot = initialPuzzleSnapshot('beacon_lens');
  snapshot.wires = [['positive','upperA'], ['lowerB','negative'], ['tap','lensIn'], ['lensOut','negative']];
  const saved = { flags: { beacon_network: true, tower_shutter: true, tower_lens_free: true }, puzzles: { beacon_lens: snapshot } };
  const bench = evaluatePuzzle('beacon_lens', snapshot);
  assert.equal(bench.solved, false);
  const field = measureWorld('lighthouse', saved, 'beacon_lens_panel');
  assert.equal(field.voltage, bench.solution.branches.lens.voltage);
  assert.equal(field.current, bench.solution.branches.lens.current);
  assert.ok(field.voltage > 5.9 && field.voltage < 6.1, 'the old field topology incorrectly supplied 18 V');
  snapshot.sourceOn = false;
  assert.equal(measureWorld('lighthouse', saved, 'beacon_lens_panel').current, 0);
  snapshot.sourceOn = true; snapshot.tripped = true;
  const tripped = measureWorld('lighthouse', saved, 'beacon_lens_panel');
  assert.equal(tripped.current, 0); assert.equal(tripped.overloaded, true);
});

test('archive isolation survives entering the panel and all saved wiring changes affect readings', () => {
  const snapshot = initialPuzzleSnapshot('distribution');
  const saved = { flags: { pump: true, castle_service: true, castle_branch_closed: false }, puzzles: { distribution: snapshot } };
  const initial = evaluatePuzzle('distribution', snapshot);
  assert.equal(initial.overloaded, false); assert.equal(snapshot.switches.archive, false);
  assert.equal(measureWorld('castle', saved, 'distribution_panel').current, initial.current);
  snapshot.wires = [['positive','clinicIn'], ['clinicOut','negative'], ['positive','kitchenIn'], ['kitchenOut','negative']];
  assert.equal(saved.flags.distribution, undefined, 'measurement cannot depend on commissioning');
  const connected = measureWorld('castle', saved, 'distribution_panel');
  near(connected.current, evaluatePuzzle('distribution', snapshot).current, 1e-9);
  assert.ok(connected.current > 1.9);
  snapshot.wires.push(['positive', 'negative']);
  const short = measureWorld('castle', saved, 'distribution_panel');
  assert.equal(short.overloaded, true); assert.equal(short.current, 0);
});

test('field cache follows physical mutations while journal and probe changes do not re-solve the montage', () => {
  const snapshot = initialPuzzleSnapshot('pump');
  const saved = { flags: { spring_sluice: true, spring_coupling: true }, puzzles: { pump: snapshot } };
  const first = measureWorld('spring', saved, 'pump_panel');
  snapshot.evidence.push({ kind: 'observation', text: 'The player looked.' });
  snapshot.meter.a = 'pumpIn';
  assert.equal(measureWorld('spring', saved, 'pump_panel'), first);
  snapshot.wires.push(['e2a', 'e2b']);
  const repaired = measureWorld('spring', saved, 'pump_panel');
  assert.notEqual(repaired, first);
  assert.equal(repaired.voltage, evaluatePuzzle('pump', snapshot).solution.branches.pump.voltage);
  assert.ok(repaired.current > first.current * 2);
  saved.flags.spring_coupling = false;
  assert.equal(measureWorld('spring', saved, 'pump_panel').current, 0);
});
import { AREAS } from '../src/content.js';

const state = flags => ({ flags, puzzles: {} });
const near = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≈ ${b}`);

test('a disconnected workshop can have source potential and a floating bench at the same time', () => {
  const s = state({});
  const source = measureWorld('workshop', s, 'workshop_feed');
  const bench = measureWorld('workshop', s, 'workbench');
  near(source.voltage, 6); near(source.current, 0);
  assert.equal(source.sourceAvailable, true);
  assert.equal(source.powered, false);
  assert.equal(bench.voltage, null);
  assert.equal(bench.floating, true);
  assert.match(bench.observation, /flotante/);
});

test('an open workshop return rises to source potential but cannot conduct', () => {
  const s = state({ workshop_feed: true });
  const back = measureWorld('workshop', s, 'workshop_return');
  near(back.voltage, 6); near(back.current, 0);
  assert.equal(back.floating, false);
  const load = measureWorld('workshop', s, 'workbench');
  near(load.voltage, 0);
  assert.equal(load.sourceVoltage, 6);
});

test('the workshop pilot has current while the broken lamp remains open', () => {
  const s = state({ workshop_feed: true, workshop_return: true });
  const bench = measureWorld('workshop', s, 'workbench');
  assert.ok(bench.voltage > 5.9);
  near(bench.current, 0);
  assert.ok(bench.sourceCurrent > .04);
  s.flags.workshop = true;
  const repaired = measureWorld('workshop', s, 'workbench');
  assert.ok(repaired.current > .24 && repaired.current < .251);
  assert.ok(repaired.sourceCurrent > repaired.current);
});

test('the road bypass trips actual supply protection only after both ends complete its short', () => {
  const s = state({ workshop: true, road_send: true, road_bypass: true });
  const incomplete = measureWorld('road', s, 'road_bypass');
  assert.equal(incomplete.overloaded, false); near(incomplete.current, 0);
  s.flags.road_return = true;
  const shorted = measureWorld('road', s, 'road_bypass');
  assert.equal(shorted.overloaded, true);
  assert.ok(shorted.requestedCurrent > 30);
  near(shorted.current, 0); near(shorted.voltage, 0);
  assert.equal(shorted.sourceVoltage, 12);
  assert.equal(shorted.sourceAvailable, true);
  assert.match(shorted.observation, /conserva 12 V/);
});

test('opening the road bypass restores the useful branch, conserving send and return current', () => {
  const s = state({ workshop: true, road_send: true, road_return: true, road_bypass: false });
  const send = measureWorld('road', s, 'road_send');
  const back = measureWorld('road', s, 'road_return');
  const panel = measureWorld('road', s, 'gate_panel');
  assert.equal(panel.overloaded, false);
  assert.ok(panel.voltage > 11.8 && panel.voltage < 12);
  near(send.current, back.current);
  near(panel.current, send.current);
  near(back.voltage, back.current * .08);
  near(measureWorld('road', s, 'road_bypass').current, 0);
});

test('water motion and generator coupling are separate prerequisites; the wet splice causes real loss', () => {
  const s = state({ spring_sluice: true, spring_coupling: false });
  const disconnected = measureWorld('spring', s, 'spring_coupling');
  assert.equal(disconnected.sourceAvailable, false);
  near(disconnected.voltage, 0); near(disconnected.current, 0);
  assert.match(disconnected.observation, /mueve la rueda.*separa su eje/);
  s.flags.spring_coupling = true;
  const corroded = measureWorld('spring', s, 'pump_panel');
  assert.ok(corroded.voltage > 4.7 && corroded.voltage < 4.9);
  assert.equal(corroded.sourceVoltage, 12);
  s.flags.pump = true;
  const repaired = measureWorld('spring', s, 'pump_panel');
  assert.ok(repaired.voltage > 11.8);
  assert.ok(repaired.current > corroded.current * 2);
});

test('the castle damaged branch can overload the source independently of the healthy trunk', () => {
  const s = state({ pump: true, castle_branch_closed: true, castle_service: false });
  const fault = measureWorld('castle', s, 'castle_isolated');
  assert.equal(fault.overloaded, true);
  assert.ok(fault.requestedCurrent > 7);
  s.flags.castle_branch_closed = false;
  const isolated = measureWorld('castle', s, 'castle_isolated');
  assert.equal(isolated.overloaded, false); near(isolated.current, 0); near(isolated.voltage, 0);
  near(measureWorld('castle', s, 'castle_service').current, 0);
  s.flags.castle_service = true;
  const healthy = measureWorld('castle', s, 'castle_service');
  assert.ok(healthy.voltage > 11.9);
  assert.ok(healthy.current > .49 && healthy.current < .5);
});

test('commissioned castle services draw the sum of independent parallel branch currents', () => {
  const s = state({ pump: true, distribution: true });
  const trunk = measureWorld('castle', s, 'castle_service');
  assert.equal(trunk.overloaded, false);
  near(trunk.current, trunk.voltage / 12 + trunk.voltage / 12);
  assert.ok(trunk.current > 1.9);
  near(measureWorld('castle', s, 'castle_isolated').current, 0);
});

test('moderating the forge reduces a computed overload; a water gate does not fake an electrical switch', () => {
  const s = state({ distribution: true });
  const high = measureWorld('terraces', s, 'forge_limited');
  assert.equal(high.overloaded, true);
  assert.ok(high.requestedCurrent > high.protectionLimit);
  s.flags.forge_limited = true;
  const moderate = measureWorld('terraces', s, 'forge_limited');
  assert.equal(moderate.overloaded, false);
  assert.ok(moderate.current > .7 && moderate.current < .76);
  const closedWater = measureWorld('terraces', s, 'irrigation_open');
  assert.equal(closedWater.mechanicalReady, false);
  assert.match(closedWater.observation, /canal está cerrado/);
  s.flags.irrigation_open = true;
  const openWater = measureWorld('terraces', s, 'irrigation_open');
  assert.equal(openWater.mechanicalReady, true);
  near(openWater.voltage, closedWater.voltage); near(openWater.current, closedWater.current);
});

test('saved invernadero resistance changes the actual field measurement under load', () => {
  const s = state({ distribution: true, forge_limited: true, irrigation_open: true });
  const before = measureWorld('terraces', s, 'irrigation_panel');
  s.puzzles.irrigation = { values: { flow: 12, warmth: 12 } };
  const after = measureWorld('terraces', s, 'irrigation_panel');
  assert.ok(after.current < before.current);
  assert.ok(after.voltage > 10.6 && after.voltage < 10.9);
});

test('distant open return can have 24 V with zero current; closing it allows real line losses', () => {
  const s = state({ irrigation: true, lake_cable: true });
  const open = measureWorld('lake', s, 'lake_return');
  near(open.voltage, 24); near(open.current, 0);
  assert.equal(open.powered, false);
  s.flags.lake_return = true;
  const back = measureWorld('lake', s, 'lake_return');
  const send = measureWorld('lake', s, 'lake_cable');
  near(back.current, 24 / (120 + 1.2 + 1.2 + .08 + .08 + .04));
  near(send.current, back.current);
  near(back.voltage, back.current * .08);
  assert.equal(back.powered, true);
});

test('the first Faro stage needs both exterior connections and includes regulator/tended losses', () => {
  const s = state({ beacon_link: true, tower_feed: true });
  const open = measureWorld('lighthouse', s, 'beacon_supply_panel');
  near(open.voltage, 0); near(open.current, 0);
  s.flags.tower_return = true;
  const unregulated = measureWorld('lighthouse', s, 'beacon_supply_panel');
  assert.ok(unregulated.voltage > 13.4 && unregulated.voltage < 13.8, 'one line and the regulator leave the core weak');
  s.puzzles.beacon_supply = { values: { ballast: 0 } };
  assert.ok(measureWorld('lighthouse', s, 'beacon_supply_panel').voltage < 16.2, 'with a single line, not even an open regulator is enough');
  s.flags.beacon_supply = true; s.puzzles.beacon_supply = { values: { ballast: 1 } };
  const calibrated = measureWorld('lighthouse', s, 'beacon_supply_panel');
  assert.ok(calibrated.voltage > 16.2 && calibrated.voltage < 18.2);
  near(calibrated.voltage, calibrated.current * 12);
});

test('Faro maintenance bridge trips the source, while the motor clutch changes only mechanical availability', () => {
  const s = state({ beacon_supply: true });
  assert.equal(measureWorld('lighthouse', s, 'tower_isolated').overloaded, true);
  s.flags.tower_isolated = true;
  const uncoupled = measureWorld('lighthouse', s, 'tower_motor');
  assert.equal(uncoupled.overloaded, false);
  assert.equal(uncoupled.mechanicalReady, false);
  assert.ok(uncoupled.current > 0);
  s.flags.tower_motor = true;
  const coupled = measureWorld('lighthouse', s, 'tower_motor');
  assert.equal(coupled.mechanicalReady, true);
  near(coupled.voltage, uncoupled.voltage); near(coupled.current, uncoupled.current);
  s.flags.beacon_network = true;
  assert.ok(measureWorld('lighthouse', s, 'tower_motor').voltage > 17.8);
});

test('the optical shutter and brake never create voltage; final loaded-divider calibration does', () => {
  const s = state({ beacon_network: true });
  const closed = measureWorld('lighthouse', s, 'beacon_lens_panel');
  assert.equal(closed.mechanicalReady, false);
  assert.ok(closed.voltage > 17.9);
  s.flags.tower_shutter = true; s.flags.tower_lens_free = true;
  const open = measureWorld('lighthouse', s, 'beacon_lens_panel');
  near(open.voltage, closed.voltage); near(open.current, closed.current);
  assert.equal(open.mechanicalReady, true);
  s.flags.beacon_lens = true;
  const stable = measureWorld('lighthouse', s, 'beacon_lens_panel');
  assert.ok(stable.voltage > 8.9 && stable.voltage < 9.1);
  near(stable.current, stable.voltage / 24);
});

test('every world electrical/mechanical lever and panel after the Portal has a measurement anchor', () => {
  const supported = ['workshop','road','spring','castle','terraces','lake','lighthouse'];
  for (const id of supported) {
    for (const object of AREAS[id].objects.filter(o => ['lever','panel','beacon'].includes(o.kind))) {
      const result = measureWorld(id, state({}), object.id);
      assert.ok(result, `${id}/${object.id} needs a probe anchor`);
      assert.ok(result.reference.length > 40);
      assert.ok(result.observation.length > 40);
      assert.ok(Number.isFinite(result.current));
      assert.ok(result.voltage === null || Number.isFinite(result.voltage));
    }
  }
});

test('unknown scenery returns no invented reading, and measurement never mutates state', () => {
  const s = Object.freeze({ flags: Object.freeze({ workshop: true, road_send: true, road_return: true, road_bypass: true }), puzzles: Object.freeze({}) });
  assert.equal(measureWorld('plaza', s, 'statue'), null);
  assert.equal(measureWorld('road', s, 'edda_road'), null);
  assert.equal(measureWorld('missing', s, 'anything'), null);
  assert.doesNotThrow(() => measureWorld('road', s, 'gate_panel'));
  assert.equal(s.flags.road_bypass, true);
});
