import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * El mapeo de anclajes del VS01 vive en `u1Anchors.ts` y debe ser **exhaustivo** sobre
 * las tres evidencias que el slice declara. Si el beat pide una evidencia y no hay
 * anclaje que la cubra, el puzzle está incompleto: este test atrapa esa regresión antes
 * de que llegue al navegador.
 *
 * Se lee el fuente en vez de importarlo porque `u1Anchors.ts` arrastra a `rooms.ts`,
 * que arrastra la UI de puzzles y la Bitácora, que tocan el DOM al importarse.
 * Mismo patrón que `u1-anclajes-hd2d.test.ts` y `r1-grafo-de-salas.test.ts`.
 */

const anchorsSource = readFileSync(
  new URL('../src/ohmdal/content/u1Anchors.ts', import.meta.url),
  'utf8',
);

// Extrae las tres claves y las tres evidencias del bloque VS_EVIDENCE_BY_ANCHOR.
// El bloque se reconoce por su firma literal en el fuente: cualquier cambio de nombre
// debe venir con un cambio acá.
const block = anchorsSource.match(/VS_EVIDENCE_BY_ANCHOR[\s\S]*?\n\};/);
assert(block !== null, 'el bloque VS_EVIDENCE_BY_ANCHOR existe en u1Anchors.ts');
const mappingEntries = [...(block![0].matchAll(/'([a-z0-9-]+)':\s*'([a-z0-9-]+)'/g))];
const declared = new Map(mappingEntries.map(([, anchor, evidence]) => [anchor, evidence]));

// Las tres evidencias del beat VS01 son las del modelo de observación.
const PLAZA_EVIDENCES = ['campana-sin-respuesta', 'trazas-de-cobre', 'agua-detenida'] as const;

const declaredEvidence = new Set(declared.values());
assert.equal(declaredEvidence.size, PLAZA_EVIDENCES.length, 'cada evidencia del beat tiene al menos un anclaje');
for (const evidence of PLAZA_EVIDENCES) {
  assert.ok(declaredEvidence.has(evidence), `la evidencia ${evidence} tiene un anclaje del VS01`);
}

// Los anclajes declarados son anclajes reales del mapa —no strings al azar—.
const knownAnchors = new Set([
  ...anchorsSource.matchAll(/id: '([a-z0-9-]+)',\s*\n\s*position:/g),
].map(([, id]) => id));

for (const anchor of declared.keys()) {
  assert.ok(knownAnchors.has(anchor), `el anclaje declarado ${anchor} existe en U1_ANCHORS`);
}

// Cada anclaje del VS01 vive en una sala accesible. Hoy: campana y portal-aula en la
// Plaza, mirador-manantial en el Manantial.
const campanaPlaza = declared.get('campana') === 'campana-sin-respuesta';
const portalPlaza = declared.get('portal-aula') === 'trazas-de-cobre';
const aguaManantial = declared.get('mirador-manantial') === 'agua-detenida';
assert.ok(campanaPlaza && portalPlaza && aguaManantial, 'el mapa VS01 cubre las tres evidencias en sus salas respectivas');

console.log(
  `M24 anclajes VS01: OK (${declared.size} anclajes → ${declaredEvidence.size} evidencias del beat)`,
);
