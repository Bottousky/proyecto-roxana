// Escena 2 — la cornisa, la cascada ascendente y el lago roto.
//
// Esta capa es PURAMENTE presentación visual. La física pedagógica vive en
// `models/cascadaAscendente.ts` (analítica) y en `physics.ts` (Havok con
// autoridad sobre las piedras no voladoras y las rocas del piso). Detalles
// en `docs/physica/arquitectura-fisica-hibrida.md`.
//
// Referencias visuales dirigidas por Manuel (closed-loop 2026-08-07):
//   • Planet of Lana — luz dorada, horizonte cálido, escala grande.
//   • Trine 4/5 — materiales con desgaste, profundidad en capas, VFX luminosos.
//   • INSIDE — silueta e iluminación teatral rim+key.
//   • Little Nightmares II — atmósfera con capas de densidad y compacidad.
import * as BABYLON from 'babylonjs';
import {
  CIELO_Y,
  COLUMNA_CASCADA,
  GRAVEDAD,
  LAGO_Y,
} from '../models/cascadaAscendente.ts';
import { integrar, type MruvIntegrada } from '../models/caidaLibre.ts';

/** Centro y ancho de la columna física de la cascada (vienen del modelo). */
const CASCADA_CENTRO = (COLUMNA_CASCADA.x0 + COLUMNA_CASCADA.x1) / 2;
const CASCADA_ANCHO = COLUMNA_CASCADA.x1 - COLUMNA_CASCADA.x0;
const CASCADA_TOPE = CIELO_Y;

export interface CascadeSceneContext {
  scene: BABYLON.Scene;
  shadows: BABYLON.ShadowGenerator;
  prefersReducedMotion: boolean;
}

export interface CascadeSceneEntities {
  update(time: number, dt: number, motionScale: number): void;
  dispose(): void;
}

/** Paleta cerrada: la cascada ascendente vive en una luz de atardecer. */
const PALETA = {
  // Cielo (de cenit a horizonte; el horizonte "respira" dorado).
  cieloTop: '#1a2a4a',
  cieloMid: '#5a6988',
  cieloBaja: '#c1a888',
  cieloBase: '#f0c890',
  // Montañas paralaje (de más lejana a más cercana).
  montanaLejana: '#7a8aa0',
  montanaMedia: '#5a6a82',
  montanaCercana: '#3a4a66',
  // Roca y musgo.
  rocaFría: '#5d6159',
  rocaCálida: '#7a6557',
  musgo: '#5a7a52',
  musgoBajo: '#3e5a48',
  // Suelo / cornisa.
  cornisaSeca: '#7c725a',
  cornisaHúmeda: '#5a4a3a',
  // Vegetación.
  hojaTronco: '#4a6648',
  hierbaDorada: '#b9a866',
  // Agua y espuma.
  aguaProfunda: '#2a7a98',
  aguaTono: '#4fb6d8',
  aguaEspuma: '#e8fcff',
  aguaLuz: '#a8efff',
  // Cielo profundo para godrays.
  rayo: '#fff0c0',
} as const;

