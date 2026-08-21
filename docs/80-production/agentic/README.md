---
status: PROPOSED
authority_level: 5
version: v2.1
last_updated: 2026-08-20
---

# Roxana Agentic Production Harness v2.1

Esta capa convierte decisiones de producto/canon en trabajo verificable. No
promueve implementación a canon y no reemplaza `ROADMAP.md`.

## Default

```text
clasificar Tier 0–3
  → elegir el harness más pequeño/capaz
  → un solo writer
  → gates proporcionales
  → Player sólo si toca la experiencia
  → Reviewer sólo en gate material
```

Multi-agent es escalación de Tier 3. Sol se protege como recurso de dirección,
arquitectura y review importante. Modelo solicitado/configurado no equivale a
modelo observado.

## Índice operativo

| Documento | Pregunta que resuelve |
|---|---|
| [`WORKFLOW.md`](WORKFLOW.md) | ¿Qué loop corresponde a este tier? |
| [`MODEL_ROUTING.md`](MODEL_ROUTING.md) | ¿Qué modelo/harness tiene sentido? |
| [`CODEX_MULTI_AGENT_V2.md`](CODEX_MULTI_AGENT_V2.md) | ¿Cómo spawnear y auditar Codex V2? |
| [`USAGE_BUDGET.md`](USAGE_BUDGET.md) | ¿Qué impacto interno se considera razonable? |
| [`TASK_CONTRACT_TEMPLATE.md`](TASK_CONTRACT_TEMPLATE.md) | ¿Qué debe fijar el contrato? |
| [`templates/SUBAGENT_TASK_PACKET.md`](templates/SUBAGENT_TASK_PACKET.md) | ¿Qué recibe un especialista? |
| [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md) | ¿Qué significa cerrar? |
| [`SPIKE_POLICY.md`](SPIKE_POLICY.md) | ¿Cómo comparar dos opciones materiales? |
| [`ENGINE_MATRIX.md`](ENGINE_MATRIX.md) | ¿Qué engine/representación gobierna cada scope? |
| [`GAME_DEV_AI_TOOLING.md`](GAME_DEV_AI_TOOLING.md) | ¿Qué tooling cargar para el engine real? |
| [`LOCAL_MODEL_SETUP.md`](LOCAL_MODEL_SETUP.md) | ¿Cómo detectar harnesses locales sin volverlos canon? |

## Scripts

- `scripts/codex-subagent-audit.ps1`: telemetría read-only por rollout, modelo y
  rol; tolera sesiones abiertas y última línea parcial.
- `scripts/roxana-harness-doctor.ps1`: versiones/harnesses detectados, modelos
  efectivos recientes y routing mismatches.

## Reglas de cierre

- Durante implementación: tests enfocados; `tsc` sólo si aplica.
- Gate normal final: `npm run verify`.
- Fallback: `npm run build` + `npm test`.
- No apilar build/test/verify.
- Mechanical PASS no sustituye Play PASS para cambios player-facing.
- Integración material requiere a Manuel.
