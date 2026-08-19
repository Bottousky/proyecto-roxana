# Macroárea `area-forja-profunda` — Canal Largo y Nave de la Forja

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
| ID | `area-forja-profunda` |
| Nombre | Canal Largo y Nave de la Forja |
| RegionId | `forja` |
| Capítulo(s) | Cap 3 |
| Sala(s) original(es) absorbida(s) | `forge_longchannel` + `forge_hall` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 2520×1620; reusa assets pintados existentes como paneles) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 2520 px (≈ 2.6 viewports de ancho) |
| `height` | 1620 px (3 viewports) |
| `floor` | 0 |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -3000 |
| `y0` | 1080 |
| Centro de área | (-1740, 1890) |
| Region bbox | `forja` ⊂ `[-3000, -480] × [0, 2700]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `forge-hearth` | (-2280, 810) | hogar principal, foco del `forgeRestored` |
| `canal-doscientos-pasos` | (-2300, 1670) | canal largo (200 pasos) |
| `horno-lejano` | (-1490, 1800) | horno decorativo al fondo |
| `tablero-bus` | (-2540, 1465) | tablero de bus (alias `banco-forja-completa`) |

## Propósito

- **Calor del Canal Largo** (puzzle `longchannel`): regular la
  distribución a 200 pasos.
- **Configurar la red de la Forja** (puzzle `forge`): integrar
  los componentes.
- **Ancla pedagógica de Cap 3**: potencia, energía, calor,
  materiales, seguridad.
- **Hogar prendido** (estado `UNDERSTOOD`): el hogar se enciende
  con brasas visibles.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-forja-patio` (N) | `walk` (doorway) | volver al Patio | siempre |
| → `area-forja-patio` (N) | `walk` (doorway) | volver al Patio | siempre |

> Esta área **no tiene otras conexiones a pie**: es el final del
> corredor industrial. El jugador vuelve al Patio para salir de la
> Forja.

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 50% del viewport (área estrecha y larga, requiere
  menos lead).
- **Encuadre autoral**: la cámara encuadra el canal largo cuando
  el jugador está en el centro, y el hogar cuando llega al final.
- **Bounds**: `[x0, y0, width, height]`.

## Walkable

- **Canal Largo** (norte, 540 px): walkable estrecho entre
  murallas.
- **Nave** (centro, 540 px): walkable alrededor del hogar.
- **Plataforma del hogar** (sur, 540 px): walkable alrededor del
  hogar principal.

## Blockers (colisiones)

- El hogar (decorativo + colisión rectangular).
- El tablero de bus (interacción, no bloquea).
- Murallas del canal y de la nave (sólo se cruzan por la abertura
  al N).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `forjadora-canal-largo` | (-2280, 1370) | desde Cap 3 | después de `forgeRestored` |
| `edda-canal-largo` | (-2365, 1360) | desde Cap 3 | nunca |
| `ohm-canal-largo` | (-2445, 1350) | desde `ohmAwake` | nunca |
| `consejera-nave` | (-2210, 1410) | desde Cap 3 | nunca |
| `edda-nave` | (-2340, 1445) | desde Cap 3 | nunca |
| `lumen-nave` | (-2750, 1450) | desde Cap 3 | nunca |
| `ohm-nave` | (-2680, 1440) | desde `ohmAwake` | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `canal-doscientos-pasos` | (-2300, 1670) | puzzle `longchannel` (alias de `banco-canal-largo`) | baked; prompt "Regular el Canal Largo" |
| `horno-lejano` | (-1490, 1800) | (decorativo) | baked |
| `lumbre-forja` | (-2380, 1850) | (decorativo) | baked |
| `martillo-forja` | (-2540, 1925) | (decorativo) | baked |
| `fuelle-forja` | (-2680, 1860) | (decorativo) | baked |
| `tablero-bus` | (-2540, 1465) | puzzle `forge` (alias de `banco-forja-completa`) | baked; prompt "Configurar la red de la Forja" |

## Estados (de la región `forja`)

- En `UNDERSTOOD`, el hogar se enciende (efecto `sprite` con flag
  `forgeRestored` reemplazando `lumbre-forja` por
  `state-forge-hearth-on`).
- Brasas en el aire (efecto `embers`).
- Pulsos en 3 puntos del hogar.

## Cinematic hooks

- **Entrada**: doorway + leve fade.
- **Cinemática interna** (futuro, H3+): `cinema.forge-hearth-on`
  cuando se enciende el hogar.

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `forge-canal-largo` | 2520×540 | el canal largo (norte) |
| `forge-nave` | 2520×540 | la nave (centro) |
| `forge-hogar` | 2520×540 | el hogar principal (sur) |

## Arte requerido

- Fondo 2520×1620 (o 3 paneles 2520×540 apilados).
- Props: hogar, canal, horno, martillo, fuelle, tablero.

## Foreground

- Brasas (efecto `embers`).
- Humo.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-forja-patio` (N) | umbral del canal |

## Validación

- Tests: puzzles `longchannel` y `forge` deben seguir pasando.
- Gameplay QA: el ciclo `area-forja-patio → area-forja-profunda →
  area-forja-patio` debe poder recorrerse.
