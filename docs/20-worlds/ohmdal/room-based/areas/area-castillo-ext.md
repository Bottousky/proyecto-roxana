# Macroárea `area-castillo-ext` — Patio del Castillo de la Red

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
| ID | `area-castillo-ext` |
| Nombre | Patio del Castillo de la Red |
| RegionId | `castillo` |
| Capítulo(s) | Cap 2 |
| Sala(s) original(es) absorbida(s) | `castle_gate` + `castle_gallery` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 1920×1620 que reusa los assets pintados existentes de `castle_gate` y `castle_gallery` como paneles) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 1920 px |
| `height` | 1620 px (≈ 2×3 viewports) |
| `floor` | 0 |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -3000 |
| `y0` | -540 |
| Centro de área | (-2040, 270) |
| Region bbox | `castillo` ⊂ `[-3000, -1080] × [-2160, 1080]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `castle-gate` | (-2040, 270) | reja monumental al E (hacia la Plaza) |
| `castle-trunk-distributor` | (-2040, -1080) | tronco distribuidor visible al N (dentro del castillo) |
| `castle-network-heart-tower` | (-2040, -1350) | torre del Corazón, skyline al N |
| `cartel-chispa`, `cartel-caminos` | (perimetrales) | carteles históricos del Castillo (hidden en runtime) |

## Propósito

- **Recibir al protagonista** del Castillo (cuando entra al Cap 2).
- **Diálogo con la Consejera** (la Consejera espera al E del
  Patio).
- **Cruce de la cadena** (puzzle `chain`): regular las lámparas
  de la galería.
- **Trampolín al interior** (`area-castillo-int`): el jugador
  entra por la puerta del castillo (fachada norte).

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-plaza-cuenca` (E) | `walk` (doorway, reja) | cruzar la reja oeste de la Plaza | `puertaDone` |
| → `area-plaza-cuenca` (E) | `walk` (doorway, reja) | volver a la Plaza | siempre |
| → `area-castillo-int` (N) | `fade` (doorway) | entrar a la puerta del castillo | siempre |
| ← `area-castillo-int` (N) | `fade` (doorway) | salir del castillo | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport.
- **Encuadre autoral**: la cámara muestra la reja al E cuando el
  jugador entra; cuando avanza al N, encuadra la fachada del
  castillo con la torre al fondo.
- **Bounds**: `[x0, y0, width, height]`.
- **Perspective**: `distant` (explanada lejana).

## Walkable

- **Explanada exterior** (mitad sur): walkable amplio, donde
  ocurre el diálogo con la Consejera.
- **Galería** (mitad norte): walkable entre los pedestales de las
  lámparas.

## Blockers (colisiones)

- Reja perimetral (sólo se cruza por la abertura al E).
- Fachada del castillo (sólo se cruza por la puerta al N).
- Los pedestales de las lámparas (3 colisiones discretas).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `consejera-galeria` | (-1360, -205) | desde `metConsejera` | después de `castleRestored` |
| `edda-galeria` | (-1340, -140) | desde Cap 2 | nunca |
| Habitantes de fondo (2 NPCs) | rondan el Patio | desde Cap 2 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `puerta-castillo` | (-1735, -365) | entrar a `area-castillo-int` | baked |
| `lamparas-galeria` | (-1560, -1415) | puzzle `chain` (alias de `banco-cadena`) | baked; prompt "Regular las lámparas" |
| `cartel-chispa` | (-1493, -1278) | (hidden en runtime) | baked |
| `cartel-caminos` | (-1775, -1190) | (hidden en runtime) | baked |

## Estados (de la región `castillo`)

| Estado de región | Lectura observable |
|---|---|
| `DETERIORATED` | reja cerrada, niebla,Consejera en silencio, carteles opacos |
| `INTERVENTION` | reja abierta, Consejera habla, pero la red no se ha comprendido |
| `UNDERSTOOD` | `castleRestored`; las lámparas de la galería pulsan (efecto `pulse` con flag `solvedGalleryChain`), el cielo cambia de color |

## Cinematic hooks

- **Entrada**: doorway (sin cinemática especial).
- **Salida al interior**: fade 320 ms + audio de puertas pesadas.

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `castle-patio-s` | 1920×810 | la explanada (mitad sur) |
| `castle-patio-n` | 1920×810 | la galería (mitad norte) |

## Arte requerido

- Fondo 1920×1620 (o 2 paneles 1920×810 apilados).
- Props: reja, fachada del castillo, pedestales, lámparas, torre al fondo.

## Foreground

- Niebla en `DETERIORATED` (efecto `mist` con color del castillo).

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-plaza-cuenca` (E) | reja al E |
| `area-castillo-int` (N) | puerta del castillo |

## Validación

- Tests: puzzle `chain` debe seguir pasando.
- Gameplay QA: el camino `area-plaza-cuenca → area-castillo-ext →
  area-castillo-int` debe poder recorrerse tras `puertaDone`.
