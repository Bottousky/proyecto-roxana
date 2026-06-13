export type LighthouseTank = 1 | 2 | 4;
export type LighthouseBrake = 1 | 2 | 4 | 8;
export type LighthouseTiming = 'fast' | 'just' | 'slow';
export type LighthousePhase = 'charging' | 'dumping';

export const LIGHTHOUSE_UNIT_MS = 250;
export const LIGHTHOUSE_TARGET_RHYTHM = 8;
export const LIGHTHOUSE_DISCHARGE_UNIT_MS = 100;
export const LIGHTHOUSE_MAX_BRIEF_DISCHARGE_BRAKE = 2;

export interface LighthouseState {
  tank: LighthouseTank;
  chargeBrake: LighthouseBrake;
  dischargeBrake: LighthouseBrake;
  level: number;
  phase: LighthousePhase;
  flashCount: number;
}

export interface LighthouseReading {
  rhythm: number;
  chargePeriodMs: number;
  dischargePeriodMs: number;
  timing: LighthouseTiming;
  briefDischarge: boolean;
  valid: boolean;
}

export function lighthouseRhythm(
  tank: LighthouseTank,
  chargeBrake: LighthouseBrake,
): number {
  return tank * chargeBrake;
}

export function lighthouseChargePeriodMs(
  tank: LighthouseTank,
  chargeBrake: LighthouseBrake,
): number {
  return LIGHTHOUSE_UNIT_MS * lighthouseRhythm(tank, chargeBrake);
}

export function lighthouseDischargePeriodMs(dischargeBrake: LighthouseBrake): number {
  return LIGHTHOUSE_DISCHARGE_UNIT_MS * dischargeBrake;
}

export function lighthouseTiming(
  tank: LighthouseTank,
  chargeBrake: LighthouseBrake,
): LighthouseTiming {
  const rhythm = lighthouseRhythm(tank, chargeBrake);
  if (rhythm < LIGHTHOUSE_TARGET_RHYTHM) return 'fast';
  if (rhythm > LIGHTHOUSE_TARGET_RHYTHM) return 'slow';
  return 'just';
}

export function isBriefDischarge(dischargeBrake: LighthouseBrake): boolean {
  return dischargeBrake <= LIGHTHOUSE_MAX_BRIEF_DISCHARGE_BRAKE;
}

export function isLighthouseSolution(
  tank: LighthouseTank,
  chargeBrake: LighthouseBrake,
  dischargeBrake: LighthouseBrake,
): boolean {
  return (
    lighthouseTiming(tank, chargeBrake) === 'just' &&
    isBriefDischarge(dischargeBrake)
  );
}

export function createLighthouseState(
  tank: LighthouseTank = 1,
  chargeBrake: LighthouseBrake = 1,
  dischargeBrake: LighthouseBrake = 1,
): LighthouseState {
  return {
    tank,
    chargeBrake,
    dischargeBrake,
    level: 0,
    phase: 'charging',
    flashCount: 0,
  };
}

export function configureLighthouse(
  state: LighthouseState,
  tank: LighthouseTank,
  chargeBrake: LighthouseBrake,
  dischargeBrake: LighthouseBrake,
): LighthouseState {
  return {
    ...state,
    tank,
    chargeBrake,
    dischargeBrake,
    level: 0,
    phase: 'charging',
  };
}

export function advanceLighthouse(state: LighthouseState, dtMs: number): LighthouseState {
  let remaining = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
  if (remaining === 0) return state;

  let next = { ...state };
  while (remaining > 0) {
    if (next.phase === 'charging') {
      const period = lighthouseChargePeriodMs(next.tank, next.chargeBrake);
      const untilThreshold = period * ((100 - next.level) / 100);
      if (remaining < untilThreshold) {
        next.level += (remaining / period) * 100;
        remaining = 0;
      } else {
        remaining -= untilThreshold;
        next.level = 100;
        next.phase = 'dumping';
        next.flashCount++;
      }
      continue;
    }

    const period = lighthouseDischargePeriodMs(next.dischargeBrake);
    const untilEmpty = period * (next.level / 100);
    if (remaining < untilEmpty) {
      next.level -= (remaining / period) * 100;
      remaining = 0;
    } else {
      remaining -= untilEmpty;
      next.level = 0;
      next.phase = 'charging';
    }
  }

  return next;
}

export function lighthouseReading(state: LighthouseState): LighthouseReading {
  const timing = lighthouseTiming(state.tank, state.chargeBrake);
  const briefDischarge = isBriefDischarge(state.dischargeBrake);
  return {
    rhythm: lighthouseRhythm(state.tank, state.chargeBrake),
    chargePeriodMs: lighthouseChargePeriodMs(state.tank, state.chargeBrake),
    dischargePeriodMs: lighthouseDischargePeriodMs(state.dischargeBrake),
    timing,
    briefDischarge,
    valid: timing === 'just' && briefDischarge,
  };
}
