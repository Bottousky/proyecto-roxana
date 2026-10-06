// Lo que pasa a veces: frecuencias, resúmenes de datos, conteo y probabilidad.

import {mulberry32} from '../engine/rng.js';

/** Baldes: cada uno sube lleno con probabilidad p (sorteo con semilla fija, para que sea reproducible). */
export function pulls(n, p = 2 / 3, seed = 7) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < n; i++) out.push(rnd() < p);
  return out;
}

/** Proporción de llenos en los primeros k. */
export const shareFull = (xs, k = xs.length) => xs.slice(0, k).filter(Boolean).length / k;

export const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const range = xs => Math.max(...xs) - Math.min(...xs);

/** Cuántas maneras de elegir una cosa de cada grupo. */
export const outfits = (...sizes) => sizes.reduce((a, b) => a * b, 1);

/** Dos dados: cuántos de los 36 pares dan cada suma. */
export function diceSums() {
  const c = {};
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) c[a + b] = (c[a + b] || 0) + 1;
  return c;
}

/** Tirar dos dados n veces (semilla fija). */
export function rollTwo(n, seed = 11) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rnd() * 6) + 1 + Math.floor(rnd() * 6));
  return out;
}
