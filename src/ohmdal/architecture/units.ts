// Definición de las 4 unidades básicas del Arco I servidas por `createBasicUnitKit`.
//
// Cada unidad cubre 4 sub-salas del manifiesto. La silueta de cada sub-sala está elegida
// para que se reconozca al pasar, no para que sea un modelo: un trono en el heart del
// Castillo, un yunque en el hall de la Forja, un acueducto en las Terrazas, una linterna
// en el Faro. La silueta se valida a la vista cuando llegue el hito de producción.
//
// Las 4 unidades se atan a un zoneId de levelData.ts. El orden y los nombres son los del
// manifiesto, no los del recorrido canónico: el ROADMAP.md ya decidió que el slice
// canónico (Portal→Plaza→Taller→Puerta) se valida aparte y el resto del arco se prueba
// caminando. La pasada panorámica sirve para detectar bugs tempranos —el jugador no
// puede cruzar un muro, las siluetas no se solapan, las transiciones de cámara no
// parpadean— antes de invertir tiempo en producción de cada unidad.

import type { BasicUnitDefinition } from './basicRoomKit.ts';

/** Ancho de cada sub-sala en metros. Cuatro sub-salas a 6.5 m cubren 26 m por unidad. */
const SUB_ROOM_WIDTH = 6.5;
/** Separación entre unidades — el pasillo entre socket y socket es 2 m. */
const UNIT_GAP = 2;

/** Helper: centro en x de la sub-sala número N (0..3) dentro de una unidad. */
function subCenterX(unitMinX: number, index: 0 | 1 | 2 | 3): number {
  return unitMinX + SUB_ROOM_WIDTH * (index + 0.5);
}

export const CASTLE_UNIT: BasicUnitDefinition = {
  id: 'castle',
  bounds: { minX: 24, maxX: 50, minZ: -5, maxZ: 9 },
  floorFamily: 'stone',
  wallFamily: 'stone',
  wallHeight: 3.4,
  subRooms: [
    { id: 'castle_gate', centerX: subCenterX(24, 0), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 3.6, landmark: 'arch', displayName: 'Castillo · Puerta' },
    { id: 'castle_gallery', centerX: subCenterX(24, 1), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 4.0, landmark: 'tower', displayName: 'Castillo · Galería' },
    { id: 'castle_branches', centerX: subCenterX(24, 2), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 3.2, landmark: 'throne', displayName: 'Castillo · Ramales' },
    { id: 'castle_heart', centerX: subCenterX(24, 3), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 4.2, landmark: 'throne', displayName: 'Castillo · Corazón' },
  ],
};

export const FORGE_UNIT: BasicUnitDefinition = {
  id: 'forge',
  bounds: { minX: 54, maxX: 80, minZ: -7, maxZ: 3 },
  floorFamily: 'stone',
  wallFamily: 'copper',
  wallHeight: 3.2,
  subRooms: [
    { id: 'forge_yard', centerX: subCenterX(54, 0), width: SUB_ROOM_WIDTH, family: 'copper', landmarkHeight: 3.0, landmark: 'anvil', displayName: 'Forja · Patio' },
    { id: 'forge_infirmary', centerX: subCenterX(54, 1), width: SUB_ROOM_WIDTH, family: 'wood', landmarkHeight: 1.0, landmark: 'infirmary-bed', displayName: 'Forja · Enfermeria' },
    { id: 'forge_longchannel', centerX: subCenterX(54, 2), width: SUB_ROOM_WIDTH, family: 'water', landmarkHeight: 0.6, landmark: 'channel', displayName: 'Forja · Canal largo' },
    { id: 'forge_hall', centerX: subCenterX(54, 3), width: SUB_ROOM_WIDTH, family: 'copper', landmarkHeight: 3.4, landmark: 'furnace', displayName: 'Forja · Nave' },
  ],
};

export const TERRACES_UNIT: BasicUnitDefinition = {
  id: 'terraces',
  bounds: { minX: 84, maxX: 116, minZ: -5, maxZ: 7 },
  floorFamily: 'paving',
  wallFamily: 'stone',
  wallHeight: 2.8,
  // Las terrazas suben hacia el este: la unidad gana 4.5 m de altura entre el patio bajo
  // y el mirador del mural. El faro queda al final, lo más alto.
  terrain: 'ascending',
  subRooms: [
    { id: 'terraces_top', centerX: subCenterX(84, 0), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 3.0, landmark: 'aqueduct', displayName: 'Terrazas · Arriba' },
    { id: 'terraces_mid', centerX: subCenterX(84, 1), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 2.4, landmark: 'bench', displayName: 'Terrazas · Medio' },
    { id: 'terraces_mural', centerX: subCenterX(84, 2), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 2.6, landmark: 'mural', displayName: 'Terrazas · Mural' },
    { id: 'terraces_aqueduct', centerX: subCenterX(84, 3), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 2.2, landmark: 'aqueduct', displayName: 'Terrazas · Acueducto' },
  ],
};

export const LIGHTHOUSE_UNIT: BasicUnitDefinition = {
  id: 'lighthouse',
  bounds: { minX: 120, maxX: 152, minZ: -5, maxZ: 3 },
  floorFamily: 'paving',
  wallFamily: 'stone',
  wallHeight: 3.0,
  subRooms: [
    { id: 'lighthouse_hall', centerX: subCenterX(120, 0), width: SUB_ROOM_WIDTH, family: 'stone', landmarkHeight: 2.4, landmark: 'bench', displayName: 'Faro · Sala' },
    { id: 'lighthouse_bench', centerX: subCenterX(120, 1), width: SUB_ROOM_WIDTH, family: 'wood', landmarkHeight: 1.0, landmark: 'bench', displayName: 'Faro · Banco' },
    { id: 'clock_tower', centerX: subCenterX(120, 2), width: SUB_ROOM_WIDTH, family: 'copper', landmarkHeight: 4.0, landmark: 'clock', displayName: 'Faro · Torre del reloj' },
    { id: 'lighthouse_lantern', centerX: subCenterX(120, 3), width: SUB_ROOM_WIDTH, family: 'glass', landmarkHeight: 4.4, landmark: 'lantern', displayName: 'Faro · Linterna' },
  ],
};

export const BASIC_UNITS: readonly BasicUnitDefinition[] = [
  CASTLE_UNIT,
  FORGE_UNIT,
  TERRACES_UNIT,
  LIGHTHOUSE_UNIT,
] as const;

export const UNIT_GAP_METERS = UNIT_GAP;
