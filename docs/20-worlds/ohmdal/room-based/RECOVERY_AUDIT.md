# Ohmdal — RECOVERY_AUDIT

> ⚠ **HISTORICAL / DEEP-AUDIT REFERENCE**
>
> **NO LOAD BY DEFAULT.**
>
> Este documento es una **auditoría histórica** del runtime pre-room-based.
> No es contexto de implementación. NO debe ser leído por un agente que
> arranca una tarea Ohmdal. Para el estado operativo actual del runtime,
> leer [`CURRENT_STATE.md`](CURRENT_STATE.md) en su lugar.
>
> **Cuándo SÍ leerlo:**
> - arqueología de arquitectura (por qué algo es como es);
> - investigación de regresión (de dónde viene un bug);
> - disputa histórica sobre una decisión previa.
>
> **Cuándo NO leerlo:**
> - tarea normal de implementación;
> - bug local reproducible;
> - decisión de gameplay/contenido;
> - revisión de código de feature nueva.

---

> Auditoría de la implementación Phaser existente en `src/jugar/` con el
> objetivo de evaluar qué se conserva, qué se descarta y qué se refactoriza
> para construir el **Arco I completo como mundo de áreas/rooms con cámara
> móvil**, según el brief de Manuel.
>
> **Estado:** `WORKING_DRAFT` (no es canon). Es el insumo que precede al
> plan de refactor. Cualquier decisión material que se desprenda de este
> audit requiere ratificación de Manuel.
>
> **Auditado:** `src/jugar/*`, `src/state.ts`, `src/puzzles/*`,
> `src/experiences/ohmdal/topdownRuntime.ts`, `docs/20-worlds/ohmdal/**`.

---

## 0. Resumen ejecutivo

El runtime Phaser de `/jugar` ya **no asume literalmente "1 sala = 1
viewport 960×540"** como regla arquitectónica: tiene un sistema de
**mundo continuo por chunks** (`WORLDS`, `Boundary`, `pushWallSolids`,
`startFollow`) que ya se usa para ciertos grupos de salas (las que
**no** tienen fondo pintado). Sin embargo, la **mayoría** de las 20
salas registradas todavía son salas pintadas de 960×540 con un PNG de
fondo y colisiones horneadas, y todo el sistema se inicializa en
`width: 960, height: 540`. Por eso la sensación dominante sigue siendo
"muchas pantallas chicas", aunque por debajo haya una geografía continua.

La buena noticia: casi todo lo que el brief pide ya tiene semillas en el
código. La refactorización es **evolución del sistema existente**, no
reescritura desde cero.

La decisión que **no es técnica** y debe quedar explícita: el brief de
Manuel contradice materialmente la dirección declarada en `ROADMAP.md`
(la cual establece que el `/jugar` debe conservarse como baseline de
regresión y la dirección de producción es **HD-2D en `src/hd2d-ohmdal/`**).
Ver §11.

---

## 1. Lo que el código ya tiene (reutilizable tal cual o con adaptaciones)

### 1.1 Sistema de mundo continuo por chunks — `src/jugar/world.ts` y `ExplorationScene`

- Existe un `WorldLayout` con salas y offsets `(ox, oy)` en un único plano.
- Existe un único `WORLDS[0]` registrado: `ohmdal`, con offsets para las
  20 salas en un plano global.
- `worldOf(roomId)` resuelve a qué mundo pertenece una sala.
- `chunkRect`, `chunkAt`, `chunkCenter` ya operan con offsets globales.
- `Boundary` representa las aberturas entre chunks vecinos (puertas del
  mundo continuo).
- `pushWallSolids` recorta los pasos abiertos en las murallas de cada
  chunk, calculando las bandas sólidas (`B = 26 px`) que el jugador no
  puede cruzar excepto por la abertura.
- `enterChunk` cambia la "sala activa" sin recargar el mundo, conservando
  la posición global del jugador y la cámara.
- La cámara ya hace `setBounds(minX, minY, maxX-minX, maxY-minY)` sobre
  la unión de chunks cargados y `startFollow(this.player, false, 0.12, 0.12)`
  con lerp suave.

**Evaluación:** arquitectura correcta y utilizable. El único límite
duro es que **todos los chunks son 960×540** porque `RoomDef` no
declara `width`/`height` y `W`/`H` son constantes globales.

### 1.2 Datos de sala — `src/jugar/roomScenesData.ts`

- `RoomSceneProfile` ya tiene todos los conceptos que el brief pide,
  formalizados a 960×540:
  - `walkable`: rectángulos transitables (unión).
  - `collision`: obstáculos sólidos horneados.
  - `doors`: rectángulos de puertas en la sala local.
  - `entries`: spawns seguros por origen.
  - `things`: posición, prop horneado, alias de interacción.
  - `effects`: glow / pulse / mist / water / embers / dust / sprite
    condicionales a flags (`backgroundWhen`, `effect.flag`).
  - `perspective`: escala interpolada por Y.
- Las veinte salas están completas: Plaza, Taller, Puerta, Manantial,
  Castillo (gate/gallery/branches/heart), Forja (yard/infirmary/
  longchannel/hall), Terrazas (top/mid/mural/aqueduct), Faro (hall/
  bench/clock_tower/lantern).
- Separación limpia: `roomScenesData.ts` no importa assets `?url`,
  importable desde tests Node sin pasar por Vite.

