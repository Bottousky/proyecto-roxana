// Hall del Instituto — pase de arte voxel procedural (canon: arte generado en
// motor, sin assets externos). Toda la sala es UNA malla voxel (voxelMesh.ts,
// culling de caras + sombreado horneado por orientación); los elementos que
// emiten luz (lámparas, ventanas) son meshes aparte con material sin sombrear.
// La lectura debe ser «apagada pero cuidada»: madera noble, lámparas cálidas
// aisladas y luz de luna fría por las ventanas.
import * as THREE from 'three';
import { SCHOOL_LAYOUT } from './schoolModel.ts';
import { buildVoxelFaces, createGrid, fillBox, setVoxel, type VoxelGrid } from './voxelMesh.ts';

export interface SchoolScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  player: THREE.Group;
  /** Libera geometrías/materiales/luces creados acá. */
  dispose(): void;
}

// ---------- Paleta única (índice de voxel = posición + 1) ----------
const PALETTE = [
  '#4a3527', // 1 tablón A / pelo castaño
  '#543d2c', // 2 tablón B
  '#3a2a1e', // 3 veta oscura / botas
  '#5a2e33', // 4 alfombra: campo rojo profundo
  '#c9a55a', // 5 dorado: bordes, bronce, emblemas
  '#3f2328', // 6 alfombra: interior
  '#7c705f', // 7 revoque
  '#4f3826', // 8 madera oscura: boiserie, marcos, biblioteca
  '#6b4a2f', // 9 madera media: molduras, puerta
  '#3f3a45', // 10 piedra: zócalo, bases
  '#55505c', // 11 fuste de columna
  '#57381f', // 12 tablero de puerta
  '#7a4b3a', // 13 libro A / cuero
  '#4e5e78', // 14 libro B
  '#6d7a4a', // 15 libro C
  '#8a6a3d', // 16 libro D
  '#5a3f63', // 17 libro E
  '#5a4030', // 18 tapa de escritorio
  '#4a3324', // 19 cuerpo de escritorio
  '#d8c69a', // 20 papel
  '#3f4a63', // 21 túnica del preceptor / estandartes
  '#d9a06b', // 22 piel
  '#3aa79b', // 23 chaqueta teal del jugador
  '#b7aca0', // 24 pelo gris
  '#33404a', // 25 pantalón
  '#241f26', // 26 ojos
];

const C = {
  floorA: 1, floorB: 2, seam: 3, rugField: 4, gold: 5, rugInner: 6,
  plaster: 7, woodDark: 8, wood: 9, stone: 10, column: 11, doorPanel: 12,
  bookA: 13, bookB: 14, bookC: 15, bookD: 16, bookE: 17,
  deskTop: 18, deskBody: 19, paper: 20, robe: 21, skin: 22, teal: 23,
  hairGray: 24, pants: 25, eyes: 26,
} as const;

// ---------- Grilla de la sala ----------
// Voxel de 0.25 m. Mundo: x -8..8, y -0.25..3.75, z -5..5.
// Interior caminable (bounds del modelo): x 2..61, z 2..37; paredes de 2 voxels.
const S = 0.25;
const GX = 64;
const GY = 14;
const GZ = 40;
const ROOM_OFFSET = { x: -8, y: -S, z: -5 };

/** Banda de color de las paredes según la altura (zócalo → boiserie → revoque). */
function wallColor(y: number): number {
  if (y === 1) return C.stone;
  if (y <= 4) return C.woodDark;
  if (y === 5) return C.wood;
  if (y === 12) return C.wood;
  return C.plaster;
}

