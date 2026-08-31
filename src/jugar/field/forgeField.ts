import {
  FORGE_FUSES,
  FORGE_MACHINE_IDS,
  FORGE_MACHINE_TARGETS,
  FORGE_PUSHES,
  addForgeStone,
  attemptForge,
  createForgeState,
  evaluateForge,
  removeForgeStone,
  repairForgeChannel,
  setForgeFuse,
  setForgePush,
  setForgeThickness,
  type ForgeFuse,
  type ForgeMachineId,
  type ForgePush,
  type ForgeState,
  type ForgeStone,
} from '../../puzzles/forgeModel.ts';
import { sfxBridge, sfxFzzt, sfxHot, sfxOk } from '../../audio.ts';
import type { ChannelThickness } from '../../puzzles/common.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

const THICKNESS: ChannelThickness[] = ['angosto', 'medio', 'ancho'];
const STONES: ForgeStone[] = ['marron', 'roja', 'amarilla', 'gris'];

export class ForgeFieldController implements FieldController {
  readonly kind = 'forge' as const;
  readonly roomId = 'forge_hall';
  private state: ForgeState;
  private selected: ForgeMachineId;
  private predicted: boolean;
  private note: string;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void) {
    this.onSolved = onSolved;
    this.state = createForgeState();
    this.selected = 'martillo';
    this.predicted = false;
    this.note = 'Tres máquinas. Entrega = Empuje × Río. Designa una máquina, luego calibra.';
  }

  active(): boolean {
    return !this.state.solved;
  }

  hud(): FieldHudView {
    const evaluation = evaluateForge(this.state);
    const machine = evaluation.machines[this.selected];
    return {
      title: 'Nave de la Forja',
      ohm: `Ohm: ${this.selected} entrega ${machine.delivery} / ${FORGE_MACHINE_TARGETS[this.selected]}.`,
      status: this.note,
      inventory: `Empuje ${this.state.push} · ${this.selected}: piedras ${this.state.branches[this.selected].stones.join(', ') || '—'}`,
      needle: {
        value: machine.delivery,
        min: 0,
        max: 32,
        label: `entrega ${machine.delivery}`,
      },
      energizeLabel: 'Energizar la nave',
      energizeEnabled: this.predicted,
    };
  }

  interact(thingId: string): void {
    if (this.state.solved) return;
    if (thingId === 'field-forge-energize') {
      this.energize();
      return;
    }
    if (thingId === 'field-forge-quitar') {
      const stones = this.state.branches[this.selected].stones;
      if (stones.length > 0) {
        this.state = removeForgeStone(this.state, this.selected, stones.length - 1);
        sfxBridge();
        this.note = `Quitas la última piedra de ${this.selected}.`;
      }
      return;
    }
    const machine = machineFromThing(thingId);
    if (machine) {
      this.selected = machine;
      this.predicted = true;
      this.note = `Miras ${machine}. Calor y entrega visibles. Ajusta Piedra, Camino y fusible.`;
      return;
    }
    if (thingId === 'field-forge-repair') {
      this.state = repairForgeChannel(this.state, this.selected);
      sfxBridge();
      this.note = `Canal de ${this.selected} reparado.`;
      return;
    }
    const push = pushFromThing(thingId);
    if (push !== null) {
      this.state = setForgePush(this.state, push);
      sfxBridge();
      this.note = `Empuje ${push}.`;
      return;
    }
    const stone = stoneFromThing(thingId);
    if (stone) {
      this.state = addForgeStone(this.state, this.selected, stone);
      sfxBridge();
      this.note = `Piedra ${stone} en ${this.selected}.`;
      return;
    }
    const thickness = thicknessFromThing(thingId);
    if (thickness) {
      this.state = setForgeThickness(this.state, this.selected, thickness);
      sfxBridge();
      this.note = `Camino ${thickness} en ${this.selected}.`;
      return;
    }
    const fuse = fuseFromThing(thingId);
    if (fuse !== null) {
      this.state = setForgeFuse(this.state, this.selected, fuse);
      sfxBridge();
      this.note = `Fusible ${fuse} en ${this.selected}.`;
    }
  }

  energize(): void {
    if (this.state.solved) return;
    if (!this.predicted) {
      this.note = 'Designa primero una máquina. El calor es el indicador.';
      return;
    }
    const result = attemptForge(this.state);
    this.state = result.state;
    if (result.event === 'solved') {
      sfxOk();
      this.note = 'Las tres máquinas trabajan. El jornal se paga.';
      clearField();
      this.onSolved();
      return;
    }
    if (result.event === 'young-fuse') {
      sfxFzzt();
      this.note = 'Un fusible joven no sobrevivió al pico.';
      return;
    }
    if (result.event === 'cut' || result.event === 'channel-cut') {
      sfxHot();
      this.note = 'El canal se cortó. Hay que repararlo en la mesa.';
      return;
    }
    if (result.event === 'red-warning') {
      sfxHot();
      this.note = 'El canal se pone al rojo. Baja el río o ensancha el Camino.';
      return;
    }
    if (result.event === 'incomplete') {
      this.note = 'Falta Piedra, Camino o fusible en alguna máquina.';
      return;
    }
    this.note = result.diagnostics[0]
      ? diagnosticLine(result.diagnostics[0].code, result.diagnostics[0].machineId)
      : 'La nave no cierra. Mira calor, calibre y fusible.';
  }

  colorOf(thingId: string): number | undefined {
    const evaluation = evaluateForge(this.state);
    const machine = machineFromThing(thingId);
    if (machine) {
      const heat = evaluation.machines[machine].workLevel;
      if (this.state.branches[machine].channel.cut) return 0x2a2420;
      if (heat === 'rojo') return 0xff3a20;
      if (heat === 'caliente') return 0xff6a3a;
      if (heat === 'tibio') return 0xe8a050;
      if (evaluation.machines[machine].exactDelivery) return 0xffe08a;
      return 0x5a4030;
    }
    const push = pushFromThing(thingId);
    if (push !== null) return this.state.push === push ? 0xe8c33a : 0x6a5840;
    return undefined;
  }

  snapshot(): ForgeState {
    return this.state;
  }
}

