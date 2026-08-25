/**
 * Renderer-agnostic systemic model for the complete Ohmdal Arco I greybox.
 *
 * This module intentionally contains no PlayCanvas, DOM or timing code.  The
 * runtime can project the returned values onto world objects while tests can
 * exercise the same causal model in isolation.  Progress flags are derived by
 * the evaluators below; there is no public "restore" setter.
 */

export const ARC1_GREYBOX_VERSION = 1 as const;

export type Arc1Region =
  | 'portal'
  | 'taller'
  | 'manantial'
  | 'plaza'
  | 'castillo'
  | 'forja'
  | 'terrazas'
  | 'faro'
  | 'retorno';

export type Arc1Event =
  | 'none'
  | 'region-entered'
  | 'region-locked'
  | 'manantial-measured'
  | 'manantial-gate-opened'
  | 'manantial-repaired'
  | 'manantial-protection-trip'
  | 'manantial-energized'
  | 'campana-pulled'
  | 'castle-gate-opened'
  | 'castle-measured'
  | 'castle-configured'
  | 'castle-protection-trip'
  | 'castle-repaired'
  | 'castle-energized'
  | 'castle-documented'
  | 'forge-terraces-measured'
  | 'forge-terraces-configured'
  | 'forge-terraces-protection-trip'
  | 'forge-terraces-repaired'
  | 'forge-terraces-energized'
  | 'forge-terraces-documented'
  | 'lighthouse-measured'
  | 'lighthouse-calibrated'
  | 'lighthouse-protection-trip'
  | 'lighthouse-repaired'
  | 'lighthouse-energized'
  | 'lighthouse-synchronized'
  | 'lighthouse-documented';

export type ManantialMeasurementPoint =
  | 'generator'
  | 'turbine'
  | 'return'
  | 'load';

export interface ManantialMeasurement {
  readonly point: ManantialMeasurementPoint;
  readonly instrument: 'galvanoscopio';
  readonly voltage: number;
  readonly current: number;
  readonly continuity: boolean;
  readonly flowRate: number;
  readonly usefulOutput: number;
  readonly gateOpen: boolean;
  readonly beforeRepair: boolean;
}

export interface ManantialState {
  readonly gateOpen: boolean;
  readonly returnBridgeInstalled: boolean;
  readonly excitationEnabled: boolean;
  readonly protectiveTrip: boolean;
  readonly measurements: readonly ManantialMeasurement[];
  readonly repairCount: number;
  readonly failedEnergizations: number;
}

export interface ManantialEvaluation {
  readonly generatorVoltage: number;
  readonly flowRate: number;
  readonly flowSufficient: boolean;
  readonly continuity: boolean;
  readonly excitation: boolean;
  readonly protectiveTrip: boolean;
  readonly usefulOutput: number;
  readonly measuredBeforeRepair: boolean;
  readonly measuredAfterRepair: boolean;
  readonly restored: boolean;
}

export interface PlazaState {
  /** A bell pull is an observable intervention, not a progression flag. */
  readonly bellPulls: number;
  /** This records a physical gate action; its validity is always rechecked. */
  readonly castleGateOpened: boolean;
}

export type CastleBranchId = 'district-a' | 'district-b' | 'district-c';
export type CastleBranchWiring = 'parallel' | 'series' | 'isolated';
export type CastleNetworkTopology = 'unwired' | 'parallel' | 'mixed' | 'series';
export type CastlePriority = 'essential' | 'support' | 'sacrificable';

export interface CastleBranchState {
  readonly wiring: CastleBranchWiring;
  readonly priority: CastlePriority;
  readonly protectionRating: number | null;
}

export interface CastleNetworkConfiguration {
  readonly topology: CastleNetworkTopology;
  readonly returnContinuity: boolean;
  readonly branches: Readonly<Record<CastleBranchId, CastleBranchState>>;
}

export interface CastleMeasurement {
  readonly instrument: 'galvanoscopio';
  readonly topology: CastleNetworkTopology;
  readonly topologySignature: string;
  readonly returnContinuity: boolean;
  readonly totalCurrent: number;
  readonly branchDelivery: Readonly<Record<CastleBranchId, number>>;
  readonly beforeEnergize: boolean;
}

export interface CastleState {
  readonly topology: CastleNetworkTopology;
  readonly returnContinuity: boolean;
  readonly branches: Readonly<Record<CastleBranchId, CastleBranchState>>;
  readonly measurements: readonly CastleMeasurement[];
  readonly documented: boolean;
  readonly energized: boolean;
  readonly protectiveTrip: boolean;
  readonly recoverableFaults: number;
  readonly repairs: number;
}

export type CastleConfigurationOutcome =
  | 'parallel-balanced'
  | 'mixed-priority'
  | 'invalid';

export interface CastleEvaluation {
  readonly topology: CastleNetworkTopology;
  readonly topologySignature: string;
  readonly totalCurrent: number;
  readonly totalPower: number;
  readonly branchDelivery: Readonly<Record<CastleBranchId, number>>;
  readonly essentialService: boolean;
  readonly fullService: boolean;
  readonly protectionsValid: boolean;
  readonly returnContinuity: boolean;
  readonly gateOpen: boolean;
  readonly maintenanceIsolation: boolean;
  readonly measuredCurrentConfiguration: boolean;
  readonly configuration: CastleConfigurationOutcome;
  readonly structurallyValid: boolean;
  readonly restored: boolean;
}

export type ForgeTerracesLoadId = 'forge' | 'terraces';
export type ForgeTerracesConductor = 'narrow' | 'medium' | 'wide';
export type ForgeTerracesTradeoff =
  | 'none'
  | 'balanced'
  | 'forge-priority'
  | 'terraces-priority';

