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
const SKY: Readonly<Record<BlockoutTimeOfDay, SkyPalette>> = {
  afternoon: {
    zenith: 0x2f5f86,
    horizon: 0x8fb0c0,
    haze: 0xa9b6b4,
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
// tinte apenas desviado hacia la misma familia (gris-azul para la tarde, ciruela-negro para
// el crepúsculo). El `0.40 / 0.55` no sale de multiplicar: son hexes elegidos a mano.
const HORIZON_PALETTE: Readonly<Record<BlockoutTimeOfDay, { readonly mountain: number; readonly tree: number }>> = {
  afternoon: { mountain: 0x3a4a5a, tree: 0x1a2628 },
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

  root.add(fine.points, coarse.points, horizonMountains, horizonTrees);
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
    },
    diagnostics() {
      return { disposed, moteCount: 220 + 46, fogNear: FOG_NEAR_METERS, fogFar: FOG_FAR_METERS };
    },
    dispose() {
      if (disposed) return;
      fine.dispose();
      coarse.dispose();
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
