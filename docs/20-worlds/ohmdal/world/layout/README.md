# Ohmdal Arc I — Spatial Layout Contract

**Status:** PROPOSED / production working contract  
**Scope:** Arco I «La Luz» — Cuenca de Ohm, Castillo de la Red, Forja y Terrazas, Faro y Lago  
**Runtime target:** `src/hd2d-ohmdal/`  
**Do not use this document to redefine lore, pedagogy or visual identity.** It translates existing sources of truth into a spatial representation that humans and agents can inspect, edit and validate.

## 0. Why this exists

The HD-2D runtime already has useful metric topology for the Cuenca (`src/hd2d-ohmdal/world/topology.ts`), but the Arc I world is described across narrative, gameplay, world-structure and legacy grid documents. An agent that only sees code plus a gameplay screenshot must reconstruct the world mentally and tends to collapse distances, move landmarks independently, or optimize local geometry while breaking the global composition.

This contract separates four concerns:

1. **Lore / intent** — why a place exists and what must happen there.
2. **Semantic graph** — what is connected to what and which spatial relationships are meaningful.
3. **Metric layout** — where footprints, anchors, paths and thresholds live.
4. **Rendered evidence** — deterministic top-down/debug views and gameplay-camera captures generated from the metric layout.

The metric data is authoritative for geometry. Concept images are references, never coordinates.

## 1. Authority chain

Read in this order before changing layout:

1. `docs/20-worlds/ohmdal/AGENTS.md`
2. `docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md`
3. `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md`
4. `docs/20-worlds/ohmdal/narrative/ohmdal-narrative-bible_v1.md`
5. `docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`
6. `docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md`
7. this directory: spatial translation and production constraints
8. runtime implementation in `src/hd2d-ohmdal/`

Legacy `grilla-mundo.md` remains historical input. It describes an older room/chunk architecture and MUST NOT override the current «overworld + regional dioramas» decision.

## 2. Two coordinate spaces, not one giant world plane

Arc I uses **two nested coordinate systems** because the canonical world structure explicitly compresses the overworld and does not share its scale with regional dioramas.

### 2.1 Overworld coordinates — symbolic

Purpose: composition, navigation graph, landmark placement and travel direction.

- plane: XZ
- `+X = east`
- `-X = west`
- `-Z = north`
- `+Z = south`
- `Y = up`
- origin: Cuenca de Ohm landmark
- units: **symbolic atlas units**, NOT meters

Never infer walk time, building dimensions or puzzle distance from overworld coordinates.

### 2.2 Diorama coordinates — metric

Purpose: actual playable geometry, camera composition, collisions, interaction distance, routes and tests.

- Three.js right-handed scene convention
- plane: XZ
- `+X = east`, `-X = west`
- `+Y = up`
- `-Z = north`, `+Z = south`
- **1 world unit = 1 meter**
- each diorama has its own named origin
- positions are `[x, y, z]`
- footprints are `[widthX, depthZ]`
- rotations are degrees around `+Y`, with `0°` facing north (`-Z`) in this contract

Never connect two dioramas by pretending their local meter coordinates touch. Connections use named entrances/exits in the semantic graph.

## 3. Coordinates alone are NOT enough

Agents need numeric truth; humans and VLM reviewers need composition evidence. Therefore every accepted layout change must keep these synchronized:

- `arc1-layout.json` — source of truth for positions, footprints, anchors and links.
- `arc1-constraints.json` — invariants that may not be broken by local optimization.
- generated top-down SVG/PNG — **derived artifact**, never hand-edited.
- gameplay-camera screenshot(s) — evidence that scale and occlusion work in the actual camera.
- optional concept art — mood, silhouette and architectural intent only.

A top-down view is mandatory for layout review because it makes spacing, alignment, negative space, branching and route hierarchy directly inspectable. It is not a second source of truth: it must be generated from the JSON.

## 4. Arc I spatial hierarchy

```text
OHMDAL OVERWORLD (symbolic)
├── CUENCA DE OHM
│   ├── Portal Ω forecourt
│   ├── arrival promenade
│   ├── Plaza de Ohm
│   ├── Ohm activation anchor
│   ├── Taller de Lumen forecourt
│   ├── Taller de Lumen interior
│   ├── Puerta de Ohm forecourt
│   └── Manantial / descent
│
├── CASTILLO DE LA RED
│   ├── gate approach
│   ├── public distribution court
│   ├── neighborhood branches
│   ├── gallery / institutional wing
│   ├── branch hall
│   └── network heart / distributor
│
├── FORJA Y TERRAZAS
│   ├── forge yard
│   ├── forge hall
│   ├── safety / maintenance station
│   ├── shared energy-water trunk
│   ├── upper terraces
│   ├── middle terraces
│   ├── lower terraces
│   └── aqueduct / outlet
│
└── FARO Y LAGO
    ├── shore entry
    ├── archive / work pavilion
    ├── calibration bench
    ├── clock machinery
    ├── lake and service shore
    ├── dock
    └── lighthouse / lantern
```

