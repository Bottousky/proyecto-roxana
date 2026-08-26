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

describe('Ohmdal A6 · Faro / Lago / Return authored support pass', () => {
  it('mantiene soporte authored dentro del root lifecycle del Faro', () => {
    assert.match(sceneSource, /LighthouseAuthoredSupportRoot/);
    assert.match(sceneSource, /lighthouseRoot\.addChild\(lighthouseAuthoredRoot\)/);
  });

  it('construye muelle costero, banco de calibración DC, pasarela de torre y pedestal de retorno', () => {
    for (const entity of [
      'LighthousePierCoping',
      'LighthousePierPilingLeft',
      'LighthouseMooringBollard',
      'LighthouseBreakwaterStoneA',
      'LighthouseCalibrationBench',
      'LighthouseReferenceResistorBank',
      'LighthouseShuntMount',
      'LighthouseBusStandoffA',
      'LighthouseBusInsulatorA',
      'LighthouseTowerGalleryRing',
      'LighthouseReflectorShield',
      'LighthouseLensHousing',
      'LighthouseReturnPedestal',
      'LighthouseTerminusPlaque',
      'LighthouseRoofTieSouth',
      'LighthouseClerestoryHeader',
    ]) {
      assert.match(sceneSource, new RegExp(entity), `${entity} debe existir en la escena`);
    }
  });

  it('proyecta baliza, sincronización y señal desde el modelo DC real', () => {
    assert.match(runtimeSource, /evaluateLighthouse/);
    assert.match(runtimeSource, /LighthouseBeaconLamp/);
    assert.match(runtimeSource, /lighthouseSignal\.enabled/);
  });

  it('batch-ea sólo la geometría estática authored y no añade luces parásitas', () => {
    assert.match(sceneSource, /addGroup\('OhmdalLighthouseStaticArt', false, 45\)/);
    assert.match(sceneSource, /lighthouseAuthoredRoot\.findComponents\('render'\)/);
  });
});
