import * as pc from 'playcanvas';

interface PlazaSurroundMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  plaster: pc.StandardMaterial;
  wood: pc.StandardMaterial;
}

/** L2 scene at the surveyed Plaza origin. Retaining walls follow L3 colliders. */
export async function loadPlazaSurroundings(app: pc.Application, plaza: pc.Entity, materials: PlazaSurroundMaterials): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const assemblies = [loadAssembly(app, plaza, materials, false), loadAssembly(app, plaza, materials, true)];
    try {
      await Promise.all(assemblies.map(assembly => assembly.ready));
      return;
    } catch (error) {
      // Both files form one startup delivery. Never retain half a successful
      // attempt (or duplicate it on retry) after the other payload failed.
      for (const assembly of assemblies) assembly.dispose();
      for (const name of ['PlazaPerimeterSkirtNear', 'PlazaPerimeterSkirtFar']) {
        const skirt = plaza.findByName(name) as pc.Entity | null;
        if (skirt) skirt.enabled = true;
      }
      if (attempt === 1) throw error;
    }
  }
}

function loadAssembly(app: pc.Application, plaza: pc.Entity, materials: PlazaSurroundMaterials, planting: boolean): { ready: Promise<void>; dispose(): void } {
  const asset = new pc.Asset(planting ? 'PlazaPlanting' : 'PlazaSurroundings', 'container', {
    url: planting
      ? new URL('../../../../../assets/runtime/ohmdal/plaza/environment/plaza-planting.glb', import.meta.url).href
      : new URL('../../../../../assets/runtime/ohmdal/plaza/environment/plaza-surroundings.glb', import.meta.url).href,
  });
  app.assets.add(asset);
  let destroyed = false;
  let visual: pc.Entity | null = null;
  let finish!: () => void;
  const ready = new Promise<void>((resolve, reject) => {
    finish = resolve;
    asset.once('error', reject);
    asset.ready((loaded) => {
      if (destroyed) { loaded.unload(); resolve(); return; }
      try {
        const root = new pc.Entity(planting ? 'PlazaPlantingRoot' : 'PlazaSurroundingsRoot');
        // This is a world-space assembly authored at (0,0,0), not a floor prop.
        // Do not lift its lowest terrain vertex to the Plaza or apply a hero yaw.
        const imported = (loaded.resource as pc.ContainerResource).instantiateRenderEntity();
        root.addChild(imported);
        visual = root;
        const replacements: Record<string, pc.StandardMaterial> = {
          PlazaSurroundStone: materials.stone,
          PlazaSurroundDarkStone: materials.stoneDark,
          PlazaSurroundPlaster: materials.plaster,
          PlazaSurroundWood: materials.wood,
        };
        for (const render of imported.findComponents('render') as pc.RenderComponent[]) {
          const terrain = render.entity.name === 'PlazaValleyTerrain';
          // L2 assemblies span the perimeter. Re-rendering that entire mesh
          // into each cascade costs more than the scenery itself, even when
          // most trees/buildings are behind the player. Keep direct lighting
          // and received shadows; the existing L3 landmarks cast local shadows.
          render.castShadows = false;
          render.receiveShadows = true;
          for (const instance of render.meshInstances) {
            const replacement = replacements[instance.material.name];
            if (replacement) instance.material = replacement;
            if (terrain) {
              const material = instance.material as pc.StandardMaterial;
              material.diffuseVertexColor = true;
              material.diffuse.set(0.55, 0.59, 0.48);
              material.update();
            }
            if (planting) {
              const material = instance.material as pc.StandardMaterial;
              const leaves = material.name.startsWith('Leaves') || material.name.startsWith('Grass');
              // Muted civic-garden greens, lit by the same sun as the Plaza.
              if (leaves) material.diffuse.set(0.66, 0.72, 0.53);
              else material.diffuse.set(0.72, 0.68, 0.61);
              material.update();
            }
          }
        }
        plaza.addChild(root);
        // Superseded thin skyline strips are only hidden once their real 3D
        // shoulders have loaded; the distant hydraulic landmark is preserved.
        for (const name of planting ? [] : ['PlazaPerimeterSkirtNear', 'PlazaPerimeterSkirtFar']) {
          const skirt = plaza.findByName(name) as pc.Entity | null;
          if (skirt) skirt.enabled = false;
        }
        resolve();
      } catch (error) {
        visual?.destroy(); visual = null;
        reject(error);
      }
    });
  });
  const dispose = () => {
    if (destroyed) return;
    destroyed = true;
    app.off('destroy', dispose);
    visual?.destroy(); visual = null;
    asset.off(); asset.unload(); app.assets.remove(asset);
    finish();
  };
  app.once('destroy', dispose);
  app.assets.load(asset);
  return { ready, dispose };
}
