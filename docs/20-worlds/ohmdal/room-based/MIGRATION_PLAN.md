# Ohmdal — Room-Based Migration Plan (R1–R7)

> **Estado:** `CANON` (ratificado por `ADR-002`, 2026-08-18).
> **Rige:** la secuencia de implementación **posterior** a esta fase de
> documentación. Ninguna fase se inicia sin autorización explícita.
> **Acompaña:** `ADR-002`, `SPATIAL_CONTRACT.md`, `TEST_TAXONOMY.md`,
> `RECOVERY_AUDIT.md`.

---

## 0. Registro de bugs conocidos (issues de migración, no se parchean aquí)

> Los bugs del estado híbrido actual **no** se arreglan en esta fase. Cada
> uno tiene una fase propietaria en el plan. En particular, **no** se
> parchea la física de muros compartidos (decisión de recuperación directa,
> `ADR-002` §2.12).

| # | Bug / deuda | Síntoma | Causa raíz | Fase propietaria | Resultado |
|---|---|---|---|---|---|
| B1 | Conexión Plaza→Taller sellada / desalineada | El jugador no puede caminar al Taller; el hueco del muro este cae en el muro norte | `gapRect` orienta por `w≥h`, pero la door del Taller (100×80) está en un muro E/O; el muro este queda sólido | **R5** (se elimina la física de aberturas; no se parchea `gapRect`) | Transición `doorway`/`fade` por grafo con entry correcta |
| B2 | `nearestLegalPoint` enmascara cruces inválidos | Cruces de boundary aterrizan fuera del walkable y un rescue invisible teletransporta | Puertas de rooms vecinas desalineadas tras reposicionar offsets en commit 4 | **R4/R5** (las transiciones por entries eliminan el cruce físico) | El rescue queda como red de seguridad de posición, no como mecanismo de cambio de room |
| B3 | Boundary de Forja ignora `visible()` | La Forja puede ser accesible antes de `unit2Completed` | `computeBoundaries` sólo filtra por `locked`, no por `visible` | **R4** (el grafo no ofrece transición si `visible() === false`) | El lock narrativo se respeta en el grafo |
| B4 | `despertarOhm` usa coordenadas de la Plaza vieja `(480,342)` | El halo/chispas del despertar aparecen en el cuadrante NW vacío | Hardcode heredado del centro 960×540; el pedestal vive en `(960,640)` | **R7** (revalidación de Plaza; fix independiente de 1 línea) | Cinemática localizada en el pedestal |
| B5 | `tileSprite` gigante del render-union (8640×4860) | Todos los chunks se construyen/renderean; sprite de campo-base enorme | `loadRoom` itera `world.rooms` y usa `unionAreaBounds` para el fondo | **R3** (render de la room activa) | El fondo cubre sólo la room activa |
| B6 | Cambios de offsets del commit 4 (Taller 1920,0; Terrazas +540) | Arreglos de síntoma para evitar solapamientos de la Plaza grande | El modelo continuo obliga a reposicionar vecinos al crecer una room | **R6** (se retiran `ox/oy` del runtime; `taller`/`terraces` vuelven a tamaño natural) | Ninguna room se reposiciona por el tamaño de otra |
| B7 | Tests validan adyacencia de offsets en vez de transiciones | `m0`, secciones de `r1`/`r4`/`c4` afirman `taller.ox === 1920`, etc. | La fase continua convirtió offsets en el invariante | **R2/R6 + TEST_TAXONOMY** | Tests por invariante de producto |

---

## 1. Principios del plan

- **Commits pequeños y reversibles.** Cada fase termina con un invariante
  estable y verde (`npm run build`, `npm test`, y gameplay de regresión
  donde aplique). Si una fase se atasca >5 repair loops → `ESCALATE`
  (AGENTS.md raíz).
- **Nada de parche de continuidad.** `gapRect`, `pushWallSolids`-entre-rooms
  y `computeBoundaries` se **eliminan**, no se arreglan.
- **Una room = un sistema local.** Desde R2 el jugador se expresa en
  coordenadas locales; cualquier conversión a mundo es transitoria y queda
  marcada.
- **El grafo manda.** Toda conexión se resuelve por `RoomGraph.resolve`
  (entry + condición), no por detección de chunk en el plano.
- **No mezclar fases.** Cada fase declara explícitamente qué **no** se toca.

---

## 2. Secuencia de fases

