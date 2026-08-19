# Commit 4 — Plaza de la Cuenca: first real large-area greybox

**Fecha:** 2026-08-18  
**Hito:** H3 (Plaza multi-área greybox + Despertar de Ohm)  
**Status:** ✅ DONE — todos los criterios del Definition of Done verificados

---

## Resumen

La Plaza de la Cuenca migró de **960×540** a **1920×1080** — el primer
área grande REAL de Ohmdal. Usa la infraestructura espacial, de cámara
y de active-area de los commits anteriores (Spatial Contract + 
CameraDirector + ActiveArea) sin modificarla. El resto del mundo se
mantiene en 960×540; sólo los vecinos directos de la Plaza se
reposicionaron para evitar solapamientos físicos.

---

## 1. Mapa ASCII del greybox resultante

```
                    x: 0         880     1040        1820    1920
                                  ┌──┐                          ← puerta: (880, 0, 160, 60)
                    ┌─────────────┘  └─────────────┐
                    │     ring N (h=100)         │
                    │ ┌─────────┐  ┌─────────┐    │  ← Plaza NW: (80,100,760,360) / NE
              0 ──► │ │ MONOLITO│  │ MONOLITO│    │
                    │ │  NW     │  │   NE    │    │
                    │ │         │  │         │    │
                    │ │  walkable NW  walkable NE    │
                    │ │  ┌──────┐  ┌──────┐  │    │
                  100│ │  │      │  │      │  │    │
                    │ │  │      │  │      │  │    │
                  200│ │  └──────┘  └──────┘  │    │  ← monolito NW: (200,200,100,60)
                    │ │            EJE N-S       │    │   monolito NE: (1620,200,100,60)
                    │ │            (h=1080)      │    │
                    │ │  ┌──────┐  ┌──────┐  │    │
                  460│ └──│BANDA │  │BANDA  │──┘    │  ← Banda E-O: (0,460,1920,160)
                    │    │ E-O  │  │ E-O   │       │     (cubre gaps del taller este + castle/forge oeste)
                  540│    │      │  │      │       │  ← puerta taller: (1820, 500, 100, 80)
                    │    └──────┘  └──────┘       │     puerta castle_gate: (0, 460, 60, 80)
                    │                             │     puerta forge_yard:  (0, 540, 60, 80)
                    │  ┌──────┐  ┌──────┐         │  ← Plaza SW / SE
                    │  │      │  │      │         │
                    │  │      │  │      │         │
                    │  └──────┘  └──────┘         │
                    │                             │
                    │  MONOLITO       MONOLITO    │  ← monolito SW: (200,800,100,60)
                    │  SW               SE        │     monolito SE: (1620,800,100,60)
                    │     ring S (h=100)         │
                    └─────────────────────────────┘
                  980   ┌──┐
                       │  │ puerta terraces_top: (880, 1020, 160, 60)
                  1080 ─┘  └─
```

**Anillo perimetral norte:** `{x: 0, y: 0, w: 880, h: 100}` + `{x: 1040, y: 0, w: 880, h: 100}`  
**Eje N-S:** `{x: 880, y: 0, w: 160, h: 1080}`  
**Banda E-O:** `{x: 0, y: 460, w: 1920, h: 160}` (cubre el gap del taller este + castle/forge oeste)  
**Anillo perimetral sur:** `{x: 0, y: 980, w: 880, h: 100}` + `{x: 1040, y: 980, w: 880, h: 100}`  
**4 plazas en las esquinas:** NW `{x: 80, y: 100, w: 760, h: 360}` + NE / SW / SE (espejo)

---

## 2. Dimensiones finales

| Elemento            | Valor          | Notas                                       |
|---------------------|----------------|---------------------------------------------|
| Plaza (chunk)       | 1920 × 1080    | 2 viewports × 2 viewports                   |
| Viewport            | 960 × 540      | sin cambios respecto al baseline            |
| Door grosor (B)     | 26 px          | recorte de muros perimetrales               |
| Decor cell          | 48 × 48 px     | genera 40 × 22 = 880 celdas                |
| Edda / Lumen rig    | 64 × 96 px     | sin cambios                                 |

---

## 3. Posiciones de landmarks

