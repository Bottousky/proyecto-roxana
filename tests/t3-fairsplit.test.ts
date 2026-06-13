import { readFileSync } from 'node:fs';
import {
  FAIR_SPLIT_HIGH_TARGET,
  FAIR_SPLIT_LOW_TARGET,
  FAIR_SPLIT_PUSH,
  calculateFairSplit,
  isEqualFairSplit,
  isFairSplitSolution,
  type FairSplitStone,
} from '../src/puzzles/fairsplitModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(FAIR_SPLIT_PUSH, 12, 'el manantial entrega Empuje 12');
equal(FAIR_SPLIT_HIGH_TARGET, 8, 'objetivo de la terraza alta');
equal(FAIR_SPLIT_LOW_TARGET, 4, 'objetivo de la terraza baja');

const solutionA = calculateFairSplit('roja', 'marron');
equal(solutionA.river, 4, 'solución A: río exacto');
equal(solutionA.highPush, 8, 'solución A: alta recibe 8');
equal(solutionA.lowPush, 4, 'solución A: baja recibe 4');
equal(isFairSplitSolution(solutionA), true, 'solución A valida por condiciones');

const solutionB = calculateFairSplit('amarilla', 'roja');
equal(solutionB.river, 2, 'solución B: río exacto');
equal(solutionB.highPush, 8, 'solución B: alta recibe 8');
equal(solutionB.lowPush, 4, 'solución B: baja recibe 4');
equal(isFairSplitSolution(solutionB), true, 'solución B valida por condiciones');
equal(solutionB.river < solutionA.river, true, 'las piedras grandes piden menos río');

const scaledSolution = calculateFairSplit('gris', 'amarilla');
equal(scaledSolution.river, 1, 'la escala gris/amarilla pide río 1');
equal(
  isFairSplitSolution(scaledSolution),
  true,
  'toda configuración que produce 8/4 valida por condiciones',
);

const equalStones = calculateFairSplit('roja', 'roja');
equal(equalStones.river, 3, 'piedras iguales: divisor exacto 12 / 4');
equal(equalStones.highPush, 6, 'piedras iguales: alta recibe 6');
equal(equalStones.lowPush, 6, 'piedras iguales: baja recibe 6');
equal(isEqualFairSplit(equalStones), true, 'piedras iguales reparten mitad y mitad');
equal(isFairSplitSolution(equalStones), false, 'piedras iguales no cumplen 8/4');

const stones: FairSplitStone[] = ['marron', 'roja', 'amarilla', 'gris'];
const validConfigurations = stones.flatMap((highStone) =>
  stones
    .map((lowStone) => calculateFairSplit(highStone, lowStone))
    .filter(isFairSplitSolution),
);
equal(validConfigurations.length >= 2, true, 'hay al menos dos soluciones concretas');
equal(
  validConfigurations.some((result) => result.highStone === 'roja' && result.lowStone === 'marron'),
  true,
  'la enumeración incluye la solución A',
);
equal(
  validConfigurations.some((result) => result.highStone === 'amarilla' && result.lowStone === 'roja'),
  true,
  'la enumeración incluye la solución B',
);

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const fairSplitSource = readFileSync(new URL('../src/puzzles/fairsplit.ts', import.meta.url), 'utf8');

equal(roomsSource.includes("import { abrirFairSplit } from '../puzzles/fairsplit';"), true, 'rooms importa T3');
equal(roomsSource.includes("setFlag('solvedFairSplit')"), true, 'T3 marca solvedFairSplit');
equal(roomsSource.includes("notifyNewEntry('El reparto del empuje')"), true, 'T3 notifica la entrada');
equal(roomsSource.includes('f().solvedFairSplit,'), true, 'T3 reabre en modo práctica');
equal(fairSplitSource.includes('ohmArms('), true, 'T3 reutiliza el modo brazos');

for (const text of [
  '¿Y si te lo mostramos con las manos, en chico, antes de tocar el valle de verdad?',
  'Reparto igual. Objetivo: desigual. Ajuste la proporción.',
  '¡Las dos andan! Pero la de piedras grandes pide menos río al manantial…',
  'Menos agua para el mismo riego. Eso… eso es lo que yo nunca supe calcular.',
  'El reparto es proporción, no tamaño. La proporción manda.',
  'Toqué una piedra. Por una razón. Con un número.',
  '…No tembló el valle. Se ordenó.',
]) {
  equal(fairSplitSource.includes(text), true, `diálogo textual T3: ${text.slice(0, 42)}`);
}

console.log('T3 fair split tests: OK');
