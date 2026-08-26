# Candidate A5 Report — Ohmdal Forja + Terrazas Authored Pass

**Date:** 2026-08-26  
**Worker:** Gemini (Builder)  
**Branch:** `worker/gemini-ohmdal-authored-overnight`  
**Milestone:** A5 Forja + Terrazas Authored Support Pass  

---

## 1. Summary of Changes

Milestone A5 provides the authored support pass for the dual Forja (industrial thermal load) and Terrazas (agricultural irrigation pump station) region within Arco I:

1. **Forge Foundry Architectural Support (`buildArc1Greybox.ts`):**
   - Constructed `ForgeTerracesAuthoredSupportRoot` lifecycle-scoped under `Arc1ForgeTerracesGreyboxRoot`.
   - Built industrial smelting hood (`ForgeSmeltingHood`), copper flue stack (`ForgeChimneyFlue`), and flue bracing (`ForgeHearthFlueBrace`).
   - Added heavy distribution main bus standoffs and brass insulator caps (`ForgeBusStandoffA/B`, `ForgeInsulatorCapA/B`).
   - Authored foundry workstation forms: anvil block (`ForgeAnvilStand`, `ForgeAnvilHead`), stone quenching vat with surface water (`ForgeQuenchingTrough`, `ForgeQuenchingWater`), and wall tool rack (`ForgeToolRack`).
   - Enclosed foundry overhead space with roof trusses, tie beams, and clerestory headers (`ForgeRoofTrussWest/East`, `ForgeRoofTieSouth/Mid/North`, `ForgeClerestoryHeader`) at 6.8–7.0m height.

2. **Agricultural Terraces Support & Hydraulic Infrastructure (`buildArc1Greybox.ts`):**
   - Built elevated stone aqueduct with arch pillars spanning across the terrace hillside (`AqueductPillarWest/East`, `AqueductArchLintel`, `AqueductWaterChannel`).
   - Added stepped retaining wall buttresses across all three terrace levels (`TerraceButtressLevel1/2/3Left/Right`).
   - Authored agricultural irrigation plots and water troughs (`TerraceIrrigationPlotLeft/Right`, `TerraceWaterTroughLeft/Right`).
   - Added brass balustrade handrails alongside the stone terrace stairways (`TerraceStairRailLeft/Right`).

3. **Systemic Model & Visual State Projection (`playcanvasRuntime.ts`):**
   - Driven directly by systemic model (`evaluateForgeTerraces(arc1State)`):
     - `ForgeHeaterCore` enables heat glow only when energized and producing thermal load (`heat > 0`).
     - `ForgeProtectionLight` indicates overcurrent / thermal trip condition.
     - `TerracesPumpWheel` rotates when the irrigation pump is energized and supplied.

4. **Performance & Static Batching:**
   - Grouped all static authored mesh instances under `app.batcher.addGroup('OhmdalForgeTerracesStaticArt', false, 45)`.
   - Zero extraneous point lights added.

5. **Automated Verification:**
   - Test suite `tests/ohmdal-forge-terraces-authored.test.ts` asserts structural hierarchy, foundry/terrace entities, model-driven runtime bindings, and static batching.

---

## 2. Evidence & Verification

- **Unit & Integration Tests (`npm test`):**
  - All 41 test suites passed (including `ohmdal-forge-terraces-authored.test.ts`, `ohmdal-castle-authored.test.ts`, and `ohmdal-navigation-collision.test.ts`).
  - 0 test failures, 0 regressions.

- **Build & Bundle (`npm run build`):**
  - TypeScript type check & Vite bundle: **PASS** (`built in 30.81s`).

- **Golden Path Automated Playtest (`npm run playtest:ohmdal-golden-path`):**
  - **Result: PASS (22/22 checkpoints passed end-to-end)**.

- **Hardware GPU Capture (FAST local iteration):**
  - Output directory: `output/playwright/ohmdal-arco1-authored/a5-fast-iteration1/`
  - GPU: `ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti (0x00002191) Direct3D11 vs_5_0 ps_5_0, D3D11)`
  - `softwareRendered: false`
  - Performance: 59.88 FPS (P50), 59.17 FPS (P10), frame time 50ms (P95).
  - Console/page errors: 0.

---

## 3. Files Modified / Created

- `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` (MODIFIED)
- `tests/ohmdal-forge-terraces-authored.test.ts` (CREATED)
- `agent-work/reports/workers/ohmdal-arco1-authored-a5-candidate.md` (CREATED)
