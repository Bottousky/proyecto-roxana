import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lin, expr, eq, solutions, sameSolutions, solveLinear, addBoth, mulBoth, divBoth, addOne, squareBoth, divBothByExpr, passWrong, reversible} from '../src/logic/equations.js';

test('x − 3 = 5: sumar 3 a los dos miembros conserva la solución y deja x = 8', () => {
  const e = eq(lin(1, -3), lin(0, 5));
  const t = addBoth(e, 3);
  assert.deepEqual(solveLinear(e), {kind: 'one', x: 8});
  assert.deepEqual(solveLinear(t), {kind: 'one', x: 8});
  assert.equal(t.L.text, 'x');
  assert.equal(t.R.text, '8');
  assert.ok(sameSolutions(e, t));
});

test('un camino alternativo: restar 5 a los dos y después sumar 8', () => {
  const e = eq(lin(1, -3), lin(0, 5));
  const t = addBoth(addBoth(e, -5), 8);
  assert.ok(sameSolutions(e, t));
});

test('aplicar algo a un solo miembro cambia las soluciones', () => {
  const e = eq(lin(1, -3), lin(0, 5));
  assert.ok(!sameSolutions(e, addOne(e, 'L', 3)));
});

test('"pasa restando" con el signo equivocado cambia la solución', () => {
  const e = eq(lin(1, 3), lin(0, 5)); // x + 3 = 5 → x = 2
  const wrong = passWrong(e, 3); // x = 5 + 3
  assert.deepEqual(solveLinear(wrong), {kind: 'one', x: 8});
  assert.ok(!sameSolutions(e, wrong));
});

test('multiplicar por 0 aplasta: aparecen soluciones falsas y no se puede deshacer', () => {
  const e = eq(lin(1, -3), lin(0, 5));
  const z = mulBoth(e, 0);
  assert.deepEqual(solveLinear(z), {kind: 'all'});
  assert.ok(!reversible({kind: 'mul', k: 0}));
  assert.ok(reversible({kind: 'mul', k: 2}));
});

test('elevar al cuadrado puede agregar soluciones: x = 3 → x² = 9 tiene también −3', () => {
  const e = eq(lin(1, 0), lin(0, 3));
  const sq = squareBoth(e);
  assert.deepEqual(solutions(e), [3]);
  assert.deepEqual(solutions(sq), [-3, 3]);
});

test('dividir por una expresión que puede valer 0 pierde soluciones: dividir x² = x por x pierde el 0', () => {
  const x = expr(v => v * v, 'x²');
  const e = eq(x, lin(1, 0));
  assert.deepEqual(solutions(e), [0, 1]);
  const d = divBothByExpr(e, lin(1, 0));
  assert.deepEqual(solutions(d), [1]);
});

test('dividir por 0 no está definido', () => {
  assert.equal(divBoth(eq(lin(1, 0), lin(0, 3)), 0).defined, false);
});

test('multiplicar una desigualdad por un negativo invierte el orden: −2x < 6 ⇔ x > −3', () => {
  const e = eq(lin(-2, 0), lin(0, 6), '<');
  const ok = divBoth(e, -2);
  assert.equal(ok.rel, '>');
  assert.ok(sameSolutions(e, ok));
  const noFlip = divBoth(e, -2, {flip: false});
  assert.ok(!sameSolutions(e, noFlip));
});

test('dos pasos: 2x + 1 = 7 (deshacer en orden inverso) y la incógnita a la derecha: 3 = x / 4', () => {
  const e = eq(lin(2, 1), lin(0, 7));
  const t = divBoth(addBoth(e, -1), 2);
  assert.deepEqual(solveLinear(t), {kind: 'one', x: 3});
  const r = eq(lin(0, 3), lin(1 / 4, 0));
  assert.deepEqual(solveLinear(mulBoth(r, 4)), {kind: 'one', x: 12});
});

test('las fracciones se escriben exactas y sin ambigüedad', () => {
  const e = divBoth(eq(lin(0, 3), lin(1 / 4, 0)), 4);
  assert.equal(e.R.text, 'x/16');
  assert.equal(e.L.text, '3/4');
  assert.equal(lin(1 / 2, 1 / 4).text, 'x/2 + 1/4');
  assert.equal(lin(3 / 4, 0).text, '3x/4');
});
