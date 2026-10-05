// Correspondencia uno a uno entre dos colecciones.
//
// Comparar dos colecciones no requiere contarlas: alcanza con emparejar.
// - Si algún elemento quedó unido a dos, la correspondencia no es uno a uno (inválida).
// - Si sobran elementos de los dos lados, todavía no se puede concluir (incompleta).
// - Si no sobra nada, tienen la misma cantidad.
// - Si sobran sólo de un lado, ese lado tiene más.

export function evaluatePairs(left, right, links) {
  const countL = new Map(left.map(id => [id, 0]));
  const countR = new Map(right.map(id => [id, 0]));
  for (const [a, b] of links) {
    if (!countL.has(a) || !countR.has(b)) throw new Error(`Unión con elementos desconocidos: ${a}–${b}`);
    countL.set(a, countL.get(a) + 1);
    countR.set(b, countR.get(b) + 1);
  }
  const doubleLeft = left.filter(id => countL.get(id) > 1);
  const doubleRight = right.filter(id => countR.get(id) > 1);
  const freeLeft = left.filter(id => countL.get(id) === 0);
  const freeRight = right.filter(id => countR.get(id) === 0);
  let verdict;
  if (doubleLeft.length || doubleRight.length) verdict = 'invalid';
  else if (freeLeft.length && freeRight.length) verdict = 'incomplete';
  else if (!freeLeft.length && !freeRight.length) verdict = 'equal';
  else if (freeLeft.length) verdict = 'left-more';
  else verdict = 'right-more';
  return {verdict, doubleLeft, doubleRight, freeLeft, freeRight, pairs: links.length};
}

/** Agrega o quita la unión (a, b). Devuelve una lista nueva. */
export function togglePair(links, a, b) {
  const i = links.findIndex(([x, y]) => x === a && y === b);
  if (i >= 0) return links.filter((_, k) => k !== i);
  return [...links, [a, b]];
}

/** Interpretación de la marca sobrante en el capítulo 1. */
export const LEFTOVER_READINGS = {
  missing: 'falta uno de ellos',
  mistake: 'hice una marca de más',
  extra: 'sobra un punto',
};

/**
 * Con un registro hecho uno a uno (cada punto recibió una sola marca),
 * si sobran marcas al emparejar, faltan puntos. "extra" contradice lo observado.
 */
export function readingIsConsistent(reading, verdict) {
  if (verdict !== 'left-more') return false;
  return reading === 'missing';
}
