# Ohmdal Arco I — Spatial Map (11 macroáreas en plano mundo)

> **Estado:** `CANON` (ratificado por `ADR-001` y, para la democión de
> coordenadas a esquemático, por `ADR-002`, 2026-08-18).
> **Generado:** 2026-08-17. **Actualizado:** 2026-08-18.
> **Acompaña:** `ARC1_ROOM_GRAPH.md`, `RECOVERY_AUDIT.md`, las 11
> fichas en `areas/`, `SPATIAL_CONTRACT.md`, y
> `ohmdal-world-structure_v1.md`.
>
> ⚠ **Democión por `ADR-002` (Room-Local Spatial Architecture).**
> **Spatial map coordinates are schematic and MUST NOT be interpreted as
> mandatory Phaser world coordinates.** El runtime de Ohmdal es **room-based**:
> cada room posee coordenadas **locales** independientes y las conexiones son
> aristas del room graph, no adyacencia en un plano mundo continuo.
> **Changing one room's width/height MUST NOT require repositioning
> unrelated rooms.**
>
> Este documento es la fuente de verdad para la **topología** del Arco I:
> - cuáles son las 11 macroáreas y qué **región** las contiene;
> - qué área conecta con cuál (relaciones conceptuales N/S/E/O);
> - qué **landmarks** existen y qué **paths** las unen;
> - nivel de piso (`floor`), `regionId` y las 5 regiones.
>
> Los valores numéricos `worldX`/`worldY`/`x0`/`y0` son una **propuesta
> esquemática** de colocación (orientación geográfica N arriba), NO un
> contrato de runtime. Las dimensiones `width`/`height` son el único dato
> geométrico que el runtime consume, y lo consume **por room** (ver
> `SPATIAL_CONTRACT.md`).
>
> **NO** define qué hay jugable dentro de cada área (eso vive en
> `ARC1_ROOM_GRAPH.md` y en las fichas `areas/<area>.md`).
> **NO** redefine la escala visual de assets (eso es H5).
>
> ⚠ **Lo que es CANON** es la **topología** (cuáles son las 11
> macroáreas, qué region contiene a cuáles, qué área conecta con
> cuál, qué landmarks existen, qué paths las unen). Los valores
> numéricos concretos de `x0/y0/width/height` están sujetos al
> primer playthrough de GREYBOX y se ajustan después. Ver §11.
> Cualquier cambio a la **topología** requiere un ADR nuevo.

---

## 1. Convenciones espaciales

### 1.1 Ejes

| Eje | Sentido | Convención |
|---|---|---|
| `worldX` | +este / -oeste | el jugador camina al este cuando `worldX` crece |
| `worldY` | +sur / -norte | el jugador camina al sur cuando `worldY` crece (Phaser usa +Y hacia abajo) |
| `worldZ` | n/a | 2D top-down; no hay eje Z físico |

### 1.2 Sistema de coordenadas por área

Cada área se referencia por la **esquina superior izquierda** (`x0`,
`y0`) en el plano mundo y por su `width × height`. El área
`area-plaza-cuenca` con `(x0=0, y0=0, w=1920, h=1080)` ocupa el
rectángulo mundo `[0..1920] × [0..1080]`.

### 1.3 Pisos (`floor`)

| `floor` | Significado |
|---|---|
| `0` | suelo principal (Plaza, Castillo, Forja, Terrazas, Faro, Lago) |
| `-1` | interior bajo (Taller, enfermería, nave, etc.) |
| `+1` | planta alta (Puerta de Ohm como balcón de la Plaza, mirador del Faro) |
| `-2` | profundo (Manantial, sótano del Castillo si se incluye, base del Faro) |

### 1.4 Viewport lógico

El viewport lógico del juego es **960 × 540 px** (Phaser `W`/`H`).
Las áreas pueden medir varias veces el viewport.

> **No asumimos una equivalencia física px ↔ metro.** En esta
> fase las unidades son **px de diseño**. Cualquier intento de
> derivar `m²`, `m/s`, "escala RPG" u otras conversiones
> métricas queda diferido hasta el primer playthrough de
> GREYBOX, cuando tengamos evidencia de cómo se siente la
> escala para el jugador. La velocidad del jugador y el ritmo
> de caminata también se afinan en playtesting.

### 1.5 Regiones

5 regiones canónicas:

| RegionId | Color de referencia | Rango aproximado |
|---|---|---|
| `cuenca` | ocre (`#d0a34a`) | `worldX` en `[-1080, 2880]`, `worldY` en `[-2700, 540]` |
| `castillo` | violeta (`#b88cff`) | `worldX` en `[-3000, -1080]`, `worldY` en `[-2160, 540]` |
| `forja` | naranja (`#ff7b35`) | `worldX` en `[-3000, -480]`, `worldY` en `[-540, 1620]` |
| `terrazas` | cian (`#74d6bd`) | `worldX` en `[-480, 1500]`, `worldY` en `[540, 2700]` |
| `faro` | oro pálido (`#ffd77a`) | `worldX` en `[-1500, 1500]`, `worldY` en `[2700, 4500]` |

Los colores se usan sólo en el world map debug; no son bloqueantes
del render.

---

## 2. Plano mundo (vista cenital, N arriba)

Esquema **no a escala exacta**: cada cuadra del ASCII representa
≈480 px de diseño. Las áreas se muestran como rectángulos; los
landmarks como puntos. Las líneas continuas son límites
administrativos de región.

```text
                            y = -2700 ┐
                                     │
        ┌────────────────────────────┴────────────────────────────┐
        │              area-manantial (1080×1620)                 │
        │                  (Manantial de Ohm)                      │
        │                                                          │
        ├─────────────────────────────────────────────────────────┤ y = -1080
        │                  area-calzada (960×1620)                 │
        │               (Calzada + Puerta de Ohm)                  │
        │                                                          │
        ├──────────────────────┬──────────────────────────────────┤ y = -540
        │                      │       (Calle del Castillo)        │
  x=-3000                     │                                    │
  ┌───┴────┐  ┌───────────────┴───────────────┐                    │
  │CASTILLO│  │        area-plaza-cuenca      │                    │
  │ INT    │  │           (1920×1080)         │                    │
  │(960×   │  │  • Portal al S                │                    │
  │ 1620)  │  │  • Campana al centro          │  ┌────────────┐    │
  │        │  │  • Pedestal de Ohm            │  │ area-taller│    │
  ├────────┤  │  • Arco al Taller al E        │  │  (960×540) │    │
  │CASTILLO│  │  • Arco al Castillo al O      │  │  interior  │    │
  │ EXT    │  │  • Arco a Forja al SO         │  └────────────┘    │
  │(1920×  │  │  • Arco a Terrazas al S       │                    │
  │ 1620)  │  │                                │                   │
  │        │  │                                │                   │
  └────────┘  └────────────────────────────────┘                   │
  x=-1080     x=-480                              x=1440           │
                ┌─────────────────────────────────┐                │
                │       area-forja-patio          │                │
                │          (1920×1080)            │                │
                │   (Patio + Enfermería)          │                │
                │   • Horno a la vista            │                │
                │   • Canal tibio al S            │                │
                │                                 │                │
                ├─────────────────────────────────┤                │
                │     area-forja-profunda         │                │
                │          (1920×1620)            │                │
                │  (Canal Largo + Nave)           │                │
                │  • Hogar principal              │                │
                │  • Conductores gruesos          │                │
                └─────────────────────────────────┘                │
                                                                    │
                ┌─────────────────────────────────┐                │
                │        area-terrazas            │ y = 540        │
                │          (960×2160)             │                │
                │  (escalonada: top→mid→mural→    │                │
                │   acueducto, todo vertical)     │                │
                │  • Compuerta alta al N          │                │
                │  • Mural de la Maraña           │                │
                │  • Acueducto al S               │                │
                │  • Vertiente al Lago            │                │
                │                                 │                │
                └─────────────────────────────────┘ y = 2700       │
                                                                    │
                ┌─────────────────────────────────┐                │
                │          area-lago              │                │
                │         (2400×1620)             │                │
                │  (Lago + Acueducto + Muelle)    │                │
                │  • Lago central                 │                │
                │  • Archivo al NO                │                │
                │  • Muelle al E                  │                │
                │  • Faro visible al E            │                │
                └─────────────────────────────────┘                │
                                                                    │
                ┌─────────────────────────────────┐                │
                │          area-faro              │ y = 3240       │
                │         (2880×1620)             │                │
                │  (Faro + Reloj + Linterna)      │                │
                │  • Reloj central                │                │
                │  • Faro al E                    │                │
                │  • Lens arriba                  │                │
                │  • Muelle al S                  │                │
                └─────────────────────────────────┘ y = 4860       │
```

