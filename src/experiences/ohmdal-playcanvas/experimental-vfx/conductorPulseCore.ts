/**
 * Ohmdal — experimental VFX: electric conductor pulse.
 *
 * Pure functional core. No PlayCanvas dependency, no DOM. Fully testable
 * through `node --experimental-strip-types`. The PlayCanvas shell
 * (`conductorPulse.ts`) consumes the snapshot and reflects it on entities.
 *
 * Design contract (mirrors `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`):
 *
 * - energy is an event, not wallpaper. There is no permanent copper emission.
 *   Idle state produces zero output and never schedules work.
 * - the pulse travels along a polyline defined by explicit `waypoints` from
 *   the caller. The runtime does not invent or extend the path.
 * - timing is deterministic from explicit settings (`riseMs`, `travelMs`,
 *   `decayMs`, `mobileScale`).
 * - lifecycle is explicit: idle → active → decay → idle.
 * - reusable independently from a specific zone.
 */

export type ConductorPulseLifecycleState = 'idle' | 'active' | 'decay';

export interface ConductorPulseSettings {
  /** Polyline sampled at runtime. Caller owns the geometry; minimum length 2. */
  waypoints: readonly { x: number; y: number; z: number }[];
  /** Total horizontal travel distance in world units (computed once). */
  length: number;
  /** Emissive color at the head of the pulse. */
  color: { r: number; g: number; b: number };
  /** Peak emissive intensity (linear). */
  peakIntensity: number;
  /** Head scale factor at peak (uniform; head is small). */
  peakHeadScale: number;
  /** How long the head takes to ramp from 0 to peak, in ms. */
  riseMs: number;
  /** How long the head takes to traverse the whole polyline, in ms. */
  travelMs: number;
  /** How long the trailing glow takes to fade after the head exits, in ms. */
  decayMs: number;
  /** Mobile scale multiplier applied to peak intensity and head scale. */
  mobileScale: number;
}

export interface ConductorPulseFrameSample {
  headPosition: { x: number; y: number; z: number };
  headScale: number;
  emissiveIntensity: number;
  lifecycle: ConductorPulseLifecycleState;
}

export interface ConductorPulseSimulator {
  /** Snapshot of the pulse at `nowMs`. */
  sample(nowMs: number): ConductorPulseFrameSample;
  /** True if the simulator has any work to do. */
  isActive(nowMs: number): boolean;
  /** Time (ms) when the simulator returns to idle. Stable for the active run. */
  endMs(): number;
  /** The settings that produced this simulator. */
  readonly settings: ConductorPulseSettings;
  /** When the current run was triggered. `null` while idle. */
  readonly triggeredAtMs: number | null;
  /** Monotonic run id. Bumps on every trigger. */
  readonly runId: number;
  /** Start a new run. Returns the assigned run id. */
  trigger(nowMs: number): number;
}

const DEFAULT_RISE_MS = 90;
const DEFAULT_TRAVEL_MS = 320;
const DEFAULT_DECAY_MS = 220;
const DEFAULT_PEAK_HEAD_SCALE = 0.08;
const DEFAULT_PEAK_INTENSITY = 2.4;
const DEFAULT_MOBILE_SCALE = 0.6;
const DEFAULT_COLOR = { r: 0.95, g: 0.6, b: 0.18 };

export const CONDUCTOR_PULSE_DEFAULTS = {
  riseMs: DEFAULT_RISE_MS,
  travelMs: DEFAULT_TRAVEL_MS,
  decayMs: DEFAULT_DECAY_MS,
  peakHeadScale: DEFAULT_PEAK_HEAD_SCALE,
  peakIntensity: DEFAULT_PEAK_INTENSITY,
  mobileScale: DEFAULT_MOBILE_SCALE,
  color: DEFAULT_COLOR,
} as const;

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function safePositive(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function lerpVec3(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  t: number,
): { x: number; y: number; z: number } {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function pointAtLength(
  waypoints: readonly { x: number; y: number; z: number }[],
  totalLength: number,
  distance: number,
): { x: number; y: number; z: number } {
  if (waypoints.length < 2 || totalLength <= 0) {
    const first = waypoints[0] ?? { x: 0, y: 0, z: 0 };
    return { x: first.x, y: first.y, z: first.z };
  }
  const clamped = clamp(distance, 0, totalLength);
  let remaining = clamped;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const a = waypoints[i]!;
    const b = waypoints[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const segmentLength = Math.hypot(dx, dy, dz);
    if (segmentLength <= 0) continue;
    if (remaining <= segmentLength) {
      const t = remaining / segmentLength;
      return lerpVec3(a, b, t);
    }
    remaining -= segmentLength;
  }
  const last = waypoints[waypoints.length - 1]!;
  return { x: last.x, y: last.y, z: last.z };
}

export function computePolylineLength(waypoints: readonly { x: number; y: number; z: number }[]): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const a = waypoints[i]!;
    const b = waypoints[i + 1]!;
    total += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }
  return total;
}

