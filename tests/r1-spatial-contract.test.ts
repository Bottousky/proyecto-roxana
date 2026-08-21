/**
 * r1-spatial-contract.test.ts — R6 / contrato espacial room-local.
 *
 * El antiguo contrato "local↔world, area bounds, navegación por área"
 * asumía un plano mundo continuo con offsets `(ox, oy)`. R6 extirpó
 * ese plano: la autoridad de gameplay es LOCAL a la room activa.
 *
 * Este test conserva la semántica valiosa del contrato R2:
 *   1. Viewport 960×540 (no se modifica por el modelo multi-área).
 *   2. `isPointInsideArea` valida contra el bbox LOCAL del área
 *      (Plaza 1920×1080 + 19 rooms heredadas 960×540).
 *   3. `navigationBounds` refleja las dimensiones del área, no del
 *      viewport: la búsqueda de ruta puede extenderse más allá de
 *      960×540 cuando el área activa es mayor.
 *   4. `getAreaDef` y `areaDimensions` son funciones puras del id.
 *
 * Lo que se retiró en R6 (los siguientes tests no se reescriben —
 *   son asunciones del mundo continuo extirpado):
 *   - `localToWorld` / `worldToLocal` (bridge legacy eliminado).
 *   - `unionAreaBounds` / `chunkRectWorld` / `chunkCenterWorld`
 *     / `isPointInsideChunk` (mundo continuo extirpado).
 *   - `ChunkPlacement` (interfaz de un chunk del mundo continuo).
 *
 * Run con: `node --experimental-strip-types tests/r1-spatial-contract.test.ts`
 */

import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  viewportSize,
  getAreaDef,
  isPointInsideArea,
  navigationBounds,
  type AreaDef,
} from '../src/jugar/spatial.ts';
import {
  ROOM_SCENES,
  areaDimensions,
  DEFAULT_AREA_WIDTH,
  DEFAULT_AREA_HEIGHT,
} from '../src/jugar/roomScenesData.ts';
import { activeRoomLocalBounds, createActiveRoom } from '../src/jugar/activeRoom.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

// ───────────────────────────────────────────────────────────────────────
// 1. Viewport sin cambios
// ───────────────────────────────────────────────────────────────────────
test('viewport es 960×540 (sin cambios respecto a la fase anterior)', () => {
  const v = viewportSize();
  assert(VIEWPORT_WIDTH === 960, 'VIEWPORT_WIDTH debe ser 960');
  assert(VIEWPORT_HEIGHT === 540, 'VIEWPORT_HEIGHT debe ser 540');
  assert(v.width === 960 && v.height === 540, 'viewportSize() debe devolver 960×540');
});

// ───────────────────────────────────────────────────────────────────────
// 2. isPointInsideArea (bbox LOCAL)
// ───────────────────────────────────────────────────────────────────────
test('isPointInsideArea funciona con área heredada y con la Plaza 1920×1080', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    if (id === 'plaza') {
      assert(isPointInsideArea(id, 0, 0) === true, `${id}: (0,0) dentro`);
      assert(isPointInsideArea(id, 1919, 1079) === true, `${id}: (1919,1079) dentro`);
      assert(isPointInsideArea(id, 960, 540) === true, `${id}: (960,540) está dentro de 1920×1080`);
      assert(isPointInsideArea(id, 1920, 0) === false, `${id}: (1920,0) está justo fuera`);
      assert(isPointInsideArea(id, 0, 1080) === false, `${id}: (0,1080) está justo fuera`);
    } else {
      assert(isPointInsideArea(id, 0, 0) === true, `${id}: (0,0) dentro`);
      assert(isPointInsideArea(id, 959, 539) === true, `${id}: (959,539) dentro`);
      assert(isPointInsideArea(id, 960, 540) === false, `${id}: (960,540) fuera`);
    }
  }
});

// ───────────────────────────────────────────────────────────────────────
// 3. navigationBounds refleja dimensiones del área, no del viewport
// ───────────────────────────────────────────────────────────────────────
test('navigationBounds refleja dimensiones del área, no del viewport', () => {
  const small = navigationBounds({ width: 960, height: 540 });
  assert(small.w === 960 && small.h === 540, 'navigationBounds 960×540');

  const large = navigationBounds({ width: 1920, height: 1080 });
  assert(large.w === 1920 && large.h === 1080, 'navigationBounds 1920×1080');
  assert(large.w > VIEWPORT_WIDTH, 'el área excede el viewport en x');
  assert(large.h > VIEWPORT_HEIGHT, 'el área excede el viewport en y');
});

test('navigationBounds con área ficticia 1920×1080 permite coords más allá de 960/540', () => {
  const nb = navigationBounds({ width: 1920, height: 1080 });
  const inside = (x: number, y: number) => x >= 0 && x < nb.w && y >= 0 && y < nb.h;
  assert(inside(1500, 900) === true, '(1500,900) está dentro del área 1920×1080');
  assert(inside(1919, 1079) === true, '(1919,1079) está dentro del área 1920×1080');
  const vp = viewportSize();
  assert(1500 >= vp.width, '(1500,*) está fuera del viewport en x');
});

// ───────────────────────────────────────────────────────────────────────
// 4. ActiveRoom + activeRoomLocalBounds (R2/R6)
// ───────────────────────────────────────────────────────────────────────
test('activeRoomLocalBounds = (0,0,width,height) para Plaza 1920×1080', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const bounds = activeRoomLocalBounds(room);
  assert(bounds.x === 0 && bounds.y === 0, 'origen local (0, 0)');
  assert(bounds.w === 1920 && bounds.h === 1080, 'Plaza local 1920×1080');
});

test('activeRoomLocalBounds = (0,0,960,540) para Taller (R6)', () => {
  const room = createActiveRoom('taller', { x: 480, y: 270 });
  const bounds = activeRoomLocalBounds(room);
  assert(bounds.x === 0 && bounds.y === 0, 'origen local (0, 0)');
  assert(bounds.w === 960 && bounds.h === 540, 'Taller local 960×540');
});

// ───────────────────────────────────────────────────────────────────────
// 5. getAreaDef / areaDimensions (funciones puras del id)
// ───────────────────────────────────────────────────────────────────────
test('getAreaDef devuelve DEFAULT para las 19 rooms heredadas (no regresión)', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    if (id === 'plaza') continue;
    const a = getAreaDef(id);
    assert(a.width === DEFAULT_AREA_WIDTH, `${id}: width heredado`);
    assert(a.height === DEFAULT_AREA_HEIGHT, `${id}: height heredado`);
  }
});

test('getAreaDef devuelve 1920×1080 para la Plaza (commit 4)', () => {
  const a = getAreaDef('plaza');
  assert(a.width === 1920, `plaza: width = ${a.width}, esperado 1920`);
  assert(a.height === 1080, `plaza: height = ${a.height}, esperado 1080`);
});

test('getAreaDef es estable: dos llamadas devuelven el mismo resultado', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    const a = getAreaDef(id);
    const b = getAreaDef(id);
    assert(a.width === b.width && a.height === b.height, `${id}: estable`);
  }
});

test('areaDimensions es coherente con getAreaDef', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    const a = getAreaDef(id);
    const d = areaDimensions(id);
    assert(a.width === d.width && a.height === d.height, `${id}: getAreaDef y areaDimensions coinciden`);
  }
});

// ───────────────────────────────────────────────────────────────────────
// Run
// ───────────────────────────────────────────────────────────────────────
console.log('Spatial contract tests (R6):');
let passed = 0;
let failed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`  ✓ ${t.name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${t.name}: ${(e as Error).message}`);
    failed++;
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
