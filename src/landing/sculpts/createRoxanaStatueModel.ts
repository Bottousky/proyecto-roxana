import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildLoft, buildTube, facet, type LoftRing, type TubeSample } from './loft.ts';

export type RoxanaStatueOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
};

// Estatua de Roxana tallada en piedra: figura de pie, abrigo largo abierto sobre
// falda, libro contra el pecho, sobre pedestal moldurado.
//
// El cuerpo es UNA superficie continua (loft de secciones transversales del
// dobladillo a la coronilla), no un apilado de primitivas. La diferencia es todo
// el resultado: con primitivas se ven las costuras donde un elipsoide entra en
// otro y la pieza se lee como un muñeco armado; con una superficie única se lee
// como un bloque tallado, que es lo que muestra la referencia.
//
// Canon de proporciones, midiendo sobre la referencia con la altura de la cabeza
// como unidad: figura de ~7 cabezas, dobladillo de 2.2 cabezas de ancho, pedestal
// al 26% del bloque.
//   pedestal 0.00 → 1.24 · dobladillo 1.24 · borde del abrigo 1.58
//   cintura 3.16 · hombros 3.52 · mentón 3.88 · coronilla 4.33

const STONE = 0xb59a72;
const STONE_LIGHT = 0xc7ad85;
const STONE_DARK = 0x8d7550;

const FEET_Y = 1.24;
const FIGURE_SCALE = 1.145;
const SEGMENTS = 18;
/** Amplitud del desorden de facetado, en unidades del modelo. */
const CHISEL = .012;
const STONE_TEXTURE_SIZE = 256;

type Materials = Record<'main' | 'light' | 'dark', THREE.Material>;
type StoneTextureSet = {
  albedo: THREE.DataTexture;
  roughness: THREE.DataTexture;
  height: THREE.DataTexture;
};

