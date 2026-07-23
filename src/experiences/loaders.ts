// Mapa de loaders lazy por runtime. Todos los import() son dinámicos:
// visitar Ohmdal no debe descargar código de otros mundos.
import type { RuntimeLoaderMap } from './types.ts';

export const runtimeLoaders: RuntimeLoaderMap = {
  'topdown-phaser': () => import('./ohmdal/topdownRuntime.ts').then((m) => m.topdownRuntime),
  'school-hub': () => import('./instituto/hubRuntime.ts').then((m) => m.hubRuntime),
  'school-parallax': () =>
    import('./instituto/parallaxRuntime.ts').then((m) => m.parallaxRuntime),
  'dataflow-phaser': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('dataflow-phaser', 'bitland')),
  'platformer-phaser': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('platformer-phaser', 'physica')),
  'cosmos-web': () =>
    import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('cosmos-web', 'arithmos')),
};