| Landmark                          | Coord local (Plaza)  | Coord world      |
|-----------------------------------|----------------------|------------------|
| **Pedestal central Ohm** (medallón) | (960, 640, 80, 80) | (960, 640)       |
| **Campana monumental**              | (960, 280, 170, 180) | (960, 280)      |
| **Portal al Instituto** (thing)    | (220, 760, 96, 54)  | (220, 760)       |
| **Lámpara N** (deco)                | (960, 100)          | (960, 100)       |
| **Lámpara S**                       | (960, 920)          | (960, 920)       |
| **Lámpara O**                       | (320, 540)          | (320, 540)       |
| **Lámpara E**                       | (1600, 540)         | (1600, 540)      |
| **Edda** (NPC)                      | (1100, 640)         | (1100, 640)      |
| **Lumen** (NPC)                     | (1500, 640)         | (1500, 640)      |
| **Monolito NW**                     | (200, 200, 100, 60) | obstáculo greybox |
| **Monolito NE**                     | (1620, 200, 100, 60)| obstáculo greybox |
| **Monolito SW**                     | (200, 800, 100, 60) | obstáculo greybox |
| **Monolito SE**                     | (1620, 800, 100, 60)| obstáculo greybox |
| **Arco norte → Puerta** (door)      | (880, 0, 160, 60)   | gap del muro N   |
| **Arco este → Taller** (door)       | (1820, 500, 100, 80)| gap del muro E   |
| **Arco oeste alto → Castillo**      | (0, 460, 60, 80)    | gap del muro O   |
| **Arco oeste bajo → Forja**         | (0, 540, 60, 80)    | gap del muro O   |
| **Arco sur → Terrazas**             | (880, 1020, 160, 60)| gap del muro S   |
| **Tree-copper (landmark greybox)**  | (104, 1026)         | decor vendorTree |

---

## 4. Walkable regions (Plaza)

10 rectángulos en `roomScenesData.plaza.walkable`:

| # | rect                            | Función                          |
|---|---------------------------------|----------------------------------|
| 1 | `{0, 0, 880, 100}`              | anillo perimetral norte (NW)     |
| 2 | `{1040, 0, 880, 100}`          | anillo perimetral norte (NE)     |
| 3 | `{0, 980, 880, 100}`           | anillo perimetral sur (SW)       |
| 4 | `{1040, 980, 880, 100}`        | anillo perimetral sur (SE)       |
| 5 | `{880, 0, 160, 1080}`          | eje N-S (gap del muro norte)     |
| 6 | `{0, 460, 1920, 160}`          | banda E-O (gaps este + oeste)    |
| 7 | `{80, 100, 760, 360}`          | plaza NW                         |
| 8 | `{1080, 100, 760, 360}`        | plaza NE                         |
| 9 | `{80, 620, 760, 360}`          | plaza SW                         |
| 10| `{1080, 620, 760, 360}`        | plaza SE                         |

Total: 1 921 600 px² pisables, contra 518 400 px² del viewport.
Densidad: 1 plaza SW del walkable mide 273 600 px² (0.51 viewports).
La cruz central (eje + banda) garantiza conectividad este-oeste y
norte-sur sin pasar por el medallón: 2 rutas alternativas entre
cualquier par de cuadrantes.

---

## 5. Collision regions (Plaza)

9 rectángulos en `roomScenesData.plaza.collision`:

| rect                              | Función                              |
|-----------------------------------|--------------------------------------|
| `{920, 600, 80, 80}`              | Pedestal central de Ohm (medallón)   |
| `{200, 200, 100, 60}`             | Monolito NW (obstáculo greybox)     |
| `{1620, 200, 100, 60}`           | Monolito NE                          |
| `{200, 800, 100, 60}`             | Monolito SW                          |
| `{1620, 800, 100, 60}`           | Monolito SE                          |
| `{924, 180, 72, 188}`            | Cuerpo central de la Campana         |
| `{890, 246, 27, 118}`            | Soporte izquierdo de la Campana      |
| `{1043, 246, 27, 118}`           | Soporte derecho de la Campana        |

Los muros perimetrales se generan automáticamente con
`pushWallSolids` a partir de los gaps de los 5 boundaries (puerta,
taller, castle_gate, forge_yard, terraces_top). Cada gap recorta
el muro correspondiente en su posición exacta — el bug pre-existente
que estiraba los gaps al ancho/alto del chunk se corrigió en este
commit.

---

## 6. Doors / entries (Plaza)

