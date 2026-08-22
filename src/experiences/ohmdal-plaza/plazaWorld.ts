import * as THREE from 'three';
import { LAYOUT, IDA_TRAZA, RETORNO_ESTE, RETORNO_OESTE, PROBE_POS, type XZ } from './layout.ts';
import type { ProbeId } from './models/camino.ts';
import { PALETTE } from './palette.ts';

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface InteractAnchor {
  id: string;
  x: number;
  z: number;
  radio: number;
}

export interface PlazaWorld {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  player: THREE.Group;
  edda: THREE.Group;
  ohm: THREE.Group;
  ohmEye: THREE.Mesh;
  portalGlow: THREE.PointLight;
  portalRing: THREE.Mesh;
  indicatorMesh: THREE.Mesh;
  indicatorLight: THREE.PointLight;
  ohmLight: THREE.PointLight;
  idaBar: THREE.Object3D;
  retornoBar: THREE.Object3D;
  gapFill: THREE.Mesh;
  colliders: AABB[];
  anchors: InteractAnchor[];
  copperMats: THREE.MeshToonMaterial[];
  gradient: THREE.DataTexture;
  dispose(): void;
}

function makeGradient(): THREE.DataTexture {
  const data = new Uint8Array([70, 62, 54, 255, 132, 116, 94, 255, 198, 176, 142, 255, 255, 242, 214, 255]);
  const tex = new THREE.DataTexture(data, 4, 1);
  tex.format = THREE.RGBAFormat;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function toon(
  gradient: THREE.DataTexture,
  color: number,
  extra: Partial<THREE.MeshToonMaterialParameters> = {},
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
}

function box(
  parent: THREE.Object3D,
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cyl(
  parent: THREE.Object3D,
  mat: THREE.Material,
  rTop: number,
  rBot: number,
  h: number,
  x: number,
  y: number,
  z: number,
  segs = 10,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function aabbAround(x: number, z: number, hx: number, hz: number): AABB {
  return { minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz };
}

function addStrip(
  parent: THREE.Object3D,
  mat: THREE.Material,
  points: readonly XZ[],
  width: number,
  y: number,
  thickness: number,
): void {
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.05) continue;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, len), mat);
    mesh.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2);
    mesh.rotation.y = Math.atan2(dx, dz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
  }
}

function addInsulators(
  parent: THREE.Object3D,
  post: THREE.Material,
  cap: THREE.Material,
  points: readonly XZ[],
  every: number,
): void {
  let acc = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    acc += len;
    if (acc < every) continue;
    acc = 0;
    const t = 0.5;
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    cyl(parent, post, 0.05, 0.06, 0.42, x, 0.22, z, 6);
    cyl(parent, cap, 0.09, 0.1, 0.1, x, 0.48, z, 8);
  }
}

function makePerson(
  gradient: THREE.DataTexture,
  body: number,
  trim: number,
  height: number,
): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = toon(gradient, body);
  const trimMat = toon(gradient, trim);
  const skin = toon(gradient, 0xd8b898);
  cyl(g, bodyMat, 0.22, 0.26, height * 0.55, 0, height * 0.42, 0, 8);
  cyl(g, trimMat, 0.24, 0.2, height * 0.16, 0, height * 0.68, 0, 8);
  const head = cyl(g, skin, 0.16, 0.16, 0.28, 0, height * 0.88, 0, 8);
  head.scale.set(1, 1, 0.92);
  box(g, trimMat, 0.34, 0.08, 0.12, 0, height * 0.55, -0.16);
  return g;
}

function makeOhm(gradient: THREE.DataTexture): { root: THREE.Group; eye: THREE.Mesh } {
  const root = new THREE.Group();
  const body = toon(gradient, PALETTE.ohmCuerpo);
  const dark = toon(gradient, PALETTE.ohmInerte);
  const copper = toon(gradient, PALETTE.cobre);
  const ceramic = toon(gradient, PALETTE.ceramica);
  cyl(root, body, 0.34, 0.4, 0.85, 0, 0.55, 0, 8);
  cyl(root, copper, 0.36, 0.36, 0.08, 0, 0.9, 0, 8);
  cyl(root, ceramic, 0.22, 0.22, 0.18, 0, 1.08, 0, 8);
  const eye = cyl(root, dark, 0.09, 0.09, 0.06, 0, 1.08, 0.2, 8);
  eye.rotation.x = Math.PI / 2;
  box(root, copper, 0.08, 0.55, 0.08, 0.38, 0.7, 0);
  box(root, copper, 0.08, 0.55, 0.08, -0.38, 0.7, 0);
  return { root, eye };
}

