import * as pc from 'playcanvas';

/** Authored L2 catchment at the Plaza origin; no gameplay topology is moved. */
export async function loadManantialGorge(app: pc.Application, parent: pc.Entity): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const asset = new pc.Asset('ManantialGorge', 'container', {
      url: new URL('../../../../../assets/runtime/ohmdal/plaza/gorge/manantial-gorge.glb', import.meta.url).href,
    });
    let visual: pc.Entity | null = null;
    let batchGroupId = -1;
    let disposed = false;
    let settle: (() => void) | undefined;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      app.off('destroy', dispose);
      if (batchGroupId >= 0 && app.batcher.getGroupById(batchGroupId)) {
        for (const render of visual?.findComponents('render') as pc.RenderComponent[] ?? []) {
          render.batchGroupId = -1;
        }
        app.batcher.removeGroup(batchGroupId);
        batchGroupId = -1;
      }
      visual?.destroy();
      asset.off(); asset.unload(); app.assets.remove(asset);
      settle?.();
    };
    app.assets.add(asset);
    app.once('destroy', dispose);
    try {
      await new Promise<void>((resolve, reject) => {
        settle = resolve;
        asset.once('error', reject);
        asset.ready(loaded => {
          if (disposed) { resolve(); return; }
          try {
            visual = new pc.Entity('ManantialGorgeRoot');
            const imported = (loaded.resource as pc.ContainerResource).instantiateRenderEntity();
            visual.addChild(imported);
            for (const render of imported.findComponents('render') as pc.RenderComponent[]) {
              render.castShadows = false;
              render.receiveShadows = true;
              for (const instance of render.meshInstances) {
                const material = instance.material as pc.StandardMaterial;
                material.diffuseVertexColor = true;
                material.update();
              }
            }
            parent.addChild(visual);
            // Static canyon chunks share one vertex-colored material. Retain
            // spatial culling while avoiding a draw call for every rock face.
            batchGroupId = app.batcher.addGroup('ManantialGorgeStatic', false, 120).id;
            for (const render of imported.findComponents('render') as pc.RenderComponent[]) {
              render.batchGroupId = batchGroupId;
            }
            app.batcher.generate([batchGroupId]);
            for (const name of ['MountainRidgeNear', 'MountainRidgeFar']) {
              const legacy = parent.findByName(name) as pc.Entity | null;
              if (legacy) legacy.enabled = false;
            }
            resolve();
          } catch (error) { reject(error); }
        });
        app.assets.load(asset);
      });
      return;
    } catch (error) {
      dispose();
      if (attempt === 1) throw error;
    }
  }
}
