// Gesto: lo que hace una mano con la tiza, en orden. Operaciones:
//  {stroke}  un trazo de depósito (deposit.js) con su plan de velocidad;
//  {hold}    la mano se detiene sin levantar la tiza: el polvo se sigue acumulando en ese punto;
//  {wait}    la mano se detiene en el aire (pensar, mirar);
//  {erase}   una pasada de borrador (o del costado del puño): quita presión con una forma ancha y deja polvo.
// Entre dos operaciones con contacto, la mano levanta y viaja (motion.liftTime).
// Se dibuja de forma determinista en cualquier t: las operaciones se reproducen en orden temporal,
// así un borrado afecta lo dibujado antes y no lo dibujado después.

import {depositStroke, drawDeposit, depositTip, depositSpeed} from './deposit.js';
import {resample, planStroke, indexAt, liftTime, lerp, clamp, minJerk} from './motion.js';
import {mulberry32} from '../../src/engine/rng.js';

export function compile(ops, {t0 = 0} = {}) {
  const out = [];
  let t = t0, last = null;
  for (const op of ops) {
    const startXY = op.stroke ? [op.stroke.path.x[0], op.stroke.path.y[0]] : op.erase ? op.erase.guide[0] : op.hold ? op.hold.at : null;
    if (startXY && last && op.lift !== false) t += liftTime(Math.hypot(startXY[0] - last[0], startXY[1] - last[1]));
    if (op.stroke) {
      out.push({kind: 'stroke', st: op.stroke, start: t, end: t + op.stroke.T});
      t += op.stroke.T;
      last = [op.stroke.path.x.at(-1), op.stroke.path.y.at(-1)];
    } else if (op.hold) {
      out.push({kind: 'hold', ...op.hold, start: t, end: t + op.hold.dur});
      t += op.hold.dur;
      last = op.hold.at;
    } else if (op.wait != null) {
      out.push({kind: 'wait', start: t, end: t + op.wait});
      t += op.wait;
    } else if (op.erase) {
      const e = eraserPass(op.erase);
      out.push({kind: 'erase', er: e, start: t, end: t + e.T});
      t += e.T;
      last = op.erase.guide.at(-1);
    }
  }
  return {items: out, start: t0, end: t};
}

/** Pasada de borrador: elipse ancha, movimiento de vaivén con mínimo jerk por tramo. */
function eraserPass({guide, w = 46, strength = 0.85, speed = 900}) {
  const path = resample(guide, 1);
  const plan = planStroke(path, {speed, accel: 7000, k0: 1 / 30, beta: 0.5, v0: 60, v1: 60});
  return {path, plan, w, strength, T: plan.T};
}

export function draw(ctx, g, t, fade = 1) {
  for (const it of g.items) {
    if (t < it.start) break;
    const tl = t - it.start;
    if (it.kind === 'stroke') drawDeposit(ctx, it.st, tl, fade);
    else if (it.kind === 'hold') drawHold(ctx, it, Math.min(tl, it.dur), fade);
    else if (it.kind === 'erase') drawErase(ctx, it.er, Math.min(tl, it.er.T));
  }
}

