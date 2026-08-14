import { readFileSync } from 'node:fs';
import { deriveSchoolState } from '../src/landing/schoolModel.ts';
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
assert(runtime.includes('new THREE.Vector3(0, 1, 1)'), 'la vista base usa una axonometría fija de 45°');
assert(builder.includes('location=(0, -64, 68.8)'), 'Blender conserva la misma elevación de cámara');
assert(builder.includes('Vector((0, 0, 4.8))'), 'Blender conserva el centro vertical de las terrazas');

console.log('W11 progresión visual escuela 3D: OK');
