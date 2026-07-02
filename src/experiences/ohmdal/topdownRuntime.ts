// Adaptador Phaser para el runtime cenital de Ohmdal/Instituto. El boot que antes vivía
// en main.ts se movió acá: main.ts ya no conoce Phaser.
import Phaser from 'phaser';
import { ExplorationScene, W, H } from '../../jugar/ExplorationScene.ts';
import { state, hooks } from '../../state.ts';
import { activateExperienceForRoom } from '../registry.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';

export const topdownRuntime: ExperienceRuntimeModule = {
  runtime: 'topdown-phaser',
  async mount(hostEl, context) {
    // La escena ya lee state.room directamente.
    // P2: initialLocation reemplazará la lectura directa de state.room
    activateExperienceForRoom(state.room);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostEl,
      width: W,
      height: H,
      backgroundColor: '#0e0d12',
      scene: [ExplorationScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    if (import.meta.env.DEV) {
      // solo en desarrollo: handle para pruebas E2E desde la consola
      (window as any).__game = game;
    }

    void context; // el contexto todavía no se usa (ver comentario arriba)

    const handle: RuntimeHandle = {
      async travelTo(destination) {
        if (destination.roomId) hooks.goto(destination.roomId, destination.spawn);
      },
      snapshot() {
        return { runtime: 'topdown-phaser', data: { room: state.room } };
      },
      pause() {
        game.loop.sleep();
      },
      resume() {
        game.loop.wake();
      },
      destroy() {
        return new Promise<void>((resolve) => {
          game.events.once(Phaser.Core.Events.DESTROY, () => resolve());
          game.destroy(true);
        });
      },
    };

    return handle;
  },
};
