import { readFileSync } from 'node:fs';
import { state } from '../src/state.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const unit5Flags = [
  'playedUnit5Intro',
  'metFarero',
  'solvedStoredSpark',
  'consejeraNotedAnomaly',
  'solvedSleepingRiver',
  'solvedClock',
  'clockRestored',
  'solvedLighthouse',
  'lighthouseRestored',
  'learnedCapacitor',
  'arcOneCompleted',
  'sawCrystalEye',
  'unit5Completed',
] as const;

for (const flag of unit5Flags) {
  equal(state.flags[flag], false, `${flag} empieza en false`);
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const unit5Branch = roomsSource.indexOf('if (fl.unit4Completed && !fl.playedUnit5Intro)');
const unit4Branch = roomsSource.indexOf('if (fl.unit3Completed && !fl.playedUnit4Intro)');

equal(unit5Branch >= 0, true, 'el proyector contempla la introducción de U5');
equal(unit5Branch < unit4Branch, true, 'la rama U5 tiene prioridad sobre los estados U4');
equal(
  roomsSource.includes("setFlag('playedUnit5Intro')"),
  true,
  'la secuencia marca playedUnit5Intro',
);
equal(
  roomsSource.includes('*clac* MUNDOS APLICADOS. UNIDAD CINCO.'),
  true,
  'incluye la primera línea textual',
);
equal(
  roomsSource.includes('El Faro de Ohmdal: la luz que recuerda.'),
  true,
  'incluye la segunda línea textual',
);
equal(
  roomsSource.includes('Recuerde, estudiante: lo que sube y baja… a veces se queda un rato.'),
  true,
  'incluye la tercera línea textual',
);
equal(
  roomsSource.includes('La imagen muestra un destello que late —una vez, dos— y se apaga.'),
  true,
  'incluye el destello textual',
);
equal(
  roomsSource.includes('(¿Se queda? Aprendimos que sin camino no se queda nada. …¿O sí?)'),
  true,
  'incluye la reacción textual',
);
equal(
  roomsSource.includes('*clac* Unidad cinco: en curso. Tenga paciencia. El tiempo es parte del circuito. *clac*'),
  true,
  'incluye la re-interacción textual',
);

console.log('L0 U5 intro tests: OK');
