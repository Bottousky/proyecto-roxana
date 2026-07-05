import { readFileSync } from 'node:fs';
import { DECOR, OHMDAL_DECORATED_ROOMS, hasRoomDecor } from '../src/jugar/decorData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const ROWS = 11;
const COLS = 20;

for (const [roomId, decor] of Object.entries(DECOR)) {
  assert(decor.layers.length > 0, `${roomId}: tiene al menos una capa`);
  for (const [i, layer] of decor.layers.entries()) {
    assert(layer.grid.length === ROWS, `${roomId} capa ${i}: grid tiene ${ROWS} filas`);
    for (let row = 0; row < layer.grid.length; row++) {
      assert(layer.grid[row].length === COLS, `${roomId} capa ${i} fila ${row}: ${COLS} caracteres exactos`);
      for (const ch of layer.grid[row]) {
        if (ch === '.') continue;
        assert(ch in layer.legend, `${roomId} capa ${i} fila ${row}: char '${ch}' está en legend`);
      }
    }
    for (const [ch, frame] of Object.entries(layer.legend)) {
      assert(Number.isInteger(frame) && frame >= 0, `${roomId} capa ${i}: legend['${ch}'] es entero >= 0`);
    }
  }
}

for (const roomId of OHMDAL_DECORATED_ROOMS) {
  assert(hasRoomDecor(roomId), `${roomId}: el Arco I tiene vestido pixel`);
}
assert(Object.keys(DECOR).length === OHMDAL_DECORATED_ROOMS.length, 'no hay salas decoradas huérfanas');

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(scene.includes('renderDecor('), 'ExplorationScene llama a renderDecor(');
assert(scene.includes('preloadDecorAtlases('), 'ExplorationScene llama a preloadDecorAtlases(');

const tiles = readFileSync(new URL('../src/jugar/tiles.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(tiles.includes('FilterMode.NEAREST'), 'tiles.ts aplica FilterMode.NEAREST');

console.log('M1 decor tests: OK');