**Evaluación:** contrato de datos excelente. Sólo necesita un campo
adicional (`width`, `height`) y la posibilidad de que las coordenadas
locales crezcan más allá de 960×540.

### 1.3 Estado, flags, hooks, save — `src/state.ts`

- `state.room`, `state.flags` y los 80+ flags existentes (Progreso del
  Arco I, Prólogo, Vertical Slice) están todos bien definidos.
- `hooks.refresh`, `hooks.goto`, `hooks.travel` ya son la API que el
  runtime expone hacia la lógica de puzzles.
- `setFlag`, `save`, `load` con localStorage (`roxana-slice-v1`).
- `resolverSala` cae a `SALA_INICIAL` si una sala no existe.

**Evaluación:** usable. Sólo requiere una nueva propiedad
`state.world` (o `state.area`) que represente el estado global del
mundo del jugador en el Arco I (qué área está restaurada, qué
transición se vio, etc.), y probablemente un esquema de "región con
estado" (§5).

### 1.4 Modelos de puzzle renderer-neutral — `src/puzzles/*.ts`

- 20+ puzzles tienen su **modelo puro** separado de la presentación:
  - `ohmmodel.ts` / `ohmmodel.ts` (continuidad)
  - `frenoModel.ts`, `puertaModel.ts`, `bell.ts`, `chain.ts`,
    `branches.ts`, `distributor.ts`, `timbre.ts`, `warmth.ts`,
    `infirmary.ts`, `longchannel.ts`, `forge.ts`, `steps.ts`,
    `fairsplit.ts`, `singlestone.ts`, `ladder.ts`, `storedspark.ts`,
    `sleepingriver.ts`, `clock.ts`, `lighthouse.ts`, etc.
- Cada modelo es testeable en `tests/ohmdal-arco1-*.test.ts` con
  `node --experimental-strip-types` (ver scripts/run-tests.mjs).
- El runtime (`src/jugar/rooms.ts`) sólo orquesta: dispara el modelo,
  refleja el resultado en flags, y `hooks.refresh()` actualiza la
  escena.

**Evaluación:** ninguno de los modelos depende del viewport ni del
tamaño de chunk. Son la verdad pedagógica y se conservan tal cual.

### 1.5 Tiles, decor, atlas — `src/jugar/tiles.ts`, `decorData.ts`

- `ATLASES` define spritesheets de decor (medieval-ground/walls/props,
  trees-bushes, town-props) reutilizables.
- `renderDecor` recorre capas (`above`/`below`) con grid y leyenda.
- `preloadDecorAtlases` y `applyNearestFilter` están en el `preload`
  de la escena.

**Evaluación:** reusable. Las áreas más grandes pueden componerse con
el mismo atlas. Si una macroárea mide 2400×1620 con la misma escala de
48 px por tile, hay 50×34 = 1700 tiles disponibles. Es viable.

### 1.6 Cámara, luces, oscuridad — `src/jugar/visuals.ts`, `ExplorationScene`

- `ensureTextures` genera glow, sombra, polvo, viñeta por código.
- `darkness` es un overlay con `setScrollFactor(0)` que se anima al
  cambiar de mood.
- `playerHalo` y `hlRing` ya dan feedback luminoso.
- `AMBIENT` mapea mood → alpha de penumbra.
- `playAwakening` (en `awakening.ts`) ya hace zoom-in/out, flash,
  chispas y music swap para el WOW moment.

**Evaluación:** base sólida. Falta:
- dead zones explícitas en `startFollow`;
- modo "cinemática" que libere la cámara del follow;
- "encuadre autoral" por área (zoom, offset intencional);
- waypoints de cámara entre áreas.

### 1.7 World map debug — `ExplorationScene.toggleMap`

- Ya existe un `mapLayer` (Container) que se muestra con tecla `M`,
  con un pergamino `ohmdal-map-panel` y nodos que renderizan salas
  visitadas. Está embrionario pero la tecla y el container existen.

**Evaluación:** muy buen punto de partida. Le falta mostrar el
grafo de conexiones, el área actual, las regiones con su estado, y
ser configurable por modo (GREYBOX/PAINTED).

### 1.8 Transición de entrada — fadeIn + showRoomBanner

- `cameras.main.fadeIn(240, 7, 8, 16)` y un banner `roomName` con
  tween de entrada/salida.
- `doorCooldown = 700` evita el rebote por atravesar una puerta
  dos veces en el mismo frame.

**Evaluación:** base. Falta el contrato unificado de "transición
entre áreas" (fade / doorway / occlusion / cinematic) y un sistema
de eventos que se dispare antes y después.

### 1.9 Continuity / persistence

- `state.flags.salasVisitadas[]` se actualiza en cada `loadRoom`.
- `state.flags.ohmAwake`, `castleRestored`, `forgeRestored`,
  `valleyRestored`, `lighthouseRestored` ya forman el esqueleto de
  "estado por región".

**Evaluación:** los flags existen, pero están sueltos. Falta un
modelo explícito de "región con estado DETERIORATED →
INTERVENTION → UNDERSTOOD" que sea consultable y testeable.

---

## 2. Lo que está acoplado a la regla "1 sala = 1 viewport 960×540"

