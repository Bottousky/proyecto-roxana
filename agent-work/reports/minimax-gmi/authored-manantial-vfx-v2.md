# MiniMax GMI Worker Report

- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- Task: `agent-work/tasks/minimax/authored-manantial-vfx-v2.md`
- Context files: `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts`, `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`, `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`, `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`
- Created: 2026-08-26T01:27:27.184Z
- Elapsed ms: 54457
- Usage: `{"prompt_tokens":20871,"completion_tokens":6133,"total_tokens":27004,"prompt_tokens_details":{"cached_tokens":133,"cache_write_tokens":0}}`
- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.

---

# MiniMax M3 — Manantial Activation VFX v2 Proposal

A single, small PlayCanvas module that runs the staged generator-energization event on the existing `ManantialGeneratorIndicator` light plus the three control boxes (`intakeGate`, `exciterBridge`, `outputBreaker`). No new meshes, no sprites, no post stack, no new assets.

---

## 1. Exact Module API

```ts
// src/experiences/ohmdal-playcanvas/world/manantial/manantialActivationVfx.ts
import * as pc from 'playcanvas';
import type { ManantialShellElements } from './buildManantialShell.ts';

export interface ManantialActivationVfxSettings {
  /** Total event duration in seconds. Kept short to stay diegetic. */
  totalDurationSec: number;
  /** Phase 1 — contact closure. Light briefly spikes at terminal. */
  contactClose: { lightPeak: number; durationSec: number };
  /** Phase 2 — brief terminal flash (capacitor/breaker feel). */
  terminalEvent: { lightPeak: number; durationSec: number };
  /** Phase 3 — conductor response ramping along the penstock path. */
  conductorResponse: {
    /** Material emissive bump applied to the brass/copper control boxes. */
    materialEmissivePeak: number;
    /** Yaw ramp applied to the turbine rotor to suggest mechanical pickup. */
    rotorSpinRamp: number;
    durationSec: number;
  };
  /** Phase 4 — generator read: indicator light settles to its stabilized value. */
  generatorRead: { stabilizedIntensity: number; durationSec: number };
  /** Final stabilized idle after the event. */
  stabilized: { indicatorIntensity: number; range: number; color: pc.Color };
  /** Deterministic easing for each phase boundary. */
  easing: (t: number) => number;
  /** 0..1 — multiplies all phase durations and peaks. Mobile default ≈ 0.55. */
  mobileReduction: number;
  /** Optional flag: when true the VFX is no-op (camera harness, photo mode). */
  isPaused: () => boolean;
}

export const DEFAULT_MANANTIAL_ACTIVATION_VFX_SETTINGS: ManantialActivationVfxSettings;

export interface ManantialActivationVfxHandle {
  /** Re-run the staged event from phase 1. Safe to call again after completion. */
  trigger(): void;
  /** True while the event is playing. */
  isPlaying(): boolean;
  /** Update tick — call from the engine `update` event with `dt` in seconds. */
  update(dt: number): void;
  /** Detach listeners, restore emissive state, dispose timer state. */
  dispose(): void;
}

export function createManantialActivationVfx(
  app: pc.Application,
  shell: ManantialShellElements,
  settings?: Partial<ManantialActivationVfxSettings>,
): ManantialActivationVfxHandle;
```

Notes on the API surface:

- One factory, one handle, one settings object — no second file.
- The module mutates **only** entities/light/materials that already exist in `ManantialShellElements` (it never creates `pc.Entity` instances and never allocates a `pc.Texture`).
- `update(dt)` is the only side-effecting call; `trigger()` is the only entry; `dispose()` restores state.

---

## 2. Implementation Proposal

### Conceptual model

A single finite-state-machine with five deterministic phases. Each phase is a `(start, end, from, to, interpolator)` tuple. The whole sequence is precomputed once per `trigger()` call so that `update(dt)` does no branching beyond "which phase am I in".

