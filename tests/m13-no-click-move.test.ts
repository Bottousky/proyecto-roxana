import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
const pointerStart = scene.indexOf('private onPointer(');
const pointerEnd = scene.indexOf('private navigationPath(', pointerStart);
const pointerHandler = scene.slice(pointerStart, pointerEnd);

assert(pointerStart >= 0 && pointerEnd > pointerStart, 'existe el manejador de clic del mundo');
assert(
  pointerHandler.includes('t.def.onInteract()'),
  'clicar un objeto cercano conserva la interacción directa',
);
assert(
  pointerHandler.includes('Phaser.Math.Distance.Between'),
  'los objetos sólo responden al clic cuando ya están al alcance',
);
assert(
  !scene.includes('moveTarget') && !scene.includes('tap-to-move'),
  'la escena no conserva ninguna ruta de movimiento por clic o tap',
);

console.log('M13 no click movement tests: OK');
