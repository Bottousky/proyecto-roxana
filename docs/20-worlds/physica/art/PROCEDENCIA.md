# Physica — procedencia de assets

Todo lo que no figura acá es procedural, generado por código en `experiments/physica/src` (geometría, materiales, agua, partículas, sonido). Las fuentes tipográficas (Fraunces e Inter) vienen de `@fontsource`, con licencia OFL.

## Imágenes generadas (2026-10-05)

- **Herramienta:** Codex CLI 0.160.0, incluido en la app de ChatGPT (`/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`), en modo `exec`.
  - Se usó su herramienta integrada `image_gen` (skill `imagegen`, modo predeterminado), con la sesión de ChatGPT del usuario.
  - No hubo clave de API.
  - El usuario autorizó el uso automático ese mismo día.
- **Sandbox:** `workspace-write`, limitado a `art-source/physica/`.
- **Revisión:** cada archivo se revisó visualmente antes de integrarlo.
- **Prompts:** se registra el prompt exacto que Codex reportó haber enviado. Las especificaciones de partida están en `PROMPTS-IMAGEGEN.md`.

| Fuente (`art-source/physica/`) | Tamaño | Uso en el juego | Procesamiento |
|---|---|---|---|
| `strata-albedo-v1.png` | 1254×1254, RGB | `public/textures/strata-1024.jpg`. Detalle de alta frecuencia (pasa-altos) y relieve por bump de la roca. El color de las bandas sigue siendo procedural, para que coincida con las repisas de la geometría. | `sips` a 1024², JPEG con calidad 84. Envoltura espejada para ocultar posibles costuras. |
| `backdrop-city-v1.png` | 1536×1024, RGBA | `public/textures/backdrop-city.png`. Telón lejano (plano en z = −70, 150×100 m), con la ciudad detrás del Mirador. Sin niebla de escena: la pintura trae su propia bruma. | Copia sin cambios. |
| `explorer-sheet-v1.png` | 1536×1024, RGBA | `public/textures/explorer-portrait.png`. Retrato del explorador en la cabecera de la Bitácora, tomado del busto de la hoja de giro. | Recorte con `sips` (400×250 desde 310,1280), escalado a 200×320. |

| `backdrop-mesas-v2.png` | 1536×1024, RGBA | `public/textures/backdrop-mesas.png`. Mesetas lejanas sin primer término (z −110). Reemplaza a `backdrop-city-v1` (descartado en la revisión de arte). | Copia sin cambios. |
| `city-layer-v2.png` | 1536×1024, RGBA | `public/textures/city-layer.png`. Ciudad científica (z −90). Visible sólo después de descubrirla desde el Mirador. | Copia sin cambios. |

| `vegetation-sheet-v1.png` (2026-10-06) | 1536×1024, RGBA | `public/textures/vegetation.png`. Plantas pintadas en tarjetas instanciadas (`src/render/vegetation.js`): mata, pasto alto, juncos, flores coral y azafrán, suculenta, helecho y almohadón de musgo. | `scripts/hoja-limpiar.mjs` a 1024 px de ancho (PNG con alfa, 826 KB): se recolorearon los 54.163 píxeles semitransparentes de los bordes con el promedio de los opacos a 3 px, porque conservaban el halo de color de la fuente. El juego sube la textura premultiplicada. El canal alfa se verificó con `scripts/hoja-alfa.mjs`: el fondo tiene alfa 0, las plantas son opacas y hay 4 % de bordes semitransparentes. La fila de abajo quedó 57 px sobre el borde de sus celdas y el helecho invade unos píxeles la celda del musgo, así que cada tarjeta usa el rectángulo medido de su planta, no la grilla. |

| `ground-top-v1.png` (2026-10-06) | 1024×1024, RGB | `public/textures/ground.jpg`. Suelo pintado de los altos transitables (tierra ocre y terracota, guijarros, matas de pasto y musgo), muestreado en el shader de la roca a dos escalas, una de ellas rotada, para que no se vea la repetición. | `scripts/textura-sin-costura.mjs`: mezcla con una copia desplazada media textura, que sólo pesa cerca de los bordes, y exporta JPEG al 86 % (276 KB). Costura medida con `scripts/textura-costura.mjs`: la diferencia de color a través del borde bajó de 12,0 / 11,9 a 9,0 / 8,7, contra 6,7 / 7,1 entre columnas y filas vecinas del interior. |

### Prompts reportados por Codex

**`ground-top-v1.png`:**
> Generate exactly ONE square 1024x1024 seamless TILEABLE texture: opposite edges must match so it repeats without visible seams horizontally and vertically. Seen straight from above, top-down orthographic, no perspective, no horizon. Subject: the walkable top of a sedimentary canyon terrace in a painterly diorama game: warm ochre and terracotta sandy soil with fine grain, scattered small cream and rust pebbles, a few flat sandstone flakes, and irregular soft-edged patches of short olive-green and sage grass and moss covering roughly 35 percent of the area, with grass thinning out gradually into the soil and no hard outlines around patches. Lighting: soft and even, nearly shadowless albedo texture, no strong highlights, no cast shadows, no vignetting. Palette: terracotta #c47a55, ochre #d4a375, cream #e2c39a, olive #7f9a52, sage #8ca46a, soil brown #8a5a3c. Style: hand-painted, soft cel-shaded illustration, consistent with a cozy canyon diorama; not photographic. Constraints: no objects other than the specified ground pebbles and sandstone flakes, no flowers, no tall plants, no water, no text, no logos, no grid, no border, no frame. Texture fills the whole square edge to edge. Grass patches and soil details crossing any edge must continue seamlessly at the opposite edge.

