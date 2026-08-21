---
status: PROPOSED
authority_level: 6
date: 2026-08-20
incident: R7_MULTIAGENT_COST
---

# R7 MultiAgent cost incident

R7 alcanzó `STATIC/DATA PASS`. La ruta completa del Player quedó bloqueada por
un path no relacionado del Instituto; esta nota no continúa ni repara R7.

Durante el run, la interfaz mostró una caída aproximada de 13% de la capacidad
semanal. Dos explorers observados en rollouts Codex V2 ejecutaron
`gpt-5.6-sol` con effort `high`:

| Child | Input | Cached | Uncached |
|---|---:|---:|---:|
| Ramanujan | 498.617 | 396.800 | 101.817 |
| Einstein | 512.774 | 428.288 | 84.486 |

Combinados: aproximadamente 1,01M input y 186.303 uncached. El valor TOML de
reasoning bajo no fue autoridad del runtime; ambos `turn_context` observaron
`high`. Los spawns también heredaron historial completo.

Lección operativa: usar `fork_turns="none"`, requests explícitos y verificar el
primer child antes de habilitar más fan-out. La telemetría de tokens es evidencia
diagnóstica y no una conversión directa a cuota semanal.
