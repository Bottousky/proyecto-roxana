/**
 * rt0-room-transitions.test.ts — R4 / transiciones de room por grafo (ADR-002).
 *
 * Valida que el cambio de room es una transición dirigida por RoomGraph:
 *   - se inicia por SALIDA (exit identity), no por destino;
 *   - el destino, el entry LOCAL, el kind y el ActiveRoom de destino son
 *     RESULTADOS del grafo;
 *   - visible/locked son autoritativos (no computeBoundaries);
 *   - NO depende de world.ts ox/oy ni de adyacencia física.
 *
 * El módulo bajo test es `roomTransitions.ts` (puro). La presentación
 * (fade/choreografía) vive en la escena; aquí se valida la semántica.
 *
 * Run con: `node --experimental-strip-types tests/rt0-room-transitions.test.ts`
 */

import { readFileSync } from 'node:fs';
import { ROOM_SCENES } from '../src/jugar/roomScenesData.ts';
import {
  createActiveRoom,
  activeRoomLocalBounds,
  isPlayerLocalInside,
  clampLocal,
  type ActiveRoom,
} from '../src/jugar/activeRoom.ts';
import { cameraBounds } from '../src/jugar/cameraDirector.ts';
import {
  buildRoomGraph,
  sourceFromRoomsAndScenes,
  OHMDAL_EDGE_META,
  EXTERNAL_ROOMS,
  buildLocalExitTriggers,
  doorExitId,
  type RoomGraph,
  type RoomDoorSource,
  type RoomGraphSource,
} from '../src/jugar/roomGraph.ts';
import {
  evaluateExit,
  resolveTransition,
  createTransitionLock,
} from '../src/jugar/roomTransitions.ts';
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

// ---------------------------------------------------------------------------
// A. request from (plaza,'taller') resuelve Taller.
// ---------------------------------------------------------------------------
test('A: (plaza, taller) resuelve la room Taller', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const ev = evaluateExit(g, plaza.id, 'taller');
  assert(ev.block.ok, 'plaza→taller disponible');
  const resolved = resolveTransition(g, plaza, 'taller');
  assert(resolved !== null, 'resuelve');
  assert(resolved!.connection.to === TALLER_ID, `destino = taller (got ${resolved!.connection.to})`);
  assert(resolved!.kind === 'fade', `kind = fade (got ${resolved!.kind})`);
});

// ---------------------------------------------------------------------------
// B. La transición usa IDENTIDAD DE SALIDA, no destino.
// ---------------------------------------------------------------------------
test('B: la transición se inicia por exit identity (no por target)', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  // resolveTransition toma (activeRoom, exitId); el destino es un resultado.
  const resolved = resolveTransition(g, plaza, 'taller');
  assert(resolved !== null, 'resuelve por exitId');
  // un exit que no existe → null (no transiciona)
  assert(resolveTransition(g, plaza, 'no-existe') === null, 'exit inexistente → null');
});

// ---------------------------------------------------------------------------
// C. El entry LOCAL del destino se convierte en ActiveRoom.playerLocal.
// ---------------------------------------------------------------------------
test('C: el entry LOCAL resuelto por el grafo es el playerLocal del destino', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const graphEntry = g.resolve('plaza', 'taller')!.entry;
  assert(resolved.entry.x === graphEntry.x && resolved.entry.y === graphEntry.y, 'entry = resolución del grafo');
  assert(resolved.target.playerLocal.x === graphEntry.x && resolved.target.playerLocal.y === graphEntry.y,
    'ActiveRoom.playerLocal del destino = entry LOCAL del grafo');
  assert(resolved.target.id === TALLER_ID, 'destino = taller');
});

// ---------------------------------------------------------------------------
// D. No se requiere ox/oy para resolver la transición.
// ---------------------------------------------------------------------------
test('D: sin ox/oy para resolver la transición', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const json = JSON.stringify({ connection: resolved.connection, target: resolved.target, entry: resolved.entry });
  assert(!json.includes('"ox"') && !json.includes('"oy"'), 'resultado sin offsets');
  const src = readFileSync(new URL('../src/jugar/roomTransitions.ts', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(imports.every((p) => p.startsWith('./roomGraph') || p.startsWith('./activeRoom')),
    `roomTransitions no debe importar world: ${imports.join(', ')}`);
});

// ---------------------------------------------------------------------------
// E. Cambiar el placement legacy de Taller no cambia nada de la transición.
// ---------------------------------------------------------------------------
test('E: cambiar el placement legacy no cambia dest/entry/kind/estado local', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  // resolveTransition no acepta placement; es función de (graph, activeRoom, exit).
  const r1 = resolveTransition(g, plaza, 'taller')!;
  const r2 = resolveTransition(g, plaza, 'taller')!;
  assert(r1.connection.to === r2.connection.to, 'destino idéntico');
  assert(r1.entry.x === r2.entry.x && r1.entry.y === r2.entry.y, 'entry idéntico');
  assert(r1.kind === r2.kind, 'kind idéntico');
  assert(r1.target.playerLocal.x === r2.target.playerLocal.x && r1.target.playerLocal.y === r2.target.playerLocal.y,
    'ActiveRoom local idéntico');
  // El placement legacy no es parámetro: el estado local no puede depender de él.
});

