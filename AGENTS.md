# AGENTS.md — Proyecto Roxana

**Manual operativo durable del estudio.** Lore y diseño viven en `docs/`;
producción agentic en [`docs/80-production/agentic/`](docs/80-production/agentic/).

> `ROADMAP.md` ordena el producto. Governance, GDD y docs de mundo deciden qué
> es Roxana. La implementación y su telemetría sólo aportan evidencia.

## 1. Identidad y dirección técnica

Roxana es una experiencia educativa basada en mundos donde el conocimiento
constituye reglas manipulables del gameplay.

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM — hipótesis fuerte |
| Ohmdal | **CONECTAR** | Phaser 4 top-down room-based — north actual |
| Physica | **EXPERIMENTAR** | Babylon + analítica TS; 2.5D default, 3D selectivo |
| Bitland | **PROGRAMAR** | core TS + DOM; Pixi vs Phaser por spikes separados |
| Arithmos | **TRANSFORMAR** | core TS; Three vs Pixi/SVG por representación |

P12 manda: los mundos comparten producto, no engine, cámara o género
obligatorios.

## 2. Autoridad

Estados: `CANON`, `PROPOSED`, `LEGACY`, `EXPERIMENTAL`, `REJECTED`.

`governance → global → world → content → production → task contract → evidence`

Ante contradicción, aplicar
`docs/00-governance/ROXANA_CANON_POLICY_v1.md`. Código/runtime nunca asciende
una idea a canon.

## 3. Reglas duras de producto

1. No inventar narrativa. Si falta: `TODO(guion)` + placeholder neutro + reporte.
2. Formalizar sólo después de evidencia suficiente del jugador.
3. Validar por condiciones y admitir varias soluciones cuando corresponda.
4. Mantener el core pedagógico puro/testeable; el renderer no es su verdad.
5. Usar español neutro/tuteo en texto visible.
6. No hacer upgrades incidentales de dependencia o engine.
7. No romper baselines jugables ni debilitar tests/acceptance para obtener PASS.
8. No elegir engine por preferencia; usar los spikes definidos si hay duda material.
9. Compilar o mostrar un screenshot no equivale a DONE.
10. Desktop y mobile/touch son targets de primera clase cuando aplica.
11. Verificar licencia/provenance antes de copiar material externo.
12. Las decisiones materiales se integran con Manuel.

## 4. Context-on-Demand

No precargar el repo, el historial de recovery ni catálogos enteros de skills.

```text
objetivo humano
  → AGENTS.md raíz
  → AGENTS.md + CURRENT_STATE.md del scope, si existen
  → authority docs estrictamente relevantes
  → Task/Learning Contract o task packet
  → archivos directos
```

Cargar por default como máximo una skill directamente relevante. La inyección de
contexto propia del host/plataforma es overhead externo al control del repo.

## 5. Clasificación y routing

Clasificar antes de elegir harness. Ver
[`MODEL_ROUTING.md`](docs/80-production/agentic/MODEL_ROUTING.md).

- **Tier 0 — Micro:** un worker liviano, test enfocado.
- **Tier 1 — Implementación acotada:** un worker; Player sólo si toca runtime.
- **Tier 2 — Feature/sala:** un worker capaz; un explorer sólo si hay ambigüedad;
  Player si aplica; Reviewer sólo en gate material.
- **Tier 3 — Milestone/arquitectura:** Director Sol posible, explorers acotados si
  son independientemente útiles, **un solo writer**, Player y Reviewer.

El default es **single-agent / single-builder**. Multi-agent es una escalación,
no un ritual.

## 6. Reglas de harness y coste

- GPT-5.6 Sol es capacidad escasa: usarlo como Director, síntesis difícil,
  arquitectura o review material; no para grep, implementación rutinaria,
  browser driving o reparación mecánica.
- No crear hijos Sol implícitos. Al pedir un especialista fresco usar siempre
  `fork_turns="none"` y un task packet compacto.
- Si el runtime expone overrides, pedir `model` y `reasoning_effort`
  explícitamente. TOML y request expresan intención; `turn_context` observado
  decide qué modelo/esfuerzo ejecutó realmente.
- Tras el primer hijo, auditar su rollout. Un modelo/esfuerzo inesperado o
  contexto excesivo activa `HARNESS_ROUTING_MISMATCH` y corta el fan-out.
- Un child no crea otros children salvo autorización expresa del contrato.
- Google/Antigravity, MiniMax Code, Pi y OpenCode son harnesses separados; usar
  su interfaz nativa y no simularlos como subagentes Codex.
- `MODEL != HARNESS`. Toda promoción requiere benchmark comparable.
- No cargar setup de providers salvo que la tarea sea de routing/harness.

## 7. Implementación y gates

Durante implementación: tests enfocados y `tsc --noEmit` sólo si el cambio de
tipos lo justifica. Gate mecánico final normal:

```bash
npm run verify
```

`verify` ya incluye build, tests y checks auxiliares. Si no existe en el harness:

```bash
npm run build
npm test
```

No ejecutar `build → test → verify` en secuencia salvo para depurar el gate.
Después se juega el runtime cuando el cambio es player-facing.

Repair budget: Micro 1; Feature 2 fixes informados; Milestone 2 antes de que el
Director reevalúe spec/representación. No reintentar a ciegas.

## 8. Roles on-demand

- **Builder:** único writer, implementa y corre gates enfocados.
- **Explorer:** read-only, sólo ante ambigüedad; entrega evidencia compacta.
- **Player:** blind-first; no arregla; reporta repros.
- **Reviewer:** read-only y adversarial; por default sólo en milestone gate.

El flujo condicional vive en
[`WORKFLOW.md`](docs/80-production/agentic/WORKFLOW.md). Los especialistas reciben
[`SUBAGENT_TASK_PACKET.md`](docs/80-production/agentic/templates/SUBAGENT_TASK_PACKET.md),
no transcripts crudos.

## 9. Spikes y tooling

Dos candidatos plausibles implican dos spikes aislados desde el mismo baseline,
core, contrato, builder/harness y budget. Ver `SPIKE_POLICY.md`,
`ENGINE_MATRIX.md` y `GAME_DEV_AI_TOOLING.md`. No copiar bundles de provenance
dudosa.

## 10. Fuentes rápidas y escalación

- `docs/START_HERE.md`
- `ROADMAP.md`
- `docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md`
- `docs/00-governance/ROXANA_CANON_POLICY_v1.md`
- `docs/guia-puzzles.md`
- `docs/20-worlds/<mundo>/AGENTS.md`
- `docs/80-production/agentic/README.md`

Escalar a Manuel: diseño/experiencia, guion, dependencia/engine/runtime, canon
alto, ganador de spike, budget agotado, decisión visual/material o integración
de milestone. Un fix técnico local dentro de contrato claro se resuelve y se
verifica.
