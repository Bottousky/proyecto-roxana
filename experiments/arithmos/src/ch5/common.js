// Capítulo 5 — Partes de algo: la mañana siguiente en las Terrazas; barras de tiza nueva y la línea fina.

import {Drawing, Label, Shape} from '../engine/world.js';
import {stroke, lineGuide, WHITE, YELLOW, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';
import {base as base4, BOARD, boardTop, FAMILIES, cast, family, familiesHome, item, GROUND, mara, student, punto, art, art3} from '../ch4/common.js';

export {BOARD, boardTop, FAMILIES, cast, family, familiesHome, item, GROUND, mara, student, punto, art};

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/** Una barra de tiza nueva: la unidad que no se desata. */
export const BAR = {w: 320, h: 34};
/** Dónde se para cada familia y dónde está su barra fantasma (la unidad, punteada). */
export const FX = k => 13200 + k * 160;
export const GHOST = {w: 140, y: GROUND - 250};
export const ghostX = k => FX(k) - GHOST.w / 2;

export const SHOTS = {
  share: {x: 12980, y: 160, w: 1800, h: 640},
  board: {x: 13450, y: 140, w: 1550, h: 640},
  line: {x: 16250, y: 300, w: 1500, h: 520},
};

/** La línea fina: unidad grande para poder partirla. */
export const LINE = {zero: 16500, unit: 500};
export const lx = v => LINE.zero + v * LINE.unit;

/**
 * Un pedazo de barra (coordenadas locales: la izquierda en 0, centrado en y). `w` es su largo.
 * El relleno son rayas a lo largo: se ve como tiza, no como una caja vacía.
 */
export function barStrokes(id, w, h = BAR.h, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [
    S(lineGuide(0, -h / 2, w, -h / 2, rnd, 0.004), seed, {w: 2.8, p: 0.95, ch}),
    S(lineGuide(w, -h / 2, w, h / 2, rnd, 0.004), seed + 1, {w: 2.8, p: 0.95, ch}),
    S(lineGuide(w, h / 2, 0, h / 2, rnd, 0.004), seed + 2, {w: 2.8, p: 0.95, ch}),
    S(lineGuide(0, h / 2, 0, -h / 2, rnd, 0.004), seed + 3, {w: 2.8, p: 0.95, ch}),
  ];
  for (let i = 1; i < 4; i++) list.push(S(lineGuide(3, -h / 2 + i * h / 4, w - 3, -h / 2 + i * h / 4, rnd, 0.002), seed + 10 + i, {w: 1.6, p: 0.55, ch, lift: false}));
  return list;
}

/** Un pedazo de barra como objeto móvil; x es su borde izquierdo. */
export function piece(w, id, len, x, y, opts = {}) {
  const sh = w.add(new Shape(id, barStrokes(id, len, opts.h ?? BAR.h, opts.ch ?? WHITE), x, y, {z: opts.z ?? 15}));
  sh.len = len;
  sh.scale = sh.baseScale = opts.scale ?? 1;
  return sh;
}

/** El contorno punteado de una barra entera: la unidad de cada familia. */
export function ghostBar(w, k) {
  const id = `ghost-${k}`;
  return w.ensure(id, () => {
    const seed = seedOf(id);
    const list = [];
    const x0 = ghostX(k), y0 = GHOST.y - BAR.h * 0.44 / 2, gw = GHOST.w, gh = BAR.h * 0.44;
    const per = [[x0, y0, x0 + gw, y0], [x0 + gw, y0, x0 + gw, y0 + gh], [x0 + gw, y0 + gh, x0, y0 + gh], [x0, y0 + gh, x0, y0]];
    let n = 0;
    for (const [ax, ay, bx, by] of per) {
      const len = Math.hypot(bx - ax, by - ay);
      const m = Math.max(2, Math.round(len / 9));
      for (let i = 0; i < m; i++) {
        const t0 = i / m, t1 = (i + 0.5) / m;
        list.push(S([[ax + (bx - ax) * t0, ay + (by - ay) * t0], [ax + (bx - ax) * t1, ay + (by - ay) * t1]], seed + n++, {w: 1.8, p: 0.7, lift: false, wobble: 0.1}));
      }
    }
    return new Drawing(id, list, {z: 9});
  });
}

/** Fondo del cap. 5: las Terrazas de la mañana siguiente. */
export function base(g, {line = false} = {}) {
  base4(g);
  g.renderer.tint = [1.04, 1.0, 0.95];
  if (line) lineOn(g.world);
}

/** La línea fina, de 0 a 2. */
export function lineOn(w) {
  const nl = art3.numberLine('l5', LINE.zero, GROUND, LINE.unit, 0, 2);
  w.ensure('l5', () => new Drawing('l5', nl.strokes, {z: 2}));
  for (const n of [0, 1, 2]) w.ensure(`l5-${n}`, () => new Label(`l5-${n}`, String(n), lx(n), GROUND + 52, {size: 34, align: 'center', z: 9, weight: 700}));
}

/** Marcas de una partición de la línea (cada 1/d) entre 0 y 2. */
export function partitionOn(w, d, {progress = 1} = {}) {
  const id = `l5p-${d}`;
  return w.ensure(id, () => {
    const seed = seedOf(id);
    const rnd = mulberry32(seed);
    const list = [];
    for (let i = 1; i < 2 * d; i++) {
      if (i % d === 0) continue;
      const x = lx(i / d);
      const h = d <= 4 ? 13 : 8;
      list.push(S(lineGuide(x, GROUND - h, x, GROUND + h, rnd), seed + i, {w: d <= 4 ? 2.4 : 1.8, p: 0.85, ch: d <= 4 ? WHITE : YELLOW}));
    }
    return new Drawing(id, list, {z: 3, progress});
  });
}

/** Una fracción escrita "de pie": numerador, raya y denominador. */
export function fracLabel(w, id, n, d, x, y, opts = {}) {
  const size = opts.size ?? 30;
  const ch = opts.ch ?? WHITE;
  const top = w.add(new Label(`${id}-n`, String(n), x, y - size * 0.55, {size, align: 'center', z: opts.z ?? 9, ch, reveal: opts.reveal ?? 1}));
  const bot = w.add(new Label(`${id}-d`, String(d), x, y + size * 0.55, {size, align: 'center', z: opts.z ?? 9, ch, reveal: opts.reveal ?? 1}));
  const bar = w.add(new Drawing(`${id}-b`, [S([[x - size * 0.42, y - size * 0.12], [x + size * 0.42, y - size * 0.12]], seedOf(id), {w: 2.4, p: 0.95, ch, lift: false})], {z: opts.z ?? 9, progress: opts.reveal ?? 1}));
  return [top, bar, bot];
}

export {Drawing, Label, Shape, WHITE, YELLOW, BLUE, S, seedOf, mulberry32, lineGuide};
