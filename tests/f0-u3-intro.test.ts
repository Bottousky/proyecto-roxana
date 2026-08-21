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

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
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

console.log('F0 U3 intro tests: OK');
