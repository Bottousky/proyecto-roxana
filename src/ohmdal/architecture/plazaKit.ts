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
import {
  block as kitBlock,
  drum as kitDrum,
  edgeProximity,
  loadKitMaps,
  noise,
  paint,
  projectUvs,
  triangleCount,
  weatheredPaint,
  type PaintFn,
} from './kitBuilder.ts';
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

/** Atajos del kit con el paso de textura de cada familia ya fijado. */
const stonePaint = (topY: number, variation = 0.09): PaintFn =>
  weatheredPaint({ topY, bounds: PLAZA_BOUNDS, variation });

const block = (
  width: number, height: number, depth: number,
  x: number, baseY: number, z: number, paintFn: PaintFn,
): THREE.BufferGeometry => kitBlock(width, height, depth, x, baseY, z, STONE_TILE_METERS, paintFn);

const drum = (
  radiusTop: number, radiusBottom: number, height: number,
  x: number, baseY: number, z: number, segments: number, paintFn: PaintFn,
): THREE.BufferGeometry =>
  kitDrum(radiusTop, radiusBottom, height, x, baseY, z, segments, STONE_TILE_METERS, paintFn);

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
          const occluded = -0.22 * edgeProximity(px, pz, PLAZA_BOUNDS);
          // La cara superior recibe; los cantos se hunden en sombra.
          const face = py > lift + FLOOR_TOP_Y * 0.4 ? 0 : -0.18;
          out.setScalar(Math.min(1.3, Math.max(0.38, 1 + own + path + occluded + face)));
        }),
      );
    }
  }
  return mergeGeometries(pavers, false)!;
}

/**
 * Pretiles de perímetro: bordes bajos de banqueta, no muros.
 *
 * La Plaza es un espacio público, no una habitación. Estos pretiles a 1.2 m de altura
 * dejan ver el Taller al este, el Manantial más allá y el cielo arriba, y al mismo
 * tiempo definen el límite de la Plaza como lugar.
 *
 * Variante `axis = 'x'` recorre el lado largo (norte y sur); variante `axis = 'z'`
 * recorre los costados este y oeste. Cada cuatro tramos un banquito bajo de piedra
 * explica la escala humana y rompe la línea continua.
 */
function perimeterWall(axis: 'x' | 'z', constant: number): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const paintFn = stonePaint(1.3);
  const range = axis === 'x'
    ? { from: PLAZA_BOUNDS.minX, to: PLAZA_BOUNDS.maxX, size: 'width' as const }
    : { from: PLAZA_BOUNDS.minZ, to: PLAZA_BOUNDS.maxZ, size: 'depth' as const };
  for (let step = range.from; step < range.to - 0.5; step += 2) {
    const span = Math.min(2, range.to - step);
    const height = 1.2 + noise(step, constant) * 0.12;
    if (axis === 'x') {
      pieces.push(block(span - 0.08, height, 0.55, step + span / 2, 0, constant, paintFn));
      if (Math.round(step) % 4 === 0) {
        pieces.push(block(0.5, 0.5, 0.4, step, 0, constant, paintFn));
      }
    } else {
      pieces.push(block(0.55, height, span - 0.08, constant, 0, step + span / 2, paintFn));
      if (Math.round(step) % 4 === 0) {
        pieces.push(block(0.4, 0.5, 0.5, constant, 0, step, paintFn));
      }
    }
  }
  return pieces;
}

/**
 * Banca de piedra para la Plaza. Asiento a 0.45 m, patas a 0.45 m de alto y respaldo bajo
 * de 0.85 m — escala humana, no trono. Se posiciona donde hay un hueco entre pretiles para
 * que el jugador pueda sentarse y el sol pegue en el respaldo.
 */
