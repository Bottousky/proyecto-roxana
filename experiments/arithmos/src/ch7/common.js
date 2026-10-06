// Capítulo 7 — Crecer: de vuelta en las Terrazas. La pizarra de Mara es la mesa de trabajo:
// fichas de área (x·x, x·1, 1·1), cuadrados que se cortan y tablas que crecen.

import {Drawing, Label, Shape} from '../engine/world.js';
import {stroke, lineGuide, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';
import {base as base4, BOARD, boardTop, FAMILIES, cast, family, familiesHome, item, GROUND, art} from '../ch4/common.js';

export {BOARD, boardTop, FAMILIES, cast, family, familiesHome, item, GROUND, art};

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

export const SHOTS = {
  board: {x: 13650, y: 120, w: 1450, h: 640},
  close: {x: 13980, y: 250, w: 640, h: 380},
  wide: {x: 12980, y: 160, w: 1800, h: 640},
  // la pizarra sola, de cerca: para tocar fichas y cifras también en el teléfono
  tiles: {x: 13950, y: 250, w: 700, h: 390},
};

/** Medidas de las fichas: x es más larga que 1, y no es un múltiplo justo. */
export const T = {X: 92, U: 30};

/** Bordes de la pizarra útil. */
export const area = () => ({x0: BOARD.x - BOARD.w / 2 + 16, y0: boardTop() + 16, x1: BOARD.x + BOARD.w / 2 - 16, y1: boardTop() + BOARD.h - 16});

export function base(g) {
  base4(g);
  g.renderer.tint = [1.02, 1.0, 0.96];
}

/** Un rectángulo relleno con rayas, en coordenadas locales (esquina superior izquierda en 0,0). */
export function plate(id, w, h, ch = WHITE, hatch = true) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [
    S(lineGuide(0, 0, w, 0, rnd, 0.004), seed, {w: 2.6, p: 0.95, ch}),
    S(lineGuide(w, 0, w, h, rnd, 0.004), seed + 1, {w: 2.6, p: 0.95, ch}),
    S(lineGuide(w, h, 0, h, rnd, 0.004), seed + 2, {w: 2.6, p: 0.95, ch}),
    S(lineGuide(0, h, 0, 0, rnd, 0.004), seed + 3, {w: 2.6, p: 0.95, ch}),
  ];
  if (hatch) {
    const n = Math.max(2, Math.round(Math.min(w, h) / 12));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (w >= h) list.push(S(lineGuide(4, h * t, w - 4, h * t, rnd, 0.002), seed + 10 + i, {w: 1.4, p: 0.5, ch, lift: false}));
      else list.push(S(lineGuide(w * t, 4, w * t, h - 4, rnd, 0.002), seed + 10 + i, {w: 1.4, p: 0.5, ch, lift: false}));
    }
  }
  return list;
}

/** Una ficha: 'x2' (x por x), 'x' (x por 1, acostada o parada) o 'u' (1 por 1). */
export function tile(w, id, kind, x, y, {vertical = false, ch} = {}) {
  const dims = kind === 'x2' ? [T.X, T.X] : kind === 'x' ? (vertical ? [T.U, T.X] : [T.X, T.U]) : [T.U, T.U];
  const color = ch ?? (kind === 'x2' ? WHITE : kind === 'x' ? BLUE : YELLOW);
  const sh = w.add(new Shape(id, plate(id, dims[0], dims[1], color, kind !== 'u'), x, y, {z: 14}));
  sh.kind = kind;
  sh.w2 = dims[0];
  sh.h2 = dims[1];
  return sh;
}

/** Un triángulo (mitad de un cuadrado de lado s), en coordenadas locales con el ángulo recto en 0,0. */
export function triangle(id, s, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [
    S(lineGuide(0, 0, s, 0, rnd, 0.004), seed, {w: 2.6, p: 0.95, ch}),
    S(lineGuide(s, 0, 0, s, rnd, 0.004), seed + 1, {w: 2.6, p: 0.95, ch: YELLOW}),
    S(lineGuide(0, s, 0, 0, rnd, 0.004), seed + 2, {w: 2.6, p: 0.95, ch}),
  ];
  for (let i = 1; i < 6; i++) { const t = i / 6; list.push(S(lineGuide(3, s * t, s * (1 - t) - 3, s * t, rnd, 0.002), seed + 10 + i, {w: 1.3, p: 0.45, ch, lift: false})); }
  return list;
}

export {Drawing, Label, Shape, S, seedOf, mulberry32, lineGuide, WHITE, YELLOW, BLUE};
