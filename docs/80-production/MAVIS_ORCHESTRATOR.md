# Mavis — model orchestrator for Roxana

## Purpose

Mavis is the thin model-driven control plane above Roxana's worker lanes. It exists so Manuel does not have to babysit Gemini, MiniMax and Codex workers or manually notice when a candidate finished.

Mavis is **not** a new agent framework and does not replace Git/tasks/tests as source of truth. It is a Roxana-specific orchestration role that observes repo evidence, dispatches bounded workers, requests independent review, integrates only when gates are satisfied, and escalates real HUMAN_GATE decisions.

## Provenance

`Mavis` is a Roxana-specific orchestration role/name created for this repository. It is not a Google/OpenAI/MiniMax product, model, third-party framework or copied external agent. It composes real capabilities already supplied by the native harnesses — Antigravity custom agents/headless execution, Git worktrees/branches, OpenCode, Codex, tests and repo reports — behind a repo-native operating contract.

## Brain / harness

- Harness: **Antigravity CLI (`agy`)**
- Orchestrator model: **Gemini 3.7 Flash Medium** by default.
- Worker/reviewer models remain those declared by the active task.
- Working directory: canonical `Roxana` checkout on the active branch.

The orchestrator is intentionally cheaper than the builders it dispatches. It should spend most of its time inspecting compact status/evidence, not reading the entire runtime.

## Resilient unattended launcher

Canonical unattended launcher:

```bash
npm run orchestrator:mavis
```

This is a **persistent outer daemon**, but Antigravity itself is deliberately **not** kept alive forever. `scripts/agents/run-mavis.mjs` starts one fresh headless Antigravity process per control tick, sends exactly one Mavis prompt, captures its result, lets that child process exit, and then schedules the next tick.

This design makes Git/reports/loop state the durable memory and prevents one Antigravity session crash, stream error, provider hiccup or exit code from killing the whole factory.

A normal model result therefore does **not** stop the daemon. The wrapper interprets the end-of-tick marker and either:

- starts another fresh control tick almost immediately (`CONTINUE`);
- sleeps for the configured poll interval and starts a fresh control tick (`WAITING`);
- exits on `HUMAN_GATE`;
- exits on `COMPLETE`.

The control tick markers are:

```text
MAVIS_TICK_STATE: CONTINUE
MAVIS_TICK_STATE: WAITING
MAVIS_TICK_STATE: HUMAN_GATE
MAVIS_TICK_STATE: COMPLETE
```

If a tick returns an Antigravity ERROR, exits non-zero, crashes, or forgets the marker, the outer daemon stays alive and schedules a fresh-process retry. A transport/session failure is not automatically a product HUMAN_GATE.

The canonical unattended launcher pins:

- agent `mavis`;
- `gemini-3.7-flash-medium`;
- effort `medium`;
- Antigravity `stream-json` input/output for each tick;
- `--dangerously-skip-permissions`.

So routine tool calls are auto-approved. Repo governance still forbids destructive Git recovery, secret access, unapproved paid spend and material decisions outside Mavis's authority.

Useful alternatives:

```bash
npm run orchestrator:mavis:safe        # resilient daemon, normal permission policy
npm run orchestrator:mavis:once        # one fresh control tick for debugging
npm run orchestrator:mavis:interactive # interactive UX/manual conversation
```

Stop the daemon with `Ctrl+C`.

## Core autonomy rule

Mavis must **never finish a tick merely by describing an immediately executable next action**.

If the current stage is accepted and the next stage has a specified worker/task, Mavis dispatches it before ending the tick. It may return `WAITING` only when progress genuinely depends on already-running work or evidence not yet ready.

Example of invalid behavior:

```text
A4B accepted.
Next action: dispatch Gemini A5.
<tick ends>
```

Correct behavior:

```text
A4B accepted.
Gemini A5 dispatched.
MAVIS_TICK_STATE: WAITING
```

## Authority boundary

Mavis may:

- inspect canonical and worker branches/worktrees;
- run `npm run orchestrator:status` and validators;
- detect whether a worker candidate/report is complete;
- launch/relaunch bounded workers through native CLIs;
- launch a **fresh independent reviewer**;
- create bounded repair packets when review/tests fail;
- cherry-pick/integrate an unambiguous candidate after review + deterministic gates;
- update loop state for a mechanically proven stage and push canonical history;
- continue to the next already-specified stage.

Mavis must not:

- invent canon, curriculum, final dialogue or new product direction;
- spend money or call paid services without explicit authorization;
- weaken tests/budgets to obtain PASS;
- force-push, destructively reset/clean human worktrees, or overwrite uncommitted human work;
- inspect/expose `.env`, credential stores, API keys, tokens or unrelated home-directory secrets;
- let a builder review/accept its own work;
- use Codex Sol merely because another worker is slow;
- silently decide material visual/canon ambiguity. Those become HUMAN_GATE.

## Evidence-driven state machine

A worker is not finished because its terminal stopped. Candidate readiness is mechanically checked from Git/report evidence and the active Candidate Protocol.

A stage is not accepted until:

1. candidate readiness is mechanically verified;
2. fresh independent reviewer returns PASS/no blocker when required;
3. deterministic gates pass;
4. no HUMAN_GATE exists.

If reviewer returns PARTIAL/FAIL, Mavis creates one bounded repair packet (max five fixes, max one structural fix), dispatches the correct worker and reviews again, up to the configured loop limit.

## Monitoring

`npm run orchestrator:status` writes a compact ignored snapshot to `.playtest/orchestrator/status.json` and prints current canonical/worker/loop state.

When a worker is genuinely still running, Mavis uses the configured poll interval (currently seven minutes) rather than burning tokens continuously. When another action is immediately executable, the daemon schedules the next fresh tick within seconds.

Each tick reconstructs state from the repository. Conversational memory is optional; Git evidence is authoritative.

## Safety on canonical checkout

Before integration:

- canonical worktree clean;
- fetch remote refs;
- verify candidate base/ownership;
- inspect diff for out-of-scope files;
- cherry-pick implementation candidates rather than copying by hand;
- never invent/cherry-pick an implementation for validation-only evidence;
- run required gates;
- push only fast-forward history.

If canonical is dirty or a worker touched another lane's owned files, stop that integration and report the conflict rather than cleaning destructively.

## Human gates

Escalate only for material decisions such as:

- canon/curriculum/gameplay topology changes;
- engine/major dependency changes;
- paid spend or credential action;
- contradictory hero references;
- visual direction choices unresolved by approved references;
- repeated bounded failure after loop limit;
- destructive Git recovery.

Normal worker completion, tests, reviews, cherry-picks and next-stage dispatch are Mavis's job.
