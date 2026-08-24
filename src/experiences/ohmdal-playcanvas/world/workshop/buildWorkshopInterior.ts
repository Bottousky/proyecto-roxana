import * as pc from 'playcanvas';

export interface WorkshopInteriorMaterials {
  matWoodDark: pc.StandardMaterial;
  matStoneDark: pc.StandardMaterial;
  matWood: pc.StandardMaterial;
  matBrass: pc.StandardMaterial;
  matCopperClean: pc.StandardMaterial;
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
    matWoodDark,
    matStoneDark,
    matWood,
    matBrass,
    matCopperClean,
    matLumenApron,
    matSkin,
  } = materials;

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

  return { workshopInteriorRoot, lumenNpcEntity };
}
