// The cable car (Hito B, B3 «Introducción», D21): beyond the street's gate, a platform along an
// avenue and a car that runs between two stops at constant speed. What stands on it is carried:
// its position relative to the car does not change while its position relative to the ground does.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, AVATAR } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y, CALLE, AVENIDA, CARRO, MIRADOR_Y } from '../src/sim/levels/cascada.js';

const run = (w, seconds, input = {}) => { const n = Math.round(seconds / DT); for (let i = 0; i < n; i++) { Object.assign(w.input, input); w.step(); } };
const press = w => { w.input.act = true; w.step(); w.input.act = false; };
const car = w => w.carriers[0];
/** A world with the arch and the gate open (setup), the explorer placed at (x, z) on the floor. */
function at(x, z, { gate = true } = {}) {
  const w = new World(CASCADA);
  w.citySeen = true; const d = w.doors[0]; d.open = true; d.openT = d.swing;
  if (gate) { const g = w.gates[0]; g.open = true; g.openT = g.swing; }
  const a = w.avatar; a.x = a.px = x; a.z = a.pz = z; a.y = a.py = TERRACE_Y + a.hh; a.vx = a.vy = a.vz = 0;
  run(w, 0.2, { x: 0, y: 0 });
  return w;
}

test('the street is behind a gate: closed, the square ends there; E opens it and ▲ walks through', () => {
  const w = at((CALLE.x0 + CALLE.x1) / 2, -20, { gate: false }), a = w.avatar;
  run(w, 3, { x: 0, y: 1 });
  assert.ok(a.z >= CALLE.z1 + AVATAR.hw - 1e-9, `stopped at the gate (z ${a.z.toFixed(2)})`);
  const it = w.interactables()[0];
  assert.equal(it?.kind, 'gate'); assert.equal(it.verb, 'Abrir la reja');
  press(w); run(w, 0.5, { y: 1 });
  assert.ok(a.z >= CALLE.z1 + AVATAR.hw - 1e-9, 'not while it swings');
  run(w, 1.2, { y: 0 }); assert.ok(w.gates[0].open);
  run(w, 6, { y: 1 });
  assert.ok(a.z < CALLE.z0 + 0.5, `down the street to the avenue (z ${a.z.toFixed(2)})`);
  assert.equal(a.support?.solid?.id, 'anden');
});

test('the car waits at a stop, then runs at constant speed and stops exactly at the other stop', () => {
  const w = at(11, -37), k = car(w);
  assert.equal(k.x, CARRO.stops[0]);
  run(w, CARRO.dwell - 0.3); assert.equal(k.x, CARRO.stops[0], 'waiting'); // (0.2 s went by in the setup)
  // sample every 0.5 s while it runs: equal distances in equal times
  run(w, 0.3 + CARRO.ramp + 0.2);
  const xs = []; for (let i = 0; i < 12; i++) { xs.push(k.x); run(w, 0.5); }
  const steps = xs.slice(1).map((x, i) => x - xs[i]);
  for (const s of steps) assert.ok(Math.abs(s - CARRO.speed * 0.5) < 1e-9, `0.75 m every 0.5 s (got ${s})`);
  run(w, 4); // (it arrives at 16.4 s and waits there until 22.4 s)
  assert.equal(k.x, CARRO.stops[1], 'at the other stop');
  assert.equal(k.phase, 'parada');
});

test('standing on the deck, the explorer is carried: the ground moves past, the car does not', () => {
  const w = at(CARRO.stops[0], -41.4), k = car(w), a = w.avatar;
  assert.equal(a.support?.solid?.id, 'carro', 'on the deck');
  const rel0 = a.x - k.x, x0 = a.x;
  run(w, CARRO.dwell + Math.abs(CARRO.stops[1] - CARRO.stops[0]) / CARRO.speed + CARRO.ramp + 0.5, { x: 0, y: 0 });
  assert.equal(k.x, CARRO.stops[1]);
  assert.ok(Math.abs(a.x - k.x - rel0) < 1e-9, `the same place on the car (${(a.x - k.x).toFixed(3)} vs ${rel0.toFixed(3)})`);
  assert.ok(Math.abs(a.x - x0 - (CARRO.stops[1] - CARRO.stops[0])) < 1e-9, 'and 14.8 m along the avenue');
  assert.ok(Math.abs(a.y - a.hh - TERRACE_Y) < 0.01, 'still standing on it');
});

