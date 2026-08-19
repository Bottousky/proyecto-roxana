import { readFileSync } from 'node:fs';
import { worldOf } from '../src/jugar/world.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const world = worldOf('plaza');
assert(world !== null, 'la plaza pertenece a un mundo continuo');
assert(worldOf('taller') === world, 'el Taller figura como ala este en el mapa de Ohmdal');
// Commit 4 (H3 — Plaza multi-área greybox): la Plaza pasó a
// 1920×1080 y el Taller se reposicionó a (1920, 0) para conectar
// físicamente al borde este de la Plaza.
assert(world?.rooms.taller.ox === 1920 && world?.rooms.taller.oy === 0, 'el Taller se ubica al este de la Plaza en el esquema global (commit 4: 1920,0)');
assert(world?.rooms.puerta.oy === -540, 'la Puerta queda al norte de la plaza');
assert(world?.rooms.manantial_ohm.oy === -1080, 'el Manantial continúa al norte de la Puerta');
assert(worldOf('manantial_ohm') === world, 'el Manantial comparte el exterior de Ohmdal');

// Fase A1: el interior del Castillo es un corredor vertical continuo, igual que puerta→manantial
// Commit 4: la Plaza ahora mide 1920×1080, así que el Castillo
// sigue ocupando x ∈ [-1920, -960). El offset ox=-960 no
// colisiona con la Plaza extendida.
assert(world?.rooms.castle_gate.ox === -960, 'el Castillo queda al oeste de la plaza');
assert(world?.rooms.castle_gallery.oy === -540, 'la Galería continúa al norte de la puerta del Castillo');
assert(world?.rooms.castle_branches.oy === -1080, 'los Ramales continúan al norte de la Galería');
assert(world?.rooms.castle_heart.oy === -1620, 'el Corazón continúa al norte de los Ramales');
assert(worldOf('castle_heart') === world, 'el Corazón comparte el mundo de Ohmdal');
for (const id of ['castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart']) {
  assert(world?.rooms[id].ox === -960, `${id} está alineado en la columna del Castillo`);
}

// Arco I: las regiones dejaron de ser mapas separados.
const forge = worldOf('forge_yard');
assert(forge === world, 'la Forja comparte el mundo de la plaza');
assert(forge?.rooms.forge_yard.ox === -960 && forge.rooms.forge_yard.oy === 540, 'la Forja comienza al oeste y abajo de la plaza');
assert(forge?.rooms.forge_hall.ox === -3840, 'la Nave Mayor remata el distrito industrial occidental');

const terraces = worldOf('terraces_top');
assert(terraces === world, 'las Terrazas comparten el mundo de la plaza');
// Commit 4: la Plaza pasó a 1920×1080, así que terraces_top
// arranca en y=1080 (justo debajo de la Plaza extendida).
assert(terraces?.rooms.terraces_top.oy === 1080, `el canal alto comienza al sur de la plaza (oy=${terraces?.rooms.terraces_top.oy}, esperado 1080)`);
assert(terraces?.rooms.terraces_aqueduct.oy === 2700, 'el Acueducto ocupa el fondo del valle (commit 4: +540)');

const lighthouse = worldOf('lighthouse_hall');
assert(lighthouse === world, 'el Faro comparte el mundo de Ohmdal');
assert(lighthouse?.rooms.lighthouse_hall.ox === 960, 'el Faro nace al este del Acueducto');
assert(lighthouse?.rooms.lighthouse_lantern.ox === 3840, 'la Linterna corona el recorrido del lago');

// Commit 4: la Plaza tiene `width: 1920, height: 1080` declarados
// en `roomScenesData`. El resto del mundo sigue 960×540 (no
// migramos dimensiones en este commit).
const scenes = readFileSync(new URL('../src/jugar/roomScenesData.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(/plaza:\s*\{[\s\S]*?width:\s*1920,/.test(scenes), 'la Plaza declara width: 1920 en ROOM_SCENES');
assert(/plaza:\s*\{[\s\S]*?height:\s*1080,/.test(scenes), 'la Plaza declara height: 1080 en ROOM_SCENES');

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
// R4: el cambio de room es una transición de GRAFO por salida; ya NO se cruza
// por chunkAt/enterArea (mecanismo legacy eliminado).
assert(scene.includes('requestRoomTransition'), 'las transiciones se disparan por salida (RoomGraph)');
assert(!scene.includes('this.enterArea(entered)'), 'ya no hay cruce de zona por chunkAt (R4)');
assert(
  scene.includes('if (hidden || d.locked?.()) this.solids.push'),
  'los portones trabados sellan el vano con una barrera física',
);
assert(
  scene.includes('const safe = this.nearestLegalPoint(this.player.x, this.player.y);'),
  'si el jugador queda en posición ilegal, se lo rescata al punto legal más cercano',
);
assert(scene.includes('const mapChunks = world?.rooms ?? this.chunks'), 'el mapa pintado usa la geografía global');
assert(scene.includes('performTransition'), 'las transiciones presentan la comitiva (R4)');
assert(scene.includes('salasVisitadas.push(id)'), 'el mapa registra cada chunk al cruzarlo');

console.log('M0 continuous world tests: OK');
