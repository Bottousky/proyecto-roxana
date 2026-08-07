// La Puerta de Ohm y el Manantial, construidos por código con la receta de los otros dos sets.
//
// Es la única zona que contiene **dos** escenas causales: E4, donde la Puerta abre por
// transferencia y no por fórmula nueva, y E5, donde el agua vuelve a correr. `COLOR_SCRIPT.md`
// §5 la atraviesa con la transición de tarde a crepúsculo, ligada a caminar y no al reloj.
//
// Tres cosas la separan de la Plaza y del Taller:
//
//   1. **La Puerta es una masa que corta el paso**, no un vano. Dos jambas, un dintel y dos
//      hojas que sólo se abren cuando el caudal entra en la franja justa.
//   2. **El terreno sube.** El Manantial está sobre una calzada que asciende: por eso el agua
//      baja hasta la Plaza cuando el mecanismo se restaura, y por eso E5 es un mirador.
//   3. **El agua tiene tres estados** —detenida, flujo parcial, flujo estable— porque
//      `IDENTITY.md` los declara como regla dura de la materia, no como efecto.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  block as kitBlock,
  loadKitMaps,
  noise,
  triangleCount,
  weatheredPaint,
  type PaintFn,
} from './kitBuilder.ts';
import type { OcclusionBinding } from '../camera/occlusion.ts';
import type { BlockoutTimeOfDay } from '../materials/blockoutMaterials.ts';

const MATERIAL_URLS = {
  stoneGrain: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-grain.jpg', import.meta.url).href,
  stoneNormal: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-normal.jpg', import.meta.url).href,
  pavingGrain: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-grain.jpg', import.meta.url).href,
  pavingNormal: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-normal.jpg', import.meta.url).href,
} as const;

/**
 * Huella de la zona. Sigue a `puerta_manantial` de `levelData`, con margen para los muros.
 *
 * El ancho en Z no está a ojo: `C3_DOOR_SPRING` es frontal —`CAMERA_RIGHT` es literalmente el
 * eje Z del mundo (`cameraConfig.ts:58`)— y encuadra `verticalSpan.desktop(12) × aspect(1,6) =
 * 19,2 m` de ancho. El objetivo de cámara sigue al jugador dentro de `targetBounds.right =
 * [-3, 3]` sobre `focus.z = 0,4`, así que en los dos frames contractuales de esta zona la
 * ventana visible es:
 *   - `R8_DOOR_MEASURE` (z=-0,5): target.z=-0,5 → visible Z ∈ [-10,1; 9,1]
 *   - `R9_SPRING_EDGE` (z=1,5): target.z=1,5 → visible Z ∈ [-8,1; 11,1]
 * La unión de ambas, [-10,1; 11,1], es lo mínimo que la geometría tiene que cubrir para que
 * ninguno de los dos frames golden deje fondo vacío. Antes de este ajuste, `minZ`/`maxZ` eran
 * -5,4/5,8: con los 11,2 m viejos el hueco a cada lado —el mismo tamaño absoluto que ya tiene
 * `PLAZA_BOUNDS` contra su zona, pero repartido simétrico y renderizado a crepúsculo en vez de
 * a pleno día— se leía como viñeta severa. Verificado jugando, no sólo calculado.
 */
export const PUERTA_BOUNDS = Object.freeze({ minX: 8, maxX: 20.8, minZ: -10.5, maxZ: 11.5 });

const STONE_TILE_METERS = 2.4;
const PAVING_TILE_METERS = 2;
const FLOOR_TOP_Y = 0.08;
/** Ancho del vano oeste, por donde se llega desde el Taller. Sigue a `S_TALLER_TO_DOOR`. */
const WEST_GAP = 3.4;

/**
 * Silueta de la Puerta y del Manantial, como datos y verificable por test.
 *
 * `GOLDEN_FRAMES.md` GF-06 registra una regresión conocida: la ronda 1 falló acá porque los
 * pilares se alineaban con el estudiante y se lo comían. Por eso las jambas están **separadas
 * del eje de la ruta** y el vano es ancho: el jugador nunca queda detrás de una de ellas.
 */
export const PUERTA_SILHOUETTE = Object.freeze({
  /** La Puerta corta el paso a la altura del anclaje de medición. */
  x: 14.6,
  jambWidth: 1.3,
  jambHeight: 5.4,
  /** Separación entre jambas. Ancho de sobra para que el estudiante no se pierda detrás. */
  opening: 4.2,
  lintelHeight: 0.9,
  /** El Manantial está sobre la calzada que sube: es lo que hace que el agua baje sola. */
  causewayStartX: 16.2,
  causewayRise: 1.15,
  basin: Object.freeze({ x: 18.6, z: 1.5, width: 3.4, depth: 3.4 }),
});

