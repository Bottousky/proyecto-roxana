import * as pc from 'playcanvas';
import { createForgeLandscape } from './forgeLandscape.ts';
import { createTerracePlanting } from './terracePlanting.ts';
import { createLighthouseInfrastructurePolish } from './lighthouseInfrastructurePolish.ts';
import {
  createRegionalMaterialGrammar,
  REGIONAL_MATERIAL_GRAMMAR,
  type RegionalMaterialGrammar,
} from './regionalMaterialGrammar.ts';

export interface Arc1AuthoredDetailMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  copper: pc.StandardMaterial;
  brass: pc.StandardMaterial;
  water: pc.StandardMaterial;
  glow: pc.StandardMaterial;
}

export interface Arc1AuthoredDetailDependencies {
  app: pc.Application;
  materials: Arc1AuthoredDetailMaterials;
  castleRoot: pc.Entity;
  castleLegacyRoot: pc.Entity;
  castleBranchIsolators: pc.Entity[];
  forgeTerracesRoot: pc.Entity;
  forgeTerracesLegacyRoot: pc.Entity;
  forgeHeater: pc.Entity;
  terracesPump: pc.Entity;
  terracesWaterChannels: pc.Entity[];
  lighthouseRoot: pc.Entity;
  lighthouseLegacyRoot: pc.Entity;
  lighthouseBeacon: pc.Entity;
}

export interface Arc1AuthoredDetails {
  roots: {
    castle: pc.Entity;
    forgeTerraces: pc.Entity;
    lighthouse: pc.Entity;
  };
  dynamicWaterChannels: pc.Entity[];
}

type Point2 = [number, number];
type Vec3Tuple = [number, number, number];

function meshFromGeometry(
  app: pc.Application,
  positions: number[],
  indices: number[],
): pc.Mesh {
  const geometry = new pc.Geometry();
  geometry.positions = [];
  geometry.indices = [];
  geometry.uvs = [];
  // Stone/metal maps need a finite tangent basis. Split hard edges and choose
  // the dominant face plane so vertical faces never collapse to a UV line.
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    const points = indices.slice(triangle, triangle + 3).map((index) =>
      new pc.Vec3(positions[index * 3]!, positions[index * 3 + 1]!, positions[index * 3 + 2]!));
    const normal = new pc.Vec3().cross(
      points[1]!.clone().sub(points[0]!), points[2]!.clone().sub(points[0]!),
    );
    const ax = Math.abs(normal.x), ay = Math.abs(normal.y), az = Math.abs(normal.z);
    for (const point of points) {
      geometry.indices.push(geometry.positions.length / 3);
      geometry.positions.push(point.x, point.y, point.z);
      const u = ax > ay && ax > az ? point.z : point.x;
      const v = ay >= ax && ay >= az ? point.z : point.y;
      geometry.uvs.push(u * 0.3, v * 0.3);
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
  castShadows = false,
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material });
  entity.render!.castShadows = castShadows;
  entity.render!.receiveShadows = true;
  entity.setLocalPosition(...position);
  entity.setLocalEulerAngles(...rotation);
  entity.setLocalScale(...scale);
  parent.addChild(entity);
  return entity;
}

function addBox(
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  scale: Vec3Tuple,
  rotation: Vec3Tuple = [0, 0, 0],
): pc.Entity {
  return addPrimitive(parent, name, 'box', material, position, scale, rotation);
}

function addBeam(
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  from: Point2,
  to: Point2,
  y: number,
  height: number,
  depth: number,
): pc.Entity {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  return addBox(
    parent,
    name,
    material,
    [(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2],
    [length, height, depth],
    [0, (Math.atan2(dz, dx) * 180) / Math.PI, 0],
  );
}

function extrudedPolygonMesh(
  app: pc.Application,
  polygon: Point2[],
  bottom: number,
  top: number,
): pc.Mesh {
  const positions: number[] = [];
  for (const [x, z] of polygon) positions.push(x, bottom, z);
  for (const [x, z] of polygon) positions.push(x, top, z);

  const indices: number[] = [];
  const count = polygon.length;
  for (let index = 1; index < count - 1; index += 1) {
    indices.push(0, index, index + 1);
    indices.push(count, count + index + 1, count + index);
  }
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count;
    // The polygon is wound CCW in XZ. With +Y up, bottom_i -> top_next ->
    // bottom_next gives the outward side normal; the previous order pointed
    // into the prism on every vertical face.
    indices.push(index, count + next, next, index, count + index, count + next);
  }
  return meshFromGeometry(app, positions, indices);
}

