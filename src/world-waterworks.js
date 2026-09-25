import * as THREE from 'three';

// Full X/Z dimensions, shared with the local map and the paving exclusions.
// Only structures that reach the ground belong here; the channel is overhead.
export const SPRING_WATERWORKS_FOOTPRINTS = Object.freeze([
  ...[-16.1, -13.6, -11.1, -8.6, -6.1, -3.6, 3.2, 7.82].map((x, i) =>
    Object.freeze({ id: `spring-aqueduct-pier-${i}`, x, z: -12.6, w: 1.05, d: 1.10 })),
  Object.freeze({ id: 'spring-source-rock', x: -17.25, z: -12.6, w: 2.3, d: 2.4 }),
  Object.freeze({ id: 'spring-flume-support', x: 7.82, z: -9.4, w: .8, d: .75 }),
  Object.freeze({ id: 'spring-wheel-bearing', x: 7.82, z: -6.6, w: .75, d: .65 }),
  Object.freeze({ id: 'spring-wheel-basin', label: 'Agua de la rueda', x: 7.82, z: -5.58, w: 4.8, d: 1.4 }),
]);

function water(world, parent, name, x, y, z, w, d) {
  const mesh = world.water(x, y, z, w, d);
  parent.add(mesh); // Parent is at the world origin, so the world coordinates survive.
  mesh.name = name;
  return mesh;
}

function arch(world, parent, left, right) {
  // The masonry fills the space between the curved soffit and the channel deck.
  // Even the wide central passage has a supported arch, with >3m headroom.
  const start = left + .43, end = right - .43;
  const shape = new THREE.Shape();
  shape.moveTo(start, 4.51); shape.lineTo(end, 4.51);
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    shape.lineTo(end + (start - end) * t, 3.02 + Math.sin(t * Math.PI) * 1.02);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .84, bevelEnabled: false, steps: 1 });
  world.localGeometries.push(geometry);
  world.mesh(geometry, world.m.stone, 0, 0, -13.02, 1, 1, 1, parent).name = 'aqueduct-supporting-arch';
}

/**
 * Build the Manantial's supported water route and wheel, without rebuilding its
 * authored house, puzzle props, fountain or lamps. Keep the returned controller
 * on World and call update(state.flags) from updateFlags; the existing `wheel`
 * animation remains responsible for rotation.
 */
