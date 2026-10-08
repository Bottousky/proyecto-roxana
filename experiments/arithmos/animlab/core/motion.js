// Movimiento de la mano que sostiene la tiza.
//
// Un trazo no se recorre a velocidad constante: la mano arranca desde el reposo, frena en las curvas
// cerradas y se detiene al final. Tres reglas medibles:
//  1. ley de potencia de dos tercios (Lacquaniti, Terzuolo y Viviani, 1983): v ∝ κ^(-1/3);
//  2. aceleración acotada al arrancar y al frenar: v ≤ √(2·a·s) y v ≤ √(2·a·(L−s));
//  3. la velocidad resultante se suaviza (C¹) para que no haya quiebres de ritmo.
// Entre trazos la mano levanta la tiza y viaja; ese tiempo depende de la distancia (Fitts).
//
// Todo es determinista: el plan se calcula una vez y luego se consulta en cualquier instante t.

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Remuestrea una polilínea a paso fijo de longitud de arco. Devuelve {x, y, s, L}. */
export function resample(guide, step = 1) {
  const xs = [guide[0][0]], ys = [guide[0][1]];
  let carry = 0;
  for (let i = 1; i < guide.length; i++) {
    const [x0, y0] = guide[i - 1], [x1, y1] = guide[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d === 0) continue;
    let t = step - carry;
    while (t <= d) {
      xs.push(x0 + (x1 - x0) * (t / d));
      ys.push(y0 + (y1 - y0) * (t / d));
      t += step;
    }
    carry = d - (t - step);
  }
  const L = guide[guide.length - 1];
  if (Math.hypot(L[0] - xs[xs.length - 1], L[1] - ys[ys.length - 1]) > step * 0.25) { xs.push(L[0]); ys.push(L[1]); }
  if (xs.length === 1) { xs.push(L[0] + 0.01); ys.push(L[1]); }
  const n = xs.length;
  const s = new Float32Array(n);
  for (let i = 1; i < n; i++) s[i] = s[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
  return {x: Float32Array.from(xs), y: Float32Array.from(ys), s, L: s[n - 1], n};
}

/** Curvatura discreta |κ| (1/px) por vértice, medida con una ventana de ±w muestras. */
export function curvature(p, w = 4) {
  const {x, y, n} = p;
  const k = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - w), b = Math.min(n - 1, i + w);
    if (b - a < 2) continue;
    const ax = x[i] - x[a], ay = y[i] - y[a], bx = x[b] - x[i], by = y[b] - y[i];
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    if (la < 1e-6 || lb < 1e-6) continue;
    const cross = ax * by - ay * bx, dot = ax * bx + ay * by;
    const ang = Math.atan2(cross, dot); // giro entre las dos cuerdas
    k[i] = Math.abs(ang) / ((la + lb) / 2);
  }
  return k;
}

/**
 * Plan de velocidad de un trazo.
 * @param p trazo remuestreado (resample)
 * @param o.speed velocidad de crucero en tramo recto (px/s de mundo)
 * @param o.accel aceleración máxima (px/s²)
 * @param o.k0 curvatura de referencia: por debajo, la curva no frena
 * @param o.v0, o.v1 velocidad al tocar y al levantar (la tiza aterriza con algo de inercia)
 * Devuelve {t: Float32Array tiempo acumulado por muestra, v: velocidad por muestra, T: duración}.
 */
export function planStroke(p, {speed = 520, accel = 5200, k0 = 1 / 60, v0 = 30, v1 = 45, beta = 1 / 3} = {}) {
  const {n, s, L} = p;
  const k = curvature(p);
  const v = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const pl = speed * Math.pow((k[i] + k0) / k0, -beta);
    const up = Math.sqrt(v0 * v0 + 2 * accel * s[i]);
    const down = Math.sqrt(v1 * v1 + 2 * accel * (L - s[i]));
    v[i] = Math.min(pl, up, down);
  }
  // suavizado: media móvil sobre ~12 px, que conserva los extremos
  const out = smoothArray(v, 12);
  const t = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const ds = s[i] - s[i - 1];
    t[i] = t[i - 1] + ds / Math.max(1, (out[i] + out[i - 1]) / 2);
  }
  return {t, v: out, T: t[n - 1]};
}

function smoothArray(a, r) {
  const n = a.length, o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let acc = 0, c = 0;
    for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) { acc += a[j]; c++; }
    o[i] = acc / c;
  }
  // los extremos no se suavizan hacia arriba: la mano parte y llega lenta
  o[0] = Math.min(o[0], a[0]);
  o[n - 1] = Math.min(o[n - 1], a[n - 1]);
  return o;
}

/** Índice fraccionario de la muestra alcanzada en el tiempo local tl (búsqueda binaria en el plan). */
export function indexAt(plan, tl) {
  const t = plan.t;
  if (tl <= 0) return 0;
  if (tl >= plan.T) return t.length - 1;
  let lo = 0, hi = t.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t[mid] <= tl) lo = mid; else hi = mid;
  }
  return lo + (tl - t[lo]) / Math.max(1e-6, t[hi] - t[lo]);
}

/** Tiempo de levantar la tiza y viajar `d` px hasta el próximo trazo (Fitts simplificado). */
export function liftTime(d, {base = 0.07, per = 0.00042, w = 6} = {}) {
  return base + per * d + 0.05 * Math.log2(1 + d / w);
}

// ——— Curvas de tiempo para actuación (no para trazos) ———

/** Mínimo jerk (Flash y Hogan, 1985): el perfil de un movimiento voluntario punto a punto. */
export const minJerk = t => { t = clamp(t); return t * t * t * (10 - 15 * t + 6 * t * t); };

/**
 * Sistema de segundo orden (respuesta de un resorte amortiguado a un escalón), en forma cerrada.
 * f: frecuencia natural (Hz), z: amortiguamiento (1 = crítico, <1 = sobrepasa), devuelve x(t) de 0 a 1.
 */
export function springStep(t, f = 2, z = 0.6) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w * t) * (1 + w * t);
}

/** Integrador de segundo orden con respuesta configurable (t3ssel8r): sigue un objetivo con f, ζ y r. */
export class SecondOrder {
  constructor(x0, {f = 2, z = 0.7, r = 0} = {}) {
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / ((2 * Math.PI * f) ** 2);
    this.k3 = (r * z) / (2 * Math.PI * f);
    this.xp = x0; this.y = x0; this.yd = 0;
  }
  step(dt, x, xd = null) {
    if (xd === null) { xd = (x - this.xp) / dt; this.xp = x; }
    const k2 = Math.max(this.k2, 1.1 * (dt * dt / 4 + dt * this.k1 / 2)); // estable con cualquier dt
    this.y += dt * this.yd;
    this.yd += dt * (x + this.k3 * xd - this.y - this.k1 * this.yd) / k2;
    return this.y;
  }
}