function chamferedPrismMesh(app: pc.Application, width: number, depth: number, height: number, chamfer = 0.18): pc.Mesh {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const c = Math.min(chamfer, halfWidth * 0.45, halfDepth * 0.45);
  return extrudedPolygonMesh(app, [
    [-halfWidth + c, -halfDepth],
    [halfWidth - c, -halfDepth],
    [halfWidth, -halfDepth + c],
    [halfWidth, halfDepth - c],
    [halfWidth - c, halfDepth],
    [-halfWidth + c, halfDepth],
    [-halfWidth, halfDepth - c],
    [-halfWidth, -halfDepth + c],
  ], 0, height);
}

function prismMesh(app: pc.Application, sides: number, radius: number, height: number, phase = Math.PI / 8): pc.Mesh {
  const polygon: Point2[] = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = phase + (index / sides) * Math.PI * 2;
    polygon.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return extrudedPolygonMesh(app, polygon, 0, height);
}

function taperedPrismMesh(
  app: pc.Application,
  sides: number,
  bottomRadius: number,
  topRadius: number,
  height: number,
  phase = Math.PI / 8,
): pc.Mesh {
  const positions: number[] = [];
  for (const yRadius of [[0, bottomRadius], [height, topRadius]] as Array<[number, number]>) {
    const [y, radius] = yRadius;
    for (let index = 0; index < sides; index += 1) {
      const angle = phase + (index / sides) * Math.PI * 2;
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
  }
  const indices: number[] = [];
  for (let index = 1; index < sides - 1; index += 1) {
    indices.push(0, index, index + 1);
    indices.push(sides, sides + index + 1, sides + index);
  }
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    indices.push(index, sides + next, next, index, sides + index, sides + next);
  }
  return meshFromGeometry(app, positions, indices);
}

function ringMesh(
  app: pc.Application,
  sides: number,
  innerRadius: number,
  outerRadius: number,
  height: number,
  phase = Math.PI / 8,
): pc.Mesh {
  const positions: number[] = [];
  for (const y of [0, height]) {
    for (const radius of [outerRadius, innerRadius]) {
      for (let index = 0; index < sides; index += 1) {
        const angle = phase + (index / sides) * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      }
    }
  }
  const indices: number[] = [];
  const outerBottom = 0;
  const innerBottom = sides;
  const outerTop = sides * 2;
  const innerTop = sides * 3;
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    // Outer and inner walls both reverse the old winding: the outer surface
    // faces away from the ring and the inner surface faces into its opening.
    indices.push(outerBottom + index, outerTop + next, outerBottom + next, outerBottom + index, outerTop + index, outerTop + next);
    indices.push(innerBottom + index, innerBottom + next, innerTop + next, innerBottom + index, innerTop + next, innerTop + index);
    // Top cap must face +Y; bottom cap must face -Y.
    indices.push(outerTop + index, innerTop + next, outerTop + next, outerTop + index, innerTop + index, innerTop + next);
    indices.push(outerBottom + index, outerBottom + next, innerBottom + next, outerBottom + index, innerBottom + next, innerBottom + index);
  }
  return meshFromGeometry(app, positions, indices);
}

function archWedgeMesh(app: pc.Application, innerRadius: number, outerRadius: number, start: number, end: number, depth: number): pc.Mesh {
  const points: Array<[number, number]> = [
    [Math.cos(start) * outerRadius, Math.sin(start) * outerRadius],
    [Math.cos(end) * outerRadius, Math.sin(end) * outerRadius],
    [Math.cos(end) * innerRadius, Math.sin(end) * innerRadius],
    [Math.cos(start) * innerRadius, Math.sin(start) * innerRadius],
  ];
  const positions: number[] = [];
  for (const z of [-depth / 2, depth / 2]) {
    for (const [x, y] of points) positions.push(x, y, z);
  }
  const indices = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
  ];
  return meshFromGeometry(app, positions, indices);
}

function addChamferedPrism(
  app: pc.Application,
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  width: number,
  depth: number,
  height: number,
  chamfer = 0.18,
): pc.Entity {
  return addMesh(parent, name, chamferedPrismMesh(app, width, depth, height, chamfer), material, position);
}

function addPrism(
  app: pc.Application,
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  sides: number,
  radius: number,
  height: number,
  castShadows = false,
): pc.Entity {
  return addMesh(parent, name, prismMesh(app, sides, radius, height), material, position, [0, 0, 0], castShadows);
}

function addTaperedPrism(
  app: pc.Application,
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  sides: number,
  bottomRadius: number,
  topRadius: number,
  height: number,
  castShadows = false,
): pc.Entity {
  return addMesh(parent, name, taperedPrismMesh(app, sides, bottomRadius, topRadius, height), material, position, [0, 0, 0], castShadows);
}

