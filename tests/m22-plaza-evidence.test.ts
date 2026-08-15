import assert from 'node:assert/strict';
import {
  PLAZA_EVIDENCES,
  PLAZA_OBSERVATION,
  createPlazaObservation,
  hasObserved,
  isRecognizedOrder,
  markObservation,
  observationComplete,
  validObservationOrders,
  type PlazaEvidenceId,
} from '../src/puzzles/plazaEvidenceModel.ts';

/* ---------- el beat arranca vacío ---------- */

const empty = createPlazaObservation();
assert.equal(empty.observed.length, 0, 'el beat arranca sin observaciones registradas');
assert.equal(observationComplete(empty), false, 'sin observaciones, el beat está incompleto');
assert.deepEqual(
  PLAZA_EVIDENCES,
  ['campana-sin-respuesta', 'trazas-de-cobre', 'agua-detenida'],
  'las tres evidencias del beat VS01 son las que el slice declara',
);
assert.equal(PLAZA_OBSERVATION.required.length, 3, 'son tres, no dos ni cuatro');

/* ---------- idempotencia: marcar dos veces la misma no agrega duplicados ---------- */

const markedOnce = markObservation(empty, 'campana-sin-respuesta');
const markedTwice = markObservation(markedOnce, 'campana-sin-respuesta');
assert.equal(markedTwice.observed.length, 1, 'la segunda marca no apila');
assert.deepEqual(markedTwice.observed, ['campana-sin-respuesta']);
assert.equal(hasObserved(markedTwice, 'campana-sin-respuesta'), true);

/* ---------- los tres órdenes importan; ninguno es "canónico" ---------- */

const orders = validObservationOrders();
assert.equal(orders.length, 6, '3! permutaciones, todas aceptables (P07)');

for (const order of orders) {
  let progress = createPlazaObservation();
  for (const id of order) progress = markObservation(progress, id);
  assert.equal(observationComplete(progress), true, `orden ${order.join('→')} completa el beat`);
  assert.equal(isRecognizedOrder(progress), true, `orden ${order.join('→')} es uno de los reconocidos`);
}

/* ---------- dos evidencias no alcanzan ---------- */

let partial = createPlazaObservation();
partial = markObservation(partial, 'campana-sin-respuesta');
partial = markObservation(partial, 'trazas-de-cobre');
assert.equal(observationComplete(partial), false, 'faltando una, el beat sigue incompleto');
assert.equal(isRecognizedOrder(partial), false, 'una secuencia corta no es un orden reconocido');

/* ---------- los títulos son legibles, sin spoiler técnico ---------- */

for (const id of PLAZA_EVIDENCES) {
  const title = PLAZA_OBSERVATION.title(id);
  assert.ok(title.length > 0, `${id} tiene título`);
  const lower = title.toLowerCase();
  for (const banned of ['voltaje', 'corriente', 'resistencia', 'circuito', 'ley', 'ohm', 'kirchhoff']) {
    assert.ok(!lower.includes(banned), `${id}: "${title}" no contiene la palabra "${banned}"`);
  }
}

/* ---------- observación parcial ≠ observación completa (regla temporal de la Bitácora) ---------- */

// La Bitácora no se adelanta: con dos evidencias, la entrada existe como vivencial parcial.
// El sello de "completo" llega sólo cuando las tres están registradas. El modelo no escribe
// texto — eso lo hace `entries.ts` — pero sí expone la condición que la Bitácora consulta.
let twoOfThree = createPlazaObservation();
twoOfThree = markObservation(twoOfThree, 'campana-sin-respuesta');
twoOfThree = markObservation(twoOfThree, 'trazas-de-cobre');
assert.equal(observationComplete(twoOfThree), false, 'dos de tres no es completo');

const threeOfThree = markObservation(twoOfThree, 'agua-detenida');
assert.equal(observationComplete(threeOfThree), true, 'tres de tres sí es completo');

/* ---------- el modelo no muta ---------- */

const original = createPlazaObservation();
const next = markObservation(original, 'agua-detenida');
assert.equal(original.observed.length, 0, 'markObservation no muta el progreso que recibe');
assert.equal(next.observed.length, 1, 'el nuevo progreso sí registra la marca');

console.log('M22 modelo de observación de la Plaza: OK (3 evidencias, 6 órdenes, sin spoiler técnico)');