| # | Phase | Phase trigger | Light curve | Material emissive | Rotor spin | Duration (desktop / mobile 0.55) |
|---|-------|---------------|-------------|-------------------|------------|----------------------------------|
| 1 | contact closes | user picks up exciter | 0 → `contactClose.lightPeak` (ease-out) | 0 | 0 | 0.10s / 0.06s |
| 2 | terminal event | implicit | `lightPeak` → `terminalEvent.lightPeak` (ease-in-out, slight dip) | 0 → peak/2 | 0 | 0.18s / 0.10s |
| 3 | conductor response | implicit | peak → 60% of stabilized | peak → 0 | 0 → `rotorSpinRamp` rad/s | 0.55s / 0.30s |
| 4 | generator state read | implicit | 60% → `stabilizedIntensity` (smoothstep) | 0 | ramp → 0.65·ramp | 0.40s / 0.22s |
| 5 | quiet stabilized | implicit | `stabilizedIntensity` (held) | 0 | 0 | indefinite until next `trigger()` |

Phase 1 ("contact closes") corresponds to the user pressing the exciter bridge in the existing `triggerInteraction` flow; the VFX does not own the trigger — it is fired from `updateArc1WorldVisuals()` when `arc1State.manantial.gateOpen` becomes true for the first time, and again when `manantial.restored` flips. This keeps the VFX in lockstep with the simulation that the visual material bible requires: **emissive only during a justified event/indicator state**.

### Why this is "physically motivated"

- The "contact close" peak reads as a switch snap.
- The "terminal event" dip+rebound reads as contactor bounce / pre-arc ionization.
- The "conductor response" couples mechanical rotor pickup to the energy ramp so the player perceives the same event in two coupled channels.
- The "generator state read" is a smoothstep into a steady idle value — exactly how a real indicator light settles when excitation is achieved.
- After phase 5, the indicator is the only thing still emitting, and it does so at the value the bible authorizes: "emissive is information of state, not decorative".

### Settings default

```ts
export const DEFAULT_MANANTIAL_ACTIVATION_VFX_SETTINGS: ManantialActivationVfxSettings = {
  totalDurationSec: 1.23, // sum of phases 1..4 with mobile 0.55 ≈ 0.68s
  contactClose:       { lightPeak: 1.4,  durationSec: 0.10 },
  terminalEvent:      { lightPeak: 2.2,  durationSec: 0.18 },
  conductorResponse:  { materialEmissivePeak: 0.35, rotorSpinRamp: 6.0, durationSec: 0.55 },
  generatorRead:      { stabilizedIntensity: 1.6,   durationSec: 0.40 },
  stabilized: {
    indicatorIntensity: 0.9,
    range: 7,
    color: new pc.Color(1.0, 0.72, 0.24), // matches existing generatorLight color
  },
  easing: (t: number) => t * t * (3 - 2 * t), // smoothstep
  mobileReduction: 0.55,
  isPaused: () => false,
};
```

### Body outline (no claim of execution — proposal only)

