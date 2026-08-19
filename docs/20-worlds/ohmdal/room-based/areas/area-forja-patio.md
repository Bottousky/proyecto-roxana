# Macroárea `area-forja-patio` — Patio y Enfermería de la Forja

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Cap 3).

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-forja-patio` |
| Nombre | Patio y Enfermería de la Forja |
| RegionId | `forja` |
| Capítulo(s) | Cap 3 |
| Sala(s) original(es) absorbida(s) | `forge_yard` + `forge_infirmary` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 2520×1080; reusa assets pintados de `forge_yard` y `forge_infirmary` como paneles) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 2520 px (≈ 2.6 viewports de ancho) |
| `height` | 1080 px (2 viewports) |
| `floor` | 0 |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -3000 |
| `y0` | 0 |
| Centro de área | (-1740, 540) |
| Region bbox | `forja` ⊂ `[-3000, -480] × [0, 2700]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `forge-stack` | (-2400, 540) | chimeneas de la Forja |
| `forge-trunk-junction` | (-1500, 1080) | tronco principal de distribución |
| `martillos-patio` | (-2285, 715) | martillos de trabajo (decorativo) |

## Propósito

- **Llegada del protagonista** a la Forja (cuando entra al Cap 3).
- **Diálogo con Yesca** (la Forjadora espera aquí).
- **Resolver el timbre** (puzzle `timbre`): primera observación
  de potencia.
- **Calor del Patio** (puzzle `warmth`): regular el canal tibio.
- **Fusibles de la Enfermería** (puzzle `infirmary`): mantener la
  red segura.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-plaza-cuenca` (NE) | `walk` (doorway, arco) | subir por el arco NE | `castleRestored` |
| → `area-plaza-cuenca` (NE) | `walk` (doorway) | volver a la Plaza | siempre |
| → `area-forja-profunda` (S) | `walk` (doorway) | cruzar el umbral del canal largo | siempre |
| ← `area-forja-profunda` (S) | `walk` (doorway) | volver del canal | siempre |
| → `area-terrazas` (E) | `walk` (doorway) | descender por la pendiente este | `forgeRestored` |
| ← `area-terrazas` (E) | `walk` (doorway) | volver a las Terrazas | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport.
- **Encuadre autoral**: al entrar, la cámara encuadra las
  chimeneas al O. Cuando el jugador camina al S, encuadra el
  tronco de distribución.
- **Bounds**: `[x0, y0, width, height]`.
- **Perspective**: `distant` (explanada lejana).

## Walkable

- **Patio** (mitad O): walkable amplio, donde Yesca recibe al
  protagonista.
- **Enfermería** (mitad E): walkable alrededor de la pared de
  fusibles.

## Blockers (colisiones)

- Las chimeneas de la Forja (decorativas).
- El portón de la Forja (sólo se cruza por la abertura al S).
- La pared de fusibles (sólo se interactúa con ella).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `edda-patio-forja` | (-2350, 480) | desde `metForjadora` | nunca |
| `lumen-patio-forja` | (-2440, 470) | desde Cap 3 | nunca |
| `ohm-patio-forja` | (-2510, 460) | desde `ohmAwake` | nunca |
| `forjadora-enfermeria` | (-2375, 645) | desde `metForjadora` | después de `forgeRestored` |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `martillos-patio` | (-2285, 715) | (decorativo) | baked |
| `canal-tibio-patio` | (-2745, 705) | puzzle `warmth` (alias de `banco-canal-tibio`) | baked; prompt "Regular el canal tibio" |
| `pared-fusibles` | (-2845, 920) | puzzle `infirmary` (alias de `banco-enfermeria`) | baked; prompt "Revisar los fusibles" |

## Estados (de la región `forja`)

| Estado de región | Lectura observable |
|---|---|
| `DETERIORATED` | frío, sin producción, Yesca en quietud |
| `INTERVENTION` | Yesca trabaja, pero la red no se ha comprendido |
| `UNDERSTOOD` | `forgeRestored`; brasas en el Patio (efecto `embers`), pulso de hogar |

## Cinematic hooks

- **Entrada**: doorway (sin cinemática especial).
- **Salida al canal largo**: doorway + leve fade.

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `forge-yard` | 1260×1080 | el Patio |
| `forge-enfermeria` | 1260×1080 | la Enfermería |

## Arte requerido

- Fondo 2520×1080 (o 2 paneles 1260×1080 lado a lado).
- Props: chimeneas, martillos, canal, pared de fusibles, portón.

## Foreground

- Brasas en `UNDERSTOOD` (efecto `embers`).
- Humo tenue en `DETERIORATED`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-plaza-cuenca` (NE) | arco al NE |
| `area-forja-profunda` (S) | umbral del canal |
| `area-terrazas` (E) | pendiente este |

## Validación

- Tests: puzzles `timbre`, `warmth`, `infirmary` deben seguir pasando.
- Gameplay QA: el camino `area-plaza-cuenca → area-forja-patio →
  area-forja-profunda` debe poder recorrerse tras `castleRestored`.
