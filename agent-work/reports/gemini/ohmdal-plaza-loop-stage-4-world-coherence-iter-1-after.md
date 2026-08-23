# Ohmdal Plaza loop — Stage 4 / Iteration 1 AFTER

**Reviewer:** Antigravity CLI read-only, `gemini-3.7-flash-high`, effort `high`  
**Conversation:** `cff152ab-9c2f-4e2e-ad4a-7a4ae8133db7`  
**Evidence:** canonical 8-view set at `output/playwright/ohmdal-plaza/stage-4/iter-1-after/capture-manifest.json`  
**Baseline comparison:** `output/playwright/ohmdal-plaza/stage-4/iter-1-before/capture-manifest.json` and `agent-work/reports/gemini/ohmdal-plaza-loop-stage-4-world-coherence-iter-1-before.md`

---

### VERDICT

`PASS`

All five Stage 4 world-coherence acceptance criteria are satisfied. The sharp background cone pyramids have been replaced by a layered, stratified mountain range; the Workshop facade now features authored horizontal timber siding, roofline articulation, and a functional porcelain-bushing electrical service bank; copper conductor conduits connect continuously across the plaza into the central Ohm circle and landmarks; desktop and mobile gameplay framing remain clean with zero HUD occlusion; and runtime draw calls and asset transfers remain well within budget. The loop can advance to `stage-5-final-plaza-polish`.

---

### AUTOMATIC FAILURES

`none`

---

### STAGE GATE

| Criterion | Result | Evidence |
|---|---|---|
| Portal, Workshop and background without primitive blocks/cones | `PASS` | `portal-arrival.png`, `workshop-approach.png`, `ohm-landmark.png`, `plaza-wide.png` |
| Functional clusters, not scatter | `PASS` | `plaza-wide.png`, `workshop-approach.png`, `omega-gate.png` |
| Foreground does not invade UI/interaction | `PASS` | `active-play-desktop.png`, `active-play-mobile.png` |
| Material and scale continuity | `PASS` | `workshop-approach.png`, `no-post.png`, `plaza-wide.png` |
| Cold transfer and draw calls within budget | `PASS` | Transfer: 21.77 MB (delta +0.02 MB); Draw calls: 152–157 desktop (budget < 250), 128 mobile (budget < 150); Triangles: 86.8k desktop, 83.9k mobile (budget < 700k/300k); Console/page errors: 0 |

---

### TOP 5 FIXES

Recommended for Stage 5 (`stage-5-final-plaza-polish`):

1. **SOL — lighting & contact grounding:** Fix the specular light leak / seam under the Workshop roofline ridge beam in `workshop-approach.png` and reinforce contact occlusion under the electrical substation box and peripheral structures.
   - `problem`: Visible light bleed under roof header; ground-contact shadows under secondary boxes can be slightly firmer.
   - `expected_impact`: medium
   - `execution_class`: `SOL`
   - `scope`: Workshop roof assembly, directional shadow bias, and contact shadow geometry.

2. **SOL — secondary architecture & platform dressing:** Dress the plain left rectangular kiosk and left circular cylinder platform with consistent Ohmdal stone borders and ceramic/copper mounts to match the authored quality of the Workshop and Omega Gate.
   - `problem`: Left circular pad and left kiosk still present relatively simple geometric profiles compared to the newly authored Workshop.
   - `expected_impact`: medium
   - `execution_class`: `SOL`
   - `scope`: Plaza secondary entities / prop hierarchies.

3. **SOL — perimeter boundary skirt:** Add a low stone curb or retaining lip along the perimeter edges of the plaza cobblestones to softly frame the transition between the ground slab and the distant mountain foothills in elevated/wide angles.
   - `problem`: Wide elevated shots show sharp square polygon edges dropping directly into background sky void at lateral corners.
   - `expected_impact`: medium
   - `execution_class`: `SOL`
   - `scope`: Plaza perimeter skirt / terrain boundary meshes.

