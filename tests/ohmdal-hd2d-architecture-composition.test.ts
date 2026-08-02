import * as THREE from 'three';
import { createOhmdalBlockout } from '../src/labs/ohmdal-hd2d-preprod/architecture/blockout.ts';
import {
  BOX_MODULES,
  routeAnchor,
} from '../src/labs/ohmdal-hd2d-preprod/architecture/levelData.ts';
import {
  CAMERA_ANCHORS,
  CAMERA_RIGHT,
  CAMERA_VIEW_OFFSET,
  C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS,
} from '../src/labs/ohmdal-hd2d-preprod/camera/cameraConfig.ts';
import { AuthorCameraController } from '../src/labs/ohmdal-hd2d-preprod/camera/cameraController.ts';
import {
  CameraOcclusionController,
  findBlockedOccluderIds,
} from '../src/labs/ohmdal-hd2d-preprod/camera/occlusion.ts';

interface ScreenRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function moduleById(id: string) {
  const module = BOX_MODULES.find((candidate) => candidate.id === id);
  if (!module) throw new Error(`Missing module ${id}`);
  return module;
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
const portalArch = moduleById('portal-arch');
const doorFrame = moduleById('ohm-door-frame');
assert(portalArch.depth / portalArch.width >= 4, 'Portal conserva dintel profundo transversal');
assert(doorFrame.width / doorFrame.depth >= 6, 'Puerta usa brazo tecnico longitudinal en L');
assert(moduleById('portal-pier-north').height - moduleById('portal-pier-south').height >= 1.5, 'Portal tiene ruina asimetrica');
assert(moduleById('door-pier-north').height - moduleById('door-pier-south').height >= 1.5, 'Puerta escalona sus pilares tecnicos');

const workshopFloor = moduleById('workshop-floor');
const workshopRoofs = [moduleById('workshop-roof-low'), moduleById('workshop-roof-high')];
const roofFootprint = workshopRoofs.reduce((area, roof) => area + roof.width * roof.depth, 0);
assert(roofFootprint / (workshopFloor.width * workshopFloor.depth) < 0.26, 'techos ocupan menos del 26% de la planta del Taller');
assert(workshopRoofs.every((roof) => roof.tags.includes('landmark') && roof.tags.includes('cameraRoof')), 'Taller conserva sawtooth y fade aun con menor masa');
assert(moduleById('workshop-wall-front-west').width + moduleById('workshop-wall-front-east').width <= 5, 'pilares de foreground dejan un vano dominante');

const blockout = createOhmdalBlockout();
blockout.root.updateMatrixWorld(true);
assert(blockout.diagnostics().visualMeshCount === 19, 'la diferenciacion no aumenta modulos visibles');

// C3 casi ortografica tiene un encuadre propio; perspectiva permanece congelada.
assert(C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS.right === 0.24, 'C3 reduce de forma explicita el componente lateral');
const routeEnd = routeAnchor('R9_SPRING_EDGE').position;
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

// Caja aparente del sprite final versus pilar sur: no hay solapamiento aun con blockedIds vacio.
const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(quasi.camera.quaternion);
const studentPoints: THREE.Vector3[] = [];
for (const y of [0, 2]) {
  for (const side of [-0.75, 0.75]) {
    studentPoints.push(new THREE.Vector3(routeEnd.x, y, routeEnd.z).addScaledVector(cameraRight, side));
  }
}
const southPier = blockout.visualLayer.getObjectByName('door-pier-south');
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
assert(workshopBlocked.has('workshop-roof-low'), 'Lumen/Ohm protegidos activan fade del techo que los cruza');
const roofBinding = blockout.occlusionBindings.find(({ id }) => id === 'workshop-roof-low');
assert(roofBinding !== undefined, 'el techo bajo tiene binding estable');
const roofMaterial = (roofBinding.object.children[0] as THREE.Mesh).material as THREE.Material & { opacity: number };
const occlusion = new CameraOcclusionController([roofBinding]);
occlusion.update(workshopBlocked, 1 / 60, true);
occlusion.update(workshopBlocked, 1 / 60, true);
assert(roofMaterial.opacity === 0.18, 'sockets adicionales aplican fade despues de dos frames');
for (let index = 0; index < 6; index += 1) occlusion.update(new Set(), 1 / 60, true);
assert(roofMaterial.opacity === 1, 'techo recupera opacidad luego de seis frames libres');

occlusion.dispose();
workshopCamera.dispose();
mobileQuasi.dispose();
perspective.dispose();
quasi.dispose();
blockout.dispose();

console.log('Ohmdal HD-2D architecture composition/protected sockets: OK');
