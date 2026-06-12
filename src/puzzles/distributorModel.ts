export const DISTRIBUTOR_PUSHES = [4, 8, 16] as const;
export const DISTRIBUTOR_STONES = ['marron', 'roja', 'amarilla', 'gris'] as const;
export const DISTRIBUTOR_TARGETS = [4, 2, 1] as const;
export const DISTRIBUTOR_TRUNK_TOLERANCE = 8;

export type DistributorPush = (typeof DISTRIBUTOR_PUSHES)[number];
export type DistributorStone = (typeof DISTRIBUTOR_STONES)[number];
export type DistributorFuseResult = 'ok' | 'warning' | 'burned';

export interface DistributorFuseState {
  overloads: number;
  burned: boolean;
}

export interface DistributorDistrictState {
  stone: DistributorStone;
  river: number;
}

export interface DistributorState {
  push: DistributorPush;
  districts: DistributorDistrictState[];
  fuse: DistributorFuseState;
  replacements: number;
  solved: boolean;
  alternativeSolution: boolean;
}

export interface DistributorChange {
  state: DistributorState;
  fuseResult: DistributorFuseResult;
}

const STONE_VALUES: Record<DistributorStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export function distributorRiver(
  push: DistributorPush,
  stone: DistributorStone,
): number {
  // El greybox usa caudales enteros: cualquier fracción queda fuera de zona
  // al redondearse hacia abajo. Con Empuje 4 y piedra gris, por ejemplo, da 0.
  return Math.floor(push / STONE_VALUES[stone]);
}

export function createDistributorState(): DistributorState {
  return withDerived({
    push: 4,
    districts: DISTRIBUTOR_TARGETS.map(() => ({ stone: 'gris', river: 0 })),
    fuse: { overloads: 0, burned: false },
    replacements: 0,
    solved: false,
    alternativeSolution: false,
  });
}

export function setDistributorPush(
  state: DistributorState,
  push: DistributorPush,
): DistributorChange {
  return evaluateFuse(withDerived({ ...state, push }));
}

export function setDistributorStone(
  state: DistributorState,
  districtIndex: number,
  stone: DistributorStone,
): DistributorChange {
  assertDistrictIndex(districtIndex);
  const districts = state.districts.map((district, index) =>
    index === districtIndex ? { ...district, stone } : district,
  );
  return evaluateFuse(withDerived({ ...state, districts }));
}

export function distributorTrunkRiver(state: DistributorState): number {
  return state.districts.reduce((sum, district) => sum + district.river, 0);
}

export function districtInGreenZone(
  state: DistributorState,
  districtIndex: number,
): boolean {
  assertDistrictIndex(districtIndex);
  return state.districts[districtIndex].river === DISTRIBUTOR_TARGETS[districtIndex];
}

export function isDistributorSolution(state: DistributorState): boolean {
  return (
    !state.fuse.burned &&
    state.districts.every((_, index) => districtInGreenZone(state, index)) &&
    distributorTrunkRiver(state) <= DISTRIBUTOR_TRUNK_TOLERANCE
  );
}

export function isAlternativeDistributorSolution(state: DistributorState): boolean {
  return (
    isDistributorSolution(state) &&
    state.push === 4 &&
    state.districts[0].stone === 'marron' &&
    state.districts[1].stone === 'roja' &&
    state.districts[2].stone === 'amarilla'
  );
}

export function replaceDistributorFuse(state: DistributorState): DistributorState {
  return withDerived({
    ...state,
    push: 4,
    districts: DISTRIBUTOR_TARGETS.map(() => ({ stone: 'gris', river: 0 })),
    fuse: { overloads: 0, burned: false },
    replacements: state.replacements + 1,
  });
}

function evaluateFuse(state: DistributorState): DistributorChange {
  if (state.fuse.burned) return { state, fuseResult: 'burned' };
  if (distributorTrunkRiver(state) <= DISTRIBUTOR_TRUNK_TOLERANCE) {
    return { state, fuseResult: 'ok' };
  }

  const overloads = state.fuse.overloads + 1;
  const fuse = { overloads, burned: overloads >= 3 };
  return {
    fuseResult: fuse.burned ? 'burned' : 'warning',
    state: withDerived({ ...state, fuse }),
  };
}

function withDerived(state: DistributorState): DistributorState {
  const districts = state.districts.map((district) => ({
    ...district,
    river: distributorRiver(state.push, district.stone),
  }));
  const derived = {
    ...state,
    districts,
    solved: false,
    alternativeSolution: false,
  };
  return {
    ...derived,
    solved: isDistributorSolution(derived),
    alternativeSolution: isAlternativeDistributorSolution(derived),
  };
}

function assertDistrictIndex(districtIndex: number): void {
  if (
    !Number.isInteger(districtIndex) ||
    districtIndex < 0 ||
    districtIndex >= DISTRIBUTOR_TARGETS.length
  ) {
    throw new Error(`Distrito desconocido: ${districtIndex}`);
  }
}
