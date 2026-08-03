// Arranque del laboratorio en su propia página. Ya no lo construye: se lo pide al shell, que
// es el objetivo de `ARC1-007`. La página sólo aporta el contenedor y el desmontaje al salir;
// el ciclo de vida lo gobierna `RuntimeHost`.
//
// Las sondas de medición del slice —`render_game_to_text` y `advanceTime`— las publica ahora
// `hd2dRuntime`, que es quien tiene el handle del laboratorio.
import { createRuntimeHost } from '../../app/runtimeHost.ts';
import { runtimeLoaders } from '../../experiences/loaders.ts';

const container = document.getElementById('app');
if (!container) throw new Error('Missing harness element #app');

const host = createRuntimeHost(container, runtimeLoaders);

// `runtime: 'hd2d-three'` es lo único que distingue esta página del juego publicado. Sin ese
// campo, la misma llamada montaría `topdown-phaser`, que es lo que Ohmdal declara en su
// manifest y lo que sigue sirviendo a `/jugar` (`CP-021`).
void host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' }).catch((error) => {
  console.error('[lab] no se pudo montar el laboratorio HD-2D', error);
});

window.addEventListener(
  'beforeunload',
  () => {
    void host.destroy();
  },
  { once: true },
);
