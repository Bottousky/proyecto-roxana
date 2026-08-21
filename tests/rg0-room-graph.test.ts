/**
 * rg0-room-graph.test.ts — R1 / RoomGraph (ADR-002, SPATIAL_CONTRACT §3).
 *
 * Valida la TOPOLOGÍA de producto, no offsets de mundo:
 *   - el grafo se deriva de `RoomDef.doors[].to` (fuente de verdad);
 *   - las entradas de destino se resuelven por perfil de escena → spawn → fallback;
 *   - NO lee `world.ts` (cero `ox/oy`, cero `unionAreaBounds`, cero `chunkRectWorld`);
 *   - la conexión Plaza→Taller es idéntica con cualquier colocación de mundo.
 *
 * Nota sobre la fuente real de rooms: `rooms.ts` arrastra UI/DOM y assets
 * `?url`, no importable en Node sin shims. Como `m0`/`_legacy_r1`, este test
 * lee el fuente de `rooms.ts` y extrae las doors reales (`to` + `spawn`),
 * y usa `ROOM_SCENES` real (módulo limpio). Si una door deja de tener `spawn`
 * o el formato cambia, el parser falla (assert de paridad) — no silencia.
 *
 * Run con: `node --experimental-strip-types tests/rg0-room-graph.test.ts`
 */

