// P2 — Tiro parabólico: la trayectoria que dibuja el preview de la sonda.
import {
  alcance,
  muestrearTrayectoria,
  posicionEn,
  tiempoDeVuelo,
} from '../src/experiences/physica/models/tiroParabolico.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

const G = 9.8;
const lanzamiento = { x0: 0, y0: 1, vx: 6, vy: 4.5, a: -G };

const vuelo = tiempoDeVuelo(lanzamiento);
const vueloEsperado = (() => {
  const A = -G / 2;
  const disc = lanzamiento.vy * lanzamiento.vy - 4 * A * lanzamiento.y0;
  const raiz = Math.sqrt(disc);
  const t1 = (-lanzamiento.vy - raiz) / (2 * A);
  const t2 = (-lanzamiento.vy + raiz) / (2 * A);
  return Math.min(...[t1, t2].filter((t) => t > 0));
})();
assert(vuelo !== null, 'el lanzamiento vuelve al suelo');
assert(vuelo !== null && casi(vuelo, vueloEsperado), 'tiempo de vuelo resuelve la cuadrática');

const fin = posicionEn(lanzamiento, vuelo!);
assert(casi(fin.y, 0), 'al final del vuelo toca el suelo');

assert(casi(alcance(lanzamiento)!, 6 * vuelo!), 'alcance = vx · tiempo de vuelo');

// El preview muestrea la parábola en pasos regulares y termina en el aterrizaje.
const puntos = muestrearTrayectoria(lanzamiento, 0.1, 5);
assert(puntos.length >= 10, 'el preview tiene al menos 10 puntos');
assert(casi(puntos[puntos.length - 1].y, 0), 'el último punto del preview toca el suelo');
assert(casi(puntos[0].x, lanzamiento.x0), 'el preview arranca en la mano');
const picoY = Math.max(...puntos.map((p) => p.y));
const picoExacto = lanzamiento.y0 + (lanzamiento.vy * lanzamiento.vy) / (2 * G);
assert(Math.abs(picoY - picoExacto) < 0.05, 'el pico muestreado se acerca al pico exacto (grilla de 0.1 s)');

// En la zona invertida del mundo (gravedad hacia arriba, a > 0), un lanzamiento
// nunca vuelve al suelo: la parábola se va al cielo.
const zonaInvertida = { x0: 0, y0: 1, vx: 2, vy: 1, a: G };
assert(tiempoDeVuelo(zonaInvertida) === null, 'en la zona invertida el lanzamiento nunca vuelve');

console.log('P2 tiro parabólico: OK');
