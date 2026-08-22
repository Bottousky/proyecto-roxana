import * as pc from 'playcanvas';

export interface PlayCanvasWorldElements {
  app: pc.Application;
  cameraEntity: pc.Entity;
  playerEntity: pc.Entity;
  viewmodelRoot: pc.Entity;
  viewmodelNeedle: pc.Entity;
  viewmodelFilament: pc.Entity;
  waterEntity: pc.Entity;
  solenoidGate: pc.Entity;
  copperJumper: pc.Entity;
  corrosionMesh: pc.Entity;
  relayLight: pc.Entity;
  ohmEntity: pc.Entity;
  ohmFilamentLight: pc.Entity;
  eddaEntity: pc.Entity;
  lumenNpcEntity: pc.Entity;
  workshopInteriorRoot: pc.Entity;
  plazaRoot: pc.Entity;
  mountainRoot: pc.Entity;
  waterfallMesh: pc.Entity;
  turbineMesh: pc.Entity;
  omegaSymbolEntity: pc.Entity;
  gateLightLeft: pc.Entity;
  gateLightRight: pc.Entity;
  probeTargets: Record<string, pc.Vec3>;
  colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[];
}

export function buildPlayCanvasOhmdalWorld(canvas: HTMLCanvasElement): PlayCanvasWorldElements {
  const app = new pc.Application(canvas, {
    elementInput: new pc.ElementInput(canvas),
    keyboard: new pc.Keyboard(window),
    mouse: new pc.Mouse(canvas),
    touch: pc.platform.touch ? new pc.TouchDevice(canvas) : undefined,
    graphicsDeviceOptions: {
      preferWebGpu: true,
      antialias: true,
    },
  });

  app.start();
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  const colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  const probeTargets: Record<string, pc.Vec3> = {};

  const addCollider = (x: number, z: number, w: number, d: number) => {
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };

  // --- 1. Materials (PBR) ---
  const matStone = new pc.StandardMaterial();
  matStone.diffuse = new pc.Color(0.55, 0.5, 0.44);
  matStone.useMetalness = true;
  matStone.gloss = 0.15;
  matStone.metalness = 0.05;
  matStone.update();

  const matStoneDark = new pc.StandardMaterial();
  matStoneDark.diffuse = new pc.Color(0.35, 0.3, 0.26);
  matStoneDark.useMetalness = true;
  matStoneDark.gloss = 0.1;
  matStoneDark.metalness = 0.05;
  matStoneDark.update();

  const matMountain = new pc.StandardMaterial();
  matMountain.diffuse = new pc.Color(0.28, 0.26, 0.25);
  matMountain.useMetalness = true;
  matMountain.gloss = 0.08;
  matMountain.metalness = 0.02;
  matMountain.update();

  const matCopperClean = new pc.StandardMaterial();
  matCopperClean.diffuse = new pc.Color(0.85, 0.52, 0.28);
  matCopperClean.emissive = new pc.Color(0.9, 0.45, 0.1);
  matCopperClean.emissiveIntensity = 0.3;
  matCopperClean.useMetalness = true;
  matCopperClean.metalness = 0.9;
  matCopperClean.gloss = 0.68;
  matCopperClean.update();

  const matCopperOxide = new pc.StandardMaterial();
  matCopperOxide.diffuse = new pc.Color(0.32, 0.6, 0.48); // Verdigris green
  matCopperOxide.useMetalness = true;
  matCopperOxide.gloss = 0.2;
  matCopperOxide.metalness = 0.4;
  matCopperOxide.update();

  const matBrass = new pc.StandardMaterial();
  matBrass.diffuse = new pc.Color(0.86, 0.68, 0.26);
  matBrass.useMetalness = true;
  matBrass.metalness = 0.88;
  matBrass.gloss = 0.72;
  matBrass.update();

  const matGlowGold = new pc.StandardMaterial();
  matGlowGold.diffuse = new pc.Color(1.0, 0.82, 0.35);
  matGlowGold.emissive = new pc.Color(1.0, 0.75, 0.2);
  matGlowGold.emissiveIntensity = 1.6;
  matGlowGold.useMetalness = true;
  matGlowGold.metalness = 0.8;
  matGlowGold.gloss = 0.8;
  matGlowGold.update();

  const matWood = new pc.StandardMaterial();
  matWood.diffuse = new pc.Color(0.34, 0.24, 0.16);
  matWood.useMetalness = true;
  matWood.gloss = 0.25;
  matWood.update();

  const matWoodDark = new pc.StandardMaterial();
  matWoodDark.diffuse = new pc.Color(0.22, 0.15, 0.1);
  matWoodDark.useMetalness = true;
  matWoodDark.gloss = 0.2;
  matWoodDark.update();

  const matWater = new pc.StandardMaterial();
  matWater.diffuse = new pc.Color(0.12, 0.52, 0.68);
  matWater.opacity = 0.82;
  matWater.blendType = pc.BLEND_NORMAL;
  matWater.useMetalness = true;
  matWater.gloss = 0.94;
  matWater.metalness = 0.1;
  matWater.update();

  const matWaterfall = new pc.StandardMaterial();
  matWaterfall.diffuse = new pc.Color(0.25, 0.7, 0.88);
  matWaterfall.emissive = new pc.Color(0.15, 0.45, 0.65);
  matWaterfall.emissiveIntensity = 0.4;
  matWaterfall.opacity = 0.75;
  matWaterfall.blendType = pc.BLEND_NORMAL;
  matWaterfall.useMetalness = true;
  matWaterfall.gloss = 0.95;
  matWaterfall.update();

  const matEddaCoat = new pc.StandardMaterial();
  matEddaCoat.diffuse = new pc.Color(0.58, 0.32, 0.18);
  matEddaCoat.useMetalness = true;
  matEddaCoat.gloss = 0.2;
  matEddaCoat.update();

  const matEddaHair = new pc.StandardMaterial();
  matEddaHair.diffuse = new pc.Color(0.22, 0.12, 0.08);
  matEddaHair.useMetalness = true;
  matEddaHair.gloss = 0.3;
  matEddaHair.update();

  const matLumenApron = new pc.StandardMaterial();
  matLumenApron.diffuse = new pc.Color(0.42, 0.38, 0.32);
  matLumenApron.useMetalness = true;
  matLumenApron.gloss = 0.2;
  matLumenApron.update();

  const matSkin = new pc.StandardMaterial();
  matSkin.diffuse = new pc.Color(0.86, 0.72, 0.62);
  matSkin.useMetalness = true;
  matSkin.gloss = 0.25;
  matSkin.update();

  // --- 2. Lighting & Environment ---
  app.scene.ambientLight = new pc.Color(0.3, 0.24, 0.2);

  const sunEntity = new pc.Entity('Sun');
  sunEntity.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1.0, 0.82, 0.58),
    intensity: 2.2,
    castShadows: true,
    shadowBias: 0.05,
    shadowDistance: 60,
    shadowResolution: 1024,
  });
  sunEntity.setEulerAngles(48, -32, 0);
  app.root.addChild(sunEntity);

  const fillEntity = new pc.Entity('SkyFill');
  fillEntity.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.42, 0.58, 0.8),
    intensity: 0.7,
  });
  fillEntity.setEulerAngles(-40, 145, 0);
  app.root.addChild(fillEntity);

  // --- 3. First-Person Player & Camera Rig ---
  const playerEntity = new pc.Entity('Player');
  playerEntity.setPosition(0, 1.68, -8.0);
  app.root.addChild(playerEntity);

  const cameraEntity = new pc.Entity('Camera');
  cameraEntity.addComponent('camera', {
    clearColor: new pc.Color(0.12, 0.1, 0.09),
    fov: 72,
    nearClip: 0.05,
    farClip: 160,
    toneMapping: pc.TONEMAP_ACES,
  });
  playerEntity.addChild(cameraEntity);

  const flashEntity = new pc.Entity('InspectionBeam');
  flashEntity.addComponent('light', {
    type: 'spot',
    color: new pc.Color(1.0, 0.94, 0.84),
    intensity: 1.4,
    range: 14,
    innerConeAngle: 18,
    outerConeAngle: 34,
  });
  cameraEntity.addChild(flashEntity);

  // --- 4. Diegetic Handheld Galvanoscope Viewmodel ---
  const viewmodelRoot = new pc.Entity('GalvanoscopeViewmodel');
  viewmodelRoot.setLocalPosition(0.36, -0.32, -0.6);
  viewmodelRoot.setLocalEulerAngles(8, -15, 4);
  cameraEntity.addChild(viewmodelRoot);

  const vmBox = new pc.Entity('VM_Box');
  vmBox.addComponent('render', { type: 'box', material: matWood });
  vmBox.setLocalScale(0.24, 0.32, 0.08);
  viewmodelRoot.addChild(vmBox);

  const vmBezel = new pc.Entity('VM_Bezel');
  vmBezel.addComponent('render', { type: 'box', material: matBrass });
  vmBezel.setLocalPosition(0, 0, 0.04);
  vmBezel.setLocalScale(0.26, 0.34, 0.02);
  viewmodelRoot.addChild(vmBezel);

  const viewmodelNeedle = new pc.Entity('VM_Needle');
  viewmodelNeedle.addComponent('render', { type: 'cone', material: matCopperClean });
  viewmodelNeedle.setLocalPosition(0, 0.02, 0.055);
  viewmodelNeedle.setLocalScale(0.008, 0.09, 0.008);
  viewmodelNeedle.setLocalEulerAngles(0, 0, 60);
  viewmodelRoot.addChild(viewmodelNeedle);

  const viewmodelFilament = new pc.Entity('VM_Filament');
  viewmodelFilament.addComponent('render', { type: 'cylinder', material: matCopperClean });
  viewmodelFilament.setLocalPosition(-0.07, -0.09, 0.06);
  viewmodelFilament.setLocalScale(0.012, 0.06, 0.012);
  viewmodelRoot.addChild(viewmodelFilament);

  // ==========================================
  // --- 5. OUTDOOR PLAZA SCENE (plazaRoot) ---
  // ==========================================
  const plazaRoot = new pc.Entity('PlazaRoot');
  app.root.addChild(plazaRoot);

  // Main Flagstone Ground
  const ground = new pc.Entity('PlazaGround');
  ground.addComponent('render', { type: 'box', material: matStone });
  ground.setPosition(0, -0.15, 0);
  ground.setLocalScale(36, 0.3, 30);
  plazaRoot.addChild(ground);

  // The Ancient Institute Portal (South Entrance)
  const portalColL = new pc.Entity('PortalColL');
  portalColL.addComponent('render', { type: 'cylinder', material: matStoneDark });
  portalColL.setPosition(-2.4, 2.2, -11.0);
  portalColL.setLocalScale(0.9, 4.4, 0.9);
  plazaRoot.addChild(portalColL);

  const portalColR = new pc.Entity('PortalColR');
  portalColR.addComponent('render', { type: 'cylinder', material: matStoneDark });
  portalColR.setPosition(2.4, 2.2, -11.0);
  portalColR.setLocalScale(0.9, 4.4, 0.9);
  plazaRoot.addChild(portalColR);

  const portalLintel = new pc.Entity('PortalLintel');
  portalLintel.addComponent('render', { type: 'box', material: matStone });
  portalLintel.setPosition(0, 4.6, -11.0);
  portalLintel.setLocalScale(5.8, 0.8, 1.2);
  plazaRoot.addChild(portalLintel);

  probeTargets['portal_pos'] = new pc.Vec3(0.9, 1.6, -10.8);
  probeTargets['portal_neg'] = new pc.Vec3(-0.9, 1.6, -10.8);
  addCollider(0, -11.0, 5.8, 1.8);

  // --- Central Ohm Dais & Ohm Automaton Entity ---
  const dais = new pc.Entity('OhmDais');
  dais.addComponent('render', { type: 'cylinder', material: matStoneDark });
  dais.setPosition(0, 0.25, -2.0);
  dais.setLocalScale(5.6, 0.5, 5.6);
  plazaRoot.addChild(dais);

  const ohmEntity = new pc.Entity('OhmAutomaton');
  ohmEntity.setPosition(0, 0.5, -2.0);
  plazaRoot.addChild(ohmEntity);

  const ohmPedestal = new pc.Entity('OhmPedestal');
  ohmPedestal.addComponent('render', { type: 'cylinder', material: matBrass });
  ohmPedestal.setPosition(0, 0.4, 0);
  ohmPedestal.setLocalScale(1.1, 0.8, 1.1);
  ohmEntity.addChild(ohmPedestal);

  const ohmTorso = new pc.Entity('OhmTorso');
  ohmTorso.addComponent('render', { type: 'box', material: matCopperClean });
  ohmTorso.setPosition(0, 1.1, 0);
  ohmTorso.setLocalScale(0.65, 0.7, 0.5);
  ohmEntity.addChild(ohmTorso);

  const ohmCoreMesh = new pc.Entity('OhmCoreFilament');
  ohmCoreMesh.addComponent('render', { type: 'cylinder', material: matGlowGold });
  ohmCoreMesh.setPosition(0, 1.1, 0.26);
  ohmCoreMesh.setLocalScale(0.18, 0.35, 0.18);
  ohmEntity.addChild(ohmCoreMesh);

  const ohmHead = new pc.Entity('OhmHead');
  ohmHead.addComponent('render', { type: 'box', material: matBrass });
  ohmHead.setPosition(0, 1.7, 0);
  ohmHead.setLocalScale(0.45, 0.4, 0.42);
  ohmEntity.addChild(ohmHead);

  const ohmEye = new pc.Entity('OhmEye');
  ohmEye.addComponent('render', { type: 'cylinder', material: matGlowGold });
  ohmEye.setPosition(0, 1.7, 0.22);
  ohmEye.setEulerAngles(90, 0, 0);
  ohmEye.setLocalScale(0.15, 0.08, 0.15);
  ohmEntity.addChild(ohmEye);

  const ohmFilamentLight = new pc.Entity('OhmFilamentLight');
  ohmFilamentLight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.75, 0.25),
    intensity: 0.0,
    range: 6.0,
  });
  ohmFilamentLight.setPosition(0, 1.3, 0);
  ohmEntity.addChild(ohmFilamentLight);

  probeTargets['ohm_terminal_pos'] = new pc.Vec3(0.35, 0.9, -1.75);
  probeTargets['ohm_terminal_neg'] = new pc.Vec3(-0.35, 0.9, -1.75);
  addCollider(0, -2.0, 2.2, 2.2);

  // --- Edda NPC Entity (Near Portal) ---
  const eddaEntity = new pc.Entity('EddaNPC');
  eddaEntity.setPosition(1.8, 0, -8.0);
  plazaRoot.addChild(eddaEntity);

  const eddaBody = new pc.Entity('EddaBody');
  eddaBody.addComponent('render', { type: 'cylinder', material: matEddaCoat });
  eddaBody.setPosition(0, 0.85, 0);
  eddaBody.setLocalScale(0.45, 1.1, 0.45);
  eddaEntity.addChild(eddaBody);

  const eddaHead = new pc.Entity('EddaHead');
  eddaHead.addComponent('render', { type: 'cylinder', material: matSkin });
  eddaHead.setPosition(0, 1.55, 0);
  eddaHead.setLocalScale(0.3, 0.32, 0.3);
  eddaEntity.addChild(eddaHead);

  const eddaHair = new pc.Entity('EddaHair');
  eddaHair.addComponent('render', { type: 'cylinder', material: matEddaHair });
  eddaHair.setPosition(0, 1.68, -0.05);
  eddaHair.setLocalScale(0.34, 0.22, 0.36);
  eddaEntity.addChild(eddaHair);

  // --- Lumen's Workshop Exterior (West Building) ---
  const workshopBldg = new pc.Entity('WorkshopBldg');
  workshopBldg.addComponent('render', { type: 'box', material: matStoneDark });
  workshopBldg.setPosition(-10.5, 2.5, -4.0);
  workshopBldg.setLocalScale(6.0, 5.0, 7.5);
  plazaRoot.addChild(workshopBldg);

  const workshopRoof = new pc.Entity('WorkshopRoof');
  workshopRoof.addComponent('render', { type: 'cone', material: matWoodDark });
  workshopRoof.setPosition(-10.5, 5.8, -4.0);
  workshopRoof.setEulerAngles(0, 45, 0);
  workshopRoof.setLocalScale(7.5, 2.2, 8.5);
  plazaRoot.addChild(workshopRoof);

  const workshopDoorArch = new pc.Entity('WorkshopDoorArch');
  workshopDoorArch.addComponent('render', { type: 'box', material: matWood });
  workshopDoorArch.setPosition(-7.4, 1.4, -4.0);
  workshopDoorArch.setLocalScale(0.4, 2.8, 2.2);
  plazaRoot.addChild(workshopDoorArch);

  const workshopLantern = new pc.Entity('WorkshopLantern');
  workshopLantern.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.7, 0.3),
    intensity: 1.8,
    range: 6.0,
  });
  workshopLantern.setPosition(-7.1, 2.8, -4.0);
  plazaRoot.addChild(workshopLantern);
  addCollider(-10.5, -4.0, 6.2, 7.6);

  // --- Sacred Bell of Continuity (West Plaza) ---
  const bellGantry = new pc.Entity('BellGantry');
  bellGantry.addComponent('render', { type: 'box', material: matWood });
  bellGantry.setPosition(-5.2, 3.6, 2.4);
  bellGantry.setLocalScale(2.4, 0.3, 0.4);
  plazaRoot.addChild(bellGantry);

  const bell = new pc.Entity('Bell');
  bell.addComponent('render', { type: 'cylinder', material: matBrass });
  bell.setPosition(-5.2, 2.6, 2.4);
  bell.setLocalScale(0.8, 1.1, 0.8);
  plazaRoot.addChild(bell);

  const relayLight = new pc.Entity('RelayLight');
  relayLight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.65, 0.2),
    intensity: 0.6,
    range: 4.5,
  });
  relayLight.setPosition(-5.2, 1.0, 2.8);
  plazaRoot.addChild(relayLight);

  probeTargets['rele_bobina_in'] = new pc.Vec3(-5.2, 0.6, 2.8);
  addCollider(-5.2, 2.4, 2.4, 2.0);

  // --- Sacred Fountain of Ohm (East Plaza) ---
  const fountainBasin = new pc.Entity('FountainBasin');
  fountainBasin.addComponent('render', { type: 'cylinder', material: matStoneDark });
  fountainBasin.setPosition(5.5, 0.4, 3.8);
  fountainBasin.setLocalScale(5.8, 0.8, 5.8);
  plazaRoot.addChild(fountainBasin);

  const waterEntity = new pc.Entity('FountainWater');
  waterEntity.addComponent('render', { type: 'cylinder', material: matWater });
  waterEntity.setPosition(5.5, 0.68, 3.8);
  waterEntity.setLocalScale(5.0, 0.05, 5.0);
  plazaRoot.addChild(waterEntity);

  probeTargets['fuente_motor_in'] = new pc.Vec3(5.5, 0.8, 3.8);
  addCollider(5.5, 3.8, 5.8, 5.8);

  // --- The 40-Year Mural (South-East) ---
  const mural = new pc.Entity('MuralWall');
  mural.addComponent('render', { type: 'box', material: matStoneDark });
  mural.setPosition(7.8, 1.6, -4.2);
  mural.setLocalScale(4.0, 3.2, 1.0);
  plazaRoot.addChild(mural);
  addCollider(7.8, -4.2, 4.2, 1.6);

  // --- Conduits, Jumper & Corrosion ---
  const copperJumper = new pc.Entity('CopperJumper');
  copperJumper.addComponent('render', { type: 'box', material: matCopperClean });
  copperJumper.setPosition(-0.9, 0.06, 1.5);
  copperJumper.setLocalScale(0.24, 0.06, 1.0);
  copperJumper.enabled = false;
  plazaRoot.addChild(copperJumper);

  probeTargets['retorno_brecha_a'] = new pc.Vec3(-0.9, 0.1, 2.0);
  probeTargets['retorno_brecha_b'] = new pc.Vec3(-0.9, 0.1, 1.0);

  const corrosionMesh = new pc.Entity('CorrosionJoint');
  corrosionMesh.addComponent('render', { type: 'box', material: matCopperOxide });
  corrosionMesh.setPosition(-0.9, 0.07, -4.0);
  corrosionMesh.setLocalScale(0.4, 0.08, 0.8);
  plazaRoot.addChild(corrosionMesh);

  probeTargets['retorno_oxido'] = new pc.Vec3(-0.9, 0.1, -4.0);
  probeTargets['ida_norte'] = new pc.Vec3(0.9, 0.1, -8.0);
  probeTargets['ida_centro'] = new pc.Vec3(0.9, 0.1, -2.0);
  probeTargets['retorno_sur'] = new pc.Vec3(-0.9, 0.1, 7.0);

  // --- THE GREAT GATE OF OHM (Ω) (North Exit) ---
  const gateLeft = new pc.Entity('GatePylonLeft');
  gateLeft.addComponent('render', { type: 'box', material: matStoneDark });
  gateLeft.setPosition(-3.2, 3.8, 11.5);
  gateLeft.setLocalScale(2.2, 7.6, 2.4);
  plazaRoot.addChild(gateLeft);

  const gateRight = new pc.Entity('GatePylonRight');
  gateRight.addComponent('render', { type: 'box', material: matStoneDark });
  gateRight.setPosition(3.2, 3.8, 11.5);
  gateRight.setLocalScale(2.2, 7.6, 2.4);
  plazaRoot.addChild(gateRight);

  const gateLintel = new pc.Entity('GateLintel');
  gateLintel.addComponent('render', { type: 'box', material: matStone });
  gateLintel.setPosition(0, 6.6, 11.5);
  gateLintel.setLocalScale(8.6, 1.8, 2.6);
  plazaRoot.addChild(gateLintel);

  // Monumental Ω (Ohm) Brass Symbol
  const omegaSymbolEntity = new pc.Entity('MonumentalOmegaSymbol');
  omegaSymbolEntity.setPosition(0, 6.6, 10.1);
  plazaRoot.addChild(omegaSymbolEntity);

  const omegaArch = new pc.Entity('OmegaArch');
  omegaArch.addComponent('render', { type: 'cylinder', material: matBrass });
  omegaArch.setEulerAngles(90, 0, 0);
  omegaArch.setLocalScale(1.8, 0.15, 1.8);
  omegaSymbolEntity.addChild(omegaArch);

  const omegaHole = new pc.Entity('OmegaHole');
  omegaHole.addComponent('render', { type: 'cylinder', material: matStone });
  omegaHole.setEulerAngles(90, 0, 0);
  omegaHole.setLocalScale(1.1, 0.18, 1.1);
  omegaSymbolEntity.addChild(omegaHole);

  const omegaLeftFoot = new pc.Entity('OmegaLeftFoot');
  omegaLeftFoot.addComponent('render', { type: 'box', material: matBrass });
  omegaLeftFoot.setLocalPosition(-1.1, -0.7, 0);
  omegaLeftFoot.setLocalScale(0.6, 0.2, 0.2);
  omegaSymbolEntity.addChild(omegaLeftFoot);

  const omegaRightFoot = new pc.Entity('OmegaRightFoot');
  omegaRightFoot.addComponent('render', { type: 'box', material: matBrass });
  omegaRightFoot.setLocalPosition(1.1, -0.7, 0);
  omegaRightFoot.setLocalScale(0.6, 0.2, 0.2);
  omegaSymbolEntity.addChild(omegaRightFoot);

  // Gate Solenoid Barrier
  const solenoidGate = new pc.Entity('SolenoidGate');
  solenoidGate.addComponent('render', { type: 'box', material: matWoodDark });
  solenoidGate.setPosition(0, 2.6, 11.5);
  solenoidGate.setLocalScale(4.2, 5.2, 0.5);
  plazaRoot.addChild(solenoidGate);

  const gateLightLeft = new pc.Entity('GateLightLeft');
  gateLightLeft.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.4, 0.2),
    intensity: 1.2,
    range: 5.0,
  });
  gateLightLeft.setPosition(-2.0, 4.0, 10.8);
  plazaRoot.addChild(gateLightLeft);

  const gateLightRight = new pc.Entity('GateLightRight');
  gateLightRight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.4, 0.2),
    intensity: 1.2,
    range: 5.0,
  });
  gateLightRight.setPosition(2.0, 4.0, 10.8);
  plazaRoot.addChild(gateLightRight);

  probeTargets['puerta_solenoide'] = new pc.Vec3(0, 2.2, 11.0);
  addCollider(0, 11.5, 7.8, 2.4);

  // ========================================================
  // --- 6. LUMEN'S WORKSHOP INTERIOR (workshopInteriorRoot) -
  // ========================================================
  const workshopInteriorRoot = new pc.Entity('WorkshopInteriorRoot');
  workshopInteriorRoot.setPosition(-60, 0, 0);
  app.root.addChild(workshopInteriorRoot);

  const wFloor = new pc.Entity('W_Floor');
  wFloor.addComponent('render', { type: 'box', material: matWoodDark });
  wFloor.setPosition(0, -0.1, 0);
  wFloor.setLocalScale(12.0, 0.2, 10.0);
  workshopInteriorRoot.addChild(wFloor);

  // Walls
  const wWallN = new pc.Entity('W_WallN');
  wWallN.addComponent('render', { type: 'box', material: matStoneDark });
  wWallN.setPosition(0, 2.5, 5.0);
  wWallN.setLocalScale(12.0, 5.0, 0.4);
  workshopInteriorRoot.addChild(wWallN);

  const wWallS = new pc.Entity('W_WallS');
  wWallS.addComponent('render', { type: 'box', material: matStoneDark });
  wWallS.setPosition(0, 2.5, -5.0);
  wWallS.setLocalScale(12.0, 5.0, 0.4);
  workshopInteriorRoot.addChild(wWallS);

  const wWallE = new pc.Entity('W_WallE');
  wWallE.addComponent('render', { type: 'box', material: matStoneDark });
  wWallE.setPosition(6.0, 2.5, 0);
  wWallE.setLocalScale(0.4, 5.0, 10.0);
  workshopInteriorRoot.addChild(wWallE);

  const wWallW = new pc.Entity('W_WallW');
  wWallW.addComponent('render', { type: 'box', material: matStoneDark });
  wWallW.setPosition(-6.0, 2.5, 0);
  wWallW.setLocalScale(0.4, 5.0, 10.0);
  workshopInteriorRoot.addChild(wWallW);

  // Warm Cozy Lighting
  const wChandelier = new pc.Entity('W_Chandelier');
  wChandelier.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.78, 0.48),
    intensity: 2.8,
    range: 14.0,
  });
  wChandelier.setPosition(0, 3.8, 0);
  workshopInteriorRoot.addChild(wChandelier);

  // Lumen's Heavy Master Workbench
  const wWorkbench = new pc.Entity('W_MasterWorkbench');
  wWorkbench.addComponent('render', { type: 'box', material: matWood });
  wWorkbench.setPosition(0, 0.5, 0.8);
  wWorkbench.setLocalScale(4.5, 1.0, 1.8);
  workshopInteriorRoot.addChild(wWorkbench);

  // Vise, Wire Spools, Glass Battery Jars on Table
  const wBatteryJar = new pc.Entity('W_BatteryJar');
  wBatteryJar.addComponent('render', { type: 'cylinder', material: matBrass });
  wBatteryJar.setPosition(-1.4, 1.25, 0.8);
  wBatteryJar.setLocalScale(0.35, 0.5, 0.35);
  workshopInteriorRoot.addChild(wBatteryJar);

  const wCoilSpool = new pc.Entity('W_CoilSpool');
  wCoilSpool.addComponent('render', { type: 'cylinder', material: matCopperClean });
  wCoilSpool.setPosition(1.3, 1.2, 0.8);
  wCoilSpool.setLocalScale(0.4, 0.4, 0.4);
  workshopInteriorRoot.addChild(wCoilSpool);

  // Master Lumen NPC Entity (Inside Workshop)
  const lumenNpcEntity = new pc.Entity('LumenNPC');
  lumenNpcEntity.setPosition(0, 0, 2.4);
  lumenNpcEntity.setEulerAngles(0, 180, 0);
  workshopInteriorRoot.addChild(lumenNpcEntity);

  const lumenBody = new pc.Entity('LumenBody');
  lumenBody.addComponent('render', { type: 'cylinder', material: matLumenApron });
  lumenBody.setPosition(0, 0.85, 0);
  lumenBody.setLocalScale(0.55, 1.1, 0.55);
  lumenNpcEntity.addChild(lumenBody);

  const lumenHead = new pc.Entity('LumenHead');
  lumenHead.addComponent('render', { type: 'cylinder', material: matSkin });
  lumenHead.setPosition(0, 1.55, 0);
  lumenHead.setLocalScale(0.32, 0.32, 0.32);
  lumenNpcEntity.addChild(lumenHead);

  const lumenGoggles = new pc.Entity('LumenGoggles');
  lumenGoggles.addComponent('render', { type: 'box', material: matBrass });
  lumenGoggles.setPosition(0, 1.62, 0.16);
  lumenGoggles.setLocalScale(0.36, 0.12, 0.15);
  lumenNpcEntity.addChild(lumenGoggles);

  // Workshop Exit Doorway
  const wExitDoor = new pc.Entity('W_ExitDoor');
  wExitDoor.addComponent('render', { type: 'box', material: matWoodDark });
  wExitDoor.setPosition(0, 1.4, -4.8);
  wExitDoor.setLocalScale(2.4, 2.8, 0.2);
  workshopInteriorRoot.addChild(wExitDoor);

  probeTargets['lumen_taller_banco'] = new pc.Vec3(-60, 1.0, 0.2);
  probeTargets['lumen_taller_bateria'] = new pc.Vec3(-61.4, 1.3, 0.8);
  addCollider(-60, 0.8, 4.6, 2.0);
  addCollider(-60, 2.4, 1.2, 1.2);

  // ========================================================
  // --- 7. MOUNTAIN & MANANTIAL HYDROELECTRIC (mountainRoot) -
  // ========================================================
  const mountainRoot = new pc.Entity('MountainRoot');
  app.root.addChild(mountainRoot);

  // Mountain Gorge Ground Pathway
  const canyonGround = new pc.Entity('CanyonGround');
  canyonGround.addComponent('render', { type: 'box', material: matStoneDark });
  canyonGround.setPosition(0, 0.1, 26.0);
  canyonGround.setLocalScale(18.0, 0.4, 30.0);
  mountainRoot.addChild(canyonGround);

  // Towering Mountain Cliffs (Backdrop)
  const mountainPeakL = new pc.Entity('MountainPeakLeft');
  mountainPeakL.addComponent('render', { type: 'cone', material: matMountain });
  mountainPeakL.setPosition(-12.0, 14.0, 42.0);
  mountainPeakL.setLocalScale(24.0, 28.0, 24.0);
  mountainRoot.addChild(mountainPeakL);

  const mountainPeakR = new pc.Entity('MountainPeakRight');
  mountainPeakR.addComponent('render', { type: 'cone', material: matMountain });
  mountainPeakR.setPosition(12.0, 15.0, 44.0);
  mountainPeakR.setLocalScale(26.0, 30.0, 26.0);
  mountainRoot.addChild(mountainPeakR);

  // Cascading Mountain Waterfall (Flume from height)
  const waterfallMesh = new pc.Entity('MountainWaterfall');
  waterfallMesh.addComponent('render', { type: 'box', material: matWaterfall });
  waterfallMesh.setPosition(0, 10.0, 34.0);
  waterfallMesh.setEulerAngles(35, 0, 0);
  waterfallMesh.setLocalScale(4.8, 0.6, 22.0);
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

  return {
    app,
    cameraEntity,
    playerEntity,
    viewmodelRoot,
    viewmodelNeedle,
    viewmodelFilament,
    waterEntity,
    solenoidGate,
    copperJumper,
    corrosionMesh,
    relayLight,
    ohmEntity,
    ohmFilamentLight,
    eddaEntity,
    lumenNpcEntity,
    workshopInteriorRoot,
    plazaRoot,
    mountainRoot,
    waterfallMesh,
    turbineMesh,
    omegaSymbolEntity,
    gateLightLeft,
    gateLightRight,
    probeTargets,
    colliders,
  };
}
