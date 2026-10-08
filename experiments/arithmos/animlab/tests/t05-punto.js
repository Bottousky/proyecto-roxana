// TEST 05 — Punto: aparecer, moverse, detenerse, anticipar, reaccionar, duplicarse, volverse algo más complejo.
// Fila A: el Punto actual (Dot de world.js con zip/hop de acting.js: ease-in-out y salto senoidal; aparece por fundido).
// Fila B: mancha de tiza viva (blob.js): se dibuja en espiral, sigue objetivos con un sistema de segundo orden
//   (anticipa con r < 0, sobrepasa y se asienta), se deforma conservando el área, salta con agachada y aterrizaje,
//   se divide con un cuello; 1 → 2 → 4 → 8 puntos en fila y una línea de tiza los atraviesa: la recta está hecha de puntos.

import {Dot, Drawing} from '../../src/engine/world.js';
import {stroke, drawStrokes, YELLOW} from '../../src/engine/chalk.js';
import {easeInOut, lerp as lerp0} from '../../src/engine/rng.js';
import {simulate, sampleSim, deform, blobOutline, fillPressure, neckOutline} from '../core/blob.js';
import {depositStroke, drawDeposit} from '../core/deposit.js';
import {minJerk, clamp, lerp} from '../core/motion.js';

const YA = 250, YB = 640, R = 14;
const BODY = 0.72; // presión del relleno: deja ver el diente (0.86 parecía papel recortado, E05 t05b)
const X0 = 260, X1 = 760;
// beats (s)
const B = {appear: 0.4, move: 1.6, mark: 3.4, react: 3.4 + 0.2 + 0.12, split1: 5.3, split2: 6.6, split3: 7.5, line: 8.9, end: 11.2};
const ROW = 525, SP = 75, C0 = 800 - ROW / 2 + SP * 3.5; // centro de la fila de 8
const leafX = i => C0 - SP * 3.5 + i * SP; // posición final de la hoja i (0..7)

/** Objetivo (antes de saltos) del punto-hoja i en el tiempo t, para la fila y. */
function target(i, t, y) {
  if (t < B.move) return [X0, y];
  if (t < B.split1) return [X1, y];
  // centro de cada nivel: promedio de las posiciones finales de sus descendientes
  // cada división: primero se estira y se estrangula despacio (las hermanas se separan ~1 radio en 0.45 s),
  // después se sueltan hacia su lugar (el resorte hace el resto)
  const center = level => {
    if (level === 0) return X1;
    const size = 8 >> level, g = Math.floor(i / size);
    let cx = 0;
    for (let j = g * size; j < (g + 1) * size; j++) cx += leafX(j);
    return cx / size;
  };
  const starts = [B.split1, B.split2, B.split3];
  let level = 0;
  while (level < 3 && t >= starts[level]) level++;
  const ts = starts[level - 1], prev = center(level - 1), next = center(level);
  const PINCH = 0.45;
  if (t - ts < PINCH) {
    const k = minJerk((t - ts) / PINCH);
    return [prev + Math.sign(next - prev) * R * 0.95 * k, y];
  }
  return [next, y];
}

/** Salto de sorpresa (local): agacharse, despegar, volar, aterrizar, asentarse. Devuelve desplazamiento vertical y estiramiento vertical. */
function jump(tl) {
  if (tl < 0) return {dy: 0, sy: 1};
  const crouch = 0.1, launch = 0.06, flight = 0.42, land = 0.32;
  if (tl < crouch) { const k = minJerk(tl / crouch); return {dy: R * 0.3 * k, sy: 1 - 0.3 * k}; }
  if (tl < crouch + launch) { const k = (tl - crouch) / launch; return {dy: R * 0.3 * (1 - k), sy: lerp(0.7, 1.32, k)}; }
  const tf = tl - crouch - launch;
  if (tf < flight) { const u = tf / flight; return {dy: -4 * 70 * u * (1 - u), sy: u < 0.5 ? lerp(1.32, 1, u * 2) : lerp(1, 1.18, (u - 0.5) * 2)}; }
  const tland = tf - flight;
  if (tland < land) { const k = tland / land; return {dy: R * 0.32 * Math.exp(-k * 5) * Math.cos(k * 9), sy: 1 - 0.34 * Math.exp(-k * 4.5) * Math.cos(k * 10)}; }
  return {dy: 0, sy: 1};
}

