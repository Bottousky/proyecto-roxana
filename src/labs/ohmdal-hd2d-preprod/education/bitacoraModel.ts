export interface BitacoraEntry {
  illustratedExperience: string;
  evidence: ReadonlyArray<{
    hypothesis: string;
    pointA: string;
    pointB: string;
    magnitude: 'V_DC' | 'R' | 'CONTINUITY';
    value: number | 'OPEN_PATH';
    unit: 'V' | 'ohm';
  }>;
  formalTranslation: {
    technicalName: string;
    variables: readonly string[];
    assumptions: readonly string[];
    metaphorLimit: string;
  };
  nextQuestion: string;
  optionalEvaluationUrl?: string;
}
export type BitacoraValidation =
  | { ok: true }
  | { ok: false; code: 'INCOMPLETE_RECORD' | 'INVALID_EVALUATION_URL' };

export function validateBitacoraEntry(entry: BitacoraEntry): BitacoraValidation {
  const complete =
    entry.illustratedExperience.trim().length > 0 &&
    entry.evidence.length > 0 &&
    entry.evidence.every((item) =>
      Boolean(item.hypothesis && item.pointA && item.pointB && item.magnitude && item.unit),
    ) &&
    entry.formalTranslation.technicalName.trim().length > 0 &&
    entry.formalTranslation.variables.length > 0 &&
    entry.formalTranslation.assumptions.length > 0 &&
    entry.formalTranslation.metaphorLimit.trim().length > 0 &&
    entry.nextQuestion.trim().length > 0;
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