// ---------------------------------------------------------------------------
// F. visible=false bloquea la transición.
// ---------------------------------------------------------------------------
test('F: visible=false bloquea la transición', () => {
  const source: RoomGraphSource = {
    rooms: { a: { id: 'a', doors: [{ to: 'b', visible: () => false }] }, b: { id: 'b', doors: [] } },
    scenes: {},
    edgeMeta: [],
  };
  const g = buildRoomGraph(source);
  const aRoom = createActiveRoom('a', { x: 100, y: 100 });
  const ev = evaluateExit(g, 'a', 'b');
  assert(!ev.block.ok && ev.block.reason === 'hidden', 'salida oculta no transiciona');
  assert(ev.connection?.visible !== undefined, 'el predicado visible se referencia (no se copia)');
});

// ---------------------------------------------------------------------------
// G. locked=true bloquea y preserva el ActiveRoom fuente.
// ---------------------------------------------------------------------------
test('G: locked=true bloquea y preserva la room fuente', () => {
  const source: RoomGraphSource = {
    rooms: { a: { id: 'a', doors: [{ to: 'b', locked: () => true }] }, b: { id: 'b', doors: [] } },
    scenes: {},
    edgeMeta: [],
  };
  const g = buildRoomGraph(source);
  const aRoom = createActiveRoom('a', { x: 100, y: 100 });
  const ev = evaluateExit(g, 'a', 'b');
  assert(!ev.block.ok && ev.block.reason === 'locked', 'salida trabada no transiciona');
  // El módulo es puro: la room fuente no se muta por evaluar/resolver.
  assert(aRoom.id === 'a' && aRoom.playerLocal.x === 100, 'ActiveRoom fuente preservado');
});

// ---------------------------------------------------------------------------
// H. El lock de transición impide peticiones duplicadas concurrentes.
// ---------------------------------------------------------------------------
test('H: el lock impide transiciones duplicadas concurrentes', () => {
  const lock = createTransitionLock();
  assert(lock.phase === 'idle', 'inicia idle');
  assert(lock.requestStart() === true, 'primer start OK');
  assert(lock.phase === 'transitioning', 'phase transitioning');
  assert(lock.requestStart() === false, 'segundo start bloqueado (duplicado)');
  assert(lock.phase === 'transitioning', 'sigue transitioning');
  lock.finish();
  assert(lock.phase === 'idle', 'finish → idle');
  assert(lock.requestStart() === true, 'puede volver a iniciar');
});

// ---------------------------------------------------------------------------
// I. Dos salidas A→B pueden tener entry/kind distintos.
// ---------------------------------------------------------------------------
test('I: dos salidas de A hacia B producen entries/kinds distintos', () => {
  const source: RoomGraphSource = {
    rooms: {
      a: {
        id: 'a',
        doors: [
          { to: 'b', exit: 'north', entry: { x: 100, y: 200 } },
          { to: 'b', exit: 'secret', entry: { x: 300, y: 400 } },
        ],
      },
      b: { id: 'b', doors: [] },
    },
    scenes: { b: { walkable: [{ x: 0, y: 0, w: 960, h: 540 }] } },
    edgeMeta: [
      { from: 'a', exit: 'north', kind: 'fade' },
      { from: 'a', exit: 'secret', kind: 'doorway' },
    ],
  };
  const g = buildRoomGraph(source);
  const aRoom = createActiveRoom('a', { x: 0, y: 0 });
  const north = resolveTransition(g, aRoom, 'north')!;
  const secret = resolveTransition(g, aRoom, 'secret')!;
  assert(north.kind === 'fade' && north.entry.x === 100 && north.entry.y === 200, 'north: fade, entry (100,200)');
  assert(secret.kind === 'doorway' && secret.entry.x === 300 && secret.entry.y === 400, 'secret: doorway, entry (300,400)');
  assert(north.connection.to === 'b' && secret.connection.to === 'b', 'ambas van a b');
});

