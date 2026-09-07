import * as pc from 'playcanvas';

export const LIGHTHOUSE_TOWER_DEFAULT_POSITION = [0, 0, 8] as const;
export const LIGHTHOUSE_TOWER_DEFAULT_YAW_DEGREES = 0;

/**
 * Existing visual shell bindings replaced by the tower candidate after its
 * container is ready.  The Fresnel lens, lamp and state-driven sweep are
 * deliberately absent from this list.
 */
export const LIGHTHOUSE_TOWER_SOURCE_ENTITIES_TO_HIDE = [
  'LighthouseBeaconBase',
  'LighthouseBeaconTower',
  'LighthouseBeaconCap',
  'LighthouseLanternLowerRing',
  'LighthouseLanternUpperRing',
  'LighthouseLanternBrace1',
  'LighthouseLanternBrace2',
  'LighthouseLanternBrace3',
  'LighthouseLanternBrace4',
  'LighthouseLanternBrace5',
  'LighthouseLanternBrace6',
  'LighthouseLanternBrace7',
  'LighthouseLanternBrace8',
  'LighthouseCupolaAuthored',
  'LighthouseFinialAuthored',
] as const;

export interface LighthouseTowerLoadOptions {
  position?: pc.Vec3 | [number, number, number];
  yawDegrees?: number;
  enabled?: boolean;
  castShadows?: boolean;
  sourceBeacon?: pc.Entity | null;
}

export interface LighthouseTowerHandle {
  root: pc.Entity;
  ready: Promise<void>;
  hiddenSourceEntities: pc.Entity[];
  dispose(): void;
}

const assetUrl = new URL(
  '../../../../../assets/runtime/ohmdal/regional-heroes/lighthouse-tower/lighthouse-tower.glb',
  import.meta.url,
).href;

function setPosition(entity: pc.Entity, value: pc.Vec3 | [number, number, number]): void {
  if (value instanceof pc.Vec3) entity.setLocalPosition(value);
  else entity.setLocalPosition(value[0], value[1], value[2]);
}

function findSourceBeacon(parent: pc.Entity, sourceBeacon?: pc.Entity | null): pc.Entity | null {
  if (sourceBeacon) return sourceBeacon;
  return parent.findByName('LighthouseBeacon') as pc.Entity | null;
}

/**
 * Loads the tower as a visual child of lighthouseRoot.  Source shell entities
 * are hidden only after the GLB has instantiated successfully, so a failed
 * load leaves the existing lighthouse readable.  No collider or state
 * material is created here.
 */
export function loadLighthouseTower(
  app: pc.Application,
  parent: pc.Entity,
  options: LighthouseTowerLoadOptions = {},
): LighthouseTowerHandle {
  const root = new pc.Entity('LighthouseTowerCandidate');
  const position = options.position ?? [0, 0, 8] as [number, number, number];
  setPosition(root, position);
  root.setLocalEulerAngles(0, options.yawDegrees ?? LIGHTHOUSE_TOWER_DEFAULT_YAW_DEGREES, 0);
  root.enabled = false;
  parent.addChild(root);

  const asset = new pc.Asset('ohmdal-lighthouse-tower', 'container', { url: assetUrl });
  app.assets.add(asset);
  let visual: pc.Entity | null = null;
  let settled = false;
  let disposed = false;
  let hiddenSourceEntities: pc.Entity[] = [];
  const sourceBeacon = findSourceBeacon(parent, options.sourceBeacon);
  const previousRenderState = new Map<pc.RenderComponent, { enabled: boolean; batchGroupId: number }>();

  let resolveReady!: () => void;
  let rejectReady!: (error: unknown) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const regenerateGroups = (groupIds: ReadonlySet<number>): void => {
    const ids = [...groupIds].filter((id) => id >= 0 && app.batcher.getGroupById(id));
    if (ids.length) app.batcher.generate(ids);
  };

  const restoreSource = () => {
    const groups = new Set<number>();
    for (const [render, previous] of previousRenderState) {
      if (previous.batchGroupId >= 0 && app.batcher.getGroupById(previous.batchGroupId)) {
        render.batchGroupId = previous.batchGroupId;
        groups.add(previous.batchGroupId);
      } else {
        render.batchGroupId = -1;
      }
      render.enabled = previous.enabled;
    }
    regenerateGroups(groups);
    hiddenSourceEntities = [];
    previousRenderState.clear();
  };

  const fail = (error: unknown) => {
    if (settled || disposed) return;
    settled = true;
    disposed = true;
    restoreSource();
    visual?.destroy();
    visual = null;
    root.destroy();
    asset.off();
    asset.unload();
    app.assets.remove(asset);
    rejectReady(error);
  };

  const finish = (loaded: pc.Asset) => {
    if (settled || disposed) return;
    try {
      visual = (loaded.resource as pc.ContainerResource).instantiateRenderEntity({
        castShadows: options.castShadows ?? true,
      });
      visual.name = 'LighthouseTowerImportedVisual';
      root.addChild(visual);
      root.enabled = options.enabled ?? true;

      if (sourceBeacon) {
        const groups = new Set<number>();
        for (const name of LIGHTHOUSE_TOWER_SOURCE_ENTITIES_TO_HIDE) {
          const entity = sourceBeacon.findByName(name) as pc.Entity | null;
          if (!entity || hiddenSourceEntities.includes(entity)) continue;
          const renders = entity.findComponents('render') as pc.RenderComponent[];
          if (!renders.length) continue;
          hiddenSourceEntities.push(entity);
          for (const render of renders) {
            if (previousRenderState.has(render)) continue;
            const previous = { enabled: render.enabled, batchGroupId: render.batchGroupId };
            previousRenderState.set(render, previous);
            if (previous.batchGroupId >= 0) groups.add(previous.batchGroupId);
            render.batchGroupId = -1;
            render.enabled = false;
          }
        }
        regenerateGroups(groups);
      }
      settled = true;
      resolveReady();
    } catch (error) {
      fail(error);
    }
  };

  try {
    asset.once('error', fail);
    asset.ready(finish);
    app.assets.load(asset);
  } catch (error) {
    fail(error);
  }

  return {
    root,
    ready,
    get hiddenSourceEntities() {
      return hiddenSourceEntities;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (!settled) {
        settled = true;
        resolveReady();
      }
      restoreSource();
      visual?.destroy();
      visual = null;
      root.destroy();
      asset.off();
      asset.unload();
      app.assets.remove(asset);
      settled = true;
    },
  };
}
