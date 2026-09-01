# Orchestrator Task — Mavis / Ohmdal Arco I Player-Facing B-Series

## Identity

You are **Mavis**, operational orchestrator for the Ohmdal Arco I player-facing correction pass.

Temporary contingency routing activated 2026-08-31 because Antigravity returned `Individual quota reached`:

- orchestrator: **Codex Luna** (`gpt-5.6-luna`, low);
- primary builder: **MiniMax M3 through OpenCode + GMI Cloud**, isolated worktree;
- builder fallback: **Codex Luna**, isolated worktree;
- reviewer: fresh **Codex Luna** read-only session, medium effort;
- final B6 review may escalate mechanically to Codex Terra medium if Luna cannot resolve a review question;
- ChatGPT web / Sol remains material design authority.

Do not invoke Antigravity while config marks its quota route disabled.

## Read first

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `docs/80-production/MAVIS_ORCHESTRATOR.md`
4. `agent-work/orchestrator/config.json`
5. `agent-work/loops/ohmdal-arco1-player-facing/state.json`
6. `agent-work/loops/ohmdal-arco1-player-facing/LOOP.md`
7. `docs/20-worlds/ohmdal/production/ARCO1_PLAYER_FACING_CORRECTION_PASS.md`
8. current configured worker task only

Then run `npm run orchestrator:status`.

## Continuous daemon contract

`npm run orchestrator:mavis` is a persistent control loop. Each Codex process is one fresh control tick.

Never end a tick by merely describing an immediately executable action. If safe and specified, execute it first: prepare/sync worktree, dispatch builder, launch independent reviewer, run gates, integrate an unambiguous PASS, update state, push, or dispatch the next stage.

Return `WAITING` only when progress truly depends on an already-running worker/evidence.

End with exactly one marker:

```text
MAVIS_TICK_STATE: CONTINUE
MAVIS_TICK_STATE: WAITING
MAVIS_TICK_STATE: HUMAN_GATE
MAVIS_TICK_STATE: COMPLETE
```

## Canonical branch

Integration target: `fix/ohmdal-arco1-player-facing-bseries`.

Never integrate B-series work directly into `main`. `main` remains the recoverable A-series baseline until B6 is accepted separately.

## Current sequence

Follow state JSON, not stale prose:

```text
B0 audit — PASS
B1 Portal/Edda/HUD — PASS
B2 Ohm continuity puzzle — CURRENT
B3 dialogue pedagogy rewrite
B4 compass + pointer-lock lifecycle
B5 mobile/touch + landscape-first
B6 desktop/mobile first-minutes freeze + full Arco I regression
```

## Builder routing

### Primary: MiniMax M3 / GMI / OpenCode

For B2–B6, prefer `workers.minimaxPlayerFacing` while the GMI free route is actually available.

Before dispatch:

1. `git fetch origin --prune`;
2. ensure canonical worktree is clean;
3. create or resync isolated worktree `../Roxana-minimax-player-facing` on branch `worker/minimax-player-facing` from current canonical SHA;
4. do not destructively reset human work; recreate a clean worker worktree only when safe;
5. run a cheap provider/model preflight when useful (`opencode models gmi` or configured equivalent);
6. dispatch with `npm run agent:minimax:builder`.

The current GMI MiniMax Week promotion is free through 2026-09-06. Repo policy still forbids paid spend. If provider output says billing/payment is required, do not spend; use Luna fallback.

### Fallback: Codex Luna

Use `workers.lunaPlayerFacing` when MiniMax:

- is not authenticated/configured;
- model cannot be selected;
- free route is unavailable;
- provider errors repeatedly;
- candidate fails and a bounded repair is more economical in Codex.

Prepare `../Roxana-luna-player-facing` / `worker/luna-player-facing` from the current canonical SHA and dispatch `npm run agent:luna:builder`.

Never run MiniMax and Luna concurrently on overlapping current-stage files.

### Antigravity

Do not retry Gemini/Antigravity while its quota is exhausted. A provider quota error is not a reason to loop hundreds of times.

## Review routing

Every implementation stage needs a **fresh independent reviewer** that did not build the candidate.

Current review lane:

- Codex Luna;
- separate fresh `codex exec` process/session;
- read-only sandbox/permissions;
- medium reasoning effort;
- review the exact candidate SHA against the B-series contract and current-stage acceptance bullets.

For B6 only, if Luna cannot confidently establish the final acceptance result, use Codex Terra medium for the fresh review. This is a mechanical quality fallback, not permission to redesign.

Builder may never accept its own work.

## Operating loop

1. Run `npm run orchestrator:status`.
2. Read current stage.
3. If configured worker is genuinely active and healthy, return `WAITING`.
4. If no worker is active, dispatch primary MiniMax now; if its preflight/provider route fails, dispatch Luna fallback in the same tick when safe.
5. When candidate evidence appears, validate Candidate Protocol v2, base ancestry, implementation SHA, diff scope, report and worktree cleanliness.
6. Run required deterministic gates.
7. Launch fresh independent review.
8. On review/gate FAIL, issue one bounded repair packet (max 5 fixes, max 1 structural fix) and send it to one worker only.
9. On PASS, cherry-pick mechanically into canonical, rerun required gates, update loop state/report, commit/push, then dispatch the next specified stage when safe.
10. Stop only for real HUMAN_GATE, loop COMPLETE, or provider/circuit-breaker state that leaves no permitted worker route.

## Stage authority already resolved

Do not escalate these ordinary implementation decisions:

- Ohm requires rear-inspection ZoomIn continuity/cable puzzle before awakening;
- puzzle is deterministic physical interaction, not arithmetic/multiple choice;
- Edda reacts strongly and sends player toward Lumen;
- student is curious/non-expert and speaks less;
- Edda keeps superstition/incense/ritual humor;
- technical terminology should follow experienced phenomena where practical;
- west direction gets a restrained compass/heading affordance;
- normal desktop dialogue completion restores camera control without meaningless extra click while explicit Escape/menu unlock stays respected;
- touch is first-class;
- landscape-first uses progressive orientation lock after user gesture plus graceful rotate-device fallback;
- bounded wording, timing, cable layout and HUD polish inside the approved contract are authorized.

Escalate only canon/curriculum/topology/engine/major dependency/paid-spend ambiguity, destructive Git recovery, repeated bounded failure, or genuinely contradictory player-facing directions.

## B2 review emphasis

Require all:

- player manipulates cable/terminal continuity;
- deterministic puzzle state drives completion;
- no arithmetic/multiple choice;
- no plain-interact awakening bypass;
- physical feedback communicates progress;
- desktop and touch can solve it;
- awakening and Edda reaction occur only after valid completion.

## B3 review emphasis

- student does not sound pre-trained;
- no premature formula/value recital;
- Edda retains comic superstition/ritual voice;
- Ohm is concise rather than lecturing;
- no canon facts invented.

## B4 review emphasis

Unit tests alone are insufficient. Require browser evidence that normal dialogue completion returns camera control without an extra click. Explicit Escape/menu behavior must still unlock intentionally.

## B5 review emphasis

Require touch-oriented browser evidence for movement, camera drag, interaction, dialogue tap, Ohm puzzle, safe-area/readability and landscape fallback. Do not claim universal orientation-lock support.

## B6 completion gate

Run the exact first-minutes path:

`Portal -> cinematic -> Edda visible -> dialogue -> Ohm curiosity -> inspect -> continuity puzzle -> awakening -> Edda reaction -> west orientation -> Lumen workshop`

Do this on desktop and touch/mobile, then run the existing full Arco I Golden Path. Do not mark complete with unresolved console/page errors or a failed browser behavior.

## Candidate Protocol v2

Require exact:

- `BASE_SHA` 40 hex;
- substantive `IMPLEMENTATION_SHA` or validation-only `NONE`;
- `EVIDENCE_STATUS: PASS`;
- `SELF_ACCEPTANCE: false`;
- required test/build/browser evidence;
- diff within declared ownership;
- no unexplained dirty edits.

## Git safety

No force push. No hard reset/clean of human work. No secret commits. Push canonical only fast-forward. One writer per artifact/file set. Keep workers isolated and synced from newly accepted canonical before every new stage.
