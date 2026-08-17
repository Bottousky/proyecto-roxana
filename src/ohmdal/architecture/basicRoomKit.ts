// Kit genérico para las unidades U2-U5 del Arco I en HD-2D "básico".
//
// La Plaza, el Taller y la Puerta tienen su kit a mano: cada uno declara su silueta con
// geometry de prueba pero detallada, ancla sus materiales a la paleta de COLOR_SCRIPT.md
// y protege golden frames uno por uno. Eso es lo que hizo que esos tres pasen su contrato.
//
// Las 16 salas restantes del arco (Castillo × 4, Forja × 4, Terrazas × 4, Faro × 4) viven
// acá con una receta mucho más simple: una unidad = 4 sub-salas contiguas en una sola zona
// rectangular. La unidad tiene un piso empedrado continuo, muros de perímetro con vanos
// entre sub-salas, y una silueta distintiva por sub-sala. La silueta es la firma visual:
// un trono en el heart del Castillo, un yunque en el hall de la Forja, un acueducto en las
// Terrazas, una linterna en el Faro. Son cajas con un par de apilados, no modelos.
//
// La razón de ser de este kit es **dar el panorama jugable del arco**. Las pruebas de cámara,
// navegación y oclusión sirven para regresión; las siluetas quedan para producción cuando
// llegue el momento de cada unidad, en su propio hito.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  block as kitBlock,
  noise,
  paint,
  projectUvs,
  triangleCount,
  weatheredPaint,
  type PaintFn,
} from './kitBuilder.ts';
import type { BlockoutTimeOfDay } from '../materials/blockoutMaterials.ts';

/** Materiales ya horneados de Plaza + Taller, compartidos para mantener el coste de textura. */
const SHARED_MATERIALS = {
  stone: {
    grain: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-grain.jpg', import.meta.url).href,
    normal: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-normal.jpg', import.meta.url).href,
  },
  paving: {
    grain: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-grain.jpg', import.meta.url).href,
    normal: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-normal.jpg', import.meta.url).href,
  },
  wood: {
    grain: new URL('../../../assets/runtime/ohmdal/materials/taller-wood-grain.jpg', import.meta.url).href,
    normal: new URL('../../../assets/runtime/ohmdal/materials/taller-wood-normal.jpg', import.meta.url).href,
  },
} as const;

const STONE_TILE_METERS = 2.4;
const PAVING_TILE_METERS = 2;
const FLOOR_TOP_Y = 0.08;
const PAVER_SIZE = 1;
const PAVER_JOINT = 0.07;

/** Familia dominante del módulo — define el material de la silueta. */
export type BasicFamily = 'stone' | 'wood' | 'copper' | 'water' | 'glass';

/** Una sub-sala dentro de la unidad: ocupa una franja de x dentro de los bounds de la unidad. */
export interface BasicSubRoom {
  readonly id: string;
  /** Centro de la sub-sala en x. Define dónde se coloca la silueta. */
  readonly centerX: number;
  /** Ancho visible de la sub-sala — la silueta y la cámara la leen como propia. */
  readonly width: number;
  /** Familia material de la silueta. */
  readonly family: BasicFamily;
  /** Altura de la silueta principal, en metros. */
  readonly landmarkHeight: number;
  /** Forma de la silueta: cada preset es una composición distinta de bloques. */
  readonly landmark: BasicLandmark;
  /** Etiqueta legible para el HUD cuando el jugador está adentro. */
  readonly displayName: string;
}

/**
 * Modo de representación del kit.
 * - `'kit'` (default): la unidad se construye con materiales texturados, mapas de grano y
 *   relieves, vertex colors pintados y un piso empedrado con junta real. Es la versión
 *   "producida", la que se acerca al golden frame.
 * - `'greybox'`: la unidad se reduce a cajas planas — un solo material liso por familia,
 *   sin texturas, sin relieves, sin vertex colors, sin detalle de junta. Es la versión
 *   estructural, la que sirve para validar layout, navegación y silueta a contraluz antes
 *   de invertir tiempo en producción. Se usa para mapear todo el arco en una sola mirada.
 */
