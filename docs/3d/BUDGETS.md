# Presupuestos 3D

## Objetivos iniciales

| Métrica | Mobile objetivo | Desktop objetivo |
|---|---:|---:|
| FPS sostenido | 45–60; piso 30 | 60 |
| Pixel ratio | máximo 1,5 | máximo 2 |
| Draw calls visibles | < 150 | < 250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Textura común | 512–1024 | 1024 |
| Textura hero | 1024 | 2048 |
| Luces con sombras | 0–1 | 1 principal |

## Baseline preservado

Datos de `artifacts/performance/asset-report.json`, generados el 27 de julio de 2026:

| Asset | MiB | Triángulos | Primitivas | Materiales | Texturas |
|---|---:|---:|---:|---:|---:|
| `school-overview.glb` | 1,673 | 248.488 | 40 | 1 | 0 |
| `electronics-room.glb` | 0,435 | 54.892 | 14 | 1 | 0 |

El overview usa Draco y reduce 81,3 % frente al original. Las métricas de runtime preservadas
reportan 35–58 draw calls y techo de 60 FPS en Chromium automatizado. No equivalen a una prueba
en GPU mobile física.

## Reglas

- Medir antes y después de optimizar.
- Separar peso transferido de memoria estimada.
- Registrar los cinco assets más pesados.
- Usar LOD o segmentación si un hero/edificio domina la escena.
- No añadir Meshopt, KTX2 o una segunda estrategia de compresión sin evidencia reproducible.
- Liberar recursos al desmontar un runtime o cambiar de laboratorio.
