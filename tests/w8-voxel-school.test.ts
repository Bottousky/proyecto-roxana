import {
  SCHOOL_GRID,
  VOXEL_ROOMS,
  gridToIso,
  isoToGrid,
  schoolRoomFromHash,
  schoolRoomOccludes,
  voxelZoneState,
  zoneAtCell,
} from '../src/landing/voxelSchoolModel.ts';
import { deriveSchoolState } from '../src/landing/schoolModel.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

assert(VOXEL_ROOMS.length === 11, 'la escuela contiene once zonas funcionales');
for (const id of ['hall', 'electronica', 'programacion', 'fisica', 'matematica', 'preceptoria', 'direccion', 'logros', 'audiovisual', 'visitantes']) {
  assert(VOXEL_ROOMS.some((room) => room.id === id), `la escuela incluye ${id}`);
}
for (const room of VOXEL_ROOMS) {
  assert(room.presentationLevel >= 0 && room.presentationLevel <= 2, `${room.id} declara un nivel de terraza válido`);
  assert(room.x >= 0 && room.y >= 0, `${room.id} empieza dentro de la grilla`);
  assert(room.x + room.width <= SCHOOL_GRID.width, `${room.id} cabe a lo ancho`);
  assert(room.y + room.depth <= SCHOOL_GRID.depth, `${room.id} cabe a lo profundo`);
  assert(zoneAtCell(room.x + 0.5, room.y + 0.5)?.id === room.id, `${room.id} se puede seleccionar`);
  // Cada esquina interior también debe resolver a la misma sala: si dos salas se
  // pisaran, zoneAtCell devolvería la primera de la lista y una quedaría muerta.
  for (const [dx, dy] of [[0.5, 0.5], [room.width - 0.5, 0.5], [0.5, room.depth - 0.5], [room.width - 0.5, room.depth - 0.5]]) {
    assert(zoneAtCell(room.x + dx, room.y + dy)?.id === room.id, `${room.id} responde en toda su superficie`);
  }
}

const presentationLevel = (id: string) => VOXEL_ROOMS.find((room) => room.id === id)?.presentationLevel;
for (const id of ['preceptoria', 'visitantes']) assert(presentationLevel(id) === 0, `${id} queda en el nivel 0`);
for (const id of ['electronica', 'programacion', 'hall']) assert(presentationLevel(id) === 1, `${id} queda en el nivel 1`);
for (const id of ['matematica', 'fisica', 'direccion']) assert(presentationLevel(id) === 2, `${id} queda en el nivel 2`);
assert(VOXEL_ROOMS.find((room) => room.id === 'visitantes')?.shortTitle === 'Anfiteatro', 'la sala escalonada se presenta como Anfiteatro');

const roomById = (id: string) => VOXEL_ROOMS.find((room) => room.id === id)!;
assert(schoolRoomOccludes(roomById('preceptoria'), roomById('electronica')), 'Preceptoría obstruye Electrónica');
assert(schoolRoomOccludes(roomById('electronica'), roomById('matematica')), 'Electrónica obstruye Matemática');
assert(schoolRoomOccludes(roomById('visitantes'), roomById('programacion')), 'Anfiteatro obstruye Programación');
assert(schoolRoomOccludes(roomById('programacion'), roomById('fisica')), 'Programación obstruye Física');
assert(schoolRoomOccludes(roomById('hall'), roomById('direccion')), 'Hall obstruye Dirección');
assert(!schoolRoomOccludes(roomById('electronica'), roomById('fisica')), 'otra ala no se disuelve');

// Los ocho recintos primarios no se solapan. Audiovisual, Biblioteca y Logros
// son umbrales semánticos embebidos en el muro del Hall, no pisos autónomos.
for (const a of VOXEL_ROOMS) {
  for (const b of VOXEL_ROOMS) {
    if (a.id === b.id || a.embedded || b.embedded) continue;
    const separated =
      a.x + a.width <= b.x || b.x + b.width <= a.x ||
      a.y + a.depth <= b.y || b.y + b.depth <= a.y;
    assert(separated, `${a.id} y ${b.id} no se solapan en el plano`);
  }
}

const projected = gridToIso(13.25, 7.75);
const recovered = isoToGrid(projected.x, projected.y);
assert(Math.abs(recovered.x - 13.25) < 0.0001, 'la proyección recupera x');
assert(Math.abs(recovered.y - 7.75) < 0.0001, 'la proyección recupera y');

const newPlayer = deriveSchoolState(null, null);
assert(voxelZoneState('electronica', newPlayer) === 'open', 'Electrónica empieza abierta pero apagada');
assert(voxelZoneState('programacion', newPlayer) === 'closed', 'Programación conserva su gate');

const restored = deriveSchoolState(JSON.stringify({ flags: { finished: true, unit2Completed: true, unit3Completed: true, unit4Completed: true, unit5Completed: true, arcOneCompleted: true } }), null);
assert(voxelZoneState('electronica', restored) === 'restored', 'Electrónica refleja el arco completo');
assert(voxelZoneState('logros', restored) === 'active', 'la sala de logros refleja el progreso');
assert(schoolRoomFromHash('#sala/electronica') === 'electronica', 'el deep link abre una sala válida');
assert(schoolRoomFromHash('#sala/desconocida') === null, 'el deep link rechaza salas inexistentes');

console.log('W8 escuela voxel: OK');
