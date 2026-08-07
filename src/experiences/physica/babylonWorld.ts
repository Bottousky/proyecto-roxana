// Mundo de Physica — Vertical Slice completo (Escenas 2-8).
//
// El mundo es continuo en 2.5D (plataformero lateral): el jugador comienza en
// la cornisa frente a la cascada ascendente y camina hacia la derecha,
// atravesando cada escena sin transiciones de sala. Cada zona introduce un
// nuevo fenómeno físico y un nuevo módulo del reloj-dispositivo.
//
// Física híbrida (decisión del Director 2026-08-07):
//   • Analítica de forma cerrada (MRUV, tiro parabólico, vectores) es
//     autoritativa para los fenómenos pedagógicos.
//   • Havok maneja colisiones, rigid bodies pasivos y pushable props.
//   • Detalles en `physics.ts` y en `docs/physica/arquitectura-fisica-hibrida.md`.
import * as BABYLON from 'babylonjs';
import { integrar, type MruvIntegrada } from './models/caidaLibre.ts';
import {
  CIELO_Y,
  COLUMNA_CASCADA,
  LAGO_Y,
  resultadoPrediccion,
  type PrediccionCaida,
} from './models/cascadaAscendente.ts';
import { GRAVEDAD } from './models/cascadaAscendente.ts';
import {
  AVATAR_H,
  crearAvatar,
  integrarAvatar,
  type Avatar,
  type AvatarInput,
  type Plataforma,
} from './avatar.ts';
import { Instrumento } from './companion.ts';
import { RelojDispositivo } from './clock.ts';
import { createPhysicaPhysics, type PhysicaPhysicsHandle } from './physics.ts';

export interface PhysicaWorld {
  advanceTime(dtMs: number): void;
  snapshot(): Record<string, unknown>;
  pause(): void;
  resume(): void;
  dispose(): void;
  press(action: string, down: boolean): void;
  teleport(x: number, y: number): void;
  /** Acceso al plugin Havok para diagnóstico externo. `null` si no se cargó. */
  physics(): PhysicaPhysicsHandle | null;
}

/* ==================== constantes ==================== */

const G = GRAVEDAD;
const PIEDRA_R = 0.17;
const LANZAR_VX = 6;
const LANZAR_VY = 4.5;
const TRAYECTORIA_PUNTOS = 24;
const TRAYECTORIA_DT = 0.1;

/* Layout del mundo continuo */
const W_INICIO = -16;
const W_CORNISA_FIN = 14;
const W_E3_INICIO = 14;
const W_E3_FIN = 30;
const W_E4_INICIO = 28;
const W_E4_FIN = 48;
const W_E5_INICIO = 46;
const W_E5_FIN = 64;
const W_E6_INICIO = 62;
const W_E6_FIN = 80;
const W_E7_INICIO = 78;
const W_E7_FIN = 92;
const W_E8_INICIO = 90;
const W_E8_FIN = 140;

/* Alturas del terreno */
const Y_CORNISA = 0;
const Y_VALLE = -4;
const Y_E3 = 0;
const Y_E5 = 4;
const Y_E7 = 4;
const Y_E8 = 20;

/* Cámaras curadas por zona */
const CAM = {
   escena2: { z: 34, y: 3.5, targetY: 1.3 },
  cascada: { z: 190, y: 14.5, targetY: 13.5 },
  desfiladero: { z: 80, y: 4, targetY: 2 },
  valle: { z: 120, y: 8, targetY: 0 },
  corriente: { z: 100, y: 6, targetY: 1 },
  rampa: { z: 70, y: 3, targetY: 1 },
  estacion: { z: 110, y: 10, targetY: 5 },
  metro: { z: 300, y: 30, targetY: 10 },
} as const;
const CAM_FOV = 0.16;
const CAM_FOV_METRO = 0.12;

/* Save propio de Physica */
const SAVE_KEY = 'roxana-physica-v1';
interface PhysicaSave {
  flags: {
    cascadaObservada?: boolean;
    equilibrioResuelto?: boolean;
    referenciaAnclada?: boolean;
    vectorComun?: boolean;
    planoInclinado?: boolean;
    estacionEstabilizada?: boolean;
    metropolisRevelada?: boolean;
  };
}
function leerSave(): PhysicaSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { flags: {} };
    const parsed = JSON.parse(raw) as Partial<PhysicaSave>;
    return { flags: parsed.flags ?? {} };
  } catch { return { flags: {} }; }
}
function guardarSave(save: PhysicaSave): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}
function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
function round2(n: number): number { return Math.round(n * 100) / 100; }

/* ==================== crear mundo ==================== */

