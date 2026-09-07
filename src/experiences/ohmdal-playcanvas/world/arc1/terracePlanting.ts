import * as pc from 'playcanvas';

type Vec3Tuple = [number, number, number];
type Uv = [number, number];

interface MeshData {
  positions: number[];
  indices: number[];
  uvs: number[];
}

// These are local to Arc1ForgeTerracesGreyboxRoot (120, 0, -8).  The six
// basins remain the water system's source of truth; this module only adds a
// visible soil island, low crops and the raised edges that make irrigation
// legible around the existing water border.
const TERRACE_BEDS: ReadonlyArray<readonly [number, number]> = [
  [-5.2, 15],
  [5.2, 15],
  [-5.2, 21],
  [5.2, 21],
  [-5.2, 27],
  [5.2, 27],
];

function pushPoint(data: MeshData, point: Vec3Tuple, uv: Uv): number {
  const index = data.positions.length / 3;
  data.positions.push(point[0], point[1], point[2]);
  data.uvs.push(uv[0], uv[1]);
  return index;
}

function pushQuad(data: MeshData, points: Vec3Tuple[], uvs: Uv[]): void {
  if (points.length !== 4 || uvs.length !== 4) throw new Error('Terrace planting quads need four corners');
  const vertices = points.map((point, index) => pushPoint(data, point, uvs[index]!));
  data.indices.push(vertices[0]!, vertices[1]!, vertices[2]!, vertices[0]!, vertices[2]!, vertices[3]!);
}

function appendBox(data: MeshData, center: Vec3Tuple, size: Vec3Tuple): void {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const uv: Uv[] = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // Separate face corners keep hard soil/channel edges and a stable tangent
  // basis after the two material meshes are combined.
  pushQuad(data, [
    [cx + hx, cy - hy, cz - hz], [cx + hx, cy + hy, cz - hz],
    [cx + hx, cy + hy, cz + hz], [cx + hx, cy - hy, cz + hz],
  ], uv);
  pushQuad(data, [
    [cx - hx, cy - hy, cz + hz], [cx - hx, cy + hy, cz + hz],
    [cx - hx, cy + hy, cz - hz], [cx - hx, cy - hy, cz - hz],
  ], uv);
  pushQuad(data, [
    [cx - hx, cy + hy, cz - hz], [cx - hx, cy + hy, cz + hz],
    [cx + hx, cy + hy, cz + hz], [cx + hx, cy + hy, cz - hz],
  ], uv);
  pushQuad(data, [
    [cx - hx, cy - hy, cz + hz], [cx - hx, cy - hy, cz - hz],
    [cx + hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz + hz],
  ], uv);
  pushQuad(data, [
    [cx + hx, cy - hy, cz + hz], [cx + hx, cy + hy, cz + hz],
    [cx - hx, cy + hy, cz + hz], [cx - hx, cy - hy, cz + hz],
  ], uv);
  pushQuad(data, [
    [cx - hx, cy - hy, cz - hz], [cx - hx, cy + hy, cz - hz],
    [cx + hx, cy + hy, cz - hz], [cx + hx, cy - hy, cz - hz],
  ], uv);
}

function appendLeaf(data: MeshData, base: Vec3Tuple, tip: Vec3Tuple, width: number): void {
  const horizontalLength = Math.hypot(tip[0] - base[0], tip[2] - base[2]);
  const safeLength = horizontalLength > 1e-5 ? horizontalLength : 1;
  const side: Vec3Tuple = [
    (-(tip[2] - base[2]) / safeLength) * width / 2,
    0,
    ((tip[0] - base[0]) / safeLength) * width / 2,
  ];
  const narrowSide: Vec3Tuple = [side[0] * 0.12, 0, side[2] * 0.12];
  const thickness = 0.012;
  const front = (point: Vec3Tuple): Vec3Tuple => [point[0], point[1] + thickness, point[2]];
  const back = (point: Vec3Tuple): Vec3Tuple => [point[0], point[1] - thickness, point[2]];
  const add = (a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const subtract = (a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  const baseLeft = subtract(base, side);
  const baseRight = add(base, side);
  const tipLeft = subtract(tip, narrowSide);
  const tipRight = add(tip, narrowSide);
  const uv: Uv[] = [[0, 0], [1, 0], [1, 1], [0, 1]];

  pushQuad(data, [front(baseLeft), front(baseRight), front(tipRight), front(tipLeft)], uv);
  pushQuad(data, [back(tipLeft), back(tipRight), back(baseRight), back(baseLeft)], uv);
  pushQuad(data, [front(baseRight), back(baseRight), back(tipRight), front(tipRight)], uv);
  pushQuad(data, [front(tipLeft), back(tipLeft), back(baseLeft), front(baseLeft)], uv);
}

function createMesh(app: pc.Application, data: MeshData): pc.Mesh {
  const geometry = new pc.Geometry();
  geometry.positions = data.positions;
  geometry.indices = data.indices;
  geometry.uvs = data.uvs;
  geometry.normals = pc.calculateNormals(geometry.positions, geometry.indices);
  geometry.tangents = pc.calculateTangents(
    geometry.positions,
    geometry.normals,
    geometry.uvs,
    geometry.indices,
  );
  return pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
}

function createMaterial(name: string, color: pc.Color): pc.StandardMaterial {
  const material = new pc.StandardMaterial();
  material.name = name;
  material.diffuse = color;
  material.metalness = 0;
  material.gloss = 0.15;
  material.useLighting = true;
  material.update();
  return material;
}

function attachMesh(
  parent: pc.Entity,
  name: string,
  mesh: pc.Mesh,
  material: pc.StandardMaterial,
  castShadows: boolean,
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', {
    meshInstances: [new pc.MeshInstance(mesh, material, entity)],
  });
  entity.render!.castShadows = castShadows;
  entity.render!.receiveShadows = true;
  parent.addChild(entity);
  return entity;
}

