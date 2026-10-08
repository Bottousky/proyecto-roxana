// Glifos de un solo trazo para escribir matemática con tiza.
//
// Unidades: 1 = alto de una cifra. Línea de base en y = 0; arriba es negativo (y hacia abajo, como el lienzo).
// Cada glifo es una lista de trazos EN ORDEN DE ESCRITURA (escuela: de arriba hacia abajo, de izquierda a derecha).
// Un trazo es una lista de partes: ['s', puntos] curva suave (Catmull-Rom) o ['l', puntos] polilínea con esquinas.
// Las partes de un trazo se encadenan sin levantar la tiza (el «3» tiene una cúspide en el medio, no un levantón).

import {mulberry32} from '../../src/engine/rng.js';

const arc = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({length: n + 1}, (_, i) => {
  const a = a0 + (a1 - a0) * (i / n);
  return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
});

export const GLYPHS = {
  '0': {adv: 0.6, strokes: [[['s', arc(0.29, -0.5, 0.25, 0.5, -1.3, -1.3 - Math.PI * 2 - 0.22, 30)]]]},
  '1': {adv: 0.46, strokes: [[['l', [[0.07, -0.76], [0.3, -1.0], [0.3, 0.0]]]]]},
  '2': {adv: 0.6, strokes: [[['s', [[0.05, -0.74], [0.13, -0.93], [0.3, -1.0], [0.47, -0.94], [0.53, -0.77], [0.45, -0.55], [0.26, -0.32], [0.04, -0.02]]], ['l', [[0.04, -0.02], [0.57, -0.02]]]]]},
  '3': {adv: 0.6, strokes: [[['s', [[0.06, -0.9], [0.22, -1.0], [0.42, -0.97], [0.51, -0.81], [0.43, -0.63], [0.23, -0.55]]], ['s', [[0.23, -0.55], [0.45, -0.48], [0.55, -0.3], [0.49, -0.1], [0.3, 0.0], [0.12, -0.02], [0.03, -0.11]]]]]},
  '4': {adv: 0.62, strokes: [[['l', [[0.37, -1.0], [0.02, -0.33], [0.6, -0.33]]]], [['l', [[0.45, -0.72], [0.45, 0.02]]]]]},
  '5': {adv: 0.6, strokes: [[['l', [[0.13, -1.0], [0.09, -0.57]]], ['s', [[0.09, -0.57], [0.27, -0.63], [0.46, -0.57], [0.55, -0.37], [0.5, -0.14], [0.33, -0.01], [0.14, -0.02], [0.03, -0.12]]]], [['l', [[0.13, -1.0], [0.53, -1.0]]]]]},
  '6': {adv: 0.6, strokes: [[['s', [[0.49, -0.95], [0.31, -0.99], [0.13, -0.81], [0.05, -0.47], [0.1, -0.13], [0.28, 0.0], [0.46, -0.08], [0.53, -0.3], [0.43, -0.5], [0.24, -0.53], [0.08, -0.39]]]]]},
  '7': {adv: 0.58, strokes: [[['l', [[0.02, -1.0], [0.56, -1.0], [0.21, 0.02]]]]]},
  '8': {adv: 0.6, strokes: [[['s', [[0.47, -0.86], [0.3, -1.0], [0.11, -0.91], [0.1, -0.71], [0.29, -0.56], [0.5, -0.41], [0.55, -0.2], [0.41, -0.02], [0.2, -0.02], [0.05, -0.18], [0.1, -0.38], [0.29, -0.53], [0.46, -0.67], [0.48, -0.86], [0.36, -0.98]]]]]},
  '9': {adv: 0.6, strokes: [[['s', [[0.51, -0.82], [0.37, -1.0], [0.15, -0.96], [0.05, -0.77], [0.14, -0.57], [0.34, -0.53], [0.5, -0.66], [0.52, -0.84]]], ['l', [[0.52, -0.84], [0.43, 0.02]]]]]},
  'x': {adv: 0.52, strokes: [[['s', [[0.03, -0.6], [0.25, -0.31], [0.47, 0.0]]]], [['s', [[0.47, -0.6], [0.24, -0.29], [0.02, 0.0]]]]]},
  'y': {adv: 0.52, strokes: [[['s', [[0.03, -0.6], [0.13, -0.3], [0.25, -0.05]]]], [['s', [[0.48, -0.6], [0.3, -0.12], [0.12, 0.36]]]]]},
  '+': {adv: 0.58, strokes: [[['l', [[0.05, -0.42], [0.53, -0.42]]]], [['l', [[0.29, -0.66], [0.29, -0.18]]]]]},
  '−': {adv: 0.58, strokes: [[['l', [[0.05, -0.42], [0.53, -0.42]]]]]},
  '=': {adv: 0.58, strokes: [[['l', [[0.05, -0.55], [0.53, -0.55]]]], [['l', [[0.05, -0.29], [0.53, -0.29]]]]]},
  '(': {adv: 0.34, strokes: [[['s', [[0.3, -1.06], [0.12, -0.75], [0.07, -0.45], [0.12, -0.12], [0.3, 0.16]]]]]},
  ')': {adv: 0.34, strokes: [[['s', [[0.04, -1.06], [0.22, -0.75], [0.27, -0.45], [0.22, -0.12], [0.04, 0.16]]]]]},
  '/': {adv: 0.5, strokes: [[['l', [[0.45, -1.05], [0.05, 0.16]]]]]},
  '·': {adv: 0.3, strokes: [[['s', arc(0.15, -0.42, 0.035, 0.035, 0, Math.PI * 4, 12)]]]},
  // ——— minúsculas de imprenta escolar (E13): altura x 0.6, ascendentes 0.85–1.0, descendentes 0.35 ———
  // orden y sentido como se enseña: la «a» empieza arriba a la derecha y gira a la izquierda; m/n/u repasan el palo.
  'a': {adv: 0.52, strokes: [[['s', arc(0.24, -0.3, 0.2, 0.3, -0.75, -0.75 - Math.PI * 2 + 0.25, 26)], ['l', [[0.43, -0.52], [0.44, -0.6], [0.45, 0.01]]]]]},
  'e': {adv: 0.5, strokes: [[['l', [[0.05, -0.31], [0.43, -0.31]]], ['s', [[0.43, -0.31], [0.4, -0.5], [0.24, -0.6], [0.08, -0.5], [0.04, -0.28], [0.14, -0.05], [0.31, 0.0], [0.44, -0.09]]]]]},
  'm': {adv: 0.7, strokes: [[['l', [[0.05, -0.6], [0.05, 0.01], [0.05, -0.38]]], ['s', [[0.05, -0.38], [0.14, -0.56], [0.26, -0.6], [0.33, -0.5], [0.34, -0.3], [0.34, 0.01]]], ['l', [[0.34, 0.01], [0.34, -0.38]]], ['s', [[0.34, -0.38], [0.43, -0.56], [0.55, -0.6], [0.62, -0.5], [0.63, -0.3], [0.63, 0.01]]]]]},
  'n': {adv: 0.5, strokes: [[['l', [[0.05, -0.6], [0.05, 0.01], [0.05, -0.38]]], ['s', [[0.05, -0.38], [0.15, -0.56], [0.28, -0.6], [0.38, -0.52], [0.41, -0.3], [0.41, 0.01]]]]]},
  'ñ': {adv: 0.5, strokes: [[['l', [[0.05, -0.6], [0.05, 0.01], [0.05, -0.38]]], ['s', [[0.05, -0.38], [0.15, -0.56], [0.28, -0.6], [0.38, -0.52], [0.41, -0.3], [0.41, 0.01]]]], [['s', [[0.06, -0.74], [0.15, -0.82], [0.27, -0.74], [0.37, -0.8]]]]]},
  'o': {adv: 0.5, strokes: [[['s', arc(0.24, -0.3, 0.2, 0.3, -1.75, -1.75 - Math.PI * 2 - 0.2, 26)]]]},
  'p': {adv: 0.52, strokes: [[['l', [[0.06, -0.6], [0.06, 0.36]]]], [['s', [[0.06, -0.44], [0.17, -0.58], [0.34, -0.59], [0.45, -0.42], [0.44, -0.16], [0.31, -0.01], [0.15, -0.02], [0.06, -0.12]]]]]},
  's': {adv: 0.46, strokes: [[['s', [[0.4, -0.52], [0.28, -0.6], [0.11, -0.56], [0.07, -0.43], [0.2, -0.33], [0.36, -0.25], [0.42, -0.11], [0.31, -0.01], [0.13, -0.01], [0.03, -0.08]]]]]},
  't': {adv: 0.38, strokes: [[['l', [[0.15, -0.86], [0.15, -0.1]]], ['s', [[0.15, -0.1], [0.19, -0.01], [0.33, 0.0]]]], [['l', [[0.02, -0.58], [0.33, -0.58]]]]]},
  'u': {adv: 0.5, strokes: [[['s', [[0.05, -0.6], [0.05, -0.2], [0.11, -0.04], [0.25, 0.0], [0.38, -0.08], [0.42, -0.25]]], ['l', [[0.42, -0.25], [0.42, -0.6], [0.43, 0.01]]]]]},
  ' ': {adv: 0.3, strokes: []},
};