| Lugar | Acoplamiento | Impacto | Acción |
|---|---|---|---|
| `ExplorationScene.ts:35-36` | `export const W = 960; export const H = 540;` | Constantes globales importadas por `awakening.ts`, `topdownRuntime.ts`, `roomScenes.ts`, `decorData.ts` | Reemplazar por un `Viewport` configurable por área |
| `roomScenesData.ts` | Coordenadas locales siempre dentro de `[0..960] × [0..540]` | Las salas pintadas y sus `walkable`/`doors` asumen lienzo fijo | Permitir `(width, height)` por sala, validar rangos |
| `world.ts` | `rooms: Record<string, { ox: number; oy: number }>` con offsets 960×540 entre vecinos | Mundo continuo a 960×540 | Cambiar a `Record<string, AreaRef>` con `width/height` y `ox/oy` derivados |
| `topdownRuntime.ts:33-34` | `new Phaser.Game({ width: W, height: H, ... })` | El juego se inicializa a 960×540 | El viewport debe seguir siendo ~960×540 (lógico), pero el mundo debe ser más grande |
| `visuals.ts:59,106` | `ensureTextures(scene, w, h)` usa W×H para la viñeta | Viñeta funciona a cualquier tamaño, pero la firma obliga a pasar W×H | Hacer la firma `(scene, viewportW, viewportH)` |
| `tiles.ts:24-26` | `CELL = 48; COLS = 20; ROWS = 11;` (20×11 = 220 tiles a 48 = 960×528) | El grid de decor está hardcoded | Generalizar a `cols, rows` derivados de `width/height` |
| `ExplorationScene.ts:580-585` | `for (const [cid, off] of Object.entries(this.chunks)) { this.buildChunk(cid, off.ox, off.oy, ...); }` | Construye cada chunk a 960×540 con su offset | Reemplazar `buildChunk(cid, area)` con `width/height` |
| `pushWallSolids` | `strips` siempre a `B/W/H` (4 bandas de 26 px en bordes de 960×540) | Funciona, pero cada chunk se trata como 960×540 | Generalizar para bandas proporcionales al chunk real |
| `awakening.ts:30` | `flash: rectangle(W/2, H/2, W*1.4, H*1.4, ...)` con scrollFactor(0) | Depende de W×H para el flash | El flash es siempre del viewport, no del área; OK pasarlo a viewport |
| Painted backgrounds (`roomScenes.ts`) | 24 PNGs 960×540, uno por sala con flag | El arte está horneado a ese tamaño | Estos PNGs siguen siendo la fuente visual para la fase PAINTED, pero la fase GREYBOX los reemplaza por geometría procedural |
| `decorData.ts` | Grids `string[11]` de ancho 20 | Coincide con 960×540 a CELL=48 | Generalizar (ver §6) |
| `ROOM_BACKGROUND_FILES` (24 entradas) | 1 imagen = 1 sala | El brief pide "1 fondo grande" o "varios segmentos" para áreas grandes | El contrato de imagen debe ser `(areaId, variant) → imageKey`; las áreas multi-imagen se componen con `load.image` por chunk técnico |

**Resumen:** nada de lo acoplado a 960×540 es conceptual, todo es
mecánico. La refactorización es posible sin tirar el contenido.

---

## 3. Deuda técnica y patrones a revisar

1. **`rooms.ts` es un megafile (128 KB, ~2700 líneas)**: concentra
   puzzles, narrativa, transiciones y room defs. Conviene separar en
   `roomDefs.ts` (datos), `roomInteractions.ts` (orquestación de
   puzzles), `dialogFlows.ts` (guion) y `regionGraph.ts` (grafo).

2. **Coordinate coupling**: la posición local de cada `walkable`,
   `door`, `entry`, `thing` está pensada para 960×540. Cuando una
   sala crezca (p. ej. Plaza a 1920×1080), las coordenadas siguen
   siendo locales; sólo cambia el `width/height` del chunk. Pero hay
   que validar que las coords no excedan los nuevos límites.

3. **`RoomDef.background` como single 960×540 PNG**: el contrato actual
   dice "sala cerrada pintada: el fondo llena el chunk 960×540 y
   desactiva el mundo continuo". Esto obliga a tratar Taller, Forja
   Hall, Faro Hall, etc. como salas individuales. Para convertirlas
   en macroáreas hay que cambiar el contrato: una `Area` puede tener
   `mode: 'procedural' | 'painted' | 'hybrid'`, y en `painted` el
   tamaño de la imagen es `width × height` del área (no 960×540).

4. **No existe modelo de "región" o "macroárea"**: las 20 salas son
   planas, sin agrupación semántica superior. Los flags de progreso
   (`castleRestored`, `forgeRestored`, etc.) son las únicas señales
   de región. El refactor debe introducir un `RegionId` y un modelo
   de estado por región.

5. **No hay dead zones de cámara, ni encuadre autoral, ni modo
   cinemática**: la cámara hace `startFollow` directo. Para Pokémon
   FireRed / LeafGreen style es necesario un sistema de dead zones
   (rect de "no scroll") y la posibilidad de liberar la cámara para
   cinemáticas.

6. **No existe modelo de "Technical Chunk"**: el `world.ts` ya tiene
   `WORLDS[0].rooms` con offsets, pero no hay partición interna de
   streaming/culling separada del chunk narrativo. Esto se puede
   construir como una capa de "Technical Chunks" opcional que se
   derive del `width/height` del área.

