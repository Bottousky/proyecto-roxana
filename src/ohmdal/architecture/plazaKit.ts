// La Plaza de Ohmdal, construida por código.
//
// Sin Blender y sin texturas, lo que separa un blockout de un decorado es **dónde cae la luz
// dentro de cada pieza**. Una caja de un solo color se lee como una caja aunque tenga la forma
// correcta. Por eso cada módulo se pinta en sus vértices antes de fusionarse: mugre acumulada
// abajo, desgaste arriba, oclusión contra los muros, y una variación determinista por pieza
// para que dos losas nunca sean idénticas.
//
// El color de la paleta no vive acá: los vértices guardan **multiplicadores** alrededor de 1,0
// y el material aporta el tono. Así el paso de tarde a crepúsculo sigue siendo un solo cambio
// de color de material, como manda COLOR_SCRIPT.md, y la modulación sobrevive intacta.
//
// La gramática es la de las referencias: la arquitectura es 3D y los objetos son sprites. La
// campana cuelga de un monumento de piedra construido en geometría; la campana en sí es pixel.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LEVEL_SEED } from './levelData.ts';
import type { BlockoutTimeOfDay } from '../materials/blockoutMaterials.ts';

/**
 * Las rutas de los mapas se resuelven con `new URL(..., import.meta.url)` y no con `?url`.
 * Vite las reconoce igual y emite el asset con hash, pero además **Node las puede evaluar**:
 * media docena de tests construyen el blockout entero en Node, y un `import` de `.jpg` los
 * mata con `ERR_UNKNOWN_FILE_EXTENSION` antes de llegar a la primera aserción.
 */
const MATERIAL_URLS = {
  pavingGrain: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-grain.jpg', import.meta.url).href,
  pavingNormal: new URL('../../../assets/runtime/ohmdal/materials/plaza-paving-normal.jpg', import.meta.url).href,
  stoneGrain: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-grain.jpg', import.meta.url).href,
  stoneNormal: new URL('../../../assets/runtime/ohmdal/materials/plaza-stone-normal.jpg', import.meta.url).href,
} as const;

/**
 * Cada cuántos metros se repite la textura. Es densidad de téxel, no gusto: con 512 px sobre
 * 2 m dan 256 px por metro, que es el orden del pixel art de los personajes.
 */
const FLOOR_TILE_METERS = 2;
const STONE_TILE_METERS = 2.4;

/** Huella de la Plaza, un poco más generosa que la zona jugable: los muros quedan afuera. */
export const PLAZA_BOUNDS = Object.freeze({ minX: -21.4, maxX: -3.8, minZ: -6.8, maxZ: 6.8 });

const PAVER_SIZE = 1;
const PAVER_JOINT = 0.07;
const FLOOR_TOP_Y = 0.08;

/** Semilla numérica estable a partir del seed del nivel: dos corridas pintan igual. */
const SEED_OFFSET = [...LEVEL_SEED].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 7);

/** Ruido determinista en [0,1). No es azar: la misma pieza se pinta igual siempre. */
function noise(x: number, z: number): number {
  const value = Math.sin(x * 127.1 + z * 311.7 + SEED_OFFSET) * 43758.5453;
  return value - Math.floor(value);
}

/** Cuánto se acerca un punto al borde de la Plaza, de 0 (centro) a 1 (contra el muro). */
function edgeProximity(x: number, z: number): number {
  const toX = Math.min(x - PLAZA_BOUNDS.minX, PLAZA_BOUNDS.maxX - x);
  const toZ = Math.min(z - PLAZA_BOUNDS.minZ, PLAZA_BOUNDS.maxZ - z);
  const distance = Math.max(0, Math.min(toX, toZ));
  return 1 - Math.min(1, distance / 2.2);
}

type PaintFn = (x: number, y: number, z: number, out: THREE.Color) => void;

