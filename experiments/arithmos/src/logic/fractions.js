// Partes de algo: fracciones como medidas con partes iguales de una unidad.
// Todo en enteros: una fracción es {n, d} con d > 0.

export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

export function frac(n, d) {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error('fracción de enteros');
  if (d === 0) return {defined: false, reason: 'no hay partes de tamaño cero'};
  if (d < 0) { n = -n; d = -d; }
  return {n, d, defined: true};
}

/** El nombre más corto del mismo número. */
export function simplest({n, d}) {
  const k = gcd(n, d) || 1;
  return frac(n / k, d / k);
}

/** Dos nombres del mismo número: se parte todo con la misma partición y se cuentan partes. */
export function equivalent(a, b) {
  return a.n * b.d === b.n * a.d;
}

/** Llevar a una partición común: la más chica que sirve para las dos. */
export function common(a, b) {
  const d = lcm(a.d, b.d);
  return [frac(a.n * d / a.d, d), frac(b.n * d / b.d, d)];
}

/** −1, 0 o 1, contando partes en la partición común. */
export function compare(a, b) {
  const [x, y] = common(a, b);
  return Math.sign(x.n - y.n);
}

/** Sumar pedazos: primero la misma partición, después se cuentan las partes. */
export function add(a, b) {
  const [x, y] = common(a, b);
  return simplest(frac(x.n + y.n, x.d));
}

/** El error de Punto: sumar arriba con arriba y abajo con abajo. */
export const naiveAdd = (a, b) => frac(a.n + b.n, a.d + b.d);

/** Partes iguales: ¿un corte en `at` (de 0 a 1) parte la unidad en dos iguales? */
export const isHalf = (at, tol = 0.02) => Math.abs(at - 0.5) <= tol;

/** Un decimal escrito como lista de cifras: entera y décimos, centésimos… */
export function decimal(text) {
  const [int, dec = ''] = text.split(',');
  const n = Number(int + dec);
  return simplest(frac(n, 10 ** dec.length));
}

/** El p por ciento de una cantidad: p de cada cien. */
export const percentOf = (p, q) => (p * q) / 100;

/** Medir una longitud con partes de 1/d del lado: la mejor aproximación por defecto y su error. */
export function measureWith(length, d) {
  const parts = Math.floor(length * d + 1e-12);
  const lo = parts / d;
  return {parts, d, lo, hi: (parts + 1) / d, exact: Math.abs(lo - length) < 1e-12};
}

/** ¿Hay alguna partición (hasta `maxD`) del lado que mida exactamente la diagonal? n² = 2 d². */
export function diagonalFits(maxD) {
  for (let d = 1; d <= maxD; d++) {
    for (let n = d; n <= 2 * d; n++) if (n * n === 2 * d * d) return {d, n};
  }
  return null;
}
