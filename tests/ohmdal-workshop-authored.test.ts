import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const source = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/workshop/buildWorkshopInterior.ts', import.meta.url),
  'utf8',
);

describe('Ohmdal A2 · Taller authored support pass', () => {
  it('mantiene el authored pass aislado del root de Plaza', () => {
    assert.match(source, /WorkshopAuthoredSupportRoot/);
    assert.doesNotMatch(source, /plazaRoot/);
  });

  it('hace legible banco, diagnóstico y Galvanoscopio con jerarquía física', () => {
    for (const entity of [
      'WorkshopBenchViseBase',
      'WorkshopDiagnosticBackboard',
      'WorkshopDiagnosticBus',
      'WorkshopGalvanoscopeDock',
      'WorkshopBatteryTerminal',
      'WorkshopSideSpool',
    ]) {
      assert.match(source, new RegExp(entity), `${entity} debe existir`);
    }
  });

  it('añade iluminación práctica sin consumir otro shadow caster', () => {
    assert.match(source, /WorkshopBenchPracticalLight/);
    const lightBlocks = source.match(/addComponent\('light',[\s\S]*?\}\);/g) ?? [];
    assert.ok(lightBlocks.length >= 2);
    for (const block of lightBlocks) assert.match(block, /castShadows:\s*false/);
  });

  it('batch-ea la geometría estática del Taller dentro de su propia zona', () => {
    assert.match(source, /addGroup\('OhmdalWorkshopStaticArt', false, 20\)/);
    assert.match(source, /workshopInteriorRoot\.findComponents\('render'\)/);
    assert.match(source, /app\.batcher\.generate\(\[workshopStaticBatch\.id\]\)/);
  });
});
