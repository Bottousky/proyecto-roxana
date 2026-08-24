# AGENTS.md — Ohmdal

> **Verbo nuclear:** **CONECTAR**
>
> **Disciplina:** electricidad/electrónica
>
> **Target técnico:** PlayCanvas Engine v2 + TypeScript para web

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz. Leer ambos y
sólo las fuentes directamente relevantes a la tarea.

## Autoridad mínima

- [`vision/ohmdal-vision_v1.md`](vision/ohmdal-vision_v1.md) — fantasía y anti-pilares.
- [`gameplay/ohmdal-core-gameplay_v1.md`](gameplay/ohmdal-core-gameplay_v1.md) — loop.
- [`gameplay/ohmdal-electrical-system_v1.md`](gameplay/ohmdal-electrical-system_v1.md) — modelo eléctrico.
- [`gameplay/ohmdal-puzzle-grammar_v1.md`](gameplay/ohmdal-puzzle-grammar_v1.md) — puzzles válidos.
- [`content/ohmdal-arc-01_v1.md`](content/ohmdal-arc-01_v1.md) y
  [`content/ohmdal-vertical-slice_v1.md`](content/ohmdal-vertical-slice_v1.md) — contenido.
- [`../../00-governance/ROXANA_CANON_POLICY_v1.md`](../../00-governance/ROXANA_CANON_POLICY_v1.md)
  — contradicciones y estados de autoridad.

La exploración PlayCanvas vigente como evidencia está en
[`../../80-production/spikes/ohmdal-greenfield-explorable/`](../../80-production/spikes/ohmdal-greenfield-explorable/).
Es `EXPERIMENTAL/PROPOSED`; no asciende narrativa o mecánicas a canon.

## Estado técnico

- `src/experiences/ohmdal-playcanvas/` y `/ohmdal-playcanvas` forman el runtime
  3D canónico: PlayCanvas Engine v2 + TypeScript + Vite.
- Blender es el DCC master. La decisión y su criterio de reapertura viven en
  `production/OHMDAL_3D_RUNTIME_DECISION.md`.
- `src/experiences/ohmdal-plaza/` conserva el core pedagógico puro compartido.
- `/jugar` (`src/jugar/`, Phaser) conserva contenido y regresiones históricas.
- `src/hd2d-ohmdal/` y otros árboles antiguos son evidencia/prototipos, no el
  norte técnico nuevo.
- Three.js y otros prototipos quedan como evidencia histórica de I+D, no como
  rutas paralelas de producción.

## Reglas de juego

### Hacer

- Mostrar electricidad como luz, calor, sonido, movimiento, continuidad y
  conducta del mundo.
- Sostener `predicción → intervención → observación → explicación → transferencia`.
- Mantener modelos pedagógicos TypeScript puros y testeables fuera del renderer.
- Validar condiciones; aceptar varias soluciones cuando el sistema lo permite.
- Diseñar input/cámara/UI para desktop y touch/mobile.
- Calibrar GLB una vez: escala, suelo, orientación, jerarquía y animaciones.
- Antes de producir cualquier asset identitario/hero, buscar referencias existentes
  y pasar `docs/3d/HERO_REFERENCE_GATE.md`. Si hay turnaround aprobado, reconstruir;
  no rediseñar por conveniencia del generador.

### No hacer

- Quizzes o fórmulas usadas como llaves.
- Trial-and-error que sólo “se pone verde”.
- Vocabulario técnico antes de evidencia suficiente.
- Inventar lore o diálogo; usar `TODO(guion)` y reportar.
- Copiar decisiones narrativas del spike greenfield sin ratificación.
- Reescribir o borrar baselines para forzar una migración limpia.
- Actualizar PlayCanvas/Vite/dependencias incidentalmente.
- Empezar un hero con text-to-3D libre si el repo ya contiene una referencia visual
  fuerte que debe preservarse.

## Tooling

