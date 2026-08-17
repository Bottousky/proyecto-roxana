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

// Las tres siluetas usan relaciones distintas sin sumar modulos ni materiales.
//
// El Portal, el Taller y la Puerta dejaron de ser modulos de prueba: los construye
// `createBasicUnitKit` en modo `'greybox'`, y los datos de silueta que cada kit a mano
// exportaba siguen siendo la fuente de verdad de las proporciones canonicas. Las
// relaciones que los definen se verifican igual, y por eso las constantes
// `PORTAL_SILHOUETTE`, `TALLER_SILHOUETTE` y `PUERTA_SILHOUETTE` se exponen desde los
// archivos de los kits aunque ya no se monten en escena.
assert(
  PORTAL_SILHOUETTE.lintel.depth / PORTAL_SILHOUETTE.lintel.width >= 4,
  'Portal conserva dintel profundo transversal',
);
assert(
  PORTAL_SILHOUETTE.pierNorth.height - PORTAL_SILHOUETTE.pierSouth.height >= 1.5,
  'Portal tiene ruina asimetrica',
);
assert(
  PUERTA_SILHOUETTE.jambHeight / PUERTA_SILHOUETTE.jambWidth >= 4,
  'Puerta usa jambas macizas y verticales',
);
assert(
  PUERTA_SILHOUETTE.jambHeight > TALLER_SILHOUETTE.ridgeY,
  'Puerta se lee mas vertical que el perfil bajo del Taller',
);

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
assert(blockout.diagnostics().visualMeshCount === 10, 'siete kits + dos emisores + grupo de arcos de socket (6 arcos)');

// C3 casi ortografica tiene un encuadre propio; perspectiva permanece congelada.
// Se diferencia por inclinacion, no por giro lateral: la camara HD-2D es frontal en los
// anchors, y romper la simetria en uno solo se lee como error de montaje al cruzar el
// umbral. Estas aserciones no dependen de la silueta de los kits — son del config de
// camara, que no toco este hito.
assert(C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS.right === 0, 'C3 tampoco tiene giro lateral');
assert(
  C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS.up < VIEW_OFFSET_COMPONENTS.up,
  'C3 abre el angulo: mira menos desde arriba que los otros anchors',
);
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

// Las aserciones que dependian de la silueta 3D de los kits full (jamba sur de la Puerta,
// faldones del Taller) ya no aplican: la Puerta y el Taller son greybox. Las relaciones
// canonicas viven en los `*_SILHOUETTE` que se importan arriba y se siguen verificando.
// El fade de oclusion no se monta: no hay oclusores que se desvanezcan.

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
assert(mobileStudentRect.minX >= -0.84 && mobileStudentRect.maxX <= 0.84, 'estudiante queda dentro del safe width mobile');
assert(mobileStudentRect.minY >= -0.4 && mobileStudentRect.maxY <= 0.84, 'estudiante queda fuera del 30% inferior reservado a UI');

mobileQuasi.dispose();
perspective.dispose();
quasi.dispose();
blockout.dispose();

console.log('Ohmdal HD-2D architecture composition/camera C3: OK');
