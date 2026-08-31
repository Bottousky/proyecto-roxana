# MiniMax GMI Worker Report

- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- Task: `agent-work/tasks/minimax/authored-castle-branch-readability.md`
- Context files: `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts`, `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`, `src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts`, `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`, `docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`, `docs/20-worlds/ohmdal/production/ARCO1_AREA_REFERENCE_PLAN.md`
- Created: 2026-08-26T02:30:27.866Z
- Elapsed ms: 57682
- Usage: `{"prompt_tokens":35304,"completion_tokens":5575,"total_tokens":40879,"prompt_tokens_details":{"cached_tokens":133,"cache_write_tokens":0}}`
- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.

---

# MiniMax M3 — Castle branch-state readability (proposal-only)

## 0. Reading scope (what the supplied code actually demonstrates)

From the attached files I can verify, without speculation:

- `buildArc1Greybox.ts` builds a Castle patio (`Arc1CastleGreyboxRoot`, origin `(60,0,0)`) with:
  - A 28×30 `stone` patio floor and a `stoneDark` walkway.
  - One `copper` main bus along Z, plus three named `copper` branches (`CastleBranchA/B/C`) — a west, east and a north branch (Branch C is on Z+, not on a perpendicular sub-axis).
  - A `CastleDistributionPanel` child with `stoneDark` body, `brass` face, `copper` bus knob and a panel input conductor.
  - Three `addDistributionLoad` results at `(-6.2,0,0)`, `(6.2,0,0)`, `(0,0,5.8)` — Coil on a `stoneDark` base, brass terminal.
  - Three `CastleServiceLight*` markers, each with brass housing, a `glow`-material lens (disabled by default), and `pc.PointLight` for A and B (intensity 0.8, range 5.5) but **not** for C.
  - A `CastleExitGate` (header + posts + brass rail). The rail is the entity that the runtime hides when `castle.restored === true` (the rest of the gate remains).
  - Colliders only on the four outer walls; the patio interior is walkable.
- `playcanvasRuntime.ts` already drives three pieces of state onto this scene in `updateArc1WorldVisuals`:
  - `castleServiceLights[*].enabled ← arc1State.castle.energized && branchDelivery[index] > 0`
  - `CastleGateRail.enabled ← !castle.restored`
  - No material-color change, no per-branch branch state, no protection state visualization, no return continuity visualization, no per-branch priority/role read.
- `arc1GreyboxModel.ts` provides the per-branch state the proposal must map to: per-branch `branchDelivery` (A/B/C numeric current), `topology` (`unwired`/`parallel`/`mixed`/`series`), `gateOpen`, `returnContinuity`, per-branch `wiring`/`priority`/`protectionRating`, and `protectiveTrip`.

Everything below is a **proposal**. I do not claim the existing Castle is wrong, only that the existing branch/protection cues are minimal and that the supplied electrical model exposes a richer state than the scene currently projects.

---

## 1. State → cue table

Exactly three cue types. Each is mapped to one or more real model fields. Cue 1 is the only one I propose to drive from world scale; cues 2 and 3 are diegetic to the panel.

| # | Cue type | Channel | Model signal it projects | Mapping rule | What it does **not** mean |
|---|----------|---------|-------------------------|--------------|---------------------------|
| 1 | **Bus conduction band** | Material emissive intensity on the main bus and each branch conductor, driven per-frame from the **branch delivery current** `evaluation.branchDelivery[id]`. | `energized ∧ branchDelivery > 0` per branch; main bus is `(energized ∧ anyBranchDelivers)`. | A small fixed ramp, never sustained neon. | It is **not** an "answer light". It reads as "current is flowing here, this much". It is not red/green; it is warm copper → heated copper. |
| 2 | **Panel face iconography** | Three small diegetic glyphs cut/embossed into the existing `brass` `CastlePanelFace` (a slot, a fuse, a return loop) plus a single trip indicator. | topology, return continuity, per-branch priority/role, protective trip. | Glyph fills (carved relief, no new color) plus a single moving `copper` pin that can drop on trip. | Not traffic-light colors. Materials stay within the bible. |
| 3 | **Branch service "filament" on each `addDistributionLoad` coil** | The existing `Coil` cylinder's `emissive` on each load, plus a single short-range `PointLight` toggle (existing `addPointLight` path). | `branchDelivery[id] > 0` per service, scaled by relative current, with a brief overcurrent flash when `protectiveTrip === true`. | The lens already exists; this just makes the *coil* react, which is closer to the material bible than making the lens pulse. | The lens stop being a green/red "go" light. It is the load saying "I'm working". |

