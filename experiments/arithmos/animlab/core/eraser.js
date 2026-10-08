// Borrador de pizarrón: objeto visible, huella rectangular, neblina proporcional a lo borrado, estrías y polvo que cae.
//
// Física que se imita (verificable en capturas):
//  - la huella es la del fieltro (rectángulo de bordes blandos) orientada como el borrador, no una elipse;
//  - el borrador se inclina con el movimiento (sigue la dirección con retraso) y se aprieta al cambiar de sentido;
//  - lo borrado no desaparece: pasa a la capa de polvo como neblina, corrida en la dirección de la pasada;
//  - la neblina sólo existe donde había tiza (borrar el pizarrón vacío casi no deja nada);
//  - el fieltro deja estrías finas paralelas al movimiento; cae polvo mientras borra (gravedad, se apaga en ~0.6 s).

import {resample, planStroke, indexAt, clamp, lerp, minJerk} from './motion.js';
import {mulberry32} from '../../src/engine/rng.js';
import {stroke, drawStrokes} from '../../src/engine/chalk.js';

export const ERASER = {w: 92, h: 34};

/** Vaivén vertical que avanza hacia la derecha cubriendo la caja [x0, y0, x1, y1]. */
// `over`: el vaivén se pasa de la caja; entre dos giros queda un triángulo sin cubrir y tiene que caer afuera (t07a: quedaba la punta del 7)
export function zigzag([x0, y0, x1, y1], {pitch = 40, over = 38} = {}) {
  const n = Math.max(2, Math.round((x1 - x0) / pitch));
  const g = [];
  for (let i = 0; i <= n; i++) g.push([x0 + (x1 - x0) * (i / n), i % 2 ? y0 - over : y1 + over]);
  return g;
}

/** Plan de una borrada: el borrador frena en cada giro (curvatura alta) como una mano real. */
export function eraserPlan(guide, {speed = 820, strength = 0.94, t0 = 0, enter = 0.35, leave = 0.35} = {}) {
  const smooth = rounded(guide, 16);
  const path = resample(smooth, 1);
  const plan = planStroke(path, {speed, accel: 6000, k0: 1 / 26, beta: 0.45, v0: 40, v1: 40});
  // dirección suavizada (el borrador gira con retraso) y presión (aprieta en los giros)
  const n = path.n, ang = new Float32Array(n), press = new Float32Array(n);
  let a = Math.atan2(path.y[Math.min(5, n - 1)] - path.y[0], path.x[Math.min(5, n - 1)] - path.x[0]);
  for (let i = 0; i < n; i++) {
    const j = Math.min(n - 1, i + 3), k = Math.max(0, i - 3);
    const want = Math.atan2(path.y[j] - path.y[k], path.x[j] - path.x[k]);
    // el borrador se mueve en vaivén: su orientación sigue la dirección "módulo π" y con inercia
    let d = want - a; d = Math.atan2(Math.sin(d * 2), Math.cos(d * 2)) / 2;
    a += d * 0.06;
    ang[i] = a;
    press[i] = 1;
  }
  return {path, plan, ang, strength, t0, enter, leave, T: plan.T, start: t0 + enter, end: t0 + enter + plan.T + leave};
}

/** Redondea las esquinas de una polilínea (los giros del vaivén no son puntas). */
function rounded(g, r) {
  const out = [g[0]];
  for (let i = 1; i < g.length - 1; i++) {
    const [ax, ay] = g[i - 1], [bx, by] = g[i], [cx, cy] = g[i + 1];
    const la = Math.hypot(bx - ax, by - ay), lc = Math.hypot(cx - bx, cy - by);
    const ra = Math.min(r, la / 2), rc = Math.min(r, lc / 2);
    const p = [bx - (bx - ax) / la * ra, by - (by - ay) / la * ra], q = [bx + (cx - bx) / lc * rc, by + (cy - by) / lc * rc];
    for (let k = 0; k <= 6; k++) { const u = k / 6; out.push([(1 - u) * (1 - u) * p[0] + 2 * (1 - u) * u * bx + u * u * q[0], (1 - u) * (1 - u) * p[1] + 2 * (1 - u) * u * by + u * u * q[1]]); }
  }
  out.push(g.at(-1));
  return out;
}

