import * as THREE from 'three';
import {
  CAMERA_ANCHORS,
  CAMERA_VIEW_OFFSET,
  SOFT_PERSPECTIVE_FOV_Y_DEGREES,
  VIEW_OFFSET_COMPONENTS,
  VIEWPORT_PROFILES,
  cameraDistanceForSpan,
  clampTargetToAnchor,
  createCamera,
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
