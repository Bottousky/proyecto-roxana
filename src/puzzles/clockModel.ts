export type ClockTank = 1 | 2 | 4;
export type ClockBrake = 1 | 2 | 4 | 8;
export type ClockTiming = 'fast' | 'just' | 'slow';

export const CLOCK_UNIT_MS = 250;
export const CLOCK_TARGET_RHYTHM = 4;

export interface ClockState {
  tank: ClockTank;
  brake: ClockBrake;
  level: number;
  pendulumStep: number;
}

export interface ClockReading {
  rhythm: number;
  periodMs: number;
  timing: ClockTiming;
}

export function clockRhythm(tank: ClockTank, brake: ClockBrake): number {
  return tank * brake;
}

export function clockPeriodMs(tank: ClockTank, brake: ClockBrake): number {
  return CLOCK_UNIT_MS * clockRhythm(tank, brake);
}

export function clockTiming(tank: ClockTank, brake: ClockBrake): ClockTiming {
  const rhythm = clockRhythm(tank, brake);
  if (rhythm < CLOCK_TARGET_RHYTHM) return 'fast';
  if (rhythm > CLOCK_TARGET_RHYTHM) return 'slow';
  return 'just';
}

export function createClockState(
  tank: ClockTank = 1,
  brake: ClockBrake = 1,
): ClockState {
  return { tank, brake, level: 0, pendulumStep: 0 };
}

export function configureClock(
  state: ClockState,
  tank: ClockTank,
  brake: ClockBrake,
): ClockState {
  return { ...state, tank, brake, level: 0 };
}

export function advanceClock(state: ClockState, dtMs: number): ClockState {
  const elapsed = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
  if (elapsed === 0) return state;

  const progress = state.level + (elapsed / clockPeriodMs(state.tank, state.brake)) * 100;
  const ticks = Math.floor(progress / 100);
  return {
    ...state,
    level: progress % 100,
    pendulumStep: state.pendulumStep + ticks,
  };
}

export function clockReading(state: ClockState): ClockReading {
  return {
    rhythm: clockRhythm(state.tank, state.brake),
    periodMs: clockPeriodMs(state.tank, state.brake),
    timing: clockTiming(state.tank, state.brake),
  };
}
