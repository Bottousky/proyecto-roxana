// P0 — Physica en el registro de experiencias: gramática Three de plataformero,
// su sala de arranque y el loader que la monta.
import { readFileSync } from 'node:fs';
import { experienceById, experienceOfRoom } from '../src/experiences/registry.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

assert(experienceById('physica').status === 'playable', 'Physica pasa a ser un mundo jugable');
assert(experienceById('physica').runtime === 'platformer-three', 'Physica usa su gramática Three');
assert(experienceById('physica').learningVerb === 'sentir', 'Physica conserva su verbo: sentir');
assert(experienceOfRoom('cascada')?.id === 'physica', 'la sala cascada pertenece a Physica');

const loadersSource = readFileSync(new URL('../src/experiences/loaders.ts', import.meta.url), 'utf8');
assert(loadersSource.includes("'platformer-three'"), 'el loader de platformer-three está declarado');
assert(loadersSource.includes("import('./physica/physicaRuntime.ts')"), 'el loader apunta al runtime de Physica');

console.log('P0 physica registry: OK');
