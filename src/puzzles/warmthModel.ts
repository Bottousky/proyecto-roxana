import {
  CHANNEL_TOLERANCES,
  heatLevel,
  type ChannelThickness,
  type HeatLevel,
} from './common.ts';

export type WarmthChannelId = 'martillo' | 'fuelle' | 'viejo' | 'yunque';

export interface WarmthChannel {
  id: WarmthChannelId;
  label: string;
  baseRiver: number;
  thickness: ChannelThickness;
}

export interface WarmthReading {
  river: number;
  tolerance: number;
  level: HeatLevel;
}

export interface WarmthExperiences {
  hammer: boolean;
  bellowsBase: boolean;
  oldChannel: boolean;
  anvilDoubled: boolean;
}

export interface WarmthState {
  anvilDoubled: boolean;
  anvilBaseObserved: boolean;
  experiences: WarmthExperiences;
}

export const WARMTH_CHANNELS: Record<WarmthChannelId, WarmthChannel> = {
  martillo: {
    id: 'martillo',
    label: 'Canal del martillo',
    baseRiver: 4,
    thickness: 'angosto',
  },
  fuelle: {
    id: 'fuelle',
    label: 'Canal del fuelle',
    baseRiver: 4,
    thickness: 'ancho',
  },
  viejo: {
    id: 'viejo',
    label: 'Canal viejo',
    baseRiver: 0,
    thickness: 'angosto',
  },
  yunque: {
    id: 'yunque',
    label: 'Canal del yunque',
    baseRiver: 2,
    thickness: 'angosto',
  },
};

export function createWarmthState(): WarmthState {
  return {
    anvilDoubled: false,
    anvilBaseObserved: false,
    experiences: {
      hammer: false,
      bellowsBase: false,
      oldChannel: false,
      anvilDoubled: false,
    },
  };
}

export function warmthReading(state: WarmthState, id: WarmthChannelId): WarmthReading {
  const channel = WARMTH_CHANNELS[id];
  const river =
    id === 'yunque' && state.anvilDoubled ? channel.baseRiver * 2 : channel.baseRiver;
  const tolerance = CHANNEL_TOLERANCES[channel.thickness];
  return { river, tolerance, level: heatLevel(river, tolerance) };
}

export function observeWarmth(state: WarmthState, id: WarmthChannelId): WarmthState {
  const experiences = { ...state.experiences };
  if (id === 'martillo') experiences.hammer = true;
  if (id === 'viejo') experiences.oldChannel = true;
  if (id === 'fuelle') experiences.bellowsBase = true;
  if (id === 'yunque' && state.anvilDoubled) experiences.anvilDoubled = true;
  return {
    ...state,
    anvilBaseObserved:
      state.anvilBaseObserved || (id === 'yunque' && !state.anvilDoubled),
    experiences,
  };
}

export function setAnvilDoubled(state: WarmthState, doubled: boolean): WarmthState {
  return { ...state, anvilDoubled: doubled };
}

export function isWarmthSolved(state: WarmthState): boolean {
  return Object.values(state.experiences).every(Boolean);
}
