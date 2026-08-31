# Quota-Aware Execution — Roxana

## Goal

Keep production moving when ChatGPT Plus / Codex Sol hits a rolling window without making Manuel babysit every worker.

Expensive frontier reasoning defines contracts/material decisions; **Mavis** supervises execution; cheaper/external workers do most implementation.

## Core pattern

```text
Manuel + ChatGPT web / GPT-5.6 Sol
     direction / material decisions
                  ↓
                repo
                  ↓
        MAVIS ORCHESTRATOR
 Gemini Flash Medium / Antigravity
 monitor · dispatch · gates · integration
                  ↓
      ┌───────────┼───────────┐
      ▼           ▼           ▼
   Gemini        M3         Luna/Terra
   builder     OpenCode       Codex
      └───────────┼───────────┘
                  ↓
 commit + tests + captures + report
                  ↓
       fresh independent review
                  ↓
 Mavis integrates unambiguous PASS
 or HUMAN_GATE for material ambiguity
```

Do not ask Codex Sol to execute multi-hour loops by default.

Mavis contract: `docs/80-production/MAVIS_ORCHESTRATOR.md`.  
Mavis task: `agent-work/tasks/orchestrator/ohmdal-authored-mavis.md`.  
Status sensor: `npm run orchestrator:status`.

## Current Ohmdal dispatch

### Control plane — Mavis

Harness: **Antigravity CLI**  
Model: **Gemini 3.7 Flash Medium**  
Effort: **medium**

Mavis observes Git/worktree/report evidence, detects worker completion, launches fresh reviewers, issues bounded repair packets, runs deterministic gates and cherry-picks mechanically safe PASS candidates. It does not invent canon or make unresolved material visual choices.

### Lane A — Gemini authored builder

Harness: **Antigravity CLI**  
Model: **Gemini 3.7 Flash High**  
Effort: **high**  
Mode: **workspace-write / implementation**  
Task: `agent-work/tasks/workers/ohmdal-authored-primary-gemini.md`

Use for A4/A5/A6 authored scene work, captures and repo-heavy implementation. It may commit/push candidate work but cannot mark its own stage passed.

### Lane B — Luna mechanical worker

Harness: **Codex**  
Model: **Luna Max**  
Task: `agent-work/tasks/workers/ohmdal-a4b-luna.md`

Use only after A4 is accepted. It owns navigation/collision/spawn/test plumbing. Do not run it concurrently with a builder modifying the same load-bearing runtime/world files.

### Lane C — MiniMax tool-enabled specialist

Harness: **OpenCode CLI**  
Provider: **GMI Cloud**  
Model: **MiniMax M3 / MiniMaxAI/MiniMax-M3**  
Task: `agent-work/tasks/minimax/opencode-vfx-tool-trial.md`

The trial lives in a disjoint worktree/scope. It cannot merge itself or mark a stage passed. If OpenCode/GMI fails, the repo-native GMI sidecar remains proposal-only fallback.

### Lane D — independent reviewer

Harness: **Antigravity CLI**, separate fresh process  
Model: **Gemini 3.7 Flash High**  
Mode: **read-only / sandbox**

A Gemini builder never reviews its own candidate in the same session. Mavis launches the reviewer as a new process against the candidate evidence.

### Material authority — ChatGPT web / Manuel

GPT-5.6 Sol + Manuel enter only when the contracts do not mechanically resolve the choice: canon, curriculum, topology, engine/dependencies, paid spend or genuinely ambiguous player-facing direction.

### Break-glass — Codex Sol

Only if a blocker requires strong reasoning attached to local tools and Gemini/Luna/M3 cannot resolve it economically. A previous session timing out is not a reason to use Sol again.

## Worktrees

```text
Roxana/             canonical + Mavis
Roxana-gemini/      Gemini builder
Roxana-minimax/     M3/OpenCode experiment
Roxana-luna/        Luna mechanical worker when A4B starts
```

Git is the protocol. No provider bus/daemon/router is required.

## Ownership rule

Never run two write-enabled workers against the same load-bearing files concurrently.

Current safe sequence:

```text
Gemini A4 candidate ───────────────┐
                                  ├→ Mavis detects completion
M3 VFX lab (disjoint) ────────────┘
                                  ↓
                       fresh independent A4 review
                                  ↓ PASS
                         Mavis gates + integrates
                                  ↓
                         Luna A4B candidate
                                  ↓
                         Mavis review + gates
                                  ↓
                           Gemini A5 → A6
```

The user-launched Gemini/M3 sessions that existed before Mavis was introduced are observed, not duplicated.

## Evidence packet required from every worker

- base commit;
- worker branch;
- candidate commit hash(es);
- files changed;
- tests/build results;
- capture paths + renderer diagnostics when visual;
- Golden Path result when player-facing/navigation changes;
- known debt/blockers;
- exact git status;
- `SELF_ACCEPTANCE: false`.

A stopped terminal is not completion; Git evidence is.

## When Plus resets

Do not relaunch a multi-hour Codex Sol loop. Reserve recovered GPT/Codex frontier quota for material decisions and break-glass debugging. Routine monitoring/integration remains Mavis's job.

The goal is for paid GPT quota to cease being the production clock.