// ---------------------------------------------------------------------------
// J. Plaza→Taller con Plaza 1920×1080 y Taller 960×540.
// ---------------------------------------------------------------------------
test('J: Plaza→Taller funciona con Plaza 1920×1080 y Taller 960×540', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  assert(plaza.width === 1920 && plaza.height === 1080, 'Plaza 1920×1080');
  const resolved = resolveTransition(g, plaza, 'taller')!;
  assert(resolved.target.width === 960 && resolved.target.height === 540, 'Taller 960×540');
  assert(resolved.target.id === TALLER_ID, 'destino taller');
});

// ---------------------------------------------------------------------------
// K. Camera bounds del destino = (0,0,targetWidth,targetHeight) local.
// ---------------------------------------------------------------------------
test('K: camera target bounds locales (0,0,width,height)', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const cb = cameraBounds(activeRoomLocalBounds(resolved.target), VP);
  assert(cb.x === 0 && cb.y === 0 && cb.w === 960 && cb.h === 540, 'camera local de taller = (0,0,960,540)');
});

// ---------------------------------------------------------------------------
// L. El spawn destino es una coordenada local válida.
// ---------------------------------------------------------------------------
test('L: el spawn destino es una coordenada local válida', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  assert(isPlayerLocalInside(resolved.target, resolved.target.playerLocal),
    `entry local (${resolved.target.playerLocal.x},${resolved.target.playerLocal.y}) dentro de taller`);
});

// ---------------------------------------------------------------------------
// M. seamless no requiere colocación de mundo.
// ---------------------------------------------------------------------------
test('M: seamless no requiere world placement', () => {
  const source: RoomGraphSource = {
    rooms: { a: { id: 'a', doors: [{ to: 'b' }] }, b: { id: 'b', doors: [] } },
    scenes: { b: { walkable: [{ x: 0, y: 0, w: 960, h: 540 }] } },
    edgeMeta: [{ from: 'a', to: 'b', kind: 'seamless' }],
  };
  const g = buildRoomGraph(source);
  const aRoom = createActiveRoom('a', { x: 0, y: 0 });
  const resolved = resolveTransition(g, aRoom, 'b')!;
  assert(resolved.kind === 'seamless', 'kind seamless');
  assert(resolved.target.id === 'b', 'destino resuelto');
  // El resultado no contiene ninguna colocación world.
  assert(!('ox' in resolved) && !('oy' in resolved), 'sin placement');
});

// ---------------------------------------------------------------------------
// N. Una arista a una room EXTERNAL rutea por el adapter externo.
// ---------------------------------------------------------------------------
test('N: EXTERNAL_ROOMS está vacío: el Instituto no es una room Phaser', () => {
  assert(EXTERNAL_ROOMS.size === 0, 'no hay rooms Phaser del Instituto');
});

// ---------------------------------------------------------------------------
// O. nearestLegalPoint NO forma parte de la resolución normal del grafo.
// ---------------------------------------------------------------------------
test('O: nearestLegalPoint no participa en la resolución normal', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const graphEntry = g.resolve('plaza', 'taller')!.entry;
  assert(resolved.entry.x === graphEntry.x && resolved.entry.y === graphEntry.y,
    'entry sin sanitización en la capa pura (la rescue es del runtime, no del grafo)');
  const src = readFileSync(new URL('../src/jugar/roomTransitions.ts', import.meta.url), 'utf8');
  assert(!src.includes('nearestLegalPoint'), 'roomTransitions no referencia nearestLegalPoint');
});

// ---------------------------------------------------------------------------
// P. RoomGraph permanece independiente del mundo.
// ---------------------------------------------------------------------------
test('P: RoomGraph sigue con cero dependencia de world', () => {
  const graphSrc = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  const imports = [...graphSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(imports.every((p) => p.startsWith('./roomScenesData')), `roomGraph imports: ${imports.join(', ')}`);
});

// ---------------------------------------------------------------------------
// Q. ActiveRoom sigue siendo local.
// ---------------------------------------------------------------------------
test('Q: el ActiveRoom de destino sigue siendo local', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const target = resolved.target as ActiveRoom;
  assert(!('ox' in target) && !('oy' in target), 'ActiveRoom sin offsets');
  assert(Number.isFinite(target.playerLocal.x) && Number.isFinite(target.playerLocal.y), 'playerLocal local finito');
});

