// Las herramientas con las que se construye un set de Ohmdal por código.
//
// Sin Blender y sin texturas de dibujo, lo que separa un decorado de un blockout es **dónde
// cae la luz dentro de cada pieza**. Una caja de un solo color se lee como una caja aunque
// tenga la forma correcta. Estas cinco piezas son la receta:
//
//   1. `block` y `drum` — volúmenes con el pivote en su base, ya en coordenadas de mundo.
//   2. `projectUvs` — UV proyectadas desde el mundo, para que el kit modular no muestre la
//      costura entre módulos contiguos.
//   3. `paint` y `weatheredPaint` — vertex colors como **multiplicadores**: mugre abajo,
//      desgaste arriba, oclusión contra los bordes y variación determinista por pieza.
//   4. `loadTiling` — mapas que se repiten, y que aportan grano, no color.
//   5. `noise` — ruido determinista: dos corridas pintan igual, que es lo que exige poder
//      capturar un golden frame y compararlo.
//
// El color de la paleta no vive acá. Los vértices y las texturas multiplican; el tono lo pone
// el material. Así el paso de tarde a crepúsculo sigue siendo un solo cambio de color.

import * as THREE from 'three';
import { LEVEL_SEED, type MetricBounds2 } from './levelData.ts';

/** Semilla numérica estable a partir del seed del nivel. */
const SEED_OFFSET = [...LEVEL_SEED].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 7);

/** Ruido determinista en [0,1). No es azar: la misma pieza se pinta igual siempre. */
export function noise(x: number, z: number): number {
  const value = Math.sin(x * 127.1 + z * 311.7 + SEED_OFFSET) * 43758.5453;
  return value - Math.floor(value);
}

/** Cuánto se acerca un punto al borde del set, de 0 (centro) a 1 (contra el muro). */
export function edgeProximity(x: number, z: number, bounds: MetricBounds2, falloff = 2.2): number {
  const toX = Math.min(x - bounds.minX, bounds.maxX - x);
  const toZ = Math.min(z - bounds.minZ, bounds.maxZ - z);
  const distance = Math.max(0, Math.min(toX, toZ));
  return 1 - Math.min(1, distance / falloff);
}

export type PaintFn = (x: number, y: number, z: number, out: THREE.Color) => void;

/** Escribe el atributo `color` de una geometría ya colocada en coordenadas de mundo. */
export function paint(geometry: THREE.BufferGeometry, paintFn: PaintFn): THREE.BufferGeometry {
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

export interface WeatheredPaintOptions {
  /** Altura a la que la pieza se considera «arriba», para el degradado de uso. */
  readonly topY: number;
  readonly bounds: MetricBounds2;
  /** Cuánto varía el tono base de pieza a pieza. */
  readonly variation?: number;
  /** Mugre acumulada en el arranque. */
  readonly grime?: number;
  /** Desgaste en la coronación, donde pega la luz y pasa la gente. */
  readonly wear?: number;
  /** Oscurecimiento contra los bordes del set. */
  readonly occlusion?: number;
}

/**
 * La pintura estándar de una superficie construida y usada: se ensucia contra el suelo, se
 * aclara arriba, se apaga contra los bordes, y cada pieza arranca de un tono propio para que
 * la repetición del kit no se note.
 */
export function weatheredPaint(options: WeatheredPaintOptions): PaintFn {
  const { topY, bounds } = options;
  const variation = options.variation ?? 0.09;
  const grimeAmount = options.grime ?? 0.2;
  const wearAmount = options.wear ?? 0.1;
  const occlusionAmount = options.occlusion ?? 0.14;
  return (x, y, z, out) => {
    const own = (noise(Math.round(x * 2), Math.round(z * 2)) - 0.5) * 2 * variation;
    const height = topY > 0 ? Math.min(1, Math.max(0, y / topY)) : 0;
    const grime = -grimeAmount * (1 - height) ** 2;
    const wear = wearAmount * height ** 2;
    const occluded = -occlusionAmount * edgeProximity(x, z, bounds);
    out.setScalar(Math.min(1.35, Math.max(0.42, 1 + own + grime + wear + occluded)));
  };
}

/**
 * Reescribe las UV proyectando desde coordenadas de **mundo** sobre el eje dominante de cada
 * cara. Es lo único que hace que un kit modular texture bien: las UV que trae `BoxGeometry` van
 * de 0 a 1 por cara, así que una losa de 1 m y un muro de 2 m mostrarían la misma textura a
 * escalas distintas, y en la junta entre dos módulos contiguos se vería el corte.
 *
 * Proyectando desde el mundo, la superficie es continua a través de las piezas y la densidad de
 * téxel es la misma en todas. Es la misma idea que un trim sheet, resuelta en el vértice.
 */
export function projectUvs(geometry: THREE.BufferGeometry, tileMeters: number): THREE.BufferGeometry {
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

/** Una caja con el pivote en su base, ya trasladada a mundo, con UV proyectadas y pintada. */
export function block(
  width: number,
  height: number,
  depth: number,
  x: number,
  baseY: number,
  z: number,
  tileMeters: number,
  paintFn: PaintFn,
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  geometry.translate(x, baseY + height / 2, z);
  return paint(projectUvs(geometry, tileMeters), paintFn);
}

/** Un cilindro con el pivote en su base. Pocos lados y `flatShading`: se lee como piedra cortada. */
export function drum(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  x: number,
  baseY: number,
  z: number,
  segments: number,
  tileMeters: number,
  paintFn: PaintFn,
): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  geometry.translate(x, baseY + height / 2, z);
  return paint(projectUvs(geometry, tileMeters), paintFn);
}

/**
 * Carga un mapa que se repite. Sin `RepeatWrapping` la proyección de mundo no tiene sentido.
 *
 * Fuera del navegador devuelve la textura vacía: los tests de arquitectura construyen los sets
 * completos en Node para medir composición y presupuesto, y ahí no hay nada que decodificar.
 * El material queda igual de válido, sólo sin imagen.
 */
export function loadTiling(url: string, colorSpace: THREE.ColorSpace): THREE.Texture {
  const texture = typeof document === 'undefined'
    ? new THREE.Texture()
    : new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = colorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Los dos mapas de un material del kit: grano y relieve. El color lo pone la paleta. */
export interface KitMaps {
  readonly grain: THREE.Texture;
  readonly normal: THREE.Texture;
}

export function loadKitMaps(grainUrl: string, normalUrl: string): KitMaps {
  return {
    grain: loadTiling(grainUrl, THREE.SRGBColorSpace),
    normal: loadTiling(normalUrl, THREE.NoColorSpace),
  };
}

/** Cuenta los triángulos de una geometría, indexada o no. */
export function triangleCount(geometry: THREE.BufferGeometry): number {
  const count = geometry.index ? geometry.index.count : geometry.getAttribute('position').count;
  return count / 3;
}
