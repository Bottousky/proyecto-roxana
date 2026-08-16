// Lamp module: a stone base + copper post + housing + emissive orb.
// Shared between Plaza, Camino, Puerta, Manantial, and Taller.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";

export interface Lamp {
  group: THREE.Object3D;
  emissive: THREE.Mesh;
  light?: THREE.PointLight;
  position: THREE.Vector3;
  energized: boolean;
  // Update the lamp's emissive state (called by the electrical system).
  setEnergized: (on: boolean) => void;
}

export function buildLamp(kit: MaterialKit): Lamp {
  const group = new THREE.Group();
  group.name = "lamp";

  const baseGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x4a5664,
    roughness: 0.85,
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.25;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const postGeom = new THREE.CylinderGeometry(0.1, 0.12, 2.6, 8);
  const post = new THREE.Mesh(postGeom, kit.copperDark);
  post.position.y = 1.8;
  post.castShadow = true;
  group.add(post);

  const housingGeom = new THREE.CylinderGeometry(0.32, 0.38, 0.45, 8);
  const housing = new THREE.Mesh(housingGeom, kit.copper);
  housing.position.y = 3.3;
  housing.castShadow = true;
  group.add(housing);

  const orbGeom = new THREE.SphereGeometry(0.28, 18, 14);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x9ad8e8,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.25,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
  });
  const orb = new THREE.Mesh(orbGeom, orbMat);
  orb.position.y = 3.3;
  orb.castShadow = true;
  group.add(orb);

  const finialGeom = new THREE.ConeGeometry(0.15, 0.25, 6);
  const finial = new THREE.Mesh(finialGeom, kit.copper);
  finial.position.y = 3.75;
  finial.castShadow = true;
  group.add(finial);

  // Per-lamp point light (intensity 0 when dormant, ramps up when energized).
  const light = new THREE.PointLight(0xffd28a, 0, 6, 1.6);
  light.position.y = 3.3;
  group.add(light);

  const setEnergized = (on: boolean) => {
    if (on) {
      orbMat.emissive.setHex(0xfff4d8);
      orbMat.emissiveIntensity = THREE.MathUtils.lerp(orbMat.emissiveIntensity, 2.2, 0.1);
      light.intensity = THREE.MathUtils.lerp(light.intensity, 1.4, 0.08);
    } else {
      orbMat.emissive.setHex(0x000000);
      orbMat.emissiveIntensity = THREE.MathUtils.lerp(orbMat.emissiveIntensity, 0, 0.1);
      light.intensity = THREE.MathUtils.lerp(light.intensity, 0, 0.08);
    }
  };

  return {
    group,
    emissive: orb,
    light,
    position: new THREE.Vector3(),
    energized: false,
    setEnergized,
  };
}
