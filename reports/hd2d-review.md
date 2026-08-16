# HD-2D Cuenca de Ohm — Level-Design Review (read-only)

**Scope:** `src/hd2d-ohmdal/` (Arco I greybox).
**Method:** cross-check of `world/topology.ts` region rectangles vs the actual group placements in `world.ts` vs the visual geometry in each `environment/*.ts` vs the colliders in `buildColliders` (`world.ts:707-799`).
**Build:** `npm run build` passes; `TODO(guion)` is not present anywhere under `src/hd2d-ohmdal/`.

Two coordinate conventions are in play and they disagree. Throughout this report, the **geometry positions** (where the modules are actually placed) are treated as ground truth, because the player only ever sees the geometry. The **topology regions** in `topology.ts` are the canonical "what region am I in" query, but they do not align with the geometry.

---

## 1. Spatial consistency bugs

### 1.1 Topology rectangles are systematically off-center vs the geometry

The `REGIONS` array in `topology.ts:72-94` treats `x`/`z` as **min-corner** (`regionAt` at `topology.ts:96-106` confirms it: `x >= r.x && x <= r.x + r.width`). But every region's `group.position` in `world.ts` places the group at the **center** of the geometry, not at the region's min corner. Consequence: the geometry sticks out of its declared region on one side and an empty strip of the same size remains on the other.

| Region | Topology footprint | Geometry footprint (centered) | Drift |
|---|---|---|---|
| Sendero | `x: -22..22, z: 18..26` | `x: -22..22, z: 18..26` (`world.ts:126`, group at z=22, depth 8) | none — only Sendero is correct |
| Portal | `x: -4..4, z: 12..18` | `x: -4..4, z: 9..15` (`world.ts:100`, group at z=12) | 3 m south of declared region |
| Camino | `x: -5..5, z: 6..12` | `x: -5..5, z: 3..9` (`world.ts:112`, group at z=6) | 3 m south |
| Plaza | `x: -10..10, z: -3..13` | `x: -10..10, z: -11..5` (`world.ts:97`, group at z=-3) | 8 m south |
| Taller | `x: 10..26, z: -3..7` | `x: 11..21, z: -4..4` (`world.ts:106`, group at x=16) | 1 m east + 1 m north |
| Calzada-alta | `x: -7..7, z: -13..-9` | `x: -5..5, z: -14..-8` (`world.ts:121`, group at z=-11) | 2 m west + 1 m north |
| Puerta | `x: -8..8, z: -16..-10` | `x: -8..8, z: -19..-13` (`world.ts:103`, group at z=-16) | 3 m north |
| Calzada | `x: -5..5, z: -25..-19` | `x: -5..5, z: -25..-19` (`world.ts:115`, group at z=-22) | none |
| Manantial | `x: -16..16, z: -32..-20` | `x: -16..16, z: -38..-26` (`world.ts:109`, group at z=-32) | 6 m north |

**Severity: MAJOR.** `regionAt` and the `groundYAt` slab logic in `terrain.ts:99-109` both follow the topology, so the player''s "current region" and "current Y" are computed from a footprint that does not match the visible ground. The terrain slab itself is built from the topology (`terrain.ts:60-69`), so the ground covers the region footprint but not the geometry footprint; the player can stand on the terrain outside the building (e.g. at `(0, 10)` in the Plaza''s declared region, where there is no Plaza geometry at all but the ground reports `y=0`).

The Plaza also overlaps the Camino region by 6 m (Camino z=6..12 ⊂ Plaza z=-3..13) and the Camino overlaps the Portal by 2 m. The visual modules then overlap each other by similar amounts: Camino geometry z=3..9 vs Plaza geometry z=-11..5 overlap by 2 m at z=3..5.

### 1.2 Plaza east wall opening does not line up with the Taller door

`plaza.ts:103-105` puts the East wall opening at local `z=0` (the Plaza''s local center). With the Plaza group at world z=-3 (`world.ts:97`), the opening is at **world z = -4.75 to -1.25** (3.5 m wide, centered at z=-3). `buildColliders` (`world.ts:735-737`) matches this opening exactly.

`taller.ts:72-76` puts the Taller''s west door at local `z=0` (the Taller''s local center). The Taller group is at world `(16, 0, 0)` (`world.ts:106`), so the door is at **world z = -0.9 to +0.9** (visual) / **world z = -0.2 to +2.2** (collider opening at `world.ts:718-722`).

