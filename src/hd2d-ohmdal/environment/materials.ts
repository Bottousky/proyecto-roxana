// Shared material library.
// All Ohmdal materials are stylized — saturated but slightly muted,
// readable, hand-painted feel. No PBR photoreal textures.
// Each material is built once and shared across the world.

import * as THREE from "three";

export interface MaterialKit {
  // Stone family
  stoneDark: THREE.Material;
  stone: THREE.Material;
  stoneLight: THREE.Material;
  stoneWarm: THREE.Material;
  // Copper family
  copperDark: THREE.Material;
  copper: THREE.Material;
  copperGlow: THREE.Material; // emissive when energized
  // Wood
  woodDark: THREE.Material;
  // Water
  waterDormant: THREE.Material;
  waterLive: THREE.Material;
  // Vegetation
  moss: THREE.Material;
  // Hero props
  portalBase: THREE.Material;
  doorOmega: THREE.Material;
  // Sky / fog helpers
  skyDormant: THREE.Color;
  skyLive: THREE.Color;
  fogDormant: THREE.Color;
  fogLive: THREE.Color;
}

export function createMaterialKit(): MaterialKit {
  // Subtle vertex color tints applied via instanceColor in InstancedMesh.

  // Stone: cool gray with subtle roughness variation. Slight emissive base
  // to keep subjects readable even when world is dormant.
  const stoneDark = new THREE.MeshStandardMaterial({
    color: 0x2a3540,
    roughness: 0.92,
    metalness: 0.0,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: 0x3a4654,
    roughness: 0.88,
    metalness: 0.02,
  });
  const stoneLight = new THREE.MeshStandardMaterial({
    color: 0x525e6e,
    roughness: 0.85,
    metalness: 0.02,
  });
  const stoneWarm = new THREE.MeshStandardMaterial({
    color: 0x6a5a48,
    roughness: 0.9,
    metalness: 0.0,
  });

  // Copper: warm oxidized metal. When energised, emissive carries the glow.
  const copperDark = new THREE.MeshStandardMaterial({
    color: 0x3a2a1c,
    roughness: 0.7,
    metalness: 0.45,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0x7a5232,
    roughness: 0.55,
    metalness: 0.55,
  });
  const copperGlow = new THREE.MeshStandardMaterial({
    color: 0xa87850,
    emissive: 0xe8a050,
    emissiveIntensity: 1.4,
    roughness: 0.4,
    metalness: 0.6,
  });

  // Wood: only for doors, furniture, workshop — warm, hand-finished.
  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x4a3520,
    roughness: 0.8,
    metalness: 0.0,
  });

  // Water: dormant is dark and still; live has emissive and animation.
  const waterDormant = new THREE.MeshStandardMaterial({
    color: 0x1a2530,
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.92,
  });
  const waterLive = new THREE.MeshStandardMaterial({
    color: 0x3a6a82,
    emissive: 0x123040,
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.7,
    transparent: true,
    opacity: 0.9,
  });

  const moss = new THREE.MeshStandardMaterial({
    color: 0x2a3528,
    roughness: 0.95,
    metalness: 0.0,
  });

  const portalBase = new THREE.MeshStandardMaterial({
    color: 0x3a4654,
    emissive: 0x000000,
    roughness: 0.7,
    metalness: 0.3,
  });

  const doorOmega = new THREE.MeshStandardMaterial({
    color: 0x4a3a2a,
    emissive: 0x000000,
    roughness: 0.6,
    metalness: 0.4,
  });

  return {
    stoneDark,
    stone,
    stoneLight,
    stoneWarm,
    copperDark,
    copper,
    copperGlow,
    woodDark,
    waterDormant,
    waterLive,
    moss,
    portalBase,
    doorOmega,
    skyDormant: new THREE.Color(0x1a2230),
    skyLive: new THREE.Color(0x2a3850),
    fogDormant: new THREE.Color(0x1a2230),
    fogLive: new THREE.Color(0x3a4a68),
  };
}