7. **No hay infraestructura de cinemáticas**: existen tween ad-hoc
   (`playAwakening`, `showRoomBanner`), pero no un `Cinemática` con
   contrato unificado (commit world state → lock input → play →
   load resulting state → restore).

8. **World map debug es embrionario**: el Container existe, el panel
   existe, pero no muestra grafo de conexiones ni estado por región.

9. **Tests existentes asumen 960×540 implícitamente** vía coordenadas
   hardcoded en `walkable`/`collision` (ver `f1-forge-rooms.test.ts`,
   `l1-lighthouse-rooms.test.ts`, `t1-terraces-rooms.test.ts`).
   Refactor compatible: esos tests no deberían romperse si las
   coordenadas locales siguen siendo válidas dentro de la nueva
   `width/height`.

10. **PuzzlesRenderer está acoplado a `__game` global** (ver
    `awakening.ts`, `rooms.ts:121-122`): el runtime accede a
    `window.__game.scene.getScene('explore')` desde dentro de
    `abrirXxx()`. Funciona pero es frágil. La refactorización debería
    pasar a un `CinemáticaContext` o un `Director` que reciba la
    escena activa.

---

## 4. Qué se reusa sin tocar

- ✅ `package.json` (sin nuevas dependencias, sin upgrade de Phaser).
- ✅ Modelos puros de puzzles (`src/puzzles/*Model.ts`).
- ✅ `RoomSceneProfile` (con un campo `width`, `height` adicional).
- ✅ `WORLDS[0]` de `world.ts` (cambia la forma, no los IDs).
- ✅ `Boundary` y `pushWallSolids` (cambia la firma para aceptar
  `width/height`).
- ✅ `state.flags` (se agregan flags nuevos, no se borran).
- ✅ `assets/ohmdal/rooms/pilot-arco1/*` (siguen siendo válidos para
  la fase PAINTED; la fase GREYBOX los ignora o los reemplaza con
  geometría procedural).
- ✅ El árbol de assets `tilesets/` y `decorData.ts` (generalizado).
- ✅ Tests de puzzles renderer-neutral.
- ✅ El árbol `src/puzzles/` y los modelos `src/ohmdal-arco1/`.

---

## 5. Qué se descarta explícitamente (en este refactor)

| Categoría | Lo que se descarta | Motivo |
|---|---|---|
| La regla "1 sala = 1 viewport 960×540" | como invariante global | El brief la invalida; se mantiene como **default de escala de viewport lógico** (≈960×540) pero ya no es la dimensión del chunk. |
| El HD-2D Three.js como "dirección de producción vigente" | **para esta tarea**. ROADMAP y START_HERE lo declaran vigente global, pero el brief lo contradice. Ver §11. | El brief es una decisión material de Manuel; debe quedar registrada. |
| La idea de mantener `/jugar` como "baseline de regresión pasivo" | en favor de "arquitectura definitiva del Arco I" en `/jugar` | Decisión de Manuel; ver §11. |
| La pre-existencia de 20 salas cerradas con fade entre cada una | como "partición definitiva" del mundo | El brief pide **fusionar** salas que pertenecen a una misma macroárea. |
| El tree `src/ohmdal-arco1/` (HD-2D Three.js) | **no se descarta** del repo, pero se saca de la ruta crítica de esta tarea | Esta tarea opera sobre `src/jugar/`; el árbol HD-2D queda intacto para futuro. |
| El plan "overworld + dioramas" de `arcol-rebuild/02-world-topology.md` | como guía de topología para esta tarea | Su modelo de dioramas discretos contradice el brief (que pide áreas con cámara móvil, no cargas/descargas de dioramas). Se puede tomar como **referencia conceptual** del atlas, no de la arquitectura. |

---

## 6. Lo que se construye desde cero (este refactor)

1. **`AreaDef`** y **`RegionDef`** en `src/jugar/areas/`:
   - `AreaDef = { id, name, regionId, worldX, worldY, width, height, mode, background?, walkable, collision, doors, entries, things, effects, perspective, camera, ... }`.
   - `RegionDef = { id, name, worldBounds, areas, landmarks, regionState, ... }`.
   - `RegionState = 'DETERIORATED' | 'INTERVENTION' | 'UNDERSTOOD'`.

2. **`AreaGraph`** (mapa lógico de áreas + transiciones):
   - Tipo: `Record<AreaId, { to: AreaId[], kind: 'walk' | 'door' | 'cinematic' | 'locked', lock?: RegionId }>`.
   - Genera el room graph Mermaid del brief.

3. **`SpatialMap`** (mapa físico):
   - Tipo: `Record<RegionId, { worldX, worldY, width, height, areas, floor }>`.
   - Permite visualizar regiones como cajas en un canvas de mundo.

4. **`CameraDirector`** en `src/jugar/camera/`:
   - `follow(player, areaBounds, deadZone, deadZoneScaleX, deadZoneScaleY)`.
   - `panTo(target, ease, ms)`.
   - `lockForCinematic()` / `unlockFromCinematic()`.
   - `encuadre(areaId)` (zoom + offset intencional por área).
   - `cinematicKeyframes(seq)`.

