# Ohmdal Arc I — Reference Image Prompts

**Status:** PRODUCTION REFERENCE / NON-AUTHORITATIVE  
**Geometry authority:** `arc1-layout.json` + `arc1-constraints.json`  
**Purpose:** composition, silhouette, atmosphere, spatial hierarchy and architectural language.

> These images MUST NOT be used as literal plans. A generated image may suggest a better composition, but any accepted spatial change must be translated back into `arc1-layout.json`, regenerated in the top-down debug view, validated in greybox and reviewed through the real gameplay camera.

## Naming / provenance

Recommended files once exported from the image generator:

```text
references/
  arc1-overworld-masterplan-v0.png
  cuenca-keyframe-v0.png
  castillo-keyframe-v0.png
  forja-terrazas-keyframe-v0.png
  faro-lago-keyframe-v0.png
```

For every promoted reference, keep a sidecar or manifest entry with: model/provider, date, exact prompt, layout commit SHA, status (`exploration|selected|retired`) and notes about which qualities are authoritative (`mood`, `silhouette`, `composition`) versus explicitly non-authoritative (`dimensions`, `coordinates`, `door count`).

## Global negative direction

Apply to every prompt unless a specific scene says otherwise:

- no text, labels, UI or map legend inside the artwork;
- no characters unless a later shot is explicitly about staging;
- no generic steampunk clutter for its own sake;
- no dense maze of props that destroys traversability;
- no glowing-everything cyberpunk look;
- no pristine restoration in the initial state;
- no exact copying of a copyrighted game scene;
- do not treat image perspective as the runtime camera contract;
- concept image is not a metric blueprint.

---

## REF-00 — Arc I overworld masterplan

**Target:** `references/arc1-overworld-masterplan-v0.png`  
**Use:** macroterritory composition and landmark hierarchy only.

```text
OHMDAL ARC I — OVERWORLD MASTERPLAN CONCEPT REFERENCE, not a literal metric map.

Create a highly legible bird’s-eye / orthographic concept masterplan for a compact HD-2D fantasy-electrical RPG world. Four major macroterritories must read as a coherent journey:

1. CUENCA DE OHM at center: monumental Plaza de Ohm, Portal Ω arriving from the south, Taller de Lumen as an east-side branch, Puerta de Ohm and Manantial toward the north.
2. CASTILLO DE LA RED to the northwest: a fortified distribution complex with branching copper conduits and districts.
3. FORJA Y TERRAZAS to the west/southwest: industrial forge connected to descending irrigated terraces, channels and aqueducts.
4. FARO Y LAGO to the south/southeast: an inland lake, archive/workshop shore, clock machinery and a tall lighthouse.

The world should look dormant and worn but not ruined: dark blue stone, aged copper, muted amber, water channels, visible electrical infrastructure integrated into paths. HD-2D aesthetic: 3D diorama environments with pixel-art sensibility, nearly orthographic camera, strong spatial readability without copying any specific copyrighted scene.

No characters, no UI, no labels, no text. Prioritize silhouette, paths, landmarks, negative space and navigability over decoration. The four territories should be visually distinct but part of one island/basin.

This image is a composition/mood reference only; exact geometry comes from JSON layout coordinates.
```

---

## REF-01 — Cuenca de Ohm / Plaza de verdad

**Target:** `references/cuenca-keyframe-v0.png`  
**Use:** H2 scale target, main-axis composition, Plaza breathing room, Taller as lateral branch.

```text
OHMDAL ARC I — CUENCA DE OHM HD-2D KEYFRAME CONCEPT.

Nearly orthographic elevated gameplay camera, wide 16:9 composition. A deliberately spacious monumental plaza as the central hub, approximately twice the breathing room of a small courtyard.

Strong north-south ceremonial axis:
Portal Ω forecourt in the south foreground → broad arrival promenade → Plaza de Ohm with a restrained central electrical-water monument and generous negative space → monumental Puerta de Ohm in the north background → hinted descending Manantial beyond.

Taller de Lumen is an important lateral destination on the east/right edge with its own small forecourt and visible entrance facing the plaza, clearly secondary to the main axis and never blocking it.

Dark blue-gray stone, aged copper conduction lines integrated in paving, dormant lamps, water infrastructure, low walls, stairs and readable thresholds. World dormant and worn but inhabited, not ruined.

HD-2D: 3D environment with pixel-art character readability in mind, dramatic but functional lighting, strong silhouettes, no characters, no text/UI. Focus on level-design scale, navigability, sightlines and distinct spatial zones, not decorative clutter.

Reference image only; exact dimensions are controlled by layout JSON.
```

**What to extract if selected:**
- ratio of monument footprint to usable Plaza space;
- silhouette separation Portal / Plaza / Puerta;
- how much lateral breathing room makes the Taller read as a branch;
- foreground / gameplay plane / landmark layering.

