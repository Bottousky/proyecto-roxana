// Construcción de meshes Three.js para el hall del Instituto: greybox voxel.
// Todo BoxGeometry, materiales MeshLambertMaterial. Sin animación (spike).
import * as THREE from 'three';
import { SCHOOL_LAYOUT } from './schoolModel.ts';

export interface SchoolScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  player: THREE.Group;
  /** Libera geometrías/materiales/luces creados acá. */
  dispose(): void;
}

const ROOM_WIDTH = 15; // eje X
const ROOM_DEPTH = 9; // eje Z
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.4;
const DOOR_WIDTH = 2.4;

export function buildSchoolScene(aspect: number): SchoolScene {
  const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
  const lights: THREE.Light[] = [];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0e0d12');
  scene.fog = new THREE.Fog('#0e0d12', 14, 26);

  // ---------- Materiales compartidos (una sola vez) ----------
  const floorMatA = new THREE.MeshLambertMaterial({ color: '#2a2733' });
  const floorMatB = new THREE.MeshLambertMaterial({ color: '#312d3b' });
  const wallMat = new THREE.MeshLambertMaterial({ color: '#3b3644' });
  const baseboardMat = new THREE.MeshLambertMaterial({ color: '#4a4356' });
  const doorMat = new THREE.MeshLambertMaterial({ color: '#6b4a2f' });
  const lampMat = new THREE.MeshLambertMaterial({ color: '#e8b04b', emissive: '#e8b04b' });
  const deskTopMat = new THREE.MeshLambertMaterial({ color: '#5a4030' });
  const deskLegMat = new THREE.MeshLambertMaterial({ color: '#5a4030' });
  const bitacoraMat = new THREE.MeshLambertMaterial({ color: '#cbb27e' });
  const preceptorTorsoMat = new THREE.MeshLambertMaterial({ color: '#3f4a63' });
  const skinMat = new THREE.MeshLambertMaterial({ color: '#d9a06b' });
  const playerTorsoMat = new THREE.MeshLambertMaterial({ color: '#3aa79b' });
  const columnMat = new THREE.MeshLambertMaterial({ color: '#443e50' });

  const sharedMaterials = [
    floorMatA,
    floorMatB,
    wallMat,
    baseboardMat,
    doorMat,
    lampMat,
    deskTopMat,
    deskLegMat,
    bitacoraMat,
    preceptorTorsoMat,
    skinMat,
    playerTorsoMat,
    columnMat,
  ];

  function addMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    disposables.push({ geometry });
    return mesh;
  }

  // ---------- Piso: grilla de baldosas 1x1 (alto 0.1) ----------
  const tileGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  disposables.push({ geometry: tileGeometry });
  const halfW = ROOM_WIDTH / 2;
  const halfD = ROOM_DEPTH / 2;
  for (let ix = 0; ix < ROOM_WIDTH; ix++) {
    for (let iz = 0; iz < ROOM_DEPTH; iz++) {
      const x = -halfW + 0.5 + ix;
      const z = -halfD + 0.5 + iz;
      const mat = (ix + iz) % 2 === 0 ? floorMatA : floorMatB;
      const mesh = new THREE.Mesh(tileGeometry, mat);
      mesh.position.set(x, -0.05, z);
      scene.add(mesh);
    }
  }

  // ---------- Paredes con zócalo; la pared norte deja el hueco de la puerta ----------
  function addWallSegment(x: number, z: number, width: number, depth: number): void {
    const wallGeo = new THREE.BoxGeometry(width, WALL_HEIGHT, depth);
    addMesh(wallGeo, wallMat, x, WALL_HEIGHT / 2, z);
    const baseGeo = new THREE.BoxGeometry(width, 0.25, depth);
    addMesh(baseGeo, baseboardMat, x, 0.125, z);
  }

  // Sur (frente, spawn) y las laterales, completas.
  addWallSegment(0, halfD + WALL_THICKNESS / 2, ROOM_WIDTH + WALL_THICKNESS * 2, WALL_THICKNESS);
  addWallSegment(-halfW - WALL_THICKNESS / 2, 0, WALL_THICKNESS, ROOM_DEPTH);
  addWallSegment(halfW + WALL_THICKNESS / 2, 0, WALL_THICKNESS, ROOM_DEPTH);

  // Norte: dos segmentos que dejan el hueco de la puerta (ancho DOOR_WIDTH) al centro.
  const northZ = -halfD - WALL_THICKNESS / 2;
  const sideWidth = (ROOM_WIDTH - DOOR_WIDTH) / 2;
  addWallSegment(-(DOOR_WIDTH / 2 + sideWidth / 2), northZ, sideWidth, WALL_THICKNESS);
  addWallSegment(DOOR_WIDTH / 2 + sideWidth / 2, northZ, sideWidth, WALL_THICKNESS);

  // ---------- Puerta doble a Ohmdal ----------
  const doorLeafGeo = new THREE.BoxGeometry(1.2, 2.6, 0.15);
  addMesh(doorLeafGeo, doorMat, -0.6, 1.3, northZ);
  addMesh(doorLeafGeo.clone(), doorMat, 0.6, 1.3, northZ);
  disposables.push({ geometry: doorLeafGeo });

  const lintelGeo = new THREE.BoxGeometry(DOOR_WIDTH, 0.3, WALL_THICKNESS);
  addMesh(lintelGeo, baseboardMat, 0, 2.75, northZ);

  const lampGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
  addMesh(lampGeo, lampMat, 0, 3.0, northZ);

  const doorLight = new THREE.PointLight('#e8b04b', 1.1, 6);
  doorLight.position.set(0, 2.9, northZ + 0.3);
  scene.add(doorLight);
  lights.push(doorLight);

  // ---------- Escritorio del preceptor ----------
  const deskTopGeo = new THREE.BoxGeometry(2, 0.12, 1);
  addMesh(deskTopGeo, deskTopMat, 4.2, 0.75, -0.9);

  const legGeo = new THREE.BoxGeometry(0.1, 0.75, 0.1);
  const legOffsets: [number, number][] = [
    [3.3, -1.3],
    [5.1, -1.3],
    [3.3, -0.5],
    [5.1, -0.5],
  ];
  for (const [lx, lz] of legOffsets) {
    addMesh(legGeo.clone(), deskLegMat, lx, 0.375, lz);
  }
  disposables.push({ geometry: legGeo });

  // Bitácora sobre el escritorio.
  const bitacoraGeo = new THREE.BoxGeometry(0.35, 0.08, 0.5);
  addMesh(bitacoraGeo, bitacoraMat, 4.2, 0.85, -0.9);

  // Luz puntual cálida tenue sobre el escritorio.
  const deskLight = new THREE.PointLight('#e8b04b', 0.5, 4);
  deskLight.position.set(4.2, 1.6, -0.9);
  scene.add(deskLight);
  lights.push(deskLight);

  // ---------- Preceptor (voxel-person), sin animación ----------
  const preceptorGroup = new THREE.Group();
  const preceptorTorsoGeo = new THREE.BoxGeometry(0.55, 0.85, 0.35);
  addMesh(preceptorTorsoGeo, preceptorTorsoMat, 0, 0.425 + 0.85, 0, preceptorGroup);
  const preceptorHeadGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  addMesh(preceptorHeadGeo, skinMat, 0, 0.85 + 0.85 + 0.2, 0, preceptorGroup);
  preceptorGroup.position.set(2.6, 0, -1.0);
  scene.add(preceptorGroup);

  // ---------- Columnas ----------
  const columnGeo = new THREE.BoxGeometry(0.6, 3, 0.6);
  addMesh(columnGeo, columnMat, -3.5, 1.5, 0);
  addMesh(columnGeo.clone(), columnMat, 3.5, 1.5, 2.5);
  disposables.push({ geometry: columnGeo });

  // ---------- Jugador (voxel-person), origen a nivel de piso ----------
  const player = new THREE.Group();
  const playerTorsoGeo = new THREE.BoxGeometry(0.55, 0.85, 0.35);
  addMesh(playerTorsoGeo, playerTorsoMat, 0, 0.425 + 0.1, 0, player);
  const playerHeadGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  addMesh(playerHeadGeo, skinMat, 0, 0.85 + 0.1 + 0.2, 0, player);
  player.position.set(SCHOOL_LAYOUT.spawn.x, 0, SCHOOL_LAYOUT.spawn.z);
  scene.add(player);

  // ---------- Luces ambientales ----------
  const ambient = new THREE.AmbientLight('#5a5468', 0.7);
  scene.add(ambient);
  lights.push(ambient);

  const directional = new THREE.DirectionalLight('#d8cfe8', 0.5);
  directional.position.set(0, 10, 8);
  scene.add(directional);
  lights.push(directional);

  // ---------- Cámara: ¾ semi-fija ----------
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 40);
  camera.position.set(player.position.x, 8.5, player.position.z + 7.5);
  camera.lookAt(player.position.x, 0.8, player.position.z);

  function dispose(): void {
    for (const item of disposables) {
      item.geometry?.dispose();
    }
    for (const mat of sharedMaterials) {
      mat.dispose();
    }
    for (const light of lights) {
      if ('dispose' in light && typeof (light as any).dispose === 'function') {
        (light as any).dispose();
      }
    }
  }

  return { scene, camera, player, dispose };
}