import { readFileSync } from 'node:fs';
import {
  ROOM_SCENES,
  type RoomSceneProfile,
  type SceneRect,
} from '../src/jugar/roomScenesData.ts';
import {
  buildRoomGraph,
  validateRoomGraph,
  sourceFromRoomsAndScenes,
  defaultEntryFallback,
  DEFAULT_TRANSITION_KIND,
  OHMDAL_EDGE_META,
  type RoomGraph,
  type RoomGraphSource,
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

function roomsFromParsedSource(): Record<string, { id: string; doors: RoomDoorSource[] }> {
  const rooms: Record<string, { id: string; doors: RoomDoorSource[] }> = {};
  const parsed = parseRoomsSource();
  for (const [id, room] of Object.entries(parsed)) {
    rooms[id] = { id, doors: room.doors.map((d) => ({ to: d.to, spawn: d.spawn })) };
  }
  return rooms;
}

function realSource(): RoomGraphSource {
  return sourceFromRoomsAndScenes(roomsFromParsedSource(), ROOM_SCENES, OHMDAL_EDGE_META);
}

function realGraph(): RoomGraph {
  return buildRoomGraph(realSource());
}

function rectContains(rect: SceneRect, x: number, y: number, inset = 0): boolean {
  return x - inset >= rect.x && x + inset <= rect.x + rect.w && y - inset >= rect.y && y + inset <= rect.y + rect.h;
}

function rectOverlapsBody(rect: SceneRect, x: number, y: number, inset = 12): boolean {
  return x + inset > rect.x && x - inset < rect.x + rect.w && y + inset > rect.y && y - inset < rect.y + rect.h;
}

// ---------------------------------------------------------------------------
// A. Todo target de door de RoomDef existe.
// ---------------------------------------------------------------------------
test('A: todo destino de door existe como room', () => {
  const g = realGraph();
  const rooms = parseRoomsSource();
  for (const [fromId, room] of Object.entries(rooms)) {
    for (const door of room.doors) {
      assert(g.rooms.includes(door.to), `«${fromId}» apunta a «${door.to}» que no es una room del grafo`);
    }
  }
});

// ---------------------------------------------------------------------------
// B/C. Todo edge tiene source y destination válidas.
// ---------------------------------------------------------------------------
test('B/C: todo edge tiene source y destination en el grafo', () => {
  const g = realGraph();
  const connections = g.connections();
  assert(connections.length > 40, `se derivaron ${connections.length} conexiones (esperado > 40)`);
  for (const conn of connections) {
    assert(g.rooms.includes(conn.from), `edge ${conn.id}: source «${conn.from}» inexistente`);
    assert(g.rooms.includes(conn.to), `edge ${conn.id}: destination «${conn.to}» inexistente`);
  }
});

// ---------------------------------------------------------------------------
// D. Todo edge resuelve una entry de destino (sin caer al fallback default).
// ---------------------------------------------------------------------------
test('D: todo edge resuelve una entry de destino (scene-entries o door-spawn)', () => {
  const g = realGraph();
  let defaultFallbacks = 0;
  for (const conn of g.connections()) {
    const resolved = g.resolve(conn.from, conn.exit);
    assert(resolved !== null, `«${conn.id}» no resuelve`);
    assert(
      Number.isFinite(resolved!.entry.x) && Number.isFinite(resolved!.entry.y),
      `«${conn.id}» tiene entry no finita`,
    );
    if (resolved!.entrySource === 'default') defaultFallbacks++;
  }
  assert(defaultFallbacks === 0, `${defaultFallbacks} edges caen al fallback default (la data real debería resolver scene-entries o spawn)`);
});

// ---------------------------------------------------------------------------
// E. Toda entry resuelta cae dentro de los límites LOCALES del destino.
// ---------------------------------------------------------------------------
test('E: toda entry resuelta cae dentro de los límites locales del destino', () => {
  const g = realGraph();
  for (const conn of g.connections()) {
    const resolved = g.resolve(conn.from, conn.exit)!;
    const { width, height } = resolved.targetSize;
    const e = resolved.entry;
    assert(e.x >= 0 && e.x < width, `«${conn.id}» entry.x=${e.x} fuera de [0,${width})`);
    assert(e.y >= 0 && e.y < height, `«${conn.id}» entry.y=${e.y} fuera de [0,${height})`);
  }
});

// ---------------------------------------------------------------------------
// F. El grafo no lee world.ts (ni ox/oy ni unión de mundo).
// ---------------------------------------------------------------------------
test('F: roomGraph no importa world.ts ni usa ox/oy', () => {
  const src = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const imports = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(imports.length > 0, 'roomGraph.ts debe tener imports');
  assert(
    imports.every((p) => p.startsWith('./roomScenesData')),
    `roomGraph.ts importa módulos inesperados: ${imports.join(', ')} (no debe tocar world.ts ni spatial.ts)`,
  );
  // El resultado de resolve() no expone offsets.
  const g = realGraph();
  const resolved = g.resolve('plaza', 'taller')!;
  const json = JSON.stringify(resolved);
  assert(!json.includes('"ox"') && !json.includes('"oy"'), 'resolve() no devuelve offsets de mundo');
});

// ---------------------------------------------------------------------------
// G. Plaza → Taller existe como conexión de grafo, independiente de la
//    adyacencia física.
// ---------------------------------------------------------------------------
test('G: plaza→taller existe como conexión de grafo (kind fade, entry en taller)', () => {
  const g = realGraph();
  const conn = g.connection('plaza', 'taller');
  assert(conn !== undefined, 'plaza→taller debe existir');
  assert(conn!.kind === 'fade', `plaza→taller kind = ${conn!.kind}, esperado 'fade' (ARC1 §4.1)`);
  const resolved = g.resolve('plaza', 'taller')!;
  const dims = resolved.targetSize;
  assert(rectContains({ x: 0, y: 0, w: dims.width, h: dims.height }, resolved.entry.x, resolved.entry.y),
    `entry de plaza→taller (${resolved.entry.x},${resolved.entry.y}) fuera de taller (${dims.width}×${dims.height})`);
  // La conexión no exige que taller esté "pegado" a plaza: no existe noción de
  // rect mundo en el contrato.
  assert(resolved.exit === null || typeof resolved.exit === 'object', 'exit resuelto coherente');
});

// ---------------------------------------------------------------------------
// H. Cambiar el ancho de Plaza de 960 a 1920 NO cambia la arista plaza→taller.
// ---------------------------------------------------------------------------
test('H: plaza 960 vs 1920 → la conexión plaza→taller es idéntica', () => {
  const smallScenes: Record<string, RoomSceneProfile> = {
    ...ROOM_SCENES,
    plaza: { ...ROOM_SCENES.plaza, width: 960, height: 540 },
  };
  const gSmall = buildRoomGraph(sourceFromRoomsAndScenes(roomsFromParsedSource(), smallScenes, OHMDAL_EDGE_META));
  const gBig = realGraph();

  const a = gSmall.connection('plaza', 'taller');
  const b = gBig.connection('plaza', 'taller');
  assert(a !== undefined && b !== undefined, 'plaza→taller existe en ambos');
  assert(a!.id === b!.id && a!.from === b!.from && a!.to === b!.to && a!.kind === b!.kind,
    'la conexión (id/from/to/kind) debe ser idéntica al cambiar el tamaño de Plaza');
  const entryA = gSmall.entryFor('plaza', 'taller');
  const entryB = gBig.entryFor('plaza', 'taller');
  assert(entryA && entryB && entryA.x === entryB.x && entryA.y === entryB.y,
    'la entry destino debe ser idéntica al cambiar el tamaño de Plaza');
});

// ---------------------------------------------------------------------------
// I. El grafo es válido con rooms de tamaños mixtos (Plaza 1920×1080 + resto).
// ---------------------------------------------------------------------------
test('I: grafo válido con rooms de tamaños mixtos (sin errores)', () => {
  const issues = validateRoomGraph(realGraph());
  const errors = issues.filter((i) => i.severity === 'error');
  assert(errors.length === 0, `errores de validación: ${errors.map((e) => `${e.code}:${e.connectionId ?? ''}`).join(', ')}`);
});

// ---------------------------------------------------------------------------
// J. Los predicados visible()/locked() se REFERENCIAN (no copian) y evalúan.
// ---------------------------------------------------------------------------
test('J: visible()/locked() se referencian y se evalúan correctamente', () => {
  const visibleFn = (): boolean => false;
  const lockedTrue = (): unknown => true;
  const lockedNull = (): unknown => null;
  const source: RoomGraphSource = {
    rooms: {
      a: {
        id: 'a',
        doors: [
          { to: 'b', visible: visibleFn },
          { to: 'c', locked: lockedTrue },
          { to: 'd', locked: lockedNull },
          { to: 'e' },
        ],
      },
      b: { id: 'b', doors: [] },
      c: { id: 'c', doors: [] },
      d: { id: 'd', doors: [] },
      e: { id: 'e', doors: [] },
    },
    scenes: {},
    edgeMeta: [],
  };
  const g = buildRoomGraph(source);
  // Referencia preservada (misma función, no una copia).
  assert(g.connection('a', 'b')!.visible === visibleFn, 'visible() debe referenciar la misma función');
  assert(g.connection('a', 'c')!.locked === lockedTrue, 'locked() debe referenciar la misma función');
  // Evaluación.
  assert(g.isAvailable(g.connection('a', 'b')!) === false, 'visible=false → no disponible');
  assert(g.isAvailable(g.connection('a', 'c')!) === false, 'locked=true → no disponible');
  assert(g.isAvailable(g.connection('a', 'd')!) === true, 'locked=null → disponible');
  assert(g.isAvailable(g.connection('a', 'e')!) === true, 'sin predicados → disponible (estructural)');
});

// ---------------------------------------------------------------------------
// K. La topología crítica del Arco 1 es alcanzable desde plaza ignorando locks.
// ---------------------------------------------------------------------------
test('K: critical path Arc 1 alcanzable desde plaza (ignorando locks)', () => {
  const g = realGraph();
  const issues = validateRoomGraph(g, { root: 'plaza' });
  const unreachable = issues.filter((i) => i.code === 'unreachable-room');
  assert(unreachable.length === 0, `rooms inalcanzables: ${unreachable.map((i) => i.message).join('; ')}`);

  // BFS explícito (dirigido) desde plaza.
  const reachable = new Set<string>(['plaza']);
  const queue = ['plaza'];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const conn of g.outgoing(current)) {
      if (!reachable.has(conn.to)) {
        reachable.add(conn.to);
        queue.push(conn.to);
      }
    }
  }
  const arc1Rooms = Object.keys(ROOM_SCENES);
  const missing = arc1Rooms.filter((id) => !reachable.has(id));
  assert(missing.length === 0, `rooms del Arco 1 inalcanzables desde plaza: ${missing.join(', ')}`);
});

