/**
 * World topology types — Cuenca de Ohm (Arc I, Ohmdal rebuild).
 *
 * The world is a single continuous 2D map. No "rooms". No transitions.
 * The player walks from the Portal to the Manantial without the engine
 * changing anything except ambient music and camera.
 */

export type TileId = number;

/** Logical tile families. Each maps to a sprite in the tileset atlas. */
export const enum Tile {
  // 0..15 — Stone / paving / base
  STONE_DARK = 0,
  STONE_BASE = 1,
  STONE_LIGHT = 2,
  STONE_CRACK_1 = 3,
  STONE_CRACK_2 = 4,
  STONE_WARM = 5,
  PAVING_A = 6,
  PAVING_B = 7,
  PAVING_C = 8,
  PAVING_D = 9,
  PAVING_CENTER = 10,
  PAVING_RING = 11,

  // 16..31 — Walls
  WALL_N = 16,
  WALL_S = 17,
  WALL_E = 18,
  WALL_W = 19,
  WALL_CORNER_NE = 20,
  WALL_CORNER_NW = 21,
  WALL_CORNER_SE = 22,
  WALL_CORNER_SW = 23,
  WALL_TOP = 24,
  WALL_DOOR = 25,
  WALL_WINDOW = 26,
  WALL_TALL = 27,
  WALL_GATE = 28,
  ARCHWAY = 29,
  ARCHWAY_TOP = 30,
  ARCHWAY_BOTTOM = 31,

  // 32..47 — Vegetation / exterior
  GRASS_DRY = 32,
  GRASS_DEAD = 33,
  GRASS_LIVING = 34,
  MOSS = 35,
  ROCK_SMALL = 36,
  ROCK_MED = 37,
  ROCK_LARGE = 38,
  SHRUB = 39,
  TREE_TRUNK = 40,
  TREE_TOP = 41,
  COLUMN = 42,
  COLUMN_TOP = 43,

  // 48..63 — Water
  WATER_DEEP = 48,
  WATER_DARK = 49,
  WATER_FLOWING = 50,
  WATER_LIVING = 51,
  WATER_LIGHT = 52,
  WATER_EDGE_N = 53,
  WATER_EDGE_S = 54,
  WATER_EDGE_E = 55,
  WATER_EDGE_W = 56,
  WATER_EDGE_NE = 57,
  WATER_EDGE_NW = 58,
  WATER_EDGE_SE = 59,
  WATER_EDGE_SW = 60,

  // 64..79 — Copper / wire tiles (electrical)
  COPPER_OFF = 64,
  COPPER_ON = 65,
  COPPER_BROKEN = 66,
  COPPER_NODE = 67,
  COPPER_JUNCTION = 68,
  COPPER_CORNER_NES = 69,
  COPPER_CORNER_NWS = 70,
  COPPER_CORNER_ESW = 71,
  COPPER_CORNER_NEW = 72,
  COPPER_T_N = 73,
  COPPER_T_S = 74,
  COPPER_T_E = 75,
  COPPER_T_W = 76,
  COPPER_END_N = 77,
  COPPER_END_S = 78,
  COPPER_END_E = 79,

  // 80..95 — Door / special
  DOOR_CLOSED = 80,
  DOOR_OPEN = 81,
  GATE_CLOSED = 82,
  GATE_OPEN = 83,
  PILLAR = 84,
  BELL = 85,
  PEDESTAL = 86,
  MONOLITH = 87,
  MONOLITH_TOP = 88,
  BRAZIER = 89,
  BRAZIER_LIT = 90,
  LANTERN_OFF = 91,
  LANTERN_ON = 92,
  WORKBENCH = 93,
  WORKBENCH_BROKEN = 94,
  ANVIL = 95,
}

export interface WorldTopology {
  width: number;
  height: number;
  tileSize: number;
  tiles: TileId[]; // length = width * height
  collision: Uint8Array; // 1 = solid, 0 = walkable
  playerStart: { x: number; y: number };
  npcs: NPCDef[];
  interactables: InteractableDef[];
  electrical: ElectricalDef;
  camera: CameraDef;
  music: MusicDef;
}

export interface NPCDef {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  portrait?: string;
  /** Waypoints (cycle). Empty = static. */
  path?: { x: number; y: number }[];
  /** Render order in Y. */
  ySort: boolean;
  /** Initial dialogue / behaviour. */
  script: string;
}

export interface InteractableDef {
  id: string;
  type: 'lamp' | 'wire' | 'switch' | 'node' | 'device' | 'fountain' | 'door' | 'gate' | 'bell' | 'monolith' | 'anvil' | 'workbench';
  x: number;
  y: number;
  /** Width/height in tiles (for multi-tile). Default 1. */
  w?: number;
  h?: number;
  /** Electrical node id, if any. */
  node?: string;
  /** Initial state. */
  state: 'off' | 'on' | 'broken' | 'closed' | 'open' | 'dry' | 'flowing';
  /** Verb shown on prompt. */
  verb: string;
  /** Dialogue / puzzle id. */
  script: string;
  /** Visual: a sprite id (props atlas). */
  sprite?: string;
  /** Depth layer override. */
  layer?: 'floor' | 'object' | 'tall';
  /** Whether the player can walk through. */
  solid: boolean;
}

export interface ElectricalDef {
  nodes: ElectricalNodeDef[];
  edges: ElectricalEdgeDef[];
  source: string; // node id of the source
}

export interface ElectricalNodeDef {
  id: string;
  type: 'source' | 'load' | 'switch' | 'gate' | 'sink';
  x: number;
  y: number;
  /** Voltage drop / consumption. */
  v: number;
  /** Initial state. */
  state: 'energized' | 'deenergized';
}

export interface ElectricalEdgeDef {
  id: string;
  from: string;
  to: string;
  /** Path of tile positions. */
  path: { x: number; y: number }[];
  /** Initial state. */
  state: 'intact' | 'broken';
  /** Optional break point (tile index in path). */
  breakIndex?: number;
}

export interface CameraDef {
  regions: CameraRegion[];
  defaultZoom: number;
  pixelScale: number; // integer scaling factor
}

export interface CameraRegion {
  name: string;
  bounds: { x: number; y: number; w: number; h: number };
  zoom: number;
  music: string;
  ambience: string;
}

export interface MusicDef {
  dormant: string;
  awakening: string;
  powered: string;
  puzzle: string;
  manantial: string;
  credits: string;
}
