// Anticipar: familias de funciones, parámetros, lectura de gráficos, composición e inversa,
// tasa de cambio y acumulación.

/** Las reglas del viaje y su familia. */
export const RULES = [
  {id: 'mara', name: 'escalera de Mara', f: x => 1 + 10 * x, family: 'recta'},
  {id: 'punto', name: 'escalera de Punto', f: x => 2 ** x, family: 'despega'},
  {id: 'huerta', name: 'huerta x · x', f: x => x * x, family: 'u'},
  {id: 'rueda', name: 'altura de la rueda', f: x => Math.sin(x), family: 'ola'},
  {id: 'reparto', name: 'reparto 1 ÷ (x − 2)', f: x => 1 / (x - 2), family: 'hueco'},
  {id: 'distancia', name: 'distancia al cero', f: x => Math.abs(x), family: 'v'},
  {id: 'veces', name: '¿cuántas veces?', f: x => Math.log2(x), family: 'aplana'},
];

/** y = a·x + b que pasa por dos puntos. */
export function lineThrough([x1, y1], [x2, y2]) {
  const a = (y2 - y1) / (x2 - x1);
  return {a, b: y1 - a * x1};
}

/** El salto de Punto: altura 6t − t². */
export const jump = t => 6 * t - t * t;

/** Ceros y máximo de a·t² + b·t + c (a < 0). */
export function readParabola(a, b, c) {
  const tv = -b / (2 * a), v = a * tv * tv + b * tv + c;
  const disc = b * b - 4 * a * c;
  const zeros = disc < 0 ? [] : [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)].map(z => z + 0).sort((x, y) => x - y);
  return {zeros, top: [tv, v]};
}

export const compose = (f, g) => x => f(g(x));
export const double1 = x => 2 * x + 1;
export const undoDouble1 = x => (x - 1) / 2;
export const sq = x => x * x;

/** Velocidad media de f entre t y t + h. */
export const avgRate = (f, t, h) => (f(t + h) - f(t)) / h;

/** Suma de rectángulos (por la izquierda) de una tasa r(t) entre 0 y T, con n pedazos. */
export function riemann(r, T, n) {
  const dt = T / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += r(i * dt) * dt;
  return s;
}

/** Tarifa por tramos: hasta 10 escalones, 1 tiza cada uno; después, media por escalón. */
export const tariff = n => (n <= 10 ? n : 10 + (n - 10) / 2);
