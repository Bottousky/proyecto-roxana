# Quota-Aware Execution — Roxana

## Goal

Keep production moving when ChatGPT Plus / Codex Sol hits its rolling window. Expensive frontier reasoning should shape and accept work; cheaper/external workers should perform most implementation.

## Core pattern

```text
ChatGPT web / GPT-5.6 Sol
  decide WHAT + acceptance criteria
            ↓
        task packet in repo
            ↓
   worker in isolated worktree
            ↓
 commit + tests + captures + report
            ↓
ChatGPT web / GPT-5.6 Sol
   accept / reject / exact fixes
```

Do not ask Codex Sol to execute multi-hour loops by default.

## Current Ohmdal dispatch

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

Use only after A4 candidate is frozen/accepted. It owns navigation/collision/spawn/test plumbing. Do not run it concurrently with a builder modifying the same runtime/world files.

### Lane C — MiniMax tool-enabled specialist

Harness: **OpenCode CLI**  
Provider: **GMI Cloud**  
Model: **MiniMax M3 / MiniMaxAI/MiniMax-M3**  
Task: `agent-work/tasks/minimax/opencode-vfx-tool-trial.md`

OpenCode supports GMI Cloud natively:

```text
opencode
/connect → GMI Cloud → enter local GMI key
/models  → MiniMax M3
```

This lane must work in an isolated worktree and only in the disjoint experimental VFX scope specified by the task. It cannot merge itself or mark a stage passed.

If OpenCode/GMI fails, fall back to the repo proposal-only sidecar:

```bash
npm run agent:minimax:gmi:check
npm run agent:minimax:gmi -- --task <task> --context <file> --out <report>
```

### Lane D — Gemini reviewer

Harness: **Antigravity CLI**, separate fresh session/process  
Model: **Gemini 3.7 Flash High**  
Mode: **read-only / plan / sandbox**

Use stage-specific task under `agent-work/tasks/gemini/`. A Gemini builder never reviews/accepts its own work in the same session.

### Authority — ChatGPT web

Model: **GPT-5.6 Sol**.

Review candidate commits and reports through GitHub, compare against contracts/captures and either:

- accept the candidate and advance state;
- reject with exact bounded fixes;
- create HUMAN_GATE when a material decision is genuinely needed.

### Break-glass — Codex Sol

Only if a blocker requires strong reasoning attached to local tools and Gemini/Luna/M3 cannot resolve it economically. Never use merely because a previous Sol session timed out.

## Worktree pattern

From the canonical repo, after pulling the latest `explore/ohmdal-3D`:

```powershell
git fetch origin

git worktree add ..\Roxana-gemini -b worker/gemini-authored origin/explore/ohmdal-3D
git worktree add ..\Roxana-minimax -b worker/minimax-vfx origin/explore/ohmdal-3D
```

Create the Luna worktree only when A4 is frozen and A4B is ready:

```powershell
git worktree add ..\Roxana-luna -b worker/luna-a4b <ACCEPTED_A4_SHA>
```

If a branch/worktree already exists, reuse or recreate it deliberately instead of forcing Git.

## Ownership rule

Never run two write-enabled workers against the same load-bearing files concurrently.

Current safe sequence:

```text
Gemini A4 candidate ───────────────┐
                                  ├→ Sol web accepts A4
M3 VFX lab (disjoint) ────────────┘

accepted A4
   ↓
Luna A4B navigation/collision
   ↓
Sol web accepts A4B
   ↓
Gemini A5 / A6
```

## Evidence packet required from every worker

- base commit;
- worker branch;
- commit hash(es);
- files changed;
- tests/build commands and results;
- capture paths + renderer diagnostics when visual;
- Golden Path result when player-facing/navigation changes;
- known debt/blockers;
- exact git status;
- no self-acceptance claim.

## When Plus resets

Do not immediately relaunch a multi-hour Sol loop. Use the recovered Sol quota for:

1. reviewing worker evidence;
2. resolving architectural ambiguity;
3. issuing the next bounded packets;
4. break-glass integration only if needed.

The goal is for GPT quota to be the decision bottleneck, not the total production clock.
