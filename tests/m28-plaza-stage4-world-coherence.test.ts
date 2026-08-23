import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PLAZA_CONDUCTOR_LAYOUT } from '../src/experiences/ohmdal-playcanvas/plazaConductorLayout.ts';

const world = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/playcanvasWorld.ts', import.meta.url), 'utf8');

assert.equal(PLAZA_CONDUCTOR_LAYOUT.mainSegments.length, 12, 'Stage 4 has six paired main segments per side');
assert.deepEqual(
  PLAZA_CONDUCTOR_LAYOUT.mainSegments.filter((segment) => segment.side === -1),
  [
    { side: -1, x: -0.9, z: -8.25, length: 2.7 },
    { side: -1, x: -0.9, z: -5.5, length: 2.8 },
    { side: -1, x: -0.9, z: 1.2, length: 3.0 },
    { side: -1, x: -0.9, z: 4.25, length: 3.0 },
    { side: -1, x: -0.9, z: 7.3, length: 3.0 },
    { side: -1, x: -0.9, z: 9.25, length: 1.1 },
  ],
  'left conductor segments use the authored z/length layout',
);
assert.deepEqual(
  PLAZA_CONDUCTOR_LAYOUT.mainSegments.filter((segment) => segment.side === 1),
  [
    { side: 1, x: 0.9, z: -8.25, length: 2.7 },
    { side: 1, x: 0.9, z: -5.5, length: 2.8 },
    { side: 1, x: 0.9, z: 1.2, length: 3.0 },
    { side: 1, x: 0.9, z: 4.25, length: 3.0 },
    { side: 1, x: 0.9, z: 7.3, length: 3.0 },
    { side: 1, x: 0.9, z: 9.25, length: 1.1 },
  ],
  'right conductor segments use the authored z/length layout',
);
assert.deepEqual(
  PLAZA_CONDUCTOR_LAYOUT.routeTerminations.map((termination) => termination.z),
  [-9.55, -6.9, -4.1, -0.25, 2.7, 5.75, 8.75, 9.75],
  'route termination/insulator z values are stable',
);
assert.deepEqual(PLAZA_CONDUCTOR_LAYOUT.workshopBranchSegments, [
  { x: -2.5, z: -4, length: 3.2 },
  { x: -5.2, z: -4, length: 2.3 },
]);
assert.deepEqual(PLAZA_CONDUCTOR_LAYOUT.workshopJunction, { x: -6.45, z: -4 });

assert.match(world, /import\s*\{\s*PLAZA_CONDUCTOR_LAYOUT\s*\}\s*from\s*['"]\.\/plazaConductorLayout\.ts['"]/, 'world imports the authored conductor layout');
assert.match(world, /PLAZA_CONDUCTOR_LAYOUT\.mainSegments\.forEach|for\s*\(const\s+[^)]*\s+of\s+PLAZA_CONDUCTOR_LAYOUT\.mainSegments\)/, 'world iterates main conductor segments');
assert.match(world, /PLAZA_CONDUCTOR_LAYOUT\.routeTerminations\.forEach|for\s*\(const\s+[^)]*\s+of\s+PLAZA_CONDUCTOR_LAYOUT\.routeTerminations\)/, 'world iterates route terminations');
assert.match(world, /PLAZA_CONDUCTOR_LAYOUT\.workshopBranchSegments\.forEach|for\s*\(const\s+[^)]*\s+of\s+PLAZA_CONDUCTOR_LAYOUT\.workshopBranchSegments\)/, 'world iterates workshop branch segments');
assert.match(world, /PLAZA_CONDUCTOR_LAYOUT\.workshopJunction/, 'world uses the workshop junction');

for (const semanticName of [
  'WorkshopAuthoredShell',
  'PortalAuthoredArch',
  'PlazaPerimeterSkirtNear',
  'PlazaPerimeterSkirtFar',
  'WorkshopServiceCluster',
]) {
  assert.match(world, new RegExp(semanticName), `Stage 4 world contains ${semanticName}`);
}

assert.doesNotMatch(world, /WorkshopBldg\.addComponent\('render',\s*\{\s*type:\s*'box'/, 'active workshop shell is not a primitive box');
assert.doesNotMatch(world, /PortalLintel\.addComponent\('render',\s*\{\s*type:\s*'box'/, 'active portal lintel is not a primitive box');

console.log('M28 Plaza Stage 4: OK (conductor layout, authored environment semantics, and primitive retirement guarded)');
