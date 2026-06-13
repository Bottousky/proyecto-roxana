import { readFileSync } from 'node:fs';
import {
  LADDER_INITIAL_CONFIGURATION,
  LADDER_PUSH,
  LADDER_SECOND_CONFIGURATION,
  LADDER_TERRACE_1_TARGET,
  LADDER_TERRACE_2_TARGET,
  calculateLadder,
  comparePrediction,
  foldLadder,
  isLadderSolution,
  parallelEquivalent,
  seriesEquivalent,
} from '../src/puzzles/ladderModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(LADDER_PUSH, 16, 'el manantial entrega Empuje 16');
equal(LADDER_TERRACE_1_TARGET, 8, 'objetivo de la terraza 1');
equal(LADDER_TERRACE_2_TARGET, 4, 'objetivo de la terraza 2');
equal(seriesEquivalent(2, 2), 4, 'dos rojas en fila dan amarilla');
equal(parallelEquivalent(4, 4), 2, 'dos amarillas en paralelo dan roja');

const canonicalFold = foldLadder(LADDER_INITIAL_CONFIGURATION);
equal(canonicalFold.terrace2Equivalent, 2, 'plegado 1: terraza 2 = roja');
equal(canonicalFold.branchToTerrace2Equivalent, 4, 'plegado 2: rama final = amarilla');
equal(canonicalFold.terrace1Equivalent, 2, 'plegado 3: amarilla en paralelo = roja');
equal(canonicalFold.totalEquivalent, 4, 'plegado 4: total = amarilla');

const canonical = calculateLadder(LADDER_INITIAL_CONFIGURATION);
equal(canonical.sourceRiver, 4, 'río del manantial 16 / 4');
equal(canonical.firstSegmentDrop, 8, 'primer tramo cobra 8');
equal(canonical.terrace1Push, 8, 'terraza 1 recibe 8');
equal(canonical.terrace2BranchRiver, 2, 'la rama hacia el fondo lleva río 2');
equal(canonical.secondSegmentDrop, 4, 'segundo tramo cobra 4');
equal(canonical.terrace2Push, 4, 'terraza 2 recibe 4');
equal(canonical.terrace2Push / canonical.push, 1 / 4, 'el fondo recibe un cuarto');
equal(
  canonical.firstSegmentDrop + canonical.terrace1Push,
  canonical.push,
  'divisor exacto en el primer nodo',
);
equal(
  canonical.secondSegmentDrop + canonical.terrace2Push,
  canonical.terrace1Push,
  'divisor exacto en el segundo nodo',
);
equal(isLadderSolution(canonical), true, 'la configuración canónica es válida');

const second = calculateLadder(LADDER_SECOND_CONFIGURATION);
equal(second.fold.terrace2Equivalent, 4, 'segunda solución: fondo amarillo');
equal(second.fold.branchToTerrace2Equivalent, 8, 'segunda solución: rama final gris');
equal(second.fold.terrace1Equivalent, 4, 'segunda solución: paralelo equivale a amarilla');
equal(second.fold.totalEquivalent, 8, 'segunda solución: total gris');
equal(second.sourceRiver, 2, 'segunda solución pide menos río');
equal(second.terrace1Push, 8, 'segunda solución conserva terraza 1 = 8');
equal(second.terrace2Push, 4, 'segunda solución conserva terraza 2 = 4');
equal(isLadderSolution(second), true, 'la segunda solución valida por condiciones');

const differentPush = calculateLadder(LADDER_INITIAL_CONFIGURATION, 8);
equal(differentPush.terrace1Push, 4, 'otro empuje conserva la mitad en terraza 1');
equal(differentPush.terrace2Push, 2, 'otro empuje conserva un cuarto en terraza 2');
equal(isLadderSolution(differentPush), true, 'la validación mantiene la proporción');

const invalid = calculateLadder({
  firstSegment: 'roja',
  terrace1: 'roja',
  secondSegment: 'roja',
  terrace2: 'roja',
});
equal(isLadderSolution(invalid), false, 'una configuración fuera de 8/4 no valida');

equal(comparePrediction(4, canonical.terrace2Push).exact, true, 'predicción 4 exacta');
equal(comparePrediction(8, canonical.terrace2Push).exact, false, 'predicción 8 incorrecta');
equal(
  comparePrediction(8, canonical.terrace2Push).measured,
  4,
  'una predicción incorrecta conserva la medición',
);

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const ladderSource = readFileSync(new URL('../src/puzzles/ladder.ts', import.meta.url), 'utf8');
const predictionSource = readFileSync(new URL('../src/ui/prediction.ts', import.meta.url), 'utf8');

equal(
  roomsSource.includes("import { abrirLadder } from '../puzzles/ladder';"),
  true,
  'rooms importa T5',
);
for (const flag of [
  'predictionAttempted',
  'predictionExact',
  'solvedLadder',
  'valleyRestored',
  'learnedKVL',
]) {
  equal(roomsSource.includes(`setFlag('${flag}')`), true, `T5 marca ${flag}`);
}
equal(roomsSource.includes("openBitacora('la-escalera')"), true, 'T5 abre la entrada mayor');
equal(roomsSource.includes('// TODO(T5)'), false, 'T5 reemplaza el placeholder');
equal(ladderSource.includes("label: 'Abrir el agua'"), true, 'existe el botón Abrir el agua');
equal(
  ladderSource.includes('openWaterButton.disabled = solved || !predictionPage.hasPrediction()'),
  true,
  'abrir agua exige predicción y queda cerrado al resolver',
);
equal(predictionSource.includes('PREDICHO Y MEDIDO: IGUALES'), true, 'la página estampa el sello');

for (const text of [
  'No vamos a tocar nada todavía. Primero lo decimos.',
  'No. Saber. Medir después es mirar. Decirlo antes — eso es entender.',
  'Diferencia entre lo dicho y lo visto: ahí está la lección. Repliegue. Vuelva a decir.',
  'Lo que sube, baja. Lo que baja, se reparte en escalones.',
  'Y los escalones de toda vuelta, sumados, dan cero.',
  'Toqué las piedras. Todas. Y supe lo que iba a pasar antes de que pasara.',
  'Registro: primera predicción del estudiante. Resultado: el futuro es calculable. Anótelo en grande.',
  'La cuenta le gana al rezo. Otra vez. Empiezo a tomármelo personal.',
]) {
  equal(ladderSource.includes(text), true, `diálogo textual T5: ${text.slice(0, 48)}`);
}

console.log('T5 ladder tests: OK');
