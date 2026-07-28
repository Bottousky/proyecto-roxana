import * as THREE from 'three';
import {
  createRoxanaStatueModel,
  frameRoxanaStatueCamera,
} from './createRoxanaStatueModel';

const host = document.querySelector<HTMLDivElement>('#app');
if (!host) throw new Error('Missing preview host');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.append(renderer.domElement);

const scene = new THREE.Scene();
const model = createRoxanaStatueModel({
  castShadow: true,
  receiveShadow: true,
});
scene.add(model);

const bounds = new THREE.Box3().setFromObject(model);
const size = bounds.getSize(new THREE.Vector3());
const center = bounds.getCenter(new THREE.Vector3());

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(Math.max(size.x, size.z) * 1.8, 64),
  new THREE.MeshStandardMaterial({ color: 0x242526, roughness: 0.92 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = bounds.min.y - 0.012;
floor.receiveShadow = true;
scene.add(floor);

scene.add(new THREE.HemisphereLight(0xfff0d5, 0x2a3038, 1.35));
const key = new THREE.DirectionalLight(0xffdfad, 4.2);
key.position.set(center.x - size.x * 1.8, center.y + size.y * 0.8, center.z + size.z * 2.2);
key.target.position.copy(center);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = size.y * 8;
scene.add(key, key.target);

const rim = new THREE.DirectionalLight(0xb9d5ff, 2.1);
rim.position.set(center.x + size.x * 2, center.y + size.y * 0.6, center.z - size.z * 2);
rim.target.position.copy(center);
scene.add(rim, rim.target);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.01, 100);
const view = new URLSearchParams(location.search).get('view') ?? 'front';
const azimuthByView: Record<string, number> = { front: 0, right: 90, back: 180, left: -90, hero: -25 };
frameRoxanaStatueCamera(camera, model, {
  margin: view === 'hero' ? 1.22 : 1.08,
  azimuthDeg: azimuthByView[view] ?? 0,
  elevationDeg: view === 'hero' ? 8 : 0,
});

document.querySelector<HTMLDivElement>('#label')!.textContent = `Roxana · ${view}`;

function render() {
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  frameRoxanaStatueCamera(camera, model, {
    margin: view === 'hero' ? 1.22 : 1.08,
    azimuthDeg: azimuthByView[view] ?? 0,
    elevationDeg: view === 'hero' ? 8 : 0,
  });
  render();
});

render();