// ---------------------------------------------------------------------------
// R7. Ruta dirigida Portal→Faro + entries estrictamente legales para el
// cuerpo real 24×24. La ida requiere los retornos narrativos entre obras.
// ---------------------------------------------------------------------------
test('R7: ruta dirigida Portal→Faro resuelve hasta lighthouse_lantern con backtracking', () => {
  const g = realGraph();
  const route = [
    'plaza',
    'taller', 'plaza',
    'puerta', 'manantial_ohm', 'puerta', 'plaza',
    'castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart',
    'castle_branches', 'castle_gallery', 'castle_gate',
    'forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall',
    'forge_longchannel', 'forge_infirmary', 'forge_yard', 'plaza',
    'terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct',
    'lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern',
  ];

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    const resolved = g.resolve(from, to);
    assert(resolved !== null && resolved.connection.to === to, `tramo dirigido ${from}→${to} resuelve`);
  }
});

test('R7: toda entry de la ruta Portal→Faro admite cuerpo 24×24 sin colisión ni rescue', () => {
  const g = realGraph();
  const route = [
    'plaza',
    'taller', 'plaza',
    'puerta', 'manantial_ohm', 'puerta', 'plaza',
    'castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart',
    'castle_branches', 'castle_gallery', 'castle_gate',
    'forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall',
    'forge_longchannel', 'forge_infirmary', 'forge_yard', 'plaza',
    'terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct',
    'lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern',
  ];
  const arrivals = [
    { from: 'portal', to: 'plaza', entry: ROOM_SCENES.plaza.entries?.aula },
    ...route.slice(0, -1).map((from, i) => {
      const to = route[i + 1];
      return { from, to, entry: g.resolve(from, to)?.entry };
    }),
  ];

  for (const arrival of arrivals) {
    assert(arrival.entry !== undefined, `${arrival.from}→${arrival.to} declara entry`);
    const profile = ROOM_SCENES[arrival.to];
    const entry = arrival.entry!;
    assert(profile.walkable.some((rect) => rectContains(rect, entry.x, entry.y, 12)),
      `${arrival.from}→${arrival.to} entry (${entry.x},${entry.y}) contiene cuerpo 24×24`);
    assert(!(profile.collision ?? []).some((rect) => rectOverlapsBody(rect, entry.x, entry.y)),
      `${arrival.from}→${arrival.to} entry (${entry.x},${entry.y}) evita colisión`);
  }
});