export function buildSpringWaterworks(world) {
  const group = world.group(); group.name = 'spring-waterworks';
  group.userData.boundaryFootprints = [SPRING_WATERWORKS_FOOTPRINTS.find(b => b.id === 'spring-source-rock')];
  const { stone, stoneDark, wood, darkwood, metal, brass } = world.m;
  const box = (name, x, y, z, w, h, d, mat = stone) => {
    const mesh = world.box(x, y, z, w, h, d, mat, group); mesh.name = name; return mesh;
  };
  for (const b of SPRING_WATERWORKS_FOOTPRINTS) world.solid(b.x, b.z, b.w, b.d, b.id);

  const river = water(world, group, 'spring-ground-water', -11.56, .16, -2, 6.0, 24.5);
  // A contained reservoir has a visible rim, wholly within the unwalkable rectangle.
  for (const x of [-14.60, -8.52]) box('spring-river-coping', x, .21, -2, .42, .42, 25, stoneDark);
  for (const z of [-14.29, 10.29]) box('spring-river-end-coping', -11.56, .21, z, 6.5, .42, .42, stoneDark);

  // A rock outcrop supplies the high channel. It is rooted at ground level, and
  // the intake is separate from the electric pump and the public fountain.
  box('spring-source-rock', -17.25, 2.46, -12.6, 2.3, 4.92, 2.4, stoneDark);
  box('spring-source-rock-crown', -17.44, 5.06, -12.72, 1.9, .65, 2.12, stoneDark);
  box('spring-source-mouth', -16.088, 4.93, -12.6, .03, .58, .65, world.m.dark);
  const piers = SPRING_WATERWORKS_FOOTPRINTS.filter(b => b.id.startsWith('spring-aqueduct-pier-'));
  for (const b of piers) {
    box(b.id, b.x, .14, b.z, b.w, .28, b.d, stoneDark);
    box('aqueduct-pier-shaft', b.x, 2.25, b.z, .76, 4.1, .82);
    box('aqueduct-pier-cap', b.x, 4.42, b.z, b.w, .24, b.d);
  }
  for (let i = 1; i < piers.length; i++) arch(world, group, piers[i - 1].x, piers[i].x);

  // Continuous deck under every horizontal patch of water. The rails leave an
  // actual opening at the right-angle junction and at the downstream spout.
  const startX = -16.08, endX = 8.18, length = endX - startX, centerX = (startX + endX) / 2;
  box('aqueduct-channel-floor', centerX, 4.62, -12.6, length, .26, 1.1);
  box('aqueduct-north-rail', centerX, 4.96, -13.09, length, .42, .12);
  box('aqueduct-south-rail', (startX + 7.46) / 2, 4.96, -12.11, 7.46 - startX, .42, .12);
  box('aqueduct-east-cap', 8.12, 4.96, -12.6, .12, .42, 1.1);
  const aqueduct = water(world, group, 'aqueduct-contained-water', centerX - .05, 4.91, -12.6, length - .1, .84);

  const flumeStart = -12.6, flumeEnd = -5.94, flumeLength = flumeEnd - flumeStart;
  box('wheel-flume-floor', 7.82, 4.62, (flumeStart + flumeEnd) / 2, .72, .26, flumeLength, darkwood);
  for (const side of [-1, 1]) box('wheel-flume-rail', 7.82 + side * .3, 4.96, (flumeStart + flumeEnd) / 2, .12, .42, flumeLength, wood);
  const flumeWaterStart = -12.18; // Butt against the aqueduct water, never overlap it.
  const flume = water(world, group, 'wheel-flume-water', 7.82, 4.91, (flumeWaterStart + flumeEnd) / 2, .44, flumeEnd - flumeWaterStart);
  box('spring-flume-support', 7.82, .14, -9.4, .8, .28, .75, stoneDark);
  for (const side of [-1, 1]) box('flume-support-post', 7.82 + side * .26, 2.36, -9.4, .2, 4.32, .3, darkwood);
  box('flume-support-crossbar', 7.82, 4.42, -9.4, .8, .24, .75, darkwood);

  // A grounded bearing and two narrow posts carry the end of the flume, leaving
  // a gap around the shaft instead of running timber through its centre.
  box('spring-wheel-bearing', 7.82, .13, -6.6, .75, .26, .65, stoneDark);
  box('wheel-bearing-pedestal', 7.82, 1.10, -6.6, .44, 1.95, .52);
  for (const side of [-1, 1]) box('wheel-bearing-flume-post', 7.82 + side * .275, 2.36, -6.6, .2, 4.32, .26, darkwood);
  box('wheel-bearing-crossbar', 7.82, 4.42, -6.6, .75, .24, .65, darkwood);
  const bearing = world.cylinder(7.82, 2.3, -6.6, .28, .54, brass, group);
  bearing.name = 'wheel-axle-bearing'; bearing.rotation.x = Math.PI / 2;
  const axle = world.cylinder(7.82, 2.3, -5.98, .14, 1.92, metal, group);
  axle.name = 'waterwheel-axle'; axle.rotation.x = Math.PI / 2;

  const wheel = world.group(7.82, 2.3, -5.7, group); wheel.name = 'spring-waterwheel';
  for (const z of [0, .25]) world.torus(0, 0, z, 2.05, .17, darkwood, null, wheel);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    world.beam([0, 0, .12], [Math.cos(a) * 2, Math.sin(a) * 2, .12], .1, wood, wheel);
    const paddle = world.box(Math.cos(a) * 1.95, Math.sin(a) * 1.95, .15, .5, .15, .65, wood, wheel);
    paddle.rotation.z = a;
  }
  const hub = world.cylinder(0, 0, .14, .32, .70, brass, wheel); hub.rotation.x = Math.PI / 2;
  world.animations.push({ kind: 'wheel', obj: wheel, speed: .26 });

  // A short enclosed bevel drive turns the Z axle toward the house's west wall.
  // Its sliding collar reveals the physical separation when the coupling is off.
  box('wheel-angle-drive', 7.82, 2.3, -6.9, .42, .48, .42, metal);
  const drive = world.cylinder(8.27, 2.3, -6.9, .105, .94, metal, group);
  drive.name = 'wheel-house-drive'; drive.rotation.z = Math.PI / 2;
  const coupling = world.cylinder(8.09, 2.3, -6.9, .17, .29, brass, group);
  coupling.name = 'wheel-drive-coupling'; coupling.rotation.z = Math.PI / 2;

  box('wheel-basin-floor', 7.82, 0, -5.58, 4.8, .10, 1.4, stoneDark);
  for (const x of [5.50, 10.14]) {
    if(world.continuous&&x===10.14){for(const z of [-6.09,-5.07])box('wheel-basin-outlet-jamb',x,.19,z,.16,.28,.38);}
    else box('wheel-basin-end', x, .19, -5.58, .16, .28, 1.4);
  }
  for (const z of [-6.20, -4.96]) box('wheel-basin-side', 7.82, .19, z, 4.8, .28, .16);
  const basin = water(world, group, 'wheel-basin-water', 7.82, .19, -5.58, 4.45, 1.03);

  // A small gravity-fed arc is the only unsupported water; it visibly leaves
  // the trough and lands on the wheel. The receiving basin remains underneath.
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(7.82, 4.91, -5.96), new THREE.Vector3(7.82, 4.94, -5.6), new THREE.Vector3(7.82, 4.45, -5.49));
  const fallGeometry = new THREE.TubeGeometry(curve, 16, .12, 8, false);
  world.localGeometries.push(fallGeometry);
  const fallMaterial = world.mat('#83b6b2', null, { transparent: true, opacity: .78, roughness: .2 });
  const fall = world.mesh(fallGeometry, fallMaterial, 0, 0, 0, 1, 1, 1, group);
  fall.name = 'wheel-feed-fall'; fall.castShadow = false;
  const sluice = box('wheel-flume-sluice', 7.82, 4.98, -12.11, .47, .43, .1, darkwood);
  for (const x of [7.5, 8.14]) box('wheel-sluice-guide', x, 5.04, -12.11, .09, .8, .16, metal);

  const controller = {
    group, wheel, river, aqueduct, flume, basin, fall, sluice, coupling,
    footprints: SPRING_WATERWORKS_FOOTPRINTS,
    update(flags = {}) {
      const flowing = Boolean(flags.spring_sluice || flags.pump);
      const coupled = Boolean(flags.spring_coupling || flags.pump);
      flume.visible = fall.visible = flowing;
      sluice.position.y = flowing ? 5.41 : 4.98;
      coupling.position.x = coupled ? 8.09 : 8.34;
      drive.scale.y = coupled ? .94 : .51;
      drive.position.x = coupled ? 8.27 : 8.485;
      group.userData.flowing = flowing; group.userData.coupled = coupled;
    },
  };
  controller.update(world.state?.flags);
  return controller;
}

