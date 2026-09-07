import * as pc from 'playcanvas';
import {
  createFirstClassPracticeModel,
} from '../../systems/story/firstClassPracticeModel.ts';
import type {
  FirstClassDemonstrationPhase,
  FirstClassPracticeReadout,
  FirstClassSourceSnapshot,
} from '../../systems/story/firstClassPracticeModel.ts';

export type {
  FirstClassDemonstrationPhase,
  FirstClassPracticeReadout,
  FirstClassSourceSnapshot,
} from '../../systems/story/firstClassPracticeModel.ts';

export interface FirstClassDemonstrationMaterials {
  /** Matte surface for the small practice bench and board. */
  board?: pc.StandardMaterial;
  /** Dark metal for the instrument housing and needle. */
  metal?: pc.StandardMaterial;
  /** Copper/brass material for contacts and bridge. */
  conductor?: pc.StandardMaterial;
  /** Low-key material for the local practice lamp. */
  glow?: pc.StandardMaterial;
}

export interface FirstClassDemonstration {
  /** One semantic root for the practice fixture. */
  readonly root: pc.Entity;
  /** The local practice phase; it never mirrors campaign state. */
  readonly phase: FirstClassDemonstrationPhase;
  /** True only after the local closed-loop readout has been verified. */
  readonly verified: boolean;
  /** True when the physical bridge has completed its 1.25s travel. */
  readonly readyToVerify: boolean;
  /** Read-only initial evidence captured from the local practice circuit. */
  readonly sourceSnapshot: FirstClassSourceSnapshot;
  getReadout(): FirstClassPracticeReadout;
  setPhase(phase: FirstClassDemonstrationPhase): void;
  update(dt: number, reducedMotion: boolean): void;
  reset(): void;
  dispose(): void;
}

const PRACTICE_ORIGIN = new pc.Vec3(2.45, 0, -5.0);
const BRIDGE_ANIMATION_DURATION = 1.25;
// The closed contact is at world (1.95, 1.1, -4.85), the reach point of the
// authored Edda Operate clip. It remains below both characters' faces.
const BRIDGE_OPEN_POSITION = new pc.Vec3(-0.18, 1.34, 0.15);
const BRIDGE_CLOSED_POSITION = new pc.Vec3(-0.5, 1.1, 0.15);
const NEEDLE_OPEN_ANGLE = 58;
const NEEDLE_CLOSED_ANGLE = -22;
const PRACTICE_GAUGE_FULL_SCALE_CURRENT = 3;

function createDefaultMaterial(
  name: string,
  diffuse: pc.Color,
  metalness: number,
  gloss: number,
): pc.StandardMaterial {
  const material = new pc.StandardMaterial();
  material.name = name;
  material.diffuse = diffuse;
  material.useMetalness = true;
  material.metalness = metalness;
  material.gloss = gloss;
  material.update();
  return material;
}

function addPrimitive(
  parent: pc.Entity,
  name: string,
  type: 'box' | 'cylinder' | 'sphere',
  material: pc.StandardMaterial,
  position: readonly [number, number, number],
  scale: readonly [number, number, number],
  euler: readonly [number, number, number],
  worldLayer: pc.Layer | undefined,
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material });
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalScale(scale[0], scale[1], scale[2]);
  entity.setLocalEulerAngles(euler[0], euler[1], euler[2]);
  if (entity.render) {
    entity.render.castShadows = true;
    entity.render.receiveShadows = true;
    if (worldLayer) entity.render.layers = [worldLayer.id];
  }
  parent.addChild(entity);
  return entity;
}

/**
 * Creates the local first-class practice fixture between Edda and Lumen.
 * The board is a visual projection of the pure model above; it has no input
 * listener and no connection to the campaign circuit.
 */
