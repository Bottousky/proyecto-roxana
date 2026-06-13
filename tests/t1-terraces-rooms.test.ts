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

includes(roomsSource, "label: 'Camino a las Terrazas'", 'la plaza muestra el camino a las Terrazas');
includes(roomsSource, "to: 'terraces_top'", 'el camino conduce al canal alto');
includes(roomsSource, 'visible: () => f().unit3Completed', 'el camino aparece al completar U3');

for (const roomId of ['terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct']) {
  includes(roomsSource, `${roomId}: {`, `existe la sala ${roomId}`);
  includes(roomsSource, `id: '${roomId}'`, `${roomId} conserva su id`);
}

includes(roomsSource, "to: 'terraces_mid'", 'el canal alto conecta con las terrazas medias');
includes(roomsSource, 'if (f().solvedVoltageSteps) return null;', 'las terrazas medias abren con solvedVoltageSteps');
includes(roomsSource, "to: 'terraces_mural'", 'las terrazas medias conectan con el mural');
includes(roomsSource, 'if (f().solvedFairSplit) return null;', 'el mural abre con solvedFairSplit');
includes(roomsSource, "to: 'terraces_aqueduct'", 'el mural conecta con el acueducto');
includes(roomsSource, 'if (f().solvedSingleStone) return null;', 'el acueducto abre con solvedSingleStone');

for (const hito of ['T2', 'T3', 'T4', 'T5']) {
  includes(roomsSource, `// TODO(${hito})`, `el banco ${hito} conserva su placeholder`);
}

for (const text of [
  'No te acerques a las piedras. …Perdón. Es la costumbre.',
  'Treinta años acá. Conozco cada canal de memoria. Y no muevo ninguno.',
  '¿Por qué no?',
  'Porque si toco esta —y señala una cualquiera— cambia aquella, y la del fondo, y el riego entero. Todo está atado a todo.',
  'No es miedo. Es respeto. …Bueno. Un poco de miedo.',
  'Observación correcta. Conclusión incompleta. Para leer una red atada: brazos.',
]) {
  includes(roomsSource, text, `diálogo textual: ${text.slice(0, 36)}`);
}
includes(roomsSource, "setFlag('metGuardiana')", 'la presentación marca metGuardiana');

for (const id of ['guardiana-alto', 'edda-terrazas-alto', 'lumen-terrazas-alto', 'ohm-terrazas-alto']) {
  includes(roomsSource, `id: '${id}'`, `existe el NPC ${id}`);
}

includes(audioSource, "'terraces'", 'Ambience incluye terraces');
includes(audioSource, 'const TEMA_TERRACES: ThemeDef', 'existe el tema de las Terrazas');
includes(audioSource, 'terraces: {', 'existe el mood de las Terrazas');
includes(audioSource, 'scheduleTerraceWater', 'el ambiente incluye agua procedural');
includes(audioSource, "noise(0.022, 3.8, 'lowpass'", 'el agua usa noise');
includes(audioSource, "tone(920 + Math.random() * 380, 'sine'", 'las gotas usan tone');
includes(sceneSource, "id.startsWith('terraces_')", 'los cambios entre Terrazas conservan su ambiente');
equal(
  (roomsSource.match(/setAmbience\('terraces'\)/g) ?? []).length,
  4,
  'las cuatro salas activan ambience terraces',
);

console.log('T1 terraces rooms tests: OK');
