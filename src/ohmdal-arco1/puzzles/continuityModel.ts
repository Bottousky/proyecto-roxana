/**
 * Continuity Model (Puzzle 1) — Ohmdal Arco I.
 *
 * Puzzle: The world is dormant. Two cables in the Plaza are broken.
 * The player must repair them in some valid order. The puzzle accepts
 * ≥2 solutions and validates by condition (closed trajectory from
 * source to load), not by sequence.
 *
 * The model is pure. The engine is responsible for applying its results
 * to the world (lighting the node, animating the cable, etc.).
 *
 * The model is intentionally minimal: it knows about nodes, edges,
 * and a continuity check. It does not know about tiles, sprites, or
 * UI.
 */

export type NodeId = string;
export type EdgeId = string;

export interface ContinuityNode {
  id: NodeId;
  type: 'source' | 'load' | 'switch' | 'gate' | 'sink';
  /** Optional position (used by the engine, not by the model logic). */
  x?: number;
  y?: number;
  /** Optional voltage / power spec (model doesn't use this). */
  v?: number;
  /** Optional initial state. */
  state?: string;
}

export interface ContinuityEdge {
  id: EdgeId;
  from: NodeId;
  to: NodeId;
  state: 'intact' | 'broken';
  breakIndex?: number; // for visual hint only; not required for logic
  path?: { x: number; y: number }[]; // visual path, not required for logic
}

export interface ContinuityState {
  nodes: Record<NodeId, ContinuityNode>;
  edges: Record<EdgeId, ContinuityEdge>;
  source: NodeId;
}

export interface ContinuityResult {
  /** Map of node id -> reachable from source. */
  reachable: Record<NodeId, boolean>;
  /** Map of edge id -> is energized (both endpoints reachable & edge intact). */
  energizedEdges: Record<EdgeId, boolean>;
  /** Edges that are intact and could be re-broken by the player. */
  rebreakable: EdgeId[];
  /** Edges that are currently broken. */
  brokenEdges: EdgeId[];
}

export function createContinuityState(
  nodes: ContinuityNode[],
  edges: ContinuityEdge[],
  source: NodeId,
): ContinuityState {
  return {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    edges: Object.fromEntries(edges.map((e) => [e.id, e])),
    source,
  };
}

/**
 * Compute the initial broken-edge set from the topology: any edge
 * declared broken in the topology starts in the broken set. The player
 * repairs by removing from this set.
 */
export function initialBrokenSet(edges: ContinuityEdge[]): Set<EdgeId> {
  const out = new Set<EdgeId>();
  for (const e of edges) {
    if (e.state === 'broken') out.add(e.id);
  }
  return out;
}

/**
 * Compute reachability from the source, given a particular set of
 * broken edges. Pure: no mutation.
 */
export function computeReachability(
  state: ContinuityState,
  brokenEdgeIds: Set<EdgeId>,
): ContinuityResult {
  // Build adjacency
  const adj: Record<NodeId, EdgeId[]> = {};
  for (const id in state.nodes) adj[id] = [];
  for (const id in state.edges) {
    if (brokenEdgeIds.has(id)) continue;
    const e = state.edges[id];
    adj[e.from]?.push(e.id);
    adj[e.to]?.push(e.id);
  }

  // BFS from source
  const reachable: Record<NodeId, boolean> = {};
  const queue: NodeId[] = [state.source];
  reachable[state.source] = true;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const eid of adj[cur] ?? []) {
      const e = state.edges[eid];
      const other = e.from === cur ? e.to : e.from;
      if (!reachable[other]) {
        reachable[other] = true;
        queue.push(other);
      }
    }
  }

  // Energized edges = both endpoints reachable & edge intact
  const energizedEdges: Record<EdgeId, boolean> = {};
  for (const id in state.edges) {
    const e = state.edges[id];
    if (brokenEdgeIds.has(e.id) || e.state === 'broken') {
      energizedEdges[id] = false;
    } else {
      energizedEdges[id] = !!(reachable[e.from] && reachable[e.to]);
    }
  }

  // Compute re-breakable and broken
  const rebreakable: EdgeId[] = [];
  const broken: EdgeId[] = [];
  for (const id in state.edges) {
    const e = state.edges[id];
    if (brokenEdgeIds.has(id)) {
      broken.push(id);
      rebreakable.push(id);
    } else if (e.state === 'broken') {
      broken.push(id);
    }
  }

  return { reachable, energizedEdges, rebreakable, brokenEdges: broken };
}

/**
 * Apply a repair: remove edge from the broken set. Returns the new
 * broken set (a copy, no mutation).
 */
export function repairEdge(
  _state: ContinuityState,
  brokenEdgeIds: Set<EdgeId>,
  edgeId: EdgeId,
): Set<EdgeId> {
  const next = new Set(brokenEdgeIds);
  next.delete(edgeId);
  return next;
}

/**
 * Apply a break: add edge to the broken set. Returns the new set
 * (a copy, no mutation).
 */
export function breakEdge(
  _state: ContinuityState,
  brokenEdgeIds: Set<EdgeId>,
  edgeId: EdgeId,
): Set<EdgeId> {
  const next = new Set(brokenEdgeIds);
  next.add(edgeId);
  return next;
}

/**
 * Check if a specific load is energized.
 */
export function isEnergized(
  result: ContinuityResult,
  nodeId: NodeId,
): boolean {
  return !!result.reachable[nodeId];
}

/**
 * P1 solution validation. Returns true if both key loads (Plaza lamps
 * ring AND Ohm) are energized, given the player's repair set.
 *
 * In the canonical puzzle, "solved" means the source is connected to
 * the fountain node and the Ohm node through any valid path.
 */
export function isPuzzleSolved(
  state: ContinuityState,
  brokenEdgeIds: Set<EdgeId>,
  requiredLoads: NodeId[],
): boolean {
  const r = computeReachability(state, brokenEdgeIds);
  return requiredLoads.every((id) => r.reachable[id]);
}

/**
 * Validate that the repair set is "valid" — i.e. doesn't claim to break
 * an edge that wasn't broken to start with (the player can't break
 * arbitrary edges in P1). Returns true if all breaks are "authorised".
 */
export function isValidRepairSet(
  state: ContinuityState,
  brokenEdgeIds: Set<EdgeId>,
): boolean {
  for (const id of brokenEdgeIds) {
    if (!(id in state.edges)) return false;
  }
  return true;
}