This hierarchy implements the four macroterritories declared in `ohmdal-world-structure_v1.md` and the Prólogo + Chapters 1–4 declared in `ohmdal-arc-01_v1.md`.

## 5. Scale policy

The current HD-2D Cuenca implementation is deliberately treated as **evidence**, not as the final scale. `topology.ts` currently describes a roughly 20×16 m Plaza inside a compact ~80×90 m Cuenca. The planning target in `arc1-layout.json` enlarges the Plaza and separates its thresholds so Portal → Plaza → Puerta reads as a sequence of spaces rather than one exterior room.

Scale rules:

- first solve movement, sightlines, camera and negative space with greybox primitives;
- keep a player-scale reference visible while blocking out;
- spaces viewed from the elevated HD-2D camera may require exaggeration versus literal architecture;
- landmarks may be exaggerated, but interaction distances and collision remain human-readable;
- do not enlarge maps to manufacture playtime; duration comes from meaningful interaction, not walking filler.

All metric sizes in `arc1-layout.json` outside the currently playable Cuenca are **planning v0** and must be validated by greybox + camera before promotion.

## 6. Layout primitives

Every diorama is described with the same primitives:

- `bounds` — production envelope, not a wall by itself.
- `zones` — large functional spaces that define rhythm and camera composition.
- `landmarks` — visually or narratively important anchors.
- `buildings` — footprints + entrance orientation.
- `paths` — intended navigable corridors, not splines that force the player.
- `thresholds` — gates, doors, stairs, bridges or transition points.
- `interactionAnchors` — exact or bounded locations required by gameplay.
- `entrances` / `exits` — semantic links to overworld/interiors/other scenes.
- `protectedSightlines` — compositions that must remain readable.
- `reservedNegativeSpace` — intentionally empty playable/compositional area.

Do not place decorative props in this file unless they are navigation, interaction, occlusion or silhouette-critical.

## 7. Agent editing protocol

For any request such as “make the Plaza larger”, “move the Taller”, or “open the Castillo”:

1. Read the relevant lore and chapter requirements.
2. Read `arc1-layout.json` and `arc1-constraints.json`.
3. State which zones/anchors/constraints are affected.
4. Modify layout data first; do not scatter new magic coordinates through render code.
5. Regenerate top-down evidence.
6. Build/update greybox from the layout.
7. Capture at least:
   - one top-down orthographic view;
   - one real gameplay-camera view at the entry;
   - one real gameplay-camera view at the causal interaction.
8. Run spatial checks and navigation checks.
9. Only then touch art/polish.

If a concept image disagrees with JSON, **JSON wins**. If runtime and JSON disagree, the change is incomplete until one is deliberately migrated and the difference is documented.

## 8. Review gates

A layout can leave greybox only when:

- required landmarks are reachable;
- protected main routes have the required clear width;
- no building intersects a protected sightline or route corridor;
- entrances face the intended public space;
- causal interactions have enough local staging area for player + Ohm/NPC + feedback object;
- top-down composition is legible at a glance;
- gameplay camera shows the next meaningful landmark without requiring free camera rotation;
- interiors are enterable and have a clear return path;
- Arc I world-state changes (deteriorated → intervention → understood) do not require rebuilding the physical topology.

## 9. Debug view recommendation

Implement a development-only layout layer in `src/hd2d-ohmdal/` using the existing Three.js scene:

- `GridHelper` on XZ;
- `AxesHelper` at diorama origin;
- orthographic top camera for map capture;
- labels for IDs and `[x,y,z]`;
- zone/building footprint boxes;
- path corridors and threshold arrows;
- protected sightlines;
- interaction radii;
- collision/nav bounds;
- optional cable graph overlay.

Suggested toggles:

```text
?layoutDebug=1
?layoutTop=1
?layoutLabels=1
?layoutElectrical=1
```

The top camera is a **review/debug instrument**, not the gameplay camera.

## 10. Generated concept references

See `REFERENCE_PROMPTS.md`. These images are intentionally non-authoritative. They answer “what could this territory feel/read like?”; they do not answer “where exactly is this wall?”.
