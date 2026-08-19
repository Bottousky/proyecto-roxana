/**
 * ra0-active-room-local.test.ts — R2 / ActiveRoom local authority (ADR-002).
 *
 * Valida que la autoridad de gameplay es room-LOCAL:
 *   - `ActiveRoom.playerLocal` es la posición autoritativa;
 *   - cámara, navegación y clamp derivan del rect local (0,0,width,height);
 *   - `world.ts` ox/oy NO son autoridad: sólo el bridge `legacyProjection`
 *     los usa para proyectar al renderer legacy.
 *
 * Reemplaza `r4-active-area-semantics.test.ts` (retirado): conserva la
 * semántica valiosa (una room = autoridad, bounds locales, switch atómico)
 * sin los supuestos de LoadedChunks / offsets de mundo.
 *
 * Run con: `node --experimental-strip-types tests/ra0-active-room-local.test.ts`
 */

import { readFileSync } from 'node:fs';
import { ROOM_SCENES, type RoomSceneProfile } from '../src/jugar/roomScenesData.ts';
import {
  createActiveRoom,
  activeRoomLocalBounds,
  clampLocal,
  isPlayerLocalInside,
  isSameActiveRoom,
  legacyProjection,
  type ActiveRoom,
  type LegacyPlacement,
} from '../src/jugar/activeRoom.ts';
import { cameraBounds } from '../src/jugar/cameraDirector.ts';
import {
  buildRoomGraph,
  sourceFromRoomsAndScenes,
  OHMDAL_EDGE_META,
  type RoomGraph,
  type RoomDoorSource,
} from '../src/jugar/roomGraph.ts';
import { parseRoomsSource } from './helpers/roomsSource.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

const VP = { width: 960, height: 540 };
const PLAZA_ID = 'plaza';
const TALLER_ID = 'taller';

function realGraph(): RoomGraph {
  const rooms: Record<string, { id: string; doors: RoomDoorSource[] }> = {};
  for (const [id, room] of Object.entries(parseRoomsSource())) {
    rooms[id] = { id, doors: room.doors.map((d) => ({ to: d.to, spawn: d.spawn })) };
  }
  return buildRoomGraph(sourceFromRoomsAndScenes(rooms, ROOM_SCENES, OHMDAL_EDGE_META));
}

function cameraLocalRect(room: ActiveRoom) {
  return cameraBounds(activeRoomLocalBounds(room), VP);
}

// ---------------------------------------------------------------------------
// A/B. Player position LOCAL; Plaza acepta (1500,800) sin offset de mundo.
// ---------------------------------------------------------------------------
test('A/B: ActiveRoom.playerLocal es LOCAL; Plaza acepta (1500,800) sin offset', () => {
  const room = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  assert(room.id === 'plaza', 'id');
  assert(room.width === 1920 && room.height === 1080, 'Plaza 1920×1080 derivada');
  assert(room.playerLocal.x === 1500 && room.playerLocal.y === 800, 'playerLocal = (1500,800) tal cual');
  assert(isPlayerLocalInside(room, room.playerLocal), '(1500,800) dentro de la Plaza local');
  assert(clampLocal(room, room.playerLocal).x === 1500, 'clamp no altera (1500,800)');
  // La posición local no tiene noción de offset.
  assert(!('ox' in room) && !('oy' in room), 'ActiveRoom no modela offsets');
});

// ---------------------------------------------------------------------------
// C. Una room 960×540 usa exactamente el mismo contrato.
// ---------------------------------------------------------------------------
test('C: una room 960×540 usa el mismo contrato ActiveRoom', () => {
  const room = createActiveRoom(TALLER_ID, { x: 480, y: 270 });
  assert(room.width === 960 && room.height === 540, 'taller 960×540 derivada');
  assert(room.playerLocal.x === 480 && room.playerLocal.y === 270, 'playerLocal local');
  const b = activeRoomLocalBounds(room);
  assert(b.x === 0 && b.y === 0 && b.w === 960 && b.h === 540, 'bounds locales (0,0,960,540)');
});

// ---------------------------------------------------------------------------
// D. Camera bounds locales (0,0,width,height) con independencia del placement.
// ---------------------------------------------------------------------------
test('D: camera bounds = (0,0,width,height) independiente del placement', () => {
  const room = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const cb = cameraLocalRect(room);
  assert(cb.x === 0 && cb.y === 0 && cb.w === 1920 && cb.h === 1080, 'camera local = Plaza completa');
  // La autoridad de cámara NO depende de ox/oy.
  const room2 = createActiveRoom(TALLER_ID, { x: 480, y: 270 });
  const cb2 = cameraLocalRect(room2);
  assert(cb2.x === 0 && cb2.y === 0 && cb2.w === 960 && cb2.h === 540, 'camera local = taller (0,0,960,540)');
});

