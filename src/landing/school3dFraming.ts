import * as THREE from 'three';
import { SCHOOL_VIEW_X } from './voxelSchoolModel.ts';

// A fixed oblique view exposes circulation and furniture depth in both wings.
export const SCHOOL_VIEW_DIRECTION = new THREE.Vector3(SCHOOL_VIEW_X, 1.2, 1).normalize();
export const SCHOOL_MOBILE_DIRECTION = new THREE.Vector3(1, 1.8, 1).normalize();

export function frameSchoolBounds(
  bounds: THREE.Box3,
  viewWidth: number,
  viewHeight: number,
  padding = .10,
  direction = SCHOOL_VIEW_DIRECTION,
): { target: THREE.Vector3; zoom: number } {
  const target = bounds.getCenter(new THREE.Vector3());
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const corner = new THREE.Vector3();
  let horizontal = 0, vertical = 0;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        corner.set(x, y, z).sub(target);
        horizontal = Math.max(horizontal, Math.abs(corner.dot(right)) * 2);
        vertical = Math.max(vertical, Math.abs(corner.dot(up)) * 2);
      }
    }
  }
  const available = 1 - padding * 2;
  return {
    target,
    zoom: Math.min(viewWidth * available / Math.max(horizontal, 1), viewHeight * available / Math.max(vertical, 1)),
  };
}
