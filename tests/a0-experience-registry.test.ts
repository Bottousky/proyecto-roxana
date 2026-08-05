import { readFileSync } from 'node:fs';
import { EXPERIENCES, experienceById, experienceOfRoom } from '../src/experiences/registry.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

assert(EXPERIENCES.length === 5, 'el registro contiene los cinco lenguajes de experiencia');
assert(experienceOfRoom('plaza')?.id === 'ohmdal', 'la plaza conserva la identidad de Ohmdal');
assert(experienceOfRoom('castle_heart')?.id === 'ohmdal', 'el Castillo sigue siendo parte de Ohmdal');
assert(experienceOfRoom('hall')?.id === 'instituto', 'el hall pertenece al Instituto');
assert(experienceById('ohmdal').status === 'playable', 'Ohmdal es producto existente, no concepto futuro');
assert(experienceById('ohmdal').runtime === 'topdown-phaser', 'Ohmdal conserva su motor cenital');
assert(experienceById('physica').runtime === 'platformer-three', 'Physica se juega en su gramática Three de plataformero');
assert(experienceById('bitland').learningVerb === 'ejecutar', 'Bitland se define por su modelo mental');
assert(experienceById('arithmos').learningVerb === 'contemplar', 'Arithmos evita copiar el loop de Ohmdal');

const assignedRooms = EXPERIENCES.flatMap((experience) => experience.rooms);
assert(new Set(assignedRooms).size === assignedRooms.length, 'ninguna sala pertenece a dos experiencias');

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const declaredRooms = [...roomsSource.matchAll(/^  ([a-z0-9_]+): \{\r?\n    id: '\1',/gm)].map(
  (match) => match[1],
);
assert(declaredRooms.length > 0, 'el test encuentra las salas declaradas');
assert(
  declaredRooms.every((room) => experienceOfRoom(room) !== null),
  'toda sala jugable declara a qué experiencia pertenece',
);

console.log('A0 experience registry tests: OK');
