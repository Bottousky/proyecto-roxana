import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groups, rectangle, scale, share, measure, split} from '../src/logic/times.js';

test('cuatro grupos de tres deudas: −12', () => {
  assert.equal(groups(4, -3).total, -12);
  assert.equal(groups(4, 3).total, 12);
});

test('girar el rectángulo no cambia el total', () => {
  const r = rectangle(4, 3);
  assert.equal(r.total, r.turned.total);
  assert.deepEqual([r.turned.rows, r.turned.cols], [3, 4]);
});

test('estirar ×2 aleja del cero; ×(−1) refleja; dos reflejos vuelven', () => {
  assert.equal(scale(-3, 2), -6);
  assert.equal(scale(3, -1), -3);
  assert.equal(scale(scale(3, -1), -1), 3);
  assert.equal(scale(5, 1), 5);
  assert.equal(scale(5, 0), 0);
});

test('repartir 14 entre 4: 3 cada uno y sobran 2', () => {
  assert.deepEqual(share(14, 4), {defined: true, each: 3, rest: 2});
  assert.deepEqual(share(12, 4), {defined: true, each: 3, rest: 0});
});

test('medir 12 en bolsas de 3: 4 bolsas', () => {
  assert.deepEqual(measure(12, 3), {defined: true, bags: 4, rest: 0});
});

test('repartir y medir son inversas de multiplicar', () => {
  for (const [n, k] of [[4, 3], [5, 2], [7, 6]]) {
    assert.equal(share(n * k, n).each, k);
    assert.equal(measure(n * k, k).bags, n);
  }
});

test('dividir por cero no está definido (ni repartir ni medir)', () => {
  assert.equal(share(12, 0).defined, false);
  assert.equal(measure(12, 0).defined, false);
});

test('distributiva: 4 × 5 = 4 × 3 + 4 × 2', () => {
  const r = split(4, 3, 2);
  assert.equal(r.whole, r.sum);
  assert.deepEqual(r.parts, [12, 8]);
});
