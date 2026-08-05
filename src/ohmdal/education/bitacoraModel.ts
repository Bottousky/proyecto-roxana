export interface BitacoraEntry {
  illustratedExperience: string;
  evidence: ReadonlyArray<{
    hypothesis: string;
    pointA: string;
    pointB: string;
    magnitude: 'V_DC' | 'R' | 'CONTINUITY';
    value: number | 'OPEN_PATH';
    unit: 'V' | 'ohm';
    powerState: 'deenergized_isolated' | 'energized_locked';
    observedErrorCodes: readonly string[];
  }>;
  formalTranslation: {
    technicalName: string;
    schematicDescription: string;
    variables: readonly string[];
    units: readonly string[];
    mathematicalRelation: string;
    assumptions: readonly string[];
    metaphorLimit: string;
  };
  nextQuestion: string;
  optionalEvaluationUrl?: string;
}
export type BitacoraValidation =
  | { ok: true }
  | { ok: false; code: 'INCOMPLETE_RECORD' | 'INVALID_EVALUATION_URL' };

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function nonBlankList(values: unknown): values is readonly string[] {
  return Array.isArray(values) && values.length > 0 && values.every(nonBlank);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function evidenceIsCoherent(item: unknown): boolean {
  if (!isRecord(item) || !Array.isArray(item.observedErrorCodes)) return false;
  const common = nonBlank(item.hypothesis)
    && nonBlank(item.pointA)
    && nonBlank(item.pointB)
    && item.observedErrorCodes.every(nonBlank);
  if (!common) return false;
  switch (item.magnitude) {
  case 'V_DC':
    return item.powerState === 'energized_locked'
      && item.unit === 'V'
      && typeof item.value === 'number'
      && Number.isFinite(item.value);
  case 'R':
    if (item.powerState !== 'deenergized_isolated' || item.unit !== 'ohm') return false;
    return typeof item.value === 'number' && Number.isFinite(item.value) && item.value >= 0;
  case 'CONTINUITY':
    if (item.powerState !== 'deenergized_isolated' || item.unit !== 'ohm') return false;
    return item.value === 'OPEN_PATH'
      || (typeof item.value === 'number'
        && Number.isFinite(item.value)
        && item.value >= 0
        && item.value <= RANGE_LIMITS.CONT_300);
  default:
    return false;
  }
}

export function validateBitacoraEntry(entry: unknown): BitacoraValidation {
  if (!isRecord(entry)
    || !Array.isArray(entry.evidence)
    || !isRecord(entry.formalTranslation)) {
    return { ok: false, code: 'INCOMPLETE_RECORD' };
  }
  const formal = entry.formalTranslation;
  const complete =
    nonBlank(entry.illustratedExperience) &&
    entry.evidence.length > 0 &&
    entry.evidence.every(evidenceIsCoherent) &&
    nonBlank(formal.technicalName) &&
    nonBlank(formal.schematicDescription) &&
    nonBlankList(formal.variables) &&
    nonBlankList(formal.units) &&
    nonBlank(formal.mathematicalRelation) &&
    nonBlankList(formal.assumptions) &&
    nonBlank(formal.metaphorLimit) &&
    nonBlank(entry.nextQuestion);
  if (!complete) return { ok: false, code: 'INCOMPLETE_RECORD' };

  if (entry.optionalEvaluationUrl !== undefined) {
    if (!nonBlank(entry.optionalEvaluationUrl)) {
      return { ok: false, code: 'INVALID_EVALUATION_URL' };
    }
    try {
      if (new URL(entry.optionalEvaluationUrl).protocol !== 'https:') {
        return { ok: false, code: 'INVALID_EVALUATION_URL' };
      }
    } catch {
      return { ok: false, code: 'INVALID_EVALUATION_URL' };
    }
  }
  return { ok: true };
}

export function allowedPedagogicalTelemetry(entry: BitacoraEntry): Readonly<{
  evidenceCount: number;
  magnitudes: readonly string[];
  hasFormalTranslation: boolean;
  hasNextQuestion: boolean;
}> {
  return {
    evidenceCount: entry.evidence.length,
    magnitudes: entry.evidence.map((item) => item.magnitude),
    hasFormalTranslation: entry.formalTranslation.technicalName.length > 0,
    hasNextQuestion: entry.nextQuestion.length > 0,
  };
}
import { RANGE_LIMITS } from './instrumentModel.ts';
