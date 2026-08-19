---
adr_id: ADR-001
title: "Phaser 4 multi-área gana como dirección de producción del Arco I de Ohmdal; HD-2D Three.js queda como rama experimental"
status: CANON
date_ratified: 2026-08-17
author: Manuel
proposer: Manuel
ratified_by: Manuel
deciders: Manuel
refined_by: ADR-002 (define la forma exacta del modelo multi-área: room-based con coordenadas locales + room graph; sin plano mundo continuo)
supersedes:
  - ROADMAP.md §4 H2-H7 (se reorientan; ver §6 de este ADR)
  - docs/20-worlds/ohmdal/AGENTS.md línea 55 (texto literal "no recibe la nueva dirección visual por inercia")
  - docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md (pasa a ser referencia conceptual, no plan de producción)
  - docs/20-worlds/ohmdal/arcol-rebuild/03-hd2d-greybox-build.md (idem)
depends_on:
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/20-worlds/ohmdal/AGENTS.md
  - docs/20-worlds/ohmdal/room-based/RECOVERY_AUDIT.md
  - docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md
  - docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md
  - docs/20-worlds/ohmdal/room-based/ARC1_ROOM_GRAPH.md
  - docs/20-worlds/ohmdal/room-based/ARC1_SPATIAL_MAP.md
---

# ADR-001 — Phaser 4 multi-área gana como dirección de producción del Arco I de Ohmdal

> **Resumen ejecutivo.** La campaña 2 (Ohmdal Arco I "La Luz") se produce
> sobre el runtime Phaser 4 existente en `src/jugar/`, evolucionado a un
> modelo de **áreas mayores al viewport, cámara móvil, transiciones
> controladas, world state por región y cinemáticas**. La rama
> `src/hd2d-ohmdal/` (Three.js) queda **explícitamente como rama
> experimental** sin promover su contenido a canon por accidente.
> Esta decisión es material (cambia la dirección visual, el árbol de
> foco y la base de regresión de la campaña 2) y queda ratificada por
> Manuel, de acuerdo con `AGENTS.md` §3 regla 15.

---

## 1. Contexto

### 1.1 Lo que estaba vigente

`ROADMAP.md` (versión del 16 de agosto de 2026) y `docs/START_HERE.md`
declaran que la **dirección de producción de Ohmdal** es **HD-2D
Three.js** en `src/hd2d-ohmdal/`. Concretamente:

- "**H2 — Plaza real HD-2D · ← foco actual**" (ROADMAP §4).
- "`/jugar`: Phaser top-down greybox, Arco I completo como baseline de
  contenido/regresión" (ROADMAP §2, campaña 2).
- "el runtime Phaser de `/jugar` conserva el Arco I greybox como
  baseline de contenido y regresión. No define la presentación final y
  no debe recibir la nueva dirección visual por inercia" (START_HERE
  §Ohmdal).
- "`/jugar` no recibe la nueva dirección visual por inercia y se
  conserva hasta que exista paridad suficiente" (ROADMAP §2).

`docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md` y
`03-hd2d-greybox-build.md` desarrollan esa dirección con un modelo de
**overworld simbólico + dioramas regionales compactos** (con cargas y
descargas) y un layout JSON detallado en
`docs/20-worlds/ohmdal/world/layout/arc1-layout.json`.

### 1.2 El brief que invierte la decisión

Manuel (autoridad de producto) emite un brief el 17 de agosto de 2026
que pide explícitamente:

- "recuperar la versión Phaser existente de Ohmdal, auditarla,
  preservar todo lo útil y **transformarla en la arquitectura
  definitiva para construir el Arco I completo**";
- "Phaser 4 + mundo organizado en áreas/rooms semánticas + escenarios
  mayores que el viewport + cámara móvil + transiciones controladas
  entre áreas + world state + cinemáticas para momentos hero";
- "**NO quiero un mundo 3D seamless**";
- "**NO quiero volver a Godot, Three.js o Babylon**";
- "**NO quiero un mundo formado por pequeñas pantallas estáticas de
  960×540**";
