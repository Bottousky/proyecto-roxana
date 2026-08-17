/**
 * Save / load system.
 *
 * Local-first. Versioned. Backwards-compatible: previous saves are
 * migrated forward when a field is missing. Saves are stored in
 * localStorage under the key "ohmdal-arco1-v1".
 *
 * State shape:
 *   {
 *     version: 1,
 *     flags: Record<string, true>,  // boolean flags
 *     counters: Record<string, number>,
 *     brokenEdges: EdgeId[],
 *     failedMeasurements: ModuleId[],
 *     lastRegion: string,
 *     lastPosition: { x: number; y: number },
 *     completedPuzzles: string[],
 *     awakeningTime: number | null,
 *     notes?: string,
 *   }
 */

export interface SaveState {
  version: number;
  flags: Record<string, true>;
  counters: Record<string, number>;
  brokenEdges: string[];
  failedMeasurements: string[];
  lastRegion: string;
  lastPosition: { x: number; y: number };
  completedPuzzles: string[];
  awakeningTime: number | null;
  notes?: string;
}

const STORAGE_KEY = 'ohmdal-arco1-save-v1';
const CURRENT_VERSION = 1;

export class SaveSystem {
  private state: SaveState;
  private dirty = false;
  private flushTimer: number | null = null;

  constructor(public readonly saveId: string) {
    this.state = this.makeDefault();
  }

  load(): SaveState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.state = this.makeDefault();
        return this.state;
      }
      const parsed = JSON.parse(raw) as SaveState;
      this.state = this.migrate(parsed);
    } catch (err) {
      console.warn('Save load failed; using defaults', err);
      this.state = this.makeDefault();
    }
    return this.state;
  }

  get(): SaveState {
    return this.state;
  }

  setFlag(flag: string, value: boolean = true): void {
    if (value) this.state.flags[flag] = true;
    else delete this.state.flags[flag];
    this.markDirty();
  }

  hasFlag(flag: string): boolean {
    return !!this.state.flags[flag];
  }

  setCounter(key: string, value: number): void {
    this.state.counters[key] = value;
    this.markDirty();
  }

  getCounter(key: string): number {
    return this.state.counters[key] ?? 0;
  }

  incrementCounter(key: string, by: number = 1): number {
    const next = (this.state.counters[key] ?? 0) + by;
    this.state.counters[key] = next;
    this.markDirty();
    return next;
  }

  setBrokenEdges(edges: string[]): void {
    this.state.brokenEdges = [...edges];
    this.markDirty();
  }

  addBrokenEdge(edge: string): void {
    if (!this.state.brokenEdges.includes(edge)) {
      this.state.brokenEdges.push(edge);
      this.markDirty();
    }
  }

  removeBrokenEdge(edge: string): void {
    this.state.brokenEdges = this.state.brokenEdges.filter((e) => e !== edge);
    this.markDirty();
  }

  setLastPosition(x: number, y: number, region: string): void {
    this.state.lastPosition = { x, y };
    this.state.lastRegion = region;
    this.markDirty();
  }

  markPuzzleComplete(puzzleId: string): void {
    if (!this.state.completedPuzzles.includes(puzzleId)) {
      this.state.completedPuzzles.push(puzzleId);
      this.markDirty();
    }
  }

  isPuzzleComplete(puzzleId: string): boolean {
    return this.state.completedPuzzles.includes(puzzleId);
  }

  setAwakeningTime(t: number | null): void {
    this.state.awakeningTime = t;
    this.markDirty();
  }

  reset(): void {
    this.state = this.makeDefault();
    this.markDirty();
    this.flush();
  }

  /**
   * Mark state as dirty. The actual write is debounced so that we don't
   * hammer localStorage during fast gameplay.
   */
  private markDirty(): void {
    this.dirty = true;
    if (this.flushTimer != null) return;
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, 250);
  }

  flush(): void {
    if (!this.dirty) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.dirty = false;
    } catch (err) {
      console.warn('Save flush failed', err);
    }
  }

  /**
   * Make the default starting state.
   */
  private makeDefault(): SaveState {
    return {
      version: CURRENT_VERSION,
      flags: {},
      counters: {},
      brokenEdges: ['c_main_south', 'c_puerta_to_ohm'],
      failedMeasurements: [],
      lastRegion: 'sendero_s',
      lastPosition: { x: 48, y: 60 },
      completedPuzzles: [],
      awakeningTime: null,
    };
  }

  /**
   * Migrate from older versions.
   */
  private migrate(input: SaveState): SaveState {
    const base = this.makeDefault();
    const merged: SaveState = {
      ...base,
      ...input,
      // preserve arrays/objects
      flags: { ...base.flags, ...input.flags },
      counters: { ...base.counters, ...input.counters },
      brokenEdges: input.brokenEdges ?? base.brokenEdges,
      failedMeasurements: input.failedMeasurements ?? base.failedMeasurements,
      completedPuzzles: input.completedPuzzles ?? base.completedPuzzles,
    };
    merged.version = CURRENT_VERSION;
    return merged;
  }
}
