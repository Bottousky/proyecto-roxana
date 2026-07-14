/** Fuente única para decidir si la interfaz debe aceptar pulsaciones táctiles. */
export function hasTouchInput(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
}

export function enableTouchControls(): void {
  if (typeof document !== 'undefined') document.body.classList.add('touch-device');
}

export function touchControlsEnabled(): boolean {
  return typeof document !== 'undefined'
    && (document.body.classList.contains('touch-device') || hasTouchInput());
}
