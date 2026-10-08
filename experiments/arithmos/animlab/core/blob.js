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

/**
 * Contorno orgánico de un grupo de puntos: el borde de la unión de discos (radio r) alrededor de cada punto y de
 * cápsulas (semiancho w) sobre las aristas de su árbol de recubrimiento mínimo. A diferencia de la envolvente convexa,
 * abraza sólo a su grupo aunque los grupos se entremezclen en el espacio (R6: contar salteado).
 * Se extrae con marching squares (paso `step`) y se suaviza (Chaikin). Devuelve una polilínea cerrada.
 */
export function groupContour(pts, {r = 24, w = 11, step = 3} = {}) {
  // árbol de recubrimiento mínimo (Prim)
  const edges = [], inT = [0];
  while (inT.length < pts.length) {
    let best = null;
    for (const i of inT) for (let j = 0; j < pts.length; j++) {
      if (inT.includes(j)) continue;
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (!best || d < best.d) best = {i, j, d};
    }
    edges.push([pts[best.i], pts[best.j]]);
    inT.push(best.j);
  }
  const segDist = (p, a, b) => {
    const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1;
    const u = clamp(((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2);
    return Math.hypot(p[0] - a[0] - vx * u, p[1] - a[1] - vy * u);
  };
  const f = (x, y) => {
    let v = -Infinity;
    for (const c of pts) v = Math.max(v, r - Math.hypot(x - c[0], y - c[1]));
    for (const [a, b] of edges) v = Math.max(v, w - segDist([x, y], a, b));
    return v;
  };
  const x0 = Math.min(...pts.map(p => p[0])) - r - 2 * step, y0 = Math.min(...pts.map(p => p[1])) - r - 2 * step;
  const x1 = Math.max(...pts.map(p => p[0])) + r + 2 * step, y1 = Math.max(...pts.map(p => p[1])) + r + 2 * step;
  const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step);
  const F = new Float32Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) F[j * (nx + 1) + i] = f(x0 + i * step, y0 + j * step);
  const V = (i, j) => F[j * (nx + 1) + i];
  // marching squares: segmentos entre aristas de celda (interpolación lineal sobre el nivel 0)
  const segs = [];
  const P = (i, j, i2, j2) => { const a = V(i, j), b = V(i2, j2), t = a / (a - b); return [x0 + (i + (i2 - i) * t) * step, y0 + (j + (j2 - j) * t) * step]; };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = (V(i, j) > 0 ? 8 : 0) | (V(i + 1, j) > 0 ? 4 : 0) | (V(i + 1, j + 1) > 0 ? 2 : 0) | (V(i, j + 1) > 0 ? 1 : 0);
    if (c === 0 || c === 15) continue;
    const T = () => P(i, j, i + 1, j), R = () => P(i + 1, j, i + 1, j + 1), B = () => P(i, j + 1, i + 1, j + 1), L = () => P(i, j, i, j + 1);
    const table = {1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[T, R]], 5: [[L, T], [B, R]], 6: [[T, B]], 7: [[L, T]], 8: [[L, T]], 9: [[T, B]], 10: [[T, R], [L, B]], 11: [[T, R]], 12: [[L, R]], 13: [[B, R]], 14: [[L, B]]};
    for (const [a, b] of table[c]) segs.push([a(), b()]);
  }
  // encadenar segmentos en el lazo más largo
  const key = p => `${Math.round(p[0] * 10)},${Math.round(p[1] * 10)}`;
  const adj = new Map();
  for (const [a, b] of segs) { for (const [p, q] of [[a, b], [b, a]]) { const k = key(p); if (!adj.has(k)) adj.set(k, []); adj.get(k).push(q); } }
  const used = new Set(), loops = [];
  for (const [a] of segs) {
    if (used.has(key(a))) continue;
    const loop = [a]; used.add(key(a));
    let cur = a;
    for (;;) {
      const next = (adj.get(key(cur)) || []).find(q => !used.has(key(q)));
      if (!next) break;
      loop.push(next); used.add(key(next)); cur = next;
    }
    loops.push(loop);
  }
  let loop = loops.sort((a, b) => b.length - a.length)[0] || [];
  // suavizado de Chaikin (2 pasadas) y cierre con un leve sobrepaso, arrancando arriba
  for (let k = 0; k < 2; k++) {
    const o = [];
    for (let i = 0; i < loop.length; i++) { const p = loop[i], q = loop[(i + 1) % loop.length]; o.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]); }
    loop = o;
  }
  let top = 0;
  loop.forEach((p, i) => { if (p[1] < loop[top][1]) top = i; });
  loop = [...loop.slice(top), ...loop.slice(0, top)];
  return [...loop, ...loop.slice(0, Math.ceil(loop.length * 0.06))];
}
