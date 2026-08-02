import {
  isCircuitNode,
  passiveResistanceOhms,
  solveCircuit,
  type CircuitNode,
  type ReturnState,
} from './circuitModel.ts';

export type InstrumentMode = 'V_DC' | 'R' | 'CONTINUITY';
export type PowerState = 'deenergized_isolated' | 'energized_locked';
export type RangeId = 'V_0_50' | 'V_5' | 'V_20' | 'R_200' | 'R_2000' | 'CONT_300';
export type MeasurementCode =
  | 'VALID'
  | 'AT_RANGE_LIMIT'
  | 'OUT_OF_RANGE'
  | 'CLOSED_PATH'
  | 'OPEN_PATH'
  | 'INCOMPLETE_CONFIGURATION'
  | 'UNDEFINED_POINT'
  | 'MODE_INCOMPATIBLE_WITH_STATE'
  | 'STATE_NOT_MEASURABLE';

export const RANGE_LIMITS: Readonly<Record<RangeId, number>> = {
  V_0_50: 0.5,
  V_5: 5,
  V_20: 20,
  R_200: 200,
  R_2000: 2000,
  CONT_300: 300,
};

export interface MeasurementRequest {
  mode?: InstrumentMode;
  pointA?: string;
  pointB?: string;
  range?: RangeId;
  power: PowerState;
  returnState: ReturnState;
}
export interface MeasurementResult {
  code: MeasurementCode;
  value: number | null;
  unit: 'V' | 'ohm' | null;
}

export function measureVirtual(request: MeasurementRequest): MeasurementResult {
  if (!request.mode || !request.pointA || !request.pointB || !request.range) {
    return result('INCOMPLETE_CONFIGURATION');
  }
  if (!isCircuitNode(request.pointA) || !isCircuitNode(request.pointB)) {
    return result('UNDEFINED_POINT');
  }

  if (request.mode === 'V_DC') {
    if (!request.range.startsWith('V_')) return result('INCOMPLETE_CONFIGURATION');
    if (request.power !== 'energized_locked') return result('STATE_NOT_MEASURABLE');
    const nodes = solveCircuit(request.returnState).nodeVolts;
    return ranged(nodes[request.pointA] - nodes[request.pointB], 'V', request.range, 0.01);
  }

  if (request.power !== 'deenergized_isolated') {
    return result('MODE_INCOMPATIBLE_WITH_STATE');
  }
  const resistance = passiveResistanceOhms(
    request.pointA as CircuitNode,
    request.pointB as CircuitNode,
    request.returnState,
  );

  if (request.mode === 'CONTINUITY') {
    if (request.range !== 'CONT_300') return result('INCOMPLETE_CONFIGURATION');
    return Number.isFinite(resistance) && resistance <= RANGE_LIMITS.CONT_300
      ? { code: 'CLOSED_PATH', value: resistance, unit: 'ohm' }
      : { code: 'OPEN_PATH', value: Number.POSITIVE_INFINITY, unit: 'ohm' };
  }

  if (!request.range.startsWith('R_')) return result('INCOMPLETE_CONFIGURATION');
  return ranged(resistance, 'ohm', request.range, 1);
}

function ranged(
  ideal: number,
  unit: 'V' | 'ohm',
  range: RangeId,
  resolution: number,
): MeasurementResult {
  const limit = RANGE_LIMITS[range];
  if (!Number.isFinite(ideal) || Math.abs(ideal) > limit) {
    return { code: 'OUT_OF_RANGE', value: null, unit };
  }
  const value = Math.round(ideal / resolution) * resolution;
  return { code: Math.abs(ideal) === limit ? 'AT_RANGE_LIMIT' : 'VALID', value, unit };
}

function result(code: MeasurementCode): MeasurementResult {
  return { code, value: null, unit: null };
}
