# Manifiesto de assets de la home

| Asset | Fuente | Autor / licencia | Archivo editable | Notas |
|---|---|---|---|---|
| Arquitectura del Instituto | código, `src/escuela/school.js` + `kit.js` | proyecto | el propio código | facetas, UV de mundo, color de vértice |
| Campiña, camino, arboledas | código, `src/escuela/landscape.js` (ciclo 1) | proyecto | el propio código | terreno polar 34×256, árboles cruzados fusionados por sprite |
| Artefactos de los talleres | código, `src/escuela/artifacts.js` (ciclo 2) | proyecto | el propio código | Faro, columna, chip y lente, caballete |
| Remates de techo por taller | código, `roofAccent` en `school.js` (ciclo 5) | proyecto | el propio código | pararrayos con bombilla (Ω), anemómetro (Φ), lucernario cian y mástil (λ), sólido de tiza en anillo (∑) |
| Mapa del taller (Ohmdal) | canvas `drawOhmdalMap` + miniaturas de `assets/art-polish/map-landmarks.webp` (carga diferida al abrir el taller) | proyecto (ver `docs/ART-POLISH.md`) | el código + el atlas | 9 celdas del atlas en el orden de `AREA_IDS` |
| Alfombra del taller | `assets/art-polish/workshop-rug.webp` (carga diferida) | proyecto (`docs/ART-POLISH.md`, prompt en `art-polish-rug-prompt.json`) | el original | |
| Cartelera de novedades | código, `buildNoticeBoard` en `artifacts.js` + `drawNotices` en `diorama.js` (ciclo 4) | proyecto | el propio código | corcho dibujado desde `novedades.json`; farolito = no leído real |
| Texturas vivas del chip y del caballete | canvas, `drawChip` / `drawYard` en `diorama.js` | proyecto | el propio código | 256² y 512×320, ~15 fps, en reposo con movimiento reducido |
| Imagen fija del campus (primer pintado y versión ligera) | `public/escuela/campus-tarde.jpg` (1600×1000) y `campus-tarde-vertical.jpg` (860×1800), renderizadas desde el campus real | proyecto | `node scripts/home-shots.mjs poster@0/tarde public/escuela` (`NAME`, `W`, `H`) | no es una imagen pintada: se regenera cuando cambie el campus |
| Estandarte de Ohmdal (copia) | `public/escuela/estandarte-ohmdal.jpg`, reducción de `assets/art-polish/kingdom-banner.webp` (ver `docs/assets.md`) | heredado | el original | 828×552, al tamaño en que se dibuja |
| Estatua de Roxana | `public/escuela/modelos/roxana-estatua.glb` | Meshy (generada antes de este loop; ver commit 4072fec) | GLB (sólo geometría) | `statue.js` agrega normales, UV, mármol |
| Granos de material | `public/assets/materials.webp` | heredado del juego Ohmdal (`docs/assets.md`) | — | reducido a luminancia |
| Árboles (sprites) | `public/assets/trees.webp` | heredado del juego Ohmdal (`docs/assets.md`) | — | chroma key magenta |
| Pasto | `public/assets/art-polish/meadow.webp` | heredado (`docs/assets.md`) | — | |
| Fuentes | Cormorant Garamond, Inter | OFL (`public/fonts/*-LICENSE.txt`) | — | locales, sin CDN |

No se usaron servicios pagos ni generadores externos en este loop.