// ---------------------------------------------------------------------------
// E. Navigation bounds locales (0,0,width,height) independiente del placement.
// ---------------------------------------------------------------------------
test('E: navigation bounds = (0,0,width,height) independiente del placement', () => {
  const room = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const nb = activeRoomLocalBounds(room);
  assert(nb.x === 0 && nb.y === 0 && nb.w === 1920 && nb.h === 1080, 'nav local = Plaza completa');
});

// ---------------------------------------------------------------------------
// F. Cambiar ox/oy NO altera playerLocal / nav / camera / graph / entry.
// ---------------------------------------------------------------------------
test('F: cambiar ox/oy no altera playerLocal, bounds ni entry del grafo', () => {
  const room = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const pA: LegacyPlacement = { ox: 0, oy: 0 };
  const pB: LegacyPlacement = { ox: 9999, oy: -7777 };
  assert(room.playerLocal.x === 1500 && room.playerLocal.y === 800, 'playerLocal sin cambio');
  assert(JSON.stringify(activeRoomLocalBounds(room)) === JSON.stringify({ x: 0, y: 0, w: 1920, h: 1080 }),
    'nav/camera bounds sin cambio');
  const g = realGraph();
  const eA = g.entryFor('plaza', 'taller');
  const eB = g.entryFor('plaza', 'taller');
  assert(eA && eB && eA.x === eB.x && eA.y === eB.y, 'entry de grafo idéntica (no usa offsets)');
  const connA = g.connection('plaza', 'taller');
  const connB = g.connection('plaza', 'taller');
  assert(connA && connB && connA.id === connB.id, 'conexión de grafo idéntica');
  // El proyecto legacy SÍ difiere (ese es el bridge).
  const worldA = legacyProjection.localToLegacyWorld(room.playerLocal, pA);
  const worldB = legacyProjection.localToLegacyWorld(room.playerLocal, pB);
  assert(worldA.x !== worldB.x || worldA.y !== worldB.y, 'sólo el proyecto legacy difiere');
});

// ---------------------------------------------------------------------------
// G. Proyección legacy reversible.
// ---------------------------------------------------------------------------
test('G: legacyProjection es reversible (local ↔ legacy world)', () => {
  const local = { x: 100, y: 200 };
  const placement: LegacyPlacement = { ox: 5000, oy: -3000 };
  const world = legacyProjection.localToLegacyWorld(local, placement);
  assert(world.x === 5100 && world.y === -2800, 'local (100,200) + (5000,-3000) → world (5100,-2800)');
  const back = legacyProjection.legacyWorldToLocal(world, placement);
  assert(back.x === 100 && back.y === 200, 'round trip → local (100,200)');
});

// ---------------------------------------------------------------------------
// H. Rooms distintas pueden reusar coordenadas locales idénticas.
// ---------------------------------------------------------------------------
test('H: rooms distintas reusan coordenadas locales idénticas sin conflicto', () => {
  const plaza = createActiveRoom(PLAZA_ID, { x: 480, y: 300 });
  const taller = createActiveRoom(TALLER_ID, { x: 480, y: 300 });
  assert(plaza.playerLocal.x === 480 && plaza.playerLocal.y === 300, 'plaza playerLocal (480,300)');
  assert(taller.playerLocal.x === 480 && taller.playerLocal.y === 300, 'taller playerLocal (480,300)');
  assert(isPlayerLocalInside(plaza, plaza.playerLocal), 'plaza: (480,300) dentro');
  assert(isPlayerLocalInside(taller, taller.playerLocal), 'taller: (480,300) dentro');
  assert(isSameActiveRoom(plaza, taller) === false, 'son rooms distintas');
});

// ---------------------------------------------------------------------------
// I. El clamp usa dimensiones de ROOM, no el viewport.
// ---------------------------------------------------------------------------
test('I: clamp usa dimensiones de room (Plaza: x>960, y>540 válidos; límite estricto [0,w))', () => {
  const plaza = createActiveRoom(PLAZA_ID, { x: 480, y: 300 });
  const taller = createActiveRoom(TALLER_ID, { x: 480, y: 300 });
  assert(clampLocal(plaza, { x: 1500, y: 800 }).x === 1500, 'plaza x=1500 (>960) no clampeado');
  assert(clampLocal(plaza, { x: 1500, y: 800 }).y === 800, 'plaza y=800 (>540) no clampeado');
  // R4: límite superior ESTRICTO ([0,width)) — el cruce por borde ya no existe.
  assert(clampLocal(plaza, { x: 2000, y: 1200 }).x === 1919, 'plaza clamp estricto a 1919 (x < width)');
  assert(clampLocal(plaza, { x: 2000, y: 1200 }).y === 1079, 'plaza clamp estricto a 1079 (y < height)');
  assert(clampLocal(taller, { x: 2000, y: 1200 }).x === 959, 'taller clamp estricto a 959');
  assert(clampLocal(taller, { x: 2000, y: 1200 }).y === 539, 'taller clamp estricto a 539');
});

