import * as pc from 'playcanvas';

type Vec3Tuple = [number, number, number];
type Point2 = [number, number];

export interface ManantialScenicPolishMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  water: pc.StandardMaterial;
  waterfall: pc.StandardMaterial;
  brass: pc.StandardMaterial;
  copperClean: pc.StandardMaterial;
}

export interface ManantialScenicPolishDependencies {
  app: pc.Application;
  staticRoot: pc.Entity;
  dormantWater: pc.Entity;
  activeWater: pc.Entity;
  penstockPipeLeft: pc.Entity;
  penstockPipeRight: pc.Entity;
  materials: ManantialScenicPolishMaterials;
}

export interface ManantialScenicPolishHandle {
  root: pc.Entity;
  dormantWaterMaterial: pc.StandardMaterial;
  activeWaterMaterial: pc.StandardMaterial;
  penstockMaterial: pc.StandardMaterial;
}

interface MeshData {
  positions: number[];
  indices: number[];
}

function meshFromGeometry(app: pc.Application, data: MeshData): pc.Mesh {
  const geometry = new pc.Geometry();
  geometry.positions = [];
  geometry.indices = [];
  geometry.uvs = [];

  // Split hard edges per triangle so the small authored forms keep a stable
  // tangent basis with the same material maps as the rest of Manantial.
  for (let triangle = 0; triangle < data.indices.length; triangle += 3) {
    const points = data.indices.slice(triangle, triangle + 3).map((index) =>
      new pc.Vec3(
        data.positions[index * 3]!,
        data.positions[index * 3 + 1]!,
        data.positions[index * 3 + 2]!,
      ));
    const normal = new pc.Vec3().cross(
      points[1]!.clone().sub(points[0]!),
      points[2]!.clone().sub(points[0]!),
    );
    const ax = Math.abs(normal.x);
    const ay = Math.abs(normal.y);
    const az = Math.abs(normal.z);
    for (const point of points) {
      geometry.indices.push(geometry.positions.length / 3);
      geometry.positions.push(point.x, point.y, point.z);
      const u = ax >= ay && ax >= az ? point.z : point.x;
      const v = ay >= ax && ay >= az ? point.z : point.y;
      geometry.uvs.push(u * 0.28, v * 0.28);
    }
  }
  geometry.normals = pc.calculateNormals(geometry.positions, geometry.indices);
  geometry.tangents = pc.calculateTangents(geometry.positions, geometry.normals, geometry.uvs, geometry.indices);
  return pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
}

function addMesh(
  parent: pc.Entity,
  name: string,
  mesh: pc.Mesh,
  material: pc.StandardMaterial,
  position: Vec3Tuple = [0, 0, 0],
  rotation: Vec3Tuple = [0, 0, 0],
  castShadows = false,
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', {
    type: 'asset',
    meshInstances: [new pc.MeshInstance(mesh, material, entity)],
  });
  entity.render!.castShadows = castShadows;
  entity.render!.receiveShadows = true;
  entity.setLocalPosition(...position);
  entity.setLocalEulerAngles(...rotation);
  parent.addChild(entity);
  return entity;
}

function addPrimitive(
  parent: pc.Entity,
  name: string,
  type: 'box' | 'cylinder',
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  scale: Vec3Tuple,
  rotation: Vec3Tuple = [0, 0, 0],
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material });
  entity.render!.castShadows = false;
  entity.render!.receiveShadows = true;
  entity.setLocalPosition(...position);
  entity.setLocalEulerAngles(...rotation);
  entity.setLocalScale(...scale);
  parent.addChild(entity);
  return entity;
}

function cloneWaterMaterial(
  base: pc.StandardMaterial,
  name: string,
  diffuse: pc.Color,
  opacity: number,
  gloss: number,
): pc.StandardMaterial {
  const material = base.clone() as pc.StandardMaterial;
  material.name = name;
  material.diffuse = diffuse;
  material.emissive = new pc.Color(0, 0, 0);
  material.emissiveIntensity = 0;
  material.opacity = opacity;
  material.gloss = gloss;
  material.blendType = pc.BLEND_NORMAL;
  material.update();
  return material;
}

function clonePenstockMaterial(base: pc.StandardMaterial): pc.StandardMaterial {
  const material = base.clone() as pc.StandardMaterial;
  material.name = 'ManantialPenstockAgedBrass';
  material.diffuse = new pc.Color(0.34, 0.20, 0.065);
  material.emissive = new pc.Color(0, 0, 0);
  material.emissiveIntensity = 0;
  material.gloss = 0.56;
  material.update();
  return material;
}