/** Escribe el atributo `color` de una geometría ya colocada en coordenadas de mundo. */
function paint(geometry: THREE.BufferGeometry, paintFn: PaintFn): THREE.BufferGeometry {
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const scratch = new THREE.Color();
  for (let index = 0; index < position.count; index += 1) {
    paintFn(position.getX(index), position.getY(index), position.getZ(index), scratch);
    colors[index * 3] = scratch.r;
    colors[index * 3 + 1] = scratch.g;
    colors[index * 3 + 2] = scratch.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * Pintura estándar de la piedra construida: se ensucia contra el suelo, se aclara arriba donde
 * la luz y el uso la gastan, y se oscurece contra los bordes de la Plaza. Cada pieza arranca de
 * un tono propio para que la repetición del kit no se note.
 */
function stonePaint(topY: number, variation = 0.09): PaintFn {
  return (x, y, z, out) => {
    const own = (noise(Math.round(x * 2), Math.round(z * 2)) - 0.5) * 2 * variation;
    const height = topY > 0 ? Math.min(1, Math.max(0, y / topY)) : 0;
    // Mugre en el arranque, desgaste en la coronación.
    const grime = -0.20 * (1 - height) ** 2;
    const wear = 0.10 * height ** 2;
    const occluded = -0.14 * edgeProximity(x, z);
    const value = 1 + own + grime + wear + occluded;
    out.setScalar(Math.min(1.35, Math.max(0.42, value)));
  };
}

/**
 * Reescribe las UV proyectando desde coordenadas de **mundo** sobre el eje dominante de cada
 * cara. Es lo único que hace que un kit modular texture bien: las UV que trae `BoxGeometry` van
 * de 0 a 1 por cara, así que una losa de 1 m y un muro de 2 m mostrarían la misma textura a
 * escalas distintas, y en la junta entre dos módulos contiguos se vería el corte.
 *
 * Proyectando desde el mundo, la piedra es continua a través de las piezas y la densidad de
 * téxel es la misma en todas. Es la misma idea que un trim sheet, resuelta en el vértice.
 */
function projectUvs(geometry: THREE.BufferGeometry, tileMeters: number): THREE.BufferGeometry {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uv = new Float32Array(position.count * 2);
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const ax = Math.abs(normal.getX(index));
    const ay = Math.abs(normal.getY(index));
    const az = Math.abs(normal.getZ(index));
    let u: number;
    let v: number;
    if (ay >= ax && ay >= az) {
      u = x; v = z; // suelos y coronaciones
    } else if (ax >= az) {
      u = z; v = y; // caras que miran al este o al oeste
    } else {
      u = x; v = y; // caras que miran a la cámara o al fondo
    }
    uv[index * 2] = u / tileMeters;
    uv[index * 2 + 1] = v / tileMeters;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

/** Una caja con el pivote en su base, ya trasladada a mundo y pintada. */
function block(
  width: number,
  height: number,
  depth: number,
  x: number,
  baseY: number,
  z: number,
  paintFn: PaintFn,
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  geometry.translate(x, baseY + height / 2, z);
  return paint(projectUvs(geometry, STONE_TILE_METERS), paintFn);
}

/** Un cilindro con el pivote en su base, ya trasladado y pintado. */
function drum(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  x: number,
  baseY: number,
  z: number,
  segments: number,
  paintFn: PaintFn,
): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  geometry.translate(x, baseY + height / 2, z);
  return paint(projectUvs(geometry, STONE_TILE_METERS), paintFn);
}

/**
 * El piso empedrado. Una sola geometría de losas sueltas: la junta entre ellas es hueco real,
 * no una línea pintada, así que la rasante del suelo tiene grano cuando la cámara la mira de
 * costado. Es la diferencia entre un piso y una plancha.
 */
function paverFloor(): THREE.BufferGeometry {
  const pavers: THREE.BufferGeometry[] = [];
  const columns = Math.round((PLAZA_BOUNDS.maxX - PLAZA_BOUNDS.minX) / PAVER_SIZE);
  const rows = Math.round((PLAZA_BOUNDS.maxZ - PLAZA_BOUNDS.minZ) / PAVER_SIZE);
  // El paso se deriva de la huella, no al revés: con un paso fijo el empedrado se pasaba de
  // largo por un lado y no llegaba por el otro, y el piso terminaba descentrado del muro.
  const pitchX = (PLAZA_BOUNDS.maxX - PLAZA_BOUNDS.minX) / columns;
  const pitchZ = (PLAZA_BOUNDS.maxZ - PLAZA_BOUNDS.minZ) / rows;

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = PLAZA_BOUNDS.minX + (column + 0.5) * pitchX;
      const z = PLAZA_BOUNDS.minZ + (row + 0.5) * pitchZ;
      const wobble = noise(column, row);
      // Las losas no están todas al mismo nivel: cuarenta años sin mantenimiento.
      const lift = (wobble - 0.5) * 0.03;
      const geometry = new THREE.BoxGeometry(pitchX - PAVER_JOINT, FLOOR_TOP_Y, pitchZ - PAVER_JOINT);
      geometry.translate(x, FLOOR_TOP_Y / 2 + lift, z);
      pavers.push(
        paint(projectUvs(geometry, FLOOR_TILE_METERS), (px, py, pz, out) => {
          const own = (noise(column * 3.1, row * 7.7) - 0.5) * 0.22;
          // El paso de la gente pulió el eje del recorrido y dejó los bordes opacos.
          const path = Math.exp(-((pz / 3.4) ** 2)) * 0.12;
          const occluded = -0.22 * edgeProximity(px, pz);
          // La cara superior recibe; los cantos se hunden en sombra.
          const face = py > lift + FLOOR_TOP_Y * 0.4 ? 0 : -0.18;
          out.setScalar(Math.min(1.3, Math.max(0.38, 1 + own + path + occluded + face)));
        }),
      );
    }
  }
  return mergeGeometries(pavers, false)!;
}

