/**
 * Versioned, renderer-agnostic Arc I campaign persistence.
 *
 * This module deliberately stores source inputs only.  Circuit node values,
 * branch currents/power and Arc I progress are derived at runtime and are
 * therefore reconstructed instead of being accepted from a save file.
 */

import type { CircuitState, RumorStatus } from '../../../ohmdal-plaza/types.ts';
import { BitacoraManager } from '../../../ohmdal-plaza/journal/bitacora.ts';
import {
  ARC1_ROUTE,
  type Arc1Event,
  type Arc1GreyboxState,
  type Arc1Region,
  type CastleBranchId,
  type CastleBranchState,
  type CastleMeasurement,
  type ForgeTerracesMeasurement,
  type LighthouseMeasurement,
  type ManantialMeasurement,
  createArc1GreyboxState,
  isArcComplete,
  isLighthouseRestored,
} from './arc1GreyboxModel.ts';

export const ARC1_SAVE_SCHEMA = 'ohmdal-playcanvas-arc1' as const;
export const ARC1_SAVE_VERSION = 1 as const;
export const ARC1_SAVE_STORAGE_KEY = 'ohmdal-playcanvas-arc1-v1' as const;

/** Keep malformed or unbounded browser data from reaching the model. */
export const ARC1_SAVE_MAX_SERIALIZED_LENGTH = 256 * 1024;
export const ARC1_SAVE_MAX_MEASUREMENTS = 128;
export const ARC1_SAVE_MAX_COVERED_IDS = 3;
export const ARC1_SAVE_MAX_IDENTIFIER_LENGTH = 160;

export type Arc1StoryStep =
  | 'portal_arrived'
  | 'ohm_awakened'
  | 'edda_surprised'
  | 'invited_to_workshop'
  | 'inside_workshop'
  | 'tools_received'
  | 'returned_to_plaza'
  | 'circuit_solved'
  | 'gate_opened'
  | 'inside_manantial'
  | 'manantial_restored'
  | 'restored_plaza'
  | 'inside_castle'
  | 'castle_restored'
  | 'inside_forge_terraces'
  | 'forge_terraces_restored'
  | 'inside_lighthouse'
  | 'lighthouse_restored'
  | 'returning'
  | 'arc1_complete';

/** Runtime zones are named after authored PlayCanvas zone ids. */
export type Arc1SafeZone =
  | 'plaza'
  | 'workshop'
  | 'manantial'
  | 'castle'
  | 'forge-terraces'
  | 'lighthouse';

/**
 * Only authored transition destinations are legal resume locations.  A raw
 * player position is intentionally not part of the save contract.
 */
export type Arc1SafeAnchorId =
  | 'portal-to-plaza'
  | 'plaza-to-workshop'
  | 'workshop-to-plaza'
  | 'plaza-to-manantial'
  | 'manantial-to-plaza'
  | 'plaza-to-castle'
  | 'castle-to-plaza'
  | 'castle-to-forge-terraces'
  | 'forge-terraces-to-castle'
  | 'forge-terraces-to-lighthouse'
  | 'lighthouse-to-forge-terraces';

export interface Arc1SafeAnchor {
  readonly zone: Arc1SafeZone;
  readonly anchorId: Arc1SafeAnchorId;
}

export type Arc1RelaySwitchState = 'open' | 'closed';
export type Arc1ReturnBridgeState = 'open' | 'closed';
export type Arc1CorrosionState = 'corroded' | 'closed';

/**
 * Whitelist of the mutable CircuitState inputs.  The graph, node voltages,
 * branch currents/power and solver flags are rebuilt from the canonical
 * circuit baseline by the runtime.
 */
export interface Arc1CircuitSaveData {
  readonly branches: {
    readonly b_ida_rele: Arc1RelaySwitchState;
    readonly b_brecha_retorno: Arc1ReturnBridgeState;
    readonly b_brecha_a_oxido: {
      readonly state: Arc1CorrosionState;
      readonly resistance: number;
    };
  };
}

export interface Arc1InventorySaveData {
  readonly jumper: boolean;
  readonly brush: boolean;
}

/** Optional forward-compatible seam for the B2 continuity puzzle. */
export interface Arc1B2SaveData {
  readonly coveredIds: readonly string[];
}

/**
 * Complete source state needed to resume Arc I.  There is intentionally no
 * derived `progress` member: callers can run the model evaluators after
 * hydration.
 */
export interface Arc1SaveData {
  readonly schema: typeof ARC1_SAVE_SCHEMA;
  readonly version: typeof ARC1_SAVE_VERSION;
  readonly storyStep: Arc1StoryStep;
  readonly ohmAwake: boolean;
  readonly inventory: Arc1InventorySaveData;
  readonly arc1: Arc1GreyboxState;
  readonly circuit: Arc1CircuitSaveData;
  readonly bitacora: Readonly<Record<string, RumorStatus>>;
  readonly safeAnchor: Arc1SafeAnchor;
  readonly b2?: Arc1B2SaveData;
}

