import { el, pushUI, popUI } from './overlay';
import { sfxUIOpen, sfxUIClose, sfxClick } from '../audio';

export interface BenchHandle {
  /** raíz del panel, para que el puzzle construya su contenido */
  root: HTMLElement;
  /** zona de mensajes reactivos (Edda / Lumen / el mundo) */
  setStatus(html: string): void;
  /** registra recursos que deben liberarse antes de retirar el banco */
  onClose(cleanup: () => void): () => void;
  /** cierra el banco; luego corre el callback que se pase */
  close(after?: () => void): void;
}

export interface BenchPresentation {
  theme?: 'default' | 'plaza' | 'terraces';
  location?: string;
  mechanism?: string;
  /** Conserva el mundo vivo bajo el primer plano. */
  worldCloseup?: boolean;
}

/** Selector de elementos "focoseables" dentro de un banco (para foco inicial y Tab-trap). */
const FOCUSABLE_SELECTOR = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if ((element as HTMLButtonElement).disabled) return false;
    // offsetParent es null si el elemento (o un ancestro) tiene display:none.
    return element.offsetParent !== null;
  });
}

type FocusDirection = 'up' | 'down' | 'left' | 'right';

/** Elige el control más cercano en la dirección pedida, como una grilla de consola. */
function focusInDirection(panel: HTMLElement, direction: FocusDirection): void {
  const focusable = getFocusableElements(panel);
  if (focusable.length === 0) return;
  const active = document.activeElement as HTMLElement | null;
  if (!active || !panel.contains(active)) {
    focusable[0].focus();
    return;
  }

  const origin = active.getBoundingClientRect();
  const ox = origin.left + origin.width / 2;
  const oy = origin.top + origin.height / 2;
  let best: { element: HTMLElement; score: number } | null = null;

  for (const element of focusable) {
    if (element === active) continue;
    const rect = element.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - ox;
    const dy = rect.top + rect.height / 2 - oy;
    const forward = direction === 'left' ? -dx : direction === 'right' ? dx : direction === 'up' ? -dy : dy;
    if (forward <= 2) continue;
    const sideways = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = forward + sideways * 2.4;
    if (!best || score < best.score) best = { element, score };
  }

  if (!best) return;
  best.element.focus();
  best.element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/** Abre la "vista de banco": un primer plano del mecanismo, sobre la exploración. */
export function openBench(
  title: string,
  subtitle: string,
  build: (bench: BenchHandle) => void,
  presentation: BenchPresentation = {},
): void {
  const host = el('bench');
  host.innerHTML = '';
  host.classList.remove('hidden');
  host.classList.toggle('world-closeup', presentation.worldCloseup === true);
  host.dataset.theme = presentation.theme ?? 'default';
  document.body.classList.add('bench-open');
  pushUI();
  sfxUIOpen();

  const panel = document.createElement('div');
  panel.className = 'bench-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', title);
  const context = presentation.location || presentation.mechanism
    ? `<div class="bench-context"><span>${presentation.location ?? ''}</span><strong>${presentation.mechanism ?? ''}</strong></div>`
    : '';
  panel.innerHTML = `${context}<h2>${title}</h2><div class="bench-sub">${subtitle}</div>
    <div class="bench-control-hint" aria-hidden="true">Flechas / WASD: mover · E: usar · Esc: salir</div>`;
  host.appendChild(panel);

  const body = document.createElement('div');
  panel.appendChild(body);

  const status = document.createElement('div');
  status.className = 'bench-status';
  panel.appendChild(status);

  let closed = false;
  const cleanups = new Set<() => void>();

  const handle: BenchHandle = {
    root: body,
    setStatus(html: string) {
      status.innerHTML = html;
    },
    onClose(cleanup: () => void) {
      if (closed) {
        cleanup();
        return () => {};
      }
      cleanups.add(cleanup);
      return () => cleanups.delete(cleanup);
    },
    close(after?: () => void) {
      if (closed) return;
      closed = true;
      window.removeEventListener('keydown', onKeydown, true);
      const pendingCleanups = [...cleanups];
      cleanups.clear();
      for (const cleanup of pendingCleanups) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error al cerrar el banco:', error);
        }
      }
      sfxUIClose();
      host.classList.add('hidden');
      host.classList.remove('world-closeup');
      host.innerHTML = '';
      delete host.dataset.theme;
      document.body.classList.remove('bench-open');
      popUI();
      after?.();
    },
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handle.close();
      return;
    }
    const target = event.target as HTMLElement | null;
    const nativeArrowControl = target?.matches('input, select, textarea, [contenteditable="true"]') === true;
    const directions: Record<string, FocusDirection | undefined> = {
      ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    };
    const direction = directions[event.code];
    if (direction && !nativeArrowControl) {
      event.preventDefault();
      event.stopPropagation();
      focusInDirection(panel, direction);
      return;
    }
    if (event.code === 'KeyE' && !nativeArrowControl) {
      const active = document.activeElement;
      if (active instanceof Element && panel.contains(active)) {
        event.preventDefault();
        event.stopPropagation();
        active.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const insidePanel = active instanceof Node && panel.contains(active);

    if (event.shiftKey) {
      if (!insidePanel || active === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (!insidePanel || active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  // Algunos puzzles reconstruyen el control activo al cambiar una pieza. En ese
  // instante el foco cae temporalmente en <body>, fuera de `host`; escuchar en
  // capture mantiene las flechas/WASD disponibles para recuperar el foco.
  window.addEventListener('keydown', onKeydown, true);

  build(handle);

  requestAnimationFrame(() => {
    if (closed) return;
    getFocusableElements(panel)[0]?.focus();
  });
}

/** Botonera estándar al pie del banco. */
export function benchActions(
  panelBody: HTMLElement,
  buttons: { label: string; primary?: boolean; onClick: () => void }[],
): Record<string, HTMLButtonElement> {
  const row = document.createElement('div');
  row.className = 'bench-actions';
  const out: Record<string, HTMLButtonElement> = {};
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.className = 'bench-btn' + (b.primary ? ' primary' : '');
    btn.textContent = b.label;
    btn.addEventListener('click', () => {
      sfxClick();
      b.onClick();
    });
    row.appendChild(btn);
    out[b.label] = btn;
  }
  panelBody.appendChild(row);
  return out;
}
