import './styles.css';
import { mountPlaza, type PlazaHandle, type PlazaUi } from './plazaRuntime.ts';
import type { BitacoraManager } from './journal/bitacora.ts';
import type { WorkbenchInspector } from './inspect/workbench.ts';

// DOM Elements
const gameEl = document.getElementById('plaza-game')!;
const titleEl = document.getElementById('plaza-title')!;
const hudEl = document.getElementById('plaza-hud')!;
const enterBtn = document.getElementById('plaza-enter') as HTMLButtonElement;
const backBtn = document.getElementById('plaza-back') as HTMLButtonElement;
const promptEl = document.getElementById('plaza-prompt')!;
const toastEl = document.getElementById('plaza-toast')!;
const inventoryEl = document.getElementById('plaza-inventory')!;
const inventoryTextEl = document.getElementById('inventory-text')!;

// Dialogue Elements
const dialogEl = document.getElementById('plaza-dialog')!;
const dialogWhoEl = document.getElementById('plaza-dialog-who')!;
const dialogTextEl = document.getElementById('plaza-dialog-text')!;
const dialogAvatarEl = document.getElementById('plaza-dialog-avatar')!;
const dialogChoicesEl = document.getElementById('plaza-dialog-choices')!;

// Tool Overlays & Buttons
const btnGalvano = document.getElementById('btn-galvanoscope') as HTMLButtonElement;
const btnBitacora = document.getElementById('btn-bitacora') as HTMLButtonElement;
const btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
const galvanoOverlay = document.getElementById('galvanoscope-overlay')!;
const btnCloseGalvano = document.getElementById('btn-close-galvano') as HTMLButtonElement;
const btnResetProbes = document.getElementById('btn-reset-probes') as HTMLButtonElement;
const gaugeNeedle = document.getElementById('gauge-needle')!;
const readoutV = document.getElementById('readout-voltage')!;
const readoutR = document.getElementById('readout-resistance')!;
const readoutI = document.getElementById('readout-current')!;
const probeAName = document.getElementById('probe-a-name')!;
const probeBName = document.getElementById('probe-b-name')!;
const galvanoDiagnostic = document.getElementById('galvano-diagnostic')!;

// Bitácora Modal
const bitacoraModal = document.getElementById('bitacora-modal')!;
const btnCloseBitacora = document.getElementById('btn-close-bitacora') as HTMLButtonElement;
const bitacoraGraph = document.getElementById('bitacora-graph')!;
const bitacoraProgressText = document.getElementById('bitacora-progress-text')!;

// Workbench Modal
const workbenchModal = document.getElementById('workbench-modal')!;
const btnCloseWorkbench = document.getElementById('btn-close-workbench') as HTMLButtonElement;
const workbenchTitle = document.getElementById('workbench-title')!;
const workbenchContent = document.getElementById('workbench-content')!;

let handle: PlazaHandle | null = null;
let started = false;
let toastTimeout: number | null = null;

