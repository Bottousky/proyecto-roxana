import { readFileSync } from 'node:fs';

function includes(source: string, expected: string, label: string): void {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta "${expected}"`);
  }
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');

includes(
  roomsSource,
  "if (!f().playedUnit2Intro)",
  'el camino distingue una partida U1 anterior a la introducción de U2',
);
includes(
  roomsSource,
  'Vuelve al Aula de Electrónica. El proyector tiene preparada la próxima lección.',
  'la puerta orienta hacia el proyector',
);
includes(
  roomsSource,
  'Vuelve al Aula de Electrónica y enciende el proyector. Allí empieza la próxima unidad.',
  'la campana orienta hacia el proyector',
);

console.log('M1 legacy U1 guidance tests: OK');