**Ancho total del mundo (provisional)**: 5880 px de diseño.
**Alto total del mundo (provisional)**: 7560 px de diseño.

> **Nota:** estos tamaños son **diseño provisional**, no canon
> físico. Se ajustan después del primer playthrough de GREYBOX.
> La regla que manda es "el área debe sentirse lo suficientemente
> grande para el ritmo del capítulo"; el px exacto se decide
> jugándola. **No** se convierten a m² ni a otras unidades
> métricas: las unidades de esta fase son px.

---

## 3. Tabla canónica de las 11 áreas

> ⚠ **Uso (post `ADR-002`).** Las columnas `x0`/`y0` son **esquemáticas**:
> orientan la geografía (norte = -Y, sur = +Y, este = +X) y alimentan el
> mapa del juego y las vistas de diseño. **No** se usan en runtime para
> colocar rooms ni para derivar conexiones. Las columnas `width`/`height`
> son las dimensiones **locales** que el runtime consume por room
> (`RoomSceneProfile.width/height`).

Cada área se referencia por la **esquina superior izquierda** (`x0`,
`y0`) en el plano mundo y por su `width × height`. El área
`area-plaza-cuenca` con `(x0=0, y0=0, w=1920, h=1080)` ocupa el
rectángulo mundo `[0..1920] × [0..1080]` **en el esquema**; en runtime
la Plaza es una room independiente con coordenadas locales
`[0..1920) × [0..1080)`. El sistema de coordenadas
**conserva** la relación geográfica del `world.ts` original: el norte
sigue siendo `-Y`, el sur sigue siendo `+Y`, el este sigue siendo
`+X`.

| AreaId | Region | Floor | x0 | y0 | width | height | Salas originales absorbidas |
|---|---|---|---|---|---|---|---|
| `area-plaza-cuenca` | `cuenca` | 0 | -480 | -540 | 1920 | 1080 | `plaza` (ext.) |
| `area-taller` | `cuenca` | -1 | 960 | 0 | 960 | 540 | `taller` |
| `area-calzada` | `cuenca` | 0 | -480 | -1620 | 960 | 1620 | `puerta` (ext.) |
| `area-manantial` | `cuenca` | -1 | -480 | -3240 | 1080 | 1620 | `manantial_ohm` (ext.) |
| `area-castillo-ext` | `castillo` | 0 | -3000 | -540 | 1920 | 1620 | `castle_gate` + `castle_gallery` |
| `area-castillo-int` | `castillo` | -1 | -3000 | -2160 | 960 | 1620 | `castle_branches` + `castle_heart` |
| `area-forja-patio` | `forja` | 0 | -3000 | 0 | 2520 | 1080 | `forge_yard` + `forge_infirmary` |
| `area-forja-profunda` | `forja` | 0 | -3000 | 1080 | 2520 | 1620 | `forge_longchannel` + `forge_hall` |
| `area-terrazas` | `terrazas` | 0 | -480 | 540 | 960 | 2160 | `terraces_top` + `terraces_mid` + `terraces_mural` + `terraces_aqueduct` |
| `area-lago` | `faro` | 0 | -1500 | 2700 | 2400 | 1620 | (ext. sur de acueducto + nuevo) |
| `area-faro` | `faro` | 0 | -600 | 3240 | 2880 | 1620 | `lighthouse_hall` + `lighthouse_bench` + `clock_tower` + `lighthouse_lantern` |

> Las posiciones se afinan en el primer playthrough; el diseño
> respeta las relaciones geográficas del `world.ts` original y de
> `ohmdal-world-structure_v1.md`.

### 3.1 Resumen de bounding boxes por región

```text
cuenca:     worldX ∈ [-480,  1560],  worldY ∈ [-3240,  540]
castillo:   worldX ∈ [-3000, -1080], worldY ∈ [-2160,  1080]
forja:      worldX ∈ [-3000, -480],  worldY ∈ [   0,  2700]
terrazas:   worldX ∈ [-480,   480],  worldY ∈ [ 540, 2700]
faro:       worldX ∈ [-1500, 2280],  worldY ∈ [2700, 4860]
```

