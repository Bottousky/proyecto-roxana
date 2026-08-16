// Puerta de Ohm — the monumental arch between the Plaza/Calzada-alta and
// the Calzada to the Manantial.
// 12m wide × 9m tall arch. The player walks UNDER the arch (north→south).
//
// Spatial design (top-down):
//   ┌─────────────────────┐  ← 16m wide
//   │  ╔═════╗    ╔═════╗  │
//   │  ║     ║    ║     ║  │  ← two flanking towers (4m × 9m each)
//   │  ║     ║    ║     ║  │
//   │  ║     ║    ║     ║  │
//   │  ╚═════╝    ╚═════╝  │
//   │       ████████       │  ← lintel + Ω
//   │       █  Ω  █        │
//   └─────────────────────┘
//
// The "door" is a 4m wide opening between the towers. The Calzada-alta
// arrives from the south; the Calzada continues north.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface PuertaEntities {
  group: THREE.Group;
  lamps: Lamp[];
}

const W = 16;       // X extent
const D = 6;        // Z extent
const TOWER_W = 3.5; // each tower
const TOWER_H = 9;  // total height
const PASSAGE_W = 5; // passage between the two towers (north-south opening)
const PASSAGE_H = 6.5; // height of the arch passage

const PLATFORM_Y = 0.4;

