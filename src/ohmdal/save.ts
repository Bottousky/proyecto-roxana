// Guardado simple del slice en localStorage.
import type { SliceState, SliceFlags } from './types.ts';

const KEY = 'ohmdal-slice-v1';

const DEFAULT_FLAGS: SliceFlags = {
  arrived: false,
  solvedClosedCircuit: false,
  metEdda: false,
  metLumen: false,
  hasProbe: false,
  solvedConductor: false,
  solvedSeries: false,
  stabilizedCore: false,
  arcComplete: false,
};

export const slice: SliceState = {
  map: 'MAP_OHMDAL_01_PORTAL_GLADE',
  x: 160,
  y: 60,
  flags: { ...DEFAULT_FLAGS },
  journal: [],
  objective: 'obj_arrive',
};

export function hasSave(): boolean {
  return localStorage.getItem(KEY) !== null;
}

export function saveSlice(): void {
  localStorage.setItem(KEY, JSON.stringify(slice));
}

export function loadSlice(): void {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as Partial<SliceState>;
    slice.map = data.map ?? slice.map;
    slice.x = data.x ?? slice.x;
    slice.y = data.y ?? slice.y;
    slice.flags = { ...DEFAULT_FLAGS, ...(data.flags ?? {}) };
    slice.journal = data.journal ?? [];
    slice.objective = data.objective ?? slice.objective;
  } catch {
    /* save corrupto: empezar de cero */
  }
}

export function resetSlice(): void {
  localStorage.removeItem(KEY);
  slice.map = 'MAP_OHMDAL_01_PORTAL_GLADE';
  slice.x = 160;
  slice.y = 60;
  slice.flags = { ...DEFAULT_FLAGS };
  slice.journal = [];
  slice.objective = 'obj_arrive';
}

export function setFlag(name: keyof SliceFlags): void {
  slice.flags[name] = true;
  saveSlice();
}
