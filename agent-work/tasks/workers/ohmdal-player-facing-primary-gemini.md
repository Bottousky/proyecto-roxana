# Worker Task — Ohmdal Player-Facing B-Series Primary Builder

## Worker

Primary executor: **Gemini 3.8 Flash High / Antigravity CLI / effort high / workspace-write**.

Run in an isolated worktree/branch based on latest `origin/fix/ohmdal-arco1-player-facing-bseries`.

Worker branch: `worker/gemini38-player-facing`.
Worker worktree: `../Roxana-gemini38-player-facing`.

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

For B2 browser automation, do not require the avatar to enter Ohm's physical collider. The Golden Path must approach a reachable interaction position and use the same interaction radius a human player uses.

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

`agent-work/reports/workers/ohmdal-player-facing-gemini38-current.md`

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

## CURRENT REPAIR PACKET — B2 iteration 0 (Mavis, 2026-09-05)

Dispatch note: repair is routed to Gemini 3.8 on its isolated lane because the
configured Luna lane is the current-stage FAIL lane and has no durable report
available for safe continuation. The fresh independent review found the
implementation structurally sound but B2 acceptance is blocked by missing touch
evidence, premature technical copy, and whitespace hygiene. Treat the concrete
findings below as the only repair scope.

The current Luna candidate reached `ohm-awakened` on desktop, but its Golden Path
runner later timed out during workshop movement; touch-specific B2 evidence is still
missing. Repair only the following bounded items on the existing B2 implementation;
do not redesign the puzzle or expand into B3–B6:

1. Add real browser touch evidence for B2: open rear inspection, manipulate the
   continuity controls, complete the deterministic puzzle, and capture/report the
   result. Fix only B2 touch input if the smoke path proves it broken.
2. Remove the premature numeric/technical `(24 V Zumbando)` presentation from the
   introductory B2 UI while preserving the approved phenomenon-first intent.
3. Fix all whitespace/EOF issues reported by `git diff --check` in the candidate
   scope, without broad formatting churn.
4. Re-run focused tests, build, Golden Path, and the bounded touch smoke; update
   the Gemini38 current report with exact evidence and Candidate Protocol v2.
   Do not self-accept or modify loop authority.

Structural-fix budget: 1 maximum (only if required for the transition race). If the
timeout is outside B2, document it precisely and leave unrelated behavior unchanged.

## CURRENT REPAIR PACKET — B2 iteration 1 (Mavis, 2026-09-05)

The independent Luna review still blocks acceptance on this candidate. Continue on the
existing clean Gemini lane and address only these bounded findings:

1. Preserve or repair the real Chromium touch smoke so it opens rear inspection,
   manipulates continuity controls, solves the puzzle, and records screenshots plus a
   machine-readable PASS artifact.
2. Keep the B2 introductory UI phenomenon-first by removing numeric/technical values
   such as `24 V` from the player-facing source label.
3. Resolve all candidate-scope `git diff --check` whitespace/EOF findings without broad
   formatting churn.
4. Re-run focused tests, build, Golden Path, and dedicated touch smoke; publish exact
   artifacts in the current report with Candidate Protocol v2 and
   `SELF_ACCEPTANCE: false`.

Do not modify loop authority, redesign the puzzle, or expand into B3-B6. Commit the
repair candidate and leave acceptance to the fresh independent reviewer.

## CURRENT REPAIR PACKET — B2 iteration 2 (Mavis, 2026-09-05)

The latest independent review was run against an older candidate identity and reported
FAIL. Before any new acceptance review, refresh the candidate on this same Gemini lane
from the current implementation and publish evidence whose SHA identity matches the
committed tree. Address only these bounded items:

1. Verify the committed touch-smoke script and artifacts are present at the new
   IMPLEMENTATION_SHA, and ensure the report names that exact SHA and machine-readable
   PASS artifact for rear inspection, continuity manipulation, solve, and awakening.
2. Verify no player-facing B2 introductory label or dialogue exposes numeric voltage or
   resistance values; preserve phenomenon-first wording without changing later-stage
   curriculum.
3. Run `git diff --check` against BASE_SHA and fix only candidate-scope whitespace/EOF
   findings, with no broad formatting churn.
4. Re-run focused puzzle tests, build, Golden Path, and dedicated touch smoke. Commit a
   clean candidate and update the report with exact Candidate Protocol v2 fields,
   `SELF_ACCEPTANCE: false`, current stage, SHA, and artifact paths.

Do not modify loop authority, redesign the puzzle, or expand into B3-B6. Do not wait for
review or self-approve; leave acceptance to a fresh independent Luna reviewer.
# B2 REVIEW REPAIR PACKET — 2026-09-05

Fresh Luna review is FAIL. Perform one bounded repair in this isolated
worktree; do not redesign gameplay or alter canon, topology, engine, or deps.

1. Publish final Candidate Protocol v2 identity: exact BASE_SHA
   `4d55de4be50432c7445065cfd42162658a3dfe3d`, stage
   `b2-ohm-continuity-puzzle`, and IMPLEMENTATION_SHA equal to the final
   committed repair SHA.
2. Add/commit real mobile/touch B2 evidence at that exact SHA: rear inspection,
   cable/terminal manipulation, deterministic solve, and Ohm awakening, with
   captures plus machine-readable touch artifact listed in the report.
3. Fix all candidate-owned `git diff --check` issues and leave the worktree
   clean. Run targeted B2 tests, build, desktop Golden Path regression, touch
   smoke, and `git diff --check`. Report PASS only when all genuinely pass,
   with `EVIDENCE_STATUS: PASS` and `SELF_ACCEPTANCE: false`; otherwise report
   FAIL. Commit and push the candidate branch only; never mutate canonical.
