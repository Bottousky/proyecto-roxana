# Task — Ohmdal Arco I Authored Pass

## Objective

Execute the next production phase after the closed Arco I greybox. Convert the complete playable route into a coherent authored 3D pass while preserving gameplay truth, pedagogy, zone lifecycle, performance budgets and the accepted Plaza baseline.

Read first:

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-authored-pass/LOOP.md`
4. `agent-work/loops/ohmdal-arco1-authored-pass/state.json`
5. `agent-work/reports/ohmdal-arco1-greybox-sprint.md`
6. `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
7. `docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`
8. `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
9. `docs/20-worlds/ohmdal/production/ARCO1_AREA_REFERENCE_PLAN.md`
10. `docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md`

Do not bulk-read historical runtimes unless a concrete question requires them.

## Absolute priorities

1. Preserve the already-valid Portal→Faro→return Golden Path.
2. Give every late greybox region a clear authored identity.
3. Make electrical/hydraulic cause and effect more legible through geometry, materials, motion, sound and event VFX — not through quiz UI.
4. Finish the whole route coherently before over-polishing one late zone.
5. Keep desktop and touch/mobile first-class.
6. Use actual repo evidence and region packs before inventing new visual language.

## Agent routing

### Sol High

Owns architecture, scene composition, integration, acceptance, trade-offs, hero decisions, stage progression and final commits.

### Luna Max

Use only for bounded mechanical scopes such as:

- extracting repeated scene helpers;
- instancing/dressing from an approved layout;
- manifests/provenance;
- colliders and non-creative wiring;
- tests/capture plumbing;
- warning/cleanup passes.

Never delegate open-ended art direction to Luna.

### MiniMax M3 via GMI

Use on real authored-pass work, but proposal-only. Best candidates:

- procedural electricity/water/mist technical-art decomposition;
- shader/VFX modules based on existing local examples;
- scene-parameter or timing proposals;
- bounded code recombination with exact target files and acceptance tests;
- text-only audio/ambience design briefs if the current GMI runner cannot call media endpoints directly.

Every M3 use must update `agent-work/reports/minimax-gmi/EVALUATION.md` with applicability, Sol repairs, accepted/rejected status and WOULD_PAY.

Do not ask M3 to audit the whole runtime or design a large package without exact interfaces; previous evidence showed poor reliability in those modes.

### Gemini 3.7 Flash High

Fresh-eyes reviewer only. Provide stage-specific screenshots/manifests and the minimum visual contracts. It must remain read-only and never approve its own implementation.

## A0 first

Before authored art work:

- validate `npm run loop:ohmdal-arco1:validate` still reports complete;
- validate `npm run loop:ohmdal-arco1-authored:validate`;
- validate GMI and Gemini lanes;
- implement a **local GPU fast capture mode** if the current capture harness still runs only through SwiftShader. Preserve the existing full/reproducible gate. The fast mode should prefer real Chromium/Chrome hardware acceleration locally, expose renderer/softwareRendered diagnostics, and capture only current-stage load-bearing shots. Do not claim GPU FPS unless diagnostics confirm hardware rendering.

A0 is a small technical prerequisite, not a new harness project.

## A1 references

Populate/finalize region packs from repo-native evidence. The text briefs under `assets/references/region-packs/` are production direction, not permission to redesign validated topology. If an identity-defining hero lacks sufficient approved visual reference, stop only that asset behind HUMAN_GATE and continue other non-blocked work.

## Authored stage expectations

- A2 Plaza/Taller: preserve accepted Plaza; improve late-state seams and authored Taller coherence.
- A3 Manantial/Central: highest environment priority; hydroelectric causality, stopped/restored water, machinery, conductors, readable generator/sluice chain.
- A4 Castillo: monumental civic distribution architecture, not generic fantasy castle; visible branch/service logic.
- A5 Forja/Terrazas: industrial heat/power versus irrigation/water; spatially legible trade-off.
- A6 Faro/Lago/return: distinct remote culmination, accepted DC calibration, visible/audible restored return.
- A7 VFX/audio: event-driven, physically meaningful, restrained; no permanent copper glow.
- A8 full path: 22 canonical checkpoints or stricter successor plus full captures/perf/review.

## Performance

Treat the existing greybox evidence as the starting envelope, not permission to spend everything:

- transfer baseline ~22.03 MB;
- peak ~145 draw calls;
- peak ~88.8k tris;
- one shadow-casting light.

Authored work should remain mobile-conscious. Prefer batching/instancing/material reuse and zone-local loading. If visual quality requires materially exceeding existing budgets, document the trade-off and escalate instead of silently weakening gates.

## External 3D providers

Blender remains canonical DCC. Meshy is a strong future image/multiview→3D option but is not auto-authorized here. Meshy/Tripo require HUMAN_GATE for spend and must still pass reference gate, Blender canonicalization, GLB validation and Visual Harness.

## Completion

Continue autonomously stage by stage until:

- `complete`, or
- a real HUMAN_GATE from the loop contract.

Commit/push verified milestones. Do not stop merely because one authored stage is visually decent if later regions remain greyboxes.

Final report must contain:

- stages passed;
- exact canonical shots/evidence;
- Golden Path status;
- mobile status;
- performance deltas against greybox baseline;
- MiniMax task outcomes and provisional BUY/DON'T BUY evidence;
- remaining non-blocking art/VO/animation debt;
- HUMAN_GATEs if any.