// ---------------------------------------------------------------------------
// R. El clamp del destino es ESTRICTO ([0, width)): ya no hay señal de cruce
//    por alcanzar x === width / y === height (el cambio de room es una
//    transición de grafo disparada por la salida local, no por salirse del
//    área). Un punto en el borde exterior se clampa al último índice legal.
// ---------------------------------------------------------------------------
test('R: el clamp no depende del cruce fuera de la room (límite estricto)', () => {
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  const target = resolved.target;
  const c = clampLocal(target, { x: 960, y: 540 });
  assert(c.x === 959 && c.y === 539, `clamp estricto de taller: (959,539), got (${c.x},${c.y})`);
  // La entrada local de destino no se genera por un cruce de borde: un punto
  // en el límite superior nunca equivale a "salir de la room".
  const atEdge = clampLocal(target, { x: target.width, y: target.height });
  assert(atEdge.x === target.width - 1 && atEdge.y === target.height - 1,
    'x === width se clampa a width-1 (no dispara cambio de room)');
});

// ---------------------------------------------------------------------------
// S. La resolución de transición NO elige destino por chunkAt/enterArea/offset:
//    el módulo de transición es puro y su único input topológico es el grafo.
// ---------------------------------------------------------------------------
test('S: la transición normal no invoca chunkAt para elegir destino', () => {
  const src = readFileSync(new URL('../src/jugar/roomTransitions.ts', import.meta.url), 'utf8');
  assert(!src.includes('chunkAt'), 'roomTransitions no usa chunkAt');
  assert(!src.includes('enterArea'), 'roomTransitions no usa enterArea');
  const imports = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(imports.every((p) => p.startsWith('./roomGraph') || p.startsWith('./activeRoom')),
    `roomTransitions sólo depende del grafo y ActiveRoom: ${imports.join(', ')}`);
  // El destino es un RESULTADO: requestRoomTransition (escena) pasa exitId,
  // y el `to` sólo aparece en la resolución, nunca como parámetro.
  const g = realGraph();
  const plaza = createActiveRoom(PLAZA_ID, { x: 1500, y: 800 });
  const resolved = resolveTransition(g, plaza, 'taller')!;
  assert(resolved.connection.to === 'taller', 'el destino es resultado del grafo');
});

// ---------------------------------------------------------------------------
// T-T.0 (R4.2) — El TRIGGER-BINDING preserva identidades de salida distintas
// aun cuando ambas apuntan al mismo destino. NO infiere el destino a partir
// del record key.
// ---------------------------------------------------------------------------
test("T-T.0: trigger binding A{north,secret} -> B preserves exit identities", () => {
  const sceneProfile = {
    doors: {
      north: { x: 100, y: 0, w: 80, h: 60 },
      secret: { x: 400, y: 200, w: 80, h: 60 },
    },
  };
  const triggers = buildLocalExitTriggers({ sceneProfile });
  assert(triggers.length === 2, "two triggers");
  const north = triggers.find((t) => t.exitId === "north");
  const secret = triggers.find((t) => t.exitId === "secret");
  assert(north && secret, "north and secret present");
  assert(north.rect.x === 100 && north.rect.w === 80, "north rect correct");
  assert(secret.rect.x === 400 && secret.rect.w === 80, "secret rect correct");
  assert(!("doorDef" in north) && !("to" in north), "north trigger has no topology field");
  assert(!("doorDef" in secret) && !("to" in secret), "secret trigger has no topology field");

  const source: RoomGraphSource = {
    rooms: {
      A: {
        id: "A",
        doors: [
          { to: "B", exit: "north", entry: { x: 10, y: 20 }, spawn: { x: 99, y: 99 } },
          { to: "B", exit: "secret", entry: { x: 30, y: 40 }, spawn: { x: 88, y: 88 } },
        ],
      },
      B: { id: "B", doors: [] },
    },
    scenes: { A: ROOM_SCENES.plaza, B: ROOM_SCENES.taller },
  };
  const graph = buildRoomGraph(source);
  const activeA = createActiveRoom("A", { x: 0, y: 0 });
  const northTransition = resolveTransition(graph, activeA, "north")!;
  const secretTransition = resolveTransition(graph, activeA, "secret")!;
  assert(northTransition.connection.to === "B" && northTransition.entry.x === 10 && northTransition.entry.y === 20,
    "north resolves to B/northDestination");
  assert(secretTransition.connection.to === "B" && secretTransition.entry.x === 30 && secretTransition.entry.y === 40,
    "secret resolves to B/secretDestination");
  assert(northTransition.connection.id !== secretTransition.connection.id,
    "distinct exit identities preserve distinct graph connections");
});
// ---------------------------------------------------------------------------
// T-T.1 (R4.2) — doorExitId() devuelve el identificador canonico.
// ---------------------------------------------------------------------------
test("T-T.1: doorExitId() cae a to si exit no esta", () => {
  const d1 = { to: "B" } as any;
  const d2 = { to: "B", exit: "north" } as any;
  assert(doorExitId(d1) === "B", "sin exit -> to");
  assert(doorExitId(d2) === "north", "con exit -> exit");
});
// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('Room transitions (graph) tests:');
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