export function buildCascadeScene(ctx: CascadeSceneContext): CascadeSceneEntities {
  const { scene, shadows } = ctx;
  const meshes: BABYLON.Mesh[] = [];
  const materials: BABYLON.Material[] = [];
  const particles: BABYLON.ParticleSystem[] = [];
  const textures: BABYLON.Texture[] = [];

  // Materiales PBR con "desgaste pintado": baja metallic, specular pequeño,
  // ambient calmado para que la directional del mundo domine.
  const makePbr = (name: string, color: string, opts: { roughness?: number; metallic?: number; emissive?: string; alpha?: number } = {}): BABYLON.PBRMaterial => {
    const m = new BABYLON.PBRMaterial(name, scene);
    m.albedoColor = BABYLON.Color3.FromHexString(color);
    m.roughness = opts.roughness ?? 0.92;
    m.metallic = opts.metallic ?? 0;
    m.environmentIntensity = 0.18;
    m.specularIntensity = 0.6;
    if (opts.emissive) m.emissiveColor = BABYLON.Color3.FromHexString(opts.emissive);
    if (opts.alpha !== undefined) {
      m.alpha = opts.alpha;
      m.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      m.backFaceCulling = false;
    }
    materials.push(m);
    return m;
  };
  const alphaMat = (name: string, color: string, alpha: number, emissive = '#000000'): BABYLON.PBRMaterial =>
    makePbr(name, color, { alpha, emissive });

  const mesh = (m: BABYLON.Mesh): BABYLON.Mesh => { meshes.push(m); return m; };

  /* ============================================================
     1. CIELO — el gradiente de atardecer vive en babylonWorld.ts
        (cielo-gradiente-global-*) y se comparte con las 7 escenas.
        Acá solo aportamos el sol como elemento local de la escena.
     ============================================================ */

  // Sol dorado suave (disco luminoso) — refuerza la dirección dominante.
  const solCanvas = document.createElement('canvas');
  solCanvas.width = 256; solCanvas.height = 256;
  const solCtx = solCanvas.getContext('2d')!;
  const solGrad = solCtx.createRadialGradient(128, 128, 2, 128, 128, 128);
  solGrad.addColorStop(0.0, 'rgba(255,252,238,1)');
  solGrad.addColorStop(0.12, 'rgba(255,240,200,0.95)');
  solGrad.addColorStop(0.30, 'rgba(255,210,150,0.75)');
  solGrad.addColorStop(0.55, 'rgba(255,170,110,0.35)');
  solGrad.addColorStop(0.85, 'rgba(255,150,90,0.10)');
  solGrad.addColorStop(1.0, 'rgba(255,140,80,0)');
  solCtx.fillStyle = solGrad;
  solCtx.fillRect(0, 0, 256, 256);
  const solTex = new BABYLON.Texture(solCanvas.toDataURL(), scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  solTex.hasAlpha = true;
  textures.push(solTex);
  const solMat = alphaMat('sol-dorado', '#ffffff', 1, '#fff2c8');
  solMat.albedoTexture = solTex;
  solMat.emissiveTexture = solTex;
  solMat.emissiveColor = new BABYLON.Color3(1.0, 0.92, 0.78);
  solMat.useAlphaFromAlbedoTexture = true;
  const sol = mesh(BABYLON.MeshBuilder.CreatePlane('disco-solar', { width: 18, height: 18 }, scene));
  sol.position.set(48, 22, -150);
  sol.material = solMat;
  sol.applyFog = false;
  sol.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_NONE;

  /* ============================================================
     2. MONTAÑAS — capas de siluetas pintadas sobre planos 2.5D
     (Trine 4 / Planet of Lana: el fondo se pinta, no se modela).
     Cada capa es un plano ancho con su silueta dibujada y un
     gradiente de color de fondo. La profundidad se logra con
     separacion en Z + niebla atmosférica.
     ============================================================ */
  const mountainLayers: BABYLON.Mesh[] = [];
  /** Construye la silueta pintada de una cordillera, devuelve un Babylon.Texture. */
  const makeMountainTexture = (topColor: string, midColor: string, baseColor: string, fogColor: string, scale: number, seed: number): BABYLON.Texture => {
    const W = 1024; const H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, fogColor);
    sky.addColorStop(0.55, fogColor);
    sky.addColorStop(1, '#0d0f12');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const baseY = H * 0.55;
    const xs: number[] = [];
    const peaks: number[] = [];
    const segments = 80;
    const span = 600;
    for (let i = 0; i < segments; i++) {
      const x = (i / (segments - 1)) * span - 50;
      xs.push(x);
      const macro = Math.abs(Math.sin(seed + i * 0.18)) * 130;
      const meso = Math.abs(Math.cos(seed * 1.7 + i * 0.5)) * 60;
      const detail = Math.abs(Math.sin(seed * 2.3 + i * 1.4)) * 25;
      const peak = 30 + macro + meso + detail;
      peaks.push(peak * scale);
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, baseY);
    for (let i = 0; i < segments; i++) {
      ctx.lineTo(xs[i], baseY - peaks[i]);
    }
    ctx.lineTo(W, baseY);
    ctx.lineTo(W, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, topColor);
    g.addColorStop(0.45, midColor);
    g.addColorStop(1, baseColor);
    ctx.fillStyle = g;
    ctx.fill();
    for (let i = 0; i < segments; i++) {
      const px = xs[i];
      const py = baseY - peaks[i];
      if (peaks[i] < 30 * scale) continue;
      ctx.fillStyle = `rgba(255,250,235,${0.35 - (i % 3) * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(px, py + 6, 14 + (i % 5) * 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(20,28,40,0.32)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      const x0 = (i / 14) * W;
      const y0 = baseY + 20;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let j = 0; j < 6; j++) {
        ctx.lineTo(x0 + Math.sin(i + j) * 30, y0 + j * 24);
      }
      ctx.stroke();
    }
    const t = new BABYLON.Texture(c.toDataURL(), scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
    t.hasAlpha = true;
    t.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    t.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    textures.push(t);
    return t;
  };
  // Crea una capa de fondo: plano ancho con la silueta pintada.
  const makeMountain = (z: number, topColor: string, midColor: string, baseColor: string, scale: number, seed: number, fogged: boolean): void => {
    const SKY_FOG = '#cdd6e0';
    const tex = makeMountainTexture(topColor, midColor, baseColor, SKY_FOG, scale, seed);
    const plane = mesh(BABYLON.MeshBuilder.CreatePlane(`montana-pintada-${z}`, { width: 220, height: 90 }, scene));
    plane.position.set(0, 12, z);
    const mat = new BABYLON.PBRMaterial(`mat-montana-${z}`, scene);
    mat.albedoTexture = tex;
    mat.useAlphaFromAlbedoTexture = true;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    mat.backFaceCulling = false;
    mat.emissiveTexture = tex;
    // El emissive hace que la montaña brille a través de la niebla.
    mat.emissiveColor = new BABYLON.Color3(0.55, 0.55, 0.62);
    mat.environmentIntensity = 0.05;
    mat.specularIntensity = 0;
    mat.roughness = 1;
    plane.material = mat;
    plane.applyFog = fogged;
    mountainLayers.push(plane);
  };
  // 4 capas, ordenadas de más lejana a más cercana. Las más lejanas son
  // pálidas; las más cercanas más oscuras. Las separamos en Z NEGATIVO
  // (detrás del cornisa) para que no ocluyan el primer plano. Las más
  // lejanas se difuminan con la niebla; las cercanas no.
  // Las montañas pintadas ahora son globales en babylonWorld.ts (cubren todo
  // el mundo). Cascade sólo aporta cielo + sol + nubes + cascada.
  void makeMountain; // mantener el helper disponible para reutilización futura

  /* ============================================================
     3. NUBES — clusters volumétricos a varias profundidades
     ============================================================ */
  const cloudMat = alphaMat('nubes-volumetricas', '#e8edf0', 0.55, '#b8c9d2');
  cloudMat.environmentIntensity = 0.05;
  const nubes: BABYLON.Mesh[] = [];
  interface NubeSpec { x: number; y: number; z: number; s: number; }
  const nubesSpec: NubeSpec[] = [
    { x: -14, y: 13, z: 18, s: 2.6 },
    { x: 22,  y: 16, z: 22, s: 3.2 },
    { x: 33,  y: 10, z: 14, s: 2.0 },
    { x:  4,  y: 20, z: 24, s: 1.8 },
    { x: -2,  y: 22, z: 28, s: 1.5 },
    { x: 14,  y: 18, z: 26, s: 1.4 },
  ];
  for (const n of nubesSpec) {
    for (let i = 0; i < 5; i++) {
      const c = mesh(BABYLON.MeshBuilder.CreateSphere('nube-volumetrica', { diameter: n.s * (0.85 + i * 0.16), segments: 10 }, scene));
      c.material = cloudMat;
      c.scaling.y = 0.32;
      c.position.set(n.x + (i - 2) * n.s * 0.55, n.y + Math.sin(i * 0.9) * 0.3, n.z + i * 0.12);
      c.applyFog = true;
      nubes.push(c);
    }
  }

  /* ============================================================
     4. ROCAS — clusters heterogéneos (Trine 5: bulto, no orbe)
     ============================================================ */
  const rockMat = makePbr('roca-pbr-moss-weathering', PALETA.rocaFría, { roughness: 0.96 });
  const rockWarmMat = makePbr('roca-pbr-calida', PALETA.rocaCálida, { roughness: 0.93 });
  const mossMat = makePbr('musgo-esmeralda', PALETA.musgo, { roughness: 1 });
  const mossDarkMat = makePbr('musgo-sombra', PALETA.musgoBajo, { roughness: 1 });
  const pebbleMat = makePbr('roca-gravilla', '#7a7468', { roughness: 0.95 });

  interface ClusterSpec { x: number; y: number; z: number; scale: number; rot: number; }
  const clusterSpecs: ClusterSpec[] = [
    { x: -14.5, y: 0.55, z: 0.2, scale: 1.3, rot: 0.12 },
    { x:  13.6, y: 0.55, z: -0.1, scale: 1.4, rot: -0.18 },
    { x:   4.8, y: 0.32, z: 0.5, scale: 0.55, rot: 0.4 },
    { x:  -4.2, y: 0.28, z: 0.85, scale: 0.42, rot: -0.3 },
    { x:  -8.5, y: 0.30, z: 0.7, scale: 0.5, rot: 0.8 },
     { x:  10.0, y: 0.30, z: 0.9, scale: 0.5, rot: -0.5 },
  ];

  for (const c of clusterSpecs) {
    const group = new BABYLON.TransformNode(`cluster-${c.x}`, scene);
    group.position.set(c.x, c.y, c.z);
    group.rotation.y = c.rot;
    const baseScale = c.scale;
    // 2-3 boulders por cluster
    const boulders = 2 + Math.floor((Math.abs(Math.sin(c.x))) * 2);
    for (let i = 0; i < boulders; i++) {
      const r = mesh(BABYLON.MeshBuilder.CreateIcoSphere('roca-boulder', { radius: baseScale * (0.55 + i * 0.18), subdivisions: 2, flat: true }, scene));
      r.material = i % 2 === 0 ? rockMat : rockWarmMat;
      r.scaling.set(1.35 + Math.sin(c.x + i) * 0.18, 0.78 + i * 0.06, 0.9 + Math.cos(c.x + i) * 0.14);
      r.position.set(
        (i - 1) * baseScale * 0.42 + Math.sin(c.x * 3 + i) * 0.08,
        (i - 1) * baseScale * 0.08,
        (i - 1) * baseScale * 0.22 + Math.cos(c.x * 2 + i) * 0.06
      );
      r.parent = group;
      r.receiveShadows = true;
      shadows.addShadowCaster(r);
    }
    // 2-3 pebbles (gravilla) alrededor del cluster
    for (let i = 0; i < 3; i++) {
      const p = mesh(BABYLON.MeshBuilder.CreateIcoSphere('roca-pebble', { radius: baseScale * 0.13, subdivisions: 1, flat: true }, scene));
      p.material = pebbleMat;
      p.scaling.set(1.2, 0.6, 1.0);
      const angle = (i / 3) * Math.PI * 2 + c.x;
      p.position.set(Math.cos(angle) * baseScale * 0.95, -baseScale * 0.15, Math.sin(angle) * baseScale * 0.55);
      p.parent = group;
      p.receiveShadows = true;
      shadows.addShadowCaster(p);
    }
    // 1-2 parches de musgo sobre el boulder mayor
    const moss = mesh(BABYLON.MeshBuilder.CreateSphere('parche-musgo', { diameter: baseScale * 1.05, segments: 8 }, scene));
    moss.material = mossMat;
    moss.scaling.set(1.05, 0.14, 0.85);
    moss.position.set(-baseScale * 0.18, baseScale * 0.62, -baseScale * 0.42);
    moss.parent = group;
    const moss2 = mesh(BABYLON.MeshBuilder.CreateSphere('parche-musgo-2', { diameter: baseScale * 0.6, segments: 6 }, scene));
    moss2.material = mossDarkMat;
    moss2.scaling.set(1.0, 0.1, 0.7);
    moss2.position.set(baseScale * 0.25, baseScale * 0.5, baseScale * 0.1);
    moss2.parent = group;
  }

  /* ============================================================
     5. CORNISA — bloque estratificado con borde pintado y textura
     ============================================================ */
  // Textura del suelo: generada con mmx-cli (plank-top-clean_001.jpg),
  // tablas de madera con grano y nudos, sin hojas ni bordes heterogéneos.
  // La imagen es 1024x1024; en wrap repeat con uScale=1, vScale=0.5 da
  // tablas legibles a lo largo de los 38u del cornisa sin pixelarse.
  // URL absoluta (ver nota en babylonWorld.ts backdrop).
  const cornisaTex = new BABYLON.Texture(
    '/assets/physica/textures/plank-top-clean_001.jpg',
    scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  cornisaTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  cornisaTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  cornisaTex.uScale = 2;
  cornisaTex.vScale = 1;
  textures.push(cornisaTex);

  const groundMat = makePbr('cornisa-roca-arcilla', '#ffffff', { roughness: 0.95 });
  groundMat.albedoTexture = cornisaTex;
  groundMat.environmentIntensity = 0.18;
  /* Ground plane horizontal que extiende la cornisa lateralmente y
     hacia atrás. Cubre el "navy void" que aparecía entre la cornisa y el
     backdrop en vistas lejanas (dolly, metrópolis). Tamaño 400x400 con
     uScale=8 vScale=8 — la textura de tierra/grava (ground-dirt-tile,
     mmx-cli) es tileable y se repite sin costuras obvias. */
  const groundTex2 = new BABYLON.Texture(
    '/assets/physica/textures/ground-dirt-tile_001.jpg',
    scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  groundTex2.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  groundTex2.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  groundTex2.uScale = 8;
  groundTex2.vScale = 8;
  textures.push(groundTex2);
  const groundExtMat = makePbr('ground-extendido', '#ffffff', { roughness: 0.95 });
  groundExtMat.albedoTexture = groundTex2;
  groundExtMat.environmentIntensity = 0.15;
  // leve tinte cálido para que case con el alpenglow violeta-rosa del
  // backdrop, sin teñir tanto como para perder el detalle de la grava.
  groundExtMat.albedoColor = new BABYLON.Color3(0.78, 0.68, 0.55);
  const groundExt = mesh(BABYLON.MeshBuilder.CreateGround('ground-extendido', { width: 400, height: 400 }, scene));
  groundExt.material = groundExtMat;
  groundExt.position.set(0, -0.71, 0);
  groundExt.receiveShadows = true;
  const cornisaMat = makePbr('cornisa-húmeda', PALETA.cornisaHúmeda, { roughness: 0.88 });
  const cornisaTop = mesh(BABYLON.MeshBuilder.CreateBox('cornisa-estratificada', { width: 38, height: 0.7, depth: 4.6 }, scene));
  cornisaTop.material = groundMat;
  cornisaTop.position.set(0, -0.35, 0);
  cornisaTop.receiveShadows = true;
  // borde inferior — más oscuro, más erosionado
  const cornisaBorde = mesh(BABYLON.MeshBuilder.CreateBox('cornisa-borde', { width: 38, height: 0.35, depth: 4.7 }, scene));
  cornisaBorde.material = cornisaMat;
  cornisaBorde.position.set(0, -0.85, 0);
  cornisaBorde.receiveShadows = true;
  // repisa interior: una banda de roca más oscura frente al lago, refuerza
  // la sensación de cornisa real y no un rectángulo flotante.
  const cornisaBanda = mesh(BABYLON.MeshBuilder.CreateBox('cornisa-banda-erosion', { width: 38, height: 0.4, depth: 0.6 }, scene));
  cornisaBanda.material = makePbr('cornisa-banda', '#3a2e22', { roughness: 1 });
  cornisaBanda.position.set(0, -0.55, 2.2);
  cornisaBanda.receiveShadows = true;
  // detalle de "saliente" a la izquierda: la cornisa se quiebra en un
  // afloramiento rocoso, da silueta interesante al horizonte.
  const salienteGeo = mesh(BABYLON.MeshBuilder.CreateIcoSphere('saliente-rocoso', { radius: 1.6, subdivisions: 2, flat: true }, scene));
  salienteGeo.material = rockWarmMat;
  salienteGeo.scaling.set(1.3, 0.55, 0.7);
  salienteGeo.position.set(-15, -0.1, 0.5);
  salienteGeo.rotation.y = 0.4;
  salienteGeo.receiveShadows = true;
  shadows.addShadowCaster(salienteGeo);
  const salienteMusgo = mesh(BABYLON.MeshBuilder.CreateSphere('saliente-musgo', { diameter: 2.4, segments: 8 }, scene));
  salienteMusgo.material = mossMat;
  salienteMusgo.scaling.set(1.05, 0.18, 0.65);
  salienteMusgo.position.set(-15.3, 0.55, 0.4);
  salienteMusgo.receiveShadows = true;

  /* ============================================================
     6. VEGETACIÓN — hand-painted Canvas + planos alpha
     ============================================================ */
  // Textura 1: manojo de hierba (5 hojas)
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = 64; grassCanvas.height = 64;
  {
    const g = grassCanvas.getContext('2d')!;
    g.clearRect(0, 0, 64, 64);
    const blades = [
      { x: 32, h: 56, w: 3, c: '#a9b466' },
      { x: 22, h: 48, w: 2.5, c: '#7a8a4a' },
      { x: 42, h: 50, w: 2.5, c: '#c2b870' },
      { x: 16, h: 36, w: 2, c: '#5a6a3a' },
      { x: 46, h: 38, w: 2, c: '#8a945a' },
      { x: 36, h: 44, w: 2, c: '#b8a868' },
    ];
    for (const b of blades) {
      g.strokeStyle = b.c;
      g.lineWidth = b.w;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(b.x, 64);
      g.quadraticCurveTo(b.x + Math.sin(b.x) * 2, 64 - b.h * 0.55, b.x + Math.sin(b.x * 1.3) * 3, 64 - b.h);
      g.stroke();
    }
  }
  const grassTex = new BABYLON.Texture(grassCanvas.toDataURL(), scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  grassTex.hasAlpha = true;
  textures.push(grassTex);

  // Textura 2: helecho (silueta lobulada)
  const fernCanvas = document.createElement('canvas');
  fernCanvas.width = 128; fernCanvas.height = 128;
  {
    const g = fernCanvas.getContext('2d')!;
    g.clearRect(0, 0, 128, 128);
    g.translate(64, 124);
    g.fillStyle = '#3d5a3a';
    g.strokeStyle = '#2e4a30';
    g.lineWidth = 2;
    // Tallo
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(-3, -30, -4, -60);
    g.quadraticCurveTo(-2, -90, 4, -118);
    g.stroke();
    // Pinnas
    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const y = -10 - t * 100;
      const w = 18 * (1 - t * 0.65);
      // izquierda
      g.beginPath();
      g.ellipse(-w / 2 - 2, y, w / 2, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      // derecha
      g.beginPath();
      g.ellipse(w / 2 + 2, y, w / 2, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
  }
  const fernTex = new BABYLON.Texture(fernCanvas.toDataURL(), scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  fernTex.hasAlpha = true;
  textures.push(fernTex);

  const grassMat = makePbr('hierba-dorada', '#ffffff', { roughness: 1, alpha: 1 });
  grassMat.albedoTexture = grassTex;
  grassMat.useAlphaFromAlbedoTexture = true;
  grassMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  grassMat.backFaceCulling = false;
  grassMat.emissiveTexture = grassTex;
  grassMat.emissiveColor = new BABYLON.Color3(0.18, 0.16, 0.08);
  grassMat.emissiveIntensity = 0.4;

  const fernMat = makePbr('helecho-silueta', '#ffffff', { roughness: 1, alpha: 1 });
  fernMat.albedoTexture = fernTex;
  fernMat.useAlphaFromAlbedoTexture = true;
  fernMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  fernMat.backFaceCulling = false;
  fernMat.emissiveTexture = fernTex;
  fernMat.emissiveColor = new BABYLON.Color3(0.1, 0.16, 0.08);
  fernMat.emissiveIntensity = 0.3;

  // Dispersión de hierba a lo largo del borde de la cornisa.
  interface GrassSpec { x: number; z: number; s: number; rot: number; }
  const grassSpecs: GrassSpec[] = [
    { x: -13.5, z: -0.5, s: 1.1, rot: 0 },
    { x: -10.0, z: -0.6, s: 0.9, rot: 0.4 },
    { x:  -7.5, z: -0.4, s: 1.2, rot: -0.2 },
    { x:  -4.8, z: -0.7, s: 1.0, rot: 0.1 },
    { x:  -2.0, z: -0.5, s: 1.4, rot: -0.3 },
    { x:   1.6, z: -0.6, s: 1.1, rot: 0.2 },
    { x:   4.4, z: -0.4, s: 0.8, rot: -0.4 },
    { x:   6.8, z: -0.7, s: 1.2, rot: 0.3 },
    { x:  12.8, z: -0.5, s: 1.0, rot: -0.2 },
    { x: -15.5, z: -0.3, s: 0.7, rot: 0.5 },
    { x:  -0.5, z: -0.3, s: 0.9, rot: 0 },
  ];
  for (const g of grassSpecs) {
    const tuft = mesh(BABYLON.MeshBuilder.CreatePlane('tuft-hierba', { width: 0.9 * g.s, height: 1.4 * g.s }, scene));
    tuft.material = grassMat;
    tuft.position.set(g.x, 0.72, g.z);
    tuft.rotation.y = g.rot;
    tuft.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_Y;
  }
  // Helechos: 6 unidades, agrupadas junto a las rocas.
  const fernSpecs: { x: number; z: number; s: number; rot: number }[] = [
    { x: -13.8, z: -0.6, s: 1.1, rot: 0.4 },
    { x: -13.4, z: 0.7,  s: 0.9, rot: -0.2 },
    { x:  13.2, z: 0.8,  s: 1.1, rot: 0.6 },
    { x:  13.7, z: -0.4, s: 0.85, rot: -0.4 },
    { x:  10.4, z: -0.7, s: 0.7,  rot: 0.2 },
    { x:  -8.2, z: -0.7, s: 0.7,  rot: -0.5 },
  ];
  for (const f of fernSpecs) {
    const fern = mesh(BABYLON.MeshBuilder.CreatePlane('helecho-billboard', { width: 1.4 * f.s, height: 1.8 * f.s }, scene));
    fern.material = fernMat;
    fern.position.set(f.x, 0.95, f.z);
    fern.rotation.y = f.rot;
  }

  /* ============================================================
     7. LAGO — plano translúcido que se extiende bajo la cascada
     ============================================================ */
  const waterCanvas = document.createElement('canvas');
  waterCanvas.width = 64; waterCanvas.height = 256;
  const waterCtx = waterCanvas.getContext('2d')!;
  const wg = waterCtx.createLinearGradient(0, 0, 64, 0);
  wg.addColorStop(0, PALETA.aguaTono);
  wg.addColorStop(0.5, PALETA.aguaLuz);
  wg.addColorStop(1, PALETA.aguaProfunda);
  waterCtx.fillStyle = wg;
  waterCtx.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 8) {
    waterCtx.fillStyle = `rgba(255,255,255,${0.10 + (y % 24) / 140})`;
    waterCtx.fillRect(0, y, 64, 3);
  }
  const waterTex = new BABYLON.Texture(waterCanvas.toDataURL(), scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
  waterTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  waterTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  textures.push(waterTex);

  // Lago: plano translúcido más grande y reflectivo, ancla la cascada visualmente.
  const lakeMat = makePbr('lago-translucido', PALETA.aguaProfunda, { alpha: 0.78, emissive: '#1a4a6a' });
  lakeMat.albedoTexture = waterTex;
  lakeMat.emissiveTexture = waterTex;
  lakeMat.specularIntensity = 1.6;
  lakeMat.roughness = 0.25;
  lakeMat.metallic = 0.05;
  const lake = mesh(BABYLON.MeshBuilder.CreatePlane('lago-base', { width: 22, height: 14 }, scene));
  lake.material = lakeMat;
  lake.rotation.x = Math.PI / 2;
  lake.position.set(9, -0.55, -2.0);

  /* ============================================================
     8. CASCADA — 4 cintas con alpha-blend + niebla volumétrica
     ============================================================ */
  // Textura de columna de agua: chorro ascendente con bandas de densidad.
  const chorroCanvas = document.createElement('canvas');
  chorroCanvas.width = 32; chorroCanvas.height = 256;
  const chorroCtx = chorroCanvas.getContext('2d')!;
  const chorroGrad = chorroCtx.createLinearGradient(0, 0, 0, 256);
  chorroGrad.addColorStop(0, 'rgba(168,239,255,0.40)');
  chorroGrad.addColorStop(0.5, 'rgba(120,200,235,0.60)');
  chorroGrad.addColorStop(1, 'rgba(40,120,160,0.85)');
  chorroCtx.fillStyle = chorroGrad;
  chorroCtx.fillRect(0, 0, 32, 256);
  for (let i = 0; i < 32; i++) {
    const y = i * 8;
    const x = 8 + Math.sin(i * 0.55) * 6;
    chorroCtx.fillStyle = `rgba(255,255,255,${0.06 + (i % 3) * 0.04})`;
    chorroCtx.fillRect(x, y, 4, 6);
  }
  const chorroTex = new BABYLON.Texture(chorroCanvas.toDataURL(), scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
  chorroTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  textures.push(chorroTex);

  const cintaAgua = (i: number, alpha: number, emissive: string): BABYLON.PBRMaterial => {
    const m = makePbr(`cascada-cinta-${i}`, '#ffffff', { alpha, emissive });
    m.albedoTexture = chorroTex;
    m.emissiveTexture = chorroTex;
    m.emissiveColor = BABYLON.Color3.FromHexString(emissive);
    m.roughness = 0.4;
    m.specularIntensity = 1.4;
    m.backFaceCulling = false;
    return m;
  };
  // Cascada: ahora más ancha (×1.6) y con 5 cintas para profundidad real.
  const CASCADA_SCALE_W = 1.6;
  const CASCADA_SCALE_H = 1.05;
  const cintasCount = 5;
  const cintas: BABYLON.Mesh[] = [];
  for (let i = 0; i < cintasCount; i++) {
    const w = BABYLON.MeshBuilder.CreatePlane(`cascada-volumen-${i}`, {
      width: (CASCADA_ANCHO * CASCADA_SCALE_W) - i * 0.5,
      height: (CASCADA_TOPE + 0.5) * CASCADA_SCALE_H,
    }, scene);
    const mat = cintaAgua(
      i,
      [0.78, 0.58, 0.40, 0.24, 0.12][i],
      ['#2a6e8c', '#4a98b8', '#6ec0d8', '#92dde8', '#c4ecf4'][i],
    );
    w.material = mat;
    w.position.set(CASCADA_CENTRO, (CASCADA_TOPE * CASCADA_SCALE_H) / 2, -0.6 - i * 0.22);
    cintas.push(mesh(w));
  }

  // Halo de luz alrededor de la cascada: refuerza el "shaft" volumétrico.
  // Ahora más ancho (×2) y más luminoso para anclar visualmente la cascada.
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 64; haloCanvas.height = 256;
  const haloCtx = haloCanvas.getContext('2d')!;
  const haloGrad = haloCtx.createLinearGradient(0, 0, 64, 0);
  haloGrad.addColorStop(0, 'rgba(168,239,255,0)');
  haloGrad.addColorStop(0.40, 'rgba(168,239,255,0.42)');
  haloGrad.addColorStop(0.50, 'rgba(220,250,255,0.55)');
  haloGrad.addColorStop(0.60, 'rgba(168,239,255,0.42)');
  haloGrad.addColorStop(1, 'rgba(168,239,255,0)');
  haloCtx.fillStyle = haloGrad;
  haloCtx.fillRect(0, 0, 64, 256);
  const haloTex = new BABYLON.Texture(haloCanvas.toDataURL(), scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
  textures.push(haloTex);
  const haloMat = alphaMat('cascada-halo', '#ffffff', 0.85, '#c0f0ff');
  haloMat.albedoTexture = haloTex;
  haloMat.emissiveTexture = haloTex;
  haloMat.emissiveColor = new BABYLON.Color3(0.55, 0.85, 1.0);
  haloMat.environmentIntensity = 0.06;
  const halo = mesh(BABYLON.MeshBuilder.CreatePlane('cascada-halo-plano', { width: CASCADA_ANCHO * 2.4, height: CASCADA_TOPE * 1.15 }, scene));
  halo.material = haloMat;
  halo.position.set(CASCADA_CENTRO, CASCADA_TOPE * 0.55, -1.4);

  // Shaft de luz "godray" diagonal (Trine 5 / INSIDE inspiration).
  const shaftCanvas = document.createElement('canvas');
  shaftCanvas.width = 32; shaftCanvas.height = 256;
  const shaftCtx = shaftCanvas.getContext('2d')!;
  const shaftGrad = shaftCtx.createLinearGradient(0, 0, 32, 0);
  shaftGrad.addColorStop(0, 'rgba(255,238,200,0)');
  shaftGrad.addColorStop(0.5, 'rgba(255,238,200,0.28)');
  shaftGrad.addColorStop(1, 'rgba(255,238,200,0)');
  shaftCtx.fillStyle = shaftGrad;
  shaftCtx.fillRect(0, 0, 32, 256);
  const shaftTex = new BABYLON.Texture(shaftCanvas.toDataURL(), scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
  textures.push(shaftTex);
  const shaftMat = alphaMat('godray-cascada', '#fff0c0', 0.4, '#fff0c0');
  shaftMat.albedoTexture = shaftTex;
  shaftMat.emissiveTexture = shaftTex;
  shaftMat.emissiveColor = new BABYLON.Color3(0.7, 0.6, 0.45);
  shaftMat.environmentIntensity = 0.05;
  const shaft = mesh(BABYLON.MeshBuilder.CreatePlane('godray-shaft', { width: 8, height: 28 }, scene));
  shaft.material = shaftMat;
  shaft.position.set(CASCADA_CENTRO + 1.4, 14, -0.6);
  shaft.rotation.z = -0.18;

  // Espuma: disco base + dos animaciones de pulso.
  const foamMat = alphaMat('espuma-blanca', PALETA.aguaEspuma, 0.85, '#9bdcf0');
  foamMat.environmentIntensity = 0.2;
  const foam = mesh(BABYLON.MeshBuilder.CreateDisc('espuma-base', { radius: 1.4, tessellation: 32 }, scene));
  foam.material = foamMat;
  foam.rotation.x = Math.PI / 2;
  foam.position.set(CASCADA_CENTRO, LAGO_Y + 0.08, -0.45);
  foam.scaling.x = 2.1;

  /* ============================================================
     9. SPRAY Y NIEBLA — partículas no motor-físico
     ============================================================ */
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 32; particleCanvas.height = 32;
  const pc = particleCanvas.getContext('2d')!;
  const pg = pc.createRadialGradient(16, 16, 1, 16, 16, 16);
  pg.addColorStop(0, '#ffffff');
  pg.addColorStop(0.4, '#bceeff');
  pg.addColorStop(1, 'transparent');
  pc.fillStyle = pg;
  pc.fillRect(0, 0, 32, 32);
  const particleTexture = new BABYLON.Texture(particleCanvas.toDataURL(), scene);
  particleTexture.hasAlpha = true;
  textures.push(particleTexture);

  const makeParticles = (
    name: string,
    emitter: BABYLON.Vector3,
    rate: number,
    size: number,
    power: number,
    gravity: BABYLON.Vector3,
    options: { minLife: number; maxLife: number; color1: BABYLON.Color4; color2: BABYLON.Color4 } = {
      minLife: 1.4, maxLife: 3.8,
      color1: new BABYLON.Color4(1, 1, 1, 0.7),
      color2: new BABYLON.Color4(0.7, 0.9, 1.0, 0.1),
    },
  ): BABYLON.ParticleSystem => {
    const p = new BABYLON.ParticleSystem(name, 800, scene);
    p.particleTexture = particleTexture;
    p.emitter = emitter;
    const e = new BABYLON.BoxParticleEmitter();
    e.minEmitBox = new BABYLON.Vector3(-CASCADA_ANCHO / 2 - 0.1, -0.05, -0.5);
    e.maxEmitBox = new BABYLON.Vector3(CASCADA_ANCHO / 2 + 0.1, 0.05, 0.5);
    e.direction1 = new BABYLON.Vector3(-0.5, 0.7, -0.3);
    e.direction2 = new BABYLON.Vector3(0.5, 1.2, 0.3);
    p.particleEmitterType = e;
    p.emitRate = rate;
    p.minLifeTime = options.minLife;
    p.maxLifeTime = options.maxLife;
    p.minSize = size * 0.45;
    p.maxSize = size;
    p.minEmitPower = power * 0.5;
    p.maxEmitPower = power;
    p.gravity = gravity;
    p.color1 = options.color1;
    p.color2 = options.color2;
    p.addColorGradient(0.0, options.color1);
    p.addColorGradient(1.0, options.color2);
    p.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    p.updateSpeed = 0.012;
    if (!ctx.prefersReducedMotion) p.start();
    particles.push(p);
    return p;
  };

  makeParticles('niebla-cascada', new BABYLON.Vector3(CASCADA_CENTRO, LAGO_Y + 0.2, -0.3),
    110, 0.46, 1.2, new BABYLON.Vector3(0, 0.55, 0),
    { minLife: 1.8, maxLife: 4.0, color1: new BABYLON.Color4(1, 1, 1, 0.5), color2: new BABYLON.Color4(0.62, 0.78, 0.86, 0) });
  makeParticles('salpicadura-cascada', new BABYLON.Vector3(CASCADA_CENTRO, LAGO_Y + 0.25, 0),
    90, 0.18, 3.4, new BABYLON.Vector3(0, -1.4, 0),
    { minLife: 0.6, maxLife: 1.6, color1: new BABYLON.Color4(1, 1, 1, 0.85), color2: new BABYLON.Color4(0.78, 0.92, 1.0, 0) });
  makeParticles('polen-atmosferico', new BABYLON.Vector3(0, 4, 1.5),
    24, 0.11, 0.35, new BABYLON.Vector3(0, 0.05, 0),
    { minLife: 2.5, maxLife: 5.0, color1: new BABYLON.Color4(1.0, 0.92, 0.7, 0.45), color2: new BABYLON.Color4(1.0, 0.85, 0.6, 0) });

  /* ============================================================
     10. GOTAS QUE SUBEN — usan la ascendente analítica
     ============================================================ */
  /**
   * El chorro de agua es analítico (a = +g), no un fakery de partícula.
   * Cada "gota grande" usa la integración cerrada de caidaLibre.ts.
   * Eso garantiza que la cascada ascendente SEA lo que dice ser.
   */
  interface Gota {
    mesh: BABYLON.Mesh;
    estado: MruvIntegrada;
  }
  const gotas: Gota[] = [];
  const gotasCount = 90;
  for (let i = 0; i < gotasCount; i++) {
    const droplet = mesh(BABYLON.MeshBuilder.CreateSphere('gota-ascendente', { diameter: 0.18 + (i % 3) * 0.06, segments: 8 }, scene));
    const dropletMat = makePbr('gota-ascendente-mat', '#dffaff', { alpha: 0.92, emissive: '#a8efff' });
    dropletMat.environmentIntensity = 0.45;
    dropletMat.specularIntensity = 1.6;
    droplet.material = dropletMat;
    const desfase = (i / gotasCount) * 2.4; // 2.4s de desfase entre gotas
    const xJitter = (((i * 0.13) % 1) - 0.5) * ((CASCADA_ANCHO * CASCADA_SCALE_W) - 0.4);
    gotas.push({
      mesh: droplet,
      estado: { y: LAGO_Y, v: 0, t: -desfase },
    });
    droplet.position.set(CASCADA_CENTRO + xJitter, LAGO_Y, -0.05 - (i % 3) * 0.12);
  }

  /* ============================================================
     11. ONDAS DEL LAGO — tori emisivos pulsantes
     ============================================================ */
  const ripples: BABYLON.Mesh[] = [];
  const ripplesSpec: Array<[number, number, number, string]> = [
    [8.2, -0.75, 1.1, '#b7e9ff'],
    [9.5,  0.55, 0.8, '#cdefff'],
    [11.2, -0.45, 1.35, '#aeeaff'],
    [12.1, 0.7,  0.65, '#dffaff'],
    [13.5, 0.0, 1.0, '#cfefff'],
    [6.5,  0.0, 0.9, '#cfeeff'],
  ];
  for (const [x, z, size, hex] of ripplesSpec) {
    const r = mesh(BABYLON.MeshBuilder.CreateTorus('onda-lago', { diameter: size, thickness: 0.04, tessellation: 32 }, scene));
    r.rotation.x = Math.PI / 2;
    r.position.set(x, 0.18, z);
    const rMat = alphaMat('reflejo-lago', hex, 0.55, '#3a7a98');
    rMat.emissiveColor = BABYLON.Color3.FromHexString('#3a8aac');
    r.material = rMat;
    ripples.push(r);
  }

  /* ============================================================
     12. CHORRO ANALÍTICO — la cascada ascendente se anima desde
     `cascadaAscendente.ts`. Por debajo del modelo, animamos la
     posición vertical del plano frontal para que la cortina suba
     en cámara (el frente del chorro en realidad es invisible a
     este ángulo, pero la silueta del planoi-físico sube con g).
     ============================================================ */
  let chorroEstado: MruvIntegrada = { y: LAGO_Y, v: 0, t: 0 };

  /* ============================================================
     13. FRENTE DEL CHORRO — un disco sutil que "viaja" hacia el cielo
     ============================================================ */
  const frenteCanvas = document.createElement('canvas');
  frenteCanvas.width = 64; frenteCanvas.height = 64;
  {
    const c = frenteCanvas.getContext('2d')!;
    const g = c.createRadialGradient(32, 32, 2, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(160,235,255,0.6)');
    g.addColorStop(1, 'rgba(40,120,160,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  }
  const frenteTex = new BABYLON.Texture(frenteCanvas.toDataURL(), scene);
  frenteTex.hasAlpha = true;
  textures.push(frenteTex);
  const frenteMat = alphaMat('frente-chorro', '#ffffff', 0.7, '#bce8f0');
  frenteMat.albedoTexture = frenteTex;
  frenteMat.emissiveTexture = frenteTex;
  frenteMat.emissiveColor = new BABYLON.Color3(0.85, 0.95, 1.0);
  const frente = mesh(BABYLON.MeshBuilder.CreatePlane('frente-chorro-plano', { width: 2.6, height: 0.6 }, scene));
  frente.material = frenteMat;
  frente.position.set(CASCADA_CENTRO, LAGO_Y, 0.4);
  frente.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_Y;

  /* ============================================================
     14. UPDATE — animación viva
     ============================================================ */
  return {
    update(time, dt, motionScale) {
      chorroEstado = integrar(chorroEstado, dt * motionScale, GRAVEDAD);
      if (chorroEstado.y > CIELO_Y) chorroEstado = { y: LAGO_Y, v: 0, t: 0 };
      // Las cintas: leve ondulación de offset vertical para que se sienta vivo.
      for (let i = 0; i < cintas.length; i++) {
        cintas[i].position.y = CASCADA_TOPE / 2 + Math.sin(time * 0.6 + i * 0.7) * 0.22;
      }
      // Halo: respira con un latido lento.
      halo.scaling.y = 1 + Math.sin(time * 0.5) * 0.04;
      halo.scaling.x = 1 + Math.sin(time * 0.4) * 0.02;
      // Shaft: gira muy suavemente.
      shaft.rotation.z = -0.18 + Math.sin(time * 0.18) * 0.04;
      shaft.position.x = CASCADA_CENTRO + 1.4 + Math.sin(time * 0.3) * 0.4;
      // Frente del chorro: viaja hacia arriba con la analítica.
      frente.position.y = chorroEstado.y;
      frente.scaling.x = 1 + Math.sin(time * 4) * 0.06;
      // Gotas individuales: cada una con su desfase; integración cerrada.
      for (const g of gotas) {
        const e = integrar(g.estado, dt * motionScale, GRAVEDAD);
        if (e.y > CIELO_Y) {
          g.estado = { y: LAGO_Y, v: 0, t: -(Math.random() * 0.5) };
        } else {
          g.estado = e;
        }
        g.mesh.position.y = g.estado.y;
      }
      // Espuma: pulso en Y para que "respire".
      foam.position.y = LAGO_Y + 0.08 + Math.sin(time * 1.4) * 0.02;
      // Ondas: palpitan con fase propia.
      for (const r of ripples) {
        const pulse = 1 + Math.sin(time * 2 + r.position.x) * 0.12;
        r.scaling.x = pulse;
        r.scaling.z = pulse;
      }
      // Agua (textura): animación de offset.
      waterTex.vOffset = -time * 0.24 * motionScale;
      chorroTex.vOffset = -time * 0.6 * motionScale;
    },
    dispose() {
      particles.forEach((p) => p.dispose());
      meshes.forEach((m) => m.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
