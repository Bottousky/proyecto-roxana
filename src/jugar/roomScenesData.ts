/**
 * Capa de puesta en escena para los fondos pintados del Arco I.
 *
 * Las coordenadas son LOCALES a cada room: `[0, width) × [0, height)`.
 * El viewport del juego es 960×540; eso NO es el tamaño de la sala.
 * Una room declara `width`/`height` (Plaza ya es 1920×1080). Si faltan,
 * el fallback es un viewport, no un techo de diseño. `walkable` es la
 * union de piso; `collision` agrega maquinaria y piezas dentro de ese piso.
 *
 * Este archivo NO importa assets (`?url`): eso vive en roomScenes.ts, que
 * reexporta todo lo de acá. Así los tests de Node pueden importar esta data
 * sin pasar por el resolver de assets de Vite.
 */

export interface SceneRect { x: number; y: number; w: number; h: number }
export interface PerspectiveScale { far: number; near: number; farY: number; nearY: number }
export type SceneEffect =
  | { kind: 'mist' | 'embers' | 'water' | 'dust'; flag?: string; x: number; y: number; w: number; h: number; color?: number }
  | { kind: 'glow' | 'pulse' | 'beam'; flag?: string; x: number; y: number; radius: number; color: number }
  | { kind: 'sprite'; flag?: string; x: number; y: number; w: number; h: number; texture: string };

export interface RoomSceneProfile {
  /**
   * Sala cerrada con fondo pintado: clave de textura que cubre el
   * rect LOCAL `(0,0,width,height)`, no el viewport. Desactiva el
   * pase procedural; las puertas son transición de grafo. **Opcional**
   * desde H3: un área sin `background` se renderiza con `drawRoomBase`
   * + `renderDecor`. El runtime distingue ambos casos inspeccionando
   * `def.background` y este campo juntos.
   */
  background?: string;
  backgroundWhen?: { flag: string; key: string }[];
  walkable: SceneRect[];
  collision?: SceneRect[];
  perspective?: PerspectiveScale;
  doors?: Record<string, SceneRect>;
  entries?: Record<string, { x: number; y: number }>;
  things?: Record<string, { x: number; y: number; baked?: boolean }>;
  bakedThings?: string[];
  /** host visual real -> thing cuya interacción se reutiliza (el thing fuente no se monta). */
  interactionAliases?: Record<string, string>;
  /** Texto diegético del host real; evita exponer el antiguo “banco” técnico al jugador. */
  interactionPrompts?: Record<string, string>;
  /** datos narrativos retirados del runtime porque no tienen correlato visual o función. */
  hiddenThings?: string[];
  effects?: SceneEffect[];
  /**
   * Dimensiones lógicas del área en píxeles de diseño. Si están ausentes
   * (estado heredado / pre-migración multi-área), el runtime asume
   * `DEFAULT_AREA_WIDTH × DEFAULT_AREA_HEIGHT`. El viewport lógico del
   * juego (Phaser `W × H`) sigue siendo 960×540 con independencia de
   * este valor: una área puede medir varios viewports.
   *
   * `width` y `height` se introdujeron en el commit 1 de la iteración H2
   * del refactor multi-área (ver `ADR-001`). Su uso en runtime es
   * opcional: las 20 rooms existentes siguen funcionando sin cambios.
   */
  width?: number;
  height?: number;
}

/**
 * Tamaño por defecto de un área cuando `RoomSceneProfile.width` /
   `height` están ausentes. Mantiene la conducta heredada
   (1 viewport = 1 área) para no romper rooms preexistentes.
 */
export const DEFAULT_AREA_WIDTH = 960;
export const DEFAULT_AREA_HEIGHT = 540;

/**
 * Dimensiones lógicas de un área, con defaults heredados. Útil para que
 * el runtime consulte el tamaño del chunk sin tener que manejar el caso
 * "no declarado" en cada punto. Devuelve siempre números positivos.
 */
export function areaDimensions(roomId: string): { width: number; height: number } {
  const scene = ROOM_SCENES[roomId];
  const w = scene?.width;
  const h = scene?.height;
  return {
    width: typeof w === 'number' && w > 0 ? w : DEFAULT_AREA_WIDTH,
    height: typeof h === 'number' && h > 0 ? h : DEFAULT_AREA_HEIGHT,
  };
}

/**
 * ¿Un punto en coordenadas locales cae dentro del bounding box del
 * área? Útil como validador al construir escenas, mover NPCs, o
 * decidir si un punto de entrada está dentro de los límites esperados.
 * No reemplaza `collides()` (que evalúa walkable + sólidos), sólo el
 * bounding box exterior.
 */
export function isPointInsideArea(
  roomId: string,
  localX: number,
  localY: number,
): boolean {
  const { width, height } = areaDimensions(roomId);
  return localX >= 0 && localX < width && localY >= 0 && localY < height;
}

