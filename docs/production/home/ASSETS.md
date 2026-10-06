# Manifiesto de assets de la home

| Asset | Fuente | Autor / licencia | Archivo editable | Notas |
|---|---|---|---|---|
| Arquitectura del Instituto | código, `src/escuela/school.js` + `kit.js` | proyecto | el propio código | facetas, UV de mundo, color de vértice |
| Campiña, camino, arboledas | código, `src/escuela/landscape.js` (ciclo 1) | proyecto | el propio código | terreno polar 34×256, árboles cruzados fusionados por sprite |
| Artefactos de los talleres | código, `src/escuela/artifacts.js` (ciclo 2) | proyecto | el propio código | Faro, columna, chip y lente, caballete |
| Texturas vivas del chip y del caballete | canvas, `drawChip` / `drawYard` en `diorama.js` | proyecto | el propio código | 256² y 512×320, ~15 fps, en reposo con movimiento reducido |
| Estatua de Roxana | `public/escuela/modelos/roxana-estatua.glb` | Meshy (generada antes de este loop; ver commit 4072fec) | GLB (sólo geometría) | `statue.js` agrega normales, UV, mármol |
| Granos de material | `public/assets/materials.webp` | heredado del juego Ohmdal (`docs/assets.md`) | — | reducido a luminancia |
| Árboles (sprites) | `public/assets/trees.webp` | heredado del juego Ohmdal (`docs/assets.md`) | — | chroma key magenta |
| Pasto | `public/assets/art-polish/meadow.webp` | heredado (`docs/assets.md`) | — | |
| Fuentes | Cormorant Garamond, Inter | OFL (`public/fonts/*-LICENSE.txt`) | — | locales, sin CDN |

No se usaron servicios pagos ni generadores externos en este loop.
