// Player settings must survive bad or missing storage, and must not freeze the system's
// reduced-motion preference unless the player chose.
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, save, sanitize, defaults, effectiveReduced, TEXT_SIZES } from '../src/settings.js';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('until the player chooses, reduced motion follows the system; ?reduced always wins', () => {
  const s = load(memory());
  assert.deepEqual(s, { volume: 0.8, reduced: null, text: 1 });
  assert.equal(effectiveReduced(s, { system: true }), true);
  assert.equal(effectiveReduced(s, { system: false }), false);
  // saving another setting does not freeze the system preference
  const st = memory(); save(st, { ...s, volume: 0.3 });
  assert.equal(load(st).reduced, null);
  // a stored choice of "off" does not beat ?reduced
  assert.equal(effectiveReduced({ ...s, reduced: false }, { forced: true, system: false }), true);
  assert.equal(effectiveReduced({ ...s, reduced: false }, { system: true }), false);
});

test('saved settings come back', () => {
  const st = memory();
  assert.ok(save(st, { volume: 0.35, reduced: true, text: 1.5 }));
  assert.deepEqual(load(st), { volume: 0.35, reduced: true, text: 1.5 });
});

test('invalid or broken values fall back, and storage that throws does not break the game', () => {
  assert.deepEqual(sanitize({ volume: 7, reduced: 'yes', text: 3 }), { volume: 1, reduced: null, text: 1 });
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(load(broken), defaults());
  assert.equal(save(broken, defaults()), false);
  const garbage = memory(); garbage.setItem('physica.ajustes.v1', '{not json');
  assert.deepEqual(load(garbage), defaults());
  assert.ok(TEXT_SIZES.every(t => sanitize({ text: t.value }).text === t.value));
});
