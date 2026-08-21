/**
 * r6-retire-legacy-world.test.ts — R6 / retire legacy world/offset plumbing.
 *
 * R5 extirpó el sistema shared-wall (computeBoundaries, gapRect,
 * pushWallSolids, beginDoorTransition). R6 extirpa el resto del
 * "mundo continuo":
 *
 *   - `legacyProjection` (activeRoom.ts bridge a un plano world)
 *   - `activeLegacyPlacement()` (offset derivado de chunks)
 *   - `this.chunks` / `this.currentChunk` (compat shim en loadRoom)
 *   - `this.worldMinY` (offset de y-sort)
 *   - `worldOf` / `WORLDS` (geografía continua)
 *   - `unionAreaBounds` / `chunkRectWorld` / `chunkCenterWorld`
 *     / `isPointInsideChunk` / `chunkPlacement` (helpers del mundo
 *     continuo en `spatial.ts`)
 *   - `localToWorld` / `worldToLocal` (bridge legacy)
 *   - parámetros `ox, oy` en `buildChunk`
 *
 * Tras R6 el sprite de Phaser (`player.x`/`player.y`) es la posición
 * LOCAL de la room activa — sin bridge. La autoridad de cambio de
 * room es RoomGraph; la autoridad de placement es LocalRoom.
 *
 * Pruebas:
 *
 *   A. player coordinates are room-local directly.
 *   B. camera bounds are local directly.
 *   C. loadRoom does not create a world placement for the room.
 *   D. buildChunk needs no ox/oy.
 *   E. moving/deleting old world offsets cannot alter gameplay.
 *   F. ActiveRoom remains sole room authority.
 *   G. Plaza 1920×1080 works at local origin.
 *   H. Taller 960×540 works at local origin.
 *   I. Plaza→Taller and Taller→Plaza still resolve via RoomGraph.
 *   J. active-room collision from R5 remains local.
 *   K. no normal runtime import of legacyProjection remains.
 *   L. R1–R5 suites remain green (proxies checked here).
 *
 * Run con: `node --experimental-strip-types tests/r6-retire-legacy-world.test.ts`
 */

import { readFileSync } from 'node:fs';
import { ROOM_SCENES, areaDimensions, type RoomSceneProfile } from '../src/jugar/roomScenesData.ts';
import {
  createActiveRoom,
  activeRoomLocalBounds,
  isSameActiveRoom,
  type ActiveRoom,
} from '../src/jugar/activeRoom.ts';
import { cameraBounds } from '../src/jugar/cameraDirector.ts';
import {
  buildRoomGraph,
  sourceFromRoomsAndScenes,
  OHMDAL_EDGE_META,
  type RoomGraph,
  type RoomDoorSource,
} from '../src/jugar/roomGraph.ts';
import { mapSchematicOf, MAP_SCHEMATICS } from '../src/jugar/mapSchematic.ts';
import { parseRoomsSource } from './helpers/roomsSource.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');
const activeRoomSrc = readFileSync(new URL('../src/jugar/activeRoom.ts', import.meta.url), 'utf8');
const spatialSrc = readFileSync(new URL('../src/jugar/spatial.ts', import.meta.url), 'utf8');

const PLAZA = 'plaza';
const TALLER = 'taller';

function plaza(): RoomSceneProfile {
  const p = ROOM_SCENES[PLAZA];
  if (!p) throw new Error('plaza scene missing');
  return p;
}
function taller(): RoomSceneProfile {
  const p = ROOM_SCENES[TALLER];
  if (!p) throw new Error('taller scene missing');
  return p;
}

function realGraph(): RoomGraph {
  const rooms: Record<string, { id: string; doors: RoomDoorSource[] }> = {};
  for (const [id, room] of Object.entries(parseRoomsSource())) {
    rooms[id] = { id, doors: room.doors.map((d) => ({ to: d.to, spawn: d.spawn })) };
  }
  return buildRoomGraph(sourceFromRoomsAndScenes(rooms, ROOM_SCENES, OHMDAL_EDGE_META));
}

