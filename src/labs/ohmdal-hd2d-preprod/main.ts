// Arranque del laboratorio en su propia página. Ya no lo construye: se lo pide al shell, que
// es el objetivo de `ARC1-007`. La página sólo aporta el contenedor y el desmontaje al salir;
// el ciclo de vida lo gobierna `RuntimeHost`.
//
// Las sondas de medición del slice —`render_game_to_text` y `advanceTime`— las publica ahora
// `hd2dRuntime`, que es quien tiene el handle del laboratorio.
//
// `window.labControl`: sonda de `ARC1-008` para medir desde el navegador, sobre el
// `RuntimeHost` real (no un doble de test), el ciclo mount → pause → resume → destroy.
import { createRuntimeHost } from '../../app/runtimeHost.ts';
import { runtimeLoaders } from '../../experiences/loaders.ts';
import type { ExperienceLocation } from '../../experiences/types.ts';

const container = document.getElementById('app');
if (!container) throw new Error('Missing harness element #app');

const host = createRuntimeHost(container, runtimeLoaders);

// `runtime: 'hd2d-three'` es lo único que distingue esta página del juego publicado. Sin ese
// campo, la misma llamada montaría `topdown-phaser`, que es lo que Ohmdal declara en su
// manifest y lo que sigue sirviendo a `/jugar` (`CP-021`). Constante única: la usan el
// arranque automático y `labControl.start()` para que no puedan divergir.
const LAB_LOCATION: ExperienceLocation = { experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' };

void host.start(LAB_LOCATION).catch((error) => {
  console.error('[lab] no se pudo montar el laboratorio HD-2D', error);
});

window.addEventListener(
  'beforeunload',
  () => {
    void host.destroy();
  },
  { once: true },
);

// Sin gate de `import.meta.env.DEV`: a diferencia de las sondas de `hd2dRuntime.ts` (que sí
// gatean, porque ese módulo es alcanzable desde el grafo del bundle publicado y publicarlas
// sería un fallo, `OI-007`), este `main.ts` es la entrada de una página que no es entrada de
// build (`CP-020`), así que nunca se publica: no hay grafo que la alcance en producción.
const scope = window as unknown as Record<string, unknown>;
scope.labControl = {
  // Devuelve la promesa real de `host.start`, sin envolver ni tragar el rechazo: el
  // medidor la espera con `await` y necesita que un fallo de montaje se propague.
  start(): Promise<void> {
    return host.start(LAB_LOCATION);
  },
  pause(): void {
    host.pause();
  },
  resume(): void {
    host.resume();
  },
  destroy(): Promise<void> {
    return host.destroy();
  },
  status(): { activeRuntime: string | null; children: number; hasCanvas: boolean } {
    return {
      activeRuntime: host.activeRuntime(),
      children: container.children.length,
      hasCanvas: container.querySelector('canvas') !== null,
    };
  },
};