/** Muro de perímetro con pilastras: da silueta a los costados del cuadro sin cerrar el paso. */
function perimeterWall(z: number): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const paintFn = stonePaint(2.6);
  for (let x = PLAZA_BOUNDS.minX; x < PLAZA_BOUNDS.maxX - 0.5; x += 2) {
    const span = Math.min(2, PLAZA_BOUNDS.maxX - x);
    const height = 2.1 + noise(x, z) * 0.25;
    pieces.push(block(span - 0.08, height, 0.62, x + span / 2, 0, z, paintFn));
    // Pilastra cada dos tramos: rompe la horizontal y explica cómo se sostiene el muro.
    if (Math.round(x) % 4 === 0) {
      pieces.push(block(0.62, height + 0.7, 0.86, x, 0, z, paintFn));
      pieces.push(block(0.78, 0.22, 1.02, x, height + 0.7, z, paintFn));
    }
  }
  return pieces;
}

/**
 * Silueta del Portal, como datos.
 *
 * Es el landmark dominante de GF-01 y lo primero que se ve. Su composición está fijada por el
 * canon y verificada por test: **dintel profundo transversal** —la pieza de cobre es mucho más
 * profunda que ancha, así que cruza el vano en vez de coronarlo— y **ruina asimétrica**, un
 * machón entero y el otro partido. Ohmdal está detenido, no restaurado.
 */
export const PORTAL_SILHOUETTE = Object.freeze({
  x: -20.4,
  pierNorth: Object.freeze({ width: 1.5, height: 5.2, depth: 1.5, z: -2.4 }),
  pierSouth: Object.freeze({ width: 1.5, height: 3.4, depth: 1.5, z: 2.4 }),
  lintel: Object.freeze({ width: 0.9, height: 0.5, depth: 4.4, baseY: 4.5 }),
});

function portalGate(): { stone: THREE.BufferGeometry[]; copper: THREE.BufferGeometry[] } {
  const { x, pierNorth, pierSouth, lintel } = PORTAL_SILHOUETTE;
  const stonePaintFn = stonePaint(pierNorth.height, 0.06);
  const copperPaintFn = stonePaint(0.6, 0.05);
  const stone: THREE.BufferGeometry[] = [
    block(pierNorth.width, pierNorth.height, pierNorth.depth, x, 0, pierNorth.z, stonePaintFn),
    block(pierSouth.width, pierSouth.height, pierSouth.depth, x, 0, pierSouth.z, stonePaintFn),
    block(1.9, 0.45, 1.9, x, pierNorth.height, pierNorth.z, stonePaintFn),
    // El machón partido no tiene coronación: se le cayó. Por eso el dintel arranca de un lado
    // y muere en el aire del otro, que es lo que hace legible la ruina desde lejos.
    block(1.72, 0.3, 1.72, x, pierSouth.height, pierSouth.z, stonePaintFn),
    block(1.2, 3, 2.2, x, 0, -4.6, stonePaintFn),
    block(1.2, 2.2, 2.2, x, 0, 4.6, stonePaintFn),
  ];
  const copper: THREE.BufferGeometry[] = [
    block(lintel.width, lintel.height, lintel.depth, x, lintel.baseY, 0, copperPaintFn),
    block(0.55, 0.9, 0.55, x, lintel.baseY + lintel.height, 0, copperPaintFn),
  ];
  return { stone, copper };
}

