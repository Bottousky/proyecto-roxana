# Macroárea `area-castillo-int` — Ramales y Corazón del Castillo

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Cap 2).

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-castillo-int` |
| Nombre | Ramales y Corazón del Castillo de la Red |
| RegionId | `castillo` |
| Capítulo(s) | Cap 2 |
| Sala(s) original(es) absorbida(s) | `castle_branches` + `castle_heart` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `PAINTED` (interior cerrado; reusa los fondos pintados existentes como paneles) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 960 px |
| `height` | 1620 px (3 viewports apilados) |
| `floor` | -1 (interior) |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -3000 |
| `y0` | -2160 |
| Centro de área | (-2520, -1350) |
| Region bbox | `castillo` ⊂ `[-3000, -1080] × [-2160, 1080]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `tronco-ramales` | (-2520, -1785) | tronco principal con ramales |
| `repartidor` | (-2520, -1775) | repartidor central del Corazón |
| `banco-repartidor` | (-2700, -1670) | banco de calibración (alias) |
| `consejera-corazon` | (-2310, -1670) | Consejera en el Corazón |

## Propósito

- **Resolver la distribución** (puzzle `branches`): reconfigurar
  los ramales.
- **Calibrar el repartidor** (puzzle `distributor`): resolver
  serie/paralelo.
- **Ancla pedagógica de Cap 2**: la red del Castillo se divide
  en barrios que aíslan fallas.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-castillo-ext` (S) | `fade` (doorway) | salir al Patio | siempre |
| → `area-castillo-ext` (S) | `fade` (doorway) | volver al Patio | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 50% del viewport.
- **Encuadre autoral**: la cámara muestra el tronco distribuidor
  en la zona norte (Ramales), y el repartidor en la zona sur
  (Corazón).
- **Bounds**: `[x0, y0, width, height]`.

## Walkable

- **Zona de Ramales** (norte): walkable amplio con el tronco
  central.
- **Zona del Corazón** (sur): walkable alrededor del repartidor.

## Blockers (colisiones)

- El tronco distribuidor (colisión rectangular).
- El repartidor central (colisión rectangular).
- Las murallas perimetrales (sólo se cruza por la puerta al S).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `consejera-corazon` | (-2310, -1670) | desde Cap 2 | después de `castleRestored` |
| `edda-corazon` | (-2300, -1625) | desde Cap 2 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `tronco-ramales` | (-2520, -1785) | puzzle `branches` (alias de `banco-ramales`) | baked; prompt "Reconfigurar los ramales" |
| `fusible-mayor` | (-2415, -1760) | (referencia visual) | baked |
| `bocas-ramales` | (-2610, -1755) | (referencia visual) | baked |
| `repartidor` | (-2520, -1775) | puzzle `distributor` (alias de `banco-repartidor`) | baked; prompt "Calibrar el repartidor" |
| `mosaico-corazon` | (-2520, -1625) | (referencia visual) | baked |

## Estados (de la región `castillo`)

- En `UNDERSTOOD`, los pulsos del Corazón se ven desde el exterior
  (efecto `pulse` con flag `castleRestored`).

## Cinematic hooks

- **Entrada**: fade 320 ms.
- **Salida**: fade 320 ms.

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `ramales` | 960×810 | zona de Ramales (norte) |
| `corazon` | 960×810 | zona del Corazón (sur) |

## Arte requerido

- Fondo 960×1620 (o 2 paneles 960×810 apilados).
- Props: tronco, fusible mayor, bocas, repartidor, mosaico.

## Foreground

- (decorativo) polvo en `DETERIORATED`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-castillo-ext` (S) | puerta del castillo |

## Validación

- Tests: puzzles `branches` y `distributor` deben seguir pasando.
- Gameplay QA: el camino `area-castillo-ext →
  area-castillo-int → area-castillo-ext` debe poder recorrerse.
