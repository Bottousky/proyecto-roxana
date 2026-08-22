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

- `src/experiences/ohmdal-playcanvas/` y `/ohmdal-playcanvas` forman un spike
  jugable de PlayCanvas, todavía no el runtime definitivo.
- `src/experiences/ohmdal-plaza/` comparte sistemas usados por ese spike.
- `/jugar` (`src/jugar/`, Phaser) conserva contenido y regresiones históricas.
- `src/hd2d-ohmdal/` y otros árboles antiguos son evidencia/prototipos, no el
  norte técnico nuevo.
- La migración completa a PlayCanvas requiere una spec y tarea propias. No se
  ejecuta como efecto lateral de otro cambio.

## Reglas de juego

### Hacer

- Mostrar electricidad como luz, calor, sonido, movimiento, continuidad y
  conducta del mundo.
- Sostener `predicción → intervención → observación → explicación → transferencia`.
- Mantener modelos pedagógicos TypeScript puros y testeables fuera del renderer.
- Validar condiciones; aceptar varias soluciones cuando el sistema lo permite.
- Diseñar input/cámara/UI para desktop y touch/mobile.
- Calibrar GLB una vez: escala, suelo, orientación, jerarquía y animaciones.

### No hacer

- Quizzes o fórmulas usadas como llaves.
- Trial-and-error que sólo “se pone verde”.
- Vocabulario técnico antes de evidencia suficiente.
- Inventar lore o diálogo; usar `TODO(guion)` y reportar.
- Copiar decisiones narrativas del spike greenfield sin ratificación.
- Reescribir o borrar baselines para forzar una migración limpia.
- Actualizar PlayCanvas/Vite/dependencias incidentalmente.

## Tooling

- Skill local: `ohmdal-development`.
- Skills oficiales de `playcanvas/skills`: cargar sólo la operación necesaria.
- PlayCanvas MCP: sólo cuando el estado vivo del Editor aporte valor; Engine
  code-first usa terminal.
- Blender: herramienta primaria para assets/GLB. El MCP oficial requiere el gate
  de seguridad documentado en `docs/80-production/AI_TOOLING.md`.
- MiniMax: sólo por `mmx`; Codex revisa e integra.

## Validación

Tests enfocados durante el cambio; al cierre `npm run verify`. Si afecta al
jugador, abrir la ruta real, revisar consola y recorrer desktop + touch/mobile.
Una captura o un build verde no bastan para aprobar experiencia/aprendizaje.

Cambios de experiencia, engine/dependencias, canon, guion, dirección visual o
migración de runtime se escalan a Manuel.
