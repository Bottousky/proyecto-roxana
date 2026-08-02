import * as THREE from 'three';
import type { BoxModuleDefinition } from '../architecture/levelData.ts';

export type BlockoutMaterialFamily = BoxModuleDefinition['family'];
export type BlockoutTimeOfDay = 'afternoon' | 'twilight';

const AFTERNOON_COLORS: Readonly<Record<BlockoutMaterialFamily, number>> = {
  stone: 0x71685f,
  copper: 0x80604a,
  wood: 0x59483c,
  water: 0x467987,
  glass: 0x72a6ab,
};

const TWILIGHT_COLORS: Readonly<Record<BlockoutMaterialFamily, number>> = {
  stone: 0x545761,
  copper: 0x685149,
  wood: 0x433d40,
  water: 0x376f82,
  glass: 0x55aab4,
};

export interface MaterialDiagnostics {
  readonly disposed: boolean;
  readonly sharedCount: number;
  readonly ownedOccluderCloneCount: number;
  readonly textureCount: 0;
}
export interface BlockoutMaterialSet {
  readonly shared: Readonly<Record<BlockoutMaterialFamily, THREE.MeshStandardMaterial>>;
  readonly colliderDebug: THREE.MeshBasicMaterial;
  readonly navigationDebug: THREE.MeshBasicMaterial;
  materialFor(family: BlockoutMaterialFamily): THREE.MeshStandardMaterial;
  createOccluderMaterial(family: BlockoutMaterialFamily): THREE.MeshStandardMaterial;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  diagnostics(): MaterialDiagnostics;
  dispose(): void;
}

function standardMaterial(family: BlockoutMaterialFamily, color: number): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: family === 'copper' ? 0.62 : family === 'glass' ? 0.38 : 0.86,
    metalness: family === 'copper' ? 0.48 : 0,
    transparent: family === 'water' || family === 'glass',
    opacity: family === 'water' ? 0.72 : family === 'glass' ? 0.78 : 1,
    depthWrite: family !== 'water' && family !== 'glass',
    flatShading: true,
  });
  material.name = `OHMDAL_BLOCKOUT_${family.toUpperCase()}`;
  return material;
}

export function createBlockoutMaterials(initialTime: BlockoutTimeOfDay = 'afternoon'): BlockoutMaterialSet {
  const shared = {
    stone: standardMaterial('stone', AFTERNOON_COLORS.stone),
    copper: standardMaterial('copper', AFTERNOON_COLORS.copper),
    wood: standardMaterial('wood', AFTERNOON_COLORS.wood),
    water: standardMaterial('water', AFTERNOON_COLORS.water),
    glass: standardMaterial('glass', AFTERNOON_COLORS.glass),
  };
  const colliderDebug = new THREE.MeshBasicMaterial({ color: 0xff315f, wireframe: true });
  colliderDebug.name = 'OHMDAL_COLLIDER_DEBUG';
  const navigationDebug = new THREE.MeshBasicMaterial({
    color: 0x4ed6a8,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  navigationDebug.name = 'OHMDAL_NAVIGATION_DEBUG';
  const occluderClones: THREE.MeshStandardMaterial[] = [];
  let disposed = false;

  const api: BlockoutMaterialSet = {
    shared,
    colliderDebug,
    navigationDebug,
    materialFor(family) {
      return shared[family];
    },
    createOccluderMaterial(family) {
      if (disposed) throw new Error('Blockout materials are disposed');
      const clone = shared[family].clone();
      clone.name = `${shared[family].name}_OCCLUDER_${occluderClones.length + 1}`;
      clone.transparent = true;
      clone.depthWrite = false;
      occluderClones.push(clone);
      return clone;
    },
    setTimeOfDay(timeOfDay) {
      if (disposed) throw new Error('Blockout materials are disposed');
      const colors = timeOfDay === 'twilight' ? TWILIGHT_COLORS : AFTERNOON_COLORS;
      for (const family of Object.keys(shared) as BlockoutMaterialFamily[]) {
        shared[family].color.setHex(colors[family]);
      }
      for (const clone of occluderClones) {
        const family = clone.name.match(/^OHMDAL_BLOCKOUT_([A-Z]+)/)?.[1]?.toLowerCase() as BlockoutMaterialFamily | undefined;
        if (family && colors[family] !== undefined) clone.color.setHex(colors[family]);
      }
    },
    diagnostics() {
      return {
        disposed,
        sharedCount: Object.keys(shared).length + 2,
        ownedOccluderCloneCount: occluderClones.length,
        textureCount: 0,
      };
    },
    dispose() {
      if (disposed) return;
      Object.values(shared).forEach((material) => material.dispose());
      colliderDebug.dispose();
      navigationDebug.dispose();
      occluderClones.forEach((material) => material.dispose());
      disposed = true;
    },
  };
  api.setTimeOfDay(initialTime);
  return api;
}
