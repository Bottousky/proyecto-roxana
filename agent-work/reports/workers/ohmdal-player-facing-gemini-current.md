CANDIDATE_MODE: validation-only
BASE_SHA: 1e21fa8af9f5ce9dbb4bba503246f3805483d315
IMPLEMENTATION_SHA: NONE
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false

# Evidence Report — Ohmdal Player-Facing B0 First-Minutes Audit

**Worker:** Gemini 3.7 Flash High / Antigravity CLI (Primary Player-Facing Builder)  
**Task:** `agent-work/tasks/workers/ohmdal-player-facing-primary-gemini.md`  
**Loop:** `agent-work/loops/ohmdal-arco1-player-facing/state.json`  
**Stage:** `b0-first-minutes-audit` (iteration 0/3)  
**Date:** 2026-08-30T23:37:00-03:00  

---

## 1. Candidate Scope & Machine-Readable Identity

- **Candidate Mode:** `validation-only`
- **Base SHA:** `1e21fa8af9f5ce9dbb4bba503246f3805483d315` (`origin/fix/ohmdal-arco1-player-facing-bseries`)
- **Implementation SHA:** `NONE`
- **Evidence Status:** `PASS`
- **Self-Acceptance:** `false`
- **Branch:** `worker/gemini-player-facing`

---

## 2. Validation & Gate Evidence

### Bounded Loop State Validation
```text
> node scripts/agents/validate-bounded-loop-state.mjs agent-work/loops/ohmdal-arco1-player-facing/state.json
BOUNDED_LOOP_STATE PASS: ohmdal-arco1-player-facing stage=b0-first-minutes-audit iteration=0/3
reviewer=gemini-3.7-flash-high decision=chatgpt-web/Sol
builder=gemini-3.7-flash-high/workspace-write selfApproval=false
worker=Luna/max
experimental=MiniMaxAI/MiniMax-M3/proposal-only
```

### TypeScript & Production Build
```text
> npm run build
✓ built in 27.86s (0 type errors, clean compilation)
```

### Unit & Domain Test Suites
```text
> npm test
- All suites passed (R5, R6, R7, R8, RA0, RG0, RG1, RG2, RR0, RT0, T0-T5, W1-W14)
Total: 100% tests passed (0 failures)
```

### Full Arco I Golden Path End-to-End Playtest
```text
> npm run playtest:ohmdal-golden-path
Result: PASS
Checkpoints: 22/22 completed
Run artifact: output/playwright/ohmdal-hardening/golden-path/golden-path-run.json
- Verified checkpoints across all zones:
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

## 3. Comprehensive Technical Audit Findings

### A. Portal -> Edda -> Ohm -> Lumen First-Minutes Flow
1. **Entry:** Player clicks `Entrar a Ohmdal` on the title card. The player spawns at anchor `portal-to-plaza` (`pos: [0, 1.68, -8.0]`, `yaw: 180`, looking south along `+Z` into the Plaza toward the Omega gate).
2. **Immediate Dialogue Trigger:** `playcanvasRuntime.ts:1694` immediately calls `startDialogue('intro_portal_edda')` on initial runtime load.
3. **Edda Staging Defect:** Edda's composite mesh entity is positioned at `(1.8, 0, -8.0)` (`playcanvasWorld.ts:783`). Because the player is at `(0, 1.68, -8.0)` facing forward (`yaw: 180`, along `+Z`), Edda is located 90° to the player's right, completely off-screen outside the default FOV. The dialogue modal appears floating over an empty Plaza vista with nobody in front of the camera.
4. **Ohm Pedestal & Awakening Defect:** Walking to Ohm at `(0, 1.0, -2.0)` presents prompt `[E] Acoplar contactos y Despertar a Ohm`. Pressing 'E' calls `triggerOhmAwakening()` (`playcanvasRuntime.ts:1230`), waking Ohm immediately without any inspection mode or puzzle solving.
5. **Awakening Reaction & Objective:** Concluding `ohm_awakening_event` triggers `edda_surprised_awakening`. Edda reacts and tells the player to go west to Lumen's workshop (`pos: [-7.4, 1.2, -4.0]`).
6. **Workshop Interior & Tools:** Entering the workshop teleports player to `(-60, 1.68, -4.0)`. Interacting with Lumen at `(-60, 1.0, 1.4)` plays `lumen_workshop_interior`, which awards the Jumper + Brush items (`storyStep = 'tools_received'`).

### B. Edda Staging & Visibility Failure Mode
- **Visual Capture Evidence:** `output/playwright/ohmdal-hardening/golden-path/portal.png` reproduces and documents the defect: the player camera faces the central plaza and dormant Ohm pedestal, displaying prompt `[E] Hablar con Edda (Estudiosa)` with zero NPCs visible on screen.
- **Root Cause:** Colocation of Edda at `Z = -8.0` with `X = +1.8` places her perpendicular to the player's forward view.
- **Seam for B1:** Stage Edda visibly in front of the portal arrival framing (e.g. `X = 1.3, Z = -5.8`, rotated toward player) and trigger dialogue only after arrival cinematic/staging is complete.

### C. Dialogue HUD & Portrait Wiring Defect
- **Portraits Unbound in Data:** In `src/experiences/ohmdal-plaza/story/dialogueData.ts`, lines omit the `portrait` property. `line.portrait` is `undefined`.
- **UI Element Hiding:** In `src/experiences/ohmdal-playcanvas/main.ts:51-56`, `ui.setDialog()` checks `if (portrait)` and hides `#dialog-portrait` whenever `portrait` is falsy.
- **Asset Availability:** Existing high-quality character portraits exist at `assets/ohmdal/generated/portraits/` (`edda-portrait.png`, `lumen-portrait.png`, `ohm-portrait.png`, `student-portrait.png`, etc.) and `src/ui/portrait.ts` provides the `portraitKey(who)` helper, but they are never bound to the PlayCanvas runtime dialogue.
- **CSS Disconnect:** In `src/experiences/ohmdal-playcanvas/index.html`, dialogue markup uses `.dialog-card`, `#dialog-speaker`, `#dialog-text`. In `src/experiences/ohmdal-plaza/styles.css`, rules only styled older Three.js IDs (`#plaza-dialog-who`). `.dialog-card` is completely unstyled.
- **Advance Affordance:** No click/tap handler exists on `.dialog-card` in `main.ts`; advancing currently requires keyboard 'E' or clicking the underlying canvas.

