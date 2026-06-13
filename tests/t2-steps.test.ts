import { readFileSync } from 'node:fs';
import {
  STEPS_RIVER_SEGMENTS,
  STEPS_STONES,
  createStepsState,
  isStepsSolved,
  observeStepsArm,
  observeStepsRiver,
  stepDrop,
  stepsDrops,
  stepsLoopDebt,
  stepsRiver,
  stepsRiverAt,
} from '../src/puzzles/stepsModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(stepsRiver(), 2, 'A.3: el río es 16 / 8 = 2');
equal(stepsDrops().join(','), '2,2,4,8', 'A.3: escalones exactos');
equal(stepsLoopDebt(), 0, 'A.3: la suma de la vuelta es cero');

for (const segmentId of STEPS_RIVER_SEGMENTS) {
  equal(stepsRiverAt(segmentId), 2, `${segmentId}: el río permanece en 2`);
}

const distinctDrops = new Set(STEPS_STONES.map((stone) => stepDrop(stone.id)));
equal(distinctDrops.size > 1, true, 'el escalón varía según la piedra');
equal(
  new Set(STEPS_RIVER_SEGMENTS.map((segment) => stepsRiverAt(segment))).size,
  1,
  'el río no varía entre tramos',
);

let state = createStepsState();
state = observeStepsArm(state, 'whole-loop');
state = observeStepsRiver(state, 'after-stone-4');
state = observeStepsArm(state, 'stone-3');
state = observeStepsArm(state, 'spring');
state = observeStepsRiver(state, 'before-stone-1');
state = observeStepsArm(state, 'stone-1');
state = observeStepsRiver(state, 'between-stones-2-3');
state = observeStepsArm(state, 'stone-4');
state = observeStepsRiver(state, 'between-stones-1-2');
state = observeStepsArm(state, 'stone-2');
equal(state.experiences.stones, true, 'las cuatro piedras completan la experiencia');
equal(isStepsSolved(state), false, 'falta medir un tramo de río');
state = observeStepsRiver(state, 'between-stones-3-4');
equal(isStepsSolved(state), true, 'las cuatro experiencias resuelven en cualquier orden');

const commonSource = readFileSync(new URL('../src/puzzles/common.ts', import.meta.url), 'utf8');
const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const stepsSource = readFileSync(new URL('../src/puzzles/steps.ts', import.meta.url), 'utf8');

equal(commonSource.includes('export function ohmArms<'), true, 'common exporta el modo brazos');
equal(roomsSource.includes("import { abrirSteps } from '../puzzles/steps';"), true, 'rooms importa T2');
equal(roomsSource.includes("setFlag('solvedVoltageSteps')"), true, 'T2 marca solvedVoltageSteps');
equal(roomsSource.includes("notifyNewEntry('Los escalones')"), true, 'T2 notifica Los escalones');
equal(roomsSource.includes('f().solvedVoltageSteps,'), true, 'T2 reabre en modo práctica');

for (const text of [
  'Subida: dieciséis.',
  'Dos, dos, cuatro, ocho… son dieciséis. Lo que subió, bajó. Exacto. No sobra ni falta un escalón.',
  'Deuda de la vuelta: cero. Siempre cero.',
  'El empuje baja por escalones… pero el río es el mismo en todos lados. No son la misma cosa. ¡NUNCA fueron la misma cosa!',
  'Deuda: cero.',
  'Mil veces vi bajar esa agua. Nunca vi que la cuenta cerraba sola.',
  'El acueducto no es un misterio. Es una cuenta que siempre cerró, y yo no sabía leerla.',
]) {
  equal(stepsSource.includes(text), true, `diálogo textual T2: ${text.slice(0, 40)}`);
}

console.log('T2 steps tests: OK');
