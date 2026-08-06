// El Taller de Lumen, construido por código con la misma receta que la Plaza.
//
// La materia dominante cambia: acá manda la **madera**, que en `IDENTITY.md` comunica «taller,
// calor humano, reparación» y pide oficio real, no fantasía medieval genérica. La piedra queda
// como zócalo, que es lo que sostiene una carpintería que lleva décadas en pie.
//
// Lo que distingue a este set del anterior es el **techo**. Es el recurso de HD-2D que más se
// nota: entrás y el techo se abre en vez de cortar a otra pantalla. La maquinaria ya existía
// —`CameraOcclusionController` desvanece lo que tape a un sujeto protegido— pero se aplicaba a
// dos losas planas. Acá cada faldón se desvanece por su cuenta y deja ver la nave entera.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  block as kitBlock,
  loadKitMaps,
  noise,
  paint,
  projectUvs,
  triangleCount,
  weatheredPaint,
  type PaintFn,
} from './kitBuilder.ts';
import type { OcclusionBinding } from '../camera/occlusion.ts';
import type { BlockoutTimeOfDay } from '../materials/blockoutMaterials.ts';

const MATERIAL_URLS = {
  woodGrain: new URL('../../../assets/runtime/ohmdal/materials/taller-wood-grain.jpg', import.meta.url).href,
  woodNormal: new URL('../../../assets/runtime/ohmdal/materials/taller-wood-normal.jpg', import.meta.url).href,
  stoneGrain: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-grain.jpg', import.meta.url).href,
  stoneNormal: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-normal.jpg', import.meta.url).href,
} as const;

/** Huella del Taller. Sigue a la zona `taller` de `levelData`, con margen para los muros. */
export const TALLER_BOUNDS = Object.freeze({ minX: -4.6, maxX: 8.6, minZ: -5.2, maxZ: 4.7 });

/** La tabla es angosta: repetir cada 1,6 m deja una junta por paso del jugador. */
const WOOD_TILE_METERS = 1.6;
const STONE_TILE_METERS = 2.4;
const PLANK_PITCH_TARGET = 0.55;
const FLOOR_TOP_Y = 0.09;
/** Ancho del vano este, por donde se sale a la Puerta. Sigue a `S_TALLER_TO_DOOR`. */
const EAST_GAP = 3.4;

/**
 * Silueta del Taller, como datos y verificable por test.
 *
 * `SCENE_INVENTORY.md` llama a E3 «la escena más cara del slice» y `GOLDEN_FRAMES.md` pone acá
 * GF-04, el frame más importante: sujeto, objetivo y consecuencia tienen que coexistir legibles
 * en el mismo encuadre. Por eso la nave es **ancha y baja**, y las dos aguas tienen pendiente
 * distinta: la silueta no es simétrica y no se confunde con el Portal ni con la Puerta.
 */
export const TALLER_SILHOUETTE = Object.freeze({
  ridgeY: 4.2,
  eaveY: 2.8,
  /** Vano de acceso desde la Plaza. Coincide con el socket `S_PLAZA_TO_TALLER`. */
  doorway: Object.freeze({ x: -4.3, z: -2.5, width: 3.2 }),
  roofNorth: Object.freeze({ z: -2.7, depth: 3.6, tilt: 0.4 }),
  roofSouth: Object.freeze({ z: 1.9, depth: 2.8, tilt: -0.52 }),
});

const woodPaint = (topY: number, variation = 0.1): PaintFn =>
  weatheredPaint({ topY, bounds: TALLER_BOUNDS, variation, grime: 0.22, wear: 0.12 });

const stonePaint = (topY: number): PaintFn =>
  weatheredPaint({ topY, bounds: TALLER_BOUNDS, variation: 0.07, grime: 0.26, wear: 0.06 });

const wood = (
  width: number, height: number, depth: number,
  x: number, baseY: number, z: number, paintFn: PaintFn,
): THREE.BufferGeometry => kitBlock(width, height, depth, x, baseY, z, WOOD_TILE_METERS, paintFn);

const stone = (
  width: number, height: number, depth: number,
  x: number, baseY: number, z: number, paintFn: PaintFn,
): THREE.BufferGeometry => kitBlock(width, height, depth, x, baseY, z, STONE_TILE_METERS, paintFn);