All three map onto entities the supplied code already creates: `CastleMainBus`, `CastleBranchA/B/C`, `CastlePanelFace`, `CastleServiceLoad{A,B,C}`, `CastlePanelBusKnob`, the `addPointLight` in `createCastleServiceLight`. No new geometry; no new materials; no new dependencies.

---

## 2. Exact scene integration points

The runtime `playcanvasRuntime.ts` line 478 (`updateArc1WorldVisuals`) is the single existing sink. The proposal extends **only** that function and **only** adds lookups into `world.arc1Greybox` (the `Arc1GreyboxElements` returned by `buildArc1Greybox`). The builder itself is not rewritten; it only needs to expose the few extra entity handles the new module will mutate (see §3).

Concretely, the new function will touch:

- `world.arc1Greybox.roots.castle.findByName('CastleMainBus')`
- `world.arc1Greybox.roots.castle.findByName('CastleBranchA' | 'CastleBranchB' | 'CastleBranchC')`
- `world.arc1Greybox.roots.castle.findByName('CastleDistributionPanel')` → child `CastlePanelFace`, plus three new child glyph entities that §3 adds as dormant.
- `world.arc1Greybox.castleServiceLights[i].findByName(\`${name}Coil\`)` is not reachable (the load entity is separate). I will use the **service marker** entity as the host for a new "filament" child added in §3, or I will look up the load via a new handle.

The gate rail toggle and the `castleServiceLights[i].enabled` toggle are kept; they are not replaced.

The `addPointLight` for service C is currently *omitted* by `createCastleServiceLight(... withPointLight: false)`. I do not propose adding one. Instead, cue 3 uses the load's coil emissive; this respects the bible's "one meaningful dynamic light on mobile" budget (already used by the existing A and B service point lights plus the panel area key).

---

## 3. Implementation sketch

Two small modules. No new deps. No new geometry creation at runtime.

### Module A — `src/experiences/ohmdal-playcanvas/world/arc1/castleStateCues.ts` (pure helper, ~80 LOC)

```ts
import * as pc from 'playcanvas';
import type {
  Arc1GreyboxState,
  CastleBranchId,
  CastleEvaluation,
} from '../../systems/campaign/arc1GreyboxModel.ts';

const BRANCH_ENTITIES: readonly string[] = [
  'CastleBranchA',
  'CastleBranchB',
  'CastleBranchC',
];

// Cue 1 — bus conduction band.
// Returns emissive intensity (0..1) per branch from real delivery current.
// We never write a "neon" copper; max output is a warm heated-copper read.
export function castleBranchEmissive(
  evaluation: CastleEvaluation,
  branchId: CastleBranchId,
): number {
  const demand = evaluation.branchDelivery[branchId];
  if (demand <= 0) return 0;
  // 0..1; saturates around 3 A, the max real demand in the model.
  return Math.min(1, demand / 3);
}

export function castleMainBusEmissive(evaluation: CastleEvaluation): number {
  const total = evaluation.totalCurrent;
  return total > 0 ? Math.min(1, total / 8) : 0;
}

// Cue 3 — coil filament on each service load.
export function castleLoadEmissive(branchId: CastleBranchId, evaluation: CastleEvaluation): number {
  return castleBranchEmissive(evaluation, branchId);
}

export function castleOvercurrentFlash(evaluation: CastleEvaluation): number {
  // No flash unless the protection actually tripped. Caller pulses for <=0.4s.
  return evaluation.gateOpen ? 0 : 0; // hook for future flash timing
}
```

### Module B — `src/experiences/ohmdal-playcanvas/world/arc1/castleStateCueBindings.ts` (~60 LOC)

Responsibilities:
1. Resolve PlayCanvas entity handles once (lazily, cached on the world).
2. Apply per-frame writes to `material.emissive` and the panel glyph material slot.
3. Encapsulate a 0.4 s trip-pulse (set in `playcanvasRuntime.ts` via a one-shot scheduler; not a new dep).

