import {
  ARCHITECTURE_SOCKETS,
  BOX_MODULES,
  COLLIDERS,
  GAMEPLAY_PLANE_Y,
  LEVEL_SEED,
  LEVEL_ZONES,
  MANNEQUIN_HEIGHT_METERS,
  ROUTE_ANCHORS,
} from '../src/labs/ohmdal-hd2d-preprod/architecture/levelData.ts';
import {
  FIXED_STEP_SECONDS,
  canonicalRouteHash,
  isOnGameplayPlane,
  moveOnGameplayPlane,
  validateNavigation,
} from '../src/labs/ohmdal-hd2d-preprod/navigation/navigation.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function close(actual: number, expected: number, tolerance: number, message: string): void {
  assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

assert(LEVEL_SEED === 'ohmdal-hd2d-preprod-v1', 'la seed contractual permanece estable');
assert(GAMEPLAY_PLANE_Y === 0, 'el origen vertical esta en el suelo');
assert(MANNEQUIN_HEIGHT_METERS === 1.72, 'el maniqui contractual mide 1,72 m');
assert(FIXED_STEP_SECONDS === 1 / 60, 'la ruta usa paso fijo de 1/60 s');

for (const module of BOX_MODULES) {
  assert(module.pivotY === GAMEPLAY_PLANE_Y, `${module.id} conserva pivote en el suelo`);
  assert(module.width > 0 && module.height > 0 && module.depth > 0, `${module.id} tiene dimensiones metricas positivas`);
}
for (const collider of COLLIDERS) {
  assert(collider.planeY === GAMEPLAY_PLANE_Y, `${collider.id} nace en el plano jugable`);
}
for (const anchor of ROUTE_ANCHORS) {
  assert(isOnGameplayPlane(anchor.position), `${anchor.id} permanece en Y=0`);
}
for (const socket of ARCHITECTURE_SOCKETS) {
  assert(isOnGameplayPlane(socket.position), `${socket.id} permanece en Y=0`);
  assert(socket.width >= 3, `${socket.id} conserva paso legible`);
}
for (const zone of LEVEL_ZONES) {
  assert(BOX_MODULES.some((module) => module.id === zone.landmarkId), `${zone.id} declara un landmark visible`);
}

const navigationIssues = validateNavigation();
assert(navigationIssues.length === 0, `la navegacion plana pasa: ${navigationIssues.join(', ')}`);
assert(canonicalRouteHash() === 'be242e48', 'la ruta y las acciones tienen hash determinista');

const start = { x: -10, y: 0, z: 0 };
const moved = moveOnGameplayPlane(start, { x: 1, z: 1 }, 0.05, 2);
close(Math.hypot(moved.x - start.x, moved.z - start.z), 0.1, 0.000001, 'la diagonal no acelera');

console.log('Ohmdal HD-2D architecture layout/navigation: OK');
