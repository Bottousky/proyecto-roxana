// Trazos de tiza: puntos con presión, construidos a mano alzada y dibujables en parte.
//
// El lienzo de tiza codifica la presión en un canal por color de tiza
// (R = blanca, G = amarilla, B = celeste) y se dibuja con 'lighten' (máximo por canal),
// así los segmentos superpuestos no forman cuentas. El compuesto WebGL convierte presión
// en cobertura según el diente del pizarrón: poca presión sólo toca las crestas.

import {mulberry32, noise1, clamp} from './rng.js';

export const WHITE = 0, YELLOW = 1, BLUE = 2;
const LEVELS = 48;
const STYLES = [0, 1, 2].map(ch => Array.from({length: LEVELS + 1}, (_, i) => {
  const v = Math.round((i / LEVELS) * 255);
  return ch === 0 ? `rgb(${v},0,0)` : ch === 1 ? `rgb(0,${v},0)` : `rgb(0,0,${v})`;
}));
export const pressureStyle = (ch, p) => STYLES[ch][Math.round(clamp(p) * LEVELS)];

/**
 * Construye un trazo a partir de una polilínea guía.
 * @param {number[][]} guide puntos [x, y]
 */
export function stroke(guide, {w = 3.4, ch = WHITE, seed = 1, p = 0.9, wobble = 0.55, spacing = 2.6, lift = true} = {}) {
  const pts = resample(guide, spacing);
  const n = pts.length / 2;
  const rnd = noise1(seed);
  const rnd2 = noise1(seed * 7 + 3);
  const out = new Float32Array(n * 3);
  const cum = new Float32Array(n);
  let len = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0) len += Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
    cum[i] = len;
  }
  for (let i = 0; i < n; i++) {
    const x = pts[i * 2], y = pts[i * 2 + 1];
    // normal aproximada
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
    let nx = -(pts[b * 2 + 1] - pts[a * 2 + 1]), ny = pts[b * 2] - pts[a * 2];
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl; ny /= nl;
    const s = cum[i];
    const off = rnd(s / 14) * wobble + rnd2(s / 3.5) * wobble * 0.25;
    // presión: toque inicial, cuerpo irregular, levantada final
    const fromEnd = len - s;
    let prof = 1;
    if (s < 3) prof = 1.06;
    else if (s < 10) prof = 0.92 + 0.08 * (s / 10);
    if (lift && fromEnd < 16) prof *= 0.58 + 0.42 * (fromEnd / 16);
    const press = clamp(p * prof * (1 + 0.16 * rnd2(s / 9 + 50) + 0.06 * rnd(s / 2 + 90)));
    out[i * 3] = x + nx * off;
    out[i * 3 + 1] = y + ny * off;
    out[i * 3 + 2] = press;
  }
  // cerdas: la tiza toca el pizarrón con varias aristas; cada una saltea a su ritmo
  const br = new Float32Array(n * BRISTLES);
  for (let b = 0; b < BRISTLES; b++) {
    const nb = noise1(seed * 13 + b * 101 + 7);
    const nb2 = noise1(seed * 17 + b * 211 + 3);
    for (let i = 0; i < n; i++) {
      const s = cum[i];
      br[i * BRISTLES + b] = clamp(0.62 + 0.42 * nb(s / 11) + 0.18 * nb2(s / 3.2));
    }
  }
  return {pts: out, cum, len, w, ch, n, br};
}
const BRISTLES = 3;

function resample(guide, spacing) {
  const res = [];
  if (!guide.length) return res;
  res.push(guide[0][0], guide[0][1]);
  let carry = 0;
  for (let i = 1; i < guide.length; i++) {
    const [x0, y0] = guide[i - 1], [x1, y1] = guide[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d === 0) continue;
    let t = spacing - carry;
    while (t <= d) {
      res.push(x0 + (x1 - x0) * (t / d), y0 + (y1 - y0) * (t / d));
      t += spacing;
    }
    carry = d - (t - spacing);
  }
  const L = guide[guide.length - 1];
  res.push(L[0], L[1]);
  if (res.length === 2) res.push(L[0] + 0.01, L[1]);
  return res;
}

/**
 * Dibuja un trazo hasta la fracción `progress` de su longitud.
 * `fade` atenúa la presión (borrado parcial). Requiere ctx en modo 'lighten'.
 */
