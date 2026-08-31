# MiniMax code task — Arco I greybox scene contract test

## Purpose

Produce one real, isolated E1 code proposal for the active Ohmdal Arco I sprint.
Sol will review, apply and run it. Do not claim execution.

## Ownership boundary

Propose only one new file:

`tests/ohmdal-arc1-greybox-scene.test.ts`

Do not propose edits to the builder, runtime, dependencies or package scripts.

## Contract to validate

Using the attached `buildArc1Greybox.ts` as source evidence, create a focused
Node test in the repository's existing style that proves:

- the three late-Arco-I zone roots exist and start disabled;
- Castle, Forge/Terraces and Lighthouse retain their declared world anchors;
- all required probe target IDs are authored;
- no asset URL, GLB, texture request, Three.js dependency or paid-provider seam
  appears in the greybox builder;
- each zone includes a player-facing entry/panel/load-or-calibration/exit seam;
- event-only visuals start dormant (Castle lenses, Forge core/protection light,
  Lighthouse lamp/signal);
- the builder exposes the runtime handles declared by its public interface;
- the test is robust to harmless formatting and does not lock exact primitive
  counts or decorative details.

Use TypeScript and `node:assert/strict`, consistent with current tests. Prefer
semantic regex/source inspection if constructing a PlayCanvas graphics device
would make this isolated test non-deterministic.

## Output

Return the complete proposed test file and a short list of assumptions. No
additional files. Do not invent gameplay/canon or weaken acceptance.
