# AGENTS.md — Physica

> **Verbo nuclear:** **EXPERIMENTAR**.
> **Disciplina:** Física (cinemática, dinámica).
> **Estado:** GDD v1 en evolución; **Hito 1 hecho** (cascada ascendente jugable en Babylon.js). Arco I pendiente de producción completa.

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Physica. Cualquier agente que trabaje sobre Physica lee ambos.

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
- [`../README.md`](../README.md) — estado operativo del mundo.

### Autoridad histórica (insumo)

- [`../legacy-gdd-v0.2/Proyecto_Roxana_Physica_GDD_v0.2.md`](../legacy-gdd-v0.2/Proyecto_Roxana_Physica_GDD_v0.2.md)
- [`../legacy-gdd-v0.2/Proyecto_Roxana_Physica_Guion_Vertical_Slice_v0.2.md`](../legacy-gdd-v0.2/Proyecto_Roxana_Physica_Guion_Vertical_Slice_v0.2.md)

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| M0 | Cascada en Three.js (`physicaRuntime`) | ✅ hecho, base de regresión |
| M0.5.x | Serie de escenas exploratorias (8 escenas QA) | ✅ hecho, evaluación |
| **H1** | **Cascada ascendente jugable en Babylon.js** | ✅ **hecho (2026-08-05)** |
| H2+ | Arco I completo | pendiente |

**Runtime actual:** `platformer-babylon` en `src/experiences/physica/`. La versión Three.js sigue como baseline de regresión donde aplique.

**Decisión de motor de Physica:** Babylon.js es la dirección actual **para Physica**, no para todos los mundos. La física pedagógica de forma cerrada (MRUV, tiro parabólico, vectores, etc.) es autoritativa; Havok maneja colisiones, rigid bodies pasivos y props secundarios. Ver [`../production/arquitectura.md`](../production/arquitectura.md).

### Regla dimensional

- **2.5D por defecto** cuando el fenómeno se aprende correctamente en un plano.
- 3D real sólo cuando la tercera dimensión forme parte material del concepto y produzca mejor comprensión.
- Si 3D sólo agrega cámara, orientación o espectáculo, se mantiene 2.5D.
- Cuando exista una duda pedagógica real, ejecutar spikes A/B separados según [`../../80-production/agentic/SPIKE_POLICY.md`](../../80-production/agentic/SPIKE_POLICY.md).

---

## 3. Reglas locales

### DO

- Fenómeno físico observable antes que número.
- Predicción → observación → explicación → transferencia.
- Manipulación corporal del mundo (empujar, cargar, lanzar, soltar) cuando el concepto lo permita.
- Modelos analíticos TypeScript puros y testeables.
- Separar simulación pedagógica de presentación/render.
- Usar Havok sólo donde no sustituya el modelo que se quiere enseñar.

### DON'T

- Depender del motor de físicas para el resultado pedagógico.
- Convertir lanzar en una prueba de precisión motriz fina.
- Encadenar puzzles por clics aislados sin fenómeno físico legible.
- Inventar/redondear física para “que se vea bien”.
- Agregar una tercera dimensión si no compra aprendizaje.

---

## 4. Roles y harnesses

Los antiguos `worker-*` / `m3-*` fueron retirados.

| Necesidad | Rol por defecto | Harness |
|---|---|---|
| diseño del fenómeno, arquitectura, Task/Learning Contract | **GPT-5.6 Sol — Director** | Codex Desktop / ChatGPT |
| implementación principal de escena/sistemas | **MiniMax M3 — Builder** | MiniMax Code |
| jugar como usuario y evaluar comprensión/control/cámara | **GPT-5.6 Luna — Player Agent** | OpenCode Go (`playtester`) |
| fix técnico acotado reproducible | **DeepSeek V4 Flash — Repair** | OpenCode Go (`implementer`) |
| edge cases, regresiones y shortcuts antes de integrar | **GLM — Adversarial Reviewer** | OpenCode Go (`reviewer`) |

Babylon Inspector/MCP, Spector y otras herramientas se cargan sólo si la milestone las necesita. Ver [`../../80-production/agentic/GAME_DEV_AI_TOOLING.md`](../../80-production/agentic/GAME_DEV_AI_TOOLING.md).

---

## 5. Convenciones de código

- Runtime: `src/experiences/physica/`.
- Modelos puros: `src/experiences/physica/models/`.
- Escenas/presentación: Babylon bajo el runtime de Physica.
- Física pedagógica y renderer no comparten autoridad.
- Tests: `tests/p*-*.test.ts` según el alcance vigente.
- Harness de dev: `render_game_to_text()`, `advanceTime(ms)`, `__pxPress`, `__pxSnapshot`, `__pxTeleport` cuando existan.
- No actualizar Babylon/Havok de paso; `package.json` define la versión instalada.

---

## 6. Frontera de archivos

Evitar cambios cross-world no requeridos. En especial, una milestone Physica no modifica Ohmdal, `/jugar`, routing global, Instituto o `ROADMAP.md` salvo que el Task Contract lo declare y el Director lo apruebe.

---

## 7. Definition of Done local

Además del DoD global:

- el Player Agent puede predecir una consecuencia física antes de ejecutarla;
- valores/resultado del modelo analítico coinciden con la experiencia presentada dentro de tolerancias declaradas;
- no hay doble integración del mismo grado de libertad entre analítica y Havok;
- cámara/input no ocultan la relación que se enseña;
- desktop + touch pasan cuando cambia interacción;
- si se usa 3D real, existe evidencia de que la dimensión adicional aporta comprensión.

No tocar sin decisión material:

- `src/experiences/physica/models/*.ts` cuando cambia significado pedagógico;
- runtime/engine/manifest;
- docs `CANON` o nivel 0–1;
- dependencias.

`npm run build`, `npm test` y `npm run verify` deben quedar verdes y luego se juega el camino afectado.
