# Gemini task — Ohmdal Arco I authored stage review

Act as an independent read-only visual/gameplay reviewer for the CURRENT authored-pass stage specified by Sol in the context provided with this task.

Read only the supplied stage files, relevant region pack, canonical-shot contract, visual/material bible, screenshots/manifests and diagnostics. Do not modify files, run shell, invent missing evidence or review unrelated regions.

Evaluate:

1. authored form and silhouette;
2. composition/navigation readability;
3. material coherence with Ohmdal;
4. lighting/shadow discipline;
5. electrical/hydraulic cause-and-effect readability;
6. interaction readability and mobile/touch concerns;
7. before/after state clarity;
8. VFX restraint/physical meaning where present;
9. performance regressions visible in supplied diagnostics;
10. regression against the closed greybox/accepted Plaza baseline.

Return:

- `VERDICT: PASS | PARTIAL | FAIL`
- up to 5 prioritized findings, each with evidence and severity;
- `PLAYER_FACING_BLOCKERS`;
- `NON_BLOCKING_DEBT`;
- `DO_NOT_FIX` items that would risk unnecessary redesign;
- whether another iteration is justified.

Do not approve missing evidence. Do not propose canon/engine/dependency changes. Sol owns final acceptance.
