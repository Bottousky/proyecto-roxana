export type SceneQuality = 'auto' | 'high' | 'low';
export interface VisitPreferences {
  quality: SceneQuality;
  motion: boolean;
  labels: boolean;
  sound: boolean;
}
export const PREFERENCES_KEY = 'roxana-visit-v1';

export function defaultPreferences(reducedMotion = false): VisitPreferences {
  return { quality: 'auto', motion: reducedMotion, labels: true, sound: false };
}

export function parsePreferences(
  raw: string | null,
  reducedMotion = false,
): VisitPreferences {
  const defaults = defaultPreferences(reducedMotion);
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return defaults;
    const data = value as Record<string, unknown>;
    return {
      quality:
        data.quality === 'high' || data.quality === 'low'
          ? data.quality
          : 'auto',
      motion: typeof data.motion === 'boolean' ? data.motion : defaults.motion,
      labels: typeof data.labels === 'boolean' ? data.labels : defaults.labels,
      sound: typeof data.sound === 'boolean' ? data.sound : defaults.sound,
    };
  } catch {
    return defaults;
  }
}

export function systemReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

export function readPreferences(): VisitPreferences {
  try {
    return parsePreferences(
      localStorage.getItem(PREFERENCES_KEY),
      systemReducedMotion(),
    );
  } catch {
    return defaultPreferences(systemReducedMotion());
  }
}

export function savePreferences(preferences: VisitPreferences): boolean {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}