// ---------------------------------------------------------------------------
// VALIDACIÓN R7: la entry corregida de Forja no deja warnings.
// ---------------------------------------------------------------------------
test('I/validación R7: forge_infirmary→forge_yard no solapa colisión', () => {
  const issues = validateRoomGraph(realGraph());
  const collisionWarnings = issues.filter(
    (i) => i.code === 'entry-overlaps-collision' && i.connectionId === 'forge_infirmary->forge_yard',
  );
  assert(collisionWarnings.length === 0, 'forge_infirmary→forge_yard no debe emitir entry-overlaps-collision');
});

// ---------------------------------------------------------------------------
// INVARIANTE FUNDAMENTAL (ADR-002): la conexión plaza→taller no depende de
// NINGÚN world.ts placement. No se usa taller.ox, taller.oy, unionAreaBounds
// ni chunkRectWorld en ninguna parte de este test.
// ---------------------------------------------------------------------------
test('INVARIANTE ADR-002: plaza→taller es idéntico con cualquier colocación de mundo', () => {
  // El grafo es una función de (rooms, scenes), no de offsets. La fuente ni
  // siquiera tiene el concepto de colocación: sólo rooms + doors + scenes.
  const g1 = buildRoomGraph(realSource());
  const g2 = buildRoomGraph(realSource());
  const a = g1.resolve('plaza', 'taller')!;
  const b = g2.resolve('plaza', 'taller')!;
  assert(
    a.connection.id === b.connection.id &&
    a.connection.from === b.connection.from &&
    a.connection.to === b.connection.to &&
    a.connection.kind === b.connection.kind &&
    a.entry.x === b.entry.x && a.entry.y === b.entry.y,
    'construcciones independientes del mismo source producen la misma conexión',
  );
  // No hay ningún campo de colocación en el contrato.
  assert(!('ox' in a) && !('oy' in a), 'resolve() no expone ox/oy');
  assert(!('ox' in g1.source.rooms['taller']) && !('oy' in g1.source.rooms['taller']), 'la fuente no modela offsets');
  // La independencia es estructural: roomGraph.ts sólo importa
  // roomScenesData (nada de world.ts / spatial.ts / física de mundo).
  const src = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((mm) => mm[1]);
  assert(
    imports.every((p) => p.startsWith('./roomScenesData')),
    `roomGraph.ts no debe depender de world.ts/spatial.ts; imports: ${imports.join(', ')}`,
  );
});

