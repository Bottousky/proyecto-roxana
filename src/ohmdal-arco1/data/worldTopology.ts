/**
 * World topology data — Cuenca de Ohm (Arc I).
 *
 * The map is 96x80 tiles. Each cell maps to a Tile enum value.
 * The layout is built from a string template, where each character is a
 * tile code. This keeps the layout human-readable and the spatial
 * relationships explicit.
 *
 * Tile codes (single char):
 *   .  STONE_BASE          #  WALL_TALL         V  GRASS_DEAD
 *   ,  PAVING_C            |  WALL_N            v  GRASS_LIVING
 *   :  PAVING_A            _  WALL_S            g  GRASS_DRY
 *   +  PAVING_CENTER       ~  STONE_WARM        M  MOSS
 *   *  PAVING_RING         `  WATER_DARK        r  ROCK_SMALL
 *   X  STONE_CRACK_1       @  WATER_DEEP        R  ROCK_MED
 *   Z  STONE_CRACK_2       ^  WATER_LIVING      C  COLUMN
 *   -  COPPER_OFF          w  WATER_EDGE_N      c  COLUMN_TOP
 *   =  COPPER_ON           e  WATER_EDGE_E      K  TREE_TRUNK
 *   B  COPPER_BROKEN       q  WATER_EDGE_W      k  TREE_TOP
 *   J  COPPER_JUNCTION     Y  ARCHWAY_TOP       P  PILLAR
 *   H  COPPER_T_N          y  ARCHWAY_BOTTOM    O  MONOLITH_TOP
 *   A  ARCHWAY             D  DOOR_CLOSED       o  MONOLITH
 *   L  LANTERN_OFF         G  GATE_CLOSED       S  BELL
 *   l  LANTERN_ON          F  STONE_LIGHT       W  WORKBENCH
 *   f  STONE_DARK          N  ANVIL             d  PEDESTAL
 *
 * The world is bordered by walls (no exit). Player starts at (48, 60).
 * The Manantial is north (y=0-8), the Plaza in the center (y=32-44),
 * the Portal south (y=64-66).
 */

import { Tile, type WorldTopology } from './types.ts';
import { TILE_CODES } from './tileCodes.ts';

// === Layout as ASCII art (96 wide × 80 tall) ===
// Coordinates: (0,0) is top-left. y increases going south.
const LAYOUT: string[] = [
  // Row 0..2 — Manantial (water surface, sky)
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  // Row 3..7 — Manantial water body with rocks
  'g       eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee         g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe        g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwRwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwRwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  // Row 8..14 — Calzada (path from Manantial to Puerta)
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  'g      e`wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwe       g',
  // Row 15..17 — Top of the Puerta, plaza-alta step
  'g     e                                                                              g',
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  // Row 18..28 — Puerta de Ohm (monumental arch facing south, with the Ω)
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  'g    e~~~~~~~~~YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYe    g',
  'g    e~~~~~~~~~Y                                                          Ye          g',
  'g    e~~~~~~~~~Y                                                          Ye          g',
  'g    e~~~~~~~~~Y                                                          Ye          g',
  'g    e~~~~~~~~~Y            A    A    A    A    A    A    A               Ye          g',
  'g    e~~~~~~~~~Y            A    A    A    A    A    A    A               Ye          g',
  'g    e~~~~~~~~~Y            A    A    A    A    A    A    A               Ye          g',
  'g    e~~~~~~~~~Y                                                          Ye          g',
  'g    e~~~~~~~~~YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYe    g',
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  // Row 29..30 — Plaza-alta (step up between Puerta and Plaza)
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  'g    e~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~e    g',
  // Row 31..44 — Plaza central (fountain in center, paving around)
  'g                                                                                            g',
  'g                ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,                           g',
  'g                ,::::::::::::::::::::::::::::::::::::::::::::::,                           g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,:______________________________________________:,                          g',
  'g                ,::::::::::::::::::::::::::::::::::::::::::::::,                           g',
  'g                ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,                           g',
  // Row 45..54 — Lamps on the Plaza + Lumen's Taller building to the east
  'g                                                                                            g',
  'g    L     L                                                                                g',
  'g                                                                                            g',
  'g                                                                                            g',
  'g                                          DDDDDDDDDDDDDDDD                                   g',
  'g                                          D                D                                   g',
  'g                                          D     ##  ##      D                                   g',
  'g                                          D     ##  ##      D                                   g',
  'g                                          D     ##  ##      D                                   g',
  'g                                          D                D                                   g',
  'g                                          D                D                                   g',
  // Row 55..60 — Camino empedrado (path from Portal up to Plaza)
  'g                              PPPPPPPPPPPPPPPPPPPPPPPPPPPP                                g',
  'g                              P  - - - - - - - - - - -    P                                g',
  'g                              P  - - - - - - - - - - -    P                                g',
  'g                              P  - - - - - - - - - - -    P                                g',
  'g                              P  - - - - - - - - - - -    P                                g',
  'g                              P  - - - - - - - - - - -    P                                g',
  'g                              PPPPPPPPPPPPPPPPPPPPPPPPPPPP                                g',
  // Row 61..67 — Portal monolith
  'g                                                                                            g',
  'g                                                                                            g',
  'g                                OOOOOOOOOOOOOOOOOOOOOOOOOOOO                               g',
  'g                                O O O O O O O O O O O O O O O                                g',
  'g                                O O O O O O O O O O O O O O O                                g',
  'g                                O O O O O O O O O O O O O O O                                g',
  'g                                OOOOOOOOOOOOOOOOOOOOOOOOOOOO                               g',
  // Row 68..79 — Sendero S (exterior, dry grass, low wall, hint of wider Ohmdal)
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'gVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
];