function replaceWaterSurface(
  app: pc.Application,
  entity: pc.Entity,
  material: pc.StandardMaterial,
  halfWidth: number,
  depth: number,
): void {
  const polygon: Point2[] = [
    [-halfWidth * 0.66, -depth * 0.5],
    [-halfWidth * 0.98, -depth * 0.20],
    [-halfWidth * 0.84, depth * 0.22],
    [-halfWidth * 0.58, depth * 0.5],
    [halfWidth * 0.58, depth * 0.5],
    [halfWidth * 0.98, depth * 0.22],
    [halfWidth * 0.82, -depth * 0.18],
    [halfWidth * 0.64, -depth * 0.5],
  ];
  const positions = [0, 0.018, 0];
  for (let index = 0; index < polygon.length; index += 1) {
    const [x, z] = polygon[index]!;
    const edgeLift = index % 3 === 0 ? 0.006 : 0;
    positions.push(x, edgeLift, z);
  }
  const indices: number[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const next = (index + 1) % polygon.length;
    // Clockwise in the XZ top view produces the +Y water normal.
    indices.push(0, index + 1, next + 1);
  }
  const mesh = meshFromGeometry(app, { positions, indices });
  entity.removeComponent('render');
  entity.addComponent('render', {
    type: 'asset',
    meshInstances: [new pc.MeshInstance(mesh, material, entity)],
  });
  entity.render!.castShadows = false;
  entity.render!.receiveShadows = false;
  entity.setLocalScale(1, 1, 1);
}

function appendRock(
  data: MeshData,
  x: number,
  z: number,
  baseY: number,
  width: number,
  depth: number,
  height: number,
  phase: number,
): void {
  const sides = 6;
  const base = data.positions.length / 3;
  const topScales = [0.72, 0.84, 0.77, 0.66, 0.82, 0.70];
  for (const isTop of [false, true]) {
    const y = baseY + (isTop ? height : 0);
    for (let index = 0; index < sides; index += 1) {
      const angle = phase + (index / sides) * Math.PI * 2;
      const topScale = isTop ? topScales[index]! : 1;
      data.positions.push(
        x + Math.cos(angle) * width * 0.5 * topScale,
        y,
        z + Math.sin(angle) * depth * 0.5 * topScale,
      );
    }
  }
  const top = base + sides;
  for (let index = 1; index < sides - 1; index += 1) {
    data.indices.push(base, base + index, base + index + 1);
    data.indices.push(top, top + index + 1, top + index);
  }
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    data.indices.push(base + index, top + next, base + next);
    data.indices.push(base + index, top + index, top + next);
  }
}

function buildRiberaMesh(app: pc.Application): pc.Mesh {
  const data: MeshData = { positions: [], indices: [] };
  const rocks: Array<[number, number, number, number, number, number, number]> = [
    [-6.05, 21.0, 0.82, 1.05, 0.95, 0.42, 0.25],
    [-2.35, 21.3, 0.82, 0.9, 0.78, 0.36, 1.1],
    [-6.18, 23.9, 0.82, 0.9, 0.8, 0.34, 2.0],
    [-2.28, 24.9, 0.82, 1.1, 0.85, 0.5, 0.7],
    [-6.12, 27.1, 0.82, 1.0, 0.9, 0.38, 2.7],
    [-2.38, 28.1, 0.82, 0.84, 0.72, 0.31, 1.45],
    [-6.02, 30.0, 0.82, 1.15, 0.9, 0.46, 2.25],
    [-2.42, 30.15, 0.82, 1.0, 0.88, 0.4, 0.45],
    [-1.75, 18.5, 0.95, 1.1, 0.9, 0.34, 2.45],
    [1.35, 18.15, 0.95, 1.25, 0.82, 0.42, 0.9],
  ];
  for (const [x, z, baseY, width, depth, height, phase] of rocks) appendRock(data, x, z, baseY, width, depth, height, phase);
  return meshFromGeometry(app, data);
}

