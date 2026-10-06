import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RULES, lineThrough, jump, readParabola, compose, double1, undoDouble1, sq, avgRate, riemann, tariff} from '../src/logic/anticipate.js';

test('las siete reglas del viaje tienen familia', () => {
  assert.equal(RULES.length, 7);
  assert.equal(new Set(RULES.map(r => r.family)).size, 7);
});

test('la escalera de Mara es a = 10, b = 1', () => {
  assert.deepEqual(lineThrough([0, 1], [3, 31]), {a: 10, b: 1});
});

test('el salto de Punto: ceros en 0 y 6, máximo 9 en 3', () => {
  const r = readParabola(-1, 6, 0);
  assert.deepEqual(r.zeros, [0, 6]);
  assert.deepEqual(r.top, [3, 9]);
  assert.equal(jump(3), 9);
});

test('componer depende del orden; deshacer', () => {
  assert.equal(compose(sq, double1)(2), 25);
  assert.equal(compose(double1, sq)(2), 9);
  for (const x of [-3, 0, 2.5, 7]) assert.equal(undoDouble1(double1(x)), x);
  assert.equal(sq(3), sq(-3));
});

test('la velocidad promedio se acerca a 4 en t = 1', () => {
  const rates = [1, 0.5, 0.1, 0.01].map(h => avgRate(jump, 1, h));
  assert.deepEqual(rates.map(r => +r.toFixed(2)), [3, 3.5, 3.9, 3.99]);
});

test('sumar rectángulos cada vez más finos se acerca al área', () => {
  const r = t => 2 * t; // caudal que crece; total exacto en [0, 3]: 9
  const sums = [3, 6, 30, 300].map(n => riemann(r, 3, n));
  assert.ok(sums[0] < sums[1] && sums[1] < sums[2] && sums[2] < sums[3]);
  assert.ok(Math.abs(sums[3] - 9) < 0.05);
});

test('tarifa por tramos', () => {
  assert.equal(tariff(8), 8);
  assert.equal(tariff(10), 10);
  assert.equal(tariff(16), 13);
});
