# Candidate Evidence Report — Ohmdal A4 Castillo de la Red Authored Pass

**Date:** 2026-08-26  
**Worker:** Gemini 3.7 Flash High (builder general)  
**Branch:** `worker/gemini-ohmdal-authored-overnight`  
**Stage:** A4 — Castillo de la Red (`a4-castle-authored`)  
**Status:** CANDIDATE READY FOR REVIEW (Builder rule: not self-approved)

---

## 1. Scope & Intent

Transform the distribution patio greybox into a monumental civic distribution hall/substation without altering validated gameplay topology or electrical simulation:
- Main civic spine with raised overhead copper bus, 3 distribution branches, porcelain insulators, maintenance balconies and brass railings.
- Dynamic physical reflection of branch wiring (parallel/series/isolated), return continuity link, and trip pin position.
- Three service bay markers reflecting real power delivery.
- No shared-material-per-frame mutations and no unmotivated neon/copper glow.
- Static authored geometry batched cleanly via PlayCanvas batcher (`OhmdalCastleStaticArt`, max 45 meshes).

---

## 2. Verification Evidence

### Build & Tests
- `npm run loop:ohmdal-arco1-authored:validate` — **PASS**
- `npm run build` (`tsc && vite build`) — **PASS**
- `npm test` — **PASS** (all test suites green, including `tests/ohmdal-castle-authored.test.ts` and `tests/ohmdal-visual-harness.test.ts`)
- `npm run playtest:ohmdal-golden-path` — **PASS** (22/22 checkpoints verified end-to-end)

### FAST Local Hardware Captures
- **Command:** `node scripts/visual/capture-ohmdal-plaza.mjs --mode fast --stage a4-castle-authored --out output/playwright/ohmdal-arco1-authored/a4-fast-iteration1`
- **Browser/GPU:** Chromium / ANGLE (NVIDIA GeForce GTX 1660 Ti, Direct3D11)
- **`softwareRendered`:** `false`
- **Performance:** `fpsP50` = 59.88, `frameTimeMsP95` = 50.10 ms
- **Render stats:** 126 draw calls, 84,244 triangles, 73 meshes, 48 materials, 23 textures
- **Console / Page Errors:** 0 errors

### Captured Views
1. `restored-plaza-wide.png` — Wide view of restored Plaza before bell trigger.
2. `bell-activation.png` — Campana activation opening the castle gate.
3. `castle-gate-open.png` — Approach through the opened south entrance threshold into the distribution hall.
4. `castle-distribution-hall.png` — Elevated oblique overview of distribution panel, raised copper bus, branch lines, insulators, and service bays.

---

## 3. Known Debt / Handover to A4B

1. **Wall Collisions:** Interior load-bearing walls are currently manual AABB boxes. A4B introduces the formal `OHMDAL_NAVIGATION_COLLISION_CONTRACT` with coupled solid geometry and automated wall-challenge tests.
2. **Scenic Enclosure:** Hall upper lintels and balcony leave visible gaps to the sky dome behind the 4m perimeter walls; A4B Scenic Shell hardening addresses architectural enclosure and proxy layering.
3. **Transition Spawn Facing:** Spawn points across zone seams will use `position + directionIntoZone/lookAt` anchors in A4B.

---

## 4. Next Step

Proceed directly to **A4B Navigation + Scenic Shell Hardening**.
