import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import schoolUrl from '../../../assets/school3d/instituto-roxana.glb?url';
import roxanaStatueUrl from '../../../assets/school3d/roxana-statue.glb?url';
import { installRoxanaStatue } from './installRoxanaStatue.ts';

// Revisión de la estatua YA COLOCADA en el hall: mismo GLB, misma función de
// instalación que school3d.ts, encuadres cercanos alrededor de la estatua.

const CELL_W = 512;
const CELL_H = 512;
const VIEWS: Array<{ label: string; azimuth: number; elevation: number; margin: number }> = [
  { label: 'Hall · camara del juego', azimuth: 40, elevation: 40, margin: 3.4 },
  { label: 'Estatua · frontal', azimuth: 0, elevation: 8, margin: 2.1 },
  { label: 'Estatua · 3/4', azimuth: 40, elevation: 16, margin: 2.2 },
];

const report = document.querySelector<HTMLPreElement>('#report')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(CELL_W, CELL_H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;

const scene = new THREE.Scene();
// Mismas luces que el hall real, si no el juicio de color no vale.
scene.add(new THREE.HemisphereLight(0xc8ddff, 0x4c2717, 2.45));
scene.add(new THREE.AmbientLight(0xffe9c9, .92));
const key = new THREE.DirectionalLight(0xffd2a0, 4.1);
key.position.set(-26, 42, 22);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -34;
key.shadow.camera.right = 34;
key.shadow.camera.top = 32;
key.shadow.camera.bottom = -32;
key.shadow.bias = -.00035;
scene.add(key);
const rim = new THREE.DirectionalLight(0x6f9fff, 2.3);
rim.position.set(30, 28, -25);
scene.add(rim);
const glow = new THREE.PointLight(0xff9e43, 28, 48, 1.8);
glow.position.set(0, 13, -2);
scene.add(glow);

const params = new URLSearchParams(location.search);
const rotationY = Number(params.get('rot') ?? '0');

const draco = new DRACOLoader();
draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);
const [gltf, statueGltf] = await Promise.all([
  loader.loadAsync(schoolUrl),
  loader.loadAsync(roxanaStatueUrl),
]);
draco.dispose();
scene.add(gltf.scene);
gltf.scene.position.y = .12;

function ancestry(object: THREE.Object3D): string {
  const chain: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    chain.push(current.name || '(anon)');
    current = current.parent;
  }
  return chain.join(' < ');
}

const lines: string[] = [];
const legacyNames: string[] = [];
gltf.scene.traverse((object) => {
  if (object.name.startsWith('HALL__roxana_')) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    legacyNames.push(`${object.name}  size=${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)}  minY=${box.min.y.toFixed(2)}`);
  }
});
lines.push(`nodos originales (${legacyNames.length}):`, ...legacyNames.map((n) => `  ${n}`));

const installed = installRoxanaStatue(gltf.scene, statueGltf.scene, {
  castShadow: true,
  receiveShadow: true,
  rotationY,
});
if (!installed) {
  lines.push('NO se encontró HALL__roxana_* — la estatua no se instaló');
} else {
  const box = new THREE.Box3().setFromObject(installed.statue);
  const size = box.getSize(new THREE.Vector3());
  lines.push(
    `hueco original: alto ${installed.bounds.getSize(new THREE.Vector3()).y.toFixed(2)}, base y=${installed.bounds.min.y.toFixed(2)}`,
    `talla colocada: alto ${size.y.toFixed(2)}, ancho ${size.x.toFixed(2)}, base y=${box.min.y.toFixed(2)}`,
    `escala aplicada: ${installed.statue.scale.x.toFixed(4)}  ·  rotationY=${rotationY}`,
    `posición: ${installed.statue.position.x.toFixed(2)}, ${installed.statue.position.y.toFixed(2)}, ${installed.statue.position.z.toFixed(2)}`,
    `cuelga de: ${installed.parent.name || '(sin nombre)'}  · cadena: ${ancestry(installed.parent)}`,
  );

  const center = box.getCenter(new THREE.Vector3());
  const camera = new THREE.PerspectiveCamera(32, 1, .05, 400);
  const sheet = document.createElement('canvas');
  sheet.width = CELL_W * VIEWS.length;
  sheet.height = CELL_H;
  document.body.append(sheet);
  const ctx = sheet.getContext('2d')!;
  ctx.fillStyle = '#2b2b2d';
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  VIEWS.forEach((view, index) => {
    const radius = Math.max(size.x, size.y, size.z) * view.margin;
    const azimuth = THREE.MathUtils.degToRad(view.azimuth);
    const elevation = THREE.MathUtils.degToRad(view.elevation);
    camera.position.set(
      center.x + Math.sin(azimuth) * Math.cos(elevation) * radius,
      center.y + Math.sin(elevation) * radius,
      center.z + Math.cos(azimuth) * Math.cos(elevation) * radius,
    );
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, index * CELL_W, 0);
    ctx.fillStyle = '#efe9df';
    ctx.font = '18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(view.label, index * CELL_W + CELL_W / 2, 28);
    ctx.fillStyle = '#2b2b2d';
  });

  void fetch('http://localhost:5178/shot', {
    method: 'POST',
    body: JSON.stringify({ name: params.get('name') ?? 'roxana-hall', dataUrl: sheet.toDataURL('image/png') }),
  }).catch(() => undefined);
}

report.textContent = lines.join('\n');