export function drawStroke(ctx, s, progress = 1, fade = 1, widthScale = 1, detail = true) {
  if (progress <= 0 || fade <= 0) return;
  const limit = s.len * Math.min(1, progress);
  const P = s.pts;
  const W = s.w * widthScale;
  ctx.lineCap = 'round';
  const passes = detail ? PASSES : PASSES_SIMPLE;
  for (const [wMul, pMul, bristle] of passes) {
    const off = bristle >= 0 ? (bristle / (BRISTLES - 1) - 0.5) * W * 0.62 : 0;
    for (let i = 1; i < s.n; i++) {
      if (s.cum[i - 1] > limit) break;
      let x1 = P[i * 3], y1 = P[i * 3 + 1];
      let x0 = P[i * 3 - 3], y0 = P[i * 3 - 2];
      if (s.cum[i] > limit) {
        const t = (limit - s.cum[i - 1]) / Math.max(0.001, s.cum[i] - s.cum[i - 1]);
        x1 = x0 + (x1 - x0) * t; y1 = y0 + (y1 - y0) * t;
      }
      let pr = (P[i * 3 + 2] + P[i * 3 - 1]) * 0.5;
      if (bristle >= 0) {
        pr *= s.br[i * BRISTLES + bristle];
        const dx = x1 - x0, dy = y1 - y0;
        const l = Math.hypot(dx, dy) || 1;
        const ox = -dy / l * off, oy = dx / l * off;
        x0 += ox; y0 += oy; x1 += ox; y1 += oy;
      }
      ctx.strokeStyle = pressureStyle(s.ch, pr * pMul * fade);
      ctx.lineWidth = W * wMul * (0.8 + 0.3 * pr);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }
}
// [ancho relativo, presión relativa, cerda (-1 = centrada)]
const PASSES = [[1.7, 0.34, -1], [0.62, 0.72, -1], [0.42, 0.96, 0], [0.42, 0.96, 1], [0.42, 0.96, 2]];
const PASSES_SIMPLE = [[1.6, 0.36, -1], [0.95, 0.9, -1]];

/** Punta de tiza actual al dibujar con `progress` (para ubicar la mano o el sonido). */
export function strokeTip(s, progress) {
  const limit = s.len * Math.min(1, Math.max(0, progress));
  for (let i = 1; i < s.n; i++) {
    if (s.cum[i] >= limit) {
      const t = (limit - s.cum[i - 1]) / Math.max(0.001, s.cum[i] - s.cum[i - 1]);
      return [s.pts[i * 3 - 3] + (s.pts[i * 3] - s.pts[i * 3 - 3]) * t, s.pts[i * 3 - 2] + (s.pts[i * 3 + 1] - s.pts[i * 3 - 2]) * t];
    }
  }
  return [s.pts[(s.n - 1) * 3], s.pts[(s.n - 1) * 3 + 1]];
}

/** Dibuja una lista de trazos como un solo gesto continuo: progress recorre todos en orden. */
export function drawStrokes(ctx, list, progress = 1, fade = 1, widthScale = 1, detail = true) {
  if (!list.length) return;
  const total = list.reduce((a, s) => a + s.len + PAUSE, 0);
  let budget = progress * total;
  for (const s of list) {
    if (budget <= 0) break;
    const take = Math.min(1, budget / s.len);
    drawStroke(ctx, s, take, fade, widthScale, detail);
    budget -= s.len + PAUSE;
  }
}
const PAUSE = 14; // levantar la tiza entre trazos cuesta "longitud"

export function strokesLength(list) {
  return list.reduce((a, s) => a + s.len + PAUSE, 0);
}

/** Dónde está la tiza al dibujar una lista con `progress`. */
export function strokesTip(list, progress) {
  const total = strokesLength(list);
  let budget = progress * total;
  for (const s of list) {
    if (budget <= s.len) return strokeTip(s, budget / s.len);
    budget -= s.len + PAUSE;
  }
  const last = list[list.length - 1];
  return strokeTip(last, 1);
}

// ——— Guías a mano alzada ———

export function lineGuide(x0, y0, x1, y1, rnd, bow = 0.012) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const b = (rnd() * 2 - 1) * bow * d;
  const nx = -(y1 - y0) / (d || 1), ny = (x1 - x0) / (d || 1);
  const g = [];
  const steps = Math.max(2, Math.ceil(d / 12));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k = 4 * t * (1 - t) * b;
    g.push([x0 + (x1 - x0) * t + nx * k, y0 + (y1 - y0) * t + ny * k]);
  }
  return g;
}

