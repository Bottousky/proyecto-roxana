import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AREAS } from '../src/content.js';
import { buildCollisionWorld } from './helpers/world-fixture.js';

// Use real transformed vertices: rotating a torus's local AABB would inflate
// its corners and falsely report collisions beyond the circular wheel.
const bounds = object => new THREE.Box3().setFromObject(object, true);
const named = (group, name) => {
  const object = group.getObjectByName(name);
  assert.ok(object, `Missing waterworks geometry: ${name}`);
  return object;
};
const allNamed = (group, name) => {
  const objects = []; group.traverse(object => { if (object.name === name) objects.push(object); });
  return objects;
};
const containsXZ = (outer, inner) => inner.min.x >= outer.min.x - 1e-6 && inner.max.x <= outer.max.x + 1e-6 && inner.min.z >= outer.min.z - 1e-6 && inner.max.z <= outer.max.z + 1e-6;

test('the waterwheel turns clear of the house, supporting frame and receiving basin masonry', () => {
  const world = buildCollisionWorld('spring');
  try {
    const { group, wheel, basin } = world.springWaterworks;
    const house = world.auditBuildings.find(b => b.group.userData.architecture.id === 'wheel-house').group;
    const floor = bounds(named(group, 'wheel-basin-floor'));
    const fixed = [named(house, 'building-walls'), named(house, 'building-foundation'),
      named(group, 'spring-wheel-bearing'), named(group, 'wheel-bearing-pedestal'),
      named(group, 'wheel-bearing-crossbar'), named(group, 'wheel-flume-floor'),
      ...allNamed(group, 'wheel-bearing-flume-post'), ...allNamed(group, 'wheel-basin-end'),
      ...allNamed(group, 'wheel-basin-side')];
    assert.ok(containsXZ(floor, bounds(basin)), 'The receiving water must stay inside its masonry floor');
    for (let frame = 0; frame < 24; frame++) {
      wheel.rotation.z = frame / 24 * Math.PI * 2;
      const moving = bounds(wheel);
      assert.ok(moving.min.y > floor.max.y, 'The wheel must not scrape through the basin floor');
      assert.ok(containsXZ(floor, moving), 'The receiving basin must remain underneath the whole wheel');
      for (const object of fixed) assert.equal(moving.intersectsBox(bounds(object)), false, `Rotating wheel clips ${object.name}`);
    }
    const axle = bounds(named(group, 'waterwheel-axle'));
    const bearing = bounds(named(group, 'wheel-axle-bearing'));
    const hub = bounds(wheel.children.find(object => object.geometry?.type === 'CylinderGeometry'));
    assert.ok(axle.intersectsBox(bearing) && axle.intersectsBox(hub), 'A continuous axle must join the wheel hub to its bearing');
    const roof = bounds(named(house, 'slate-roof-surfaces'));
    for (const object of [named(group, 'wheel-flume-floor'), ...allNamed(group, 'wheel-flume-rail')]) {
      assert.ok(bounds(object).max.x < roof.min.x, 'The flume must remain outside the house eave');
    }
  } finally { world.dispose(); }
});

test('aqueduct water stays above continuous floors carried by grounded piers and arches', () => {
  const world = buildCollisionWorld('spring', { flags: { spring_sluice: true } });
  try {
    const { group, aqueduct, flume, river } = world.springWaterworks;
    // Allow the shader's small ripples; their troughs must still clear the floor.
    const rippleAllowance = .03;
    for (const [surface, floorName] of [[aqueduct, 'aqueduct-channel-floor'], [flume, 'wheel-flume-floor']]) {
      const waterBounds = bounds(surface), floor = bounds(named(group, floorName));
      assert.ok(containsXZ(floor, waterBounds), `${surface.name} extends past the channel floor`);
      assert.ok(waterBounds.min.y - rippleAllowance > floor.max.y, `${surface.name} intersects its stone or timber floor`);
    }
    assert.ok(bounds(aqueduct).max.z <= bounds(flume).min.z + 1e-6, 'Joined water surfaces must meet without overlapping coplanar patches');
    assert.ok(bounds(river).min.y - rippleAllowance > .025, 'The reservoir water must stay above the grass surface');
    for (const rim of [...allNamed(group, 'spring-river-coping'), ...allNamed(group, 'spring-river-end-coping')]) {
      assert.ok(bounds(rim).max.y > bounds(river).max.y + rippleAllowance, 'The reservoir needs a visible retaining rim');
    }
    const caps = allNamed(group, 'aqueduct-pier-cap').sort((a, b) => a.position.x - b.position.x);
    const arches = allNamed(group, 'aqueduct-supporting-arch').sort((a, b) => bounds(a).min.x - bounds(b).min.x);
    const deck = bounds(named(group, 'aqueduct-channel-floor'));
    assert.ok(caps.length > 2, 'A long aqueduct needs intermediate ground supports');
    assert.equal(arches.length, caps.length - 1, 'Every span between piers must retain its supporting arch');
    for (const cap of caps) {
      const shaft = allNamed(group, 'aqueduct-pier-shaft').find(object => Math.abs(object.position.x - cap.position.x) < 1e-6);
      assert.ok(shaft && bounds(shaft).intersectsBox(bounds(cap)), 'Pier shaft and capital must meet');
      assert.ok(bounds(cap).intersectsBox(deck), 'The deck must rest on its capitals');
      const footing = group.children.find(object => /^spring-aqueduct-pier-/.test(object.name) && Math.abs(object.position.x - cap.position.x) < 1e-6);
      assert.ok(footing && bounds(footing).min.y <= .025 && bounds(footing).intersectsBox(bounds(shaft)), 'Each pier must continue into a footing on the ground');
    }
    for (let i = 0; i < arches.length; i++) {
      const arch = bounds(arches[i]);
      assert.ok(arch.intersectsBox(deck) && arch.intersectsBox(bounds(caps[i])) && arch.intersectsBox(bounds(caps[i + 1])), 'An arch must join the deck to both neighboring piers');
    }
    const flumeFloor = bounds(named(group, 'wheel-flume-floor'));
    for (const support of ['flume-support-crossbar', 'wheel-bearing-crossbar']) {
      assert.ok(bounds(named(group, support)).intersectsBox(flumeFloor), 'The wooden channel must sit on its support crossbars');
    }
  } finally { world.dispose(); }
});

