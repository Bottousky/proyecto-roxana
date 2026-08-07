// Modelo puro de plano inclinado: rampa que reduce la fuerza requerida.
//
// Base de la Escena 6 del slice: la roca es demasiado pesada para levantar
// directamente, pero al construir una rampa se puede empujar hacia arriba
// con menor fuerza a lo largo de un recorrido mayor.
//
// Sin DOM ni Babylon: verifica en Node con tests p5-plano-inclinado.
export interface PlanoInclinado {
  /** Longitud de la rampa. */ length: number;
  /** Altura vertical que se alcanza. */ height: number;
  /** Ángulo de la rampa en grados. */ angleDeg: number;
}

/** Fuerza vertical requerida para levantar la roca directamente (peso). */
export const FUERZA_LEVANTAR = 98; // N (masa ~10 kg, g=9.8)

/**
 * Fuerza tangencial requerida para empujar la roca por la rampa.
 * F_tangente = m·g·sin(θ)  (menor que m·g cuando θ < 90°).
 */
export function fuerzaTangencial(plano: PlanoInclinado, peso = FUERZA_LEVANTAR): number {
  const theta = (plano.angleDeg * Math.PI) / 180;
  return peso * Math.sin(theta);
}

/** Recorrido horizontal de la base de la rampa. */
export function recorridoBase(plano: PlanoInclinado): number {
  return plano.length * Math.cos((plano.angleDeg * Math.PI) / 180);
}

/** Constructores de rampas comunes. */
export function crearPlano(height: number, angleDeg: number): PlanoInclinado {
  const theta = (angleDeg * Math.PI) / 180;
  const length = height / Math.sin(theta);
  return { length, height, angleDeg };
}

/**
 * Síntesis: "un plano inclinado permite alcanzar una altura aplicando
 * menor fuerza a lo largo de una distancia mayor. No crea energía gratuita."
 * Verdadero siempre que la fuerza tangencial sea menor que el peso.
 */
export function sintesisPlanoInclinado(plano: PlanoInclinado): boolean {
  return fuerzaTangencial(plano) < FUERZA_LEVANTAR;
}

/**
 * Trabajo necesario (energía): peso · height — idéntico suba o no,
 * pero distribuido a lo largo de `length` en lugar de concentrado.
 */
export function trabajoNecesario(plano: PlanoInclinado, peso = FUERZA_LEVANTAR): number {
  return peso * plano.height;
}
