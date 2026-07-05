// Definiciones declarativas de los 6 mapas del Arco 1.
// Coordenadas de objetos en TILES. El loader expande suelo, borde y colisión.
import { TEAL, COPPER, OFF_GRAY, LAMP_ON } from '../config.ts';
import type { MapDef } from '../types.ts';

const G = { GRASS: 0, FLOWER: 1, PATH: 2, FLOOR: 3, WATER: 4, WALL: 5, RUIN: 6, RUNE: 7, HEDGE: 8, VOID: 9 };

export const MAPS: Record<string, MapDef> = {
  // ---------------- 1 · Arboleda del Portal ----------------
  MAP_OHMDAL_01_PORTAL_GLADE: {
    id: 'MAP_OHMDAL_01_PORTAL_GLADE',
    name: 'Arboleda del Portal',
    ambient: 'glade',
    w: 20, h: 15, base: G.GRASS, border: G.HEDGE,
    fills: [
      { rect: [3, 7, 14, 2], tile: G.PATH }, // sendero del circuito
    ],
    points: [
      { at: [[2, 2], [16, 3], [4, 12], [15, 11], [8, 13], [12, 2]], tile: G.HEDGE },
      { at: [[9, 2], [10, 2], [9, 3], [10, 3]], tile: G.RUNE }, // umbral del portal
    ],
    objects: [
      { kind: 'spawn', id: 'start', x: 10, y: 4 },
      { kind: 'prop', id: 'portal', x: 10, y: 2, sprite: 'portal', tint: TEAL, glow: true },
      { kind: 'sign', id: 'sign_glade', x: 6, y: 5, dialogue: 'sign_glade' },
      { kind: 'interact', id: 'p1_source', x: 3, y: 7, sprite: 'node', puzzle: 'p1', tint: TEAL, glow: true, solid: true, label: 'Fuente de la arboleda' },
      { kind: 'interact', id: 'p1_conduit', x: 7, y: 10, sprite: 'path_straight', puzzle: 'p1', tint: COPPER, label: 'Conducto suelto' },
      { kind: 'interact', id: 'p1_switch', x: 10, y: 7, sprite: 'switch_off', puzzle: 'p1', tint: COPPER, solid: true, label: 'Llave de paso' },
      { kind: 'interact', id: 'p1_lamp', x: 16, y: 7, sprite: 'lamp', puzzle: 'p1', tint: OFF_GRAY, solid: true, label: 'Lámpara apagada' },
      { kind: 'warp', x: 19, y: 8, to: 'MAP_OHMDAL_02_DIM_PLAZA', spawn: [1, 8], lockedBy: 'solvedClosedCircuit', blockSprite: 'door', label: 'Camino a la plaza' },
    ],
  },

  // ---------------- 2 · Plaza Tenue ----------------
  MAP_OHMDAL_02_DIM_PLAZA: {
    id: 'MAP_OHMDAL_02_DIM_PLAZA',
    name: 'Plaza de Ohmdal',
    ambient: 'plaza',
    w: 20, h: 15, base: G.GRASS, border: G.WALL,
    fills: [
      { rect: [5, 4, 10, 8], tile: G.FLOOR }, // adoquín de la plaza
      { rect: [9, 1, 2, 3], tile: G.PATH }, // salida norte
      { rect: [9, 12, 2, 2], tile: G.PATH },
    ],
    points: [
      { at: [[1, 8], [18, 8]], tile: G.PATH }, // umbrales E/O
    ],
    objects: [
      { kind: 'prop', id: 'fountain', x: 10, y: 7, sprite: 'node', tint: OFF_GRAY, solid: true },
      { kind: 'prop', id: 'plaza_lamp_a', x: 6, y: 5, sprite: 'lamp', solid: true },
      { kind: 'prop', id: 'plaza_lamp_b', x: 13, y: 5, sprite: 'lamp', solid: true },
      { kind: 'prop', id: 'plaza_lamp_c', x: 6, y: 10, sprite: 'lamp', solid: true },
      { kind: 'prop', id: 'plaza_lamp_d', x: 13, y: 10, sprite: 'lamp', solid: true },
      { kind: 'npc', id: 'edda', x: 8, y: 9, sprite: 'npc_edda', dialogue: 'edda' },
      { kind: 'warp', x: 0, y: 8, to: 'MAP_OHMDAL_01_PORTAL_GLADE', spawn: [18, 8], label: 'Volver a la arboleda' },
      { kind: 'warp', x: 10, y: 0, to: 'MAP_OHMDAL_03_LUMEN_WORKSHOP', spawn: [8, 12], label: 'Taller de Maese Lumen' },
      { kind: 'warp', x: 19, y: 8, to: 'MAP_OHMDAL_04_CONDUCTOR_PATH', spawn: [1, 8], lockedBy: 'hasProbe', blockSprite: 'door', label: 'Camino de los Conductores' },
    ],
  },

  // ---------------- 3 · Taller de Maese Lumen ----------------
  MAP_OHMDAL_03_LUMEN_WORKSHOP: {
    id: 'MAP_OHMDAL_03_LUMEN_WORKSHOP',
    name: 'Taller de Maese Lumen',
    ambient: 'workshop',
    w: 16, h: 14, base: G.FLOOR, border: G.WALL,
    fills: [{ rect: [7, 12, 2, 2], tile: G.PATH }],
    points: [
      { at: [[2, 2], [3, 2], [12, 2], [13, 2]], tile: G.RUNE },
    ],
    objects: [
      { kind: 'prop', id: 'bench_a', x: 3, y: 3, sprite: 'node', tint: TEAL, glow: true, solid: true },
      { kind: 'prop', id: 'bench_b', x: 12, y: 3, sprite: 'lamp', tint: LAMP_ON, glow: true, solid: true },
      { kind: 'npc', id: 'lumen', x: 8, y: 5, sprite: 'npc_lumen', dialogue: 'lumen' },
      { kind: 'warp', x: 8, y: 13, to: 'MAP_OHMDAL_02_DIM_PLAZA', spawn: [10, 2], label: 'Volver a la plaza' },
    ],
  },

  // ---------------- 4 · Camino de los Conductores ----------------
  MAP_OHMDAL_04_CONDUCTOR_PATH: {
    id: 'MAP_OHMDAL_04_CONDUCTOR_PATH',
    name: 'Camino de los Conductores',
    ambient: 'path',
    w: 22, h: 13, base: G.GRASS, border: G.HEDGE,
    fills: [
      { rect: [1, 5, 20, 3], tile: G.PATH },
      { rect: [9, 8, 4, 4], tile: G.WATER }, // barranco/agua bajo el puente
      { rect: [9, 4, 4, 1], tile: G.WATER },
    ],
    points: [
      { at: [[1, 6], [20, 6]], tile: G.PATH },
      { at: [[9, 6], [10, 6], [11, 6], [12, 6]], tile: G.RUNE }, // tramo del puente
    ],
    objects: [
      { kind: 'interact', id: 'p2_source', x: 6, y: 6, sprite: 'node', puzzle: 'p2', tint: TEAL, glow: true, solid: true, label: 'Fuente del puente' },
      { kind: 'interact', id: 'p2_conductor', x: 5, y: 9, sprite: 'crystal_conductor', puzzle: 'p2', label: 'Muestra de cobre' },
      { kind: 'interact', id: 'p2_insulator', x: 8, y: 9, sprite: 'crystal_insulator', puzzle: 'p2', label: 'Placa oscura' },
      { kind: 'interact', id: 'p2_slot', x: 10, y: 6, sprite: 'node', puzzle: 'p2', tint: OFF_GRAY, solid: true, label: 'Ranura del puente' },
      { kind: 'interact', id: 'p2_lamp', x: 15, y: 6, sprite: 'lamp', puzzle: 'p2', tint: OFF_GRAY, solid: true, label: 'Faro del puente' },
      { kind: 'warp', x: 0, y: 6, to: 'MAP_OHMDAL_02_DIM_PLAZA', spawn: [18, 8], label: 'Volver a la plaza' },
      { kind: 'warp', x: 21, y: 6, to: 'MAP_OHMDAL_05_SLEEPING_CURRENT_RUINS', spawn: [8, 12], lockedBy: 'solvedConductor', blockSprite: 'door', label: 'Ruina Dormida' },
    ],
  },

  // ---------------- 5 · Ruina de la Corriente Dormida ----------------
  MAP_OHMDAL_05_SLEEPING_CURRENT_RUINS: {
    id: 'MAP_OHMDAL_05_SLEEPING_CURRENT_RUINS',
    name: 'Ruina de la Corriente Dormida',
    ambient: 'ruins',
    w: 18, h: 14, base: G.RUIN, border: G.WALL,
    fills: [
      { rect: [3, 6, 12, 2], tile: G.RUNE }, // línea en serie
      { rect: [8, 1, 2, 3], tile: G.RUNE }, // pasillo norte a la puerta
      { rect: [7, 11, 4, 2], tile: G.PATH },
    ],
    points: [
      { at: [[1, 3], [16, 3], [1, 10], [16, 10], [4, 12], [13, 12]], tile: G.VOID },
    ],
    objects: [
      { kind: 'interact', id: 'p3_n1', x: 4, y: 7, sprite: 'node', puzzle: 'p3', tint: OFF_GRAY, solid: true, label: 'Nodo dormido' },
      { kind: 'interact', id: 'p3_n2', x: 8, y: 7, sprite: 'node', puzzle: 'p3', tint: OFF_GRAY, solid: true, label: 'Nodo dormido' },
      { kind: 'interact', id: 'p3_n3', x: 12, y: 7, sprite: 'node', puzzle: 'p3', tint: OFF_GRAY, solid: true, label: 'Nodo dormido' },
      { kind: 'prop', id: 'sealed_door', x: 8, y: 1, sprite: 'door', tint: OFF_GRAY, solid: true },
      { kind: 'warp', x: 8, y: 12, to: 'MAP_OHMDAL_04_CONDUCTOR_PATH', spawn: [20, 6], label: 'Volver al camino' },
      { kind: 'warp', x: 8, y: 0, to: 'MAP_OHMDAL_06_FIRST_SPARK_CHAMBER', spawn: [8, 11], lockedBy: 'solvedSeries', label: 'Sala de la Primera Chispa' },
    ],
  },

  // ---------------- 6 · Sala de la Primera Chispa ----------------
  MAP_OHMDAL_06_FIRST_SPARK_CHAMBER: {
    id: 'MAP_OHMDAL_06_FIRST_SPARK_CHAMBER',
    name: 'Sala de la Primera Chispa',
    ambient: 'chamber',
    w: 18, h: 13, base: G.FLOOR, border: G.WALL,
    fills: [
      { rect: [6, 4, 6, 6], tile: G.RUNE }, // plataforma del núcleo
      { rect: [8, 10, 2, 2], tile: G.PATH },
    ],
    points: [
      { at: [[3, 3], [14, 3], [3, 9], [14, 9]], tile: G.RUNE },
    ],
    objects: [
      { kind: 'interact', id: 'p4_core', x: 9, y: 6, sprite: 'node', puzzle: 'p4', tint: 0xff5533, glow: true, solid: true, label: 'Núcleo de la Primera Chispa' },
      { kind: 'warp', x: 8, y: 12, to: 'MAP_OHMDAL_05_SLEEPING_CURRENT_RUINS', spawn: [8, 2], label: 'Volver a la ruina' },
    ],
  },
};