5. **`TransitionDirector`** en `src/jugar/transitions/`:
   - `fade(ms)`, `doorway(areaId, side)`, `occlusion`, `cinematic(hookId)`.
   - Hooks: `before`, `lock`, `play`, `commit`, `unlock`, `after`.
   - Skip y fallback obligatorio en cinematic.

6. **`WorldState`** (modelo por región) en `src/jugar/worldState.ts`:
   - `getRegionState(regionId)`, `setRegionState(...)`, `subscribe(...)`.
   - Conectado a `state.flags` (migración de flags sueltos a `regionState` por región).

7. **`RenderMode`** (`GREYBOX` | `PAINTED`):
   - Default runtime: `GREYBOX` (procedural con rectángulos, landmarks, labels).
   - `PAINTED` usa los fondos actuales.
   - Toggle desde URL `?render=greybox|painted` y tecla `G`.

8. **Greybox renderer** (`src/jugar/greybox/`):
   - Por área: `floor`, `walls`, `landmarks`, `paths`, `regions`, `NPC anchors`, `doorways`, `exits`.
   - Datos desde un `greyboxManifest.json` o computed de `AreaDef`.

9. **Debug tools** (`src/jugar/debug/`):
   - HUD existente: `H` hitboxes, `M` world map.
   - Nuevos: `B` region state, `L` landmarks, `C` camera, `R` render mode, `K` cinematic hooks.
   - World map debug: canvas con macroáreas, posición actual, conexiones, regiones con estado.

10. **Cinematic infrastructure** (`src/jugar/cinematics/`):
    - `Cinema` API: `play(hookId, { commit, restore, skip, fallback })`.
    - Catálogo vacío de hooks; el primer hook productivo es `awakening`
      (reencarna `playAwakening`).
    - Nunca contiene estado indispensable: si la cinematic falla, el
      mundo se queda en el estado committed antes de `play`.

11. **Tests nuevos** en `tests/`:
    - `r0-areas-graph.test.ts`: `AreaGraph` connectivity (Portal →
      Faro alcanzable), `locks` respetados.
    - `r1-region-states.test.ts`: `WorldState` transiciones
      DETERIORATED → INTERVENTION → UNDERSTOOD.
    - `r2-camera-bounds.test.ts`: la cámara nunca sale de bounds.
    - `r3-cinematic-skip-fallback.test.ts`: skip y fallback sin
      corromper estado.
    - `r4-arc1-critical-path.test.ts`: Portal → Plaza → Taller →
      Calzada → Puerta → Manantial → Castillo → Forja → Terrazas →
      Lago → Faro alcanzable.
    - `r5-render-mode.test.ts`: toggle `GREYBOX`/`PAINTED`.

12. **Documentación por macroárea** en
    `docs/20-worlds/ohmdal/room-based/areas/`:
    - Una ficha por macroárea con el formato pedido por el brief.

13. **`ARC1_ROOM_GRAPH.md`** y **`ARC1_SPATIAL_MAP.md`** (o `.json`):
    Mermaid + bounding boxes, con un render del world map.

---

## 7. Propuesta de macroáreas (no definitiva, sujeta a ratificación)

Pendiente de discusión con Manuel. La propuesta preliminar basada en
el brief, el GDD del Arco I (`ohmdal-arc-01_v1.md`) y la auditoría de
las 20 salas existentes:

| ID | Macroárea | Salas originales que se fusionan (o se mantienen) | Capítulo | Modo de render |
|---|---|---|---|---|
| `area_plaza_cuenca` | Plaza + Portal + Camino | `plaza` (mucho más grande, con portal al sur, taller al este, calzada al norte, puerta de ohm al fondo) | Prólogo + 1 | greybox / painted (cuando exista arte) |
| `area_taller` | Taller de Lumen (interior) | `taller` | 1 | painted (es un interior cerrado) |
| `area_calzada` | Calzada + Puerta monumental | `puerta` (extendida) | 1 | painted o greybox |
| `area_manantial` | Manantial + Calzada al lago | `manantial_ohm` (extendida hacia arriba) | 1 | painted (escenario icónico) |
| `area_castillo_ext` | Patio del Castillo + Galería | `castle_gate`, `castle_gallery` | 2 | painted |
| `area_castillo_int` | Ramales + Corazón | `castle_branches`, `castle_heart` (interior) | 2 | painted |
| `area_forja` | Patio + Enfermería + Canal Largo + Nave | `forge_yard`, `forge_infirmary`, `forge_longchannel`, `forge_hall` | 3 | painted o greybox |
| `area_terrazas` | Las Terrazas (escalonadas) | `terraces_top`, `terraces_mid`, `terraces_mural`, `terraces_aqueduct` (gran área vertical) | 3 | painted (RGP) |
| `area_lago` | Lago + Acueducto + Muelle | parte sur de `terrazas_aqueduct` + zona nueva del lago | 4 | greybox + landmarks |
| `area_faro` | Faro + Reloj + Linterna | `lighthouse_hall`, `lighthouse_bench`, `clock_tower`, `lighthouse_lantern` | 4 + Epílogo | painted |

**Fusiones explícitas que el brief sugiere:**

- `terraces_top + terraces_mid + terraces_mural + terraces_aqueduct`
  pueden ser **un único gran área vertical** si la jugabilidad
  escala (escalinatas, terrazas, compuertas, mural, acueducto en una
  sola zona). Mantener la separación actual implica más transiciones
  sin razón espacial.
