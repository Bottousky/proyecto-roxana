# Ohmdal Scenic Rendering Policy

## Goal

Fill the current dark cyan/blue voids without turning a free-look first-person world into flat matte paintings. Use the cheapest representation that preserves perspective, depth and authored identity.

## Four depth layers

### L0 — Sky / atmosphere

Use sky dome, gradient, cubemap or equirectangular 360° panorama for effectively infinite-distance content. This is the correct place for generated sky imagery.

### L1 — Far horizon

Distant mountains, civic silhouettes and far structures may use a 360°/panoramic matte layer, but should be backed by a few very cheap 3D silhouettes when camera motion would expose parallax errors.

### L2 — Scenic shell

Non-interactive cliffs, building masses, aqueducts, retaining walls, roofs and large environmental forms are low-cost 3D. Requirements:

- strong silhouette and scale;
- few materials;
- batching/instancing where useful;
- no detailed interiors/collision unless needed;
- enough depth to provide real parallax.

### L3 — Gameplay geometry

Anything the player touches, measures, collides with, reads or uses in a puzzle is real 3D with correct collision/state ownership.

## Interiors

Interior rooms must be architecturally enclosed except intentional doors/windows/patios. Seeing a huge sky dome through a missing wall/roof is a bug, not an invitation to paste a background image.

Through intentional openings, prefer a cheap adjacent-zone proxy rather than loading the full neighboring zone:

- visible facade/ground chunk;
- 2–10 draw-call target when practical;
- no gameplay interactions;
- enough depth to avoid a void.

## Generated imagery

Allowed/encouraged for:

- sky panoramas;
- far-horizon mattes;
- distant atmospheric silhouettes;
- reference/concept generation.

Not allowed as the sole solution for nearby first-person architecture or terrain where free camera movement exposes perspective errors.

## Parallax

Use layered imagery only at genuinely distant depth. Real parallax for near/mid ground comes from cheap 3D geometry, not from stacking many camera-facing cards.

## Zone structure target

```text
ZoneRoot
├── GameplayRoot
├── CollisionRoot / collision registry
├── ScenicNearRoot
├── ScenicFarRoot
├── AtmosphereRoot
├── FxRoot
└── PortalProxies
```

This is a conceptual ownership contract; do not rewrite working code merely to match directory/entity names.

## Ohmdal visual constraints

- pale eroded stone;
- aged/oxidized copper without passive neon;
- ceramic insulators;
- workshop wood where justified;
- dark steel/mechanisms;
- instrument glass;
- restrained dusty atmosphere;
- water motion follows system state.

## Performance

Prefer one sky/horizon solution per scene family, shared materials, low-poly distant forms and zone-local activation. Scenic background work must not defeat lazy zone loading.
