/**
 * Distribution Model (Puzzle 3) — Ohmdal Arco I.
 *
 * Puzzle: The player has just restored Ohm, the Plaza, and the
 * Taller. The Manantial gate is still closed. The player must decide
 * which subsystem to energize next: the Manantial (water flows, lamps
 * light), or back to the Plaza to seal something there. The puzzle
 * accepts ≥2 valid orderings.
 *
 * The model is pure. The engine handles the UI and the consequences
 * (music change, particles, light propagation, NPC reactions).
 *
 * Decisions are explicit, not just clicks. The player must predict
 * the consequence.
 */

export type SubsystemId = string;
export type Decision = 'manantial' | 'plaza' | 'taller';

export interface SubsystemDef {
  id: SubsystemId;
  name: string;
  /** Description shown to the player. */
  desc: string;
  /** When energised, what does it do? */
  onEnergise: string;
  /** Trade-off: what is delayed or limited? */
  tradeOff: string;
}

export interface DistributionState {
  subsystems: SubsystemDef[];
  /** Has the player given a prediction? */
  predicted: boolean;
  /** The player's prediction. */
  prediction: Decision | null;
  /** The decision the player made. */
  decision: Decision | null;
}

export interface DistributionResult {
  valid: boolean;
  reason: string;
  /** The actual consequence of the decision. */
  consequence: string;
  /** Subsystem now energised. */
  energised: SubsystemId;
}

export function createDistributionState(): DistributionState {
  return {
    predicted: false,
    prediction: null,
    decision: null,
    subsystems: [
      {
        id: 'manantial',
        name: 'Abrir el Manantial',
        desc: 'La compuerta se abre. El agua fluye por la calzada. Las dos lámparas del Manantial encienden. La fuente de la Plaza se llena desde arriba.',
        onEnergise: 'El Manantial riega, el cobre de arriba brilla, la música cambia.',
        tradeOff: 'La tensión disponible para el Taller cae a la mitad. Lumen tiene que esperar para terminar el suyo.',
      },
      {
        id: 'plaza',
        name: 'Reforzar la Plaza',
        desc: 'Cuatro lámparas más en la Plaza encienden, la fuente se llena hasta arriba, y el cable de retorno de la Plaza queda firme.',
        onEnergise: 'La Plaza queda terminada. Pero el Manantial sigue cerrado.',
        tradeOff: 'El Manantial sigue seco. La regadora no puede trabajar.',
      },
      {
        id: 'taller',
        name: 'Sellar el Taller',
        desc: 'Lumen termina su banco. Las dos lámparas del Taller encienden. Su módulo queda calibrado.',
        onEnergise: 'Lumen puede enseñar. Pero el Manantial sigue seco.',
        tradeOff: 'El Manantial sigue seco. La fuente no se llena por arriba.',
      },
    ],
  };
}

/**
 * Set the player's prediction. Returns the consequence they would see
 * IF their decision matches their prediction.
 */
export function setPrediction(
  state: DistributionState,
  prediction: Decision,
): DistributionState {
  return { ...state, predicted: true, prediction };
}

/**
 * Apply the decision. Returns a result that the engine uses to update
 * the world.
 */
export function applyDecision(
  state: DistributionState,
  decision: Decision,
): DistributionResult {
  if (!state.predicted) {
    return {
      valid: false,
      reason: 'Sin predicción. ¿Qué creés que va a pasar antes de tocar?',
      consequence: '',
      energised: '',
    };
  }
  const sub = state.subsystems.find((s) => s.id === decision);
  if (!sub) {
    return { valid: false, reason: 'Decisión inválida', consequence: '', energised: '' };
  }
  return {
    valid: true,
    reason: 'Aceptada.',
    consequence: sub.onEnergise,
    energised: sub.id,
  };
}

/**
 * Determine if the prediction matches the decision (the player
 * correctly predicted what they would do, even if it was suboptimal).
 */
export function predictionMatches(
  state: DistributionState,
  decision: Decision,
): boolean {
  return state.prediction === decision;
}

/**
 * Determine if the decision is "valid" in the sense of the puzzle
 * rules. All three decisions are valid by design — the player picks
 * the trade-off they prefer.
 */
export function isValidDecision(decision: Decision): boolean {
  return decision === 'manantial' || decision === 'plaza' || decision === 'taller';
}
