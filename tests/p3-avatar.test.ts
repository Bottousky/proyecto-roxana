// P3 — Control del avatar: el salto y la carrera tienen la física esperada.
import {
  AVATAR_H,
  GRAV_AVATAR,
  integrarAvatar,
  JUMP_V,
  RUN_V,
  type Avatar,
} from '../src/experiences/physica/avatar.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}

const piso: { x0: number; x1: number; top: number } = { x0: -20, x1: 20, top: 0 };
const quieto = { left: false, right: false, jump: false };
const DT = 1 / 60;

// El salto alcanza la altura esperada v²/2g.
let a: Avatar = { x: 0, y: AVATAR_H / 2, vy: 0, facing: 1, onGround: true };
a = integrarAvatar(a, { ...quieto, jump: true }, DT, [piso]);
let pico = a.y;
for (let i = 0; i < 120; i++) {
  a = integrarAvatar(a, quieto, DT, [piso]);
  pico = Math.max(pico, a.y);
}
const alturaSalto = pico - AVATAR_H / 2;
const esperada = (JUMP_V * JUMP_V) / (2 * -GRAV_AVATAR);
assert(Math.abs(alturaSalto - esperada) < 0.1, `el salto alcanza ~${esperada.toFixed(2)} m (obtuvo ${alturaSalto.toFixed(2)})`);

// Correr avanza a velocidad constante.
let b: Avatar = { x: 0, y: AVATAR_H / 2, vy: 0, facing: 1, onGround: true };
for (let i = 0; i < 30; i++) b = integrarAvatar(b, { ...quieto, right: true }, DT, [piso]);
assert(Math.abs(b.x - RUN_V * 30 * DT) < 1e-6, 'correr avanza a RUN_V constante');
assert(b.facing === 1, 'al correr a la derecha mira a la derecha');

// Después del salto vuelve al suelo y el contador de suelo vuelve a estar activo.
let c: Avatar = { x: 0, y: AVATAR_H / 2, vy: 0, facing: 1, onGround: true };
c = integrarAvatar(c, { ...quieto, jump: true }, DT, [piso]);
let enAire = true;
for (let i = 0; i < 300; i++) {
  c = integrarAvatar(c, quieto, DT, [piso]);
  if (c.onGround) enAire = false;
}
assert(!enAire, 'el avatar aterriza después del salto');
assert(Math.abs(c.y - AVATAR_H / 2) < 1e-6, 'al aterrizar queda parado en el piso');

console.log('P3 avatar: OK');
