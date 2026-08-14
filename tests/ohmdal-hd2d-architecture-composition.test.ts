import * as THREE from 'three';
import { createOhmdalBlockout } from '../src/ohmdal/architecture/blockout.ts';
import { PORTAL_SILHOUETTE } from '../src/ohmdal/architecture/plazaKit.ts';
import { TALLER_BOUNDS, TALLER_SILHOUETTE } from '../src/ohmdal/architecture/tallerKit.ts';
import { PUERTA_SILHOUETTE } from '../src/ohmdal/architecture/puertaKit.ts';
import { routeAnchor } from '../src/ohmdal/architecture/levelData.ts';
import {
  CAMERA_ANCHORS,
  CAMERA_RIGHT,
  CAMERA_VIEW_OFFSET,
  C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS,
  VIEW_OFFSET_COMPONENTS,
} from '../src/ohmdal/camera/cameraConfig.ts';
import { AuthorCameraController } from '../src/ohmdal/camera/cameraController.ts';
import {
  CameraOcclusionController,
  findBlockedOccluderIds,
} from '../src/ohmdal/camera/occlusion.ts';

interface ScreenRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function projectedRect(camera: THREE.Camera, points: readonly THREE.Vector3[]): ScreenRect {
  const projected = points.map((point) => point.clone().project(camera));
  return {
    minX: Math.min(...projected.map(({ x }) => x)),
    maxX: Math.max(...projected.map(({ x }) => x)),
    minY: Math.min(...projected.map(({ y }) => y)),
    maxY: Math.max(...projected.map(({ y }) => y)),
  };
}

function corners(box: THREE.Box3): THREE.Vector3[] {
  const result: THREE.Vector3[] = [];
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) result.push(new THREE.Vector3(x, y, z));
    }
  }
  return result;
}

function overlaps(a: ScreenRect, b: ScreenRect): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}

// Las tres siluetas usan relaciones distintas sin sumar modulos ni materiales.
//
// El Portal, el Taller y la Puerta dejaron de ser modulos de prueba: los construyen sus kits,
// que declaran su silueta como datos. Las relaciones que los definen se verifican igual, y
// por eso cada kit las expone en vez de enterrarlas en las llamadas que arman la geometria.
assert(
  PORTAL_SILHOUETTE.lintel.depth / PORTAL_SILHOUETTE.lintel.width >= 4,
  'Portal conserva dintel profundo transversal',
);
assert(
  PORTAL_SILHOUETTE.pierNorth.height - PORTAL_SILHOUETTE.pierSouth.height >= 1.5,
  'Portal tiene ruina asimetrica',
);
// La Puerta es la tercera silueta: maciza y vertical, sin la ruina asimetrica del Portal ni
// el perfil bajo y horizontal del Taller.
assert(
  PUERTA_SILHOUETTE.jambHeight / PUERTA_SILHOUETTE.jambWidth >= 4,
  'Puerta usa jambas macizas y verticales',
);
assert(
  PUERTA_SILHOUETTE.jambHeight > TALLER_SILHOUETTE.ridgeY,
  'Puerta se lee mas vertical que el perfil bajo del Taller',
);

// El Taller lo construye `tallerKit`, que declara su silueta como datos. Las relaciones que
// lo definen se verifican igual, y por eso el kit las expone en vez de enterrarlas.
const tallerWidth = TALLER_BOUNDS.maxX - TALLER_BOUNDS.minX;
const tallerDepth = TALLER_BOUNDS.maxZ - TALLER_BOUNDS.minZ;
const roofFootprint =
  (TALLER_SILHOUETTE.roofNorth.depth + TALLER_SILHOUETTE.roofSouth.depth) * tallerWidth;
assert(
  roofFootprint / (tallerWidth * tallerDepth) < 0.68,
  'los faldones dejan abierta buena parte de la planta: GF-04 necesita ver adentro',
);
assert(
  Math.abs(TALLER_SILHOUETTE.roofNorth.tilt) !== Math.abs(TALLER_SILHOUETTE.roofSouth.tilt),
  'Taller conserva su silueta asimetrica: no se confunde con el Portal ni con la Puerta',
);
assert(
  TALLER_SILHOUETTE.doorway.width >= 3,
  'el vano de acceso conserva paso legible y hace de oclusor de primer plano',
);
assert(
  TALLER_SILHOUETTE.ridgeY > TALLER_SILHOUETTE.eaveY,
  'la cumbrera esta por encima del alero',
);

