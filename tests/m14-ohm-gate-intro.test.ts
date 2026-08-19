import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
const state = readFileSync(new URL('../src/state.ts', import.meta.url), 'utf8');

assert(
  rooms.includes("locked: () => (f().puertaDone ? null : true)"),
  'la Puerta de Ohm permanece bloqueada sin diálogo automático de proximidad',
);
assert(
  rooms.includes("if (!f().puertaMecanismoIntro)") &&
    rooms.includes("setFlag('puertaMecanismoIntro')"),
  'la explicación se muestra y registra solamente en la primera interacción',
);
assert(
  scene.includes('Array.isArray((evalR.block as { lines?: unknown }).lines)') &&
    scene.includes('sfxLocked()'),
  'una barrera silenciosa no dispara diálogo ni sonido de puerta cerrada (R4: barrera evaluada por el grafo)',
);
assert(
  state.includes('puertaMecanismoIntro: boolean;') &&
    state.includes('puertaMecanismoIntro: false,'),
  'el aviso único queda migrado y persistido en partidas nuevas o antiguas',
);

console.log('M14 Ohm gate intro tests: OK');
