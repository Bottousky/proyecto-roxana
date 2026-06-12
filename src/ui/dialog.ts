import { el, pushUI, popUI } from './overlay';
import { sfxBlip, sfxToast } from '../audio';

export interface Line {
  who: string;
  text: string;
}

export function L(who: string, text: string): Line {
  return { who, text };
}

let queue: Line[] = [];
let idx = 0;
let endCb: (() => void) | null = null;
let active = false;
let lastAdvance = 0;

function render(): void {
  sfxBlip();
  const line = queue[idx];
  el('dialog-who').textContent = line.who;
  el('dialog-who').style.display = line.who ? 'block' : 'none';
  el('dialog-text').textContent = line.text;
}

function closeDialog(): void {
  active = false;
  el('dialog').classList.add('hidden');
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

export function initDialog(): void {
  el('dialog').addEventListener('click', advance);
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
