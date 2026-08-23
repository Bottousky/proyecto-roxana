import * as pc from 'playcanvas';
import { OHM_HERO_TUNING } from './ohmHeroTuning.ts';
import { OMEGA_GATE_TUNING } from './omegaGateTuning.ts';
import { PLAZA_CONDUCTOR_LAYOUT } from './plazaConductorLayout.ts';

export interface PlayCanvasWorldElements {
  app: pc.Application;
  ready: Promise<void>;
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
  matStone.name = 'roxana-ohmdal-stone-primary-v1';
  matStone.diffuse = new pc.Color(0.55, 0.5, 0.44);
  matStone.useMetalness = true;
  matStone.gloss = 0.15;
  matStone.metalness = 0.05;
  matStone.update();

  const matStoneDark = new pc.StandardMaterial();
  matStoneDark.name = 'roxana-ohmdal-stone-aged-v1';
  matStoneDark.diffuse = new pc.Color(0.42, 0.37, 0.32);
  matStoneDark.useMetalness = true;
  matStoneDark.gloss = 0.1;
  matStoneDark.metalness = 0.05;
  matStoneDark.update();

  const matMountain = new pc.StandardMaterial();
  matMountain.name = 'roxana-ohmdal-mountain-near-v1';
  matMountain.diffuse = new pc.Color(0.34, 0.32, 0.3);
  matMountain.useMetalness = true;
  matMountain.gloss = 0.08;
  matMountain.metalness = 0.02;
  matMountain.emissive = new pc.Color(0.025, 0.028, 0.03);
  matMountain.emissiveIntensity = 0.35;
  matMountain.update();

  const matMountainFar = new pc.StandardMaterial();
  matMountainFar.name = 'roxana-ohmdal-mountain-far-v1';
  matMountainFar.diffuse = new pc.Color(0.22, 0.25, 0.27);
  matMountainFar.useMetalness = true;
  matMountainFar.gloss = 0.04;
  matMountainFar.metalness = 0;
  matMountainFar.emissive = new pc.Color(0.025, 0.032, 0.038);
  matMountainFar.emissiveIntensity = 0.5;
  matMountainFar.update();

  const matSky = new pc.StandardMaterial();
  matSky.name = 'roxana-ohmdal-sky-dome-v1';
  matSky.diffuse = new pc.Color(0.19, 0.26, 0.31);
  matSky.emissive = new pc.Color(0.19, 0.26, 0.31);
  matSky.emissiveIntensity = 0.72;
  matSky.useLighting = false;
  matSky.cull = pc.CULLFACE_FRONT;
  matSky.depthWrite = false;
  matSky.update();

  const matCopperClean = new pc.StandardMaterial();
  matCopperClean.name = 'roxana-ohmdal-copper-aged-v1';
  matCopperClean.diffuse = new pc.Color(0.62, 0.29, 0.12);
  matCopperClean.emissive = pc.Color.BLACK;
  matCopperClean.emissiveIntensity = 0;
  matCopperClean.useMetalness = true;
  // The spike has no image-based lighting yet. Keeping these metals below full
  // metalness preserves their copper albedo on faces outside the key light.
  matCopperClean.metalness = 0.58;
  matCopperClean.gloss = 0.46;
  matCopperClean.update();

  const matCopperOxide = new pc.StandardMaterial();
  matCopperOxide.name = 'roxana-ohmdal-verdigris-v1';
  matCopperOxide.diffuse = new pc.Color(0.32, 0.6, 0.48); // Verdigris green
  matCopperOxide.useMetalness = true;
  matCopperOxide.gloss = 0.2;
  matCopperOxide.metalness = 0.12;
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
  matWood.name = 'roxana-ohmdal-wood-workshop-v1';
  matWood.diffuse = new pc.Color(0.34, 0.24, 0.16);
  matWood.useMetalness = true;
  matWood.gloss = 0.14;
  matWood.update();

  const matWoodDark = new pc.StandardMaterial();
  matWoodDark.name = 'roxana-ohmdal-wood-charred-v1';
  matWoodDark.diffuse = new pc.Color(0.31, 0.22, 0.15);
  matWoodDark.useMetalness = true;
  matWoodDark.gloss = 0.12;
  matWoodDark.update();

  const matWorkshopInterior = new pc.StandardMaterial();
  matWorkshopInterior.name = 'roxana-ohmdal-workshop-interior-v1';
  matWorkshopInterior.diffuse = new pc.Color(0.19, 0.1, 0.055);
  matWorkshopInterior.emissive = new pc.Color(0.24, 0.075, 0.018);
  matWorkshopInterior.emissiveIntensity = 0.42;
  matWorkshopInterior.useMetalness = true;
  matWorkshopInterior.metalness = 0;
  matWorkshopInterior.gloss = 0.08;
  matWorkshopInterior.update();

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

  const matPlaster = new pc.StandardMaterial();
  matPlaster.name = 'roxana-ohmdal-plaster-worn-v1';
  matPlaster.diffuse = new pc.Color(0.58, 0.5, 0.39);
  matPlaster.useMetalness = true;
  matPlaster.metalness = 0;
  matPlaster.gloss = 0.1;
  matPlaster.update();

  const matIron = new pc.StandardMaterial();
  matIron.name = 'roxana-ohmdal-iron-aged-v1';
  matIron.diffuse = new pc.Color(0.34, 0.28, 0.23);
  matIron.useMetalness = true;
  matIron.metalness = 0.38;
  matIron.gloss = 0.16;
  matIron.update();

