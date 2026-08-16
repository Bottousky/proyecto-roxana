# AGENTS.md — Bitland

> **Verbo nuclear:** **PROGRAMAR**.
> **Disciplina:** Programación.
> **Estado:** GDD **PROPOSED**; campaña todavía no está en producción. Se permiten únicamente los **spikes de investigación explícitamente aprobados** en `docs/80-production/spikes/`.

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Bitland. Cualquier agente que trabaje sobre Bitland lee ambos.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3, PROPOSED salvo ratificación posterior)

- [`../vision/bitland-vision_v1.md`](../vision/bitland-vision_v1.md) — North Star y fantasía.
- [`../vision/bitland-world-metaphor_v1.md`](../vision/bitland-world-metaphor_v1.md) — metáfora del mundo.
- [`../gameplay/bitland-programming-language-gameplay_v1.md`](../gameplay/bitland-programming-language-gameplay_v1.md) — lenguaje como jugable.
- [`../gameplay/bitland-automation-system_v1.md`](../gameplay/bitland-automation-system_v1.md) — automatización.
- [`../gameplay/bitland-puzzle-grammar_v1.md`](../gameplay/bitland-puzzle-grammar_v1.md) — gramática de puzzles.
- [`../gameplay/bitland-mechanics-progression_v1.md`](../gameplay/bitland-mechanics-progression_v1.md) — progresión mecánica.
- [`../narrative/bitland-narrative-bible_v1.md`](../narrative/bitland-narrative-bible_v1.md) — lore.
- [`../content/bitland-arc-01_v1.md`](../content/bitland-arc-01_v1.md) — Arco I.
- [`../content/bitland-vertical-slice_v1.md`](../content/bitland-vertical-slice_v1.md) — vertical slice.
- [`../production/bitland-prototype-evaluation_v1.md`](../production/bitland-prototype-evaluation_v1.md) — evaluación.
- [`../../80-production/agentic/ENGINE_MATRIX.md`](../../80-production/agentic/ENGINE_MATRIX.md) — hipótesis renderer/representación actual.

---

## 2. Estado

- Campaña: **sin implementación**; `placeholderRuntime`/`planned` mientras el roadmap no la active.
- Investigación permitida: spikes aislados que no se convierten en campaña por accidente.
- Primeros spikes autorizados:
  - [`../../80-production/spikes/BIT-R-A-pixijs-machine-city.md`](../../80-production/spikes/BIT-R-A-pixijs-machine-city.md)
  - [`../../80-production/spikes/BIT-R-B-phaser-machine-city.md`](../../80-production/spikes/BIT-R-B-phaser-machine-city.md)

A y B deben partir del mismo baseline y compartir sólo el `simulation-core` engine-neutral definido por la Spike Card.

---

## 3. Tesis central

> **The world is executable.**

Bitland es una **máquina-ciudad dentro de un microcontrolador**. La ciudad no es un decorado cyberpunk: su actividad debe volver visible la ejecución del sistema.

El jugador aprende a leer, modificar y dirigir comportamiento.

### La metáfora debe ser honesta

El microcontrolador es fantasía espacial y puede volver visibles:

- clock/ticks;
- memoria/estado;
- rutas/buses/mensajes cuando aporten;
- I/O/periféricos cuando formen parte del contenido;
- procesos/agentes;
- eventos/interrupciones cuando corresponda.

Pero `IF`, loops, funciones, mensajes y debugging siguen siendo conceptos del modelo de programación. No inventar electrónica falsa para justificar la visualización.

---

## 4. Arquitectura fija del core

```text
Pure TypeScript simulation core
  ├─ deterministic state
  ├─ tick scheduler / clock
  ├─ agents + programs + interpreter
  ├─ events/messages/shared resources
  ├─ snapshots + rewind
  └─ condition-based validators
          ↓
renderer adapter experimental
          +
DOM
  ├─ program UI
  ├─ step / play / pause / rewind
  ├─ inspector / trace
  └─ Bitácora / accessibility
```

**El renderer nunca es la fuente de verdad del programa.**

---

## 5. Reglas locales

### DO

- Concepto informático = comportamiento observable.
- El jugador programa/modifica comportamiento y luego observa ejecución.
- `step`, pausa, trace y error deben producir información útil.
- El fallo es una pista del estado, no una penalización opaca.
- Variantes/transferencia después de comprender el caso inicial.
- Mantener determinismo suficiente para tests y replay.
- Desktop + touch desde los spikes de renderer.

### DON'T

- Preguntas de sintaxis disfrazadas de gameplay.
- Un editor de código plano como experiencia completa del mundo.
- Opción múltiple como evaluación principal.
- Combate genérico sin función pedagógica.
- Hacer que clock visual/ticker del renderer controle semántica de ejecución.
- Elegir Phaser/Pixi porque un agente lo prefiera; ejecutar los dos spikes.

---

## 6. Roles y harnesses

Los antiguos `worker-*` / `m3-*` fueron retirados.

| Necesidad | Rol por defecto | Harness |
|---|---|---|
| definir core, Learning Contract y Spike Card | **GPT-5.6 Sol — Director** | Codex Desktop / ChatGPT |
| implementar cada spike bajo el mismo contrato | **MiniMax M3 — Builder** | MiniMax Code |
| jugar blind-first, predecir ticks/estado y evaluar debugging | **GPT-5.6 Luna — Player Agent** | OpenCode Go (`playtester`) |
| fix reproducible dentro de un spike | **DeepSeek V4 Flash — Repair** | OpenCode Go (`implementer`) |
| intentar romper aislamiento, determinismo, mobile o state ownership | **GLM — Adversarial Reviewer** | OpenCode Go (`reviewer`) |

Tooling específico de Pixi/Phaser se carga según el spike; no se instala el tooling de ambos en el mismo branch experimental. Ver [`../../80-production/agentic/GAME_DEV_AI_TOOLING.md`](../../80-production/agentic/GAME_DEV_AI_TOOLING.md).

---

## 7. Qué se puede hacer ahora

**Sí:**

- ejecutar BIT-R-A o BIT-R-B en ramas separadas;
- implementar un `simulation-core` mínimo compartido si la Spike Card lo declara;
- medir aprendizaje, legibilidad, performance, touch y producción agentic;
- documentar evidencia para decidir renderer.

**No:**

- construir el Arco I completo;
- promover docs PROPOSED a CANON sin decisión humana;
- introducir un lenguaje embebido (Lua/Python-WASM/etc.) sin un spike específico;
- agregar dependencias fuera del spike aprobado;
- reutilizar código específico del candidato A dentro de B.

La campaña se activa por roadmap/ratificación. Los spikes existen sólo para retirar incertidumbre antes de ese momento.
