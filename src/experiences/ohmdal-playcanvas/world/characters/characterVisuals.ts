import * as pc from 'playcanvas';
import calibration from '../../../../../assets/runtime/ohmdal/characters/calibration.json';
import type { Arc1CommunityActors } from '../arc1/communityActors.ts';

export type CommunityCharacterId = 'edda' | 'lumen' | 'consejera' | 'yesca' | 'vega' | 'nereo';
export type CharacterAction = 'Idle' | 'Observe' | 'Explain' | 'Record' | 'Listen' | 'Operate';
export interface CharacterVisuals {
  ensure(id: CommunityCharacterId): Promise<void>;
  setAction(id: CommunityCharacterId, action: CharacterAction): void;
  setPaused(paused: boolean): void;
  diagnostics(): Record<string, unknown>;
}
const URLS: Record<CommunityCharacterId, string> = {
  edda: new URL('../../../../../assets/runtime/ohmdal/characters/edda.glb', import.meta.url).href,
  lumen: new URL('../../../../../assets/runtime/ohmdal/characters/lumen.glb', import.meta.url).href,
  consejera: new URL('../../../../../assets/runtime/ohmdal/characters/consejera.glb', import.meta.url).href,
  yesca: new URL('../../../../../assets/runtime/ohmdal/characters/yesca.glb', import.meta.url).href,
  vega: new URL('../../../../../assets/runtime/ohmdal/characters/vega.glb', import.meta.url).href,
  nereo: new URL('../../../../../assets/runtime/ohmdal/characters/nereo.glb', import.meta.url).href,
};
const HEIGHTS: Record<CommunityCharacterId, number> = { edda: 1.58, lumen: 1.78, consejera: 1.72, yesca: 1.70, vega: 1.65, nereo: 1.74 };
const ACTIONS: CharacterAction[] = ['Idle', 'Observe', 'Explain', 'Record', 'Listen', 'Operate'];

interface CharacterLoad {
  id: CommunityCharacterId;
  asset: pc.Asset;
  promise: Promise<void>;
  resolve: (value?: void | PromiseLike<void>) => void;
  reject: (reason?: unknown) => void;
  heading: pc.Entity | null;
  visual: pc.Entity | null;
  settled: boolean;
}

