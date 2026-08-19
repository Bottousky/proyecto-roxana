# Ohmdal — Room-Local Spatial Contract

> **Estado:** `CANON` (ratificado por `ADR-002`, 2026-08-18).
> **Rige:** la migración de recovery del runtime de `src/jugar/` al modelo
> room-based (`MIGRATION_PLAN.md`) y toda arquitectura espacial futura de
> Ohmdal.
> **Acompaña:** `ADR-002`, `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`,
> `RECOVERY_AUDIT.md`, `TEST_TAXONOMY.md`.
>
> ⚠ **Lectura obligatoria antes de tocar cualquier archivo de
> `src/jugar/` o de `tests/`.** Este documento define los contratos de
> `RoomGraph`, `ActiveRoom`, cámara, transiciones, render y mapa del mundo.
> Si un código contradice este contrato, el código es el que debe migrar;
> si un documento lo contradice, se aplica la precedencia de
> `ROXANA_CANON_POLICY_v1.md` (CANON → nivel → fecha → ADR).

---

## 1. Glosario (para que no haya ambigüedad)

| Término | Definición |
|---|---|
| **Viewport** | Ventana de render lógico del juego: **960×540**. Independiente del tamaño de las rooms. |
| **Room / Área** | Escena navegable independiente. Tiene su propio sistema de coordenadas **local** `0..width × 0..height`. Puede medir 960×540, 1920×1080, 2400×1620, etc. |
| **Coordenadas locales de room** | `x ∈ [0, width]`, `y ∈ [0, height]`. Todas las datos de gameplay de una room (player, entries, doors, walkable, collision, things, NPCs, efectos) viven aquí. |
| **Room graph** | Grafo de conectividad topológica/narrativa entre rooms. Responde a *qué* conecta con *qué*, *por dónde*, *hacia qué entry*, *con qué transición* y *bajo qué condición*. No responde a colocación física. |
| **ActiveRoom** | La única room con autoridad de gameplay en un instante: `{ id, playerLocalPosition }`. Cámara, navegación, colisiones e interacciones se evalúan contra ella. |
| **Transición** | Cambio de room activa. Es una arista del grafo ejecutada: fade / doorway / cinematic (futuro: seamless). |
| **Mapa esquemático** | Representación legible (tecla M) de topología/geografía, estilo "metro map". No es una proyección fiel de coordenadas de runtime. |
| **Coordenadas mundo (legacy)** | El plano compartido `(ox, oy)` de `world.ts`. **Deja de ser autoridad de gameplay** (migración R6). Queda como dato esquemático del mapa. |

---

## 2. Principios no negociables

1. **Room-based.** Ohmdal no es un plano mundo continuo. `RoomB.worldX =
   RoomA.worldX + RoomA.width` **no** es requisito; renderizar dos rooms a
   la vez **no** es requisito.
2. **Viewport ≠ room.** El viewport es 960×540. Una room puede ser mayor,
   igual o (teóricamente) menor. Una room grande es **una** room: cambiar
   el cuadrante visible no cambia la room activa.
3. **Coordenadas locales.** Todo dato de gameplay de una room es local.
   El runtime **no requiere** coordenadas mundo absolutas entre rooms
   independientes.
4. **Grafo = topología.** Las conexiones son aristas, no adyacencia
   física.
5. **ActiveRoom única.** Carga/precarga de otras rooms **no** influye en
   cámara, navegación, colisiones ni clamping.
6. **Render de la room activa.** El gameplay renderiza la room actual.
7. **Cámara local.** Bounds de la cámara = rect local de la room activa
   `(0,0,width,height)`.
8. **Transiciones de grafo.** Todo cambio de room pasa por una transición
   con entry de destino. Sin muros compartidos como mecanismo de conexión.
9. **Mapa esquemático.** El world map comunica topología; no coordenadas
   exactas de runtime.
10. **Sin parche de continuidad.** No se arregla `gapRect` ni la física de
    muros compartidos para "hacer que funcione"; se elimina.

---

## 3. RoomGraph contract

### 3.1 Objetivo

Representar la conectividad entre rooms **sin** duplicar la información
que ya existe en `RoomDef.doors` ni en `RoomSceneProfile.entries/doors`.
El grafo es una **vista derivada, validada y aumentada** de los datos
existentes, más un pequeño conjunto de metadatos de transición que hoy no
existen en el código.

### 3.2 Fuente de verdad por campo

