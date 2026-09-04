import { mountPlayCanvasOhmdal } from './playcanvasRuntime.ts';
import type { PlazaUi } from '../ohmdal-plaza/plazaRuntime.ts';
import type { BitacoraManager } from '../ohmdal-plaza/journal/bitacora.ts';
import type { WorkbenchInspector } from '../ohmdal-plaza/inspect/workbench.ts';
import type { OhmContinuityPuzzle } from './systems/puzzles/ohmContinuityPuzzle.ts';
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
const ohmInspectionModal = document.getElementById('ohm-inspection-modal');
const ohmInspectionCloseBtn = document.getElementById('ohm-inspection-close');
const ohmResetBtn = document.getElementById('ohm-reset-btn');
const ohmSupplyCount = document.getElementById('ohm-supply-count');
const ohmSupplyBars = document.getElementById('ohm-supply-bars');
const ohmStatusBanner = document.getElementById('ohm-status-banner');
const ohmStatusIcon = document.getElementById('ohm-status-icon');
const ohmStatusText = document.getElementById('ohm-status-text');
const ohmCoreLamp = document.getElementById('ohm-core-lamp');
const inventoryEl = document.getElementById('plaza-inventory')!;
const inventoryTextEl = document.getElementById('inventory-text')!;

const btnGalv = document.getElementById('btn-galvanoscope')!;
const btnBitacora = document.getElementById('btn-bitacora')!;
const backBtn = document.getElementById('plaza-back')!;
const touchInteractBtn = document.getElementById('touch-interact')!;
const touchMoveButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-move-key]'));

