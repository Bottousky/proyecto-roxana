import * as THREE from 'three';
import {
  CAMERA_ANCHORS,
  CAMERA_RIGHT,
  CAMERA_VIEW_OFFSET,
  SOFT_PERSPECTIVE_FOV_Y_DEGREES,
  VIEW_OFFSET_COMPONENTS,
  VIEWPORT_PROFILES,
  cameraDistanceForSpan,
  clampTargetToAnchor,
  createCamera,
  followDeadZone,
  verticalSpan,
} from '../src/labs/ohmdal-hd2d-preprod/camera/cameraConfig.ts';
import {
  AuthorCameraController,
  selectCameraAnchor,
} from '../src/labs/ohmdal-hd2d-preprod/camera/cameraController.ts';
import { CameraOcclusionController } from '../src/labs/ohmdal-hd2d-preprod/camera/occlusion.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function close(actual: number, expected: number, tolerance: number, message: string): void {
  assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

assert(VIEW_OFFSET_COMPONENTS.backward === -0.70, 'B03 usa backward -0.70 sin coma ambigua');
assert(VIEW_OFFSET_COMPONENTS.right === 0.55, 'B03 usa right 0.55 sin coma ambigua');
assert(VIEW_OFFSET_COMPONENTS.up === 0.78, 'B03 usa up 0.78 sin coma ambigua');
close(CAMERA_VIEW_OFFSET.length(), 1, 0.000001, 'el offset comun esta normalizado');
close(CAMERA_ANCHORS.C1_PORTAL_PLAZA.focus.x, -15.1, 0.000001, 'C1 usa lerp 0.58');
close(CAMERA_ANCHORS.C1_PORTAL_PLAZA.focus.y, 0.95, 0.000001, 'C1 usa altura 0.95');
close(CAMERA_ANCHORS.C2_TALLER.focus.y, 1.10, 0.000001, 'C2 usa altura 1.10');

for (const anchor of Object.values(CAMERA_ANCHORS)) {
  for (const viewport of Object.values(VIEWPORT_PROFILES)) {
    const span = verticalSpan(anchor, viewport);
    const expectedDistance = cameraDistanceForSpan(span);
    for (const variant of ['quasi-orthographic', 'soft-perspective'] as const) {
      const controller = new AuthorCameraController({ variant, viewport: viewport.id, initialAnchor: anchor.id });
      close(controller.camera.position.distanceTo(anchor.focus), expectedDistance, 0.000001, `${variant} conserva distancia comun`);
      controller.dispose();
    }
    const ortho = createCamera('quasi-orthographic', anchor, viewport);
    const perspective = createCamera('soft-perspective', anchor, viewport);
    assert(ortho instanceof THREE.OrthographicCamera, 'A es ortografica');
    assert(perspective instanceof THREE.PerspectiveCamera, 'B es perspectiva');
    assert(perspective.fov === SOFT_PERSPECTIVE_FOV_Y_DEGREES, 'B fija FOV 28 grados');
  }
}

const clamped = clampTargetToAnchor(new THREE.Vector3(999, 999, 999), CAMERA_ANCHORS.C2_TALLER);
assert(clamped.y === 1.6, 'el objetivo respeta bound vertical nombrado');

const smooth = new AuthorCameraController({
  variant: 'soft-perspective',
  viewport: 'desktop-1440x900',
});
smooth.setAnchor('C2_TALLER');
smooth.update(0.1);
assert(smooth.snapshot().transitioning, 'la transicion normal no hace snap');
for (let index = 0; index < 10; index += 1) smooth.update(0.1);
assert(!smooth.snapshot().transitioning, 'C1 a C2 termina en 0.90 s sin overshoot');
smooth.setLookTarget(new THREE.Vector3(999, 999, 999));
smooth.update(0.016);
assert(smooth.snapshot().target[1] < smooth.snapshot().desiredTarget[1], 'posicion y look target suavizan en estados separados');
smooth.dispose();
smooth.dispose();
assert(smooth.snapshot().disposed, 'disposal de camara es idempotente y observable');

const reduced = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'mobile-390x844',
  reducedMotion: true,
});
reduced.setAnchor('C2_TALLER');
assert(!reduced.snapshot().transitioning, 'reduced motion cambia anchor sin viaje');
assert(reduced.snapshot().position.every((value, index) => value === reduced.snapshot().desiredPosition[index]), 'reduced motion hace snap a posicion autoral');
reduced.dispose();

