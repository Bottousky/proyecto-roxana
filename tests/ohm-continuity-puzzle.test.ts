import assert from 'node:assert/strict';
import {
  OhmContinuityPuzzle,
  OHM_PEDESTAL_GAPS,
} from '../src/experiences/ohmdal-playcanvas/systems/puzzles/ohmContinuityPuzzle.ts';

// 1. Initial State
const puzzle = new OhmContinuityPuzzle();
let snapshot = puzzle.getSnapshot();

assert.equal(snapshot.state, 'abierto', 'Estado inicial debe ser abierto');
assert.equal(snapshot.complete, false, 'Circuito no debe estar completo inicialmente');
assert.equal(snapshot.supplyTotal, 3, 'Bandeja debe tener 3 puentes en total');
assert.equal(snapshot.supplyLeft, 3, 'Deben quedar 3 puentes disponibles');
assert.deepEqual(snapshot.covered, [], 'No debe haber tramos cubiertos');
assert.equal(snapshot.energizedNodes.includes('FUENTE_MAS'), true, 'El borne (+) siempre tiene potencial inicial');
assert.equal(snapshot.energizedNodes.includes('OHM'), false, 'Ohm no debe estar energizado al inicio');

// 2. Placing bridge g1 (Ida Superior)
const resG1 = puzzle.toggleGap('g1');
assert.equal(resG1.success, true, 'Debe permitir acoplar g1');
if (resG1.success) {
  assert.equal(resG1.action, 'placed');
  assert.equal(resG1.state, 'tocando');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.state, 'tocando', 'Estado debe ser tocando (contacto parcial, no cerrado)');
assert.equal(snapshot.complete, false, 'Tocar no es unir: el retorno sigue abierto');
assert.equal(snapshot.supplyLeft, 2, 'Debe restar 1 puente de la bandeja');
assert.equal(snapshot.energizedNodes.includes('OHM'), true, 'La corriente llega a Ohm al cubrir g1');
assert.equal(snapshot.energizedNodes.includes('FUENTE_MENOS'), false, 'Pero no regresa a la fuente');

// 3. Attempting to place bridge on broken gap g3 (Tramo Quebrado)
const resG3 = puzzle.toggleGap('g3');
assert.equal(resG3.success, false, 'No debe permitir acoplar en tramo quebrado');
if (!resG3.success) {
  assert.equal(resG3.reason, 'broken');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.supplyLeft, 2, 'El intento en tramo quebrado no consume puente');
assert.equal(snapshot.covered.includes('g3'), false);

// 4. Testing shortcut decoy g2
const resG2 = puzzle.toggleGap('g2');
assert.equal(resG2.success, true, 'Permite acoplar g2');
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.state, 'tocando', 'Sigue tocando: g3 está roto, el atajo no cierra');
assert.equal(snapshot.complete, false);
assert.equal(snapshot.supplyLeft, 1, 'Queda 1 puente');

// 5. Supply exhaustion
const resG5 = puzzle.toggleGap('g5');
assert.equal(resG5.success, true, 'Permite usar el último puente en g5');
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.supplyLeft, 0, 'Bandeja agotada (3 puentes colocados)');
assert.equal(snapshot.complete, false, 'Aún falta g4 para cerrar el lazo');

// Attempting 4th bridge without supply
const resG4Over = puzzle.toggleGap('g4');
assert.equal(resG4Over.success, false, 'Debe rechazar por falta de puentes');
if (!resG4Over.success) {
  assert.equal(resG4Over.reason, 'no_supply');
}

// 6. Removing decoy bridge g2 (recovering material)
const resG2Remove = puzzle.toggleGap('g2');
assert.equal(resG2Remove.success, true);
if (resG2Remove.success) {
  assert.equal(resG2Remove.action, 'removed');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.supplyLeft, 1, 'Se recuperó el puente a la bandeja');
assert.equal(snapshot.covered.includes('g2'), false);

// 7. Solving the circuit: placing g4
const resG4 = puzzle.toggleGap('g4');
assert.equal(resG4.success, true);
if (resG4.success) {
  assert.equal(resG4.action, 'placed');
  assert.equal(resG4.state, 'cerrado');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.state, 'cerrado', 'Circuito debe estar cerrado');
assert.equal(snapshot.complete, true, 'Puzzle completo con g1, g5, g4');
assert.equal(snapshot.supplyLeft, 0, 'Todos los puentes usados');
assert.equal(snapshot.energizedNodes.includes('FUENTE_MENOS'), true, 'El lazo cierra en el borne (−)');

// 8. Order independence: starting fresh and placing in reverse order
const puzzle2 = new OhmContinuityPuzzle();
puzzle2.toggleGap('g4'); // return bottom west
assert.equal(puzzle2.getSnapshot().state, 'tocando');
assert.equal(puzzle2.getSnapshot().complete, false);

puzzle2.toggleGap('g5'); // return bottom east
assert.equal(puzzle2.getSnapshot().state, 'tocando');
assert.equal(puzzle2.getSnapshot().complete, false);

puzzle2.toggleGap('g1'); // source feed
assert.equal(puzzle2.getSnapshot().state, 'cerrado');
assert.equal(puzzle2.getSnapshot().complete, true);

// 9. Reset functionality
puzzle2.reset();
assert.equal(puzzle2.getSnapshot().state, 'abierto');
assert.equal(puzzle2.getSnapshot().complete, false);
assert.equal(puzzle2.getSnapshot().supplyLeft, 3);

// 10. Gap catalog metadata integrity
assert.equal(OHM_PEDESTAL_GAPS.length, 5, 'Debe tener exactamente 5 tramos definidos');
const brokenGaps = OHM_PEDESTAL_GAPS.filter((g) => g.broken);
assert.equal(brokenGaps.length, 1, 'Debe haber exactamente 1 tramo partido');
assert.equal(brokenGaps[0].id, 'g3', 'El tramo partido es g3');

console.log('✓ tests/ohm-continuity-puzzle.test.ts PASS');
