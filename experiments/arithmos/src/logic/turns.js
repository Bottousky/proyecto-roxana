// Vueltas y flechas: radianes, alto y costado de un punto que gira, flechas (vectores),
// giros con números (complejos) y dos condiciones a la vez (sistemas 2 × 2).

export const TAU = 2 * Math.PI;

/** Cuántos radios entran alrededor de una rueda (cualquier radio): una vuelta en radianes. */
export const radiiAround = () => TAU;

export const degToRad = d => (d * Math.PI) / 180;

/** Alto y costado de un punto en una rueda de radio r, girado `deg` grados desde el costado derecho. */
export function point(r, deg) {
  const a = degToRad(deg);
  const round = v => Math.round(v * 1000) / 1000 + 0;
  return {x: round(r * Math.cos(a)), y: round(r * Math.sin(a))};
}

/** Tabla de alturas de 0 a `to` grados, de a `step`. */
export const heights = (r, step, to) => Array.from({length: Math.floor(to / step) + 1}, (_, i) => ({deg: i * step, y: point(r, i * step).y}));

/** Flechas: suma punta con cola. */
export const add = (...vs) => vs.reduce((a, v) => [a[0] + v[0], a[1] + v[1]], [0, 0]);

/** Un número complejo como flecha [a, b] (a + b·i); multiplicar. */
export const cmul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
export const I = [0, 1];

/** Girar un cuarto de vuelta (contra el reloj, con la parada hacia arriba). */
export const quarter = v => cmul(v, I);

/** Sistema a1·x + b1·y = c1, a2·x + b2·y = c2. Devuelve {kind: 'one'|'none'|'many', x, y}. */
export function solve2([a1, b1, c1], [a2, b2, c2]) {
  const det = a1 * b2 - a2 * b1;
  if (det === 0) {
    // proporcionales: misma recta o paralelas
    const same = a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1;
    return {kind: same ? 'many' : 'none'};
  }
  return {kind: 'one', x: (c1 * b2 - c2 * b1) / det, y: (a1 * c2 - a2 * c1) / det};
}

/** Razón alto ÷ largo de una rampa de ángulo `deg` (independiente del largo). */
export const slopeRatio = deg => Math.round(Math.sin(degToRad(deg)) * 1000) / 1000;