export interface ForgeTerracesAllocation {
  readonly forge: number;
  readonly terraces: number;
}

export interface ForgeTerracesProtection {
  readonly forge: number | null;
  readonly terraces: number | null;
}

export interface ForgeTerracesMeasurement {
  readonly instrument: 'galvanoscopio';
  readonly allocation: ForgeTerracesAllocation;
  readonly totalCurrent: number;
  readonly totalPower: number;
  readonly heat: number;
  readonly tradeoff: ForgeTerracesTradeoff;
  readonly beforeEnergize: boolean;
}

export interface ForgeTerracesState {
  readonly allocation: ForgeTerracesAllocation;
  readonly conductor: ForgeTerracesConductor;
  readonly protection: ForgeTerracesProtection;
  readonly measurements: readonly ForgeTerracesMeasurement[];
  readonly documented: boolean;
  readonly energized: boolean;
  readonly protectiveTrip: boolean;
  readonly recoverableFaults: number;
  readonly repairs: number;
}

export interface ForgeTerracesEvaluation {
  readonly allocation: ForgeTerracesAllocation;
  readonly requestedCurrent: number;
  readonly allocatedCurrent: number;
  readonly availableCurrent: number;
  readonly totalPower: number;
  readonly heat: number;
  readonly conductorCapacity: number;
  readonly tradeoff: ForgeTerracesTradeoff;
  readonly powerWithinLimit: boolean;
  readonly heatWithinLimit: boolean;
  readonly protectionWithinLimit: boolean;
  readonly castleSupplyReady: boolean;
  readonly measuredCurrentAllocation: boolean;
  readonly structurallyValid: boolean;
  readonly restored: boolean;
}

export interface LighthouseCalibration {
  readonly voltageTrim: number;
  readonly phaseOffset: number;
}

export interface LighthouseMeasurement {
  readonly instrument: 'galvanoscopio';
  readonly sourceVoltage: number;
  readonly sourceCurrent: number;
  readonly sourcePower: number;
  readonly topologySignature: string;
  readonly powerBudget: number;
}

export interface LighthouseState {
  /** Arco I uses a validated DC culmination. */
  readonly mode: 'dc';
  readonly calibration: LighthouseCalibration | null;
  readonly measurements: readonly LighthouseMeasurement[];
  readonly synchronizationSamples: number;
  readonly documented: boolean;
  readonly energized: boolean;
  readonly protectiveTrip: boolean;
  readonly recoverableFaults: number;
  readonly repairs: number;
}

export interface LighthouseEvaluation {
  readonly mode: 'dc';
  readonly sourceVoltage: number;
  readonly sourceCurrent: number;
  readonly sourcePower: number;
  readonly calibratedVoltage: number;
  readonly topologyReused: boolean;
  readonly powerReused: boolean;
  readonly calibrationValid: boolean;
  readonly synchronizationValid: boolean;
  readonly structurallyValid: boolean;
  readonly restored: boolean;
}

export interface Arc1GreyboxState {
  readonly currentRegion: Arc1Region;
  readonly visitedRegions: readonly Arc1Region[];
  readonly returnedToPlaza: boolean;
  readonly finalReturnReached: boolean;
  readonly lastEvent: Arc1Event;
  readonly manantial: ManantialState;
  readonly plaza: PlazaState;
  readonly castle: CastleState;
  readonly forgeTerraces: ForgeTerracesState;
  readonly lighthouse: LighthouseState;
}

export interface Arc1Progress {
  readonly manantialRestored: boolean;
  readonly relayEnergized: boolean;
  readonly bellActivated: boolean;
  readonly castleGateOpen: boolean;
  readonly castleRestored: boolean;
  readonly forgeTerracesRestored: boolean;
  readonly lighthouseRestored: boolean;
  readonly arcComplete: boolean;
}

export interface Arc1GreyboxSnapshot {
  readonly version: typeof ARC1_GREYBOX_VERSION;
  readonly currentRegion: Arc1Region;
  readonly visitedRegions: Arc1Region[];
  readonly returnedToPlaza: boolean;
  readonly finalReturnReached: boolean;
  readonly lastEvent: Arc1Event;
  readonly progress: Arc1Progress;
  readonly manantial: ManantialState;
  readonly plaza: PlazaState;
  readonly castle: CastleState;
  readonly forgeTerraces: ForgeTerracesState;
  readonly lighthouse: LighthouseState;
}

export interface Arc1NavigationResult {
  readonly state: Arc1GreyboxState;
  readonly accepted: boolean;
  readonly region: Arc1Region;
}

export const MANANTIAL_SOURCE_VOLTAGE = 24;
export const MANANTIAL_NOMINAL_FLOW = 10;
export const MANANTIAL_MIN_FLOW = 8;
export const MANANTIAL_USEFUL_OUTPUT = 120;

export const CASTLE_SOURCE_CURRENT_LIMIT = 16;
export const CASTLE_SOURCE_VOLTAGE = MANANTIAL_SOURCE_VOLTAGE;
export const CASTLE_BRANCH_DEMAND: Readonly<Record<CastleBranchId, number>> = {
  'district-a': 2,
  'district-b': 3,
  'district-c': 1,
};

export const FORGE_TERRACES_SOURCE_VOLTAGE = CASTLE_SOURCE_VOLTAGE;
export const FORGE_TERRACES_REQUESTED_CURRENT = 10;
export const FORGE_TERRACES_MAX_CURRENT = 8;
export const FORGE_TERRACES_MIN_CURRENT: Readonly<Record<ForgeTerracesLoadId, number>> = {
  forge: 2,
  terraces: 2,
};
export const FORGE_TERRACES_CONDUCTOR_CAPACITY: Readonly<Record<ForgeTerracesConductor, number>> = {
  narrow: 4,
  medium: 8,
  wide: 12,
};
export const FORGE_TERRACES_MAX_HEAT = 24;

