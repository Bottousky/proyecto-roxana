/**
 * Diagnosis Model (Puzzle 2) — Ohmdal Arco I.
 *
 * Puzzle: Lumen's workbench has a fault in one of three modules. The
 * player must use Ohm's voltmeter to measure across each module and
 * identify the faulty one. Two solutions are valid (any of the two
 * actual faulted modules can be the answer).
 *
 * Validation: by condition. The player's chosen module is correct if
 * its resistance differs from the expected value. They can pick which
 * one. The puzzle accepts ≥2 solutions.
 *
 * The model is pure. The engine is responsible for UI, instruments,
 * animations, and dialogue.
 */

export type ModuleId = string;

export interface DiagnosisModule {
  id: ModuleId;
  name: string;
  /** Expected resistance in ohms (the "correct" value). */
  expectedR: number;
  /** Actual resistance in ohms (with tolerance). */
  actualR: number;
  /** Voltage rating (max). */
  vMax: number;
  /** When actuallyR deviates from expectedR, the module is faulted. */
  faulted: boolean;
}

export interface DiagnosisMeasurement {
  moduleId: ModuleId;
  v: number;        // volts measured
  i: number;        // amps measured
  /** Computed: v / i. */
  r: number;
  /** True if the measurement is within range. */
  valid: boolean;
  /** The diagnosis value to compare. */
  withinTolerance: boolean;
}

export interface DiagnosisState {
  modules: DiagnosisModule[];
  /** Source voltage (V). */
  sourceV: number;
}

export interface DiagnosisResult {
  measurements: Record<ModuleId, DiagnosisMeasurement>;
  faultedModule: ModuleId;
  /** Modules the player still considers "candidates" (excluded = ruled out). */
  candidates: ModuleId[];
}

/**
 * Create a diagnosis state with the standard 3-module bench.
 * Module A is the "ritual" pick (Lumen's usual). Module B is
 * sometimes-faulted. Module C is faulted in this puzzle.
 */
export function createDiagnosisState(
  sourceV: number = 12,
): DiagnosisState {
  return {
    sourceV,
    modules: [
      { id: 'mod_a', name: 'Módulo A (el ritual)', expectedR: 100, actualR: 100, vMax: 12, faulted: false },
      { id: 'mod_b', name: 'Módulo B (el que toco poco)', expectedR: 220, actualR: 220, vMax: 12, faulted: false },
      { id: 'mod_c', name: 'Módulo C (el que no toco)', expectedR: 100, actualR: 47, vMax: 12, faulted: true },
    ],
  };
}

/**
 * Measure a module at the given source voltage. Returns a measurement
 * that includes validity flags.
 */
export function measureModule(
  state: DiagnosisState,
  moduleId: ModuleId,
  _range: 'low' | 'mid' | 'high' = 'mid',
): DiagnosisMeasurement {
  const m = state.modules.find((mm) => mm.id === moduleId);
  if (!m) {
    return {
      moduleId,
      v: 0,
      i: 0,
      r: 0,
      valid: false,
      withinTolerance: false,
    };
  }
  // V = sourceV applied across the module. I = V / R. R = V / I.
  const v = state.sourceV;
  const i = v / m.actualR;
  const r = m.actualR;
  const valid = v <= m.vMax && r > 0;
  // Within tolerance if actualR matches expectedR within 5%.
  const withinTolerance = Math.abs(r - m.expectedR) / Math.max(1, m.expectedR) < 0.05;
  return { moduleId, v, i, r, valid, withinTolerance };
}

/**
 * Identify the faulted module. Returns the module id of the first
 * faulted one. If there are multiple, the first is the "primary"
 * fault (we keep the puzzle at one fault for clarity).
 */
export function identifyFault(state: DiagnosisState): ModuleId {
  const faulted = state.modules.find((m) => m.faulted);
  return faulted ? faulted.id : '';
}

/**
 * Validate the player's answer. Returns true if the chosen module id
 * matches the actual faulted one.
 */
export function validateAnswer(
  state: DiagnosisState,
  chosenModuleId: ModuleId,
): boolean {
  return state.modules.find((m) => m.id === chosenModuleId)?.faulted === true;
}

/**
 * Provide "productive error" feedback: when the player picks the wrong
 * module, return WHY it's wrong (it might be close to faulted, might
 * be totally different, etc.). This lets the engine give informative
 * feedback instead of "incorrect".
 */
export interface ProductiveError {
  chosen: ModuleId;
  correct: ModuleId;
  reason: 'expected-different' | 'partially-ok' | 'wrong-by-ritual';
  hint: string;
}

export function explainWrongChoice(
  state: DiagnosisState,
  chosen: ModuleId,
): ProductiveError | null {
  if (validateAnswer(state, chosen)) return null;
  const c = state.modules.find((m) => m.id === chosen);
  if (!c) return null;
  const correctId = identifyFault(state);
  const correct = state.modules.find((m) => m.id === correctId);
  if (!correct) return null;
  if (c.expectedR === correct.expectedR) {
    return {
      chosen,
      correct: correctId,
      reason: 'expected-different',
      hint: `Tu módulo se ve bien a simple vista. Pero su lectura real no coincide con su valor esperado. Medilo con Ohm.`,
    };
  }
  return {
    chosen,
    correct: correctId,
    reason: 'wrong-by-ritual',
    hint: 'Tu módulo no es el que falla. Es el que Lumen cambia por costumbre. La falla está en otro.',
  };
}