export interface Arc1SaveInput {
  readonly storyStep: Arc1StoryStep;
  readonly ohmAwake: boolean;
  readonly inventory: Arc1InventorySaveData;
  readonly arc1: Arc1GreyboxState;
  readonly circuit: Arc1CircuitSaveData;
  readonly bitacora: Readonly<Record<string, RumorStatus>>;
  readonly safeAnchor: Arc1SafeAnchor;
  readonly b2?: Arc1B2SaveData;
}

/** A small Storage-like seam lets the runtime handle privacy/quota failures. */
export interface Arc1SaveStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const ARC1_EVENTS: readonly Arc1Event[] = [
  'none',
  'region-entered',
  'region-locked',
  'manantial-measured',
  'manantial-gate-opened',
  'manantial-repaired',
  'manantial-protection-trip',
  'manantial-energized',
  'campana-pulled',
  'castle-gate-opened',
  'castle-measured',
  'castle-configured',
  'castle-protection-trip',
  'castle-repaired',
  'castle-energized',
  'castle-documented',
  'forge-terraces-measured',
  'forge-terraces-configured',
  'forge-terraces-protection-trip',
  'forge-terraces-repaired',
  'forge-terraces-energized',
  'forge-terraces-documented',
  'lighthouse-measured',
  'lighthouse-calibrated',
  'lighthouse-protection-trip',
  'lighthouse-repaired',
  'lighthouse-energized',
  'lighthouse-synchronized',
  'lighthouse-documented',
];

const ARC1_STORY_STEPS: readonly Arc1StoryStep[] = [
  'portal_arrived',
  'ohm_awakened',
  'edda_surprised',
  'invited_to_workshop',
  'inside_workshop',
  'tools_received',
  'returned_to_plaza',
  'circuit_solved',
  'gate_opened',
  'inside_manantial',
  'manantial_restored',
  'restored_plaza',
  'inside_castle',
  'castle_restored',
  'inside_forge_terraces',
  'forge_terraces_restored',
  'inside_lighthouse',
  'lighthouse_restored',
  'returning',
  'arc1_complete',
];

const ARC1_SAFE_ANCHOR_ZONES: Readonly<Record<Arc1SafeAnchorId, Arc1SafeZone>> = {
  'portal-to-plaza': 'plaza',
  'plaza-to-workshop': 'workshop',
  'workshop-to-plaza': 'plaza',
  'plaza-to-manantial': 'manantial',
  'manantial-to-plaza': 'plaza',
  'plaza-to-castle': 'castle',
  'castle-to-plaza': 'plaza',
  'castle-to-forge-terraces': 'forge-terraces',
  'forge-terraces-to-castle': 'castle',
  'forge-terraces-to-lighthouse': 'lighthouse',
  'lighthouse-to-forge-terraces': 'forge-terraces',
};

const CASTLE_BRANCH_IDS: readonly CastleBranchId[] = [
  'district-a',
  'district-b',
  'district-c',
];

const ARC1_REGIONS: readonly Arc1Region[] = [...ARC1_ROUTE];
const CASTLE_TOPOLOGIES = ['unwired', 'parallel', 'mixed', 'series'] as const;
const CASTLE_WIRINGS = ['parallel', 'series', 'isolated'] as const;
const CASTLE_PRIORITIES = ['essential', 'support', 'sacrificable'] as const;
const MANANTIAL_POINTS = ['generator', 'turbine', 'return', 'load'] as const;
const FORGE_CONDUCTORS = ['narrow', 'medium', 'wide'] as const;
const FORGE_TRADEOFFS = ['none', 'balanced', 'forge-priority', 'terraces-priority'] as const;
const FORGE_LOADS = ['forge', 'terraces'] as const;
const RUMOR_STATUSES = ['unknown', 'rumor', 'investigating', 'discovered'] as const;

const MAX_NUMERIC_VALUE = 1_000_000;
const MAX_COUNTER = 1_000_000;
const MAX_TEXT_LENGTH = 512;
const RAW_CORROSION_RESISTANCE = 2400;
const CLEAN_CORROSION_RESISTANCE = 0.05;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const allowed = new Set([...required, ...optional]);
  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    && Object.keys(value).every((key) => allowed.has(key));
}

function isOneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.includes(value as T);
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readNumber(value: unknown, minimum = -MAX_NUMERIC_VALUE, maximum = MAX_NUMERIC_VALUE): number | null {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum
    ? value
    : null;
}

function readInteger(value: unknown, minimum = 0, maximum = MAX_COUNTER): number | null {
  const number = readNumber(value, minimum, maximum);
  return number !== null && Number.isInteger(number) ? number : null;
}

function readText(value: unknown, maximum = MAX_TEXT_LENGTH): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= maximum ? value : null;
}