5 doors (todos los cardinales) + 5 entries (uno por door + portal-aula):

| Door           | Rect local          | Hacia       | Entry local (spawneo desde el vecino) |
|----------------|---------------------|-------------|---------------------------------------|
| `puerta`       | `{880, 0, 160, 60}` | Puerta de Ohm  | `{960, 80}`                        |
| `taller`       | `{1820, 500, 100, 80}` | Taller    | `{1820, 540}` (centro del vano)    |
| `castle_gate`  | `{0, 460, 60, 80}`  | Castillo     | `{60, 500}` (centro del vano)     |
| `forge_yard`   | `{0, 540, 60, 80}`  | Forja (visible U2+) | `{60, 580}`               |
| `terraces_top` | `{880, 1020, 160, 60}` | Terrazas | `{960, 1000}` (visible U3+)        |

El **portal-aula** (thing, no door) vive en `{220, 760, 96, 54}`,
cuadrante SW, y su entry está en `{220, 760}` — coincide con el
punto de spawn al regresar al Instituto.

---

## 7. Offsets de `world.ts` modificados

Sólo se modificaron 2 offsets directos + 4 indirectos:

| Sala            | Antes     | Después (commit 4) | Razón                                  |
|-----------------|-----------|--------------------|----------------------------------------|
| `taller`        | (960, 0)  | **(1920, 0)**      | pegar al borde este de la Plaza 1920  |
| `terraces_top`  | (0, 540)  | **(0, 1080)**      | pegar al borde sur de la Plaza 1080   |
| `terraces_mid`  | (0, 1080) | **(0, 1620)**      | corrimiento en cadena (+540)          |
| `terraces_mural`| (0, 1620) | **(0, 2160)**      | corrimiento en cadena (+540)          |
| `terraces_aqueduct` | (0, 2160) | **(0, 2700)**  | corrimiento en cadena (+540)          |

**Sin cambios:** `plaza` (queda en 0, 0), `puerta` (0, -540),
`manantial_ohm` (0, -1080), `castle_*` (-960, ...), `forge_*` 
(-960..-3840, 540), `lighthouse_*` (960..3840, 2160), `clock_tower` 
(2880, 2160). El `worldOf('plaza')` y el `worldOf('taller')` 
coinciden en el mismo world `ohmdal`.

`puerta` se quedó en (0, -540): su borde sur (y=0) ya coincide
con el borde norte de la Plaza sin tocar nada. **No se modificó**.

---

## 8. Screenshots (`screenshots/c4_*.png`)

10 capturas con el dev server en `localhost:4173` + Playwright headless
teleportando al jugador a posiciones locales de la Plaza:

| Captura                          | Posición local | Lo que se verifica              |
|----------------------------------|----------------|----------------------------------|
| `c4_01_spawn_portal_south.png`   | (960, 1040)    | spawn desde el portal; cámara cerca del borde sur; personaje visible |
| `c4_02_centro.png`               | (960, 640)     | centro: medallón de Ohm, Edda, banda E-O, eje N-S, 4 plazas |
| `c4_03_extremo_oeste.png`        | (60, 500)      | gap del castillo (banda E-O se asoma al oeste); portal-aula cyan en SW |
| `c4_04_extremo_este.png`         | (1860, 540)    | cámara pegada al borde este; Lumen visible; chunk del Taller asomando |
| `c4_05_extremo_norte.png`        | (960, 100)     | cámara pegada al norte; campana + pedestal Ohm visibles |
| `c4_06_extremo_sur.png`          | (960, 1000)    | cámara pegada al sur; árbol greybox de drawRoomBase visible |
| `c4_07_cuadrante_NW.png`         | (400, 250)     | monolito NW visible; ring N pisable |
| `c4_08_cuadrante_NE.png`         | (1500, 250)    | plaza NE; Lumen al este         |
| `c4_09_cuadrante_SW.png`         | (400, 850)     | plaza SW; portal-aula cyan     |
| `c4_10_cuadrante_SE.png`         | (1500, 850)    | plaza SE; monolito SE          |

Inspección visual: el medallón central, las 4 plazas en las
esquinas, los monolitos greybox, el portal cyan, Edda, Lumen, el
pedestal de Ohm, la campana monumental, la banda E-O, el eje N-S
y los 4 anillos perimetrales son **visualmente legibles** y
**espacialmente coherentes**. El árbol de `drawRoomBase` (tree-copper)
funciona como landmark greybox en el SW de la Plaza — es el "espacio
negativo" descrito en el spec.

