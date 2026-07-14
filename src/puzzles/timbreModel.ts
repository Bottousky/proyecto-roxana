/** Modelo puro del timbre redundante del Instituto. */

export type TimbreStone = 'marron' | 'roja' | 'amarilla' | 'gris';
export type TimbrePath = 'A' | 'B';
export type TimbreSoundResult = 'silent' | 'angry' | 'faint' | 'ringing';

export const TIMBRE_PUSH = 4;
export const PATH_A_BRAKE = 2;
export const TIMBRE_MAX_STONES = 2;

export const STONE_VALUES: Record<TimbreStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

/** Cada camino alimenta una bobina independiente del mismo timbre. */
export interface TimbreState {
  pathASpliced: boolean;
  stonesB: TimbreStone[];
  verifiedA: boolean;
  verifiedB: boolean;
  ringing: boolean;
}

export function timbreResistance(stones: readonly TimbreStone[]): number {
  return stones.reduce((sum, stone) => sum + STONE_VALUES[stone], 0);
}

export function timbreRiver(stones: readonly TimbreStone[]): number {
  const resistance = timbreResistance(stones);
  return resistance === 0 ? 0 : TIMBRE_PUSH / resistance;
}

export function timbrePathRiver(st: TimbreState, path: TimbrePath): number {
  if (path === 'A') return st.pathASpliced ? TIMBRE_PUSH / PATH_A_BRAKE : 0;
  return timbreRiver(st.stonesB);
}

export function timbrePathSoundResult(st: TimbreState, path: TimbrePath): TimbreSoundResult {
  const river = timbrePathRiver(st, path);
  if (river === 0) return 'silent';
  if (river === 2) return 'ringing';
  if (river > 2) return 'angry';
  return 'faint';
}

/** Lectura global útil para la visualización; cualquiera de los dos caminos puede sonar. */
export function timbreSoundResult(st: TimbreState): TimbreSoundResult {
  const a = timbrePathSoundResult(st, 'A');
  const b = timbrePathSoundResult(st, 'B');
  if (a === 'ringing' || b === 'ringing') return 'ringing';
  if (a === 'angry' || b === 'angry') return 'angry';
  if (a === 'faint' || b === 'faint') return 'faint';
  return 'silent';
}

/** La reparación exige demostrar que ambos caminos funcionan por separado. */
export function isTimbreSolved(st: TimbreState): boolean {
  return st.pathASpliced &&
    timbrePathSoundResult(st, 'B') === 'ringing' &&
    st.verifiedA &&
    st.verifiedB;
}

export function createTimbreState(): TimbreState {
  return {
    pathASpliced: false,
    stonesB: ['marron'],
    verifiedA: false,
    verifiedB: false,
    ringing: false,
  };
}

export function splicePathA(st: TimbreState): TimbreState {
  return { ...st, pathASpliced: true, verifiedA: false };
}

export function setStoneB(
  st: TimbreState,
  index: 0 | 1,
  stone: TimbreStone,
): TimbreState {
  if (index > st.stonesB.length || index >= TIMBRE_MAX_STONES) return st;
  if (st.stonesB[index] === stone) return st;
  const stonesB = [...st.stonesB];
  stonesB[index] = stone;
  return { ...st, stonesB, verifiedB: false };
}

export function removeStoneB(st: TimbreState, index: 0 | 1): TimbreState {
  if (st.stonesB.length <= 1 || index >= st.stonesB.length) return st;
  return {
    ...st,
    stonesB: st.stonesB.filter((_, stoneIndex) => stoneIndex !== index),
    verifiedB: false,
  };
}

export function verifyTimbrePath(st: TimbreState, path: TimbrePath): TimbreState {
  if (timbrePathSoundResult(st, path) !== 'ringing') return st;
  return path === 'A' ? { ...st, verifiedA: true } : { ...st, verifiedB: true };
}

export function ringTimbre(st: TimbreState): TimbreState {
  return { ...st, ringing: true };
}
