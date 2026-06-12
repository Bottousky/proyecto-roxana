import {
  CHANNEL_TOLERANCES,
  PIEDRAS,
  advanceChannelCut,
  heatLevel,
  type ChannelCutState,
  type ChannelThickness,
  type HeatLevel,
} from './common.ts';

export const FORGE_MACHINE_IDS = ['martillo', 'fuelle', 'lumbre'] as const;
export const FORGE_PUSHES = [8, 16] as const;
export const FORGE_STONES = ['marron', 'roja', 'amarilla', 'gris'] as const;
export const FORGE_FUSES = [1, 2, 4, 8] as const;
export const FORGE_MAX_STONES = 4;
export const FORGE_TRUNK_TOLERANCE = 8;
export const FORGE_CHANNEL_STOCK: Record<ChannelThickness, number> = {
  ancho: 1,
  medio: 2,
  angosto: 2,
};

export const FORGE_MACHINE_TARGETS: Record<ForgeMachineId, number> = {
  martillo: 32,
  fuelle: 16,
  lumbre: 8,
};

export type ForgeMachineId = (typeof FORGE_MACHINE_IDS)[number];
export type ForgePush = (typeof FORGE_PUSHES)[number];
export type ForgeStone = (typeof FORGE_STONES)[number];
export type ForgeFuse = (typeof FORGE_FUSES)[number];

export interface ForgeBranchState {
  stones: ForgeStone[];
  thickness: ChannelThickness | null;
  fuse: ForgeFuse | null;
  channel: ChannelCutState;
}

export interface ForgeState {
  push: ForgePush;
  branches: Record<ForgeMachineId, ForgeBranchState>;
  solved: boolean;
}

export interface ForgeMachineEvaluation {
  targetDelivery: number;
  resistance: number;
  river: number;
  peakRiver: number;
  delivery: number;
  exactDelivery: boolean;
  workLevel: HeatLevel;
  peakLevel: HeatLevel;
  channelWithinPeak: boolean;
  requiredFuse: ForgeFuse | null;
  fuseSurvivesPeak: boolean;
  fuseProtectsChannel: boolean;
  fuseCorrect: boolean;
  valid: boolean;
}

export interface ForgeEvaluation {
  machines: Record<ForgeMachineId, ForgeMachineEvaluation>;
  stock: Record<ChannelThickness, number>;
  stockOk: boolean;
  trunkRiver: number;
  trunkOk: boolean;
  valid: boolean;
}

export type ForgeDiagnosticCode =
  | 'incomplete'
  | 'hungry'
  | 'oversized-fuse'
  | 'unsafe-fuse'
  | 'trunk-overload'
  | 'stock';

export interface ForgeDiagnostic {
  code: ForgeDiagnosticCode;
  machineId?: ForgeMachineId;
}

export type ForgeAttemptEvent =
  | 'incomplete'
  | 'young-fuse'
  | 'red-warning'
  | 'cut'
  | 'channel-cut'
  | 'invalid'
  | 'solved';

export interface ForgeAttemptResult {
  state: ForgeState;
  evaluation: ForgeEvaluation;
  event: ForgeAttemptEvent;
  diagnostics: ForgeDiagnostic[];
  youngMachines: ForgeMachineId[];
  redMachines: ForgeMachineId[];
}

export function createForgeState(): ForgeState {
  return {
    push: 8,
    branches: {
      martillo: createBranch(),
      fuelle: createBranch(),
      lumbre: createBranch(),
    },
    solved: false,
  };
}

export function setForgePush(state: ForgeState, push: ForgePush): ForgeState {
  if (state.solved || hasCutChannel(state)) return state;
  return { ...state, push };
}

export function addForgeStone(
  state: ForgeState,
  machineId: ForgeMachineId,
  stone: ForgeStone,
): ForgeState {
  const branch = state.branches[machineId];
  if (state.solved || branch.channel.cut || branch.stones.length >= FORGE_MAX_STONES) {
    return state;
  }
  return replaceBranch(state, machineId, {
    ...branch,
    stones: [...branch.stones, stone],
  });
}

export function removeForgeStone(
  state: ForgeState,
  machineId: ForgeMachineId,
  stoneIndex: number,
): ForgeState {
  const branch = state.branches[machineId];
  if (
    state.solved ||
    branch.channel.cut ||
    stoneIndex < 0 ||
    stoneIndex >= branch.stones.length
  ) {
    return state;
  }
  return replaceBranch(state, machineId, {
    ...branch,
    stones: branch.stones.filter((_, index) => index !== stoneIndex),
  });
}

