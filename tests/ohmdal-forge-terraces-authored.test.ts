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

describe('Ohmdal A5 · Forja y Terrazas authored support pass', () => {
  it('mantiene soporte authored dentro del root lifecycle de Forja/Terrazas', () => {
    assert.match(sceneSource, /ForgeTerracesAuthoredSupportRoot/);
    assert.match(sceneSource, /forgeTerracesRoot\.addChild\(forgeTerracesAuthoredRoot\)/);
  });

  it('construye arquitectura industrial de forja, campana, chimenea, yunque, cuba de temple y conductores pesados', () => {
    for (const entity of [
      'ForgeHearthHood',
      'ForgeChimneyFlue',
      'ForgeHeatShieldBack',
      'ForgeAnvilBase',
      'ForgeAnvilBody',
      'ForgeQuenchTub',
      'ForgeQuenchWater',
      'ForgeIngotStackPad',
      'ForgeRaisedBusMain',
      'ForgeRaisedBusBranch',
      'ForgeBusInsulator',
      'ForgeFuseHousing',
      'ForgePanelTripPin',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('construye terrazas escalonadas, cordones de retención, acueducto alimentador, piletas y pórtico de bombeo', () => {
    for (const entity of [
      'TerracesRetainingWest15',
      'TerracesRetainingEast15',
      'TerracesRetainingWest21',
      'TerracesRetainingWest27',
      'TerracesRiserCurb1',
      'TerracesRiserCurb2',
      'TerracesFeederAqueduct',
      'TerracesWaterChannelMain',
      'TerracesWaterBasin1West',
      'TerracesWaterBasin1East',
      'TerracesWaterBasin2West',
      'TerracesWaterBasin3West',
      'TerracesPumpPostWest',
      'TerracesPumpLintel',
      'TerracesRailWest',
      'TerracesVistaColumnWest',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('proyecta trade-off térmico, asignación física, disparo de protección y flujo de riego desde el modelo real', () => {
    assert.match(runtimeSource, /evaluateForgeTerraces/);
    assert.match(runtimeSource, /forgeCore\.enabled = forgeTerraces\.restored/);
    assert.match(runtimeSource, /forgeProtectionLight\.light!\.enabled = arc1State\.forgeTerraces\.protectiveTrip/);
    assert.match(runtimeSource, /forgeTripPin\.setLocalPosition/);
    assert.match(runtimeSource, /terracesWaterChannels/);
  });

  it('batch-ea sólo la geometría estática authored bajo OhmdalForgeTerracesStaticArt', () => {
    assert.match(sceneSource, /addGroup\('OhmdalForgeTerracesStaticArt', false, 46\)/);
    assert.match(sceneSource, /forgeTerracesAuthoredRoot\.findComponents\('render'\)/);
    assert.doesNotMatch(sceneSource, /addPointLight\(forgeTerracesAuthoredRoot/);
  });
});
