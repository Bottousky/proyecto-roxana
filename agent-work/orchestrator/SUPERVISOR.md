# Thin Codex Supervisor

Preferred unattended operation for the Ohmdal B-series.

## Goal

Keep continuous iteration without a long-lived reasoning agent. A deterministic Node supervisor polls repo/runtime state and launches a **fresh Codex Luna low orchestration session** only when an intelligent action is needed.

## Commands

```bash
npm run orchestrator:overnight
npm run orchestrator:workday
npm run orchestrator:supervisor -- --hours 4 --max-cycles 20
```

Defaults:

- overnight: 8h / max 40 intelligent Codex cycles;
- workday: 9h / max 50 intelligent Codex cycles;
- active worker polling: 60s, no model call;
- external reviewer wait after `WAIT_EXTERNAL`: 180s;
- Codex control model: `gpt-5.6-luna`, effort `low`;
- control-cycle safety budget: 20 minutes;
- stop after 3 consecutive control/status errors;
- stop immediately on `HUMAN_GATE` or loop `COMPLETE`.

## Architecture

```text
Node supervisor
  -> orchestrator:status
  -> current-stage worker RUNNING? sleep only
  -> otherwise fresh Codex Luna cycle using CODEX_CYCLE_PROMPT.md
  -> Codex dispatches/checks builder or reviewer, persists state, exits
  -> supervisor sleeps and repeats
```

Builders/reviewers are external processes and must never be waited on inside the Codex control cycle. Repo/Git/reports/runtime files are durable memory.

## Safety

- No force push / destructive reset / paid spend.
- Historical worker evidence is scoped to its stage and cannot drive later stages.
- `Ctrl+C` stops only the supervisor; external workers/reviewers are intentionally left untouched.
- If a Codex control cycle exceeds its safety budget, the supervisor stops conservatively rather than killing a process tree that may contain useful dispatched work.

Logs:

```text
.playtest/orchestrator/supervisor.log
.playtest/orchestrator/supervisor-last-message.txt
.playtest/orchestrator/status.json
```
