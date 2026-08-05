import { readFileSync } from 'node:fs';
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

// El Instituto 3D tenía `action.href = '/jugar'` a secas en «Viajar a Ohmdal»: sin el destino
// en la query, la llegada caía en la sala que dijera el save —el hall del Instituto en 2D— o
// sea lo contrario de lo que promete el botón. El bug no se ve leyendo `portalLink.ts`, que
// estaba bien: se ve en quién lo usa. Por eso el test mira el consumidor.
const school3dSource = readFileSync(new URL('../src/landing/school3d.ts', import.meta.url), 'utf8');

equal(
  school3dSource.includes('portalGateUrl()'),
  true,
  'el Instituto 3D construye el cruce con portalGateUrl, no con una ruta escrita a mano',
);
equal(
  /action\.href = ['"]\/jugar['"];\s*\n\s*action\.textContent = ['"]Viajar a Ohmdal/.test(school3dSource),
  false,
  'ningún botón que prometa Ohmdal puede apuntar a /jugar sin destino',
);
equal(
  school3dSource.includes('startPortalTransition'),
  true,
  'el cruce desde el Instituto 3D usa la misma transición que la landing clásica',
);

console.log('W4 portal link tests: OK');
