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

describe('Ohmdal A4 · Castillo authored support pass', () => {
  it('mantiene soporte authored dentro del root lifecycle del Castillo', () => {
    assert.match(sceneSource, /CastleAuthoredSupportRoot/);
    assert.match(sceneSource, /castleRoot\.addChild\(castleAuthoredRoot\)/);
  });

  it('construye una espina cívica, tres ramas y galerías de mantenimiento', () => {
    for (const entity of [
      'CastleRaisedMainBus',
      'CastleRaisedBranchA',
      'CastleRaisedBranchB',
      'CastleRaisedBranchC',
      'CastleBusInsulator',
      'CastleMaintenanceBalconyWest',
      'CastleServiceBayNorth',
    ]) assert.match(sceneSource, new RegExp(entity), `${entity} debe existir`);
  });

  it('proyecta topología, retorno y protección desde el modelo real', () => {
    assert.match(runtimeSource, /castleBranchIsolators/);
    assert.match(runtimeSource, /wiring === 'isolated'/);
    assert.match(runtimeSource, /wiring === 'series'/);
    assert.match(runtimeSource, /castleReturnLink\.enabled = arc1State\.castle\.returnContinuity/);
    assert.match(runtimeSource, /castleTripPin\.setLocalPosition/);
  });

  it('batch-ea sólo la geometría estática authored y no añade luces', () => {
    assert.match(sceneSource, /addGroup\('OhmdalCastleStaticArt', false, 45\)/);
    assert.match(sceneSource, /castleAuthoredRoot\.findComponents\('render'\)/);
    assert.doesNotMatch(sceneSource, /addPointLight\(castleAuthoredRoot/);
  });
});
