export const FAIR_SPLIT_PUSH = 12;
export const FAIR_SPLIT_HIGH_TARGET = 8;
export const FAIR_SPLIT_LOW_TARGET = 4;

export type FairSplitStone = 'marron' | 'roja' | 'amarilla' | 'gris';

export const FAIR_SPLIT_STONE_VALUES: Record<FairSplitStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export interface FairSplitResult {
  highStone: FairSplitStone;
  lowStone: FairSplitStone;
  river: number;
  highPush: number;
  lowPush: number;
}

export function calculateFairSplit(
  highStone: FairSplitStone,
  lowStone: FairSplitStone,
): FairSplitResult {
  const highResistance = FAIR_SPLIT_STONE_VALUES[highStone];
  const lowResistance = FAIR_SPLIT_STONE_VALUES[lowStone];
  const river = FAIR_SPLIT_PUSH / (highResistance + lowResistance);

  return {
    highStone,
    lowStone,
    river,
    highPush: river * highResistance,
    lowPush: river * lowResistance,
  };
}

export function isEqualFairSplit(result: FairSplitResult): boolean {
  return result.highPush === result.lowPush;
}

export function isFairSplitSolution(result: FairSplitResult): boolean {
  return (
    result.highPush === FAIR_SPLIT_HIGH_TARGET &&
    result.lowPush === FAIR_SPLIT_LOW_TARGET
  );
}