| Campo de conexión | Fuente canónica | Notas |
|---|---|---|
| `from` / `to` | `RoomDef[from].doors[].to` | **Sigue siendo autoritativo.** Cada `DoorDef` con `to` apunta a una room destino. Una room puede tener **varias** doors hacia el mismo destino (salidas distintas). |
| `exit` (identidad de salida en la room origen) | `RoomSceneProfile[from].doors` key (hoy indexado por el id de la room destino) o `DoorDef.to`; adapter `exit = door.exit ?? door.to` | **R1.1:** la transición se inicia por una SALIDA concreta. `from + to` NO identifica de forma única una conexión. En la data actual `exit === to` (exactamente una salida por `(from,to)`); cuando una room tenga dos salidas hacia el mismo destino, cada door declara su `exit`. |
| `entry` (llegada en la room destino) | 1) `door.entry` (específico de la salida, futuro) → 2) `RoomSceneProfile[to].entries[from]` → 3) `DoorDef.spawn` → 4) fallback default | Punto local de aparición al entrar a `to` por esa salida. **CURRENT DATA LIMITATION:** las entries del perfil están keyed por ROOM origen (`entries[from]`), así que hoy no distinguen dos salidas de la misma origen al mismo destino; la data actual tiene una sola salida por `(from,to)`. |
| `kind` (tipo de transición) | Tabla explícita de aristas (nueva, pequeña) | `'doorway' | 'fade' | 'cinematic' | 'seamless'`. Default `'doorway'`. Seed inicial desde `ARC1_ROOM_GRAPH.md` §4.1. |
| lock / visibilidad | `DoorDef.locked()` / `DoorDef.visible()` | **Única fuente.** El grafo referencia los predicados; no duplica flags. |
| `cinematic` (opcional) | `ARC1_ROOM_GRAPH.md` §4.1 (columna `Cinematic?`) | Nombre de hook de cinemática a reproducir en el primer cruce. |

### 3.3 Tipos de contrato

```ts
type TransitionKind = 'fade' | 'doorway' | 'cinematic' | 'seamless';
type ExitId = string;

interface RoomConnection {
  /** id opaco y determinista: `${from}->${exit}` (las aristas inversas son conexiones propias). */
  id: string;
  from: RoomId;
  /** identidad estable de la salida en la room origen. */
  exit: ExitId;
  to: RoomId;
  /** tipo de transición. 'doorway' por default. */
  kind: TransitionKind;
  /** cinemática opcional a reproducir la primera vez que se cruza (sólo para kind === 'cinematic'). */
  cinematic?: string;
}

/** Resolución de una conexión contra los datos existentes. Puro, sin Phaser. */
interface RoomConnectionData {
  connection: RoomConnection;
  /** salida en la room origen (rect local) — de RoomSceneProfile[from].doors[exit]. */
  exit: SceneRect | null;
  /** entrada en la room destino (punto local) — door.entry ?? entries[from] ?? door.spawn ?? fallback. */
  entry: { x: number; y: number };
  /** la door canónica (para lock/visibilidad). */
  door: DoorDef;
}

/** API del grafo (pura, testeable en Node). La lookup autoritativa es por
 *  SALIDA: `resolve(from, exit)`. El destino es un RESULTADO, no input. */
interface RoomGraph {
  connections(): RoomConnection[];
  connection(from: RoomId, exit: ExitId): RoomConnection | undefined;
  resolve(from: RoomId, exit: ExitId): RoomConnectionData | null; // null si no existe
  /** TODAS las conexiones from→to (puede haber varias salidas; nunca asume unicidad). */
  connectionsBetween(from: RoomId, to: RoomId): RoomConnection[];
  outgoing(from: RoomId): RoomConnection[];
  incoming(to: RoomId): RoomConnection[];
  isAvailable(connection: RoomConnection): boolean; // visible + !locked
}
```

> Los nombres son **sugerencias**; si la implementación prefiere otra
> descomposición (p. ej. `connectionData(conn)` en vez de `resolve`),
> el contrato semántico manda: un solo punto de entrada para resolver
> entrada destino + condiciones + tipo por **salida**, sin duplicar datos.

### 3.4 Dónde vive la topología

- **`RoomDef.doors[].to`** permanece **autoritativo** como lista de salidas.
  `RoomGraph` se **deriva** de él y se **valida** (ver §3.6). No se crea una
  tabla de aristas duplicada para `from/to`.
- **La identidad de salida (`exit`)** se deriva con el adapter mínimo
  `exit = door.exit ?? door.to` (R1.1): en la data actual coincide con el
  key de `RoomSceneProfile.doors` y con `DoorDef.to` (una salida por
  `(from,to)`). No se inventa una tabla de topología paralela.
