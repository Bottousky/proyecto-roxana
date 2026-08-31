# MiniMax GMI Evaluation — Roxana

## Status

`READY`

## Window

2026-08-24 through 2026-09-06 (GMI MiniMax Week).

## Decision to make

At the end of the trial, decide `BUY` or `DON'T BUY` for a recurring MiniMax plan
based on **Roxana production evidence**, not generic benchmarks or demo quality.

## Provider lane

- Provider: GMI Cloud, OpenAI-compatible API.
- Primary model: `MiniMaxAI/MiniMax-M3`.
- Optional comparison model: MiniMax M2.7 if available on the same key.
- Runner: `scripts/agents/run-gmi-minimax.mjs`.
- Secret: `GMI_API_KEY` in repo-root `.env.local` only.
- Outputs: `agent-work/reports/minimax-gmi/`.
- Authority: proposal-only. Codex/Sol is the sole integrator.

The evaluation lane must remain removable. Do not make GMI a runtime dependency,
CI requirement or generic provider framework.

## Why evaluate

MiniMax is interesting for four potentially distinct Roxana jobs:

1. long/bulk coding work cheaper than frontier reasoning;
2. technical art — procedural VFX, shaders, particles, water/electricity;
3. voice/speech generation callable by agents;
4. music/ambient generation callable by agents.

The first two should be tested directly against active Arco I work. Speech/music
should be evaluated as production workflow/provenance, not as final canon.

## Evaluation tracks

### E1 — Bounded code worker

Give M3 at least two real, isolated Arco I tasks that Luna could plausibly do.
Examples: zone-local interaction logic, data layout, a test fixture, a small
puzzle subsystem or a refactor with exact acceptance criteria.

Measure:

- useful first pass?;
- compile/test repair needed by Sol;
- number/severity of incorrect assumptions;
- amount of context required;
- elapsed time;
- whether the result saved Sol/Luna work.

M3 must never claim tests it cannot execute in the proposal-only GMI lane.

### E2 — Technical-art / VFX worker — priority track

Use real Ohmdal needs and the layered method proven by external Three.js VFX
work: decompose the target phenomenon, provide relevant examples/modules, then
iterate by adding/removing/tuning layers.

Initial fixtures:

1. `electric-conductor-pulse`;
2. `terminal-arc-burst`;
3. composed `ohm-awakening-vfx` or an equivalent Manantial electrical activation.

Target PlayCanvas, not Three.js runtime. Three.js/GLSL projects may be supplied as
technical references; extract the mechanism, not the dependency.

Requirements:

- procedural/runtime effect where practical;
- no sprite-sheet dependency unless justified;
- parameters exposed as settings/API;
- independent layers can be disabled;
- event emission is brief/physical, not permanent fantasy neon;
- mobile-conscious overdraw/draw calls;
- deterministic capture states for review.

Gemini reviews captures/readability; Sol decides integration.

### E3 — Speech workflow

Generate non-canonical voice auditions for at least one short Lumen/Edda test set
using the official GMI/MiniMax route available during the promotion.

Evaluate:

- voice controllability;
- consistency across lines;
- regeneration/variant workflow;
- latency and automation friction;
- provenance metadata;
- quality relative to manual effort.

Do not canonize generated dialogue or voice identity during this evaluation.

### E4 — Music / ambience workflow

Generate small sketches, not final soundtrack masters. Suggested briefs:

- dormant Ohmdal / Plaza;
- Manantial hydroelectric interior dormant;
- restored-system variation.

Evaluate control, musical continuity, loopability, iteration cost, automation and
provenance. Do not block Arco I greybox if media endpoints are unavailable.

## Scorecard per task

Record at minimum:

```text
TASK_ID
MODEL
CONTEXT_FILES
ELAPSED_MS
USAGE_IF_REPORTED
FIRST_PASS: pass / partial / fail
SOL_REPAIR_COUNT
TEST_RESULT_AFTER_INTEGRATION
GEMINI_SCORE_IF_VISUAL: 0..3
REUSABLE: yes / no
HALLUCINATION_OR_SCOPE_ERRORS
WOULD_PAY_FOR_THIS_OUTPUT: yes / no
NOTES
```

Use actual outputs and commits as evidence. A pretty report with no usable result
does not count.

## Buy decision

Recommend `BUY` only if MiniMax demonstrates a recurring differential that is
material to Roxana. Strong evidence would be any combination of:

- reliable code throughput that reduces Sol usage;
- technical-art/VFX quality that would otherwise consume substantial frontier/human time;
- agent-callable voice/music workflow good enough for iteration/preproduction;
- enough volume/parallelism to justify the subscription.

Recommend `DON'T BUY` if most outputs require substantial Sol rewrites, duplicate
Luna cheaply, fail to integrate, or media automation does not materially improve
workflow.

## Relationship to Arco I sprint

This is not a side benchmark. Sol should preferentially delegate real work from
`agent-work/loops/ohmdal-arco1-greybox/LOOP.md` to M3 when the scope is suitable.
Those tasks count as evaluation evidence.

If GMI fails, quota changes, or the promotion ends, disable the lane and continue
Arco I with Sol/Luna/Gemini. No HUMAN_GATE is needed merely because M3 is
unavailable.

## Security

- never print or commit `GMI_API_KEY`;
- do not paste secrets into prompts/reports;
- use `.env.local` or process environment;
- no unreviewed model output may execute shell commands;
- no autonomous paid provider spend.
