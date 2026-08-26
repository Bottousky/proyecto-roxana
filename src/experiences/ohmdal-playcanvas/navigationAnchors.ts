import type { ZoneId } from './collisionRegistry.ts';

export interface SpawnAnchor {
  id: string;
  zone: ZoneId;
  position: readonly [number, number, number];
  lookAt?: readonly [number, number, number];
  directionIntoZone?: readonly [number, number, number];
  description: string;
}

/**
 * Derives camera/player yaw in degrees from anchor data.
 *
 * In PlayCanvas FPS orientation:
 * yaw = 0 deg => forward vector = (0, 0, -1) [North, -Z]
 * yaw = 90 deg => forward vector = (-1, 0, 0) [West, -X]
 * yaw = 180 deg => forward vector = (0, 0, 1) [South, +Z]
 * yaw = 270 deg => forward vector = (1, 0, 0) [East, +X]
 *
 * formula: yaw = Math.atan2(-dx, -dz) converted to [0, 360) degrees.
 */
export function deriveYawFromAnchor(anchor: SpawnAnchor): number {
  let dx = 0;
  let dz = 0;
  if (anchor.directionIntoZone) {
    [dx, , dz] = anchor.directionIntoZone;
  } else if (anchor.lookAt) {
    const [px, , pz] = anchor.position;
    const [lx, , lz] = anchor.lookAt;
    dx = lx - px;
    dz = lz - pz;
  } else {
    return 0;
  }

  const rad = Math.atan2(-dx, -dz);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return (deg + 360) % 360;
}

export function getForwardVectorFromYaw(yawDegrees: number): [number, number, number] {
  const rad = (yawDegrees * Math.PI) / 180;
  return [-Math.sin(rad), 0, -Math.cos(rad)];
}

export function dotProduct(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function normalizeVector(
  v: readonly [number, number, number],
): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Canonical spawn anchors for all transitions in Arco I.
 * Every anchor points strictly into the destination zone and away from the threshold door.
 */
export const OHMDAL_SPAWN_ANCHORS: Record<string, SpawnAnchor> = {
  // Initial arrival at the portal: player stands at south portal and looks into Plaza towards Ohm
  'portal-initial': {
    id: 'portal-initial',
    zone: 'plaza' as ZoneId,
    position: [0, 1.68, -8.0],
    directionIntoZone: [0, 0, 1],
    description: 'Initial portal arrival facing south into Plaza and Ohm landmark',
  },

  // Plaza -> Workshop interior
  'plaza-to-workshop': {
    id: 'plaza-to-workshop',
    zone: 'workshop' as ZoneId,
    position: [-60.0, 1.68, -3.8],
    directionIntoZone: [0, 0, 1],
    description: 'Enter workshop interior facing north towards Lumen and Master Workbench',
  },

  // Workshop interior -> Plaza
  'workshop-to-plaza': {
    id: 'workshop-to-plaza',
    zone: 'plaza' as ZoneId,
    position: [-7.0, 1.68, -4.0],
    directionIntoZone: [1, 0, 0],
    description: 'Exit workshop back to Plaza facing east towards Plaza center',
  },

  // Plaza -> Manantial
  'plaza-to-manantial': {
    id: 'plaza-to-manantial',
    zone: 'manantial' as ZoneId,
    position: [0, 1.68, 16.0],
    directionIntoZone: [0, 0, 1],
    description: 'Enter Manantial powerhouse facing south towards hydraulic intake and turbine',
  },

  // Manantial -> Plaza
  'manantial-to-plaza': {
    id: 'manantial-to-plaza',
    zone: 'plaza' as ZoneId,
    position: [0, 1.68, 9.2],
    directionIntoZone: [0, 0, -1],
    description: 'Exit Manantial back to Plaza facing north towards Plaza center',
  },

  // Plaza -> Castle
  'plaza-to-castle': {
    id: 'plaza-to-castle',
    zone: 'castle' as ZoneId,
    position: [60.0, 1.68, -8.0],
    directionIntoZone: [0, 0, 1],
    description: 'Enter Castle distribution hall facing north along the raised bus towards panel',
  },

  // Castle -> Plaza
  'castle-to-plaza': {
    id: 'castle-to-plaza',
    zone: 'plaza' as ZoneId,
    position: [0, 1.68, 9.2],
    directionIntoZone: [0, 0, -1],
    description: 'Exit Castle back to Plaza facing north into restored Plaza route',
  },

  // Castle -> Forge/Terraces
  'castle-to-forge': {
    id: 'castle-to-forge',
    zone: 'forge-terraces' as ZoneId,
    position: [120.0, 1.68, -16.0],
    directionIntoZone: [0, 0, 1],
    description: 'Enter Forge floor facing north towards industrial heaters and terraces',
  },

  // Forge/Terraces -> Castle (return path)
  'forge-to-castle': {
    id: 'forge-to-castle',
    zone: 'castle' as ZoneId,
    position: [60.0, 1.68, 8.0],
    directionIntoZone: [0, 0, -1],
    description: 'Return to Castle hall facing south towards distribution panel and exit',
  },

  // Forge/Terraces -> Lighthouse
  'forge-to-lighthouse': {
    id: 'forge-to-lighthouse',
    zone: 'lighthouse' as ZoneId,
    position: [180.0, 1.68, -8.0],
    directionIntoZone: [0, 0, 1],
    description: 'Enter Lighthouse facing north towards DC calibration panel and beacon',
  },

  // Lighthouse -> Forge/Terraces (return path)
  'lighthouse-to-forge': {
    id: 'lighthouse-to-forge',
    zone: 'forge-terraces' as ZoneId,
    position: [120.0, 1.68, 24.0],
    directionIntoZone: [0, 0, -1],
    description: 'Return to Terraces pump station facing south into agricultural basin',
  },
};