The two openings are separated by ~1 m of wall: Plaza opening ends at z=-1.25, Taller door starts at z=-0.2 (collider) / z=-0.9 (visual). A player walking east through the Plaza opening emerges at world z=-3, but the Taller door is centered at z=+1. The path forces the player to turn south and walk ~1-4 m before they can enter the Taller.

**Severity: MAJOR.** The visual cue ("door aligns with the gap in the wall") is broken. The Plaza E opening also faces a *blank* section of the Taller''s west wall, not the door.

### 1.3 Taller''s "courtyard" is a fiction

`topology.ts:82-85` says the Taller region is `x: 10..26` to include the courtyard between the Plaza''s east wall and the Taller''s west wall. The Plaza east wall is at `x = 10.25` (collider at `world.ts:736-737`, visual at `plaza.ts:104-105`). The Taller''s *visual* west wall is at **x = 11** (`taller.ts:73-76`, group at x=16, wall at local x=-5). The "courtyard" is therefore only **0.75 m wide**, not the ~5 m the region implies.

The collider for the Taller''s west wall is at `x = 15.7` (`world.ts:718-722`), so the *collider* courtyard is 5.15 m wide (x=10.25..15.4) but the *visual* courtyard is 0.75 m. See §2.2 for the consequence.

**Severity: MAJOR** (compounded by the misplacement in §2.2).

### 1.4 STEPS are placed inside the overlap zone, not at the visible boundaries

The Plaza''s south wall (visual) is at world z=+5. The Camino→Plaza step is at z=3..4 (`topology.ts:120`), which is *south of the Plaza''s south wall*, not at it. The player at z=4..5 is still on the Plaza visually but on the Camino''s elevation per `getStairY` (`world.ts:308-322`).

The Puerta''s south edge is at world z=-13 (geometry). The Plaza→Puerta step is at z=-10..-12 (`topology.ts:123`). The Calzada-alta geometry is at z=-14..-8, so the step is in the middle of the Calzada-alta, not at the Plaza→Calzada-alta or Calzada-alta→Puerta boundaries.

The Portal''s south edge is at world z=9. The Sendero→Portal step is at z=14..16 (`topology.ts:116`), 5 m *north* of the Portal''s south edge. The Portal→Camino step is at z=8..10, 1 m north of the Portal''s south edge.

**Severity: MINOR** (visual mismatch, not blocking; the player will still step up at roughly the right moment because the steps cover the elevation change).

### 1.5 Calzada→Manantial step is in the Manantial region, not at the Calzada''s south edge

The Calzada geometry is at z=-25..-19. The Calzada→Manantial step is at z=-26..-28 (`topology.ts:127`), entirely *inside* the Manantial region (z=-38..-26). The step''s `from` at z=-26 is 1 m past the Calzada''s south wall and exactly at the Manantial''s north edge.

The Manantial gate colliders (`world.ts:776-777`) sit at z=-26.4, 0.4 m into the step run. The step is 6 m wide (x=-3..+3), the gate colliders leave a 3.2 m central gap, so the player can still walk through — but they have to pass through the gate opening on a 1.5 m vertical drop, which reads as "falling past a locked gate," not "descending stairs."

**Severity: MINOR** for the spatial placement; **POLISH** for the staging.

### 1.6 Sendero south wall collider is unreachable (and decorative)

`buildColliders` places the south wall collider at `z = terrain.bounds.maxZ = 32` (`world.ts:795-796`), but the player''s `worldBounds.maxZ` is **20** (`world.ts:302`). The player is clamped to z ≤ 20 and never reaches the south wall. The south wall collider is currently dead code.

The terrain itself extends to z=32, the south gap is at z=±20, so the visual south wall is 12 m past where the player can walk.

**Severity: MINOR** (collider is unreachable; the visible south wall + horizon read fine).

### 1.7 `worldBounds` clamps the Sendero spawn out of existence

`world.ts:262` defines `sendero: { x: 0, y: 22 }` as the spawn point. `worldBounds.maxZ = 20` (`world.ts:302`) clamps the player to z ≤ 20 on the first frame. Visiting `?spawn=sendero` drops the player at `(0, 20)`, not at the center of the Sendero (z=22). The Sendero is at z=18..26, so the player can only access the **northern 2 m** of the Sendero (z=18..20). The other 6 m (z=20..26) — including the wooden signpost at z=20.8 and the boulder at z=20.8 — is unreachable.

