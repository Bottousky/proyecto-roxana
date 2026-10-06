// Lo que no se ve: una ecuación son dos miembros que dependen de una x desconocida.
// Resolver es buscar para qué x coinciden. Una transformación se aplica a los dos miembros a la vez;
// si se puede hacer para toda x, no se pierde ninguna solución; si además se puede deshacer, no aparece ninguna.
//
// Los miembros son funciones de x con una descripción; se comparan sobre una muestra de valores
// (enteros y medios de −20 a 20) además de, cuando son lineales, resolverse exactamente.

/** Un miembro lineal a·x + b. */
export const lin = (a, b) => ({a, b, f: x => a * x + b, text: linText(a, b)});

function linText(a, b) {
  const ax = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '−x' : coefX(a);
  if (!ax) return fmt(b);
  if (b === 0) return ax;
  return `${ax} ${b > 0 ? '+' : '−'} ${fmt(Math.abs(b))}`;
}
/** Escribe un número como se escribe en el pizarrón: enteros, o fracciones chicas (7/2), o con coma. */
const fmt = n => {
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(n);
  if (Number.isInteger(a)) return sign + a;
  for (let d = 2; d <= 100; d++) {
    const k = Math.round(a * d);
    if (Math.abs(k / d - a) < 1e-9) return `${sign}${k}/${d}`;
  }
  return sign + String(+a.toFixed(3)).replace('.', ',');
};

/** a·x escrito sin ambigüedad: con fracción, «x/4» o «3x/4» (no «1/4x»). */
function coefX(a) {
  const m = /^(−?)(\d+)\/(\d+)$/.exec(fmt(a));
  return m ? `${m[1]}${m[2] === '1' ? '' : m[2]}x/${m[3]}` : `${fmt(a)}x`;
}

/** Un miembro cualquiera (no lineal): función y texto. */
export const expr = (f, text, opts = {}) => ({f, text, ...opts});

export const eq = (L, R, rel = '=') => ({L, R, rel});

/** Muestra de valores donde se comparan los miembros. */
export const SAMPLE = Array.from({length: 81}, (_, i) => -20 + i * 0.5);

const holds = (rel, l, r) => rel === '=' ? Math.abs(l - r) < 1e-9 : rel === '<' ? l < r - 1e-12 : rel === '>' ? l > r + 1e-12 : rel === '≤' ? l <= r + 1e-12 : l >= r - 1e-12;

/** Valores de la muestra donde la ecuación (o desigualdad) se cumple; excluye donde algo no está definido. */
export function solutions(e, sample = SAMPLE) {
  const out = [];
  for (const x of sample) {
    const l = e.L.f(x), r = e.R.f(x);
    if (!Number.isFinite(l) || !Number.isFinite(r)) continue;
    if (holds(e.rel, l, r)) out.push(x);
  }
  return out;
}

export const sameSolutions = (a, b, sample = SAMPLE) => {
  const sa = solutions(a, sample), sb = solutions(b, sample);
  return sa.length === sb.length && sa.every((x, i) => x === sb[i]);
};

/** Resolver exactamente a·x + b = c·x + d. */
export function solveLinear(e) {
  const a = e.L.a - e.R.a, b = e.R.b - e.L.b;
  if (a === 0) return b === 0 ? {kind: 'all'} : {kind: 'none'};
  return {kind: 'one', x: b / a};
}

// ——— Transformaciones ———

/** Sumar c a los dos miembros (restar es sumar −c). Se deshace sumando −c. */
export function addBoth(e, c) {
  return eq(shift(e.L, c), shift(e.R, c), e.rel);
}

/** Multiplicar los dos miembros por k. Con k = 0 todo se aplasta; con k < 0 una desigualdad se da vuelta… si se la da vuelta. */
export function mulBoth(e, k, {flip = true} = {}) {
  const rel = k < 0 && e.rel !== '=' && flip ? FLIP[e.rel] : e.rel;
  return eq(scaleM(e.L, k), scaleM(e.R, k), rel);
}

/** Dividir los dos miembros por k (k ≠ 0). */
export function divBoth(e, k, opts) {
  if (k === 0) return {defined: false, reason: 'dividir por cero no está definido'};
  return mulBoth(e, 1 / k, opts);
}

/** Aplicar algo a un solo miembro: los marcadores se separan. */
export function addOne(e, side, c) {
  return side === 'L' ? eq(shift(e.L, c), e.R, e.rel) : eq(e.L, shift(e.R, c), e.rel);
}

/** Elevar al cuadrado los dos miembros: −a y a caen juntos. */
export function squareBoth(e) {
  return eq(expr(x => e.L.f(x) ** 2, `(${e.L.text})²`), expr(x => e.R.f(x) ** 2, `(${e.R.text})²`), e.rel);
}

/** Dividir los dos miembros por una expresión que puede valer cero: donde vale cero, no está definido. */
export function divBothByExpr(e, d) {
  const g = x => (d.f(x) === 0 ? NaN : 1 / d.f(x));
  return eq(expr(x => e.L.f(x) * g(x), `(${e.L.text}) ÷ (${d.text})`), expr(x => e.R.f(x) * g(x), `(${e.R.text}) ÷ (${d.text})`), e.rel);
}

/** "Pasa restando" mal hecho: el término cambia de miembro pero conserva el signo. */
export function passWrong(e, c) {
  // a·x + c = R  →  a·x = R + c (debería ser R − c)
  return eq(shift(e.L, -c), shift(e.R, c), e.rel);
}

const FLIP = {'<': '>', '>': '<', '≤': '≥', '≥': '≤'};
const shift = (m, c) => (m.a !== undefined ? lin(m.a, m.b + c) : expr(x => m.f(x) + c, `${m.text} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`));
const scaleM = (m, k) => (m.a !== undefined ? lin(m.a * k, m.b * k) : expr(x => m.f(x) * k, `${fmt(k)}·(${m.text})`));

/** ¿Se puede deshacer? (uno a uno sobre la recta) */
export const reversible = op => !(op.kind === 'mul' && op.k === 0) && op.kind !== 'square' && op.kind !== 'divExpr';
