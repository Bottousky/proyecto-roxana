import {test} from 'node:test';
import assert from 'node:assert/strict';
import {radiiAround, point, heights, add, cmul, I, quarter, solve2, slopeRatio} from '../src/logic/turns.js';

test('alrededor de una rueda entran 2π radios: 6 y un poco más', () => {
  assert.ok(radiiAround() > 6.28 && radiiAround() < 6.29);
});

test('alto y costado: 30° da alto 1/2; alto² + costado² = 1', () => {
  assert.equal(point(1, 30).y, 0.5);
  assert.equal(point(1, 90).y, 1);
  assert.equal(point(1, 180).y, 0);
  for (const deg of [0, 30, 45, 60, 120, 210, 300]) {
    const {x, y} = point(1, deg);
    assert.ok(Math.abs(x * x + y * y - 1) < 0.005);
  }
});

test('las alturas se repiten cada vuelta', () => {
  const h = heights(1, 30, 720);
  for (let i = 0; i + 12 < h.length; i++) assert.equal(h[i].y, h[i + 12].y);
});

test('flechas: el orden no cambia el destino', () => {
  assert.deepEqual(add([3, 2], [1, -4]), [4, -2]);
  assert.deepEqual(add([1, -4], [3, 2]), [4, -2]);
});

test('multiplicar por i es un cuarto de vuelta; i · i = −1; 2i · 2i = −4', () => {
  assert.deepEqual(quarter([3, 1]), [-1, 3]);
  assert.deepEqual(cmul(I, I), [-1, 0]);
  assert.deepEqual(cmul([0, 2], [0, 2]), [-4, 0]);
});

test('dos pistas: suman 7 y se llevan 1 → (4, 3); paralelas sin solución', () => {
  assert.deepEqual(solve2([1, 1, 7], [1, -1, 1]), {kind: 'one', x: 4, y: 3});
  assert.equal(solve2([1, 1, 7], [1, 1, 3]).kind, 'none');
  assert.equal(solve2([1, 1, 7], [2, 2, 14]).kind, 'many');
});

test('la razón de una rampa depende del ángulo, no del largo', () => {
  assert.equal(slopeRatio(30), 0.5);
});
