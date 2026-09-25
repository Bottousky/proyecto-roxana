import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AREAS } from '../src/content.js';
import { buildArchitecture } from '../src/architecture.js';
import { buildCollisionWorld } from './helpers/world-fixture.js';
import { auditComposition, compositionFailures, GAME_CAMERA_OFFSET } from './helpers/composition-audit.js';

function replaceBuildings(world, specifications) {
  // Freeze these regression scenes independently from later map/prop redesigns,
  // retaining the real World primitives, materials and architecture builder.
  world.root.clear();
  world.layout = { ...world.layout, buildings: specifications };
  world.auditBuildings = specifications.map(({ x, z, w, d, height, options }) => ({ x, z, width: w, depth: d, group: buildArchitecture(world, x, z, w, d, height, options) }));
}

test('legacy Plaza placement hides the bakery door behind Lumen, and lateral separation reveals it', () => {
  const world = buildCollisionWorld('plaza');
  try {
    const bakery = { id: 'legacy-bakery', x: -12.54, z: -10.24, w: 7, d: 6, height: 4.7, options: { awning: true, red: true } };
    const workshop = { id: 'legacy-workshop', x: -13.25, z: 3.8, w: 9.2, d: 6.4, height: 6.4, options: { workshop: true } };
    replaceBuildings(world, [bakery, workshop]);
    let report = auditComposition(world), hidden = report.buildings[0];
    assert.equal(hidden.door.blocked, 9);
    assert.ok(hidden.facade.fraction > .6);
    assert.deepEqual(hidden.door.blockers, ['legacy-workshop']);
    assert.ok(compositionFailures(report).some(message => message.includes('9/9 door')));
    assert.ok(report.silhouetteOverlaps.some(pair => pair.fraction > .45));

    world.auditBuildings[0].group.position.x = -5.15;
    report = auditComposition(world);
    assert.equal(report.buildings[0].door.blocked, 0, 'A lateral street view actually reveals the door through geometry');
    assert.ok(report.buildings[0].facade.fraction <= .2, 'Small unrelated props may overlap a readable facade');
    assert.equal(report.buildings[0].facade.blockers.includes('legacy-workshop'), false);
  } finally { world.dispose(); }
});

test('door audit detects foreign solid props but treats alpha billboard pixels as unverified', () => {
  const world = buildCollisionWorld('plaza');
  try {
    replaceBuildings(world, [{ id: 'test-house', x: 0, z: -8, w: 5, d: 4, height: 4, options: {} }]);
    const prop = world.box(0, 3, -2.8, 2, 5, .15, world.m.stone);
    prop.name = 'door-obstruction';
    let result = auditComposition(world).buildings[0];
    assert.equal(result.door.blocked, 9);
    assert.ok(result.door.blockers.every(label => label.startsWith('door-obstruction')));
    const material = new THREE.MeshStandardMaterial({ alphaTest: .3 });
    world.sharedMaterials.add(material); prop.material = material;
    result = auditComposition(world).buildings[0];
    assert.equal(result.door.blocked, 0, 'Opaque geometry report must not pretend to know transparent sprite pixels');
    assert.equal(result.alphaDoor.blocked, 9);
    prop.visible = false;
    assert.equal(auditComposition(world).buildings[0].alphaDoor.blocked, 0);
  } finally { world.dispose(); }
});

test('roof audit finds actual roof intersections and old aleros outside the map', () => {
  const world = buildCollisionWorld('terraces');
  try {
    replaceBuildings(world, [
      { id: 'old-forge', x: -13.6, z: -15.48, w: 6.5, d: 5, height: 4.7, options: { awning: true, red: true } },
      { id: 'old-mill', x: 13.6, z: -15.84, w: 5.5, d: 5, height: 4, options: { stone: true } },
    ]);
    let report = auditComposition(world);
    assert.ok(report.buildings[0].outside.north > .31);
    assert.ok(report.buildings[1].outside.north > .67);
    assert.equal(report.roofSurfaceIntersections.length, 0);

    replaceBuildings(world, [
      { id: 'cut-roof-a', x: 0, z: 0, w: 6, d: 5, height: 4, options: {} },
      { id: 'cut-roof-b', x: 1, z: 1, w: 6, d: 5, height: 4, options: {} },
    ]);
    report = auditComposition(world);
    assert.ok(report.roofSurfaceIntersections.length > 0, 'Intersecting visible triangles must fail, not merely intersecting boxes');
    assert.ok(compositionFailures(report).some(message => message.includes('roofs cut-roof-a and cut-roof-b intersect')));
    world.auditBuildings[1].group.position.set(1, 0, 0);
    assert.ok(auditComposition(world).roofSurfaceIntersections.length > 0, 'Coplanar overlapping roof tiles also collide');
    world.auditBuildings[1].group.position.set(0, 1, 0);
    report = auditComposition(world);
    assert.ok(report.roofBoundsOverlaps.length > 0);
    assert.equal(report.roofSurfaceIntersections.length, 0, 'Parallel vertically separated roofs may have overlapping envelopes without intersecting surfaces');
  } finally { world.dispose(); }
});

test('tree placement excludes the Portal obstruction while retaining scenery behind and beside the house', () => {
  const world = buildCollisionWorld('portal');
  try {
    const position = [-13.014, 3.116, 1.15];
    const beforeTrees = world.treeModels.length, beforeObstacles = world.obstacles.length;
    assert.equal(world.tree(...position).children.length, 0, 'The reported foreground tree must not be built');
    assert.equal(world.pine(...position).children.length, 0, 'Pines obey the same visibility reservation');
    assert.equal(world.treeModels.length, beforeTrees);
    assert.equal(world.obstacles.length, beforeObstacles, 'Excluded scenery must not leave an invisible collider');

    // Reproduce the missing guard with the actual sprite geometry. Its pixels
    // remain unverified here; visual QA confirmed this particular tree occluded.
    const guard = world.sceneryBlocksFacade;
    world.sceneryBlocksFacade = () => false;
    const legacyTree = world.tree(...position);
    world.sceneryBlocksFacade = guard;
    assert.ok(auditComposition(world).buildings[0].alphaDoor.blocked > 0, 'The old foreground canopy really crosses the parallel sight rays');
    world.root.remove(legacyTree);

    for (const [x, z] of [[-10.36, -11], [4, 3.116]]) {
      assert.ok(world.tree(x, z, 1.15).children.length > 0, 'Trees outside the foreground sight corridor remain');
      assert.ok(world.pine(x, z, 1.15).children.length > 0, 'The reservation must not remove safe background/lateral pines');
    }
    assert.equal(auditComposition(world).buildings[0].alphaDoor.blocked, 0);
  } finally { world.dispose(); }
});

test('every authored house keeps its entrance and facade readable from the gameplay camera', () => {
  const failures = [];
  for (const id of Object.keys(AREAS)) {
    const world = buildCollisionWorld(id);
    try {
      assert.deepEqual(world.cameraOffset.toArray(), [...GAME_CAMERA_OFFSET], 'The audit must use the actual gameplay direction');
      failures.push(...compositionFailures(auditComposition(world)));
    } finally { world.dispose(); }
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});
