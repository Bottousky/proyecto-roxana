// Adaptador de `RuntimeHost` para el laboratorio HD-2D del slice.
//
// Este archivo es la única frontera entre el shell y `three`. Sólo se alcanza por el
// `import()` dinámico de `loaders.ts`, así que importar `lab.ts` acá —y con él `three`—
// no mete nada de eso en el grafo estático del shell.
//
// El laboratorio no reemplaza al runtime cenital de Ohmdal: convive con él. Quién de los
// dos sirve una ubicación lo decide `ExperienceLocation.runtime` (`CP-021`).
import { createOhmdalLab, type OhmdalLab } from '../../labs/ohmdal-hd2d-preprod/lab.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';

/**
 * Sondas de medición del slice. `ARC1-006` midió con ellas y `ARC1-008` va a medir el ciclo
 * de vida con las mismas, así que el traslado a `RuntimeHost` no puede hacerlas desaparecer:
 * antes las publicaba el `main.ts` del laboratorio, que ya no tiene el handle.
 *
 * Sólo en desarrollo, igual que el `__game` de `topdownRuntime`. El laboratorio no es entrada
 * de build (`CP-020`), así que fuera de `vite dev` esto no existe.
 */
function attachHarnessProbes(lab: OhmdalLab): () => void {
  if (!import.meta.env.DEV) return () => {};

  const scope = window as unknown as Record<string, unknown>;
  const previousRender = scope.render_game_to_text;
  const previousAdvance = scope.advanceTime;

  scope.render_game_to_text = () => JSON.stringify(lab.snapshot(), null, 2);
  scope.advanceTime = (milliseconds: number) => lab.advanceTime(milliseconds);

  return () => {
    scope.render_game_to_text = previousRender;
    scope.advanceTime = previousAdvance;
  };
}

export const hd2dRuntime: ExperienceRuntimeModule = {
  runtime: 'hd2d-three',
  async mount(hostEl) {
    const lab = createOhmdalLab(hostEl);
    const detachProbes = attachHarnessProbes(lab);

    const handle: RuntimeHandle = {
      // El laboratorio es un espacio continuo: el recorrido cruza portal, taller y manantial
      // sin cortes de sala. No tiene destinos discretos a los que saltar, así que un viaje
      // same-runtime no tiene nada que hacer. Las zonas se derivan de la posición, no se
      // seleccionan. Si el slice llegara a necesitar saltos, es un ticket propio.
      async travelTo() {},
      snapshot() {
        return { runtime: 'hd2d-three', data: { harness: lab.snapshot() } };
      },
      pause() {
        lab.pause();
      },
      resume() {
        lab.resume();
      },
      async destroy() {
        detachProbes();
        lab.dispose();
      },
    };

    return handle;
  },
};