function buildActiveWaterRibbonMesh(app: pc.Application): pc.Mesh {
  // Local to activeWater at [-4.2, 1.43, 23.6]. The headrace descends from
  // z=30.5 and bends into the tailrace at world [0, 1.12, 18.0].
  const path: Array<{ x: number; z: number; y: number; halfWidth: number }> = [
    { x: 0.0, z: 6.9, y: -0.03, halfWidth: 1.5 },
    { x: 0.0, z: 3.7, y: -0.07, halfWidth: 1.52 },
    { x: 0.15, z: 0.35, y: -0.13, halfWidth: 1.48 },
    { x: 1.65, z: -2.65, y: -0.21, halfWidth: 1.36 },
    { x: 4.2, z: -5.6, y: -0.31, halfWidth: 1.6 },
  ];
  const positions: number[] = [];
  for (let index = 0; index < path.length; index += 1) {
    const current = path[index]!;
    const previous = path[Math.max(0, index - 1)]!;
    const next = path[Math.min(path.length - 1, index + 1)]!;
    const dx = next.x - previous.x;
    const dz = next.z - previous.z;
    const length = Math.hypot(dx, dz) || 1;
    const tangentX = dx / length;
    const tangentZ = dz / length;
    const perpendicularX = -tangentZ;
    const perpendicularZ = tangentX;
    const leftX = current.x + perpendicularX * current.halfWidth;
    const leftZ = current.z + perpendicularZ * current.halfWidth;
    const rightX = current.x - perpendicularX * current.halfWidth;
    const rightZ = current.z - perpendicularZ * current.halfWidth;
    positions.push(leftX, current.y, leftZ, rightX, current.y, rightZ);
  }
  const indices: number[] = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const left = index * 2;
    const right = left + 1;
    const nextLeft = left + 2;
    const nextRight = left + 3;
    // These orders keep the water-facing normals at +Y while the path turns.
    indices.push(left, nextRight, right, left, nextLeft, nextRight);
  }
  return meshFromGeometry(app, { positions, indices });
}

function buildRingMesh(app: pc.Application, sides: number, innerRadius: number, outerRadius: number, height: number): pc.Mesh {
  const data: MeshData = { positions: [], indices: [] };
  for (const y of [0, height]) {
    for (const radius of [outerRadius, innerRadius]) {
      for (let index = 0; index < sides; index += 1) {
        const angle = (index / sides) * Math.PI * 2;
        data.positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      }
    }
  }
  const outerBottom = 0;
  const innerBottom = sides;
  const outerTop = sides * 2;
  const innerTop = sides * 3;
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    data.indices.push(outerBottom + index, outerTop + next, outerBottom + next, outerBottom + index, outerTop + index, outerTop + next);
    data.indices.push(innerBottom + index, innerBottom + next, innerTop + next, innerBottom + index, innerTop + next, innerTop + index);
    data.indices.push(outerTop + index, innerTop + next, outerTop + next, outerTop + index, innerTop + index, innerTop + next);
    data.indices.push(outerBottom + index, outerBottom + next, innerBottom + next, outerBottom + index, innerBottom + next, innerBottom + index);
  }
  return meshFromGeometry(app, data);
}

function assignMaterial(entity: pc.Entity, material: pc.StandardMaterial): void {
  for (const meshInstance of entity.render?.meshInstances ?? []) meshInstance.material = material;
}

function penstockPoint(x: number, distance: number): Vec3Tuple {
  const tilt = (35 * Math.PI) / 180;
  return [x, 9.5 + Math.cos(tilt) * distance, 33.5 + Math.sin(tilt) * distance];
}

