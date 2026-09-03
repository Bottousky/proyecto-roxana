# Worker Task — Ohmdal Player-Facing B-Series Primary Builder

## Worker

Primary executor: **Gemini 3.8 Flash High / Antigravity CLI / effort high / workspace-write**.

Run in an isolated worktree/branch based on latest `origin/fix/ohmdal-arco1-player-facing-bseries`.

Worker branch: `worker/gemini-player-facing`.

## Authority

You are a builder, not acceptance authority. You may implement, test, capture, commit and push candidate milestones. You must not mark your own stage `passed`, advance canonical state, or set the loop `complete`.

## Read minimum

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-player-facing/state.json`
4. `agent-work/loops/ohmdal-arco1-player-facing/LOOP.md`
5. `docs/20-worlds/ohmdal/production/ARCO1_PLAYER_FACING_CORRECTION_PASS.md`
6. only source/tests directly relevant to the current B-stage

Do not reopen historical prototypes or redesign later Arco I regions.

## Dynamic execution rule

Inspect `state.json` before editing and implement **exactly the current stage**.

### B0 — first-minutes audit

Do not implement product changes unless needed only to create non-invasive diagnostics.

Reproduce and report:

- Portal -> Edda -> Ohm -> Lumen first-minutes path;
- Edda visibility/staging behavior;
- dialogue HUD/portrait wiring;
- pointer-lock lifecycle after dialogue;
- mobile/touch movement, camera, interaction and dialogue advance;
- current cinematic/persistence hooks;
- exact source seams for B1–B5.

Run baseline build/tests and capture representative evidence.

### B1 — Portal/Edda/dialogue HUD

Implement only:

- first-entry skippable arrival cinematic;
- persistence so it does not replay on normal re-entry;
- guaranteed visible Edda staging before first line;
- compact RPG dialogue presentation;
- actual portrait usage for named NPCs in this slice using existing assets/rendered character imagery where practical;
- click/tap on dialogue box to advance when no choice is present.

Do not implement Ohm's puzzle yet except seams required for B2.

### B2 — Ohm continuity puzzle

Implement:

- natural curiosity cue toward dormant Ohm;
- rear inspection interaction;
- ZoomIn/in-world inspection mode attached to Ohm;
- deterministic cable/terminal continuity puzzle;
- physical progress/completion feedback;
- Ohm awakening only after valid puzzle completion;
- Edda's approved awakening reaction and transition of objective toward Lumen;
- touch-operable puzzle controls.

Do not convert this into multiple choice, arithmetic or a glowing one-button tutorial.

### B3 — dialogue pedagogy rewrite

Rewrite early dialogue only within approved scope.

Rules:

- student is curious/non-expert;
- remove exam-like value/formula recital before gameplay experience;
- Edda retains superstition/incense/ritual humor;
- technical vocabulary follows physical experience where possible;
- bounded wording polish is authorized;
- do not change canon facts, relationships or curriculum order.

### B4 — compass + pointer-lock lifecycle

Implement:

- restrained compass/heading affordance supporting west references;
- subtle initial west/target emphasis after Edda directs player to Lumen;
- interaction state remembers whether desktop exploration was pointer-locked;
- normal dialogue/interaction completion restores camera control without an extra meaningless click where browser interaction policy permits;
- explicit Escape/menu unlock is respected;
- touch path does not depend on pointer lock;
- regression tests around state lifecycle.

### B5 — mobile/touch + landscape-first

Implement/fix:

- touch movement;
- right-side/free-look camera drag;
- reliable touch interaction;
- dialogue tap-to-advance;
- Ohm puzzle touch solve;
- safe-area insets/readability;
- progressive fullscreen/orientation-lock attempt after user gesture where supported;
- polished rotate-device gate in portrait when landscape lock is unavailable/denied;
- automatic continuation when landscape is detected.

Do not hard-fail browsers without orientation-lock support.

### B6 — validation-only first-minutes freeze

Do not invent new scope. Run and document:

- desktop first-minutes path;
- mobile/touch first-minutes path;
- full existing Arco I Golden Path regression;
- console/page errors;
- representative captures.

If a bug is found, report FAIL for Mavis to issue a bounded repair packet rather than silently expanding scope.

## Validation

Always run at minimum:

```bash
node scripts/agents/validate-bounded-loop-state.mjs agent-work/loops/ohmdal-arco1-player-facing/state.json
npm run build
npm test
```

For any player-facing runtime/interactions change:

```bash
npm run playtest:ohmdal-golden-path
```

Use real browser evidence for pointer-lock and touch claims. CSS inspection alone is not sufficient.

## Evidence report

Write/update:

`agent-work/reports/workers/ohmdal-player-facing-gemini-current.md`

It must begin with exact Candidate Protocol v2 fields:

```text
CANDIDATE_MODE: implementation
BASE_SHA: <exact 40-hex SHA>
IMPLEMENTATION_SHA: <exact 40-hex implementation SHA>
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false
```

For B0/B6 validation-only work when canonical already contains implementation:

```text
CANDIDATE_MODE: validation-only
BASE_SHA: <exact current canonical 40-hex SHA>
IMPLEMENTATION_SHA: NONE
EVIDENCE_STATUS: PASS|FAIL
SELF_ACCEPTANCE: false
```

Then include:

- current stage;
- branch;
- files changed;
- tests/build/Golden Path results;
- browser/touch evidence and capture paths;
- exact reproduced/fixed behaviors;
- known debt/out-of-scope observations;
- exact current git status.

## Do not

- mark your stage accepted;
- edit canonical loop status as authority;
- change engine/major dependencies;
- change room topology;
- change curriculum sequence/canon facts;
- spend paid generation credits;
- weaken tests to achieve PASS;
- use permanent copper glow as generic feedback;
- redesign later Arco I regions;
- run overlapping concurrent edits with another implementation worker on the same files.