export const LIGHTHOUSE_ISLET_RADIUS = 4.3;

/** A grounded, inaccessible rock islet under an existing distant lighthouse. */
export function buildLighthouseIslet(world, x, z, s = 1) {
  const group = world.group(x, 0, z); group.name = 'lighthouse-rock-islet';
  const radius = LIGHTHOUSE_ISLET_RADIUS * s, topRadius = 3.8 * s;
  // The top contains the entire foundation disk (3.5*s), and the skirt extends
  // well below the lake at Y=-.42. No walk surface or mainland link is created.
  const geometry = new THREE.CylinderGeometry(topRadius, radius, 1.8, 18, 1);
  world.localGeometries.push(geometry);
  world.mesh(geometry, world.m.stoneDark, 0, -.73, 0, 1, 1, 1, group).name = 'lighthouse-islet-bedrock';
  const cap = world.cylinder(0, .12, 0, topRadius, .16, world.m.stone, group); cap.name = 'lighthouse-islet-upper-rock';
  // Low, overlapping coastal stones break the waterline without inventing a
  // path or rocks beyond the registered footprint.
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2, radial = 3.68 * s;
    const rock = world.mesh('ico', world.m.stoneDark, Math.cos(angle) * radial, -.25, Math.sin(angle) * radial, .49 * s, .40, .49 * s, group);
    rock.rotation.y = angle; rock.name = 'lighthouse-islet-waterline-rock';
  }
  const footprint = { id: 'lighthouse-rock-islet', x, z, w: radius * 2, d: radius * 2 };
  world.solid(x, z, footprint.w, footprint.d, footprint.id);
  group.userData.waterworks = { footprint, accessible: false, waterY: -.42, foundationRadius: 3.5 * s };
  return group;
}
