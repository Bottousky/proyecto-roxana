import * as pc from 'playcanvas';

/** Materials already authored for the Arc I Faro. No material is created here. */
export interface LighthouseInfrastructurePolishMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  copper: pc.StandardMaterial;
  brass: pc.StandardMaterial;
}

export type LighthouseInfrastructureEndpointId =
  | 'lighthouse_bus'
  | 'lighthouse_reference'
  | 'lighthouse_beacon';

/**
 * The probe positions remain the source of truth in buildArc1Greybox.ts. These
 * local coordinates are exported so a visual review can trace every support
 * back to the existing electrical endpoint without moving a probe or collider.
 */
export const LIGHTHOUSE_INFRASTRUCTURE_ENDPOINTS: Readonly<Record<
  LighthouseInfrastructureEndpointId,
  readonly [number, number, number]
>> = {
  lighthouse_bus: [0, 1.1, -8],
  lighthouse_reference: [0, 1.2, 0],
  lighthouse_beacon: [0, 1.25, 8],
};

type Vec3Tuple = readonly [number, number, number];

interface SourceAdjustment {
  name: string;
  position: Vec3Tuple;
  scale: Vec3Tuple;
  angles: Vec3Tuple;
}

const SOURCE_ADJUSTMENTS: readonly SourceAdjustment[] = [
  // This route keeps the original [-4, -9] -> [-4, 8] endpoints and heading;
  // only the rectangular section is reduced so it reads as a conductor.
  {
    name: 'LighthouseTransmissionBus',
    position: [-4, 5.25, -0.5],
    scale: [17, 0.085, 0.12],
    angles: [0, 90, 0],
  },
  {
    name: 'LighthouseTransmissionFeed',
    position: [-2.5, 5.25, 8],
    scale: [3, 0.085, 0.12],
    angles: [0, 0, 0],
  },
  // These are support hardware, not circuit segments. The parapet no longer
  // reaches their height; use short crossarms on grounded masts instead of
  // unsupported beams across the lake-facing composition.
  ...([-8, -4, 4, 8] as const).map((z, index): SourceAdjustment => ({
    name: `LighthouseWallBracket${index}`,
    position: [-4.25, 3.9, z],
    scale: [1.1, 0.085, 0.11],
    angles: [0, 0, 0],
  })),
];

interface SupportStation {
  z: number;
  endpoint?: LighthouseInfrastructureEndpointId;
}

const SUPPORT_STATIONS: readonly SupportStation[] = [
  { z: -8, endpoint: 'lighthouse_bus' },
  { z: -4 },
  { z: 4 },
  { z: 8, endpoint: 'lighthouse_beacon' },
];

function addPrimitive(
  parent: pc.Entity,
  name: string,
  type: 'box' | 'cylinder',
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  scale: Vec3Tuple,
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material });
  entity.render!.castShadows = false;
  entity.render!.receiveShadows = true;
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalScale(scale[0], scale[1], scale[2]);
  parent.addChild(entity);
  return entity;
}

function tagSourceBound(entity: pc.Entity, endpoint?: LighthouseInfrastructureEndpointId): void {
  entity.tags.add('ohmdal-lighthouse-infrastructure');
  entity.tags.add('source-bound');
  entity.tags.add(`source:${endpoint ?? 'transmission-route'}`);
}

/**
 * Construction-time geometry, called once before the authored-detail batch.
 * The world owns these entities for its entire lifetime; parent activation and
 * app.destroy provide lifecycle. There are no callbacks or independent state.
 * Electrical routes retain names, centerlines, materials and enabled state.
 */
export function createLighthouseInfrastructurePolish(
  lighthouseRoot: pc.Entity,
  materials: LighthouseInfrastructurePolishMaterials,
): pc.Entity {
  const sourceRoot = lighthouseRoot.findByName('LighthouseAuthoredDetailsRoot') as pc.Entity | null;
  const polishRoot = new pc.Entity('LighthouseInfrastructurePolishRoot');
  polishRoot.tags.add('ohmdal-lighthouse-infrastructure');
  polishRoot.tags.add('semantic-prop');
  // Keeping this root below the authored-detail switch means later visual
  // integrations naturally gate the supports with their source visuals.
  (sourceRoot ?? lighthouseRoot).addChild(polishRoot);

  for (const adjustment of SOURCE_ADJUSTMENTS) {
    const entity = lighthouseRoot.findByName(adjustment.name) as pc.Entity | null;
    if (!entity || !entity.render) continue;
    entity.setLocalPosition(adjustment.position[0], adjustment.position[1], adjustment.position[2]);
    entity.setLocalScale(adjustment.scale[0], adjustment.scale[1], adjustment.scale[2]);
    entity.setLocalEulerAngles(adjustment.angles[0], adjustment.angles[1], adjustment.angles[2]);
  }

  // Small vertical posts and caps make the existing high route read as
  // supported hardware. Four stations match the existing standoff hardware;
  // the two endpoint tags below preserve the probe trace without moving it.
  for (const stationSpec of SUPPORT_STATIONS) {
    const stationId = stationSpec.endpoint ?? `route-z${stationSpec.z}`;
    const station = new pc.Entity(`LighthouseInfrastructureSupport_${stationId}`);
    tagSourceBound(station, stationSpec.endpoint);
    polishRoot.addChild(station);

    // The wall is now a low parapet, so the old y=3.9 cantilever alone has
    // no load path. Ground its outer end; existing risers continue to the
    // ceramic prisms, whose bottom/top are 4.45/5.17 (not centered bounds).
    addPrimitive(station, `${station.name}_Foot`, 'box', materials.stoneDark, [-4, 0.2, stationSpec.z], [0.48, 0.24, 0.48]);
    addPrimitive(station, `${station.name}_Mast`, 'cylinder', materials.stoneDark, [-4, 2.05, stationSpec.z], [0.16, 3.86, 0.16]);
    addPrimitive(station, `${station.name}_Clamp`, 'box', materials.brass, [-4, 5.19, stationSpec.z], [0.3, 0.1, 0.28]);
  }

  // Do not copy sourceRoot.enabled here: its getter includes the initially
  // inactive zone. Keep local enabled=true and inherit the parent naturally.
  return polishRoot;
}
