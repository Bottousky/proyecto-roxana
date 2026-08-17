import {
  advanceDiagnosis,
  createDiagnosisState,
  runDiagnosisOrder,
  type DiagnosisAction,
} from '../src/ohmdal/education/diagnosisModel.ts';
import {
  allowedPedagogicalTelemetry,
  validateBitacoraEntry,
  type BitacoraEntry,
} from '../src/ohmdal/education/bitacoraModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const finish: readonly DiagnosisAction[] = [
  'intervene', 'energize_locked', 'verify', 'deenergize_isolate', 'document',
];
const continuityFirst = runDiagnosisOrder([
  'inspect', 'record_hypothesis', 'configure_measurement', 'measure_continuity',
  'close_measurement', ...finish,
]);
equal(continuityFirst.ok, true, 'orden válido A continuidad primero');
if (continuityFirst.ok) equal(continuityFirst.state.documented, true, 'orden A documenta');

const voltageFirst = runDiagnosisOrder([
  'configure_measurement', 'inspect', 'record_hypothesis', 'energize_locked',
  'measure_voltage', 'deenergize_isolate', ...finish,
]);
equal(voltageFirst.ok, true, 'orden válido B tensión primero');
if (voltageFirst.ok) equal(voltageFirst.state.documented, true, 'orden B documenta');

let state = createDiagnosisState();
let transition = advanceDiagnosis(state, 'record_hypothesis');
equal(transition.ok, false, 'hipótesis sin inspección rechazada');
if (!transition.ok) equal(transition.error, 'INSPECTION_REQUIRED', 'código de inspección');

transition = advanceDiagnosis(state, 'intervene');
equal(transition.ok, false, 'intervención sin evidencia rechazada');
if (!transition.ok) equal(transition.error, 'EVIDENCE_REQUIRED', 'código de evidencia');

const active = runDiagnosisOrder([
  'inspect', 'record_hypothesis', 'configure_measurement', 'energize_locked', 'measure_voltage',
]);
if (!active.ok) throw new Error('precondición de medición activa inesperadamente inválida');
transition = advanceDiagnosis(active.state, 'intervene');
equal(transition.ok, false, 'intervención energizada rechazada');
if (!transition.ok) equal(transition.error, 'INTERVENTION_BLOCKED', 'bloqueo de intervención');
equal(transition.state.intervened, false, 'el bloqueo no muta la intervención');

const prematureDocument = runDiagnosisOrder(['inspect', 'record_hypothesis', 'document']);
equal(prematureDocument.ok, false, 'documentar sin verificar se rechaza');
if (!prematureDocument.ok) {
  equal(prematureDocument.error, 'VERIFICATION_REQUIRED', 'código de verificación');
}

const entry: BitacoraEntry = {
  illustratedExperience: 'Croquis de la ruta apagada y la marca de retorno.',
  evidence: [{
    hypothesis: 'El retorno está abierto.',
    pointA: 'N2',
    pointB: 'REF',
    magnitude: 'V_DC',
    value: 5,
    unit: 'V',
    powerState: 'energized_locked',
    observedErrorCodes: ['OUT_OF_RANGE'],
  }],
  formalTranslation: {
    technicalName: 'Retorno abierto en circuito serie',
    schematicDescription: 'Vs—R1—R2—retorno—REF; apertura entre N2 y REF.',
    variables: ['Vs', 'I', 'R1', 'R2'],
    units: ['V', 'A', 'ohm', 'W'],
    mathematicalRelation: 'Req = R1 + R2; I = Vs / Req',
    assumptions: ['componentes ideales', 'fuente virtual limitada'],
    metaphorLimit: 'La luz no es carga eléctrica.',
  },
  nextQuestion: '¿Reconozco la misma topología si cambia la disposición?',
  optionalEvaluationUrl: 'https://escuela.example/evaluacion-opcional',
};
equal(validateBitacoraEntry(entry).ok, true, 'Bitácora completa');
equal(
  validateBitacoraEntry({ ...entry, nextQuestion: '' }).ok,
  false,
  'Bitácora sin siguiente pregunta incompleta',
);
equal(
  validateBitacoraEntry({
    ...entry,
    formalTranslation: { ...entry.formalTranslation, variables: ['   '] },
  }).ok,
  false,
  'Bitácora rechaza variables vacías',
);
equal(
  validateBitacoraEntry({
    ...entry,
    evidence: [{ ...entry.evidence[0], unit: 'ohm' }],
  }).ok,
  false,
  'Bitácora rechaza unidad incompatible con tensión',
);
equal(
  validateBitacoraEntry({
    ...entry,
    evidence: [{ ...entry.evidence[0], value: Number.NaN }],
  }).ok,
  false,
  'Bitácora rechaza valor no finito',
);
equal(
  validateBitacoraEntry({
    ...entry,
    evidence: [{ ...entry.evidence[0], magnitude: undefined }],
  }).ok,
  false,
  'Bitácora rechaza magnitud ausente',
);
equal(
  validateBitacoraEntry({
    ...entry,
    evidence: [{ ...entry.evidence[0], observedErrorCodes: undefined }],
  }).ok,
  false,
  'Bitácora devuelve incompleto si faltan errores observados',
);
equal(
  validateBitacoraEntry({
    ...entry,
    formalTranslation: { ...entry.formalTranslation, mathematicalRelation: undefined },
  }).ok,
  false,
  'Bitácora devuelve incompleto si falta la relación matemática',
);
equal(
  validateBitacoraEntry({
    ...entry,
    evidence: [{
      ...entry.evidence[0],
      magnitude: 'CONTINUITY',
      value: 301,
      unit: 'ohm',
      powerState: 'deenergized_isolated',
    }],
  }).ok,
  false,
  'Bitácora rechaza continuidad numérica sobre 300 ohm',
);
equal(
  validateBitacoraEntry({ ...entry, optionalEvaluationUrl: 'http://inseguro.example' }).ok,
  false,
  'evaluación opcional exige https',
);
const telemetry = allowedPedagogicalTelemetry(entry);
equal(telemetry.evidenceCount, 1, 'telemetría cuenta evidencia');
equal('illustratedExperience' in telemetry, false, 'telemetría no expone texto libre');
equal('hypothesis' in telemetry, false, 'telemetría no expone hipótesis textual');

console.log('Ohmdal HD-2D education workflow/Bitácora tests: OK');