const W = 96;
const H = 80;

// Pad / trim to 80 rows × 96 cols
while (LAYOUT.length < H) LAYOUT.push(' '.repeat(W));

function buildTiles(): Uint16Array {
  const out = new Uint16Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = LAYOUT[y] ?? '';
    for (let x = 0; x < W; x++) {
      const ch = row[x] ?? ' ';
      const tile = TILE_CODES[ch] ?? Tile.STONE_BASE;
      out[y * W + x] = tile;
    }
  }
  return out;
}

function buildCollision(tiles: Uint16Array): Uint8Array {
  const col = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = tiles[y * W + x];
      let solid = 0;
      switch (t) {
        // Walls and architecture
        case Tile.WALL_N:
        case Tile.WALL_S:
        case Tile.WALL_E:
        case Tile.WALL_W:
        case Tile.WALL_CORNER_NE:
        case Tile.WALL_CORNER_NW:
        case Tile.WALL_CORNER_SE:
        case Tile.WALL_CORNER_SW:
        case Tile.WALL_TOP:
        case Tile.WALL_DOOR:
        case Tile.WALL_WINDOW:
        case Tile.WALL_TALL:
        case Tile.WALL_GATE:
        // Water
        case Tile.WATER_DEEP:
        case Tile.WATER_DARK:
        case Tile.WATER_FLOWING:
        case Tile.WATER_LIVING:
        case Tile.WATER_LIGHT:
        // Monolith
        case Tile.MONOLITH:
        case Tile.MONOLITH_TOP:
        // Arch
        case Tile.ARCHWAY:
        case Tile.ARCHWAY_TOP:
        case Tile.ARCHWAY_BOTTOM:
        // Columns and pillars
        case Tile.COLUMN:
        case Tile.COLUMN_TOP:
        case Tile.PILLAR:
        // Tree
        case Tile.TREE_TRUNK:
        case Tile.TREE_TOP:
        // Rocks
        case Tile.ROCK_SMALL:
        case Tile.ROCK_MED:
        case Tile.ROCK_LARGE:
        // Pedestal (small, blocking the central spot)
        case Tile.PEDESTAL:
        // Closed doors / gates
        case Tile.DOOR_CLOSED:
        case Tile.GATE_CLOSED:
          solid = 1;
          break;
        default:
          solid = 0;
      }
      col[y * W + x] = solid;
    }
  }

  // Borders: solid around the entire map edge
  for (let x = 0; x < W; x++) {
    col[0 * W + x] = 1;
    col[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    col[y * W + 0] = 1;
    col[y * W + (W - 1)] = 1;
  }

  return col;
}

const tiles = buildTiles();
const collision = buildCollision(tiles);

