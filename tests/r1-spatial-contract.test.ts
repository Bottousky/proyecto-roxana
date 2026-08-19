/**
 * Tests del commit 3 de la iteración H2 del refactor multi-área:
 * contrato espacial (local↔world, area bounds, navegación por área).
 *
 * Cobertura:
 *   1. local → world con offsets arbitrarios (incluye offsets
 *      negativos del mundo continuo de Ohmdal).
 *   2. world → local: inversa exacta de local → world.
 *   3. Detección de punto dentro del área (bbox LOCAL), incluso
 *      con un área ficticia 1920×1080.
 *   4. navigationBounds refleja las dimensiones del área, no del
 *      viewport: la búsqueda de ruta puede extenderse más allá de
 *      960×540 cuando el área activa es mayor.
 *   5. unionAreaBounds combina varios chunks en un rect WORLD.
 *   6. chunkAt / chunkCenter / chunkRectWorld son consistentes con
 *      la transformación local↔world.
 *   7. No regresión: las 20 rooms existentes siguen devolviendo
 *      960×540 vía getAreaDef (lo que garantiza que el contrato
 *      respeta la regla "default heredado").
 *
 * Run con: `node --experimental-strip-types tests/r1-spatial-contract.test.ts`
 */

import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  viewportSize,
  localToWorld,
  worldToLocal,
  chunkRectWorld,
  unionAreaBounds,
  chunkCenterWorld,
  isPointInsideChunk,
  getAreaDef,
  isPointInsideArea,
  navigationBounds,
  chunkPlacement,
  type AreaDef,
  type ChunkPlacement,
} from '../src/jugar/spatial.ts';
import { ROOM_SCENES, DEFAULT_AREA_WIDTH, DEFAULT_AREA_HEIGHT } from '../src/jugar/roomScenesData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

// ───────────────────────────────────────────────────────────────────────
// Constantes viewport
// ───────────────────────────────────────────────────────────────────────
test('viewport es 960×540 (sin cambios respecto a la fase anterior)', () => {
  const v = viewportSize();
  assert(VIEWPORT_WIDTH === 960, 'VIEWPORT_WIDTH debe ser 960');
  assert(VIEWPORT_HEIGHT === 540, 'VIEWPORT_HEIGHT debe ser 540');
  assert(v.width === 960 && v.height === 540, 'viewportSize() debe devolver 960×540');
});

// ───────────────────────────────────────────────────────────────────────
// 1. local → world
// ───────────────────────────────────────────────────────────────────────
test('localToWorld con offset cero es identidad', () => {
  const world = localToWorld({ x: 100, y: 200 }, { ox: 0, oy: 0 });
  assert(world.x === 100 && world.y === 200, 'sin offset, world == local');
});

test('localToWorld con offset positivo traslada correctamente', () => {
  const world = localToWorld({ x: 100, y: 200 }, { ox: 960, oy: 540 });
  assert(world.x === 1060 && world.y === 740, 'offset 960/540 → suma a local');
});

test('localToWorld con offset negativo funciona (plaza superior, etc.)', () => {
  // En el mundo de Ohmdal, puerta está en (0, -540) y manantial_ohm en
  // (0, -1080). El chunkOffset puede ser negativo.
  const worldPuerta = localToWorld({ x: 480, y: 270 }, { ox: 0, oy: -540 });
  assert(worldPuerta.x === 480 && worldPuerta.y === -270, 'offset negativo en y funciona');
  const worldManantial = localToWorld({ x: 480, y: 270 }, { ox: 0, oy: -1080 });
  assert(worldManantial.x === 480 && worldManantial.y === -810, 'manantial_ohm offset');
});

test('localToWorld admite puntos locales más allá de 960×540', () => {
  // En un área grande 1920×1080, un punto local (1500, 900) debe
  // viajar al mundo como (1500 + ox, 900 + oy).
  const world = localToWorld({ x: 1500, y: 900 }, { ox: 100, oy: 100 });
  assert(world.x === 1600 && world.y === 1000, 'puntos locales > 960/540 viajan al mundo');
});

