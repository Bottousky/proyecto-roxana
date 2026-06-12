import {
  TIMBRE_PUSH,
  CORRECT_STONE,
  STONE_VALUES,
  timbreRiver,
  createTimbreState,
  splicePathA,
  setStoneB,
  isTimbreSolved,
  timbreSoundResult,
} from '../src/puzzles/timbreModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

// Constantes básicas
equal(TIMBRE_PUSH, 4, 'Empuje fijo del timbre');
equal(CORRECT_STONE, 'roja', 'La piedra correcta es la roja');
equal(STONE_VALUES.marron, 1, 'marrón = freno 1');
equal(STONE_VALUES.roja, 2, 'roja = freno 2');
equal(STONE_VALUES.amarilla, 4, 'amarilla = freno 4');
equal(STONE_VALUES.gris, 8, 'gris = freno 8');

// Ríos
equal(timbreRiver('marron'), 4, 'marrón → río 4 (empuje 4 / freno 1)');
equal(timbreRiver('roja'), 2, 'roja → río 2 (empuje 4 / freno 2)');
equal(timbreRiver('amarilla'), 1, 'amarilla → río 1 (empuje 4 / freno 4)');
equal(timbreRiver('gris'), 0.5, 'gris → río 0.5 (empuje 4 / freno 8)');

// Estado inicial
const initial = createTimbreState();
equal(initial.pathASpliced, false, 'inicial: camino A cortado');
equal(initial.stoneB, 'marron', 'inicial: piedra marrón en B');
equal(initial.ringing, false, 'inicial: sin sonar');

// Empalmar el camino A
const spliced = splicePathA(initial);
equal(spliced.pathASpliced, true, 'empalmar activa camino A');
equal(spliced.stoneB, 'marron', 'empalmar no cambia la piedra');

// Cambiar la piedra
const withRed = setStoneB(initial, 'roja');
equal(withRed.stoneB, 'roja', 'poner piedra roja en B');
equal(withRed.pathASpliced, false, 'poner piedra no empalma');

// Condición de solución: necesita AMBAS
equal(isTimbreSolved(initial), false, 'sin empalme ni piedra correcta: no resuelto');
equal(isTimbreSolved(withRed), false, 'piedra correcta pero sin empalme: no resuelto');
equal(isTimbreSolved(spliced), false, 'empalme pero piedra marrón: no resuelto');
const solved = setStoneB(spliced, 'roja');
equal(isTimbreSolved(solved), true, 'empalme + piedra roja = resuelto');

// Resultados sonoros
// Sin empalmar
equal(timbreSoundResult(initial), 'angry', 'marrón sin empalme: zumba (río 4)');
equal(timbreSoundResult(setStoneB(initial, 'roja')), 'faint', 'roja sin empalme: apenas vibra');
equal(timbreSoundResult(setStoneB(initial, 'amarilla')), 'faint', 'amarilla sin empalme: apenas vibra');
equal(timbreSoundResult(setStoneB(initial, 'gris')), 'faint', 'gris sin empalme: apenas vibra');

// Con empalme + piedra equivocada
equal(timbreSoundResult(spliced), 'angry', 'empalme + marrón: suena rabioso (río 4)');
equal(timbreSoundResult(setStoneB(spliced, 'amarilla')), 'faint', 'empalme + amarilla: apenas vibra');
equal(timbreSoundResult(setStoneB(spliced, 'gris')), 'faint', 'empalme + gris: apenas vibra');

// Solución
equal(timbreSoundResult(solved), 'ringing', 'empalme + piedra roja: timbre suena bien');

console.log('M8 timbre tests: OK');
