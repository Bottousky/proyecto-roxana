import { el, pushUI, popUI } from './overlay';
import { sfxBlip, sfxToast, playVoiceLine, stopVoiceLine, type VoiceLineId } from '../audio';
import { portraitKey } from './portrait.ts';
import { touchControlsEnabled } from './inputMode.ts';

export interface Line {
  who: string;
  text: string;
  /**
   * Si está definido, se reproduce esta línea de voz al entrar a la línea.
   * El texto y la voz pueden divergir ligeramente; está aceptado como
   * estilización, no como error.
   */
  voiceId?: VoiceLineId;
}

export function L(who: string, text: string, voiceId?: VoiceLineId): Line {
  return { who, text, voiceId };
}

let queue: Line[] = [];
let idx = 0;
let endCb: (() => void) | null = null;
let active = false;
let lastAdvance = 0;

// Retratos de alta calidad generados para el proyecto. Cuando la IA pinta un retrato
// expresamente, gana el de `generated/portraits/`; los legacy de la master siguen
// disponibles como fallback para personajes sin retrato dedicado.
const PORTRAITS: Record<string, string> = {
  student: new URL('../../assets/ohmdal/generated/portraits/student-portrait.png', import.meta.url).href,
  edda: new URL('../../assets/ohmdal/generated/portraits/edda-portrait.png', import.meta.url).href,
  lumen: new URL('../../assets/ohmdal/generated/portraits/lumen-portrait.png', import.meta.url).href,
  preceptor: new URL('../../assets/ohmdal/generated/portraits/preceptor-portrait.png', import.meta.url).href,
  consejera: new URL('../../assets/ohmdal/generated/portraits/consejera-portrait.png', import.meta.url).href,
  guardiana: new URL('../../assets/ohmdal/generated/portraits/guardiana-portrait.png', import.meta.url).href,
  yesca: new URL('../../assets/ohmdal/generated/portraits/yesca-portrait.png', import.meta.url).href,
  farero: new URL('../../assets/ohmdal/generated/portraits/farero-portrait.png', import.meta.url).href,
  ohm: new URL('../../assets/ohmdal/generated/portraits/ohm-portrait.png', import.meta.url).href,
  nino: new URL('../../assets/ohmdal/generated/portraits/nino-portrait.png', import.meta.url).href,
  proyector: new URL('../../assets/ohmdal/portraits/proyector.png', import.meta.url).href,
  ciudadano: new URL('../../assets/ohmdal/portraits/ciudadano.png', import.meta.url).href,
};

function render(): void {
  sfxBlip();
  const line = queue[idx];
  el('dialog-who').textContent = line.who;
  el('dialog-who').style.display = line.who ? 'block' : 'none';
  el('dialog-text').textContent = line.text;
  const portrait = el('dialog-portrait');
  const key = portraitKey(line.who);
  portrait.className = key ? `portrait-${key}` : 'portrait-narrator';
  portrait.setAttribute('aria-label', line.who || 'Narración');
  const image = el('dialog-portrait-image') as HTMLImageElement;
  image.src = key ? PORTRAITS[key] : '';
  image.alt = key ? `Retrato de ${line.who}` : '';
  // Los retratos de alta calidad no se renderizan pixelados: son ilustraciones a 1K.
  if (key) {
    image.style.imageRendering = 'auto';
  } else {
    image.style.imageRendering = 'pixelated';
  }
  // Voz: si la línea trae un `voiceId`, lo reproducimos. La voz no bloquea
  // el texto: el jugador puede avanzar cuando quiera, y la voz termina sola.
  if (line.voiceId) {
    playVoiceLine(line.voiceId);
  } else {
    stopVoiceLine();
  }
}

function closeDialog(): void {
  active = false;
  el('dialog').classList.add('hidden');
  stopVoiceLine();
  popUI();
  const cb = endCb;
  endCb = null;
  // el callback puede abrir otro diálogo: se ejecuta después de cerrar este
  cb?.();
}

function advance(): void {
  if (!active) return;
  const now = performance.now();
  // evita que el mismo click/tecla que abrió el diálogo lo avance al instante
  if (now - lastAdvance < 250) return;
  lastAdvance = now;
  idx++;
  if (idx >= queue.length) closeDialog();
  else render();
}

/** Muestra una secuencia de líneas. onEnd se ejecuta al cerrar la última. */
export function say(lines: Line[] | Line, onEnd?: () => void): void {
  queue = Array.isArray(lines) ? lines : [lines];
  if (queue.length === 0) {
    onEnd?.();
    return;
  }
  idx = 0;
  endCb = onEnd ?? null;
  if (!active) {
    active = true;
    pushUI();
  }
  lastAdvance = performance.now();
  el('dialog').classList.remove('hidden');
  render();
}

let dialogInitialised = false;

/**
 * Registra los controles de avance. Idempotente: la llaman tanto el arranque de `/jugar`
 * como el del mundo HD-2D, y registrarlos dos veces haría saltar dos líneas por tecla.
 */
export function initDialog(): void {
  if (dialogInitialised) return;
  dialogInitialised = true;
  el('dialog').addEventListener('click', () => {
    if (touchControlsEnabled()) advance();
  });
  window.addEventListener('keydown', (ev) => {
    if (!active) return;
    if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'KeyE') {
      ev.preventDefault();
      advance();
    }
  });
}

/* ---------- Toast (aviso breve, estilo nota de la Bitácora) ---------- */

let toastTimer: number | undefined;

export function toast(msg: string, ms = 3200): void {
  sfxToast();
  const t = el('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.add('hidden'), ms);
}
