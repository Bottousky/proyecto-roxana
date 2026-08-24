import * as pc from 'playcanvas';

export interface ManantialShellMaterials {
  matMountain: pc.StandardMaterial;
  matMountainFar: pc.StandardMaterial;
  matStoneDark: pc.StandardMaterial;
  matWaterfall: pc.StandardMaterial;
  matBrass: pc.StandardMaterial;
  matCopperClean: pc.StandardMaterial;
}

export interface ManantialShellDependencies {
  app: pc.Application;
  plazaRoot: pc.Entity;
  materials: ManantialShellMaterials;
  probeTargets: Record<string, pc.Vec3>;
  addCollider: (x: number, z: number, w: number, d: number) => void;
}

export interface ManantialShellElements {
  mountainRoot: pc.Entity;
  waterfallMesh: pc.Entity;
  turbineMesh: pc.Entity;
}

export function buildManantialShell({
  app,
  plazaRoot,
  materials,
  probeTargets,
  addCollider,
}: ManantialShellDependencies): ManantialShellElements {
  const { matMountain, matMountainFar, matStoneDark, matWaterfall, matBrass, matCopperClean } = materials;

  const addMountainRidge = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    width: number,
    depth: number,
    heights: number[],
    material: pc.StandardMaterial,
  ) => {
    const positions: number[] = [];
    const indices: number[] = [];
    const bottom = -4;
    const frontZ = -depth / 2;
    const backZ = depth / 2;
    const last = heights.length - 1;

    for (let index = 0; index < heights.length; index += 1) {
      const x = -width / 2 + (width * index) / last;
      positions.push(x, bottom, frontZ, x, heights[index], frontZ);
      positions.push(x, bottom, backZ, x, heights[index] - 0.8, backZ);
    }

    const vertex = (index: number, back: boolean, top: boolean) => index * 4 + (back ? 2 : 0) + (top ? 1 : 0);
    for (let index = 0; index < last; index += 1) {
      const next = index + 1;
      const frontBottom = vertex(index, false, false);
      const frontTop = vertex(index, false, true);
      const nextFrontBottom = vertex(next, false, false);
      const nextFrontTop = vertex(next, false, true);
      const backBottom = vertex(index, true, false);
      const backTop = vertex(index, true, true);
      const nextBackBottom = vertex(next, true, false);
      const nextBackTop = vertex(next, true, true);

      indices.push(frontBottom, frontTop, nextFrontTop, frontBottom, nextFrontTop, nextFrontBottom);
      indices.push(backBottom, nextBackTop, backTop, backBottom, nextBackBottom, nextBackTop);
      indices.push(frontTop, backTop, nextBackTop, frontTop, nextBackTop, nextFrontTop);
    }

    const leftFrontBottom = vertex(0, false, false);
    const leftFrontTop = vertex(0, false, true);
    const leftBackBottom = vertex(0, true, false);
    const leftBackTop = vertex(0, true, true);
    const rightFrontBottom = vertex(last, false, false);
    const rightFrontTop = vertex(last, false, true);
    const rightBackBottom = vertex(last, true, false);
    const rightBackTop = vertex(last, true, true);
    indices.push(leftFrontBottom, leftBackTop, leftFrontTop, leftFrontBottom, leftBackBottom, leftBackTop);
    indices.push(rightFrontBottom, rightFrontTop, rightBackTop, rightFrontBottom, rightBackTop, rightBackBottom);

    const geometry = new pc.Geometry();
    geometry.positions = positions;
    geometry.indices = indices;
    geometry.normals = pc.calculateNormals(positions, indices);
    const mesh = pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
    const ridge = new pc.Entity(name);
    ridge.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, material, ridge)],
    });
    ridge.render!.castShadows = false;
    ridge.render!.receiveShadows = true;
    ridge.setPosition(...position);
    parent.addChild(ridge);
    return ridge;
  };

  // ========================================================
  // --- 7. MOUNTAIN & MANANTIAL HYDROELECTRIC (mountainRoot) -
  // ========================================================
  const mountainRoot = new pc.Entity('MountainRoot');
  app.root.addChild(mountainRoot);

  // Plaza-only scenic skirts close the floating slab at the north perimeter
  // while preserving a broad central opening toward the locked later region.
  const plazaPerimeterSkirtNear = new pc.Entity('PlazaPerimeterSkirtNear');
  plazaRoot.addChild(plazaPerimeterSkirtNear);
  addMountainRidge(plazaPerimeterSkirtNear, 'PlazaPerimeterSkirtNearWest', [-22, 0, 18], 34, 7, [1.8, 2.6, 2.2, 3.8, 3.1, 4.5, 3.4, 4.8, 3.2, 2.5, 1.9], matMountain);
  addMountainRidge(plazaPerimeterSkirtNear, 'PlazaPerimeterSkirtNearEast', [22, 0, 18], 34, 7, [2.1, 3.4, 2.8, 4.2, 3.5, 4.7, 3.6, 4.1, 2.9, 2.4, 1.8], matMountain);
  const plazaPerimeterSkirtFar = new pc.Entity('PlazaPerimeterSkirtFar');
  plazaRoot.addChild(plazaPerimeterSkirtFar);
  addMountainRidge(plazaPerimeterSkirtFar, 'PlazaPerimeterSkirtFarWest', [-27, 0, 29], 44, 9, [4.5, 6.2, 5.4, 7.8, 6.6, 8.2, 7.1, 8.8, 6.9, 5.8, 4.2], matMountainFar);
  addMountainRidge(plazaPerimeterSkirtFar, 'PlazaPerimeterSkirtFarEast', [27, 0, 29], 44, 9, [4.2, 5.8, 7.1, 8.5, 6.8, 8.1, 6.4, 7.6, 5.5, 6.0, 4.4], matMountainFar);

  // Mountain Gorge Ground Pathway
  const canyonGround = new pc.Entity('CanyonGround');
  canyonGround.addComponent('render', { type: 'box', material: matStoneDark });
  canyonGround.setPosition(0, 0.1, 26.0);
  canyonGround.setLocalScale(18.0, 0.4, 30.0);
  mountainRoot.addChild(canyonGround);

  // Layered low-poly ridges replace the two placeholder cones. The central
  // saddle keeps the distant hydraulic route legible without turning it into
  // a hard-edged sky cutout from the plaza.
  addMountainRidge(
    mountainRoot,
    'MountainRidgeFar',
    [0, 0, 49],
    62,
    10,
    [8, 12, 15, 13, 17, 14, 12, 15, 18, 16, 13, 17, 14, 11, 8],
    matMountainFar,
  );
  addMountainRidge(
    mountainRoot,
    'MountainRidgeNear',
    [0, 0, 37],
    48,
    8,
    [4, 7, 9, 8, 11, 9, 7, 10, 12, 10, 8, 11, 9, 6, 4],
    matMountain,
  );

  // Cascading mountain water follows the central saddle as a tapered ribbon.
  // Keeping it between the ridge layers removes the old hard-edged blue box
  // while preserving the distant hydraulic route from the plaza.
  const waterfallSections: Array<[number, number, number]> = [
    [14.5, 44, 0.65],
    [12, 42, 0.85],
    [9, 40, 0.7],
    [6, 38, 1.0],
    [4, 37, 0.85],
  ];
  const waterfallPositions: number[] = [];
  const waterfallIndices: number[] = [];
  for (const [y, z, halfWidth] of waterfallSections) {
    waterfallPositions.push(-halfWidth, y, z, halfWidth, y, z);
  }
  for (let index = 0; index < waterfallSections.length - 1; index += 1) {
    const left = index * 2;
    const right = left + 1;
    const nextLeft = left + 2;
    const nextRight = left + 3;
    waterfallIndices.push(left, right, nextRight, left, nextRight, nextLeft);
  }
  const waterfallGeometry = new pc.Geometry();
  waterfallGeometry.positions = waterfallPositions;
  waterfallGeometry.indices = waterfallIndices;
  waterfallGeometry.normals = pc.calculateNormals(waterfallPositions, waterfallIndices);
  const waterfallRibbonMesh = pc.Mesh.fromGeometry(app.graphicsDevice, waterfallGeometry);
  const waterfallMesh = new pc.Entity('MountainWaterfall');
  waterfallMesh.addComponent('render', {
    type: 'asset',
    meshInstances: [new pc.MeshInstance(waterfallRibbonMesh, matWaterfall, waterfallMesh)],
  });
  waterfallMesh.render!.castShadows = false;
  waterfallMesh.render!.receiveShadows = false;
  mountainRoot.addChild(waterfallMesh);

  // Hydroelectric Penstock Steel Pipes
  const penstockPipeL = new pc.Entity('PenstockPipeLeft');
  penstockPipeL.addComponent('render', { type: 'cylinder', material: matBrass });
  penstockPipeL.setPosition(-3.2, 9.5, 33.5);
  penstockPipeL.setEulerAngles(35, 0, 0);
  penstockPipeL.setLocalScale(1.0, 20.0, 1.0);
  mountainRoot.addChild(penstockPipeL);

  const penstockPipeR = new pc.Entity('PenstockPipeRight');
  penstockPipeR.addComponent('render', { type: 'cylinder', material: matBrass });
  penstockPipeR.setPosition(3.2, 9.5, 33.5);
  penstockPipeR.setEulerAngles(35, 0, 0);
  penstockPipeR.setLocalScale(1.0, 20.0, 1.0);
  mountainRoot.addChild(penstockPipeR);

  // Hydroelectric Powerhouse (Central Hidroeléctrica)
  const turbineMesh = new pc.Entity('HydroPowerhouse');
  turbineMesh.addComponent('render', { type: 'box', material: matStoneDark });
  turbineMesh.setPosition(0, 2.2, 24.0);
  turbineMesh.setLocalScale(9.0, 4.4, 6.0);
  mountainRoot.addChild(turbineMesh);

  const turbineRotor = new pc.Entity('TurbineRotor');
  turbineRotor.addComponent('render', { type: 'cylinder', material: matCopperClean });
  turbineRotor.setPosition(0, 2.5, 20.8);
  turbineRotor.setEulerAngles(90, 0, 0);
  turbineRotor.setLocalScale(3.2, 0.8, 3.2);
  mountainRoot.addChild(turbineRotor);

  // Manantial Survey Observation Monument
  const surveyMonument = new pc.Entity('SurveyMonument');
  surveyMonument.addComponent('render', { type: 'cylinder', material: matBrass });
  surveyMonument.setPosition(0, 0.6, 17.5);
  surveyMonument.setLocalScale(0.8, 1.2, 0.8);
  mountainRoot.addChild(surveyMonument);

  probeTargets['manantial_turbina_in'] = new pc.Vec3(0, 2.5, 20.8);
  probeTargets['manantial_survey'] = new pc.Vec3(0, 1.2, 17.5);
  addCollider(0, 24.0, 9.2, 6.2);
  addCollider(0, 17.5, 1.2, 1.2);

  return { mountainRoot, waterfallMesh, turbineMesh };
}
