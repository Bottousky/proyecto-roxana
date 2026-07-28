import * as THREE from 'three';
import type { VoxelRoom } from './voxelSchoolModel.ts';

export const SCHOOL_TIER_RISE = 2.4;

export interface SchoolRoomTerraceInstall {
  baseY: number;
  materials: THREE.MeshBasicMaterial[];
}

export function schoolRoomElevation(room: VoxelRoom): number {
  return room.presentationLevel * SCHOOL_TIER_RISE;
}

function terraceMaterial(name: string, color: number): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color,
    fog: true,
    toneMapped: false,
    alphaHash: true,
  });
  material.name = name;
  // El runtime tiñe todas las salas. Guardamos el color arquitectónico para
  // que ese tinte lo module en vez de reemplazarlo por blanco.
  material.userData.roomBaseColor = color;
  return material;
}

/**
 * Eleva una sala completa y rellena el espacio inferior con un zócalo. La
 * huella X/Z no cambia: las paredes compartidas siguen coincidiendo en planta.
 */
export function installSchoolRoomTerrace(
  root: THREE.Object3D,
  room: VoxelRoom,
): SchoolRoomTerraceInstall {
  const elevation = schoolRoomElevation(room);
  const materials: THREE.MeshBasicMaterial[] = [];
  root.userData.presentationLevel = room.presentationLevel;
  root.userData.presentationElevation = elevation;
  if (elevation <= 0) return { baseY: root.position.y, materials };

  if (!room.embedded) {
    root.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    root.worldToLocal(center);

    const width = Math.max(.5, room.width - .16);
    const depth = Math.max(.5, room.depth - .16);
    const foundationHeight = elevation + .14;
    const foundationMaterial = terraceMaterial(
      `RX_terrace_level_${room.presentationLevel}`,
      room.presentationLevel === 2 ? 0x302a31 : 0x25242b,
    );
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(width, foundationHeight, depth),
      foundationMaterial,
    );
    foundation.name = `ROOM_${room.id}__terrace_foundation`;
    foundation.position.set(center.x, -elevation / 2 + .07, center.z);
    foundation.renderOrder = -2;
    root.add(foundation);
    materials.push(foundationMaterial);

    // Una línea de piedra ligeramente más clara marca el borde del escalón
    // desde la cámara frontal sin agregar geometría sobre las salas vecinas.
    const trimMaterial = terraceMaterial(
      `RX_terrace_trim_level_${room.presentationLevel}`,
      room.presentationLevel === 2 ? 0x6e605f : 0x514b50,
    );
    const frontTrim = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(.4, width - .34), .18, .18),
      trimMaterial,
    );
    frontTrim.name = `ROOM_${room.id}__terrace_front_trim`;
    frontTrim.position.set(center.x, .02, center.z + depth / 2 - .08);
    frontTrim.renderOrder = -1;
    root.add(frontTrim);
    materials.push(trimMaterial);
  }

  root.position.y += elevation;
  return { baseY: root.position.y, materials };
}
