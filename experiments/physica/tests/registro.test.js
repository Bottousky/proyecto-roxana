// The car's recorder (D22): during a trip it marks every 0.5 s where the explorer is, in two
// records at once — chalk on the platform's kerb (ground frame) and ink on the car's tape (car
// frame) — and the Bitácora writes what each record says, with that trip's numbers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y, CARRO } from '../src/sim/levels/cascada.js';

// Minimal DOM and storage so the real Journal runs in Node.
const el = () => ({ hidden: false, innerHTML: '', className: '', append() {}, querySelector: () => ({}) });
globalThis.document = { createElement: el };
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
const { Journal } = await import('../src/journal.js');

const feed = (w, j) => { for (const e of w.drainEvents()) j.onEvent(e); j.update(DT); };
const run = (w, j, s, input = {}) => { for (let i = 0; i < Math.round(s / DT); i++) { Object.assign(w.input, { x: 0, y: 0, ...input }); w.step(); feed(w, j); } };
const press = (w, j) => { w.input.act = true; w.step(); w.input.act = false; feed(w, j); };
const TRIP = Math.abs(CARRO.stops[1] - CARRO.stops[0]) / CARRO.speed + CARRO.ramp;
/** A world with the arch and the gate open, the explorer aboard the car at its first stop. */
function aboard() {
  store.clear();
  const w = new World(CASCADA), j = new Journal({ append() {} }, w);
  w.citySeen = true; for (const d of [w.doors[0], w.gates[0]]) { d.open = true; d.openT = d.swing; }
  const a = w.avatar; a.x = a.px = CARRO.stops[0]; a.z = a.pz = CARRO.z1 - 0.6; a.y = a.py = TERRACE_Y + a.hh; a.vx = a.vy = a.vz = 0;
  run(w, j, 0.3);
  return { w, j, a, k: w.carriers[0] };
}
/** Sets the recorder and rides one leg (optionally walking during part of it). */
function rideRecorded(w, j, walk = null) {
  assert.equal(w.interactables()[0]?.kind, 'record');
  press(w, j);
  assert.equal(w.recorder.state, 'armed');
  let tRide = 0;
  for (let i = 0; i < Math.round((CARRO.dwell + TRIP + 1) / DT) && w.recorder.state !== 'done'; i++) {
    const on = w.recorder.state === 'on'; if (on) tRide += DT;
    const x = walk && on && tRide > walk.from && tRide < walk.from + walk.dur ? walk.dir : 0;
    Object.assign(w.input, { x, y: 0 }); w.step(); feed(w, j);
  }
  assert.equal(w.recorder.state, 'done');
  return w.recorder.marks;
}

test('standing on the car: the chalk marks spread along the kerb, the ink marks stay in one place', () => {
  const { w, j } = aboard();
  const m = rideRecorded(w, j);
  const T = m.at(-1).t;
  assert.ok(Math.abs(T - TRIP) < DT + 1e-9, `from departure to arrival (${T.toFixed(3)} s)`);
  for (let i = 1; i < m.length - 1; i++) assert.ok(Math.abs(m[i].t - m[i - 1].t - 0.5) < 1e-9, 'every 0.5 s');
  assert.ok(m.at(-1).t - m.at(-2).t > 2 * DT, 'the arrival mark is not a duplicate of the last one');
  assert.equal(new Set(m.map(x => x.g.toFixed(6))).size, m.length, 'no two chalk marks in the same place');
  const cruise = m.slice(2, -2), steps = cruise.slice(1).map((x, i) => x.g - cruise[i].g);
  for (const s of steps) assert.ok(Math.abs(s - CARRO.speed * 0.5) < 1e-9, `chalk every 0.75 m while it runs (${s})`);
  for (const x of m) assert.ok(Math.abs(x.c - m[0].c) < 1e-9, 'the ink in one place');
  assert.ok(Math.abs(m.at(-1).g - m[0].g - 15) < 1e-9, 'the chalk: 15 m');
  const note = j.notes.find(n => n.id === 'registro');
  assert.ok(note, 'the note');
  assert.match(note.body, /un desplazamiento de \+15,0 m en 10,5 s/);
  assert.match(note.body, /: 0,0 m, todas las marcas en el mismo lugar/);
});

