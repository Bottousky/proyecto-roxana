# OpenCode tool-enabled trial — MiniMax M3 / GMI Cloud

> Evaluation of MiniMax M3 with real filesystem/terminal/build tools for an
> experimental VFX module inside `src/experiences/ohmdal-playcanvas/experimental-vfx/**`.
> Self-evaluation only. **SELF_ACCEPTANCE: false**.

## Harness

- OpenCode CLI on Windows (`win32`), PowerShell 7.
- Provider: GMI Cloud (native OpenCode provider).
- Model: `MiniMaxAI/MiniMax-M3`.
- Isolated worktree/branch: `worker/minimax-vfx` at `C:\YO\Proyectos\Roxana-minimax`.
- Node v24.14.1, TypeScript 5.6.3 (project-bundled), Vite 6.x.

## Authority and boundaries respected

- Read only `AGENTS.md`, `docs/20-worlds/ohmdal/AGENTS.md`,
  `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`,
  `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`, the existing
  `manantialActivationVfx.ts` (as a reference pattern, not modified), and the
  parts of `playcanvasWorld.ts` and `playcanvasRuntime.ts` needed to
  understand the project's PlayCanvas conventions.
- **No edits** to `playcanvasRuntime.ts`, `playcanvasWorld.ts`, or any
  authored/world file outside the exclusive scope.
- **No integration**: `grep` for `experimental-vfx` across `src/`, `scripts/`
  and `tests/` returns only the task spec itself; nothing imports the new
  modules.
- **No engine/dependency upgrades** (`package.json` untouched).
- **No paid spend** (no Meshy/Tripo calls).
- **No stage status changes**; no `agent-work/loops/**` edits.
- **No merge** performed.

## Base SHA and branch

- Base: `59b0cdf` (`chore(harness): add quota-aware multi-model execution`).
- Branch: `worker/minimax-vfx` (already created and tracking
  `origin/explore/ohmdal-3D`).
- Candidate commit SHA: see *Candidate commit SHA* at the end (filled in
  after `git commit` runs).

## Elapsed time

- Wall-clock: ~14 minutes from first read to `npm run build` green. This
  includes installing `node_modules` (which the worktree did not have),
  authoring four TS files, authoring the test file, fixing one TypeScript
  warning and re-running build + tests.

## Files created

```
src/experiences/ohmdal-playcanvas/experimental-vfx/conductorPulseCore.ts    (pure, no PC)
src/experiences/ohmdal-playcanvas/experimental-vfx/conductorPulse.ts        (PC shell)
src/experiences/ohmdal-playcanvas/experimental-vfx/terminalArcBurstCore.ts  (pure, no PC)
src/experiences/ohmdal-playcanvas/experimental-vfx/terminalArcBurst.ts      (PC shell)
tests/ohmdal-minimax-opencode-vfx.test.ts                                    (12 tests, pure core only)
```

No existing files modified.

## What was built

Two composable, deterministic, settings-driven technical-art modules
following the conventions of the existing `manantialActivationVfx.ts`:

### 1. `conductorPulse` — electric conductor pulse

- Pure core (`conductorPulseCore.ts`): deterministic head position along a
  caller-supplied polyline, explicit `riseMs`/`travelMs`/`decayMs`
  timings, `mobileScale` clamped to `[0.05, 1]`, monotonic `runId`,
  explicit lifecycle `idle → active → decay → idle`, no ambient emission.
- PC shell (`conductorPulse.ts`): owns its own root entity, one
  emissive sphere head, four additive trail segments, additive blend,
  no shadow caster, no texture atlas. Reduced-motion preference collapses
  the run to a single state-change frame.

### 2. `terminalArcBurst` — terminal micro-arc

- Pure core (`terminalArcBurstCore.ts`): mulberry32-seeded segment
  variation, `lifetimeMs` in three phases `ignite → expand → fade → idle`,
  global intensity clamped to `peakIntensity * mobileScale`, segment
  count bounded to `[1, 8]`, no ambient/repeating emission.
- PC shell (`terminalArcBurst.ts`): own root, one cylinder segment per
  arc, additive blend, dynamic per-frame orientation, no shadow caster,
  no texture atlas, no light components.

Both shells expose `trigger()`, `update(dt, paused?)`, `isActive()`,
`dispose()` — mirroring the existing `ManantialActivationVfxHandle`
contract. They are not imported by any other module.

## First-pass build result

- First `tsc -p .` invocation failed with one error:
  `src/experiences/ohmdal-playcanvas/experimental-vfx/terminalArcBurstCore.ts(177,11): error TS6133: 'progress' is declared but its value is never read.`
