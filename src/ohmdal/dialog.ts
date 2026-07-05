// Diálogo autocontenido del slice (caja DOM + retratos reales del proyecto).
// No depende del motor de la escuela: reusa solo los PNG de retratos.

export interface Line { who: string; text: string; }
export function L(who: string, text: string): Line { return { who, text }; }

const PORTRAITS: Record<string, string> = {
  student: new URL('../../assets/ohmdal/portraits/student.png', import.meta.url).href,
  edda: new URL('../../assets/ohmdal/portraits/edda.png', import.meta.url).href,
  lumen: new URL('../../assets/ohmdal/portraits/lumen.png', import.meta.url).href,
  ohm: new URL('../../assets/ohmdal/portraits/ohm.png', import.meta.url).href,
};

function portraitKey(who: string): string {
  const n = who.toLocaleLowerCase('es');
  if (n.includes('edda')) return 'edda';
  if (n.includes('lumen')) return 'lumen';
  if (n.includes('ohm')) return 'ohm';
  if (n.includes('tú') || n.includes('tu ') || n === 'tú' || n.includes('vos')) return 'student';
  return '';
}

let queue: Line[] = [];
let idx = 0;
let endCb: (() => void) | null = null;
let active = false;
let lastAdvance = 0;

function el(id: string): HTMLElement { return document.getElementById(id)!; }

export function isDialogOpen(): boolean { return active; }

function render(): void {
  const line = queue[idx];
  el('od-who').textContent = line.who;
  el('od-who').style.display = line.who ? 'block' : 'none';
  el('od-text').textContent = line.text;
  const key = portraitKey(line.who);
  const wrap = el('od-portrait');
  const img = el('od-portrait-img') as HTMLImageElement;
  if (key) { wrap.style.display = 'block'; img.src = PORTRAITS[key]; img.alt = line.who; }
  else { wrap.style.display = 'none'; img.src = ''; }
}

function advance(): void {
  if (!active) return;
  const now = performance.now();
  if (now - lastAdvance < 220) return;
  lastAdvance = now;
  idx++;
  if (idx >= queue.length) close();
  else render();
}

function close(): void {
  active = false;
  el('od-dialog').classList.add('hidden');
  const cb = endCb;
  endCb = null;
  cb?.();
}

/** Muestra líneas; onEnd corre al cerrar la última. */
export function say(lines: Line[] | Line, onEnd?: () => void): void {
  queue = Array.isArray(lines) ? lines : [lines];
  if (queue.length === 0) { onEnd?.(); return; }
  idx = 0;
  endCb = onEnd ?? null;
  active = true;
  lastAdvance = performance.now();
  el('od-dialog').classList.remove('hidden');
  render();
}

export function initDialog(): void {
  el('od-dialog').addEventListener('click', advance);
  window.addEventListener('keydown', (ev) => {
    if (!active) return;
    if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'KeyE') {
      ev.preventDefault();
      advance();
    }
  });
}

let toastTimer: number | undefined;
export function toast(msg: string, ms = 2600): void {
  const t = el('od-toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.add('hidden'), ms);
}
