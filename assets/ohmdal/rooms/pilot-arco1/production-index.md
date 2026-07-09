# Índice de producción — Arco I

Estado: borrador completo para revisión artística. No registrado todavía en `data/asset_manifest.json`.

## Bases

| Unidad | Chunks nuevos |
|---|---|
| U1 | `manantial_ohm_base-v2`, `taller_base` |
| U2 | `castle_gate_base-v2`, `castle_gallery_base`, `castle_branches_base`, `castle_heart_base` |
| U3 | `forge_yard_base`, `forge_infirmary_base`, `forge_longchannel_base`, `forge_hall_base` |
| U4 | `terraces_top_base`, `terraces_mid_base`, `terraces_mural_base`, `terraces_aqueduct_base` |
| U5 | `lighthouse_hall_base`, `lighthouse_bench_base`, `clock_tower_base`, `lighthouse_lantern_base` |

`plaza` y la secuencia de `puerta` se conservan como anclas aprobadas existentes.

## Props aislados

| Zona | Props |
|---|---|
| Plaza/U1 | `prop_plaza_bell`, `prop_boca_manantial`, `prop_taller_workbench`, `prop_taller_shelves_jars`, `prop_taller_generator` |
| Castillo | `prop_castle_gallery_lamp`, `prop_castle_trunk_distributor`, `prop_castle_master_distributor`, `prop_porton_castillo` |
| Forja | `prop_forge_gate`, `prop_forge_barrel`, `prop_forge_crate`, `prop_forge_ingots`, `prop_fuses_hanging`, `prop_forge_hearth_off`, `prop_forge_hearth_on` |
| Terrazas | `prop_terraces_sluice_gate` |
| Faro/Reloj | `prop_clock_face`, `prop_clock_gear`, `prop_lighthouse_lens_off`, `prop_lighthouse_lens_on`, `prop_lighthouse_dock`, `prop_lighthouse_boat` |

## Variantes integradas

- `manantial_ohm+prop_boca_manantial-v2`
- `castle_gate+prop_porton_castillo-v2`
- `castle_branches+prop_castle_trunk_distributor`
- `castle_heart+prop_castle_master_distributor`
- `forge_yard+prop_forge_gate`
- `forge_hall+prop_forge_hearth_off`
- `clock_tower+prop_clock_face`
- `lighthouse_lantern+prop_lighthouse_lens_off`

Las variantes preferidas para `manantial_ohm` y `castle_gate` son las terminadas en `-v2`: corrigen la lectura espacial y muestran explícitamente cielo, horizonte y paisaje nocturno. Las v1 se conservan únicamente para comparación.

Los cambios sin geometría —glow, agua, haz, partículas, giro del reloj y encendido de lámparas— quedan para Phaser/CSS. Solo el hogar y la lente incluyen estados visuales de prop.

## Dirección ambiental

Ver `docs/direccion-ambiental-salas-ohmdal-arco1.md`. La generación se realizó con la herramienta integrada `image_gen`, croma removido localmente para props y normalización de chunks a 960×540 con vecino más cercano.
