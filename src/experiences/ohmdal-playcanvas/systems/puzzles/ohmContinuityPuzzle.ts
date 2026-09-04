/**
 * ohmContinuityPuzzle.ts — Sistema puro de continuidad para el despertar de Ohm (Stage B2).
 *
 * Regla pedagógica:
 *   fenómeno -> interacción -> consecuencia -> nombre -> reutilización.
 *
 * El circuito requiere cerrar un lazo completo entre Fuente (+) y Fuente (-) pasando POR Ohm.
 * El tramo del atajo (g2 -> g3) tiene un tramo partido (g3) que impide la conducción ("tocar no es unir").
 * La única solución válida requiere cubrir g1 (ida) + g5 y g4 (vuelta larga).
 */

export interface GapDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly fromNode: string;
  readonly toNode: string;
  readonly broken?: boolean;
}

export interface OhmGapView extends GapDefinition {
  readonly covered: boolean;
  readonly energized: boolean;
}

export type PuzzleCircuitState = 'abierto' | 'tocando' | 'cerrado';

export interface OhmPuzzleSnapshot {
  readonly state: PuzzleCircuitState;
  readonly complete: boolean;
  readonly supplyTotal: number;
  readonly supplyLeft: number;
  readonly covered: readonly string[];
  readonly energizedNodes: readonly string[];
  readonly gaps: readonly OhmGapView[];
}

export type ToggleResult =
  | { readonly success: true; readonly action: 'placed' | 'removed'; readonly state: PuzzleCircuitState; readonly message: string }
  | { readonly success: false; readonly reason: 'broken' | 'no_supply' | 'unknown_gap'; readonly message: string };

export const OHM_PEDESTAL_GAPS: readonly GapDefinition[] = [
  {
    id: 'g1',
    label: 'Puente Superior (Alimentación)',
    description: 'Conecta la salida (+) de la fuente con la entrada del autómata.',
    fromNode: 'FUENTE_MAS',
    toNode: 'CRUCE_ALTO',
  },
  {
    id: 'g2',
    label: 'Atajo Central (Retorno Rápido)',
    description: 'Ramal intermedio hacia el borne de retorno. Parece más corto.',
    fromNode: 'NUDO',
    toNode: 'ATAJO_MEDIO',
  },
  {
    id: 'g3',
    label: 'Tramo Quebrado (Fracturado)',
    description: 'El conductor de latón está calcinado y quebrado. Ningún puente hace contacto.',
    fromNode: 'ATAJO_MEDIO',
    toNode: 'OESTE_ALTO',
    broken: true,
  },
  {
    id: 'g5',
    label: 'Retorno Este (Canal Inferior A)',
    description: 'Primer tramo del lazo de retorno por la base del pedestal.',
    fromNode: 'ABAJO_ESTE',
    toNode: 'ABAJO_MEDIO',
  },
  {
    id: 'g4',
    label: 'Retorno Oeste (Canal Inferior B)',
    description: 'Segundo tramo del lazo de retorno hacia el polo (−) de la fuente.',
    fromNode: 'ABAJO_MEDIO',
    toNode: 'ABAJO_OESTE',
  },
];

export class OhmContinuityPuzzle {
  public readonly supplyTotal: number = 3;
  private readonly covered = new Set<string>();

  public constructor(initialCovered?: readonly string[]) {
    if (initialCovered) {
      for (const id of initialCovered) {
        if (this.canCover(id)) {
          this.covered.add(id);
        }
      }
    }
  }

  public getCovered(): ReadonlySet<string> {
    return this.covered;
  }

  public isComplete(): boolean {
    return this.getSnapshot().complete;
  }

  public canCover(gapId: string): boolean {
    const gap = OHM_PEDESTAL_GAPS.find((g) => g.id === gapId);
    if (!gap || gap.broken) return false;
    if (this.covered.has(gapId)) return true; // Can toggle off
    return this.supplyTotal - this.covered.size > 0;
  }

