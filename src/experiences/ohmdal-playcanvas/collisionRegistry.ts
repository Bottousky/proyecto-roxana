export type ZoneId =
  | 'plaza'
  | 'workshop'
  | 'manantial'
  | 'castle'
  | 'forge-terraces'
  | 'lighthouse';

export type CollisionKind = 'solid' | 'trigger' | 'portal';

export interface BoxCollider {
  id: string;
  zone: ZoneId;
  kind: CollisionKind;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  solid: boolean;
  enabled: boolean;
}

export interface AddColliderOptions {
  id?: string;
  zone: ZoneId;
  kind?: CollisionKind;
  solid?: boolean;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CollisionDiagnostics {
  totalColliders: number;
  activeZones: ZoneId[];
  activeSolidsCount: number;
  collidersByZone: Record<ZoneId, number>;
}

export class CollisionRegistry {
  private colliders: BoxCollider[] = [];

  public clear(): void {
    this.colliders = [];
  }

  public addCollider(options: AddColliderOptions): BoxCollider {
    const collider: BoxCollider = {
      id: options.id ?? `col_${options.zone}_${this.colliders.length + 1}`,
      zone: options.zone,
      kind: options.kind ?? 'solid',
      minX: Math.min(options.minX, options.maxX),
      maxX: Math.max(options.minX, options.maxX),
      minZ: Math.min(options.minZ, options.maxZ),
      maxZ: Math.max(options.minZ, options.maxZ),
      solid: options.solid ?? true,
      enabled: true,
    };
    this.colliders.push(collider);
    return collider;
  }

  public addSolidAABB(
    zone: ZoneId,
    centerX: number,
    centerZ: number,
    widthX: number,
    depthZ: number,
    id?: string,
  ): BoxCollider {
    return this.addCollider({
      id,
      zone,
      kind: 'solid',
      solid: true,
      minX: centerX - widthX / 2,
      maxX: centerX + widthX / 2,
      minZ: centerZ - depthZ / 2,
      maxZ: centerZ + depthZ / 2,
    });
  }

  public getColliders(zone?: ZoneId): readonly BoxCollider[] {
    if (!zone) return this.colliders;
    return this.colliders.filter((c) => c.zone === zone);
  }

  public getActiveSolids(activeZones: readonly ZoneId[]): readonly BoxCollider[] {
    const zoneSet = new Set(activeZones);
    return this.colliders.filter((c) => c.enabled && c.solid && zoneSet.has(c.zone));
  }

  public isBlocked(
    x: number,
    z: number,
    activeZones: readonly ZoneId[],
    radius = 0.4,
    gateOpenPredicate?: (x: number, z: number) => boolean,
  ): boolean {
    if (gateOpenPredicate && gateOpenPredicate(x, z)) {
      return false;
    }
    const zoneSet = new Set(activeZones);
    for (const c of this.colliders) {
      if (!c.enabled || !c.solid || !zoneSet.has(c.zone)) continue;
      if (
        x > c.minX - radius &&
        x < c.maxX + radius &&
        z > c.minZ - radius &&
        z < c.maxZ + radius
      ) {
        return true;
      }
    }
    return false;
  }

  public getDiagnostics(activeZones: readonly ZoneId[]): CollisionDiagnostics {
    const collidersByZone: Record<ZoneId, number> = {
      plaza: 0,
      workshop: 0,
      manantial: 0,
      castle: 0,
      'forge-terraces': 0,
      lighthouse: 0,
    };
    for (const c of this.colliders) {
      collidersByZone[c.zone] = (collidersByZone[c.zone] ?? 0) + 1;
    }
    const activeSolids = this.getActiveSolids(activeZones);
    return {
      totalColliders: this.colliders.length,
      activeZones: [...activeZones],
      activeSolidsCount: activeSolids.length,
      collidersByZone,
    };
  }
}
