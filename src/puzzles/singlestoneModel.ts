export const SINGLE_STONE_PUSH = 8;
export const SINGLE_STONE_REQUIRED_MATCHES = 2;

export type SingleStone = 'marron' | 'roja' | 'amarilla' | 'gris';

export const SINGLE_STONE_VALUES: Record<SingleStone, number> = {
  marron: 1,
  roja: 2,
  amarilla: 4,
  gris: 8,
};

export type SingleStoneNetworkId =
  | 'parallel-red'
  | 'parallel-yellow'
  | 'parallel-gray'
  | 'brown-series-parallel-red'
  | 'red-series-parallel-yellow';

export interface SingleStoneNetwork {
  id: SingleStoneNetworkId;
  label: string;
  seriesStone?: SingleStone;
  parallelStone: SingleStone;
  equivalentStone: SingleStone;
}

export const SINGLE_STONE_NETWORKS: readonly SingleStoneNetwork[] = [
  {
    id: 'parallel-red',
    label: 'Dos rojas en ramales',
    parallelStone: 'roja',
    equivalentStone: 'marron',
  },
  {
    id: 'parallel-yellow',
    label: 'Dos amarillas en ramales',
    parallelStone: 'amarilla',
    equivalentStone: 'roja',
  },
  {
    id: 'parallel-gray',
    label: 'Dos grises en ramales',
    parallelStone: 'gris',
    equivalentStone: 'amarilla',
  },
  {
    id: 'brown-series-parallel-red',
    label: 'Marrón en fila con dos rojas en ramales',
    seriesStone: 'marron',
    parallelStone: 'roja',
    equivalentStone: 'roja',
  },
  {
    id: 'red-series-parallel-yellow',
    label: 'Roja en fila con dos amarillas en ramales',
    seriesStone: 'roja',
    parallelStone: 'amarilla',
    equivalentStone: 'amarilla',
  },
];

export interface SingleStoneComparison {
  networkId: SingleStoneNetworkId;
  candidateStone: SingleStone;
  leftResistance: number;
  rightResistance: number;
  leftRiver: number;
  rightRiver: number;
  distinguishes: boolean;
}

export interface SingleStoneState {
  matchedNetworkIds: SingleStoneNetworkId[];
}

export function parallelEqualResistance(stone: SingleStone): number {
  return SINGLE_STONE_VALUES[stone] / 2;
}

export function seriesResistance(...resistances: number[]): number {
  return resistances.reduce((total, resistance) => total + resistance, 0);
}

export function equivalentResistance(network: SingleStoneNetwork): number {
  const parallel = parallelEqualResistance(network.parallelStone);
  return network.seriesStone
    ? seriesResistance(SINGLE_STONE_VALUES[network.seriesStone], parallel)
    : parallel;
}

export function getSingleStoneNetwork(id: SingleStoneNetworkId): SingleStoneNetwork {
  const network = SINGLE_STONE_NETWORKS.find((candidate) => candidate.id === id);
  if (!network) throw new Error(`Red de Piedra Única desconocida: ${id}`);
  return network;
}

export function compareSingleStone(
  networkId: SingleStoneNetworkId,
  candidateStone: SingleStone,
): SingleStoneComparison {
  const network = getSingleStoneNetwork(networkId);
  const leftResistance = equivalentResistance(network);
  const rightResistance = SINGLE_STONE_VALUES[candidateStone];
  const leftRiver = SINGLE_STONE_PUSH / leftResistance;
  const rightRiver = SINGLE_STONE_PUSH / rightResistance;

  return {
    networkId,
    candidateStone,
    leftResistance,
    rightResistance,
    leftRiver,
    rightRiver,
    distinguishes: leftRiver !== rightRiver,
  };
}

export function createSingleStoneState(): SingleStoneState {
  return { matchedNetworkIds: [] };
}

export function recordSingleStoneMatch(
  state: SingleStoneState,
  comparison: SingleStoneComparison,
): SingleStoneState {
  if (
    comparison.distinguishes ||
    state.matchedNetworkIds.includes(comparison.networkId)
  ) {
    return state;
  }

  return {
    matchedNetworkIds: [...state.matchedNetworkIds, comparison.networkId],
  };
}

export function isSingleStoneSolved(state: SingleStoneState): boolean {
  return state.matchedNetworkIds.length >= SINGLE_STONE_REQUIRED_MATCHES;
}
