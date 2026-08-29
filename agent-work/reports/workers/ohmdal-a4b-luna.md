CANDIDATE_MODE: implementation
BASE_SHA: e1d673a9affd1664e5085ecfb7d6486b7c228459
IMPLEMENTATION_SHA: a64cea6805b8da2d2f18084c51334db11e92af25
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false

# Evidence Report — Ohmdal A4B Navigation + Scenic Shell

- Worker branch: `worker/luna-a4b`
- Accepted A4 base: `e1d673a9affd1664e5085ecfb7d6486b7c228459`
- Implementation commit: `a64cea6805b8da2d2f18084c51334db11e92af25`
- Scope: deterministic navigation/collision hardening and interior scenic enclosure; no engine/dependency changes; `experimental-vfx/**` untouched.

## Files changed

- `src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalNavigation.ts`
- `src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalSpawnAnchors.ts`
- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`
- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`
- `src/experiences/ohmdal-playcanvas/visualHarness.ts`
- `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts`
- `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts`
- `src/experiences/ohmdal-playcanvas/world/workshop/buildWorkshopInterior.ts`
- `tests/ohmdal-navigation.test.ts`

## Implementation

`OhmdalNavigationRegistry` owns zone-local `solid` and `portal` records, active-zone filtering, dynamic gate state, spawn safety, player radius, and deterministic diagnostics. The runtime lifecycle updates registry activation together with each scene root, so inactive-zone solids cannot block movement. Shared Omega threshold ownership is explicit (`plaza.omega-gate` shared with `manantial`). Authored walls and boundaries are registered with stable source IDs, including Workshop doorway segments, Castle closed/exit gates, Manantial retaining/headwall/powerhouse bounds, Forge/Terraces, Lighthouse, and Plaza perimeter.

`getDiagnostics()` now includes `navigation`; `getCollisionDiagnostics()` exposes active zones, player radius, active solids, and all portals for deterministic debug evidence.

## Transition anchor table

| Transition | Destination spawn | Direction into destination | Derived yaw |
|---|---:|---:|---:|
| Portal → Plaza | `(0, 1.68, -8)` | `+Z` | `180°` |
| Plaza → Taller | `(-60, 1.68, -3.8)` | `+Z` | `180°` |
| Taller → Plaza | `(-6.8, 1.68, -4)` | `+X` | `270°` |
| Plaza → Manantial | `(0, 1.68, 16)` | `+Z` | `180°` |
| Manantial → Plaza | `(0, 1.68, 9.2)` | `-Z` | `0°` |
| Plaza → Castillo | `(60, 1.68, -8)` | `+Z` | `180°` |
| Castillo → Plaza | `(0, 1.68, 9.2)` | `-Z` | `0°` |
| Castillo → Forja/Terrazas | `(120, 1.68, -16)` | `+Z` | `180°` |
| Forja/Terrazas → Castillo | `(60, 1.68, 8)` | `-Z` | `0°` |
| Forja/Terrazas → Faro | `(180, 1.68, -8)` | `+Z` | `180°` |
| Faro → Forja/Terrazas | `(120, 1.68, 24)` | `-Z` | `0°` |

Runtime derives these headings from `directionIntoZone`; spawn anchors reject enabled-solid overlap. Closed gates remain solids and open gates disable the matching threshold solid/aperture.

## Automated validation

- `npm run build` — PASS (TypeScript and Vite build).
- `npm test` — PASS (all repository suites, including `tests/ohmdal-navigation.test.ts`).
- `npm run smoke:play` — PASS; no page errors or console errors.
- `npm run loop:ohmdal-arco1-authored:validate` — PASS; A4B iteration `1/3`.
- `npm run playtest:ohmdal-golden-path` — attempted twice; both runs stalled/time-limited in the default bundled headless Chromium SwiftShader environment after `portal` and `ohm-awakened`, with no page errors. The runner artifact is `output/playwright/ohmdal-hardening/golden-path/golden-path-run.json`. FAST GPU capture below completed successfully; this timeout is retained as environment evidence and requires fresh-eyes review before acceptance.
- `git diff --check` — PASS.

Focused navigation tests cover every anchor’s facing dot product, no immediate ping-pong clearance, inactive-zone filtering, closed/open gates, representative wall penetration, and auditable wall mappings for authored zones. Castle exit gate and Workshop doorway are explicitly included.

## FAST/capture evidence

Manifest: `output/playwright/ohmdal-hardening/a4b-fast-final/capture-manifest.json`.

- `portal-arrival.png`: Portal arrival faces the Plaza/Ohm; Plaza active, 12 active solids, 11 portals.
- `workshop-interior-tools.png`: enclosed Workshop interior with ceiling, walls, intentional south doorway aperture, and cheap `WorkshopDoorwayProxyFacade`; Workshop active, 7 active solids, 11 portals.
- `castle-gate-open.png`: Castle entry/open threshold composition; Castle active, 5 active solids, 11 portals.
- FAST renderer diagnostics: NVIDIA GeForce GTX 1660 Ti, Direct3D11, `softwareRendered=false`; no console/page errors reported.
- Collision debug evidence is present in each capture’s `diagnostics.navigation` payload and in the runtime `getCollisionDiagnostics()` hook.

## Remaining debt

- Golden Path full traversal needs a rerun under a GPU-capable/less throttled browser session; default SwiftShader timing exceeded the runner’s bounded execution window.
- Fresh independent reviewer must validate player-facing composition and accept/reject A4B; `SELF_ACCEPTANCE` remains `false`.

SELF_ACCEPTANCE: false
