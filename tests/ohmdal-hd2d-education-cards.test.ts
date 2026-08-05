import { EDUCATION_CARDS } from '../src/ohmdal/education/cards.ts';
import { EDUCATION_CARD_FIELDS } from '../src/ohmdal/education/types.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(EDUCATION_CARD_FIELDS.length, 30, 'contrato canónico tiene exactamente 30 campos');
equal(Object.keys(EDUCATION_CARDS).length, 6, 'se entregan exactamente seis fichas');

for (const [id, card] of Object.entries(EDUCATION_CARDS)) {
  const keys = Object.keys(card);
  equal(keys.length, 30, `${id}: exactamente 30 campos`);
  equal(keys.join('|'), EDUCATION_CARD_FIELDS.join('|'), `${id}: orden y nombres canónicos`);
  for (const field of EDUCATION_CARD_FIELDS) {
    equal(card[field].trim().length > 0, true, `${id}.${field}: contenido no vacío`);
  }
  equal(
    card.validationStatus.startsWith('V2 CANON-EDU'),
    true,
    `${id}: estado correcto`,
  );
  equal(card.validationStatus.includes('auditor independiente'), true, `${id}: registra segundo pase`);
  equal(card.identifierVersion.endsWith('-v2'), true, `${id}: identificador promovido`);
}

equal(
  EDUCATION_CARDS.circuit.revisedLogEntry.includes('calculé 20,00 mA'),
  true,
  'corrección benchmark: corriente calculada, no medida',
);
equal(
  EDUCATION_CARDS.safety.deterministicTest.includes('precondiciones completas'),
  true,
  'corrección benchmark: T05 explicita precondiciones',
);

console.log('Ohmdal HD-2D education card contract tests: OK');
