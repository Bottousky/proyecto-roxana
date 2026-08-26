# Candidate A4B Report — Ohmdal Navigation + Scenic Shell Hardening

**Date:** 2026-08-26  
**Worker:** Gemini (Builder)  
**Branch:** `worker/gemini-ohmdal-authored-overnight`  
**Milestone:** A4B Navigation + Scenic Shell Hardening  

---

## 1. Summary of Changes

Milestone A4B hardens navigation and scenic enclosure across Arco I without introducing new frameworks or altering engine baselines:

1. **Zone-Local Collision Registry (`collisionRegistry.ts`):**
   - Created `CollisionRegistry` supporting zone-isolated solid axis-aligned bounding boxes (AABBs).
   - Dynamic query `isBlocked(x, z, activeZones, radius, gateOpenPredicate)` ensures inactive zones never produce phantom collisions.
   - Dynamic passage handling for the Omega Gate when energized and open.
   - Diagnostic hook `getDiagnostics(activeZones)` returns total colliders, active colliders, and per-zone collider counts.

2. **Canonical Spawn Anchors & Door-Facing (`navigationAnchors.ts`):**
   - Defined 11 canonical spawn anchors (`OHMDAL_SPAWN_ANCHORS`) across all Arco I zones (`plaza`, `workshop`, `manantial`, `castle`, `forge-terraces`, `lighthouse`).
   - Mathematically verified yaw derivation (`deriveYawFromAnchor`) and dot-product facing validation (`dot(forward, targetDir) >= 0.70`).
   - Guaranteed that `portal-initial` faces south (180°) into the Plaza and Ohm landmark.
   - Replaced all raw `teleportPlayer` coordinates in `playcanvasRuntime.ts` with `teleportToAnchor(anchorId)`.

3. **Scenic Shell Hardening & Architectural Enclosure (`buildArc1Greybox.ts`, `buildWorkshopInterior.ts`, `buildManantialShell.ts`):**
   - Castle perimeter walls raised to 8.0m with upper clerestory headers and roof framing ties (`CastleRoofHeader*`, `CastleRoofTie*`, `CastleSouthUpperLintel`) closing raw sky-dome gaps above the distribution hall.
   - Forge/Terraces and Lighthouse exterior walls raised to 7.0m.
   - Solid colliders registered for all exterior shells and perimeter boundaries.

4. **Automated Verification Test Suite (`tests/ohmdal-navigation-collision.test.ts`):**
   - Validates all 11 spawn anchors, yaw derivations, and door-facing dot products.
   - Confirms no spawn anchor spawns inside any solid collider.
   - Asserts zone-local collider isolation (inactive zones do not block active zones).
   - Verifies dynamic Omega Gate open/closed collision pass-through.
   - Implements wall-challenge simulation asserting movement cutoff without boundary penetration.

---

## 2. Evidence & Verification

- **Node Test Suite (`npm test`):**
  - All 40 test suites passed (including `ohmdal-navigation-collision.test.ts` and `ohmdal-castle-authored.test.ts`).
  - 0 test failures, 0 regressions.

- **Build & Bundle (`npm run build`):**
  - TypeScript type check: **PASS** (`tsc && vite build`).
  - Dist bundle generated cleanly.

- **Golden Path Automated Playtest (`npm run playtest:ohmdal-golden-path`):**
  - **Result: PASS (22/22 checkpoints passed end-to-end)**.
  - Full run from Portal arrival, Ohm awakening, Workshop repair, Plaza circuit repair, Manantial energization, Castle distribution, Forge thermal allocation, Lighthouse synchronization, to full return.

- **Hardware GPU Capture (FAST local iteration):**
  - Output directory: `output/playwright/ohmdal-arco1-authored/a4b-fast-iteration1/`
  - GPU: `ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti (0x00002191) Direct3D11 vs_5_0 ps_5_0, D3D11)`
  - `softwareRendered: false`
  - Performance: 59.88 FPS (P50), 59.17 FPS (P10), 126 draw calls, 84,244 triangles.
  - Console/page errors: 0.

---

## 3. Files Modified / Created

- `src/experiences/ohmdal-playcanvas/collisionRegistry.ts` (CREATED)
- `src/experiences/ohmdal-playcanvas/navigationAnchors.ts` (CREATED)
- `tests/ohmdal-navigation-collision.test.ts` (CREATED)
- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/world/workshop/buildWorkshopInterior.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/visualHarness.ts` (MODIFIED)
- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` (MODIFIED)
