export const LADDER_PUSH = 16;
export const LADDER_TERRACE_1_TARGET = 8;
export const LADDER_TERRACE_2_TARGET = 4;

export type LadderStone = 'marron' | 'roja' | 'amarilla' | 'gris';

export const LADDER_STONE_VALUES: Record<LadderStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export interface LadderConfiguration {
  firstSegment: LadderStone;
  terrace1: LadderStone;
  secondSegment: LadderStone;
  terrace2: LadderStone;
}

export const LADDER_INITIAL_CONFIGURATION: LadderConfiguration = {
  firstSegment: 'roja',
  terrace1: 'amarilla',
  secondSegment: 'roja',
  terrace2: 'roja',
};

export const LADDER_SECOND_CONFIGURATION: LadderConfiguration = {
  firstSegment: 'amarilla',
  terrace1: 'gris',
  secondSegment: 'amarilla',
  terrace2: 'amarilla',
};

export interface LadderFold {
  terrace2Equivalent: number;
  branchToTerrace2Equivalent: number;
  terrace1Equivalent: number;
  totalEquivalent: number;
}

export interface LadderResult {
  push: number;
  configuration: LadderConfiguration;
  fold: LadderFold;
  sourceRiver: number;
  terrace1BranchRiver: number;
  terrace2BranchRiver: number;
  firstSegmentDrop: number;
  terrace1Push: number;
  secondSegmentDrop: number;
  terrace2Push: number;
}

export interface PredictionComparison {
  predicted: number;
  measured: number;
  exact: boolean;
}

export function seriesEquivalent(...resistances: number[]): number {
  return resistances.reduce((total, resistance) => total + resistance, 0);
}

export function parallelEquivalent(
  firstResistance: number,
  secondResistance: number,
): number {
  return (
    (firstResistance * secondResistance) /
    (firstResistance + secondResistance)
  );
}

export function foldLadder(configuration: LadderConfiguration): LadderFold {
  const firstSegment = LADDER_STONE_VALUES[configuration.firstSegment];
  const terrace1 = LADDER_STONE_VALUES[configuration.terrace1];
  const secondSegment = LADDER_STONE_VALUES[configuration.secondSegment];
  const terrace2Equivalent = LADDER_STONE_VALUES[configuration.terrace2];
  const branchToTerrace2Equivalent = seriesEquivalent(
    secondSegment,
    terrace2Equivalent,
  );
  const terrace1Equivalent = parallelEquivalent(
    terrace1,
    branchToTerrace2Equivalent,
  );

  return {
    terrace2Equivalent,
    branchToTerrace2Equivalent,
    terrace1Equivalent,
    totalEquivalent: seriesEquivalent(firstSegment, terrace1Equivalent),
  };
}

export function calculateLadder(
  configuration: LadderConfiguration,
  push = LADDER_PUSH,
): LadderResult {
  if (push <= 0) throw new Error('El empuje de la Escalera debe ser positivo.');

  const fold = foldLadder(configuration);
  const firstSegment = LADDER_STONE_VALUES[configuration.firstSegment];
  const terrace1 = LADDER_STONE_VALUES[configuration.terrace1];
  const secondSegment = LADDER_STONE_VALUES[configuration.secondSegment];
  const terrace2 = LADDER_STONE_VALUES[configuration.terrace2];
  const sourceRiver = push / fold.totalEquivalent;
  const firstSegmentDrop = sourceRiver * firstSegment;
  const terrace1Push = push - firstSegmentDrop;
  const terrace1BranchRiver = terrace1Push / terrace1;
  const terrace2BranchRiver =
    terrace1Push / fold.branchToTerrace2Equivalent;
  const secondSegmentDrop = terrace2BranchRiver * secondSegment;
  const terrace2Push = terrace2BranchRiver * terrace2;

  return {
    push,
    configuration: { ...configuration },
    fold,
    sourceRiver,
    terrace1BranchRiver,
    terrace2BranchRiver,
    firstSegmentDrop,
    terrace1Push,
    secondSegmentDrop,
    terrace2Push,
  };
}

export function isLadderSolution(result: LadderResult): boolean {
  return (
    result.terrace1Push === result.push / 2 &&
    result.terrace2Push === result.push / 4
  );
}

export function comparePrediction(
  predicted: number,
  measured: number,
): PredictionComparison {
  return {
    predicted,
    measured,
    exact: predicted === measured,
  };
}
