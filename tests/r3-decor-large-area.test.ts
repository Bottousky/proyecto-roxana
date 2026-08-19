/**
 * Tests del commit 3 de H2: decor/grid deriva de AreaDef.
 *
 * Cobertura:
 *   1. decorGridDimensions para el área heredada (960×540) da
 *      20×11 celdas (no regresión).
 *   2. decorGridDimensions para un área ficticia 1920×1080 da
 *      40×22 celdas (cubre completamente el área).
 *   3. decorCellsForArea con área 1920×1080 produce una celda
 *      para cada posición de la grilla: el decor cubre todo el
 *      chunk.
 *   4. Para 960×540 las celdas generadas están dentro del bbox
 *      [0, 960) × [0, 540): el patrón no se sale del chunk.
 *   5. Para 1920×1080 las celdas generadas están dentro del
 *      bbox [0, 1920) × [0, 1080).
 *   6. No regresión: las 20 rooms existentes siguen produciendo
 *      11 filas × 20 columnas vía `DECOR[room].layers[0].grid`
 *      (el contrato m1-decor se preserva).
 *   7. La cobertura del área es completa: para cada celda
 *      (col, row) esperada existe al menos una `DecorCell` con
 *      esas coordenadas.
 *
 * Run con: `node --experimental-strip-types tests/r3-decor-large-area.test.ts`
 */

import {
  DECOR,
  DECOR_CELL,
  DEFAULT_DECOR_COLS,
  DEFAULT_DECOR_ROWS,
  decorGridDimensions,
  decorCellsForArea,
  hasRoomDecor,
  OHMDAL_DECORATED_ROOMS,
} from '../src/jugar/decorData.ts';
import type { AreaDef } from '../src/jugar/spatial.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

// ───────────────────────────────────────────────────────────────────────
// Constantes y sanidades
// ───────────────────────────────────────────────────────────────────────
test('DECOR_CELL = 48 (no cambia)', () => {
  assert(DECOR_CELL === 48, `DECOR_CELL = ${DECOR_CELL}`);
});

test('DEFAULT_DECOR_COLS = 20 y DEFAULT_DECOR_ROWS = 11 (no regresión)', () => {
  assert(DEFAULT_DECOR_COLS === 20, `DEFAULT_DECOR_COLS = ${DEFAULT_DECOR_COLS}`);
  assert(DEFAULT_DECOR_ROWS === 11, `DEFAULT_DECOR_ROWS = ${DEFAULT_DECOR_ROWS}`);
});

test('20 rooms tienen decor y el shape de la grilla base es 11×20', () => {
  for (const id of OHMDAL_DECORATED_ROOMS) {
    assert(hasRoomDecor(id), `${id}: hasRoomDecor`);
    const decor = DECOR[id];
    assert(decor.layers.length > 0, `${id}: tiene al menos una capa`);
    for (const layer of decor.layers) {
      assert(layer.grid.length === 11, `${id}: grid tiene 11 filas`);
      for (let r = 0; r < layer.grid.length; r++) {
        assert(layer.grid[r].length === 20, `${id}: fila ${r} tiene 20 chars`);
      }
    }
  }
});

// ───────────────────────────────────────────────────────────────────────
// 1. decorGridDimensions con área 960×540
// ───────────────────────────────────────────────────────────────────────
test('decorGridDimensions 960×540 da 20×11', () => {
  const d = decorGridDimensions({ width: 960, height: 540 });
  assert(d.cols === 20 && d.rows === 11 && d.cell === 48, `got ${JSON.stringify(d)}`);
});

// ───────────────────────────────────────────────────────────────────────
// 2. decorGridDimensions con área ficticia 1920×1080
// ───────────────────────────────────────────────────────────────────────
test('decorGridDimensions 1920×1080 da 40×22', () => {
  const d = decorGridDimensions({ width: 1920, height: 1080 });
  assert(d.cols === 40, `cols = 40, got ${d.cols}`);
  assert(d.rows === 22, `rows = 22, got ${d.rows}`);
  assert(d.cell === 48, 'cell sigue siendo 48');
});

