/**
 * HUD UI — top-level overlay.
 *
 * The HUD is DOM-based (not on the Phaser canvas) so it stays sharp at
 * any zoom level and is easy to update without redraw cost. The HUD
 * exposes:
 *
 *   - top-left:  region name + music key
 *   - top-right: time (in-world clock) + save indicator
 *   - bottom-left: object focus (when an interactable is highlighted)
 *   - bottom-right: Ohmdal-state indicator (dormant/awakening/powered)
 *
 * The HUD is also responsible for the audio toggle button.
 */

export class HUD {
  private region: HTMLElement;
  private state: HTMLElement;
  private focus: HTMLElement;
  private audioBtn: HTMLElement;
  private bitacoraBtn: HTMLElement;
  private onAudioToggle: () => void = () => {};
  private onBitacoraToggle: () => void = () => {};

  constructor(root: HTMLElement) {
    root.innerHTML = '';

    // Top-left: region
    const tl = document.createElement('div');
    tl.className = 'hud-corner top-left';
    tl.innerHTML = `<span class="hud-label">Zona</span><span class="hud-value" id="hud-region">Sendero Sur</span>`;
    this.region = tl.querySelector('#hud-region')!;
    root.appendChild(tl);

    // Top-right: time + save
    const tr = document.createElement('div');
    tr.className = 'hud-corner top-right';
    tr.innerHTML = `
      <span class="hud-label">Hora</span>
      <span class="hud-value" id="hud-time">Crepúsculo</span>
      <span class="hud-label" style="margin-top:4px">Estado</span>
      <span class="hud-value" id="hud-state"><span class="hud-pulse"></span>Apagado</span>
    `;
    this.state = tr.querySelector('#hud-state')!;
    root.appendChild(tr);

    // Bottom-left: focus (current interactable)
    const bl = document.createElement('div');
    bl.className = 'hud-corner bottom-left';
    bl.innerHTML = `
      <span class="hud-label">Cerca de</span>
      <span class="hud-value" id="hud-focus">—</span>
    `;
    this.focus = bl.querySelector('#hud-focus')!;
    root.appendChild(bl);

    // Bottom-right: bitácora button + audio toggle
    const br = document.createElement('div');
    br.className = 'hud-corner bottom-right';
    br.style.display = 'flex';
    br.style.gap = '6px';
    br.style.alignItems = 'center';
    this.bitacoraBtn = document.createElement('button');
    this.bitacoraBtn.className = 'bitacora-btn';
    this.bitacoraBtn.textContent = 'Bitácora [B]';
    this.bitacoraBtn.addEventListener('click', () => this.onBitacoraToggle());
    br.appendChild(this.bitacoraBtn);
    this.audioBtn = document.createElement('button');
    this.audioBtn.className = 'audio-toggle';
    this.audioBtn.textContent = '♪';
    this.audioBtn.title = 'Silenciar / activar audio';
    this.audioBtn.addEventListener('click', () => this.onAudioToggle());
    br.appendChild(this.audioBtn);
    root.appendChild(br);
  }

  setRegion(name: string): void {
    if (this.region) this.region.textContent = name;
  }

  setState(label: string, on: boolean): void {
    if (!this.state) return;
    this.state.innerHTML = `<span class="hud-pulse ${on ? 'on' : ''}"></span>${label}`;
  }

  setFocus(name: string | null, verb: string | null = null): void {
    if (!this.focus) return;
    if (!name) {
      this.focus.textContent = '—';
    } else if (verb) {
      this.focus.textContent = `${name} — ${verb}`;
    } else {
      this.focus.textContent = name;
    }
  }

  setAudioToggleHandler(handler: () => void): void {
    this.onAudioToggle = handler;
  }

  setBitacoraToggleHandler(handler: () => void): void {
    this.onBitacoraToggle = handler;
  }

  setAudioButtonState(muted: boolean): void {
    if (this.audioBtn) {
      this.audioBtn.textContent = muted ? '×' : '♪';
      this.audioBtn.style.color = muted ? '#a04030' : '';
    }
  }
}

let _instance: HUD | null = null;
export const ui = {
  mount(root: HTMLElement): HUD {
    if (!_instance) _instance = new HUD(root);
    return _instance;
  },
  get(): HUD {
    if (!_instance) throw new Error('UI not mounted');
    return _instance;
  },
};
