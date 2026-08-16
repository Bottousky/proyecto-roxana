// Electrical graph for Ohmdal.
// A directed graph of nodes and cables. Each node has an "energized" boolean.
// The source (Portal) is the only producer. Cables propagate energy from
// the source to reachable nodes.
//
// The model is intentionally simple: a flood-fill from the source. A cable
// can be in two states: COMPLETE (carries power) or BROKEN (open circuit).
// The player's interaction with the world is to repair broken cables.

export type CableState = "complete" | "broken";

export interface ElectricalNode {
  id: string;
  // World position (XZ plane; Y is up in world space).
  position: { x: number; y: number; z: number };
  type: "source" | "lamp" | "pump" | "automaton" | "switch" | "compuerta";
  energized: boolean;
  // Optional mesh/light handle attached by the world.
  onEnergize?: () => void;
  onDeEnergize?: () => void;
}

export interface ElectricalCable {
  id: string;
  fromId: string;
  toId: string;
  state: CableState;
}

export class ElectricalGraph {
  private nodes = new Map<string, ElectricalNode>();
  private cables: ElectricalCable[] = [];

  addNode(node: ElectricalNode) {
    this.nodes.set(node.id, node);
  }

  addCable(cable: ElectricalCable) {
    this.cables.push(cable);
  }

  getNode(id: string): ElectricalNode | undefined {
    return this.nodes.get(id);
  }

  // Repair a cable (state -> complete). Returns true if the cable was broken
  // and is now complete.
  repair(cableId: string): boolean {
    const c = this.cables.find((x) => x.id === cableId);
    if (!c) return false;
    if (c.state === "complete") return false;
    c.state = "complete";
    this.recompute();
    return true;
  }

  // BFS from every source node. Mark reachable complete cables + nodes as
  // energized. Re-call after any state change.
  recompute() {
    // Reset.
    for (const n of this.nodes.values()) n.energized = false;

    const queue: string[] = [];
    for (const n of this.nodes.values()) {
      if (n.type === "source") {
        n.energized = true;
        queue.push(n.id);
      }
    }
    const visited = new Set<string>(queue);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const cable of this.cables) {
        if (cable.state !== "complete") continue;
        let neighbor: string | null = null;
        if (cable.fromId === cur && !visited.has(cable.toId)) neighbor = cable.toId;
        else if (cable.toId === cur && !visited.has(cable.fromId)) neighbor = cable.fromId;
        if (neighbor) {
          const n = this.nodes.get(neighbor);
          if (n) {
            n.energized = true;
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }

    // Fire callbacks.
    for (const n of this.nodes.values()) {
      const was = (n as ElectricalNode & { _was?: boolean })._was ?? false;
      if (n.energized && !was && n.onEnergize) n.onEnergize();
      if (!n.energized && was && n.onDeEnergize) n.onDeEnergize();
      (n as ElectricalNode & { _was?: boolean })._was = n.energized;
    }
  }

  // For debug.
  list(): { nodes: ElectricalNode[]; cables: ElectricalCable[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      cables: this.cables.slice(),
    };
  }
}