function addRing(
  app: pc.Application,
  parent: pc.Entity,
  name: string,
  material: pc.StandardMaterial,
  position: Vec3Tuple,
  sides: number,
  innerRadius: number,
  outerRadius: number,
  height: number,
): pc.Entity {
  return addMesh(parent, name, ringMesh(app, sides, innerRadius, outerRadius, height), material, position);
}

function replaceRenderWithMesh(
  app: pc.Application,
  entity: pc.Entity,
  mesh: pc.Mesh,
  material: pc.StandardMaterial,
): void {
  entity.removeComponent('render');
  entity.addComponent('render', {
    type: 'asset',
    meshInstances: [new pc.MeshInstance(mesh, material, entity)],
  });
  entity.render!.castShadows = true;
  entity.render!.receiveShadows = true;
  entity.setLocalScale(1, 1, 1);
  void app;
}

function hideVisual(root: pc.Entity, name: string): void {
  const entity = root.findByName(name) as pc.Entity | null;
  if (entity) entity.enabled = false;
}

function addSegmentedArch(
  app: pc.Application,
  parent: pc.Entity,
  name: string,
  center: Vec3Tuple,
  innerRadius: number,
  outerRadius: number,
  depth: number,
  material: pc.StandardMaterial,
): void {
  const segments = 9;
  for (let index = 0; index < segments; index += 1) {
    const gap = 0.0015;
    const start = (index / segments) * Math.PI + gap;
    const end = ((index + 1) / segments) * Math.PI - gap;
    addMesh(
      parent,
      `${name}Voussoir${index + 1}`,
      archWedgeMesh(app, innerRadius, outerRadius, start, end, depth),
      material,
      center,
    );
  }
}

function batchStaticDetails(
  app: pc.Application,
  root: pc.Entity,
  name: string,
  maxAabb: number,
  excludedEntities: ReadonlySet<pc.Entity> = new Set<pc.Entity>(),
): void {
  const group = app.batcher.addGroup(name, false, maxAabb);
  for (const render of root.findComponents('render') as pc.RenderComponent[]) {
    if (excludedEntities.has(render.entity)) continue;
    render.castShadows = !/Water|Channel/i.test(render.entity.name);
    render.batchGroupId = group.id;
  }
  app.batcher.generate([group.id]);
}

