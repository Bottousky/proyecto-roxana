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
  | { kind: 'glow' | 'pulse' | 'beam'; flag?: string; x: number; y: number; radius: number; color: number };

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
  effects?: SceneEffect[];
}

const interior = { far: 0.82, near: 1, farY: 120, nearY: 470 };
const distant = { far: 0.48, near: 0.7, farY: 90, nearY: 500 };
const medium = { far: 0.64, near: 0.86, farY: 100, nearY: 490 };

export const ROOM_SCENES: Record<string, RoomSceneProfile> = {
  plaza: {
    background: 'room-plaza', perspective: medium,
    walkable: [
      { x: 42, y: 58, w: 770, h: 428 },
      { x: 430, y: 0, w: 105, h: 540 },
      { x: 0, y: 140, w: 110, h: 210 },
      { x: 780, y: 25, w: 180, h: 425 },
      { x: 120, y: 450, w: 170, h: 90 },
      { x: 0, y: 320, w: 110, h: 160 },
    ],
    collision: [{ x: 412, y: 214, w: 136, h: 96 }],
    doors: {
      aula: { x: 145, y: 486, w: 120, h: 54 },
      taller: { x: 812, y: 235, w: 92, h: 95 },
      puerta: { x: 420, y: 0, w: 120, h: 55 },
      castle_gate: { x: 0, y: 150, w: 55, h: 185 },
      forge_yard: { x: 0, y: 370, w: 42, h: 100 },
      terraces_top: { x: 435, y: 486, w: 90, h: 54 },
    },
    entries: {
      aula: { x: 205, y: 450 }, taller: { x: 785, y: 280 }, puerta: { x: 480, y: 90 },
      castle_gate: { x: 90, y: 260 }, forge_yard: { x: 90, y: 420 }, terraces_top: { x: 480, y: 445 },
    },
    effects: [{ kind: 'glow', flag: 'puertaDone', x: 290, y: 350, radius: 115, color: 0xffc96b }, { kind: 'glow', flag: 'puertaDone', x: 672, y: 340, radius: 115, color: 0xffc96b }],
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
    walkable: [{ x: 270, y: 205, w: 355, h: 175 }, { x: 430, y: 315, w: 280, h: 225 }],
    collision: [{ x: 260, y: 145, w: 285, h: 92 }],
    doors: { puerta: { x: 585, y: 455, w: 125, h: 85 } }, entries: { puerta: { x: 605, y: 430 } },
    bakedThings: ['cauce-maestro', 'hito-proporciones'],
    things: { 'cauce-maestro': { x: 400, y: 225, baked: true }, 'hito-proporciones': { x: 470, y: 285, baked: true }, 'mirador-manantial': { x: 610, y: 275, baked: true } },
    effects: [{ kind: 'mist', x: 275, y: 135, w: 360, h: 150, color: 0x8ccfd0 }, { kind: 'water', flag: 'puertaDone', x: 300, y: 175, w: 265, h: 105, color: 0x68d9d0 }],
  },
  taller: {
    background: 'room-taller', perspective: interior,
    walkable: [{ x: 120, y: 145, w: 720, h: 350 }, { x: 430, y: 465, w: 100, h: 75 }],
    collision: [{ x: 105, y: 75, w: 735, h: 92 }, { x: 655, y: 170, w: 125, h: 105 }],
    doors: { plaza: { x: 430, y: 465, w: 100, h: 75 } }, entries: { plaza: { x: 480, y: 445 } },
    things: { estantes: { x: 355, y: 130, baked: true }, banco: { x: 405, y: 330 } }, bakedThings: ['estantes'],
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
    effects: [{ kind: 'mist', x: 110, y: 80, w: 780, h: 390, color: 0x758bc4 }, { kind: 'glow', flag: 'castleRestored', x: 305, y: 180, radius: 160, color: 0xb88cff }],
  },
  castle_gallery: {
    background: 'room-castle-gallery', perspective: medium,
    walkable: [{ x: 245, y: 92, w: 470, h: 410 }, { x: 430, y: 0, w: 100, h: 540 }],
    collision: [{ x: 315, y: 175, w: 55, h: 70 }, { x: 455, y: 175, w: 55, h: 70 }, { x: 590, y: 175, w: 55, h: 70 }],
    doors: { castle_gate: { x: 425, y: 470, w: 110, h: 70 }, castle_branches: { x: 425, y: 35, w: 110, h: 75 } },
    entries: { castle_gate: { x: 480, y: 445 }, castle_branches: { x: 480, y: 135 } },
    things: { 'lamparas-galeria': { x: 480, y: 125, baked: true }, 'pedestales-galeria': { x: 480, y: 215, baked: true }, 'edda-galeria': { x: 700, y: 400 } }, bakedThings: ['lamparas-galeria', 'pedestales-galeria'],
    effects: [{ kind: 'pulse', flag: 'solvedGalleryChain', x: 480, y: 120, radius: 300, color: 0xc89cff }],
  },
  castle_branches: {
    background: 'room-castle-branches', perspective: medium,
    walkable: [{ x: 205, y: 105, w: 550, h: 395 }, { x: 430, y: 0, w: 100, h: 540 }],
    collision: [{ x: 365, y: 145, w: 230, h: 165 }],
    doors: { castle_gallery: { x: 425, y: 470, w: 110, h: 70 }, castle_heart: { x: 425, y: 35, w: 110, h: 75 } },
    entries: { castle_gallery: { x: 480, y: 445 }, castle_heart: { x: 480, y: 345 } },
    things: { 'tronco-ramales': { x: 480, y: 215, baked: true }, 'bocas-ramales': { x: 390, y: 245, baked: true }, 'fusible-mayor': { x: 585, y: 240, baked: true } }, bakedThings: ['tronco-ramales', 'bocas-ramales', 'fusible-mayor'],
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
    effects: [{ kind: 'pulse', flag: 'castleRestored', x: 480, y: 220, radius: 270, color: 0xd299ff }],
  },
  forge_yard: {
    background: 'room-forge-yard', perspective: distant,
    walkable: [{ x: 135, y: 170, w: 700, h: 350 }, { x: 790, y: 330, w: 170, h: 150 }],
    collision: [{ x: 155, y: 95, w: 220, h: 140 }, { x: 360, y: 225, w: 70, h: 55 }, { x: 545, y: 265, w: 70, h: 55 }],
    doors: { plaza: { x: 875, y: 340, w: 85, h: 140 }, forge_infirmary: { x: 185, y: 120, w: 165, h: 125 }, castle_gate: { x: 700, y: 95, w: 120, h: 90 } },
    entries: { plaza: { x: 825, y: 410 }, forge_infirmary: { x: 350, y: 260 }, castle_gate: { x: 750, y: 220 } }, bakedThings: ['martillos-patio', 'canal-tibio-patio'],
    effects: [{ kind: 'embers', flag: 'forgeRestored', x: 170, y: 155, w: 650, h: 330, color: 0xff8a43 }],
  },
  forge_infirmary: {
    background: 'room-forge-infirmary', perspective: medium,
    walkable: [{ x: 145, y: 155, w: 670, h: 350 }, { x: 80, y: 395, w: 800, h: 145 }],
    collision: [{ x: 145, y: 80, w: 670, h: 105 }],
    doors: { forge_yard: { x: 80, y: 390, w: 115, h: 150 }, forge_longchannel: { x: 765, y: 390, w: 115, h: 150 } },
    entries: { forge_yard: { x: 205, y: 430 }, forge_longchannel: { x: 755, y: 430 } }, bakedThings: ['pared-fusibles'],
    effects: [{ kind: 'glow', flag: 'solvedFuseInfirmary', x: 480, y: 120, radius: 300, color: 0xffa45d }],
  },
  forge_longchannel: {
    background: 'room-forge-longchannel', perspective: distant,
    walkable: [{ x: 55, y: 175, w: 850, h: 250 }, { x: 0, y: 220, w: 960, h: 130 }],
    collision: [{ x: 85, y: 70, w: 790, h: 105 }],
    doors: { forge_infirmary: { x: 0, y: 220, w: 90, h: 130 }, forge_hall: { x: 870, y: 220, w: 90, h: 130 } },
    entries: { forge_infirmary: { x: 115, y: 300 }, forge_hall: { x: 845, y: 300 } }, bakedThings: ['canal-doscientos-pasos', 'horno-lejano'],
    effects: [{ kind: 'embers', flag: 'solvedLongChannel', x: 90, y: 160, w: 780, h: 250, color: 0xff7a3d }],
  },
  forge_hall: {
    background: 'room-forge-hall', perspective: medium,
    walkable: [{ x: 100, y: 145, w: 760, h: 365 }, { x: 0, y: 300, w: 960, h: 150 }],
    collision: [{ x: 535, y: 175, w: 170, h: 145 }, { x: 380, y: 330, w: 170, h: 120 }],
    doors: { forge_longchannel: { x: 0, y: 300, w: 100, h: 150 } },
    entries: { forge_longchannel: { x: 125, y: 375 } }, bakedThings: ['lumbre-forja', 'martillo-forja', 'fuelle-forja'],
    things: { 'lumbre-forja': { x: 620, y: 250, baked: true }, 'martillo-forja': { x: 460, y: 385, baked: true } },
    effects: [{ kind: 'embers', flag: 'forgeRestored', x: 520, y: 135, w: 230, h: 250, color: 0xff8c3a }, { kind: 'glow', flag: 'forgeRestored', x: 620, y: 250, radius: 190, color: 0xff7b35 }],
  },
  terraces_top: {
    background: 'room-terraces-top', perspective: distant,
    walkable: [{ x: 355, y: 35, w: 270, h: 505 }, { x: 210, y: 70, w: 540, h: 165 }],
    collision: [{ x: 470, y: 210, w: 105, h: 120 }],
    doors: { plaza: { x: 445, y: 0, w: 115, h: 80 }, terraces_mid: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { plaza: { x: 510, y: 105 }, terraces_mid: { x: 480, y: 445 } }, bakedThings: ['ladera-escalonada', 'compuerta-alta'],
    // NPCs reubicados dentro del walkable (auditoría R4: quedaban fuera de alcance)
    things: { 'edda-terrazas-alto': { x: 595, y: 340 }, 'lumen-terrazas-alto': { x: 585, y: 450 } },
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 410, y: 30, w: 95, h: 510, color: 0x79d7c3 }, { kind: 'dust', x: 190, y: 80, w: 570, h: 390, color: 0xf0c47c }],
  },
  terraces_mid: {
    background: 'room-terraces-mid', perspective: distant,
    walkable: [{ x: 90, y: 150, w: 780, h: 280 }, { x: 410, y: 0, w: 150, h: 540 }],
    collision: [{ x: 115, y: 115, w: 330, h: 135 }, { x: 530, y: 275, w: 330, h: 135 }],
    doors: { terraces_top: { x: 410, y: 0, w: 150, h: 80 }, terraces_mural: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { terraces_top: { x: 480, y: 105 }, terraces_mural: { x: 480, y: 445 } }, bakedThings: ['terraza-alta-encharcada', 'terraza-baja-reseca'],
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 115, y: 120, w: 745, h: 285, color: 0x74d6bd }],
  },
  terraces_mural: {
    background: 'room-terraces-mural', perspective: distant,
    walkable: [{ x: 180, y: 205, w: 600, h: 300 }, { x: 410, y: 390, w: 150, h: 150 }, { x: 0, y: 245, w: 260, h: 175 }],
    collision: [{ x: 315, y: 75, w: 365, h: 190 }],
    doors: { terraces_mid: { x: 0, y: 260, w: 100, h: 145 }, terraces_aqueduct: { x: 410, y: 470, w: 150, h: 70 } },
    entries: { terraces_mid: { x: 220, y: 330 }, terraces_aqueduct: { x: 480, y: 445 } }, bakedThings: ['mural-marana', 'signo-mural', 'mural-piedra'],
    things: { 'mural-marana': { x: 440, y: 150, baked: true }, 'signo-mural': { x: 535, y: 180, baked: true }, 'mural-piedra': { x: 620, y: 160, baked: true } },
    effects: [{ kind: 'pulse', flag: 'solvedSingleStone', x: 520, y: 150, radius: 260, color: 0xe8b66b }],
  },
  terraces_aqueduct: {
    background: 'room-terraces-aqueduct', perspective: distant,
    walkable: [{ x: 120, y: 80, w: 720, h: 380 }, { x: 365, y: 0, w: 190, h: 540 }, { x: 760, y: 275, w: 200, h: 145 }],
    collision: [{ x: 255, y: 90, w: 95, h: 285 }, { x: 490, y: 140, w: 90, h: 300 }],
    doors: { terraces_mural: { x: 365, y: 0, w: 190, h: 85 }, lighthouse_hall: { x: 850, y: 275, w: 110, h: 145 } },
    entries: { terraces_mural: { x: 450, y: 110 }, lighthouse_hall: { x: 820, y: 355 } }, bakedThings: ['acueducto-nivel-alto', 'acueducto-nivel-medio', 'acueducto-nivel-bajo'],
    effects: [{ kind: 'water', flag: 'valleyRestored', x: 190, y: 55, w: 520, h: 415, color: 0x77d5c0 }],
  },
  lighthouse_hall: {
    background: 'room-lighthouse-hall', perspective: medium,
    walkable: [{ x: 125, y: 170, w: 710, h: 315 }, { x: 95, y: 365, w: 770, h: 175 }],
    collision: [{ x: 365, y: 230, w: 230, h: 165 }],
    doors: { terraces_aqueduct: { x: 105, y: 370, w: 130, h: 170 }, lighthouse_bench: { x: 725, y: 370, w: 130, h: 170 } },
    entries: { terraces_aqueduct: { x: 245, y: 420 }, lighthouse_bench: { x: 715, y: 420 } }, bakedThings: ['maquina-faro-muerta', 'lente-lustrada'],
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
    entries: { lighthouse_bench: { x: 155, y: 390 }, lighthouse_lantern: { x: 805, y: 390 } }, bakedThings: ['reloj-parado'],
    things: { 'reloj-parado': { x: 480, y: 135, baked: true } },
    effects: [{ kind: 'pulse', flag: 'clockRestored', x: 480, y: 125, radius: 235, color: 0x91dcff }],
  },
  lighthouse_lantern: {
    background: 'room-lighthouse-lantern', perspective: distant,
    walkable: [{ x: 65, y: 205, w: 450, h: 260 }, { x: 30, y: 270, w: 180, h: 210 }],
    collision: [{ x: 245, y: 205, w: 180, h: 165 }],
    doors: { clock_tower: { x: 30, y: 270, w: 115, h: 165 } }, entries: { clock_tower: { x: 170, y: 350 } }, bakedThings: ['lente-enorme'],
    things: {
      'lente-enorme': { x: 330, y: 285, baked: true },
      'lago-negro': { x: 560, y: 260, baked: true },
      'farero-linterna': { x: 430, y: 410 },
      'edda-linterna': { x: 350, y: 430 },
    },
    effects: [{ kind: 'beam', flag: 'lighthouseRestored', x: 330, y: 250, radius: 620, color: 0xa8e9ff }, { kind: 'pulse', flag: 'lighthouseRestored', x: 330, y: 270, radius: 210, color: 0x8ee7ff }, { kind: 'water', x: 520, y: 90, w: 420, h: 350, color: 0x74cbed }],
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