/** Una pieza inclinada. `kitBlock` no contempla rotación, y un faldón la necesita. */
function tiltedBoard(
  width: number, thickness: number, depth: number,
  x: number, y: number, z: number, tilt: number, paintFn: PaintFn,
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, thickness, depth);
  geometry.rotateX(tilt);
  geometry.translate(x, y, z);
  return paint(projectUvs(geometry, WOOD_TILE_METERS), paintFn);
}

const WIDTH = TALLER_BOUNDS.maxX - TALLER_BOUNDS.minX;
const DEPTH = TALLER_BOUNDS.maxZ - TALLER_BOUNDS.minZ;
const CENTER_X = TALLER_BOUNDS.minX + WIDTH / 2;

/**
 * El piso de tablas. Corren a lo largo del eje x, que es la profundidad del cuadro: la
 * perspectiva las lee como líneas de fuga hacia el fondo y da profundidad gratis.
 */
function plankFloor(): THREE.BufferGeometry {
  const planks: THREE.BufferGeometry[] = [];
  const rows = Math.round(DEPTH / PLANK_PITCH_TARGET);
  const pitch = DEPTH / rows;
  const paintFn = woodPaint(FLOOR_TOP_Y, 0.13);

  for (let row = 0; row < rows; row += 1) {
    const z = TALLER_BOUNDS.minZ + (row + 0.5) * pitch;
    // Ninguna tabla está perfectamente a nivel: el Taller lleva décadas trabajando.
    const lift = (noise(row * 5.3, 1) - 0.5) * 0.022;
    planks.push(wood(WIDTH, FLOOR_TOP_Y, pitch - 0.035, CENTER_X, lift, z, paintFn));
  }
  const merged = mergeGeometries(planks, false)!;
  for (const plank of planks) plank.dispose();
  return merged;
}

/** Zócalo de piedra: separa la madera del suelo húmedo y explica por qué sigue en pie. */
function stoneBase(): THREE.BufferGeometry[] {
  const paintFn = stonePaint(0.55);
  return [
    stone(WIDTH, 0.55, 0.7, CENTER_X, 0, TALLER_BOUNDS.minZ + 0.35, paintFn),
    stone(WIDTH, 0.42, 0.7, CENTER_X, 0, TALLER_BOUNDS.maxZ - 0.35, paintFn),
    // El zócalo este se abre en el medio: por ahí sale el socket `S_TALLER_TO_DOOR` hacia la
    // Puerta, y cerrarlo dejaba la ruta canónica sin paso entre R6 y R7.
    stone(0.7, 0.55, (DEPTH - EAST_GAP) / 2, TALLER_BOUNDS.maxX - 0.35, 0,
      TALLER_BOUNDS.minZ + (DEPTH - EAST_GAP) / 4, paintFn),
    stone(0.7, 0.55, (DEPTH - EAST_GAP) / 2, TALLER_BOUNDS.maxX - 0.35, 0,
      TALLER_BOUNDS.maxZ - (DEPTH - EAST_GAP) / 4, paintFn),
  ];
}

/** Entramado: montantes cada 1,6 m sobre el zócalo, con su carrera y el paño del fondo. */
function timberFrame(): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const paintFn = woodPaint(TALLER_SILHOUETTE.eaveY);
  const { eaveY, doorway } = TALLER_SILHOUETTE;

  for (const z of [TALLER_BOUNDS.minZ + 0.35, TALLER_BOUNDS.maxZ - 0.35]) {
    const back = z < 0;
    const top = back ? eaveY : eaveY - 0.55;
    for (let x = TALLER_BOUNDS.minX + 0.8; x < TALLER_BOUNDS.maxX - 0.4; x += 1.6) {
      pieces.push(wood(0.26, top - 0.5, 0.34, x, 0.5, z, paintFn));
    }
    // Carrera continua: ata los montantes y da la horizontal de la nave.
    pieces.push(wood(WIDTH, 0.3, 0.44, CENTER_X, top - 0.5, z, paintFn));
    // Sólo el fondo cierra con tablas. El frente queda abierto a la cámara: si se cerrara,
    // GF-04 no podría tener sujeto, objetivo y consecuencia en el mismo encuadre.
    if (back) pieces.push(wood(WIDTH, top - 0.9, 0.16, CENTER_X, 0.55, z + 0.12, paintFn));
  }

  void doorway;
  return pieces;
}