### 3.2 Centro de masa (referencia para cámara y world map debug)

| Region | Centro de bounding box | Notas |
|---|---|---|
| `cuenca` | `(540, -1350)` | sesgo al norte por Calzada y Manantial |
| `castillo` | `(-2040, -540)` | simétrico |
| `forja` | `(-1740, 1350)` | sesgo al sur por Canal Largo |
| `terrazas` | `(0, 1620)` | columna vertical |
| `faro` | `(390, 3780)` | sesgo al este por el Faro |

---

## 4. Landmarks

Los landmarks son puntos físicos visibles en el mundo que orientan
al jugador. **Pueden ser vistos desde otras áreas** (skyline),
**mencionados** (NPC, Bitácora), **escuchados** (audio), o
**insinuados visualmente**.

| Landmark | Posición mundo | Region | Visible desde |
|---|---|---|---|
| `portal-omega` | (480, 540) | cuenca | Plaza (in situ), Forja Patio (skyline al E) |
| `plaza-monument` (campana + pedestal) | (480, 0) | cuenca | Plaza (in situ) |
| `ohm-pedestal` (inanimado) | (480, 90) | cuenca | Plaza (in situ) |
| `puerta-de-ohm` | (0, -810) | cuenca | Plaza (al N), Calzada (in situ) |
| `lumen-workshop-facade` | (960, 270) | cuenca | Plaza (fachada E) |
| `manantial-estanque` | (60, -2430) | cuenca | Calzada (al N, en la distancia) |
| `castle-gate` | (-2040, 270) | castillo | Plaza (al O, reja), Castillo Patio (in situ) |
| `castle-trunk-distributor` | (-2040, -1620) | castillo | Castillo Patio (al N), Ramales (in situ) |
| `castle-network-heart-tower` | (-2040, -1350) | castillo | Castillo Patio (skyline al N) |
| `forge-stack` (chimeneas) | (-2400, 540) | forja | Plaza (al SO, humareda), Forja Patio (in situ) |
| `forge-hearth` | (-2280, 810) | forja | Forja Patio (in situ) |
| `forge-trunk-junction` | (-1500, 1080) | forja | Forja Patio (al S), Forja Profunda (al N) |
| `terraces-main-sluice` | (0, 700) | terrazas | Forja Patio (al E), Terrazas Top (in situ) |
| `terraces-aqueduct-mouth` | (480, 2500) | terrazas | Lago (al S, en la distancia) |
| `lake-dock` | (480, 3800) | faro | Lago (in situ) |
| `lighthouse-tower` | (1860, 3780) | faro | Lago (al E), Faro (in situ) |
| `clock-tower` | (840, 3780) | faro | Lago (al O), Faro (in situ) |
| `lighthouse-lens` | (1860, 3240) | faro | Faro (in situ) |

---

## 5. Paths físicos (topología jugable)

Los paths unen landmarks. El jugador puede transitarlos a pie
cuando no están bloqueados por un lock de región.

```text
# Cuenca
portal-omega → plaza-monument          (camino empedrado, 540 px)
plaza-monument → puerta-de-ohm          (calle central N, 810 px)
plaza-monument → lumen-workshop-facade  (calle lateral E, 480 px)
plaza-monument → castle-gate           (arco O, 2520 px)
plaza-monument → forge-trunk-junction  (camino SO, 1980 px)
plaza-monument → terraces-main-sluice  (camino S, 700 px)
puerta-de-ohm → manantial-estanque     (calzada empedrada, 1620 px)

# Castillo
castle-gate → castle-trunk-distributor (corredor N, 1890 px)
castle-gate → castle-network-heart-tower (corredor N, 1620 px)

# Forja
forge-trunk-junction → forge-yard      (corredor O, 1080 px)
forge-trunk-junction → forge-hearth    (corredor O, 780 px)
forge-yard → forge-hearth              (corredor S, 480 px)
forge-trunk-junction → terraces-main-sluice (corredor E, 1500 px)

# Terrazas
terraces-main-sluice → terraces-mural  (escalinatas, 920 px)
terraces-mural → terraces-aqueduct-mouth (descenso, 880 px)

# Lago
terraces-aqueduct-mouth → lake-dock    (orilla, 1620 px)
lake-dock → lighthouse-tower           (promontorio E, 1380 px)
lake-dock → clock-tower                (orilla O, 360 px)

# Faro
clock-tower → lighthouse-tower         (corredor central E, 1020 px)
lighthouse-tower → lighthouse-lens     (interior, planta alta, 540 px)
```

