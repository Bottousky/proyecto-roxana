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
  readonly rotationX?: number;
  readonly rotationY?: number;
  readonly rotationZ?: number;
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
    landmarkId: 'PLAZA_PORTAL_GATE',
  },
  {
    id: 'taller',
    purpose: 'diagnosis-workspace',
    bounds: { minX: -4.5, maxX: 8.5, minZ: -5, maxZ: 4.5 },
    landmarkId: 'TALLER_KIT',
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
  // La entrada a la Plaza se corrió a z = −3,2. Con la Plaza construida, el eje z = 0 lo
  // ocupan el pedestal de Ohm y el monumento de la campana: el anclaje caía adentro de la
  // piedra. Entrar bordeando también compone mejor —los dos monumentos se ven de costado en
  // vez de venírsele encima al jugador— y encadena con R2, que ya leía la Plaza en diagonal.
  // SCENE_INVENTORY §4.2 obliga a volver a medir `route-timing.json` por este cambio.
  { id: 'R1_PLAZA_ENTRY', position: { x: -13, y: 0, z: -3.2 }, purpose: 'enter Plaza' },
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
  // Ni la Plaza ni el Taller declaran modulos: los construyen `plazaKit` y `tallerKit` con
  // geometria fusionada, pintada y texturada. Dejar aca las cajas de prueba seria dato muerto,
  // y los tests las leerian como si dibujaran algo. Del Taller sobrevive solo el emisor de la
  // linterna, que es lo que el rig de luz busca por nombre para colgarle su point light.
  { id: 'door-floor', zoneId: 'puerta_manantial', family: 'stone', centerX: 14.25, centerZ: 0.25, width: 12.5, height: 0.08, depth: 10.5, pivotY: 0, tags: ['floor'] },


  { id: 'workshop-lantern-emitter', zoneId: 'taller', family: 'glass', centerX: 3.2, centerZ: -3.9, width: 0.3, height: 0.35, depth: 0.3, baseY: 2.55, pivotY: 0, tags: ['emitter'] },

  { id: 'door-pier-north', zoneId: 'puerta_manantial', family: 'stone', centerX: 13, centerZ: -3, width: 0.9, height: 4.8, depth: 0.9, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'door-pier-south', zoneId: 'puerta_manantial', family: 'stone', centerX: 13, centerZ: 4.5, width: 0.9, height: 3.2, depth: 0.9, pivotY: 0, tags: ['structure', 'cameraOccluder'] },
  { id: 'ohm-door-frame', zoneId: 'puerta_manantial', family: 'copper', centerX: 15, centerZ: -3, width: 4.2, height: 0.55, depth: 0.65, baseY: 4.25, pivotY: 0, tags: ['structure', 'landmark'] },
  { id: 'door-conduit-emitter', zoneId: 'puerta_manantial', family: 'glass', centerX: 16.7, centerZ: -3, width: 0.25, height: 0.4, depth: 0.25, baseY: 4.3, pivotY: 0, tags: ['emitter'] },
  { id: 'spring-basin', zoneId: 'puerta_manantial', family: 'water', centerX: 18, centerZ: 1.5, width: 3, height: 0.25, depth: 3, pivotY: 0, tags: ['structure'] },
] as const;

// Los colliders de la Plaza siguen a la geometría que construye `plazaKit`. Los del blockout
// viejo quedaron un tiempo como muros invisibles en medio de la nada: nadie los ve, y el
// jugador choca contra piezas que ya no existen.
export const COLLIDERS: readonly ColliderDefinition[] = [
  { id: 'C_PORTAL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: -21.15, maxX: -19.65, minZ: -3.15, maxZ: -1.65 }, height: 5.2, planeY: 0 },
  { id: 'C_PORTAL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -21.15, maxX: -19.65, minZ: 1.65, maxZ: 3.15 }, height: 5.2, planeY: 0 },
  // Del monumento frenan los machones, no el basamento: los dos escalones miden 22 cm y se
  // pisan. Del pedestal frena de la segunda grada para arriba, por lo mismo. Bloquear la
  // huella entera cerraba el eje de la Plaza y dejaba la ruta canonica sin paso.
  { id: 'C_BELL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: -11.13, maxX: -10.08, minZ: -2.28, maxZ: -1.23 }, height: 5.1, planeY: 0 },
  { id: 'C_BELL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -11.13, maxX: -10.08, minZ: 1.23, maxZ: 2.28 }, height: 5.1, planeY: 0 },
  { id: 'C_OHM_PEDESTAL', zoneId: 'portal_plaza', bounds: { minX: -14.78, maxX: -12.22, minZ: -1.28, maxZ: 1.28 }, height: 1.06, planeY: 0 },
  { id: 'C_TALLER_BACK', zoneId: 'taller', bounds: { minX: -4.6, maxX: 8.6, minZ: -5.2, maxZ: -4.5 }, height: 2.8, planeY: 0 },
  // El muro este se abre en el medio: por ahi sale el socket S_TALLER_TO_DOOR hacia la Puerta.
  { id: 'C_TALLER_EAST_NORTH', zoneId: 'taller', bounds: { minX: 8.25, maxX: 8.6, minZ: -5.2, maxZ: -1.7 }, height: 2.8, planeY: 0 },
  { id: 'C_TALLER_EAST_SOUTH', zoneId: 'taller', bounds: { minX: 8.25, maxX: 8.6, minZ: 1.7, maxZ: 4.7 }, height: 2.8, planeY: 0 },
  { id: 'C_WORKBENCH', zoneId: 'taller', bounds: { minX: 3.5, maxX: 6.1, minZ: -3.03, maxZ: -1.97 }, height: 1, planeY: 0 },
  { id: 'C_DOOR_NORTH', zoneId: 'puerta_manantial', bounds: { minX: 12.55, maxX: 13.45, minZ: -3.45, maxZ: -2.55 }, height: 4.8, planeY: 0 },
  { id: 'C_DOOR_SOUTH', zoneId: 'puerta_manantial', bounds: { minX: 12.55, maxX: 13.45, minZ: 4.05, maxZ: 4.95 }, height: 3.2, planeY: 0 },
  { id: 'C_SPRING_BASIN', zoneId: 'puerta_manantial', bounds: { minX: 17.35, maxX: 19.5, minZ: 0, maxZ: 3 }, height: 0.25, planeY: 0 },
] as const;

export function routeAnchor(id: RouteAnchorId): RouteAnchor {
  const anchor = ROUTE_ANCHORS.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown route anchor: ${id}`);
  return anchor;
}
