# Ohmdal 3D Production Hardening

## Status

`READY`

## Baseline / authority

- Branch: `explore/ohmdal-3D`
- Golden Plaza baseline: commit `325e11afac8944efef16411c88628974ff9e8d38`
- Plaza bounded loop: `agent-work/loops/ohmdal-plaza/state.json` must remain `complete`.
- Canonical Stage 5 captures: `output/playwright/ohmdal-plaza/stage-5/iter-1-after/`
- Existing contracts that remain authoritative:
  - `docs/3d/VISUAL_HARNESS.md`
  - `docs/3d/HERO_REFERENCE_GATE.md`
  - `docs/3d/BUDGETS.md`
  - `docs/80-production/BOUNDED_AGENT_LOOP.md`
  - `docs/20-worlds/ohmdal/production/GALVANOSCOPE_CANONICAL_BRIEF.md`

The Plaza vertical slice is accepted. This task hardens the production system before beginning Manantial content. Do **not** reopen Plaza art direction unless a regression is discovered.

## Objective

Turn the successful Plaza spike into a sustainable Ohmdal 3D production pipeline for Arco I while preserving all accepted gameplay, visuals, mobile behavior and performance.

This is the final substantial harness/runtime hardening pass before content production resumes.

At completion, the repository must be ready to launch a separate bounded loop for `ohmdal-manantial` without first redesigning the harness again.

## Mandatory routing

- Master / technical authority: **Codex Sol High**.
- Mechanical, well-specified edits may be delegated to **Luna Max**.
- Independent read-only visual/context critic: **Gemini 3.7 Flash High** through the existing Antigravity lane.
- Do not introduce a new agent framework, router, daemon, database or orchestration product.

## Non-goals / hard gates

Do **not**:

- build Manantial art, Castle, Faro or later Arco I content;
- change the accepted Plaza composition, Ohm, Omega Gate or Galvanoscope except to fix a demonstrated regression;
- change engine away from PlayCanvas;
- redesign canon, pedagogy, puzzle progression or story;
- introduce a large dependency without a real necessity and explicit justification;
- spend paid generative credits automatically;
- integrate Meshy, Tripo or MiniMax as a mandatory dependency in this task.

Meshy is an **approved future candidate** for high-fidelity image/multiview -> 3D generation. It remains optional and behind a human/economic gate. Preferred hero flow stays: approved references -> choose deterministic Blender when suitable; use Meshy/Tripo only when their geometry advantage justifies it -> Blender canonicalization -> GLB -> runtime.

MiniMax remains a future media/production worker candidate (music, voice, image and bulk work). No MiniMax integration is required to pass this task.

## Work packages

### H1 — Promote PlayCanvas from spike to canonical Ohmdal runtime

Record the architectural decision in a concise repo-native document.

Decision to encode:

- PlayCanvas Engine v2 + TypeScript + Vite is the canonical runtime for the current 3D Ohmdal production path.
- Blender is canonical DCC/master for authored 3D assets.
- Three.js may remain an R&D/authoring/reference ecosystem but is not Ohmdal runtime.
- This decision is based on the accepted Plaza vertical slice and may only be reopened with new evidence, not preference churn.

Do not delete historical experiments merely to make the decision look cleaner.

### H2 — Split world authoring into safe production boundaries

Current `playcanvasWorld.ts` / `playcanvasRuntime.ts` have grown large enough to become multi-agent conflict hotspots.

Refactor conservatively so new zones can be authored without editing one monolithic world file.

Target responsibility shape, not mandatory exact filenames:

```text
src/experiences/ohmdal-playcanvas/
  world/
    plaza/
    workshop/
    manantial/       # contract/shell only; no content production
  systems/
    assets/
    materials/
    zone activation/loading
    interactions/story/tool bindings as appropriate
  runtime coordinator
```

Rules:

- preserve observable Plaza behavior;
- avoid a broad rewrite;
- prefer extraction over reinvention;
- data-only authored layouts remain data-only where useful;
- a worker assigned to Manantial later should not normally need to edit Plaza authoring files.

### H3 — Zone activation / loading contract

Introduce the smallest useful zone lifecycle needed for Arco I.

Required conceptual behavior:

- Plaza baseline is available immediately.
- Workshop interior may activate/load on demand.
- Manantial has a declared zone boundary and activation/preload trigger associated with progression through/opening the Omega Gate, but this task must not author Manantial art.
- Heavy future Manantial assets must not be eagerly loaded at initial Portal arrival merely because they exist in the repo.
- zone state must be testable/deterministic.

Do not build MMO streaming, chunk servers or a generic world platform.

### H4 — Ohmdal Visual / Material Bible

Create a concise canonical visual bible derived from the accepted Plaza rather than inventing a new style.

It must define at least:

- stone family;
- copper / brass and verdigris rules;
- ceramic insulators;
- wood;
- glass;
- water/wetness localization;
- sky / atmosphere;
- key/fill/exposure rules;
- shadow policy;
- emissive/glow policy;
- authored-vs-generic prop rule;
- forbidden visual failure modes.

Preserve the accepted principle: passive copper identity does not depend on glow.

Use numeric ranges where they are stable and useful, but do not create false precision where current evidence does not support it.

### H5 — Blender Gauntlet

Generalize the successful Ohm / Galvanoscope method into a reusable bounded asset QA path.

Minimum flow:

```text
approved Hero Reference Pack
-> deterministic or selected authoring route
-> Blender canonical master
-> GLB
-> canonical multiview previews
-> independent critic against approved references
-> bounded fixes
-> validation
```

