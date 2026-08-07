// Control del avatar (plataformero): física pura sin three, testeable en Node (p3).
// El avatar se mueve con control cinemático (sensación de juego); lo que se estudia
// en Physica son los modelos de los objetos (caidaLibre / tiroParabolico), no el salto.
export interface Plataforma {
  x0: number;
  x1: number;
  top: number;
}

export interface Avatar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  carrying: boolean;
}

export interface AvatarInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export const AVATAR_HALF_W = 0.35;
export const AVATAR_H = 1.6;
export const GRAV_AVATAR = -9.8;
export const RUN_V = 4.5;
export const AIR_V = 2.6;
export const JUMP_V = 6.2;

export function crearAvatar(x = 0, y = 0): Avatar {
  return { x, y, vx: 0, vy: 0, facing: 1, onGround: true, carrying: false };
}

export function integrarAvatar(
  a: Avatar,
  input: AvatarInput,
  dt: number,
  plataformas: Plataforma[],
): Avatar {
  const vy0 = a.onGround && input.jump ? JUMP_V : a.vy;
  const dir = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  const facing: 1 | -1 = dir !== 0 ? (dir > 0 ? 1 : -1) : a.facing;
  const velocidadHoriz = a.onGround ? RUN_V : AIR_V;
  let x = a.x + dir * velocidadHoriz * dt;
  let vx = dir * velocidadHoriz;
  let y = a.y + vy0 * dt;
  let vy = vy0 + GRAV_AVATAR * dt;
  let onGround = false;

  const piesPrev = a.y - AVATAR_H / 2;
  const piesNuevo = y - AVATAR_H / 2;
  for (const p of plataformas) {
    if (x + AVATAR_HALF_W > p.x0 && x - AVATAR_HALF_W < p.x1) {
      if (piesPrev >= p.top - 1e-6 && piesNuevo <= p.top) {
        y = p.top + AVATAR_H / 2;
        vy = 0;
        onGround = true;
      }
    }
  }

  return { x, y, vx, vy, facing, onGround, carrying: a.carrying };
}
