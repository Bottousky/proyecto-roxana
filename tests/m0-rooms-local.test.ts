/**
 * m0-rooms-local.test.ts — R6 / invariantes room-local y de data de rooms.
 *
 * R6 renombró `m0-continuous-world.test.ts` (que testeaba offsets de un
 * plano mundo extirpado) a `m0-rooms-local.test.ts`. Conserva las
 * invariantes que SIGUEN siendo relevantes en el modelo room-local:
 *   - shape del catálogo de rooms en `rooms.ts`;
 *   - la Plaza grande 1920×1080 (commit 4);
 *   - el camino se abre al resolver la Puerta (door.locked());
 *   - los nombres de puertas monumentales y baked things;
 *   - las puertas cardinales de la Plaza declaradas en rooms.ts.
 *
 * Lo que se retiró:
 *   - asserts sobre `worldOf`/`WORLDS`: el mundo continuo dejó de ser
 *     autoridad de gameplay. Sus tests válidos migraron a
 *     `mapSchematicOf` y a `r6-retire-legacy-world`.
 *   - asserts sobre el bridge `nearestLegalPoint(player.x, ...)` (legacy
 *     world): migraron a `r5-remove-continuous-world`.
 *   - asserts sobre el render-scope de chunks (R3): migraron a `rr0`.
 *
 * Run: `node --experimental-strip-types tests/m0-rooms-local.test.ts`
 */

import { readFileSync } from 'node:fs';
import { mapSchematicOf, MAP_SCHEMATICS } from '../src/jugar/mapSchematic.ts';
import { ROOM_SCENES } from '../src/jugar/roomScenesData.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

// R6: la geografía deja de ser "continua" y pasa a ser esquemática.
// `mapSchematicOf` resuelve el sector al que pertenece cada roomId.
const ohmdal = MAP_SCHEMATICS.find((s) => s.id === 'ohmdal');
assert(ohmdal !== undefined, 'existe el schematic "ohmdal"');
assert(ohmdal!.name === 'Reino de Ohmdal', 'nombre del schematic');
assert(ohmdal!.accent === 0xd0a34a, 'color de acento del schematic');
// La Plaza está en el schematic (sin offsets).
assert(mapSchematicOf('plaza') === ohmdal, 'plaza → schematic ohmdal');
assert(mapSchematicOf('taller') === ohmdal, 'taller → schematic ohmdal');
assert(mapSchematicOf('forge_yard') === ohmdal, 'forge_yard → schematic ohmdal');
assert(mapSchematicOf('forge_hall') === ohmdal, 'forge_hall → schematic ohmdal');
// Y un roomId desconocido cae en null (no hay placement paralelo).
assert(mapSchematicOf('not_a_room') === null, 'roomId desconocido → null (no hay placement)');

// R6: la Plaza grande 1920×1080 declarada en `roomScenesData` se respeta
// en el schematic (no hay offsets, sólo presencia).
const plaza = ROOM_SCENES['plaza'];
assert(plaza !== undefined, 'plaza existe en ROOM_SCENES');
assert(plaza!.width === 1920 && plaza!.height === 1080, 'Plaza 1920×1080');

// Normalizamos CRLF -> LF: en Windows con core.autocrlf=true el working tree
// puede tener CRLF aunque el repo guarde LF; los asserts de texto no deben
// depender del line ending local.
const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(rooms.includes("to: 'manantial_ohm'"), 'la Puerta abre un destino real');
assert(
  rooms.includes("locked: () => (f().puertaDone ? null : true)"),
  'el camino se abre al resolver la Puerta y permanece silenciosamente bloqueado antes',
);
assert(rooms.includes("id: 'cauce-maestro'"), 'el destino muestra qué regula la Puerta');

