import { readFileSync } from 'node:fs';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const rooms = source('../src/jugar/rooms.ts');
const bell = rooms.slice(rooms.indexOf('function tocarCampana'), rooms.indexOf('function reproducirIntroUnidad2'));
assert(bell.includes('window.location.href = portalExitUrl()'), 'la Campana abandona Phaser hacia la web');
assert(!bell.includes("hooks.goto('aula'"), 'la Campana no monta el aula procedural');

const aulas = source('../src/landing/aulas.ts');
for (const required of [
  'showUnit2ProjectorSequence',
  'state.flags.finished && !state.flags.playedUnit2Intro',
  "setFlag('playedUnit2Intro')",
  'UNIDAD DOS: EL RÍO SE REPARTE',
  'Vuelve a la Campana por el portal',
]) {
  assert(aulas.includes(required), `el aula gráfica conserva ${required}`);
}

const css = source('../src/landing/landing.css');
assert(css.includes('.rx-projector-sequence'), 'la proyección tiene puesta visual dentro del aula gráfica');

console.log('W7 transición Campana → aula gráfica → U2: OK');
