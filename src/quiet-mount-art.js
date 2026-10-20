import * as THREE from 'three';
import { QUIET_MOUNT } from './quiet-mount.js';
import { buildArchitecture } from './architecture.js';

// The Monte Quieto and its Casa de Compuertas, built into the shared landscape. The pieces that
// answer the kingdom (reservoir level, the weeping gate, the canal's water, the lamp) are returned
// on owner.quietMount so the exporter can tag them; their logic lives in quiet-mount.js.
function ribbon(owner, points, width, material, y) {
  const positions = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / length * width / 2, nz = (b[0] - a[0]) / length * width / 2;
    positions.push(a[0] + nx, y, a[1] + nz, b[0] + nx, y, b[1] + nz, a[0] - nx, y, a[1] - nz, b[0] + nx, y, b[1] + nz, b[0] - nx, y, b[1] - nz, a[0] - nx, y, a[1] - nz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(positions.flatMap((_, i) => i % 3 === 0 ? [positions[i] / 5, positions[i + 2] / 5] : []), 2));
  geo.computeVertexNormals(); owner.localGeometries?.push(geo);
  const mesh = owner.mesh(geo, material); mesh.castShadow = false; return mesh;
}

export function buildQuietMount(owner, { water, stone, dark, wood }) {
  const m = QUIET_MOUNT, previous = owner.root, group = owner.group(); group.name = 'quiet-mount'; owner.root = group;
  const brass = owner.mat('#ba9a58', null, { metalness: .4 }), iron = owner.mat('#3c4440', null, { metalness: .45 }), copper = owner.mat('#a8673f', null, { metalness: .35 });
  const wall = owner.mat('#a7a690', 'stone'); owner.wallMapped(wall, 3);
  const timber = owner.mat('#4b3a29', 'wood'), rust = owner.mat('#6a4a36', null, { metalness: .3, roughness: .75 }), band = owner.mat('#857f6c', 'stone'); owner.wallMapped(band, 3);

  // The mountain itself is relief: scripts/bake-relief.mjs raises it from quietMountHeight, with the
  // valley's grass, rock steps and moss, and plants it with the same flora. Only the works are built here.
  const r = m.reservoir;
  // The reservoir: still water behind the dam, at its full level or drawn down.
  // A generous sheet: the bowl's banks clip it into a natural shore; it stops at the dam's upstream face.
  const upstream = m.dam.x - m.dam.thickness / 2 + .2;
  const reservoir = level => { const plane = owner.water((r.x0 + upstream) / 2, level, (r.z0 + r.z1) / 2, upstream - r.x0, r.z1 - r.z0); plane.name = `quiet-mount-reservoir-${level === r.high ? 'high' : 'low'}`; return plane; };
  const reservoirHigh = reservoir(r.high), reservoirLow = reservoir(r.low);

  // The dam: a stone wall across the gorge, buttressed on its downstream face, three gates below.
  const dm = m.dam, length = dm.z1 - dm.z0, midZ = (dm.z0 + dm.z1) / 2;
  owner.box(dm.x, dm.height / 2, midZ, dm.thickness, dm.height, length, wall).name = 'quiet-mount-dam';
  owner.box(dm.x, dm.height + .35, midZ, dm.thickness + .5, .7, length + .4, stone).name = 'quiet-mount-dam-crest';
  for (const y of [2.6, 5.2, 7.8]) owner.box(dm.x + .05, y, midZ, dm.thickness + .14, .32, length, band).name = 'quiet-mount-dam-course';
  for (let z = dm.z0 + 1.6; z < dm.z1 - 1; z += 3.5) { if (m.gates.some(gz => Math.abs(gz - z) < 1.8)) continue; owner.box(dm.x + 1.6, dm.height * .45, z, 1, dm.height * .9, 1.1, wall).name = 'quiet-mount-buttress'; }
  for (const gz of m.gates) {
    owner.box(dm.x + 1.25, 1.75, gz, .3, 3.3, 2.3, timber).name = 'quiet-mount-gate-frame';
    owner.box(dm.x + 1.42, 1.65, gz, .12, 2.9, 1.9, rust).name = 'quiet-mount-gate';
    for (let k = -.7; k <= .71; k += .7) owner.box(dm.x + 1.5, 1.65, gz + k, .05, 2.9, .07, brass);
    const wheel = owner.mesh('torus', brass, dm.x + .2, dm.height + 1.35, gz, .55, .55, .55); wheel.rotation.y = Math.PI / 2; wheel.name = 'quiet-mount-gate-wheel';
    owner.box(dm.x + .2, dm.height + .9, gz, .14, 1, .14, iron);
    // The penstock: from the gate to the house's back wall.
    owner.beam([dm.x + 1.6, 1.2, gz], [m.powerhouse.x - m.powerhouse.d / 2 - .1, 1.2, gz * .4 + m.powerhouse.z * .6], .32, copper);
  }

  // The Casa de Compuertas: a stone house of the kingdom's own architecture, its door toward the
  // Manantial, a copper flue and a lamp beside the door. It has no id: it is not a door you can open yet.
  const ph = m.powerhouse, house = buildArchitecture(owner, ph.x, ph.z, ph.w, ph.d, ph.height, { stone: true, rotation: Math.PI / 2, eave: .45 });
  house.name = 'quiet-mount-house';
  owner.cylinder(ph.x - ph.d / 2 + .5, ph.height + 1.4, ph.z - ph.w / 2 + .9, .22, 2.8, owner.m.brass);
  const lampMaterial = owner.mat('#f2d79a', null, { emissive: '#000000' });
  const lamp = owner.mesh('sphere', lampMaterial, m.lamp[0], m.lamp[1], m.lamp[2], .24, .24, .24); lamp.name = 'quiet-mount-lamp'; lamp.castShadow = false;
  owner.box(m.lamp[0] - .2, m.lamp[1] + .2, m.lamp[2], .4, .06, .06, iron);
  owner.box(m.lamp[0] - .02, m.lamp[1] + .1, m.lamp[2], .05, .2, .05, iron);

  // The tailrace: a stone channel from the house to the Manantial's source rock.
  ribbon(owner, m.tailrace, 1.5, dark, .03).name = 'quiet-mount-tailrace-bed';
  const tailraceWater = ribbon(owner, m.tailrace, 1, water, .07); tailraceWater.name = 'quiet-mount-tailrace-water';
  // The middle gate weeps once the Manantial's pump draws on the old channel again.
  const weepMaterial = owner.mat('#d6ece8', null, { transparent: true, opacity: .62 });
  const weep = owner.group(); weep.name = 'quiet-mount-weep';
  { const prior = owner.root; owner.root = weep; owner.box(dm.x + 1.56, 1.65, m.gates[1], .05, 3.1, .34, weepMaterial); owner.box(dm.x + 2.2, .06, m.gates[1], 1.4, .04, .9, weepMaterial); owner.root = prior; }
  group.add(weep);

  owner.root = previous;
  owner.quietMount = { group, reservoirHigh, reservoirLow, lamp, tailraceWater, weep };
  return owner.quietMount;
}
