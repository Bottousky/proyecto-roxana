export const STORED_SPARK_FILL_MS = 3000;
export const STORED_SPARK_DRAIN_MS = 3000;

export interface StoredSparkState {
  level: number;
  pathOpen: boolean;
}

export interface StoredSparkReading {
  channelFlow: number;
  discharging: boolean;
  lampLit: boolean;
}

export function createStoredSparkState(level = 0): StoredSparkState {
  return {
    level: clampLevel(level),
    pathOpen: false,
  };
}

export function setStoredSparkPath(
  state: StoredSparkState,
  pathOpen: boolean,
): StoredSparkState {
  return { ...state, pathOpen };
}

export function advanceStoredSpark(
  state: StoredSparkState,
  dtMs: number,
): StoredSparkState {
  const elapsed = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
  const rate = state.pathOpen
    ? 100 / STORED_SPARK_FILL_MS
    : -100 / STORED_SPARK_DRAIN_MS;
  return {
    ...state,
    level: clampLevel(state.level + elapsed * rate),
  };
}

export function storedSparkReading(state: StoredSparkState): StoredSparkReading {
  const channelFlow = state.pathOpen ? Math.max(0, 1 - state.level / 100) : 0;
  const discharging = !state.pathOpen && state.level > 0;
  return {
    channelFlow,
    discharging,
    lampLit: channelFlow > 0 || discharging,
  };
}

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.min(100, Math.max(0, level));
}