/** CC0 adaptations are streamed with their region. Semantic roots own gameplay. */
export function createCharacterVisuals(app: pc.Application, edda: pc.Entity, lumen: pc.Entity, community: Arc1CommunityActors): CharacterVisuals {
  const roots: Record<CommunityCharacterId, pc.Entity> = {
    edda, lumen, consejera: community.roots.councillor, yesca: community.roots.yesca,
    vega: community.roots.vega, nereo: community.roots.nereo,
  };
  const fallbacks: Record<CommunityCharacterId, pc.GraphNode[]> = {
    edda: [...edda.children], lumen: [...lumen.children],
    consejera: [community.actors.councillor.fallback], yesca: [community.actors.yesca.fallback],
    vega: [community.actors.vega.fallback], nereo: [community.actors.nereo.fallback],
  };
  const pending = new Map<CommunityCharacterId, CharacterLoad>();
  const visuals = new Map<CommunityCharacterId, pc.Entity>();
  const requested = new Map<CommunityCharacterId, CharacterAction>();
  let disposed = false;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cleanupLoad(load: CharacterLoad): void {
    if (visuals.get(load.id) === load.visual) visuals.delete(load.id);

    const heading = load.heading;
    const visual = load.visual;
    load.heading = null;
    load.visual = null;
    if (heading) {
      try { heading.destroy(); } catch { /* app teardown may already own the tree */ }
      // A partially built heading should own the visual. Only destroy the
      // visual separately when it remains attached after heading teardown.
      if (visual?.parent) {
        try { visual.destroy(); } catch { /* best effort during teardown */ }
      }
    } else if (visual) {
      try { visual.destroy(); } catch { /* best effort during teardown */ }
    }

    try { load.asset.unload(); } catch { /* asset may already be unloaded */ }
    try { app.assets.remove(load.asset); } catch { /* registry may be tearing down */ }
    load.asset.off();
  }

  function settleFailure(load: CharacterLoad, error: unknown): void {
    if (load.settled) return;
    load.settled = true;
    pending.delete(load.id);
    cleanupLoad(load);
    load.reject(error);
  }

  function settleSuccess(load: CharacterLoad): void {
    if (load.settled) return;
    load.settled = true;
    load.resolve();
  }

  app.once('destroy', () => {
    disposed = true;
    for (const load of pending.values()) {
      if (!load.settled) {
        load.settled = true;
        // A destroyed app cannot finish a pending visual load. Resolve the
        // caller so a teardown never leaves an awaited zone hanging forever.
        load.resolve();
      }
      cleanupLoad(load);
    }
    pending.clear();
    visuals.clear();
  });

  function ensure(id: CommunityCharacterId): Promise<void> {
    if (disposed) return Promise.resolve();
    const previous = pending.get(id);
    if (previous) return previous.promise;

    let resolvePromise!: CharacterLoad['resolve'];
    let rejectPromise!: CharacterLoad['reject'];
    const promise = new Promise<void>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    let asset: pc.Asset;
    try {
      asset = new pc.Asset(`ohmdal-character-${id}`, 'container', { url: URLS[id] });
    } catch (error) {
      return Promise.reject(error);
    }
    const load: CharacterLoad = {
      id,
      asset,
      promise,
      resolve: resolvePromise,
      reject: rejectPromise,
      heading: null,
      visual: null,
      settled: false,
    };
    pending.set(id, load);

    try {
      app.assets.add(asset);
      asset.once('error', (error) => settleFailure(load, error));
      asset.ready((loaded) => {
        if (load.settled) return;
        if (disposed) {
          load.settled = true;
          cleanupLoad(load);
          load.resolve();
          return;
        }
        try {
          const resource = loaded.resource as pc.ContainerResource & { animations: pc.Asset[] };
          const visual = resource.instantiateRenderEntity({ castShadows: true });
          load.visual = visual;
          visual.name = `CharacterVisual-${id}`;
          const t = calibration[id];
          const scale = HEIGHTS[id] / t.dims[1];
          const heading = new pc.Entity(`CharacterHeading-${id}`);
          load.heading = heading;
          // Authored glTF faces +Z; gameplay roots use PlayCanvas -Z.
          heading.setLocalEulerAngles(0, 180, 0);
          visual.setLocalScale(scale, scale, scale);
          visual.setLocalPosition(-t.center[0] * scale, t.groundOffset * scale, -t.center[2] * scale);
          heading.addChild(visual);
          roots[id].addChild(heading);
          visual.addComponent('anim', { activate: true });
          for (const action of ACTIONS) {
            if (action === 'Operate' && id !== 'edda') continue;
            const clip = resource.animations.find((candidate: pc.Asset) => (candidate.resource as pc.AnimTrack).name === action);
            if (!clip) throw new Error(`${id}: missing authored action ${action}`);
            visual.anim!.assignAnimation(action, clip.resource as pc.AnimTrack, undefined, 1, action !== 'Operate');
          }
          visual.anim!.baseLayer!.play(requested.get(id) ?? 'Idle');
          visual.anim!.speed = paused ? 0 : 1;
          visuals.set(id, visual);
          for (const fallback of fallbacks[id]) fallback.enabled = false;
          settleSuccess(load);
        } catch (error) {
          settleFailure(load, error);
        }
      });
      app.assets.load(asset);
    } catch (error) {
      settleFailure(load, error);
    }
    return promise;
  }
  return {
    ensure,
    setPaused(value) {
      paused = value || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      for (const visual of visuals.values()) if (visual.anim) visual.anim.speed = paused ? 0 : 1;
    },
    diagnostics() {
      return Object.fromEntries([...visuals].map(([id, visual]) => {
        const head = visual.findByName('Head');
        const arm = visual.findByName('upperarm_l');
        const foot = visual.findByName('foot_l');
        return [id, {
          action: visual.anim?.baseLayer?.activeState,
          time: visual.anim?.baseLayer?.activeStateCurrentTime,
          speed: visual.anim?.speed,
          headRotation: head?.getLocalRotation().toArray(),
          armRotation: arm?.getLocalRotation().toArray(),
          footWorld: foot?.getPosition().toArray(),
          rootWorld: roots[id].getPosition().toArray(),
          fallbackHidden: fallbacks[id].every((node) => !node.enabled),
        }];
      }));
    },
    setAction(id, action) {
      if (requested.get(id) === action) return;
      requested.set(id, action);
      visuals.get(id)?.anim?.baseLayer?.transition(action, 0.25);
    },
  };
}
