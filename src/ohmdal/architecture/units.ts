// Definición de las unidades servidas por `createBasicUnitKit` en el modo `'greybox'`.
//
// Hay 7 unidades en total: las 3 de U1 (Plaza, Taller, Puerta + Manantial) y las 4 de
// U2–U5 (Castillo, Forja, Terrazas, Faro). Cubren las 20 salas del manifiesto del Arco
// I. Cada unidad es un rectángulo con piso, perímetro y una silueta por sub-sala.
//
// **Layout HD-2D (red con hub central).** La Plaza ocupa el origen (18×14 m) y las
// otras seis zonas se reparten alrededor —no en línea E–O como en la grilla legacy
// de chunks 960×540 pensada para el topdown Phaser. Castillo al norte, Forja al
// oeste, Taller y Puerta+Manantial al este, Terrazas al sur, Faro al sureste. Los
// bounds de cada unidad coinciden con los de `LEVEL_ZONES` en `levelData.ts`.
//
// **Modo greybox para todo el arco.** Las 7 unidades corren en modo `'greybox'`:
// un solo box por piso (sin empedrado, sin junta), cuatro muros simples a 0.4 m de
// altura para ver el mundo de al lado, y landmarks con la silueta canónica. Las
// texturas y el relieve llegan en el modo `'kit'` por hito, no antes: la prioridad
// ahora es leer el arco completo de un vistazo y validar navegación+cámara antes
// de invertir tiempo en producción.

import type { BasicUnitDefinition } from './basicRoomKit.ts';

// **Layout HD-2D — red con hub central.** El origen (0, 0, 0) es el centro de la Plaza;
// las otras seis unidades se reparten alrededor. La unidad se identifica por su `id`
// y los `bounds` se mantienen en sincronía con `LEVEL_ZONES` (levelData.ts). Cualquier
// cambio de layout toca los dos archivos a la vez.

// — Plaza (hub, ~19.5×17 m con solape a los sockets) ————————————————————————————————
export const PLAZA_UNIT: BasicUnitDefinition = {
  id: 'plaza',
  bounds: { minX: -9, maxX: 10.5, minZ: -8.5, maxZ: 8.5 },
  floorFamily: 'paving',
  wallFamily: 'stone',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    {
      id: 'plaza',
      centerX: 0.75,
      width: 19.5,
      family: 'stone',
      landmarkHeight: 4.5,
      landmark: 'tower',
      displayName: 'Plaza de Ohm',
    },
  ],
};

// — Taller (este de la Plaza, 15×10 m con solape) ————————————————————————————————————
export const TALLER_UNIT: BasicUnitDefinition = {
  id: 'taller',
  bounds: { minX: 9, maxX: 24, minZ: -5, maxZ: 5 },
  floorFamily: 'wood',
  wallFamily: 'stone',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    {
      id: 'taller',
      centerX: 16.5,
      width: 15,
      family: 'wood',
      landmarkHeight: 1.0,
      landmark: 'bench',
      displayName: 'Taller de Lumen',
    },
  ],
};

// — Puerta + Manantial (continuación este, 17.5×10 m con solape) —————————————————————
export const PUERTA_UNIT: BasicUnitDefinition = {
  id: 'puerta',
  bounds: { minX: 22.5, maxX: 40, minZ: -5, maxZ: 5 },
  floorFamily: 'stone',
  wallFamily: 'stone',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    {
      id: 'puerta',
      centerX: 25.5,
      width: 7,
      family: 'stone',
      landmarkHeight: 4.5,
      landmark: 'arch',
      displayName: 'Puerta de Ohm',
    },
    {
      id: 'manantial_ohm',
      centerX: 34,
      width: 9,
      family: 'water',
      landmarkHeight: 0.8,
      landmark: 'channel',
      displayName: 'Manantial de Ohm',
    },
  ],
};

// — Castillo (norte de la Plaza, 30×33 m) ————————————————————————————————————————————
export const CASTLE_UNIT: BasicUnitDefinition = {
  id: 'castle',
  bounds: { minX: -10, maxX: 20, minZ: -40, maxZ: -7 },
  floorFamily: 'stone',
  wallFamily: 'stone',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    { id: 'castle_gate', centerX: -3, width: 8, family: 'stone', landmarkHeight: 3.6, landmark: 'arch', displayName: 'Castillo · Puerta' },
    { id: 'castle_gallery', centerX: 4, width: 8, family: 'stone', landmarkHeight: 4.0, landmark: 'tower', displayName: 'Castillo · Galería' },
    { id: 'castle_branches', centerX: 11, width: 8, family: 'stone', landmarkHeight: 3.2, landmark: 'throne', displayName: 'Castillo · Ramales' },
    { id: 'castle_heart', centerX: 17, width: 5, family: 'stone', landmarkHeight: 4.2, landmark: 'throne', displayName: 'Castillo · Corazón' },
  ],
};

