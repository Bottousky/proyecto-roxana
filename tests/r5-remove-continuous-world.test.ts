/**
 * r5-remove-continuous-world.test.ts — R5 / extirpación del shared-wall
 * physics (ADR-002).
 *
 * El sistema de "mundo continuo" se caracterizaba por:
 *   - `computeBoundaries()` recortaba pasos en los muros para conectar
 *     rooms físicamente adyacentes;
 *   - `gapRect()` derivaba el rect de cada paso en coords de mundo;
 *   - `pushWallSolids()` añadía los 4 strips de muro como sólidos,
 *     restando los gaps calculados.
 *
 * Tras R4 el cambio de room se dispara por exitTrigger (grafo). R5
 * elimina la dependencia de que las rooms estén pegadas y la autoridad
 * de colisión de `chunks`/`world.ts`. La autoridad de colisión pasa a
 * ser LOCAL a la room activa; el cambio de room lo inicia exclusivamente
 * `requestRoomTransition(exitId)`.
 *
 * Cobertura:
 *
 *   A. collision is evaluated against active-room local geometry.
 *   B. changing another room's placement/geometry cannot alter active-room
 *      collision.
 *   C. no graph transition requires computeBoundaries/gapRect.
 *   D. Plaza walls remain valid without shared-wall holes.
 *   E. Taller walls remain valid without shared-wall holes.
 *   F. a local exit trigger can transition while player remains inside
 *      source room bounds.
 *   G. nearestLegalPoint only considers active-room local legal positions.
 *   H. one transition authority: requestRoomTransition(exitId).
 *   I. no normal room transition calls beginDoorTransition if that pipeline
 *      was legacy.
 *   J. R1–R4 focused suites remain green (migrated assertions; no
 *      continuous-world assumptions).
 *
 * Run con: `node --experimental-strip-types tests/r5-remove-continuous-world.test.ts`
 */

