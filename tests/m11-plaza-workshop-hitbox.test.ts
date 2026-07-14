import { ROOM_SCENES, rectContainsRect, type SceneRect } from '../src/jugar/roomScenesData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

function playerBox(x: number, y: number): SceneRect {
  return { x: x - 12, y: y - 12, w: 24, h: 24 };
}

const plaza = ROOM_SCENES.plaza;
const workshopDoor = plaza.doors!.taller;
const workshopEntry = plaza.entries!.taller;
const workshopCorridor = plaza.walkable.find((rect) => rect.y === workshopDoor.y && rect.h === 82);

assert(workshopCorridor?.x === workshopDoor.x && workshopCorridor.w === workshopDoor.w,
  'el corredor del Taller tiene exactamente el ancho del rectángulo negro');

assert(
  workshopEntry.x >= workshopDoor.x && workshopEntry.x <= workshopDoor.x + workshopDoor.w,
  'la salida del Taller queda centrada frente al vano visible',
);
assert(
  workshopEntry.y > workshopDoor.y + workshopDoor.h,
  'la salida del Taller aparece sobre el atrio y no dentro de la fachada',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(workshopEntry.x, workshopEntry.y))),
  'el punto de regreso desde el Taller admite el cuerpo completo del jugador',
);
assert(
  !plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(805, 260))),
  'el costado ciego de la fachada no es transitable',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(872, 270))),
  'el vano central del Taller sigue siendo transitable',
);
assert(
  !plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(838, 270))),
  'no se entra al Taller rozando el lado izquierdo de la fachada',
);
assert(
  !plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(906, 270))),
  'no se entra al Taller rozando el lado derecho de la fachada',
);

console.log('M11 plaza workshop hitbox tests: OK');
