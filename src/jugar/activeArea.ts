/**
 * ⚠ LEGACY — conservado transitoriamente.
 *
 * Desde R2 (ADR-002) la autoridad de gameplay vive en `activeRoom.ts`
 * (`ActiveRoom` con `playerLocal` room-local + `legacyProjection`), NO en
 * este módulo. Este archivo derivaba la autoridad del plano mundo legacy
 * por offsets (`LoadedChunks` / `ChunkPlacement` / rect world) y se conserva
 * SÓLO porque `tests/c4-plaza-large-greybox.test.ts` aún lo consume hasta su
 * reescritura (TEST_TAXONOMY). No debe usarse en runtime nuevo.
 *
 * ActiveArea — semántica explícita del "área donde está el jugador"
 * frente al conjunto de "chunks cargados".
 *
 * Esta capa existe porque el commit 3 original trataba los chunks
 * cargados como autoridad de cámara y navegación, vía
 * `unionAreaBounds(loadedChunks)`. Eso era conceptualmente
 * incorrecto: si el mundo carga Plaza + Taller + Portal pero el
 * jugador está parado en Plaza, la cámara debe seguir a Plaza,
 * no al bounding box de los tres. El CameraDirector recibe el
 * activeAreaBounds (un solo chunk) y la navegación se limita a él.
 *
 * Los chunks cargados siguen siendo útiles para:
 *   - render del campo-base (`tileSprite` que tapa el vacío entre
 *     distritos);
 *   - mapa del mundo y debug overlays;
 *   - futuras decisiones de streaming / cache;
 *   - transición entre chunks.
 *
 * Pero `unionAreaBounds(loadedChunks)` ya NO es la autoridad de
 * cámara ni de pathfinding. Eso es `activeAreaBounds`, derivado
 * de `chunkRectWorld(activeAreaPlacement)`.
 *
 * Reglas de actualización (atomicidad):
 *   - `resolveActiveArea(loadedChunks, targetId)` produce el
 *     nuevo estado a partir de un catálogo de chunks y un id.
 *   - `transitionActiveArea(loadedChunks, currentId, targetId,
 *     sink)` aplica el cambio al sink atómicamente y devuelve el
 *     nuevo estado. Si el id no está cargado, devuelve null.
 *   - `enterArea` en `ExplorationScene` usa estas funciones para
 *     garantizar que `activeAreaId`, `activeAreaPlacement`,
 *     `activeAreaBounds` y los bounds Phaser cambian juntos
 *     antes de que el siguiente frame toque cualquiera de ellos.
 */

import {
  chunkPlacement,
  chunkRectWorld,
  navigationBounds as _navigationBounds,
  type AreaDef,
  type ChunkPlacement,
  type Rect,
} from './spatial.ts';
import {
  cameraBounds,
  type ViewportSize,
} from './cameraDirector.ts';

export interface ActiveAreaState {
  /** Id del chunk activo (roomId). */
  id: string;
  /** Placement WORLD del chunk: (ox, oy, width, height). */
  placement: ChunkPlacement;
  /** Bbox WORLD del área activa = `chunkRectWorld(placement)`. */
  bounds: Rect;
}

/** Tipo de catálogo de chunks cargados. La forma real en
 *  `ExplorationScene` viene de `WORLDS[].rooms`; aquí la
 *  reduciomos a `(ox, oy)` para que este módulo no dependa de
 *  `world.ts` ni del registry. */
export type LoadedChunks = Record<string, { ox: number; oy: number }>;

/** Resuelve el área activa a partir del catálogo cargado y un id
 *  destino. Devuelve `null` si el id no está cargado (el chunk
 *  todavía no se montó, o nunca existió en el mundo del roomId).
 *  El estado que devuelve es completamente derivable: NO muta
 *  nada externo. */
export function resolveActiveArea(
  loadedChunks: LoadedChunks,
  targetId: string,
): ActiveAreaState | null {
  const offset = loadedChunks[targetId];
  if (!offset) return null;
  const placement = chunkPlacement(targetId, offset.ox, offset.oy);
  return {
    id: targetId,
    placement,
    bounds: chunkRectWorld(placement),
  };
}

/** Bbox que la cámara debe usar para el área activa. Es
 *  exactamente `cameraBounds(activeArea.bounds, viewport)`. La
 *  indirección existe para que la firma del CameraDirector
 *  consuma siempre un solo chunk (single source of truth). */
export function activeAreaCameraBounds(
  state: ActiveAreaState,
  viewport: ViewportSize,
): Rect {
  return cameraBounds(state.bounds, viewport);
}

/** Rect LOCAL en el que el pathfinder puede explorar. Coincide
 *  con el bbox del chunk en su propio sistema de coordenadas
 *  (origen local = (0, 0), dimensiones = width/height del
 *  chunk). El pathfinder nunca debe mirar el viewport. */
export function activeAreaNavigationBounds(state: ActiveAreaState): Rect {
  const area: AreaDef = { width: state.placement.width, height: state.placement.height };
  return _navigationBounds(area);
}

/** Sink al que `transitionActiveArea` aplica el cambio. Es un
 *  subset de `Phaser.Cameras.Scene2D.Camera` para que este módulo
 *  no dependa de Phaser. */
export interface CameraSink {
  setBounds: (x: number, y: number, w: number, h: number) => void;
  viewport: ViewportSize;
}

/** Aplica una transición atómica de área activa. El cambio es
 *  simultáneo en:
 *    1. `activeAreaId` → `targetId`
 *    2. `activeAreaPlacement` → placement del targetId
 *    3. `activeAreaBounds` → chunkRectWorld del targetId
 *    4. `camera.setBounds(...)` → resultado de `activeAreaCameraBounds`
 *
 *  La navegación se evalúa por llamada a `activeAreaNavigationBounds`,
 *  no guarda estado propio, así que no requiere actualización.
 *
 *  Si el targetId no está en `loadedChunks` o coincide con el
 *  currentId, devuelve `null` (no-op) y NO toca el sink. La
 *  invariante "los tres campos cambian juntos" se mantiene
 *  porque, cuando se llama con un targetId válido, el sink
 *  recibe los nuevos bounds antes de que la función devuelva. */
export function transitionActiveArea(
  loadedChunks: LoadedChunks,
  currentId: string,
  targetId: string,
  sink: CameraSink,
): ActiveAreaState | null {
  if (targetId === currentId) return null;
  const next = resolveActiveArea(loadedChunks, targetId);
  if (!next) return null;
  // Actualización atómica del sink (Phaser setBounds). Phaser
  // internamente clampea el scroll del camera a estos bounds.
  const cb = activeAreaCameraBounds(next, sink.viewport);
  sink.setBounds(cb.x, cb.y, cb.w, cb.h);
  return next;
}

/** ¿Dos `ActiveAreaState` describen el mismo chunk? Útil para
 *  pruebas y para evitar `loadRoom` redundante. */
export function isSameActiveArea(
  a: ActiveAreaState | null,
  b: ActiveAreaState | null,
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.id === b.id
    && a.placement.ox === b.placement.ox
    && a.placement.oy === b.placement.oy
    && a.placement.width === b.placement.width
    && a.placement.height === b.placement.height;
}
