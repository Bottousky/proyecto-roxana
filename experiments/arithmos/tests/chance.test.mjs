import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pulls, shareFull, mean, median, range, outfits, diceSums, rollTwo} from '../src/logic/chance.js';

test('la proporción de baldes llenos se acerca a 2/3 con muchos casos', () => {
  const xs = pulls(1000);
  assert.ok(Math.abs(shareFull(xs, 1000) - 2 / 3) < 0.05);
  // con pocos casos puede estar lejos
  const few = [10, 100, 1000].map(k => shareFull(xs, k));
  assert.ok(few.every(v => v >= 0 && v <= 1));
});

test('promedio y mediana con una familia que tiene muchísimos', () => {
  const xs = [3, 4, 4, 5, 34];
  assert.equal(mean(xs), 10);
  assert.equal(median(xs), 4);
});

test('mismo promedio, distinto rango', () => {
  const a = [5, 5, 6, 4, 5], b = [1, 9, 2, 8, 5];
  assert.equal(mean(a), mean(b));
  assert.ok(range(b) > range(a));
});

test('contar sin contar', () => {
  assert.equal(outfits(3, 2), 6);
  assert.equal(outfits(3, 2, 4), 24);
});

test('dos dados: el 7 sale de 6 maneras; el 12, de una', () => {
  const c = diceSums();
  assert.equal(c[7], 6);
  assert.equal(c[12], 1);
  assert.equal(Object.values(c).reduce((a, b) => a + b, 0), 36);
  const r = rollTwo(3600);
  const f7 = r.filter(x => x === 7).length / r.length, f12 = r.filter(x => x === 12).length / r.length;
  assert.ok(f7 > 3 * f12);
});
