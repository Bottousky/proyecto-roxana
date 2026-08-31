# Task — Run Ohmdal Arco I Greybox Sprint

## Status

`READY`

## Goal

Execute the bounded loop at:

`agent-work/loops/ohmdal-arco1-greybox/LOOP.md`

until `complete` or a real `HUMAN_GATE`, targeting a playable greybox of the full
Arco I critical path within the current two-week production window.

## Baselines

- technical: `dec2d75abc0adbcddb37988b3955cef4950513f3`;
- Plaza visual: `325e11afac8944efef16411c88628974ff9e8d38`;
- Plaza loop must remain `complete`.

Do not redesign the hardened harness. Use it.

## Required routing

- Sol High: master, partition, integration, stage acceptance.
- Luna Max: mechanical/disjoint work with closed brief.
- MiniMax M3 through GMI: experimental proposal-only worker for suitable real
  tasks; one active proposal by default; results count toward the GMI evaluation.
- Gemini 3.7 Flash High: independent read-only context/fresh-eyes review.

MiniMax task exchange:

- tasks under `agent-work/tasks/minimax/`;
- reports under `agent-work/reports/minimax-gmi/`;
- invoke with `npm run agent:minimax:gmi -- --task ... --context ... --out ...`.

If `npm run agent:minimax:gmi:check` fails, record the reason and continue without
M3; do not stop the gameplay sprint solely for provider availability.

## Production priority

1. systemic gameplay / electrical truth;
2. spatial traversal and zone lifecycle;
3. end-to-end progression;
4. mobile/input readability;
5. automated evidence and regression safety;
6. only then greybox presentation/VFX.

Do not chase final art. Hero/reference gates still apply if a truly identitary
asset must be produced; otherwise prefer neutral greybox geometry.

## Puzzle interaction

Follow:

`docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`

World-first does not mean forcing every tiny terminal into normal first-person
precision. Diegetic maintenance close-ups are allowed and encouraged where they
preserve legibility/accessibility while manipulating the same model.

## Greybox path to finish

```text
Portal / Plaza
→ Taller
→ Manantial / central hidroeléctrica
→ restored Plaza
→ campana / Castle opening
→ Castle network
→ Forge
→ Terraces
→ Faro / Lago
→ return / Arco I close
```

Respect the authoritative Arco I and puzzle docs. Do not invent final dialogue.

## MiniMax evaluation during production

Prefer delegating at least:

- one bounded code task;
- one technical-art/VFX task;
- one additional real task where M3 competes economically with Luna/Sol.

Record usefulness in the evaluation report. Speech/music may be tested in
parallel as non-blocking preproduction artifacts but must not delay greybox.

## Validation

At each stage run focused tests plus the loop-required evidence. Before declaring
mission complete, require at least:

```bash
npm run loop:ohmdal-arco1:validate
npm run verify
npm run smoke:play
npm run playtest:ohmdal-golden-path
```

Extend the Golden Path so the final version traverses the complete Arco I rather
than only the hardened Plaza→Manantial seam.

Final evidence must include desktop/mobile smoke, loaded/active zones, critical
electrical conditions, errors, draw calls, triangles, transferred MB and shadow
counts per relevant loaded-zone configuration.

## Stop conditions

Stop only on `complete` or a HUMAN_GATE defined by the loop. Do not stop merely
because:

- M3/GMI is temporarily unavailable;
- final dialogue is missing;
- final art/reference for non-load-bearing greybox geometry is missing.

Use neutral placeholders and continue where the system can be validated honestly.

## Final report

When complete, report:

- stages/iterations;
- playable route actually traversed;
- puzzle/system implemented per region;
- direct-world vs diegetic close-up interactions used;
- Sol/Luna/M3 contribution split;
- MiniMax evaluation evidence so far;
- Gemini independent verdict;
- performance/mobile diagnostics;
- remaining art, narrative and pedagogy debt;
- exact blockers/HUMAN_GATEs if any;
- commits and remote verification.
