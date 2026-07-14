export const STEPS_PUSH = 16;
export const STEPS_STONE_VALUES = [1, 2, 4, 8] as const;
export const STEPS_INITIAL_CONFIGURATION = [4, 1, 2, 1] as const;
export const STEPS_TARGET_DROPS = [2, 2, 4, 8] as const;
export const STEPS_PREDICTION_OPTIONS = ['Primero', 'Segundo', 'Tercero', 'Cuarto'] as const;

export type StepsStoneValue = (typeof STEPS_STONE_VALUES)[number];
export type StepsPrediction = (typeof STEPS_PREDICTION_OPTIONS)[number];

export const STEPS_STONES = [
  { id: 'stone-1', label: 'Piedra 1' },
  { id: 'stone-2', label: 'Piedra 2' },
  { id: 'stone-3', label: 'Piedra 3' },
  { id: 'stone-4', label: 'Piedra 4' },
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

export interface StepsAttempt {
  drops: number[];
  river: number;
  loopDebt: number;
  directions: StepsDropDirection[];
  valid: boolean;
}

export type StepsDropDirection = 'sube' | 'baja' | 'exacto';

export interface StepsState {
  configuration: StepsStoneValue[];
  prediction: StepsPrediction | null;
  hasOpened: boolean;
  lastAttempt: StepsAttempt | null;
  measuredStones: StepsStoneId[];
  measuredRiverSegments: StepsRiverSegmentId[];
  experiences: StepsExperiences;
}

export function stepsTotalResistance(
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number {
  return configuration.reduce<number>((total, resistance) => total + resistance, 0);
}

export function stepsRiver(
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number {
  return STEPS_PUSH / stepsTotalResistance(configuration);
}

export function stepsDrops(
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number[] {
  const river = stepsRiver(configuration);
  return configuration.map((resistance) => river * resistance);
}

export function stepDrop(
  stoneId: StepsStoneId,
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number {
  const index = STEPS_STONES.findIndex((stone) => stone.id === stoneId);
  if (index < 0) throw new Error(`Piedra desconocida: ${stoneId}`);
  return stepsDrops(configuration)[index];
}

export function stepsLoopDebt(
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number {
  return STEPS_PUSH - stepsDrops(configuration).reduce((total, drop) => total + drop, 0);
}

export function stepsRiverAt(
  segmentId: StepsRiverSegmentId,
  configuration: readonly StepsStoneValue[] = STEPS_INITIAL_CONFIGURATION,
): number {
  if (!STEPS_RIVER_SEGMENTS.includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }
  return stepsRiver(configuration);
}

export function stepsDropDirections(drops: readonly number[]): StepsDropDirection[] {
  return STEPS_TARGET_DROPS.map((target, index) => {
    const drop = drops[index];
    if (nearlyEqual(drop, target)) return 'exacto';
    return drop < target ? 'sube' : 'baja';
  });
}

export function isStepsConfigurationValid(
  configuration: readonly StepsStoneValue[],
): boolean {
  const drops = stepsDrops(configuration);
  return STEPS_TARGET_DROPS.every((target, index) => nearlyEqual(drops[index], target));
}

export function evaluateStepsConfiguration(
  configuration: readonly StepsStoneValue[],
): StepsAttempt {
  const drops = stepsDrops(configuration);
  return {
    drops,
    river: stepsRiver(configuration),
    loopDebt: stepsLoopDebt(configuration),
    directions: stepsDropDirections(drops),
    valid: isStepsConfigurationValid(configuration),
  };
}

export function createStepsState(): StepsState {
  return {
    configuration: [...STEPS_INITIAL_CONFIGURATION],
    prediction: null,
    hasOpened: false,
    lastAttempt: null,
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

export function commitStepsPrediction(
  state: StepsState,
  prediction: StepsPrediction,
): StepsState {
  return { ...state, prediction };
}

export function configureStepsStone(
  state: StepsState,
  index: number,
  resistance: StepsStoneValue,
): StepsState {
  if (index < 0 || index >= STEPS_STONES.length) {
    throw new Error(`Posición desconocida: ${index}`);
  }
  if (!STEPS_STONE_VALUES.includes(resistance)) {
    throw new Error(`Valor de piedra desconocido: ${resistance}`);
  }
  const configuration = [...state.configuration];
  configuration[index] = resistance;
  return { ...state, configuration, lastAttempt: null };
}

export function openStepsGate(state: StepsState): StepsState {
  if (state.prediction === null) return state;
  return {
    ...state,
    hasOpened: true,
    lastAttempt: evaluateStepsConfiguration(state.configuration),
  };
}

export function observeStepsArm(state: StepsState, armId: StepsArmId): StepsState {
  if (armId === 'spring') {
    return { ...state, experiences: { ...state.experiences, spring: true } };
  }
  if (armId === 'whole-loop') {
    return { ...state, experiences: { ...state.experiences, wholeLoop: true } };
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

export function observeStepsRiver(state: StepsState, segmentId: StepsRiverSegmentId): StepsState {
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
  return state.prediction !== null && state.hasOpened && state.lastAttempt?.valid === true;
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 1e-9;
}

function addUnique<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values : [...values, value];
}
