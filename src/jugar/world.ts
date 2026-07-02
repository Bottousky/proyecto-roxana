/*
 * Composición del mundo continuo.
 *
 * Cada mundo ubica salas EXISTENTES de rooms.ts como chunks de 960×540 en un
 * plano compartido (offsets en píxeles). Las puertas entre dos salas del mismo
 * mundo dejan de teletransportar: se convierten en aberturas de muralla por las
 * que se camina (si la puerta tenía candado, queda como portón sellado hasta
 * que la historia lo abre). Las puertas hacia salas de otros mundos (interiores,
 * regiones lejanas) siguen siendo puertas con transición.
 *
 * rooms.ts no sabe nada de esto: el layout vive acá y es puro dato.
 */

export interface WorldLayout {
  id: string;
  name: string;
  accent: number;
  rooms: Record<string, { ox: number; oy: number }>;
}

export const WORLDS: WorldLayout[] = [
  {
    // Ohmdal: la plaza en el centro, la Puerta y el manantial al norte, y —
    // hacia el oeste — el Castillo completo como corredor vertical continuo
    // (castle_gate → galería → ramales → corazón), igual que puerta→manantial.
    //
    // Nota de diseño: Forja/Terrazas/Faro NO se fusionan aquí aunque también
    // salen al oeste de la plaza — sus 3 puertas conviven en la MISMA franja
    // del muro oeste (bandas de y distintas dentro de un solo tramo de 0-540),
    // así que no pueden ser 3 chunks distintos "al oeste" sin superponerse.
    // Son capítulos/regiones separadas del mundo (Forja=U3, Terrazas=U4,
    // Faro=U5): quedan como "caminos" con puerta de transición, ya vestidos
    // como tales en rooms.ts (color y label de camino, no de puerta genérica).
    // Ver docs/plan-arco-1-hubs.md, Fase A.
    id: 'ohmdal',
    name: 'Ciudad de Ohmdal',
    accent: 0xd0a34a,
    rooms: {
      plaza: { ox: 0, oy: 0 },
      puerta: { ox: 0, oy: -540 },
      manantial_ohm: { ox: 0, oy: -1080 },
      castle_gate: { ox: -960, oy: 0 },
      castle_gallery: { ox: -960, oy: -540 },
      castle_branches: { ox: -960, oy: -1080 },
      castle_heart: { ox: -960, oy: -1620 },
    },
  },
  {
    // La Forja se lee como un descenso industrial: patio → enfermería → canal
    // largo → nave mayor. Las cuatro salas comparten mundo y se recorren sin
    // fundidos ni teletransportes una vez cruzado el camino desde la plaza.
    id: 'forge',
    name: 'Forjas de Cobre',
    accent: 0xe7783d,
    rooms: {
      forge_yard: { ox: 0, oy: 0 },
      forge_infirmary: { ox: 0, oy: -540 },
      forge_longchannel: { ox: 0, oy: -1080 },
      forge_hall: { ox: 0, oy: -1620 },
    },
  },
  {
    // Las Terrazas descienden físicamente hacia el valle. El orden espacial
    // refuerza el contenido: cada chunk está un nivel más abajo que el anterior.
    id: 'terraces',
    name: 'Terrazas del Caudal',
    accent: 0x62c8a5,
    rooms: {
      terraces_top: { ox: 0, oy: 0 },
      terraces_mid: { ox: 0, oy: 540 },
      terraces_mural: { ox: 0, oy: 1080 },
      terraces_aqueduct: { ox: 0, oy: 1620 },
    },
  },
  {
    // El Faro asciende desde la sala de máquinas hasta la linterna. El jugador
    // ve el progreso como una torre vertical continua en mundo y mapa.
    id: 'lighthouse',
    name: 'Faro del Norte',
    accent: 0x78ccee,
    rooms: {
      lighthouse_hall: { ox: 0, oy: 0 },
      lighthouse_bench: { ox: 0, oy: -540 },
      clock_tower: { ox: 0, oy: -1080 },
      lighthouse_lantern: { ox: 0, oy: -1620 },
    },
  },
];

export function worldOf(roomId: string): WorldLayout | null {
  for (const w of WORLDS) if (roomId in w.rooms) return w;
  return null;
}
