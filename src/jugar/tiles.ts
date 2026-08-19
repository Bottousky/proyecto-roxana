import Phaser from 'phaser';
import {
  DECOR,
  DECOR_CELL,
  decorCellsForArea,
  type DecorCell,
} from './decorData';
import { areaDimensions } from './roomScenesData.ts';

/*
 * M1 — carga y render de tiles pixel («decor») sobre el pase procedural.
 * No reemplaza drawRoomBase: se dibuja encima del piso base y por debajo
 * de props/rigs/muros (salvo capas `above`).
 *
 * Commit 3 (multi-área): el número de columnas y filas del grid se
 * deriva de las dimensiones del `AreaDef` en `roomScenesData`, no de
 * constantes globales (20×11). Para las 20 rooms existentes el
 * resultado es idéntico: 960/48=20 columnas, 540/48=11 filas
 * (Math.floor). Un área hipotética de 1920×1080 produce 40×22.
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

/** Resolver de grilla de decor para una sala: devuelve las celdas
 *  a pintar en coordenadas LOCALES del chunk. El llamador las
 *  traslada al world pasando `(ox, oy)`. */
export function decorGridForRoom(roomId: string): DecorCell[] {
  const dims = areaDimensions(roomId);
  return decorCellsForArea(roomId, { width: dims.width, height: dims.height });
}

/**
 * Dibuja las capas de decor de una sala sobre el chunk ya ubicado
 * en (ox, oy). El número de celdas se deriva del `AreaDef` del
 * chunk. Devuelve los game objects creados para que el llamador
 * los agregue a su ciclo de vida (roomObjects).
 */
export function renderDecor(
  scene: Phaser.Scene,
  roomId: string,
  ox: number,
  oy: number,
): Phaser.GameObjects.GameObject[] {
  const cells = decorGridForRoom(roomId);
  if (cells.length === 0) return [];

  const created: Phaser.GameObjects.GameObject[] = [];
  // por debajo de props/rigs/muros, pero sobre el rectángulo base del piso.
  const DEPTH_DECOR_BELOW = 1;
  // por encima de los rigs (y-sort usa depth = y, hasta H); un valor alto y fijo alcanza.
  const DEPTH_DECOR_ABOVE = 799;

  for (const cell of cells) {
    const layer = DECOR[roomId]?.layers[cell.layerIndex];
    if (!layer) continue;
    const frameIndex = layer.legend[cell.character];
    if (frameIndex === undefined) continue;
    const atlasKey = `decor-medieval-ground`;
    const above = cell.layerIndex > 0;
    const depth = above ? DEPTH_DECOR_ABOVE : DEPTH_DECOR_BELOW;
    const img = scene.add
      .image(ox + cell.x, oy + cell.y, atlasKey, frameIndex)
      .setDisplaySize(DECOR_CELL, DECOR_CELL)
      .setDepth(depth);
    created.push(img);
  }
  return created;
}
