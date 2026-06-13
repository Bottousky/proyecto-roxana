export const STEPS_PUSH = 16;

export const STEPS_STONES = [
  { id: 'stone-1', key: 'marron', resistance: 1 },
  { id: 'stone-2', key: 'marron', resistance: 1 },
  { id: 'stone-3', key: 'roja', resistance: 2 },
  { id: 'stone-4', key: 'amarilla', resistance: 4 },
] as const;

export type StepsStoneId = (typeof STEPS_STONES)[number]['id'];

export const STEPS_RIVER_SEGMENTS = [
  'before-stone-1',
  'between-stones-1-2',
  'between-stones-2-3',
  'between-stones-3-4',
  'after-stone-4',
] as const;

export type StepsRiverSegmentId = (typeof STEPS_RIVER_SEGMENTS)[number];
export type StepsArmId = 'spring' | StepsStoneId | 'whole-loop';

export interface StepsExperiences {
  spring: boolean;
  stones: boolean;
  river: boolean;
  wholeLoop: boolean;
}

export interface StepsState {
  measuredStones: StepsStoneId[];
  measuredRiverSegments: StepsRiverSegmentId[];
  experiences: StepsExperiences;
}

export function stepsTotalResistance(): number {
  return STEPS_STONES.reduce((total, stone) => total + stone.resistance, 0);
}

export function stepsRiver(): number {
  return STEPS_PUSH / stepsTotalResistance();
}

export function stepsDrops(): number[] {
  const river = stepsRiver();
  return STEPS_STONES.map((stone) => river * stone.resistance);
}

export function stepDrop(stoneId: StepsStoneId): number {
  const index = STEPS_STONES.findIndex((stone) => stone.id === stoneId);
  if (index < 0) throw new Error(`Piedra desconocida: ${stoneId}`);
  return stepsDrops()[index];
}

export function stepsLoopDebt(): number {
  return STEPS_PUSH - stepsDrops().reduce((total, drop) => total + drop, 0);
}

export function stepsRiverAt(segmentId: StepsRiverSegmentId): number {
  if (!STEPS_RIVER_SEGMENTS.includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }
  return stepsRiver();
}

export function createStepsState(): StepsState {
  return {
    measuredStones: [],
    measuredRiverSegments: [],
    experiences: {
      spring: false,
      stones: false,
      river: false,
      wholeLoop: false,
    },
  };
}

export function observeStepsArm(state: StepsState, armId: StepsArmId): StepsState {
  if (armId === 'spring') {
    return {
      ...state,
      experiences: { ...state.experiences, spring: true },
    };
  }
  if (armId === 'whole-loop') {
    return {
      ...state,
      experiences: { ...state.experiences, wholeLoop: true },
    };
  }

  const measuredStones = addUnique(state.measuredStones, armId);
  return {
    ...state,
    measuredStones,
    experiences: {
      ...state.experiences,
      stones: measuredStones.length === STEPS_STONES.length,
    },
  };
}

export function observeStepsRiver(
  state: StepsState,
  segmentId: StepsRiverSegmentId,
): StepsState {
  const measuredRiverSegments = addUnique(state.measuredRiverSegments, segmentId);
  return {
    ...state,
    measuredRiverSegments,
    experiences: {
      ...state.experiences,
      river: measuredRiverSegments.length === STEPS_RIVER_SEGMENTS.length,
    },
  };
}

export function isStepsSolved(state: StepsState): boolean {
  return Object.values(state.experiences).every(Boolean);
}

function addUnique<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values : [...values, value];
}
