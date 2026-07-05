/*
 * Geografía continua de Ohmdal. Los IDs conservan el contenido narrativo de
 * rooms.ts, pero todos los exteriores del Arco I viven en un mismo plano.
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
      puerta: { ox: 0, oy: -540 },
      manantial_ohm: { ox: 0, oy: -1080 },

      // Castillo: ala occidental, ascenso hacia el Corazón.
      castle_gate: { ox: -960, oy: 0 },
      castle_gallery: { ox: -960, oy: -540 },
      castle_branches: { ox: -960, oy: -1080 },
      castle_heart: { ox: -960, oy: -1620 },

      // Forja: distrito industrial al este, recorrido horizontal.
      forge_yard: { ox: 960, oy: 0 },
      forge_infirmary: { ox: 1920, oy: 0 },
      forge_longchannel: { ox: 2880, oy: 0 },
      forge_hall: { ox: 3840, oy: 0 },

      // Terrazas: el valle desciende al sur.
      terraces_top: { ox: 0, oy: 540 },
      terraces_mid: { ox: 0, oy: 1080 },
      terraces_mural: { ox: 0, oy: 1620 },
      terraces_aqueduct: { ox: 0, oy: 2160 },

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
