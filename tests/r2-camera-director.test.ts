/**
 * Tests del CameraDirector del commit 3 de H2.
 *
 * Cobertura:
 *   1. clampCenter en los cuatro bordes con un área ficticia
 *      1920×1080 (viewport 960×540).
 *   2. Cámara centrada cuando el área es ≤ viewport.
 *   3. Cámara sigue al jugador (sin clamp) cuando el área es
 *      estrictamente mayor al viewport.
 *   4. cameraBounds y applyToPhaserCamera producen el rect
 *      esperado para Phaser.
 *   5. isAreaSmallerThanViewport detecta el caso de área
 *      centrada.
 *   6. isAtBorder marca los cuatro bordes correctamente.
 *   7. No regresión: con un área 960×540 y viewport 960×540, el
 *      clamp deja la cámara en la esquina del área (cualquier
 *      posición del jugador colapsa al mismo punto, igual que
 *      antes).
 *   8. Errores: viewport o área inválidos.
 *
 * Run con: `node --experimental-strip-types tests/r2-camera-director.test.ts`
 */

import {
  clampCenter,
  cameraBounds,
  applyToPhaserCamera,
  isAreaSmallerThanViewport,
  isAtBorder,
  type ViewportSize,
} from '../src/jugar/cameraDirector.ts';
import type { Rect } from '../src/jugar/spatial.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

const VP: ViewportSize = { width: 960, height: 540 };
const BIG_AREA: Rect = { x: 0, y: 0, w: 1920, h: 1080 };
const SMALL_AREA: Rect = { x: 0, y: 0, w: 480, h: 270 };
const PLAZA_AREA: Rect = { x: 0, y: 0, w: 960, h: 540 };
const OFFSET_BIG_AREA: Rect = { x: -480, y: -540, w: 1920, h: 1080 };

// ───────────────────────────────────────────────────────────────────────
// 1. clampCenter en los cuatro bordes con 1920×1080
// ───────────────────────────────────────────────────────────────────────
test('clampCenter 1920×1080: jugador en el centro exacto → cámara en el centro', () => {
  const corner = clampCenter({ x: 960, y: 540 }, BIG_AREA, VP);
  // centro del área 1920×1080: (960, 540). Esquina de la cámara
  // (top-left) = centro - viewport/2 = (480, 270).
  assert(corner.x === 480, `cámara x = 480 (esperado 480), got ${corner.x}`);
  assert(corner.y === 270, `cámara y = 270 (esperado 270), got ${corner.y}`);
});

test('clampCenter 1920×1080: jugador en el borde IZQUIERDO → cámara pegada a la izquierda', () => {
  // Jugador en x=0 (borde izquierdo del área). La cámara debe
  // mostrar el área desde su borde izquierdo: scrollX = 0.
  const corner = clampCenter({ x: 0, y: 540 }, BIG_AREA, VP);
  assert(corner.x === 0, `cámara x = 0 (borde izquierdo), got ${corner.x}`);
  assert(corner.y === 270, `cámara y centrada, got ${corner.y}`);
});

test('clampCenter 1920×1080: jugador en el borde DERECHO → cámara pegada a la derecha', () => {
  // Jugador en x=1920 (borde derecho). La cámara debe llegar al
  // borde derecho del área: scrollX = 1920 - 960 = 960.
  const corner = clampCenter({ x: 1920, y: 540 }, BIG_AREA, VP);
  assert(corner.x === 960, `cámara x = 960 (borde derecho), got ${corner.x}`);
  assert(corner.y === 270, `cámara y centrada, got ${corner.y}`);
});

test('clampCenter 1920×1080: jugador en el borde SUPERIOR → cámara pegada arriba', () => {
  const corner = clampCenter({ x: 960, y: 0 }, BIG_AREA, VP);
  assert(corner.y === 0, `cámara y = 0 (borde superior), got ${corner.y}`);
  assert(corner.x === 480, `cámara x centrada, got ${corner.x}`);
});

test('clampCenter 1920×1080: jugador en el borde INFERIOR → cámara pegada abajo', () => {
  const corner = clampCenter({ x: 960, y: 1080 }, BIG_AREA, VP);
  assert(corner.y === 540, `cámara y = 540 (borde inferior), got ${corner.y}`);
  assert(corner.x === 480, `cámara x centrada, got ${corner.x}`);
});

test('clampCenter 1920×1080: jugador en esquina → cámara en esquina', () => {
  const corner = clampCenter({ x: 0, y: 0 }, BIG_AREA, VP);
  assert(corner.x === 0 && corner.y === 0, 'esquina top-left del área');
  const corner2 = clampCenter({ x: 1920, y: 1080 }, BIG_AREA, VP);
  assert(corner2.x === 960 && corner2.y === 540, 'esquina bottom-right del área');
});

test('clampCenter 1920×1080: jugador sale del área por la derecha → clamp', () => {
  // Jugador a 5000 px (fuera del área 0..1920). La cámara debe
  // quedar en el borde derecho del área.
  const corner = clampCenter({ x: 5000, y: 540 }, BIG_AREA, VP);
  assert(corner.x === 960, `clamp a 960 cuando jugador sale por la derecha, got ${corner.x}`);
});