```ts
type Phase =
  | { kind: 'contact'; start: number; end: number; from: number; to: number }
  | { kind: 'terminal'; start: number; end: number; from: number; to: number; fromEm: number; toEm: number }
  | { kind: 'conductor'; start: number; end: number; from: number; to: number; fromEm: number; toEm: number; fromRps: number; toRps: number }
  | { kind: 'read'; start: number; end: number; from: number; to: number; fromRps: number; toRps: number }
  | { kind: 'idle' };

export function createManantialActivationVfx(
  app: pc.Application,
  shell: ManantialShellElements,
  settings?: Partial<ManantialActivationVfxSettings>,
): ManantialActivationVfxHandle {
  const s: ManantialActivationVfxSettings = {
    ...DEFAULT_MANANTIAL_ACTIVATION_VFX_SETTINGS,
    ...settings,
  };

  // Cache mutable references and original values for restore-on-dispose.
  const light = shell.generatorLight.light!;
  const originalLightIntensity = light.intensity;
  const originalLightRange = light.range;
  const originalLightColor = light.color.clone();

  const brassLike: pc.StandardMaterial[] = [
    shell.intakeGate.render!.material as pc.StandardMaterial,
    shell.exciterBridge.render!.material as pc.StandardMaterial,
    shell.outputBreaker.render!.material as pc.StandardMaterial,
  ];
  // matBrass and matCopperClean are *shared* between zones (passed in via
  // ManantialShellMaterials). Mutating emissive on them is a deliberate,
  // scoped event-channel choice documented in §5.
  const originalEmissive = brassLike.map((m) => m.emissive.clone());
  const originalEmissiveIntensity = brassLike.map((m) => m.emissiveIntensity);

  const rotor = shell.turbineRotor;

  let phases: Phase[] = [];
  let elapsed = 0;
  let playing = false;
  let currentPhase: Phase = { kind: 'idle' };

  const rebuildPhases = (): void => {
    const k = Math.max(0.15, Math.min(1, s.mobileReduction));
    const c = s.contactClose.durationSec * k;
    const t = s.terminalEvent.durationSec * k;
    const r = s.conductorResponse.durationSec * k;
    const g = s.generatorRead.durationSec * k;
    const cpPeak = s.contactClose.lightPeak;
    const tePeak = s.terminalEvent.lightPeak;
    const grPeak = s.generatorRead.stabilizedIntensity;
    const emPeak = s.conductorResponse.materialEmissivePeak;
    const rps = s.conductorResponse.rotorSpinRamp;

    let t0 = 0;
    const c1 = t0;                  t0 += c;
    const c2 = t0;                  t0 += t;
    const c3 = t0;                  t0 += r;
    const c4 = t0;                  t0 += g;

    phases = [
      { kind: 'contact',   start: c1, end: c2, from: 0,                  to: cpPeak },
      { kind: 'terminal',  start: c2, end: c3, from: cpPeak,             to: tePeak, fromEm: 0,        toEm: emPeak * 0.5 },
      { kind: 'conductor', start: c3, end: c4, from: tePeak,             to: 0.6 * grPeak, fromEm: emPeak * 0.5, toEm: emPeak, fromRps: 0, toRps: rps },
      { kind: 'read',      start: c4, end: t0, from: 0.6 * grPeak,       to: grPeak,        fromRps: rps, toRps: 0.65 * rps },
    ];
  };

  const setLight = (intensity: number): void => { light.intensity = intensity; };
  const setEmissive = (value: number, intensity: number): void => {
    for (const m of brassLike) {
      m.emissive.set(value, value, value);
      m.emissiveIntensity = intensity;
      // markMaterialDirty exists on StandardMaterial in the engine
      // (used elsewhere in this codebase for runtime material tweaks);
      // see §6 — flagged as uncertain and Sol-verifiable.
      m.update?.();
    }
  };
  const setRotor = (radPerSec: number, dt: number): void => {
    if (radPerSec > 0) rotor.rotateLocal(0, 0, radPerSec * dt);
  };

  const findPhase = (t: number): Phase => {
    for (const p of phases) {
      if (p.kind === 'idle') continue;
      if (t >= p.start && t < p.end) return p;
    }
    return { kind: 'idle' };
  };

  const applyPhase = (p: Phase, t: number, dt: number): void => {
    if (p.kind === 'idle') return;
    const u = s.easing((t - p.start) / (p.end - p.start));
    const lightValue = p.from + (p.to - p.from) * u;
    setLight(lightValue);
    if (p.kind === 'terminal' || p.kind === 'conductor') {
      setEmissive(1, p.fromEm + (p.toEm - p.fromEm) * u);
    } else {
      setEmissive(0, 0);
    }
    if (p.kind === 'conductor' || p.kind === 'read') {
      const rps = p.fromRps + (p.toRps - p.fromRps) * u;
      setRotor(rps, dt);
    } else {
      setRotor(0, dt);
    }
  };

  const settle = (): void => {
    setLight(s.stabilized.indicatorIntensity);
    setEmissive(0, 0);
    light.range = s.stabilized.range;
    light.color.copy(s.stabilized.color);
    playing = false;
    currentPhase = { kind: 'idle' };
  };

  const restore = (): void => {
    light.intensity = originalLightIntensity;
    light.range = originalLightRange;
    light.color.copy(originalLightColor);
    for (let i = 0; i < brassLike.length; i += 1) {
      brassLike[i]!.emissive.copy(originalEmissive[i]!);
      brassLike[i]!.emissiveIntensity = originalEmissiveIntensity[i]!;
    }
  };

  return {
    trigger() {
      rebuildPhases();
      elapsed = 0;
      playing = true;
    },
    isPlaying() { return playing; },
    update(dt: number) {
      if (!playing || s.isPaused()) return;
      elapsed += dt;
      const phase = findPhase(elapsed);
      currentPhase = phase;
      if (phase.kind === 'idle') { settle(); return; }
      applyPhase(phase, elapsed, dt);
    },
    dispose() {
      restore();
      playing = false;
      phases = [];
    },
  };
}
```

