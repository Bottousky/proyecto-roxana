export function portalGateUrl(): string {
  return '/jugar?from=portal&room=plaza';
}

/** El regreso abandona el runtime de Ohmdal y abre el aula real del Instituto. */
export function portalExitUrl(): string {
  return '/#sala/electronica';
}

export function esLlegadaPorPortal(search: string): boolean {
  return new URLSearchParams(search).get('from') === 'portal';
}

/** Destino canónico del portal escolar. Nunca depende de la última sala guardada. */
export function salaLlegadaPortal(search: string): string {
  const requested = new URLSearchParams(search).get('room');
  return requested === 'plaza' ? requested : 'plaza';
}
