// Modelo puro de sistema de referencia móvil.
//
// Base de la Escena 4 del slice: plataformas que se desplazan lateralmente
// manteniendo separación fija. El jugador ancla una plataforma como referencia;
// relativamente a ella, las demás parecen detenerse mientras el entorno externo
// se mueve en sentido opuesto.
//
// Sin DOM ni Babylon: verifica en Node con tests p5-referencia.
export interface PlataformaMovil {
  /** Posición base (cuando t=0). */ x0: number;
  /** Amplitud del vaivén horizontal. */ amplitude: number;
  /** Frecuencia angular (rad/s). */ omega: number;
  /** Fase (rad). */ phase: number;
}

/** Posición x de la plataforma en el tiempo t. */
export function posicionPlataforma(p: PlataformaMovil, t: number): number {
  return p.x0 + p.amplitude * Math.sin(p.omega * t + p.phase);
}

/** Velocidad horizontal de la plataforma en el tiempo t. */
export function velocidadPlataforma(p: PlataformaMovil, t: number): number {
  return p.amplitude * p.omega * Math.cos(p.omega * t + p.phase);
}

export interface SistemaReferencia {
  /** Plataformas que comparten el mismo movimiento base. */ plataformas: PlataformaMovil[];
  /** Plataforma anclada como referencia (índice). -1 = sistema fijo (el suelo). */ anclajeIdx: number;
}

/** Separación relativa entre dos plataformas (debe ser constante). */
export function separacionRelativa(s: SistemaReferencia, a: number, b: number, t: number): number {
  return posicionPlataforma(s.plataformas[b], t) - posicionPlataforma(s.plataformas[a], t);
}

/**
 * Posición relativa de una coordenada respecto al anclaje.
 * "La medición no cambió. Cambió desde dónde la contamos."
 */
export function posicionRelativa(s: SistemaReferencia, xMundo: number, t: number): number {
  if (s.anclajeIdx < 0) return xMundo;
  return xMundo - posicionPlataforma(s.plataformas[s.anclajeIdx], t);
}

/** ¿Dos plataformas mantienen separación constante? */
export function separacionConstante(s: SistemaReferencia, a: number, b: number, dt = 0.1): boolean {
  const d0 = separacionRelativa(s, a, b, 0);
  for (let i = dt; i <= 10; i += dt) {
    if (Math.abs(separacionRelativa(s, a, b, i) - d0) > 1e-6) return false;
  }
  return true;
}