function readBoundedIdentifier(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > ARC1_SAVE_MAX_IDENTIFIER_LENGTH) return null;
  return /^[A-Za-z0-9:_-]+$/.test(value) ? value : null;
}

function readArray<T>(value: unknown, maximum: number, item: (value: unknown) => T | null): T[] | null {
  if (!Array.isArray(value) || value.length > maximum) return null;
  const result: T[] = [];
  for (const entry of value) {
    const safeEntry = item(entry);
    if (safeEntry === null) return null;
    result.push(safeEntry);
  }
  return result;
}

function readOptionalNumber(value: unknown, minimum: number, maximum: number): number | null | undefined {
  return value === null ? null : readNumber(value, minimum, maximum) ?? undefined;
}

function sanitizeManantialMeasurement(value: unknown): ManantialMeasurement | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'point', 'instrument', 'voltage', 'current', 'continuity', 'flowRate',
    'usefulOutput', 'gateOpen', 'beforeRepair',
  ])) return null;
  const point = isOneOf(entry.point, MANANTIAL_POINTS) ? entry.point : null;
  const instrument = entry.instrument === 'galvanoscopio' ? entry.instrument : null;
  const voltage = readNumber(entry.voltage, 0);
  const current = readNumber(entry.current, 0);
  const continuity = readBoolean(entry.continuity);
  const flowRate = readNumber(entry.flowRate, 0);
  const usefulOutput = readNumber(entry.usefulOutput, 0);
  const gateOpen = readBoolean(entry.gateOpen);
  const beforeRepair = readBoolean(entry.beforeRepair);
  if (point === null || instrument === null || voltage === null || current === null
    || continuity === null || flowRate === null || usefulOutput === null
    || gateOpen === null || beforeRepair === null) return null;
  return { point, instrument, voltage, current, continuity, flowRate, usefulOutput, gateOpen, beforeRepair };
}

function sanitizeManantial(value: unknown): Arc1GreyboxState['manantial'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'gateOpen', 'returnBridgeInstalled', 'excitationEnabled', 'protectiveTrip',
    'measurements', 'repairCount', 'failedEnergizations',
  ])) return null;
  const gateOpen = readBoolean(entry.gateOpen);
  const returnBridgeInstalled = readBoolean(entry.returnBridgeInstalled);
  const excitationEnabled = readBoolean(entry.excitationEnabled);
  const protectiveTrip = readBoolean(entry.protectiveTrip);
  const measurements = readArray(entry.measurements, ARC1_SAVE_MAX_MEASUREMENTS, sanitizeManantialMeasurement);
  const repairCount = readInteger(entry.repairCount);
  const failedEnergizations = readInteger(entry.failedEnergizations);
  if (gateOpen === null || returnBridgeInstalled === null || excitationEnabled === null
    || protectiveTrip === null || measurements === null || repairCount === null
    || failedEnergizations === null) return null;
  return { gateOpen, returnBridgeInstalled, excitationEnabled, protectiveTrip, measurements, repairCount, failedEnergizations };
}

function sanitizeCastleBranch(value: unknown): CastleBranchState | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, ['wiring', 'priority', 'protectionRating'])) return null;
  const wiring = isOneOf(entry.wiring, CASTLE_WIRINGS) ? entry.wiring : null;
  const priority = isOneOf(entry.priority, CASTLE_PRIORITIES) ? entry.priority : null;
  const protectionRating = readOptionalNumber(entry.protectionRating, 0, 12);
  if (wiring === null || priority === null || protectionRating === undefined) return null;
  return { wiring, priority, protectionRating };
}

function sanitizeCastleBranches(value: unknown): Record<CastleBranchId, CastleBranchState> | null {
  const branches = isRecord(value) ? value : null;
  if (!branches || !hasExactKeys(branches, CASTLE_BRANCH_IDS)) return null;
  const result = {} as Record<CastleBranchId, CastleBranchState>;
  for (const id of CASTLE_BRANCH_IDS) {
    const branch = sanitizeCastleBranch(branches[id]);
    if (branch === null) return null;
    result[id] = branch;
  }
  return result;
}

function sanitizeCastleMeasurement(value: unknown): CastleMeasurement | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'instrument', 'topology', 'topologySignature', 'returnContinuity',
    'totalCurrent', 'branchDelivery', 'beforeEnergize',
  ])) return null;
  const instrument = entry.instrument === 'galvanoscopio' ? entry.instrument : null;
  const topology = isOneOf(entry.topology, CASTLE_TOPOLOGIES) ? entry.topology : null;
  const topologySignature = readText(entry.topologySignature);
  const returnContinuity = readBoolean(entry.returnContinuity);
  const totalCurrent = readNumber(entry.totalCurrent, 0);
  const beforeEnergize = readBoolean(entry.beforeEnergize);
  const deliveries = isRecord(entry.branchDelivery) && hasExactKeys(entry.branchDelivery, CASTLE_BRANCH_IDS)
    ? entry.branchDelivery
    : null;
  const branchDelivery = deliveries === null
    ? null
    : (() => {
      const result = {} as Record<CastleBranchId, number>;
      for (const id of CASTLE_BRANCH_IDS) {
        const delivery = readNumber(deliveries[id], 0);
        if (delivery === null) return null;
        result[id] = delivery;
      }
      return result;
    })();
  if (instrument === null || topology === null || topologySignature === null
    || returnContinuity === null || totalCurrent === null || branchDelivery === null
    || beforeEnergize === null) return null;
  return { instrument, topology, topologySignature, returnContinuity, totalCurrent, branchDelivery, beforeEnergize };
}