> **Nota de dependencias.** Se mantiene el orden preferido de
> `ADR-002` con una corrección: **R4 (transiciones) precede a R3
> (render de una room)**. Motivo: si sólo se renderiza la room activa
> (R3) sin que las transiciones por entries existan aún (R4), el
> jugador queda atrapado en la room inicial porque el cambio de room
> depende hoy de que el vecino esté renderizado (`chunkAt`). La
> transición por grafo debe estar operativa antes de retirar el
> render de vecinos.

```text
R1  RoomGraph introducido y validado          (data + tests, sin runtime)
R2  ActiveRoom room-local                     (jugador/cámara/navegación locales)
R4  Transiciones unificadas por grafo+entries (fade/doorway/cinematic)
R3  Render de la room activa                  (se elimina render de vecinos)
R5  Eliminar física de muros compartidos      (boundaries/gapRect/enterArea-por-chunk)
R6  Retirar ox/oy del runtime + tests continuos
R7  Revalidar Plaza 1920×1080
```

---

### R1 — RoomGraph introducido y validado

**Objetivo:** congelar la topología como dato puro, testeable, **sin**
tocar el runtime.

- **Archivos que se modifican/crían:**
  - Nuevo: `src/jugar/roomGraph.ts` (o `src/jugar/graph.ts`) — tipos
    `RoomConnection`, `RoomConnectionData`, API pura (§3 de
    `SPATIAL_CONTRACT.md`), derivación desde `ROOMS` + `ROOM_SCENES`, tabla
    de `kind`/`cinematic` (seed desde `ARC1_ROOM_GRAPH.md` §4.1), validador
    de invariantes (§3.6).
  - Nuevo: `tests/rg0-room-graph.test.ts` (validación del grafo).
  - `TEST_TAXONOMY.md` y `SPATIAL_CONTRACT.md` se referencian como contrato.
- **Invariante establecido:** el grafo derivado es válido (todas las
  conexiones resuelven `from/to/exit/entry`; locks no circulares; critical
  path alcanzable) y es **sólo lectura** (ningún efecto en el runtime).
- **Tests a añadir/cambiar:** `rg0-room-graph` (nuevo). **UN-LEGACY** de
  `_legacy_r1-grafo-de-salas.test.ts` y `_legacy_r4-conectividad-salas.test.ts`
  (validan la misma topología; se integran como parte del grafo).
- **Rollback:** trivial — borrar el archivo nuevo y sus tests; cero impacto
  en runtime.
- **MUST NOT:** no consumir el grafo desde `ExplorationScene` todavía; no
  modificar `rooms.ts` ni `roomScenesData.ts`; no tocar tests de runtime.

---

### R2 — ActiveRoom room-local

**Objetivo:** el jugador, la cámara y la navegación operan en coordenadas
locales de la room activa.

- **Archivos que se modifican/crían:**
  - `activeArea.ts` → refactor a `ActiveRoom` (contract §4): estado
    `{ id, width, height, playerLocal }`; `setActiveRoom` atómico; bounds
    locales `(0,0,w,h)`.
  - `spatial.ts` → se recorta a lo room-local (AreaDef, navigationBounds,
    isPointInsideArea, viewport); las funciones de offsets quedan sin
    consumidores nuevos (se retiran en R5/R6).
  - `ExplorationScene.ts` → `player.x/y` pasan a ser **locales**; la
    cámara usa `cameraBounds((0,0,w,h), viewport)`; `clampPlayerToArea`
    usa el rect local. Mientras R3 no llegue, existe **un único punto de
    conversión marcado** (`local→phaser = local + offsetActivo`) para que
    el render de vecinos siga funcionando durante la transición.
  - `cameraDirector.ts` → **no se toca** (ya es agnóstico).
- **Invariante:** `playerLocal` es la única posición de gameplay; los
  bounds de cámara/navegación son `(0,0,width,height)`; ningún vecino
  influye en cámara/navegación/colisión/clamping.
- **Tests a añadir/cambiar:** reescribir `r4-active-area-semantics.test.ts`
  contra el contrato `ActiveRoom` local (sin offsets); reescribir la parte
  de `r1-spatial-contract` que dependa de offsets; ajustar `c4` donde use
  `transitionActiveArea`.
- **Rollback:** revertir `activeArea.ts`/`spatial.ts`/`ExplorationScene.ts`
  al commit anterior; los tests de offsets recuperan su forma.
