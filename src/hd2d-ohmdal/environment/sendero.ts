// Sendero — the southern exterior of Cuenca de Ohm, between the world edge
// and the Portal. A 44m × 8m gravel path with low side walls, standing
// stones (silent markers of the path), a wooden signpost, and a few
// dead-grass patches. The Sendero suggests the Instituto side — the
// road the student walks to reach the Portal Ω.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface SenderoEntities {
  group: THREE.Group;
  lamps: Lamp[];
}

const W = 44;
const D = 8;
const WALL_H = 0.7;

export function buildSendero(
  scene: THREE.Scene,
  kit: MaterialKit,
  _tex: ProceduralTextures,
): SenderoEntities {
  const group = new THREE.Group();
  group.name = "sendero";
  group.position.y = 0;

  // ---------- Gravel ground (slightly different from the Plaza/Camino paving) ----
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      color: 0x5a4a38,
      roughness: 0.95,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // Dead-grass tufts scattered along the path.
  for (let i = 0; i < 30; i++) {
    const tuft = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({ color: 0x3a4530, roughness: 0.95 }),
    );
    tuft.position.set(
      -W / 2 + 1.5 + Math.random() * (W - 3),
      0.1,
      -D / 2 + 1 + Math.random() * (D - 2),
    );
    tuft.scale.set(1, 0.6 + Math.random() * 0.3, 1);
    tuft.castShadow = true;
    group.add(tuft);
  }

  // ---------- Low side walls (rough stone, lower than the Camino walls) ----------
  for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, WALL_H, D),
      new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.92 }),
    );
    wall.position.set(x, WALL_H / 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    // Top coping (a small flat stone).
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.1, D),
      new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.9 }),
    );
    coping.position.set(x, WALL_H + 0.05, 0);
    group.add(coping);
  }

  // ---------- Four standing stones (menhires) at intervals along the path ----
  for (let i = 0; i < 4; i++) {
    const stoneX = -W / 2 + 6 + i * 10;
    const side = i % 2 === 0 ? -1 : 1;
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.6, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.92 }),
    );
    stone.position.set(stoneX, 0.8, side * 1.6);
    stone.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.15;
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
    // A copper band around each menhir.
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.1, 0.45),
      kit.copper,
    );
    band.position.set(stoneX, 1.4, side * 1.6);
    band.rotation.y = stone.rotation.y;
    group.add(band);
  }

  // ---------- A wooden signpost (just south of the Portal, at x=0) ----------
  // The post is a tall wooden stake with a small copper plaque.
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 2.4, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.92 }),
  );
  post.position.set(0, 1.2, D / 2 - 1.2);
  post.castShadow = true;
  group.add(post);
  // The plaque (decorative — no text in the greybox).
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.4, 0.06),
    kit.copper,
  );
  plaque.position.set(0, 1.7, D / 2 - 0.95);
  plaque.castShadow = true;
  group.add(plaque);
  // A second, lower post (a forked marker).
  const post2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.4, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.92 }),
  );
  post2.position.set(0.5, 0.7, D / 2 - 1.2);
  post2.castShadow = true;
  group.add(post2);
  // A small flat copper sign on the second post.
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.3, 0.04),
    kit.copper,
  );
  sign.position.set(0.5, 1.1, D / 2 - 1.13);
  sign.castShadow = true;
  group.add(sign);

  // ---------- A single big boulder at the west edge ----------
  const boulder = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.0, 1),
    new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.95 }),
  );
  boulder.position.set(-W / 2 + 2.5, 0.6, -1.2);
  boulder.scale.set(1.4, 0.9, 1.1);
  boulder.castShadow = true;
  boulder.receiveShadow = true;
  group.add(boulder);
  // Two small rocks beside the boulder.
  for (const [dx, dz] of [[0.7, 0.4], [-0.5, 0.6]] as [number, number][]) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.3, 0),
      new THREE.MeshStandardMaterial({ color: 0x3a3a42, roughness: 0.95 }),
    );
    rock.position.set(-W / 2 + 2.5 + dx, 0.18, -1.2 + dz);
    rock.castShadow = true;
    group.add(rock);
  }

  // ---------- Two lampposts near the Portal approach ----------
  const lamps: Lamp[] = [];
  for (const x of [-3, 3]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, D / 2 - 1.5);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- A pair of low stone markers at the very south (world edge) ----
  for (const x of [-6, 6]) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.92 }),
    );
    marker.position.set(x, 0.25, -D / 2 + 0.5);
    marker.castShadow = true;
    group.add(marker);
    // A copper cap.
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.55),
      kit.copper,
    );
    cap.position.set(x, 0.54, -D / 2 + 0.5);
    group.add(cap);
  }

  // NOTE: the "hill at the south" backdrop was removed. It was placed at
  // world z=8 (between the Portal and the Camino), so with the camera rig
  // (always south of the player, looking north) it rendered as a large
  // translucent blue slab covering the Plaza, the player and the electrical
  // network. Distant scenery is already provided by the horizon band
  // (terrain.ts) and the landmark silhouettes (landmarks.ts).

  scene.add(group);
  return { group, lamps };
}
