// Capítulo 10 — el pozo de las Terrazas, fuera de la pizarra: la rueda con su manija, la soga y el balde.

import {easeInOut} from '../engine/rng.js';
import {GROUND, Drawing, Shape, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';

export const WELL = {x: 13450, rim: GROUND - 60, axle: GROUND - 196, R: 38};
/** El pozo de cerca, con lugar para la rueda y el balde arriba. */
export const SHOT_WELL = {x: 13130, y: GROUND - 330, w: 640, h: 380};
/** El pozo y la pizarra juntos: se ve subir el balde y se lee lo anotado. */
export const SHOT_WELL_BOARD = {x: 13300, y: GROUND - 470, w: 1300, h: 540};

const ring = (cx, cy, rx, ry, n = 28) => Array.from({length: n + 1}, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rx, cy + Math.sin(i / n * Math.PI * 2) * ry]);

/** La rueda en coordenadas locales (centro en 0): aro, cuatro rayos y la manija, que gira con `rot`. */
function wheelStrokes(R) {
  const seed = seedOf('well-wheel');
  const list = [S(ring(0, 0, R, R, 36), seed, {w: 2.6, p: 0.9})];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    list.push(S([[0, 0], [Math.cos(a) * R, Math.sin(a) * R]], seed + 1 + k, {w: 1.8, p: 0.75, lift: false}));
  }
  list.push(S(ring(R, 0, 5, 5, 10), seed + 9, {w: 3, p: 0.95, ch: YELLOW}));
  return list;
}

/** El balde: un tacho con asa; el agua adentro según `fill` (0 vacío, 0,5 a medias, 1 lleno). */
function bucketStrokes(fill = 0) {
  const seed = seedOf('well-bucket');
  const list = [
    S([[-15, 0], [-12, 26], [12, 26], [15, 0], [-15, 0]], seed, {w: 2.4, p: 0.9}),
    S(ring(0, 0, 15, 8, 12).filter(([, y]) => y <= 0), seed + 1, {w: 1.6, p: 0.7, lift: false}),
  ];
  const top = 26 - 24 * fill;
  for (let y = 24; fill > 0 && y >= top; y -= 4) list.push(S([[-12 - (26 - y) * 0.1, y], [12 + (26 - y) * 0.1, y]], seed + 10 + y, {w: 1.5, p: 0.75, ch: BLUE, lift: false}));
  return list;
}

/** Dibuja el pozo (si no está). Con `rope: false`, la rueda sin soga ni balde. */
export function well(g, {rope = true} = {}) {
  const w = g.world, {x, rim, axle, R} = WELL, G = GROUND;
  const seed = seedOf('well');
  w.ensure('well', () => {
    const list = [
      S([[x - 72, G], [x - 72, rim]], seed, {w: 2.6, p: 0.9}),
      S([[x + 72, G], [x + 72, rim]], seed + 1, {w: 2.6, p: 0.9}),
      S(ring(x, rim, 72, 13), seed + 2, {w: 2.4, p: 0.85}),
      S([[x - 64, rim - 4], [x - 64, axle - 32]], seed + 3, {w: 2.6, p: 0.9}),
      S([[x + 64, rim - 4], [x + 64, axle - 32]], seed + 4, {w: 2.6, p: 0.9}),
      S([[x - 78, axle - 26], [x, axle - 70], [x + 78, axle - 26]], seed + 5, {w: 2.6, p: 0.9}),
      S([[x - 64 - R - 14, axle], [x + 64, axle]], seed + 6, {w: 2.2, p: 0.8}),
    ];
    // piedras de la pared
    for (let i = 0; i < 3; i++) list.push(S([[x - 72, G - 18 - i * 16], [x + 72, G - 18 - i * 16]], seed + 10 + i, {w: 1.2, p: 0.45, lift: false}));
    for (let i = 0; i < 6; i++) { const sx = x - 60 + i * 24 + (i % 2) * 10, sy = G - 18 - (i % 3) * 16; list.push(S([[sx, sy], [sx, sy + 16]], seed + 20 + i, {w: 1.2, p: 0.45, lift: false})); }
    return new Drawing('well', list, {z: 3});
  });
  w.ensure('well-wheel', () => new Shape('well-wheel', wheelStrokes(R), x - 64 - R - 14, axle, {z: 4}));
  if (rope) {
    w.ensure('well-bucket', () => new Shape('well-bucket', bucketStrokes(0), x, rim + 6, {z: 4, fade: 0}));
    setRope(g, rim + 6);
  } else {
    w.remove('well-bucket');
    w.remove('well-rope');
  }
}

function setRope(g, y) {
  const {x, axle} = WELL;
  g.world.remove('well-rope');
  g.world.add(new Drawing('well-rope', [S([[x, axle], [x, y]], seedOf('well-rope'), {w: 1.6, p: 0.8, lift: false})], {z: 3}));
}

/** Sube el balde girando la manija; `fill` dice cómo llega. Vuelve a bajarlo al final si `back`. */
export async function pull(d, g, fill = 1, {back = true, sec = 1.1} = {}) {
  const w = g.world, {rim} = WELL;
  const wheel = w.get('well-wheel');
  w.remove('well-bucket');
  const b = w.add(new Shape('well-bucket', bucketStrokes(fill), WELL.x, rim + 6, {z: 4, fade: 0}));
  const y0 = rim + 6, y1 = rim - 74, r0 = wheel ? wheel.rot : 0;
  await d.tween(sec, q => {
    b.y = y0 + (y1 - y0) * q;
    b.fade = Math.min(1, q * 3);
    if (wheel) wheel.rot = r0 - q * Math.PI * 4;
    setRope(g, b.y);
  }, easeInOut);
  g.audio.tap(0.15, fill >= 1 ? 1.3 : 0.9);
  if (!back) return;
  await d.wait(0.5);
  await d.tween(0.6, q => { b.y = y1 + (y0 - y1) * q; b.fade = 1 - q; if (wheel) wheel.rot = r0 - (1 - q) * Math.PI * 4; setRope(g, b.y); }, easeInOut);
}

export {WHITE};
