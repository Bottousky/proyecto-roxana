import { readFileSync } from 'node:fs';

function includes(source: string, expected: string, label: string): void {
  if (!source.includes(expected)) throw new Error(`${label}: falta "${expected}"`);
}

const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
includes(rooms, 'pokeOhm(', 'Plaza cablea Ohm en sala');
includes(rooms, 'pokeFreno(', 'Taller cablea Freno en sala');
includes(rooms, 'pokePuerta(', 'Puerta cablea el mecanismo en sala');
includes(rooms, 'pokeDistributor(', 'Castillo cablea el Repartidor en sala');
includes(rooms, 'pokeForge(', 'Forja cablea las máquinas en sala');
includes(rooms, 'pokeLighthouse(', 'Faro cablea los gabinetes en sala');
includes(rooms, 'ensureOhmField', 'la sesión de campo vive en ActiveRoom');

const chain = readFileSync(new URL('../src/puzzles/chain.ts', import.meta.url), 'utf8');
includes(chain, 'worldCloseup: true', 'la Cadena no tapa la sala');
includes(chain, 'Toca el punto del circuito', 'la predicción de la Cadena designa el circuito');

const lake = readFileSync(new URL('../src/puzzles/lakeFeedDc.ts', import.meta.url), 'utf8');
includes(lake, 'worldCloseup: true', 'Lago en closeup');
if (lake.includes("['Más','Menos']") || lake.includes("['Más', 'Menos']")) {
  throw new Error('Lago: todavía hay predicción tipo Más/Menos');
}

const faro = readFileSync(new URL('../src/puzzles/lighthouseDistributionDc.ts', import.meta.url), 'utf8');
includes(faro, 'Designa el gabinete', 'el banco de práctica del Faro designa un gabinete');

console.log('Field wiring + satellite cleanup: OK');