export function createPhysicaWorld(hostEl: HTMLElement): PhysicaWorld {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Physica: una naturaleza cuyas leyes pueden observarse y alterarse.');
  canvas.tabIndex = -1;
  hostEl.appendChild(canvas);

  const engine = new BABYLON.Engine(canvas, true, { stencil: false, antialias: true });
  const scene = new BABYLON.Scene(engine);

  // Havok se inicializa en paralelo y de forma opcional: si no carga el WASM,
  // el juego cae al modo analítico puro sin romper nada. Los modelos
  // pedagógicos (cascada, piedras, instrumento, saquitos, plataformas drift,
  // plano inclinado) son SIEMPRE autoritativos — Havok solo agrega
  // colisiones para el avatar, losas, rocas grandes y decoraciones pesadas.
  let physicaPhysics: PhysicaPhysicsHandle | null = null;
  void createPhysicaPhysics(scene).then((handle) => {
    physicaPhysics = handle;
    if (handle) {
      console.info('[Physica] Havok inicializado. Física híbrida activa.');
    } else {
      console.info('[Physica] Modo analítico puro (sin Havok).');
    }
  });

  scene.clearColor = new BABYLON.Color4(0.53, 0.74, 0.93, 1);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.001;
  scene.fogColor = new BABYLON.Color3(0.53, 0.74, 0.93);

  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, CAM.escena2.y, CAM.escena2.z), scene);
  camera.fov = CAM_FOV;
  camera.minZ = 0.1;
  camera.maxZ = 800;

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0.3), scene);
  hemi.diffuse = new BABYLON.Color3(0.48, 0.54, 0.58);
  hemi.groundColor = new BABYLON.Color3(0.12, 0.16, 0.16);
  hemi.intensity = 0.85;
  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(0.3, 0.9, 0.4), scene);
  sun.diffuse = new BABYLON.Color3(0.88, 0.86, 0.72);
  sun.specular = new BABYLON.Color3(0.92, 0.9, 0.78);
  sun.intensity = 1.1;
  sun.shadowMinZ = -150;
  sun.shadowMaxZ = 400;
  const shadows = new BABYLON.ShadowGenerator(1024, sun);
  shadows.useBlurExponentialShadowMap = true;
  shadows.blurKernel = 24;
  shadows.darkness = 0.42;

  /* ==================== helpers visuales ==================== */

  function estilizado(color: number, opts: { alpha?: number; emissive?: number; specular?: number } = {}): BABYLON.StandardMaterial {
    const m = new BABYLON.StandardMaterial('mat', scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(`#${color.toString(16).padStart(6, '0')}`);
    m.specularColor = opts.specular !== undefined
      ? BABYLON.Color3.FromHexString(`#${opts.specular.toString(16).padStart(6, '0')}`)
      : new BABYLON.Color3(0.05, 0.05, 0.05);
    if (opts.alpha !== undefined) m.alpha = opts.alpha;
    if (opts.emissive !== undefined) m.emissiveColor = BABYLON.Color3.FromHexString(`#${opts.emissive.toString(16).padStart(6, '0')}`);
    return m;
  }

  function box(w: number, h: number, d: number, mat: BABYLON.StandardMaterial): BABYLON.Mesh {
    const m = BABYLON.MeshBuilder.CreateBox('m', { width: w, height: h, depth: d }, scene);
    m.material = mat;
    return m;
  }

  function crearTexturaAgua(): BABYLON.Texture {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 128; i++) {
      const onda = Math.sin(i * 0.55) * 0.35;
      g.fillStyle = `rgba(160, 216, 250, ${0.5 + onda * 0.45})`;
      g.fillRect(0, i * 2, 64, 2);
    }
    const tex = new BABYLON.Texture(c.toDataURL(), scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    return tex;
  }

  function crearTexturaParticula(): BABYLON.Texture {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.45, 'rgba(190,230,255,0.85)');
    grad.addColorStop(1, 'rgba(150,205,240,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    const tex = new BABYLON.Texture(c.toDataURL(), scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    tex.hasAlpha = true;
    return tex;
  }

  /* ==================== ESCENA 2: CORNISA + CASCADA ==================== */

  /* fondo: montañas distantes (silhuetas triangulares) */
  const montanaMat = new BABYLON.StandardMaterial('montana', scene);
  montanaMat.diffuseColor = new BABYLON.Color3(0.38, 0.46, 0.52);
  montanaMat.alpha = 0.85;
  montanaMat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
  const montanaGeo = BABYLON.MeshBuilder.CreateCylinder('montana-pts', { diameterTop: 8, diameterBottom: 18, height: 12, tessellation: 3 }, scene);
  montanaGeo.material = montanaMat;
  montanaGeo.position.set(12, -1, -8);
  montanaGeo.rotation.x = Math.PI / 2;

  const montanaGeo2 = BABYLON.MeshBuilder.CreateCylinder('montana-pts2', { diameterTop: 6, diameterBottom: 12, height: 10, tessellation: 3 }, scene);
  montanaGeo2.material = montanaMat;
  montanaGeo2.position.set(26, -1, -12);
  montanaGeo2.rotation.x = Math.PI / 2;

  const COLUMNA = COLUMNA_CASCADA;
  const LAGO_X0 = 7.4;
  const LAGO_X1 = 12.6;
  

  /* terreno */
  const pisoAncho = W_CORNISA_FIN - W_INICIO + 4;
  const piso = box(pisoAncho, 0.7, 4.2, estilizado(0x8a9a7a));
  piso.position.set((W_INICIO + W_CORNISA_FIN) / 2, -0.35, 0);
  piso.receiveShadows = true;
  const bordePiso = box(pisoAncho, 0.18, 4.4, estilizado(0x6a7a5a));
  bordePiso.position.set((W_INICIO + W_CORNISA_FIN) / 2, 0.1, 0);

  const rocaIzq = box(1.4, 3.2, 3.4, estilizado(0x7c7a6e));
  rocaIzq.position.set(W_INICIO - 0.3, 1.6, 0);
  const rocaDerCornisa = box(1.4, 3.2, 3.4, estilizado(0x7c7a6e));
  rocaDerCornisa.position.set(W_CORNISA_FIN + 0.5, 1.6, 0);
  rocaIzq.receiveShadows = true;
  rocaDerCornisa.receiveShadows = true;

  /* árboles geométricos a la izquierda */
  const troncoMat = estilizado(0x5a4a40, { emissive: 0x3a3230 });
  const copaMat = estilizado(0x4a6a40, { emissive: 0x3a5230 });
  const tronco1 = box(0.4, 1.6, 0.4, troncoMat);
  tronco1.position.set(W_INICIO + 5, 0.8, 0.2);
  const copa1 = BABYLON.MeshBuilder.CreateCylinder('copa1', { diameter: 1.8, height: 1.2, tessellation: 6 }, scene);
  copa1.material = copaMat;
  copa1.position.set(W_INICIO + 5, 1.8, 0.2);
  copa1.rotation.y = Math.PI / 6;
  shadows.addShadowCaster(tronco1);
  shadows.addShadowCaster(copa1);

  const tronco2 = box(0.35, 1.4, 0.35, troncoMat);
  tronco2.position.set(W_INICIO + 10, 0.7, -0.3);
  const copa2 = BABYLON.MeshBuilder.CreateCylinder('copa2', { diameter: 1.6, height: 1.0, tessellation: 6 }, scene);
  copa2.material = copaMat;
  copa2.position.set(W_INICIO + 10, 1.5, -0.3);
  copa2.rotation.y = -Math.PI / 6;
  shadows.addShadowCaster(tronco2);
  shadows.addShadowCaster(copa2);

  /* pilar vertical en el borde izquierdo */
  const pilar = box(1, 10, 1, estilizado(0x6a7268, { emissive: 0x4a5046 }));
  pilar.position.set(W_INICIO + 1, 5, 0);
  shadows.addShadowCaster(pilar);

  /* lago */
  const lago = box(LAGO_X1 - LAGO_X0, 0.14, 3.6, estilizado(0x6fb6d8, { alpha: 0.72, emissive: 0x2a5a7a }));
  lago.position.set((LAGO_X0 + LAGO_X1) / 2, 0.07, 0);
  const lagoProfundo = box(LAGO_X1 - LAGO_X0 - 0.35, 0.05, 3.8, estilizado(0x244f73, { alpha: 0.55, emissive: 0x1a3a5a }));
  lagoProfundo.position.set((LAGO_X0 + LAGO_X1) / 2, 0.13, 0.05);
  for (const [rx, rz, rw] of [[8.2, -0.75, 1.1], [9.4, 0.55, 0.8], [11.2, -0.45, 1.35], [12.1, 0.7, 0.65]] as const) {
    const ripple = BABYLON.MeshBuilder.CreateTorus('onda', { diameter: rw, thickness: 0.025, tessellation: 24 }, scene);
    ripple.rotation.x = Math.PI / 2;
    ripple.scaling.y = 0.42;
    ripple.position.set(rx, 0.19, rz);
    ripple.material = estilizado(0xb7e9ff, { alpha: 0.52, emissive: 0x285a76 });
  }

  /* cascada ascendente */
  const cascadaMat = estilizado(0x9fdcff, { alpha: 0.6, emissive: 0x1a4a6e, specular: 0x9fdcff });
  cascadaMat.backFaceCulling = false;
  const texturaAgua = crearTexturaAgua();
  cascadaMat.diffuseTexture = texturaAgua;
  cascadaMat.emissiveTexture = texturaAgua;
  const cascada = box(COLUMNA.x1 - COLUMNA.x0, CIELO_Y, 1.0, cascadaMat);
  cascada.position.set((COLUMNA.x0 + COLUMNA.x1) / 2, CIELO_Y / 2, 0);
  const cascadaNucleoMat = estilizado(0xd4f3ff, { alpha: 0.28, emissive: 0x3f9dc9 });
  cascadaNucleoMat.backFaceCulling = false;
  const cascadaNucleo = box(1.1, CIELO_Y - 0.6, 0.5, cascadaNucleoMat);
  cascadaNucleo.position.set((COLUMNA.x0 + COLUMNA.x1) / 2, CIELO_Y / 2, -0.08);
  const cascadaOrillaMat = estilizado(0x73bde2, { alpha: 0.35, emissive: 0x1a4a6e });
  const cascadaOrillaA = box(0.18, CIELO_Y, 0.7, cascadaOrillaMat);
  cascadaOrillaA.position.set(COLUMNA.x0 + 0.1, CIELO_Y / 2, 0.08);
  const cascadaOrillaB = box(0.18, CIELO_Y, 0.7, cascadaOrillaMat);
  cascadaOrillaB.position.set(COLUMNA.x1 - 0.1, CIELO_Y / 2, 0.08);
  const frenteAgua = BABYLON.MeshBuilder.CreateSphere('frente-agua', { diameter: 1.2, segments: 16 }, scene);
  frenteAgua.material = estilizado(0xdaf6ff, { alpha: 0.82, emissive: 0x48a8d2 });
  frenteAgua.scaling.y = 0.48;
  frenteAgua.position.set((COLUMNA.x0 + COLUMNA.x1) / 2, LAGO_Y + 0.45, -0.2);
  const frenteHalo = BABYLON.MeshBuilder.CreateTorus('halo-agua', { diameter: 1.9, thickness: 0.06, tessellation: 32 }, scene);
  frenteHalo.rotation.x = Math.PI / 2;
  frenteHalo.material = estilizado(0xb8edff, { alpha: 0.52, emissive: 0x3f9dc9 });
  frenteHalo.position.set((COLUMNA.x0 + COLUMNA.x1) / 2, LAGO_Y + 0.45, -0.22);
  const nubeMat = estilizado(0xeef4f8, { alpha: 0.92, emissive: 0xd8e6f2 });
  const nubes: BABYLON.Mesh[] = [];
  for (const [ox, oy, r, oz] of [[0, 0, 1.5, 0], [1.8, 0.5, 1.0, -0.4], [-1.7, 0.55, 0.95, 0.2], [0.5, 1.1, 0.9, -0.2]] as const) {
    const esfera = BABYLON.MeshBuilder.CreateSphere('nube', { diameter: r * 2, segments: 12 }, scene);
    esfera.material = nubeMat;
    esfera.scaling.y = 0.5;
    esfera.position.set((COLUMNA.x0 + COLUMNA.x1) / 2 + ox, CIELO_Y + oy, oz);
    nubes.push(esfera);
  }

  /* espuma de la cascada */
  const texturaParticula = crearTexturaParticula();
  const espuma = new BABYLON.ParticleSystem('espuma', 500, scene);
  espuma.particleTexture = texturaParticula;
  espuma.emitter = new BABYLON.Vector3((COLUMNA.x0 + COLUMNA.x1) / 2, LAGO_Y + 0.15, 0);
  const emisorBox = new BABYLON.BoxParticleEmitter();
  emisorBox.direction1 = new BABYLON.Vector3(-0.4, 1, -0.2);
  emisorBox.direction2 = new BABYLON.Vector3(0.4, 1.15, 0.2);
  emisorBox.minEmitBox = new BABYLON.Vector3(-0.6, -0.05, -0.5);
  emisorBox.maxEmitBox = new BABYLON.Vector3(0.6, 0.05, 0.5);
  espuma.particleEmitterType = emisorBox;
  espuma.minEmitPower = 3.4;
  espuma.maxEmitPower = 5.4;
  espuma.gravity = new BABYLON.Vector3(0, 1.6, 0);
  espuma.minLifeTime = 3.5;
  espuma.maxLifeTime = 5.2;
  espuma.minSize = 0.09;
  espuma.maxSize = 0.26;
  espuma.emitRate = 70;
  espuma.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  espuma.updateSpeed = 0.012;
  const motionScale = prefersReducedMotion() ? 0.3 : 1;
  if (motionScale < 1) espuma.stop(); else espuma.start();

  /* piedras recogibles */
  interface Piedra {
    x: number; y: number; vx: number; vy: number;
    inFlight: boolean; restante: boolean; mesh: BABYLON.Mesh; inicioX: number;
  }
  function crearPiedra(x: number): Piedra {
    const mesh = BABYLON.MeshBuilder.CreateIcoSphere('piedra', { radius: PIEDRA_R, subdivisions: 1, flat: true }, scene);
    mesh.material = estilizado(0x6b6f77);
    mesh.position.set(x, PIEDRA_R, 0);
    shadows.addShadowCaster(mesh);
    return { x, y: PIEDRA_R, vx: 0, vy: 0, inFlight: false, restante: true, mesh, inicioX: x };
  }
  const piedras: Piedra[] = [crearPiedra(-4.5), crearPiedra(2.5)];
  let piedraLlevada: Piedra | null = null;

  /* trayectoria de predicción y evidencia */
  const trayectoriaMat = estilizado(0xf4d39c, { alpha: 0.46, emissive: 0xb86e2d });
  const trayectoria = BABYLON.MeshBuilder.CreateDashedLines('trayectoria-previa', {
    points: [BABYLON.Vector3.Zero(), BABYLON.Vector3.Up()], dashSize: 0.16, gapSize: 0.12, updatable: true,
  }, scene);
  trayectoria.material = trayectoriaMat;
  trayectoria.isVisible = false;
  const evidenciaMat = estilizado(0xe8fbff, { alpha: 0.58, emissive: 0x5fb7d8 });
  let evidenciaPuntos: BABYLON.Vector3[] = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Up()];
  const evidencia = BABYLON.MeshBuilder.CreateDashedLines('trayectoria-evidencia', {
    points: evidenciaPuntos, dashSize: 0.09, gapSize: 0.14, updatable: true,
  }, scene);
  evidencia.material = evidenciaMat;
  evidencia.isVisible = false;
  const marcaSube = BABYLON.MeshBuilder.CreateDisc('marca-sube', { radius: 0.32, tessellation: 24 }, scene);
  marcaSube.material = estilizado(0x88d8ff, { alpha: 0.5, emissive: 0x2d86a9 });
  marcaSube.rotation.x = Math.PI / 2;
  marcaSube.isVisible = false;
  const marcaCae = BABYLON.MeshBuilder.CreateDisc('marca-cae', { radius: 0.32, tessellation: 24 }, scene);
  marcaCae.material = estilizado(0xe8c37d, { alpha: 0.5, emissive: 0x9f6427 });
  marcaCae.rotation.x = Math.PI / 2;
  marcaCae.isVisible = false;

  /* ==================== ESCENA 3: DESFILADERO + INSTRUMENTO ==================== */

  const desfiladeroAncho = W_E3_FIN - W_E3_INICIO;
  const desfiladero = box(desfiladeroAncho, 0.7, 4.2, estilizado(0x5a4a3a));
  desfiladero.position.set((W_E3_INICIO + W_E3_FIN) / 2, -0.35, 0);
  desfiladero.receiveShadows = true;
  const desfiladeroBorde = box(desfiladeroAncho, 0.18, 4.4, estilizado(0x8a7a6a));
  desfiladeroBorde.position.set((W_E3_INICIO + W_E3_FIN) / 2, 0.1, 0);

  /* gorge visual */
  const gorgeProfundo = box(desfiladeroAncho, 6, 30, estilizado(0x2a2830, { alpha: 0.5 }));
  gorgeProfundo.position.set((W_E3_INICIO + W_E3_FIN) / 2, -7, -26);
  const paredGorgeL = box(0.8, 14, 28, estilizado(0x4a4a52));
  paredGorgeL.position.set(W_E3_INICIO + 2, 0, -24);
  const paredGorgeR = box(0.8, 14, 28, estilizado(0x4a4a52));
  paredGorgeR.position.set(W_E3_FIN - 2, 0, -24);

  /* INSTRUMENTO suspendido */
  const instrumentoX = (W_E3_INICIO + W_E3_FIN) / 2;
  const instrumentoYBase = 5;
  const FUERZA_UP = 9.8;
  const FUERZA_DOWN = 9.8;
  let upCover = 1;

  /* flechas de fuerzas */
  const flechaUpMat = estilizado(0x62d4c0, { alpha: 0.6, emissive: 0x3a8e80 });
  const flechaUpGeo = BABYLON.MeshBuilder.CreateCylinder('flecha-up', { diameterTop: 0.3, diameterBottom: 0.3, height: 3.5 }, scene);
  flechaUpGeo.material = flechaUpMat;
  flechaUpGeo.position.set(instrumentoX, instrumentoYBase + 4, 0.1);
  flechaUpGeo.scaling.y = 0;
  const flechaDownMat = estilizado(0xff6b6b, { alpha: 0.6, emissive: 0x9e2a2b });
  const flechaDownGeo = BABYLON.MeshBuilder.CreateCylinder('flecha-down', { diameterTop: 0.3, diameterBottom: 0.3, height: 3.5 }, scene);
  flechaDownGeo.material = flechaDownMat;
  flechaDownGeo.position.set(instrumentoX, instrumentoYBase - 4, 0.1);
  flechaDownGeo.scaling.y = 0;

  /* losa para cubrir corriente */
  const losaMat = estilizado(0x8a6f4d);
  const losaX = instrumentoX - 2.6;
  const losaY = 2.8;
  const losa = box(3.2, 0.28, 2.6, losaMat);
  losa.position.set(losaX, losaY, 0);
  losa.receiveShadows = true;
  shadows.addShadowCaster(losa);
  let losaRecogida = false;
  let losaEnPosicion = false;

  /* INSTRUMENTO entidad viva */
  const instrumento = new Instrumento({ scene, hostEl });
  instrumento.x = instrumentoX;
  instrumento.y = instrumentoYBase;
  instrumento.targetX = instrumentoX;
  instrumento.targetY = instrumentoYBase;
  instrumento.mesh.position.set(instrumentoX, instrumentoYBase, 0);

  /* ==================== ESCENA 4: VALLE A LA DRIFA ==================== */

  const valleAncho = W_E4_FIN - W_E4_INICIO;
  const valleFondo = box(valleAncho, 0.8, 5, estilizado(0x4a3a2a));
  valleFondo.position.set((W_E4_INICIO + W_E4_FIN) / 2, Y_VALLE - 0.4, 0);
  valleFondo.receiveShadows = true;

  /* plataformas drift */
  interface PlataformaDrift {
    base: Plataforma;
    x0: number;
    amplitude: number;
    velocidad: number;
    fase: number;
    mesh: BABYLON.Mesh;
  }
  const plataformasDrift: PlataformaDrift[] = [];
  const driftY = Y_VALLE + 2;
  for (let i = 0; i < 3; i++) {
    const xBase = W_E4_INICIO + 10 + i * 8;
    const mesh = box(4, 0.4, 2.4, estilizado(0x5a6a52));
    mesh.position.set(xBase, driftY - 0.2, 0);
    mesh.receiveShadows = true;
    shadows.addShadowCaster(mesh);
    plataformasDrift.push({
      base: { x0: xBase - 2, x1: xBase + 2, top: driftY },
      x0: xBase,
      amplitude: 5,
      velocidad: 1.2,
      fase: i * 1.7,
      mesh,
    });
  }

  /* receptáculo */
  const receptorX = W_E4_FIN - 6;
  const receptorY = driftY;
  const receptor = box(2, 1.2, 1.4, estilizado(0x7a8a78));
  receptor.position.set(receptorX, receptorY + 0.6, 0);
  receptor.receiveShadows = true;

  /* ==================== ESCENA 5: CORRIENTE TRANSVERSAL ==================== */

  const gorge5Depth = -22;

  const pared5L = box(0.8, 10, 20, estilizado(0x4a4a52));
  pared5L.position.set(W_E5_INICIO + 1, 3, gorge5Depth);
  const pared5R = box(0.8, 10, 20, estilizado(0x4a4a52));
  pared5R.position.set(W_E5_FIN - 1, 3, gorge5Depth);

  const puente5Width = W_E5_FIN - W_E5_INICIO - 4;
  const puente5 = box(puente5Width, 0.5, 2.2, estilizado(0x8a7a6a));
  puente5.position.set(W_E5_INICIO + 2 + puente5Width / 2, 4, gorge5Depth);
  puente5.receiveShadows = true;

  let corrienteVel = 4;
  const corrienteMat = estilizado(0x62d4c0, { alpha: 0.35, emissive: 0x3a8e80 });
  const corrienteGeo = box(W_E5_FIN - W_E5_INICIO - 6, 0.3, 1.8, corrienteMat);
  corrienteGeo.position.set((W_E5_INICIO + W_E5_FIN) / 2, 3.8, gorge5Depth - 0.5);

  /* saquitos de energía */
  interface Saquito {
    x: number; y: number; vx: number; vy: number;
    inFlight: boolean; mesh: BABYLON.Mesh;
  }
  const saquitos: Saquito[] = [];
  const saquitoMat = estilizado(0x9f8ce0, { alpha: 0.8, emissive: 0x6a5a9e });
  for (let i = 0; i < 3; i++) {
    const x = W_E5_INICIO + 8 + i * 10;
    const mesh = BABYLON.MeshBuilder.CreateSphere('saquito', { diameter: 0.4, segments: 8 }, scene);
    mesh.material = saquitoMat;
    mesh.position.set(x, 4.5, gorge5Depth - 0.6);
    saquitos.push({ x, y: 4.5, vx: 0, vy: 0, inFlight: false, mesh });
  }

  const receptor5X = W_E5_FIN - 4;
  const receptor5Y = 5;
  const receptor5 = BABYLON.MeshBuilder.CreateTorus('receptor5', { diameter: 1.6, thickness: 0.3, tessellation: 24 }, scene);
  receptor5.material = estilizado(0x9f8ce0, { alpha: 0.6, emissive: 0x6a5a9e });
  receptor5.position.set(receptor5X, receptor5Y, gorge5Depth - 0.3);
  receptor5.rotation.x = Math.PI / 2;
  
  /* ==================== ESCENA 6: PLANO INCLINADO ====================
 */

  const rampaX = W_E6_INICIO + 8;
  const rampaAlturaBase = 2;
  const rocaAltaX = W_E6_FIN - 6;
  const rocaAltaY = rampaAlturaBase + 5;
  let roca6Movida = false;
  let losaRampaColocada = false;

  const plataformaAlta = box(5, 0.5, 2.6, estilizado(0x6d7a66));
  plataformaAlta.position.set(rocaAltaX, rocaAltaY + 0.25, 0);
  plataformaAlta.receiveShadows = true;

  const rocaGrande6Geo = BABYLON.MeshBuilder.CreateIcoSphere('roca-grande', { radius: 0.9, subdivisions: 1, flat: true }, scene);
  rocaGrande6Geo.material = estilizado(0x7a7266);
  rocaGrande6Geo.position.set(rampaX, rampaAlturaBase + 0.9, 0);
  rocaGrande6Geo.receiveShadows = true;
  shadows.addShadowCaster(rocaGrande6Geo);
  let roca6X = rocaGrande6Geo.position.x;
  let roca6Y = rocaGrande6Geo.position.y;

  const losaRampa = box(7, 0.24, 2.2, estilizado(0x8a6f4d));
  losaRampa.position.set(rampaX, rampaAlturaBase + 0.6, 0);
  losaRampa.rotation.z = Math.PI / 7;
  losaRampa.receiveShadows = true;

  const apoyo1 = box(0.3, 1, 0.3, estilizado(0x7a6447));
  apoyo1.position.set(rampaX - 3.4, rampaAlturaBase + 0.5, 0);
  const apoyo2 = box(0.3, 1, 0.3, estilizado(0x7a6447));
  apoyo2.position.set(rampaX + 3.4, rampaAlturaBase + 0.5, 0);
  apoyo1.receiveShadows = true;
  apoyo2.receiveShadows = true;

  /* ==================== ESCENA 7: ESTACIÓN PEDAGÓGICA ==================== */

  const estacionX = W_E7_INICIO + 12;
  const estacionY = Y_E7;

  const anilloMat = estilizado(0xc0a080, { alpha: 0.7, emissive: 0x8a6a4a });
  const anillos: BABYLON.Mesh[] = [];
  const anilloTam = [1.8, 1.3, 0.85];
  for (let i = 0; i < 3; i++) {
    const a = BABYLON.MeshBuilder.CreateTorus(`anillo-${i}`, { diameter: anilloTam[i], thickness: 0.12, tessellation: 48 }, scene);
    a.material = anilloMat;
    a.position.set(estacionX + i * 1.2 - 1.2, estacionY + i * 0.7, 0);
    a.rotation.y = Math.PI / 6;
    anillos.push(a);
  }

  const canalMat = estilizado(0x5a7a9a, { alpha: 0.5, emissive: 0x2a4a5a });
  const canal = box(2, 4, 1, canalMat);
  canal.position.set(estacionX, estacionY + 2, 0.05);

  const contraPesoGeo = BABYLON.MeshBuilder.CreateIcoSphere('contra-peso', { radius: 0.7, subdivisions: 1 }, scene);
  contraPesoGeo.material = estilizado(0x7a7266);
  contraPesoGeo.position.set(estacionX + 5, estacionY + 3, 0);

  const rocaFlotanteGeo = BABYLON.MeshBuilder.CreateIcoSphere('roca-flotante', { radius: 0.5, subdivisions: 1, flat: true }, scene);
  rocaFlotanteGeo.material = estilizado(0x7a7266, { alpha: 0.6, emissive: 0x5a5246 });
  rocaFlotanteGeo.position.set(estacionX + 8, estacionY + 8, 0);
  rocaFlotanteGeo.isVisible = false;

  /* ==================== ESCENA 8: METRÓPOLIS ==================== */

  const obsAncho = 22;
  const obsProfundidad = 8;
  const plataformaObs = box(obsAncho, 0.8, obsProfundidad, estilizado(0x5a4a3a));
  plataformaObs.position.set(W_E8_INICIO + obsAncho / 2, Y_E8 - 0.4, -50);
  plataformaObs.receiveShadows = true;

  const paredMetro = box(0.8, 30, obsProfundidad, estilizado(0x4a4a52));
  paredMetro.position.set(W_E8_INICIO, estacionY + 14, -50);
  paredMetro.receiveShadows = true;

  /* escalerilla */
  const escaleraMat = estilizado(0x6d7a66);
  for (let i = 0; i < 12; i++) {
    const peldaño = box(4, 0.3, 1.2, escaleraMat);
    peldaño.position.set(W_E8_INICIO - 4 + i * 0.8, estacionY + i * 1.4 + 1, -42);
    peldaño.receiveShadows = true;
  }

  /* metrópolis 3D */
  const metropoGroup = new BABYLON.TransformNode('metropoli', scene);
  metropoGroup.position.set(W_E8_INICIO + 200, Y_E8, -220);

  const matEdificioArr = [
    estilizado(0x6a5a6a),
    estilizado(0x7a6a8a),
    estilizado(0x5a6a7a),
    estilizado(0x8a7a9a),
  ];

  for (let i = 0; i < 12; i++) {
    const h = 8 + Math.random() * 16;
    const w = 3 + Math.random() * 5;
    const d = 3 + Math.random() * 6;
    const x = (i - 6) * 8 + Math.random() * 2;
    const z = -Math.random() * 40 - 10;
    const ed = box(w, h, d, matEdificioArr[Math.floor(Math.random() * 4)]);
    ed.position.set(x, h / 2 + Y_E8, z);
    ed.rotation.y = (Math.random() - 0.5) * 0.3;
    ed.parent = metropoGroup;
    ed.receiveShadows = true;
  }

  /* edificios en paredes */
  for (let i = 0; i < 6; i++) {
    const h = 12 + Math.random() * 8;
    const w = 4 + Math.random() * 3;
    const d = 6 + Math.random() * 4;
    const x = 40 + i * 10;
    const z = -80 + Math.random() * 10;
    const ed = box(w, h, d, matEdificioArr[i % 4]);
    ed.position.set(x, Y_E8 + 2, z);
    ed.rotation.z = Math.PI / 2;
    ed.parent = metropoGroup;
    ed.receiveShadows = true;
  }

  /* torres */
  for (let i = 0; i < 4; i++) {
    const h = 25 + Math.random() * 10;
    const torre = BABYLON.MeshBuilder.CreateCylinder('torre', { diameter: 2, height: h }, scene);
    torre.material = matEdificioArr[i % 4];
    torre.position.set(-30 + i * 12, Y_E8 + h / 2, -100 - i * 20);
    torre.parent = metropoGroup;
    torre.receiveShadows = true;
  }

  /* trenes */
  const trenMat = estilizado(0xc0a080, { emissive: 0x8a6a4a });
  for (let i = 0; i < 3; i++) {
    const tren = box(4, 1.5, 1.5, trenMat);
    tren.name = 'tren';
    tren.position.set(-40 + i * 20, Y_E8 + 8, -90);
    tren.rotation.z = Math.PI / 2;
    tren.parent = metropoGroup;
  }

  /* siluetas distantes */
  const metroSilhouette = new BABYLON.StandardMaterial('metro-silhouette', scene);
  metroSilhouette.diffuseColor = new BABYLON.Color3(0.15, 0.16, 0.18);
  metroSilhouette.emissiveColor = new BABYLON.Color3(0.12, 0.13, 0.14);
  metroSilhouette.alpha = 0.4;
  metroSilhouette.specularColor = new BABYLON.Color3(0, 0, 0);
  for (let i = 0; i < 8; i++) {
    const s = box(12 + Math.random() * 8, 20 + Math.random() * 30, 2, metroSilhouette);
    s.position.set(W_E8_INICIO + 60 + i * 20, Y_E8 + 15, -300 - Math.random() * 60);
    s.parent = metropoGroup;
  }

  /* faros */
  for (let i = 0; i < 5; i++) {
    const poste = BABYLON.MeshBuilder.CreateCylinder('poste', { diameter: 0.2, height: 8 }, scene);
    poste.material = matEdificioArr[i % 4];
    poste.position.set(W_E8_INICIO + 10 + i * 18, Y_E8 + 4, -40 - i * 5);
    poste.parent = metropoGroup;
    const luz = new BABYLON.PointLight(`luz-metro-${i}`, new BABYLON.Vector3(0, 4, 0), scene);
    luz.parent = poste;
    luz.diffuse = new BABYLON.Color3(0.5, 0.8, 1);
    luz.specular = new BABYLON.Color3(0.6, 0.9, 1);
    luz.intensity = 0.8;
    luz.range = 30;
  }

  /* montañas de fondo */
  for (let i = 0; i < 8; i++) {
    const h = 10 + Math.random() * 15;
    const w = 12 + Math.random() * 10;
    const cono = BABYLON.MeshBuilder.CreateCylinder('montana', { diameterBottom: w, diameterTop: 0.1, height: h }, scene);
    cono.material = estilizado(0x4a4a52, { alpha: 0.6 });
    cono.position.set(W_E8_INICIO + 30 + i * 20, h / 2 + Y_E8 - 10, -150);
    cono.parent = metropoGroup;
    cono.receiveShadows = true;
  }

  metropoGroup.setEnabled(false);

  /* ==================== AVATAR ==================== */

  const avatar: Avatar = crearAvatar(0, Y_CORNISA + AVATAR_H / 2);
  const avatarGroup = new BABYLON.TransformNode('avatar', scene);
  const torso = box(0.5, 0.7, 0.4, estilizado(0xd9b894));
  torso.position.y = 0.85;
  const cabeza = BABYLON.MeshBuilder.CreateSphere('cabeza', { diameter: 0.48, segments: 10 }, scene);
  cabeza.material = estilizado(0xe3c39b);
  cabeza.position.y = 1.35;
  const piernas = box(0.44, 0.5, 0.36, estilizado(0x55505e));
  piernas.position.y = 0.25;
  const visor = box(0.27, 0.12, 0.04, estilizado(0x213a4a, { emissive: 0x102d3a }));
  visor.position.set(0, 1.36, 0.23);
  avatarGroup.addChild(torso);
  avatarGroup.addChild(cabeza);
  avatarGroup.addChild(piernas);
  avatarGroup.addChild(visor);
  for (const mesh of [torso, cabeza, piernas, visor]) shadows.addShadowCaster(mesh);

  /* ==================== RELOJ-DISPOSITIVO ==================== */

  const reloj = new RelojDispositivo(scene);
  reloj.mesh.position.set(instrumentoX, instrumentoYBase + 1.2, 0);
  reloj.esconder();

  /* ==================== UI DOM ==================== */

  const ui = document.createElement('div');
  ui.className = 'px-ui';
  ui.innerHTML = `
    <div id="px-prompt" class="px-prompt hidden"></div>
    <div id="px-toast" class="px-toast hidden" role="status"></div>
    <p id="px-sr-status" class="px-sr-only" role="status"></p>
    <button id="px-bita-btn" class="px-bita-btn hidden" title="Bitácora (B)">✒</button>
    <div id="px-bita" class="px-bita hidden">
      <section class="px-bita-panel" role="dialog" aria-modal="true" aria-labelledby="px-bita-title">
        <button id="px-bita-close" class="px-bita-close" aria-label="Cerrar">✕</button>
        <div id="px-bita-body"></div>
      </section>
    </div>
    <div id="px-metro-ui" class="px-metro-ui hidden">
      <div class="px-metro-panel">
        <h3 id="px-metro-title">Physica — Fundamentos</h3>
        <div id="px-metro-entries"></div>
      </div>
    </div>
    <div id="px-touch" class="px-touch hidden">
      <div class="px-touch-left">
        <button data-act="left" aria-label="Caminar a la izquierda">◀</button>
        <button data-act="right" aria-label="Caminar a la derecha">▶</button>
      </div>
      <div class="px-touch-right">
        <button data-act="jump" aria-label="Saltar">⤒</button>
        <button data-act="act" aria-label="Interactuar">✧</button>
        <button data-act="rotate" aria-label="Cámara">◈</button>
      </div>
    </div>`;
  hostEl.appendChild(ui);

  const promptEl = ui.querySelector<HTMLElement>('#px-prompt')!;
  const toastEl = ui.querySelector<HTMLElement>('#px-toast')!;
  const srStatusEl = ui.querySelector<HTMLElement>('#px-sr-status')!;
  const bitaBtn = ui.querySelector<HTMLElement>('#px-bita-btn')!;
  const bitaPanel = ui.querySelector<HTMLElement>('#px-bita')!;
  const bitaBody = ui.querySelector<HTMLElement>('#px-bita-body')!;
  const bitaClose = ui.querySelector<HTMLElement>('#px-bita-close')!;
  const touchEl = ui.querySelector<HTMLElement>('#px-touch')!;
  const metroUI = ui.querySelector<HTMLElement>('#px-metro-ui')!;
  const metroEntries = ui.querySelector<HTMLElement>('#px-metro-entries')!;

  let toastTimer = 0;
  function toast(msg: string): void {
    toastEl.textContent = msg;
    srStatusEl.textContent = msg;
    toastEl.classList.remove('hidden');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.add('hidden'), 3200);
  }

  /* ==================== Bitácora ==================== */

  const save = leerSave();
  let observada = save.flags.cascadaObservada === true;
  let equilibrioResuelto = save.flags.equilibrioResuelto === true;
  let referenciaAnclada = save.flags.referenciaAnclada === true;
  let vectorComun = save.flags.vectorComun === true;
  let planoInclinadoOk = save.flags.planoInclinado === true;
  let estacionEstabilizada = save.flags.estacionEstabilizada === true;
  let metropolisRevelada = save.flags.metropolisRevelada === true;

  if (observada || equilibrioResuelto || referenciaAnclada || vectorComun || planoInclinadoOk || estacionEstabilizada || metropolisRevelada) {
    bitaBtn.classList.remove('hidden');
  }

  interface BitacoraEntry {
    titulo: string;
    resumen: string;
    cuerpo?: string;
    todo?: string;
    desbloqueada: boolean;
  }

  function obtenerEntradasBitacora(): BitacoraEntry[] {
    return [
      {
        titulo: 'Registro de llegada',
        resumen: 'Distintos cuerpos del mismo lugar no parecen obedecer la misma dirección.',
        todo: '// TODO(guion): la síntesis de la observación de la cascada ascendente se escribirá cuando exista guion.',
        desbloqueada: observada,
      },
      {
        titulo: 'Quietud activa: resultante nula.',
        resumen: 'Estaba inmóvil. ¿Eso significa que ninguna fuerza actuaba?',
        cuerpo: 'Un cuerpo puede permanecer inmóvil aunque existan fuerzas; si la suma vectorial sobre ese cuerpo es nula, su movimiento no cambia.',
        desbloqueada: equilibrioResuelto,
      },
      {
        titulo: 'Desde dónde se mueve: sistema de referencia.',
        resumen: 'La medición no cambió. Cambió desde dónde la contamos.',
        cuerpo: 'El movimiento se describe respecto de una referencia. Cuando dos cuerpos comparten el mismo movimiento, su movimiento relativo puede ser nulo.',
        desbloqueada: referenciaAnclada,
      },
      {
        titulo: 'Flechas que se combinan: vectores.',
        resumen: 'No era lanzar más. Era lanzar hacia otro lugar para llegar al mismo lugar.',
        cuerpo: 'Magnitud, dirección y sentido determinan el resultado; los vectores relevantes se combinan.',
        desbloqueada: vectorComun,
      },
      {
        titulo: 'Subir dando un rodeo: plano inclinado.',
        resumen: 'Misma altura. Otra dirección. Más recorrido.',
        cuerpo: 'Un plano inclinado permite alcanzar una altura aplicando menor fuerza a lo largo de una distancia mayor. No crea energía gratuita.',
        desbloqueada: planoInclinadoOk,
      },
      {
        titulo: 'Un sistema compartido: consecuencias entre experimentos.',
        resumen: 'La estación respondió. También cambió algo que no medimos.',
        cuerpo: 'No falló. Obedeció demasiadas instrucciones. Un fenómeno físico no se comprende preguntando solamente cuánto. También importa hacia dónde, respecto de qué se describe y qué otras interacciones forman parte del sistema.',
        desbloqueada: estacionEstabilizada,
      },
      {
        titulo: 'Physica — Fundamentos. Región estabilizada: parcial.',
        resumen: 'La estación del valle era una entrada. Allí… hay demasiadas referencias.',
        cuerpo: 'Y una señal que todavía reconoce el reloj. Próxima señal: metrópolis experimental.',
        desbloqueada: metropolisRevelada,
      },
    ];
  }

  function abrirBitacora(): void {
    bitaPanel.classList.remove('hidden');
    bitaClose.focus();
    const entradas = obtenerEntradasBitacora();
    let html = '';
    for (const e of entradas) {
      const cls = e.desbloqueada ? 'px-bita-entry' : 'px-bita-entry px-bita-entry-locked';
      const lockIcon = e.desbloqueada ? '' : '🔒 ';
      html += `<div class="${cls}">
        <h4>${lockIcon}${e.titulo}</h4>
        <p class="px-bita-viv">${e.resumen}</p>
        ${e.cuerpo ? `<p class="px-bita-formal">${e.cuerpo}</p>` : ''}
        ${e.todo ? `<p class="px-bita-todo">${e.todo}</p>` : ''}
      </div>`;
    }
    bitaBody.innerHTML = html;
  }
  function cerrarBitacora(): void {
    bitaPanel.classList.add('hidden');
    bitaBtn.focus();
  }
  bitaBtn.addEventListener('click', abrirBitacora);
  bitaClose.addEventListener('click', cerrarBitacora);
  bitaPanel.addEventListener('click', (e) => {
    if (e.target === bitaPanel) cerrarBitacora();
  });

  function actualizarMetroUI(): void {
    if (estacionEstabilizada || metropolisRevelada) {
      metroUI.classList.remove('hidden');
    }
    const entradas = obtenerEntradasBitacora();
    let html = '';
    for (const e of entradas) {
      const icon = e.desbloqueada ? '✓' : '·';
      html += `<div class="px-metro-entry">${icon} ${e.titulo}</div>`;
    }
    metroEntries.innerHTML = html;
  }

  /* ==================== input ==================== */

  const input: AvatarInput = { left: false, right: false, jump: false };
  let actEdge = false;
  let jumpEdge = false;
  let bitaEdge = false;
  let predSubeEdge = false;

  function setKey(code: string, down: boolean): void {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': input.left = down; break;
      case 'ArrowRight': case 'KeyD': input.right = down; break;
      case 'Space': case 'ArrowUp': case 'KeyW':
        if (down && !input.jump) jumpEdge = true;
        input.jump = down;
        break;
      case 'KeyE': actEdge = down; break;
      case 'KeyQ': predSubeEdge = down; break;
      case 'KeyB': if (down) bitaEdge = true; break;
    }
  }
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!e.repeat) setKey(e.code, true);
    if (e.code === 'Escape' && !bitaPanel.classList.contains('hidden')) cerrarBitacora();
  };
  const onKeyUp = (e: KeyboardEvent): void => { setKey(e.code, false); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  if (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) {
    touchEl.classList.remove('hidden');
  }
  touchEl.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((btn) => {
    const act = btn.dataset.act!;
    const down = (ev: Event): void => { ev.preventDefault(); press(act, true); };
    const up = (): void => press(act, false);
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  });

  function press(action: string, down: boolean): void {
    switch (action) {
      case 'left': input.left = down; break;
      case 'right': input.right = down; break;
      case 'jump':
        if (down && !input.jump) jumpEdge = true;
        input.jump = down;
        break;
      case 'act': actEdge = down; break;
      case 'pred-sube': predSubeEdge = down; break;
      case 'bita': if (down) bitaEdge = true; break;
    }
  }

  /* ==================== estado del mundo ==================== */

  let piedraAterrizada = false;
  let prediccion: PrediccionCaida | null = null;
  let resultadoObservado: 'acierto' | 'error' | null = null;
  let chorroEstado: MruvIntegrada = { y: LAGO_Y, v: 0, t: 0 };
  let running = true;
  let last = performance.now();
  let simT = 0;

  /* ==================== lógica de piedras ==================== */

  function piedraCerca(p: Piedra): boolean {
    return p.restante && !p.inFlight && Math.hypot(avatar.x - p.x, avatar.y - p.y) < 1.3;
  }
  function recogerMasCercana(): void {
    if (piedraLlevada) return;
    let mejor: Piedra | null = null;
    let mejorDist = Infinity;
    for (const p of piedras) {
      if (!piedraCerca(p)) continue;
      const d = Math.hypot(avatar.x - p.x, avatar.y - p.y);
      if (d < mejorDist) { mejorDist = d; mejor = p; }
    }
    if (mejor) piedraLlevada = mejor;
  }
  function elegirPrediccion(eleccion: PrediccionCaida): void {
    if (piedraAterrizada) return;
    prediccion = eleccion;
    toast(eleccion === 'sube'
      ? 'Expectativa marcada: la piedra subirá como el agua.'
      : 'Expectativa marcada: la piedra caerá como siempre.');
  }
  function soltarPiedra(vx: number, vy: number): void {
    const p = piedraLlevada;
    if (!p || !prediccion) {
      if (p && !prediccion) toast('Antes de soltarla, marcá una expectativa: Q sube · E cae.');
      return;
    }
    p.vx = vx; p.vy = vy; p.inFlight = true; p.restante = false;
    piedraLlevada = null;
    trayectoria.isVisible = false;
    evidencia.isVisible = true;
    evidenciaPuntos = [new BABYLON.Vector3(p.x, p.y, 0.03)];
    BABYLON.MeshBuilder.CreateDashedLines('t-e', { points: evidenciaPuntos, dashSize: 0.09, gapSize: 0.14, instance: evidencia }, scene);
  }

  function actuar(): void {
    if (piedraLlevada) {
      if (!prediccion) elegirPrediccion('cae');
      else soltarPiedra(avatar.facing * LANZAR_VX, LANZAR_VY);
      return;
    }
    recogerMasCercana();

    /* Escena 3: recoger la losa */
    if (!equilibrioResuelto && !losaRecogida && !losaEnPosicion &&
        Math.abs(avatar.x - losaX) < 2.2 && avatar.y < losaY + 0.8) {
      losaRecogida = true;
      losa.setEnabled(false);
      toast('Recogiste la losa. Cubrila sobre la corriente ascendente.');
      return;
    }

    /* Escena 3: colocar la losa */
    if (losaRecogida && Math.abs(avatar.x - losaX) < 1.5 && avatar.y < losaY + 0.8) {
      losaRecogida = false;
      losaEnPosicion = true;
      losa.setEnabled(true);
      losa.position.set(losaX, losaY, 0);
      instrumento.speak('escena3_desequilibrio');
      toast('Cubriste la corriente ascendente. El equilibrio se rompe.');
      return;
    }

    /* Escena 4: anclar plataforma */
    if (avatar.x >= W_E4_INICIO && avatar.x < W_E4_FIN && !referenciaAnclada) {
      const idx = plataformasDrift.findIndex((pd) => Math.abs(avatar.x - pd.x0) < 3 && Math.abs(avatar.y - pd.base.top) < 0.8);
      if (idx >= 0) {
        referenciaAnclada = true;
        save.flags = { ...save.flags, referenciaAnclada: true };
        guardarSave(save);
        bitaBtn.classList.remove('hidden');
        instrumento.speak('escena4_referencia');
        toast('Anclaste la plataforma. El mundo se detuvo a tu alrededor.');
      }
    }

    /* Escena 5: tomar saquito */
    if (!vectorComun && avatar.x >= W_E5_INICIO && avatar.x < W_E5_FIN && Math.abs(avatar.y - 4.5) < 1.5) {
      for (const s of saquitos) {
        if (!s.inFlight && Math.hypot(avatar.x - s.x, avatar.y - s.y) < 1.5) {
          s.inFlight = true;
          s.vx = avatar.facing * 8;
          s.vy = 3;
          instrumento.speak('escena5_error');
          break;
        }
      }
    }

    /* Escena 6: colocar rampa */
    if (!planoInclinadoOk && !losaRampaColocada && avatar.x >= W_E6_INICIO && avatar.x < W_E6_FIN && Math.abs(avatar.x - rampaX) < 4 && avatar.y < rampaAlturaBase + 1) {
      losaRampaColocada = true;
      toast('Colocaste la rampa. Menor fuerza, mayor recorrido.');
      instrumento.speak('escena6_angulo');
    }

    /* Escena 6: empujar roca */
    if (losaRampaColocada && !roca6Movida && Math.abs(avatar.x - roca6X) < 1.2 && Math.abs(avatar.y - roca6Y) < 1.5) {
      // el empuje se resuelve en update(), solo marcamos intención
    }

    /* Escena 7: estabilizar */
    if (planoInclinadoOk && !estacionEstabilizada && Math.abs(avatar.x - estacionX) < 4 && Math.abs(avatar.y - estacionY) < 3) {
      estacionEstabilizada = true;
      save.flags = { ...save.flags, estacionEstabilizada: true };
      guardarSave(save);
      bitaBtn.classList.remove('hidden');
      rocaFlotanteGeo.isVisible = true;
      instrumento.speak('escena7_reconoce');
      setTimeout(() => instrumento.speak('escena7_consecuencia'), 2500);
      toast('La estación se estabilizó. Pero algo más cambió...');
      metroUI.classList.remove('hidden');
    }

    /* Escena 8: revelar metrópolis */
    if (avatar.x >= W_E8_INICIO && !metropolisRevelada) {
      metropolisRevelada = true;
      save.flags = { ...save.flags, metropolisRevelada: true };
      guardarSave(save);
      reloj.mostrar();
      reloj.setModoVector();
      instrumento.speak('escena8_revelacion');
      setTimeout(() => instrumento.speak('escena9_retorno'), 3000);
      toast('La metrópolis se revela. Hay demasiadas referencias.');
    }
  }

  /* ==================== trayectoria ==================== */

  function actualizarTrayectoria(): void {
    if (!piedraLlevada) { trayectoria.isVisible = false; marcaSube.isVisible = false; marcaCae.isVisible = false; return; }
    if (prediccion) { trayectoria.isVisible = false; marcaSube.isVisible = false; marcaCae.isVisible = false; return; }
    const x0 = avatar.x + avatar.facing * 0.75;
    const y0 = avatar.y + 0.35;
    const vx = avatar.facing * LANZAR_VX;
    const vy = LANZAR_VY;
    const puntos: BABYLON.Vector3[] = [];
    for (let i = 0; i < TRAYECTORIA_PUNTOS; i++) {
      const t = i * TRAYECTORIA_DT;
      const x = x0 + vx * t;
      const y = y0 + vy * t - (G * t * t) / 2;
      if (y < PIEDRA_R) break;
      puntos.push(new BABYLON.Vector3(x, y, 0.03));
    }
    if (puntos.length >= 2) {
      BABYLON.MeshBuilder.CreateDashedLines('t-p', { points: puntos, dashSize: 0.16, gapSize: 0.12, instance: trayectoria }, scene);
      trayectoria.isVisible = true;
    }
    const pulso = 1 + Math.sin(simT * 5) * 0.08;
    marcaSube.scaling.setAll(pulso); marcaCae.scaling.setAll(2 - pulso);
    marcaSube.isVisible = true; marcaCae.isVisible = true;
    marcaSube.position.x = x0 + avatar.facing * 1.15; marcaSube.position.y = y0 + 1.7;
    marcaCae.position.x = x0 + avatar.facing * 1.15; marcaCae.position.y = Math.max(0.45, y0 - 0.2);
  }

  /* ==================== plataformas ==================== */

  function getPlataformas(): Plataforma[] {
    const ps: Plataforma[] = [
      { x0: W_INICIO, x1: W_CORNISA_FIN, top: Y_CORNISA },
      { x0: W_E3_INICIO, x1: W_E3_FIN, top: Y_E3 },
      { x0: W_E4_INICIO, x1: W_E4_FIN, top: Y_VALLE },
      { x0: W_E5_INICIO - 2, x1: W_E5_FIN, top: Y_E5 },
      { x0: W_E6_INICIO, x1: W_E6_FIN, top: Y_CORNISA },
      { x0: W_E7_INICIO, x1: W_E7_FIN, top: Y_E7 },
    ];
    for (const pd of plataformasDrift) {
      ps.push({ x0: pd.base.x0, x1: pd.base.x1, top: pd.base.top });
    }
    if (plataformaObs.isEnabled()) {
      ps.push({ x0: W_E8_INICIO, x1: W_E8_INICIO + obsAncho, top: Y_E8 });
    }
    return ps;
  }

  /* ==================== drone de plataformas ==================== */

  function actualizarPlataformasDrift(): void {
    for (const pd of plataformasDrift) {
      const offset = pd.amplitude * Math.sin(pd.velocidad * simT + pd.fase);
      pd.mesh.position.x = pd.x0 + offset;
      pd.base.x0 = pd.x0 + offset - 2;
      pd.base.x1 = pd.x0 + offset + 2;
    }
  }

  /* ==================== saquitos ==================== */

  function actualizarSaquitos(dt: number): void {
    for (const s of saquitos) {
      if (!s.inFlight) continue;
      s.vy -= G * dt;
      if (s.x > W_E5_INICIO && s.x < W_E5_FIN) {
        s.vx += (-corrienteVel * 0.8) * dt;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.mesh.position.set(s.x, s.y, gorge5Depth - 0.6);
      if (s.y <= 4.5 && s.vy < 0) {
        s.y = 4.5; s.inFlight = false; s.vx = 0; s.vy = 0;
        s.mesh.position.set(s.x, s.y, gorge5Depth - 0.6);
      }
      if (s.x > receptor5X - 0.8 && s.x < receptor5X + 0.8 && s.y > receptor5Y - 0.5) {
        s.inFlight = false;
        vectorComun = true;
        save.flags = { ...save.flags, vectorComun: true };
        guardarSave(save);
        bitaBtn.classList.remove('hidden');
        instrumento.speak('escena5_acierto');
        receptor5.material = estilizado(0x9f8ce0, { emissive: 0x9a6ace });
        toast('El saquito llegó. Magnitud y dirección importan.');
      }
    }
  }

  /* ==================== roca rampa ==================== */

  function actualizarRoca6(dt: number): void {
    if (roca6Movida || !losaRampaColocada) return;
    if (Math.abs(avatar.x - roca6X) < 1.2 && Math.abs(avatar.y - roca6Y) < 1.5) {
      const dir = input.left ? -1 : input.right ? 1 : 0;
      if (dir !== 0) {
        roca6X += dir * 2 * dt;
        roca6Y += 2 * dt * Math.sin(Math.PI / 7);
        rocaGrande6Geo.position.set(roca6X, roca6Y, 0);
      }
      if (roca6X > rocaAltaX - 1) {
        roca6Movida = true;
        planoInclinadoOk = true;
        save.flags = { ...save.flags, planoInclinado: true };
        guardarSave(save);
        bitaBtn.classList.remove('hidden');
        instrumento.speak('escena6_angulo');
        toast('La roca llegó al soporte.');
      }
    }
  }

  /* ==================== prompt ==================== */

  function actualizarPrompt(): void {
    let msg = '';
    if (piedraLlevada) {
      msg = prediccion ? 'E · lanzar — Q · esperar que suba' : 'E · esperar que caiga — Q · esperar que suba';
    } else if (piedras.some((p) => piedraCerca(p))) {
      msg = 'E · recoger la piedra';
    }
    if (!equilibrioResuelto && avatar.x >= W_E3_INICIO - 3 && avatar.x < W_E3_FIN - 2) {
      msg += msg ? ' · ' : '';
      msg += losaRecogida ? 'Colocá la losa sobre la corriente' : 'E · recoger la losa';
    }
    if (!referenciaAnclada && avatar.x >= W_E4_INICIO && avatar.x < W_E4_FIN) {
      msg = 'Acercate a una plataforma y usá E para anclar referencia';
    }
    if (!vectorComun && avatar.x >= W_E5_INICIO && avatar.x < W_E5_FIN) {
      msg = 'E · tomar saquito · lazá contra la corriente';
    }
    if (!planoInclinadoOk && avatar.x >= W_E6_INICIO && avatar.x < W_E6_FIN) {
      msg = losaRampaColocada ? 'Empujá la roca por la rampa' : 'E · colocar la rampa';
    }
    if (estacionEstabilizada && !metropolisRevelada && avatar.x >= W_E8_INICIO) {
      msg = 'Seguí hacia la cima para ver la metrópolis';
    }
    if (metropolisRevelada && avatar.x >= W_E8_INICIO + obsAncho) {
      msg = '¡Has llegado a la cima!';
    }
    promptEl.textContent = msg;
    promptEl.classList.toggle('hidden', msg === '');
  }

  /* ==================== cámara ==================== */

  function zonaCamara(avatarX: number): { z: number; y: number; targetY: number } {
    if (avatarX < W_E3_INICIO) {
      if (avatarX >= 6 && avatarX < 7.5) return CAM.cascada;
      return CAM.escena2;
    }
    if (avatarX < W_E4_INICIO) return CAM.desfiladero;
    if (avatarX < W_E5_INICIO) return CAM.valle;
    if (avatarX < W_E6_INICIO) return CAM.corriente;
    if (avatarX < W_E7_INICIO) return CAM.rampa;
    if (avatarX < W_E8_INICIO) return CAM.estacion;
    return CAM.metro;
  }

  /* ==================== loop de actualización ==================== */

  function update(dt: number): void {
    simT += dt;

    if (bitaEdge) { if (bitaPanel.classList.contains('hidden')) abrirBitacora(); else cerrarBitacora(); }
    if (predSubeEdge && piedraLlevada && !piedraAterrizada) elegirPrediccion('sube');
    if (actEdge) actuar();
    actEdge = bitaEdge = predSubeEdge = false;

    /* piedra llevada */
    if (piedraLlevada) {
      piedraLlevada.x = avatar.x + avatar.facing * 0.75;
      piedraLlevada.y = avatar.y + 0.35;
      piedraLlevada.inFlight = false;
      piedraLlevada.mesh.position.set(piedraLlevada.x, piedraLlevada.y, 0);
    }
    actualizarTrayectoria();

    /* avatar */
    const plataformasActuales = getPlataformas();
    const avatarNuevo = integrarAvatar(avatar, { ...input, jump: jumpEdge }, dt, plataformasActuales);
    jumpEdge = false;
    avatar.x = avatarNuevo.x;
    avatar.y = avatarNuevo.y;
    avatar.vy = avatarNuevo.vy;
    avatar.facing = avatarNuevo.facing;
    avatar.onGround = avatarNuevo.onGround;

    /* límite del mundo */
    const worldLimit = metropolisRevelada ? W_E8_FIN + 40 : W_E8_INICIO + obsAncho + 2;
    avatar.x = Math.max(W_INICIO, Math.min(worldLimit, avatar.x));

    /* piedras en vuelo */
    for (const p of piedras) {
      if (!p.inFlight) continue;
      p.vy -= G * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x > W_E5_INICIO && p.x < W_E5_FIN && p.y > 3 && p.y < 5) {
        p.vx += (-corrienteVel * 0.8) * dt;
      }
      const enPiso = p.y <= PIEDRA_R && p.vy <= 0;
      if (enPiso && p.x >= W_INICIO - 0.5 && p.x <= worldLimit + 0.5) {
        p.y = PIEDRA_R; p.inFlight = false; p.restante = true;
        piedraAterrizada = true;
        if (prediccion) resultadoObservado = resultadoPrediccion(prediccion);
        if (resultadoObservado === 'error') toast('La piedra cayó. El agua siguió subiendo.');
      } else if (p.x < W_INICIO - 0.5 || p.x > worldLimit + 0.5 || p.y > CIELO_Y + 4) {
        p.inFlight = false; p.restante = true; p.x = p.inicioX; p.y = PIEDRA_R; p.vx = 0; p.vy = 0;
      }
      p.mesh.position.set(p.x, p.y, 0);
      const ultimo = evidenciaPuntos[evidenciaPuntos.length - 1];
      if (p.inFlight && ultimo && (Math.abs(ultimo.x - p.x) > 0.08 || Math.abs(ultimo.y - p.y) > 0.08)) {
        evidenciaPuntos = [...evidenciaPuntos, new BABYLON.Vector3(p.x, p.y, 0.03)];
        BABYLON.MeshBuilder.CreateDashedLines('t-e', { points: evidenciaPuntos, dashSize: 0.09, gapSize: 0.14, instance: evidencia }, scene);
      }
    }

    /* chorro ascendente */
    chorroEstado = integrar(chorroEstado, dt * motionScale, G);
    if (chorroEstado.y > CIELO_Y) chorroEstado = { y: LAGO_Y, v: 0, t: 0 };
    const frenteY = Math.max(LAGO_Y + 0.42, Math.min(CIELO_Y - 0.7, chorroEstado.y));
    frenteAgua.position.y = frenteY;
    frenteHalo.position.y = frenteY;
    frenteHalo.rotation.z = simT * 0.18 * motionScale;
    texturaAgua.vOffset -= dt * 0.55 * motionScale;

    /* nubes */
    for (const n of nubes) n.rotation.y = simT * 0.08 * motionScale;

    /* Escena 3: equilibrio */
    if (!equilibrioResuelto) {
      upCover = losaEnPosicion ? 0.3 : 1;
      flechaUpGeo.scaling.y = Math.max(0, upCover) * 0.8;
      flechaDownGeo.scaling.y = 0.8;
      const aNet = (upCover * FUERZA_UP - FUERZA_DOWN) * 0.08;
      instrumento.y += aNet * dt;
      instrumento.y = Math.max(Y_E3 + 1, Math.min(instrumentoYBase + 6, instrumento.y));
      instrumento.mesh.position.set(instrumento.x, instrumento.y, 0);

      if (losaEnPosicion && instrumento.y < instrumentoYBase - 1) {
        equilibrioResuelto = true;
        save.flags = { ...save.flags, equilibrioResuelto: true };
        guardarSave(save);
        bitaBtn.classList.remove('hidden');
        instrumento.speak('escena3_activacion');
        toast('El instrumento se movió. La suma de fuerzas dejó de ser cero.');
      }
    }

    /* Escena 4: drift */
    actualizarPlataformasDrift();

    /* Escena 5: saquitos */
    actualizarSaquitos(dt);

    /* Escena 6: roca */
    actualizarRoca6(dt);

    /* INSTRUMENTO sigue al avatar (desde Escena 3) */
    if (avatar.x >= W_E3_INICIO) {
      instrumento.seguir(avatar.x, avatar.y, avatar.facing === 1 ? -1.2 : 1.2);
      instrumento.update(dt);
      instrumento.apuntar(avatar.x, avatar.y);
      reloj.mesh.position.set(instrumento.x, instrumento.y + 1.2, -0.2);
      if (avatar.x >= W_E5_INICIO) {
        reloj.mostrar();
        reloj.visualizarVector(avatar.vx * 10, avatar.vy * 10);
        reloj.setModoVector();
      } else if (avatar.x >= W_E4_INICIO) {
        reloj.mostrar();
        reloj.setModoReferencia();
      } else {
        reloj.esconder();
      }
      reloj.update(0.016);
    } else {
      reloj.esconder();
    }

    /* Metropolis animada */
    if (metropolisRevelada) {
      metropoGroup.setEnabled(true);
      const trenes = metropoGroup.getChildren();
      for (const t of trenes) {
        if (t.name === 'tren') {
          (t as BABYLON.TransformNode).position.x += 0.3 * dt;
          if ((t as BABYLON.TransformNode).position.x > 60) (t as BABYLON.TransformNode).position.x = -50;
        }
      }
    }

    /* cámara curada */
    const zona = zonaCamara(avatar.x);
    const k = Math.min(1, 1 - Math.exp(-2 * dt));
    const fovObj = avatar.x >= W_E8_INICIO ? CAM_FOV_METRO : CAM_FOV;
    camera.position.x += (avatar.x - camera.position.x) * k;
    camera.position.y += (zona.y - camera.position.y) * k;
    camera.position.z += (zona.z - camera.position.z) * k;
    camera.fov += (fovObj - camera.fov) * k;
    camera.setTarget(new BABYLON.Vector3(avatar.x, zona.targetY, 0));

    /* mallas del avatar */
    avatarGroup.position.set(avatar.x, avatar.y - AVATAR_H / 2, 0);

    /* roca flotante */
    if (estacionEstabilizada) {
      rocaFlotanteGeo.isVisible = true;
      rocaFlotanteGeo.position.x = estacionX + 8 + Math.sin(simT * 2) * 0.3;
      rocaFlotanteGeo.position.y = estacionY + 8 + Math.sin(simT * 1.5) * 0.5;
    }

    actualizarPrompt();
    actualizarMetroUI();
  }

  /* ==================== render loop ==================== */

  function resize(): void { engine.resize(); }
  window.addEventListener('resize', resize);

  engine.runRenderLoop(() => {
    if (!running) return;
    const now = performance.now();
    update(Math.min(0.05, (now - last) / 1000));
    last = now;
    scene.render();
  });

  /* ==================== retorno ==================== */

  return {
    advanceTime(dtMs) {
      const chunk = 1 / 30;
      let restante = dtMs / 1000;
      while (restante > 1e-9) {
        update(Math.min(chunk, restante));
        restante -= Math.min(chunk, restante);
      }
    },
    snapshot() {
      return {
        runtime: 'platformer-babylon',
        avatar: { x: round2(avatar.x), y: round2(avatar.y), carrying: piedraLlevada !== null },
        piedras: piedras.map((p) => ({ x: round2(p.x), y: round2(p.y), inFlight: p.inFlight, restante: p.restante })),
        chorro: { y: round2(chorroEstado.y), v: round2(chorroEstado.v) },
        instrumento: { x: round2(instrumento.x), y: round2(instrumento.y) },
        flags: {
          cascadaObservada: observada,
          equilibrioResuelto,
          referenciaAnclada,
          vectorComun,
          planoInclinado: planoInclinadoOk,
          estacionEstabilizada,
          metropolisRevelada,
        },
        gravedad: G,
      };
    },
    pause() { running = false; },
    resume() { running = true; last = performance.now(); },
    teleport(x, y) {
      avatar.x = x; avatar.y = y; avatar.vy = 0;
      const piso = getPlataformas().find((p) => x >= p.x0 && x <= p.x1);
      avatar.onGround = piso ? y <= piso.top + AVATAR_H / 2 + 1e-6 : true;
    },
    dispose() {
      running = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      ui.remove();
      instrumento.dispose();
      reloj.dispose();
      physicaPhysics?.dispose();
      engine.dispose();
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    },
    press,
    physics() {
      return physicaPhysics;
    },
  };
}
