// Depende: relaciones y funciones, reglas de entrada y salida, dominio, imagen y gráficos.

/** Pares [entrada, salida]. ¿A cada entrada le toca una sola salida? Devuelve también las que fallan. */
export function isFunction(pairs) {
  const out = new Map();
  const bad = new Set();
  for (const [a, b] of pairs) {
    if (out.has(a) && out.get(a) !== b) bad.add(a);
    if (!out.has(a)) out.set(a, b);
  }
  return {ok: bad.size === 0, bad: [...bad]};
}

/** Dar vuelta los pares (de la sombra a la hora). */
export const inverse = pairs => pairs.map(([a, b]) => [b, a]);

/** Una máquina: regla con nombre. */
export const RULES = {
  double1: {name: 'el doble más uno', f: x => 2 * x + 1},
  plus3: {name: 'más tres', f: x => x + 3},
  square: {name: 'por sí mismo', f: x => x * x},
  triple: {name: 'el triple', f: x => 3 * x},
};

/** ¿Qué reglas son compatibles con los pares vistos? */
export const rulesMatching = pairs => Object.entries(RULES).filter(([, r]) => pairs.every(([a, b]) => r.f(a) === b)).map(([id]) => id);

/** Para cada x de la grilla, cuántas veces corta una recta parada a un dibujo dado por puntos (x, y) muestreados. */
export function verticalHits(points, xs, tol = 0.26) {
  return xs.map(x => {
    const ys = points.filter(p => Math.abs(p[0] - x) < tol).map(p => p[1]).sort((a, b) => a - b);
    // agrupa alturas cercanas: son el mismo corte
    let hits = 0, last = -Infinity;
    for (const y of ys) { if (y - last > 0.6) hits++; last = y; }
    return {x, hits};
  });
}

/** ¿Es gráfico de una función? (ninguna recta parada lo corta dos veces) */
export const passesVerticalTest = (points, xs) => verticalHits(points, xs).every(h => h.hits <= 1);

/** Dominio de una regla sobre una lista de candidatos: donde da un número. */
export const domainOf = (f, candidates) => candidates.filter(x => Number.isFinite(f(x)));

/** Imagen sobre un dominio (sin repetidos, ordenada). */
export const imageOf = (f, dom) => [...new Set(dom.map(f))].sort((a, b) => a - b);

/** Puntos muestreados de dibujos típicos (para la recta parada). */
export const SHAPES = {
  line: Array.from({length: 61}, (_, i) => { const x = -3 + i * 0.1; return [x, 0.5 * x + 1]; }),
  parabola: Array.from({length: 61}, (_, i) => { const x = -3 + i * 0.1; return [x, (x * x) / 3]; }),
  circle: Array.from({length: 120}, (_, i) => { const t = (i / 120) * Math.PI * 2; return [2 * Math.cos(t), 2 * Math.sin(t)]; }),
  sideways: Array.from({length: 61}, (_, i) => { const y = -3 + i * 0.1; return [(y * y) / 3 - 1.5, y]; }),
};