function machineFromThing(thingId: string): ForgeMachineId | null {
  const id = thingId.replace('field-forge-', '') as ForgeMachineId;
  return (FORGE_MACHINE_IDS as readonly string[]).includes(id) ? id : null;
}

function pushFromThing(thingId: string): ForgePush | null {
  const value = Number(thingId.replace('field-forge-push-', ''));
  return (FORGE_PUSHES as readonly number[]).includes(value) ? (value as ForgePush) : null;
}

function stoneFromThing(thingId: string): ForgeStone | null {
  const id = thingId.replace('field-forge-piedra-', '') as ForgeStone;
  return STONES.includes(id) ? id : null;
}

function thicknessFromThing(thingId: string): ChannelThickness | null {
  const id = thingId.replace('field-forge-camino-', '') as ChannelThickness;
  return THICKNESS.includes(id) ? id : null;
}

function fuseFromThing(thingId: string): ForgeFuse | null {
  const value = Number(thingId.replace('field-forge-fuse-', ''));
  return (FORGE_FUSES as readonly number[]).includes(value) ? (value as ForgeFuse) : null;
}

function diagnosticLine(code: string, machineId?: string): string {
  const where = machineId ? ` (${machineId})` : '';
  if (code === 'hungry') return `Una máquina tiene hambre de entrega${where}.`;
  if (code === 'trunk-overload') return 'El Tronco pide demasiado Río.';
  if (code === 'stock') return 'No hay más de ese calibre en la mesa.';
  if (code === 'oversized-fuse') return `El fusible no protege el Camino${where}.`;
  if (code === 'unsafe-fuse') return `El fusible no cubre el pico${where}.`;
  return `La red no cierra${where}.`;
}

export function ensureForgeField(onSolved: () => void): ForgeFieldController {
  const current = currentField();
  if (current instanceof ForgeFieldController) return current;
  return installField(new ForgeFieldController(onSolved)) as ForgeFieldController;
}
