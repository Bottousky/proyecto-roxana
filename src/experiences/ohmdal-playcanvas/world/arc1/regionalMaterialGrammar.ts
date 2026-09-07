import * as pc from 'playcanvas';

/**
 * Small authored-material vocabulary for the three late Arc I regions.
 *
 * The greybox materials are shared by the rest of the world. This module
 * clones the relevant source materials once, gives those clones the regional
 * finish, and only assigns them to explicitly selected render entities. It
 * therefore cannot recolour a wall, tower, probe, or stateful mesh by
 * accident, and it does not participate in the circuit or zone reducers.
 */
export const REGIONAL_MATERIAL_GRAMMAR = Object.freeze({
  ceramicPorcelain: {
    diffuse: [0.78, 0.74, 0.67] as const,
    gloss: 0.2,
    metalness: 0.03,
  },
  agedConductor: {
    diffuse: [0.46, 0.32, 0.2] as const,
    gloss: 0.26,
    metalness: 0.58,
  },
  waterCanal: {
    diffuse: [0.08, 0.34, 0.36] as const,
    gloss: 0.58,
    metalness: 0.05,
    opacity: 0.62,
  },
  forgeBusCrossSection: {
    height: 0.12,
    depth: 0.14,
  },
});

export type RegionalMaterialRole = 'ceramicPorcelain' | 'agedConductor' | 'waterCanal';

export interface RegionalMaterialGrammarSources {
  readonly stone: pc.StandardMaterial;
  readonly copper: pc.StandardMaterial;
  readonly water: pc.StandardMaterial;
}

export interface RegionalMaterialGrammar {
  readonly ceramicPorcelain: pc.StandardMaterial;
  readonly agedConductor: pc.StandardMaterial;
  readonly waterCanal: pc.StandardMaterial;
  applyCeramicBySemanticName(root: pc.Entity): number;
  applyConductorsByName(root: pc.Entity, names: readonly string[], crossSection?: { height: number; depth: number }): number;
  applyWaterChannels(channels: readonly pc.Entity[]): number;
  dispose(): void;
}

const CERAMIC_SEMANTIC_NAME = /(?:Ceramic|Insulator|Standoff)(?:[A-Z0-9]|$)/;

function setMatteNoMap(material: pc.StandardMaterial): void {
  material.diffuseMap = null;
  material.normalMap = null;
  material.heightMap = null;
  material.emissiveMap = null;
  material.opacityMap = null;
  material.metalnessMap = null;
  material.glossMap = null;
  material.emissive = new pc.Color(0, 0, 0);
  material.emissiveIntensity = 0;
  material.diffuseVertexColor = false;
}

function createCeramicPorcelain(source: pc.StandardMaterial): pc.StandardMaterial {
  const material = source.clone();
  material.name = 'ohmdal-regional-ceramic-porcelain-v1';
  setMatteNoMap(material);
  material.diffuse = new pc.Color(...REGIONAL_MATERIAL_GRAMMAR.ceramicPorcelain.diffuse);
  material.useMetalness = true;
  material.metalness = REGIONAL_MATERIAL_GRAMMAR.ceramicPorcelain.metalness;
  material.gloss = REGIONAL_MATERIAL_GRAMMAR.ceramicPorcelain.gloss;
  material.update();
  return material;
}

function createAgedConductor(source: pc.StandardMaterial): pc.StandardMaterial {
  const material = source.clone();
  material.name = 'ohmdal-regional-aged-conductor-v1';
  setMatteNoMap(material);
  material.diffuse = new pc.Color(...REGIONAL_MATERIAL_GRAMMAR.agedConductor.diffuse);
  material.useMetalness = true;
  material.metalness = REGIONAL_MATERIAL_GRAMMAR.agedConductor.metalness;
  material.gloss = REGIONAL_MATERIAL_GRAMMAR.agedConductor.gloss;
  material.update();
  return material;
}

function createWaterCanal(source: pc.StandardMaterial): pc.StandardMaterial {
  const material = source.clone();
  material.name = 'ohmdal-regional-water-canal-v1';
  setMatteNoMap(material);
  material.diffuse = new pc.Color(...REGIONAL_MATERIAL_GRAMMAR.waterCanal.diffuse);
  material.opacity = REGIONAL_MATERIAL_GRAMMAR.waterCanal.opacity;
  material.blendType = pc.BLEND_NORMAL;
  material.useMetalness = true;
  material.metalness = REGIONAL_MATERIAL_GRAMMAR.waterCanal.metalness;
  material.gloss = REGIONAL_MATERIAL_GRAMMAR.waterCanal.gloss;
  material.update();
  return material;
}

function assignMaterial(entity: pc.Entity, material: pc.StandardMaterial): number {
  const meshInstances = entity.render?.meshInstances;
  if (!meshInstances) return 0;
  for (const meshInstance of meshInstances) meshInstance.material = material;
  return meshInstances.length;
}

function findRenders(root: pc.Entity): pc.RenderComponent[] {
  return root.findComponents('render') as pc.RenderComponent[];
}

function findByExactNames(root: pc.Entity, names: ReadonlySet<string>): pc.Entity[] {
  return findRenders(root)
    .map((render) => render.entity)
    .filter((entity) => names.has(entity.name));
}

/**
 * Creates one set of regional clones for the application lifetime. The app's
 * destroy event owns cleanup; explicit disposal is idempotent for tests and
 * for teardown paths that run before Application#destroy.
 */
export function createRegionalMaterialGrammar(
  app: pc.Application,
  sources: RegionalMaterialGrammarSources,
): RegionalMaterialGrammar {
  const ceramicPorcelain = createCeramicPorcelain(sources.stone);
  const agedConductor = createAgedConductor(sources.copper);
  const waterCanal = createWaterCanal(sources.water);
  let disposed = false;

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    ceramicPorcelain.destroy();
    agedConductor.destroy();
    waterCanal.destroy();
  };
  app.once('destroy', dispose);

  return {
    ceramicPorcelain,
    agedConductor,
    waterCanal,
    applyCeramicBySemanticName(root: pc.Entity): number {
      if (disposed) return 0;
      let assigned = 0;
      for (const render of findRenders(root)) {
        if (CERAMIC_SEMANTIC_NAME.test(render.entity.name)) assigned += assignMaterial(render.entity, ceramicPorcelain);
      }
      return assigned;
    },
    applyConductorsByName(root: pc.Entity, names: readonly string[], crossSection): number {
      if (disposed) return 0;
      const named = findByExactNames(root, new Set(names));
      let assigned = 0;
      for (const entity of named) {
        assigned += assignMaterial(entity, agedConductor);
        if (crossSection) {
          const scale = entity.getLocalScale().clone();
          // Authored beam helpers put length on local X. Preserve it so the
          // electrical route and its endpoints remain unchanged.
          scale.y = crossSection.height;
          scale.z = crossSection.depth;
          entity.setLocalScale(scale);
        }
      }
      return assigned;
    },
    applyWaterChannels(channels: readonly pc.Entity[]): number {
      if (disposed) return 0;
      let assigned = 0;
      for (const channel of channels) assigned += assignMaterial(channel, waterCanal);
      return assigned;
    },
    dispose,
  };
}
