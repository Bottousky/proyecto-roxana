# Mavis State-Machine Control Plane

## Purpose

Mavis is a cheap operational control plane, not an implementation agent.

The repository and explicit runtime artifacts are the durable source of truth. The orchestration model must execute one bounded action and exit; it must not sit inside a long polling loop waiting for builders.

## State machine

Every daemon cycle refreshes `.playtest/orchestrator/status.json` and classifies exactly one high-level action:

```text
COMPLETE      loop already complete
HUMAN_GATE    durable loop humanGate exists
PROCESS_PASS  a clean Candidate Protocol v2 PASS candidate exists
WAIT_ACTIVE   at least one worker runtime is fresh RUNNING
REPAIR        FAIL / ERROR / STALE worker evidence exists
DISPATCH      no active worker and no candidate requires processing
```

`WAIT_ACTIVE` is mechanical. It does not spend a model call.

Only `PROCESS_PASS`, `REPAIR`, and `DISPATCH` invoke the cheap Codex/Luna control model.

## Worker runtime protocol

Primary/fallback builder runners write:

`.playtest/orchestrator/workers/<workerId>.json`

Required lifecycle states:

```text
RUNNING
PASS
FAIL
FINISHED
ERROR
STALE   # derived by orchestrator-status from TTL
```

A worker writes `RUNNING` before spawning its model process and a terminal state on exit. Candidate Protocol v2 reports in Git remain the acceptance authority; runtime JSON only answers whether a process is still active.

Default stale TTL: 90 minutes.

## Control tick rules

A model control tick must:

1. accept the deterministic `STATE_MACHINE_ACTION` supplied by the harness;
2. perform only that bounded orchestration action;
3. never implement gameplay itself;
4. never poll/tail a long-running worker after asynchronous dispatch;
5. start at most one implementation worker for the current stage;
6. preserve independent review and Candidate Protocol v2;
7. stop after dispatch/integration/review orchestration and let the outer state machine re-evaluate.

The control tick has a hard watchdog. Killing a stuck Mavis tick must not kill independently dispatched workers.

## Routing

Current default:

```text
control plane: GPT-5.6 Luna low / Codex CLI
builder primary: Gemini 3.8 Flash High / Antigravity
builder fallback: GPT-5.6 Luna low / Codex
review Gemini candidate: fresh Luna medium
review Luna candidate: Gemini 3.8 Flash High when available
final difficult B6 review: Terra medium fallback
material decisions: ChatGPT web / Sol
MiniMax: manual fallback only
```

Provider quota is a routing event, not a HUMAN_GATE.

## Recovery

If the daemon is interrupted:

1. restart `npm run orchestrator:mavis`;
2. the first cycle reconstructs state from Git, Candidate Protocol reports, and runtime JSON;
3. fresh `RUNNING` -> mechanical wait;
4. stale `RUNNING` -> `REPAIR`;
5. PASS candidate -> `PROCESS_PASS`;
6. FAIL/ERROR -> `REPAIR`;
7. no candidate/worker -> `DISPATCH`.

Do not hard-reset worker branches or delete dirty worktrees automatically. A bounded worker may repair its own failed candidate, or Mavis may choose a clean alternate worker lane.
