// Path regions: Camino (south of Plaza, between Portal and Plaza) and
// Calzada (north of Puerta, between Puerta and Manantial).
// Each is a paved corridor with low side walls, lampposts, and
// architectural markers that frame the player's movement.
//
// The Calzada-alta (transition platform between Plaza and Puerta) is
// handled by world.ts as a region without a dedicated module; it shares
// the Plaza module's paving style.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface PathEntities {
  group: THREE.Group;
  lamps: Lamp[];
}

export interface PathSize {
  /** Path footprint (XZ, meters). Defaults match the current H1 Camino/Calzada. */
  width?: number;
  depth?: number;
}

const WALL_H = 1.0;

export function buildCamino(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
  size: PathSize = {},
): PathEntities {
  const W = size.width ?? 10;
  const D = size.depth ?? 6;
  const group = new THREE.Group();
  group.name = "camino";
  group.position.y = 0.2;

  // ---------- Paved ground ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      map: tex.plazaFloor,
      color: 0xb0b4bc,
      roughness: 0.92,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // ---------- Two low side walls (suggest the path) ----------
  for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, WALL_H, D),
      new THREE.MeshStandardMaterial({ color: 0x4a5664, roughness: 0.88 }),
    );
    wall.position.set(x, WALL_H / 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    // Top coping.
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.15, D),
      new THREE.MeshStandardMaterial({ color: 0x6a7686, roughness: 0.85 }),
    );
    coping.position.set(x, WALL_H + 0.075, 0);
    group.add(coping);
  }

  // ---------- Two lampposts ----------
  // (The visible copper cable along the ground is now drawn by the
  //  environment/cables.ts module so it follows the terrain elevation
  //  and reflects broken/intact state. The old decorative box was
  //  removed to avoid z-fight with the new network.)
  const lamps: Lamp[] = [];
  for (const z of [-D / 2 + 1, D / 2 - 1]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(0, 0, z);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- A single decorative column on each side (a surveyor's mark) ----------
  for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 1.6, 8),
      kit.stoneLight,
    );
    col.position.set(x, 0.8, 0);
    col.castShadow = true;
    group.add(col);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.18, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x6a7686, roughness: 0.8 }),
    );
    cap.position.set(x, 1.7, 0);
    group.add(cap);
  }

  scene.add(group);
  return { group, lamps };
}

export function buildCalzada(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
  size: PathSize = {},
): PathEntities {
  const W = size.width ?? 10;
  const D = size.depth ?? 6;
  const group = new THREE.Group();
  group.name = "calzada";
  group.position.y = 0.0;

  // ---------- Paved ground ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      map: tex.plazaFloor,
      color: 0x8a92a4,
      roughness: 0.92,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // ---------- Two low side walls ----------
  for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, WALL_H, D),
      new THREE.MeshStandardMaterial({ color: 0x3a4654, roughness: 0.88 }),
    );
    wall.position.set(x, WALL_H / 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, D),
      new THREE.MeshStandardMaterial({ color: 0x525e6e, roughness: 0.85 }),
    );
    coping.position.set(x, WALL_H + 0.06, 0);
    group.add(coping);
  }

  // ---------- A pair of low trees on each side (suggest a path through nature) ----------
  for (const [x, z] of [[-W / 2 + 1.2, -1.5], [-W / 2 + 1.2, 1.5], [W / 2 - 1.2, -1.5], [W / 2 - 1.2, 1.5]] as [number, number][]) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 }),
    );
    trunk.position.set(x, 0.7, z);
    trunk.castShadow = true;
    group.add(trunk);
    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.75, 1),
      new THREE.MeshStandardMaterial({ color: 0x3a4a30, roughness: 0.95 }),
    );
    foliage.position.set(x, 1.85, z);
    foliage.castShadow = true;
    group.add(foliage);
  }

  // ---------- Two lampposts ----------
  // (Cable removed: see note in buildCamino above — the network is now
  //  drawn by environment/cables.ts.)
  const lamps: Lamp[] = [];
  for (const z of [-D / 2 + 1, D / 2 - 1]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(0, 0, z);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  scene.add(group);
  return { group, lamps };
}
