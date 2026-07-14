/**
 * Capa de puesta en escena para los fondos pintados del Arco I.
 *
 * Las coordenadas estan en el lienzo logico de Phaser (960x540). `walkable`
 * describe la union de zonas por las que cabe el jugador; `collision` agrega
 * maquinaria, pozos y piezas que viven dentro de ese piso. Mantener esta data
 * separada de rooms.ts permite ajustar arte/gameplay sin tocar la narrativa.
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
  background: string;
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
}

const interior = { far: 0.82, near: 1, farY: 120, nearY: 470 };
const distant = { far: 0.48, near: 0.7, farY: 90, nearY: 500 };
const medium = { far: 0.64, near: 0.86, farY: 100, nearY: 490 };
const fixedRpg = { far: 1, near: 1, farY: 0, nearY: 540 };

export const ROOM_SCENES: Record<string, RoomSceneProfile> = {
  plaza: {
    background: 'room-plaza',
    // Tras medir los dos caminos de la Campana, el Consejo concede la inspección:
    // la reja oeste cambia de geometría y el vano queda realmente abierto.
    backgroundWhen: [{ flag: 'solvedBellPaths', key: 'room-plaza-castle-open' }],
    perspective: medium,
    walkable: [
      // La plaza abierta termina antes de la fachada del Taller. El atrio
      // inferior conserva el piso transitable frente al edificio sin permitir
      // caminar por sus paredes.
      { x: 42, y: 58, w: 738, h: 428 },
      { x: 760, y: 300, w: 152, h: 186 },
      // El ingreso coincide con el rectángulo negro de la puerta. El atrio
      // comienza debajo; no se puede atravesar la fachada por sus costados.
      { x: 842, y: 238, w: 60, h: 82 },
      { x: 430, y: 0, w: 105, h: 540 },
      { x: 0, y: 140, w: 110, h: 210 },
      { x: 0, y: 320, w: 110, h: 160 },
    ],
    collision: [
      // La campana no es un bloque rectangular: el cuerpo y los soportes
      // dejan pasillos laterales y permiten acercarse a la cuerda desde abajo.
      // El cuerpo sube hasta la corona: nadie puede caminar "sobre" la
      // campana entrando por el corredor norte.
      { x: 424, y: 112, w: 112, h: 188 },
      { x: 390, y: 178, w: 27, h: 118 },
      { x: 543, y: 178, w: 27, h: 118 },
    ],
    doors: {
      taller: { x: 842, y: 238, w: 60, h: 60 },
      puerta: { x: 420, y: 0, w: 120, h: 55 },
      castle_gate: { x: 38, y: 190, w: 72, h: 120 },
      forge_yard: { x: 0, y: 388, w: 34, h: 68 },
      // El arco sur es el camino a Terrazas; el portal al aula vive en el sello suroeste.
      terraces_top: { x: 452, y: 504, w: 56, h: 30 },
    },
    entries: {
      aula: { x: 180, y: 382 }, taller: { x: 872, y: 322 }, puerta: { x: 480, y: 90 },
      castle_gate: { x: 90, y: 260 }, forge_yard: { x: 90, y: 420 }, terraces_top: { x: 480, y: 445 },
      lighthouse_lantern: { x: 330, y: 445 },
    },
    bakedThings: ['portal-aula', 'campana', 'lampara1', 'lampara2'],
    things: {
      'portal-aula': { x: 180, y: 382, baked: true },
      pedestal: { x: 480, y: 342 },
      // Edda lleva años intentando despertar a Ohm: al llegar, está junto al pedestal.
      edda: { x: 560, y: 350 },
      campana: { x: 480, y: 225, baked: true },
      'edda-campana': { x: 620, y: 340 },
      'lumen-plaza': { x: 660, y: 300 },
    },
    effects: [
      // La plataforma está pintada apagada; este pulso es el estado energizado.
      { kind: 'pulse', x: 180, y: 382, radius: 68, color: 0x55d9d0 },
      { kind: 'glow', flag: 'puertaDone', x: 290, y: 350, radius: 115, color: 0xffc96b },
      { kind: 'glow', flag: 'puertaDone', x: 672, y: 340, radius: 115, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 290, y: 120, radius: 105, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 672, y: 120, radius: 105, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 48, y: 350, radius: 95, color: 0xffc96b },
      { kind: 'glow', flag: 'finished', x: 915, y: 350, radius: 95, color: 0xffc96b },
      { kind: 'pulse', flag: 'finished', x: 480, y: 225, radius: 175, color: 0xffd77a },
    ],
  },
  puerta: {
    background: 'room-puerta-closed', backgroundWhen: [{ flag: 'puertaDone', key: 'room-puerta-open' }], perspective: medium,
    walkable: [{ x: 76, y: 205, w: 808, h: 335 }, { x: 430, y: 55, w: 105, h: 190 }],
    doors: { plaza: { x: 430, y: 486, w: 105, h: 54 }, manantial_ohm: { x: 430, y: 70, w: 105, h: 95 } },
    entries: { plaza: { x: 480, y: 445 }, manantial_ohm: { x: 480, y: 195 } },
    bakedThings: ['lapuerta'], things: { lapuerta: { x: 480, y: 125, baked: true } },
    effects: [{ kind: 'glow', flag: 'puertaDone', x: 480, y: 125, radius: 180, color: 0x68d9d0 }],
  },
  manantial_ohm: {
    background: 'room-manantial', perspective: distant,
    // calzada real del render: plaza circular + calzada diagonal al arco sureste.
    // La poza y los bordes de acantilado quedan fuera del piso.
    walkable: [
      { x: 335, y: 235, w: 190, h: 150 },
      { x: 300, y: 275, w: 270, h: 90 },
      { x: 450, y: 320, w: 190, h: 100 },
      { x: 525, y: 375, w: 185, h: 165 },
    ],
    collision: [{ x: 285, y: 150, w: 295, h: 95 }],
    doors: { puerta: { x: 570, y: 460, w: 100, h: 80 } }, entries: { puerta: { x: 605, y: 430 } },
    bakedThings: ['cauce-maestro', 'hito-proporciones'],
    things: {
      'cauce-maestro': { x: 400, y: 225, baked: true }, 'hito-proporciones': { x: 470, y: 285, baked: true },
      'mirador-manantial': { x: 610, y: 275, baked: true },
      // NPCs sobre la plaza circular (la calzada angosta no admite cuerpos sólidos)
      'edda-manantial': { x: 500, y: 385 }, 'ohm-manantial': { x: 590, y: 420 },
      'lumen-manantial': { x: 665, y: 385 },
    },
    effects: [{ kind: 'mist', x: 275, y: 135, w: 360, h: 150, color: 0x8ccfd0 }, { kind: 'water', flag: 'puertaDone', x: 300, y: 175, w: 265, h: 105, color: 0x68d9d0 }],
  },
  taller: {
    background: 'room-taller', perspective: interior,
    walkable: [{ x: 120, y: 145, w: 720, h: 350 }, { x: 430, y: 465, w: 100, h: 75 }],
    collision: [
      { x: 105, y: 75, w: 735, h: 92 },
      { x: 225, y: 205, w: 125, h: 145 },
      { x: 645, y: 205, w: 145, h: 130 },
      { x: 680, y: 335, w: 115, h: 100 },
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
    walkable: [{ x: 165, y: 165, w: 675, h: 365 }, { x: 790, y: 260, w: 170, h: 160 }],
    collision: [{ x: 190, y: 105, w: 230, h: 130 }, { x: 520, y: 240, w: 55, h: 55 }, { x: 225, y: 325, w: 80, h: 60 }],
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
    walkable: [{ x: 245, y: 92, w: 470, h: 410 }, { x: 430, y: 0, w: 100, h: 540 }],
    collision: [{ x: 315, y: 175, w: 55, h: 70 }, { x: 455, y: 175, w: 55, h: 70 }, { x: 590, y: 175, w: 55, h: 70 }],
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
    walkable: [{ x: 205, y: 105, w: 550, h: 395 }, { x: 430, y: 0, w: 100, h: 540 }],
    collision: [{ x: 365, y: 145, w: 230, h: 165 }],
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
    walkable: [{ x: 245, y: 105, w: 470, h: 390 }, { x: 430, y: 455, w: 100, h: 85 }],
    collision: [{ x: 350, y: 145, w: 260, h: 190 }],
    doors: { castle_branches: { x: 425, y: 465, w: 110, h: 75 } }, entries: { castle_branches: { x: 480, y: 430 } },
    things: {
      repartidor: { x: 480, y: 225, baked: true },
      'mosaico-corazon': { x: 480, y: 375, baked: true },
      'banco-repartidor': { x: 300, y: 330 },
      'consejera-corazon': { x: 690, y: 330 },
      'edda-corazon': { x: 700, y: 375 },
    },
    bakedThings: ['repartidor', 'mosaico-corazon', 'tronco-acta'],
    interactionAliases: { repartidor: 'banco-repartidor' },
    interactionPrompts: { repartidor: 'Calibrar el repartidor' },
    effects: [{ kind: 'pulse', flag: 'castleRestored', x: 480, y: 220, radius: 270, color: 0xd299ff }],
  },
  forge_yard: {
    background: 'room-forge-yard', perspective: distant,
    walkable: [{ x: 135, y: 170, w: 700, h: 350 }, { x: 790, y: 330, w: 170, h: 150 }],
    collision: [{ x: 155, y: 95, w: 220, h: 140 }, { x: 360, y: 225, w: 70, h: 55 }, { x: 545, y: 265, w: 70, h: 55 }],
    doors: { plaza: { x: 875, y: 340, w: 85, h: 140 }, forge_infirmary: { x: 185, y: 120, w: 165, h: 125 }, castle_gate: { x: 700, y: 95, w: 120, h: 90 } },
    entries: { plaza: { x: 825, y: 410 }, forge_infirmary: { x: 350, y: 260 }, castle_gate: { x: 750, y: 220 } }, bakedThings: ['martillos-patio', 'canal-tibio-patio'],
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
    walkable: [{ x: 100, y: 145, w: 760, h: 365 }, { x: 0, y: 300, w: 960, h: 150 }],
    collision: [{ x: 535, y: 175, w: 170, h: 145 }, { x: 380, y: 330, w: 170, h: 120 }],
    doors: { forge_longchannel: { x: 0, y: 300, w: 100, h: 150 } },
    entries: { forge_longchannel: { x: 125, y: 375 } }, bakedThings: ['lumbre-forja', 'martillo-forja', 'fuelle-forja', 'tablero-bus'],
    things: {
      'lumbre-forja': { x: 620, y: 250, baked: true }, 'martillo-forja': { x: 460, y: 385, baked: true },
      'consejera-nave': { x: 790, y: 390 }, 'edda-nave': { x: 660, y: 425 },
      'lumen-nave': { x: 250, y: 420 }, 'ohm-nave': { x: 320, y: 430 },
    },
    interactionAliases: { 'tablero-bus': 'banco-forja-completa' },
    interactionPrompts: { 'tablero-bus': 'Configurar la red de la Forja' },
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
    walkable: [{ x: 355, y: 35, w: 270, h: 505 }, { x: 210, y: 70, w: 540, h: 165 }],
    collision: [{ x: 470, y: 210, w: 105, h: 120 }],
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
    walkable: [{ x: 180, y: 205, w: 600, h: 300 }, { x: 410, y: 390, w: 150, h: 150 }, { x: 0, y: 245, w: 260, h: 175 }],
    collision: [
      { x: 315, y: 75, w: 365, h: 190 },
      // El piloto RPG integra una cisterna central en la base: debe sentirse sólida.
      { x: 425, y: 235, w: 115, h: 105 },
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
    walkable: [{ x: 125, y: 170, w: 710, h: 315 }, { x: 95, y: 365, w: 770, h: 175 }],
    collision: [{ x: 365, y: 230, w: 230, h: 165 }],
    doors: { terraces_aqueduct: { x: 105, y: 370, w: 130, h: 170 }, lighthouse_bench: { x: 725, y: 370, w: 130, h: 170 } },
    entries: { terraces_aqueduct: { x: 245, y: 420 }, lighthouse_bench: { x: 715, y: 420 } }, bakedThings: ['maquina-faro-muerta', 'lente-lustrada'],
    interactionAliases: { 'maquina-faro-muerta': 'banco-chispa' },
    interactionPrompts: { 'maquina-faro-muerta': 'Cargar la máquina del Faro' },
    effects: [{ kind: 'pulse', flag: 'solvedStoredSpark', x: 480, y: 300, radius: 240, color: 0x74d9ff }, { kind: 'water', x: 185, y: 55, w: 590, h: 150, color: 0x7acfff }],
  },
  lighthouse_bench: {
    background: 'room-lighthouse-bench', perspective: medium,
    walkable: [{ x: 105, y: 185, w: 750, h: 300 }, { x: 45, y: 190, w: 870, h: 180 }],
    collision: [{ x: 350, y: 265, w: 260, h: 165 }, { x: 180, y: 165, w: 155, h: 85 }, { x: 650, y: 165, w: 155, h: 85 }],
    doors: { lighthouse_hall: { x: 45, y: 190, w: 100, h: 150 }, clock_tower: { x: 815, y: 190, w: 100, h: 150 } },
    entries: { lighthouse_hall: { x: 165, y: 270 }, clock_tower: { x: 795, y: 270 } }, bakedThings: ['estantes-farero'],
    things: { 'farero-taller': { x: 735, y: 270 } },
    effects: [{ kind: 'pulse', flag: 'solvedSleepingRiver', x: 480, y: 325, radius: 190, color: 0x79d9ff }],
  },
  clock_tower: {
    background: 'room-clock-tower', perspective: distant,
    walkable: [{ x: 100, y: 185, w: 760, h: 275 }, { x: 0, y: 300, w: 960, h: 160 }],
    collision: [{ x: 285, y: 40, w: 390, h: 310 }],
    doors: { lighthouse_bench: { x: 0, y: 300, w: 130, h: 160 }, lighthouse_lantern: { x: 830, y: 300, w: 130, h: 160 } },
    entries: { lighthouse_bench: { x: 155, y: 390 }, lighthouse_lantern: { x: 780, y: 390 } }, bakedThings: ['reloj-parado'],
    things: { 'reloj-parado': { x: 480, y: 135, baked: true }, 'edda-reloj': { x: 700, y: 410 } },
    interactionAliases: { 'reloj-parado': 'banco-reloj' },
    interactionPrompts: { 'reloj-parado': 'Ajustar el reloj' },
    effects: [{ kind: 'pulse', flag: 'clockRestored', x: 480, y: 125, radius: 235, color: 0x91dcff }],
  },
  lighthouse_lantern: {
    background: 'room-lighthouse-lantern', perspective: distant,
    walkable: [{ x: 65, y: 205, w: 450, h: 260 }, { x: 30, y: 270, w: 180, h: 210 }],
    collision: [{ x: 245, y: 205, w: 180, h: 165 }],
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
      'lumen-linterna': { x: 115, y: 430 },
      'ohm-linterna': { x: 220, y: 440 },
    },
    interactionAliases: { 'lente-enorme': 'banco-latido' },
    interactionPrompts: { 'lente-enorme': 'Calibrar el latido del Faro' },
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

export function backgroundKey(profile: RoomSceneProfile, flags: Record<string, unknown>): string {
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