// ---------------------------------------------------------------------------
// Extra: kinds soportados y metadata por defecto.
// ---------------------------------------------------------------------------
test('kinds válidos y default doorway', () => {
  assert(DEFAULT_TRANSITION_KIND === 'doorway', 'default debe ser doorway');
  const kinds = realGraph().connections().map((c) => c.kind);
  assert(kinds.every((k) => ['fade', 'doorway', 'cinematic', 'seamless'].includes(k)), 'todo kind es válido');
  const plazaPuerta = realGraph().connection('plaza', 'puerta');
  assert(plazaPuerta?.kind === 'cinematic', 'plaza→puerta = cinematic (Puerta monumental, ARC1 §4.1)');
});

// ---------------------------------------------------------------------------
// Extra: fallbacks de entry (contract §3.2).
// ---------------------------------------------------------------------------
test('resolución de entry: exit-entry → scene-entries → door-spawn → default', () => {
  const base: RoomSceneProfile = { walkable: [{ x: 0, y: 0, w: 960, h: 540 }] };
  const source: RoomGraphSource = {
    rooms: {
      a: {
        id: 'a',
        doors: [
          { to: 'b' },
          { to: 'c', spawn: { x: 50, y: 60 } },
          { to: 'd' },
          { to: 'e', entry: { x: 7, y: 9 } },
        ],
      },
      b: { id: 'b', doors: [] },
      c: { id: 'c', doors: [] },
      d: { id: 'd', doors: [] },
      e: { id: 'e', doors: [] },
    },
    scenes: {
      b: { ...base, entries: { a: { x: 100, y: 200 } } },
      c: { ...base },
      d: { ...base },
      e: { ...base, entries: { a: { x: 999, y: 999 } } },
    },
    edgeMeta: [],
  };
  const g = buildRoomGraph(source);
  const rB = g.resolve('a', 'b')!;
  assert(rB.entrySource === 'scene-entries' && rB.entry.x === 100 && rB.entry.y === 200, 'scene-entries (tras exit-entry ausente)');
  const rC = g.resolve('a', 'c')!;
  assert(rC.entrySource === 'door-spawn' && rC.entry.x === 50 && rC.entry.y === 60, 'door-spawn como fallback');
  const rD = g.resolve('a', 'd')!;
  const fb = defaultEntryFallback(960, 540);
  assert(rD.entrySource === 'default' && rD.entry.x === fb.x && rD.entry.y === fb.y, 'fallback documentado');
  const rE = g.resolve('a', 'e')!;
  assert(rE.entrySource === 'exit-entry' && rE.entry.x === 7 && rE.entry.y === 9,
    'exit-entry (específico de la salida) gana sobre entries[from] de la room destino');
});

