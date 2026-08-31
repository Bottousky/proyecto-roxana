# PLAZA LOOP REVIEW — Stage 2C (Iteration 2 AFTER)

### VERDICT

`CONTINUE`

Iteration 2 resolved the procedural mesh deprecation warnings (`Mesh.fromGeometry` applied) and successfully lowered/reduced the large cyan rectangular background slab behind Puerta Ω. However, residual blockout primitives (the dark perimeter monolith slab, the unskinned circular platform disc, and the floating horizontal beam/sign member) and the flat, unarticulated workshop facade still prevent passing Stage 2C. A final iteration (Iteration 3) is required to clean perimeter blockout and articulate the workshop before advancing to Stage 3.

---

### AUTOMATIC FAILURES

- Residual unskinned blockout primitives remain prominent in canonical views:
  - Dark monolithic rectangular slab on the left perimeter (`portal-arrival.png`, `plaza-wide.png`).
  - Dark cylindrical unskinned platform disc to the left of the pedestal (`portal-arrival.png`, `ohm-landmark.png`, `plaza-wide.png`).
  - Floating dark horizontal beam with hanging rectangular member to the right of Puerta Ω (`ohm-landmark.png`, `plaza-wide.png`).
- A small remnant blue rectangular sliver still protrudes above the Puerta Ω keystone between the brass rods in `portal-arrival.png`, `ohm-landmark.png`, and `plaza-wide.png`.
- Workshop doorway remains a pure black rectangular void without trim, frame depth, or threshold articulation (`workshop-approach.png`).

---

### STAGE GATE

| Criterion | Status | Evidence |
|---|---|---|
| No primitive/blockout dominante en vistas canónicas | FAIL | `portal-arrival.png`, `ohm-landmark.png`, `plaza-wide.png`: The mountain ridge geometry is stable, but the left monolith slab, left disc platform, and right floating beam/sign remain visible blockout primitives. |
| Arquitectura no lee como asset flip medieval genérico | PASS | `workshop-approach.png`, `plaza-wide.png`: Medieval tavern assets remain absent; electrical cable spool and conduit busbars reinforce Ohmdal visual language. |
| Materiales mantienen gramática Ohmdal | FAIL | `workshop-approach.png`, `plaza-wide.png`: Workshop facade is a flat orange textured box with pitch-black timbers; plaza perimeter terminates as a raw razor edge into empty void. |
| Landmarks Ohm/Puerta Ω siguen dominando correctamente | PASS | `ohm-landmark.png`, `portal-arrival.png`, `active-play-desktop.png`, `active-play-mobile.png`: Hierarchy and sightlines remain crisp. |
| No-post mejora respecto de Stage 2B | PASS | `no-post.png`: Geometry, lighting, and silhouettes read clearly without post-processing crutches. |
| Sin regresión material de budget/mobile | PASS | `capture-manifest.json`: Draw calls (101–135), triangles (44.4k–76.1k), and transfer (21.52 MB) remain well within budget; 0 application errors; deprecation warnings eliminated. |

---

### TOP 5 FIXES

1. **Reskin, integrate, or remove residual perimeter blockout primitives**
   - `problem`: Raw dark rectangular and cylindrical shapes (left monolith wall, left platform disc, and right floating beam/sign) disrupt the plaza perimeter and read as unfinished greybox.
   - `evidence`: `portal-arrival.png`, `ohm-landmark.png`, `plaza-wide.png`
   - `expected_impact`: high
   - `execution_class`: `LUNA`
   - `scope`: perimeter entity setup in `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`

2. **Rearticulate workshop facade, timber framing, and entrance doorway depth**
   - `problem`: The workshop front is a flat orange textured slab with pitch-black post-and-lintel framing, flat window insets, and an unmodeled pitch-black doorway void.
   - `evidence`: `workshop-approach.png`, `plaza-wide.png`
   - `expected_impact`: high
   - `execution_class`: `SOL`
   - `scope`: workshop masonry/wood materials, door frame trim, and threshold depth in `playcanvasWorld.ts`