// ---------------------------------------------------------------------------
// J. El switch de room reemplaza la autoridad local atómicamente.
// ---------------------------------------------------------------------------
test('J: el switch de room reemplaza la autoridad local de forma atómica', () => {
  const r1 = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const r2 = createActiveRoom(TALLER_ID, { x: 120, y: 300 });
  // r1 queda intacto (el objeto original no muta) y r2 es la nueva autoridad.
  assert(r1.id === 'plaza' && r1.playerLocal.x === 1500, 'la room previa no se muta');
  assert(r2.id === 'taller' && r2.width === 960 && r2.height === 540, 'la nueva room reemplaza id+dims');
  assert(r2.playerLocal.x === 120 && r2.playerLocal.y === 300, 'la nueva room reemplaza playerLocal');
  assert(isSameActiveRoom(r1, r2) === false, 'no son la misma room');
});

// ---------------------------------------------------------------------------
// K. Ningún test de ActiveRoom necesita unionAreaBounds.
// ---------------------------------------------------------------------------
test('K: activeRoom no depende de spatial.ts / unionAreaBounds', () => {
  const src = readFileSync(new URL('../src/jugar/activeRoom.ts', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(imports.length > 0, 'activeRoom tiene imports');
  assert(imports.every((p) => p.startsWith('./roomScenesData')), `imports inesperados: ${imports.join(', ')}`);
  assert(!src.includes('unionAreaBounds'), 'sin unionAreaBounds');
});

// ---------------------------------------------------------------------------
// L. RoomGraph sigue con cero dependencia de mundo.
// ---------------------------------------------------------------------------
test('L: RoomGraph conserva cero dependencia de world', () => {
  const g = realGraph();
  const r = g.resolve('plaza', 'taller')!;
  const json = JSON.stringify(r);
  assert(!json.includes('"ox"') && !json.includes('"oy"'), 'resolve() sin offsets');
  const graphSrc = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  const graphImports = [...graphSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(graphImports.every((p) => p.startsWith('./roomScenesData')), `roomGraph imports inesperados: ${graphImports.join(', ')}`);
});

// ---------------------------------------------------------------------------
// REGRESIÓN (ADR-002): Plaza 1920×1080, placement A(0,0) vs B(10000,-7000)
// → comportamiento de ActiveRoom idéntico. Sólo el proyecto legacy cambia.
// ---------------------------------------------------------------------------
test('REGRESIÓN ADR-002: placement distinto → ActiveRoom idéntico, sólo cambia el bridge', () => {
  const pA: LegacyPlacement = { ox: 0, oy: 0 };
  const pB: LegacyPlacement = { ox: 10000, oy: -7000 };
  const room = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });

  // playerLocal idéntico (autoridad local, sin offsets).
  assert(room.playerLocal.x === 1500 && room.playerLocal.y === 800, 'playerLocal idéntico');

  // camera / navigation bounds locales idénticos.
  const camA = cameraLocalRect(room);
  const camB = cameraLocalRect(room);
  assert(JSON.stringify(camA) === JSON.stringify(camB), 'camera local idéntica');
  assert(JSON.stringify(activeRoomLocalBounds(room)) === JSON.stringify({ x: 0, y: 0, w: 1920, h: 1080 }), 'nav local idéntica');

  // RoomGraph edges idénticos.
  const g = realGraph();
  const eA = g.connection('plaza', 'taller');
  const eB = g.connection('plaza', 'taller');
  assert(eA && eB && eA.id === eB.id && eA.kind === eB.kind, 'RoomGraph edges idénticos');

  // SÓLO la proyección legacy difiere.
  const worldA = legacyProjection.localToLegacyWorld(room.playerLocal, pA);
  const worldB = legacyProjection.localToLegacyWorld(room.playerLocal, pB);
  assert(worldA.x === 1500 && worldA.y === 800, 'projection A: local (1500,800)');
  assert(worldB.x === 11500 && worldB.y === -6200, 'projection B: local + (10000,-7000)');
  assert(worldA.x !== worldB.x, 'sólo el proyecto legacy difiere');
  const camWorldA = legacyProjection.rectToLegacyWorld(camA, pA);
  const camWorldB = legacyProjection.rectToLegacyWorld(camB, pB);
  assert(camWorldA.x === 0 && camWorldB.x === 10000, 'camera world (setBounds) difiere sólo por el bridge');
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('ActiveRoom local authority tests:');
let passed = 0;
let failed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`  ✓ ${t.name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${t.name}: ${(e as Error).message}`);
    failed++;
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