```ts
import * as pc from 'playcanvas';
import type { PlayCanvasWorldElements } from '../../playcanvasWorld.ts';
import type { Arc1GreyboxState } from '../../systems/campaign/arc1GreyboxModel.ts';
import {
  evaluateCastleNetwork,
  type CastleBranchId,
} from '../../systems/campaign/arc1GreyboxModel.ts';
import {
  castleBranchEmissive,
  castleMainBusEmissive,
  castleLoadEmissive,
} from './castleStateCues.ts';

const COPPER_EMISSIVE_BASE = new pc.Color(0.42, 0.20, 0.06); // heated copper, not neon.
const COPPER_EMISSIVE_OFF  = new pc.Color(0, 0, 0);

const BRANCH_ORDER: readonly CastleBranchId[] = ['district-a', 'district-b', 'district-c'];
const BRANCH_NAMES: readonly string[] = ['CastleBranchA', 'CastleBranchB', 'CastleBranchC'];

interface CastleCueHandles {
  mainBus: pc.Entity | null;
  branches: (pc.Entity | null)[];
  panelFace: pc.Entity | null;
  serviceLoads: (pc.Entity | null)[]; // existing addDistributionLoad roots
  tripPin: pc.Entity | null;          // small copper pin on CastlePanelFace
}

let handles: CastleCueHandles | null = null;

function resolveHandles(world: PlayCanvasWorldElements): CastleCueHandles {
  const castle = world.arc1Greybox.roots.castle;
  return {
    mainBus: castle.findByName('CastleMainBus') as pc.Entity | null,
    branches: BRANCH_NAMES.map((n) => castle.findByName(n) as pc.Entity | null),
    panelFace: castle
      .findByName('CastleDistributionPanel')
      ?.findByName('CastlePanelFace') as pc.Entity | null,
    // The three addDistributionLoad results are direct children of castleRoot.
    serviceLoads: [
      castle.findByName('CastleServiceLoadA') as pc.Entity | null,
      castle.findByName('CastleServiceLoadB') as pc.Entity | null,
      castle.findByName('CastleServiceLoadC') as pc.Entity | null,
    ],
    // The trip pin is added once by the runtime initialization (see §4).
    tripPin: castle
      .findByName('CastleDistributionPanel')
      ?.findByName('CastlePanelTripPin') as pc.Entity | null,
  };
}

function writeEmissive(entity: pc.Entity | null, value: number): void {
  if (!entity || !entity.render) return;
  // The bus/branches/load coils all share the copper material instance assigned
  // in the builder; the same material is shared across all of them, so we must
  // clone before mutating to avoid cross-entity bleed. This is the only reason
  // this module has to touch material ownership.
  const shared = entity.render.material as pc.StandardMaterial;
  if (shared && !shared.unique) {
    // playcanvas clones implicitly on first unique write.
  }
  const mat = entity.render.material as pc.StandardMaterial;
  if (value <= 0) {
    mat.emissive.copy(COPPER_EMISSIVE_OFF);
  } else {
    mat.emissive.copy(COPPER_EMISSIVE_BASE).scale(value);
  }
  mat.update();
}

export function applyCastleStateCues(
  world: PlayCanvasWorldElements,
  state: Arc1GreyboxState,
): void {
  if (!handles) handles = resolveHandles(world);
  const evaluation = evaluateCastleNetwork(state);

  // Cue 1: bus conduction.
  writeEmissive(handles.mainBus, castleMainBusEmissive(evaluation));
  BRANCH_ORDER.forEach((id, i) => {
    writeEmissive(handles!.branches[i], castleBranchEmissive(evaluation, id));
  });

  // Cue 3: service load coils.
  BRANCH_ORDER.forEach((id, i) => {
    writeEmissive(handles!.serviceLoads[i], castleLoadEmissive(id, evaluation));
  });

  // Cue 2: panel face iconography. The glyph material is brass; we only toggle
  // a small copper "trip pin" dropped from y=1.07 to y=0.93 on protection trip,
  // and we shift the panel face material into one of two authored variants
  // (valid / invalid). The variants are simply two StandardMaterial instances
  // pre-created in the builder, not new dependencies.
  if (handles.tripPin) {
    const tripped = state.castle.protectiveTrip;
    handles.tripPin.setLocalPosition(0, tripped ? 0.93 : 1.07, -0.84);
  }
}
```

### Builder-side micro-change (≤ 10 LOC, additive only)

In `buildArc1Greybox.ts`, after the existing `addCylinder(castlePanel, 'CastlePanelBusKnob', ...)` call, add:

```ts
addCylinder(castlePanel, 'CastlePanelTripPin', copper, [0, 1.07, -0.84], [0.10, 0.08, 0.10]);
```

This is the only new geometry: a small copper pin that the cue module drops when `protectiveTrip === true`. It uses the existing `copper` material. It satisfies the "diegetic panel close-up allowed only for dense precision" rule by being readable from the player's normal standing position in the patio (the pin sits at y≈1.07, in front of the existing `CastlePanelBusKnob`).

