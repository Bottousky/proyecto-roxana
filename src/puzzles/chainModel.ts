// La Cadena (serie): un solo río en todo el camino, frenos que se suman, la fila
// que muere entera si se corta un eslabón. La victoria NO premia el recorte: se
// gana devolviendo el brillo a las SEIS lámparas subiendo el Empuje, nunca
// quitando. El aprendizaje se garantiza con dos predicciones (predecir → observar
// → explicar) antes de cada revelación.

export const CHAIN_MIN_LAMPS = 1;
export const CHAIN_MAX_LAMPS = 6;
export const CHAIN_INITIAL_LAMPS = 4;
export const CHAIN_TARGET_LAMPS = 6;
export const CHAIN_LAMP_BRAKE = 2;
export const CHAIN_PUSHES = [4, 8, 16] as const;
export const CHAIN_INITIAL_PUSH = 8;

export type ChainPush = (typeof CHAIN_PUSHES)[number];
export type ChainBand = 'demasiado' | 'bien' | 'tenue' | 'casi-nada';

/** Predicción 1: ¿dónde corre más río en la fila? La verdad es 'igual'. */
export type RiverGuess = 'antes' | 'despues' | 'igual';
export const RIVER_ANSWER: RiverGuess = 'igual';

/** Predicción 2: ¿qué les pasa a las otras si saco una? La verdad es 'apagan'. */
export type RemovalGuess = 'iguales' | 'mas' | 'apagan';
export const REMOVAL_ANSWER: RemovalGuess = 'apagan';

export interface ChainExperiences {
  measuredSameRiver: boolean;
  removedLamp: boolean;
  addedLamp: boolean;
}

export interface ChainPredictions {
  river: RiverGuess | null;
  removal: RemovalGuess | null;
}

export interface ChainState {
  push: ChainPush;
  lampCount: number;
  measuredSegments: string[];
  predictions: ChainPredictions;
  experiences: ChainExperiences;
  solved: boolean;
}

export interface ChainChange {
  state: ChainState;
  interrupted: boolean;
}

export function chainSegmentIds(lampCount: number): string[] {
  const count = clampLampCount(lampCount);
  const segments = ['before'];
  for (let index = 1; index < count; index++) {
    segments.push(`between-${index}`);
  }
  segments.push('after');
  return segments;
}

/** El río de la fila: mismo valor en todo el camino (un solo río en serie). */
export function chainRiver(push: number, lampCount: number): number {
  return push / (CHAIN_LAMP_BRAKE * clampLampCount(lampCount));
}

/** Lectura en un tramo concreto: idéntica en cualquier punto de la fila. */
export function chainReading(push: number, lampCount: number, segmentId: string): number {
  if (!chainSegmentIds(lampCount).includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }
  return chainRiver(push, lampCount);
}

export function chainBand(push: number, lampCount: number): ChainBand {
  const river = chainRiver(push, lampCount);
  if (river >= 3) return 'demasiado';
  if (river >= 1.2) return 'bien';
  if (river >= 0.6) return 'tenue';
  return 'casi-nada';
}

export function createChainState(): ChainState {
  return withSolved({
    push: CHAIN_INITIAL_PUSH,
    lampCount: CHAIN_INITIAL_LAMPS,
    measuredSegments: [],
    predictions: { river: null, removal: null },
    experiences: {
      measuredSameRiver: false,
      removedLamp: false,
      addedLamp: false,
    },
    solved: false,
  });
}

export function predictRiver(state: ChainState, guess: RiverGuess): ChainState {
  return withSolved({
    ...state,
    predictions: { ...state.predictions, river: guess },
  });
}

export function predictRemoval(state: ChainState, guess: RemovalGuess): ChainState {
  return withSolved({
    ...state,
    predictions: { ...state.predictions, removal: guess },
  });
}

export function setChainPush(state: ChainState, push: ChainPush): ChainState {
  if (push === state.push) return state;
  return withSolved({ ...state, push, measuredSegments: [] });
}

export function measureChainSegment(state: ChainState, segmentId: string): ChainState {
  const segments = chainSegmentIds(state.lampCount);
  if (!segments.includes(segmentId)) {
    throw new Error(`Tramo desconocido: ${segmentId}`);
  }

  const measuredSegments = state.measuredSegments.includes(segmentId)
    ? state.measuredSegments
    : [...state.measuredSegments, segmentId];
  const experiences = {
    ...state.experiences,
    measuredSameRiver:
      state.experiences.measuredSameRiver ||
      segments.every((segment) => measuredSegments.includes(segment)),
  };

  return withSolved({ ...state, measuredSegments, experiences });
}

export function removeChainLamp(state: ChainState): ChainChange {
  if (state.lampCount <= CHAIN_MIN_LAMPS) {
    return { state, interrupted: false };
  }

  return {
    interrupted: true,
    state: withSolved({
      ...state,
      lampCount: state.lampCount - 1,
      measuredSegments: [],
      experiences: { ...state.experiences, removedLamp: true },
    }),
  };
}

export function addChainLamp(state: ChainState): ChainChange {
  if (state.lampCount >= CHAIN_MAX_LAMPS) {
    return { state, interrupted: false };
  }

  return {
    interrupted: false,
    state: withSolved({
      ...state,
      lampCount: state.lampCount + 1,
      measuredSegments: [],
      experiences: { ...state.experiences, addedLamp: true },
    }),
  };
}

function clampLampCount(lampCount: number): number {
  return Math.max(CHAIN_MIN_LAMPS, Math.min(CHAIN_MAX_LAMPS, lampCount));
}

function withSolved(state: ChainState): ChainState {
  const solved =
    state.experiences.measuredSameRiver &&
    state.experiences.removedLamp &&
    state.lampCount === CHAIN_TARGET_LAMPS &&
    chainBand(state.push, state.lampCount) === 'bien';
  return { ...state, solved };
}
