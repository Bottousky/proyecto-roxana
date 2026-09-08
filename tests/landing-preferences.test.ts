import assert from 'node:assert/strict';
import {
  parsePreferences,
  defaultPreferences,
  savePreferences,
  readPreferences,
} from '../src/landing/preferences.ts';
import { readSchoolState } from '../src/landing/schoolModel.ts';

assert.deepEqual(parsePreferences(null), defaultPreferences());
for (const invalid of ['{', 'null', '[]', 'false', '42', '"high"']) {
  assert.deepEqual(
    parsePreferences(invalid, true),
    defaultPreferences(true),
    `invalid preferences: ${invalid}`,
  );
}
assert.deepEqual(
  parsePreferences(
    '{"quality":"ultra","motion":"false","sound":1,"labels":null}',
  ),
  defaultPreferences(),
);
assert.deepEqual(
  parsePreferences(
    '{"quality":"low","motion":true,"sound":false,"labels":false}',
  ),
  {
    quality: 'low',
    motion: true,
    sound: false,
    labels: false,
  },
);
assert.equal(
  parsePreferences('{"motion":false}', true).motion,
  false,
  'explicit motion preference overrides the OS default',
);

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  get() {
    throw new Error('Storage blocked');
  },
});
try {
  assert.equal(savePreferences(defaultPreferences()), false);
  assert.deepEqual(readPreferences(), defaultPreferences());
  assert.equal(readSchoolState().electronica.unidadesCompletadas, 0);
  assert.equal(readSchoolState().aulas.electronica, 'off');
} finally {
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
  else Reflect.deleteProperty(globalThis, 'localStorage');
}
console.log('Landing preferences: malformed and blocked storage handled.');
