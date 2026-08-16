# 03 — HD-2D Greybox Build (Arc I)

> Status: **playable, end-to-end walkable, ready for design review.**
> Scope: `src/hd2d-ohmdal/` only. The legacy Phaser 2D and the `ohmdal-arco1` Canvas2D skeleton are untouched.

## What's built

The greybox for Ohmdal Arc I as a single continuous Three.js scene, played from a 2.5D camera. The player can walk end-to-end from the Sendero (south, the entry path) through the Portal Ω, the Camino, the Plaza de Ohm, the Calzada-alta, the Puerta de Ohm, the Calzada, and down into the Manantial — with elevation tiers that step at every region boundary.

### Regions (9)

| Region       | Footprint (x × z)  | Y     | Center     | Geometry       |
|--------------|--------------------|-------|------------|----------------|
| Sendero      | 44m × 8m           | 0.0   | (0, 22)    | south field with menhires, signpost, boulder, dead grass, lampposts |
| Portal Ω     | 8m × 6m            | 0.4   | (0, 12)    | monumental arch with glowing core, flanking lamps, side railings |
| Camino       | 10m × 6m           | 0.2   | (0, 6)     | paved path with side walls and lampposts |
| Plaza de Ohm | 20m × 16m          | 0.0   | (0, -3)    | octagonal fountain with bell, 4 corner lamps, 2 benches, 2 planters (NE circular stone, SW wooden), perimeter walls with 3.5m openings (N, S, E) |
| Taller de Lumen | 10m × 8m (building) | 0.0 | (16, 0)   | accessible interior with door, workbench, instruments, stove with chimney, jars, chair, fence courtyard |
| Calzada-alta | 14m × 4m           | 0.0   | (0, -11)   | elevated transition platform with side railings |
| Puerta de Ohm | 16m × 6m          | 0.4   | (0, -16)   | twin towers, lintel, cornice, upper block with Ω, gate partially open |
| Calzada      | 10m × 6m           | 0.0   | (0, -22)   | paved path with side walls and lampposts |
| Manantial    | 32m × 12m          | -1.5  | (0, -32)   | sunken patio, circular pool, 6 hex pillars, copper spire, compuerta iron gate, cliff backdrop |

### Stairs (6)

| From → To                          | z range  | Rise  | Steps |
|------------------------------------|----------|-------|-------|
| Sendero (y=0) → Portal (y=0.4)     | 15..18   | 0.4m  | 2     |
| Portal (y=0.4) → Camino (y=0.2)    | 9..11    | 0.2m  | 1     |
| Camino (y=0.2) → Plaza (y=0)       | 3..5     | 0.2m  | 1     |
| Plaza (y=0) → Calzada-alta (y=0)   | flat     | —     | —     |
| Calzada-alta (y=0) → Puerta (y=0.4) | -11..-13 | 0.4m | 2     |
| Puerta (y=0.4) → Calzada (y=0)     | -19..-21 | 0.4m  | 2     |
| Calzada (y=0) → Manantial (y=-1.5) | -25..-27 | 1.5m  | 6     |

Player Y interpolates smoothly when crossing a stair footprint (see `getStairY` in `world.ts:308-322`).

### Camera

- Base offset: `(0, 18, 24)` (player at origin) — ~36.9° downward tilt.
- FOV: 48° (narrow enough for HD-2D feel; wide enough to fit the Plaza 20m wide).
- LookAt: 1m above the player's ground.
- Per-region framing zoom:
  - Sendero: 1.05×
  - Plaza: 1.0×
  - Calzada-alta: 1.0× (default)
  - Puerta: 0.95× (slight zoom-in for intimacy)
  - Calzada: 1.0×
  - Taller: 1.0×
  - Manantial: 0.9× with region offset `(0, 20, 12)` — high vantage that bypasses the Puerta towers.

### Landmarks (5 distant)

- S-SW: rolling hills (`mountains`)
- W: Castillo de la Red silhouette (`tower`)
- E: Forja smoke plumes (animated)
- S: Faro lighthouse with sweeping beam (animated)
- N-NE: distant spires

### Electrical graph (15 nodes, 18 cables)

States: `dormant` → `awakening` → `powered_basic` → `powered_full`. Transitions happen when the player repairs broken cables (walk up to the cable trace, press E). 5 cables start broken, 13 are complete. When the Manantial gate reaches `powered_full`, the visual gate rises and the stone-post colliders remain as a fallback (TODO: remove colliders with the gate for final build).

## What's verified

- `npm run build` green (~28s).
- `npm test` green — 77 test files passing, 0 failures.
- Visual walkthrough of all 8 spawn points at `http://localhost:5173/src/hd2d-ohmdal/?spawn=<region>`.
- Harsh verifier sub-agent review (see `reports/hd2d-review.md`): 2 BLOCKERs and 4 MAJORs found and fixed.

### BLOCKERs fixed in this iteration

1. **Taller interior was un-enterable.** The west-wall collider was at `x=15.7` but the visual wall is at `x=11`. The collider split the Taller into two rooms and stranded the player in the west strip. Fixed: colliders moved to `x=10.6`, with door opening at `z=-1.2..+1.2` matching the visual.
2. **Sendero spawn was clamped to z=20** by `worldBounds.maxZ=20`, but the spawn is at `z=22` and the Sendero extends to `z=26`. 6m of the Sendero was unreachable. Fixed: `maxZ=32`, `minZ=-44` to match the terrain bounds.