/** Mientras la tiza descansa apoyada, el punto se carga: crece rápido al principio y se satura. */
function drawHold(ctx, h, tl, fade) {
  const amt = (h.rate ?? 0.9) * (1 - Math.exp(-tl / 0.25));
  if (amt <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  const r = (h.w ?? 4) * 0.62 * (1 + 0.3 * Math.min(1, tl / 0.6));
  const grd = ctx.createRadialGradient(h.at[0], h.at[1], 0, h.at[0], h.at[1], r);
  const c = ['255,0,0', '0,255,0', '0,0,255'][h.ch ?? 0];
  grd.addColorStop(0, `rgba(${c},${amt * fade})`);
  grd.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(h.at[0], h.at[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = prev;
}

/** Borrado: lleva la presión hacia 0 (negro = sin tiza) con una mancha ancha y blanda; no llega al 100 %: queda un fantasma.
 *  Ojo: 'destination-out' NO sirve en el lienzo de presión — deja píxeles transparentes y la subida a WebGL
 *  des-premultiplica el color, que reaparece entero (E02, t02a). */
function drawErase(ctx, er, tl) {
  const i1 = Math.floor(indexAt(er.plan, tl));
  if (i1 <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'source-over';
  const {path, w} = er;
  const step = 3;
  // alpha por estampa tal que, tras las ~w/2/step estampas que se superponen en un punto, quede (1 − strength)
  const N = Math.max(1, (w * 0.5) / step);
  const a = 1 - Math.pow(1 - er.strength, 1 / N);
  for (let i = 0; i <= i1; i += step) {
    const grd = ctx.createRadialGradient(path.x[i], path.y[i], 0, path.x[i], path.y[i], w / 2);
    grd.addColorStop(0, `rgba(0,0,0,${a})`);
    grd.addColorStop(0.6, `rgba(0,0,0,${a * 0.8})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(path.x[i], path.y[i], w / 2, w / 3.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = prev;
}

/** Polvo que deja el borrado (capa de polvo del compuesto). */
export function drawDust(ctx, g, t) {
  for (const it of g.items) {
    if (t < it.start || it.kind !== 'erase') continue;
    const er = it.er;
    const i1 = Math.floor(indexAt(er.plan, Math.min(t - it.start, er.T)));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = er.w * 0.9;
    ctx.beginPath();
    for (let i = 0; i <= i1; i += 4) (i ? ctx.lineTo(er.path.x[i], er.path.y[i]) : ctx.moveTo(er.path.x[i], er.path.y[i]));
    ctx.stroke();
    ctx.restore();
  }
}

/** Estado de la mano en t: dónde está la punta, si toca, a qué velocidad. */
export function hand(g, t) {
  let prev = null;
  for (const it of g.items) {
    if (t < it.start) {
      // en el aire, entre prev y it
      if (!prev) return null;
      const a = endXY(prev), b = startXY(it);
      if (!a || !b) return {xy: a || b, down: false, v: 0};
      const k = minJerk((t - prev.end) / Math.max(1e-3, it.start - prev.end));
      return {xy: [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], down: false, v: 0, air: k};
    }
    if (t <= it.end) {
      const tl = t - it.start;
      if (it.kind === 'stroke') return {xy: depositTip(it.st, tl), down: true, v: depositSpeed(it.st, tl), op: 'stroke'};
      if (it.kind === 'hold') return {xy: it.at, down: true, v: 0, op: 'hold'};
      if (it.kind === 'erase') { const i = indexAt(it.er.plan, tl); const j = Math.floor(i); return {xy: [it.er.path.x[j], it.er.path.y[j]], down: true, v: it.er.plan.v[j], op: 'erase'}; }
      return {xy: prev ? endXY(prev) : null, down: false, v: 0, op: 'wait'};
    }
    prev = it;
  }
  return prev ? {xy: endXY(prev), down: false, v: 0} : null;
}

const startXY = it => it.kind === 'stroke' ? [it.st.path.x[0], it.st.path.y[0]] : it.kind === 'hold' ? it.at : it.kind === 'erase' ? [it.er.path.x[0], it.er.path.y[0]] : null;
const endXY = it => it.kind === 'stroke' ? [it.st.path.x.at(-1), it.st.path.y.at(-1)] : it.kind === 'hold' ? it.at : it.kind === 'erase' ? [it.er.path.x.at(-1), it.er.path.y.at(-1)] : null;

// ——— Formas ———

/** Círculo dibujado a mano: arranca arriba a la derecha, antihorario (como lo hace la mayoría de los diestros),
 *  cierra con un leve sobrepaso; `err` deforma (un círculo mal hecho para corregir). */
export function circleGuide(cx, cy, r, {seed = 1, from = -Math.PI / 2 + 0.35, sweep = Math.PI * 2 + 0.28, ccw = true, err = 0, wob = 0.018, bump = null} = {}) {
  const rnd = mulberry32(seed);
  const ph = rnd() * 6, ph2 = rnd() * 6;
  const g = [];
  const n = Math.ceil(r * sweep / 3);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = from + (ccw ? -1 : 1) * sweep * u;
    // al cerrar, la mano entra un poco hacia adentro (el sobrepaso no repite el radio exacto)
    const close = u > 0.9 ? -0.025 * (u - 0.9) / 0.1 : 0;
    const rr = r * (1 + wob * Math.sin(a * 2 + ph) + wob * 0.6 * Math.sin(a * 3 + ph2) + close + err * Math.sin(a * 2 + 0.7) + (bump ? bump.amount * Math.exp(-(((u * sweep) - bump.at) ** 2) / (2 * bump.width ** 2)) : 0));
    g.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return g;
}

export {depositStroke};
