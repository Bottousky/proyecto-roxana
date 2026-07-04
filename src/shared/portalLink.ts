export function portalGateUrl(): string {
  return '/src/jugar/?from=portal';
}

export function esLlegadaPorPortal(search: string): boolean {
  return new URLSearchParams(search).get('from') === 'portal';
}
