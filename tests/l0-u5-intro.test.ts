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

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
equal(roomsSource.includes("setFlag('playedUnit5Intro')"), true, 'la secuencia marca playedUnit5Intro');
equal(roomsSource.includes('*clac* MUNDOS APLICADOS. UNIDAD CINCO.'), true, 'incluye la primera línea textual');
equal(
  roomsSource.includes('TODO(guion): El Faro de Ohmdal — tres servicios y una red que debe poder mantenerse.'),
  true,
  'incluye el placeholder neutral de servicios mantenibles',
);
equal(
  roomsSource.includes('TODO(guion): la imagen muestra ramas, protecciones y una señal costera aún apagada.'),
  true,
  'incluye el placeholder neutral de observación',
);

console.log('L0 U5 intro tests: OK');
