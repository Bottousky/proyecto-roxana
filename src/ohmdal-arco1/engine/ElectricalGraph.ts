/**
 * ElectricalGraph — the live state of the world's electrical system.
 *
 * Wraps the pure `continuityModel` with mutation, listeners, and
 * propagation. The engine reads/writes through this. When the player
 * repairs a wire, the engine calls `repairEdge(id)`. The graph
 * recomputes reachability, fires events for energised/de-energised
 * nodes, and updates each node's `state`.
 *
 * Events:
 *   - 'nodeEnergized' { id }
 *   - 'nodeDeenergized' { id }
 *   - 'edgeEnergized' { id }
 *   - 'edgeBroken' { id, breakIndex? }
 *   - 'edgeRepaired' { id }
 *
 * The engine listens to these and updates lights, particles, audio.
 */

import {
  createContinuityState,
  computeReachability,
  repairEdge as repairEdgePure,
  breakEdge as breakEdgePure,
  isEnergized,
  type ContinuityState,
  type NodeId,
  type EdgeId,
  type ContinuityNode,
  type ContinuityEdge,
  type ContinuityResult,
} from '../puzzles/continuityModel.ts';

export type ElectricalEvent =
  | { type: 'nodeEnergized'; id: NodeId }
  | { type: 'nodeDeenergized'; id: NodeId }
  | { type: 'edgeEnergized'; id: EdgeId }
  | { type: 'edgeDeenergized'; id: EdgeId }
  | { type: 'edgeRepaired'; id: EdgeId }
  | { type: 'edgeBroken'; id: EdgeId };

export type ElectricalListener = (ev: ElectricalEvent) => void;

export class ElectricalGraph {
  private state: ContinuityState;
  private brokenSet: Set<EdgeId>;
  private listeners: Set<ElectricalListener> = new Set();
  private lastResult: ContinuityResult;
  private nodeById: Map<NodeId, ContinuityNode>;
  private edgeById: Map<EdgeId, ContinuityEdge>;
  private edgePathById: Map<EdgeId, { x: number; y: number }[]>;

  constructor(
    nodes: ContinuityNode[],
    edges: ContinuityEdge[],
    source: NodeId,
    initialBroken: EdgeId[] = [],
  ) {
    this.nodeById = new Map(nodes.map((n) => [n.id, n]));
    this.edgeById = new Map(edges.map((e) => [e.id, e]));
    this.edgePathById = new Map(edges.map((e) => [e.id, e.path ?? []]));
    this.state = createContinuityState(nodes, edges, source);
    // Initial broken set: combine topology-broken edges with player's broken set
    this.brokenSet = new Set(initialBroken);
    // Topological breaks are always considered broken
    for (const e of edges) {
      if (e.state === 'broken' && !this.brokenSet.has(e.id)) {
        this.brokenSet.add(e.id);
      }
    }
    this.lastResult = computeReachability(this.state, this.brokenSet);
  }

  on(listener: ElectricalListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(ev: ElectricalEvent): void {
    for (const l of this.listeners) l(ev);
  }

  /**
   * Recompute reachability, fire events for changes. Returns the new
   * result.
   */
  recompute(): ContinuityResult {
    const prev = this.lastResult;
    const next = computeReachability(this.state, this.brokenSet);
    this.lastResult = next;

    // Node state changes
    for (const id in this.state.nodes) {
      const was = !!prev.reachable[id];
      const now = !!next.reachable[id];
      if (!was && now) this.emit({ type: 'nodeEnergized', id });
      else if (was && !now) this.emit({ type: 'nodeDeenergized', id });
    }
    // Edge state changes
    for (const id in this.state.edges) {
      const was = !!prev.energizedEdges[id];
      const now = !!next.energizedEdges[id];
      if (!was && now) this.emit({ type: 'edgeEnergized', id });
      else if (was && !now) this.emit({ type: 'edgeDeenergized', id });
    }
    return next;
  }

  /**
   * Player action: repair a wire.
   */
  repairEdge(edgeId: EdgeId): boolean {
    if (!this.edgeById.has(edgeId)) return false;
    if (!this.brokenSet.has(edgeId)) return false;
    this.brokenSet = repairEdgePure(this.state, this.brokenSet, edgeId);
    this.emit({ type: 'edgeRepaired', id: edgeId });
    this.recompute();
    return true;
  }

  /**
   * Player action: break a wire.
   */
  breakEdge(edgeId: EdgeId): boolean {
    if (!this.edgeById.has(edgeId)) return false;
    if (this.brokenSet.has(edgeId)) return false;
    this.brokenSet = breakEdgePure(this.state, this.brokenSet, edgeId);
    this.emit({ type: 'edgeBroken', id: edgeId });
    this.recompute();
    return true;
  }

  isBroken(edgeId: EdgeId): boolean {
    return this.brokenSet.has(edgeId);
  }

  isEnergizedEdge(edgeId: EdgeId): boolean {
    return !!this.lastResult.energizedEdges[edgeId];
  }

  isEnergizedNode(nodeId: NodeId): boolean {
    return isEnergized(this.lastResult, nodeId);
  }

  getNode(nodeId: NodeId): ContinuityNode | undefined {
    return this.nodeById.get(nodeId);
  }

  getEdge(edgeId: EdgeId): ContinuityEdge | undefined {
    return this.edgeById.get(edgeId);
  }

  getEdgePath(edgeId: EdgeId): { x: number; y: number }[] {
    return this.edgePathById.get(edgeId) ?? [];
  }

  getResult(): ContinuityResult {
    return this.lastResult;
  }

  getAllNodes(): ContinuityNode[] {
    return Array.from(this.nodeById.values());
  }

  getAllEdges(): ContinuityEdge[] {
    return Array.from(this.edgeById.values());
  }

  getBrokenEdges(): EdgeId[] {
    return Array.from(this.brokenSet);
  }
}