/**
 * El monumento de la campana. La campana es un sprite —es un objeto— pero de lo que cuelga es
 * arquitectura, y por eso se construye: dos machones y un yugo de cobre a cuatro metros y medio.
 * Es la silueta dominante del centro de la Plaza.
 */
function bellMonument(): { stone: THREE.BufferGeometry[]; copper: THREE.BufferGeometry[] } {
  const x = -10.6;
  const stonePaintFn = stonePaint(4.5, 0.07);
  const copperPaintFn = stonePaint(0.5, 0.04);
  const stone: THREE.BufferGeometry[] = [
    // Basamento de dos escalones.
    block(5.6, 0.22, 5.6, x, 0.06, 0, stonePaintFn),
    block(4.8, 0.22, 4.8, x, 0.28, 0, stonePaintFn),
    block(1.05, 4.2, 1.05, x, 0.5, -1.75, stonePaintFn),
    block(1.05, 4.2, 1.05, x, 0.5, 1.75, stonePaintFn),
    block(1.35, 0.4, 1.35, x, 4.7, -1.75, stonePaintFn),
    block(1.35, 0.4, 1.35, x, 4.7, 1.75, stonePaintFn),
  ];
  const copper: THREE.BufferGeometry[] = [
    block(0.42, 0.42, 4.4, x, 4.62, 0, copperPaintFn),
    block(0.3, 0.55, 0.3, x, 4.07, 0, copperPaintFn),
  ];
  return { stone, copper };
}

/** El pedestal donde duerme Ohm: tres escalones circulares, gastados en la coronación. */
function pedestalSteps(): THREE.BufferGeometry[] {
  const x = -13.5;
  const paintFn = stonePaint(1.05, 0.05);
  // Doce lados y no veinte: con `flatShading` cada cara toma su propio valor del sol y el
  // escalón se lee como piedra cortada. Con veinte lados y normales suaves la pila entera se
  // leía como un cono liso, que es exactamente lo que no es.
  return [
    drum(1.56, 1.62, 0.26, x, 0.04, 0, 12, paintFn),
    drum(1.22, 1.28, 0.26, x, 0.3, 0, 12, paintFn),
    drum(0.9, 0.96, 0.26, x, 0.56, 0, 12, paintFn),
    drum(0.78, 0.8, 0.24, x, 0.82, 0, 12, paintFn),
  ];
}

/**
 * Carga un mapa que se repite. Sin `RepeatWrapping` la proyección de mundo no tiene sentido.
 *
 * Fuera del navegador devuelve la textura vacía: los tests de arquitectura construyen el
 * blockout completo en Node para medir composición y presupuesto, y ahí no hay nada que
 * decodificar. El material queda igual de válido, sólo sin imagen.
 */
function loadTiling(url: string, colorSpace: THREE.ColorSpace): THREE.Texture {
  const texture = typeof document === 'undefined'
    ? new THREE.Texture()
    : new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = colorSpace;
  texture.anisotropy = 4;
  return texture;
}

export interface PlazaKit {
  readonly root: THREE.Group;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  diagnostics(): { readonly meshes: number; readonly triangles: number };
  dispose(): void;
}

// El piso y lo construido no comparten tono. En las referencias el suelo es el valor claro
// sobre el que se recortan las siluetas; si empata con los muros, la Plaza se vuelve una masa.
const FLOOR_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0xa89a89,
  twilight: 0x7a7c88,
};
const STONE_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x7d7167,
  twilight: 0x5a5e6a,
};
const COPPER_COLORS: Readonly<Record<BlockoutTimeOfDay, number>> = {
  afternoon: 0x9a7355,
  twilight: 0x7b6154,
};

/**
 * Construye la Plaza. Todo se fusiona en dos mallas —piedra y cobre— porque el costo real de
 * un kit modular no son los triángulos sino las llamadas de dibujo, y el presupuesto de mobile
 * es de 150.
 */