const stonePaint = (topY: number, variation = 0.08): PaintFn =>
  weatheredPaint({ topY, bounds: PUERTA_BOUNDS, variation, grime: 0.24, wear: 0.09 });

const copperPaint = (topY: number): PaintFn =>
  weatheredPaint({ topY, bounds: PUERTA_BOUNDS, variation: 0.05, grime: 0.16, wear: 0.12 });

const stone = (
  width: number, height: number, depth: number,
  x: number, baseY: number, z: number, paintFn: PaintFn,
): THREE.BufferGeometry => kitBlock(width, height, depth, x, baseY, z, STONE_TILE_METERS, paintFn);

const WIDTH = PUERTA_BOUNDS.maxX - PUERTA_BOUNDS.minX;
const DEPTH = PUERTA_BOUNDS.maxZ - PUERTA_BOUNDS.minZ;
const CENTER_Z = (PUERTA_BOUNDS.minZ + PUERTA_BOUNDS.maxZ) / 2;

/** Altura del suelo en un punto: plano hasta la Puerta, en pendiente hacia el Manantial. */
export function groundHeightAt(x: number): number {
  const { causewayStartX, causewayRise } = PUERTA_SILHOUETTE;
  if (x <= causewayStartX) return 0;
  const t = Math.min(1, (x - causewayStartX) / (PUERTA_BOUNDS.maxX - causewayStartX));
  // Curva suave: una rampa recta se lee como rampa; ésta se lee como terreno.
  return causewayRise * t * t * (3 - 2 * t);
}

/**
 * El suelo, en losas que **siguen la pendiente**. Es lo que hace legible que el Manantial está
 * arriba y que el agua baja hasta la Plaza por su propio peso.
 */
function slopedPaving(): THREE.BufferGeometry {
  const slabs: THREE.BufferGeometry[] = [];
  const columns = Math.round(WIDTH / 1.1);
  const rows = Math.round(DEPTH / 1.1);
  const pitchX = WIDTH / columns;
  const pitchZ = DEPTH / rows;
  const paintFn = stonePaint(FLOOR_TOP_Y + PUERTA_SILHOUETTE.causewayRise, 0.14);

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = PUERTA_BOUNDS.minX + (column + 0.5) * pitchX;
      const z = PUERTA_BOUNDS.minZ + (row + 0.5) * pitchZ;
      const lift = (noise(column * 2.7, row * 4.1) - 0.5) * 0.028;
      slabs.push(
        kitBlock(pitchX - 0.08, FLOOR_TOP_Y, pitchZ - 0.08,
          x, groundHeightAt(x) + lift, z, PAVING_TILE_METERS, paintFn),
      );
    }
  }
  const merged = mergeGeometries(slabs, false)!;
  for (const slab of slabs) slab.dispose();
  return merged;
}

/** Muros de contención: encajonan la calzada y dan las verticales del cuadro. */
function retainingWalls(): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const paintFn = stonePaint(2.6);
  for (const z of [PUERTA_BOUNDS.minZ + 0.35, PUERTA_BOUNDS.maxZ - 0.35]) {
    for (let x = PUERTA_BOUNDS.minX; x < PUERTA_BOUNDS.maxX - 0.4; x += 1.8) {
      const span = Math.min(1.8, PUERTA_BOUNDS.maxX - x);
      const base = groundHeightAt(x + span / 2);
      const height = 1.9 + noise(x, z) * 0.3;
      pieces.push(stone(span - 0.07, height, 0.7, x + span / 2, base, z, paintFn));
    }
  }
  // El muro oeste cierra contra el Taller, salvo el vano por donde se llega.
  const side = (DEPTH - WEST_GAP) / 2;
  for (const sign of [-1, 1]) {
    pieces.push(stone(0.7, 2.4, side, PUERTA_BOUNDS.minX + 0.35, 0,
      CENTER_Z + sign * (WEST_GAP / 2 + side / 2), paintFn));
  }
  return pieces;
}

/**
 * La Puerta: dos jambas, un dintel y las hojas. Es la tercera silueta del slice y tiene que
 * distinguirse del Portal y del Taller, así que es **maciza y vertical**, sin ruina.
 */
