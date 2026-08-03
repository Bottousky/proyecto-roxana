# `automation/` — capa de taxonomía, routing y verificación

**Qué es:** cuatro archivos de datos y cinco scripts sin dependencias que hacen **ejecutable** lo que
el control plane de `docs/agent-runs/` ya decía en prosa.

**Qué NO es:** un segundo control plane. `docs/agent-runs/<hito>/` sigue siendo la fuente de verdad
de estado, ownership, decisiones y evidencia. Esta capa **lee** ese control plane y lo verifica;
nunca lo reescribe. Si los dos se contradicen, manda el control plane y se corrige `automation/`.

---

## 1. Por qué existe

El sistema que ya tenías cubre casi toda la arquitectura que describe la propuesta, con otros
nombres. Lo que faltaba no era estructura: era que algo **comprobara** la estructura.

`STATE.md` lo dice con todas las letras en `OI-006`:

> Las fichas de los dos paquetes de `ARC1-007` declararon `DONE` el 2026-08-02 con evidencia que no
> existía, y `B` no tenía una sola línea implementada. El control plane resistió —`STATE.md` seguía
> en `READY` y `ownership.json` sin rotar— pero nada impidió que las fichas afirmaran lo contrario
> durante una sesión entera.

Una ficha no puede ser su propia prueba. Todo lo que hay acá sale de esa frase.

---

## 2. Qué ya existía (no rehacerlo)

| Lo que pide la propuesta | Dónde vive ya |
|---|---|
| Orquestar por archivos de tarea, no por conversación | `docs/agent-runs/<hito>/tasks.json`, `tickets/`, `packets/` |
| Cerebro que no implementa | rol Director en `AGENTS.md`; agente `director-plan` read-only |
| Workers baratos acotados | `.opencode/agents/builder.md`, permisos cerrados por comando |
| Reviewer independiente | `.opencode/agents/reviewer.md`, modelo distinto, read-only |
| `max_attempts`, `max_steps`, timebox | `steps:` en cada agente; `maxRounds` y `internalTaskMinutes` en `tasks.json` |
| Estados de tarea | `READY` · `TECH_REVIEW` · `HUMAN_REVIEW` · `BLOCKED` · `FAILED` · `DONE` |
| Blocked report | estado `BLOCKED` + `OPEN_ISSUES.md` |
| `/runs`, `/artifacts`, `/logs` | `evidence/<TICKET>/` + `telemetry.json` |
| Dashboard | `node scripts/arc-board.mjs --open` |
| Contratos por rol | `.codex/agents/*.toml`, `.opencode/agents/*.md` |
| Pipelines de arte | `docs/agent-runs/<hito>/ASSET_PIPELINE.md`, `.agents/skills/` |

**Lo único que faltaba de verdad,** y es lo que agrega esta carpeta:

1. **Taxonomía cerrada de tipos de trabajo.** Un ticket no declaraba de qué tipo era, así que el
   routing y los gates se decidían de nuevo cada vez. → `taxonomy.json`
2. **Routing consultable por un programa,** con el pool de cuota que consume cada ruta.
   `MODEL_ROUTING.md` explica el criterio pero se desactualiza solo. → `routing.json` + `providers.mjs`
3. **Verificación de lo declarado contra el disco.** → `validate-task.mjs`, `audit-control-plane.mjs`
4. **Cola con estado `WAITING_PROVIDER`,** para trabajo que espera una capability y no un permiso.
5. **Review packet acotado,** para que la sesión nueva del reviewer arranque sin heredar supuestos.

---

## 3. Correcciones de hecho a la propuesta

Verificadas contra este equipo el 2026-08-03, no contra reputación.

**`img2threejs` no produce un `.glb`.** Produce **código Three.js procedural**, por passes, con
verificación visual en cada uno. No hay paso de export ni de normalización de malla. El pipeline
"imagen → img2threejs → exportar GLB → integrar" no existe: mezcla dos rutas distintas. En
`taxonomy.json` el kind se llama `PROC3D_FROM_IMAGE` justamente para que no se confunda con
`ASSET_3D_MODULAR` ni con `ASSET_3D_MESHY`.

**`gpt-5.6-luna` sí está en el catálogo de OpenCode Go.** La propuesta afirma que Go no lista Luna;
la documentación de Go lista 18 modelos e incluye `gpt-5.6-luna`, junto a `glm-5.2`, `kimi-k3`,
`deepseek-v4-pro` y `grok-4.5`. Lo que no aparece es `gpt-5.6-sol`.

**Pero Go no está contratado.** `opencode models` acá devuelve solo gratuitos del proveedor
`opencode` más el proveedor `openai` autenticado. `glm-5.2` y `kimi-k3` **no se pueden llamar hoy**.
Un routing de emergencia hacia GLM-5.2 apuntaría a un modelo inexistente: por eso `validate-task.mjs`
falla si un `modelId` no está en el inventario local.

**El agujero de presupuesto está al revés de como lo pensaba la propuesta.** `opencode auth list`
muestra **OpenAI por OAuth**, y `opencode models` ofrece 22 modelos `openai/*` —incluidos
`gpt-5.6-sol` y `gpt-5.6-sol-pro`—. Enrutar un worker "barato" de OpenCode a `openai/*` **gasta la
misma cuota de ChatGPT que Codex**: es el mismo pool, no una vía de escape. `route.mjs` lo advierte
y `validate-task.mjs` lo rechaza.

