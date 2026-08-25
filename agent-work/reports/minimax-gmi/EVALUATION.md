# MiniMax GMI evaluation log — Ohmdal Arco I

## E2-G1-VFX-001 — Manantial electrical activation

- `TASK_ID`: `E2-G1-VFX-001`
- `MODEL`: `MiniMaxAI/MiniMax-M3`
- `CONTEXT_FILES`: `world/manantial/buildManantialShell.ts`,
  `visualHarness.ts`, `OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- `ELAPSED_MS`: `100229`
- `USAGE_IF_REPORTED`: prompt `5525`, completion `12000`, total `17525`
- `FIRST_PASS`: `partial`
- `SOL_REPAIR_COUNT`: `0` integrated repairs; proposal was intentionally not
  integrated verbatim
- `TEST_RESULT_AFTER_INTEGRATION`: `NOT_INTEGRATED`
- `GEMINI_SCORE_IF_VISUAL`: `n/a` (no capture-worthy implementation)
- `REUSABLE`: `yes`, as a settings/budget decomposition only; exact code `no`
- `HALLUCINATION_OR_SCOPE_ERRORS`: proposes a large eight-file shader/layer
  package before gameplay truth exists; contains inconsistent target paths;
  relies on unverified PlayCanvas layer, shader and texture upload APIs; includes
  repeat/ambient behavior that must be reconciled with event-only emission.
- `WOULD_PAY_FOR_THIS_OUTPUT`: `no`
- `NOTES`: The response was fast and supplied concrete knobs, deterministic
  timing ideas and mobile budgets. It did not save integration time for G1
  because verifying/repairing the engine-specific package would cost more than
  a small event-driven greybox effect. Keep as reference for the post-greybox
  VFX pass; do not delay Arco I progression.

Evidence: `ohmdal-arco1-g1-electricity-vfx.md`.

## E1-SCENE-TEST-001 — Late-zone scene contract test

- `TASK_ID`: `E1-SCENE-TEST-001`
- `MODEL`: `MiniMaxAI/MiniMax-M3`
- `CONTEXT_FILES`: `world/arc1/buildArc1Greybox.ts`,
  `tests/ohmdal-zone-lifecycle.test.ts`
- `ELAPSED_MS`: `27689`
- `USAGE_IF_REPORTED`: prompt `7060`, completion `2918`, total `9978`
- `FIRST_PASS`: `partial`
- `SOL_REPAIR_COUNT`: `3` load-bearing regex/contract repairs
- `TEST_RESULT_AFTER_INTEGRATION`: `PASS` via
  `node --experimental-strip-types tests/ohmdal-arc1-greybox-scene.test.ts`
- `GEMINI_SCORE_IF_VISUAL`: `n/a`
- `REUSABLE`: `yes`
- `HALLUCINATION_OR_SCOPE_ERRORS`: root-variable regex used entity names instead
  of the actual variables; Castle dormant-lens regex assumed three expanded
  call sites instead of the shared helper; stated collider coverage without
  implementing it. The proposal was also much longer/brittler than needed.
- `WOULD_PAY_FOR_THIS_OUTPUT`: `no` at this quality/cost point
- `NOTES`: M3 supplied a useful checklist and test scaffold in 28 seconds. Sol
  reduced it to semantic, formatting-tolerant assertions and corrected the
  false assumptions. It saved some enumeration work but did not beat a small
  Luna/Sol contract test decisively.

Evidence: `ohmdal-arco1-scene-contract-test.md`,
`tests/ohmdal-arc1-greybox-scene.test.ts`.

## E1-RUNTIME-AUDIT-001 — Runtime/model wiring audit

- `TASK_ID`: `E1-RUNTIME-AUDIT-001`
- `MODEL`: `MiniMaxAI/MiniMax-M3`
- `CONTEXT_FILES`: `playcanvasRuntime.ts`, `arc1GreyboxModel.ts`
- `ELAPSED_MS`: `59366`
- `USAGE_IF_REPORTED`: prompt `25530`, completion `4535`, total `30065`
- `FIRST_PASS`: `fail`
- `SOL_REPAIR_COUNT`: `0`; no proposed patch accepted
- `TEST_RESULT_AFTER_INTEGRATION`: `NOT_INTEGRATED`
- `GEMINI_SCORE_IF_VISUAL`: `n/a`
- `REUSABLE`: `no`
- `HALLUCINATION_OR_SCOPE_ERRORS`: claimed documentation could restore Castle
  without energization while citing the opposite `restored` condition; claimed
  Plaza was not deactivated on Castle entry although `castle_route` does so;
  treated the intentional hardening seam (Plaza active beside Manantial) as a
  lifecycle bug; declared touch unavailable without being given `main.ts`,
  `index.html` or CSS; claimed final return omitted `enterArc1Region` although
  the runtime calls it; misunderstood `load: () => undefined`, which the
  lifecycle resolves and marks loaded.
- `WOULD_PAY_FOR_THIS_OUTPUT`: `no`
- `NOTES`: High context/usage did not yield a reliable audit. One observation
  about repeated Campana input suggested a harmless idempotence hardening, but
  it was not a demonstrated progression blocker and did not justify accepting
  the report's patches.

Evidence: `ohmdal-arco1-runtime-audit.md`.
