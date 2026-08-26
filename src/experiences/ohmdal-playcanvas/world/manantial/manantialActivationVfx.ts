import * as pc from 'playcanvas';

export interface ManantialActivationVfxDependencies {
  generatorLight: pc.Entity;
  activationTrace: pc.Entity;
  restoredOutputMarker: pc.Entity;
  reducedMotion: () => boolean;
  paused: () => boolean;
}

export interface ManantialActivationVfxHandle {
  setRestored(restored: boolean): void;
  update(dt: number): void;
  dispose(): void;
}

const EVENT_DURATION_SECONDS = 0.78;
const STABLE_LIGHT_INTENSITY = 2.2;

/**
 * Small deterministic event channel for the first useful generator output.
 * It owns only a dedicated local trace and the existing no-shadow indicator;
 * shared Plaza materials and the gameplay-owned rotor are never mutated.
 */
export function createManantialActivationVfx({
  generatorLight,
  activationTrace,
  restoredOutputMarker,
  reducedMotion,
  paused,
}: ManantialActivationVfxDependencies): ManantialActivationVfxHandle {
  const light = generatorLight.light!;
  let restored = false;
  let playing = false;
  let elapsed = 0;

  const settle = (): void => {
    playing = false;
    activationTrace.enabled = false;
    restoredOutputMarker.enabled = restored;
    light.intensity = restored ? STABLE_LIGHT_INTENSITY : 0;
  };

  const reset = (): void => {
    elapsed = 0;
    playing = false;
    activationTrace.enabled = false;
    restoredOutputMarker.enabled = false;
    light.intensity = 0;
  };

  return {
    setRestored(nextRestored) {
      if (!nextRestored) {
        restored = false;
        reset();
        return;
      }
      if (restored) return;
      restored = true;
      if (reducedMotion()) {
        settle();
        return;
      }
      elapsed = 0;
      playing = true;
      activationTrace.enabled = true;
      restoredOutputMarker.enabled = false;
    },
    update(dt) {
      if (!playing || paused()) return;
      elapsed = Math.min(EVENT_DURATION_SECONDS, elapsed + Math.max(0, dt));
      const progress = elapsed / EVENT_DURATION_SECONDS;
      const eased = progress * progress * (3 - 2 * progress);
      const pulse = Math.sin(Math.min(1, progress * 1.4) * Math.PI);
      activationTrace.setLocalPosition(
        2.2 + (0 - 2.2) * eased,
        2.0 + (2.7 - 2.0) * eased,
        16.0 + (20.2 - 16.0) * eased,
      );
      activationTrace.setLocalScale(0.18 + pulse * 0.18, 0.45 + pulse * 0.35, 0.18 + pulse * 0.18);
      light.intensity = 0.35 + pulse * 2.5 + eased * 0.9;
      if (elapsed >= EVENT_DURATION_SECONDS) settle();
    },
    dispose() {
      restored = false;
      reset();
    },
  };
}