> Las distancias se afinan al primer playthrough. La regla es
> "ritmo de caminata de RPG, no de walking simulator".

---

## 6. Pisos y verticales

| Área | Floor | Mecánica vertical |
|---|---|---|
| `area-plaza-cuenca` | 0 | un solo piso; el pedestal está al mismo nivel que el suelo (afordance visual) |
| `area-taller` | -1 | interior; el jugador entra por una bajada de 1 piso |
| `area-calzada` | 0 | un piso, pero la Puerta monumental está a `floor=+1` (balcón con vista a la Plaza) |
| `area-manantial` | -1 | estanque a media altura; el jugador entra descendiendo |
| `area-castillo-ext` | 0 | explanada exterior, sin verticalidad |
| `area-castillo-int` | -1 | interior con distribuidores a la vista (sin planta alta por ahora) |
| `area-forja-patio` | 0 | patio exterior |
| `area-forja-profunda` | 0 | nave, sin cambio de piso; el hogar está al mismo nivel |
| `area-terrazas` | 0 + escalones | las terrazas son escalonadas; cada nivel es +1 piso respecto al anterior (4 niveles, 3 saltos) |
| `area-lago` | 0 | muelle y orilla al nivel del agua |
| `area-faro` | 0 + torre | la base del Faro está a `floor=0`; la lens está a `floor=+3` |

> **Importante:** el `floor` se modela como flag en `AreaDef` y
> como entrada en `paths` (un path entre dos pisos implica
> `escalator` o `escalera`). En GREYBOX las verticales se
> representan con un cambio de color de fondo + un ícono de
> escalera; en PAINTED se usan los fondos existentes.

---

## 7. Technical Chunks (metadata de partición, sin carga dinámica)

> ⚠ **Importante:** en H2 los Technical Chunks son **únicamente
> metadata de partición interna del área**. Sirven para que el
> equipo de producción razone sobre la subdivisión lógica
> (qué chunk corresponde a qué sector del fondo pintado, qué
> assets se cargan juntos, qué zonas se testan juntas). **No**
> se implementa carga por proximidad, culling por TC, ni
> streaming dinámico en esta fase.

Un Technical Chunk **nunca**:

- produce fade;
- reinicia NPC;
- cambia world state;
- es narrativo;
- es perceptible para el jugador;
- requiere soporte runtime especial en H2 (es metadata, no API).

Si en una fase posterior (H5+) aparece **evidencia concreta de
performance** (mediciones de FPS, tiempo de carga, memoria) que
justifique activar la carga por TC, eso se discute en un ADR
nuevo. Mientras tanto, los TCs son una guía de organización del
trabajo de producción de assets y de testeo, no una primitiva
del motor.

Propuesta inicial (metadata, no implementación):

| Área | Technical Chunks (TC) | Tamaño aprox. de cada TC |
|---|---|---|
| `area-plaza-cuenca` | `plaza-n`, `plaza-c`, `plaza-s` | 960×540 (3×2 TCs) |
| `area-calzada` | `calzada-baja`, `calzada-media`, `puerta-alta` | 960×540 (1×3 TCs) |
| `area-manantial` | `manantial-calzada`, `manantial-estanque` | 1080×810 cada uno |
| `area-castillo-ext` | `castle-patio-w`, `castle-patio-e` | 960×1620 (2×1 TCs) |
| `area-castillo-int` | `ramales`, `corazon` | 960×810 cada uno |
| `area-forja-patio` | `yard`, `enfermeria` | 1260×1080 cada uno |
| `area-forja-profunda` | `canal-largo`, `nave` | 1260×1620 cada uno |
| `area-terrazas` | `top`, `mid`, `mural`, `acueducto` | 960×540 (1×4 TCs, conserva la segmentación original) |
| `area-lago` | `orilla`, `lago`, `muelle` | 1200×810 cada uno |
| `area-faro` | `faro-base`, `reloj`, `faro-torre`, `faro-lens` | 960×810 cada uno |

> El runtime de H2 no necesita saber qué TCs existen. Los TCs son
> una **guía de organización** del pipeline de assets y se
> materializan (como primitiva del motor) sólo si la evidencia
> de performance lo requiere.

