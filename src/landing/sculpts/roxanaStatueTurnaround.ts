import * as THREE from 'three';
import { createRoxanaStatueModel, frameRoxanaStatueCamera } from './createRoxanaStatueModel.ts';

// Hoja de contacto de 4 vistas, calcada del layout de la referencia del Director.
// Se renderiza offscreen (preserveDrawingBuffer) y se puede volcar a PNG con
// `node scratchpad/shot-server.mjs <dir>` escuchando en :5178.

const VIEWS: Array<{ label: string; azimuth: number }> = [
  { label: 'Frontal', azimuth: 0 },
  { label: 'Lateral derecha', azimuth: 90 },
  { label: 'Posterior', azimuth: 180 },
  { label: 'Lateral izquierda', azimuth: -90 },
];

const CELL_W = 384;
const CELL_H = 1024;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(CELL_W, CELL_H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const scene = new THREE.Scene();
const model = createRoxanaStatueModel({ castShadow: true, receiveShadow: true });
scene.add(model);

const bounds = new THREE.Box3().setFromObject(model);
const size = bounds.getSize(new THREE.Vector3());
const center = bounds.getCenter(new THREE.Vector3());

scene.add(new THREE.HemisphereLight(0xfff2dc, 0x33363a, 1.5));
const key = new THREE.DirectionalLight(0xffe6c0, 3.1);
key.position.set(center.x - size.x * 2.2, center.y + size.y * 0.9, center.z + size.z * 3.4);
key.target.position.copy(center);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = size.y * 9;
scene.add(key, key.target);

const fill = new THREE.DirectionalLight(0xd8e6ff, 1.35);
fill.position.set(center.x + size.x * 2.6, center.y + size.y * 0.4, center.z - size.z * 2.2);
fill.target.position.copy(center);
scene.add(fill, fill.target);

const camera = new THREE.PerspectiveCamera(26, CELL_W / CELL_H, 0.01, 200);

// ?zoom=head encuadra sólo cabeza y hombros: la cara es lo que más se rompe al
// mirarla al tamaño del hall y no se puede juzgar en el plano entero.
const zoomHead = new URLSearchParams(location.search).get('zoom') === 'head';
const headProxy = new THREE.Object3D();
if (zoomHead) {
  const top = bounds.max.y;
  const span = size.y * .22;
  headProxy.position.set(center.x, top - span / 2, center.z);
  headProxy.scale.set(span / 2, span / 2, span / 2);
  const marker = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ visible: false }));
  headProxy.add(marker);
  scene.add(headProxy);
}

const sheet = document.createElement('canvas');
sheet.width = CELL_W * VIEWS.length;
sheet.height = CELL_H;
document.body.append(sheet);
const ctx = sheet.getContext('2d')!;

ctx.fillStyle = '#3b3b3b';
ctx.fillRect(0, 0, sheet.width, sheet.height);

VIEWS.forEach((view, index) => {
  frameRoxanaStatueCamera(camera, zoomHead ? headProxy : model, { margin: 1.1, azimuthDeg: view.azimuth, elevationDeg: 0 });
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, index * CELL_W, 0);
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath();
  ctx.moveTo(index * CELL_W + .5, 0);
  ctx.lineTo(index * CELL_W + .5, CELL_H);
  ctx.stroke();
  ctx.fillStyle = '#efe9df';
  ctx.font = '22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(view.label, index * CELL_W + CELL_W / 2, 34);
});

const name = new URLSearchParams(location.search).get('name') ?? 'roxana-turnaround';
void fetch('http://localhost:5178/shot', {
  method: 'POST',
  body: JSON.stringify({ name, dataUrl: sheet.toDataURL('image/png') }),
}).catch(() => undefined);