test('clampCenter 1920×1080: jugador sale del área por la izquierda → clamp', () => {
  const corner = clampCenter({ x: -500, y: 540 }, BIG_AREA, VP);
  assert(corner.x === 0, `clamp a 0 cuando jugador sale por la izquierda, got ${corner.x}`);
});

// ───────────────────────────────────────────────────────────────────────
// 2. Cámara centrada cuando el área es ≤ viewport
// ───────────────────────────────────────────────────────────────────────
test('clampCenter área 480×270 con viewport 960×540 → cámara centrada sobre el área', () => {
  const corner = clampCenter({ x: 240, y: 135 }, SMALL_AREA, VP);
  // El área es más chica que el viewport. La cámara debe centrarse:
  // esquina = (área.x + (área.w - viewport.w)/2, área.y + (área.h - viewport.h)/2)
  //        = (0 + (480-960)/2, 0 + (270-540)/2) = (-240, -135)
  assert(corner.x === -240, `cámara x = -240, got ${corner.x}`);
  assert(corner.y === -135, `cámara y = -135, got ${corner.y}`);
});

test('clampCenter área centrada: cualquier target colapsa a la misma posición', () => {
  // En área más chica que viewport, la cámara no se mueve.
  const a = clampCenter({ x: 0, y: 0 }, SMALL_AREA, VP);
  const b = clampCenter({ x: 240, y: 135 }, SMALL_AREA, VP);
  const c = clampCenter({ x: 480, y: 270 }, SMALL_AREA, VP);
  assert(a.x === b.x && b.x === c.x, 'misma x para cualquier target');
  assert(a.y === b.y && b.y === c.y, 'misma y para cualquier target');
});

// ───────────────────────────────────────────────────────────────────────
// 3. Cámara sigue al jugador cuando el área es estrictamente mayor
// ───────────────────────────────────────────────────────────────────────
test('clampCenter 1920×1080: jugador en (800, 400) → cámara lo sigue con margen', () => {
  // Centro de la cámara = jugador. Esquina = jugador - viewport/2.
  const corner = clampCenter({ x: 800, y: 400 }, BIG_AREA, VP);
  assert(corner.x === 800 - 480, `cámara x = 320, got ${corner.x}`);
  assert(corner.y === 400 - 270, `cámara y = 130, got ${corner.y}`);
});

// ───────────────────────────────────────────────────────────────────────
// 4. cameraBounds / applyToPhaserCamera
// ───────────────────────────────────────────────────────────────────────
test('cameraBounds para área 1920×1080 devuelve el área completa', () => {
  const b = cameraBounds(BIG_AREA, VP);
  assert(b.x === 0 && b.y === 0 && b.w === 1920 && b.h === 1080, 'bounds = área');
});

test('cameraBounds para área 960×540 coincide con el viewport (caso heredado)', () => {
  const b = cameraBounds(PLAZA_AREA, VP);
  assert(b.x === 0 && b.y === 0 && b.w === 960 && b.h === 540, 'bounds = viewport');
});

test('cameraBounds para área 480×270 devuelve un rect viewport centrado', () => {
  const b = cameraBounds(SMALL_AREA, VP);
  assert(b.w === 960 && b.h === 540, 'tamaño = viewport');
  assert(b.x === -240 && b.y === -135, 'centro del área en el centro del viewport');
});

test('applyToPhaserCamera llama setBounds con los bounds correctos', () => {
  const calls: Array<[number, number, number, number]> = [];
  const fakeCam = {
    setBounds(x: number, y: number, w: number, h: number): void {
      calls.push([x, y, w, h]);
    },
  };
  applyToPhaserCamera(fakeCam, BIG_AREA, VP);
  assert(calls.length === 1, 'una llamada a setBounds');
  const [x, y, w, h] = calls[0];
  assert(x === 0 && y === 0 && w === 1920 && h === 1080, 'setBounds con área grande');
});

// ───────────────────────────────────────────────────────────────────────
// 5. isAreaSmallerThanViewport
// ───────────────────────────────────────────────────────────────────────
test('isAreaSmallerThanViewport detecta 480×270 con viewport 960×540', () => {
  assert(isAreaSmallerThanViewport(SMALL_AREA, VP) === true, '480×270 < 960×540');
});

test('isAreaSmallerThanViewport es TRUE cuando área == viewport (caso "cabe justo")', () => {
  // 960×540 == 960×540: la cámara queda centrada (el jugador
  // puede moverse pero la cámara no). El spec dice "cámara
  // centrada cuando el área es ≤ viewport", así que esta
  // condición es parte del caso "centrada".
  assert(isAreaSmallerThanViewport(PLAZA_AREA, VP) === true, 'área == viewport: cabe justo, se centra');
});