// === NPCs ===
const npcs = [
  {
    id: 'edda',
    name: 'Edda',
    x: 38,
    y: 38,
    sprite: 'edda',
    portrait: 'edda',
    path: [
      { x: 38, y: 38 },
      { x: 30, y: 38 },
      { x: 30, y: 44 },
      { x: 38, y: 44 },
    ],
    ySort: true,
    script: 'edda_meeting',
  },
  {
    id: 'lumen',
    name: 'Maese Lumen',
    x: 70,
    y: 44,
    sprite: 'lumen',
    portrait: 'lumen',
    path: [
      { x: 70, y: 44 },
      { x: 70, y: 46 },
      { x: 72, y: 46 },
    ],
    ySort: true,
    script: 'lumen_workshop',
  },
  {
    id: 'ohm',
    name: 'Ohm',
    x: 47,
    y: 25,
    sprite: 'ohm',
    portrait: 'ohm',
    path: [],
    ySort: true,
    script: 'ohm_inert',
  },
  {
    id: 'habitante_1',
    name: 'Aprendiz',
    x: 35,
    y: 40,
    sprite: 'npc_apprentice',
    path: [
      { x: 35, y: 40 },
      { x: 35, y: 42 },
    ],
    ySort: true,
    script: 'habitante_aprendiz',
  },
  {
    id: 'habitante_2',
    name: 'Regadora',
    x: 55,
    y: 40,
    sprite: 'npc_regadora',
    path: [
      { x: 55, y: 40 },
      { x: 55, y: 42 },
    ],
    ySort: true,
    script: 'habitante_regadora',
  },
  {
    id: 'habitante_3',
    name: 'Anciano',
    x: 48,
    y: 56,
    sprite: 'npc_anciano',
    path: [
      { x: 48, y: 56 },
      { x: 48, y: 58 },
    ],
    ySort: true,
    script: 'habitante_anciano',
  },
];

// === Interactables ===
const interactables = [
  {
    id: 'portal_monolith',
    type: 'monolith' as const,
    x: 48,
    y: 64,
    w: 1,
    h: 1,
    node: 'src_portal',
    state: 'off' as const,
    verb: 'Tocar el monolito',
    script: 'portal_inert',
    layer: 'tall' as const,
    solid: true,
  },
  {
    id: 'plaza_fountain',
    type: 'fountain' as const,
    x: 48,
    y: 38,
    w: 2,
    h: 2,
    node: 'node_fountain',
    state: 'dry' as const,
    verb: 'Inspeccionar la fuente',
    script: 'fountain_dry',
    layer: 'object' as const,
    solid: true,
  },
  {
    id: 'lamp_plaza_nw',
    type: 'lamp' as const,
    x: 32,
    y: 32,
    node: 'node_plaza_1',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'lamp_plaza_ne',
    type: 'lamp' as const,
    x: 64,
    y: 32,
    node: 'node_plaza_2',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'lamp_plaza_sw',
    type: 'lamp' as const,
    x: 32,
    y: 44,
    node: 'node_plaza_3',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'lamp_plaza_se',
    type: 'lamp' as const,
    x: 64,
    y: 44,
    node: 'node_plaza_4',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'plaza_bell',
    type: 'bell' as const,
    x: 50,
    y: 36,
    state: 'off' as const,
    verb: 'Tocar la campana',
    script: 'bell_inert',
    sprite: 'bell',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'ohm_pedestal',
    type: 'device' as const,
    x: 47,
    y: 25,
    node: 'node_ohm',
    state: 'off' as const,
    verb: 'Examinar a Ohm',
    script: 'ohm_inert',
    sprite: 'pedestal',
    layer: 'object' as const,
    solid: true,
  },
  {
    id: 'lamp_puerta_l',
    type: 'lamp' as const,
    x: 40,
    y: 22,
    node: 'node_puerta_l',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'lamp_puerta_r',
    type: 'lamp' as const,
    x: 56,
    y: 22,
    node: 'node_puerta_r',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'manantial_gate',
    type: 'gate' as const,
    x: 47,
    y: 14,
    node: 'node_manantial_gate',
    state: 'closed' as const,
    verb: 'Tocar la compuerta',
    script: 'manantial_gate_closed',
    sprite: 'gate',
    layer: 'tall' as const,
    solid: true,
  },
  {
    id: 'lamp_manantial_1',
    type: 'lamp' as const,
    x: 36,
    y: 4,
    node: 'node_manantial_light',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'lamp_manantial_2',
    type: 'lamp' as const,
    x: 60,
    y: 4,
    node: 'node_manantial_light_2',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'taller_bench',
    type: 'workbench' as const,
    x: 70,
    y: 40,
    node: 'node_taller_bench',
    state: 'off' as const,
    verb: 'Inspeccionar el banco',
    script: 'lumen_bench',
    sprite: 'workbench',
    layer: 'object' as const,
    solid: true,
  },
  {
    id: 'lamp_taller',
    type: 'lamp' as const,
    x: 70,
    y: 38,
    node: 'node_taller_light',
    state: 'off' as const,
    verb: 'Mirar la lámpara',
    script: 'lamp_off',
    sprite: 'lamp',
    layer: 'tall' as const,
    solid: false,
  },
  {
    id: 'cable_break_main',
    type: 'wire' as const,
    x: 48,
    y: 56,
    state: 'broken' as const,
    verb: 'Mirar el cable',
    script: 'cable_broken_main',
    sprite: 'cable',
    layer: 'floor' as const,
    solid: false,
  },
  {
    id: 'cable_break_puerta',
    type: 'wire' as const,
    x: 48,
    y: 24,
    state: 'broken' as const,
    verb: 'Mirar el cable',
    script: 'cable_broken_puerta',
    sprite: 'cable',
    layer: 'floor' as const,
    solid: false,
  },
];