function doorMass(): {
  stone: THREE.BufferGeometry[];
  jambs: { id: string; geometry: THREE.BufferGeometry }[];
  leaves: THREE.BufferGeometry[];
} {
  const { x, jambWidth, jambHeight, opening, lintelHeight } = PUERTA_SILHOUETTE;
  const paintFn = stonePaint(jambHeight, 0.05);
  const half = opening / 2 + jambWidth / 2;
  return {
    stone: [
      stone(jambWidth * 1.25, lintelHeight, opening + jambWidth * 2.9, x, jambHeight, CENTER_Z, paintFn),
      // Contrafuertes: explican cómo una masa así se sostiene, y rompen la silueta plana.
      stone(1.9, 2.2, 0.9, x - 0.85, 0, CENTER_Z - half, paintFn),
      stone(1.9, 2.2, 0.9, x - 0.85, 0, CENTER_Z + half, paintFn),
    ],
    // Las jambas van aparte porque **se desvanecen**. GF-06 registra que la ronda 1 falló acá
    // por falta de separación entre el estudiante y los pilares: la separación la resuelve la
    // composición, y el fade es la red de seguridad para cuando aun así se cruzan.
    jambs: [
      { id: 'puerta-jamb-north',
        geometry: stone(jambWidth, jambHeight, jambWidth * 1.35, x, 0, CENTER_Z - half, paintFn) },
      { id: 'puerta-jamb-south',
        geometry: stone(jambWidth, jambHeight, jambWidth * 1.35, x, 0, CENTER_Z + half, paintFn) },
    ],
    leaves: [
      stone(0.42, jambHeight - 0.5, opening / 2 - 0.06, x, 0, CENTER_Z - opening / 4, paintFn),
      stone(0.42, jambHeight - 0.5, opening / 2 - 0.06, x, 0, CENTER_Z + opening / 4, paintFn),
    ],
  };
}

/**
 * La ménsula de cobre que sostiene el farol contra la jamba norte. `IDENTITY.md` §4 declara
 * cobre expuesto como materia compartida de toda la Cuenca de Ohm, y `SHOT_DECK.md` ST-07 nombra
 * este objeto por su nombre —«del conducto de cobre al punto de medición» es la trayectoria de
 * lectura del frame— así que no alcanza con que el farol flote: necesita algo que lo sostenga y
 * explique de dónde viene la luz.
 *
 * Es una ménsula de pared, no un poste independiente: la primera versión partía del suelo y a la
 * altura de R9 quedaba tan cerca de cámara que un tubo de 4,5 m se comía el primer plano entero
 * (verificado jugando, no en captura estática — la regla de `IDENTITY.md` §6). Anclada contra la
 * piedra de la jamba, la pieza nueva se lee junto a una masa que ya está probada en cuadro.
 *
 * Sin estado propio: no lleva emissive ni reacciona a `setWaterState`. `COLOR_SCRIPT.md` §6
 * reserva el cian saturado para comunicar estado eléctrico real, y ese material ya lo tiene el
 * punto de luz de `door-conduit-emitter`; pintar el cobre del mismo tono sin una lectura de
 * estado detrás sería exactamente el uso decorativo que ese documento prohíbe.
 */
function copperConduit(): THREE.BufferGeometry[] {
  const { x, jambWidth } = PUERTA_SILHOUETTE;
  const half = PUERTA_SILHOUETTE.opening / 2 + jambWidth / 2;
  // Contra la cara este de la jamba norte, a la altura del farol existente.
  const plateX = x + jambWidth / 2;
  const plateZ = CENTER_Z - half;
  const armY = 4.42;
  const paintFn = copperPaint(armY + 0.3);
  return [
    // Placa de anclaje: la ménsula no sale de la piedra desnuda, se atornilla a ella.
    kitBlock(0.06, 0.5, 0.4, plateX + 0.03, armY - 0.22, plateZ, STONE_TILE_METERS, paintFn),
    // El brazo alcanza al farol existente (`door-conduit-emitter` en levelData.ts), que sigue
    // siendo la única pieza `glass` con la luz: acá sólo se construye lo que la sostiene.
    kitBlock(1.5, 0.16, 0.34, (plateX + 16.7) / 2, armY, (plateZ + -3) / 2, STONE_TILE_METERS, paintFn),
    // Tirante corto, en diagonal visual: sin él la ménsula se lee como un estante y no como
    // una pieza que carga peso.
    kitBlock(0.09, 0.09, 0.85, plateX + 0.4, armY - 0.32, (plateZ + -3) / 2 + 0.1, STONE_TILE_METERS, paintFn),
  ];
}

