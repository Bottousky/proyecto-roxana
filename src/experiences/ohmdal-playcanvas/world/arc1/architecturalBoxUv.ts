import * as pc from 'playcanvas';

/**
 * A metre-based UV scale keeps large authored stone surfaces readable without
 * changing their gameplay transforms.  The value is deliberately exported so
 * the pure mapping used by the runtime can be checked without a graphics
 * device.
 */
export const ARCHITECTURAL_BOX_UV_METRES = 0.3;

export type BoxDimensions = readonly [number, number, number];
export type BoxPosition = readonly [number, number, number];
export type BoxNormal = readonly [number, number, number];

/**
 * Projects one unit-box vertex onto the dominant face plane.
 *
 * `position` is in unit-box local coordinates (the PlayCanvas primitive spans
 * -0.5..0.5), while `dimensions` is the entity's final local scale in metres.
 * The result therefore changes one UV unit every 1 / `metresPerUv` metres on
 * the selected face.  The projection is independent of face winding, which
 * keeps the mapping valid for both sides of the box.
 */
export function architecturalBoxUvForVertex(
  position: BoxPosition,
  normal: BoxNormal,
  dimensions: BoxDimensions,
  metresPerUv = ARCHITECTURAL_BOX_UV_METRES,
): readonly [number, number] {
  const [x, y, z] = position;
  const [width, height, depth] = dimensions;
  const [nx, ny, nz] = normal;
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);
  const uScale = Math.abs(metresPerUv);

  if (ax >= ay && ax >= az) return [z * depth * uScale, y * height * uScale];
  if (ay >= az) return [x * width * uScale, z * depth * uScale];
  return [x * width * uScale, y * height * uScale];
}

const STATIC_BOX_NAME = /Wall|Floor|Ceiling|Path|Walkway|Pillar|Quay|Step|Plinth/i;
const STATEFUL_OR_NON_ARCHITECTURAL_NAME =
  /Water|Channel|Panel|Face|Knob|Trip|Return|Bus|Branch|Load|Lamp|Signal|Light(?:[0-9]|$)|Plant|Bench|Door|Window|Hatch|Pole|Rail|Terminal|Insulator|Conductor/i;

export function isArchitecturalStoneName(name: string): boolean {
  return STATIC_BOX_NAME.test(name) && !STATEFUL_OR_NON_ARCHITECTURAL_NAME.test(name);
}
const DISABLED_SUPPORT_ROOT = /(?:Legacy|SupportRoot)$/i;

export interface ArchitecturalBoxUvPatch {
  readonly affectedRenderComponents: number;
  readonly affectedMeshes: number;
  dispose(): void;
}

interface RenderSnapshot {
  readonly render: pc.RenderComponent;
  readonly type: pc.RenderComponent['type'];
  readonly batchGroupId: number;
}

function hasDisabledSupportAncestor(entity: pc.Entity): boolean {
  let current = entity.parent as pc.Entity | null;
  while (current) {
    if (DISABLED_SUPPORT_ROOT.test(current.name)) return true;
    current = current.parent as pc.Entity | null;
  }
  return false;
}

function hasEligibleMaterial(render: pc.RenderComponent, materials: readonly pc.Material[]): boolean {
  return materials.includes(render.material);
}

function hasFiniteScale(entity: pc.Entity): boolean {
  const scale = entity.getLocalScale();
  return [scale.x, scale.y, scale.z].every((value) => Number.isFinite(value) && Math.abs(value) > 1e-6);
}

function isEligibleBox(
  render: pc.RenderComponent,
  materials: readonly pc.Material[],
): boolean {
  const name = render.entity.name;
  return render.type === 'box'
    && render.meshInstances.length === 1
    && hasEligibleMaterial(render, materials)
    && isArchitecturalStoneName(name)
    && !hasDisabledSupportAncestor(render.entity)
    && hasFiniteScale(render.entity);
}

