import { readFileSync } from 'node:fs';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function includes(source: string, text: string, label: string): void {
  equal(source.includes(text), true, label);
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const sceneSource = readFileSync(new URL('../src/game/ExplorationScene.ts', import.meta.url), 'utf8');
const audioSource = readFileSync(new URL('../src/audio.ts', import.meta.url), 'utf8');

includes(roomsSource, "label: 'Camino al Faro'", 'la plaza muestra el Camino al Faro');
includes(roomsSource, "to: 'lighthouse_hall'", 'el camino conduce al hall del Faro');
includes(roomsSource, 'visible: () => f().unit4Completed', 'el camino aparece al completar U4');

for (const roomId of ['lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern']) {
  includes(roomsSource, `${roomId}: {`, `existe la sala ${roomId}`);
  includes(roomsSource, `id: '${roomId}'`, `${roomId} conserva su id`);
}

includes(roomsSource, "to: 'lighthouse_bench'", 'el hall conecta con el taller del Farero');
includes(roomsSource, 'f().solvedStoredSpark', 'el taller abre con solvedStoredSpark');
includes(roomsSource, "to: 'clock_tower'", 'el taller conecta con la torre del Reloj');
includes(roomsSource, 'f().solvedSleepingRiver', 'la torre abre con solvedSleepingRiver');
includes(roomsSource, "to: 'lighthouse_lantern'", 'la torre conecta con la linterna');
includes(roomsSource, 'f().solvedClock', 'la linterna abre con solvedClock');

includes(roomsSource, '// TODO(L5)', 'el banco conserva el placeholder L5');
equal(roomsSource.includes('// TODO(L4)'), false, 'L4 reemplazó su placeholder');

for (const text of [
  '¿Vienen por la luz? La luz es lo de menos. Este faro no alumbraba: avisaba.',
  'Y para avisar hay que latir. La-aaa-tido. La-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá. (se toca la sien)',
  'Nosotros vimos algo imposible, hace tiempo. Una chispa que brilló sin camino. Lo anotamos y no lo entendimos.',
  'Ah. Entonces ya conocen al Estanque. Solo que todavía no sabían su nombre.',
]) {
  includes(roomsSource, text, `diálogo textual: ${text.slice(0, 38)}`);
}
includes(roomsSource, "setFlag('metFarero')", 'la presentación marca metFarero');

for (const id of [
  'farero-hall',
  'consejera-faro',
  'edda-faro-hall',
  'lumen-faro-hall',
  'ohm-faro-hall',
  'farero-taller',
  'farero-reloj',
  'farero-linterna',
]) {
  includes(roomsSource, `id: '${id}'`, `existe el NPC ${id}`);
}

includes(audioSource, "'lighthouse'", 'Ambience incluye lighthouse');
includes(audioSource, 'const TEMA_LIGHTHOUSE: ThemeDef', 'existe el tema del Faro');
includes(audioSource, 'lighthouse: {', 'existe el mood del Faro');
includes(audioSource, 'scheduleLighthouse', 'el ambiente incluye lago, trueno y señal');
includes(audioSource, "noise(0.018, 5.2, 'lowpass'", 'el lago usa noise');
includes(audioSource, "tone(42, 'sine'", 'el trueno lejano usa tone');
includes(
  sceneSource,
  "id.startsWith('lighthouse_') || id === 'clock_tower'",
  'los cambios entre salas conservan ambience lighthouse',
);
equal(
  (roomsSource.match(/setAmbience\('lighthouse'\)/g) ?? []).length,
  4,
  'las cuatro salas activan ambience lighthouse',
);

console.log('L1 lighthouse rooms tests: OK');