export function circleGuide(cx, cy, r, rnd, {overshoot = 0.35, squash = 0.04, start} = {}) {
  const a0 = start ?? rnd() * Math.PI * 2;
  const sweep = Math.PI * 2 + overshoot * (0.5 + rnd());
  const wob = noise1(Math.floor(rnd() * 1e6));
  const sq = 1 + (rnd() * 2 - 1) * squash;
  const g = [];
  const steps = Math.max(18, Math.ceil(r * sweep / 5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + sweep * t;
    const rr = r * (1 + wob(t * 4) * 0.035 + t * 0.03);
    g.push([cx + Math.cos(a) * rr * sq, cy + Math.sin(a) * rr / sq]);
  }
  return g;
}

export function arcGuide(cx, cy, r, a0, a1, rnd, wobble = 0.03) {
  const wob = noise1(Math.floor(rnd() * 1e6));
  const g = [];
  const steps = Math.max(8, Math.ceil(Math.abs(a1 - a0) * r / 6));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;
    const rr = r * (1 + wob(t * 3) * wobble);
    g.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return g;
}

export function bezierGuide(p0, p1, p2, p3, steps = 24) {
  const g = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    g.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return g;
}

/** Curva suave que pasa por los puntos (Catmull-Rom). */
export function smoothGuide(points, steps = 8) {
  if (points.length < 3) return points;
  const g = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      g.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  g.push(points[points.length - 1]);
  return g;
}

/** Rectángulo de tiza: cuatro trazos que se pasan un poco en las esquinas. */
export function rectStrokes(x, y, w, h, seed, opts = {}) {
  const rnd = mulberry32(seed);
  const o = () => 2 + rnd() * 5;
  return [
    stroke(lineGuide(x - o(), y, x + w + o(), y + (rnd() - 0.5) * 2, rnd), {...opts, seed: seed + 1}),
    stroke(lineGuide(x + w, y - o(), x + w + (rnd() - 0.5) * 2, y + h + o(), rnd), {...opts, seed: seed + 2}),
    stroke(lineGuide(x + w + o(), y + h, x - o(), y + h + (rnd() - 0.5) * 2, rnd), {...opts, seed: seed + 3}),
    stroke(lineGuide(x, y + h + o(), x + (rnd() - 0.5) * 2, y - o(), rnd), {...opts, seed: seed + 4}),
  ];
}

/** Un punto de tiza: una espiral apretada que llena el disco. */
export function dotStrokes(cx, cy, r, seed, opts = {}) {
  const rnd = mulberry32(seed);
  const g = [];
  const turns = 2.2;
  const a0 = rnd() * Math.PI * 2;
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + t * turns * Math.PI * 2;
    const rr = r * (0.15 + 0.62 * t);
    g.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return [stroke(g, {w: Math.max(2.2, r * 0.9), p: 1, wobble: 0.15, spacing: 1.5, lift: false, ...opts, seed})];
}

/**
 * Texto de tiza: relleno con presión media (el diente lo motea) y borde liviano.
 * `reveal` (0..1) descubre el texto de izquierda a derecha como si se escribiera.
 */
export function chalkText(ctx, text, x, y, {size = 40, ch = WHITE, p = 0.86, weight = 400, align = 'left', baseline = 'alphabetic', reveal = 1, fade = 1, font = 'Kalam'} = {}) {
  if (reveal <= 0 || fade <= 0) return 0;
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  const m = ctx.measureText(text);
  const w = m.width;
  if (reveal < 1) {
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.beginPath();
    ctx.rect(left - size, y - size * 2, size + w * reveal, size * 4);
    ctx.clip();
  }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pressureStyle(ch, 0.3 * fade);
  ctx.lineWidth = Math.max(1, size * 0.07);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = pressureStyle(ch, p * fade);
  ctx.fillText(text, x, y);
  ctx.restore();
  return w;
}
