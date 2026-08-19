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
// Commit 4 (H3 — Plaza multi-área greybox): la Plaza pasó a
// 1920×1080. La banda E-O ({x:0, y:460, w:1920, h:160}) cruza
// el muro este a la altura del Taller; el vano del Taller está
// en (1820, 500, 100, 80), completamente contenido en esa banda.
// El "corredor del Taller" se valida como el walkable que cruza
// el muro este a la altura de la door.
const workshopCorridor = plaza.walkable.find(
  (rect) =>
    rect.x + rect.w >= workshopDoor.x + workshopDoor.w &&
    rect.x <= workshopDoor.x &&
    rect.y <= workshopDoor.y &&
    rect.y + rect.h >= workshopDoor.y + workshopDoor.h,
);

assert(
  workshopCorridor !== undefined,
  'algún walkable de la Plaza cruza el muro este a la altura de la door del Taller',
);
assert(
  workshopCorridor!.x + workshopCorridor!.w >= workshopDoor.x + workshopDoor.w,
  'el walkable se extiende hasta el borde este de la Plaza (cubre el vano del Taller)',
);

assert(
  workshopEntry.x >= workshopDoor.x && workshopEntry.x <= workshopDoor.x + workshopDoor.w,
  'la salida del Taller queda centrada frente al vano visible',
);
// Commit 4: la entry queda dentro del rango y de la door porque
// la banda E-O ({x:0, y:460, w:1920, h:160}) cruza el muro este
// a la altura del Taller. El "atrio" es esa banda horizontal.
// La entry debe caer DENTRO de la zona pisable, no afuera.
assert(
  workshopEntry.y >= workshopDoor.y && workshopEntry.y <= workshopDoor.y + workshopDoor.h,
  'la salida del Taller queda dentro de la banda E-O que cruza el vano',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(workshopEntry.x, workshopEntry.y))),
  'el punto de regreso desde el Taller admite el cuerpo completo del jugador',
);
// Commit 4: la banda E-O cruza el muro este en el rango y de la
// door. La pared este de la Plaza (pushWallSolids) sella todo el
// borde, salvo el gap de la door. Validamos:
//   - (1860, 540) está dentro de la banda E-O → pisable.
//   - (1860, 480) está dentro de la banda E-O → pisable.
//   - (1860, 400) está FUERA de la banda E-O → no pisable.
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(1860, 540))),
  'el centro del vano del Taller (1860,540) sigue siendo transitable',
);
assert(
  plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(1860, 480))),
  '(1860,480) está dentro de la banda E-O que cruza el muro este',
);
assert(
  !plaza.walkable.some((rect) => rectContainsRect(rect, playerBox(1860, 400))),
  '(1860,400) queda fuera de la banda E-O y del gap — el muro este lo sella',
);

console.log('M11 plaza workshop hitbox tests: OK');
