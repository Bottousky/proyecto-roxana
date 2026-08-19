# Macroárea `area-plaza-cuenca` — Plaza de Cuenca de Ohm

> ⚠ **`ADR-002` (2026-08-18):** las secciones "World position" / `x0/y0` /
> "Continuidad con vecinos" de esta ficha son **contexto esquemático**. El
> runtime es **room-based**: esta área vive en coordenadas **locales**
> `[0, width) × [0, height)` y sus conexiones son aristas del room graph
> (`SPATIAL_CONTRACT.md`). No se reposicionan rooms por el tamaño de otras.
> Las dimensiones **locales** de la Plaza (1920×1080) son el dato de
> runtime; `x0/y0` no lo son.

> **Estado:** `CANON` (ratificado por `ADR-001`).
> **Generado:** 2026-08-17.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `ohmdal-arc-01_v1.md` (Prólogo + Cap 1),
> `ohmdal-world-structure_v1.md`.

---

## Identidad

| Campo | Valor |
|---|---|
| ID | `area-plaza-cuenca` |
| Nombre | Plaza de Cuenca de Ohm |
| RegionId | `cuenca` |
| Capítulo(s) | Prólogo, Cap 1 (entrada) |
| Sala(s) original(es) absorbida(s) | `plaza` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo + props spawneados) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 1920 px |
| `height` | 1080 px |
| `floor` | 0 (un solo piso) |
| Viewport lógico | 960 × 540 (≈ 2× viewports de ancho, 2× de alto) |

## World position

