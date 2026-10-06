import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isFunction, inverse, rulesMatching, passesVerticalTest, SHAPES, domainOf, imageOf} from '../src/logic/functions.js';

const SOMBRA = [[8, 4], [10, 2], [12, 1], [14, 2], [16, 4]];

test('la sombra depende de la hora, pero la hora no depende sólo de la sombra', () => {
  assert.equal(isFunction(SOMBRA).ok, true);
  const inv = isFunction(inverse(SOMBRA));
  assert.equal(inv.ok, false);
  assert.deepEqual(inv.bad.sort(), [2, 4]);
});

test('la regla se descubre con los casos vistos', () => {
  assert.deepEqual(rulesMatching([[1, 3]]).sort(), ['double1', 'triple'].sort());
  assert.deepEqual(rulesMatching([[1, 3], [2, 5]]), ['double1']);
});

test('recta parada: la recta y la parábola pasan; el círculo y la parábola acostada no', () => {
  const xs = Array.from({length: 13}, (_, i) => -3 + i * 0.5);
  assert.equal(passesVerticalTest(SHAPES.line, xs), true);
  assert.equal(passesVerticalTest(SHAPES.parabola, xs), true);
  assert.equal(passesVerticalTest(SHAPES.circle, xs), false);
  assert.equal(passesVerticalTest(SHAPES.sideways, xs), false);
});

test('dominio e imagen', () => {
  const xs = [-2, -1, 0, 1, 2, 3, 4];
  assert.deepEqual(domainOf(x => 1 / (x - 2), xs), [-2, -1, 0, 1, 3, 4]);
  assert.deepEqual(imageOf(x => x * x, xs), [0, 1, 4, 9, 16]);
});
