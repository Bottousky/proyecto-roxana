import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nearMisses, descend, isDouble, rectsWithPerimeter, scale, pythag, rearrange, thirdAngle, distance, compareShapes} from '../src/logic/geometry.js';

test('ningún cuadrado de p × p es justo dos de q × q (q hasta 1000), y los casi son de a uno', () => {
  const m = nearMisses(1000);
  assert.ok(m.every(r => r.diff !== 0));
  const byQ = Object.fromEntries(m.map(r => [r.q, r]));
  assert.deepEqual([byQ[2].pp, byQ[2].twoQq], [9, 8]);
  assert.deepEqual([byQ[5].pp, byQ[5].twoQq], [49, 50]);
  assert.deepEqual([byQ[12].pp, byQ[12].twoQq], [289, 288]);
});

test('el descenso conserva la relación: (2q − p)² − 2(p − q)² = −(p² − 2q²)', () => {
  for (const [p, q] of [[3, 2], [7, 5], [17, 12], [41, 29], [10, 7]]) {
    const d = descend(p, q);
    assert.equal(d.p * d.p - 2 * d.q * d.q, -(p * p - 2 * q * q));
    assert.ok(d.q < q && d.q > 0);
  }
  assert.equal(isDouble(7, 5), false);
});

test('misma cerca, distintas áreas', () => {
  assert.deepEqual(rectsWithPerimeter(12).map(r => r.area), [5, 8, 9]);
});

test('agrandar al doble: área ×4, volumen ×8', () => {
  assert.deepEqual(scale(2), {length: 2, area: 4, volume: 8});
});

test('Pitágoras: 3-4-5 cumple, 4-5-6 no; el reacomodo deja a² + b² libre', () => {
  assert.equal(pythag(3, 4, 5).holds, true);
  assert.equal(pythag(4, 5, 6).holds, false);
  for (const [a, b] of [[3, 4], [1, 2], [5, 12]]) {
    const r = rearrange(a, b);
    assert.equal(r.freeA, r.squaresAB);
  }
});

test('ángulos y coordenadas', () => {
  assert.equal(thirdAngle(90, 35), 55);
  assert.deepEqual(distance([1, 1], [4, 5]), {d2: 25, exact: true, d: 5});
  assert.equal(distance([0, 0], [1, 1]).exact, false);
});

test('copias: iguales y parecidas', () => {
  assert.deepEqual(compareShapes([2, 3, 2, 3], [2, 3, 2, 3]), {congruent: true, similar: true, k: 1});
  assert.deepEqual(compareShapes([2, 3, 2, 3], [4, 6, 4, 6]), {congruent: false, similar: true, k: 2});
  assert.equal(compareShapes([2, 3, 2, 3], [4, 3, 4, 3]).similar, false);
});