export function createPlazaWorld(host: HTMLElement): PlazaWorld {
  const gradient = makeGradient();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.cielo);
  scene.fog = new THREE.Fog(PALETTE.niebla, 16, 46);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 80);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffe6c8, PALETTE.sombra, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc58a, 1.2);
  sun.position.set(-10, 16, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);

  const stone = toon(gradient, PALETTE.piedra);
  const stoneDark = toon(gradient, PALETTE.piedraOscura);
  const wood = toon(gradient, PALETTE.madera);
  const copper = toon(gradient, PALETTE.cobre);
  const copperLive = toon(gradient, PALETTE.cobrePulido, {
    emissive: PALETTE.ambar,
    emissiveIntensity: 0.08,
  });
  const copperOx = toon(gradient, PALETTE.cobreOxido);
  const ceramic = toon(gradient, PALETTE.ceramica);
  const soil = toon(gradient, PALETTE.suelo);
  const waterMat = new THREE.MeshBasicMaterial({
    color: PALETTE.agua,
    transparent: true,
    opacity: 0.82,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(28, 0.18, 24), soil);
  floor.position.y = -0.09;
  floor.receiveShadow = true;
  scene.add(floor);

  box(scene, stoneDark, 28, 0.12, 24, 0, -0.22, 0);

  const colliders: AABB[] = [];

  function mass(w: number, h: number, d: number, x: number, y: number, z: number): void {
    box(scene, stone, w, h, d, x, y, z);
    colliders.push(aabbAround(x, z, w / 2 - 0.05, d / 2 - 0.05));
  }

  mass(9, 4.2, 2.4, -8.6, 2.1, -9.4);
  mass(9, 4.6, 2.4, 8.6, 2.3, -9.4);
  mass(3.2, 6.4, 3.2, 0, 3.2, -10.2);
  mass(2.2, 3.4, 10, -11.2, 1.7, 0);
  mass(2.2, 3.6, 10, 11.2, 1.8, 0);
  mass(8, 3.2, 1.8, -7.4, 1.6, 11.2);
  mass(8, 3.2, 1.8, 7.4, 1.6, 11.2);

  box(scene, wood, 1.1, 0.42, 0.42, -6.8, 0.28, 5.1);
  box(scene, ceramic, 0.28, 0.38, 0.28, -6.4, 0.55, 5.1);
  box(scene, wood, 0.7, 0.22, 0.5, 6.2, 0.16, 4.4);
  box(scene, toon(gradient, 0x8a5040), 0.55, 0.08, 0.7, 6.25, 0.28, 4.35);

  const portal = new THREE.Group();
  portal.position.set(LAYOUT.portal.x, 0, LAYOUT.portal.z);
  scene.add(portal);
  cyl(portal, stoneDark, 0.42, 0.5, 3.4, -1.55, 1.7, 0, 8);
  cyl(portal, stoneDark, 0.42, 0.5, 3.4, 1.55, 1.7, 0, 8);
  box(portal, stone, 3.6, 0.45, 0.7, 0, 3.45, 0);
  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.08, 8, 24),
    toon(gradient, PALETTE.cobre, { emissive: 0xc8d8ff, emissiveIntensity: 1.4 }),
  );
  portalRing.position.set(0, 1.55, 0.1);
  portal.add(portalRing);
  const portalGlow = new THREE.PointLight(0xc8d8ff, 3.2, 9);
  portalGlow.position.set(0, 1.6, 0.2);
  portal.add(portalGlow);
  colliders.push(aabbAround(LAYOUT.portal.x - 1.55, LAYOUT.portal.z, 0.45, 0.45));
  colliders.push(aabbAround(LAYOUT.portal.x + 1.55, LAYOUT.portal.z, 0.45, 0.45));

  const poolX = LAYOUT.agua.x;
  const poolZ = LAYOUT.agua.z;
  box(scene, toon(gradient, PALETTE.aguaOrilla), 4.6, 0.28, 3.4, poolX, 0.08, poolZ);
  const water = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 2.9), waterMat);
  water.position.set(poolX, 0.18, poolZ);
  scene.add(water);
  colliders.push(aabbAround(poolX, poolZ, 2.05, 1.45));

  const bellG = new THREE.Group();
  bellG.position.set(LAYOUT.campana.x, 0, LAYOUT.campana.z);
  scene.add(bellG);
  cyl(bellG, wood, 0.08, 0.08, 1.8, 0, 2.2, 0, 6);
  box(bellG, wood, 1.4, 0.12, 0.16, 0, 3.05, 0);
  const bell = cyl(bellG, toon(gradient, 0xb08a48), 0.32, 0.42, 0.7, 0, 2.45, 0, 10);
  bell.userData.kind = 'campana';
  box(bellG, copperOx, 0.5, 0.35, 0.5, 0, 0.22, 0.55);
  colliders.push(aabbAround(LAYOUT.campana.x, LAYOUT.campana.z, 0.55, 0.7));

  const fuenteG = new THREE.Group();
  fuenteG.position.set(LAYOUT.fuente.x, 0, LAYOUT.fuente.z);
  scene.add(fuenteG);
  cyl(fuenteG, ceramic, 0.38, 0.48, 0.55, 0, 0.32, 0, 8);
  cyl(fuenteG, copper, 0.16, 0.16, 0.28, 0, 0.72, 0, 8);
  box(fuenteG, ceramic, 0.18, 0.42, 0.12, 0.55, 0.35, 0);
  colliders.push(aabbAround(LAYOUT.fuente.x, LAYOUT.fuente.z, 0.55, 0.5));

  const indicatorMesh = box(
    scene,
    toon(gradient, PALETTE.ambar, { emissive: PALETTE.ambar, emissiveIntensity: 0.35 }),
    0.18,
    0.42,
    0.18,
    LAYOUT.indicador.x,
    1.15,
    LAYOUT.indicador.z,
  );
  box(scene, stoneDark, 0.55, 0.9, 0.4, LAYOUT.indicador.x, 0.45, LAYOUT.indicador.z);
  const indicatorLight = new THREE.PointLight(PALETTE.ambar, 0.7, 5);
  indicatorLight.position.set(LAYOUT.indicador.x, 1.4, LAYOUT.indicador.z);
  scene.add(indicatorLight);

  addStrip(scene, copperLive, IDA_TRAZA, 0.22, 0.07, 0.08);
  addStrip(scene, copperOx, RETORNO_OESTE, 0.22, 0.07, 0.08);
  addStrip(scene, copperOx, RETORNO_ESTE, 0.22, 0.07, 0.08);
  addInsulators(scene, wood, ceramic, IDA_TRAZA, 3.2);

  const gapFill = box(scene, copperLive, 0.22, 0.08, 0.95, 0, 0.07, LAYOUT.contactoRetorno.z);
  gapFill.visible = false;

  const idaBar = new THREE.Group();
  box(idaBar, copper, 0.16, 0.1, 0.7, 0, 0, 0);
  idaBar.position.set(LAYOUT.contactoIda.x, 0.18, LAYOUT.contactoIda.z);
  scene.add(idaBar);

  const retornoBar = new THREE.Group();
  box(retornoBar, copper, 0.16, 0.1, 0.7, 0, 0, 0);
  retornoBar.position.set(0.15, 0.08, LAYOUT.contactoRetorno.z + 0.55);
  retornoBar.rotation.y = 0.6;
  scene.add(retornoBar);

  box(scene, ceramic, 0.16, 0.28, 0.16, 0.52, 0.18, LAYOUT.contactoRetorno.z);
  box(scene, ceramic, 0.16, 0.28, 0.16, -0.52, 0.18, LAYOUT.contactoRetorno.z);
  box(scene, ceramic, 0.16, 0.28, 0.16, LAYOUT.contactoIda.x, 0.18, LAYOUT.contactoIda.z - 0.45);
  box(scene, ceramic, 0.16, 0.28, 0.16, LAYOUT.contactoIda.x, 0.18, LAYOUT.contactoIda.z + 0.45);

  box(scene, copperOx, 0.4, 0.22, 0.18, LAYOUT.reparacion.x + 0.35, 0.2, LAYOUT.reparacion.z);
  box(scene, toon(gradient, 0x7a3040), 0.12, 0.04, 0.22, LAYOUT.reparacion.x + 0.35, 0.34, LAYOUT.reparacion.z);

  // TODO(dirección): placeholder junto al mecanismo público, no al Portal.
  const { root: ohm, eye: ohmEye } = makeOhm(gradient);
  ohm.position.set(LAYOUT.ohm.x, 0, LAYOUT.ohm.z);
  ohm.rotation.y = Math.PI * 0.15;
  scene.add(ohm);
  const ohmLight = new THREE.PointLight(PALETTE.cian, 0, 6);
  ohmLight.position.set(LAYOUT.ohm.x, 1.3, LAYOUT.ohm.z);
  scene.add(ohmLight);
  colliders.push(aabbAround(LAYOUT.ohm.x, LAYOUT.ohm.z, 0.5, 0.5));

  const player = makePerson(gradient, PALETTE.tunica, PALETTE.cabello, 1.62);
  player.position.set(LAYOUT.spawn.x, 0, LAYOUT.spawn.z);
  scene.add(player);

  const edda = makePerson(gradient, PALETTE.edda, PALETTE.eddaCapa, 1.66);
  edda.position.set(LAYOUT.eddaEntrada.x, 0, LAYOUT.eddaEntrada.z);
  edda.visible = false;
  scene.add(edda);

  const anchors: InteractAnchor[] = [
    { id: 'portal', x: LAYOUT.portal.x, z: LAYOUT.portal.z - 1.1, radio: 1.6 },
    { id: 'agua', x: LAYOUT.agua.x + 2.3, z: LAYOUT.agua.z, radio: 1.5 },
    { id: 'campana', x: LAYOUT.campana.x, z: LAYOUT.campana.z + 0.9, radio: 1.5 },
    { id: 'indicador', x: LAYOUT.indicador.x, z: LAYOUT.indicador.z + 0.7, radio: 1.4 },
    { id: 'fuente', x: LAYOUT.fuente.x, z: LAYOUT.fuente.z + 0.9, radio: 1.4 },
    { id: 'contacto_ida', x: LAYOUT.contactoIda.x, z: LAYOUT.contactoIda.z, radio: 1.35 },
    { id: 'contacto_retorno', x: LAYOUT.contactoRetorno.x, z: LAYOUT.contactoRetorno.z, radio: 1.45 },
    { id: 'ohm', x: LAYOUT.ohm.x, z: LAYOUT.ohm.z + 1.0, radio: 1.6 },
    { id: 'reparacion', x: LAYOUT.reparacion.x, z: LAYOUT.reparacion.z, radio: 1.4 },
  ];
  (Object.keys(PROBE_POS) as ProbeId[]).forEach((id) => {
    const p = PROBE_POS[id];
    cyl(scene, ceramic, 0.07, 0.07, 0.16, p.x, 0.16, p.z, 6);
    anchors.push({ id: `probe:${id}`, x: p.x, z: p.z, radio: 1.15 });
  });

  function resize(): void {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  return {
    scene,
    camera,
    renderer,
    player,
    edda,
    ohm,
    ohmEye,
    portalGlow,
    portalRing,
    indicatorMesh,
    indicatorLight,
    ohmLight,
    idaBar,
    retornoBar,
    gapFill,
    colliders,
    anchors,
    copperMats: [copperLive],
    gradient,
    dispose() {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      renderer.domElement.remove();
      gradient.dispose();
    },
  };
}
