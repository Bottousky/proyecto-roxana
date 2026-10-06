// Piezas dibujadas a mano alzada. Todas son deterministas: el mismo id dibuja lo mismo.

import {stroke, lineGuide, circleGuide, arcGuide, smoothGuide, rectStrokes, dotStrokes, WHITE, YELLOW, BLUE} from './engine/chalk.js';

export const SEAT_GAP = 46;
export const TIER = 64;
import {Drawing, Label, Smear} from './engine/world.js';
import {mulberry32, seedOf} from './engine/rng.js';

export const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

export function drawing(id, strokes, opts) {
  return new Drawing(id, strokes, opts);
}

/** Puerta: marco y umbral (estático). */
export function doorFrame(id, x, ground, w = 150, h = 270) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const top = ground - h;
  return [
    S(lineGuide(x - w / 2, ground + 2, x - w / 2 - 1, top - 6, rnd), seed + 1, {w: 4.2}),
    S(lineGuide(x - w / 2 - 14, top, x + w / 2 + 14, top - 2, rnd), seed + 2, {w: 4.6}),
    S(lineGuide(x + w / 2, top - 6, x + w / 2 + 1, ground + 2, rnd), seed + 3, {w: 4.2}),
    S(lineGuide(x - w / 2 - 30, ground + 3, x + w / 2 + 30, ground + 1, rnd), seed + 4, {w: 3.2, p: 0.7}),
    S(lineGuide(x - w / 2 - 8, top - 12, x + w / 2 + 8, top - 13, rnd), seed + 5, {w: 2.4, p: 0.6}),
  ];
}

/** Hoja de la puerta, abierta `open` (0 cerrada, 1 abierta hacia el espectador). */
export function doorPanel(id, x, ground, w = 150, h = 270, open = 0) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const top = ground - h + 8;
  const hinge = x - w / 2 + 4;
  const ww = (w - 8) * Math.cos(open * 1.35);
  const flare = Math.sin(open * 1.35) * 22;
  const edge = hinge + ww;
  const list = [
    S([[hinge, top], [edge, top - flare]], seed + 1, {w: 3.2, p: 0.85}),
    S([[edge, top - flare], [edge, ground + flare * 0.4]], seed + 2, {w: 3.2, p: 0.85}),
    S([[edge, ground + flare * 0.4], [hinge, ground - 2]], seed + 3, {w: 3.2, p: 0.85}),
  ];
  if (ww > 30) {
    const kx = hinge + ww * 0.82, ky = (top + ground) / 2 + 8;
    list.push(S(circleGuide(kx, ky, 6, rnd, {overshoot: 0.3}), seed + 4, {w: 2.6, p: 0.9}));
    // paneles de la hoja
    list.push(...rectStrokes(hinge + ww * 0.16, top + 26, ww * 0.68, h * 0.3, seed + 5, {w: 2, p: 0.55}));
    list.push(...rectStrokes(hinge + ww * 0.16, top + 40 + h * 0.34, ww * 0.68, h * 0.3, seed + 9, {w: 2, p: 0.55}));
  }
  return list;
}

/** Luz del otro lado: rayado amarillo liviano dentro del marco. */
export function doorLight(id, x, ground, w = 150, h = 270, density = 1) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const top = ground - h + 10;
  const list = [];
  const n = Math.round(16 * density);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const xx = x - w / 2 + 10 + t * (w - 20);
    list.push(S(lineGuide(xx + 18, top + 4 + rnd() * 12, xx - 18, ground - 6 - rnd() * 14, rnd, 0.02), seed + i, {w: 2, p: 0.34 + rnd() * 0.16, ch: YELLOW, wobble: 0.3}));
  }
  return list;
}

