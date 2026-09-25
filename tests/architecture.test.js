import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { World } from '../src/world.js';
import { buildArchitecture } from '../src/architecture.js';

const BUILDINGS = [
  [4.8, 4, 3.5, { stone: true }],
  [7, 6, 4.7, { awning: true, red: true }],
  [7.8, 6, 5.6, { stone: true }],
  [5, 6, 4.3, { workshop: true }],
  [9.2, 6.4, 6.4, { workshop: true }],
  [5.5, 6, 4.2, { awning: true, red: true }],
  [4.7, 4.2, 3.8, { awning: true }],
  [6, 5.5, 4.2, { stone: true }],
  [6.5, 5, 4.7, { awning: true, red: true }],
  [5.5, 5, 4, { stone: true }],
  [7, 6, 4.4, { awning: true }],
  [5, 4, 3.6, { stone: true }],
];

function fixture() {
  const world = Object.create(World.prototype);
  Object.assign(world, {
    root: new THREE.Group(), localGeometries: [], sharedMaterials: new Set(), obstacles: [],
    geo: {
      box: new THREE.BoxGeometry(1, 1, 1), cylinder: new THREE.CylinderGeometry(1, 1, 1, 16),
      sphere: new THREE.SphereGeometry(1, 12, 8), plane: new THREE.PlaneGeometry(1, 1),
    },
  });
  const names = ['stone', 'stoneDark', 'cream', 'darkwood', 'wood', 'roof', 'roofRed', 'glass', 'brass', 'metal', 'dark', 'leaf', 'leafLight', 'flower', 'cloth', 'redcloth', 'contact'];
  world.m = Object.fromEntries(names.map(name => [name, new THREE.MeshStandardMaterial()]));
  world.smoke = (x, y, z) => { world.chimney = new THREE.Vector3(x, y, z); };
  world.solid = () => assert.fail('Visual architecture must leave collision registration to World.building');
  world.cleanup = () => {
    [...Object.values(world.geo), ...world.localGeometries].forEach(geometry => geometry.dispose());
    Object.values(world.m).forEach(material => material.dispose());
  };
  return world;
}

test('actual building roofs have upward, flat faces and unpinched slate UVs', () => {
  for (const [w, d, h, options] of BUILDINGS) {
    const world = fixture(), group = buildArchitecture(world, 0, 0, w, d, h, options);
    let roofFaces = 0;
    group.traverse(mesh => {
      if (mesh.name !== 'slate-roof-surfaces') return;
      const { position, normal, uv } = mesh.geometry.attributes;
      assert.ok([...position.array, ...normal.array, ...uv.array].every(Number.isFinite));
      for (let i = 0; i < position.count; i += 3) {
        const points = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(position, i + j));
        const n = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
        assert.ok(n.length() > 1e-6, 'A roof triangle must have surface area');
        assert.ok(n.y > 0, 'Slate faces must face out/up');
        n.normalize();
        for (let j = 0; j < 3; j++) assert.ok(n.dot(new THREE.Vector3().fromBufferAttribute(normal, i + j)) > .99999, 'Normals must not smooth across a ridge or gable');
        const uvArea = (uv.getX(i + 1) - uv.getX(i)) * (uv.getY(i + 2) - uv.getY(i)) - (uv.getY(i + 1) - uv.getY(i)) * (uv.getX(i + 2) - uv.getX(i));
        assert.ok(Math.abs(uvArea) > 1e-8, 'Roof UVs must not collapse into stripes');
        roofFaces++;
      }
    });
    assert.ok(roofFaces >= 4);
    assert.equal(new Set(world.localGeometries).size, world.localGeometries.length, 'Unique geometries must be registered exactly once for disposal');
    world.cleanup();
  }
});

test('all building foundations, doorway approaches and decorations stay coherent after cardinal rotation', () => {
  for (const [w, d, h, options] of BUILDINGS) for (const rotation of [0, Math.PI / 2]) {
    const world = fixture(), group = buildArchitecture(world, 4, -2, w, d, h, { ...options, rotation });
    group.updateWorldMatrix(true, true);
    const { footprint, entrance, blockers } = group.userData.architecture;
    const visibleFoundation = new THREE.Box3().setFromObject(group.getObjectByName('building-foundation'));
    const size = visibleFoundation.getSize(new THREE.Vector3()), center = visibleFoundation.getCenter(new THREE.Vector3());
    assert.ok(Math.abs(size.x - footprint.w) < 1e-6 && Math.abs(size.z - footprint.d) < 1e-6);
    assert.ok(Math.abs(center.x - footprint.x) < 1e-6 && Math.abs(center.z - footprint.z) < 1e-6);
    const door = group.getObjectByName('building-entrance-door');
    const visibleDoor = new THREE.Box3().setFromObject(door);
    assert.ok(visibleDoor.containsPoint(new THREE.Vector3(entrance.x, .07, entrance.z)), 'Entrance must meet the visible door threshold');
    const doorFacing = new THREE.Vector3(0, 0, 1).transformDirection(door.matrixWorld);
    assert.ok(doorFacing.distanceTo(new THREE.Vector3(entrance.direction[0], 0, entrance.direction[1])) < 1e-6);
    for (const obstacle of [footprint, ...blockers]) {
      const blocked = Math.abs(entrance.approach.x - obstacle.x) < obstacle.w / 2 + .34 && Math.abs(entrance.approach.z - obstacle.z) < obstacle.d / 2 + .34;
      assert.equal(blocked, false, 'Posts, counters and planters must leave a player-sized approach to the door');
    }
    const chimney = new THREE.Vector3(w * (options.workshop ? .31 : .29), 0, -d * .16).applyMatrix4(group.matrixWorld);
    assert.ok(Math.abs(chimney.x - world.chimney.x) < 1e-6 && Math.abs(chimney.z - world.chimney.z) < 1e-6, 'Smoke must follow the rotated chimney');
    assert.equal(world.obstacles.length, 0);
    world.cleanup();
  }
});

