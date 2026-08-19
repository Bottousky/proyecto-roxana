# Macroárea `area-terrazas` — Terrazas escalonadas

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
| ID | `area-terrazas` |
| Nombre | Terrazas escalonadas |
| RegionId | `terrazas` |
| Capítulo(s) | Cap 3 |
| Sala(s) original(es) absorbida(s) | `terraces_top` + `terraces_mid` + `terraces_mural` + `terraces_aqueduct` |
| `currentRenderMode` (H2-H7) | `GREYBOX` |
| `targetArtMode` (H8+) | `HYBRID` (fondo nuevo 960×2160 que reusa los 4 fondos pintados existentes como paneles verticales) |

## Dimensiones

| Campo | Valor |
|---|---|
| `width` | 960 px |
| `height` | 2160 px (4 viewports apilados) |
| `floor` | 0 (pero cada terraza es +1 piso respecto a la anterior) |
| Viewport lógico | 960 × 540 |

## World position

| Campo | Valor |
|---|---|
| `x0` | -480 |
| `y0` | 540 |
| Centro de área | (0, 1620) |
| Region bbox | `terrazas` ⊂ `[-480, 480] × [540, 2700]` |

## Landmarks (en esta área)

| Landmark | Posición mundo | Notas |
|---|---|---|
| `terraces-main-sluice` | (0, 700) | compuerta alta, al N |
| `ladera-escalonada` | (0, 1080) | primer escalón |
| `terraza-alta-encharcada` | (0, 1080) | terraza alta |
| `terraza-baja-reseca` | (0, 1620) | terraza media (reseca en `DETERIORATED`) |
| `mural-marana` | (-40, 1050) | mural de la Maraña (al N de la terraza media) |
| `mural-piedra` | (140, 1080) | la Piedra Única (centro de la terraza media) |
| `acueducto-nivel-alto` | (0, 2160) | acueducto, al S |
| `acueducto-nivel-medio` | (0, 2200) | acueducto medio (interactivo) |
| `acueducto-nivel-bajo` | (0, 2240) | acueducto bajo |
| `acueducto-mouth` | (480, 2500) | boca del acueducto, hacia el Lago |

## Propósito

- **Verificar la Ley de Ohm** (puzzles `steps`, `fairsplit`,
  `singlestone`, `ladder`).
- **Ancla pedagógica de Cap 3 (parte 2)**: lazo, caída,
  diagnóstico, reparto.
- **Ancla narrativa de la Guardiana**.
- **Trampolín al Lago**: el acueducto vierte al Lago cuando la
  región está en `UNDERSTOOD`.

## Entradas y salidas

| Desde / Hacia | Tipo | Triggers | Lock |
|---|---|---|---|
| ← `area-plaza-cuenca` (N) | `walk` (doorway, arco) | subir por el arco N | `forgeRestored` |
| → `area-plaza-cuenca` (N) | `walk` (doorway) | volver a la Plaza | siempre |
| ← `area-forja-patio` (NO) | `walk` (doorway, pendiente) | descender por la pendiente O | `forgeRestored` |
| → `area-forja-patio` (NO) | `walk` (doorway) | volver a la Forja | siempre |
| → `area-lago` (S) | `walk` (acueducto) | descender por el acueducto al S | `valleyRestored` |
| ← `area-lago` (S) | `walk` (acueducto) | volver del Lago | siempre |

## Cámara

- **Viewport**: 960×540.
- **Dead zone**: 60% del viewport.
- **Encuadre autoral**: a medida que el jugador desciende por las
  terrazas, la cámara muestra más horizonte (al S, el Lago). En la
  terraza alta, encuadra la Plaza al N. En la terraza baja,
  encuadra el Lago al S.
- **Bounds**: `[x0, y0, width, height]`.
- **Perspective**: `fixedRpg` (escala uniforme RPG).

## Walkable

- **Terraza alta** (norte, 540 px): walkable amplio alrededor de
  la compuerta.
- **Terraza media** (540 px): walkable entre el mural y la
  cisterna.
- **Terraza del mural** (540 px): walkable alrededor del mural
  de la Maraña.
- **Acueducto** (sur, 540 px): walkable entre los tres niveles
  del acueducto.

## Blockers (colisiones)

