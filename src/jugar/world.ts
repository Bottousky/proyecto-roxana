/*
 * Geografía continua de Ohmdal. Los IDs conservan el contenido narrativo de
 * rooms.ts, pero todos los exteriores del Arco I viven en un mismo plano.
 *
 * Commit 4 (H3 — Plaza multi-área greybox): la Plaza pasa a 1920×1080. Sus
 * vecinos directos se reposicionan para mantener la conexión física
 * sin solapamientos:
 *
 *   - `taller` se mueve a (1920, 0): ocupaba el antiguo cuadrante NE
 *     de la Plaza 960×540; con la Plaza extendida a 1920×1080, el
 *     Taller debe estar pegado al nuevo borde este de la Plaza.
 *   - `puerta` se queda en (0, -540): su borde sur (y=0) ya coincide
 *     con el borde norte de la Plaza.
 *   - `manantial_ohm` se queda en (0, -1080): la cadena norte
 *     (Plaza → Puerta → Manantial) sigue siendo lineal.
 *   - `castle_gate` se queda en (-960, 0): su borde este coincide
 *     con el borde oeste de la Plaza. No se solapa porque la Plaza
 *     ahora ocupa x ∈ [0, 1920).
 *   - `forge_yard` se queda en (-960, 540): no colisiona con la
 *     Plaza (queda en y ∈ [540, 1080), al sur-oeste).
 *   - `terraces_top` se queda en (0, 540): su borde norte coincide
 *     con el borde sur de la Plaza. El sendereo a las Terrazas se
 *     realiza a través de la conexión sur de la Plaza.
 *
 * El resto del mundo (ramales del Castillo, Forja profunda, Acueducto,
 * Faro) mantiene los offsets previos: no se rediseña el world layout
 * en este commit.
 */

export interface WorldLayout {
  id: string;
  name: string;
  accent: number;
  rooms: Record<string, { ox: number; oy: number }>;
}

export const WORLDS: WorldLayout[] = [
  {
    id: 'ohmdal',
    name: 'Reino de Ohmdal',
    accent: 0xd0a34a,
    rooms: {
      // Ciudad y manantial.
      plaza: { ox: 0, oy: 0 },
      // El Taller es interior en runtime, pero pertenece al esquema global y
      // se muestra como ala este de la Plaza en el mapa. Con la Plaza a
      // 1920×1080 (commit 4) se reposiciona a (1920, 0) para conectar
      // físicamente al borde este de la Plaza.
      taller: { ox: 1920, oy: 0 },
      puerta: { ox: 0, oy: -540 },
      manantial_ohm: { ox: 0, oy: -1080 },

      // Castillo: ala occidental, ascenso hacia el Corazón.
      castle_gate: { ox: -960, oy: 0 },
      castle_gallery: { ox: -960, oy: -540 },
      castle_branches: { ox: -960, oy: -1080 },
      castle_heart: { ox: -960, oy: -1620 },

      // Forja: distrito industrial al oeste y una cota por debajo de la plaza.
      // Coincide con el mapa-isla y deja libre el este para el Arco II.
      forge_yard: { ox: -960, oy: 540 },
      forge_infirmary: { ox: -1920, oy: 540 },
      forge_longchannel: { ox: -2880, oy: 540 },
      forge_hall: { ox: -3840, oy: 540 },

      // Terrazas: el valle desciende al sur. Commit 4 (H3 —
      // Plaza multi-área greybox): la Plaza pasó a 1920×1080, así
      // que `terraces_top` se reposiciona a (0, 1080) para que
      // conecte físicamente al borde sur de la Plaza. El resto de
      // la cadena de terrazas se corre 540 px hacia abajo para
      // mantener la continuidad norte→sur.
      terraces_top: { ox: 0, oy: 1080 },
      terraces_mid: { ox: 0, oy: 1620 },
      terraces_mural: { ox: 0, oy: 2160 },
      terraces_aqueduct: { ox: 0, oy: 2700 },

      // Faro: junto al lago, al final del valle.
      lighthouse_hall: { ox: 960, oy: 2160 },
      lighthouse_bench: { ox: 1920, oy: 2160 },
      clock_tower: { ox: 2880, oy: 2160 },
      lighthouse_lantern: { ox: 3840, oy: 2160 },
    },
  },
];

export function worldOf(roomId: string): WorldLayout | null {
  for (const world of WORLDS) if (roomId in world.rooms) return world;
  return null;
}