// ---------------------------------------------------------------------------
// A. player coordinates are room-local directly.
// ---------------------------------------------------------------------------
test('A: el sprite de Phaser vive en coords LOCALES del ActiveRoom', () => {
  // El código que escribe player.x o player.y debe usar SOLO
  // coordenadas locales (== activeRoom.playerLocal).
  // Tras R6 no hay `legacyProjection.localToLegacyWorld` ni
  // `activeLegacyPlacement` que traduzca a un plano world.
  assert(!/legacyProjection\.localToLegacyWorld/.test(scene),
    'A: legacyProjection.localToLegacyWorld NO se invoca en runtime');
  assert(!/legacyProjection\.legacyWorldToLocal/.test(scene),
    'A: legacyProjection.legacyWorldToLocal NO se invoca en runtime');
  // Y player.setPosition se llama con coords locales (recto o vía
  // activeRoom.playerLocal.x/y).
  assert(/this\.player\.setPosition\(this\.activeRoom\.playerLocal\.x, this\.activeRoom\.playerLocal\.y\)/.test(scene),
    'A: player.setPosition recibe activeRoom.playerLocal.x, .y directamente');
  // La autoridad de gameplay es `activeRoom.playerLocal`.
  assert(/this\.activeRoom\.playerLocal\s*=\s*clamped/.test(scene),
    'A: activeRoom.playerLocal se sincroniza con el clamp local');
});

// ---------------------------------------------------------------------------
// B. camera bounds are local directly.
// ---------------------------------------------------------------------------
test('B: camera.setBounds recibe los bounds LOCALES de la room activa', () => {
  // `cameraBounds(activeRoomLocalBounds(room), viewport)` ya colapsa
  // a (0, 0, w, h) y la escena lo pasa a setBounds.
  assert(/this\.cameras\.main\.setBounds\(camBounds\.x, camBounds\.y, camBounds\.w, camBounds\.h\)/.test(scene),
    'B: setBounds con camBounds (LOCAL)');
  // Sin proyección a un rect legacy.
  assert(!/rectToLegacyWorld/.test(scene), 'B: sin rectToLegacyWorld');
  // cameraBounds sobre Plaza 1920×1080 produce (0, 0, 1920, 1080).
  const room = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  const cb = cameraBounds(activeRoomLocalBounds(room), { width: 960, height: 540 });
  assert(cb.x === 0 && cb.y === 0, 'B: camera origen (0, 0)');
  assert(cb.w === 1920 && cb.h === 1080, 'B: camera = Plaza 1920×1080');
  // cameraBounds sobre Taller 960×540 produce (0, 0, 960, 540).
  const t = createActiveRoom(TALLER, { x: 480, y: 270 });
  const cbT = cameraBounds(activeRoomLocalBounds(t), { width: 960, height: 540 });
  assert(cbT.x === 0 && cbT.y === 0, 'B: camera origen (0, 0)');
  assert(cbT.w === 960 && cbT.h === 540, 'B: camera = Taller 960×540');
});

