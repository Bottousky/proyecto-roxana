# Ohmdal — CURRENT_STATE

> **Preferred "where are we?" file** for any agent working on Ohmdal.
> Read this FIRST after [`../AGENTS.md`](../AGENTS.md) and the root
> [`AGENTS.md`](../../../AGENTS.md). For deep-audit / archaeology, see
> [`RECOVERY_AUDIT.md`](RECOVERY_AUDIT.md) (historical, do not load by default).

## Architecture (CANON)

- **Room-based local coordinates** — `ADR-002` (2026-08-18).
  Each room is an independent scene with **local** `[0..width) × [0..height)`
  coordinates. `RoomGraph` connects them by edges, not by world-plane adjacency.
- **Viewport 960×540 ≠ room size.** A room can be 960×540, 1920×1080, etc.
- **One `ActiveRoom`** owns gameplay at any instant: `{ id, playerLocalPosition }`.
  Camera, navigation, collision, interaction read from it only.
- **Camera is local.** Bounds = the local rect of the active room.
- **Transitions = graph edges.** `fade | doorway | cinematic | seamless`.
  No "shared wall" hack, no `gapRect` continuity patch.
- **No global continuous-plane authority.** If something seems to need
  `(ox, oy)`, the model is wrong; escalate.

Authority chain: `ADR-002` → `SPATIAL_CONTRACT.md` → `MIGRATION_PLAN.md`
→ runtime code in `src/jugar/`.

## Recovery phase status

| Phase | State |
|---|---|
| R1 — RoomGraph introduced & validated | DONE |
| R1.1 — Door identity / exit binding | DONE |
| R2 — ActiveRoom room-local | DONE |
| R3 — Render of active room only | DONE |
| R4 — Unified transitions (graph + entries) | DONE |
| R5 — Remove shared-wall physics (boundary / gapRect / enterArea-by-chunk) | DONE |
| R6 — Remove `ox/oy` from runtime + continuous tests | DONE |
| R7 — Arc I data + Portal→Faro acceptance | **STATIC/DATA PASS — PLAY BLOCKED** |

## Current blockers

1. El Instituto Phaser (`hall` / `despacho` / `aula`) se retiró. `/jugar`
   arranca en la Plaza. Revalidar en browser el cruce home isométrica → Plaza.
2. R7 Full Play (Portal→Faro) sigue pendiente de evidencia de jugador ahora
   que el prólogo ya no es el hall.

## R7 evidence

- Canonical Portal→Faro graph route resolves through `lighthouse_lantern`.
- Canonical destination entries are local, body-legal and collision-free;
  `forge_infirmary → forge_yard` no longer needs rescue.
- Plaza 1920×1080 strict connectivity includes Portal arrival, required exits
  and interactables; it is no longer deferred by the data harness.
- Pedestal placement has one gameplay authority (`ThingDef` at `(960,640)`),
  and `despertarOhm` derives that anchor.

## Active worktree context

- Runtime of record: `src/jugar/` (Phaser 4 room-based, top-down clásico).
- Instituto: home isométrica en `/`. No hay labs Three/Godot/2.5D de Ohmdal.

## Reading policy (do not load more than necessary)

- Local bug: read this file + the affected area doc + the affected source.
- Camera/transition bug: read `SPATIAL_CONTRACT.md` + `roomGraph.ts` + `roomTransitions.ts`.
- Recovery-phase planning: read `MIGRATION_PLAN.md`.
- Architecture archaeology / regression investigation: read `RECOVERY_AUDIT.md`.

## What this file is NOT

- Not a substitute for the ADR or the SPATIAL_CONTRACT.
- Not a list of every bug. Just the active ones.
- Not historical. For "why was X done", see `RECOVERY_AUDIT.md`.