**`vegetation-sheet-v1.png`:**
> Generate exactly ONE image: a landscape 1536x1024 PNG sprite sheet with a genuinely TRANSPARENT background and preserved alpha. Layout: an invisible grid of 4 columns x 2 rows of equal cells, 384x512 px each. Each cell contains exactly one plant, centered horizontally, standing on the bottom of its cell, its base about 12 px above the cell's bottom edge. Top-row bases at y=500; bottom-row bases at y=1012. Column centers at x=192, 576, 960, 1344. Every plant is fully contained inside its own cell with at least 20 px of empty transparent margin on the left, right and top; nothing crosses a cell border; no plant touches another. Plants, left to right, top row then bottom row: 1) a low tuft of olive-green bunch grass with arching, curved blades; 2) a taller sage-green grass clump with slender cream seed heads; 3) a cluster of tall reeds with cream feathery plumes (a stream-bank plant); 4) small coral-orange wildflowers on thin wiry stems with a few leaves; 5) saffron-yellow star-shaped flowers on a small leafy clump; 6) a round succulent rosette in teal-sage with pink-tipped leaves; 7) a single fern: a fan of fronds with curled fiddleheads; 8) a low cushion of olive moss dotted with tiny cream flowers. Style: painterly, soft cel-shaded illustration with clean thin dark outlines, warm light from the upper left, colours that sit in a sedimentary canyon diorama of terracotta, ochre and cream; pure side view. Constraints: no ground, no soil, no pot, no cast shadow, no text, no labels, no numbers, no watermark, no background colour, no visible grid, no checkerboard drawn into the image; all empty space must be truly transparent.

**`strata-albedo-v1.png`:**
> Generate exactly one image. Seamless tileable texture, square, horizontally and vertically tileable, with opposite edges matching seamlessly. Front face of sedimentary sandstone strata seen straight on, like a cut geological model: horizontal layers of varying thickness in terracotta (#c47a55), ochre (#d4a375), cream (#e2c39a) and burnt sienna (#a9654a). Fine lamination lines inside each layer, small erosion pockets, subtle cross-bedding, a few embedded pebbles. Flat, even, shadowless lighting (albedo only, no cast shadows, no highlights). Matte, painterly but physically plausible, no text, no plants, no perspective. The texture fills the entire square edge to edge, with no border.

**`backdrop-city-v1.png`:** prompt de `PROMPTS-IMAGEGEN.md` §2, adaptado por Codex. El texto completo quedó en el registro de la sesión; los puntos que pide:
- 1536×1024 con cielo transparente;
- mesetas en terracota, ocre y crema, con bruma damasco;
- la ciudad en un valle, en gris violáceo frío;
- evitar cyberpunk, medieval, neón, personas, texto y logos.

**`explorer-sheet-v1.png`:**
> Generate exactly ONE image: a landscape 1536x1024 PNG character sheet with a genuinely TRANSPARENT background (preserve alpha). Use case: stylized-concept. Asset type: character sheet for a physics adventure game. Subject: a young, gender-neutral student explorer with a big round head and about 3-head body proportions, dark brown hair with a small tuft on top, brass goggles resting on the forehead, a deep teal coat with three brass buttons, a long saffron-yellow scarf, a leather satchel at the hip, a small round brass instrument on the character's left wrist, a leather belt with a brass buckle at the waist, cream trousers, and brown boots. Curious, attentive expression. Composition: a consistent turnaround showing four separate full-body views in order: front, three-quarter, side, back; plus one bust portrait. […] Style: soft cel-shaded illustration with clean dark outlines and warm light. Constraints: no logos, no text, no labels, no watermark, no background scenery, no ground plane, no opaque background, no checkerboard drawn into the image. All empty space must be truly transparent.

### Uso como referencia

- **Hoja de giro `explorer-sheet-v1.png` (iteración 06):** es la referencia del modelo 3D del explorador, que es procedural (`src/render/avatar.js`, D12). No se proyecta ni se usa como textura: sólo como guía de forma, proporción y color.
- **Texturas del pelo y de las colas de la bufanda:** se pintan por código en un canvas.

### Observaciones

- **Hoja del explorador:** tiene un halo cálido semitransparente alrededor de las figuras. En la Bitácora se recorta en un medallón sobre fondo petróleo, donde se lee como viñeta.
- **El telón no es interactivo:** es lejanía. La ciudad jugable (Hito B) se construirá con geometría.
- **Telón y modelo 3D:** el telón muestra arbustos y mesetas propias. Es coherente con la gramática D7, pero su detalle es mayor que el del diorama cercano. Queda pendiente equilibrar esa diferencia.
