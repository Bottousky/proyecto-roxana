/**
 * R3 (ADR-002) — Render de la room activa sola.
 *
 * Invariante de producto: SOLO la room activa se construye/renderea. Ya no
 * se construyen los vecinos del plano world, y no existe el `tileSprite` del
 * render-union (bug B5: el union de chunks 8640×4860).
 *
 * El runtime de `loadRoom` es Phaser-bound (no importable en Node sin shims);
 * siguiendo el patrón de `m0`, este test valida la invariante a nivel fuente:
 *   - `loadRoom` construye UN chunk (la room activa) en el ORIGEN LOCAL,
 *     y no itera sobre `world.rooms`.
 *   - El render-scope no usa `unionAreaBounds`/`chunkPlacement` ni un
 *     `tileSprite` de fondo gigante.
 *
 * Run: `node --experimental-strip-types tests/rr0-render-active-room.test.ts`
 */

import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// 1. La room activa se construye UNA vez, en el origen local (0, 0).
assert(
  scene.includes('this.chunks = { [id]: { ox: 0, oy: 0 } };'),
  'loadRoom fija el scope de render a la room activa en el origen local (R3)',
);
assert(
  /this\.buildChunk\(id, 0, 0, prevNPCs, fireEnter, add, boundaries\);/.test(scene),
  'loadRoom construye UN chunk: la room activa en (0,0) (R3)',
);

// 2. No se itera sobre el catálogo del mundo para construir vecinos.
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

// 4. La topología de conexiones NO es física: no queda rastro de chunkAt/enterArea
//    como mecanismo de cambio de room (R4 ya lo eliminó; R3 lo confirma).
assert(
  !scene.includes('this.enterArea('),
  'el cambio de room no pasa por enterArea (R4/R3)',
);
assert(
  scene.includes('requestRoomTransition'),
  'el cambio de room pasa por la transición de grafo (R4/R3)',
);

console.log('R3 render active room tests: OK');
