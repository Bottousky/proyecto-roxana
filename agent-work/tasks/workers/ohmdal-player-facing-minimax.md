# Worker Task — Ohmdal Player-Facing B-Series / MiniMax M3

## Worker

Primary temporary executor while Antigravity quota is exhausted:

- OpenCode CLI
- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- isolated worktree / branch `worker/minimax-player-facing`
- filesystem + terminal tools enabled through OpenCode

You are a builder, not acceptance authority. Never mark your own stage accepted or advance canonical loop state.

## Read minimum

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `agent-work/loops/ohmdal-arco1-player-facing/state.json`
4. `agent-work/loops/ohmdal-arco1-player-facing/LOOP.md`
5. `docs/20-worlds/ohmdal/production/ARCO1_PLAYER_FACING_CORRECTION_PASS.md`
6. only source/tests directly relevant to the current stage

Do not reopen historical prototypes or later-region scope.

## Dynamic rule

Inspect state first and implement **exactly the current B-stage**.

### B2 — Ohm continuity puzzle

Implement the approved event:

- dormant Ohm gets a natural curiosity cue;
- player inspects Ohm from the rear hatch;
- inspection enters a real ZoomIn/in-world interaction mode attached to Ohm;
- player manipulates cable/terminal continuity to close a deterministic path;
- progress has physical feedback;
- Ohm cannot awaken through plain Interact or dialogue bypass;
- valid continuity completion triggers the awakening event;
- Edda reacts strongly and redirects the objective toward Lumen;
- puzzle is fully operable by touch as well as desktop input;
- no arithmetic quiz, multiple choice or one-button fake puzzle.

Prefer a small pure puzzle-state module plus rendering/input glue so continuity can be tested deterministically.

### B3 — dialogue pedagogy rewrite

Only early dialogue. Preserve canon and approved characterization:

- student is curious/non-expert and speaks less;
- no premature formula/value recital;
- Edda retains superstition/incense/ritual humor;
- technical names follow experienced phenomena where practical;
- Ohm is concise rather than lecturing;
- exact wording may be polished inside the approved intent.

### B4 — compass + pointer-lock lifecycle

Implement:

- restrained heading/compass affordance supporting west references;
- brief west/target emphasis after Edda directs player to Lumen;
- normal desktop interaction/dialogue completion restores camera control without a meaningless extra click when browser policy permits;
- explicit Escape/menu unlock remains respected;
- touch path never depends on pointer lock;
- deterministic lifecycle tests plus real-browser evidence.

### B5 — mobile/touch + landscape-first

Implement/fix:

- touch movement;
- right-side/free-look camera drag;
- reliable touch interaction;
- dialogue panel tap-to-advance;
- Ohm puzzle touch solve;
- safe-area/readability;
- fullscreen/orientation-lock attempt only after a user gesture where supported;
- portrait fallback asking the player to rotate device when lock is unavailable/denied;
- auto-dismiss fallback in landscape.

Do not hard-fail unsupported orientation APIs.

### B6 — validation-only freeze

Do not invent new scope. Validate the exact first-minutes route on desktop and mobile/touch, then run the existing full Arco I Golden Path. If a functional bug exists, report FAIL so Mavis can issue a bounded repair packet.

## Validation

At minimum:

```bash
npm run loop:ohmdal-arco1-player-facing:validate
npm run build
npm test
```

For runtime/player-facing changes:

```bash
npm run playtest:ohmdal-golden-path
```

Pointer-lock/mobile/touch claims require browser evidence, not CSS/source inspection alone.

## Candidate Protocol v2

Write/update:

`agent-work/reports/workers/ohmdal-player-facing-minimax-current.md`

Implementation candidate header:

```text
CANDIDATE_MODE: implementation
BASE_SHA: <exact 40-hex canonical base>
IMPLEMENTATION_SHA: <exact 40-hex implementation commit>
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false
```

Validation-only B6:

```text
CANDIDATE_MODE: validation-only
BASE_SHA: <exact current canonical SHA>
IMPLEMENTATION_SHA: NONE
EVIDENCE_STATUS: PASS|FAIL
SELF_ACCEPTANCE: false
```

Then record stage, branch, files, tests/build/playtest, browser evidence, known debt and exact git status. Commit implementation first, then evidence, and push `worker/minimax-player-facing`.

## Cost boundary

The current GMI MiniMax Week promotion makes M3 free through 2026-09-06. Do not intentionally consume paid generative credits after/beyond the free route. If provider output indicates billing is required, quota is unavailable, authentication fails, or the model cannot be selected, stop and report the provider failure; Mavis will use the Codex Luna fallback.

## Hard boundaries

- no self-acceptance;
- no engine/major dependency changes;
- no room topology changes;
- no canon/curriculum-order changes;
- no paid generation;
- no weakening tests;
- no concurrent overlapping edits with another builder;
- no force push or destructive reset.
