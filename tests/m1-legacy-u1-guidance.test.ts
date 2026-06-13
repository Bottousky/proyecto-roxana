import { readFileSync } from 'node:fs';

function includes(source: string, expected: string, label: string): void {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta "${expected}"`);
  }
}

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');

includes(
  roomsSource,
  "if (f().finished && !f().playedUnit2Intro)",
  'el aula reconoce una partida U1 anterior a la introducción de U2',
);
includes(
  roomsSource,
  'reproducirIntroUnidad2(true)',
  'el proyector inicia U2 automáticamente al regresar',
);
includes(
  roomsSource,
  'reproducirIntroUnidad3(true)',
  'el proyector inicia U3 automáticamente al regresar',
);
includes(
  roomsSource,
  'reproducirIntroUnidad4(true)',
  'el proyector inicia U4 automáticamente al regresar',
);
includes(
  roomsSource,
  'reproducirIntroUnidad5(true)',
  'el proyector inicia U5 automáticamente al regresar',
);
includes(
  roomsSource,
  'El sello de cobre tiembla con el eco de la campana. Al sur, el portal responde con un breve destello.',
  'la puerta orienta hacia el portal mediante una señal del mundo',
);
includes(
  roomsSource,
  'La nota corre por el cobre hacia el portal. Desde el otro lado llega una respuesta apagada: *clac*.',
  'la campana hace audible la reacción del aula',
);
includes(
  roomsSource,
  "continueLabel: 'Regresar al Instituto'",
  'los cierres presentan el regreso como transición narrativa',
);

console.log('M1 legacy U1 guidance tests: OK');
