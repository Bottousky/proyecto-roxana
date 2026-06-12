import {
  CHANNEL_TOLERANCES,
  PIEDRAS,
  advanceChannelCut,
  heatLevel,
  type ChannelCutState,
  type HeatLevel,
} from './common.ts';

export type LongChannelPush = 4 | 8 | 16;
export type LongChannelStone = 'marron' | 'roja' | 'amarilla' | 'gris';

export interface LongChannelEvaluation {
  resistance: number;
  river: number;
  delivery: number;
  exactDelivery: boolean;
  level: HeatLevel;
  valid: boolean;
}

export interface LongChannelState {
  push: LongChannelPush;
  stones: LongChannelStone[];
  channel: ChannelCutState;
  repairs: number;
  foundCold: boolean;
  foundWarm: boolean;
  solved: boolean;
}

export type LongChannelAttemptEvent =
  | 'incomplete'
  | 'wrong-delivery'
  | 'red-warning'
  | 'cut'
  | 'channel-cut'
  | 'valid';

export interface LongChannelAttemptResult {
  state: LongChannelState;
  evaluation: LongChannelEvaluation;
  event: LongChannelAttemptEvent;
}

export const LONG_CHANNEL_PUSHES: readonly LongChannelPush[] = [4, 8, 16];
export const LONG_CHANNEL_STONES: readonly LongChannelStone[] = [
  'marron',
  'roja',
  'amarilla',
  'gris',
];
export const LONG_CHANNEL_TARGET_DELIVERY = 16;
export const LONG_CHANNEL_MAX_STONES = 4;

export function createLongChannelState(): LongChannelState {
  return {
    push: 4,
    stones: [],
    channel: { insistences: 0, cut: false },
    repairs: 0,
    foundCold: false,
    foundWarm: false,
    solved: false,
  };
}

export function setLongChannelPush(
  state: LongChannelState,
  push: LongChannelPush,
): LongChannelState {
  if (state.channel.cut) return state;
  return { ...state, push };
}

export function addLongChannelStone(
  state: LongChannelState,
  stone: LongChannelStone,
): LongChannelState {
  if (state.channel.cut || state.stones.length >= LONG_CHANNEL_MAX_STONES) return state;
  return { ...state, stones: [...state.stones, stone] };
}

export function removeLongChannelStone(
  state: LongChannelState,
  index: number,
): LongChannelState {
  if (state.channel.cut || index < 0 || index >= state.stones.length) return state;
  return {
    ...state,
    stones: state.stones.filter((_, stoneIndex) => stoneIndex !== index),
  };
}

export function evaluateLongChannel(
  push: LongChannelPush,
  stones: readonly LongChannelStone[],
): LongChannelEvaluation {
  const resistance = stones.reduce((sum, stone) => sum + PIEDRAS[stone].valor, 0);
  const river = resistance === 0 ? 0 : push / resistance;
  const delivery = push * river;
  const exactDelivery = delivery === LONG_CHANNEL_TARGET_DELIVERY;
  const level = heatLevel(river, CHANNEL_TOLERANCES.angosto);
  return {
    resistance,
    river,
    delivery,
    exactDelivery,
    level,
    valid: exactDelivery && level !== 'rojo',
  };
}

export function attemptLongChannel(state: LongChannelState): LongChannelAttemptResult {
  const evaluation = evaluateLongChannel(state.push, state.stones);
  if (state.channel.cut) {
    return { state, evaluation, event: 'channel-cut' };
  }
  if (state.stones.length === 0) {
    return { state, evaluation, event: 'incomplete' };
  }

  const channel = advanceChannelCut(state.channel, evaluation.level);
  if (channel.cut) {
    return {
      state: { ...state, channel },
      evaluation,
      event: 'cut',
    };
  }
  if (evaluation.level === 'rojo') {
    return {
      state: { ...state, channel },
      evaluation,
      event: 'red-warning',
    };
  }
  if (!evaluation.exactDelivery) {
    return {
      state: { ...state, channel },
      evaluation,
      event: 'wrong-delivery',
    };
  }

  return {
    state: {
      ...state,
      channel,
      foundCold: state.foundCold || evaluation.level === 'frio',
      foundWarm: state.foundWarm || evaluation.level === 'tibio',
      solved: true,
    },
    evaluation,
    event: 'valid',
  };
}

export function repairLongChannel(state: LongChannelState): LongChannelState {
  if (!state.channel.cut) return state;
  return {
    ...state,
    channel: { insistences: 0, cut: false },
    repairs: state.repairs + 1,
  };
}
