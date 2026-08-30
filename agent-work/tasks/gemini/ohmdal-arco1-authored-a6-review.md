# Gemini peer task — A6 Faro, Lago y Retorno authored environment

Act as the independent read-only reviewer for A6 of the Ohmdal Arco I authored
pass. Review only the supplied evidence. Do not edit files, run shell, invent
canon, redesign the validated route, or extrapolate later-region quality.

## Read only

- `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
- `docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md`
- `assets/references/region-packs/faro/README.md`
- `assets/references/region-packs/final-return/README.md`
- `assets/references/hero-packs/lighthouse/hero-reference.json` (in candidate branch/worktree)
- `output/playwright/ohmdal-arco1-authored/a6-fast-iteration1/capture-manifest.json`
- A6 player-facing captures in that directory:
  - `lighthouse-approach.png`
  - `lighthouse-lake-wide.png`
  - `final-return-plaza.png`
  - `arc1-final-pedestal.png`
- `agent-work/reports/workers/ohmdal-authored-gemini-current.md` (in candidate worktree)
- `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts` (in candidate)
- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` (in candidate)
- `tests/ohmdal-lighthouse-lake-return-authored.test.ts` (in candidate)

## Facts supplied by Sol to verify against evidence

- A6 is a support-authored pass, not final hero GLB approval; validated route,
  interaction coordinates, colliders, and electrical calibration remain authoritative.
- The Lighthouse embodies an optical beacon, precision calibration station, and lake quayside rather than generic coastal clutter.
- The DC calibration station (Nereo) and lake quayside clearly reflect precision electrical measurement and calm water expanse.
- The return portal / pedestal backtrack cleanly culminates Arco I and routes back to Plaza.
- Static authored geometry is batched under `OhmdalLighthouseStaticArt` with zero shared-material bugs and low draw-call footprint.
- FAST used local D3D11 hardware rendering; console and page errors are empty.
- Test suites and golden path pass without regressions.

## Evaluate

1. Does the Lighthouse read as an ancient optical-electrical beacon and DC calibration observatory rather than a generic coastal tower?
2. Does the lake quayside and dock pier preserve spatial framing and calm water depth without overloading draw calls or geometry?
3. Are the beacon housing, Fresnel struts, cupola, instrument bench, galvanometer housing, copper busway, and standoff insulators spatially legible and coherent with Ohmdal's material palette?
4. Does the backtrack nexus and return pedestal provide clear spatial culmination and return to Plaza without fake UI hacks?
5. Is there a player-facing, navigation, mobile/performance, or evidence blocker that justifies another A6 iteration before progressing to A7?

Prioritize Arco I breadth over optional polish. Do not request new narrative,
paid providers, final cinematics, or route/topology changes.

## Return

- `VERDICT: PASS | PARTIAL | FAIL`
- up to five prioritized findings with severity and exact evidence path
- `PLAYER_FACING_BLOCKERS`
- `NON_BLOCKING_DEBT`
- `DO_NOT_FIX`
- `ANOTHER_A6_ITERATION: YES | NO`
- whether Sol may accept A6 and begin A7

Gemini is advisory. Sol owns acceptance.
