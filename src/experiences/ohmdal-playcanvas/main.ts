import { mountPlayCanvasOhmdal } from './playcanvasRuntime.ts';
import type { PlazaUi } from '../ohmdal-plaza/plazaRuntime.ts';
import type { BitacoraManager } from '../ohmdal-plaza/journal/bitacora.ts';
import type { WorkbenchInspector } from '../ohmdal-plaza/inspect/workbench.ts';
import type { CircuitDef, CircuitReading } from '../../puzzles/ohmModel.ts';
import { portraitKey } from '../../ui/portrait.ts';

const PORTRAIT_MAP: Record<string, string> = {
  student: new URL('../../../assets/ohmdal/generated/portraits/student-portrait.png', import.meta.url).href,
  edda: new URL('../../../assets/ohmdal/generated/portraits/edda-portrait.png', import.meta.url).href,
  lumen: new URL('../../../assets/ohmdal/generated/portraits/lumen-portrait.png', import.meta.url).href,
  ohm: new URL('../../../assets/ohmdal/generated/portraits/ohm-portrait.png', import.meta.url).href,
  consejera: new URL('../../../assets/ohmdal/generated/portraits/consejera-portrait.png', import.meta.url).href,
  guardiana: new URL('../../../assets/ohmdal/generated/portraits/guardiana-portrait.png', import.meta.url).href,
  yesca: new URL('../../../assets/ohmdal/generated/portraits/yesca-portrait.png', import.meta.url).href,
  farero: new URL('../../../assets/ohmdal/generated/portraits/farero-portrait.png', import.meta.url).href,
  preceptor: new URL('../../../assets/ohmdal/generated/portraits/preceptor-portrait.png', import.meta.url).href,
  nino: new URL('../../../assets/ohmdal/generated/portraits/nino-portrait.png', import.meta.url).href,
  proyector: new URL('../../../assets/ohmdal/portraits/proyector.png', import.meta.url).href,
  ciudadano: new URL('../../../assets/ohmdal/portraits/ciudadano.png', import.meta.url).href,
};

const gameEl = document.getElementById('plaza-game')!;
const titleEl = document.getElementById('plaza-title')!;
const enterBtn = document.getElementById('plaza-enter')!;
const hudEl = document.getElementById('plaza-hud')!;
const promptEl = document.getElementById('plaza-prompt')!;
const toastEl = document.getElementById('plaza-toast')!;
const dialogEl = document.getElementById('plaza-dialog')!;
const dialogCardEl = document.querySelector<HTMLElement>('.dialog-card')!;
const speakerEl = document.getElementById('dialog-speaker')!;
const dialogTextEl = document.getElementById('dialog-text')!;
const portraitEl = document.getElementById('dialog-portrait') as HTMLImageElement;
const choicesEl = document.getElementById('dialog-choices')!;
const cinematicOverlayEl = document.getElementById('plaza-cinematic-overlay');
const skipCinematicBtn = document.getElementById('btn-skip-cinematic');
const galvHudEl = document.getElementById('galvanoscope-hud')!;
const galvVEl = document.getElementById('galv-voltage')!;
const galvREl = document.getElementById('galv-resistance')!;
const galvIEl = document.getElementById('galv-current')!;
const galvStEl = document.getElementById('galv-status')!;
const probeAText = document.getElementById('probe-a-text')!;
const probeBText = document.getElementById('probe-b-text')!;
const bitacoraModal = document.getElementById('bitacora-modal')!;
const bitacoraGraphEl = document.getElementById('bitacora-graph')!;
const bitacoraCloseBtn = document.getElementById('bitacora-close')!;
const workbenchModal = document.getElementById('workbench-modal')!;
const workbenchCloseBtn = document.getElementById('workbench-close')!;
const inventoryEl = document.getElementById('plaza-inventory')!;
const inventoryTextEl = document.getElementById('inventory-text')!;
const ohmPuzzleModal = document.getElementById('ohm-puzzle-modal')!;
const ohmPuzzleStatus = document.getElementById('ohm-puzzle-status')!;
const ohmPuzzleActions = document.getElementById('ohm-puzzle-actions')!;
const ohmPuzzleClose = document.getElementById('ohm-puzzle-close')!;

const btnGalv = document.getElementById('btn-galvanoscope')!;
const btnBitacora = document.getElementById('btn-bitacora')!;
const backBtn = document.getElementById('plaza-back')!;
const touchInteractBtn = document.getElementById('touch-interact')!;
const touchMoveButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-move-key]'));

let activeWorkbenchActionCb: ((act: string) => void) | null = null;
let toastTimeout: number | null = null;

