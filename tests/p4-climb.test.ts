// P4 — La ruta de escalada del slice: la piedra empujada permite subir.
// Sin la piedra, el escalón (2.6 m) queda fuera del alcance del salto (1.96 m).
import {
  AVATAR_H,
  crearAvatar,
  integrarAvatar,
  type Avatar,
  type Plataforma,
} from '../src/experiences/physica/avatar.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.02;
}

const DT = 1 / 60;
const piso: Plataforma = { x0: -20, x1: 20, top: 0 };
const escalon: Plataforma = { x0: 6, x1: 9, top: 2.6 };
const plataforma: Plataforma = { x0: 10, x1: 13, top: 4.2 };
const plataformas = [piso, escalon, plataforma];

/** Simula el salto a la derecha y devuelve true si en algún momento quedó parado con pies en `altura`. */
function saltoPisa(a0: Avatar, altura: number): boolean {
  let a = a0;
  for (let i = 0; i < 180; i++) {
    a = integrarAvatar(a, { left: false, right: true, jump: i === 0 }, DT, plataformas);
    if (a.onGround && casi(a.y - AVATAR_H / 2, altura)) return true;
  }
  return false;
}

// De pie sobre la piedra (top 1.2), contra el pie del escalón → sube al escalón.
const desdePiedra = crearAvatar(5.6, 1.2 + AVATAR_H / 2);
assert(saltoPisa(desdePiedra, escalon.top), 'desde la piedra empujada se sube al escalón');

// Del escalón a la plataforma de la fuente.
const desdeEscalon = crearAvatar(8.5, escalon.top + AVATAR_H / 2);
assert(saltoPisa(desdeEscalon, plataforma.top), 'del escalón se llega a la plataforma de la fuente');

// Sin la piedra, el salto desde el piso no alcanza el escalón.
const desdePiso = crearAvatar(5, AVATAR_H / 2);
assert(!saltoPisa(desdePiso, escalon.top), 'sin la piedra el escalón queda fuera del salto');

console.log('P4 ruta de escalada: OK');
