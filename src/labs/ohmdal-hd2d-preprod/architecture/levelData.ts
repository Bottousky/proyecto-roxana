/**
 * Blockout autoral de H2. Todas las medidas estan expresadas en metros.
 * El plano jugable es Y=0 y cada modulo arquitectonico conserva su pivote en el suelo.
 */

export const LEVEL_ID = 'ohmdal-hd2d-preprod-v1' as const;
export const LEVEL_SEED = 'ohmdal-hd2d-preprod-v1' as const;
export const GAMEPLAY_PLANE_Y = 0;
export const METRIC_GRID = 0.5;
export const MANNEQUIN_HEIGHT_METERS = 1.72;

export interface MetricPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MetricBounds2 {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export type ZoneId = 'portal_plaza' | 'taller' | 'puerta_manantial';

export interface LevelZone {
  readonly id: ZoneId;
  readonly purpose: 'arrival-orientation' | 'diagnosis-workspace' | 'objective-consequence';
  readonly bounds: MetricBounds2;
  readonly landmarkId: string;
}

export type RouteAnchorId =
  | 'R0_PORTAL_SPAWN'
  | 'R1_PLAZA_ENTRY'
  | 'R2_PLAZA_DIAGONAL'
  | 'R3_TALLER_THRESHOLD'
  | 'R4_LUMEN_STOP'
  | 'R5_FOREGROUND_BYPASS'
  | 'R6_TALLER_MEASURE'
  | 'R7_DOOR_APPROACH'
  | 'R8_DOOR_MEASURE'
  | 'R9_SPRING_EDGE';

export interface RouteAnchor {
  readonly id: RouteAnchorId;
  readonly position: MetricPoint;
  readonly purpose: string;
}

export interface ArchitectureSocket {
  readonly id: string;
  readonly from: ZoneId;
  readonly to: ZoneId;
  readonly position: MetricPoint;
  readonly width: number;
}

export interface BoxModuleDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly family: 'stone' | 'copper' | 'wood' | 'water' | 'glass';
  readonly centerX: number;
  readonly centerZ: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly baseY?: number;
  readonly pivotY: typeof GAMEPLAY_PLANE_Y;
  readonly tags: readonly ('floor' | 'structure' | 'landmark' | 'cameraOccluder' | 'cameraRoof' | 'emitter')[];
}

export interface ColliderDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly bounds: MetricBounds2;
  readonly height: number;
  readonly planeY: typeof GAMEPLAY_PLANE_Y;
}

export const LEVEL_ZONES: readonly LevelZone[] = [
  {
    id: 'portal_plaza',
    purpose: 'arrival-orientation',
    bounds: { minX: -21, maxX: -4, minZ: -6, maxZ: 6 },
    landmarkId: 'portal-arch',
  },
  {
    id: 'taller',
    purpose: 'diagnosis-workspace',
    bounds: { minX: -4.5, maxX: 8.5, minZ: -5, maxZ: 4.5 },
    landmarkId: 'workshop-roof-high',
  },
  {
    id: 'puerta_manantial',
    purpose: 'objective-consequence',
    bounds: { minX: 8, maxX: 20.5, minZ: -5, maxZ: 5.5 },
    landmarkId: 'ohm-door-frame',
  },
] as const;

export const ROUTE_ANCHORS: readonly RouteAnchor[] = [
  { id: 'R0_PORTAL_SPAWN', position: { x: -18, y: 0, z: 0 }, purpose: 'spawn at Portal' },
  { id: 'R1_PLAZA_ENTRY', position: { x: -13, y: 0, z: 0 }, purpose: 'enter Plaza' },
  { id: 'R2_PLAZA_DIAGONAL', position: { x: -7.5, y: 0, z: -2.5 }, purpose: 'read Plaza diagonal' },
  { id: 'R3_TALLER_THRESHOLD', position: { x: -3, y: 0, z: -2.5 }, purpose: 'cross Taller threshold' },
  { id: 'R4_LUMEN_STOP', position: { x: 0, y: 0, z: -2.5 }, purpose: 'stop before Lumen' },
  { id: 'R5_FOREGROUND_BYPASS', position: { x: 2.5, y: 0, z: 1.5 }, purpose: 'bypass foreground' },
  { id: 'R6_TALLER_MEASURE', position: { x: 5, y: 0, z: 1 }, purpose: 'Taller measurement' },
  { id: 'R7_DOOR_APPROACH', position: { x: 9.5, y: 0, z: 0 }, purpose: 'enter Door set' },
  { id: 'R8_DOOR_MEASURE', position: { x: 13.5, y: 0, z: -0.5 }, purpose: 'Door measurement' },
  { id: 'R9_SPRING_EDGE', position: { x: 16.5, y: 0, z: 1.5 }, purpose: 'observe spring edge' },
] as const;