const ui: PlazaUi = {
  setDialog(who, text, portrait, choices) {
    if (!text) {
      dialogEl.classList.add('hidden');
      return;
    }
    dialogEl.classList.remove('hidden');
    speakerEl.textContent = who ?? 'Desconocido';
    dialogTextEl.textContent = text;

    const pKey = who ? portraitKey(who) : '';
    const resolvedPortrait = portrait || (pKey && PORTRAIT_MAP[pKey] ? PORTRAIT_MAP[pKey] : '');

    if (resolvedPortrait) {
      portraitEl.src = resolvedPortrait;
      portraitEl.alt = who ? `Retrato de ${who}` : 'Retrato';
      portraitEl.parentElement?.classList.remove('hidden');
    } else {
      portraitEl.src = '';
      portraitEl.parentElement?.classList.add('hidden');
    }

    choicesEl.innerHTML = '';
    if (choices && choices.length > 0) {
      choicesEl.classList.remove('hidden');
      for (const c of choices) {
        const btn = document.createElement('button');
        btn.className = 'dialog-choice-btn';
        btn.textContent = c.label;
        btn.onclick = (e) => {
          e.stopPropagation();
          c.action();
        };
        choicesEl.appendChild(btn);
      }
    } else {
      choicesEl.classList.add('hidden');
    }
  },

  setCinematicOverlay(visible) {
    if (visible) {
      cinematicOverlayEl?.classList.remove('hidden');
    } else {
      cinematicOverlayEl?.classList.add('hidden');
    }
  },

  setPrompt(text) {
    if (!text) {
      promptEl.classList.add('hidden');
    } else {
      promptEl.textContent = text;
      promptEl.classList.remove('hidden');
    }
  },

  setCaption(_text) {},

  setGalvanoscopeHud(visible, v, r, i, status, probeA, probeB) {
    if (!visible) {
      galvHudEl.classList.add('hidden');
      return;
    }
    galvHudEl.classList.remove('hidden');
    galvVEl.textContent = `${v.toFixed(2)} V`;
    galvREl.textContent = r >= 999999 ? '∞ Ω' : `${r.toFixed(2)} Ω`;
    galvIEl.textContent = `${i.toFixed(2)} A`;
    galvStEl.textContent = status;
    probeAText.textContent = probeA ?? 'Desconectada';
    probeBText.textContent = probeB ?? 'Desconectada';
  },

  setBitacoraView(visible, manager?: BitacoraManager) {
    if (!visible || !manager) {
      bitacoraModal.classList.add('hidden');
      return;
    }
    bitacoraModal.classList.remove('hidden');
    renderBitacoraGraph(manager);
  },

  setWorkbenchView(visible, inspector?: WorkbenchInspector, onAction?: (action: string) => void) {
    if (!visible || !inspector) {
      workbenchModal.classList.add('hidden');
      return;
    }
    activeWorkbenchActionCb = onAction ?? null;
    workbenchModal.classList.remove('hidden');
    renderWorkbench(inspector);
  },
  setOhmPuzzleView(visible, _def?: CircuitDef, reading?: CircuitReading, covered?: ReadonlySet<string>, onAction?: (segment: string) => void) {
    if (!visible || !reading || !covered || !onAction) { ohmPuzzleModal.classList.add('hidden'); return; }
    ohmPuzzleModal.classList.remove('hidden'); ohmPuzzleStatus.textContent = reading.complete ? 'Continuidad cerrada · Ohm responde' : reading.state === 'tocando' ? 'Hay contacto, pero el camino sigue abierto.' : 'El camino está interrumpido.'; ohmPuzzleActions.innerHTML = '';
    for (const id of ['g1', 'g5', 'g4']) { const button = document.createElement('button'); button.className = 'workbench-btn'; button.textContent = `${covered.has(id) ? 'Retirar' : 'Tender'} cable ${id.toUpperCase()}`; button.onclick = () => onAction(id); ohmPuzzleActions.appendChild(button); }
  },

  setInventoryItem(name) {
    if (!name) {
      inventoryEl.classList.add('hidden');
    } else {
      inventoryEl.classList.remove('hidden');
      inventoryTextEl.textContent = name;
    }
  },

  showNotification(text) {
    toastEl.textContent = text;
    toastEl.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 4500);
  },
};