**What NOT to extract:** exact wall positions, exact building dimensions, exact number of lamps.

---

## REF-02 — Castillo de la Red

**Target:** `references/castillo-keyframe-v0.png`  
**Use:** Chapter 2 branching/distribution spatial metaphor and institutional hierarchy.

```text
OHMDAL ARC I — CASTILLO DE LA RED HD-2D KEYFRAME CONCEPT.

Nearly orthographic elevated gameplay camera, 16:9. A fortified electrical distribution district, not a generic medieval castle: monumental gate at the lower/southern approach, a broad public distribution court, branching copper conduits that visibly split toward several neighborhood service paths, a gallery and institutional wing, and a taller network-heart/distributor landmark toward the north.

Architecture communicates governance, isolation, maintenance and series/parallel distribution through physical infrastructure: removable seals, disconnect points, inspection cabinets, conductor trunks embedded in stone, branching channels.

Dark blue-gray masonry, oxidized copper, muted parchment/amber institutional accents, dormant state with localized work lights only. Space must be navigable and readable with clear main route plus optional side loops, strong thresholds, sightline from gate toward the distributor, enough negative space for 2D sprites and interactions.

HD-2D 3D diorama, handcrafted pixel-art sensibility, atmospheric depth, no characters, no text/UI. Not ruined; worn, maintained by ritual, awaiting understanding.

Reference image only; metric layout comes from JSON.
```

---

## REF-03 — Forja y Terrazas

**Target:** `references/forja-terrazas-keyframe-v0.png`  
**Use:** Chapter 3 production-vs-irrigation conflict visible in one coherent region.

```text
OHMDAL ARC I — FORJA Y TERRAZAS HD-2D KEYFRAME CONCEPT.

Nearly orthographic elevated gameplay camera, wide 16:9. One coherent regional diorama where an industrial forge complex occupies the west/left upper plateau and a descending sequence of irrigated terraces and aqueduct channels occupies the east/south side.

A shared visible electrical-water corridor physically connects production and irrigation so the player can understand the community tradeoff between forge load and water distribution.

Include forge yard, large furnace hall silhouette, hot conductor route, safety/maintenance station, stepped terraces, sluice gates, water channels, lower aqueduct and abandoned planting levels.

Dormant initial state: furnace embers low, water partial or stopped, lamps off, wear and repairs visible. Dark stone, ceramic heat shields, thick aged copper, restrained ember amber, cool blue water.

Clear route hierarchy, broad playable platforms, stairs/ramps, guardrails, interaction spaces and sightlines; avoid cramped maze design. HD-2D 3D diorama with pixel-art sensibility, atmospheric depth and strong silhouettes, no characters, no text/UI.

Reference only; exact geometry and distances come from layout JSON.
```

---

## REF-04 — Faro y Lago

**Target:** `references/faro-lago-keyframe-v0.png`  
**Use:** Chapter 4 orientation, negative space, memory → calibration → public signal sequence.

```text
OHMDAL ARC I — FARO Y LAGO HD-2D KEYFRAME CONCEPT.

Nearly orthographic elevated gameplay camera, 16:9. A compact inland-lake shoreline diorama for the final chapter of an educational fantasy-electrical RPG.

The lake creates generous negative space; on the shore sit a practical archive/workbench pavilion, a calibration platform, clock machinery and a tall lighthouse on a promontory, all connected by visible copper-and-light infrastructure.

The route should reveal the lighthouse gradually while always keeping its silhouette as orientation. Include dock or narrow service walkway, protected shoreline, machinery bench related to storage/timing, clock mechanism as an intermediate landmark, and lighthouse lantern chamber as the culmination.

Dormant/worn starting state: beacon dark, mechanism irregular, localized maintenance lights only, surfaces aged rather than ruined. Dark blue-gray stone, weathered copper, cool lake reflections, restrained warm amber at human work areas.

HD-2D 3D diorama with handcrafted pixel-art sensibility, strong sightlines and traversable platforms for 2D sprites, no characters, no text/UI. The human memory of rhythm should feel respected, not replaced by sterile machinery.

Reference only; exact placement is controlled by layout JSON.
```

---

## Review loop for generated images

Do not ask an image model for “the final map”. Use image generation as an exploration loop:

1. Generate 2–4 concepts from the same spatial brief.
2. Select one only for named qualities (e.g. `silhouette + negative space + landmark hierarchy`).
3. Translate those qualities into layout changes or constraints.
4. Regenerate the deterministic top-down plan from JSON.
5. Rebuild greybox.
6. Capture the real gameplay camera.
7. Compare concept intent vs runtime evidence.
8. Keep the concept only if it still helps explain intent; retire it if the runtime has become the clearer reference.

This prevents visual references from silently becoming a second geometry system.