function sanitizeCastle(value: unknown): Arc1GreyboxState['castle'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'topology', 'returnContinuity', 'branches', 'measurements', 'documented',
    'energized', 'protectiveTrip', 'recoverableFaults', 'repairs',
  ])) return null;
  const topology = isOneOf(entry.topology, CASTLE_TOPOLOGIES) ? entry.topology : null;
  const returnContinuity = readBoolean(entry.returnContinuity);
  const branches = sanitizeCastleBranches(entry.branches);
  const measurements = readArray(entry.measurements, ARC1_SAVE_MAX_MEASUREMENTS, sanitizeCastleMeasurement);
  const documented = readBoolean(entry.documented);
  const energized = readBoolean(entry.energized);
  const protectiveTrip = readBoolean(entry.protectiveTrip);
  const recoverableFaults = readInteger(entry.recoverableFaults);
  const repairs = readInteger(entry.repairs);
  if (topology === null || returnContinuity === null || branches === null || measurements === null
    || documented === null || energized === null || protectiveTrip === null
    || recoverableFaults === null || repairs === null) return null;
  return { topology, returnContinuity, branches, measurements, documented, energized, protectiveTrip, recoverableFaults, repairs };
}

function sanitizeForgeAllocation(value: unknown): Arc1GreyboxState['forgeTerraces']['allocation'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, ['forge', 'terraces'])) return null;
  const forge = readNumber(entry.forge, 0, 5);
  const terraces = readNumber(entry.terraces, 0, 5);
  if (forge === null || terraces === null) return null;
  return { forge, terraces };
}

function sanitizeForgeProtection(value: unknown): Arc1GreyboxState['forgeTerraces']['protection'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, FORGE_LOADS)) return null;
  const forge = readOptionalNumber(entry.forge, 0, 12);
  const terraces = readOptionalNumber(entry.terraces, 0, 12);
  if (forge === undefined || terraces === undefined) return null;
  return { forge, terraces };
}

function sanitizeForgeMeasurement(value: unknown): ForgeTerracesMeasurement | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'instrument', 'allocation', 'totalCurrent', 'totalPower', 'heat', 'tradeoff', 'beforeEnergize',
  ], ['configurationSignature'])) return null;
  const instrument = entry.instrument === 'galvanoscopio' ? entry.instrument : null;
  const allocation = sanitizeForgeAllocation(entry.allocation);
  const totalCurrent = readNumber(entry.totalCurrent, 0);
  const totalPower = readNumber(entry.totalPower, 0);
  const heat = readNumber(entry.heat, 0);
  const tradeoff = isOneOf(entry.tradeoff, FORGE_TRADEOFFS) ? entry.tradeoff : null;
  const beforeEnergize = readBoolean(entry.beforeEnergize);
  let configurationSignature: string | undefined;
  if (Object.prototype.hasOwnProperty.call(entry, 'configurationSignature')) {
    const signature = readText(entry.configurationSignature);
    if (signature === null) return null;
    configurationSignature = signature;
  }
  if (instrument === null || allocation === null || totalCurrent === null || totalPower === null
    || heat === null || tradeoff === null || beforeEnergize === null) return null;
  return configurationSignature === undefined
    ? { instrument, allocation, totalCurrent, totalPower, heat, tradeoff, beforeEnergize }
    : { instrument, configurationSignature, allocation, totalCurrent, totalPower, heat, tradeoff, beforeEnergize };
}

function sanitizeForge(value: unknown): Arc1GreyboxState['forgeTerraces'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'allocation', 'conductor', 'protection', 'measurements', 'documented',
    'energized', 'protectiveTrip', 'recoverableFaults', 'repairs',
  ])) return null;
  const allocation = sanitizeForgeAllocation(entry.allocation);
  const conductor = isOneOf(entry.conductor, FORGE_CONDUCTORS) ? entry.conductor : null;
  const protection = sanitizeForgeProtection(entry.protection);
  const measurements = readArray(entry.measurements, ARC1_SAVE_MAX_MEASUREMENTS, sanitizeForgeMeasurement);
  const documented = readBoolean(entry.documented);
  const energized = readBoolean(entry.energized);
  const protectiveTrip = readBoolean(entry.protectiveTrip);
  const recoverableFaults = readInteger(entry.recoverableFaults);
  const repairs = readInteger(entry.repairs);
  if (allocation === null || conductor === null || protection === null || measurements === null
    || documented === null || energized === null || protectiveTrip === null
    || recoverableFaults === null || repairs === null) return null;
  return { allocation, conductor, protection, measurements, documented, energized, protectiveTrip, recoverableFaults, repairs };
}

