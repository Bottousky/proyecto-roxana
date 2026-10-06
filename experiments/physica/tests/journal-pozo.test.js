import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, AVATAR } from '../src/sim/world.js';
import { CASCADA, WELL, TERRACE_Y, MIRADOR_LINE } from '../src/sim/levels/cascada.js';

// Minimal DOM and storage so the real Journal runs in Node.
const el = () => ({ hidden: false, innerHTML: '', className: '', append() {}, querySelector: () => ({}) });
globalThis.document = { createElement: el };
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
const { Journal } = await import('../src/journal.js');

function attempt(w, j, letGo, steer = 1, seconds = 8) {
  const av = w.avatar, feed = () => { for (const e of w.drainEvents()) j.onEvent(e); j.update(DT); };
  av.x = WELL.x0 - 0.4; av.y = TERRACE_Y + AVATAR.hh; av.px = av.x; av.py = av.y; av.vx = av.vy = 0;
  for (let i = 0; i < 40; i++) { w.input.x = 0; w.step(); feed(); }
  w.input.act = true; w.step(); feed();
  let n = 0; while (av.y > letGo && n++ < 4000) { w.input.y = -1; w.step(); feed(); }
  w.input.y = 0; w.input.act = true; w.step(); feed();
  for (let i = 0; i < seconds / DT; i++) { w.input.x = steer; w.step(); feed(); if (av.supportSteps > 25) break; }
  w.input.x = 0;
}

test('journal: well attempts are classified by cause with measured heights, no repeats', () => {
  store.clear();
  const w = new World(CASCADA), j = new Journal({ append() {} }, w);
  w.shortSeen = true;
  attempt(w, j, 0.9);                       // falls into the water
  // back up: R from the water
  w.input.reset = true; w.step(); for (const e of w.drainEvents()) j.onEvent(e);
  attempt(w, j, 2.9, 1);                    // short
  attempt(w, j, 2.9, 1);                    // short again, same height: must not be repeated
  attempt(w, j, 1.5, 1);                    // reaches
  const outcomes = j.flags.wellTries.map(t => t.outcome);
  assert.deepEqual(outcomes, ['cae', 'corto', 'corto', 'mirador']);
  const mir = j.notes.find(n => n.id === 'mirador');
  assert.ok(mir, 'mirador note');
  assert.ok(mir.data.tries.at(-1).apex >= MIRADOR_LINE, 'the success apex is recorded and above the line');
  assert.equal((mir.body.match(/2,9/g) || []).length, 1, `no repeated heights: ${mir.body}`);
  assert.ok(!/1,5 m no alcanzaste/.test(mir.body), 'the successful height is not listed as short');
});

test('journal: reaching above the line but not steering is "far", not "short"', () => {
  store.clear();
  const w = new World(CASCADA), j = new Journal({ append() {} }, w);
  attempt(w, j, 1.5, 0, 2.5);               // no steering: it rises above the line and bobs
  w.input.reset = true; w.step(); for (const e of w.drainEvents()) j.onEvent(e);
  const last = j.flags.wellTries.at(-1);
  assert.equal(last.outcome, 'direccion');
  assert.ok(last.apex >= MIRADOR_LINE);
});
