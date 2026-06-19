import {
  BRANCH_PUSH,
  TRUNK_TOLERANCE,
  branchRiver,
  connectBranch,
  createBranchesState,
  isBranchesSolution,
  predictIndependence,
  predictTrunk,
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
equal(state.branches[0].connected, true, 'la primera rama inicia conectada');
equal(state.branches[0].stone, 'amarilla', 'la primera rama inicia amarilla');
equal(state.branches[0].river, 2, 'la primera rama inicia con río 2');
equal(state.branches[1].connected, false, 'la segunda rama inicia desconectada');
equal(state.branches[1].stone, 'amarilla', 'la segunda rama inicia amarilla');
equal(state.branches[1].river, 0, 'la segunda rama inicia sin río');
equal(state.branches[2].connected, false, 'la tercera rama inicia desconectada');
equal(state.branches[2].stone, 'amarilla', 'la tercera rama inicia amarilla');
equal(state.branches[2].river, 0, 'la tercera rama inicia sin río');

state = predictIndependence(state, 'igual');
equal(state.predictions.independence, 'igual', 'predictIndependence setea la predicción');
state = predictTrunk(state, 'sobrecarga');
equal(state.predictions.trunk, 'sobrecarga', 'predictTrunk setea la predicción');

state = createBranchesState();
const firstRiver = state.branches[0].river;
state = connectBranch(state, 1, true).state;
equal(state.branches[0].river, firstRiver, 'conectar la segunda no cambia el río de la primera');
equal(state.branches[1].river, 2, 'la segunda rama toma su propio río');
equal(state.experiences.connectedSecond, true, 'conectar la segunda marca la experiencia');
equal(trunkRiver(state), 4, 'el Tronco suma las ramas conectadas');

let insisted = createBranchesState();
insisted = setBranchStone(insisted, 1, 'marron').state;
let change = connectBranch(insisted, 1, true);
insisted = change.state;
equal(trunkRiver(insisted), 10, 'la sobrecarga moderada supera tolerancia');
equal(change.fuseResult, 'warning', 'la primera insistencia sobre 8 avisa');
change = connectBranch(insisted, 1, false);
insisted = connectBranch(change.state, 1, true).state;
equal(insisted.fuse.burned, false, 'la segunda insistencia todavía no quema');
insisted = connectBranch(insisted, 1, false).state;
change = connectBranch(insisted, 1, true);
equal(change.fuseResult, 'burned', 'la tercera insistencia quema el fusible');

let gluttonous = createBranchesState();
gluttonous = setBranchStone(gluttonous, 0, 'marron').state;
gluttonous = setBranchStone(gluttonous, 1, 'marron').state;
gluttonous = setBranchStone(gluttonous, 2, 'marron').state;
gluttonous = connectBranch(gluttonous, 1, true).state;
change = connectBranch(gluttonous, 2, true);
equal(trunkRiver(change.state), 24, 'tres marrones piden 24 al Tronco');
equal(change.fuseResult, 'burned', 'el exceso extremo quema al conectar la tercera');
equal(change.state.fuse.burned, true, 'el fusible queda inmolado');

const reset = replaceTrunkFuse(change.state);
equal(reset.fuse.burned, false, 'Lumen repone el fusible');
equal(reset.fuse.overloads, 0, 'Lumen resetea las insistencias');
equal(reset.branches.every((branch) => !branch.connected), true, 'el reset deja las ramas desconectadas');

let canonical = createBranchesState();
canonical = predictIndependence(canonical, 'igual');
canonical = connectBranch(canonical, 1, true).state;
canonical = predictTrunk(canonical, 'sobrecarga');
canonical = connectBranch(canonical, 2, true).state; // tres amarillas = Tronco 6, sin sobrecarga
equal(canonical.experiences.sawTrunkStrain, false, 'tres amarillas no sobrecargan el Tronco');
equal(isBranchesSolution(canonical), false, 'sin vivir la sobrecarga todavía no gana');
canonical = setBranchStone(canonical, 0, 'marron').state; // 8+2+2 = 12 > 8: el Tronco salta
equal(canonical.experiences.sawTrunkStrain, true, 'pedir de más marca la experiencia de sobrecarga');
canonical = setBranchStone(canonical, 0, 'gris').state;
canonical = setBranchStone(canonical, 1, 'gris').state;
canonical = setBranchStone(canonical, 2, 'gris').state;
equal(trunkRiver(canonical), 3, 'tres grises usan 3 de Tronco');
equal(isBranchesSolution(canonical), true, 'tres conectadas, Tronco <= 8, predicciones y sobrecarga vivida → gana');
equal(canonical.solved, true, 'el estado derivado queda resuelto');

let neverStrained = createBranchesState();
neverStrained = predictIndependence(neverStrained, 'igual');
neverStrained = connectBranch(neverStrained, 1, true).state;
neverStrained = predictTrunk(neverStrained, 'sobrecarga');
neverStrained = setBranchStone(neverStrained, 0, 'gris').state;
neverStrained = setBranchStone(neverStrained, 1, 'gris').state;
neverStrained = setBranchStone(neverStrained, 2, 'gris').state;
neverStrained = connectBranch(neverStrained, 2, true).state;
equal(neverStrained.experiences.sawTrunkStrain, false, 'nunca le pidió de más al Tronco');
equal(isBranchesSolution(neverStrained), false, 'no gana sin vivir la sobrecarga del Tronco');

let withoutPredictions = createBranchesState();
withoutPredictions = setBranchStone(withoutPredictions, 0, 'gris').state;
withoutPredictions = setBranchStone(withoutPredictions, 1, 'gris').state;
withoutPredictions = setBranchStone(withoutPredictions, 2, 'gris').state;
withoutPredictions = connectBranch(withoutPredictions, 1, true).state;
withoutPredictions = connectBranch(withoutPredictions, 2, true).state;
equal(trunkRiver(withoutPredictions), 3, 'la misma configuración física usa 3 de Tronco');
equal(isBranchesSolution(withoutPredictions), false, 'sin predicciones no hay victoria');

let disconnected = createBranchesState();
disconnected = predictIndependence(disconnected, 'igual');
disconnected = connectBranch(disconnected, 1, true).state;
disconnected = predictTrunk(disconnected, 'sobrecarga');
equal(isBranchesSolution(disconnected), false, 'no gana si falta una rama conectada');

let overloaded = createBranchesState();
overloaded = predictIndependence(overloaded, 'igual');
overloaded = predictTrunk(overloaded, 'sobrecarga');
overloaded = setBranchStone(overloaded, 1, 'marron').state;
overloaded = setBranchStone(overloaded, 2, 'gris').state;
overloaded = connectBranch(overloaded, 1, true).state;
overloaded = connectBranch(overloaded, 2, true).state;
equal(trunkRiver(overloaded), 11, 'la configuración sobrecarga el Tronco');
equal(isBranchesSolution(overloaded), false, 'no gana con Tronco > 8');

console.log('M5 branches tests: OK');
