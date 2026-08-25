import assert from 'node:assert/strict';

import {
  type Arc1GreyboxState,
  type CastleNetworkConfiguration,
  configureCastleNetwork,
  documentCastleNetwork,
  documentForgeTerraces,
  documentLighthouse,
  energizeCastleNetwork,
  energizeForgeTerraces,
  energizeLighthouse,
  energizeManantial,
  enterArc1Region,
  evaluateCastleNetwork,
  evaluateForgeTerraces,
  evaluateLighthouse,
  evaluateManantial,
  getArc1Progress,
  isArcComplete,
  isCastleRestored,
  isForgeTerracesRestored,
  isLighthouseRestored,
  isManantialRestored,
  calibrateLighthouse,
  measureCastleNetwork,
  measureForgeTerraces,
  measureLighthouse,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairCastleNetwork,
  repairForgeTerraces,
  repairManantial,
  setForgeTerracesAllocation,
  setForgeTerracesConductor,
  setForgeTerracesProtection,
  setManantialGate,
  snapshotArc1Greybox,
  serializeArc1GreyboxState,
  synchronizeLighthouse,
  createArc1GreyboxState,
  tryEnterArc1Region,
} from '../src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts';

function enter(state: Arc1GreyboxState, region: Parameters<typeof enterArc1Region>[1]): Arc1GreyboxState {
  const result = tryEnterArc1Region(state, region);
  assert.equal(result.accepted, true, `la ruta debe permitir ${region}`);
  return result.state;
}

const parallelConfiguration: CastleNetworkConfiguration = {
  topology: 'parallel',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'parallel', priority: 'support', protectionRating: 2 },
  },
};

const mixedConfiguration: CastleNetworkConfiguration = {
  topology: 'mixed',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'series', priority: 'support', protectionRating: 2 },
  },
};

function restoreManantial(): Arc1GreyboxState {
  let state = createArc1GreyboxState();
  state = enter(state, 'taller');
  state = enter(state, 'manantial');
  state = measureManantial(state, 'generator');
  state = setManantialGate(state, true);

  const failed = energizeManantial(state);
  assert.equal(failed.lastEvent, 'manantial-protection-trip', 'energizar sin retorno produce evidencia');
  assert.equal(failed.manantial.failedEnergizations, 1, 'la falla de G1 es contable');

  state = repairManantial(failed);
  state = energizeManantial(state);
  state = measureManantial(state, 'load');
  assert.equal(isManantialRestored(state), true, 'G1 exige medición previa y salida útil posterior');
  assert.equal(evaluateManantial(state).usefulOutput > 0, true, 'el generador tiene salida útil verificable');
  return state;
}

function openCastle(state: Arc1GreyboxState): Arc1GreyboxState {
  state = enter(state, 'plaza');
  state = pullCampana(state);
  state = openCastleGate(state);
  state = enter(state, 'castillo');
  assert.equal(state.plaza.bellPulls, 1, 'la campana deriva del relay restaurado');
  return state;
}

function restoreCastle(
  state: Arc1GreyboxState,
  configuration: CastleNetworkConfiguration,
): Arc1GreyboxState {
  state = configureCastleNetwork(state, configuration);
  state = measureCastleNetwork(state);
  state = energizeCastleNetwork(state);
  state = documentCastleNetwork(state);
  assert.equal(isCastleRestored(state), true, `Castle válido: ${configuration.topology}`);
  return state;
}

let state = restoreManantial();
assert.equal(getArc1Progress(state).relayEnergized, true, 'el relay es una condición derivada');
assert.equal(state.plaza.castleGateOpened, false, 'Manantial restaurado no abre por flag libre');

state = openCastle(state);
assert.equal(getArc1Progress(state).castleGateOpen, true, 'relay + campana habilitan la apertura');

// No se puede saltar capítulos: la navegación bloquea Faro antes del Castillo.
let fresh = createArc1GreyboxState();
const skipped = tryEnterArc1Region(fresh, 'faro');
assert.equal(skipped.accepted, false, 'la ruta bloquea un salto directo al Faro');
assert.equal(skipped.state.currentRegion, 'portal', 'un salto inválido no mueve al jugador');

// Una solución paralela válida y una mixta válida entregan consecuencias distintas.
let parallelState = restoreCastle(state, parallelConfiguration);
const parallelEvaluation = evaluateCastleNetwork(parallelState);
assert.equal(parallelEvaluation.configuration, 'parallel-balanced');
assert.equal(parallelEvaluation.maintenanceIsolation, true, 'paralelo permite aislar ramas');

let mixedState = restoreCastle(state, mixedConfiguration);
const mixedEvaluation = evaluateCastleNetwork(mixedState);
assert.equal(mixedEvaluation.configuration, 'mixed-priority');
assert.equal(mixedEvaluation.maintenanceIsolation, false, 'la solución mixta conserva acoplamiento de mantenimiento');
assert.notEqual(parallelEvaluation.configuration, mixedEvaluation.configuration, 'hay dos consecuencias de red distintas');

