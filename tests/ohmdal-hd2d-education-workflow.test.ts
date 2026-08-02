import {
  advanceDiagnosis,
  createDiagnosisState,
  runDiagnosisOrder,
  type DiagnosisAction,
} from '../src/labs/ohmdal-hd2d-preprod/education/diagnosisModel.ts';
import {
  allowedPedagogicalTelemetry,
  validateBitacoraEntry,
  type BitacoraEntry,
} from '../src/labs/ohmdal-hd2d-preprod/education/bitacoraModel.ts';

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
  }],
  formalTranslation: {
    technicalName: 'Retorno abierto en circuito serie',
    variables: ['Vs', 'I', 'R1', 'R2'],
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
  validateBitacoraEntry({ ...entry, optionalEvaluationUrl: 'http://inseguro.example' }).ok,
  false,
  'evaluación opcional exige https',
);
const telemetry = allowedPedagogicalTelemetry(entry);
equal(telemetry.evidenceCount, 1, 'telemetría cuenta evidencia');
equal('illustratedExperience' in telemetry, false, 'telemetría no expone texto libre');
equal('hypothesis' in telemetry, false, 'telemetría no expone hipótesis textual');

console.log('Ohmdal HD-2D education workflow/Bitácora tests: OK');
