import * as pc from 'playcanvas';

export interface WorkshopInteriorMaterials {
  matStone: pc.StandardMaterial;
  matWoodDark: pc.StandardMaterial;
  matStoneDark: pc.StandardMaterial;
  matWood: pc.StandardMaterial;
  matBrass: pc.StandardMaterial;
  matCopperClean: pc.StandardMaterial;
  matWorkshopInterior: pc.StandardMaterial;
  matLumenApron: pc.StandardMaterial;
  matSkin: pc.StandardMaterial;
}

export interface WorkshopInteriorDependencies {
  app: pc.Application;
  materials: WorkshopInteriorMaterials;
  probeTargets: Record<string, pc.Vec3>;
  addCollider: (x: number, z: number, w: number, d: number) => void;
}

export interface WorkshopInteriorElements {
  workshopInteriorRoot: pc.Entity;
  lumenNpcEntity: pc.Entity;
}

export function buildWorkshopInterior({
  app,
  materials,
  probeTargets,
  addCollider,
}: WorkshopInteriorDependencies): WorkshopInteriorElements {
  const {
    matStone,
    matWoodDark,
    matStoneDark,
    matWood,
    matBrass,
    matCopperClean,
    matWorkshopInterior,
    matLumenApron,
    matSkin,
  } = materials;

  // ========================================================
  // --- 6. LUMEN'S WORKSHOP INTERIOR (workshopInteriorRoot) -
  // ========================================================
  const workshopInteriorRoot = new pc.Entity('WorkshopInteriorRoot');
  workshopInteriorRoot.setPosition(-60, 0, 0);
  app.root.addChild(workshopInteriorRoot);

  const addBox = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: pc.StandardMaterial,
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    if (entity.render) {
      entity.render.castShadows = false;
      entity.render.receiveShadows = true;
    }
    parent.addChild(entity);
    return entity;
  };

  const addCylinder = (
    parent: pc.Entity,
    name: string,
    position: [number, number, number],
    scale: [number, number, number],
    material: pc.StandardMaterial,
    rotation: [number, number, number] = [0, 0, 0],
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'cylinder', material });
    entity.setLocalPosition(...position);
    entity.setLocalEulerAngles(...rotation);
    entity.setLocalScale(...scale);
    if (entity.render) {
      entity.render.castShadows = false;
      entity.render.receiveShadows = true;
    }
    parent.addChild(entity);
    return entity;
  };

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
    intensity: 2.2,
    range: 12.0,
    castShadows: false,
  });
  wChandelier.setPosition(0, 3.8, 0);
  workshopInteriorRoot.addChild(wChandelier);

  // Authored support layer: light wall panels and exposed timber framing make
  // the room readable without adding another shadow caster or touching Plaza.
  const authoredRoot = new pc.Entity('WorkshopAuthoredSupportRoot');
  workshopInteriorRoot.addChild(authoredRoot);
  addBox(authoredRoot, 'WorkshopNorthPlasterInset', [0, 2.55, 4.76], [10.8, 4.15, 0.1], matStone);
  addBox(authoredRoot, 'WorkshopEastPlasterInset', [5.76, 2.55, 0], [0.1, 4.15, 8.9], matStone);
  addBox(authoredRoot, 'WorkshopWestPlasterInset', [-5.76, 2.55, 0], [0.1, 4.15, 8.9], matStone);
  addBox(authoredRoot, 'WorkshopCeilingPanel', [0, 4.72, 0], [11.5, 0.12, 9.5], matWoodDark);
  for (const z of [-3.6, 0, 3.6]) {
    addBox(authoredRoot, `WorkshopCeilingTie${z}`, [0, 4.45, z], [11.4, 0.22, 0.28], matWoodDark);
  }
  for (const x of [-5.55, 5.55]) {
    for (const z of [-3.2, 0, 3.2]) {
      addBox(authoredRoot, `WorkshopWallPost${x}:${z}`, [x, 2.35, z], [0.24, 4.4, 0.28], matWood);
    }
  }
  addBox(authoredRoot, 'WorkshopEntryRunner', [0, 0.035, -2.25], [2.2, 0.06, 5.1], matWood);
  addBox(authoredRoot, 'WorkshopEntryConductorLeft', [-0.82, 0.08, -2.25], [0.08, 0.04, 4.8], matCopperClean);
  addBox(authoredRoot, 'WorkshopEntryConductorRight', [0.82, 0.08, -2.25], [0.08, 0.04, 4.8], matCopperClean);

  // Lumen's Heavy Master Workbench
  const wWorkbench = new pc.Entity('W_MasterWorkbench');
  wWorkbench.addComponent('render', { type: 'box', material: matWood });
  wWorkbench.setPosition(0, 0.5, 0.8);
  wWorkbench.setLocalScale(4.5, 1.0, 1.8);
  workshopInteriorRoot.addChild(wWorkbench);

  addBox(authoredRoot, 'WorkshopBenchLowerShelf', [0, 0.26, 0.8], [4.1, 0.12, 1.45], matWoodDark);
  for (const x of [-1.8, 1.8]) {
    for (const z of [0.28, 1.32]) {
      addBox(authoredRoot, `WorkshopBenchLeg${x}:${z}`, [x, 0.38, z], [0.22, 0.76, 0.22], matWoodDark);
    }
  }
  addBox(authoredRoot, 'WorkshopBenchViseBase', [-1.62, 1.12, 0.45], [0.62, 0.18, 0.46], matBrass);
  addBox(authoredRoot, 'WorkshopBenchViseFixedJaw', [-1.86, 1.34, 0.45], [0.14, 0.42, 0.5], matStoneDark);
  addBox(authoredRoot, 'WorkshopBenchViseMovingJaw', [-1.35, 1.34, 0.45], [0.14, 0.42, 0.5], matStoneDark);
  addCylinder(authoredRoot, 'WorkshopBenchViseScrew', [-1.08, 1.18, 0.45], [0.08, 0.35, 0.08], matCopperClean, [0, 0, 90]);

  const diagnosticBackboard = new pc.Entity('WorkshopDiagnosticBackboard');
  authoredRoot.addChild(diagnosticBackboard);
  addBox(diagnosticBackboard, 'WorkshopDiagnosticBoard', [0, 2.15, 4.68], [5.8, 2.4, 0.16], matWood);
  addBox(diagnosticBackboard, 'WorkshopDiagnosticBus', [0, 2.5, 4.54], [4.9, 0.1, 0.08], matCopperClean);
  for (const x of [-2, -1, 0, 1, 2]) {
    addCylinder(diagnosticBackboard, `WorkshopDiagnosticTerminal${x}`, [x, 2.5, 4.4], [0.12, 0.16, 0.12], matBrass, [90, 0, 0]);
    addBox(diagnosticBackboard, `WorkshopToolSilhouette${x}`, [x, 1.72, 4.49], [0.12, 0.82, 0.08], x % 2 === 0 ? matBrass : matCopperClean);
  }

  addBox(authoredRoot, 'WorkshopGalvanoscopeDock', [0, 1.16, 0.38], [0.9, 0.18, 0.58], matWorkshopInterior);
  addCylinder(authoredRoot, 'WorkshopGalvanoscopeDockContactLeft', [-0.28, 1.34, 0.38], [0.09, 0.12, 0.09], matBrass);
  addCylinder(authoredRoot, 'WorkshopGalvanoscopeDockContactRight', [0.28, 1.34, 0.38], [0.09, 0.12, 0.09], matBrass);

  // Vise, Wire Spools, Glass Battery Jars on Table
  const wBatteryJar = new pc.Entity('W_BatteryJar');
  wBatteryJar.addComponent('render', { type: 'cylinder', material: matBrass });
  wBatteryJar.setPosition(-0.62, 1.25, 0.82);
  wBatteryJar.setLocalScale(0.35, 0.5, 0.35);
  workshopInteriorRoot.addChild(wBatteryJar);

  const wCoilSpool = new pc.Entity('W_CoilSpool');
  wCoilSpool.addComponent('render', { type: 'cylinder', material: matCopperClean });
  wCoilSpool.setPosition(1.3, 1.2, 0.8);
  wCoilSpool.setLocalScale(0.4, 0.4, 0.4);
  workshopInteriorRoot.addChild(wCoilSpool);

  for (const x of [-0.25, 0.25]) {
    addCylinder(authoredRoot, `WorkshopBatteryJar${x}`, [x, 1.26, 0.86], [0.22, 0.4, 0.22], matWorkshopInterior);
    addCylinder(authoredRoot, `WorkshopBatteryTerminal${x}`, [x, 1.52, 0.86], [0.08, 0.1, 0.08], matCopperClean);
  }
  for (const x of [-4.7, 4.7]) {
    addBox(authoredRoot, `WorkshopSideShelf${x}`, [x, 1.7, 1.2], [1.35, 0.16, 4.8], matWood);
    addBox(authoredRoot, `WorkshopSideShelfBrace${x}`, [x, 1.0, 1.2], [0.22, 1.4, 4.4], matWoodDark);
    for (const z of [-0.35, 1.15, 2.65]) {
      addCylinder(authoredRoot, `WorkshopSideSpool${x}:${z}`, [x, 2.02, z], [0.34, 0.22, 0.34], matCopperClean, [0, 0, 90]);
    }
  }

  addBox(authoredRoot, 'WorkshopPracticalShade', [0, 3.48, 0.8], [1.8, 0.16, 0.75], matBrass);
  addBox(authoredRoot, 'WorkshopPracticalBounce', [0, 3.34, 0.8], [1.45, 0.06, 0.55], matWorkshopInterior);
  const benchFill = new pc.Entity('WorkshopBenchPracticalLight');
  benchFill.addComponent('light', {
    type: 'point',
    color: new pc.Color(1.0, 0.66, 0.34),
    intensity: 1.1,
    range: 5.8,
    castShadows: false,
  });
  benchFill.setLocalPosition(0, 3.2, 0.55);
  authoredRoot.addChild(benchFill);

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
  probeTargets['lumen_taller_bateria'] = new pc.Vec3(-60.62, 1.3, 0.82);
  probeTargets['lumen_taller_galvanoscope_dock'] = new pc.Vec3(-60, 1.25, 0.38);
  addCollider(-60, 0.8, 4.6, 2.0);
  addCollider(-60, 2.4, 1.2, 1.2);

  // Everything except Lumen is static and zone-local. Batch by material so the
  // authored support pass stays inside the established mobile draw-call envelope.
  const workshopStaticBatch = app.batcher.addGroup('OhmdalWorkshopStaticArt', false, 20);
  const lumenRenders = new Set(lumenNpcEntity.findComponents('render') as pc.RenderComponent[]);
  for (const component of workshopInteriorRoot.findComponents('render') as pc.RenderComponent[]) {
    if (!lumenRenders.has(component)) component.batchGroupId = workshopStaticBatch.id;
  }
  app.batcher.generate([workshopStaticBatch.id]);

  return { workshopInteriorRoot, lumenNpcEntity };
}