test('workshop exterior preserves its south entrance and identifies its porch supports', () => {
  const world = fixture(), group = buildArchitecture(world, -16.72, 4, 5, 6, 4.3, { workshop: true });
  const { footprint, entrance, blockers } = group.userData.architecture;
  assert.deepEqual(footprint, { x: -16.72, z: 4, w: 5.3, d: 6.3 });
  assert.deepEqual(entrance.direction, [0, 1]);
  assert.deepEqual(entrance.approach, { x: -16.72, z: 7.9 });
  assert.equal(blockers.filter(blocker => blocker.kind === 'porch-post').length, 2);
  assert.ok(group.getObjectByName('workshop-flue'));
  assert.ok(group.getObjectByName('workshop-entrance-porch'));
  assert.ok(group.getObjectByName('front-dormer'));
  world.cleanup();
});

test('principal workshop has two glazed storeys, a broad framed entrance and a clear porch aisle', () => {
  const world = fixture();
  try {
    const group = buildArchitecture(world, -13.25, 3.8, 9.2, 6.4, 6.4, { workshop: true });
    const small = buildArchitecture(world, 20, 0, 5, 6, 4.3, { workshop: true });
    world.root.updateWorldMatrix(true, true);
    const bounds = object => new THREE.Box3().setFromObject(object);
    const size = object => bounds(object).getSize(new THREE.Vector3());
    const { footprint, entrance, blockers } = group.userData.architecture;
    assert.equal(footprint.w, 9.5);
    assert.equal(footprint.d, 6.7);
    assert.ok(Math.hypot(entrance.approach.x + 13.25, entrance.approach.z - 7.9) < 1e-6);

    const lower = [], upper = [];
    group.traverse(object => {
      if (object.name === 'workshop-ground-window') lower.push(bounds(object.getObjectByName('workshop-window-glass')));
      if (object.name === 'workshop-upper-window') upper.push(bounds(object.getObjectByName('workshop-window-glass')));
    });
    assert.equal(lower.length, 2);
    assert.equal(upper.length, 2);
    const wall = bounds(group.getObjectByName('building-walls'));
    for (const pane of [...lower, ...upper]) {
      assert.ok(pane.max.x - pane.min.x > 2, 'Workshop glazing must read as broad workroom windows');
      assert.ok(pane.min.y > wall.min.y && pane.max.y < wall.max.y);
      assert.ok(pane.min.x > wall.min.x && pane.max.x < wall.max.x);
    }
    assert.ok(Math.min(...upper.map(pane => pane.min.y)) - Math.max(...lower.map(pane => pane.max.y)) > 1, 'Separate complete storeys, without windows crossing the floor band');

    const door = group.getObjectByName('building-entrance-door');
    assert.ok(size(door).x > size(small.getObjectByName('building-entrance-door')).x * 1.15);
    const frame = bounds(group.getObjectByName('building-entrance-frame'));
    for (const pane of lower) assert.ok(pane.max.x < frame.min.x || pane.min.x > frame.max.x, 'The front windows must leave the framed entrance unobstructed');
    const porch = group.getObjectByName('workshop-entrance-porch');
    const porchRoof = bounds(porch.getObjectByName('porch-roof'));
    assert.ok(size(porch).x > size(small.getObjectByName('workshop-entrance-porch')).x * 1.65);
    assert.ok(porchRoof.max.z > entrance.approach.z + .8, 'Roof must shelter the actual approach');
    const emblem = bounds(group.getObjectByName('workshop-lamp-emblem'));
    assert.ok(emblem.min.y > porchRoof.max.y, 'Lamp emblem must remain visible above the porch roof');
    assert.ok(Math.abs(emblem.getCenter(new THREE.Vector3()).x - entrance.x) < 1e-6);

    const postBases = [];
    porch.traverse(object => { if (object.name === 'porch-post-base') postBases.push(bounds(object)); });
    const postBlockers = blockers.filter(blocker => blocker.kind === 'porch-post');
    assert.equal(postBases.length, 2);
    assert.equal(postBlockers.length, postBases.length);
    for (const base of postBases) {
      const center = base.getCenter(new THREE.Vector3()), dimensions = base.getSize(new THREE.Vector3());
      assert.ok(postBlockers.some(blocker => Math.hypot(blocker.x - center.x, blocker.z - center.z) < 1e-6 && Math.abs(blocker.w - dimensions.x) < 1e-6 && Math.abs(blocker.d - dimensions.z) < 1e-6), 'Each visible stone support needs its exact collision footprint');
    }
    for (let z = entrance.approach.z; z <= porchRoof.max.z + .5; z += .1) for (const offset of [-.4, 0, .4]) {
      for (const obstacle of [footprint, ...blockers]) {
        assert.ok(Math.abs(entrance.x + offset - obstacle.x) >= obstacle.w / 2 + .34 || Math.abs(z - obstacle.z) >= obstacle.d / 2 + .34, 'A wide continuous aisle must lead through the porch to the door');
      }
    }
  } finally { world.cleanup(); }
});
