---
status: PROPOSED
authority_level: 5
version: v2.1
last_updated: 2026-08-20
supersedes:
  - v1
depends_on:
  - WORKFLOW.md
  - CODEX_MULTI_AGENT_V2.md
  - USAGE_BUDGET.md
---

# Model Routing v2.1 — task-tier, cost-aware

Objetivo: maximizar **calidad por unidad de capacidad frontier escasa**. El
default es un agente; multi-agent se reserva para trabajo que lo justifica.

## 1. Separar modelo y harness

`MODEL != HARNESS`.

GPT-5.6 Terra en Codex y GPT-5.6 Terra en Pi son condiciones distintas. Gemini
en Antigravity y MiniMax M3 en MiniMax Code tampoco heredan resultados de otro
harness. Repo, baseline, contrato, acceptance y evidencia son la interfaz común.

## 2. Routing por tier

| Tier | Scope típico | Ruta por default | Escalación |
|---|---|---|---|
| 0 — Micro | typo, coordenada, assert, bug local conocido | un worker liviano + test enfocado | Player sólo si es visible en runtime |
| 1 — Acotada | interacción, bug de sala, refactor aislado | un worker + gates enfocados | Player si toca la ruta del jugador |
| 2 — Feature | sala, puzzle, feature cross-file mediana | un worker capaz | un explorer si hay ambigüedad; Player si aplica; Reviewer sólo en gate material |
| 3 — Milestone | arquitectura, engine, varios sistemas, root cause difícil | Director Sol posible + un writer | explorers read-only acotados, Player y Reviewer cuando aportan evidencia independiente |

No crear ceremonia para trabajo simple. El Director puede ejecutar él mismo un
Tier 0/1 si transferir contexto cuesta más que resolverlo.

## 3. Harnesses disponibles

Los estados describen política del proyecto, no garantizan instalación, cuota o
modelo efectivo. `roxana-harness-doctor.ps1` aporta el estado local.

| Harness | Estado | Mejor rol actual | Capacidad/coste | Fortaleza | Riesgo |
|---|---|---|---|---|---|
| OpenAI / Codex | **DEFAULT** | single-agent Terra; Sol como Director/arquitectura/review material | cuota semanal escasa | integración repo, tools y síntesis | routing de children puede no respetar request/config |
| Google / Antigravity | **CANDIDATE** | exploración, implementación acotada, long-context, segunda opinión | suscripción Google AI Pro | capacidad separada de Codex | CLI/modelos deben detectarse localmente; no está benchmarkeado |
| MiniMax Code | **TEMPORARY** | Builder challenger Tier 1/2 | suscripción temporal | implementación sostenida | no volverlo dependencia arquitectónica |
| Pi | **CANDIDATE** | harness mínimo Tier 0/1 y Tier 2 directo | no medido | superficie/contexto potencialmente menor | no asumir instalación ni ahorro hasta medir |
| OpenCode Go | **OPTIONAL** | challengers/repair/review cuando esté disponible | provider variable | variedad de modelos | disponibilidad e IDs cambian |

Google/Antigravity es un harness separado: nunca se “spawnea Gemini” desde
Codex MultiAgentV2. Detectar `agy --version`; si el help local publica un comando
de modelos, usar sólo los IDs que ese comando devuelva.

MiniMax separa dos funciones:

- **coding:** MiniMax Code como Builder challenger mientras exista capacidad;
- **media:** proveedor preferido actual para imagen, voz, música y video.

La expiración de la suscripción no debe romper contratos ni arquitectura del
repo.

## 4. Política OpenAI

GPT-5.6 Sol es el recurso premium. Usos normales:

- Director de Tier 3;
- arquitectura y síntesis difícil;
- review adversarial final de milestones importantes;
- escalación tras fallo documentado de una ruta más barata/capaz.

**Sol children están prohibidos por default.** No gastar Sol en discovery,
grep, test writing rutinario, implementación ordinaria, browser driving o repair
mecánico.

Preferencias cuando el runtime las soporte y la telemetría las confirme:

| Rol child | Modelo solicitado | Effort solicitado |
|---|---|---|
| explorer | `gpt-5.6-luna` | `low` |
| worker | `gpt-5.6-terra` | `medium` |
| browser player | `gpt-5.6-terra` | `low` o `medium` |
| reviewer | `gpt-5.6-sol` | `high`, sólo milestone |

Son requests, no hechos. `turn_context.model` y `turn_context.effort` son la
autoridad del rollout.

## 5. Requested, configured, observed

- `REQUESTED_MODEL/EFFORT`: argumentos explícitos del spawn.
- `CONFIGURED_MODEL/EFFORT`: preferencia del TOML del rol.
- `OBSERVED_MODEL/EFFORT`: `turn_context` del rollout child.

Sólo `OBSERVED` autoriza reportar “corrió Luna/Terra/Sol”. Un request explícito
prevalece sobre la preferencia TOML, pero ninguno prevalece sobre la observación.
Una diferencia activa `ROUTING_MISMATCH`.

Para un especialista fresco: `fork_turns="none"`, packet compacto y overrides
explícitos cuando la API los expone. Nunca omitir `fork_turns`; documentar la
excepción si realmente se necesita historial reciente.

## 6. Circuit breaker Codex V2

Después del primer child completado:

1. ejecutar `scripts/codex-subagent-audit.ps1`;
2. comparar requested/configured/observed;
3. cortar fan-out si el child fue Sol inesperadamente, usó más effort que el
   esperado o acumuló contexto desproporcionado;
4. reportar `HARNESS_ROUTING_MISMATCH` y continuar single-agent o cambiar de
   harness con autorización del contrato.

No esperar al quinto child para descubrir el defecto de routing.

## 7. Promoción por benchmark

Comparar, donde estén disponibles:

A. Codex single-agent Terra
B. Pi + modelo OpenAI igual/similar
C. Google Antigravity
D. MiniMax Code

Mantener constantes: **task contract, baseline, acceptance y máximo de repair
loops**. Medir PASS/FAIL, intervención humana, loops, corrección runtime, tests,
archivos leídos/tocados, telemetría de sesión disponible, impacto semanal
observado manualmente, tiempo, tamaño del diff y regresiones.

No comparar una tarea fácil con una difícil ni inventar cuotas precisas. Una
promoción a `DEFAULT` requiere evidencia repetible, no disponibilidad comercial.

## 8. Probe local

El probe único Luna/low coincidió en Codex Desktop `0.148.0-alpha.21`:
`VERIFIED_ON_THIS_VERSION`. El detalle está en `CODEX_MULTI_AGENT_V2.md`; nunca
se generaliza a otras versiones y no sustituye el circuit breaker por run.
