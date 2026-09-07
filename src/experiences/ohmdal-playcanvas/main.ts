import { mountPlayCanvasOhmdal } from './playcanvasRuntime.ts';
import type { PlazaUi } from '../ohmdal-plaza/plazaRuntime.ts';
import type { BitacoraManager } from '../ohmdal-plaza/journal/bitacora.ts';
import type { WorkbenchInspector } from '../ohmdal-plaza/inspect/workbench.ts';
import type { OhmContinuityPuzzle } from './systems/puzzles/ohmContinuityPuzzle.ts';
import { ARC1_SAVE_STORAGE_KEY, readArc1Save } from './systems/campaign/arc1Save.ts';
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
const newGameBtn = document.getElementById('plaza-new-game')!;
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

const INTRO_SEEN_KEY = 'ohmdal_intro_seen';
const campaignStorage = {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
};

function hasResumableCampaign(): boolean {
  return readArc1Save(campaignStorage, ARC1_SAVE_STORAGE_KEY) !== null;
}

function updateEntryActions(): void {
  const resumable = hasResumableCampaign();
  enterBtn.textContent = resumable ? 'Continuar campaña' : 'Entrar a Ohmdal';
  newGameBtn.hidden = !resumable;
}

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
    bars.forEach((bar, index) => bar.classList.toggle('active', index < snapshot.supplyLeft));
  }

  if (ohmStatusBanner) ohmStatusBanner.className = `ohm-status-banner status-${snapshot.state}`;
  if (ohmStatusIcon) {
    ohmStatusIcon.textContent = snapshot.state === 'cerrado' ? '🟢' : snapshot.state === 'tocando' ? '🟡' : '⚪';
  }
  if (ohmStatusText) {
    ohmStatusText.textContent = snapshot.state === 'cerrado'
      ? '¡Circuito cerrado! El camino continuo vuelve entre la fuente y el núcleo de Ohm.'
      : snapshot.state === 'tocando'
        ? 'Contacto parcial: hay tensión en algunos bornes, pero el camino no regresa a la fuente.'
        : 'Circuito abierto: la fuente zumba, pero no hay continuidad hacia Ohm.';
  }

  ohmCoreLamp?.classList.toggle('energized', snapshot.energizedNodes.includes('OHM'));

  const energizedNodes = new Set(snapshot.energizedNodes);
  document.getElementById('ohm-wire-feed-in')?.classList.toggle('energized', energizedNodes.has('FUENTE_MAS'));
  document.getElementById('ohm-wire-feed-out')?.classList.toggle('energized', energizedNodes.has('CRUCE_ALTO'));
  document.getElementById('ohm-wire-core-out')?.classList.toggle('energized', energizedNodes.has('OHM'));
  document.getElementById('ohm-wire-shortcut-in')?.classList.toggle('energized', energizedNodes.has('NUDO'));
  document.getElementById('ohm-wire-shortcut-out')?.classList.toggle('energized', energizedNodes.has('OESTE_ALTO'));
  document.getElementById('ohm-wire-long-in')?.classList.toggle('energized', energizedNodes.has('NUDO'));
  document.getElementById('ohm-wire-long-mid')?.classList.toggle('energized', energizedNodes.has('ABAJO_MEDIO'));
  document.getElementById('ohm-wire-long-out')?.classList.toggle('energized', energizedNodes.has('ABAJO_OESTE'));

  for (const gap of snapshot.gaps) {
    const button = document.getElementById(`ohm-gap-${gap.id}`);
    const indicator = button?.querySelector('.btn-indicator');
    button?.classList.toggle('covered', gap.covered);
    button?.classList.toggle('broken', Boolean(gap.broken));
    if (indicator) indicator.textContent = gap.broken ? '✕' : gap.covered ? '✓' : '○';

    const svgRect = document.getElementById(`ohm-svg-rect-${gap.id}`);
    const svgText = document.getElementById(`ohm-svg-text-${gap.id}`);
    svgRect?.classList.toggle('covered', gap.covered);
    svgRect?.classList.toggle('broken', Boolean(gap.broken));
    if (svgRect) {
      svgRect.setAttribute('fill', gap.broken ? '#2d1612' : gap.covered ? '#d47a32' : '#18120e');
      svgRect.setAttribute('stroke', gap.broken ? '#883322' : gap.covered ? '#ffae62' : '#5a402d');
    }
    svgText?.setAttribute('fill', gap.covered ? '#fff' : gap.broken ? '#e07766' : '#c8b6a2');
  }
}

