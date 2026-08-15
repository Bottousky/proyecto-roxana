# AGENTS.md — Bitland

> **Verbo nuclear:** **PROGRAMAR**.
> **Disciplina:** Programación.
> **Estado:** **PROPOSED** sin código todavía. No se trabaja sobre Bitland hasta que el Instituto + Ohmdal estén cerrados (`ROADMAP.md`).

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Bitland. Cualquier
agente que trabaje sobre Bitland lee los dos.

> **Recordatorio:** trabajar sobre Bitland hoy es trabajo especulativo. La autoridad de
> este `AGENTS.md` es de **planning**, no de implementación. La promoción a trabajo real
> requiere ratificación de Manuel (probablemente cuando Ohmdal esté cerrado) y un ADR
> que eleve el `AGENTS.md` y los docs v1 a `CANON`.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3, toda PROPOSED)

- [`../vision/bitland-vision_v1.md`](../vision/bitland-vision_v1.md) — North Star y fantasía.
- [`../vision/bitland-world-metaphor_v1.md`](../vision/bitland-world-metaphor_v1.md) — metáfora del mundo.
- [`../gameplay/bitland-programming-language-gameplay_v1.md`](../gameplay/bitland-programming-language-gameplay_v1.md) — el lenguaje como jugable.
- [`../gameplay/bitland-automation-system_v1.md`](../gameplay/bitland-automation-system_v1.md) — sistema de automatización.
- [`../gameplay/bitland-puzzle-grammar_v1.md`](../gameplay/bitland-puzzle-grammar_v1.md) — gramática de puzzles.
- [`../gameplay/bitland-mechanics-progression_v1.md`](../gameplay/bitland-mechanics-progression_v1.md) — progresión mecánica.
- [`../narrative/bitland-narrative-bible_v1.md`](../narrative/bitland-narrative-bible_v1.md) — lore (Null, etc.).
- [`../content/bitland-arc-01_v1.md`](../content/bitland-arc-01_v1.md) — contenido del Arco I.
- [`../content/bitland-vertical-slice_v1.md`](../content/bitland-vertical-slice_v1.md) — vertical slice.
- [`../production/bitland-prototype-evaluation_v1.md`](../production/bitland-prototype-evaluation_v1.md) — estado del prototipo.

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| — | Sin código todavía | el runtime es un `placeholderRuntime` declarado en `manifests.ts` con `status: 'planned'` |

---

## 3. Reglas locales de Bitland (diseño)

### Tesis central

> **The world is executable.**

El mundo de Bitland es un sistema que el jugador aprende a leer, modificar y dirigir.
La programación no es una materia abstracta: es el lenguaje literal del mundo.

### DO

- Concepto informático = comportamiento observable del mundo (un bucle se ve; un condicional
  se ve; una recursión se ve).
- Editar el mundo escribiendo, no cliqueando íconos sueltos.
- Errores visibles en escena (no en una consola oculta) — la falla es información.
- ≥2 soluciones por puzzle (ver [`../../guia-puzzles.md`](../../guia-puzzles.md)).

### DON'T

- Convertir programación en preguntas de sintaxis ("¿cuál es el orden de los argumentos?").
- "Aprender a programar" en pantalla con un editor de código plano: el código se vive en el mundo.
- Evaluar al jugador con tests de opción múltiple.
- Meter combate RPG genérico sin propósito pedagógico.

---

## 4. Por tipo de tarea, qué sub-agent dispatchar

| Tarea | Sub-agent | Input esperado | Output esperado |
|---|---|---|---|
| Diseñar puzzle de programación como jugable | `worker-gameplay` | fenómeno + concepto | código + tests |
| Auditar puzzle Bitland contra `guia-puzzles.md` | `m3-qa` | puzzle vivo + checklist | informe priorizado |
| Diseñar el "lenguaje del mundo" (sintaxis diegética) | `worker-gameplay` | brief + metáfora | gramática + interpreter stub |
| Investigar referencias (Turing, Zachtronics, Hacknet) | `explore` | objetivo | mapa de referencias |
| Implementación multi-paso no especializada | `general` | brief | código + commit propuesta |

> Los sub-agents especializados (`m3-visual`, `worker-world`) son menos relevantes aquí
> porque Bitland probablemente no tiene dioramas 3D: el mundo es el sistema. Adaptar.

---

## 5. Convenciones tentativas

- Runtime: a definir. Probablemente DOM-first + canvas para visualización de la ejecución.
- Modelos puros: la "gramática del mundo" + interpreter. Tests del interpreter.
- Tests: `tests/b<X>-*.test.ts` siguiendo el patrón Ohmdal/Physica.
- Manifiesto: `BITLAND.runtime` declarado en `manifests.ts` con `status: 'planned'`.

---

## 6. Qué NO hacer hoy

- Empezar a codear Bitland antes de que Ohmdal esté cerrado.
- Convertir los docs PROPOSED de Bitland en CANON sin ADR.
- Crear dependencias nuevas para Bitland sin pasar por Manuel.
- Adoptar un lenguaje de programación embebido (Lua, Python-WASM) sin comparar contra
  una alternativa implementada a mano y testeada pedagógicamente.

---

## 7. Cuándo se reactiva

El `ROADMAP.md` actual dice:

> Los otros tres mundos... Aparcado. No se tocan hasta que el Instituto + Ohmdal estén cerrados.

Mientras esa cláusula siga vigente, este `AGENTS.md` es planning. Cualquier trabajo sobre
Bitland requiere un ADR que (a) cierre el trabajo de Ohmdal como `CANON` y (b) eleve
Bitland a `planned → in-progress` con un primer hito concreto.