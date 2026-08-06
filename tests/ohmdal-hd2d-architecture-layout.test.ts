import {
  ARCHITECTURE_SOCKETS,
  BOX_MODULES,
  COLLIDERS,
  GAMEPLAY_PLANE_Y,
  LEVEL_SEED,
  LEVEL_ZONES,
  MANNEQUIN_HEIGHT_METERS,
  ROUTE_ANCHORS,
} from '../src/ohmdal/architecture/levelData.ts';
import {
  FIXED_STEP_SECONDS,
  canonicalRouteHash,
  isOnGameplayPlane,
  moveOnGameplayPlane,
  validateNavigation,
} from '../src/ohmdal/navigation/navigation.ts';

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
// Cada zona nombra su silueta dominante. La Plaza ya no la declara como modulo de prueba: la
// construye `plazaKit`, asi que su landmark es el nodo que el kit publica en la escena.
const KIT_LANDMARKS = new Set(['PLAZA_PORTAL_GATE', 'TALLER_KIT']);
for (const zone of LEVEL_ZONES) {
  const declared = BOX_MODULES.some((module) => module.id === zone.landmarkId)
    || KIT_LANDMARKS.has(zone.landmarkId);
  assert(declared, `${zone.id} declara un landmark visible`);
}
const doorFrame = BOX_MODULES.find((module) => module.id === 'ohm-door-frame');
assert(doorFrame?.tags.includes('landmark') === true, 'el marco de la Puerta conserva jerarquia de landmark');
assert(doorFrame?.tags.includes('cameraOccluder') === false, 'el landmark de Puerta no participa del fade');
for (const pierId of ['door-pier-north', 'door-pier-south']) {
  const pier = BOX_MODULES.find((module) => module.id === pierId);
  assert(pier?.tags.includes('cameraOccluder') === true, `${pierId} puede despejar sujetos protegidos`);
  assert(pier?.tags.includes('landmark') === false, `${pierId} no suplanta el landmark dominante`);
}

const navigationIssues = validateNavigation();
assert(navigationIssues.length === 0, `la navegacion plana pasa: ${navigationIssues.join(', ')}`);
// El hash cambio con la Plaza construida: R1_PLAZA_ENTRY se corrio a z = -3,2 porque el eje
// z = 0 lo ocupan ahora el pedestal y el monumento de la campana. El recorrido paso de 38,05 m
// a 38,49 m y de 19,03 s a 19,25 s. Ver levelData.ts y docs/arco1/route-timing.json.
assert(canonicalRouteHash() === '9c7e30ea', 'la ruta y las acciones tienen hash determinista');

const start = { x: -10, y: 0, z: 0 };
const moved = moveOnGameplayPlane(start, { x: 1, z: 1 }, 0.05, 2);
close(Math.hypot(moved.x - start.x, moved.z - start.z), 0.1, 0.000001, 'la diagonal no acelera');

console.log('Ohmdal HD-2D architecture layout/navigation: OK');
