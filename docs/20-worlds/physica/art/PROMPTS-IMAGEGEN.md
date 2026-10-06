# Physica — assets candidatos para generación de imágenes

**Estado:** PROPUESTA. No hay nada generado todavía.

## Cómo se hizo en Ohmdal y por qué no se puede igual acá

Ohmdal usó la herramienta integrada `image_gen.imagegen` de Codex/ChatGPT (skill `imagegen`), con los prompts registrados en `docs/art-prompts-*.md`.

En las sesiones de Claude Code esa herramienta integrada no existe. La skill tiene un modo CLI (`~/.codex/skills/.system/imagegen/scripts/image_gen.py`) que llama a la API de OpenAI. Ese modo requiere tres cosas:
- `OPENAI_API_KEY` en el entorno;
- el paquete `openai` de Python;
- autorización explícita, porque el contrato pide autorización específica para servicios pagos.

**Vías posibles:**
- **A.** Generar los assets desde Codex/ChatGPT con estos prompts y dejarlos en `art-source/physica/`. Claude los integra, documenta la procedencia y los revisa en el juego.
- **B.** Autorizar el CLI con una clave y un presupuesto (cantidad de imágenes y tamaño). Claude ejecuta sólo los ítems listados.

## Reglas para todo asset

**Cómo se usan:**
- Son medios, no resultados: se integran en la escena 3D y se juzgan en juego, no sólo en la imagen suelta.
- La geometría sigue siendo la autoridad de colisión y física. Las imágenes aportan superficie, identidad y lejanía.
- Procedencia: archivo fuente, prompt completo, fecha, herramienta y revisiones, en `docs/20-worlds/physica/art/PROCEDENCIA.md`.

**Qué no pueden ser:**
- Nada de personajes, assets ni escenarios de las referencias (Captain Toad).
- Nada del cyberpunk de Bitland ni del medieval de Ohmdal.
- Nada de electrones decorativos ni de laboratorio blanco.

**Gramática visual (DECISIONES D7):**
- Estratos sedimentarios terracota, ocre y crema, cortados como una maqueta geológica.
- Agua aguamarina.
- Latón, madera aceitada y esmalte crema.
- Musgo en barbas.
- Cielo de damasco a verde agua.

## Prioridad 1 — textura de estratos (resuelve A10: la roca borrosa de cerca)

**Uso:** albedo de los frentes de roca, mapeado por coordenadas de mundo. Hoy son ruido procedural ampliado. Se necesita detalle a 5 m.

**Prompt:**
> Seamless tileable texture, 2048×1024, horizontally and vertically tileable. Front face of sedimentary sandstone strata seen straight on, like a cut geological model: horizontal layers of varying thickness in terracotta (#c47a55), ochre (#d4a375), cream (#e2c39a) and burnt sienna (#a9654a). Fine lamination lines inside each layer, small erosion pockets, subtle cross-bedding, a few embedded pebbles. Flat, even, shadowless lighting (albedo only, no cast shadows, no highlights). Matte, painterly but physically plausible, no text, no plants, no perspective.

**Variante:** el mismo prompt con «height map, grayscale, white = protruding layer edges» para relieve.

## Prioridad 2 — telón lejano con la ciudad (la vista desde el Mirador)

**Uso:** reemplaza las mesetas de silueta plana y la ciudad de cajas. Se coloca como capa lejana (z ≈ −60) con transparencia en el cielo.

**Prompt:**
> Wide matte painting, 4096×1024, transparent sky (alpha), for a side-view diorama game background. Layered desert mesas with sedimentary bands in terracotta, ochre and cream, receding in warm apricot atmospheric haze. In a valley between two mesas, far away and partly hidden, an orderly scientific city: slender towers, observatory domes, aqueduct arches, a few warm-lit windows, rendered in cool violet-grey silhouettes so it reads as different from the landscape. Calm, wondrous, not cyberpunk, not medieval, no neon, no people, no text.

## Prioridad 3 — retrato y hoja de giro del explorador

**Uso:** retrato en la Bitácora y en la interfaz. Debe coincidir con el modelo 3D:
- abrigo azul petróleo y bufanda azafrán larga;
- antiparras de latón en la frente;
- cartera de cuero con la Bitácora;
- reloj de latón en la muñeca izquierda;
- cinturón con hebilla de latón;
- cabeza grande y proporciones de 3 cabezas.

**Prompt:**
> Character turnaround sheet (front, three-quarter, side, back) and a bust portrait, transparent background, of a young student explorer for a physics adventure game: big round head (3-head proportions), dark brown hair with a tuft, brass goggles resting on the forehead, deep teal coat with brass buttons, long saffron scarf, leather satchel, brass wrist instrument on the left wrist, belt with a brass buckle at the waist, cream trousers, brown boots. Curious, attentive expression. Soft cel-shaded illustration with clean dark outlines, warm light. Gender-neutral, no logos, no text.

## Prioridad 4 — vegetación con identidad

**Uso:** sprites con alfa colocados como tarjetas en el diorama. Se orientan según el campo, como el musgo.

**Prompt:**
> Sprite sheet, transparent background, 8 plants for a sedimentary canyon: hanging moss beards in olive and sage, tall plumed reeds with cream seed heads, small coral flowers on wiry stems, round succulent rosettes, a twisted dwarf tree with sparse leaves. Each plant isolated, painterly, side view, consistent lighting from upper left, no ground, no text.

## Prioridad 5 — papel e ilustraciones de la Bitácora

**Prompt:**
> Seamless cream field-notebook paper texture with faint grid and subtle stains (tileable, 1024²); plus small ink-and-watercolor marginal sketches: a plumb bob, a brass bell, a chain with height marks, a sphere with equally timed dots rising and falling. No text.
