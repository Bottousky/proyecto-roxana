// Capítulo 4 — piezas: las terrazas, la piedra del signo, bolsas, brotes y rectángulos.

import {stroke, lineGuide, smoothGuide, circleGuide, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/**
 * Las terrazas: una ladera en escalones que sube hacia la derecha.
 * Devuelve los trazos y la parte de arriba de cada escalón (x0, x1, y).
 */
export function terraces(id, x0, ground, count, w, rise) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  const steps = [];
  let x = x0, y = ground;
  const pts = [[x - 40, ground]];
  for (let k = 0; k < count; k++) {
    const top = ground - rise * (k + 1);
    pts.push([x, y], [x + (rnd() - 0.5) * 4, top]);
    steps.push({x0: x, x1: x + w, y: top});
    pts.push([x + w, top + (rnd() - 0.5) * 3]);
    x += w;
    y = top;
  }
  // el borde de cada escalón
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    if (Math.hypot(bx - ax, by - ay) < 2) continue;
    list.push(S(lineGuide(ax, ay, bx, by, rnd, 0.01), seed + i, {w: 3.2, p: 0.9}));
  }
  // la ladera por detrás, y el muro de cada escalón (piedras)
  list.push(S(smoothGuide([[x0 - 40, ground - 20], [x0 + w * 1.5, ground - rise * 2.6], [x, y - rise * 1.3], [x + 160, y - rise * 0.6]], 8), seed + 50, {w: 2.4, p: 0.6}));
  for (const st of steps) {
    for (let k = 0; k < 3; k++) {
      const sx = st.x0 + 8, sy = st.y + 14 + k * 20;
      if (sy > ground - 4) break;
      list.push(S([[sx, sy], [sx + 16, sy + 2]], seed + 100 + Math.round(st.x0) + k, {w: 1.8, p: 0.55, lift: false}));
    }
  }
  return {strokes: list, steps};
}

/** Una piedra grande con un signo grabado. */
export function rock(id, cx, ground, w = 220, h = 150) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([cx + Math.cos(a) * w / 2 * (0.92 + rnd() * 0.12), ground + Math.sin(a) * h * (0.9 + rnd() * 0.1)]);
  }
  return [S(smoothGuide(pts, 4), seed, {w: 3.2, p: 0.85}), S(lineGuide(cx - w / 2 - 10, ground, cx + w / 2 + 10, ground, rnd), seed + 1, {w: 2.6, p: 0.7})];
}

/** Una bolsa (coordenadas locales, centro en 0,0). `open` la deja abierta arriba. */
export function bag(id, open = true) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [
    S(smoothGuide([[-26, -22], [-34, 6], [-28, 30], [0, 36], [28, 30], [34, 6], [26, -22]], 6), seed, {w: 3, p: 0.9}),
  ];
  if (open) list.push(S(smoothGuide([[-26, -22], [-10, -28], [10, -28], [26, -22]], 5), seed + 1, {w: 2.2, p: 0.7}));
  else {
    list.push(S(smoothGuide([[-26, -22], [-8, -30], [0, -34], [8, -30], [26, -22]], 5), seed + 1, {w: 2.6, p: 0.85}));
    list.push(S(circleGuide(0, -36, 6, rnd, {overshoot: 0.2}), seed + 2, {w: 2.4, p: 0.9, ch: BLUE}));
  }
  return list;
}

/** Un brote de la huerta (coordenadas absolutas). */
export function sprout(id, x, y) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const lean = (rnd() - 0.5) * 4;
  return [
    S([[x, y], [x + lean, y - 18]], seed, {w: 2.4, p: 0.9, lift: false}),
    S(smoothGuide([[x + lean, y - 12], [x - 9, y - 20], [x - 13, y - 14]], 4), seed + 1, {w: 2, p: 0.85}),
    S(smoothGuide([[x + lean, y - 15], [x + 9, y - 24], [x + 14, y - 19]], 4), seed + 2, {w: 2, p: 0.85}),
  ];
}

/** El contorno de un rectángulo de f filas por c columnas, con su cuadrícula tenue. */
export function grid(id, x, y, f, c, cell) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  const w = c * cell, h = f * cell;
  list.push(S(lineGuide(x, y, x + w, y, rnd), seed, {w: 3, p: 0.9}));
  list.push(S(lineGuide(x + w, y, x + w, y + h, rnd), seed + 1, {w: 3, p: 0.9}));
  list.push(S(lineGuide(x + w, y + h, x, y + h, rnd), seed + 2, {w: 3, p: 0.9}));
  list.push(S(lineGuide(x, y + h, x, y, rnd), seed + 3, {w: 3, p: 0.9}));
  for (let i = 1; i < f; i++) list.push(S(lineGuide(x + 4, y + i * cell, x + w - 4, y + i * cell, rnd, 0.004), seed + 10 + i, {w: 1.4, p: 0.45}));
  for (let j = 1; j < c; j++) list.push(S(lineGuide(x + j * cell, y + 4, x + j * cell, y + h - 4, rnd, 0.004), seed + 40 + j, {w: 1.4, p: 0.45}));
  return list;
}

/** Una línea punteada vertical (el corte). */
export function cutLine(id, x, y0, y1) {
  const seed = seedOf(id);
  const list = [];
  const n = Math.max(3, Math.round((y1 - y0) / 16));
  for (let i = 0; i < n; i++) {
    const a = y0 + (i / n) * (y1 - y0), b = y0 + ((i + 0.55) / n) * (y1 - y0);
    list.push(S([[x, a], [x, b]], seed + i, {w: 2.6, p: 0.9, ch: YELLOW, lift: false, wobble: 0.15}));
  }
  return list;
}

export {WHITE, YELLOW, BLUE};