test('boarding with ▲ while the car waits, and stepping off with ▼ at the other stop', () => {
  const w = at(CARRO.stops[0], -38.5), a = w.avatar, k = car(w);
  run(w, 1.5, { x: 0, y: 1 });
  assert.equal(a.support?.solid?.id, 'carro', `boarded (z ${a.z.toFixed(2)})`);
  run(w, 0.2, { y: 0 });
  run(w, CARRO.dwell + 12, { x: 0, y: 0 });
  assert.equal(k.x, CARRO.stops[1]); assert.equal(a.support?.solid?.id, 'carro');
  run(w, 1.5, { y: -1 });
  assert.equal(a.support?.solid?.id, 'anden', 'off at the other stop');
  assert.ok(Math.abs(a.x - CARRO.stops[1]) < 1.9, `beside the stop (x ${a.x.toFixed(2)})`);
});

test('the track is not walkable where the car is not', () => {
  const w = at(10, -38.5), a = w.avatar; // the car waits at x 2.6; x 10 is open track
  run(w, 2, { x: 0, y: 1 });
  assert.ok(a.z >= AVENIDA.andenZ0 - AVATAR.hw - 1e-9, `stopped at the platform's edge (z ${a.z.toFixed(2)})`);
  assert.equal(a.support?.solid?.id, 'anden');
});

test('determinism: the same inputs on and off the car give the same state', () => {
  const go = () => { const w = at(CARRO.stops[0] + 0.5, -38.5); run(w, 1.4, { y: 1, x: 0 }); run(w, 9, { y: 0, x: 0.3 }); run(w, 4, { x: -1 }); const a = w.avatar; return [a.x, a.y, a.z, a.vx, w.carriers[0].x]; };
  assert.deepEqual(go(), go());
});

test('in the street, over the Pozo\'s x, the Pozo\'s chain is not offered (it hangs on the 2.5D path)', async () => {
  const { WELL } = await import('../src/sim/levels/cascada.js');
  const w = at(11.05, -28), a = w.avatar;
  for (const x of [WELL.x0 - 0.5, WELL.x0 - 0.2, 11.05]) {
    a.x = a.px = x; run(w, 0.2, { x: 0, y: 0 });
    assert.ok(!w.interactables().some(i => i.kind.startsWith('chain')), `no chain at (${x.toFixed(2)}, ${a.z.toFixed(1)})`);
  }
});

test('on the car the way off is named while it waits, not while it runs', () => {
  const w = at(CARRO.stops[0], -41.4), k = car(w);
  run(w, 0.3, { x: 0, y: 0 });
  assert.equal(w.interactables()[0]?.verb, 'Registrar el viaje', 'first, the recorder can be set');
  press(w); // set it
  assert.equal(w.interactables()[0]?.verb, 'Bajar del carro');
  run(w, CARRO.dwell + 1.5);
  assert.equal(k.phase, 'marcha'); assert.ok(!w.interactables().some(i => i.kind === 'back'));
});

test('walking against either end of the deck while the car runs, both ways, the explorer stays aboard', () => {
  for (const leg of [0, 1]) for (const key of [-1, 1]) {
    const w = at(CARRO.stops[0], -41.4), a = w.avatar, k = car(w);
    if (leg) { run(w, CARRO.dwell + 11, { x: 0, y: 0 }); assert.equal(k.x, CARRO.stops[1]); } // the westward leg
    run(w, CARRO.dwell + 1.0 - (leg ? 0.3 : 0.2), { x: 0, y: 0 });
    assert.notEqual(k.phase, 'parada', 'running');
    run(w, 3, { x: key, y: 0 });
    assert.equal(a.support?.solid?.id, 'carro', `leg ${leg}, ${key < 0 ? '◀' : '▶'}: still on the car (on ${a.support?.solid?.id}, x ${a.x.toFixed(2)}, car ${k.x.toFixed(2)})`);
    assert.ok(Math.abs(a.x - k.x) <= CARRO.len / 2, 'within its deck');
  }
});

