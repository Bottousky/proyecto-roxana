---
name: ohmdal-room-engine
description: Work with the room-based spatial architecture of Ohmdal. Use whenever a change touches rooms, areas, doors, entries, spawn, camera, transitions, the room graph, or the active room.
---

# ohmdal-room-engine

Compact reminder of the room-based architecture for Ohmdal. Derived from
the actual runtime in `src/jugar/`. Prevents reintroducing parallel
authorities for rooms, areas, camera, or navigation.

> **On-demand, not preload.** This skill is the **first thing** to read
> for a room-engine task. The full source docs are loaded **only when
> a specific question cannot be answered from this skill + `CURRENT_STATE.md`
> + the directly affected code**.
>
> **Do NOT load by default:** the 11 area fiches, `RECOVERY_AUDIT.md`,
> `ARC1_SPATIAL_MAP.md`, `TEST_TAXONOMY.md`, `MIGRATION_PLAN.md`.
> See `docs/20-worlds/ohmdal/AGENTS.md` §0 for the policy.

## The non-negotiable rules (from `SPATIAL_CONTRACT.md`)

1. **Room-based, not a continuous world plane.** Two rooms are not required to touch. Two rooms are not rendered simultaneously.
2. **Viewport 960×540 ≠ room size.** A room can be 960×540, 1920×1080, 2400×1620, or any other size. Crossing a quadrant inside a room does **not** change the active room.
3. **Local coordinates only.** Player, entries, doors, walkable, collision, things, NPCs, and effects live in the **local** coordinate system of their room. There is no shared world `(ox, oy)`.
4. **Graph = topology, not geometry.** Connections are edges with `from`, `to`, `exit`, `entry`, `kind`, optional `cinematic`, and lock/visibility predicates. They are not adjacency.
5. **A single `ActiveRoom`** owns gameplay at any instant: `{ id, playerLocalPosition }`. Camera, navigation, collision, and interaction evaluate against it. Loading or preloading other rooms does not influence any of these.
6. **Camera is local.** Camera bounds = the local rect of the active room.
7. **Transitions are graph edges.** A room change is always a transition with a declared entry in the destination. No "shared wall" hack. No `gapRect` continuity patch.
8. **Schematic map ≠ runtime coordinates.** The M-map communicates topology. Do not treat its numbers as runtime coordinates.
9. **No continuous-world patches.** If something seems to need a continuous plane, the model is wrong; the data is wrong; escalate.

## The runtime vocabulary (do not rename)

| Concept | Where it lives | Notes |
|---|---|---|
| `RoomId` | `src/jugar/roomGraph.ts` | stable string id |
| `RoomDef` | `src/jugar/rooms.ts` | gameplay data: things, doors, palette hints |
| `DoorDef` | `src/jugar/rooms.ts` | local rect, `to`, `spawn`, `label`, `locked?`, `visible?` |
| `ThingDef` | `src/jugar/rooms.ts` | interactable / decor / NPC hotspot |
| `RoomSceneProfile` | `src/jugar/roomScenesData.ts` | dimensions, entries, doors, palette, ambient |
| `RoomGraph` | `src/jugar/roomGraph.ts` | derived, validated, augmented view over the data above |
| `EXTERNAL_ROOMS` | `src/jugar/roomGraph.ts` | rooms that live in another runtime (the Instituto hub); no scene profile, not part of the playable graph |
| `RoomSceneEntry` | per `RoomSceneProfile.entries[from]` | local spawn point keyed by the origin room |
| `TransitionKind` | `'doorway' \| 'fade' \| 'cinematic' \| 'seamless'` | declared per edge |
| `ActiveRoom` | runtime-only, not a file | single authority of gameplay; the only thing camera/nav/collision read from |

Do not invent alternative types: no `WorldMap`, no `ox/oy` global position, no `RoomChain`, no `DoorMatrix`, no `ContinuousPlane`. If a feature seems to need one, the contract is wrong somewhere; escalate instead of patching.

## Door identity and entry resolution (R1.1)

A transition is initiated by a **concrete exit** of the source room. `from + to` does not uniquely identify a connection — a room can have two doors to the same destination with different entries, locks, kinds, and cinematics. Resolution order for the destination entry:

1. `door.entry` on the source door (specific to the exit, future-friendly);
2. `scenes[to].entries[from]` (the current data shape, keyed by origin room);
3. `door.spawn` (legacy fallback);
4. documented default.

If you add a second exit from `A` to `B`, you must declare its entry explicitly. The current data limitation is documented; do not paper over it with topology tables that duplicate the data.

## Camera, transitions, and the active room

- **Camera** follows the player inside the active room. It does not pan to another room, and its bounds are the local rect of the active room.
- **Transition** changes the `ActiveRoom`. The transition kind is read from the graph edge. Lock/visibility predicates are read from `DoorDef`, not duplicated.
- **Preloading** another room is allowed only as an opt-in optimisation. It must not change camera, nav, collision, or interaction in the current room.

## When in doubt — load order

1. This skill (always).
2. `docs/20-worlds/ohmdal/room-based/CURRENT_STATE.md` (operational state).
3. The directly affected source in `src/jugar/`.
4. Only if the above is not enough:
   - `SPATIAL_CONTRACT.md` (contracts);
   - `ARC1_ROOM_GRAPH.md` (graph topology);
   - `ADR-002` (decision; wins over the contract if they disagree);
   - `MIGRATION_PLAN.md` (when planning recovery sequencing);
   - `RECOVERY_AUDIT.md` (only for archaeology / regression hunting);
   - the relevant `areas/*.md` fiche (only for the specific area in question).

If a problem seems to require a second authority for rooms, areas, camera, or navigation, stop. Surface the conflict. The fix is a contract change, not a parallel model.