export type BasicUnitStyle = 'kit' | 'greybox';

/** Presets de silueta — una composición de bloques simple, reconocible a contraluz. */
export type BasicLandmark =
  | 'arch'
  | 'tower'
  | 'throne'
  | 'anvil'
  | 'furnace'
  | 'channel'
  | 'infirmary-bed'
  | 'mural'
  | 'aqueduct'
  | 'lantern'
  | 'bench'
  | 'clock';

export interface BasicUnitDefinition {
  readonly id: string;
  /** Huella total de la unidad en coordenadas de mundo. */
  readonly bounds: { readonly minX: number; readonly maxX: number; readonly minZ: number; readonly maxZ: number };
  /** Material del piso de la unidad. */
  readonly floorFamily: 'stone' | 'paving' | 'wood';
  /** Altura de los muros de perímetro, en metros. */
  readonly wallHeight: number;
  /** Familia de los muros. */
  readonly wallFamily: BasicFamily;
  /**
   * Sub-salas de la unidad. El kit básico está hecho para 4, pero el modo greybox usa
   * también unidades con 1 o 2 sub-salas (la Plaza, el Taller, la Puerta + Manantial).
   * En modo `'kit'` se esperan 4 para mantener la densidad visual del panorama; el modo
   * `'greybox'` acepta cualquier cantidad ≥ 1.
   */
  readonly subRooms: readonly BasicSubRoom[];
  /** Si la unidad se levanta hacia el este (Terrazas) o se mantiene plana. */
  readonly terrain?: 'flat' | 'ascending' | 'descending';
  /** Si la unidad está techada, el techo se desvanece con oclusión como el Taller. */
  readonly roofed?: boolean;
  /** Estilo de representación. Default: `'kit'`. Ver `BasicUnitStyle`. */
  readonly style?: BasicUnitStyle;
}

export interface BasicUnitKit {
  readonly root: THREE.Group;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  diagnostics(): { readonly meshes: number; readonly triangles: number };
  dispose(): void;
}

function block(
  width: number, height: number, depth: number,
  x: number, baseY: number, z: number, tileMeters: number, paintFn: PaintFn,
): THREE.BufferGeometry {
  return kitBlock(width, height, depth, x, baseY, z, tileMeters, paintFn);
}

function stonePaint(topY: number, bounds: { minX: number; maxX: number; minZ: number; maxZ: number }): PaintFn {
  return weatheredPaint({ topY, bounds, variation: 0.08, grime: 0.22, wear: 0.08 });
}

function wallPaint(topY: number, bounds: { minX: number; maxX: number; minZ: number; maxZ: number }): PaintFn {
  return weatheredPaint({ topY, bounds, variation: 0.06, grime: 0.26, wear: 0.05 });
}

function loadFamilyMaps(family: 'stone' | 'paving' | 'wood'): { grain: THREE.Texture; normal: THREE.Texture } {
  const urls = SHARED_MATERIALS[family];
  const grain = new THREE.TextureLoader().load(urls.grain);
  grain.wrapS = THREE.RepeatWrapping;
  grain.wrapT = THREE.RepeatWrapping;
  grain.colorSpace = THREE.SRGBColorSpace;
  grain.anisotropy = 4;
  const normal = new THREE.TextureLoader().load(urls.normal);
  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;
  normal.colorSpace = THREE.NoColorSpace;
  normal.anisotropy = 4;
  return { grain, normal };
}

function loadFamilyMapsOutside(): { grain: THREE.Texture; normal: THREE.Texture } {
  // En Node (tests) no hay decodificador: devolvemos texturas vacías, el material sigue válido.
  return { grain: new THREE.Texture(), normal: new THREE.Texture() };
}

