// Frontera única entre el shell y `babylonjs` para Physica. Sólo se alcanza por
// el `import()` dinámico de `loaders.ts`, así que Babylon no entra al grafo
// estático del shell.
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';
import { createPhysicaWorld } from './babylonWorld.ts';

function attachHarnessProbes(world: ReturnType<typeof createPhysicaWorld>): () => void {
  if (!import.meta.env.DEV) return () => {};
  const scope = window as unknown as Record<string, unknown>;
  const previousRender = scope.render_game_to_text;
  const previousAdvance = scope.advanceTime;
  scope.render_game_to_text = () => JSON.stringify(world.snapshot(), null, 2);
  scope.advanceTime = (milliseconds: number) => world.advanceTime(milliseconds);
  scope.__pxPress = (action: string, down: boolean) => world.press(action, down);
  scope.__pxSnapshot = () => world.snapshot();
  scope.__pxTeleport = (x: number, y: number) => world.teleport(x, y);
  return () => {
    scope.render_game_to_text = previousRender;
    scope.advanceTime = previousAdvance;
    delete scope.__pxPress;
    delete scope.__pxSnapshot;
    delete scope.__pxTeleport;
  };
}

export const babylonRuntime: ExperienceRuntimeModule = {
  runtime: 'platformer-babylon',
  async mount(hostEl) {
    const world = createPhysicaWorld(hostEl);
    const detachProbes = attachHarnessProbes(world);

    const handle: RuntimeHandle = {
      async travelTo() {
        // Physica es un espacio continuo en el arco 2D: no tiene salas discretas
        // a las que saltar. El mundo deriva su zona de la posición.
      },
      snapshot() {
        return { runtime: 'platformer-babylon', data: world.snapshot() as Record<string, unknown> };
      },
      pause() {
        world.pause();
      },
      resume() {
        world.resume();
      },
      async destroy() {
        detachProbes();
        world.dispose();
      },
    };

    return handle;
  },
};
