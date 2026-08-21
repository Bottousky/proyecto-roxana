/**
 * R7 — regresión del bloqueo en un exit sellado.
 *
 * El Player Agent reprodujo que el cuerpo podía quedar dentro del trigger
 * de una puerta trabada y reabrir el diálogo al intentar retirarse. Phaser no
 * es importable en este runner Node; este test verifica el wiring runtime
 * exacto sobre el fuente, siguiendo el patrón de rt0/r5/r6.
 */

import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const retreat = scene.match(
  /private retreatFromBlockedExit\([^)]*\): void \{[\s\S]*?\n  \}/,
)?.[0] ?? '';
assert(retreat.length > 0, 'existe retreatFromBlockedExit');
assert(retreat.includes('clampLocal(this.activeRoom, previousLocal)'), 'parte de la posición local previa');
assert(retreat.includes('this.collidesLocal(retreat.x, retreat.y)'), 'valida que el retiro sea legal');
assert(retreat.includes('this.activeRoom.playerLocal = retreat'), 'sincroniza ActiveRoom');
assert(retreat.includes('this.player.setPosition(retreat.x, retreat.y)'), 'sincroniza el sprite local');
assert(retreat.includes('this.velX = 0') && retreat.includes('this.velY = 0'), 'corta la inercia hacia el sello');

const updateStart = scene.indexOf('  update(time: number, delta: number): void {');
const updateEnd = scene.indexOf('\n  // ─────────────────────────────────', updateStart);
assert(updateStart >= 0 && updateEnd > updateStart, 'se pudo aislar update()');
const update = scene.slice(updateStart, updateEnd);
assert(update.includes('const previousLocal = { ...this.activeRoom.playerLocal };'), 'captura el punto previo antes de mover');
assert(
  /const outcome = this\.requestRoomTransition\(trig\.exitId\);\s*if \(outcome === 'blocked'\) this\.retreatFromBlockedExit\(previousLocal\);/.test(update),
  'un exitTrigger bloqueado restaura el retiro legal',
);
assert(
  /const lockedLines = d\.def\.locked\?\.\(\) \?\? null;\s*if \(lockedLines\) \{\s*this\.retreatFromBlockedExit\(previousLocal\);/.test(update),
  'el feedback del sello local usa el mismo retiro',
);

console.log('R7 blocked exit retreat tests: OK');
