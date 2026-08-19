/**
 * roomTransitions.ts — R4 / transiciones de room dirigidas por RoomGraph.
 *
 * El cambio de room es AHORA una transición de GRAFO, no adyacencia física.
 * `from + exitId` es la consulta autoritativa; el destino es un RESULTADO.
 *
 * Este módulo es PURO y testeable en Node (sin Phaser, sin world.ts):
 *   - `evaluateExit` : evalúa visibilidad + lock de la salida.
 *   - `resolveTransition` : resuelve destino + entry local + kind + el
 *     ActiveRoom de destino (atómico).
 *   - `createTransitionLock` : guard determinista para impedir transiciones
 *     duplicadas mientras corre una.
 *
 * La PRESENTACIÓN (fade, choreografía de NPC) vive en la escena
 * (ExplorationScene.performTransition), no aquí. La narrativa/flags siguen
 * en sus dueños existentes (state.flags, RoomDef).
 */

import type { RoomGraph, RoomConnection, ResolvedRoomConnection } from './roomGraph.ts';
import { createActiveRoom, type ActiveRoom } from './activeRoom.ts';

/** Resultado de evaluar si una salida puede transicionar. */
export type TransitionBlock =
  | { ok: true }
  | { ok: false; reason: 'no-connection' }
  | { ok: false; reason: 'hidden' }
  | { ok: false; reason: 'locked'; lines: unknown };

export interface ExitEvaluation {
  connection?: RoomConnection;
  block: TransitionBlock;
}

/**
 * Evalúa la salida `exitId` de `fromId` contra el grafo.
 * - `visible() === false` → oculta (no transiciona).
 * - `locked()` truthy → bloqueada (no transiciona); `lines` lleva las
 *   líneas diegéticas para el feedback (DoorDef.locked()).
 * Sin duplicar predicados: consume los de la door fuente (referenciados).
 */
export function evaluateExit(graph: RoomGraph, fromId: string, exitId: string): ExitEvaluation {
  const conn = graph.connection(fromId, exitId);
  if (!conn) return { block: { ok: false, reason: 'no-connection' } };
  if (conn.visible && conn.visible() === false) {
    return { connection: conn, block: { ok: false, reason: 'hidden' } };
  }
  const locked = conn.locked ? conn.locked() : null;
  if (locked) {
    return { connection: conn, block: { ok: false, reason: 'locked', lines: locked } };
  }
  return { connection: conn, block: { ok: true } };
}

export interface ResolvedTransition {
  connection: RoomConnection;
  /** resolución completa del grafo (incluye el rect local de la salida). */
  resolved: ResolvedRoomConnection;
  kind: RoomConnection['kind'];
  /** entry LOCAL del destino, según la resolución del grafo. */
  entry: { x: number; y: number };
  /** ActiveRoom de DESTINO (id + dims derivados + playerLocal = entry). */
  target: ActiveRoom;
}

/**
 * Resuelve la transición de la salida `exitId` de la room activa.
 * Devuelve null si la salida no existe. El destino, el entry local, el kind
 * y el ActiveRoom de destino son todos RESULTADOS de `graph.resolve(from, exit)`
 * — no requieren `to` como input ni ningún offset de world.ts.
 *
 * La coordinación local del entry (bounds/legalidad) es responsabilidad del
 * runtime (rescue de spawn); este módulo no sanitiza.
 */
export function resolveTransition(
  graph: RoomGraph,
  activeRoom: ActiveRoom,
  exitId: string,
): ResolvedTransition | null {
  const conn = graph.connection(activeRoom.id, exitId);
  if (!conn) return null;
  const resolved = graph.resolve(activeRoom.id, exitId);
  if (!resolved) return null;
  const target = createActiveRoom(conn.to, resolved.entry);
  return {
    connection: conn,
    resolved,
    kind: conn.kind,
    entry: { x: resolved.entry.x, y: resolved.entry.y },
    target,
  };
}

/** Fases de una transición. */
export type TransitionPhase = 'idle' | 'transitioning';

/**
 * Guard determinista para impedir transiciones duplicadas mientras una corre.
 * La escena lo usa como su único flag `transitioning`.
 */
export interface TransitionLock {
  readonly phase: TransitionPhase;
  /** true si pasó de idle → transitioning; false si ya está corriendo. */
  requestStart(): boolean;
  finish(): void;
}

export function createTransitionLock(): TransitionLock {
  let phase: TransitionPhase = 'idle';
  return {
    get phase(): TransitionPhase {
      return phase;
    },
    requestStart(): boolean {
      if (phase === 'transitioning') return false;
      phase = 'transitioning';
      return true;
    },
    finish(): void {
      phase = 'idle';
    },
  };
}
