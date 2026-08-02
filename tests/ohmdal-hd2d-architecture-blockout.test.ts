import * as THREE from 'three';
import {
  createOhmdalBlockout,
  disposeRendererCaches,
  readRendererInfo,
} from '../src/labs/ohmdal-hd2d-preprod/architecture/blockout.ts';
import { CameraOcclusionController } from '../src/labs/ohmdal-hd2d-preprod/camera/occlusion.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function close(actual: number, expected: number, tolerance: number, message: string): void {
  assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

const scene = new THREE.Scene();
const blockout = createOhmdalBlockout(scene);
assert(scene.children.includes(blockout.root), 'el blockout se monta como raiz modular');
assert(blockout.visualLayer !== blockout.colliderLayer, 'visual y colliders son capas separadas');
assert(blockout.visualLayer !== blockout.navigationLayer, 'visual y navegacion son capas separadas');
assert(!blockout.colliderLayer.visible && !blockout.navigationLayer.visible, 'capas de debug nacen ocultas');
assert(blockout.root.position.y === 0, 'la raiz nace en suelo');
for (const moduleRoot of blockout.visualLayer.children) {
  assert(moduleRoot.position.y === 0, `${moduleRoot.name} conserva pivote de suelo`);
}

blockout.mannequin.updateWorldMatrix(true, true);
const mannequinBounds = new THREE.Box3().setFromObject(blockout.mannequin);
close(mannequinBounds.max.y - mannequinBounds.min.y, 1.72, 0.000001, 'la geometria del maniqui mide 1,72 m');

const before = blockout.diagnostics();
assert(before.visualMeshCount >= 19, 'Portal, Plaza, Taller y Puerta/Manantial tienen modulos visibles');
assert(before.colliderMeshCount === 9, 'los colliders primitivos son explicitos');
assert(before.navigationMeshCount === 3, 'cada set tiene region de navegacion plana');
assert(before.geometryCount < before.visualMeshCount + before.colliderMeshCount + 10, 'geometrias repetidas se comparten');
assert(before.material.textureCount === 0, 'el blockout no introduce texturas');
assert(before.lighting.lightCount === 4, 'la luz global y local tiene inventario completo');
assert(before.lighting.shadowLightCount === 1, 'solo la luz principal proyecta sombra');
assert(before.lighting.enabledLocalLightCount === 2, 'ambos emisores locales nacen habilitados');
assert(blockout.lighting.inventory.filter((entry) => entry.type === 'point').every((entry) => entry.emitterId !== 'WORLD'), 'cada luz local tiene emisor visible');
const occlusionBindingIds = blockout.occlusionBindings.map((binding) => binding.id).sort();
assert(occlusionBindingIds.length === 6, 'foreground, techos y pilares de Puerta exponen bindings propios');
assert(occlusionBindingIds.includes('door-pier-north'), 'el pilar norte de Puerta participa del fade');
assert(occlusionBindingIds.includes('door-pier-south'), 'el pilar sur que ocultaba al estudiante participa del fade');
assert(!occlusionBindingIds.includes('ohm-door-frame'), 'el landmark dominante de la Puerta nunca se oculta');
const doorLandmark = blockout.visualLayer.getObjectByName('ohm-door-frame');
assert(doorLandmark?.visible === true, 'el landmark de Puerta permanece visible');

const doorSouthBinding = blockout.occlusionBindings.find((binding) => binding.id === 'door-pier-south');
assert(doorSouthBinding !== undefined, 'el binding del pilar sur es resoluble por ID estable');
const doorSouthMaterial = (doorSouthBinding.object.children[0] as THREE.Mesh).material as THREE.Material & { opacity: number };
const doorOcclusion = new CameraOcclusionController([doorSouthBinding]);
doorOcclusion.update(new Set(['door-pier-south']), 1 / 60, true);
assert(doorSouthMaterial.opacity === 1, 'un frame bloqueado no altera el pilar');
doorOcclusion.update(new Set(['door-pier-south']), 1 / 60, true);
assert(doorSouthMaterial.opacity === 0.18 && doorSouthBinding.object.visible, 'el pilar hace fade sin desaparecer por completo');
for (let index = 0; index < 6; index += 1) doorOcclusion.update(new Set(), 1 / 60, true);
assert(doorSouthMaterial.opacity === 1 && doorSouthBinding.object.visible, 'el pilar recupera opacidad tras seis frames libres');
assert(doorLandmark?.visible === true, 'la recuperacion del pilar no modifica el landmark');
doorOcclusion.dispose();
const workshopEmitter = blockout.visualLayer.getObjectByName('workshop-lantern-emitter');
assert(workshopEmitter !== undefined, 'el emisor visible del Taller existe');
workshopEmitter.visible = false;
blockout.lighting.syncEmitterState();
assert(blockout.lighting.diagnostics().enabledLocalLightCount === 1, 'ocultar emisor deshabilita su contribucion local');
workshopEmitter.visible = true;
blockout.lighting.syncEmitterState();

const afternoonColor = blockout.materials.shared.stone.color.getHex();
blockout.setTimeOfDay('twilight');
assert(blockout.materials.shared.stone.color.getHex() !== afternoonColor, 'el pase crepusculo es determinista y de blockout');

let rendererCacheDisposals = 0;
const renderer = {
  info: {
    render: { calls: 31, triangles: 812, lines: 0, points: 0 },
    memory: { geometries: 18, textures: 0 },
  },
  renderLists: { dispose() { rendererCacheDisposals += 1; } },
};
const rendererInfo = readRendererInfo(renderer);
assert(rendererInfo.calls === 31 && rendererInfo.triangles === 812, 'renderer.info.render es observable sin estimar');
assert(rendererInfo.geometries === 18 && rendererInfo.textures === 0, 'renderer.info.memory es observable sin estimar');
disposeRendererCaches(renderer);
assert(rendererCacheDisposals === 1, 'la cache del renderer puede liberarse por el integrador');

blockout.dispose();
blockout.dispose();
const after = blockout.diagnostics();
assert(after.disposed && after.material.disposed && after.lighting.disposed, 'disposal total es idempotente y observable');
assert(!scene.children.includes(blockout.root), 'disposal desmonta la raiz de la escena');

console.log('Ohmdal HD-2D architecture blockout/material/light/performance: OK');