function sanitizeLighthouseCalibration(value: unknown): Arc1GreyboxState['lighthouse']['calibration'] | null {
  if (value === null) return null;
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, ['voltageTrim', 'phaseOffset'])) return null;
  const voltageTrim = readNumber(entry.voltageTrim, -12, 12);
  const phaseOffset = readNumber(entry.phaseOffset, -4, 4);
  if (voltageTrim === null || phaseOffset === null) return null;
  return { voltageTrim, phaseOffset };
}

function sanitizeLighthouseMeasurement(value: unknown): LighthouseMeasurement | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'instrument', 'sourceVoltage', 'sourceCurrent', 'sourcePower', 'topologySignature', 'powerBudget',
  ])) return null;
  const instrument = entry.instrument === 'galvanoscopio' ? entry.instrument : null;
  const sourceVoltage = readNumber(entry.sourceVoltage, 0);
  const sourceCurrent = readNumber(entry.sourceCurrent, 0);
  const sourcePower = readNumber(entry.sourcePower, 0);
  const topologySignature = readText(entry.topologySignature);
  const powerBudget = readNumber(entry.powerBudget, 0);
  if (instrument === null || sourceVoltage === null || sourceCurrent === null || sourcePower === null
    || topologySignature === null || powerBudget === null) return null;
  return { instrument, sourceVoltage, sourceCurrent, sourcePower, topologySignature, powerBudget };
}

function sanitizeLighthouse(value: unknown): Arc1GreyboxState['lighthouse'] | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'mode', 'calibration', 'measurements', 'synchronizationSamples', 'documented',
    'energized', 'protectiveTrip', 'recoverableFaults', 'repairs',
  ], ['verificationPoints'])) return null;
  const mode = entry.mode === 'dc' ? entry.mode : null;
  const calibration = sanitizeLighthouseCalibration(entry.calibration);
  const measurements = readArray(entry.measurements, ARC1_SAVE_MAX_MEASUREMENTS, sanitizeLighthouseMeasurement);
  const synchronizationSamples = readInteger(entry.synchronizationSamples);
  const verificationPoints = entry.verificationPoints === undefined ? undefined
    : readArray(entry.verificationPoints, 2, (point) => isOneOf(point, ['feed', 'beacon'] as const) ? point : null);
  if (verificationPoints === null || (verificationPoints &&
    (new Set(verificationPoints).size !== verificationPoints.length || verificationPoints.length !== synchronizationSamples))) return null;
  const documented = readBoolean(entry.documented);
  const energized = readBoolean(entry.energized);
  const protectiveTrip = readBoolean(entry.protectiveTrip);
  const recoverableFaults = readInteger(entry.recoverableFaults);
  const repairs = readInteger(entry.repairs);
  if (mode === null || measurements === null || synchronizationSamples === null || documented === null
    || energized === null || protectiveTrip === null || recoverableFaults === null || repairs === null) return null;
  return { mode, calibration, measurements, synchronizationSamples,
    ...(verificationPoints ? { verificationPoints } : {}),
    documented, energized, protectiveTrip, recoverableFaults, repairs };
}

function sanitizeArc1State(value: unknown): Arc1GreyboxState | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'currentRegion', 'visitedRegions', 'returnedToPlaza', 'finalReturnReached', 'lastEvent',
    'manantial', 'plaza', 'castle', 'forgeTerraces', 'lighthouse',
  ])) return null;
  const currentRegion = isOneOf(entry.currentRegion, ARC1_REGIONS) ? entry.currentRegion : null;
  const visitedRegions = readArray(entry.visitedRegions, ARC1_ROUTE.length, (region) =>
    isOneOf(region, ARC1_REGIONS) ? region : null);
  const returnedToPlaza = readBoolean(entry.returnedToPlaza);
  const finalReturnReached = readBoolean(entry.finalReturnReached);
  const lastEvent = isOneOf(entry.lastEvent, ARC1_EVENTS) ? entry.lastEvent : null;
  const manantial = sanitizeManantial(entry.manantial);
  const plazaEntry = isRecord(entry.plaza) ? entry.plaza : null;
  const plaza = plazaEntry && hasExactKeys(plazaEntry, ['bellPulls', 'castleGateOpened'])
    ? (() => {
      const bellPulls = readInteger(plazaEntry.bellPulls);
      const castleGateOpened = readBoolean(plazaEntry.castleGateOpened);
      return bellPulls === null || castleGateOpened === null ? null : { bellPulls, castleGateOpened };
    })()
    : null;
  const castle = sanitizeCastle(entry.castle);
  const forgeTerraces = sanitizeForge(entry.forgeTerraces);
  const lighthouse = sanitizeLighthouse(entry.lighthouse);
  if (currentRegion === null || visitedRegions === null || visitedRegions.length === 0
    || visitedRegions[0] !== 'portal' || !visitedRegions.includes(currentRegion)
    || new Set(visitedRegions).size !== visitedRegions.length || returnedToPlaza === null
    || finalReturnReached === null || lastEvent === null || manantial === null || plaza === null
    || castle === null || forgeTerraces === null || lighthouse === null) return null;
  return { currentRegion, visitedRegions, returnedToPlaza, finalReturnReached, lastEvent, manantial, plaza, castle, forgeTerraces, lighthouse };
}

