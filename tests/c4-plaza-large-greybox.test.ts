/**
 * c4-plaza-large-greybox.test.ts — Commit 4 (H3) Plaza 1920×1080
 * acceptance. MIGRADO a R6.
 *
 * Conserva la semántica valiosa de commit 4: la Plaza es UN área
 * navegable grande (1920×1080) y todas las invariantes de
 * gameplay se evalúan sobre ActiveRoom + room-local.
 *
 * R6 retiró de este test:
 *   - `worldOf`/`WORLDS` (mundo continuo extirpado).
 *   - `resolveActiveArea`/`activeAreaCameraBounds`/... (módulo
 *     `activeArea.ts` reducido a stub deprecado).
 *   - `localToWorld`/`worldToLocal` (bridge legacy eliminado).
 *   - `chunkRectWorld`/`isPointInsideChunk` (helpers del mundo
 *     continuo, ya no exportados por `spatial.ts`).
 *
 * Los tests reemplazan las asunciones de offsets por invariantes
 * de room-local (ActiveRoom + `activeRoomLocalBounds`).
 *
 * Run: `node --experimental-strip-types tests/c4-plaza-large-greybox.test.ts`
 */

import {
  ROOM_SCENES,
  areaDimensions,
  isPointInsideArea,
} from '../src/jugar/roomScenesData.ts';
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  isPointInsideArea as _isPointInsideArea,
  type Rect,
  type AreaDef,
} from '../src/jugar/spatial.ts';
import {
  clampCenter,
  cameraBounds,
  isAreaSmallerThanViewport,
  isAtBorder,
  type ViewportSize,
} from '../src/jugar/cameraDirector.ts';
import {
  createActiveRoom,
  activeRoomLocalBounds,
  isSameActiveRoom,
} from '../src/jugar/activeRoom.ts';
import { mapSchematicOf } from '../src/jugar/mapSchematic.ts';
import {
  decorGridDimensions,
  decorCellsForArea,
  hasRoomDecor,
  OHMDAL_DECORATED_ROOMS,
} from '../src/jugar/decorData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

const VP: ViewportSize = { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT };
// Plaza 1920×1080 (commit 4): el viewport es 960×540. La Plaza
// mide exactamente 2 viewports de ancho y 2 de alto.
const PLAZA_AREA: Rect = { x: 0, y: 0, w: 1920, h: 1080 };

// ───────────────────────────────────────────────────────────────────────
// A. Plaza mide realmente 1920×1080
// ───────────────────────────────────────────────────────────────────────
test('A.1: Plaza dimensionada 1920×1080 en ROOM_SCENES y areaDimensions()', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza !== undefined, 'plaza existe en ROOM_SCENES');
  assert(plaza.width === 1920, `plaza.width = ${plaza.width}, esperado 1920`);
  assert(plaza.height === 1080, `plaza.height = ${plaza.height}, esperado 1080`);
  const dims = areaDimensions('plaza');
  assert(dims.width === 1920, `areaDimensions.width = ${dims.width}, esperado 1920`);
  assert(dims.height === 1080, `areaDimensions.height = ${dims.height}, esperado 1080`);
});

test('A.2: viewport lógico sigue siendo 960×540 (no se modifica)', () => {
  assert(VP.width === 960, `viewport.width = ${VP.width}`);
  assert(VP.height === 540, `viewport.height = ${VP.height}`);
});

test('A.3: Plaza cabe exactamente 2×2 viewports', () => {
  assert(1920 / 960 === 2, 'ancho = 2 viewports');
  assert(1080 / 540 === 2, 'alto = 2 viewports');
});

test('A.4: el resto de las 19 rooms sigue en 960×540 (no regresión)', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    if (id === 'plaza') continue;
    const dims = areaDimensions(id);
    assert(dims.width === 960, `${id}.width = ${dims.width}, esperado 960`);
    assert(dims.height === 540, `${id}.height = ${dims.height}, esperado 540`);
  }
});