let sims = [], spiral, mark, line, lineA, markA;

export default {
  title: 'Punto · A actual (ease, seno, fundido) · B segundo orden, volumen, división',
  duration: B.end,
  setup() {
    // B: una simulación por hoja; todas iguales hasta que las divisiones las separan
    sims = Array.from({length: 8}, (_, i) => simulate(t => target(i, t, YB), B.end + 0.5, {f: 1.7, z: 0.66, r: -0.45}));
    // la espiral con que se dibuja (de adentro hacia afuera)
    const g = [];
    for (let k = 0; k <= 40; k++) { const u = k / 40, a = u * 2.4 * Math.PI * 2; const rr = R * (0.1 + 0.85 * u); g.push([X0 + Math.cos(a) * rr, YB + Math.sin(a) * rr]); }
    spiral = depositStroke(g, {w: 7, p: 0.95, seed: 3, motion: {speed: 420, accel: 6000, k0: 1 / 10}});
    mark = [depositStroke([[930, YB - 120], [924, YB - 72]], {w: 7, ch: YELLOW, seed: 4, motion: {speed: 700}}), depositStroke([[922, YB - 56], [921, YB - 52]], {w: 8, ch: YELLOW, seed: 5, motion: {speed: 200}})];
    line = depositStroke([[leafX(0) - 30, YB + 1], [leafX(7) + 30, YB - 1]], {w: 7, p: 0.9, seed: 6, motion: {speed: 700, accel: 5000}});
    lineA = new Drawing('lineA', [stroke([[leafX(0) - 30, YA + 1], [leafX(7) + 30, YA - 1]], {seed: 6})], {progress: 0});
    markA = new Drawing('markA', [stroke([[930, YA - 120], [924, YA - 72]], {seed: 4, ch: YELLOW}), stroke([[922, YA - 56], [921, YA - 52]], {seed: 5, ch: YELLOW, w: 4})], {progress: 0});
  },
  render(lab, t, ctx) {
    renderA(ctx, t);
    renderB(ctx, t);
    lab.tag('A', 'A · Punto actual', 40, YA - 60);
    lab.tag('B', 'B · segundo orden + volumen', 40, YB - 60);
  },
  probe(lab, t) {
    const s = sampleSim(sims[0], t);
    const j = jump(t - B.react);
    const a = stateA(t);
    return {B: {x: s.p[0], h: YB - (s.p[1] + j.dy), vx: s.v[0]}, A: {x: a.x, h: YA - a.y}};
  },
};

// ——— B ———
function renderB(ctx, t) {
  if (t < B.appear) return;
  const ta = t - B.appear;
  // aparecer: la espiral se dibuja; el relleno "se carga" mientras la espiral se cierra
  if (ta < spiral.T + 0.05) drawDeposit(ctx, spiral, ta);
  const fill = clamp((ta - spiral.T * 0.5) / (spiral.T * 0.6));
  if (fill <= 0) return;
  const boil = Math.floor(t * 8) % 3;
  const j = jump(t - B.react);
  // respiración en reposo: ±3 % a 0.5 Hz (vivo, sin moverse)
  const breathe = 1 + 0.03 * Math.sin(t * Math.PI);
  const pos = sims.map(s => sampleSim(s, t));
  // marca de sorpresa
  for (const [k, m] of mark.entries()) drawDeposit(ctx, m, t - B.mark - k * 0.16);
  // la línea atraviesa la fila; cada punto se funde en ella cuando la tiza pasa
  const tl = t - B.line;
  if (tl > 0) drawDeposit(ctx, line, tl);
  // instante en que la punta de la línea pasa por x (según el plan de la mano, no lineal)
  const passT = x => { const P = line.path; let i = 0; while (i < P.n - 1 && P.x[i] < x) i++; return line.plan.t[i]; };
  const drawn = new Set();
  pos.forEach((s, i) => {
    const key = `${Math.round(s.p[0] * 2)},${Math.round(s.p[1] * 2)}`;
    if (drawn.has(key)) return; // hojas aún juntas: una sola mancha
    drawn.add(key);
    const d = deform(s.v, s.a);
    let r = R * breathe;
    // fusión con la línea: al pasar la tiza, el punto se achica hasta el ancho del trazo (con un pequeño rebote)
    const since = tl - passT(s.p[0]);
    if (since > 0) { const k = clamp(since / 0.3); r *= lerp(1, 0.2, minJerk(k)); }
    let {ang, sl, sw} = d;
    let y = s.p[1];
    if (Math.abs(j.sy - 1) > 0.005 || j.dy) { ang = Math.PI / 2; sl = j.sy; sw = 1 / j.sy; y += j.dy; }
    fillPressure(ctx, blobOutline(s.p[0], y, r, {ang, sl, sw, boil, seed: i + 1}), 0, BODY * fill, [s.p[0], y], r * Math.max(sl, sw) * 1.08);
  });
  // cuellos entre hermanas que se están separando
  for (const size of [4, 2, 1]) {
    for (let g = 0; g < 8; g += size * 2) {
      const a = pos[g].p, b = pos[g + size].p;
      // el cuello no puede ser más ancho que la mancha deformada (si no, asoma en puntas: E05 t05c crop-1)
      const sw = Math.min(deform(pos[g].v, pos[g].a).sw, deform(pos[g + size].v, pos[g + size].a).sw);
      const n = neckOutline(a, b, R * breathe * sw * 0.96);
      if (n) fillPressure(ctx, n, 0, BODY);
    }
  }
}