function retainRecentMeasurements<T>(measurements: readonly T[]): T[] {
  return measurements.length <= ARC1_SAVE_MAX_MEASUREMENTS
    ? [...measurements]
    : [...measurements.slice(-ARC1_SAVE_MAX_MEASUREMENTS)];
}

/**
 * Keep a trusted in-memory history bounded before it enters the save schema.
 * Manantial keeps the first pre-repair observation because it is part of the
 * repair proof, plus the newest readings; the other evaluators use their
 * newest reading as the active configuration proof.
 */
export function compactArc1StateForSave(state: Arc1GreyboxState): Arc1GreyboxState {
  const manantialMeasurements = state.manantial.measurements.length <= ARC1_SAVE_MAX_MEASUREMENTS
    ? [...state.manantial.measurements]
    : (() => {
      const firstBeforeRepair = state.manantial.measurements.find((measurement) => measurement.beforeRepair);
      const recent = state.manantial.measurements.slice(-ARC1_SAVE_MAX_MEASUREMENTS);
      if (!firstBeforeRepair || recent.includes(firstBeforeRepair)) return [...recent];
      return [
        firstBeforeRepair,
        ...state.manantial.measurements.slice(-(ARC1_SAVE_MAX_MEASUREMENTS - 1)),
      ];
    })();
  return {
    ...state,
    manantial: { ...state.manantial, measurements: manantialMeasurements },
    castle: { ...state.castle, measurements: retainRecentMeasurements(state.castle.measurements) },
    forgeTerraces: { ...state.forgeTerraces, measurements: retainRecentMeasurements(state.forgeTerraces.measurements) },
    lighthouse: { ...state.lighthouse, measurements: retainRecentMeasurements(state.lighthouse.measurements) },
  };
}

function sanitizeCircuit(value: unknown): Arc1CircuitSaveData | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, ['branches'])) return null;
  const branches = isRecord(entry.branches) ? entry.branches : null;
  if (!branches || !hasExactKeys(branches, ['b_ida_rele', 'b_brecha_retorno', 'b_brecha_a_oxido'])) return null;
  const relay = isOneOf(branches.b_ida_rele, ['open', 'closed'] as const) ? branches.b_ida_rele : null;
  const bridge = isOneOf(branches.b_brecha_retorno, ['open', 'closed'] as const) ? branches.b_brecha_retorno : null;
  const corrosionEntry = isRecord(branches.b_brecha_a_oxido) ? branches.b_brecha_a_oxido : null;
  if (!corrosionEntry || !hasExactKeys(corrosionEntry, ['state', 'resistance'])) return null;
  const corrosionState = isOneOf(corrosionEntry.state, ['corroded', 'closed'] as const)
    ? corrosionEntry.state
    : null;
  const resistance = readNumber(corrosionEntry.resistance, CLEAN_CORROSION_RESISTANCE, RAW_CORROSION_RESISTANCE);
  const resistanceMatchesState = corrosionState === 'corroded'
    ? resistance === RAW_CORROSION_RESISTANCE
    : corrosionState === 'closed' && resistance === CLEAN_CORROSION_RESISTANCE;
  if (relay === null || bridge === null || corrosionState === null || resistance === null || !resistanceMatchesState) return null;
  return {
    branches: {
      b_ida_rele: relay,
      b_brecha_retorno: bridge,
      b_brecha_a_oxido: { state: corrosionState, resistance },
    },
  };
}

function sanitizeCoveredIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > ARC1_SAVE_MAX_COVERED_IDS) return null;
  const ids: string[] = [];
  for (const id of value) {
    const safeId = readBoundedIdentifier(id);
    if (safeId === null || !['g1', 'g2', 'g4', 'g5'].includes(safeId) || ids.includes(safeId)) return null;
    ids.push(safeId);
  }
  return ids;
}

function sanitizeBitacora(value: unknown): Record<string, RumorStatus> | null {
  const entry = isRecord(value) ? value : null;
  if (!entry) return null;
  const baseline = new BitacoraManager().getStatuses();
  for (const id of Object.keys(entry)) {
    if (!Object.prototype.hasOwnProperty.call(baseline, id)) return null;
    if (!isOneOf(entry[id], RUMOR_STATUSES)) return null;
  }
  return {
    ...baseline,
    ...Object.fromEntries(Object.entries(entry).map(([id, status]) => [id, status as RumorStatus])),
  };
}