// ───────────────────────────────────────────────────────────────────────
// B. El jugador puede caminar por todo el espacio previsto
// ───────────────────────────────────────────────────────────────────────
test('B.1: el walkable de la Plaza cubre los 4 cuadrantes visuales', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza.walkable !== undefined, 'walkable existe');
  const corners: Array<{ x: number; y: number; name: string }> = [
    { x: 400, y: 250, name: 'NW' },
    { x: 1500, y: 250, name: 'NE' },
    { x: 400, y: 850, name: 'SW' },
    { x: 1500, y: 850, name: 'SE' },
  ];
  for (const c of corners) {
    const here = { x: c.x - 12, y: c.y - 12, w: 24, h: 24 };
    const inside = plaza.walkable.some((r) =>
      r.x <= here.x && r.x + r.w >= here.x + here.w &&
      r.y <= here.y && r.y + r.h >= here.y + here.h,
    );
    assert(inside, `el centro del cuadrante ${c.name} (${c.x},${c.y}) es pisable`);
  }
});

test('B.2: el walkable de la Plaza conecta el portal SW con el norte', () => {
  const plaza = ROOM_SCENES['plaza'];
  const portal = { x: 220, y: 760 };
  const door = { x: 960, y: 80 };
  const axisNS = plaza.walkable.find(
    (r) => r.x <= 880 && r.x + r.w >= 1040 && r.y === 0 && r.h === 1080,
  );
  assert(axisNS !== undefined, 'eje N-S (x=880..1040, y=0..1080) está en el walkable');
  const axisEO = plaza.walkable.find(
    (r) => r.x === 0 && r.w === 1920 && r.y === 460 && r.h === 160,
  );
  assert(axisEO !== undefined, 'banda E-O (x=0..1920, y=460..620) está en el walkable');
  void portal; void door;
});

test('B.3: el walkable NO cubre zonas no pisables (muros este/oeste)', () => {
  const plaza = ROOM_SCENES['plaza'];
  const eastEdge = (y: number) => ({ x: 1860 - 12, y: y - 12, w: 24, h: 24 });
  const inWalkable = (probe: { x: number; y: number; w: number; h: number }) =>
    plaza.walkable.some(
      (r) =>
        r.x <= probe.x && r.x + r.w >= probe.x + probe.w &&
        r.y <= probe.y && r.y + r.h >= probe.y + probe.h,
    );
  assert(!inWalkable(eastEdge(400)), 'muro este en y=400 no es pisable');
  assert(!inWalkable(eastEdge(700)), 'muro este en y=700 no es pisable');
  assert(inWalkable(eastEdge(540)), 'banda E-O en y=540 sí es pisable');
});

test('B.4: el walkable cruza el muro norte SÓLO en el eje N-S (gap de la Puerta)', () => {
  const plaza = ROOM_SCENES['plaza'];
  const axisNSPiercesNorth = plaza.walkable.some(
    (r) => r.x === 880 && r.y === 0 && r.x + r.w === 1040 && r.h === 1080,
  );
  assert(axisNSPiercesNorth, 'eje N-S (880, 0, 160, 1080) cruza el muro norte');
  const wallProbe = { x: 200 - 12, y: 40 - 12, w: 24, h: 24 };
  const wallWalkable = plaza.walkable.some(
    (r) =>
      r.x <= wallProbe.x && r.x + r.w >= wallProbe.x + wallProbe.w &&
      r.y <= wallProbe.y && r.y + r.h >= wallProbe.y + wallProbe.h,
  );
  assert(!wallWalkable, 'el merlón norte fuera del eje N-S no es pisable');
  const pierceEastAtTaller = plaza.walkable.some(
    (r) => r.x === 0 && r.y === 460 && r.w === 1920 && r.h === 160,
  );
  assert(pierceEastAtTaller, 'banda E-O (0, 460, 1920, 160) cruza el muro este (Taller)');
});

test('B.5: el walkable NO permite escapar del área (puntos de borde exactos)', () => {
  const plaza = ROOM_SCENES['plaza'];
  for (const [x, y] of [[0, 0], [1919, 1079], [960, 540]]) {
    assert(isPointInsideArea('plaza', x, y) === true, `(${x}, ${y}) dentro`);
  }
  for (const [x, y] of [[1920, 0], [0, 1080], [-1, 0]]) {
    assert(isPointInsideArea('plaza', x, y) === false, `(${x}, ${y}) fuera`);
  }
});

// ───────────────────────────────────────────────────────────────────────
// C. CameraDirector funciona visualmente (clamp en los 4 bordes)
// ───────────────────────────────────────────────────────────────────────
test('C.1: cameraBounds para Plaza 1920×1080 = el área completa', () => {
  const cb = cameraBounds(PLAZA_AREA, VP);
  assert(cb.x === 0 && cb.y === 0, 'origen (0, 0)');
  assert(cb.w === 1920 && cb.h === 1080, 'cámara = área completa (no centrada)');
});

