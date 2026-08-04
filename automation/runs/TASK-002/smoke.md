# TASK-002 — Smoke de las tres rutas de OpenCode Go

**Fecha:** 2026-08-03
**Superficie:** Orca 1.4.167 → `orca terminal create` + `orca terminal send` → `opencode run`
**Pool:** `opencode-go` — no consume cuota de ChatGPT
**Ronda:** 1
**Estado:** completo — las tres rutas corridas

---

## Qué se probó y qué salió

| Ruta | Modelo | Agente pedido | Agente que corrió | Resultado |
|---|---|---|---|---|
| planner | `opencode-go/glm-5.2` | `director-plan` | `director-plan` | **PASS** |
| builder | `opencode-go/deepseek-v4-flash` | `builder` | `builder` | **INCOMPLETO** |
| reviewer | `opencode-go/glm-5.2` | `reviewer` | **`build` (fallback)** | **NO VÁLIDO** |

Una sola de las tres rutas hace lo que el routing dice que hace.

## Precondición: disponibilidad

Primer intento el 2026-08-03 ~23:26: las dos rutas fallaron porque los modelos chinos no estaban
habilitados en la cuenta. El Director los habilitó y se repitió. Sonda de disponibilidad antes de
gastar en las corridas completas:

```text
opencode-go/glm-5.2            → OK
opencode-go/deepseek-v4-flash  → OK
```

**Los terminales del primer intento murieron y se llevaron el scrollback**, así que el error literal
se perdió. Por eso la segunda corrida vuelca a archivo con `Tee-Object`: un terminal no es evidencia.

## Ruta 1 — planner · `glm-5.2` · **PASS**

Prompt: el estado real del ticket activo, sin nombrarle un solo archivo.

Leyó por su cuenta `STATE.md`, `ownership.json` y `tasks.json`, y corrió `git status --short --branch`.
No editó nada.

Verificado contra el árbol, afirmación por afirmación:

| Afirmación | Veredicto |
|---|---|
| `ARC1-008` activo, `READY`, epic Slice, owner director | correcto |
| predecesor `ARC1-007` `DONE`, sucesor `ARC1-009` `BLOCKED` | correcto |
| `tickets/ARC1-008.md` no existe en disco | correcto |
| paquete activo: ninguno, los define `/arc-plan` (`CP-016`) | correcto |
| escribibles incluyen `BACKLOG.md`, `MODEL_ROUTING.md` y `automation/**` | correcto — **leyó `ownership.json` v12**, no una versión cacheada |
| `?? docs/agent-runs/ohmdal-arco1/` está fuera de ownership, «no tocar» | correcto |
| gate heredado ≤ 512 kB por ciclo `mount→destroy` | correcto |
| digests `db322500` / `50543361`; si cambian es regresión de `ARC1-007` | correcto |
| `npm run verify` `not-run` por WSL sin distribución | correcto |

Cero afirmaciones inventadas. **Duración de reloj ≈ 1,5 min**, incluida la espera de lectura.

`director-plan` declara `mode: primary`, y por eso `--agent director-plan` **sí** se aplica: el
contrato read-only del agente estuvo vigente durante toda la corrida.

## Ruta 2 — builder · `deepseek-v4-flash` · **INCOMPLETO**

Prompt: explicar qué hizo `ARC1-007` (commit `8a6b1c4`), sin editar.

Arrancó bien. Leyó el diff, `evidence/ARC1-007/parity.json` y `tests/a2-hd2d-runtime.test.ts`, y llegó
a citar el bloque de `ExperienceLocation.runtime` con su comentario de `CP-021`.

**Pero nunca emitió la explicación.** La corrida termina así:

```text
! permission requested: bash (git show 8a6b1c4 -- .../DECISIONS.md, Select-String "CP-021"); auto-rejecting
✗ bash failed
Error: The user rejected permission to use this specific tool call.
→ Read docs\agent-runs\...\evidence\ARC1-007\parity.json
→ Read tests\a2-hd2d-runtime.test.ts
```

`builder.md` declara `bash: "*": ask`. En `opencode run` no hay TTY que apruebe, así que **toda
petición de permiso se auto-rechaza** y la corrida se queda sin su respuesta final.

