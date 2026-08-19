/**
 * ActiveRoom — autoridad de gameplay room-local (ADR-002, R2).
 *
 * Reemplaza la semántica de `activeArea.ts` (que derivaba la autoridad del
 * plano mundo legacy por offsets). Aquí la autoridad es LOCAL:
 *
 *   ActiveRoom { id, width, height, playerLocal }
 *
 * - `playerLocal` es la ÚNICA posición de gameplay autoritativa.
 * - La cámara, la navegación y el clamp derivan del rect local
 *   `(0,0,width,height)` — NUNCA de ox/oy.
 * - `width`/`height` se DERIVAN de `AreaDef` (`areaDimensions(id)`), no se
 *   persisten copias.
 *
 * BRIDGE LEGACY (temporal, R2): el renderer actual todavía construye todas
 * las rooms en el plano world de `world.ts` y el sprite de Phaser vive en
 * coordenadas world. `legacyProjection` es el ÚNICO punto que traduce entre
 * local y ese plano legacy:
 *
 *   legacyWorld = local + activeLegacyPlacementOffset
 *   local       = legacyWorld - activeLegacyPlacementOffset
 *
 * Este bridge se elimina en R5/R6 (cuando el renderer construya sólo la room
 * activa y el sprite viva en local). NO debe filtrarse a RoomGraph, a la
 * autoridad de cámara/navegación, ni a la semántica de colisión room-local.
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
  /** posición LOCAL autoritativa del jugador. */
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

/* ---------------------------------------------------------------------------
 * BRIDGE LEGACY COMPATIBILITY (R2) — se elimina en R5/R6.
 * ------------------------------------------------------------------------- */

export interface LegacyPlacement {
  ox: number;
  oy: number;
}

export interface LegacyProjection {
  /** local → plano legacy (world.ts). LEGACY ONLY. */
  localToLegacyWorld(p: Point, placement: LegacyPlacement): Point;
  /** plano legacy → local. LEGACY ONLY. */
  legacyWorldToLocal(p: Point, placement: LegacyPlacement): Point;
  /** rect local → rect legacy (para camera setBounds mientras el sprite
   *  siga en world). LEGACY ONLY. */
  rectToLegacyWorld(r: Rect, placement: LegacyPlacement): Rect;
}

export const legacyProjection: LegacyProjection = {
  localToLegacyWorld: (p, placement) => ({ x: p.x + placement.ox, y: p.y + placement.oy }),
  legacyWorldToLocal: (p, placement) => ({ x: p.x - placement.ox, y: p.y - placement.oy }),
  rectToLegacyWorld: (r, placement) => ({ x: r.x + placement.ox, y: r.y + placement.oy, w: r.w, h: r.h }),
};
