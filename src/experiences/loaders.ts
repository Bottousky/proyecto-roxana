// Mapa de loaders lazy por runtime. Todos los import() son dinámicos:
// visitar Ohmdal no debe descargar código de otros mundos.
import type { RuntimeLoaderMap } from './types.ts';

export const runtimeLoaders: RuntimeLoaderMap = {
  'topdown-phaser': () => import('./ohmdal/topdownRuntime.ts').then((m) => m.topdownRuntime),
  // Laboratorio HD-2D del slice. El import() dinámico es lo que mantiene `three` fuera del
  // grafo estático del shell: sólo se descarga si alguien pide esta gramática.
  'hd2d-three': () => import('./ohmdal/hd2dRuntime.ts').then((m) => m.hd2dRuntime),
  'platformer-three': () =>
    import('./physica/physicaRuntime.ts').then((m) => m.physicaRuntime),
  'platformer-babylon': () =>
    import('./physica/babylonRuntime.ts').then((m) => m.babylonRuntime),
  'dataflow-phaser': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('dataflow-phaser', 'bitland')),
  'platformer-phaser': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('platformer-phaser', 'physica')),
  'cosmos-web': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('cosmos-web', 'arithmos')),
};
