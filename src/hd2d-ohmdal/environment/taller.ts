// Taller de Lumen — the workshop east of the Plaza.
// A real, accessible building. Player walks through a courtyard into the
// workshop where Lumen works.
//
// Layout (top-down, XZ plane):
//   ┌─────────────┐
//   │             │   ← back wall (east, 10m)
//   │   bench     │
//   │  ────────   │
//   │  stove      │   ← 10m × 8m
//   │  ────────   │
//   │   tools     │
//   ├────[door]───┤   ← west wall, with 1.6m door at z=0
//   └─────────────┘
//
// The Plaza wall on the east has a 3.5m opening; between the Plaza and the
// Taller is a small 6m × 4m courtyard with a low fence.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface TallerEntities {
  group: THREE.Group;
  bench: THREE.Group;
  lamps: Lamp[];
}

const W = 10;  // X extent
const D = 8;   // Z extent
const WALL_H = 3.2;
const DOOR_W = 1.8;
const DOOR_H = 2.4;

export function buildTaller(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
): TallerEntities {
  const group = new THREE.Group();
  group.name = "taller";

  // ---------- Floor ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      map: tex.stoneWall,
      color: 0x7a5a3a,
      roughness: 0.92,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // ---------- Walls ----------
  // The Taller is a closed building except for the west door.
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x4a3528,
    roughness: 0.88,
    metalness: 0.04,
  });
  // Back wall (east, x = W/2).
  addWall(group, wallMat,  W / 2, 0, 0, 0.4, WALL_H, D);
  // South wall (z = D/2).
  addWall(group, wallMat,  0, 0,  D / 2, W, WALL_H, 0.4);
  // North wall (z = -D/2).
  addWall(group, wallMat,  0, 0, -D / 2, W, WALL_H, 0.4);
  // West wall: split by the door.
  const sideLen = (D - DOOR_W) / 2;
  addWall(group, wallMat, -W / 2, 0, -D / 2 + sideLen / 2, 0.4, WALL_H, sideLen);
  addWall(group, wallMat, -W / 2, 0,  D / 2 - sideLen / 2, 0.4, WALL_H, sideLen);
  // Lintel above the door.
  addWall(group, wallMat, -W / 2, 0, 0, 0.4, WALL_H - DOOR_H, DOOR_W);

  // ---------- Door frame (decorative — the player can walk through the opening) ----------
  // A small wooden door, slightly ajar, visible inside the door frame.
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, DOOR_H, DOOR_W * 0.9),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85, metalness: 0.05 }),
  );
  door.position.set(-W / 2 + 0.15, DOOR_H / 2, 0);
  door.rotation.y = -0.5; // slightly ajar
  door.castShadow = true;
  group.add(door);
  // Door handle.
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    kit.copper,
  );
  handle.position.set(-W / 2 + 0.18, 1.0, DOOR_W * 0.35);
  group.add(handle);

  // ---------- Window on the back wall ----------
  for (const z of [-D / 2 + 1.4, D / 2 - 1.4]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.0, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x6a7a8a, roughness: 0.3, metalness: 0.0, transparent: true, opacity: 0.5 }),
    );
    win.position.set(W / 2 - 0.2, 1.6, z);
    group.add(win);
  }

  // ---------- Roof: a flat wood plank ceiling, just for shading (so player can see roof from outside) ----------
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.4, 0.3, D + 0.4),
    new THREE.MeshStandardMaterial({ color: 0x2a1a08, roughness: 0.92 }),
  );
  roof.position.set(0, WALL_H + 0.15, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // Roof beams (visible from inside).
  for (const z of [-D / 2 + 1, 0, D / 2 - 1]) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(W - 0.4, 0.25, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x1a1006, roughness: 0.9 }),
    );
    beam.position.set(0, WALL_H - 0.12, z);
    group.add(beam);
  }

  // ---------- Workbench (center, facing the door) ----------
  const bench = new THREE.Group();
  bench.name = "bench";
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.18, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.82 }),
  );
  benchTop.position.set(0, 1.0, 0);
  benchTop.castShadow = true;
  bench.add(benchTop);
  for (const dx of [-1.7, 1.7]) {
    for (const dz of [-0.55, 0.55]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1.0, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }),
      );
      leg.position.set(dx, 0.5, dz);
      leg.castShadow = true;
      bench.add(leg);
    }
  }
  // A back-shelf on the bench.
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.12, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.85 }),
  );
  shelf.position.set(0, 1.55, -0.5);
  bench.add(shelf);

  // Instruments on the bench (copper cylinders + glass dome + 1 broken device).
  for (const dx of [-1.3, -0.5, 0.3, 1.1]) {
    const inst = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.28, 8),
      kit.copper,
    );
    inst.position.set(dx, 1.22, 0);
    inst.castShadow = true;
    bench.add(inst);
  }
  // A glass dome.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 18, 14),
    new THREE.MeshStandardMaterial({
      color: 0xb0e0f0,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
      metalness: 0.0,
    }),
  );
  dome.position.set(0, 1.35, 0.25);
  bench.add(dome);
  // A schematic paper (a flat white sheet).
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.02, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xeae0c0, roughness: 0.95 }),
  );
  paper.position.set(-0.6, 1.10, 0.25);
  paper.rotation.y = 0.3;
  bench.add(paper);

  bench.position.set(0, 0, 1.0);
  group.add(bench);

  // ---------- Tool rack on the back wall ----------
  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.8, 5.5),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.85 }),
  );
  rack.position.set(W / 2 - 0.4, 1.6, 0);
  rack.castShadow = true;
  group.add(rack);
  for (let i = 0; i < 8; i++) {
    const tool = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.5, 0.08),
      kit.copper,
    );
    tool.position.set(W / 2 - 0.6, 1.4 + (i % 2) * 0.5, -2.4 + i * 0.65);
    tool.castShadow = true;
    group.add(tool);
  }
  // A round saw blade on the wall.
  const saw = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 18),
    new THREE.MeshStandardMaterial({ color: 0x6a6a7a, roughness: 0.3, metalness: 0.5, side: THREE.DoubleSide }),
  );
  saw.position.set(W / 2 - 0.45, 2.4, -2);
  group.add(saw);

  // ---------- Stove (southwest corner) ----------
  const stove = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.3, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x1a0e06, roughness: 0.92 }),
  );
  stove.position.set(-W / 2 + 1.4, 0.65, D / 2 - 1.4);
  stove.castShadow = true;
  stove.receiveShadow = true;
  group.add(stove);
  // Stove top opening.
  const stoveHole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.95 }),
  );
  stoveHole.position.set(-W / 2 + 1.4, 1.32, D / 2 - 1.4);
  group.add(stoveHole);
  // Chimney going up through the roof.
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, WALL_H + 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.92 }),
  );
  chimney.position.set(-W / 2 + 1.4, WALL_H / 2 + 0.5, D / 2 - 1.4);
  chimney.castShadow = true;
  group.add(chimney);

  // ---------- A shelf with jars (north wall) ----------
  for (let i = 0; i < 5; i++) {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.25, 8),
      new THREE.MeshStandardMaterial({
        color: [0x4a6a8a, 0x6a8a5a, 0x8a5a4a, 0x6a6a4a, 0x5a5a6a][i],
        roughness: 0.4,
        metalness: 0.0,
        transparent: true,
        opacity: 0.85,
      }),
    );
    jar.position.set(-W / 2 + 1.0 + i * 0.6, 1.7, -D / 2 + 0.3);
    jar.castShadow = true;
    group.add(jar);
  }
  // Shelf for jars.
  const jarShelf = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.1, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.85 }),
  );
  jarShelf.position.set(-1.2, 1.55, -D / 2 + 0.4);
  group.add(jarShelf);

  // ---------- A wooden chair ----------
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.08, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.85 }),
  );
  seat.position.set(0, 0.5, 0);
  chair.add(seat);
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]] as [number, number][]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.5, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }),
    );
    leg.position.set(dx, 0.25, dz);
    chair.add(leg);
  }
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.6, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.85 }),
  );
  back.position.set(0, 0.8, -0.2);
  chair.add(back);
  chair.position.set(2, 0, 2.4);
  chair.rotation.y = -0.4;
  group.add(chair);

  // ---------- Two lamps (one near the door, one over the bench) ----------
  const lamps: Lamp[] = [];
  for (const [x, z] of [[-W / 2 + 1.4, -D / 2 + 1.4], [0, 1.0], [W / 2 - 1.4, D / 2 - 1.4]] as [number, number][]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, z);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- Copper cable traces on the floor (3 paths to the bench) ----------
  for (const [x1, z1, x2, z2] of [
    [-W / 2 + 0.4, -2, 0, -2],  // from north wall to bench
    [0, -2, 0, 1.0],             // bench leg
    [W / 2 - 0.4, 2, W / 2 - 1.5, 2],
  ] as [number, number, number, number][]) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.06, len),
      new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: 0.5, metalness: 0.55 }),
    );
    seg.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
    seg.lookAt(new THREE.Vector3(x2, 0.04, z2));
    seg.castShadow = true;
    seg.receiveShadow = true;
    group.add(seg);
  }

  // ---------- Courtyard fence (low, on the west side, between Plaza and Taller) ----------
  // The Plaza has an east opening at z=0; here we add two short fence
  // segments to suggest the courtyard.
  // (Positioned in world-local coordinates: courtyard is at x = -W/2 - 3.)
  for (const z of [-2, 2]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.0, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }),
    );
    post.position.set(-W / 2 - 2, 0.5, z);
    post.castShadow = true;
    group.add(post);
  }
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.12, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }),
  );
  rail.position.set(-W / 2 - 2, 0.95, 0);
  group.add(rail);
  const rail2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.12, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }),
  );
  rail2.position.set(-W / 2 - 2, 0.45, 0);
  group.add(rail2);

  // ---------- A copper bowl with charcoal (in the courtyard) ----------
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.4, 0.3, 12, 1, true),
    kit.copper,
  );
  bowl.position.set(-W / 2 - 1.2, 0.15, 1.4);
  bowl.castShadow = true;
  group.add(bowl);

  scene.add(group);
  return { group, bench, lamps };
}

function addWall(
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