- producir "**TODO EL ARCO I como greybox navegable y espacialmente
  coherente**" en GREYBOX, antes de invertir en arte.

El brief no niega la fantasía HD-2D en sí; sí rechaza la arquitectura
3D seamless y la idea de dioramas discretos. Pide un modelo
intermedio: áreas contiguas, más grandes que el viewport, con
cámara móvil — la referencia explícita es la lógica espacial de
RPGs como Pokémon FireRed/LeafGreen, no la cámara libre de un
overworld.

### 1.3 La auditoría

El `RECOVERY_AUDIT.md` (este mismo paquete, en
`docs/20-worlds/ohmdal/room-based/`) establece que el runtime
existente en `src/jugar/` ya tiene **semillas** del modelo pedido:

- sistema de mundo continuo por chunks (`WORLDS`, `Boundary`,
  `pushWallSolids`);
- cámara con `setBounds` y `startFollow` ya operativos;
- 20 salas con `RoomSceneProfile` completo (walkable, collision,
  doors, entries, things, effects, perspective);
- 20+ modelos de puzzle renderer-neutral;
- infraestructura de cinemática ad-hoc (`playAwakening`) y debug
  de mundo (`toggleMap`).

El audit también documenta la deuda: `W = 960, H = 540` constantes
globales, salas mayoritariamente pintadas a 960×540, y un mapa
mundial que ya tiene offsets pero siempre a 960×540 entre chunks.
La refactorización es **evolución del sistema**, no reescritura
desde cero, y no requiere nuevas dependencias.

### 1.4 Lo que está en disputa

La inversión del foco afecta:

| Aspecto | Antes (ROADMAP) | Después (este ADR) |
|---|---|---|
| Dirección de producción del Arco I | HD-2D Three.js (`src/hd2d-ohmdal/`) | Phaser 4 multi-área (`src/jugar/` evolucionado) |
| Foco inmediato | H2 "Plaza real HD-2D" | Plaza multi-área en GREYBOX dentro de `src/jugar/` |
| Base de regresión | `/jugar` (Phaser greybox) | `/jugar` (Phaser multi-área, ahora **producción**, no baseline) |
| Topología | Overworld + dioramas con carga/descarga | Áreas contiguas con cámara móvil y transiciones controladas |
| Arte | HD-2D con assets identitarios | Empezar GREYBOX; arte encima del greybox validado |
| Modelos de puzzle renderer-neutral | Conservar | Conservar (sin cambios) |
| `src/hd2d-ohmdal/` | Producción | Experimental (no se borra, no recibe features nuevas) |
| `arcol-rebuild/02-world-topology.md` | Plan de topología | Referencia conceptual del atlas, no de la arquitectura |
| `arcol-rebuild/03-hd2d-greybox-build.md` | Plan de greybox HD-2D | Idem |

---

## 2. Decisión

Se adopta la **dirección de producción del Arco I de Ohmdal** como
**Phaser 4 multi-área**, sobre el runtime existente en `src/jugar/`,
evolucionado según el brief y el `RECOVERY_AUDIT.md`. La rama
HD-2D Three.js (`src/hd2d-ohmdal/`) **no se descarta del repo**
queda explícitamente como **rama experimental sin promoción a
canon por accidente**.

### 2.1 Forma del cambio

> **Refinado por `ADR-002` (2026-08-18).** La forma exacta del modelo
> multi-área es **room-based**: rooms independientes con coordenadas
> **locales** (mayores que el viewport cuando corresponda), conectadas por
> un **room graph** con transiciones (fade/doorway/cinematic). Los
> contratos detallados viven en `SPATIAL_CONTRACT.md`; la migración desde
> el estado híbrido actual (mundo continuo `ox/oy` + active-area) en
> `MIGRATION_PLAN.md`; la estrategia de tests en `TEST_TAXONOMY.md`.

- 11 macroáreas (ratificadas en este paquete, ver
  `ARC1_ROOM_GRAPH.md`): Plaza Cuenca, Taller, Calzada, Manantial,
  Castillo exterior, Castillo interior, Forja Patio, Forja Profunda,
  Terrazas, Lago, Faro.
