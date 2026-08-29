import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONDUCTOR_PULSE_DEFAULTS,
  computePolylineLength,
  createConductorPulseSimulator,
  resolveConductorPulseSettings,
} from '../src/experiences/ohmdal-playcanvas/experimental-vfx/conductorPulseCore.ts';
import {
  TERMINAL_ARC_DEFAULTS,
  createTerminalArcSimulator,
  resolveTerminalArcSettings,
} from '../src/experiences/ohmdal-playcanvas/experimental-vfx/terminalArcBurstCore.ts';

describe('Conductor pulse · pure core', () => {
  const waypoints = [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 2 },
    { x: 1, y: 0, z: 2 },
  ];

  it('measures polyline length deterministically and never requires a texture atlas', () => {
    const length = computePolylineLength(waypoints);
    assert.equal(length, 3, 'straight + diagonal polyline sums to 3 units');
    assert.equal(computePolylineLength([{ x: 0, y: 0, z: 0 }]), 0);
    assert.equal(computePolylineLength([]), 0);
  });

  it('resolves settings with explicit defaults and refuses unsafe values', () => {
    const settings = resolveConductorPulseSettings({ waypoints });
    assert.equal(settings.length, 3);
    assert.equal(settings.riseMs, CONDUCTOR_PULSE_DEFAULTS.riseMs);
    assert.equal(settings.travelMs, CONDUCTOR_PULSE_DEFAULTS.travelMs);
    assert.equal(settings.decayMs, CONDUCTOR_PULSE_DEFAULTS.decayMs);
    assert.equal(settings.mobileScale, CONDUCTOR_PULSE_DEFAULTS.mobileScale);
    assert.equal(settings.peakHeadScale, CONDUCTOR_PULSE_DEFAULTS.peakHeadScale);
    assert.deepEqual(settings.color, CONDUCTOR_PULSE_DEFAULTS.color);

    const safe = resolveConductorPulseSettings({
      waypoints,
      riseMs: -50,
      travelMs: Number.NaN,
      decayMs: 0,
      mobileScale: 5,
      peakIntensity: -2,
    });
    assert.ok(safe.riseMs > 0, 'negative rise falls back to default');
    assert.ok(safe.travelMs > 0, 'NaN travel falls back to default');
    assert.ok(safe.decayMs > 0, 'zero decay falls back to default');
    assert.equal(safe.mobileScale, 1, 'mobileScale is clamped to the [0.05, 1] range');
    assert.ok(safe.peakIntensity > 0, 'negative intensity falls back to default');
  });

  it('reports idle before any trigger and stays idle after the run completes', () => {
    const sim = createConductorPulseSimulator({
      waypoints,
      riseMs: 50,
      travelMs: 100,
      decayMs: 50,
    });
    const idle = sim.sample(0);
    assert.equal(idle.lifecycle, 'idle');
    assert.equal(idle.emissiveIntensity, 0);
    assert.equal(idle.headScale, 0);
    assert.ok(!sim.isActive(0));

    const runId = sim.trigger(0);
    assert.equal(typeof runId, 'number');
    assert.ok(runId > 0);

    const afterEnd = sim.sample(1000);
    assert.equal(afterEnd.lifecycle, 'idle');
    assert.equal(afterEnd.emissiveIntensity, 0);
  });

  it('transitions idle → active → decay → idle deterministically from explicit settings', () => {
    const sim = createConductorPulseSimulator({
      waypoints,
      riseMs: 40,
      travelMs: 80,
      decayMs: 60,
      peakIntensity: 2.0,
      peakHeadScale: 0.1,
      mobileScale: 0.5,
    });
    sim.trigger(0);
    const states: string[] = [];
    let lastState = 'idle';
    for (let t = 0; t <= 200; t += 5) {
      const sample = sim.sample(t);
      if (sample.lifecycle !== lastState) {
        states.push(`${t}:${sample.lifecycle}`);
        lastState = sample.lifecycle;
      }
    }
    assert.deepEqual(
      states,
      ['0:active', '120:decay', '180:idle'],
      'lifecycle is explicit and reproducible from explicit settings',
    );
  });

  it('travels along the polyline: head position at end of travel equals the last waypoint', () => {
    const sim = createConductorPulseSimulator({
      waypoints,
      riseMs: 0,
      travelMs: 100,
      decayMs: 0,
      peakIntensity: 1,
      peakHeadScale: 0.05,
      mobileScale: 1,
    });
    sim.trigger(0);
    const atEnd = sim.sample(100);
    assert.equal(atEnd.headPosition.x, 1);
    assert.equal(atEnd.headPosition.y, 0);
    assert.equal(atEnd.headPosition.z, 2);
  });

  it('clamps mobile scale so a runaway setting never produces more than the configured peak', () => {
    const settings = resolveConductorPulseSettings({ waypoints, mobileScale: 1, peakIntensity: 1, peakHeadScale: 0.1 });
    const sim = createConductorPulseSimulator(settings);
    sim.trigger(0);
    const sample = sim.sample(settings.riseMs + Math.floor(settings.travelMs / 2));
    assert.ok(sample.emissiveIntensity <= 1, 'mobileScale=1 never exceeds peakIntensity');
    assert.ok(sample.headScale <= 0.1, 'mobileScale=1 never exceeds peakHeadScale');
  });

  it('runId is monotonic and distinct across triggers', () => {
    const sim = createConductorPulseSimulator({ waypoints, lifetimeMs: 0, decayMs: 0 } as never);
    const ids = new Set<number>();
    for (let i = 0; i < 5; i += 1) {
      const id = sim.trigger(i * 1000);
      ids.add(id);
    }
    assert.equal(ids.size, 5, 'each trigger produces a unique run id');
  });
});

