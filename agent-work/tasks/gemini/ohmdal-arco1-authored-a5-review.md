# Gemini peer task — A5 Forja y Terrazas authored environment

Act as the independent read-only reviewer for A5 of the Ohmdal Arco I authored
pass. Review only the supplied evidence. Do not edit files, run shell, invent
canon, redesign the validated route, or extrapolate later-region quality.

## Read only

- `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
- `docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md`
- `assets/references/region-packs/forja/README.md`
- `assets/references/region-packs/terrazas/README.md`
- `assets/references/hero-packs/forge/hero-reference.json`
- `output/playwright/ohmdal-arco1-authored/a5-fast-iteration1/capture-manifest.json`
- A5 player-facing captures in that directory:
  - `forge-core.png`
  - `terraces-irrigation.png`
  - `forge-terraces-overview.png`
- `agent-work/reports/workers/ohmdal-authored-gemini-current.md`
- `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts`
- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`
- `tests/ohmdal-forge-terraces-authored.test.ts`

## Facts supplied by Sol to verify against evidence

- A5 is a support-authored pass, not final hero GLB approval; validated route,
  interaction coordinates, colliders, and electrical/thermal simulation remain authoritative.
- The Forge embodies concentrated power, heat, and conductor limits rather than fantasy/lava clichés.
- Stepped agricultural terraces visibly show the service cost and distribution impact of allocating electrical power.
- Heating coils, protection trip pin, and irrigation water levels respond directly to underlying electrical allocation and network state.
- Static authored geometry is batched under `OhmdalForgeTerracesStaticArt` with zero shared-material bugs and low draw-call footprint.
- FAST used local D3D11 hardware rendering; console and page errors are empty.
- Test suites and golden path pass without regressions.

## Evaluate

1. Does the Forge read as an industrial power/thermal hearth rather than a generic fantasy smithy or lava cliché?
2. Do the agricultural terraces read as stepped masonry irrigation showing the social and service consequences of power routing?
3. Are the overhead busway, standoff insulators, fuse housing, anvil/hearth, and pump station spatially legible and coherent with Ohmdal's material palette?
4. Does the overview show a clear physical trade-off between industrial thermal demand and irrigation demand?
5. Is there a player-facing, navigation, mobile/performance, or evidence blocker that justifies another A5 iteration before progressing to A6?

Prioritize Arco I breadth over optional polish. Do not request new narrative,
paid providers, final cinematics, or route/topology changes.

## Return

- `VERDICT: PASS | PARTIAL | FAIL`
- up to five prioritized findings with severity and exact evidence path
- `PLAYER_FACING_BLOCKERS`
- `NON_BLOCKING_DEBT`
- `DO_NOT_FIX`
- `ANOTHER_A5_ITERATION: YES | NO`
- whether Sol may accept A5 and begin A6

Gemini is advisory. Sol owns acceptance.
