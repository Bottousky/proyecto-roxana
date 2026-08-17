/**
 * Bitácora — the in-world journal.
 *
 * A slide-in panel from the right. DOM-based, paper-textured. Holds
 * three tabs:
 *   - Bitácora: the player's vivencia, evidencia, formalización.
 *   - Mapa: a simple hand-drawn map of the Cuenca de Ohm.
 *   - Sistema: the live state of the electrical graph (which nodes are
 *     energised, which cables are broken).
 *
 * Entries are unlocked by understanding, not by visiting. Each entry
 * has vivencia (the player's first-person account of what happened),
 * evidencia (the actual observation, separated), and formalización
 * (the technical translation, gated by a flag).
 */

export interface BitacoraEntry {
  id: string;
  title: string;
  /** Pre-formalización: only vivencia + evidencia. */
  vivencia: string;
  evidencia: string;
  /** Gated by flag. Optional. */
  formalizacion?: string;
  /** When unlocked. */
  unlockedAt: number;
  /** Optional flag that must be set to show formalización. */
  formalizacionFlag?: string;
}

export type BitacoraTab = 'bitacora' | 'mapa' | 'sistema';

export class Bitacora {
  private root: HTMLElement;
  private entries: BitacoraEntry[] = [];
  private currentTab: BitacoraTab = 'bitacora';
  private isOpen: boolean = false;
  private hasFlag: (flag: string) => boolean = () => false;
  private onCloseCallback: () => void = () => {};

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  setFlagProvider(provider: (flag: string) => boolean): void {
    this.hasFlag = provider;
  }

  setOnClose(cb: () => void): void {
    this.onCloseCallback = cb;
  }

  open(): void {
    this.isOpen = true;
    this.root.classList.add('open');
    this.refresh();
  }

  close(): void {
    this.isOpen = false;
    this.root.classList.remove('open');
    this.onCloseCallback();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  isVisible(): boolean {
    return this.isOpen;
  }

  /**
   * Add a new entry. If the entry id already exists, this is a no-op.
   * Returns true if the entry was added, false if it already existed.
   */
  addEntry(entry: BitacoraEntry): boolean {
    if (this.entries.find((e) => e.id === entry.id)) return false;
    this.entries.push(entry);
    this.entries.sort((a, b) => a.unlockedAt - b.unlockedAt);
    if (this.isOpen) this.refresh();
    return true;
  }

  setTab(tab: BitacoraTab): void {
    this.currentTab = tab;
    if (this.isOpen) this.refresh();
  }

  /** Refresh content (call after state changes). */
  refresh(): void {
    const content = this.root.querySelector('.bitacora-content') as HTMLElement;
    if (!content) return;
    if (this.currentTab === 'bitacora') {
      this.renderEntries(content);
    } else if (this.currentTab === 'mapa') {
      this.renderMap(content);
    } else if (this.currentTab === 'sistema') {
      this.renderSistema(content);
    }
    // Update tab buttons
    this.root.querySelectorAll<HTMLButtonElement>('.bitacora-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
    });
  }

  private render(): void {
    this.root.innerHTML = `
      <div class="bitacora-header">
        <span>Bitácora Roxana</span>
        <button class="bitacora-close" aria-label="Cerrar">×</button>
      </div>
      <div class="bitacora-tabs">
        <button class="bitacora-tab active" data-tab="bitacora">Bitácora</button>
        <button class="bitacora-tab" data-tab="mapa">Mapa</button>
        <button class="bitacora-tab" data-tab="sistema">Sistema</button>
      </div>
      <div class="bitacora-content"></div>
    `;
    this.root.querySelector('.bitacora-close')?.addEventListener('click', () => this.close());
    this.root.querySelectorAll<HTMLButtonElement>('.bitacora-tab').forEach((btn) => {
      btn.addEventListener('click', () => this.setTab(btn.dataset.tab as BitacoraTab));
    });
  }

  private renderEntries(root: HTMLElement): void {
    if (this.entries.length === 0) {
      root.innerHTML = `<div class="bitacora-empty">Tu bitácora está vacía. Cuando entiendas algo, se escribirá acá.</div>`;
      return;
    }
    root.innerHTML = this.entries
      .map((e) => this.renderEntry(e))
      .join('');
  }

  private renderEntry(e: BitacoraEntry): string {
    const showForm = !e.formalizacionFlag || this.hasFlag(e.formalizacionFlag);
    return `
      <div class="bitacora-entry">
        <div class="entry-title">${escapeHtml(e.title)}</div>
        <div class="entry-vivencia">${escapeHtml(e.vivencia)}</div>
        <div class="entry-evidencia">${escapeHtml(e.evidencia)}</div>
        ${e.formalizacion && showForm ? `<div class="entry-formalizacion">${escapeHtml(e.formalizacion)}</div>` : ''}
      </div>
    `;
  }

  private renderMap(root: HTMLElement): void {
    root.innerHTML = `
      <div class="bitacora-entry">
        <div class="entry-title">Cuenca de Ohm — croquis</div>
        <div class="entry-vivencia">
          Un croquis a mano alzada del territorio que recorrí. Las líneas no son exactas; son lo que recuerdo.
        </div>
        <div class="entry-evidencia" style="font-family:monospace;white-space:pre;line-height:1.2;font-size:11px">
   Manantial     [ N ]
     ≈≈≈≈≈≈≈≈≈
   _  Puerta  _
  |  ▒  Ω  ▒  |
  |____________|
        |||
   _  Plaza  _      Taller
  |  +  f  +  |    [ Lumen ]
  |  L  L  L  |     [ puerta]
  |____________|
        |||
     Camino
   [P Portal]</div>
        <div class="entry-formalizacion">Sendero S (sur) — Camino (s) — Plaza — Puerta — Calzada — Manantial (n). Taller al este de la Plaza.</div>
      </div>
    `;
  }

  private renderSistema(root: HTMLElement): void {
    // The engine injects live state via a callback. Default is a stub.
    root.innerHTML = `
      <div class="bitacora-entry">
        <div class="entry-title">Sistema eléctrico — estado</div>
        <div class="entry-evidencia" id="bitacora-sistema-state">(sin datos — el motor no se inicializó)</div>
        <div class="entry-formalizacion">Una instalación está "comprendida" cuando el cableado está completo, las protecciones están dimensionadas, ninguna carga está en sobrecarga, y un habitante del lugar puede repetir el procedimiento sin vos.</div>
      </div>
    `;
  }

  /** Inject the live system state HTML. Called by the engine. */
  setSistemaState(html: string): void {
    const el = this.root.querySelector('#bitacora-sistema-state');
    if (el) el.innerHTML = html;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let _instance: Bitacora | null = null;
export const bitacora = {
  mount(root: HTMLElement): Bitacora {
    if (!_instance) _instance = new Bitacora(root);
    return _instance;
  },
  get(): Bitacora {
    if (!_instance) throw new Error('Bitacora not mounted');
    return _instance;
  },
};
