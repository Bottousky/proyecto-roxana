import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIET_MOUNT, quietMountHeight, quietMountState, quietMountKeepsClear } from '../src/quiet-mount.js';
import { KINGDOM, EXTERIORS, passageGeometry, WATERCOURSE } from '../src/kingdom-geography.js';
import { AREAS, resolveDialogue, DIALOGUES, JOURNAL, journalText } from '../src/content.js';
import { PUZZLES, initialPuzzleSnapshot } from '../src/puzzle-model.js';
import { CINEMATIC_DEFINITIONS } from '../src/cinematics.js';

const M = QUIET_MOUNT;
const inside = (id, [x, z], pad = 0) => { const [w, d] = AREAS[id].bounds; return Math.abs(x - KINGDOM[id].x) <= w / 2 + pad && Math.abs(z - KINGDOM[id].z) <= d / 2 + pad; };
const terraces = forge => { const s = initialPuzzleSnapshot('irrigation'); PUZZLES.irrigation.solve(s); s.values.forge = forge; s.sourceOn = true; return s; };

test('the Monte Quieto stands west of the Manantial and never on a place, a road or the river', () => {
  assert.ok(M.peak[0] < KINGDOM.spring.x - 40, 'the peak is well west of the Manantial');
  for (const id of EXTERIORS) for (let dx = -.5; dx <= .5; dx += .25) for (let dz = -.5; dz <= .5; dz += .25) {
    const [w, d] = AREAS[id].bounds, p = [KINGDOM[id].x + dx * w, KINGDOM[id].z + dz * d];
    assert.equal(quietMountHeight(...p), 0, `${id} stays on the valley floor at ${p}`);
  }
  for (let i = 1; i < EXTERIORS.length; i++) for (const route of passageGeometry(EXTERIORS[i - 1], EXTERIORS[i])?.routes ?? []) for (const p of route.points) assert.equal(quietMountHeight(...p), 0, `road at ${p}`);
  for (const p of WATERCOURSE) assert.equal(quietMountHeight(...p), 0, `river at ${p}`);
});

test('the reservoir is held by its banks, the dam by rock, and the gorge and house sit on the valley floor', () => {
  const r = M.reservoir, d = M.dam, upstream = d.x - d.thickness / 2;
  let bank = Infinity;
  for (let x = r.x0; x <= upstream - 1; x += .5) bank = Math.min(bank, quietMountHeight(x, r.z0), quietMountHeight(x, r.z1));
  for (let z = r.z0; z <= r.z1; z += .5) bank = Math.min(bank, quietMountHeight(r.x0, z));
  assert.ok(bank > r.high + .5, `lowest bank ${bank.toFixed(2)} m, water ${r.high} m`);
  for (const z of [d.z0 - .5, d.z1 + .5]) assert.ok(quietMountHeight(d.x - 1.5, z) > d.height, `the dam meets rock at z ${z}`);
  assert.ok(quietMountHeight(M.basin.x, M.basin.z) < r.low, 'the basin floor lies under even the low water');
  assert.equal(quietMountHeight(M.powerhouse.x, M.powerhouse.z), 0);
  for (let x = d.x + 1.5; x < M.gorge.x1; x += 1) assert.equal(quietMountHeight(x, M.gorge.z), 0, `gorge floor at x ${x}`);
  assert.deepEqual(M.tailrace.at(-1), [-5.25, -107.6], "the old canal ends at the Manantial's source rock");
});

