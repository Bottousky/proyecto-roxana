import {
  SCHOOL_GRID,
  SCHOOL_VIEW_X,
  VOXEL_ROOMS,
  gridToIso,
  isoToGrid,
  schoolRoomFromHash,
  schoolRoomOccludes,
  schoolRoomInFocus,
  voxelZoneState,
  zoneAtCell,
  type VoxelRoom,
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
  assert(Number.isFinite(room.floorElevation) && room.floorElevation >= 0, `${room.id} declara una elevación física válida`);
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

// Only Dirección is physically raised; independent runtime terraces would break
// the authored doors, stairs and shared floor of the remaining school.
for (const room of VOXEL_ROOMS) {
  const expected = room.id === 'direccion' ? 1.14 : 0;
  assert(Math.abs(room.floorElevation - expected) < 1e-9, `${room.id} conserva su piso arquitectónico`);
}
assert(VOXEL_ROOMS.find((room) => room.id === 'visitantes')?.shortTitle === 'Anfiteatro', 'la sala escalonada se presenta como Anfiteatro');

const roomById = (id: string) => VOXEL_ROOMS.find((room) => room.id === id)!;
assert(schoolRoomOccludes(roomById('preceptoria'), roomById('electronica')), 'Preceptoría obstruye Electrónica');
assert(schoolRoomOccludes(roomById('electronica'), roomById('matematica')), 'Electrónica obstruye Matemática');
assert(schoolRoomOccludes(roomById('visitantes'), roomById('programacion')), 'Anfiteatro obstruye Programación');
assert(schoolRoomOccludes(roomById('programacion'), roomById('fisica')), 'Programación obstruye Física');
assert(schoolRoomOccludes(roomById('hall'), roomById('direccion')), 'Hall obstruye Dirección');
assert(!schoolRoomOccludes(roomById('electronica'), roomById('fisica')), 'otra ala no se disuelve');
// Projected occlusion must follow the oblique camera, not aligned grid columns.
// These synthetic rooms isolate overlap and camera depth from the authored map.
assert(SCHOOL_VIEW_X === .5, 'la vista oblicua comparte la dirección horizontal con el encuadre');
const fixture = (id: VoxelRoom['id'], x: number, y: number): VoxelRoom => ({ ...roomById('electronica'), id, x, y, width: 4, depth: 4, embedded: false });
const target = fixture('electronica', 10, 10);
const diagonalForeground = fixture('programacion', 15, 20);
assert(diagonalForeground.x >= target.x + target.width, 'la prueba diagonal separa las huellas en X');
assert(schoolRoomOccludes(diagonalForeground, target), 'salas de distintas columnas pueden coincidir en pantalla y ocultarse');
assert(!schoolRoomOccludes(target, diagonalForeground), 'invertir profundidad no oculta una sala en primer plano');
assert(schoolRoomOccludes(fixture('programacion', 10, 15), target), 'solape proyectado en primer plano oculta');
assert(!schoolRoomOccludes(fixture('programacion', 10, 5), target), 'solape proyectado detrás no oculta');
assert(!schoolRoomOccludes(fixture('programacion', 30, 15), target), 'estar delante no alcanza sin solape horizontal');
assert(!schoolRoomOccludes(fixture('programacion', 14, 8), target), 'igual profundidad de cámara no cuenta como obstrucción');
assert(!schoolRoomOccludes(target, target), 'una sala no se obstruye a sí misma');
assert(!schoolRoomOccludes({ ...diagonalForeground, embedded: true }, target), 'los accesos de servicio no disuelven el hall anfitrión');
const originTarget = fixture('electronica', 0, 0);
assert(!schoolRoomOccludes(fixture('programacion', 8, 4), originTarget), 'intervalos que sólo se tocan no ocultan');
assert(!schoolRoomOccludes(fixture('programacion', 7.75, 4), originTarget), 'un roce menor al margen no disuelve la arquitectura');
assert(schoolRoomOccludes(fixture('programacion', 7.4, 4), originTarget), 'el solape superior al margen sí activa la retirada');

// Every authored target gets a deterministic visibility set: the four shared
// hall services retain context, while each other room is a clean cutaway.
const hallContext = new Set(['hall', 'biblioteca', 'logros', 'audiovisual']);
for (const targetRoom of VOXEL_ROOMS) {
  const expectedVisible = hallContext.has(targetRoom.id) ? hallContext : new Set([targetRoom.id]);
  for (const candidate of VOXEL_ROOMS) {
    assert(schoolRoomInFocus(candidate, targetRoom) === expectedVisible.has(candidate.id), `${targetRoom.id}: visibilidad explícita de ${candidate.id}`);
  }
}
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