- Caused by leaving a leftover local in the `sample()` function after
  refactoring the phase computation to use explicit per-phase windows.
- Repair: removed the unused local. No other code changes.

## Self-repairs after compiler/test feedback

- **Compiler repairs**: 1 (one unused-local). No API-shape errors. The PC
  types in `playcanvas@2.21.x` matched the patterns I expected from
  reading `playcanvasWorld.ts`.
- **Test repairs**: 0. All 12 tests passed on the first run after the
  TS fix.

Total self-repairs: **1** (single TypeScript unused-local fix).

## Final build and test result

- `tsc -p .` (project-wide): **clean, no output**.
- `npm run build` (tsc + vite build): **green**, completed with the
  pre-existing large-bundle warnings (Babylon, Three.js), none of them
  related to the new modules — the new code is not even imported by
  the existing entry points, so it is not bundled into `dist/`.
- `node --experimental-strip-types tests/ohmdal-minimax-opencode-vfx.test.ts`:
  **12/12 pass** across 2 suites in ~50 ms.
- Existing test `ohmdal-zone-lifecycle.test.ts`: still **OK** (sanity
  re-run; not part of the trial's required commands but executed to
  ensure I did not regress an unrelated test by touching the shared
  `tsconfig` include path or types).

## APIs and assumptions that required correction

- **No PC API corrections**: I started from the existing project
  conventions (`new pc.Entity(...)`, `addComponent('render', { type: 'box' | 'cylinder' | 'sphere', material })`,
  `pc.StandardMaterial.emissive/emissiveIntensity`, `pc.Color`,
  `pc.Vec3`, `pc.Quat.setFromAxisAngle`) and the new code compiles
  against `playcanvas@2.21.4` without further correction.
- **One assumption correction**: my first pass computed a single
  normalised `progress` value and then branched by phase. The cleaner
  shape (and what I shipped) derives per-phase envelopes from explicit
  `lifetimeMs * 0.15` and `lifetimeMs * 0.4` windows. The unused
  `progress` local triggered the only TS error and was removed.
- **Test design assumption**: I deliberately put the bulk of the
  state/timing/settings logic in the pure `*Core.ts` files so that
  `node --experimental-strip-types` (no DOM, no PlayCanvas) can cover
  it. The PC shells are thin adapters and were not separately
  tested in this trial; they are not part of the required test
  surface and adding PlayCanvas test doubles would be the kind of
  "large framework" the task warned against.

## Integration-worthiness

- **Yes**, the result is shaped well to be plugged into the canonical
  runtime: same `Handle` interface style as `ManantialActivationVfxHandle`,
  same per-tick `update(dt, paused?)` calling convention, same
  `dispose()` lifecycle, and the same
  `reducedMotion: () => boolean` / `paused: () => boolean` injection
  pattern that the runtime already passes to its existing VFX.
- Integration should not be performed by M3. Per the task, this is
  proposal-only and acceptance belongs to ChatGPT/Sol + Manuel.
- The two effects are deliberately small. Wiring them into the
  authoritative VFX/audio plan (`OHMDAL_VFX_AUDIO_PLAN.md`) and
  per-zone builders is work for a Gemini/Luna pass with the
  authored loop and `playcanvasWorld.ts` in view.

## WOULD_PAY_FOR_THIS_OUTPUT: **yes**

The output was produced in roughly 14 minutes of wall-clock time
including dependency installation, and the result is a small,
deterministic, settings-driven, mobile-conscious pair of technical-art
modules that match the project's existing `ManantialActivationVfxHandle`
shape. The pure-core split means the bulk of the logic is exercised
by 12 fast, dependency-free tests — something that a proposal-only
M3 (text in, text out) cannot guarantee. The trial delivered
real evidence: a green `tsc`, a green `npm run build`, and 12/12
passing tests, with only one self-repair (a single unused-local TS
error). That is materially more useful than a markdown-only proposal
of the same module, and the work did not touch canonical runtime,
world files, or any authored stage. The reason to still mark
acceptance as `false` is that integration into `playcanvasWorld.ts`
or the authored zone builders is a separate, gated step and must
remain under ChatGPT/Sol/Manuel authority.

## Candidate commit SHA

- The introducing commit is the tip of `worker/minimax-vfx` at the time
  this report was written. Use `git log -1 --format=%H worker/minimax-vfx`
  to read the literal SHA. The subject is
  `feat(ohmdal-experimental-vfx): conductor pulse + terminal arc burst (M3/OpenCode trial)`
  and the diffstat is 6 new files / 0 modifications of existing files.

## SELF_ACCEPTANCE: **false**