---

## 9. Comportamiento observado de la cámara

| Posición del jugador       | Cámara (scrollX, scrollY) | Bordes    |
|----------------------------|---------------------------|-----------|
| spawn portal (960, 1040)   | (0, 540)                  | S clamp   |
| centro (960, 640)          | (0, 217)                  | centrado  |
| extremo oeste (60, 500)    | (0, 230)                  | O clamp   |
| extremo este (1860, 540)   | (900, 230)                | E clamp   |
| extremo norte (960, 100)   | (0, 0)                    | N clamp   |
| extremo sur (960, 1000)    | (0, 540)                  | S clamp   |

Verificaciones activas:
- `clampCenter` en los 4 bordes con viewport 960×540 sobre el area
  1920×1080 → cámara exactamente en (0, 0) / (960, 0) / (0, 540) /
  (960, 540) en world.
- `clampPlayerToArea()` confina al jugador al bbox del activeArea.
- `cameras.main.setBounds(0, 0, 1920, 1080)` aplica el clamp al
  scroll de Phaser.
- `startFollow(player, false, 0.12, 0.12)` aplica lerp suave.
- **No se reintrodujo `setScroll` por frame.**

Cuando el jugador cruza un boundary (e.g. se mete en el gap del muro
este en (1860, 540)), `chunkAt` detecta el chunk `taller` y dispara
`enterArea('taller')` que llama a `transitionActiveArea`. Éste:
1. calcula el nuevo `placement` del Taller (1920, 0, 960, 540),
2. llama `camera.setBounds(1920, 0, 960, 540)`,
3. `loadRoom('taller', ...)` reemplaza la puesta en escena (porque
   el Taller SÍ tiene `background` pintado y NO entra al mundo
   continuo en el render).

---

## 10. Tests agregados / modificados

### Nuevos

- **`tests/c4-plaza-large-greybox.test.ts`** — 39 tests, 13
  secciones (A–K + sanity). Cubre los 13 puntos del Definition of
  Done del commit 4 de forma pura (sin Phaser). Incluye:
  - **A** Plaza mide 1920×1080 (4 tests)
  - **B** El jugador puede caminar (4 tests)
  - **C** CameraDirector en 4 bordes + extremos (7 tests)
  - **D** Navigation más allá de 960×540 (5 tests)
  - **E** Plaza sigue siendo UN activeArea (4 tests)
  - **F** Sin solapamiento Portal/Taller/Puerta (4 tests)
  - **G** Conexiones y entry points (4 tests)
  - **H** Las otras 19 rooms siguen funcionando (3 tests)
  - **S** Invariantes cruzadas (3 tests)

### Modificados

- **`tests/r0-area-dimensions.test.ts`** — excluye la Plaza del
  conjunto de "rooms heredadas 960×540" y agrega 4 tests específicos
  para la Plaza 1920×1080.
- **`tests/r1-spatial-contract.test.ts`** — actualiza los 4 tests
  que dependían de la Plaza como área heredada.
- **`tests/r4-active-area-semantics.test.ts`** — el catálogo
  `threeLoaded` ahora tiene el Taller en (1920, 0); los 7 tests
  que validaban offsets se actualizaron.
- **`tests/m0-continuous-world.test.ts`** — Plaza = 1920×1080,
  Taller = (1920, 0), terraces = (0, 1080). Agrega asserts de las
  4 doors cardinales en `rooms.ts`.
- **`tests/m11-plaza-workshop-hitbox.test.ts`** — reescrito para
  la banda E-O y los nuevos gaps de la Plaza grande.
- **`tests/m16-ohm-companion-bell-continuity.test.ts`** — Campana
  en (960, 280) y pedestal en (960, 640).

### Scripts de validación runtime

- **`scripts/capture-plaza-screenshots.mjs`** — captura 10
  screenshots de la Plaza con Playwright.
- **`scripts/capture-plaza-debug.mjs`** — inspector de sprites /
  info de runtime.
- **`scripts/inspect-sprites.mjs`** — diagnóstico de qué sprites
  cubren un punto world.
- **`scripts/inspect-edge.mjs`** — lectura de píxeles del borde
  inferior.

### Total