// ---------------------------------------------------------------------------
// R1.1 — EXIT IDENTITY: la transición se inicia por SALIDA, no por destino.
// ---------------------------------------------------------------------------
test('A-R1.1: toda conexión tiene identidad de salida estable', () => {
  const g = realGraph();
  const rooms = parseRoomsSource();
  for (const conn of g.connections()) {
    assert(typeof conn.exit === 'string' && conn.exit.length > 0, `«${conn.id}» sin exit identity`);
    assert(conn.id === `${conn.from}->${conn.exit}`, `«${conn.id}» no coincide con from->exit`);
    // En la data actual el adapter es `exit = door.exit ?? door.to` y el key
    // de RoomSceneProfile.doors coincide con el destino.
    assert(conn.exit === conn.to, `«${conn.id}»: en la data actual exit debe igualar al destino (${conn.exit} != ${conn.to})`);
    const door = rooms[conn.from]?.doors.find((d) => d.to === conn.to);
    assert(door !== undefined, `«${conn.from}» no tiene door hacia «${conn.to}» en el fuente`);
  }
});

test('B/C-R1.1: resolve(from, exit) devuelve el destino sin requerirlo como input', () => {
  const g = realGraph();
  const r = g.resolve('plaza', 'taller');
  assert(r !== null, 'resolve(plaza, taller) resuelve');
  assert(r!.connection.to === 'taller', 'el destino es un RESULTADO de la salida, no un input');
  assert(r!.connection.exit === 'taller', 'exit identity coincide con el adapter actual');
});

test('D-R1.1: dos salidas de A hacia B (north, secret) son DOS conexiones distintas', () => {
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
    scenes: {
      // entries keyed por ROOM origen: NO distingue las dos salidas (limitation
      // documentada). El contrato la supera con entry por salida.
      b: { walkable: [{ x: 0, y: 0, w: 960, h: 540 }], entries: { a: { x: 0, y: 0 } } },
    },
    edgeMeta: [
      { from: 'a', exit: 'north', kind: 'fade' },
      { from: 'a', exit: 'secret', kind: 'doorway' },
    ],
  };
  const g = buildRoomGraph(source);
  const north = g.connection('a', 'north');
  const secret = g.connection('a', 'secret');
  assert(north !== undefined && secret !== undefined, 'ambas salidas existen');
  assert(north!.id !== secret!.id, `ids distintos (${north!.id} vs ${secret!.id})`);
  assert(north!.to === 'b' && secret!.to === 'b', 'ambas salidas van a b');
  assert(north!.kind === 'fade' && secret!.kind === 'doorway', 'E-R1.1: kinds distintos por salida');
  const rNorth = g.resolve('a', 'north')!;
  const rSecret = g.resolve('a', 'secret')!;
  assert(rNorth.entrySource === 'exit-entry' && rNorth.entry.x === 100 && rNorth.entry.y === 200,
    'F-R1.1: north resuelve su entry específico (gana sobre entries[from])');
  assert(rSecret.entrySource === 'exit-entry' && rSecret.entry.x === 300 && rSecret.entry.y === 400,
    'F-R1.1: secret resuelve su entry específico');
  const between = g.connectionsBetween('a', 'b');
  assert(between.length === 2, `G-R1.1: connectionsBetween(a,b) devuelve ambas (${between.length}), no una sola`);
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('RoomGraph tests:');
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