---

## 8. Reglas de continuidad con vecinos

| Área | Vecino N | Vecino S | Vecino E | Vecino O |
|---|---|---|---|---|
| `area-plaza-cuenca` | `area-calzada` | `area-terrazas` | `area-taller` | `area-castillo-ext` |
| `area-taller` | (n/a, interior) | (n/a) | (n/a) | `area-plaza-cuenca` |
| `area-calzada` | `area-manantial` | `area-plaza-cuenca` | (n/a) | (n/a) |
| `area-manantial` | (n/a) | `area-calzada` | (n/a) | (n/a) |
| `area-castillo-ext` | (n/a) | (n/a) | `area-plaza-cuenca` | `area-castillo-int` |
| `area-castillo-int` | (n/a) | `area-castillo-ext` | (n/a) | (n/a) |
| `area-forja-patio` | `area-plaza-cuenca` | `area-forja-profunda` | `area-terrazas` | (n/a) |
| `area-forja-profunda` | `area-forja-patio` | (n/a) | (n/a) | (n/a) |
| `area-terrazas` | `area-plaza-cuenca` | `area-lago` | (n/a) | `area-forja-patio` |
| `area-lago` | `area-terrazas` | `area-faro` | (n/a) | (n/a) |
| `area-faro` | `area-lago` | (n/a) | (n/a) | (n/a) |

Reglas:

- El jugador puede **transitar** a cualquier vecino **sin**
  cinematic, excepto donde el room graph marca `cinematic` o
  `locked`.
- El **banner de zona** cambia al cruzar el límite entre áreas.
- La **música** cambia al cruzar el límite entre **regiones**,
  no entre áreas del mismo región.

> ⚠ **`ADR-002`:** esta tabla describe vecindad **conceptual**
> (relaciones N/S/E/O de la topología). En runtime la vecindad se
> materializa como **aristas del room graph con entries de destino**
> (`SPATIAL_CONTRACT.md` §3), no como muros compartidos en un plano
> mundo. La contigüidad física entre rooms **no** es un requisito.

---

## 9. JSON canónico (para tests y para el runtime)

Este JSON es la entrada que el runtime y los tests consumen.
**Cualquier cambio en dimensiones o posiciones** se hace editando
este JSON y re-corriendo los tests.

> ⚠ **Los valores numéricos son `PROVISIONAL`** y se ajustan
> después del primer playthrough de GREYBOX. La **estructura
> topológica** (qué áreas existen, qué región las contiene, qué
> landmarks y paths las unen) es lo que es `CANON`.
>
> ⚠ **Post `ADR-002`:** el bloque `areas[]` conserva `x0/y0` como
> **esquemático** (orientación geográfica). El runtime room-based
> consume únicamente `width`/`height` **por room** y el grafo de
> `ARC1_ROOM_GRAPH.md` para conexiones. No existe un "plano mundo"
> obligatorio de Phaser.

