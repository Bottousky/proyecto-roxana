import type { OhmdalNavigationZone } from './ohmdalNavigation.ts';

export interface SpawnAnchor {
  zone: OhmdalNavigationZone;
  position: readonly [number, number, number];
  lookAt?: readonly [number, number, number];
  directionIntoZone?: readonly [number, number, number];
}

export interface OhmdalTransitionAnchor {
  id: string;
  from: OhmdalNavigationZone | 'portal';
  to: OhmdalNavigationZone;
  anchor: SpawnAnchor;
  sourceDoor: readonly [number, number, number];
}

const direction = (x: number, y: number, z: number): readonly [number, number, number] => [x, y, z];

/** Destination-facing anchors. The target direction is semantic; yaw is derived at runtime. */
export const OHMDAL_TRANSITION_ANCHORS: Record<string, OhmdalTransitionAnchor> = {
  'portal-to-plaza': {
    id: 'portal-to-plaza', from: 'portal', to: 'plaza',
    anchor: { zone: 'plaza', position: [0, 1.68, -8], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [0, 0, -10],
  },
  'plaza-to-workshop': {
    id: 'plaza-to-workshop', from: 'plaza', to: 'workshop',
    anchor: { zone: 'workshop', position: [-60, 1.68, -3.8], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [-7.4, 0, -4],
  },
  'workshop-to-plaza': {
    id: 'workshop-to-plaza', from: 'workshop', to: 'plaza',
    anchor: { zone: 'plaza', position: [-6.8, 1.68, -4], directionIntoZone: direction(1, 0, 0) },
    sourceDoor: [-60, 0, -5],
  },
  'plaza-to-manantial': {
    id: 'plaza-to-manantial', from: 'plaza', to: 'manantial',
    anchor: { zone: 'manantial', position: [0, 1.68, 16], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [0, 0, 11.5],
  },
  'manantial-to-plaza': {
    id: 'manantial-to-plaza', from: 'manantial', to: 'plaza',
    anchor: { zone: 'plaza', position: [0, 1.68, 9.2], directionIntoZone: direction(0, 0, -1) },
    sourceDoor: [0, 0, 13],
  },
  'plaza-to-castle': {
    id: 'plaza-to-castle', from: 'plaza', to: 'castle',
    anchor: { zone: 'castle', position: [60, 1.68, -8], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [0, 0, 9.2],
  },
  'castle-to-plaza': {
    id: 'castle-to-plaza', from: 'castle', to: 'plaza',
    anchor: { zone: 'plaza', position: [0, 1.68, 9.2], directionIntoZone: direction(0, 0, -1) },
    sourceDoor: [60, 0, 8],
  },
  'castle-to-forge-terraces': {
    id: 'castle-to-forge-terraces', from: 'castle', to: 'forge-terraces',
    anchor: { zone: 'forge-terraces', position: [120, 1.68, -16], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [60, 0, 8],
  },
  'forge-terraces-to-castle': {
    id: 'forge-terraces-to-castle', from: 'forge-terraces', to: 'castle',
    anchor: { zone: 'castle', position: [60, 1.68, 8], directionIntoZone: direction(0, 0, -1) },
    sourceDoor: [120, 0, 24],
  },
  'forge-terraces-to-lighthouse': {
    id: 'forge-terraces-to-lighthouse', from: 'forge-terraces', to: 'lighthouse',
    anchor: { zone: 'lighthouse', position: [180, 1.68, -8], directionIntoZone: direction(0, 0, 1) },
    sourceDoor: [120, 0, 24],
  },
  'lighthouse-to-forge-terraces': {
    id: 'lighthouse-to-forge-terraces', from: 'lighthouse', to: 'forge-terraces',
    anchor: { zone: 'forge-terraces', position: [120, 1.68, 24], directionIntoZone: direction(0, 0, -1) },
    sourceDoor: [180, 0, 14],
  },
};

export function directionForAnchor(anchor: SpawnAnchor): readonly [number, number, number] {
  if (anchor.directionIntoZone) return anchor.directionIntoZone;
  if (anchor.lookAt) return [
    anchor.lookAt[0] - anchor.position[0],
    anchor.lookAt[1] - anchor.position[1],
    anchor.lookAt[2] - anchor.position[2],
  ];
  throw new Error(`Spawn anchor for ${anchor.zone} needs lookAt or directionIntoZone`);
}

export function yawForAnchor(anchor: SpawnAnchor): number {
  const [x, , z] = directionForAnchor(anchor);
  if (Math.hypot(x, z) < 0.001) throw new Error(`Spawn anchor for ${anchor.zone} has no horizontal direction`);
  const degrees = (Math.atan2(-x, -z) * 180) / Math.PI;
  return (degrees + 360) % 360;
}