**El inventario gratuito rota en días.** Entre el 2026-08-02, fecha de `MODEL_ROUTING.md`, y el
2026-08-03 aparecieron tres modelos que ese documento no conoce: `big-pickle`, `laguna-s-2.1-free` y
`ling-3.0-flash-free`. Un routing escrito a mano miente rápido; `providers.mjs` lo detecta.

**Codex sí genera imágenes,** con `gpt-image-2` y la skill `$imagegen`, desde ~2026-04. La
instalación local es `codex-cli 0.145.0` y **no se comprobó en esta cuenta**. Hasta que haya smoke,
`routing.json` declara `imagegen` con `verified: false` y toda tarea de arte nace en
`WAITING_PROVIDER`. Ese smoke es `TASK-001`.

**`opencode` ya lee las skills del proyecto.** Busca en `.opencode/skills/`, `.claude/skills/` y
`.agents/skills/`; las diez de `.agents/skills/` —`img2threejs`, `roxana-3d-director`,
`meshy-3d-generation`…— ya son visibles para OpenCode sin copiarlas.

**Lo que la propuesta no tenía y es la mayor parte del trabajo real:** los kinds `CONTROL_PLANE` y
`MEASUREMENT`. `ARC1-003` a `ARC1-008` son todos de esos dos tipos. Una taxonomía que solo contempla
código y arte deja fuera casi todo lo que esta corrida hizo hasta ahora.

---

## 4. Uso

Inventario real de proveedores y contraste contra el routing:

```bash
node automation/scripts/providers.mjs --write
```

Auditar el control plane vivo contra sus propias reglas:

```bash
node automation/scripts/audit-control-plane.mjs -v
```

Validar tareas —forma, taxonomía, routing, límites, ownership y evidencia en disco—:

```bash
node automation/scripts/validate-task.mjs automation/tasks
```

Ver la cola y a dónde va cada tarea:

```bash
node automation/scripts/route.mjs automation/tasks --queue
```

Obtener el comando exacto para despachar una tarea:

```bash
node automation/scripts/route.mjs automation/tasks/queue/TASK-002.json
```

Armar el review packet de un paquete o de una tarea:

```bash
node automation/scripts/review-packet.mjs ARC1-007-B --out automation/runs/review-ARC1-007-B.md
```

---

## 5. Estructura

```text
automation/
  FLUJO.md               el flujo de trabajo real: qué escribís, dónde y cuándo
  taxonomy.json          18 kinds cerrados: pipeline, etapas, rol, capabilities, gates
  routing.json           rol → superficie → modelo → pool de cuota, con política al agotarse
  known-deviations.json  desviaciones que el Director ya declaró: bajan a warn, nunca se ocultan
  provider-health.json   GENERADO por providers.mjs — inventario observado, no declarado
  schemas/task.schema.json
  tasks/
    _TEMPLATE.task.json
    queue/  waiting-provider/  in-progress/  review/  done/  blocked/
  runs/                  evidencia de tareas de esta capa
  scripts/
    lib.mjs                    utilidades: mini JSON Schema, globs, evidencia
    providers.mjs              observa el inventario y lo contrasta
    validate-task.mjs          valida una Task Spec contra schema, taxonomía, routing y DISCO
    route.mjs                  imprime destino y comando exacto; no ejecuta
    audit-control-plane.mjs    audita docs/agent-runs/<hito>/ contra sus reglas
    review-packet.mjs          arma el paquete mínimo del reviewer
```

---

## 6. Lo que deliberadamente NO se construyó

**Un router que dispara workers solo.** `route.mjs` imprime el comando; el humano lo pega. Disparar
automáticamente solo tiene sentido cuando las rutas están medidas, y hoy `imagegen` y `vision` no
tienen smoke, tres modelos gratuitos son desconocidos y `telemetry.json` tiene ocho registros con
`durationMin: null`. Automatizar un despacho que no se sabe si funciona es exactamente cómo se
pierden cuatro horas. Cuando haya telemetría suficiente, agregar `--exec` son veinte líneas.

**Reintentos automáticos.** El límite de dos intentos ya existe y la escalación está declarada en
`routing.json`. Quien decide escalar es el Director.

**Un segundo dashboard.** `scripts/arc-board.mjs` ya lo hace y lee del control plane.

**Workers en paralelo.** El hito activo es `STRICT-SERIAL` con WIP 1. Esta capa no lo toca.

---

## 7. Estado frente al control plane de Ohmdal

`ARC1-008` está activo y `src/**` sigue globalmente protegido. Esta carpeta **no toca nada** de
`docs/agent-runs/ohmdal-arc1-serial-v1/`, `src/`, `tests/`, `package.json` ni `vite.config.ts`. Es
aditiva y read-only respecto del hito.

Según el propio protocolo, incorporarla al flujo de la corrida —referenciarla desde `tasks.json`,
darle un dueño en `ownership.json`, o exigir que `arc-close` corra la auditoría antes de cerrar— es
un cambio de control plane y **necesita su propia decisión `CP-0NN`**. Mientras esa decisión no
exista, `automation/` es una herramienta que se puede correr a mano y cuyo veredicto no es
vinculante para ningún gate.