```json
{
  "$schema": "./arc1-spatial-map.schema.json",
  "worldBounds": {"x": -3000, "y": -3240, "width": 5280, "height": 8100},
  "viewport": {"width": 960, "height": 540},
  "scale": {"cellPx": 48},
  "regions": [
    {"id": "cuenca", "color": "#d0a34a",
     "bounds": {"x": -480, "y": -3240, "width": 2040, "height": 3780}},
    {"id": "castillo", "color": "#b88cff",
     "bounds": {"x": -3000, "y": -2160, "width": 1920, "height": 2700}},
    {"id": "forja", "color": "#ff7b35",
     "bounds": {"x": -3000, "y": 0, "width": 2520, "height": 2700}},
    {"id": "terrazas", "color": "#74d6bd",
     "bounds": {"x": -480, "y": 540, "width": 960, "height": 2160}},
    {"id": "faro", "color": "#ffd77a",
     "bounds": {"x": -1500, "y": 2700, "width": 3780, "height": 2160}}
  ],
  "areas": [
    {"id": "area-plaza-cuenca", "region": "cuenca", "floor": 0,
     "x0": -480, "y0": -540, "width": 1920, "height": 1080,
     "absorbs": ["plaza"]},
    {"id": "area-taller", "region": "cuenca", "floor": -1,
     "x0": 960, "y0": 0, "width": 960, "height": 540,
     "absorbs": ["taller"], "isInterior": true},
    {"id": "area-calzada", "region": "cuenca", "floor": 0,
     "x0": -480, "y0": -1620, "width": 960, "height": 1620,
     "absorbs": ["puerta"]},
    {"id": "area-manantial", "region": "cuenca", "floor": -1,
     "x0": -480, "y0": -3240, "width": 1080, "height": 1620,
     "absorbs": ["manantial_ohm"]},
    {"id": "area-castillo-ext", "region": "castillo", "floor": 0,
     "x0": -3000, "y0": -540, "width": 1920, "height": 1620,
     "absorbs": ["castle_gate", "castle_gallery"]},
    {"id": "area-castillo-int", "region": "castillo", "floor": -1,
     "x0": -3000, "y0": -2160, "width": 960, "height": 1620,
     "absorbs": ["castle_branches", "castle_heart"], "isInterior": true},
    {"id": "area-forja-patio", "region": "forja", "floor": 0,
     "x0": -3000, "y0": 0, "width": 2520, "height": 1080,
     "absorbs": ["forge_yard", "forge_infirmary"]},
    {"id": "area-forja-profunda", "region": "forja", "floor": 0,
     "x0": -3000, "y0": 1080, "width": 2520, "height": 1620,
     "absorbs": ["forge_longchannel", "forge_hall"]},
    {"id": "area-terrazas", "region": "terrazas", "floor": 0,
     "x0": -480, "y0": 540, "width": 960, "height": 2160,
     "absorbs": ["terraces_top", "terraces_mid", "terraces_mural", "terraces_aqueduct"]},
    {"id": "area-lago", "region": "faro", "floor": 0,
     "x0": -1500, "y0": 2700, "width": 2400, "height": 1620,
     "absorbs": []},
    {"id": "area-faro", "region": "faro", "floor": 0,
     "x0": -600, "y0": 3240, "width": 2880, "height": 1620,
     "absorbs": ["lighthouse_hall", "lighthouse_bench", "clock_tower", "lighthouse_lantern"]}
  ],
  "landmarks": [
    {"id": "portal-omega", "area": "area-plaza-cuenca", "x": 480, "y": 540},
    {"id": "plaza-monument", "area": "area-plaza-cuenca", "x": 480, "y": 0},
    {"id": "ohm-pedestal", "area": "area-plaza-cuenca", "x": 480, "y": 90},
    {"id": "puerta-de-ohm", "area": "area-calzada", "x": 0, "y": -810},
    {"id": "lumen-workshop-facade", "area": "area-plaza-cuenca", "x": 960, "y": 270},
    {"id": "manantial-estanque", "area": "area-manantial", "x": 60, "y": -2430},
    {"id": "castle-gate", "area": "area-castillo-ext", "x": -2040, "y": 270},
    {"id": "castle-trunk-distributor", "area": "area-castillo-int", "x": -2040, "y": -1620},
    {"id": "castle-network-heart-tower", "area": "area-castillo-int", "x": -2040, "y": -1350},
    {"id": "forge-stack", "area": "area-forja-patio", "x": -2400, "y": 540},
    {"id": "forge-hearth", "area": "area-forja-profunda", "x": -2280, "y": 810},
    {"id": "forge-trunk-junction", "area": "area-forja-patio", "x": -1500, "y": 1080},
    {"id": "terraces-main-sluice", "area": "area-terrazas", "x": 0, "y": 700},
    {"id": "terraces-aqueduct-mouth", "area": "area-terrazas", "x": 480, "y": 2500},
    {"id": "lake-dock", "area": "area-lago", "x": 480, "y": 3800},
    {"id": "lighthouse-tower", "area": "area-faro", "x": 1860, "y": 3780},
    {"id": "clock-tower", "area": "area-faro", "x": 840, "y": 3780},
    {"id": "lighthouse-lens", "area": "area-faro", "x": 1860, "y": 3240}
  ],
  "paths": [
    {"from": "portal-omega", "to": "plaza-monument"},
    {"from": "plaza-monument", "to": "puerta-de-ohm"},
    {"from": "plaza-monument", "to": "lumen-workshop-facade"},
    {"from": "plaza-monument", "to": "castle-gate"},
    {"from": "plaza-monument", "to": "forge-trunk-junction"},
    {"from": "plaza-monument", "to": "terraces-main-sluice"},
    {"from": "puerta-de-ohm", "to": "manantial-estanque"},
    {"from": "castle-gate", "to": "castle-trunk-distributor"},
    {"from": "castle-trunk-distributor", "to": "castle-network-heart-tower"},
    {"from": "forge-trunk-junction", "to": "forge-stack"},
    {"from": "forge-trunk-junction", "to": "forge-hearth"},
    {"from": "forge-trunk-junction", "to": "terraces-main-sluice"},
    {"from": "terraces-main-sluice", "to": "terraces-aqueduct-mouth"},
    {"from": "terraces-aqueduct-mouth", "to": "lake-dock"},
    {"from": "lake-dock", "to": "lighthouse-tower"},
    {"from": "lake-dock", "to": "clock-tower"},
    {"from": "clock-tower", "to": "lighthouse-tower"},
    {"from": "lighthouse-tower", "to": "lighthouse-lens"}
  ]
}
```

