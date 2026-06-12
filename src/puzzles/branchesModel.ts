export const BRANCH_PUSH = 8;
export const TRUNK_TOLERANCE = 8;
export const EXTREME_OVERLOAD = 24;
export const BRANCH_COUNT = 3;

export type BranchStone = 'marron' | 'roja' | 'amarilla' | 'gris';
export type BranchFuseResult = 'ok' | 'warning' | 'burned';

export interface BranchFuseState {
  overloads: number;
  burned: boolean;
}

export interface BranchZone {
  min: number;
  max: number;
}

export const BRANCH_ZONES: readonly BranchZone[] = [
  { min: 2, max: 4 },
  { min: 1, max: 2 },
  { min: 1, max: 2 },
];

export interface BranchState {
  connected: boolean;
  stone: BranchStone;
  river: number;
}

export interface BranchExperiences {
  connectedOne: boolean;
  connectedSecond: boolean;
}

export interface BranchesState {
  branches: BranchState[];
  fuse: BranchFuseState;
  replacements: number;
  experiences: BranchExperiences;
  solved: boolean;
}

export interface BranchesChange {
  state: BranchesState;
  fuseResult: BranchFuseResult;
}

const STONE_VALUES: Record<BranchStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export function branchRiver(stone: BranchStone): number {
  return BRANCH_PUSH / STONE_VALUES[stone];
}

export function createBranchesState(): BranchesState {
  return {
    branches: Array.from({ length: BRANCH_COUNT }, () => ({
      connected: false,
      stone: 'marron' as const,
      river: 0,
    })),
    fuse: { overloads: 0, burned: false },
    replacements: 0,
    experiences: {
      connectedOne: false,
      connectedSecond: false,
    },
    solved: false,
  };
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

export function branchInGreenZone(state: BranchesState, branchIndex: number): boolean {
  assertBranchIndex(branchIndex);
  const branch = state.branches[branchIndex];
  const zone = BRANCH_ZONES[branchIndex];
  return branch.connected && branch.river >= zone.min && branch.river <= zone.max;
}

export function isBranchesSolution(state: BranchesState): boolean {
  return (
    !state.fuse.burned &&
    state.branches.every((branch) => branch.connected) &&
    state.branches.every((_, index) => branchInGreenZone(state, index)) &&
    trunkRiver(state) <= TRUNK_TOLERANCE
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
  const experiences = {
    connectedOne: state.experiences.connectedOne || connectedCount >= 1,
    connectedSecond: state.experiences.connectedSecond || connectedCount >= 2,
  };
  const derived = { ...state, branches, experiences, solved: false };
  return { ...derived, solved: isBranchesSolution(derived) };
}

function assertBranchIndex(branchIndex: number): void {
  if (!Number.isInteger(branchIndex) || branchIndex < 0 || branchIndex >= BRANCH_COUNT) {
    throw new Error(`Rama desconocida: ${branchIndex}`);
  }
}