Requirements:

- existing `scripts/3d/build_galvanoscope_hero.py` is a golden fixture/example, not throwaway code;
- produce a reusable task/contract or helper where useful without forcing every asset into one giant generator;
- preview views include at least front, side, back and 3/4 when the asset requires them;
- critic must receive the approved reference pack plus all candidate views;
- max 3 asset correction iterations by default;
- paid Meshy/Tripo generation requires HUMAN_GATE unless separately authorized;
- generated-provider output never bypasses Blender canonicalization and reference validation.

Do not install the public `gauntlet-loop` package/skill merely to copy its name; implement the useful mechanism within the existing Roxana harness.

### H6 — Gameplay Gauntlet / automated playtester

Add a deterministic automated traversal of the current accepted playable path using real player-facing inputs wherever practical.

Golden path to exercise:

```text
Portal arrival
-> traverse Plaza
-> Edda interaction
-> Ohm awakening
-> reach / enter Lumen Workshop
-> obtain/use the Galvanoscope flow already implemented
-> inspect/solve the current circuit interaction
-> return to Plaza
-> open Omega Gate
-> cross the progression boundary / reach `inside_manantial`
```

Principles:

- prefer keyboard/pointer/touch inputs over directly mutating story state;
- hooks may observe/assert state, reset deterministic fixtures and collect diagnostics;
- do not pass the test by teleporting around the player-facing sequence through hidden state changes;
- scene transitions already triggered by legitimate interactions are fine;
- capture useful failure screenshots;
- assert story progression, gate state, circuit state, no console/page errors and critical UI availability;
- retain the existing visual smoke tests.

If one current gameplay step is only a placeholder and prevents a truthful end-to-end assertion, document that exact gap instead of fabricating gameplay.

### H7 — Performance Gauntlet

Extend diagnostics and gates so future zones cannot silently destroy web/mobile performance.

At minimum record where feasible:

- draw calls;
- triangles;
- materials;
- textures;
- transferred MB;
- largest transferred assets;
- active zone(s);
- shadow-casting lights;
- shadow-casting renderers / meaningful proxy count;
- renderer/vendor/software-renderer detection;
- console/page errors.

Policy:

- SwiftShader/headless FPS is informational only, never a physical GPU benchmark;
- mobile should default to at most one meaningful dynamic shadow light unless a measured exception is approved;
- tiny/background props should not cast expensive shadows without visible benefit;
- new zone budgets must be evaluated in the actual loaded-zone configuration, not only whole-repo asset size.

Do not over-optimize the accepted Plaza solely to improve a vanity metric.

### H8 — Final verification / freeze

Run existing and new validation.

The final report must state clearly:

- whether PlayCanvas canonicalization is complete;
- extracted zone/runtime boundaries;
- zone loading behavior and evidence;
- Blender Gauntlet evidence;
- gameplay playtester result and exact traversed path;
- performance diagnostics/gates;
- Plaza before/after regression comparison;
- Gemini 3.7 Flash High independent review;
- Luna work vs Sol work;
- remaining HUMAN_GATEs;
- exact readiness for creating `ohmdal-manantial` loop.

## Acceptance criteria

PASS only if all of these are true:

1. `325e11a` Plaza visual/gameplay baseline has no critical regression.
2. Existing Stage 5 canonical views can still be reproduced meaningfully; no new critical visual failures.
3. The accepted Plaza loop remains `complete`; this task does not mutate it into a new art stage.
4. PlayCanvas canonical-runtime decision is documented.
5. World authoring is separated enough that future Manantial work does not normally require editing Plaza authoring internals.
6. A deterministic zone activation/loading contract exists and is covered by tests.
7. Future Manantial heavy assets are not required to be eager-loaded at initial Portal arrival.
8. An Ohmdal Visual/Material Bible exists and reflects Stage 5 evidence.
9. Blender Gauntlet is documented/executable enough to reuse the Ohm/Galvanoscope golden path on the next hero asset.
10. A gameplay gauntlet exercises the current playable progression truthfully, or reports one precise pre-existing gameplay blocker rather than cheating around it.
11. Performance diagnostics include zone/load and shadow evidence in addition to current metrics.
12. `npm run verify`, relevant 3D validators, bounded-loop validators and new tests pass.
13. Gemini 3.7 Flash High reviews the final evidence read-only; no Gemini Pro/API escalation.
14. Worktree is clean and commits are pushed to `origin/explore/ohmdal-3D`.
15. Stop after hardening. Do not auto-start Manantial production.

## Routing guidance

Use Sol High for:

- architecture boundaries;
- runtime decision;
- zone lifecycle design;
- Visual Bible judgement;
- gameplay-test truthfulness;
- acceptance/rejection.

Use Luna Max for bounded mechanical work such as:

- file extraction after Sol defines boundaries;
- import rewiring;
- data movement;
- repetitive test scaffolding;
- diagnostics plumbing;
- mechanical manifest/script changes.

Gemini 3.7 Flash High is critic/reviewer only and must not become the technical master.

## Stop conditions

Stop with `HUMAN_GATE` only for a real need such as:

- changing established canon/gameplay to make the playtester pass;
- large dependency/engine change;
- paid Meshy/Tripo use;
- credentials/login unavailable to the harness;
- a conflict that would require invalidating the accepted Plaza baseline.

Otherwise continue autonomously until this task is PASS or has a precise technical blocker.
