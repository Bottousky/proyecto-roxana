// Portal Ω — the entrance from the Instituto to Ohmdal.
// A monumental stone arch with a glowing core, accessed via a short flight
// of steps from the Sendero. Always lit (the only energy in dormant Ohmdal
// comes from here).
//
// Spatial design:
//   - 8m × 6m raised platform (y = 0.4)
//   - 5m tall, 4m wide stone arch
//   - Recessed core (1m diameter glowing sphere)
//   - Two flanking copper urns
//   - Stone steps down to the Camino (handled by stairs.ts in world.ts)

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { ProceduralTextures } from "../data/procedural.ts";
import { buildLamp, type Lamp } from "./lamps.ts";

export interface PortalEntities {
  group: THREE.Group;
  core: THREE.Mesh;
  coreLight: THREE.PointLight;
  lamps: Lamp[];
}

const PLATFORM_Y = 0.4;

export function buildPortal(
  scene: THREE.Scene,
  kit: MaterialKit,
  tex: ProceduralTextures,
): PortalEntities {
  const group = new THREE.Group();
  group.name = "portal";
  group.position.y = PLATFORM_Y;

  // ---------- Platform ----------
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.8, 6),
    kit.stoneLight,
  );
  platform.position.set(0, -0.4, 0);
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  // Decorative inset border on the platform.
  for (let i = 0; i < 6; i++) {
    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.05, 0.15),
      kit.copper,
    );
    inset.position.set(-3.5 + i * 1.4, 0.01, 2.8);
    inset.castShadow = true;
    group.add(inset);
    const inset2 = inset.clone();
    inset2.position.z = -2.8;
    group.add(inset2);
  }

  // ---------- Arch (back wall) ----------
  // The Portal reads as a flat back wall from the player's view (the
  // camera looks roughly south). It's 5m wide × 5m tall.
  const archBack = new THREE.Mesh(
    new THREE.BoxGeometry(4, 5, 0.7),
    new THREE.MeshStandardMaterial({
      map: tex.stoneWall,
      color: 0xa8b0c0,
      roughness: 0.78,
      metalness: 0.08,
    }),
  );
  archBack.position.set(0, 2.5, -2.6);
  archBack.castShadow = true;
  archBack.receiveShadow = true;
  group.add(archBack);

  // ---------- Arch pillars (left + right) ----------
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x8a92a4,
    roughness: 0.82,
    metalness: 0.05,
  });
  for (const x of [-2.4, 2.4]) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 5.4, 1.0),
      pillarMat,
    );
    pillar.position.set(x, 2.7, -2.1);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // Capital.
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 1.2),
      kit.stoneLight,
    );
    cap.position.set(x, 5.4, -2.1);
    cap.castShadow = true;
    group.add(cap);
  }

  // ---------- Lintel (top crossbar) ----------
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.7, 1.2),
    pillarMat,
  );
  lintel.position.set(0, 5.6, -2.1);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  group.add(lintel);

  // ---------- Cornice (top of the arch) ----------
  const cornice = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.5, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x9aa4b8, roughness: 0.78 }),
  );
  cornice.position.set(0, 6.2, -2.1);
  cornice.castShadow = true;
  group.add(cornice);

  // ---------- Upper decorative block (the "head" of the arch) ----------
  const upperBlock = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6, metalness: 0.3 }),
  );
  upperBlock.position.set(0, 6.95, -2.0);
  upperBlock.castShadow = true;
  group.add(upperBlock);

  // ---------- Inner recess (dark stone behind the core) ----------
  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 2.8, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.95 }),
  );
  recess.position.set(0, 1.6, -2.1);
  group.add(recess);

  // ---------- The Core: glowing sphere ----------
  // This is the only always-on light in dormant Ohmdal — the spark waiting
  // to propagate.
  const coreGeom = new THREE.SphereGeometry(0.7, 24, 18);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffd28a,
    emissive: 0xffa040,
    emissiveIntensity: 2.4,
    roughness: 0.2,
    metalness: 0.0,
    transparent: true,
    opacity: 0.95,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.set(0, 1.7, -1.9);
  group.add(core);

  // Halo.
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffa040,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  halo.position.set(0, 1.7, -1.9);
  group.add(halo);

  const coreLight = new THREE.PointLight(0xffa040, 1.2, 14, 1.5);
  coreLight.position.set(0, 1.7, -1.6);
  group.add(coreLight);

  // ---------- Ω symbol on the upper block ----------
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.06, 8, 24),
    kit.copper,
  );
  ring.position.set(0, 6.95, -1.35);
  ring.castShadow = true;
  group.add(ring);
  const barGeom = new THREE.BoxGeometry(0.45, 0.08, 0.08);
  const barL = new THREE.Mesh(barGeom, kit.copper);
  barL.position.set(-0.32, 6.6, -1.35);
  group.add(barL);
  const barR = new THREE.Mesh(barGeom, kit.copper);
  barR.position.set(0.32, 6.6, -1.35);
  group.add(barR);

  // ---------- Two flanking copper urns (low lamps) ----------
  const lamps: Lamp[] = [];
  for (const x of [-3.0, 3.0]) {
    const lamp = buildLamp(kit);
    lamp.group.position.set(x, 0, 0);
    lamp.position.copy(lamp.group.position);
    group.add(lamp.group);
    lamps.push(lamp);
  }

  // ---------- Low side railings on the platform ----------
  for (const x of [-3.5, 3.5]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.6, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x5a6478, roughness: 0.85 }),
    );
    rail.position.set(x, 0.3, 0);
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
  }

  // ---------- Background hint: a low hill behind the Portal ----------
  const hill = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 10),
    new THREE.MeshBasicMaterial({
      color: 0x2a3a52,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    }),
  );
  hill.position.set(0, 4, -16);
  group.add(hill);

  scene.add(group);
  return { group, core, coreLight, lamps };
}