function buildRoomGrid(): VoxelGrid {
  const g = createGrid(GX, GY, GZ);

  // --- Piso: tablones a lo largo de X, con vetas ocasionales deterministas ---
  for (let z = 0; z < GZ; z++) {
    for (let x = 0; x < GX; x++) {
      const plank = Math.floor(z / 2) % 2 === 0 ? C.floorA : C.floorB;
      const seam = (x * 7 + z * 13) % 19 === 0;
      setVoxel(g, x, 0, z, seam ? C.seam : plank);
    }
  }

  // --- Alfombra central (recolorea el piso, sin altura) ---
  for (let z = 18; z <= 29; z++) {
    for (let x = 24; x <= 39; x++) {
      const border = x === 24 || x === 39 || z === 18 || z === 29;
      const inner = x >= 27 && x <= 36 && z >= 21 && z <= 26;
      setVoxel(g, x, 0, z, border ? C.gold : inner ? C.rugInner : C.rugField);
    }
  }
  // Rombo dorado al centro.
  fillBox(g, 31, 0, 23, 32, 0, 24, C.gold);

  // --- Paredes (y 1..12) ---
  // La pared sur queda a la espalda de la cámara ¾ fija: se baja a parapeto
  // (0.75 m) para no ocluir nunca al jugador. La cámara no rota: el jugador
  // jamás ve el hueco superior.
  for (let y = 1; y <= 12; y++) {
    const color = wallColor(y);
    fillBox(g, 0, y, 0, GX - 1, y, 1, color); // norte
    if (y <= 2) fillBox(g, 0, y, GZ - 2, GX - 1, y, GZ - 1, color); // sur (parapeto)
    if (y === 3) fillBox(g, 0, y, GZ - 2, GX - 1, y, GZ - 1, C.wood); // remate del parapeto
    fillBox(g, 0, y, 0, 1, y, GZ - 1, color); // oeste
    fillBox(g, GX - 2, y, 0, GX - 1, y, GZ - 1, color); // este
  }

  // --- Ventanas en las paredes laterales (marco de madera, hueco a la noche) ---
  for (const z0 of [8, 26]) {
    for (const wall of ['west', 'east'] as const) {
      const x0 = wall === 'west' ? 0 : GX - 2;
      fillBox(g, x0, 6, z0, x0 + 1, 10, z0 + 5, C.woodDark); // marco
      fillBox(g, x0, 7, z0 + 1, x0 + 1, 9, z0 + 4, 0); // hueco (se ve la noche)
      // Travesaño central del marco.
      fillBox(g, x0, 7, z0 + 2, x0 + 1, 9, z0 + 3, 0);
      fillBox(g, x0, 8, z0 + 1, x0 + 1, 8, z0 + 4, C.woodDark);
    }
  }

  // --- Puerta doble a Ohmdal (hueco x 27..36 en la pared norte) ---
  fillBox(g, 27, 1, 0, 36, 11, 1, 0); // vaciar el hueco
  fillBox(g, 27, 1, 0, 36, 10, 1, C.wood); // hojas
  fillBox(g, 27, 11, 0, 36, 12, 1, C.woodDark); // dintel
  // Tableros hundidos en la cara interior (z=1) de cada hoja.
  fillBox(g, 28, 2, 1, 30, 8, 1, C.doorPanel);
  fillBox(g, 33, 2, 1, 35, 8, 1, C.doorPanel);
  // Manijas de bronce, sobresalen hacia el interior.
  setVoxel(g, 30, 4, 2, C.gold);
  setVoxel(g, 33, 4, 2, C.gold);

  // --- Biblioteca contra la pared norte (oeste de la puerta) ---
  fillBox(g, 4, 1, 2, 22, 9, 3, C.woodDark);
  const shelfRows: [number, number][] = [[2, 3], [5, 6], [8, 8]];
  const sections: [number, number][] = [[5, 9], [11, 15], [17, 21]];
  for (const [xa, xb] of sections) {
    for (const [ya, yb] of shelfRows) {
      for (let x = xa; x <= xb; x++) {
        for (let y = ya; y <= yb; y++) {
          // Lomos de libros en la cara frontal; algún hueco deliberado.
          const h = (x * 31 + y * 17) % 7;
          const book = h === 6 ? 0 : C.bookA + (h % 5);
          setVoxel(g, x, y, 3, book === 0 ? C.woodDark : book);
        }
      }
    }
  }

  // --- Estandartes del Instituto flanqueando la puerta ---
  for (const x0 of [23, 38]) {
    fillBox(g, x0, 5, 2, x0 + 2, 11, 2, C.robe);
    setVoxel(g, x0 + 1, 4, 2, C.robe); // punta inferior
    setVoxel(g, x0 + 1, 8, 2, C.gold); // emblema
    fillBox(g, x0, 11, 2, x0 + 2, 11, 2, C.gold); // barral
  }

  // --- Columnas (coinciden con los obstáculos del modelo) ---
  const columns: [number, number][] = [[18, 20], [46, 30]];
  for (const [cx, cz] of columns) {
    fillBox(g, cx - 2, 1, cz - 2, cx + 2, 1, cz + 2, C.stone); // base
    fillBox(g, cx - 1, 2, cz - 1, cx + 1, 10, cz + 1, C.column); // fuste
    fillBox(g, cx - 2, 11, cz - 2, cx + 2, 12, cz + 2, C.wood); // capitel
  }

  // --- Escritorio del preceptor con cajones y la bitácora abierta ---
  fillBox(g, 45, 1, 15, 51, 2, 17, C.deskBody);
  fillBox(g, 44, 3, 14, 52, 3, 18, C.deskTop);
  setVoxel(g, 46, 2, 18, C.gold); // tiradores de bronce
  setVoxel(g, 50, 2, 18, C.gold);
  fillBox(g, 46, 4, 15, 49, 4, 16, C.bookA); // tapas de cuero
  fillBox(g, 47, 5, 15, 48, 5, 16, C.paper); // páginas abiertas

  return g;
}