// ───────────────────────────────────────────────────────────────────────
// 2. world → local (inversa exacta)
// ───────────────────────────────────────────────────────────────────────
test('worldToLocal es la inversa exacta de localToWorld', () => {
  const offsets = [
    { ox: 0, oy: 0 },
    { ox: 960, oy: 540 },
    { ox: -960, oy: -1620 },
    { ox: 1920, oy: 0 },
  ];
  for (const off of offsets) {
    const local = { x: 123, y: 456 };
    const world = localToWorld(local, off);
    const back = worldToLocal(world, off);
    assert(back.x === local.x && back.y === local.y, `round-trip offset ${off.ox},${off.oy}`);
  }
});

test('worldToLocal con offset negativo funciona', () => {
  const local = worldToLocal({ x: 480, y: -270 }, { ox: 0, oy: -540 });
  assert(local.x === 480 && local.y === 270, 'mundo → local con offset negativo');
});

// ───────────────────────────────────────────────────────────────────────
// 3. Detección de punto dentro del área (bbox LOCAL, área ficticia 1920×1080)
// ───────────────────────────────────────────────────────────────────────
test('isPointInsideArea funciona con área heredada y con la Plaza 1920×1080', () => {
  // Commit 4 (H3 — Plaza multi-área greybox): la Plaza pasó a
  // 1920×1080. Las otras 19 rooms siguen siendo 960×540.
  // Validamos que la mecánica del bounding box funciona para
  // ambos casos.
  for (const id of Object.keys(ROOM_SCENES)) {
    if (id === 'plaza') {
      // Plaza 1920×1080: el origen y la esquina inf-der caen
      // dentro; el rango heredado (960, 540) ahora está adentro
      // del área extendida.
      assert(isPointInsideArea(id, 0, 0) === true, `${id}: (0,0) dentro`);
      assert(isPointInsideArea(id, 1919, 1079) === true, `${id}: (1919,1079) dentro`);
      assert(isPointInsideArea(id, 960, 540) === true, `${id}: (960,540) está dentro de 1920×1080`);
      assert(isPointInsideArea(id, 1920, 0) === false, `${id}: (1920,0) está justo fuera`);
      assert(isPointInsideArea(id, 0, 1080) === false, `${id}: (0,1080) está justo fuera`);
    } else {
      // Resto: 960×540 heredado.
      assert(isPointInsideArea(id, 0, 0) === true, `${id}: (0,0) dentro`);
      assert(isPointInsideArea(id, 959, 539) === true, `${id}: (959,539) dentro`);
      assert(isPointInsideArea(id, 960, 540) === false, `${id}: (960,540) fuera`);
    }
  }
});

test('navigationBounds refleja dimensiones del área, no del viewport', () => {
  // Área 960×540 (heredada)
  const small = navigationBounds({ width: 960, height: 540 });
  assert(small.w === 960 && small.h === 540, 'navigationBounds 960×540');

  // Área ficticia 1920×1080
  const large = navigationBounds({ width: 1920, height: 1080 });
  assert(large.w === 1920 && large.h === 1080, 'navigationBounds 1920×1080');
  assert(large.w > VIEWPORT_WIDTH, 'el área excede el viewport en x');
  assert(large.h > VIEWPORT_HEIGHT, 'el área excede el viewport en y');
});

test('navigationBounds con área ficticia 1920×1080 permite coords más allá de 960/540', () => {
  const nb = navigationBounds({ width: 1920, height: 1080 });
  // El pathfinder puede explorar el rango completo del área.
  // Verificamos la mecánica con un check clásico de bounding box.
  const inside = (x: number, y: number) => x >= 0 && x < nb.w && y >= 0 && y < nb.h;
  assert(inside(1500, 900) === true, '(1500,900) está dentro del área 1920×1080');
  assert(inside(1919, 1079) === true, '(1919,1079) está dentro del área 1920×1080');
  // El mismo punto NO entra en el viewport heredado.
  const vp = viewportSize();
  assert(1500 >= vp.width, '(1500,*) está fuera del viewport en x');
});

