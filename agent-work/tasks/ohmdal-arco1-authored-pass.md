# Task — Ohmdal Arco I Authored Pass

## Objective

Convert the complete playable Arco I into a coherent authored 3D pass while preserving gameplay truth, pedagogy, zone lifecycle, performance budgets and the accepted Plaza baseline.

Read first:

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-authored-pass/LOOP.md`
4. `agent-work/loops/ohmdal-arco1-authored-pass/state.json`
5. `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
6. `docs/20-worlds/ohmdal/production/ARCO1_AREA_REFERENCE_PLAN.md`
7. `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
8. `docs/20-worlds/ohmdal/production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md`
9. `docs/20-worlds/ohmdal/production/OHMDAL_SCENIC_RENDERING_POLICY.md`
10. `docs/80-production/QUOTA_AWARE_EXECUTION.md`

## Authority / execution split

- ChatGPT web / GPT-5.6 Sol owns architecture, direction and acceptance.
- Gemini 3.7 Flash High / Antigravity is the preferred general builder for authored scene work; use an isolated worktree/branch with workspace write.
- A separate Gemini session may review read-only; builder cannot accept itself.
- Codex Luna Max owns bounded mechanical work when needed.
- Terra is fallback middle worker.
- Codex Sol is break-glass only.
- MiniMax M3 via GMI Cloud is a bounded technical-art specialist. Preferred fair trial route is OpenCode native GMI Cloud in an isolated worktree; repo sidecar remains proposal-only fallback.

A worker may commit candidate milestones and continue preparing later candidates while tests stay green, but must not set queue stages to `passed` or loop to `complete` without external acceptance.

## Current state

- A0 PASS.
- A1 PASS.
- A2 PASS.
- A3 PASS; hardware FAST capture verified NVIDIA GTX 1660 Ti / D3D11 / non-software.
- A4 Castillo ACTIVE.
- `b923ef7` contains partial A4 work recovered from the interrupted Codex run: Castle branch-state cues, reference gate work, capture contract/tests and M3 evidence. Inspect and continue; do not restart.

## Absolute priorities

1. Preserve Portal→Faro→return Golden Path.
2. Finish authored identity across the whole route before deep polish.
3. Keep physical/electrical cause and effect legible in-world.
4. Fix navigation/collision/enclosure debt before building more late-zone art on top of it.
5. Keep mobile/touch and GPU/perf budgets first-class.
6. Do not duplicate already-ratified planning.
7. Conserve GPT Plus: expensive Sol reasoning is for direction/acceptance, not hours of mechanical execution.

## Dispatch order

### Now: A4

Preferred builder: `agent-work/tasks/workers/ohmdal-authored-primary-gemini.md` using Gemini/Antigravity workspace-write.

MiniMax/OpenCode may run in parallel only on `agent-work/tasks/minimax/opencode-vfx-tool-trial.md`, whose file ownership is intentionally disjoint from A4 runtime work.

### After external A4 acceptance: A4B

Use Codex Luna Max with `agent-work/tasks/workers/ohmdal-a4b-luna.md`. Do not start it while A4 builder is still editing load-bearing runtime/world files.

### After external A4B acceptance

Return authored scene work to Gemini for A5/A6. Use M3 only for disjoint technical-art tasks and Luna for mechanical packets.

## Stage expectations

### A4 — Castillo

Finish the current candidate. Monumental civic distribution hall, branch/service/protection state legible without detached minigame. Use current partial work; produce FAST captures and focused tests.

### A4B — Navigation + Scenic Shell Hardening

Mandatory before A5 because human playtest found:

- visible walls can be traversed when a manual collider is missing;
- door/spawn facing is hardcoded with yaws and may face the door just crossed;
- initial Portal spawn can face back toward the Portal;
- interiors/scenic areas expose large accidental sky-dome voids.

Implement the two production contracts. Prefer deterministic lightweight systems over a new physics engine.

Required outcomes:

- zone-local collision registry/ownership;
- solid geometry helpers or equivalent contract so visible load-bearing walls cannot silently omit collision;
- transition spawn anchors described by `position + lookAt/directionIntoZone`;
- correct orientation on every Arco I transition and initial Portal spawn;
- wall-challenge + door-facing tests;
- collision debug diagnostic;
- interiors/scenic shells close unintended sky gaps;
- layered background/scenic rendering rather than one flat image: atmosphere/sky, far horizon, cheap 3D scenic shell, gameplay geometry, optional adjacent-zone proxies.

### A5 — Forja/Terrazas candidate

Industrial thermal load versus irrigation service. Heat/current/protection/water state legible through world consequences.

### A6 — Faro/Lago/return candidate

Remote culmination, DC calibration truth, restored return. RC/transients remain future seam.

### A7 — VFX/audio

Event-driven and physically motivated. M3 can be used on exact scoped questions; no permanent copper glow.

### A8 — Full freeze

Full canonical capture/playtest/mobile/perf/review. Only external authority may mark loop complete.

## Performance

Preserve zone loading and material reuse. Existing full greybox envelope was ~22 MB transfer, <=145 draw calls, ~88.8k tris, one shadow light; authored zone-local FAST counts are substantially lower. Do not silently weaken gates.

## External providers

Blender remains DCC master. No Meshy/Tripo spend without HUMAN_GATE. No canon/engine/major dependency changes.

## Worker completion packet

Every candidate milestone must leave:

- commit hash;
- focused tests/build commands and results;
- FAST capture path + renderer diagnostics;
- Golden Path result if navigation/interactions changed;
- known debt/blockers;
- M3 evaluation update when used.

Do not invent dialogue; use `TODO(guion)` neutral placeholders.