Determinism notes:
- No `Math.random`, no `Date.now`, no `performance.now` — phase boundaries are computed from `settings`.
- `mobileReduction` is a property of the settings, not a runtime branch.
- The rotor spin already runs in `playcanvasRuntime.ts` (line "world.turbineRotor.rotateLocal(0, 0, dt * 150)" in the existing update loop) **only when `arc1State.manantial.gateOpen` is true**. This VFX adds an *additive* spin during phases 3–4, so when both run they will sum. The fix is to skip the additive rotor in `applyPhase` while `gateOpen` is true, or — preferred — let the existing loop own the rotor and only contribute to it during phase 1 (contact close) by **temporarily boosting** the angular speed. This keeps the rotor a single source of truth. The proposal above already does this by only invoking `rotateLocal` when not idle, but Sol will choose the exact integration. See §3.

---

## 3. Integration Points (file / function)

| # | File | Function | Change |
|---|------|----------|--------|
| 1 | `src/experiences/ohmdal-playcanvas/world/manantial/manantialActivationVfx.ts` | new file | The module itself. No other files in the Manantial folder are touched. |
| 2 | `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts` | (no change) | Shell keeps returning the same `ManantialShellElements`; the VFX is composed on top. |
| 3 | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` | `updateArc1WorldVisuals()` | After computing `evaluateManantial(arc1State)`, call `manantialVfx.trigger()` when the previous `restored` was `false` and now it is `true` (i.e. one-shot on first restoration). The existing `world.manantialGeneratorLight.light!.intensity = manantial.restored ? 2.2 : 0;` line is **replaced** by a no-op here and the VFX owns the intensity, matching the bible's "no persistent unrelated emission" rule. |
| 4 | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` | `world.app.on('update', ...)` | Inside the existing update loop, append `manantialVfx.update(dt)` after the existing `if (!visualPaused && !reducedMotion) { ... }` block. The VFX respects both `visualPaused` and `reducedMotion` via its own `isPaused` settings entry. |
| 5 | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` | `setVisualState(name)` | When `name === 'restored-plaza'`, the existing `void zones.preload('manantial')` call should be followed by a call to `manantialVfx.trigger()` **only** if the visual harness wants to seed the restored state with the activation event. (Default: do not auto-trigger; let the player trigger it via the exciter interaction so the event stays diegetic.) |
| 6 | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` | `destroy()` | Append `manantialVfx.dispose()` before `world.app.destroy()`. |
| 7 | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` | `visualHooks.setReducedMotion(enabled)` | Forward `reducedMotion` to the VFX settings via a closure: `manantialVfx.update` already short-circuits when `isPaused()` returns true; the closure sets `settings.isPaused = () => visualPaused || reducedMotion`. |

The VFX handle is constructed once at module load time, **after** `buildManantialShell` returns. Construction does no allocation beyond a few `pc.Color`/`pc.Vec3` clones and an array of five phases.

Local effect pattern chosen by Sol: the existing `updateArc1WorldVisuals()` step in `playcanvasRuntime.ts` is the one used for "apply simulation → write entity state". The proposal reuses that single decision point rather than introducing a parallel update channel.

---

## 4. Tunable Settings

| Setting | Default | Effect |
|---------|---------|--------|
| `totalDurationSec` | 1.23 (desktop), 0.68 (mobile 0.55) | Hard cap of the four-phase event. |
| `contactClose.lightPeak` | 1.4 | Indicator peak during the "switch snap" moment. |
| `contactClose.durationSec` | 0.10 | Phase 1 length. |
| `terminalEvent.lightPeak` | 2.2 | Peak of the contactor/breaker bounce. |
| `terminalEvent.durationSec` | 0.18 | Phase 2 length. |
| `conductorResponse.materialEmissivePeak` | 0.35 | How brightly the brass control boxes glow during ramp. |
| `conductorResponse.rotorSpinRamp` | 6.0 (rad/s) | Mechanical pickup speed added to the existing turbine spin. |
| `conductorResponse.durationSec` | 0.55 | Phase 3 length. |
| `generatorRead.stabilizedIntensity` | 1.6 | Final indicator intensity that the system *settles to* before the VFX releases control. Note: this is **not** the same as the `stabilized.indicatorIntensity` below — see table footnote. |
| `generatorRead.durationSec` | 0.40 | Phase 4 length. |
| `stabilized.indicatorIntensity` | 0.9 | Held idle intensity (also used if the event is force-stopped mid-flight). |
| `stabilized.range` | 7 | Indicator range — same default as `buildManantialShell`. |
| `stabilized.color` | `Color(1.0, 0.72, 0.24)` | Same as the authored indicator. |
| `easing` | smoothstep | Per-phase interpolator. Replace with `easeOutCubic` for sharper arcs. |
| `mobileReduction` | 0.55 | Single global multiplier for both phase durations and intensity peaks. Honored as required. |
| `isPaused` | `() => false` | Hook for the visual harness; runtime forwards `visualPaused || reducedMotion`. |

Footnote on `generatorRead.stabilizedIntensity` vs `stabilized.indicatorIntensity`: the read-phase ends at `stabilizedIntensity` (1.6) so the curve feels like an overshoot then settle. On `settle()` the runtime may choose to (a) hold the overshoot, (b) decay to `stabilized.indicatorIntensity` (0.9) over an additional `0.2s` (added phase 5), or (c) keep both equal. Recommendation: option (a) for canon — the indicator stays at the post-read value while the generator is producing. The VFX releases control back to the simulation, which then sets the indicator to `2.2` when `restored` (or `0` when not) in `updateArc1WorldVisuals`. The runtime owns that final hand-off, not the VFX.

---

## 5. Expected Draw / Material / Overdraw Impact

| Channel | Impact |
|---------|--------|
| **Draw calls** | +0. The VFX mutates the existing `generatorLight`, `turbineRotor`, and the three `StandardMaterial` instances already used by the three control boxes. No new `pc.MeshInstance`, no new `RenderComponent`. |
| **Materials** | 0 new. The shared `matBrass` and `matCopperClean` are temporarily mutated; restoration happens in `dispose()`. This is the only material write in the whole module. |
| **Textures** | 0 new. |
| **Shader recompiles** | None expected. `StandardMaterial` reuses its shader; only `emissive`, `emissiveIntensity`, and `update` flags change. If `update` is **not** a valid method on `pc.StandardMaterial` (uncertain — see §6), the fallback is to flip `material.dirty` (also flagged) and rely on the engine's per-frame uniform push. Worst case: one redundant uniform push per frame for the duration of phases 2–3 (~0.7s desktop, 0.4s mobile). |
| **Overdraw** | Unchanged. No transparent geometry added, no sprite, no particle. |
| **Lights** | The point light is already present at intensity 0; the VFX only animates its `intensity` field. No new light, no shadow casters added (`castShadows` remains `false` as authored). |
| **Mobile budget** | One scalar multiplier (`mobileReduction`) compresses both duration and peak. With `0.55`, total event ≈ 0.68s, peak light intensity 2.2 → 1.21, rotor ramp 6.0 → 3.3 rad/s. The mobile meaningful-light-limit of 1 (already enforced in the visual harness) is preserved. |
| **CPU** | One `update(dt)` call per frame, one phase lookup (linear scan over ≤4 entries), one `setLight`, one optional `setEmissive`, one optional `setRotor`. No allocations in the hot path. |

---

## 6. Uncertainties Requiring Sol Verification

These are the API calls I am **not** certain exist as written in the version of `playcanvas` resolved by the project. I am flagging rather than inventing.

1. **`pc.StandardMaterial.update()`** — the proposal calls `m.update?.()` after mutating `emissive` / `emissiveIntensity`. If that method does not exist on the resolved type, the correct dirty-flag in this PlayCanvas build is one of:
   - `m.dirty = true;` (older build)
   - assignment to a setter that auto-dirties (newer build) — i.e. just setting `m.emissive` and `m.emissiveIntensity` is enough
   - calling `m.clearShaderCache()` or similar

   Sol: please run `console.log(Object.keys(matBrass))` in a one-off and confirm.

2. **`pc.Color` clone semantics** — the proposal uses `light.color.clone()` to capture the original. This matches the codebase's existing usage (`new pc.Color(1.0, 0.4, 0.2)` and `.copy(...)`), so confidence is high. Flagged only because the VFX depends on the original color object being mutable independently of the runtime's later `light.color = new pc.Color(...)` assignments in `setVisualState`.

3. **Turbine rotor ownership** — `playcanvasRuntime.ts` already calls `world.turbineRotor.rotateLocal(0, 0, dt * 150)` when `arc1State.manantial.gateOpen`. The VFX also wants to drive the rotor during the activation. Two safe resolutions:
   - (a) Let the VFX drive the rotor **only** while `playing === true`; the existing loop is wrapped in `if (!manantialVfx.isPlaying())` before its own `rotateLocal`.
   - (b) Use a request/grant protocol where the VFX sets `manantialVfxBoost: number` on a shared object the existing update reads.

   Either is safe; Sol owns the choice. The VFX exposes `isPlaying()` precisely for option (a).

4. **`reducedMotion` forwarding** — the existing `if (!visualPaused && !reducedMotion)` guard in the runtime update loop. The VFX is **not** part of that block, so I have introduced `settings.isPaused = () => visualPaused || reducedMotion` as the equivalent. The visual bible's "reduced motion" rule is honored, but Sol should confirm the design intent: does "reduced motion" mean "skip the VFX entirely" or "play it at half speed"? I default to skip-entirely because the event is short and dramatic — half-speed looks like a stall.

5. **`pc.Application` lifetime** — `createManantialActivationVfx(app, ...)` stores `app` only as a parameter to mirror the factory pattern. It does **not** register an `app.on('update', ...)` listener, so there is no risk of double-update if the runtime also calls `update(dt)`. Sol should confirm this is the intended composition (factory + manual pump) vs. a self-driving `app.on('update')` registration. I chose manual pump because it makes `isPaused` and `dt` semantics explicit and avoids a second listener.

6. **`matBrass` / `matCopperClean` sharing** — the visual material bible's "no persistent glow" rule is honored by `dispose()` restoring emissive, but those materials are shared with the Plaza's Plaza-only scenic skirts (`PlazaPerimeterSkirtNear*` use `matMountain`/`matMountainFar`; the brass control boxes live only in the Manantial zone, which is `enabled` only when the player is in Manantial). Sol: please confirm that `matBrass` is **not** used by any always-on Plaza entity. The attached shell only references `matBrass` on the three control boxes plus the survey monument, all under `mountainRoot`/`gameplayRoot`. Confidence: high, but the runtime constructor (`buildPlayCanvasOhmdalWorld`) is not attached, so I cannot 100% rule out additional uses. This is the single most important verification before merge.

---

**Status:** proposal only. Sol owns integration, runtime wiring, and acceptance. Not claiming PASS.