export const LIGHTHOUSE_TARGET_VOLTAGE = MANANTIAL_SOURCE_VOLTAGE;
export const LIGHTHOUSE_PHASE_TOLERANCE = 0;

const CASTLE_BRANCH_IDS: readonly CastleBranchId[] = [
  'district-a',
  'district-b',
  'district-c',
];

const ARC1_ROUTE: readonly Arc1Region[] = [
  'portal',
  'taller',
  'manantial',
  'plaza',
  'castillo',
  'forja',
  'terrazas',
  'faro',
  'retorno',
];

export function createArc1GreyboxState(): Arc1GreyboxState {
  return {
    currentRegion: 'portal',
    visitedRegions: ['portal'],
    returnedToPlaza: false,
    finalReturnReached: false,
    lastEvent: 'none',
    manantial: {
      gateOpen: false,
      returnBridgeInstalled: false,
      excitationEnabled: false,
      protectiveTrip: false,
      measurements: [],
      repairCount: 0,
      failedEnergizations: 0,
    },
    plaza: {
      bellPulls: 0,
      castleGateOpened: false,
    },
    castle: {
      topology: 'unwired',
      returnContinuity: false,
      branches: createDefaultCastleBranches(),
      measurements: [],
      documented: false,
      energized: false,
      protectiveTrip: false,
      recoverableFaults: 0,
      repairs: 0,
    },
    forgeTerraces: {
      allocation: { forge: 0, terraces: 0 },
      conductor: 'narrow',
      protection: { forge: null, terraces: null },
      measurements: [],
      documented: false,
      energized: false,
      protectiveTrip: false,
      recoverableFaults: 0,
      repairs: 0,
    },
    lighthouse: {
      mode: 'dc',
      calibration: null,
      measurements: [],
      synchronizationSamples: 0,
      documented: false,
      energized: false,
      protectiveTrip: false,
      recoverableFaults: 0,
      repairs: 0,
    },
  };
}

export function evaluateManantial(state: Arc1GreyboxState): ManantialEvaluation {
  const manantial = state.manantial;
  const flowRate = manantial.gateOpen ? MANANTIAL_NOMINAL_FLOW : 0;
  const flowSufficient = flowRate >= MANANTIAL_MIN_FLOW;
  const continuity = manantial.returnBridgeInstalled;
  const excitation = manantial.excitationEnabled;
  const usefulOutput =
    flowSufficient && continuity && excitation && !manantial.protectiveTrip
      ? MANANTIAL_USEFUL_OUTPUT
      : 0;
  const measuredBeforeRepair = manantial.measurements.some((measurement) => measurement.beforeRepair);
  const measuredAfterRepair = manantial.measurements.some((measurement) => !measurement.beforeRepair);
  return {
    generatorVoltage: MANANTIAL_SOURCE_VOLTAGE,
    flowRate,
    flowSufficient,
    continuity,
    excitation,
    protectiveTrip: manantial.protectiveTrip,
    usefulOutput,
    measuredBeforeRepair,
    measuredAfterRepair,
    restored:
      measuredBeforeRepair &&
      measuredAfterRepair &&
      flowSufficient &&
      continuity &&
      excitation &&
      !manantial.protectiveTrip &&
      usefulOutput > 0,
  };
}

export function isManantialRestored(state: Arc1GreyboxState): boolean {
  return evaluateManantial(state).restored;
}

export function measureManantial(
  state: Arc1GreyboxState,
  point: ManantialMeasurementPoint,
): Arc1GreyboxState {
  const evaluation = evaluateManantial(state);
  const measurement: ManantialMeasurement = {
    point,
    instrument: 'galvanoscopio',
    voltage: evaluation.generatorVoltage,
    current: evaluation.usefulOutput > 0 ? evaluation.usefulOutput / evaluation.generatorVoltage : 0,
    continuity: evaluation.continuity,
    flowRate: evaluation.flowRate,
    usefulOutput: evaluation.usefulOutput,
    gateOpen: state.manantial.gateOpen,
    beforeRepair: !state.manantial.returnBridgeInstalled,
  };
  return withEvent({
    ...state,
    manantial: {
      ...state.manantial,
      measurements: [...state.manantial.measurements, measurement],
    },
  }, 'manantial-measured');
}

export function setManantialGate(state: Arc1GreyboxState, open: boolean): Arc1GreyboxState {
  return withEvent({
    ...state,
    manantial: {
      ...state.manantial,
      gateOpen: open,
      excitationEnabled: open ? state.manantial.excitationEnabled : false,
    },
  }, open ? 'manantial-gate-opened' : 'none');
}

/**
 * Repairs the return path only after the player has taken an authentic
 * before-repair reading.  Calling it too early is a no-op, preserving the
 * diagnostic gate instead of granting a hidden repair.
 */
export function repairManantial(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!evaluateManantial(state).measuredBeforeRepair) {
    return state;
  }
  if (state.manantial.returnBridgeInstalled && !state.manantial.protectiveTrip) return state;
  return withEvent({
    ...state,
    manantial: {
      ...state.manantial,
      returnBridgeInstalled: true,
      protectiveTrip: false,
      repairCount: state.manantial.repairCount + 1,
    },
  }, 'manantial-repaired');
}

