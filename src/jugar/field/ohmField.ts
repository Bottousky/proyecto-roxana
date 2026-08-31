import {
  coverRejection,
  PEDESTAL_RING,
  readCircuit,
  toggleCover,
  type CircuitState,
} from '../../puzzles/ohmModel.ts';
import { setFlag } from '../../state.ts';
import { sfxBridge, sfxFzzt, sfxOk } from '../../audio.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

const GAPS = ['g1', 'g2', 'g3', 'g4', 'g5'] as const;

export type OhmGapId = (typeof GAPS)[number];

interface OhmFieldState {
  covered: ReadonlySet<string>;
  predicted: boolean;
  solved: boolean;
  note: string;
}

export class OhmFieldController implements FieldController {
  readonly kind = 'ohm' as const;
  readonly roomId = 'plaza';
  private data: OhmFieldState;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void, initial?: Partial<OhmFieldState>) {
    this.onSolved = onSolved;
    this.data = {
      covered: initial?.covered ?? new Set(),
      predicted: initial?.predicted ?? false,
      solved: initial?.solved ?? false,
      note: initial?.note ?? 'Une los caminos. Tocar no basta.',
    };
  }

  reading() {
    return readCircuit(PEDESTAL_RING, this.data.covered);
  }

  active(): boolean {
    return !this.data.solved;
  }

  hud(): FieldHudView {
    const reading = this.reading();
    return {
      title: 'Pedestal de Ohm',
      ohm: ohmLine(reading.state),
      status: this.data.note,
      inventory: `Tramos en la bandeja: ${reading.supplyLeft}`,
      needle: {
        value: reading.state === 'cerrado' ? 1 : reading.state === 'tocando' ? 0.45 : 0,
        min: 0,
        max: 1,
        label: reading.state === 'cerrado' ? 'cerrado' : reading.state === 'tocando' ? 'tocando' : 'abierto',
      },
    };
  }

  interact(thingId: string): void {
    if (this.data.solved) return;
    if (thingId === 'field-ohm-lamp' || thingId === 'lamp') {
      this.data.predicted = true;
      if (this.reading().state === 'cerrado') {
        this.data.solved = true;
        this.data.note = 'La lámpara se enciende. El camino pasa por Ohm.';
        sfxOk();
        clearField();
        this.onSolved();
        return;
      }
      this.data.note = 'La lámpara de prueba es el indicador. Ahora cierra el camino.';
      return;
    }
    const gap = gapFromThing(thingId);
    if (!gap) return;
    const rejection = coverRejection(PEDESTAL_RING, this.data.covered, gap);
    if (rejection === 'partido') {
      sfxFzzt();
      this.data.note = 'Los bordes no coinciden. Tocar no es unir.';
      return;
    }
    if (rejection === 'sin-material') {
      this.data.note = 'No quedan tramos en la bandeja. Recupera uno.';
      return;
    }
    const next = toggleCover(PEDESTAL_RING, this.data.covered, gap);
    this.data.covered = next;
    sfxBridge();
    const reading = readCircuit(PEDESTAL_RING, next);
    if (reading.state === 'cerrado') {
      if (!this.data.predicted) {
        this.data.note = 'Mira primero la lámpara de prueba. Ella dice si el camino sirve.';
        return;
      }
      this.data.solved = true;
      this.data.note = 'La lámpara se enciende. El camino pasa por Ohm.';
      sfxOk();
      clearField();
      this.onSolved();
      return;
    }
    this.data.note = reading.state === 'tocando'
      ? 'Hay contacto, pero el camino no cierra.'
      : 'Nada unido todavía.';
  }

  colorOf(thingId: string): number | undefined {
    if (thingId === 'field-ohm-lamp') {
      const reading = this.reading();
      if (reading.state === 'cerrado') return 0xffe08a;
      if (reading.state === 'tocando') return 0x8a6a40;
      return 0x3a342c;
    }
    const gap = gapFromThing(thingId);
    if (!gap) return undefined;
    if (gap === 'g3') return 0x5a3030;
    return this.data.covered.has(gap) ? 0xc9a437 : 0x4a4034;
  }

  promptOf(thingId: string): string | undefined {
    if (thingId === 'field-ohm-lamp') return this.data.predicted ? 'Mirar la lámpara de prueba' : 'Designar la lámpara de prueba';
    const gap = gapFromThing(thingId);
    if (!gap) return undefined;
    if (gap === 'g3') return 'Probar el atajo partido';
    return this.data.covered.has(gap) ? 'Retirar el tramo' : 'Tender un tramo';
  }

  snapshot(): OhmFieldState {
    return { ...this.data, covered: new Set(this.data.covered) };
  }
}

function gapFromThing(thingId: string): OhmGapId | null {
  const id = thingId.replace('field-ohm-', '') as OhmGapId;
  return (GAPS as readonly string[]).includes(id) ? id : null;
}

function ohmLine(state: CircuitState): string {
  if (state === 'cerrado') return 'Ohm: camino cerrado. La chispa me atraviesa.';
  if (state === 'tocando') return 'Ohm: hay contacto. Todavía no hay camino.';
  return 'Ohm: espera un camino que me atraviese.';
}

export function ensureOhmField(onSolved: () => void): OhmFieldController {
  const current = currentField();
  if (current instanceof OhmFieldController) return current;
  setFlag('ohmBenchOpenedInWorld');
  return installField(new OhmFieldController(onSolved)) as OhmFieldController;
}
