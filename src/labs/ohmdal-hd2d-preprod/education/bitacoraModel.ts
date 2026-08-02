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

function nonBlank(value: string): boolean {
  return value.trim().length > 0;
}

function nonBlankList(values: readonly string[]): boolean {
  return values.length > 0 && values.every(nonBlank);
}

function evidenceIsCoherent(item: BitacoraEntry['evidence'][number]): boolean {
  const common = nonBlank(item.hypothesis)
    && nonBlank(item.pointA)
    && nonBlank(item.pointB)
    && item.observedErrorCodes.every(nonBlank);
  if (!common) return false;
  if (item.magnitude === 'V_DC') {
    return item.powerState === 'energized_locked'
      && item.unit === 'V'
      && typeof item.value === 'number'
      && Number.isFinite(item.value);
  }
  if (item.powerState !== 'deenergized_isolated' || item.unit !== 'ohm') return false;
  if (item.magnitude === 'R') {
    return typeof item.value === 'number' && Number.isFinite(item.value) && item.value >= 0;
  }
  return item.value === 'OPEN_PATH'
    || (typeof item.value === 'number' && Number.isFinite(item.value) && item.value >= 0);
}

export function validateBitacoraEntry(entry: BitacoraEntry): BitacoraValidation {
  const complete =
    nonBlank(entry.illustratedExperience) &&
    entry.evidence.length > 0 &&
    entry.evidence.every(evidenceIsCoherent) &&
    nonBlank(entry.formalTranslation.technicalName) &&
    nonBlank(entry.formalTranslation.schematicDescription) &&
    nonBlankList(entry.formalTranslation.variables) &&
    nonBlankList(entry.formalTranslation.units) &&
    nonBlank(entry.formalTranslation.mathematicalRelation) &&
    nonBlankList(entry.formalTranslation.assumptions) &&
    nonBlank(entry.formalTranslation.metaphorLimit) &&
    nonBlank(entry.nextQuestion);
  if (!complete) return { ok: false, code: 'INCOMPLETE_RECORD' };

  if (entry.optionalEvaluationUrl) {
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