const sprites = new Map();
/** Huella del fieltro: rectángulo de bordes blandos (negro = lleva la presión a 0). */
function footprint(scale) {
  const key = Math.round(scale * 4);
  if (sprites.has(key)) return sprites.get(key);
  const pad = 10, W = Math.ceil((ERASER.w + pad * 2) * scale), H = Math.ceil((ERASER.h + pad * 2) * scale);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.filter = `blur(${3 * scale}px)`;
  x.fillStyle = '#000';
  x.fillRect(pad * scale, pad * scale, ERASER.w * scale, ERASER.h * scale);
  sprites.set(key, c);
  return c;
}

/** Índice del camino alcanzado en t (o −1 si todavía no apoyó). */
export function eraserIndex(er, t) {
  if (t < er.start) return -1;
  return Math.floor(indexAt(er.plan, Math.min(t - er.start, er.T)));
}

/** Aplica la borrada sobre el lienzo de presión (mezcla hacia negro). */
export function applyErase(ctx, er, t, scale = 1) {
  const i1 = eraserIndex(er, t);
  if (i1 < 0) return;
  const step = 2;
  // alpha por estampa: tras ~h/step estampas superpuestas en un punto queda (1 − strength)
  const N = Math.max(1, ERASER.h / step);
  const a = 1 - Math.pow(1 - er.strength, 1 / N);
  const fp = footprint(Math.max(1, scale));
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a;
  for (let i = 0; i <= i1; i += step) {
    const c = Math.cos(er.ang[i]), s = Math.sin(er.ang[i]);
    ctx.save();
    // la huella va con su lado largo perpendicular al movimiento del vaivén
    ctx.transform(-s, c, -c, -s, er.path.x[i], er.path.y[i]);
    ctx.drawImage(fp, -(ERASER.w / 2 + 10), -(ERASER.h / 2 + 10), ERASER.w + 20, ERASER.h + 20);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Neblina y estrías en la capa de polvo. `drawContent(ctx)` dibuja lo que había (en blanco, ancho) para que
 * la neblina sólo aparezca donde había tiza. `tmp` = dos lienzos auxiliares del tamaño de la capa de polvo.
 */
export function eraserDust(dctx, er, t, drawContent, tmp) {
  const i1 = eraserIndex(er, t);
  if (i1 < 0) return;
  const [A, B] = tmp;
  for (const c of tmp) { if (c.width !== dctx.canvas.width || c.height !== dctx.canvas.height) { c.width = dctx.canvas.width; c.height = dctx.canvas.height; } }
  const xa = A.getContext('2d'), xb = B.getContext('2d');
  const T = dctx.getTransform();
  for (const x of [xa, xb]) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, A.width, A.height); x.setTransform(T); }
  // A: lo que había, ensanchado y blando
  xa.filter = 'blur(2px)';
  drawContent(xa);
  xa.filter = 'none';
  // B: dónde pasó el fieltro
  xb.fillStyle = '#fff';
  for (let i = 0; i <= i1; i += 3) {
    const c = Math.cos(er.ang[i]), s = Math.sin(er.ang[i]);
    xb.save();
    xb.transform(-s, c, -c, -s, er.path.x[i], er.path.y[i]);
    xb.fillRect(-ERASER.w / 2, -ERASER.h / 2, ERASER.w, ERASER.h);
    xb.restore();
  }
  // A ∩ B = la tiza que se convirtió en polvo
  xa.save(); xa.setTransform(1, 0, 0, 1, 0, 0); xa.globalCompositeOperation = 'destination-in'; xa.drawImage(B, 0, 0); xa.restore();
  // se corre un poco en la dirección del vaivén (el fieltro arrastra el polvo)
  dctx.save();
  dctx.setTransform(1, 0, 0, 1, 0, 0);
  const sc = T.a;
  for (let k = 0; k < 4; k++) {
    dctx.globalAlpha = 0.085 * (1 - k * 0.15);
    dctx.drawImage(A, 0, (k - 1.5) * 9 * sc);
  }
  dctx.restore();
  // estrías del fieltro: líneas finas paralelas a la pasada, muy tenues, sobre todo el recorrido
  const rnd = mulberry32(17);
  dctx.save();
  dctx.strokeStyle = '#fff';
  dctx.lineCap = 'round';
  for (let l = 0; l < 7; l++) {
    // bandas anchas y muy tenues (líneas finas dibujaban el zigzag como un trazo: t07a)
    const off = (rnd() - 0.5) * ERASER.w * 0.8, w = 5 + rnd() * 9;
    dctx.globalAlpha = 0.01 + rnd() * 0.015;
    dctx.lineWidth = w;
    dctx.beginPath();
    for (let i = 0; i <= i1; i += 4) {
      const c = Math.cos(er.ang[i]), s = Math.sin(er.ang[i]);
      const x = er.path.x[i] + c * off, y = er.path.y[i] + s * off;
      i ? dctx.lineTo(x, y) : dctx.moveTo(x, y);
    }
    dctx.stroke();
  }
  dctx.restore();
}

