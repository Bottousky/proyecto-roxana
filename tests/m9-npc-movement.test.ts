import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');

const hiddenTransition = scene.indexOf('if (st.visible && !st.visible())');
const actorDeduplication = scene.indexOf('if (actor && this.activeActorChunks.get(actor) !== id) continue;', hiddenTransition);

assert(hiddenTransition >= 0, 'la escena detecta actores que dejan de ser visibles');
assert(
  actorDeduplication > hiddenTransition,
  'la salida caminando se resuelve antes de descartar al actor de su sala anterior',
);
assert(
  scene.includes('this.navigationPath({ x: t.x, y: t.y }, { x: dx, y: dy })'),
  'los NPC que salen siguen un camino navegable hasta la puerta',
);

const playerSpeed = Number(scene.match(/PLAYER_MOVE_SPEED = (\d+)/)?.[1]);
const npcSpeed = Number(scene.match(/NPC_MOVE_SPEED = (\d+)/)?.[1]);
assert(playerSpeed >= 150 && playerSpeed <= 180, 'el jugador conserva un ritmo pausado de RPG');
assert(npcSpeed >= 120 && npcSpeed < playerSpeed, 'los NPC caminan con calma y algo mas lento que el jugador');

console.log('M9 NPC movement tests: OK');