- **`kind`** y **`cinematic`** son el único dato **nuevo** (no existen hoy
  en el código). Viven en una tabla de aristas pequeña (formato `data`
  TypeScript o JSON), con default `'doorway'`, inicializada desde
  `ARC1_ROOM_GRAPH.md` §4.1.
- **La resolución de entry** está centralizada en el grafo (§3.2) para que
  el runtime nunca tenga que conocer offsets ni coordenadas mundo.

### 3.5 Lock/visibilidad

- Se representan **exactamente** como hoy: `DoorDef.locked()` (devuelve
  `Line[] | true | null`) y `DoorDef.visible()` (booleano). El grafo los
  **consume**, no los re-declara.
- `isAvailable(from, to, flags)` = `visible() !== false && !locked()`.
- **Regla de no-circularidad** (se valida estáticamente): el flag que
  desbloquea la arista `From → To` **no** se setea dentro de `To`
  (ningún puzzle cuyo resultado setea ese flag vive en `To`). Esto ya lo
  exige `ARC1_ROOM_GRAPH.md` §11 y se conserva.

### 3.6 Validación del grafo (tests Node, sin Phaser)

Para cada conexión derivada:

1. `to` existe en `ROOMS` y en `ROOM_SCENES`.
2. La salida (`RoomSceneProfile[from].doors[exit]`) existe y cae dentro del
   bbox local de `from`.
3. La entry resuelta (`RoomSceneProfile[to].entries[from]` o fallback)
   cae dentro del bbox local de `to` y es `legal` (walkable + sin
   colisión) para el cuerpo del jugador.
4. No hay aristas duplicadas ni hacia rooms inexistentes.
5. No hay rooms huérfanas: toda room no-Prólogo/Epílogo tiene al menos una
   arista de entrada.
6. Locks no circulares (tabla estática `puzzle-resolves-flag`).
7. El **critical path** Portal→Faro (`ARC1_ROOM_GRAPH.md` §6) es alcanzable
   arista a arista.
8. `kind` es uno de los 4 valores; `cinematic` sólo en aristas
   `kind === 'cinematic'`.

---

## 4. ActiveRoom contract

### 4.1 Estado

```ts
interface ActiveRoom {
  /** roomId de la room activa. */
  id: RoomId;
  /** dimensiones LOCALES de la room (derivadas de RoomSceneProfile.width/height ?? 960×540). */
  width: number;
  height: number;
  /** posición LOCAL del jugador dentro de la room activa. Autoridad de gameplay. */
  playerLocal: { x: number; y: number };
}
```

- **Las dimensiones se derivan** (`areaDimensions(id)` en
  `roomScenesData.ts`) en el momento de activar la room. Se almacenan en
  `ActiveRoom` como copia de conveniencia, pero la fuente es el perfil.
- `playerLocal` es la **única** posición de gameplay del jugador. La
  escena puede derivar una posición de Phaser para el render **sólo**
  desde `playerLocal` (en la migración, la room activa se construye en el
  origen, así que `local == phaser`; hasta R3 puede existir un único punto
  de conversión marcado como transitorio).

### 4.2 Invariantes

- Cámara: bounds = `(0, 0, width, height)` de la room activa.
- Navegación: bounds = `(0, 0, width, height)`.
- Colisiones: sólo contra la room activa.
- Clamping del jugador: `playerLocal` confinado a `[0, width) × [0, height)`.
- Las rooms cargadas/precargadas **no** afectan ninguna de las anteriores.

### 4.3 Ciclo de vida

```text
1. requestTransition(connection)         (ver §6)
2. resolver perfil destino               roomScene(to); areaDimensions(to)
3. resolver entry destino                graph.resolve(from,to).entry  (LOCAL de `to`)
4. setActiveRoom(to, entry)              activeRoom.id=to; width/height=...; playerLocal=entry
5. buildRoom(to)                         renderer construye SOLO la room activa (en origen)
6. configureCamera()                     CameraDirector.cameraBounds((0,0,w,h), viewport) → setBounds
7. spawnPlayer(entry)                    playerLocal = entry; cuerpo del jugador en playerLocal
8. gameplay                              update(): colisiones/navegación contra activeRoom
```

La invariancia clave: **nunca hay un frame en el que dos rooms compartan
autoridad**; el cambio de `id + dimensions + playerLocal` es atómico
(función única, como hoy `transitionActiveArea`, pero sin offsets).

---

## 5. Cámara

- `CameraDirector` se conserva **tal cual** (funciones puras sobre un
  `Rect` + viewport).
- La escena le pasa siempre el rect **local** de la room activa:
  `cameraBounds({ x: 0, y: 0, w: activeRoom.width, h: activeRoom.height },
  viewport)`.
