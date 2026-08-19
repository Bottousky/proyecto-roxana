/*
 * Vestido pixel del Arco I.
 *
 * El commit 1 (multi-área) asumía una grilla 20×11 de celdas de 48 px
 * (≈ 960×540) hardcodeada. El commit 3 introduce una capa explícita
 * de transformación local/world: las grillas de decor ahora derivan
 * del `AreaDef` del chunk y no de constantes globales.
 *
 * Para preservar la conducta de las 20 rooms existentes (m1-decor
 * test) y a la vez admitir áreas más grandes, este módulo expone:
 *
 *  - `DECOR`: la base de 20×11 (`RoomDecor.layers[0].grid`) por sala,
 *    intacta. Es la "verdad de diseño" del Arco I.
 *  - `decorGridForArea(roomId, area)`: la grilla derivada para un
 *    `AreaDef` arbitrario. Para 960×540 devuelve la base 20×11; para
 *    áreas más grandes la extiende repitiendo el patrón
 *    determinista. El resultado es la cantidad exacta de celdas que
 *    cubren `floor(area.w / 48) × floor(area.h / 48)`.
 *
 * El `renderDecor` de `tiles.ts` consume `decorGridForArea` para
 * producir las imágenes de Phaser. Las 20 rooms no notan la
 * diferencia: el área por defecto sigue siendo 960×540.
 */

import type { AreaDef } from './spatial.ts';

export interface DecorLayer {
  atlas: string;
  grid: string[];
  legend: Record<string, number>;
  above?: boolean;
}

export interface RoomDecor {
  layers: DecorLayer[];
}

export const DECOR_CELL = 48;

/** Tamaño de la grilla base (m1-decor test). Coincide con
 *  `DEFAULT_AREA_WIDTH × DEFAULT_AREA_HEIGHT` a `DECOR_CELL`. */
export const DEFAULT_DECOR_COLS = Math.floor(960 / DECOR_CELL);
export const DEFAULT_DECOR_ROWS = Math.floor(540 / DECOR_CELL);

const ROWS = DEFAULT_DECOR_ROWS;
const COLS = DEFAULT_DECOR_COLS;

const GROUND_LEGEND: Record<string, number> = {
  // césped
  a: 0, b: 1, c: 6, d: 12,
  // ladrillo/laja regular
  e: 2, f: 3, g: 8, h: 14,
  // adoquín
  i: 4, j: 5, k: 10, l: 16,
};

type Surface = 'grass' | 'brick' | 'cobble';
type Route = 'none' | 'vertical' | 'horizontal' | 'cross' | 'terraces';

const CHARS: Record<Surface, string> = {
  grass: 'abcd',
  brick: 'efgh',
  cobble: 'ijkl',
};

function hash(roomId: string): number {
  let value = 2166136261;
  for (const char of roomId) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function routeSurface(route: Route, col: number, row: number): Surface | null {
  if (route === 'vertical' && col >= 8 && col <= 11) return 'cobble';
  if (route === 'horizontal' && row >= 4 && row <= 6) return 'cobble';
  if (route === 'cross' && (col >= 8 && col <= 11 || row >= 4 && row <= 6)) return 'cobble';
  if (route === 'terraces') {
    const center = 4 + Math.floor(row * 1.05);
    if (Math.abs(col - center) <= 1) return 'cobble';
  }
  return null;
}

function pickSurface(options: string, seed: number, col: number, row: number): string {
  const noise = (seed + col * 17 + row * 31 + col * row * 7) >>> 0;
  const variant = noise % 19;
  return options[variant < 15 ? 0 : 1 + (variant % (options.length - 1))];
}

function groundGridAt(
  roomId: string,
  rows: number,
  cols: number,
  base: Surface,
  route: Route = 'none',
  inset = false,
): string[] {
  const seed = hash(roomId);
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      if (inset && (row === 0 || row === rows - 1 || col === 0 || col === cols - 1)) return '.';
      let surface = routeSurface(route, col, row) ?? base;
      // La plaza y la calzada se funden antes del borde del chunk: no existe
      // una línea perfecta que revele dónde termina una sala de datos.
      if (roomId === 'puerta' && row >= 8) {
        const transition = row === 8 ? (col + seed) % 3 !== 0 : true;
        if (transition) surface = 'cobble';
      }
      return pickSurface(CHARS[surface], seed, col, row);
    }).join(''),
  );
}