- Viewport lógico ≈ 960×540 (Phaser `W`/`H`); las áreas pueden
  medir varias veces el viewport.
- Cámara con `CameraDirector` (dead zones, encuadre autoral,
  modo cinemática).
- Transiciones controladas: fade, doorway, occlusion, cinematic.
- `WorldState` por región con tres estados canónicos
  (DETERIORATED → INTERVENTION → UNDERSTOOD).
- Render mode `GREYBOX` (default de esta fase) y `PAINTED` (con
  los fondos existentes, sin nuevos).
- Cinemáticas con `commit → lock → play → load → restore`,
  skip obligatorio, fallback obligatorio, sin estado
  indispensable dentro de la cinematic.
- Tests de critical path Portal→Faro, cámara bounds, world state,
  render mode, cinematic skip.

### 2.2 Lo que se mantiene canónico sin cambios

- Verbo nuclear **CONECTAR** y disciplina Electricidad (CC).
- Toda la documentación `docs/20-worlds/ohmdal/` y
  `docs/ohmdal-biblia/` como input autoritativo para lore,
  narrativa, pedagogía y reglas del sistema eléctrico.
- Modelos puros de puzzles (`src/puzzles/*Model.ts`).
- `RoomSceneProfile` como contrato de datos (con `width`/`height`
  añadidos opcionalmente).
- `WORLDS[0]` de `world.ts` (cambia la forma del registro, no los
  IDs de salas).
- `Boundary` y `pushWallSolids` (cambia la firma, no el contrato).
- `state.flags` (se agregan flags nuevos, no se borran).
- El árbol de assets `assets/ohmdal/rooms/pilot-arco1/*` y
  `assets/ohmdal/tilesets/*` (siguen siendo válidos para la fase
  PAINTED).

### 2.3 Lo que pasa a `LEGACY` o `EXPERIMENTAL`

| Documento / árbol | Estado anterior | Estado nuevo |
|---|---|---|
| `src/hd2d-ohmdal/` (Three.js runtime) | Producción (ROADMAP) | `EXPERIMENTAL` — no recibe features nuevas; no se promueve a canon por accidente |
| `docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md` | Plan de topología | `LEGACY` — referencia conceptual del atlas; el modelo de "overworld + dioramas" se reemplaza por el de "áreas contiguas con cámara" |
| `docs/20-worlds/ohmdal/arcol-rebuild/03-hd2d-greybox-build.md` | Plan de greybox | `LEGACY` — idem |
| `docs/20-worlds/ohmdal/AGENTS.md` línea 55 ("no recibe la nueva dirección visual por inercia") | Vigente | Se reescribe (ver §6) |
| `ROADMAP.md` §2, §4 (H2-H7) | Vigente | Se reorientan (ver §6) |
| `assets/ohmdal/rooms/pilot-arco1/*` | Producción (fondos finales) | `LEGACY` para producción nueva; válidos como referencia de la fase PAINTED en el refactor |

### 2.4 Lo que se decide en este paquete (no después)

- 11 macroáreas (Plaza Cuenca, Taller, Calzada, Manantial, Castillo
  exterior, Castillo interior, Forja Patio, Forja Profunda, Terrazas,
  Lago, Faro).
- Viewport lógico del juego: **960 × 540 px** (Phaser `W`/`H`).
- Render mode default en esta fase: **`GREYBOX`**.
- Cinemática: se hace la **infraestructura** ahora; el primer hook
  productivo es `awakening` (reencarnando `playAwakening`); el resto
  de hooks (Portal, Puerta, Forja, Faro) se llenan en H3-H7.
- Migración de flags sueltos a `regionState` por región: se hace
  **dentro de este refactor**, no después.

---

## 3. Consecuencias

### 3.1 Positivas

- Una sola dirección de producción para la campaña 2 (no dos en
  paralelo compitiendo por atención).
- La base técnica del Arco I ya existe; la refactorización es
  evolución, no reescritura.
