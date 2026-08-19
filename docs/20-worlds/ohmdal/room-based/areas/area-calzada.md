# Macroárea `area-calzada` — Calzada y Puerta de Ohm

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
| ID | `area-calzada` |
| Nombre | Calzada y Puerta de Ohm |
| RegionId | `cuenca` |
| Capítulo(s) | Cap 1 (transferencia) |
| Sala(s) original(es) absorbida(s) | `puerta` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 960×1620 o 3 paneles 960×540 apilados; el fondo 960×540 actual no cubre el área extendida) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 960 px |
| `height` | 1620 px (3 viewports apilados) |
| `floor` | 0 (parte baja), `+1` (balcón donde está la Puerta monumental) |
| Viewport lógico | 960 × 540 (el área equivale a 3 viewports verticales) |

## World position

| Campo | Valor |
|---|---|
| `x0` | -480 |
| `y0` | -1620 |
| Centro de área | (0, -810) |
| Region bbox | `cuenca` ⊂ `[-480, 1560] × [-3240, 540]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `puerta-de-ohm` | (0, -810) | la Puerta monumental, foco del Cap 1 |
| `calzada-inferior` | (0, -540) | arranque de la calzada empedrada (al sur) |
| `calzada-superior` | (0, -1080) | arranque de la calzada hacia el Manantial (al norte) |

## Propósito

- **Recibir la transferencia de la Puerta** (puzzle `puerta`): el
  protagonista debe decidir cómo regular el caudal.
- **Mostrar la Calzada**: la primera vez que el jugador ve una
  vía de comunicación que sale de Cuenca.
- **Ancla narrativa de la Ley de Ohm**: la Bitácora formaliza
  `ley-de-ohm` cuando la Puerta se abre.
- **Trampolín al Manantial**: cuando la Puerta se abre, el jugador
  puede continuar la calzada hacia arriba.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-plaza-cuenca` (S) | `cinematic` (doorway monumental) | cruzar la Puerta monumental al entrar | `ohmAwake` |
| → `area-plaza-cuenca` (S) | `cinematic` (doorway) | cruzar la Puerta monumental al volver | siempre |
| → `area-manantial` (N) | `walk` (calzada) | subir por la calzada empedrada | `puertaDone` |
| ← `area-manantial` (N) | `walk` (calzada) | bajar por la calzada | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 50% del viewport.
- **Encuadre autoral**: cuando el jugador está en la parte baja
  (cerca de la Plaza), la cámara encuadra la Puerta monumental
  completa al fondo. Cuando el jugador está arriba (cerca del
  Manantial), la cámara encuadra la calzada con el Portal al
  fondo lejano.
- **Bounds**: `[x0, y0, width, height]`.
- **Cinematic `puerta-apertura`**: pan vertical de 3-4 s, zoom
  out 10% en el momento de la apertura.

## Walkable

- **Plaza alta** (al sur, 540 px): walkable de 4 m de ancho por
  todo el ancho, con la Puerta monumental al fondo.
- **Calzada media** (540 px): walkable estrecho (3 m), entre
  murallas laterales.
- **Plaza del Manantial** (al norte, 540 px): walkable de 5 m de
  ancho, desemboca en la calzada hacia arriba.

> Las medidas `m` de los walkables son **provisionales** y
> describen el ancho aproximado del pasillo en **metros de
> mundo**. Se ajustan en el primer playthrough de GREYBOX. Ver
> `ARC1_SPATIAL_MAP.md` §1.4 (sin equivalencia px↔m física
> hasta playtesting).

## Blockers (colisiones)

- Murallas laterales de la calzada (sólo se cruza por la calzada
  misma o por el extremo sur, donde se conecta con la Plaza).
- La Puerta monumental cerrada: bloquea el paso sur↔norte
  hasta `puertaDone`.
- El mecanismo de la Puerta (visual + colisión).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `edda-puerta` | (180, -600) | desde `ohmAwake` | nunca |
| `lumen-puerta` | (240, -540) | desde `ohmAwake` | nunca |
| Habitantes de fondo | rondan la plaza alta | desde Cap 1 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `lapuerta` | (0, -945) | puzzle `puerta` | baked (parte del fondo) |
| `calzada-empedrada` | (0, -1080) | (decorativo, hint de Manantial) | baked |
| `plaza-alta` | (0, -540) | (decorativo) | baked |

## Estados (de la región `cuenca`)

| Estado de región | Lectura observable en la Calzada |
|---|---|
| `DETERIORATED` | Puerta cerrada, mecanismo frío, calzada reseca |
| `INTERVENTION` | jugadores llegan con Lumen y Edda, la Puerta sigue cerrada |
| `UNDERSTOOD` | `puertaDone`; Puerta abierta, calzada fluye, agua visible |

## Cinematic hooks

| Hook | Trigger | Contenido placeholder |
|---|---|---|
| `cinema.puerta-apertura` | primera vez que se cruza la Puerta al norte, post-`puertaDone` | pan vertical + campana suena + audio de agua |

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `puerta-alta` | 960×540 | la Puerta monumental y la plaza alta |
| `calzada-media` | 960×540 | la calzada empedrada |
| `plaza-baja` | 960×540 | la plaza del Manantial (parte de la transición) |

## Arte requerido

- Fondo 960×1620 (o 3 paneles 960×540 apilados).
- Props: la Puerta monumental con sus dos hojas, el mecanismo
  visible, el arco de la calzada.
- **Variantes de la Puerta**: `room-puerta-closed` (estado
  inicial) y `room-puerta-open` (cuando `puertaDone`).

## Foreground

- Polvo en suspensión en `DETERIORATED`.
- Agua cayendo en `UNDERSTOOD`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-plaza-cuenca` (S) | doorway monumental + cinemática `puerta-apertura` |
| `area-manantial` (N) | calzada empedrada a pie |

## Validación

- Tests: puzzle `puerta` debe seguir pasando
  (`m21-puerta-model.test.ts`).
- Gameplay QA: la transición `area-plaza-cuenca → area-calzada →
  area-manantial` debe poder recorrerse tras `puertaDone`.