test('walking on the running car: displacement on the ground = the car\'s + the one on the car (with signs)', () => {
  const { w, j } = aboard();
  rideRecorded(w, j); // (the first note)
  run(w, j, 0.2);
  // back the other way, walking ◀ (with the car going west: forwards) for 1.2 s in the middle of the trip
  const m = rideRecorded(w, j, { from: 3, dur: 1.2, dir: -1 });
  const m0 = m[0], m1 = m.at(-1), dg = m1.g - m0.g, dc = m1.c - m0.c, dk = m1.k - m0.k;
  assert.ok(dc < -1, `walked along the car (${dc.toFixed(2)} m on the tape)`);
  assert.ok(Math.abs(dg - (dk + dc)) < 1e-9, `${dg} = ${dk} + ${dc}`);
  const note = j.notes.find(n => n.id === 'registro-caminando');
  assert.ok(note, 'the walking note');
  assert.match(note.body, /−15,0 \+ \(−\d,\d\) = −1\d,\d m/);
});

test('westward the kerb\'s readings go down: a negative displacement, and its distance', () => {
  const { w, j } = aboard();
  rideRecorded(w, j); run(w, j, 0.2);
  const m = rideRecorded(w, j);
  assert.ok(Math.abs(m.at(-1).g - m[0].g + 15) < 1e-9, '−15 m');
  const note = j.notes.find(n => n.id === 'registro-oeste');
  assert.ok(note, 'the westward note');
  assert.match(note.body, /un desplazamiento de −15,0 m\. Hacia el oeste las lecturas del cordón bajan: el desplazamiento es negativo\. La distancia recorrida fue 15,0 m/);
});

test('stepping off during the trip cuts the record (no note); the recorder is offered only while the car waits', () => {
  const { w, j } = aboard();
  press(w, j); assert.equal(w.recorder.state, 'armed');
  run(w, j, CARRO.dwell + 2);
  assert.equal(w.recorder.state, 'on');
  assert.ok(!w.interactables().some(i => i.kind === 'record'), 'not offered while it runs');
  run(w, j, 1.0, { y: -1 }); // off the running car
  assert.equal(w.recorder.state, 'cut', 'cut, not done');
  assert.ok(!j.notes.some(n => n.id.startsWith('registro')), 'a cut record writes nothing');
});

test('setting the recorder again keeps the last record until the car starts (it is there to be read)', () => {
  const { w, j } = aboard();
  const first = rideRecorded(w, j).length; run(w, j, 0.2);
  press(w, j); assert.equal(w.recorder.state, 'armed');
  assert.equal(w.recorder.marks.length, first, 'still there while armed');
  run(w, j, CARRO.dwell);
  assert.equal(w.recorder.state, 'on'); assert.ok(w.recorder.marks.length < 4, 'replaced once the trip starts');
});

test('walking against the car at its own speed: the chalk stays in one place while the ink spreads (the marks, not the definitions)', () => {
  const { w, j, a, k } = aboard();
  assert.equal(w.interactables()[0]?.kind, 'record'); press(w, j);
  run(w, j, CARRO.dwell); assert.notEqual(k.phase, 'parada');
  run(w, j, 1.0); // into the cruise, then ◀ (against the car going east) for 2 s, from the deck's east end
  a.x = a.px = k.x + CARRO.len / 2 - 0.3; run(w, j, 0.05);
  const from = w.recorder.marks.length;
  run(w, j, 2.0, { x: -1 });
  const ms = w.recorder.marks.slice(from + 1, w.recorder.marks.length - 1); // marks well inside the walk
  assert.ok(ms.length >= 2, `${ms.length} marks during the walk`);
  for (let i = 1; i < ms.length; i++) {
    assert.ok(Math.abs(ms[i].g - ms[i - 1].g) < 0.05, `chalk in one place (${(ms[i].g - ms[i - 1].g).toFixed(3)} m)`);
    assert.ok(Math.abs(ms[i].c - ms[i - 1].c + 0.75) < 0.05, `ink 0.75 m back each time (${(ms[i].c - ms[i - 1].c).toFixed(3)} m)`);
  }
});

