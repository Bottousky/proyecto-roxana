import { readFileSync } from 'node:fs';
import {
  STEPS_INITIAL_CONFIGURATION,
  STEPS_PREDICTION_OPTIONS,
  STEPS_RIVER_SEGMENTS,
  STEPS_TARGET_DROPS,
  commitStepsPrediction,
  configureStepsStone,
  createStepsState,
  evaluateStepsConfiguration,
  isStepsConfigurationValid,
  isStepsSolved,
  observeStepsArm,
  observeStepsRiver,
  openStepsGate,
  stepDrop,
  stepsDrops,
  stepsLoopDebt,
  stepsRiver,
  stepsRiverAt,
  type StepsStoneValue,
} from '../src/puzzles/stepsModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(STEPS_INITIAL_CONFIGURATION.join(','), '4,1,2,1', 'estado inicial desordenado');
equal(STEPS_TARGET_DROPS.join(','), '2,2,4,8', 'objetivo visible');
equal(stepsRiver(), 2, 'la fila inicial tiene río 2');
equal(stepsDrops().join(','), '8,2,4,2', 'la fila inicial golpea primero y casi nada al final');
equal(stepsLoopDebt(), 0, 'aun desordenada, la vuelta cierra');

const solutionRiver2: StepsStoneValue[] = [1, 1, 2, 4];
const solutionRiver1: StepsStoneValue[] = [2, 2, 4, 8];
for (const [configuration, river] of [
  [solutionRiver2, 2],
  [solutionRiver1, 1],
] as const) {
  equal(isStepsConfigurationValid(configuration), true, `${configuration}: solución por drops`);
  equal(stepsDrops(configuration).join(','), '2,2,4,8', `${configuration}: escalones exactos`);
  equal(stepsRiver(configuration), river, `${configuration}: río común esperado`);
  equal(stepsLoopDebt(configuration), 0, `${configuration}: deuda cero`);
  for (const segmentId of STEPS_RIVER_SEGMENTS) {
    equal(stepsRiverAt(segmentId, configuration), river, `${segmentId}: el río permanece común`);
  }
}

const invalid = evaluateStepsConfiguration(STEPS_INITIAL_CONFIGURATION);
equal(invalid.valid, false, 'la configuración inicial no resuelve');
equal(invalid.directions.join(','), 'baja,exacto,exacto,sube', 'el feedback indica qué corregir');
equal(stepDrop('stone-1'), 8, 'los brazos leen la configuración actual');

let state = createStepsState();
state = openStepsGate(state);
equal(state.hasOpened, false, 'no se abre antes de comprometer predicción');
equal(isStepsSolved(state), false, 'medir no sustituye predicción y prueba');

state = observeStepsArm(state, 'spring');
state = observeStepsArm(state, 'whole-loop');
state = observeStepsArm(state, 'stone-1');
state = observeStepsArm(state, 'stone-2');
state = observeStepsArm(state, 'stone-3');
state = observeStepsArm(state, 'stone-4');
for (const segment of STEPS_RIVER_SEGMENTS) state = observeStepsRiver(state, segment);
equal(Object.values(state.experiences).every(Boolean), true, 'los modos de Ohm siguen explorables');
equal(isStepsSolved(state), false, 'medir todos los hotspots ya no resuelve');

state = commitStepsPrediction(state, 'Primero');
equal(isStepsSolved(state), false, 'una predicción errónea no bloquea pero tampoco basta');
for (const [index, value] of solutionRiver2.entries()) {
  state = configureStepsStone(state, index, value);
}
equal(isStepsSolved(state), false, 'configurar sin abrir no resuelve');
state = openStepsGate(state);
equal(isStepsSolved(state), true, 'predicción comprometida + drops válidos + apertura resuelven');

equal(STEPS_PREDICTION_OPTIONS.join(','), 'Primero,Segundo,Tercero,Cuarto', 'opciones fijadas');

const commonSource = readFileSync(new URL('../src/puzzles/common.ts', import.meta.url), 'utf8');
const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const stepsSource = readFileSync(new URL('../src/puzzles/steps.ts', import.meta.url), 'utf8');

equal(commonSource.includes('export function ohmArms<'), true, 'common exporta el modo brazos');
equal(roomsSource.includes("import { abrirSteps } from '../puzzles/steps';"), true, 'rooms importa T2');
equal(roomsSource.includes("setFlag('solvedVoltageSteps')"), true, 'T2 marca solvedVoltageSteps');
equal(roomsSource.includes("notifyNewEntry('Los escalones')"), true, 'T2 notifica Los escalones');
equal(roomsSource.includes('f().solvedVoltageSteps,'), true, 'T2 reabre en modo práctica');

for (const text of [
  'Antes de moverlas: ¿qué lugar debería cobrar el escalón más grande?',
  'Abrir la compuerta',
  'La compuerta alta quedó desordenada: el primer golpe recibe demasiado y el último casi nada. Necesito que los escalones crezcan al bajar.',
  'Escalones desordenados. La vuelta cierra, pero el reparto golpea donde no debe.',
  'Dos, dos, cuatro, ocho. La vuelta cierra y el agua baja sin golpes.',
  'Dos, dos, cuatro, ocho… son dieciséis. Lo que subió, bajó. Exacto. No sobra ni falta un escalón.',
  'Deuda de la vuelta: cero. Siempre cero.',
  'El empuje baja por escalones… pero el río es el mismo en todos lados. No son la misma cosa. ¡NUNCA fueron la misma cosa!',
  'Mil veces vi bajar esa agua. Nunca vi que la cuenta cerraba sola.',
  'El acueducto no es un misterio. Es una cuenta que siempre cerró, y yo no sabía leerla.',
]) {
  equal(stepsSource.includes(text), true, `diálogo textual T2: ${text.slice(0, 45)}`);
}

console.log('T2 steps tests: OK');
