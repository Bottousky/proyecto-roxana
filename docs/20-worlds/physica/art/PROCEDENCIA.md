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

### Prompts reportados por Codex

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
