# Ohmdal — Test Taxonomy (Room-Based)

> **Estado:** `CANON` (ratificado por `ADR-002`, 2026-08-18).
> **Rige:** la estrategia de tests del runtime de `src/jugar/` a partir de
> la migración room-based (`MIGRATION_PLAN.md`).
> **Acompaña:** `SPATIAL_CONTRACT.md`, `ARC1_ROOM_GRAPH.md`.
>
> Regla de oro: **los tests validan invariantes de producto, no accidentes
> de implementación.** Un test que afirme un valor de `ox/oy` valida un
> accidente del plano mundo y muere con él.

---

## 1. Taxonomía por invariante de producto

| Familia | Invariante de producto | Ejemplos de assert |
|---|---|---|
| **ROOM DIMENSIONS** | El viewport es distinto del tamaño de la room; una room puede medir varios viewports; una room grande sigue siendo **una** room | `viewport === 960×540`; `areaDimensions('plaza') === 1920×1080`; cambiar el cuadrante visible no cambia `activeRoom.id` |
| **CAMERA** | La cámara clampa/sigue **dentro** de la room activa (bounds locales `(0,0,w,h)`) | `clampCenter` en 4 bordes con rect local; `cameraBounds((0,0,1920,1080), viewport)` |
| **GRAPH** | Toda conexión existe, con salida y entry destino válidas; locks/visibilidad no circulares; critical path alcanzable | `connection('plaza','taller')` resuelve entry en `taller`; `isAvailable` respeta `visible/locked`; Portal→Faro alcanzable |
| **TRANSITIONS** | Plaza→Taller resuelve la entry destino; el swap cambia `ActiveRoom`; `playerLocal` se resetea al entry; sin dependencia del offset de la room destino | `transitionTo('taller')` → `activeRoom.id==='taller'`, `playerLocal==entries.plaza`; ninguna lectura de `ox` en el camino |
| **RENDERING** | Sólo la room activa se construye/renderea | `loadRoom('plaza')` no construye `taller`; no existe `tileSprite` del render-union |
| **REGRESSION** | Puzzles, narrativa, diálogos, Bitácora y estado siguen intactos | Suites `f*`, `t*`, `l*`, `m*` (modelos), `ohmdal-arco1-*` sin cambios |

---

## 2. Tabla de migración de tests existentes

> Estado = qué hacer con el archivo en la migración. Las fases referencian
> `MIGRATION_PLAN.md`.

