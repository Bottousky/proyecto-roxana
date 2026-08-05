import { ensureGameOverlays } from './overlayRoot.ts';

/** Contador global de overlays DOM abiertos (diálogo, banco, bitácora).
 *  Mientras haya alguno abierto, la escena de exploración ignora el input. */
let openCount = 0;

export function uiOpen(): boolean {
  return openCount > 0;
}

export function pushUI(): void {
  openCount++;
}

let lastCloseAt = -Infinity;

export function popUI(): void {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) lastCloseAt = performance.now();
}

/**
 * Un overlay se cerró recién.
 *
 * La tecla de acción abre el diálogo y también lo avanza, así que la pulsación que cierra la
 * última línea llega al mundo con el overlay ya cerrado y volvería a hablarle al mismo
 * personaje. No se puede resolver por orden de listeners —el que se registra primero gana— ni
 * por fase, porque un evento despachado sobre `window` no propaga. `dialog.ts` ya usa este
 * mismo enfriamiento para no comerse dos líneas de una.
 */
export function uiJustClosed(withinMs = 180): boolean {
  return performance.now() - lastCloseAt < withinMs;
}

export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  // La página puede traer los overlays en su HTML —`/jugar`— o no traerlos —`/ohmdal`—.
  // Si faltan, se construyen acá antes de buscarlos.
  ensureGameOverlays();
  const node = document.getElementById(id);
  if (!node) throw new Error(`Falta el elemento #${id} en index.html`);
  return node as T;
}
