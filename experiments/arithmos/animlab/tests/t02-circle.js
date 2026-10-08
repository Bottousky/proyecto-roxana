// TEST 02 — círculo. Seis maneras de dibujar la misma circunferencia con la técnica B (depósito + plan de mano):
//  a lenta · b rápida · c con pausa (la tiza queda apoyada) · d acelerando · e corrección (sale mal, se borra el tramo y se rehace) · f borrado.
// Mide: precisión del radio, cierre, perfil de velocidad, acumulación en el repaso, costo de dibujo.

import {compile, draw, drawDust, hand, circleGuide, depositStroke} from '../core/gesture.js';
import {setDensity} from '../core/deposit.js';

const R = 95;
const CELLS = {
  a: [300, 270, 'a · lenta'], b: [800, 270, 'b · rápida'], c: [1300, 270, 'c · con pausa'],
  d: [300, 660, 'd · acelerando'], e: [800, 660, 'e · corrección'], f: [1300, 660, 'f · borrado'],
};
const T0 = 0.4;
const W = 8;
let G = {};

/** Divide una guía en dos por fracción de puntos. */
const split = (g, u) => { const k = Math.round(g.length * u); return [g.slice(0, k + 1), g.slice(k)]; };

function build() {
  const [ax, ay] = CELLS.a, [bx, by] = CELLS.b, [cx, cy] = CELLS.c, [dx, dy] = CELLS.d, [ex, ey] = CELLS.e, [fx, fy] = CELLS.f;
  const S = (g, seed, motion = {}) => depositStroke(g, {w: W, p: 0.9, seed, motion});
  G.a = compile([{stroke: S(circleGuide(ax, ay, R, {seed: 1}), 1, {speed: 260, accel: 2600})}], {t0: T0});
  G.b = compile([{stroke: S(circleGuide(bx, by, R, {seed: 2}), 2, {speed: 1300, accel: 16000})}], {t0: T0});
  const [c1, c2] = split(circleGuide(cx, cy, R, {seed: 3}), 0.55);
  // la pausa: la mano frena hasta casi detenerse, se queda apoyada, y sigue
  G.c = compile([
    {stroke: S(c1, 3, {speed: 520, v1: 8})},
    {hold: {at: c1.at(-1), dur: 0.55, w: W, rate: 0.85}, lift: false},
    {stroke: S(c2, 4, {speed: 520, v0: 8}), lift: false},
  ], {t0: T0});
  G.d = compile([{stroke: S(circleGuide(dx, dy, R, {seed: 5}), 5, {speed: 900, profile: u => 0.25 + 0.95 * u * u})}], {t0: T0});
  // corrección: el primer círculo sale abultado; se mira, se borra el tramo malo con el costado del puño y se rehace
  // el abultamiento queda en el tramo superior izquierdo (a ~1.3 rad del arranque, recorriendo antihorario)
  const bad = circleGuide(ex, ey, R, {seed: 6, bump: {at: 1.35, width: 0.42, amount: 0.16}});
  const good = circleGuide(ex, ey, R, {seed: 7, from: -Math.PI / 2 + 0.35 - 0.25, sweep: 2.25, wob: 0.01});
  const bulge = Array.from({length: 7}, (_, i) => { const a = -Math.PI / 2 + 0.35 - 0.45 - (i / 6) * 1.8; const rr = R * (i % 2 ? 1.2 : 0.98); return [ex + Math.cos(a) * rr, ey + Math.sin(a) * rr]; });
  G.e = compile([
    {stroke: S(bad, 6)},
    {wait: 0.45},
    {erase: {guide: bulge, w: 40, strength: 0.88, speed: 700}},
    {wait: 0.15},
    {stroke: S(good, 8, {speed: 380})},
  ], {t0: T0});
  // borrado: se dibuja, se espera, y el borrador pasa en zigzag
  const zig = Array.from({length: 9}, (_, i) => [fx - R - 30 + (i / 8) * (2 * R + 60), fy + (i % 2 ? -R - 12 : R + 12)]);
  G.f = compile([
    {stroke: S(circleGuide(fx, fy, R, {seed: 9}), 9)},
    {wait: 0.6},
    {erase: {guide: [[fx - R - 30, fy - R], ...zig], w: 60, strength: 0.82, speed: 1100}},
  ], {t0: T0});
}

export default {
  title: 'círculo · lenta · rápida · pausa · acelerando · corrección · borrado',
  duration: 0,
  setup(lab) {
    if (lab.params.has('density')) setDensity(Number(lab.params.get('density')));
    build();
    this.duration = Math.max(...Object.values(G).map(g => g.end)) + 0.6;
  },
  render(lab, t, ctx) {
    for (const [k, g] of Object.entries(G)) {
      draw(ctx, g, t);
      const [x, y, label] = CELLS[k];
      lab.tag(k, label, x - 60, y + R + 50);
    }
  },
  renderDust(lab, t, ctx) {
    for (const g of Object.values(G)) drawDust(ctx, g, t);
  },
  probe(lab, t) {
    const o = {};
    for (const [k, g] of Object.entries(G)) { const h = hand(g, t); o[k] = h ? {v: h.down ? h.v : 0, x: h.xy?.[0], y: h.xy?.[1], down: h.down, op: h.op} : null; }
    return o;
  },
  metrics(lab) {
    const out = {};
    for (const [k, g] of Object.entries(G)) {
      const st = g.items.find(i => i.kind === 'stroke').st;
      const [cx, cy] = CELLS[k];
      const rs = Array.from(st.path.x, (x, i) => Math.hypot(x - cx, st.path.y[i] - cy));
      const mean = rs.reduce((a, b) => a + b, 0) / rs.length;
      const dev = Math.max(...rs.map(r => Math.abs(r - R))) / R;
      const p0 = [st.path.x[0], st.path.y[0]];
      out[k] = {dur: +(g.end - g.start).toFixed(2), rMean: +mean.toFixed(1), maxDevPct: +(dev * 100).toFixed(1), dabs: g.items.filter(i => i.kind === 'stroke').reduce((a, i) => a + i.st.dabs.length, 0)};
    }
    // costo: 50 círculos completos (300 trazos) en un lienzo aparte
    const c = document.createElement('canvas'); c.width = 1600; c.height = 900;
    const x = c.getContext('2d');
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) for (const g of Object.values(G)) draw(x, g, 1e9);
    out.cost = {ms300: +(performance.now() - t0).toFixed(1)};
    // carga del repaso: presión en el tramo corregido vs tramo no tocado (círculo e)
    const [ex, ey] = CELLS.e;
    const ring = a => window.__lab.columns(ex + Math.cos(a) * R - 6, ey + Math.sin(a) * R - 14, 12, 28);
    const peak = c => Math.max(...c.peak);
    out.overlap = {redrawn: +peak(ring(-Math.PI / 2 - 0.9)).toFixed(2), untouched: +peak(ring(Math.PI / 2 + 0.3)).toFixed(2)};
    return out;
  },
};
