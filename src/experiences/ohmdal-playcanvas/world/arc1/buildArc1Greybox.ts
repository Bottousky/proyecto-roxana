import * as pc from 'playcanvas';

export type Arc1GreyboxZoneId = 'castle' | 'forge-terraces' | 'lighthouse';

export interface Arc1GreyboxMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  copper: pc.StandardMaterial;
  brass: pc.StandardMaterial;
  water: pc.StandardMaterial;
  glow: pc.StandardMaterial;
}

export interface Arc1GreyboxDependencies {
  app: pc.Application;
  materials: Arc1GreyboxMaterials;
  probeTargets: Record<string, pc.Vec3>;
  addCollider: (x: number, z: number, w: number, d: number, zone?: Arc1GreyboxZoneId, id?: string) => void;
}

export interface Arc1GreyboxElements {
  roots: Record<Arc1GreyboxZoneId, pc.Entity>;
  castleServiceLights: pc.Entity[];
  castleGate: pc.Entity;
  castleBranchIsolators: pc.Entity[];
  castleTripPin: pc.Entity;
  castleReturnLink: pc.Entity;
  castleEntranceGateRail: pc.Entity;
  forgeHeater: pc.Entity;
  terracesPump: pc.Entity;
  forgeProtectionLight: pc.Entity;
  lighthouseBeacon: pc.Entity;
  lighthouseSignal: pc.Entity;
}

type PrimitiveType = 'box' | 'cylinder' | 'sphere';

/**
 * Builds the late-Arco-I neutral blockout. The roots are deliberately dormant;
 * zone lifecycle and puzzle state decide when each root becomes active.
 */
