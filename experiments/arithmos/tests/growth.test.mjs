import {test} from 'node:test';
import assert from 'node:assert/strict';
import {power, powerTable, sideOf, race, overtakeDay, sci, expand, factor, completeSquare, timesToReach, factorsOfProduct, factorsOfPower, exactRoot} from '../src/logic/growth.js';

test('potencias: contar factores; hacia atrás, dividir', () => {
  assert.equal(power(2, 3), 8);
  assert.equal(power(2, 0), 1);
  assert.equal(power(2, -1), 0.5);
  assert.deepEqual(powerTable(2, -1, 3).map(r => r.v), [0.5, 1, 2, 4, 8]);
});

test('juntar factores: 2³ · 2² = 2⁵; (2³)² = 2⁶; 2³ + 2² no es 2⁵', () => {
  const prod = factorsOfProduct(2, 3, 2);
  assert.equal(prod.length, 5);
  assert.equal(prod.reduce((a, b) => a * b, 1), power(2, 5));
  assert.equal(power(2, 3) * power(2, 2), 32);
  const rep = factorsOfPower(2, 3, 2);
  assert.equal(rep.length, 6);
  assert.equal(power(power(2, 3), 2), power(2, 6));
  assert.notEqual(power(2, 3) + power(2, 2), power(2, 5));
  assert.equal(power(2, 3) + power(2, 2), 12);
});

test('raíz cúbica: un cubo de 64 bloques tiene lado 4; 64 también es 8 · 8', () => {
  assert.equal(exactRoot(64, 3), 4);
  assert.equal(exactRoot(64, 2), 8);
  assert.equal(exactRoot(27, 3), 3);
  assert.equal(exactRoot(30, 3), null);
  assert.equal(power(2, 6), power(8, 2));
  assert.equal(power(2, 6), power(4, 3));
});

test('el lado de un cuadrado: área 9 → 3 exacto; área 2 → entre 1,41 y 1,42', () => {
  assert.deepEqual(sideOf(9), {lo: 3, hi: 3, exact: true});
  const r = sideOf(2);
  assert.equal(r.lo, 1.41);
  assert.equal(r.hi, 1.42);
  assert.equal(r.exact, false);
  assert.ok(r.lo * r.lo < 2 && r.hi * r.hi > 2);
});

test('sumar 10 por día contra duplicar, desde 1: duplicar pasa adelante el día 6', () => {
  const t = race(1, 10, 2, 8);
  assert.deepEqual(t[5], {day: 5, add: 51, mul: 32});
  assert.deepEqual(t[6], {day: 6, add: 61, mul: 64});
  assert.equal(overtakeDay(1, 10, 2), 6);
});

test('notación científica', () => {
  assert.deepEqual(sci(3000000), {m: 3, e: 6});
  assert.deepEqual(sci(0.00025), {m: 2.5, e: -4});
});

test('(x + 2)(x + 3) son x² + 5x + 6; al revés, se arma el rectángulo; con +5 no cierra', () => {
  assert.deepEqual(expand(2, 3), {x2: 1, x: 5, one: 6});
  assert.deepEqual(factor(5, 6), {p: 2, q: 3});
  assert.equal(factor(5, 5), null);
});

test('completar el cuadrado: x² + 2x = 8 → x = 2 o x = −4', () => {
  const r = completeSquare(2, 8);
  assert.equal(r.square, 9);
  assert.deepEqual(r.roots, [2, -4]);
  for (const x of r.roots) assert.equal(x * x + 2 * x, 8);
});

test('¿cuántas duplicaciones para pasar 1000? diez (512 < 1000 < 1024)', () => {
  const r = timesToReach(2, 1000);
  assert.equal(r.k, 10);
  assert.equal(r.below, 512);
  assert.equal(r.above, 1024);
  assert.ok(r.log > 9.9 && r.log < 10);
});
