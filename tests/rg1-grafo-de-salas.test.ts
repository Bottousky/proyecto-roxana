/**
 * rg1-grafo-de-salas.test.ts — restaurado desde `_legacy_r1-grafo-de-salas`
 * (R1 / RoomGraph, ADR-002).
 *
 * Invariante de grafo: ningún destino de navegación puede apuntar a una
 * room que no existe. Nace de un bug real (`escuela_hub`); cubre la regla
 * "todo `to:`/`hooks.goto`/`state.room` resuelve a una room de ROOMS".
 *
 * Supervivencia respecto al original: TODAS las aserciones se conservan
 * (es un test de fuente, no depende de `rooms.ts` como módulo). No se
 * renombró ciegamente: pasó a la familia de tests del grafo (`rg*`) y
 * quedó alineado con `rg0-room-graph` (validación A del TEST_TAXONOMY).
 *
 * Se lee el fuente en vez de importarlo porque `rooms.ts` arrastra la UI de
 * puzzles y la Bitácora, que tocan el DOM al importarse.
 */

import { readFileSync } from 'node:fs';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const stateSource = readFileSync(new URL('../src/state.ts', import.meta.url), 'utf8');
const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal/topdownRuntime.ts', import.meta.url),
  'utf8',
);

// Sólo el cuerpo de ROOMS: antes hay declaraciones de tipo con la misma forma `nombre: {`.
const roomsBodyStart = roomsSource.indexOf('export const ROOMS');
assert(roomsBodyStart > 0, 'rooms.ts exporta ROOMS');
const roomsBody = roomsSource.slice(roomsBodyStart);

const declaredRooms = new Set(
  [...roomsBody.matchAll(/^ {2}([a-z_0-9]+): \{$/gm)].map((match) => match[1]),
);

assert(declaredRooms.size >= 23, `se detectaron ${declaredRooms.size} salas; el Arco I tiene 23`);
assert(declaredRooms.has('hall'), 'el hall del Instituto está declarado');
assert(declaredRooms.has('plaza'), 'la Plaza de Ohmdal está declarada');

/** Cada destino con su forma sintáctica, para que el mensaje de fallo diga dónde mirar. */
const destinations: ReadonlyArray<{ readonly kind: string; readonly pattern: RegExp }> = [
  { kind: 'puerta (to:)', pattern: /\bto: '([a-z_0-9]+)'/g },
  { kind: 'hooks.goto', pattern: /hooks\.goto\('([a-z_0-9]+)'/g },
  { kind: 'state.room =', pattern: /state\.room = '([a-z_0-9]+)'/g },
];

for (const { kind, pattern } of destinations) {
  for (const match of roomsBody.matchAll(pattern)) {
    const target = match[1];
    assert(
      declaredRooms.has(target),
      `destino ${kind} apunta a «${target}», que no es una sala de ROOMS`,
    );
  }
}

// `escuela_hub` fue el destino roto. Que no vuelva como valor: se buscan sólo comillas de
// string —no backticks— para que los comentarios puedan seguir explicando por qué se fue.
assert(
  !/['"]escuela_hub['"]/.test(roomsBody),
  'escuela_hub no puede reaparecer como destino: no es una sala montable',
);
assert(
  !/['"]escuela_hub['"]/.test(stateSource),
  'escuela_hub no puede volver a ser la sala por defecto del save',
);

// La sala inicial declarada en cada lado tiene que existir de verdad.
const roomsInitial = roomsSource.match(/export const SALA_INICIAL = '([a-z_0-9]+)'/);
assert(roomsInitial !== null, 'rooms.ts exporta SALA_INICIAL');
assert(declaredRooms.has(roomsInitial![1]), `SALA_INICIAL «${roomsInitial![1]}» tiene que existir`);

const stateInitial = stateSource.match(/const SALA_INICIAL = '([a-z_0-9]+)'/);
assert(stateInitial !== null, 'state.ts define su sala inicial en una constante nombrada');
assert(
  declaredRooms.has(stateInitial![1]),
  `la sala inicial del save «${stateInitial![1]}» tiene que existir en ROOMS`,
);
assert(
  stateInitial![1] === roomsInitial![1],
  'la sala inicial del save y la de rooms.ts no pueden divergir',
);

// La red de seguridad tiene que estar puesta antes de montar, no sólo definida.
assert(
  roomsSource.includes('export function resolverSala'),
  'rooms.ts expone resolverSala para normalizar saves viejos',
);
assert(
  runtimeSource.includes('resolverSala(state.room)'),
  'el runtime cenital normaliza la sala antes de montar la escena',
);

console.log(`R1 grafo de salas: OK (${declaredRooms.size} salas, todos los destinos resuelven)`);
