import assert from 'node:assert/strict';
import {
  EMPUJE_TALLER,
  PIEDRAS,
  caudal,
  leerLamparaEterna,
  piedrasQueResuelven,
} from '../src/puzzles/frenoModel.ts';

/* ---------- la fuente del taller no se elige ---------- */

assert.equal(EMPUJE_TALLER, 8, 'el empuje del taller de Lumen es fijo');
assert.equal(caudal(8, 4), 2);

/* ---------- cada piedra deja la lámpara en un estado ---------- */

assert.deepEqual(
  ['rajada', 'roja', 'amarilla', 'gris'].map((key) => {
    const { caudal: valor, estado } = leerLamparaEterna(key);
    return [key, valor, estado];
  }),
  [
    ['rajada', 8, 'fusible'],
    ['roja', 4, 'caliente'],
    ['amarilla', 2, 'justo'],
    ['gris', 1, 'debil'],
  ],
  'con empuje 8: la rajada quema, la roja arde, la amarilla es la justa y la gris apenas alumbra',
);

assert.equal(leerLamparaEterna('amarilla').resuelve, true);
assert.equal(leerLamparaEterna('roja').resuelve, false);
assert.deepEqual(piedrasQueResuelven(), ['amarilla'], 'una sola piedra deja la luz firme');
assert.throws(() => leerLamparaEterna('esmeralda'), /Piedra desconocida/);

/* ---------- el color nunca es el único canal ---------- */
// Regla 1 de docs/arco1/IDENTITY.md: el estado nunca se comunica sólo por color.
// Cada piedra tiene además cifra y cuerpo, y las dos siguen al freno.

for (const [key, def] of Object.entries(PIEDRAS)) {
  assert.equal(def.valor, def.codigo, `${key}: la cifra del código es el freno`);
  assert.ok(
    ['chico', 'medio', 'grande'].includes(def.cuerpo),
    `${key}: tiene cuerpo declarado`,
  );
}

const porCuerpo = ['marron', 'roja', 'amarilla', 'gris'].map((key) => PIEDRAS[key].cuerpo);
assert.deepEqual(
  porCuerpo,
  ['chico', 'chico', 'medio', 'grande'],
  'más freno, más cuerpo: se distinguen sin mirar el color',
);

// Las cuatro piedras del código son distinguibles entre sí sin usar el color.
const firmas = new Set(
  ['marron', 'roja', 'amarilla', 'gris'].map((key) => `${PIEDRAS[key].cuerpo}:${PIEDRAS[key].codigo}`),
);
assert.equal(firmas.size, 4, 'cuerpo y cifra alcanzan para decirlas aparte');

// La rajada comparte código con la marrón: lo que la distingue es la raja, no el color.
assert.equal(PIEDRAS.rajada.codigo, PIEDRAS.marron.codigo);
assert.equal(PIEDRAS.rajada.rajada, true);

console.log('M20 modelo del freno: OK (4 piedras, una justa, canales redundantes al color)');