`maxX = 28` also clips the world 4 m short of the terrain''s actual east edge (x=32).

**Severity: BLOCKER** for `?spawn=sendero`; **MAJOR** for general walkability of the Sendero.

---

## 2. Geometry mistakes

### 2.1 Plaza walls

Visual wall segments in `plaza.ts:96-105` line up cleanly with the colliders in `world.ts:728-737`. The Plaza''s three openings (N, S, E; 3.5 m wide each) are mirrored in both files. The Plaza''s *west* wall is full, with no opening.

Two minor drifts:
- The E wall colliders extend 0.25 m past the visual on each end (collider north at z=-11.25 vs visual at z=-11; collider south at z=+5.25 vs visual at z=+5). The E opening is exactly 3.5 m in both, so the playable gap is correct.
- The west wall collider is 0.25 m west and 0.2 m past the visual on the long axis (collider at z=-11.2..+5.2 vs visual at z=-11..+5).

**Severity: POLISH** (no gameplay impact — the player can''t approach the Plaza wall from outside the wall; the visible and collider extents are close enough that no clip is possible).

### 2.2 Taller walls — colliders split the interior in two

`taller.ts:65-76` defines the building at local x = ±W/2 = ±5 (so **world x = 11..21** because the group is at world x=16). The walls are at x=±5, z=±D/2=±4 (so world z=-4..+4).

`buildColliders` (`world.ts:708-722`) uses the comment "The Taller is at (16..26, -3..5) in world coords" and places:
- East wall at `x = 21` (matches the visual)
- West wall left/right + lintel at `x = 15.7`
- South wall at `z = 5.2` (visual at z=+4)
- North wall at `z = -3.2` (visual at z=-4)

So **the colliders are placed as if the building were 5 m further east** (x=15.7..21 instead of x=11..21). The visual west wall at x=11 has **no collider**; the player can walk through it. The collider at x=15.4..16.0 cuts the Taller''s interior into two rooms:
- A 4.4 m wide west strip (x=11..15.4) — visually inside the Taller, behind the door, but actually separated from the rest.
- A 5 m wide east strip (x=16..21) — where the bench and tools are.

The door at world x=11 (`taller.ts:80-87`) is also 4.4 m west of the invisible collider, so a player who walks through the door ends up stranded in the west strip and cannot reach the bench, the stove, the tools, or Lumen (who is at world x=18, `world.ts:239`).

**Severity: BLOCKER.** The Taller is un-enterable past x=15.4. The fix is to move the colliders to x=10.6 (west), z=-4.2 (north), z=+4.2 (south); the comment "16..26" should also be corrected to "11..21".

### 2.3 Taller door still doesn''t connect (after colliders are fixed)

Even if the colliders are moved, the Plaza''s east opening (z=-4.75..-1.25) and the Taller door (z=-0.2..+2.2) are 1.05 m apart in z (§1.2). After the player walks through the Plaza opening, they emerge at z=-1.25..-4.75 but the Taller door is at z=-0.2..+2.2. A 1 m offset, north-to-south.

**Severity: MINOR** (cosmetic — the player can still reach the door by walking along the courtyard).

### 2.4 Puerta towers

The Puerta group is at world z=-16 (`world.ts:103`). The two towers are at local x=±(W/2 - TOWER_W/2) = ±6.25 (`puerta.ts:63-64`), size (TOWER_W=3.5, TOWER_H=9, D=6). World positions: x=±6.25, z=-16, half-width 1.75, half-depth 3, so **x=±4.5..±8.0, z=-19..-13**. The colliders (`world.ts:742-743`) match: `x=±6.25, w=3.5, d=6` → x=±4.5..±8.0, z=-19..-13. ✓

The two side connectors (`world.ts:745-748`) at `x=±8, z=-12 and -20` match the visual in `puerta.ts:213-227`. The connectors slightly overlap the towers'' z-extents (tower z=-19..-13, connector z=-21..-19 and z=-13..-11) which is harmless.

**Severity: none.** The Puerta is the cleanest part of the world.

### 2.5 Manantial patio + Calzada→Manantial step

