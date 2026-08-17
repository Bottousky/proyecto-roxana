/**
 * Tile code mapping. Each character in the world layout string maps to a
 * Tile enum value. This keeps the layout readable while we still get
 * numeric tile IDs at runtime.
 *
 * Single-character codes only (no duplicates).
 */

import { Tile } from './types.ts';

export const TILE_CODES: Record<string, number> = {
  // Stone / paving / base
  '.': Tile.STONE_BASE,
  ':': Tile.PAVING_A,
  ',': Tile.PAVING_C,
  '+': Tile.PAVING_CENTER,
  '*': Tile.PAVING_RING,
  'X': Tile.STONE_CRACK_1,
  'Z': Tile.STONE_CRACK_2,
  '#': Tile.WALL_TALL,
  '~': Tile.STONE_WARM, // dry manantial stone (warm tone)

  // Water
  '`': Tile.WATER_DARK,        // backtick for water dark
  '^': Tile.WATER_LIVING,
  'w': Tile.WATER_EDGE_N,
  'e': Tile.WATER_EDGE_E,
  'q': Tile.WATER_EDGE_W,
  '@': Tile.WATER_DEEP,        // @ for deep water (in manantial)

  // Copper
  '-': Tile.COPPER_OFF,
  '=': Tile.COPPER_ON,
  'B': Tile.COPPER_BROKEN,
  'J': Tile.COPPER_JUNCTION,
  'H': Tile.COPPER_T_N,        // H for horizontal/tee
  'U': Tile.COPPER_END_S,      // U for end (rare)

  // Walls / arch / door
  '|': Tile.WALL_N,
  '_': Tile.WALL_S,
  'G': Tile.GATE_CLOSED,
  'D': Tile.DOOR_CLOSED,
  'A': Tile.ARCHWAY,
  'Y': Tile.ARCHWAY_TOP,
  'y': Tile.ARCHWAY_BOTTOM,

  // Vegetation
  'V': Tile.GRASS_DEAD,
  'g': Tile.GRASS_DRY,
  'v': Tile.GRASS_LIVING,
  'r': Tile.ROCK_SMALL,
  'R': Tile.ROCK_MED,
  'C': Tile.COLUMN,
  'c': Tile.COLUMN_TOP,
  'K': Tile.TREE_TRUNK,
  'k': Tile.TREE_TOP,
  'M': Tile.MOSS,

  // Decoration
  'P': Tile.PILLAR,
  'O': Tile.MONOLITH_TOP,
  'o': Tile.MONOLITH,
  'L': Tile.LANTERN_OFF,
  'l': Tile.LANTERN_ON,
  'f': Tile.STONE_DARK, // dry fountain base
  'F': Tile.STONE_LIGHT,
  'S': Tile.BELL,
  'W': Tile.WORKBENCH,
  'N': Tile.ANVIL,
  'd': Tile.PEDESTAL,
};
