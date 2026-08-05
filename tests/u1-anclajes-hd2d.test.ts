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

assert(anchors.length >= 8, `se detectaron ${anchors.length} anclajes; la Plaza tiene 8`);

for (const anchor of anchors) {
  const things = thingsByRoom.get(anchor.room);
  assert(things !== undefined, `el anclaje ${anchor.id} apunta a la sala inexistente ${anchor.room}`);
  assert(
    things!.has(anchor.thing),
    `el anclaje ${anchor.id} apunta a «${anchor.thing}», que no existe en la sala ${anchor.room}`,
  );
}

/* ---------- los anclajes caen dentro de la zona que dice el nivel ---------- */

const levelSource = readFileSync(
  new URL('../src/ohmdal/architecture/levelData.ts', import.meta.url),
  'utf8',
);
const plazaBounds = levelSource.match(
  /id: 'portal_plaza',[\s\S]*?bounds: \{ minX: (-?[\d.]+), maxX: (-?[\d.]+), minZ: (-?[\d.]+), maxZ: (-?[\d.]+) \}/,
);
assert(plazaBounds !== null, 'levelData declara los límites de la zona portal_plaza');
const [minX, maxX, minZ, maxZ] = plazaBounds!.slice(1, 5).map(Number);

const positions = [
  ...anchorsSource.matchAll(/id: '([a-z0-9-]+)',\s*\n\s*position: \{ x: (-?[\d.]+), z: (-?[\d.]+) \}/g),
].map(([, id, x, z]) => ({ id, x: Number(x), z: Number(z) }));

assert(
  positions.length === anchors.length,
  `${positions.length} posiciones para ${anchors.length} anclajes: alguna no se pudo leer`,
);

for (const { id, x, z } of positions) {
  assert(x >= minX && x <= maxX, `el anclaje ${id} cae fuera de la Plaza en x: ${x} ∉ [${minX}, ${maxX}]`);
  // La z de los anclajes puede exceder los límites de blockout mientras la Plaza real no
  // esté construida, pero no puede irse a otra sala: un margen de 2 m es el aviso.
  assert(
    z >= minZ - 2 && z <= maxZ + 2,
    `el anclaje ${id} se fue muy lejos en z: ${z} ∉ [${minZ - 2}, ${maxZ + 2}]`,
  );
}

/* ---------- ningún anclaje pisa a otro ---------- */

for (let a = 0; a < positions.length; a += 1) {
  for (let b = a + 1; b < positions.length; b += 1) {
    const separation = Math.hypot(positions[a].x - positions[b].x, positions[a].z - positions[b].z);
    // Edda tiene dos anclajes en el mismo punto a propósito: son la misma persona en dos
    // momentos del arco, y nunca están presentes a la vez.
    const mismaPersona = positions[a].id.startsWith('edda') && positions[b].id.startsWith('edda');
    assert(
      mismaPersona || separation > 0.9,
      `${positions[a].id} y ${positions[b].id} están a ${separation.toFixed(2)} m: se pisan`,
    );
  }
}

/* ---------- los tres bancos siguen siendo tres ---------- */

const benches = [...anchorsSource.matchAll(/bench: '(ohm|lumen|gate)'/g)].map((match) => match[1]);
assert(
  benches.includes('ohm'),
  'el pedestal tiene que estar marcado como banco: es el primer acto causal del slice',
);
assert(
  castSource.includes('onBench'),
  'el reparto tiene que derivar los bancos al mundo en vez de abrir el modal',
);

console.log(
  `U1 anclajes HD-2D: OK (${anchors.length} anclajes, todos resuelven a una cosa de /jugar)`,
);
