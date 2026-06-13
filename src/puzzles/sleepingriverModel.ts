export type SleepingRiverTank = 1 | 2 | 4;
export type SleepingRiverBrake = 1 | 2 | 4 | 8;

// Escala de tiempo del llenado: con la config más lenta (estanque 4 × freno 8 = 32)
// el llenado tarda ~4.8 s — perceptiblemente lento pero no tedioso; la más rápida
// (1 × 1) ~0.15 s. La diferencia comunica «estanque por freno» sin hacer esperar.
export const SLEEPING_RIVER_UNIT_MS = 150;

export interface SleepingRiverState {
  tank: SleepingRiverTank;
  brake: SleepingRiverBrake;
  level: number;
  filling: boolean;
}

export interface SleepingRiverReading {
  fillTimeMs: number;
  riverFlow: number;
  full: boolean;
}

export function sleepingRiverFillTimeMs(
  tank: SleepingRiverTank,
  brake: SleepingRiverBrake,
): number {
  return SLEEPING_RIVER_UNIT_MS * tank * brake;
}

export function createSleepingRiverState(
  tank: SleepingRiverTank = 2,
  brake: SleepingRiverBrake = 2,
): SleepingRiverState {
  return { tank, brake, level: 0, filling: false };
}

export function configureSleepingRiver(
  state: SleepingRiverState,
  tank: SleepingRiverTank,
  brake: SleepingRiverBrake,
): SleepingRiverState {
  return { ...state, tank, brake, level: 0, filling: false };
}

export function startSleepingRiver(state: SleepingRiverState): SleepingRiverState {
  return { ...state, level: 0, filling: true };
}

export function advanceSleepingRiver(
  state: SleepingRiverState,
  dtMs: number,
): SleepingRiverState {
  if (!state.filling) return state;
  const elapsed = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
  const fillTimeMs = sleepingRiverFillTimeMs(state.tank, state.brake);
  const level = Math.min(100, state.level + (elapsed / fillTimeMs) * 100);
  return { ...state, level, filling: level < 100 };
}

export function sleepingRiverReading(state: SleepingRiverState): SleepingRiverReading {
  const full = state.level >= 100;
  return {
    fillTimeMs: sleepingRiverFillTimeMs(state.tank, state.brake),
    riverFlow: state.filling && !full ? Math.max(0, 1 - state.level / 100) : 0,
    full,
  };
}
