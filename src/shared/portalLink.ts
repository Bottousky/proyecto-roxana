export function portalGateUrl(): string {
  return '/src/jugar/?from=portal&room=plaza';
}

export function esLlegadaPorPortal(search: string): boolean {
  return new URLSearchParams(search).get('from') === 'portal';
}

/** Destino canónico del portal escolar. Nunca depende de la última sala guardada. */
export function salaLlegadaPortal(search: string): string {
  const requested = new URLSearchParams(search).get('room');
  return requested === 'plaza' ? requested : 'plaza';
}
