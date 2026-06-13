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

/** Abre la "vista de banco": un primer plano del mecanismo, sobre la exploración. */
export function openBench(
  title: string,
  subtitle: string,
  build: (bench: BenchHandle) => void,
): void {
  const host = el('bench');
  host.innerHTML = '';
  host.classList.remove('hidden');
  pushUI();
  sfxUIOpen();

  const panel = document.createElement('div');
  panel.className = 'bench-panel';
  panel.innerHTML = `<h2>${title}</h2><div class="bench-sub">${subtitle}</div>`;
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
      host.innerHTML = '';
      popUI();
      after?.();
    },
  };

  build(handle);
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
