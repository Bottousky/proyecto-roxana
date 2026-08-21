import { readFileSync } from 'node:fs';
import {
  advanceSleepingRiver,
  createSleepingRiverState,
  sleepingRiverFillTimeMs,
  sleepingRiverReading,
  startSleepingRiver,
} from '../src/puzzles/sleepingriverModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const smallWideTime = sleepingRiverFillTimeMs(1, 1);
const largeWideTime = sleepingRiverFillTimeMs(4, 1);
const largeNarrowTime = sleepingRiverFillTimeMs(4, 8);
equal(largeWideTime > smallWideTime, true, 'más Estanque aumenta el tiempo de llenado');
equal(largeNarrowTime > largeWideTime, true, 'más freno aumenta el tiempo de llenado');
equal(
  largeNarrowTime / smallWideTime,
  32,
  'el tiempo conserva el producto puro estanque por freno',
);

let state = startSleepingRiver(createSleepingRiverState(2, 4));
const flows = [sleepingRiverReading(state).riverFlow];
for (let step = 0; step < 4; step++) {
  state = advanceSleepingRiver(state, sleepingRiverFillTimeMs(2, 4) / 4);
  flows.push(sleepingRiverReading(state).riverFlow);
}
for (let index = 1; index < flows.length; index++) {
  equal(flows[index] <= flows[index - 1], true, `la aguja decae en el paso ${index}`);
}
equal(flows[0], 1, 'la aguja arranca fuerte');
equal(flows.at(-1), 0, 'la aguja termina en cero');
equal(state.level, 100, 'el Estanque queda lleno');
equal(sleepingRiverReading(state).full, true, 'el modelo informa Estanque lleno');
equal(sleepingRiverReading(state).riverFlow, 0, 'el río es cero con el Estanque lleno');

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const puzzleSource = readFileSync(new URL('../src/puzzles/sleepingriver.ts', import.meta.url), 'utf8');

equal(roomsSource.includes("import { abrirSleepingRiver } from '../puzzles/sleepingriver';"), false, 'L3 RC no bloquea el camino crítico');
equal(roomsSource.includes("setFlag('solvedSleepingRiver')"), false, 'L3 RC no escribe flags del camino crítico');
equal(roomsSource.includes("notifyNewEntry('El río que se duerme')"), false, 'L3 RC no formaliza Arc I');
equal(puzzleSource.includes('createSimTick('), true, 'L3 anima la simulación con el tick compartido');
equal(puzzleSource.includes('bench.onClose(tick.stop)'), true, 'L3 cancela el tick al cerrar');
equal(puzzleSource.includes('ohmProbe('), true, 'L3 reutiliza la sonda de Ohm');
equal(puzzleSource.includes('bench-predict'), true, 'L3 reutiliza la predicción comprometida');
equal(
  puzzleSource.includes('previousConfig.tank !== state.tank || previousConfig.brake !== state.brake'),
  true,
  'L3 pide la predicción al cambiar la segunda configuración',
);
for (const text of [
  'Con esta combinación, ¿tardará más o menos que el intento anterior?',
  "['mas', 'Más']",
  "['menos', 'Menos']",
  "['igual', 'Igual']",
]) {
  equal(puzzleSource.includes(text), true, `predicción canónica L3: ${text}`);
}

for (const text of [
  'No se rompió. Se está llenando. ¡Mira la aguja, está RESPIRANDO!',
  'Tiempo de llenado: estanque por freno. Más estanque, más espera. Más freno, más espera.',
  '¿Ven? Primero deja pasar. Después dice basta. Como yo a la hora de dormir.',
]) {
  equal(puzzleSource.includes(text), true, `diálogo textual L3: ${text.slice(0, 42)}`);
}

console.log('L3 sleeping river tests: OK');