- `forge_yard + forge_infirmary + forge_longchannel + forge_hall` se
  puede mantener como corredor industrial de un solo área, **o** se
  puede quedar como 2 áreas (Yard+Enfermería vs. Canal Largo+Nave)
  según cuánto arte justifique la separación.
- `lighthouse_hall + lighthouse_bench + clock_tower + lighthouse_lantern`
  puede ser un único "complejo Faro" con sub-rooms transitables; el
  brief sugiere un Faro como destino coherente, no como 4 pantallas.

**Decisión:** esta propuesta es un input para Manuel. Se materializa
en `ARC1_ROOM_GRAPH.md` y `ARC1_SPATIAL_MAP.md` después de la
ratificación.

---

## 8. Cámara — diseño propuesto

- Viewport lógico del juego: 960 × 540 (Phaser `W`/`H`).
- `CameraDirector` envuelve `cameras.main`:
  - `follow(player, { worldBounds, deadZone, leadX, leadY, lerpX, lerpY })`.
  - Dead zone: rect dentro del viewport donde el jugador puede moverse
    sin arrastrar la cámara. Default: 60% del viewport centrado.
  - Lead: el jugador sesga la cámara en la dirección de su movimiento
    (mirar hacia adelante), con suavizado.
  - Lerp X/Y independientes.
  - `setBounds(areaBounds)`: la cámara no sale del rect del área.
  - `encuadre(areaId)`: por área, una configuración de zoom + offset
    intencional (p. ej. Manantial zoom out 10% para mostrar el
    estanque).
  - `panTo({ x, y }, ms, ease)`: libera la cámara y la mueve a un
    punto durante una cinemática.
  - `lockForCinematic()` / `unlockFromCinematic()`: durante una
    cinemática la cámara no sigue al jugador.
  - `restoreFromCinematic(duration)`: vuelve al follow con un
    smoothing corto (300–500 ms).

---

## 9. Transiciones — diseño propuesto

| Caso | Tipo | Implementación |
|---|---|---|
| Caminar dentro del mismo área (de Plaza Sur a Plaza Norte) | (ninguna) | Cámara sigue al jugador. Sólo se actualiza el banner de zona. |
| Cruzar la muralla entre dos chunks del mismo área (cuando aplique) | doorway (muro compartido) | `doorway` ya implementado en `Boundary` + `pushWallSolids`. Sin fade. |
| Entrar/salir de un interior (Plaza → Taller) | doorway + fade corto | `fadeIn/Out` 220 ms + `doorway` con sonido de puerta. |
| Cambio de distrito (Plaza → Castillo) | doorway + fade + sound sting | `fadeIn/Out` 320 ms + sting de zona. |
| Cambio geográfico grande (Terrazas → Lago) | cinematic corto | 2-3 s de pan, sin input, sin perder estado. |
| Puerta monumental (Puerta de Ohm) | cinematic + estado | 3-4 s, revela la calzada, la luz cambia. |
| Portal (Instituto → Ohmdal) | cinematic largo | 5-7 s de entrada al mundo, fija el primer encuadre. |

Reglas:
- **No** se introduce fade simplemente porque el jugador llegó al
  borde del viewport.
- Toda transición **committea** el `state` antes de iniciar y
  **restaura** la cámara después.
- Toda cinematic tiene **skip** (Esc o Space) y **fallback**
  (audio ambiente y banner informativo si el video/asset falla).

---

## 10. World state — diseño propuesto

```text
type RegionId = 'cuenca' | 'castillo' | 'forja' | 'terrazas' | 'faro';
type RegionState = 'DETERIORATED' | 'INTERVENTION' | 'UNDERSTOOD';
type WorldState = {
  currentArea: AreaId;
  currentRegion: RegionId;
  regions: Record<RegionId, RegionState>;
  flags: Flags;        // compatibilidad con state.flags
  bitacoraEntries: string[];
};
```

Transiciones:

| Región | DETERIORATED | INTERVENTION | UNDERSTOOD |
|---|---|---|---|
| cuenca | inicio | tras visitar Taller | tras `puertaDone` + despertar Ohm |
| castillo | tras cruzar `castle_gate` | tras hablar con Consejera | tras `castleRestored` |
| forja | tras `unit2Completed` | tras `solvedWarmChannel` | tras `forgeRestored` |
| terrazas | tras `unit3Completed` | tras hablar con Guardiana | tras `valleyRestored` |
| faro | tras `unit4Completed` | tras hablar con Farero | tras `lighthouseRestored` |

Suscripciones: las áreas afectadas se reconstruyen (`hooks.refresh()`)
cuando cambia el estado de su región.

---

## 11. ⚠ Tensión material con la dirección canónica vigente

`ROADMAP.md` y `docs/START_HERE.md` declaran **vigente** lo siguiente:

1. **HD-2D Three.js (`src/hd2d-ohmdal/`) es la dirección de producción
   de Ohmdal.**
2. **`/jugar` debe conservarse como baseline de contenido y regresión.**
3. **`/jugar` no debe recibir la nueva dirección visual por inercia.**
4. **H2 (Plaza HD-2D de verdad) es el foco actual.**

El brief de Manuel contradice los cuatro puntos: pide explícitamente
transformar `/jugar` en la **arquitectura definitiva** del Arco I con
cámara móvil, áreas > viewport, world state y cinemáticas, en Phaser
4, y **NO** volver a Three.js/Babylon/Godot.

