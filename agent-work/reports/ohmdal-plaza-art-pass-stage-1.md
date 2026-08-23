# ART PASS STAGE 1: PARTIAL

Date: 2026-08-22  
Branch: `explore/ohmdal-3D`  
Baseline commit: `f8e10f2005e78ff6930c326752fbc73301272c2e`  
Runtime: PlayCanvas Engine `2.21.4`  
Scope completed: Visual Harness + P1/P2/P3/P4. P5/Meshy intentionally not started.

The free asset pipeline, deterministic capture contract, authored Plaza infrastructure and budget
gate work. The visual result is not a finished vertical slice: hero silhouettes and several large
background masses remain automatic failures, so the correct stage verdict is `PARTIAL`.

## Gemini

- Model: `gemini-3.7-flash-high`, effort `high`.
- Report: `agent-work/reports/gemini/ohmdal-plaza-context-audit.md`.
- Runner note: `agy` 1.1.18 print-mode sandbox soft-denied file reads. The same model/task ran in an
  interactive sandboxed session, and its final response was recovered without additional tool calls.
- Minimal reading set consumed: root and Ohmdal `AGENTS.md`; art-pass spec; asset catalog;
  acquisition guide; Visual Harness; budgets; scale bible; Ohmdal vision; vertical slice.
- Load-bearing correction applied: passive copper emission changed from `0.3` to `0`.
- Fresh-eyes final review: deliberately not run; the scene remains visibly under construction.

## Visual Harness

Implemented `window.__ROXANA_VISUAL_TEST_HOOKS__` for deterministic seed, state, camera, pause,
reduced motion, UI hiding, post toggle and diagnostics. Canonical cameras:

`portal-arrival`, `workshop-approach`, `ohm-landmark`, `omega-gate`, `plaza-wide`,
`active-play-desktop`, `active-play-mobile`, `no-post`.

- Baseline: `output/playwright/ohmdal-plaza/stage-1/baseline/`.
- Stage 1 current: `output/playwright/ohmdal-plaza/stage-1/current/`.
- Browser: Chromium 151, desktop 1440×900 and mobile 390×844.
- Renderer: ANGLE WebGL2 / Vulkan SwiftShader; `softwareRendered=true`.
- Touch smoke: mobile context with `hasTouch=true`, tap on Cuaderno opened the modal; zero touch
  console/page errors.
- Console: zero application errors; four expected WebGL `ReadPixels` stall warnings during capture.

| Metric | Baseline | Stage 1 |
|---|---:|---:|
| Visible draw calls | 74–98 | 96–136 |
| Visible triangles | 8,524–12,056 | 22,576–32,632 |
| Materials | 15 | 21 |
| Textures | 0 | 29 |
| Transferred assets | 5.97 MB | 24.49 MB |

All canonical views stay below `<250` desktop and `<150` mobile draw-call targets. SwiftShader
reported roughly 1.4 FPS after the art pass; this is informational only and is not a GPU benchmark.

## Assets

Downloaded to ignored staging and hash-verified:

- Seven Poly Haven CC0 sets at 2K: `cobblestone_floor_001`, `mossy_cobblestone`,
  `stone_tile_wall`, `stone_wall_05`, `medieval_wall_01`, `medieval_wood`, `rusty_metal_04`.
- Quaternius CC0 Standard packs: Medieval Village MegaKit and Fantasy Props MegaKit.
- Inventories: 528 architecture files and 282 prop files across glTF/FBX/OBJ.

Promoted/integrated:

- Six Poly Haven material families at 1K runtime: base cobble, primary/aged stone, plaster, wood,
  iron. `plaza-cobble-moss` was promoted but deferred until an authored blend mask exists.
- Project-owned non-emissive aged copper, rough/non-metallic verdigris, ceramic, conductor channel,
  terminal, clamp, junction and drain grammar.
- Quaternius `Barrel`, `Crate_Wooden` and `Workbench`: 3,768 triangles, two shared materials, 1K
  atlases, merged/deduplicated into one 4.38 MB GLB. Exact bounds were inspected; Khronos validation
  has zero errors and two barrel tangent warnings.

Discarded/deferred:

- Medieval Village modules: downloaded/inventoried, not integrated. Signature foreground forms were
  authored locally; Blender was unavailable for canonical vendor normalization.
- Quaternius lantern: removed because it added another duplicated atlas with little compositional value.
- Stylized Nature pack: not downloaded; architecture/material review has not earned nature dressing.
- Kenney: not needed.
- Meshy/P5: not used; `MESHY_API_KEY` is unset.

Full provenance: `assets/references/ohmdal-plaza-art-pass-stage-1/provenance.md` and per-runtime
`provenance.json` files.

## Visual

P1–P4 changes actually visible in runtime:

- Authored southern threshold, layered Ohm daïs, workshop gable/frames/chimney/façade, and layered
  north gate architecture without changing colliders or gameplay.
- Functional workshop cluster rather than random scatter.
- Paired ida/retorno channels, ceramic terminals, copper strips, workshop branch, junction box and
  east drainage language.
- PBR base surfaces and restrained light/exposure pass; `no-post` remains navigable/readable.
- Static batching reduced the first post-art capture from 293 to 133 portal draw calls and from 208
  to 128 mobile draw calls.

Automatic failures remaining:

1. Ohm is still a primitive placeholder, not a credible central hero silhouette.
2. The Puerta Ω gameplay mechanism and Ω emblem remain primitive/P5 placeholders.
3. The Portal, workshop and background mountains still expose block/cone construction at hero angles.
4. Floor specular response is too wet/uniform in several views; dampness needs authored masks.
5. `active-play-mobile` does not frame a landmark strongly enough; HUD is legible but the center is
   visually empty/dark.
6. Large black values compress architectural depth, especially workshop and gate close-ups.
7. Genericity is controlled near the workshop, but the plaza lacks enough Ohmdal-specific midground
   modules to carry identity without the P5 heroes.

## Validation

- `npm run verify` — PASS: clean build, all tests including Visual Harness, dialect/vocabulary gates.
- `npm run 3d:validate-manifests` — PASS, including two new Stage 1 manifests.
- `npm run 3d:validate-glb -- ...quaternius-workshop-props.glb` — PASS, 0 errors / 2 warnings.
- `node --experimental-strip-types tests/ohmdal-visual-harness.test.ts` — PASS, 3/3.
- `npx tsc --noEmit` — PASS.
- Real browser recapture — PASS mechanically; desktop/mobile/touch traversed, no page errors.

`npm run 3d:validate-glb` initially exposed that `gltf-validator` is imported by the repo script but
absent from `package.json`/lockfile. It was installed temporarily with `--no-save --package-lock=false`
for validation; project dependency files were not changed.

## BLOCKERS

None for closing Stage 1 as `PARTIAL`. Blender availability becomes a real prerequisite only before
canonical vendor-module normalization or hero DCC work. Human approval remains required before P5,
Meshy credit use, or a material direction change.

## NEXT

1. Manuel: approve/reject the Stage 1 worldbuilding and authorize the P5 hero sprint.
2. Fix mobile landmark composition and floor dampness masks before adding density.
3. Produce/approve Ohm + pedestal as the first hero; recapture all eight views.
4. Produce the visible Puerta Ω mechanism, then the Galvanoscopio, within approved P5 scope.
5. Run Gemini Pro High fresh-eyes review only after those heroes replace the automatic failures.