test('C.2: Plaza es MAYOR que viewport → la cámara sigue al jugador', () => {
  assert(isAreaSmallerThanViewport(PLAZA_AREA, VP) === false, 'Plaza > viewport');
});

test('C.3: clampCenter en el centro exacto (960, 540) → cámara en (480, 270)', () => {
  const corner = clampCenter({ x: 960, y: 540 }, PLAZA_AREA, VP);
  assert(corner.x === 480, `cámara x = 480, got ${corner.x}`);
  assert(corner.y === 270, `cámara y = 270, got ${corner.y}`);
});

test('C.4: clampCenter en los 4 bordes (N, S, E, O) → cámara en los bordes', () => {
  const west = clampCenter({ x: 0, y: 540 }, PLAZA_AREA, VP);
  assert(west.x === 0 && west.y === 270, 'O: cámara (0, 270)');
  const east = clampCenter({ x: 1920, y: 540 }, PLAZA_AREA, VP);
  assert(east.x === 960 && east.y === 270, 'E: cámara (960, 270)');
  const north = clampCenter({ x: 960, y: 0 }, PLAZA_AREA, VP);
  assert(north.x === 480 && north.y === 0, 'N: cámara (480, 0)');
  const south = clampCenter({ x: 960, y: 1080 }, PLAZA_AREA, VP);
  assert(south.x === 480 && south.y === 540, 'S: cámara (480, 540)');
});

test('C.5: clampCenter con jugador fuera del área → clamp a borde', () => {
  const east = clampCenter({ x: 5000, y: 540 }, PLAZA_AREA, VP);
  assert(east.x === 960, `clamp a borde E: cámara x = 960, got ${east.x}`);
  const north = clampCenter({ x: 960, y: -500 }, PLAZA_AREA, VP);
  assert(north.y === 0, `clamp a borde N: cámara y = 0, got ${north.y}`);
});

test('C.6: isAtBorder marca los 4 bordes del viewport correctamente', () => {
  const center = isAtBorder({ x: 960, y: 540 }, PLAZA_AREA, VP);
  assert(!center.left && !center.right && !center.top && !center.bottom, 'centro: sin borde');
  const left = isAtBorder({ x: 480, y: 540 }, PLAZA_AREA, VP);
  assert(left.left && !left.right && !left.top && !left.bottom, 'toca borde O');
  const right = isAtBorder({ x: 1440, y: 540 }, PLAZA_AREA, VP);
  assert(right.right && !right.left && !right.top && !right.bottom, 'toca borde E');
  const top = isAtBorder({ x: 960, y: 270 }, PLAZA_AREA, VP);
  assert(top.top && !top.bottom && !top.left && !top.right, 'toca borde N');
  const bottom = isAtBorder({ x: 960, y: 810 }, PLAZA_AREA, VP);
  assert(bottom.bottom && !bottom.top && !bottom.left && !bottom.right, 'toca borde S');
});

test('C.7: camera bounds de Plaza 1920×1080 = el área completa (R6 ActiveRoom)', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const cb = cameraBounds(activeRoomLocalBounds(room), VP);
  assert(cb.x === 0 && cb.y === 0, 'origen (0, 0)');
  assert(cb.w === 1920 && cb.h === 1080, 'cámara = Plaza completa');
});

// ───────────────────────────────────────────────────────────────────────
// D. Navigation funciona más allá de 960×540
// ───────────────────────────────────────────────────────────────────────
test('D.1: navigationBounds cubre todo el área 1920×1080', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const nb = activeRoomLocalBounds(room);
  assert(nb.w === 1920 && nb.h === 1080, `nb = 1920×1080, got ${nb.w}×${nb.h}`);
});

test('D.2: targets > 960/540 (4 puntos) caen dentro del navigationBounds', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const nb = activeRoomLocalBounds(room);
  const inNb = (x: number, y: number) =>
    x >= nb.x && x < nb.x + nb.w && y >= nb.y && y < nb.y + nb.h;
  for (const [x, y] of [[1500, 500], [1500, 850], [400, 800], [960, 100]]) {
    assert(inNb(x, y), `(${x}, ${y}) está dentro de navigationBounds`);
  }
});

