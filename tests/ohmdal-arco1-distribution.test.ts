/**
 * Tests for the distribution model (Puzzle 3).
 */

import {
  createDistributionState,
  setPrediction,
  applyDecision,
  predictionMatches,
  isValidDecision,
} from '../src/ohmdal-arco1/puzzles/distributionModel.ts';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

console.log('distributionModel:');

test('initial state: no prediction, no decision', () => {
  const s = createDistributionState();
  assert(!s.predicted, 'not predicted');
  assert(s.prediction === null, 'no prediction');
  assert(s.decision === null, 'no decision');
});

test('applyDecision without prediction is invalid', () => {
  const s = createDistributionState();
  const r = applyDecision(s, 'manantial');
  assert(!r.valid, 'invalid');
});

test('applyDecision with prediction: valid + consequence', () => {
  let s = createDistributionState();
  s = setPrediction(s, 'manantial');
  const r = applyDecision(s, 'manantial');
  assert(r.valid, 'valid');
  assert(r.energised === 'manantial', 'manantial energised');
  assert(r.consequence.length > 0, 'consequence is described');
});

test('predictionMatches: matches when prediction == decision', () => {
  const s1 = setPrediction(createDistributionState(), 'manantial');
  assert(predictionMatches(s1, 'manantial'), 'matches');
  assert(!predictionMatches(s1, 'plaza'), 'does not match');
});

test('isValidDecision: any of 3 is valid', () => {
  assert(isValidDecision('manantial'), 'manantial');
  assert(isValidDecision('plaza'), 'plaza');
  assert(isValidDecision('taller'), 'taller');
  // @ts-expect-error
  assert(!isValidDecision('unknown'), 'unknown invalid');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
