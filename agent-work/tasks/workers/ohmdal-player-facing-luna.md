# Worker Task — Ohmdal Player-Facing B-Series / Codex Luna Fallback

## Role

You are the bounded fallback implementation worker for the active Ohmdal B-series stage.

Harness: Codex CLI. Model: `gpt-5.6-luna`. Worktree branch: `worker/luna-player-facing`.

Use this worker only when MiniMax M3/OpenCode is unavailable, fails its provider preflight, or produces a candidate that cannot be repaired economically. You are not acceptance authority.

## Read minimum

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-player-facing/state.json`
4. `agent-work/loops/ohmdal-arco1-player-facing/LOOP.md`
5. `docs/20-worlds/ohmdal/production/ARCO1_PLAYER_FACING_CORRECTION_PASS.md`
6. only current-stage source/tests

Implement **exactly the current stage**. Do not skip ahead.

## Stage contract

- **B2:** real rear-inspection ZoomIn continuity/cable puzzle; deterministic state; physical feedback; no arithmetic quiz; no plain-interact awakening bypass; Edda awakening reaction; touch-operable.
- **B3:** student curious/non-expert; reduce premature technical recital; preserve Edda superstition/incense humor; technical naming follows experienced phenomena; no canon change.
- **B4:** restrained compass/west cue; pointer-lock lifecycle fixed so normal dialogue completion restores camera control without meaningless extra click; Escape/menu unlock respected; touch independent of pointer lock.
- **B5:** touch movement/look/interact/dialogue/puzzle; safe-area; landscape-first orientation attempt after gesture with graceful rotate-device fallback.
- **B6:** validation-only first-minutes desktop + mobile/touch path and full Arco I regression. If a defect exists, report FAIL rather than expanding scope silently.

## Validation

At minimum:

```bash
npm run loop:ohmdal-arco1-player-facing:validate
npm run build
npm test
```

For runtime/player-facing changes also run:

```bash
npm run playtest:ohmdal-golden-path
```

Browser claims need browser evidence.

## Evidence

Write:

`agent-work/reports/workers/ohmdal-player-facing-luna-current.md`

Use Candidate Protocol v2 exactly:

```text
CANDIDATE_MODE: implementation
BASE_SHA: <40-hex canonical base>
IMPLEMENTATION_SHA: <40-hex implementation commit>
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false
```

For validation-only B6 use `IMPLEMENTATION_SHA: NONE` and `EVIDENCE_STATUS: PASS|FAIL`.

Commit implementation, then evidence, push `worker/luna-player-facing`, and stop. Never advance canonical state yourself.

## Boundaries

No engine/dependency/topology/canon/curriculum changes, no paid generation, no weakening tests, no force push/destructive reset, no overlapping edits with another active builder.
