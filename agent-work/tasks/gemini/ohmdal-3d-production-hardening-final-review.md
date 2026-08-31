# Gemini review — Ohmdal 3D production hardening final

## Role

Independent read-only fresh-eyes reviewer. Model: Gemini 3.7 Flash High, effort high. Do not edit files, do not run paid providers, do not decide architecture for Sol.

## Objective

Review the final evidence for `agent-work/tasks/ohmdal-3d-production-hardening.md` and report whether each H1–H8 acceptance requirement is evidenced, whether the accepted Plaza at `325e11a` has a critical regression, and any concrete blocker to PASS.

## Read first

- `agent-work/tasks/ohmdal-3d-production-hardening.md`
- `docs/20-worlds/ohmdal/AGENTS.md`
- `agent-work/loops/ohmdal-plaza/state.json`
- `agent-work/reports/gemini/ohmdal-3d-production-hardening-context.md`

## Evidence to inspect

- H1: `docs/20-worlds/ohmdal/production/OHMDAL_3D_RUNTIME_DECISION.md`
- H2/H3: `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`, `world/workshop/buildWorkshopInterior.ts`, `world/manantial/buildManantialShell.ts`, `systems/zones/zoneLifecycle.ts`, `playcanvasRuntime.ts`, `tests/ohmdal-zone-lifecycle.test.ts`
- H4: `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- H5: `docs/80-production/OHMDAL_BLENDER_GAUNTLET.md`, `scripts/3d/validate-blender-gauntlet.mjs`, `agent-work/gauntlets/galvanoscope.json`
- H6/H7: `scripts/gameplay/playtest-ohmdal-golden-path.mjs`, `output/playwright/ohmdal-hardening/golden-path/golden-path-run.json`, `src/experiences/ohmdal-playcanvas/visualHarness.ts`
- Before manifest/views: `output/playwright/ohmdal-plaza/stage-5/iter-1-after/`
- After manifest/views: `output/playwright/ohmdal-hardening/final/`

Inspect all eight before/after PNG pairs, both manifests, the playtest checkpoints, diagnostics, errors, zones and shadows. Treat SwiftShader FPS as informational, as the manifest states. Confirm no Manantial production was begun: only the pre-existing Plaza scenic shell and a loading boundary may exist.

## Output

Return a compact Spanish report with:

1. `VERDICT: PASS | BLOCKED`.
2. H1–H8 table: `PASS | FAIL | INSUFFICIENT` plus one evidence sentence each.
3. Plaza visual/gameplay regression assessment across eight views and mobile.
4. Gameplay truthfulness/anti-cheating assessment, including the exact observed route.
5. Performance/zone/shadow assessment and whether mobile policy is met.
6. Up to five load-bearing issues only, each with severity and precise evidence.
7. `DO NOT FIX` notes for non-blocking polish or future Manantial production.

Do not propose Gemini Pro/API escalation and do not modify the worktree.
