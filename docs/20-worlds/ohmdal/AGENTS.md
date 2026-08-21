# AGENTS.md — Ohmdal

> **Verbo nuclear:** **CONECTAR**.
> **Disciplina:** Electrónica (corriente continua).
> **Estado:** foco principal de producción actual.
> **Dirección vigente (desde 2026-08-17, ver `ADR-001`; forma exacta del
> modelo espacial desde 2026-08-18, ver `ADR-002`):** Phaser 4
> **room-based** en `src/jugar/`. Cada room es una escena independiente con
> coordenadas **locales** (puede medir más que el viewport 960×540); las
> rooms se conectan por un **grafo** (`RoomGraph`) con transiciones
> (fade/doorway/cinematic), **no** por un plano mundo continuo.
> El Instituto no se juega en Phaser: es la home isométrica (`/`).
> H1 (baseline Phaser) hecho; la migración room-based en `src/jugar/` se
> ejecuta según `MIGRATION_PLAN.md` (R1–R7).

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Ohmdal. Cualquier agente que trabaje sobre Ohmdal lee ambos.

## 0. Lectura obligatoria mínima (NO más)

Para iniciar **cualquier** trabajo sobre Ohmdal, leer:

1. [`AGENTS.md`](../../../AGENTS.md) raíz.
2. Este archivo.
3. [`room-based/CURRENT_STATE.md`](room-based/CURRENT_STATE.md) — estado
   operativo actual del runtime.
4. `ADR-002` (resumen) **sólo si** la tarea toca runtime espacial
   (rooms, cámara, transiciones, render, navegación). Si la tarea es de
   contenido, balance, copy, puzzle lógico, asset, o test renderer-neutral,
   NO se carga.

> **El resto se lee on-demand** (ver §0.1 y §0.2 abajo).
> Por default, un agente que arranca una tarea Ohmdal **NO** lee:
> las 11 fichas de macroárea, `RECOVERY_AUDIT.md`, `ARC1_SPATIAL_MAP.md`
> (a menos que la tarea sea de topología/geografía), `TEST_TAXONOMY.md`
> (a menos que se migren tests), `MIGRATION_PLAN.md` (a menos que la
> tarea sea de secuenciamiento de recovery), ni la batería completa de
> docs de GDD/vision/narrative.

### 0.1 Patrones de tarea → qué leer

- **Bug local de runtime / transición / cámara**:
  `CURRENT_STATE.md` + `SPATIAL_CONTRACT.md` + el/los archivos de
  `src/jugar/` afectados. Si la transición es entre dos rooms
  específicas, leer también la ficha de macroárea de cada una.
- **Bug de Plaza↔Taller (o cualquier par de rooms)**:
  leer sólo la ficha de las dos macroáreas involucradas + el código
  de la transición. **No** releer el resto de las 9 fichas.
- **Puzzle pedagógico / lógica de modelo**:
  el modelo puro en `src/puzzles/...` + el test asociado en `tests/`.
  Renderer-neutral: no hace falta cargar el runtime.
- **Cámara / cinematic**:
  `SPATIAL_CONTRACT.md` + `src/jugar/camera/` + `src/jugar/cinematics/`.
- **Narrativa / copy / lore**:
  el GDD/narrative bible relevante al capítulo, sólo ese.
- **Planiﬁcación de recovery (R5/R6/R7)**:
  `MIGRATION_PLAN.md` + el código afectado. No releer `RECOVERY_AUDIT.md`
  por default.
- **Arqueología / regresión histórica / disputa de decisión**:
  `RECOVERY_AUDIT.md` es la fuente, pero es **histórica** y **no se
  carga por default**.

### 0.2 Prohibido por default

Leer las 11 fichas de macroárea, `RECOVERY_AUDIT.md`,
`ARC1_SPATIAL_MAP.md`, `TEST_TAXONOMY.md` o `MIGRATION_PLAN.md`
**por default** está **prohibido**. Cada uno se carga sólo cuando la
tarea lo justifique.

