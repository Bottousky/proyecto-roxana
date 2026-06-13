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

includes(roomsSource, 'visible?: () => boolean;', 'las puertas admiten visibilidad por flags');
includes(sceneSource, 'if (d.visible && !d.visible()) continue;', 'la escena no dibuja puertas invisibles');

includes(roomsSource, "label: 'Camino a la Forja'", 'la plaza tiene el Camino a la Forja');
includes(roomsSource, "to: 'forge_yard'", 'el camino conduce al patio');
includes(roomsSource, 'visible: () => f().unit2Completed', 'el camino aparece al completar U2');

for (const roomId of ['forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall']) {
  includes(roomsSource, `${roomId}: {`, `existe la sala ${roomId}`);
  includes(roomsSource, `id: '${roomId}'`, `${roomId} conserva su id`);
}

includes(roomsSource, "to: 'forge_infirmary'", 'el patio conecta con la enfermería');
includes(roomsSource, 'if (f().solvedWarmChannel) return null;', 'la enfermería abre con solvedWarmChannel');
includes(roomsSource, "to: 'forge_longchannel'", 'la enfermería conecta con el Canal Largo');
includes(roomsSource, 'if (f().solvedFuseInfirmary) return null;', 'el Canal Largo abre con solvedFuseInfirmary');
includes(roomsSource, "to: 'forge_hall'", 'el Canal Largo conecta con la nave mayor');
includes(roomsSource, 'if (f().solvedLongChannel) return null;', 'la nave abre con solvedLongChannel');

includes(roomsSource, 'En mi casa, los misterios se resuelven en orden.', 'la puerta trabada de la enfermería tiene línea de Yesca');
includes(roomsSource, 'aquí se muere gente de cobre todos los días.', 'la puerta trabada del Canal Largo tiene línea de Lumen');
includes(roomsSource, 'no puede alimentar tres máquinas juntas.', 'la puerta trabada de la nave tiene línea de Yesca');
equal(
  (roomsSource.match(/\/\/ TODO\(F[2345]\)/g) ?? []).length,
  0,
  'los bancos F2-F5 ya no conservan placeholders de hito',
);

for (const text of [
  '¿Tú eres quien anda encendiendo cosas? Bien. Tenemos que hablar.',
  'Tercer fusible de la semana. Y los canales entibian como sopa. Esto antes no pasaba.',
  'Antes no pasaba NADA, Yesca. Esa era exactamente la política.',
  '…Touché.',
  'Mira: yo no entiendo de ríos ni de cuentas. Entiendo de carbón. Y desde que la Forja despertó, el carbón vuela. Algo se está yendo a alguna parte.',
  'Eso vine a preguntar. Medimos el río: no se gasta. Lo demostraron ustedes. Entonces, ¿qué es lo que falta cada mañana?',
  '…Esa es buena pregunta. Ohm: ¿tienes algo para el calor?',
  'Modo nuevo disponible: termómetro. Apoyo la mano. Reporto el peaje.',
]) {
  includes(roomsSource, text, `diálogo textual: ${text.slice(0, 32)}`);
}
includes(roomsSource, "setFlag('metForjadora')", 'la presentación marca metForjadora');

for (const id of [
  'forjadora-patio',
  'consejera-patio',
  'lumen-enfermeria',
  'forjadora-canal-largo',
  'forjadora-nave',
]) {
  includes(roomsSource, `id: '${id}'`, `existe el NPC ${id}`);
}

for (const text of ['Martillo', 'ENTREGA 32', 'Fuelle', 'ENTREGA 16', 'Lumbre', 'ENTREGA 8', 'Tablero de bus']) {
  includes(roomsSource, text, `la nave incluye ${text}`);
}

includes(audioSource, "'forge'", 'Ambience incluye forge');
includes(audioSource, 'const TEMA_FORGE: ThemeDef', 'existe el tema de la Forja');
includes(audioSource, 'forge: {', 'existe el mood de la Forja');
includes(audioSource, 'percussion:', 'el tema de la Forja declara percusión');
includes(sceneSource, "id.startsWith('forge_')", 'los refresh de salas de la Forja conservan su ambience');
equal(
  (roomsSource.match(/setAmbience\('forge'\)/g) ?? []).length,
  4,
  'las cuatro salas activan ambience forge',
);

console.log('F1 forge rooms tests: OK');
