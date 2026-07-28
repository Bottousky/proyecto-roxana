import * as THREE from 'three';

export type InstallRoxanaStatueOptions = {
  prefix?: string;
  rotationY?: number;
  /** Multiplicador sobre la altura del volumen de referencia del hall. */
  heightScale?: number;
  /** Elevación de la base respecto de la base del volumen de referencia. */
  baseOffset?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /**
   * `undefined` aplica la piedra del hall. `null` conserva los materiales que
   * trae el GLB; también se puede inyectar un material de look-dev.
   */
  material?: THREE.Material | null;
};

/** Composición canónica del monumento en ROOM_hall. */
export const ROXANA_HALL_MONUMENT = {
  // Con el NPC adulto del hall (1,744 u), el GLB queda en ≈3,2 NPC:
  // figura ≈2,2 NPC + pedestal ≈1 NPC.
  heightScale: 1.39,
  baseOffset: .55,
} as const;

export type InstallRoxanaStatueResult = {
  statue: THREE.Group;
  /** Nodo del que cuelga la talla: el mismo padre que tenía la estatua vieja. */
  parent: THREE.Object3D;
  replaced: string[];
  bounds: THREE.Box3;
};

function createHallStoneMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0xc6ad80,
    emissive: 0x1c120b,
    emissiveIntensity: .12,
    metalness: .04,
    roughness: .88,
    flatShading: true,
  });
  material.name = 'RX_roxana_carved_stone';
  return material;
}

/**
 * Cambia la estatua de referencia del instituto por un GLB externo.
 *
 * Se apoya en la BASE de la estatua vieja, no en su centro: el modelo nuevo
 * viene centrado alrededor del origen y encajarlo por centros lo dejaría
 * flotando. La altura del hueco original funciona como contrato de escala.
 */
export function installRoxanaStatue(
  model: THREE.Object3D,
  statueSource: THREE.Object3D,
  options: InstallRoxanaStatueOptions = {},
): InstallRoxanaStatueResult | null {
  const prefix = options.prefix ?? 'HALL__roxana_';
  const legacy: THREE.Object3D[] = [];
  model.traverse((object) => {
    if (object.name.startsWith(prefix)) legacy.push(object);
  });
  if (!legacy.length) return null;

  model.updateMatrixWorld(true);
  const target = new THREE.Box3();
  for (const object of legacy) target.expandByObject(object);
  if (target.isEmpty()) return null;

  // Cuelga de donde colgaba la estatua vieja, no de la raíz del GLB: el picking
  // y el encuadre del hall recorren el subárbol de ROOM_*.
  const parent = legacy[0].parent ?? model;
  const statue = new THREE.Group();
  statue.name = 'HALL__roxana_statue_imported';
  statue.userData.kind = 'roxana-statue';
  statue.userData.source = 'roxana-statue.glb';
  statue.rotation.y = options.rotationY ?? 0;
  statue.add(statueSource);

  const material = options.material === undefined
    ? createHallStoneMaterial()
    : options.material;
  statue.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (material) object.material = material;
    object.castShadow = options.castShadow ?? false;
    object.receiveShadow = options.receiveShadow ?? false;
  });

  parent.add(statue);
  statue.updateMatrixWorld(true);

  const source = new THREE.Box3().setFromObject(statue);
  if (source.isEmpty()) {
    parent.remove(statue);
    return null;
  }

  const sourceSize = source.getSize(new THREE.Vector3());
  const targetSize = target.getSize(new THREE.Vector3());
  const heightScale = options.heightScale ?? 1;
  statue.scale.multiplyScalar(targetSize.y * heightScale / Math.max(sourceSize.y, .001));
  statue.updateMatrixWorld(true);

  const scaled = new THREE.Box3().setFromObject(statue);
  const scaledCenter = scaled.getCenter(new THREE.Vector3());
  const targetCenter = target.getCenter(new THREE.Vector3());
  const worldDelta = new THREE.Vector3(
    targetCenter.x - scaledCenter.x,
    target.min.y + (options.baseOffset ?? 0) - scaled.min.y,
    targetCenter.z - scaledCenter.z,
  );
  const worldPosition = statue.getWorldPosition(new THREE.Vector3()).add(worldDelta);
  parent.updateMatrixWorld(true);
  statue.position.copy(parent.worldToLocal(worldPosition));
  statue.updateMatrixWorld(true);

  const replaced = legacy.map((object) => object.name);
  for (const object of legacy) object.parent?.remove(object);

  return { statue, parent, replaced, bounds: target };
}
