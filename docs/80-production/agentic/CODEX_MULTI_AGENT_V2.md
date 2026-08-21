---
status: PROPOSED
authority_level: 5
version: v2.1
last_updated: 2026-08-20
---

# Codex MultiAgentV2 — contrato observable

MultiAgentV2 es una opción normal sólo para Tier 3. Tier 0–2 usa single-agent o
single-builder salvo ambigüedad/validación independiente concreta.

## Spawn contract

Todo especialista fresco debe declarar:

- `fork_turns="none"`;
- `model` y `reasoning_effort` cuando la API los expone;
- `CAN_SPAWN_CHILDREN=false`;
- un packet compacto con scope, inputs, acceptance, budget y stop;
- un output acotado a evidencia accionable.

Nunca omitir `fork_turns`. Sólo usar historial reciente por una razón escrita en
el task packet. No usar `fork_turns="all"` como default.

## Tres estados de routing

| Estado | Fuente | Significado |
|---|---|---|
| `REQUESTED` | argumentos del spawn | lo que el parent pidió |
| `CONFIGURED` | TOML del rol | preferencia local, no garantía |
| `OBSERVED` | `turn_context` del rollout | ejecución efectiva y autoridad |

Un child sólo puede reportarse como Luna/Terra/Sol si `OBSERVED_MODEL` lo
demuestra. `requested=Luna` + `observed=Sol` es `ROUTING_MISMATCH`.

## Cost circuit breaker

Tras completar el primer child, antes de cualquier spawn del mismo patrón:

1. ejecutar `scripts/codex-subagent-audit.ps1`;
2. inspeccionar modelo, effort, contexto y tokens efectivos;
3. detener fan-out si aparece Sol inesperado, effort superior al esperado o
   acumulación claramente desproporcionada al task packet;
4. reportar `HARNESS_ROUTING_MISMATCH`;
5. continuar single-agent o elegir otro harness sólo dentro del contrato.

La telemetría de tokens es diagnóstico. No convierte tokens a porcentaje de
cuota semanal.

## Context policy

Un child recibe root durable instructions, scope `AGENTS.md`, task packet,
authority docs directos y archivos necesarios. El parent sintetiza findings;
no reenvía transcripts crudos. El catálogo/global prompt inyectado por Codex es
overhead de plataforma que el repo no puede eliminar.

## Probe de la versión instalada

Probe único ejecutado el 2026-08-20 sobre el runtime Codex Desktop reportado por
el rollout como `0.148.0-alpha.21`:

| Campo | Valor |
|---|---|
| Request | `gpt-5.6-luna`, effort `low`, `fork_turns="none"` |
| Observed | `gpt-5.6-luna`, effort `low` |
| Task output | `ROXANA_ROUTING_PROBE_OK` |
| Input telemetry | 22.936 input, 0 cached, 22.936 uncached |

`CODEX_V2_HETEROGENEOUS_ROUTING = VERIFIED_ON_THIS_VERSION`

Esto verifica el override en una ejecución mínima, no elimina la obligación de
auditar el primer child de cada patrón/versión. El input del probe también
demuestra overhead inyectado por plataforma aun sin repo exploration. El
resultado no se generaliza a otra versión de Desktop/CLI.
