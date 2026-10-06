// Capítulo 2 — piezas dibujadas: palitos, atados, el depósito de Mara, pájaros.

import {stroke, lineGuide, smoothGuide, rectStrokes, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/** Un palito suelto. */
export function stick(id, x, y, len = 42, lean = 0) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const l = lean + (rnd() - 0.5) * 0.08;
  return [S(lineGuide(x - Math.sin(l) * len / 2, y - len / 2, x + Math.sin(l) * len / 2, y + len / 2, rnd, 0.02), seed, {w: 3.6, p: 0.95})];
}

/** Atado de diez: diez palitos juntos y una cinta que los ciñe. */
export function bundle(id, x, y, len = 46, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  for (let i = 0; i < 10; i++) {
    const xx = x + (i - 4.5) * 4.2;
    const tilt = (i - 4.5) * 0.018;
    list.push(S(lineGuide(xx - Math.sin(tilt) * len / 2, y - len / 2 + rnd() * 2, xx + Math.sin(tilt) * len / 2, y + len / 2 - rnd() * 2, rnd, 0.01), seed + i, {w: 2.6, p: 0.9}));
  }
  // la cinta: dos vueltas y un moño
  list.push(S(smoothGuide([[x - 25, y + 1], [x - 10, y + 4], [x + 10, y + 3], [x + 25, y]], 6), seed + 20, {w: 2.6, p: 0.95, ch}));
  list.push(S(smoothGuide([[x - 25, y - 4], [x, y - 1], [x + 25, y - 5]], 6), seed + 21, {w: 2.2, p: 0.8, ch}));
  list.push(S(smoothGuide([[x + 2, y], [x + 10, y - 9], [x + 15, y - 2], [x + 4, y + 1], [x + 12, y + 10]], 5), seed + 22, {w: 2, p: 0.85, ch}));
  return list;
}

/** Atado de atados: diez atados juntos bajo una cinta ancha. */
export function bigBundle(id, x, y, ch = YELLOW) {
  const seed = seedOf(id);
  const list = [];
  for (let i = 0; i < 10; i++) list.push(...bundle(`${id}-${i}`, x + (i - 4.5) * 9, y, 54).slice(0, 10));
  const rnd = mulberry32(seed);
  list.push(S(smoothGuide([[x - 52, y + 2], [x, y + 6], [x + 52, y + 1]], 8), seed + 1, {w: 4, p: 0.95, ch}));
  list.push(S(smoothGuide([[x - 52, y - 6], [x, y - 2], [x + 52, y - 7]], 8), seed + 2, {w: 3, p: 0.8, ch}));
  list.push(...rectStrokes(x - 58, y - 34, 116, 68, seed + 3, {w: 1.6, p: 0.35}));
  void rnd;
  return list;
}

/** Pájaro de tiza: una "v" abierta que aletea según `flap` (0..1). */
export function bird(id, x, y, s = 1, flap = 0.5) {
  const seed = seedOf(id);
  const a = 6 + flap * 10;
  return [S(smoothGuide([[x - 12 * s, y - a * s * 0.6], [x - 5 * s, y - 2 * s], [x, y + 2 * s], [x + 5 * s, y - 2 * s], [x + 12 * s, y - a * s * 0.6]], 4), seed, {w: 2.4 * s, p: 0.9, lift: false})];
}

/**
 * El depósito: un galpón con cuartos de derecha a izquierda (sueltos, atados, atados de atados).
 * Devuelve {strokes, rooms: [{x, y, w, h}]} con el cuarto 0 a la derecha.
 */
export function depot(id, cx, ground, count = 3, roomW = 210, h = 230) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const w = roomW * count;
  const x0 = cx - w / 2, top = ground - h;
  const list = [
    ...rectStrokes(x0, top, w, h, seed, {w: 4}),
    // techo a dos aguas
    S([[x0 - 20, top], [cx, top - 90], [x0 + w + 20, top]], seed + 5, {w: 4, p: 0.95}),
  ];
  const rooms = [];
  for (let i = 0; i < count; i++) {
    const rx = x0 + w - (i + 1) * roomW;
    if (i > 0) list.push(S(lineGuide(rx + roomW, top + 4, rx + roomW + (rnd() - 0.5) * 3, ground - 2, rnd), seed + 10 + i, {w: 3, p: 0.85}));
    rooms.push({x: rx + 12, y: top + 40, w: roomW - 24, h: h - 52});
  }
  return {strokes: list, rooms};
}

export {WHITE, YELLOW, BLUE};