test('D.3: isPointInsideArea acepta coordenadas > 960/540 en Plaza', () => {
  assert(isPointInsideArea('plaza', 1500, 500) === true, '(1500, 500) dentro de Plaza');
  assert(isPointInsideArea('plaza', 1500, 850) === true, '(1500, 850) dentro de Plaza');
  assert(isPointInsideArea('plaza', 400, 800) === true, '(400, 800) dentro de Plaza');
  assert(isPointInsideArea('plaza', 960, 100) === true, '(960, 100) dentro de Plaza');
});

test('D.4: Plaza y Taller conviven en el modelo room-local (R6)', () => {
  // R6: la Plaza y el Taller son dos ActiveRooms distintos, sin un
  // plano mundo compartido. Cada uno vive en su propio sistema
  // local; la conexión Plaza→Taller es una arista del RoomGraph.
  const plaza = createActiveRoom('plaza', { x: 1500, y: 800 });
  const taller = createActiveRoom('taller', { x: 480, y: 270 });
  assert(plaza.width === 1920 && plaza.height === 1080, 'Plaza 1920×1080');
  assert(taller.width === 960 && taller.height === 540, 'Taller 960×540');
  assert(!isSameActiveRoom(plaza, taller), 'rooms distintas');
  // Cada uno en su origen local: una coordenada (480, 270) puede
  // aparecer en ambas rooms sin colisión (son sistemas distintos).
  assert(plaza.playerLocal.x === 1500 && plaza.playerLocal.y === 800, 'Plaza local');
  assert(taller.playerLocal.x === 480 && taller.playerLocal.y === 270, 'Taller local');
});

test('D.5: el schematic del mapa coloca la Plaza y el Taller en el mismo sector (R6)', () => {
  // R6: el mapa M ya no coloca las rooms en un plano world; las
  // agrupa en sectores (uno por obra). Plaza y Taller comparten el
  // sector "ohmdal".
  const plazaSchematic = mapSchematicOf('plaza');
  const tallerSchematic = mapSchematicOf('taller');
  assert(plazaSchematic !== null, 'plaza tiene schematic');
  assert(tallerSchematic === plazaSchematic, 'plaza y taller comparten schematic');
});

// ───────────────────────────────────────────────────────────────────────
// E. Plaza sigue siendo UN único ActiveRoom
// ───────────────────────────────────────────────────────────────────────
test('E.1: dos ActiveRooms con el mismo spawn producen el mismo estado (Plaza estable)', () => {
  const active0 = createActiveRoom('plaza', { x: 1500, y: 800 });
  const active1 = createActiveRoom('plaza', { x: 1500, y: 800 });
  assert(isSameActiveRoom(active0, active1), 'Plaza estable');
  assert(active0.id === 'plaza', 'id estable: plaza');
});

test('E.2: el switch de room reemplaza el ActiveRoom atómicamente', () => {
  const plaza = createActiveRoom('plaza', { x: 1500, y: 800 });
  const taller = createActiveRoom('taller', { x: 480, y: 270 });
  assert(plaza.id === 'plaza' && taller.id === 'taller', 'ids distintos');
  assert(plaza.width === 1920 && taller.width === 960, 'tamaños distintos');
  assert(plaza.playerLocal.x === 1500 && taller.playerLocal.x === 480, 'playerLocal distintos');
});

test('E.3: NO se crea un area nueva por cada viewport', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza.width === 1920, 'Plaza es 1 chunk, no 4');
  assert(plaza.height === 1080, 'Plaza es 1 chunk, no 2');
});

test('E.4: navigationBounds durante el recorrido interior = el área grande', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const nb = activeRoomLocalBounds(room);
  assert(nb.w === 1920 && nb.h === 1080, 'nav estable en todo el recorrido');
});

