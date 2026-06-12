export const CHAIN_MIN_LAMPS = 1;
export const CHAIN_MAX_LAMPS = 6;
export const CHAIN_INITIAL_LAMPS = 4;
export const CHAIN_TARGET_LAMPS = 2;
export const CHAIN_PUSH = 8;
export const CHAIN_LAMP_BRAKE = 2;

export type ChainBrightnessBand = 'exceso' | 'correcta' | 'tenue' | 'casi-nada';

export interface ChainExperiences {
  measuredSameRiver: boolean;
  removedLamp: boolean;
  addedLamp: boolean;
}

export interface ChainState {
  lampCount: number;
  measuredSegments: string[];
  experiences: ChainExperiences;
  solved: boolean;
}

export interface ChainChange {
  state: ChainState;
  interrupted: boolean;
}

export function chainSegmentIds(lampCount: number): string[] {
  const count = clampLampCount(lampCount);
  const segments = ['before'];
  for (let index = 1; index < count; index++) {
    segments.push(`between-${index}`);
  }
  segments.push('after');
  return segments;
}

export function chainReading(lampCount: number, segmentId: string): number {
  if (!chainSegmentIds(lampCount).includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }
  return CHAIN_PUSH / (CHAIN_LAMP_BRAKE * clampLampCount(lampCount));
}

export function chainBrightness(lampCount: number): number {
  return chainReading(lampCount, 'before');
}

export function chainBrightnessBand(lampCount: number): ChainBrightnessBand {
  const brightness = chainBrightness(lampCount);
  if (brightness > 2.25) return 'exceso';
  if (brightness >= 1.75) return 'correcta';
  if (brightness >= 1) return 'tenue';
  return 'casi-nada';
}

export function createChainState(): ChainState {
  return {
    lampCount: CHAIN_INITIAL_LAMPS,
    measuredSegments: [],
    experiences: {
      measuredSameRiver: false,
      removedLamp: false,
      addedLamp: false,
    },
    solved: false,
  };
}

export function measureChainSegment(state: ChainState, segmentId: string): ChainState {
  const segments = chainSegmentIds(state.lampCount);
  if (!segments.includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }

  const measuredSegments = state.measuredSegments.includes(segmentId)
    ? state.measuredSegments
    : [...state.measuredSegments, segmentId];
  const experiences = {
    ...state.experiences,
    measuredSameRiver:
      state.experiences.measuredSameRiver ||
      segments.every((segment) => measuredSegments.includes(segment)),
  };

  return withSolved({ ...state, measuredSegments, experiences });
}

export function removeChainLamp(state: ChainState): ChainChange {
  if (state.lampCount <= CHAIN_MIN_LAMPS) {
    return { state, interrupted: false };
  }

  return {
    interrupted: true,
    state: withSolved({
      ...state,
      lampCount: state.lampCount - 1,
      measuredSegments: [],
      experiences: { ...state.experiences, removedLamp: true },
    }),
  };
}

export function addChainLamp(state: ChainState): ChainChange {
  if (state.lampCount >= CHAIN_MAX_LAMPS) {
    return { state, interrupted: false };
  }

  return {
    interrupted: false,
    state: withSolved({
      ...state,
      lampCount: state.lampCount + 1,
      measuredSegments: [],
      experiences: { ...state.experiences, addedLamp: true },
    }),
  };
}

function clampLampCount(lampCount: number): number {
  return Math.max(CHAIN_MIN_LAMPS, Math.min(CHAIN_MAX_LAMPS, lampCount));
}

function withSolved(state: Omit<ChainState, 'solved'> | ChainState): ChainState {
  const solved =
    state.experiences.measuredSameRiver &&
    state.experiences.removedLamp &&
    state.experiences.addedLamp &&
    state.lampCount === CHAIN_TARGET_LAMPS;
  return { ...state, solved };
}