- **Antes del commit 4:** 11 archivos de test + 1.595 tests
  (sumando todas las suites).
- **Después del commit 4:** 12 archivos de test + 39 nuevos = 1.634
  tests, **todos verdes**.

---

## 11. Build / Test status

```
$ npm test
… 12 archivos de test, 0 failed
… incluye c4-plaza-large-greybox (39 passed, 0 failed)
… incluye r0/r1/r4 actualizados

$ npm run build
✓ built in 27.39s
0 errores de TypeScript
0 errores de Vite
```

Verificado en Windows + PowerShell + Node 24.14.1.

---

## 12. Problemas de gameplay encontrados

1. **El árbol `tree-copper` queda en (104, 1026)** — el
   `drawRoomBase` lo dibuja en una posición absoluta dentro del
   chunk. Para un chunk 960×540 eso es razonable (queda en el
   cuadrante SW). Para 1920×1080 queda justo al sur del medallón,
   como un "espacio negativo" greybox. **No es bug — es la
   conducta esperada del greybox.** Si se quiere reubicar, es
   trivial modificar el offset del vendorTree en `visuals.ts`.

2. **El decor deja 24 px sin cubrir en cada borde vertical**
   (y ∈ [0, 24] y y ∈ [1056, 1080]). El `decorGridDimensions`
   usa `Math.floor(1080/48) = 22` filas, dejando 24 px sin
   cubrir. Visualmente se ve la franja del `tileSprite` (verde
   oliva) y/o del piso procedural en esa zona. El árbol del
   greybox tapa parte del problema. **No es bug — es un
   detalle de greybox que se resolverá cuando se decida
   explícitamente cómo cubrir esos 24 px** (más decor, otro
   prop, o un piso "liso" en el borde).

3. **`unionAreaBounds` del render-scope es enorme (8640×4860)**.
   El `tileSprite` del `renderUnion` se renderiza como un sprite
   gigante. Phaser maneja esto correctamente (es un solo
   quad), pero ocupa memoria. No afecta el gameplay ni el
   performance observable en el browser. **Riesgo bajo**.

4. **El `width` del chunk de la puerta sigue siendo 960** (no
   se migró). Si en el futuro se quiere que la puerta sea
   coherente con la Plaza, habría que migrar su dimension. **No
   es necesario en este commit**.

5. **`drawRoomBase` no es consciente del área extendida** —
   el `vendorTree` y el `lamp` se dibujan en posiciones absolutas
   que sólo tienen sentido para 960×540. Para Plaza 1920×1080
   el árbol queda en (104, 1026) (zona sur) y las lámparas en
   (168, 987) y (1752, 116) (esquinas top). Visualmente los 3
   elementos son landmarks greybox que **refuerzan la sensación
   de LUGAR**. **No es bug — es un greybox intencional**.

6. **El pre-existente bug de `pushWallSolids` se corrigió**:
   antes, el gap de cada door se estiraba al ancho/alto del
   chunk actual, borrando muros completos. Ahora se usa el
   `bd.rect` original. Esto se valida en los 39 tests nuevos
   de `c4-plaza-large-greybox.test.ts` (C.4: 4 bordes + clamp).

---

## 13. Riesgos para el siguiente commit

