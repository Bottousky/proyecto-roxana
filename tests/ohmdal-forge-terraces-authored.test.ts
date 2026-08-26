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

describe('Ohmdal A5 · Forja + Terrazas authored support pass', () => {
  it('mantiene soporte authored dentro del root lifecycle de Forja/Terrazas', () => {
    assert.match(sceneSource, /ForgeTerracesAuthoredSupportRoot/);
    assert.match(sceneSource, /forgeTerracesRoot\.addChild\(forgeTerracesAuthoredRoot\)/);
  });

  it('construye campana de fundición, chimenea de cobre, standoffs y estación de trabajo de herrería', () => {
    for (const entity of [
      'ForgeSmeltingHood',
      'ForgeChimneyFlue',
      'ForgeHearthFlueBrace',
      'ForgeBusStandoffA',
      'ForgeBusStandoffB',
      'ForgeInsulatorCapA',
      'ForgeAnvilStand',
      'ForgeAnvilHead',
      'ForgeQuenchingTrough',
      'ForgeToolRack',
      'ForgeRoofTrussWest',
      'ForgeRoofTieSouth',
      'ForgeClerestoryHeader',
    ]) {
      assert.match(sceneSource, new RegExp(entity), `${entity} debe existir en la escena`);
    }
  });

  it('construye acueducto elevado, contrafuertes escalonados y barandas en terrazas agrícolas', () => {
    for (const entity of [
      'AqueductPillarWest',
      'AqueductPillarEast',
      'AqueductArchLintel',
      'AqueductWaterChannel',
      'TerraceButtressLevel1Left',
      'TerraceButtressLevel2Left',
      'TerraceButtressLevel3Left',
      'TerraceIrrigationPlotLeft',
      'TerraceWaterTroughLeft',
      'TerraceStairRailLeft',
    ]) {
      assert.match(sceneSource, new RegExp(entity), `${entity} debe existir en la escena`);
    }
  });

  it('proyecta estado térmico, bomba y protección desde el modelo real', () => {
    assert.match(runtimeSource, /evaluateForgeTerraces/);
    assert.match(runtimeSource, /forgeProtectionLight\.light!\.enabled/);
    assert.match(runtimeSource, /ForgeHeaterCore/);
    assert.match(runtimeSource, /TerracesPumpWheel/);
  });

  it('batch-ea sólo la geometría estática authored y no añade luces parásitas', () => {
    assert.match(sceneSource, /addGroup\('OhmdalForgeTerracesStaticArt', false, 45\)/);
    assert.match(sceneSource, /forgeTerracesAuthoredRoot\.findComponents\('render'\)/);
  });
});