// ---------------------------------------------------------------------------
// C. loadRoom does not create a world placement for the room.
// ---------------------------------------------------------------------------
test('C: loadRoom NO crea un placement paralelo para la room activa', () => {
  // R6: el bridge `this.chunks = { [id]: { ox: 0, oy: 0 } }` se extirpó.
  assert(!/this\.chunks\s*=\s*\{\s*\[id\]\s*:\s*\{\s*ox\s*:\s*0\s*,\s*oy\s*:\s*0\s*\}\s*\}/.test(scene),
    'C: chunks bridge extirpado de loadRoom');
  assert(!/this\.currentChunk\s*=\s*id/.test(scene),
    'C: currentChunk se reemplazó por activeRoom.id');
  // Y loadRoom no consulta worldOf ni WORLDS.
  assert(!/worldOf\(/.test(scene), 'C: loadRoom no consulta worldOf');
  assert(!/WORLDS/.test(scene), 'C: loadRoom no consulta WORLDS');
});

// ---------------------------------------------------------------------------
// D. buildChunk needs no ox/oy.
// ---------------------------------------------------------------------------
test('D: buildChunk no recibe ox/oy', () => {
  // R6: la firma de buildChunk es (id, prevNPCs, fireEnter, add).
  assert(/private\s+buildChunk\(\s*id\s*:\s*string\s*,\s*prevNPCs\s*:\s*Set<string>\s*,\s*fireEnter\s*:\s*boolean\s*,\s*add/.test(scene),
    'D: buildChunk(id, prevNPCs, fireEnter, add) — sin ox/oy');
  // Y el call site en loadRoom tampoco pasa ox/oy.
  assert(/this\.buildChunk\(id, prevNPCs, fireEnter, add\);/.test(scene),
    'D: loadRoom llama buildChunk sin offsets');
  // Los uses internos de buildChunk ya no suman ox/oy.
  // La firma es multilinea; usamos un regex laxo.
  const body = scene.match(/private\s+buildChunk\([\s\S]*?\)\s*:\s*void\s*\{([\s\S]*?)\n  \}/);
  assert(body !== null, 'D: cuerpo de buildChunk presente');
  const bodyText = body![1];
  assert(!/\+\s*ox/.test(bodyText), 'D: buildChunk NO suma ox a coords');
  assert(!/\+\s*oy/.test(bodyText), 'D: buildChunk NO suma oy a coords');
});

// ---------------------------------------------------------------------------
// E. moving/deleting old world offsets cannot alter gameplay.
// ---------------------------------------------------------------------------
test('E: cambiar/eliminar offsets de mundo NO altera gameplay', () => {
  // R6: el runtime no consulta `worldOf`/`WORLDS` ni un bridge de
  // offsets. Cambiar el archivo `world.ts` o `mapSchematic.ts`
  // (que ahora NO expone offsets) no puede mover al jugador.
  assert(!/from\s+['"]\.\/world['"]/.test(scene),
    'E: ExplorationScene no importa ./world');
  // R6: worldOf no se INVOCA (los comentarios son libres).
  assert(!/worldOf\(/.test(scene), 'E: worldOf no se invoca en runtime');
  assert(!/WORLDS\b/.test(scene), 'E: WORLDS no se referencia en runtime');
  // ActiveRoom y roomGraph son funciones puras del id + spawn.
  const r1 = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  const r2 = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  assert(isSameActiveRoom(r1, r2), 'E: mismo spawn → mismo ActiveRoom');
  // El grafo es invariante bajo "cambios de mundo" (no lee mundo).
  const g = realGraph();
  const c1 = g.connection('plaza', 'taller');
  const c2 = g.connection('plaza', 'taller');
  assert(c1 && c2 && c1.id === c2.id, 'E: misma conexión plaza→taller');
});

// ---------------------------------------------------------------------------
// F. ActiveRoom remains sole room authority.
// ---------------------------------------------------------------------------
test('F: ActiveRoom es la única autoridad de gameplay room-local', () => {
  // El módulo no exporta legacyProjection / LegacyPlacement.
  assert(!/export\s+(const|function|interface|type)\s+legacyProjection\b/.test(activeRoomSrc),
    'F: legacyProjection extirpado de activeRoom');
  assert(!/export\s+(const|function|interface|type)\s+LegacyPlacement\b/.test(activeRoomSrc),
    'F: LegacyPlacement extirpado de activeRoom');
  // No hay second authority.
  const arImports = [...activeRoomSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  assert(arImports.every((p) => p.startsWith('./roomScenesData')),
    `F: activeRoom sólo importa roomScenesData: ${arImports.join(', ')}`);
  // Y la API es puramente local.
  const room = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  assert(room.id === 'plaza' && room.playerLocal.x === 1500 && room.playerLocal.y === 800,
    'F: ActiveRoom = { id, width, height, playerLocal }');
});

// ---------------------------------------------------------------------------
// G. Plaza 1920×1080 works at local origin.
// ---------------------------------------------------------------------------
test('G: Plaza 1920×1080 funciona en el origen local', () => {
  const p = plaza();
  assert(p.width === 1920 && p.height === 1080, 'G: Plaza 1920×1080');
  const room = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  const bounds = activeRoomLocalBounds(room);
  assert(bounds.x === 0 && bounds.y === 0 && bounds.w === 1920 && bounds.h === 1080,
    'G: bounds locales = (0, 0, 1920, 1080)');
  // El spawn interno de la Plaza NO depende de world offsets.
  const room2 = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  assert(room2.playerLocal.x === 1500 && room2.playerLocal.y === 800,
    'G: spawn local preservado');
  // El schematic del mapa M (sin offsets físicos) la incluye.
  const sch = mapSchematicOf(PLAZA);
  assert(sch !== null, 'G: Plaza está en el schematic');
  assert(sch!.rooms.includes(PLAZA), 'G: Plaza listada en el schematic');
});

// ---------------------------------------------------------------------------
// H. Taller 960×540 works at local origin.
// ---------------------------------------------------------------------------
test('H: Taller 960×540 funciona en el origen local', () => {
  // Taller no declara width/height → cae al default 960×540 vía
  // `areaDimensions`. Verificamos la autoridad del helper, no el
  // literal del RoomSceneProfile.
  const dims = areaDimensions(TALLER);
  assert(dims.width === 960 && dims.height === 540, 'H: Taller 960×540 (default)');
  const room = createActiveRoom(TALLER, { x: 480, y: 270 });
  const bounds = activeRoomLocalBounds(room);
  assert(bounds.x === 0 && bounds.y === 0 && bounds.w === 960 && bounds.h === 540,
    'H: bounds locales = (0, 0, 960, 540)');
  // Y Plaza y Taller son rooms distintas en el mismo sistema.
  const plazaR = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  const tallerR = createActiveRoom(TALLER, { x: 480, y: 270 });
  assert(!isSameActiveRoom(plazaR, tallerR), 'H: Plaza y Taller son rooms distintas');
});

// ---------------------------------------------------------------------------
// I. Plaza→Taller and Taller→Plaza still resolve via RoomGraph.
// ---------------------------------------------------------------------------
test('I: Plaza→Taller y Taller→Plaza resuelven vía RoomGraph (topología)', () => {
  const g = realGraph();
  // Plaza → Taller (forward)
  const c1 = g.connection('plaza', 'taller');
  assert(c1 !== undefined, 'I: plaza→taller existe');
  assert(c1!.to === 'taller', 'I: destino = taller');
  // Taller → Plaza (back)
  const c2 = g.connection('taller', 'plaza');
  assert(c2 !== undefined, 'I: taller→plaza existe');
  assert(c2!.to === 'plaza', 'I: destino = plaza');
  // La entrada del destino es LOCAL.
  const r1 = g.resolve('plaza', 'taller');
  assert(r1 !== null, 'I: plaza→taller resuelve');
  assert(r1!.entry.x >= 0 && r1!.entry.x < r1!.targetSize.width, 'I: entry.x dentro del Taller');
  assert(r1!.entry.y >= 0 && r1!.entry.y < r1!.targetSize.height, 'I: entry.y dentro del Taller');
});

// ---------------------------------------------------------------------------
// J. active-room collision from R5 remains local.
// ---------------------------------------------------------------------------
test('J: collidesLocal sigue siendo la autoridad de colisión room-local', () => {
  assert(/private\s+collidesLocal\s*\(/.test(scene), 'J: collidesLocal existe');
  // Su cuerpo no consulta worldOf / legacyProjection / chunks.
  const body = scene.match(/private\s+collidesLocal\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*?)\n  \}/);
  assert(body !== null, 'J: cuerpo de collidesLocal presente');
  assert(!/worldOf/.test(body![1]), 'J: collidesLocal no consulta worldOf');
  assert(!/legacyProjection/.test(body![1]), 'J: collidesLocal no consulta legacyProjection');
  assert(!/activeLegacyPlacement/.test(body![1]), 'J: collidesLocal no consulta activeLegacyPlacement');
  // Y nearestLegalPoint (su rescue) tampoco.
  const nlp = scene.match(/private\s+nearestLegalPoint\s*\([^)]*\)\s*:\s*\{[\s\S]*?\n  \}/);
  assert(nlp !== null, 'J: cuerpo de nearestLegalPoint presente');
  assert(!/worldOf/.test(nlp![0]), 'J: nearestLegalPoint no consulta worldOf');
  assert(!/legacyProjection/.test(nlp![0]), 'J: nearestLegalPoint no consulta legacyProjection');
});

// ---------------------------------------------------------------------------
// K. no normal runtime import of legacyProjection remains.
// ---------------------------------------------------------------------------
test('K: ningún runtime importa legacyProjection', () => {
  // Ni activeRoom.ts lo exporta ni ExplorationScene.ts lo importa.
  assert(!/export\s+(const|function|interface|type)\s+legacyProjection\b/.test(activeRoomSrc),
    'K: activeRoom NO exporta legacyProjection');
  assert(!/import\s+.*legacyProjection/.test(scene),
    'K: ExplorationScene NO importa legacyProjection');
  // spatial.ts tampoco debe reintroducirlo.
  assert(!/legacyProjection/.test(spatialSrc), 'K: spatial.ts NO menciona legacyProjection');
  // activeArea.ts es stub deprecado: sólo re-exports puros.
  const activeAreaSrc = readFileSync(new URL('../src/jugar/activeArea.ts', import.meta.url), 'utf8');
  assert(!/legacyProjection/.test(activeAreaSrc), 'K: activeArea.ts NO menciona legacyProjection');
  assert(!/worldOf\b/.test(activeAreaSrc), 'K: activeArea.ts NO menciona worldOf');
});

// ---------------------------------------------------------------------------
// L. R1–R5 suites remain green (proxies).
// ---------------------------------------------------------------------------
test('L: suites R1–R5 están disponibles y los archivos fuente no rompieron sus invariantes', () => {
  // Verificamos que los módulos puros siguen siendo importables y
  // tienen la forma que las suites R1–R5 asumen.
  assert(/buildRoomGraph\(/.test(readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8')),
    'L: roomGraph sigue exportando buildRoomGraph');
  assert(/evaluateExit|resolveTransition|createTransitionLock/.test(
    readFileSync(new URL('../src/jugar/roomTransitions.ts', import.meta.url), 'utf8'),
  ), 'L: roomTransitions sigue exportando sus APIs R4');
  assert(/RoomSceneProfile/.test(readFileSync(new URL('../src/jugar/roomScenesData.ts', import.meta.url), 'utf8')),
    'L: roomScenesData sigue exportando ROOM_SCENES');
  // Y R5: collidesLocal como autoridad LOCAL sigue presente.
  assert(/private\s+collidesLocal\s*\(/.test(scene), 'L: collidesLocal sigue presente (R5)');
});

// ---------------------------------------------------------------------------
// EXTRA: spatial.ts ya no exporta los helpers del mundo continuo.
// ---------------------------------------------------------------------------
test('EXTRA: spatial.ts extirpó los helpers del mundo continuo', () => {
  assert(!/export\s+function\s+unionAreaBounds/.test(spatialSrc),
    'spatial.ts: unionAreaBounds extirpado');
  assert(!/export\s+function\s+chunkRectWorld/.test(spatialSrc),
    'spatial.ts: chunkRectWorld extirpado');
  assert(!/export\s+function\s+chunkCenterWorld/.test(spatialSrc),
    'spatial.ts: chunkCenterWorld extirpado');
  assert(!/export\s+function\s+isPointInsideChunk/.test(spatialSrc),
    'spatial.ts: isPointInsideChunk extirpado');
  assert(!/export\s+function\s+chunkPlacement/.test(spatialSrc),
    'spatial.ts: chunkPlacement extirpado');
  assert(!/export\s+function\s+localToWorld/.test(spatialSrc),
    'spatial.ts: localToWorld extirpado');
  assert(!/export\s+function\s+worldToLocal/.test(spatialSrc),
    'spatial.ts: worldToLocal extirpado');
  assert(!/export\s+interface\s+ChunkPlacement\b/.test(spatialSrc),
    'spatial.ts: interface ChunkPlacement extirpada');
  // Y conserva los helpers genuinamente room-local.
  assert(/export\s+function\s+isPointInsideArea/.test(spatialSrc),
    'spatial.ts: isPointInsideArea conservado');
  assert(/export\s+function\s+navigationBounds/.test(spatialSrc),
    'spatial.ts: navigationBounds conservado');
  assert(/export\s+function\s+getAreaDef/.test(spatialSrc),
    'spatial.ts: getAreaDef conservado');
});

// ---------------------------------------------------------------------------
// EXTRA: world.ts es un re-export de mapSchematic (sin offsets).
// ---------------------------------------------------------------------------
test('EXTRA: world.ts es un re-export de mapSchematic (sin offsets)', () => {
  const worldSrc = readFileSync(new URL('../src/jugar/world.ts', import.meta.url), 'utf8');
  // El módulo world.ts sólo re-exporta presentation-only.
  assert(/from\s+['"]\.\/mapSchematic\.ts['"]/.test(worldSrc),
    'world.ts re-exporta desde mapSchematic');
  assert(!/export\s+function\s+worldOf\b/.test(worldSrc),
    'world.ts: worldOf extirpado');
  assert(!/export\s+const\s+WORLDS\b/.test(worldSrc),
    'world.ts: WORLDS extirpado');
  assert(!/ox\s*:\s*number/.test(worldSrc),
    'world.ts: sin campos ox');
  assert(!/oy\s*:\s*number/.test(worldSrc),
    'world.ts: sin campos oy');
  // El nuevo mapSchematic.ts NO expone offsets.
  const mapSrc = readFileSync(new URL('../src/jugar/mapSchematic.ts', import.meta.url), 'utf8');
  assert(!/ox\s*:\s*number/.test(mapSrc), 'mapSchematic.ts: sin ox');
  assert(!/oy\s*:\s*number/.test(mapSrc), 'mapSchematic.ts: sin oy');
  // Pero conserva `name` y `accent` (presentation).
  assert(/name\s*:\s*string/.test(mapSrc), 'mapSchematic.ts: conserva name (presentation)');
  assert(/accent\s*:\s*number/.test(mapSrc), 'mapSchematic.ts: conserva accent (presentation)');
});

// ---------------------------------------------------------------------------
// EXTRA: el mapa M del runtime consulta RoomGraph (no chunks).
// ---------------------------------------------------------------------------
test('EXTRA: el mapa M del runtime consulta RoomGraph, no chunks', () => {
  // El método toggleMap consume `this.roomGraph()` para la
  // conectividad del mapa. Ya no itera `chunks`.
  const toggle = scene.match(/private\s+toggleMap\([^)]*\)\s*:\s*void\s*\{([\s\S]*?)\n  \}/);
  assert(toggle !== null, 'toggleMap presente');
  const tBody = toggle![1];
  assert(/this\.roomGraph\(\)/.test(tBody), 'toggleMap usa this.roomGraph()');
  assert(!/this\.chunks/.test(tBody), 'toggleMap NO itera this.chunks');
  assert(!/worldOf\(/.test(tBody), 'toggleMap NO consulta worldOf');
  // Y el active marker del mapa usa activeRoom.id.
  assert(/id\s*===\s*this\.activeRoom\.id/.test(tBody),
    'toggleMap compara con this.activeRoom.id (no currentChunk)');
});

// ---------------------------------------------------------------------------
// EXTRA: ActiveRoom, MAP_SCHEMATICS y ROOM_SCENES siguen siendo
// contratos válidos para los tests R1–R5.
// ---------------------------------------------------------------------------
test('EXTRA: contratos de los módulos puros se preservan', () => {
  // MAP_SCHEMATICS existe y tiene "ohmdal".
  assert(MAP_SCHEMATICS.length > 0, 'MAP_SCHEMATICS tiene al menos un sector');
  const ohmdal = MAP_SCHEMATICS.find((s) => s.id === 'ohmdal');
  assert(ohmdal !== undefined, 'sector "ohmdal" existe');
  assert(ohmdal!.rooms.includes('plaza'), 'plaza en el sector');
  assert(ohmdal!.rooms.includes('taller'), 'taller en el sector');
  // ROOM_SCENES tiene Plaza 1920×1080.
  const p = plaza();
  assert(p.width === 1920, 'Plaza.width = 1920');
  // ActiveRoom es un record puro.
  const room: ActiveRoom = createActiveRoom(PLAZA, { x: 1500, y: 800 });
  assert(typeof room.id === 'string' && typeof room.width === 'number'
    && typeof room.height === 'number'
    && typeof room.playerLocal.x === 'number' && typeof room.playerLocal.y === 'number',
    'ActiveRoom es un record puro (id, width, height, playerLocal)');
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('R6 — retire legacy world/offset plumbing tests:');
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