export function buildArc1Greybox({
  app,
  materials,
  probeTargets,
  addCollider,
}: Arc1GreyboxDependencies): Arc1GreyboxElements {
  const { stone, stoneDark, copper, brass, water, glow } = materials;

  const addPrimitive = (
    parent: pc.Entity,
    name: string,
    type: PrimitiveType,
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
    castShadows = false,
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type, material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    if (entity.render) {
      entity.render.castShadows = castShadows;
      entity.render.receiveShadows = true;
    }
    parent.addChild(entity);
    return entity;
  };

  const addBox = (
    parent: pc.Entity,
    name: string,
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
    castShadows = false,
  ) => addPrimitive(parent, name, 'box', material, position, scale, castShadows);

  const addCylinder = (
    parent: pc.Entity,
    name: string,
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
    castShadows = false,
  ) => addPrimitive(parent, name, 'cylinder', material, position, scale, castShadows);

  const addSphere = (
    parent: pc.Entity,
    name: string,
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
    castShadows = false,
  ) => addPrimitive(parent, name, 'sphere', material, position, scale, castShadows);

  const addPointLight = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    color: pc.Color,
    range: number,
    intensity: number,
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('light', {
      type: 'point',
      color,
      range,
      intensity,
      castShadows: false,
    });
    entity.setLocalPosition(...position);
    parent.addChild(entity);
    // State systems wake these lights for a validated condition.
    if (entity.light) entity.light.enabled = false;
    return entity;
  };

  const addWall = (
    parent: pc.Entity,
    name: string,
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
  ) => addBox(parent, name, material, position, scale, true);

  const addConductor = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material = copper,
  ) => addBox(parent, name, material, position, scale);

  const addDistributionLoad = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    accentMaterial = brass,
  ) => {
    const root = new pc.Entity(name);
    root.setLocalPosition(...position);
    parent.addChild(root);
    addBox(root, `${name}Base`, stoneDark, [0, 0.45, 0], [2.4, 0.9, 2.4]);
    addCylinder(root, `${name}Core`, accentMaterial, [0, 1.25, 0], [1.1, 0.7, 1.1]);
    addSphere(root, `${name}Cap`, accentMaterial, [0, 1.75, 0], [0.8, 0.4, 0.8]);
    return root;
  };

  // -----------------------------------------------------------------------
  // G3 — Castle of the Network: one open patio, a distribution panel and
  // three readable service loads. The gate remains a visual hinge for the
  // state system and is intentionally not made into a blocking collider.
  // -----------------------------------------------------------------------
  const castleRoot = new pc.Entity('Arc1CastleGreyboxRoot');
  castleRoot.setPosition(60, 0, 0);
  castleRoot.enabled = false;
  app.root.addChild(castleRoot);

  const castleAuthoredRoot = new pc.Entity('CastleAuthoredSupportRoot');
  castleRoot.addChild(castleAuthoredRoot);

  addBox(castleRoot, 'CastlePatioFloor', stone, [0, -0.12, 0], [28, 0.24, 30]);
  addBox(castleRoot, 'CastleWalkway', stoneDark, [0, 0.02, 0], [4.2, 0.08, 23]);
  addConductor(castleRoot, 'CastleMainBus', [0, 0.11, -0.2], [0.28, 0.12, 23], copper);
  addConductor(castleRoot, 'CastleBranchA', [-4.2, 0.14, 0], [4.2, 0.1, 0.22], copper);
  addConductor(castleRoot, 'CastleBranchB', [4.2, 0.14, 0], [4.2, 0.1, 0.22], copper);
  addConductor(castleRoot, 'CastleBranchC', [0, 0.17, 4.8], [0.22, 0.1, 4.8], copper);

  addWall(castleRoot, 'CastleWallWest', stoneDark, [-14, 4, 0], [0.5, 8, 30]);
  addWall(castleRoot, 'CastleWallEast', stoneDark, [14, 4, 0], [0.5, 8, 30]);
  addWall(castleRoot, 'CastleWallSouthWest', stoneDark, [-9.25, 4, -15], [9.5, 8, 0.5]);
  addWall(castleRoot, 'CastleWallSouthEast', stoneDark, [9.25, 4, -15], [9.5, 8, 0.5]);
  addWall(castleRoot, 'CastleWallNorth', stoneDark, [0, 4, 15], [28, 8, 0.5]);

  // Enclosure: upper headers and roof framing beams to close sky voids
  addBox(castleAuthoredRoot, 'CastleRoofHeaderWest', stone, [-14, 7.8, 0], [1.2, 0.6, 30]);
  addBox(castleAuthoredRoot, 'CastleRoofHeaderEast', stone, [14, 7.8, 0], [1.2, 0.6, 30]);
  addBox(castleAuthoredRoot, 'CastleRoofHeaderNorth', stone, [0, 7.8, 15], [28, 0.6, 1.2]);
  addBox(castleAuthoredRoot, 'CastleRoofHeaderSouth', stone, [0, 7.8, -15], [28, 0.6, 1.2]);
  for (const z of [-12, -6, 0, 6, 12]) {
    addBox(castleAuthoredRoot, `CastleRoofTie${z}`, stoneDark, [0, 7.7, z], [27.6, 0.35, 0.45]);
  }
  addBox(castleAuthoredRoot, 'CastleSouthUpperLintel', stoneDark, [0, 6.0, -15], [9.5, 4.0, 0.5]);

  const castlePanel = new pc.Entity('CastleDistributionPanel');
  castlePanel.setLocalPosition(0, 0, 0);
  castleRoot.addChild(castlePanel);
  addBox(castlePanel, 'CastlePanelBody', stoneDark, [0, 0.9, 0], [3.8, 1.8, 1.2]);
  addBox(castlePanel, 'CastlePanelFace', brass, [0, 1.05, -0.66], [2.5, 1.2, 0.12]);
  addCylinder(castlePanel, 'CastlePanelBusKnob', copper, [0, 1.05, -0.85], [0.28, 0.16, 0.28]);
  addConductor(castlePanel, 'CastlePanelInput', [0, 0.24, -1.5], [0.22, 0.08, 1.6], copper);
  const castleTripPin = addCylinder(castlePanel, 'CastlePanelTripPin', copper, [0.72, 1.12, -0.85], [0.14, 0.12, 0.14]);
  const castleReturnLink = addBox(castlePanel, 'CastlePanelReturnLink', copper, [-0.72, 0.72, -0.85], [0.18, 0.72, 0.12]);

  addDistributionLoad(castleRoot, 'CastleServiceLoadA', [-6.2, 0, 0], copper);
  addDistributionLoad(castleRoot, 'CastleServiceLoadB', [6.2, 0, 0], brass);
  addDistributionLoad(castleRoot, 'CastleServiceLoadC', [0, 0, 5.8], copper);

  // A4 support authoring turns the patio into a civic distribution hall while
  // preserving the accepted open floor and all interaction coordinates.
  for (const z of [-10, 0, 10]) {
    addBox(castleAuthoredRoot, `CastlePillarWest${z}`, stone, [-10.5, 3.5, z], [1.6, 7, 1.6]);
    addBox(castleAuthoredRoot, `CastlePillarEast${z}`, stone, [10.5, 3.5, z], [1.6, 7, 1.6]);
    addBox(castleAuthoredRoot, `CastleHallLintel${z}`, stone, [0, 7.0, z], [22.6, 1.0, 1.4]);
  }
  addBox(castleAuthoredRoot, 'CastleMaintenanceBalconyWest', stone, [-9.1, 2.35, 0], [2.0, 0.35, 23]);
  addBox(castleAuthoredRoot, 'CastleMaintenanceBalconyEast', stone, [9.1, 2.35, 0], [2.0, 0.35, 23]);
  addBox(castleAuthoredRoot, 'CastleBalconyRailWest', brass, [-8.0, 3.15, 0], [0.18, 1.35, 22]);
  addBox(castleAuthoredRoot, 'CastleBalconyRailEast', brass, [8.0, 3.15, 0], [0.18, 1.35, 22]);

  addBox(castleAuthoredRoot, 'CastleRaisedMainBus', copper, [0, 5.25, 0], [0.42, 0.28, 22]);
  addBox(castleAuthoredRoot, 'CastleRaisedBranchA', copper, [-4.3, 5.25, 0], [8.6, 0.28, 0.34]);
  addBox(castleAuthoredRoot, 'CastleRaisedBranchB', copper, [4.3, 5.25, 0], [8.6, 0.28, 0.34]);
  addBox(castleAuthoredRoot, 'CastleRaisedBranchC', copper, [0, 5.25, 5.2], [0.34, 0.28, 10.4]);
  const insulatorPositions: Array<[number, number, number]> = [
    [-8.0, 4.35, 0], [-3.0, 4.35, 0], [3.0, 4.35, 0], [8.0, 4.35, 0],
    [0, 4.35, -8], [0, 4.35, 5.5], [0, 4.35, 9.5],
  ];
  insulatorPositions.forEach((position, index) => {
    addCylinder(castleAuthoredRoot, `CastleBusInsulator${index + 1}`, stone, position, [0.42, 1.45, 0.42]);
  });

  const castleBranchIsolators = [
    addBox(castleRoot, 'CastleBranchIsolatorA', copper, [-5.0, 1.35, 0], [2.2, 0.16, 0.22]),
    addBox(castleRoot, 'CastleBranchIsolatorB', copper, [5.0, 1.35, 0], [2.2, 0.16, 0.22]),
    addBox(castleRoot, 'CastleBranchIsolatorC', copper, [0, 1.35, 5.0], [0.22, 0.16, 2.2]),
  ];
  addBox(castleAuthoredRoot, 'CastleServiceBayWest', stoneDark, [-9.0, 1.5, 0], [2.3, 3.0, 4.2]);
  addBox(castleAuthoredRoot, 'CastleServiceBayEast', stoneDark, [9.0, 1.5, 0], [2.3, 3.0, 4.2]);
  addBox(castleAuthoredRoot, 'CastleServiceBayNorth', stoneDark, [0, 1.5, 10.5], [4.2, 3.0, 2.3]);
  addBox(castleAuthoredRoot, 'CastleEntrancePostWest', stone, [-4.2, 3.0, -11.5], [1.0, 6.0, 1.0]);
  addBox(castleAuthoredRoot, 'CastleEntrancePostEast', stone, [4.2, 3.0, -11.5], [1.0, 6.0, 1.0]);
  addBox(castleAuthoredRoot, 'CastleEntranceHeader', stone, [0, 6.0, -11.5], [9.4, 1.0, 1.0]);
  const castleEntranceGateRail = addBox(castleRoot, 'CastleEntranceGateRail', brass, [0, 2.0, -11.5], [7.2, 0.28, 0.24]);

  const castleServiceLights: pc.Entity[] = [];
  const createCastleServiceLight = (
    name: string,
    position: [number, number, number],
    color: pc.Color,
    withPointLight: boolean,
  ): pc.Entity => {
    const marker = new pc.Entity(name);
    marker.setLocalPosition(...position);
    castleRoot.addChild(marker);
    addCylinder(marker, `${name}Housing`, brass, [0, 0.75, 0], [0.42, 0.16, 0.42]);
    const lens = addSphere(marker, `${name}Lens`, glow, [0, 1.05, 0], [0.28, 0.28, 0.28]);
    lens.enabled = false;
    if (withPointLight) addPointLight(marker, `${name}Point`, [0, 1.05, 0], color, 5.5, 0.8);
    return marker;
  };
  // Three service markers are visible, while only two carry point lights.
  castleServiceLights.push(
    createCastleServiceLight('CastleServiceLightA', [-6.2, 0, 0], new pc.Color(0.9, 0.66, 0.3), true),
    createCastleServiceLight('CastleServiceLightB', [6.2, 0, 0], new pc.Color(0.42, 0.7, 0.92), true),
    createCastleServiceLight('CastleServiceLightC', [0, 0, 5.8], new pc.Color(0.66, 0.86, 0.62), false),
  );

  const castleGate = new pc.Entity('CastleExitGate');
  castleGate.setLocalPosition(0, 0, 8);
  castleRoot.addChild(castleGate);
  addBox(castleGate, 'CastleGateHeader', stoneDark, [0, 3.2, 0], [7.2, 0.55, 0.5], true);
  addBox(castleGate, 'CastleGatePostLeft', stoneDark, [-3.2, 1.6, 0], [0.55, 3.2, 0.5], true);
  addBox(castleGate, 'CastleGatePostRight', stoneDark, [3.2, 1.6, 0], [0.55, 3.2, 0.5], true);
  addConductor(castleGate, 'CastleGateRail', [0, 1.6, -0.3], [5.6, 0.22, 0.18], brass);

  probeTargets.castle_bus_in = new pc.Vec3(60, 1.1, -8);
  probeTargets.castle_service_a = new pc.Vec3(53.8, 1.15, 0);
  probeTargets.castle_service_b = new pc.Vec3(66.2, 1.15, 0);
  probeTargets.castle_service_c = new pc.Vec3(60, 1.15, 5.8);

  // Outer shell is solid in Castle zone. Interaction panels and walkways remain navigable.
  addCollider(46, 0, 0.5, 30, 'castle', 'CastleWallWest');
  addCollider(74, 0, 0.5, 30, 'castle', 'CastleWallEast');
  addCollider(60, -15, 28, 0.5, 'castle', 'CastleWallSouth');
  addCollider(60, 15, 28, 0.5, 'castle', 'CastleWallNorth');

  const castleStaticBatch = app.batcher.addGroup('OhmdalCastleStaticArt', false, 45);
  for (const render of castleAuthoredRoot.findComponents('render') as pc.RenderComponent[]) {
    render.batchGroupId = castleStaticBatch.id;
  }
  app.batcher.generate([castleStaticBatch.id]);

  // -----------------------------------------------------------------------
  // G4 — Forge and Terraces share one loaded zone. Stepped slabs distinguish
  // the irrigation route from the Forge floor without creating a corridor.
  // -----------------------------------------------------------------------
  const forgeTerracesRoot = new pc.Entity('Arc1ForgeTerracesGreyboxRoot');
  forgeTerracesRoot.setPosition(120, 0, -8);
  forgeTerracesRoot.enabled = false;
  app.root.addChild(forgeTerracesRoot);

  addBox(forgeTerracesRoot, 'ForgeTerracesFloor', stone, [0, -0.12, 12], [28, 0.24, 48]);
  addBox(forgeTerracesRoot, 'ForgeFloorPad', stoneDark, [0, 0.02, 0], [12, 0.08, 10]);
  addBox(forgeTerracesRoot, 'TerracesLevelOne', stoneDark, [0, 0.18, 15], [18, 0.36, 6]);
  addBox(forgeTerracesRoot, 'TerracesLevelTwo', stoneDark, [0, 0.48, 21], [18, 0.6, 6]);
  addBox(forgeTerracesRoot, 'TerracesLevelThree', stoneDark, [0, 0.78, 27], [18, 0.96, 6]);
  addConductor(forgeTerracesRoot, 'ForgeTerracesMainBus', [0, 0.14, 12], [0.3, 0.12, 35], copper);
  addConductor(forgeTerracesRoot, 'ForgeBranchLeft', [-4.4, 0.18, 0], [4.4, 0.1, 0.22], copper);
  addConductor(forgeTerracesRoot, 'TerracesPumpBranch', [0, 0.23, 24], [5.4, 0.1, 0.22], brass);
  addBox(forgeTerracesRoot, 'TerracesStepOne', stone, [0, 0.22, 18], [4, 0.22, 1.2]);
  addBox(forgeTerracesRoot, 'TerracesStepTwo', stone, [0, 0.52, 24], [4, 0.22, 1.2]);

  addWall(forgeTerracesRoot, 'ForgeTerracesWallWest', stoneDark, [-14, 3.5, 12], [0.5, 7, 48]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallEast', stoneDark, [14, 3.5, 12], [0.5, 7, 48]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallSouth', stoneDark, [0, 3.5, -12], [28, 7, 0.5]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallNorth', stoneDark, [0, 3.5, 36], [28, 7, 0.5]);

  const forgePanel = new pc.Entity('ForgeDistributionPanel');
  forgePanel.setLocalPosition(0, 0, 8);
  forgeTerracesRoot.addChild(forgePanel);
  addBox(forgePanel, 'ForgePanelBody', stoneDark, [0, 0.9, 0], [4.2, 1.8, 1.2]);
  addBox(forgePanel, 'ForgePanelFace', brass, [0, 1.05, -0.66], [2.8, 1.2, 0.12]);
  addCylinder(forgePanel, 'ForgePanelBreaker', copper, [0, 1.08, -0.86], [0.3, 0.2, 0.3]);
  addConductor(forgePanel, 'ForgePanelInput', [0, 0.24, -1.65], [0.24, 0.08, 1.8], copper);

  const forgeHeater = new pc.Entity('ForgeHeater');
  forgeHeater.setLocalPosition(4.2, 0, 0);
  forgeTerracesRoot.addChild(forgeHeater);
  addBox(forgeHeater, 'ForgeHeaterBase', stoneDark, [0, 0.5, 0], [4.4, 1, 3.2], true);
  addCylinder(forgeHeater, 'ForgeHeaterBody', copper, [0, 1.55, 0], [1.25, 1.7, 1.25], true);
  addCylinder(forgeHeater, 'ForgeHeaterRing', brass, [0, 2.35, 0], [1.55, 0.16, 1.55]);
  const forgeHeaterCore = addSphere(forgeHeater, 'ForgeHeaterCore', glow, [0, 2.55, 0], [0.6, 0.6, 0.6]);
  forgeHeaterCore.enabled = false;

  const forgeProtectionLight = addPointLight(
    forgeTerracesRoot,
    'ForgeProtectionLight',
    [-4.5, 2.5, 0],
    new pc.Color(0.92, 0.38, 0.18),
    6,
    1.0,
  );

  const terracesPump = new pc.Entity('TerracesPump');
  terracesPump.setLocalPosition(0, 0, 24);
  forgeTerracesRoot.addChild(terracesPump);
  addBox(terracesPump, 'TerracesPumpBase', stoneDark, [0, 0.5, 0], [4.6, 1, 3.2]);
  addCylinder(terracesPump, 'TerracesPumpHousing', brass, [0, 1.45, 0], [1.1, 1.55, 1.1], true);
  addCylinder(terracesPump, 'TerracesPumpWheel', copper, [0, 1.65, -0.9], [1.3, 0.22, 1.3]);
  addBox(terracesPump, 'TerracesWaterChannel', water, [0, 0.46, 2.25], [3.2, 0.12, 3.6]);

  const terracesExit = new pc.Entity('TerracesExitMarker');
  terracesExit.setLocalPosition(0, 0, 32);
  forgeTerracesRoot.addChild(terracesExit);
  addBox(terracesExit, 'TerracesExitHeader', stoneDark, [0, 3.2, 0], [7.2, 0.55, 0.5], true);
  addBox(terracesExit, 'TerracesExitPostLeft', stoneDark, [-3.2, 1.6, 0], [0.55, 3.2, 0.5], true);
  addBox(terracesExit, 'TerracesExitPostRight', stoneDark, [3.2, 1.6, 0], [0.55, 3.2, 0.5], true);
  addConductor(terracesExit, 'TerracesExitRail', [0, 1.6, -0.3], [5.6, 0.22, 0.18], brass);

  // -----------------------------------------------------------------------
  // Forge + Terrazas Authored Support Pass: industrial smelting hearth,
  // distribution standoffs, tools/quenching vat, roof trusses, and stepped
  // aqueduct/irrigation flumes.
  // -----------------------------------------------------------------------
  const forgeTerracesAuthoredRoot = new pc.Entity('ForgeTerracesAuthoredSupportRoot');
  forgeTerracesRoot.addChild(forgeTerracesAuthoredRoot);

  // Forge Foundry: Smelting Hood, Chimney Flue and Flue Bracing
  addBox(forgeTerracesAuthoredRoot, 'ForgeSmeltingHood', stoneDark, [4.2, 3.8, 0], [3.2, 0.4, 3.0], true);
  addCylinder(forgeTerracesAuthoredRoot, 'ForgeChimneyFlue', copper, [4.2, 5.5, 0], [1.1, 3.2, 1.1], true);
  addBox(forgeTerracesAuthoredRoot, 'ForgeHearthFlueBrace', brass, [4.2, 4.4, 0], [2.2, 0.2, 2.2]);

  // Main Bus Standoffs & Ceramic Insulators
  addCylinder(forgeTerracesAuthoredRoot, 'ForgeBusStandoffA', stoneDark, [0, 0.6, -4], [0.35, 0.8, 0.35]);
  addCylinder(forgeTerracesAuthoredRoot, 'ForgeBusStandoffB', stoneDark, [0, 0.6, 4], [0.35, 0.8, 0.35]);
  addCylinder(forgeTerracesAuthoredRoot, 'ForgeInsulatorCapA', brass, [0, 1.05, -4], [0.45, 0.16, 0.45]);
  addCylinder(forgeTerracesAuthoredRoot, 'ForgeInsulatorCapB', brass, [0, 1.05, 4], [0.45, 0.16, 0.45]);

  // Foundry Workstation: Anvil Block, Quenching Vat, Tool Rack
  addBox(forgeTerracesAuthoredRoot, 'ForgeAnvilStand', stoneDark, [6.5, 0.4, -4.5], [1.2, 0.8, 1.2], true);
  addBox(forgeTerracesAuthoredRoot, 'ForgeAnvilHead', copper, [6.5, 0.95, -4.5], [1.6, 0.35, 0.8], true);
  addBox(forgeTerracesAuthoredRoot, 'ForgeQuenchingTrough', stoneDark, [6.8, 0.4, 3.5], [1.8, 0.8, 3.2], true);
  addBox(forgeTerracesAuthoredRoot, 'ForgeQuenchingWater', water, [6.8, 0.72, 3.5], [1.5, 0.1, 2.9]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeToolRack', stoneDark, [-6.5, 1.5, -4.0], [0.3, 2.2, 3.6]);

  // Foundry Roof Trusses & Enclosure Headers
  addBox(forgeTerracesAuthoredRoot, 'ForgeRoofTrussWest', stoneDark, [-13.6, 6.6, 0], [0.6, 0.5, 24]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeRoofTrussEast', stoneDark, [13.6, 6.6, 0], [0.6, 0.5, 24]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeRoofTieSouth', stoneDark, [0, 6.8, -11.5], [27, 0.4, 0.6]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeRoofTieMid', stoneDark, [0, 6.8, 0], [27, 0.4, 0.6]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeRoofTieNorth', stoneDark, [0, 6.8, 10.5], [27, 0.4, 0.6]);
  addBox(forgeTerracesAuthoredRoot, 'ForgeClerestoryHeader', stoneDark, [0, 6.9, -0.5], [8.0, 0.35, 22]);

  // Agricultural Terraces: Elevated Aqueduct & Pillar Arches
  addBox(forgeTerracesAuthoredRoot, 'AqueductPillarWest', stoneDark, [-9.5, 2.5, 20], [1.4, 5.0, 1.4], true);
  addBox(forgeTerracesAuthoredRoot, 'AqueductPillarEast', stoneDark, [9.5, 2.5, 20], [1.4, 5.0, 1.4], true);
  addBox(forgeTerracesAuthoredRoot, 'AqueductArchLintel', stone, [0, 4.8, 20], [20, 0.6, 1.6], true);
  addBox(forgeTerracesAuthoredRoot, 'AqueductWaterChannel', water, [0, 5.05, 20], [18, 0.25, 1.2]);

  // Stepped Retaining Wall Buttresses & Irrigation Flumes
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel1Left', stoneDark, [-9.2, 0.35, 15], [0.8, 0.7, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel1Right', stoneDark, [9.2, 0.35, 15], [0.8, 0.7, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel2Left', stoneDark, [-9.2, 0.65, 21], [0.8, 0.9, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel2Right', stoneDark, [9.2, 0.65, 21], [0.8, 0.9, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel3Left', stoneDark, [-9.2, 0.95, 27], [0.8, 1.1, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceButtressLevel3Right', stoneDark, [9.2, 0.95, 27], [0.8, 1.1, 1.6]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceIrrigationPlotLeft', stoneDark, [-6.0, 0.22, 18], [5.2, 0.1, 4.8]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceIrrigationPlotRight', stoneDark, [6.0, 0.22, 18], [5.2, 0.1, 4.8]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceWaterTroughLeft', water, [-6.0, 0.26, 18], [4.8, 0.08, 0.5]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceWaterTroughRight', water, [6.0, 0.26, 18], [4.8, 0.08, 0.5]);

  // Stairway Railings & Handrails
  addBox(forgeTerracesAuthoredRoot, 'TerraceStairRailLeft', brass, [-2.2, 0.7, 21], [0.15, 0.8, 12]);
  addBox(forgeTerracesAuthoredRoot, 'TerraceStairRailRight', brass, [2.2, 0.7, 21], [0.15, 0.8, 12]);

  const forgeTerracesStaticBatch = app.batcher.addGroup('OhmdalForgeTerracesStaticArt', false, 45);
  for (const render of forgeTerracesAuthoredRoot.findComponents('render') as pc.RenderComponent[]) {
    render.batchGroupId = forgeTerracesStaticBatch.id;
  }
  app.batcher.generate([forgeTerracesStaticBatch.id]);

  probeTargets.forge_bus = new pc.Vec3(120, 1.1, -8);
  probeTargets.forge_heater = new pc.Vec3(124.2, 1.2, -8);
  probeTargets.terraces_pump = new pc.Vec3(120, 1.2, 16);

  addCollider(106, 4, 0.5, 48, 'forge-terraces', 'ForgeTerracesWallWest');
  addCollider(134, 4, 0.5, 48, 'forge-terraces', 'ForgeTerracesWallEast');
  addCollider(120, -20, 28, 0.5, 'forge-terraces', 'ForgeTerracesWallSouth');
  addCollider(120, 28, 28, 0.5, 'forge-terraces', 'ForgeTerracesWallNorth');

  // -----------------------------------------------------------------------
  // G5/G6 — Lighthouse and return marker. The beacon is physical geometry;
  // its lamp/signal stay dormant until calibration is accepted by the system.
  // -----------------------------------------------------------------------
  const lighthouseRoot = new pc.Entity('Arc1LighthouseGreyboxRoot');
  lighthouseRoot.setPosition(180, 0, 0);
  lighthouseRoot.enabled = false;
  app.root.addChild(lighthouseRoot);

  addBox(lighthouseRoot, 'LighthouseShoreFloor', stone, [0, -0.12, 0], [28, 0.24, 30]);
  addBox(lighthouseRoot, 'LighthousePath', stoneDark, [0, 0.02, 0], [4.2, 0.08, 23]);
  addConductor(lighthouseRoot, 'LighthouseSignalBus', [0, 0.11, 0], [0.28, 0.12, 23], copper);
  addBox(lighthouseRoot, 'LighthouseWaterEdge', water, [9, 0.02, 5], [8, 0.08, 20]);
  addWall(lighthouseRoot, 'LighthouseWallWest', stoneDark, [-14, 3.5, 0], [0.5, 7, 30]);
  addWall(lighthouseRoot, 'LighthouseWallEast', stoneDark, [14, 3.5, 0], [0.5, 7, 30]);
  addWall(lighthouseRoot, 'LighthouseWallSouth', stoneDark, [0, 3.5, -15], [28, 7, 0.5]);
  addWall(lighthouseRoot, 'LighthouseWallNorth', stoneDark, [0, 3.5, 15], [28, 7, 0.5]);

  const lighthousePanel = new pc.Entity('LighthouseCalibrationPanel');
  lighthousePanel.setLocalPosition(0, 0, 0);
  lighthouseRoot.addChild(lighthousePanel);
  addBox(lighthousePanel, 'LighthousePanelBody', stoneDark, [0, 0.9, 0], [4.2, 1.8, 1.2]);
  addBox(lighthousePanel, 'LighthousePanelFace', brass, [0, 1.05, -0.66], [2.8, 1.2, 0.12]);
  addCylinder(lighthousePanel, 'LighthouseReferenceDial', copper, [0, 1.1, -0.86], [0.46, 0.2, 0.46]);
  addConductor(lighthousePanel, 'LighthousePanelInput', [0, 0.24, -1.65], [0.24, 0.08, 1.8], copper);

  const lighthouseBeacon = new pc.Entity('LighthouseBeacon');
  lighthouseBeacon.setLocalPosition(0, 0, 8);
  lighthouseRoot.addChild(lighthouseBeacon);
  addCylinder(lighthouseBeacon, 'LighthouseBeaconBase', stoneDark, [0, 0.9, 0], [3.8, 1.8, 3.8]);
  addCylinder(lighthouseBeacon, 'LighthouseBeaconTower', brass, [0, 3.5, 0], [1.8, 5.2, 1.8], true);
  addCylinder(lighthouseBeacon, 'LighthouseBeaconCap', copper, [0, 6.25, 0], [2.2, 0.35, 2.2]);
  const lighthouseLamp = addSphere(lighthouseBeacon, 'LighthouseBeaconLamp', glow, [0, 6.65, 0], [0.65, 0.65, 0.65]);
  lighthouseLamp.enabled = false;
  addPointLight(
    lighthouseBeacon,
    'LighthouseBeaconPoint',
    [0, 6.65, 0],
    new pc.Color(0.72, 0.86, 1.0),
    10,
    1.5,
  );

  const lighthouseSignal = new pc.Entity('LighthouseSignal');
  lighthouseSignal.setLocalPosition(0, 5.7, 8);
  lighthouseSignal.enabled = false;
  lighthouseRoot.addChild(lighthouseSignal);
  addBox(lighthouseSignal, 'LighthouseSignalBar', glow, [0, 0, 0], [9, 0.16, 0.16]);

  const lighthouseReturn = new pc.Entity('LighthouseReturnMarker');
  lighthouseReturn.setLocalPosition(0, 0, 14);
  lighthouseRoot.addChild(lighthouseReturn);
  addCylinder(lighthouseReturn, 'LighthouseReturnPost', brass, [0, 0.7, 0], [0.35, 1.4, 0.35]);
  addBox(lighthouseReturn, 'LighthouseReturnPlate', stoneDark, [0, 0.05, 0], [2.2, 0.1, 1.2]);

  probeTargets.lighthouse_bus = new pc.Vec3(180, 1.1, -8);
  probeTargets.lighthouse_reference = new pc.Vec3(180, 1.2, 0);
  probeTargets.lighthouse_beacon = new pc.Vec3(180, 1.25, 8);

  addCollider(166, 0, 0.5, 30, 'lighthouse', 'LighthouseWallWest');
  addCollider(194, 0, 0.5, 30, 'lighthouse', 'LighthouseWallEast');
  addCollider(180, -15, 28, 0.5, 'lighthouse', 'LighthouseWallSouth');
  addCollider(180, 15, 28, 0.5, 'lighthouse', 'LighthouseWallNorth');

  return {
    roots: {
      castle: castleRoot,
      'forge-terraces': forgeTerracesRoot,
      lighthouse: lighthouseRoot,
    },
    castleServiceLights,
    castleGate,
    castleBranchIsolators,
    castleTripPin,
    castleReturnLink,
    castleEntranceGateRail,
    forgeHeater,
    terracesPump,
    forgeProtectionLight,
    lighthouseBeacon,
    lighthouseSignal,
  };
}
