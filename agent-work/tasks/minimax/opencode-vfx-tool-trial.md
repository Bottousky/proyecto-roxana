# MiniMax M3 Tool-Enabled Trial — OpenCode + GMI Cloud

## Purpose

Evaluate MiniMax M3 fairly with real filesystem/terminal tools without risking canonical Ohmdal work. This trial must answer whether M3 becomes materially more useful when it can inspect, edit, test and iterate instead of only returning proposal text.

## Harness

- OpenCode CLI
- Provider: GMI Cloud (native OpenCode provider)
- Model: MiniMax M3 / `MiniMaxAI/MiniMax-M3`
- Isolated worktree/branch only

Never paste the GMI API key into this task or any repo file. Configure it locally in OpenCode with `/connect` → GMI Cloud, then select M3 with `/models`.

## Authority

You are an experimental worker, not an integrator or acceptance authority.

You may edit/test/commit only the exact scope below. Do not modify canonical runtime wiring, authored stage state or existing zone builders.

## Read first

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
4. `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`
5. relevant existing PlayCanvas material/update examples only as needed

Do not audit the whole runtime.

## Exclusive file ownership

Create/use only:

- `src/experiences/ohmdal-playcanvas/experimental-vfx/**`
- `tests/ohmdal-minimax-opencode-vfx.test.ts`
- `agent-work/reports/minimax-gmi/opencode-tool-trial.md`

Do not import the experimental modules into `playcanvasRuntime.ts`, `playcanvasWorld.ts` or any authored zone in this trial.

## Task

Build two small composable PlayCanvas-oriented technical-art modules:

### 1. Electric conductor pulse

A restrained event-driven pulse intended to travel along an electrical conductor when a real circuit state changes.

Requirements:

- no permanent copper emission;
- deterministic timing from explicit settings;
- event lifecycle: idle → active → decay → idle;
- exposed settings object;
- mobile-conscious budgets;
- no texture atlas requirement;
- no new dependency;
- reusable independently from a specific zone.

### 2. Terminal arc burst

A short localized micro-arc event for a terminal/contact transition.

Requirements:

- brief, physically readable event;
- no ambient/repeating fantasy lightning;
- deterministic seeded variation if randomness is used;
- settings for lifetime/count/intensity/size;
- lifecycle/disposal explicit;
- no new dependency.

## Testing

Create focused tests for pure state/timing/settings logic. `npm run build` must remain green; if PlayCanvas API usage fails TypeScript/build, repair it before reporting.

At minimum run:

```bash
npm run build
node --experimental-strip-types tests/ohmdal-minimax-opencode-vfx.test.ts
```

Run broader tests only if reasonably bounded.

## Evaluation report

Write `agent-work/reports/minimax-gmi/opencode-tool-trial.md` with:

- base SHA;
- branch;
- model/provider/harness;
- elapsed time if known;
- files created/changed;
- first-pass build result;
- number of self-repairs after compiler/test feedback;
- final test/build result;
- APIs/assumptions that required correction;
- whether the result looks integration-worthy;
- `WOULD_PAY_FOR_THIS_OUTPUT: yes|no|uncertain` with one-paragraph justification;
- candidate commit SHA;
- `SELF_ACCEPTANCE: false`.

## Hard boundaries

- no edits outside exclusive scope;
- no runtime integration;
- no canon/dialogue/curriculum changes;
- no engine/dependency upgrades;
- no Meshy/Tripo or paid spend;
- no auto-merge;
- no stage status changes;
- if the requested API cannot be verified, simplify rather than invent a large framework.
