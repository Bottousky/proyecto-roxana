export type Matter = 'amber' | 'teal';
export interface Unit { id: string; matter: Matter }
export interface Piece { id: string; units: Unit[]; width: number; x: number; z: number }
export interface Cell { id: string; matter: Matter; pieceId: string; index: number; x: number; z: number }
export interface Zone { id: string; x: number; z: number; width: number; depth: number; label: string; role: 'bridge' | 'bed' | 'pan' | 'sail' | 'basin' | 'wing' }
export type Rule = 'cover' | 'balance' | 'sails' | 'ratio' | 'flight';
export interface Chapter {
  id: string; title: string; subtitle: string; place: string; objective: string;
  arrival: string; restored: string; hints: string[]; journal: string; concept: string;
  palette: { sky: string; water: string; stone: string; accent: string };
  zones: Zone[]; seeds: Piece[]; rule: Rule; minPerZone?: number;
}
export interface Board { pieces: Piece[]; nextId: number }
export type Action =
  | { type: 'move'; id: string; x: number; z: number }
  | { type: 'reshape'; id: string; width: number }
  | { type: 'rotate'; id: string }
  | { type: 'split'; id: string; at: number }
  | { type: 'join'; ids: string[] };
export interface ZoneReading { id: string; count: number; amber: number; teal: number; satisfied: boolean; fill: number; imbalance: number }
export interface Evaluation { solved: boolean; zones: ZoneReading[]; outside: number; message: string }
export interface TransformResult { board: Board; changed: boolean; reason: string }
export interface SavedGame { version: 1; chapter: number; boards: Board[]; restored: string[]; journal: string[]; muted: boolean; reducedMotion: boolean }
export interface SceneCallbacks { pick: (cell: Cell) => void; move: (id: string, x: number, z: number) => void; hover?: (cell: Cell | null) => void }
export interface WorldView {
  load(chapter: Chapter, index: number, restored: number): void;
  update(board: Board, evaluation: Evaluation, selected: string | null): void;
  setLens(on: boolean): void;
  zoom(delta: number): void;
  resetCamera(): void;
  setReducedMotion(on: boolean): void;
  setPaused(on: boolean): void;
  celebrate(final: boolean): void;
  project(x: number, z: number): { x: number; y: number };
  dispose(): void;
}
