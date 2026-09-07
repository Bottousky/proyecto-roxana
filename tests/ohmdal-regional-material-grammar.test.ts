import assert from 'node:assert/strict';
import * as pc from 'playcanvas';
import {
  createRegionalMaterialGrammar,
  REGIONAL_MATERIAL_GRAMMAR,
} from '../src/experiences/ohmdal-playcanvas/world/arc1/regionalMaterialGrammar.ts';

type FakeEntity = {
  name: string;
  render?: { meshInstances: Array<{ material: pc.StandardMaterial }> };
  findComponents?: () => unknown[];
  getLocalScale?: () => pc.Vec3;
  setLocalScale?: (scale: pc.Vec3) => void;
};

function renderEntity(name: string, material: pc.StandardMaterial, scale = new pc.Vec3(4, 0.28, 0.42)): {
  entity: FakeEntity;
  render: { entity: FakeEntity; meshInstances: Array<{ material: pc.StandardMaterial }> };
  scale: pc.Vec3;
} {
  const current = scale.clone();
  const entity = {} as FakeEntity;
  const render = { entity, meshInstances: [{ material }] };
  entity.name = name;
  entity.render = render;
  entity.getLocalScale = () => current.clone();
  entity.setLocalScale = (next) => current.copy(next);
  render.entity = entity;
  return { entity, render, scale: current };
}

const sourceStone = new pc.StandardMaterial();
const sourceCopper = new pc.StandardMaterial();
const sourceWater = new pc.StandardMaterial();
sourceStone.diffuse = new pc.Color(0.55, 0.5, 0.44);
sourceCopper.diffuse = new pc.Color(0.62, 0.29, 0.12);
sourceWater.diffuse = new pc.Color(0.12, 0.52, 0.68);

let onDestroy: (() => void) | null = null;
const app = {
  once(_event: string, listener: () => void): void {
    onDestroy = listener;
  },
} as unknown as pc.Application;
const grammar = createRegionalMaterialGrammar(app, {
  stone: sourceStone,
  copper: sourceCopper,
  water: sourceWater,
});

const ceramic = renderEntity('CastleCeramicStandoff1', sourceStone);
const wall = renderEntity('CastleWallNorth', sourceStone);
const bus = renderEntity('ForgeAuthoredMainBus', sourceCopper);
const water = renderEntity('TerraceWater1West', sourceWater);
const root = {
  findComponents: () => [ceramic.render, wall.render, bus.render],
} as unknown as pc.Entity;

assert.equal(grammar.applyCeramicBySemanticName(root), 1);
assert.equal(ceramic.render.meshInstances[0]!.material, grammar.ceramicPorcelain);
assert.equal(wall.render.meshInstances[0]!.material, sourceStone, 'las paredes quedan fuera de la gramática');
assert.notEqual(grammar.ceramicPorcelain, sourceStone, 'la cerámica usa un clon');
assert.equal(sourceStone.diffuse.r, 0.55, 'el material compartido no se muta');

const originalLength = bus.scale.x;
assert.equal(grammar.applyConductorsByName(root, ['ForgeAuthoredMainBus'], REGIONAL_MATERIAL_GRAMMAR.forgeBusCrossSection), 1);
assert.equal(bus.render.meshInstances[0]!.material, grammar.agedConductor);
assert.equal(bus.scale.x, originalLength, 'la viga conserva su longitud y endpoints');
assert.equal(bus.scale.y, REGIONAL_MATERIAL_GRAMMAR.forgeBusCrossSection.height);
assert.equal(bus.scale.z, REGIONAL_MATERIAL_GRAMMAR.forgeBusCrossSection.depth);

assert.equal(grammar.applyWaterChannels([water.entity]), 1);
assert.equal(water.render.meshInstances[0]!.material, grammar.waterCanal);
assert.equal(grammar.waterCanal.emissiveIntensity, 0, 'el agua de canal no emite');

grammar.dispose();
assert.equal(onDestroy !== null, true);
assert.equal(grammar.applyCeramicBySemanticName(root), 0, 'la gramática queda inerte después del dispose');
grammar.dispose();
onDestroy?.();

console.log('Ohmdal regional material grammar: OK (semantic assignment, beam length and lifecycle)');