test('a first trip westward and walking: its note says the sum and the sign', () => {
  const { w, j, k } = aboard();
  run(w, j, CARRO.dwell + 11); assert.equal(k.x, CARRO.stops[1]); // (to the other stop, unrecorded)
  const m = rideRecorded(w, j, { from: 3, dur: 1.2, dir: 1 }); // westward, walking ▶ (against the car)
  const note = j.notes.find(n => n.id === 'registro');
  assert.ok(note && m.length > 2);
  assert.match(note.body, /más el tuyo sobre el carro: −15,0 \+ \(\+1,\d\) = −13,\d m/);
  assert.match(note.body, /el desplazamiento es negativo/);
  assert.ok(!j.notes.some(n => n.id === 'registro-caminando' || n.id === 'registro-oeste'), 'said once, in the first note');
});

test('a cut record stays cut: one event, and boarding again (running or at a stop) neither resumes it nor writes a note', () => {
  for (const reboard of ['running', 'stop']) {
    const { w, j, a, k } = aboard();
    press(w, j); run(w, j, CARRO.dwell + 2);
    assert.equal(w.recorder.state, 'on');
    let done = 0;
    const count = () => { for (const e of w.events) if (e.type === 'record-done') done++; };
    for (let i = 0; i < Math.round(2 / DT); i++) { Object.assign(w.input, { x: 0, y: i < Math.round(1 / DT) ? -1 : 0 }); w.step(); count(); feed(w, j); }
    assert.equal(w.recorder.state, 'cut'); assert.equal(done, 1, `one record-done (${done})`);
    // back aboard: onto the running car beside it, or at the next stop
    if (reboard === 'stop') run(w, j, 12);
    a.x = a.px = k.x; a.z = a.pz = CARRO.z1 - 0.6; a.y = a.py = TERRACE_Y + a.hh; a.vx = a.vz = 0;
    run(w, j, 1.0);
    assert.equal(a.carrier, k, 'aboard again');
    run(w, j, 12);
    assert.equal(w.recorder.state, 'cut', `${reboard}: still cut`);
    assert.ok(!j.notes.some(n => n.id.startsWith('registro')), `${reboard}: no note from a cut record`);
  }
});

test('the last trip in a table: a row every 2 s and the arrival; each row adds up (kerb = car\'s zero + tape)', async () => {
  const { tripTable } = await import('../src/journal.js');
  const { w, j } = aboard();
  const m = rideRecorded(w, j);
  const n = j.notes.find(x => x.id === 'registro-tabla');
  assert.ok(n?.data?.table, 'the table note');
  const t = n.data.table;
  assert.deepEqual(t.map(r => r.t), [0, 2, 4, 6, 8, 10, 10.5]);
  for (const r of t) assert.ok(Math.abs(r.g - (r.z + r.c)) < 1e-9, `row ${r.t}: ${r.g} = ${r.z} + ${r.c}`);
  assert.ok(t.every(r => Math.abs(r.c - t[0].c) < 1e-9), 'standing: the tape column does not change');
  assert.deepEqual(tripTable(m, CARRO.len / 2), t);
});

