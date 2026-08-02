# Spec de producción — atlas A/B del estudiante

## Invariantes

- Celda: 48×64 px; pivote de pies `(24, 60)` con origen arriba-izquierda.
- Cuerpo: 1,72 m; collider runtime: cápsula de radio 0,28 m y altura 1,72 m.
- Un único atlas activo, misma sombra de contacto, escala CSS, seed, recorrido y cámara.
- Atlas 4: 960×256 px, filas `N,E,S,W`.
- Atlas 8: 960×512 px, filas `N,NE,E,SE,S,SW,W,NW`.

## Layout de veinte columnas por fila

| Columnas | Acción | Frames | Duración |
|---|---|---:|---:|
| 0–1 | `idle` | 2 | 300 ms |
| 2–7 | `walk` | 6 | 100 ms |
| 8–11 | `turn_135` | 4 | 100 ms |
| 12–15 | `inspect_lumen` | 4 | 125 ms |
| 16–19 | `measure` | 4 | 125 ms |

## Cuantización determinista

El heading usa `0° = +Z` y crece en sentido horario. Primero se normaliza a `[0,360)`. Cada
sector es semiabierto `[inicio, fin)`: un valor exactamente en el límite pertenece al sector que
comienza allí, es decir, gana la dirección siguiente en sentido horario. `N` envuelve 360°.

- Cuatro: `N=[315,360)∪[0,45)`, `E=[45,135)`, `S=[135,225)`, `W=[225,315)`.
- Ocho: `N=[337.5,360)∪[0,22.5)`, `NE=[22.5,67.5)`, `E=[67.5,112.5)`,
  `SE=[112.5,157.5)`, `S=[157.5,202.5)`, `SW=[202.5,247.5)`,
  `W=[247.5,292.5)`, `NW=[292.5,337.5)`.

Los SVG son prototipos vectoriales de inspección, con bordes duros y layout de atlas real. La
integración podrá rasterizarlos mediante un proceso reproducible; no son atlas finales.
