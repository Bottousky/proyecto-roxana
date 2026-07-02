import { readFileSync } from 'node:fs';
import { worldOf } from '../src/jugar/world.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const world = worldOf('plaza');
assert(world !== null, 'la plaza pertenece a un mundo continuo');
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

// Fase B: las tres regiones aplicadas se recorren como planos continuos.
const forge = worldOf('forge_yard');
assert(forge?.id === 'forge', 'la Forja tiene un plano regional propio');
assert(forge?.rooms.forge_infirmary.oy === -540, 'la Enfermería continúa al norte del Patio');
assert(forge?.rooms.forge_longchannel.oy === -1080, 'el Canal Largo continúa tras la Enfermería');
assert(forge?.rooms.forge_hall.oy === -1620, 'la Nave Mayor remata la columna de la Forja');
assert(worldOf('forge_hall') === forge, 'la Nave Mayor comparte el plano continuo de la Forja');

const terraces = worldOf('terraces_top');
assert(terraces?.id === 'terraces', 'las Terrazas tienen un plano regional propio');
assert(terraces?.rooms.terraces_mid.oy === 540, 'el reparto queda un nivel debajo del canal alto');
assert(terraces?.rooms.terraces_aqueduct.oy === 1620, 'el Acueducto ocupa el nivel inferior del valle');

const lighthouse = worldOf('lighthouse_hall');
assert(lighthouse?.id === 'lighthouse', 'el Faro tiene un plano regional propio');
assert(lighthouse?.rooms.lighthouse_bench.oy === -540, 'el Taller queda sobre la sala de máquinas');
assert(lighthouse?.rooms.lighthouse_lantern.oy === -1620, 'la Linterna corona la torre continua');

// Normalizamos CRLF -> LF: en Windows con core.autocrlf=true el working tree
// puede tener CRLF aunque el repo guarde LF; los asserts de texto no deben
// depender del line ending local.
const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
assert(rooms.includes("to: 'manantial_ohm'"), 'la Puerta abre un destino real');
assert(rooms.includes('f().puertaDone\n            ? null'), 'el camino se abre al resolver la Puerta');
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
assert(scene.includes('d.pushTo.x - cx'), 'los portones empujan hacia su propio chunk');
assert(scene.includes('salasVisitadas.push(id)'), 'el mapa registra cada chunk al cruzarlo');

console.log('M0 continuous world tests: OK');