/** Polvo que cae del borrador (determinista): partículas emitidas a lo largo de la pasada, con gravedad.
 *  Se dibujan en la capa de polvo (no en la de presión: blanco puro ahí encendería los tres canales de tiza). */
export function eraserParticles(ctx, er, t, amountAt) {
  const rnd = mulberry32(99);
  const i1 = eraserIndex(er, t);
  if (i1 < 0) return;
  ctx.save();
  ctx.fillStyle = '#fff';
  for (let i = 0; i <= i1; i += 9) {
    const amt = amountAt(er.path.x[i], er.path.y[i]);
    const r = rnd(), r2 = rnd(), r3 = rnd();
    if (r > amt) continue;
    const born = er.start + er.plan.t[i];
    const age = t - born;
    if (age < 0 || age > 0.7) continue;
    const x = er.path.x[i] + (r2 - 0.5) * ERASER.w * 0.8 + (r3 - 0.5) * 20 * age;
    const y = er.path.y[i] + ERASER.h * 0.3 + 0.5 * 900 * age * age;
    ctx.globalAlpha = 0.5 * (1 - age / 0.7);
    ctx.fillRect(x, y, 2.2, 2.2);
  }
  ctx.restore();
}

/** Posición, ángulo y altura del borrador en t (entra desde arriba, apoya, sale). */
export function eraserPose(er, t) {
  const p0 = [er.path.x[0], er.path.y[0]], pn = [er.path.x[er.path.n - 1], er.path.y[er.path.n - 1]];
  if (t < er.t0) return null;
  if (t < er.start) { const k = minJerk((t - er.t0) / er.enter); return {x: p0[0] + (1 - k) * 40, y: p0[1] - (1 - k) * 120, ang: er.ang[0], lift: 1 - k, press: 0}; }
  if (t <= er.start + er.T) { const i = eraserIndex(er, t); const v = er.plan.v[i]; return {x: er.path.x[i], y: er.path.y[i], ang: er.ang[i], lift: 0, press: clamp(1 - v / 900)}; }
  if (t < er.end) { const k = minJerk((t - er.start - er.T) / er.leave); return {x: pn[0] + k * 50, y: pn[1] - k * 130, ang: er.ang[er.path.n - 1], lift: k, press: 0}; }
  return null;
}

/** El borrador dibujado con tiza (contorno, fieltro rayado, lomo de madera). */
export function drawEraser(ctx, pose, seed = 1) {
  if (!pose) return;
  const {x, y, ang, lift, press} = pose;
  const c = Math.cos(ang), s = Math.sin(ang);
  ctx.save();
  ctx.transform(-s, c, -c, -s, x, y);
  // apoyado se aplasta un poco (fieltro comprimido); en el aire, apenas más chico (más cerca del ojo no: más lejos del pizarrón)
  const sq = 1 - 0.06 * press;
  ctx.scale(1 - 0.04 * lift, sq);
  const w = ERASER.w, h = ERASER.h;
  const rnd = mulberry32(seed);
  const S = (g, k, o = {}) => stroke(g, {w: 2.6, p: 0.85, seed: seed + k, wobble: 0.3, ...o});
  const list = [
    S([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2 + 1, -h / 2 + 1]], 1),
    S([[-w / 2 + 3, -h / 2 + h * 0.38], [w / 2 - 3, -h / 2 + h * 0.38]], 2, {w: 2}),
  ];
  // fieltro: rayado diagonal en la franja inferior
  for (let k = 0; k < 9; k++) {
    const x0 = -w / 2 + 6 + k * (w - 12) / 8;
    list.push(S([[x0, -h / 2 + h * 0.48], [x0 + 6, h / 2 - 3]], 10 + k, {w: 1.6, p: 0.6}));
  }
  drawStrokes(ctx, list, 1, 1 - 0.3 * lift, 1, false);
  ctx.restore();
}