/** El pilón del Manantial: la boca por donde vuelve el agua, sobre lo alto de la calzada. */
function springHead(): THREE.BufferGeometry[] {
  const { basin } = PUERTA_SILHOUETTE;
  const paintFn = stonePaint(2.4, 0.06);
  const base = groundHeightAt(basin.x);
  return [
    stone(basin.width + 0.7, 0.34, basin.depth + 0.7, basin.x, base, basin.z, paintFn),
    stone(1.5, 2.4, 1.5, basin.x + 1.3, base + 0.34, basin.z - 1.5, paintFn),
    stone(1.9, 0.4, 1.9, basin.x + 1.3, base + 2.74, basin.z - 1.5, paintFn),
    // Pretil de la pileta, en cuatro paños: el agua queda contenida y se lee el borde.
    stone(basin.width, 0.4, 0.36, basin.x, base + 0.34, basin.z - basin.depth / 2, paintFn),
    stone(basin.width, 0.4, 0.36, basin.x, base + 0.34, basin.z + basin.depth / 2, paintFn),
    stone(0.36, 0.4, basin.depth, basin.x - basin.width / 2, base + 0.34, basin.z, paintFn),
    stone(0.36, 0.4, basin.depth, basin.x + basin.width / 2, base + 0.34, basin.z, paintFn),
  ];
}

/** Los tres estados del agua que declara `IDENTITY.md`. No son un efecto: son la materia. */
export type WaterState = 'detenida' | 'parcial' | 'estable';

const WATER_LOOK: Readonly<Record<WaterState, { color: number; opacity: number; emissive: number }>> = {
  detenida: { color: 0x3f5a63, opacity: 0.62, emissive: 0x000000 },
  parcial: { color: 0x467987, opacity: 0.72, emissive: 0x0f2a30 },
  estable: { color: 0x5aa3b0, opacity: 0.82, emissive: 0x1c4c55 },
};

export interface PuertaKit {
  readonly root: THREE.Group;
  /** Las jambas se desvanecen si tapan al jugador. Es la red de seguridad de GF-06. */
  readonly occlusionBindings: readonly OcclusionBinding[];
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  /** Estado del agua. Lo decide el mundo según los flags, no el kit. */
  setWaterState(state: WaterState): void;
  /** Abre o cierra las hojas. `0` cerrada, `1` abierta del todo. */
  setDoorOpening(amount: number): void;
  diagnostics(): { readonly meshes: number; readonly triangles: number };
  dispose(): void;
}

const STONE_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x7d7167,
  twilight: 0x5a5e6a,
};
const PAVING_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0xa89a89,
  twilight: 0x7a7c88,
};
// Mismo cobre que `plazaKit`: es la misma materia de la misma región, y repetir la paleta es
// lo que hace que el Portal y la Puerta se lean como la misma Cuenca de Ohm.
const COPPER_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x9a7355,
  twilight: 0x7b6154,
};

