import assert from 'node:assert/strict';

import { BitacoraManager } from '../src/experiences/ohmdal-plaza/journal/bitacora.ts';
import { createInitialCircuit, solveCircuit } from '../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts';
import {
  calibrateLighthouse,
  configureCastleNetwork,
  createArc1GreyboxState,
  documentCastleNetwork,
  documentForgeTerraces,
  documentLighthouse,
  energizeCastleNetwork,
  energizeForgeTerraces,
  energizeLighthouse,
  energizeManantial,
  measureCastleNetwork,
  measureForgeTerraces,
  measureLighthouse,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairManantial,
  setForgeTerracesAllocation,
  setForgeTerracesConductor,
  setForgeTerracesProtection,
  setManantialGate,
  synchronizeLighthouse,
  tryEnterArc1Region,
  type Arc1GreyboxState,
  type CastleNetworkConfiguration,
} from '../src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts';
import {
  ARC1_SAVE_MAX_MEASUREMENTS,
  ARC1_SAVE_MAX_SERIALIZED_LENGTH,
  applyArc1CircuitSave,
  captureArc1CircuitState,
  compactArc1StateForSave,
  createArc1SaveData,
  parseArc1SaveData,
  serializeArc1SaveData,
  writeArc1Save,
  readArc1Save,
} from '../src/experiences/ohmdal-playcanvas/systems/campaign/arc1Save.ts';

const parallelConfiguration: CastleNetworkConfiguration = {
  topology: 'parallel',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'parallel', priority: 'support', protectionRating: 2 },
  },
};

function enter(state: Arc1GreyboxState, region: Parameters<typeof tryEnterArc1Region>[1]): Arc1GreyboxState {
  const result = tryEnterArc1Region(state, region);
  assert.equal(result.accepted, true, `la ruta debe permitir ${region}`);
  return result.state;
}

function restoreArc1(): Arc1GreyboxState {
  let state = createArc1GreyboxState();
  state = enter(state, 'taller');
  state = enter(state, 'manantial');
  state = measureManantial(state, 'generator');
  state = setManantialGate(state, true);
  state = repairManantial(energizeManantial(state));
  state = energizeManantial(state);
  state = measureManantial(state, 'load');
  state = enter(state, 'plaza');
  state = pullCampana(state);
  state = openCastleGate(state);
  state = enter(state, 'castillo');
  state = configureCastleNetwork(state, parallelConfiguration);
  state = measureCastleNetwork(state);
  state = energizeCastleNetwork(state);
  state = documentCastleNetwork(state);
  state = enter(state, 'forja');
  state = enter(state, 'terrazas');
  state = setForgeTerracesAllocation(state, { forge: 5, terraces: 3 });
  state = setForgeTerracesConductor(state, 'medium');
  state = setForgeTerracesProtection(state, 'forge', 5);
  state = setForgeTerracesProtection(state, 'terraces', 3);
  state = measureForgeTerraces(state);
  state = energizeForgeTerraces(state);
  state = documentForgeTerraces(state);
  state = measureLighthouse(state);
  state = calibrateLighthouse(state, { voltageTrim: 0, phaseOffset: 0 });
  state = energizeLighthouse(state);
  state = synchronizeLighthouse(state);
  state = synchronizeLighthouse(state);
  state = documentLighthouse(state);
  return state;
}

function initialCircuitSave() {
  const circuit = createInitialCircuit();
  const saved = captureArc1CircuitState(circuit);
  assert.ok(saved, 'el circuito canónico debe producir una fuente de guardado válida');
  return saved;
}

function initialBitacoraSave() {
  const bitacora = new BitacoraManager();
  bitacora.unlock('taller_lumen', 'investigating');
  return bitacora.getStatuses();
}

function makeSave(state: Arc1GreyboxState, storyStep = 'portal_arrived' as const) {
  return createArc1SaveData({
    storyStep,
    ohmAwake: storyStep !== 'portal_arrived',
    inventory: { jumper: storyStep !== 'portal_arrived', brush: storyStep !== 'portal_arrived' },
    arc1: state,
    circuit: initialCircuitSave(),
    bitacora: initialBitacoraSave(),
    safeAnchor: { zone: 'plaza', anchorId: 'portal-to-plaza' },
    b2: { coveredIds: storyStep === 'portal_arrived' ? ['g1'] : ['g1', 'g5', 'g4'] },
  });
}