  public toggleGap(gapId: string): ToggleResult {
    const gap = OHM_PEDESTAL_GAPS.find((g) => g.id === gapId);
    if (!gap) {
      return { success: false, reason: 'unknown_gap', message: `Tramo desconocido: ${gapId}` };
    }

    if (gap.broken) {
      return {
        success: false,
        reason: 'broken',
        message: '⚠️ Tramo calcinado: los bornes están quebrados y no admiten puente.',
      };
    }

    if (this.covered.has(gapId)) {
      this.covered.delete(gapId);
      const snapshot = this.getSnapshot();
      return {
        success: true,
        action: 'removed',
        state: snapshot.state,
        message: `Puente retirado de ${gap.label}. Puentes disponibles: ${snapshot.supplyLeft}/${this.supplyTotal}.`,
      };
    }

    if (this.covered.size >= this.supplyTotal) {
      return {
        success: false,
        reason: 'no_supply',
        message: '⚠️ Sin puentes disponibles en la bandeja. Retira un puente previo para reubicarlo.',
      };
    }

    this.covered.add(gapId);
    const snapshot = this.getSnapshot();
    const stateMsg =
      snapshot.state === 'cerrado'
        ? '⚡ ¡Circuito cerrado! Camino continuo restablecido entre la fuente y el núcleo de Ohm.'
        : 'Puente acoplado. Hay contacto parcial, pero el camino aún no regresa a la fuente.';

    return {
      success: true,
      action: 'placed',
      state: snapshot.state,
      message: `${stateMsg} Puentes disponibles: ${snapshot.supplyLeft}/${this.supplyTotal}.`,
    };
  }

  public reset(): void {
    this.covered.clear();
  }

  public getSnapshot(): OhmPuzzleSnapshot {
    const energizedNodes = this.computeEnergizedNodes();
    const complete = this.isCircuitClosed(energizedNodes);
    const state: PuzzleCircuitState = complete
      ? 'cerrado'
      : this.covered.size > 0
        ? 'tocando'
        : 'abierto';

    const gaps: OhmGapView[] = OHM_PEDESTAL_GAPS.map((gap) => ({
      ...gap,
      covered: this.covered.has(gap.id),
      energized: energizedNodes.has(gap.fromNode) && (this.covered.has(gap.id) || !gap.broken),
    }));

    return {
      state,
      complete,
      supplyTotal: this.supplyTotal,
      supplyLeft: this.supplyTotal - this.covered.size,
      covered: Array.from(this.covered),
      energizedNodes: Array.from(energizedNodes),
      gaps,
    };
  }

  private computeEnergizedNodes(): Set<string> {
    const energized = new Set<string>(['FUENTE_MAS']);
    const queue = ['FUENTE_MAS'];

    // Graph of conductible connections
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.getConductingNeighbors(current);
      for (const next of neighbors) {
        if (!energized.has(next)) {
          energized.add(next);
          queue.push(next);
        }
      }
    }

    return energized;
  }

  private getConductingNeighbors(node: string): string[] {
    const neighbors: string[] = [];

    // Solid segments
    if (node === 'FUENTE_MAS') neighbors.push('IDA_ALTA');
    if (node === 'IDA_ALTA') neighbors.push('FUENTE_MAS');

    if (node === 'CRUCE_ALTO') neighbors.push('OHM');
    if (node === 'OHM') {
      neighbors.push('CRUCE_ALTO');
      neighbors.push('NUDO');
    }
    if (node === 'NUDO') {
      neighbors.push('OHM');
      neighbors.push('ABAJO_ESTE');
    }
    if (node === 'ABAJO_ESTE') neighbors.push('NUDO');

    if (node === 'ABAJO_OESTE') neighbors.push('OESTE_ALTO');
    if (node === 'OESTE_ALTO') {
      neighbors.push('ABAJO_OESTE');
      neighbors.push('FUENTE_MENOS');
    }
    if (node === 'FUENTE_MENOS') neighbors.push('OESTE_ALTO');

    // Bridged gaps
    for (const gap of OHM_PEDESTAL_GAPS) {
      if (gap.broken) continue;
      if (!this.covered.has(gap.id)) continue;

      if (node === gap.fromNode) neighbors.push(gap.toNode);
      if (node === gap.toNode) neighbors.push(gap.fromNode);
    }

    return neighbors;
  }

  private isCircuitClosed(energizedNodes: Set<string>): boolean {
    // Current must reach Ohm, continue to return nodes, and close at FUENTE_MENOS
    if (!energizedNodes.has('OHM')) return false;
    if (!energizedNodes.has('FUENTE_MENOS')) return false;

    // Series integrity: if we remove OHM, does connection between plus and minus break?
    // In our topology, OHM is in the only path from FUENTE_MAS to NUDO.
    const hasG1 = this.covered.has('g1');
    const hasLongReturn = this.covered.has('g5') && this.covered.has('g4');
    return hasG1 && hasLongReturn;
  }
}