- Los modelos de puzzles renderer-neutral se conservan; nada de
  pedagogía se rompe.
- El árbol `assets/ohmdal/rooms/pilot-arco1/*` se reutiliza en la
  fase PAINTED sin re-trabajo.
- Los 70+ tests de puzzles y conectividad siguen siendo válidos.
- Cero nuevas dependencias: el runtime sigue siendo Phaser 4 con el
  mismo `package.json`.

### 3.2 Negativas / riesgos

- H2 (Plaza HD-2D) se reorienta. Si había features planeadas
  específicas del HD-2D, hay que reasignarlas o repriorizarlas.
- `src/hd2d-ohmdal/` queda congelado salvo spike: cualquier
  desbloqueo requiere un ADR nuevo.
- El refactor introduce un nuevo `AreaDef` con `width`/`height` que
  no existía; hay que validar que los tests de rooms existentes
  siguen pasando.
- La fase GREYBOX de las 11 macroáreas es trabajo de varias
  sesiones; no se entrega en una sola iteración.
- Este ADR **no resuelve** la pregunta de cómo se cierra el ciclo
  con la rama HD-2D experimental (quién la mantiene, con qué
  presupuesto). Queda como `OPEN_QUESTION` (ver §5).

### 3.3 Neutrales

- Los assets identitarios HD-2D que ya se hayan producido siguen
  siendo utilizables como referencia visual, pero no como meta de
  producción del Arco I.
- `arcol-rebuild/02-world-topology.md` y `03-hd2d-greybox-build.md`
  se conservan como referencia conceptual, no como plan de
  producción.

---

## 4. Alternativas evaluadas

### 4.1 Mantener HD-2D Three.js como producción

- ❌ Contradice el brief explícito de Manuel.
- ❌ Obliga a un overworld + dioramas con cargas/descargas, que el
  brief rechaza.
- ❌ El brief pide "no quiero volver a Three.js" para esta campaña.

### 4.2 Phaser 4 multi-área como producción (ADOPTADA)

- ✅ Alinea con el brief.
- ✅ El runtime ya tiene las semillas; la refactorización es
  evolución.
- ✅ Los modelos de puzzles renderer-neutral se conservan.
- ✅ Cero nuevas dependencias.
- ⚠ Requiere update de `ROADMAP.md` y `AGENTS.md` del scope.

### 4.3 Phaser 4 multi-área solo como laboratorio (no producción)

- ⚠ Satisface técnicamente el brief pero contradice la decisión de
  producto: el árbol de foco seguiría siendo HD-2D.
- ❌ Doble trabajo: HD-2D como producción + Phaser como
  laboratorio.
- ❌ El brief pide explícitamente arquitectura **definitiva**, no
  laboratorio.

### 4.4 Híbrido: Phaser 4 multi-área para H2, HD-2D para H5 en adelante

- ⚠ Complica la producción: dos runtimes en la misma campaña.
- ❌ Contradice "una sola dirección" del brief.
- ❌ Rompe el principio P12 (mundos no comparten engine/cámara/
  género obligatorios) si se interpreta como "Ohmdal usa los dos".

---

## 5. Open questions (a resolver en ADR-002+ o en otra sesión)

1. **Mantenimiento de `src/hd2d-ohmdal/`** como rama experimental:
   ¿quién la mantiene, con qué presupuesto, hasta cuándo?
2. **Reconciliación con `arcol-rebuild/`**: ¿se eliminan, se dejan
   como `LEGACY` con un puntero a este ADR, o se reescriben como
   referencia conceptual?
3. **Fusión con el árbol `src/ohmdal-arco1/`** (HD-2D del early
   spike): ¿se queda, se borra, se integra como experimental?
4. **Cierre del gap con el Prólogo / Instituto**: el brief del
   Prólogo vive en `src/hd2d-ohmdal/`; ¿cómo se reconcilia con
   esta decisión?
5. **Bitácora compartida entre runtimes**: la Bitácora (DOM) ya
   está en `src/ui/bitacora.ts` y se usa desde `topdownRuntime`.
   ¿necesita cambios para admitir ambas ramas?