// las 4 puertas del corredor del Castillo comparten x/w (alineación exacta de muro compartido)
assert(rooms.includes("x: 420, y: 514, w: 120, h: 26,"), 'las puertas sur del corredor del Castillo están alineadas');
assert(rooms.includes("x: 420, y: 0, w: 120, h: 26,"), 'las puertas norte del corredor del Castillo están alineadas');
assert(
  rooms.includes("id: 'puerta-castillo', x: 480, y: 20, w: 150, h: 84,"),
  'la Puerta monumental del Castillo queda empotrada en su muro, no flotando en el piso',
);
assert(
  rooms.includes("id: 'tronco-ramales', x: 480, y: 175, w: 70, h: 150,"),
  'el Tronco deja espacio jugable para alcanzar el umbral norte de los Ramales',
);

// Commit 4: la Plaza grande 1920×1080 reubica las 4 puertas
// cardinales de la Plaza. Cada door queda dentro del rect
// [0..1920)×[0..1080) y la dirección cardinal (norte/sur/este/
// oeste) es explícita.
assert(/x:\s*880,\s*y:\s*0,\s*w:\s*160,\s*h:\s*60,[\s\S]*?to:\s*'puerta'/.test(rooms), 'la Plaza tiene arco norte hacia la Puerta (880,0,160,60)');
assert(/x:\s*1820,\s*y:\s*500,\s*w:\s*100,\s*h:\s*80,[\s\S]*?to:\s*'taller'/.test(rooms), 'la Plaza tiene arco este hacia el Taller (1820,500,100,80)');
assert(/x:\s*0,\s*y:\s*460,\s*w:\s*60,\s*h:\s*80,[\s\S]*?to:\s*'castle_gate'/.test(rooms), 'la Plaza tiene arco oeste alto hacia el Castillo (0,460,60,80)');
assert(/x:\s*880,\s*y:\s*1020,\s*w:\s*160,\s*h:\s*60,[\s\S]*?to:\s*'terraces_top'/.test(rooms), 'la Plaza tiene arco sur hacia las Terrazas (880,1020,160,60)');

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
// R4 / R6: el cambio de room es una transición de GRAFO por salida; ya
// NO se cruza por chunkAt/enterArea ni por beginDoorTransition.
assert(scene.includes('requestRoomTransition'), 'las transiciones se disparan por salida (RoomGraph)');
assert(!scene.includes('this.enterArea(entered)'), 'ya no hay cruce de zona por chunkAt (R4)');
assert(
  scene.includes('if (hidden || d.locked?.()) this.solids.push'),
  'los portones trabados sellan el vano con una barrera física',
);
// MIGRADO (R5 → R6): el rescue usa coordenadas LOCALES del ActiveRoom.
assert(
  /this\.nearestLegalPoint\([\s\S]*?this\.activeRoom\.playerLocal/.test(scene),
  'R5/R6: nearestLegalPoint se invoca con la posición LOCAL del ActiveRoom',
);
assert(scene.includes('performTransition'), 'las transiciones presentan la comitiva (R4)');
assert(scene.includes('salasVisitadas.push(id)'), 'el mapa registra cada chunk al cruzarlo');

// MIGRADO (R5 → R6): el sistema shared-wall está extirpado y el bridge
// legacy está retirado del runtime.
assert(!scene.includes('computeBoundaries'), 'R5: computeBoundaries() extirpado');
assert(!scene.includes('pushWallSolids'), 'R5: pushWallSolids() extirpado');
assert(!scene.includes('beginDoorTransition'), 'R5: beginDoorTransition() extirpado');
assert(/private\s+collidesLocal\s*\(/.test(scene), 'R5: collidesLocal(x,y) introducido como autoridad LOCAL');
assert(!/private\s+computeBoundaries/.test(scene), 'R5: la firma `private computeBoundaries` no existe');
assert(!scene.includes('legacyProjection'), 'R6: legacyProjection extirpado del runtime');
assert(!scene.includes('activeLegacyPlacement'), 'R6: activeLegacyPlacement extirpado del runtime');
assert(!/this\.chunks\s*=\s*\{/.test(scene), 'R6: this.chunks bridge extirpado');
assert(!/this\.currentChunk\b/.test(scene), 'R6: this.currentChunk extirpado');

console.log('M0 rooms-local / data-shape tests: OK');
