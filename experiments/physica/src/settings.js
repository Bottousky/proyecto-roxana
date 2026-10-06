// Player settings: volume, reduced motion, text size. Kept in localStorage when it is available;
// the game works the same without it (private windows, blocked storage).
// Reduced motion is stored only once the player chooses it (null until then): until that choice,
// the system preference rules, and ?reduced always turns it on.
const KEY = 'physica.ajustes.v1';
export const TEXT_SIZES = [{ value: 1, label: 'Normal' }, { value: 1.25, label: 'Grande' }, { value: 1.5, label: 'Muy grande' }];

export function defaults() { return { volume: 0.8, reduced: null, text: 1 }; }

/** Keep only valid values; anything else falls back to the default. */
export function sanitize(raw) {
  const d = defaults(), s = raw && typeof raw === 'object' ? raw : {};
  const volume = Number.isFinite(s.volume) ? Math.min(1, Math.max(0, s.volume)) : d.volume;
  const reduced = typeof s.reduced === 'boolean' ? s.reduced : d.reduced;
  const text = TEXT_SIZES.some(t => t.value === s.text) ? s.text : d.text;
  return { volume, reduced, text };
}

/** The reduced motion in effect: ?reduced forces it on; otherwise the player's choice, or the system's. */
export function effectiveReduced(settings, { forced = false, system = false } = {}) {
  return forced || (settings.reduced ?? system);
}

export function load(storage) {
  try { return sanitize(JSON.parse(storage?.getItem(KEY) ?? 'null')); }
  catch { return defaults(); }
}

export function save(storage, settings) {
  try { storage?.setItem(KEY, JSON.stringify(sanitize(settings))); return true; }
  catch { return false; }
}