const ui: PlazaUi = {
  setDialog(who, text, _portrait, choices) {
    if (!who || !text) {
      dialogEl.classList.add('hidden');
      return;
    }
    dialogWhoEl.textContent = who;
    dialogTextEl.textContent = text;

    // Avatar icon
    if (who === 'Ohm') dialogAvatarEl.textContent = '🤖';
    else if (who === 'Edda') dialogAvatarEl.textContent = '📜';
    else if (who === 'Lumen') dialogAvatarEl.textContent = '🔨';
    else if (who === 'Estudiante') dialogAvatarEl.textContent = '🎓';
    else dialogAvatarEl.textContent = '👤';

    // Choices
    dialogChoicesEl.replaceChildren();
    if (choices && choices.length > 0) {
      dialogChoicesEl.classList.remove('hidden');
      for (const choice of choices) {
        const btn = document.createElement('button');
        btn.className = 'dialog-choice-btn';
        btn.textContent = `▸ ${choice.label}`;
        btn.onclick = (e) => {
          e.stopPropagation();
          choice.action();
        };
        dialogChoicesEl.appendChild(btn);
      }
    } else {
      dialogChoicesEl.classList.add('hidden');
    }

    dialogEl.classList.remove('hidden');
  },

  setPrompt(text) {
    if (!text) {
      promptEl.classList.add('hidden');
      return;
    }
    promptEl.textContent = text;
    promptEl.classList.remove('hidden');
  },

  setCaption(text) {
    if (text) this.showNotification(text);
  },

  setGalvanoscopeHud(visible, v, r, i, status, probeA, probeB) {
    if (!visible) {
      galvanoOverlay.classList.add('hidden');
      return;
    }
    galvanoOverlay.classList.remove('hidden');

    readoutV.textContent = `${v.toFixed(1)} V`;
    readoutR.textContent = r > 99999 ? '∞ Ω' : `${r < 10 ? r.toFixed(2) : Math.round(r)} Ω`;
    readoutI.textContent = `${i.toFixed(2)} A`;
    probeAName.textContent = probeA ?? 'Ninguna';
    probeBName.textContent = probeB ?? 'Ninguna';
    galvanoDiagnostic.textContent = status;

    // Needle rotation (-60deg at 0V to +60deg at 30V)
    const angle = -60 + Math.min(v / 30, 1.0) * 120;
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
  },

  setBitacoraView(visible, manager?: BitacoraManager) {
    if (!visible || !manager) {
      bitacoraModal.classList.add('hidden');
      return;
    }

    const progress = manager.getProgress();
    bitacoraProgressText.textContent = `Progreso: ${progress.discovered} / ${progress.total} misterios comprendidos (${progress.percentage}%)`;

    bitacoraGraph.replaceChildren();
    for (const rumor of Object.values(manager.getRumors())) {
      if (rumor.status === 'unknown') continue;

      const card = document.createElement('div');
      card.className = `rumor-card status-${rumor.status}`;

      const header = document.createElement('div');
      header.className = 'rumor-card-header';
      header.innerHTML = `<span>${rumor.icon}</span> <span>${rumor.title}</span>`;
      card.appendChild(header);

      const body = document.createElement('div');
      body.className = 'rumor-card-body';
      body.innerHTML = `
        <div class="superstition-quote">${rumor.superstition}</div>
        <div class="truth-fact">${rumor.status === 'discovered' ? `<b>Verdad Física:</b> ${rumor.physicalTruth}` : rumor.description}</div>
      `;
      card.appendChild(body);

      bitacoraGraph.appendChild(card);
    }

    bitacoraModal.classList.remove('hidden');
  },

  setWorkbenchView(visible, inspector?: WorkbenchInspector, onAction?: (action: string) => void) {
    if (!visible || !inspector) {
      workbenchModal.classList.add('hidden');
      return;
    }

    const target = inspector.getTarget();
    const state = inspector.getState();
    workbenchContent.replaceChildren();

    if (target === 'cuadro_rele') {
      workbenchTitle.textContent = 'RELÉ DE ENCLAVAMIENTO DE LA CAMPANA';
      const card = document.createElement('div');
      card.className = 'workbench-card';
      card.innerHTML = `
        <p>Interruptor de cuchilla de bronce conectado a la bobina electromagnética de 12 ohmios.</p>
        <p>Estado actual: <b>${state.knifeSwitchClosed ? 'CERRADO (Conduciendo)' : 'ABIERTO (Desconectado)'}</b></p>
        <div class="workbench-actions-row">
          <button id="btn-toggle-switch" class="btn-tool-action">
            ${state.knifeSwitchClosed ? 'Abrir Interruptor' : 'Cerrar Interruptor de Cuchilla'}
          </button>
        </div>
      `;
      workbenchContent.appendChild(card);

      const switchBtn = card.querySelector('#btn-toggle-switch') as HTMLButtonElement;
      switchBtn.onclick = () => {
        onAction?.('knife_switch');
        ui.setWorkbenchView(true, inspector, onAction);
      };
    } else if (target === 'mural_esquema') {
      workbenchTitle.textContent = 'MURAL DE LOS CUARENTA AÑOS';
      const card = document.createElement('div');
      card.className = 'workbench-card';
      card.innerHTML = `
        <p>Un grabado milenario muestra la topología eléctrica de Ohmdal:</p>
        <div style="background:#241c16; padding:1rem; border-left:3px solid var(--pl-copper); font-family:monospace; margin:1rem 0;">
          [ +24V Portal ] ───(Riel Ida)───► [ Bomba Fuente: 8Ω ] ───► (Riel Retorno)<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
          [ 0V Tierra   ] ◄───(Retorno Limpio)◄───[ Barra Puente ]◄───┘
        </div>
        <p style="color:var(--pl-amber); font-style:italic;">«Donde el lazo se corta, la fuerza se extingue. Donde el óxido se limpia, la vida fluye.»</p>
      `;
      workbenchContent.appendChild(card);
    }

    workbenchModal.classList.remove('hidden');
  },
  setOhmPuzzleView() {},

  setInventoryItem(name) {
    if (!name) {
      inventoryEl.classList.add('hidden');
      return;
    }
    inventoryTextEl.textContent = name;
    inventoryEl.classList.remove('hidden');
  },

  showNotification(text) {
    if (toastTimeout) window.clearTimeout(toastTimeout);
    toastEl.textContent = text;
    toastEl.classList.remove('hidden');
    toastTimeout = window.setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 3200);
  },
};

function start(): void {
  if (started) return;
  started = true;
  titleEl.classList.add('hidden');
  hudEl.classList.remove('hidden');
  handle = mountPlaza(gameEl, ui);
}

enterBtn.addEventListener('click', () => {
  start();
});

backBtn.addEventListener('click', () => {
  handle?.destroy();
  handle = null;
  window.location.href = '/';
});

btnMute.addEventListener('click', () => {
  btnMute.textContent = btnMute.textContent === '🔊' ? '🔇' : '🔊';
});

btnGalvano.addEventListener('click', () => {
  handle?.press('m');
});

btnBitacora.addEventListener('click', () => {
  handle?.press('Tab');
});

btnCloseGalvano.addEventListener('click', () => {
  handle?.press('m');
});

btnResetProbes.addEventListener('click', () => {
  handle?.press('m');
  window.setTimeout(() => handle?.press('m'), 50);
});

btnCloseBitacora.addEventListener('click', () => {
  handle?.press('Tab');
});

btnCloseWorkbench.addEventListener('click', () => {
  ui.setWorkbenchView(false);
});

dialogEl.addEventListener('click', () => {
  handle?.press('e');
});

// Auto start if ?auto URL param is present
if (import.meta.env.DEV && new URLSearchParams(location.search).has('auto')) {
  start();
}