export function resolveConductorPulseSettings(
  partial: Partial<ConductorPulseSettings> & { waypoints: readonly { x: number; y: number; z: number }[] },
): ConductorPulseSettings {
  const waypoints = partial.waypoints;
  const length = partial.length ?? computePolylineLength(waypoints);
  return {
    waypoints,
    length,
    color: partial.color ?? DEFAULT_COLOR,
    peakIntensity: safePositive(partial.peakIntensity ?? DEFAULT_PEAK_INTENSITY, DEFAULT_PEAK_INTENSITY),
    peakHeadScale: safePositive(partial.peakHeadScale ?? DEFAULT_PEAK_HEAD_SCALE, DEFAULT_PEAK_HEAD_SCALE),
    riseMs: safePositive(partial.riseMs ?? DEFAULT_RISE_MS, DEFAULT_RISE_MS),
    travelMs: safePositive(partial.travelMs ?? DEFAULT_TRAVEL_MS, DEFAULT_TRAVEL_MS),
    decayMs: safePositive(partial.decayMs ?? DEFAULT_DECAY_MS, DEFAULT_DECAY_MS),
    mobileScale: clamp(partial.mobileScale ?? DEFAULT_MOBILE_SCALE, 0.05, 1),
  };
}

export interface ConductorPulseRun {
  runId: number;
  triggeredAtMs: number;
  settings: ConductorPulseSettings;
  activeEndMs: number;
  decayEndMs: number;
}

export function startConductorPulse(
  settings: ConductorPulseSettings,
  nowMs: number,
  runId: number,
): ConductorPulseRun {
  return {
    runId,
    triggeredAtMs: nowMs,
    settings,
    activeEndMs: nowMs + settings.riseMs + settings.travelMs,
    decayEndMs: nowMs + settings.riseMs + settings.travelMs + settings.decayMs,
  };
}

export function createConductorPulseSimulator(
  settingsInput: Partial<ConductorPulseSettings> & { waypoints: readonly { x: number; y: number; z: number }[] },
): ConductorPulseSimulator {
  const settings = resolveConductorPulseSettings(settingsInput);
  let currentRun: ConductorPulseRun | null = null;
  let nextRunId = 1;

  const sample = (nowMs: number): ConductorPulseFrameSample => {
    if (!currentRun) {
      return {
        headPosition: { x: settings.waypoints[0]?.x ?? 0, y: settings.waypoints[0]?.y ?? 0, z: settings.waypoints[0]?.z ?? 0 },
        headScale: 0,
        emissiveIntensity: 0,
        lifecycle: 'idle',
      };
    }
    const { triggeredAtMs, settings: runSettings, activeEndMs, decayEndMs } = currentRun;
    if (nowMs >= decayEndMs) {
      return {
        headPosition: {
          x: settings.waypoints[settings.waypoints.length - 1]?.x ?? 0,
          y: settings.waypoints[settings.waypoints.length - 1]?.y ?? 0,
          z: settings.waypoints[settings.waypoints.length - 1]?.z ?? 0,
        },
        headScale: 0,
        emissiveIntensity: 0,
        lifecycle: 'idle',
      };
    }
    const localMs = nowMs - triggeredAtMs;
    const riseMs = runSettings.riseMs;
    const travelMs = runSettings.travelMs;
    const decayMs = runSettings.decayMs;

    const headDistance = runSettings.length * clamp(localMs / Math.max(1, travelMs), 0, 1);
    const headPosition = pointAtLength(runSettings.waypoints, runSettings.length, headDistance);

    const riseProgress = riseMs > 0 ? clamp(localMs / riseMs, 0, 1) : 1;
    const riseEase = riseProgress * riseProgress * (3 - 2 * riseProgress);

    if (nowMs < activeEndMs) {
      const envelope = Math.sin(Math.min(1, localMs / Math.max(1, riseMs + travelMs)) * Math.PI);
      const peakHead = runSettings.peakHeadScale * runSettings.mobileScale;
      return {
        headPosition,
        headScale: peakHead * riseEase,
        emissiveIntensity: runSettings.peakIntensity * runSettings.mobileScale * Math.max(envelope, riseEase * 0.4),
        lifecycle: 'active',
      };
    }

    const decayLocal = nowMs - activeEndMs;
    const decayProgress = decayMs > 0 ? clamp(decayLocal / decayMs, 0, 1) : 1;
    const decayEase = 1 - decayProgress * decayProgress;
    const peakHead = runSettings.peakHeadScale * runSettings.mobileScale;
    return {
      headPosition,
      headScale: peakHead * riseEase * decayEase,
      emissiveIntensity: runSettings.peakIntensity * runSettings.mobileScale * decayEase * 0.6,
      lifecycle: 'decay',
    };
  };

  const trigger = (nowMs: number): number => {
    const assigned = nextRunId;
    nextRunId += 1;
    currentRun = startConductorPulse(settings, nowMs, assigned);
    return assigned;
  };

  return {
    sample,
    isActive(nowMs) {
      return currentRun !== null && nowMs < currentRun.decayEndMs;
    },
    endMs() {
      return currentRun?.decayEndMs ?? 0;
    },
    get settings() {
      return settings;
    },
    get triggeredAtMs() {
      return currentRun?.triggeredAtMs ?? null;
    },
    get runId() {
      return currentRun?.runId ?? 0;
    },
    trigger,
  };
}
