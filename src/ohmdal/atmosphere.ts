// Atmósfera de Ohmdal: cielo, aire y polvo.
//
// Es lo que faltaba para que el mundo dejara de leerse como geometría correcta flotando sobre
// un color plano. Tres cosas, y ninguna cuesta un asset:
//
//   1. CIELO EN DEGRADADO — el fondo era `0x202534`, una pizarra uniforme. Un diorama iluminado
//      contra un vacío oscuro se lee como una maqueta recortada. Un degradado vertical le da
//      horizonte: arriba el aire frío, abajo la banda cálida contra la que se recortan las
//      siluetas.
//   2. NIEBLA AÉREA — perspectiva atmosférica. Lo lejano pierde contraste y se va al color del
//      horizonte. Es lo que separa el primer plano del fondo cuando la cámara es casi
//      ortográfica y la perspectiva no puede hacerlo sola.
//   3. POLVO EN SUSPENSIÓN — motas que flotan en el haz de la tarde. Son el aire hecho visible:
//      sin ellas el espacio entre la cámara y el mundo está vacío, y el ojo lo lee como cristal.
//
// El polvo **sigue al encuadre**, no al mundo: se envuelve alrededor del foco de la cámara, así
// que dos mil motas repartidas en 38 metros —de las que se verían veinte— se vuelven doscientas
// que siempre están en cuadro. Es la misma idea que la ventana de sombra que sigue al jugador.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BlockoutTimeOfDay } from './materials/blockoutMaterials.ts';

/** Los tres colores de una hora del día: cenit, horizonte y la niebla que los une. */
interface SkyPalette {
  readonly zenith: number;
  readonly horizon: number;
  readonly haze: number;
  readonly moteColor: number;
  readonly moteOpacity: number;
}

// La paleta sigue siendo la de `COLOR_SCRIPT.md`: piedra, cobre y agua de tarde; brasa y
// ciruela de crepúsculo. Acá sólo se extiende al aire, que hasta ahora no tenía color asignado.
//
// RC1-feedback: la tarde dejó de ser azul y pasó a tonos cálidos. La Plaza está pensada para
// tarde de cobre — piedra, dintel, campana — y un cielo azul frío la recortaba contra el vacío.
// La paleta nueva arranca en durazno bajo y termina en cobre alto: el horizonte calienta a la
// Plaza en lugar de enfriarla. El crepúsculo conserva ciruela y brasa, que es lo que pide el
// final del arco.
const SKY: Readonly<Record<BlockoutTimeOfDay, SkyPalette>> = {
  afternoon: {
    zenith: 0xc2683a,
    horizon: 0xf2c89a,
    haze: 0xe6b48a,
    moteColor: 0xffe2ac,
    moteOpacity: 0.5,
  },
  twilight: {
    zenith: 0x141a33,
    horizon: 0x6b4a63,
    haze: 0x4c4258,
    moteColor: 0xffc98a,
    moteOpacity: 0.62,
  },
};

// El horizonte son siluetas a contraluz: siempre un valor más oscuro que la bruma, con un
// tinte apenas desviado hacia la misma familia. La tarde cálida pide montañas en marrón
// quemado y árboles en sombra de nogal; el crepúsculo sigue en ciruela-negro. Son hexes
// elegidos a mano, no derivados de multiplicar.
const HORIZON_PALETTE: Readonly<Record<BlockoutTimeOfDay, { readonly mountain: number; readonly tree: number }>> = {
  afternoon: { mountain: 0x4a2a1c, tree: 0x2a1408 },
  twilight: { mountain: 0x1a1228, tree: 0x0a0814 },
};

/**
 * Dónde empieza y dónde termina la niebla, en metros de profundidad de vista.
 *
 * La cámara se planta a unos 27 m del foco (`cameraDistanceForSpan` de un alto visible de 13,5),
 * así que el sujeto cae cerca de `NEAR`: apenas velado. Lo que está diez metros más atrás —los
 * muros del fondo, el Manantial detrás de la Puerta— ya se va al color del horizonte. Ese
 * gradiente es el que da profundidad cuando la proyección casi no la da.
 */
const FOG_NEAR_METERS = 24;
const FOG_FAR_METERS = 58;

/** Alto y ancho del volumen de polvo alrededor del foco, en metros. */
const MOTE_VOLUME = Object.freeze({ width: 30, height: 9, depth: 18 });

