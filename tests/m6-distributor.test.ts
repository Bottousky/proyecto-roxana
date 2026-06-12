import {
  DISTRIBUTOR_STONES,
  createDistributorState,
  distributorTrunkRiver,
  isAlternativeDistributorSolution,
  isDistributorSolution,
  setDistributorPush,
  setDistributorStone,
} from '../src/puzzles/distributorModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function configure(
  push: 4 | 8 | 16,
  stones: readonly [
    (typeof DISTRIBUTOR_STONES)[number],
    (typeof DISTRIBUTOR_STONES)[number],
    (typeof DISTRIBUTOR_STONES)[number],
  ],
) {
  let state = createDistributorState();
  state = setDistributorPush(state, push).state;
  stones.forEach((stone, index) => {
    state = setDistributorStone(state, index, stone).state;
  });
  return state;
}

const canonical = configure(8, ['roja', 'amarilla', 'gris']);
equal(distributorTrunkRiver(canonical), 7, 'la solución canónica usa 7 de Tronco');
equal(isDistributorSolution(canonical), true, 'Empuje 8 roja/amarilla/gris es válida');
equal(isAlternativeDistributorSolution(canonical), false, 'la canónica no es la alternativa');

const alternate = configure(4, ['marron', 'roja', 'amarilla']);
equal(distributorTrunkRiver(alternate), 7, 'la solución alternativa usa 7 de Tronco');
equal(isDistributorSolution(alternate), true, 'Empuje 4 marrón/roja/amarilla es válida');
equal(isAlternativeDistributorSolution(alternate), true, 'se reconoce la alternativa');

let push16Solutions = 0;
for (const forja of DISTRIBUTOR_STONES) {
  for (const campanario of DISTRIBUTOR_STONES) {
    for (const biblioteca of DISTRIBUTOR_STONES) {
      const candidate = configure(16, [forja, campanario, biblioteca]);
      if (isDistributorSolution(candidate)) push16Solutions++;
    }
  }
}
equal(push16Solutions, 0, 'ninguna de las 64 combinaciones con Empuje 16 es válida');

let insisted = createDistributorState();
insisted = setDistributorPush(insisted, 16).state;
let change = setDistributorStone(insisted, 0, 'marron');
insisted = change.state;
equal(change.fuseResult, 'warning', 'la primera insistencia avisa');
change = setDistributorStone(insisted, 0, 'roja');
insisted = change.state;
equal(change.fuseResult, 'warning', 'la segunda insistencia avisa');
equal(insisted.fuse.burned, false, 'la segunda insistencia todavía no quema');
change = setDistributorStone(insisted, 0, 'marron');
equal(change.fuseResult, 'burned', 'la tercera insistencia quema el fusible');
equal(change.state.fuse.burned, true, 'el fusible queda inmolado');

console.log('M6 distributor tests: OK');
