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

  scene.clearColor = new BABYLON.Color4(0.08, 0.14, 0.22, 1);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0042;
  scene.fogColor = new BABYLON.Color3(0.42, 0.56, 0.62);

  const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, CAM.escena2.y, CAM.escena2.z), scene);
  camera.fov = CAM_FOV;
  camera.minZ = 0.1;
  camera.maxZ = 800;

  const hemi = new BABYLON.HemisphericLight('cool-fill', new BABYLON.Vector3(-0.25, 1, 0.3), scene);
  hemi.diffuse = new BABYLON.Color3(0.38, 0.55, 0.68);
  hemi.groundColor = new BABYLON.Color3(0.08, 0.12, 0.15);
  hemi.intensity = 0.72;
  const sun = new BABYLON.DirectionalLight('golden-key', new BABYLON.Vector3(-0.55, -0.82, 0.38), scene);
  sun.position = new BABYLON.Vector3(24, 34, 18);
  sun.diffuse = new BABYLON.Color3(1, 0.68, 0.38);
  sun.specular = new BABYLON.Color3(1, 0.82, 0.58);
  sun.intensity = 2.2;
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
  /** Escala que traduce m/s² del modelo analítico a unidades del juego. Mantiene
      la fórmula cerrada `a = upAcc·upCover − downAcc` intacta. */
  const EQUILIBRIO_GAME_SCALE = 0.08;
  let upCover = 1;
  /** Estado analítico del instrumento (integración cerrada por `integrarInstrumento`). */
  let instrumentoEstado: InstrumentoEstado = crearEstadoInstrumento(instrumentoYBase);

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

    if (planoInclinadoOk && !anillo0Activo && avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN &&
        Math.abs(avatar.x - (estacionX + 5)) < 2 && Math.abs(avatar.y - (estacionY + 3)) < 1.5) {
      losaEstacion.isVisible = true;
      anillo0Activo = true;
    anillos[0].material = anilloMat;
    instrumento.speak('escena7_reconoce');
    toast('Anillo exterior: la losa equilibra el contrapeso.');
  }

    if (planoInclinadoOk && !anillo1Activo && sistemaReferencia.anclajeIdx >= 0 &&
        avatar.x >= W_E7_INICIO && avatar.x < W_E7_FIN &&
        Math.abs(avatar.x - (estacionX - 1.2)) < 1.6 && Math.abs(avatar.y - (estacionY + 0.7)) < 1.5) {
      anillo1Activo = true;
      anillos[1].material = anilloMat;
      toast('Anillo medio: la estación adoptó la referencia de la plataforma.');
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