// Full source state survives a round trip without serializing derived progress.
let complete = restoreArc1();
complete = enter(complete, 'faro');
complete = enter(complete, 'retorno');
complete = enter(complete, 'portal');
const completeSave = createArc1SaveData({
  storyStep: 'arc1_complete',
  ohmAwake: true,
  inventory: { jumper: true, brush: true },
  arc1: complete,
  circuit: (() => {
    const circuit = createInitialCircuit();
    circuit.branches.b_ida_rele.state = 'closed';
    circuit.branches.b_brecha_retorno.state = 'closed';
    circuit.branches.b_brecha_a_oxido.state = 'closed';
    circuit.branches.b_brecha_a_oxido.resistance = 0.05;
    solveCircuit(circuit);
    return captureArc1CircuitState(circuit)!;
  })(),
  bitacora: initialBitacoraSave(),
  safeAnchor: { zone: 'plaza', anchorId: 'castle-to-plaza' },
  b2: { coveredIds: ['g1', 'g5', 'g4'] },
});
const completeRoundTrip = parseArc1SaveData(serializeArc1SaveData(completeSave));
for (const coveredIds of [['unknown'], ['g3'], ['g1', 'g2', 'g4', 'g5'], ['g1', 'g2']]) {
  assert.equal(parseArc1SaveData(JSON.stringify({ ...completeSave, b2: { coveredIds } })), null,
    'Ohm despierto exige un circuito cerrado válido, sin terminales falsos ni exceso de puentes');
}
assert.deepEqual(completeRoundTrip, completeSave, 'la partida completa conserva todas las fuentes Arc1');
for (const points of [['feed', 'feed'], ['unknown'], ['feed']]) {
  const invalid = JSON.parse(serializeArc1SaveData(completeSave));
  invalid.arc1.lighthouse.verificationPoints = points;
  assert.equal(parseArc1SaveData(JSON.stringify(invalid)), null,
    'los puntos DC deben ser distintos, conocidos y coincidir con la evidencia contada');
}
const oldLighthouseSave = JSON.parse(serializeArc1SaveData(completeSave));
delete oldLighthouseSave.arc1.lighthouse.verificationPoints;
assert.ok(parseArc1SaveData(JSON.stringify(oldLighthouseSave)), 'se conserva compatibilidad con campañas v1 previas');
assert.equal('progress' in (completeRoundTrip?.arc1 ?? {}), false, 'el save no acepta progreso derivado');
assert.equal(completeRoundTrip?.circuit.branches.b_ida_rele, 'closed');
assert.equal(completeRoundTrip?.circuit.branches.b_brecha_a_oxido.resistance, 0.05);

// A partial game built through reducers is also valid and keeps its measured evidence.
let partial = createArc1GreyboxState();
partial = enter(partial, 'taller');
partial = enter(partial, 'manantial');
partial = measureManantial(partial, 'generator');
partial = setManantialGate(partial, true);
const partialSave = makeSave(partial);
const partialRoundTrip = parseArc1SaveData(serializeArc1SaveData(partialSave));
assert.deepEqual(partialRoundTrip, partialSave, 'una partida parcial conserva la evidencia de reducers');
assert.equal(partialRoundTrip?.arc1.currentRegion, 'manantial');
assert.equal(partialRoundTrip?.arc1.manantial.measurements.length, 1);

// Trusted capture bounds repeated observations while preserving Manantial proof.
let repeatedlyMeasured = createArc1GreyboxState();
repeatedlyMeasured = measureManantial(repeatedlyMeasured, 'generator');
repeatedlyMeasured = setManantialGate(repeatedlyMeasured, true);
repeatedlyMeasured = repairManantial(repeatedlyMeasured);
repeatedlyMeasured = energizeManantial(repeatedlyMeasured);
for (let index = 0; index < ARC1_SAVE_MAX_MEASUREMENTS + 12; index += 1) {
  repeatedlyMeasured = measureManantial(repeatedlyMeasured, 'load');
}
const compacted = compactArc1StateForSave(repeatedlyMeasured);
assert.equal(compacted.manantial.measurements.length, ARC1_SAVE_MAX_MEASUREMENTS, 'la historia queda acotada');
assert.equal(compacted.manantial.measurements.some((measurement) => measurement.beforeRepair), true, 'se conserva la prueba previa a reparar');
assert.equal(compacted.manantial.measurements.some((measurement) => !measurement.beforeRepair), true, 'se conserva la prueba posterior a reparar');
assert.doesNotThrow(() => makeSave(compacted), 'la captura confiable no falla después de observaciones repetidas');