export const ARCHITECTURE_SOCKETS: readonly ArchitectureSocket[] = [
  {
    id: 'S_PORTAL_TO_PLAZA',
    from: 'portal_plaza',
    to: 'portal_plaza',
    position: { x: -15, y: 0, z: 0 },
    width: 3,
  },
  {
    id: 'S_PLAZA_TO_TALLER',
    from: 'portal_plaza',
    to: 'taller',
    position: { x: -4, y: 0, z: -2.5 },
    width: 3,
  },
  {
    id: 'S_TALLER_TO_DOOR',
    from: 'taller',
    to: 'puerta_manantial',
    position: { x: 8.25, y: 0, z: 0 },
    width: 3,
  },
] as const;

export const BOX_MODULES: readonly BoxModuleDefinition[] = [
  { id: 'portal-floor', zoneId: 'portal_plaza', family: 'stone', centerX: -12.5, centerZ: 0, width: 17, height: 0.08, depth: 12, pivotY: 0, tags: ['floor'] },
  { id: 'workshop-floor', zoneId: 'taller', family: 'wood', centerX: 2, centerZ: -0.25, width: 13, height: 0.09, depth: 9.5, pivotY: 0, tags: ['floor'] },
  { id: 'door-floor', zoneId: 'puerta_manantial', family: 'stone', centerX: 14.25, centerZ: 0.25, width: 12.5, height: 0.08, depth: 10.5, pivotY: 0, tags: ['floor'] },

  { id: 'portal-pier-north', zoneId: 'portal_plaza', family: 'stone', centerX: -19, centerZ: -3, width: 1.5, height: 4.8, depth: 1.5, pivotY: 0, tags: ['structure', 'landmark'] },
  { id: 'portal-pier-south', zoneId: 'portal_plaza', family: 'stone', centerX: -19, centerZ: 3, width: 1.5, height: 4.8, depth: 1.5, pivotY: 0, tags: ['structure', 'landmark'] },
  { id: 'portal-arch', zoneId: 'portal_plaza', family: 'copper', centerX: -19, centerZ: 0, width: 1, height: 0.65, depth: 4.6, baseY: 4.15, pivotY: 0, tags: ['structure', 'landmark'] },
  { id: 'plaza-wayfinder', zoneId: 'portal_plaza', family: 'copper', centerX: -9.5, centerZ: 3.8, width: 0.8, height: 3.2, depth: 0.8, pivotY: 0, tags: ['structure'] },

  { id: 'workshop-wall-back', zoneId: 'taller', family: 'wood', centerX: 2, centerZ: -4.55, width: 12, height: 3.8, depth: 0.35, pivotY: 0, tags: ['structure'] },
  { id: 'workshop-wall-front-west', zoneId: 'taller', family: 'wood', centerX: -1.75, centerZ: 4.05, width: 4.5, height: 3.3, depth: 0.3, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'workshop-wall-front-east', zoneId: 'taller', family: 'wood', centerX: 6.25, centerZ: 4.05, width: 3.5, height: 3.3, depth: 0.3, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'workshop-roof-low', zoneId: 'taller', family: 'wood', centerX: 0, centerZ: -1.2, width: 5.8, height: 0.35, depth: 6.4, baseY: 3.3, pivotY: 0, tags: ['structure', 'landmark', 'cameraRoof'] },
  { id: 'workshop-roof-high', zoneId: 'taller', family: 'wood', centerX: 5.2, centerZ: -1.2, width: 4.4, height: 0.35, depth: 6.4, baseY: 4.15, pivotY: 0, tags: ['structure', 'landmark', 'cameraRoof'] },
  { id: 'workshop-bench', zoneId: 'taller', family: 'wood', centerX: 4.8, centerZ: -2.5, width: 2.4, height: 0.9, depth: 0.9, pivotY: 0, tags: ['structure'] },
  { id: 'workshop-lantern-emitter', zoneId: 'taller', family: 'glass', centerX: 3.2, centerZ: -3.9, width: 0.3, height: 0.35, depth: 0.3, baseY: 2.55, pivotY: 0, tags: ['emitter'] },

  { id: 'door-pier-north', zoneId: 'puerta_manantial', family: 'stone', centerX: 13, centerZ: -3, width: 1.4, height: 5.2, depth: 1.4, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'door-pier-south', zoneId: 'puerta_manantial', family: 'stone', centerX: 13, centerZ: 3, width: 1.4, height: 5.2, depth: 1.4, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'ohm-door-frame', zoneId: 'puerta_manantial', family: 'copper', centerX: 13, centerZ: 0, width: 0.9, height: 0.75, depth: 4.8, baseY: 4.45, pivotY: 0, tags: ['structure', 'landmark'] },
  { id: 'door-conduit-emitter', zoneId: 'puerta_manantial', family: 'glass', centerX: 13.1, centerZ: 0, width: 0.25, height: 0.4, depth: 0.25, baseY: 4.65, pivotY: 0, tags: ['emitter'] },
  { id: 'spring-basin', zoneId: 'puerta_manantial', family: 'water', centerX: 18, centerZ: 1.5, width: 3, height: 0.25, depth: 3, pivotY: 0, tags: ['structure'] },
] as const;

