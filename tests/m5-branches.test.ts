import {
  BRANCH_PUSH,
  TRUNK_TOLERANCE,
  branchRiver,
  connectBranch,
  createBranchesState,
  isBranchesSolution,
  replaceTrunkFuse,
  setBranchStone,
  trunkRiver,
} from '../src/puzzles/branchesModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(BRANCH_PUSH, 8, 'Empuje fijo');
equal(TRUNK_TOLERANCE, 8, 'tolerancia del Tronco');
equal(branchRiver('marron'), 8, 'marrón deja río 8');
equal(branchRiver('roja'), 4, 'roja deja río 4');
equal(branchRiver('amarilla'), 2, 'amarilla deja río 2');
equal(branchRiver('gris'), 1, 'gris deja río 1');

let state = createBranchesState();
state = setBranchStone(state, 0, 'roja').state;
state = setBranchStone(state, 1, 'amarilla').state;
state = connectBranch(state, 0, true).state;
equal(state.branches[0].river, 4, 'la primera rama toma río según su piedra');
equal(state.branches[1].river, 0, 'la rama desconectada no recibe río');

state = connectBranch(state, 1, true).state;
equal(state.branches[0].river, 4, 'conectar otra rama no cambia la primera');
equal(state.branches[1].river, 2, 'la segunda rama toma su propio río');
equal(trunkRiver(state), 6, 'el Tronco suma los ríos conectados');

let insisted = createBranchesState();
insisted = setBranchStone(insisted, 0, 'gris').state;
insisted = setBranchStone(insisted, 1, 'marron').state;
insisted = connectBranch(insisted, 0, true).state;
let change = connectBranch(insisted, 1, true);
insisted = change.state;
equal(change.fuseResult, 'warning', 'la primera insistencia sobre 8 avisa');
change = connectBranch(insisted, 1, false);
insisted = connectBranch(change.state, 1, true).state;
equal(insisted.fuse.burned, false, 'la segunda insistencia todavía no quema');
insisted = connectBranch(insisted, 1, false).state;
change = connectBranch(insisted, 1, true);
equal(change.fuseResult, 'burned', 'la tercera insistencia quema el fusible');

let gluttonous = createBranchesState();
gluttonous = connectBranch(gluttonous, 0, true).state;
gluttonous = connectBranch(gluttonous, 1, true).state;
change = connectBranch(gluttonous, 2, true);
equal(trunkRiver(change.state), 24, 'tres marrones piden 24 al Tronco');
equal(change.fuseResult, 'burned', 'el exceso extremo quema al conectar la tercera');
equal(change.state.fuse.burned, true, 'el fusible queda inmolado');

const reset = replaceTrunkFuse(change.state);
equal(reset.fuse.burned, false, 'Lumen repone el fusible');
equal(reset.branches.every((branch) => !branch.connected), true, 'el reset deja las ramas desconectadas');

let canonical = createBranchesState();
canonical = setBranchStone(canonical, 0, 'roja').state;
canonical = setBranchStone(canonical, 1, 'amarilla').state;
canonical = setBranchStone(canonical, 2, 'gris').state;
canonical = connectBranch(canonical, 0, true).state;
canonical = connectBranch(canonical, 1, true).state;
canonical = connectBranch(canonical, 2, true).state;
equal(trunkRiver(canonical), 7, 'primera solución usa 7 de Tronco');
equal(isBranchesSolution(canonical), true, 'roja/amarilla/gris es solución válida');

let alternate = createBranchesState();
alternate = setBranchStone(alternate, 0, 'amarilla').state;
alternate = setBranchStone(alternate, 1, 'amarilla').state;
alternate = setBranchStone(alternate, 2, 'amarilla').state;
alternate = connectBranch(alternate, 0, true).state;
alternate = connectBranch(alternate, 1, true).state;
alternate = connectBranch(alternate, 2, true).state;
equal(trunkRiver(alternate), 6, 'segunda solución usa 6 de Tronco');
equal(isBranchesSolution(alternate), true, 'tres amarillas son otra solución válida');

console.log('M5 branches tests: OK');