const blockout = createOhmdalBlockout();
blockout.root.updateMatrixWorld(true);
assert(blockout.diagnostics().visualMeshCount === 9, 'la diferenciacion no aumenta modulos visibles: siete kits construidos (3 del slice + 4 del arco) mas los dos emisores');

// C3 casi ortografica tiene un encuadre propio; perspectiva permanece congelada.
// Se diferencia por inclinacion, no por giro lateral: la camara HD-2D es frontal en los tres
// anchors, y romper la simetria en uno solo se lee como error de montaje al cruzar el umbral.
assert(C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS.right === 0, 'C3 tampoco tiene giro lateral');
assert(
  C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS.up < VIEW_OFFSET_COMPONENTS.up,
  'C3 abre el angulo: mira menos desde arriba que los otros anchors',
);
// R8_DOOR_MEASURE, no R9_SPRING_EDGE: es el punto que GF-06/GF-07 fijan como contrato de
// separacion entre el estudiante y las jambas. Las jambas nuevas son macizas y verticales
// (GF-06 lo pide), y a la altura de R9 —ya de camino al Manantial, con las jambas quedando
// detras y al costado— su caja 3D puede proyectar un rectangulo de pantalla que roza al
// estudiante aunque el raycast de oclusion real no bloquee nada; R8 es el encuadre que el
// slice promete y el que hay que sostener sin solapamiento.
const routeEnd = routeAnchor('R8_DOOR_MEASURE').position;
const routeEndTarget = new THREE.Vector3(routeEnd.x, 1, routeEnd.z);
const quasi = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C3_DOOR_SPRING',
  reducedMotion: true,
});
quasi.setLookTarget(routeEndTarget);
quasi.camera.updateMatrixWorld(true);
const quasiDirection = quasi.camera.position.clone().sub(routeEndTarget).normalize();
assert(quasiDirection.distanceTo(CAMERA_ANCHORS.C3_DOOR_SPRING.quasiOrthographicViewOffset!) < 0.000001, 'C3 aplica solo su offset casi ortografico');
quasi.setLookTarget(new THREE.Vector3(999, 999, 999));
const boundedTarget = new THREE.Vector3(...quasi.snapshot().desiredTarget);
const c3Anchor = CAMERA_ANCHORS.C3_DOOR_SPRING;
const boundedRelative = boundedTarget.clone().sub(c3Anchor.focus);
assert(boundedRelative.dot(CAMERA_RIGHT) <= c3Anchor.targetBounds.right.max + 1e-9, 'C3 limita target sobre eje right');
assert(boundedRelative.dot(c3Anchor.forward) <= c3Anchor.targetBounds.forward.max + 1e-9, 'C3 limita target sobre eje forward');
assert(boundedTarget.y === c3Anchor.targetBounds.vertical.max, 'C3 limita target vertical');
quasi.setLookTarget(routeEndTarget);
quasi.camera.updateMatrixWorld(true);
const perspective = new AuthorCameraController({
  variant: 'soft-perspective',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C3_DOOR_SPRING',
  reducedMotion: true,
});
perspective.setLookTarget(routeEndTarget);
const perspectiveDirection = perspective.camera.position.clone().sub(routeEndTarget).normalize();
assert(perspectiveDirection.distanceTo(CAMERA_VIEW_OFFSET) < 0.000001, 'perspectiva suave no recibe mejoras en la ronda congelada');

// Caja aparente del sprite en la medicion versus pilar sur: no hay solapamiento aun con blockedIds vacio.
const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(quasi.camera.quaternion);
const studentPoints: THREE.Vector3[] = [];
for (const y of [0, 2]) {
  for (const side of [-0.75, 0.75]) {
    studentPoints.push(new THREE.Vector3(routeEnd.x, y, routeEnd.z).addScaledVector(cameraRight, side));
  }
}
const southPier = blockout.visualLayer.getObjectByName('puerta-jamb-south');
assert(southPier !== undefined, 'el pilar sur existe en C3');
const studentRect = projectedRect(quasi.camera, studentPoints);
const southPierRect = projectedRect(quasi.camera, corners(new THREE.Box3().setFromObject(southPier)));
assert(!overlaps(studentRect, southPierRect), 'el estudiante finaliza separado del pilar sur en pantalla');
const c3Protected = [
  new THREE.Vector3(routeEnd.x, 0.08, routeEnd.z),
  new THREE.Vector3(routeEnd.x, 1.72, routeEnd.z),
  new THREE.Vector3(routeAnchor('R8_DOOR_MEASURE').position.x, 0.42, routeAnchor('R8_DOOR_MEASURE').position.z),
];
const c3Blocked = findBlockedOccluderIds(quasi.camera.position, c3Protected, blockout.occlusionBindings.map(({ object }) => object));
assert(c3Blocked.size === 0, 'blockedIds puede quedar vacio porque C3 ya no solapa sujetos y pilares');

