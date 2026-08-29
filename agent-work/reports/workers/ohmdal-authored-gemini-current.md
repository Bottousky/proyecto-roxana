CANDIDATE_MODE: validation-only
BASE_SHA: 42600b27ba2452a3886bc491850d5e2423e47489
IMPLEMENTATION_SHA: NONE
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false

# Evidence Report — Ohmdal A4 Castillo Authored Pass (Validation-Only)

**Worker:** Gemini 3.7 Flash High / Antigravity CLI (Primary Authored Builder)  
**Task:** `agent-work/tasks/workers/ohmdal-a4-evidence-normalize-v2.md`  
**Loop:** `agent-work/loops/ohmdal-arco1-authored-pass/state.json`  
**Stage:** `a4-castle-authored` (iteration 1/3)  
**Date:** 2026-08-29T13:06:00-03:00  

---

## 1. Candidate Scope & Assertion

- **Candidate Mode:** `validation-only`
- **Base SHA:** `42600b27ba2452a3886bc491850d5e2423e47489` (canonical `origin/explore/ohmdal-3D`)
- **Implementation SHA:** `NONE` (A4 authored implementation was confirmed present in canonical baseline `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts`)
- **Evidence Status:** `PASS`
- **Self-Acceptance:** `false`

The A4 Castillo authored support geometry, civic spine, three distribution branches, maintenance balconies, isolators, trip pins, service lighting, and batching (`OhmdalCastleStaticArt`) are already present in canonical codebase. This report provides the validated test, build, and visual evidence without introducing duplicate implementation commits.

---

## 2. Validation & Test Evidence

### Loop State Validation
```text
> node scripts/agents/validate-bounded-loop-state.mjs agent-work/loops/ohmdal-arco1-authored-pass/state.json
BOUNDED_LOOP_STATE PASS: ohmdal-arco1-authored-pass stage=a4-castle-authored iteration=1/3
```

### TypeScript & Production Build
```text
> npm run build
✓ 48 modules transformed.
✓ built in 1.10s (0 type errors, clean compilation)
```

### Unit & Domain Test Suites
```text
> npm test
- R5/R6/R7/R8/RA0/RG0/RG1/RG2/RR0/RT0 suites: 100% PASS
- tests/ohmdal-*.test.ts: 100% PASS
```

### Golden Path End-to-End Playtest
```text
> npm run playtest:ohmdal-golden-path
Result: PASS
Checkpoints: 22/22 completed
Run artifact: output/playwright/ohmdal-hardening/golden-path/golden-path-run.json
- Checkpoints verified across all 5 zones:
  1. portal
  2. ohm-awakened
  3. inside-workshop
  4. tools-received
  5. returned-to-plaza
  6. galvanoscope-measurement
  7. corrosion-cleaned
  8. jumper-installed
  9. after-gate-open
  10. inside-manantial
  11. manantial-restored-mobile
  12. manantial-restored-desktop
  13. plaza-restored-mobile
  14. plaza-restored-desktop
  15. castle-restored-mobile
  16. castle-restored-desktop
  17. forge-terraces-restored-mobile
  18. forge-terraces-restored-desktop
  19. lighthouse-restored-return-mobile
  20. lighthouse-restored-return-desktop
  21. arc1-complete-mobile
  22. arc1-complete-desktop
```

---

## 3. Visual FAST Capture Diagnostics

- **Manifest Path:** `output/playwright/ohmdal-arco1-authored/a4-fast-iteration3/capture-manifest.json`
- **Stage:** `a4-castle-authored`
- **Mode:** `fast-local-gpu`
- **Hardware Acceleration:** Active (D3D11 / Direct3D11)
- **Software Rendered:** `false`
- **Performance:** 59.88 FPS (P50), 16.9ms frame time (P95)
- **Console / Page Errors:** 0 errors

### Captured Shots
1. `restored-plaza-wide.png`: Wide overview showing restored Manantial feed towards the Castle entrance gate. (126 draw calls, 84,244 triangles)
2. `bell-activation.png`: Physical bell pulled closing the relay circuit and driving castle gate open state. (116 draw calls, 83,296 triangles)
3. `castle-gate-open.png`: Camera anchor at Castle gate threshold showing open civic entrance and interior view. (46 draw calls, 5,620 triangles)
4. `castle-distribution-hall.png`: View along civic distribution spine showing main bus, isolated/connected branches, maintenance balconies, and electrical inspection points. (45 draw calls, 5,608 triangles)

---

## 4. Architectural & Pedagogical Invariants

1. **Civic Stronghold Identity:** The Castle presents as a civic distribution stronghold / electrical substation, not a generic fantasy castle.
2. **Simulation-Driven State:** Branch, service, and protection visuals reflect the underlying circuit simulation model directly (active top-level bus, isolated/connected branches, trip pins, return continuity).
3. **Multi-Solution Defensibility:** Both parallel and mixed topology solutions remain supported by the simulation and interactive panel.
4. **Lifecycle & Material Safety:** Static support structures are batched under `OhmdalCastleStaticArt` within the Castle root lifecycle without point light bloat or shared-material leakages.
5. **Separation of Concerns:** No changes to experimental VFX scope (`src/experiences/ohmdal-playcanvas/experimental-vfx/**`).

---

## 5. Remaining Debt & Routing

- **Stage A4B (Navigation & Collision Hardening):** Queued for worker Luna Max (per loop governance and task assignment).
- Ready for independent review and downstream processing.

---

## 6. Self-Acceptance Declaration

SELF_ACCEPTANCE: false