// Falla productiva Castle: protección insuficiente, reparación y reconfiguración.
let brokenCastle = configureCastleNetwork(state, {
  ...parallelConfiguration,
  branches: {
    ...parallelConfiguration.branches,
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 1 },
  },
});
brokenCastle = measureCastleNetwork(brokenCastle);
brokenCastle = energizeCastleNetwork(brokenCastle);
assert.equal(brokenCastle.lastEvent, 'castle-protection-trip');
assert.equal(brokenCastle.castle.recoverableFaults, 1);
brokenCastle = repairCastleNetwork(brokenCastle);
brokenCastle = restoreCastle(brokenCastle, parallelConfiguration);
assert.equal(brokenCastle.castle.repairs, 1, 'la falla Castle se recupera sin reiniciar el arco');

parallelState = enter(parallelState, 'forja');
parallelState = enter(parallelState, 'terrazas');
parallelState = setForgeTerracesAllocation(parallelState, { forge: 5, terraces: 3 });
parallelState = setForgeTerracesConductor(parallelState, 'medium');
parallelState = setForgeTerracesProtection(parallelState, 'forge', 5);
parallelState = setForgeTerracesProtection(parallelState, 'terraces', 3);
parallelState = measureForgeTerraces(parallelState);
parallelState = energizeForgeTerraces(parallelState);
parallelState = documentForgeTerraces(parallelState);
assert.equal(isForgeTerracesRestored(parallelState), true, 'G4 respeta potencia, calor, conductor y protección');
assert.equal(evaluateForgeTerraces(parallelState).tradeoff, 'forge-priority');

// Falla productiva Forja/Terrazas: se pide más corriente de la disponible.
let brokenForge = setForgeTerracesAllocation(parallelState, { forge: 5, terraces: 5 });
brokenForge = setForgeTerracesProtection(brokenForge, 'forge', 5);
brokenForge = setForgeTerracesProtection(brokenForge, 'terraces', 5);
brokenForge = measureForgeTerraces(brokenForge);
brokenForge = energizeForgeTerraces(brokenForge);
assert.equal(brokenForge.lastEvent, 'forge-terraces-protection-trip');
brokenForge = repairForgeTerraces(brokenForge);
brokenForge = setForgeTerracesAllocation(brokenForge, { forge: 3, terraces: 5 });
brokenForge = setForgeTerracesProtection(brokenForge, 'forge', 3);
brokenForge = setForgeTerracesProtection(brokenForge, 'terraces', 5);
brokenForge = measureForgeTerraces(brokenForge);
brokenForge = energizeForgeTerraces(brokenForge);
brokenForge = documentForgeTerraces(brokenForge);
assert.equal(isForgeTerracesRestored(brokenForge), true, 'el trade-off se puede corregir');

parallelState = measureLighthouse(parallelState);
parallelState = calibrateLighthouse(parallelState, { voltageTrim: 0, phaseOffset: 0 });
parallelState = energizeLighthouse(parallelState);
parallelState = synchronizeLighthouse(parallelState);
parallelState = synchronizeLighthouse(parallelState);
parallelState = documentLighthouse(parallelState);
const lighthouseEvaluation = evaluateLighthouse(parallelState);
assert.equal(lighthouseEvaluation.mode, 'dc', 'el Faro usa culminación DC');
assert.equal(lighthouseEvaluation.topologyReused, true, 'Faro reutiliza la topología medida');
assert.equal(lighthouseEvaluation.powerReused, true, 'Faro reutiliza la potencia medida');
assert.equal(isLighthouseRestored(parallelState), true, 'calibración + sincronización restauran el Faro');

parallelState = enter(parallelState, 'faro');
parallelState = enter(parallelState, 'retorno');
parallelState = enter(parallelState, 'portal');
assert.equal(isArcComplete(parallelState), true, 'el cierre depende del retorno y de todas las regiones');
assert.equal(getArc1Progress(parallelState).arcComplete, true);

const snapshot = snapshotArc1Greybox(parallelState);
assert.equal(JSON.stringify(snapshot), serializeArc1GreyboxState(parallelState), 'snapshot es serializable y estable');
assert.equal(JSON.parse(serializeArc1GreyboxState(parallelState)).progress.arcComplete, true);
assert.equal(Object.isFrozen(parallelState), false, 'el modelo no necesita mutar ni congelar el estado');
assert.equal(fresh.plaza.bellPulls, 0, 'las transiciones son inmutables');
assert.equal(fresh.manantial.measurements.length, 0, 'el estado inicial queda intacto');

console.log('Ohmdal Arco I greybox model: OK (G1–G6, alternativas, fallas y Golden Path)');