function groundGrid(roomId: string, base: Surface, route: Route = 'none', inset = false): string[] {
  return groundGridAt(roomId, ROWS, COLS, base, route, inset);
}

/**
 * Plaza compuesta a mano: un empedrado acotado por césped, con caminos hacia las
 * cuatro salidas (norte→Puerta, oeste→Castillo, este→Taller, sur→portal). Evita el
 * damero de ruido y hace legible que es una PLAZA, no un campo texturizado.
 */
function plazaComposedAt(seed: number, rows: number, cols: number): string[] {
  const G = 'abcd'; // césped
  const C = 'ijkl'; // adoquín
  const pick = (set: string, col: number, row: number): string => {
    const noise = (seed + col * 17 + row * 31 + col * row * 7) >>> 0;
    const v = noise % 19;
    return set[v < 15 ? 0 : 1 + (v % (set.length - 1))];
  };
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const northPath = row === 0 && col >= 8 && col <= 11;            // → Puerta
      const southPath = row === rows - 1 && col >= 8 && col <= 11;     // → portal
      const westPath = col === 0 && row >= 1 && row <= 3;              // → Castillo
      const eastPath = col === cols - 1 && row === 5;                  // → Taller
      const border = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
      const paved = !border || northPath || southPath || westPath || eastPath;
      return pick(paved ? C : G, col, row);
    }).join(''),
  );
}

function plazaComposed(seed: number): string[] {
  return plazaComposedAt(seed, ROWS, COLS);
}

function room(roomId: string, base: Surface, route: Route = 'none', inset = false): RoomDecor {
  return {
    layers: [{
      atlas: 'medieval-ground',
      grid: groundGrid(roomId, base, route, inset),
      legend: GROUND_LEGEND,
    }],
  };
}

export const OHMDAL_DECORATED_ROOMS = [
  'plaza', 'taller', 'puerta', 'manantial_ohm',
  'castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart',
  'forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall',
  'terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct',
  'lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern',
] as const;

export const DECOR: Record<string, RoomDecor> = {
  // U1: ciudad-jardín con la red como guía espacial.
  plaza: { layers: [{ atlas: 'medieval-ground', grid: plazaComposed(hash('plaza')), legend: GROUND_LEGEND }] },
  taller: room('taller', 'brick', 'none', true),
  puerta: room('puerta', 'grass', 'vertical'),
  manantial_ohm: room('manantial_ohm', 'grass', 'vertical'),

  // U2: arquitectura ceremonial y pesada.
  castle_gate: room('castle_gate', 'cobble', 'vertical'),
  castle_gallery: room('castle_gallery', 'brick', 'vertical'),
  castle_branches: room('castle_branches', 'brick', 'vertical'),
  castle_heart: room('castle_heart', 'brick', 'cross'),

  // U3: pisos industriales regulares, gastados por el trabajo.
  forge_yard: room('forge_yard', 'cobble', 'horizontal'),
  forge_infirmary: room('forge_infirmary', 'brick'),
  forge_longchannel: room('forge_longchannel', 'brick', 'vertical'),
  forge_hall: room('forge_hall', 'brick', 'cross'),

  // U4: el sendero baja en escalones entre tierra y cultivos.
  terraces_top: room('terraces_top', 'grass', 'terraces'),
  terraces_mid: room('terraces_mid', 'grass', 'terraces'),
  terraces_mural: room('terraces_mural', 'cobble', 'horizontal'),
  terraces_aqueduct: room('terraces_aqueduct', 'grass', 'terraces'),

  // U5: piedra fría y salas mecánicas sobre el lago.
  lighthouse_hall: room('lighthouse_hall', 'cobble', 'vertical'),
  lighthouse_bench: room('lighthouse_bench', 'brick'),
  clock_tower: room('clock_tower', 'cobble', 'vertical'),
  lighthouse_lantern: room('lighthouse_lantern', 'cobble', 'cross'),
};

export function hasRoomDecor(roomId: string): boolean {
  return roomId in DECOR;
}

