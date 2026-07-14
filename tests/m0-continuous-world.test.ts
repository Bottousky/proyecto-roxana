import { readFileSync } from 'node:fs';
import { worldOf } from '../src/jugar/world.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const world = worldOf('plaza');
assert(world !== null, 'la plaza pertenece a un mundo continuo');
assert(worldOf('taller') === world, 'el Taller figura como ala este en el mapa de Ohmdal');
assert(world?.rooms.taller.ox === 960 && world?.rooms.taller.oy === 0, 'el Taller se ubica al este de la Plaza en el esquema global');
assert(world?.rooms.puerta.oy === -540, 'la Puerta queda al norte de la plaza');
assert(world?.rooms.manantial_ohm.oy === -1080, 'el Manantial continúa al norte de la Puerta');
assert(worldOf('manantial_ohm') === world, 'el Manantial comparte el exterior de Ohmdal');

// Fase A1: el interior del Castillo es un corredor vertical continuo, igual que puerta→manantial
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
assert(terraces?.rooms.terraces_top.oy === 540, 'el canal alto comienza al sur de la plaza');
assert(terraces?.rooms.terraces_aqueduct.oy === 2160, 'el Acueducto ocupa el fondo del valle');

const lighthouse = worldOf('lighthouse_hall');
assert(lighthouse === world, 'el Faro comparte el mundo de Ohmdal');
assert(lighthouse?.rooms.lighthouse_hall.ox === 960, 'el Faro nace al este del Acueducto');
assert(lighthouse?.rooms.lighthouse_lantern.ox === 3840, 'la Linterna corona el recorrido del lago');

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

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
assert(scene.includes('this.enterChunk(entered)'), 'el cruce cambia de zona sin teletransporte');
assert(
  scene.includes('if (hidden || d.locked?.()) this.solids.push'),
  'los portones trabados sellan el vano con una barrera física',
);
assert(
  scene.includes('const safe = this.nearestLegalPoint(this.player.x, this.player.y);'),
  'si el jugador queda en posición ilegal, se lo rescata al punto legal más cercano',
);
assert(scene.includes('const mapChunks = world?.rooms ?? this.chunks'), 'el mapa pintado usa la geografía global');
assert(scene.includes('beginDoorTransition'), 'las transiciones pintadas animan la comitiva');
assert(scene.includes('salasVisitadas.push(id)'), 'el mapa registra cada chunk al cruzarlo');

console.log('M0 continuous world tests: OK');