test('a sphere resting on the deck travels with it: the same place on the car, 15 m along the avenue', () => {
  const w = at(CARRO.stops[0] - 1.5, -38.5), k = car(w);
  const s = w.bodies.find(b => b.kind === 'sphere' && b.heldBy?.type === 'shelf');
  s.heldBy = null; s.x = s.px = k.x + 0.8; s.y = s.py = TERRACE_Y + s.r + 0.01; s.z = s.pz = -41.4; s.vx = s.vy = 0;
  run(w, 0.5);
  assert.equal(s.support?.solid?.id, 'carro', 'resting on the deck');
  const rel = s.x - k.x;
  run(w, CARRO.dwell + 11);
  assert.equal(k.x, CARRO.stops[1]);
  assert.ok(Math.abs(s.x - k.x - rel) < 0.02, `same place on the car (${(s.x - k.x).toFixed(3)} vs ${rel.toFixed(3)})`);
});

test('stepping off the running car, the explorer keeps the car\'s speed (then slows on the platform)', () => {
  const w = at(CARRO.stops[0], -41.4), a = w.avatar, k = car(w);
  run(w, CARRO.dwell + 3, { x: 0, y: 0 }); assert.equal(k.phase, 'marcha');
  let vOff = null;
  for (let i = 0; i < Math.round(2 / DT) && vOff === null; i++) { w.input.y = -1; w.input.x = 0; w.step(); if (a.support?.solid?.id === 'anden') vOff = a.vx; }
  assert.ok(vOff !== null, 'off onto the platform');
  assert.ok(Math.abs(vOff - CARRO.speed) < 0.15, `ground velocity on stepping off ≈ the car's (${vOff.toFixed(2)} m/s)`);
});

test('a sphere let go from the running car falls onto the same place of the deck (in the car\'s frame it just drops)', () => {
  const w = at(CARRO.stops[0] - 0.4, -41.4), a = w.avatar, k = car(w);
  const s = w.bodies.find(b => b.kind === 'sphere' && b.heldBy?.type === 'shelf');
  s.heldBy = { type: 'hand' }; a.holding = s; s.z = s.pz = a.z;
  run(w, CARRO.dwell + 3, { x: 0, y: 0 }); assert.equal(k.phase, 'marcha');
  const rel0 = s.x - k.x;
  w.input.act = true; w.step(); w.input.act = false; // drop
  assert.ok(Math.abs(s.vx - k.v) < 0.05, `leaves at the car's speed (${s.vx.toFixed(2)})`);
  run(w, 1.0);
  assert.equal(s.support?.solid?.id, 'carro');
  assert.ok(Math.abs(s.x - k.x - rel0) < 0.06, `lands where it was let go, on the car (${(s.x - k.x - rel0).toFixed(3)} m)`);
});

test('aboard with ▲▼ released, the explorer settles with its whole body on the deck', () => {
  const w = at(CARRO.stops[0], -38.5), a = w.avatar;
  run(w, 1.2, { x: 0, y: 1 }); assert.equal(a.support?.solid?.id, 'carro');
  run(w, 2, { x: 0, y: 0 });
  assert.ok(Math.abs(a.z - (CARRO.z1 - 0.6)) < 0.05, `settled (z ${a.z.toFixed(2)})`);
  assert.ok(a.z + AVATAR.hw < CARRO.z1 - 0.1, 'not straddling the platform');
});

test('▼ from anywhere on the platform leads back to the street', () => {
  for (const x of [AVENIDA.x0 + 1, 3, 20, AVENIDA.x1 - 1]) {
    const w = at(x, -38.5), a = w.avatar;
    run(w, 14, { x: 0, y: -1 });
    assert.ok(a.z > CALLE.z0 + 2, `from x ${x}: up the street (z ${a.z.toFixed(2)})`);
  }
});

test('R off every walkable area in depth brings the explorer back to where it last stood', () => {
  const w = at(10, -38.5), a = w.avatar;
  a.z = a.pz = -43.5; a.y = a.py = TERRACE_Y - 0.55 + a.hh; run(w, 0.3, { x: 0, y: 0 }); // (forced onto the track's bed)
  assert.equal(a.support?.solid?.id, 'via');
  w.input.reset = true; run(w, 0.3);
  assert.equal(a.support?.solid?.id, 'anden'); assert.ok(w.inArea(a));
});
