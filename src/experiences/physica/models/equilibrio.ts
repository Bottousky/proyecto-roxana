// Modelo puro de equilibrio: fuerzas opuestas y resultante nula.
//
// Base de la Escena 3 del slice: el INSTRUMENTO está suspendido por dos
// corrientes opuestas. Mientras ambas estén activas, la resultante es cero
// y el cuerpo no se mueve. Cubrir parcialmente una corriente rompe el
// equilibrio y el cuerpo se desplaza.
//
// Sin DOM ni Babylon: verifica en Node con tests p5-equilibrio.
import { GRAVEDAD, type Mruv, posicionEn, velocidadEn } from './caidaLibre.ts';

/** Par de fuerzas verticales opuestas que sustentan el instrumento. */
export interface FuerzasOpuestas {
  /** Aceleración ascendente (↑). */ upAcc: number;
  /** Aceleración descendente (↓). */ downAcc: number;
  /** Factor de cobertura de la fuerza ascendente: 0..1. */ upCover: number;
}

/** Estado cinemático del instrumento suspendido (posición y velocidad). */
export interface InstrumentoEstado {
  y: number;
  v: number;
  t: number;
}

/**
 * Aceleración neta sobre el instrumento: la corriente ascendente se reduce
 * por el factor de cobertura (`upCover`), la descendente no.
 *   a = upAcc·upCover − downAcc
 * Resultante nula cuando upAcc·upCover === downAcc.
 */
export function aceleracionNetas(f: FuerzasOpuestas): number {
  return f.upAcc * f.upCover - f.downAcc;
}

/** ¿Las fuerzas están en equilibrio (resultante nula)? */
export function enEquilibrio(f: FuerzasOpuestas): boolean {
  return Math.abs(aceleracionNetas(f)) < 1e-9;
}

/** Posición/v respecto al centro del valle (y positivo hacia arriba). */
export function integrarInstrumento(
  estado: InstrumentoEstado,
  f: FuerzasOpuestas,
  dt: number,
): InstrumentoEstado {
  const a = aceleracionNetas(f);
  return {
    y: posicionEn({ y0: estado.y, v0: estado.v, a }, dt),
    v: velocidadEn({ v0: estado.v, a }, dt),
    t: estado.t + dt,
  };
}

/** Descenso predecible: al cubrir un 60 % de la corriente ascendente con fuerzas
 *  simétricas, el instrumento debe bajar. */
export function descensoPredecible(f: FuerzasOpuestas): boolean {
  return aceleracionNetas(f) < 0;
}

/**
 * Síntesis: "un cuerpo puede permanecer inmóvil aunque existan fuerzas;
 * si la suma vectorial sobre ese cuerpo es nula, su movimiento no cambia."
 */
export function sintesisEquilibrio(f: FuerzasOpuestas): boolean {
  return enEquilibrio(f);
}

/** Tipo usado por el mundo Babylon para el chorro ascendente de la Escena 3. */
export function chorroAscendente(): Mruv {
  return { y0: 0, v0: 0, a: GRAVEDAD };
}