| Archivo de test | Estado | Acción |
|---|---|---|
| `r0-area-dimensions.test.ts` | **KEEP** (revisar) | Ya valida invariantes de dimensiones. Renombrar secciones "commit 4" a "ADR-002" cuando el runtime migre. |
| `r1-spatial-contract.test.ts` | **REWRITE** | Conservar viewport/navigationBounds/isPointInsideArea; **eliminar** `localToWorld/worldToLocal/unionAreaBounds/chunkRectWorld/chunkCenterWorld/isPointInsideChunk` y todo assert de offsets. |
| `r2-camera-director.test.ts` | **KEEP** | 100% válido: geometría pura sobre rect local. No toca offsets. |
| `r3-decor-large-area.test.ts` | **KEEP** | Decor derivado de `AreaDef`: invariante válido. |
| `r4-active-area-semantics.test.ts` | **RETIRE** (R2, reemplazado) | La semántica valiosa (una room = autoridad, bounds locales, switch atómico) quedó migrada a `ra0-active-room-local`; los supuestos de `LoadedChunks`/offsets se descartaron. Se eliminó el archivo. |
| `c4-plaza-large-greybox.test.ts` | **REWRITE (parcial)** | **KEEP** A/B/C/E/G/H/S.1/S.3 (dims, walkable, cámara, una-sola-area, doors/entries, no-regresión). **ELIMINAR** F (offset adjacency/no-overlap), G.4 (`taller.ox`), S.2 ("mundo continuo"), D.4/D.5 (offset translation). |
| `m0-continuous-world.test.ts` | **REWRITE** | Convertir en test de **grafo**: `RoomGraph.connection('plaza','taller')` existe; locks del critical path; puerta→manantial alcanzable. **Retirar** asserts de `ox/oy`. Si `rg0-room-graph` lo cubre, retirar el archivo. |
| `m11-plaza-workshop-hitbox.test.ts` | **REWRITE (parcial)** | **KEEP** verificación de que la door/entry del Taller son locales coherentes. **ELIMINAR** la aserción de que el walkable "cruza el muro este" como conexión física (deja de ser cierto; la conexión es transición). |
| `m16-ohm-companion-bell-continuity.test.ts` | **KEEP** | Coordenadas locales de campana/pedestal: invariante. |
| `m22/m23/m24` (plaza evidence/pedestal/vs-anchors) | **KEEP** | Datos locales; ajustar coordenadas de cosas si B4 cambia algo. |
| `f1-forge-rooms` / `t1-terraces-rooms` / `l1-lighthouse-rooms` | **KEEP** | Validan geometría local dentro de cada room (960×540); invariantes de walkable/doors por room. |
| `f0/f2-f5`, `t0/t2-t5`, `l0/l2-l6` | **KEEP** | Puzzles/narrativa renderer-neutral. |
| `m2..m21` (bell, chain, branches, distributor, timbre, warmth, infirmary, longchannel, forge, steps, fairsplit, singlestone, ladder, storedspark, sleepingriver, clock, lighthouse, bencn, ohm-model, freno, puerta, gate intro/refresh, keyboard, post-workshop) | **KEEP** | Modelos puros + datos de salas. |
| `_legacy_r1-grafo-de-salas.test.ts` | **UN-LEGACY** | Valida que todo `doors[].to` apunta a una room existente: es exactamente un invariante del grafo. Renombrar sin prefijo en R1. |
| `_legacy_r4-conectividad-salas.test.ts` | **UN-LEGACY** | Valida que cada door de una room es alcanzable desde su propio walkable: invariante room-local. Renombrar sin prefijo en R1. |
| `ohmdal-arco1-continuity/diagnosis/distribution.test.ts` | **KEEP** | Continuidad narrativa/eléctrica, renderer-neutral. |
| `ohmdal-layout-constraints.test.ts`, `h3-cuenca-complete.test.ts` | **KEEP** | Validan el layout HD-2D LEGACY (`src/hd2d-ohmdal`, `src/ohmdal/layout`) — fuera del alcance del runtime `src/jugar/`. No dependen del plano mundo de `src/jugar`. |
| `_legacy_*` restantes (hd2d/architecture) | **KEEP como legacy** | No se reactivan; pertenecen a la rama HD-2D experimental. |

---

## 3. Tests nuevos a añadir

| Archivo | Familia | Contenido |
|---|---|---|
| `rg0-room-graph.test.ts` (R1) | GRAPH | Conexiones derivadas válidas; entries resuelven dentro del bbox destino y son `legal`; locks no circulares; critical path Portal→Faro; `kind`/`cinematic` coherentes. |
| `rt0-transitions.test.ts` (R4) | TRANSITIONS | `transitionTo('taller')` desde Plaza: `activeRoom.id` cambia, `playerLocal === entry`, cámara = `(0,0,960,540)`; sin lectura de offset del destino. |
| `rr0-render-active-room.test.ts` (R3) | RENDERING | `loadRoom('plaza')` construye sólo `plaza`; no existe render-union. |
| `ra0-active-room-local.test.ts` (R2) | ROOM DIMENSIONS + ActiveRoom | `setActiveRoom` atómico; `playerLocal` confinado a `[0,w)×[0,h)`; vecinos no afectan bounds. |

---

## 4. Reglas de escritura

1. **Prohibido** afirmar valores de `ox/oy`, "room vecina renderizada",
   adyacencia física entre rooms, o `unionAreaBounds` como autoridad.
2. **Obligatorio** que los tests espaciales sean **puros** (sin Phaser)
   cuando sea posible: importan `roomScenesData`, `roomGraph`, `activeRoom`,
   `cameraDirector`.
3. El gameplay se valida **jugando** (Player-Agent), no sólo con tests
   puros. Un test puro verde **no** es evidencia de que la transición se
   sienta bien.
4. Los invariantes de `ARC1_ROOM_GRAPH.md` (locks, cinemáticas, critical
   path) se prueban **una sola vez** (en `rg0`); los tests de salas no los
   duplican.
5. Cuando el runtime deje de tener `ox/oy`, los tests que los usen deben
   **borrar el assert**, no "arreglarlo" para que pase con otro valor
   (regla 12 del AGENTS.md raíz: nunca debilitar criterios para obtener
   PASS).
