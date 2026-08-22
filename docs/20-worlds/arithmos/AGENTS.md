# AGENTS.md — Arithmos

> **Verbo nuclear:** **TRANSFORMAR**.
> **Disciplina:** Matemática.
> **Estado:** GDD **PROPOSED**; campaña todavía no está en producción. Se permiten únicamente los **spikes de representación aprobados** en `docs/80-production/spikes/`.

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz para Arithmos. Cualquier agente que trabaje sobre Arithmos lee ambos.

---

## 1. Fuentes de verdad

### Autoridad vigente (level ≤ 3, PROPOSED salvo ratificación posterior)

- [`vision/arithmos-vision_v1.md`](vision/arithmos-vision_v1.md) — North Star y fantasía.
- [`vision/arithmos-world-rules_v1.md`](vision/arithmos-world-rules_v1.md) — reglas del mundo.
- [`gameplay/arithmos-representation-system_v1.md`](gameplay/arithmos-representation-system_v1.md) — representaciones.
- [`gameplay/arithmos-transformation-system_v1.md`](gameplay/arithmos-transformation-system_v1.md) — transformaciones.
- [`gameplay/arithmos-puzzle-grammar_v1.md`](gameplay/arithmos-puzzle-grammar_v1.md) — gramática de puzzles.
- [`gameplay/arithmos-mechanics-progression_v1.md`](gameplay/arithmos-mechanics-progression_v1.md) — progresión mecánica.
- [`narrative/arithmos-narrative-bible_v1.md`](narrative/arithmos-narrative-bible_v1.md) — lore.
- [`content/arithmos-arc-01_v1.md`](content/arithmos-arc-01_v1.md) — Arco I.
- [`content/arithmos-vertical-slice_v1.md`](content/arithmos-vertical-slice_v1.md) — vertical slice.
- [`production/arithmos-prototype-evaluation_v1.md`](production/arithmos-prototype-evaluation_v1.md) — evaluación.

---

## 2. Estado

- Campaña: **sin implementación**; runtime `planned` mientras el roadmap no la active.
- Investigación permitida: spikes aislados de representación.
- Primeros spikes autorizados:
  - [`../../80-production/spikes/ARI-R-A-three-spatial-equivalence.md`](../../80-production/spikes/ARI-R-A-three-spatial-equivalence.md)
  - [`../../80-production/spikes/ARI-R-B-pixisvg-diagrammatic-equivalence.md`](../../80-production/spikes/ARI-R-B-pixisvg-diagrammatic-equivalence.md)

No se busca obligatoriamente un único ganador: A y B pueden demostrar una frontera híbrida legítima.

---

## 3. Tesis central

> **The world is mathematical structure.**

La matemática no es una respuesta escrita sobre una puerta. Una operación cambia una propiedad, relación, geometría, agrupación o representación del mundo.

La evolución entre representaciones es parte del gameplay: el jugador debe reconocer que la estructura puede seguir siendo la misma aunque cambie cómo se ve.

Ejemplo conceptual:

```text
12 piezas
→ 3 grupos de 4
→ 6 grupos de 2
→ área equivalente
→ notación posterior
```

---

## 4. Core fijo

```text
Pure TypeScript transformation core
  ├─ mathematical objects
  ├─ representations
  ├─ legal transforms
  ├─ invariants
  ├─ undo/redo
  └─ condition-based validators
          ↓
views/adapters
  ├─ Three.js 2.5D cuando profundidad/materialidad ayuda
  ├─ PixiJS/SVG cuando precisión diagramática ayuda
  └─ DOM para formalización/Bitácora/accessibility
```

**La vista nunca es la fuente de verdad matemática.**

---

## 5. Reglas locales

### DO

- Operaciones que modifican mundo/estructura, no sólo texto.
- Representación múltiple cuando permita descubrir equivalencias o invariantes.
- Mostrar qué cambia y qué se conserva.
- Manipulación antes de formalización simbólica.
- Transferencia: una vez entendido el caso, presentar una variante razonable.
- Usar 3D sólo cuando profundidad/materialidad aumenten comprensión.

### DON'T

- “Resolvé 7 × 8 para abrir la puerta”.
- Sobre-notación antes de comprensión.
- Ocultar estructura bajo animación decorativa.
- Forzar Three.js a una gráfica si SVG/Pixi es más legible.
- Forzar 2D a una relación espacial si materialidad 3D la vuelve evidente.
- Elegir renderer por uniformidad con otro mundo.

---

## 6. Herramientas

Codex implementa e integra. Tooling Three/Pixi/SVG se carga por spike; no
contaminar A con la implementación de B. Gemini puede aportar análisis
multimodal y MiniMax puede producir trabajo delegado por `mmx`, siempre bajo
revisión de Codex. Ver [`../../80-production/AI_TOOLING.md`](../../80-production/AI_TOOLING.md).

---

## 7. Qué se puede hacer ahora

**Sí:**

- ejecutar ARI-R-A y ARI-R-B en ramas separadas;
- construir el `transformation-core` mínimo compartido declarado por la Spike Card;
- medir predicción, equivalencia, transferencia, touch y coste de producción;
- concluir que una familia de conceptos pertenece a una vista distinta de otra.

**No:**

- construir la campaña completa;
- promover GDD PROPOSED a CANON sin ratificación;
- agregar math libraries/symbolic engines sin un problema concreto y comparación;
- copiar renderer-specific code entre spikes;
- convertir una representación bonita en canon sin Learning Contract aprobado.

La campaña se activa por roadmap/ratificación; los spikes sólo retiran incertidumbre tecnológica/pedagógica.
