import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

assert(source.includes("f().frenoDone && !f().puertaDone && !f().eddaGateCall"),
  'Edda llama una sola vez al salir del Taller');
assert(source.includes('¡Eh, por aquí! La Puerta de Ohm está al norte.'),
  'la llamada señala de forma explícita el arco norte');

const eddaGate = source.slice(source.indexOf("id: 'edda-puerta'"), source.indexOf("id: 'lumen-puerta'"));
const lumenGate = source.slice(source.indexOf("id: 'lumen-puerta'"), source.indexOf('onEnter:', source.indexOf("id: 'lumen-puerta'")));
assert(eddaGate.includes('visible: () => f().frenoDone && !f().puertaDone'),
  'Edda espera en la Puerta sólo después del Taller');
assert(lumenGate.includes('visible: () => f().frenoDone && !f().puertaDone'),
  'Lumen comparte la misma etapa narrativa en la Puerta');

const eddaCampana = source.slice(source.indexOf("id: 'edda-campana'"), source.indexOf("id: 'lumen-plaza'"));
assert(eddaCampana.includes('f().puertaDone && f().playedUnit2Intro'),
  'un save desincronizado no adelanta a Edda a la Campana');

console.log('M18 puesta en escena post-Taller: OK');