function stoneBench(x: number, z: number, rotationY: number): THREE.BufferGeometry[] {
  const paintFn = stonePaint(0.85, 0.08);
  const pieces: THREE.BufferGeometry[] = [];
  // Asiento: una losa larga y angosta.
  pieces.push(block(1.8, 0.08, 0.45, x, 0.45, z, paintFn));
  // Patas: dos bloques a los extremos, lo bastante anchos para que se vean desde el aire.
  pieces.push(block(0.15, 0.45, 0.45, x - 0.825, 0, z, paintFn));
  pieces.push(block(0.15, 0.45, 0.45, x + 0.825, 0, z, paintFn));
  // Respaldo bajo.
  pieces.push(block(1.8, 0.4, 0.08, x, 0.85, z - 0.18, paintFn));
  // Rotar el conjunto alrededor de su propio pivote en Y.
  if (rotationY !== 0) {
    for (const piece of pieces) piece.rotateY(rotationY);
  }
  return pieces;
}

/**
 * Plantador de piedra con un arbusto encima. Maceta cúbica de 0.7 m y copa cónica
 * pequeña arriba. Se ve como los tiestos del PQ3 HD-2D que enmarcan los edificios.
 */
function stonePlanter(x: number, z: number): THREE.BufferGeometry[] {
  const paintFn = stonePaint(0.7, 0.06);
  const bushPaint = stonePaint(1.2, 0.1);
  const pieces: THREE.BufferGeometry[] = [];
  // Maceta: cubo de 0.7 m.
  pieces.push(block(0.7, 0.7, 0.7, x, 0, z, paintFn));
  // Borde superior, un escalón más angosto.
  pieces.push(block(0.78, 0.06, 0.78, x, 0.7, z, paintFn));
  // Arbusto: tres cajas apiladas de tamaño decreciente.
  pieces.push(block(0.6, 0.5, 0.6, x, 0.76, z, bushPaint));
  pieces.push(block(0.42, 0.4, 0.42, x, 1.26, z, bushPaint));
  pieces.push(block(0.22, 0.3, 0.22, x, 1.66, z, bushPaint));
  return pieces;
}

/**
 * Poste de piedra decorativo, sin luz. Un fuste cuadrado de 1.6 m y un capitel
 * más ancho arriba. Es lo que el remake usa para señalar cruces de camino;
 * acá da escala sin sumar point lights (la Plaza no tiene red eléctrica todavía).
 */
function stonePost(x: number, z: number): THREE.BufferGeometry[] {
  const paintFn = stonePaint(1.6, 0.05);
  const pieces: THREE.BufferGeometry[] = [];
  pieces.push(block(0.22, 1.6, 0.22, x, 0, z, paintFn));
  pieces.push(block(0.42, 0.18, 0.42, x, 1.6, z, paintFn));
  pieces.push(block(0.32, 0.32, 0.32, x, 1.78, z, paintFn));
  return pieces;
}

/**
 * Fuente de agua pequeña — un pilón circular bajo con un borde elevado. El agua es un
 * disco de cobre ligeramente más oscuro; sin animación porque el slice todavía no enciende
 * la red de Ohmdal. Lee como "lugar donde se reúne la gente", que es lo que necesita una
 * plaza para no ser solo empedrado.
 */
function stoneBasin(x: number, z: number): { stone: THREE.BufferGeometry[]; copper: THREE.BufferGeometry[] } {
  const stonePaintFn = stonePaint(0.4, 0.06);
  const copperPaintFn = stonePaint(0.08, 0.05);
  return {
    // Borde elevado del pilón, octogonal para que el flat shading marque aristas.
    stone: [drum(1.1, 1.15, 0.4, x, 0, z, 8, stonePaintFn)],
    // Agua: disco más oscuro, apenas debajo del borde.
    copper: [drum(0.95, 0.95, 0.05, x, 0.3, z, 8, copperPaintFn)],
  };
}

/**
 * Árboles de la Plaza: troncos cilíndricos y copas cónicas. Repartidos a los costados
 * del pasillo central — no tapan el pedestal de Ohm ni la campana, pero enmarcan el
 * lugar como pueblo y no como plaza vacía.
 */
