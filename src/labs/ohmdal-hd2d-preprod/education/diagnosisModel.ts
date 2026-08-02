export type DiagnosisAction =
  | 'inspect'
  | 'record_hypothesis'
  | 'configure_measurement'
  | 'measure_continuity'
  | 'energize_locked'
  | 'measure_voltage'
  | 'deenergize_isolate'
  | 'close_measurement'
  | 'intervene'
  | 'verify'
  | 'document';

export type DiagnosisError =
  | 'INSPECTION_REQUIRED'
  | 'HYPOTHESIS_REQUIRED'
  | 'CONFIGURATION_REQUIRED'
  | 'WRONG_POWER_STATE'
  | 'MEASUREMENT_ACTIVE'
  | 'EVIDENCE_REQUIRED'
  | 'INTERVENTION_BLOCKED'
  | 'INTERVENTION_REQUIRED'
  | 'VERIFICATION_REQUIRED';

export interface DiagnosisState {
  power: 'deenergized_isolated' | 'energized_locked';
  activeMeasurement: 'none' | 'continuity' | 'voltage';
  inspected: boolean;
  hypothesisRecorded: boolean;
  configured: boolean;
  evidence: ReadonlyArray<'continuity' | 'voltage'>;
  intervened: boolean;
  verified: boolean;
  documented: boolean;
}
export type DiagnosisTransition =
  | { ok: true; state: DiagnosisState }
  | { ok: false; state: DiagnosisState; error: DiagnosisError };

export function createDiagnosisState(): DiagnosisState {
  return {
    power: 'deenergized_isolated',
    activeMeasurement: 'none',
    inspected: false,
    hypothesisRecorded: false,
    configured: false,
    evidence: [],
    intervened: false,
    verified: false,
    documented: false,
  };
}

export function advanceDiagnosis(state: DiagnosisState, action: DiagnosisAction): DiagnosisTransition {
  const fail = (error: DiagnosisError): DiagnosisTransition => ({ ok: false, state, error });
  const pass = (change: Partial<DiagnosisState>): DiagnosisTransition => ({
    ok: true,
    state: { ...state, ...change },
  });

  if (action === 'configure_measurement') {
    return state.activeMeasurement === 'none' ? pass({ configured: true }) : fail('MEASUREMENT_ACTIVE');
  }
  if (action === 'inspect') {
    return state.power === 'deenergized_isolated' && state.activeMeasurement === 'none'
      ? pass({ inspected: true })
      : fail('WRONG_POWER_STATE');
  }
  if (action === 'record_hypothesis') {
    return state.inspected ? pass({ hypothesisRecorded: true }) : fail('INSPECTION_REQUIRED');
  }
  if (action === 'measure_continuity') {
    if (!state.inspected) return fail('INSPECTION_REQUIRED');
    if (!state.hypothesisRecorded) return fail('HYPOTHESIS_REQUIRED');
    if (!state.configured) return fail('CONFIGURATION_REQUIRED');
    if (state.power !== 'deenergized_isolated') return fail('WRONG_POWER_STATE');
    if (state.activeMeasurement !== 'none') return fail('MEASUREMENT_ACTIVE');
    return pass({ activeMeasurement: 'continuity', evidence: addEvidence(state, 'continuity') });
  }
  if (action === 'energize_locked') {
    if (!state.inspected) return fail('INSPECTION_REQUIRED');
    if (!state.hypothesisRecorded) return fail('HYPOTHESIS_REQUIRED');
    if (state.activeMeasurement !== 'none') return fail('MEASUREMENT_ACTIVE');
    return pass({ power: 'energized_locked' });
  }
  if (action === 'measure_voltage') {
    if (!state.configured) return fail('CONFIGURATION_REQUIRED');
    if (state.power !== 'energized_locked') return fail('WRONG_POWER_STATE');
    if (state.activeMeasurement !== 'none') return fail('MEASUREMENT_ACTIVE');
    return pass({ activeMeasurement: 'voltage', evidence: addEvidence(state, 'voltage') });
  }
  if (action === 'close_measurement') return pass({ activeMeasurement: 'none' });
  if (action === 'deenergize_isolate') {
    return pass({ power: 'deenergized_isolated', activeMeasurement: 'none' });
  }
  if (action === 'intervene') {
    if (state.power !== 'deenergized_isolated' || state.activeMeasurement !== 'none') {
      return fail('INTERVENTION_BLOCKED');
    }
    if (state.evidence.length === 0) return fail('EVIDENCE_REQUIRED');
    return pass({ intervened: true });
  }
  if (action === 'verify') {
    if (!state.intervened) return fail('INTERVENTION_REQUIRED');
    if (state.power !== 'energized_locked') return fail('WRONG_POWER_STATE');
    return pass({ verified: true });
  }
  if (!state.verified) return fail('VERIFICATION_REQUIRED');
  return pass({ documented: true });
}

export function runDiagnosisOrder(actions: readonly DiagnosisAction[]): DiagnosisTransition {
  let state = createDiagnosisState();
  for (const action of actions) {
    const transition = advanceDiagnosis(state, action);
    if (!transition.ok) return transition;
    state = transition.state;
  }
  return { ok: true, state };
}

function addEvidence(
  state: DiagnosisState,
  kind: 'continuity' | 'voltage',
): ReadonlyArray<'continuity' | 'voltage'> {
  return state.evidence.includes(kind) ? state.evidence : [...state.evidence, kind];
}