// — Forja (oeste de la Plaza, 37.5×10 m con solape) ———————————————————————————————————
export const FORGE_UNIT: BasicUnitDefinition = {
  id: 'forge',
  bounds: { minX: -45, maxX: -7.5, minZ: -5, maxZ: 5 },
  floorFamily: 'stone',
  wallFamily: 'copper',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    { id: 'forge_yard', centerX: -39, width: 8, family: 'copper', landmarkHeight: 3.0, landmark: 'anvil', displayName: 'Forja · Patio' },
    { id: 'forge_infirmary', centerX: -30, width: 8, family: 'wood', landmarkHeight: 1.0, landmark: 'infirmary-bed', displayName: 'Forja · Enfermería' },
    { id: 'forge_longchannel', centerX: -21, width: 8, family: 'water', landmarkHeight: 0.6, landmark: 'channel', displayName: 'Forja · Canal largo' },
    { id: 'forge_hall', centerX: -12, width: 5, family: 'copper', landmarkHeight: 3.4, landmark: 'furnace', displayName: 'Forja · Nave' },
  ],
};

// — Terrazas (sur de la Plaza, 32×30 m) ———————————————————————————————————————————————
export const TERRACES_UNIT: BasicUnitDefinition = {
  id: 'terraces',
  bounds: { minX: -11, maxX: 21, minZ: 7, maxZ: 37 },
  floorFamily: 'paving',
  wallFamily: 'stone',
  wallHeight: 0.4,
  terrain: 'ascending',
  style: 'greybox',
  subRooms: [
    { id: 'terraces_top', centerX: -7, width: 8, family: 'stone', landmarkHeight: 3.0, landmark: 'aqueduct', displayName: 'Terrazas · Arriba' },
    { id: 'terraces_mid', centerX: 1, width: 8, family: 'stone', landmarkHeight: 2.4, landmark: 'bench', displayName: 'Terrazas · Medio' },
    { id: 'terraces_mural', centerX: 9, width: 8, family: 'stone', landmarkHeight: 2.6, landmark: 'mural', displayName: 'Terrazas · Mural' },
    { id: 'terraces_aqueduct', centerX: 17, width: 5, family: 'stone', landmarkHeight: 2.2, landmark: 'aqueduct', displayName: 'Terrazas · Acueducto' },
  ],
};

// — Faro (sureste, costa del lago, 35×8 m) ———————————————————————————————————————————
export const LIGHTHOUSE_UNIT: BasicUnitDefinition = {
  id: 'lighthouse',
  bounds: { minX: 21, maxX: 56, minZ: 14, maxZ: 22 },
  floorFamily: 'paving',
  wallFamily: 'stone',
  wallHeight: 0.4,
  style: 'greybox',
  subRooms: [
    { id: 'lighthouse_hall', centerX: 25, width: 8, family: 'stone', landmarkHeight: 2.4, landmark: 'bench', displayName: 'Faro · Sala' },
    { id: 'lighthouse_bench', centerX: 33, width: 8, family: 'wood', landmarkHeight: 1.0, landmark: 'bench', displayName: 'Faro · Banco' },
    { id: 'clock_tower', centerX: 43, width: 8, family: 'copper', landmarkHeight: 4.0, landmark: 'clock', displayName: 'Faro · Torre del reloj' },
    { id: 'lighthouse_lantern', centerX: 52, width: 5, family: 'glass', landmarkHeight: 4.4, landmark: 'lantern', displayName: 'Faro · Linterna' },
  ],
};

export const BASIC_UNITS: readonly BasicUnitDefinition[] = [
  PLAZA_UNIT,
  TALLER_UNIT,
  PUERTA_UNIT,
  CASTLE_UNIT,
  FORGE_UNIT,
  TERRACES_UNIT,
  LIGHTHOUSE_UNIT,
] as const;

/** Separación teórica entre unidades — el pasillo real se modela con colliders en `levelData.ts`. */
export const UNIT_GAP_METERS = 2;