### MAJORs fixed in this iteration

3. **Topology rectangles were 3-8m off-center from the geometry** in 7 of 9 regions. `regionAt` and `groundYAt` followed the topology, so the player's "current region" and "current Y" were computed from a footprint that didn't match the visible ground. Fixed: updated all `r.z` values to true min-corners matching the group positions.
4. **STEPS were inside the overlap zones, not at the visible boundaries.** The Sendero→Portal step was 5m inside the Portal. Fixed: all 6 step runs moved to the actual region boundaries (e.g. Sendero→Portal is now at z=15..18, exactly at the Sendero/Portal border).
5. **Plaza E wall opening vs. Taller door were 1-4m off in z.** The Plaza opening is now centered at world z=0 (local z=+3), aligned with the Taller door at world z=0. The east wall is now asymmetric (north segment 9.25m, south segment 3.25m) to accommodate the shift. Colliders in `world.ts` updated to match the new opening (north at z=-6.375 d=9.25, south at z=+3.375 d=3.25).
6. **Manantial gate colliders didn't lift when the gate opened.** Gate colliders are now tagged `manantial_gate`; on the `powered_full` state transition they are filtered out of the collision array, so the player can pass freely through the gate.

### Known issues (remaining, post-iteration-2)

- **Sendero camera is tight** — the 44m-wide Sendero is 2.3× wider than the visible frame. Player sees the middle third. Fine for greybox; the final build should zoom out to ~0.6× for the Sendero spawn.
- **The Plaza E wall is now asymmetric** (north segment 9.25m, south segment 3.25m) to align the opening with the Taller door. The asymmetry reads as "intentional" (the opening faces the Taller), but a player who walks along the east wall will notice the two segments aren't equal length. Acceptable for greybox; could be re-balanced by shifting the Taller east in a future pass.

## Inspection

The dev server runs at `http://localhost:5173/src/hd2d-ohmdal/`. Use `?spawn=<region>` to inspect each region directly:

- `?spawn=sendero` — south field, facing north toward the Portal
- `?spawn=portal` — Portal arch from the south side
- `?spawn=camino` — path between Portal and Plaza
- `?spawn=plaza` — Plaza de Ohm center, fountain as focal point
- `?spawn=taller` — outside the Taller's west door (courtyard)
- `?spawn=puerta` — Puerta de Ohm, twin towers
- `?spawn=calzada` — path between Puerta and Manantial
- `?spawn=manantial` — sunken patio, high-angle view past the Puerta

The title screen and opening dialog are auto-dismissed for inspection (see `main.ts:90-95`).

## File map

```
src/hd2d-ohmdal/
  main.ts                    entry; title screen skip; spawn dispatch
  world.ts                   world builder: groups, collision, movement
  world/topology.ts          regions, nodes, cables, steps, landmarks (data)
  engine/
    camera.ts                2.5D perspective camera with per-region framing
    input.ts                 keyboard input
    electricalGraph.ts       cable repair state machine
    renderer.ts              Three.js renderer setup
    audio.ts                 SFX (chime, ping, etc.)
  environment/
    plaza.ts                 Plaza de Ohm (fountain, walls, benches, planters)
    portal.ts                Portal Ω arch
    taller.ts                Taller de Lumen (accessible interior)
    puerta.ts                Puerta de Ohm (twin towers)
    manantial.ts             Manantial (sunken patio, pool, spire, gate)
    paths.ts                 Camino + Calzada + Calzada-alta
    stairs.ts                reusable stair flight builder
    landmarks.ts             distant silhouettes + animated smoke/beam
    terrain.ts               unified ground slabs + perimeter walls + horizon
    lamps.ts                 lamppost builder
    lighting.ts              ambient + directional
    materials.ts             shared material kit (stone, copper, water, etc.)
    spriteActor.ts           2D sprite actor for the hero and NPCs
  data/procedural.ts         procedural textures (plaza floor, etc.)
  ui/ui.ts                   HUD + dialog + bitácora
  styles.css                 HUD styles
  index.html                 shell HTML
```

## What's next

1. Fix the Plaza E opening / Taller door alignment (move the Plaza E opening to z=+1 in local coords, or move the Taller door to z=-3 in local coords).
2. Add interior lighting to the Taller so the player is visible inside.
3. Add collider removal when the Manantial gate opens.
4. Add a small staircase from the Calzada-alta to the Plaza walls (the current Plaza north opening is at the Calzada-alta edge, no visible stairs).
5. Add the "approach the Puerta" cinematic when the player first enters Calzada-alta.
6. Replace the inspection helpers (title skip, `?spawn=`) with production code paths.

## See also

- `docs/20-worlds/ohmdal/arcol-rebuild/00-prototype-bias-cleanup.md`
- `docs/20-worlds/ohmdal/arcol-rebuild/01-visual-bible.md`
- `docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md`
- `docs/20-worlds/ohmdal/world/mapa-jugabilidad-arco1.md`
- `docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md`
- `reports/hd2d-review.md` — the verifier sub-agent's read-only review that drove the blocker fixes