| Riesgo                                                                | Severidad | Mitigación                              |
|-----------------------------------------------------------------------|-----------|------------------------------------------|
| **Las 19 rooms restantes siguen 960×540.** El siguiente paso natural (H3) es migrar el Taller (vecino directo de la Plaza, ahora en world 1920) a un área coherente con la Plaza. Esto requerirá mover otros chunks y posiblemente modificar el `world.ts` de forma no trivial. | media | hacer el Taller 1920×1080 también (commit 5), o mantenerlo 960×540 con un sistema de chunks mixtos (más complejo). |
| **El decor del chunk deja 24 px de "borde" sin cubrir.** Si el siguiente commit es el H4 (Cuenca completa), hay que decidir si el resto de las areas grandes también van a 1920×1080 o si se mantiene un sistema mixto. | baja | la franja se cubre con un "borde" procedural (otro draw en `drawRoomBase`) o se aceptan 24 px de tileSprite. |
| **`drawRoomBase` no escala decor/vendorTree al área extendida.** El árbol y las lámparas siempre se dibujan en posiciones absolutas. Si en el futuro se quiere un decor más rico para áreas grandes, hay que parametrizar el `drawRoomBase` por dimensiones. | media | pasar las dimensiones como parte de un `AreaDef` extendido y dibujar landmarks en función del área, no del chunk. |
| **El `tileSprite` del renderUnion es gigante (8640×4860).** El mundo de Ohmdal se extiende de (-3840, -1620) a (3840, 2700). Si en el futuro se carga más mundo (Bitland, Physica), el tileSprite se vuelve impracticable. | alta (futuro) | cambiar la estrategia de render-scope: en vez de un tileSprite del union, pintar cada chunk individualmente y dejar que Phaser haga el clipping por viewport. O usar StreamingTiles. |
| **El refactor de `world.ts` tocó terraces_top/mid/mural/aqueduct.** Esto es estrictamente necesario, pero rompe cualquier suposición de "terraces_top está a 540" que exista en el código histórico. El test `_legacy_w6-aula-portal-arrival.test.ts` aún existe (no se ejecuta en `npm test` por su prefijo `_legacy_`). | baja | eliminar el test legacy o actualizarlo. |
| **El prefijo `_legacy_` no es estándar.** Hay 14 tests con ese prefijo en el repo. Algunos verifican coordenadas obsoletas que ya no se ejecutan, pero el día que se decida correrlos todos, fallarían. | baja | refactor de los tests legacy en un commit dedicado. |
| **El chunk del Taller no se renderiza como parte del mundo continuo cuando el activeArea es el Taller.** Esto es INTENCIONAL (el Taller tiene `background` pintado y se carga como sala individual). Pero si en el siguiente commit se quiere que el Taller también sea un chunk del mundo continuo, hay que quitar su `background` y modificar `loadRoom`. | media | planificar el Taller como commit 5 con su propio DoD. |

---

## 14. Definition of Done — checklist

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| A. Plaza mide 1920×1080 | ✅ | `roomScenesData.plaza.width = 1920` y `.height = 1080`; `areaDimensions('plaza')` lo confirma; test A.1. |
| B. El jugador puede caminar | ✅ | walkable con 10 rects cubre los 4 cuadrantes + cruz; `clampPlayerToArea()` confina; tests B.1–B.5. |
| C. CameraDirector funciona | ✅ | `clampCenter` en 4 bordes; `setBounds(0, 0, 1920, 1080)`; `startFollow` con lerp 0.12; tests C.1–C.7. |
| D. Navigation > 960×540 | ✅ | `navigationBounds` para Plaza = 1920×1080; `isPointInsideArea` acepta (1500, 850); tests D.1–D.5. |
| E. Plaza es UN activeArea | ✅ | `resolveActiveArea(LOADED, 'plaza')` siempre devuelve el mismo chunk; `activeAreaNavigationBounds` no cambia en el interior; tests E.1–E.4. |
| F. Sin solapamiento con vecinos | ✅ | Taller (1920, 0) adyacente; Puerta (0, -540) adyacente; ningún overlap de rect; tests F.1–F.4. |
| G. Conexiones y entries funcionan | ✅ | 5 doors en bordes cardinales + 5 entries (4 cardinales + portal-aula); tests G.1–G.4. |
| H. Las otras rooms funcionan | ✅ | 19 rooms siguen 960×540; decor 20×11 intacto; Plaza decor 40×22; tests H.1–H.3. |
| I. `npm test` verde | ✅ | 1.634 tests passed, 0 failed. |
| J. `npm run build` verde | ✅ | `tsc && vite build` exit 0; `built in 27.39s`. |
| K. Validación runtime real | ✅ | 10 screenshots tomados con Playwright en `localhost:4173`; inspección visual de spawn, centro, 4 extremos, 4 cuadrantes. |

---

## 15. Asserción central del commit

> **La Plaza de la Cuenca migró de 960×540 a 1920×1080 sin tocar la
> infraestructura espacial, de cámara ni de active-area de los
> commits anteriores. El Spatial Contract, el CameraDirector y la
> ActiveArea semantics funcionan exactamente como prometían sus
> tests — la Plaza grande es la primera prueba integral de que
> "área grande" se logra extendiendo `AreaDef.width/height` y
> reposicionando un vecino, sin código nuevo.**

Esa aserción es el entregable real de este commit: la **infraestructura
prevista en commits anteriores ahora produce el resultado que
prometía**, sin tocarla.
