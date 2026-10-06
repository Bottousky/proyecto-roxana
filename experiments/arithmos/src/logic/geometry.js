// Formas: la diagonal que no es fracción, ángulos, copias, escala, perímetro y área, Pitágoras
// y coordenadas. Todo con enteros o fracciones chicas, como en la pizarra.

/** Para cada q, el p que más se acerca a p · p = 2 · q · q, y cuánto falta o sobra. */
export function nearMisses(maxQ) {
  const out = [];
  for (let q = 1; q <= maxQ; q++) {
    const p = Math.round(q * Math.SQRT2);
    out.push({p, q, pp: p * p, twoQq: 2 * q * q, diff: p * p - 2 * q * q});
  }
  return out;
}

/**
 * Argumento de Tennenbaum: si un cuadrado de lado p tuviera la misma área que dos de lado q,
 * poniendo los dos de q en esquinas opuestas del de p, lo que se pisa (lado 2q − p) tendría la
 * misma área que las dos esquinas libres (lado p − q). Es otro par, más chico.
 */
export const descend = (p, q) => ({p: 2 * q - p, q: p - q});

/** ¿p · p = 2 · q · q? */
export const isDouble = (p, q) => p * p === 2 * q * q;

/** Un rectángulo de perímetro P con lados enteros: todos los que hay, con su área. */
export function rectsWithPerimeter(P) {
  const out = [];
  for (let a = 1; a <= P / 4; a++) {
    const b = P / 2 - a;
    if (Number.isInteger(b) && b >= a) out.push({a, b, area: a * b});
  }
  return out;
}

/** Agrandar k veces: longitudes, áreas y volúmenes. */
export const scale = k => ({length: k, area: k * k, volume: k * k * k});

/** ¿a² + b² = c²? Con su cuenta. */
export const pythag = (a, b, c) => ({left: a * a + b * b, right: c * c, holds: a * a + b * b === c * c});

/** Reacomodo: un cuadrado de lado a + b con cuatro triángulos de catetos a y b adentro. Lo que queda libre. */
export function rearrange(a, b) {
  const big = (a + b) * (a + b);
  const tris = 4 * (a * b / 2);
  return {big, tris, freeA: big - tris, squaresAB: a * a + b * b};
}

/** Suma de los ángulos de un triángulo (en grados) a partir de dos. */
export const thirdAngle = (A, B) => 180 - A - B;

/** Distancia entre dos puntos del plano. Exacta si es entera; si no, su cuadrado. */
export function distance([x1, y1], [x2, y2]) {
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  const r = Math.sqrt(d2);
  return {d2, exact: Number.isInteger(r), d: r};
}

/** Dos figuras: ¿iguales (mismos lados) o parecidas (lados proporcionales)? Lados en el mismo orden. */
export function compareShapes(s1, s2) {
  const k = s2[0] / s1[0];
  const prop = s1.every((v, i) => Math.abs(s2[i] - v * k) < 1e-9);
  return {congruent: prop && Math.abs(k - 1) < 1e-9, similar: prop, k: prop ? k : null};
}
