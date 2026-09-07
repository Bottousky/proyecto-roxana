import * as pc from 'playcanvas';

export const CASTLE_DISTRIBUTOR_DEFAULT_POSITION = [0, 0, 0] as const;
export const CASTLE_DISTRIBUTOR_DEFAULT_YAW_DEGREES = 0;

/**
 * Existing visual shell bindings replaced after the candidate is ready.
 * Gameplay conductors, return/trip controls, service loads and branch
 * isolators are intentionally absent from this list.
 */
export const CASTLE_DISTRIBUTOR_SOURCE_ENTITIES_TO_HIDE = [
  'CastlePanelBody',
  'CastlePanelFace',
  'CastleDistributorPlinth',
  'CastleDistributorCopperRim',
  'CastleDistributorCore',
] as const;

export const CASTLE_DISTRIBUTOR_SOURCE_ENTITIES_PRESERVED = [
  'CastlePanelBusKnob',
  'CastlePanelInput',
  'CastlePanelTripPin',
  'CastlePanelReturnLink',
  'CastleMainBus',
  'CastleBranchA',
  'CastleBranchB',
  'CastleBranchC',
  'CastleBranchIsolatorA',
  'CastleBranchIsolatorB',
  'CastleBranchIsolatorC',
] as const;

export interface CastleDistributorLoadOptions {
  position?: pc.Vec3 | [number, number, number];
  yawDegrees?: number;
  enabled?: boolean;
  castShadows?: boolean;
  sourceParent?: pc.Entity | null;
}

export interface CastleDistributorHandle {
  root: pc.Entity;
  ready: Promise<void>;
  hiddenSourceEntities: pc.Entity[];
  dispose(): void;
}

const assetUrl = new URL(
  '../../../../../assets/runtime/ohmdal/regional-heroes/castle-distributor/castle-distributor.glb',
  import.meta.url,
).href;

function setPosition(entity: pc.Entity, value: pc.Vec3 | [number, number, number]): void {
  if (value instanceof pc.Vec3) entity.setLocalPosition(value);
  else entity.setLocalPosition(value[0], value[1], value[2]);
}

function findEntity(parent: pc.Entity, name: string): pc.Entity | null {
  return parent.findByName(name) as pc.Entity | null;
}

/**
 * Loads the distributor visual at CastleDistributionPanel local origin.
 * Existing source bindings are hidden only after successful instantiation,
 * keeping the previous readable state on load failure.
 */
export function loadCastleDistributor(
  app: pc.Application,
  parent: pc.Entity,
  options: CastleDistributorLoadOptions = {},
): CastleDistributorHandle {
  const root = new pc.Entity('CastleDistributorCandidate');
  const position = options.position ?? [0, 0, 0] as [number, number, number];
  setPosition(root, position);
  root.setLocalEulerAngles(0, options.yawDegrees ?? CASTLE_DISTRIBUTOR_DEFAULT_YAW_DEGREES, 0);
  root.enabled = false;
  parent.addChild(root);

  const asset = new pc.Asset('ohmdal-castle-distributor', 'container', { url: assetUrl });
  app.assets.add(asset);
  const sourceParent = options.sourceParent ?? parent;
  let visual: pc.Entity | null = null;
  let settled = false;
  let disposed = false;
  let hiddenSourceEntities: pc.Entity[] = [];
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
      visual.name = 'CastleDistributorImportedVisual';
      root.addChild(visual);
      root.enabled = options.enabled ?? true;

      const groups = new Set<number>();
      for (const name of CASTLE_DISTRIBUTOR_SOURCE_ENTITIES_TO_HIDE) {
        const entity = findEntity(sourceParent, name);
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