- Room > viewport → `cameraBounds` devuelve el área completa; Phaser
  clampa el scroll vía `setBounds` y `startFollow` sigue al jugador.
- Room == viewport → el rect del área coincide con el viewport; la cámara
  queda efectivamente fija (comportamiento heredado, ver `r2`).
- `clampCenter`/`isAtBorder` se usan igual; operan sobre el rect local.

---

## 6. Transiciones

### 6.1 Contrato

```ts
interface TransitionRequest {
  connection: RoomConnectionData; // del RoomGraph
  current: ActiveRoom;
}

interface TransitionResult {
  next: ActiveRoom;
  completed: boolean; // false si fue cancelada/skipeada
}
```

### 6.2 Ciclo de vida (propuesto; la implementación puede agrupar pasos)

```text
requestTransition(connection)
  1. validar visible/locked              graph.isAvailable(from, to, flags)
        └─ NO disponible → feedback diegético (líneas de la door.locked())
  2. lock input                          escena entra en modo transición (transitioning=true)
  3. coreografía de salida (opcional)    comitiva camina al exit de la room origen (LOCAL)
  4. fade / cinematic según kind         kind='fade' → fadeOut; 'cinematic' → hook; 'doorway' → sin fade
  5. dispose render de room actual       destruir roomObjects de la room actual
  6. cargar room destino                 resolver perfil + dimensions de `to`
  7. spawn en entry destino LOCAL        graph.resolve(from,to).entry
  8. setActiveRoom(to, entry)            actualización atómica (id, dimensions, playerLocal)
  9. bounds de cámara desde AreaDef      CameraDirector.cameraBounds((0,0,w,h), viewport)
 10. coreografía de llegada (opcional)   NPC con walksTo entran caminando desde el entry
 11. fade in                             fadeIn
 12. unlock input                        transitioning=false
```

### 6.3 Ownership

| Responsabilidad | Dueño |
|---|---|
| Flags de estado (`setFlag`, `onEnter`, narrativa) | `rooms.ts` / `state.ts` — **no** la capa de transición |
| Lock de input (`transitioning`) | Capa de transición (guard) |
| Fade (fadeIn/fadeOut) | Capa de transición |
| Swap de room (`loadRoom(target, entry)`) | Capa de transición → scene |
| Entry destino | `RoomGraph.resolve` (perfil destino) |
| Coreografía de NPC (walkIn/walkOut) | `ExplorationScene` (hooks de salida/llegada) |
| Reset de cámara | `ExplorationScene` → `CameraDirector` |

- Toda transición **commitea** el estado antes de iniciar y **restaura** la
  cámara después (regla de `RECOVERY_AUDIT.md` §9).
- Toda cinemática tiene **skip** (Esc/Space) y **fallback** obligatorio.
- `seamless` (futuro) **no** implica plano mundo global: se implementa como
  una doorway/fade disfrazada que cambia de sistema local con continuidad
  visual.

---

## 7. Render

- **El renderer construye y dibuja SOLO la room activa.** `loadRoom` no
  itera `world.rooms`; construye un solo chunk en el origen.
- Room con `background` → fondo pintado + colisión manual (comportamiento
  actual preservado).
- Room sin `background` → `drawRoomBase` + `renderDecor` + `pushWallSolids`
  sobre el rect local de la room (las murallas perimetrales de la room
  **siguen existiendo** como límite de la room; lo que desaparece es la
  física de *aberturas entre rooms vecinas*).
- Se elimina el `tileSprite` del render-union (bug R3) y cualquier
  construcción de rooms no activas.
- Precarga de assets permitida (los fondos ya están en
  `ROOM_BACKGROUND_FILES`); la precarga **no** implica render.

---

## 8. Mapa esquemático del mundo (tecla M)

- `toggleMap` renderiza un diagrama **topológico/geográfico** legible
  (nodos por room, aristas por conexión del grafo, marcador de posición
  local normalizado por el tamaño de la room activa).
- **No** está obligado a proyectar coordenadas de runtime. Las posiciones
  `mapNodes` (o las que se deriven del grafo) son presentación.
- Las posiciones esquemáticas pueden **heredarse** de `ARC1_SPATIAL_MAP.md`
  (democión a esquemático) o mantenerse manuales, como hoy.

---

## 9. Matriz de responsabilidades

