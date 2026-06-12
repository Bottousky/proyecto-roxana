import {
  CHANNEL_TOLERANCES,
  heatLevel,
  type ChannelThickness,
  type HeatLevel,
} from './common.ts';

export type InfirmaryMachineId = 'A' | 'B' | 'C';
export type FuseRating = 1 | 2 | 4 | 8;

export interface InfirmaryMachine {
  id: InfirmaryMachineId;
  workRiver: number;
  peakRiver: number;
  thickness: ChannelThickness;
  correctFuse: FuseRating;
}

export interface InfirmaryState {
  fuses: Record<InfirmaryMachineId, FuseRating | null>;
  burnedChannelDemo: boolean;
  channelCut: boolean;
  solved: boolean;
}

export type InfirmaryStartEvent =
  | 'incomplete'
  | 'young-fuse'
  | 'burned-channel-demo'
  | 'channel-cut'
  | 'solved';

export interface InfirmaryStartResult {
  state: InfirmaryState;
  event: InfirmaryStartEvent;
  youngMachines: InfirmaryMachineId[];
}

export interface InfirmaryReading {
  workLevel: HeatLevel;
  peakLevel: HeatLevel;
}

export const FUSE_RATINGS: readonly FuseRating[] = [1, 2, 4, 8];

export const INFIRMARY_MACHINES: Record<InfirmaryMachineId, InfirmaryMachine> = {
  A: { id: 'A', workRiver: 1, peakRiver: 2, thickness: 'angosto', correctFuse: 2 },
  B: { id: 'B', workRiver: 2, peakRiver: 3, thickness: 'medio', correctFuse: 4 },
  C: { id: 'C', workRiver: 4, peakRiver: 5, thickness: 'ancho', correctFuse: 8 },
};

const MACHINE_IDS: readonly InfirmaryMachineId[] = ['A', 'B', 'C'];

export function createInfirmaryState(): InfirmaryState {
  return {
    fuses: { A: null, B: null, C: null },
    burnedChannelDemo: false,
    channelCut: false,
    solved: false,
  };
}

export function setMachineFuse(
  state: InfirmaryState,
  machineId: InfirmaryMachineId,
  fuse: FuseRating,
): InfirmaryState {
  if (state.channelCut || state.solved) return state;
  return {
    ...state,
    fuses: { ...state.fuses, [machineId]: fuse },
  };
}

export function fuseSurvivesPeak(peakRiver: number, fuse: FuseRating): boolean {
  return peakRiver <= fuse;
}

export function isCorrectFuse(
  machineId: InfirmaryMachineId,
  fuse: FuseRating,
): boolean {
  return INFIRMARY_MACHINES[machineId].correctFuse === fuse;
}

export function infirmaryReading(machineId: InfirmaryMachineId): InfirmaryReading {
  const machine = INFIRMARY_MACHINES[machineId];
  const tolerance = CHANNEL_TOLERANCES[machine.thickness];
  return {
    workLevel: heatLevel(machine.workRiver, tolerance),
    peakLevel: heatLevel(machine.peakRiver, tolerance),
  };
}

export function repairDemoChannel(state: InfirmaryState): InfirmaryState {
  if (!state.channelCut) return state;
  return { ...state, channelCut: false };
}

export function startForge(state: InfirmaryState): InfirmaryStartResult {
  if (state.channelCut) {
    return { state, event: 'channel-cut', youngMachines: [] };
  }

  if (state.fuses.A === 8 && !state.burnedChannelDemo) {
    return {
      state: { ...state, burnedChannelDemo: true, channelCut: true },
      event: 'burned-channel-demo',
      youngMachines: [],
    };
  }

  const youngMachines = MACHINE_IDS.filter((id) => {
    const fuse = state.fuses[id];
    return fuse !== null && !fuseSurvivesPeak(INFIRMARY_MACHINES[id].peakRiver, fuse);
  });
  if (youngMachines.length > 0) {
    const fuses = { ...state.fuses };
    for (const id of youngMachines) fuses[id] = null;
    return {
      state: { ...state, fuses },
      event: 'young-fuse',
      youngMachines,
    };
  }

  const solved = MACHINE_IDS.every((id) => {
    const fuse = state.fuses[id];
    return fuse !== null && isCorrectFuse(id, fuse);
  });
  if (solved) {
    return {
      state: { ...state, solved: true },
      event: 'solved',
      youngMachines: [],
    };
  }

  return { state, event: 'incomplete', youngMachines: [] };
}
