export type OhmdalNavigationZone =
  | 'plaza'
  | 'workshop'
  | 'manantial'
  | 'castle'
  | 'forge-terraces'
  | 'lighthouse';

export type OhmdalNavigationKind = 'solid' | 'trigger' | 'portal';

export interface NavigationBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface NavigationSolid extends NavigationBounds {
  id: string;
  zone: OhmdalNavigationZone;
  kind: 'solid';
  enabled: boolean;
  sharedZones: OhmdalNavigationZone[];
  source: string;
}

export interface NavigationPortal {
  id: string;
  zone: OhmdalNavigationZone | 'portal';
  kind: 'portal';
  to: OhmdalNavigationZone;
  position: readonly [number, number, number];
  directionIntoZone: readonly [number, number, number];
  open: boolean;
  source: string;
}

export interface CollisionDiagnostic {
  activeZones: OhmdalNavigationZone[];
  playerRadius: number;
  solids: NavigationSolid[];
  portals: NavigationPortal[];
}

const DEFAULT_PLAYER_RADIUS = 0.4;

function overlapsPoint(bounds: NavigationBounds, x: number, z: number, radius: number): boolean {
  return x > bounds.minX - radius
    && x < bounds.maxX + radius
    && z > bounds.minZ - radius
    && z < bounds.maxZ + radius;
}

/**
 * Lightweight, deterministic navigation authority for the Engine runtime.
 * Geometry remains authored by each zone builder, while this registry owns
 * whether that geometry participates in normal movement.
 */
export class OhmdalNavigationRegistry {
  private readonly activeZones = new Set<OhmdalNavigationZone>();
  private readonly solidsById = new Map<string, NavigationSolid>();
  private readonly portalsById = new Map<string, NavigationPortal>();

  setZoneActive(zone: OhmdalNavigationZone, active: boolean): void {
    if (active) this.activeZones.add(zone);
    else this.activeZones.delete(zone);
  }

  registerSolid({
    id,
    zone,
    x,
    z,
    width,
    depth,
    source = id,
    enabled = true,
    sharedZones = [],
  }: {
    id: string;
    zone: OhmdalNavigationZone;
    x: number;
    z: number;
    width: number;
    depth: number;
    source?: string;
    enabled?: boolean;
    sharedZones?: OhmdalNavigationZone[];
  }): NavigationSolid {
    if (this.solidsById.has(id)) throw new Error(`Duplicate Ohmdal solid: ${id}`);
    const solid: NavigationSolid = {
      id,
      zone,
      kind: 'solid',
      enabled,
      sharedZones: [...sharedZones],
      source,
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2,
    };
    this.solidsById.set(id, solid);
    return solid;
  }

  registerPortal({
    id,
    zone,
    to,
    position,
    directionIntoZone,
    open = true,
    source = id,
  }: {
    id: string;
    zone: OhmdalNavigationZone | 'portal';
    to: OhmdalNavigationZone;
    position: readonly [number, number, number];
    directionIntoZone: readonly [number, number, number];
    open?: boolean;
    source?: string;
  }): NavigationPortal {
    if (this.portalsById.has(id)) throw new Error(`Duplicate Ohmdal portal: ${id}`);
    const portal: NavigationPortal = {
      id,
      zone,
      kind: 'portal',
      to,
      position: [...position] as [number, number, number],
      directionIntoZone: [...directionIntoZone] as [number, number, number],
      open,
      source,
    };
    this.portalsById.set(id, portal);
    return portal;
  }

  setSolidEnabled(id: string, enabled: boolean): void {
    const solid = this.solidsById.get(id);
    if (!solid) throw new Error(`Unknown Ohmdal solid: ${id}`);
    solid.enabled = enabled;
  }

  setPortalOpen(id: string, open: boolean): void {
    const portal = this.portalsById.get(id);
    if (!portal) throw new Error(`Unknown Ohmdal portal: ${id}`);
    portal.open = open;
  }

  collides(x: number, z: number, radius = DEFAULT_PLAYER_RADIUS): boolean {
    return this.activeSolids().some((solid) => overlapsPoint(solid, x, z, radius));
  }

  isSpawnSafe(position: readonly [number, number, number], radius = DEFAULT_PLAYER_RADIUS): boolean {
    // Spawn validation is stricter than normal movement: a destination must
    // not be inside an enabled solid even while that zone is inactive.
    return ![...this.solidsById.values()]
      .some((solid) => solid.enabled && overlapsPoint(solid, position[0], position[2], radius));
  }

  activeSolids(): NavigationSolid[] {
    return [...this.solidsById.values()].filter((solid) => {
      if (!solid.enabled) return false;
      return this.activeZones.has(solid.zone)
        || solid.sharedZones.some((zone) => this.activeZones.has(zone));
    });
  }

  diagnostics(playerRadius = DEFAULT_PLAYER_RADIUS): CollisionDiagnostic {
    return {
      activeZones: [...this.activeZones],
      playerRadius,
      solids: this.activeSolids().map((solid) => ({ ...solid, sharedZones: [...solid.sharedZones] })),
      portals: [...this.portalsById.values()].map((portal) => ({
        ...portal,
        position: [...portal.position] as [number, number, number],
        directionIntoZone: [...portal.directionIntoZone] as [number, number, number],
      })),
    };
  }
}