/**
 * El vano de acceso, en pieza aparte porque **es el oclusor de primer plano** del set.
 *
 * En esta cámara el primer plano no es lo que está abajo en pantalla: es lo que tiene menos x,
 * porque la cámara se para en `target − cos(50°)` sobre ese eje. El vano queda justo ahí, entre
 * el ojo y el banco de Lumen, y por eso es lo que GF-05 verifica que se desvanezca sin salto de
 * exposición en vez de una pared inventada para la ocasión.
 */
function doorwayFrame(): THREE.BufferGeometry {
  const paintFn = woodPaint(TALLER_SILHOUETTE.eaveY);
  const { eaveY, doorway } = TALLER_SILHOUETTE;
  const pieces: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    pieces.push(wood(0.36, eaveY - 0.5, 0.36, doorway.x, 0.5, doorway.z + side * doorway.width / 2, paintFn));
  }
  pieces.push(wood(0.5, 0.36, doorway.width + 0.72, doorway.x, eaveY - 0.5, doorway.z, paintFn));
  const merged = mergeGeometries(pieces, false)!;
  for (const piece of pieces) piece.dispose();
  return merged;
}

/** El banco de Lumen. Es el objetivo de GF-04, así que tiene masa propia y no es una caja. */
function workbench(): THREE.BufferGeometry[] {
  const paintFn = woodPaint(0.95, 0.08);
  const x = 4.8;
  const z = -2.5;
  const pieces: THREE.BufferGeometry[] = [
    wood(2.6, 0.14, 1.05, x, 0.86, z, paintFn),
    wood(2.4, 0.2, 0.9, x, 0.66, z, paintFn),
  ];
  for (const dx of [-1.1, 1.1]) {
    for (const dz of [-0.4, 0.4]) {
      pieces.push(wood(0.18, 0.66, 0.18, x + dx, 0, z + dz, paintFn));
    }
  }
  return pieces;
}

export interface TallerKit {
  readonly root: THREE.Group;
  /** Los faldones se desvanecen solos cuando tapan al jugador. Es el recurso de DQ III. */
  readonly occlusionBindings: readonly OcclusionBinding[];
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  diagnostics(): { readonly meshes: number; readonly triangles: number };
  dispose(): void;
}

const WOOD_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x8a6b4e,
  twilight: 0x5f5a5c,
};
const BASE_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x7d7167,
  twilight: 0x5a5e6a,
};
const ROOF_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x6f5540,
  twilight: 0x4c464b,
};

