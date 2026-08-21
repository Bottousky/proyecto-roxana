/**
 * Helpers espaciales room-local para el runtime de Phaser (`src/jugar/`).
 *
 * Tras R5/R6 el modelo de juego es **room-based**: cada room vive en su
 * propio sistema de coordenadas `[0, width) × [0, height)`. Ya NO existe
 * un plano mundo compartido por offsets `(ox, oy)`. Esta capa conserva
 * los helpers genuinamente room-local que siguen siendo útiles:
 *
 *   - `Rect` / `Point` / `AreaDef`: tipos espaciales puros.
 *   - `getAreaDef(roomId)`: dimensiones de un área (deriva defaults).
 *   - `navigationBounds(area)`: rect LOCAL donde el pathfinder explora.
 *   - `isPointInsideArea(roomId, lx, ly)`: pertenencia al bbox local.
 *   - `VIEWPORT_WIDTH` / `VIEWPORT_HEIGHT`: tamaño del viewport.
 *   - `viewportSize()`: tupla viewport.
 *
 * R6 retiró de este módulo:
 *   - `unionAreaBounds` (autoridad de un mundo continuo que ya no existe)
 *   - `chunkRectWorld` / `chunkCenterWorld` (id.)
 *   - `isPointInsideChunk` (id.)
 *   - `chunkPlacement` (id.)
 *   - `localToWorld` / `worldToLocal` (bridge legacy eliminado)
 *   - `ChunkPlacement` (interfaz de un chunk del mundo continuo)
 *
 * Si una integración externa todavía necesita estos helpers, debe migrar
 * a `RoomGraph` (topología) + `activeRoomLocalBounds` (geometría local).
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