test('the designed mountain never needs to hide a walkable point: its peak is far from every camera ray', () => {
  // The relief bake also caps every point under the gameplay camera's rays; here, the shape alone
  // already keeps its high ground south-west of the places' sightlines.
  const lens = Math.hypot(13.5, 25) * 2 * 1.3, pitch = 26 * Math.PI / 180, up = 1.5 + Math.sin(pitch) * lens, back = Math.cos(pitch) * lens - 5.5;
  for (const id of ['spring', 'castle']) {
    const [w, d] = AREAS[id].bounds;
    for (let x = -w / 2; x <= w / 2; x += 2) for (let z = -d / 2; z <= d / 2; z += 2) {
      const X = KINGDOM[id].x + x, Z = KINGDOM[id].z + z;
      for (let s = 2; s < back; s += 2) { const ray = 1 + (up - 1) * s / back, h = quietMountHeight(X, Z + s); assert.ok(h < ray + 9, `${id} (${X}, ${Z}): ${h.toFixed(1)} m against ${ray.toFixed(1)} m`); }
    }
  }
});

test('the Casa de Compuertas answers the kingdom: canal, weeping gate, reservoir and lamp', () => {
  assert.deepEqual(quietMountState({ flags: {} }), { flowing: false, weeping: false, reservoir: 'high', lamp: 'off', agreement: null });
  assert.equal(quietMountState({ flags: { spring_sluice: true } }).flowing, true);
  assert.equal(quietMountState({ flags: { pump: true } }).weeping, true);
  const forja = quietMountState({ flags: { irrigation: true, beacon_lens: true }, puzzles: { irrigation: terraces(6) } });
  const riego = quietMountState({ flags: { irrigation: true, beacon_lens: true }, puzzles: { irrigation: terraces(12) } });
  assert.deepEqual([forja.agreement, forja.reservoir, forja.lamp], ['forja', 'high', 'steady']);
  assert.deepEqual([riego.agreement, riego.reservoir, riego.lamp], ['riego', 'low', 'flicker']);
  assert.equal(quietMountState({ flags: { irrigation: true }, puzzles: { irrigation: terraces(12) } }).lamp, 'off', 'no light before the Faro');
});

test('nothing grows in the reservoir or on the works', () => {
  assert.equal(quietMountKeepsClear(M.basin.x, M.basin.z, M.basin.floor), true);
  assert.equal(quietMountKeepsClear(M.dam.x, (M.dam.z0 + M.dam.z1) / 2), true);
  assert.equal(quietMountKeepsClear(M.powerhouse.x, M.powerhouse.z), true);
  assert.equal(quietMountKeepsClear(-7.8, -96.6), true, 'the old canal');
  assert.equal(quietMountKeepsClear(M.peak[0], M.peak[1], 30), false, 'the mountainside does grow');
});

test('Vega names it, the finale answers with the reservoir, the Bitácora keeps the open question', () => {
  assert.ok(DIALOGUES.pump_complete.some(l => l.speaker === 'vega' && /Monte Quieto/.test(l.text) && /Casa de Compuertas/.test(l.text)));
  const said = forge => resolveDialogue('beacon_lens_complete', { flags: { irrigation: true, beacon_lens: true }, puzzles: { irrigation: terraces(forge) } }).map(l => l.text).join(' ');
  assert.match(said(6), /Se sostiene/); assert.doesNotMatch(said(6), /Parpadea/);
  assert.match(said(12), /Parpadea/); assert.match(said(12), /Terrazas se llevaron el agua/);
  const lines = resolveDialogue('beacon_lens_complete', { flags: { beacon_lens: true } });
  assert.ok(lines.findIndex(l => /Casa de Compuertas/.test(l.text)) > lines.findIndex(l => /Coincidencia registrada/.test(l.text)), 'it comes after the bell is answered');
  const page = JOURNAL.find(e => e.id === 'quiet_mount');
  assert.deepEqual(page.requires, ['beacon_lens']); assert.equal(page.experiment, true);
  assert.match(journalText(page, { flags: { irrigation: true }, puzzles: { irrigation: terraces(12) } }), /Parpadea/);
  const finale = CINEMATIC_DEFINITIONS.beacon_lens;
  assert.ok(finale.captions.some(c => /Monte Quieto/.test(c.text) && c.at < finale.returnAt));
});