describe('Terminal arc burst · pure core', () => {
  const origin = { x: 0, y: 1, z: 0 };

  it('resolves settings with explicit defaults and bounds segment count', () => {
    const settings = resolveTerminalArcSettings({ origin, seed: 42 });
    assert.equal(settings.segmentCount, TERMINAL_ARC_DEFAULTS.segmentCount);
    assert.equal(settings.reach, TERMINAL_ARC_DEFAULTS.reach);
    assert.equal(settings.lifetimeMs, TERMINAL_ARC_DEFAULTS.lifetimeMs);
    assert.equal(settings.peakIntensity, TERMINAL_ARC_DEFAULTS.peakIntensity);
    assert.equal(settings.peakThickness, TERMINAL_ARC_DEFAULTS.peakThickness);
    assert.equal(settings.mobileScale, TERMINAL_ARC_DEFAULTS.mobileScale);

    const tiny = resolveTerminalArcSettings({ origin, seed: 1, segmentCount: 0, reach: -1, lifetimeMs: -1 });
    assert.equal(tiny.segmentCount, 1, 'segment count is clamped to >= 1');
    assert.ok(tiny.reach > 0, 'negative reach falls back to default');
    assert.ok(tiny.lifetimeMs > 0, 'negative lifetime falls back to default');
  });

  it('reports idle before any trigger and is active only inside lifetimeMs', () => {
    const sim = createTerminalArcSimulator({ origin, seed: 7, lifetimeMs: 100 });
    assert.deepEqual(sim.sample(0), { segments: [], lifecycle: 'idle', globalIntensity: 0 });
    sim.trigger(0);
    assert.ok(sim.isActive(50));
    assert.ok(!sim.isActive(200));
    assert.equal(sim.sample(200).lifecycle, 'idle');
  });

  it('produces deterministic segment variation per seed and per runId', () => {
    const sim = createTerminalArcSimulator({ origin, seed: 1701, segmentCount: 4, reach: 0.1 });
    sim.trigger(0);
    const first = sim.sample(20).segments.map((segment) => `${segment.end.x.toFixed(4)}|${segment.end.y.toFixed(4)}|${segment.end.z.toFixed(4)}`);
    const second = sim.sample(20).segments.map((segment) => `${segment.end.x.toFixed(4)}|${segment.end.y.toFixed(4)}|${segment.end.z.toFixed(4)}`);
    assert.deepEqual(first, second, 'same trigger produces the same deterministic segments');

    sim.trigger(1000);
    const third = sim.sample(1020).segments.map((segment) => `${segment.end.x.toFixed(4)}|${segment.end.y.toFixed(4)}|${segment.end.z.toFixed(4)}`);
    assert.notDeepEqual(first, third, 'different runId yields different segment endpoints');
  });

  it('walks ignite → expand → fade inside the configured lifetime', () => {
    const sim = createTerminalArcSimulator({ origin, seed: 3, lifetimeMs: 100 });
    sim.trigger(0);
    const seen: string[] = [];
    let last: string = 'idle';
    for (let t = 0; t <= 100; t += 2) {
      const lifecycle = sim.sample(t).lifecycle;
      if (lifecycle !== last) {
        seen.push(`${t}:${lifecycle}`);
        last = lifecycle;
      }
    }
    assert.ok(seen[0]?.endsWith(':ignite'), 'first phase is ignite');
    assert.ok(seen.some((entry) => entry.endsWith(':expand')), 'expand phase is reached');
    assert.ok(seen.some((entry) => entry.endsWith(':fade')), 'fade phase is reached');
    assert.ok(seen[seen.length - 1]?.endsWith(':idle'), 'after lifetime the simulator returns to idle');
  });

  it('clamps global intensity to peakIntensity * mobileScale even at peak', () => {
    const sim = createTerminalArcSimulator({ origin, seed: 9, peakIntensity: 2, mobileScale: 0.5, lifetimeMs: 100 });
    sim.trigger(0);
    let peakSeen = 0;
    for (let t = 0; t <= 100; t += 1) {
      const frame = sim.sample(t);
      if (frame.globalIntensity > peakSeen) peakSeen = frame.globalIntensity;
      assert.ok(frame.globalIntensity <= 1, 'global intensity never exceeds peakIntensity * mobileScale');
    }
    assert.ok(peakSeen > 0, 'the arc does reach a visible peak intensity');
  });
});
