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
import { type MruvIntegrada } from './models/caidaLibre.ts';
import {
  CIELO_Y,
  LAGO_Y,
  resultadoPrediccion,
  type PrediccionCaida,
} from './models/cascadaAscendente.ts';
import { GRAVEDAD } from './models/cascadaAscendente.ts';
import {
  crearEstadoInstrumento,
  descensoPredecible,
  integrarInstrumento,
  desplazamientoDesdeCentro,
  type FuerzasOpuestas,
  type InstrumentoEstado,
} from './models/equilibrio.ts';
import {
  posicionPlataforma as posicionPlataformaModelo,
  posicionRelativa,
  velocidadMarcoAnclado,
  type PlataformaMovil,
  type SistemaReferencia,
} from './models/referenciaMovil.ts';
import {
  alcanceConCorriente,
  compensacionCorriente,
  objetivoAlcanzable,
  type Vector2D,
} from './models/vector.ts';
import {
  crearPlano as crearPlanoModelo,
  fuerzaTangencial,
  recorridoBase,
  sintesisPlanoInclinado,
  trabajoNecesario,
  FUERZA_LEVANTAR,
  type PlanoInclinado,
} from './models/planoInclinado.ts';
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
import { buildCascadeScene, type CascadeSceneEntities } from './scenes/cascadeScene.ts';

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
   escena2: { z: 36, y: 3.0, targetY: 1.0 },
  cascada: { z: 190, y: 14.5, targetY: 11.5 },
  desfiladero: { z: 80, y: 3.5, targetY: 1.5 },
  valle: { z: 120, y: 7, targetY: 0 },
  corriente: { z: 100, y: 5.5, targetY: 1 },
  rampa: { z: 70, y: 3, targetY: 1 },
  estacion: { z: 110, y: 9, targetY: 5 },
  metro: { z: 300, y: 28, targetY: 10 },
} as const;
// FOV vertical en radianes. 0.45 = 25.8° (estándar 2.5D, comparable
// a Trine / Planet of Lana). Antes 0.22 = 12.6° que era demasiado
// cerrado: el fondo no respiraba y el cielo cálido quedaba ocluido.
const CAM_FOV = 0.45;
const CAM_FOV_METRO = 0.32;

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
  // M0.7.1: ?clean=1 esconde TODO el HUD/paneles (back button, bita, metropoli,
  // prompt, touch) para que las capturas del harness muestren sólo el canvas.
  // El Visual Director auditó M0.6 y reportó la narrativa de Physica — Fundamentos
  // sangrando en la esquina superior derecha del frame de E8. La regresión se
  // debe a que el panel HTML está superpuesto al canvas y se capturaba junto
  // con la escena 3D. La fix deja la UX intacta (no se ven cambios en juego) y
  // deja el harness con capturas limpias para revisión de publisher.
  const cleanMode = new URLSearchParams(window.location.search).get('clean') === '1';
  if (cleanMode) {
    hostEl.classList.add('px-clean');
    // El HUD vive en #px-app (padre de #px-game donde se monta babylon) — el
    // botón "← Instituto" (#px-hud) es hermano de hostEl, no hijo. Marcamos
    // también #px-app y <html> para que los selectores CSS alcancen todos
    // los overlays, vivan donde vivan.
    document.getElementById('px-app')?.classList.add('px-clean');
    document.documentElement.classList.add('px-clean');
  }
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

  scene.clearColor = new BABYLON.Color4(0.08, 0.14, 0.22, 1);
  // Niebla atmosférica: lineal, calibrada para no tapar el primer plano.
  // El primer plano (cornisa + avatar) está a ~25-40u de cámara; el
  // horizonte y las montañas lejanas caen en 200-400u y se desvanecen
  // con el color del cielo bajo. Empujamos fogEnd a 500 para que el
  // cielo (z=-220, depth 410 desde dolly) no quede completamente
  // aplastado por la niebla (el cielo tiene applyFog=false igual).
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 60;
  scene.fogEnd = 500;
  scene.fogColor = new BABYLON.Color3(0.72, 0.78, 0.86);

  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, CAM.escena2.y, CAM.escena2.z), scene);
  camera.fov = CAM_FOV;
  camera.minZ = 0.1;
  camera.maxZ = 800;

  const hemi = new BABYLON.HemisphericLight('cool-fill', new BABYLON.Vector3(-0.25, 1, 0.3), scene);
  hemi.diffuse = new BABYLON.Color3(0.55, 0.72, 0.86);
  hemi.groundColor = new BABYLON.Color3(0.18, 0.22, 0.26);
  hemi.intensity = 1.05;
  const sun = new BABYLON.DirectionalLight('golden-key', new BABYLON.Vector3(-0.55, -0.82, 0.38), scene);
  sun.position = new BABYLON.Vector3(24, 34, 18);
  sun.diffuse = new BABYLON.Color3(1, 0.78, 0.52);
  sun.specular = new BABYLON.Color3(1, 0.86, 0.62);
  sun.intensity = 2.6;
  sun.shadowMinZ = -150;
  sun.shadowMaxZ = 400;
  const shadows = new BABYLON.ShadowGenerator(1024, sun);
  shadows.useBlurExponentialShadowMap = true;
  shadows.blurKernel = 24;
  shadows.darkness = 0.34;

  /* ============================================================
     BACKDROP PINTADO (M0.6) — generado con mmx-cli. Un solo plano
     ancho detrás de todo el mundo que combina cielo y montañas en
     UNA imagen. Cubre x∈[-200,200], z=-220, height 200u. La
     imagen tiene cielo arriba (top 50%) y montañas+atmósfera
     abajo (bottom 50%) — el V-mapping del plano pone cielo en
     y≈30..130 y montañas en y≈-70..30. La cornisa tapa la base.
     ============================================================ */
  const worldBackgroundMountains: BABYLON.Mesh[] = [];
  const worldMountTextures: BABYLON.Texture[] = [];
  // Cargar las texturas generadas con mmx-cli desde public/assets.
  // Importante: URL absoluta con slash inicial. Si es relativa y la página
  // está en /physica/, Babylon la busca como /physica/assets/... que NO
  // existe en producción, y muestra el checkerboard de debug. `invertY=true`
  // porque las imágenes mmx se generan con cielo arriba en píxel top, pero
  // Babylon lee las texturas con origen en bottom-left por defecto.
  const mountainFarUrl = '/assets/physica/textures/mountain-far_001.jpg';
  const mountainFarTex = new BABYLON.Texture(
    mountainFarUrl, scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  worldMountTextures.push(mountainFarTex);
  // Segunda capa de montañas (mmx-cli mountain-mid_001.jpg) — siluetas
  // con pinos oscuros y tinte teal, da profundidad entre el observador
  // y el mountain-far alpenglow. Va a z=-100 (más cerca que -220 del
  // far), 21:9 width 440 height 130, centrada en y=20. El plano está
  // tapado por la cornisa en x∈[-12,14] para que no se "meta" dentro
  // del gameplay.
  const mountainMidUrl = '/assets/physica/textures/mountain-mid_001.jpg';
  const mountainMidTex = new BABYLON.Texture(
    mountainMidUrl, scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  worldMountTextures.push(mountainMidTex);
  // Crear 3 planos del backdrop (far, mid, near-back) a diferentes Z
  // para depth parallax. Cada uno usa la imagen mmx.
  const makeBackdrop = (
    name: string, xCenter: number, yPos: number, z: number,
    width: number, height: number, tex: BABYLON.Texture,
  ): BABYLON.Mesh => {
    const plane = BABYLON.MeshBuilder.CreatePlane(name, { width, height }, scene);
    plane.position.set(xCenter, yPos, z);
    // StandardMaterial con disableLighting es más predecible que PBR+unlit:
    // se ve EXACTAMENTE como la imagen, sin contribuciones de luz ni de
    // environment, sin patrón de damero cuando el noMipmap está mal.
    const mat = new BABYLON.StandardMaterial(`mat-${name}`, scene);
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    plane.material = mat;
    plane.applyFog = false;
    worldBackgroundMountains.push(plane);
    return plane;
  };
  // Backdrop lejano — un solo plano gigante que respeta el ratio 21:9 de
  // la imagen mmx. Cubre x∈[-220,220] (width 440) y y∈[-26,158] (height
  // 184, centrado en y=66). El plano se ve desde spawn, dolly y metrópolis
  // sin gaps. La parte inferior (y<0) queda tapada por la cornisa; la
  // parte superior (y>130) queda fuera de la FOV del cenit visible.
  // M0.7.4: en E8 (metropolisRevelada) se desactiva porque la silueta de
  // ciudad pintada tiene su propio cielo y queremos que ocupe todo el BG.
  const farBackdrop = makeBackdrop('world-backdrop-far', 0, 66, -220, 440, 184, mountainFarTex);
  // Capa media — siluetas de pinos + montañas teal, da parallax. Más
  // cerca (z=-100) y más baja (y=20, height 130) que el far. Se ve
  // DETRÁS de los meshes del juego (gorge, plataformas) y ADELANTE del
  // far alpenglow, creando la sensación de capas de cordillera.
  // M0.7.4: en E8 (metropolisRevelada) se desactiva para no tapar la
  // silueta pintada de ciudad, que vive a z=-150 y quedaría oculta detrás
  // de este plano opaco.
  const midBackdrop = makeBackdrop('world-backdrop-mid', 0, 20, -100, 440, 130, mountainMidTex);

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

  /* ==================== ESCENA 2: PRESENTACIÓN VISUAL ==================== */
  const cascadeScene: CascadeSceneEntities = buildCascadeScene({
    scene,
    shadows,
    prefersReducedMotion: prefersReducedMotion(),
  });
  const motionScale = prefersReducedMotion() ? 0.3 : 1;

  /* El suelo jugable y las piedras siguen siendo entidades de gameplay. */


  /* piedras recogibles */
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

  /* gorge visual — paredes con textura mmx-cli (roca con musgo) y
     profundidad atmosférica. Antes eran cajas planas oscuras sin
     identidad. */
  // Capa de fondo: alpha 0.5, cliff-wall con uScale mayor (2) para que
  // se lea como pared lejana sin detalle fino.
  const gorgeProfTex = new BABYLON.Texture(
    '/assets/physica/textures/cliff-wall-v2_001.jpg',
    scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  gorgeProfTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  gorgeProfTex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  gorgeProfTex.uScale = 2;
  gorgeProfTex.vScale = 0.5;
  worldMountTextures.push(gorgeProfTex);
  const gorgeProfundoMat = new BABYLON.StandardMaterial('gorge-profundo-mat', scene);
  gorgeProfundoMat.diffuseTexture = gorgeProfTex;
  gorgeProfundoMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.1);
  gorgeProfundoMat.alpha = 0.55;
  gorgeProfundoMat.backFaceCulling = false;
  const gorgeProfundo = box(desfiladeroAncho, 6, 30, gorgeProfundoMat);
  gorgeProfundo.position.set((W_E3_INICIO + W_E3_FIN) / 2, -7, -26);
  // Textura mmx: cliff-wall-v2_001.jpg, pared de roca con grietas y musgo
  // en las uniones, tileable vertical, ideal para pared de gorge.
  const paredGorgeTex = new BABYLON.Texture(
    '/assets/physica/textures/cliff-wall-v2_001.jpg',
    scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  paredGorgeTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  paredGorgeTex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
  paredGorgeTex.uScale = 1.5;
  paredGorgeTex.vScale = 0.7;
  const paredGorgeMat = new BABYLON.StandardMaterial('pared-gorge-mat', scene);
  paredGorgeMat.diffuseTexture = paredGorgeTex;
  paredGorgeMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.1);
  const paredGorgeL = box(0.8, 14, 28, paredGorgeMat);
  paredGorgeL.position.set(W_E3_INICIO + 2, 0, -24);
  const paredGorgeR = box(0.8, 14, 28, paredGorgeMat);
  paredGorgeR.position.set(W_E3_FIN - 2, 0, -24);

  /* INSTRUMENTO suspendido */
  const instrumentoX = (W_E3_INICIO + W_E3_FIN) / 2;
  const instrumentoYBase = 5;
  const FUERZA_UP = 9.8;
  const FUERZA_DOWN = 9.8;
  /** Escala que traduce m/s² del modelo analítico a unidades del juego. Mantiene
      la fórmula cerrada `a = upAcc·upCover − downAcc` intacta. */
  const EQUILIBRIO_GAME_SCALE = 0.08;
  let upCover = 1;
  /** Estado analítico del instrumento (integración cerrada por `integrarInstrumento`). */
  let instrumentoEstado: InstrumentoEstado = crearEstadoInstrumento(instrumentoYBase);

  /* Corriente ascendente (visual) — el jugador debe VER qué cubrir.
     Columna de partículas que sube desde el fondo del desfiladero
     hasta el instrumento. La losa, al cubrirla, también atenúa este
     visual (se aplica en el update de la escena). */
  const corrienteAscCanvas = document.createElement('canvas');
  corrienteAscCanvas.width = 32; corrienteAscCanvas.height = 32;
  const cag = corrienteAscCanvas.getContext('2d')!;
  const cagGrad = cag.createRadialGradient(16, 16, 1, 16, 16, 16);
  cagGrad.addColorStop(0, 'rgba(180,255,235,1)');
  cagGrad.addColorStop(0.5, 'rgba(120,230,200,0.7)');
  cagGrad.addColorStop(1, 'rgba(80,180,160,0)');
  cag.fillStyle = cagGrad;
  cag.fillRect(0, 0, 32, 32);
  const corrienteAscTex = new BABYLON.Texture(corrienteAscCanvas.toDataURL(), scene);
  const corrienteAsc = new BABYLON.ParticleSystem('corriente-ascendente', 240, scene);
  corrienteAsc.particleTexture = corrienteAscTex;
  // emisor: caja pequeña en el fondo del desfiladero, debajo del instrumento
  const corAscEmitter = BABYLON.MeshBuilder.CreateBox('cor-asc-emitter', { size: 0.01 }, scene);
  corAscEmitter.position.set(instrumentoX, 0.4, -1);
  corAscEmitter.isVisible = false;
  corrienteAsc.emitter = corAscEmitter;
  corrienteAsc.minEmitBox = new BABYLON.Vector3(-0.8, 0, -0.3);
  corrienteAsc.maxEmitBox = new BABYLON.Vector3(0.8, 0, 0.3);
  corrienteAsc.color1 = new BABYLON.Color4(0.4, 0.95, 0.78, 0.85);
  corrienteAsc.color2 = new BABYLON.Color4(0.25, 0.75, 0.6, 0.7);
  corrienteAsc.colorDead = new BABYLON.Color4(0.1, 0.3, 0.25, 0);
  corrienteAsc.minSize = 0.18;
  corrienteAsc.maxSize = 0.35;
  corrienteAsc.minLifeTime = 1.2;
  corrienteAsc.maxLifeTime = 2.0;
  corrienteAsc.emitRate = 110;
  corrienteAsc.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  corrienteAsc.gravity = new BABYLON.Vector3(0, 6, 0);
  corrienteAsc.direction1 = new BABYLON.Vector3(-0.4, 2, -0.2);
  corrienteAsc.direction2 = new BABYLON.Vector3(0.4, 4, 0.2);
  corrienteAsc.minAngularSpeed = 0;
  corrienteAsc.maxAngularSpeed = Math.PI;
  corrienteAsc.minEmitPower = 1;
  corrienteAsc.maxEmitPower = 2;
  corrienteAsc.updateSpeed = 0.012;
  corrienteAsc.start();
  // Corriente descendente (más sutil) — fuerza que empuja el instrumento hacia abajo.
  const corDescEmitter = BABYLON.MeshBuilder.CreateBox('cor-desc-emitter', { size: 0.01 }, scene);
  corDescEmitter.position.set(instrumentoX, instrumentoYBase + 0.6, 0);
  corDescEmitter.isVisible = false;
  const corrienteDesc = new BABYLON.ParticleSystem('corriente-descendente', 100, scene);
  corrienteDesc.particleTexture = corrienteAscTex;
  corrienteDesc.emitter = corDescEmitter;
  corrienteDesc.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.2);
  corrienteDesc.maxEmitBox = new BABYLON.Vector3(0.4, 0, 0.2);
  corrienteDesc.color1 = new BABYLON.Color4(1, 0.55, 0.45, 0.55);
  corrienteDesc.color2 = new BABYLON.Color4(0.85, 0.35, 0.3, 0.45);
  corrienteDesc.colorDead = new BABYLON.Color4(0.4, 0.1, 0.1, 0);
  corrienteDesc.minSize = 0.12;
  corrienteDesc.maxSize = 0.24;
  corrienteDesc.minLifeTime = 0.9;
  corrienteDesc.maxLifeTime = 1.6;
  corrienteDesc.emitRate = 50;
  corrienteDesc.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  corrienteDesc.gravity = new BABYLON.Vector3(0, -4, 0);
  corrienteDesc.direction1 = new BABYLON.Vector3(-0.3, -1.5, -0.2);
  corrienteDesc.direction2 = new BABYLON.Vector3(0.3, -3, 0.2);
  corrienteDesc.start();

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
  /** Sombra-proyección de la losa: indica dónde caerá sobre la corriente. */
  const losaSombraMat = estilizado(0x3a3a3a, { alpha: 0.32 });
  const losaSombra = box(3.2, 0.04, 2.6, losaSombraMat);
  losaSombra.position.set(losaX, Y_E3 + 0.05, 0);
  losaSombra.isVisible = false;
  /** Cobertura cuando el jugador suelta la losa sobre la corriente. La fracción
      que la losa quita a la corriente ascendente depende de su offset horizontal
      respecto al centro del chorro (instrumentoX). */
  let upCoverObjetivo = 1;

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
    /** Modelo analítico (consumido por `posicionPlataforma`). */
    modelo: PlataformaMovil;
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
      modelo: { x0: xBase, amplitude: 5, omega: 1.2, phase: i * 1.7 },
      mesh,
    });
  }

  /** Sistema de referencia analítico (Escena 4). El anclaje lo cambia el
      jugador al pulsar E sobre una plataforma. Las posiciones visuales
      consumen `posicionPlataforma` del modelo. */
  const sistemaReferencia: SistemaReferencia = {
    plataformas: plataformasDrift.map((pd) => pd.modelo),
    anclajeIdx: -1,
  };

  /* receptáculo — se ancla a la plataforma receptora (índice 2) por su
      movimiento común: la piedra lanzada debe llevar la velocidad de esa
      plataforma para alcanzarlo. */
  const RECEPTOR_PLATAFORMA_IDX = 2;
  const receptorBaseX = plataformasDrift[RECEPTOR_PLATAFORMA_IDX].modelo.x0;
  const receptorY = driftY;
  const receptor = box(2, 1.2, 1.4, estilizado(0x7a8a78));
  receptor.position.set(receptorBaseX, receptorY + 0.6, 0);
  receptor.receiveShadows = true;

  /* Marcador visual del anclaje: anillo dorado alrededor de la plataforma anclada.
      Indica al jugador que esa plataforma es ahora su sistema de referencia. */
  const anilloAnclaje = BABYLON.MeshBuilder.CreateTorus('anillo-anclaje', {
    diameter: 5.2, thickness: 0.12, tessellation: 48,
  }, scene);
  anilloAnclaje.material = estilizado(0xf4d39c, { alpha: 0.7, emissive: 0xb86e2d });
  anilloAnclaje.rotation.x = Math.PI / 2;
  anilloAnclaje.isVisible = false;

  /* Marca lejana de "el mundo se mueve": una silueta distante que, cuando hay
      anclaje, se desplaza en pantalla en sentido opuesto a la plataforma anclada
      (mismo `velocidadMarcoAnclado` que el modelo analítico). */
  const mundoDistante = BABYLON.MeshBuilder.CreatePlane('mundo-distante', { width: 60, height: 14 }, scene);
  mundoDistante.material = estilizado(0x3a4a5a, { alpha: 0.5, emissive: 0x1a2a3a });
  mundoDistante.position.set((W_E4_INICIO + W_E4_FIN) / 2, driftY + 5, -90);
  let mundoDistanteX0 = mundoDistante.position.x;

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
    /** Tiempo de vuelo analítico (modelo puro): permite predecir el impacto. */
    tVuelo: number;
  }
  const saquitos: Saquito[] = [];
  const saquitoMat = estilizado(0x9f8ce0, { alpha: 0.8, emissive: 0x6a5a9e });
  for (let i = 0; i < 3; i++) {
    const x = W_E5_INICIO + 8 + i * 10;
    const mesh = BABYLON.MeshBuilder.CreateSphere('saquito', { diameter: 0.4, segments: 8 }, scene);
    mesh.material = saquitoMat;
    mesh.position.set(x, 4.5, gorge5Depth - 0.6);
    saquitos.push({ x, y: 4.5, vx: 0, vy: 0, inFlight: false, mesh, tVuelo: 0 });
  }

  const receptor5X = W_E5_FIN - 4;
  const receptor5Y = 5;
  const receptor5 = BABYLON.MeshBuilder.CreateTorus('receptor5', { diameter: 1.6, thickness: 0.3, tessellation: 24 }, scene);
  receptor5.material = estilizado(0x9f8ce0, { alpha: 0.6, emissive: 0x6a5a9e });
  receptor5.position.set(receptor5X, receptor5Y, gorge5Depth - 0.3);
  receptor5.rotation.x = Math.PI / 2;

  /** Corriente transversal analítica (Escena 5). El modelo `vector.ts` la usa
      en `compensacionCorriente` y `objetivoAlcanzable`. */
  const CORRIENTE_X = -5; // hacia la izquierda
  const corrienteVector: Vector2D = { x: CORRIENTE_X, y: 0 };

  /** Apuntado: el jugador compone el vector de lanzamiento con la corriente.
      Mientras no hay piedra en vuelo, mantener ↑/↓ ajusta `vyApuntada` y ←/→
      ajusta `vxApuntada`. La aguja del reloj muestra el vector en tiempo real.
      Hay ≥2 soluciones válidas (high arc vs low arc). */
  let vxApuntada = 7;
  let vyApuntada = 3;
  const VX_MIN = 1;
  const VX_MAX = 14;
  const VY_MIN = -4;
  const VY_MAX = 9;

  /** Trayectoria-preview del lanzamiento: usa `muestrearTrayectoria` del modelo
      de tiro parabólico compensado por la corriente. */
  const previewPuntos: BABYLON.Vector3[] = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Up()];
  const previewTrayectoria = BABYLON.MeshBuilder.CreateDashedLines('preview-trayectoria', {
    points: previewPuntos, dashSize: 0.16, gapSize: 0.12, updatable: true,
  }, scene);
  previewTrayectoria.material = estilizado(0xf4d39c, { alpha: 0.55, emissive: 0xb86e2d });
  previewTrayectoria.isVisible = false;
  
  /* ==================== ESCENA 6: PLANO INCLINADO ====================
 */

  const rampaX = W_E6_INICIO + 8;
  const rampaAlturaBase = 2;
  const rocaAltaX = W_E6_FIN - 6;
  const rocaAltaY = rampaAlturaBase + 5;
  let roca6Movida = false;
  /** Plano inclinado construido por el jugador (modelo puro). `null` = sin construir. */
  let planoConstruido: PlanoInclinado | null = null;
  /** Ángulo actual mientras el jugador ajusta la rampa con el input. */
  let anguloRampa = 25;
  const ANGULO_MIN = 8;
  const ANGULO_MAX = 70;

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

  /** Losa-rampa: arranca en el suelo (sin ángulo). El jugador la "construye"
      usando el input. */
  const losaRampa = box(7, 0.24, 2.2, estilizado(0x8a6f4d));
  losaRampa.position.set(rampaX, rampaAlturaBase + 0.6, 0);
  losaRampa.rotation.z = 0;
  losaRampa.receiveShadows = true;

  const apoyo1 = box(0.3, 1, 0.3, estilizado(0x7a6447));
  apoyo1.position.set(rampaX - 3.4, rampaAlturaBase + 0.5, 0);
  const apoyo2 = box(0.3, 1, 0.3, estilizado(0x7a6447));
  apoyo2.position.set(rampaX + 3.4, rampaAlturaBase + 0.5, 0);
  apoyo1.receiveShadows = true;
  apoyo2.receiveShadows = true;

  /** HUD de la Escena 6: muestra fuerza tangencial, recorrido base y validez del
      plano (modelo puro). TODO(guion): texto neutro hasta que exista guion. */
  const rampaHud = document.createElement('div');
  rampaHud.className = 'px-rampa-hud hidden';
  rampaHud.style.cssText = `
    position: absolute; top: 1rem; left: 50%; transform: translateX(-50%);
    background: rgba(13,24,36,0.85); border: 1px solid #62d4c0; border-radius: 8px;
    padding: 0.5rem 1rem; color: #cfeaff; font-size: 0.85rem;
    z-index: 30; pointer-events: none; line-height: 1.4;
  `;
  hostEl.appendChild(rampaHud);

  function refrescarRampaHud(): void {
    if (!planoConstruido) { rampaHud.classList.add('hidden'); return; }
    const f = fuerzaTangencial(planoConstruido);
    const base = recorridoBase(planoConstruido);
    const ok = sintesisPlanoInclinado(planoConstruido);
    rampaHud.innerHTML = `
      <div>// TODO(guion): rampa — ángulo, fuerza y recorrido</div>
      <div>ángulo: ${anguloRampa.toFixed(1)}° · fuerza tangencial: ${f.toFixed(1)} N</div>
      <div>recorrido base: ${base.toFixed(2)} m · trabajo: ${trabajoNecesario(planoConstruido).toFixed(1)} J</div>
      <div>${ok ? '✓ menor que el peso' : '⚠ fuera de rango'}</div>
    `;
    rampaHud.classList.remove('hidden');
  }

  /* ==================== ESCENA 7: ESTACIÓN PEDAGÓGICA ====================
 * Síntesis de los modelos previos: la estación contiene tres anillos que el
 * jugador debe "activar" componiendo referencia + vector + plano inclinado.
 *  - Anillo exterior (anillo 0): equilibrio. Hay que colocar la losa-rampa
 *    sobre el contrapeso para que las fuerzas opuestas se cancelen.
 *  - Anillo medio    (anillo 1): referencia. Hay que anclar la estación a
 *    la plataforma de la Escena 4 (cambio de marco analítico).
 *  - Anillo interior (anillo 2): vector. Hay que lanzar un saquito al canal
 *    con un vector que componga la corriente (modelo vector.ts).
 */

  const estacionX = W_E7_INICIO + 12;
  const estacionY = Y_E7;

  const anilloMat = estilizado(0xc0a080, { alpha: 0.7, emissive: 0x8a6a4a });
  const anilloApagadoMat = estilizado(0x4a3a2a, { alpha: 0.4 });
  const anillos: BABYLON.Mesh[] = [];
  const anilloTam = [1.8, 1.3, 0.85];
  for (let i = 0; i < 3; i++) {
    const a = BABYLON.MeshBuilder.CreateTorus(`anillo-${i}`, { diameter: anilloTam[i], thickness: 0.12, tessellation: 48 }, scene);
    a.material = anilloApagadoMat;
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

  /** Losa para el anillo de equilibrio. La pone el jugador sobre el
      contrapeso — la cubrenza parcial equilibra la estación. */
  const losaEstacion = box(1.6, 0.2, 1.6, estilizado(0x8a6f4d));
  losaEstacion.position.set(estacionX + 5, estacionY + 0.6, 0);
  losaEstacion.receiveShadows = true;
  losaEstacion.isVisible = false;

  /** Saquito-vectorial dedicado a la estación. Se lanza con el mismo control
      que la Escena 5 (↑/↓ ángulo, ←/→ fuerza) pero contra la corriente
      interna de la estación. */
  interface SaquitoEstacion {
    x: number; y: number; vx: number; vy: number;
    inFlight: boolean; mesh: BABYLON.Mesh; tVuelo: number;
  }
  const saquitoEstacionMesh = BABYLON.MeshBuilder.CreateSphere('saquito-est', { diameter: 0.4, segments: 8 }, scene);
  saquitoEstacionMesh.material = estilizado(0x9f8ce0, { alpha: 0.8, emissive: 0x6a5a9e });
  saquitoEstacionMesh.position.set(estacionX - 6, estacionY + 2, 0.05);
  const saquitoEstacion: SaquitoEstacion = {
    x: estacionX - 6, y: estacionY + 2, vx: 0, vy: 0, inFlight: false, mesh: saquitoEstacionMesh, tVuelo: 0,
  };
  const CORRIENTE_EST_X = -3;
  const CANAL_X = estacionX;
  const CANAL_Y = estacionY + 2;

  /** Roca-pequeña decorativa del contrapeso (escena 7). */
  const rocaEstGeo = BABYLON.MeshBuilder.CreateIcoSphere('roca-est', { radius: 0.4, subdivisions: 1, flat: true }, scene);
  rocaEstGeo.material = estilizado(0x6a6266);
  rocaEstGeo.position.set(estacionX + 3, estacionY + 0.4, 0);

  let anillo0Activo = false; // equilibrio
  let anillo1Activo = false; // referencia
  let anillo2Activo = false; // vector

  /* Estado analítico del contrapeso (Escena 7 anillo 0). Se integra con
     `integrarInstrumento` a partir de la cobertura de la losa. El anillo
     se activa cuando el modelo predice descenso Y la posición
     realmente recorrida supera el umbral. */
  const contrapesoYBase = estacionY + 3;
  let contrapesoEstado: InstrumentoEstado = crearEstadoInstrumento(contrapesoYBase);
  let contrapesoUpCover = 1;
  /* Tiempo acumulado en el que la estación coincide con la plataforma
     anclada (Escena 7 anillo 1). */
  let anillo1TiempoEnMarco = 0;
  const ANILLO1_TIEMPO_REQUERIDO = 1.5; // s

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

  /* metrópolis 3D — edificios + skyline. Reposicionado más cerca del
     observador (W_E8_INICIO + 50) para que se vea desde la escalerilla
     de la estación. Antes estaba a W_E8_INICIO + 200 (300u), pero el
     avatar termina la estación cerca de W_E8_FIN (140) y la cámara no
     tiene distancia suficiente para apreciarlo. */
  const metropoGroup = new BABYLON.TransformNode('metropoli', scene);
  metropoGroup.position.set(W_E8_INICIO + 50, Y_E8, -180);
  /* Por defecto la metrópoli está OCULTA — sólo se revela al subir a la
     cima de la estación con `estacionEstabilizada && Math.abs(avatar.vx) > 0.3`
     (ver gatillo de `metropolisRevelada` más abajo). Sin este setEnabled
     inicial, los edificios 3D se renderizan durante TODA la cornisa y
     aparecen como bloques azules detrás de la cascada. */
  metropoGroup.setEnabled(false);

  /* M0.7.4 — la metrópolis ahora es PURAMENTE la silueta pintada con mmx-cli
     (city-silhouette_001.jpg — siluetas góticas con luces amarillas en
     ventanas, niebla verde-azul) más un puñado de faros puntuales. Antes
     había 12+6 edificios 3D, 4 torres, 3 trenes, 8 siluetas distantes y
     8 montañas decorativas — todas chocaban con la imagen pintada y, peor,
     las siluetas distantes a z=-300 a -540 quedaban dentro de la niebla
     (fogEnd=500) y aparecían como rectángulos blancos fantasma en la captura
     de E8. La imagen mmx ya tiene la densidad de skyline que necesitamos.
     width 280 (un poco más grande para legibilidad) y height 110. */
  const citySilhouetteTex = new BABYLON.Texture(
    '/assets/physica/textures/city-silhouette_001.jpg',
    scene, false, true,
    BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
  );
  worldMountTextures.push(citySilhouetteTex);
  const cityPlane = BABYLON.MeshBuilder.CreatePlane('metropoli-skyline', { width: 500, height: 200 }, scene);
  cityPlane.position.set(0, 40, 30);  // local; metropoGroup offset ya lo coloca
  const cityMat = new BABYLON.StandardMaterial('mat-metropoli-skyline', scene);
  cityMat.diffuseTexture = citySilhouetteTex;
  cityMat.emissiveTexture = citySilhouetteTex;
  cityMat.specularColor = new BABYLON.Color3(0, 0, 0);
  cityMat.disableLighting = true;
  cityMat.backFaceCulling = false;
  cityPlane.material = cityMat;
  cityPlane.applyFog = false;
  cityPlane.parent = metropoGroup;

  /* faros puntuales — puntos de luz cálida que danzan frente al skyline
     pintado. Sin geometría 3D, sólo luces + pequeños halos planos que
     sugieren actividad urbana. Mucho más limpio que la maraña de cajas
     anterior. */
  const faroPosArr = [
    [-22, 6, 8], [-8, 4, 12], [4, 8, 10], [18, 5, 14], [32, 7, 9],
  ];
  const faros: BABYLON.PointLight[] = [];
  for (let i = 0; i < faroPosArr.length; i++) {
    const [fx, fy, fz] = faroPosArr[i];
    const luz = new BABYLON.PointLight(`luz-metro-${i}`, new BABYLON.Vector3(fx, fy, fz), scene);
    luz.parent = metropoGroup;
    luz.diffuse = new BABYLON.Color3(0.95, 0.75, 0.45);
    luz.specular = new BABYLON.Color3(1, 0.85, 0.55);
    luz.intensity = 0.55;
    luz.range = 18;
    faros.push(luz);
  }

  metropoGroup.setEnabled(false);

  /* ==================== AVATAR ==================== */

  const avatar: Avatar = crearAvatar(0, Y_CORNISA + AVATAR_H / 2);
  const avatarGroup = new BABYLON.TransformNode('avatar', scene);
  const torso = BABYLON.MeshBuilder.CreateCylinder('cuerpo-proporcionado', { diameterTop: 0.34, diameterBottom: 0.52, height: 0.72, tessellation: 8 }, scene);
  torso.material = estilizado(0xc28d62, { specular: 0x7a523a }); torso.position.y = 0.84;
  const cabeza = BABYLON.MeshBuilder.CreateSphere('cabeza', { diameter: 0.46, segments: 12 }, scene);
  cabeza.material = estilizado(0xe3c39b); cabeza.position.y = 1.36;
  const piernas = BABYLON.MeshBuilder.CreateCylinder('botas', { diameter: 0.38, height: 0.48, tessellation: 8 }, scene);
  piernas.material = estilizado(0x343b4b); piernas.position.y = 0.24;
  const cape = BABYLON.MeshBuilder.CreateCylinder('capa-capa', { diameterTop: 0.18, diameterBottom: 1.05, height: 1.12, tessellation: 6 }, scene);
  cape.material = estilizado(0x354f68, { emissive: 0x142638, specular: 0x243e55 }); cape.position.set(0, 0.78, 0.18); cape.scaling.z = 0.42;
  const hood = BABYLON.MeshBuilder.CreateSphere('capucha', { diameter: 0.52, segments: 10 }, scene);
  hood.material = estilizado(0x405c70, { emissive: 0x182936 }); hood.position.set(0, 1.48, 0.08); hood.scaling.y = 0.72;
  const visor = box(0.28, 0.1, 0.04, estilizado(0x8ce8ef, { emissive: 0x3bc1ce, specular: 0xb9ffff })); visor.position.set(0, 1.38, -0.22);
  const armL = box(0.13, 0.52, 0.15, estilizado(0xb17a56)); armL.position.set(-0.34, 0.86, 0);
  const armR = box(0.13, 0.52, 0.15, estilizado(0xb17a56)); armR.position.set(0.34, 0.86, 0);
  for (const part of [torso, cabeza, piernas, cape, hood, visor, armL, armR]) { avatarGroup.addChild(part); shadows.addShadowCaster(part); }
  /* M0.7.5 — rim light del avatar. PointLight cálido desde arriba-atrás
     que dibuja un contorno luminoso sobre el avatar contra el cielo
     brillante (INSIDE / Planet of Lana standard). El avatar antes se
     perdía contra el alpenglow rosado del backdrop. */
  const avatarRim = new BABYLON.PointLight('avatar-rim', new BABYLON.Vector3(0, 3, -3), scene);
  avatarRim.diffuse = new BABYLON.Color3(1.0, 0.78, 0.55);
  avatarRim.specular = new BABYLON.Color3(1, 0.85, 0.6);
  avatarRim.intensity = 0.9;
  avatarRim.range = 6;

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
  /* Activar la metrópolis INMEDIATAMENTE al cargar si el flag ya estaba
     seteado. Antes se hacía sólo en el update loop, que se ejecuta
     DESPUÉS del primer frame — entonces en el reload del screenshot
     la metrópolis aparecía un frame tarde, con la cámara ya teleported,
     y se perdía la captura. */
  if (metropolisRevelada) {
    metropoGroup.setEnabled(true);
    /* M0.7.4 — apagar el midBackdrop (pinos+teal) en E8 para que la silueta
       de ciudad pintada sea visible. El mid vive a z=-100 y es opaco;
       la ciudad a z=-150 quedaba completamente oculta detrás. */
    midBackdrop.setEnabled(false);
    /* M0.7.4 — apagar también el farBackdrop (alpenglow montañas) en E8.
       La silueta de ciudad pintada tiene su propio cielo teal-grisáceo con
       estrellas; el alpenglow rosa-morado del backdrop no combina con el
       cielo nocturno de la ciudad. */
    farBackdrop.setEnabled(false);
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
  /** Ajuste fino del vector de apuntado en Escena 5. ↑/↓ ajustan `vy`,
      ←/→ ajustan `vx`. Se aplica mientras la tecla está mantenida. */
  const apuntarInput = { up: false, down: false, left: false, right: false };
  function setApuntar(code: string, down: boolean): void {
    switch (code) {
      case 'ArrowUp': apuntarInput.up = down; break;
      case 'ArrowDown': apuntarInput.down = down; break;
      case 'KeyW': apuntarInput.up = down; break;
      case 'KeyS': apuntarInput.down = down; break;
      case 'KeyA': apuntarInput.left = down; break;
      case 'KeyD': apuntarInput.right = down; break;
    }
  }
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!e.repeat) setKey(e.code, true);
    setApuntar(e.code, true);
    if (e.code === 'Escape' && !bitaPanel.classList.contains('hidden')) cerrarBitacora();
  };
  const onKeyUp = (e: KeyboardEvent): void => { setKey(e.code, false); setApuntar(e.code, false); };
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
      // Acciones de tipo "trigger": se arman en rising-edge (press=true).
      // El release (down=false) NO las limpia — el update loop las consume
      // y resetea. Esto permite que el harness invoque press(true) +
      // press(false) en el mismo microtask sin perder el evento.
      case 'act': if (down) actEdge = true; break;
      case 'pred-sube': if (down) predSubeEdge = true; break;
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
      losa.setEnabled(true);
      losa.position.set(avatar.x, avatar.y + 1.2, 0);
      losaSombra.position.set(avatar.x, Y_E3 + 0.05, 0);
      losaSombra.isVisible = true;
      toast('Recogiste la losa. Cubrila sobre la corriente ascendente.');
      return;
    }

    /* Escena 3: colocar la losa — el offset horizontal respecto al centro del
        chorro (instrumentoX) determina upCover. Múltiples posiciones válidas
        producen descensoPredecible, así que hay ≥2 soluciones. */
    if (losaRecogida && avatar.y < losaY + 0.8) {
      losaRecogida = false;
      losaEnPosicion = true;
      losa.setEnabled(true);
      losa.position.set(avatar.x, losaY, 0);
      losaSombra.isVisible = false;
      instrumento.speak('escena3_desequilibrio');
      toast('Cubriste la corriente ascendente. El equilibrio se rompe.');
      return;
    }

    /* Escena 4: anclar plataforma — la pulsación de E realmente cambia el marco
        analítico (`sistemaReferencia.anclajeIdx`). El mundo distante se desplaza
        en sentido opuesto a la plataforma anclada en pantalla. */
    if (avatar.x >= W_E4_INICIO && avatar.x < W_E4_FIN && sistemaReferencia.anclajeIdx < 0) {
      const idx = plataformasDrift.findIndex((pd) => {
        const x = posicionPlataformaModelo(pd.modelo, simT);
        return Math.abs(avatar.x - x) < 3 && Math.abs(avatar.y - pd.base.top) < 0.8;
      });
      if (idx >= 0) {
        sistemaReferencia.anclajeIdx = idx;
        referenciaAnclada = true;
        save.flags = { ...save.flags, referenciaAnclada: true };
        guardarSave(save);
        bitaBtn.classList.remove('hidden');
        instrumento.speak('escena4_referencia');
        toast('Anclaste la plataforma. El mundo se detuvo a tu alrededor.');
      }
    }

    /* Escena 5: tomar saquito — el lanzamiento usa el vector compuesto por el
        jugador (vxApuntada, vyApuntada) y la corriente analítica transversal.
        La trayectoria analítica `alcanceConCorriente` determina dónde aterriza;
        ≥2 valores (vyApuntada, vxApuntada) producen un acierto. */
    if (!vectorComun && avatar.x >= W_E5_INICIO && avatar.x < W_E5_FIN && Math.abs(avatar.y - 4.5) < 1.5) {
      for (const s of saquitos) {
        if (!s.inFlight && Math.hypot(avatar.x - s.x, avatar.y - s.y) < 1.5) {
          const lanzamiento: Vector2D = { x: vxApuntada, y: vyApuntada };
          /* Tiempo de vuelo analítico bajo gravedad (modelo `tiroParabolico`). */
          const a = -G;
          const disc = vyApuntada * vyApuntada - 4 * (a / 2) * s.y;
          s.tVuelo = disc > 0 ? (-vyApuntada - Math.sqrt(disc)) / (2 * (a / 2)) : 1;
          if (s.tVuelo <= 0) s.tVuelo = 1;
          s.inFlight = true;
          s.vx = lanzamiento.x;
          s.vy = lanzamiento.y;
          /* ¿El lanzamiento apuntado alcanza el receptor? */
          const alcanzable = objetivoAlcanzable(
            lanzamiento, corrienteVector,
            receptor5X - s.x, s.tVuelo,
          );
          if (!alcanzable) {
            instrumento.speak('escena5_error');
            toast('Más intensidad… mismo error lateral.');
          }
          break;
        }
      }
    }

    /* Escena 6: construir rampa — la pulsación de E crea el plano a partir del
        ángulo actual elegido por el jugador. La losa rota y los apoyos se
        ajustan a su extremo. */
    if (!planoInclinadoOk && !planoConstruido && avatar.x >= W_E6_INICIO && avatar.x < W_E6_FIN &&
        Math.abs(avatar.x - rampaX) < 4 && avatar.y < rampaAlturaBase + 1) {
      planoConstruido = crearPlanoModelo(rocaAltaY - rampaAlturaBase, anguloRampa);
      const theta = (anguloRampa * Math.PI) / 180;
      losaRampa.rotation.z = theta;
      apoyo1.position.set(rampaX - planoConstruido.length / 2, rampaAlturaBase + 0.5, 0);
      apoyo2.position.set(rampaX + planoConstruido.length / 2, rampaAlturaBase + 0.5, 0);
      instrumento.speak('escena6_angulo');
      toast(`Rampa a ${anguloRampa.toFixed(1)}°. Menor fuerza, mayor recorrido.`);
    }

    /* Escena 6: empujar roca — la intención se resuelve en update(); la acción
        sólo verifica que el jugador esté cerca de la rampa construida. */
    if (planoConstruido && !roca6Movida && Math.abs(avatar.x - roca6X) < 1.2 && Math.abs(avatar.y - roca6Y) < 1.5) {
      // el empuje se resuelve en update(), solo marcamos intención
    }

    /* Escena 7 — síntesis de los tres modelos previos:
       - Anillo 0 (equilibrio): colocar la losaEstacion sobre el contrapeso.
           Se valida con `enEquilibrio` para la pareja de fuerzas del contrapeso.
       - Anillo 1 (referencia): pulsar E cerca del anillo medio para anclar la
           estación a la plataforma de la Escena 4. Se valida con `posicionRelativa`.
       - Anillo 2 (vector): lanzar el saquito al canal. Se valida con
           `objetivoAlcanzable` usando el control de apuntado del jugador.
       Los tres anillos iluminan el material; la estación se estabiliza al
       completar los tres. */

    /* Escena 7 anillo 0/1 — la integración se hace en update(dt) para tener
       acceso al paso de tiempo. Aquí sólo manejamos la visibilidad de la
       losa cuando el jugador se acerca al contrapeso. */
    if (planoInclinadoOk && !losaEstacion.isVisible &&
        avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN &&
        Math.abs(avatar.x - (estacionX + 5)) < 2 && avatar.y < estacionY + 2) {
      losaEstacion.isVisible = true;
      losaEstacion.position.set(estacionX + 5, estacionY + 0.6, 0);
    }

    if (planoInclinadoOk && !anillo2Activo && avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN &&
        !saquitoEstacion.inFlight && Math.abs(avatar.x - saquitoEstacion.x) < 1.5) {
      const lanzamiento: Vector2D = { x: vxApuntada, y: vyApuntada };
      const a = -G;
      const disc = vyApuntada * vyApuntada - 4 * (a / 2) * saquitoEstacion.y;
      saquitoEstacion.tVuelo = disc > 0 ? (-vyApuntada - Math.sqrt(disc)) / (2 * (a / 2)) : 1;
      if (saquitoEstacion.tVuelo <= 0) saquitoEstacion.tVuelo = 1;
      saquitoEstacion.inFlight = true;
      saquitoEstacion.vx = lanzamiento.x;
      saquitoEstacion.vy = lanzamiento.y;
    }

    if (anillo0Activo && anillo1Activo && anillo2Activo && !estacionEstabilizada) {
      estacionEstabilizada = true;
      save.flags = { ...save.flags, estacionEstabilizada: true };
      guardarSave(save);
      bitaBtn.classList.remove('hidden');
      rocaFlotanteGeo.isVisible = true;
      setTimeout(() => instrumento.speak('escena7_consecuencia'), 2500);
      toast('La estación se estabilizó. Pero algo más cambió...');
      metroUI.classList.remove('hidden');
    }

    /* Escena 8: revelar metrópolis (M0.5.1: requiere velocidad real).
       El umbral espacial se mantiene, pero se exige que el avatar tenga
       velocidad horizontal no nula — descartar un teleport estático o
       un spawn. La consecuencia se ancla al estado de la estación
       (Escena 7), no a un toggle aislado. */
    if (avatar.x >= W_E8_INICIO && !metropolisRevelada &&
        estacionEstabilizada && Math.abs(avatar.vx) > 0.3) {
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
    for (let i = 0; i < plataformasDrift.length; i++) {
      const pd = plataformasDrift[i];
      /* Modelo analítico: la posición la dicta `posicionPlataforma`. */
      const x = posicionPlataformaModelo(pd.modelo, simT);
      pd.mesh.position.x = x;
      pd.base.x0 = x - 2;
      pd.base.x1 = x + 2;
    }

    /* Receptáculo comparte el movimiento de la plataforma receptora (modelo). */
    receptor.position.x = posicionPlataformaModelo(sistemaReferencia.plataformas[RECEPTOR_PLATAFORMA_IDX], simT);

    /* Marcador de anclaje: anillo dorado en la plataforma anclada. */
    if (sistemaReferencia.anclajeIdx >= 0) {
      const x = posicionPlataformaModelo(
        sistemaReferencia.plataformas[sistemaReferencia.anclajeIdx],
        simT,
      );
      anilloAnclaje.position.set(x, driftY + 0.2, 0);
      anilloAnclaje.isVisible = true;
      const pulso = 1 + Math.sin(simT * 3) * 0.06;
      anilloAnclaje.scaling.setAll(pulso);
    } else {
      anilloAnclaje.isVisible = false;
    }

    /* Silueta distante: cuando hay anclaje, se desplaza en pantalla al
        `velocidadMarcoAnclado`. El modelo dice que la separación entre
        plataformas es constante; lo que el jugador ve moverse es el mundo. */
    const vMarco = velocidadMarcoAnclado(sistemaReferencia, simT);
    mundoDistante.position.x = mundoDistanteX0 + vMarco * simT;
  }

  /* ==================== saquitos ==================== */

  function actualizarSaquitos(dt: number): void {
    for (const s of saquitos) {
      if (!s.inFlight) continue;
      s.vy -= G * dt;
      /* Corriente transversal aplicada analíticamente con el mismo factor que
          el modelo puro (velocidad constante en x). */
      if (s.x > W_E5_INICIO && s.x < W_E5_FIN) {
        s.vx += corrienteVector.x * dt;
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

  /** Ajusta el vector apuntado del jugador según las teclas ↑/↓/←/→
      mantenidas. Se llama desde update() con el dt real. */
  function ajustarApuntado(dt: number): void {
    if (vectorComun) return;
    if (apuntarInput.up) vyApuntada = Math.min(VY_MAX, vyApuntada + 6 * dt);
    if (apuntarInput.down) vyApuntada = Math.max(VY_MIN, vyApuntada - 6 * dt);
    if (apuntarInput.right) vxApuntada = Math.min(VX_MAX, vxApuntada + 4 * dt);
    if (apuntarInput.left) vxApuntada = Math.max(VX_MIN, vxApuntada - 4 * dt);
  }

  /** Actualiza el preview del lanzamiento (línea analítica con corriente
      transversal) y la aguja del reloj. */
  function actualizarPreviewVector(): void {
    if (vectorComun || !(avatar.x >= W_E5_INICIO && avatar.x < W_E5_FIN)) {
      previewTrayectoria.isVisible = false;
      return;
    }
    const lanzamiento: Vector2D = { x: vxApuntada, y: vyApuntada };
    const a = -G;
    const disc = lanzamiento.y * lanzamiento.y - 4 * (a / 2) * 4.5;
    const tVuelo = disc > 0 ? (-lanzamiento.y - Math.sqrt(disc)) / (2 * (a / 2)) : 1;
    const tFinal = Math.max(0.5, tVuelo);

    /* Predicción del impacto con la corriente (modelo puro). */
    const impacto = alcanceConCorriente(lanzamiento, corrienteVector, tFinal);
    /* Muestreo de la trayectoria compensada para la línea-preview. */
    const puntos: BABYLON.Vector3[] = [];
    const x0 = avatar.x + avatar.facing * 0.75;
    const y0 = avatar.y + 0.35;
    const N = 16;
    for (let i = 0; i <= N; i++) {
      const tFrac = i / N;
      const t = tFrac * tFinal;
      const xCompensado = lanzamiento.x * t + compensacionCorriente(corrienteVector, t);
      const y = y0 + lanzamiento.y * t - 0.5 * G * t * t;
      if (y < 4.5) {
        puntos.push(new BABYLON.Vector3(x0 + xCompensado, 4.5, 0.03));
        break;
      }
      puntos.push(new BABYLON.Vector3(x0 + xCompensado, y, 0.03));
    }
    BABYLON.MeshBuilder.CreateDashedLines('p', {
      points: puntos, dashSize: 0.16, gapSize: 0.12, instance: previewTrayectoria,
    }, scene);
    previewTrayectoria.isVisible = puntos.length >= 2;
    void impacto;
  }

  /* ==================== roca rampa ==================== */

  function actualizarRoca6(dt: number): void {
    if (roca6Movida || !planoConstruido) return;
    if (Math.abs(avatar.x - roca6X) < 1.2 && Math.abs(avatar.y - roca6Y) < 1.5) {
      const dir = input.left ? -1 : input.right ? 1 : 0;
      if (dir !== 0) {
        /* La velocidad de la roca a lo largo de la rampa es proporcional a
            (fuerza del jugador − fuerzaTangencial). El modelo puro
            `fuerzaTangencial = m·g·sin(θ)` es lo que hay que VENCER para que
            la roca suba; cualquier ángulo válido la hace más fácil de empujar. */
        const theta = (anguloRampa * Math.PI) / 180;
        const masaRelativa = 1;
        const empujeJugador = 6 * masaRelativa; // N
        const fTangencial = fuerzaTangencial(planoConstruido) / (FUERZA_LEVANTAR / empujeJugador);
        const aRampa = (empujeJugador - fTangencial) / masaRelativa;
        if (aRampa > 0) {
          const dx = dir * aRampa * dt;
          const dy = dx * Math.sin(theta);
          roca6X += dx;
          roca6Y += dy;
          rocaGrande6Geo.position.set(roca6X, roca6Y, 0);
        }
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
      if (losaRecogida) {
        msg += `E · soltar la losa (cobertura actual: ${Math.round(upCoverObjetivo * 100)}%)`;
      } else if (!losaEnPosicion) {
        msg += 'E · recoger la losa';
      } else {
        msg += `Corriente cubierta al ${Math.round((1 - upCoverObjetivo) * 100)}% — el instrumento baja`;
      }
    }
    if (!referenciaAnclada && avatar.x >= W_E4_INICIO && avatar.x < W_E4_FIN) {
      msg = sistemaReferencia.anclajeIdx >= 0
        ? 'Plataforma anclada — el mundo se mueve alrededor tuyo'
        : 'Acercate a una plataforma y usá E para anclar referencia';
    }
    if (!vectorComun && avatar.x >= W_E5_INICIO && avatar.x < W_E5_FIN) {
      msg = `↑/↓ ajustar ángulo · ←/→ ajustar fuerza · E lanzar (vx=${vxApuntada.toFixed(1)}, vy=${vyApuntada.toFixed(1)})`;
    }
    if (!planoInclinadoOk && avatar.x >= W_E6_INICIO && avatar.x < W_E6_FIN) {
      msg = planoConstruido
        ? 'Empujá la roca por la rampa con ←/→'
        : `↑/↓ ajustar ángulo (${anguloRampa.toFixed(0)}°) · E construir rampa`;
    }
    if (estacionEstabilizada && !metropolisRevelada && avatar.x >= W_E8_INICIO) {
      msg = 'Seguí hacia la cima para ver la metrópolis';
    }
    if (planoInclinadoOk && !estacionEstabilizada && avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN) {
      const anillosActivos = [anillo0Activo, anillo1Activo, anillo2Activo].filter(Boolean).length;
      msg = `Estación: ${anillosActivos}/3 anillos — `
        + (!anillo0Activo ? 'colocá la losa sobre el contrapeso'
          : !anillo1Activo ? 'anclá la plataforma de Escena 4 y tocá el anillo medio'
          : !anillo2Activo ? 'lanzá el saquito al canal con ↑/↓/←/→ + E'
          : 'estabilizando…');
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
        // La observación de la cascada se completa cuando la piedra aterriza:
        // el jugador vio el agua subir y la piedra caer — los dos fenómenos.
        // TODO(guion): disparar la entrada de bitácora con texto canónico
        // cuando exista guion para "observación de la cascada".
        if (!observada) {
          observada = true;
          save.flags = { ...save.flags, cascadaObservada: true };
          guardarSave(save);
          bitaBtn.classList.remove('hidden');
        }
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

    /* presentación viva de la cascada, lago, atmósfera y parallax */
    cascadeScene.update(simT, dt, motionScale);

    /* Escena 3: la losa sostenida sigue al avatar y proyecta su sombra sobre la
        corriente para que el jugador vea el efecto antes de soltarla. */
    if (losaRecogida) {
      losa.position.set(avatar.x, avatar.y + 1.2, 0);
      losaSombra.position.set(avatar.x, Y_E3 + 0.05, 0);
      const previewOffset = Math.abs(avatar.x - instrumentoX);
      upCoverObjetivo = previewOffset < 0.5
        ? 0.3
        : previewOffset > 2.5
          ? 0.95
          : 0.3 + (previewOffset - 0.5) * (0.65 / 2);
    }

    /* Escena 3: equilibrio — la integración analítica cerrada `a = upAcc·upCover − downAcc`
        determina el descenso del INSTRUMENTO a partir de la posición real de la losa. */
    if (!equilibrioResuelto) {
      if (losaEnPosicion) {
        /* Cobertura de la corriente ascendente según el offset de la losa.
           Offset < 0.5  → ~70 % cubierta (upCover = 0.30)
           Offset > 2.5  → ~5 %  cubierta (upCover = 0.95)
           Lineal entre ambos. Cualquier upCover < 1 → descensoPredecible. */
        const offset = Math.abs(losa.position.x - instrumentoX);
        upCover = offset < 0.5 ? 0.3 : offset > 2.5 ? 0.95 : 0.3 + (offset - 0.5) * (0.65 / 2);
      } else {
        upCover = 1;
      }
      upCoverObjetivo = upCover;
      flechaUpGeo.scaling.y = Math.max(0, upCover) * 0.8;
      flechaDownGeo.scaling.y = 0.8;

      /* Integración cerrada del modelo puro (aceleración escalada a unidades
          de juego: la fórmula `a = upAcc·upCover − downAcc` se conserva). */
      const fJuego: FuerzasOpuestas = {
        upAcc: FUERZA_UP * EQUILIBRIO_GAME_SCALE,
        downAcc: FUERZA_DOWN * EQUILIBRIO_GAME_SCALE,
        upCover,
      };
      instrumentoEstado = integrarInstrumento(instrumentoEstado, fJuego, dt);

      instrumento.y = Math.max(Y_E3 + 1, Math.min(instrumentoYBase + 6, instrumentoEstado.y));
      instrumento.mesh.position.set(instrumento.x, instrumento.y, 0);

      /* La condición de resolución combina el modelo (`descensoPredecible`) con
          la posición realmente alcanzada por el INSTRUMENTO. ≥2 colocaciones de
          la losa producen esta misma condición. */
      const fVerificacion: FuerzasOpuestas = { upAcc: FUERZA_UP, downAcc: FUERZA_DOWN, upCover };
      const descendiendo = descensoPredecible(fVerificacion) && desplazamientoDesdeCentro(instrumentoEstado, instrumentoYBase) < -0.4;
      if (losaEnPosicion && descendiendo) {
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
    ajustarApuntado(dt);
    actualizarPreviewVector();
    actualizarSaquitos(dt);

    /* Escena 7: saquito-vectorial de la estación (modelo vector.ts). */
    if (saquitoEstacion.inFlight) {
      saquitoEstacion.vy -= G * dt;
      saquitoEstacion.vx += CORRIENTE_EST_X * dt;
      saquitoEstacion.x += saquitoEstacion.vx * dt;
      saquitoEstacion.y += saquitoEstacion.vy * dt;
      saquitoEstacion.mesh.position.set(saquitoEstacion.x, saquitoEstacion.y, 0.05);
      if (saquitoEstacion.y <= CANAL_Y && Math.abs(saquitoEstacion.x - CANAL_X) < 1.0) {
        saquitoEstacion.inFlight = false;
        anillo2Activo = true;
        anillos[2].material = anilloMat;
        instrumento.speak('escena5_acierto');
        toast('Anillo interior: el saquito alcanzó el canal.');
      } else if (saquitoEstacion.y < -2) {
        saquitoEstacion.inFlight = false;
        saquitoEstacion.vx = 0; saquitoEstacion.vy = 0;
        saquitoEstacion.x = estacionX - 6; saquitoEstacion.y = estacionY + 2;
        saquitoEstacion.mesh.position.set(saquitoEstacion.x, saquitoEstacion.y, 0.05);
      }
    }

    /* Escena 7 anillo 0 — equilibrio del contrapeso con física real.
       La cobertura del chorro se deriva del offset horizontal de la losa
       sobre el contrapeso; el estado del contrapeso se integra con
       `integrarInstrumento` cada frame. El anillo se activa cuando el
       modelo predice descenso Y la posición recorrida supera -0.3. */
    if (planoInclinadoOk && !anillo0Activo && losaEstacion.isVisible &&
        avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN) {
      const offsetEst = Math.abs(losaEstacion.position.x - (estacionX + 5));
      contrapesoUpCover = Math.max(0.15, Math.min(1, 0.95 - offsetEst * 0.35));
      const fEst: FuerzasOpuestas = {
        upAcc: 9.8, downAcc: 9.8, upCover: contrapesoUpCover,
      };
      contrapesoEstado = integrarInstrumento(contrapesoEstado, fEst, dt);
      contraPesoGeo.position.y = Math.max(estacionY, contrapesoEstado.y);
      const descendiendoEst = descensoPredecible(fEst) &&
        desplazamientoDesdeCentro(contrapesoEstado, contrapesoYBase) < -0.3;
      if (descendiendoEst) {
        anillo0Activo = true;
        anillos[0].material = anilloMat;
        instrumento.speak('escena7_reconoce');
        toast('Anillo exterior: el contrapeso desciende. La estación se equilibra.');
      }
    }

    /* Escena 7 anillo 1 — referencia con física real (modelo puro).
       La estación debe COINCIDIR con la plataforma anclada durante
       ≥1.5s. La coincidencia se mide con `posicionPlataformaModelo`
       (modelo de referenciaMovil.ts). */
    if (planoInclinadoOk && !anillo1Activo && sistemaReferencia.anclajeIdx >= 0 &&
        avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN) {
      const xPlataforma = posicionPlataformaModelo(
        sistemaReferencia.plataformas[sistemaReferencia.anclajeIdx], simT,
      );
      const dentroDelCorredor = Math.abs(estacionX - xPlataforma) < 0.8;
      if (dentroDelCorredor) {
        anillo1TiempoEnMarco += dt;
        if (anillo1TiempoEnMarco >= ANILLO1_TIEMPO_REQUERIDO) {
          anillo1Activo = true;
          anillos[1].material = anilloMat;
          toast('Anillo medio: la estación adoptó la referencia de la plataforma.');
        }
      } else {
        anillo1TiempoEnMarco = 0;
      }
    }

    /* Escena 6: ajustar ángulo de la rampa con ↑/↓ (sólo antes de construir). */
    if (!planoConstruido && avatar.x >= W_E6_INICIO && avatar.x < W_E6_FIN) {
      if (apuntarInput.up) anguloRampa = Math.min(ANGULO_MAX, anguloRampa + 30 * dt);
      if (apuntarInput.down) anguloRampa = Math.max(ANGULO_MIN, anguloRampa - 30 * dt);
    }
    refrescarRampaHud();

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
        /* Visualización diegética: la aguja del reloj apunta a la posición
            RELATIVA de la plataforma vecina más cercana respecto al anclaje.
            Cuando el marco está anclado, esa posición relativa se mantiene
            constante aunque el mundo se mueva. */
        if (sistemaReferencia.anclajeIdx >= 0) {
          const otroIdx = sistemaReferencia.anclajeIdx === 0 ? 1 : 0;
          const xMundo = posicionPlataformaModelo(sistemaReferencia.plataformas[otroIdx], simT);
          const xRel = posicionRelativa(sistemaReferencia, xMundo, simT);
          reloj.visualizarVector(xRel - 5, 0);
        } else {
          reloj.visualizarVector(0, 0);
        }
      } else {
        reloj.esconder();
      }
      reloj.update(0.016);
    } else {
      reloj.esconder();
    }

    /* Metropolis animada — flicker sutil en los faros. M0.7.4 eliminó
       los 3D edificios/trenes (causaban rectángulos blancos fantasma por
       niebla). Sólo quedan los 5 PointLights — les doy un parpadeo
       cálido asíncrono para que la ciudad no se sienta "muerta". */
    if (metropolisRevelada) {
      metropoGroup.setEnabled(true);
      midBackdrop.setEnabled(false);
      farBackdrop.setEnabled(false);
      for (let i = 0; i < faros.length; i++) {
        faros[i].intensity = 0.45 + 0.15 * Math.sin(simT * (1.7 + i * 0.4) + i * 1.3);
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
    /* M0.7.5 — rim light sigue al avatar. El local offset (0, 3, -3) es
       "arriba y detrás" en coordenadas del avatar, así que cuando el
       avatar se mueve, la luz lo acompanha. */
    avatarRim.parent = avatarGroup;
    avatarRim.position.set(0, 3, -3);

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
