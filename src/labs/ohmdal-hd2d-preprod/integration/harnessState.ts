import { LEVEL_ZONES, type MetricPoint, type ZoneId } from '../architecture/levelData.ts';
import type { DirectionVariant } from '../contracts.ts';
import {
  advanceDiagnosis,
  createDiagnosisState,
  type DiagnosisAction,
  type DiagnosisState,
  type DiagnosisTransition,
} from '../education/diagnosisModel.ts';

export const SAFE_DIAGNOSIS_SEQUENCE: readonly DiagnosisAction[] = [
  'configure_measurement',
  'inspect',
  'record_hypothesis',
  'measure_continuity',
  'close_measurement',
  'intervene',
  'energize_locked',
  'verify',
  'document',
] as const;

export function zoneForPosition(position: MetricPoint): ZoneId {
  return LEVEL_ZONES.find(({ bounds }) => (
    position.x >= bounds.minX && position.x <= bounds.maxX
      && position.z >= bounds.minZ && position.z <= bounds.maxZ
  ))?.id ?? 'portal_plaza';
}

export function headingDegrees(x: number, z: number): number {
  if (x === 0 && z === 0) return 0;
  return (Math.atan2(x, z) * 180 / Math.PI + 360) % 360;
}

export function directionIndex(heading: number, variant: DirectionVariant): number {
  const sector = 360 / variant;
  return Math.floor(((heading + sector / 2) % 360) / sector);
}

export interface DiagnosisHarnessState {
  readonly state: DiagnosisState;
  readonly nextIndex: number;
  readonly last: DiagnosisTransition | null;
}

export function createDiagnosisHarnessState(): DiagnosisHarnessState {
  return { state: createDiagnosisState(), nextIndex: 0, last: null };
}

export function advanceSafeDiagnosis(current: DiagnosisHarnessState): DiagnosisHarnessState {
  if (current.nextIndex >= SAFE_DIAGNOSIS_SEQUENCE.length) return current;
  const transition = advanceDiagnosis(current.state, SAFE_DIAGNOSIS_SEQUENCE[current.nextIndex]);
  return transition.ok
    ? { state: transition.state, nextIndex: current.nextIndex + 1, last: transition }
    : { ...current, last: transition };
}
