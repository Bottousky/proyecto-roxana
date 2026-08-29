import * as pc from 'playcanvas';

export interface ManantialShellMaterials {
  matMountain: pc.StandardMaterial;
  matMountainFar: pc.StandardMaterial;
  matStone: pc.StandardMaterial;
  matStoneDark: pc.StandardMaterial;
  matWater: pc.StandardMaterial;
  matWaterfall: pc.StandardMaterial;
  matBrass: pc.StandardMaterial;
  matCopperClean: pc.StandardMaterial;
}

export interface ManantialShellDependencies {
  app: pc.Application;
  plazaRoot: pc.Entity;
  materials: ManantialShellMaterials;
  probeTargets: Record<string, pc.Vec3>;
  addCollider: (x: number, z: number, w: number, d: number, id?: string) => void;
}

export interface ManantialShellElements {
  mountainRoot: pc.Entity;
  gameplayRoot: pc.Entity;
  waterfallMesh: pc.Entity;
  turbineMesh: pc.Entity;
  scenicTurbineRotor: pc.Entity;
  turbineRotor: pc.Entity;
  intakeGate: pc.Entity;
  exciterBridge: pc.Entity;
  outputBreaker: pc.Entity;
  generatorLight: pc.Entity;
  sluiceLeaf: pc.Entity;
  dormantWater: pc.Entity;
  activeWater: pc.Entity;
  activationTrace: pc.Entity;
  restoredOutputMarker: pc.Entity;
}