---

## 10. Validación automática

El spatial map debe poder validarse mediante tests Node:

- `s0-spatial-bounds.test.ts`:
  - Las 11 áreas tienen `width > 0` y `height > 0`.
  - Las áreas no se solapan entre sí (excepto donde un área es
    **interior** dentro de otra, marcado con `isInterior: true`).
  - Las áreas del mismo región comparten al menos un borde o un
    vértice.
  - El `worldBounds` cubre todas las áreas.
  - Cada landmark cae dentro de su `area` declarada.
  - Cada `path.from` y `path.to` apunta a un landmark que existe.
- `s1-area-coverage.test.ts`:
  - Las 20 salas originales del runtime existente tienen un `area`
    que las declara en `absorbs`.
  - Ningún `area` declara una sala que no exista.
- `s2-region-state.test.ts`:
  - Las 5 regiones tienen bounding boxes no-vacías.
  - Las bounding boxes de las regiones **cubren** las bounding
    boxes de las áreas que declaran.

---

## 11. Cambios futuros (no en este paquete)

> **Lo que es CANON:** la topología de las 11 áreas, las 5
> regiones, los 18 landmarks, los 18 paths, el grafo de
> conectividades, los locks narrativos.
>
> **Lo que es PROVISIONAL:** los valores numéricos concretos de
> `x0/y0/width/height` en este JSON, el "ancho/alto total del
> mundo" (§2), y el "centro de masa" de las regiones (§3.2). Esos
> números se ajustan después del primer playthrough de GREYBOX sin
> que la topología canónica cambie.

- Las **dimensiones exactas** se afinan después del primer
  playthrough de GREYBOX; este JSON es el **diseño inicial**, no
  la verdad final. **No** se asume equivalencia px↔metro; las
  unidades son px de diseño.
- Los **TCs del §7 son metadata de partición, no primitiva del
  motor en H2.** Se materializan (carga por TC, culling por TC)
  sólo si aparece evidencia concreta de performance que lo
  justifique, mediante un ADR nuevo.
- Los **landmarks** pueden crecer (skyline, sonido, mención) sin
  cambiar la geometría.
- Las **posiciones de los landmarks** son referencia; los puzzles
  pueden ajustar hotspots sin tocar la geometría.

---

## 12. Referencias

- `ADR-002-room-local-spatial-architecture.md` — democión de las
  coordenadas numéricas a esquemático; modelo room-based vigente.
- `SPATIAL_CONTRACT.md` — contrato de runtime room-based (RoomGraph,
  ActiveRoom, cámara, transiciones, render, mapa esquemático).
- `ADR-001-phaser-multiarea-arc1.md` — decisión de governance.
- `ARC1_ROOM_GRAPH.md` — grafo de áreas jugables (topología + locks).
- `RECOVERY_AUDIT.md` — auditoría del runtime.
- `areas/*.md` — 11 fichas de macroárea.
- `docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md` —
  estructura de mundo (input conceptual vigente).
- `src/jugar/world.ts` — implementación vigente con offsets a
  960×540 (referencia histórica; los offsets dejan de ser autoridad
  de runtime en la migración R6).
- `docs/20-worlds/ohmdal/world/layout/arc1-layout.json` — layout
  HD-2D LEGACY (referencia conceptual, no plan de producción).
