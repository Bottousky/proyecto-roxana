# Reporte de assets de la escuela

| Archivo | MiB | Triángulos | Draw calls estimados | Materiales | Texturas |
|---|---:|---:|---:|---:|---:|
| school-overview.original.glb | 8.947 | 248488 | 40 | 1 | 0 |
| school-overview.glb | 1.673 | 248488 | 40 | 1 | 0 |
| electronics-room.original.glb | 2.147 | 54892 | 14 | 1 | 0 |
| electronics-room.glb | 0.435 | 54892 | 14 | 1 | 0 |

- Overview Draco: 81.3 % de reducción.
- Electrónica Draco: 79.7 % de reducción.
- Iluminación: vertex colors horneados; el runtime no carga mapas de luz.
- KTX2: no aplica en este vertical slice porque el GLB no contiene texturas raster.

