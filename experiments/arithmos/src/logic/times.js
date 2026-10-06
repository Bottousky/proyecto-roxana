// Multiplicar y dividir con significado: grupos, rectángulos, escala, reparto y medida.

/** n grupos de k (k puede ser negativo: k deudas por grupo). */
export function groups(n, k) {
  return {groups: n, each: k, total: n * k};
}

/** Un rectángulo de f filas y c columnas; girarlo cambia filas por columnas, no el total. */
export function rectangle(f, c) {
  return {rows: f, cols: c, total: f * c, turned: {rows: c, cols: f, total: c * f}};
}

/** Estirar la recta desde el cero por un factor: cada punto se aleja (o se refleja). */
export const scale = (x, factor) => x * factor;

/** Repartir de a uno, por vueltas, entre `among` partes. Devuelve cuánto toca y lo que sobra. */
export function share(total, among) {
  if (among === 0) return {defined: false, reason: 'entre nadie no se puede empezar a repartir'};
  if (!Number.isInteger(total) || !Number.isInteger(among) || total < 0 || among < 0) throw new Error('reparto de enteros no negativos');
  let rounds = 0, left = total;
  while (left >= among) { left -= among; rounds++; }
  return {defined: true, each: rounds, rest: left};
}

/** Medir: cuántas bolsas de `size` se llenan con `total`, y qué queda. */
export function measure(total, size) {
  if (size === 0) return {defined: false, reason: 'una bolsa de cero no se llena nunca'};
  let bags = 0, left = total;
  while (left >= size) { left -= size; bags++; }
  return {defined: true, bags, rest: left};
}

/** Distributiva: partir un rectángulo de f × (a + b) en dos. */
export function split(f, a, b) {
  return {whole: f * (a + b), parts: [f * a, f * b], sum: f * a + f * b};
}
