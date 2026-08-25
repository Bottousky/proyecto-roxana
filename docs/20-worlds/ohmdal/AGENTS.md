# AGENTS.md — Ohmdal

> **Verbo nuclear:** **CONECTAR**
>
> **Disciplina:** electricidad/electrónica
>
> **Target técnico:** PlayCanvas Engine v2 + TypeScript + Vite para web

Este archivo especializa el [`AGENTS.md`](../../../AGENTS.md) raíz. Leer ambos y sólo las fuentes directamente relevantes a la tarea.

## Autoridad mínima

- [`vision/ohmdal-vision_v1.md`](vision/ohmdal-vision_v1.md) — fantasía y anti-pilares.
- [`gameplay/ohmdal-core-gameplay_v1.md`](gameplay/ohmdal-core-gameplay_v1.md) — loop.
- [`gameplay/ohmdal-electrical-system_v1.md`](gameplay/ohmdal-electrical-system_v1.md) — modelo eléctrico.
- [`gameplay/ohmdal-puzzle-grammar_v1.md`](gameplay/ohmdal-puzzle-grammar_v1.md) — puzzles válidos.
- [`content/ohmdal-arc-01_v1.md`](content/ohmdal-arc-01_v1.md) y [`content/ohmdal-vertical-slice_v1.md`](content/ohmdal-vertical-slice_v1.md) — contenido.
- [`../../00-governance/ROXANA_CANON_POLICY_v1.md`](../../00-governance/ROXANA_CANON_POLICY_v1.md) — contradicciones y estados de autoridad.

## Estado técnico

- `src/experiences/ohmdal-playcanvas/` y `/ohmdal-playcanvas` son el runtime 3D canónico: PlayCanvas Engine v2 + TypeScript + Vite.
- Blender es DCC master. Decisión: `production/OHMDAL_3D_RUNTIME_DECISION.md`.
- hardening técnico: `dec2d75`.
- greybox Arco I completo: `b8bb412`; loop cerrado en `74abaad`.
- `src/experiences/ohmdal-plaza/` conserva core pedagógico puro compartido.
- `/jugar`, HD2D y otros árboles antiguos son evidencia/prototipos, no rutas paralelas de producción.
- Three.js es cantera de técnicas/R&D, no runtime de Ohmdal.

## Reglas de juego

### Hacer

- Mostrar electricidad como luz, calor, sonido, movimiento, continuidad y conducta del mundo.
- Sostener `predicción → intervención → observación → explicación → transferencia`.
- Mantener modelos pedagógicos TypeScript puros y testeables fuera del renderer.
- Validar condiciones y aceptar varias soluciones cuando el modelo lo permite.
- Diseñar input/cámara/UI para desktop y touch/mobile.
- Calibrar GLB una vez: escala, suelo, orientación, jerarquía y animaciones.
- Antes de producir cualquier asset hero, buscar referencias y pasar `docs/3d/HERO_REFERENCE_GATE.md`.
- Priorizar interacción **world-first**. Si un circuito/panel requiere precisión o densidad, usar close-up diegético del mismo objeto y modelo eléctrico; ver `production/OHMDAL_INTERACTION_POLICY.md`.
- En authored pass, preservar el greybox validado como autoridad espacial/sistémica y aplicar `production/ARCO1_AUTHORED_PASS_POLICY.md`.

### No hacer

- Quizzes o fórmulas usadas como llaves.
- Trial-and-error que sólo “se pone verde”.
- Vocabulario técnico antes de evidencia suficiente.
- Inventar lore o diálogo; usar `TODO(guion)` y reportar.
- Reescribir o borrar baselines para forzar migraciones limpias.
- Actualizar PlayCanvas/Vite/dependencias incidentalmente.
- Empezar hero con text-to-3D libre si existe una referencia fuerte.
- Convertir un panel de mantenimiento en minijuego abstracto desconectado del mundo.
- Reabrir el greybox completo para “mejorar” arte salvo que una regresión o bloqueo real lo exija.

## Tooling y routing

- **Sol High:** master técnico, composición, integración y aceptación.
- **Luna Max:** plumbing/test/layout mecánico con brief cerrado y scope disjunto.
- **Gemini 3.7 Flash High:** contexto/fresh-eyes read-only por Antigravity.
- **MiniMax M3:** durante el trial GMI puede proponer código, VFX/shaders y technical art acotado. Outputs primero en `agent-work/reports/minimax-gmi/`; Sol verifica y aplica. No tiene autoridad de canon ni integración.
- `mmx` sigue siendo la ruta oficial MiniMax cuando exista plan activo; el runner GMI es temporal para evaluación y no se convierte en provider framework.
- PlayCanvas MCP sólo si el estado vivo del Editor aporta valor; Engine code-first usa terminal.
- Blender es herramienta primaria para assets/GLB y Blender Gauntlet.
- Meshy es posibilidad futura de alta fidelidad image/multiview→3D; Tripo A/B. Ambos detrás de HUMAN_GATE económico y siempre canonicalizados en Blender.

## Loops

- Plaza: `../../../agent-work/loops/ohmdal-plaza/LOOP.md` — `complete`, no reabrir salvo regresión demostrada.
- Arco I greybox: `../../../agent-work/loops/ohmdal-arco1-greybox/LOOP.md` — `complete`, baseline jugable.
- **Arco I authored pass:** `../../../agent-work/loops/ohmdal-arco1-authored-pass/LOOP.md` — loop de producción actual.
- Contrato cross-Roxana: `../../80-production/BOUNDED_AGENT_LOOP.md`.

En authored pass, Sol es el único integrador. Luna y MiniMax nunca editan el mismo scope en paralelo. Si GMI falla o termina la promoción, el loop no se bloquea: continúa con Sol/Luna/Gemini.

## Captura y performance

El authored pass debe distinguir:

- captura rápida local con GPU real cuando esté disponible, para iteración;
- gate full reproducible con canonical shots, mobile/no-post, errores y diagnósticos.

Nunca presentar FPS de SwiftShader como benchmark de GPU. Ver `production/ARCO1_CANONICAL_SHOTS.md` y `production/ARCO1_AUTHORED_PASS_POLICY.md`.

## Validación

Tests enfocados durante el cambio; al cierre `npm run verify`. Si afecta al jugador, abrir ruta real y recorrer desktop + touch/mobile.

```bash
npm run loop:ohmdal-arco1:validate
npm run loop:ohmdal-arco1-authored:validate
npm run playtest:ohmdal-golden-path
npm run agent:gemini:check
npm run agent:minimax:gmi:check   # durante trial/configurado
```

Cambios de experiencia, engine/dependencias, canon, guion, dirección visual material o gasto pago se escalan a Manuel.
