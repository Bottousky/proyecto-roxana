import {
  CHAIN_INITIAL_LAMPS,
  CHAIN_INITIAL_PUSH,
  CHAIN_LAMP_BRAKE,
  CHAIN_MAX_LAMPS,
  CHAIN_MIN_LAMPS,
  CHAIN_TARGET_LAMPS,
  REMOVAL_ANSWER,
  RIVER_ANSWER,
  addChainLamp,
  chainBand,
  chainReading,
  chainRiver,
  chainSegmentIds,
  createChainState,
  measureChainSegment,
  predictRemoval,
  predictRiver,
  removeChainLamp,
  setChainPush,
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
equal(CHAIN_TARGET_LAMPS, 6, 'la fila se restaura a las seis');
equal(CHAIN_LAMP_BRAKE, 2, 'cada lámpara frena lo mismo');
equal(CHAIN_INITIAL_PUSH, 8, 'el cristal arranca débil (austeridad)');
equal(RIVER_ANSWER, 'igual', 'el río es el mismo en toda la fila');
equal(REMOVAL_ANSWER, 'apagan', 'cortar un eslabón apaga la fila entera');

// El río es el mismo en cada punto de la fila.
const segments = chainSegmentIds(6);
equal(segments.length, 7, 'seis lámparas: antes, cinco entre medio y después');
for (const segment of segments) {
  closeTo(chainReading(16, 6, segment), 16 / 12, `mismo río en ${segment}`);
}

// Frenos que se suman: a igual empuje, más lámparas = menos río para todas.
closeTo(chainRiver(8, 4), 1, 'cuatro con cristal débil: tenue');
closeTo(chainRiver(16, 6), 16 / 12, 'seis con cristal fuerte: brillo justo');
closeTo(chainRiver(16, 4), 2, 'cuatro con cristal fuerte: bien');
closeTo(chainRiver(16, 2), 4, 'dos solas con cristal fuerte: demasiado');

equal(chainBand(8, 4), 'tenue', 'estado inicial tenue');
equal(chainBand(16, 6), 'bien', 'seis lámparas a pleno con el cristal fuerte');
equal(chainBand(8, 6), 'tenue', 'seis lámparas con cristal débil no alcanzan');
equal(chainBand(4, 6), 'casi-nada', 'seis lámparas con el cristal flojo casi no brillan');
equal(chainBand(16, 4), 'bien', 'cuatro con cristal fuerte brillan bien');
equal(chainBand(16, 2), 'demasiado', 'dos solas se queman');

// El recorrido de aprendizaje: predecir, medir, predecir, cortar, restaurar.
let state = createChainState();
equal(state.push, 8, 'arranca con el cristal débil');
equal(state.lampCount, 4, 'la fila empieza con cuatro lámparas');
equal(state.solved, false, 'no empieza resuelto');

state = predictRiver(state, 'antes');
equal(state.predictions.river, 'antes', 'registra la apuesta de río (aunque sea errada)');
for (const segment of chainSegmentIds(state.lampCount)) {
  state = measureChainSegment(state, segment);
}
equal(state.experiences.measuredSameRiver, true, 'medir toda la fila revela un solo río');

state = predictRemoval(state, 'iguales');
equal(state.predictions.removal, 'iguales', 'registra la apuesta de corte');
let change = removeChainLamp(state);
state = change.state;
equal(change.interrupted, true, 'quitar una lámpara interrumpe toda la fila');
equal(state.experiences.removedLamp, true, 'registra la experiencia de cortar');
equal(state.lampCount, 3, 'queda una lámpara menos');

// Restaurar: volver a seis y subir el cristal, nunca recortar.
state = addChainLamp(state).state;
state = addChainLamp(state).state;
state = addChainLamp(state).state;
equal(state.lampCount, 6, 'se restauran las seis lámparas');
equal(state.experiences.addedLamp, true, 'registra la experiencia de agregar');
equal(state.solved, false, 'seis lámparas con cristal débil todavía no resuelven');

state = setChainPush(state, 16);
equal(state.push, 16, 'se sube al cristal fuerte');
equal(state.solved, true, 'resuelve: seis lámparas a brillo justo, sin recortar');

// La victoria NO se alcanza recortando: cuatro lámparas a brillo bien no basta.
let austerity = createChainState();
austerity = predictRiver(austerity, RIVER_ANSWER);
for (const segment of chainSegmentIds(austerity.lampCount)) {
  austerity = measureChainSegment(austerity, segment);
}
austerity = predictRemoval(austerity, REMOVAL_ANSWER);
austerity = removeChainLamp(austerity).state; // 3 lámparas
austerity = setChainPush(austerity, 16);
equal(chainBand(austerity.push, austerity.lampCount), 'bien', 'tres con cristal fuerte brillan bien…');
equal(austerity.solved, false, '…pero recortar no resuelve: la meta son las seis');

// Límites de la fila.
let lowerBound = createChainState();
for (let i = 0; i < 5; i++) lowerBound = removeChainLamp(lowerBound).state;
equal(lowerBound.lampCount, 1, 'no baja de una lámpara');
equal(removeChainLamp(lowerBound).interrupted, false, 'el límite no simula un corte');

let upperBound = createChainState();
for (let i = 0; i < 5; i++) upperBound = addChainLamp(upperBound).state;
equal(upperBound.lampCount, 6, 'no sube de seis lámparas');

console.log('M4 chain tests: OK');
