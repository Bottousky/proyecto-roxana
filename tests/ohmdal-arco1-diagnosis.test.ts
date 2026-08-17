/**
 * Tests for the diagnosis model (Puzzle 2).
 */

import {
  createDiagnosisState,
  measureModule,
  identifyFault,
  validateAnswer,
  explainWrongChoice,
} from '../src/ohmdal-arco1/puzzles/diagnosisModel.ts';

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

console.log('diagnosisModel:');

test('default state: mod_c is faulted', () => {
  const s = createDiagnosisState(12);
  const id = identifyFault(s);
  assert(id === 'mod_c', `expected mod_c, got ${id}`);
});

test('measureModule returns valid reading for intact module', () => {
  const s = createDiagnosisState(12);
  const m = measureModule(s, 'mod_a');
  assert(m.valid, 'measurement is valid');
  assert(Math.abs(m.r - 100) < 0.1, `R is ~100 ohms, got ${m.r}`);
  assert(Math.abs(m.v - 12) < 0.1, `V is 12, got ${m.v}`);
  assert(m.withinTolerance, 'mod_a is within tolerance');
});

test('measureModule detects faulted module', () => {
  const s = createDiagnosisState(12);
  const m = measureModule(s, 'mod_c');
  assert(m.valid, 'measurement is valid (R is still positive)');
  assert(!m.withinTolerance, 'mod_c is NOT within tolerance');
  assert(Math.abs(m.r - 47) < 0.1, `R is 47 ohms, got ${m.r}`);
});

test('validateAnswer: mod_c is the correct answer', () => {
  const s = createDiagnosisState(12);
  assert(validateAnswer(s, 'mod_c'), 'mod_c is correct');
  assert(!validateAnswer(s, 'mod_a'), 'mod_a is wrong');
  assert(!validateAnswer(s, 'mod_b'), 'mod_b is wrong');
});

test('explainWrongChoice: ritual pick produces informative feedback', () => {
  const s = createDiagnosisState(12);
  const e = explainWrongChoice(s, 'mod_a');
  assert(e != null, 'explains mod_a choice');
  assert(e!.hint.length > 0, 'hint is non-empty');
});

test('explainWrongChoice: correct choice returns null', () => {
  const s = createDiagnosisState(12);
  const e = explainWrongChoice(s, 'mod_c');
  assert(e == null, 'no explanation for correct choice');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
