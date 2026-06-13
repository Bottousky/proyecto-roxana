import { readFileSync } from 'node:fs';
import {
  CLOCK_TARGET_RHYTHM,
  CLOCK_UNIT_MS,
  advanceClock,
  clockPeriodMs,
  clockRhythm,
  clockTiming,
  createClockState,
} from '../src/puzzles/clockModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

for (const [tank, brake, expected] of [
  [1, 1, 1],
  [1, 8, 8],
  [2, 4, 8],
  [4, 8, 32],
] as const) {
  equal(clockRhythm(tank, brake), expected, `ritmo ${tank} × ${brake}`);
}

for (const [tank, brake] of [
  [1, 4],
  [2, 2],
  [4, 1],
] as const) {
  equal(clockRhythm(tank, brake), CLOCK_TARGET_RHYTHM, `${tank} × ${brake} da ritmo 4`);
  equal(clockTiming(tank, brake), 'just', `${tank} × ${brake} es una solución válida`);
  equal(clockPeriodMs(tank, brake), 1000, `${tank} × ${brake} produce un tic de 1 s`);
}

const fastPeriod = clockPeriodMs(1, 2);
const targetPeriod = clockPeriodMs(2, 2);
const slowPeriod = clockPeriodMs(4, 2);
equal(clockTiming(1, 2), 'fast', 'ritmo menor que 4 adelanta');
equal(clockTiming(4, 2), 'slow', 'ritmo mayor que 4 atrasa');
equal(fastPeriod < targetPeriod, true, 'el reloj que adelanta tiene menor período');
equal(slowPeriod > targetPeriod, true, 'el reloj que atrasa tiene mayor período');

let state = createClockState(2, 2);
state = advanceClock(state, clockPeriodMs(2, 2) / 2);
equal(state.level, 50, 'medio período llena medio Estanque');
equal(state.pendulumStep, 0, 'el péndulo espera hasta el umbral');
state = advanceClock(state, clockPeriodMs(2, 2) / 2);
equal(state.level, 0, 'al alcanzar el umbral el Estanque vuelca y vuelve a cero');
equal(state.pendulumStep, 1, 'cada volcado avanza el péndulo un paso');

state = advanceClock(state, clockPeriodMs(2, 2) * 2.25);
equal(state.level, 25, 'el modelo conserva el resto después de varios volcados');
equal(state.pendulumStep, 3, 'un dt grande no pierde tics');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const puzzleSource = readFileSync(new URL('../src/puzzles/clock.ts', import.meta.url), 'utf8');

equal(CLOCK_UNIT_MS, 250, 'L4 usa 250 ms por unidad');
equal(roomsSource.includes("import { abrirClock } from '../puzzles/clock';"), true, 'rooms importa L4');
equal(roomsSource.includes("setFlag('solvedClock')"), true, 'L4 marca solvedClock');
equal(roomsSource.includes("setFlag('clockRestored')"), true, 'L4 marca clockRestored');
equal(roomsSource.includes("notifyNewEntry('El tic')"), true, 'L4 notifica la entrada');
equal(roomsSource.includes('hooks.refresh()'), true, 'L4 refresca la torre');
equal(puzzleSource.includes('createSimTick('), true, 'L4 usa el tick compartido');
equal(puzzleSource.includes('bench.onClose(tick.stop)'), true, 'L4 cancela el tick al cerrar');

for (const text of [
  'Ese reloj tomó café. Más despacio.',
  'Ese reloj está por jubilarse. Un poco más de brío.',
  'Otro estanque. El mismo tiempo.',
  'Ese. Ese es el tic. Lo reconozco aunque me despierten a las tres.',
  'Toda la plaza oye el tic.',
]) {
  equal(puzzleSource.includes(text), true, `texto L4: ${text}`);
}

console.log('L4 clock tests: OK');