// ---------- Personajes (voxel de 0.1 m, grillas propias) ----------
const CH = 0.1;

function buildPreceptorGrid(): VoxelGrid {
  const g = createGrid(7, 18, 5);
  fillBox(g, 1, 0, 1, 5, 10, 3, C.robe); // túnica
  fillBox(g, 0, 0, 1, 0, 1, 3, C.robe); // vuelo de la túnica
  fillBox(g, 6, 0, 1, 6, 1, 3, C.robe);
  fillBox(g, 1, 6, 1, 5, 6, 3, C.gold); // faja
  fillBox(g, 0, 6, 1, 0, 10, 3, C.robe); // brazos
  fillBox(g, 6, 6, 1, 6, 10, 3, C.robe);
  setVoxel(g, 0, 5, 2, C.skin); // manos
  setVoxel(g, 6, 5, 2, C.skin);
  fillBox(g, 2, 11, 1, 4, 11, 3, C.gold); // cuello con trenza dorada
  fillBox(g, 2, 12, 0, 5, 15, 3, C.skin); // cabeza
  fillBox(g, 2, 15, 0, 5, 15, 3, C.hairGray); // pelo
  fillBox(g, 2, 12, 0, 5, 15, 0, C.hairGray); // nuca
  fillBox(g, 2, 12, 3, 5, 12, 3, C.hairGray); // barba
  setVoxel(g, 2, 13, 3, C.eyes);
  setVoxel(g, 5, 13, 3, C.eyes);
  return g;
}

function buildPlayerGrid(): VoxelGrid {
  const g = createGrid(7, 16, 5);
  for (const x0 of [1, 4]) {
    fillBox(g, x0, 0, 1, x0 + 1, 1, 3, C.seam); // botas
    fillBox(g, x0, 2, 1, x0 + 1, 4, 3, C.pants); // piernas
  }
  fillBox(g, 1, 5, 1, 5, 9, 3, C.teal); // chaqueta
  fillBox(g, 0, 5, 1, 0, 8, 3, C.teal); // brazos
  fillBox(g, 6, 5, 1, 6, 8, 3, C.teal);
  setVoxel(g, 0, 4, 2, C.skin); // manos
  setVoxel(g, 6, 4, 2, C.skin);
  fillBox(g, 0, 3, 1, 0, 4, 3, C.bookA); // morral de cuero
  fillBox(g, 2, 10, 0, 5, 13, 3, C.skin); // cabeza
  fillBox(g, 2, 14, 0, 5, 14, 3, C.floorA); // pelo castaño
  fillBox(g, 2, 10, 0, 5, 13, 0, C.floorA); // nuca
  setVoxel(g, 2, 12, 3, C.eyes);
  setVoxel(g, 5, 12, 3, C.eyes);
  return g;
}

