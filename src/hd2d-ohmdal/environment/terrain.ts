// Terrain — the unified ground of Cuenca de Ohm.
// Instead of each region owning its own flat plane, terrain.ts creates a
// single continuous ground with elevation tiers that step between regions.
// The terrain is built from a set of rectangular plates (BoxGeometry, very
// flat) at the Y elevation each region defines. A wider "dirt" band is
// placed around the playable area, with the world bounds at the edge of
// the dirt.
//
// The terrain is intentionally austere (greybox) — no grass, no decoration.
// Regions are responsible for adding their own features on top of the
// terrain.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import { REGIONS } from "../world/topology.ts";

export interface TerrainEntities {
  group: THREE.Group;
  /** Y of the world at the given XZ (for ground collision / foot placement). */
  groundYAt: (x: number, z: number) => number;
  /** True if (x, z) is in the playable area; false means out-of-bounds. */
  isInsideWorld: (x: number, z: number) => boolean;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

const EXPAND = 6; // expand each region plate by this much so seams are covered

export function buildTerrain(kit: MaterialKit): TerrainEntities {
  const group = new THREE.Group();
  group.name = "terrain";

  // Determine the world bounds (with margin).
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const r of REGIONS) {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minZ = Math.min(minZ, r.z);
    maxZ = Math.max(maxZ, r.z + r.depth);
  }
  minX -= EXPAND; maxX += EXPAND; minZ -= EXPAND; maxZ += EXPAND;

  // 1. Continuous low ground (the "world floor") at y = -1.6 (the lowest
  //    accessible elevation, the Manantial patio).
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(maxX - minX, maxZ - minZ),
    new THREE.MeshStandardMaterial({
      color: 0x3a4654,
      roughness: 0.95,
      metalness: 0.0,
    }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.set((minX + maxX) / 2, -1.6, (minZ + maxZ) / 2);
  base.receiveShadow = true;
  group.add(base);

  // 2. For each region, build a slab at its Y. Use the region's footprint
  //    expanded by a few meters so adjacent regions overlap and the seams
  //    are not visible from the camera.
  for (const r of REGIONS) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(r.width + 1.2, 0.4, r.depth + 1.2),
      kit.stone,
    );
    slab.position.set(r.x + r.width / 2, r.y - 0.2, r.z + r.depth / 2);
    slab.castShadow = false;
    slab.receiveShadow = true;
    group.add(slab);
  }

  // 3. Perimeter wall: a low stone band along the world edges. Prevents the
  //    player from seeing the void and the un-built far side of the world.
  //    Leave an opening on the south side (the player enters from there).
  const wallH = 1.4;
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2a3540,
    roughness: 0.92,
    metalness: 0.02,
  });
  // North wall (full).
  addWall(group, wallMat, (minX + maxX) / 2, 0, minZ, maxX - minX, wallH, 0.6);
  // East wall (full).
  addWall(group, wallMat, maxX, 0, (minZ + maxZ) / 2, 0.6, wallH, maxZ - minZ);
  // West wall (full).
  addWall(group, wallMat, minX, 0, (minZ + maxZ) / 2, 0.6, wallH, maxZ - minZ);
  // South wall: leave the central opening (12m wide) for the Portal entry.
  const southGap = 12;
  const southLeftLen = (maxX - minX - southGap) / 2;
  const southMid = (minX + maxX) / 2;
  addWall(group, wallMat, minX + southLeftLen / 2, 0, maxZ, southLeftLen, wallH, 0.6);
  addWall(group, wallMat, maxX - southLeftLen / 2, 0, maxZ, southLeftLen, wallH, 0.6);
  void southMid;

  // 4. A distant horizon band: low rolling hills all around, beyond the
  //    walls, so the world doesn't end at the wall.
  const horizon = buildHorizon();
  group.add(horizon);

  const groundYAt = (x: number, z: number): number => {
    // Find the topmost region slab that contains (x, z). If none, the
    // player is on the base ground (y = -1.6).
    for (const r of REGIONS) {
      if (x >= r.x - 0.6 && x <= r.x + r.width + 0.6 &&
          z >= r.z - 0.6 && z <= r.z + r.depth + 0.6) {
        return r.y;
      }
    }
    return -1.6;
  };

  const isInsideWorld = (x: number, z: number): boolean => {
    // 1m inside the perimeter walls.
    return x > minX + 0.8 && x < maxX - 0.8 && z > minZ + 0.8 && z < maxZ - 0.8;
  };

  return {
    group,
    groundYAt,
    isInsideWorld,
    bounds: { minX, maxX, minZ, maxZ },
  };
}

function addWall(
  group: THREE.Group,
  mat: THREE.Material,
  cx: number, _cy: number, cz: number,
  sizeX: number, sizeY: number, sizeZ: number,
): void {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(sizeX, sizeY, sizeZ), mat);
  wall.position.set(cx, sizeY / 2 - 0.6, cz);
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);
}

function buildHorizon(): THREE.Group {
  const grp = new THREE.Group();
  grp.name = "horizon";
  // 8 mountain planes around the world.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    const dist = 90;
    const cx = Math.sin(a) * dist;
    const cz = -Math.cos(a) * dist - 10;
    const w = 60;
    const h = 26 + (i % 3) * 4;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x2a3a52).multiplyScalar(1 - (i % 3) * 0.08),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    );
    m.position.set(cx, h / 2 - 1, cz);
    m.lookAt(0, h / 2, -10);
    grp.add(m);
  }
  return grp;
}