- Skills locales: `ohmdal-development` y `ohmdal-graphics-quality`.
- Skills oficiales de `playcanvas/skills`: cargar sólo la operación necesaria.
- PlayCanvas MCP: sólo cuando el estado vivo del Editor aporte valor; Engine
  code-first usa terminal.
- Blender: herramienta primaria para assets/GLB. El MCP oficial requiere el gate
  de seguridad documentado en `docs/80-production/AI_TOOLING.md`.
- Gemini/Antigravity: usar `agy` mediante `npm run agent:gemini` para context
  distillation, reconciliación de muchas fuentes y fresh-eyes visual review. No
  usar Gemini API y no darle autoridad de implementación.
- **Loop visual activo de Plaza:** [`../../../agent-work/loops/ohmdal-plaza/LOOP.md`](../../../agent-work/loops/ohmdal-plaza/LOOP.md)
  + `state.json`, bajo el contrato cross-Roxana [`../../80-production/BOUNDED_AGENT_LOOP.md`](../../80-production/BOUNDED_AGENT_LOOP.md).
  Dentro de ese loop el reviewer automático es Gemini 3.7 Flash High; Sol High decide
  y Luna Max ejecuta sólo trabajo mecánico ya especificado. No usar Pro ni `sol-advisor`
  automáticamente.
- MiniMax: sólo por `mmx`; Codex revisa e integra.
- Hero assets: contrato cross-Roxana
  [`../../3d/HERO_REFERENCE_GATE.md`](../../3d/HERO_REFERENCE_GATE.md). Cada hero
  lleva un `hero-reference.json` y debe pasar `npm run 3d:validate-hero-ref -- <archivo>`.
  Ohm en `assets/references/hero-packs/ohm/hero-reference.json` es el golden example.
- Política actual de authoring/proveedores/Three.js como cantera técnica:
  [`production/OHMDAL_AGENTIC_3D_STACK.md`](production/OHMDAL_AGENTIC_3D_STACK.md).
- Dirección 3D, fuentes gratuitas y quality bar:
  [`production/OHMDAL_3D_PRODUCTION_GUIDE.md`](production/OHMDAL_3D_PRODUCTION_GUIDE.md).
- Para ambientar la Plaza con assets genéricos, **no hacer una búsqueda abierta primero**:
  ejecutar [`production/OHMDAL_PLAZA_ASSET_ACQUISITION.md`](production/OHMDAL_PLAZA_ASSET_ACQUISITION.md)
  y el catálogo machine-readable
  [`production/OHMDAL_PLAZA_ASSET_CATALOG.json`](production/OHMDAL_PLAZA_ASSET_CATALOG.json).
  Esos archivos fijan proveedores, IDs/URLs, batches, staging, límites de cantidad,
  comandos de descarga e integración. Sólo buscar reemplazos si un candidato falla.
- Primera pasada visual ejecutable de la Plaza:
  [`production/OHMDAL_PLAZA_ART_PASS_01.md`](production/OHMDAL_PLAZA_ART_PASS_01.md).
- Claims premium/AAA-like requieren el contrato cross-runtime:
  [`../../3d/VISUAL_HARNESS.md`](../../3d/VISUAL_HARNESS.md).

## Validación

Tests enfocados durante el cambio; al cierre `npm run verify`. Si afecta al
jugador, abrir la ruta real, revisar consola y recorrer desktop + touch/mobile.
Una captura o un build verde no bastan para aprobar experiencia/aprendizaje.

Para un hero, además, el reference pack debe estar `approved` y validar antes de
modelar o generar el candidate final.

Para el loop de Plaza ejecutar además `npm run loop:ohmdal-plaza:validate`; el loop
puede avanzar entre iteraciones/stages sin aprobación humana mientras no aparezca
un `HUMAN_GATE` definido en su contrato.

Cambios de experiencia, engine/dependencias, canon, guion, dirección visual o
migración de runtime se escalan a Manuel.
