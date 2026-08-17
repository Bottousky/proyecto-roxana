// Plaza de Ohm — the central hub of Cuenca de Ohm.
// 20m × 16m open space with a fountain at center, surrounded by a low
// perimeter wall with three openings (south to Camino, north to
// Calzada-alta, east to Taller).
//
// Spatial composition (top-down):
//                      N → Calzada-alta / Puerta
//                  ┌─────────────────────┐
//                  │                     │
//                  │    [paving+props]   │   ← fountain
//                  │         ◊           │
//        T ←   ────┤    [paving+props]   │────  E → Taller
//       (wall)    │                     │    (door)
//                  │    [paving+props]   │
//                  └─────────────────────┘
//                      S → Camino / Portal
//
// Plaza ground Y = 0.0. Perimeter wall is 0.9m tall (visible from camera
// but not occluding) with three 3.5m openings.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface PlazaEntities {
  group: THREE.Group;
  fountain: Fountain;
  lamps: Lamp[];
}

export interface Fountain {
  group: THREE.Object3D;
  water: THREE.Mesh;
  waterMaterial: THREE.MeshStandardMaterial;
  alive: boolean;
}

const WALL_H = 0.9;
const OPENING = 3.5; // wall opening width

export interface PlazaSize {
  /** Plaza footprint (XZ, meters). Defaults match the current H1 plaza. */
  width?: number;
  depth?: number;
}

