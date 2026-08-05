import {
  PUERTA_NODE_LABELS,
  passiveResistanceOhms,
  solveCircuit,
  solvePuertaTransfer,
} from '../src/ohmdal/education/circuitModel.ts';
import { runDiagnosisOrder } from '../src/ohmdal/education/diagnosisModel.ts';
import {
  measureVirtual,
  measureVirtualWithDiagnosis,
} from '../src/ohmdal/education/instrumentModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function close(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 1e-12) {
    throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
  }
}

const closed = solveCircuit('closed');
equal(closed.hasCompletePath, true, 'retorno cerrado completa la trayectoria');
equal(closed.path.join('>'), 'R1>R2>return', 'orden topológico');
equal(closed.equivalentOhms, 250, 'resistencia equivalente cerrada');
close(closed.currentAmps, 0.02, 'corriente cerrada');
equal(closed.nodeVolts.V_PLUS, 5, 'V_PLUS cerrado');
equal(closed.nodeVolts.N1, 3, 'N1 cerrado');
equal(closed.nodeVolts.N2, 0, 'N2 cerrado');
equal(closed.nodeVolts.REF, 0, 'REF cerrado');
close(closed.resistorPowerWatts.r1, 0.04, 'potencia R1');
close(closed.resistorPowerWatts.r2, 0.06, 'potencia R2');

const open = solveCircuit('open');
equal(open.hasCompletePath, false, 'retorno abierto corta la trayectoria');
equal(open.equivalentOhms, Infinity, 'resistencia equivalente abierta');
equal(open.currentAmps, 0, 'corriente abierta');
equal(open.nodeVolts.N1, 5, 'N1 abierto sin caída');
equal(open.nodeVolts.N2, 5, 'N2 abierto conserva tensión respecto de REF');
equal(open.resistorDropsVolts.return, 5, 'la tensión queda sobre la apertura');
equal(passiveResistanceOhms('V_PLUS', 'N1', 'open'), 100, 'R1 no cambia por la falla');
equal(passiveResistanceOhms('N1', 'N2', 'open'), 150, 'R2 no cambia por la falla');
equal(passiveResistanceOhms('N2', 'REF', 'open'), Infinity, 'retorno abierto pasivo');
equal(passiveResistanceOhms('V_PLUS', 'REF', 'closed'), 250, 'trayectoria pasiva completa');

const puerta = solvePuertaTransfer('closed');
equal(JSON.stringify(puerta), JSON.stringify(closed), 'la Puerta conserva el modelo técnico');
equal(PUERTA_NODE_LABELS.N2, 'bisagra_baja', 'la transferencia sólo cambia rótulos');

equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'N1', pointB: 'REF', range: 'V_5',
    power: 'energized_locked', returnState: 'closed',
  }).value,
  3,
  'tensión N1-REF',
);
equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'REF', pointB: 'N1', range: 'V_5',
    power: 'energized_locked', returnState: 'closed',
  }).value,
  -3,
  'polaridad invertida',
);
const sameNodePreconditions = runDiagnosisOrder([
  'inspect', 'record_hypothesis', 'configure_measurement', 'energize_locked', 'measure_voltage',
]);
equal(sameNodePreconditions.ok, true, 'mismo nodo parte de inspección, hipótesis y configuración');
if (!sameNodePreconditions.ok) throw new Error('precondiciones diagnósticas inesperadamente inválidas');
equal(
  measureVirtualWithDiagnosis(sameNodePreconditions.state, {
    mode: 'V_DC', pointA: 'REF', pointB: 'REF', range: 'V_0_50',
    power: 'energized_locked', returnState: 'closed',
  }).value,
  0,
  'mismo nodo con precondiciones completas devuelve 0,00 V',
);
equal(
  measureVirtualWithDiagnosis(runDiagnosisOrder([]).state, {
    mode: 'V_DC', pointA: 'REF', pointB: 'REF', range: 'V_0_50',
    power: 'energized_locked', returnState: 'closed',
  }).code,
  'WORKFLOW_PRECONDITION_MISSING',
  'la actividad no mide sin precondiciones aunque el solver bajo nivel sea puro',
);
equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'N2', pointB: 'REF', range: 'V_5',
    power: 'energized_locked', returnState: 'open',
  }).code,
  'AT_RANGE_LIMIT',
  'límite de tensión inclusivo',
);
equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'N2', pointB: 'REF', range: 'V_0_50',
    power: 'energized_locked', returnState: 'open',
  }).code,
  'OUT_OF_RANGE',
  'fuera de rango no devuelve cero',
);
equal(
  measureVirtual({
    mode: 'R', pointA: 'V_PLUS', pointB: 'REF', range: 'R_200',
    power: 'deenergized_isolated', returnState: 'closed',
  }).code,
  'OUT_OF_RANGE',
  '250 ohm no entra en 200',
);
equal(
  measureVirtual({
    mode: 'R', pointA: 'V_PLUS', pointB: 'REF', range: 'R_2000',
    power: 'deenergized_isolated', returnState: 'closed',
  }).value,
  250,
  'resistencia válida en 2000',
);
equal(
  measureVirtual({
    mode: 'CONTINUITY', pointA: 'V_PLUS', pointB: 'REF', range: 'CONT_300',
    power: 'deenergized_isolated', returnState: 'closed',
  }).code,
  'CLOSED_PATH',
  'umbral didáctico inclusivo contiene 250',
);
equal(
  measureVirtual({
    mode: 'CONTINUITY', pointA: 'V_PLUS', pointB: 'REF', range: 'CONT_300',
    power: 'deenergized_isolated', returnState: 'open',
  }).code,
  'OPEN_PATH',
  'continuidad abierta',
);
equal(
  measureVirtual({
    mode: 'R', pointA: 'N1', pointB: 'N2', range: 'R_200',
    power: 'energized_locked', returnState: 'closed',
  }).code,
  'MODE_INCOMPATIBLE_WITH_STATE',
  'modo pasivo energizado inválido',
);
equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'N1', pointB: 'REF', range: 'V_5',
    power: 'deenergized_isolated', returnState: 'closed',
  }).code,
  'STATE_NOT_MEASURABLE',
  'tensión de funcionamiento sin energía no informa cero',
);
equal(
  measureVirtual({
    mode: 'V_DC', pointA: 'DESCONOCIDO', pointB: 'REF', range: 'V_5',
    power: 'energized_locked', returnState: 'closed',
  }).code,
  'UNDEFINED_POINT',
  'nodo inválido',
);
equal(
  measureVirtual({ power: 'energized_locked', returnState: 'closed' }).code,
  'INCOMPLETE_CONFIGURATION',
  'configuración incompleta',
);

console.log('Ohmdal HD-2D education circuit/instrument tests: OK');
