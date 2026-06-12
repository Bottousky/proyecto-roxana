import { readFileSync } from 'node:fs';
import { state } from '../src/state.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const unit3Flags = [
  'playedUnit3Intro',
  'metForjadora',
  'solvedWarmChannel',
  'solvedFuseInfirmary',
  'burnedChannelDemo',
  'solvedLongChannel',
  'solvedForgeNetwork',
  'forgeRestored',
  'learnedPower',
  'unit3Completed',
] as const;

for (const flag of unit3Flags) {
  equal(state.flags[flag], false, `${flag} empieza en false`);
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const unit3Branch = roomsSource.indexOf('if (fl.unit2Completed && !fl.playedUnit3Intro)');
const unit2Branch = roomsSource.indexOf('if (fl.finished && !fl.playedUnit2Intro)');

equal(unit3Branch >= 0, true, 'el proyector contempla la introducción de U3');
equal(unit3Branch < unit2Branch, true, 'la rama U3 tiene prioridad sobre los estados U2');
equal(
  roomsSource.includes("setFlag('playedUnit3Intro')"),
  true,
  'la secuencia marca playedUnit3Intro',
);
equal(
  roomsSource.includes('*clac* MUNDOS APLICADOS. UNIDAD TRES.'),
  true,
  'incluye la primera línea textual',
);
equal(
  roomsSource.includes('La Forja de Ohmdal: donde el río trabaja.'),
  true,
  'incluye la segunda línea textual',
);
equal(
  roomsSource.includes('Recuerde, estudiante: nada que trabaja, trabaja gratis.'),
  true,
  'incluye la tercera línea textual',
);
equal(
  roomsSource.includes('La imagen tiembla y se corta. Sobre la lente, un instante, la silueta de un fusible fundido.'),
  true,
  'incluye la imagen de la silueta del fusible',
);
equal(
  roomsSource.includes('(¿Eso fue una lección… o un aviso?)'),
  true,
  'incluye la reacción textual',
);
equal(
  roomsSource.includes('*clac* Unidad tres: en curso. Abríguese. O no. Ya va a entender. *clac*'),
  true,
  'incluye la re-interacción textual',
);

console.log('F0 U3 intro tests: OK');