function buildCastleDetails(
  app: pc.Application,
  materials: Arc1AuthoredDetailMaterials,
  regionalMaterials: RegionalMaterialGrammar,
  castleRoot: pc.Entity,
  legacyRoot: pc.Entity,
  branchIsolators: pc.Entity[],
): pc.Entity {
  legacyRoot.enabled = false;
  hideVisual(castleRoot, 'CastleMainBus');
  hideVisual(castleRoot, 'CastleBranchA');
  hideVisual(castleRoot, 'CastleBranchB');
  hideVisual(castleRoot, 'CastleBranchC');
  hideVisual(castleRoot, 'CastleServiceLoadA');
  hideVisual(castleRoot, 'CastleServiceLoadB');
  hideVisual(castleRoot, 'CastleServiceLoadC');

  const root = new pc.Entity('CastleAuthoredDetailsRoot');
  castleRoot.addChild(root);
  for (const name of ['CastleWallWest', 'CastleWallEast', 'CastleWallNorth', 'CastleWallSouthWest', 'CastleWallSouthEast']) {
    const wall = castleRoot.findByName(name) as pc.Entity | null;
    if (!wall) continue;
    const scale = wall.getLocalScale().clone();
    const position = wall.getLocalPosition().clone();
    scale.y = 11; position.y = 5.5;
    wall.setLocalScale(scale); wall.setLocalPosition(position);
    if (wall.render) wall.render.castShadows = true;
  }
  addBox(root, 'CastleHallCeiling', materials.stoneDark, [0, 11, 0], [28, 0.4, 30]);
  for (const z of [-8, 0, 8]) {
    const light = new pc.Entity(`CastleHallServiceLight${z}`);
    light.setLocalPosition(0, 6.5, z);
    light.addComponent('light', { type: 'point', color: new pc.Color(1, 0.86, 0.65), intensity: 3.2, range: 18, castShadows: false });
    root.addChild(light);
    addBox(root, `CastleHallServiceFixture${z}`, materials.brass, [0, 6.7, z], [1.2, 0.15, 0.5]);
    addBox(root, `CastleHallServiceSuspension${z}`, materials.brass, [0, 8.7, z], [0.06, 4, 0.06]);
  }

  for (const z of [-10, 0, 10]) {
    addChamferedPrism(app, root, `CastlePillarWest${z}`, materials.stone, [-10.5, 0, z], 2.2, 2.0, 6.2, 0.28);
    addChamferedPrism(app, root, `CastlePillarEast${z}`, materials.stone, [10.5, 0, z], 2.2, 2.0, 6.2, 0.28);
    addSegmentedArch(app, root, `CastleHallArch${z}`, [0, 0.2, z], 8.6, 10.4, 1.45, materials.stone);
    addBox(root, `CastleHallCornice${z}`, materials.stoneDark, [0, 10.65, z], [21.2, 0.32, 1.8]);
    addBox(root, `CastleHallPlinthWest${z}`, materials.stoneDark, [-10.5, 0.16, z], [2.6, 0.32, 2.4]);
    addBox(root, `CastleHallPlinthEast${z}`, materials.stoneDark, [10.5, 0.16, z], [2.6, 0.32, 2.4]);
  }

  const panelBody = castleRoot.findByName('CastlePanelBody') as pc.Entity | null;
  if (panelBody) {
    replaceRenderWithMesh(app, panelBody, chamferedPrismMesh(app, 3.8, 1.2, 1.8, 0.16), materials.stoneDark);
    panelBody.setLocalPosition(0, 0, 0);
  }
  const panelFace = castleRoot.findByName('CastlePanelFace') as pc.Entity | null;
  if (panelFace) {
    replaceRenderWithMesh(app, panelFace, chamferedPrismMesh(app, 2.5, 0.12, 1.2, 0.05), materials.brass);
    panelFace.setLocalPosition(0, 0.45, -0.66);
  }

  const distributor = new pc.Entity('CastleCentralDistributorAuthored');
  distributor.setLocalPosition(0, 0, 0);
  root.addChild(distributor);
  addPrism(app, distributor, 'CastleDistributorPlinth', materials.stoneDark, [0, 0.2, 0], 12, 3.1, 0.4);
  addRing(app, distributor, 'CastleDistributorCopperRim', materials.copper, [0, 0.62, 0], 12, 2.35, 2.75, 0.16);
  addPrism(app, distributor, 'CastleDistributorCore', materials.brass, [0, 0.72, 0], 8, 1.9, 0.28);
  addBeam(distributor, 'CastleBusBranchA', materials.copper, [0, 0], [-8.0, 0], 1.08, 0.24, 0.28);
  addBeam(distributor, 'CastleBusBranchB', materials.copper, [0, 0], [8.0, 0], 1.08, 0.24, 0.28);
  addBeam(distributor, 'CastleBusBranchC', materials.copper, [0, 0], [0, 8.0], 1.08, 0.24, 0.28);
  for (const [index, position] of [[1, [-4, 0]], [2, [4, 0]], [3, [0, 4]]] as Array<[number, Point2]>) {
    addPrism(app, distributor, `CastleCeramicStandoff${index}`, materials.stone, [position[0], 0.78, position[1]], 8, 0.42, 0.5);
  }
  for (const [index, position] of [[1, [-8, 0]], [2, [8, 0]], [3, [0, 8]]] as Array<[number, Point2]>) {
    addChamferedPrism(app, distributor, `CastleServiceCabinet${index}`, materials.stoneDark, [position[0], 0, position[1]], 2.0, 1.6, 1.4, 0.16);
    addRing(app, distributor, `CastleServiceSeal${index}`, materials.brass, [position[0], 1.45, position[1]], 8, 0.34, 0.48, 0.12);
  }

  for (const [index, isolator] of branchIsolators.entries()) {
    isolator.setLocalScale(1, 1, 1);
    replaceRenderWithMesh(app, isolator, chamferedPrismMesh(app, 2.2, 0.34, 0.18, 0.06), materials.copper);
    addPrism(app, isolator, `CastleIsolatorCeramic${index + 1}`, materials.stone, [0, 0.08, 0], 8, 0.24, 0.34);
  }

  regionalMaterials.applyCeramicBySemanticName(castleRoot);
  regionalMaterials.applyConductorsByName(root, [
    'CastleBusBranchA',
    'CastleBusBranchB',
    'CastleBusBranchC',
  ], { height: 0.12, depth: 0.14 });
  batchStaticDetails(app, root, 'OhmdalCastleAuthoredDetails', 45);
  return root;
}

