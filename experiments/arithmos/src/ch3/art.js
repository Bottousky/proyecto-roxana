// Capítulo 3 — piezas: el atado que se debe (hueco y punteado) y la línea en el suelo.

import {stroke, lineGuide, WHITE, BLUE} from '../engine/chalk.js';
import {mulberry32, seedOf} from '../engine/rng.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/** Contorno punteado de un rectángulo (sin relleno): se reconoce por la forma, no por el color. */
function dashedRect(x0, y0, w, h, seed, ch) {
  const list = [];
  const per = [[x0, y0, x0 + w, y0], [x0 + w, y0, x0 + w, y0 + h], [x0 + w, y0 + h, x0, y0 + h], [x0, y0 + h, x0, y0]];
  let k = 0;
  for (const [ax, ay, bx, by] of per) {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / 9));
    for (let i = 0; i < n; i += 1) {
      const t0 = i / n, t1 = (i + 0.55) / n;
      list.push(S([[ax + (bx - ax) * t0, ay + (by - ay) * t0], [ax + (bx - ax) * t1, ay + (by - ay) * t1]], seed + k++, {w: 2.2, p: 0.9, ch, lift: false, wobble: 0.15, spacing: 1.5}));
    }
  }
  return list;
}

/** Un atado que se debe: el contorno punteado de un atado, con su cinta, sin palitos adentro. */
export function debt(id) {
  const seed = seedOf(id);
  const list = dashedRect(-20, -22, 40, 44, seed, BLUE);
  list.push(S([[-20, 0], [20, 0]], seed + 90, {w: 2.4, p: 0.85, ch: BLUE, lift: false}));
  return list;
}

/** La línea del suelo con marcas de −n a +n; el 0 más alto. Devuelve trazos y posiciones. */
export function numberLine(id, x0, y, step, from, to) {
  const seed = seedOf(id);
  const rnd = mulberry32(seed);
  const xa = x0 + from * step - 50, xb = x0 + to * step + 50;
  const list = [S(lineGuide(xa, y, xb, y, rnd, 0.002), seed, {w: 3.4, p: 0.95})];
  // flechas: la línea sigue para los dos lados
  list.push(S([[xb - 14, y - 9], [xb, y], [xb - 14, y + 9]], seed + 1, {w: 3, p: 0.9}));
  list.push(S([[xa + 14, y - 9], [xa, y], [xa + 14, y + 9]], seed + 2, {w: 3, p: 0.9}));
  const ticks = [];
  for (let n = from; n <= to; n++) {
    const x = x0 + n * step;
    const h = n === 0 ? 22 : 12;
    list.push(S(lineGuide(x, y - h, x, y + h, rnd), seed + 10 + n + 50, {w: n === 0 ? 3.6 : 2.6, p: 0.95}));
    ticks.push({n, x});
  }
  return {strokes: list, ticks};
}

export {WHITE, BLUE};
