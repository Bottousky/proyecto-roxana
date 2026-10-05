// Guardado local. La partida y las preferencias viven separadas en este navegador.

export const SAVE_KEY = 'roxana.arithmos.v1';
export const SETTINGS_KEY = 'roxana.arithmos.settings.v1';
export const VERSION = 1;

export const DEFAULT_SETTINGS = {
  textScale: 1,
  clean: false,
  textSpeed: 'normal', // instant | fast | normal | slow
  autoAdvance: false,
  describe: false,
  reducedMotion: null, // null = seguir la preferencia del sistema
  master: 0.8,
  music: 0.7,
  sfx: 0.8,
};

export function newState() {
  return {
    version: VERSION,
    chapter: 1,
    segment: null,
    flags: {},
    scratch: {},
    evidence: [],
    journal: [],
    completed: [],
    moments: [],
    log: [],
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
}

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function validState(s) {
  return !!s && typeof s === 'object' && s.version === VERSION && typeof s.flags === 'object' && Array.isArray(s.evidence)
    && Array.isArray(s.completed) && typeof s.scratch === 'object';
}

export function loadState(store = storage()) {
  try {
    const raw = store?.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!validState(s)) return null;
    s.journal ??= [];
    s.moments ??= [];
    s.log ??= [];
    return s;
  } catch {
    return null;
  }
}

export function saveState(state, store = storage()) {
  if (!store) return false;
  state.updatedAt = new Date().toISOString();
  if (state.log.length > 300) state.log = state.log.slice(-300);
  if (state.evidence.length > 2000) state.evidence = state.evidence.slice(-2000);
  try {
    store.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(store = storage()) {
  try { store?.removeItem(SAVE_KEY); } catch { /* sin almacenamiento */ }
}

export function loadSettings(store = storage()) {
  try {
    const raw = store?.getItem(SETTINGS_KEY);
    return {...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {})};
  } catch {
    return {...DEFAULT_SETTINGS};
  }
}

export function saveSettings(settings, store = storage()) {
  try { store?.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* sin almacenamiento */ }
}