function familyMaps(family: 'stone' | 'paving' | 'wood'): { grain: THREE.Texture; normal: THREE.Texture } {
  return typeof document === 'undefined' ? loadFamilyMapsOutside() : loadFamilyMaps(family);
}

function familyColor(family: BasicFamily, timeOfDay: BlockoutTimeOfDay): number {
  // Paleta reducida — hereda el mismo set de tonos que blockoutMaterials.ts pero con
  // un subconjunto, porque las unidades básicas no necesitan todos los matices.
  const table: Record<BasicFamily, Record<BlockoutTimeOfDay, number>> = {
    stone: { afternoon: 0x71685f, twilight: 0x545761 },
    wood: { afternoon: 0x59483c, twilight: 0x433d40 },
    copper: { afternoon: 0x80604a, twilight: 0x685149 },
    water: { afternoon: 0x467987, twilight: 0x376f82 },
    glass: { afternoon: 0x72a6ab, twilight: 0x55aab4 },
  };
  return table[family][timeOfDay];
}

/**
 * Piso empedrado de la unidad, basado en la misma receta de la Plaza: losas con junta
 * real, una pequeña variación de elevación, y la pintura determinista que distingue
 * cada losa. La diferencia con la Plaza es el rango: acá cubre toda la unidad.
 */
function paverFloor(
  bounds: BasicUnitDefinition['bounds'],
  seed: number,
  terrain: BasicUnitDefinition['terrain'],
): THREE.BufferGeometry {
  const pavers: THREE.BufferGeometry[] = [];
  const columns = Math.round((bounds.maxX - bounds.minX) / PAVER_SIZE);
  const rows = Math.round((bounds.maxZ - bounds.minZ) / PAVER_SIZE);
  const pitchX = (bounds.maxX - bounds.minX) / columns;
  const pitchZ = (bounds.maxZ - bounds.minZ) / rows;

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = bounds.minX + (column + 0.5) * pitchX;
      const z = bounds.minZ + (row + 0.5) * pitchZ;
      const wobble = noise(column + seed, row);
      const lift = (wobble - 0.5) * 0.03;
      const terrainLift = terrainLiftAt(x, bounds, terrain);
      const geometry = new THREE.BoxGeometry(pitchX - PAVER_JOINT, FLOOR_TOP_Y, pitchZ - PAVER_JOINT);
      geometry.translate(x, FLOOR_TOP_Y / 2 + lift + terrainLift, z);
      pavers.push(
        paint(projectUvs(geometry, PAVING_TILE_METERS), (_px, _py, _pz, out) => {
          const own = (noise((column + seed) * 3.1, row * 7.7) - 0.5) * 0.22;
          out.setScalar(Math.min(1.3, Math.max(0.38, 1 + own - 0.18)));
        }),
      );
    }
  }
  return mergeGeometries(pavers, false)!;
}

function terrainLiftAt(x: number, bounds: BasicUnitDefinition['bounds'], terrain: BasicUnitDefinition['terrain']): number {
  if (!terrain || terrain === 'flat') return 0;
  const t = (x - bounds.minX) / (bounds.maxX - bounds.minX);
  const clamped = Math.max(0, Math.min(1, t));
  // Curva suave: una rampa recta se lee como rampa; esto se lee como terreno.
  const eased = clamped * clamped * (3 - 2 * clamped);
  return terrain === 'ascending' ? eased * 4.5 : (1 - eased) * 4.5;
}

/**
 * Muro de perímetro, con vanos alineados a los bordes de cada sub-sala. Cada sub-sala
 * queda visualmente delimitada sin necesidad de puertas: la silueta al centro llena el
 * cuadro, y el muro del fondo enmarca la siguiente.
 */
