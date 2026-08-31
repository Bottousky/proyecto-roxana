import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const shellSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url),
  'utf8',
);
const vfxSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/manantial/manantialActivationVfx.ts', import.meta.url),
  'utf8',
);

describe('Ohmdal A3 · Manantial authored support pass', () => {
  it('aísla el authored pass bajo el lifecycle de Manantial', () => {
    assert.match(shellSource, /ManantialAuthoredStaticRoot/);
    assert.match(shellSource, /gameplayRoot\.addChild\(authoredStaticRoot\)/);
    assert.doesNotMatch(shellSource, /plazaRoot\.addChild\(authoredStaticRoot\)/);
    assert.match(runtimeSource, /zones\.deactivate\('plaza'\)/);
  });

  it('hace legibles agua, compuerta, generador, medición y salida', () => {
    for (const entity of [
      'ManantialHeadraceBed',
      'ManantialSluiceLeaf',
      'ManantialGeneratorStator',
      'ManantialMeasurementPlatform',
      'ManantialCeramicInsulator',
      'ManantialOutgoingBusLeft',
      'ManantialRestoredOutputMarker',
    ]) {
      assert.match(shellSource, new RegExp(entity), `${entity} debe existir`);
    }
  });

  it('expresa el estado hidráulico con geometría gobernada por simulación', () => {
    assert.match(runtimeSource, /manantialDormantWater\.enabled = !arc1State\.manantial\.gateOpen/);
    assert.match(runtimeSource, /manantialActiveWater\.enabled = arc1State\.manantial\.gateOpen/);
    assert.match(runtimeSource, /manantialSluiceLeaf\.setLocalPosition/);
  });

  it('batch-ea sólo soporte estático local', () => {
    assert.match(shellSource, /addGroup\('OhmdalManantialStaticArt', false, 40\)/);
    assert.match(shellSource, /authoredStaticRoot\.findComponents\('render'\)/);
    assert.match(shellSource, /app\.batcher\.generate\(\[manantialStaticBatch\.id\]\)/);
  });

  it('usa un VFX transitorio local sin materiales compartidos ni doble control del rotor', () => {
    assert.match(vfxSource, /activationTrace\.enabled/);
    assert.match(vfxSource, /EVENT_DURATION_SECONDS/);
    assert.doesNotMatch(vfxSource, /matBrass|matCopperClean|turbineRotor|Math\.random|Date\.now/);
    assert.match(shellSource, /castShadows:\s*false/);
  });
});
