---
name: roxana-game-production
description: Produce, test, play, repair, compare and review Proyecto Roxana game milestones using Task/Learning Contracts, paired spikes, engine-specific AI tooling and the bounded Player-Agent loop. Use for gameplay, world building, rendering, assets, level design, engine spikes, playtest QA and game-dev debugging. Do not use for unrelated software work.
license: internal
compatibility: codex, opencode, agent-skills
metadata:
  project: proyecto-roxana
  domain: web-game-development
---

# Roxana Game Production

This skill is a **router**, not a second source of truth.

## Load first

1. `/AGENTS.md`
2. nearest `docs/20-worlds/<scope>/AGENTS.md`
3. authority docs named by that scope/task
4. relevant file(s) under `docs/80-production/agentic/`

Do not load the entire docs tree.

## Choose the workflow

### Normal game milestone

Load:
- `docs/80-production/agentic/WORKFLOW.md`
- `docs/80-production/agentic/TASK_CONTRACT_TEMPLATE.md`
- `docs/80-production/agentic/DEFINITION_OF_DONE.md`

Follow:

`contract → build → mechanical gate → Player Agent → repair if needed → adversarial review → Director/human gate`.

### Engine/renderer/representation uncertainty

Load:
- `docs/80-production/agentic/SPIKE_POLICY.md`
- `docs/80-production/agentic/ENGINE_MATRIX.md`
- `docs/80-production/agentic/GAME_DEV_AI_TOOLING.md`

Never blend two candidates into one spike. Same baseline/core/builder/harness/learning contract; isolated A and B implementations.

### Engine-specific task

Load only the relevant section of `GAME_DEV_AI_TOOLING.md`, then load/install external engine skills **on demand** if their license/provenance is acceptable.

Do not add runtime dependencies or upgrade engine versions implicitly.

## Learning rule

For pedagogical gameplay, technical success is insufficient.

The task must make clear:
- what the player can perceive before theory;
- what they manipulate;
- what they can predict;
- what consequence they observe;
- what a reasonable failure teaches;
- what variant/transfer tests understanding;
- when formalization appears.

If this cannot be stated, escalate the design instead of implementing a quiz-shaped placeholder.

## Player Agent rule

The Player Agent is separate from Builder/Repair.

Blind-first: goal + controls + starting state, no diff/tests/internal solution before the first play pass. After playing, use Playwright/debug hooks/source to reproduce findings.

## Loop rule

Normal repair budget: 1–3.
Hard cap: 5.
If the same defect survives two informed fixes, explicitly question spec/representation/architecture before another patch.

Never use “keep going until AAA” as a stop condition.

## External material

Do not copy code/assets/skills wholesale without verifying license/provenance. Prefer pinned/traceable source. A visual demo without reproducible source can inspire a reference but cannot establish architecture.

## Finish

Return `PASS | FAIL | ESCALATE` plus only the evidence needed to reproduce the result.