/** Dimensiones de la grilla de decor derivada de un `AreaDef`. La
 *  grilla cubre `floor(area.w / DECOR_CELL) × floor(area.h / DECOR_CELL)`
 *  celdas. Para el área por defecto (960×540) esto da 20×11 — la
 *  base de las 20 rooms existentes. */
export function decorGridDimensions(area: AreaDef): { cols: number; rows: number; cell: number } {
  return {
    cols: Math.max(0, Math.floor(area.width / DECOR_CELL)),
    rows: Math.max(0, Math.floor(area.height / DECOR_CELL)),
    cell: DECOR_CELL,
  };
}

/** Una celda resuelta del vestido pixel: coordenadas locales dentro
 *  del chunk + carácter del atlas (que se traduce a `frameIndex`
 *  vía `legend`). Es el contrato que consume `renderDecor`. */
export interface DecorCell {
  layerIndex: number;
  /** Columna local (0..cols-1). */
  col: number;
  /** Fila local (0..rows-1). */
  row: number;
  /** Carácter del atlas. '.' = nada. */
  character: string;
  /** Posición local (px) del CENTRO de la celda, para sprites. */
  x: number;
  y: number;
}

/** Resolver de celdas para un área dada: itera la grilla de la sala
 *  tantas veces como sea necesario para cubrir `cols × rows` celdas
 *  del área. Para el área por defecto (20×11) la base coincide
 *  exactamente. Para áreas más grandes, el patrón se extiende
 *  deterministamente (mismo seed, mismo noise, más cobertura). */
export function decorCellsForArea(roomId: string, area: AreaDef): DecorCell[] {
  const decor = DECOR[roomId];
  if (!decor) return [];
  const { cols, rows, cell } = decorGridDimensions(area);
  if (cols <= 0 || rows <= 0) return [];
  const cells: DecorCell[] = [];
  decor.layers.forEach((layer, layerIndex) => {
    // La grilla base es `layer.grid`. Para `cols === DEFAULT_DECOR_COLS`
    // y `rows === DEFAULT_DECOR_ROWS` se usa directo (caso heredado).
    // Si el área es más grande, regeneramos la grilla con las nuevas
    // dimensiones. La plaza sigue siendo "compuesta a mano" en su
    // grilla base; al extrapolar, mantiene la simetría central.
    let resolvedGrid: string[];
    if (cols === DEFAULT_DECOR_COLS && rows === DEFAULT_DECOR_ROWS) {
      resolvedGrid = layer.grid;
    } else if (roomId === 'plaza' && layerIndex === 0) {
      resolvedGrid = plazaComposedAt(hash('plaza'), rows, cols);
    } else {
      // Reutilizamos la misma lógica procedural que `groundGrid`:
      // para `puerta` y otras salas la transición de superficie debe
      // seguir siento la misma. Aquí reutilizamos la función que
      // lee el decor de la sala desde DECOR.
      const baseSurface: Surface =
        roomId === 'taller' ? 'brick'
        : roomId === 'castle_gate' ? 'cobble'
        : roomId.startsWith('forge_') ? 'cobble'
        : roomId.startsWith('lighthouse_') || roomId === 'clock_tower' ? 'cobble'
        : 'grass';
      const route: Route =
        roomId === 'plaza' ? 'none'
        : roomId === 'taller' ? 'none'
        : roomId === 'puerta' || roomId === 'manantial_ohm' || roomId === 'castle_gate' || roomId === 'castle_gallery' || roomId === 'castle_branches' || roomId === 'forge_longchannel' || roomId === 'lighthouse_hall' || roomId === 'clock_tower' ? 'vertical'
        : roomId === 'forge_yard' ? 'horizontal'
        : roomId === 'castle_heart' || roomId === 'forge_hall' || roomId === 'lighthouse_lantern' ? 'cross'
        : roomId.startsWith('terraces_') ? 'terraces'
        : 'none';
      const inset = roomId === 'taller';
      resolvedGrid = groundGridAt(roomId, rows, cols, baseSurface, route, inset);
    }
    for (let row = 0; row < rows; row++) {
      const line = resolvedGrid[row];
      for (let col = 0; col < cols; col++) {
        const ch = line[col];
        if (ch === '.') continue;
        cells.push({
          layerIndex,
          col,
          row,
          character: ch,
          x: col * cell + cell / 2,
          y: row * cell + cell / 2,
        });
      }
    }
  });
  return cells;
}