/** Adds readable low crops and irrigation edges inside the six existing basins. */
export function createTerracePlanting(app: pc.Application, root: pc.Entity): pc.Entity {
  const plantingRoot = new pc.Entity('ForgeTerracePlantingRoot');
  plantingRoot.tags.add('ohmdal-terrace-planting');
  plantingRoot.tags.add('semantic-prop');
  root.addChild(plantingRoot);

  const soilData: MeshData = { positions: [], indices: [], uvs: [] };
  const plantData: MeshData = { positions: [], indices: [], uvs: [] };

  for (const [index, [x, z]] of TERRACE_BEDS.entries()) {
    const level = Math.floor(index / 2);
    const baseY = 0.42 + level * 0.3;
    const soilTop = baseY + 0.12;

    // The 3.2 x 2.8 island leaves a visible water border inside each 4.2 x
    // 3.8 basin. Four low edges sit in that border and read as channels/banks
    // without changing the existing water entity or its level.
    appendBox(soilData, [x, baseY + 0.06, z], [3.2, 0.12, 2.8]);
    appendBox(soilData, [x, baseY + 0.035, z - 1.48], [3.2, 0.07, 0.10]);
    appendBox(soilData, [x, baseY + 0.035, z + 1.48], [3.2, 0.07, 0.10]);
    appendBox(soilData, [x - 1.67, baseY + 0.035, z], [0.10, 0.07, 2.8]);
    appendBox(soilData, [x + 1.67, baseY + 0.035, z], [0.10, 0.07, 2.8]);

    const rowOffsets = [-0.72, 0, 0.72];
    const columnOffsets = [-1.05, -0.35, 0.35, 1.05];
    for (const [row, rowOffset] of rowOffsets.entries()) {
      for (const [column, columnOffset] of columnOffsets.entries()) {
        const plantX = x + columnOffset;
        const plantZ = z + rowOffset;
        const stemHeight = 0.22 + ((row + column) % 3) * 0.025;
        appendBox(plantData, [plantX, soilTop + stemHeight / 2, plantZ], [0.055, stemHeight, 0.055]);

        const sway = column % 2 === 0 ? 0.075 : -0.075;
        const backSway = row % 2 === 0 ? 0.045 : -0.045;
        appendLeaf(
          plantData,
          [plantX, soilTop + stemHeight * 0.45, plantZ],
          [plantX + sway, soilTop + stemHeight + 0.13, plantZ + backSway],
          0.11,
        );
        appendLeaf(
          plantData,
          [plantX, soilTop + stemHeight * 0.6, plantZ],
          [plantX - sway * 0.7, soilTop + stemHeight + 0.10, plantZ - backSway],
          0.09,
        );
      }
    }
  }

  const soilMaterial = createMaterial('TerracePlantingSoil', new pc.Color(0.25, 0.16, 0.09));
  const plantMaterial = createMaterial('TerracePlantingLeaves', new pc.Color(0.20, 0.38, 0.12));
  plantMaterial.cull = pc.CULLFACE_NONE;
  plantMaterial.update();

  attachMesh(plantingRoot, 'TerracePlantingSoilAndIrrigation', createMesh(app, soilData), soilMaterial, false);
  attachMesh(plantingRoot, 'TerracePlantingCrops', createMesh(app, plantData), plantMaterial, true);
  return plantingRoot;
}