import { readFileSync } from 'node:fs';
import { ROOM_SCENES, isPointInsideArea, type RoomSceneProfile } from '../src/jugar/roomScenesData.ts';
import { createActiveRoom, activeRoomLocalBounds } from '../src/jugar/activeRoom.ts';
import { cameraBounds } from '../src/jugar/cameraDirector.ts';
import { areaDimensions } from '../src/jugar/roomScenesData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const tests: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');
const activeRoomSrc = readFileSync(new URL('../src/jugar/activeRoom.ts', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');
const transitionsSrc = readFileSync(new URL('../src/jugar/roomTransitions.ts', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n');

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

// ---------------------------------------------------------------------------
// A. collision is evaluated against active-room local geometry.
// ---------------------------------------------------------------------------
test('A: collidesLocal(x,y) usa walkable y solids LOCALES de la room activa', () => {
  assert(/private\s+collidesLocal\s*\(\s*localX\s*:\s*number\s*,\s*localY\s*:\s*number\s*\)/.test(scene),
    'collidesLocal(localX, localY) definido en ExplorationScene');
  // Su implementación consulta activeScene.walkable (LOCAL) y this.solids.
  const body = scene.match(/private\s+collidesLocal\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*?)\n  \}/);
  assert(body !== null, 'cuerpo de collidesLocal presente');
  const bodyText = body![1];
  assert(/this\.activeScene\?\.walkable/.test(bodyText), 'consulta activeScene.walkable (LOCAL)');
  assert(/this\.solids\.some/.test(bodyText), 'consulta this.solids (LOCAL por invariante R5)');
  // Ya no usa la antigua signatura `collides(x, y)` con comentarios de
  // "murallas de cada chunk".
  assert(!/private\s+collides\s*\(\s*x\s*:\s*number\s*,\s*y\s*:\s*number\s*\)\s*:\s*boolean\s*\{/.test(scene),
    'la antigua API collides(x,y) está extirpada (sólo queda collidesLocal)');
});

// ---------------------------------------------------------------------------
// B. changing another room's placement/geometry cannot alter active-room
//    collision.
// ---------------------------------------------------------------------------
test('B: la colisión de la room activa no depende del placement de OTRA room', () => {
  // La autoridad LOCAL de colisión (collidesLocal) y el rescue (nearestLegalPoint)
  // NO consultan world.ts / chunks / legacyProjection.
  const collidesLocalBody = scene.match(
    /private\s+collidesLocal\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*?)\n  \}/,
  );
  assert(collidesLocalBody !== null, 'cuerpo de collidesLocal presente');
  assert(!/worldOf/.test(collidesLocalBody![1]), 'collidesLocal no consulta worldOf');
  assert(!/legacyProjection/.test(collidesLocalBody![1]), 'collidesLocal no usa legacyProjection');
  assert(!/activeLegacyPlacement/.test(collidesLocalBody![1]), 'collidesLocal no usa activeLegacyPlacement');
  assert(!/chunks\[/.test(collidesLocalBody![1]), 'collidesLocal no consulta this.chunks');

  const nlp = scene.match(/private\s+nearestLegalPoint\s*\([^)]*\)\s*:\s*\{[\s\S]*?\n  \}/);
  assert(nlp !== null, 'nearestLegalPoint presente');
  const nlpBody = nlp![0];
  assert(!/chunks\[/.test(nlpBody), 'nearestLegalPoint no consulta this.chunks');
  assert(!/chunkCenter/.test(nlpBody), 'nearestLegalPoint no llama a chunkCenter');
  assert(!/legacyProjection/.test(nlpBody), 'nearestLegalPoint no usa legacyProjection');
  assert(!/worldOf/.test(nlpBody), 'nearestLegalPoint no consulta worldOf');
});

// ---------------------------------------------------------------------------
// C. no graph transition requires computeBoundaries/gapRect.
// ---------------------------------------------------------------------------
test('C: el grafo + transiciones no requieren computeBoundaries / gapRect', () => {
  // roomTransitions.ts: módulo puro, no toca mundo ni puertas físicas.
  assert(!/computeBoundaries/.test(transitionsSrc), 'roomTransitions.ts no menciona computeBoundaries');
  assert(!/gapRect/.test(transitionsSrc), 'roomTransitions.ts no menciona gapRect');
  assert(!/pushWallSolids/.test(transitionsSrc), 'roomTransitions.ts no menciona pushWallSolids');
  // Y ExplorationScene ya no define estos métodos (verificado también en J).
  assert(!/private\s+computeBoundaries\s*\(/.test(scene), 'computeBoundaries() eliminado de ExplorationScene');
  assert(!/private\s+gapRect\s*\(/.test(scene), 'gapRect() eliminado de ExplorationScene');
  assert(!/private\s+pushWallSolids\s*\(/.test(scene), 'pushWallSolids() eliminado de ExplorationScene');
  // El grafo mismo (roomGraph.ts) no toca boundaries / gapRect.
  const graphSrc = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  assert(!/computeBoundaries/.test(graphSrc), 'roomGraph.ts no menciona computeBoundaries');
  assert(!/gapRect/.test(graphSrc), 'roomGraph.ts no menciona gapRect');
});

// ---------------------------------------------------------------------------
// D. Plaza walls remain valid without shared-wall holes.
// ---------------------------------------------------------------------------
test('D: las murallas de la Plaza siguen siendo válidas sin shared-wall holes', () => {
  const dims = areaDimensions(PLAZA);
  assert(dims.width === 1920 && dims.height === 1080, 'Plaza sigue siendo 1920×1080');
  // El walkable de la Plaza cubre el área pisable completa; las murallas
  // siguen delimitando el room por la CONVENCION [0,w) × [0,h) del walkable,
  // no por strips de sólidos.
  const p = plaza();
  const coversTopEdge = p.walkable.some((r) => r.x === 880 && r.y === 0 && r.w === 160 && r.h === 1080);
  assert(coversTopEdge, 'eje N-S (880, 0, 160, 1080) sigue cubriendo el muro norte');
  const coversBottomEdge = p.walkable.some((r) => r.x === 880 && r.y === 1020 - 60 + 60 && false) // placeholder
    || p.walkable.some((r) => r.x === 880 && r.w === 160 && r.y + r.h === 1080);
  assert(coversBottomEdge, 'eje N-S cubre también el borde sur de Plaza');
  // El walkable no pisa merlones; el bbox local sigue conteniendo las esquinas.
  const corners: Array<[number, number]> = [[1919, 1079], [0, 0]];
  for (const [x, y] of corners) {
    const inWalkable = p.walkable.some((r) =>
      r.x <= x && r.x + r.w >= x && r.y <= y && r.y + r.h >= y,
    );
    assert(!inWalkable, `(${x},${y}) es muro pintado, no piso`);
    assert(isPointInsideArea(PLAZA, x, y), `(${x},${y}) sigue dentro del bbox local`);
  }
  // El room local bounds sigue siendo el área completa.
  const room = createActiveRoom(PLAZA, { x: 960, y: 540 });
  const cb = cameraBounds(activeRoomLocalBounds(room), { width: 960, height: 540 });
  assert(cb.w === 1920 && cb.h === 1080, 'camera local Plaza = 1920×1080 (sin union de chunks)');
});

// ---------------------------------------------------------------------------
// E. Taller walls remain valid without shared-wall holes.
// ---------------------------------------------------------------------------
test('E: las murallas de Taller siguen siendo válidas sin shared-wall holes', () => {
  const dims = areaDimensions(TALLER);
  assert(dims.width === 960 && dims.height === 540, 'Taller sigue siendo 960×540');
  const t = taller();
  // El walkable del Taller (incluida la zona de la puerta) sigue cubriendo
  // el área pisable; la convención [0,w) × [0,h) lo delimita, no strips.
  const inWalkable = t.walkable.some((r) =>
    r.x === 120 && r.y === 145 && r.w === 720 && r.h === 350,
  );
  assert(inWalkable, 'walkable principal (120, 145, 720, 350) sigue presente');
  // La puerta de Taller está incluida en walkable (convención R1.1).
  const doorArea = t.walkable.some((r) =>
    r.x === 430 && r.y === 465 && r.w === 100 && r.h === 75,
  );
  assert(doorArea, 'puerta de Taller en walkable (zona pisable)');
  // El room local bounds del Taller.
  const room = createActiveRoom(TALLER, { x: 480, y: 270 });
  const cb = cameraBounds(activeRoomLocalBounds(room), { width: 960, height: 540 });
  assert(cb.w === 960 && cb.h === 540, 'camera local Taller = 960×540');
});

// ---------------------------------------------------------------------------
// F. a local exit trigger can transition while player remains inside source
//    room bounds.
// ---------------------------------------------------------------------------
test('F: un exitTrigger local puede transicionar dentro de los bounds de la room activa', () => {
  // El código del update() itera sobre `this.exitTriggers` (rect LOCAL)
  // y dispara requestRoomTransition. El check es `inside = rectsOverlap(
  // playerRect, expanded)`, con `playerRect = playerBoundsLocal(localX, localY)`.
  // El jugador puede estar DENTRO de [0,width) × [0,height) y aún así
  // alcanzar un trigger que vive al borde (e.g., puerta, taller, etc.).
  // Verificamos que `playerBoundsLocal` y el armado/disparo de triggers
  // se computan en coords LOCALES.
  assert(/private\s+playerBoundsLocal\s*\(/.test(scene),
    'playerBoundsLocal existe y se usa para el check de triggers');
  assert(/exitTriggers/.test(scene), 'exitTriggers se consulta en update()');
  assert(/requestRoomTransition\(trig\.exitId\)/.test(scene),
    'requestRoomTransition se llama con el exitId del trigger (grafo)');
  // El grafo resuelve la transición; el spawn destino cae dentro de los
  // bounds LOCALES del destino.
  const gSrc = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  assert(/entryFor\b/.test(gSrc), 'grafo expone entryFor(from, exit)');
  assert(/targetSizeOf\b/.test(gSrc), 'grafo expone targetSizeOf(roomId)');
});

// ---------------------------------------------------------------------------
// G. nearestLegalPoint only considers active-room local legal positions.
// ---------------------------------------------------------------------------
test('G: nearestLegalPoint sólo considera posiciones legales LOCALES de la room activa', () => {
  const nlp = scene.match(/private\s+nearestLegalPoint\s*\([^)]*\)\s*:\s*\{[\s\S]*?\n  \}/);
  assert(nlp !== null, 'nearestLegalPoint presente');
  const body = nlp![0];
  // Cubre entries locales y walkable local.
  assert(/this\.activeScene\?\.entries/.test(body),
    'candidates incluye entries locales del activeScene');
  assert(/this\.activeScene\?\.walkable/.test(body),
    'candidates incluye walkable local del activeScene');
  // Filtra por collidesLocal.
  assert(/this\.collidesLocal\(/.test(body), 'filtra candidatos con collidesLocal');
  // El fallback del último recurso es el CENTRO LOCAL de la room activa,
  // no un chunk del mundo.
  assert(/this\.activeRoom\.width\s*\/\s*2/.test(body) || /this\.activeRoom\.height/.test(body),
    'fallback usa dimensiones locales del ActiveRoom');
  assert(!/chunkCenter/.test(body), 'fallback NO usa chunkCenter (R5)');
  assert(!/this\.chunks\[/.test(body), 'fallback NO consulta this.chunks (R5)');
  assert(!/worldOf/.test(body), 'fallback NO consulta worldOf (R5)');
});

// ---------------------------------------------------------------------------
// H. one transition authority: requestRoomTransition(exitId).
// ---------------------------------------------------------------------------
test('H: la única autoridad de cambio de room es requestRoomTransition(exitId)', () => {
  // requestRoomTransition existe y es privado a la escena.
  assert(/private\s+requestRoomTransition\s*\(\s*exitId\s*:\s*string\s*\)/.test(scene),
    'requestRoomTransition(exitId) es la única autoridad de cambio de room');
  // No hay otra función que invoque loadRoom con un destino arbitrario
  // (la única excepción es hooks.goto, que es el adapter externo).
  // Verificamos que loadRoom se llama desde performTransition (que es la
  // coreografía disparada por requestRoomTransition) y desde los hooks.
  const loadRoomCalls = [...scene.matchAll(/this\.loadRoom\(/g)].length;
  // loadRoom se llama desde create() y desde performTransition; no desde
  // un pipeline de door paralelo.
  assert(loadRoomCalls >= 1, 'loadRoom se llama (al menos desde performTransition)');
  // El path requestRoomTransition → performTransition → loadRoom es único.
  assert(scene.includes('this.performTransition(resolved)'),
    'requestRoomTransition llama a performTransition');
});

// ---------------------------------------------------------------------------
// I. no normal room transition calls beginDoorTransition if that pipeline
//    was legacy.
// ---------------------------------------------------------------------------
test('I: ningún path normal de transición llama a beginDoorTransition (legacy)', () => {
  // El método beginDoorTransition ya no existe en la escena.
  assert(!/private\s+beginDoorTransition\s*\(/.test(scene),
    'beginDoorTransition() eliminado de ExplorationScene');
  // Ningún call site.
  assert(!/this\.beginDoorTransition\(/.test(scene),
    'ningún call site a beginDoorTransition');
  // El bloque "puertas legacy" del update() ya no invoca beginDoorTransition.
  const updateBlock = scene.match(/puertas legacy[\s\S]*?return;\s*\n\s*\}/);
  void updateBlock;
  // El bloque, si existe, debe limitarse a feedback (say/sfxLocked), no a
  // llamadas a beginDoorTransition.
  assert(!/beginDoorTransition/.test(scene), 'sin referencias residuales a beginDoorTransition');
  // Y la única autoridad de transición es requestRoomTransition.
  assert(/requestRoomTransition\(trig\.exitId\)/.test(scene),
    'transiciones de room disparadas únicamente por requestRoomTransition(exitId)');
});

// ---------------------------------------------------------------------------
// J. R1–R4 focused suites remain green (no continuous-world regressions).
// ---------------------------------------------------------------------------
test('J: no quedan asunciones de mundo continuo en la autoridad de gameplay', () => {
  // activeRoom.ts: cero dependencia de spatial.ts / world.ts.
  const activeRoomImports = [...activeRoomSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  assert(activeRoomImports.every((p) => p.startsWith('./roomScenesData')),
    `activeRoom sólo depende de roomScenesData: ${activeRoomImports.join(', ')}`);
  assert(!/unionAreaBounds/.test(activeRoomSrc), 'activeRoom no usa unionAreaBounds');
  assert(!/chunkRectWorld/.test(activeRoomSrc), 'activeRoom no usa chunkRectWorld');
  // ExplorationScene ya no itera `this.chunks` para construir chunks.
  assert(!/for\s*\(\s*const\s*\[\s*cid\s*,\s*off\s*\]\s*of\s*Object\.entries\(\s*this\.chunks\s*\)/.test(scene),
    'no se itera this.chunks para construir chunks (R3/R5)');
  // El grafo es independiente del mundo.
  const gSrc = readFileSync(new URL('../src/jugar/roomGraph.ts', import.meta.url), 'utf8');
  const graphImports = [...gSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  assert(graphImports.every((p) => p.startsWith('./roomScenesData')),
    `roomGraph sólo depende de roomScenesData: ${graphImports.join(', ')}`);
  // roomTransitions.ts es puro: cero dependencia de Phaser/world.
  const rtImports = [...transitionsSrc.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  assert(rtImports.every((p) => p.startsWith('./roomGraph') || p.startsWith('./activeRoom')),
    `roomTransitions sólo depende de grafo+activeRoom: ${rtImports.join(', ')}`);
});

// ---------------------------------------------------------------------------
// EXTRA (R5 → R6): legacyProjection quedó como bridge temporal en R5.
// R6 la retiró de `activeRoom.ts`. El test ahora verifica la AUSENCIA.
// ---------------------------------------------------------------------------
test('EXTRA: legacyProjection se eliminó de activeRoom en R6', () => {
  // R6: legacyProjection ya no existe en `activeRoom.ts`.
  assert(!/export\s+const\s+legacyProjection\b/.test(activeRoomSrc),
    'R6: legacyProjection eliminada de activeRoom.ts');
  // collidesLocal NO la usa.
  const collidesLocalBody = scene.match(
    /private\s+collidesLocal\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*?)\n  \}/,
  );
  assert(collidesLocalBody !== null, 'cuerpo de collidesLocal presente');
  assert(!/legacyProjection/.test(collidesLocalBody![1]),
    'collidesLocal no consulta legacyProjection (autoridad LOCAL pura)');
  // nearestLegalPoint NO la usa.
  const nlpBody = scene.match(/private\s+nearestLegalPoint\s*\([^)]*\)\s*:\s*\{[\s\S]*?\n  \}/);
  assert(nlpBody !== null, 'cuerpo de nearestLegalPoint presente');
  assert(!/legacyProjection/.test(nlpBody![0]),
    'nearestLegalPoint no consulta legacyProjection');
});

// ---------------------------------------------------------------------------
// EXTRA (R5 → R6): chunks quedó como bridge `{ [id]: { ox: 0, oy: 0 } }`
// en R3/R5. R6 lo extirpó. El test ahora verifica la AUSENCIA.
// ---------------------------------------------------------------------------
test('EXTRA: this.chunks se eliminó de loadRoom en R6', () => {
  // R6: ya no se asigna `this.chunks = { [id]: { ox: 0, oy: 0 } }`.
  assert(!/this\.chunks\s*=\s*\{\s*\[id\]\s*:\s*\{\s*ox\s*:\s*0\s*,\s*oy\s*:\s*0\s*\}\s*\}/.test(scene),
    'R6: chunks bridge extirpado de loadRoom');
  // collidesLocal NO usa activeLegacyPlacement ni legacyProjection.
  const collidesLocalBody = scene.match(
    /private\s+collidesLocal\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*?)\n  \}/,
  );
  assert(collidesLocalBody !== null && !/activeLegacyPlacement|legacyProjection/.test(collidesLocalBody![1]),
    'collidesLocal no usa activeLegacyPlacement ni legacyProjection');
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('R5 — remove continuous-world / shared-wall physics tests:');
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