El propósito es reducir context-load y tool churn sin perder acceso a
la autoridad cuando hace falta.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3)

- [`../vision/ohmdal-vision_v1.md`](../vision/ohmdal-vision_v1.md) — North Star, fantasía, anti-pilares.
- [`../gameplay/ohmdal-core-gameplay_v1.md`](../gameplay/ohmdal-core-gameplay_v1.md) — modos, loop, feedback.
- [`../gameplay/ohmdal-electrical-system_v1.md`](../gameplay/ohmdal-electrical-system_v1.md) — modelo eléctrico.
- [`../gameplay/ohmdal-puzzle-grammar_v1.md`](../gameplay/ohmdal-puzzle-grammar_v1.md) — qué puzzles podemos construir.
- [`../gameplay/ohmdal-mechanics-progression_v1.md`](../gameplay/ohmdal-mechanics-progression_v1.md) — progresión mecánica.
- [`../world/ohmdal-world-structure_v1.md`](../world/ohmdal-world-structure_v1.md) — geografía y regiones.
- [`../narrative/ohmdal-narrative-bible_v1.md`](../narrative/ohmdal-narrative-bible_v1.md) — personajes, lore.
- [`../content/ohmdal-arc-01_v1.md`](../content/ohmdal-arc-01_v1.md) — contenido del Arco I.
- [`../content/ohmdal-vertical-slice_v1.md`](../content/ohmdal-vertical-slice_v1.md) — qué demuestra el slice.
- [`../production/ohmdal-prototype-evaluation_v1.md`](../production/ohmdal-prototype-evaluation_v1.md) — estado del prototipo.
- [`../production/direccion-ambiental-arco1.md`](../production/direccion-ambiental-arco1.md) — color script y ambientación.
- [`../production/sistema-arte-v1.md`](../production/sistema-arte-v1.md) — sistema de arte.

### Autoridad histórica (insumo, no gobierna si contradice v1)

- [`../../ohmdal-biblia/00_MASTER_INDEX.md`](../../ohmdal-biblia/00_MASTER_INDEX.md) — biblia consolidada pre-v1.
- [`../../ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md`](../../ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md) — GDD histórico.
- [`../../ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md`](../../ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md) — investigación DQ III HD-2D.
- [`../../ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md`](../../ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md) — backlog histórico; no define el workflow agentic actual.

### Dirección visual viva

- [`../../arco1/IDENTITY.md`](../../arco1/IDENTITY.md)
- [`../../arco1/COLOR_SCRIPT.md`](../../arco1/COLOR_SCRIPT.md)
- [`../../arco1/GOLDEN_FRAMES.md`](../../arco1/GOLDEN_FRAMES.md)
- [`../../arco1/SHOT_DECK.md`](../../arco1/SHOT_DECK.md)

> **Aclaración sobre el rol de estos docs (post `ADR-001` / `ADR-002`).**
> Los docs en `arco1/` son **referencia visual**: proveen identidad,
> color script, golden frames y shot deck para la **producción de
> arte** del Arco I (H8 en adelante). **No** gobiernan la
> arquitectura del runtime, que es Phaser 4 **room-based** en
> `src/jugar/` (ver `ADR-002` y `SPATIAL_CONTRACT.md`). La geometría
> local, el room graph, las transiciones, el world state y los locks
> viven en `ARC1_ROOM_GRAPH.md`, `SPATIAL_CONTRACT.md` y las 11
> fichas de macroárea. `ARC1_SPATIAL_MAP.md` aporta topología
> canónica y un esquema geográfico; sus valores numéricos **no** son
> coordenadas de runtime.

### Documentos parcialmente superseded por ADR-001 / ADR-002

- [`../world/ohmdal-world-structure_v1.md`](../world/ohmdal-world-structure_v1.md)
  sigue siendo **CANON** para su **atlas geográfico** (qué
  territorios existen, qué relaciones hay entre regiones, qué
  landmarks son identitarios) y para la regla de los tres estados
  por macroterritorio. La sección §1 "Overworld + dioramas
  compactos" **queda superseded** por la arquitectura multi-área
  (`ADR-001`), y el modelo de "áreas contiguas en un único plano
  mundo" **queda superseded** por el modelo room-based (`ADR-002`):
  las areas son rooms independientes con coordenadas locales,
  conectadas por grafo. La geografía sigue siendo input válido; la
  arquitectura del runtime ya no.

