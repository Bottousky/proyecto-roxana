// The moss beards are instruments of reading: each is a chain integrated in the field, so its tip
// must hang below its root in the familiar field and rise above it inside a region.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Moss } from '../src/render/flora.js';
import { World } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y } from '../src/sim/levels/cascada.js';

const settle = (field, root) => {
  const m = new Moss(field); const c = m.add({ root, n: 6, len: 0.09, dir: [0.2, -1], width: 0.08, color: '#7f9a52' });
  m.build(); for (let i = 0; i < 240; i++) m.update(1 / 60, i / 60);
  return c.pts[c.pts.length - 1].y - root[1];
};

test('a beard hangs in the familiar field and rises in an upward one', () => {
  assert.ok(settle({ at: (x, y, o) => { o.x = 0; o.y = -9.8; return o; } }, [0, 0, 0]) < -0.4);
  assert.ok(settle({ at: (x, y, o) => { o.x = 0; o.y = 4; return o; } }, [0, 0, 0]) > 0.4);
});

test("on the Terraza's face the beards flip at the region's top edge (the level's field)", () => {
  const field = new World(CASCADA).field;
  assert.ok(settle(field, [4.48, TERRACE_Y - 0.4, -2.9]) < -0.3, 'above the region: hangs');
  assert.ok(settle(field, [4.48, 1.8, -2.9]) > 0.3, 'inside the region: rises');
});
