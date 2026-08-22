# Mapa de documentación

Índice vivo de `docs/`. Para reglas operativas ver [`../AGENTS.md`](../AGENTS.md); para el norte actual ver [`START_HERE.md`](START_HERE.md).

> Menor `authority_level` = mayor autoridad. La implementación nunca convierte una idea en canon. Material `LEGACY`/histórico puede conservar valor como insumo o regresión, pero no gobierna una decisión nueva.

## 1. Estructura vigente

```text
docs/
├── README.md                   este índice
├── START_HERE.md               norte de producto actual
├── guia-puzzles.md             CANON — diseño/auditoría de puzzles
├── 00-governance/              pilares, canon policy, design language, doc architecture, review
├── 10-global/                  Instituto, Bitácora, narrativa, campañas, UI/UX, metaprogresión
├── 20-worlds/                  GDD modular por mundo
│   ├── ohmdal/                 CONECTAR — foco principal de producción
│   ├── physica/                EXPERIMENTAR — Hito 1 Babylon jugable
│   ├── bitland/                PROGRAMAR — campaña PROPOSED; spikes renderer autorizados
│   └── arithmos/               TRANSFORMAR — campaña PROPOSED; spikes representación autorizados
├── 30-integration/             cruces interdisciplinarios
├── 80-production/
│   ├── AI_TOOLING.md           harness técnico mínimo y herramientas disponibles
│   └── spikes/                 specs A/B aisladas
├── ohmdal-biblia/              fuente histórica absorbida progresivamente por Ohmdal v1
├── arco1/                      dirección visual viva de Ohmdal Arco I
├── 3d/                         contratos/pipeline Blender → GLB y QA 3D
└── sessions/                   proceso de diseño; no autoridad de producto
```

Cada mundo tiene un `AGENTS.md` con fuentes de autoridad, estado y restricciones
locales. El harness común vive sólo en el `AGENTS.md` raíz.

## 2. Authority levels

| Nivel | Qué vive ahí |
|---|---|
| **0** | constitución fundacional: pilares, canon policy |
| **1** | constitución operativa: lenguaje, arquitectura documental, review |
| **2** | biblia global |
| **3** | biblia de mundo |
| **4** | diseño de contenido |
| **5** | producción: pipelines, runtimes, QA, engine/tooling hypotheses |
| **6** | Task/Spike Contract |
| **7** | evidencia de implementación/playtest |

Ante contradicción aplicar [`00-governance/ROXANA_CANON_POLICY_v1.md`](00-governance/ROXANA_CANON_POLICY_v1.md).

## 3. Cómo navegar por tarea

### Diseñar/implementar un puzzle

1. [`../AGENTS.md`](../AGENTS.md)
2. [`guia-puzzles.md`](guia-puzzles.md)
3. `20-worlds/<mundo>/AGENTS.md`
4. `20-worlds/<mundo>/gameplay/<mundo>-puzzle-grammar_v1.md`
5. La spec/tarea con criterios observables y evidencia de aprendizaje cuando aplique.

### Trabajar en Ohmdal

1. [`20-worlds/ohmdal/AGENTS.md`](20-worlds/ohmdal/AGENTS.md)
2. [`../ROADMAP.md`](../ROADMAP.md)
3. docs de gameplay/content/visual citados por ese `AGENTS.md`
4. **spike PlayCanvas actual:** `src/experiences/ohmdal-playcanvas/`
5. **baselines de regresión/contenido:** `src/jugar/` y prototipos históricos

No asumir que el spike PlayCanvas ya es una migración terminada ni borrar
baselines hasta que exista una tarea específica.

### Trabajar en Physica

1. [`20-worlds/physica/AGENTS.md`](20-worlds/physica/AGENTS.md)
2. [`20-worlds/physica/production/arquitectura.md`](20-worlds/physica/production/arquitectura.md)
3. `src/experiences/physica/`

Babylon es la dirección de Physica, no un engine global de Roxana.

### Investigar Bitland sin abrir la campaña

1. [`20-worlds/bitland/AGENTS.md`](20-worlds/bitland/AGENTS.md)
2. `80-production/spikes/BIT-R-A-*` o `BIT-R-B-*`

Sólo spikes autorizados; no construir el Arco I completo todavía.

### Investigar Arithmos sin abrir la campaña

1. [`20-worlds/arithmos/AGENTS.md`](20-worlds/arithmos/AGENTS.md)
2. `80-production/spikes/ARI-R-A-*` o `ARI-R-B-*`

### Herramientas de IA

1. [`../AGENTS.md`](../AGENTS.md)
2. [`80-production/AI_TOOLING.md`](80-production/AI_TOOLING.md)
3. `.agents/skills/` sólo para la skill concreta que corresponda

### Entender la visión general

1. [`START_HERE.md`](START_HERE.md)
2. [`../ROADMAP.md`](../ROADMAP.md)
3. [`00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md`](00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md)
4. [`10-global/ROXANA_INSTITUTE_BIBLE_v1.md`](10-global/ROXANA_INSTITUTE_BIBLE_v1.md)

## 4. Histórico vs legacy útil

No borrar algo sólo porque sea viejo:

- `/jugar` es legacy visual pero baseline de contenido/regresión durante la
  transición a PlayCanvas;
- `ohmdal-biblia/` conserva trazabilidad e insumo, pero `20-worlds/ohmdal/` gobierna cuando contradicen;
- `sessions/` documenta proceso, no decisiones vigentes;
- prototipos/renders viejos se conservan sólo cuando sirven de evidencia, regresión o referencia explícita.

Una limpieza de legacy runtime/assets requiere una tarea propia: no se hace incidentalmente durante una milestone de gameplay.