test('isAreaSmallerThanViewport es FALSE cuando área > viewport', () => {
  assert(isAreaSmallerThanViewport(BIG_AREA, VP) === false, '1920×1080 > 960×540');
});

test('isAreaSmallerThanViewport maneja un solo eje más chico', () => {
  // 800×1080: w < viewport.w, h > viewport.h. NO se centra.
  const r: Rect = { x: 0, y: 0, w: 800, h: 1080 };
  assert(isAreaSmallerThanViewport(r, VP) === false, 'un solo eje más chico no centra');
});

// ───────────────────────────────────────────────────────────────────────
// 6. isAtBorder
// ───────────────────────────────────────────────────────────────────────
test('isAtBorder en el centro del área 1920×1080', () => {
  const b = isAtBorder({ x: 960, y: 540 }, BIG_AREA, VP);
  assert(b.left === false && b.right === false && b.top === false && b.bottom === false, 'ningún borde');
});

test('isAtBorder en los cuatro bordes del área 1920×1080', () => {
  // Borde izquierdo: cámara x = viewport.w/2 = 480
  const left = isAtBorder({ x: 480, y: 540 }, BIG_AREA, VP);
  assert(left.left === true, 'toca borde izquierdo');
  assert(left.right === false, 'no toca derecho');
  // Borde derecho: cámara x = 1920 - viewport.w/2 = 1440
  const right = isAtBorder({ x: 1440, y: 540 }, BIG_AREA, VP);
  assert(right.right === true, 'toca borde derecho');
  assert(right.left === false, 'no toca izquierdo');
  // Borde superior: cámara y = viewport.h/2 = 270
  const top = isAtBorder({ x: 960, y: 270 }, BIG_AREA, VP);
  assert(top.top === true, 'toca borde superior');
  assert(top.bottom === false, 'no toca inferior');
  // Borde inferior: cámara y = 1080 - viewport.h/2 = 810
  const bottom = isAtBorder({ x: 960, y: 810 }, BIG_AREA, VP);
  assert(bottom.bottom === true, 'toca borde inferior');
  assert(bottom.top === false, 'no toca superior');
});

test('isAtBorder esquina del área', () => {
  const b = isAtBorder({ x: 480, y: 270 }, BIG_AREA, VP);
  assert(b.left === true && b.top === true, 'esquina superior izquierda');
});

// ───────────────────────────────────────────────────────────────────────
// 7. No regresión: área 960×540
// ───────────────────────────────────────────────────────────────────────
test('no regresión: área 960×540 con cualquier target colapsa al mismo corner', () => {
  // Para 960×540 == viewport, el corner siempre debe ser (0, 0).
  // La cámara no se mueve. Verificamos con varios targets.
  for (const t of [
    { x: 0, y: 0 },
    { x: 480, y: 270 },
    { x: 959, y: 539 },
    { x: -100, y: -100 },
    { x: 2000, y: 2000 },
  ]) {
    const corner = clampCenter(t, PLAZA_AREA, VP);
    assert(corner.x === 0, `corner.x = 0 con target (${t.x}, ${t.y}), got ${corner.x}`);
    assert(corner.y === 0, `corner.y = 0 con target (${t.x}, ${t.y}), got ${corner.y}`);
  }
});

// ───────────────────────────────────────────────────────────────────────
// 8. Áreas con offset (no en el origen)
// ───────────────────────────────────────────────────────────────────────
test('clampCenter funciona con un área offset (e.g., mundo Ohmdal)', () => {
  // Área en (-480, -540, 1920, 1080). Límites: x∈[-480, 1440], y∈[-540, 540].
  const corner = clampCenter({ x: -480, y: -540 }, OFFSET_BIG_AREA, VP);
  assert(corner.x === -480, `clamp a -480 (borde izq), got ${corner.x}`);
  assert(corner.y === -540, `clamp a -540 (borde sup), got ${corner.y}`);
  const corner2 = clampCenter({ x: 1440, y: 540 }, OFFSET_BIG_AREA, VP);
  assert(corner2.x === 480, `clamp a 480 (borde der: 1440-960), got ${corner2.x}`);
  assert(corner2.y === 0, `clamp a 0 (borde inf: 540-540), got ${corner2.y}`);
});

// ───────────────────────────────────────────────────────────────────────
// 9. Errores
// ───────────────────────────────────────────────────────────────────────
test('clampCenter rechaza viewport inválido', () => {
  let threw = false;
  try {
    clampCenter({ x: 0, y: 0 }, BIG_AREA, { width: 0, height: 540 });
  } catch {
    threw = true;
  }
  assert(threw, 'viewport width=0 debe lanzar');
});

test('clampCenter rechaza área inválida', () => {
  let threw = false;
  try {
    clampCenter({ x: 0, y: 0 }, { x: 0, y: 0, w: 0, h: 540 }, VP);
  } catch {
    threw = true;
  }
  assert(threw, 'área w=0 debe lanzar');
});

// ───────────────────────────────────────────────────────────────────────
// Run
// ───────────────────────────────────────────────────────────────────────
console.log('Camera director tests:');
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