Esto **no es una decisión técnica**, es una **decisión de producto**
que:

- cambia la dirección visual de la campaña 2 del proyecto;
- redefine qué cuenta como "producción" y qué como "baseline";
- invierte el árbol de foco (Plaza HD-2D → Plaza Phaser multi-área);
- requiere reescribir parte de los `arcol-rebuild/*` (overworld +
  dioramas) y de la documentación `CANON` que dice "Three.js es la
  dirección".

**Por AGENTS.md §3 regla 15, este tipo de decisión se escala a
Manuel. Por la misma regla, Manuel (el usuario) ya la tomó
explícitamente al escribir el brief.** Procedo a documentarlo y a
requerir ratificación explícita antes de iniciar el refactor mayor
del §6. Mientras tanto, el audit se conserva como insumo.

**Implicaciones downstream (no técnicas, de governance):**

- `docs/20-worlds/ohmdal/AGENTS.md` debería recibir un ADR
  explícito ("Phaser multi-área gana como dirección de producción
  del Arco I; HD-2D queda como experimento paralelo"). Ese ADR
  debe ser `CANON` o `PROPOSED` con fecha y autor.
- `ROADMAP.md` debe actualizar H2, H3 y posiblemente H4-H7.
- `arcol-rebuild/02-world-topology.md` y `arcol-rebuild/03-hd2d-
  greybox-build.md` deben re-marcarse como "referencia conceptual,
  no plan de producción".
- `docs/20-worlds/ohmdal/AGENTS.md` línea 55 ("/jugar no recibe la
  nueva dirección visual por inercia") debe actualizarse o
  dejarse como `LEGACY` con un puntero al ADR.

---

## 12. Definition of Done de esta fase (de acuedo al brief)

Se considerará terminado el refactor cuando se pueda jugar, en
**modo GREYBOX**, el camino:

```text
Portal → Plaza → Ohm (despertar) → Taller → Calzada → Puerta →
Manantial → Castillo → Forja → Terrazas → Lago → Faro → cierre del
Arco I
```

con las siguientes propiedades:

- áreas con dimensiones que justifican cámara móvil (no todas
  quedan en 960×540);
- cámara con dead zones, encuadre autoral, modo cinemática;
- transiciones sólo donde aportan (exterior↔interior, distrito,
  geográficas, puertas monumentales, portal);
- world state por región con transiciones observables;
- revisita: una zona restaurada cambia (NPC, paths, sonidos,
  documentación);
- cinemáticas con skip y fallback;
- debug tools: HUD + world map;
- tests: critical path, exits, locks, cámara bounds, render
  mode, cinematic skip;
- una ficha por macroárea en
  `docs/20-worlds/ohmdal/room-based/areas/`;
- Mermaid room graph + spatial map documentados;
- `npm run build`, `npm test`, `npm run verify` verdes;
- **el juego se juega de punta a punta, no sólo compila**.

**Prohibido en esta fase:** producir masivamente fondos HD,
videos finales, iluminación cinemática, animaciones pulidas. El
éxito es **espacial**, no visual.

---

## 13. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Romper los 70+ tests existentes al cambiar la forma de `RoomDef` | Mantener `RoomDef` con campos opcionales (`width?: number`). Si no se especifica, default 960×540. Tests existentes siguen pasando. |
| La Plaza "extendida" (1920×1080) tiene walkable/doors escritos a 960×540 | Reescribir SOLO los `walkable`/`doors`/`entries` de las salas que se fusionan; el resto no se toca. |
| La cámara se sale del área | Tests de bounds + asserts en runtime + debug overlay. |
| Cinemática corrompe el estado | Commit antes de `play`; restore con try/finally. Test de fallback. |
| Producción de assets para GREYBOX | Cero: rectángulos + colores planos + labels. |
| Decisión de fusión de áreas (Terrazas) rompe el pacing probado | Decisión ratificada con Manuel antes de implementar. |
| Macroárea grande (Terrazas 2400×1620) afecta performance | Technical Chunks opcionales; no se perciben. |

---

## 14. Próximos pasos inmediatos

Una vez ratificada la dirección (ver §11), los próximos pasos son:

1. **Crear el `AreaDef` y el `RegionDef`** como tipos puros, sin tocar
   el código Phaser todavía.
2. **Generar `ARC1_ROOM_GRAPH.md`** (Mermaid) con la propuesta de
   macroáreas + locks.
3. **Generar `ARC1_SPATIAL_MAP.md`** (o `.json`) con bounding boxes
   en el plano de mundo.
4. **Validar la propuesta con el brief del Prólogo + Arco I**:
   Prólogo, Cap 1, Cap 2, Cap 3, Cap 4, Epílogo. ¿Las 10
   macroáreas soportan los beats narrativos?
5. **Refactor incremental** en commits pequeños:
   - commit 1: `AreaDef` + `width/height` opcional en `RoomDef` (sin
     cambio de comportamiento);
   - commit 2: `CameraDirector` (dead zones + encuadre) detrás de un
     flag;
   - commit 3: `TransitionDirector`;
   - commit 4: `WorldState` + region states;
   - commit 5: `RenderMode` + `greybox/` renderer;
   - commit 6: Cinematic infra + portar `playAwakening`;
   - commit 7: Debug tools;
   - commit 8: Fusionar Terrazas como caso piloto;
   - commit 9: Fusionar Forja;
   - commit 10: Test Portal→Faro end-to-end.

6. **Documentar** cada macroárea en
   `docs/20-worlds/ohmdal/room-based/areas/`.

7. **ADR de governance** (§11) escrito **antes** de mergear el primer
   commit que toque el árbol de foco.

---

## 15. Lo que este audit NO hace

- No escribe código todavía.
- No decide tamaños finales de áreas (eso es la propuesta de
  macroáreas del §7, sujeta a ratificación).
- No redefine puzzles, narrativa ni pedagogía: vive en docs CANON.
- No toca assets existentes: el árbol `assets/ohmdal/rooms/pilot-
  arco1/` sigue válido para la fase PAINTED.
- No decide el futuro del árbol `src/hd2d-ohmdal/` ni del árbol
  `src/ohmdal-arco1/`: son árboles paralelos, no se descartan.

---

## Anexo A — Inventario rápido de archivos auditados

| Archivo | Líneas | Rol | Reusar / Refactor / Reescribir |
|---|---|---|---|
| `src/jugar/ExplorationScene.ts` | 1486 | Scene Phaser única; player, cámara, chunks, puertas, NPCs, awakening hooks, mundo map debug, hitbox debug | Refactor mayor (Viewport, AreaDef, CameraDirector) |
| `src/jugar/world.ts` | 58 | Layout del mundo continuo con offsets | Refactor mínimo (cambiar a `AreaRef[]`) |
| `src/jugar/rooms.ts` | ~2700 | `RoomDef` + handlers de puzzles + narrativa + transitions | Refactor mayor: separar en `roomDefs.ts`, `roomInteractions.ts`, `dialogFlows.ts`, `regionGraph.ts` |
| `src/jugar/roomScenesData.ts` | 25 KB | `RoomSceneProfile` con walkable/collision/doors/entries/things/effects por sala | Refactor: añadir `width`, `height` por sala |
| `src/jugar/roomScenes.ts` | 4 KB | Mapeo `RoomSceneProfile → background URL` | Refactor: añadir mapeo por variante de estado |
| `src/jugar/awakening.ts` | 160 | WOW moment de Ohm (flash, chispas, cámara, música) | Refactor: portar a `Cinema` API |
| `src/jugar/visuals.ts` | 50+ | Glow, sombra, polvo, viñeta, paleta, perspective | Reusar tal cual |
| `src/jugar/tiles.ts` | 86 | Spritesheets de decor, `renderDecor` | Refactor menor (generalizar cols/rows) |
| `src/jugar/decorData.ts` | 6 KB | Grids de decor por sala (string[][11]) | Refactor: generalizar a `string[][]` |
| `src/state.ts` | 244 | `state`, `flags`, `hooks`, `save`/`load` | Refactor: añadir `state.world` y suscripciones |
| `src/puzzles/*Model.ts` | varios | Modelos puros renderer-neutral | **Reusar tal cual** |
| `src/puzzles/*Dialogue.ts` | varios | Diálogos de puzzles | Reusar |
| `src/ui/*` | varios | HUD, Bitácora, dialog, joystick, ohm companion | Reusar; añadir `cinematicOverlay`, `regionBadge` |
| `src/experiences/ohmdal/topdownRuntime.ts` | 82 | Monta el Phaser.Game y la escena | Refactor menor: viewport configurable |
| `src/experiences/manifests.ts` | varios | Manifiestos de campañas | Reusar; añadir `roomId → areaId` mapping |
| `assets/ohmdal/rooms/pilot-arco1/*` | 24 PNGs | Fondos pintados 960×540 | Reusar en PAINTED; ignorar en GREYBOX |
| `assets/ohmdal/tilesets/*` | varios | Spritesheets reutilizables | Reusar |
| `tests/ohmdal-arco1-*.test.ts` | varios | Tests de modelos puros | Reusar |
| `tests/f*`, `tests/l*`, `tests/t*` | varios | Tests de escenas (asumen coords 960×540) | Compatibles si los refactors respetan las coords locales |

## Anexo B — Decisiones que requieren ratificación explícita

1. **Phaser 4 multi-área gana como dirección de producción del Arco I
   (en lugar de HD-2D Three.js).** Implica ADR `CANON` y update de
   `ROADMAP.md` y `docs/20-worlds/ohmdal/AGENTS.md`.
2. **Propuesta de macroáreas (§7)**: ¿se ratifica tal cual? ¿qué
   fusiones se aceptan? ¿cuáles no?
3. **Viewport lógico sigue siendo ~960×540**: ¿se mantiene, o se
   permite otro valor (p. ej. 1024×576)?
4. **Render mode default en dev**: ¿`GREYBOX` o `PAINTED`?
5. **Cinematic infrastructure**: ¿se hace ya en este refactor o
   queda como esqueleto para H5?
6. **Migración de flags sueltos a `regionState`**: ¿se hace en este
   refactor o queda para una fase posterior?

**Hasta que Manuel ratifique estos puntos, este audit queda como
insumo y no se modifica código de `src/jugar/` (más allá del
directorio `docs/20-worlds/ohmdal/room-based/` que es donde viven los
documentos de trabajo).**
