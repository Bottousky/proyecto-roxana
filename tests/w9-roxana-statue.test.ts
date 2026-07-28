import * as THREE from 'three';
import { createRoxanaStatueModel } from '../src/landing/sculpts/createRoxanaStatueModel.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const statue = createRoxanaStatueModel({ castShadow: false, receiveShadow: false });
statue.updateMatrixWorld(true);

const bounds = new THREE.Box3().setFromObject(statue);
const size = bounds.getSize(new THREE.Vector3());
assert(size.y > size.x * 3.2, 'la estatua conserva la silueta vertical de monumento');
assert(bounds.min.y > -0.001 && bounds.min.y < 0.001, 'la base apoya exactamente en el piso');

const runtime = statue.userData.sculptRuntime;
assert(runtime?.nodes?.figure, 'expone el pivote estable de la figura');
assert(runtime?.sockets?.['socket-book'], 'expone el socket del libro');
assert(runtime?.sockets?.['socket-portrait'], 'expone el socket del retrato');
assert(runtime?.colliders?.pedestal?.type === 'box', 'expone el collider simple del pedestal');
assert(Object.keys(runtime?.meshes ?? {}).length >= 30, 'mantiene las piezas semánticas separadas');

for (const required of ['figure-body', 'roxana-book', 'left-arm', 'right-arm', 'hair-mass']) {
  assert(runtime.nodes[required], `incluye el componente ${required}`);
}

let triangles = 0;
let texturedMeshes = 0;
statue.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;
  const geometry = object.geometry;
  triangles += geometry.index
    ? geometry.index.count / 3
    : geometry.getAttribute('position').count / 3;
  assert(Boolean(geometry.getAttribute('uv')), `${object.name} conserva coordenadas UV`);
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  if (materials.some((material) => material instanceof THREE.MeshStandardMaterial
    && material.map
    && material.roughnessMap
    && material.bumpMap)) {
    texturedMeshes += 1;
  }
});
assert(triangles < 30_000, `respeta el presupuesto de 30k triángulos (${triangles})`);
assert(texturedMeshes >= 30, 'aplica albedo, rugosidad y relieve independientes a la talla');

console.log('W9 estatua procedural de Roxana: OK');