export function setForgeThickness(
  state: ForgeState,
  machineId: ForgeMachineId,
  thickness: ChannelThickness | null,
): ForgeState {
  const branch = state.branches[machineId];
  if (state.solved || branch.channel.cut || branch.thickness === thickness) return state;
  if (thickness !== null) {
    const released = replaceBranch(state, machineId, { ...branch, thickness: null });
    if (forgeChannelStock(released)[thickness] <= 0) return state;
  }
  return replaceBranch(state, machineId, { ...branch, thickness });
}

export function setForgeFuse(
  state: ForgeState,
  machineId: ForgeMachineId,
  fuse: ForgeFuse | null,
): ForgeState {
  const branch = state.branches[machineId];
  if (state.solved || branch.channel.cut) return state;
  return replaceBranch(state, machineId, { ...branch, fuse });
}

export function forgeChannelStock(
  state: ForgeState,
): Record<ChannelThickness, number> {
  const stock = { ...FORGE_CHANNEL_STOCK };
  for (const machineId of FORGE_MACHINE_IDS) {
    const thickness = state.branches[machineId].thickness;
    if (thickness !== null) stock[thickness]--;
  }
  return stock;
}

export function evaluateForge(state: ForgeState): ForgeEvaluation {
  const machines = {} as Record<ForgeMachineId, ForgeMachineEvaluation>;
  for (const machineId of FORGE_MACHINE_IDS) {
    machines[machineId] = evaluateMachine(state, machineId);
  }

  const stock = forgeChannelStock(state);
  const stockOk = Object.values(stock).every((available) => available >= 0);
  const trunkRiver = FORGE_MACHINE_IDS.reduce(
    (sum, machineId) => sum + machines[machineId].river,
    0,
  );
  const trunkOk = trunkRiver <= FORGE_TRUNK_TOLERANCE;

  return {
    machines,
    stock,
    stockOk,
    trunkRiver,
    trunkOk,
    valid:
      stockOk &&
      trunkOk &&
      FORGE_MACHINE_IDS.every((machineId) => machines[machineId].valid),
  };
}

export function attemptForge(state: ForgeState): ForgeAttemptResult {
  const evaluation = evaluateForge(state);
  const emptyResult = {
    evaluation,
    diagnostics: [] as ForgeDiagnostic[],
    youngMachines: [] as ForgeMachineId[],
    redMachines: [] as ForgeMachineId[],
  };

  if (hasCutChannel(state)) {
    return { ...emptyResult, state, event: 'channel-cut' };
  }

  const incompleteMachines = FORGE_MACHINE_IDS.filter((machineId) => {
    const branch = state.branches[machineId];
    return (
      branch.stones.length === 0 ||
      branch.thickness === null ||
      branch.fuse === null
    );
  });
  if (incompleteMachines.length > 0) {
    return {
      ...emptyResult,
      state,
      event: 'incomplete',
      diagnostics: incompleteMachines.map((machineId) => ({
        code: 'incomplete',
        machineId,
      })),
    };
  }

  const youngMachines = FORGE_MACHINE_IDS.filter(
    (machineId) => !evaluation.machines[machineId].fuseSurvivesPeak,
  );
  if (youngMachines.length > 0) {
    let next = state;
    for (const machineId of youngMachines) {
      next = replaceBranch(next, machineId, {
        ...next.branches[machineId],
        fuse: null,
      });
    }
    return {
      ...emptyResult,
      state: next,
      event: 'young-fuse',
      youngMachines,
    };
  }

  const redMachines = FORGE_MACHINE_IDS.filter(
    (machineId) => evaluation.machines[machineId].peakLevel === 'rojo',
  );
  if (redMachines.length > 0) {
    let next = state;
    for (const machineId of redMachines) {
      const branch = next.branches[machineId];
      next = replaceBranch(next, machineId, {
        ...branch,
        channel: advanceChannelCut(branch.channel, 'rojo'),
      });
    }
    return {
      ...emptyResult,
      state: next,
      event: redMachines.some((machineId) => next.branches[machineId].channel.cut)
        ? 'cut'
        : 'red-warning',
      redMachines,
    };
  }

  const diagnostics: ForgeDiagnostic[] = [];
  for (const machineId of FORGE_MACHINE_IDS) {
    const machine = evaluation.machines[machineId];
    if (!machine.exactDelivery) diagnostics.push({ code: 'hungry', machineId });
    if (!machine.fuseCorrect) {
      const fuse = state.branches[machineId].fuse;
      diagnostics.push({
        code:
          machine.fuseProtectsChannel && fuse !== machine.requiredFuse
            ? 'oversized-fuse'
            : 'unsafe-fuse',
        machineId,
      });
    }
  }
  if (!evaluation.trunkOk) diagnostics.push({ code: 'trunk-overload' });
  if (!evaluation.stockOk) diagnostics.push({ code: 'stock' });
  if (diagnostics.length > 0) {
    return { ...emptyResult, state, event: 'invalid', diagnostics };
  }

  return {
    ...emptyResult,
    state: { ...state, solved: true },
    event: 'solved',
  };
}

