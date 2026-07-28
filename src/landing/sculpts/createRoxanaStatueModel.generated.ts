import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

// bevelEnabled defaults to true on THREE.ExtrudeGeometry and rounds every
// corner — sharp/pointed profiles (blades, fork tines, spikes) need
// bevelEnabled: false plus lineTo()-only path segments near the tip, since a
// curve command cannot produce a true converging point.
function buildExtrudeShape(points: [number, number][], holes?: [number, number][][]): THREE.Shape {
  const shape = new THREE.Shape();
  if (points.length > 0) {
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      shape.lineTo(points[i][0], points[i][1]);
    }
  }
  // Cutouts (e.g. an oval wire-cutter hole) as THREE.Path added to shape.holes —
  // dep-free boolean subtraction via the tessellator, no CSG library needed.
  for (const loop of holes ?? []) {
    if (loop.length < 3) continue;
    const path = new THREE.Path();
    path.moveTo(loop[0][0], loop[0][1]);
    for (let i = 1; i < loop.length; i += 1) path.lineTo(loop[i][0], loop[i][1]);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

// Build an N-gon oval loop (for hole authoring from a compact {cx,cy,rx,ry} descriptor).
function ovalLoop(cx: number, cy: number, rx: number, ry: number, seg = 24): [number, number][] {
  const loop: [number, number][] = [];
  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    loop.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return loop;
}

function buildExtrudeGeometry(profile: { points: [number, number][]; depth: number; holes?: [number, number][][]; ovalHoles?: { cx: number; cy: number; rx: number; ry: number }[] }): THREE.ExtrudeGeometry {
  const holes = [...(profile.holes ?? []), ...((profile.ovalHoles ?? []).map((o) => ovalLoop(o.cx, o.cy, o.rx, o.ry)))];
  const shape = buildExtrudeShape(profile.points, holes);
  return new THREE.ExtrudeGeometry(shape, {
    depth: profile.depth,
    bevelEnabled: false,
    steps: 1,
  });
}

function buildLatheGeometry(profile: { points: [number, number][]; segments?: number }): THREE.LatheGeometry {
  const points = profile.points.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y));
  return new THREE.LatheGeometry(points, profile.segments ?? 24);
}

