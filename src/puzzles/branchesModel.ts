export const BRANCH_PUSH = 8;
export const TRUNK_TOLERANCE = 8;
export const EXTREME_OVERLOAD = 24;
export const BRANCH_COUNT = 3;

export type BranchStone = 'marron' | 'roja' | 'amarilla' | 'gris';
export type BranchFuseResult = 'ok' | 'warning' | 'burned';

export type IndependenceGuess = 'baja' | 'sube' | 'igual';
export const INDEPENDENCE_ANSWER: IndependenceGuess = 'igual';
export type TrunkGuess = 'nada' | 'sobrecarga' | 'apagan';
export const TRUNK_ANSWER: TrunkGuess = 'sobrecarga';

export interface BranchFuseState {
  overloads: number;
  burned: boolean;
}

export interface BranchState {
  connected: boolean;
  stone: BranchStone;
  river: number;
}

export interface BranchPredictions {
  independence: IndependenceGuess | null;
  trunk: TrunkGuess | null;
}

export interface BranchExperiences {
  connectedSecond: boolean;
  /** vivió que el Tronco se sobrecarga al pedirle de más (el Tronco paga la suma). */
  sawTrunkStrain: boolean;
}

export interface BranchesState {
  branches: BranchState[];
  fuse: BranchFuseState;
  replacements: number;
  predictions: BranchPredictions;
  experiences: BranchExperiences;
  solved: boolean;
}

export interface BranchesChange {
  state: BranchesState;
  fuseResult: BranchFuseResult;
}

export const STONE_VALUES: Record<BranchStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export function branchRiver(stone: BranchStone): number {
  return BRANCH_PUSH / STONE_VALUES[stone];
}

export function createBranchesState(): BranchesState {
  return withDerived({
    branches: [
      { connected: true, stone: 'amarilla', river: 0 },
      { connected: false, stone: 'amarilla', river: 0 },
      { connected: false, stone: 'amarilla', river: 0 },
    ],
    fuse: { overloads: 0, burned: false },
    replacements: 0,
    predictions: { independence: null, trunk: null },
    experiences: { connectedSecond: false, sawTrunkStrain: false },
    solved: false,
  });
}

export function predictIndependence(
  state: BranchesState,
  guess: IndependenceGuess,
): BranchesState {
  return withDerived({
    ...state,
    predictions: { ...state.predictions, independence: guess },
  });
}

export function predictTrunk(state: BranchesState, guess: TrunkGuess): BranchesState {
  return withDerived({
    ...state,
    predictions: { ...state.predictions, trunk: guess },
  });
}

export function setBranchStone(
  state: BranchesState,
  branchIndex: number,
  stone: BranchStone,
): BranchesChange {
  assertBranchIndex(branchIndex);
  const branches = state.branches.map((branch, index) =>
    index === branchIndex ? { ...branch, stone } : branch,
  );
  return evaluateFuse(withDerived({ ...state, branches }));
}

export function connectBranch(
  state: BranchesState,
  branchIndex: number,
  connected: boolean,
): BranchesChange {
  assertBranchIndex(branchIndex);
  const branches = state.branches.map((branch, index) =>
    index === branchIndex ? { ...branch, connected } : branch,
  );
  return evaluateFuse(withDerived({ ...state, branches }));
}

export function trunkRiver(state: BranchesState): number {
  return state.branches.reduce((sum, branch) => sum + branch.river, 0);
}

export function isBranchesSolution(state: BranchesState): boolean {
  return (
    !state.fuse.burned &&
    state.branches.every((branch) => branch.connected) &&
    trunkRiver(state) <= TRUNK_TOLERANCE &&
    state.predictions.independence !== null &&
    state.predictions.trunk !== null &&
    state.experiences.connectedSecond &&
    state.experiences.sawTrunkStrain
  );
}

export function replaceTrunkFuse(state: BranchesState): BranchesState {
  return withDerived({
    ...state,
    branches: state.branches.map((branch) => ({
      ...branch,
      connected: false,
      river: 0,
    })),
    fuse: { overloads: 0, burned: false },
    replacements: state.replacements + 1,
  });
}

function evaluateFuse(state: BranchesState): BranchesChange {
  const river = trunkRiver(state);
  if (state.fuse.burned) return { state, fuseResult: 'burned' };
  if (river <= TRUNK_TOLERANCE) return { state, fuseResult: 'ok' };

  const fuse =
    river >= EXTREME_OVERLOAD
      ? { overloads: Math.max(3, state.fuse.overloads + 1), burned: true }
      : advanceBranchFuse(state.fuse);
  const fuseResult: BranchFuseResult = fuse.burned ? 'burned' : 'warning';
  return {
    fuseResult,
    state: withDerived({ ...state, fuse }),
  };
}

function advanceBranchFuse(fuse: BranchFuseState): BranchFuseState {
  const overloads = fuse.overloads + 1;
  return { overloads, burned: overloads >= 3 };
}

function withDerived(state: BranchesState): BranchesState {
  const branches = state.branches.map((branch) => ({
    ...branch,
    river: branch.connected ? branchRiver(branch.stone) : 0,
  }));
  const connectedCount = branches.filter((branch) => branch.connected).length;
  const trunk = branches.reduce((sum, branch) => sum + branch.river, 0);
  const experiences = {
    connectedSecond: state.experiences.connectedSecond || connectedCount >= 2,
    sawTrunkStrain: state.experiences.sawTrunkStrain || trunk > TRUNK_TOLERANCE,
  };
  const derived = { ...state, branches, experiences, solved: false };
  return { ...derived, solved: isBranchesSolution(derived) };
}

function assertBranchIndex(branchIndex: number): void {
  if (!Number.isInteger(branchIndex) || branchIndex < 0 || branchIndex >= BRANCH_COUNT) {
    throw new Error(`Rama desconocida: ${branchIndex}`);
  }
}
