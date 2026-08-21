---
status: PROPOSED
authority_level: 5
version: v2.1
last_updated: 2026-08-20
supersedes:
  - v1
depends_on:
  - TASK_CONTRACT_TEMPLATE.md
  - DEFINITION_OF_DONE.md
  - MODEL_ROUTING.md
---

# Workflow v2.1 — condicional y bounded

El loop se dimensiona por riesgo. Tests/build prueban mecánica; una ruta
player-facing requiere además uso real como jugador.

## 1. Intake mínimo

Clasificar Tier 0–3 y fijar un contrato proporcional:

- objetivo y no-objetivos;
- superficie permitida;
- estado inicial y resultado observable;
- acceptance y Learning Contract si hay pedagogía;
- checks enfocados, gate final y stop conditions;
- incertidumbre material que exija spikes A/B separados.

No convertir un fix local en una ceremonia de milestone.

## 2. Flujos por tipo

### Micro

```text
contract corto → un worker → test enfocado → DONE
```

Un repair máximo. Sin Explorer, Director fan-out ni Reviewer.

### Local player-facing

```text
contract → un worker → gate enfocado → Player replay → DONE/REPAIR
```

El Player recibe objetivo, controles, estado inicial y target visible; juega
blind-first antes de leer diff/tests. No edita source.

### Feature / room slice

```text
contract → un worker → gates → Player si aplica → verdict
             ↑
      un Explorer sólo si hay ambigüedad real
```

Reviewer sólo si la feature constituye un gate material. Máximo dos repairs
informados; luego reevaluar spec/representación.

### Milestone / arquitectura

```text
Sol Director
  → explorers read-only acotados, sólo si el trabajo es independiente
  → síntesis del Director
  → UN writer
  → gates
  → Player
  → Reviewer adversarial
  → Director: DONE | REPAIR | ESCALATE
  → Manuel: integración material
```

El paralelismo es una optimización. No se habilita si duplica contexto o mezcla
dos writers.

## 3. Contexto y task packets

Un especialista fresco recibe normalmente:

1. instrucciones durables raíz;
2. `AGENTS.md` del scope;
3. task packet;
4. archivos y authority docs directos.

No recibe conversación completa, recovery history, todas las skills ni todas
las áreas. El parent sintetiza findings previos: nunca pega transcripts crudos
del Explorer al Worker. La inyección global automática del host es overhead
fuera del control del repo.

En Codex MultiAgentV2 usar `fork_turns="none"` y overrides explícitos cuando se
soporten. Auditar el primer rollout antes de más fan-out.

## 4. Builder

Hay un solo writer. Implementa el diff mínimo, preserva autoridad y baselines,
no inventa lore/pedagogía, no cambia engine/dependencias incidentalmente y no
debilita tests. Durante implementación corre los tests enfocados afectados;
`tsc --noEmit` es opcional para cambios sensibles a tipos.

## 5. Mechanical gate

Gate final normal:

```bash
npm run verify
```

Ya incluye build, tests y checks auxiliares. Si `verify` no está disponible:

```bash
npm run build
npm test
```

No ejecutar `build`, `test`, `verify` en secuencia salvo para aislar un fallo del
gate. Mechanical PASS no equivale a Play PASS.

## 6. Player gate

Aplica a navegación, spawn, cámara, input, puzzles, hotspots, UI mayor,
save/load y rutas jugables. Primera pasada: blind-first. Segunda: Playwright,
console, network y debug state sólo para convertir sensaciones en repros.

Salida: `PASS | BLOCKER | MAJOR | MINOR`, ruta, pasos, expected/actual, consola,
evidencia y criterio violado. El Player no arregla.

## 7. Reviewer y verdict

El Reviewer es read-only y por default entra sólo en milestone/material gate,
después de mechanical y Play PASS. Busca bypasses, tests debilitados,
regresiones, autoridad paralela y contradicciones pedagógicas. No bloquea por
preferencia estética.

El Loop Owner decide:

- `DONE`: acceptance observable satisfecha y gates requeridos verdes;
- `REPAIR`: defecto técnico reproducible dentro del budget;
- `ESCALATE`: contrato/representación dudosa, decisión material o budget
  agotado.

## 8. Repair budget

| Scope | Budget normal |
|---|---|
| Micro | 1 repair |
| Feature | 2 repairs informados |
| Milestone | 2 repairs informados antes de reevaluación del Director |

Si el mismo defecto sobrevive a dos fixes, cuestionar spec/representación antes
de otro parche. Nunca hacer retry ciego con modelos frontier.

## 9. Cierre

Registrar sólo lo necesario: diff, gates, evidencia Player si aplica, review si
aplica, riesgo residual y decisión humana pendiente. El detalle de uso vive en
`USAGE_BUDGET.md`; el routing en `MODEL_ROUTING.md`.
