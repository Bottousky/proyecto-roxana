// Tipos de datos del slice.
export interface Vec2 { x: number; y: number; }
export type Facing = 'up' | 'down' | 'left' | 'right';

export type ObjDef =
  | { kind: 'spawn'; id: string; x: number; y: number }
  | { kind: 'warp'; x: number; y: number; to: string; spawn: [number, number]; lockedBy?: keyof SliceFlags; label?: string; blockSprite?: string }
  | { kind: 'npc'; id: string; x: number; y: number; sprite: string; dialogue: string; visibleIf?: keyof SliceFlags; hideIf?: keyof SliceFlags }
  | { kind: 'sign'; id: string; x: number; y: number; dialogue: string }
  | { kind: 'prop'; id: string; x: number; y: number; sprite: string; tint?: number; solid?: boolean; glow?: boolean }
  | { kind: 'interact'; id: string; x: number; y: number; sprite: string; puzzle: string; tint?: number; solid?: boolean; glow?: boolean; label?: string };

export interface MapDef {
  id: string;
  name: string;
  ambient: string;
  w: number;
  h: number;
  base: number; // frame de suelo por defecto
  border?: number; // frame de muro del borde (default 5)
  fills?: { rect: [number, number, number, number]; tile: number }[];
  points?: { at: [number, number][]; tile: number }[];
  objects: ObjDef[];
}

export interface SliceFlags {
  arrived: boolean;
  solvedClosedCircuit: boolean;
  metEdda: boolean;
  metLumen: boolean;
  hasProbe: boolean;
  solvedConductor: boolean;
  solvedSeries: boolean;
  stabilizedCore: boolean;
  arcComplete: boolean;
}

export interface SliceState {
  map: string;
  x: number;
  y: number;
  flags: SliceFlags;
  journal: string[]; // ids de entradas desbloqueadas
  objective: string; // id de objetivo actual
}
