/**
 * Ohmdal — experimental VFX: electric conductor pulse (PlayCanvas shell).
 *
 * Wraps the pure `ConductorPulseSimulator` and reflects its snapshot on a
 * dedicated small entity hierarchy (head + thin trailing trail). The module
 * owns its own materials, entities and lifecycle. It does not import the
 * canonical runtime and is not imported by it.
 */

import * as pc from 'playcanvas';
import {
  CONDUCTOR_PULSE_DEFAULTS,
  createConductorPulseSimulator,
  resolveConductorPulseSettings,
  type ConductorPulseFrameSample,
  type ConductorPulseSettings,
  type ConductorPulseSimulator,
} from './conductorPulseCore.ts';

export interface ConductorPulseHandle {
  trigger(): number;
  update(dtSeconds: number, paused?: boolean): ConductorPulseFrameSample;
  isActive(): boolean;
  dispose(): void;
}

export interface ConductorPulseSceneDeps {
  /** Entity the pulse hierarchy will be parented to. The shell does not
   *  enable/disable the parent. The caller decides when the parent is on. */
  parent: pc.Entity;
  /** Reduced motion preference. When true the pulse collapses to a single
   *  frame so the player still sees a state change but no animation. */
  reducedMotion?: () => boolean;
  /** Optional prefix used to name children. Useful when two pulses coexist. */
  namePrefix?: string;
}

const TRAIL_SEGMENTS = 4;
const TRAIL_FALLOFF = 0.55;

function buildHeadMaterial(color: ConductorPulseSettings['color'], intensity: number): pc.StandardMaterial {
  const mat = new pc.StandardMaterial();
  mat.name = 'experimental-conductor-pulse-head';
  mat.diffuse = new pc.Color(color.r * 0.6, color.g * 0.6, color.b * 0.6);
  mat.emissive = new pc.Color(color.r, color.g, color.b);
  mat.emissiveIntensity = intensity;
  mat.useLighting = false;
  mat.cull = pc.CULLFACE_NONE;
  mat.depthWrite = false;
  mat.blendType = pc.BLEND_ADDITIVEALPHA;
  mat.update();
  return mat;
}

function buildTrailMaterial(color: ConductorPulseSettings['color']): pc.StandardMaterial {
  const mat = new pc.StandardMaterial();
  mat.name = 'experimental-conductor-pulse-trail';
  mat.diffuse = new pc.Color(0, 0, 0);
  mat.emissive = new pc.Color(color.r, color.g, color.b);
  mat.emissiveIntensity = 0.0;
  mat.useLighting = false;
  mat.cull = pc.CULLFACE_NONE;
  mat.depthWrite = false;
  mat.blendType = pc.BLEND_ADDITIVEALPHA;
  mat.opacity = 0.0;
  mat.update();
  return mat;
}

