// The ferns' bend is the vegetation's way of showing the field: their tips must turn with the
// local field (down outside a region, up inside it, straight where it vanishes) and saturate
// instead of growing without bound; ground plants must not pretend to feel a vertical field.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fernAngle, fernTipUp, FERN_MAX } from '../src/render/vegetation.js';
import { World } from '../src/sim/world.js';
import * as levels from '../src/sim/levels/cascada.js';

const level = Object.values(levels).find(v => v && v.zones);
const world = new World(level);
const g = (x, y) => world.field.at(x, y, { x: 0, y: 0 });

test('a fern droops in the familiar field, curls up inside the region, and is straight with no field', () => {
  for (const nx of [-1, 1]) {
    assert.ok(fernTipUp(fernAngle({ x: 0, y: -9.8 }, nx), nx) < -0.8, `droops (nx ${nx})`);
    assert.ok(fernTipUp(fernAngle({ x: 0, y: 4 }, nx), nx) > 0.6, `curls up (nx ${nx})`);
    assert.ok(Math.abs(fernAngle({ x: 0, y: 0 }, nx)) < 1e-12); // straight (sign of zero aside)
  }
});

test('the bend saturates: never past the largest bend, however strong the field', () => {
  for (const gy of [-9.8, -50, 4, 40]) assert.ok(Math.abs(fernAngle({ x: 0, y: gy }, -1)) <= FERN_MAX + 1e-12);
});

test("on the Terraza's face (nx = −1) the ferns flip at the region's top edge", () => {
  // The face is at x = 4.5; the cascade's region ends at y = 3 with a 0.6 m band.
  assert.ok(fernTipUp(fernAngle(g(4.3, 3.9), -1), -1) < -0.8, 'above the region the tip droops');
  assert.ok(fernTipUp(fernAngle(g(4.3, 2.2), -1), -1) > 0.6, 'inside the region the tip lifts');
});
