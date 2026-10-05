// Fixed-step driver. Rendering may run at any rate; the simulation only advances in whole
// DT steps, so the same inputs at the same simulated times give the same states. Long gaps
// (a hidden tab, a debugger pause) are not replayed: at most MAX_STEPS per frame, and a
// pause discards the accumulated time instead of catching up.
import { DT } from './world.js';

export const MAX_STEPS = 12;

export class FixedStepper {
  constructor(world) { this.world = world; this.acc = 0; this.paused = false; this.dropped = 0; }

  /** Advance by a real frame interval (seconds). Returns the interpolation factor in [0,1). */
  advance(frameDt, beforeStep) {
    if (this.paused) { this.acc = 0; return 0; }
    this.acc += Math.max(0, frameDt);
    let n = 0;
    while (this.acc >= DT && n < MAX_STEPS) { beforeStep?.(); this.world.step(); this.acc -= DT; n++; }
    if (this.acc >= DT) { this.dropped += Math.floor(this.acc / DT); this.acc %= DT; }
    return this.acc / DT;
  }

  pause() { this.paused = true; this.acc = 0; }
  resume() { this.paused = false; this.acc = 0; }
}