assert(selectCameraAnchor('C1_PORTAL_PLAZA', -3) === 'C2_TALLER', 'el umbral entra a Taller');
assert(selectCameraAnchor('C2_TALLER', -3.5) === 'C2_TALLER', 'la histeresis evita ping-pong');
assert(selectCameraAnchor('C2_TALLER', -3.8) === 'C1_PORTAL_PLAZA', 'salir de la banda vuelve a Plaza');
assert(selectCameraAnchor('C2_TALLER', 9.5) === 'C3_DOOR_SPRING', 'el acceso entra a Puerta');

// Resize ortografico: el span aprobado no se toca y el aspect real decide cuanto mundo entra.
const orthoResize = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C2_TALLER',
});
const orthoCamera = orthoResize.camera as THREE.OrthographicCamera;
const orthoSpan = verticalSpan(CAMERA_ANCHORS.C2_TALLER, VIEWPORT_PROFILES['desktop-1440x900']);
close(orthoCamera.top - orthoCamera.bottom, orthoSpan, 1e-9, 'la ortografica arranca con el span aprobado');
orthoResize.setViewportSize(1000, 1000);
close(orthoCamera.top - orthoCamera.bottom, orthoSpan, 1e-9, 'un viewport cuadrado conserva verticalSpan');
close(
  (orthoCamera.right - orthoCamera.left) / (orthoCamera.top - orthoCamera.bottom),
  1,
  1e-9,
  'left/right se recalculan con el aspect real 1',
);
close(orthoCamera.right - orthoCamera.left, orthoSpan, 1e-9, 'con aspect 1 el ancho visible iguala al span aprobado');
close(orthoCamera.left, -orthoCamera.right, 1e-9, 'el frustum sigue centrado');
const squareTop = orthoCamera.top;
const squareBottom = orthoCamera.bottom;
const squareWidth = orthoCamera.right - orthoCamera.left;
orthoResize.setViewportSize(1920, 1000);
close(orthoCamera.top, squareTop, 1e-9, 'un viewport ancho no toca el top autoral');
close(orthoCamera.bottom, squareBottom, 1e-9, 'un viewport ancho no toca el bottom autoral');
assert(orthoCamera.right - orthoCamera.left > squareWidth, 'mas ancho revela mas mundo horizontal, no lo estira');
close(
  (orthoCamera.right - orthoCamera.left) / (orthoCamera.top - orthoCamera.bottom),
  1920 / 1000,
  1e-9,
  'el aspect ancho tambien es el real',
);
close(orthoCamera.left, -orthoCamera.right, 1e-9, 'el frustum ancho sigue centrado');
const wideWidth = orthoCamera.right - orthoCamera.left;
orthoResize.setViewportSize(0, 0);
close(orthoCamera.right - orthoCamera.left, wideWidth, 1e-9, 'un tamano degenerado no destruye la proyeccion');
close(orthoResize.snapshot().visibleSpan, orthoSpan, 1e-9, 'el resize nunca reescribe el span del perfil');
orthoResize.dispose();

// Resize perspectivo: aunque no sea la variante promovida, actualiza aspect y respeta el FOV.
const perspectiveResize = new AuthorCameraController({
  variant: 'soft-perspective',
  viewport: 'mobile-390x844',
  viewportSize: { width: 800, height: 600 },
});
const perspectiveCamera = perspectiveResize.camera as THREE.PerspectiveCamera;
close(perspectiveCamera.aspect, 800 / 600, 1e-9, 'el tamano inicial real entra por constructor');
perspectiveResize.setViewportSize(412, 915);
close(perspectiveCamera.aspect, 412 / 915, 1e-9, 'la perspectiva actualiza su aspect real');
close(perspectiveResize.snapshot().aspect, 412 / 915, 1e-9, 'el snapshot reporta el aspect vigente');
assert(perspectiveCamera.fov === SOFT_PERSPECTIVE_FOV_Y_DEGREES, 'el resize no toca el FOV autoral');
perspectiveResize.dispose();

// Seguimiento con zona muerta: dentro no hay movimiento; fuera, el minimo y dentro de bounds.
const followAnchor = CAMERA_ANCHORS.C2_TALLER;
const follow = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C2_TALLER',
});
const zone = followDeadZone(follow.snapshot().visibleSpan);
const baseTarget = follow.snapshot().desiredTarget;
for (const lateral of [0, 0.4, -0.5, zone.right * 0.99, -zone.right * 0.99]) {
  const subject = followAnchor.focus.clone()
    .addScaledVector(CAMERA_RIGHT, lateral)
    .addScaledVector(followAnchor.forward, zone.forward * 0.9);
  subject.y = 1;
  follow.followSubject(subject);
  follow.update(0.016);
  assert(
    follow.snapshot().desiredTarget.every((value, index) => value === baseTarget[index]),
    'un paso dentro de la zona muerta no mueve el encuadre',
  );
}

