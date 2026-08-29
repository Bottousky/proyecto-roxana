/**
 * Ohmdal — experimental VFX: terminal arc burst (pure core).
 *
 * Deterministic, seeded, single-shot micro-arc event for a contact/terminal
 * transition. No ambient/repeating fantasy lightning.
 *
 * Contract:
 * - brief, physically readable event with explicit lifetime;
 * - seeded variation so two triggers in the same frame differ;
 * - explicit lifecycle: idle → ignite → expand → fade → idle;
 * - explicit disposal: `dispose()` clears state, no further output;
 * - no new dependency, no DOM, no PlayCanvas.
 */

export type TerminalArcLifecycleState = 'idle' | 'ignite' | 'expand' | 'fade';

export interface TerminalArcSettings {
  /** Origin in world space. */
  origin: { x: number; y: number; z: number };
  /** Number of arc segments to render (3–6 is a sane range). */
  segmentCount: number;
  /** Maximum reach of the longest segment, in world units. */
  reach: number;
  /** Total lifetime in ms (ignite + expand + fade). */
  lifetimeMs: number;
  /** Peak emissive intensity. */
  peakIntensity: number;
  /** Peak thickness of the segments (world units, before mobile scale). */
  peakThickness: number;
  /** Mobile scale multiplier. */
  mobileScale: number;
  /** Seed for the deterministic RNG. */
  seed: number;
}

export interface TerminalArcSegment {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  thickness: number;
  intensity: number;
}

export interface TerminalArcFrame {
  segments: TerminalArcSegment[];
  lifecycle: TerminalArcLifecycleState;
  globalIntensity: number;
}

export interface TerminalArcSimulator {
  /** Snapshot at `nowMs`. */
  sample(nowMs: number): TerminalArcFrame;
  isActive(nowMs: number): boolean;
  endMs(): number;
  readonly settings: TerminalArcSettings;
  readonly runId: number;
  trigger(nowMs: number): number;
}

const DEFAULT_SEGMENT_COUNT = 4;
const DEFAULT_REACH = 0.08;
const DEFAULT_LIFETIME_MS = 110;
const DEFAULT_PEAK_INTENSITY = 3.0;
const DEFAULT_PEAK_THICKNESS = 0.012;
const DEFAULT_MOBILE_SCALE = 0.6;

export const TERMINAL_ARC_DEFAULTS = {
  segmentCount: DEFAULT_SEGMENT_COUNT,
  reach: DEFAULT_REACH,
  lifetimeMs: DEFAULT_LIFETIME_MS,
  peakIntensity: DEFAULT_PEAK_INTENSITY,
  peakThickness: DEFAULT_PEAK_THICKNESS,
  mobileScale: DEFAULT_MOBILE_SCALE,
} as const;

