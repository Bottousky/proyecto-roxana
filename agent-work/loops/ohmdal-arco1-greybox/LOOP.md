# Ohmdal Arco I Greybox — Bounded Production Loop

## Mission

Produce, in roughly two weeks of autonomous/assisted work, a **playable greybox
of the complete Arco I critical path** while preserving the accepted Plaza
baseline and the hardened production contracts.

Target playable route:

```text
Portal / Plaza
→ Taller de Lumen
→ Manantial / central hidroeléctrica
→ retorno y recuperación observable de Plaza
→ campana / apertura del Castillo
→ Castillo de la Red
→ Forja
→ Terrazas
→ Faro / Lago
→ regreso final / cierre de Arco I
```

This is a **greybox milestone**, not final art or final dialogue. Primitives,
neutral materials and temporary authored geometry are acceptable when they prove
space, interaction, pedagogy and end-to-end progression.

## Baseline

- Technical production baseline: `dec2d75abc0adbcddb37988b3955cef4950513f3`.
- Plaza visual baseline: `325e11afac8944efef16411c88628974ff9e8d38`.
- Plaza loop remains `complete`; never reopen it to manufacture progress.
- Runtime: PlayCanvas Engine v2 + TypeScript + Vite.
- DCC: Blender.
- Zone lifecycle / Golden Path / Visual Harness from hardening remain authoritative.

## Authority set

Read only what the active stage needs, starting with:

- root `AGENTS.md`;
- `docs/20-worlds/ohmdal/AGENTS.md`;
- `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md`;
- `docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`;
- `docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md`;
- `docs/20-worlds/ohmdal/gameplay/ohmdal-puzzle-grammar_v1.md`;
- `docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`;
- active stage task/code only.

When a lore/dialogue detail is not ratified, use `TODO(guion)` and neutral
placeholders. Do not stall the greybox for prose that is not load-bearing.

## Routing

### Sol High — master / integrator

Owns:

- stage plan;
- gameplay architecture and electrical-model decisions;
- spatial/gameplay integration;
- trade-offs and conflict resolution;
- final application of worker proposals;
- tests/validation;
- PASS / CONTINUE / HUMAN_GATE.

### Luna Max — mechanical worker

Use for closed/disjoint work:

- colliders, exits, zone plumbing;
- data layouts / coordinates;
- repetitive scene construction;
- test fixtures and automation;
- manifests/provenance;
- extraction/rewiring with exact behavior preserved.

Maximum two Luna workers concurrently, only on disjoint files/scopes.

### MiniMax M3 via GMI — experimental production worker

During the GMI evaluation window, use for real isolated work where it may save
frontier time:

- first-pass zone-local mechanics/code proposals;
- procedural VFX/shader proposals;
- water/electricity/particle technical-art exploration;
- transformations/recombinations based on attached repo examples;
- bounded bulk work with explicit acceptance criteria.

Invoke through `scripts/agents/run-gmi-minimax.mjs`. It is proposal-only: M3 does
not write the worktree or claim test execution. Sol reviews/applies/tests.

Only one active M3 proposal task at a time by default. Do not ask Luna and M3 to
solve/edit the same scope simultaneously unless Sol explicitly runs an A/B
comparison without integrating both.

If GMI is unavailable or the free window ends, continue with Sol/Luna/Gemini.
MiniMax availability is not a HUMAN_GATE.

### Gemini 3.7 Flash High — reviewer

Read-only independent review through existing Antigravity lane. Use for:

- context distillation when a stage has many references;
- fresh-eyes greybox readability;
- puzzle legibility / evidence review;
- end-of-stage screenshots and diagnostics;
- regression comparison.

Gemini never implements or approves its own work.

## Interaction policy

Default to direct physical interaction in the world. A diegetic maintenance
close-up is allowed where component density/precision would otherwise make the
puzzle fiddly, especially on touch/mobile. The close-up must manipulate the same
underlying electrical model and physical object, not a detached UI minigame.

See `docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`.

## Stage queue

### G0 — hardened baseline — `passed`

Evidence: `dec2d75`.

### G1 — Manantial / central hidroeléctrica greybox

Goal: turn the existing scenic shell/seam into a real playable zone and establish
its electrical/hydraulic causal chain without final art.

Must prove:

- legitimate transition from Omega/Plaza;
- readable hydroelectric spatial layout;
- at least one authentic measurement/diagnosis intervention;
- cause/effect between electrical state and water/machinery;
- restored state that can feed back into Plaza progression;
- zone load/activation budgets remain bounded;
- mobile traversal and interaction are viable.

Do not overbuild VFX/art. One reusable procedural effect may be integrated only
if it helps readability and passes performance.

### G2 — Plaza restoration + bell + Castle opening

