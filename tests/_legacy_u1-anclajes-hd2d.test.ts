// Ningún anclaje del mapa HD-2D puede apuntar a una cosa que no existe.
//
// El mundo HD-2D no copia el contenido del Arco I: cada punto de la Plaza apunta a una cosa
// de `src/jugar/rooms.ts`, y de ahí saca su rótulo, su prompt, cuándo aparece y qué pasa al
// interactuar. Ese acoplamiento es deliberado —una sola fuente de verdad para el guion— pero
// tiene un costo: renombrar una cosa en `/jugar` rompe el mundo HD-2D en silencio, porque el
// anclaje huérfano recién se descubre al caminar hasta él.
//
// Se lee el fuente en vez de importarlo porque `rooms.ts` arrastra la UI de puzzles y la
// Bitácora, que tocan el DOM al importarse. Mismo patrón que `r1-grafo-de-salas`.

import { readFileSync } from 'node:fs';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const anchorsSource = readFileSync(
  new URL('../src/ohmdal/content/u1Anchors.ts', import.meta.url),
  'utf8',
);
const castSource = readFileSync(new URL('../src/ohmdal/content/u1Cast.ts', import.meta.url), 'utf8');

/* ---------- las cosas que declara cada sala ---------- */

const roomsBody = roomsSource.slice(roomsSource.indexOf('export const ROOMS'));
const roomStarts = [...roomsBody.matchAll(/^ {2}([a-z_0-9]+): \{$/gm)];
assert(roomStarts.length >= 23, `se detectaron ${roomStarts.length} salas; el Arco I tiene 23`);

/** id de sala → ids de sus `things`, recortando el bloque de cada sala hasta la siguiente. */
const thingsByRoom = new Map<string, Set<string>>();
for (let index = 0; index < roomStarts.length; index += 1) {
  const start = roomStarts[index].index!;
  const end = index + 1 < roomStarts.length ? roomStarts[index + 1].index! : roomsBody.length;
  const block = roomsBody.slice(start, end);
  thingsByRoom.set(
    roomStarts[index][1],
    new Set([...block.matchAll(/\bid: '([a-z_0-9-]+)'/g)].map((match) => match[1])),
  );
}

assert(thingsByRoom.get('plaza')!.has('pedestal'), 'la Plaza declara el pedestal de Ohm');
assert(thingsByRoom.get('plaza')!.has('edda'), 'la Plaza declara a Edda');

/* ---------- cada anclaje resuelve ---------- */

const anchors = [
  ...anchorsSource.matchAll(
    /id: '([a-z0-9-]+)',\s*\n\s*position: \{[^}]*\},\s*\n\s*source: \{ room: '([a-z_0-9]+)', thing: '([a-z0-9-]+)' \}/g,
  ),
].map(([, id, room, thing]) => ({ id, room, thing }));

assert(anchors.length >= 20, `se detectaron ${anchors.length} anclajes; la Unidad 1 tiene 20`);

for (const anchor of anchors) {
  const things = thingsByRoom.get(anchor.room);
  assert(things !== undefined, `el anclaje ${anchor.id} apunta a la sala inexistente ${anchor.room}`);
  assert(
    things!.has(anchor.thing),
    `el anclaje ${anchor.id} apunta a «${anchor.thing}», que no existe en la sala ${anchor.room}`,
  );
}

/* ---------- los anclajes caen dentro de alguna zona del nivel ---------- */

const levelSource = readFileSync(
  new URL('../src/ohmdal/architecture/levelData.ts', import.meta.url),
  'utf8',
);
const zones = [
  ...levelSource.matchAll(
    /id: '(portal_plaza|taller|puerta_manantial)',[\s\S]*?bounds: \{ minX: (-?[\d.]+), maxX: (-?[\d.]+), minZ: (-?[\d.]+), maxZ: (-?[\d.]+) \}/g,
  ),
].map(([, id, minX, maxX, minZ, maxZ]) => ({
  id, minX: Number(minX), maxX: Number(maxX), minZ: Number(minZ), maxZ: Number(maxZ),
}));
assert(zones.length === 3, `levelData declara ${zones.length} zonas; el slice tiene 3`);

const positions = [
  ...anchorsSource.matchAll(/id: '([a-z0-9-]+)',\s*\n\s*position: \{ x: (-?[\d.]+), z: (-?[\d.]+) \}/g),
].map(([, id, x, z]) => ({ id, x: Number(x), z: Number(z) }));

assert(
  positions.length === anchors.length,
  `${positions.length} posiciones para ${anchors.length} anclajes: alguna no se pudo leer`,
);

// Un anclaje fuera de toda zona es contenido inalcanzable: el jugador no puede caminar hasta
// él porque la navegación lo frena antes. El margen de 0,5 m tolera props apoyados contra un
// muro, que están al alcance sin estar dentro del área caminable.
for (const { id, x, z } of positions) {
  const home = zones.find((zone) => (
    x >= zone.minX - 0.5 && x <= zone.maxX + 0.5 && z >= zone.minZ - 0.5 && z <= zone.maxZ + 0.5
  ));
  assert(home !== undefined, `el anclaje ${id} cae fuera de toda zona: (${x}, ${z})`);
}

/* ---------- ningún anclaje pisa a otro ---------- */

for (let a = 0; a < positions.length; a += 1) {
  for (let b = a + 1; b < positions.length; b += 1) {
    const separation = Math.hypot(positions[a].x - positions[b].x, positions[a].z - positions[b].z);
    // Edda y Lumen tienen varios anclajes: son la misma persona en momentos distintos del
    // arco, y sus predicados de visibilidad se excluyen entre sí.
    const persona = (id: string): string => id.split('-')[0];
    const mismaPersona = ['edda', 'lumen'].includes(persona(positions[a].id))
      && persona(positions[a].id) === persona(positions[b].id);
    assert(
      mismaPersona || separation > 0.9,
      `${positions[a].id} y ${positions[b].id} están a ${separation.toFixed(2)} m: se pisan`,
    );
  }
}

/* ---------- los tres bancos siguen siendo tres ---------- */

// Son los tres actos causales del slice —E2, E3 y E4— y la progresión de una variable por vez
// que describe `diseno-bancos-ohm-lumen.md`: unir, cambiar, ajustar.
const benches = [...anchorsSource.matchAll(/bench: '(ohm|lumen|gate)'/g)].map((match) => match[1]);
for (const bench of ['ohm', 'lumen', 'gate']) {
  assert(benches.includes(bench), `falta el anclaje del banco «${bench}»`);
}
assert(benches.length === 3, `hay ${benches.length} bancos declarados; la Unidad 1 tiene 3`);
assert(
  castSource.includes('onBench'),
  'el reparto tiene que derivar los bancos al mundo en vez de abrir el modal',
);

/* ---------- las tres escenas jugables tienen reparto ---------- */

const rooms = new Set(anchors.map((anchor) => anchor.room));
for (const room of ['plaza', 'taller', 'puerta', 'manantial_ohm']) {
  assert(rooms.has(room), `la sala ${room} no aporta ningún anclaje al mundo HD-2D`);
}

console.log(
  `U1 anclajes HD-2D: OK (${anchors.length} anclajes de ${rooms.size} salas, `
  + 'todos resuelven a una cosa de /jugar)',
);
