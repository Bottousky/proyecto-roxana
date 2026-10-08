// TEST 08 — cámara sobre un pizarrón enorme (6000 × 2400).
// ?mode=A: cámara actual (Camera.go: ease-in-out cúbico de 1.6 s, zoom logarítmico, centro lineal; temblor senoidal).
// ?mode=B: camera2.js (camino de van Wijk–Nuij, duración por costo perceptual, llega antes de la acción, trauma).
// Mismos planos y mismo contenido; las sondas calculan ambos modos para compararlos en un gráfico.

import {depositStroke, drawDeposit} from '../core/deposit.js';
import {glyphGuides, GLYPHS} from '../core/glyphs.js';
import {circleGuide} from '../core/gesture.js';
import {cameraTrack, traumaShake} from '../core/camera2.js';
import {easeInOut, lerp as lerp0} from '../../src/engine/rng.js';
import {clamp} from '../core/motion.js';

const SHOTS = [
  {t: 0, cx: 3000, cy: 1200, w: 6000},           // plano general
  {t: 1.0, cx: 1500, cy: 1050, w: 1300},          // a la ecuación
  {t: 4.2, cx: 4380, cy: 1300, w: 1300},          // a la gráfica (lejos: conviene alejarse para cruzar)
  {t: 7.0, cx: 4560, cy: 1220, w: 1500, arrive: 7.0},   // reencuadre: llega antes de que se dibuje el círculo
  {t: 9.6, cx: 3000, cy: 1200, w: 6000},          // se aleja para relacionar
];
const DRAW_CIRCLE = 7.0, IMPACT = 12.4, D = 14.5;
let content = [], circle, track;

function build() {
  const S = (g, seed, o = {}) => depositStroke(g, {w: 8, p: 0.88, seed, ...o});
  // región 1: recta y ecuación
  content.push(S([[900, 1150], [2100, 1152]], 1));
  for (let i = 0; i <= 10; i++) { const x = 950 + i * 110; content.push(S([[x, 1135], [x + 1, 1165]], 10 + i, {w: 6})); for (const g of glyphGuides(String(i % 10), x - 12, 1225, 40, {seed: 30 + i})) content.push(S(g, 40 + i, {w: 5})); }
  let x = 1180;
  for (const ch of ['x', '+', '4', '=', '9']) { for (const g of glyphGuides(ch, x, 950, 110, {seed: 70 + x})) content.push(S(g, x, {w: 11, down: 0.14})); x += (GLYPHS[ch].adv + 0.4) * 110; }
  // región 2: ejes y una recta
  content.push(S([[3800, 1650], [5000, 1650]], 101), S([[3850, 1700], [3850, 900]], 102));
  for (let i = 1; i <= 9; i++) { content.push(S([[3850 + i * 120, 1638], [3850 + i * 120, 1662]], 110 + i, {w: 5})); content.push(S([[3838, 1650 - i * 80], [3862, 1650 - i * 80]], 130 + i, {w: 5})); }
  content.push(S([[3850, 1570], [4930, 1010]], 150, {w: 9}));
  // la marca de lo que pasa después: un círculo sobre un punto de la recta
  circle = S(circleGuide(4810, 1072, 58, {seed: 4}), 160, {w: 9, ch: 1, motion: {speed: 520}});
  // decoración lejana (para que el plano general tenga escala)
  content.push(S(circleGuide(300, 400, 120, {seed: 9}), 170), S([[5500, 300], [5900, 700]], 171), S([[2700, 2100], [3300, 2140]], 172));
}

/** Cámara A: el comportamiento de Camera.go con cada plano, sin "llegar antes". */
function camA(t) {
  let cur = SHOTS[0];
  let r = [cur.cx, cur.cy, cur.w];
  for (let i = 1; i < SHOTS.length; i++) {
    const s = SHOTS[i], prev = r;
    if (t < s.t) break;
    const k = easeInOut(clamp((t - s.t) / 1.6));
    const from = (() => { // dónde estaba la cámara al salir (el plano anterior ya alcanzado)
      const p = SHOTS[i - 1]; return [p.cx, p.cy, p.w];
    })();
    r = [lerp0(from[0], s.cx, k), lerp0(from[1], s.cy, k), Math.exp(lerp0(Math.log(from[2]), Math.log(s.w), k))];
  }
  return r;
}
function shakeA(t, w) {
  const sh = Math.max(0, 0.6 - Math.max(0, t - IMPACT) * 2.5) * (t >= IMPACT ? 1 : 0);
  return [Math.sin(t * 61) * sh * 6 * w / 1600, Math.cos(t * 53) * sh * 4 * w / 1600];
}

export default {
  title: 'cámara · A Camera.go 1.6 s · B van Wijk–Nuij + llegar antes + trauma',
  duration: D,
  setup(lab) {
    this.mode = lab.params.get('mode') || 'B';
    build();
    track = cameraTrack(SHOTS);
  },
  camera(t) {
    const [cx, cy, w] = this.mode === 'A' ? camA(t) : track.at(t);
    const [sx, sy] = this.mode === 'A' ? shakeA(t, w) : traumaShake([{t: IMPACT, amount: 0.75}], t, w);
    const h = w * 9 / 16;
    return {x: cx - w / 2 + sx, y: cy - h / 2 + sy, w, h};
  },
  render(lab, t, ctx) {
    for (const s of content) drawDeposit(ctx, s);
    drawDeposit(ctx, circle, t - DRAW_CIRCLE);
  },
  probe(lab, t) {
    const dt = 1 / 120;
    const f = (cam, tt) => cam(tt);
    const out = {};
    for (const [k, cam] of [['A', camA], ['B', tt => track.at(tt)]]) {
      const p0 = f(cam, t), p1 = f(cam, t + dt);
      // velocidad en pantallas por segundo (desplazamiento relativo al ancho visible) y tasa de zoom (log2 por segundo)
      const pan = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / p0[2] / dt;
      const zoom = Math.abs(Math.log2(p1[2] / p0[2])) / dt;
      out[k] = {cx: p0[0], w: p0[2], pan, zoom};
    }
    return out;
  },
  metrics() {
    const peak = k => { let pan = 0, zoom = 0; for (let t = 0; t < D; t += 1 / 120) { const p = this.probe(null, t)[k]; pan = Math.max(pan, p.pan); zoom = Math.max(zoom, p.zoom); } return {panPeak: +pan.toFixed(2), zoomPeak: +zoom.toFixed(2)}; };
    return {A: peak('A'), B: peak('B'), legs: track.legs.map(l => ({start: +l.start.toFixed(2), T: +l.T.toFixed(2), S: +l.path.S.toFixed(2)}))};
  },
};