function plazaTree(x: number, z: number, scale = 1): THREE.BufferGeometry[] {
  const pieces: THREE.BufferGeometry[] = [];
  const trunkPaint = stonePaint(1.4);
  const leavesPaint = stonePaint(2.4);
  const trunkHeight = 1.2 * scale;
  const crownRadius = 0.9 * scale;
  const crownHeight = 2.2 * scale;
  pieces.push(block(0.22, trunkHeight, 0.22, x, 0, z, trunkPaint));
  pieces.push(block(crownRadius * 1.4, crownHeight * 0.45, crownRadius * 1.4, x, trunkHeight, z, leavesPaint));
  pieces.push(block(crownRadius * 1.0, crownHeight * 0.35, crownRadius * 1.0, x, trunkHeight + crownHeight * 0.45, z, leavesPaint));
  pieces.push(block(crownRadius * 0.55, crownHeight * 0.20, crownRadius * 0.55, x, trunkHeight + crownHeight * 0.80, z, leavesPaint));
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

export interface PlazaKit {
  readonly root: THREE.Group;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  diagnostics(): { readonly meshes: number; readonly triangles: number };
  dispose(): void;
}

// El piso y lo construido no comparten tono. En las referencias el suelo es el valor claro
// sobre el que se recortan las siluetas; si empata con los muros, la Plaza se vuelve una masa.

/**
 * Posiciones de los árboles de la Plaza. Cada triplete es (x, z, escala).
 *
 * Repartidos por todo el borde de la huella, no solo en las esquinas: cuatro en las
 * esquinas, cuatro a media cuadra flanqueando el eje central, y tres más retrasados
 * hacia el Taller para que el fondo del encuadre no quede vacío cuando la cámara mira
 * al este. La diagonal central queda libre, que es por donde entra y sale el recorrido.
 * Escalas 0.85–1.05 para que ninguno tape la silueta del Portal desde R0 ni compita
 * con el dintel de cobre.
 */
const TREE_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [-19, -5.5, 1.0],
  [-19, 5.5, 1.0],
  [-7, 5.8, 0.85],
  [-7, -5.8, 0.85],
  [-5.5, -5.5, 1.0],
  [-5.5, 5.5, 1.0],
  [-15, -6.2, 0.95],
  [-15, 6.2, 0.95],
  [-12, 6.0, 0.85],
  [-12, -6.0, 0.85],
  [-9, 6.3, 0.9],
  [-9, -6.3, 0.9],
];

/**
 * Bancas de piedra. Asientos de 1.8 m orientados a lo ancho de la Plaza, mirando hacia
 * el centro. Tres al norte, dos al sur, una al este — la del oeste queda libre para no
 * tapar la línea visual desde el Portal.
 */
const BENCH_LAYOUT: ReadonlyArray<readonly [number, number, number]> = [
  [-17.5, -5.5, 0],
  [-11.5, -5.5, 0],
  [-7.5, -5.5, 0],
  [-11.5, 5.5, Math.PI],
  [-7.5, 5.5, Math.PI],
  [-4.6, 0, Math.PI / 2],
];

/**
 * Plantadores con arbustos. Anclan el centro de cada lado y dan color verde entre el
 * cobre y la piedra. Esquinas opuestas para que el ojo tenga cuatro puntos de interés.
 */
const PLANTER_LAYOUT: ReadonlyArray<readonly [number, number]> = [
  [-13.5, -5.0],
  [-9, 5.0],
  [-5.5, -2.0],
];

/**
 * Postes de piedra decorativos, sin luz. Marcan los cruces del camino principal con el
 * eje central y dan escala cuando la cámara panea hacia el este.
 */
