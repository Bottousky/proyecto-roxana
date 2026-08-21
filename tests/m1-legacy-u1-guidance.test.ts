import { readFileSync } from 'node:fs';

function includes(source: string, expected: string, label: string): void {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta "${expected}"`);
  }
}

const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');

includes(
  roomsSource,
  'window.location.href = portalExitUrl()',
  'el cierre de unidad abandona Phaser hacia la home isométrica',
);
includes(
  roomsSource,
  'function reproducirIntroUnidad2',
  'conserva el copy de introducción U2',
);
includes(
  roomsSource,
  'function reproducirIntroUnidad3',
  'conserva el copy de introducción U3',
);
includes(
  roomsSource,
  'function reproducirIntroUnidad4',
  'conserva el copy de introducción U4',
);
includes(
  roomsSource,
  'function reproducirIntroUnidad5',
  'conserva el copy de introducción U5',
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
