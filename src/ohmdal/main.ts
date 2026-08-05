// Arranque de Ohmdal HD-2D en su propia página (`/ohmdal`). No construye el mundo: se lo pide
// al shell. La página sólo aporta el contenedor y el desmontaje al salir; el ciclo de vida lo
// gobierna `RuntimeHost`.
//
// Las sondas de medición —`render_game_to_text` y `advanceTime`— las publica `hd2dRuntime`,
// que es quien tiene el handle del mundo.
import { createRuntimeHost } from '../app/runtimeHost.ts';
import { runtimeLoaders } from '../experiences/loaders.ts';
import type { ExperienceLocation } from '../experiences/types.ts';

const container = document.getElementById('app');
if (!container) throw new Error('Falta el elemento #app');

const host = createRuntimeHost(container, runtimeLoaders);

// `runtime: 'hd2d-three'` es lo único que distingue esta página de `/jugar`. Sin ese campo, la
// misma llamada montaría `topdown-phaser`, que es lo que Ohmdal declara en su manifest y lo que
// sigue sirviendo al Arco I jugable mientras el HD-2D lo alcanza.
const OHMDAL_LOCATION: ExperienceLocation = { experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' };

void host.start(OHMDAL_LOCATION).catch((error: unknown) => {
  console.error('[ohmdal] no se pudo montar el mundo HD-2D', error);
});

window.addEventListener(
  'beforeunload',
  () => {
    void host.destroy();
  },
  { once: true },
);

// Sonda de ciclo de vida para medir mount → pause → resume → destroy desde el navegador, sobre
// el `RuntimeHost` real y no un doble de test. Gateada: desde que esta página es entrada de
// build, publicarla sería exponer controles internos en producción.
if (import.meta.env.DEV) {
  const scope = window as unknown as Record<string, unknown>;
  scope.ohmdalControl = {
    // Devuelve la promesa real de `host.start`, sin envolver ni tragar el rechazo: el medidor
    // la espera con `await` y necesita que un fallo de montaje se propague.
    start(): Promise<void> {
      return host.start(OHMDAL_LOCATION);
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
}