test('the two observers describe the same trip differently, with its numbers', async () => {
  const { describeTrip } = await import('../src/journal.js');
  const { w, j } = aboard();
  const still = describeTrip(rideRecorded(w, j), CARRO.len / 2);
  assert.deepEqual(still.anden, ['Desde la vereda: +15,0 m', 'en 10,5 s, hacia el este.', 'El carro: +15,0 m.']);
  assert.deepEqual(still.carro, ['Desde el carro: 0,0 m', 'no te moviste.', 'La vereda se fue 15,0 m al oeste.']);
  run(w, j, 0.2);
  const walked = describeTrip(rideRecorded(w, j, { from: 3, dur: 1.2, dir: -1 }), CARRO.len / 2);
  assert.match(walked.anden.join(' '), /Desde la vereda: −1\d,\d m en 10,5 s, hacia el oeste/);
  assert.match(walked.carro.join(' '), /Desde el carro: −\d,\d m hacia el oeste, por la cubierta/);
  assert.ok(Math.abs(walked.DG - (walked.DK + walked.DC)) < 1e-9);
});

test('walking and coming back is not «not moving»: the passenger says so (displacement 0 is not the same as still)', async () => {
  const { describeTrip } = await import('../src/journal.js');
  const { w, j, a } = aboard();
  assert.equal(w.interactables()[0]?.kind, 'record'); press(w, j);
  for (let i = 0; i < Math.round((CARRO.dwell + TRIP + 1) / DT) && w.recorder.state !== 'done'; i++) {
    const tr = w.recorder.state === 'on' ? (w.stepCount - w.recorder.startStep) * DT : -1;
    Object.assign(w.input, { x: tr > 3 && tr < 3.4 ? 1 : tr > 3.6 && tr < 4.0 ? -1 : 0, y: 0 }); w.step(); feed(w, j);
  }
  const m = w.recorder.marks;
  assert.ok(m.some(x => Math.abs(x.c - m[0].c) >= 0.05), 'it did walk');
  const d = describeTrip(m, CARRO.len / 2);
  if (Math.abs(d.DC) < 0.05) assert.deepEqual(d.carro, ['Desde el carro: 0,0 m', 'caminaste, pero terminaste', 'donde empezaste.']);
  else assert.doesNotMatch(d.carro.join(' '), /no te moviste/);
});

test('one rule for shown readings: the table, the notes and the bubbles agree; ties round the same way; the car\'s zero advances steadily', async () => {
  const { describeTrip, tripTable, lecturas } = await import('../src/journal.js');
  for (const c of [1.85, 2.45, 1.0, 3.15]) {
    store.clear();
    const w = new World(CASCADA), j = new Journal({ append() {} }, w);
    w.citySeen = true; for (const d of [w.doors[0], w.gates[0]]) { d.open = true; d.openT = d.swing; }
    const a = w.avatar, k = w.carriers[0]; a.x = a.px = k.x - CARRO.len / 2 + c; a.z = a.pz = CARRO.z1 - 0.6; a.y = a.py = TERRACE_Y + a.hh; run(w, j, 0.3);
    const m = rideRecorded(w, j);
    const t = tripTable(m, CARRO.len / 2), d = describeTrip(m, CARRO.len / 2), L = lecturas(m, CARRO.len / 2);
    assert.ok(t.every(r => r.c === t[0].c), `tape ${c}: the tape column constant (${t.map(r => r.c)})`);
    const steps = t.slice(1, -2).map((r, i) => Math.round((t[i + 2].z - r.z) * 10) / 10);
    assert.ok(steps.every(s => s === 3), `the zero advances 3,0 every 2 s in cruise (${t.map(r => r.z)})`);
    const note = j.notes.find(x => x.id === 'registro');
    const G0 = L[0].G, G1 = L.at(-1).G;
    assert.ok(note.body.includes(`pasaste de ${G0.toFixed(1).replace('.', ',')} m a ${G1.toFixed(1).replace('.', ',')} m`), `note = table (${note.body.slice(0, 160)})`);
    assert.equal(t[0].g, G0); assert.equal(t.at(-1).g, G1);
    assert.ok(Math.abs(d.DG - (G1 - G0)) < 1e-9, 'bubble = note');
  }
});
