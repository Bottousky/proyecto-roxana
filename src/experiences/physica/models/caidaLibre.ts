// Modelo puro del movimiento rectilíneo uniformemente acelerado (MRUV), la base
// de la Unidad 1 de Physica (caída libre y su inversión). Sin DOM ni three:
// verifica en Node con los tests p1.
//
// Convención: y crece hacia arriba. La gravedad normal es a = -g.
export interface Mruv {
  y0: number;
  v0: number;
  /** Aceleración en m/s². Normal: -9.8. Cascada invertida del mundo roto: +9.8. */
  a: number;
}

export interface MruvIntegrada {
  y: number;
  v: number;
  t: number;
}

/** Posición cerrada: y(t) = y0 + v0·t + ½·a·t² */
export function posicionEn({ y0, v0, a }: Mruv, t: number): number {
  return y0 + v0 * t + 0.5 * a * t * t;
}

/** Velocidad cerrada: v(t) = v0 + a·t */
export function velocidadEn({ v0, a }: { v0: number; a: number }, t: number): number {
  return v0 + a * t;
}

/** Paso de integración exacto para a constante. */
export function integrar(estado: MruvIntegrada, dt: number, a: number): MruvIntegrada {
  return {
    y: posicionEn({ y0: estado.y, v0: estado.v, a }, dt),
    v: velocidadEn({ v0: estado.v, a }, dt),
    t: estado.t + dt,
  };
}

/** MRUV de caída libre desde el reposo a una altura dada (convención y hacia arriba). */
export function caidaDesde(altura: number, g = GRAVEDAD): Mruv {
  return { y0: altura, v0: 0, a: -g };
}

/** Tiempo de caída desde el reposo: t = √(2h/g). */
export function tiempoDeCaida(altura: number, g = GRAVEDAD): number {
  if (altura <= 0 || g <= 0) return 0;
  return Math.sqrt((2 * altura) / g);
}

export const GRAVEDAD = 9.8;
