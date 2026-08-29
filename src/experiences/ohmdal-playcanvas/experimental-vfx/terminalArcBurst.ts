/**
 * Ohmdal — experimental VFX: terminal arc burst (PlayCanvas shell).
 *
 * Wraps the pure `TerminalArcSimulator` and renders its segments as
 * short cylinders parented to a dedicated root. The shell owns its own
 * materials, entities and lifecycle. It is not imported by the
 * canonical runtime.
 */

import * as pc from 'playcanvas';
import {
  TERMINAL_ARC_DEFAULTS,
  createTerminalArcSimulator,
  resolveTerminalArcSettings,
  type TerminalArcFrame,
  type TerminalArcSegment,
  type TerminalArcSettings,
  type TerminalArcSimulator,
} from './terminalArcBurstCore.ts';

export interface TerminalArcBurstHandle {
  trigger(): number;
  update(dtSeconds: number, paused?: boolean): TerminalArcFrame;
  isActive(): boolean;
  dispose(): void;
}

export interface TerminalArcBurstSceneDeps {
  parent: pc.Entity;
  reducedMotion?: () => boolean;
  namePrefix?: string;
}

function buildSegmentMaterial(intensity: number): pc.StandardMaterial {
  const mat = new pc.StandardMaterial();
  mat.name = 'experimental-terminal-arc-segment';
  mat.diffuse = new pc.Color(0, 0, 0);
  mat.emissive = new pc.Color(1.0, 0.85, 0.55);
  mat.emissiveIntensity = intensity;
  mat.useLighting = false;
  mat.cull = pc.CULLFACE_NONE;
  mat.depthWrite = false;
  mat.blendType = pc.BLEND_ADDITIVEALPHA;
  mat.opacity = 1;
  mat.update();
  return mat;
}

function orientSegment(
  entity: pc.Entity,
  start: { x: number; y: number; z: number },
  end: { x: number; y: number; z: number },
  thickness: number,
): void {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dy, dz);
  entity.setPosition((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
  if (length < 1e-4) {
    entity.setLocalScale(thickness, 0, thickness);
    entity.setLocalEulerAngles(0, 0, 0);
    return;
  }
  const up = new pc.Vec3(0, 1, 0);
  const direction = new pc.Vec3(dx / length, dy / length, dz / length);
  const quaternion = new pc.Quat().setFromAxisAngle(
    new pc.Vec3().cross(up, direction).normalize(),
    Math.acos(clampNumber(up.dot(direction), -1, 1)),
  );
  entity.setRotation(quaternion);
  entity.setLocalScale(thickness, length, thickness);
}

function clampNumber(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function createTerminalArcBurstVfx(
  deps: TerminalArcBurstSceneDeps,
  settingsInput: Partial<TerminalArcSettings> & { origin: { x: number; y: number; z: number }; seed: number },
): TerminalArcBurstHandle {
  const settings = resolveTerminalArcSettings(settingsInput);
  const prefix = deps.namePrefix ?? 'TerminalArcBurst';
  const root = new pc.Entity(`${prefix}Root`);
  deps.parent.addChild(root);
  root.enabled = false;

  const segmentMaterial = buildSegmentMaterial(0);
  const segments: pc.Entity[] = [];
  for (let i = 0; i < settings.segmentCount; i += 1) {
    const entity = new pc.Entity(`${prefix}Segment${i}`);
    entity.addComponent('render', { type: 'cylinder', material: segmentMaterial });
    entity.setLocalScale(0, 0, 0);
    root.addChild(entity);
    segments.push(entity);
  }

  const simulator: TerminalArcSimulator = createTerminalArcSimulator(settings);
  let nowMs = 0;
  let disposed = false;
  const reducedMotion = deps.reducedMotion ?? (() => false);

  const applyIdle = (): void => {
    root.enabled = false;
    segmentMaterial.emissiveIntensity = 0;
    segmentMaterial.opacity = 0;
    for (const segment of segments) {
      segment.setLocalScale(0, 0, 0);
    }
  };

  applyIdle();

  const reflect = (frame: TerminalArcFrame): void => {
    if (frame.lifecycle === 'idle' || frame.segments.length === 0) {
      applyIdle();
      return;
    }
    root.enabled = true;
    segmentMaterial.emissiveIntensity = frame.globalIntensity;
    segmentMaterial.opacity = Math.min(1, frame.globalIntensity / Math.max(0.001, settings.peakIntensity * settings.mobileScale));
    segmentMaterial.update();
    for (let i = 0; i < segments.length; i += 1) {
      const segmentFrame: TerminalArcSegment | undefined = frame.segments[i];
      const entity = segments[i]!;
      if (!segmentFrame) {
        entity.setLocalScale(0, 0, 0);
        continue;
      }
      orientSegment(entity, segmentFrame.start, segmentFrame.end, Math.max(0.001, segmentFrame.thickness));
    }
  };

  return {
    trigger() {
      if (disposed) return 0;
      const reduced = reducedMotion();
      const id = simulator.trigger(nowMs);
      if (reduced) {
        reflect(simulator.sample(nowMs + settings.lifetimeMs + 1));
      } else {
        root.enabled = true;
        reflect(simulator.sample(nowMs));
      }
      return id;
    },
    update(dtSeconds, isPaused) {
      if (disposed) return simulator.sample(nowMs);
      const safeDt = Number.isFinite(dtSeconds) && dtSeconds > 0 ? dtSeconds : 0;
      if (!isPaused) nowMs += safeDt * 1000;
      const frame = simulator.sample(nowMs);
      if (simulator.isActive(nowMs)) {
        reflect(frame);
      } else if (root.enabled) {
        applyIdle();
      }
      return frame;
    },
    isActive() {
      return !disposed && simulator.isActive(nowMs);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      applyIdle();
      if (root.parent) root.parent.removeChild(root);
      segmentMaterial.destroy();
    },
  };
}

export const _internals = {
  TERMINAL_ARC_DEFAULTS,
};
