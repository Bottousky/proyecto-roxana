// Capítulo 12 — Anticipar: la pizarra de Mara, con mapas donde se dibujan las reglas.

import {Drawing, Label, Shape} from '../engine/world.js';
import {SHOTS, area, base, boardCast, clean, poly, dot, arrow, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';

export {Drawing, Label, Shape, SHOTS, area, base, boardCast, clean, poly, dot, arrow, S, seedOf, WHITE, YELLOW, BLUE};

export const dec = v => String(Math.round(v * 100) / 100).replace('.', ',').replace('-', '−');

/** Un mapa con ejes en la caja {x, y, w, h} para x ∈ [x0, x1], y ∈ [y0, y1]. Devuelve px, py. */
export function axes(w, id, box, [x0, x1], [y0, y1], {xticks = [], yticks = [], xname = '', yname = ''} = {}) {
  const px = x => box.x + (x - x0) / (x1 - x0) * box.w;
  const py = y => box.y + box.h - (y - y0) / (y1 - y0) * box.h;
  const zx = Math.min(Math.max(0, x0), x1), zy = Math.min(Math.max(0, y0), y1);
  w.add(new Drawing(id, [
    S([[box.x - 4, py(zy)], [box.x + box.w + 6, py(zy)]], seedOf(`${id}x`), {w: 2.2, p: 0.9}),
    S([[px(zx), box.y + box.h + 4], [px(zx), box.y - 6]], seedOf(`${id}y`), {w: 2.2, p: 0.9}),
  ], {z: 11}));
  for (const t of xticks) w.add(new Label(`${id}tx${t}`, dec(t), px(t), py(zy) + 20, {size: 15, align: 'center', z: 12, ch: BLUE}));
  for (const t of yticks) w.add(new Label(`${id}ty${t}`, dec(t), px(zx) - 8, py(t) + 5, {size: 15, align: 'right', z: 12, ch: BLUE}));
  if (xname) w.add(new Label(`${id}xn`, xname, box.x + box.w + 8, py(zy) - 8, {size: 14, z: 12, ch: BLUE}));
  if (yname) w.add(new Label(`${id}yn`, yname, px(zx) + 8, box.y - 2, {size: 14, z: 12, ch: BLUE}));
  return {px, py};
}

/** La curva de f entre a y b (recortada a la caja de y), como trazo de tiza. Corta donde f no está definida. */
export function curve(id, f, [a, b], px, py, [ymin, ymax], {ch = YELLOW, n = 80, w = 2.6} = {}) {
  const strokes = [];
  let run = [];
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n, y = f(x);
    if (!Number.isFinite(y) || y < ymin || y > ymax) { if (run.length > 1) strokes.push(run); run = []; continue; }
    run.push([px(x), py(y)]);
  }
  if (run.length > 1) strokes.push(run);
  return new Drawing(id, strokes.map((r, k) => S(r, seedOf(id) + k, {w, p: 0.9, ch})), {z: 13});
}