export interface AtmosphereLayer {
  readonly root: THREE.Group;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  /** Recentra el polvo sobre el foco y lo hace derivar. `focus` es el punto que mira la cámara. */
  update(deltaSeconds: number, focus: THREE.Vector3): void;
  diagnostics(): { readonly disposed: boolean; readonly moteCount: number; readonly fogNear: number; readonly fogFar: number };
  dispose(): void;
}

/** Degradado vertical en un lienzo angosto: el fondo lo estira a pantalla completa. */
function skyTexture(
  palette: SkyPalette,
  horizonPalette: { readonly mountain: number; readonly tree: number },
): THREE.DataTexture {
  // La cámara HD-2D es casi ortográfica a 50° de pitch: la línea de horizonte en el mundo
  // proyectado queda muy por encima del borde superior de la pantalla. Pintar siluetas como
  // geometría separada tampoco las trae a cuadro — la proyección las manda a `local Y` ~200.
  //
  // Lo que sí entra siempre es la **textura del fondo**: el cielo se estira a pantalla completa
  // y la zona donde antes había "solo gradiente" ahora tiene una banda de montañas y otra de
  // árboles, dibujadas con pseudo-aleatorio determinista para que dos renders sean iguales.
  // El coste de los triángulos es 0 — son píxeles — y el efecto es el que faltaba para sacar
  // al mundo del escenario: el ojo lee el fondo como horizonte aunque la cámara no lo apunte.
  const width = 512;
  const height = 128;
  const data = new Uint8Array(width * height * 4);
  const zenith = new THREE.Color(palette.zenith);
  const horizon = new THREE.Color(palette.horizon);
  const haze = new THREE.Color(palette.haze);
  const mountainColor = new THREE.Color(horizonPalette.mountain);
  const treeColor = new THREE.Color(horizonPalette.tree);
  const scratch = new THREE.Color();

  // El horizonte cae a 3/4 de la altura de la textura, no al borde: con la Plaza ocupando
  // el tercio inferior de la pantalla, la banda del horizonte entra en la mitad visible del
  // cielo. Subirlo a 0.85 lo deja muy cerca del borde superior y se ve recortado.
  const HORIZON_ROW = Math.floor(height * 0.72);
  // Curva, no rampa: el cielo se aclara rápido cerca del horizonte y luego se estabiliza,
  // que es como se comporta el aire de verdad y lo que evita la banda de degradado plana.
  for (let row = 0; row < height; row += 1) {
    const t = row / (height - 1);
    if (row >= HORIZON_ROW) {
      // Por debajo del horizonte: color de bruma, que es lo que la niebla le va a hacer al
      // suelo. Que el fondo y la bruma empaten acá es lo que oculta la costura entre cielo y
      // mundo cuando la cámara se mueve.
      scratch.copy(haze);
    } else {
      scratch.copy(horizon).lerp(zenith, t ** 0.62);
    }
    for (let column = 0; column < width; column += 1) {
      // Pseudo-aleatorio determinista por columna. Suficiente para que el patrón no se note
      // y para que un snapshot del cielo sea reproducible.
      const mountainHeight = mountainSilhouetteAt(column, width);
      const treeHeight = treeLineAt(column, width);
      const mountainRow = HORIZON_ROW - Math.floor(mountainHeight * (HORIZON_ROW * 0.45));
      const treeRow = HORIZON_ROW - Math.floor(treeHeight * (HORIZON_ROW * 0.18));

      const index = (row * width + column) * 4;
      if (row < treeRow) {
        // Por encima de los árboles: cielo puro.
      } else if (row < mountainRow) {
        scratch.copy(treeColor);
      } else if (row < HORIZON_ROW) {
        scratch.copy(mountainColor);
      }
      data[index] = Math.round(scratch.r * 255);
      data[index + 1] = Math.round(scratch.g * 255);
      data[index + 2] = Math.round(scratch.b * 255);
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Altura normalizada [0,1] de la silueta de montaña en una columna. */
function mountainSilhouetteAt(column: number, width: number): number {
  // Tres octavas: una lenta que da las crestas, una media que da el relieve, una rápida
  // que da el detalle. La suma clampeada a 1 es lo que se ve contra el cielo.
  const x = column / width;
  const slow = Math.sin(x * Math.PI * 6.2) * 0.5 + 0.5;
  const mid = Math.sin(x * Math.PI * 17 + 0.7) * 0.3 + 0.5;
  const fast = Math.sin(x * Math.PI * 41 + 1.3) * 0.2 + 0.5;
  return Math.min(1, slow * 0.6 + mid * 0.3 + fast * 0.1);
}

/** Altura normalizada [0,1] de la línea de árboles en una columna. */
function treeLineAt(column: number, width: number): number {
  const x = column / width;
  // Dientes de sierra finos: el árbol medio tiene 4-6 m de copa contra una montaña de 20+,
  // entonces la silueta del fondo es 1/4 de la de la montaña y la frecuencia es ~el doble.
  const base = Math.sin(x * Math.PI * 73) * 0.5 + 0.5;
  const jitter = (Math.sin(x * Math.PI * 137) * 0.5 + 0.5) * 0.4;
  return Math.min(1, base * 0.5 + jitter * 0.5);
}

/** Mota redonda con borde suave. Sin esto las partículas son cuadrados. */
function moteTexture(): THREE.Texture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface MoteFieldOptions {
  readonly count: number;
  /** Tamaño del punto en píxeles de dispositivo: con cámara ortográfica `size` no atenúa. */
  readonly sizePixels: number;
  readonly opacity: number;
  readonly riseMetersPerSecond: number;
  readonly swayMeters: number;
  readonly seedOffset: number;
}

interface MoteField {
  readonly points: THREE.Points;
  update(elapsedSeconds: number, focus: THREE.Vector3): void;
  setColor(color: number, opacity: number): void;
  dispose(): void;
}

/**
 * Un campo de motas. La posición base se sortea una vez y se guarda; cada cuadro se le suma la
 * deriva y se envuelve dentro del volumen centrado en el foco.
 *
 * El envolvimiento es lo que hace que caminar treinta metros no deje al jugador fuera del polvo,
 * y como la mota reaparece del otro lado con la misma fase, no hay parpadeo de aparición.
 */
function createMoteField(map: THREE.Texture, options: MoteFieldOptions): MoteField {
  const base = new Float32Array(options.count * 3);
  const phase = new Float32Array(options.count);
  for (let index = 0; index < options.count; index += 1) {
    // Sorteo determinista: el mundo tiene que poder capturar un cuadro dorado y compararlo.
    const seed = index * 2.399963 + options.seedOffset;
    const rx = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
    const ry = (Math.sin(seed * 78.233) * 43758.5453) % 1;
    const rz = (Math.sin(seed * 45.164) * 43758.5453) % 1;
    base[index * 3] = (Math.abs(rx) - 0.5) * MOTE_VOLUME.width;
    base[index * 3 + 1] = Math.abs(ry) * MOTE_VOLUME.height;
    base[index * 3 + 2] = (Math.abs(rz) - 0.5) * MOTE_VOLUME.depth;
    phase[index] = Math.abs(rx + rz) * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(options.count * 3);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // El polvo vive alrededor de la cámara, no en un punto del mundo: sin esto three lo descarta
  // por frustum en cuanto el volumen calculado al construirlo se sale de cuadro.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);

  const material = new THREE.PointsMaterial({
    map,
    size: options.sizePixels,
    transparent: true,
    opacity: options.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // El polvo es lo que hace visible el aire: velarlo con la misma niebla que vela al mundo
    // lo apagaría justo donde tiene que leerse.
    fog: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = `atmosphere_motes_${options.count}`;
  points.frustumCulled = false;
  points.renderOrder = 2;

  /** Devuelve `value` al intervalo [-half, half). */
  const wrap = (value: number, half: number): number => {
    const span = half * 2;
    return ((((value + half) % span) + span) % span) - half;
  };

  return {
    points,
    update(elapsedSeconds, focus) {
      const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let index = 0; index < options.count; index += 1) {
        const swayPhase = phase[index] + elapsedSeconds * 0.35;
        const x = base[index * 3] + Math.sin(swayPhase) * options.swayMeters;
        const y = base[index * 3 + 1] + elapsedSeconds * options.riseMetersPerSecond;
        const z = base[index * 3 + 2] + Math.cos(swayPhase * 0.7) * options.swayMeters;
        attribute.setXYZ(
          index,
          focus.x + wrap(x, MOTE_VOLUME.width / 2),
          // El polvo no baja del suelo: la altura se envuelve sobre el volumen completo y se
          // levanta, no se centra.
          ((y % MOTE_VOLUME.height) + MOTE_VOLUME.height) % MOTE_VOLUME.height,
          focus.z + wrap(z, MOTE_VOLUME.depth / 2),
        );
      }
      attribute.needsUpdate = true;
    },
    setColor(color, opacity) {
      material.color.setHex(color);
      material.opacity = opacity;
    },
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Luciérnagas: motas más grandes, con tinte dorado, que parpadean y flotan.
 *
 * El bloque de polvo del cielo es continuo y gris. Las luciérnagas son otra cosa:
 * cada una tiene un ciclo propio de parpadeo (lfo por índice), se eleva más lento
 * y se mueve en arcos cortos. La diferencia visual con el polvo es lo que hace que
 * la Plaza se sienta habitada cuando cae la tarde.
 */
interface FireflyFieldOptions {
  readonly count: number;
  /** Tamaño del punto en píxeles de pantalla. */
  readonly sizePixels: number;
  /** Tinte base. */
  readonly color: number;
  /** Tamaño del volumen alrededor del foco, en metros. */
  readonly bounds: { readonly width: number; readonly height: number; readonly depth: number };
  readonly seedOffset: number;
}

interface FireflyField {
  readonly points: THREE.Points;
  update(elapsedSeconds: number, focus: THREE.Vector3): void;
  setColor(color: number): void;
  dispose(): void;
}

function createFireflyField(map: THREE.Texture, options: FireflyFieldOptions): FireflyField {
  const base = new Float32Array(options.count * 3);
  const phase = new Float32Array(options.count);
  const blinkPhase = new Float32Array(options.count);
  const blinkRate = new Float32Array(options.count);
  for (let index = 0; index < options.count; index += 1) {
    const seed = index * 0.4711 + options.seedOffset;
    const rx = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
    const ry = (Math.sin(seed * 78.233) * 43758.5453) % 1;
    const rz = (Math.sin(seed * 45.164) * 43758.5453) % 1;
    base[index * 3] = (Math.abs(rx) - 0.5) * options.bounds.width;
    base[index * 3 + 1] = Math.abs(ry) * options.bounds.height;
    base[index * 3 + 2] = (Math.abs(rz) - 0.5) * options.bounds.depth;
    phase[index] = Math.abs(rx + rz) * Math.PI * 2;
    // Cada luciérnaga parpadea a un ritmo ligeramente distinto: la mezcla
    // desincronizada es lo que da la sensación de "enjambre vivo".
    blinkPhase[index] = (Math.sin(seed * 91.7) * 0.5 + 0.5) * Math.PI * 2;
    blinkRate[index] = 0.7 + (Math.sin(seed * 31.1) * 0.5 + 0.5) * 1.6;
  }
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(options.count * 3);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);

  const material = new THREE.PointsMaterial({
    map,
    size: options.sizePixels,
    color: options.color,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = `atmosphere_fireflies_${options.count}`;
  points.frustumCulled = false;
  points.renderOrder = 3;

  const wrap = (value: number, half: number): number => {
    const span = half * 2;
    return ((((value + half) % span) + span) % span) - half;
  };

  return {
    points,
    update(elapsedSeconds, focus) {
      const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let index = 0; index < options.count; index += 1) {
        const swayPhase = phase[index] + elapsedSeconds * 0.6;
        const swayX = Math.sin(swayPhase) * 0.6;
        const swayZ = Math.cos(swayPhase * 0.7) * 0.6;
        const x = base[index * 3] + swayX;
        const y = base[index * 3 + 1] + elapsedSeconds * 0.18;
        const z = base[index * 3 + 2] + swayZ;
        attribute.setXYZ(
          index,
          focus.x + wrap(x, options.bounds.width / 2),
          ((y % options.bounds.height) + options.bounds.height) % options.bounds.height,
          focus.z + wrap(z, options.bounds.depth / 2),
        );
      }
      attribute.needsUpdate = true;
      // Parpadeo: modulamos la opacidad con un lfo por luciérnaga.
      // La mitad de las luciérnagas están apagadas en cualquier momento, lo que
      // concentra la atención en las encendidas.
      const pulse = 0.55 + 0.45 * Math.sin(elapsedSeconds * 0.9);
      material.opacity = 0.45 * pulse + 0.2;
    },
    setColor(color) {
      material.color.setHex(color);
    },
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Monta la atmósfera sobre una escena: le pone fondo, niebla y polvo.
 *
 * La escena es dueña del fondo y de la niebla —son propiedades suyas, no objetos del grafo—,
 * así que `dispose` las devuelve a como estaban. El polvo sí es un objeto y se va con la capa.
 */

/**
 * Construye el horizonte como dos mallas fusionadas: una de montañas y una de árboles.
 *
 * El centro del anillo se corre al medio del mundo jugable (Plaza -21, Faro 152 → 65), no al
 * origen: desde cualquier ancla de la ruta el horizonte se ve igual de lejos. Las siluetas son
 * pirámides de base cuadrada (4 triángulos, 5 vértices) con alturas y radios pseudoaleatorios
 * deterministas — `i * 23 % algo` es suficiente para que el patrón no se note y para que un
 * render sea reproducible byte a byte.
 */
function buildHorizonBackdrop(): { mountains: THREE.BufferGeometry; trees: THREE.BufferGeometry } {
  const centerX = 60;
  const peakCount = 32;
  const treeCount = 56;

  function peak(baseWidth: number, height: number): THREE.BufferGeometry {
    const half = baseWidth / 2;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -half, 0, -half,
       half, 0, -half,
       half, 0,  half,
      -half, 0,  half,
         0, height, 0,
    ]), 3));
    geom.setIndex(new THREE.BufferAttribute(new Uint16Array([
      0, 1, 4,
      1, 2, 4,
      2, 3, 4,
      3, 0, 4,
    ]), 1));
    geom.computeVertexNormals();
    return geom;
  }

  const mountainPieces: THREE.BufferGeometry[] = [];
  for (let i = 0; i < peakCount; i += 1) {
    const angle = (i / peakCount) * Math.PI * 2;
    const radius = 180 + ((i * 23) % 50) - 25;
    const height = 16 + ((i * 17) % 22);
    const baseWidth = 18 + ((i * 11) % 14);
    const x = centerX + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const geom = peak(baseWidth, height);
    geom.translate(x, -1, z);
    mountainPieces.push(geom);
  }
  const mountains = mergeGeometries(mountainPieces, false)!;
  for (const piece of mountainPieces) piece.dispose();

  const treePieces: THREE.BufferGeometry[] = [];
  for (let i = 0; i < treeCount; i += 1) {
    const angle = (i / treeCount) * Math.PI * 2 + 0.13;
    const radius = 120 + ((i * 13) % 25) - 12;
    const height = 4 + ((i * 7) % 6);
    const baseWidth = 3 + ((i * 5) % 4);
    const x = centerX + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const geom = peak(baseWidth, height);
    geom.translate(x, -0.5, z);
    treePieces.push(geom);
  }
  const trees = mergeGeometries(treePieces, false)!;
  for (const piece of treePieces) piece.dispose();

  return { mountains, trees };
}

export function createOhmdalAtmosphere(
  scene: THREE.Scene,
  initialTime: BlockoutTimeOfDay = 'afternoon',
): AtmosphereLayer {
  const root = new THREE.Group();
  root.name = 'LAYER_ATMOSPHERE';

  const previousBackground = scene.background;
  const previousFog = scene.fog;

  const skies: Record<BlockoutTimeOfDay, THREE.DataTexture> = {
    afternoon: skyTexture(SKY.afternoon, HORIZON_PALETTE.afternoon),
    twilight: skyTexture(SKY.twilight, HORIZON_PALETTE.twilight),
  };

  const fog = new THREE.Fog(SKY[initialTime].haze, FOG_NEAR_METERS, FOG_FAR_METERS);
  scene.fog = fog;
  scene.background = skies[initialTime];

  const map = moteTexture();
  // Dos campos y no uno: el fino da densidad y el grueso da los pocos destellos que el bloom
  // levanta. Con un solo tamaño el polvo se lee como grano de imagen, no como aire.
  const fine = createMoteField(map, {
    count: 220,
    sizePixels: 3,
    opacity: 0.55,
    riseMetersPerSecond: 0.12,
    swayMeters: 0.35,
    seedOffset: 0,
  });
  const coarse = createMoteField(map, {
    count: 46,
    sizePixels: 7,
    opacity: 0.4,
    riseMetersPerSecond: 0.07,
    swayMeters: 0.6,
    seedOffset: 137.5,
  });

  // Luciérnagas: existen sólo en `twilight`, cuando el sol cae y los pixeles brillantes
  // se notan. En `afternoon` están guardadas pero invisibles: la diferencia visual entre
  // los dos momentos del día es justamente el corte de la luz dorada.
  const FIREFLY_BOUNDS = { width: 26, height: 5, depth: 16 };
  const firefliesAfternoon = createFireflyField(map, {
    count: 32,
    sizePixels: 8,
    color: 0xffe9b6,
    bounds: FIREFLY_BOUNDS,
    seedOffset: 444.7,
  });
  const firefliesTwilight = createFireflyField(map, {
    count: 56,
    sizePixels: 9,
    color: 0xfff0c8,
    bounds: FIREFLY_BOUNDS,
    seedOffset: 818.3,
  });
  firefliesAfternoon.points.visible = false;
  firefliesTwilight.points.visible = false;

  // === HORIZON BACKDROP ===
  // Sin horizonte el mundo se lee como un diorama recortado: el suelo termina en un void azul
  // y los sets vecinos se ven como cajas pegadas. DQ III HD-2D resuelve esto con una **banda
  // de siluetas** a contraluz — montañas detrás, árboles delante — que se desvanece por niebla
  // y se vuelve del color del aire. Acá se hace con dos mallas low-poly en un anillo fijo
  // alrededor del mundo, materiales sin niebla (`fog: false`) y colores un escalón más oscuros
  // que la bruma. Es la mitad del costo (dos draw calls, ~200 triángulos) y el cambio que
  // saca al mundo del escenario.
  const horizon = buildHorizonBackdrop();
  const horizonMountains = new THREE.Mesh(horizon.mountains, new THREE.MeshBasicMaterial({
    color: HORIZON_PALETTE[initialTime].mountain,
    fog: false,
  }));
  const horizonTrees = new THREE.Mesh(horizon.trees, new THREE.MeshBasicMaterial({
    color: HORIZON_PALETTE[initialTime].tree,
    fog: false,
  }));
  horizonMountains.name = 'horizon_mountains';
  horizonMountains.frustumCulled = false;
  // `renderOrder` negativo: se dibuja antes que el resto, así el depth buffer ya está escrito
  // cuando los kits y el faldón del Taller se pintan encima. Sin esto, los triángulos
  // cercanos y los lejanos compiten por Z y el horizonte parpadea entre el cielo y el suelo.
  horizonMountains.renderOrder = -2;
  horizonTrees.name = 'horizon_trees';
  horizonTrees.frustumCulled = false;
  horizonTrees.renderOrder = -1;

  root.add(fine.points, coarse.points, firefliesAfternoon.points, firefliesTwilight.points, horizonMountains, horizonTrees);
  scene.add(root);

  let elapsed = 0;
  let disposed = false;

  const applyTime = (timeOfDay: BlockoutTimeOfDay): void => {
    const palette = SKY[timeOfDay];
    scene.background = skies[timeOfDay];
    fog.color.setHex(palette.haze);
    fine.setColor(palette.moteColor, palette.moteOpacity * 0.85);
    coarse.setColor(palette.moteColor, palette.moteOpacity * 0.62);
    horizonMountains.material.color.setHex(HORIZON_PALETTE[timeOfDay].mountain);
    horizonTrees.material.color.setHex(HORIZON_PALETTE[timeOfDay].tree);
    if (timeOfDay === 'afternoon') {
      firefliesAfternoon.points.visible = true;
      firefliesTwilight.points.visible = false;
    } else {
      firefliesAfternoon.points.visible = false;
      firefliesTwilight.points.visible = true;
    }
  };
  applyTime(initialTime);

  return {
    root,
    setTimeOfDay(timeOfDay) {
      if (disposed) throw new Error('Ohmdal atmosphere is disposed');
      applyTime(timeOfDay);
    },
    update(deltaSeconds, focus) {
      if (disposed) return;
      elapsed += deltaSeconds;
      fine.update(elapsed, focus);
      coarse.update(elapsed, focus);
      if (firefliesAfternoon.points.visible) {
        firefliesAfternoon.update(elapsed, focus);
      }
      if (firefliesTwilight.points.visible) {
        firefliesTwilight.update(elapsed, focus);
      }
    },
    diagnostics() {
      return { disposed, moteCount: 220 + 46, fogNear: FOG_NEAR_METERS, fogFar: FOG_FAR_METERS };
    },
    dispose() {
      if (disposed) return;
      fine.dispose();
      coarse.dispose();
      firefliesAfternoon.dispose();
      firefliesTwilight.dispose();
      horizon.mountains.dispose();
      horizon.trees.dispose();
      (horizonMountains.material as THREE.Material).dispose();
      (horizonTrees.material as THREE.Material).dispose();
      root.removeFromParent();
      map.dispose();
      skies.afternoon.dispose();
      skies.twilight.dispose();
      scene.background = previousBackground;
      scene.fog = previousFog;
      disposed = true;
    },
  };
}
