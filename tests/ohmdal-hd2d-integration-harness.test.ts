import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SAFE_DIAGNOSIS_SEQUENCE,
  advanceSafeDiagnosis,
  createDiagnosisHarnessState,
  directionIndex,
  headingDegrees,
  updateDiagnosisUnlock,
  zoneForPosition,
} from '../src/labs/ohmdal-hd2d-preprod/integration/harnessState.ts';

test('direction boundaries use the documented next-clockwise tie break', () => {
  assert.equal(directionIndex(45, 4), 1);
  assert.equal(directionIndex(22.5, 8), 1);
  assert.equal(directionIndex(headingDegrees(1, 0), 4), 1);
});

test('the safe diagnosis sequence completes without bypassing verification', () => {
  let harness = createDiagnosisHarnessState();
  for (const _action of SAFE_DIAGNOSIS_SEQUENCE) harness = advanceSafeDiagnosis(harness);
  assert.equal(harness.nextIndex, SAFE_DIAGNOSIS_SEQUENCE.length);
  assert.equal(harness.state.verified, true);
  assert.equal(harness.state.documented, true);
});

test('positions resolve to the three authored sets', () => {
  assert.equal(zoneForPosition({ x: -18, y: 0, z: 0 }), 'portal_plaza');
  assert.equal(zoneForPosition({ x: 2, y: 0, z: 0 }), 'taller');
  assert.equal(zoneForPosition({ x: 16, y: 0, z: 0 }), 'puerta_manantial');
});

test('diagnosis stays locked in Portal and unlocks only after visiting Taller', () => {
  assert.equal(updateDiagnosisUnlock(false, 'portal_plaza'), false);
  assert.equal(updateDiagnosisUnlock(false, 'taller'), true);
  assert.equal(updateDiagnosisUnlock(true, 'puerta_manantial'), true);
});
