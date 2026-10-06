import {test} from 'node:test';
import assert from 'node:assert/strict';
import {combine, removeDebts, removeHaves, distance, abs, signed, valueOf} from '../src/logic/integers.js';

test('tener 2 y deber 3: se anulan 2 pares y queda una deuda', () => {
  assert.deepEqual(combine(2, 3), {pairs: 2, haves: 0, debts: 1, value: -1});
});

test('juntar no cambia el valor, sólo borra pares', () => {
  for (const [h, d] of [[0, 0], [5, 0], [0, 4], [3, 3], [7, 2]]) assert.equal(combine(h, d).value, h - d);
});

test('perdonar 2 deudas a quien debe 1: hay que agregar un par cero; queda +1', () => {
  const r = removeDebts({haves: 0, debts: 1}, 2);
  assert.equal(r.added, 1);
  assert.equal(r.value, 1);
  assert.equal(valueOf(r), -1 - (-2));
});

test('quitar deudas sube el valor tanto como deudas se quitan', () => {
  for (const [h, d, n] of [[0, 0, 3], [2, 5, 2], [4, 1, 6]]) {
    assert.equal(removeDebts({haves: h, debts: d}, n).value, (h - d) + n);
  }
});

test('quitar palitos que no están también usa pares cero: 1 − 3 = −2', () => {
  const r = removeHaves({haves: 1, debts: 0}, 3);
  assert.equal(r.added, 2);
  assert.equal(r.value, -2);
});

test('distancia sin signo y opuestos a la misma distancia del cero', () => {
  assert.equal(distance(4, -3), 7);
  assert.equal(distance(-3, 4), 7);
  assert.equal(abs(-3), abs(3));
});

test('escritura con signo', () => {
  assert.equal(signed(-3), '−3');
  assert.equal(signed(3), '+3');
  assert.equal(signed(0), '0');
});