export function energizeManantial(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateManantial(state);
  if (
    !evaluation.flowSufficient ||
    !evaluation.continuity ||
    state.manantial.protectiveTrip ||
    !evaluation.measuredBeforeRepair
  ) {
    return withEvent({
      ...state,
      manantial: {
        ...state.manantial,
        excitationEnabled: false,
        protectiveTrip: true,
        failedEnergizations: state.manantial.failedEnergizations + 1,
      },
    }, 'manantial-protection-trip');
  }
  return withEvent({
    ...state,
    manantial: {
      ...state.manantial,
      excitationEnabled: true,
      protectiveTrip: false,
    },
  }, 'manantial-energized');
}

export function isRelayEnergized(state: Arc1GreyboxState): boolean {
  return isManantialRestored(state);
}

export function pullCampana(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!isRelayEnergized(state) || state.plaza.bellPulls > 0) return state;
  return withEvent({
    ...state,
    plaza: {
      ...state.plaza,
      bellPulls: state.plaza.bellPulls + 1,
    },
  }, 'campana-pulled');
}

export function isCastleOpeningReady(state: Arc1GreyboxState): boolean {
  return isRelayEnergized(state) && state.plaza.bellPulls > 0;
}

export function openCastleGate(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!isCastleOpeningReady(state)) return state;
  return withEvent({
    ...state,
    plaza: {
      ...state.plaza,
      castleGateOpened: true,
    },
  }, 'castle-gate-opened');
}

export function isCastleGateOpen(state: Arc1GreyboxState): boolean {
  return isManantialRestored(state) && state.plaza.castleGateOpened;
}

export function castleNetworkSignature(state: Arc1GreyboxState): string {
  const castle = state.castle;
  return [
    castle.topology,
    castle.returnContinuity ? 'return' : 'open-return',
    ...CASTLE_BRANCH_IDS.map((id) => {
      const branch = castle.branches[id];
      return `${id}:${branch.wiring}:${branch.priority}:${branch.protectionRating ?? 'none'}`;
    }),
  ].join('|');
}

export function evaluateCastleNetwork(state: Arc1GreyboxState): CastleEvaluation {
  const castle = state.castle;
  const topologySignature = castleNetworkSignature(state);
  const latestMeasurement = castle.measurements[castle.measurements.length - 1];
  const measuredCurrentConfiguration = latestMeasurement?.topologySignature === topologySignature;
  const gateOpen = isCastleGateOpen(state);
  const branchDelivery = castleBranchDelivery(castle);
  const totalCurrent = CASTLE_BRANCH_IDS.reduce(
    (sum, id) => sum + branchDelivery[id],
    0,
  );
  const protectionsValid = CASTLE_BRANCH_IDS.every((id) => {
    const branch = castle.branches[id];
    if (branch.wiring === 'isolated') return true;
    const rating = branch.protectionRating;
    const demand = CASTLE_BRANCH_DEMAND[id];
    return rating !== null && rating >= demand && rating <= demand + 5;
  });
  const essentialService = CASTLE_BRANCH_IDS.every((id) => {
    const branch = castle.branches[id];
    return branch.priority !== 'essential' || branchDelivery[id] >= CASTLE_BRANCH_DEMAND[id];
  });
  const fullService = CASTLE_BRANCH_IDS.every((id) => {
    const branch = castle.branches[id];
    return branch.wiring === 'isolated' || branchDelivery[id] >= CASTLE_BRANCH_DEMAND[id];
  });
  const parallelShape =
    castle.topology === 'parallel' &&
    CASTLE_BRANCH_IDS.every((id) => castle.branches[id].wiring === 'parallel');
  const mixedShape =
    castle.topology === 'mixed' &&
    castle.branches['district-a'].wiring === 'parallel' &&
    castle.branches['district-b'].wiring === 'parallel' &&
    castle.branches['district-c'].wiring === 'series' &&
    castle.branches['district-c'].priority !== 'essential';
  const seriesShape =
    castle.topology === 'series' &&
    CASTLE_BRANCH_IDS.every((id) => castle.branches[id].wiring === 'series');
  const shapeValid = parallelShape || mixedShape || seriesShape;
  const activeBranches = CASTLE_BRANCH_IDS.filter(
    (id) => castle.branches[id].wiring !== 'isolated',
  ).length;
  const structurallyValid =
    gateOpen &&
    castle.returnContinuity &&
    shapeValid &&
    activeBranches >= 2 &&
    totalCurrent <= CASTLE_SOURCE_CURRENT_LIMIT &&
    essentialService &&
    protectionsValid &&
    !castle.protectiveTrip;
  const configuration: CastleConfigurationOutcome = parallelShape && fullService
    ? 'parallel-balanced'
    : mixedShape && fullService
      ? 'mixed-priority'
      : 'invalid';
  return {
    topology: castle.topology,
    topologySignature,
    totalCurrent,
    totalPower: totalCurrent * CASTLE_SOURCE_VOLTAGE,
    branchDelivery,
    essentialService,
    fullService,
    protectionsValid,
    returnContinuity: castle.returnContinuity,
    gateOpen,
    maintenanceIsolation: parallelShape,
    measuredCurrentConfiguration,
    configuration,
    structurallyValid,
    restored:
      structurallyValid &&
      castle.energized &&
      measuredCurrentConfiguration &&
      castle.documented,
  };
}

export function isCastleRestored(state: Arc1GreyboxState): boolean {
  return evaluateCastleNetwork(state).restored;
}

export function configureCastleNetwork(
  state: Arc1GreyboxState,
  configuration: CastleNetworkConfiguration,
): Arc1GreyboxState {
  const branches = Object.fromEntries(
    CASTLE_BRANCH_IDS.map((id) => [id, { ...configuration.branches[id] }]),
  ) as Record<CastleBranchId, CastleBranchState>;
  return withEvent({
    ...state,
    castle: {
      ...state.castle,
      topology: configuration.topology,
      returnContinuity: configuration.returnContinuity,
      branches,
      documented: false,
      energized: false,
    },
  }, 'castle-configured');
}

