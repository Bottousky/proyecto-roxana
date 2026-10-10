import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// flora.js imports browser-only modules; the clearing rule is checked from its source.
const source = readFileSync(new URL('../src/flora.js', import.meta.url), 'utf8');
const CLEAR = Function(`${source.match(/const CLEAR=\{[^;]*\};/)[0]};return CLEAR;`)();
const clearing = Function('CLEAR', `${source.match(/export function clearing[\s\S]*?\n\}/)[0].replace('export ', '')};return clearing;`)(CLEAR);

test('what matters stands on open ground: no plants at installations and people, no flowers near them', () => {
  const spots = [{ x: 0, z: 0, kind: 'installation' }, { x: 10, z: 0, kind: 'person' }];
  assert.equal(clearing(spots, 1.9, 0), 'none');
  assert.equal(clearing(spots, 3, 0), 'low');
  assert.equal(clearing(spots, 3.8, 0), 'bloom');
  assert.equal(clearing(spots, 6, 0), null);
  assert.equal(clearing(spots, 10, 1.4), 'none');
  assert.ok(CLEAR.installation.none >= 2 && CLEAR.installation.bloom >= 4 && CLEAR.person.none >= 1.5);
});

test('the forgotten look lives in the ground and the plants, not in a filter over the people', () => {
  const world = readFileSync(new URL('../src/world.js', import.meta.url), 'utf8');
  const grade = world.match(/target=\[base\[0\]\*\(([\d.]+)\+/);
  assert.ok(grade && Number(grade[1]) >= .8, 'the screen grade keeps at least 80 % saturation in a forgotten place');
  assert.match(world, /makeLiving\(m\)/);
  assert.match(source, /makeLiving\(m,\{lifeInAlpha:true\}\)/);
});
