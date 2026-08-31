# Gemini context review — Ohmdal Arco I G1 Manantial

## Role

Independent read-only context reviewer. Model: Gemini 3.7 Flash High, effort
high. Do not edit files, run shell commands, invoke paid providers, or decide
architecture for Sol.

## Objective

Distill the smallest authoritative implementation contract for G1 Manantial /
central hydroelectric greybox. Identify what is ratified, what remains unknown,
and the concrete evidence a player must produce before G1 can pass.

## Read first

- `agent-work/loops/ohmdal-arco1-greybox/LOOP.md`
- `docs/20-worlds/ohmdal/AGENTS.md`
- `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md`
- `docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`
- `docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md`
- `docs/20-worlds/ohmdal/gameplay/ohmdal-puzzle-grammar_v1.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`

## Current implementation evidence

- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`
- `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts`
- `src/experiences/ohmdal-playcanvas/systems/zones/zoneLifecycle.ts`
- `scripts/gameplay/playtest-ohmdal-golden-path.mjs`

## Output

Return a compact Spanish report containing:

1. `G1 CONTRACT`: exact player-facing causal chain and progression seam.
2. `RATIFIED`: mechanics, spaces, measurements and consequences explicitly
   supported by the sources, with file/section citations.
3. `DO NOT INVENT`: lore, dialogue, electrical content or sequencing that is
   missing/ambiguous.
4. `IMPLEMENTATION MAP`: up to five bounded work packages, classified as Sol
   structural, Luna mechanical or MiniMax proposal-suitable, with disjoint file
   suggestions when evidence permits.
5. `ACCEPTANCE`: focused tests and observable runtime evidence for desktop and
   touch/mobile.
6. Up to five load-bearing risks only.

Do not review Plaza polish and do not propose reopening the Plaza loop.
