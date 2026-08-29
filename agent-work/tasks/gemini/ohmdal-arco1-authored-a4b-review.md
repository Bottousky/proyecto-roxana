# Gemini peer task — A4B Navigation + Scenic Shell Hardening

Act as the independent read-only reviewer for A4B of the Ohmdal Arco I authored
pass. Review only the supplied evidence. Do not edit files, run shell, invent
canon, redesign the validated route, or extrapolate later-region quality.

## Read only

- `docs/20-worlds/ohmdal/production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_SCENIC_RENDERING_POLICY.md`
- `agent-work/reports/workers/ohmdal-a4b-luna.md`
- `src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalNavigation.ts`
- `src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalSpawnAnchors.ts`
- `tests/ohmdal-navigation.test.ts`

## Evaluate

1. Does the navigation architecture properly isolate collision solids by active zone?
2. Are transition spawn anchors derived from lookAt / direction into zone rather than scattered hardcoded yaws?
3. Are the wall challenge tests and door clearance invariants verified without immediate ping-pong?
4. Are interior enclosures (Workshop ceiling, doorway facade proxy) adhering to scenic policy?
5. Is there any blocker preventing integration and advancing to A5?

## Return

- `VERDICT: PASS | PARTIAL | FAIL`
- `PLAYER_FACING_BLOCKERS`
- `NON_BLOCKING_DEBT`
- `DO_NOT_FIX`
- `A4B_ACCEPTANCE: YES | NO`