3. **Soften / skirt the plaza perimeter boundary**
   - `problem`: The plaza cobblestone floor ends abruptly in a razor-thin card edge dropping into empty space, breaking the physical illusion of the environment.
   - `evidence`: `plaza-wide.png`, `portal-arrival.png`
   - `expected_impact`: medium
   - `execution_class`: `SOL`
   - `scope`: plaza terrain boundary and skirt mesh/curb in `playcanvasWorld.ts`

4. **Fully clip/align the upper background quad behind Puerta Ω**
   - `problem`: Although significantly lowered in Iteration 2, a small cyan/blue geometric patch remains visible directly above the arch keystone between the brass rods.
   - `evidence`: `portal-arrival.png`, `ohm-landmark.png`
   - `expected_impact`: medium
   - `execution_class`: `LUNA`
   - `scope`: background energy/waterfall quad transform and height in `playcanvasWorld.ts`

5. **Balance floor and pedestal rim specular reflections**
   - `problem`: The dark outer rim of the Ohm pedestal has harsh high-gloss specular reflections that distract from the Ohm automaton, and the cobblestone wetness can be toned down.
   - `evidence`: `ohm-landmark.png`, `no-post.png`
   - `expected_impact`: low
   - `execution_class`: `LUNA`
   - `scope`: roughness and specular settings for pedestal base rim and cobblestone material in `playcanvasWorld.ts`

---

### DO NOT TOUCH

- `ohm-pedestal.glb`: Asset calibration, materials, and landmark focal power remain optimal.
- `omega-gate.glb`: Solenoids, arch framing, contact pads, and sightlines are stable.
- Workshop electrical prop cluster (cable drum & spool): Solid replacement for generic clutter; maintain as-is.
- Procedural mountain mesh generation: Deprecation warnings were cleanly fixed with `Mesh.fromGeometry`; no further engine churn needed here.
- Mobile layout & Touch Safe Areas: Top status buttons and interaction prompts are well-positioned without UI collisions.

---

### REGRESSIONS

`none`.

- Deprecation warnings (`createMesh`) were completely eliminated from the console.
- Triangle count (75.6k vs 75.7k) and draw calls (132 vs 133 on portal arrival) remain stable and within target limits.
- Asset transfer (21.52 MB) remained flat.

---

### MOBILE / PERFORMANCE RISKS

- Captures execute under SwiftShader (`softwareRendered: true`, ANGLE Vulkan 1.3 Subzero); frame durations (p95 816ms–1266ms desktop, 4133ms mobile) are software-emulation metrics and do not reflect physical GPU performance.
- Mobile draw calls (107) and visible triangles (72.7k) are well within mobile budget targets (< 150 draw calls, 150k–300k triangles).
- Desktop draw calls (101–135) are well within the desktop budget (< 250 draw calls).
- Touch smoke test passed cleanly (`hasTouch: true`, `isMobile: true`, `bitacoraOpened: true`) with 0 console or page errors.

---

### NEXT CAPTURE

- `portal-arrival`: Verify removal or authored integration of the left monolith slab and circular platform, and clean backdrop behind the arch.
- `workshop-approach`: Evaluate architectural depth, frame trim, and threshold articulation of the workshop facade.
- `plaza-wide`: Verify softened plaza perimeter edge and cleanup of the right floating beam/sign.
- `ohm-landmark`: Verify reduced specular glare on pedestal rim and balanced focus on Ohm.

---

### EVIDENCE INSPECTED

- `agent-work/loops/ohmdal-plaza/state.json`
- `agent-work/loops/ohmdal-plaza/LOOP.md`
- `agent-work/reports/gemini/ohmdal-plaza-loop-stage-2c-environment-iter-1-after.md`
- `output/playwright/ohmdal-plaza/stage-2c/iter-2-after/capture-manifest.json`
- All eight current PNGs under `output/playwright/ohmdal-plaza/stage-2c/iter-2-after/`
- `output/playwright/ohmdal-plaza/stage-2c/iter-1-after/capture-manifest.json`
- All eight comparison PNGs under `output/playwright/ohmdal-plaza/stage-2c/iter-1-after/`

---

### LOOP_DECISION

```json
{
  "verdict": "CONTINUE",
  "stage": "stage-2c-environment",
  "recommendedFixCount": 5,
  "solFixes": 2,
  "lunaFixes": 3,
  "criticalRegression": false,
  "humanGateReason": null
}
```
