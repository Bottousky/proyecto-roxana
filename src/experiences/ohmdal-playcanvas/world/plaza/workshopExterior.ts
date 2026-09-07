import * as pc from 'playcanvas';

export const WORKSHOP_EXTERIOR_DEFAULT_POSITION: readonly [number, number, number] = [-10.5, 0, -4];
export const WORKSHOP_EXTERIOR_DEFAULT_YAW_DEGREES = 0;

/** Existing procedural visuals to disable before a future batcher integration. */
export const WORKSHOP_EXTERIOR_SOURCE_ENTITIES_TO_HIDE = [
  'WorkshopAuthoredShell',
  'WorkshopStoneBase',
  'WorkshopRoofEastAuthored',
  'WorkshopRoofWestAuthored',
  'WorkshopRidge',
  'WorkshopChimney',
  'WorkshopChimneyCap',
  'WorkshopFrameEast-6.9',
  'WorkshopFrameEast-4',
  'WorkshopFrameEast-1.1',
  'WorkshopFrameWest-6.9',
  'WorkshopFrameWest-4',
  'WorkshopFrameWest-1.1',
  'WorkshopDoorRecess',
  'WorkshopDoorJamb0',
  'WorkshopDoorJamb1',
  'WorkshopDoorConductor0',
  'WorkshopDoorConductor1',
  'WorkshopDoorLintel',
  'WorkshopDoorHeader',
  'WorkshopThreshold',
  'WorkshopThresholdStrip',
  'WorkshopWindowFrame-6.05',
  'WorkshopWindowFrame-1.95',
  'WorkshopWindowVoid-6.05',
  'WorkshopWindowVoid-1.95',
  'WorkshopWindowSill-6.05',
  'WorkshopWindowSill-1.95',
  'WorkshopWindowMullion-6.05',
  'WorkshopWindowMullion-1.95',
  'WorkshopServiceCluster',
  'WorkshopLanternBracket',
  'WorkshopLanternHousing',
] as const;

export interface WorkshopExteriorLoadOptions {
  position?: readonly [number, number, number];
  yawDegrees?: number;
  enabled?: boolean;
  castShadows?: boolean;
}

export interface WorkshopExteriorHandle {
  root: pc.Entity;
  ready: Promise<void>;
  dispose: () => void;
}

/**
 * Load the visual-only workshop candidate below a semantic root.
 *
 * The root's default world position matches the existing authored shell and
 * collider. The imported GLB already uses the +Y/+Z local contract, so the
 * loader deliberately applies no scale or hidden calibration correction.
 */
export function loadWorkshopExterior(
  app: pc.Application,
  parent: pc.Entity,
  options: WorkshopExteriorLoadOptions = {},
): WorkshopExteriorHandle {
  const position = options.position ?? WORKSHOP_EXTERIOR_DEFAULT_POSITION;
  const yawDegrees = options.yawDegrees ?? WORKSHOP_EXTERIOR_DEFAULT_YAW_DEGREES;
  const enabledAfterLoad = options.enabled ?? true;
  const castShadows = options.castShadows ?? true;
  const asset = new pc.Asset('OhmdalWorkshopExterior', 'container', {
    url: new URL('../../../../../assets/runtime/ohmdal/plaza/workshop-exterior/workshop-exterior.glb', import.meta.url).href,
  });
  const root = new pc.Entity('WorkshopExteriorRoot');
  root.setPosition(...position);
  root.setEulerAngles(0, yawDegrees, 0);
  root.enabled = false;
  parent.addChild(root);
  app.assets.add(asset);

  let visual: pc.Entity | null = null;
  let destroyed = false;
  let settled = false;
  let resolveReady!: () => void;
  let rejectReady!: (error: unknown) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const dispose = () => {
    if (destroyed) return;
    destroyed = true;
    app.off('destroy', dispose);
    visual?.destroy();
    visual = null;
    root.destroy();
    asset.off();
    asset.unload();
    app.assets.remove(asset);
    if (!settled) {
      settled = true;
      resolveReady();
    }
  };

  const fail = (error: unknown) => {
    if (destroyed || settled) return;
    settled = true;
    dispose();
    rejectReady(error);
  };

  asset.once('error', fail);
  asset.ready((loaded) => {
    if (destroyed) {
      asset.unload();
      return;
    }
    try {
      visual = (loaded.resource as pc.ContainerResource).instantiateRenderEntity({ castShadows });
      visual.name = 'WorkshopExteriorModel';
      root.addChild(visual);
      for (const render of visual.findComponents('render') as pc.RenderComponent[]) {
        render.castShadows = castShadows;
        render.receiveShadows = true;
      }
      root.enabled = enabledAfterLoad;
      settled = true;
      resolveReady();
    } catch (error) {
      fail(error);
    }
  });
  app.once('destroy', dispose);
  try { app.assets.load(asset); } catch (error) { fail(error); }

  return { root, ready, dispose };
}