export const COLLIDERS: readonly ColliderDefinition[] = [
  { id: 'C_PORTAL_NORTH', zoneId: 'portal_plaza', bounds: { minX: -19.75, maxX: -18.25, minZ: -3.75, maxZ: -2.25 }, height: 4.8, planeY: 0 },
  { id: 'C_PORTAL_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -19.75, maxX: -18.25, minZ: 2.25, maxZ: 3.75 }, height: 4.8, planeY: 0 },
  { id: 'C_WALL_BACK', zoneId: 'taller', bounds: { minX: -4, maxX: 8, minZ: -4.75, maxZ: -4.35 }, height: 3.8, planeY: 0 },
  { id: 'C_WALL_FRONT_WEST', zoneId: 'taller', bounds: { minX: -4, maxX: 0.5, minZ: 3.85, maxZ: 4.25 }, height: 3.3, planeY: 0 },
  { id: 'C_WALL_FRONT_EAST', zoneId: 'taller', bounds: { minX: 4.5, maxX: 8, minZ: 3.85, maxZ: 4.25 }, height: 3.3, planeY: 0 },
  { id: 'C_WORKBENCH', zoneId: 'taller', bounds: { minX: 3.6, maxX: 6, minZ: -2.95, maxZ: -2.05 }, height: 0.9, planeY: 0 },
  { id: 'C_DOOR_NORTH', zoneId: 'puerta_manantial', bounds: { minX: 12.3, maxX: 13.7, minZ: -3.7, maxZ: -2.3 }, height: 5.2, planeY: 0 },
  { id: 'C_DOOR_SOUTH', zoneId: 'puerta_manantial', bounds: { minX: 12.3, maxX: 13.7, minZ: 2.3, maxZ: 3.7 }, height: 5.2, planeY: 0 },
  { id: 'C_SPRING_BASIN', zoneId: 'puerta_manantial', bounds: { minX: 17.35, maxX: 19.5, minZ: 0, maxZ: 3 }, height: 0.25, planeY: 0 },
] as const;

export function routeAnchor(id: RouteAnchorId): RouteAnchor {
  const anchor = ROUTE_ANCHORS.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown route anchor: ${id}`);
  return anchor;
}