### D. Pointer-Lock Lifecycle After Dialogue Defect
- **Release without Reacquisition:** When dialogue opens, `startDialogue()` calls `document.exitPointerLock?.()`. When dialogue terminates in `advanceDialogue()`, `canvas.requestPointerLock?.()` is not called.
- **Missing Origin State:** Runtime does not track whether exploration was actively pointer-locked before the modal opened vs whether the player pressed Escape.
- **Result:** After closing dialogue, the player is left with mouse look frozen and cursor active, demanding a dead click to re-lock the camera.

### E. Mobile & Touch Deficiencies
- **Camera Look:** Touch controls only provide discrete `q`/`r` buttons. No right-side touch drag / free-look area exists.
- **Dialogue Advance:** Dialogue cannot be advanced by tapping the dialogue card.
- **Orientation Gate:** No `screen.orientation.lock('landscape')` progressive attempt and no rotate-device overlay for portrait orientation.
- **Safe Area Insets:** CSS lacks viewport safe-area padding for modern mobile devices.

### F. Cinematic & Persistence State
- **Current State:** Zero arrival cinematic exists; dialogue fires abruptly on title click. No `localStorage` key (e.g. `ohmdal_intro_seen`) is present.
- **Reference:** `src/jugar/cinematics.ts` and `tests/cinematic-contract.test.ts` define the six canonical cinematic IDs (`'portal-arrival'`, `'awakening'`, etc.) and persistence pattern.

---

## 4. Exact Implementation Seams for B1–B5

| Stage | Focus Area | Source Files & Seams |
|---|---|---|
| **B1** | Arrival Cinematic, Edda Staging & Dialogue HUD | `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` (arrival cinematic sequence, `ohmdal_intro_seen` persistence, staged Edda trigger)<br>`src/experiences/ohmdal-playcanvas/playcanvasWorld.ts` (Edda staging coordinates & orientation)<br>`src/experiences/ohmdal-playcanvas/main.ts` (portrait key resolution, `.dialog-card` click/tap advance)<br>`src/experiences/ohmdal-plaza/styles.css` (RPG dialogue box styling, portrait frame, responsive layout) |
| **B2** | Ohm Curiosity & ZoomIn Continuity Puzzle | `src/experiences/ohmdal-playcanvas/systems/puzzles/ohmContinuityPuzzle.ts` (new deterministic pure circuit continuity graph model)<br>`tests/ohm-continuity-puzzle.test.ts` (unit tests for puzzle state)<br>`src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` (dormant life cue, rear inspection interactable, ZoomIn camera mode, puzzle completion gate for awakening)<br>`src/experiences/ohmdal-playcanvas/main.ts` & `index.html` & `styles.css` (ZoomIn interactive cable/terminal overlay for desktop & touch) |
| **B3** | Early Dialogue Pedagogy Rewrite | `src/experiences/ohmdal-plaza/story/dialogueData.ts` (rewrite `intro_portal_edda`, `ohm_dormant_inspect`, `ohm_awakening_event`, `edda_surprised_awakening`, `lumen_workshop_interior` to enforce non-expert student voice, physical observation, and Edda superstition/ritual humor) |
| **B4** | Orientation / Compass & Pointer-Lock Lifecycle | `src/experiences/ohmdal-playcanvas/index.html` & `src/experiences/ohmdal-plaza/styles.css` (compass/heading HUD)<br>`src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` & `main.ts` (heading calculation from `yaw`, subtle west pulse on Edda direction, `wasPointerLockedBeforeModal` tracking and seamless reacquisition on normal close) |
| **B5** | Mobile / Touch & Landscape-First | `src/experiences/ohmdal-playcanvas/main.ts` & `playcanvasRuntime.ts` (right-side touch drag for camera look, touch-friendly puzzle solver, tap-to-advance dialog)<br>`src/experiences/ohmdal-playcanvas/index.html` & `styles.css` (progressive `screen.orientation.lock('landscape')`, rotate-device fallback overlay, safe-area insets) |

---

## 5. Current Git Status

```text
On branch worker/gemini-player-facing
nothing to commit, working tree clean
```
