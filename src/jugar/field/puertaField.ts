import { leerPuerta, type LecturaPuerta } from '../../puzzles/puertaModel.ts';
import { sfxBridge, sfxDim, sfxFzzt, sfxHot, sfxOk } from '../../audio.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

const FUENTES = ['brasa', 'corazon', 'tormenta'] as const;
const PIEDRAS = ['marron', 'roja', 'amarilla', 'gris'] as const;

interface PuertaFieldState {
  fuente: string | null;
  piedra: string | null;
  burned: boolean;
  predicted: boolean;
  solved: boolean;
  note: string;
}

export class PuertaFieldController implements FieldController {
  readonly kind = 'puerta' as const;
  readonly roomId = 'puerta';
  private data: PuertaFieldState;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void) {
    this.onSolved = onSolved;
    this.data = {
      fuente: null,
      piedra: null,
      burned: false,
      predicted: false,
      solved: false,
      note: 'Ajusta Empuje y Piedra. Tres pares abren. El ojo es el mismo instrumento del taller.',
    };
  }

  active(): boolean {
    return !this.data.solved;
  }

  hud(): FieldHudView {
    const reading = this.reading();
    return {
      title: 'Puerta de Ohm',
      ohm: ohmFor(reading),
      status: this.data.note,
      inventory: [
        this.data.fuente ? `Empuje: ${this.data.fuente}` : 'Empuje: —',
        this.data.piedra ? `Piedra: ${this.data.piedra}` : 'Piedra: —',
      ].join(' · '),
      needle: {
        value: reading.caudal ?? 0,
        min: 0,
        max: 8,
        label: reading.caudal === null ? 'ojo vacío' : `Río ${reading.caudal}`,
      },
      energizeLabel: this.data.burned ? 'Cambiar fusible ritual' : 'Bajar la palanca',
      energizeEnabled: true,
    };
  }

  interact(thingId: string): void {
    if (this.data.solved) return;
    if (thingId === 'field-puerta-ojo') {
      this.data.predicted = true;
      this.data.note = 'El ojo de aguja es el indicador. Ajusta y baja la palanca.';
      return;
    }
    if (thingId === 'field-puerta-lever') {
      this.energize();
      return;
    }
    if (thingId === 'field-puerta-fuse') {
      this.replaceFuse();
      return;
    }
    const fuente = fuenteFromThing(thingId);
    if (fuente) {
      this.data.fuente = fuente;
      sfxBridge();
      this.data.note = `Cristal de Empuje: ${fuente}.`;
      return;
    }
    const piedra = piedraFromThing(thingId);
    if (piedra) {
      this.data.piedra = piedra;
      sfxBridge();
      this.data.note = `Piedra ${piedra} en el engaste.`;
    }
  }

  energize(): void {
    if (this.data.solved) return;
    if (this.data.burned) {
      this.replaceFuse();
      return;
    }
    if (!this.data.predicted) {
      this.data.note = 'Mira primero el ojo de aguja. Él dice si el río es justo.';
      return;
    }
    const reading = this.reading();
    if (reading.estado === 'incompleto') {
      this.data.note = 'Falta Empuje o Piedra.';
      return;
    }
    if (reading.abre) {
      this.data.solved = true;
      sfxOk();
      this.data.note = 'Las hojas se abren. El río dos cruza.';
      clearField();
      this.onSolved();
      return;
    }
    if (reading.estado === 'fusible') {
      this.data.burned = true;
      sfxFzzt();
      this.data.note = 'El fusible ritual se inmola. Hay repuestos.';
      return;
    }
    if (reading.estado === 'caliente') {
      sfxHot();
      this.data.note = 'El ojo se clava al rojo. Demasiado río.';
      return;
    }
    sfxDim();
    this.data.note = 'El ojo apenas se mueve. Poco río.';
  }

  colorOf(thingId: string): number | undefined {
    if (thingId === 'field-puerta-ojo') {
      const reading = this.reading();
      if (this.data.burned) return 0x2a2420;
      if (reading.abre) return 0xffe08a;
      if (reading.estado === 'caliente') return 0xff6a3a;
      if (reading.estado === 'debil') return 0x6a5840;
      return 0x3a3340;
    }
    const fuente = fuenteFromThing(thingId);
    if (fuente) return this.data.fuente === fuente ? 0xe8c33a : 0x6a5840;
    const piedra = piedraFromThing(thingId);
    if (piedra) return this.data.piedra === piedra ? 0xc9a437 : 0x4a4034;
    return undefined;
  }

  snapshot(): PuertaFieldState {
    return { ...this.data };
  }

  private reading(): LecturaPuerta {
    if (this.data.burned) return { caudal: 0, estado: 'fusible', abre: false };
    return leerPuerta(this.data.fuente, this.data.piedra);
  }

  private replaceFuse(): void {
    if (!this.data.burned) return;
    this.data.burned = false;
    sfxBridge();
    this.data.note = 'Fusible nuevo. La Puerta espera.';
  }
}

function fuenteFromThing(thingId: string): string | null {
  const id = thingId.replace('field-puerta-fuente-', '');
  return (FUENTES as readonly string[]).includes(id) ? id : null;
}

function piedraFromThing(thingId: string): string | null {
  const id = thingId.replace('field-puerta-piedra-', '');
  return (PIEDRAS as readonly string[]).includes(id) ? id : null;
}

function ohmFor(reading: LecturaPuerta): string {
  if (reading.abre) return 'Ohm: río dos. La Puerta cede.';
  if (reading.estado === 'fusible') return 'Ohm: sobrecarga. El mártir cayó.';
  if (reading.estado === 'caliente') return 'Ohm: demasiado río.';
  if (reading.estado === 'debil') return 'Ohm: poco río.';
  return 'Ohm: elige Empuje y Piedra.';
}

export function ensurePuertaField(onSolved: () => void): PuertaFieldController {
  const current = currentField();
  if (current instanceof PuertaFieldController) return current;
  return installField(new PuertaFieldController(onSolved)) as PuertaFieldController;
}
