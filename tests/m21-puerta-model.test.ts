import assert from 'node:assert/strict';
import {
  CAUDAL_JUSTO,
  FUENTES,
  PIEDRAS_PUERTA,
  fuentePorKey,
  leerPuerta,
  paresQueAbren,
} from '../src/puzzles/puertaModel.ts';

/* ---------- hace falta elegir las dos cosas ---------- */

assert.deepEqual(leerPuerta(null, null), { caudal: null, estado: 'incompleto', abre: false });
assert.equal(leerPuerta('brasa', null).estado, 'incompleto');
assert.equal(leerPuerta(null, 'roja').estado, 'incompleto');

/* ---------- tres pares distintos dan el mismo caudal: eso es el puzzle ---------- */

const abren = paresQueAbren();
assert.deepEqual(
  abren.map(([fuente, piedra]) => `${fuente}/${piedra}`),
  ['brasa/roja', 'corazon/amarilla', 'tormenta/gris'],
  'la proporción se descubre con las manos: tres pares, un solo caudal',
);
assert.ok(abren.length >= 2, 'validación por condición, nunca por solución fija');

for (const [fuenteKey, piedraKey] of abren) {
  const lectura = leerPuerta(fuenteKey, piedraKey);
  assert.equal(lectura.abre, true);
  assert.equal(lectura.caudal, CAUDAL_JUSTO, `${fuenteKey}/${piedraKey} da el caudal justo`);
}

// Y cada fuente participa de exactamente una solución: ninguna es un adorno.
assert.deepEqual(
  FUENTES.map(({ key }) => abren.filter(([fuente]) => fuente === key).length),
  [1, 1, 1],
);

/* ---------- los estados que no abren ---------- */

assert.deepEqual(
  [
    leerPuerta('tormenta', 'marron').estado, // 16 → se inmola el fusible
    leerPuerta('corazon', 'roja').estado, //    4 → arde caliente
    leerPuerta('brasa', 'gris').estado, //    0,5 → llega cansado
  ],
  ['fusible', 'caliente', 'debil'],
);

// El umbral del fusible es estricto: 4 exacto todavía es calor, no sobrecarga.
assert.equal(leerPuerta('corazon', 'roja').caudal, 4);
assert.equal(leerPuerta('corazon', 'roja').estado, 'caliente');

/* ---------- la rajada no entra en el engaste de la Puerta ---------- */

assert.ok(!PIEDRAS_PUERTA.includes('rajada'), 'la piedra rajada se quedó en el taller');
assert.equal(PIEDRAS_PUERTA.length, 4);

assert.equal(fuentePorKey('corazon').valor, 8);
assert.throws(() => fuentePorKey('brisa'), /Fuente desconocida/);
assert.throws(() => leerPuerta('brasa', 'esmeralda'), /Piedra desconocida/);

console.log('M21 modelo de la Puerta: OK (3 pares válidos, 4 estados, umbrales verificados)');