function createArchitecturalBoxMesh(
  app: pc.Application,
  dimensions: BoxDimensions,
): pc.Mesh {
  const geometry = new pc.BoxGeometry();
  const positions = geometry.positions;
  const normals = geometry.normals;
  if (!positions || !normals || !geometry.indices) {
    throw new Error('PlayCanvas BoxGeometry did not provide the expected vertex streams');
  }

  const uvs: number[] = [];
  for (let index = 0; index < positions.length; index += 3) {
    const uv = architecturalBoxUvForVertex(
      [positions[index]!, positions[index + 1]!, positions[index + 2]!],
      [normals[index]!, normals[index + 1]!, normals[index + 2]!],
      dimensions,
    );
    uvs.push(uv[0], uv[1]);
  }
  geometry.uvs = uvs;
  geometry.tangents = pc.calculateTangents(positions, normals, uvs, geometry.indices);
  return pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
}

function regenerateBatchGroups(app: pc.Application, groupIds: ReadonlySet<number>): void {
  const ids = [...groupIds].filter((id) => id >= 0 && app.batcher.getGroupById(id));
  if (ids.length) app.batcher.generate(ids);
}

/**
 * Replaces only named stone/stoneDark box primitives with unit geometry whose
 * UVs follow the entity's existing scale.  No entity transform, semantic name,
 * collider, or stateful render is changed.  Source support roots from the
 * greybox are skipped because authored details have already superseded them.
 */
export function applyArchitecturalBoxUv(
  app: pc.Application,
  roots: readonly pc.Entity[],
  materials: readonly pc.Material[],
): ArchitecturalBoxUvPatch {
  const snapshots: RenderSnapshot[] = [];
  const createdMeshes: pc.Mesh[] = [];
  const affectedGroups = new Set<number>();
  let disposed = false;

  for (const root of roots) {
    for (const render of root.findComponents('render') as pc.RenderComponent[]) {
      if (!isEligibleBox(render, materials)) continue;
      const entity = render.entity;
      const scale = entity.getLocalScale();
      const dimensions: BoxDimensions = [scale.x, scale.y, scale.z];
      const mesh = createArchitecturalBoxMesh(app, dimensions);
      snapshots.push({ render, type: render.type, batchGroupId: render.batchGroupId });
      createdMeshes.push(mesh);
      if (render.batchGroupId >= 0) affectedGroups.add(render.batchGroupId);

      // The primitive MeshInstance is owned by the render component. Setting
      // the type to asset destroys that primitive instance while leaving the
      // entity's position, rotation and scale intact.
      render.batchGroupId = -1;
      render.type = 'asset';
      render.meshInstances = [new pc.MeshInstance(mesh, render.material, entity)];
      render.batchGroupId = snapshots[snapshots.length - 1]!.batchGroupId;
    }
  }

  regenerateBatchGroups(app, affectedGroups);

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;

    const restoreGroups = new Set<number>();
    for (const snapshot of snapshots) {
      const { render } = snapshot;
      render.batchGroupId = -1;
      // Returning to the original primitive type recreates the shared box
      // MeshInstance from the component's original material.  Keeping the old
      // MeshInstance object would be unsafe: RenderComponent#type destroys it
      // when the replacement asset is installed.
      render.type = snapshot.type;
      if (snapshot.batchGroupId >= 0 && app.batcher.getGroupById(snapshot.batchGroupId)) {
        render.batchGroupId = snapshot.batchGroupId;
        restoreGroups.add(snapshot.batchGroupId);
      }
    }
    regenerateBatchGroups(app, restoreGroups);
    for (const mesh of createdMeshes) mesh.destroy();
    snapshots.length = 0;
    createdMeshes.length = 0;
  };

  app.once('destroy', dispose);

  return {
    affectedRenderComponents: snapshots.length,
    affectedMeshes: createdMeshes.length,
    dispose,
  };
}
