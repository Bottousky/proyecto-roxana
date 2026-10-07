import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, AVATAR } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y, SOPORTE_C } from '../src/sim/levels/cascada.js';

// Minimal DOM and storage so the real Journal runs in Node.
const el = () => ({ hidden: false, innerHTML: '', className: '', append() {}, querySelector: () => ({}) });
globalThis.document = { createElement: el };
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
const { Journal } = await import('../src/journal.js');

const feed = (w, j) => { for (const e of w.drainEvents()) j.onEvent(e); j.update(DT); };
const run = (w, j, s) => { for (let i = 0; i < Math.round(s / DT); i++) { w.input.x = 0; w.input.y = 0; w.step(); feed(w, j); } };
const at = (w, x, feetY, z) => { const a = w.avatar; a.x = a.px = x; a.y = a.py = feetY + AVATAR.hh; a.z = a.pz = z; a.vx = a.vy = a.vz = 0; };
const release = (w, j, id) => { assert.equal(w.interactables()[0]?.id, id, `support ${id} offered`); w.input.act = true; w.step(); w.input.act = false; feed(w, j); run(w, j, 2.5); };
const square = () => { const w = new World(CASCADA); w.citySeen = true; const d = w.doors[0]; d.open = true; d.openT = d.swing; return w; };

test('journal: the square\'s fall states only what was measured; the comparison appears once both falls are measured', () => {
  store.clear();
  let w = square(), j = new Journal({ append() {} }, w);
  at(w, SOPORTE_C.x + 0.4, TERRACE_Y, SOPORTE_C.z); run(w, j, 0.3);
  release(w, j, 'C');
  const plaza = j.notes.find(n => n.id === 'plaza');
  assert.ok(plaza, 'plaza note');
  assert.match(plaza.body, /bajó 1,8\d m en 0,6\d s, acelerando 9,8 m\/s²/);
  assert.match(plaza.body, /falta soltar/, 'without A: says the comparison is missing');
  assert.equal(plaza.title, 'Una caída detrás del muro', 'and its title does not claim it either');
  assert.doesNotMatch(plaza.body, /caída de siempre/, 'does not claim what was not measured');
  // then the Orilla's support A: its note compares with the square's measurement
  at(w, -2.8, 0, 0); run(w, j, 0.3);
  release(w, j, 'A');
  const caida = j.notes.find(n => n.id === 'caida');
  assert.ok(caida, 'caida note');
  assert.match(caida.body, /Detrás del muro, en la plaza, el soporte igual había medido 9,8 m\/s²; acá, 9,8 m\/s²: la misma caída/);
  // the other order: A first, then C
  store.clear();
  w = square(); j = new Journal({ append() {} }, w);
  at(w, -2.8, 0, 0); run(w, j, 0.3); release(w, j, 'A');
  assert.doesNotMatch(j.notes.find(n => n.id === 'caida').body, /plaza/);
  at(w, SOPORTE_C.x + 0.4, TERRACE_Y, SOPORTE_C.z); run(w, j, 0.3); release(w, j, 'C');
  const plaza2 = j.notes.find(n => n.id === 'plaza');
  assert.match(plaza2.body, /En la Orilla, el soporte igual había medido 9,8 m\/s²: la misma caída, de los dos lados del muro/);
  assert.equal(plaza2.title, 'La misma caída, detrás del muro');
});
