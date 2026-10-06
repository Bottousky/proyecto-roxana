// Capítulo 2 — piezas dibujadas. Las piezas móviles se arman en coordenadas locales (centro en 0,0).

import {stroke, lineGuide, smoothGuide, rectStrokes, circleGuide, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/** Un palito suelto, centrado. */
export function stick(id, len = 40) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const l = (rnd() - 0.5) * 0.12;
  return [S(lineGuide(-Math.sin(l) * len / 2, -len / 2, Math.sin(l) * len / 2, len / 2, rnd, 0.02), seed, {w: 3.6, p: 0.95})];
}

/** Atado de diez: diez palitos juntos y una cinta (celeste) con moño. */
export function bundle(id, len = 44, ch = BLUE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  for (let i = 0; i < 10; i++) {
    const xx = (i - 4.5) * 3.6;
    const tilt = (i - 4.5) * 0.02;
    list.push(S(lineGuide(xx - Math.sin(tilt) * len / 2, -len / 2 + rnd() * 2, xx + Math.sin(tilt) * len / 2, len / 2 - rnd() * 2, rnd, 0.01), seed + i, {w: 2.4, p: 0.9}));
  }
  list.push(S(smoothGuide([[-21, 1], [-8, 4], [8, 3], [21, 0]], 6), seed + 20, {w: 2.8, p: 0.95, ch}));
  list.push(S(smoothGuide([[-21, -4], [0, -1], [21, -5]], 6), seed + 21, {w: 2.2, p: 0.8, ch}));
  list.push(S(smoothGuide([[2, 0], [9, -8], [13, -2], [4, 1], [11, 9]], 5), seed + 22, {w: 2, p: 0.85, ch}));
  return list;
}

/** Atado de atados: diez atados chicos con espacio entre ellos (se pueden contar) y una faja amarilla. */
export function bigBundle(id, ch = YELLOW) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  for (let i = 0; i < 10; i++) {
    const x = (i - 4.5) * 12;
    for (let k = 0; k < 4; k++) {
      const xx = x + (k - 1.5) * 2.2;
      list.push(S(lineGuide(xx, -22 + rnd() * 2, xx + (rnd() - 0.5), 22 - rnd() * 2, rnd, 0.01), seed + i * 10 + k, {w: 1.9, p: 0.85}));
    }
    list.push(S([[x - 5, 1], [x + 5, 1]], seed + 200 + i, {w: 2, p: 0.9, ch: BLUE, lift: false}));
  }
  list.push(S(smoothGuide([[-62, 4], [0, 8], [62, 3]], 8), seed + 1, {w: 3.6, p: 0.95, ch}));
  list.push(S(smoothGuide([[-62, -5], [0, -1], [62, -6]], 8), seed + 2, {w: 2.6, p: 0.8, ch}));
  return list;
}

/** Desplaza un trazo ya construido (mismo grano, otro lugar). */
export function shift(s, dx, dy) {
  const pts = new Float32Array(s.pts);
  for (let i = 0; i < s.n; i++) {
    pts[i * 3] += dx;
    pts[i * 3 + 1] += dy;
  }
  return {...s, pts};
}

/** El molde de diez: una tabla con diez ranuras. Devuelve trazos absolutos y la posición de cada ranura. */
export function frame10(id, cx, cy) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const w = 260, h = 70;
  const list = [...rectStrokes(cx - w / 2, cy - h / 2, w, h, seed, {w: 3.4})];
  const slots = [];
  for (let i = 0; i < 10; i++) {
    const x = cx - w / 2 + 18 + i * ((w - 36) / 9);
    slots.push([x, cy]);
    list.push(S(lineGuide(x, cy + h / 2 - 6, x, cy + h / 2 - 16, rnd), seed + 10 + i, {w: 2, p: 0.6}));
  }
  return {strokes: list, slots};
}

/** El trineo de Mara. */
export function sled(id, cx, ground) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  return [
    S(smoothGuide([[cx - 110, ground - 30], [cx + 90, ground - 30], [cx + 120, ground - 44], [cx + 128, ground - 60]], 6), seed, {w: 3.6}),
    S(smoothGuide([[cx - 120, ground - 6], [cx + 100, ground - 6], [cx + 132, ground - 20], [cx + 138, ground - 36]], 6), seed + 1, {w: 3.4}),
    S(lineGuide(cx - 90, ground - 30, cx - 90, ground - 6, rnd), seed + 2, {w: 2.6}),
    S(lineGuide(cx + 60, ground - 30, cx + 60, ground - 6, rnd), seed + 3, {w: 2.6}),
    S(smoothGuide([[cx - 110, ground - 30], [cx - 160, ground - 60], [cx - 200, ground - 70]], 6), seed + 4, {w: 2.2, p: 0.7}),
  ];
}

/**
 * El depósito: cuartos de derecha a izquierda, cada uno más ancho que el anterior.
 * `widths[i]` es el ancho del cuarto i (0 = sueltos). Devuelve trazos y rectángulos de cuartos.
 */
export function depot(id, right, ground, widths, h = 230, label = true) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const total = widths.reduce((a, b) => a + b, 0);
  const left = right - total;
  const top = ground - h;
  const list = [
    ...rectStrokes(left, top, total, h, seed, {w: 4}),
    S([[left - 24, top], [(left + right) / 2, top - 96], [right + 24, top]], seed + 5, {w: 4, p: 0.95}),
  ];
  const rooms = [];
  let x = right;
  widths.forEach((wd, i) => {
    x -= wd;
    if (i < widths.length - 1) list.push(S(lineGuide(x, top + 3, x + (rnd() - 0.5) * 3, ground - 2, rnd), seed + 10 + i, {w: 3, p: 0.85}));
    rooms.push({x: x + 10, y: top + 30, w: wd - 20, h: h - 40});
  });
  void label;
  return {strokes: list, rooms, left, right, top};
}

/** Pizarrita del registro de Mara, sobre un caballete. */
export function easel(id, cx, ground, w = 300, h = 210) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const top = ground - 110 - h;
  return [
    ...rectStrokes(cx - w / 2, top, w, h, seed, {w: 3.6}),
    S(lineGuide(cx - w / 2 + 20, top + h, cx - w / 2 - 10, ground, rnd), seed + 6, {w: 3}),
    S(lineGuide(cx + w / 2 - 20, top + h, cx + w / 2 + 10, ground, rnd), seed + 7, {w: 3}),
    S(lineGuide(cx, top + h, cx + 4, ground - 10, rnd), seed + 8, {w: 2.4, p: 0.7}),
  ];
}

/** Sol de la mañana, a medio dibujar. */
export function sun(id, cx, cy, r = 46) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [S(circleGuide(cx, cy, r, rnd, {overshoot: 0.2}), seed, {w: 3, p: 0.85, ch: YELLOW})];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    list.push(S(lineGuide(cx + Math.cos(a) * (r + 12), cy + Math.sin(a) * (r + 12), cx + Math.cos(a) * (r + 30), cy + Math.sin(a) * (r + 30), rnd), seed + i + 1, {w: 2.4, p: 0.75, ch: YELLOW}));
  }
  return list;
}

export {WHITE, YELLOW, BLUE};
