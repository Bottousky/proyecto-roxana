# Ohmdal Arco I — Authored Pass Loop

## Mission

Convert the accepted playable Arco I greybox into a coherent authored vertical slice across the whole route while preserving the validated gameplay, electrical model, zone lifecycle and Plaza baseline.

Baseline:

- technical hardening: `dec2d75abc0adbcddb37988b3955cef4950513f3`
- complete Arco I playable greybox: `b8bb4128868fcafd9b5b2083682b2aea7dad1cb9`
- closed greybox loop: `74abaadb0b569bdc91171886d6799ba49464b082`
- report: `agent-work/reports/ohmdal-arco1-greybox-sprint.md`

This loop is an **authored pass**, not a redesign. The current route, puzzle truth and validated player-facing interactions are load-bearing.

## Production objective

Produce a coherent authored pass for:

`Plaza / Taller → Manantial / Central → Plaza restaurada / Campana → Castillo → Forja / Terrazas → Faro / Lago → retorno final`

The milestone is allowed to remain short of shipping-final animation/VO/cinematics, but it must no longer read as a collection of late greyboxes. Every region needs a distinctive authored identity, readable electrical cause/effect, coherent materials/lighting, and canonical evidence.

## Routing

- **Sol High** — master, visual/gameplay trade-offs, implementation ownership, integration and acceptance.
- **Luna Max** — mechanical scoped work: wiring, instancing, layouts, manifests, capture plumbing, tests, cleanup.
- **MiniMax M3 via GMI** — experimental proposal worker for tightly scoped technical-art/VFX, code recombination and art-direction decomposition. Proposal-only; Sol verifies before applying.
- **Gemini 3.7 Flash High** — independent read-only visual/fresh-eyes review.

Single-integrator rule: only Sol accepts/integrates. Luna and MiniMax must never own the same files in parallel.

## Bounds

- max 3 iterations per stage
- max 5 fixes per iteration
- max 1 structural fix per iteration
- max 2 disjoint Luna workers
- max 1 MiniMax proposal task at a time
- no engine/dependency/canon change
- no Meshy/Tripo spend without HUMAN_GATE
- no reopening the Plaza loop unless a regression is demonstrated
- no invented final dialogue: `TODO(guion)` + neutral placeholder

## Capture policy

Two tiers are required once Sol implements the local GPU iteration mode:

1. **FAST local iteration** — hardware GPU when available, only the current stage's load-bearing shots, no full cold-start suite. Used for frequent visual iteration.
2. **FULL acceptance** — canonical shots + desktop/mobile + no-post + gameplay/console/perf diagnostics. Existing reproducible SwiftShader evidence may remain a functional CI fallback, but FPS under SwiftShader is never a hardware benchmark.

If local GPU mode is not yet available, A0 must add it without weakening the existing deterministic gate.

## Stages

### A0 — Baseline + capture readiness

- freeze `74abaad` as authored-pass input baseline;
- validate greybox loop remains `complete`;
- verify GMI and Gemini lanes;
- add/verify local GPU fast-capture mode without removing deterministic/full mode;
- record the 22 canonical shots from `ARCO1_CANONICAL_SHOTS.md`.

PASS: no gameplay regression; fast/full capture paths have explicit contracts.

### A1 — Reference planning / visual contracts

- inspect repo-native references first;
- finalize region packs under `assets/references/region-packs/`;
- identify hero/identity assets that require `HERO_REFERENCE_GATE`;
- generate no final hero asset from weak references;
- Gemini reviews the region plan read-only.

PASS: every region has approved-for-authoring reference direction or a precise HUMAN_GATE.

### A2 — Plaza + Taller coherence

Plaza is already the visual baseline: preserve it. Improve only integration seams, restored-state readability, Taller interior coherence and late-route continuity.

PASS: accepted Plaza shots do not regress; Taller reads as authored, functional diagnostic space.

### A3 — Manantial / Central hero environment

Highest authored priority. Build the hydroelectric birthplace of the restored network: stopped/restored water, sluice, turbine/generator, busbars/insulators, measurement points, machinery motion and event-driven electrical response.

MiniMax should be used here for one or more tightly bounded technical-art proposals after gameplay truth is preserved.

PASS: before/after state is unmistakable without text; puzzle cause/effect remains readable; mobile is operable.

### A4 — Castillo de la Red

Turn the distribution greybox into a monumental civic substation/castle. The network topology must remain legible at world scale; use diegetic maintenance close-ups only where density requires it.

PASS: parallel/mixed distribution, protection and service consequences remain visible; no detached circuit minigame.

### A5 — Forja + Terrazas

Author the contrast between industrial thermal load and irrigated terraces. The region should make the power/safety trade-off spatially and materially obvious.

PASS: load, heat, protection, irrigation and consequence are readable without relying on HUD answers.

### A6 — Faro + Lago + return

Author the remote culmination and final return. Keep the accepted DC culmination; RC/transient behavior remains a future seam unless ratified. The return must visibly/audibly show a changed world without turning all copper or architecture emissive.

PASS: Faro has a distinct identity, final calibration is readable, restored traversal persists to Plaza.

### A7 — VFX + audio + ambient motion

Compose event-driven electricity, water, machinery, dust/mist, bells, mechanical contacts and ambient beds. MiniMax may propose VFX/audio direction; nothing becomes canonical without Sol review.

PASS: effects communicate physical state; no decorative neon; mobile/overdraw/performance remain inside gate.

### A8 — Full authored Golden Path / freeze

Run full Portal→Faro→return path with 22 checkpoints or successor contract, canonical captures, desktop/mobile/touch, no-post, console/page errors, transfer/draw-call/triangle/shadow diagnostics and Gemini final review.

PASS: authored Arco I is coherent end-to-end, no player-facing blocker, no critical regression and loop state becomes `complete`.

## HUMAN_GATE

Stop only for:

- contradictory/insufficient identity reference for a hero asset;
- paid provider spend or credentials beyond the authorized GMI trial;
- canon/curriculum/engine/major dependency change;
- structural change that materially alters validated gameplay;
- three iterations with no meaningful improvement;
- serious mobile/performance/accessibility regression;
- final authored milestone acceptance if Sol/Gemini disagree on a material visual direction.

## Required evidence per stage

- focused tests/build as applicable;
- player-facing capture(s) from canonical shot list;
- diagnostics and console/page errors;
- Gemini independent review for authored stages A2–A8;
- Sol acceptance note;
- MiniMax evaluation entry whenever M3 is used.