Goal: make the return from Manantial visibly meaningful and turn the bell/Castle
sequence into gameplay rather than a scripted flag.

Must prove:

- restored-world state is observable in Plaza;
- campana/relay is a physical consequence of the restored network;
- Castle opening depends on validated electrical conditions;
- existing Plaza baseline is not visually regressed in dormant state;
- restored state can be captured/tested deterministically.

### G3 — Castle of the Network greybox

Pedagogy: series/parallel, distribution, conservation, multiple defensible
configurations.

Must prove:

- navigable Castle network space;
- physical distribution nodes/branches;
- player can isolate/reconfigure service rather than answer a quiz;
- multiple valid solutions when the model supports them;
- at least one productive failure;
- maintenance close-up may be used for dense panels while world-scale loads and
  consequences remain visible;
- closure state unlocks route toward Forge/Terraces.

### G4 — Forge + Terraces greybox

Pedagogy: power, energy, heat, limits, safety and explicit trade-offs.

Must prove:

- Forge and Terraces are spatially distinct but electrically coupled;
- power/irrigation load trade-off is modeled, not scripted;
- protection/conductor decisions have observable consequences;
- failure is recoverable and informative;
- world-scale routing + optional diegetic bench/panel for fine component work;
- successful state does not overload the accepted network model.

Final NPC wording remains placeholder unless ratified.

### G5 — Faro + Lago greybox

Pedagogy: culmination through optimization/synchronization. RC/time content is
used only if its content contract is sufficiently ratified; otherwise implement
the explicitly allowed validated DC culmination seam and document the future RC
upgrade point.

Must prove:

- Faro is a navigable landmark/destination;
- calibration/synchronization is an actual system interaction;
- the player applies knowledge learned earlier, not a new arbitrary mechanic;
- world-scale signal/energy consequence is visible;
- close-up is allowed only for fine calibration, not the whole chapter;
- successful state unlocks return/closure.

### G6 — Return + Arco I closure greybox

Goal: prove the complete loop closes in the world.

Must prove:

- player can return through restored spaces;
- persistent world states reflect prior interventions;
- end-of-arc condition is derived from chapter/system states;
- Bitácora/summary can use neutral placeholders where final writing is missing;
- no fabricated epilogue dialogue;
- clear end marker / handoff for later polish.

### G7 — End-to-end Golden Path / greybox freeze

Extend the automated playtester from Portal through the entire Arco I and final
return using player-facing input/interactions wherever practical.

Must prove:

- no direct mutation used to cheat chapter progression;
- all zone transitions/load states work;
- critical puzzle system conditions are asserted;
- console/page errors are zero or explicitly allowed;
- touch/mobile smoke reaches each major zone;
- transfer/draw-call/triangle/shadow evidence is captured per loaded-zone
  configuration;
- Gemini independent review passes;
- final report distinguishes greybox-complete from art/content-complete.

## Stage procedure

For every active stage:

```text
1. STATE / authority check
2. optional Gemini context distillation
3. Sol defines <=5 fixes/work packages
4. partition ownership
   - Sol structural/gameplay
   - Luna mechanical disjoint work
   - MiniMax M3 one bounded proposal when useful
5. Sol integrates worker output
6. focused tests
7. build/verify relevant gates
8. automated traversal/captures/diagnostics
9. Gemini read-only review
10. Sol decides PASS / CONTINUE / HUMAN_GATE
```

## Limits

- max 3 iterations/stage;
- max 5 fixes/iteration;
- max 1 major structural fix/iteration;
- max 2 concurrent Luna workers;
- max 1 MiniMax proposal task concurrently by default;
- no worker self-approval;
- no automatic paid provider spend;
- no engine/canon/large dependency changes;
- no new agent framework;
- no deleting baselines/tests to manufacture PASS.

## HUMAN_GATE

Stop only for a real material decision, including:

- contradictory/insufficient canon that changes chapter intent;
- paid Meshy/Tripo/generative spend not pre-authorized;
- engine/core schema/major dependency change;
- security/login/permissions issue;
- three failed iterations with no meaningful improvement;
- serious mobile/performance/accessibility regression;
- a hero reference gate that cannot pass.

Missing MiniMax/GMI availability is **not** a human gate.

## Definition of success for the two-week mission

Minimum acceptable outcome:

- the entire critical route Portal→Faro→return is traversable;
- every chapter has at least a functional systemic puzzle/interaction seam;
- Plaza/Taller baseline remains intact;
- world states persist through the run;
- a truthful end-to-end automated Golden Path exists;
- performance/zone loading remain bounded;
- art may still be greybox and dialogue may still contain explicit placeholders.

Do not turn this mission into a final-art sprint. A complete playable greybox is
more valuable than one polished unfinished region.
