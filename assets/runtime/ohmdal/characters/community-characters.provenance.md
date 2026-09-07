# Ohmdal — personajes comunitarios, candidatos C3

## Procedencia y autorización

La iteración C1–C4 y la búsqueda de assets fueron autorizadas por Manuel el 6 de septiembre de 2026. Estas adaptaciones son candidatos locales; no promueven una nueva dirección visual a canon.

Fuentes oficiales, descargadas sin pago el 7 de septiembre de 2026:

- Quaternius Universal Base Characters, Standard: https://quaternius.itch.io/universal-base-characters
- Quaternius Modular Character Outfits – Fantasy, Standard: https://quaternius.itch.io/modular-character-outfits-fantasy
- Ambas distribuciones incluyen License_Standard.txt: CC0 1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/
- La versión gratuita de cuerpos incluye Superhero Male/Female; no incluye los seis cuerpos anunciados para el paquete completo. La versión gratuita de prendas incluye Peasant/Ranger. No se adquirió la versión Source.

Los archivos crudos y sus licencias están en `assets/source/vendor/quaternius/` (cantera ignorada por Git). Los seis GLB derivados utilizados se encuentran junto a este documento; los maestros .blend en `assets/source/ohmdal/characters/`.

## Adaptaciones reproducibles

`scripts/3d/build-ohmdal-community-characters.py` importa las prendas, conserva cabeza/manos del cuerpo, unifica el rig compatible por nombres y poses de reposo, retira capuchas/pauldrons y helpers editoriales, aplica materiales de Ohmdal y cinco acciones: Idle, Observe, Explain, Record, Listen. No se usa Three.js ni se retargetean rigs incompatibles.

Edda: trenza al hombro y borgoña, basada en `assets/ohmdal/portraits/edda.png`. Lumen: barba/cabello claro, gafas circulares y azul oscuro, basado en su retrato. Consejera: recogido y prendas oscuras según retrato. Yesca: recogido y gafas de trabajo según retrato. Vega/Nereo: adaptación provisional de ocupación y edad del Character Bible; no existe en este cambio una nueva biografía ni referencia canónica aprobada.

Se corrige un nombre de textura inexistente del proveedor (T_Eye_Normal_png.png → copia de T_Eye_Normal.png). Se remuestrean texturas de entrega a 512 px de color / 256 px auxiliares; las fuentes originales se conservan. Se excluyen las geometrías editoriales Icosphere. Las prendas procedurales principales son geometría del proveedor, no una reconstrucción mediante primitivas.

## Calibración y límites

`calibration.json` registra bounds exactos de vértices en bind pose, centro, grounding y los cinco clips comunes. Edda añade `Operate` (3,75 s, sin loop): `scripts/3d/add-edda-instrument-action.py` hornea un alcance del brazo derecho mediante IK sobre el mismo rig y exporta de nuevo sólo Edda. El master adicional es `assets/source/ohmdal/characters/edda-operation.blend`. Los bounds permanecen iguales. El loader aplica escala uniforme por altura, offset de suelo y corrección +Z GLTF → -Z PlayCanvas. Cada región carga sus personajes mediante el lifecycle existente.

La inspección offline no prueba animación, contacto de pies ni fidelidad visual final. El informe de la iteración debe aportar esa evidencia en PlayCanvas antes de considerar cerrado el gate de personaje. La cara adulta de la base y la fidelidad de la ropa al retrato siguen siendo aspectos a evaluar visualmente.

La entrega posterior exporta tangentes explícitas en los seis personajes; se eliminan las advertencias `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE`. `scripts/3d/export-ohmdal-character-delivery.py` reproduce esta exportación desde los seis masters, usando `edda-operation.blend` para conservar el sexto clip. El lote suma 22.202.576 bytes; sus bind bounds son idénticos a la calibración. El validador conserva advertencias `NODE_SKINNED_MESH_NON_ROOT` de la jerarquía importada: no se reparenta el rig para silenciarlas. Las pruebas de animación y ubicación en PlayCanvas siguen siendo necesarias.
