# MiniMax M3 Task — Castle branch-state readability

## Objective

Given the actual authored Castle scene code and electrical model, propose a minimal set of visual state cues that make branch distribution/protection readable without a detached schematic UI.

## Context

Attach only:

- Castle scene builder/runtime files;
- `arc1GreyboxModel.ts` or successor electrical-state model;
- `OHMDAL_VISUAL_MATERIAL_BIBLE.md`;
- `OHMDAL_INTERACTION_POLICY.md`;
- `ARCO1_AREA_REFERENCE_PLAN.md`.

## Constraints

- proposal-only;
- no architecture rewrite;
- no new dependencies;
- no permanent glowing copper;
- cues must map to actual branch/service/protection states;
- world-scale first; diegetic panel close-up allowed only for dense precision;
- no arbitrary red/green answer lights as sole feedback;
- at most 3 cue types and at most 2 small code modules.

## Return

- state→cue table;
- exact scene integration points;
- implementation sketch;
- mobile/readability considerations;
- performance estimate;
- uncertain API/assumption list.

Do not claim the current Castle is wrong unless the supplied code demonstrates it. Sol verifies every claim.