export function buildManantialScenicPolish({
  app,
  staticRoot,
  dormantWater,
  activeWater,
  penstockPipeLeft,
  penstockPipeRight,
  materials,
}: ManantialScenicPolishDependencies): ManantialScenicPolishHandle {
  const { stone, stoneDark, water, waterfall, brass } = materials;
  const root = new pc.Entity('ManantialScenicPolishRoot');
  staticRoot.addChild(root);
  addCatchmentLandscape(app, root);

  const dormantWaterMaterial = cloneWaterMaterial(water, 'ManantialWaterMuted', new pc.Color(0.065, 0.28, 0.30), 0.78, 0.72);
  const activeWaterMaterial = cloneWaterMaterial(waterfall, 'ManantialWaterFlowMuted', new pc.Color(0.10, 0.36, 0.38), 0.68, 0.78);
  replaceWaterSurface(app, dormantWater, dormantWaterMaterial, 1.52, 9.2);
  activeWater.removeComponent('render');
  activeWater.addComponent('render', {
    type: 'asset',
    meshInstances: [new pc.MeshInstance(buildActiveWaterRibbonMesh(app), activeWaterMaterial, activeWater)],
  });
  activeWater.render!.castShadows = false;
  activeWater.render!.receiveShadows = false;
  activeWater.setLocalScale(1, 1, 1);

  // The bank reads as a channel with a supported water edge, rather than a
  // floating cyan rectangle. The stones are one material-batched authored mesh.
  addMesh(root, 'ManantialRiberaBoulders', buildRiberaMesh(app), stoneDark, [0, 0, 0], [0, 0, 0], true);
  addPrimitive(root, 'ManantialHeadraceCopingWest', 'box', stone, [-6.15, 2.48, 25.7], [0.64, 0.24, 10.9]);
  addPrimitive(root, 'ManantialHeadraceCopingEast', 'box', stone, [-2.25, 2.48, 25.7], [0.64, 0.24, 10.9]);
  addPrimitive(root, 'ManantialTailraceSill', 'box', stoneDark, [0, 1.06, 20.45], [5.2, 0.28, 0.48]);
  addPrimitive(root, 'ManantialTailraceBankWest', 'box', stone, [-2.35, 1.1, 18.0], [0.54, 0.34, 4.3]);
  addPrimitive(root, 'ManantialTailraceBankEast', 'box', stone, [2.35, 1.1, 18.0], [0.54, 0.34, 4.3]);

  const penstockMaterial = clonePenstockMaterial(brass);
  assignMaterial(penstockPipeLeft, penstockMaterial);
  assignMaterial(penstockPipeRight, penstockMaterial);
  const ringMesh = buildRingMesh(app, 16, 0.53, 0.68, 0.18);
  const pipeSpecs: Array<[string, number]> = [
    ['Left', -3.2],
    ['Right', 3.2],
  ];
  for (const [side, x] of pipeSpecs) {
    for (const [index, distance] of [-7.6, -0.15, 7.35].entries()) {
      addMesh(root, `ManantialPenstock${side}Clamp${index + 1}`, ringMesh, penstockMaterial, penstockPoint(x, distance), [35, 0, 0], true);
    }
    const collectorPosition = penstockPoint(x, -8.45);
    addPrimitive(root, `ManantialPenstock${side}Collector`, 'cylinder', penstockMaterial, collectorPosition, [0.88, 1.16, 0.88], [35, 0, 0]);
    addPrimitive(root, `ManantialPenstock${side}CeramicTerminal`, 'cylinder', stone, penstockPoint(x, -9.25), [0.36, 0.32, 0.36], [35, 0, 0]);
  }
  const lowerHeader = penstockPoint(0, -8.45);
  addPrimitive(root, 'ManantialPenstockLowerCollectorHeader', 'box', stoneDark, [lowerHeader[0], lowerHeader[1], lowerHeader[2]], [7.2, 0.28, 0.28]);
  const upperHeader = penstockPoint(0, 7.75);
  addPrimitive(root, 'ManantialPenstockUpperCollectorHeader', 'box', penstockMaterial, [upperHeader[0], upperHeader[1], upperHeader[2]], [7.2, 0.22, 0.22]);
  addPrimitive(root, 'ManantialPenstockHeaderStanchionWest', 'cylinder', stoneDark, [-3.2, upperHeader[1] - 0.5, upperHeader[2]], [0.24, 1.0, 0.24]);
  addPrimitive(root, 'ManantialPenstockHeaderStanchionEast', 'cylinder', stoneDark, [3.2, upperHeader[1] - 0.5, upperHeader[2]], [0.24, 1.0, 0.24]);

  return { root, dormantWaterMaterial, activeWaterMaterial, penstockMaterial };
}

/** Real zone-local ground below the apron; no new navigable obstacles. */
function addCatchmentLandscape(app: pc.Application, root: pc.Entity): void {
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const segments = 64, extent = 420;
  const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  for (let row = 0; row <= segments; row += 1) {
    for (let col = 0; col <= segments; col += 1) {
      const x = (col / segments * 2 - 1) * extent;
      const z = (row / segments * 2 - 1) * extent + 24;
      const distance = Math.hypot(x, z - 24);
      // Keep every vertex near the validated plant/approach below the floor.
      const rise = smooth((distance - 42) / 130);
      const ridges = 13 + Math.sin(x / 45 + 1) * 7 + Math.cos(z / 61) * 5;
      const y = -0.16 + rise * rise * ridges;
      positions.push(x, y, z);
      const variation = (Math.sin(x / 17) * Math.cos(z / 23) + 1) * 0.025;
      const haze = smooth((distance - 180) / 250) * 0.65;
      const soil = [0.27 + variation, 0.30 + variation, 0.24 + variation];
      const atmosphere = [0.48, 0.59, 0.62];
      colors.push(...soil.map((v, i) => v * (1 - haze) + atmosphere[i]! * haze), 1);
    }
  }
  for (let row = 0; row < segments; row += 1) {
    for (let col = 0; col < segments; col += 1) {
      const a = row * (segments + 1) + col, b = a + 1, c = a + segments + 1, d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions);
  mesh.setNormals(pc.calculateNormals(positions, indices));
  mesh.setColors(colors);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);
  const material = new pc.StandardMaterial();
  material.name = 'ManantialCatchmentSoil';
  material.diffuse.set(0.52, 0.56, 0.48);
  material.diffuseVertexColor = true;
  material.gloss = 0.09;
  material.update();
  addMesh(root, 'ManantialCatchmentLandscape', mesh, material, [0, 0, 0], [0, 0, 0], false);
}