function perimeterWall(
  unit: BasicUnitDefinition,
  paintFn: PaintFn,
): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const { bounds, wallHeight } = unit;
  const zNear = bounds.minZ + 0.2;
  const zFar = bounds.maxZ - 0.2;

  // Norte y sur: tramos de 2 m, con pilastra cada 4 m. Los vanos quedan justo en los bordes
  // de sub-sala para que la silueta del fondo enmarque la siguiente.
  for (const z of [zNear, zFar]) {
    for (let x = bounds.minX; x < bounds.maxX - 0.5; x += 2) {
      const span = Math.min(2, bounds.maxX - x);
      const height = wallHeight + noise(x, z) * 0.25;
      pieces.push(block(span - 0.08, height, 0.62, x + span / 2, 0, z, STONE_TILE_METERS, paintFn));
      if (Math.round(x) % 4 === 0) {
        pieces.push(block(0.62, height + 0.6, 0.86, x, 0, z, STONE_TILE_METERS, paintFn));
      }
    }
  }

  // Este y oeste: muros de fondo, sin vanos. Marcan la salida y entrada de la unidad.
  const wallX = (side: 'east' | 'west'): number => side === 'east' ? bounds.maxX - 0.3 : bounds.minX + 0.3;
  for (const x of [wallX('east'), wallX('west')]) {
    pieces.push(block(0.62, wallHeight + 0.3, bounds.maxZ - bounds.minZ - 0.4, x, 0, (bounds.minZ + bounds.maxZ) / 2, STONE_TILE_METERS, paintFn));
  }

  return pieces;
}