export function createConductorPulseVfx(
  deps: ConductorPulseSceneDeps,
  settingsInput: Partial<ConductorPulseSettings> & { waypoints: readonly { x: number; y: number; z: number }[] },
): ConductorPulseHandle {
  if (settingsInput.waypoints.length < 2) {
    throw new Error('createConductorPulseVfx requires at least two waypoints');
  }
  const settings = resolveConductorPulseSettings(settingsInput);
  const prefix = deps.namePrefix ?? 'ConductorPulse';
  const root = new pc.Entity(`${prefix}Root`);
  deps.parent.addChild(root);
  root.enabled = false;

  const headMaterial = buildHeadMaterial(settings.color, 0);
  const head = new pc.Entity(`${prefix}Head`);
  head.addComponent('render', { type: 'sphere', material: headMaterial });
  head.setLocalScale(0, 0, 0);
  root.addChild(head);

  const trailMaterial = buildTrailMaterial(settings.color);
  const trailSegments: pc.Entity[] = [];
  for (let i = 0; i < TRAIL_SEGMENTS; i += 1) {
    const segment = new pc.Entity(`${prefix}Trail${i}`);
    segment.addComponent('render', { type: 'sphere', material: trailMaterial });
    segment.setLocalScale(0, 0, 0);
    root.addChild(segment);
    trailSegments.push(segment);
  }

  const simulator: ConductorPulseSimulator = createConductorPulseSimulator(settings);
  let nowMs = 0;
  let paused = false;
  let disposed = false;

  const reducedMotion = deps.reducedMotion ?? (() => false);

  const applyIdle = (): void => {
    root.enabled = false;
    head.setLocalScale(0, 0, 0);
    headMaterial.emissiveIntensity = 0;
    headMaterial.opacity = 0;
    for (const segment of trailSegments) {
      segment.setLocalScale(0, 0, 0);
    }
    trailMaterial.opacity = 0;
    trailMaterial.emissiveIntensity = 0;
  };

  applyIdle();

  const reflect = (sample: ConductorPulseFrameSample): void => {
    head.setPosition(sample.headPosition.x, sample.headPosition.y, sample.headPosition.z);
    const headScale = sample.headScale;
    head.setLocalScale(headScale, headScale, headScale);
    headMaterial.emissiveIntensity = sample.emissiveIntensity;
    headMaterial.opacity = sample.lifecycle === 'idle' ? 0 : 1;
    headMaterial.update();

    if (sample.lifecycle === 'active' || sample.lifecycle === 'decay') {
      root.enabled = true;
    }

    const intensity = sample.emissiveIntensity;
    trailMaterial.opacity = Math.min(1, intensity / Math.max(0.001, settings.peakIntensity * settings.mobileScale));
    trailMaterial.emissiveIntensity = intensity * 0.6;
    trailMaterial.update();
    for (let i = 0; i < trailSegments.length; i += 1) {
      const falloff = Math.pow(TRAIL_FALLOFF, i + 1);
      const scale = headScale * falloff;
      const segment = trailSegments[i]!;
      const offsetDistance = (i + 1) * (settings.length * 0.012);
      const dx = sample.headPosition.x;
      const dy = sample.headPosition.y;
      const dz = sample.headPosition.z;
      segment.setPosition(dx, dy, dz - offsetDistance);
      segment.setLocalScale(scale, scale, scale);
    }
  };

  return {
    trigger() {
      if (disposed) return 0;
      const reduced = reducedMotion();
      const id = simulator.trigger(nowMs);
      if (reduced) {
        const sample = simulator.sample(nowMs + settings.riseMs + settings.travelMs + settings.decayMs + 1);
        reflect(sample);
      } else {
        root.enabled = true;
        reflect(simulator.sample(nowMs));
      }
      return id;
    },
    update(dtSeconds, isPaused) {
      if (disposed) return simulator.sample(nowMs);
      const safeDt = Number.isFinite(dtSeconds) && dtSeconds > 0 ? dtSeconds : 0;
      paused = isPaused ?? paused;
      if (!paused) nowMs += safeDt * 1000;
      const sample = simulator.sample(nowMs);
      if (simulator.isActive(nowMs)) {
        root.enabled = true;
        reflect(sample);
      } else {
        reflect({
          headPosition: {
            x: settings.waypoints[settings.waypoints.length - 1]!.x,
            y: settings.waypoints[settings.waypoints.length - 1]!.y,
            z: settings.waypoints[settings.waypoints.length - 1]!.z,
          },
          headScale: 0,
          emissiveIntensity: 0,
          lifecycle: 'idle',
        });
        if (root.enabled) applyIdle();
      }
      return sample;
    },
    isActive() {
      return !disposed && simulator.isActive(nowMs);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      applyIdle();
      if (root.parent) root.parent.removeChild(root);
      headMaterial.destroy();
      trailMaterial.destroy();
    },
  };
}

export const _internals = {
  CONDUCTOR_PULSE_DEFAULTS,
  TRAIL_SEGMENTS,
};
