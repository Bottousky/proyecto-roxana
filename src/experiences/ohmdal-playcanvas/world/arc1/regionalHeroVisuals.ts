import * as pc from 'playcanvas';
import type { Arc1GreyboxElements } from './buildArc1Greybox.ts';
import { loadLighthouseTower, type LighthouseTowerHandle } from './lighthouseTower.ts';
import { loadCastleDistributor, type CastleDistributorHandle } from './castleDistributor.ts';
import { loadLighthouseWorkboat } from './lighthouseWorkboat.ts';

type HeroId = 'forge' | 'lighthouse' | 'manantial';
const urls: Record<HeroId, string> = {
  forge: new URL('../../../../../assets/runtime/ohmdal/regional-heroes/forge-hearth.glb', import.meta.url).href,
  lighthouse: new URL('../../../../../assets/runtime/ohmdal/regional-heroes/fresnel.glb', import.meta.url).href,
  manantial: new URL('../../../../../assets/runtime/ohmdal/regional-heroes/manantial-generator.glb', import.meta.url).href,
};

/** Authored optics/hearth replace visual shells, keeping source bindings and roots. */
export function createRegionalHeroVisuals(app: pc.Application, world: Arc1GreyboxElements,
  manantial: { root: pc.Entity; rotor: pc.Entity }) {
  const pending = new Map<HeroId, Promise<void>>();
  const assets = new Set<pc.Asset>();
  const visualRoots: pc.Entity[] = [];
  const settleOnDestroy = new Set<() => void>();
  let thermal: pc.StandardMaterial[] = [];
  let optical: pc.StandardMaterial[] = [];
  let heat = 0, beacon = false, destroyed = false;
  let generatorRotor: pc.GraphNode | null = null;
  let tower: LighthouseTowerHandle | null = null;
  let towerReady: Promise<void> | null = null;
  let workboat: ReturnType<typeof loadLighthouseWorkboat> | null = null;
  let workboatReady: Promise<void> | null = null;
  const ensureWorkboat = (): Promise<void> => {
    if (workboatReady) return workboatReady;
    workboat = loadLighthouseWorkboat(app, world.roots.lighthouse);
    workboatReady = workboat.ready.catch(error => {
      workboat?.dispose(); workboat = null; workboatReady = null;
      throw error;
    });
    return workboatReady;
  };
  let distributor: CastleDistributorHandle | null = null;
  let distributorReady: Promise<void> | null = null;
  const ensureDistributor = (): Promise<void> => {
    if (distributorReady) return distributorReady;
    distributor = loadCastleDistributor(app, world.roots.castle, { sourceParent: world.roots.castle });
    distributorReady = distributor.ready.catch(error => {
      distributor?.dispose(); distributor = null; distributorReady = null;
      throw error;
    });
    return distributorReady;
  };
  const ensureTower = (): Promise<void> => {
    if (towerReady) return towerReady;
    tower = loadLighthouseTower(app, world.roots.lighthouse, { sourceBeacon: world.lighthouseBeacon });
    towerReady = tower.ready.catch(error => {
      tower?.dispose(); tower = null; towerReady = null;
      throw error;
    });
    return towerReady;
  };
  const update = () => {
    for (const material of thermal) {
      material.emissive.set(0.9, 0.16, 0.025);
      material.emissiveIntensity = heat * 2.4;
      material.update();
    }
    for (const material of optical) {
      material.emissive.set(0.12, 0.36, 0.48);
      material.emissiveIntensity = beacon ? 2.5 : 0;
      material.update();
    }
  };
  const materialsOf = (node: pc.GraphNode | null): pc.StandardMaterial[] => node instanceof pc.Entity
    ? [...new Set((node.findComponents('render') as pc.RenderComponent[]).flatMap((r) => r.meshInstances.map((mi) => mi.material as pc.StandardMaterial)))] : [];

  function ensure(id: HeroId): Promise<void> {
    if (destroyed) return Promise.resolve();
    const previous = pending.get(id);
    if (previous) return previous;
    const asset = new pc.Asset(`ohmdal-regional-${id}`, 'container', { url: urls[id] });
    assets.add(asset); app.assets.add(asset);
    let visual: pc.Entity | null = null;
    let sweep: pc.Entity | null = null;
    let rollbackIntegration: (() => void) | null = null;
    let settled = false;
    let finish!: () => void;
    let fail!: (error: unknown) => void;
    const loading = new Promise<void>((resolve, reject) => {
      finish = () => {
        if (settled) return;
        settled = true;
        settleOnDestroy.delete(finish);
        rollbackIntegration = null;
        resolve();
      };
      fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        settleOnDestroy.delete(finish);
        rollbackIntegration?.();
        rollbackIntegration = null;
        if (visual) {
          const visualIndex = visualRoots.indexOf(visual);
          if (visualIndex >= 0) visualRoots.splice(visualIndex, 1);
          visual.destroy();
          visual = null;
        }
        // Do not let setPower keep writing to materials owned by a failed
        // visual. A later ensure() retry replaces these arrays from scratch.
        if (id === 'forge') thermal = [];
        else if (id === 'lighthouse') optical = [];
        else generatorRotor = null;
        if (pending.get(id) === loading) pending.delete(id);
        asset.off();
        asset.unload();
        app.assets.remove(asset);
        assets.delete(asset);
        reject(error);
      };
    });
    // Install the cache entry before registering callbacks or starting the
    // request. A synchronous loader failure must be retryable too.
    pending.set(id, loading);
    settleOnDestroy.add(finish);

    try {
      asset.once('error', fail);
      asset.ready((loaded) => {
        if (destroyed) { asset.unload(); finish(); return; }
        try {
          visual = new pc.Entity(`RegionalHero-${id}`);
          // Preserve imported root transforms (the hearth's authored axis
          // conversion lives there). Heading belongs to a separate wrapper.
          visual.addChild((loaded.resource as pc.ContainerResource).instantiateRenderEntity({ castShadows: true }));
          visual.setLocalEulerAngles(0, 180, 0);
          if (id === 'forge') {
            // The candidate's scanned iron dominated the hearth with bright,
            // stretched reflections. Retain its fine maps at a restrained
            // strength; separate refractory stone, cast iron and copper.
            for (const material of materialsOf(visual)) {
              if (material.name === 'ForgeHearth_ThermalElement') continue;
              material.glossMap = null;
              material.glossInvert = false;
              material.bumpiness = 0.18;
              if (material.name === 'ForgeHearth_Stone') {
                material.diffuse.set(0.43, 0.39, 0.33); material.metalness = 0; material.gloss = 0.14;
              } else if (material.name === 'ForgeHearth_Iron') {
                material.diffuse.set(0.22, 0.24, 0.23); material.metalnessMap = null;
                material.metalness = 0.55; material.gloss = 0.27;
              } else if (material.name === 'ForgeHearth_Copper') {
                material.diffuse.set(0.43, 0.26, 0.15); material.metalness = 0.65; material.gloss = 0.32;
              } else if (material.name === 'ForgeHearth_Ceramic') {
                material.diffuse.set(0.68, 0.64, 0.55); material.metalness = 0.03; material.gloss = 0.2;
              }
              material.update();
            }
            thermal = materialsOf(visual.findByName('ThermalElement'));
            if (!thermal.length) throw new Error('Forge hero missing ThermalElement');
            const shellRenders = [...world.forgeHeater.children].flatMap((child) =>
              child instanceof pc.Entity
                ? (child.findComponents('render') as pc.RenderComponent[]).map((render) => ({ render, enabled: render.enabled }))
                : [],
            );
            rollbackIntegration = () => {
              for (const { render, enabled } of shellRenders) render.enabled = enabled;
            };
            for (const { render } of shellRenders) render.enabled = false;
            world.forgeHeater.addChild(visual);
          } else if (id === 'manantial') {
            generatorRotor = visual.findByName('ManantialGeneratorRotorAssembly');
            if (!generatorRotor) throw new Error('Manantial hero missing rotor assembly');
            const names = ['ManantialGeneratorStator', 'ManantialGeneratorEndCap', 'ManantialGeneratorShaft', 'TurbineRotor'];
            const oldRenders = names.flatMap((name) => {
              const entity = manantial.root.findByName(name) as pc.Entity | null;
              return entity?.render ? [{ render: entity.render, enabled: entity.render.enabled, group: entity.render.batchGroupId }] : [];
            });
            const groups = [...new Set(oldRenders.map((entry) => entry.group).filter((id) => id >= 0))];
            rollbackIntegration = () => {
              for (const old of oldRenders) {
                old.render.batchGroupId = old.group;
                old.render.enabled = old.enabled;
              }
              if (groups.length) app.batcher.generate(groups);
            };
            for (const old of oldRenders) {
              old.render.batchGroupId = -1;
              old.render.enabled = false;
            }
            if (groups.length) app.batcher.generate(groups);
            // Clear the adjacent sluice's east jamb inside the existing room.
            visual.setLocalScale(0.8, 0.8, 0.8);
            visual.setLocalPosition(0, 0.8, 22.55);
            manantial.root.addChild(visual);
          } else {
            visual.setLocalScale(0.75, 0.75, 0.75);
            visual.setLocalPosition(0, 5.6, 0);
            optical = materialsOf(visual.findByName('Cold blue optical glass'));
            if (!optical.length) throw new Error('Faro hero missing optical glass');
            const names = ['LighthouseFresnelLens','LighthouseLanternLowerRing','LighthouseLanternUpperRing','LighthouseBeaconLamp',
              ...[2, 4, 6, 8].map((i) => `LighthouseLanternBrace${i}`)];
            const shellRenders = names.flatMap((name) => {
              const entity = world.lighthouseBeacon.findByName(name) as pc.Entity | null;
              return entity?.render ? [{ render: entity.render, enabled: entity.render.enabled }] : [];
            });
            const roof = world.lighthouseBeacon.findByName('LighthouseCupolaAuthored') as pc.Entity | null;
            const roofPosition = roof?.getLocalPosition().clone() ?? null;
            const finial = world.lighthouseBeacon.findByName('LighthouseFinialAuthored') as pc.Entity | null;
            const finialPosition = finial?.getLocalPosition().clone() ?? null;
            const oldBar = world.lighthouseSignal.findByName('LighthouseSignalBar') as pc.Entity | null;
            const oldBarRender = oldBar?.render ? { render: oldBar.render, enabled: oldBar.render.enabled } : null;
            const signalPosition = world.lighthouseSignal.getLocalPosition().clone();
            rollbackIntegration = () => {
              for (const { render, enabled } of shellRenders) render.enabled = enabled;
              if (roofPosition && roof) roof.setLocalPosition(roofPosition);
              if (finialPosition && finial) finial.setLocalPosition(finialPosition);
              if (oldBarRender) oldBarRender.render.enabled = oldBarRender.enabled;
              world.lighthouseSignal.setLocalPosition(signalPosition);
              sweep?.destroy();
              sweep = null;
            };
            for (const { render } of shellRenders) render.enabled = false;
            roof?.setLocalPosition(0, 7.85, 0);
            finial?.setLocalPosition(0, 8.48, 0);
            world.lighthouseBeacon.addChild(visual);
            if (oldBar?.render) oldBar.render.enabled = false;
            world.lighthouseSignal.setLocalPosition(0, 6.74, 8);
            sweep = new pc.Entity('LighthouseOpticalSweep');
            sweep.addComponent('light', { type: 'spot', color: new pc.Color(0.72, 0.86, 1),
              intensity: 10, range: 60, innerConeAngle: 8, outerConeAngle: 14, castShadows: false });
            sweep.setLocalEulerAngles(65, 0, 0);
            world.lighthouseSignal.addChild(sweep);
          }
          visualRoots.push(visual); update(); finish();
        } catch (error) { fail(error); }
      });
      app.assets.load(asset);
    } catch (error) {
      fail(error);
    }
    return loading;
  }
  app.once('destroy', () => {
    destroyed = true;
    distributor?.dispose(); distributor = null;
    tower?.dispose(); tower = null;
    workboat?.dispose(); workboat = null;
    for (const finish of settleOnDestroy) finish();
    for (const root of visualRoots) root.destroy();
    for (const asset of assets) { asset.off(); asset.unload(); app.assets.remove(asset); }
    assets.clear(); pending.clear();
  });
  return { ensure(id: HeroId | 'castle') {
    if (destroyed) return Promise.resolve();
    if (id === 'castle') return ensureDistributor();
    return Promise.all([ensure(id), id === 'lighthouse' ? ensureTower() : undefined,
      id === 'lighthouse' ? ensureWorkboat() : undefined]).then(() => undefined);
  }, animateManantial(dt: number) {
    if (!manantial.root.enabled) return;
    // The imported root retains +90 X; rotor local Y is the shaft's world Z.
    if (generatorRotor) generatorRotor.rotateLocal(0, dt * 150, 0);
    else manantial.rotor.rotateLocal(0, 0, dt * 150);
  }, setPower(forgeHeat: number, beaconWorking: boolean) {
    heat = Math.max(0, Math.min(1, forgeHeat)); beacon = beaconWorking; update();
  } };
}