export function buildPlaza(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
  size: PlazaSize = {},
): PlazaEntities {
  const W = size.width ?? 20;
  const D = size.depth ?? 16;
  const group = new THREE.Group();
  group.name = "plaza";

  // ---------- Paved floor (a single plane) ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      map: tex.plazaFloor,
      color: 0xc0c4cc,
      roughness: 0.85,
      metalness: 0.04,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // Decorative inset tiles around the fountain (octagon pattern).
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.05, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.78 }),
    );
    tile.position.set(Math.cos(a) * 3.0, 0.04, Math.sin(a) * 3.0);
    tile.rotation.y = a;
    tile.receiveShadow = true;
    group.add(tile);
  }

  // ---------- Perimeter wall ----------
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x4a5664,
    roughness: 0.85,
    metalness: 0.04,
  });
  // Compute the center of each wall segment: each side of the Plaza
  // (W x D) has an opening in the middle (OPENING wide). The two segments
  // on each side together span (W - OPENING) and are centered around
  // (x=0 for N/S walls, z=0 for E/W walls).
  const segSizeX_NS = (W - OPENING) / 2;
  const segCenterX = OPENING / 2 + segSizeX_NS / 2;

  // North wall (with central opening to Calzada-alta).
  addWallSegment(group, wallMat, -segCenterX, 0, -D / 2, segSizeX_NS, WALL_H, 0.5);
  addWallSegment(group, wallMat,  segCenterX, 0, -D / 2, segSizeX_NS, WALL_H, 0.5);
  // South wall (with central opening to Camino).
  addWallSegment(group, wallMat, -segCenterX, 0,  D / 2, segSizeX_NS, WALL_H, 0.5);
  addWallSegment(group, wallMat,  segCenterX, 0,  D / 2, segSizeX_NS, WALL_H, 0.5);
  // West wall: full (no opening — beyond the wall is the distant horizon).
  addWallSegment(group, wallMat, -W / 2, 0, 0, 0.5, WALL_H, D);
  // East wall: opening aligned with the Taller door. The Taller is at world
  // (16, 0, 0) with its door at world z=0 (i.e. local z=+3 in the Plaza's
  // frame, since the Plaza is at world z=-3). The opening is therefore
  // placed at local z=+3, asymmetrically in the south half of the east
  // wall, so the player walks straight out of the Plaza into the Taller.
  const eastOpeningZ = 3;
  const eastHalf = OPENING / 2;
  const eastNorthEnd = eastOpeningZ - eastHalf;     // 1.25
  const eastSouthEnd = eastOpeningZ + eastHalf;     // 4.75
  const eastNorthLen = eastNorthEnd - (-D / 2);     // 9.25 (north segment)
  const eastSouthLen = (D / 2) - eastSouthEnd;       // 3.25 (south segment)
  const eastNorthCenter = (-D / 2 + eastNorthEnd) / 2;
  const eastSouthCenter = (eastSouthEnd + D / 2) / 2;
  addWallSegment(group, wallMat,  W / 2, 0, eastNorthCenter, 0.5, WALL_H, eastNorthLen);
  addWallSegment(group, wallMat,  W / 2, 0, eastSouthCenter, 0.5, WALL_H, eastSouthLen);

  // ---------- Decorative pillars at the four corners of the Plaza ----------
  for (const [x, z] of [
    [-W / 2 + 0.6, -D / 2 + 0.6],
    [ W / 2 - 0.6, -D / 2 + 0.6],
    [-W / 2 + 0.6,  D / 2 - 0.6],
    [ W / 2 - 0.6,  D / 2 - 0.6],
  ] as [number, number][]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 1.4, 8),
      kit.stoneLight,
    );
    pillar.position.set(x, WALL_H + 0.7, z);
    pillar.castShadow = true;
    group.add(pillar);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.2, 8),
      kit.copper,
    );
    cap.position.set(x, WALL_H + 1.5, z);
    group.add(cap);
  }

  // ---------- Fountain (centerpiece) ----------
  const fountain = buildFountain(kit);
  group.add(fountain.group);

  // ---------- 4 corner lamps ----------
  const lamps: Lamp[] = [];
  for (const [x, z] of [
    [-W / 2 + 1.6, -D / 2 + 1.6],
    [ W / 2 - 1.6, -D / 2 + 1.6],
    [-W / 2 + 1.6,  D / 2 - 1.6],
    [ W / 2 - 1.6,  D / 2 - 1.6],
  ] as [number, number][]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, z);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- A wooden bench on the west side ----------
  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.1, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.82 }),
  );
  bench.position.set(-5, 0.55, 1);
  bench.castShadow = true;
  group.add(bench);
  for (const x of [-5.7, -4.3]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.82 }),
    );
    leg.position.set(x, 0.25, 1);
    leg.castShadow = true;
    group.add(leg);
  }

  // ---------- A second bench on the east side ----------
  const bench2 = bench.clone();
  bench2.position.set(5, 0.55, 1);
  group.add(bench2);
  for (const x of [4.3, 5.7]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.82 }),
    );
    leg.position.set(x, 0.25, 1);
    leg.castShadow = true;
    group.add(leg);
  }

  // ---------- A few crates and a barrel (life marks) ----------
  for (const [x, z] of [[-3, 5], [3, -5], [-3, -5]] as [number, number][]) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.85 }),
    );
    crate.position.set(x, 0.35, z);
    crate.rotation.y = (x + z) * 0.1;
    crate.castShadow = true;
    crate.receiveShadow = true;
    group.add(crate);
  }
  // Barrel.
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.4, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.85 }),
  );
  barrel.position.set(2.5, 0.45, 5);
  barrel.castShadow = true;
  group.add(barrel);

  // ---------- A circular stone planter in the NE corner (with vegetation) ----------
  // The planter is also a low seat — people sit on the rim. Placed near the
  // Taller doorway so it feels like the green corner of the Plaza.
  const NE_X = 6.5, NE_Z = -5;
  const planterRim = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.5, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a5664, roughness: 0.85 }),
  );
  planterRim.position.set(NE_X, 0.3, NE_Z);
  planterRim.castShadow = true;
  planterRim.receiveShadow = true;
  group.add(planterRim);
  // Inside of the planter (soil).
  const planterSoil = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.95 }),
  );
  planterSoil.position.set(NE_X, 0.55, NE_Z);
  group.add(planterSoil);
  // A small bush in the planter.
  for (let i = 0; i < 3; i++) {
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a4a30, roughness: 0.92 }),
    );
    const a = (i / 3) * Math.PI * 2;
    bush.position.set(NE_X + Math.cos(a) * 0.4, 0.85, NE_Z + Math.sin(a) * 0.4);
    bush.scale.set(1.0, 0.7, 1.0);
    bush.castShadow = true;
    group.add(bush);
  }
  // A small flower pot on the rim of the planter.
  const flowerPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.1, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 }),
  );
  flowerPot.position.set(NE_X - 0.9, 0.69, NE_Z);
  group.add(flowerPot);
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xe8a050, roughness: 0.6 }),
  );
  flower.position.set(NE_X - 0.9, 0.85, NE_Z);
  group.add(flower);

  // ---------- A second planter in the SW corner (asymmetric composition) ----------
  // Diagonally opposite the circular planter; rectangular wooden trough with
  // tall grass tufts. Tones contrast the stone planter.
  const SW_X = -6, SW_Z = 6;
  const planter2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.5, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.85 }),
  );
  planter2.position.set(SW_X, 0.25, SW_Z);
  planter2.castShadow = true;
  planter2.receiveShadow = true;
  group.add(planter2);
  // Plants in the second planter.
  for (let i = 0; i < 4; i++) {
    const grass = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.35, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a4a30, roughness: 0.92 }),
    );
    grass.position.set(SW_X - 0.6 + i * 0.4, 0.7, SW_Z);
    group.add(grass);
  }

  // ---------- A small in-plaza Ω tile (decal) ----------
  // The Plaza has the Ω symbol embedded into the paving in front of the
  // north opening (a circular copper disc).
  const om = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.02, 24),
    kit.copper,
  );
  om.position.set(0, 0.02, -D / 2 + 1.6);
  group.add(om);
  // Inner ring.
  const om2 = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.45, 24),
    new THREE.MeshStandardMaterial({ color: 0x2a1a08, roughness: 0.6 }),
  );
  om2.rotation.x = -Math.PI / 2;
  om2.position.set(0, 0.025, -D / 2 + 1.6);
  group.add(om2);

  scene.add(group);
  return { group, fountain, lamps };
}