---

## 6. Cambios derivados (a ejecutar en este paquete de governance)

| Archivo | Cambio |
|---|---|
| `ROADMAP.md` §2 (campaña 2) | Reorientar la frase sobre `/jugar` como baseline |
| `ROADMAP.md` §4 (H2-H7) | Reasignar H2 a "Plaza multi-área GREYBOX en `src/jugar/`"; H3-H7 a la nueva secuencia (ver `ARC1_ROOM_GRAPH.md`) |
| `docs/20-worlds/ohmdal/AGENTS.md` línea 55 | Reemplazar el texto sobre `/jugar` no recibiendo la nueva dirección visual por la línea correcta |
| `docs/20-worlds/ohmdal/AGENTS.md` §2 (tabla de hitos) | Actualizar H1-H7 al nuevo modelo |
| `docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md` | Marcar como `LEGACY` con puntero a este ADR |
| `docs/20-worlds/ohmdal/arcol-rebuild/03-hd2d-greybox-build.md` | Idem |
| `docs/20-worlds/ohmdal/AGENTS.md` §5 (convenciones) | `src/hd2d-ohmdal/` pasa de "runtime HD-2D activo" a "rama experimental"; `src/jugar/` pasa de "baseline" a "dirección de producción del Arco I" |

Estos cambios se aplican en la **misma sesión** que este ADR
(antes de iniciar el refactor de código).

---

## 7. Definition of Done de este ADR

- ✅ ADR escrito, fechado, ratificado.
- ✅ `ROADMAP.md` y `docs/20-worlds/ohmdal/AGENTS.md` actualizados.
- ✅ `arcol-rebuild/02-world-topology.md` y `03-hd2d-greybox-build.md`
  marcados como `LEGACY`.
- ✅ `ARC1_ROOM_GRAPH.md` y `ARC1_SPATIAL_MAP.md` generados.
- ✅ 11 fichas de macroárea en
  `docs/20-worlds/ohmdal/room-based/areas/`.
- ⏸ `src/jugar/` refactorizado (en otra sesión / paquetes
  posteriores).
- ⏸ Greybox Portal→Faro jugable (en otra sesión / paquetes
  posteriores).
- ⏸ Tests de critical path verdes (idem).

---

## 8. Cambios posteriores a este ADR (cuando ocurran)

Cualquiera de los siguientes requiere un ADR nuevo (no se hace
dentro de este paquete):

- Reactivar `src/hd2d-ohmdal/` como producción o como spike con
  presupuesto asignado.
- Eliminar `src/hd2d-ohmdal/` del repo.
- Cambiar el verbo nuclear o la disciplina de Ohmdal.
- Cambiar las 11 macroáreas ratificadas.
- Cambiar el viewport lógico del juego.
- Fusionar el árbol `src/ohmdal-arco1/` con `src/jugar/`.
- Reabrir el debate overworld+dioramas como producción.

---

## 9. Referencias

- Brief de Manuel del 17 de agosto de 2026 (sesión que origina este
  ADR).
- `docs/20-worlds/ohmdal/room-based/RECOVERY_AUDIT.md` — auditoría
  del runtime existente.
- `docs/20-worlds/ohmdal/room-based/ARC1_ROOM_GRAPH.md` — grafo de
  las 11 macroáreas.
- `docs/20-worlds/ohmdal/room-based/ARC1_SPATIAL_MAP.md` —
  posiciones y dimensiones de las regiones.
- `docs/20-worlds/ohmdal/room-based/areas/` — 11 fichas de
  macroárea.
- `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md` — contenido
  del Arco I (sin cambios, sigue vigente).
- `docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md` —
  estructura de mundo (sin cambios, sigue vigente como input
  conceptual).
- `docs/20-worlds/ohmdal/arcol-rebuild/02-world-topology.md` —
  referencia conceptual LEGACY.
- `docs/00-governance/ROXANA_CANON_POLICY_v1.md` — política de
  canon.
- `AGENTS.md` §3 regla 15 — escalación de decisiones materiales a
  Manuel.