function buildForgeDetails(
  app: pc.Application,
  materials: Arc1AuthoredDetailMaterials,
  regionalMaterials: RegionalMaterialGrammar,
  forgeRoot: pc.Entity,
  legacyRoot: pc.Entity,
  forgeHeater: pc.Entity,
  terracesPump: pc.Entity,
  waterChannels: pc.Entity[],
): { root: pc.Entity; dynamicWaterChannels: pc.Entity[] } {
  legacyRoot.enabled = false;
  hideVisual(forgeRoot, 'TerracesLevelOne');
  hideVisual(forgeRoot, 'TerracesLevelTwo');
  hideVisual(forgeRoot, 'TerracesLevelThree');
  hideVisual(forgeRoot, 'ForgeTerracesMainBus');
  hideVisual(forgeRoot, 'ForgeBranchLeft');
  hideVisual(forgeRoot, 'TerracesPumpBranch');

  const root = new pc.Entity('ForgeTerracesAuthoredDetailsRoot');
  forgeRoot.addChild(root);

  // The former support pass carried these conductors as long rectangular
  // placeholders. Keep the electrical route visible after hiding that pass,
  // but give it a service gantry and ceramic standoffs so the furnace and
  // pump still read as loads on the same network.
  addBeam(root, 'ForgeAuthoredMainBus', materials.copper, [0, -5.5], [0, 29.5], 4.8, 0.28, 0.42);
  addBeam(root, 'ForgeAuthoredForgeBranch', materials.copper, [0, 0], [4.2, 0], 4.8, 0.28, 0.38);
  addBeam(root, 'ForgeAuthoredWorkshopBranch', materials.copper, [0, 0], [-7.5, 0], 4.8, 0.28, 0.38);
  addBeam(root, 'ForgeAuthoredPumpBranch', materials.brass, [0, 24], [5.4, 24], 4.8, 0.28, 0.38);
  for (const [index, position] of [[1, [0, -4]], [2, [0, 4]], [3, [0, 16]], [4, [0, 24]]] as Array<[number, Point2]>) {
    addBeam(root, `ForgeBusSupport${index}`, materials.stoneDark, [-13.5, position[1]], [13.5, position[1]], 4.08, 0.2, 0.22);
    addPrism(app, root, `ForgeAuthoredCeramicStandoff${index}`, materials.stone, [position[0], 4.18, position[1]], 8, 0.42, 0.72);
  }

  const heaterBase = forgeHeater.findByName('ForgeHeaterBase') as pc.Entity | null;
  if (heaterBase) {
    replaceRenderWithMesh(app, heaterBase, prismMesh(app, 8, 2.35, 0.7), materials.stoneDark);
    heaterBase.setLocalPosition(0, 0, 0);
  }
  const heaterBody = forgeHeater.findByName('ForgeHeaterBody') as pc.Entity | null;
  if (heaterBody) {
    replaceRenderWithMesh(app, heaterBody, taperedPrismMesh(app, 8, 1.55, 1.24, 2.4), materials.copper);
    heaterBody.setLocalPosition(0, 0.7, 0);
  }
  const heaterRing = forgeHeater.findByName('ForgeHeaterRing') as pc.Entity | null;
  if (heaterRing) replaceRenderWithMesh(app, heaterRing, ringMesh(app, 12, 1.26, 1.72, 0.18), materials.brass);

  addRing(app, forgeHeater, 'ForgeHearthMasonryBand', materials.stone, [0, 2.72, 0], 8, 1.0, 1.7, 0.28);
  addTaperedPrism(app, forgeHeater, 'ForgeHearthHood', materials.stoneDark, [0, 3.0, 0], 8, 1.55, 1.0, 1.2);
  addRing(app, forgeHeater, 'ForgeHearthHoodCap', materials.brass, [0, 4.18, 0], 10, 0.72, 1.2, 0.16);
  addTaperedPrism(app, forgeHeater, 'ForgeChargeColumnA', materials.brass, [-0.72, 4.18, 0], 6, 0.34, 0.26, 0.8);
  addTaperedPrism(app, forgeHeater, 'ForgeChargeColumnB', materials.brass, [0.72, 4.18, 0], 6, 0.34, 0.26, 0.8);
  addPrism(app, forgeHeater, 'ForgeChargeCeramicA', materials.stone, [-0.72, 3.85, 0], 8, 0.42, 0.18);
  addPrism(app, forgeHeater, 'ForgeChargeCeramicB', materials.stone, [0.72, 3.85, 0], 8, 0.42, 0.18);
  for (const [index, rotation] of [
    [1, [0, 0, 14] as Vec3Tuple],
    [2, [0, 90, 0] as Vec3Tuple],
    [3, [0, 0, -14] as Vec3Tuple],
    [4, [0, -90, 0] as Vec3Tuple],
  ] as Array<[number, Vec3Tuple]>) {
    addBox(forgeHeater, `ForgeHearthRib${index}`, materials.brass, [0, 3.2, 0], [0.16, 2.5, 3.3], rotation);
  }

  const heaterCore = forgeHeater.findByName('ForgeHeaterCore') as pc.Entity | null;
  if (heaterCore) {
    replaceRenderWithMesh(app, heaterCore, prismMesh(app, 10, 0.6, 0.9), materials.glow);
    heaterCore.setLocalPosition(0, 1.6, -1.5);
    heaterCore.setLocalEulerAngles(90, 0, 0);
  }

  for (const z of [15, 21, 27]) {
    const height = z === 15 ? 0.36 : z === 21 ? 0.6 : 0.96;
    addChamferedPrism(app, root, `TerracePlatform${z}`, materials.stoneDark, [0, -0.08, z], 18, 5.6, height, 0.3);
    addBeam(root, `TerraceRiser${z}`, materials.stone, [-8.6, z - 2.8], [8.6, z - 2.8], height + 0.08, 0.28, 0.34);
    addBeam(root, `TerraceWestRetaining${z}`, materials.stone, [-8.8, z], [-8.8, z + 5.6], height + 0.28, 0.56, 0.82);
    addBeam(root, `TerraceEastRetaining${z}`, materials.stone, [8.8, z], [8.8, z + 5.6], height + 0.28, 0.56, 0.82);
  }

  const dynamicWaterChannels: pc.Entity[] = [];
  const pumpChannel = terracesPump.findByName('TerracesWaterChannel') as pc.Entity | null;
  if (pumpChannel) {
    replaceRenderWithMesh(app, pumpChannel, chamferedPrismMesh(app, 3.2, 3.6, 0.12, 0.22), materials.water);
    pumpChannel.setLocalScale(1, 1, 1);
    dynamicWaterChannels.push(pumpChannel);
  }
  for (const [index, x] of [-5.2, 5.2].entries()) {
    for (const [levelIndex, z] of [15, 21, 27].entries()) {
      dynamicWaterChannels.push(
        addChamferedPrism(app, root, `TerraceWater${levelIndex + 1}${index === 0 ? 'West' : 'East'}`, materials.water, [x, 0.32 + levelIndex * 0.3, z], 4.2, 3.8, 0.1, 0.2),
      );
    }
  }
  dynamicWaterChannels.push(
    addChamferedPrism(app, root, 'TerraceWaterFeeder', materials.water, [0, 0.95, 18.5], 0.82, 6.6, 0.1, 0.12),
  );
  waterChannels.length = 0;
  waterChannels.push(...dynamicWaterChannels);

  addChamferedPrism(app, root, 'TerraceFeederAqueduct', materials.stone, [0, 0.78, 18.5], 1.45, 7.0, 0.34, 0.18);
  addPrism(app, root, 'TerraceSluiceWheel', materials.brass, [0, 1.62, 15.2], 10, 0.7, 0.16);
  addBeam(root, 'TerraceSluiceFrameWest', materials.brass, [-1.3, 13.7], [-1.3, 16.2], 1.2, 0.16, 0.16);
  addBeam(root, 'TerraceSluiceFrameEast', materials.brass, [1.3, 13.7], [1.3, 16.2], 1.2, 0.16, 0.16);

  const fuseRack = new pc.Entity('ForgeFuseRackAuthored');
  fuseRack.setLocalPosition(-8.5, 0, 8);
  root.addChild(fuseRack);
  addChamferedPrism(app, fuseRack, 'ForgeFuseRackBackplate', materials.stoneDark, [0, 1.8, 0], 2.1, 0.42, 3.8, 0.12);
  addBeam(fuseRack, 'ForgeFuseRackRailTop', materials.brass, [-0.72, -0.18], [0.72, -0.18], 3.1, 0.12, 0.12);
  addBeam(fuseRack, 'ForgeFuseRackRailBottom', materials.brass, [-0.72, 0.18], [0.72, 0.18], 0.55, 0.12, 0.12);
  for (const [index, x] of [-0.62, 0, 0.62].entries()) {
    addTaperedPrism(app, fuseRack, `ForgeFuseCartridgeAuthored${index + 1}`, materials.stone, [x, 1.8, 0], 8, 0.22, 0.22, 2.3);
    addRing(app, fuseRack, `ForgeFuseCollar${index + 1}`, materials.copper, [x, 1.8, 0], 8, 0.2, 0.3, 0.12);
  }

  addChamferedPrism(app, root, 'ForgeAnvilStand', materials.stoneDark, [-4.8, 0.4, -4], 1.8, 1.8, 0.8, 0.18);
  addPrism(app, root, 'ForgeAnvilBodyAuthored', materials.brass, [-4.8, 0.95, -4], 8, 0.72, 0.55);
  addTaperedPrism(app, root, 'ForgeAnvilHornAuthored', materials.copper, [-4.8, 1.0, -4.85], 8, 0.42, 0.08, 0.9);
  addChamferedPrism(app, root, 'ForgeQuenchBasin', materials.stoneDark, [-4.8, 0.45, 3.5], 2.0, 3.0, 0.9, 0.2);
  addChamferedPrism(app, root, 'ForgeQuenchWaterAuthored', materials.water, [-4.8, 0.94, 3.5], 1.5, 2.4, 0.08, 0.16);

  regionalMaterials.applyCeramicBySemanticName(forgeRoot);
  regionalMaterials.applyConductorsByName(root, [
    'ForgeAuthoredMainBus',
    'ForgeAuthoredForgeBranch',
    'ForgeAuthoredWorkshopBranch',
    'ForgeAuthoredPumpBranch',
  ], REGIONAL_MATERIAL_GRAMMAR.forgeBusCrossSection);
  regionalMaterials.applyWaterChannels(dynamicWaterChannels);
  batchStaticDetails(app, root, 'OhmdalForgeTerracesAuthoredDetails', 46, new Set(dynamicWaterChannels));
  createTerracePlanting(app, forgeRoot);
  createForgeLandscape(app, forgeRoot);
  return { root, dynamicWaterChannels };
}

