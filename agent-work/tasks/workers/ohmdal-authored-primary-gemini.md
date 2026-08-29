# Worker Task — Ohmdal Primary Authored Builder

## Worker

Primary executor: **Gemini 3.7 Flash High / Antigravity CLI / effort high / workspace-write**.

Run in an isolated worktree/branch based on latest `origin/explore/ohmdal-3D`.

## Authority

You are a builder, not acceptance authority. You may implement, test, capture, commit and push candidate milestones. You must not mark your own stage `passed` or set the loop `complete`.

Read only the minimum:

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-authored-pass/state.json`
4. `agent-work/tasks/ohmdal-arco1-authored-pass.md`
5. current stage-specific contracts/reference pack

Do not reopen historical prototypes.

## Dynamic execution rule

Inspect `state.json` before editing.

### If A4 Castillo is active

Finish the existing A4 candidate; do not restart from greybox.

Start from current partial evidence, including `b923ef7` and newer canonical branch commits.

Required:

- Castle reads as civic distribution stronghold/substation, not generic fantasy castle;
- branch/service/protection state remains driven by the real electrical model;
- parallel and mixed defensible solutions remain valid;
- no permanent copper glow or shared-material state bugs;
- produce/update Castle canonical FAST captures;
- run focused tests + build;
- run Golden Path if runtime/interactions changed;
- write `agent-work/reports/workers/ohmdal-authored-gemini-current.md`;
- commit and push candidate A4;
- STOP after candidate/evidence. Do not begin A4B.

### If A4B is active/queued awaiting mechanical work

Do not implement navigation/collision hardening. Report that A4B belongs to the Luna packet and stop.

### If A5 or A6 is active after A4B acceptance

Implement exactly one authored stage candidate per run, preserving the same evidence packet requirements. Do not skip forward two stages in one uncontrolled batch.

## Ownership

Do not touch `src/experiences/ohmdal-playcanvas/experimental-vfx/**`; that is reserved for MiniMax/OpenCode trial work.

When Luna A4B is running, do not edit navigation/collision/runtime files in parallel.

## Validation

At minimum:

```bash
npm run loop:ohmdal-arco1-authored:validate
npm run build
npm test
```

If player-facing/navigation/interactions changed:

```bash
npm run playtest:ohmdal-golden-path
```

Use FAST hardware capture for visual iteration and record `softwareRendered`/renderer diagnostics. Do not claim hardware performance unless `softwareRendered=false`.

## Do not

- use Codex Sol;
- mark stage accepted;
- modify canon/curriculum;
- invent final dialogue;
- spend Meshy/Tripo credits;
- upgrade engine/dependencies;
- weaken tests/budgets;
- redesign accepted topology;
- edit MiniMax experimental VFX scope.

## Report

`agent-work/reports/workers/ohmdal-authored-gemini-current.md` must contain:

- base SHA;
- branch;
- candidate commit SHA;
- files changed;
- tests/build/Golden Path results;
- capture paths and GPU diagnostics;
- remaining visual/gameplay debt;
- exact current git status;
- explicit line: `SELF_ACCEPTANCE: false`.
