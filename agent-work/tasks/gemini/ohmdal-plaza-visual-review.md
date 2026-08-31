# Gemini peer task — Ohmdal Plaza fresh-eyes visual review

## Objective

Act as an independent visual critic after Codex has produced the Plaza multi-view capture set. Judge evidence, not implementation effort.

## Read

- `GEMINI.md`
- `docs/3d/VISUAL_HARNESS.md`
- `docs/3d/BUDGETS.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json`
- `docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`

Then inspect the COMPLETE latest Plaza visual evidence set under `artifacts/visual/` (or the exact artifact path named by the task/report that invoked this review), including every canonical screenshot and available metrics/diagnostics.

Do not inspect implementation code unless a screenshot/metric cannot be interpreted without one factual lookup. Do not cherry-pick the best images.

## Required checks

Judge at least:

- arrival composition and immediate spatial comprehension;
- Ohm, Taller and Puerta Ω landmark hierarchy;
- authored architectural silhouette vs generic pack look;
- Ohmdal material language: pale stone, aged copper, ceramic, wood, glass, restrained water/vegetation;
- whether electrical infrastructure reads as part of the world rather than decoration;
- prop clustering and environmental storytelling;
- material scale/repetition and obvious tiling;
- lighting, exposure, depth and no-post readability;
- player scale and traversal readability;
- desktop/mobile framing;
- imported/generated hero asset scale, orientation and visual coherence;
- renderer diagnostics and any budget regressions;
- whether fog/bloom/darkness hides missing geometry;
- whether the scene reads as a memorable Ohmdal place rather than a medieval asset flip.

## Score

Use the 0–3 Roxana scorecard from `docs/3d/VISUAL_HARNESS.md` for:

1. art direction;
2. composition/sightlines;
3. architecture/authored silhouettes;
4. hero landmarks/interactables;
5. materials/textures;
6. lighting/exposure/depth;
7. environmental life/VFX/motion;
8. UI/interaction readability;
9. performance/evidence.

For each category, first state the strongest case for scoring it only `1`, then assign the final score. This is an adversarial fresh-eyes pass.

## Output format

1. `VERDICT`: `PASS`, `PARTIAL`, or `FAIL` against premium-web target.
2. `AUTOMATIC FAILURES`: exact failures from the harness, or `none`.
3. `SCORECARD`: category-by-category argument-for-1, score, and visible/measured evidence.
4. `TOP 5 FIXES`: ordered by expected visual impact per implementation cost.
5. `DO NOT TOUCH`: things already working that should not be churned.
6. `MOBILE / PERFORMANCE RISKS`.
7. `NEXT CAPTURE`: exact views/metrics needed after fixes.
8. `EVIDENCE INSPECTED`: every screenshot/metrics path used.

Do not award `PASS` because the build is green or because many assets were added.