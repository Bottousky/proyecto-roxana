import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePairs, togglePair, readingIsConsistent} from '../src/logic/pairing.js';

const marks = Array.from({length: 12}, (_, i) => `m${i}`);
const dots = Array.from({length: 11}, (_, i) => `d${i}`);

test('emparejar 11 puntos con 12 marcas deja una marca libre: hay más marcas', () => {
  const links = dots.map((d, i) => [marks[i], d]);
  const r = evaluatePairs(marks, dots, links);
  assert.equal(r.verdict, 'left-more');
  assert.deepEqual(r.freeLeft, ['m11']);
  assert.deepEqual(r.freeRight, []);
});

test('cualquier orden de emparejamiento da el mismo veredicto', () => {
  const shuffled = dots.map((d, i) => [marks[(i * 5 + 3) % 12], d]);
  assert.equal(evaluatePairs(marks, dots, shuffled).verdict, 'left-more');
});

test('si sobran de los dos lados todavía no se puede concluir', () => {
  const r = evaluatePairs(marks, dots, [['m0', 'd0'], ['m1', 'd1']]);
  assert.equal(r.verdict, 'incomplete');
});

test('un punto unido a dos marcas invalida la correspondencia', () => {
  const links = dots.map((d, i) => [marks[i], d]);
  links.push(['m11', 'd3']);
  const r = evaluatePairs(marks, dots, links);
  assert.equal(r.verdict, 'invalid');
  assert.deepEqual(r.doubleRight, ['d3']);
});

test('una marca unida a dos puntos también es inválida', () => {
  const r = evaluatePairs(['a', 'b'], ['x', 'y'], [['a', 'x'], ['a', 'y']]);
  assert.equal(r.verdict, 'invalid');
  assert.deepEqual(r.doubleLeft, ['a']);
});

test('colecciones iguales: no sobra nada', () => {
  const all = [...dots, 'd11'];
  const r = evaluatePairs(marks, all, all.map((d, i) => [marks[i], d]));
  assert.equal(r.verdict, 'equal');
});

test('sobran sólo del lado derecho: el derecho tiene más', () => {
  const r = evaluatePairs(['a'], ['x', 'y'], [['a', 'y']]);
  assert.equal(r.verdict, 'right-more');
});

test('togglePair agrega y quita sin mutar', () => {
  const a = [];
  const b = togglePair(a, 'm0', 'd0');
  assert.deepEqual(a, []);
  assert.deepEqual(b, [['m0', 'd0']]);
  assert.deepEqual(togglePair(b, 'm0', 'd0'), []);
});

test('uniones con elementos desconocidos se rechazan', () => {
  assert.throws(() => evaluatePairs(['a'], ['x'], [['a', 'z']]));
});

test('sólo "falta uno" es coherente con una marca sobrante', () => {
  assert.equal(readingIsConsistent('missing', 'left-more'), true);
  assert.equal(readingIsConsistent('extra', 'left-more'), false);
  assert.equal(readingIsConsistent('mistake', 'left-more'), false);
});
