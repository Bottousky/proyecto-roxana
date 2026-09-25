import test from 'node:test';
import assert from 'node:assert/strict';
import { isPositionClear, isSegmentClear, moveWithCollisions } from '../src/collision.js';

const bounds = [20, 20];
const closeTo = (actual, expected, epsilon = .001) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} should be close to ${expected}`);

test('a long move cannot tunnel through a wall even when both endpoints are clear', () => {
  const wall = [{ x: 0, z: 0, w: .001, d: 10 }];
  assert.equal(isPositionClear([-6, 0], bounds, wall), true);
  assert.equal(isPositionClear([6, 0], bounds, wall), true);
  assert.equal(isSegmentClear([-6, 0], [6, 0], bounds, wall), false);
  const result = moveWithCollisions([-6, 0], [12, 0], bounds, wall);
  assert.ok(result[0] <= -.341, 'The actor remains on the starting side of the wall');
  closeTo(result[0], -.341);
  assert.equal(result[1], 0);
});

test('the exact sweep detects sub-sample thin walls with zero actor radius', () => {
  const needle = [{ x: .123456, z: 0, w: .000001, d: 2 }];
  assert.equal(isSegmentClear([-1, 0], [1, 0], bounds, needle, { radius: 0 }), false);
  const result = moveWithCollisions([-1, 0], [2, 0], bounds, needle, { radius: 0, maxStep: .25 });
  assert.ok(result[0] <= .123455);
});

test('diagonal input slides along a wall while maintaining actor clearance', () => {
  const wall = [{ x: 0, z: 0, w: .2, d: 10 }];
  const result = moveWithCollisions([-2, -3], [4, 6], bounds, wall);
  closeTo(result[0], -.54);
  closeTo(result[1], 3);
  assert.equal(isPositionClear(result, bounds, wall), true);
});

test('two walls stop diagonal motion at their corner without axis-order penetration', () => {
  const walls = [{ x: 0, z: 0, w: .2, d: 10 }, { x: 0, z: 0, w: 10, d: .2 }];
  const result = moveWithCollisions([-3, -3], [7, 7], bounds, walls);
  assert.ok(result[0] <= -.54 && result[1] <= -.54);
  closeTo(result[0], -.54);
  closeTo(result[1], -.54);
});

test('touching a wall permits tangent travel and movement away, but not into it', () => {
  const wall = [{ x: 0, z: 0, w: 1, d: 4 }], start = [-1.34, 0];
  assert.equal(isPositionClear(start, bounds, wall), true);
  assert.equal(isSegmentClear(start, [-1.34, 3], bounds, wall), true);
  const along = moveWithCollisions(start, [0, 3], bounds, wall);
  closeTo(along[0], start[0]); closeTo(along[1], 3);
  assert.deepEqual(moveWithCollisions(start, [2, 0], bounds, wall), start);
  const away = moveWithCollisions(start, [-2, 0], bounds, wall);
  closeTo(away[0], -3.34);
});

test('repeated blocked frames keep exact contact while a changed input slides along the wall', () => {
  const wall = [{ x: 1.5, z: 0, w: .5, d: 3 }];
  let position = [0, 0];
  for (let frame = 0; frame < 12; frame++) position = moveWithCollisions(position, [.21, 0], bounds, wall);
  const contact = position[0];
  for (const delta of [[.21, 0], [.148492424, .148492424], [.031, .09], [.24, -.07]]) {
    const next = moveWithCollisions(position, delta, bounds, wall);
    assert.equal(next[0], contact, 'The blocked coordinate cannot creep with a different substep length');
    closeTo(next[1], position[1] + delta[1]);
    position = next;
  }
});

test('sampled terrain contacts do not acquire residual movement from repeated bisection', () => {
  const options = { isWalkable: x => x < .66 };
  let position = [0, 0];
  for (let frame = 0; frame < 12; frame++) position = moveWithCollisions(position, [.21, 0], bounds, [], options);
  const contact = position[0];
  const slid = moveWithCollisions(position, [.148492424, .148492424], bounds, [], options);
  assert.equal(slid[0], contact);
  closeTo(slid[1], .148492424);
});

test('both actor radii use the same obstacle half-extents, including a tight doorway', () => {
  const doorway = [{ x: -2.2, z: 0, w: 1.8, d: .1 }, { x: 2.2, z: 0, w: 1.8, d: .1 }];
  const player = moveWithCollisions([0, -2], [0, 4], bounds, doorway, { radius: .34 });
  const ohm = moveWithCollisions([0, -2], [0, 4], bounds, doorway, { radius: .42 });
  closeTo(player[1], 2);
  assert.ok(ohm[1] <= -.52, 'The wider companion cannot enter a doorway narrower than its body');
});

test('large deltas remain inside world bounds and terrain eligibility is checked between endpoints', () => {
  const bounded = moveWithCollisions([0, 0], [1e12, -1e12], bounds);
  closeTo(bounded[0], 9.4); closeTo(bounded[1], -9.4);
  const isWalkable = (x, z) => x < -.3 || x > .3 || z > 2;
  assert.equal(isSegmentClear([-2, 0], [2, 0], bounds, [], { isWalkable }), false);
  const coast = moveWithCollisions([-2, 0], [4, 0], bounds, [], { isWalkable });
  assert.ok(coast[0] < -.3);
});

test('movement is pure and never silently recovers an invalid start across a wall', () => {
  const start = Object.freeze([0, 0]), delta = Object.freeze([4, 0]);
  const walls = Object.freeze([Object.freeze({ x: 0, z: 0, w: .2, d: 10 })]);
  assert.deepEqual(moveWithCollisions(start, delta, bounds, walls), start);
  assert.deepEqual(moveWithCollisions([-2, 0], [Infinity, 0], bounds, walls), [-2, 0]);
  assert.deepEqual(moveWithCollisions([-2, 0], [0, 0], bounds, walls), [-2, 0]);
  assert.equal(isPositionClear([NaN, 0], bounds, walls), false);
});