export function createPuertaKit(): PuertaKit {
  const root = new THREE.Group();
  root.name = 'PUERTA_KIT';

  const stoneMaps = loadKitMaps(MATERIAL_URLS.stoneGrain, MATERIAL_URLS.stoneNormal);
  const pavingMaps = loadKitMaps(MATERIAL_URLS.pavingGrain, MATERIAL_URLS.pavingNormal);
  const textures = [stoneMaps.grain, stoneMaps.normal, pavingMaps.grain, pavingMaps.normal];

  const pavingMaterial = new THREE.MeshStandardMaterial({
    color: PAVING_COLORS.afternoon,
    map: pavingMaps.grain,
    normalMap: pavingMaps.normal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    vertexColors: true,
    roughness: 0.95,
    metalness: 0,
    flatShading: true,
  });
  pavingMaterial.name = 'PUERTA_PAVING';

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: STONE_COLORS.afternoon,
    map: stoneMaps.grain,
    normalMap: stoneMaps.normal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });
  stoneMaterial.name = 'PUERTA_STONE';

  const copperMaterial = new THREE.MeshStandardMaterial({
    color: COPPER_COLORS.afternoon,
    // El cobre reusa el grano de la piedra, igual que en la Plaza: la oxidación se lee como
    // picado y compartir mapa no suma texturas nuevas al presupuesto de E4.
    map: stoneMaps.grain,
    normalMap: stoneMaps.normal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    vertexColors: true,
    roughness: 0.58,
    metalness: 0.46,
    flatShading: true,
  });
  copperMaterial.name = 'PUERTA_COPPER';

  const door = doorMass();
  const floorGeometry = slopedPaving();
  const massGeometry = mergeGeometries([...retainingWalls(), ...door.stone, ...springHead()], false)!;
  const copperGeometry = mergeGeometries(copperConduit(), false)!;

  const floorMesh = new THREE.Mesh(floorGeometry, pavingMaterial);
  floorMesh.name = 'puerta_floor';
  floorMesh.receiveShadow = true;
  const massMesh = new THREE.Mesh(massGeometry, stoneMaterial);
  massMesh.name = 'puerta_mass';
  massMesh.castShadow = true;
  massMesh.receiveShadow = true;
  const copperMesh = new THREE.Mesh(copperGeometry, copperMaterial);
  copperMesh.name = 'puerta_copper';
  copperMesh.castShadow = true;
  copperMesh.receiveShadow = true;
  root.add(floorMesh, massMesh, copperMesh);

  const occlusionBindings: OcclusionBinding[] = [];
  const jambMeshes: THREE.Mesh[] = [];
  for (const { id, geometry } of door.jambs) {
    const material = stoneMaterial.clone();
    material.transparent = true;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.cameraOccluder = true;
    root.add(mesh);
    jambMeshes.push(mesh);
    occlusionBindings.push({
      id,
      object: mesh,
      setOpacity(opacity) {
        material.opacity = opacity;
        mesh.visible = opacity > 0.001;
      },
    });
  }

  // Las hojas van en nodos propios porque se corren: cada una se desplaza hacia su jamba.
  const leafMeshes: THREE.Mesh[] = [];
  for (const [index, geometry] of door.leaves.entries()) {
    const pivot = new THREE.Group();
    pivot.name = `puerta_leaf_${index === 0 ? 'norte' : 'sur'}`;
    const mesh = new THREE.Mesh(geometry, stoneMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);
    root.add(pivot);
    leafMeshes.push(mesh);
    mesh.userData.pivot = pivot;
  }

  const { basin } = PUERTA_SILHOUETTE;
  const waterGeometry = new THREE.PlaneGeometry(basin.width - 0.2, basin.depth - 0.2);
  waterGeometry.rotateX(-Math.PI / 2);
  waterGeometry.translate(basin.x, groundHeightAt(basin.x) + 0.5, basin.z);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: WATER_LOOK.detenida.color,
    transparent: true,
    opacity: WATER_LOOK.detenida.opacity,
    roughness: 0.18,
    metalness: 0.1,
    emissive: new THREE.Color(WATER_LOOK.detenida.emissive),
  });
  waterMaterial.name = 'PUERTA_WATER';
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.name = 'manantial_water';
  waterMesh.receiveShadow = true;
  root.add(waterMesh);

  return {
    root,
    occlusionBindings,
    setTimeOfDay(timeOfDay): void {
      pavingMaterial.color.setHex(PAVING_COLORS[timeOfDay]);
      stoneMaterial.color.setHex(STONE_COLORS[timeOfDay]);
      copperMaterial.color.setHex(COPPER_COLORS[timeOfDay]);
      for (const mesh of jambMeshes) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(STONE_COLORS[timeOfDay]);
      }
    },
    setWaterState(state): void {
      const look = WATER_LOOK[state];
      waterMaterial.color.setHex(look.color);
      waterMaterial.opacity = look.opacity;
      waterMaterial.emissive.setHex(look.emissive);
    },
    setDoorOpening(amount): void {
      const travel = Math.min(1, Math.max(0, amount)) * (PUERTA_SILHOUETTE.opening / 2 - 0.1);
      for (const [index, mesh] of leafMeshes.entries()) {
        (mesh.userData.pivot as THREE.Group).position.z = index === 0 ? -travel : travel;
      }
    },
    diagnostics() {
      const extras = [...leafMeshes, ...jambMeshes];
      return {
        meshes: 4 + extras.length,
        triangles:
          triangleCount(floorGeometry) + triangleCount(massGeometry) + triangleCount(waterGeometry)
          + triangleCount(copperGeometry)
          + extras.reduce((total, mesh) => total + triangleCount(mesh.geometry), 0),
      };
    },
    dispose(): void {
      root.removeFromParent();
      for (const texture of textures) texture.dispose();
      floorGeometry.dispose();
      massGeometry.dispose();
      copperGeometry.dispose();
      waterGeometry.dispose();
      for (const mesh of leafMeshes) mesh.geometry.dispose();
      for (const mesh of jambMeshes) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      pavingMaterial.dispose();
      stoneMaterial.dispose();
      copperMaterial.dispose();
      waterMaterial.dispose();
    },
  };
}