---

## 2. Estado de implementación

> **Reorientado por `ADR-001` (2026-08-17) y `ADR-002` (2026-08-18).**
> H2-H7 ya no son sobre HD-2D; son sobre el refactor **room-based** en
> `src/jugar/`. El detalle de cada hito vive en `ROADMAP.md` §4, y la
> secuencia de migración en `MIGRATION_PLAN.md` (R1–R7).

| Hito | Descripción | Estado |
|---|---|---|
| H1 | Phaser greybox pre-existente | ✅ hecho (baseline de regresión) |
| H2 | Cimientos multi-área en `src/jugar/` (AreaDef, CameraDirector, WorldState, RenderMode, Cinema) | ← **foco actual** |
| H3 | Plaza multi-área greybox + Despertar de Ohm | próximo |
| H4 | Cuenca completa (Calzada + Manantial) + Instituto recuerda | pendiente |
| H5 | Castillo de la Red (ext + int) | pendiente |
| H6 | Forja (Patio + Profunda) y Terrazas | pendiente |
| H7 | Lago y Faro + Epílogo | pendiente |
| H8 | Pase de arte sobre blockout aprobado | pendiente |
| H9 | Slice global de integración | pendiente |

**Runtime de producción:** `src/jugar/` (Phaser 4) **room-based** (ver
`ADR-002`, `SPATIAL_CONTRACT.md`, `ARC1_ROOM_GRAPH.md`; `ARC1_SPATIAL_MAP.md`
aporta topología + esquema, no coordenadas de runtime).
**Instituto:** home isométrica en `/`; no hay hub Phaser.
**Baseline jugable:** `/jugar` (Phaser top-down). Se conserva y se evoluciona.

---

## 3. Reglas locales

### DO

- Electricidad = comportamiento observable del mundo (luz, calor, movimiento, sonido, continuidad).
- Feedback inmediato: el jugador ve el efecto antes de ver el número.
- Predicción → intervención → observación → explicación → transferencia.
- ≥2 soluciones cuando el sistema realmente las permite; validar condiciones, no una secuencia fija.
- Modelos pedagógicos puros/testeables fuera del renderer.
- Vocabulario diegético: Empuje / Río / Piedra / Camino / Freno / Chispa. Lo técnico (`V`, `I`, `R`, `serie`, `paralelo`, `capacitor`) aparece en formalización, no como spoiler.
- **Cámara 2D top-down con dead zones, encuadre autoral y modo cinemática.** El mundo es **room-based** (`ADR-002`): cada room es una escena independiente con coordenadas **locales**, puede medir más que el viewport 960×540, y se conecta con otras por el **room graph** (transiciones fade / doorway / cinematic). La cámara sigue al jugador dentro de la room activa y la room cambia por transición de grafo, no por continuidad de un plano mundo.
- **Coordenadas locales por room.** Posición del jugador, entries, doors, walkable, collision, things y NPCs viven en el sistema local de su room (`[0, width) × [0, height)`). No hay coordenadas mundo obligatorias entre rooms. Cambiar `width/height` de una room **nunca** obliga a reposicionar otras rooms.
- Producir por capas: **GREYBOX multi-área en `src/jugar/`** (H2-H7) → pase de arte sobre greybox aprobado (H8) → polish. La capa "GREYBOX" se evalúa en juego (Portal→Faro jugable) **antes** de invertir en arte.

### DON'T

