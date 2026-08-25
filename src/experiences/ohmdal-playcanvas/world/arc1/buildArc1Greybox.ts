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
  addCollider: (x: number, z: number, w: number, d: number) => void;
}

export interface Arc1GreyboxElements {
  roots: Record<Arc1GreyboxZoneId, pc.Entity>;
  castleServiceLights: pc.Entity[];
  castleGate: pc.Entity;
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
  ) => addBox(parent, name, material, position, scale, false);

  const addConductor = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material = copper,
  ) => addBox(parent, name, material, position, scale, false);

  const addDistributionLoad = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    material: pc.StandardMaterial,
  ): pc.Entity => {
    const load = new pc.Entity(name);
    load.setLocalPosition(...position);
    parent.addChild(load);
    addBox(load, `${name}Base`, stoneDark, [0, 0.35, 0], [2.2, 0.7, 1.6]);
    addCylinder(load, `${name}Coil`, material, [0, 1.25, 0], [0.48, 0.7, 0.48]);
    addCylinder(load, `${name}Terminal`, brass, [0, 1.95, 0], [0.18, 0.12, 0.18]);
    return load;
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

  addBox(castleRoot, 'CastlePatioFloor', stone, [0, -0.12, 0], [28, 0.24, 30]);
  addBox(castleRoot, 'CastleWalkway', stoneDark, [0, 0.02, 0], [4.2, 0.08, 23]);
  addConductor(castleRoot, 'CastleMainBus', [0, 0.11, -0.2], [0.28, 0.12, 23], copper);
  addConductor(castleRoot, 'CastleBranchA', [-4.2, 0.14, 0], [4.2, 0.1, 0.22], copper);
  addConductor(castleRoot, 'CastleBranchB', [4.2, 0.14, 0], [4.2, 0.1, 0.22], copper);
  addConductor(castleRoot, 'CastleBranchC', [0, 0.17, 4.8], [0.22, 0.1, 4.8], copper);

  addWall(castleRoot, 'CastleWallWest', stoneDark, [-14, 2, 0], [0.5, 4, 30]);
  addWall(castleRoot, 'CastleWallEast', stoneDark, [14, 2, 0], [0.5, 4, 30]);
  addWall(castleRoot, 'CastleWallSouth', stoneDark, [0, 2, -15], [28, 4, 0.5]);
  addWall(castleRoot, 'CastleWallNorth', stoneDark, [0, 2, 15], [28, 4, 0.5]);

  const castlePanel = new pc.Entity('CastleDistributionPanel');
  castlePanel.setLocalPosition(0, 0, 0);
  castleRoot.addChild(castlePanel);
  addBox(castlePanel, 'CastlePanelBody', stoneDark, [0, 0.9, 0], [3.8, 1.8, 1.2]);
  addBox(castlePanel, 'CastlePanelFace', brass, [0, 1.05, -0.66], [2.5, 1.2, 0.12]);
  addCylinder(castlePanel, 'CastlePanelBusKnob', copper, [0, 1.05, -0.85], [0.28, 0.16, 0.28]);
  addConductor(castlePanel, 'CastlePanelInput', [0, 0.24, -1.5], [0.22, 0.08, 1.6], copper);

  addDistributionLoad(castleRoot, 'CastleServiceLoadA', [-6.2, 0, 0], copper);
  addDistributionLoad(castleRoot, 'CastleServiceLoadB', [6.2, 0, 0], brass);
  addDistributionLoad(castleRoot, 'CastleServiceLoadC', [0, 0, 5.8], copper);

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

  // Only the outer shell is solid. Entry, panel, loads and gate remain open to
  // the interaction ray/close-up layer and are therefore not collider targets.
  addCollider(46, 0, 0.5, 30);
  addCollider(74, 0, 0.5, 30);
  addCollider(60, -15, 28, 0.5);
  addCollider(60, 15, 28, 0.5);

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

  addWall(forgeTerracesRoot, 'ForgeTerracesWallWest', stoneDark, [-14, 2, 12], [0.5, 4, 48]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallEast', stoneDark, [14, 2, 12], [0.5, 4, 48]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallSouth', stoneDark, [0, 2, -12], [28, 4, 0.5]);
  addWall(forgeTerracesRoot, 'ForgeTerracesWallNorth', stoneDark, [0, 2, 36], [28, 4, 0.5]);

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

  probeTargets.forge_bus = new pc.Vec3(120, 1.1, -8);
  probeTargets.forge_heater = new pc.Vec3(124.2, 1.2, -8);
  probeTargets.terraces_pump = new pc.Vec3(120, 1.2, 16);

  addCollider(106, 4, 0.5, 48);
  addCollider(134, 4, 0.5, 48);
  addCollider(120, -20, 28, 0.5);
  addCollider(120, 28, 28, 0.5);

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
  addWall(lighthouseRoot, 'LighthouseWallWest', stoneDark, [-14, 2, 0], [0.5, 4, 30]);
  addWall(lighthouseRoot, 'LighthouseWallEast', stoneDark, [14, 2, 0], [0.5, 4, 30]);
  addWall(lighthouseRoot, 'LighthouseWallSouth', stoneDark, [0, 2, -15], [28, 4, 0.5]);
  addWall(lighthouseRoot, 'LighthouseWallNorth', stoneDark, [0, 2, 15], [28, 4, 0.5]);

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

  addCollider(166, 0, 0.5, 30);
  addCollider(194, 0, 0.5, 30);
  addCollider(180, -15, 28, 0.5);
  addCollider(180, 15, 28, 0.5);

  return {
    roots: {
      castle: castleRoot,
      'forge-terraces': forgeTerracesRoot,
      lighthouse: lighthouseRoot,
    },
    castleServiceLights,
    castleGate,
    forgeHeater,
    terracesPump,
    forgeProtectionLight,
    lighthouseBeacon,
    lighthouseSignal,
  };
}