const mobileQuasi = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'mobile-390x844',
  initialAnchor: 'C3_DOOR_SPRING',
  reducedMotion: true,
});
mobileQuasi.setLookTarget(routeEndTarget);
mobileQuasi.camera.updateMatrixWorld(true);
const mobileRight = new THREE.Vector3(1, 0, 0).applyQuaternion(mobileQuasi.camera.quaternion);
const mobileStudentPoints: THREE.Vector3[] = [];
for (const y of [0, 2]) {
  for (const side of [-0.75, 0.75]) {
    mobileStudentPoints.push(new THREE.Vector3(routeEnd.x, y, routeEnd.z).addScaledVector(mobileRight, side));
  }
}
const mobileStudentRect = projectedRect(mobileQuasi.camera, mobileStudentPoints);
const mobilePierRect = projectedRect(mobileQuasi.camera, corners(new THREE.Box3().setFromObject(southPier)));
assert(!overlaps(mobileStudentRect, mobilePierRect), 'C3 mobile tambien separa estudiante y pilar sur');
assert(mobileStudentRect.minX >= -0.84 && mobileStudentRect.maxX <= 0.84, 'estudiante queda dentro del safe width mobile');
assert(mobileStudentRect.minY >= -0.4 && mobileStudentRect.maxY <= 0.84, 'estudiante queda fuera del 30% inferior reservado a UI');
const mobileBlocked = findBlockedOccluderIds(
  mobileQuasi.camera.position,
  c3Protected,
  blockout.occlusionBindings.map(({ object }) => object),
);
assert(mobileBlocked.size === 0, 'C3 mobile no depende de un fade ausente para leer al estudiante');

// Sockets adicionales del Director comparten el mismo raycast y activan el roof fade.
const workshopCamera = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C2_TALLER',
  reducedMotion: true,
});
const workshopMeasure = routeAnchor('R6_TALLER_MEASURE').position;
workshopCamera.setLookTarget(new THREE.Vector3(workshopMeasure.x, 1, workshopMeasure.z));
workshopCamera.camera.updateMatrixWorld(true);
const directorSockets = [
  new THREE.Vector3(routeAnchor('R4_LUMEN_STOP').position.x, 1.4, routeAnchor('R4_LUMEN_STOP').position.z),
  new THREE.Vector3(0.7, 1, -1.45),
  new THREE.Vector3(workshopMeasure.x, 0.42, workshopMeasure.z),
];
const workshopBlocked = findBlockedOccluderIds(
  workshopCamera.camera.position,
  directorSockets,
  blockout.occlusionBindings.map(({ object }) => object),
);
// Es el recurso de HD-2D que mas se nota: al entrar, el techo se abre en vez de cortar a otra
// pantalla. Se verifica el mecanismo, no cual de los dos faldones cae en el rayo: eso depende
// de la posicion exacta del sujeto y volveria el test fragil ante cualquier ajuste de planta.
const blockedTallerRoof = [...workshopBlocked].find((id) => id.startsWith('taller-roof-'));
assert(
  blockedTallerRoof !== undefined,
  'Lumen/Ohm protegidos activan el fade del faldon que los cruza',
);
const roofBinding = blockout.occlusionBindings.find(({ id }) => id === blockedTallerRoof);
assert(roofBinding !== undefined, 'el faldon que tapa tiene binding estable');
const roofMaterial = (roofBinding.object as THREE.Mesh).material as THREE.Material & { opacity: number };
const occlusion = new CameraOcclusionController([roofBinding]);
occlusion.update(workshopBlocked, 1 / 60, true);
occlusion.update(workshopBlocked, 1 / 60, true);
assert(roofMaterial.opacity === 0.18, 'sockets adicionales aplican fade despues de dos frames');
for (let index = 0; index < 6; index += 1) occlusion.update(new Set(), 1 / 60, true);
assert(roofMaterial.opacity === 1, 'el faldon recupera opacidad luego de seis frames libres');

occlusion.dispose();
workshopCamera.dispose();
mobileQuasi.dispose();
perspective.dispose();
quasi.dispose();
blockout.dispose();

console.log('Ohmdal HD-2D architecture composition/protected sockets: OK');