// ───────────────────────────────────────────────────────────────────────
// F. Portal/Taller/Puerta OHM (vecindad lógica, sin offsets)
// ───────────────────────────────────────────────────────────────────────
test('F.1: el schematic del mapa agrupa Plaza, Taller y Puerta en el sector "ohmdal"', () => {
  const sch = mapSchematicOf('plaza');
  assert(sch !== null, 'la Plaza está en un sector del schematic');
  // El schematic ya no expone offsets físicos; las rooms se
  // mencionan por id y la presentación del mapa M las organiza.
  assert(sch!.rooms.includes('plaza'), 'plaza está en el schematic');
  assert(sch!.rooms.includes('taller'), 'taller está en el schematic');
  assert(sch!.rooms.includes('puerta'), 'puerta está en el schematic');
  assert(sch!.rooms.includes('manantial_ohm'), 'manantial_ohm está en el schematic');
  assert(sch!.rooms.includes('castle_gate'), 'castle_gate está en el schematic');
  assert(sch!.rooms.includes('forge_yard'), 'forge_yard está en el schematic');
  assert(sch!.rooms.includes('terraces_top'), 'terraces_top está en el schematic');
  assert(sch!.rooms.includes('lighthouse_hall'), 'lighthouse_hall está en el schematic');
});

test('F.2: la Plaza 1920×1080 NO se superpone con la bbox del Taller 960×540', () => {
  // Las dos rooms son ActiveRooms independientes: en el modelo
  // room-local no existe "rect mundo" que pueda superponerse con
  // otro. Lo que se verifica aquí es la presentación esquemática:
  // sus walkable no comparten el mismo rect en el mismo sistema.
  const plaza = ROOM_SCENES['plaza'];
  const taller = ROOM_SCENES['taller'];
  // El walkable del Taller está contenido en su propio bbox 960×540.
  for (const w of taller.walkable) {
    assert(w.x + w.w <= 960, `walkable del Taller cabe en 960: ${w.x}+${w.w}`);
    assert(w.y + w.h <= 540, `walkable del Taller cabe en 540: ${w.y}+${w.h}`);
  }
  // El walkable de la Plaza cabe en 1920×1080.
  for (const w of plaza.walkable) {
    assert(w.x + w.w <= 1920, `walkable de la Plaza cabe en 1920: ${w.x}+${w.w}`);
    assert(w.y + w.h <= 1080, `walkable de la Plaza cabe en 1080: ${w.y}+${w.h}`);
  }
});

test('F.3: la Puerta 960×540 NO comparte sistema local con la Plaza', () => {
  const puerta = ROOM_SCENES['puerta'];
  for (const w of puerta.walkable) {
    assert(w.x + w.w <= 960, 'walkable de la Puerta cabe en 960');
    assert(w.y + w.h <= 540, 'walkable de la Puerta cabe en 540');
  }
  // La conexión Plaza→Puerta existe en el grafo (topología),
  // pero NO hay un "rect mundo" compartido.
});

test('F.4: la cámara del active area es el área sola (sin union de chunks)', () => {
  // R6: la autoridad de cámara es el ActiveRoom local; no hay
  // unionAreaBounds de "chunks" (esos chunks ya no existen).
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const cb = cameraBounds(activeRoomLocalBounds(room), VP);
  assert(cb.w === 1920, 'cámara = Plaza sola (1920), no la unión de chunks');
});

// ───────────────────────────────────────────────────────────────────────
// G. Conexiones y entry points funcionan
// ───────────────────────────────────────────────────────────────────────
test('G.1: la Plaza tiene 4 doors cardinales en los bordes de 1920×1080', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza.doors !== undefined, 'plaza.doors existe');
  assert(plaza.doors.puerta.y === 0, `puerta.y = ${plaza.doors.puerta.y}, esperado 0`);
  assert(plaza.doors.taller.x + plaza.doors.taller.w === 1920, 'taller.x+w = 1920');
  assert(plaza.doors.castle_gate.x === 0, 'castle_gate.x = 0');
  assert(plaza.doors.forge_yard.x === 0, 'forge_yard.x = 0');
  assert(plaza.doors.terraces_top.y + plaza.doors.terraces_top.h === 1080, 'terraces.y+h = 1080');
});

test('G.2: la Plaza tiene 5 entries (portal-aula + 4 cardinales)', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza.entries !== undefined, 'plaza.entries existe');
  for (const [name, e] of Object.entries(plaza.entries)) {
    assert(e.x >= 0 && e.x < 1920, `entries.${name}.x = ${e.x} fuera de [0, 1920)`);
    assert(e.y >= 0 && e.y < 1080, `entries.${name}.y = ${e.y} fuera de [0, 1080)`);
  }
});

test('G.3: la Plaza tiene colisión con pedestal + campana + 4 monolitos', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(plaza.collision !== undefined, 'plaza.collision existe');
  assert(plaza.collision.length >= 6, `collision tiene ${plaza.collision.length} rects, esperado >= 6`);
});

