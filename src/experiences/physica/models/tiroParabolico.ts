// Tiro parabólico como modelo puro: la piedra que el jugador lanza sigue esta
// parábola, y el preview dibuja la trayectoria muestreando posicionEn.
// Sin DOM ni three: verifica en Node con los tests p2.
export interface Tiro {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  /** Aceleración vertical (gravedad). Normal: -9.8. */
  a: number;
}

export interface Punto {
  x: number;
  y: number;
}

export function posicionEn({ x0, y0, vx, vy, a }: Tiro, t: number): Punto {
  return { x: x0 + vx * t, y: y0 + vy * t + 0.5 * a * t * t };
}

/**
 * Tiempo hasta volver a y = 0 (o null si la parábola nunca vuelve). Resuelve
 * la cuadrática ½a·t² + vy·t + y0 = 0 y queda con la primera raíz positiva.
 */
export function tiempoDeVuelo({ y0, vy, a }: Tiro): number | null {
  if (a === 0) return null;
  const A = a / 2;
  const disc = vy * vy - 4 * A * y0;
  if (disc < 0) return null;
  const raiz = Math.sqrt(disc);
  const t1 = (-vy - raiz) / (2 * A);
  const t2 = (-vy + raiz) / (2 * A);
  const positivas = [t1, t2].filter((t) => t > 0);
  return positivas.length > 0 ? Math.min(...positivas) : null;
}

/** Alcance horizontal hasta volver al suelo. null si nunca vuelve. */
export function alcance(tiro: Tiro): number | null {
  const t = tiempoDeVuelo(tiro);
  return t === null ? null : tiro.vx * t;
}

/** Muestra la trayectoria predicha (el preview de la sonda) en pasos de dt.
 *  Cuando la parábola vuelve al suelo, cierra la serie con el punto exacto del aterrizaje. */
export function muestrearTrayectoria(tiro: Tiro, dt: number, maxT: number): Punto[] {
  const vuelo = tiempoDeVuelo(tiro);
  const fin = vuelo === null ? maxT : Math.min(vuelo, maxT);
  const puntos: Punto[] = [];
  for (let t = 0; t <= fin + 1e-9; t += dt) puntos.push(posicionEn(tiro, t));
  if (vuelo !== null && vuelo < maxT) puntos.push(posicionEn(tiro, vuelo));
  return puntos;
}
