import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const start = rooms.indexOf('function resolverPuerta(): void');
const end = rooms.indexOf('\nfunction ', start + 1);
const resolver = rooms.slice(start, end >= 0 ? end : undefined);

const flag = resolver.indexOf("setFlag('puertaDone')");
const refresh = resolver.indexOf('hooks.refresh()');
const victoryDialog = resolver.indexOf('say(');

assert(flag >= 0, 'resolver la Puerta registra el estado abierto');
assert(refresh > flag, 'el refresco visual ocurre después de registrar el estado');
assert(
  victoryDialog > refresh,
  'la imagen abierta aparece antes de iniciar el diálogo de victoria de Lumen',
);
assert(
  resolver.indexOf('hooks.refresh()', refresh + 1) === -1,
  'el cambio de imagen no queda postergado hasta el final del diálogo',
);

console.log('M15 Ohm gate visual refresh tests: OK');