- **MUST NOT:** no cambiar el mecanismo de cambio de room todavía (sigue
  `enterArea`/`chunkAt`); no tocar `world.ts`; no tocar decor/efectos.

---

### R4 — Transiciones unificadas por grafo + entries

> Se implementa antes que R3 por la dependencia explicada en §2.

**Objetivo:** todo cambio de room pasa por `RoomGraph.resolve` + entries;
conviven por un momento el viejo cruce físico y el nuevo camino por
transición, con el nuevo como preferido.

- **Archivos que se modifican/crían:**
  - `ExplorationScene.ts` → unificar `beginDoorTransition`/`enterArea` en
    una función `transitionTo(to)` que: consulta `RoomGraph.resolve(from,to)`,
    valida `visible/locked`, aplica el ciclo del §6.2 de `SPATIAL_CONTRACT.md`.
  - `roomGraph.ts` → se consume por primera vez desde la escena.
  - (`transitions/` puede nacer aquí si el tamaño lo justifica; no es
    obligatorio.)
- **Invariante:** toda conexión del grafo tiene una ruta de transición con
  entry de destino; B3 queda resuelto (el grafo no ofrece la Forja si
  `visible() === false`); B2 deja de ser el camino normal (el cruce físico
  queda en desuso progresivo).
- **Tests a añadir/cambiar:** nuevos `rt0-transitions.test.ts` (Plaza→Taller
  resuelve entry destino; el swap cambia ActiveRoom; `playerLocal` se
  resetea; sin dependencia de offset del destino). Ajustar `m11`.
- **Rollback:** revertir el unify; el cruce físico sigue disponible como
  fallback (por eso es reversible).
- **MUST NOT:** no retirar aún la física de muros; no tocar `world.ts`; no
  modificar puzzles/narrativa.

---

### R3 — Render de la room activa

**Objetivo:** `loadRoom` construye y renderiza **sólo** la room activa.

- **Archivos que se modifican:**
  - `ExplorationScene.ts` → `loadRoom` deja de iterar `world.rooms`;
    construye un chunk (el activo) en el origen; se elimina el
    `tileSprite` del render-union (B5); `chunkAt`/`chunks` dejan de ser
    necesarios para cambio de room (sólo queda el punto de conversión
    transitorio si aún existe).
  - `world.ts` → `worldOf` deja de ser consultado por el runtime de render.
- **Invariante:** se renderiza una sola room; la cámara nunca ve "vacio"
  entre rooms; B5 resuelto.
- **Tests a añadir/cambiar:** nuevo `rr0-render-active-room.test.ts`
  (construcción de una sola room; sin construcción de vecinos). Ajustar
  `m0` (los asserts de offsets pierden base, ver R6).
- **Rollback:** restaurar la iteración de chunks; el coste es volver al
  tileSprite gigante (no peor que el estado actual).
- **MUST NOT:** no mezclar con R5 (la física de muros puede permanecer
  inerte un commit); no rediseñar el decor.

---

### R5 — Eliminar física de muros compartidos

**Objetivo:** retirar el mecanismo de conexión continua.

- **Archivos que se modifican:**
  - `ExplorationScene.ts` → eliminar `computeBoundaries`, `gapRect`, el
    cruce por `chunkAt → enterArea` (el cambio de room ya es por
    transición), y las aberturas entre rooms en `pushWallSolids` (que se
    simplifica a murallas perimetrales de la room). B1/B2 quedan resueltos
    por ausencia del mecanismo.
  - `spatial.ts` → retirar `localToWorld/worldToLocal/chunkRectWorld/
    unionAreaBounds/chunkPlacement/isPointInsideChunk` si no quedan
    consumidores.
- **Invariante:** no existe ningún camino de cambio de room basado en
  posición física compartida; toda conexión es una transición de grafo.
- **Tests a añadir/cambiar:** retirar asserts de boundaries en `m0`, `c4`
  (F/D.4/D.5), `m11` (parte de banda E-O); ver `TEST_TAXONOMY`.
- **Rollback:** mediano — reintroducir el archivo de física es posible pero
  ya nadie lo usa; el riesgo real es bajo porque R4 ya cubre los cambios de
  room.
- **MUST NOT:** no reintroducir "un hueco de muro = conexión"; no tocar
  `rooms.ts`.

---