export function createTallerKit(): TallerKit {
  const root = new THREE.Group();
  root.name = 'TALLER_KIT';

  const woodMaps = loadKitMaps(MATERIAL_URLS.woodGrain, MATERIAL_URLS.woodNormal);
  const stoneMaps = loadKitMaps(MATERIAL_URLS.stoneGrain, MATERIAL_URLS.stoneNormal);
  const textures = [woodMaps.grain, woodMaps.normal, stoneMaps.grain, stoneMaps.normal];

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: WOOD_COLORS.afternoon,
    map: woodMaps.grain,
    normalMap: woodMaps.normal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    vertexColors: true,
    roughness: 0.88,
    metalness: 0,
    flatShading: true,
  });
  woodMaterial.name = 'TALLER_WOOD';

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: BASE_COLORS.afternoon,
    map: stoneMaps.grain,
    normalMap: stoneMaps.normal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    vertexColors: true,
    roughness: 0.93,
    metalness: 0,
    flatShading: true,
  });
  baseMaterial.name = 'TALLER_BASE';

  // El techo lleva material propio y transparente porque se desvanece. Compartirlo con el
  // entramado bajaría la opacidad de toda la carpintería junto con el faldón.
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: ROOF_COLORS.afternoon,
    map: woodMaps.grain,
    normalMap: woodMaps.normal,
    normalScale: new THREE.Vector2(0.9, 0.9),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
    transparent: true,
    opacity: 1,
  });
  roofMaterial.name = 'TALLER_ROOF';

  const floorGeometry = plankFloor();
  const structureGeometry = mergeGeometries([...timberFrame(), ...workbench()], false)!;
  const baseGeometry = mergeGeometries(stoneBase(), false)!;

  const floorMesh = new THREE.Mesh(floorGeometry, woodMaterial);
  floorMesh.name = 'taller_floor';
  floorMesh.receiveShadow = true;
  const structureMesh = new THREE.Mesh(structureGeometry, woodMaterial);
  structureMesh.name = 'taller_structure';
  structureMesh.castShadow = true;
  structureMesh.receiveShadow = true;
  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.name = 'taller_base';
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  root.add(floorMesh, structureMesh, baseMesh);

  const { ridgeY, eaveY, roofNorth, roofSouth } = TALLER_SILHOUETTE;
  const roofPaint = woodPaint(ridgeY, 0.12);
  const midY = (ridgeY + eaveY) / 2;

  const occlusionBindings: OcclusionBinding[] = [];
  const fadingMeshes: THREE.Mesh[] = [];

  const doorwayGeometry = doorwayFrame();
  const doorwayMaterial = roofMaterial.clone();
  doorwayMaterial.color.setHex(WOOD_COLORS.afternoon);
  const doorwayMesh = new THREE.Mesh(doorwayGeometry, doorwayMaterial);
  doorwayMesh.name = 'taller-doorway';
  doorwayMesh.castShadow = true;
  doorwayMesh.userData.cameraOccluder = true;
  root.add(doorwayMesh);
  occlusionBindings.push({
    id: 'taller-doorway',
    object: doorwayMesh,
    setOpacity(opacity) {
      doorwayMaterial.opacity = opacity;
      doorwayMesh.visible = opacity > 0.001;
    },
  });

  const roofMeshes: THREE.Mesh[] = [];
  for (const [id, slope] of [
    ['taller-roof-north', roofNorth],
    ['taller-roof-south', roofSouth],
  ] as const) {
    const geometry = tiltedBoard(WIDTH, 0.24, slope.depth, CENTER_X, midY, slope.z, slope.tilt, roofPaint);
    const mesh = new THREE.Mesh(geometry, roofMaterial.clone());
    mesh.name = id;
    mesh.castShadow = true;
    mesh.userData.cameraRoof = true;
    root.add(mesh);
    roofMeshes.push(mesh);
    const material = mesh.material as THREE.MeshStandardMaterial;
    occlusionBindings.push({
      id,
      object: mesh,
      setOpacity(opacity) {
        material.opacity = opacity;
        mesh.visible = opacity > 0.001;
      },
    });
  }

  const ridgeGeometry = wood(WIDTH, 0.32, 0.56, CENTER_X, ridgeY - 0.32, -0.4, roofPaint);
  const ridgeMesh = new THREE.Mesh(ridgeGeometry, woodMaterial);
  ridgeMesh.name = 'taller_ridge';
  ridgeMesh.castShadow = true;
  root.add(ridgeMesh);

  return {
    root,
    occlusionBindings,
    setTimeOfDay(timeOfDay): void {
      woodMaterial.color.setHex(WOOD_COLORS[timeOfDay]);
      baseMaterial.color.setHex(BASE_COLORS[timeOfDay]);
      for (const mesh of roofMeshes) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(ROOF_COLORS[timeOfDay]);
      }
    },
    diagnostics() {
      const roofTriangles = roofMeshes.reduce((total, mesh) => total + triangleCount(mesh.geometry), 0);
      return {
        meshes: 5 + roofMeshes.length,
        triangles:
          triangleCount(floorGeometry) + triangleCount(structureGeometry)
          + triangleCount(baseGeometry) + triangleCount(ridgeGeometry)
          + triangleCount(doorwayGeometry) + roofTriangles,
      };
    },
    dispose(): void {
      root.removeFromParent();
      for (const texture of textures) texture.dispose();
      doorwayGeometry.dispose();
      doorwayMaterial.dispose();
      for (const mesh of [...roofMeshes, ...fadingMeshes]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      floorGeometry.dispose();
      structureGeometry.dispose();
      baseGeometry.dispose();
      ridgeGeometry.dispose();
      woodMaterial.dispose();
      baseMaterial.dispose();
      roofMaterial.dispose();
    },
  };
}
