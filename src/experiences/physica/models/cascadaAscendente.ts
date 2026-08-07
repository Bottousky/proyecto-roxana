// Modelo puro de la Escena 2 del slice v0.2 (la cascada ascendente).
//
// El corazón del hito: en un MISMO lugar conviven dos leyes. El chorro de agua
// asciende con a = +g mientras la piedra cae con a = -g. No es una inversión
// global simple. Todo lo que se puede medir vive acá; el mundo Babylon sólo
// presenta y alimenta input.
import {
  GRAVEDAD,
  posicionEn as posicionMruv,
  velocidadEn,
  type Mruv,
} from './caidaLibre.ts';
import {
  tiempoDeVuelo,
  type Tiro,
} from './tiroParabolico.ts';

export { GRAVEDAD };

/** Altura del lago (el plano de la cornisa) y del cielo (las nubes). */
export const LAGO_Y = 0;
export const CIELO_Y = 28;

/** La columna de la cascada ascendente: ancla espacial del fenómeno. */
export interface Columna {
  x0: number;
  x1: number;
}

/** Columna canónica del mundo (la cornisa la acoge en x ∈ [8.6, 11.4]). */
export const COLUMNA_CASCADA: Columna = { x0: 8.6, x1: 11.4 };

/** El agua del chorro obedece a = +g: sube desde el lago hacia el cielo. */
export function chorroAscendente(lagoY = LAGO_Y): Mruv {
  return { y0: lagoY, v0: 0, a: GRAVEDAD };
}

/** Posición del frente del chorro en t (y(t) = ½·g·t²). */
export function posicionChorro(chorro: Mruv, t: number): number {
  return posicionMruv(chorro, t);
}

/** Velocidad del frente del chorro en t (v(t) = g·t, siempre positiva). */
export function velocidadChorro(chorro: Mruv, t: number): number {
  return velocidadEn(chorro, t);
}

/** La piedra que el jugador arroja: tiro parabólico con gravedad NORMAL (a = -g). */
export function tiroPiedra(x0: number, y0: number, vx: number, vy: number): Tiro {
  return { x0, y0, vx, vy, a: -GRAVEDAD };
}

/** Tiempo de vuelo de la piedra hasta el suelo (null si nunca vuelve). */
export function tiempoDeVueloPiedra(tiro: Tiro): number | null {
  return tiempoDeVuelo(tiro);
}

/** ¿La piedra ya pasó por su pico y está descendiendo? (v < 0). */
export function piedraDescendiendo(tiro: Tiro, t: number): boolean {
  return tiro.vy + tiro.a * t < 0;
}

/** ¿x cae dentro de la columna de la cascada? */
export function enColumna(x: number, columna: Columna): boolean {
  return x >= columna.x0 && x <= columna.x1;
}

/**
 * El jugador está "cerca de la cascada" si su x está en la columna extendida
 * por el umbral: el registro de la observación requiere estar en el lugar.
 */
export function avatarCercaDeCascada(x: number, columna: Columna, umbral: number): boolean {
  return x >= columna.x0 - umbral && x <= columna.x1 + umbral;
}

/** Predicción comprometida antes de observar el lanzamiento. */
export type PrediccionCaida = 'sube' | 'cae';

/** Resultado medido al comparar la expectativa con la trayectoria real. */
export type ResultadoPrediccion = 'acierto' | 'error';

export function resultadoPrediccion(prediccion: PrediccionCaida): ResultadoPrediccion {
  return prediccion === 'cae' ? 'acierto' : 'error';
}

export interface Evidencia {
  /** Al menos una piedra arrojada aterrizó en el suelo (cayó con normalidad). */
  piedraAterrizada: boolean;
  /** El avatar está en el lugar del fenómeno. */
  avatarCerca: boolean;
  /** El jugador se comprometió con una expectativa antes de observar. */
  prediccionComprometida: boolean;
}

/** La observación se registra sólo cuando se cumplen las tres condiciones. */
export function observacionCompleta(e: Evidencia): boolean {
  return e.piedraAterrizada && e.avatarCerca && e.prediccionComprometida;
}