export function createFirstClassDemonstration(
  app: pc.Application,
  parent: pc.Entity,
  materials: FirstClassDemonstrationMaterials = {},
): FirstClassDemonstration {
  const worldLayer = app.scene.layers.getLayerByName('World') ?? undefined;
  const boardMaterial = materials.board
    ?? createDefaultMaterial('FirstClassPracticeBoardMaterial', new pc.Color(0.22, 0.18, 0.14), 0.05, 0.32);
  const metalMaterial = materials.metal
    ?? createDefaultMaterial('FirstClassPracticeMetalMaterial', new pc.Color(0.13, 0.15, 0.16), 0.72, 0.48);
  const conductorMaterial = materials.conductor
    ?? createDefaultMaterial('FirstClassPracticeConductorMaterial', new pc.Color(0.58, 0.27, 0.09), 0.66, 0.42);
  const glowMaterial = materials.glow
    ?? createDefaultMaterial('FirstClassPracticeGlowMaterial', new pc.Color(0.9, 0.56, 0.16), 0.1, 0.28);
  const gaugeMaterial = createDefaultMaterial('FirstClassGaugeFace', new pc.Color(0.84, 0.8, 0.65), 0, 0.18);

  const model = createFirstClassPracticeModel();
  const root = new pc.Entity('FirstClassDemonstrationRoot');
  root.tags.add('ohmdal-first-class-demonstration');
  root.tags.add('semantic-prop');
  root.setLocalPosition(PRACTICE_ORIGIN);
  parent.addChild(root);

  addPrimitive(root, 'FirstClassPracticeBench', 'box', boardMaterial,
    [0, 0.85, 0], [1.55, 0.12, 0.65], [0, 0, 0], worldLayer);
  for (const x of [-0.62, 0.62]) for (const z of [-0.22, 0.22]) {
    addPrimitive(root, `FirstClassBenchLeg${x}-${z}`, 'box', boardMaterial,
      [x, 0.42, z], [0.09, 0.84, 0.09], [0, 0, 0], worldLayer);
  }
  addPrimitive(root, 'FirstClassPracticeBoard', 'box', boardMaterial,
    [0, 0.95, 0], [1.55, 0.08, 0.62], [0, 0, 0], worldLayer);
  addPrimitive(root, 'FirstClassReturnContactA', 'cylinder', conductorMaterial,
    [-0.78, 1.1, 0.15], [0.11, 0.18, 0.11], [0, 0, 0], worldLayer);
  addPrimitive(root, 'FirstClassReturnContactB', 'cylinder', conductorMaterial,
    [-0.22, 1.1, 0.15], [0.11, 0.18, 0.11], [0, 0, 0], worldLayer);
  const bridge = addPrimitive(root, 'FirstClassReturnBridge', 'box', conductorMaterial,
    [BRIDGE_OPEN_POSITION.x, BRIDGE_OPEN_POSITION.y, BRIDGE_OPEN_POSITION.z],
    [0.78, 0.09, 0.09], [0, 0, 16], worldLayer);
  addPrimitive(root, 'FirstClassGaugeRim', 'cylinder', conductorMaterial,
    [0.36, 1.18, 0.32], [0.44, 0.08, 0.44], [90, 0, 0], worldLayer);
  addPrimitive(root, 'FirstClassGaugeFace', 'cylinder', gaugeMaterial,
    [0.36, 1.18, 0.37], [0.38, 0.018, 0.38], [90, 0, 0], worldLayer);
  for (let tick = 0; tick <= 6; tick += 1) {
    const angle = (58 - tick * 80 / 6) * Math.PI / 180;
    addPrimitive(root, `FirstClassGaugeTick${tick}`, 'box', metalMaterial,
      [0.36 + Math.cos(angle) * 0.15, 1.18 + Math.sin(angle) * 0.15, 0.386],
      [0.022, 0.008, 0.009], [0, 0, angle * 180 / Math.PI], worldLayer);
  }
  const needle = new pc.Entity('FirstClassGalvanoscopeNeedle');
  needle.setLocalPosition(0.36, 1.18, 0.40);
  root.addChild(needle);
  addPrimitive(needle, 'FirstClassGaugePointer', 'box', metalMaterial,
    [0.067, 0, 0], [0.14, 0.015, 0.012], [0, 0, 0], worldLayer);
  const lamp = addPrimitive(root, 'FirstClassPracticeLamp', 'sphere', glowMaterial,
    [0.68, 1.04, 0.16], [0.13, 0.13, 0.13], [0, 0, 0], worldLayer);
  const lampLight = new pc.Entity('FirstClassPracticeLampLight');
  lampLight.setLocalPosition(0.68, 1.1, 0.16);
  lampLight.addComponent('light', {
    type: 'omni',
    color: new pc.Color(1.0, 0.52, 0.16),
    intensity: 0,
    range: 2.2,
    castShadows: false,
  });
  if (lampLight.light && worldLayer) lampLight.light.layers = [worldLayer.id];
  root.addChild(lampLight);

  let disposed = false;
  let bridgeProgress = 0;
  let bridgeMotionElapsed = BRIDGE_ANIMATION_DURATION;
  let needleAngle = NEEDLE_OPEN_ANGLE;
  let lampWasLit: boolean | null = null;

  const bridgeSettled = (): boolean => bridgeProgress >= 1 - Number.EPSILON;

  const getPresentedReadout = (): FirstClassPracticeReadout => {
    const readout = model.getReadout();
    if (!readout.bridgeClosed || bridgeSettled()) return readout;
    // The solver has already accepted the local contact, but the presentation
    // waits for the physical bridge to arrive before showing light/complete.
    return { ...readout, lightOn: false, complete: false };
  };

  const targetNeedleAngle = (readout: FirstClassPracticeReadout, settled: boolean): number => {
    if (!settled || !readout.complete) return NEEDLE_OPEN_ANGLE;
    const currentFraction = Math.max(0, Math.min(1, readout.current / PRACTICE_GAUGE_FULL_SCALE_CURRENT));
    return NEEDLE_OPEN_ANGLE + (NEEDLE_CLOSED_ANGLE - NEEDLE_OPEN_ANGLE) * currentFraction;
  };

  const syncVisuals = (immediate: boolean): void => {
    const readout = model.getReadout();
    const targetProgress = readout.bridgeClosed ? 1 : 0;
    const visuallySettled = bridgeSettled();
    const targetNeedle = targetNeedleAngle(readout, visuallySettled);
    if (immediate) {
      bridgeProgress = targetProgress;
      bridgeMotionElapsed = BRIDGE_ANIMATION_DURATION;
      needleAngle = targetNeedle;
    }
    const nextBridge = new pc.Vec3(
      BRIDGE_OPEN_POSITION.x + (BRIDGE_CLOSED_POSITION.x - BRIDGE_OPEN_POSITION.x) * bridgeProgress,
      BRIDGE_OPEN_POSITION.y + (BRIDGE_CLOSED_POSITION.y - BRIDGE_OPEN_POSITION.y) * bridgeProgress,
      BRIDGE_OPEN_POSITION.z + (BRIDGE_CLOSED_POSITION.z - BRIDGE_OPEN_POSITION.z) * bridgeProgress,
    );
    bridge.setLocalPosition(nextBridge);
    bridge.setLocalEulerAngles(0, 0, 16 * (1 - bridgeProgress));
    needle.setLocalEulerAngles(0, 0, needleAngle);
    if (lampLight.light) lampLight.light.intensity = readout.lightOn && visuallySettled ? 1.1 : 0;
    const lit = readout.lightOn && visuallySettled;
    if (lit !== lampWasLit) {
      lampWasLit = lit;
      glowMaterial.emissive.set(1, 0.34, 0.05);
      glowMaterial.emissiveIntensity = lit ? 2 : 0;
      glowMaterial.update();
    }
    lamp.enabled = true;
  };

  const setPhase = (phase: FirstClassDemonstrationPhase): void => {
    if (disposed) return;
    if (phase === 'verify' && !bridgeSettled()) return;
    model.setPhase(phase);
    if (phase === 'observe') {
      bridgeProgress = 0;
      bridgeMotionElapsed = BRIDGE_ANIMATION_DURATION;
    } else if (phase === 'operate' && bridgeProgress < 1) {
      bridgeMotionElapsed = 0;
    }
    syncVisuals(false);
  };

  const reset = (): void => {
    if (disposed) return;
    model.reset();
    bridgeProgress = 0;
    bridgeMotionElapsed = BRIDGE_ANIMATION_DURATION;
    needleAngle = NEEDLE_OPEN_ANGLE;
    syncVisuals(true);
  };

  syncVisuals(true);

  return {
    root,
    get phase() { return model.phase; },
    get verified() { return model.verified && bridgeSettled(); },
    get readyToVerify() { return model.getReadout().complete && bridgeSettled(); },
    get sourceSnapshot() { return model.sourceSnapshot; },
    getReadout: getPresentedReadout,
    setPhase,
    update(dt, reducedMotion) {
      if (disposed) return;
      const safeDt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.25)) : 0;
      const readout = model.getReadout();
      const targetProgress = readout.bridgeClosed ? 1 : 0;
      if (reducedMotion) {
        bridgeProgress = targetProgress;
        bridgeMotionElapsed = BRIDGE_ANIMATION_DURATION;
      } else if (targetProgress === 1 && bridgeProgress < 1) {
        bridgeMotionElapsed = Math.min(BRIDGE_ANIMATION_DURATION, bridgeMotionElapsed + safeDt);
        bridgeProgress = Math.min(1, bridgeMotionElapsed / BRIDGE_ANIMATION_DURATION);
      } else if (targetProgress === 0 && bridgeProgress > 0) {
        bridgeMotionElapsed = Math.min(BRIDGE_ANIMATION_DURATION, bridgeMotionElapsed + safeDt);
        bridgeProgress = Math.max(0, 1 - bridgeMotionElapsed / BRIDGE_ANIMATION_DURATION);
      }
      const targetNeedle = targetNeedleAngle(readout, bridgeSettled());
      const needleBlend = reducedMotion ? 1 : Math.min(1, safeDt * 8);
      needleAngle += (targetNeedle - needleAngle) * needleBlend;
      if (reducedMotion) needleAngle = targetNeedle;
      syncVisuals(false);
    },
    reset,
    dispose() {
      if (disposed) return;
      disposed = true;
      root.destroy();
    },
  };
}
