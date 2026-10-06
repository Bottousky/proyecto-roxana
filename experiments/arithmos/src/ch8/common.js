// Capítulo 8 — Formas: otra vez en las Terrazas, con la pizarra de Mara. Cuadrados de cuadraditos,
// triángulos que se recortan, copias de ventanas, cercas y un mapa con dos rectas cruzadas.

import {Drawing, Label, Shape} from '../engine/world.js';
import {stroke, lineGuide, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';
import {base as base7, BOARD, boardTop, cast, family, familiesHome, GROUND, area, SHOTS, T, tile, plate} from '../ch7/common.js';

export {BOARD, boardTop, cast, family, familiesHome, GROUND, area, SHOTS, T, tile, plate, Drawing, Label, Shape, WHITE, YELLOW, BLUE, seedOf};

export const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

export function base(g) {
  base7(g);
  g.renderer.tint = [1.0, 1.0, 1.0];
}

/** Elenco frente a la pizarra; `who` es la familia que trae el problema. */
export function boardCast(g, who = 0) {
  const w = g.world;
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  familiesHome(g);
  family(w, who, BOARD.x + BOARD.w / 2 + 80, GROUND, {facing: -0.6});
}

export function clean(g, re) {
  base(g);
  g.world.removeWhere(o => re.test(o.id));
}

/** Un polígono (lista de puntos locales), cerrado salvo que se diga; con rayado opcional. */
export function poly(id, pts, {ch = WHITE, closed = true, w = 2.6, hatch = 0} = {}) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
    list.push(S(lineGuide(ax, ay, bx, by, rnd, 0.004), seed + i, {w, p: 0.95, ch}));
  }
  if (hatch) {
    // rayas horizontales recortadas al polígono (convexo)
    const ys = pts.map(p => p[1]);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let y = y0 + hatch; y < y1 - 2; y += hatch) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) / (by - ay) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) if (xs[k + 1] - xs[k] > 6) list.push(S(lineGuide(xs[k] + 3, y, xs[k + 1] - 3, y, rnd, 0.002), seed + 100 + Math.round(y), {w: 1.3, p: 0.45, ch, lift: false}));
    }
  }
  return list;
}

/** Un cuadrado de n × n cuadraditos de lado u, con su cuadrícula. */
export function gridSquare(id, n, u, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const s = n * u;
  const list = poly(id, [[0, 0], [s, 0], [s, s], [0, s]], {ch});
  for (let i = 1; i < n; i++) {
    list.push(S(lineGuide(i * u, 2, i * u, s - 2, rnd, 0.002), seed + 200 + i, {w: 1.1, p: 0.4, ch, lift: false}));
    list.push(S(lineGuide(2, i * u, s - 2, i * u, rnd, 0.002), seed + 400 + i, {w: 1.1, p: 0.4, ch, lift: false}));
  }
  return list;
}

/** Un triángulo rectángulo con el ángulo recto en 0,0: cateto a sobre +x y cateto b sobre +y. */
export const rightTri = (id, a, b, ch = WHITE) => poly(id, [[0, 0], [a, 0], [0, b]], {ch, hatch: 9});

/** Un sector (una «punta» recortada): vértice en 0,0, de 0 a `sweep` radianes (sentido horario de la pantalla). */
export function wedge(id, sweep, r = 46, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const arc = [];
  const n = Math.max(4, Math.round(sweep * 10));
  for (let i = 0; i <= n; i++) { const a = sweep * i / n; arc.push([Math.cos(a) * r, Math.sin(a) * r]); }
  return [
    S(lineGuide(0, 0, r, 0, rnd, 0.004), seed, {w: 2.4, p: 0.95, ch}),
    S(lineGuide(0, 0, Math.cos(sweep) * r, Math.sin(sweep) * r, rnd, 0.004), seed + 1, {w: 2.4, p: 0.95, ch}),
    S(arc, seed + 2, {w: 2.2, p: 0.9, ch}),
  ];
}

/** Ángulo de un vector (sentido horario de la pantalla, como en canvas). */
export const angleOf = (dx, dy) => Math.atan2(dy, dx);