export function setCastleTopology(
  state: Arc1GreyboxState,
  topology: CastleNetworkTopology,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    castle: { ...state.castle, topology, documented: false, energized: false },
  }, 'castle-configured');
}

export function setCastleReturnContinuity(
  state: Arc1GreyboxState,
  connected: boolean,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    castle: {
      ...state.castle,
      returnContinuity: connected,
      documented: false,
      energized: false,
    },
  }, 'castle-configured');
}

export function setCastleBranch(
  state: Arc1GreyboxState,
  branchId: CastleBranchId,
  branch: CastleBranchState,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    castle: {
      ...state.castle,
      branches: {
        ...state.castle.branches,
        [branchId]: { ...branch },
      },
      documented: false,
      energized: false,
    },
  }, 'castle-configured');
}

export function measureCastleNetwork(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateCastleNetwork(state);
  const measurement: CastleMeasurement = {
    instrument: 'galvanoscopio',
    topology: evaluation.topology,
    topologySignature: evaluation.topologySignature,
    returnContinuity: evaluation.returnContinuity,
    totalCurrent: evaluation.totalCurrent,
    branchDelivery: { ...evaluation.branchDelivery },
    beforeEnergize: !state.castle.energized,
  };
  return withEvent({
    ...state,
    castle: {
      ...state.castle,
      measurements: [...state.castle.measurements, measurement],
    },
  }, 'castle-measured');
}

export function energizeCastleNetwork(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateCastleNetwork(state);
  if (!evaluation.structurallyValid || !evaluation.measuredCurrentConfiguration) {
    return withEvent({
      ...state,
      castle: {
        ...state.castle,
        energized: false,
        protectiveTrip: true,
        recoverableFaults: state.castle.recoverableFaults + 1,
      },
    }, 'castle-protection-trip');
  }
  return withEvent({
    ...state,
    castle: { ...state.castle, energized: true, protectiveTrip: false },
  }, 'castle-energized');
}

export function repairCastleNetwork(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!state.castle.protectiveTrip) return state;
  return withEvent({
    ...state,
    castle: {
      ...state.castle,
      protectiveTrip: false,
      repairs: state.castle.repairs + 1,
    },
  }, 'castle-repaired');
}

export function documentCastleNetwork(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateCastleNetwork(state);
  if (!evaluation.structurallyValid || !evaluation.measuredCurrentConfiguration) return state;
  return withEvent({
    ...state,
    castle: { ...state.castle, documented: true },
  }, 'castle-documented');
}

export function evaluateForgeTerraces(state: Arc1GreyboxState): ForgeTerracesEvaluation {
  const forgeTerraces = state.forgeTerraces;
  const castle = evaluateCastleNetwork(state);
  const allocation = forgeTerraces.allocation;
  const latestMeasurement = forgeTerraces.measurements[forgeTerraces.measurements.length - 1];
  const measuredCurrentAllocation = latestMeasurement !== undefined &&
    latestMeasurement.allocation.forge === allocation.forge &&
    latestMeasurement.allocation.terraces === allocation.terraces;
  const allocatedCurrent = allocation.forge + allocation.terraces;
  const availableCurrent = Math.max(0, CASTLE_SOURCE_CURRENT_LIMIT - castle.totalCurrent);
  const totalPower = allocatedCurrent * FORGE_TERRACES_SOURCE_VOLTAGE;
  const heat = (allocation.forge * allocation.forge + allocation.terraces * allocation.terraces) * 0.5;
  const tradeoff = deriveForgeTerracesTradeoff(allocation);
  const conductorCapacity = FORGE_TERRACES_CONDUCTOR_CAPACITY[forgeTerraces.conductor];
  const powerWithinLimit = allocatedCurrent <= FORGE_TERRACES_MAX_CURRENT;
  const heatWithinLimit = heat <= FORGE_TERRACES_MAX_HEAT;
  const protectionWithinLimit = ([
    ['forge', allocation.forge, forgeTerraces.protection.forge],
    ['terraces', allocation.terraces, forgeTerraces.protection.terraces],
  ] as const).every(([, demand, protection]) => {
    return demand === 0 ? protection === null || protection >= 0 : protection !== null && protection >= demand && protection <= demand + 4;
  });
  const castleSupplyReady = castle.restored && availableCurrent >= allocatedCurrent;
  const minimumsMet = ([
    ['forge', allocation.forge],
    ['terraces', allocation.terraces],
  ] as const).every(([id, demand]) => demand >= FORGE_TERRACES_MIN_CURRENT[id]);
  const structurallyValid =
    castleSupplyReady &&
    minimumsMet &&
    tradeoff !== 'none' &&
    powerWithinLimit &&
    heatWithinLimit &&
    conductorCapacity >= allocatedCurrent &&
    protectionWithinLimit &&
    !forgeTerraces.protectiveTrip;
  return {
    allocation,
    requestedCurrent: FORGE_TERRACES_REQUESTED_CURRENT,
    allocatedCurrent,
    availableCurrent,
    totalPower,
    heat,
    conductorCapacity,
    tradeoff,
    powerWithinLimit,
    heatWithinLimit,
    protectionWithinLimit,
    castleSupplyReady,
    measuredCurrentAllocation,
    structurallyValid,
    restored:
      structurallyValid &&
      forgeTerraces.energized &&
      measuredCurrentAllocation &&
      forgeTerraces.documented,
  };
}