function renderBitacoraGraph(manager: BitacoraManager): void {
  bitacoraGraphEl.innerHTML = '';
  const entries = Object.values(manager.getRumors());

  for (const entry of entries) {
    const card = document.createElement('div');
    card.className = `bitacora-node-card status-${entry.status} cat-${entry.category}`;
    card.innerHTML = `
      <div class="node-badge">${entry.status === 'unknown' ? '🔒' : entry.status === 'rumor' ? '❓' : '⚡'}</div>
      <div class="node-info">
        <h4>${entry.status === 'unknown' ? '???' : entry.title}</h4>
        <small>${entry.category.toUpperCase()}</small>
      </div>
    `;

    card.onclick = () => {
      document.getElementById('node-title')!.textContent = entry.status === 'unknown' ? 'Rumor sin descubrir' : entry.title;
      document.getElementById('node-category')!.textContent = `Categoría: ${entry.category}`;
      document.getElementById('node-status-text')!.textContent = `Estado: ${entry.status === 'discovered' ? 'Descubierto / Confirmado' : entry.status === 'rumor' ? 'Rumor pendiente' : 'Bloqueado'}`;
      document.getElementById('node-lore-text')!.textContent = entry.status === 'unknown' ? 'Aún no has encontrado indicios sobre este fenómeno en Ohmdal.' : entry.description;
    };

    bitacoraGraphEl.appendChild(card);
  }
}

function renderWorkbench(inspector: WorkbenchInspector): void {
  const target = inspector.getTarget();
  if (!target) return;
  const state = inspector.getState();

  document.getElementById('workbench-title')!.textContent = target === 'cuadro_rele' ? 'Relé de la Campana' : 'Mural del Esquema';
  document.getElementById('workbench-desc')!.textContent =
    target === 'cuadro_rele'
      ? 'Interruptor electromagnético con cuchilla de latón y bobina de retención.'
      : 'Esquema de circuito grabado en piedra hace 40 años.';

  const visualEl = document.getElementById('workbench-visual')!;
  visualEl.innerHTML = `
    <div class="relic-display-box">
      <div class="relic-icon-large">${target === 'cuadro_rele' ? '⚡ 🪓' : '📜 🏛️'}</div>
      <div class="relic-status-badge">Cuchilla: ${state.knifeSwitchClosed ? '✅ CERRADA' : '⚠️ ABIERTA'}</div>
    </div>
  `;

  const actionsEl = document.getElementById('workbench-actions')!;
  actionsEl.innerHTML = '';

  if (target === 'cuadro_rele') {
    const btn = document.createElement('button');
    btn.className = 'workbench-btn';
    btn.textContent = state.knifeSwitchClosed ? 'Abrir Cuchilla de Contacto' : 'Cerrar Cuchilla de Contacto';
    btn.onclick = () => {
      if (activeWorkbenchActionCb) {
        activeWorkbenchActionCb('knife_switch');
        renderWorkbench(inspector);
      }
    };
    actionsEl.appendChild(btn);
  }
}

// Start Runtime
let handle: ReturnType<typeof mountPlayCanvasOhmdal> | null = null;

enterBtn.addEventListener('click', () => {
  titleEl.classList.add('hidden');
  hudEl.classList.remove('hidden');
  (document.activeElement as HTMLElement)?.blur();
  backBtn.tabIndex = -1;
  handle = mountPlayCanvasOhmdal(gameEl, ui);
});

btnGalv.addEventListener('click', () => {
  handle?.press('m');
});

btnBitacora.addEventListener('click', () => {
  handle?.press('tab');
});

// Click / tap on dialog card advances when no choices are active
dialogCardEl?.addEventListener('click', (e) => {
  if (choicesEl && !choicesEl.classList.contains('hidden') && choicesEl.children.length > 0) {
    return;
  }
  e.stopPropagation();
  handle?.press('e');
});

dialogCardEl?.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
});

skipCinematicBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  handle?.press(' ');
});

const activeTurnIntervals = new Map<number, number>();

for (const button of touchMoveButtons) {
  const key = button.dataset.moveKey!;
  button.addEventListener('contextmenu', (event) => event.preventDefault());
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (key === 'q' || key === 'r') {
      handle?.press(key);
      const interval = window.setInterval(() => handle?.press(key), 55);
      activeTurnIntervals.set(event.pointerId, interval);
      return;
    }
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  });

  const release = (event: PointerEvent) => {
    const interval = activeTurnIntervals.get(event.pointerId);
    if (interval !== undefined) {
      window.clearInterval(interval);
      activeTurnIntervals.delete(event.pointerId);
    }
    if (key !== 'q' && key !== 'r') {
      window.dispatchEvent(new KeyboardEvent('keyup', { key }));
    }
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
}

touchInteractBtn.addEventListener('click', () => {
  handle?.press('e');
});
ohmPuzzleClose.addEventListener('click', () => handle?.press('ohm-puzzle-close'));

bitacoraCloseBtn.addEventListener('click', () => {
  ui.setBitacoraView(false);
});

workbenchCloseBtn.addEventListener('click', () => {
  activeWorkbenchActionCb?.('close');
});

backBtn.addEventListener('click', () => {
  window.location.href = '/';
});
