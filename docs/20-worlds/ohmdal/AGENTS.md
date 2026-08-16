# AGENTS.md — Ohmdal

> **Verbo nuclear:** **CONECTAR**.
> **Disciplina:** Electrónica (corriente continua).
> **Estado:** foco principal de producción actual. H1 (Plaza HD-2D) hecho; H2 (Plaza de verdad) en curso; Arco I completo jugable en greybox (`/jugar`) como baseline.

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Ohmdal. Cualquier agente que trabaje sobre Ohmdal lee ambos.

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

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| H1 | HD-2D fuera del laboratorio | ✅ hecho |
| H2 | Plaza de verdad en HD-2D | ← **foco actual** |
| H3 | Primer puzzle en HD-2D (Reactivar a Ohm) | próximo |
| H4 | El Instituto recuerda la partida | pendiente |
| H5 | Arte real sobre el blockout | pendiente |
| H6 | Resto del Arco I (Taller, Puerta, Castillo, Forja, Terrazas, Faro) | pendiente |

**Baseline jugable:** `/jugar` (Phaser top-down, greybox). Se preserva como red de seguridad, contenido y regresión hasta que HD-2D alcance paridad suficiente. No recibe la nueva dirección visual por defecto.

---

## 3. Reglas locales

### DO

- Electricidad = comportamiento observable del mundo (luz, calor, movimiento, sonido, continuidad).
- Feedback inmediato: el jugador ve el efecto antes de ver el número.
- Predicción → intervención → observación → explicación → transferencia.
- ≥2 soluciones cuando el sistema realmente las permite; validar condiciones, no una secuencia fija.
- Modelos pedagógicos puros/testeables fuera del renderer.
- Vocabulario diegético: Empuje / Río / Piedra / Camino / Freno / Chispa. Lo técnico (`V`, `I`, `R`, `serie`, `paralelo`, `capacitor`) aparece en formalización, no como spoiler.
- Cámara casi ortográfica, dioramas/escenario 3D y sprites 2D cuando esa combinación sostenga legibilidad.
- Producir por capas: greybox → kit modular → materiales/luz → assets identitarios → hero assets → polish.

### DON'T

- Quizzes disfrazados ni “preguntar V = I·R para abrir una puerta”.
- Bancos modales como solución por defecto para puzzles nuevos.
- Mezclar vocabulario técnico y diegético sin transición pedagógica.
- “Tocar hasta que se ponga verde”.
- Overlays físicos permanentes que rompan la lectura HD-2D.
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

Tooling Three.js específico, Vibe3D, Spector, Blender y skills se cargan **según la tarea**, no globalmente. Ver [`../../80-production/agentic/GAME_DEV_AI_TOOLING.md`](../../80-production/agentic/GAME_DEV_AI_TOOLING.md).

---

## 5. Convenciones de código

- **Runtime HD-2D activo:** `src/hd2d-ohmdal/`.
- `src/ohmdal/` puede contener piezas de integración/compatibilidad históricas; no asumir que es el árbol principal del world building nuevo.
- **Baseline:** `src/jugar/` (Phaser top-down greybox).
- Modelos/tests históricos de puzzles viven en `src/puzzles/` + `tests/`; cualquier modelo nuevo debe seguir siendo renderer-neutral.
- Manifiestos/routing: `src/experiences/` y `src/shared/portalLink.ts` son contratos de integración; no cambiar silenciosamente.
- `package.json` es la verdad de versiones instaladas; no actualizar Three/Phaser/Babylon de paso.

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
