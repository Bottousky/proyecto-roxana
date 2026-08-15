# AGENTS.md — Arithmos

> **Verbo nuclear:** **TRANSFORMAR**.
> **Disciplina:** Matemática.
> **Estado:** **PROPOSED** sin código todavía. No se trabaja sobre Arithmos hasta que el Instituto + Ohmdal estén cerrados (`ROADMAP.md`).

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Arithmos. Cualquier
agente que trabaje sobre Arithmos lee los dos.

> **Recordatorio:** trabajar sobre Arithmos hoy es trabajo especulativo. La autoridad de
> este `AGENTS.md` es de **planning**, no de implementación. La promoción a trabajo real
> requiere ratificación de Manuel (probablemente cuando Ohmdal esté cerrado) y un ADR
> que eleve el `AGENTS.md` y los docs v1 a `CANON`.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3, toda PROPOSED)

- [`../vision/arithmos-vision_v1.md`](../vision/arithmos-vision_v1.md) — North Star y fantasía.
- [`../vision/arithmos-world-rules_v1.md`](../vision/arithmos-world-rules_v1.md) — reglas del mundo.
- [`../gameplay/arithmos-representation-system_v1.md`](../gameplay/arithmos-representation-system_v1.md) — cómo se representa la matemática.
- [`../gameplay/arithmos-transformation-system_v1.md`](../gameplay/arithmos-transformation-system_v1.md) — sistema de transformaciones.
- [`../gameplay/arithmos-puzzle-grammar_v1.md`](../gameplay/arithmos-puzzle-grammar_v1.md) — gramática de puzzles.
- [`../gameplay/arithmos-mechanics-progression_v1.md`](../gameplay/arithmos-mechanics-progression_v1.md) — progresión mecánica.
- [`../narrative/arithmos-narrative-bible_v1.md`](../narrative/arithmos-narrative-bible_v1.md) — lore.
- [`../content/arithmos-arc-01_v1.md`](../content/arithmos-arc-01_v1.md) — contenido del Arco I.
- [`../content/arithmos-vertical-slice_v1.md`](../content/arithmos-vertical-slice_v1.md) — vertical slice.
- [`../production/arithmos-prototype-evaluation_v1.md`](../production/arithmos-prototype-evaluation_v1.md) — estado del prototipo.

---

## 2. Estado de implementación

| Hito | Descripción | Estado |
|---|---|---|
| — | Sin código todavía | el runtime es un `placeholderRuntime` declarado en `manifests.ts` con `status: 'planned'` |

---

## 3. Reglas locales de Arithmos (diseño)

### Tesis central

> **The world is mathematical structure.**

Arithmos es el mundo de la estructura pura que sostiene a los otros. La matemática no
es decoración ni recompensa: cambia el estado o la geometría del mundo. Si una operación
no afecta el escenario visible, no es un puzzle de Arithmos.

### DO

- Operaciones que modifican el mundo (geometría, posición, estado, escala, agrupación).
- Representación múltiple (visual, simbólica, gestual). Lo que importa es la estructura, no la notación.
- Transformaciones con conservación de propiedades observables (lo que se transforma y lo que se preserva debe verse).
- ≥2 soluciones por puzzle (ver [`../../guia-puzzles.md`](../../guia-puzzles.md)).

### DON'T

- "Resolvé 7 × 8 para abrir la puerta." Si la matemática no cambia el mundo, no es un puzzle.
- Sobre-notación: si el jugador necesita un cuaderno externo para hacer la cuenta, el modelo está mal.
- Ocultar la estructura bajo animaciones decorativas.

---

## 4. Por tipo de tarea, qué sub-agent dispatchar

| Tarea | Sub-agent | Input esperado | Output esperado |
|---|---|---|---|
| Diseñar puzzle de transformación con efecto de mundo | `worker-gameplay` | estructura + transformación | código + tests |
| Auditar puzzle Arithmos contra `guia-puzzles.md` | `m3-qa` | puzzle vivo + checklist | informe priorizado |
| Diseñar sistema de representación múltiple (visual/simbólica/gestual) | `worker-gameplay` | brief + dominio | modelo + vistas |
| Investigar referencias (Braid, Patrick's Parabox, A=B) | `explore` | objetivo | mapa de referencias |
| Implementación multi-paso no especializada | `general` | brief | código + commit propuesta |

> Los sub-agents visuales (`m3-visual`, `worker-world`) son relevantes aquí: Arithmos
> probablemente vive de manipulaciones espaciales (geometría dinámica) más que de cámara
> narrativa. Adaptar.

---

## 5. Convenciones tentativas

- Runtime: a definir. Probablemente DOM/canvas con visualización de la estructura (nodos,
  grafos, transformaciones geométricas).
- Modelos puros: la "álgebra del mundo" + efectos observables. Tests de la álgebra.
- Tests: `tests/a<X>-*.test.ts` siguiendo el patrón Ohmdal/Physica.
- Manifiesto: `ARITHMOS.runtime` declarado en `manifests.ts` con `status: 'planned'`.

---

## 6. Qué NO hacer hoy

- Empezar a codear Arithmos antes de que Ohmdal esté cerrado.
- Convertir los docs PROPOSED de Arithmos en CANON sin ADR.
- Crear dependencias nuevas para Arithmos sin pasar por Manuel.
- Adoptar una librería simbólica (SymPy, mathjs) sin comparar contra una implementación
  a mano y testeada pedagógicamente.

---

## 7. Cuándo se reactiva

El `ROADMAP.md` actual dice:

> Los otros tres mundos... Aparcado. No se tocan hasta que el Instituto + Ohmdal estén cerrados.

Mientras esa cláusula siga vigente, este `AGENTS.md` es planning. Cualquier trabajo sobre
Arithmos requiere un ADR que (a) cierre el trabajo de Ohmdal como `CANON` y (b) eleve
Arithmos a `planned → in-progress` con un primer hito concreto.