| Módulo | Responsabilidad | Archivo(s) actual(es) | Estado en la migración |
|---|---|---|---|
| **RoomDef** | Identidad narrativa (id, name), `things` (interacción/NPC), `onEnter`, predicados `locked()/visible()` de doors | `rooms.ts` | **Conservar.** `doors[].to` sigue siendo la fuente de `from/to` del grafo. |
| **RoomSceneProfile / AreaDef** | Geometría espacial **local**: `width/height`, `walkable`, `collision`, `doors` (rects de salida), `entries` (puntos de llegada), `things` (placement), `effects`, `perspective` | `roomScenesData.ts` | **Conservar.** Se convierte en el contrato de geometría por room (con `width/height`). |
| **RoomGraph** | Topología: conexiones derivadas de `RoomDef.doors`, `kind`/`cinematic` por arista, resolución de entry, validación, locks/visibilidad | nuevo (`graph.ts` o similar) | **Crear en R1.** Puro y testeable en Node. |
| **ActiveRoom** | Autoridad de gameplay: `id`, `width/height` (derivados), `playerLocal`. Bounds de cámara/navegación = `(0,0,w,h)` | `activeArea.ts` (refactor) + `spatial.ts` (parte) | **Refactor en R2.** Semántica de `ActiveArea` conservada; offsets eliminados. |
| **CameraDirector** | Viewport dentro de la room activa (`cameraBounds`, `clampCenter`, `isAtBorder`, `applyToPhaserCamera`) | `cameraDirector.ts` | **Conservar tal cual.** |
| **Transition layer** | Cambio de room: validar → lock → fade/cinematic → swap → spawn entry → bounds → unlock | `ExplorationScene` (hoy `beginDoorTransition` + `enterArea`); futuro `transitions/` | **Unificar en R4.** |
| **Renderer** | Visuales de la room activa: fondo, `drawRoomBase`, decor, efectos, murallas perimetrales de la room, props | `ExplorationScene.buildChunk`, `visuals.ts`, `tiles.ts` | **Refactor en R3** (una room) + **R5** (sin aberturas entre rooms). |
| **World map (M)** | Representación esquemática de topología + posición local normalizada | `ExplorationScene.toggleMap` | **Conservar, simplificar** (puede consumir el grafo en R4+). |

---

## 10. Adaptación de datos existentes (qué se deriva, qué se añade)

| Dato | Existe hoy | En el modelo room-based |
|---|---|---|
| Rooms e ids | `ROOMS`, `ROOM_SCENES` | Igual. |
| Salidas (`from → to`) | `RoomDef[from].doors[].to` | **Se conserva como autoritativo.** |
| Rects de salida | `RoomSceneProfile[from].doors[to]` | Igual (local). |
| Entries de llegada | `RoomSceneProfile[to].entries[from]` | **Pasan a ser el mecanismo de spawn de transición.** |
| Lock / visibilidad | `DoorDef.locked()/visible()` | Igual (referenciados por el grafo). |
| Tipo de transición (`kind`) | **No existe** (implícito: boundary o fade) | **Nuevo**, tabla de aristas con default `'doorway'`. |
| Cinemática de arista | `ARC1_ROOM_GRAPH.md` §4.1 | **Nueva** en la tabla de aristas (metadata). |
| Offsets `(ox, oy)` | `world.ts` | **Se retiran de runtime** (R6). Democión a esquemático del mapa. |
| `unionAreaBounds` / `localToWorld` / `worldToLocal` | `spatial.ts` | **Se retiran del runtime** cuando dejen de tener consumidores (R5/R6). |

---

## 11. Validación

- **Estática (tests Node puros):** invariantes del grafo (§3.6), bounds
  locales de rooms (§4.2), camera bounds locales (§5), resolución de
  entries (§3.4). Ver `TEST_TAXONOMY.md`.
- **Runtime (juego):** el Player-Agent recorre Portal→Faro; cada cambio de
  room pasa por una transición con entry correcta; la cámara nunca sale de
  la room activa; la Plaza se recorre en 1920×1080 sin cambios de room.
- **Prohibido en tests:** asserts sobre valores de `ox/oy` (accidentes de
  implementación), asserts de "room vecina se renderiza junto a la activa",
  asserts de adyacencia física entre rooms.

---

## 12. Referencias

- `ADR-002-room-local-spatial-architecture.md` — decisión de governance.
- `ARC1_ROOM_GRAPH.md` — grafo canónico (topología, locks, cinemáticas).
- `ARC1_SPATIAL_MAP.md` — topología canónica; valores numéricos
  esquemáticos.
- `RECOVERY_AUDIT.md` — auditoría del runtime existente.
- `MIGRATION_PLAN.md` — plan de migración R1–R7 y registro de bugs.
- `TEST_TAXONOMY.md` — taxonomía de tests por invariante.