/** Compone la silueta distintiva de una sub-sala. */
function buildLandmark(landmark: BasicLandmark, sub: BasicSubRoom): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const x = sub.centerX;
  const z = 0; // centrada en Z
  const h = sub.landmarkHeight;
  const paintFn = stonePaint(h, { minX: x - 4, maxX: x + 4, minZ: -4, maxZ: 4 });

  switch (landmark) {
    case 'arch': {
      pieces.push(block(2.6, 0.5, 1.4, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, h, 0.5, x - 1.05, 0, z - 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, h, 0.5, x + 1.05, 0, z - 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, h, 0.5, x - 1.05, 0, z + 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, h, 0.5, x + 1.05, 0, z + 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.6, 0.5, 1.4, x, h, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 0.4, 0.5, x - 1.05, h + 0.5, z - 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 0.4, 0.5, x + 1.05, h + 0.5, z - 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 0.4, 0.5, x - 1.05, h + 0.5, z + 0.45, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 0.4, 0.5, x + 1.05, h + 0.5, z + 0.45, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'tower': {
      pieces.push(block(2.0, 0.5, 2.0, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.6, h, 1.6, x, 0.5, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.9, 0.4, 1.9, x, 0.5 + h, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 1.2, 0.5, x - 0.7, 0.5 + h + 0.4, z - 0.7, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 1.2, 0.5, x + 0.7, 0.5 + h + 0.4, z - 0.7, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 1.2, 0.5, x - 0.7, 0.5 + h + 0.4, z + 0.7, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, 1.2, 0.5, x + 0.7, 0.5 + h + 0.4, z + 0.7, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'throne': {
      pieces.push(block(2.4, 0.3, 1.6, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.0, h * 0.4, 1.2, x, 0.3, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.7, 1.4, x - 0.6, 0.3 + h * 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.7, 1.4, x + 0.6, 0.3 + h * 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.8, 0.5, 0.4, x, 0.3 + h * 0.4, z - 0.4, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.0, h * 0.5, 0.4, x, 0.3 + h * 0.4, z + 0.4, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'anvil': {
      pieces.push(block(2.6, 0.7, 1.4, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, 0.8, 0.6, x, 0.7, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.6, 0.5, 0.8, x, 1.5, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.4, 0.4, 0.4, x - 0.6, 1.5, z - 0.2, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.4, 0.4, 0.4, x + 0.6, 1.5, z - 0.2, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'furnace': {
      pieces.push(block(2.0, 0.4, 1.4, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.6, h * 0.7, 1.0, x, 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.4, h * 0.4, 0.8, x, 0.4 + h * 0.7, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.5, h * 0.3, 0.5, x, 0.4 + h * 0.7 - h * 0.3, z + 0.3, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'channel': {
      pieces.push(block(2.2, 0.2, 0.8, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.8, 0.5, 0.4, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.8, 0.2, 0.4, x, 0.4, z, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'infirmary-bed': {
      pieces.push(block(2.0, 0.1, 1.0, x, 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.6, 0.2, x - 0.9, 0.1, z - 0.4, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.6, 0.2, x - 0.9, 0.1, z + 0.4, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.6, 0.2, x + 0.9, 0.1, z - 0.4, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.6, 0.2, x + 0.9, 0.1, z + 0.4, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.0, 0.05, 1.0, x, 0.7, z, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'mural': {
      pieces.push(block(2.6, h, 0.4, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.2, h * 0.85, 0.2, x, 0, z + 0.2, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.6, h * 0.3, 0.1, x, h * 0.5, z + 0.3, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.2, 0.1, x, h * 0.8, z + 0.3, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'aqueduct': {
      pieces.push(block(0.6, h * 0.6, 0.6, x - 1.0, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.6, 0.6, x + 1.0, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.6, 0.4, 0.6, x, h * 0.6, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(2.4, 0.2, 0.4, x, h * 0.6 + 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.4, h * 0.3, 0.4, x - 1.0, h * 0.6 + 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.4, h * 0.3, 0.4, x + 1.0, h * 0.6 + 0.4, z, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'lantern': {
      pieces.push(block(1.6, 0.4, 1.6, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.8, h * 0.85, 0.8, x, 0.4, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(1.2, 0.2, 1.2, x, 0.4 + h * 0.85, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.15, 0.6, x, 0.4 + h * 0.85 + 0.2, z, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'bench': {
      pieces.push(block(1.4, 0.1, 0.5, x, 0.5, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.5, 0.2, x - 0.6, 0, z - 0.15, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.5, 0.2, x - 0.6, 0, z + 0.15, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.5, 0.2, x + 0.6, 0, z - 0.15, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.2, 0.5, 0.2, x + 0.6, 0, z + 0.15, STONE_TILE_METERS, paintFn));
      break;
    }
    case 'clock': {
      pieces.push(block(1.4, h, 0.5, x, 0, z, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.6, h * 0.3, 0.1, x, h * 0.7, z + 0.3, STONE_TILE_METERS, paintFn));
      pieces.push(block(0.1, h * 0.3, 0.1, x, h * 0.7, z + 0.3, STONE_TILE_METERS, paintFn));
      break;
    }
  }

  return pieces;
}

/** Muros bajos entre sub-salas: dan continuidad sin cerrar la silueta del fondo. */
function subRoomDividers(unit: BasicUnitDefinition, paintFn: PaintFn): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  // El borde entre sub-salas contiguas cae a la mitad de su ancho: deja un paso central
  // de 3 m y dos machones a los lados, lo que mantiene el ritmo de vanos que pide la Plaza.
  for (let index = 0; index < unit.subRooms.length - 1; index += 1) {
    const left = unit.subRooms[index];
    const right = unit.subRooms[index + 1];
    const midX = (left.centerX + right.centerX) / 2;
    pieces.push(block(0.5, unit.wallHeight * 0.8, 1.0, midX - 1.5, 0, 0, STONE_TILE_METERS, paintFn));
    pieces.push(block(0.5, unit.wallHeight * 0.8, 1.0, midX + 1.5, 0, 0, STONE_TILE_METERS, paintFn));
  }
  return pieces;
}

function unitPaintBounds(unit: BasicUnitDefinition): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return { minX: unit.bounds.minX, maxX: unit.bounds.maxX, minZ: unit.bounds.minZ, maxZ: unit.bounds.maxZ };
}

/**
 * Modo greybox: una sola losa plana, sin junta, sin relieve, sin pintura.
 * Lo único que conserva del empedrado es la silueta rectangular.
 */
function flatFloor(bounds: BasicUnitDefinition['bounds']): THREE.BufferGeometry {
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const geometry = new THREE.BoxGeometry(width, 0.08, depth);
  geometry.translate(
    (bounds.minX + bounds.maxX) / 2,
    0.04,
    (bounds.minZ + bounds.maxZ) / 2,
  );
  return geometry;
}

/**
 * Modo greybox: cuatro muros de perímetro como cajas simples, sin pilastras ni vanos.
 * Los colliders de `levelData.ts` ya aportan la separación real entre unidades — el greybox
 * sólo necesita marcar el contorno para que el ojo lea la huella de la sala.
 */
function flatPerimeter(unit: BasicUnitDefinition): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const { bounds, wallHeight } = unit;
  const wallThickness = 0.62;
  for (const z of [bounds.minZ, bounds.maxZ]) {
    const geometry = new THREE.BoxGeometry(
      bounds.maxX - bounds.minX,
      wallHeight,
      wallThickness,
    );
    geometry.translate(
      (bounds.minX + bounds.maxX) / 2,
      wallHeight / 2,
      z,
    );
    pieces.push(geometry);
  }
  for (const x of [bounds.minX, bounds.maxX]) {
    const geometry = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      bounds.maxZ - bounds.minZ,
    );
    geometry.translate(
      x,
      wallHeight / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    );
    pieces.push(geometry);
  }
  return pieces;
}

/**
 * Material liso por familia, sin texturas ni normales. La paleta es la misma que el modo
 * `kit` (`familyColor`) para que las dos versiones del mundo se lean como la misma escena.
 */
function flatMaterial(family: BasicFamily, name: string, _role: 'FLOOR' | 'WALL' | 'LANDMARK'): THREE.MeshStandardMaterial {
  const isMetal = family === 'copper';
  const isTransparent = family === 'water' || family === 'glass';
  const material = new THREE.MeshStandardMaterial({
    color: familyColor(family, 'afternoon'),
    roughness: isMetal ? 0.55 : family === 'glass' ? 0.38 : 0.92,
    metalness: isMetal ? 0.45 : 0,
    transparent: isTransparent,
    opacity: isTransparent ? (family === 'water' ? 0.72 : 0.78) : 1,
    depthWrite: !isTransparent,
    flatShading: true,
  });
  material.name = name;
  return material;
}

export function createBasicUnitKit(definition: BasicUnitDefinition): BasicUnitKit {
  if (definition.style === 'greybox') {
    return createGreyboxUnitKit(definition);
  }
  return createDetailedUnitKit(definition);
}

/**
 * Modo `'greybox'`: piso plano, perímetro de cuatro cajas, landmarks con la misma silueta
 * que el modo `kit` pero sin texturas ni vertex colors. Es la lectura estructural del
 * arco: veinte salas, todas en una sola pasada visual.
 */
function createGreyboxUnitKit(definition: BasicUnitDefinition): BasicUnitKit {
  const root = new THREE.Group();
  root.name = `${definition.id.toUpperCase()}_KIT`;
  root.userData.unitId = definition.id;
  root.userData.style = 'greybox';

  const floorGeometry = flatFloor(definition.bounds);
  const floorMaterial = flatMaterial(definition.wallFamily, `${definition.id.toUpperCase()}_FLOOR`, 'FLOOR');
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.name = `${definition.id}_floor`;
  floorMesh.receiveShadow = true;
  floorMesh.castShadow = false;
  root.add(floorMesh);

  const wallPieces = flatPerimeter(definition);
  const wallGeometry = mergeGeometries(wallPieces, false)!;
  for (const piece of wallPieces) piece.dispose();
  const wallMaterial = flatMaterial('stone', `${definition.id.toUpperCase()}_WALL`, 'WALL');
  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  wallMesh.name = `${definition.id}_walls`;
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  root.add(wallMesh);

  // Landmarks: una sola malla por familia, sin texturas. Las siluetas se conservan.
  const landmarkByFamily = new Map<BasicFamily, THREE.BufferGeometry[]>();
  for (const sub of definition.subRooms) {
    const list = landmarkByFamily.get(sub.family) ?? [];
    for (const piece of buildLandmark(sub.landmark, sub)) list.push(piece);
    landmarkByFamily.set(sub.family, list);
  }
  const landmarkMaterials = new Map<BasicFamily, THREE.MeshStandardMaterial>();
  for (const [family, pieces] of landmarkByFamily) {
    if (pieces.length === 0) continue;
    const merged = mergeGeometries(pieces, false)!;
    for (const piece of pieces) piece.dispose();
    const material = flatMaterial(family, `${definition.id.toUpperCase()}_LANDMARK_${family.toUpperCase()}`, 'LANDMARK');
    landmarkMaterials.set(family, material);
    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `${definition.id}_landmark_${family}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
  }

  return {
    root,
    setTimeOfDay(timeOfDay): void {
      floorMaterial.color.setHex(familyColor(definition.wallFamily, timeOfDay));
      wallMaterial.color.setHex(familyColor('stone', timeOfDay));
      for (const [family, material] of landmarkMaterials) {
        material.color.setHex(familyColor(family, timeOfDay));
      }
    },
    diagnostics() {
      let totalTriangles = triangleCount(floorGeometry) + triangleCount(wallGeometry);
      root.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          totalTriangles += triangleCount((object as THREE.Mesh).geometry);
        }
      });
      return { meshes: root.children.length, triangles: totalTriangles };
    },
    dispose(): void {
      root.removeFromParent();
      root.clear();
      floorGeometry.dispose();
      wallGeometry.dispose();
      floorMaterial.dispose();
      wallMaterial.dispose();
      for (const material of landmarkMaterials.values()) material.dispose();
    },
  };
}

/**
 * Modo `'kit'` (default): la versión producida — empedrado, vertex colors pintados,
 * texturas, normales. Es la misma función que vivía acá antes de que se sumara el modo
 * greybox para mapear el arco completo.
 */
function createDetailedUnitKit(definition: BasicUnitDefinition): BasicUnitKit {
  const root = new THREE.Group();
  root.name = `${definition.id.toUpperCase()}_KIT`;
  root.userData.unitId = definition.id;
  root.userData.style = 'kit';

  // Los hashes por sub-sala mantienen la pintura determinista aunque las sub-salas vivan
  // en zonas distintas: la misma sub-sala pinta igual acá y en otro render.
  const unitSeed = [...definition.id].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 9973, 7);
  const floorPaintBounds = unitPaintBounds(definition);

  const floorGeometry = paverFloor(definition.bounds, unitSeed, definition.terrain);
  const wallPaintFn = wallPaint(definition.wallHeight, floorPaintBounds);
  const wallPieces = perimeterWall(definition, wallPaintFn);
  const dividerPieces = subRoomDividers(definition, wallPaintFn);
  const landmarkPieces: THREE.BufferGeometry[] = [];
  for (const sub of definition.subRooms) {
    landmarkPieces.push(...buildLandmark(sub.landmark, sub));
  }

  // Materiales. Cada uno se clona del set compartido para que los tweaks de hora del día
  // no se propaguen entre unidades — el bloque de luz compartido es blockoutMaterials, no
  // esto.
  const floorMaps = familyMaps(definition.floorFamily);
  const wallMaps = familyMaps('stone');
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: familyColor(definition.wallFamily, 'afternoon'),
    map: floorMaps.grain,
    normalMap: floorMaps.normal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    vertexColors: true,
    roughness: 0.93,
    metalness: 0,
    flatShading: true,
  });
  floorMaterial.name = `${definition.id.toUpperCase()}_FLOOR`;
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: familyColor(definition.wallFamily, 'afternoon'),
    map: wallMaps.grain,
    normalMap: wallMaps.normal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });
  wallMaterial.name = `${definition.id.toUpperCase()}_WALL`;
  // Para landmark usamos un material por familia de sub-sala. La mayoría serán stone, pero
  // si el guión pide cobre (linterna, conducto) se hace visible.
  const landmarkMaterials = new Map<BasicFamily, THREE.MeshStandardMaterial>();
  const texturesToDispose: THREE.Texture[] = [floorMaps.grain, floorMaps.normal, wallMaps.grain, wallMaps.normal];

  const getLandmarkMaterial = (family: BasicFamily): THREE.MeshStandardMaterial => {
    const existing = landmarkMaterials.get(family);
    if (existing) return existing;
    const isMetal = family === 'copper';
    const isTransparent = family === 'water' || family === 'glass';
    const material = new THREE.MeshStandardMaterial({
      color: familyColor(family, 'afternoon'),
      map: wallMaps.grain,
      normalMap: wallMaps.normal,
      normalScale: new THREE.Vector2(isMetal ? 0.4 : 0.65, isMetal ? 0.4 : 0.65),
      vertexColors: true,
      roughness: isMetal ? 0.55 : family === 'glass' ? 0.38 : 0.85,
      metalness: isMetal ? 0.45 : 0,
      transparent: isTransparent,
      opacity: isTransparent ? (family === 'water' ? 0.72 : 0.78) : 1,
      depthWrite: !isTransparent,
      flatShading: true,
    });
    material.name = `${definition.id.toUpperCase()}_LANDMARK_${family.toUpperCase()}`;
    landmarkMaterials.set(family, material);
    return material;
  };

  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.name = `${definition.id}_floor`;
  floorMesh.receiveShadow = true;
  floorMesh.castShadow = false;
  root.add(floorMesh);

  const wallGeometry = mergeGeometries([...wallPieces, ...dividerPieces], false)!;
  for (const piece of [...wallPieces, ...dividerPieces]) piece.dispose();
  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  wallMesh.name = `${definition.id}_walls`;
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  root.add(wallMesh);

  // Landmarks agrupados por familia para minimizar draw calls (mismo principio que la Plaza).
  const landmarkByFamily = new Map<BasicFamily, THREE.BufferGeometry[]>();
  for (const sub of definition.subRooms) {
    const list = landmarkByFamily.get(sub.family) ?? [];
    for (const piece of buildLandmark(sub.landmark, sub)) list.push(piece);
    landmarkByFamily.set(sub.family, list);
  }
  for (const piece of landmarkPieces) piece.dispose();
  for (const [family, pieces] of landmarkByFamily) {
    if (pieces.length === 0) continue;
    const merged = mergeGeometries(pieces, false)!;
    for (const piece of pieces) piece.dispose();
    const mesh = new THREE.Mesh(merged, getLandmarkMaterial(family));
    mesh.name = `${definition.id}_landmark_${family}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
  }

  return {
    root,
    setTimeOfDay(timeOfDay): void {
      floorMaterial.color.setHex(familyColor(definition.wallFamily, timeOfDay));
      wallMaterial.color.setHex(familyColor(definition.wallFamily, timeOfDay));
      for (const [family, material] of landmarkMaterials) {
        material.color.setHex(familyColor(family, timeOfDay));
      }
    },
    diagnostics() {
      const landmarkTriangles = Array.from(landmarkByFamily.values())
        .flat()
        .reduce((total, _piece, _index, _arr) => total, 0);
      void landmarkTriangles;
      let totalTriangles = triangleCount(floorGeometry) + triangleCount(wallGeometry);
      root.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          totalTriangles += triangleCount((object as THREE.Mesh).geometry);
        }
      });
      return { meshes: root.children.length, triangles: totalTriangles };
    },
    dispose(): void {
      root.removeFromParent();
      root.clear();
      floorGeometry.dispose();
      wallGeometry.dispose();
      floorMaterial.dispose();
      wallMaterial.dispose();
      for (const material of landmarkMaterials.values()) material.dispose();
      for (const texture of texturesToDispose) texture.dispose();
    },
  };
}
