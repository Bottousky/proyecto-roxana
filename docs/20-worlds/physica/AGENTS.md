# AGENTS.md — Physica

> **Verbo nuclear:** **EXPERIMENTAR**.
> **Disciplina:** Física (cinemática, dinámica).
> **Estado:** **PROPOSED** en diseño; **Hito 1 hecho** (cascada ascendente jugable en Babylon.js). Arco I pendiente de diseño completo.

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Physica. Cualquier
agente que trabaje sobre Physica lee los dos.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3)

- [`../vision/physica-vision_v1.md`](../vision/physica-vision_v1.md) — North Star y anti-pilares.
- [`../gameplay/physica-physics-interaction-system_v1.md`](../gameplay/physica-physics-interaction-system_v1.md) — sistema de física.
- [`../gameplay/physica-puzzle-grammar_v1.md`](../gameplay/physica-puzzle-grammar_v1.md) — qué puzzles podemos construir.
- [`../gameplay/physica-mechanics-progression_v1.md`](../gameplay/physica-mechanics-progression_v1.md) — progresión mecánica.
- [`../gameplay/physica-player-movement_v1.md`](../gameplay/physica-player-movement_v1.md) — control del avatar.
- [`../world/physica-world-structure_v1.md`](../world/physica-world-structure_v1.md) — geografía.
- [`../narrative/physica-narrative-bible_v1.md`](../narrative/physica-narrative-bible_v1.md) — lore.
- [`../content/physica-arc-01_v1.md`](../content/physica-arc-01_v1.md) — contenido del Arco I.
- [`../content/physica-vertical-slice_v1.md`](../content/physica-vertical-slice_v1.md) — vertical slice.
- [`../production/physica-prototype-evaluation_v1.md`](../production/physica-prototype-evaluation_v1.md) — estado del prototipo.
- [`../production/arquitectura.md`](../production/arquitectura.md) — física híbrida (analítica + Havok).
- [`../production/spec-vertical-slice.md`](../production/spec-vertical-slice.md) — spec del vertical slice.
- [`../README.md`](../README.md) — estado operativo del mundo (Hito 1 hecho).

### Autoridad histórica (insumo)

- [`../legacy-gdd-v0.2/Proyecto_Roxana_Physica_GDD_v0.2.md`](../legacy-gdd-v0.2/Proyecto_Roxana_Physica_GDD_v0.2.md) — GDD fundacional pre-v1.
- [`../legacy-gdd-v0.2/Proyecto_Roxana_Physica_Guion_Vertical_Slice_v0.2.md`](../legacy-gdd-v0.2/Proyecto_Roxana_Physica_Guion_Vertical_Slice_v0.2.md) — guion del slice.

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| M0 | Cascada en Three.js (`physicaRuntime`) | ✅ hecho, base de regresión |
| M0.5.x | Serie de escenas exploratorias (8 escenas QA) | ✅ hecho, evaluación |
| **H1** | **Cascada ascendente jugable en Babylon.js** | ✅ **hecho (2026-08-05)** |
| H2+ | Arco I completo (U2–U5: MRU, tiro vertical, plano inclinado, resortes) | pendiente |

**Runtime actual:** `platformer-babylon` en `src/experiences/physica/`. La M1 (Three.js)
sigue accesible en dev con `?engine=three` y NO se borra: es base de regresión y
fuente de los modelos puros.

**Decisión de motor (Director, 2026-08-05):** Babylon.js para los mundos; el Instituto/landing
permanecen en Three.js. **No se usa Havok** para la física pedagógica — la física analítica
(MRUV, tiro parabólico, vectores) es autoritativa; Havok maneja colisiones, rigid bodies
pasivos y pushable props. Ver [`../production/arquitectura.md`](../production/arquitectura.md).

---

## 3. Reglas locales de Physica

### DO

- Fenómeno físico observable antes que número (la cascada se ve ANTES de medirse).
- Predicción → observación → explicación. La Bitácora formaliza lo vivido.
- Manipulación corporal del mundo (empujar, cargar, lanzar, soltar). NO clic en banco.
- Física analítica de forma cerrada (MRUV, tiro parabólico). Temario 2º/3º técnica exacto.
- Modelos puros en `src/experiences/physica/models/*.ts` con tests en `tests/pX-*.test.ts`.

### DON'T

- Depender de un motor de físicas para el resultado pedagógico (Havok es para colisiones, no para enseñar).
- Lanzar como puntería (la guía de puzzles prohíbe precisión motriz fina).
- Encadenar puzzles por clics aislados — siempre manipulación del mundo.
- Inventar números: la física se calcula, no se redondea a algo "que se vea bien".

---

## 4. Por tipo de tarea, qué sub-agent dispatchar

| Tarea | Sub-agent | Input esperado | Output esperado |
|---|---|---|---|
| Modelar fenómeno físico analítico | `m3-gameplay` | fenómeno + temario | `models/<x>.ts` + tests |
| Implementar escena Babylon nueva | `worker-world` | escena + física | `scenes/<x>.ts` + integración |
| Auditar puzzle físico contra `guia-puzzles.md` | `m3-qa` | puzzle vivo + checklist | informe priorizado |
| Auditar visualmente (encuadre, dolly, luz) | `m3-visual` | screenshot + `mapa-jugabilidad-*` | veredicto |
| Validar física híbrida (analítica + Havok) | `worker-qa` | `physics.ts` + escena | informe de no-divergencia |
| Investigar fenómeno físico o referencia visual | `explore` | objetivo | mapa de refs + propuestas |
| Implementación multi-paso no especializada | `general` | brief | código + commit propuesta |

---

## 5. Convenciones del código Physica

- Runtime: `src/experiences/physica/`. Importación dinámica de `babylonjs` solo bajo demanda.
- Models puros: `src/experiences/physica/models/` (cinemática analítica).
- Escenas: `src/experiences/physica/scenes/` (Babylon, presentación visual pura).
- Física híbrida: `physics.ts` (Havok colisiones) + `models/` (analítica pedagógica).
- Tests: `tests/p0-*.test.ts` (registro), `tests/p1-*.test.ts` (caída libre), etc.
- Harness de dev: `render_game_to_text()`, `advanceTime(ms)`, `__pxPress`, `__pxSnapshot`, `__pxTeleport` (solo dev).

---

## 6. Frontera de archivos (regla de Physica)

- **Compartidos (aditivos):** `types.ts`, `manifests.ts`, `loaders.ts`, `vite.config.ts`,
  `_redirects`, `schoolModel.ts`, `aulas.ts`, `tests/a0`, `tests/p0`, `tests/w1`.
- **Prohibidos:** `src/ohmdal/**`, `src/jugar/**`, `runtimeHost.ts`, `registry.ts`,
  `main.ts`, `index.html`, `portal.ts`, `portalLink.ts`, `ROADMAP.md`, `docs/arco1/**`.

---

## 7. Qué NO tocar sin ADR

- `src/experiences/physica/babylonWorld.ts` (escena canónica del Hito 1).
- `src/experiences/physica/models/*.ts` (física pedagógica autoritativa).
- `PHYSICA.runtime` en `manifests.ts` sin pasar por ADR.
- Cualquier doc `CANON` o nivel 0–1.
- `npm run build` debe seguir verde tras cada cambio.