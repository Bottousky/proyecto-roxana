import assert from 'node:assert/strict';
import {
  OhmContinuityPuzzle,
  OHM_PEDESTAL_GAPS,
} from '../src/experiences/ohmdal-playcanvas/systems/puzzles/ohmContinuityPuzzle.ts';

const puzzle = new OhmContinuityPuzzle();
let snapshot = puzzle.getSnapshot();

assert.equal(snapshot.state, 'abierto');
assert.equal(snapshot.complete, false);
assert.equal(snapshot.supplyTotal, 3);
assert.equal(snapshot.supplyLeft, 3);
assert.deepEqual(snapshot.covered, []);
assert.equal(snapshot.energizedNodes.includes('FUENTE_MAS'), true);
assert.equal(snapshot.energizedNodes.includes('OHM'), false);

const g1 = puzzle.toggleGap('g1');
assert.equal(g1.success, true);
if (g1.success) {
  assert.equal(g1.action, 'placed');
  assert.equal(g1.state, 'tocando');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.state, 'tocando');
assert.equal(snapshot.complete, false);
assert.equal(snapshot.supplyLeft, 2);
assert.equal(snapshot.energizedNodes.includes('OHM'), true);
assert.equal(snapshot.energizedNodes.includes('FUENTE_MENOS'), false);

const broken = puzzle.toggleGap('g3');
assert.equal(broken.success, false);
if (!broken.success) assert.equal(broken.reason, 'broken');
assert.equal(puzzle.getSnapshot().supplyLeft, 2);
assert.equal(puzzle.getSnapshot().covered.includes('g3'), false);

assert.equal(puzzle.toggleGap('g2').success, true);
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.complete, false);
assert.equal(snapshot.supplyLeft, 1);

assert.equal(puzzle.toggleGap('g5').success, true);
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.supplyLeft, 0);
assert.equal(snapshot.complete, false);

const exhausted = puzzle.toggleGap('g4');
assert.equal(exhausted.success, false);
if (!exhausted.success) assert.equal(exhausted.reason, 'no_supply');

const removeDecoy = puzzle.toggleGap('g2');
assert.equal(removeDecoy.success, true);
if (removeDecoy.success) assert.equal(removeDecoy.action, 'removed');
assert.equal(puzzle.getSnapshot().supplyLeft, 1);

const g4 = puzzle.toggleGap('g4');
assert.equal(g4.success, true);
if (g4.success) {
  assert.equal(g4.action, 'placed');
  assert.equal(g4.state, 'cerrado');
}
snapshot = puzzle.getSnapshot();
assert.equal(snapshot.state, 'cerrado');
assert.equal(snapshot.complete, true);
assert.equal(snapshot.supplyLeft, 0);
assert.equal(snapshot.energizedNodes.includes('FUENTE_MENOS'), true);

const reverse = new OhmContinuityPuzzle();
assert.equal(reverse.toggleGap('g4').success, true);
assert.equal(reverse.toggleGap('g5').success, true);
const reverseG1 = reverse.toggleGap('g1');
assert.equal(reverseG1.success, true);
if (reverseG1.success) assert.equal(reverseG1.state, 'cerrado');
assert.equal(reverse.getSnapshot().complete, true);

reverse.reset();
assert.equal(reverse.getSnapshot().state, 'abierto');
assert.equal(reverse.getSnapshot().complete, false);
assert.equal(reverse.getSnapshot().supplyLeft, 3);

assert.equal(OHM_PEDESTAL_GAPS.length, 5);
assert.equal(OHM_PEDESTAL_GAPS.filter((gap) => gap.broken).length, 1);
assert.equal(OHM_PEDESTAL_GAPS.find((gap) => gap.broken)?.id, 'g3');

console.log('Ohm continuity puzzle B2: OK');
