import { leerLamparaEterna } from '../../puzzles/frenoModel.ts';
import { sfxBridge, sfxDim, sfxFzzt, sfxHot, sfxOk } from '../../audio.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

type PiedraKey = 'marron' | 'roja' | 'amarilla' | 'gris' | 'rajada';

const TRAY: PiedraKey[] = ['marron', 'roja', 'amarilla', 'gris', 'rajada'];

interface FrenoFieldState {
  slot: PiedraKey;
  held: PiedraKey | null;
  burned: boolean;
  predicted: boolean;
  solved: boolean;
  note: string;
}

export class FrenoFieldController implements FieldController {
  readonly kind = 'freno' as const;
  readonly roomId = 'taller';
  private data: FrenoFieldState;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void) {
    this.onSolved = onSolved;
    this.data = {
      slot: 'rajada',
      held: null,
      burned: false,
      predicted: false,
      solved: false,
      note: 'Cambia la piedra. El color y las bandas dicen cuánto frena.',
    };
  }

  active(): boolean {
    return !this.data.solved;
  }

  hud(): FieldHudView {
    const reading = this.data.burned
      ? { caudal: 0, estado: 'fusible' as const }
      : leerLamparaEterna(this.data.slot);
    return {
      title: 'Lámpara Eterna',
      ohm: ohmFor(reading.estado),
      status: this.data.note,
      inventory: this.data.held
        ? `En la mano: piedra ${this.data.held}`
        : `En el zócalo: ${this.data.slot}`,
      needle: {
        value: reading.caudal,
        min: 0,
        max: 8,
        label: `Río ${reading.caudal}`,
      },
      energizeLabel: this.data.burned ? 'Cambiar fusible' : 'Bajar la palanca',
      energizeEnabled: this.data.predicted || this.data.burned,
    };
  }

  interact(thingId: string): void {
    if (this.data.solved) return;
    if (thingId === 'field-freno-lamp') {
      this.data.predicted = true;
      this.data.note = 'La Lámpara Eterna es el indicador. Ahora cambia la piedra y baja la palanca.';
      return;
    }
    if (thingId === 'field-freno-fuse') {
      this.replaceFuse();
      return;
    }
    if (thingId === 'field-freno-lever') {
      this.energize();
      return;
    }
    if (thingId === 'field-freno-socket') {
      if (!this.data.held) {
        this.data.note = 'Elige una piedra de la bandeja. Cuerpo y bandas, no sólo el color.';
        return;
      }
      const placed = this.data.held;
      this.data.held = this.data.slot;
      this.data.slot = placed;
      sfxBridge();
      this.data.note = `Piedra ${placed} en el zócalo.`;
      return;
    }
    const stone = stoneFromThing(thingId);
    if (!stone) return;
    this.data.held = stone;
    this.data.note = `Tomas la piedra ${stone}. Ponla en el zócalo.`;
  }

  energize(): void {
    if (this.data.solved) return;
    if (this.data.burned) {
      this.replaceFuse();
      return;
    }
    if (!this.data.predicted) {
      this.data.note = 'Mira primero la Lámpara Eterna. Ella dice si el río es justo.';
      return;
    }
    const reading = leerLamparaEterna(this.data.slot);
    if (reading.estado === 'fusible') {
      this.data.burned = true;
      sfxFzzt();
      this.data.note = 'El fusible se inmola. Hay repuestos en la caja de Lumen.';
      return;
    }
    if (reading.estado === 'caliente') {
      sfxHot();
      this.data.note = 'Demasiado río: la lámpara se pone al rojo. Cambia la piedra.';
      return;
    }
    if (reading.estado === 'justo') {
      this.data.solved = true;
      sfxOk();
      this.data.note = 'Luz firme. Tibia. Estable.';
      clearField();
      this.onSolved();
      return;
    }
    sfxDim();
    this.data.note = 'La lámpara vive, pero sin ganas. Demasiado freno.';
  }

  colorOf(thingId: string): number | undefined {
    if (thingId === 'field-freno-lamp') {
      if (this.data.burned) return 0x2a2420;
      const estado = leerLamparaEterna(this.data.slot).estado;
      if (estado === 'justo') return 0xffe08a;
      if (estado === 'caliente') return 0xff6a3a;
      if (estado === 'debil') return 0x7a6240;
      return 0x3a3028;
    }
    if (thingId === 'field-freno-socket') return stoneColor(this.data.slot);
    const stone = stoneFromThing(thingId);
    if (stone) return stoneColor(stone);
    return undefined;
  }

  snapshot(): FrenoFieldState {
    return { ...this.data };
  }

  private replaceFuse(): void {
    if (!this.data.burned) return;
    this.data.burned = false;
    sfxBridge();
    this.data.note = 'Fusible nuevo. Tres golpes solemnes. La lámpara espera.';
  }
}

function stoneFromThing(thingId: string): PiedraKey | null {
  const id = thingId.replace('field-freno-piedra-', '') as PiedraKey;
  return (TRAY as readonly string[]).includes(id) ? id : null;
}

function stoneColor(key: PiedraKey): number {
  if (key === 'roja') return 0xb33a32;
  if (key === 'amarilla') return 0xc9a437;
  if (key === 'gris') return 0x8a8a8a;
  if (key === 'marron') return 0x8b5a2b;
  return 0x6a4030;
}

function ohmFor(estado: string): string {
  if (estado === 'justo') return 'Ohm: río dos. Freno justo.';
  if (estado === 'caliente') return 'Ohm: demasiado río. El freno no alcanza.';
  if (estado === 'fusible') return 'Ohm: el mártir se ofreció. Cambia el fusible.';
  return 'Ohm: poco río. Demasiado freno.';
}

export function ensureFrenoField(onSolved: () => void): FrenoFieldController {
  const current = currentField();
  if (current instanceof FrenoFieldController) return current;
  return installField(new FrenoFieldController(onSolved)) as FrenoFieldController;
}