let activeWorkbenchActionCb: ((act: string) => void) | null = null;
let activeOhmToggleGapCb: ((gapId: string) => void) | null = null;
let activeOhmResetCb: (() => void) | null = null;
let activeOhmCloseCb: (() => void) | null = null;
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

  setOhmInspectionView(visible, puzzle, onToggleGap, onReset, onClose) {
    if (!visible || !puzzle) {
      ohmInspectionModal?.classList.add('hidden');
      activeOhmToggleGapCb = null;
      activeOhmResetCb = null;
      activeOhmCloseCb = null;
      return;
    }
    activeOhmToggleGapCb = onToggleGap ?? null;
    activeOhmResetCb = onReset ?? null;
    activeOhmCloseCb = onClose ?? null;
    ohmInspectionModal?.classList.remove('hidden');
    renderOhmInspection(puzzle as OhmContinuityPuzzle);
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

function renderOhmInspection(puzzle: OhmContinuityPuzzle): void {
  const snapshot = puzzle.getSnapshot();

  if (ohmSupplyCount) {
    ohmSupplyCount.textContent = `${snapshot.supplyLeft} / ${snapshot.supplyTotal}`;
  }
  if (ohmSupplyBars) {
    const bars = Array.from(ohmSupplyBars.querySelectorAll<HTMLElement>('.supply-bar'));
    bars.forEach((bar, idx) => {
      if (idx < snapshot.supplyLeft) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
  }

  if (ohmStatusBanner) {
    ohmStatusBanner.className = `ohm-status-banner status-${snapshot.state}`;
  }
  if (ohmStatusIcon) {
    ohmStatusIcon.textContent = snapshot.state === 'cerrado' ? '🟢' : snapshot.state === 'tocando' ? '🟡' : '⚪';
  }
  if (ohmStatusText) {
    ohmStatusText.textContent =
      snapshot.state === 'cerrado'
        ? '¡Circuito cerrado! Camino continuo restablecido entre la fuente y el núcleo de Ohm.'
        : snapshot.state === 'tocando'
          ? 'Contacto parcial: Hay tensión en los bornes, pero el camino no regresa a la fuente (tocar no es unir).'
          : 'Circuito abierto: La fuente zumba pero no hay continuidad hacia Ohm.';
  }

  if (ohmCoreLamp) {
    if (snapshot.complete || snapshot.energizedNodes.includes('OHM')) {
      ohmCoreLamp.classList.add('energized');
    } else {
      ohmCoreLamp.classList.remove('energized');
    }
  }

  const wireFeedIn = document.getElementById('ohm-wire-feed-in');
  const wireFeedOut = document.getElementById('ohm-wire-feed-out');
  const wireCoreOut = document.getElementById('ohm-wire-core-out');
  const wireShortcutIn = document.getElementById('ohm-wire-shortcut-in');
  const wireShortcutOut = document.getElementById('ohm-wire-shortcut-out');
  const wireLongIn = document.getElementById('ohm-wire-long-in');
  const wireLongMid = document.getElementById('ohm-wire-long-mid');
  const wireLongOut = document.getElementById('ohm-wire-long-out');

  wireFeedIn?.classList.toggle('energized', snapshot.energizedNodes.includes('FUENTE_MAS'));
  wireFeedOut?.classList.toggle('energized', snapshot.energizedNodes.includes('CRUCE_ALTO'));
  wireCoreOut?.classList.toggle('energized', snapshot.energizedNodes.includes('OHM'));
  wireShortcutIn?.classList.toggle('energized', snapshot.energizedNodes.includes('NUDO'));
  wireShortcutOut?.classList.toggle('energized', snapshot.energizedNodes.includes('OESTE_ALTO'));
  wireLongIn?.classList.toggle('energized', snapshot.energizedNodes.includes('NUDO'));
  wireLongMid?.classList.toggle('energized', snapshot.energizedNodes.includes('ABAJO_MEDIO'));
  wireLongOut?.classList.toggle('energized', snapshot.energizedNodes.includes('ABAJO_OESTE'));

  for (const gap of snapshot.gaps) {
    const btn = document.getElementById(`ohm-gap-${gap.id}`);
    const svgRect = document.getElementById(`ohm-svg-rect-${gap.id}`);
    const svgText = document.getElementById(`ohm-svg-text-${gap.id}`);

    if (btn) {
      const indicator = btn.querySelector('.btn-indicator');
      if (gap.broken) {
        btn.classList.add('broken');
        if (indicator) indicator.textContent = '✕';
      } else if (gap.covered) {
        btn.classList.add('covered');
        if (indicator) indicator.textContent = '✓';
      } else {
        btn.classList.remove('covered');
        if (indicator) indicator.textContent = '○';
      }
    }

    if (svgRect) {
      if (gap.broken) {
        svgRect.setAttribute('fill', '#2d1612');
        svgRect.setAttribute('stroke', '#883322');
      } else if (gap.covered) {
        svgRect.setAttribute('fill', '#d47a32');
        svgRect.setAttribute('stroke', '#ffae62');
      } else {
        svgRect.setAttribute('fill', '#18120e');
        svgRect.setAttribute('stroke', '#5a402d');
      }
    }

    if (svgText) {
      if (gap.covered) {
        svgText.setAttribute('fill', '#fff');
      } else if (gap.broken) {
        svgText.setAttribute('fill', '#e07766');
      } else {
        svgText.setAttribute('fill', '#c8b6a2');
      }
    }
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

bitacoraCloseBtn.addEventListener('click', () => {
  ui.setBitacoraView(false);
});

workbenchCloseBtn.addEventListener('click', () => {
  activeWorkbenchActionCb?.('close');
});

ohmInspectionCloseBtn?.addEventListener('click', () => {
  activeOhmCloseCb?.();
});

ohmResetBtn?.addEventListener('click', () => {
  activeOhmResetCb?.();
});

const gapIds = ['g1', 'g2', 'g3', 'g4', 'g5'] as const;
for (const gapId of gapIds) {
  const btn = document.getElementById(`ohm-gap-${gapId}`);
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    activeOhmToggleGapCb?.(gapId);
  });
  const svgGroup = document.getElementById(`ohm-svg-gap-${gapId}`);
  svgGroup?.addEventListener('click', (e) => {
    e.stopPropagation();
    activeOhmToggleGapCb?.(gapId);
  });
}

backBtn.addEventListener('click', () => {
  window.location.href = '/';
});

