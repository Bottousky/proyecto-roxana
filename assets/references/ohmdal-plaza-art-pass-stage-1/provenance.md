# Ohmdal Plaza art pass stage 1 — provenance

Acquisition and license review date: 2026-08-22. Scope: free P1–P4 art pass only.

## Poly Haven materials

All seven materials below were downloaded from Poly Haven under CC0 1.0 at 2K source resolution,
then promoted to 1K runtime maps with Pillow/LANCZOS. Runtime excludes displacement. Each runtime
directory contains a machine-readable `provenance.json` with map dimensions, byte sizes and SHA-256.

| Runtime set | Original asset | Source |
|---|---|---|
| `plaza-cobble-base` | `cobblestone_floor_001` | https://polyhaven.com/a/cobblestone_floor_001 |
| `plaza-cobble-moss` | `mossy_cobblestone` | https://polyhaven.com/a/mossy_cobblestone |
| `stone-primary` | `stone_tile_wall` | https://polyhaven.com/a/stone_tile_wall |
| `stone-aged` | `stone_wall_05` | https://polyhaven.com/a/stone_wall_05 |
| `plaster-worn` | `medieval_wall_01` | https://polyhaven.com/a/medieval_wall_01 |
| `wood-workshop` | `medieval_wood` | https://polyhaven.com/a/medieval_wood |
| `iron-aged` | `rusty_metal_04` | https://polyhaven.com/a/rusty_metal_04 |

`plaza-cobble-moss` was acquired and promoted but not integrated in Stage 1: the current ground mesh
has no authored blend mask or vertex-colour channel, and applying it uniformly would create green
noise. It remains ready for a later geometry/decal pass.

## Quaternius

- `Medieval Village MegaKit[Standard]`, CC0 1.0:
  https://quaternius.com/packs/medievalvillagemegakit.html and
  https://quaternius.itch.io/medieval-village-megakit.
- `Fantasy Props MegaKit[Standard]`, CC0 1.0:
  https://quaternius.com/packs/fantasypropsmegakit.html and
  https://quaternius.itch.io/fantasy-props-megakit.

The Standard ZIPs and extracted inventories live only in ignored vendor staging. No whole pack is
shipped. Stage 1 integrates `Barrel`, `Crate_Wooden` and `Workbench` from Fantasy Props as one
deduplicated GLB with shared 1K atlases. Exact processing and limitations are recorded beside the
runtime file in `assets/runtime/ohmdal/plaza/props/vendor-derived/provenance.json`.

Medieval Village was inventoried (528 3D files across glTF/FBX/OBJ) but no module survived this gate:
the foreground portal, workshop and gate needed project-owned Ohmdal forms, and Blender was not
available for canonical normalization of vendor modules. Nature was intentionally deferred until
architecture/material review rather than adding dressing to unresolved silhouettes.

## Project-owned materials and geometry

`roxana-ohmdal-copper-aged-v1`, verdigris, ceramic insulators, conductors, terminals, junction boxes,
drains and authored architectural forms are project-owned procedural PlayCanvas geometry/materials.
The passive copper base is metallic warm brown/orange and non-emissive; verdigris is rough and mostly
non-metallic. Emission remains restricted to actual energized feedback materials.
