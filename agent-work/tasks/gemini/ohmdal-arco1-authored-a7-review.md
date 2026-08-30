# Gemini peer task — A7 VFX, Audio y Ambiental authored pass

Act as the independent read-only reviewer for A7 of the Ohmdal Arco I authored
pass. Review only the supplied evidence. Do not edit files, run shell, invent
canon, redesign the validated route, or extrapolate later-region quality.

## Read only

- docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md
- docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md
- docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md
- ssets/references/hero-packs/ambient-vfx/hero-reference.json (in candidate branch/worktree)
- output/playwright/ohmdal-arco1-authored/a7-fast-iteration1/capture-manifest.json
- A7 player-facing captures in that directory:
  - estored-manantial.png
  - ell-activation.png
  - orge-core.png
  - lighthouse-lake-wide.png
- gent-work/reports/workers/ohmdal-authored-gemini-current.md (in candidate worktree)
- src/experiences/ohmdal-playcanvas/systems/vfx/ohmdalVfxSystem.ts (in candidate)
- src/experiences/ohmdal-plaza/audio/soundscape.ts (in candidate)
- src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts (in candidate)
- 	ests/ohmdal-vfx-audio-ambient.test.ts (in candidate)

## Facts supplied by Sol to verify against evidence

- A7 is an event-driven, physically grounded VFX and procedural audio pass across Arco I.
- VFX particle systems use pre-allocated static pools and transient lifecycles with zero permanent copper glow.
- Procedural soundscape synthesizes distinct acoustic environments for Plaza, Manantial, Castle, Forge/Terraces, and Lighthouse.
- Audio safely initializes under user-gesture policies with graceful SSR/Node fallback.
- FAST used local D3D11 hardware rendering; console and page errors are empty.
- Test suites and golden path pass 22/22 without regressions.

## Evaluate

1. Do VFX effects remain event-driven and physically motivated without permanent copper glow or persistent draw overhead?
2. Does the procedural soundscape provide distinct, evocative acoustic environments across all regions of Arco I?
3. Are particle budgets and mobile/reduced-motion scaling contracts properly respected?
4. Is there any performance, audio-engine, visual, or test regression?
5. Is there a player-facing, navigation, mobile/performance, or evidence blocker that justifies another A7 iteration before progressing to A8?

## Return

- VERDICT: PASS | PARTIAL | FAIL
- up to five prioritized findings with severity and exact evidence path
- PLAYER_FACING_BLOCKERS
- NON_BLOCKING_DEBT
- DO_NOT_FIX
- ANOTHER_A7_ITERATION: YES | NO
- whether Sol may accept A7 and advance loop to A8