function field(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function stoneField(x: number, y: number, seed: number): number {
  const broad = field(Math.floor(x / 19), Math.floor(y / 19), seed);
  const medium = field(Math.floor(x / 7), Math.floor(y / 7), seed + 2.17);
  const grain = field(x, y, seed + 5.31);
  const vein = .5 + .5 * Math.sin(x * .115 + y * .055 + seed * 2.4);
  return broad * .38 + medium * .27 + grain * .20 + vein * .15;
}

function dataTexture(
  sample: (x: number, y: number) => [number, number, number],
  colorSpace: THREE.ColorSpace,
): THREE.DataTexture {
  const data = new Uint8Array(STONE_TEXTURE_SIZE * STONE_TEXTURE_SIZE * 4);
  for (let y = 0; y < STONE_TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < STONE_TEXTURE_SIZE; x += 1) {
      const [r, g, b] = sample(x, y);
      const offset = (y * STONE_TEXTURE_SIZE + x) * 4;
      data[offset] = THREE.MathUtils.clamp(Math.round(r), 0, 255);
      data[offset + 1] = THREE.MathUtils.clamp(Math.round(g), 0, 255);
      data[offset + 2] = THREE.MathUtils.clamp(Math.round(b), 0, 255);
      data[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(
    data,
    STONE_TEXTURE_SIZE,
    STONE_TEXTURE_SIZE,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 11);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function createStoneTextureSet(): StoneTextureSet {
  const albedo = dataTexture((x, y) => {
    const mottle = stoneField(x, y, 1.3);
    const warmVein = Math.max(0, Math.sin(x * .047 + y * .083) - .72);
    const value = 222 + (mottle - .5) * 30;
    return [value + warmVein * 18, value + warmVein * 7, value - warmVein * 7];
  }, THREE.SRGBColorSpace);
  albedo.name = 'roxana-stone-albedo';

  const roughness = dataTexture((x, y) => {
    const value = 190 + stoneField(x + 37, y + 19, 7.9) * 58;
    return [value, value, value];
  }, THREE.NoColorSpace);
  roughness.name = 'roxana-stone-roughness';

  const height = dataTexture((x, y) => {
    const pits = field(x, y, 12.4) > .965 ? 54 : 0;
    const value = 92 + stoneField(x + 11, y + 53, 15.2) * 122 - pits;
    return [value, value, value];
  }, THREE.NoColorSpace);
  height.name = 'roxana-stone-height';

  return { albedo, roughness, height };
}

function stone(color: number, textures: StoneTextureSet, roughness = .88): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    map: textures.albedo,
    roughness,
    roughnessMap: textures.roughness,
    bumpMap: textures.height,
    bumpScale: .012,
    metalness: 0,
    flatShading: true,
  });
}

function finish(mesh: THREE.Mesh, name: string, options: RoxanaStatueOptions): THREE.Mesh {
  mesh.name = name;
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  mesh.userData.roxanaStatuePart = name;
  return mesh;
}

function addLoft(
  parent: THREE.Object3D,
  name: string,
  rings: LoftRing[],
  material: THREE.Material,
  options: RoxanaStatueOptions,
  chisel = CHISEL,
  segments = SEGMENTS,
): THREE.Mesh {
  const geometry = facet(buildLoft(rings, segments), chisel, { scaleByRadius: true });
  const mesh = finish(new THREE.Mesh(geometry, material), name, options);
  parent.add(mesh);
  return mesh;
}

function addTube(
  parent: THREE.Object3D,
  name: string,
  samples: TubeSample[],
  material: THREE.Material,
  options: RoxanaStatueOptions,
  chisel = CHISEL * .6,
  segments = 9,
): THREE.Mesh {
  const mesh = finish(new THREE.Mesh(facet(buildTube(samples, segments), chisel), material), name, options);
  parent.add(mesh);
  return mesh;
}

function addBox(
  parent: THREE.Object3D,
  name: string,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  options: RoxanaStatueOptions,
  radius = .014,
): THREE.Mesh {
  const geometry = radius > 0
    ? new RoundedBoxGeometry(size[0], size[1], size[2], 1, radius)
    : new THREE.BoxGeometry(...size);
  const mesh = finish(new THREE.Mesh(geometry, material), name, options);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function extrudedPanel(points: Array<[number, number]>, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: Math.min(depth * .4, .012),
    bevelThickness: Math.min(depth * .3, .009),
    curveSegments: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function addPanel(
  parent: THREE.Object3D,
  name: string,
  points: Array<[number, number]>,
  depth: number,
  position: [number, number, number],
  material: THREE.Material,
  options: RoxanaStatueOptions,
): THREE.Mesh {
  const mesh = finish(new THREE.Mesh(extrudedPanel(points, depth), material), name, options);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function point(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z);
}

function addPedestal(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  addBox(root, 'pedestal-plinth-1', [1.44, .10, 1.08], [0, .050, 0], materials.light, options, .018);
  addBox(root, 'pedestal-plinth-2', [1.32, .085, .98], [0, .1425, 0], materials.main, options, .014);
  addBox(root, 'pedestal-plinth-3', [1.21, .07, .89], [0, .220, 0], materials.light, options, .012);
  addBox(root, 'pedestal-die', [1.06, .60, .78], [0, .555, 0], materials.main, options, .016);
  addBox(root, 'pedestal-cornice-1', [1.14, .06, .85], [0, .885, 0], materials.light, options, .010);
  addBox(root, 'pedestal-cornice-2', [1.30, .10, .99], [0, .965, 0], materials.main, options, .018);
  addBox(root, 'pedestal-cap', [1.18, .085, .88], [0, 1.0575, 0], materials.light, options, .014);
  addBox(root, 'pedestal-top-step', [1.08, .14, .80], [0, 1.170, 0], materials.main, options, .012);

  const frame: Array<[number, number]> = [
    [-.40, -.19], [-.34, -.24], [.34, -.24], [.40, -.19],
    [.40, .19], [.34, .24], [-.34, .24], [-.40, .19],
  ];
  const field = frame.map(([x, y]) => [x * .86, y * .80] as [number, number]);
  const faces: Array<{ id: string; position: [number, number, number]; rotation: number; scale: number }> = [
    { id: 'front', position: [0, .555, .385], rotation: 0, scale: 1 },
    { id: 'back', position: [0, .555, -.385], rotation: Math.PI, scale: 1 },
    { id: 'right', position: [.525, .555, 0], rotation: Math.PI / 2, scale: .92 },
    { id: 'left', position: [-.525, .555, 0], rotation: -Math.PI / 2, scale: .92 },
  ];
  for (const face of faces) {
    const outer = addPanel(
      root,
      `pedestal-plaque-${face.id}`,
      frame.map(([x, y]) => [x * face.scale, y] as [number, number]),
      .022,
      face.position,
      materials.light,
      options,
    );
    outer.rotation.y = face.rotation;
    const inner = addPanel(
      root,
      `pedestal-plaque-field-${face.id}`,
      field.map(([x, y]) => [x * face.scale, y] as [number, number]),
      .014,
      face.position,
      materials.dark,
      options,
    );
    inner.rotation.y = face.rotation;
    inner.position.add(new THREE.Vector3(0, 0, .004).applyAxisAngle(new THREE.Vector3(0, 1, 0), face.rotation));
  }
}

/**
 * El cuerpo entero en una sola pasada. El escalón del abrigo sobre la enagua se
 * consigue con dos secciones casi a la misma altura y anchos distintos: eso
 * genera un labio tallado, no un tambor pegado debajo de una campana.
 */
function addBody(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  const rings: LoftRing[] = [
    { y: FEET_Y, halfWidth: .400, halfDepth: .330, squareness: .18 },
    { y: 1.300, halfWidth: .442, halfDepth: .366, squareness: .18 },
    { y: 1.420, halfWidth: .436, halfDepth: .360, squareness: .16 },
    { y: 1.545, halfWidth: .427, halfDepth: .352, squareness: .16 },
    { y: 1.575, halfWidth: .423, halfDepth: .349, squareness: .16 },
    { y: 1.580, halfWidth: .470, halfDepth: .388, squareness: .22 },
    { y: 1.660, halfWidth: .466, halfDepth: .384, squareness: .22 },
    { y: 1.850, halfWidth: .450, halfDepth: .370, squareness: .22 },
    { y: 2.050, halfWidth: .430, halfDepth: .352, squareness: .22 },
    { y: 2.250, halfWidth: .406, halfDepth: .331, squareness: .22 },
    { y: 2.450, halfWidth: .379, halfDepth: .307, squareness: .21 },
    { y: 2.650, halfWidth: .348, halfDepth: .282, squareness: .20 },
    { y: 2.850, halfWidth: .314, halfDepth: .254, squareness: .19 },
    { y: 3.000, halfWidth: .284, halfDepth: .231, squareness: .18 },
    { y: 3.090, halfWidth: .262, halfDepth: .215, squareness: .17 },
    { y: 3.160, halfWidth: .246, halfDepth: .205, squareness: .16 },
    { y: 3.260, halfWidth: .268, halfDepth: .218, squareness: .14 },
    { y: 3.340, halfWidth: .292, halfDepth: .232, squareness: .14 },
    { y: 3.430, halfWidth: .326, halfDepth: .246, squareness: .16 },
    { y: 3.520, halfWidth: .338, halfDepth: .250, squareness: .17 },
    { y: 3.580, halfWidth: .306, halfDepth: .228, squareness: .14 },
    { y: 3.640, halfWidth: .232, halfDepth: .186, squareness: .09 },
    { y: 3.700, halfWidth: .181, halfDepth: .159, squareness: .05 },
    { y: 3.760, halfWidth: .144, halfDepth: .132, squareness: .03 },
    { y: 3.810, halfWidth: .104, halfDepth: .098, squareness: 0, offsetZ: .006 },
    { y: 3.870, halfWidth: .096, halfDepth: .093, squareness: 0, offsetZ: .010 },
    // La cara va con squareness alto a propósito: un frente casi plano y tallado
    // contra el pelo que curva es lo único que separa cabeza de melena. Con la
    // cabeza redonda, ambas se funden en un óvalo y la figura parece encapuchada.
    { y: 3.910, halfWidth: .108, halfDepth: .128, squareness: .22, offsetZ: .028 },
    { y: 3.950, halfWidth: .128, halfDepth: .150, squareness: .32, offsetZ: .028 },
    { y: 4.000, halfWidth: .142, halfDepth: .156, squareness: .38, offsetZ: .026 },
    { y: 4.060, halfWidth: .150, halfDepth: .168, squareness: .42, offsetZ: .024 },
    { y: 4.130, halfWidth: .148, halfDepth: .165, squareness: .40, offsetZ: .020 },
    { y: 4.200, halfWidth: .136, halfDepth: .152, squareness: .32, offsetZ: .012 },
    { y: 4.260, halfWidth: .112, halfDepth: .126, squareness: .22, offsetZ: .004 },
    { y: 4.310, halfWidth: .070, halfDepth: .082, squareness: .08, offsetZ: -.004 },
    { y: 4.335, halfWidth: .026, halfDepth: .032, squareness: 0, offsetZ: -.006 },
  ];
  addLoft(root, 'figure-body', rings, materials.main, options);

  // Cantos delanteros del abrigo: las dos aristas que leen como "abrigo abierto".
  for (const side of [-1, 1]) {
    addTube(root, side < 0 ? 'coat-edge-right' : 'coat-edge-left', [
      { point: point(side * .098, 3.320, .205), radiusX: .022, radiusZ: .016, squareness: .8 },
      { point: point(side * .124, 2.700, .276), radiusX: .030, radiusZ: .020, squareness: .8 },
      { point: point(side * .152, 1.700, .350), radiusX: .034, radiusZ: .022, squareness: .8 },
    ], materials.main, options, .004, 6);
  }
  addTube(root, 'coat-back-vent', [
    { point: point(0, 3.000, -.228), radiusX: .018, radiusZ: .014, squareness: .8 },
    { point: point(0, 1.700, -.372), radiusX: .026, radiusZ: .018, squareness: .8 },
  ], materials.main, options, .004, 6);

  // Pecho: abrigo · solapa · chaleco · solapa · abrigo.
  addPanel(root, 'vest-front', [[-.058, .105], [.058, .105], [.040, -.245], [-.040, -.245]], .03, [0, 3.34, .208], materials.main, options);
  addPanel(root, 'lapel-right', [[-.172, .150], [-.030, .050], [-.052, -.212], [-.160, -.048]], .038, [0, 3.38, .222], materials.light, options);
  addPanel(root, 'lapel-left', [[.030, .050], [.172, .150], [.160, -.048], [.052, -.212]], .038, [0, 3.38, .222], materials.light, options);
  for (let index = 0; index < 4; index += 1) {
    addBox(root, `vest-button-${index + 1}`, [.030, .030, .018], [0, 3.30 - index * .072, .226], materials.dark, options, .008);
  }

  addBox(root, 'bow-right', [.088, .042, .034], [-.048, 3.702, .188], materials.light, options, .014).rotation.z = .24;
  addBox(root, 'bow-left', [.088, .042, .034], [.048, 3.702, .188], materials.light, options, .014).rotation.z = -.24;
  addBox(root, 'bow-knot', [.036, .042, .032], [0, 3.702, .198], materials.main, options, .012);

  for (const side of [-1, 1]) {
    const pocket = addPanel(
      root,
      side < 0 ? 'coat-pocket-right' : 'coat-pocket-left',
      [[-.075, -.026], [.075, -.026], [.075, .026], [-.075, .026]],
      .024,
      [side * .244, 2.62, .196],
      materials.light,
      options,
    );
    pocket.rotation.y = side * .63;
  }

  for (const side of [-1, 1]) {
    addBox(root, side < 0 ? 'shoe-tip-right' : 'shoe-tip-left', [.135, .062, .19], [side * .115, 1.272, .30], materials.main, options, .020);
  }
}

function addArms(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  // Brazo izquierdo (+X): cae por delante del abrigo con codo apenas marcado.
  addTube(root, 'left-arm', [
    { point: point(.232, 3.520, .030), radiusX: .108, radiusZ: .100 },
    { point: point(.272, 3.320, .076), radiusX: .102, radiusZ: .095 },
    { point: point(.305, 3.090, .128), radiusX: .092, radiusZ: .086 },
    { point: point(.316, 2.900, .152), radiusX: .085, radiusZ: .080 },
    { point: point(.322, 2.730, .174), radiusX: .073, radiusZ: .070 },
    { point: point(.324, 2.660, .181), radiusX: .080, radiusZ: .074 },
    { point: point(.326, 2.600, .187), radiusX: .064, radiusZ: .058 },
    { point: point(.327, 2.520, .196), radiusX: .058, radiusZ: .048 },
    { point: point(.326, 2.455, .202), radiusX: .044, radiusZ: .038 },
  ], materials.main, options);
  for (let index = 0; index < 3; index += 1) {
    addTube(root, `left-finger-${index + 1}`, [
      { point: point(.305 + index * .020, 2.505, .216 - index * .028), radiusX: .015 },
      { point: point(.308 + index * .020, 2.430 - Math.abs(index - 1) * .010, .219 - index * .028), radiusX: .011 },
    ], materials.light, options, .002, 5);
  }

  // Brazo derecho (-X): flexionado, sostiene el libro contra el pecho.
  addTube(root, 'right-arm', [
    { point: point(-.232, 3.520, .030), radiusX: .108, radiusZ: .100 },
    { point: point(-.278, 3.330, .066), radiusX: .102, radiusZ: .095 },
    { point: point(-.310, 3.150, .108), radiusX: .094, radiusZ: .088 },
    { point: point(-.296, 3.075, .166), radiusX: .090, radiusZ: .084 },
    { point: point(-.238, 3.040, .234), radiusX: .084, radiusZ: .078 },
    { point: point(-.178, 3.020, .284), radiusX: .074, radiusZ: .068 },
    { point: point(-.140, 3.012, .308), radiusX: .062, radiusZ: .054 },
  ], materials.main, options);
  for (let index = 0; index < 4; index += 1) {
    addTube(root, `book-finger-${index + 1}`, [
      { point: point(-.186 + index * .008, 3.078 - index * .024, .316), radiusX: .013 },
      { point: point(-.128 + index * .009, 3.064 - index * .026, .324), radiusX: .010 },
    ], materials.light, options, .002, 5);
  }
}

function addBook(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  const book = new THREE.Group();
  book.name = 'roxana-book';
  book.position.set(-.248, 3.20, .240);
  book.rotation.set(0, .20, -.14);
  root.add(book);

  addBox(book, 'book-cover', [.270, .380, .075], [0, 0, 0], materials.main, options, .010);
  addBox(book, 'book-pages', [.230, .340, .020], [.006, 0, .046], materials.light, options, .004);
  addBox(book, 'book-spine', [.032, .390, .082], [-.132, 0, 0], materials.light, options, .009);
}

/**
 * La melena es otra superficie continua, no elipsoides sueltos: una masa que
 * arranca por encima del cráneo y baja afinándose hasta los omóplatos. Va
 * corrida hacia atrás para dejar frente y sienes despejadas.
 */
function addHair(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  // El cráneo mide 0.150 de semiancho: la melena sólo puede pasarlo por ~0.02.
  // Más que eso y deja de ser pelo peinado hacia atrás para volverse una capucha
  // que se traga la cara y los hombros.
  addLoft(root, 'hair-mass', [
    { y: 3.440, halfWidth: .056, halfDepth: .052, squareness: .20, offsetZ: -.154 },
    { y: 3.560, halfWidth: .080, halfDepth: .074, squareness: .22, offsetZ: -.148 },
    { y: 3.700, halfWidth: .104, halfDepth: .096, squareness: .24, offsetZ: -.138 },
    { y: 3.830, halfWidth: .132, halfDepth: .122, squareness: .26, offsetZ: -.122 },
    { y: 3.950, halfWidth: .154, halfDepth: .148, squareness: .28, offsetZ: -.104 },
    { y: 4.060, halfWidth: .158, halfDepth: .164, squareness: .28, offsetZ: -.092 },
    { y: 4.150, halfWidth: .154, halfDepth: .160, squareness: .26, offsetZ: -.086 },
    { y: 4.230, halfWidth: .138, halfDepth: .144, squareness: .22, offsetZ: -.080 },
    { y: 4.295, halfWidth: .108, halfDepth: .114, squareness: .16, offsetZ: -.070 },
    { y: 4.348, halfWidth: .048, halfDepth: .052, squareness: .10, offsetZ: -.064 },
  ], materials.main, options, CHISEL * .8);

  // Dos mechones estrechos enmarcan la cara y se afinan sobre los hombros. El
  // radio decrece con fuerza para conservar aire entre pelo, cuello y solapas.
  for (const side of [-1, 1]) {
    addTube(root, side < 0 ? 'hair-fall-right' : 'hair-fall-left', [
      { point: point(side * .112, 4.200, -.058), radiusX: .026, radiusZ: .038, squareness: .3 },
      { point: point(side * .132, 4.060, -.050), radiusX: .031, radiusZ: .044, squareness: .3 },
      { point: point(side * .142, 3.900, -.018), radiusX: .029, radiusZ: .040, squareness: .3 },
      { point: point(side * .154, 3.740, .015), radiusX: .022, radiusZ: .030, squareness: .3 },
      { point: point(side * .168, 3.610, .030), radiusX: .012, radiusZ: .020, squareness: .3 },
    ], materials.main, options, CHISEL * .5, 7);
  }

  addTube(root, 'hair-center-part', [
    { point: point(0, 4.328, .092), radiusX: .007, radiusZ: .006, squareness: .7 },
    { point: point(0, 4.245, .151), radiusX: .006, radiusZ: .005, squareness: .7 },
    { point: point(0, 4.205, .169), radiusX: .004, radiusZ: .004, squareness: .7 },
  ], materials.dark, options, .001, 5);
}

/**
 * Rasgos en relieve sobre la superficie del loft. Las cotas en Z están calculadas
 * contra el contorno superelíptico de la cabeza: si un rasgo queda por dentro,
 * no se hunde con elegancia — desaparece, y sólo asoma a parches donde el picado
 * movió la superficie, que es lo que convierte la cara en una calavera.
 */
function addFace(root: THREE.Group, materials: Materials, options: RoxanaStatueOptions): void {
  for (const side of [-1, 1]) {
    addBox(root, side < 0 ? 'brow-right' : 'brow-left', [.078, .016, .028], [side * .054, 4.132, .182], materials.dark, options, .004)
      .rotation.z = side * .09;
    addBox(root, side < 0 ? 'eye-right' : 'eye-left', [.056, .018, .020], [side * .056, 4.090, .190], materials.dark, options, .003);
    addBox(root, side < 0 ? 'lower-lid-right' : 'lower-lid-left', [.050, .008, .013], [side * .056, 4.078, .187], materials.light, options, .002);
  }
  addTube(root, 'nose', [
    { point: point(0, 4.082, .187), radiusX: .008, radiusZ: .009, squareness: .5 },
    { point: point(0, 4.015, .185), radiusX: .017, radiusZ: .016, squareness: .5 },
  ], materials.light, options, .002, 5);
  addBox(root, 'mouth', [.054, .010, .009], [0, 3.958, .166], materials.dark, options, .002);
  addBox(root, 'lower-lip', [.043, .009, .008], [0, 3.943, .163], materials.light, options, .002);
}

export function createRoxanaStatueModel(options: RoxanaStatueOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Roxana_Procedural_Statue';
  root.userData.kind = 'roxana-statue';
  root.userData.pipeline = 'img2threejs-procedural';
  root.userData.referenceScaleHeads = 7;

  const textures = createStoneTextureSet();
  const materials: Materials = {
    main: stone(STONE, textures),
    light: stone(STONE_LIGHT, textures, .82),
    dark: stone(STONE_DARK, textures, .93),
  };

  addPedestal(root, materials, options);

  const figure = new THREE.Group();
  figure.name = 'Roxana_Figure';
  figure.scale.setScalar(FIGURE_SCALE);
  figure.position.y = FEET_Y * (1 - FIGURE_SCALE);
  root.add(figure);

  addBody(figure, materials, options);
  addArms(figure, materials, options);
  addBook(figure, materials, options);
  addHair(figure, materials, options);
  addFace(figure, materials, options);

  const nodes: Record<string, THREE.Object3D> = {
    root,
    figure,
  };
  const meshes: Record<string, THREE.Mesh> = {};
  root.traverse((object) => {
    if (object.name) nodes[object.name] = object;
    if (object instanceof THREE.Mesh) {
      object.frustumCulled = true;
      meshes[object.name] = object;
    }
  });
  const socketDefinitions: Array<[string, [number, number, number]]> = [
    ['socket-base', [0, 0, 0]],
    ['socket-book', [-.248 * FIGURE_SCALE, 3.20 * FIGURE_SCALE + figure.position.y, .240 * FIGURE_SCALE]],
    ['socket-portrait', [0, 4.08 * FIGURE_SCALE + figure.position.y, .18 * FIGURE_SCALE]],
  ];
  const sockets: Record<string, THREE.Object3D> = {};
  for (const [name, position] of socketDefinitions) {
    const socket = new THREE.Object3D();
    socket.name = name;
    socket.position.set(...position);
    root.add(socket);
    nodes[name] = socket;
    sockets[name] = socket;
  }
  root.userData.sculptRuntime = {
    nodes,
    meshes,
    sockets,
    colliders: {
      pedestal: { type: 'box', center: [0, .62, 0], size: [1.44, 1.24, 1.08], isTrigger: false },
      figure: { type: 'capsule', center: [0, 3.15, 0], radius: .52, height: 3.72, isTrigger: false },
    },
    destructionGroups: {
      monument: Object.keys(meshes).filter((name) => name.startsWith('pedestal-')),
      figure: Object.keys(meshes).filter((name) => !name.startsWith('pedestal-')),
    },
  };
  root.userData.sculptResources = {
    materials,
    textures,
  };
  return root;
}

export function frameRoxanaStatueCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.12;
  const vertical = size.y * margin;
  const horizontal = size.x * margin / Math.max(camera.aspect, .1);
  const maxDim = Math.max(vertical, horizontal);
  const distance = (maxDim / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const azimuth = THREE.MathUtils.degToRad(options.azimuthDeg ?? 0);
  const elevation = THREE.MathUtils.degToRad(options.elevationDeg ?? 0);
  const direction = new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  );
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.near = Math.max(.01, distance - maxDim);
  camera.far = distance + maxDim * 3;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}
