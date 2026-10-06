// Crecer: potencias, raíces, crecimiento, notación científica, áreas con x, factorizar,
// completar el cuadrado, logaritmo como pregunta inversa y restricciones.

/** b multiplicado por sí mismo n veces; hacia atrás, cada paso divide por b (patrón). */
export function power(b, n) {
  if (!Number.isInteger(n)) throw new Error('exponente entero');
  let r = 1;
  if (n >= 0) for (let i = 0; i < n; i++) r *= b;
  else for (let i = 0; i < -n; i++) r /= b;
  return r;
}

/** Tabla de potencias de b desde el exponente `from` hasta `to`. */
export const powerTable = (b, from, to) => Array.from({length: to - from + 1}, (_, i) => ({n: from + i, v: power(b, from + i)}));

/** El lado de un cuadrado de área a, encerrado con `digits` decimales: lo < √a < hi (o exacto). */
export function sideOf(a, digits = 2) {
  const k = 10 ** digits;
  let lo = 0;
  while ((lo + 1) * (lo + 1) <= a * k * k) lo++;
  const exact = lo * lo === a * k * k;
  return {lo: lo / k, hi: exact ? lo / k : (lo + 1) / k, exact};
}

/** Día por día: sumar `step` o multiplicar por `factor`, desde `start`. */
export function race(start, step, factor, days) {
  const rows = [];
  let a = start, m = start;
  for (let d = 0; d <= days; d++) {
    rows.push({day: d, add: a, mul: m});
    a += step;
    m *= factor;
  }
  return rows;
}

/** Primer día en que multiplicar supera a sumar (estrictamente). */
export const overtakeDay = (start, step, factor, days = 60) => race(start, step, factor, days).find(r => r.day > 0 && r.mul > r.add)?.day ?? null;

/** Notación científica: m · 10^e con 1 ≤ m < 10. */
export function sci(n) {
  if (n === 0) return {m: 0, e: 0};
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = +(n / 10 ** e).toPrecision(12);
  return m >= 10 ? {m: m / 10, e: e + 1} : {m, e};
}

/** (x + a)(x + b) como fichas: x², (a + b) tiras x, a·b cuadraditos. */
export const expand = (a, b) => ({x2: 1, x: a + b, one: a * b});

/** x² + bx + c como rectángulo (x + p)(x + q) con p, q enteros no negativos, si existe. */
export function factor(b, c) {
  for (let p = 0; p <= b; p++) if (p * (b - p) === c) return {p, q: b - p};
  return null;
}

/** Completar el cuadrado de x² + bx = c (b par): (x + b/2)² = c + (b/2)². Devuelve las dos soluciones. */
export function completeSquare(b, c) {
  const h = b / 2, k = c + h * h;
  if (k < 0) return {square: k, roots: []};
  const r = Math.sqrt(k);
  return {square: k, roots: r === 0 ? [-h] : [r - h, -r - h]};
}

/** ¿Cuántas veces hay que multiplicar por b para pasar n? (logaritmo como pregunta inversa) */
export function timesToReach(b, n) {
  let k = 0, v = 1;
  while (v < n) { v *= b; k++; }
  return {k, below: power(b, k - 1), above: v, log: Math.log(n) / Math.log(b)};
}

/** 1 ÷ (x − a): no está definida en x = a. */
export const undefinedAt = a => ({x: a, reason: 'no se divide por cero'});