const interior = { far: 0.82, near: 1, farY: 120, nearY: 470 };
const distant = { far: 0.48, near: 0.7, farY: 90, nearY: 500 };
const medium = { far: 0.64, near: 0.86, farY: 100, nearY: 490 };
const fixedRpg = { far: 1, near: 1, farY: 0, nearY: 540 };

export const ROOM_SCENES: Record<string, RoomSceneProfile> = {
  plaza: {
    // H3 agrandó la Plaza a 1920×1080 y retiró el fondo 960×540.
    // Pintura 1920×1080: patio cerrado. Walkable = piso interior,
    // no los merlones. Campana/pedestal/portal son props de runtime.
    width: 1920,
    height: 1080,
    background: 'room-plaza',
    perspective: medium,
    walkable: [
      // Eje N-S: gap del arco norte (Puerta) y del sur (Terrazas).
      { x: 880, y: 0, w: 160, h: 1080 },
      // Banda E-O: Castillo/Forja al oeste, Taller al este.
      { x: 0, y: 460, w: 1920, h: 160 },
      // Cuatro plazas interiores. Solapan la cruz ≥24 px para que el
      // cuerpo del jugador (caja ~24) pueda pasar de una a otra.
      { x: 96, y: 96, w: 744, h: 380 },    // NW
      { x: 1080, y: 96, w: 500, h: 380 },  // NE (antes del taller)
      { x: 96, y: 596, w: 744, h: 388 },    // SW
      { x: 1080, y: 596, w: 720, h: 388 },  // SE
    ],
    collision: [
      // Arte v4: muro este (alcoves / Taller). La banda E-O (y=460–620)
      // queda abierta para la door del Taller (m11).
      { x: 1680, y: 70, w: 240, h: 390 },
      { x: 1680, y: 620, w: 240, h: 380 },
      // Muro oeste + estanque; deja los vanos Castillo/Forja.
      { x: 0, y: 70, w: 160, h: 390 },
      { x: 0, y: 620, w: 160, h: 380 },
      // Monumento pintado: masa central, pero deja 40 px a cada lado
      // del eje N-S (880–1040) para que el flood de rg2 cruce.
      { x: 920, y: 450, w: 80, h: 110 },
      // Campana (prop de runtime). Corona en (960,220); cuerda en
      // (960,400) libre; hueco al arco norte en (960,90).
      { x: 924, y: 180, w: 72, h: 188 },
      { x: 890, y: 246, w: 27, h: 118 },
      { x: 1043, y: 246, w: 27, h: 118 },
    ],
    doors: {
      // Arco norte: hacia la Puerta de Ohm.
      puerta: { x: 880, y: 0, w: 160, h: 60 },
      // Arco este: hacia el Taller de Lumen.
      taller: { x: 1820, y: 500, w: 100, h: 80 },
      // Arco oeste: hacia el Castillo (alto) y la Forja (bajo).
      castle_gate: { x: 0, y: 460, w: 60, h: 80 },
      forge_yard: { x: 0, y: 540, w: 60, h: 80 },
      // Arco sur: hacia las Terrazas.
      terraces_top: { x: 880, y: 1020, w: 160, h: 60 },
    },
    entries: {
      // Portal-aula (cosa thing, no door): se reubica en el SW
      // de la plaza, accesible desde la plaza SW.
      aula: { x: 220, y: 760 },
      taller: { x: 1820, y: 540 },
      puerta: { x: 960, y: 80 },
      castle_gate: { x: 60, y: 500 },
      forge_yard: { x: 60, y: 580 },
      terraces_top: { x: 960, y: 1000 },
    },
    bakedThings: ['lampara1', 'lampara2', 'lampara3', 'lampara4'],
    effects: [
      // Glow central en el pedestal de Ohm: marca el landmark
      // principal de la Plaza.
      { kind: 'pulse', x: 960, y: 640, radius: 120, color: 0x55d9d0 },
      // Glow del portal al aula, ahora en el SW.
      { kind: 'pulse', flag: 'ohmAwake', x: 220, y: 760, radius: 100, color: 0x55d9d0 },
      // Cuando la Puerta se abre, glows de luz cálida
      // distribuidos por los puntos cardinales.
      { kind: 'glow', flag: 'puertaDone', x: 320, y: 480, radius: 165, color: 0xffc96b },
      { kind: 'glow', flag: 'puertaDone', x: 1600, y: 480, radius: 165, color: 0xffc96b },
      { kind: 'glow', flag: 'puertaDone', x: 960, y: 200, radius: 165, color: 0xffc96b },
      { kind: 'glow', flag: 'puertaDone', x: 960, y: 880, radius: 165, color: 0xffc96b },
      // Cuando la plaza se enciende por completo: glows en los
      // cuatro monolitos de las esquinas.
      { kind: 'glow', flag: 'finished', x: 250, y: 230, radius: 90, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 1670, y: 230, radius: 90, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 250, y: 830, radius: 90, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 1670, y: 830, radius: 90, color: 0xffc96b },
      { kind: 'pulse', flag: 'finished', x: 960, y: 640, radius: 220, color: 0xffd77a },
    ],
  },
  puerta: {
    background: 'room-puerta-closed',
    backgroundWhen: [{ flag: 'puertaDone', key: 'room-puerta-open' }],
    perspective: medium,
    walkable: [{ x: 70, y: 150, w: 820, h: 320 }, { x: 410, y: 50, w: 140, h: 160 }, { x: 410, y: 446, w: 140, h: 94 }],
    collision: [
      // Estanque circular pintado; deja paso al umbral norte y al sur.
      { x: 390, y: 290, w: 180, h: 120 },
      { x: 360, y: 250, w: 70, h: 55 },
    ],
    doors: { plaza: { x: 430, y: 486, w: 105, h: 54 }, manantial_ohm: { x: 430, y: 70, w: 105, h: 95 } },
    entries: { plaza: { x: 480, y: 460 }, manantial_ohm: { x: 480, y: 195 } },
    bakedThings: ['lapuerta'], things: { lapuerta: { x: 480, y: 125, baked: true } },
    effects: [{ kind: 'glow', flag: 'puertaDone', x: 480, y: 125, radius: 180, color: 0x68d9d0 }],
  },
  manantial_ohm: {
    background: 'room-manantial',
    perspective: distant,
    walkable: [
      { x: 220, y: 250, w: 520, h: 230 },
      { x: 360, y: 180, w: 240, h: 120 },
      { x: 400, y: 456, w: 160, h: 84 },
    ],
    collision: [{ x: 380, y: 120, w: 200, h: 140 }],
    doors: { puerta: { x: 430, y: 490, w: 100, h: 50 } },
    entries: { puerta: { x: 480, y: 400 } },
    bakedThings: ['cauce-maestro', 'hito-proporciones', 'mirador-manantial'],
    things: {
      'cauce-maestro': { x: 480, y: 210, baked: true },
      'hito-proporciones': { x: 620, y: 300, baked: true },
      'mirador-manantial': { x: 700, y: 250, baked: true },
      'edda-manantial': { x: 500, y: 385 },
      'ohm-manantial': { x: 590, y: 420 },
      'lumen-manantial': { x: 665, y: 385 },
    },
    effects: [
      { kind: 'mist', x: 360, y: 120, w: 240, h: 140, color: 0x8ccfd0 },
      { kind: 'water', flag: 'puertaDone', x: 400, y: 150, w: 160, h: 110, color: 0x68d9d0 },
    ],
  },
  taller: {
    background: 'room-taller', perspective: interior,
    walkable: [{ x: 120, y: 145, w: 720, h: 350 }, { x: 430, y: 465, w: 100, h: 75 }],
    collision: [
      { x: 105, y: 70, w: 735, h: 100 },
      { x: 140, y: 200, w: 160, h: 150 },
      { x: 400, y: 175, w: 140, h: 90 },
      { x: 640, y: 185, w: 170, h: 155 },
    ],
    doors: { plaza: { x: 430, y: 465, w: 100, h: 75 } }, entries: { plaza: { x: 480, y: 410 } },
    things: {
      banco: { x: 285, y: 280, baked: true },
      estantes: { x: 210, y: 135, baked: true },
      'estantes-derecha': { x: 785, y: 135, baked: true },
      'generador-taller': { x: 715, y: 270, baked: true },
      lumen: { x: 560, y: 250 }, 'edda-taller': { x: 540, y: 350 },
    },
    bakedThings: ['banco', 'estantes', 'estantes-derecha', 'generador-taller'],
    effects: [{ kind: 'dust', x: 130, y: 140, w: 700, h: 320, color: 0xd7b77b }],
  },
  castle_gate: {
    background: 'room-castle-gate', perspective: distant,
    walkable: [{ x: 120, y: 150, w: 720, h: 340 }, { x: 790, y: 250, w: 170, h: 170 }],
    collision: [{ x: 180, y: 95, w: 220, h: 120 }, { x: 430, y: 230, w: 100, h: 80 }, { x: 620, y: 200, w: 90, h: 70 }],
    doors: { plaza: { x: 875, y: 300, w: 85, h: 130 }, castle_gallery: { x: 225, y: 120, w: 165, h: 125 }, forge_yard: { x: 425, y: 480, w: 110, h: 60 } },
    entries: { plaza: { x: 830, y: 370 }, castle_gallery: { x: 355, y: 260 }, forge_yard: { x: 480, y: 440 } },
    bakedThings: ['puerta-castillo', 'cartel-chispa', 'cartel-caminos'],
    things: {
      'puerta-castillo': { x: 305, y: 175, baked: true },
      'cartel-chispa': { x: 547, y: 262, baked: true },
      'cartel-caminos': { x: 265, y: 350, baked: true },
    },
    hiddenThings: ['cartel-chispa', 'cartel-caminos', 'atril-consejo'],
    effects: [{ kind: 'mist', x: 110, y: 80, w: 780, h: 390, color: 0x758bc4 }, { kind: 'glow', flag: 'castleRestored', x: 305, y: 180, radius: 160, color: 0xb88cff }],
  },
  castle_gallery: {
    background: 'room-castle-gallery', perspective: medium,
    walkable: [{ x: 180, y: 110, w: 600, h: 370 }, { x: 420, y: 0, w: 120, h: 540 }],
    collision: [{ x: 250, y: 160, w: 70, h: 80 }, { x: 445, y: 160, w: 70, h: 80 }, { x: 640, y: 160, w: 70, h: 80 }],
    doors: { castle_gate: { x: 425, y: 470, w: 110, h: 70 }, castle_branches: { x: 425, y: 35, w: 110, h: 75 } },
    entries: { castle_gate: { x: 480, y: 445 }, castle_branches: { x: 480, y: 135 } },
    things: {
      'lamparas-galeria': { x: 480, y: 125, baked: true }, 'pedestales-galeria': { x: 480, y: 215, baked: true },
      'consejera-galeria': { x: 680, y: 335 }, 'edda-galeria': { x: 700, y: 400 },
    }, bakedThings: ['lamparas-galeria', 'pedestales-galeria'],
    interactionAliases: { 'lamparas-galeria': 'banco-cadena' },
    interactionPrompts: { 'lamparas-galeria': 'Regular las lámparas' },
    effects: [{ kind: 'pulse', flag: 'solvedGalleryChain', x: 480, y: 120, radius: 300, color: 0xc89cff }],
  },
  castle_branches: {
    background: 'room-castle-branches', perspective: medium,
    walkable: [{ x: 140, y: 110, w: 680, h: 370 }, { x: 420, y: 0, w: 120, h: 540 }],
    collision: [{ x: 370, y: 165, w: 220, h: 165 }],
    doors: { castle_gallery: { x: 425, y: 470, w: 110, h: 70 }, castle_heart: { x: 425, y: 35, w: 110, h: 75 } },
    entries: { castle_gallery: { x: 480, y: 445 }, castle_heart: { x: 480, y: 125 } },
    things: {
      'tronco-ramales': { x: 480, y: 215, baked: true }, 'bocas-ramales': { x: 390, y: 245, baked: true },
      'fusible-mayor': { x: 585, y: 240, baked: true }, 'edda-ramales': { x: 700, y: 405 },
    }, bakedThings: ['tronco-ramales', 'bocas-ramales', 'fusible-mayor'],
    interactionAliases: { 'tronco-ramales': 'banco-ramales' },
    interactionPrompts: { 'tronco-ramales': 'Reconfigurar los ramales' },
    effects: [{ kind: 'glow', flag: 'solvedBranches', x: 480, y: 220, radius: 210, color: 0xbb83ff }],
  },
  castle_heart: {
    background: 'room-castle-heart', perspective: medium,
    walkable: [{ x: 160, y: 110, w: 640, h: 360 }, { x: 420, y: 450, w: 120, h: 90 }],
    collision: [{ x: 360, y: 280, w: 240, h: 90 }, { x: 420, y: 200, w: 120, h: 70 }],
    doors: { castle_branches: { x: 425, y: 465, w: 110, h: 75 } }, entries: { castle_branches: { x: 480, y: 430 } },
    things: {
      repartidor: { x: 480, y: 225, baked: true },
      'mosaico-corazon': { x: 480, y: 375, baked: true },
      'consejera-corazon': { x: 690, y: 330 },
      'edda-corazon': { x: 700, y: 375 },
      'field-dist-lamp-0': { x: 280, y: 120 },
      'field-dist-lamp-1': { x: 480, y: 118 },
      'field-dist-lamp-2': { x: 680, y: 120 },
      'field-dist-d0': { x: 280, y: 200 },
      'field-dist-d1': { x: 300, y: 360 },
      'field-dist-d2': { x: 680, y: 200 },
      'field-dist-push-4': { x: 280, y: 430 },
      'field-dist-push-8': { x: 340, y: 430 },
      'field-dist-push-16': { x: 400, y: 430 },
      'field-dist-fuse': { x: 480, y: 430 },
    },
    bakedThings: ['repartidor', 'mosaico-corazon', 'tronco-acta'],
    interactionAliases: { repartidor: 'banco-repartidor' },
    interactionPrompts: { repartidor: 'Ajustar los barrios del Repartidor' },
    effects: [{ kind: 'pulse', flag: 'castleRestored', x: 480, y: 220, radius: 270, color: 0xd299ff }],
  },
  forge_yard: {
    background: 'room-forge-yard', perspective: distant,
    walkable: [{ x: 110, y: 150, w: 740, h: 340 }, { x: 790, y: 300, w: 170, h: 160 }],
    collision: [{ x: 150, y: 90, w: 200, h: 130 }, { x: 420, y: 210, w: 80, h: 70 }, { x: 640, y: 180, w: 90, h: 80 }],
    doors: { plaza: { x: 875, y: 340, w: 85, h: 140 }, forge_infirmary: { x: 185, y: 120, w: 165, h: 125 }, castle_gate: { x: 700, y: 95, w: 120, h: 90 } },
    entries: { plaza: { x: 825, y: 410 }, forge_infirmary: { x: 330, y: 260 }, castle_gate: { x: 750, y: 220 } }, bakedThings: ['martillos-patio', 'canal-tibio-patio'],
    interactionAliases: { 'canal-tibio-patio': 'banco-canal-tibio' },
    interactionPrompts: { 'canal-tibio-patio': 'Regular el canal tibio' },
    things: {
      'edda-patio-forja': { x: 650, y: 420 }, 'lumen-patio-forja': { x: 560, y: 430 },
      'ohm-patio-forja': { x: 490, y: 420 },
    },
    effects: [{ kind: 'embers', flag: 'forgeRestored', x: 170, y: 155, w: 650, h: 330, color: 0xff8a43 }],
  },
  forge_infirmary: {
    background: 'room-forge-infirmary', perspective: medium,
    walkable: [{ x: 145, y: 155, w: 670, h: 350 }, { x: 80, y: 395, w: 800, h: 145 }],
    collision: [{ x: 145, y: 80, w: 670, h: 105 }],
    doors: { forge_yard: { x: 80, y: 390, w: 115, h: 150 }, forge_longchannel: { x: 765, y: 390, w: 115, h: 150 } },
    entries: { forge_yard: { x: 205, y: 430 }, forge_longchannel: { x: 755, y: 430 } }, bakedThings: ['pared-fusibles'],
    interactionAliases: { 'pared-fusibles': 'banco-enfermeria' },
    interactionPrompts: { 'pared-fusibles': 'Revisar los fusibles' },
    things: {
      'lumen-enfermeria': { x: 700, y: 330 }, 'forjadora-enfermeria': { x: 625, y: 355 },
      'edda-enfermeria': { x: 290, y: 360 }, 'ohm-enfermeria': { x: 220, y: 410 },
    },
    effects: [{ kind: 'glow', flag: 'solvedFuseInfirmary', x: 480, y: 120, radius: 300, color: 0xffa45d }],
  },
  forge_longchannel: {
    background: 'room-forge-longchannel', perspective: distant,
    walkable: [{ x: 55, y: 175, w: 850, h: 250 }, { x: 0, y: 220, w: 960, h: 130 }],
    collision: [{ x: 85, y: 70, w: 790, h: 105 }],
    doors: { forge_infirmary: { x: 0, y: 220, w: 90, h: 130 }, forge_hall: { x: 870, y: 220, w: 90, h: 130 } },
    entries: { forge_infirmary: { x: 115, y: 300 }, forge_hall: { x: 845, y: 300 } }, bakedThings: ['canal-doscientos-pasos', 'horno-lejano'],
    interactionAliases: { 'canal-doscientos-pasos': 'banco-canal-largo' },
    interactionPrompts: { 'canal-doscientos-pasos': 'Regular el Canal Largo' },
    things: {
      'forjadora-canal-largo': { x: 720, y: 370 }, 'edda-canal-largo': { x: 635, y: 380 },
      'ohm-canal-largo': { x: 555, y: 390 },
    },
    effects: [{ kind: 'embers', flag: 'solvedLongChannel', x: 90, y: 160, w: 780, h: 250, color: 0xff7a3d }],
  },
  forge_hall: {
    background: 'room-forge-hall', perspective: medium,
    walkable: [{ x: 90, y: 140, w: 780, h: 350 }, { x: 0, y: 300, w: 960, h: 150 }],
    collision: [{ x: 400, y: 210, w: 170, h: 150 }, { x: 700, y: 160, w: 140, h: 120 }, { x: 40, y: 150, w: 90, h: 140 }],
    doors: { forge_longchannel: { x: 0, y: 300, w: 100, h: 150 } },
    entries: { forge_longchannel: { x: 125, y: 375 } }, bakedThings: ['lumbre-forja', 'martillo-forja', 'fuelle-forja', 'tablero-bus'],
    things: {
      'lumbre-forja': { x: 620, y: 250, baked: true },
      'martillo-forja': { x: 460, y: 385, baked: true },
      'fuelle-forja': { x: 310, y: 250, baked: true },
      'tablero-bus': { x: 200, y: 400, baked: true },
      'consejera-nave': { x: 790, y: 390 }, 'edda-nave': { x: 660, y: 425 },
      'lumen-nave': { x: 250, y: 420 }, 'ohm-nave': { x: 320, y: 430 },
      'field-forge-push-8': { x: 150, y: 455 },
      'field-forge-push-16': { x: 210, y: 455 },
      'field-forge-piedra-marron': { x: 270, y: 455 },
      'field-forge-piedra-roja': { x: 310, y: 455 },
      'field-forge-piedra-amarilla': { x: 350, y: 455 },
      'field-forge-piedra-gris': { x: 400, y: 455 },
      'field-forge-quitar': { x: 460, y: 455 },
      'field-forge-camino-angosto': { x: 620, y: 455 },
      'field-forge-camino-medio': { x: 680, y: 455 },
      'field-forge-camino-ancho': { x: 750, y: 455 },
      'field-forge-fuse-2': { x: 620, y: 490 },
      'field-forge-fuse-4': { x: 670, y: 490 },
      'field-forge-fuse-8': { x: 720, y: 490 },
      'field-forge-repair': { x: 790, y: 490 },
    },
    effects: [
      { kind: 'sprite', flag: 'forgeRestored', x: 620, y: 250, w: 170, h: 145, texture: 'state-forge-hearth-on' },
      { kind: 'embers', flag: 'forgeRestored', x: 120, y: 115, w: 720, h: 335, color: 0xff8c3a },
      { kind: 'pulse', flag: 'forgeRestored', x: 310, y: 250, radius: 150, color: 0xffb15f },
      { kind: 'pulse', flag: 'forgeRestored', x: 480, y: 345, radius: 170, color: 0xff8a43 },
      { kind: 'pulse', flag: 'forgeRestored', x: 620, y: 250, radius: 210, color: 0xff7b35 },
    ],
  },
  terraces_top: {
    background: 'room-terraces-top', perspective: fixedRpg,
    walkable: [{ x: 180, y: 70, w: 600, h: 400 }, { x: 400, y: 0, w: 160, h: 540 }],
    collision: [{ x: 400, y: 180, w: 160, h: 160 }],
    doors: { plaza: { x: 445, y: 0, w: 115, h: 80 }, terraces_mid: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { plaza: { x: 510, y: 105 }, terraces_mid: { x: 480, y: 445 } }, bakedThings: ['ladera-escalonada', 'compuerta-alta'],
    // NPCs reubicados dentro del walkable (auditoría R4: quedaban fuera de alcance)
    things: {
      'edda-terrazas-alto': { x: 595, y: 340 }, 'lumen-terrazas-alto': { x: 585, y: 450 },
      'ohm-terrazas-alto': { x: 520, y: 410 },
    },
    interactionAliases: { 'compuerta-alta': 'banco-escalones' },
    interactionPrompts: { 'compuerta-alta': 'Ajustar la compuerta' },
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 410, y: 30, w: 95, h: 510, color: 0x79d7c3 }, { kind: 'dust', x: 190, y: 80, w: 570, h: 390, color: 0xf0c47c }],
  },
  terraces_mid: {
    background: 'room-terraces-mid', perspective: fixedRpg,
    walkable: [{ x: 90, y: 150, w: 780, h: 280 }, { x: 410, y: 0, w: 150, h: 540 }],
    collision: [{ x: 115, y: 115, w: 330, h: 135 }, { x: 530, y: 275, w: 330, h: 135 }],
    doors: { terraces_top: { x: 410, y: 0, w: 150, h: 80 }, terraces_mural: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { terraces_top: { x: 480, y: 105 }, terraces_mural: { x: 480, y: 445 } }, bakedThings: ['terraza-alta-encharcada', 'terraza-baja-reseca'],
    interactionAliases: { 'terraza-baja-reseca': 'banco-reparto' },
    interactionPrompts: { 'terraza-baja-reseca': 'Repartir el agua' },
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 115, y: 120, w: 745, h: 285, color: 0x74d6bd }],
  },
  terraces_mural: {
    background: 'room-terraces-mural', perspective: fixedRpg,
    walkable: [{ x: 140, y: 180, w: 680, h: 300 }, { x: 410, y: 390, w: 150, h: 150 }, { x: 0, y: 245, w: 260, h: 175 }],
    collision: [
      { x: 280, y: 70, w: 400, h: 160 },
      { x: 420, y: 230, w: 120, h: 110 },
    ],
    doors: { terraces_mid: { x: 0, y: 260, w: 100, h: 145 }, terraces_aqueduct: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { terraces_mid: { x: 130, y: 330 }, terraces_aqueduct: { x: 480, y: 445 } }, bakedThings: ['mural-marana', 'signo-mural', 'mural-piedra'],
    things: {
      'mural-marana': { x: 440, y: 150, baked: true }, 'signo-mural': { x: 535, y: 180, baked: true },
      'mural-piedra': { x: 620, y: 160, baked: true }, 'guardiana-mural': { x: 720, y: 315 },
      'edda-terrazas-mural': { x: 700, y: 395 },
    },
    interactionAliases: { 'mural-piedra': 'banco-piedra-unica' },
    interactionPrompts: { 'mural-piedra': 'Examinar la Piedra Única' },
    effects: [{ kind: 'pulse', flag: 'solvedSingleStone', x: 520, y: 150, radius: 260, color: 0xe8b66b }],
  },
  terraces_aqueduct: {
    background: 'room-terraces-aqueduct', perspective: fixedRpg,
    walkable: [{ x: 120, y: 80, w: 720, h: 380 }, { x: 365, y: 0, w: 190, h: 540 }, { x: 760, y: 275, w: 200, h: 145 }],
    collision: [{ x: 255, y: 90, w: 95, h: 285 }, { x: 490, y: 140, w: 90, h: 300 }],
    doors: { terraces_mural: { x: 365, y: 0, w: 190, h: 85 }, lighthouse_hall: { x: 850, y: 275, w: 110, h: 145 } },
    entries: { terraces_mural: { x: 450, y: 110 }, lighthouse_hall: { x: 820, y: 355 } }, bakedThings: ['acueducto-nivel-alto', 'acueducto-nivel-medio', 'acueducto-nivel-bajo'],
    interactionAliases: { 'acueducto-nivel-medio': 'banco-escalera' },
    interactionPrompts: { 'acueducto-nivel-medio': 'Ajustar el acueducto' },
    things: {
      'lumen-terrazas-acueducto': { x: 185, y: 285 },
      // Con escala RPG fija, el radio del actor ya no entra si queda pegado al borde este.
      'edda-terrazas-acueducto': { x: 810, y: 220 },
    },
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 190, y: 55, w: 520, h: 415, color: 0x77d5c0 }],
  },
  lighthouse_hall: {
    background: 'room-lighthouse-hall', perspective: medium,
    walkable: [{ x: 110, y: 160, w: 740, h: 320 }, { x: 90, y: 360, w: 780, h: 180 }],
    collision: [{ x: 400, y: 210, w: 160, h: 180 }],
    doors: { terraces_aqueduct: { x: 105, y: 370, w: 130, h: 170 }, lighthouse_bench: { x: 725, y: 370, w: 130, h: 170 } },
    entries: { terraces_aqueduct: { x: 245, y: 420 }, lighthouse_bench: { x: 715, y: 420 } }, bakedThings: ['maquina-faro-muerta', 'lente-lustrada'],
    interactionAliases: { 'maquina-faro-muerta': 'banco-chispa' },
    interactionPrompts: { 'maquina-faro-muerta': 'Cargar la máquina del Faro' },
    effects: [{ kind: 'pulse', flag: 'solvedLakeFeedDc', x: 480, y: 300, radius: 240, color: 0x74d9ff }, { kind: 'water', x: 185, y: 55, w: 590, h: 150, color: 0x7acfff }],
  },
  lighthouse_bench: {
    background: 'room-lighthouse-bench', perspective: medium,
    walkable: [{ x: 105, y: 185, w: 750, h: 300 }, { x: 45, y: 190, w: 870, h: 180 }],
    collision: [{ x: 350, y: 265, w: 260, h: 165 }, { x: 180, y: 165, w: 155, h: 85 }, { x: 650, y: 165, w: 155, h: 85 }],
    doors: { lighthouse_hall: { x: 45, y: 190, w: 100, h: 150 }, clock_tower: { x: 815, y: 190, w: 100, h: 150 } },
    entries: { lighthouse_hall: { x: 165, y: 270 }, clock_tower: { x: 795, y: 270 } }, bakedThings: ['estantes-farero'],
    things: { 'farero-taller': { x: 735, y: 270 } },
    effects: [{ kind: 'pulse', flag: 'solvedClockDriveDc', x: 480, y: 325, radius: 190, color: 0x79d9ff }],
  },
  clock_tower: {
    background: 'room-clock-tower', perspective: distant,
    walkable: [{ x: 180, y: 300, w: 600, h: 200 }, { x: 0, y: 330, w: 960, h: 140 }],
    collision: [{ x: 300, y: 40, w: 360, h: 280 }],
    doors: { lighthouse_bench: { x: 0, y: 300, w: 130, h: 160 }, lighthouse_lantern: { x: 830, y: 300, w: 130, h: 160 } },
    entries: { lighthouse_bench: { x: 155, y: 390 }, lighthouse_lantern: { x: 780, y: 390 } }, bakedThings: ['reloj-parado'],
    things: { 'reloj-parado': { x: 480, y: 135, baked: true }, 'edda-reloj': { x: 700, y: 410 } },
    interactionAliases: { 'reloj-parado': 'banco-reloj' },
    interactionPrompts: { 'reloj-parado': 'Ajustar el reloj' },
    effects: [{ kind: 'pulse', flag: 'clockRestored', x: 480, y: 125, radius: 235, color: 0x91dcff }],
  },
  lighthouse_lantern: {
    background: 'room-lighthouse-lantern', perspective: distant,
    walkable: [{ x: 50, y: 200, w: 500, h: 250 }, { x: 20, y: 270, w: 200, h: 210 }],
    collision: [{ x: 240, y: 180, w: 200, h: 180 }, { x: 560, y: 80, w: 380, h: 360 }],
    doors: {
      clock_tower: { x: 30, y: 270, w: 115, h: 165 },
      plaza: { x: 150, y: 440, w: 130, h: 70 },
    },
    entries: { clock_tower: { x: 180, y: 300 }, plaza: { x: 220, y: 420 } }, bakedThings: ['lente-enorme'],
    things: {
      'lente-enorme': { x: 330, y: 285, baked: true },
      'lago-negro': { x: 560, y: 260, baked: true },
      'farero-linterna': { x: 430, y: 410 },
      'edda-linterna': { x: 350, y: 430 },
      'lumen-linterna': { x: 80, y: 360 },
      'ohm-linterna': { x: 80, y: 410 },
      'field-lh-reloj': { x: 150, y: 300 },
      'field-lh-senal': { x: 470, y: 320 },
      'field-lh-toggle': { x: 150, y: 380 },
      'field-lh-isolate': { x: 200, y: 380 },
      'field-lh-piedra-6': { x: 150, y: 420 },
      'field-lh-piedra-12': { x: 200, y: 420 },
      'field-lh-piedra-18': { x: 150, y: 455 },
      'field-lh-calibre-2': { x: 200, y: 455 },
      'field-lh-calibre-4': { x: 90, y: 455 },
      'field-lh-calibre-12': { x: 90, y: 420 },
      'field-lh-fuse-2': { x: 90, y: 380 },
      'field-lh-fuse-4': { x: 200, y: 420 },
      'field-lh-fuse-8': { x: 120, y: 455 },
      'banco-distribucion-faro': { x: 90, y: 330 },
    },
    interactionPrompts: { 'lente-enorme': 'Designar la lente' },
    effects: [
      { kind: 'sprite', flag: 'lighthouseRestored', x: 190, y: 470, w: 165, h: 82, texture: 'state-lighthouse-dock' },
      { kind: 'sprite', flag: 'lighthouseRestored', x: 235, y: 448, w: 72, h: 52, texture: 'state-lighthouse-boat' },
      { kind: 'sprite', flag: 'lighthouseRestored', x: 304, y: 239, w: 118, h: 136, texture: 'state-lighthouse-lens-on' },
      { kind: 'beam', flag: 'lighthouseRestored', x: 304, y: 239, radius: 620, color: 0xc8f4ff },
      { kind: 'glow', flag: 'lighthouseRestored', x: 304, y: 239, radius: 205, color: 0xa8edff },
      { kind: 'pulse', flag: 'lighthouseRestored', x: 304, y: 239, radius: 155, color: 0xf4fdff },
      { kind: 'water', x: 520, y: 90, w: 420, h: 350, color: 0x74cbed },
    ],
  },
};

export function roomScene(id: string): RoomSceneProfile | undefined {
  return ROOM_SCENES[id];
}

export function backgroundKey(
  profile: RoomSceneProfile,
  flags: Record<string, unknown>,
): string | undefined {
  for (const variant of profile.backgroundWhen ?? []) if (flags[variant.flag]) return variant.key;
  return profile.background;
}

export function scaleAt(profile: RoomSceneProfile | undefined, y: number): number {
  const p = profile?.perspective;
  if (!p) return 1;
  const t = Math.max(0, Math.min(1, (y - p.farY) / (p.nearY - p.farY)));
  return p.far + (p.near - p.far) * t;
}

export function rectContainsRect(outer: SceneRect, inner: SceneRect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.w <= outer.x + outer.w && inner.y + inner.h <= outer.y + outer.h;
}