- Quizzes disfrazados ni “preguntar V = I·R para abrir una puerta”.
- Bancos modales como solución por defecto para puzzles nuevos.
- Mezclar vocabulario técnico y diegético sin transición pedagógica.
- “Tocar hasta que se ponga verde”.
- Asumir "1 sala = 1 viewport 960×540" como invariante global.
- Asumir un plano mundo continuo (`ox/oy`) como autoridad de runtime; las rooms no se reposicionan unas por otras ni se renderizan todas simultáneamente (ver `ADR-002` / `SPATIAL_CONTRACT.md`).
- Lockear un área por un puzzle que vive dentro de ella (crea dependencia circular; usar `Requires?` sólo con flags que se setean **fuera** del área destino).
- Reabrir el engine porque otra herramienta sea nueva/popular; sólo si aparece un bloqueo material reproducible.
- Exigir hero-art en cada prop secundario.

---

## 4. Roles y harnesses

No usar los antiguos `worker-*` / `m3-*`; fueron retirados.

| Necesidad | Rol por defecto | Harness |
|---|---|---|
| diseño, arquitectura, Task/Learning Contract, escalaciones | **GPT-5.6 Sol — Director** | Codex Desktop / ChatGPT |
| implementación principal, world building, integración de escena | **MiniMax M3 — Builder** | MiniMax Code |
| uso real del juego / affordance / aprendizaje / fricción | **GPT-5.6 Luna — Player Agent** | OpenCode Go (`playtester`) |
| bug acotado y reproducible | **DeepSeek V4 Flash — Repair** | OpenCode Go (`implementer`) |
| intentar romper milestone antes de integrar | **GLM — Adversarial Reviewer** | OpenCode Go (`reviewer`) |
| imágenes/audio/video/voz | **MiniMax multimodal** | herramientas nativas MiniMax |

Tooling Phaser 4 oficial (skills, debug, atlas pipeline) se carga
**según la tarea**, no globalmente. Tooling Three.js, Vibe3D,
Spector, Blender y skills HD-2D **no se cargan por defecto** sobre
Ohmdal en esta fase: sólo si una subtarea concreta lo requiere y
se justifica. Ver
[`../../80-production/agentic/GAME_DEV_AI_TOOLING.md`](../../80-production/agentic/GAME_DEV_AI_TOOLING.md).

---

## 5. Convenciones de código

> **Actualizado por `ADR-001` (2026-08-17).**

- **Runtime de producción del Arco I:** `src/jugar/` (Phaser 4) evolucionado a
  multi-área. **No** se asume "1 sala = 1 viewport 960×540"; cada área puede
  medir varios viewports.
- **Instituto:** sólo la home isométrica (`/`). No hay salas Phaser `hall` /
  `despacho` / `aula`.
- **Baseline jugable:** `/jugar` (Phaser top-down). Se conserva y se **evoluciona**.
- Modelos/tests históricos de puzzles viven en `src/puzzles/` + `tests/`;
  cualquier modelo nuevo debe seguir siendo renderer-neutral.
- Manifiestos/routing: `src/experiences/` y `src/shared/portalLink.ts` son
  contratos de integración; no cambiar silenciosamente.
- `package.json` es la verdad de versiones instaladas; no actualizar
  Three/Phaser/Babylon de paso. El refactor multi-área **no agrega
  dependencias**.

---

## 6. Definition of Done local

Además del DoD global:

- la red/cadena causal sigue siendo legible en cámara real;
- el Player Agent puede inferir la acción relevante sin leer el código;
- el cambio no rompe `/jugar` cuando afecta contratos compartidos;
- desktop + touch se prueban cuando cambia navegación/interacción;
- un cambio visual se evalúa **dentro del juego**, no sólo como asset aislado;
- ninguna mejora gráfica puede ocultar estado eléctrico pedagógicamente relevante.

---

## 7. Qué NO tocar sin decisión material

- `src/jugar/rooms.ts` como baseline narrativo/contenido.
- estado/Bitácora/flags compartidos sin revisar impacto de migración.
- runtime/manifest/routing global.
- docs `CANON` o nivel 0–1.
- dependencia/engine.

Todo cambio debe mantener `npm run build`, `npm test` y `npm run verify` verdes **y después jugarse en runtime**.