| Campo | Valor |
|---|---|
| `x0` (esquina sup. izq.) | -480 |
| `y0` (esquina sup. izq.) | -540 |
| Centro de área | (480, 0) |
| Region bbox | `cuenca` ⊂ `[-480, 1560] × [-3240, 540]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `portal-omega` | (480, 540) | monolito al sur, foco de la cinemática de llegada |
| `plaza-monument` | (480, 0) | campana apagada sobre pedestal de Ohm |
| `ohm-pedestal` | (480, 90) | pedestal (inanimado hasta el despertar) |
| `lumen-workshop-facade` | (960, 270) | fachada este del Taller |

## Propósito

- **Llegada del protagonista** desde el Instituto (cinemática
  `cinema.portal-arrival`, 5–7 s).
- **Plaza pública**: campana, pedestal, lámparas, fuente.
- **Reunión con Edda** (primera vez): "La pregunta vuelve".
- **Despertar de Ohm** (WOW moment): puzzle `despertar`, luego
  cinemática `playAwakening` reencarnada como `cinema.awakening`.
- **Hub de navegación**: el jugador sale de la Plaza hacia el
  Taller, la Calzada, el Castillo, la Forja o las Terrazas.
- **Ancla narrativa del Arco I**: cada vez que el jugador vuelve,
  la Plaza refleja el estado de `cuenca`.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| → `area-taller` | `fade` (doorway) | entrar a la puerta este | siempre disponible |
| → `area-calzada` | `cinematic` (doorway monumental) | cruzar la puerta norte | `ohmAwake` |
| → `area-castillo-ext` | `walk` (doorway) | cruzar la reja oeste | `puertaDone` |
| → `area-forja-patio` | `walk` (doorway) | bajar por el arco sudoeste | `castleRestored` |
| → `area-terrazas` | `walk` (doorway) | bajar por el arco sur | `forgeRestored` |
| ← `area-faro` (back) | `walk` (cinemática ligera de skyline) | volver desde el Faro (revisita) | nunca |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport centrado.
- **Encuadre autoral**: la Plaza se ve con la campana en el centro
  del frame cuando el jugador está quieto. Cuando el jugador camina
  al sur (hacia el Portal), la cámara lo sigue con un lead de 30 px.
- **Bounds**: `[x0, y0, width, height]` = `[-480, -540, 1920, 1080]`.
- **Cinemática `awakening`**: zoom in al pedestal (5% durante
  380 ms, vuelta en 540 ms) + flash dorado + chispas.
- **Cinemática `portal-arrival`**: pan S→N de 5–7 s al entrar.

## Walkable (descripción)

> El walkable exacto se reescribe para 1920×1080 partiendo del
> walkable actual de `plaza` (en `roomScenesData.ts`). En GREYBOX
> el walkable se renderiza como un polígono verde con etiqueta
> `WALKABLE`. Aproximación por zona:

- **Atrio central**: 60% del área, alrededor del monumento.
- **Atrio del Portal** (al sur): una franja de 6 m de ancho por
  todo el ancho del área.
- **Atrio del Taller** (al este): una franja de 4 m de ancho
  pegada a la fachada este.
- **Calle al Castillo** (al oeste): 4 m de ancho, sale por la reja
  oeste.
- **Calle a Forja** (al sudoeste): 3 m de ancho, sale por el
  arco SO.
- **Calle a Terrazas** (al sur): 4 m de ancho, sale por el arco S.
- **Calle a la Calzada** (al norte): 4 m de ancho, sale por la
  Puerta monumental.

> Las medidas `m` son **provisionales** y se ajustan en el primer
> playthrough de GREYBOX. Ver `ARC1_SPATIAL_MAP.md` §1.4 (sin
> equivalencia px↔m física hasta playtesting).

## Blockers (colisiones)

- El monumento (campana + pedestal): bloquea la zona central con
  pasillos laterales (igual que en el baseline).
- La fachada del Taller: bloquea el acceso al este, salvo por la
  puerta del Taller.
- La fachada de la Puerta monumental: bloquea el norte, salvo
  por la abertura (cuando no hay lock).
- Las murallas perimetrales: bloquean el acceso fuera del área.

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `edda` | cerca del monumento | desde el Prólogo | nunca (sigue al jugador) |
| `ohm` (companion) | sigue al jugador | desde `ohmAwake` | nunca |
| `lumen` (visita) | fachada del Taller | desde `metLumen` | nunca |
| Habitantes de fondo (2-3 NPCs) | rondan la Plaza | desde Prólogo | nunca (circulan) |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `pedestal` | (480, 90) | puzzle `despertar` | en GREYBOX: cubo rojo con etiqueta `PEDESTAL` |
| `campana` | (480, 0) | diálogo inicial de Edda | baked (parte del fondo) |
| `portal-aula` | (180, 382) | volver al Instituto | baked; sólo en PAINTED |
| `lampara1`, `lampara2` | (290, 350), (672, 340) | hot interactivo (futuro) | baked |
| `fountain` (futuro) | (480, 350) | (placeholder) | GREYBOX: cubo azul con etiqueta `FUENTE` |

## Estados (de la región `cuenca`)

| Estado de región | Lectura observable en la Plaza |
|---|---|
| `DETERIORATED` | Portal apagado, cables sucios, sin agua, Plaza con penumbra |
| `INTERVENTION` | el jugador llegó al Taller, Lumen ya está, Plaza mantiene penumbra |
| `UNDERSTOOD` | `puertaDone` + `ohmAwake`; Plaza iluminada, campana suena, fuente fluye, banda sonora `ohmdal-on` |

## Cinematic hooks (placeholders para esta fase)

| Hook | Trigger | Contenido placeholder |
|---|---|---|
| `cinema.portal-arrival` | primera entrada desde el Instituto | texto en pantalla + pan S→N + audio ambiente |
| `cinema.awakening` | `despertar` completado | flash + chispas + zoom (reencarna `playAwakening`) |
| `cinema.puerta-apertura` (eco) | `puertaDone` | banner + campana suena + audio de puerta |

## Technical Chunks (propuesta)

| TC | Tamaño | Notas |
|---|---|---|
| `plaza-n` | 960×540 | norte (Puerta monumental + calle a Calzada) |
| `plaza-c` | 960×540 | centro (monumento + fachada del Taller) |
| `plaza-s` | 960×540 | sur (Portal + calles a Forja y Terrazas) |

> Los TCs se cargan en proximidad; no son perceptibles.

## Arte requerido (cuando se pase a PAINTED)

- Fondo 1920×1080 (o 2 paneles 960×1080 lado a lado).
- Props spawneados: campana, pedestal, 4 lámparas, monolito del
  Portal, fachada del Taller, reja del Castillo, arcos Forja y
  Terrazas.
- Foreground: posiblemente columnas y dosel sobre el Portal.

## Foreground

- En GREYBOX: un rectángulo translúcido que indica el foreground
  (columnas del Portal, dosel, etc.).
- En PAINTED: el arte se integra con el fondo pintado.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-taller` (E) | doorway + fade 220 ms; la Plaza se ve a través de la puerta |
| `area-calzada` (N) | doorway monumental + cinemática si es la primera vez; la Plaza se ve desde abajo |
| `area-castillo-ext` (O) | doorway natural (reja); la Plaza se ve al E |
| `area-forja-patio` (SO) | doorway natural; la Plaza se ve al N |
| `area-terrazas` (S) | doorway natural; la Plaza se ve al N |

## Validación

- Tests: `r0-areas-graph.test.ts` (existe + aristas), `r1-region-states.test.ts`
  (transiciones de `cuenca`).
- Gameplay QA: el camino `INSTITUTO → area-plaza-cuenca` debe
  poder recorrerse con la cinemática `cinema.portal-arrival`.