  const matCeramic = new pc.StandardMaterial();
  matCeramic.name = 'roxana-ohmdal-ceramic-insulator-v1';
  matCeramic.diffuse = new pc.Color(0.67, 0.58, 0.46);
  matCeramic.useMetalness = true;
  matCeramic.metalness = 0;
  matCeramic.gloss = 0.46;
  matCeramic.update();

  const matMoss = new pc.StandardMaterial();
  matMoss.name = 'roxana-ohmdal-moss-v1';
  matMoss.diffuse = new pc.Color(0.18, 0.28, 0.15);
  matMoss.useMetalness = true;
  matMoss.metalness = 0;
  matMoss.gloss = 0.08;
  matMoss.update();

  const matPaving = new pc.StandardMaterial();
  matPaving.name = 'roxana-ohmdal-plaza-cobble-v1';
  matPaving.diffuse = new pc.Color(0.48, 0.43, 0.36);
  matPaving.useMetalness = true;
  matPaving.metalness = 0;
  matPaving.gloss = 0.16;
  matPaving.update();

  const matPavingDamp = new pc.StandardMaterial();
  matPavingDamp.name = 'roxana-ohmdal-plaza-cobble-damp-local-v1';
  matPavingDamp.diffuse = new pc.Color(0.38, 0.36, 0.31);
  matPavingDamp.useMetalness = true;
  matPavingDamp.metalness = 0;
  matPavingDamp.gloss = 0.62;
  matPavingDamp.update();

  type TextureSet = {
    diffuse: string;
    normal?: string;
    roughness?: string;
    ao?: string;
    metalness?: string;
  };

  const runtimeMaterialUrl = (set: string, file: string) =>
    new URL(`../../../assets/runtime/ohmdal/plaza/materials/${set}/${file}`, import.meta.url).href;

  const loadTexture = (name: string, url: string) =>
    new Promise<pc.Texture>((resolve, reject) => {
      const asset = new pc.Asset(name, 'texture', { url });
      app.assets.add(asset);
      asset.ready((loaded) => resolve(loaded.resource as pc.Texture));
      asset.once('error', reject);
      app.assets.load(asset);
    });

  const loadContainerEntity = (name: string, url: string) =>
    new Promise<pc.Entity>((resolve, reject) => {
      const asset = new pc.Asset(name, 'container', { url });
      app.assets.add(asset);
      asset.ready((loaded) => {
        const resource = loaded.resource as pc.ContainerResource;
        resolve(resource.instantiateRenderEntity());
      });
      asset.once('error', reject);
      app.assets.load(asset);
    });

  const applyTextureSet = async (
    material: pc.StandardMaterial,
    set: string,
    maps: TextureSet,
    tiling: pc.Vec2,
  ) => {
    const [diffuse, normal, roughness, ao, metalness] = await Promise.all([
      loadTexture(`${set}-diffuse`, maps.diffuse),
      maps.normal ? loadTexture(`${set}-normal`, maps.normal) : undefined,
      maps.roughness ? loadTexture(`${set}-roughness`, maps.roughness) : undefined,
      maps.ao ? loadTexture(`${set}-ao`, maps.ao) : undefined,
      maps.metalness ? loadTexture(`${set}-metalness`, maps.metalness) : undefined,
    ]);
    material.diffuseMap = diffuse;
    material.diffuseMapTiling = tiling;
    if (normal) {
      material.normalMap = normal;
      material.normalMapTiling = tiling;
      material.bumpiness = 0.72;
    }
    if (roughness) {
      material.glossMap = roughness;
      material.glossMapTiling = tiling;
      material.glossInvert = true;
    }
    if (ao) {
      material.aoMap = ao;
      material.aoMapTiling = tiling;
    }
    if (metalness) {
      material.metalnessMap = metalness;
      material.metalnessMapTiling = tiling;
    }
    material.update();
  };

  const textureSet = (set: string, hasAo = true, hasMetalness = false): TextureSet => ({
    diffuse: runtimeMaterialUrl(set, 'diffuse-1k.jpg'),
    normal: runtimeMaterialUrl(set, 'normal-1k.png'),
    roughness: runtimeMaterialUrl(set, 'roughness-1k.jpg'),
    ...(hasAo ? { ao: runtimeMaterialUrl(set, 'ao-1k.jpg') } : {}),
    ...(hasMetalness ? { metalness: runtimeMaterialUrl(set, 'metalness-1k.jpg') } : {}),
  });

  const pavingReady = applyTextureSet(
    matPavingDamp,
    'plaza-cobble-base',
    textureSet('plaza-cobble-base', false),
    new pc.Vec2(10, 8),
  ).then(() => {
    // Share the stone maps, but deliberately leave the dry base without the
    // source roughness map whose wet pockets read as plaza-wide standing water.
    matPaving.diffuseMap = matPavingDamp.diffuseMap;
    matPaving.diffuseMapTiling = matPavingDamp.diffuseMapTiling;
    matPaving.normalMap = matPavingDamp.normalMap;
    matPaving.normalMapTiling = matPavingDamp.normalMapTiling;
    matPaving.bumpiness = matPavingDamp.bumpiness;
    matPaving.gloss = 0.08;
    matPaving.update();
  });