function buildTubeGeometry(
  path: { points: [number, number, number][]; radius?: number; radialSegments?: number; closed?: boolean },
): THREE.TubeGeometry {
  const vectors = path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(vectors, path.closed ?? false);
  const tubularSegments = Math.max(8, path.points.length * 6);
  return new THREE.TubeGeometry(curve, tubularSegments, path.radius ?? 0.05, path.radialSegments ?? 8, path.closed ?? false);
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions): THREE.MeshPhysicalMaterial {
  const textures = makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : new THREE.Color(typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F'),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clamp01(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: Math.max(1, readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: Math.max(1, readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clamp01(readLayerNumber(spec.specularIntensity, ['base'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    if (bumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = bumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    if (displacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = displacementScale;
      material.displacementBias = -displacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: Roxana Statue
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createRoxanaStatueModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "Roxana Statue";

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["stone-main"] = createSculptMaterial(
    "stone-main",
    {"id": "stone-main", "name": "Warm limestone main", "baseColor": "#9E825D", "color": "#9E825D", "albedo": {"dominant": "#9E825D", "secondary": ["#8D7352", "#C6A97C"], "samplingNotes": "Sampled from the warm limestone reference; darker in cavities and lighter on exposed planes."}, "colorVariation": {"palette": ["#9E825D", "#8D7352", "#C6A97C"], "pattern": "faceted-plane-and-cavity variation", "amplitude": 0.1, "heightCorrelation": 0.24}, "roughness": {"base": 0.78, "variation": 0.08, "map": "independent-stone-main-roughness-field", "localResponse": "higher in recessed seams, slightly lower on exposed ridges"}, "ambientOcclusion": {"cavityStrength": 0.34, "contactShadowBias": 0.38, "notes": "Independent cavity response at garment overlaps, hair locks and pedestal steps."}, "wear": {"edgeWear": 0.06, "scratches": [], "chips": []}, "dirt": {"amount": 0.06, "cavityBias": 0.82, "color": "#5A4935"}, "localOverrides": [{"id": "cavity-and-plane-variation", "region": "recesses and downward-facing planes", "baseColorShift": -0.08, "roughness": 0.8300000000000001, "evidenceRef": "front-full"}, {"id": "edge-lightening", "region": "exposed polygon ridges", "baseColorShift": 0.06, "roughness": 0.74, "evidenceRef": "front-full"}], "notes": "Warm non-metallic carved limestone; planar geometry carries most of the low-poly appearance."},
    options
  );
  materialMap["stone-light"] = createSculptMaterial(
    "stone-light",
    {"id": "stone-light", "name": "Warm limestone exposed planes", "baseColor": "#C0A476", "color": "#C0A476", "albedo": {"dominant": "#C0A476", "secondary": ["#8D7352", "#C6A97C"], "samplingNotes": "Sampled from the warm limestone reference; darker in cavities and lighter on exposed planes."}, "colorVariation": {"palette": ["#C0A476", "#8D7352", "#C6A97C"], "pattern": "faceted-plane-and-cavity variation", "amplitude": 0.1, "heightCorrelation": 0.24}, "roughness": {"base": 0.72, "variation": 0.08, "map": "independent-stone-light-roughness-field", "localResponse": "higher in recessed seams, slightly lower on exposed ridges"}, "ambientOcclusion": {"cavityStrength": 0.34, "contactShadowBias": 0.38, "notes": "Independent cavity response at garment overlaps, hair locks and pedestal steps."}, "wear": {"edgeWear": 0.06, "scratches": [], "chips": []}, "dirt": {"amount": 0.06, "cavityBias": 0.82, "color": "#5A4935"}, "localOverrides": [{"id": "cavity-and-plane-variation", "region": "recesses and downward-facing planes", "baseColorShift": -0.08, "roughness": 0.77, "evidenceRef": "front-full"}, {"id": "edge-lightening", "region": "exposed polygon ridges", "baseColorShift": 0.06, "roughness": 0.6799999999999999, "evidenceRef": "front-full"}], "notes": "Warm non-metallic carved limestone; planar geometry carries most of the low-poly appearance."},
    options
  );
  materialMap["stone-dark"] = createSculptMaterial(
    "stone-dark",
    {"id": "stone-dark", "name": "Warm limestone cavities", "baseColor": "#6F5A40", "color": "#6F5A40", "albedo": {"dominant": "#6F5A40", "secondary": ["#8D7352", "#C6A97C"], "samplingNotes": "Sampled from the warm limestone reference; darker in cavities and lighter on exposed planes."}, "colorVariation": {"palette": ["#6F5A40", "#8D7352", "#C6A97C"], "pattern": "faceted-plane-and-cavity variation", "amplitude": 0.1, "heightCorrelation": 0.24}, "roughness": {"base": 0.84, "variation": 0.08, "map": "independent-stone-dark-roughness-field", "localResponse": "higher in recessed seams, slightly lower on exposed ridges"}, "ambientOcclusion": {"cavityStrength": 0.34, "contactShadowBias": 0.38, "notes": "Independent cavity response at garment overlaps, hair locks and pedestal steps."}, "wear": {"edgeWear": 0.06, "scratches": [], "chips": []}, "dirt": {"amount": 0.06, "cavityBias": 0.82, "color": "#5A4935"}, "localOverrides": [{"id": "cavity-and-plane-variation", "region": "recesses and downward-facing planes", "baseColorShift": -0.08, "roughness": 0.89, "evidenceRef": "front-full"}, {"id": "edge-lightening", "region": "exposed polygon ridges", "baseColorShift": 0.06, "roughness": 0.7999999999999999, "evidenceRef": "front-full"}], "notes": "Warm non-metallic carved limestone; planar geometry carries most of the low-poly appearance."},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const attachment_pedestal_base_0 = null;
  const endpoint_pedestal_base_0 = makeAttachmentEndpoint(attachment_pedestal_base_0);
  const node_pedestal_base_0 = new THREE.Group();
  node_pedestal_base_0.name = "Pedestal root and lower foot__pivot";
  if (endpoint_pedestal_base_0) {
    node_pedestal_base_0.position.copy(endpoint_pedestal_base_0.start);
    node_pedestal_base_0.rotation.set(0, 0, 0);
    node_pedestal_base_0.scale.set(1, 1, 1);
  } else {
    node_pedestal_base_0.position.set(0.0, 0.1, 0.0);
    node_pedestal_base_0.rotation.set(0.0, 0.0, 0.0);
    node_pedestal_base_0.scale.set(1.48, 0.2, 1.1);
  }
  node_pedestal_base_0.userData.sculptComponent = {"id": "pedestal-base", "name": "Pedestal root and lower foot", "level": "macro", "role": "root", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Architectural rectangular foot with hard stepped faces.", "geometryDescriptor": {"topologyIntent": "Architectural rectangular foot with hard stepped faces.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.48, "height": 0.2, "depth": 1.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.1, 0], "rotation": [0, 0, 0], "scale": [1.48, 0.2, 1.1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "base", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "compound statue proxy root"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-base", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "stepped-beveled-levels", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Hard single-segment chamfers catch the reference edge highlights."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": ["stepped-beveled-levels"], "fidelityTier": "blockout"};
  node_pedestal_base_0.userData.actionProfile = {"animationRole": "root", "pivot": {"mode": "base", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "compound statue proxy root"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-base", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_pedestal_base_0);
  nodes["pedestal-base"] = node_pedestal_base_0;
  const mesh_pedestal_base_0Geometry = endpoint_pedestal_base_0
    ? new THREE.CylinderGeometry(endpoint_pedestal_base_0.endRadius, endpoint_pedestal_base_0.baseRadius, endpoint_pedestal_base_0.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_pedestal_base_0 = new THREE.Mesh(
    mesh_pedestal_base_0Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pedestal_base_0.name = "Pedestal root and lower foot";
  if (endpoint_pedestal_base_0) {
    mesh_pedestal_base_0.position.copy(endpoint_pedestal_base_0.midpoint);
    mesh_pedestal_base_0.quaternion.copy(endpoint_pedestal_base_0.quaternion);
  }
  mesh_pedestal_base_0.castShadow = options.castShadow ?? true;
  mesh_pedestal_base_0.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestal_base_0.userData.sculptComponent = {"id": "pedestal-base", "name": "Pedestal root and lower foot", "level": "macro", "role": "root", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Architectural rectangular foot with hard stepped faces.", "geometryDescriptor": {"topologyIntent": "Architectural rectangular foot with hard stepped faces.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.48, "height": 0.2, "depth": 1.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.1, 0], "rotation": [0, 0, 0], "scale": [1.48, 0.2, 1.1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "base", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "compound statue proxy root"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-base", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "stepped-beveled-levels", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Hard single-segment chamfers catch the reference edge highlights."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": ["stepped-beveled-levels"], "fidelityTier": "blockout"};
  node_pedestal_base_0.add(mesh_pedestal_base_0);
  meshes["pedestal-base"] = mesh_pedestal_base_0;
  colliders["pedestal-base"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "compound statue proxy root"};
  destructionGroups["pedestal-base"] ??= [];
  destructionGroups["pedestal-base"].push(node_pedestal_base_0);

  const attachment_pedestal_shaft_1 = null;
  const endpoint_pedestal_shaft_1 = makeAttachmentEndpoint(attachment_pedestal_shaft_1);
  const node_pedestal_shaft_1 = new THREE.Group();
  node_pedestal_shaft_1.name = "Pedestal rectangular shaft__pivot";
  if (endpoint_pedestal_shaft_1) {
    node_pedestal_shaft_1.position.copy(endpoint_pedestal_shaft_1.start);
    node_pedestal_shaft_1.rotation.set(0, 0, 0);
    node_pedestal_shaft_1.scale.set(1, 1, 1);
  } else {
    node_pedestal_shaft_1.position.set(0.0, 0.6699999999999999, 0.0);
    node_pedestal_shaft_1.rotation.set(0.0, 0.0, 0.0);
    node_pedestal_shaft_1.scale.set(1.08, 0.82, 0.82);
  }
  node_pedestal_shaft_1.userData.sculptComponent = {"id": "pedestal-shaft", "name": "Pedestal rectangular shaft", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Tall rigid architectural shaft.", "geometryDescriptor": {"topologyIntent": "Tall rigid architectural shaft.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.08, "height": 0.82, "depth": 0.82, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.6699999999999999, 0], "rotation": [0, 0, 0], "scale": [1.08, 0.82, 0.82]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-shaft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "shaft-corner-planes", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Narrow corner bevels preserve the stone monument profile."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": ["shaft-corner-planes"], "fidelityTier": "blockout"};
  node_pedestal_shaft_1.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-shaft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_pedestal_shaft_1);
  nodes["pedestal-shaft"] = node_pedestal_shaft_1;
  const mesh_pedestal_shaft_1Geometry = endpoint_pedestal_shaft_1
    ? new THREE.CylinderGeometry(endpoint_pedestal_shaft_1.endRadius, endpoint_pedestal_shaft_1.baseRadius, endpoint_pedestal_shaft_1.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_pedestal_shaft_1 = new THREE.Mesh(
    mesh_pedestal_shaft_1Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pedestal_shaft_1.name = "Pedestal rectangular shaft";
  if (endpoint_pedestal_shaft_1) {
    mesh_pedestal_shaft_1.position.copy(endpoint_pedestal_shaft_1.midpoint);
    mesh_pedestal_shaft_1.quaternion.copy(endpoint_pedestal_shaft_1.quaternion);
  }
  mesh_pedestal_shaft_1.castShadow = options.castShadow ?? true;
  mesh_pedestal_shaft_1.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestal_shaft_1.userData.sculptComponent = {"id": "pedestal-shaft", "name": "Pedestal rectangular shaft", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Tall rigid architectural shaft.", "geometryDescriptor": {"topologyIntent": "Tall rigid architectural shaft.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.08, "height": 0.82, "depth": 0.82, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.6699999999999999, 0], "rotation": [0, 0, 0], "scale": [1.08, 0.82, 0.82]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-shaft", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "shaft-corner-planes", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Narrow corner bevels preserve the stone monument profile."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": ["shaft-corner-planes"], "fidelityTier": "blockout"};
  node_pedestal_shaft_1.add(mesh_pedestal_shaft_1);
  meshes["pedestal-shaft"] = mesh_pedestal_shaft_1;
  colliders["pedestal-shaft"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["pedestal-shaft"] ??= [];
  destructionGroups["pedestal-shaft"].push(node_pedestal_shaft_1);

  const attachment_figure_skirt_2 = null;
  const endpoint_figure_skirt_2 = makeAttachmentEndpoint(attachment_figure_skirt_2);
  const node_figure_skirt_2 = new THREE.Group();
  node_figure_skirt_2.name = "Floor-length dress and skirt mass__pivot";
  if (endpoint_figure_skirt_2) {
    node_figure_skirt_2.position.copy(endpoint_figure_skirt_2.start);
    node_figure_skirt_2.rotation.set(0, 0, 0);
    node_figure_skirt_2.scale.set(1, 1, 1);
  } else {
    node_figure_skirt_2.position.set(0.0, 1.9000000000000001, 0.0);
    node_figure_skirt_2.rotation.set(0.0, 0.0, 0.0);
    node_figure_skirt_2.scale.set(1.0, 1.0, 1.0);
  }
  node_figure_skirt_2.userData.sculptComponent = {"id": "figure-skirt", "name": "Floor-length dress and skirt mass", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "One continuous widening garment volume with faceted vertical folds.", "geometryDescriptor": {"topologyIntent": "One continuous widening garment volume with faceted vertical folds.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "latheProfile": {"points": [[0.46, -0.81], [0.44, -0.68], [0.38, -0.25], [0.31, 0.35], [0.25, 0.81]], "segments": 12}}, "parent": null, "attachment": null, "dimensions": {"width": 0.92, "height": 1.62, "depth": 0.6, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.9000000000000001, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "figure-skirt", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "vertical-faceted-folds", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Irregular triangular fold planes widen toward the hem."}, {"id": "hem-undulation", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Hem alternates shallow peaks above two visible shoes."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full", "back-full", "left-full"], "details": ["vertical-faceted-folds", "hem-undulation"], "fidelityTier": "blockout"};
  node_figure_skirt_2.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "figure-skirt", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_figure_skirt_2);
  nodes["figure-skirt"] = node_figure_skirt_2;
  const mesh_figure_skirt_2Geometry = endpoint_figure_skirt_2
    ? new THREE.CylinderGeometry(endpoint_figure_skirt_2.endRadius, endpoint_figure_skirt_2.baseRadius, endpoint_figure_skirt_2.length, 32, 12)
    : buildLatheGeometry({"points": [[0.46, -0.81], [0.44, -0.68], [0.38, -0.25], [0.31, 0.35], [0.25, 0.81]], "segments": 12});
  const mesh_figure_skirt_2 = new THREE.Mesh(
    mesh_figure_skirt_2Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_figure_skirt_2.name = "Floor-length dress and skirt mass";
  if (endpoint_figure_skirt_2) {
    mesh_figure_skirt_2.position.copy(endpoint_figure_skirt_2.midpoint);
    mesh_figure_skirt_2.quaternion.copy(endpoint_figure_skirt_2.quaternion);
  }
  mesh_figure_skirt_2.castShadow = options.castShadow ?? true;
  mesh_figure_skirt_2.receiveShadow = options.receiveShadow ?? true;
  mesh_figure_skirt_2.userData.sculptComponent = {"id": "figure-skirt", "name": "Floor-length dress and skirt mass", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "One continuous widening garment volume with faceted vertical folds.", "geometryDescriptor": {"topologyIntent": "One continuous widening garment volume with faceted vertical folds.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "latheProfile": {"points": [[0.46, -0.81], [0.44, -0.68], [0.38, -0.25], [0.31, 0.35], [0.25, 0.81]], "segments": 12}}, "parent": null, "attachment": null, "dimensions": {"width": 0.92, "height": 1.62, "depth": 0.6, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.9000000000000001, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "figure-skirt", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "vertical-faceted-folds", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Irregular triangular fold planes widen toward the hem."}, {"id": "hem-undulation", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Hem alternates shallow peaks above two visible shoes."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full", "back-full", "left-full"], "details": ["vertical-faceted-folds", "hem-undulation"], "fidelityTier": "blockout"};
  node_figure_skirt_2.add(mesh_figure_skirt_2);
  meshes["figure-skirt"] = mesh_figure_skirt_2;
  colliders["figure-skirt"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["figure-skirt"] ??= [];
  destructionGroups["figure-skirt"].push(node_figure_skirt_2);

  const attachment_coat_shell_3 = null;
  const endpoint_coat_shell_3 = makeAttachmentEndpoint(attachment_coat_shell_3);
  const node_coat_shell_3 = new THREE.Group();
  node_coat_shell_3.name = "Long fitted period coat__pivot";
  if (endpoint_coat_shell_3) {
    node_coat_shell_3.position.copy(endpoint_coat_shell_3.start);
    node_coat_shell_3.rotation.set(0, 0, 0);
    node_coat_shell_3.scale.set(1, 1, 1);
  } else {
    node_coat_shell_3.position.set(0.0, 2.73, 0.0);
    node_coat_shell_3.rotation.set(0.0, 0.0, 0.0);
    node_coat_shell_3.scale.set(0.82, 1.42, 0.48);
  }
  node_coat_shell_3.userData.sculptComponent = {"id": "coat-shell", "name": "Long fitted period coat", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "conforming-shell", "topologyRationale": "Fitted garment shell follows torso and hips before splitting into long tails.", "geometryDescriptor": {"topologyIntent": "Fitted garment shell follows torso and hips before splitting into long tails.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.82, "height": 1.42, "depth": 0.48, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 2.73, 0], "rotation": [0, 0, 0], "scale": [0.82, 1.42, 0.48]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-shell", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "front-split-shells", "type": "seam", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "seam", "confidence": 0.9, "notes": "Deep vertical split reveals skirt from waist to coat hem."}, {"id": "waist-cinch", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Narrow waist transitions into flared tails."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full", "back-full"], "details": ["front-split-shells", "waist-cinch"], "fidelityTier": "blockout"};
  node_coat_shell_3.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-shell", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_coat_shell_3);
  nodes["coat-shell"] = node_coat_shell_3;
  const mesh_coat_shell_3Geometry = endpoint_coat_shell_3
    ? new THREE.CylinderGeometry(endpoint_coat_shell_3.endRadius, endpoint_coat_shell_3.baseRadius, endpoint_coat_shell_3.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_coat_shell_3 = new THREE.Mesh(
    mesh_coat_shell_3Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_coat_shell_3.name = "Long fitted period coat";
  if (endpoint_coat_shell_3) {
    mesh_coat_shell_3.position.copy(endpoint_coat_shell_3.midpoint);
    mesh_coat_shell_3.quaternion.copy(endpoint_coat_shell_3.quaternion);
  }
  mesh_coat_shell_3.castShadow = options.castShadow ?? true;
  mesh_coat_shell_3.receiveShadow = options.receiveShadow ?? true;
  mesh_coat_shell_3.userData.sculptComponent = {"id": "coat-shell", "name": "Long fitted period coat", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "conforming-shell", "topologyRationale": "Fitted garment shell follows torso and hips before splitting into long tails.", "geometryDescriptor": {"topologyIntent": "Fitted garment shell follows torso and hips before splitting into long tails.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.82, "height": 1.42, "depth": 0.48, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 2.73, 0], "rotation": [0, 0, 0], "scale": [0.82, 1.42, 0.48]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-shell", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "front-split-shells", "type": "seam", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "seam", "confidence": 0.9, "notes": "Deep vertical split reveals skirt from waist to coat hem."}, {"id": "waist-cinch", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Narrow waist transitions into flared tails."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full", "back-full"], "details": ["front-split-shells", "waist-cinch"], "fidelityTier": "blockout"};
  node_coat_shell_3.add(mesh_coat_shell_3);
  meshes["coat-shell"] = mesh_coat_shell_3;
  colliders["coat-shell"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["coat-shell"] ??= [];
  destructionGroups["coat-shell"].push(node_coat_shell_3);

  const attachment_head_hair_group_4 = null;
  const endpoint_head_hair_group_4 = makeAttachmentEndpoint(attachment_head_hair_group_4);
  const node_head_hair_group_4 = new THREE.Group();
  node_head_hair_group_4.name = "Head and long hair silhouette__pivot";
  if (endpoint_head_hair_group_4) {
    node_head_hair_group_4.position.copy(endpoint_head_hair_group_4.start);
    node_head_hair_group_4.rotation.set(0, 0, 0);
    node_head_hair_group_4.scale.set(1, 1, 1);
  } else {
    node_head_hair_group_4.position.set(0.0, 3.66, 0.0);
    node_head_hair_group_4.rotation.set(0.0, 0.0, 0.0);
    node_head_hair_group_4.scale.set(0.48, 0.62, 0.42);
  }
  node_head_hair_group_4.userData.sculptComponent = {"id": "head-hair-group", "name": "Head and long hair silhouette", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Connected head and crown mass establishes the portrait silhouette.", "geometryDescriptor": {"topologyIntent": "Connected head and crown mass establishes the portrait silhouette.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.48, "height": 0.62, "depth": 0.42, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [0.48, 0.62, 0.42]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "head-hair-group", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "portrait-envelope", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Long narrow head and full crown remain centered above shoulders."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "right-head", "back-head", "left-head"], "details": ["portrait-envelope"], "fidelityTier": "blockout"};
  node_head_hair_group_4.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "head-hair-group", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_head_hair_group_4);
  nodes["head-hair-group"] = node_head_hair_group_4;
  const mesh_head_hair_group_4Geometry = endpoint_head_hair_group_4
    ? new THREE.CylinderGeometry(endpoint_head_hair_group_4.endRadius, endpoint_head_hair_group_4.baseRadius, endpoint_head_hair_group_4.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_head_hair_group_4 = new THREE.Mesh(
    mesh_head_hair_group_4Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_head_hair_group_4.name = "Head and long hair silhouette";
  if (endpoint_head_hair_group_4) {
    mesh_head_hair_group_4.position.copy(endpoint_head_hair_group_4.midpoint);
    mesh_head_hair_group_4.quaternion.copy(endpoint_head_hair_group_4.quaternion);
  }
  mesh_head_hair_group_4.castShadow = options.castShadow ?? true;
  mesh_head_hair_group_4.receiveShadow = options.receiveShadow ?? true;
  mesh_head_hair_group_4.userData.sculptComponent = {"id": "head-hair-group", "name": "Head and long hair silhouette", "level": "macro", "role": "static-part", "importance": 1, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Connected head and crown mass establishes the portrait silhouette.", "geometryDescriptor": {"topologyIntent": "Connected head and crown mass establishes the portrait silhouette.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.48, "height": 0.62, "depth": 0.42, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [0.48, 0.62, 0.42]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "head-hair-group", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "portrait-envelope", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Long narrow head and full crown remain centered above shoulders."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "right-head", "back-head", "left-head"], "details": ["portrait-envelope"], "fidelityTier": "blockout"};
  node_head_hair_group_4.add(mesh_head_hair_group_4);
  meshes["head-hair-group"] = mesh_head_hair_group_4;
  colliders["head-hair-group"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["head-hair-group"] ??= [];
  destructionGroups["head-hair-group"].push(node_head_hair_group_4);

  const attachment_pedestal_step_low_5 = null;
  const endpoint_pedestal_step_low_5 = makeAttachmentEndpoint(attachment_pedestal_step_low_5);
  const node_pedestal_step_low_5 = new THREE.Group();
  node_pedestal_step_low_5.name = "Lower pedestal step__pivot";
  if (endpoint_pedestal_step_low_5) {
    node_pedestal_step_low_5.position.copy(endpoint_pedestal_step_low_5.start);
    node_pedestal_step_low_5.rotation.set(0, 0, 0);
    node_pedestal_step_low_5.scale.set(1, 1, 1);
  } else {
    node_pedestal_step_low_5.position.set(0.0, 0.23, 0.0);
    node_pedestal_step_low_5.rotation.set(0.0, 0.0, 0.0);
    node_pedestal_step_low_5.scale.set(1.34, 0.1, 0.98);
  }
  node_pedestal_step_low_5.userData.sculptComponent = {"id": "pedestal-step-low", "name": "Lower pedestal step", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Discrete rigid step.", "geometryDescriptor": {"topologyIntent": "Discrete rigid step.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.34, "height": 0.1, "depth": 0.98, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.23, 0], "rotation": [0, 0, 0], "scale": [1.34, 0.1, 0.98]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-step-low", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_step_low_5.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-step-low", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_pedestal_step_low_5);
  nodes["pedestal-step-low"] = node_pedestal_step_low_5;
  const mesh_pedestal_step_low_5Geometry = endpoint_pedestal_step_low_5
    ? new THREE.CylinderGeometry(endpoint_pedestal_step_low_5.endRadius, endpoint_pedestal_step_low_5.baseRadius, endpoint_pedestal_step_low_5.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_pedestal_step_low_5 = new THREE.Mesh(
    mesh_pedestal_step_low_5Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pedestal_step_low_5.name = "Lower pedestal step";
  if (endpoint_pedestal_step_low_5) {
    mesh_pedestal_step_low_5.position.copy(endpoint_pedestal_step_low_5.midpoint);
    mesh_pedestal_step_low_5.quaternion.copy(endpoint_pedestal_step_low_5.quaternion);
  }
  mesh_pedestal_step_low_5.castShadow = options.castShadow ?? true;
  mesh_pedestal_step_low_5.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestal_step_low_5.userData.sculptComponent = {"id": "pedestal-step-low", "name": "Lower pedestal step", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Discrete rigid step.", "geometryDescriptor": {"topologyIntent": "Discrete rigid step.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.34, "height": 0.1, "depth": 0.98, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 0.23, 0], "rotation": [0, 0, 0], "scale": [1.34, 0.1, 0.98]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-step-low", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_step_low_5.add(mesh_pedestal_step_low_5);
  meshes["pedestal-step-low"] = mesh_pedestal_step_low_5;
  colliders["pedestal-step-low"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["pedestal-step-low"] ??= [];
  destructionGroups["pedestal-step-low"].push(node_pedestal_step_low_5);

  const attachment_pedestal_cornice_6 = null;
  const endpoint_pedestal_cornice_6 = makeAttachmentEndpoint(attachment_pedestal_cornice_6);
  const node_pedestal_cornice_6 = new THREE.Group();
  node_pedestal_cornice_6.name = "Pedestal cornice__pivot";
  if (endpoint_pedestal_cornice_6) {
    node_pedestal_cornice_6.position.copy(endpoint_pedestal_cornice_6.start);
    node_pedestal_cornice_6.rotation.set(0, 0, 0);
    node_pedestal_cornice_6.scale.set(1, 1, 1);
  } else {
    node_pedestal_cornice_6.position.set(0.0, 1.11, 0.0);
    node_pedestal_cornice_6.rotation.set(0.0, 0.0, 0.0);
    node_pedestal_cornice_6.scale.set(1.3, 0.13, 0.98);
  }
  node_pedestal_cornice_6.userData.sculptComponent = {"id": "pedestal-cornice", "name": "Pedestal cornice", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Projecting rigid cornice above shaft.", "geometryDescriptor": {"topologyIntent": "Projecting rigid cornice above shaft.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.3, "height": 0.13, "depth": 0.98, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.11, 0], "rotation": [0, 0, 0], "scale": [1.3, 0.13, 0.98]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cornice", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_cornice_6.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cornice", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_pedestal_cornice_6);
  nodes["pedestal-cornice"] = node_pedestal_cornice_6;
  const mesh_pedestal_cornice_6Geometry = endpoint_pedestal_cornice_6
    ? new THREE.CylinderGeometry(endpoint_pedestal_cornice_6.endRadius, endpoint_pedestal_cornice_6.baseRadius, endpoint_pedestal_cornice_6.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_pedestal_cornice_6 = new THREE.Mesh(
    mesh_pedestal_cornice_6Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pedestal_cornice_6.name = "Pedestal cornice";
  if (endpoint_pedestal_cornice_6) {
    mesh_pedestal_cornice_6.position.copy(endpoint_pedestal_cornice_6.midpoint);
    mesh_pedestal_cornice_6.quaternion.copy(endpoint_pedestal_cornice_6.quaternion);
  }
  mesh_pedestal_cornice_6.castShadow = options.castShadow ?? true;
  mesh_pedestal_cornice_6.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestal_cornice_6.userData.sculptComponent = {"id": "pedestal-cornice", "name": "Pedestal cornice", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Projecting rigid cornice above shaft.", "geometryDescriptor": {"topologyIntent": "Projecting rigid cornice above shaft.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.3, "height": 0.13, "depth": 0.98, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.11, 0], "rotation": [0, 0, 0], "scale": [1.3, 0.13, 0.98]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cornice", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_cornice_6.add(mesh_pedestal_cornice_6);
  meshes["pedestal-cornice"] = mesh_pedestal_cornice_6;
  colliders["pedestal-cornice"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["pedestal-cornice"] ??= [];
  destructionGroups["pedestal-cornice"].push(node_pedestal_cornice_6);

  const attachment_pedestal_cap_7 = null;
  const endpoint_pedestal_cap_7 = makeAttachmentEndpoint(attachment_pedestal_cap_7);
  const node_pedestal_cap_7 = new THREE.Group();
  node_pedestal_cap_7.name = "Statue top cap slab__pivot";
  if (endpoint_pedestal_cap_7) {
    node_pedestal_cap_7.position.copy(endpoint_pedestal_cap_7.start);
    node_pedestal_cap_7.rotation.set(0, 0, 0);
    node_pedestal_cap_7.scale.set(1, 1, 1);
  } else {
    node_pedestal_cap_7.position.set(0.0, 1.2200000000000002, 0.0);
    node_pedestal_cap_7.rotation.set(0.0, 0.0, 0.0);
    node_pedestal_cap_7.scale.set(1.18, 0.09, 0.88);
  }
  node_pedestal_cap_7.userData.sculptComponent = {"id": "pedestal-cap", "name": "Statue top cap slab", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Top slab beneath the figure.", "geometryDescriptor": {"topologyIntent": "Top slab beneath the figure.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.18, "height": 0.09, "depth": 0.88, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.2200000000000002, 0], "rotation": [0, 0, 0], "scale": [1.18, 0.09, 0.88]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_cap_7.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_pedestal_cap_7);
  nodes["pedestal-cap"] = node_pedestal_cap_7;
  const mesh_pedestal_cap_7Geometry = endpoint_pedestal_cap_7
    ? new THREE.CylinderGeometry(endpoint_pedestal_cap_7.endRadius, endpoint_pedestal_cap_7.baseRadius, endpoint_pedestal_cap_7.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_pedestal_cap_7 = new THREE.Mesh(
    mesh_pedestal_cap_7Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pedestal_cap_7.name = "Statue top cap slab";
  if (endpoint_pedestal_cap_7) {
    mesh_pedestal_cap_7.position.copy(endpoint_pedestal_cap_7.midpoint);
    mesh_pedestal_cap_7.quaternion.copy(endpoint_pedestal_cap_7.quaternion);
  }
  mesh_pedestal_cap_7.castShadow = options.castShadow ?? true;
  mesh_pedestal_cap_7.receiveShadow = options.receiveShadow ?? true;
  mesh_pedestal_cap_7.userData.sculptComponent = {"id": "pedestal-cap", "name": "Statue top cap slab", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Top slab beneath the figure.", "geometryDescriptor": {"topologyIntent": "Top slab beneath the figure.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 1.18, "height": 0.09, "depth": 0.88, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 1.2200000000000002, 0], "rotation": [0, 0, 0], "scale": [1.18, 0.09, 0.88]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "pedestal-cap", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-pedestal"], "details": [], "fidelityTier": "blockout"};
  node_pedestal_cap_7.add(mesh_pedestal_cap_7);
  meshes["pedestal-cap"] = mesh_pedestal_cap_7;
  colliders["pedestal-cap"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["pedestal-cap"] ??= [];
  destructionGroups["pedestal-cap"].push(node_pedestal_cap_7);

  const attachment_torso_8 = null;
  const endpoint_torso_8 = makeAttachmentEndpoint(attachment_torso_8);
  const node_torso_8 = new THREE.Group();
  node_torso_8.name = "Fitted torso and waistcoat__pivot";
  if (endpoint_torso_8) {
    node_torso_8.position.copy(endpoint_torso_8.start);
    node_torso_8.rotation.set(0, 0, 0);
    node_torso_8.scale.set(1, 1, 1);
  } else {
    node_torso_8.position.set(0.0, 2.92, -0.01);
    node_torso_8.rotation.set(0.0, 0.0, 0.0);
    node_torso_8.scale.set(0.57, 0.72, 0.35);
  }
  node_torso_8.userData.sculptComponent = {"id": "torso", "name": "Fitted torso and waistcoat", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered human torso beneath the coat shell.", "geometryDescriptor": {"topologyIntent": "Tapered human torso beneath the coat shell.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.57, "height": 0.72, "depth": 0.35, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 2.92, -0.01], "rotation": [0, 0, 0], "scale": [0.57, 0.72, 0.35]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "torso", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_torso_8.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "torso", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_torso_8);
  nodes["torso"] = node_torso_8;
  const mesh_torso_8Geometry = endpoint_torso_8
    ? new THREE.CylinderGeometry(endpoint_torso_8.endRadius, endpoint_torso_8.baseRadius, endpoint_torso_8.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_torso_8 = new THREE.Mesh(
    mesh_torso_8Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_torso_8.name = "Fitted torso and waistcoat";
  if (endpoint_torso_8) {
    mesh_torso_8.position.copy(endpoint_torso_8.midpoint);
    mesh_torso_8.quaternion.copy(endpoint_torso_8.quaternion);
  }
  mesh_torso_8.castShadow = options.castShadow ?? true;
  mesh_torso_8.receiveShadow = options.receiveShadow ?? true;
  mesh_torso_8.userData.sculptComponent = {"id": "torso", "name": "Fitted torso and waistcoat", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered human torso beneath the coat shell.", "geometryDescriptor": {"topologyIntent": "Tapered human torso beneath the coat shell.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.57, "height": 0.72, "depth": 0.35, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 2.92, -0.01], "rotation": [0, 0, 0], "scale": [0.57, 0.72, 0.35]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "torso", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_torso_8.add(mesh_torso_8);
  meshes["torso"] = mesh_torso_8;
  colliders["torso"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["torso"] ??= [];
  destructionGroups["torso"].push(node_torso_8);

  const attachment_coat_tail_left_9 = null;
  const endpoint_coat_tail_left_9 = makeAttachmentEndpoint(attachment_coat_tail_left_9);
  const node_coat_tail_left_9 = new THREE.Group();
  node_coat_tail_left_9.name = "Left long coat panel__pivot";
  if (endpoint_coat_tail_left_9) {
    node_coat_tail_left_9.position.copy(endpoint_coat_tail_left_9.start);
    node_coat_tail_left_9.rotation.set(0, 0, 0);
    node_coat_tail_left_9.scale.set(1, 1, 1);
  } else {
    node_coat_tail_left_9.position.set(-0.24, 2.24, 0.25);
    node_coat_tail_left_9.rotation.set(0.0, 0.0, 0.0);
    node_coat_tail_left_9.scale.set(1.0, 1.0, 1.0);
  }
  node_coat_tail_left_9.userData.sculptComponent = {"id": "coat-tail-left", "name": "Left long coat panel", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "extrude", "topologyClass": "conforming-shell", "topologyRationale": "Thin angular garment panel conforming over skirt.", "geometryDescriptor": {"topologyIntent": "Thin angular garment panel conforming over skirt.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "profile2D": {"points": [[-0.2, -0.61], [0.18, -0.56], [0.15, 0.6], [-0.13, 0.56]], "depth": 0.09}}, "parent": null, "attachment": null, "dimensions": {"width": 0.42, "height": 1.22, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.24, 2.24, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "tail-edge-plane-left", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Outer coat-panel edge flares gently toward hem."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "left-full"], "details": ["tail-edge-plane-left"], "fidelityTier": "blockout"};
  node_coat_tail_left_9.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_coat_tail_left_9);
  nodes["coat-tail-left"] = node_coat_tail_left_9;
  const mesh_coat_tail_left_9Geometry = endpoint_coat_tail_left_9
    ? new THREE.CylinderGeometry(endpoint_coat_tail_left_9.endRadius, endpoint_coat_tail_left_9.baseRadius, endpoint_coat_tail_left_9.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.2, -0.61], [0.18, -0.56], [0.15, 0.6], [-0.13, 0.56]], "depth": 0.09});
  const mesh_coat_tail_left_9 = new THREE.Mesh(
    mesh_coat_tail_left_9Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_coat_tail_left_9.name = "Left long coat panel";
  if (endpoint_coat_tail_left_9) {
    mesh_coat_tail_left_9.position.copy(endpoint_coat_tail_left_9.midpoint);
    mesh_coat_tail_left_9.quaternion.copy(endpoint_coat_tail_left_9.quaternion);
  }
  mesh_coat_tail_left_9.castShadow = options.castShadow ?? true;
  mesh_coat_tail_left_9.receiveShadow = options.receiveShadow ?? true;
  mesh_coat_tail_left_9.userData.sculptComponent = {"id": "coat-tail-left", "name": "Left long coat panel", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "extrude", "topologyClass": "conforming-shell", "topologyRationale": "Thin angular garment panel conforming over skirt.", "geometryDescriptor": {"topologyIntent": "Thin angular garment panel conforming over skirt.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "profile2D": {"points": [[-0.2, -0.61], [0.18, -0.56], [0.15, 0.6], [-0.13, 0.56]], "depth": 0.09}}, "parent": null, "attachment": null, "dimensions": {"width": 0.42, "height": 1.22, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.24, 2.24, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "tail-edge-plane-left", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Outer coat-panel edge flares gently toward hem."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "left-full"], "details": ["tail-edge-plane-left"], "fidelityTier": "blockout"};
  node_coat_tail_left_9.add(mesh_coat_tail_left_9);
  meshes["coat-tail-left"] = mesh_coat_tail_left_9;
  colliders["coat-tail-left"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["coat-tail-left"] ??= [];
  destructionGroups["coat-tail-left"].push(node_coat_tail_left_9);

  const attachment_coat_tail_right_10 = null;
  const endpoint_coat_tail_right_10 = makeAttachmentEndpoint(attachment_coat_tail_right_10);
  const node_coat_tail_right_10 = new THREE.Group();
  node_coat_tail_right_10.name = "Right long coat panel__pivot";
  if (endpoint_coat_tail_right_10) {
    node_coat_tail_right_10.position.copy(endpoint_coat_tail_right_10.start);
    node_coat_tail_right_10.rotation.set(0, 0, 0);
    node_coat_tail_right_10.scale.set(1, 1, 1);
  } else {
    node_coat_tail_right_10.position.set(0.24, 2.24, 0.25);
    node_coat_tail_right_10.rotation.set(0.0, 0.0, 0.0);
    node_coat_tail_right_10.scale.set(1.0, 1.0, 1.0);
  }
  node_coat_tail_right_10.userData.sculptComponent = {"id": "coat-tail-right", "name": "Right long coat panel", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "extrude", "topologyClass": "conforming-shell", "topologyRationale": "Thin angular garment panel conforming over skirt.", "geometryDescriptor": {"topologyIntent": "Thin angular garment panel conforming over skirt.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "profile2D": {"points": [[-0.18, -0.56], [0.2, -0.61], [0.13, 0.56], [-0.15, 0.6]], "depth": 0.09}}, "parent": null, "attachment": null, "dimensions": {"width": 0.42, "height": 1.22, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.24, 2.24, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "tail-edge-plane-right", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Outer coat-panel edge flares gently toward hem."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": ["tail-edge-plane-right"], "fidelityTier": "blockout"};
  node_coat_tail_right_10.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_coat_tail_right_10);
  nodes["coat-tail-right"] = node_coat_tail_right_10;
  const mesh_coat_tail_right_10Geometry = endpoint_coat_tail_right_10
    ? new THREE.CylinderGeometry(endpoint_coat_tail_right_10.endRadius, endpoint_coat_tail_right_10.baseRadius, endpoint_coat_tail_right_10.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.18, -0.56], [0.2, -0.61], [0.13, 0.56], [-0.15, 0.6]], "depth": 0.09});
  const mesh_coat_tail_right_10 = new THREE.Mesh(
    mesh_coat_tail_right_10Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_coat_tail_right_10.name = "Right long coat panel";
  if (endpoint_coat_tail_right_10) {
    mesh_coat_tail_right_10.position.copy(endpoint_coat_tail_right_10.midpoint);
    mesh_coat_tail_right_10.quaternion.copy(endpoint_coat_tail_right_10.quaternion);
  }
  mesh_coat_tail_right_10.castShadow = options.castShadow ?? true;
  mesh_coat_tail_right_10.receiveShadow = options.receiveShadow ?? true;
  mesh_coat_tail_right_10.userData.sculptComponent = {"id": "coat-tail-right", "name": "Right long coat panel", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "extrude", "topologyClass": "conforming-shell", "topologyRationale": "Thin angular garment panel conforming over skirt.", "geometryDescriptor": {"topologyIntent": "Thin angular garment panel conforming over skirt.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "profile2D": {"points": [[-0.18, -0.56], [0.2, -0.61], [0.13, 0.56], [-0.15, 0.6]], "depth": 0.09}}, "parent": null, "attachment": null, "dimensions": {"width": 0.42, "height": 1.22, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.24, 2.24, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "coat-tail-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "tail-edge-plane-right", "type": "contour", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "contour", "confidence": 0.9, "notes": "Outer coat-panel edge flares gently toward hem."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": ["tail-edge-plane-right"], "fidelityTier": "blockout"};
  node_coat_tail_right_10.add(mesh_coat_tail_right_10);
  meshes["coat-tail-right"] = mesh_coat_tail_right_10;
  colliders["coat-tail-right"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["coat-tail-right"] ??= [];
  destructionGroups["coat-tail-right"].push(node_coat_tail_right_10);

  const attachment_hair_back_11 = null;
  const endpoint_hair_back_11 = makeAttachmentEndpoint(attachment_hair_back_11);
  const node_hair_back_11 = new THREE.Group();
  node_hair_back_11.name = "Long back hair mantle__pivot";
  if (endpoint_hair_back_11) {
    node_hair_back_11.position.copy(endpoint_hair_back_11.start);
    node_hair_back_11.rotation.set(0, 0, 0);
    node_hair_back_11.scale.set(1, 1, 1);
  } else {
    node_hair_back_11.position.set(0.0, 3.47, -0.13);
    node_hair_back_11.rotation.set(0.0, 0.0, 0.0);
    node_hair_back_11.scale.set(0.53, 0.98, 0.3);
  }
  node_hair_back_11.userData.sculptComponent = {"id": "hair-back", "name": "Long back hair mantle", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Large connected hair mantle visible from rear and profiles.", "geometryDescriptor": {"topologyIntent": "Large connected hair mantle visible from rear and profiles.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.53, "height": 0.98, "depth": 0.3, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.47, -0.13], "rotation": [0, 0, 0], "scale": [0.53, 0.98, 0.3]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "major-lock-ridges", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Broad locks overlap and taper below shoulder blades."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["back-head", "right-head", "left-head"], "details": ["major-lock-ridges"], "fidelityTier": "blockout"};
  node_hair_back_11.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_hair_back_11);
  nodes["hair-back"] = node_hair_back_11;
  const mesh_hair_back_11Geometry = endpoint_hair_back_11
    ? new THREE.CylinderGeometry(endpoint_hair_back_11.endRadius, endpoint_hair_back_11.baseRadius, endpoint_hair_back_11.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_hair_back_11 = new THREE.Mesh(
    mesh_hair_back_11Geometry,
    materialMap["stone-dark"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_hair_back_11.name = "Long back hair mantle";
  if (endpoint_hair_back_11) {
    mesh_hair_back_11.position.copy(endpoint_hair_back_11.midpoint);
    mesh_hair_back_11.quaternion.copy(endpoint_hair_back_11.quaternion);
  }
  mesh_hair_back_11.castShadow = options.castShadow ?? true;
  mesh_hair_back_11.receiveShadow = options.receiveShadow ?? true;
  mesh_hair_back_11.userData.sculptComponent = {"id": "hair-back", "name": "Long back hair mantle", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Large connected hair mantle visible from rear and profiles.", "geometryDescriptor": {"topologyIntent": "Large connected hair mantle visible from rear and profiles.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.53, "height": 0.98, "depth": 0.3, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.47, -0.13], "rotation": [0, 0, 0], "scale": [0.53, 0.98, 0.3]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "major-lock-ridges", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Broad locks overlap and taper below shoulder blades."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["back-head", "right-head", "left-head"], "details": ["major-lock-ridges"], "fidelityTier": "blockout"};
  node_hair_back_11.add(mesh_hair_back_11);
  meshes["hair-back"] = mesh_hair_back_11;
  colliders["hair-back"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["hair-back"] ??= [];
  destructionGroups["hair-back"].push(node_hair_back_11);

  const attachment_hair_left_12 = null;
  const endpoint_hair_left_12 = makeAttachmentEndpoint(attachment_hair_left_12);
  const node_hair_left_12 = new THREE.Group();
  node_hair_left_12.name = "Left front hair curtain__pivot";
  if (endpoint_hair_left_12) {
    node_hair_left_12.position.copy(endpoint_hair_left_12.start);
    node_hair_left_12.rotation.set(0, 0, 0);
    node_hair_left_12.scale.set(1, 1, 1);
  } else {
    node_hair_left_12.position.set(0.0, 3.66, 0.0);
    node_hair_left_12.rotation.set(0.0, 0.0, 0.0);
    node_hair_left_12.scale.set(1.0, 1.0, 1.0);
  }
  node_hair_left_12.userData.sculptComponent = {"id": "hair-left", "name": "Left front hair curtain", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Broad elongated hair clump follows a curved path beside the face.", "geometryDescriptor": {"topologyIntent": "Broad elongated hair clump follows a curved path beside the face.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "tubePath": {"points": [[-0.1, 0.25, 0.05], [-0.24, 0.04, 0.1], [-0.3, -0.28, 0.02], [-0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false}}, "parent": null, "attachment": null, "dimensions": {"width": 0.14, "height": 0.8, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "left-hair-wave", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Two direction changes create the broad faceted wave."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "left-head"], "details": ["left-hair-wave"], "fidelityTier": "blockout"};
  node_hair_left_12.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_hair_left_12);
  nodes["hair-left"] = node_hair_left_12;
  const mesh_hair_left_12Geometry = endpoint_hair_left_12
    ? new THREE.CylinderGeometry(endpoint_hair_left_12.endRadius, endpoint_hair_left_12.baseRadius, endpoint_hair_left_12.length, 32, 12)
    : buildTubeGeometry({"points": [[-0.1, 0.25, 0.05], [-0.24, 0.04, 0.1], [-0.3, -0.28, 0.02], [-0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false});
  const mesh_hair_left_12 = new THREE.Mesh(
    mesh_hair_left_12Geometry,
    materialMap["stone-dark"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_hair_left_12.name = "Left front hair curtain";
  if (endpoint_hair_left_12) {
    mesh_hair_left_12.position.copy(endpoint_hair_left_12.midpoint);
    mesh_hair_left_12.quaternion.copy(endpoint_hair_left_12.quaternion);
  }
  mesh_hair_left_12.castShadow = options.castShadow ?? true;
  mesh_hair_left_12.receiveShadow = options.receiveShadow ?? true;
  mesh_hair_left_12.userData.sculptComponent = {"id": "hair-left", "name": "Left front hair curtain", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Broad elongated hair clump follows a curved path beside the face.", "geometryDescriptor": {"topologyIntent": "Broad elongated hair clump follows a curved path beside the face.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "tubePath": {"points": [[-0.1, 0.25, 0.05], [-0.24, 0.04, 0.1], [-0.3, -0.28, 0.02], [-0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false}}, "parent": null, "attachment": null, "dimensions": {"width": 0.14, "height": 0.8, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-left", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "left-hair-wave", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Two direction changes create the broad faceted wave."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "left-head"], "details": ["left-hair-wave"], "fidelityTier": "blockout"};
  node_hair_left_12.add(mesh_hair_left_12);
  meshes["hair-left"] = mesh_hair_left_12;
  colliders["hair-left"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["hair-left"] ??= [];
  destructionGroups["hair-left"].push(node_hair_left_12);

  const attachment_hair_right_13 = null;
  const endpoint_hair_right_13 = makeAttachmentEndpoint(attachment_hair_right_13);
  const node_hair_right_13 = new THREE.Group();
  node_hair_right_13.name = "Right front hair curtain__pivot";
  if (endpoint_hair_right_13) {
    node_hair_right_13.position.copy(endpoint_hair_right_13.start);
    node_hair_right_13.rotation.set(0, 0, 0);
    node_hair_right_13.scale.set(1, 1, 1);
  } else {
    node_hair_right_13.position.set(0.0, 3.66, 0.0);
    node_hair_right_13.rotation.set(0.0, 0.0, 0.0);
    node_hair_right_13.scale.set(1.0, 1.0, 1.0);
  }
  node_hair_right_13.userData.sculptComponent = {"id": "hair-right", "name": "Right front hair curtain", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Broad elongated hair clump follows a curved path beside the face.", "geometryDescriptor": {"topologyIntent": "Broad elongated hair clump follows a curved path beside the face.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "tubePath": {"points": [[0.1, 0.25, 0.05], [0.24, 0.04, 0.1], [0.3, -0.28, 0.02], [0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false}}, "parent": null, "attachment": null, "dimensions": {"width": 0.14, "height": 0.8, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "right-hair-wave", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Two direction changes create the broad faceted wave."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "right-head"], "details": ["right-hair-wave"], "fidelityTier": "blockout"};
  node_hair_right_13.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_hair_right_13);
  nodes["hair-right"] = node_hair_right_13;
  const mesh_hair_right_13Geometry = endpoint_hair_right_13
    ? new THREE.CylinderGeometry(endpoint_hair_right_13.endRadius, endpoint_hair_right_13.baseRadius, endpoint_hair_right_13.length, 32, 12)
    : buildTubeGeometry({"points": [[0.1, 0.25, 0.05], [0.24, 0.04, 0.1], [0.3, -0.28, 0.02], [0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false});
  const mesh_hair_right_13 = new THREE.Mesh(
    mesh_hair_right_13Geometry,
    materialMap["stone-dark"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_hair_right_13.name = "Right front hair curtain";
  if (endpoint_hair_right_13) {
    mesh_hair_right_13.position.copy(endpoint_hair_right_13.midpoint);
    mesh_hair_right_13.quaternion.copy(endpoint_hair_right_13.quaternion);
  }
  mesh_hair_right_13.castShadow = options.castShadow ?? true;
  mesh_hair_right_13.receiveShadow = options.receiveShadow ?? true;
  mesh_hair_right_13.userData.sculptComponent = {"id": "hair-right", "name": "Right front hair curtain", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "tube", "topologyClass": "fiber-strand", "topologyRationale": "Broad elongated hair clump follows a curved path beside the face.", "geometryDescriptor": {"topologyIntent": "Broad elongated hair clump follows a curved path beside the face.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes", "tubePath": {"points": [[0.1, 0.25, 0.05], [0.24, 0.04, 0.1], [0.3, -0.28, 0.02], [0.27, -0.56, -0.02]], "radius": 0.1, "radialSegments": 6, "closed": false}}, "parent": null, "attachment": null, "dimensions": {"width": 0.14, "height": 0.8, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0, 3.66, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "hair-right", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "right-hair-wave", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Two direction changes create the broad faceted wave."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-head", "right-head"], "details": ["right-hair-wave"], "fidelityTier": "blockout"};
  node_hair_right_13.add(mesh_hair_right_13);
  meshes["hair-right"] = mesh_hair_right_13;
  colliders["hair-right"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["hair-right"] ??= [];
  destructionGroups["hair-right"].push(node_hair_right_13);

  const attachment_left_upper_arm_14 = null;
  const endpoint_left_upper_arm_14 = makeAttachmentEndpoint(attachment_left_upper_arm_14);
  const node_left_upper_arm_14 = new THREE.Group();
  node_left_upper_arm_14.name = "Left upper arm carrying book__pivot";
  if (endpoint_left_upper_arm_14) {
    node_left_upper_arm_14.position.copy(endpoint_left_upper_arm_14.start);
    node_left_upper_arm_14.rotation.set(0, 0, 0);
    node_left_upper_arm_14.scale.set(1, 1, 1);
  } else {
    node_left_upper_arm_14.position.set(-0.39, 2.94, 0.01);
    node_left_upper_arm_14.rotation.set(0.0, 0.0, -0.34);
    node_left_upper_arm_14.scale.set(0.22, 0.56, 0.22);
  }
  node_left_upper_arm_14.userData.sculptComponent = {"id": "left-upper-arm", "name": "Left upper arm carrying book", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered anatomical limb segment inside coat sleeve.", "geometryDescriptor": {"topologyIntent": "Tapered anatomical limb segment inside coat sleeve.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.22, "height": 0.56, "depth": 0.22, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.39, 2.94, 0.01], "rotation": [0, 0, -0.34], "scale": [0.22, 0.56, 0.22]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "left-full"], "details": [], "fidelityTier": "blockout"};
  node_left_upper_arm_14.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_left_upper_arm_14);
  nodes["left-upper-arm"] = node_left_upper_arm_14;
  const mesh_left_upper_arm_14Geometry = endpoint_left_upper_arm_14
    ? new THREE.CylinderGeometry(endpoint_left_upper_arm_14.endRadius, endpoint_left_upper_arm_14.baseRadius, endpoint_left_upper_arm_14.length, 32, 12)
    : new THREE.CapsuleGeometry(0.35, 0.7, 16, 32);
  const mesh_left_upper_arm_14 = new THREE.Mesh(
    mesh_left_upper_arm_14Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_left_upper_arm_14.name = "Left upper arm carrying book";
  if (endpoint_left_upper_arm_14) {
    mesh_left_upper_arm_14.position.copy(endpoint_left_upper_arm_14.midpoint);
    mesh_left_upper_arm_14.quaternion.copy(endpoint_left_upper_arm_14.quaternion);
  }
  mesh_left_upper_arm_14.castShadow = options.castShadow ?? true;
  mesh_left_upper_arm_14.receiveShadow = options.receiveShadow ?? true;
  mesh_left_upper_arm_14.userData.sculptComponent = {"id": "left-upper-arm", "name": "Left upper arm carrying book", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered anatomical limb segment inside coat sleeve.", "geometryDescriptor": {"topologyIntent": "Tapered anatomical limb segment inside coat sleeve.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.22, "height": 0.56, "depth": 0.22, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.39, 2.94, 0.01], "rotation": [0, 0, -0.34], "scale": [0.22, 0.56, 0.22]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "left-full"], "details": [], "fidelityTier": "blockout"};
  node_left_upper_arm_14.add(mesh_left_upper_arm_14);
  meshes["left-upper-arm"] = mesh_left_upper_arm_14;
  colliders["left-upper-arm"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["left-upper-arm"] ??= [];
  destructionGroups["left-upper-arm"].push(node_left_upper_arm_14);

  const attachment_left_forearm_15 = null;
  const endpoint_left_forearm_15 = makeAttachmentEndpoint(attachment_left_forearm_15);
  const node_left_forearm_15 = new THREE.Group();
  node_left_forearm_15.name = "Left forearm across book__pivot";
  if (endpoint_left_forearm_15) {
    node_left_forearm_15.position.copy(endpoint_left_forearm_15.start);
    node_left_forearm_15.rotation.set(0, 0, 0);
    node_left_forearm_15.scale.set(1, 1, 1);
  } else {
    node_left_forearm_15.position.set(-0.35000000000000003, 2.69, 0.21000000000000002);
    node_left_forearm_15.rotation.set(0.0, 0.0, 0.8399999999999999);
    node_left_forearm_15.scale.set(0.18, 0.5, 0.18);
  }
  node_left_forearm_15.userData.sculptComponent = {"id": "left-forearm", "name": "Left forearm across book", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Bent tapered sleeve segment crossing the torso.", "geometryDescriptor": {"topologyIntent": "Bent tapered sleeve segment crossing the torso.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.18, "height": 0.5, "depth": 0.18, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.35000000000000003, 2.69, 0.21000000000000002], "rotation": [0, 0, 0.8399999999999999], "scale": [0.18, 0.5, 0.18]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_left_forearm_15.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_left_forearm_15);
  nodes["left-forearm"] = node_left_forearm_15;
  const mesh_left_forearm_15Geometry = endpoint_left_forearm_15
    ? new THREE.CylinderGeometry(endpoint_left_forearm_15.endRadius, endpoint_left_forearm_15.baseRadius, endpoint_left_forearm_15.length, 32, 12)
    : new THREE.CapsuleGeometry(0.35, 0.7, 16, 32);
  const mesh_left_forearm_15 = new THREE.Mesh(
    mesh_left_forearm_15Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_left_forearm_15.name = "Left forearm across book";
  if (endpoint_left_forearm_15) {
    mesh_left_forearm_15.position.copy(endpoint_left_forearm_15.midpoint);
    mesh_left_forearm_15.quaternion.copy(endpoint_left_forearm_15.quaternion);
  }
  mesh_left_forearm_15.castShadow = options.castShadow ?? true;
  mesh_left_forearm_15.receiveShadow = options.receiveShadow ?? true;
  mesh_left_forearm_15.userData.sculptComponent = {"id": "left-forearm", "name": "Left forearm across book", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Bent tapered sleeve segment crossing the torso.", "geometryDescriptor": {"topologyIntent": "Bent tapered sleeve segment crossing the torso.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.18, "height": 0.5, "depth": 0.18, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.35000000000000003, 2.69, 0.21000000000000002], "rotation": [0, 0, 0.8399999999999999], "scale": [0.18, 0.5, 0.18]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_left_forearm_15.add(mesh_left_forearm_15);
  meshes["left-forearm"] = mesh_left_forearm_15;
  colliders["left-forearm"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["left-forearm"] ??= [];
  destructionGroups["left-forearm"].push(node_left_forearm_15);

  const attachment_right_upper_arm_16 = null;
  const endpoint_right_upper_arm_16 = makeAttachmentEndpoint(attachment_right_upper_arm_16);
  const node_right_upper_arm_16 = new THREE.Group();
  node_right_upper_arm_16.name = "Relaxed right upper arm__pivot";
  if (endpoint_right_upper_arm_16) {
    node_right_upper_arm_16.position.copy(endpoint_right_upper_arm_16.start);
    node_right_upper_arm_16.rotation.set(0, 0, 0);
    node_right_upper_arm_16.scale.set(1, 1, 1);
  } else {
    node_right_upper_arm_16.position.set(0.4, 2.9, -0.01);
    node_right_upper_arm_16.rotation.set(0.0, 0.0, 0.08);
    node_right_upper_arm_16.scale.set(0.22, 0.58, 0.22);
  }
  node_right_upper_arm_16.userData.sculptComponent = {"id": "right-upper-arm", "name": "Relaxed right upper arm", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered sleeve hanging close to coat.", "geometryDescriptor": {"topologyIntent": "Tapered sleeve hanging close to coat.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.22, "height": 0.58, "depth": 0.22, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.4, 2.9, -0.01], "rotation": [0, 0, 0.08], "scale": [0.22, 0.58, 0.22]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_right_upper_arm_16.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_right_upper_arm_16);
  nodes["right-upper-arm"] = node_right_upper_arm_16;
  const mesh_right_upper_arm_16Geometry = endpoint_right_upper_arm_16
    ? new THREE.CylinderGeometry(endpoint_right_upper_arm_16.endRadius, endpoint_right_upper_arm_16.baseRadius, endpoint_right_upper_arm_16.length, 32, 12)
    : new THREE.CapsuleGeometry(0.35, 0.7, 16, 32);
  const mesh_right_upper_arm_16 = new THREE.Mesh(
    mesh_right_upper_arm_16Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_right_upper_arm_16.name = "Relaxed right upper arm";
  if (endpoint_right_upper_arm_16) {
    mesh_right_upper_arm_16.position.copy(endpoint_right_upper_arm_16.midpoint);
    mesh_right_upper_arm_16.quaternion.copy(endpoint_right_upper_arm_16.quaternion);
  }
  mesh_right_upper_arm_16.castShadow = options.castShadow ?? true;
  mesh_right_upper_arm_16.receiveShadow = options.receiveShadow ?? true;
  mesh_right_upper_arm_16.userData.sculptComponent = {"id": "right-upper-arm", "name": "Relaxed right upper arm", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Tapered sleeve hanging close to coat.", "geometryDescriptor": {"topologyIntent": "Tapered sleeve hanging close to coat.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.22, "height": 0.58, "depth": 0.22, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.4, 2.9, -0.01], "rotation": [0, 0, 0.08], "scale": [0.22, 0.58, 0.22]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-upper-arm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_right_upper_arm_16.add(mesh_right_upper_arm_16);
  meshes["right-upper-arm"] = mesh_right_upper_arm_16;
  colliders["right-upper-arm"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["right-upper-arm"] ??= [];
  destructionGroups["right-upper-arm"].push(node_right_upper_arm_16);

  const attachment_right_forearm_17 = null;
  const endpoint_right_forearm_17 = makeAttachmentEndpoint(attachment_right_forearm_17);
  const node_right_forearm_17 = new THREE.Group();
  node_right_forearm_17.name = "Relaxed right forearm__pivot";
  if (endpoint_right_forearm_17) {
    node_right_forearm_17.position.copy(endpoint_right_forearm_17.start);
    node_right_forearm_17.rotation.set(0, 0, 0);
    node_right_forearm_17.scale.set(1, 1, 1);
  } else {
    node_right_forearm_17.position.set(0.45, 2.5, 0.019999999999999997);
    node_right_forearm_17.rotation.set(0.0, 0.0, 0.11);
    node_right_forearm_17.scale.set(0.17, 0.49, 0.17);
  }
  node_right_forearm_17.userData.sculptComponent = {"id": "right-forearm", "name": "Relaxed right forearm", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Narrow sleeve continuing toward relaxed hand.", "geometryDescriptor": {"topologyIntent": "Narrow sleeve continuing toward relaxed hand.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.17, "height": 0.49, "depth": 0.17, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.45, 2.5, 0.019999999999999997], "rotation": [0, 0, 0.11], "scale": [0.17, 0.49, 0.17]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_right_forearm_17.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_right_forearm_17);
  nodes["right-forearm"] = node_right_forearm_17;
  const mesh_right_forearm_17Geometry = endpoint_right_forearm_17
    ? new THREE.CylinderGeometry(endpoint_right_forearm_17.endRadius, endpoint_right_forearm_17.baseRadius, endpoint_right_forearm_17.length, 32, 12)
    : new THREE.CapsuleGeometry(0.35, 0.7, 16, 32);
  const mesh_right_forearm_17 = new THREE.Mesh(
    mesh_right_forearm_17Geometry,
    materialMap["stone-main"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_right_forearm_17.name = "Relaxed right forearm";
  if (endpoint_right_forearm_17) {
    mesh_right_forearm_17.position.copy(endpoint_right_forearm_17.midpoint);
    mesh_right_forearm_17.quaternion.copy(endpoint_right_forearm_17.quaternion);
  }
  mesh_right_forearm_17.castShadow = options.castShadow ?? true;
  mesh_right_forearm_17.receiveShadow = options.receiveShadow ?? true;
  mesh_right_forearm_17.userData.sculptComponent = {"id": "right-forearm", "name": "Relaxed right forearm", "level": "meso", "role": "arm", "importance": 0.85, "confidence": 0.9, "primitive": "capsule", "topologyClass": "continuous-sculpt", "topologyRationale": "Narrow sleeve continuing toward relaxed hand.", "geometryDescriptor": {"topologyIntent": "Narrow sleeve continuing toward relaxed hand.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.17, "height": 0.49, "depth": 0.17, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.45, 2.5, 0.019999999999999997], "rotation": [0, 0, 0.11], "scale": [0.17, 0.49, 0.17]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-forearm", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-main", "materialLayers": ["stone-main"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": [], "fidelityTier": "blockout"};
  node_right_forearm_17.add(mesh_right_forearm_17);
  meshes["right-forearm"] = mesh_right_forearm_17;
  colliders["right-forearm"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["right-forearm"] ??= [];
  destructionGroups["right-forearm"].push(node_right_forearm_17);

  const attachment_book_18 = null;
  const endpoint_book_18 = makeAttachmentEndpoint(attachment_book_18);
  const node_book_18 = new THREE.Group();
  node_book_18.name = "Closed book against left chest__pivot";
  if (endpoint_book_18) {
    node_book_18.position.copy(endpoint_book_18.start);
    node_book_18.rotation.set(0, 0, 0);
    node_book_18.scale.set(1, 1, 1);
  } else {
    node_book_18.position.set(-0.25, 2.94, 0.29);
    node_book_18.rotation.set(0.0, 0.0, -0.18);
    node_book_18.scale.set(0.4, 0.56, 0.12);
  }
  node_book_18.userData.sculptComponent = {"id": "book", "name": "Closed book against left chest", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Rigid rectangular book with visible depth and cover planes.", "geometryDescriptor": {"topologyIntent": "Rigid rectangular book with visible depth and cover planes.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.4, "height": 0.56, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.25, 2.94, 0.29], "rotation": [0, 0, -0.18], "scale": [0.4, 0.56, 0.12]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "book", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "cover-page-bevel", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Thin lighter page block remains visible along top and outer edge."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": ["cover-page-bevel"], "fidelityTier": "blockout"};
  node_book_18.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "book", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_book_18);
  nodes["book"] = node_book_18;
  const mesh_book_18Geometry = endpoint_book_18
    ? new THREE.CylinderGeometry(endpoint_book_18.endRadius, endpoint_book_18.baseRadius, endpoint_book_18.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_book_18 = new THREE.Mesh(
    mesh_book_18Geometry,
    materialMap["stone-dark"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_book_18.name = "Closed book against left chest";
  if (endpoint_book_18) {
    mesh_book_18.position.copy(endpoint_book_18.midpoint);
    mesh_book_18.quaternion.copy(endpoint_book_18.quaternion);
  }
  mesh_book_18.castShadow = options.castShadow ?? true;
  mesh_book_18.receiveShadow = options.receiveShadow ?? true;
  mesh_book_18.userData.sculptComponent = {"id": "book", "name": "Closed book against left chest", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Rigid rectangular book with visible depth and cover planes.", "geometryDescriptor": {"topologyIntent": "Rigid rectangular book with visible depth and cover planes.", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.025, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.4, "height": 0.56, "depth": 0.12, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.25, 2.94, 0.29], "rotation": [0, 0, -0.18], "scale": [0.4, 0.56, 0.12]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "book", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-dark", "materialLayers": ["stone-dark"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "cover-page-bevel", "type": "bevel", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "bevel", "confidence": 0.9, "notes": "Thin lighter page block remains visible along top and outer edge."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso", "right-full"], "details": ["cover-page-bevel"], "fidelityTier": "blockout"};
  node_book_18.add(mesh_book_18);
  meshes["book"] = mesh_book_18;
  colliders["book"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["book"] ??= [];
  destructionGroups["book"].push(node_book_18);

  const attachment_left_hand_19 = null;
  const endpoint_left_hand_19 = makeAttachmentEndpoint(attachment_left_hand_19);
  const node_left_hand_19 = new THREE.Group();
  node_left_hand_19.name = "Left hand gripping book__pivot";
  if (endpoint_left_hand_19) {
    node_left_hand_19.position.copy(endpoint_left_hand_19.start);
    node_left_hand_19.rotation.set(0, 0, 0);
    node_left_hand_19.scale.set(1, 1, 1);
  } else {
    node_left_hand_19.position.set(-0.18000000000000002, 2.73, 0.35000000000000003);
    node_left_hand_19.rotation.set(0.0, 0.0, 0.6399999999999999);
    node_left_hand_19.scale.set(0.15, 0.21, 0.1);
  }
  node_left_hand_19.userData.sculptComponent = {"id": "left-hand", "name": "Left hand gripping book", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Simplified palm volume attached to bent forearm and book.", "geometryDescriptor": {"topologyIntent": "Simplified palm volume attached to bent forearm and book.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.15, "height": 0.21, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.18000000000000002, 2.73, 0.35000000000000003], "rotation": [0, 0, 0.6399999999999999], "scale": [0.15, 0.21, 0.1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-light", "materialLayers": ["stone-light"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "book-finger-capsules", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Three shallow finger ridges wrap diagonally across cover."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso"], "details": ["book-finger-capsules"], "fidelityTier": "blockout"};
  node_left_hand_19.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_left_hand_19);
  nodes["left-hand"] = node_left_hand_19;
  const mesh_left_hand_19Geometry = endpoint_left_hand_19
    ? new THREE.CylinderGeometry(endpoint_left_hand_19.endRadius, endpoint_left_hand_19.baseRadius, endpoint_left_hand_19.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_left_hand_19 = new THREE.Mesh(
    mesh_left_hand_19Geometry,
    materialMap["stone-light"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_left_hand_19.name = "Left hand gripping book";
  if (endpoint_left_hand_19) {
    mesh_left_hand_19.position.copy(endpoint_left_hand_19.midpoint);
    mesh_left_hand_19.quaternion.copy(endpoint_left_hand_19.quaternion);
  }
  mesh_left_hand_19.castShadow = options.castShadow ?? true;
  mesh_left_hand_19.receiveShadow = options.receiveShadow ?? true;
  mesh_left_hand_19.userData.sculptComponent = {"id": "left-hand", "name": "Left hand gripping book", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Simplified palm volume attached to bent forearm and book.", "geometryDescriptor": {"topologyIntent": "Simplified palm volume attached to bent forearm and book.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.15, "height": 0.21, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [-0.18000000000000002, 2.73, 0.35000000000000003], "rotation": [0, 0, 0.6399999999999999], "scale": [0.15, 0.21, 0.1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "left-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-light", "materialLayers": ["stone-light"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "book-finger-capsules", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Three shallow finger ridges wrap diagonally across cover."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-torso"], "details": ["book-finger-capsules"], "fidelityTier": "blockout"};
  node_left_hand_19.add(mesh_left_hand_19);
  meshes["left-hand"] = mesh_left_hand_19;
  colliders["left-hand"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["left-hand"] ??= [];
  destructionGroups["left-hand"].push(node_left_hand_19);

  const attachment_right_hand_20 = null;
  const endpoint_right_hand_20 = makeAttachmentEndpoint(attachment_right_hand_20);
  const node_right_hand_20 = new THREE.Group();
  node_right_hand_20.name = "Relaxed right hand__pivot";
  if (endpoint_right_hand_20) {
    node_right_hand_20.position.copy(endpoint_right_hand_20.start);
    node_right_hand_20.rotation.set(0, 0, 0);
    node_right_hand_20.scale.set(1, 1, 1);
  } else {
    node_right_hand_20.position.set(0.48, 2.18, 0.039999999999999994);
    node_right_hand_20.rotation.set(0.0, 0.0, 0.11);
    node_right_hand_20.scale.set(0.13, 0.24, 0.1);
  }
  node_right_hand_20.userData.sculptComponent = {"id": "right-hand", "name": "Relaxed right hand", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Simplified hanging palm with separated finger silhouette.", "geometryDescriptor": {"topologyIntent": "Simplified hanging palm with separated finger silhouette.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.13, "height": 0.24, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.48, 2.18, 0.039999999999999994], "rotation": [0, 0, 0.11], "scale": [0.13, 0.24, 0.1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-light", "materialLayers": ["stone-light"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "relaxed-finger-capsules", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Four short narrow finger segments extend beneath palm."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": ["relaxed-finger-capsules"], "fidelityTier": "blockout"};
  node_right_hand_20.userData.actionProfile = {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}};
  (nodes["root"] ?? root).add(node_right_hand_20);
  nodes["right-hand"] = node_right_hand_20;
  const mesh_right_hand_20Geometry = endpoint_right_hand_20
    ? new THREE.CylinderGeometry(endpoint_right_hand_20.endRadius, endpoint_right_hand_20.baseRadius, endpoint_right_hand_20.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  const mesh_right_hand_20 = new THREE.Mesh(
    mesh_right_hand_20Geometry,
    materialMap["stone-light"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_right_hand_20.name = "Relaxed right hand";
  if (endpoint_right_hand_20) {
    mesh_right_hand_20.position.copy(endpoint_right_hand_20.midpoint);
    mesh_right_hand_20.quaternion.copy(endpoint_right_hand_20.quaternion);
  }
  mesh_right_hand_20.castShadow = options.castShadow ?? true;
  mesh_right_hand_20.receiveShadow = options.receiveShadow ?? true;
  mesh_right_hand_20.userData.sculptComponent = {"id": "right-hand", "name": "Relaxed right hand", "level": "meso", "role": "static-part", "importance": 0.85, "confidence": 0.9, "primitive": "ellipsoid", "topologyClass": "continuous-sculpt", "topologyRationale": "Simplified hanging palm with separated finger silhouette.", "geometryDescriptor": {"topologyIntent": "Simplified hanging palm with separated finger silhouette.", "edgeTreatment": {"type": "faceted", "bevelRadius": 0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat normals with deliberate triangular planes"}, "parent": null, "attachment": null, "dimensions": {"width": 0.13, "height": 0.24, "depth": 0.1, "units": "statue-local", "confidence": 0.9}, "transform": {"position": [0.48, 2.18, 0.039999999999999994], "rotation": [0, 0, 0.11], "scale": [0.13, 0.24, 0.1]}, "actionProfile": {"animationRole": "static-part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.95}, "transformChannels": {"translate": false, "rotate": false, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "right-hand", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "stone-dark"}}, "material": "stone-light", "materialLayers": ["stone-light"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(151, 126, 91, 1.0)", "secondaryAlbedo": "rgba(190, 164, 121, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.94, "colorGradient": {"type": "linear", "stops": [{"offset": 0, "color": "rgba(112, 91, 65, 1.0)"}, {"offset": 0.55, "color": "rgba(165, 138, 99, 1.0)"}, {"offset": 1, "color": "rgba(202, 178, 135, 1.0)"}]}}, "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "relaxed-finger-capsules", "type": "ridge", "placement": "reference-measured", "size": "object-relative", "orientation": "reference-matched", "materialEffect": "cavity or ridge value separation", "geometryEffect": "ridge", "confidence": 0.9, "notes": "Four short narrow finger segments extend beneath palm."}], "surfaceDetail": {"macroRoughness": 0.74, "microRoughness": 0.09, "bumpAmplitude": 0.018, "normalPattern": "low-amplitude carved limestone grain", "displacementPattern": "triangulated geometry only where silhouette-visible", "occlusionPattern": "cavity-darkened seams and garment overlaps", "edgeWearPattern": "slightly lighter exposed planar ridges", "notes": "Do not smooth normals; planar shading is identity-defining."}, "evidenceRefs": ["front-full", "right-full"], "details": ["relaxed-finger-capsules"], "fidelityTier": "blockout"};
  node_right_hand_20.add(mesh_right_hand_20);
  meshes["right-hand"] = mesh_right_hand_20;
  colliders["right-hand"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only child"};
  destructionGroups["right-hand"] ??= [];
  destructionGroups["right-hand"].push(node_right_hand_20);

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "stylized-reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createRoxanaStatueLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "Roxana Statue look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = [{"id": "key", "type": "directional", "direction": [-0.7, 1, 0.8], "color": "#FFE0B3", "intensity": 2.1, "role": "warm upper-left key explaining facial and coat planes"}, {"id": "fill", "type": "hemisphere", "direction": [0.8, 0.4, -0.4], "color": "#A8C5FF", "intensity": 0.65, "role": "cool low-contrast fill preserving profile information"}, {"id": "rim", "type": "directional", "direction": [0.2, 0.7, -1], "color": "#FFF0CF", "intensity": 1, "role": "subtle hair and shoulder separation"}, {"id": "render-intent", "exposure": 1.05, "toneMapping": "ACESFilmic", "contactShadow": "soft ground shadow plus ambient occlusion beneath garment overlaps and pedestal steps"}];
  lights.userData.lookDevTargets = {"qualityPriority": "stylized-reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createRoxanaStatueEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameRoxanaStatueCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createRoxanaStatuePresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}
