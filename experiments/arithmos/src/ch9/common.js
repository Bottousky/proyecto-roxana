// Capítulo 9 — Depende: la pizarra de Mara en las Terrazas, con flechas, máquinas y el mapa del cap. 8.

import {Drawing} from '../engine/world.js';
import {BOARD, boardTop, cast, family, familiesHome, GROUND, area, SHOTS, T, tile, plate, Label, Shape, WHITE, YELLOW, BLUE, seedOf, S, base, boardCast, clean, poly} from '../ch8/common.js';

export {BOARD, boardTop, cast, family, familiesHome, GROUND, area, SHOTS, T, tile, plate, Drawing, Label, Shape, WHITE, YELLOW, BLUE, seedOf, S, base, boardCast, clean, poly};

/** Una flecha de tiza de (x0, y0) a (x1, y1). */
export function arrow(id, x0, y0, x1, y1, ch = WHITE) {
  const a = Math.atan2(y1 - y0, x1 - x0), h = 12;
  const seed = seedOf(id);
  return new Drawing(id, [
    S([[x0, y0], [x1, y1]], seed, {w: 2.4, p: 0.9, ch}),
    S([[x1, y1], [x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)]], seed + 1, {w: 2.4, p: 0.9, ch}),
    S([[x1, y1], [x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)]], seed + 2, {w: 2.4, p: 0.9, ch}),
  ], {z: 13, progress: 0});
}

/** Un punto de tiza (círculo chico relleno con rayas). */
export function dot(id, r = 7, ch = YELLOW) {
  const pts = Array.from({length: 10}, (_, i) => [Math.cos(i / 10 * Math.PI * 2) * r, Math.sin(i / 10 * Math.PI * 2) * r]);
  return poly(id, pts, {ch, w: 3, hatch: 3});
}
