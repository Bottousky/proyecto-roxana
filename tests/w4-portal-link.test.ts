import { esLlegadaPorPortal, portalExitUrl, portalGateUrl, salaLlegadaPortal } from '../src/shared/portalLink.ts';

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
equal(portalGateUrl().includes('room=plaza'), true, 'portalGateUrl fija la plaza como destino');
equal(portalExitUrl(), '/#aula/electronica', 'la salida abandona Phaser y vuelve al aula real');
equal(salaLlegadaPortal('?from=portal&room=plaza'), 'plaza', 'el portal llega a la plaza');
equal(salaLlegadaPortal('?from=portal'), 'plaza', 'un link viejo también llega a la plaza');
equal(salaLlegadaPortal('?from=portal&room=hall'), 'plaza', 'el portal no acepta una sala del Instituto');

console.log('W4 portal link tests: OK');
