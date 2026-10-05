import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, AVATAR } from '../src/sim/world.js';
import { CASCADA } from '../src/sim/levels/cascada.js';
import { G_FAMILIAR } from '../src/sim/field.js';
import { fitAcceleration, boundaryFromMarks, firstRise } from '../src/journal.js';

function releaseAndRun(id, seconds) {
  const w = new World(CASCADA), st = w.stands.find(s => s.id === id);
  w.avatar.x = st.x; w.step(); w.input.act = true; w.step();
  for (let i = 0; i < seconds / DT; i++) w.step();
  return w.traces.find(t => t.source === id);
}

test('the journal measures g outside from the marks of support A', () => {
  const tr = releaseAndRun('A', 2);
  const before = tr.marks.filter(m => m.y > 0.2 && m.vy <= 0 && m.t < 0.55);
  const a = fitAcceleration(before);
  assert.ok(Math.abs(a + G_FAMILIAR) < 0.01, `fitted ${a}`);
});

test('the journal finds the region boundary from B\'s marks alone (within the band)', () => {
  const tr = releaseAndRun('B', 3);
  const z = CASCADA.zones[0];
  const yb = boundaryFromMarks(tr.marks);
  assert.ok(yb != null && Math.abs(yb - z.y1) <= z.band / 2 + 0.1, `boundary read at ${yb}`);
  const inside = firstRise(tr.marks, yb);
  const a = fitAcceleration(inside);
  assert.ok(Math.abs(a - z.g.y) < 0.02, `fitted ${a}`);
});
