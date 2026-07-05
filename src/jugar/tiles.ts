import Phaser from 'phaser';
import { DECOR } from './decorData';

/*
 * M1 — carga y render de tiles pixel («decor») sobre el pase procedural.
 * No reemplaza drawRoomBase: se dibuja encima del piso base y por debajo
 * de props/rigs/muros (salvo capas `above`).
 */

export interface AtlasDef {
  url: string;
  frame: number;
  scale: number;
}

export const ATLASES: Record<string, AtlasDef> = {
  'medieval-ground': { url: new URL('../../assets/ohmdal/tilesets/medieval-ground.png', import.meta.url).href, frame: 48, scale: 1 },
  'medieval-walls': { url: new URL('../../assets/ohmdal/tilesets/medieval-walls.png', import.meta.url).href, frame: 48, scale: 1 },
  'medieval-props': { url: new URL('../../assets/ohmdal/tilesets/medieval-props.png', import.meta.url).href, frame: 48, scale: 1 },
  'trees-bushes': { url: new URL('../../assets/ohmdal/tilesets/trees-bushes-16.png', import.meta.url).href, frame: 16, scale: 3 },
  'town-props': { url: new URL('../../assets/ohmdal/tilesets/town-props-16.png', import.meta.url).href, frame: 16, scale: 3 },
};

const CELL = 48;
const COLS = 20;
const ROWS = 11;

/** carga los spritesheets de decor declarados en ATLASES */
export function preloadDecorAtlases(scene: Phaser.Scene): void {
  for (const [key, atlas] of Object.entries(ATLASES)) {
    scene.load.spritesheet(`decor-${key}`, atlas.url, {
      frameWidth: atlas.frame,
      frameHeight: atlas.frame,
    });
  }
}

/** filtro NEAREST solo para las texturas de decor (no degrada lo procedural) */
export function applyNearestFilter(scene: Phaser.Scene): void {
  for (const key of Object.keys(ATLASES)) {
    const texKey = `decor-${key}`;
    if (scene.textures.exists(texKey)) {
      scene.textures.get(texKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

/**
 * Dibuja las capas de decor de una sala (si existen) sobre el chunk ya
 * ubicado en (ox, oy). Devuelve los game objects creados para que el
 * llamador los agregue a su ciclo de vida (roomObjects).
 */
export function renderDecor(
  scene: Phaser.Scene,
  roomId: string,
  ox: number,
  oy: number,
): Phaser.GameObjects.GameObject[] {
  const decor = DECOR[roomId];
  if (!decor) return [];

  const created: Phaser.GameObjects.GameObject[] = [];
  // por debajo de props/rigs/muros, pero sobre el rectángulo base del piso.
  const DEPTH_DECOR_BELOW = 1;
  // por encima de los rigs (y-sort usa depth = y, hasta H); un valor alto y fijo alcanza.
  const DEPTH_DECOR_ABOVE = 799;

  for (const layer of decor.layers) {
    const depth = layer.above ? DEPTH_DECOR_ABOVE : DEPTH_DECOR_BELOW;
    for (let row = 0; row < layer.grid.length && row < ROWS; row++) {
      const line = layer.grid[row];
      for (let col = 0; col < line.length && col < COLS; col++) {
        const ch = line[col];
        if (ch === '.') continue;
        const frameIndex = layer.legend[ch];
        if (frameIndex === undefined) continue;
        const img = scene.add
          .image(ox + col * CELL + CELL / 2, oy + row * CELL + CELL / 2, `decor-${layer.atlas}`, frameIndex)
          .setDisplaySize(CELL, CELL)
          .setDepth(depth);
        created.push(img);
      }
    }
  }
  return created;
}