4. **LUNA — bell/gong monument detail:** Add ceramic standoff insulators and weathered brass brackets to the timber bell/gong frame on the mid-right.
   - `problem`: Bell arch structure remains a simple dark rectangular frame.
   - `expected_impact`: low
   - `execution_class`: `LUNA`
   - `scope`: Mid-right plaza monument prop.

5. **LUNA — texture optimization audit:** Verify whether the top 5 normal maps (`stone-aged`, `plaza-cobble-base`, `wood-workshop`, `plaster-worn`) can be consolidated or deduplicated ahead of final Stage 5 delivery.
   - `problem`: 4 normal maps account for ~8.0 MB of transfer.
   - `expected_impact`: low
   - `execution_class`: `LUNA`
   - `scope`: Asset manifests and texture loading.

---

### DO NOT TOUCH

- **Galvanoscope hero viewmodel:** Placement, scale (0.24 m), PBR materials, needle, dials, and dual probe cables are locked and clear on desktop and mobile.
- **Ohm automaton landmark:** Pedestal height, turquoise accents, brass patina, and central sightline hierarchy.
- **Omega Gate:** Stonework, arch proportions, insulators, and rear destination prominence.
- **Conductor bus geometry:** Conductor rail alignments and porcelain standoff spacing between Portal, Ohm, and Gate.
- **Lighting and exposure balance:** Ambient sky, key light intensity, and `no-post` baseline contrast.

---

### REGRESSIONS

`none`

Comparing `iter-1-after` against `iter-1-before` and the Stage 3 baseline:
- No regression in asset transfer size (21.75 MB -> 21.77 MB).
- No regression in draw calls (146 -> 152 desktop, 124 -> 128 mobile).
- No regression in triangle counts (80.7k -> 86.0k desktop, 78.6k -> 83.9k mobile).
- Zero console errors and zero page errors across all views.
- Viewmodel and HUD clearance perfectly preserved on desktop and mobile.

---

### MOBILE / PERFORMANCE RISKS

- Headless browser executed under ANGLE SwiftShader software rasterizer (`softwareRendered: true`); reported FPS values (~0.86–1.30 FPS) are informational only and do not reflect GPU performance.
- Triangles (~83.9k) and draw calls (128) on mobile viewport (390x844) are well within mobile budget targets (< 150 draw calls, < 300k triangles).
- Touch smoke test executed cleanly (`bitacoraOpened: true`, 0 errors).
- UI buttons and interaction prompts maintain generous margins relative to the viewmodel and viewport borders.

---

### NEXT CAPTURE

For Stage 5 (`stage-5-final-plaza-polish`):
- `workshop-approach.png`: verify roofline lighting fix and substation contact shadows.
- `plaza-wide.png`: verify perimeter skirt integration and secondary prop dressing.
- `active-play-desktop.png` & `active-play-mobile.png`: verify final player-facing polish and scorecard metrics.
- `no-post.png`: verify that the final scene maintains high intrinsic material quality without post-processing dependence.

---

### EVIDENCE INSPECTED

- `output/playwright/ohmdal-plaza/stage-4/iter-1-after/capture-manifest.json`
- `output/playwright/ohmdal-plaza/stage-4/iter-1-before/capture-manifest.json`
- all eight canonical AFTER PNGs
- all eight canonical BEFORE PNGs
- `agent-work/reports/gemini/ohmdal-plaza-loop-stage-4-world-coherence-iter-1-before.md`
- `agent-work/loops/ohmdal-plaza/LOOP.md`
- `agent-work/loops/ohmdal-plaza/state.json`
- `docs/3d/BUDGETS.md`
- `docs/3d/VISUAL_HARNESS.md`
- `docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`

---

### LOOP_DECISION

```json
{
  "verdict": "PASS",
  "stage": "stage-4-world-coherence",
  "recommendedFixCount": 5,
  "solFixes": 3,
  "lunaFixes": 2,
  "criticalRegression": false,
  "humanGateReason": null
}
```
