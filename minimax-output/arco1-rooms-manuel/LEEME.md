# Prompts de salas — Ohmdal Arco I

Guardá **todo** acá, con estos nombres exactos:

```
C:\YO\Proyectos\Roxana\minimax-output\arco1-rooms-manuel\
```

No pises `assets/ohmdal/`. Cuando termines, avisame: cableo cada PNG a su
`width`/`height` local (como la Plaza) y dejo el pedestal de Ohm en `(960, 640)`.

## Contrato (esto es lo que estaba mal)

El viewport del juego es **960×540**. Eso es la ventana, no el mapa.

Cada sala tiene **su propio lienzo**. 1 px del PNG = 1 px de coordenadas
de juego. La cámara panea dentro de la room, igual que en Pokémon:
pueblo grande, ruta alta, casa de una pantalla, cueva ancha.

**No** generes todo en 16:9 ni asumas que después lo bajamos a 960×540.
Eso aplastaba calzadas, naves y terrazas a una pantalla de TV.

## Tamaño nativo por sala

| Archivo | Lienzo | Forma (por qué) |
|---|---|---|
| `plaza-1920-base.png` | **1920×1080** | Hub 2×2. Pedestal en `(960, 640)`. |
| `plaza-castillo-abierto.png` | **1920×1080** | Misma planta; arco oeste abierto. |
| `taller_base.png` | **960×540** | Interior de una pantalla (casa Pokémon). |
| `puerta_base.png` | **960×1620** | Calzada N–S, 3 pantallas de alto. |
| `puerta_open.png` | **960×1620** | Misma planta; hojas abiertas. |
| `manantial_ohm_base.png` | **1080×1620** | Manantial icónico, vertical. |
| `castle_gate_base.png` | **1920×1080** | Patio de distribución, ancho. |
| `castle_gallery_base.png` | **960×1080** | Nave N–S, 2 pantallas de alto. |
| `castle_branches_base.png` | **960×1080** | Isla del tronco, se rodea. |
| `castle_heart_base.png` | **960×1080** | Cámara del repartidor. |
| `forge_yard_base.png` | **1920×1080** | Patio industrial ancho. |
| `forge_infirmary_base.png` | **1440×540** | Corredor E–O de protección. |
| `forge_longchannel_base.png` | **2400×540** | Canal largo; el más horizontal. |
| `forge_hall_base.png` | **1920×1080** | Nave con 3 máquinas-isla. |
| `terraces_top_base.png` | **960×1080** | Un escalón de ladera, mira al sur. |
| `terraces_mid_base.png` | **960×1080** | Reparto injusto, dos bancales. |
| `terraces_mural_base.png` | **960×1080** | Mural + Piedra Única. |
| `terraces_aqueduct_base.png` | **1440×1080** | Tres canales + boca al lago (este). |
| `lighthouse_hall_base.png` | **1920×1080** | Orilla del lago. |
| `lighthouse_bench_base.png` | **960×540** | Taller íntimo del Farero. |
| `clock_tower_base.png` | **960×1620** | Torre: cara enorme arriba, piso abajo. |
| `lighthouse_lantern_base.png` | **1920×1080** | Balcón + lago a la derecha. |

Variantes `plaza-castillo-abierto` y `puerta_open`: **misma cámara y misma planta**; solo cambia el vano.

No hace falta hogar/lente/muelle/barca: siguen los overlays.

## Cómo generar

- PNG, **tamaño exacto de la tabla**. No estires a 16:9.
- Si la herramienta no deja ese tamaño: generá más grande **conservando el ratio** (p. ej. Puerta 960×1620 → 1280×2160) y recortá al ratio. No rellenes 16:9 con cielo de más.
- RPG 16-bit (SNES/GBA), cenital 3/4, tile ~48 px. No HD-2D, no concept art.
- Ohmdal detenido, no roto. Seis materias: piedra, cobre oxidado, agua quieta, cerámica, madera de oficio, vidrio de instrumento.
- Tarde. Lámparas apagadas. Cobre sin glow. Sin personas, texto, UI, watermark.
- Piso libre para caminar.
- **No uses** las imágenes viejas ni las v4 como referencia.

Prompts: `prompts/<n>-*.txt`. Bloque `FULL:` para cualquier UI; `MMX:` si el CLI corta a 1499 caracteres.
