import { esLlegadaPorPortal, portalGateUrl } from '../src/shared/portalLink.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
  }
}

equal(esLlegadaPorPortal('?from=portal'), true, 'from portal');
equal(esLlegadaPorPortal(''), false, 'sin query');
equal(esLlegadaPorPortal('?from=otra'), false, 'from otra');
equal(esLlegadaPorPortal('?x=1&from=portal'), true, 'from portal con otros parametros');
equal(portalGateUrl().includes('/src/jugar/'), true, 'portalGateUrl contiene ruta jugar');
equal(portalGateUrl().includes('from=portal'), true, 'portalGateUrl contiene from portal');

console.log('W4 portal link tests: OK');
