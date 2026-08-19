/**
 * Contrato espacial del runtime de Phaser (`src/jugar/`).
 *
 * El runtime trabaja con dos sistemas de coordenadas:
 *
 *  - **Local (de sala / chunk)**: 0 ≤ x < width, 0 ≤ y < height. Las
 *    `walkable`, `collision`, `doors`, `entries` y `things` de cada
 *    `RoomSceneProfile` viven en este sistema. Independiente del
 *    viewport y del lugar que el chunk ocupe en el mundo continuo.
 *
 *  - **World (de mundo continuo)**: los chunks se ubican en un plano
 *    por medio de `(ox, oy)`. Las posiciones de actores, sólidos y
 *    puertas que comparte el runtime se manejan en este sistema.
 *
 * El commit 3 del refactor multi-área introduce esta capa explícita
 * para que las 20 rooms existentes (todavía 960×540) convivan con
 * áreas futuras que pueden medir varios viewports sin que la
 * navegación ni la cámara dependan del tamaño del viewport.
 *
 * Reglas duras del contrato:
 *
 *  1. `localToWorld` y `worldToLocal` son traslaciones puras: no
 *     escalan, no rotan, no invierten. Sólo suman o restan `(ox, oy)`.
 *
 *  2. `AreaDef` describe el rectángulo lógico de un área. Sus valores
 *     se interpretan siempre como `width > 0` y `height > 0`. Si una
 *     sala no los declara, `areaDimensions()` ya devuelve
 *     `DEFAULT_AREA_WIDTH × DEFAULT_AREA_HEIGHT` (960×540).
 *
 *  3. `isPointInsideArea` valida contra el bounding box LOCAL del
 *     área. El offset (ox, oy) no entra: eso es tarea del pathfinder
 *     y de `chunkAt()` en runtime, no de este helper.
 *
 *  4. `navigationBounds(area)` devuelve el rectángulo en coordenadas
 *     LOCAL donde el pathfinder puede explorar. La navegación nunca
 *     debe mirar al viewport; debe mirar al área activa.
 *
 *  5. `unionAreaBounds(chunks, areaLookup)` describe el rectángulo en
 *     coordenadas WORLD que ocupa la unión de varios chunks. Es lo
 *     que la cámara usaba hasta ahora y lo que `CameraDirector`
 *     consume como input.
 */

import {
  areaDimensions,
  isPointInsideArea as _isPointInsideArea,
  DEFAULT_AREA_WIDTH,
  DEFAULT_AREA_HEIGHT,
} from './roomScenesData.ts';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AreaDef {
  /** Ancho lógico del área en píxeles de diseño (siempre > 0). */
  width: number;
  /** Alto lógico del área en píxeles de diseño (siempre > 0). */
  height: number;
}

export interface ChunkPlacement {
  /** roomId del chunk (sala pintada o entry-point de un sector). */
  id: string;
  /** Offset del chunk en el plano del mundo continuo. */
  ox: number;
  oy: number;
  /** Dimensiones lógicas del chunk. */
  width: number;
  height: number;
}

/** Tamaño del viewport del juego. El runtime sigue anclado a 960×540
 *  aunque un `AreaDef` pueda medir varios viewports. La cámara
 *  compone `AreaDef` + `viewportSize` para decidir si sigue al
 *  jugador o se queda fija. */
export const VIEWPORT_WIDTH = DEFAULT_AREA_WIDTH;
export const VIEWPORT_HEIGHT = DEFAULT_AREA_HEIGHT;

export function viewportSize(): { width: number; height: number } {
  return { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT };
}

/** Dimensiones lógicas de un área, normalizadas (positivas). Pasa
 *  por `areaDimensions` para mantener la regla "default 960×540 si
 *  no están declaradas". */
export function getAreaDef(roomId: string): AreaDef {
  const d = areaDimensions(roomId);
  return { width: d.width, height: d.height };
}

/** Traslación local → world. `(0, 0)` local en un chunk ubicado en
 *  `(ox, oy)` vive en world `(ox, oy)`. */
export function localToWorld(local: Point, chunk: { ox: number; oy: number }): Point {
  return { x: local.x + chunk.ox, y: local.y + chunk.oy };
}

/** Traslación world → local. Inversa exacta de `localToWorld`. */
export function worldToLocal(world: Point, chunk: { ox: number; oy: number }): Point {
  return { x: world.x - chunk.ox, y: world.y - chunk.oy };
}

/** Rectángulo en world que ocupa un chunk. Combinación de su
 *  offset y sus dimensiones lógicas. */
export function chunkRectWorld(chunk: { ox: number; oy: number; width: number; height: number }): Rect {
  return { x: chunk.ox, y: chunk.oy, w: chunk.width, h: chunk.height };
}

/** ¿El punto LOCAL (lx, ly) cae dentro del bounding box del área?
 *  Helper reexportado para que el resto del runtime dependa de un
 *  único punto de entrada. */
export function isPointInsideArea(roomId: string, lx: number, ly: number): boolean {
  return _isPointInsideArea(roomId, lx, ly);
}

/** Rectángulo LOCAL en el que el pathfinder puede explorar. Coincide
 *  con el bounding box del área. La navegación NPC (orthogonal step
 *  search) usa estos límites en lugar del viewport. */
export function navigationBounds(area: AreaDef): Rect {
  return { x: 0, y: 0, w: area.width, h: area.height };
}

/** Unión de varios chunks en coordenadas WORLD. **No** es la
 *  autoridad de cámara ni de navegación: ese rol lo ocupa
 *  `activeAreaBounds` (ver `activeArea.ts`). Esta función queda
 *  reservada para uso de **render-scope**: campo-base
 *  (`tileSprite` que tapa el vacío entre distritos), mapa del
 *  mundo, debug overlays, futuras decisiones de streaming/cache.
 *
 *  El CameraDirector y la navegación consumen sólo
 *  `chunkRectWorld(activeAreaPlacement)` — un solo chunk a la
 *  vez. Mezclar `unionAreaBounds` con cámara o pathfinder
 *  reintroduce el bug conceptual del commit 3 original. */
export function unionAreaBounds(chunks: ChunkPlacement[]): Rect | null {
  if (chunks.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of chunks) {
    if (c.ox < minX) minX = c.ox;
    if (c.oy < minY) minY = c.oy;
    if (c.ox + c.width > maxX) maxX = c.ox + c.width;
    if (c.oy + c.height > maxY) maxY = c.oy + c.height;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Centro en world de un chunk: `(ox + width/2, oy + height/2)`. */
export function chunkCenterWorld(chunk: { ox: number; oy: number; width: number; height: number }): Point {
  return { x: chunk.ox + chunk.width / 2, y: chunk.oy + chunk.height / 2 };
}

/** ¿El punto WORLD (wx, wy) cae dentro del rect del chunk? */
export function isPointInsideChunk(
  wx: number,
  wy: number,
  chunk: { ox: number; oy: number; width: number; height: number },
): boolean {
  return wx >= chunk.ox && wx < chunk.ox + chunk.width && wy >= chunk.oy && wy < chunk.oy + chunk.height;
}

/** Construye un ChunkPlacement a partir de un `roomId` y su offset.
 *  Usa `areaDimensions` para que la firma sea estable. */
export function chunkPlacement(
  roomId: string,
  ox: number,
  oy: number,
): ChunkPlacement {
  const d = areaDimensions(roomId);
  return { id: roomId, ox, oy, width: d.width, height: d.height };
}
