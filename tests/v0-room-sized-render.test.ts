/**
 * El fondo de una room cubre su rect LOCAL, no el viewport 960×540.
 * Plaza 1920×1080 deja de pintarse como un cuadrante.
 *
 * Run: node --experimental-strip-types tests/v0-room-sized-render.test.ts
 */

import { readFileSync } from 'node:fs';
import { ROOM_SCENES, areaDimensions } from '../src/jugar/roomScenesData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const backgrounds = readFileSync(new URL('../src/jugar/roomScenes.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

assert(
  scene.includes('const roomW = this.activeRoom.width;'),
  'buildChunk lee el ancho LOCAL de la room activa',
);
assert(
  scene.includes('const roomH = this.activeRoom.height;'),
  'buildChunk lee el alto LOCAL de la room activa',
);
assert(
  scene.includes('this.add.image(roomW / 2, roomH / 2, paintedKey)'),
  'el fondo pintado se ancla al centro LOCAL de la room',
);
assert(
  scene.includes('bg.setDisplaySize(roomW, roomH)'),
  'el fondo pintado cubre width×height de la room, no el viewport',
);
assert(
  !scene.includes('this.add.image(W / 2, H / 2, paintedKey)'),
  'el fondo pintado ya no se estira al viewport',
);
assert(
  scene.includes('drawRoomBase(\n        this,\n        add,\n        id,') && scene.includes('roomW,\n        roomH,'),
  'drawRoomBase recibe las dimensiones de la room activa',
);

const plaza = ROOM_SCENES.plaza;
assert(plaza.background === 'room-plaza', 'Plaza declara el set pintado 1920×1080');
assert(areaDimensions('plaza').width === 1920, 'Plaza sigue midiendo 1920 de ancho');
assert(areaDimensions('plaza').height === 1080, 'Plaza sigue midiendo 1080 de alto');
assert(
  backgrounds.includes('plaza-1920-base-v4.png') && backgrounds.includes("'room-plaza': plazaUrl"),
  'room-plaza apunta al set pintado 1920×1080',
);
assert(
  plaza.bakedThings?.includes('lampara1') && plaza.bakedThings?.includes('lampara4'),
  'las lámparas de la Plaza están horneadas en el fondo pintado',
);
assert(
  scene.includes("id === 'plaza' ? { x: 300, y: 840 }"),
  'la Plaza spawnea en la llegada del portal, no en el viewport 960×540',
);

console.log('v0 room-sized render: OK');
