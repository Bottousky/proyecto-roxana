import {
  CHAIN_INITIAL_LAMPS,
  CHAIN_MAX_LAMPS,
  CHAIN_MIN_LAMPS,
  CHAIN_TARGET_LAMPS,
  addChainLamp,
  chainBrightness,
  chainBrightnessBand,
  chainReading,
  chainSegmentIds,
  createChainState,
  measureChainSegment,
  removeChainLamp,
} from '../src/puzzles/chainModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function closeTo(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
  }
}

equal(CHAIN_MIN_LAMPS, 1, 'mínimo de lámparas');
equal(CHAIN_MAX_LAMPS, 6, 'máximo de lámparas');
equal(CHAIN_INITIAL_LAMPS, 4, 'estado inicial');
equal(CHAIN_TARGET_LAMPS, 2, 'configuración objetivo');

closeTo(chainReading(2, 'before'), 2, 'dos lámparas dan brillo correcto');
closeTo(chainBrightness(2), chainReading(2, 'after'), 'el brillo es función del río');
equal(chainBrightnessBand(2), 'correcta', 'dos lámparas en zona correcta');
equal(chainBrightnessBand(3), 'tenue', 'tres lámparas tenues');
equal(chainBrightnessBand(4), 'tenue', 'cuatro lámparas tenues');
equal(chainBrightnessBand(5), 'casi-nada', 'cinco lámparas casi apagadas');
equal(chainBrightnessBand(6), 'casi-nada', 'seis lámparas casi apagadas');

const segments = chainSegmentIds(4);
equal(segments.length, 5, 'hay un punto antes, tres entre lámparas y uno después');
for (const segment of segments) {
  closeTo(chainReading(4, segment), 1, `mismo río en ${segment}`);
}

let state = createChainState();
equal(state.lampCount, 4, 'la fila empieza con cuatro lámparas');
equal(state.experiences.measuredSameRiver, false, 'todavía no midió toda la fila');
equal(state.solved, false, 'no empieza resuelto');

for (const segment of segments) {
  state = measureChainSegment(state, segment);
}
equal(state.experiences.measuredSameRiver, true, 'medir todos los puntos registra un solo río');

let change = removeChainLamp(state);
state = change.state;
equal(change.interrupted, true, 'quitar una lámpara interrumpe toda la fila');
equal(state.lampCount, 3, 'queda una lámpara menos');
equal(state.experiences.removedLamp, true, 'registra la experiencia de quitar');

change = addChainLamp(state);
state = change.state;
equal(change.interrupted, false, 'agregar no abre la fila');
equal(state.lampCount, 4, 'vuelve a haber cuatro lámparas');
equal(state.experiences.addedLamp, true, 'registra la experiencia de agregar');
equal(state.solved, false, 'las experiencias no bastan sin la configuración objetivo');

state = removeChainLamp(state).state;
state = removeChainLamp(state).state;
equal(state.lampCount, 2, 'queda la cantidad justa');
equal(state.solved, true, 'resuelve con las tres experiencias y dos lámparas');

let lowerBound = createChainState();
lowerBound = removeChainLamp(lowerBound).state;
lowerBound = removeChainLamp(lowerBound).state;
lowerBound = removeChainLamp(lowerBound).state;
change = removeChainLamp(lowerBound);
equal(change.state.lampCount, 1, 'no baja de una lámpara');
equal(change.interrupted, false, 'el límite no simula un corte');

let upperBound = createChainState();
upperBound = addChainLamp(upperBound).state;
upperBound = addChainLamp(upperBound).state;
change = addChainLamp(upperBound);
equal(change.state.lampCount, 6, 'no sube de seis lámparas');

console.log('M4 chain tests: OK');
