import { portalTransitionProgress } from '../src/landing/portal.ts';

function equal(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
}

equal(portalTransitionProgress(99.9, 100, 1000), 0, 'un frame anterior al inicio queda en cero');
equal(portalTransitionProgress(100, 100, 1000), 0, 'inicio exacto');
equal(portalTransitionProgress(600, 100, 1000), 0.5, 'mitad de la transición');
equal(portalTransitionProgress(1200, 100, 1000), 1, 'un frame tardío queda en uno');
equal(portalTransitionProgress(Number.NaN, 100, 1000), 1, 'un reloj inválido degrada al final');

console.log('W5 portal transition tests: OK');
