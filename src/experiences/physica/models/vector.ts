// Modelo puro de vectores: magnitud, dirección y sentido.
//
// Base de la Escena 5 del slice: el reloj visualiza vectores y el jugador
// compone el vector del lanzamiento con el de la corriente transversal
// para alcanzar el otro lado de la grieta.
//
// Sin DOM ni Babylon: verifica en Node con tests p5-vector.
export interface Vector2D {
  x: number;
  y: number;
}

/** Magnitud (norma euclídea). */
export function magnitud(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** Sentido normalizado (dirección unitária). Si el vector es nulo devuelve {0,0}. */
export function direccion(v: Vector2D): Vector2D {
  const m = magnitud(v);
  if (m < 1e-12) return { x: 0, y: 0 };
  return { x: v.x / m, y: v.y / m };
}

/** Ángulo en grados (0° = eje +x, positivo antihorario). */
export function anguloGrados(v: Vector2D): number {
  return (Math.atan2(v.y, v.x) * 180) / Math.PI;
}

/** Suma vectorial. */
export function sumar(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Escalar. */
export function escalar(v: Vector2D, k: number): Vector2D {
  return { x: v.x * k, y: v.y * k };
}

/**
 * Resultante de dos vectores: el desplazamiento combinado.
 * Síntesis: "magnitud, dirección y sentido determinan el resultado;
 * los vectores relevantes se combinan."
 */
export function resultante(a: Vector2D, b: Vector2D): Vector2D {
  return sumar(a, b);
}

/**
 * Desvío lateral causado por una corriente horizontal sobre un
 * proyectil: el desplazamiento transversal es v_corriente · t_vuelo.
 * Devuelve el offset en x que hay que compensar apuntando contra la corriente.
 */
export function compensacionCorriente(corriente: Vector2D, tVuelo: number): number {
  return corriente.x * tVuelo;
}

/**
 * El jugador debe apuntar "hacia otro lugar para llegar al mismo lugar":
 * el vector de lanzamiento compuesto con la corriente debe apuntar al objetivo.
 */
export function objetivoAlcanzable(
  lanzamiento: Vector2D,
  corriente: Vector2D,
  distancia: number,
  tVuelo: number,
): boolean {
  const desplazamiento = compensacionCorriente(corriente, tVuelo);
  const alcance = lanzamiento.x * tVuelo + desplazamiento;
  return alcance >= distancia - 1e-6;
}

/** Punto final (x, y) donde aterriza un tiro parabólico con corriente transversal.
    La corriente sólo afecta x; el jugador sigue controlando la altura. Útil para
    previsualizar el impacto en el reloj. */
export function alcanceConCorriente(
  lanzamiento: Vector2D,
  corriente: Vector2D,
  tVuelo: number,
): Vector2D {
  return {
    x: lanzamiento.x * tVuelo + compensacionCorriente(corriente, tVuelo),
    y: lanzamiento.y * tVuelo,
  };
}

/** Dado el objetivo en x y la corriente, devuelve el vx que el jugador debe
    imprimir para alcanzarlo. Útil para resolver puzzles con respuestas múltiples
    (high arc / low arc con la misma corrección en x). */
export function vxParaAlcance(distancia: number, corriente: Vector2D, tVuelo: number): number {
  if (tVuelo <= 0) return 0;
  return (distancia - compensacionCorriente(corriente, tVuelo)) / tVuelo;
}
