import { readFileSync } from 'node:fs';
import {
  TIMBRE_MAX_STONES,
  TIMBRE_PUSH,
  PATH_A_BRAKE,
  STONE_VALUES,
  timbreResistance,
  timbreRiver,
  timbrePathRiver,
  timbrePathSoundResult,
  createTimbreState,
  splicePathA,
  setStoneB,
  removeStoneB,
  verifyTimbrePath,
  isTimbreSolved,
} from '../src/puzzles/timbreModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(TIMBRE_PUSH, 4, 'empuje fijo');
equal(PATH_A_BRAKE, 2, 'A tiene freno fijo 2');
equal(TIMBRE_MAX_STONES, 2, 'B admite como máximo dos engastes');
equal(STONE_VALUES.gris, 8, 'gris = 8');
equal(timbreResistance(['marron', 'marron']), 2, 'dos piedras en fila suman sus frenos');
equal(timbreRiver(['marron']), 4, 'B marrón sola sobrealimenta');
equal(timbreRiver(['roja']), 2, 'B roja sola entrega río 2');
equal(timbreRiver(['marron', 'marron']), 2, 'B marrón+marrón también entrega río 2');

const initial = createTimbreState();
equal(initial.stonesB.join('+'), 'marron', 'B empieza con una piedra marrón equivocada');
equal(timbrePathRiver(initial, 'A'), 0, 'A cortado no conduce');
equal(timbrePathSoundResult(initial, 'A'), 'silent', 'A cortado queda mudo');
equal(timbrePathSoundResult(initial, 'B'), 'angry', 'B marrón gruñe');

let repairedA = splicePathA(initial);
equal(timbrePathRiver(repairedA, 'A'), 2, 'A reparado entrega río 2');
equal(timbrePathSoundResult(repairedA, 'A'), 'ringing', 'A solo hace sonar el timbre');
repairedA = verifyTimbrePath(repairedA, 'A');
equal(repairedA.verifiedA, true, 'A queda verificado por separado');
equal(isTimbreSolved(repairedA), false, 'falta verificar B');

let redSolution = setStoneB(repairedA, 0, 'roja');
equal(timbrePathSoundResult(redSolution, 'B'), 'ringing', 'roja sola hace sonar B');
redSolution = verifyTimbrePath(redSolution, 'B');
equal(redSolution.verifiedB, true, 'B rojo queda verificado');
equal(isTimbreSolved(redSolution), true, 'A probado + B rojo probado resuelven');

let doubleBrownSolution = setStoneB(repairedA, 1, 'marron');
equal(doubleBrownSolution.stonesB.join('+'), 'marron+marron', 'se agrega un segundo engaste');
equal(timbrePathSoundResult(doubleBrownSolution, 'B'), 'ringing', 'marrón+marrón hace sonar B');
doubleBrownSolution = verifyTimbrePath(doubleBrownSolution, 'B');
equal(doubleBrownSolution.verifiedB, true, 'B marrón+marrón queda verificado');
equal(isTimbreSolved(doubleBrownSolution), true, 'A probado + B doble marrón resuelven');

let bFirst = setStoneB(splicePathA(initial), 0, 'roja');
bFirst = verifyTimbrePath(bFirst, 'B');
equal(bFirst.verifiedB, true, 'B puede sonar y verificarse antes que A');
equal(isTimbreSolved(bFirst), false, 'verificar sólo B no completa la reparación');
bFirst = verifyTimbrePath(bFirst, 'A');
equal(isTimbreSolved(bFirst), true, 'el puzzle termina recién después de probar A y B');

const mixed = setStoneB(setStoneB(initial, 0, 'roja'), 1, 'marron');
equal(timbreResistance(mixed.stonesB), 3, 'roja+marrón suma freno 3');
equal(timbrePathSoundResult(mixed, 'B'), 'faint', 'una suma distinta de 2 no valida B');
equal(verifyTimbrePath(mixed, 'B').verifiedB, false, 'un estado inválido no se verifica');

const changedRed = setStoneB(redSolution, 0, 'amarilla');
equal(changedRed.verifiedB, false, 'cambiar el único engaste invalida la prueba de B');
equal(isTimbreSolved(changedRed), false, 'tras cambiar B hace falta probar de nuevo');

const removedBrown = removeStoneB(doubleBrownSolution, 1);
equal(removedBrown.stonesB.join('+'), 'marron', 'se puede quitar el segundo engaste');
equal(removedBrown.verifiedB, false, 'quitar un engaste invalida la prueba de B');
equal(removeStoneB(removedBrown, 0), removedBrown, 'B conserva al menos un engaste');

const sameRed = setStoneB(redSolution, 0, 'roja');
equal(sameRed.verifiedB, true, 'elegir el mismo engaste no invalida una prueba sin cambios');

const puzzleSource = readFileSync(new URL('../src/puzzles/timbre.ts', import.meta.url), 'utf8');
equal(puzzleSource.includes('aria-label="Dos engastes en fila"'), true, 'la UI muestra dos slots claros');
equal(puzzleSource.includes('removeStoneB(state, index)'), true, 'la UI permite quitar engastes');
equal(puzzleSource.includes('makeInteractive(el, PIEDRAS[stone].nombre)'), true, 'las piedras funcionan por teclado');
equal(puzzleSource.includes("testPath('A')"), true, 'A conserva su prueba independiente');
equal(puzzleSource.includes("testPath('B')"), true, 'B conserva su prueba independiente');

console.log('M8 timbre tests: OK');
