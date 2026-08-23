import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PLAZA_BELL_DETAIL_LAYOUT } from '../src/experiences/ohmdal-playcanvas/plazaBellDetailLayout.ts';

const world = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/playcanvasWorld.ts', import.meta.url), 'utf8');

const { insulators, brackets } = PLAZA_BELL_DETAIL_LAYOUT;
const details = [...insulators, ...brackets];

assert.equal(insulators.length, 4, 'Stage 5 has four ceramic BellGantry insulators');
assert.equal(brackets.length, 4, 'Stage 5 has four brass BellGantry brackets');

for (const detail of details) {
  const [x, y, z] = detail.position;
  const [sx, sy, sz] = detail.scale;
  assert.ok(x >= -6.3 && x <= -4.1, `${detail.name} stays beside a BellGantry post`);
  assert.ok(y >= 3.2 && y <= 3.5, `${detail.name} stays on the authored gantry detail line`);
  assert.ok(z >= 2.0 && z <= 2.8, `${detail.name} stays inside the BellGantry depth bounds`);
  assert.ok(sx > 0 && sy > 0 && sz > 0, `${detail.name} has a positive scale`);
  assert.ok(Math.max(sx, sy, sz) <= 0.3, `${detail.name} remains a small authored detail`);
}

const mirrorAxis = -5.2;
const mirroredX = (x: number) => Number((2 * mirrorAxis - x).toFixed(2));
for (const rowZ of [2.15, 2.65]) {
  for (const group of [insulators, brackets]) {
    const row = group.filter((detail) => detail.position[2] === rowZ);
    assert.equal(row.length, 2, `two ${group === insulators ? 'insulators' : 'brackets'} share z=${rowZ}`);
    assert.equal(row[0].position[1], 3.35, 'BellGantry detail row uses the authored y coordinate');
    assert.equal(row[1].position[1], 3.35, 'BellGantry detail row uses the authored y coordinate');
    assert.equal(row[0].position[0], mirroredX(row[1].position[0]), 'BellGantry detail columns are symmetric');
  }
}

assert.match(world, /plazaBellDetailLayout\.ts/, 'world imports the BellGantry authored detail layout');
assert.match(world, /PLAZA_BELL_DETAIL_LAYOUT\.insulators/, 'world integrates the BellGantry ceramic-insulator layout');
assert.match(world, /PLAZA_BELL_DETAIL_LAYOUT\.brackets/, 'world integrates the BellGantry brass-bracket layout');
assert.match(world, /PlazaPerimeterCurb/, 'world contains the Plaza perimeter curb integration marker');
assert.match(world, /WorkshopContactFoot/, 'world contains the Workshop contact-foot integration marker');

console.log('M29 Plaza Stage 5: OK (BellGantry details, symmetry, Plaza bounds, and integration markers guarded)');