The Manantial group is at world `(0, 0, -32)` with `group.position.y = -1.5` (`manantial.ts:48`), so the geometry sits at world y=-1.5. The pool, spire, pillars, and gate are all positioned relative to the group, so they inherit the -1.5 m offset. The patio floor is 32×12 (`manantial.ts:37`), so it covers **world x=-16..+16, z=-38..-26**. The gate is at the south entrance (local z=+D/2 - 0.6 = 5.4 → world z=-26.6), which lines up with the Calzada geometry''s south edge (z=-25..-19, with a 1.6 m gap to the gate at z=-26.6).

The Calzada→Manantial step (`topology.ts:127`) runs z=-26..-28, 6 m wide, 6 steps. The 6 m wide run is much wider than the gate (4.6 m wide), so the player walks down the steps *around* the gate rather than through it. The gate colliders (`world.ts:776-777`) sit at z=-26.4 — inside the step run — leaving a 3.2 m central gap.

Two minor concerns:
- The step is 1.5 m of vertical drop over 2 m of horizontal run (≈37° slope). At 6 steps that''s a 0.25 m rise per 0.33 m run — walkable but steep.
- When the gate opens (state=`powered_full` in `world.ts:460`), only the visual gate moves; the two stone-post colliders at z=-26.4 stay. The player still has to walk through the central 3.2 m gap. This is fine for the demo but will need the colliders to lift with the gate for the final build.

**Severity: MINOR.**

### 2.6 Plaza "Taller courtyard" planter, bench, and door props are inside the visual Taller

The Plaza group is at world (0, 0, -3), and the Plaza''s NE corner has a planter at local (6.5, 0.3, -5) → **world (6.5, 0.3, -8)** (`plaza.ts:204-244`). The Taller building''s west wall is at world x=11, so the planter at x=6.5 is 4.5 m west of the building. That''s the "green corner of the Plaza" the comment promises, so the planter placement is consistent with itself. The Plaza E opening is at z=-4.75..-1.25, so the planter at z=-8 is *behind* the Plaza''s east wall — the player can see it from inside the Plaza but not from the courtyard. Fine.

**Severity: none.**

---

## 3. Camera / composition

Base offset: `(0, 18, 24)`, FOV 48° (`camera.ts:30, 51`). Tilt ≈ 36.9° down. `setRegionFraming` (`camera.ts:141-172`) only adjusts FOV (95-110%) and overrides the offset for the Manantial.

### 3.1 Plaza framing — Portal in the foreground

When the player is at Plaza center (0, -3), the camera sits at (0, 18, 21) and looks at (0, 1, -3). The Portal arch (z=9..15, top at y≈7.35) sits 10-14 m in front of the look-at, between the camera and the Plaza. In camera angles (from the (0,18,21) vantage):
- Plaza south wall opening (z=+5, y=0..0.9) is ~46.9° below horizontal
- Portal `archBack` top (z=9.4, y=2.9) is ~52.5° below horizontal
- Portal cornice top (z=9.9, y=6.6) is ~45.8° below horizontal
- Portal upperBlock (z=10, y=7.35) is ~44.1° below horizontal
- Look-at direction is 35.3° below horizontal

So the Portal occupies the band from ~9° to ~17° *below* the look-at, with its top ~9° below the player''s head. The Plaza north edge (z=-11) is 35.3°-atan(17/13)=35.3-52.6 ≈ **17° above** the look-at. The Plaza''s south opening is below the Portal — the player is looking at the Portal arch *over* the Plaza''s south opening.

**Verdict: acceptable.** The Portal arch frames the Plaza view as a backlit silhouette. The Portal''s top is well inside the 24° half-FOV. The Plaza''s fountain (0, 0.78, 0) sits ~3 m in front of the look-at at z=0 — 35.3°-atan(17.2/21) = 35.3-39.3 = **4° below** the look-at. That''s the right vertical position for "the player walks into the lower third of the frame." No occlusion of the Plaza by the Portal.

**Severity: none.**

### 3.2 Puerta framing

When the player is at the Puerta spawn (0, -15), the camera sits at (0, 18, 9) and looks at (0, 1, -15). The two towers (x=±6.25, y=0..9, z=-19..-13) are 22-28 m away and 1-2 m behind the look-at point. The tower tops land ~16° above the look-at — they frame the player without crowding. The passage between the towers (x=-2.5..+2.5) is centered on the look-at horizontally. Good composition.

**Severity: none.**

### 3.3 Manantial framing