export function createPlazaKit(): PlazaKit {
  const root = new THREE.Group();
  root.name = 'PLAZA_KIT';

  const gate = portalGate();
  const monument = bellMonument();

  // El piso va aparte de las estructuras, y no por orden: un piso **recibe** sombra pero no la
  // proyecta. Fusionado con los muros heredaba su `castShadow` y cada losa se sombreaba a sí
  // misma; el resultado era una retícula de acné de sombra sobre toda la escena, alineada a los
  // téxels del mapa y no a la geometría, que es justo lo que la vuelve difícil de reconocer.
  const floorGeometry = paverFloor();

  const stonePieces = [
    ...perimeterWall(PLAZA_BOUNDS.minZ + 0.2),
    ...perimeterWall(PLAZA_BOUNDS.maxZ - 0.2),
    ...gate.stone,
    ...monument.stone,
    ...pedestalSteps(),
  ];
  const copperPieces = [...gate.copper, ...monument.copper];

  const stoneGeometry = mergeGeometries(stonePieces, false)!;
  const copperGeometry = mergeGeometries(copperPieces, false)!;
  for (const piece of [...stonePieces, ...copperPieces]) piece.dispose();

  // Los mapas son de ambientCG bajo CC0 —procedencia en
  // `assets/references/ohmdal-materials/procedencia-cc0.md`— y llegan ya reducidos a grano:
  // luminancia por oclusión, contraste al 55 %, media 0,95. **No traen color.** El color lo
  // sigue poniendo la paleta de COLOR_SCRIPT.md a través del material, y el mapa multiplica.
  // Por eso sumar textura no reabre ninguna decisión de color ni rompe el paso a crepúsculo.
  const grain = (url: string): THREE.Texture => loadTiling(url, THREE.SRGBColorSpace);
  const relief = (url: string): THREE.Texture => loadTiling(url, THREE.NoColorSpace);
  const pavingGrain = grain(MATERIAL_URLS.pavingGrain);
  const pavingNormal = relief(MATERIAL_URLS.pavingNormal);
  const stoneGrain = grain(MATERIAL_URLS.stoneGrain);
  const stoneNormal = relief(MATERIAL_URLS.stoneNormal);
  const textures = [pavingGrain, pavingNormal, stoneGrain, stoneNormal];

  // `flatShading` es lo que separa un kit por código de un blockout: sin él, una caja y un
  // cilindro se leen como volúmenes lisos y el sol no describe ninguna arista.
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: FLOOR_COLORS.afternoon,
    map: pavingGrain,
    normalMap: pavingNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
    flatShading: true,
  });
  floorMaterial.name = 'PLAZA_FLOOR';
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: STONE_COLORS.afternoon,
    map: stoneGrain,
    normalMap: stoneNormal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });
  stoneMaterial.name = 'PLAZA_STONE';
  const copperMaterial = new THREE.MeshStandardMaterial({
    color: COPPER_COLORS.afternoon,
    // El cobre reusa el grano de la piedra: la oxidación se lee como picado, y compartir mapa
    // es lo que mantiene el presupuesto de textura de E1 en el 25 % de lo asignado.
    map: stoneGrain,
    normalMap: stoneNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.45,
    flatShading: true,
  });
  copperMaterial.name = 'PLAZA_COPPER';

  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.name = 'plaza_floor';
  floorMesh.castShadow = false;
  floorMesh.receiveShadow = true;
  const stoneMesh = new THREE.Mesh(stoneGeometry, stoneMaterial);
  stoneMesh.name = 'plaza_stone';
  stoneMesh.castShadow = true;
  stoneMesh.receiveShadow = true;
  const copperMesh = new THREE.Mesh(copperGeometry, copperMaterial);
  copperMesh.name = 'plaza_copper';
  copperMesh.castShadow = true;
  copperMesh.receiveShadow = true;
  root.add(floorMesh, stoneMesh, copperMesh);

  return {
    root,
    setTimeOfDay(timeOfDay): void {
      floorMaterial.color.setHex(FLOOR_COLORS[timeOfDay]);
      stoneMaterial.color.setHex(STONE_COLORS[timeOfDay]);
      copperMaterial.color.setHex(COPPER_COLORS[timeOfDay]);
    },
    diagnostics() {
      const count = (geometry: THREE.BufferGeometry): number =>
        (geometry.index ? geometry.index.count : geometry.getAttribute('position').count) / 3;
      return {
        meshes: 3,
        triangles: count(floorGeometry) + count(stoneGeometry) + count(copperGeometry),
      };
    },
    dispose(): void {
      root.removeFromParent();
      floorGeometry.dispose();
      stoneGeometry.dispose();
      copperGeometry.dispose();
      for (const texture of textures) texture.dispose();
      floorMaterial.dispose();
      stoneMaterial.dispose();
      copperMaterial.dispose();
    },
  };
}
