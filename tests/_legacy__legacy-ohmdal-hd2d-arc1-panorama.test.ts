// Test de regresión del panorama HD-2D del Arco I.
//
// Las 20 salas del arco se sirven desde `createBasicUnitKit` en modo `'greybox'`
// (todas las 7 unidades: las 3 de U1 y las 4 de U2–U5). Este test verifica que las
// 7 unidades y las 20 sub-salas están montadas, son navegables, y los anclajes de
// cámara están definidos. Es el test de humo del panorama: si pasa, el jugador
// puede caminar las 20 salas del arco en `/ohmdal`.

import * as THREE from 'three';
import { createOhmdalBlockout } from '../src/ohmdal/architecture/blockout.ts';
import {
  ARCHITECTURE_SOCKETS,
  BASIC_UNITS,
  BOX_MODULES,
  COLLIDERS,
  LEVEL_ZONES,
  ROUTE_ANCHORS,
} from '../src/ohmdal/architecture/index.ts';
import { routeAnchor } from '../src/ohmdal/architecture/levelData.ts';
import { CAMERA_ANCHORS } from '../src/ohmdal/camera/cameraConfig.ts';
import {
  isNavigable,
  isOnGameplayPlane,
  validateNavigation,
} from '../src/ohmdal/navigation/navigation.ts';

function inAnyRegion(point: { x: number; y: number; z: number }): boolean {
  return LEVEL_ZONES.some(({ bounds }) => (
    point.x >= bounds.minX && point.x <= bounds.maxX
      && point.z >= bounds.minZ && point.z <= bounds.maxZ
  ));
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const blockout = createOhmdalBlockout(new THREE.Scene());
const visualNames = blockout.visualLayer.children.map((child) => child.name);

assert(BASIC_UNITS.length === 7, 'siete unidades: Plaza, Taller, Puerta, Castillo, Forja, Terrazas, Faro');
const totalSubRooms = BASIC_UNITS.reduce((acc, unit) => acc + unit.subRooms.length, 0);
assert(totalSubRooms === 20, 'veinte sub-salas repartidas en las siete unidades');
const roomNames = new Set<string>();
for (const unit of BASIC_UNITS) {
  for (const sub of unit.subRooms) {
    assert(!roomNames.has(sub.id), `${sub.id} es único en el arco`);
    roomNames.add(sub.id);
  }
}
assert(roomNames.size === 20, 'las 20 salas del arco tienen identificadores únicos');

// Cada kit entra a la capa visual con su nombre canónico en mayúsculas.
for (const unit of BASIC_UNITS) {
  const expected = `${unit.id.toUpperCase()}_KIT`;
  assert(visualNames.includes(expected), `${expected} está montado en la capa visual`);
}

// Los nombres de kit coinciden con los del manifiesto y con los `landmarkId` de las zonas.
for (const existing of ['PLAZA_KIT', 'TALLER_KIT', 'PUERTA_KIT', 'CASTLE_KIT', 'FORGE_KIT', 'TERRACES_KIT', 'LIGHTHOUSE_KIT']) {
  assert(visualNames.includes(existing), `${existing} está montado en la capa visual`);
}

// Las 7 unidades (U1 + U2–U5) corren en modo `'greybox'`: piso plano, sin texturas, sin
// relieve, sin junta. El reparto se valida explícitamente para que nadie invierta el modo
// por descuido. El modo `'kit'` se restaura por hito de producción, no en este milestone.
for (const unit of BASIC_UNITS) {
  assert(unit.style === 'greybox', `${unit.id} corre en modo greybox`);
}

const navigationIssues = validateNavigation();
assert(navigationIssues.length === 0, `navegación plana: ${navigationIssues.join(', ')}`);

// Cada socket nuevo tiene punto en una zona de navegación: la superposición de 1.5 m
// en los bordes lo garantiza. Si falla esto, alguien movió una zona sin actualizar el
// socket (o viceversa). Mismo criterio que `validateNavigation`: que esté en una región
// de navegación (no necesariamente libre de colliders — los pedestales y monumentos
// son geometría intencional, no bugs).
for (const socket of ARCHITECTURE_SOCKETS) {
  assert(isOnGameplayPlane(socket.position), `${socket.id} permanece en Y=0`);
  assert(inAnyRegion(socket.position), `${socket.id} está dentro de una zona navegable`);
}

// Anclajes de cámara: 7 en total. Las 4 unidades de U2–U5 tienen su ancla propia.
for (const anchorId of ['C4_CASTLE', 'C5_FORGE', 'C6_TERRACES', 'C7_LIGHTHOUSE'] as const) {
  const anchor = CAMERA_ANCHORS[anchorId];
  assert(anchor !== undefined, `${anchorId} está declarado`);
  assert(anchor.focus.y > 0, `${anchorId} mira desde arriba del suelo`);
}

// Cada unidad expone su landmark en la capa visual con el nombre canónico.
for (const unit of BASIC_UNITS) {
  const landmarkId = `${unit.id.toUpperCase()}_KIT`;
  assert(visualNames.includes(landmarkId), `${unit.id} expone su landmark ${landmarkId}`);
}

// Recorrido de extremo a extremo: el jugador puede pararse en la entrada de cada una
// de las 7 unidades y el resultado de `isNavigable` no falla. La función la usa el HUD
// para pintar la zona activa. Se eligen anclas de ruta (no centros geométricos) porque
// algunos landmarks centrales —el pedestal de Ohm, el tazón del Manantial— ocupan el
// centro de la huella y harían fallar la aserción aunque la unidad sea perfectamente
// transitable.
const SAMPLE_ANCHORS: Readonly<Record<string, string>> = {
  plaza: 'R0_PORTAL_SPAWN',
  taller: 'R3_TALLER_THRESHOLD',
  puerta: 'R5_DOOR_APPROACH',
  castle: 'R10_CASTLE_GATE',
  forge: 'R15_FORGE_YARD',
  terraces: 'R20_TERRACES_LOW',
  lighthouse: 'R25_FARO_HALL',
};
for (const [unitId, anchorId] of Object.entries(SAMPLE_ANCHORS)) {
  const point = routeAnchor(anchorId as never).position;
  assert(isNavigable(point), `ancla de entrada de ${unitId} (${anchorId} en (${point.x}, ${point.z})) es navegable`);
}

void LEVEL_ZONES;
void ROUTE_ANCHORS;
void BOX_MODULES;
void COLLIDERS;

blockout.dispose();
console.log('Ohmdal HD-2D Arco I panorama (20 salas): OK');
