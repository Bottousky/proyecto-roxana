# Presupuestos iniciales

Los valores son objetivos; medir en hardware real antes de afirmar rendimiento.

| Métrica | Mobile | Desktop |
|---|---:|---:|
| FPS sostenido | 45–60; piso 30 | 60 |
| Pixel ratio | ≤ 1,5 | ≤ 2 |
| Draw calls visibles | < 150 | < 250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Textura común | 512–1024 | 1024 |
| Textura hero | 1024 | 2048 |
| Luces con sombra | 0–1 | 1 principal |

## Reglas

- Medir `renderer.info.render` y `renderer.info.memory`.
- Instanciar repetidos y compartir geometrías/materiales.
- Segmentar por zona y cargar bajo demanda.
- Usar colliders primitivos.
- Liberar geometrías, materiales, texturas y render targets al desmontar.
- Evaluar Draco, Meshopt o KTX2 con una comparación reproducible; no apilar compresores.
- Registrar peso transferido y los cinco assets principales.