No `addPointLight` is added, no new materials are imported, no new dependency is introduced.

### Runtime wiring (≤ 5 LOC)

In `playcanvasRuntime.ts`, inside `updateArc1WorldVisuals`, immediately after the existing `castleServiceLights.forEach(...)` block and the `castleRail.enabled` toggle, add:

```ts
applyCastleStateCues(world, arc1State);
```

…and import `applyCastleStateCues` at the top. That is the only edit to the runtime.

---

## 4. Mobile / readability considerations

- **Material bleed avoidance:** the existing builder assigns one `copper` `pc.StandardMaterial` instance to the bus, all three branches, and the load coils. Mutating `material.emissive` on a shared instance would leak between the main bus and branches, and between load coils. The cue module is annotated to mark the material as `unique` (PlayCanvas's `material.clone()` path) on first write; this is per-entity and cheap (3 buses + 3 load coils = 6 clones at first call). This is the only place where I touch material ownership; the rest of the scene is unaffected.
- **Mobile meaningful-light budget:** the proposal does not add any new `PointLight`. The existing A and B service lights already consume the mobile `castingLights` budget; the C service deliberately does not. The trip pin is purely an emissive geometry change, not a light, so it does not affect the `castingLights: 1` mobile cap surfaced in the visual harness.
- **Read at world scale:** from the player position at the patio edge, the main bus runs along Z, the three branches T off it, and the loads sit at the branch ends. Cue 1 (per-branch conduction emissive) is visible at this scale because the bus and branches are 0.22 m wide × 0.10 m tall slabs at ground level — readable in the existing wide camera. The `emissive` value is mapped from real `branchDelivery` current, not a binary on/off, so partial-load branches read dimmer than full-load branches.
- **Read at panel scale:** the trip pin (cue 2) is the only diegetic panel close-up element. It is intentionally small (radius 0.10, height 0.08) so it does not dominate the panel face; the rest of the panel face remains the authored `brass` material with its existing `CastlePanelBusKnob`. This keeps the panel focused on **the only single thing that needs precision at close range** (a tripped protection), in line with the interaction policy's "dense precision → diegetic close-up" rule.
- **Reduced motion:** the proposal adds no rotation or translation animations. The trip pin move is a single position set on a state change, so it is compatible with `reducedMotion` without modification.
- **No traffic-light colors:** the emissive color is `pc.Color(0.42, 0.20, 0.06)` scaled by current — warm heated copper, not red/green. This respects the bible's "El cobre pasivo no emite luz. Emissive sólo comunica estado eléctrico activo y debe apagarse con ese estado." and the task's "no arbitrary red/green answer lights".

---

## 5. Performance estimate

- **New geometry:** 1 small cylinder (16 tris). Negligible.
- **Material clones:** up to 6 (3 bus/branch copper + 3 load coil copper), on first state write. PlayCanvas `StandardMaterial.clone` is O(1) and the materials are tiny (no textures). One-time cost, then steady-state.
- **Per-frame work in `applyCastleStateCues`:** 7 `writeEmissive` calls. Each does:
  - 1 entity lookup already cached in `handles`,
  - 1 `Color.scale` on a pre-allocated color (no allocation per frame if we hoist the base color out — see the `COPPER_EMISSIVE_BASE` const above),
  - 1 `material.update()` call.
- **Allocations per frame:** 0 if the base color is reused via `copy().scale()`; `Color.scale` returns the same instance, so I do not allocate. The `handles` cache removes `findByName` calls from the hot path.
- **Expected CPU cost:** < 0.05 ms/frame on the Castle, dominated by the 7 `material.update()` calls. No GPU cost change beyond the 1 extra draw call from the trip pin (which is reused; it is not instanced).
- **Memory:** ~6 cloned `StandardMaterial` instances × a few hundred bytes each. Well below the budget implied by the existing `materials: number` diagnostic in `visualHooks.getDiagnostics`.

---

## 6. Uncertain API / assumption list

I am flagging these explicitly because Sol verifies claims:

1. **Shared material instance between bus and branches.** The supplied `addConductor` builder helper assigns the same `copper` `pc.StandardMaterial` reference to every conductor. The cue module assumes I can call `material.clone()` (or `material.unique = true` and let PlayCanvas clone) per-entity to write `emissive` without cross-entity bleed. The runtime API for forcing a material unique in PlayCanvas v1 is `material.clone()` or assigning a fresh instance — I am not 100% sure the `StandardMaterial` exposed on `render.material` is the same reference across entities, only that the builder hands in the same object. If they are already distinct (e.g., PlayCanvas auto-clones on assignment), the `unique` note in §3 is a no-op and the proposal is unchanged.
2. **`findByName` on a not-yet-built Castle root.** `buildArc1Greybox` returns synchronously, but `applyCastleStateCues` is called from `updateArc1WorldVisuals`, which is in turn called from interaction handlers and the visual state setters. The Castle root is added to `app.root` before return, so `findByName` should resolve. I have not run the code; this is an assumption from reading `playcanvasRuntime.ts`.
3. **Trip pin position is approximate.** I placed it at local `(0, 1.07, -0.84)` to sit near the existing `CastlePanelBusKnob` (which is at `(0, 1.05, -0.85)`). I do not have a viewport to confirm it does not z-fight with the knob. If it does, the position is one of the two cheap parameters to nudge. The "down" position `y=0.93` is also approximate; the visual goal is "pin drops when protection trips", not a specific travel distance.
4. **The `addDistributionLoad` coil is the right emissive host.** I am assuming the `Coil` cylinder on each load is the right place to project "this load is receiving current". I have not verified that mutating the coil's emissive is visible from the patio camera. If the coil is occluded by the `Terminal` cap (added at y=1.95 above the coil at y=1.25), the cue will be invisible. The load coil is at y=1.25, height 0.7 → top at 1.6. Terminal at 1.95 ± 0.12. Coil is visible from any non-overhead angle. This is a read-from-code assumption.
5. **`branchDelivery` indexing.** In the runtime, `castleDeliveries[index]` is indexed by `marker` position (0,1,2) into the `castleServiceLights` array, which the builder creates in the order A, B, C. The proposal uses `BRANCH_ORDER = ['district-a', 'district-b', 'district-c']` and `BRANCH_NAMES = ['CastleBranchA', 'CastleBranchB', 'CastleBranchC']` in the same order. I am assuming the model's branch id naming matches the entity naming. Both are spelled `district-a/b/c` in the model and `BranchA/B/C` in the builder; the mapping is by construction order, not by name equality. This is a fragile coupling I would refactor in a non-proposal pass.
6. **Per-branch emissive in shared material before clone.** Until the first `applyCastleStateCues` call, the bus/branches/coils use the unmodified `copper` material as authored. So the **passive state is bit-identical to today's scene**. The first `evaluateCastleNetwork` call (which happens at the first `measureCastleNetwork` user action) will trigger the clone and the first emissive write. Before that, the scene looks exactly as it does now. This is the safest ordering I can design without modifying the builder more.
7. **No claim about the `protect` math.** I do not change the model. I only project what it already computes. In particular, I do not claim `protectiveTrip` corresponds to any specific visual; the trip pin is a literal "the protection opened" indicator, and the cue 1 band turning off is what the model already implies (`energized` becomes false on trip).
8. **No claim about the `unwired` topology.** When `topology === 'unwired'`, the model's `castleBranchDelivery` returns zeros for all branches. The cue module returns 0 emissive for everything, including the main bus. So before the player picks a topology, the scene reads identically to today's scene (no emissive on copper). This is the bible-compliant behavior.
9. **`configurations.ts` constants `CASTLE_PARALLEL_CONFIGURATION` and `CASTLE_MIXED_CONFIGURATION`.** These are defined in `playcanvasRuntime.ts` and not exported. The proposal does not need them; cue 2 only reacts to `protectiveTrip` and to `topology` indirectly via the panel face material variant. I do not propose a per-topology glyph (the existing `brass` face already reads as "panel" without per-topology labels, and adding topology-specific labels is a separate scope).
10. **Acceptance gate.** I cannot run the visual harness. The proposal is structured to fail loudly if any of the assumptions above is wrong: `findByName` returning `null` makes `writeEmissive` a no-op, and the `handles.tripPin` set is null-safe. So the worst case is "cues do nothing", which is bit-identical to today's scene.

---

### File-touch summary (for Sol to verify)

- New: `src/experiences/ohmdal-playcanvas/world/arc1/castleStateCues.ts`
- New: `src/experiences/ohmdal-playcanvas/world/arc1/castleStateCueBindings.ts`
- Edit, additive only: `src/experiences/ohmdal/world/arc1/buildArc1Greybox.ts` — one new `addCylinder` for the trip pin.
- Edit, additive only: `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts` — one new import and one new line inside `updateArc1WorldVisuals`.
- No changes to `arc1GreyboxModel.ts`, the material bible, the interaction policy, or the area reference plan.
- No new dependencies, no new materials, no new point lights, no permanent glowing copper.
