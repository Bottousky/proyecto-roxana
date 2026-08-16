// Manantial — the spatial payoff of Arc I, far north of Cuenca de Ohm.
// A sunken patio (-1.5m below Plaza) with a stone pool fed by a copper
// spire. Six stone pillars ring the pool; four lamps stand at the
// corners. The compuerta (a great iron gate) separates the patio from
// the Calzada.
//
// Layout (top-down):
//                       N
//                  ┌──────────────┐
//                  │ ░░░░░ ░░░░░  │   ← 4 corner lamps
//                  │              │
//                  │  ╔══════╗    │
//                  │  ║pool  ║    │   ← circular pool (8m diameter)
//                  │  ║      ║    │
//                  │  ║ spire║    │   ← central copper spire
//                  │  ╚══════╝    │
//                  │   pillars    │
//                  │              │
//                  │ ░░░░░ ░░░░░  │
//                  └──────┬───────┘
//                       gate  ← compuerta (when power returns, this opens)

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface ManantialEntities {
  group: THREE.Group;
  water: THREE.Mesh;
  waterMaterial: THREE.MeshStandardMaterial;
  lamps: Lamp[];
  gate: THREE.Mesh;
  gateOpen: boolean;
}

const W = 32;
const D = 12;
const PLATFORM_Y = -1.5;

export function buildManantial(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
): ManantialEntities {
  const group = new THREE.Group();
  group.name = "manantial";
  group.position.y = PLATFORM_Y;

  // ---------- Sunken patio floor (a stone-paved plane) ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({
      map: tex.stoneWall,
      color: 0x7a7a8a,
      roughness: 0.92,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.005;
  ground.receiveShadow = true;
  group.add(ground);

  // Decorative paving pattern (a few darker tiles in a grid).
  for (let xi = 0; xi < 5; xi++) {
    for (let zi = 0; zi < 2; zi++) {
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.04, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.9 }),
      );
      t.position.set(-12 + xi * 6, 0.02, -D / 2 + 3 + zi * 6);
      t.receiveShadow = true;
      group.add(t);
    }
  }

  // ---------- The pool (an 8m diameter circular basin) ----------
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4.2, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a3a4a, roughness: 0.7, metalness: 0.2 }),
  );
  pool.position.set(0, 0.25, 0);
  pool.receiveShadow = true;
  group.add(pool);

  // Pool rim (a stone ring around the pool).
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(4, 4.7, 32),
    kit.stoneLight,
  );
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(0, 0.55, 0);
  rim.receiveShadow = true;
  group.add(rim);

  // Water surface.
  const waterGeom = new THREE.CylinderGeometry(3.9, 3.9, 0.1, 32);
  const waterMat = (kit.waterDormant as THREE.MeshStandardMaterial).clone();
  waterMat.color.setHex(0x2a4a5a);
  waterMat.emissive.setHex(0x123040);
  waterMat.emissiveIntensity = 0.4;
  waterMat.opacity = 0.85;
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.position.set(0, 0.55, 0);
  group.add(water);

  // ---------- The spire (copper, gushes water when energized) ----------
  const spireBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.55, 0.5, 8),
    kit.copper,
  );
  spireBase.position.set(0, 0.75, 0);
  spireBase.castShadow = true;
  group.add(spireBase);

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1.8, 8),
    kit.copper,
  );
  spire.position.set(0, 1.9, 0);
  spire.castShadow = true;
  group.add(spire);

  const spireTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    kit.copperGlow,
  );
  spireTop.position.set(0, 3.0, 0);
  spireTop.castShadow = true;
  group.add(spireTop);

  // ---------- Six stone pillars around the pool (in a hex pattern) ----------
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = Math.cos(a) * 6.5;
    const pz = Math.sin(a) * 3.0;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, 3.2, 10),
      kit.stoneLight,
    );
    pillar.position.set(px, 1.6, pz);
    pillar.castShadow = true;
    group.add(pillar);

    // Pillar cap.
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.32, 0.25, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a5664, roughness: 0.78 }),
    );
    cap.position.set(px, 3.32, pz);
    cap.castShadow = true;
    group.add(cap);

    // A small copper band.
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.12, 10),
      kit.copper,
    );
    band.position.set(px, 0.2, pz);
    group.add(band);
  }

  // ---------- The compuerta (great iron gate, south side) ----------
  // The gate is a low stone-and-iron barrier that closes the entrance.
  // When power is on, the gate slides up.
  const gateFrameMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.85, metalness: 0.4 });
  // Two stone posts.
  for (const x of [-2.4, 2.4]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 4.5, 0.6),
      gateFrameMat,
    );
    post.position.set(x, 2.25, D / 2 - 0.6);
    post.castShadow = true;
    group.add(post);
  }
  // Top architrave.
  const architrave = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.5, 0.6),
    gateFrameMat,
  );
  architrave.position.set(0, 4.5, D / 2 - 0.6);
  architrave.castShadow = true;
  group.add(architrave);
  // The gate itself (a sliding iron grille, will move up when energized).
  const gate = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 4.0, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.7, metalness: 0.7 }),
  );
  gate.position.set(0, 2.0, D / 2 - 0.4);
  gate.castShadow = true;
  group.add(gate);
  // Iron bars (visual texture).
  for (let i = 0; i < 8; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.0, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.6, metalness: 0.6 }),
    );
    bar.position.set(-2.1 + i * 0.6, 2.0, D / 2 - 0.27);
    group.add(bar);
  }

  // ---------- Four corner lamps ----------
  const lamps: Lamp[] = [];
  for (const [x, z] of [
    [-W / 2 + 2.5, -D / 2 + 1.5],
    [ W / 2 - 2.5, -D / 2 + 1.5],
    [-W / 2 + 2.5,  D / 2 - 1.5],
    [ W / 2 - 2.5,  D / 2 - 1.5],
  ] as [number, number][]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, z);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- A subtle warm pool light ----------
  const poolLight = new THREE.PointLight(0x88c0d8, 0.4, 12, 1.5);
  poolLight.position.set(0, 1.5, 0);
  group.add(poolLight);

  // ---------- Background: a tall cliff face behind the Manantial (north) ----------
  const cliff = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 18),
    new THREE.MeshBasicMaterial({
      color: 0x2a3a52,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
  );
  cliff.position.set(0, 8, -14);
  group.add(cliff);
  // Two side cliffs.
  for (const x of [-20, 20]) {
    const c = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 12),
      new THREE.MeshBasicMaterial({ color: 0x1a2538, transparent: true, opacity: 0.92, depthWrite: false }),
    );
    c.position.set(x, 5, -10);
    c.lookAt(0, 5, 0);
    group.add(c);
  }

  scene.add(group);
  return { group, water, waterMaterial: waterMat, lamps, gate, gateOpen: false };
}
