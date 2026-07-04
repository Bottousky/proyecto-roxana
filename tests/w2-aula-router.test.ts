import { parseAulaHash } from '../src/landing/aulaRouter.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
  }
}

// Caso 1: hash válido de aula abierta
equal(parseAulaHash('#aula/electronica'), 'electronica', 'aula valida: electronica');

// Caso 2: hash de otra sección
equal(parseAulaHash('#hall'), null, 'otra seccion: hall');

// Caso 3: hash vacío
equal(parseAulaHash(''), null, 'hash vacio');

// Caso 4: hash malformado
equal(parseAulaHash('#aula/'), null, 'hash malformado: sin id');
equal(parseAulaHash('#aula'), null, 'hash malformado: sin slash');
equal(parseAulaHash('#aula/no-existe'), null, 'hash malformado: aula inexistente');
equal(parseAulaHash('#aula/electronica/extra'), null, 'hash malformado: partes de mas');

console.log('W2 aula router tests: OK');