function addWallSegment(
  group: THREE.Group,
  mat: THREE.Material,
  x: number, _y: number, z: number,
  sizeX: number, sizeY: number, sizeZ: number,
): void {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(sizeX, sizeY, sizeZ), mat);
  wall.position.set(x, sizeY / 2, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);
}

function buildFountain(kit: MaterialKit): Fountain {
  const group = new THREE.Group();
  group.name = "fountain";
  group.position.set(0, 0, 0);

  // Outer base (octagonal stone).
  const baseGeom = new THREE.CylinderGeometry(2.2, 2.4, 0.6, 8);
  const base = new THREE.Mesh(
    baseGeom,
    new THREE.MeshStandardMaterial({ color: 0x4a5664, roughness: 0.78, metalness: 0.12 }),
  );
  base.position.y = 0.3;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Inner basin rim.
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 2.0, 0.18, 8),
    kit.stoneLight,
  );
  rim.position.y = 0.69;
  rim.receiveShadow = true;
  group.add(rim);

  // Water surface.
  const waterGeom = new THREE.CylinderGeometry(1.85, 1.85, 0.05, 8);
  const waterMat = (kit.waterDormant as THREE.MeshStandardMaterial).clone();
  waterMat.color.setHex(0x2a3a48);
  waterMat.emissive.setHex(0x1a2a3a);
  waterMat.emissiveIntensity = 0.3;
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.position.y = 0.78;
  group.add(water);

  // Central copper pedestal (a column for the bell-on-top look).
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8),
    kit.copper,
  );
  pedestal.position.y = 1.2;
  pedestal.castShadow = true;
  group.add(pedestal);

  // The bell (a Lathe shape — the Plaza's silent bell).
  const bellGeom = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.4, 0),
      new THREE.Vector2(0.42, 0.08),
      new THREE.Vector2(0.36, 0.2),
      new THREE.Vector2(0.28, 0.28),
      new THREE.Vector2(0.25, 0.36),
    ],
    12,
  );
  const bell = new THREE.Mesh(bellGeom, kit.copper);
  bell.position.y = 1.65;
  bell.castShadow = true;
  group.add(bell);

  // The bell's clapper.
  const clapper = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.85 }),
  );
  clapper.position.y = 1.55;
  group.add(clapper);

  // Four small "spout" markers on the basin edge (where water would pour out).
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const spout = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.5),
      kit.copper,
    );
    spout.position.set(Math.cos(a) * 1.95, 0.85, Math.sin(a) * 1.95);
    spout.lookAt(0, 0.85, 0);
    spout.castShadow = true;
    group.add(spout);
  }

  return {
    group,
    water,
    waterMaterial: waterMat,
    alive: false,
  };
}