Esto no es un fallo del modelo: es el contrato del agente chocando con el modo no interactivo. El
log crudo pesa 17.366 B y son casi todos tool calls.

## Ruta 3 — reviewer · `glm-5.2` · **NO VÁLIDO**, por dos motivos independientes

### 3.1 El agente pedido no se aplicó

```text
! agent "reviewer" is a subagent, not a primary agent. Falling back to default agent
> build · glm-5.2
```

`reviewer.md` declara `mode: subagent`. `opencode run --agent reviewer` **no lo invoca**: cae al
agente `build` por defecto, que tiene `permission "*": allow`.

**Consecuencia directa sobre el routing.** `CP-022` prometió que builder y reviewer serían modelos
distintos «por configuración, no por disciplina». Por esta vía el reviewer corre **sin su contrato
read-only** y sin su frontmatter. El modelo coincide por casualidad; el agente no.

Y `dispatch.mjs` genera exactamente este comando —`opencode run … --agent reviewer`—, así que la fase
`review` del despachador está rota en silencio: no falla, sólo corre otra cosa.

### 3.2 El paquete de review contenía el diff equivocado

El veredicto salió bien formado y en el formato pedido — `RETHINK`, con P0/P1/P2 y sugerencia,
archivo y motivo en cada uno. Pero es falso, y la culpa es del input:

> **P0** — ninguna de las rutas permitidas de código aparece en el diff. El objetivo del paquete no se implementó.
> **P1** — el diff invade rutas fuera de las permitidas: `automation/schemas/task.schema.json`, `automation/scripts/audit-control-plane.mjs`, `BACKLOG.md`, `DECISIONS.md`, `ownership.json`…

Esas rutas son las de **`CP-023`**, no las de `ARC1-007-B`. Causa exacta,
`automation/scripts/review-packet.mjs:91`:

```js
const diffStat = git(['diff', '--stat']) || git(['show', '--stat', '--format=', 'HEAD']) || '(sin diff)';
```

Toma el diff **del árbol de trabajo**, con fallback a `HEAD`. Nunca lo acota al commit del paquete.
Como `CP-023` ya estaba commiteado y el árbol limpio, cayó al fallback y embebió `19cec92`.

O sea: al reviewer se le dieron los **criterios de aceptación y rutas permitidas de `ARC1-007-B`**
pegados al **diff de `CP-023`**. Razonó correctamente sobre datos incorrectos.

Para cualquier paquete **ya cerrado**, este script produce el diff equivocado. Sólo acierta cuando se
revisa trabajo sin commitear, que es el caso normal en vivo — por eso nadie lo había notado.

## Lo que este smoke deja demostrado

1. **`glm-5.2` sirve para planificar.** Lee el control plane sin guía, respeta read-only y no inventa.
   Es la única ruta de las cuatro de texto con evidencia local a favor.
2. **`deepseek-v4-flash` lee y navega bien**, pero no se puede evaluar su salida hasta resolver el
   modo no interactivo. Su comprensión del diff, hasta donde llegó, era correcta.
3. **El pipeline automatizado funciona hoy para 1 de sus 3 roles.** No por calidad de los modelos:
   por dos defectos de plomería —`mode: subagent` y permisos en modo no interactivo— y un bug de
   `review-packet.mjs`.

## Lo que NO deja demostrado

- La calidad del builder produciendo código. Este smoke era de comprensión, no de escritura.
- La calidad del reviewer juzgando un diff real: nunca vio uno.
- Duración por ruta con precisión. Sólo el planner tiene medición defendible (≈ 1,5 min). Las otras
  dos corrieron en paralelo y los archivos ya estaban estables al primer sondeo; **`durationMin`
  queda `null`, no se estima**.
- El coste por ruta. `opencode stats` da **$0,27 acumulados en dos días y nueve sesiones**, que
  incluye todo lo anterior. No es atribuible a estas tres corridas.

## Estado del routing

Ningún cambio a `routing.json` sale de este smoke: la tarea lo prohíbe expresamente —«el smoke
informa, la ruta la decide el Director»—. Lo que sale son tres hallazgos, registrados en
`OPEN_ISSUES.md` como `OI-012`, `OI-013` y `OI-014`.
