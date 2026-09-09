import { readFileSync } from 'node:fs';
import { deriveSchoolState } from '../src/landing/schoolModel.ts';
import { Vector3 } from 'three';
import { SCHOOL_VIEW_DIRECTION } from '../src/landing/school3dFraming.ts';
import { voxelZoneState } from '../src/landing/voxelSchoolModel.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const initial = deriveSchoolState(null, null);
assert(initial.electronica.arcoCompleto === false, 'la escuela nueva empieza antes del cierre de Arco 1');
assert(voxelZoneState('electronica', initial) === 'open', 'Electrónica conserva actividad parcial');
for (const id of ['matematica', 'programacion'] as const) {
  assert(voxelZoneState(id, initial) === 'closed', `${id} empieza dormida`);
}
// Fisica es 'off' en `deriveSchoolState` (el slice M0..M0.7 ya está mergeado, gateado
// por `arcOneCompleted`), lo que el voxel mapea a 'open'. La distinción es interna:
// 'off' = el aula existe pero el recorrido espera al cierre de Arco I.
assert(voxelZoneState('fisica', initial) === 'open', 'fisica existe como slice pero su recorrido espera arco 1');

const complete = deriveSchoolState(JSON.stringify({
  flags: {
    finished: true,
    unit2Completed: true,
    unit3Completed: true,
    unit4Completed: true,
    unit5Completed: true,
    arcOneCompleted: true,
  },
}), null);
assert(complete.electronica.arcoCompleto, 'el save puede activar la variante completa');
assert(voxelZoneState('electronica', complete) === 'restored', 'Electrónica se restaura');

const builder = readFileSync(new URL('../scripts/blender/build_school.py', import.meta.url), 'utf8');
for (const node of [
  'HALL__progress_relic',
  'HALL__progress_lamp',
  'ELECTRO__progress_portal_sector',
  'ELECTRO__progress_board',
  'ELECTRO__progress_robot',
  'ELECTRO__progress_workbench_2',
]) {
  assert(builder.includes(node), `el GLB fuente declara ${node}`);
}

const runtime = readFileSync(new URL('../src/landing/school3d.ts', import.meta.url), 'utf8');
assert(runtime.includes("location.pathname === '/dev/scene-editor'"), 'la ruta de scene editor está gateada');
assert(runtime.includes("progressState === 'electronics-arc-1-complete'"), 'el runtime consume nodos declarativos de progreso');
assert(runtime.includes('prefersReducedMotion()'), 'las transiciones respetan reduced motion');
assert(runtime.includes('__roxanaSchool3D'), 'el runtime expone métricas de validación');
assert(!runtime.includes('OrbitControls'), 'la cámara 3D no admite paneo o zoom libre');
assert(!runtime.includes('private parallax'), 'la cámara no sigue el puntero');
assert(runtime.includes('cameraDirection = (isCompact() ? SCHOOL_MOBILE_DIRECTION : SCHOOL_VIEW_DIRECTION).clone()'), 'el runtime selecciona la dirección compartida para desktop y móvil');
assert(runtime.includes('this.cameraDirection.copy(isCompact() ? SCHOOL_MOBILE_DIRECTION : SCHOOL_VIEW_DIRECTION)'), 'resize actualiza la dirección al cambiar de viewport');
assert(runtime.includes('frameSchoolBounds(bounds,'), 'el foco de sala usa el ajuste a sus límites completos');
assert(runtime.includes('frameSchoolBounds(this.overviewBounds,'), 'la vista general usa el mismo ajuste geométrico');
for (const call of runtime.matchAll(/frameSchoolBounds\(([^;]+)\);/g)) {
  assert(call[1].trim().endsWith('this.cameraDirection'), 'el encuadre usa el mismo rayo que la cámara activa');
}
assert(runtime.includes('this.cameraDirection.clone().multiplyScalar(CAMERA_DISTANCE)'), 'el render usa la dirección activa al colocar la cámara');
for (const interaction of ['HOVER', 'SELECTED']) {
  const amount = runtime.match(new RegExp(`const LIFT_${interaction}\\s*=\\s*([\\d.]+)\\s*;`));
  assert(amount !== null && Number(amount[1]) === 0, `${interaction} no desplaza pisos ni puertas de su posición horneada`);
}

// Compare the Blender camera ray to the runtime direction, accounting for glTF's
// Z-up -> Y-up conversion. This catches sign and Y/Z swaps without fixing a
// particular camera distance or target translation.
const cameraSetup = builder.split('def setup_camera_and_lights():')[1]?.split('\ndef ')[0] ?? '';
const location = cameraSetup.match(/camera_add\(location=\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)\)/);
const target = cameraSetup.match(/point_at\(camera, Vector\(\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)\)\)/);
assert(location !== null && target !== null, 'la cámara Blender declara posición y objetivo verificables');
if (location && target) {
  const ray = new Vector3(Number(location[1]) - Number(target[1]), Number(location[3]) - Number(target[3]), -(Number(location[2]) - Number(target[2]))).normalize();
  assert(ray.distanceTo(SCHOOL_VIEW_DIRECTION) < 1e-9, 'Blender y Three conservan el mismo rayo oblicuo en sus respectivos ejes');
}
assert(cameraSetup.includes('camera.data.type = "ORTHO"'), 'el modelo se presenta con cámara ortográfica en Blender');
console.log('W11 progresión visual escuela 3D: OK');
