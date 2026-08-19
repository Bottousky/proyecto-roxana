---
adr_id: ADR-002
title: "Room-Local Spatial Architecture para Ohmdal; el runtime es un grafo de rooms con coordenadas locales independientes, no un plano mundo continuo"
status: CANON
date_ratified: 2026-08-18
author: Manuel
proposer: Manuel
ratified_by: Manuel
deciders: Manuel
refines:
  - ADR-001 (define la forma exacta del modelo multi-área ratificado en ADR-001: rooms con coordenadas locales + grafo, en lugar de plano mundo continuo)
supersedes:
  - docs/20-worlds/ohmdal/room-based/ARC1_SPATIAL_MAP.md §1.2, §1.5, §2, §3, §3.1, §8, §9 (la interpretación de las coordenadas numéricas `x0/y0/width/height` como autoridad de runtime del plano mundo pasa a **esquemático**; la topología se conserva)
  - docs/20-worlds/ohmdal/room-based/areas/*.md (las secciones "World position" y "Continuidad con vecinos" pasan a ser contexto esquemático, no contrato de runtime)
  - docs/20-worlds/ohmdal/AGENTS.md §3 (la frase "El mundo son áreas contiguas mayores que el viewport" se reescribe a room-based; ver §6 de este ADR)
  - src/jugar/world.ts (el registro `WORLDS[0].rooms.ox/oy` deja de ser autoridad de gameplay en la migración R6; los IDs de sala se conservan)
depends_on:
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ADR-001-phaser-multiarea-arc1.md
  - docs/20-worlds/ohmdal/room-based/RECOVERY_AUDIT.md
  - docs/20-worlds/ohmdal/room-based/ARC1_ROOM_GRAPH.md
  - docs/20-worlds/ohmdal/room-based/ARC1_SPATIAL_MAP.md
  - docs/20-worlds/ohmdal/room-based/SPATIAL_CONTRACT.md
  - docs/20-worlds/ohmdal/room-based/MIGRATION_PLAN.md
  - docs/20-worlds/ohmdal/room-based/TEST_TAXONOMY.md
---

# ADR-002 — Room-Local Spatial Architecture

> **Resumen ejecutivo.** El runtime de Ohmdal en `src/jugar/` no es un
> mundo físico continuo: es un **grafo de rooms/áreas independientes**,
> cada una con su propio sistema de coordenadas **local**, conectadas por
> **transiciones**. El viewport lógico (960×540) es distinto del tamaño de
> una room (una room puede medir varios viewports, p. ej. la Plaza
> 1920×1080). Las transiciones entre rooms son aristas del grafo, no
> continuidad geométrica en un plano mundo. Este ADR fija ese modelo como
> la arquitectura espacial vigente de Ohmdal y ordena la migración del
> estado híbrido actual (mundo continuo con `ox/oy` + `ActiveArea`
> sobrepuesto) al modelo room-local, **antes** de que se escriba código de
> migración.
>
> **Estado de la decisión:** `CANON` ratificado por Manuel en sesión de
> arquitectura. Rige la migración de recovery documentada en
> `MIGRATION_PLAN.md`. Ningún código runtime se modifica en esta fase;
> este ADR congela la arquitectura objetivo.

---

## 1. Contexto

### 1.1 El estado actual (híbrido continuo + active-area)

La auditoría de recuperación (sesión previa, `RECOVERY_AUDIT.md` + audit
de spatial architecture) encontró que el runtime evolucionó hacia un
modelo **híbrido**:

- `src/jugar/world.ts` declara un único `WORLDS[0]` (`ohmdal`) con las 20
  salas posicionadas en un **plano mundo compartido** por offsets
  `(ox, oy)`.
- `ExplorationScene.loadRoom` carga **todas** las rooms del mundo
  (`chunks = world.rooms`) y las construye/renderea simultáneamente.
- La conexión entre rooms se modela como **física de muros compartidos**
  (`computeBoundaries` + `pushWallSolids` + `gapRect`): el jugador
  "camina" por un hueco del muro para cambiar de room.
- Sobre ese mundo continuo se "ató" una capa `ActiveArea`
  (`activeArea.ts`) que limita la cámara y la navegación a **una sola**
  room — un paso correcto en la dirección del modelo objetivo, pero
  implementado sobre offsets del plano mundo (`chunkRectWorld(placement)`).
- Cuando la Plaza pasó a 1920×1080 (commit 4 de H3), el plano continuo
  obligó a **reposicionar vecinos** (`taller → (1920,0)`, cadena de
  `terraces_* +540`) sólo para evitar solapamientos. Ese reposicionamiento
  es la causa raíz de puertas desalineadas entre Plaza y sus 4 vecinos
  (el cruce físico aterriza fuera del `walkable` y un rescue invisible
  teletransporta al jugador; la conexión Plaza→Taller quedó sellada).
- Los tests de esa fase validan **adyacencia de offsets** (`taller.ox ===
  Plaza.x + Plaza.w`) en lugar de **transiciones de room** — validan el
  accidente de implementación, no el invariante de producto.

### 1.2 Por qué esto es una derivada, no el diseño

El brief original y `ADR-001` piden "áreas contiguas mayores que el
viewport con cámara móvil", tomando como referencia la lógica espacial de
RPGs (Pokémon FireRed/LeafGreen). Esa referencia **no** requiere un plano
mundo continuo: requiere rooms más grandes que el viewport y transiciones
controladas. La elección de implementar continuidad física por offsets fue
una decisión de código, no de producto, y arrastra los defectos listados
en el registro de bugs (`MIGRATION_PLAN.md` §0).

### 1.3 Lo que ya es correcto y se conserva

- `RoomSceneProfile` con `walkable/collision/doors/entries/things/effects`
  en **coordenadas locales** (contract excelente).
- `AreaDef.width/height` opcional (default 960×540) — la semilla correcta.
- `CameraDirector` puro (geometría sobre un rect) — agnóstico del plano
  mundo, se conserva tal cual.
- El concepto de `ActiveArea` ("una room = autoridad de cámara") — es la
  semilla de `ActiveRoom`.
- El grafo conceptual de `ARC1_ROOM_GRAPH.md` (topología, locks,
  cinemáticas, critical path) — se conserva íntegro.
- La topología de `ARC1_SPATIAL_MAP.md` (11 macroáreas, 5 regiones,
  landmarks, paths, vecinos N/S/E/O) — se conserva.

---

## 2. Decisión

El runtime de Ohmdal es **room-based**:

1. **Rooms independientes.** Ohmdal no es un plano mundo físico continuo.
   Las rooms (Plaza, Taller, Terrazas, Castillo, Forja, Manantial, Lago,
   Faro, …) son escenas/áreas independientes conectadas por un grafo.
   `RoomB.worldX = RoomA.worldX + RoomA.width` **no es** un requisito, y
   renderizar dos rooms simultáneamente **no es** un requisito.
2. **Viewport ≠ tamaño de room.** El viewport lógico se mantiene en
   960×540. Una room puede tener cualquier tamaño lógico (Plaza 1920×1080;
   Lago 2400×1620 en el futuro). La cámara se mueve **dentro** de la room
   activa. Una room grande sigue siendo **una** room: cambiar el cuadrante
   visible del viewport **no** cambia la room activa.
3. **Coordenadas locales.** Cada room posee su propio sistema de
   coordenadas local: `x ∈ [0, width]`, `y ∈ [0, height]`. Posición del
   jugador, entries, doors, walkable, collision, things, NPCs,
   interacciones, objetos de puzzle y landmarks son **room-local**. El
   gameplay de runtime **no requiere** coordenadas mundo absolutas entre
   rooms independientes.
4. **RoomGraph = topología, no geometría.** El grafo responde a: qué room
   conecta con cuál; por qué salida; a qué entry de destino; qué tipo de
   transición; qué condición de lock/visibilidad. No responde a la
   colocación física en un plano compartido. La topología de
   `ARC1_SPATIAL_MAP.md` sigue siendo canónica y útil; sus **valores
   numéricos de mundo se degradan de autoridad de runtime a información
   esquemática/provisional**.
5. **ActiveRoom única.** Hay exactamente una room con autoridad de
   gameplay: `ActiveRoom = { id, playerLocalPosition }`. Cámara,
   navegación, colisiones e interacciones se evalúan contra la room activa
   solamente. Rooms cargadas/precargadas **no** influyen en bounds de
   cámara, navegación, colisiones ni clamping del jugador.
6. **Render de la room activa.** El gameplay normal renderiza la room
   actual. No se renderizan las 20 rooms de Ohmdal simultáneamente.
   Precargar assets está permitido; renderizar rooms vecinas en un plano
   físico compartido no es un requisito arquitectónico.
7. **Cámara.** `CameraDirector` se conserva. Los bounds de cámara de la
   room activa son conceptualmente `{ x: 0, y: 0, width: activeRoom.width,
   height: activeRoom.height }` con viewport 960×540. Room mayor que
   viewport → la cámara sigue/clampa dentro de la room. Room == viewport →
   la cámara queda efectivamente fija.
8. **Transiciones.** Son transiciones de grafo. La arquitectura objetivo
   soporta `fade`, `doorway`, `cinematic`, y reserva `seamless` (futuro)
   **sin** requerir un plano mundo global: una transición puede sentirse
   continua visualmente mientras cambia de un sistema de coordenadas local
   a otro.
9. **World map ("M").** El mapa del juego es **esquemático**: comunica
   topología/geografía/legibilidad (estilo "metro map"). No está obligado a
   representar coordenadas exactas de runtime de Phaser.
10. **Plaza 1920×1080.** Se acepta como la prueba oficial de que
    "room size > viewport" es soportado. Se conservan `width=1920`,
    `height=1080`, el comportamiento de cámara de room grande, el
    `walkable`/`collision` room-local, el decor local y las
    doors/entries/things locales donde aporten. **No** se agrandan Taller,
    Puerta ni otras rooms durante esta fase de arquitectura.
11. **Fusión Terrazas/Faro.** No se decide aún si regiones multi-pantalla
    (Terrazas, Faro) serán un RoomDef grande o varios RoomDefs conectados.
    La arquitectura debe soportar ambas. Es decisión futura de level design.
12. **Recuperación directa.** No se aplicará un parche intermedio para que
    la conexión física Plaza→Taller funcione (gapRect). La física de muros
    compartidos es la dirección equivocada y se elimina. La migración va
    directa al modelo room-based (`MIGRATION_PLAN.md`).

---

## 3. Consecuencias

### 3.1 Positivas

- **Dimensiones arbitrarias de room** sin reacción en cadena sobre
  vecinos: cambiar `width/height` de una room **no** obliga a reposicionar
  rooms no relacionadas.
- **Cámara/navegación/colisión más simples**: bounds locales `(0,0,w,h)`,
  sin offsets, sin unión de chunks.
- **Transiciones más simples**: cambiar de room = cambiar de sistema local
  + entry de destino + bounds de cámara. Sin muros compartidos, sin
  `gapRect`, sin rescue teleports para cruces.
- **Fondos independientes**: cada room conserva su fondo/estado de render
  sin coordinar con vecinos.
- **Level design más libre**: fusionar o partir rooms (Terrazas, Faro) es
  una decisión de datos, no un rediseño de plano.
- **Menos comportamientos ocultos**: se elimina el rescue invisible
  (`nearestLegalPoint` como mecanismo de cruce) y el `tileSprite` gigante
  del render-union (8640×4860).

### 3.2 Tradeoffs

- Se requiere un **sistema de transiciones explícito** (todas las
  conexiones pasan por el grafo, no por caminar un hueco de muro).
- Los tests de mundo continuo (`m0`, secciones de `r1`/`r4`/`c4`) deben
  **cambiar**: validarán invariantes de producto, no offsets.
- Supuestos de `world.ts` (`ox/oy`, `worldOf`, `unionAreaBounds` para
  render-scope) quedan obsoletos en el runtime; se degradan a esquemático.
- La coreografía de NPC entre rooms (`walksTo`, `incomingActorKeys`)
  requiere conversión a entries de destino (se preserva la mecánica,
  cambia la base de coordenadas).
- La **fusión futura** de Terrazas/Faro no se resuelve en este ADR; queda
  abierta por decisión explícita (§4 Q3).

---

## 4. Alternativas rechazadas

### A. Plano mundo continuo gigante (mantener y extender `WORLDS[0]`)

- ❌ Contradice el modelo de producto (room-based) ratificado aquí.
- ❌ Cada cambio de tamaño de una room obliga a reposicionar vecinos
  (evidencia: commit 4 desplazó Taller y la cadena de Terrazas).
- ❌ Render de todas las rooms simultáneas → `tileSprite` gigante, memoria,
  sin culling.
- ❌ La conexión física por muros compartidos demostró ser frágil
  (puertas desalineadas, rescue teleports, leak de progreso en Forja).
- Registro: no se volverá a proponer sin un ADR nuevo.

### B. Híbrido "mundo cargado + autoridad de active-area" (estado actual)

- El paso de `ActiveArea` (una room = autoridad) es correcto, pero
  implementarlo sobre offsets del plano mundo conserva la deuda: los
  cruces siguen dependiendo de la física de muros y de la renderización de
  vecinos.
- ❌ Mantiene dos mecanismos de conexión (hueco de muro + fade) con
  semánticas distintas y alineación frágil.
- ❌ No resuelve el render de las 20 rooms ni el `tileSprite` gigante.
- La migración **reusa la semántica** de ActiveArea y la convierte en
  `ActiveRoom` local; no conserva su implementación por offsets.

### C. Conservar offsets sólo para alinear puertas

- ❌ Parchar `gapRect` para que Plaza→Taller "funcione" ahorra una semana
  y arrastra la física equivocada por meses.
- ❌ Mantiene el doble mecanismo de conexión y el rescue teleport.
- ❌ El precio de una transición de room simple (entry + fade) es menor que
  el mantenimiento continuo del plano mundo.
- Registro: prohibido por decisión de recuperación directa (§2.12).

---

## 5. Contratos que gobiernan la migración

Los tres documentos adjuntos son **parte de esta decisión** y se ratifican
junto con este ADR:

| Documento | Contenido |
|---|---|
| `docs/20-worlds/ohmdal/room-based/SPATIAL_CONTRACT.md` | Contrato espacial room-based: glosario, RoomGraph, ActiveRoom, cámara, transiciones, render, mapa esquemático, matriz de responsabilidades, validación. |
| `docs/20-worlds/ohmdal/room-based/MIGRATION_PLAN.md` | Plan de migración R1–R7 (commits reversibles), registro de bugs conocidos con fase propietaria, DoD de la migración. |
| `docs/20-worlds/ohmdal/room-based/TEST_TAXONOMY.md` | Taxonomía de tests por invariante de producto y tabla KEEP/REWRITE/RETIRE/UN-LEGACY. |

Los bugs detectados en la auditoría se documentan como **issues de
migración** con fase propietaria en `MIGRATION_PLAN.md` §0 y **no** se
parchean en esta fase:

| Bug | Fase propietaria |
|---|---|
| Plaza→Taller sellada / gapRect mal orientado | R5 (se elimina la física de muros; no se parchea) |
| `nearestLegalPoint` enmascara cruces inválidos | R4/R5 (las transiciones por entries lo vuelven irrelevante para cruces) |
| Boundary de Forja ignora `visible()` (leak de progreso) | R4 (el grafo respeta visibilidad antes de ofrecer transición) |
| `despertarOhm` usa coordenadas de la Plaza vieja (480,342) | R7 (revalidación de Plaza; fix independiente de 1 línea) |
| `tileSprite` gigante del render-union | R3 (render de la room activa) |
| Cambios de offsets del commit 4 = arreglos de síntoma | R6 (se retiran `ox/oy` de runtime; `taller`/`terraces` vuelven a su tamaño natural) |

---

## 6. Cambios derivados (governance de este paquete)

| Archivo | Cambio |
|---|---|
| `docs/20-worlds/ohmdal/room-based/ARC1_SPATIAL_MAP.md` | Banner de democión: las coordenadas son esquemáticas y **no** se interpretan como coordenadas mundo obligatorias de Phaser; "cambiar `width/height` de una room no debe reposicionar rooms no relacionadas". Topología intacta. |
| `docs/20-worlds/ohmdal/room-based/areas/*.md` | Banner idéntico en las 11 fichas: secciones "World position" y "Continuidad con vecinos" pasan a contexto esquemático. |
| `docs/20-worlds/ohmdal/AGENTS.md` | §1 y encabezado: añadir `ADR-002`, `SPATIAL_CONTRACT.md`, `MIGRATION_PLAN.md`, `TEST_TAXONOMY.md` a las lecturas obligatorias. §3: reescribir la frase "El mundo son áreas contiguas..." a room-based. |
| `docs/00-governance/ADR-001-phaser-multiarea-arc1.md` | Añadir `refined_by: ADR-002` y una nota de puntero (§2.1) para que ADR-002 defina la forma exacta del modelo multi-área. |

---

## 7. Definition of Done de esta fase

- ✅ `ADR-002` reemplaza explícitamente la suposición de runtime de plano
  mundo continuo.
- ✅ Futuros agentes distinguen: viewport, tamaño de room, coordenadas
  locales de room, room graph, mapa esquemático.
- ✅ Contrato de `RoomGraph` explícito (`SPATIAL_CONTRACT.md` §3).
- ✅ Contrato de `ActiveRoom` explícito (`SPATIAL_CONTRACT.md` §4).
- ✅ Ciclo de vida de transición explícito (`SPATIAL_CONTRACT.md` §6).
- ✅ La documentación ya no implica que el tamaño de una room fuerce el
  reposicionamiento de vecinos.
- ✅ Migración dividida en commits pequeños y reversibles
  (`MIGRATION_PLAN.md`).
- ✅ Estrategia de tests por invariantes de producto, no por valores de
  `ox/oy` (`TEST_TAXONOMY.md`).
- ✅ **No se modificó código runtime** en esta fase.

---

## 8. Referencias

- `ADR-001-phaser-multiarea-arc1.md` — dirección de producción multi-área
  que este ADR refina.
- `SPATIAL_CONTRACT.md` — contrato espacial room-based.
- `MIGRATION_PLAN.md` — plan de migración y registro de bugs.
- `TEST_TAXONOMY.md` — taxonomía de tests.
- `RECOVERY_AUDIT.md` — auditoría del runtime (origen de la migración).
- `ARC1_ROOM_GRAPH.md` — grafo canónico de áreas (se conserva íntegro).
- `ARC1_SPATIAL_MAP.md` — topología canónica; valores numéricos ahora
  esquemáticos.
- `ROXANA_CANON_POLICY_v1.md` — política de canon (estados y ratificación).