/** Piedra: losa baja de canto casi plano, con grietas; en su cara se anotan las marcas. */
export function stone(id, cx, ground, w = 640, h = 110) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const x0 = cx - w / 2, x1 = cx + w / 2, top = ground - h;
  const edge = [[x0 - 4, ground], [x0 + 4, top + 34], [x0 + 22, top + 8], [x0 + 60, top]];
  const n = 7;
  for (let i = 1; i < n; i++) edge.push([x0 + 60 + (w - 120) * (i / n), top + (rnd() - 0.5) * 7]);
  edge.push([x1 - 56, top + 2], [x1 - 18, top + 12], [x1 - 3, top + 38], [x1 + 4, ground]);
  const list = [
    S(smoothGuide(edge, 6), seed + 1, {w: 4.4, p: 0.95}),
    S(lineGuide(x0 - 30, ground, x1 + 34, ground + 2, rnd), seed + 2, {w: 3.2, p: 0.75}),
    // canto superior: una segunda línea liviana da espesor
    S(smoothGuide([[x0 + 40, top + 15], [cx, top + 12 + (rnd() - 0.5) * 4], [x1 - 40, top + 16]], 8), seed + 3, {w: 1.5, p: 0.26}),
    S(smoothGuide([[x1 - 70, top + 20], [x1 - 62, top + 44], [x1 - 74, top + 60]], 5), seed + 4, {w: 1.6, p: 0.5}),
    S(smoothGuide([[x0 + 40, ground - 20], [x0 + 52, ground - 34], [x0 + 46, ground - 46]], 5), seed + 5, {w: 1.5, p: 0.45}),
  ];
  for (let i = 0; i < 12; i++) {
    const xx = x0 + 20 + i * (w - 40) / 11;
    list.push(S(lineGuide(xx, ground + 7, xx + 24, ground + 16, rnd), seed + 10 + i, {w: 1.5, p: 0.36}));
  }
  return list;
}

/** Marca de conteo: un trazo casi vertical. */
export function tally(id, x, y, len = 46) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const lean = (rnd() - 0.4) * 7;
  return [S(lineGuide(x + lean, y - len / 2, x - lean * 0.3, y + len / 2, rnd, 0.03), seed, {w: 4.2, p: 0.98})];
}

/** Gradas: tres escalones curvos y sus asientos (pequeñas cunas). */
export function gradas(id, cx, ground, seats) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  const tiers = 3;
  for (let t = 0; t < tiers; t++) {
    const y = ground - t * TIER;
    const half = 158 - t * 24;
    const g = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      g.push([cx - half + u * half * 2, y - Math.sin(u * Math.PI) * 10]);
    }
    list.push(S(g, seed + t * 3, {w: 3.6, p: 0.9}));
    list.push(S(lineGuide(cx - half, y, cx - half + 12, y - TIER, rnd), seed + t * 3 + 1, {w: 3, p: 0.7}));
    list.push(S(lineGuide(cx + half, y, cx + half - 12, y - TIER, rnd), seed + t * 3 + 2, {w: 3, p: 0.7}));
  }
  for (const [i, s] of seats.entries()) {
    list.push(S(arcGuide(s[0], s[1] - 14, 15, 0.2, Math.PI - 0.2, rnd), seed + 50 + i, {w: 3.6, p: 0.95}));
  }
  return list;
}

/** Posiciones de asientos de las gradas (filas compactas). */
export function seatPositions(cx, ground, count) {
  const rows = [6, 5, 3];
  const out = [];
  let k = 0;
  for (let r = 0; r < rows.length && k < count; r++) {
    const y = ground - r * TIER - 4;
    const n = Math.min(rows[r], count - k);
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * SEAT_GAP;
      out.push([x, y - Math.sin(((x - cx) / 316 + 0.5) * Math.PI) * 10]);
      k++;
    }
  }
  return out;
}

export const dotStrokesFor = (x, y, r, ch = WHITE) => dotStrokes(x, y, r, seedOf('dot', Math.round(x), Math.round(y)), {ch});

export const rectStrokesFor = (id, x, y, w, h) => rectStrokes(x, y, w, h, seedOf(id), {w: 2.6, p: 0.85});

/** Cruz de tiza: algo que no coincide. */
export function crossFor(id, x, y, r = 20) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  return [
    S(lineGuide(x - r, y - r, x + r, y + r, rnd), seed, {w: 3.4, p: 0.95}),
    S(lineGuide(x + r, y - r, x - r, y + r, rnd), seed + 1, {w: 3.4, p: 0.95}),
  ];
}

export const circleGuideFor = (x, y, r, seed = 1) => circleGuide(x, y, r, mulberry32(seed + Math.round(x * 7 + y)), {overshoot: 0.3});

export function star(id, x, y, r = 7, ch = WHITE) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  return [
    S(lineGuide(x - r, y + (rnd() - 0.5) * 2, x + r, y, rnd), seed, {w: 1.8, p: 0.85, ch}),
    S(lineGuide(x, y - r, x + (rnd() - 0.5) * 2, y + r, rnd), seed + 1, {w: 1.8, p: 0.85, ch}),
  ];
}

/** Colina u horizonte suave. */
export function hill(id, x0, x1, y, rise, p = 0.5) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const pts = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x0 + (x1 - x0) * t, y - Math.sin(t * Math.PI) * rise * (0.85 + rnd() * 0.3)]);
  }
  return [S(smoothGuide(pts, 8), seed, {w: 2.6, p})];
}