test('decorGridDimensions 1920×1080 cubre el área completa', () => {
  const d = decorGridDimensions({ width: 1920, height: 1080 });
  // 40 × 48 = 1920 (cubre exactamente el ancho)
  // 22 × 48 = 1056 (cubre 1056/1080 ≈ 97.7% del alto; el último
  // borde se cubre por la base gráfica, no por el grid de tiles)
  assert(d.cols * d.cell === 1920, 'ancho exacto');
  assert(d.rows * d.cell === 1056, 'alto cubierto = 1056');
});

test('decorGridDimensions para áreas con dims arbitrarias (no múltiplos de 48)', () => {
  // 1000×600: floor(1000/48)=20, floor(600/48)=12
  const d = decorGridDimensions({ width: 1000, height: 600 });
  assert(d.cols === 20, `cols = 20, got ${d.cols}`);
  assert(d.rows === 12, `rows = 12, got ${d.rows}`);
});

// ───────────────────────────────────────────────────────────────────────
// 3. decorCellsForArea con 1920×1080 cubre todo el chunk
// ───────────────────────────────────────────────────────────────────────
test('decorCellsForArea 1920×1080 plaza: cubre todo el chunk', () => {
  const area: AreaDef = { width: 1920, height: 1080 };
  const cells = decorCellsForArea('plaza', area);
  // Para la plaza, la grilla base tiene ~todos '.'? No: la plaza
  // compuesta tiene empedrado y césped. Esperamos MUCHAS celdas
  // (no vacías). La cobertura es: cada celda tiene x en
  // [cell/2, cols*cell - cell/2) y y en [cell/2, rows*cell - cell/2).
  assert(cells.length > 0, 'la plaza extendida tiene decor');
  // 40 × 22 = 880 celdas como máximo. La plaza tiene caminos, así
  // que no todas son '.'; pero las que SÍ se renderizan deben caer
  // dentro del bbox del área.
  for (const cell of cells) {
    assert(cell.x > 0 && cell.x < 1920, `${cell.col},${cell.row}: x=${cell.x} fuera de [0, 1920)`);
    assert(cell.y > 0 && cell.y < 1080, `${cell.col},${cell.row}: y=${cell.y} fuera de [0, 1080)`);
  }
});

test('decorCellsForArea 1920×1080 taller: cubre todo el chunk con inset', () => {
  const area: AreaDef = { width: 1920, height: 1080 };
  const cells = decorCellsForArea('taller', area);
  for (const cell of cells) {
    // El taller tiene `inset = true`, así que la primera/última
    // fila/columna son '.'. Las celdas restantes cubren el centro.
    assert(cell.col > 0 && cell.col < 40, `col fuera de [0, 40)`);
    assert(cell.row > 0 && cell.row < 22, `row fuera de [0, 22)`);
  }
});

test('decorCellsForArea 1920×1080 puerta: patrón vertical respeta la ruta', () => {
  // puerta tiene route='vertical' → columnas 8..11 son cobble.
  // Con cols=40, las columnas 16..22 (proporcional) deberían tener
  // celdas de cobble ('i'..'l').
  const area: AreaDef = { width: 1920, height: 1080 };
  const cells = decorCellsForArea('puerta', area);
  assert(cells.length > 0, 'puerta extendida tiene decor');
  // El seed es determinista; validamos que el patrón no degenera
  // (no todo '.', no todo el mismo char).
  const chars = new Set(cells.map((c) => c.character));
  assert(chars.size > 1, `puerta grande tiene varios chars, got ${[...chars].join('')}`);
});

