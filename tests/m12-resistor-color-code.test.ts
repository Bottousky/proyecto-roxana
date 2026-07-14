import assert from 'node:assert/strict';
import {
  RESISTOR_DIGIT_COLORS,
  RESISTOR_METALLIC_BANDS,
  resistorColorByDigit,
} from '../src/shared/resistorColorCode.ts';

assert.deepEqual(
  RESISTOR_DIGIT_COLORS.map(({ label, digit }) => [label, digit]),
  [
    ['Negro', 0],
    ['Marrón', 1],
    ['Rojo', 2],
    ['Naranja', 3],
    ['Amarillo', 4],
    ['Verde', 5],
    ['Azul', 6],
    ['Violeta', 7],
    ['Gris', 8],
    ['Blanco', 9],
  ],
  'la referencia debe seguir el código estándar de cifras de resistores',
);

assert.equal(resistorColorByDigit(1).id, 'marron');
assert.equal(resistorColorByDigit(2).id, 'rojo');
assert.equal(resistorColorByDigit(4).id, 'amarillo');
assert.equal(resistorColorByDigit(8).id, 'gris');

assert.deepEqual(
  RESISTOR_METALLIC_BANDS.map(({ label, multiplier, tolerance }) => [
    label,
    multiplier,
    tolerance,
  ]),
  [
    ['Oro', '×0,1', '±5%'],
    ['Plata', '×0,01', '±10%'],
  ],
  'oro y plata deben quedar documentados como bandas especiales, no cifras',
);

console.log('m12-resistor-color-code.test.ts: OK');