export function repairForgeChannel(
  state: ForgeState,
  machineId: ForgeMachineId,
): ForgeState {
  const branch = state.branches[machineId];
  if (!branch.channel.cut) return state;
  return replaceBranch(state, machineId, {
    ...branch,
    channel: { insistences: 0, cut: false },
  });
}

export function enumerateStoneRows(maxStones = FORGE_MAX_STONES): ForgeStone[][] {
  const rows: ForgeStone[][] = [[]];
  let frontier: ForgeStone[][] = [[]];
  for (let length = 1; length <= maxStones; length++) {
    const next: ForgeStone[][] = [];
    for (const row of frontier) {
      for (const stone of FORGE_STONES) next.push([...row, stone]);
    }
    rows.push(...next);
    frontier = next;
  }
  return rows;
}

function createBranch(): ForgeBranchState {
  return {
    stones: [],
    thickness: null,
    fuse: null,
    channel: { insistences: 0, cut: false },
  };
}

function evaluateMachine(
  state: ForgeState,
  machineId: ForgeMachineId,
): ForgeMachineEvaluation {
  const branch = state.branches[machineId];
  const targetDelivery = FORGE_MACHINE_TARGETS[machineId];
  const resistance = branch.stones.reduce(
    (sum, stone) => sum + PIEDRAS[stone].valor,
    0,
  );
  const river = resistance === 0 ? 0 : Math.floor(state.push / resistance);
  const peakRiver = river === 0 ? 0 : river + 1;
  const delivery = state.push * river;
  const exactDelivery = delivery === targetDelivery;
  const tolerance =
    branch.thickness === null ? null : CHANNEL_TOLERANCES[branch.thickness];
  const workLevel = tolerance === null ? 'frio' : heatLevel(river, tolerance);
  const peakLevel = tolerance === null ? 'frio' : heatLevel(peakRiver, tolerance);
  const channelWithinPeak = tolerance !== null && peakLevel !== 'rojo';
  const requiredFuse =
    FORGE_FUSES.find((rating) => rating >= peakRiver) ?? null;
  const fuseSurvivesPeak =
    branch.fuse !== null && peakRiver > 0 && branch.fuse >= peakRiver;
  const fuseProtectsChannel =
    branch.fuse !== null &&
    tolerance !== null &&
    branch.fuse <= tolerance * 1.5;
  const fuseCorrect =
    branch.fuse !== null &&
    branch.fuse === requiredFuse &&
    fuseProtectsChannel;
  const complete =
    branch.stones.length > 0 &&
    branch.thickness !== null &&
    branch.fuse !== null;

  return {
    targetDelivery,
    resistance,
    river,
    peakRiver,
    delivery,
    exactDelivery,
    workLevel,
    peakLevel,
    channelWithinPeak,
    requiredFuse,
    fuseSurvivesPeak,
    fuseProtectsChannel,
    fuseCorrect,
    valid:
      complete &&
      !branch.channel.cut &&
      exactDelivery &&
      channelWithinPeak &&
      fuseCorrect,
  };
}

function replaceBranch(
  state: ForgeState,
  machineId: ForgeMachineId,
  branch: ForgeBranchState,
): ForgeState {
  return {
    ...state,
    branches: { ...state.branches, [machineId]: branch },
  };
}

function hasCutChannel(state: ForgeState): boolean {
  return FORGE_MACHINE_IDS.some((machineId) => state.branches[machineId].channel.cut);
}
