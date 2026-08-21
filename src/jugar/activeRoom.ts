/**
 * ActiveRoom — autoridad de gameplay room-local (ADR-002, R2/R6).
 *
 *   ActiveRoom { id, width, height, playerLocal }
 *
 * - `playerLocal` es la ÚNICA posición de gameplay autoritativa.
 *   El sprite de Phaser (`player.x`, `player.y`) es la misma posición:
 *   NO existe un puente legacy a un plano mundo de offsets.
 * - La cámara, la navegación y el clamp derivan del rect local
 *   `(0, 0, width, height)` — NUNCA de ox/oy.
 * - `width`/`height` se DERIVAN de `RoomSceneProfile` (`areaDimensions(id)`),
 *   no se persisten copias.
 *
 * R6: extirpó el bridge `legacyProjection` que traducía entre coordenadas
 * locales y un plano world heredado. Cualquier necesidad residual de
 * "placement" debe resolverse vía `RoomGraph` (topología) o vía el mapa
 * esquemático (`mapSchematic.ts`) — NUNCA vía offsets de mundo continuo.
 */

import { areaDimensions } from './roomScenesData.ts';

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

export interface ActiveRoom {
  /** roomId de la room activa. */
  id: string;
  /** dimensiones LOCALES de la room (derivadas de RoomSceneProfile). */
  width: number;
  height: number;
  /** posición LOCAL autoritativa del jugador (== player.x, player.y). */
  playerLocal: Point;
}

/** Spawn por defecto documentado (coincide con el default del runtime:
 *  centro horizontal, y = height - 90). */
export function defaultLocalSpawn(dims: { width: number; height: number }): Point {
  return { x: dims.width / 2, y: dims.height - 90 };
}

/** Crea el ActiveRoom de una room: deriva width/height del perfil y fija el
 *  spawn local (o el default). Cada llamada devuelve un objeto nuevo: el
 *  cambio de room es atómico (id + dims + playerLocal se reemplazan juntos). */
export function createActiveRoom(id: string, localSpawn?: Point): ActiveRoom {
  const d = areaDimensions(id);
  return {
    id,
    width: d.width,
    height: d.height,
    playerLocal: localSpawn ? { x: localSpawn.x, y: localSpawn.y } : defaultLocalSpawn(d),
  };
}

/** Rect LOCAL del área activa: la cámara y la navegación consumen SIEMPRE
 *  este rect, con independencia de cualquier colocación legacy. */
export function activeRoomLocalBounds(room: ActiveRoom): Rect {
  return { x: 0, y: 0, w: room.width, h: room.height };
}

/** ¿El punto local cae dentro del área? (semántica nominal [0, width)×[0, height)). */
export function isPlayerLocalInside(room: ActiveRoom, p: Point): boolean {
  return p.x >= 0 && p.x < room.width && p.y >= 0 && p.y < room.height;
}

/** Clamp LOCAL del jugador contra las dimensiones de la room (no el
 *  viewport). Convención matemáticamente consistente (R4): el jugador vive
 *  en `[0, width) × [0, height)`. El límite superior es ESTRICTO (max =
 *  width - 1): ya NO existe la señal de cruce por `x === width` — los
 *  cambios de room son transiciones de grafo disparadas por la salida LOCAL,
 *  nunca por alcanzar el borde del área. */
export function clampLocal(room: ActiveRoom, p: Point): Point {
  return {
    x: clamp(p.x, 0, Math.max(0, room.width - 1)),
    y: clamp(p.y, 0, Math.max(0, room.height - 1)),
  };
}

export function isSameActiveRoom(a: ActiveRoom | null, b: ActiveRoom | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.id === b.id && a.width === b.width && a.height === b.height;
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}