function buildLighthouseDetails(
  app: pc.Application,
  materials: Arc1AuthoredDetailMaterials,
  regionalMaterials: RegionalMaterialGrammar,
  lighthouseRoot: pc.Entity,
  legacyRoot: pc.Entity,
  lighthouseBeacon: pc.Entity,
): pc.Entity {
  legacyRoot.enabled = false;
  hideVisual(lighthouseRoot, 'LighthouseWaterEdge');
  hideVisual(lighthouseRoot, 'LighthouseSignalBus');

  const root = new pc.Entity('LighthouseAuthoredDetailsRoot');
  lighthouseRoot.addChild(root);

  const beaconBase = lighthouseBeacon.findByName('LighthouseBeaconBase') as pc.Entity | null;
  if (beaconBase) {
    replaceRenderWithMesh(app, beaconBase, taperedPrismMesh(app, 8, 2.35, 2.05, 1.2), materials.stoneDark);
    beaconBase.setLocalPosition(0, 0, 0);
  }
  const beaconTower = lighthouseBeacon.findByName('LighthouseBeaconTower') as pc.Entity | null;
  if (beaconTower) {
    replaceRenderWithMesh(app, beaconTower, taperedPrismMesh(app, 8, 1.35, 1.0, 4.65), materials.stone);
    beaconTower.setLocalPosition(0, 1.2, 0);
  }
  const beaconCap = lighthouseBeacon.findByName('LighthouseBeaconCap') as pc.Entity | null;
  if (beaconCap) {
    replaceRenderWithMesh(app, beaconCap, ringMesh(app, 12, 1.02, 1.62, 0.22), materials.brass);
    beaconCap.setLocalPosition(0, 5.63, 0);
  }

  addRing(app, lighthouseBeacon, 'LighthouseLanternLowerRing', materials.brass, [0, 5.85, 0], 12, 1.22, 1.62, 0.18);
  addPrism(app, lighthouseBeacon, 'LighthouseFresnelLens', materials.water, [0, 6.05, 0], 12, 0.72, 0.9);
  addRing(app, lighthouseBeacon, 'LighthouseLanternUpperRing', materials.copper, [0, 6.78, 0], 12, 0.8, 1.48, 0.16);
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    addBox(
      lighthouseBeacon,
      `LighthouseLanternBrace${index + 1}`,
      materials.brass,
      [Math.cos(angle) * 1.38, 6.85, Math.sin(angle) * 1.38],
      [0.12, 2.0, 0.12],
      [0, (angle * 180) / Math.PI, 0],
    );
  }
  addTaperedPrism(app, lighthouseBeacon, 'LighthouseCupolaAuthored', materials.copper, [0, 7.0, 0], 12, 1.56, 0.48, 0.62);
  addPrism(app, lighthouseBeacon, 'LighthouseFinialAuthored', materials.brass, [0, 7.68, 0], 8, 0.18, 0.55);

  const panelBody = lighthouseRoot.findByName('LighthousePanelBody') as pc.Entity | null;
  if (panelBody) {
    replaceRenderWithMesh(app, panelBody, chamferedPrismMesh(app, 4.2, 1.2, 1.8, 0.16), materials.stoneDark);
    panelBody.setLocalPosition(0, 0, 0);
  }
  const panelFace = lighthouseRoot.findByName('LighthousePanelFace') as pc.Entity | null;
  if (panelFace) {
    replaceRenderWithMesh(app, panelFace, chamferedPrismMesh(app, 2.8, 0.12, 1.2, 0.05), materials.brass);
    panelFace.setLocalPosition(0, 0.45, -0.66);
  }
  addRing(app, root, 'LighthouseCalibrationDialRing', materials.copper, [0, 1.2, -0.88], 12, 0.48, 0.66, 0.12);
  addBeam(root, 'LighthouseCalibrationNeedle', materials.brass, [-0.42, -0.88], [0.28, -0.88], 1.34, 0.08, 0.08);

  addChamferedPrism(app, root, 'LighthouseQuayWallAuthored', materials.stone, [6.8, 0.45, 4], 1.55, 22, 0.9, 0.22);
  addChamferedPrism(app, root, 'LighthouseDockPierAuthored', materials.stone, [10.5, 0.42, 5], 6.4, 4.2, 0.84, 0.3);
  addChamferedPrism(app, root, 'LighthouseDockWater', materials.water, [11.6, 0.16, 4], 11.5, 25.5, 0.08, 0.4);
  addBeam(root, 'LighthouseShoreStepOne', materials.stoneDark, [7.55, 3.3], [9.0, 3.3], 0.24, 0.2, 1.2);
  addBeam(root, 'LighthouseShoreStepTwo', materials.stoneDark, [7.55, 5.2], [9.0, 5.2], 0.42, 0.2, 1.2);
  addPrism(app, root, 'LighthouseMooringBollardWest', materials.brass, [12.8, 0.9, 3.6], 8, 0.34, 0.8);
  addPrism(app, root, 'LighthouseMooringBollardEast', materials.brass, [12.8, 0.9, 6.4], 8, 0.34, 0.8);

  addBeam(root, 'LighthouseTransmissionBus', materials.copper, [-4, -9], [-4, 8], 5.25, 0.16, 0.22);
  addBeam(root, 'LighthouseTransmissionFeed', materials.copper, [-4, 8], [-1, 8], 5.25, 0.16, 0.22);
  for (const [index, z] of [-8, -4, 4, 8].entries()) {
    addBeam(root, `LighthouseWallBracket${index}`, materials.brass, [-14, z], [-4, z], 3.9, 0.16, 0.18);
    addPrism(app, root, `LighthouseBracketRiser${index}`, materials.brass, [-4, 3.98, z], 8, 0.13, 0.47);
    addPrism(app, root, `LighthouseCeramicStandoff${index}`, materials.stone, [-4, 4.45, z], 8, 0.3, 0.72);
  }

  regionalMaterials.applyCeramicBySemanticName(lighthouseRoot);
  regionalMaterials.applyConductorsByName(root, [
    'LighthouseTransmissionBus',
    'LighthouseTransmissionFeed',
  ]);
  for (const render of lighthouseRoot.findComponents('render') as pc.RenderComponent[]) {
    if (!/^LighthouseCeramicStandoff\d+$/.test(render.entity.name)) continue;
    const scale = render.entity.getLocalScale().clone();
    scale.x *= 0.72;
    // Preserve the contact height between riser, porcelain and conductor.
    scale.z *= 0.72;
    render.entity.setLocalScale(scale);
  }
  createLighthouseInfrastructurePolish(lighthouseRoot, materials);
  batchStaticDetails(app, root, 'OhmdalLighthouseAuthoredDetails', 47);
  return root;
}

export function buildArc1AuthoredDetails({
  app,
  materials,
  castleRoot,
  castleLegacyRoot,
  castleBranchIsolators,
  forgeTerracesRoot,
  forgeTerracesLegacyRoot,
  forgeHeater,
  terracesPump,
  terracesWaterChannels,
  lighthouseRoot,
  lighthouseLegacyRoot,
  lighthouseBeacon,
}: Arc1AuthoredDetailDependencies): Arc1AuthoredDetails {
  const regionalMaterials = createRegionalMaterialGrammar(app, materials);
  const castle = buildCastleDetails(app, materials, regionalMaterials, castleRoot, castleLegacyRoot, castleBranchIsolators);
  const forge = buildForgeDetails(app, materials, regionalMaterials, forgeTerracesRoot, forgeTerracesLegacyRoot, forgeHeater, terracesPump, terracesWaterChannels);
  const lighthouse = buildLighthouseDetails(app, materials, regionalMaterials, lighthouseRoot, lighthouseLegacyRoot, lighthouseBeacon);
  return {
    roots: { castle, forgeTerraces: forge.root, lighthouse },
    dynamicWaterChannels: forge.dynamicWaterChannels,
  };
}
