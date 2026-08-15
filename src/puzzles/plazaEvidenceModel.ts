// Modelo puro del beat VS01 — "Observar antes de actuar".
//
// El primer minuto del vertical slice es de **observación**, no de puzzle algorítmico. Pero
// sigue siendo una decisión del jugador: tiene que mirar tres evidencias mínimas antes de que
// la cámara ceda el control y la Plaza se vuelva caminable (ohmdal-vertical-slice_v1.md §4
// beat VS01). El modelo de ese beat es lo que vive acá.
//
// Tres evidencias, una sola Plaza:
//
//   - **campana-sin-respuesta**  → la cuerda cuelga, nadie la tira.
//   - **trazas-de-cobre**        → los canales del Portal muestran el paso que ya no pasa.
//   - **agua-detenida**          → el manantial espera arriba, mudo.
//
// El error productivo del beat es intentar moverse antes de observar: el modelo lo permite
// registrando el orden de observación pero no exige completarlo antes de moverse. La cámara
// es la que decide cuándo cede el control — eso es UI, no modelo. Acá vive la **regla**.
//
// Validación por condición, no por solución fija (P07, docs/guia-puzzles.md §3): el orden
// de las observaciones no es un examen. Lo que cuenta es que las tres estén registradas.
// Tampoco hay "una sola forma" de mirar: el jugador puede observar la campana primero, el
// agua primero, o las trazas primero; los tres órdenes son aceptables.

export type PlazaEvidenceId = 'campana-sin-respuesta' | 'trazas-de-cobre' | 'agua-detenida';

export const PLAZA_EVIDENCES: readonly PlazaEvidenceId[] = [
  'campana-sin-respuesta',
  'trazas-de-cobre',
  'agua-detenida',
];

export interface PlazaObservationDef {
  /** Las tres evidencias que el beat VS01 pide como mínimo antes de mover. */
  readonly required: readonly PlazaEvidenceId[];
  /** Etiqueta corta que aparece en la Bitácora cuando se observa. */
  readonly title: (id: PlazaEvidenceId) => string;
}

export const PLAZA_OBSERVATION: PlazaObservationDef = {
  required: PLAZA_EVIDENCES,
  title: (id) => {
    switch (id) {
      case 'campana-sin-respuesta': return 'La campana no responde';
      case 'trazas-de-cobre': return 'Trazas de cobre en el Portal';
      case 'agua-detenida': return 'El agua no baja';
    }
  },
};

export interface PlazaObservationProgress {
  /** Las evidencias que el jugador ya observó, en el orden en que las marcó. */
  readonly observed: readonly PlazaEvidenceId[];
}

export function createPlazaObservation(): PlazaObservationProgress {
  return { observed: [] };
}

export function hasObserved(
  progress: PlazaObservationProgress,
  id: PlazaEvidenceId,
): boolean {
  return progress.observed.includes(id);
}

/**
 * Registra una observación. Idempotente: si la evidencia ya estaba, devuelve el mismo progreso
 * sin agregar duplicados, igual que `toggleCover` del modelo de Ohm.
 */
export function markObservation(
  progress: PlazaObservationProgress,
  id: PlazaEvidenceId,
): PlazaObservationProgress {
  if (hasObserved(progress, id)) return progress;
  return { observed: [...progress.observed, id] };
}

/**
 * ¿El beat VS01 quedó completo? Sí cuando las tres evidencias requeridas están observadas,
 * sin importar el orden.
 */
export function observationComplete(progress: PlazaObservationProgress): boolean {
  for (const required of PLAZA_OBSERVATION.required) {
    if (!hasObserved(progress, required)) return false;
  }
  return true;
}

/**
 * El conjunto de órdenes válidos para completar el beat. Como las observaciones no compiten
 * entre sí, todas las permutaciones son aceptables — el modelo **enumera** esa libertad
 * porque P07 la pide y la guía de puzzles la recuerda.
 */
export function validObservationOrders(): readonly (readonly PlazaEvidenceId[])[] {
  const permutations: PlazaEvidenceId[][] = [];
  const remaining: PlazaEvidenceId[] = [...PLAZA_EVIDENCES];
  function step(current: PlazaEvidenceId[], pool: PlazaEvidenceId[]): void {
    if (pool.length === 0) {
      permutations.push(current);
      return;
    }
    for (let index = 0; index < pool.length; index += 1) {
      const next = pool[index];
      step([...current, next], [...pool.slice(0, index), ...pool.slice(index + 1)]);
    }
  }
  step([], remaining);
  return permutations;
}

/**
 * ¿El orden observado es uno de los aceptables? Como todos los órdenes son válidos, esto
 * existe sólo como **puerta de auditoría**: cualquier secuencia observada por el jugador que
 * no aparezca acá es una señal de que el modelo cambió sin actualizar las permutaciones.
 */
export function isRecognizedOrder(progress: PlazaObservationProgress): boolean {
  if (progress.observed.length !== PLAZA_EVIDENCES.length) return false;
  const orders = validObservationOrders();
  return orders.some(
    (order) =>
      order.length === progress.observed.length &&
      order.every((id, index) => progress.observed[index] === id),
  );
}