### R6 — Retirar ox/oy del runtime y tests continuos

**Objetivo:** `world.ts` deja de ser autoridad de gameplay; los tests
de offsets se reemplazan.

- **Archivos que se modifican:**
  - `world.ts` → se degrada a **esquemático**: la tabla de rooms se
    conserva como referencia del mapa (o se sustituye por el grafo +
    posiciones esquemáticas de `ARC1_SPATIAL_MAP.md`); `worldOf`/`ox/oy`
    dejan de consultarse en runtime. B6 resuelto.
  - `ExplorationScene.toggleMap` → consume el grafo (aristas) + posiciones
    esquemáticas; ya no usa `world.rooms` como geometría.
  - `m0-continuous-world.test.ts` → **se reescribe como test de grafo**
    (topología + locks + critical path), o se **retira** si `rg0`/`rt0` ya
    lo cubren.
- **Invariante:** ningún valor `ox/oy` aparece en el runtime ni en asserts
  de tests de producto.
- **Tests:** reescribir/retirar `m0`; limpiar `r1`/`r4`/`c4` de offsets
  (ver `TEST_TAXONOMY.md`).
- **Rollback:** bajo (cambio de datos muertos); recuperar el esquemático si
  el mapa lo necesita.
- **MUST NOT:** no cambiar la topología canónica de `ARC1_ROOM_GRAPH.md`;
  no eliminar landmarks/regiones del esquemático.

---

### R7 — Revalidar Plaza 1920×1080

**Objetivo:** confirmar en runtime que la Plaza room-local 1920×1080
funciona de punta a punta.

- **Archivos que se modifican:**
  - `rooms.ts` → fix B4 (`despertarOhm` usa el pedestal `(960,640)` en vez
    de `(480,342)`); revisar `plaza.doors.taller` para que la door sea
    coherente con su entry (la door ya no genera abertura de muro; sólo
    define la salida de la transición).
- **Invariante:** Plaza navegable en 1920×1080 sin cambios de room; las 5
  transiciones Plaza→{Taller, Puerta, Castillo, Forja, Terrazas} resuelven
  su entry destino; la cámara clampa dentro del área.
- **Tests:** `c4` conservado en sus secciones de invariante (dims, walkable,
  cámara, una-sola-area); `r0`/`r2`/`r3` verdes; gameplay de Player-Agent.
- **Rollback:** bajo (fixes de datos locales).
- **MUST NOT:** no agrandar más rooms; no cambiar el viewport; no tocar
  puzzles.

---

## 3. Secuencia de commits (orden)

```text
C1  (docs)  ADR-002 + SPATIAL_CONTRACT + MIGRATION_PLAN + TEST_TAXONOMY
            + banners de democión (SPATIAL_MAP, áreas, AGENTS.md)   ← ESTE PAQUETE
C2  (R1)    roomGraph.ts + rg0-room-graph.test.ts + un-legacy r1/r4-salas
C3  (R2)    ActiveRoom local (activeArea.ts, spatial.ts, ExplorationScene) + r4/r1 reescritos
C4  (R4)    transitionTo() unificado + rt0-transitions.test.ts + fix B3 (grafo respeta visible)
C5  (R3)    render de una sola room + rr0-render-active-room.test.ts + fix B5
C6  (R5)    eliminar boundaries/gapRect/enterArea-por-chunk + limpieza spatial.ts
C7  (R6)    world.ts esquemático + toggleMap por grafo + m0 → test de grafo
C8  (R7)    fix B4 + revisión doors/entries Plaza + revalidación c4 + playtest Portal→Faro
```

> Cada commit es independiente y reversible. No se fusiona C(n+1) sin
> `npm run build` + `npm test` + el gameplay de regresión correspondiente.

---

## 4. Definition of Done de la migración

- El jugador recorre **Portal → Faro** (critical path de
  `ARC1_ROOM_GRAPH.md` §6) con transiciones por grafo + entries.
- Una sola room se renderiza por vez.
- La cámara nunca sale de la room activa (bounds locales).
- Ningún valor `ox/oy` es autoridad de runtime.
- La Plaza 1920×1080 funciona como room grande; B1–B7 resueltos.
- `npm run build`, `npm test`, `npm run verify` verdes; tests por
  invariante (`TEST_TAXONOMY.md`).
- Ningún documento conserva lenguaje de plano mundo continuo como
  autoridad de runtime.