// ───────────────────────────────────────────────────────────────────────
// 4. unionAreaBounds y chunkRectWorld
// ───────────────────────────────────────────────────────────────────────
test('unionAreaBounds con un solo chunk devuelve su rect', () => {
  // Commit 4: la Plaza ahora mide 1920×1080. Usamos el Taller
  // (que sigue 960×540) para validar la mecánica heredada.
  const single: ChunkPlacement[] = [chunkPlacement('taller', 0, 0)];
  const u = unionAreaBounds(single);
  assert(u !== null, 'union no es null con un chunk');
  assert(u.x === 0 && u.y === 0, 'origen en (0,0)');
  assert(u.w === DEFAULT_AREA_WIDTH && u.h === DEFAULT_AREA_HEIGHT, 'dims heredadas 960×540');
});

test('unionAreaBounds con un chunk de la Plaza 1920×1080 devuelve su rect', () => {
  // Commit 4: el chunk de la Plaza ahora ocupa 1920×1080.
  const single: ChunkPlacement[] = [chunkPlacement('plaza', 0, 0)];
  const u = unionAreaBounds(single);
  assert(u !== null, 'union no es null');
  assert(u.w === 1920 && u.h === 1080, 'dims de la Plaza: 1920×1080');
});

test('unionAreaBounds con varios chunks cubre el bounding box total', () => {
  // Commit 4: la Plaza (1920×1080) y el Taller (1920, 0) ya no
  // quedan en una franja de 1920×540 — el Taller se reposicionó
  // a (1920, 0), pegado al borde este de la Plaza. Validamos la
  // mecánica con dos chunks del mismo tamaño (960×540) en
  // (0,0) y (960,0) → total 1920×540.
  const placements: ChunkPlacement[] = [
    chunkPlacement('taller', 0, 0),
    chunkPlacement('puerta', 960, 0),
  ];
  const u = unionAreaBounds(placements);
  assert(u !== null, 'union no es null');
  assert(u.x === 0 && u.y === 0, 'origen');
  assert(u.w === 1920 && u.h === 540, 'bbox total 1920×540');
});

test('unionAreaBounds con chunks de tamaños distintos (Plaza 1920×1080 + Taller 960×540)', () => {
  // Commit 4: el mundo de Ohmdal incluye la Plaza grande y
  // vecinos del tamaño heredado. La unión debe respetar los
  // tamaños reales de cada chunk.
  const placements: ChunkPlacement[] = [
    chunkPlacement('plaza', 0, 0),
    chunkPlacement('taller', 1920, 0),
  ];
  const u = unionAreaBounds(placements);
  assert(u !== null, 'union no es null');
  assert(u.x === 0 && u.y === 0, 'origen');
  assert(u.w === 1920 + 960, `bbox ancho = 1920+960 = 2880, got ${u.w}`);
  assert(u.h === 1080, 'alto = 1080 (la Plaza es la más alta)');
});

test('unionAreaBounds maneja chunks con offsets negativos', () => {
  // Replica parcial del mundo de Ohmdal. La Plaza ahora mide
  // 1920×1080 → el origen de x sigue siendo -3840 (forge_hall)
  // pero el alto depende del vecino más alto en y=0.
  const placements: ChunkPlacement[] = [
    chunkPlacement('plaza', 0, 0),
    chunkPlacement('castle_gate', -960, 0),
    chunkPlacement('forge_hall', -3840, 540),
  ];
  const u = unionAreaBounds(placements);
  assert(u !== null, 'union no es null');
  assert(u.x === -3840, 'origen en x = -3840');
  assert(u.y === 0, 'origen en y = 0');
  assert(u.w === 1920 + 3840, `bbox ancho = 1920+3840 = 5760, got ${u.w}`);
  assert(u.h === 1080, 'bbox alto = 1080 (la Plaza es la más alta)');
});