// === Electrical graph ===
const electrical = {
  nodes: [
    { id: 'src_portal', type: 'source' as const, x: 48, y: 64, v: 12, state: 'deenergized' as const },
    { id: 'node_fountain', type: 'load' as const, x: 48, y: 38, v: 12, state: 'deenergized' as const },
    { id: 'node_plaza_1', type: 'load' as const, x: 32, y: 32, v: 12, state: 'deenergized' as const },
    { id: 'node_plaza_2', type: 'load' as const, x: 64, y: 32, v: 12, state: 'deenergized' as const },
    { id: 'node_plaza_3', type: 'load' as const, x: 32, y: 44, v: 12, state: 'deenergized' as const },
    { id: 'node_plaza_4', type: 'load' as const, x: 64, y: 44, v: 12, state: 'deenergized' as const },
    { id: 'node_ohm', type: 'load' as const, x: 47, y: 25, v: 5, state: 'deenergized' as const },
    { id: 'node_taller_light', type: 'load' as const, x: 70, y: 38, v: 12, state: 'deenergized' as const },
    { id: 'node_taller_bench', type: 'load' as const, x: 70, y: 40, v: 12, state: 'deenergized' as const },
    { id: 'node_puerta_l', type: 'load' as const, x: 40, y: 22, v: 12, state: 'deenergized' as const },
    { id: 'node_puerta_r', type: 'load' as const, x: 56, y: 22, v: 12, state: 'deenergized' as const },
    { id: 'node_manantial_gate', type: 'gate' as const, x: 47, y: 14, v: 12, state: 'deenergized' as const },
    { id: 'node_manantial_light', type: 'load' as const, x: 36, y: 4, v: 12, state: 'deenergized' as const },
    { id: 'node_manantial_light_2', type: 'load' as const, x: 60, y: 4, v: 12, state: 'deenergized' as const },
  ],
  edges: [
    {
      id: 'c_main_south',
      from: 'src_portal',
      to: 'node_fountain',
      path: [
        { x: 48, y: 64 },
        { x: 48, y: 60 },
        { x: 48, y: 58 },
        { x: 48, y: 56 },
        { x: 48, y: 54 },
        { x: 48, y: 50 },
        { x: 48, y: 46 },
        { x: 48, y: 42 },
        { x: 48, y: 38 },
      ],
      state: 'broken' as const,
      breakIndex: 3,
    },
    {
      id: 'c_plaza_west',
      from: 'node_fountain',
      to: 'node_plaza_1',
      path: [
        { x: 48, y: 38 },
        { x: 40, y: 38 },
        { x: 36, y: 38 },
        { x: 32, y: 38 },
        { x: 32, y: 36 },
        { x: 32, y: 32 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_plaza_sw',
      from: 'node_plaza_1',
      to: 'node_plaza_3',
      path: [
        { x: 32, y: 32 },
        { x: 32, y: 38 },
        { x: 32, y: 44 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_plaza_s',
      from: 'node_plaza_3',
      to: 'node_plaza_4',
      path: [
        { x: 32, y: 44 },
        { x: 48, y: 44 },
        { x: 64, y: 44 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_plaza_ne',
      from: 'node_plaza_4',
      to: 'node_plaza_2',
      path: [
        { x: 64, y: 44 },
        { x: 64, y: 38 },
        { x: 64, y: 32 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_plaza_n',
      from: 'node_plaza_2',
      to: 'node_plaza_1',
      path: [
        { x: 64, y: 32 },
        { x: 48, y: 32 },
        { x: 32, y: 32 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_plaza_to_puerta',
      from: 'node_fountain',
      to: 'node_puerta_l',
      path: [
        { x: 48, y: 38 },
        { x: 48, y: 32 },
        { x: 48, y: 28 },
        { x: 48, y: 24 },
        { x: 44, y: 24 },
        { x: 40, y: 24 },
        { x: 40, y: 22 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_puerta_r',
      from: 'node_puerta_l',
      to: 'node_puerta_r',
      path: [
        { x: 40, y: 22 },
        { x: 48, y: 22 },
        { x: 56, y: 22 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_puerta_to_ohm',
      from: 'node_puerta_l',
      to: 'node_ohm',
      path: [
        { x: 40, y: 22 },
        { x: 44, y: 22 },
        { x: 46, y: 22 },
        { x: 47, y: 23 },
        { x: 47, y: 24 },
        { x: 47, y: 25 },
      ],
      state: 'broken' as const,
      breakIndex: 4,
    },
    {
      id: 'c_puerta_to_manantial',
      from: 'node_puerta_l',
      to: 'node_manantial_gate',
      path: [
        { x: 40, y: 22 },
        { x: 44, y: 18 },
        { x: 48, y: 16 },
        { x: 48, y: 14 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_manantial_lamps',
      from: 'node_manantial_gate',
      to: 'node_manantial_light',
      path: [
        { x: 47, y: 14 },
        { x: 40, y: 8 },
        { x: 36, y: 4 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_manantial_lamps_2',
      from: 'node_manantial_gate',
      to: 'node_manantial_light_2',
      path: [
        { x: 47, y: 14 },
        { x: 56, y: 8 },
        { x: 60, y: 4 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_fountain_to_taller',
      from: 'node_fountain',
      to: 'node_taller_bench',
      path: [
        { x: 48, y: 38 },
        { x: 56, y: 38 },
        { x: 64, y: 38 },
        { x: 70, y: 38 },
        { x: 70, y: 40 },
      ],
      state: 'intact' as const,
    },
    {
      id: 'c_taller_light',
      from: 'node_taller_bench',
      to: 'node_taller_light',
      path: [
        { x: 70, y: 40 },
        { x: 70, y: 38 },
      ],
      state: 'intact' as const,
    },
  ],
  source: 'src_portal',
};

// === Camera regions ===
const camera = {
  regions: [
    {
      name: 'sendero_s',
      bounds: { x: 0, y: 60, w: 96, h: 20 },
      zoom: 1.2,
      music: 'dormant',
      ambience: 'wind',
    },
    {
      name: 'camino',
      bounds: { x: 30, y: 50, w: 36, h: 12 },
      zoom: 1.0,
      music: 'dormant',
      ambience: 'wind',
    },
    {
      name: 'plaza',
      bounds: { x: 24, y: 28, w: 48, h: 24 },
      zoom: 1.0,
      music: 'dormant',
      ambience: 'plaza_dormant',
    },
    {
      name: 'puerta',
      bounds: { x: 24, y: 16, w: 48, h: 16 },
      zoom: 1.0,
      music: 'awakening',
      ambience: 'wind',
    },
    {
      name: 'manantial',
      bounds: { x: 16, y: 0, w: 64, h: 16 },
      zoom: 0.9,
      music: 'awakening',
      ambience: 'water',
    },
    {
      name: 'taller',
      bounds: { x: 60, y: 36, w: 22, h: 18 },
      zoom: 1.0,
      music: 'dormant',
      ambience: 'workshop',
    },
  ],
  defaultZoom: 1.0,
  pixelScale: 3,
};

// === Music ===
const music = {
  dormant: 'ohmdal_dormant',
  awakening: 'ohmdal_awakening',
  powered: 'ohmdal_powered',
  puzzle: 'puzzle_think',
  manantial: 'manantial_flow',
  credits: 'credits',
};

export const worldTopology: WorldTopology = {
  width: W,
  height: H,
  tileSize: 16,
  tiles: Array.from(tiles),
  collision,
  playerStart: { x: 48, y: 58 },
  npcs,
  interactables,
  electrical,
  camera,
  music,
};