const POST_LAYOUT: ReadonlyArray<readonly [number, number]> = [
  [-16, 0],
  [-7, 0],
];

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
  // La fuente se acomoda al sur del monumento de la campana, a suficiente distancia
  // para no chocar con el basamento (z=±2.8) y dar espacio para caminar entre ambos.
  // Completa la triada portal-pedestal-fuente que es la composición típica de una
  // plaza de pueblo.
  const basin = stoneBasin(-9.0, -4.6);

  // El piso va aparte de las estructuras, y no por orden: un piso **recibe** sombra pero no la
  // proyecta. Fusionado con los muros heredaba su `castShadow` y cada losa se sombreaba a sí
  // misma; el resultado era una retícula de acné de sombra sobre toda la escena, alineada a los
  // téxels del mapa y no a la geometría, que es justo lo que la vuelve difícil de reconocer.
  const floorGeometry = paverFloor();

  const stonePieces = [
    // Pretiles perimetrales en los cuatro lados: norte, sur, este, oeste. Antes había solo
    // norte y sur — la Plaza se leía como una calle flanqueada, no como un lugar cerrado.
    ...perimeterWall('x', PLAZA_BOUNDS.minZ + 0.2),
    ...perimeterWall('x', PLAZA_BOUNDS.maxZ - 0.2),
    ...perimeterWall('z', PLAZA_BOUNDS.minX + 0.2),
    ...perimeterWall('z', PLAZA_BOUNDS.maxX - 0.2),
    ...gate.stone,
    ...monument.stone,
    ...pedestalSteps(),
    ...basin.stone,
    // Los árboles, bancas, plantadores y postes se funden en la misma malla de piedra que
    // los pretiles: el presupuesto de dibujo sigue siendo 3 mallas (piso / piedra / cobre)
    // y no se reabre por sumar follaje, asientos o arbustos.
    ...TREE_POSITIONS.flatMap(([x, z, s]) => plazaTree(x, z, s)),
    ...BENCH_LAYOUT.flatMap(([x, z, ry]) => stoneBench(x, z, ry)),
    ...PLANTER_LAYOUT.flatMap(([x, z]) => stonePlanter(x, z)),
    ...POST_LAYOUT.flatMap(([x, z]) => stonePost(x, z)),
  ];
  const copperPieces = [...gate.copper, ...monument.copper, ...basin.copper];

  const stoneGeometry = mergeGeometries(stonePieces, false)!;
  const copperGeometry = mergeGeometries(copperPieces, false)!;
  for (const piece of [...stonePieces, ...copperPieces]) piece.dispose();

  // Los mapas son de ambientCG bajo CC0 —procedencia en
  // `assets/references/ohmdal-materials/procedencia-cc0.md`— y llegan ya reducidos a grano:
  // luminancia por oclusión, contraste al 55 %, media 0,95. **No traen color.** El color lo
  // sigue poniendo la paleta de COLOR_SCRIPT.md a través del material, y el mapa multiplica.
  // Por eso sumar textura no reabre ninguna decisión de color ni rompe el paso a crepúsculo.
  const paving = loadKitMaps(MATERIAL_URLS.pavingGrain, MATERIAL_URLS.pavingNormal);
  const stone = loadKitMaps(MATERIAL_URLS.stoneGrain, MATERIAL_URLS.stoneNormal);
  const textures = [paving.grain, paving.normal, stone.grain, stone.normal];

  // `flatShading` es lo que separa un kit por código de un blockout: sin él, una caja y un
  // cilindro se leen como volúmenes lisos y el sol no describe ninguna arista.
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: FLOOR_COLORS.afternoon,
    map: paving.grain,
    normalMap: paving.normal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
    flatShading: true,
  });
  floorMaterial.name = 'PLAZA_FLOOR';
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: STONE_COLORS.afternoon,
    map: stone.grain,
    normalMap: stone.normal,
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
    map: stone.grain,
    normalMap: stone.normal,
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
      return {
        meshes: 3,
        triangles: triangleCount(floorGeometry) + triangleCount(stoneGeometry) + triangleCount(copperGeometry),
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
