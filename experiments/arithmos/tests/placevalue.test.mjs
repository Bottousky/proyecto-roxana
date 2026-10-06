import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addLoose, normalize, value, toNumeral, fromNumeral, dropZeros, differenceByPairing} from '../src/logic/placevalue.js';

test('37 sueltos se guardan como 3 atados y 7 sueltos', () => {
  const r = addLoose([0], 37);
  assert.deepEqual(r.rooms, [7, 3]);
  assert.equal(r.carries.length, 3);
  assert.equal(toNumeral(r.rooms), '37');
});

test('"me llevo uno": 23 + 19 canjea una vez', () => {
  const a = addLoose([0], 23).rooms;
  const r = addLoose(a, 19);
  assert.equal(value(r.rooms), 42);
  assert.equal(toNumeral(r.rooms), '42');
  assert.ok(r.carries.some(c => c.from === 0 && c.to === 1));
});

test('el cero guarda el lugar vacío del medio', () => {
  assert.equal(toNumeral([2, 0, 3]), '302');
  assert.deepEqual(fromNumeral('302'), [2, 0, 3]);
  assert.equal(value(fromNumeral('302')), 302);
  assert.equal(dropZeros('302'), '32');
  assert.equal(value(fromNumeral(dropZeros('302'))), 32);
});

test('ninguno se escribe 0', () => {
  assert.equal(toNumeral([0]), '0');
  assert.equal(toNumeral([0, 0]), '0');
});

test('canje en cadena: 99 + 1 = 100', () => {
  const r = addLoose([9, 9], 1);
  assert.deepEqual(r.rooms, [0, 0, 1]);
  assert.equal(toNumeral(r.rooms), '100');
});

test('restar emparejando, con desatar: 52 − 37 = 15', () => {
  const r = differenceByPairing(fromNumeral('52'), fromNumeral('37'));
  assert.equal(value(r.rooms), 15);
  assert.ok(r.steps.some(s => s.untie === 1));
});

test('desatar a través de un cuarto vacío: 302 − 7 = 295', () => {
  const r = differenceByPairing(fromNumeral('302'), fromNumeral('7'));
  assert.equal(value(r.rooms), 295);
});

test('si el primero es menor no hay diferencia natural', () => {
  assert.equal(differenceByPairing([3], [5]), null);
});

test('otra base: agrupar de a cinco', () => {
  const r = addLoose([0], 14, 5);
  assert.deepEqual(r.rooms, [4, 2]);
  assert.equal(value(r.rooms, 5), 14);
});

test('normalize no altera el valor', () => {
  for (const n of [0, 1, 9, 10, 11, 99, 100, 1234]) {
    assert.equal(value(normalize([n]).rooms), n);
  }
});