// Parser rejects malformed JSON, invalid enums, derived/unknown keys and bad anchor pairs.
assert.equal(parseArc1SaveData('{not-json'), null);
const validObject = JSON.parse(serializeArc1SaveData(partialSave)) as Record<string, unknown>;
assert.equal(parseArc1SaveData(JSON.stringify({ ...validObject, unexpected: true })), null);
assert.equal(parseArc1SaveData(JSON.stringify({ ...validObject, storyStep: 'future-step' })), null);
assert.equal(parseArc1SaveData(JSON.stringify({
  ...validObject,
  safeAnchor: { zone: 'castle', anchorId: 'portal-to-plaza' },
})), null);
assert.equal(parseArc1SaveData(JSON.stringify({
  ...validObject,
  safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
})), null, 'el baseline no puede reanudar en Faro sin evidencia de ruta');
assert.equal(parseArc1SaveData(JSON.stringify({
  ...JSON.parse(serializeArc1SaveData(completeSave)),
  safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
})), null, 'un save terminale ne peut reprendre dans une zone avant le retour');
const derivedInjected = {
  ...validObject,
  arc1: { ...(validObject.arc1 as object), progress: {} },
};
assert.equal(parseArc1SaveData(JSON.stringify({ ...validObject, storyStep: 'returning' })), null,
  'la primera clase no puede reanudarse sin haber restaurado el Faro y comenzado el regreso');
assert.equal(parseArc1SaveData(JSON.stringify(derivedInjected)), null);
const invalidCircuit = {
  ...validObject,
  circuit: {
    branches: {
      ...((validObject.circuit as { branches: object }).branches),
      b_ida_rele: 'blown',
    },
  },
};
assert.equal(parseArc1SaveData(JSON.stringify(invalidCircuit)), null);
assert.equal(parseArc1SaveData('x'.repeat(ARC1_SAVE_MAX_SERIALIZED_LENGTH + 1)), null, 'el límite de tamaño se aplica antes de parsear');

// Storage privacy/quota errors are contained by the injectable adapter.
const storage = new Map<string, string>();
const adapter = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
};
assert.equal(writeArc1Save(adapter, partialSave), true);
assert.deepEqual(readArc1Save(adapter), partialSave);
const failingStorage = {
  getItem: () => { throw new Error('privacy denied'); },
  setItem: () => { throw new Error('quota exceeded'); },
};
assert.equal(readArc1Save(failingStorage), null);
assert.equal(writeArc1Save(failingStorage, partialSave), false);

// Bitácora returns detached data and ignores unknown/invalid restore entries.
const bitacora = new BitacoraManager();
const statuses = bitacora.getStatuses();
statuses.portal_origen = 'unknown';
assert.equal(bitacora.getRumors().portal_origen.status, 'discovered', 'getStatuses no expone el mapa interno');
bitacora.restoreStatuses({ portal_origen: 'rumor', forged_node: 'discovered', taller_lumen: 'invalid' });
assert.equal(bitacora.getRumors().portal_origen.status, 'rumor');
assert.equal(bitacora.getRumors().forged_node, undefined);
assert.equal(bitacora.getRumors().taller_lumen.status, 'unknown');

// Circuit hydration is a pure patch and solver output is derived afterwards.
const restoredCircuit = applyArc1CircuitSave(createInitialCircuit(), completeSave.circuit);
assert.ok(restoredCircuit);
assert.equal(restoredCircuit?.branches.b_ida_rele.state, 'closed');
assert.equal(restoredCircuit?.branches.b_brecha_retorno.state, 'closed');
assert.equal(restoredCircuit?.branches.b_brecha_a_oxido.resistance, 0.05);
assert.equal(createInitialCircuit().branches.b_ida_rele.state, 'open', 'aplicar el save no muta el baseline');
solveCircuit(restoredCircuit!);
assert.equal(restoredCircuit?.isComplete, true, 'el runtime puede resolver después de aplicar las ramas fuente');

console.log('Ohmdal Arc1 save: OK (roundtrip, partial, malformed, bounded and storage-safe)');
