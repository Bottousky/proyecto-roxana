import {
  DISTRIBUTOR_PUSHES,
  DISTRIBUTOR_STONES,
  DISTRIBUTOR_TARGETS,
  createDistributorState,
  districtInGreenZone,
  distributorTrunkRiver,
  replaceDistributorFuse,
  setDistributorPush,
  setDistributorStone,
  type DistributorPush,
  type DistributorState,
  type DistributorStone,
} from '../../puzzles/distributorModel.ts';
import { sfxBridge, sfxOk, sfxTrunkFuse } from '../../audio.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

const DISTRICT_NAMES = ['Forja', 'Campanario', 'Biblioteca'] as const;

export class DistributorFieldController implements FieldController {
  readonly kind = 'distributor' as const;
  readonly roomId = 'castle_heart';
  private state: DistributorState;
  private predicted: boolean;
  private note: string;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void) {
    this.onSolved = onSolved;
    this.state = createDistributorState();
    this.predicted = false;
    this.note = 'Tres distritos. El Tronco paga la suma. Designa un barrio antes de ajustar.';
  }

  active(): boolean {
    return !this.state.solved;
  }

  hud(): FieldHudView {
    const trunk = distributorTrunkRiver(this.state);
    return {
      title: 'El Repartidor',
      ohm: this.state.fuse.burned
        ? 'Ohm: el Mártir del Tronco cayó.'
        : `Ohm: Tronco ${trunk}. Cada barrio cobra lo suyo.`,
      status: this.note,
      inventory: `Empuje ${this.state.push} · fusibles ${this.state.replacements}`,
      needle: {
        value: trunk,
        min: 0,
        max: 16,
        label: `Tronco ${trunk} / 8`,
      },
    };
  }

  interact(thingId: string): void {
    if (this.state.solved) return;
    if (thingId.startsWith('field-dist-lamp-')) {
      this.predicted = true;
      const index = Number(thingId.slice('field-dist-lamp-'.length));
      this.note = `Miras la lámpara de ${DISTRICT_NAMES[index] ?? 'un barrio'}. Ajusta su Piedra.`;
      return;
    }
    if (thingId === 'field-dist-fuse') {
      if (!this.state.fuse.burned) {
        this.note = 'El Mártir del Tronco sigue entero.';
        return;
      }
      this.state = replaceDistributorFuse(this.state);
      sfxBridge();
      this.note = 'Mártir nuevo. El Repartidor espera.';
      return;
    }
    const push = pushFromThing(thingId);
    if (push !== null) {
      if (!this.predicted) {
        this.note = 'Designa primero la lámpara de un barrio.';
        return;
      }
      const change = setDistributorPush(this.state, push);
      this.state = change.state;
      this.afterChange(change.fuseResult);
      return;
    }
    const district = districtFromThing(thingId);
    if (district === null) return;
    if (!this.predicted) {
      this.note = 'Designa primero la lámpara de un barrio.';
      return;
    }
    const current = this.state.districts[district].stone;
    const next = nextStone(current);
    const change = setDistributorStone(this.state, district, next);
    this.state = change.state;
    this.afterChange(change.fuseResult);
  }

  colorOf(thingId: string): number | undefined {
    if (thingId.startsWith('field-dist-lamp-')) {
      const index = Number(thingId.slice('field-dist-lamp-'.length));
      if (this.state.fuse.burned) return 0x2a2420;
      return districtInGreenZone(this.state, index) ? 0xffe08a : 0x5a4a38;
    }
    if (thingId === 'field-dist-fuse') return this.state.fuse.burned ? 0x5a3030 : 0x8a7c50;
    const push = pushFromThing(thingId);
    if (push !== null) return this.state.push === push ? 0xe8c33a : 0x6a5840;
    const district = districtFromThing(thingId);
    if (district === null) return undefined;
    return stoneColor(this.state.districts[district].stone);
  }

  snapshot(): DistributorState {
    return this.state;
  }

  private afterChange(fuseResult: 'ok' | 'warning' | 'burned'): void {
    if (fuseResult === 'burned') {
      sfxTrunkFuse();
      this.note = 'El Tronco se sobrecarga. El Mártir se ofreció.';
      return;
    }
    if (fuseResult === 'warning') {
      this.note = 'El Tronco protesta. Baja la suma o cambia piedras.';
      return;
    }
    sfxBridge();
    if (this.state.solved) {
      sfxOk();
      this.note = this.state.alternativeSolution
        ? 'Tres barrios en verde con poco Empuje. El río se reparte.'
        : 'Tres barrios en verde. El río se reparte.';
      clearField();
      this.onSolved();
      return;
    }
    const greens = DISTRIBUTOR_TARGETS.map((_, index) => districtInGreenZone(this.state, index));
    this.note = greens
      .map((ok, index) => `${DISTRICT_NAMES[index]}: río ${this.state.districts[index].river}${ok ? ' ✓' : ''}`)
      .join(' · ');
  }
}

function pushFromThing(thingId: string): DistributorPush | null {
  const value = Number(thingId.replace('field-dist-push-', ''));
  return (DISTRIBUTOR_PUSHES as readonly number[]).includes(value)
    ? (value as DistributorPush)
    : null;
}

function districtFromThing(thingId: string): number | null {
  if (!thingId.startsWith('field-dist-d')) return null;
  const index = Number(thingId.slice('field-dist-d'.length));
  return Number.isInteger(index) && index >= 0 && index < DISTRIBUTOR_TARGETS.length ? index : null;
}

function nextStone(current: DistributorStone): DistributorStone {
  const index = DISTRIBUTOR_STONES.indexOf(current);
  return DISTRIBUTOR_STONES[(index + 1) % DISTRIBUTOR_STONES.length];
}

function stoneColor(stone: DistributorStone): number {
  if (stone === 'roja') return 0xb33a32;
  if (stone === 'amarilla') return 0xc9a437;
  if (stone === 'marron') return 0x8b5a2b;
  return 0x8a8a8a;
}

export function ensureDistributorField(onSolved: () => void): DistributorFieldController {
  const current = currentField();
  if (current instanceof DistributorFieldController) return current;
  return installField(new DistributorFieldController(onSolved)) as DistributorFieldController;
}
