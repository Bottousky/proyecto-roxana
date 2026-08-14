// P0 — Physica en el registro de experiencias: gramática Babylon de plataformero
// 2.5D (decisión de motor v0.2), su sala de arranque y los loaders que la montan.
import { readFileSync } from 'node:fs';
import { experienceById, experienceOfRoom } from '../src/experiences/registry.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

assert(experienceById('physica').status === 'playable', 'Physica pasa a ser un mundo jugable');
assert(experienceById('physica').runtime === 'platformer-babylon', 'Physica usa su gramática Babylon 2.5D');
assert(experienceById('physica').learningVerb === 'sentir', 'Physica conserva su verbo: sentir');
assert(experienceOfRoom('cascada')?.id === 'physica', 'la sala cascada pertenece a Physica');

const loadersSource = readFileSync(new URL('../src/experiences/loaders.ts', import.meta.url), 'utf8');
assert(loadersSource.includes("'platformer-babylon'"), 'el loader de platformer-babylon está declarado');
assert(loadersSource.includes("import('./physica/babylonRuntime.ts')"), 'el loader apunta al runtime Babylon de Physica');
assert(loadersSource.includes("'platformer-three'"), 'el loader de platformer-three sigue declarado (M1 en dev)');

console.log('P0 physica registry: OK');
