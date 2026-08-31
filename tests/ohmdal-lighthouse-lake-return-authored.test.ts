import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const sceneSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url),
  'utf8',
);

describe('Ohmdal A6 · Faro, Lago y Retorno authored support pass', () => {
  it('mantiene soporte authored dentro del root lifecycle de Lighthouse', () => {
    assert.match(sceneSource, /LighthouseAuthoredSupportRoot/);
    assert.match(sceneSource, /lighthouseRoot\.addChild\(lighthouseAuthoredRoot\)/);
  });

  it('construye arquitectura de faro, torre, deck de linterna, casing de Fresnel, cupula y remate', () => {
    for (const entity of [
      'LighthouseTowerPlinth',
      'LighthouseTowerStep',
      'LighthouseLanternDeck',
      'LighthouseLanternRail',
      'LighthouseFresnelCasing',
      'LighthouseCupolaRoof',
      'LighthouseSignalFinial',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('construye consola de calibracion DC, soporte de instrumentos, galvanometro y bornes de prueba', () => {
    for (const entity of [
      'LighthouseConsolePlinth',
      'LighthouseInstrumentStand',
      'LighthouseGalvanoHousing',
      'LighthouseGalvanoFace',
      'LighthouseTerminalLug1',
      'LighthouseTerminalLug2',
      'LighthouseObservationStanchion',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('construye muelle de atraque, murallon de ribera, escalones y superficie lacustre', () => {
    for (const entity of [
      'LighthouseQuayWall',
      'LighthouseQuayCurb',
      'LighthouseDockPier',
      'LighthouseShoreSteps',
      'LighthouseMooringBollard1',
      'LighthouseMooringBollard2',
      'LighthouseLakeWaterExpanse',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('construye bus elevado de transmision y aisladores de pie ceramico', () => {
    for (const entity of [
      'LighthouseRaisedBusMain',
      'LighthouseRaisedBusFeed',
      'LighthouseBusInsulator',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('construye plinto, postes y placa inscripta del nexo de retorno a la Plaza', () => {
    for (const entity of [
      'LighthouseReturnPlinth',
      'LighthouseReturnPostWest',
      'LighthouseReturnPostEast',
      'LighthouseReturnHeader',
      'LighthouseReturnInscribedPlate',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('acopla evaluacion de faro, lampara de baliza, luz focal y barra de senal con el modelo electrico real', () => {
    assert.match(runtimeSource, /evaluateLighthouse/);
    assert.match(runtimeSource, /lighthouseLamp\.enabled = lighthouse\.restored/);
    assert.match(runtimeSource, /setEntityLightsEnabled\(world\.arc1Greybox\.lighthouseBeacon, lighthouse\.restored\)/);
    assert.match(runtimeSource, /world\.arc1Greybox\.lighthouseSignal\.enabled = lighthouse\.restored/);
  });

  it('batch-ea sólo la geometría estática authored bajo OhmdalLighthouseStaticArt', () => {
    assert.match(sceneSource, /addGroup\('OhmdalLighthouseStaticArt', false, 47\)/);
    assert.match(sceneSource, /lighthouseAuthoredRoot\.findComponents\('render'\)/);
    assert.doesNotMatch(sceneSource, /addPointLight\(lighthouseAuthoredRoot/);
  });
});