test('unionAreaBounds con lista vacía devuelve null', () => {
  const u = unionAreaBounds([]);
  assert(u === null, 'lista vacía → null');
});

test('chunkRectWorld combina ox/oy con width/height del chunk', () => {
  const r = chunkRectWorld({ ox: 100, oy: 200, width: 480, height: 270 });
  assert(r.x === 100 && r.y === 200 && r.w === 480 && r.h === 270, 'rect world del chunk');
});

test('chunkCenterWorld devuelve el centro del chunk', () => {
  const c = chunkCenterWorld({ ox: 0, oy: 0, width: 960, height: 540 });
  assert(c.x === 480 && c.y === 270, 'centro plaza 960×540');
  const c2 = chunkCenterWorld({ ox: 0, oy: -540, width: 960, height: 540 });
  assert(c2.x === 480 && c2.y === -270, 'centro con offset negativo');
});

// ───────────────────────────────────────────────────────────────────────
// 5. chunkAt / isPointInsideChunk
// ───────────────────────────────────────────────────────────────────────
test('isPointInsideChunk detecta pertenencia', () => {
  const chunk = { ox: 100, oy: 200, width: 480, height: 270 };
  assert(isPointInsideChunk(100, 200, chunk) === true, 'esquina sup-izq dentro');
  assert(isPointInsideChunk(579, 469, chunk) === true, 'esquina inf-der dentro (cell final)');
  assert(isPointInsideChunk(580, 470, chunk) === false, 'justo fuera por abajo/derecha');
  assert(isPointInsideChunk(99, 200, chunk) === false, 'justo fuera por izq');
  assert(isPointInsideChunk(100, 199, chunk) === false, 'justo fuera por arriba');
});

// ───────────────────────────────────────────────────────────────────────
// 6. getAreaDef y no regresión de las 20 rooms
// ───────────────────────────────────────────────────────────────────────
test('getAreaDef devuelve DEFAULT para las 19 rooms heredadas (no regresión)', () => {
  // Commit 4: la Plaza sale del grupo "todas heredadas" — ahora
  // mide 1920×1080 explícitamente.
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

// ───────────────────────────────────────────────────────────────────────
// 7. round-trip con área ficticia 1920×1080
// ───────────────────────────────────────────────────────────────────────
test('round-trip local↔world con área ficticia 1920×1080 y chunks desplazados', () => {
  // Simulamos un chunk de 1920×1080 ubicado en (0, 0).
  const big: AreaDef = { width: 1920, height: 1080 };
  const placements: ChunkPlacement[] = [chunkPlacement('plaza_grande', 0, 0)];
  // Forzamos dimensiones grandes en el chunk (el registry real
  // todavía no tiene una entrada de 1920×1080; el contrato la
  // acepta). Reusamos el chunkPlacement con width/height overrides.
  const placementsBig: ChunkPlacement[] = [{ id: 'plaza_grande', ox: 0, oy: 0, width: big.width, height: big.height }];
  const u = unionAreaBounds(placementsBig);
  assert(u !== null && u.w === 1920 && u.h === 1080, 'union del chunk grande');
  // El pathfinder tiene espacio para ir más allá de 960/540.
  const nb = navigationBounds(big);
  assert(nb.w === 1920 && nb.h === 1080, 'navigationBounds del chunk grande');
  // Transformaciones local↔world coherentes dentro del chunk grande.
  const local = { x: 1500, y: 900 };
  const off = placements[0]; // {ox:0, oy:0}
  const world = localToWorld(local, off);
  const back = worldToLocal(world, off);
  assert(back.x === local.x && back.y === local.y, 'round-trip con área grande');
});

// ───────────────────────────────────────────────────────────────────────
// Run
// ───────────────────────────────────────────────────────────────────────
console.log('Spatial contract tests:');
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