export function buildPuerta(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
): PuertaEntities {
  const group = new THREE.Group();
  group.name = "puerta";
  group.position.y = PLATFORM_Y;

  // ---------- Raised platform (so the Puerta is visually distinct) ----------
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.8, D),
    kit.stoneLight,
  );
  platform.position.set(0, -0.4, 0);
  platform.receiveShadow = true;
  group.add(platform);

  // ---------- The two flanking towers ----------
  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.stoneWall,
    color: 0xc0c8d8,
    roughness: 0.8,
    metalness: 0.06,
  });
  for (const x of [-W / 2 + TOWER_W / 2, W / 2 - TOWER_W / 2]) {
    // Main tower body.
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(TOWER_W, TOWER_H, D),
      stoneMat,
    );
    tower.position.set(x, TOWER_H / 2, 0);
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Crenellations on top.
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(
        new THREE.BoxGeometry(TOWER_W * 0.28, 0.8, 0.5),
        stoneMat,
      );
      c.position.set(x - TOWER_W / 2 + (i + 0.5) * (TOWER_W / 3), TOWER_H + 0.4, 0);
      c.castShadow = true;
      group.add(c);
    }

    // Top platform (a flat cap with copper edging).
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(TOWER_W + 0.2, 0.3, D + 0.2),
      kit.stoneLight,
    );
    cap.position.set(x, TOWER_H + 0.15, 0);
    cap.castShadow = true;
    group.add(cap);

    // Window slits (tall, narrow, on each side of the tower).
    for (const z of [-D / 2 + 1.0, D / 2 - 1.0]) {
      const slit = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1.4, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.95 }),
      );
      slit.position.set(x, TOWER_H * 0.7, z);
      group.add(slit);
    }
  }

  // ---------- The lintel (top crossbar above the passage) ----------
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(PASSAGE_W, PASSAGE_H * 0.3, D),
    stoneMat,
  );
  lintel.position.set(0, PASSAGE_H * 0.85, 0);
  lintel.castShadow = true;
  group.add(lintel);

  // ---------- Cornice above the lintel ----------
  const cornice = new THREE.Mesh(
    new THREE.BoxGeometry(PASSAGE_W + 0.6, 0.4, D + 0.4),
    kit.stoneLight,
  );
  cornice.position.set(0, PASSAGE_H + 0.2, 0);
  cornice.castShadow = true;
  group.add(cornice);

  // ---------- Upper decorative block with the Ω ----------
  const upperBlock = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.2, D - 0.4),
    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6, metalness: 0.3 }),
  );
  upperBlock.position.set(0, PASSAGE_H + 1.0, 0);
  upperBlock.castShadow = true;
  group.add(upperBlock);

  // ---------- The Ω on the front face ----------
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.08, 12, 28),
    kit.copper,
  );
  ring.position.set(0, PASSAGE_H + 1.0, D / 2 + 0.05);
  ring.castShadow = true;
  group.add(ring);
  const barGeom = new THREE.BoxGeometry(0.45, 0.1, 0.1);
  const barL = new THREE.Mesh(barGeom, kit.copper);
  barL.position.set(-0.36, PASSAGE_H + 0.65, D / 2 + 0.05);
  group.add(barL);
  const barR = new THREE.Mesh(barGeom, kit.copper);
  barR.position.set(0.36, PASSAGE_H + 0.65, D / 2 + 0.05);
  group.add(barR);

  // ---------- The passage interior (a darkened arch under the lintel) ----------
  // Make the passage read as a clear arch: an interior arch shape using
  // a small box above the lintel + a flat ceiling.
  const passageCeiling = new THREE.Mesh(
    new THREE.BoxGeometry(PASSAGE_W, 0.2, D - 0.2),
    new THREE.MeshStandardMaterial({ color: 0x3a4654, roughness: 0.85 }),
  );
  passageCeiling.position.set(0, PASSAGE_H * 0.6, 0);
  passageCeiling.receiveShadow = true;
  group.add(passageCeiling);

  // ---------- The door: a heavy metal-and-copper gate, partially open ----------
  // The player walks through the passage regardless (the gate is symbolic
  // of the Manantial gate that opens with power).
  const gatePostL = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 2.8, 0.3),
    kit.copper,
  );
  gatePostL.position.set(-PASSAGE_W / 2 + 0.3, 1.4, 0);
  gatePostL.castShadow = true;
  group.add(gatePostL);
  const gatePostR = gatePostL.clone();
  gatePostR.position.x = PASSAGE_W / 2 - 0.3;
  group.add(gatePostR);
  // Crossbar.
  const gateTop = new THREE.Mesh(
    new THREE.BoxGeometry(PASSAGE_W - 0.4, 0.3, 0.3),
    kit.copper,
  );
  gateTop.position.set(0, 2.8, 0);
  group.add(gateTop);

  // The actual gate doors (open outward, one to each side).
  for (const dir of [-1, 1]) {
    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(PASSAGE_W / 2 - 0.4, 2.5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x2a1a08, roughness: 0.85, metalness: 0.3 }),
    );
    gate.position.set(dir * (PASSAGE_W / 4 + 0.1), 1.25, 0);
    gate.castShadow = true;
    group.add(gate);
  }

  // ---------- A faint warm light above the passage (the "candle" of the Puerta) ----------
  const dormantGlow = new THREE.PointLight(0xffa040, 0.3, 12, 1.5);
  dormantGlow.position.set(0, PASSAGE_H + 0.3, D / 2 + 1.0);
  group.add(dormantGlow);

  // ---------- Two flanking lamps (one at each tower base) ----------
  const lamps: Lamp[] = [];
  for (const x of [-W / 2 + 1.0, W / 2 - 1.0]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, D / 2 + 0.5);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- Side walls connecting Puerta to the Plaza and to the Calzada ----------
  // South side: connects to Calzada-alta (open on south).
  // North side: connects to Calzada (open on north).
  // The side walls are 0.9m tall — they just suggest boundaries.
  for (const x of [-W / 2, W / 2]) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a5664, roughness: 0.85 });
    // South connector.
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.0, 2.0),
      wallMat,
    );
    sw.position.set(x, 0.5, D / 2 + 1.0);
    sw.castShadow = true;
    group.add(sw);
    // North connector.
    const nw = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.0, 2.0),
      wallMat,
    );
    nw.position.set(x, 0.5, -D / 2 - 1.0);
    nw.castShadow = true;
    group.add(nw);
  }

  // ---------- Background: a low hill behind the Puerta (north) ----------
  const hill = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 14),
    new THREE.MeshBasicMaterial({
      color: 0x2a3a52,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
  );
  hill.position.set(0, 6, -16);
  group.add(hill);

  scene.add(group);
  return { group, lamps };
}
