# Ohmdal Arco I — Player-Facing Correction Loop (B-Series)

## Mission

Turn the verified A0–A8 authored baseline into a strong first-player experience without reopening world architecture.

Canonical design contract:

- `docs/20-worlds/ohmdal/production/ARCO1_PLAYER_FACING_CORRECTION_PASS.md`

Baseline:

- merged A-series milestone: `fcc49441c9bb403a0c51d68c78638ee7215f2c52`
- canonical development branch for this loop: `fix/ohmdal-arco1-player-facing-bseries`

## Authority and execution

- **ChatGPT web / GPT-5.6 Sol** — design/technical authority for material ambiguity and contract changes.
- **Mavis / Gemini 3.7 Flash Medium / Antigravity** — persistent operational orchestrator.
- **Gemini 3.7 Flash High / Antigravity** — preferred primary builder, isolated worker branch/worktree, no self-approval.
- **Gemini Flash High fresh read-only session** — independent reviewer.
- **Codex Luna Max** — bounded mechanical worker when Mavis isolates a narrow non-creative packet.
- **Codex Sol** — break-glass only.

Single-builder remains the default. Do not run overlapping implementation workers on the same files/state.

## Bounds

- max 3 iterations per stage;
- max 5 fixes per repair packet;
- max 1 structural fix per iteration;
- no engine/dependency/canon/curriculum/topology changes;
- no paid generation without HUMAN_GATE;
- no worker self-approval;
- dialogue wording inside the approved B-series intent is explicitly authorized and is not a HUMAN_GATE.

## Stage sequence

### B0 — Reproduce + first-minutes audit

Goal: establish deterministic reproduction/evidence for the reported issues before changing behavior.

Required:

- reproduce desktop first-minutes flow from Portal through instruction to Lumen;
- confirm Edda staging/visibility failure mode;
- confirm pointer-lock reacquisition failure;
- confirm current touch/mobile movement/camera/dialogue behavior;
- inventory existing portrait support and current dialogue data;
- identify current intro/cinematic hooks and persistence location;
- record precise implementation seams for B1–B5;
- no redesign beyond the approved contract.

PASS evidence: focused audit report + current screenshots/captures + relevant source locations + clean build/tests baseline.

### B1 — Portal arrival + Edda staging + RPG dialogue HUD

Implement first-entry cinematic, guaranteed visible Edda staging and the dialogue presentation contract including portraits and click/tap-to-advance.

PASS requires focused tests/build, desktop capture and independent review. If interaction state is touched, run Golden Path regression.

### B2 — Ohm curiosity + ZoomIn continuity puzzle + awakening

Implement the player motivation cue, rear inspection mode, deterministic cable/continuity puzzle, physical feedback and Edda awakening reaction.

The puzzle must teach by interaction, not by question text or arithmetic.

PASS requires puzzle-state tests, desktop + touch interaction evidence, build, Golden Path regression and independent review.

### B3 — Early dialogue pedagogy rewrite

Rewrite early Portal/Plaza/Ohm/Lumen-facing dialogue to remove premature technical examination and keep the student curious/non-expert while preserving Edda's superstition/ritual voice.

Bounded wording polish is pre-authorized by the design contract. Canon/curriculum changes are not.

PASS requires dialogue-content review against the product rule plus build/tests.

### B4 — Compass/orientation + camera-control lifecycle

Add restrained orientation HUD and repair desktop pointer-lock/camera reacquisition after normal dialogue/interaction completion.

PASS requires deterministic interaction-state regression tests plus real-browser verification that normal dialogue completion does not demand a meaningless extra click.

### B5 — Mobile/touch + landscape-first

Make movement, camera look, interaction, dialogue and Ohm puzzle function on touch. Add progressive landscape lock/rotate-device fallback and safe-area handling.

PASS requires real touch/mobile browser evidence at representative phone landscape dimensions and portrait rotate-gate behavior.

### B6 — First-minutes human Golden Path freeze

Run the exact first-minutes path defined by the design contract on desktop and mobile/touch.

Do not mark complete from unit/build evidence alone. B6 is a player-facing acceptance gate.

PASS requires:

- all B-series acceptance bullets satisfied;
- no functional console/page errors;
- existing full Arco I Golden Path still passes or any failure is proven unrelated and resolved before completion;
- fresh independent reviewer PASS;
- canonical branch clean and pushed.

## Candidate protocol

Builders prepare candidates but never accept them.

Every worker evidence report starts with:

```text
CANDIDATE_MODE: implementation|validation-only
BASE_SHA: <40-hex>
IMPLEMENTATION_SHA: <40-hex>|NONE
EVIDENCE_STATUS: PASS|FAIL
SELF_ACCEPTANCE: false
```

Implementation candidates must contain substantive implementation changes beyond the report. Validation-only candidates may only change the evidence report.

## Overnight continuation rule

Mavis may progress B0 -> B6 autonomously when each stage is fully specified and mechanically accepted by independent review + deterministic gates.

Do not stop merely because a stage ended. After accepting a stage, update state, push canonical and dispatch the next already-specified stage in the same/next immediate tick.

Do stop for a genuine HUMAN_GATE.

## HUMAN_GATE

Stop only for:

- contradictory design/canon/curriculum requirements;
- engine/major dependency/topology change;
- paid spend/credential action;
- destructive Git recovery;
- repeated bounded failure beyond 3 cycles;
- material UX direction not resolved by `ARCO1_PLAYER_FACING_CORRECTION_PASS.md`.

The following are explicitly **not** HUMAN_GATEs in this pass:

- polishing exact dialogue wording inside approved intent;
- choosing sensible animation timings inside the stated beat;
- choosing implementation details for portrait rendering from existing assets;
- choosing the exact visual styling of the compact RPG dialogue box/compass within Ohmdal's existing visual language;
- choosing deterministic cable geometry/topology for the introductory continuity puzzle as long as the pedagogical contract is preserved.
