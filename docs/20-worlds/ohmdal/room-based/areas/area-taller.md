# Macroárea `area-taller` — Taller de Lumen

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Cap 1).

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-taller` |
| Nombre | Taller de Lumen |
| RegionId | `cuenca` |
| Capítulo(s) | Cap 1 |
| Sala(s) original(es) absorbida(s) | `taller` |
| `currentRenderMode` (H2-H7) | `PAINTED` (reutiliza el fondo 960×540 existente sin cambios) |
| `targetArtMode` (H8+) | `PAINTED` (interior cerrado; sin repintar salvo pase de arte general) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 960 px |
| `height` | 540 px |
| `floor` | -1 (interior) |
| Viewport lógico | 960 × 540 (1:1 con el área) |

## World position

| Campo | Valor |
|---|---|
| `x0` | 960 |
| `y0` | 0 |
| Centro de área | (1440, 270) |
| Region bbox | `cuenca` ⊂ `[-480, 1560] × [-3240, 540]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `lumen-workbench` | (1440, 0) | banco central de Lumen |
| `taller-facade` (interior) | (960, 270) | pared oeste, donde se conecta con la Plaza |

## Propósito

- **Introducir a Lumen**: el primer Mentor del protagonista.
- **Diagnóstico del banco** (puzzle `freno`): identificar el módulo
  fallado.
- **Pedir prestado el instrumental** para abrir la Puerta de Ohm.
- **Ancla del verbo nuclear CONECTAR**: el jugador pasa de
  "mirar" a "tocar cables".

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| → `area-plaza-cuenca` | `fade` (doorway) | salir por la puerta oeste | siempre disponible |
| ← `area-plaza-cuenca` | `fade` (doorway) | entrar desde la Plaza | siempre disponible |

## Cámara

- **Viewport**: 960×540 (idéntico al área).
- **Dead zone**: 50% del viewport centrado.
- **Encuadre autoral**: la cámara se acerca un 5% cuando el
  jugador está cerca del banco, para enmarcar el diálogo.
- **Bounds**: `[x0, y0, width, height]`.
- **Perspective**: `interior` (escala uniforme).

## Walkable

- Aproximadamente el 75% del área está cubierta por walkable
  (igual que en el baseline `taller`).
- El banco de Lumen divide la zona; hay pasillos laterales.
- Los estantes y el generador son sólidos (colisión manual).

## Blockers (colisiones)

- Mesa de Lumen (baked).
- Estantes (baked).
- Generador (baked).
- La pared este (sin puerta) y la pared norte/sur.

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `lumen` | (1640, 320) | desde Prólogo | nunca |
| `edda-taller` | (1620, 420) | desde Prólogo (sigue a Lumen en algunos momentos) | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `banco` | (1285, 280) | puzzle `freno` | baked (parte del fondo) |
| `estantes` | (1210, 135) | (decorativo, sin interacción) | baked |
| `estantes-derecha` | (1785, 135) | (decorativo) | baked |
| `generador-taller` | (1715, 270) | (decorativo) | baked |
| `lumen` | (1640, 320) | diálogo Lumen | character rig |
| `edda-taller` | (1620, 420) | diálogo Edda | character rig |

## Estados (de la región `cuenca`)

- Esta área refleja el estado de `cuenca` indirectamente: cuando
  la región pasa a `UNDERSTOOD`, las luces del Taller también se
  prenden (feedback visual secundario).
- En `DETERIORATED` el Taller tiene polvo visible y la
  iluminación es baja. En `UNDERSTOOD` se enciende una lámpara
  sobre el banco.

## Cinematic hooks

- **Entrada**: fade 220 ms.
- **Salida**: fade 220 ms.
- **Cinemática interna** (futuro, H3+): `cinema.lumen-diagnosis`
  cuando el banco se energiza por primera vez.

## Technical Chunks

- Un solo TC (`taller-1`, 960×540). No requiere partición.

## Arte requerido

- Fondo 960×540 (existente en `assets/ohmdal/rooms/pilot-arco1/taller+props_lumen-v2.png`).
- Props baked: banco, estantes, generador.
- Lightmap: luz cálida sobre el banco, penumbra en los bordes.

## Foreground

- (Opcional) polvos en suspensión cuando la región está en
  `DETERIORATED`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-plaza-cuenca` (O) | doorway + fade 220 ms |

## Validación

- Tests: el puzzle `freno` debe seguir pasando
  (`f2-warmth.test.ts`, `m20-freno-model.test.ts`).
- Gameplay QA: el camino `area-plaza-cuenca → area-taller →
  area-plaza-cuenca` debe poder recorrerse sin problemas.