function sanitizeSafeAnchor(value: unknown): Arc1SafeAnchor | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, ['zone', 'anchorId'])) return null;
  const anchorId = isOneOf(entry.anchorId, Object.keys(ARC1_SAFE_ANCHOR_ZONES) as Arc1SafeAnchorId[])
    ? entry.anchorId
    : null;
  const zone = isOneOf(entry.zone, Object.values(ARC1_SAFE_ANCHOR_ZONES)) ? entry.zone : null;
  if (anchorId === null || zone === null || ARC1_SAFE_ANCHOR_ZONES[anchorId] !== zone) return null;
  return { zone, anchorId };
}

/**
 * Keep a validated payload reachable in the authored campaign graph. The
 * current region may legitimately be a return waypoint while the player is
 * standing in the destination zone of that return transition, so this check
 * uses visited route evidence rather than requiring a one-to-one region/zone
 * match.
 */
function hasValidArc1SaveSemantics(
  arc1: Arc1GreyboxState,
  storyStep: Arc1StoryStep,
  safeAnchor: Arc1SafeAnchor,
): boolean {
  const requiredVisited: Record<Arc1SafeZone, readonly Arc1Region[]> = {
    plaza: ['portal'],
    workshop: ['taller'],
    manantial: ['manantial'],
    castle: ['castillo'],
    'forge-terraces': ['forja'],
    lighthouse: ['faro'],
  };
  if (!requiredVisited[safeAnchor.zone].every((region) => arc1.visitedRegions.includes(region))) return false;

  // Region entry is monotonic along ARC1_ROUTE, even though the player can
  // return to previously visited zones. A later visited region therefore
  // implies every prerequisite region has also been visited.
  for (const region of arc1.visitedRegions) {
    const index = ARC1_ROUTE.indexOf(region);
    if (index < 0 || !ARC1_ROUTE.slice(0, index).every((previous) => arc1.visitedRegions.includes(previous))) {
      return false;
    }
  }

  if (arc1.finalReturnReached && !isArcComplete(arc1)) return false;
  if (storyStep === 'returning' && (arc1.currentRegion !== 'retorno' || !isLighthouseRestored(arc1))) return false;
  return storyStep !== 'arc1_complete'
    || (safeAnchor.zone === 'plaza' && isArcComplete(arc1));
}

/**
 * Validate and deep-copy an untrusted save-shaped value.  Unknown keys are
 * rejected at every level, and missing values never overwrite canonical
 * defaults with `undefined`.
 */
export function validateArc1SaveData(value: unknown): Arc1SaveData | null {
  const entry = isRecord(value) ? value : null;
  if (!entry || !hasExactKeys(entry, [
    'schema', 'version', 'storyStep', 'ohmAwake', 'inventory', 'arc1', 'circuit', 'bitacora', 'safeAnchor',
  ], ['b2'])) return null;
  if (entry.schema !== ARC1_SAVE_SCHEMA || entry.version !== ARC1_SAVE_VERSION) return null;
  const storyStep = isOneOf(entry.storyStep, ARC1_STORY_STEPS) ? entry.storyStep : null;
  const ohmAwake = readBoolean(entry.ohmAwake);
  const inventoryEntry = isRecord(entry.inventory) ? entry.inventory : null;
  const inventory = inventoryEntry && hasExactKeys(inventoryEntry, ['jumper', 'brush'])
    ? (() => {
      const jumper = readBoolean(inventoryEntry.jumper);
      const brush = readBoolean(inventoryEntry.brush);
      return jumper === null || brush === null ? null : { jumper, brush };
    })()
    : null;
  const arc1 = sanitizeArc1State(entry.arc1);
  const circuit = sanitizeCircuit(entry.circuit);
  const bitacora = sanitizeBitacora(entry.bitacora);
  const safeAnchor = sanitizeSafeAnchor(entry.safeAnchor);
  let b2: Arc1B2SaveData | undefined;
  if (Object.prototype.hasOwnProperty.call(entry, 'b2')) {
    const b2Entry = isRecord(entry.b2) ? entry.b2 : null;
    if (!b2Entry || !hasExactKeys(b2Entry, ['coveredIds'])) return null;
    const coveredIds = sanitizeCoveredIds(b2Entry.coveredIds);
    if (coveredIds === null) return null;
    b2 = { coveredIds };
  }
  if (storyStep === null || ohmAwake === null || inventory === null || arc1 === null || circuit === null
    || bitacora === null || safeAnchor === null) return null;
  if (!hasValidArc1SaveSemantics(arc1, storyStep, safeAnchor)) return null;
  if (ohmAwake && b2 && !['g1', 'g5', 'g4'].every((id) => b2!.coveredIds.includes(id))) return null;
  return b2 === undefined
    ? { schema: ARC1_SAVE_SCHEMA, version: ARC1_SAVE_VERSION, storyStep, ohmAwake, inventory, arc1, circuit, bitacora, safeAnchor }
    : { schema: ARC1_SAVE_SCHEMA, version: ARC1_SAVE_VERSION, storyStep, ohmAwake, inventory, arc1, circuit, bitacora, safeAnchor, b2 };
}

