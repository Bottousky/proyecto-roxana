# Ohmdal Arco I — Authored Pass Policy

## Status

Production contract for `ohmdal-arco1-authored-pass`.

## Principle

The complete greybox is already a validated game. The authored pass must improve presentation, readability and atmosphere **without silently changing the game underneath it**.

## Spatial authority

The PlayCanvas runtime and the completed Golden Path define load-bearing topology:

- navigable route;
- interaction locations;
- puzzle dependencies;
- zone transitions;
- before/after states;
- electrical/hydraulic causality.

Authored geometry may refine silhouette, enclosure, dressing and local circulation, but any change that materially moves a player-facing interaction, changes a route, blocks a validated sightline or alters a puzzle relation is a structural fix and must be retested.

## Art priority

1. authored forms / silhouette;
2. material hierarchy;
3. lighting and shadow discipline;
4. motion and physical response;
5. VFX and atmosphere;
6. decorative dressing.

Do not use bloom/fog/emission to disguise weak forms.

## Hero assets

Identity-defining props/environments require `HERO_REFERENCE_GATE` or an equivalent approved region reference contract before final production. Blender remains DCC master. Generated 3D candidates never become runtime authority directly.

## Materials

Follow `OHMDAL_VISUAL_MATERIAL_BIBLE.md`.

Hard rules:

- copper is not a light source;
- verdigris/oxidation is local, material, not neon;
- electrical emission appears during a physical event or energized indicator specifically designed to emit;
- water state is physically readable;
- ceramic/glass/wood/steel have distinct roles and roughness/value ranges;
- no generic ornamental steampunk clutter.

## Lighting

Use lighting to reveal geometry and state, not to create unrelated spectacle. Preserve the mobile shadow policy unless profiling proves a safe alternative. A new shadow-casting light requires measured justification.

## Interaction readability

Authored dressing must strengthen, not obscure:

- player paths;
- switch/breaker/valve positions;
- probe/measurement points;
- service branches;
- before/after state;
- consequences at world scale.

The interaction policy remains `world-first`, with diegetic maintenance close-ups only where precision/density justifies them.

## VFX

VFX are state communication. Each effect must declare:

- triggering physical event;
- lifetime;
- quiet/off state;
- mobile reduction strategy;
- whether it changes gameplay readability;
- draw/overdraw/material cost where meaningful.

Avoid ambient sparks and arcs with no electrical cause.

## Audio

Audio should expose machinery and electrical state:

- water flow;
- turbine/generator rotation;
- relay/contactor mechanics;
- bell;
- forge load/heat;
- pumps/irrigation;
- Faro machinery/environment.

Music/ambience may reinforce region identity but must not replace mechanical feedback.

## Performance

Greybox starting evidence:

- transfer ~22.03 MB;
- peak 145 draw calls;
- peak 88,836 triangles;
- one shadow-casting light.

Use zone-local loading, reuse materials, batching/instancing and optimized GLB. Do not solve visual quality by eager-loading the whole Arco I.

## Review

Every authored stage must be reviewed on:

- composition/readability;
- authored forms;
- material coherence;
- lighting;
- causal state communication;
- mobile/touch;
- performance delta;
- no gameplay regression.

Gemini provides independent critique; Sol owns acceptance.

## Definition of done

An area is not authored-pass complete because it has nicer textures. It passes when:

- the region has a distinct identity;
- its main technical system can be visually followed;
- before/after state is perceptible without explanatory text;
- interactive objects remain readable;
- canonical shots are coherent with adjacent regions;
- Golden Path remains valid;
- diagnostics remain within accepted budget or a documented approved exception.