export function isForgeTerracesRestored(state: Arc1GreyboxState): boolean {
  return evaluateForgeTerraces(state).restored;
}

export function setForgeTerracesAllocation(
  state: Arc1GreyboxState,
  allocation: ForgeTerracesAllocation,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    forgeTerraces: {
      ...state.forgeTerraces,
      allocation: {
        forge: clamp(allocation.forge, 0, 5),
        terraces: clamp(allocation.terraces, 0, 5),
      },
      documented: false,
      energized: false,
    },
  }, 'forge-terraces-configured');
}

export function setForgeTerracesPriority(
  state: Arc1GreyboxState,
  priority: Exclude<ForgeTerracesTradeoff, 'none'>,
): Arc1GreyboxState {
  const allocation: ForgeTerracesAllocation = priority === 'forge-priority'
    ? { forge: 5, terraces: 3 }
    : priority === 'terraces-priority'
      ? { forge: 3, terraces: 5 }
      : { forge: 4, terraces: 4 };
  return setForgeTerracesAllocation(state, allocation);
}

export function setForgeTerracesConductor(
  state: Arc1GreyboxState,
  conductor: ForgeTerracesConductor,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    forgeTerraces: {
      ...state.forgeTerraces,
      conductor,
      documented: false,
      energized: false,
    },
  }, 'forge-terraces-configured');
}

export function setForgeTerracesProtection(
  state: Arc1GreyboxState,
  load: ForgeTerracesLoadId,
  rating: number | null,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    forgeTerraces: {
      ...state.forgeTerraces,
      protection: {
        ...state.forgeTerraces.protection,
        [load]: rating === null ? null : clamp(rating, 0, 12),
      },
      documented: false,
      energized: false,
    },
  }, 'forge-terraces-configured');
}

export function measureForgeTerraces(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateForgeTerraces(state);
  const measurement: ForgeTerracesMeasurement = {
    instrument: 'galvanoscopio',
    allocation: { ...evaluation.allocation },
    totalCurrent: evaluation.allocatedCurrent,
    totalPower: evaluation.totalPower,
    heat: evaluation.heat,
    tradeoff: evaluation.tradeoff,
    beforeEnergize: !state.forgeTerraces.energized,
  };
  return withEvent({
    ...state,
    forgeTerraces: {
      ...state.forgeTerraces,
      measurements: [...state.forgeTerraces.measurements, measurement],
    },
  }, 'forge-terraces-measured');
}

export function energizeForgeTerraces(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateForgeTerraces(state);
  if (!evaluation.structurallyValid || !evaluation.measuredCurrentAllocation) {
    return withEvent({
      ...state,
      forgeTerraces: {
        ...state.forgeTerraces,
        energized: false,
        protectiveTrip: true,
        recoverableFaults: state.forgeTerraces.recoverableFaults + 1,
      },
    }, 'forge-terraces-protection-trip');
  }
  return withEvent({
    ...state,
    forgeTerraces: { ...state.forgeTerraces, energized: true, protectiveTrip: false },
  }, 'forge-terraces-energized');
}

export function repairForgeTerraces(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!state.forgeTerraces.protectiveTrip) return state;
  return withEvent({
    ...state,
    forgeTerraces: {
      ...state.forgeTerraces,
      protectiveTrip: false,
      repairs: state.forgeTerraces.repairs + 1,
    },
  }, 'forge-terraces-repaired');
}

export function documentForgeTerraces(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateForgeTerraces(state);
  if (!evaluation.structurallyValid || !evaluation.measuredCurrentAllocation) return state;
  return withEvent({
    ...state,
    forgeTerraces: { ...state.forgeTerraces, documented: true },
  }, 'forge-terraces-documented');
}

export function evaluateLighthouse(state: Arc1GreyboxState): LighthouseEvaluation {
  const lighthouse = state.lighthouse;
  const manantial = evaluateManantial(state);
  const castle = evaluateCastleNetwork(state);
  const forgeTerraces = evaluateForgeTerraces(state);
  const latestMeasurement = lighthouse.measurements[lighthouse.measurements.length - 1];
  const sourceVoltage = latestMeasurement?.sourceVoltage ?? manantial.generatorVoltage;
  const sourceCurrent = latestMeasurement?.sourceCurrent ?? 0;
  const sourcePower = latestMeasurement?.sourcePower ?? 0;
  const calibratedVoltage = sourceVoltage + (lighthouse.calibration?.voltageTrim ?? 0);
  const topologyReused = latestMeasurement?.topologySignature === castle.topologySignature;
  const powerReused = latestMeasurement?.powerBudget === forgeTerraces.totalPower;
  const calibrationValid =
    lighthouse.calibration !== null &&
    Math.abs(calibratedVoltage - LIGHTHOUSE_TARGET_VOLTAGE) <= 1 &&
    sourcePower > 0 &&
    sourcePower <= CASTLE_SOURCE_CURRENT_LIMIT * CASTLE_SOURCE_VOLTAGE;
  const synchronizationValid =
    lighthouse.synchronizationSamples >= 2 &&
    lighthouse.calibration?.phaseOffset === LIGHTHOUSE_PHASE_TOLERANCE;
  const structurallyValid =
    lighthouse.mode === 'dc' &&
    forgeTerraces.restored &&
    manantial.restored &&
    castle.restored &&
    lighthouse.measurements.length > 0 &&
    topologyReused &&
    powerReused &&
    calibrationValid &&
    synchronizationValid &&
    !lighthouse.protectiveTrip;
  return {
    mode: lighthouse.mode,
    sourceVoltage,
    sourceCurrent,
    sourcePower,
    calibratedVoltage,
    topologyReused,
    powerReused,
    calibrationValid,
    synchronizationValid,
    structurallyValid,
    restored:
      structurallyValid &&
      lighthouse.energized &&
      lighthouse.documented,
  };
}

