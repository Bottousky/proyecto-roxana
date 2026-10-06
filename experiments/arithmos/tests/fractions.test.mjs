import {test} from 'node:test';
import assert from 'node:assert/strict';
import {frac, simplest, equivalent, compare, add, naiveAdd, isHalf, decimal, percentOf, measureWith, diagonalFits} from '../src/logic/fractions.js';

test('dos de cuatro y una de dos son el mismo número', () => {
  assert.ok(equivalent(frac(2, 4), frac(1, 2)));
  assert.deepEqual(simplest(frac(2, 4)), frac(1, 2));
  assert.ok(!equivalent(frac(2, 3), frac(3, 4)));
});

test('partes de tamaño cero no existen', () => {
  assert.equal(frac(3, 0).defined, false);
});

test('más partes, más chicas: 1/4 < 1/3; 2/3 < 3/4 con doceavos', () => {
  assert.equal(compare(frac(1, 4), frac(1, 3)), -1);
  assert.equal(compare(frac(2, 3), frac(3, 4)), -1);
  assert.equal(compare(frac(5, 4), frac(1, 1)), 1);
});

test('sumar con partición común; el error de Punto da menos que un sumando', () => {
  assert.deepEqual(add(frac(1, 2), frac(1, 3)), frac(5, 6));
  const wrong = naiveAdd(frac(1, 2), frac(1, 3));
  assert.deepEqual(wrong, frac(2, 5));
  assert.equal(compare(wrong, frac(1, 2)), -1);
});

test('medio exige partes iguales', () => {
  assert.ok(isHalf(0.5));
  assert.ok(!isHalf(0.4));
});

test('decimales: 2,5 = 5/2 y 2,05 = 41/20 no son lo mismo', () => {
  assert.deepEqual(decimal('2,5'), frac(5, 2));
  assert.deepEqual(decimal('2,05'), frac(41, 20));
  assert.ok(!equivalent(decimal('2,5'), decimal('2,05')));
});

test('el 50 % de 80 y el 80 % de 50 dan lo mismo', () => {
  assert.equal(percentOf(50, 80), 40);
  assert.equal(percentOf(80, 50), 40);
});

test('la diagonal del cuadrado: ninguna partición probada la mide exacta; las aproximaciones se acercan', () => {
  assert.equal(diagonalFits(2000), null);
  const d = Math.SQRT2;
  const a = measureWith(d, 10), b = measureWith(d, 100), c = measureWith(d, 1000);
  assert.equal(a.parts, 14);
  assert.equal(b.parts, 141);
  assert.equal(c.parts, 1414);
  assert.ok(d - c.lo < d - b.lo && d - b.lo < d - a.lo);
  assert.ok(!a.exact && !b.exact && !c.exact);
});