`regionOffset = { x: 0, y: 20, z: 12 }` (`camera.ts:161`), `framingZoom = 0.9`. The offset puts the camera at lookAt+(0, 20, 12) and `followElevation` (`camera.ts:120-125`) subtracts the player''s Y from the camera Y. So when the player is at y=-1.5, the camera sits at y=18.5 (20 - 1.5). The Puerta (z=-16) is 10 m further north of the look-at at z=-26, so the camera at (lookAt.x, 18.5, lookAt.z+12) is *south* of the Puerta — the towers (9 m tall) project ~2 m into the lower foreground.

This is a good solution for "look past the towers at the sunken patio" but the 9 m tall towers will appear in the lower 1/3 of the frame when the player is at the south end of the Manantial (z=-26). Worth checking in the browser.

**Severity: MINOR** (verify in browser; may need to nudge the camera further back if the towers dominate).

### 3.4 Sendero framing

`framingZoom = 1.05` (`camera.ts:168`). The Sendero is 44 m wide × 8 m deep. From (0, 18, 22+12) = (0, 18, 34) looking at (0, 1, 22), the visible z-band at the look-at distance (sqrt(18²+12²) ≈ 21.6 m) is 2*21.6*tan(24°) ≈ 19.2 m, divided by 16:9 to ~10.8 m of depth visible. The Sendero is 8 m deep, so it fits with a small margin. The visible x-band is 19.2 m → Sendero (44 m) is 2.3x too wide. The player sees the middle third of the Sendero.

**Severity: MINOR** — fine for a greybox but the framing should pull the camera back to ~30 m or zoom in further (e.g. 0.6x) for the final.

### 3.5 Plaza wall visibility from base camera

The Plaza walls are 0.9 m tall (`plaza.ts:41`). At 24 m back, they project 0.9/24 = 2.1° above the ground plane — well below the look-at angle. They do not occlude anything. The 4 corner pillars at y=1.4 + 0.7 = 2.1 m (`plaza.ts:117`) project 5.0° above the ground, also well below the look-at. The bench at y=0.55 projects 1.3° above the ground. None of the Plaza''s vertical props occlude the camera''s view of the Portal or the back of the Plaza.

**Severity: none.**

---

## 4. TODO(guion) inventory

```
grep -r "TODO(guion)" src/hd2d-ohmdal/
→ 0 matches
```

A wider sweep for `TODO|FIXME|XXX|placeholder` also returns 0 matches. No placeholder dialog or unfinished geometry in the HD-2D world. The dialog lines in `world.ts:472-484` (Edda, Lumen, Ohm) are final tuteo-neutral Spanish and read like real game text, not stubs.

**Severity: none.**

---

## 5. Walkability check

Following the prescribed path Sendero → Portal → Camino → Plaza → Calzada-alta → Puerta → Calzada → Manantial.

| Hop | From | To | Issue |
|---|---|---|---|
| Sendero → Portal | (0, 22), y=0 | (0, 14), y=0.4 | **Spawn at z=22 is clamped to z=20** by `worldBounds.maxZ=20` (`world.ts:302`). The visible Sendero spans z=18..26; the player is stuck at z≤20. The step itself (`topology.ts:116`) at z=14..16 is reachable from z=20 by walking north. ✓ once the spawn clamp is fixed. |
| Portal → Camino | (0, 14), y=0.4 | (0, 8), y=0.2 | Step at z=8..10 (`topology.ts:118`) is in the Camino region, 1 m north of the Portal''s south edge. Walkable. ✓ |
| Camino → Plaza | (0, 8), y=0.2 | (0, 0), y=0 | Step at z=3..4 (`topology.ts:120`) is in the Plaza region, 1 m south of the Plaza''s south wall. Walkable. ✓ |
| Plaza → Calzada-alta | (0, -3), y=0 | (0, -11), y=0 | No step. Both at y=0. The Plaza''s north wall is at z=-11; the Calzada-alta geometry starts at z=-14. There''s a 3 m visual gap (z=-11 to -14) where the player walks on the Plaza''s terrain slab (from `terrain.ts:60-69`) at y=0. The colliders don''t block this. Walkable. ✓ |
| Calzada-alta → Puerta | (0, -11), y=0 | (0, -16), y=0.4 | Step at z=-10..-12 (`topology.ts:123`) is in the Calzada-alta/Puerta overlap, 1 m north of the Puerta''s south edge. Walkable. ✓ |
| Puerta → Calzada | (0, -16), y=0.4 | (0, -22), y=0 | **No step defined.** Player teleports in `groundYAt` from y=0.4 to y=0 at z=-16 (the Puerta''s south edge per topology z=-16..-10 — but the geometry is at z=-19..-13). The step from Puerta to Calzada is *implicit in the region boundaries* and would have to be defined if the elevation transition is to be visible. The Plaza→Puerta step covers the y=0→0.4 transition; the Puerta→Calzada y=0.4→0 transition has no step. |
| Calzada → Manantial | (0, -22), y=0 | (0, -32), y=-1.5 | Step at z=-26..-28 (`topology.ts:127`), 1 m past the Calzada''s south edge, inside the Manantial region. Walkable through the gate''s 3.2 m central gap. ✓ with caveat: when the gate opens in `powered_full`, the stone-post colliders at z=-26.4 stay (`world.ts:776-777` are not removed). |