function safeNonNegative(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function mulberry32(seed: number): () => number {
  let state = (seed | 0) >>> 0;
  if (state === 0) state = 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function resolveTerminalArcSettings(
  partial: Partial<TerminalArcSettings> & { origin: { x: number; y: number; z: number }; seed: number },
): TerminalArcSettings {
  const segmentCount = Math.max(1, Math.min(8, Math.round(partial.segmentCount ?? DEFAULT_SEGMENT_COUNT)));
  return {
    origin: partial.origin,
    segmentCount,
    reach: safeNonNegative(partial.reach ?? DEFAULT_REACH, DEFAULT_REACH),
    lifetimeMs: safeNonNegative(partial.lifetimeMs ?? DEFAULT_LIFETIME_MS, DEFAULT_LIFETIME_MS),
    peakIntensity: safeNonNegative(partial.peakIntensity ?? DEFAULT_PEAK_INTENSITY, DEFAULT_PEAK_INTENSITY),
    peakThickness: safeNonNegative(partial.peakThickness ?? DEFAULT_PEAK_THICKNESS, DEFAULT_PEAK_THICKNESS),
    mobileScale: clamp(partial.mobileScale ?? DEFAULT_MOBILE_SCALE, 0.05, 1),
    seed: partial.seed | 0,
  };
}

export interface TerminalArcRun {
  runId: number;
  triggeredAtMs: number;
  settings: TerminalArcSettings;
  seed: number;
  endMs: number;
  segments: ReadonlyArray<TerminalArcSegment>;
}

function generateRunSegments(settings: TerminalArcSettings, seed: number): TerminalArcSegment[] {
  const rng = mulberry32(seed);
  const segments: TerminalArcSegment[] = [];
  const count = settings.segmentCount;
  for (let i = 0; i < count; i += 1) {
    const theta = rng() * Math.PI * 2;
    const phi = (rng() - 0.5) * Math.PI;
    const reach = settings.reach * (0.4 + rng() * 0.6);
    const end = {
      x: settings.origin.x + Math.cos(theta) * Math.cos(phi) * reach,
      y: settings.origin.y + Math.sin(phi) * reach,
      z: settings.origin.z + Math.sin(theta) * Math.cos(phi) * reach,
    };
    segments.push({
      start: { x: settings.origin.x, y: settings.origin.y, z: settings.origin.z },
      end,
      thickness: settings.peakThickness * (0.6 + rng() * 0.4),
      intensity: 0.7 + rng() * 0.3,
    });
  }
  return segments;
}

export function startTerminalArc(
  settings: TerminalArcSettings,
  nowMs: number,
  runId: number,
): TerminalArcRun {
  const seed = (settings.seed + runId * 0x9e3779b1) | 0;
  return {
    runId,
    triggeredAtMs: nowMs,
    settings,
    seed,
    endMs: nowMs + settings.lifetimeMs,
    segments: generateRunSegments(settings, seed),
  };
}

export function createTerminalArcSimulator(
  settingsInput: Partial<TerminalArcSettings> & { origin: { x: number; y: number; z: number }; seed: number },
): TerminalArcSimulator {
  const settings = resolveTerminalArcSettings(settingsInput);
  let currentRun: TerminalArcRun | null = null;
  let nextRunId = 1;
  const idleFrame: TerminalArcFrame = { segments: [], lifecycle: 'idle', globalIntensity: 0 };

  const sample = (nowMs: number): TerminalArcFrame => {
    if (!currentRun) return idleFrame;
    if (nowMs >= currentRun.endMs) return idleFrame;
    const local = nowMs - currentRun.triggeredAtMs;
    const lifetime = currentRun.settings.lifetimeMs;
    if (lifetime <= 0 || local < 0) return idleFrame;
    const ignite = currentRun.settings.lifetimeMs * 0.15;
    const expand = currentRun.settings.lifetimeMs * 0.4;
    let lifecycle: TerminalArcLifecycleState;
    let envelope: number;
    if (local < ignite) {
      lifecycle = 'ignite';
      const t = clamp(local / ignite, 0, 1);
      envelope = t * t;
    } else if (local < ignite + expand) {
      lifecycle = 'expand';
      const t = clamp((local - ignite) / expand, 0, 1);
      envelope = 1 - 0.15 * t;
    } else {
      lifecycle = 'fade';
      const t = clamp((local - ignite - expand) / Math.max(1, lifetime - ignite - expand), 0, 1);
      envelope = 1 - t;
    }
    const peak = currentRun.settings.peakIntensity * currentRun.settings.mobileScale;
    const globalIntensity = peak * envelope;
    const reachMultiplier = lifecycle === 'ignite' ? envelope : lifecycle === 'expand' ? 1 : 1 - 0.3 * envelope;
    const thicknessMultiplier = lifecycle === 'fade' ? 0.4 + 0.6 * envelope : 0.6 + 0.4 * envelope;
    const segments: TerminalArcSegment[] = currentRun.segments.map((segment) => ({
      start: { x: segment.start.x, y: segment.start.y, z: segment.start.z },
      end: {
        x: currentRun!.settings.origin.x + (segment.end.x - currentRun!.settings.origin.x) * reachMultiplier,
        y: currentRun!.settings.origin.y + (segment.end.y - currentRun!.settings.origin.y) * reachMultiplier,
        z: currentRun!.settings.origin.z + (segment.end.z - currentRun!.settings.origin.z) * reachMultiplier,
      },
      thickness: segment.thickness * thicknessMultiplier,
      intensity: segment.intensity * envelope,
    }));
    return { segments, lifecycle, globalIntensity };
  };

  return {
    sample,
    isActive(nowMs) {
      return currentRun !== null && nowMs < currentRun.endMs;
    },
    endMs() {
      return currentRun?.endMs ?? 0;
    },
    get settings() {
      return settings;
    },
    get runId() {
      return currentRun?.runId ?? 0;
    },
    trigger(nowMs) {
      const id = nextRunId;
      nextRunId += 1;
      currentRun = startTerminalArc(settings, nowMs, id);
      return id;
    },
  };
}