export function isLighthouseRestored(state: Arc1GreyboxState): boolean {
  return evaluateLighthouse(state).restored;
}

export function measureLighthouse(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!isForgeTerracesRestored(state)) return state;
  const castle = evaluateCastleNetwork(state);
  const forgeTerraces = evaluateForgeTerraces(state);
  const measurement: LighthouseMeasurement = {
    instrument: 'galvanoscopio',
    sourceVoltage: FORGE_TERRACES_SOURCE_VOLTAGE,
    sourceCurrent: forgeTerraces.allocatedCurrent,
    sourcePower: forgeTerraces.totalPower,
    topologySignature: castle.topologySignature,
    powerBudget: forgeTerraces.totalPower,
  };
  return withEvent({
    ...state,
    lighthouse: {
      ...state.lighthouse,
      measurements: [...state.lighthouse.measurements, measurement],
    },
  }, 'lighthouse-measured');
}

export function calibrateLighthouse(
  state: Arc1GreyboxState,
  calibration: LighthouseCalibration,
): Arc1GreyboxState {
  return withEvent({
    ...state,
    lighthouse: {
      ...state.lighthouse,
      calibration: {
        voltageTrim: clamp(calibration.voltageTrim, -12, 12),
        phaseOffset: clamp(calibration.phaseOffset, -4, 4),
      },
      synchronizationSamples: 0,
      documented: false,
      energized: false,
    },
  }, 'lighthouse-calibrated');
}

export function energizeLighthouse(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateLighthouse(state);
  if (!evaluation.calibrationValid || !evaluation.topologyReused || !evaluation.powerReused) {
    return withEvent({
      ...state,
      lighthouse: {
        ...state.lighthouse,
        energized: false,
        protectiveTrip: true,
        recoverableFaults: state.lighthouse.recoverableFaults + 1,
      },
    }, 'lighthouse-protection-trip');
  }
  return withEvent({
    ...state,
    lighthouse: { ...state.lighthouse, energized: true, protectiveTrip: false },
  }, 'lighthouse-energized');
}

export function synchronizeLighthouse(
  state: Arc1GreyboxState,
  observedPhase = LIGHTHOUSE_PHASE_TOLERANCE,
): Arc1GreyboxState {
  const evaluation = evaluateLighthouse(state);
  if (
    !state.lighthouse.energized ||
    !evaluation.calibrationValid ||
    Math.abs(observedPhase - LIGHTHOUSE_PHASE_TOLERANCE) > LIGHTHOUSE_PHASE_TOLERANCE
  ) {
    return withEvent({
      ...state,
      lighthouse: {
        ...state.lighthouse,
        protectiveTrip: true,
        recoverableFaults: state.lighthouse.recoverableFaults + 1,
      },
    }, 'lighthouse-protection-trip');
  }
  return withEvent({
    ...state,
    lighthouse: {
      ...state.lighthouse,
      synchronizationSamples: state.lighthouse.synchronizationSamples + 1,
    },
  }, 'lighthouse-synchronized');
}

export function repairLighthouse(state: Arc1GreyboxState): Arc1GreyboxState {
  if (!state.lighthouse.protectiveTrip) return state;
  return withEvent({
    ...state,
    lighthouse: {
      ...state.lighthouse,
      protectiveTrip: false,
      repairs: state.lighthouse.repairs + 1,
    },
  }, 'lighthouse-repaired');
}

export function documentLighthouse(state: Arc1GreyboxState): Arc1GreyboxState {
  const evaluation = evaluateLighthouse(state);
  if (!evaluation.structurallyValid) return state;
  return withEvent({
    ...state,
    lighthouse: { ...state.lighthouse, documented: true },
  }, 'lighthouse-documented');
}

export function getArc1Progress(state: Arc1GreyboxState): Arc1Progress {
  const manantialRestored = isManantialRestored(state);
  const relayEnergized = manantialRestored;
  const bellActivated = relayEnergized && state.plaza.bellPulls > 0;
  const castleGateOpen = bellActivated && state.plaza.castleGateOpened;
  const castleRestored = castleGateOpen && isCastleRestored(state);
  const forgeTerracesRestored = castleRestored && isForgeTerracesRestored(state);
  const lighthouseRestored = forgeTerracesRestored && isLighthouseRestored(state);
  const arcComplete =
    lighthouseRestored &&
    state.finalReturnReached &&
    state.returnedToPlaza &&
    ARC1_ROUTE.every((region) => state.visitedRegions.includes(region));
  return {
    manantialRestored,
    relayEnergized,
    bellActivated,
    castleGateOpen,
    castleRestored,
    forgeTerracesRestored,
    lighthouseRestored,
    arcComplete,
  };
}

export const arc1Progress = getArc1Progress;

export function isArcComplete(state: Arc1GreyboxState): boolean {
  return getArc1Progress(state).arcComplete;
}

export function canEnterArc1Region(state: Arc1GreyboxState, region: Arc1Region): boolean {
  if (region === state.currentRegion) return true;
  switch (region) {
    case 'portal':
      return state.currentRegion === 'retorno' && isLighthouseRestored(state);
    case 'taller':
      return state.currentRegion === 'portal' || state.visitedRegions.includes('taller');
    case 'manantial':
      return state.visitedRegions.includes('taller');
    case 'plaza':
      return isManantialRestored(state) && state.visitedRegions.includes('manantial');
    case 'castillo':
      return isCastleGateOpen(state) && state.visitedRegions.includes('plaza');
    case 'forja':
      return isCastleRestored(state) && state.visitedRegions.includes('castillo');
    case 'terrazas':
      return isCastleRestored(state) && state.visitedRegions.includes('forja');
    case 'faro':
      return isForgeTerracesRestored(state) && state.visitedRegions.includes('terrazas');
    case 'retorno':
      return isLighthouseRestored(state) && state.visitedRegions.includes('faro');
  }
}