  const materialReady = Promise.all([
    pavingReady,
    applyTextureSet(matStone, 'stone-primary', textureSet('stone-primary'), new pc.Vec2(2.5, 2.5)),
    applyTextureSet(matStoneDark, 'stone-aged', textureSet('stone-aged'), new pc.Vec2(2, 2)),
    applyTextureSet(matPlaster, 'plaster-worn', textureSet('plaster-worn'), new pc.Vec2(3.5, 3.5)),
    applyTextureSet(matWood, 'wood-workshop', textureSet('wood-workshop'), new pc.Vec2(2, 2)),
    applyTextureSet(matWoodDark, 'wood-workshop', textureSet('wood-workshop'), new pc.Vec2(3, 3)),
    applyTextureSet(matIron, 'iron-aged', textureSet('iron-aged', false, true), new pc.Vec2(2, 2)),
  ]).then(() => undefined);

  // --- 2. Lighting & Environment ---
  app.scene.ambientLight = new pc.Color(0.49, 0.43, 0.38);
  app.scene.exposure = 1.15;

  const sunEntity = new pc.Entity('Sun');
  sunEntity.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1.0, 0.82, 0.58),
    intensity: 2.75,
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
    intensity: 1.18,
  });
  fillEntity.setEulerAngles(-40, 145, 0);
  app.root.addChild(fillEntity);

  const skyDome = new pc.Entity('PlazaSkyDome');
  skyDome.addComponent('render', { type: 'sphere', material: matSky });
  skyDome.render!.castShadows = false;
  skyDome.render!.receiveShadows = false;
  skyDome.setLocalScale(140, 140, 140);
  app.root.addChild(skyDome);

  // --- 3. First-Person Player & Camera Rig ---
  const playerEntity = new pc.Entity('Player');
  playerEntity.setPosition(0, 1.68, -8.0);
  app.root.addChild(playerEntity);

  const cameraEntity = new pc.Entity('Camera');
  cameraEntity.addComponent('camera', {
    clearColor: new pc.Color(0.17, 0.145, 0.125),
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
  viewmodelRoot.setLocalPosition(0.25, -0.22, -0.48);
  viewmodelRoot.setLocalEulerAngles(8, -12, 3);
  viewmodelRoot.setLocalScale(1, 1, 1);
  cameraEntity.addChild(viewmodelRoot);

  // Keep the public animation binding alive before the GLB resolves. The
  // authored needle visual is reparented below this inert entity once the
  // canonical asset is loaded, so playcanvasRuntime can keep rotating the
  // same entity around its z axis.
  const viewmodelNeedle = new pc.Entity('GalvanoscopeNeedleBinding');
  viewmodelRoot.addChild(viewmodelNeedle);

  // Compatibility reference retained for the runtime/world interface. The
  // canonical hero owns all visible viewmodel geometry; this entity must stay
  // inert and must not recreate the removed filament primitive.
  const viewmodelFilament = new pc.Entity('GalvanoscopeFilamentCompatibility');
  viewmodelFilament.enabled = false;
  viewmodelRoot.addChild(viewmodelFilament);

  const galvanoscopeHeroUrl = new URL(
    '../../../assets/runtime/ohmdal/plaza/heroes/galvanoscope/galvanoscope.glb',
    import.meta.url,
  ).href;
  const galvanoscopeReady = loadContainerEntity('galvanoscope-hero', galvanoscopeHeroUrl).then((heroVisual) => {
    const authoredRoot =
      (heroVisual.findByName('GalvanoscopeHero') as pc.Entity | null)
      ?? (heroVisual.name === 'GalvanoscopeHero' ? heroVisual : null);
    if (!authoredRoot) throw new Error('Galvanoscope GLB is missing GalvanoscopeHero');

    const needlePivot = authoredRoot.findByName('NeedlePivot') as pc.Entity | null;
    const needleVisual = authoredRoot.findByName('NeedleVisual') as pc.Entity | null;
    const selectorPivot = authoredRoot.findByName('SelectorPivot') as pc.Entity | null;
    const probeRedPivot = authoredRoot.findByName('ProbeRedPivot') as pc.Entity | null;
    const probePalePivot = authoredRoot.findByName('ProbePalePivot') as pc.Entity | null;
    if (!needlePivot) throw new Error('Galvanoscope GLB is missing NeedlePivot');
    if (!needleVisual) throw new Error('Galvanoscope GLB is missing NeedleVisual');
    if (!selectorPivot) throw new Error('Galvanoscope GLB is missing SelectorPivot');
    if (!probeRedPivot) throw new Error('Galvanoscope GLB is missing ProbeRedPivot');
    if (!probePalePivot) throw new Error('Galvanoscope GLB is missing ProbePalePivot');

    // The root is authored front +Z and calibrated at the requested viewmodel
    // transform above; no additional yaw/scale correction is introduced here.
    viewmodelRoot.addChild(heroVisual);
    heroVisual.name = 'GalvanoscopeHeroVisual';

    needlePivot.addChild(viewmodelNeedle);
    viewmodelNeedle.addChild(needleVisual);

    for (const component of heroVisual.findComponents('render') as pc.RenderComponent[]) {
      component.castShadows = false;
      component.receiveShadows = true;
    }
  });

  // ==========================================
  // --- 5. OUTDOOR PLAZA SCENE (plazaRoot) ---
  // ==========================================
  const plazaRoot = new pc.Entity('PlazaRoot');
  app.root.addChild(plazaRoot);
  const plazaArtBatch = app.batcher.addGroup('OhmdalPlazaStaticArt', false, 40);

  const addBox = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: pc.StandardMaterial,
    euler: [number, number, number] = [0, 0, 0],
  ) => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.render!.batchGroupId = plazaArtBatch.id;
    entity.render!.castShadows = Math.max(...scale) >= 2 && scale[1] >= 0.25;
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    entity.setEulerAngles(...euler);
    parent.addChild(entity);
    return entity;
  };

  const addCylinder = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: pc.StandardMaterial,
    euler: [number, number, number] = [0, 0, 0],
  ) => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'cylinder', material });
    entity.render!.batchGroupId = plazaArtBatch.id;
    entity.render!.castShadows = Math.max(...scale) >= 1 && scale[1] >= 0.3;
    entity.setPosition(...position);
    entity.setLocalScale(...scale);
    entity.setEulerAngles(...euler);
    parent.addChild(entity);
    return entity;
  };

  // Authored convex profiles are the lightweight Plaza architecture path:
  // custom silhouettes without introducing vendor assets or runtime dependencies.
  const addExtrudedProfile = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    profile: ReadonlyArray<readonly [number, number]>,
    depth: number,
    material: pc.StandardMaterial,
  ) => {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const halfDepth = depth / 2;
    const minX = Math.min(...profile.map(([x]) => x));
    const maxX = Math.max(...profile.map(([x]) => x));
    const minY = Math.min(...profile.map(([, y]) => y));
    const maxY = Math.max(...profile.map(([, y]) => y));
    const width = Math.max(0.001, maxX - minX);
    const height = Math.max(0.001, maxY - minY);

    for (const [x, y] of profile) {
      positions.push(x, y, -halfDepth, x, y, halfDepth);
      const u = (x - minX) / width;
      const v = (y - minY) / height;
      uvs.push(u, v, u, v);
    }

    for (let index = 1; index < profile.length - 1; index += 1) {
      indices.push(0, index * 2, (index + 1) * 2);
      indices.push(1, (index + 1) * 2 + 1, index * 2 + 1);
    }
    for (let index = 0; index < profile.length; index += 1) {
      const next = (index + 1) % profile.length;
      const front = index * 2;
      const back = front + 1;
      const nextFront = next * 2;
      const nextBack = nextFront + 1;
      indices.push(front, nextBack, back, front, nextFront, nextBack);
    }

    const geometry = new pc.Geometry();
    geometry.positions = positions;
    geometry.uvs = uvs;
    geometry.indices = indices;
    geometry.normals = pc.calculateNormals(positions, indices);
    const mesh = pc.Mesh.fromGeometry(app.graphicsDevice, geometry);
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, material, entity)],
    });
    entity.render!.batchGroupId = plazaArtBatch.id;
    entity.render!.castShadows = true;
    entity.render!.receiveShadows = true;
    entity.setPosition(...position);
    parent.addChild(entity);
    return entity;
  };

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

  // Main Flagstone Ground
  const ground = new pc.Entity('PlazaGround');
  ground.addComponent('render', { type: 'box', material: matPaving });
  ground.setPosition(0, -0.15, 0);
  ground.setLocalScale(36, 0.3, 30);
  plazaRoot.addChild(ground);

  // Moisture is environmental evidence, not a global material treatment:
  // a narrow fountain apron, its runoff channel and one low drain retain the
  // wet response while the plaza remains predominantly dry stone.
  addCylinder(plazaRoot, 'FountainDampApron', [5.5, 0.014, 3.8], [7.2, 0.024, 7.2], matPavingDamp);
  addBox(plazaRoot, 'FountainRunoff', [5.5, 0.014, 0.35], [0.72, 0.024, 3.1], matPavingDamp);
  addBox(plazaRoot, 'LowDrainDampApron', [5.5, 0.014, -1.35], [2.5, 0.024, 0.55], matPavingDamp);
  for (const x of [4.65, 5.05, 5.45, 5.85, 6.25]) {
    addBox(plazaRoot, `LowDrainBar${x}`, [x, 0.038, -1.35], [0.12, 0.035, 0.46], matIron);
  }

  // The Ancient Institute Portal (South Entrance). Tapered masonry and a
  // segmented arch replace the cylinder/box blockout while retaining bounds.
  const portalAuthoredArch = new pc.Entity('PortalAuthoredArch');
  plazaRoot.addChild(portalAuthoredArch);
  const portalPierProfile: ReadonlyArray<readonly [number, number]> = [
    [-0.72, 0], [0.72, 0], [0.52, 4.15], [-0.52, 4.15],
  ];
  addExtrudedProfile(portalAuthoredArch, 'PortalPierWestAuthored', [-2.4, 0, -11], portalPierProfile, 1.45, matStoneDark);
  addExtrudedProfile(portalAuthoredArch, 'PortalPierEastAuthored', [2.4, 0, -11], portalPierProfile, 1.45, matStoneDark);
  const portalArchCenterY = 4.05;
  for (let segment = 0; segment < 10; segment += 1) {
    const angle0 = (Math.PI * segment) / 10;
    const angle1 = (Math.PI * (segment + 1)) / 10;
    const profile: ReadonlyArray<readonly [number, number]> = [
      [Math.cos(angle0) * 2.48, portalArchCenterY + Math.sin(angle0) * 2.48],
      [Math.cos(angle1) * 2.48, portalArchCenterY + Math.sin(angle1) * 2.48],
      [Math.cos(angle1) * 1.77, portalArchCenterY + Math.sin(angle1) * 1.77],
      [Math.cos(angle0) * 1.77, portalArchCenterY + Math.sin(angle0) * 1.77],
    ];
    addExtrudedProfile(portalAuthoredArch, `PortalArchVoussoir${segment}`, [0, 0, -11], profile, 1.45, segment % 2 ? matStone : matStoneDark);
  }

  // P1 — authored southern threshold: stepped masonry, an intact civic arch,
  // and a restrained conductor band. These pieces do not alter collision.
  addBox(plazaRoot, 'PortalStepLower', [0, 0.08, -10.15], [6.8, 0.16, 1.8], matStoneDark);
  addBox(plazaRoot, 'PortalStepUpper', [0, 0.18, -10.7], [5.8, 0.2, 1.2], matStone);
  addBox(plazaRoot, 'PortalCornice', [0, 5.18, -11], [6.6, 0.28, 1.5], matStoneDark);
  addBox(plazaRoot, 'PortalCopperBand', [0, 4.75, -10.35], [4.6, 0.12, 0.12], matCopperClean);
  for (const side of [-1, 1]) {
    addBox(plazaRoot, `PortalPlinth${side}`, [side * 2.4, 0.35, -11], [1.5, 0.7, 1.55], matStone);
    addBox(plazaRoot, `PortalButtress${side}`, [side * 3.05, 1.65, -11.15], [0.55, 2.7, 1.7], matStoneDark, [0, 0, side * 4]);
    addCylinder(plazaRoot, `PortalInsulator${side}`, [side * 1.72, 4.72, -10.22], [0.22, 0.32, 0.22], matCeramic, [90, 0, 0]);
  }

  probeTargets['portal_pos'] = new pc.Vec3(0.9, 1.6, -10.8);
  probeTargets['portal_neg'] = new pc.Vec3(-0.9, 1.6, -10.8);
  addCollider(0, -11.0, 5.8, 1.8);

  // --- Central Ohm Dais & Ohm Automaton Entity ---
  const dais = new pc.Entity('OhmDais');
  dais.addComponent('render', { type: 'cylinder', material: matStoneDark });
  dais.setPosition(0, 0.25, -2.0);
  dais.setLocalScale(5.6, 0.5, 5.6);
  plazaRoot.addChild(dais);

  addCylinder(plazaRoot, 'OhmDaisLowerCourse', [0, 0.05, -2], [6.5, 0.18, 6.5], matStoneDark);
  addCylinder(plazaRoot, 'OhmDaisUpperCourse', [0, 0.45, -2], [4.9, 0.2, 4.9], matStone);
  for (const [index, angle] of [0, 90, 180, 270].entries()) {
    const radians = (angle * Math.PI) / 180;
    const x = Math.sin(radians) * 2.35;
    const z = -2 + Math.cos(radians) * 2.35;
    addCylinder(plazaRoot, `OhmDaisTerminal${index}`, [x, 0.62, z], [0.26, 0.48, 0.26], matCeramic);
    addCylinder(plazaRoot, `OhmDaisTerminalCap${index}`, [x, 0.9, z], [0.16, 0.1, 0.16], matCopperClean);
  }

  const ohmEntity = new pc.Entity('OhmAutomaton');
  ohmEntity.setPosition(0, 0.56, -2.0);
  plazaRoot.addChild(ohmEntity);

  const ohmHeroUrl = new URL(
    '../../../assets/runtime/ohmdal/plaza/heroes/ohm/ohm-pedestal.glb',
    import.meta.url,
  ).href;
  const ohmHeroReady = loadContainerEntity('ohm-pedestal-hero', ohmHeroUrl).then((heroVisual) => {
    heroVisual.name = 'OhmHeroVisual';
    heroVisual.setLocalScale(OHM_HERO_TUNING.scale, OHM_HERO_TUNING.scale, OHM_HERO_TUNING.scale);
    heroVisual.setLocalPosition(
      -OHM_HERO_TUNING.center[0] * OHM_HERO_TUNING.scale,
      OHM_HERO_TUNING.y,
      -OHM_HERO_TUNING.center[2] * OHM_HERO_TUNING.scale,
    );
    const authoredYaw = new pc.Entity('OhmHeroAuthoredYaw');
    authoredYaw.setLocalEulerAngles(0, OHM_HERO_TUNING.yaw, 0);
    authoredYaw.addChild(heroVisual);
    ohmEntity.addChild(authoredYaw);
  });

  const ohmFilamentLight = new pc.Entity('OhmFilamentLight');
  ohmFilamentLight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.75, 0.25),
    intensity: 0.0,
    range: 6.0,
  });
  ohmFilamentLight.setPosition(0, 1.08, 0);
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
  const workshopAuthoredShell = addExtrudedProfile(
    plazaRoot,
    'WorkshopAuthoredShell',
    [-10.5, 0, -4],
    [[-3, 0], [3, 0], [3, 4.55], [0, 6.15], [-3, 4.55]],
    7.5,
    matPlaster,
  );
  workshopAuthoredShell.render!.castShadows = true;

  // P1/P3 — Lumen's workshop receives a legible craft silhouette and a small
  // support dressing kit. All geometry is project-owned and procedural.
  addBox(plazaRoot, 'WorkshopStoneBase', [-10.5, 0.38, -4], [6.5, 0.75, 8], matStoneDark);
  addExtrudedProfile(plazaRoot, 'WorkshopRoofEastAuthored', [-10.5, 0, -4], [[0, 6.12], [3.38, 4.47], [3.58, 4.67], [0, 6.4]], 8.35, matWoodDark);
  addExtrudedProfile(plazaRoot, 'WorkshopRoofWestAuthored', [-10.5, 0, -4], [[-3.58, 4.67], [-3.38, 4.47], [0, 6.12], [0, 6.4]], 8.35, matWoodDark);
  addBox(plazaRoot, 'WorkshopRidge', [-10.5, 6.18, -4], [0.32, 0.34, 8.65], matIron);
  addBox(plazaRoot, 'WorkshopChimney', [-11.4, 6.45, -5.7], [0.85, 2.2, 0.85], matStoneDark);
  addBox(plazaRoot, 'WorkshopChimneyCap', [-11.4, 7.48, -5.7], [1.1, 0.22, 1.1], matIron);
  for (const z of [-6.9, -4, -1.1]) {
    addBox(plazaRoot, `WorkshopFrameEast${z}`, [-7.42, 2.75, z], [0.22, 4.55, 0.3], matWood);
    addBox(plazaRoot, `WorkshopFrameWest${z}`, [-13.58, 2.75, z], [0.22, 4.55, 0.3], matWood);
  }
  // The entrance is a recessed, warm working threshold rather than a black
  // decal. Stone jambs carry the facade, while copper details keep the craft
  // language tied to Ohmdal's electrical infrastructure.
  addBox(plazaRoot, 'WorkshopDoorRecess', [-7.3, 1.36, -4], [0.18, 2.55, 1.55], matWorkshopInterior);
  for (const [index, z] of [-4.94, -3.06].entries()) {
    addBox(plazaRoot, `WorkshopDoorJamb${index}`, [-6.98, 1.48, z], [0.42, 2.96, 0.34], matStone);
    addBox(plazaRoot, `WorkshopDoorConductor${index}`, [-6.74, 1.55, z], [0.06, 2.25, 0.08], matCopperClean);
  }
  addBox(plazaRoot, 'WorkshopDoorLintel', [-6.98, 2.96, -4], [0.42, 0.34, 2.22], matStoneDark);
  addBox(plazaRoot, 'WorkshopDoorHeader', [-6.74, 2.91, -4], [0.06, 0.12, 1.7], matCopperClean);
  addBox(plazaRoot, 'WorkshopThreshold', [-6.76, 0.13, -4], [0.95, 0.24, 2.18], matStone);
  addBox(plazaRoot, 'WorkshopThresholdStrip', [-6.62, 0.27, -4], [0.08, 0.06, 1.72], matCopperClean);
  for (const z of [-6.05, -1.95]) {
    addBox(plazaRoot, `WorkshopWindowFrame${z}`, [-7.08, 2.75, z], [0.22, 1.55, 1.35], matWood);
    addBox(plazaRoot, `WorkshopWindowVoid${z}`, [-6.96, 2.75, z], [0.05, 1.12, 0.92], matWorkshopInterior);
    addBox(plazaRoot, `WorkshopWindowSill${z}`, [-6.86, 1.92, z], [0.46, 0.16, 1.52], matStoneDark);
    addBox(plazaRoot, `WorkshopWindowMullion${z}`, [-6.82, 2.75, z], [0.06, 1.02, 0.08], matCopperClean);
  }
  const workshopServiceCluster = new pc.Entity('WorkshopServiceCluster');
  plazaRoot.addChild(workshopServiceCluster);
  addBox(workshopServiceCluster, 'WorkshopWorkbench', [-6.55, 0.72, -1.05], [2.35, 0.18, 0.85], matWood);
  for (const z of [-1.38, -0.72]) {
    addBox(workshopServiceCluster, `WorkshopBenchLeg${z}`, [-6.55, 0.35, z], [1.9, 0.7, 0.16], matWoodDark);
  }
  for (const [index, z] of [-0.2, 0.7].entries()) {
    addBox(workshopServiceCluster, `WorkshopCrate${index}`, [-8.2 - index * 0.75, 0.42, z], [0.68, 0.68, 0.68], matWood);
    addBox(workshopServiceCluster, `WorkshopCrateBand${index}`, [-8.2 - index * 0.75, 0.43, z], [0.75, 0.12, 0.75], matIron);
  }
  addCylinder(workshopServiceCluster, 'WorkshopCableSpool', [-6.9, 0.48, 0.55], [0.72, 0.34, 0.72], matWood, [0, 0, 90]);
  addCylinder(workshopServiceCluster, 'WorkshopCableCoil', [-6.9, 0.48, 0.55], [0.5, 0.42, 0.5], matCopperClean, [0, 0, 90]);
  addBox(workshopServiceCluster, 'WorkshopServiceBackboard', [-7.18, 1.2, -1.02], [0.18, 1.35, 2.2], matWoodDark);
  for (const [index, z] of [-1.72, -1.02, -0.32].entries()) {
    addCylinder(workshopServiceCluster, `WorkshopServiceInsulator${index}`, [-6.98, 1.2, z], [0.18, 0.28, 0.18], matCeramic, [0, 0, 90]);
    addCylinder(workshopServiceCluster, `WorkshopServiceTerminal${index}`, [-6.8, 1.2, z], [0.1, 0.12, 0.1], matCopperClean, [0, 0, 90]);
  }

  // Keep the authored workshop props enabled; no vendor GLB is needed at runtime.
  const vendorPropsReady = Promise.resolve();

  const workshopLantern = new pc.Entity('WorkshopLantern');
  workshopLantern.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.7, 0.3),
    intensity: 2.35,
    range: 5.5,
  });
  workshopLantern.setPosition(-6.75, 2.55, -4.0);
  plazaRoot.addChild(workshopLantern);
  addBox(plazaRoot, 'WorkshopLanternBracket', [-6.7, 2.72, -4], [0.22, 0.12, 0.5], matIron);
  addCylinder(plazaRoot, 'WorkshopLanternHousing', [-6.56, 2.58, -4], [0.22, 0.35, 0.22], matBrass);
  addCollider(-10.5, -4.0, 6.2, 7.6);

  // --- Sacred Bell of Continuity (West Plaza) ---
  const bellGantry = new pc.Entity('BellGantry');
  bellGantry.addComponent('render', { type: 'box', material: matWood });
  bellGantry.setPosition(-5.2, 3.6, 2.4);
  bellGantry.setLocalScale(2.4, 0.3, 0.4);
  plazaRoot.addChild(bellGantry);
  addBox(plazaRoot, 'BellGantryPost0', [-6.15, 2.25, 2.4], [0.3, 2.7, 0.38], matWood);
  addBox(plazaRoot, 'BellGantryPost1', [-4.25, 2.25, 2.4], [0.3, 2.7, 0.38], matWood);
  addBox(plazaRoot, 'BellGantryPlinth0', [-6.15, 0.24, 2.4], [0.68, 0.48, 0.72], matStoneDark);
  addBox(plazaRoot, 'BellGantryPlinth1', [-4.25, 0.24, 2.4], [0.68, 0.48, 0.72], matStoneDark);
  addBox(plazaRoot, 'BellGantryCopperRail', [-5.2, 3.42, 2.18], [1.85, 0.08, 0.08], matCopperClean);

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
  fountainBasin.addComponent('render', { type: 'cylinder', material: matStone });
  fountainBasin.setPosition(5.5, 0.4, 3.8);
  fountainBasin.setLocalScale(5.8, 0.8, 5.8);
  plazaRoot.addChild(fountainBasin);
  addCylinder(plazaRoot, 'FountainBasinLowerCourse', [5.5, 0.1, 3.8], [6.35, 0.2, 6.35], matStoneDark);
  addCylinder(plazaRoot, 'FountainBasinCopperBand', [5.5, 0.5, 3.8], [5.95, 0.12, 5.95], matCopperClean);

  const waterEntity = new pc.Entity('FountainWater');
  waterEntity.addComponent('render', { type: 'cylinder', material: matWater });
  waterEntity.setPosition(5.5, 0.68, 3.8);
  waterEntity.setLocalScale(5.0, 0.05, 5.0);
  plazaRoot.addChild(waterEntity);

  probeTargets['fuente_motor_in'] = new pc.Vec3(5.5, 0.8, 3.8);
  addCollider(5.5, 3.8, 5.8, 5.8);

  // --- The 40-Year Mural (South-East) ---
  const mural = new pc.Entity('MuralWall');
  mural.addComponent('render', { type: 'box', material: matStone });
  mural.setPosition(7.8, 1.6, -4.2);
  mural.setLocalScale(4.0, 3.2, 1.0);
  plazaRoot.addChild(mural);
  addBox(plazaRoot, 'MuralPlinth', [7.8, 0.25, -4.2], [4.55, 0.5, 1.35], matStoneDark);
  addBox(plazaRoot, 'MuralCap', [7.8, 3.32, -4.2], [4.5, 0.22, 1.3], matCopperClean);
  addBox(plazaRoot, 'MuralReliefPanel', [7.8, 1.72, -4.73], [3.3, 2.15, 0.06], matStoneDark);
  addBox(plazaRoot, 'MuralConductor0', [6.8, 1.72, -4.78], [0.06, 1.75, 0.04], matCopperClean);
  addBox(plazaRoot, 'MuralConductor1', [7.8, 1.72, -4.78], [0.06, 1.75, 0.04], matCopperClean);
  addBox(plazaRoot, 'MuralConductor2', [8.8, 1.72, -4.78], [0.06, 1.75, 0.04], matCopperClean);
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

  // P4 — reusable electrical language: paired channels read as ida/retorno,
  // ceramic breaks signal terminals, and iron junction boxes mark decisions.
  PLAZA_CONDUCTOR_LAYOUT.mainSegments.forEach((segment, index) => {
    addBox(plazaRoot, `ConductorChannel${segment.side}-${index}`, [segment.x, 0.055, segment.z], [0.2, 0.08, segment.length], matIron);
    addBox(plazaRoot, `ConductorStrip${segment.side}-${index}`, [segment.x, 0.105, segment.z], [0.09, 0.04, segment.length * 0.94], matCopperClean);
  });
  for (const side of [-1, 1] as const) {
    PLAZA_CONDUCTOR_LAYOUT.routeTerminations.forEach((termination, index) => {
      addCylinder(plazaRoot, `RouteInsulator${side}-${index}`, [side * 0.9, 0.25, termination.z], [0.2, 0.3, 0.2], matCeramic);
      addCylinder(plazaRoot, `RouteClamp${side}-${index}`, [side * 0.9, 0.42, termination.z], [0.13, 0.08, 0.13], matCopperClean);
    });
  }
  PLAZA_CONDUCTOR_LAYOUT.workshopBranchSegments.forEach((segment, index) => {
    addBox(plazaRoot, `WorkshopBranchChannel${index}`, [segment.x, 0.06, segment.z], [segment.length, 0.08, 0.2], matIron);
    addBox(plazaRoot, `WorkshopBranchStrip${index}`, [segment.x, 0.11, segment.z], [segment.length * 0.94, 0.04, 0.09], matCopperClean);
  });
  addBox(plazaRoot, 'WorkshopJunctionBox', [PLAZA_CONDUCTOR_LAYOUT.workshopJunction.x, 0.42, PLAZA_CONDUCTOR_LAYOUT.workshopJunction.z], [0.7, 0.75, 0.62], matIron);
  addBox(plazaRoot, 'WorkshopJunctionPlate', [PLAZA_CONDUCTOR_LAYOUT.workshopJunction.x, 0.45, PLAZA_CONDUCTOR_LAYOUT.workshopJunction.z - 0.33], [0.45, 0.42, 0.05], matBrass);
  addBox(plazaRoot, 'EastDrainChannel', [6.9, 0.03, 4], [0.62, 0.06, 8.8], matStoneDark);
  for (const [index, z] of [0.7, 2.9, 5.1, 7.3].entries()) {
    addBox(plazaRoot, `EastDrainGrate${index}`, [6.9, 0.1, z], [0.58, 0.08, 0.12], matIron);
  }

  probeTargets['retorno_oxido'] = new pc.Vec3(-0.9, 0.1, -4.0);
  probeTargets['ida_norte'] = new pc.Vec3(0.9, 0.1, -8.0);
  probeTargets['ida_centro'] = new pc.Vec3(0.9, 0.1, -2.0);
  probeTargets['retorno_sur'] = new pc.Vec3(-0.9, 0.1, 7.0);

  // --- THE GREAT GATE OF OHM (Ω) (North Exit) ---
  // Stage 2B replaces the primitive placeholder with the calibrated Blender
  // asset while retaining the existing gameplay-owned moving wrapper.
  const omegaGateRoot = new pc.Entity('OmegaGate');
  omegaGateRoot.setPosition(0, 0, 11.5);
  plazaRoot.addChild(omegaGateRoot);

  const omegaSymbolEntity = new pc.Entity('MonumentalOmegaSymbol');
  omegaGateRoot.addChild(omegaSymbolEntity);

  const solenoidGate = new pc.Entity('SolenoidGate');
  solenoidGate.setPosition(0, OMEGA_GATE_TUNING.closedY, 11.5);
  solenoidGate.setEulerAngles(0, OMEGA_GATE_TUNING.yaw, 0);
  plazaRoot.addChild(solenoidGate);

  const omegaGateUrl = new URL(
    '../../../assets/runtime/ohmdal/plaza/heroes/omega-gate/omega-gate.glb',
    import.meta.url,
  ).href;
  const omegaGateReady = loadContainerEntity('omega-gate-hero', omegaGateUrl).then((gateVisual) => {
    const authoredRoot = (gateVisual.findByName('OmegaGate_Root') as pc.Entity | null) ?? gateVisual;
    const doorLeaves = authoredRoot.findByName('DoorLeaves') as pc.Entity | null;
    if (!doorLeaves || !doorLeaves.parent) throw new Error('Omega gate GLB is missing DoorLeaves');
    doorLeaves.parent.removeChild(doorLeaves);
    doorLeaves.setLocalPosition(
      -OMEGA_GATE_TUNING.center[0] * OMEGA_GATE_TUNING.scale,
      0,
      -OMEGA_GATE_TUNING.center[2] * OMEGA_GATE_TUNING.scale,
    );
    doorLeaves.setLocalScale(OMEGA_GATE_TUNING.scale, OMEGA_GATE_TUNING.scale, OMEGA_GATE_TUNING.scale);
    solenoidGate.addChild(doorLeaves);

    gateVisual.name = 'OmegaGateVisual';
    gateVisual.setLocalScale(OMEGA_GATE_TUNING.scale, OMEGA_GATE_TUNING.scale, OMEGA_GATE_TUNING.scale);
    gateVisual.setLocalPosition(
      -OMEGA_GATE_TUNING.center[0] * OMEGA_GATE_TUNING.scale,
      OMEGA_GATE_TUNING.y,
      -OMEGA_GATE_TUNING.center[2] * OMEGA_GATE_TUNING.scale,
    );
    const authoredYaw = new pc.Entity('OmegaGateAuthoredYaw');
    authoredYaw.setLocalEulerAngles(0, OMEGA_GATE_TUNING.yaw, 0);
    authoredYaw.addChild(gateVisual);
    omegaGateRoot.addChild(authoredYaw);

    const mechanicalAssembly = authoredRoot.findByName('MechanicalAssembly') as pc.Entity | null;
    const mechanicalComponents = new Set(
      (mechanicalAssembly?.findComponents('render') as pc.RenderComponent[] | undefined) ?? [],
    );
    for (const component of gateVisual.findComponents('render') as pc.RenderComponent[]) {
      component.castShadows = true;
      component.receiveShadows = true;
      if (!mechanicalComponents.has(component)) component.batchGroupId = plazaArtBatch.id;
    }
    for (const component of doorLeaves.findComponents('render') as pc.RenderComponent[]) {
      component.castShadows = true;
      component.receiveShadows = true;
    }
  });

  const gateLightLeft = new pc.Entity('GateLightLeft');
  gateLightLeft.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.4, 0.2),
    intensity: 0.25,
    range: 2.4,
  });
  gateLightLeft.setPosition(-2.0, 4.0, 10.8);
  plazaRoot.addChild(gateLightLeft);

  const gateLightRight = new pc.Entity('GateLightRight');
  gateLightRight.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.4, 0.2),
    intensity: 0.25,
    range: 2.4,
  });
  gateLightRight.setPosition(2.0, 4.0, 10.8);
  plazaRoot.addChild(gateLightRight);

  probeTargets['puerta_solenoide'] = new pc.Vec3(0, 2.2, 11.0);
  addCollider(0, 11.5, 7.8, 2.4);

  const ready = Promise.all([
    materialReady,
    vendorPropsReady,
    ohmHeroReady,
    omegaGateReady,
    galvanoscopeReady,
  ]).then(() => {
    app.batcher.generate([plazaArtBatch.id]);
  });

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

  return {
    app,
    ready,
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
