# Macroárea `area-manantial` — Manantial de Ohm

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
| ID | `area-manantial` |
| Nombre | Manantial de Ohm |
| RegionId | `cuenca` |
| Capítulo(s) | Cap 1 (cierre emocional + Bitácora) |
| Sala(s) original(es) absorbida(s) | `manantial_ohm` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 1080×1620; el fondo actual cubre 960×540 del sub-área original) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 1080 px |
| `height` | 1620 px (3 viewports apilados) |
| `floor` | -1 (estanque a media altura) |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -480 |
| `y0` | -3240 |
| Centro de área | (60, -2430) |
| Region bbox | `cuenca` ⊂ `[-480, 1560] × [-3240, 540]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `manantial-estanque` | (60, -2430) | el estanque, foco de la Bitácora |
| `mirador-manantial` | (610, -2625) | punto elevado, vista al Lago lejano |
| `cauce-maestro` | (-80, -3015) | canal por donde sale el agua del Manantial |

## Propósito

- **Cierre emocional del Cap 1**: la Bitácora formaliza la
  observación del agua y la chispa.
- **Puzzle `bell`**: distribuir el agua entre los regímenes.
- **Ancla pedagógica**: el agua quieta + cables rotos = la
  primera visualización clara del sistema eléctrico.
- **Trampolín al Lago**: visible desde el mirador, en la
  distancia.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-calzada` (S) | `walk` (calzada) | bajar por la calzada | siempre |
| → `area-calzada` (S) | `walk` (calzada) | subir por la calzada | siempre |

> **Nota:** la salida al Lago NO es directa desde el Manantial. El
> jugador debe volver a la Plaza, ir a las Terrazas, descender al
> Lago. Esto preserva la estructura pedagógica del Arco I: el
> Manantial es el cierre de la Cuenca, no un atajo al Faro.

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport centrado.
- **Encuadre autoral**: cuando el jugador entra al Manantial, la
  cámara se eleva (zoom out 10%) para mostrar el estanque
  completo. Cuando está en el mirador, encuadra la línea de
  horizonte con el Lago a lo lejos.
- **Bounds**: `[x0, y0, width, height]`.
- **Perspective**: `distant` (escala lejana).

## Walkable

- **Plaza circular** (al sur): walkable amplio, donde se reúne el
  grupo.
- **Calzada diagonal al arco sureste**: walkable estrecho (3 m).
- **Mirador**: walkable elevado, al norte.

> Las medidas `m` son **provisionales** y se ajustan en el primer
> playthrough de GREYBOX. Ver `ARC1_SPATIAL_MAP.md` §1.4.

## Blockers (colisiones)

- Pozo central (la poza del Manantial).
- Rocas decorativas (no bloquean gameplay, sí visuales).
- Las murallas del mirador (sólo se cruza por el mirador mismo).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `edda-manantial` | (20, -2855) | desde Cap 1 | nunca |
| `ohm-manantial` | (110, -2820) | desde `ohmAwake` | nunca |
| `lumen-manantial` | (185, -2855) | desde Cap 1 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `cauce-maestro` | (-80, -3015) | (decorativo) | baked |
| `hito-proporciones` | (-10, -2955) | (decorativo, referencia de la Ley de Ohm) | baked |
| `mirador-manantial` | (610, -2625) | (cinemática interna: vista al Lago) | baked |

## Estados (de la región `cuenca`)

- En `UNDERSTOOD`, el agua del Manantial fluye visiblemente
  (efecto `water` con flag `puertaDone`).
- El ambiente sonoro cambia a `ohmdal-on`.

## Cinematic hooks

| Hook | Trigger | Contenido placeholder |
|---|---|---|
| `cinema.manantial-cierre` | (futuro, H3+) tras `bell` | banner + vista panorámica + audio |

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `manantial-calzada` | 1080×540 | la calzada de acceso (sur) |
| `manantial-estanque` | 1080×540 | el estanque |
| `manantial-mirador` | 1080×540 | el mirador (norte) |

## Arte requerido

- Fondo 1080×1620 (o 3 paneles 1080×540 apilados).
- Props: estanque, cauce, hito, mirador.
- Variante: `room-manantial` (existente en
  `assets/ohmdal/rooms/pilot-arco1/manantial_ohm+prop_boca_manantial-v2.png`).

## Foreground

- Niebla en `DETERIORATED` (efecto `mist`).
- Agua cayendo + chispas en `UNDERSTOOD`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-calzada` (S) | calzada empedrada a pie |

## Validación

- Tests: puzzle `bell` debe seguir pasando.
- Gameplay QA: la Bitácora abre `ley-de-ohm` tras la visita.
