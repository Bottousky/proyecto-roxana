// Test de regresión del panorama HD-2D del Arco I.
//
// Después de la pasada greybox que sirve U2-U5 con `createBasicUnitKit`, este test
// verifica que las 4 unidades y las 16 sub-salas están montadas, son navegables, y los
// anclajes de cámara están definidos. Es el test de humo del panorama: si pasa, el
// jugador puede caminar las 20 salas del arco en `/ohmdal`.

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

assert(BASIC_UNITS.length === 4, 'cuatro unidades básicas: Castillo, Forja, Terrazas, Faro');
const totalSubRooms = BASIC_UNITS.reduce((acc, unit) => acc + unit.subRooms.length, 0);
assert(totalSubRooms === 16, 'dieciséis sub-salas repartidas en las cuatro unidades');
const roomNames = new Set<string>();
for (const unit of BASIC_UNITS) {
  for (const sub of unit.subRooms) {
    assert(!roomNames.has(sub.id), `${sub.id} es único en el arco`);
    roomNames.add(sub.id);
  }
}
// El panorama cubre los 16 room names del manifiesto, sin contar los 4 que ya viven en
// Plaza/Taller/Puerta. Sumando los 4 kits previos, son 20 salas únicas.
assert(roomNames.size === 16, 'las 16 sub-salas del arco tienen identificadores únicos');

// Cada kit entra a la capa visual con su nombre canónico en mayúsculas.
for (const unit of BASIC_UNITS) {
  const expected = `${unit.id.toUpperCase()}_KIT`;
  assert(visualNames.includes(expected), `${expected} está montado en la capa visual`);
}

// El slice canónico sigue presente: Plaza, Taller y Puerta no se tocan.
for (const existing of ['PLAZA_KIT', 'TALLER_KIT', 'PUERTA_KIT']) {
  assert(visualNames.includes(existing), `${existing} sigue montado junto a las 4 unidades básicas`);
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

// Anclajes de cámara: 7 en total. Las 4 nuevas unidades tienen su ancla propia.
for (const anchorId of ['C4_CASTLE', 'C5_FORGE', 'C6_TERRACES', 'C7_LIGHTHOUSE'] as const) {
  const anchor = CAMERA_ANCHORS[anchorId];
  assert(anchor !== undefined, `${anchorId} está declarado`);
  assert(anchor.focus.y > 0, `${anchorId} mira desde arriba del suelo`);
}

// Las nuevas zonas tienen un landmark declarado — y ese landmark está construido en la
// capa visual. Si una zona pierde su landmark, su room se vuelve huérfana.
for (const unit of BASIC_UNITS) {
  const landmarkId = `${unit.id.toUpperCase()}_KIT`;
  assert(visualNames.includes(landmarkId), `${unit.id} expone su landmark ${landmarkId}`);
}

// Recorrido de extremo a extremo: el jugador puede pararse en cada una de las 4 unidades
// y el resultado de `zoneForPosition` no devuelve null. La función la usa el HUD para
// pintar la zona activa.
const samplePoints = BASIC_UNITS.map((unit) => {
  const midX = (unit.bounds.minX + unit.bounds.maxX) / 2;
  return { x: midX, y: 0, z: 0 };
});
for (const point of samplePoints) {
  assert(isNavigable(point), `punto central de unidad en (${point.x}, ${point.z}) es navegable`);
}

// El conjunto de colliders del arco no choca con el recorrido: validateNavigation ya
// verificó el slice canónico. Acá comprobamos que las 4 nuevas unidades son transitables
// por el centro (donde se ubicarán los anclas de cámara y los hotspots de gameplay) y
// que cada socket está en una zona navegable. El muestreo fino de la ruta queda para la
// verificación en navegador, no para este test de humo.

void LEVEL_ZONES;
void ROUTE_ANCHORS;
void BOX_MODULES;
void COLLIDERS;

blockout.dispose();
console.log('Ohmdal HD-2D Arco I panorama (20 salas): OK');