/** Build a validated save from trusted in-memory sources and deep-copy it. */
export function createArc1SaveData(input: Arc1SaveInput): Arc1SaveData {
  const candidate: Record<string, unknown> = {
    schema: ARC1_SAVE_SCHEMA,
    version: ARC1_SAVE_VERSION,
    storyStep: input.storyStep,
    ohmAwake: input.ohmAwake,
    inventory: input.inventory,
    arc1: compactArc1StateForSave(input.arc1),
    circuit: input.circuit,
    bitacora: input.bitacora,
    safeAnchor: input.safeAnchor,
  };
  if (input.b2 !== undefined) candidate.b2 = input.b2;
  const safe = validateArc1SaveData(candidate);
  if (safe === null) throw new Error('Invalid Arc I save source data');
  return safe;
}

/** Capture only mutable branch inputs from the canonical CircuitState. */
export function captureArc1CircuitState(state: CircuitState): Arc1CircuitSaveData | null {
  if (!isRecord(state.branches)) return null;
  const relay = state.branches.b_ida_rele?.state;
  const bridge = state.branches.b_brecha_retorno?.state;
  const corrosion = state.branches.b_brecha_a_oxido;
  const candidate = {
    branches: {
      b_ida_rele: relay,
      b_brecha_retorno: bridge,
      b_brecha_a_oxido: {
        state: corrosion?.state,
        resistance: corrosion?.resistance,
      },
    },
  };
  return sanitizeCircuit(candidate);
}

/** Serialize only a validated, source-only save payload. */
export function serializeArc1SaveData(value: Arc1SaveData): string {
  const safe = validateArc1SaveData(value);
  if (safe === null) throw new Error('Cannot serialize invalid Arc I save data');
  const serialized = JSON.stringify(safe);
  if (serialized.length > ARC1_SAVE_MAX_SERIALIZED_LENGTH) throw new Error('Arc I save is too large');
  return serialized;
}

/** Parse and sanitize untrusted storage text; malformed data returns null. */
export function parseArc1SaveData(raw: unknown): Arc1SaveData | null {
  if (typeof raw !== 'string' || raw.length > ARC1_SAVE_MAX_SERIALIZED_LENGTH) return null;
  try {
    return validateArc1SaveData(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Storage reads are best-effort and never throw on privacy/quota failures. */
export function readArc1Save(
  storage: Arc1SaveStorageAdapter,
  key = ARC1_SAVE_STORAGE_KEY,
): Arc1SaveData | null {
  try {
    return parseArc1SaveData(storage.getItem(key));
  } catch {
    return null;
  }
}

/** Storage writes are best-effort and return false on serialization/storage failure. */
export function writeArc1Save(
  storage: Arc1SaveStorageAdapter,
  value: Arc1SaveData,
  key = ARC1_SAVE_STORAGE_KEY,
): boolean {
  try {
    storage.setItem(key, serializeArc1SaveData(value));
    return true;
  } catch {
    return false;
  }
}

/** Alias names kept short for runtime integration call sites. */
export const serializeArc1Save = serializeArc1SaveData;
export const parseArc1Save = parseArc1SaveData;

/** A canonical branch patch is convenient when hydrating CircuitState. */
export function applyArc1CircuitSave(
  state: CircuitState,
  saved: Arc1CircuitSaveData,
): CircuitState | null {
  const safe = sanitizeCircuit(saved);
  if (safe === null || !isRecord(state.branches)) return null;
  const relay = state.branches.b_ida_rele;
  const bridge = state.branches.b_brecha_retorno;
  const corrosion = state.branches.b_brecha_a_oxido;
  if (!relay || !bridge || !corrosion) return null;
  const nodes = Object.fromEntries(
    Object.entries(state.nodes).map(([id, node]) => [id, { ...node, pos: { ...node.pos } }]),
  ) as CircuitState['nodes'];
  const branches = Object.fromEntries(
    Object.entries(state.branches).map(([id, branch]) => [id, { ...branch }]),
  ) as CircuitState['branches'];
  branches.b_ida_rele.state = safe.branches.b_ida_rele;
  branches.b_brecha_retorno.state = safe.branches.b_brecha_retorno;
  branches.b_brecha_a_oxido.state = safe.branches.b_brecha_a_oxido.state;
  branches.b_brecha_a_oxido.resistance = safe.branches.b_brecha_a_oxido.resistance;
  return { ...state, nodes, branches };
}

/** A fresh Arc1 baseline is exported for integrations that need a reset. */
export function createArc1SaveBaseline(): Arc1GreyboxState {
  return createArc1GreyboxState();
}