// Start Runtime
let handle: ReturnType<typeof mountPlayCanvasOhmdal> | null = null;

updateEntryActions();

enterBtn.addEventListener('click', () => {
  if (handle) return;
  titleEl.classList.add('hidden');
  hudEl.classList.remove('hidden');
  (document.activeElement as HTMLElement)?.blur();
  backBtn.tabIndex = -1;
  handle = mountPlayCanvasOhmdal(gameEl, ui);
});

newGameBtn.addEventListener('click', () => {
  if (!hasResumableCampaign()) return;
  if (!window.confirm('¿Borrar la campaña de Ohmdal y comenzar una nueva partida?')) return;
  try {
    localStorage.removeItem(ARC1_SAVE_STORAGE_KEY);
    localStorage.removeItem(INTRO_SEEN_KEY);
  } catch {
    // Private browsing/storage restrictions leave the existing campaign intact.
    return;
  }
  updateEntryActions();
  window.location.reload();
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
const activeTouchKeys = new Map<number, string>();
const touchControlCleanups: Array<() => void> = [];

function registerTouchListener<E extends Event>(
  target: EventTarget,
  type: string,
  listener: (event: E) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const eventListener = listener as EventListener;
  target.addEventListener(type, eventListener, options);
  touchControlCleanups.push(() => target.removeEventListener(type, eventListener, options));
}

function dispatchTouchKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  }));
}

function releaseTouchPointer(pointerId: number): void {
  const key = activeTouchKeys.get(pointerId);
  if (!key) return;

  const interval = activeTurnIntervals.get(pointerId);
  if (interval !== undefined) {
    window.clearInterval(interval);
    activeTurnIntervals.delete(pointerId);
  }
  activeTouchKeys.delete(pointerId);

  if (key !== 'q' && key !== 'r') {
    window.dispatchEvent(new KeyboardEvent('keyup', { key }));
  }
}

function releaseAllTouchPointers(): void {
  for (const pointerId of [...activeTouchKeys.keys()]) {
    releaseTouchPointer(pointerId);
  }
}

function releaseTurnPointers(): void {
  for (const [pointerId, key] of [...activeTouchKeys.entries()]) {
    if (key === 'q' || key === 'r') releaseTouchPointer(pointerId);
  }
}

function cleanupTouchControls(): void {
  releaseAllTouchPointers();
  while (touchControlCleanups.length > 0) {
    touchControlCleanups.pop()?.();
  }
}

for (const button of touchMoveButtons) {
  const key = button.dataset.moveKey!;
  registerTouchListener<MouseEvent>(button, 'contextmenu', (event) => event.preventDefault());
  registerTouchListener<PointerEvent>(button, 'pointerdown', (event) => {
    event.preventDefault();
    releaseTouchPointer(event.pointerId);
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable in a few embedded WebViews; the
      // window-level release listeners below still prevent stuck timers.
    }
    activeTouchKeys.set(event.pointerId, key);
    if (key === 'q' || key === 'r') {
      dispatchTouchKey(key);
      const interval = window.setInterval(() => dispatchTouchKey(key), 55);
      activeTurnIntervals.set(event.pointerId, interval);
      return;
    }
    dispatchTouchKey(key);
  });

  const release = (event: PointerEvent) => releaseTouchPointer(event.pointerId);
  registerTouchListener<PointerEvent>(button, 'pointerup', release);
  registerTouchListener<PointerEvent>(button, 'pointercancel', release);
  registerTouchListener<PointerEvent>(button, 'lostpointercapture', release);
}

// A second finger can hold movement while a first finger turns. Touching a
// modal, canvas action, or another non-control surface cancels only the turn
// timer so it cannot keep rotating after the UI has changed mode.
registerTouchListener<PointerEvent>(document, 'pointerdown', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('[data-move-key]')) return;
  releaseTurnPointers();
}, true);

const releaseWindowPointer = (event: PointerEvent): void => {
  releaseTouchPointer(event.pointerId);
};
registerTouchListener<PointerEvent>(window, 'pointerup', releaseWindowPointer);
registerTouchListener<PointerEvent>(window, 'pointercancel', releaseWindowPointer);