export function buildManantialShell({
  app,
  plazaRoot,
  materials,
  probeTargets,
  addCollider,
}: ManantialShellDependencies): ManantialShellElements {
  const { matMountain, matMountainFar, matStone, matStoneDark, matWater, matWaterfall, matBrass, matCopperClean } = materials;

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

  // The accepted Plaza sees only the scenic mountain shell. G1 gameplay is a
  // progression-gated child so the dormant Plaza baseline remains unchanged.
  const gameplayRoot = new pc.Entity('ManantialGameplayRoot');
  gameplayRoot.enabled = false;
  mountainRoot.addChild(gameplayRoot);

  // A3 authored support stays behind the Manantial lifecycle seam. The
  // accepted Plaza keeps rendering only the established scenic mountain shell.
  const authoredStaticRoot = new pc.Entity('ManantialAuthoredStaticRoot');
  gameplayRoot.addChild(authoredStaticRoot);

  const addBox = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: pc.StandardMaterial,
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.render!.castShadows = false;
    entity.render!.receiveShadows = true;
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    parent.addChild(entity);
    return entity;
  };

  const addCylinder = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    rotation: [number, number, number],
    material: pc.StandardMaterial,
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'cylinder', material });
    entity.render!.castShadows = false;
    entity.render!.receiveShadows = true;
    entity.setLocalPosition(...position);
    entity.setLocalEulerAngles(...rotation);
    entity.setLocalScale(...scale);
    parent.addChild(entity);
    return entity;
  };

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

  const scenicTurbineRotor = new pc.Entity('ScenicTurbineRotor');
  scenicTurbineRotor.addComponent('render', { type: 'cylinder', material: matCopperClean });
  scenicTurbineRotor.setPosition(0, 2.5, 20.8);
  scenicTurbineRotor.setEulerAngles(90, 0, 0);
  scenicTurbineRotor.setLocalScale(3.2, 0.8, 3.2);
  mountainRoot.addChild(scenicTurbineRotor);

  const addControl = (
    name: string,
    position: [number, number, number],
    material: pc.StandardMaterial,
  ) => {
    const pedestal = new pc.Entity(`${name}Pedestal`);
    pedestal.addComponent('render', { type: 'box', material: matStoneDark });
    pedestal.setPosition(position[0], 0.6, position[2]);
    pedestal.setLocalScale(1.2, 1.2, 1.2);
    gameplayRoot.addChild(pedestal);

    const control = new pc.Entity(name);
    control.addComponent('render', { type: 'box', material });
    control.setPosition(...position);
    control.setLocalScale(0.7, 0.32, 0.34);
    gameplayRoot.addChild(control);
    return control;
  };

  const intakeGate = addControl('ManantialIntakeGate', [-4.2, 1.35, 18.4], matBrass);
  const exciterBridge = addControl('ManantialExciterBridge', [4.2, 1.35, 18.4], matCopperClean);
  const outputBreaker = addControl('ManantialOutputBreaker', [2.2, 1.35, 16.0], matBrass);

  const generatorLight = new pc.Entity('ManantialGeneratorIndicator');
  generatorLight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.72, 0.24),
    intensity: 0,
    range: 7,
    castShadows: false,
  });
  generatorLight.setPosition(0, 3.0, 20.6);
  gameplayRoot.addChild(generatorLight);

  // Pale-stone headworks make the water route and machine support one readable
  // civic mechanism. These pieces enrich the validated route without moving
  // any gameplay anchor, collider or control.
  addBox(authoredStaticRoot, 'ManantialHeadworksApron', [0, 0.45, 24.4], [15.2, 0.7, 14.2], matStone);
  addBox(authoredStaticRoot, 'ManantialRetainingWest', [-7.2, 2.5, 25.0], [1.0, 4.8, 15.0], matStone);
  addBox(authoredStaticRoot, 'ManantialRetainingEast', [7.2, 2.5, 25.0], [1.0, 4.8, 15.0], matStone);
  addBox(authoredStaticRoot, 'ManantialHeadwall', [0, 3.8, 31.7], [15.2, 6.8, 1.2], matStone);
  addBox(authoredStaticRoot, 'ManantialHeadwallOpeningLintel', [0, 6.9, 30.8], [6.8, 0.8, 1.0], matStoneDark);

  // Headrace and tailrace expose the actual water path instead of relying on
  // a blue decorative surface. State-specific water meshes are kept out of
  // static batching and toggled from the simulation.
  addBox(authoredStaticRoot, 'ManantialHeadraceBed', [-4.2, 1.0, 25.7], [4.0, 0.35, 10.8], matStoneDark);
  addBox(authoredStaticRoot, 'ManantialHeadraceWest', [-6.15, 1.65, 25.7], [0.35, 1.6, 10.8], matStone);
  addBox(authoredStaticRoot, 'ManantialHeadraceEast', [-2.25, 1.65, 25.7], [0.35, 1.6, 10.8], matStone);
  addBox(authoredStaticRoot, 'ManantialTailraceBed', [0, 0.82, 17.7], [5.0, 0.25, 5.0], matStoneDark);

  const dormantWater = addBox(gameplayRoot, 'ManantialDormantWater', [-4.2, 1.35, 26.0], [3.25, 0.08, 9.2], matWater);
  const activeWater = addBox(gameplayRoot, 'ManantialActiveWater', [-4.2, 1.43, 23.6], [3.1, 0.10, 13.8], matWaterfall);
  activeWater.enabled = false;

  // The sluice leaf is physically attached to the intake control. It moves
  // vertically with gate state; the small control box remains the interaction
  // affordance at its validated position.
  addBox(authoredStaticRoot, 'ManantialSluiceFrameWest', [-5.75, 3.1, 20.6], [0.45, 4.2, 0.6], matStone);
  addBox(authoredStaticRoot, 'ManantialSluiceFrameEast', [-2.65, 3.1, 20.6], [0.45, 4.2, 0.6], matStone);
  addBox(authoredStaticRoot, 'ManantialSluiceCrossbeam', [-4.2, 5.05, 20.6], [3.55, 0.45, 0.7], matStone);
  const sluiceLeaf = addBox(gameplayRoot, 'ManantialSluiceLeaf', [-4.2, 2.45, 20.55], [2.75, 2.65, 0.34], matBrass);

  // The existing turbine remains the gameplay-driven rotor. A compact stator,
  // shaft, maintenance platform and outgoing bus make its electrical path
  // readable while preserving the approved silhouette and scale.
  addCylinder(authoredStaticRoot, 'ManantialGeneratorStator', [0, 2.5, 20.85], [3.2, 0.95, 3.2], [90, 0, 0], matStoneDark);
  addCylinder(authoredStaticRoot, 'ManantialGeneratorEndCap', [0, 2.5, 20.34], [2.82, 0.18, 2.82], [90, 0, 0], matCopperClean);
  const turbineRotor = addCylinder(gameplayRoot, 'TurbineRotor', [0, 2.5, 20.18], [2.35, 0.32, 2.35], [90, 0, 0], matCopperClean);
  addCylinder(authoredStaticRoot, 'ManantialGeneratorShaft', [0, 2.5, 18.9], [0.38, 2.4, 0.38], [90, 0, 0], matBrass);
  addBox(authoredStaticRoot, 'ManantialMeasurementPlatform', [4.7, 1.65, 18.8], [4.6, 0.32, 4.2], matStone);
  addBox(authoredStaticRoot, 'ManantialPlatformRailNorth', [4.7, 2.55, 20.75], [4.6, 1.45, 0.15], matBrass);
  addBox(authoredStaticRoot, 'ManantialPlatformRailEast', [6.9, 2.55, 18.8], [0.15, 1.45, 4.0], matBrass);
  addBox(authoredStaticRoot, 'ManantialOutgoingBusLeft', [2.85, 3.45, 18.0], [0.18, 0.18, 4.7], matCopperClean);
  addBox(authoredStaticRoot, 'ManantialOutgoingBusRight', [4.0, 3.45, 18.0], [0.18, 0.18, 4.7], matCopperClean);
  for (const [index, x] of [2.85, 4.0].entries()) {
    addCylinder(authoredStaticRoot, `ManantialCeramicInsulator${index + 1}`, [x, 2.85, 16.0], [0.38, 0.85, 0.38], [0, 0, 0], matStone);
  }

  const activationMaterial = new pc.StandardMaterial();
  activationMaterial.diffuse = new pc.Color(0.95, 0.55, 0.12);
  activationMaterial.emissive = new pc.Color(0.95, 0.30, 0.04);
  activationMaterial.emissiveIntensity = 1.2;
  activationMaterial.update();
  const activationTrace = addCylinder(gameplayRoot, 'ManantialActivationTrace', [2.2, 2.0, 16.0], [0.22, 0.65, 0.22], [0, 0, 0], activationMaterial);
  activationTrace.render!.receiveShadows = false;
  activationTrace.enabled = false;

  const restoredOutputMarker = addBox(gameplayRoot, 'ManantialRestoredOutputMarker', [3.42, 3.48, 15.7], [1.45, 0.24, 0.24], matCopperClean);
  restoredOutputMarker.render!.receiveShadows = false;
  restoredOutputMarker.enabled = false;

  const manantialStaticBatch = app.batcher.addGroup('OhmdalManantialStaticArt', false, 40);
  for (const render of authoredStaticRoot.findComponents('render') as pc.RenderComponent[]) {
    render.batchGroupId = manantialStaticBatch.id;
  }
  app.batcher.generate([manantialStaticBatch.id]);

  probeTargets['manantial_generator_out'] = new pc.Vec3(2.2, 1.35, 16.0);
  probeTargets['manantial_exciter'] = new pc.Vec3(4.2, 1.35, 18.4);

  // Manantial Survey Observation Monument
  const surveyMonument = new pc.Entity('SurveyMonument');
  surveyMonument.addComponent('render', { type: 'cylinder', material: matBrass });
  surveyMonument.setPosition(0, 0.6, 17.5);
  surveyMonument.setLocalScale(0.8, 1.2, 0.8);
  mountainRoot.addChild(surveyMonument);

  probeTargets['manantial_turbina_in'] = new pc.Vec3(0, 2.5, 20.8);
  probeTargets['manantial_survey'] = new pc.Vec3(0, 1.2, 17.5);
  addCollider(0, 24.0, 9.2, 6.2, 'manantial.powerhouse');
  addCollider(0, 17.5, 1.2, 1.2, 'manantial.survey-monument');
  addCollider(-7.2, 25.0, 1.0, 15.0, 'manantial.retaining-west');
  addCollider(7.2, 25.0, 1.0, 15.0, 'manantial.retaining-east');
  addCollider(-4.9, 31.7, 4.6, 1.2, 'manantial.headwall-west');
  addCollider(4.9, 31.7, 4.6, 1.2, 'manantial.headwall-east');

  return {
    mountainRoot,
    gameplayRoot,
    waterfallMesh,
    turbineMesh,
    scenicTurbineRotor,
    turbineRotor,
    intakeGate,
    exciterBridge,
    outputBreaker,
    generatorLight,
    sluiceLeaf,
    dormantWater,
    activeWater,
    activationTrace,
    restoredOutputMarker,
  };
}
