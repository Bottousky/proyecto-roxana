import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  installRoxanaStatue,
  ROXANA_HALL_MONUMENT,
} from '../src/landing/sculpts/installRoxanaStatue.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

if (!globalThis.ProgressEvent) {
  Object.defineProperty(globalThis, 'ProgressEvent', {
    value: class ProgressEvent {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    },
  });
}

const bytes = readFileSync(new URL('../assets/school3d/roxana-statue.glb', import.meta.url));
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const statueGltf = await new GLTFLoader().parseAsync(buffer as ArrayBuffer, '');

const hall = new THREE.Group();
hall.name = 'ROOM_hall';
const adultNpcHeight = 1.744;
const referenceStatueHeight = 4.03;
const legacy = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, referenceStatueHeight, 1.2),
  new THREE.MeshBasicMaterial(),
);
legacy.name = 'HALL__roxana_statue';
legacy.position.y = referenceStatueHeight / 2;
hall.add(legacy);

const installed = installRoxanaStatue(hall, statueGltf.scene, ROXANA_HALL_MONUMENT);
assert(installed !== null, 'monta el GLB descargado sobre el anclaje del hall');
assert(legacy.parent === null, 'retira la estatua de referencia');
assert(installed!.parent === hall, 'conserva la estatua dentro del subárbol del hall');
assert(installed!.statue.userData.source === 'roxana-statue.glb', 'registra el asset de origen');

const bounds = new THREE.Box3().setFromObject(installed!.statue);
const size = bounds.getSize(new THREE.Vector3());
assert(Math.abs(size.y - referenceStatueHeight * ROXANA_HALL_MONUMENT.heightScale) < .001, 'amplía el monumento respecto del hueco original');
assert(size.y / adultNpcHeight >= 3 && size.y / adultNpcHeight <= 4, 'mantiene el monumento entre 3 y 4 NPC adultos');
assert(Math.abs(bounds.min.y - ROXANA_HALL_MONUMENT.baseOffset) < .001, 'apoya la base sobre el basamento arquitectónico');
assert(Math.abs(bounds.getCenter(new THREE.Vector3()).x) < .001, 'centra la estatua en X');
assert(Math.abs(bounds.getCenter(new THREE.Vector3()).z) < .001, 'centra la estatua en Z');

let triangles = 0;
let hasHallMaterial = false;
installed!.statue.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;
  const geometry = object.geometry;
  triangles += geometry.index
    ? geometry.index.count / 3
    : geometry.getAttribute('position').count / 3;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  hasHallMaterial ||= materials.some((material) => material.name === 'RX_roxana_carved_stone');
});
assert(triangles > 70_000, 'usa la malla detallada descargada');
assert(hasHallMaterial, 'aplica el acabado de piedra del hall');

console.log('W10 estatua GLB de Roxana montada en el hall: OK');