- La compuerta alta (sólo se cruza por el walkable).
- La cisterna central (en la terraza del mural).
- Los pilares del acueducto (decorativos, no bloquean gameplay).
- Las murallas laterales de las terrazas (sólo se cruzan por el
  walkable o por las escaleras entre niveles).

## NPC (en esta área)

| NPC | Posición | Aparece | Sale |
|---|---|---|---|
| `edda-terrazas-alto` | (115, 1340) | desde Cap 3 | nunca |
| `lumen-terrazas-alto` | (105, 1450) | desde Cap 3 | nunca |
| `ohm-terrazas-alto` | (40, 1410) | desde `ohmAwake` | nunca |
| `guardiana-mural` | (240, 1315) | desde `metGuardiana` | después de `valleyRestored` |
| `edda-terrazas-mural` | (220, 1395) | desde Cap 3 | nunca |
| `lumen-terrazas-acueducto` | (-295, 1215) | desde Cap 3 | nunca |
| `edda-terrazas-acueducto` | (330, 1220) | desde Cap 3 | nunca |

## Hotspots (interacciones)

| Hotspot | Posición | Triggers | Notas |
|---|---|---|---|
| `compuerta-alta` | (0, 1060) | puzzle `steps` (alias de `banco-escalones`) | baked; prompt "Ajustar la compuerta" |
| `terraza-baja-reseca` | (0, 1620) | puzzle `fairsplit` (alias de `banco-reparto`) | baked; prompt "Repartir el agua" |
| `mural-piedra` | (140, 1080) | puzzle `singlestone` (alias de `banco-piedra-unica`) | baked; prompt "Examinar la Piedra Única" |
| `mural-marana` | (-40, 1050) | (referencia visual) | baked |
| `signo-mural` | (55, 1080) | (referencia visual) | baked |
| `acueducto-nivel-alto` | (0, 2160) | (referencia visual) | baked |
| `acueducto-nivel-medio` | (0, 2200) | puzzle `ladder` (alias de `banco-escalera`) | baked; prompt "Ajustar el acueducto" |
| `acueducto-nivel-bajo` | (0, 2240) | (referencia visual) | baked |

## Estados (de la región `terrazas`)

| Estado de región | Lectura observable |
|---|---|
| `DETERIORATED` | terrazas resecas, polvo, agua detenida, mural opaco |
| `INTERVENTION` | la Guardiana trabaja, el agua empieza a moverse |
| `UNDERSTOOD` | `valleyRestored`; agua cayendo por las terrazas (efectos `water`), pulsos en el mural, la Guardiana enseña |

## Cinematic hooks

- **Entrada**: doorway (sin cinemática especial).
- **Salida al Lago**: doorway (sin cinemática especial).

## Technical Chunks

| TC | Tamaño | Notas |
|---|---|---|
| `terraces-top` | 960×540 | terraza alta (norte) |
| `terraces-mid` | 960×540 | terraza media |
| `terraces-mural` | 960×540 | terraza del mural |
| `terraces-aqueduct` | 960×540 | acueducto (sur) |

> Los TCs conservan la segmentación original del runtime
> existente; al fusionar las 4 salas en un área, los TCs siguen
> siendo una partición interna no perceptible.

## Arte requerido

- Fondo 960×2160 (o 4 paneles 960×540 apilados).
- Variantes: `room-terraces-top`, `room-terraces-mid`,
  `room-terraces-mural`, `room-terraces-aqueduct` (existentes en
  `assets/ohmdal/rooms/pilot-arco1/`).
- Props: compuerta, mural, cisterna, acueducto.

## Foreground

- Polvo (efecto `dust`) en `DETERIORATED`.
- Agua cayendo (efecto `water`) en `UNDERSTOOD`.

## Continuidad con vecinos

| Vecino | Cómo se conecta |
|---|---|
| `area-plaza-cuenca` (N) | arco al N |
| `area-forja-patio` (NO) | pendiente O |
| `area-lago` (S) | acueducto al S |

## Validación

- Tests: puzzles `steps`, `fairsplit`, `singlestone`, `ladder`
  deben seguir pasando.
- Gameplay QA: el camino descendente por las 4 terrazas debe ser
  continuo (sin fades arbitrarios) y debe permitir backtracking.
