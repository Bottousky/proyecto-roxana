/** Contador global de overlays DOM abiertos (diálogo, banco, bitácora).
 *  Mientras haya alguno abierto, la escena de exploración ignora el input. */
let openCount = 0;

export function uiOpen(): boolean {
  return openCount > 0;
}

export function pushUI(): void {
  openCount++;
}

export function popUI(): void {
  openCount = Math.max(0, openCount - 1);
}

export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Falta el elemento #${id} en index.html`);
  return node as T;
}
