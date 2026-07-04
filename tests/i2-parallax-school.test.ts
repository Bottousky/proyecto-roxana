import {
  HALL_WIDTH,
  PLAYER_MAX_X,
  PLAYER_MIN_X,
  hallCameraX,
  moveHallPlayer,
  nearestHallHotspot,
  parallaxX,
  walkTowardHallTarget,
} from '../src/experiences/instituto/parallaxModel.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

assert(moveHallPlayer(PLAYER_MIN_X, -1, 10) === PLAYER_MIN_X, 'respeta límite izquierdo');
assert(moveHallPlayer(PLAYER_MAX_X, 1, 10) === PLAYER_MAX_X, 'respeta límite derecho');
assert(nearestHallHotspot(670)?.id === 'estatua', 'detecta estatua');
assert(nearestHallHotspot(1300)?.id === 'escalera', 'detecta escalera dentro del radio');
assert(nearestHallHotspot(1400) === null, 'fuera de hotspots devuelve null');
assert(hallCameraX(0, 1000) === 0, 'cámara limita a la izquierda');
assert(hallCameraX(HALL_WIDTH, 1000) === HALL_WIDTH - 1000, 'cámara limita a la derecha');
assert(Math.abs(parallaxX(400, 0.2)) < Math.abs(parallaxX(400, 0.8)), 'fondo se mueve más lento');
assert(walkTowardHallTarget(100, 110, 1) === 110, 'el clic no sobrepasa el destino');
assert(walkTowardHallTarget(500, 200, 0.1) < 500, 'camina hacia un destino a la izquierda');

console.log('I2 parallax school tests: OK');
