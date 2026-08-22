import {
  evaluateLighthouseDistributionDc,
  recordCommission,
  type DistributionBranch,
  type Service,
  type TransferProgress,
} from '../../puzzles/lighthouseDistributionDcModel.ts';
import { sfxBridge, sfxOk } from '../../audio.ts';
import type { FieldHudView } from './hud.ts';
import { clearField, currentField, installField, type FieldController } from './session.ts';

const SERVICES: Service[] = ['lente', 'reloj', 'senal'];
const STONES = [6, 12, 18] as const;
const CALIBRES = [2, 4, 12] as const;
const FUSES = [1, 2, 4, 8] as const;

function blankCard(service: Service, enabled: boolean): DistributionBranch {
  return {
    service,
    enabled,
    resistance: 6,
    ampacity: 12,
    fuseRating: 4,
    isolatable: true,
  };
}

export class LighthouseFieldController implements FieldController {
  readonly kind = 'lighthouse' as const;
  readonly roomId = 'lighthouse_lantern';
  private cards: DistributionBranch[];
  private selected: Service;
  private predicted: boolean;
  private phase: 1 | 2;
  private progress: TransferProgress;
  private note: string;
  private readonly onSolved: () => void;

  constructor(onSolved: () => void) {
    this.onSolved = onSolved;
    this.cards = [
      blankCard('lente', true),
      blankCard('reloj', true),
      blankCard('senal', false),
    ];
    this.selected = 'lente';
    this.predicted = false;
    this.phase = 1;
    this.progress = { complete: false };
    this.note = 'Tres gabinetes: lente, reloj, señal. Designa un servicio, luego conecta.';
  }

  active(): boolean {
    return !this.progress.complete;
  }

  hud(): FieldHudView {
    const result = this.evaluate();
    return {
      title: this.phase === 1 ? 'Linterna · comisión 1' : 'Linterna · el Tronco tiene menos margen',
      ohm: `Ohm: Río total ${result.totalCurrent.toFixed(1)} / ${this.sourceLimit()}.`,
      status: this.note,
      inventory: `${this.selected}: ${this.selectedCard().enabled ? 'conectado' : 'aislado'} · Piedra ${this.selectedCard().resistance}`,
      needle: {
        value: result.totalCurrent,
        min: 0,
        max: this.sourceLimit(),
        label: `Río ${result.totalCurrent.toFixed(1)}`,
      },
      energizeLabel: 'Energizar la linterna',
      energizeEnabled: this.predicted,
    };
  }

  interact(thingId: string): void {
    if (this.progress.complete) return;
    if (thingId === 'field-lh-energize') {
      this.energize();
      return;
    }
    const service = serviceFromThing(thingId);
    if (service) {
      this.selected = service;
      this.predicted = true;
      this.note = `Miras ${labelOf(service)}. Ese indicador debe operar.`;
      return;
    }
    if (thingId === 'field-lh-toggle') {
      const card = this.selectedCard();
      card.enabled = !card.enabled;
      sfxBridge();
      this.note = `${labelOf(this.selected)} ${card.enabled ? 'conectado' : 'aislado'}.`;
      return;
    }
    if (thingId === 'field-lh-isolate') {
      const card = this.selectedCard();
      card.isolatable = !card.isolatable;
      sfxBridge();
      this.note = card.isolatable
        ? `Interruptor de ${labelOf(this.selected)} listo.`
        : `Falta interruptor en ${labelOf(this.selected)}.`;
      return;
    }
    const stone = numberFrom(thingId, 'field-lh-piedra-', STONES);
    if (stone !== null) {
      this.selectedCard().resistance = stone;
      sfxBridge();
      this.note = `Piedra ${stone} en ${labelOf(this.selected)}.`;
      return;
    }
    const calibre = numberFrom(thingId, 'field-lh-calibre-', CALIBRES);
    if (calibre !== null) {
      this.selectedCard().ampacity = calibre;
      sfxBridge();
      this.note = `Camino calibre ${calibre} en ${labelOf(this.selected)}.`;
      return;
    }
    const fuse = numberFrom(thingId, 'field-lh-fuse-', FUSES);
    if (fuse !== null) {
      this.selectedCard().fuseRating = fuse;
      sfxBridge();
      this.note = `Fusible ${fuse} en ${labelOf(this.selected)}.`;
    }
  }

  energize(): void {
    if (this.progress.complete) return;
    if (!this.predicted) {
      this.note = 'Designa primero un gabinete. La lente, el reloj o la señal dirán si opera.';
      return;
    }
    const result = this.evaluate();
    if (!result.valid) {
      this.note = result.feedback;
      return;
    }
    const next = recordCommission(this.progress, result);
    if (this.phase === 1) {
      this.progress = next;
      this.phase = 2;
      this.predicted = false;
      sfxOk();
      this.note = 'Comisión 1. El mundo baja el margen del Tronco. Hace falta otra firma.';
      return;
    }
    if (!next.complete) {
      this.note = 'El Tronco ahora tiene menos margen. Cambia la configuración: no vale la misma firma.';
      return;
    }
    this.progress = next;
    sfxOk();
    this.note = 'Los tres servicios se sostienen con menos margen. El Faro recuerda su latido.';
    clearField();
    this.onSolved();
  }

  colorOf(thingId: string): number | undefined {
    const result = this.evaluate();
    const service = serviceFromThing(thingId);
    if (!service) return undefined;
    const diag = result.diagnostics.find((item) => item.service === service);
    if (!diag || !this.cards.find((card) => card.service === service)?.enabled) return 0x3a4450;
    if (diag.fault === 'ok') return 0x8ec8ff;
    if (diag.fault === 'underpower') return 0x5a6a78;
    if (diag.fault === 'overpower' || diag.fault === 'ampacity') return 0xff6a3a;
    return 0xc9a437;
  }

  snapshot(): { phase: 1 | 2; progress: TransferProgress; cards: DistributionBranch[] } {
    return { phase: this.phase, progress: this.progress, cards: this.cards.map((card) => ({ ...card })) };
  }

  private sourceLimit(): number {
    return this.phase === 1 ? 12 : 5;
  }

  private selectedCard(): DistributionBranch {
    return this.cards.find((card) => card.service === this.selected)!;
  }

  private evaluate() {
    return evaluateLighthouseDistributionDc({
      voltage: 12,
      sourceLimit: this.sourceLimit(),
      branches: this.cards,
    });
  }
}

function serviceFromThing(thingId: string): Service | null {
  const id = thingId.replace('field-lh-', '') as Service;
  return SERVICES.includes(id) ? id : null;
}

function numberFrom(thingId: string, prefix: string, allowed: readonly number[]): number | null {
  if (!thingId.startsWith(prefix)) return null;
  const value = Number(thingId.slice(prefix.length));
  return allowed.includes(value) ? value : null;
}

function labelOf(service: Service): string {
  if (service === 'lente') return 'la lente';
  if (service === 'reloj') return 'el reloj';
  return 'la señal de costa';
}

export function ensureLighthouseField(onSolved: () => void): LighthouseFieldController {
  const current = currentField();
  if (current instanceof LighthouseFieldController) return current;
  return installField(new LighthouseFieldController(onSolved)) as LighthouseFieldController;
}