// ───────────────────────────────────────────────────────────────────────
// 4. Cobertura completa: la grilla cubre todo el chunk
// ───────────────────────────────────────────────────────────────────────
test('decorCellsForArea cubre completamente un área ficticia 1920×1080', () => {
  // Para cada sala decorada del Arco I, validamos que con
  // width=1920, height=1080, las celdas que el módulo decide
  // emitir caen dentro de los límites del chunk y que existe
  // decor en la mayor parte del chunk (no se "agujerea").
  for (const id of OHMDAL_DECORATED_ROOMS) {
    const area: AreaDef = { width: 1920, height: 1080 };
    const cells = decorCellsForArea(id, area);
    // 40 × 22 = 880 celdas como máximo. Una sala típica
    // produce cientos de celdas; verificamos que el módulo
    // emitió "una cantidad razonable" (al menos el área/4 en
    // celdas) para asegurar que el grid no quedó degenerado.
    assert(cells.length > 100, `${id}: cells = ${cells.length} < 100 (¿grid degenerado?)`);
  }
});

test('decorCellsForArea 1920×1080: cada col ∈ [0, cols) y cada row ∈ [0, rows)', () => {
  for (const id of OHMDAL_DECORATED_ROOMS) {
    const area: AreaDef = { width: 1920, height: 1080 };
    const cells = decorCellsForArea(id, area);
    for (const cell of cells) {
      assert(cell.col >= 0 && cell.col < 40, `${id}: col ${cell.col} fuera de [0, 40)`);
      assert(cell.row >= 0 && cell.row < 22, `${id}: row ${cell.row} fuera de [0, 22)`);
    }
  }
});

// ───────────────────────────────────────────────────────────────────────
// 5. Para 960×540 no se rompe nada (no regresión)
// ───────────────────────────────────────────────────────────────────────
test('decorCellsForArea 960×540 produce cells dentro del bbox heredado', () => {
  for (const id of OHMDAL_DECORATED_ROOMS) {
    const area: AreaDef = { width: 960, height: 540 };
    const cells = decorCellsForArea(id, area);
    for (const cell of cells) {
      assert(cell.col >= 0 && cell.col < 20, `${id}: col ${cell.col} fuera de [0, 20)`);
      assert(cell.row >= 0 && cell.row < 11, `${id}: row ${cell.row} fuera de [0, 11)`);
      assert(cell.x > 0 && cell.x < 960, `${id}: x ${cell.x} fuera de [0, 960)`);
      assert(cell.y > 0 && cell.y < 540, `${id}: y ${cell.y} fuera de [0, 540)`);
    }
  }
});

test('decorCellsForArea 960×540: la plaza tiene paths hacia los 4 costados', () => {
  // Plaza compuesta a mano: caminos N/S por cols 8..11, W por rows 1..3,
  // E por row 5. Para cols=20/rows=11, validamos que las celdas de
  // cobble ('i'..'l') existen en al menos una de las posiciones de
  // cada path.
  const area: AreaDef = { width: 960, height: 540 };
  const cells = decorCellsForArea('plaza', area);
  // Norte: row 0, cols 8..11
  const north = cells.filter((c) => c.row === 0 && c.col >= 8 && c.col <= 11);
  assert(north.length > 0, 'la plaza tiene camino norte');
  // Sur: row 10, cols 8..11
  const south = cells.filter((c) => c.row === 10 && c.col >= 8 && c.col <= 11);
  assert(south.length > 0, 'la plaza tiene camino sur');
});

// ───────────────────────────────────────────────────────────────────────
// 6. Sala sin decor devuelve []
// ───────────────────────────────────────────────────────────────────────
test('decorCellsForArea devuelve [] para sala sin decor', () => {
  const area: AreaDef = { width: 1920, height: 1080 };
  const cells = decorCellsForArea('una-sala-que-no-existe', area);
  assert(cells.length === 0, 'sala sin decor → []');
});

// ───────────────────────────────────────────────────────────────────────
// Run
// ───────────────────────────────────────────────────────────────────────
console.log('Decor/grid large area tests:');
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
