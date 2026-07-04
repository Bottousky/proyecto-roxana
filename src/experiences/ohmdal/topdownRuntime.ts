// Adaptador Phaser para el runtime cenital de Ohmdal/Instituto. El boot que antes vivía
// en main.ts se movió acá: main.ts ya no conoce Phaser.
import Phaser from 'phaser';
import { ExplorationScene, W, H } from '../../jugar/ExplorationScene.ts';
import { state, hooks } from '../../state.ts';
import { activateExperienceForRoom, experienceOfRoom } from '../registry.ts';
import type { ExperienceId, ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';

export const topdownRuntime: ExperienceRuntimeModule = {
  runtime: 'topdown-phaser',
  async mount(hostEl, context) {
    hooks.travel = (experienceId, roomId) => {
      void context.requestTravel({ experienceId: experienceId as ExperienceId, roomId });
    };
    // El shell puede pedir montar en una sala concreta (p. ej. la puerta 3D → plaza).
    const requestedRoom = context.initialLocation.roomId;
    if (requestedRoom && experienceOfRoom(requestedRoom)?.runtime === 'topdown-phaser') {
      state.room = requestedRoom;
    }

    // La escena ya lee state.room directamente.
    activateExperienceForRoom(state.room);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostEl,
      width: W,
      height: H,
      backgroundColor: '#0e0d12',
      pixelArt: true,
      roundPixels: true,
      render: {
        antialias: false,
        antialiasGL: false,
        roundPixels: true,
      },
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
