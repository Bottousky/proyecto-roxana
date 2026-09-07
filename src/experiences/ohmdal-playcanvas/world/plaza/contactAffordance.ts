import * as pc from 'playcanvas';

/** World-space centre of the authored return contact in the accepted Plaza. */
export const CONTACT_AFFORDANCE_CENTER = [-0.9, 0.07, -6.1] as const;

/** Physical contract used by the visual affordance and its CPU checks. */
export const CONTACT_AFFORDANCE_FOOTPRINT = Object.freeze({
  width: 0.7,
  depth: 1.0,
  maxHeight: 0.2,
});

/** Irregular shallow deposits, rather than a solid plate resembling a switch. */
export function createContactResidueGeometry(app: pc.Application): pc.Mesh {
  const positions: number[] = [], indices: number[] = [], colors: number[] = [];
  for (let patch = 0; patch < 12; patch += 1) {
    const cx = Math.sin(patch * 2.4) * 0.27;
    const cz = Math.cos(patch * 1.7) * 0.27;
    const radius = 0.13 + (patch % 3) * 0.025;
    const start = positions.length / 3;
    positions.push(cx, 0.1 + (patch % 4) * 0.09, cz);
    const color = patch % 3 === 0 ? [0.55, 0.66, 0.42, 1] : [0.82, 0.9, 0.68, 1];
    colors.push(...color);
    for (let edge = 0; edge <= 8; edge += 1) {
      const angle = edge * Math.PI / 4;
      positions.push(cx + Math.cos(angle) * radius, -0.3 + Math.sin(edge * 3 + patch) * 0.08, cz + Math.sin(angle) * radius);
      colors.push(...color);
      if (edge < 8) indices.push(start, start + edge + 2, start + edge + 1);
    }
  }
  const geometry = new pc.Geometry();
  geometry.positions = positions;
  geometry.indices = indices;
  geometry.normals = pc.calculateNormals(positions, indices);
  geometry.colors = colors;
  return pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
}

/**
 * Materials are owned by the Plaza world. This module only composes small
 * render entities and never mutates a shared material or the circuit source.
 */
export interface ContactAffordanceMaterials {
  copper: pc.StandardMaterial;
  ceramic: pc.StandardMaterial;
  metal: pc.StandardMaterial;
}

export interface ContactAffordanceOptions {
  parent: pc.Entity;
  materials: ContactAffordanceMaterials;
  /** The existing green residue; it remains separate and is hidden by runtime state. */
  corrosionMesh: pc.Entity;
  center?: readonly [number, number, number];
}

export interface ContactAffordanceHandle {
  root: pc.Entity;
  residue: pc.Entity;
  center: readonly [number, number, number];
  dispose(): void;
}

type PrimitiveType = 'box' | 'cylinder';
type Vec3Tuple = readonly [number, number, number];

function addPrimitive(
  parent: pc.Entity,
  name: string,
  type: PrimitiveType,
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

/**
 * Builds the low terminal around the existing residue. It is visual-only:
 * there is intentionally no collider, rigid body, or interaction callback.
 * The parent owns the returned root for the lifetime of the Plaza world.
 */
export function createContactAffordance({
  parent,
  materials,
  corrosionMesh,
  center = CONTACT_AFFORDANCE_CENTER,
}: ContactAffordanceOptions): ContactAffordanceHandle {
  const root = new pc.Entity('SulfatedContactTerminal');
  root.tags.add('ohmdal-contact-affordance');
  root.tags.add('semantic-prop');
  root.tags.add('no-collider');
  parent.addChild(root);
  root.setPosition(center[0], center[1], center[2]);

  // A shallow ceramic carrier and metal face make the small service point
  // legible without raising it into a new obstacle.
  addPrimitive(root, 'SulfatedContactCeramicBase', 'box', materials.ceramic, [0, -0.018, 0], [0.7, 0.06, 1.0]);
  addPrimitive(root, 'SulfatedContactMetalPlate', 'box', materials.metal, [0, 0.022, 0], [0.58, 0.028, 0.82]);

  // The two clean copper strips meet at the centre and continue along the
  // existing north/south return conductor. They stay on the face of the
  // plate, so the footprint remains about 0.7 x 1 m.
  addPrimitive(root, 'SulfatedContactCopperStripNorth', 'box', materials.copper, [0, 0.049, 0.2], [0.08, 0.018, 0.4]);
  addPrimitive(root, 'SulfatedContactCopperStripSouth', 'box', materials.copper, [0, 0.049, -0.2], [0.08, 0.018, 0.4]);

  // Two low copper shoes/bolts give the junction a readable mechanical
  // contact pattern without adding a second glowing signal.
  addPrimitive(root, 'SulfatedContactCopperShoeNorth', 'cylinder', materials.copper, [0, 0.07, 0.23], [0.07, 0.06, 0.07]);
  addPrimitive(root, 'SulfatedContactCopperShoeSouth', 'cylinder', materials.copper, [0, 0.07, -0.23], [0.07, 0.06, 0.07]);

  // Keep the patina as the world-owned residue. Cleaning can disable this
  // exact entity without hiding the physical terminal underneath it.
  corrosionMesh.tags.add('ohmdal-contact-residue');

  let disposed = false;
  return {
    root,
    residue: corrosionMesh,
    center,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      root.destroy();
    },
  };
}
