# Ohmdal Plaza loop — Stage 4 / Iteration 1 BEFORE

Reviewer: Antigravity CLI read-only, `gemini-3.7-flash-high`, effort `high`  
Conversation: `cd29cea7-480a-4704-97ea-ccb402c0ea60`  
Evidence: canonical 8-view set at `output/playwright/ohmdal-plaza/stage-4/iter-1-before/`

## VERDICT

`CONTINUE`

Stage 3 remains cleanly preserved: canonical Galvanoscope, Ohm, Omega gate, HUD clearance and runtime budgets show no regression. Stage 4 must continue because the perimeter still reads as blockout: the Workshop and arrival Portal use primitive volumes, the mountains are rigid polygonal wedges, and ground props do not form credible functional clusters.

## AUTOMATIC FAILURES

`none`

## STAGE GATE

| Criterion | Result | Evidence |
|---|---|---|
| Portal, Workshop and background without primitive blocks/cones | `FAIL` | `workshop-approach.png`, `portal-arrival.png`, `plaza-wide.png`, `ohm-landmark.png` |
| Functional clusters, not scatter | `FAIL` | `plaza-wide.png`, `ohm-landmark.png` |
| Foreground does not invade UI/interaction | `PASS` | `active-play-desktop.png`, `active-play-mobile.png` |
| Material and scale continuity | `FAIL` | `workshop-approach.png`, `plaza-wide.png`, `no-post.png` |
| Cold transfer and draw calls within budget | `PASS` | 21.75 MB; 146 desktop / 124 mobile draw calls; 80.7k / 78.6k triangles; no console/page errors |

## TOP 5 FIXES

1. **SOL — structural:** replace the Workshop and arrival Portal blockout with authored modular architecture. Expected impact: high.
2. **SOL — scenic silhouette:** replace the pyramidal background with a perimeter skirt and stratified horizon. Expected impact: high.
3. **SOL — composition:** organize utility props into functional work, junction and ceramic-insulator clusters. Expected impact: medium.
4. **SOL — materials:** harmonize scale, roughness and finish of plaster, wood, ceramics and secondary architectural metals. Expected impact: medium.
5. **LUNA — mechanical:** align and terminate copper conductor runs logically between the Portal, Ohm, Omega gate and Workshop. Expected impact: medium.

Only item 1 is the iteration's important structural fix. Item 2 is bounded to non-gameplay scenic silhouette refinement.

## DO NOT TOUCH

- Galvanoscope geometry, 0.24 m scale, proportions, dial, probes or PBR materials.
- Ohm pedestal scale, pivot, materials or proportions.
- Omega gate structure or materials.
- Global lighting, exposure or IBL accepted in Stage 2C.
- Camera framing, HUD safe areas or viewmodel placement on desktop/mobile.

## REGRESSIONS

`none`

The Stage 4 BEFORE set is visually identical to the accepted Stage 3 AFTER set.

## MOBILE / PERFORMANCE RISKS

- SwiftShader FPS/frame-time values are informative only.
- Draw calls and triangle counts are within desktop/mobile budgets.
- Transfer is 21.75 MB; console/page errors are zero.
- Touch smoke passes at 390x844 with `bitacoraOpened: true`; no HUD overlap observed.

## NEXT CAPTURE

The Stage 4 iteration 1 AFTER set must especially demonstrate the new Portal frame and layered horizon in `portal-arrival.png`, authored Workshop facade in `workshop-approach.png`, functional clusters/perimeter/conductors in `plaza-wide.png`, and preserved gameplay framing in `active-play-desktop.png` and mobile/no-post counterparts.

## LOOP_DECISION

```json
{
  "verdict": "CONTINUE",
  "stage": "stage-4-world-coherence",
  "recommendedFixCount": 5,
  "solFixes": 4,
  "lunaFixes": 1,
  "criticalRegression": false,
  "humanGateReason": null
}
```
