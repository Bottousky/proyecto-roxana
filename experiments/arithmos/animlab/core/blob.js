// Punto como mancha de tiza viva: un contorno relleno con presión (el diente del pizarrón le da la textura),
// deformable sin perder volumen, y capaz de dividirse con un cuello (dos discos + un puente que se afina).
//
// Simulación determinista y buscable: la trayectoria se integra una vez (240 Hz) y luego se consulta en t.

import {SecondOrder, clamp, lerp} from './motion.js';
import {noise1} from '../../src/engine/rng.js';
import {pressureStyle} from '../../src/engine/chalk.js';

/** Integra un seguidor de segundo orden sobre un objetivo x(t) (función) entre 0 y T; devuelve muestras. */
export function simulate(target, T, {f = 2, z = 0.5, r = 0, hz = 240} = {}) {
  const n = Math.ceil(T * hz) + 2, dt = 1 / hz;
  const x0 = target(0);
  const sx = new SecondOrder(x0[0], {f, z, r}), sy = new SecondOrder(x0[1], {f, z, r});
  const X = new Float32Array(n), Y = new Float32Array(n);
  X[0] = x0[0]; Y[0] = x0[1];
  for (let i = 1; i < n; i++) {
    const p = target(i * dt);
    X[i] = sx.step(dt, p[0]);
    Y[i] = sy.step(dt, p[1]);
  }
  return {X, Y, hz, n};
}

/** Posición, velocidad y aceleración interpoladas de una simulación en t. */
export function sampleSim(sim, t) {
  const f = clamp(t * sim.hz, 0, sim.n - 3);
  const i = Math.floor(f), k = f - i;
  const at = j => [lerp(sim.X[j], sim.X[j + 1], k), lerp(sim.Y[j], sim.Y[j + 1], k)];
  const p0 = at(Math.max(0, i - 1)), p1 = at(i), p2 = at(i + 1);
  const h = 1 / sim.hz;
  return {p: p1, v: [(p2[0] - p0[0]) / (2 * h), (p2[1] - p0[1]) / (2 * h)], a: [(p2[0] - 2 * p1[0] + p0[0]) / (h * h), (p2[1] - 2 * p1[1] + p0[1]) / (h * h)]};
}

/**
 * Deformación por movimiento conservando el área: se estira en la dirección de la velocidad
 * y se aplasta contra la dirección del frenado. Devuelve {ang, sl, sw} (largo y ancho relativos, sl·sw = 1).
 */
export function deform(v, a, {stretch = 1 / 2200, squash = 1 / 26000, max = 0.25} = {}) {
  const sp = Math.hypot(v[0], v[1]);
  if (sp < 2 && Math.hypot(a[0], a[1]) < 50) return {ang: 0, sl: 1, sw: 1};
  const ang = sp > 2 ? Math.atan2(v[1], v[0]) : Math.atan2(a[1], a[0]);
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const along = a[0] * ux + a[1] * uy; // < 0 frenando
  const s = clamp(sp * stretch - Math.max(0, -along) * squash + Math.max(0, along) * squash * 0.3, -max * 0.7, max);
  const sl = 1 + s;
  return {ang, sl, sw: 1 / sl};
}

/** Contorno áspero de un disco deformado (lista de puntos), con el "hervor" de la tiza (variante 0..2). */
export function blobOutline(x, y, r, {ang = 0, sl = 1, sw = 1, boil = 0, seed = 1, n = 40} = {}) {
  const nz = noise1(seed * 31 + boil * 977);
  const pts = [];
  const c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.07 * nz(i * 0.9) + 0.03 * nz(i * 3.1 + 40));
    const lx = Math.cos(a) * rr * sl, ly = Math.sin(a) * rr * sw;
    pts.push([x + lx * c - ly * s, y + lx * s + ly * c]);
  }
  return pts;
}

/** Rellena un contorno con presión (composición 'lighten': uniones de piezas sin cuentas).
 *  Con `center` y `radius`, la presión baja hacia el borde (el borde se deshace en el diente en vez de cortarse:
 *  con presión pareja el borde quedaba escalonado y con huecos binarios, R1). */
export function fillPressure(ctx, pts, ch = 0, p = 0.86, center = null, radius = 0) {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighten';
  if (center && radius > 0) {
    const g = ctx.createRadialGradient(center[0], center[1], 0, center[0], center[1], radius);
    g.addColorStop(0, pressureStyle(ch, p * 1.08));
    g.addColorStop(0.55, pressureStyle(ch, p));
    g.addColorStop(1, pressureStyle(ch, p * 0.55));
    ctx.fillStyle = g;
  } else ctx.fillStyle = pressureStyle(ch, p);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = prev;
}

/** Cuello entre dos discos que se separan (división): se afina con la distancia y se corta a ~2.5 r. */
export function neckOutline(a, b, r) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const d = Math.hypot(dx, dy);
  if (d < 1e-3 || d > r * 2.5) return null;
  const k = clamp((d - r * 0.6) / (r * 1.9)); // 0 = una sola mancha, 1 = a punto de cortarse
  const ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
  const top = [], bot = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const w = r * (1 - (1 - 0.08) * k * Math.sin(Math.PI * u) ** 0.8);
    const px = a[0] + dx * u, py = a[1] + dy * u;
    top.push([px + nx * w, py + ny * w]);
    bot.push([px - nx * w, py - ny * w]);
  }
  return [...top, ...bot.reverse()];
}