registerTouchListener<FocusEvent>(window, 'blur', releaseAllTouchPointers);
registerTouchListener<Event>(window, 'ohmdal:release-controls', releaseAllTouchPointers);
registerTouchListener<Event>(document, 'visibilitychange', () => {
  if (document.visibilityState !== 'visible') releaseAllTouchPointers();
});
registerTouchListener<Event>(window, 'orientationchange', releaseAllTouchPointers);
registerTouchListener<Event>(window, 'resize', releaseAllTouchPointers);

registerTouchListener<MouseEvent>(touchInteractBtn, 'click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  releaseAllTouchPointers();
  handle?.press('e');
});

// A browser may omit click for a second finger while movement is held.
// Activate these HUD buttons on touch/pen release and consume the later
// compatibility click, while retaining the normal keyboard/mouse listeners.
let pendingTouchActionClick: { x: number; y: number; until: number } | null = null;
registerTouchListener<PointerEvent>(window, 'pointerdown', () => {
  // A new physical contact is a new action, even at the same coordinates.
  pendingTouchActionClick = null;
}, true);
registerTouchListener<MouseEvent>(window, 'click', (event) => {
  const pending = pendingTouchActionClick;
  if (!pending || event.detail === 0 || performance.now() > pending.until) return;
  if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 12) return;
  pendingTouchActionClick = null;
  // Opening an overlay can retarget this click to a newly revealed control,
  // so suppression must happen above both the original button and the panel.
  event.preventDefault(); event.stopImmediatePropagation();
}, true);
function bindMultitouchAction(button: HTMLElement, action: () => void): void {
  let suppressClickUntil = 0;
  const contacts = new Set<number>();
  registerTouchListener<PointerEvent>(button, 'pointerdown', (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      suppressClickUntil = 0;
      return;
    }
    event.preventDefault();
    contacts.add(event.pointerId);
    try { button.setPointerCapture(event.pointerId); } catch { /* global releases remain available */ }
  });
  registerTouchListener<PointerEvent>(button, 'pointerup', (event) => {
    if (!contacts.delete(event.pointerId)) return;
    event.preventDefault(); event.stopPropagation();
    suppressClickUntil = performance.now() + 700;
    const bounds = button.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    pendingTouchActionClick = { x: event.clientX, y: event.clientY, until: suppressClickUntil };
    releaseAllTouchPointers(); action();
  });
  registerTouchListener<PointerEvent>(button, 'pointercancel', (event) => contacts.delete(event.pointerId));
  registerTouchListener<PointerEvent>(button, 'lostpointercapture', (event) => contacts.delete(event.pointerId));
  registerTouchListener<MouseEvent>(button, 'click', (event) => {
    if (performance.now() >= suppressClickUntil || event.detail === 0) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
}
bindMultitouchAction(btnBitacora, () => handle?.press('tab'));
bindMultitouchAction(btnGalv, () => handle?.press('m'));
bindMultitouchAction(touchInteractBtn, () => handle?.press('e'));

bitacoraCloseBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  handle?.press('tab');
});

workbenchCloseBtn.addEventListener('click', () => {
  activeWorkbenchActionCb?.('close');
});

if (ohmInspectionCloseBtn) {
  registerTouchListener<MouseEvent>(ohmInspectionCloseBtn, 'click', (event) => {
    event.stopPropagation();
    activeOhmCloseCb?.();
  });
}

if (ohmResetBtn) {
  registerTouchListener<MouseEvent>(ohmResetBtn, 'click', (event) => {
    event.stopPropagation();
    activeOhmResetCb?.();
  });
}

for (const gapId of ['g1', 'g2', 'g3', 'g4', 'g5'] as const) {
  const button = document.getElementById(`ohm-gap-${gapId}`);
  if (button) {
    registerTouchListener<MouseEvent>(button, 'click', (event) => {
      event.stopPropagation();
      activeOhmToggleGapCb?.(gapId);
    });
  }
  const svgGroup = document.getElementById(`ohm-svg-gap-${gapId}`);
  if (svgGroup) {
    registerTouchListener<MouseEvent>(svgGroup, 'click', (event) => {
      event.stopPropagation();
      activeOhmToggleGapCb?.(gapId);
    });
  }
}

backBtn.addEventListener('click', () => {
  cleanupTouchControls();
  handle?.destroy();
  handle = null;
  window.location.href = '/';
});
