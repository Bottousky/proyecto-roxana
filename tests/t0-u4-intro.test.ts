import { readFileSync } from 'node:fs';
import { state } from '../src/state.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const unit4Flags = [
  'playedUnit4Intro',
  'metGuardiana',
  'solvedVoltageSteps',
  'solvedFairSplit',
  'solvedSingleStone',
  'predictionAttempted',
  'predictionExact',
  'solvedLadder',
  'valleyRestored',
  'learnedKVL',
  'unit4Completed',
] as const;

for (const flag of unit4Flags) {
  equal(state.flags[flag], false, `${flag} empieza en false`);
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const unit4Branch = roomsSource.indexOf('if (fl.unit3Completed && !fl.playedUnit4Intro)');
const unit3Branch = roomsSource.indexOf('if (fl.unit2Completed && !fl.playedUnit3Intro)');

equal(unit4Branch >= 0, true, 'el proyector contempla la introducción de U4');
equal(unit4Branch < unit3Branch, true, 'la rama U4 tiene prioridad sobre los estados U3');
equal(
  roomsSource.includes("setFlag('playedUnit4Intro')"),
  true,
  'la secuencia marca playedUnit4Intro',
);
equal(
  roomsSource.includes('*clac* MUNDOS APLICADOS. UNIDAD CUATRO.'),
  true,
  'incluye la primera línea textual',
);
equal(
  roomsSource.includes('Las Terrazas de Ohmdal: el agua que baja pensando.'),
  true,
  'incluye la segunda línea textual',
);
equal(
  roomsSource.includes('Recuerde, estudiante: lo que sube, baja. Y lo que baja, se reparte.'),
  true,
  'incluye la tercera línea textual',
);
equal(
  roomsSource.includes('La imagen se aclara un instante en un acueducto de cobre escalonado, y se apaga.'),
  true,
  'incluye la imagen textual del acueducto',
);
equal(
  roomsSource.includes('(Agua que piensa. En esta escuela ya nada me sorprende.)'),
  true,
  'incluye la reacción textual',
);
equal(
  roomsSource.includes('*clac* Unidad cuatro: en curso. Mida dos veces. Toque una. *clac*'),
  true,
  'incluye la re-interacción textual',
);

console.log('T0 U4 intro tests: OK');
