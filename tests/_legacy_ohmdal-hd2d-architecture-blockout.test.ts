import * as THREE from 'three';
import {
  createOhmdalBlockout,
  disposeRendererCaches,
  readRendererInfo,
} from '../src/ohmdal/architecture/blockout.ts';

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
// Las 7 unidades (Plaza, Taller, Puerta, Castillo, Forja, Terrazas, Faro) entran a la
// capa visual cada una como un nodo con el nombre canónico `*_KIT`. La Plaza, el Taller
// y la Puerta ya no son kits a mano: las sirve `createBasicUnitKit` en modo `'greybox'`.
const plazaKitRoot = blockout.visualLayer.getObjectByName('PLAZA_KIT');
assert(plazaKitRoot !== undefined, 'la Plaza entra a la capa visual como kit greybox');
assert(
  plazaKitRoot!.children.some((child) => child.name === 'plaza_floor'),
  'el greybox de la Plaza trae su piso plano',
);
const tallerKitRoot = blockout.visualLayer.getObjectByName('TALLER_KIT');
assert(tallerKitRoot !== undefined, 'el Taller entra a la capa visual como kit greybox');
assert(
  tallerKitRoot!.children.some((child) => child.name === 'taller_floor'),
  'el greybox del Taller trae su piso plano',
);
const puertaKitRoot = blockout.visualLayer.getObjectByName('PUERTA_KIT');
assert(puertaKitRoot !== undefined, 'la Puerta entra a la capa visual como kit greybox');
assert(
  puertaKitRoot!.children.some((child) => child.name === 'puerta_floor'),
  'el greybox de la Puerta trae su piso plano',
);
// Los dos emisores del Taller y la Puerta sobreviven porque están en `BOX_MODULES`, no
// dentro de los kits. El rig de luz los busca por nombre.
assert(
  blockout.visualLayer.children.some((child) => child.name === 'workshop-lantern-emitter'),
  'el emisor de la linterna sobrevive: el rig de luz lo busca por nombre',
);
assert(
  blockout.visualLayer.children.some((child) => child.name === 'door-conduit-emitter'),
  'el emisor del conducto sobrevive: el rig de luz lo busca por nombre',
);
assert(before.visualMeshCount === 10, 'siete kits + dos emisores + grupo de arcos de socket (6 arcos)');
assert(before.colliderMeshCount === 53, 'colliders primitivos: 29 del slice (12 anteriores + 17 perimetrales de U1) + 24 de los perimetros del arco');
assert(before.navigationMeshCount === 7, 'cada zona del arco tiene region de navegacion plana');
assert(before.geometryCount < before.visualMeshCount + before.colliderMeshCount + 10, 'geometrias repetidas se comparten');
assert(before.material.textureCount === 0, 'el blockout no introduce texturas');
assert(before.lighting.lightCount === 4, 'la luz global y local tiene inventario completo');
assert(before.lighting.shadowLightCount === 1, 'solo la luz principal proyecta sombra');
assert(before.lighting.enabledLocalLightCount === 2, 'ambos emisores locales nacen habilitados');
assert(blockout.lighting.inventory.filter((entry) => entry.type === 'point').every((entry) => entry.emitterId !== 'WORLD'), 'cada luz local tiene emisor visible');
// Las 3 unidades de U1 (Plaza, Taller, Puerta) son greybox puro: no hay oclusores
// fundidos con sus kits. La oclusión de los kits full desapareció con ellos. Los
// emisores del Taller y la Puerta siguen existiendo como `BOX_MODULES`, pero no
// exponen bindings de oclusión (sus tags son solo `emitter`, no `cameraOccluder`).
const occlusionBindingIds = blockout.occlusionBindings.map((binding) => binding.id).sort();
assert(occlusionBindingIds.length === 0, 'las unidades greybox no aportan oclusores; los kits full se fueron');

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

// Los métodos del puzzle de la Puerta son no-ops ahora que la Puerta es greybox, pero el
// contrato público se conserva: el mundo no tiene que ramificar.
blockout.setDoorOpening(1);
blockout.setSpringWaterState('estable');

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
