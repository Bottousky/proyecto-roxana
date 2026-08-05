export type CircuitNode = 'V_PLUS' | 'N1' | 'N2' | 'REF';
export type ReturnState = 'closed' | 'open';

export const SOURCE_VOLTS = 5;
export const R1_OHMS = 100;
export const R2_OHMS = 150;

export interface CircuitSolution {
  returnState: ReturnState;
  hasCompletePath: boolean;
  path: readonly string[];
  equivalentOhms: number;
  currentAmps: number;
  nodeVolts: Readonly<Record<CircuitNode, number>>;
  resistorDropsVolts: Readonly<{ r1: number; r2: number; return: number }>;
  resistorPowerWatts: Readonly<{ r1: number; r2: number }>;
}
const ALL_NODES: readonly CircuitNode[] = ['V_PLUS', 'N1', 'N2', 'REF'];

export function isCircuitNode(value: string): value is CircuitNode {
  return ALL_NODES.includes(value as CircuitNode);
}

export function solveCircuit(returnState: ReturnState): CircuitSolution {
  const closed = returnState === 'closed';
  const equivalentOhms = closed ? R1_OHMS + R2_OHMS : Number.POSITIVE_INFINITY;
  const currentAmps = closed ? SOURCE_VOLTS / equivalentOhms : 0;
  const n1 = closed ? SOURCE_VOLTS - currentAmps * R1_OHMS : SOURCE_VOLTS;
  const n2 = closed ? n1 - currentAmps * R2_OHMS : SOURCE_VOLTS;

  return {
    returnState,
    hasCompletePath: closed,
    path: closed ? ['R1', 'R2', 'return'] : [],
    equivalentOhms,
    currentAmps,
    nodeVolts: { V_PLUS: SOURCE_VOLTS, N1: n1, N2: n2, REF: 0 },
    resistorDropsVolts: {
      r1: currentAmps * R1_OHMS,
      r2: currentAmps * R2_OHMS,
      return: closed ? 0 : SOURCE_VOLTS,
    },
    resistorPowerWatts: {
      r1: currentAmps * currentAmps * R1_OHMS,
      r2: currentAmps * currentAmps * R2_OHMS,
    },
  };
}

export function passiveResistanceOhms(
  pointA: CircuitNode,
  pointB: CircuitNode,
  returnState: ReturnState,
): number {
  if (pointA === pointB) return 0;

  const edges: ReadonlyArray<readonly [CircuitNode, CircuitNode, number]> = [
    ['V_PLUS', 'N1', R1_OHMS],
    ['N1', 'N2', R2_OHMS],
    ...(returnState === 'closed' ? ([['N2', 'REF', 0]] as const) : []),
  ];
  const distances = new Map<CircuitNode, number>(ALL_NODES.map((node) => [node, Infinity]));
  const unvisited = new Set<CircuitNode>(ALL_NODES);
  distances.set(pointA, 0);

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((best, node) =>
      (distances.get(node) ?? Infinity) < (distances.get(best) ?? Infinity) ? node : best,
    );
    const distance = distances.get(current) ?? Infinity;
    unvisited.delete(current);
    if (!Number.isFinite(distance) || current === pointB) break;

    for (const [left, right, resistance] of edges) {
      const neighbor = left === current ? right : right === current ? left : null;
      if (neighbor === null || !unvisited.has(neighbor)) continue;
      distances.set(neighbor, Math.min(distances.get(neighbor) ?? Infinity, distance + resistance));
    }
  }

  return distances.get(pointB) ?? Infinity;
}

export const PUERTA_NODE_LABELS: Readonly<Record<CircuitNode, string>> = {
  V_PLUS: 'marca_este',
  N1: 'bisagra_alta',
  N2: 'bisagra_baja',
  REF: 'marca_oeste',
};

export function solvePuertaTransfer(returnState: ReturnState): CircuitSolution {
  return solveCircuit(returnState);
}