export function buildSchoolScene(aspect: number): SchoolScene {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const lights: THREE.Light[] = [];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0e0d12');
  scene.fog = new THREE.Fog('#0e0d12', 16, 30);

  // Material único de toda la geometría voxel (color por vértice).
  const voxelMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  materials.push(voxelMat);

  function gridToMesh(
    grid: VoxelGrid,
    size: number,
    offset: { x: number; y: number; z: number },
    parent: THREE.Object3D,
  ): THREE.Mesh {
    const data = buildVoxelFaces(grid, PALETTE);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geometry.scale(size, size, size);
    geometry.translate(offset.x, offset.y, offset.z);
    geometry.computeBoundingSphere();
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, voxelMat);
    parent.add(mesh);
    return mesh;
  }

  // ---------- Sala ----------
  gridToMesh(buildRoomGrid(), S, ROOM_OFFSET, scene);

  // ---------- Preceptor ----------
  const preceptor = new THREE.Group();
  gridToMesh(buildPreceptorGrid(), CH, { x: -0.35, y: 0, z: -0.25 }, preceptor);
  preceptor.position.set(2.6, 0, -1.0);
  scene.add(preceptor);

  // ---------- Jugador ----------
  const player = new THREE.Group();
  gridToMesh(buildPlayerGrid(), CH, { x: -0.35, y: 0, z: -0.25 }, player);
  player.position.set(SCHOOL_LAYOUT.spawn.x, 0, SCHOOL_LAYOUT.spawn.z);
  scene.add(player);

  // ---------- Emisivos (no les afecta la luz) ----------
  function addGlow(
    geometry: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    rotY = 0,
  ): void {
    const material = new THREE.MeshBasicMaterial({ color });
    materials.push(material);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    scene.add(mesh);
  }

  // Lámpara sobre la puerta.
  addGlow(new THREE.BoxGeometry(0.3, 0.2, 0.2), '#f0be62', 0, 3.0, -4.55);
  // Farol del escritorio.
  addGlow(new THREE.BoxGeometry(0.16, 0.22, 0.16), '#f0be62', 4.85, 0.86, -1.25);
  // Apliques laterales.
  addGlow(new THREE.BoxGeometry(0.18, 0.26, 0.18), '#f0be62', -7.3, 2.4, 1.5);
  addGlow(new THREE.BoxGeometry(0.18, 0.26, 0.18), '#f0be62', 7.3, 2.4, 1.5);
  // Vidrio de luna en cada ventana (detrás del marco).
  const glassGeo = new THREE.PlaneGeometry(1.5, 1.0);
  const glassPositions: [number, number, number][] = [
    [-7.9, 1.9, -2.25],
    [-7.9, 1.9, 2.25],
  ];
  for (const [gx, gy, gz] of glassPositions) {
    addGlow(glassGeo.clone(), '#8fa3c8', gx, gy, gz, Math.PI / 2);
    addGlow(glassGeo.clone(), '#8fa3c8', -gx, gy, gz, -Math.PI / 2);
  }
  glassGeo.dispose();

  // ---------- Luces (intensidades físicas: three ≥ r165) ----------
  function addLight(light: THREE.Light, x = 0, y = 0, z = 0): void {
    light.position.set(x, y, z);
    scene.add(light);
    lights.push(light);
  }

  addLight(new THREE.HemisphereLight('#6a7188', '#3a2f28', 0.55));
  addLight(new THREE.AmbientLight('#4a4458', 0.5));
  addLight(new THREE.DirectionalLight('#9db1d8', 0.7), -8, 10, 2); // luna
  addLight(new THREE.PointLight('#e8b04b', 18, 8, 2), 0, 2.9, -4.2); // puerta
  addLight(new THREE.PointLight('#e8b04b', 8, 5, 2), 4.6, 1.6, -1.1); // escritorio
  addLight(new THREE.PointLight('#e8b04b', 10, 7, 2), -6.9, 2.4, 1.5); // apliques
  addLight(new THREE.PointLight('#e8b04b', 10, 7, 2), 6.9, 2.4, 1.5);
  addLight(new THREE.PointLight('#93a7c8', 5, 5, 2), -6.8, 2.0, -2.25); // ventanas
  addLight(new THREE.PointLight('#93a7c8', 5, 5, 2), 6.8, 2.0, 2.25);

  // ---------- Cámara: ¾ semi-fija (misma pose que el greybox) ----------
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 40);
  camera.position.set(player.position.x, 8.5, player.position.z + 7.5);
  camera.lookAt(player.position.x, 0.8, player.position.z);

  function dispose(): void {
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const light of lights) light.dispose();
  }

  return { scene, camera, player, dispose };
}
