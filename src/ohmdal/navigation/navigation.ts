import {
  ARCHITECTURE_SOCKETS,
  COLLIDERS,
  GAMEPLAY_PLANE_Y,
  LEVEL_SEED,
  LEVEL_ZONES,
  ROUTE_ANCHORS,
  type MetricBounds2,
  type MetricPoint,
  type RouteAnchorId,
  type ZoneId,
} from '../architecture/levelData.ts';

export const PLAYER_COLLIDER_RADIUS = 0.4;
export const ROUTE_SPEED_METERS_PER_SECOND = 2;
export const FIXED_STEP_SECONDS = 1 / 60;
export const PLANE_TOLERANCE = 0.001;

export interface NavigationRegion {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly bounds: MetricBounds2;
  readonly planeY: typeof GAMEPLAY_PLANE_Y;
}

export const NAVIGATION_REGIONS: readonly NavigationRegion[] = LEVEL_ZONES.map((zone) => ({
  id: `NAV_${zone.id.toUpperCase()}`,
  zoneId: zone.id,
  bounds: zone.bounds,
  planeY: GAMEPLAY_PLANE_Y,
}));

export interface RouteAction {
  readonly at: RouteAnchorId;
  readonly action: 'wait' | 'walk' | 'turn' | 'interact' | 'restore';
  readonly value: number | string;
}

export const CANONICAL_ROUTE_ACTIONS: readonly RouteAction[] = [
  { at: 'R0_PORTAL_SPAWN', action: 'wait', value: 1.5 },
  { at: 'R1_PLAZA_ENTRY', action: 'walk', value: ROUTE_SPEED_METERS_PER_SECOND },
  { at: 'R2_PLAZA_DIAGONAL', action: 'turn', value: 135 },
  { at: 'R4_LUMEN_STOP', action: 'wait', value: 1 },
  { at: 'R4_LUMEN_STOP', action: 'interact', value: 'taller-measure' },
  { at: 'R6_DOOR_MEASURE', action: 'interact', value: 'door-measure' },
  { at: 'R6_DOOR_MEASURE', action: 'restore', value: 'mechanism-on' },
  { at: 'R7_SPRING_EDGE', action: 'wait', value: 2 },
] as const;

function contains(bounds: MetricBounds2, point: MetricPoint, inset = 0): boolean {
  return point.x >= bounds.minX + inset
    && point.x <= bounds.maxX - inset
    && point.z >= bounds.minZ + inset
    && point.z <= bounds.maxZ - inset;
}

function intersectsExpandedCollider(point: MetricPoint, radius: number): boolean {
  return COLLIDERS.some((collider) => (
    point.x > collider.bounds.minX - radius
    && point.x < collider.bounds.maxX + radius
    && point.z > collider.bounds.minZ - radius
    && point.z < collider.bounds.maxZ + radius
  ));
}

export function isOnGameplayPlane(point: MetricPoint): boolean {
  return Math.abs(point.y - GAMEPLAY_PLANE_Y) <= PLANE_TOLERANCE;
}

export function isNavigable(point: MetricPoint, radius = PLAYER_COLLIDER_RADIUS): boolean {
  if (!isOnGameplayPlane(point)) return false;
  // Las regiones se solapan en sockets: no se les aplica inset individual porque
  // abriria una costura artificial entre dos modulos transitables contiguos.
  const insideRegion = NAVIGATION_REGIONS.some((region) => contains(region.bounds, point));
  return insideRegion && !intersectsExpandedCollider(point, radius);
}

export interface MoveIntent {
  readonly x: number;
  readonly z: number;
}

/** Movimiento plano con normalizacion diagonal y resolucion por eje para permitir deslizamiento. */
export function moveOnGameplayPlane(
  position: MetricPoint,
  input: MoveIntent,
  dtSeconds: number,
  speed = ROUTE_SPEED_METERS_PER_SECOND,
): MetricPoint {
  const length = Math.hypot(input.x, input.z);
  if (length === 0 || dtSeconds <= 0) return { ...position, y: GAMEPLAY_PLANE_Y };
  const dt = Math.min(dtSeconds, 0.05);
  const scale = speed * dt / Math.max(1, length);
  const nextX = { x: position.x + input.x * scale, y: GAMEPLAY_PLANE_Y, z: position.z };
  const afterX = isNavigable(nextX) ? nextX : { ...position, y: GAMEPLAY_PLANE_Y };
  const nextZ = { x: afterX.x, y: GAMEPLAY_PLANE_Y, z: afterX.z + input.z * scale };
  return isNavigable(nextZ) ? nextZ : afterX;
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function canonicalRouteHash(): string {
  const payload = JSON.stringify({
    seed: LEVEL_SEED,
    step: FIXED_STEP_SECONDS,
    anchors: ROUTE_ANCHORS.map(({ id, position }) => ({ id, position })),
    actions: CANONICAL_ROUTE_ACTIONS,
  });
  return stableHash(payload);
}

function segmentIsNavigable(start: MetricPoint, end: MetricPoint): boolean {
  const distance = Math.hypot(end.x - start.x, end.z - start.z);
  const samples = Math.max(1, Math.ceil(distance / 0.2));
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    if (!isNavigable({
      x: start.x + (end.x - start.x) * t,
      y: GAMEPLAY_PLANE_Y,
      z: start.z + (end.z - start.z) * t,
    })) return false;
  }
  return true;
}

/** Errores de contrato; una lista vacia es el gate de navegacion plana. */
export function validateNavigation(): string[] {
  const issues: string[] = [];
  const anchorIds = new Set<string>();
  for (const anchor of ROUTE_ANCHORS) {
    if (anchorIds.has(anchor.id)) issues.push(`duplicate anchor ${anchor.id}`);
    anchorIds.add(anchor.id);
    if (!isOnGameplayPlane(anchor.position)) issues.push(`${anchor.id} is off plane`);
    if (!isNavigable(anchor.position)) issues.push(`${anchor.id} is not navigable`);
  }
  for (let index = 1; index < ROUTE_ANCHORS.length; index += 1) {
    if (!segmentIsNavigable(ROUTE_ANCHORS[index - 1].position, ROUTE_ANCHORS[index].position)) {
      issues.push(`route blocked between ${ROUTE_ANCHORS[index - 1].id} and ${ROUTE_ANCHORS[index].id}`);
    }
  }
  for (const socket of ARCHITECTURE_SOCKETS) {
    if (!isOnGameplayPlane(socket.position)) issues.push(`${socket.id} is off plane`);
    if (!NAVIGATION_REGIONS.some((region) => contains(region.bounds, socket.position))) {
      issues.push(`${socket.id} is outside navigation`);
    }
  }
  return issues;
}
