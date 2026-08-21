/**
 * R3 / R6 (ADR-002) — Render de la room activa sola.
 *
 * Invariante de producto: SOLO la room activa se construye/renderea.
 *   - R3: `loadRoom` construye UN chunk (la room activa) en el ORIGEN LOCAL
 *     y no itera sobre el catálogo del mundo.
 *   - R5: el sistema shared-wall está extirpado.
 *   - R6: el bridge `chunks = { [id]: { ox: 0, oy: 0 } }` está extirpado;
 *     `buildChunk` ya no acepta `ox/oy`; el sprite de Phaser vive en
 *     coords locales directamente.
 *
 * El runtime de `loadRoom` es Phaser-bound (no importable en Node sin shims);
 * siguiendo el patrón de `m0`, este test valida la invariante a nivel fuente.
 *
 * Run: `node --experimental-strip-types tests/rr0-render-active-room.test.ts`
 */

import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// 1. R3 / R6: la room activa se construye UNA vez, sin chunks de un mundo
//    continuo. R6 retiró el bridge `chunks = { [id]: { ox: 0, oy: 0 } }`:
//    la room activa se construye por id, sin offsets de placement.
assert(
  !scene.includes('this.chunks = { [id]: { ox: 0, oy: 0 } }'),
  'R6: chunks bridge extirpado de loadRoom (sin placement paralelo)',
);
assert(
  !/this\.buildChunk\(id, 0, 0,/.test(scene),
  'R6: buildChunk ya no recibe ox/oy (sólo id + estado de room)',
);
assert(
  /this\.buildChunk\(id, prevNPCs, fireEnter, add\);/.test(scene),
  'R6: buildChunk se llama con (id, prevNPCs, fireEnter, add) — sin offsets',
);

// 2. R3: no se itera sobre el catálogo del mundo para construir vecinos.
assert(
  !/for \(const \[cid, off\] of Object\.entries\(this\.chunks\)\)/.test(scene),
  'ya no se itera sobre los chunks del mundo para construir vecinos (R3)',
);
assert(
  !scene.includes('world ? world.rooms :'),
  'el render-scope ya no depende de world.ts para elegir chunks (R3)',
);

// 3. Bug B5 resuelto: no existe render-union ni tileSprite de fondo gigante.
assert(
  !scene.includes('unionAreaBounds('),
  'no se usa unionAreaBounds en el runtime (B5 resuelto)',
);
assert(
  !scene.includes('renderUnion'),
  'no existe el render-union (B5 resuelto)',
);
assert(
  !/tileSprite\(/.test(scene),
  'no existe el tileSprite del render-union (B5 resuelto)',
);

// 4. R4 / R6: la topología de conexiones NO es física. El cambio de
//    room es una transición de grafo disparada por exitTrigger +
//    requestRoomTransition.
assert(
  !scene.includes('this.enterArea('),
  'el cambio de room no pasa por enterArea (R4)',
);
assert(
  scene.includes('requestRoomTransition'),
  'el cambio de room pasa por la transición de grafo (R4/R6)',
);

// 5. R5: el sistema shared-wall está extirpado.
assert(
  !/private\s+computeBoundaries\s*\(/.test(scene),
  'R5: computeBoundaries() eliminado',
);
assert(
  !/private\s+gapRect\s*\(/.test(scene),
  'R5: gapRect() eliminado',
);
assert(
  !/private\s+pushWallSolids\s*\(/.test(scene),
  'R5: pushWallSolids() eliminado',
);
assert(
  !/private\s+beginDoorTransition\s*\(/.test(scene),
  'R5: beginDoorTransition() eliminado (R4 ya tiene requestRoomTransition)',
);
assert(
  !/interface\s+Boundary\b/.test(scene),
  'R5: interface Boundary eliminada',
);
assert(
  /private\s+collidesLocal\s*\(/.test(scene),
  'R5: collidesLocal(x,y) introducido como autoridad LOCAL',
);

// 6. R6: el bridge legacyProjection / activeLegacyPlacement está extirpado.
//    El sprite de Phaser vive en coordenadas locales directamente.
assert(
  !scene.includes('legacyProjection'),
  'R6: legacyProjection extirpado del runtime (sin bridge)',
);
assert(
  !scene.includes('activeLegacyPlacement'),
  'R6: activeLegacyPlacement extirpado del runtime',
);
assert(
  !/this\.currentChunk\b/.test(scene),
  'R6: this.currentChunk extirpado (la autoridad es activeRoom.id)',
);
assert(
  !/this\.worldMinY\b/.test(scene),
  'R6: this.worldMinY extirpado (y-sort vive en coords locales)',
);

console.log('R3 + R5 + R6 render active room tests: OK');
