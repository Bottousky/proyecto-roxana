// The jalón and the neighbour's errand (Hito B, B3 «Introducción», D23): a zero the player chooses
// (positions change with it, displacements do not; on the car it measures like the car's tape), and
// a task that needs a prediction: where to stand on the car so the last chalk falls at her jalón.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y, CARRO, JALONES, ENCARGO } from '../src/sim/levels/cascada.js';

const el = () => ({ hidden: false, innerHTML: '', className: '', append() {}, querySelector: () => ({}) });
globalThis.document = { createElement: el };
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
const { Journal } = await import('../src/journal.js');

const feed = (w, j) => { for (const e of w.drainEvents()) j.onEvent(e); j.update(DT); };
const run = (w, j, s, input = {}) => { for (let i = 0; i < Math.round(s / DT); i++) { Object.assign(w.input, { x: 0, y: 0, ...input }); w.step(); feed(w, j); } };
const press = (w, j) => { w.input.act = true; w.step(); w.input.act = false; feed(w, j); };
const TRIP = Math.abs(CARRO.stops[1] - CARRO.stops[0]) / CARRO.speed + CARRO.ramp;
function world(x, z) {
  store.clear();
  const w = new World(CASCADA), j = new Journal({ append() {} }, w);
  w.citySeen = true; for (const d of [w.doors[0], w.gates[0]]) { d.open = true; d.openT = d.swing; }
  const a = w.avatar; a.x = a.px = x; a.z = a.pz = z; a.y = a.py = TERRACE_Y + a.hh; a.vx = a.vy = a.vz = 0;
  run(w, j, 0.3);
  return { w, j, a, k: w.carriers[0] };
}
const first = (w, kind) => w.interactables().find(i => i.kind === kind);
/** Aboard at the west stop, at a given reading of the car's tape (setup), the car waiting. */
function aboardAt(c) { const r = world(CARRO.stops[0] - CARRO.len / 2 + c, CARRO.z1 - 0.6); return r; }
/** Arms the recorder and rides one leg. */
function rideRecorded(w, j) {
  assert.equal(w.interactables()[0]?.kind, 'record'); press(w, j);
  for (let i = 0; i < Math.round((CARRO.dwell + TRIP + 1) / DT) && w.recorder.state !== 'done'; i++) { Object.assign(w.input, { x: 0, y: 0 }); w.step(); feed(w, j); }
  assert.equal(w.recorder.state, 'done');
  return w.recorder.marks;
}

test('the stops: the car\'s tape zero stops at round readings of the kerb (4 and 19 m)', () => {
  for (const [i, r] of [[0, 4], [1, 19]]) assert.ok(Math.abs(CARRO.stops[i] - CARRO.len / 2 - CARRO.kerb0 - r) < 1e-9);
});

test('the jalón: taken at the rack, planted on the platform, picked up again', () => {
  const { w, j, a } = world(JALONES.x + 0.3, JALONES.z + 0.4);
  assert.equal(w.interactables()[0]?.verb, 'Tomar un jalón');
  press(w, j); assert.equal(w.jalon.state, 'hand');
  run(w, j, 1.0, { x: 1 }); run(w, j, 0.2);
  assert.equal(w.interactables()[0]?.verb, 'Clavar el jalón');
  press(w, j); assert.equal(w.jalon.state, 'ground');
  const r = w.jalon.x - CARRO.kerb0;
  assert.ok(Math.abs(r - Math.round(r * 10) / 10) < 1e-9 && Math.abs(w.jalon.x - a.x) <= 0.05 + 1e-9, 'where the explorer stands, to 0.1 m of the kerb');
  assert.equal(first(w, 'jalon-pick')?.verb, 'Levantar el jalón');
  press(w, j); assert.equal(w.jalon.state, 'hand');
});

test('planted on the platform it is a third zero: other positions, the same displacement as the kerb', () => {
  const { w, j, a, k } = aboardAt(1.0);
  // (setup: the jalón planted on the platform at kerb 10.0)
  Object.assign(w.jalon, { state: 'ground', x: CARRO.kerb0 + 10, z: -38, carrier: null }); w.jalon.version++;
  const m = rideRecorded(w, j);
  assert.ok(m.every(x => x.j !== undefined));
  for (const x of m) assert.ok(Math.abs(x.j - (x.g - 10)) < 1e-9, 'from the jalón = from the kerb\'s zero − 10');
  assert.ok(Math.abs((m.at(-1).j - m[0].j) - (m.at(-1).g - m[0].g)) < 1e-9, 'the same displacement');
  const n = j.notes.find(x => x.id === 'jalon-anden');
  assert.ok(n, 'the note'); assert.match(n.body, /Desde él pasaste de −5,0 m a \+10,0 m: \+15,0 m\. En el cordón, el desplazamiento fue \+15,0 m: el mismo/);
});

test('planted on the car it travels with it: from it, the displacement is the tape\'s (0), not the kerb\'s', () => {
  const { w, j, a, k } = aboardAt(1.0);
  run(w, j, 0.1);
  Object.assign(w.jalon, { state: 'hand' }); w.jalon.version++;
  assert.equal(w.interactables()[0]?.verb, 'Clavar el jalón'); press(w, j);
  assert.equal(w.jalon.state, 'car');
  run(w, j, 0.2, { x: -1 }); run(w, j, 0.3); // a step away from it, so the recorder is offered
  const m = rideRecorded(w, j);
  const jx = w.jalonX();
  assert.ok(Math.abs(jx - (k.x - CARRO.len / 2 + w.jalon.c)) < 1e-9 && k.x === CARRO.stops[1], 'it travelled with the car');
  assert.ok(Math.abs(m.at(-1).j - m[0].j) < 1e-9, 'from it: 0 m');
  const n = j.notes.find(x => x.id === 'jalon-carro');
  assert.ok(n); assert.match(n.body, /: 0,0 m, el mismo desplazamiento que en la cinta \(0,0 m\), no el del cordón \(\+15,0 m\)/);
});