// ——— A: comportamiento actual ———
function pathA(t) {
  // zip (ease-in-out, 0.32 s) como acting.js; hop senoidal; duplicar = aparecer por fundido y zip
  let x = X0, y = YA, lift = 0;
  if (t >= B.move) x = lerp0(X0, X1, easeInOut(clamp((t - B.move) / 0.32)));
  if (t >= B.react && t < B.react + 0.4) { const k = (t - B.react) / 0.4; lift = Math.sin(k * Math.PI) * 40; }
  return {x, y, lift};
}
function leavesA(t) {
  const out = [];
  for (let i = 0; i < 8; i++) {
    let x = pathA(t).x;
    for (const [ts, level] of [[B.split1, 1], [B.split2, 2], [B.split3, 3]]) {
      if (t < ts) break;
      const k = easeInOut(clamp((t - ts) / 0.32));
      const prev = x;
      const size = 8 >> level, g = Math.floor(i / size);
      let cx = 0; for (let j = g * size; j < (g + 1) * size; j++) cx += leafX(j); cx /= size;
      x = lerp0(prev, cx, k);
    }
    out.push(x);
  }
  return out;
}
function stateA(t) { const p = pathA(t); return {x: p.x, y: p.y - p.lift}; }
function renderA(ctx, t) {
  if (t < B.appear) return;
  // un Dot real del motor, actualizado cuadro a cuadro desde 0 (su deformación depende de la historia)
  const dots = Array.from({length: 8}, (_, i) => new Dot(`a${i}`, X0, YA, {r: R * 0.62}));
  for (let tt = B.appear; tt <= t + 1e-6; tt += 1 / 60) {
    const xs = leavesA(tt), p = pathA(tt);
    dots.forEach((d, i) => { d.x = xs[i]; d.y = YA; d.lift = p.lift; d.update(1 / 60, {calm: 1}); });
  }
  const frame = Math.floor(t * 8);
  const fadeIn = clamp((t - B.appear) / 0.4);
  const lineK = clamp((t - B.line) / 0.9);
  const shown = t < B.split1 ? 1 : t < B.split2 ? 2 : t < B.split3 ? 4 : 8;
  dots.forEach((d, i) => {
    const size = 8 / shown;
    if (i % size) return;
    d.fade = (i === 0 ? fadeIn : clamp((t - bornA(i)) / 0.3)) * (1 - lineK);
    d.render(ctx, null, frame);
  });
  markA.progress = clamp((t - B.mark) / 0.3);
  if (markA.progress > 0) markA.render(ctx, null, frame);
  lineA.progress = lineK;
  if (lineK > 0) lineA.render(ctx, null, frame);
}
function bornA(i) { return i % 4 === 0 ? B.split1 : i % 2 === 0 ? B.split2 : B.split3; }