export function enterArc1Region(
  state: Arc1GreyboxState,
  region: Arc1Region,
): Arc1GreyboxState {
  return tryEnterArc1Region(state, region).state;
}

export function tryEnterArc1Region(
  state: Arc1GreyboxState,
  region: Arc1Region,
): Arc1NavigationResult {
  if (!canEnterArc1Region(state, region)) {
    return {
      state: withEvent(state, 'region-locked'),
      accepted: false,
      region,
    };
  }
  const finalReturnReached =
    region === 'portal' && state.currentRegion === 'retorno' && isLighthouseRestored(state)
      ? true
      : state.finalReturnReached;
  const visitedRegions = state.visitedRegions.includes(region)
    ? [...state.visitedRegions]
    : [...state.visitedRegions, region];
  const returnedToPlaza = state.returnedToPlaza ||
    (region === 'plaza' && state.visitedRegions.includes('manantial'));
  return {
    state: withEvent({
      ...state,
      currentRegion: region,
      visitedRegions,
      returnedToPlaza,
      finalReturnReached,
    }, 'region-entered'),
    accepted: true,
    region,
  };
}

export function snapshotArc1Greybox(state: Arc1GreyboxState): Arc1GreyboxSnapshot {
  return {
    version: ARC1_GREYBOX_VERSION,
    currentRegion: state.currentRegion,
    visitedRegions: [...state.visitedRegions],
    returnedToPlaza: state.returnedToPlaza,
    finalReturnReached: state.finalReturnReached,
    lastEvent: state.lastEvent,
    progress: { ...getArc1Progress(state) },
    manantial: {
      ...state.manantial,
      measurements: state.manantial.measurements.map((measurement) => ({ ...measurement })),
    },
    plaza: { ...state.plaza },
    castle: {
      ...state.castle,
      branches: Object.fromEntries(
        CASTLE_BRANCH_IDS.map((id) => [id, { ...state.castle.branches[id] }]),
      ) as Record<CastleBranchId, CastleBranchState>,
      measurements: state.castle.measurements.map((measurement) => ({
        ...measurement,
        branchDelivery: { ...measurement.branchDelivery },
      })),
    },
    forgeTerraces: {
      ...state.forgeTerraces,
      allocation: { ...state.forgeTerraces.allocation },
      protection: { ...state.forgeTerraces.protection },
      measurements: state.forgeTerraces.measurements.map((measurement) => ({
        ...measurement,
        allocation: { ...measurement.allocation },
      })),
    },
    lighthouse: {
      ...state.lighthouse,
      calibration: state.lighthouse.calibration ? { ...state.lighthouse.calibration } : null,
      measurements: state.lighthouse.measurements.map((measurement) => ({ ...measurement })),
    },
  };
}

export const snapshotArc1 = snapshotArc1Greybox;

export function serializeArc1GreyboxState(state: Arc1GreyboxState): string {
  return JSON.stringify(snapshotArc1Greybox(state));
}

function createDefaultCastleBranches(): Record<CastleBranchId, CastleBranchState> {
  return {
    'district-a': { wiring: 'isolated', priority: 'essential', protectionRating: null },
    'district-b': { wiring: 'isolated', priority: 'essential', protectionRating: null },
    'district-c': { wiring: 'isolated', priority: 'support', protectionRating: null },
  };
}

function castleBranchDelivery(
  castle: CastleState,
): Record<CastleBranchId, number> {
  const connected = CASTLE_BRANCH_IDS.filter((id) => castle.branches[id].wiring !== 'isolated');
  if (connected.length === 0 || castle.topology === 'unwired') {
    return { 'district-a': 0, 'district-b': 0, 'district-c': 0 };
  }
  if (castle.topology === 'series') {
    const seriesCurrent = Math.min(...connected.map((id) => CASTLE_BRANCH_DEMAND[id]));
    return {
      'district-a': castle.branches['district-a'].wiring === 'isolated' ? 0 : seriesCurrent,
      'district-b': castle.branches['district-b'].wiring === 'isolated' ? 0 : seriesCurrent,
      'district-c': castle.branches['district-c'].wiring === 'isolated' ? 0 : seriesCurrent,
    };
  }
  return {
    'district-a': castle.branches['district-a'].wiring === 'isolated' ? 0 : CASTLE_BRANCH_DEMAND['district-a'],
    'district-b': castle.branches['district-b'].wiring === 'isolated' ? 0 : CASTLE_BRANCH_DEMAND['district-b'],
    'district-c': castle.branches['district-c'].wiring === 'isolated' ? 0 : CASTLE_BRANCH_DEMAND['district-c'],
  };
}

function deriveForgeTerracesTradeoff(
  allocation: ForgeTerracesAllocation,
): ForgeTerracesTradeoff {
  const requestedForge = 5 - allocation.forge;
  const requestedTerraces = 5 - allocation.terraces;
  if (allocation.forge === 0 && allocation.terraces === 0) return 'none';
  if (requestedForge === requestedTerraces) return 'balanced';
  return requestedForge < requestedTerraces ? 'forge-priority' : 'terraces-priority';
}

function withEvent(state: Arc1GreyboxState, lastEvent: Arc1Event): Arc1GreyboxState {
  return { ...state, lastEvent };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