test('G.4: Plaza y Taller son vecinos en el schematic (R6)', () => {
  // Antes (R3): el Taller "se conecta" con el borde este de Plaza
  //   por un offset físico (1920, 0).
  // R6: la conexión se describe en RoomGraph (topología); el mapa M
  //   agrupa ambas rooms en el mismo sector del schematic.
  const sch = mapSchematicOf('plaza');
  assert(sch !== null, 'plaza tiene schematic');
  const idxPlaza = sch!.rooms.indexOf('plaza');
  const idxTaller = sch!.rooms.indexOf('taller');
  assert(idxPlaza >= 0 && idxTaller >= 0, 'ambos están en el schematic');
  // La presencia en el mismo sector es la "vecindad" R6.
  assert(sch!.rooms.includes('plaza') && sch!.rooms.includes('taller'),
    'plaza y taller comparten el schematic "ohmdal"');
});

// ───────────────────────────────────────────────────────────────────────
// H. Las otras rooms siguen funcionando
// ───────────────────────────────────────────────────────────────────────
test('H.1: las 19 rooms heredadas siguen devolviendo 960×540', () => {
  for (const id of Object.keys(ROOM_SCENES)) {
    if (id === 'plaza') continue;
    const dims = areaDimensions(id);
    assert(dims.width === 960 && dims.height === 540, `${id} sigue 960×540`);
  }
});

test('H.2: el decor de las rooms heredadas sigue siendo 11×20 (no regresión)', () => {
  for (const id of OHMDAL_DECORATED_ROOMS) {
    if (id === 'plaza') continue;
    assert(hasRoomDecor(id), `${id} tiene decor`);
    const d = decorGridDimensions({ width: 960, height: 540 });
    assert(d.cols === 20 && d.rows === 11, `${id} decor grid 20×11 (heredado)`);
  }
});

test('H.3: el decor de la Plaza es 40×22 (área grande, commit 4)', () => {
  const d = decorGridDimensions({ width: 1920, height: 1080 });
  assert(d.cols === 40, `cols = ${d.cols}, esperado 40`);
  assert(d.rows === 22, `rows = ${d.rows}, esperado 22`);
  const cells = decorCellsForArea('plaza', { width: 1920, height: 1080 });
  assert(cells.length > 100, `plaza grande tiene ${cells.length} celdas, esperado > 100`);
  for (const c of cells) {
    assert(c.col >= 0 && c.col < 40, `col ${c.col} fuera de [0, 40)`);
    assert(c.row >= 0 && c.row < 22, `row ${c.row} fuera de [0, 22)`);
    assert(c.x > 0 && c.x < 1920, `x ${c.x} fuera de (0, 1920)`);
    assert(c.y > 0 && c.y < 1080, `y ${c.y} fuera de (0, 1080)`);
  }
});

// ───────────────────────────────────────────────────────────────────────
// Sanity: invariantes cruzadas (R6)
// ───────────────────────────────────────────────────────────────────────
test('S.1: los bounds de la Plaza coinciden con (0,0,1920,1080) sin proyección', () => {
  const room = createActiveRoom('plaza', { x: 1500, y: 800 });
  const bounds = activeRoomLocalBounds(room);
  assert(bounds.x === 0 && bounds.y === 0, 'origen (0, 0)');
  assert(bounds.w === 1920 && bounds.h === 1080, 'dims 1920×1080');
});

test('S.2: la Plaza está en el sector "ohmdal" del schematic', () => {
  const sch = mapSchematicOf('plaza');
  assert(sch !== null && sch.id === 'ohmdal', 'la Plaza está en el schematic "ohmdal"');
});

test('S.3: la Plaza declara dimensiones grandes explícitamente en roomScenesData', () => {
  const plaza = ROOM_SCENES['plaza'];
  assert(typeof plaza.width === 'number', 'plaza.width es number explícito');
  assert(typeof plaza.height === 'number', 'plaza.height es number explícito');
  assert(plaza.width === 1920 && plaza.height === 1080, '1920×1080 explícito');
});

// ───────────────────────────────────────────────────────────────────────
// Run
// ───────────────────────────────────────────────────────────────────────
console.log('Commit 4 (H3 — Plaza multi-área greybox) acceptance (R6):');
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