Two walkability gaps that would benefit from a step in `STEPS`:
1. **Sendero spawn clamp** (blocker, §1.7) — fix `worldBounds.maxZ` (or the spawn point) before the Sendero is testable.
2. **Puerta → Calzada step** (minor) — there''s no `STEPS` entry for the y=0.4 → 0 transition at the Puerta''s north edge (z=-19 per geometry, z=-13 per topology). The `groundYAt` snaps the player from y=0.4 to y=0 the moment they leave the Puerta region.

The colliders do not block the prescribed path (other than the broken Taller interior in §2.2). The path *around* the Taller from the Plaza is open: from the Plaza E opening, walk to the courtyard (x=10.25..15.4), then south past the Taller door (which the player can ignore), and into the Calzada-alta.

---

## 6. Verdict

**The greybox is NOT ready for Manuel''s review.** Two BLOCKERs and four MAJORs need to be fixed first; the rest are POLISH/MINOR.

**BLOCKERs:**
- **Taller interior is un-enterable** (`world.ts:718-722`): the west wall collider is at x=15.7 but the visual west wall is at x=11. The collider splits the Taller into two rooms. The bench, tools, stove, and Lumen are unreachable.
- **Sendero spawn is broken** (`world.ts:262` + `world.ts:302`): `worldBounds.maxZ=20` clamps the player 2 m south of the spawn point. The wooden signpost (z=20.8) and the boulder (z=20.8) are unreachable, and the south 6 m of the Sendero (z=20..26) is permanently off-limits.

**MAJORs:**
- **Plaza E opening vs. Taller door are 1-4 m off in z** (`plaza.ts:103-105` + `taller.ts:72-76` + `world.ts:718-722`): the visual cue of "door aligns with the gap in the wall" is broken; the player has to walk sideways to enter the Taller.
- **Topology rectangles are systematically off-center vs the geometry** (`topology.ts:72-94`): the regions are 3-8 m off in 7 of 9 cases. `groundYAt` and the `regionAt` query both follow the topology, so the player''s "current region" and "current Y" are computed from a footprint that doesn''t match the visible ground.
- **STEPS are inside the overlap zones, not at the visible boundaries** (`topology.ts:114-128`): the elevation transitions are visible but not at the place the player expects to see them (e.g. the Sendero→Portal step is 5 m inside the Portal, not at the Portal''s south edge).
- **Plaza "courtyard" between Plaza and Taller is 0.75 m wide visually** (`plaza.ts:103-105` + `taller.ts:65-76`): the topology comment ("includes the courtyard between Plaza east wall and Taller west wall") describes a 5 m space that doesn''t exist in the geometry.

**MINORs:** the Puerta→Calzada step is missing, the Calzada→Manantial step is 1.5 m over 2 m (steep), the gate colliders don''t lift when the gate opens, the Sendero camera is too tight (44 m path × 19 m visible width), and the Manantial camera framing should be checked in the browser for tower occlusion.

**POLISH:** the Plaza wall colliders extend 0.25 m past the visual on each end (cosmetic only — no clip possible).

The build is green, the camera composition is fundamentally sound, the Plaza/Puerta/Manantial geometry matches its colliders, and the dialog lines are final. The level-design bugs are concentrated in the Taller and in the topology→geometry plumbing. Fix those, re-screenshot the four spawn points, and the greybox will be ready.
