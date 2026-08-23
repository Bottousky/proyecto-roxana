# OHMDAL PLAZA — ART PASS STAGE 2A: PASS

Date: 2026-08-23  
Branch: `explore/ohmdal-3D`  
Scope: three free Stage 1 corrections + one hero only (`Ohm + pedestal`).  
Out of scope and untouched: final Puerta Ω, final Galvanoscopio, gameplay, lore, engine, dependencies,
general sourcing and Gemini final fresh-eyes review.

Stage 2A passes its defined scope. It does not claim that the full Plaza is a finished visual slice.

## Blender

- found: yes, outside `PATH` through installed-app/registry detection;
- version: Blender `5.2.0 LTS`;
- executable: `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`;
- canonicalization path:
  `assets/ohmdal/characters/ohm-turnaround-v2.png`
  → `scripts/3d/build_ohm_hero.py`
  → local authoring master `assets/source/ohmdal/heroes/ohm/ohm-pedestal.blend`
  → `assets/runtime/ohmdal/plaza/heroes/ohm/ohm-pedestal.glb`;
- the `.blend` authoring tree remains ignored by repository policy; the portable GLB, manifest,
  deterministic build script and provenance are part of the integration.

## Free fixes

- moisture: the Plaza base is now dry stone without the wet-pocket roughness map. Damp response is
  localized to the fountain apron, runoff, a low drain and its immediate joints. No global noise,
  fog or roughness wash was added.
- mobile composition: `active-play-mobile` moved to `[0, 1.68, -5.2]`, yaw `180`, pitch `-6`.
  The capturer now boots PlayCanvas in a native cold 390×844 context instead of cropping a running
  desktop canvas. Ohm is centered and the interaction prompt remains available.
- black/depth: raised only the albedos of aged stone/dark wood/iron, reduced metalness that collapsed
  without IBL, strengthened the cool fill modestly and separated the clear value. Exposure remains
  `1.15`; no fog or global flattening was introduced.

## Ohm

- source refs:
  - `assets/ohmdal/characters/ohm-turnaround-v2.png` — primary approved four-view authority;
  - `assets/references/ohmdal-hd2d-preprod/ohm-original-spec.md` — 1.03 m Ohm height, +Z front,
    grounded pivot, sockets and semantic role;
  - `assets/references/ohmdal-hd2d-preprod/specs/ohm-sprite-spec.md` — production anchors;
  - the generic humanoid `docs/generated-reference-pack/robot-multiview.png` was explicitly rejected.
- generation route: deterministic manual/procedural Blender reconstruction from the approved
  turnaround; no text-to-3D and no external 3D asset.
- Meshy task IDs: none. No official Meshy tool or `MESHY_API_KEY` was configured on the host.
- credits: `0`.
- candidate count: `1`; a local remesh correction seated four fasteners before canonical export.
- canonical GLB: `assets/runtime/ohmdal/plaza/heroes/ohm/ohm-pedestal.glb` (`493,020` bytes).
- geometry: `18,232` triangles, 8 mesh nodes, 5 materials, 0 textures, 0 clips, 0 joints.
- exact inspection: `boundsSource=vertices`, AABB `[-0.58,0,-0.58]..[0.58,1.47,0.58]`,
  center `[0,0.735,0]`, ground offset `0`, static, no runtime pose check required.
- calibration: combined height `1.47 m`, scale `1`, local Y `0`, authored yaw `180` in PlayCanvas.
- collision: no duplicate collision mesh ships; the existing authored Plaza gameplay collider stays
  authoritative.

### Ohm visual gate

- recognizable from `portal-arrival`: pass;
- strong in `ohm-landmark`: pass;
- improves native `active-play-mobile`: pass;
- avoids generic medieval/fantasy robot silhouette: pass;
- stone/copper/turquoise ceramic materiality: pass;
- passive identity does not depend on emissive/glow: pass;
- coherent human/architectural scale and grounded pivot: pass;
- silhouette readable at gameplay distance: pass;
- desktop/mobile budgets: pass;
- runtime/console errors: pass, zero application and page errors.

## Before / after

- Stage 1: `output/playwright/ohmdal-plaza/stage-1/current/`;
- free-fix checkpoint: `output/playwright/ohmdal-plaza/stage-2a/free-fixes/`;
- Stage 2A final 8-view set: `output/playwright/ohmdal-plaza/stage-2a/current/`;
- final diagnostics: `output/playwright/ohmdal-plaza/stage-2a/current/capture-manifest.json`;
- Blender candidate preview: `output/blender/ohm-pedestal/candidate-01.png`;
- strongest improvement: the empty/dark mobile frame became a close, centered and interactable Ohm
  landmark while the same asset remains visible from the Portal.

Remaining automatic failures outside Stage 2A scope:

1. Puerta Ω and its gameplay mechanism remain primitive placeholders.
2. Galvanoscopio viewmodel remains a primitive placeholder.
3. Portal, large workshop masses and background mountains still expose block/cone construction.
4. No hardware GPU benchmark exists; SwiftShader FPS must not be used as a shipping estimate.

## Performance

| Metric | Stage 1 | Stage 2A final |
|---|---:|---:|
| Visible draw-call range | 96–136 | 100–143 |
| Visible triangle range | 22,576–32,632 | 40,396–67,952 |
| Materials | 21 | 26 |
| Textures | 29 | 29 |
| Cold transferred assets | 24.49 MB | 24.97 MB |
| Active desktop | 128 calls / 31,416 tris | 135 calls / 66,736 tris |
| Active mobile | 128 calls / 31,416 tris | 105 calls / 58,444 tris |

- desktop: below `<250` draw calls and `<700k` triangles;
- mobile: below `<150` draw calls and `<300k` triangles;
- software rendered: yes — ANGLE WebGL2 / Vulkan SwiftShader on both canonical contexts;
- reported SwiftShader FPS is informational only and not a GPU benchmark.

## Validation

- preflight branch: `explore/ohmdal-3D` — pass;
- preflight and final `npm run verify` — pass; build, full tests, dialect/vocabulary gates;
- final `npm run 3d:validate-manifests` — pass including Stage 2A hero manifest;
- `npm run 3d:validate-glb -- .../ohm-pedestal.glb` — 0 errors, 0 warnings;
- `inspect-glb` — exact vertex bounds, grounded, static, no runtime check required;
- `npx tsc --noEmit` and focused Visual Harness test — pass;
- canonical desktop/mobile browser capture — pass;
- touch smoke — `hasTouch=true`, Cuaderno opened, zero console/page errors;
- capture console — zero app errors, zero page errors, four expected SwiftShader ReadPixels warnings;
- Gemini final fresh-eyes — deliberately not run per Stage 2A instruction.

## NEXT

**A) producir Puerta Ω.**

Do not advance until Manuel approves this gate.
