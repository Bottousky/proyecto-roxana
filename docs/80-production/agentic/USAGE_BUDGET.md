---
status: PROPOSED
authority_level: 5
version: v2.1
last_updated: 2026-08-20
---

# Usage Budget — targets internos

Estos números son objetivos operativos de Roxana, no cuotas prometidas por un
provider ni una conversión token→porcentaje.

| Tier | Impacto semanal OpenAI escaso deseable |
|---|---|
| Tier 0 — Micro | `<1%` |
| Tier 1 — Acotada | `~1–2%` |
| Tier 2 — Feature | `~2–4%` |
| Tier 3 — Milestone | `~4–7%` |

Un run `>10%` es excepcional: investigar routing, contexto y fan-out antes de
repetir el patrón.

## Cómo usar la telemetría

`codex-subagent-audit.ps1` reporta input, cached, uncached, output y reasoning
por rollout/modelo/rol. Sirve para comparar ejecuciones y detectar acumulación;
**no** calcula consumo de cuota semanal. Ese impacto sólo se registra cuando la
interfaz del provider lo vuelve observable.

## Incidente motivador

R7 produjo el 2026-08-20 una caída manualmente observada de aproximadamente 13%
de la capacidad semanal. Dos explorers corrieron Sol/high y acumularon cerca de
0,5M input cada uno. Ver `incidents/2026-08-20-R7-MULTIAGENT-COST.md`.