const talk = w => { const t = w.interactables().find(i => i.kind === 'talk'); assert.ok(t); w.input.act = true; w.step(); w.input.act = false; };
/** One eastward trip from the west stop, standing at tape reading c (setup), recorded; walking if asked. */
function attempt(w, j, c, walk = 0) {
  const a = w.avatar, k = w.carriers[0];
  for (let i = 0; i < Math.round(40 / DT) && !(k.phase === 'parada' && k.x === CARRO.stops[0]); i++) { w.step(); feed(w, j); }
  a.x = a.px = k.x - CARRO.len / 2 + c; a.z = a.pz = CARRO.z1 - 0.6; a.y = a.py = TERRACE_Y + a.hh; a.vx = a.vz = 0; run(w, j, 0.3);
  assert.equal(w.interactables()[0]?.kind, 'record'); press(w, j);
  for (let i = 0; i < Math.round((CARRO.dwell + TRIP + 1) / DT) && w.recorder.state !== 'done'; i++) { Object.assign(w.input, { x: walk && k.phase === 'marcha' && i % 120 < 30 ? walk : 0, y: 0 }); w.step(); feed(w, j); }
  assert.equal(w.recorder.state, 'done'); run(w, j, 0.2);
}

test('the errand rewards a prediction: a still trip at 1.8 m of the tape misses, at 2.5 m (21.5 − 19.0) meets it; then her jalón moves to 20.3 (1.3 m)', () => {
  const { w, j } = world(ENCARGO.vecina.x - 0.9, ENCARGO.vecina.z + 0.5);
  assert.equal(first(w, 'talk')?.verb, 'Hablar con la vecina'); talk(w); feed(w, j);
  assert.equal(w.errand.state, 'asked'); assert.ok(j.notes.some(n => n.id === 'encargo'));
  attempt(w, j, 1.8);
  assert.equal(w.errand.round, 0);
  const miss = j.notes.find(n => n.id === 'encargo-intentos');
  assert.match(miss.body, /1\) tu última tiza en 20,8 m: faltaron 0,7 m/); assert.doesNotMatch(miss.body, /2,5/, 'not the answer');
  attempt(w, j, 2.5);
  assert.equal(w.errand.round, 1, 'met: on to the next target');
  assert.equal(w.errand.placed, 0, 'her jalón stays put while the car waits at her stop');
  run(w, j, CARRO.dwell + 0.5); assert.equal(w.errand.placed, 1, 'moved once the car has left');
  assert.match(j.notes.find(n => n.id === 'encargo-cumplido').body, /19,0 \+ 2,5 = 21,5 m.*intento 2.*corrió su jalón a 20,3 m/);
  attempt(w, j, 2.5); // the memorised place does not do any more
  assert.equal(w.errand.round, 1); assert.equal(w.errand.state, 'asked');
  attempt(w, j, 1.3);
  assert.equal(w.errand.state, 'done');
  assert.match(j.notes.find(n => n.id === 'encargo-cumplido-2').body, /19,0 \+ 1,3 = 20,3 m/);
  assert.match(j.notes.find(n => n.id === 'encargo-intentos').body, /Jalón en 21,5 m: .*Jalón en 20,3 m: 1\) tu última tiza en 21,5 m: sobraron 1,2 m; 2\) tu última tiza en 20,3 m: al pie del jalón/);
  assert.equal(first(w, 'talk')?.verb, undefined, '(far from her now)');
});

test('a trip with a walk on the car does not count, even if its last chalk falls at her jalón', () => {
  const { w, j } = world(ENCARGO.vecina.x - 0.9, ENCARGO.vecina.z + 0.5); talk(w); feed(w, j);
  attempt(w, j, 1.0, 1); // walking ▶ in bursts during the ride
  assert.equal(w.errand.round, 0); assert.equal(w.errand.tries.at(-1).still, false);
  assert.match(j.notes.find(n => n.id === 'encargo-intentos').body, /caminaste durante el viaje: no cuenta/);
  // westward does not count at all
  const n = w.errand.tries.length; run(w, j, 0.3); press(w, j); run(w, j, CARRO.dwell + TRIP + 0.5);
  assert.equal(w.errand.tries.length, n, 'westward does not count');
});

test('at a waiting car the recorder comes before picking up a jalón planted right there; carried back into the square, the jalón returns to its rack', () => {
  const { w, j, a } = aboardAt(2.0);
  Object.assign(w.jalon, { state: 'hand' }); w.jalon.version++;
  press(w, j); assert.equal(w.jalon.state, 'car');
  assert.equal(w.interactables()[0]?.kind, 'record', 'standing at the jalón, E sets the recorder');
  press(w, j); assert.equal(w.recorder.state, 'armed');
  assert.equal(w.interactables()[0]?.kind, 'jalon-pick', 'once set, E picks it up');
  const r = world(11, -24); Object.assign(r.w.jalon, { state: 'hand' });
  run(r.w, r.j, 2, { y: -1 });
  assert.equal(r.w.jalon.state, 'rack');
});
