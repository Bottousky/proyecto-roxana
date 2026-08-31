# Worker Task — Ohmdal A4B Navigation + Scenic Shell

## Worker

Executor: **Codex / Luna Max**.

Start only after A4 Castle candidate has been frozen/accepted and your worktree/branch is based on that exact accepted A4 SHA.

## Scope

Mechanical production hardening only. Implement the contracts:

- `docs/20-worlds/ohmdal/production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_SCENIC_RENDERING_POLICY.md`

Do not perform open-ended art direction.

## Primary ownership

Allowed load-bearing scope:

- `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`
- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`
- `src/experiences/ohmdal-playcanvas/systems/zones/**`
- new `src/experiences/ohmdal-playcanvas/systems/navigation/**` if useful
- `src/experiences/ohmdal-playcanvas/visualHarness.ts` only for collision/navigation diagnostics
- zone builder files only where required to register/couple solid geometry with collision
- focused tests under `tests/`
- Golden Path/playtest plumbing only if assertions need extension
- evidence report under `agent-work/reports/workers/`

Do not edit `src/experiences/ohmdal-playcanvas/experimental-vfx/**`.

## Required outcomes

1. **Zone-local collision ownership**
   - collision checks know which zone owns a solid;
   - inactive-zone solids do not block normal movement;
   - shared threshold solids are explicit.

2. **Solid geometry invariant**
   - load-bearing visible walls/large blockers cannot silently omit collision;
   - prefer `addSolidBox`/equivalent or an auditable mapping;
   - scenic/decorative geometry remains clearly non-solid.

3. **Semantic transition anchors**
   - replace scattered hardcoded target yaws where practical with `position + lookAt/directionIntoZone`;
   - derive facing from destination direction.

4. **Correct spawn/facing**
   - initial Portal arrival faces into Plaza/Ohm;
   - Plaza ↔ Taller;
   - Plaza ↔ Manantial;
   - Plaza ↔ Castillo;
   - Castillo ↔ Forja/Terrazas;
   - Forja/Terrazas ↔ Faro;
   - return path back to Plaza;
   - no immediate ping-pong transition after spawn.

5. **Collision diagnostics**
   - deterministic hook or debug overlay exposing active solids/portals/player radius;
   - enough evidence to compare visible walls against collision coverage.

6. **Automated tests**
   - door-facing contract for every major transition;
   - representative wall-challenge tests per authored zone;
   - corners/closed gates included where load-bearing.

7. **Interior/scenic enclosure**
   - close accidental large sky-dome holes in interiors;
   - only intentional doors/windows/patios show outside;
   - prove at least one cheap adjacent-zone/scenic proxy where needed;
   - do not attempt final sky art or a new renderer architecture.

8. **Regression safety**
   - Golden Path remains green;
   - zone lifecycle/lazy loading preserved;
   - no engine/dependency change.

## Validation

Run focused tests during implementation and at close:

```bash
npm run build
npm test
npm run playtest:ohmdal-golden-path
npm run smoke:play
npm run loop:ohmdal-arco1-authored:validate
```

If FAST capture tooling is available, capture at least:

- Portal arrival facing into Plaza;
- Taller interior enclosure;
- Castle entry facing into destination;
- collision debug evidence.

Record renderer diagnostics.

## Acceptance boundary

You may commit/push an A4B candidate. You must not set A4B `passed` or advance A5 yourself.

## Stop/HUMAN_GATE conditions

Stop and report instead of guessing if:

- accepted topology must materially change;
- a physics engine/new major dependency appears necessary;
- a visual/canon decision is required;
- three bounded attempts cannot resolve a blocker.

## Report

Create `agent-work/reports/workers/ohmdal-a4b-luna.md` with:

- accepted A4 base SHA;
- worker branch;
- candidate commit SHA;
- exact files changed;
- new collision/navigation abstraction;
- transition anchor table;
- tests and results;
- Golden Path result;
- capture/debug evidence;
- remaining debt;
- `SELF_ACCEPTANCE: false`.
