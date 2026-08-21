/**
 * mapSchematic.ts — datos esquemáticos del mapa M.
 *
 * R6: este módulo es la única fuente de presentation data del mapa M
 * (nombre del sector, accent, lista ordenada de rooms). NO expone
 * `ox/oy` ni offsets físicos: la autoridad de placement en runtime la
 * tiene RoomGraph (topología) y ActiveRoom (geometría local de la room
 * activa). El mapa M es una representación legible estilo "metro map" —
 * las coordenadas internas son del PERGAMINO, no del mundo continuo.
 *
 * Diferencias conceptuales con el antiguo `world.ts`:
 *   - Antes: `ox/oy` representaban un "plano mundo continuo" compartido.
 *   - Ahora: este módulo sólo describe cómo se renderiza el esquema del
 *     mapa M; no es una autoridad de gameplay.
 *
 * Si el mapa M requiriera en el futuro coordenadas absolutas, se modela
 * como presentation-only dentro de la UI del mapa, sin filtrarse a
 * ActiveRoom, RoomGraph, colisión o transiciones.
 */

export interface MapSchematic {
  /** Identificador del sector. */
  id: string;
  /** Nombre visible del sector. */
  name: string;
  /** Color de acento (hex number) del sector. */
  accent: number;
  /** Ids de las rooms del sector en el orden en que se presentan en el
   *  mapa. NO hay offsets físicos aquí: el mapa M es puramente esquemático. */
  rooms: readonly string[];
}

export const MAP_SCHEMATICS: readonly MapSchematic[] = [
  {
    id: 'ohmdal',
    name: 'Reino de Ohmdal',
    accent: 0xd0a34a,
    rooms: [
      // Ciudad y manantial.
      'plaza',
      'taller',
      'puerta',
      'manantial_ohm',
      // Castillo: ala occidental, ascenso hacia el Corazón.
      'castle_gate',
      'castle_gallery',
      'castle_branches',
      'castle_heart',
      // Forja: distrito industrial al oeste.
      'forge_yard',
      'forge_infirmary',
      'forge_longchannel',
      'forge_hall',
      // Terrazas: el valle desciende al sur.
      'terraces_top',
      'terraces_mid',
      'terraces_mural',
      'terraces_aqueduct',
      // Faro: junto al lago, al final del valle.
      'lighthouse_hall',
      'lighthouse_bench',
      'clock_tower',
      'lighthouse_lantern',
    ],
  },
];

/** Devuelve el esquema de mapa al que pertenece un roomId, o null. */
export function mapSchematicOf(roomId: string): MapSchematic | null {
  for (const schematic of MAP_SCHEMATICS) {
    if (schematic.rooms.includes(roomId)) return schematic;
  }
  return null;
}