/** Espacio a cada lado: los operadores respiran más que las cifras de un número. */
export const sideGap = ch => ('+−=·'.includes(ch) ? 0.26 : /[a-zñ]/.test(ch) ? 0.035 : 0.1);

function catmull(points, steps = 8) {
  if (points.length < 3) return points;
  const g = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      g.push([0, 1].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  g.push(points[points.length - 1]);
  return g;
}

/**
 * Guías de mundo de un glifo escrito a mano en (x, y) = esquina izquierda sobre la línea de base, alto `size`.
 * Variación de mano: inclinación, escala y línea de base levemente distintas en cada instancia (semilla).
 */
export function glyphGuides(ch, x, y, size, {seed = 1, slant = 0.08, vary = 1} = {}) {
  const gl = GLYPHS[ch];
  if (!gl) throw new Error(`Sin glifo para «${ch}»`);
  const rnd = mulberry32(seed);
  const sx = size * (1 + (rnd() - 0.5) * 0.06 * vary), sy = size * (1 + (rnd() - 0.5) * 0.06 * vary);
  const by = (rnd() - 0.5) * 0.03 * size * vary;
  const rot = (rnd() - 0.5) * 0.04 * vary;
  const map = ([u, v]) => {
    const uu = u + -v * slant;
    const X = uu * sx, Y = v * sy;
    return [x + X * Math.cos(rot) - Y * Math.sin(rot), y + by + X * Math.sin(rot) + Y * Math.cos(rot)];
  };
  return gl.strokes.map(parts => {
    const pts = [];
    for (const [kind, p] of parts) {
      const seg = kind === 's' ? catmull(p) : p;
      for (const q of seg) if (!pts.length || Math.hypot(q[0] - pts.at(-1)[0], q[1] - pts.at(-1)[1]) > 1e-6) pts.push(q);
    }
    return pts.map(map);
  });
}

/**
 * Disposición de una expresión con el «=» como pivote fijo: el miembro izquierdo crece hacia la izquierda,
 * el derecho hacia la derecha. Así el «=» no se mueve entre pasos de una transformación.
 * tokens: [{ch, key}]; devuelve [{ch, key, x, w}] con x = borde izquierdo del glifo.
 */
export function layoutAround(tokens, pivotX, size) {
  const eq = tokens.findIndex(t => t.ch === '=');
  const widths = tokens.map(t => GLYPHS[t.ch].adv * size);
  const gaps = tokens.map(t => sideGap(t.ch) * size);
  const out = tokens.map((t, i) => ({...t, w: widths[i], x: 0}));
  if (eq < 0) {
    let x = pivotX;
    out.forEach((o, i) => { x += i ? gaps[i] : 0; o.x = x; x += widths[i] + gaps[i]; });
    return out;
  }
  out[eq].x = pivotX - widths[eq] / 2;
  let x = out[eq].x - gaps[eq];
  for (let i = eq - 1; i >= 0; i--) { x -= gaps[i] + widths[i]; out[i].x = x; x -= gaps[i]; }
  x = out[eq].x + widths[eq] + gaps[eq];
  for (let i = eq + 1; i < out.length; i++) { x += gaps[i]; out[i].x = x; x += widths[i] + gaps[i]; }
  return out;
}
