/**
 * Modelo puro del puzzle del timbre del Instituto (M8).
 *
 * Topología: dos caminos en paralelo hacia el timbre.
 *   - Camino A: estaba cortado → acción: empalmar.
 *   - Camino B: tiene una piedra de freno → elegir la piedra correcta.
 *
 * El timbre necesita un río de 2 (empuje fijo 4, freno correcto = roja=2 → 4/2=2).
 * El jugador debe:
 *   1. empalmar el camino A (estaba cortado),
 *   2. poner la piedra roja en el camino B.
 *
 * El timbre suena cuando AMBAS condiciones se cumplen.
 * Sin empalme, el camino A no conduce: no hay río por él.
 * Sin la piedra correcta, el resultado es disonante o inerte.
 */

export type TimbreStone = 'marron' | 'roja' | 'amarilla' | 'gris';

/** Empuje fijo de la red del timbre. */
export const TIMBRE_PUSH = 4;

/** Piedra correcta: roja = freno 2 → río 4/2 = 2 (timbre suena bien). */
export const CORRECT_STONE: TimbreStone = 'roja';

/** Valor de freno por piedra (mismo código de la U1/U2). */
export const STONE_VALUES: Record<TimbreStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

/** Río que entrega cada piedra con el empuje fijo del timbre. */
export function timbreRiver(stone: TimbreStone): number {
  return TIMBRE_PUSH / STONE_VALUES[stone];
}

export interface TimbreState {
  /** Camino A: cortado al inicio, el jugador lo empalma. */
  pathASpliced: boolean;
  /** Piedra puesta en el camino B. */
  stoneB: TimbreStone;
  /** El timbre ya sonó (estado terminal). */
  ringing: boolean;
}

export type TimbreSoundResult = 'silent' | 'angry' | 'faint' | 'ringing';

/** Estado sonoro del timbre según la configuración. */
export function timbreSoundResult(st: TimbreState): TimbreSoundResult {
  const river = timbreRiver(st.stoneB);

  if (!st.pathASpliced) {
    // Solo el camino B activo: el timbre espera dos caminos para nunca callar.
    // Sin empalme, con demasiado río zumba, con poco apenas vibra.
    if (river >= 4) return 'angry';  // marrón: río 4, zumba
    return 'faint';                  // roja/amarilla/gris: apenas vibra
  }
  // Ambos caminos activos. El timbre suena bien cuando el río de B es el correcto.
  if (st.stoneB === CORRECT_STONE) return 'ringing';  // roja → río 2 — correcto
  if (river >= 4) return 'angry';   // marrón: río 4, suena rabioso
  return 'faint';                   // amarilla (río 1) o gris (río 0.5): apenas vibra
}

/** ¿El timbre está en el estado ganador? */
export function isTimbreSolved(st: TimbreState): boolean {
  return st.pathASpliced && st.stoneB === CORRECT_STONE;
}

export function createTimbreState(): TimbreState {
  return {
    pathASpliced: false,
    stoneB: 'marron',
    ringing: false,
  };
}

export function splicePathA(st: TimbreState): TimbreState {
  return { ...st, pathASpliced: true };
}

export function setStoneB(st: TimbreState, stone: TimbreStone): TimbreState {
  return { ...st, stoneB: stone };
}

export function ringTimbre(st: TimbreState): TimbreState {
  return { ...st, ringing: true };
}