const overshoot = 0.6;
const escaping = followAnchor.focus.clone().addScaledVector(CAMERA_RIGHT, zone.right + overshoot);
escaping.y = 1;
follow.followSubject(escaping);
const movedTarget = follow.snapshot().desiredTarget;
close(movedTarget[2] - baseTarget[2], overshoot, 1e-9, 'salir mueve exactamente el excedente lateral');
close(movedTarget[0], baseTarget[0], 1e-9, 'el eje sin excedente queda quieto');
close(movedTarget[1], baseTarget[1], 1e-9, 'la altura sin excedente queda quieta');
close(
  new THREE.Vector3(...follow.snapshot().desiredPosition).distanceTo(new THREE.Vector3(...movedTarget)),
  cameraDistanceForSpan(follow.snapshot().visibleSpan),
  1e-9,
  'el rig acompana el objetivo conservando la distancia comun',
);
follow.followSubject(escaping);
close(follow.snapshot().desiredTarget[2], movedTarget[2], 1e-9, 'el sujeto queda en el borde y deja de ser perseguido');

const forwardEscape = followAnchor.focus.clone()
  .addScaledVector(CAMERA_RIGHT, zone.right + overshoot)
  .addScaledVector(followAnchor.forward, zone.forward + 0.25);
forwardEscape.y = 1;
follow.followSubject(forwardEscape);
close(follow.snapshot().desiredTarget[0] - baseTarget[0], 0.25, 1e-9, 'el eje forward tambien corrige lo minimo');

const runaway = followAnchor.focus.clone().addScaledVector(CAMERA_RIGHT, 99);
runaway.y = 1;
follow.followSubject(runaway);
const bounded = follow.snapshot().desiredTarget;
close(
  bounded[2] - followAnchor.focus.z,
  followAnchor.targetBounds.right.max,
  1e-9,
  'el seguimiento nunca supera el bound lateral del anclaje',
);
assert(bounded[1] >= followAnchor.targetBounds.vertical.min && bounded[1] <= followAnchor.targetBounds.vertical.max, 'el seguimiento respeta el bound vertical');
follow.dispose();

// setLookTarget conserva el encuadre autoral directo: ignora la zona muerta a proposito.
const authored = new AuthorCameraController({
  variant: 'quasi-orthographic',
  viewport: 'desktop-1440x900',
  initialAnchor: 'C2_TALLER',
  reducedMotion: true,
});
const authoredBase = authored.snapshot().desiredTarget;
const nudge = followAnchor.focus.clone().addScaledVector(CAMERA_RIGHT, 0.2);
nudge.y = 1.1;
authored.setLookTarget(nudge);
close(authored.snapshot().desiredTarget[2] - authoredBase[2], 0.2, 1e-9, 'setLookTarget encuadra sin zona muerta');
const escapeReduced = followAnchor.focus.clone().addScaledVector(CAMERA_RIGHT, zone.right + 1);
escapeReduced.y = 1;
authored.followSubject(escapeReduced);
assert(!authored.snapshot().transitioning, 'reduced motion sigue sin viajes animados');
assert(
  authored.snapshot().position.every((value, index) => value === authored.snapshot().desiredPosition[index]),
  'reduced motion hace snap tambien al seguir al jugador',
);
authored.dispose();

const occluder = new THREE.Object3D();
occluder.name = 'foreground';
let opacity = 1;
const occlusion = new CameraOcclusionController([{ id: 'foreground', object: occluder, setOpacity(value) { opacity = value; } }]);
occlusion.update(new Set(['foreground']), 0.016);
assert(opacity === 1, 'un frame aislado no activa fade');
occlusion.update(new Set(['foreground']), 0.016, true);
assert(opacity === 0.18, 'dos frames bloqueados activan fade inmediato con reduced motion');
for (let index = 0; index < 5; index += 1) occlusion.update(new Set(), 0.016, true);
assert(opacity === 0.18, 'cinco frames libres conservan fade');
occlusion.update(new Set(), 0.016, true);
assert(opacity === 1, 'seis frames libres restauran el oclusor');
occlusion.dispose();
occlusion.dispose();
assert(occlusion.diagnostics().disposed && opacity === 1, 'disposal restaura oclusores');

console.log('Ohmdal HD-2D architecture camera/occlusion: OK');
