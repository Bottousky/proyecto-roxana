// Minijuegos del Manantial (ciclo 29): un concepto por vez, de un vecino, antes de la bomba.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, evaluatePuzzle } from '../src/puzzle-model.js';
import { AREAS, SIDE_BENCHES, getObjective } from '../src/content.js';
import { wordsKnown } from '../src/understanding.js';
import { hasRequirements } from '../src/state.js';

const source = (await readFile(new URL('../src/puzzles.js', import.meta.url), 'utf8'))
  .replace("import './puzzles.css';", '')
  .replace(/'\.\/(electrical|puzzle-model|bench-evidence|bench-diagnosis|understanding)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/${name}.js`)).href));
const { PuzzleWorkbench } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
function controller(id) {
  const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), { id, puzzle: PUZZLES[id], state: initialPuzzleSnapshot(id), history: [], selected: null, mode: 'wire', showNumbers: false, active: true,
    render() {}, shell: { remove() {} }, callbacks: {} });
  bench.evaluate(false);
  const click = dataset => bench.handleClick({ target: { closest: () => ({ dataset, tagName: 'button' }) } });
  const probe = (a, b) => { click({ action: 'mode', mode: 'voltage' }); bench.touchPort(a); bench.touchPort(b); click({ action: 'mode', mode: 'wire' }); };
  return { bench, click, probe };
}
const MINIS = Object.keys(PUZZLES).filter(id => PUZZLES[id].mini);

test('three minijuegos, each one small enough for a phone: two to four pieces and at most one cable', () => {
  assert.deepEqual(MINIS.sort(), ['edda_contact', 'marin_cart', 'tala_lantern']);
  for (const id of MINIS) {
    const p = PUZZLES[id];
    assert.ok(p.components.length >= 2 && p.components.length <= 4, `${id}: ${p.components.length} pieces`);
    assert.ok((p.cables ?? 0) <= 1, `${id}: at most one cable in hand`);
    assert.ok(SIDE_BENCHES[id]?.mini, `${id}: its neighbour's request and answer`);
  }
  assert.equal(PUZZLES.tala_lantern.optional, undefined, "Tala's is on the main road");
  assert.equal(PUZZLES.marin_cart.optional, true); assert.equal(PUZZLES.edda_contact.optional, true);
});

test("Tala's lantern: the push across the lantern and across the cord, each seen once, and nothing else counts", () => {
  const { bench, probe } = controller('tala_lantern');
  probe('positive', 'negative');
  assert.deepEqual(bench.state.proofs, {}, 'the pile itself is not what Tala asked');
  probe('lampIn', 'lampOut');
  assert.equal(bench.state.proofs.lanternForce, true, 'almost the whole push across the lantern');
  assert.equal(bench.result.solved, false, 'one reading is not the answer');
  probe('cordB', 'cordA');
  assert.equal(bench.state.proofs.cordForce, true, 'almost nothing across the cord, measured either way round');
  assert.equal(bench.result.solved, true);
  assert.equal(bench.result.commissionable, true);
  assert.deepEqual(normalizePuzzleSnapshot('tala_lantern', bench.state).proofs, { lanternForce: true, cordForce: true }, 'the readings survive a reload');
});

test("Tala's numbers: the cord keeps almost nothing and the lantern almost all of the pile's push", () => {
  const s = initialPuzzleSnapshot('tala_lantern'), r = evaluatePuzzle('tala_lantern', s);
  const cord = Math.abs(r.solution.branches.cord.voltage), lantern = Math.abs(r.solution.branches.lantern.voltage);
  assert.ok(cord < .3 && lantern > 5, `cord ${cord} V, lantern ${lantern} V`);
});

test("Marín's cart: the two lanterns add up to the battery, and the one that brakes more keeps more", () => {
  const { bench, probe } = controller('marin_cart');
  probe('frontIn', 'frontOut');
  assert.equal(bench.result.solved, false, 'one lantern is half the sum');
  probe('rearIn', 'rearOut');
  assert.equal(bench.state.tally.closed, true);
  assert.equal(bench.result.commissionable, true);
  const { front, rear } = bench.state.tally.readings;
  assert.ok(Math.abs(rear - 2 * front) < .05, `the rear one keeps twice the front (${front} V, ${rear} V)`);
});

test("Edda's beacon: the contact keeps half the push; seen before the bridge, then the beacon shines", () => {
  const { bench, probe } = controller('edda_contact');
  assert.equal(bench.result.operating.beacon, false, 'the beacon shines at half');
  bench.touchPort('postA'); bench.touchPort('postB');
  assert.equal(bench.result.operating.beacon, true, 'the bridge gives the beacon its push');
  assert.equal(bench.result.commissionable, false, 'Edda has not seen where the push stayed');
  bench.handleClick({ target: { closest: () => ({ dataset: { wire: String(bench.state.wires.findIndex(w => w.includes('postA') && w.includes('postB'))) }, tagName: 'button' }) } });
  probe('postA', 'postB');
  assert.equal(bench.state.proofs.foundRobber, true);
  bench.touchPort('postA'); bench.touchPort('postB');
  assert.equal(bench.result.commissionable, true);
});

test("the pump's box waits for Tala's answer, and says so; the objective takes the player to her", () => {
  const panel = AREAS.spring.objects.find(o => o.id === 'pump_panel');
  assert.deepEqual(panel.requires, ['spring_drive', 'tala_lantern']);
  assert.equal(panel.lockedBy.tala_lantern, 'pump_locked_tala');
  const before = { awaken: true, workshop: true, bridge_ready: true, gate: true, spring_drive: true };
  assert.equal(hasRequirements({ flags: before }, panel.requires), false);
  assert.equal(getObjective({ flags: before }).object, 'tala_spring');
  assert.equal(getObjective({ flags: { ...before, tala_lantern: true } }).object, 'pump_panel');
  assert.equal(getObjective({ flags: { ...before, tala_lantern: true, pump: true } }).object, 'distribution_panel', 'the optional ones never block the road');
});

test("the word «tensión» is earned at Tala's lantern, before the pump", () => {
  assert.ok(wordsKnown({ flags: { tala_lantern: true } }).includes('tension'));
  assert.ok(!wordsKnown({ flags: { tala_lantern: true } }).includes('caida'), "the drop is the pump's");
});

test('the golden arrow points at what is still missing: a person who joins, a lever left wrong, then the bench (ciclo 30)', async () => {
  const { guideTarget } = await import('../src/kingdom-geography.js');
  const at = (area, flags) => { const st = { area, flags }, t = guideTarget(st, getObjective(st)); return AREAS[area].objects.find(o => o.x === t.x && o.z === t.z)?.id; };
  assert.equal(at('workshop', { awaken: true }), 'lumen', 'Lumen joins the left closure after talking');
  assert.equal(at('workshop', { awaken: true, workshop_feed: true }), 'workshop_return');
  const road = { awaken: true, workshop: true };
  assert.equal(at('road', { ...road, road_bypass: true }), 'road_bypass', 'the short first');
  assert.equal(at('road', { ...road, road_bypass: false }), 'road_send');
  assert.equal(at('road', { ...road, road_bypass: false, road_send: true }), 'road_return');
  const tower = { ...road, bridge_ready: true, gate: true, tala_lantern: true, pump: true, distribution: true, irrigation: true, beacon_link: true };
  assert.equal(at('lighthouse', tower), 'nereo_tower', 'Nereo joins the base after talking');
});