test('the lake lighthouse foundation rests on rock that continues below the waterline', () => {
  const world = buildCollisionWorld('lake');
  try {
    const islet = named(world.root, 'lighthouse-rock-islet');
    const bedrock = named(islet, 'lighthouse-islet-bedrock'), cap = named(islet, 'lighthouse-islet-upper-rock');
    const tower = world.animations.find(animation => animation.kind === 'beacon' && !animation.main).obj.parent;
    const foundation = tower.children.filter(object => object.geometry?.type === 'CylinderGeometry').sort((a, b) => bounds(a).min.y - bounds(b).min.y)[0];
    const base = bounds(foundation), rock = bounds(bedrock);
    const lakeWater = world.root.children.find(object => world.waterMaterials.includes(object.material));
    const waterY = lakeWater.getWorldPosition(new THREE.Vector3()).y;
    assert.ok(rock.min.y < waterY && rock.max.y > waterY, 'The islet must cross the lake surface, without floating above it');
    assert.ok(rock.intersectsBox(bounds(cap)), 'The upper rock must meet the submerged bedrock');
    const raycaster = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
    const vertices = foundation.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(foundation.matrixWorld);
      point.y = base.max.y + 1;
      raycaster.set(point, down);
      const hit = raycaster.intersectObjects([bedrock, cap], false)[0];
      assert.ok(hit && hit.point.y >= base.min.y - 1e-6, 'Every part of the real tower foundation must have rock immediately beneath it');
    }
    assert.equal(islet.userData.waterworks.accessible, false, 'The distant foundation must not advertise a new entrance');
  } finally { world.dispose(); }
});

test('World updates water and the physical coupling independently, and clears them when changing area', () => {
  const world = buildCollisionWorld('spring');
  try {
    const works = world.springWaterworks;
    for (const [flags, flowing, coupled] of [[{}, false, false], [{ spring_sluice: true }, true, false],
      [{ spring_coupling: true }, false, true], [{ spring_sluice: true, spring_coupling: true }, true, true],
      [{ pump: true }, true, true], [{}, false, false]]) {
      world.state.flags = flags; world.updateFlags(world.state);
      assert.equal(works.flume.visible, flowing); assert.equal(works.fall.visible, flowing);
      const gate = bounds(works.sluice), water = bounds(works.aqueduct);
      assert.equal(gate.min.y > water.max.y + .03, flowing, 'Only an open sluice should clear the water surface');
      const drive = bounds(named(works.group, 'wheel-house-drive'));
      const angleDrive = bounds(named(works.group, 'wheel-angle-drive'));
      const gap = Math.min(drive.min.x, bounds(works.coupling).min.x) - angleDrive.max.x;
      assert.ok(coupled ? gap <= 0 : gap > .1, 'The coupling state must physically close or reveal the gap in the drive');
    }
    world.loadArea(AREAS.lake, { flags: {} });
    assert.equal(world.springWaterworks, null);
    assert.equal(world.scene.getObjectById(works.group.id), undefined, 'The old waterworks must leave the scene');
    assert.equal(world.animations.some(animation => animation.obj === works.wheel), false);
    assert.equal(allNamed(world.root, 'lighthouse-rock-islet').length, 1);
    world.loadArea(AREAS.spring, { flags: {} });
    assert.notEqual(world.springWaterworks, works);
    assert.equal(allNamed(world.root, 'spring-waterworks').length, 1);
    assert.equal(world.springWaterworks.fall.visible, false, 'Returning to an unrestored area must not retain the old flowing state');
  } finally { world.dispose(); }
});