export function crack(id, x0, y0, x1, y1, seg = 12) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    pts.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * 14, y0 + (y1 - y0) * t]);
  }
  const list = [S(pts, seed, {w: 2, p: 0.75, wobble: 0.2})];
  // ramitas
  for (const k of [3, 6, 9]) {
    const [bx, by] = pts[k];
    const dir = rnd() > 0.5 ? 1 : -1;
    list.push(S([[bx, by], [bx + dir * (10 + rnd() * 10), by + 8 + rnd() * 8], [bx + dir * (18 + rnd() * 12), by + 12 + rnd() * 10]], seed + k, {w: 1.4, p: 0.6, wobble: 0.2}));
  }
  return list;
}

/** Suelo: una línea larga en tramos, con pequeñas interrupciones. */
export function groundLine(id, x0, x1, y) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const len = 260 + rnd() * 380;
    const end = Math.min(x1, x + len);
    list.push(S(lineGuide(x, y + (rnd() - 0.5) * 3, end, y + (rnd() - 0.5) * 3, rnd, 0.004), seed + i++, {w: 2.6, p: 0.62, wobble: 0.5}));
    x = end + 10 + rnd() * 40;
  }
  return list;
}

export function ghostHouse(id, x, ground, s = 1) {
  const seed = seedOf(id);
  const w = 170 * s, h = 120 * s;
  const rnd = mulberry32(seed);
  return [
    ...rectStrokes(x - w / 2, ground - h, w, h, seed, {w: 3.4}),
    S([[x - w / 2 - 14, ground - h], [x, ground - h - 90 * s], [x + w / 2 + 14, ground - h]], seed + 7, {w: 3.4}),
    ...rectStrokes(x - 20 * s, ground - 66 * s, 40 * s, 66 * s, seed + 9, {w: 2.6}),
    S(circleGuide(x + 45 * s, ground - 78 * s, 14 * s, rnd), seed + 15, {w: 2.4}),
  ];
}

export function ghostTree(id, x, ground, s = 1) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2.1;
    const r = (60 + rnd() * 18) * s;
    pts.push([x + Math.cos(a) * r, ground - 170 * s + Math.sin(a) * r * 0.8]);
  }
  return [
    S(lineGuide(x - 8 * s, ground, x - 5 * s, ground - 110 * s, rnd), seed, {w: 3.4}),
    S(lineGuide(x + 9 * s, ground, x + 6 * s, ground - 110 * s, rnd), seed + 1, {w: 3.4}),
    S(smoothGuide(pts, 5), seed + 2, {w: 3}),
  ];
}

export function ghostParabola(id, x, y, s = 1) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = -10; i <= 10; i++) pts.push([x + i * 14 * s, y - (100 - i * i) * 1.5 * s]);
  return [
    S(lineGuide(x - 170 * s, y, x + 170 * s, y, rnd), seed, {w: 2.4}),
    S(lineGuide(x, y + 30 * s, x, y - 180 * s, rnd), seed + 1, {w: 2.4}),
    S(pts, seed + 2, {w: 2.8}),
  ];
}

export function ghostLine(id, x, y, len, ticks = 9) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const list = [S(lineGuide(x, y, x + len, y, rnd), seed, {w: 2.8})];
  for (let i = 0; i < ticks; i++) {
    const xx = x + 20 + i * (len - 40) / (ticks - 1);
    list.push(S(lineGuide(xx, y - 10, xx, y + 10, rnd), seed + i + 1, {w: 2.2}));
  }
  return list;
}

export function ghostSpiral(id, x, y, r) {
  const seed = seedOf(id);
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const a = t * Math.PI * 6;
    pts.push([x + Math.cos(a) * r * t, y + Math.sin(a) * r * t]);
  }
  return [S(pts, seed, {w: 2.6})];
}

/** Banda de borrado (polvo) a lo largo de una curva suave. */
export function smear(id, pts, width = 140, alpha = 0.35) {
  return new Smear(id, smoothGuide(pts, 6), {width, alpha});
}

/** Fantasma: dibujo casi borrado (sólo las crestas del diente conservan tiza) más su polvo. */
export function ghost(id, strokes, fade = 0.26, dust = 0.06, z = -5) {
  return new Drawing(id, strokes, {fade, dust, z});
}

export function ghostText(id, text, x, y, size = 46, fade = 0.3) {
  return new Label(id, text, x, y, {size, fade, z: -5, p: 0.86, decor: true});
}

export {WHITE, YELLOW, BLUE};
