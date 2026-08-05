# Flujo de trabajo real

Estado al 2026-08-03. Go activo, Codex al 7 % hasta el 8/8, Claude en cuenta regresiva.

---

## 0. El ciclo, en seis comandos

Esto es todo. Lo demás de este documento es contexto.

```text
0.  escritorio →  «Roxana — Consola Arco I»   qué toca, con qué modelo · copiás el prompt
1.  opencode  →  /arc-plan ARC1-008          leés el plan · cerrás
2.  opencode  →  /arc-build ARC1-008-A       aprobás cada edición · cerrás
3.  terminal  →  npm run build && npm test
4.  opencode  →  /arc-review ARC1-008-A      leés el veredicto · cerrás
5.  opencode  →  /arc-close ARC1-008         cerrás
6.  terminal  →  git commit
```

El paso 0 es el único que agrega esta capa al ciclo, y no lanza nada: te dice qué abrir y te deja el
prompt en el portapapeles. Al terminar cada sesión volvés a la consola y registrás el resultado.

Cuatro sesiones de OpenCode y dos vueltas a la terminal. **«Cerrás» es literal:** salís del programa
y volvés a entrar, porque `opencode` a secas abre sesión nueva y `-c` continúa la anterior. Esa es la
única regla que no se rompe.

**Todo lo que hay en `automation/` es opcional.** Son lupas para cuando algo huele mal, no pasos del
ciclo. Si nunca corrés un script, el ciclo funciona igual.

| Cuándo | Lupa |
|---|---|
| «¿en qué estado estoy?» | `node automation/scripts/audit-control-plane.mjs` |
| «¿qué tareas tengo?» | `node automation/scripts/route.mjs automation/tasks --queue` |
| «el builder dice que terminó, ¿le creo?» | `node automation/scripts/audit-control-plane.mjs` |
| «el reviewer necesita contexto acotado» | `node automation/scripts/review-packet.mjs <paquete> --out <ruta>` |
| «cambió algo en los proveedores» | `node automation/scripts/providers.mjs --write` |

### El ciclo automático — APARCADO por `CP-031`

`dispatch.mjs` encadena las etapas con `--go` y `--queue --go`. **Está aparcado:** el código queda,
pero el trabajo no se lanza por ahí. El motivo, la evidencia medida y las condiciones para volver
están en [`README.md` §4.1](README.md) y en `CP-031`.

En una frase: encadenar `plan → build → review` no acelera el proyecto mientras las decisiones de
tamaño, modelo, effort y duración sigan sin medir — acelera ejecutar decisiones mal calibradas.
Abrir una sesión y pegar un prompt cuesta dos minutos y es el fusible que corta antes de quemar una
hora de modelo.

### Lo que reemplaza al ciclo automático

Una consola que **decide y muestra**, y una sesión que **abrís vos**:

```bash
node scripts/arc-board.mjs --serve --open
```

O el acceso directo **«Roxana — Consola Arco I»** del escritorio, que hace lo mismo.

```text
tarjeta  →  una sesión  →  un resultado  →  una revisión  →  un commit
```

La consola te dice el paquete activo, la fase, el modelo, el proveedor, el effort, la duración
esperada, la ronda y el gate posterior; te copia el prompt listo; y al terminar te obliga a tildar
la checklist antes de habilitar `DONE`. Lo que registres ahí va a `telemetry.json`.

**Lo que no hace, y es a propósito:** no lanza agentes, no encadena fases y no decide si un paquete
cumple. Esa última parte es tuya.

**Sobre cronometrar.** El argumento a favor de `dispatch.mjs` era que medía la duración con reloj de
pared, y `durationMin` estaba en `null` en todos los records. Eso ya no depende del runner: el campo
«minutos medidos» de la consola lo escribe igual. Si lo dejás vacío queda `null`, que es lo correcto
—`not-run`—, porque la consola no estima.

---

## 1. Cuatro superficies, un trabajo cada una

| Superficie | Para qué | Cuándo |
|---|---|---|
| **Terminal** (scripts) | saber en qué estado estás y qué sigue | antes y después de cada fase |
| **OpenCode** | que un modelo haga el trabajo | una sesión nueva por fase |
| **Vos** | gate humano, cambio de estado, commit, **generar imágenes** | en los puntos marcados |
| **Claude Code** | auditar y diagnosticar mientras dure | cada vez menos |

La regla que las ordena: **los scripts no deciden nada y los modelos no cambian de estado.** Sólo vos
movés un ticket a `DONE`.

---

## 2. El loop de un paquete

```
  ┌─ terminal ──────────────────────────────────────────────┐
  │  node automation/scripts/route.mjs automation/tasks --queue
  │  node automation/scripts/audit-control-plane.mjs
  └──────────────────────────────┬──────────────────────────┘
                                 │  ¿qué sigue y está sano?
  ┌─ opencode, SESIÓN 1 ─────────▼──────────────────────────┐
  │  /arc-plan ARC1-008            agente director-plan
  └──────────────────────────────┬──────────────────────────┘
                                 │  leés el plan, aprobás
  ┌─ opencode, SESIÓN 2 ─────────▼──────────────────────────┐
  │  /arc-build ARC1-008-A         agente builder
  └──────────────────────────────┬──────────────────────────┘
  ┌─ terminal ───────────────────▼──────────────────────────┐
  │  node automation/scripts/audit-control-plane.mjs
  │  npm run build && npm test
  └──────────────────────────────┬──────────────────────────┘
                                 │  ¿lo declarado existe?
  ┌─ opencode, SESIÓN 3 ─────────▼──────────────────────────┐
  │  /arc-review ARC1-008-A        agente reviewer
  └──────────────────────────────┬──────────────────────────┘
                                 │  gate humano si hay algo visible
  ┌─ opencode, SESIÓN 4 ─────────▼──────────────────────────┐
  │  /arc-close ARC1-008           sólo con todos los gates
  └──────────────────────────────┬──────────────────────────┘
  ┌─ vos ────────────────────────▼──────────────────────────┐
  │  git commit                    lo aprobás vos, siempre
  └─────────────────────────────────────────────────────────┘
```

**Sesión nueva** significa literalmente: salís de OpenCode y volvés a entrar. `opencode` a secas abre
sesión nueva; `opencode run -c` continúa la anterior — que es justo lo que no querés. La frontera de
sesión de `PACKETS.md` es lo que impide que el reviewer herede los supuestos del builder.

---

## 3. Qué escribir, literalmente

### Empezar el día

```bash
node automation/scripts/route.mjs automation/tasks --queue
```

```bash
node automation/scripts/audit-control-plane.mjs
```

Si la auditoría tira `FAIL`, eso se arregla antes de abrir nada. Un control plane inconsistente hace
que el planner trabaje sobre un estado falso.

### Planificar

```bash
opencode
```

Y adentro del TUI:

```text
/arc-plan ARC1-008
```

Corre con `director-plan` → `opencode-go/glm-5.2`, read-only. No puede editar aunque quiera: su
frontmatter tiene `edit: deny`.

### Construir

Salís, volvés a entrar, y:

```text
/arc-build ARC1-008-A
```

Corre con `builder` → `opencode-go/deepseek-v4-flash`. Te va a pedir permiso para cada edición y para
cada comando que no esté en su allowlist. **No le des permiso general.**

### Verificar antes de creerle

```bash
node automation/scripts/audit-control-plane.mjs && npm run build && npm test
```

Este paso existe por `OI-006`: dos fichas declararon `DONE` con evidencia inexistente. El builder
puede afirmar lo que quiera; esto lo contrasta contra el disco.

### Revisar

Sesión nueva:

```text
/arc-review ARC1-008-A
```

Corre con `reviewer` → `opencode-go/glm-5.2`, distinto del builder. Si querés el paquete acotado en
vez de que lea todo el repo:

```bash
node automation/scripts/review-packet.mjs ARC1-008-A --out automation/runs/review-ARC1-008-A.md
```

### Cerrar

```text
/arc-close ARC1-008
```

Y después el commit, que proponés vos:

```bash
git add -A && git commit -m "ARC1-008 <descripcion> [glm-5.2/flash] [build ✓] [tests ✓] [manifests ✓]"
```

---

## 4. Antes del primer ticket real: tres smokes

Ninguna de las rutas nuevas tiene evidencia. `MODEL_ROUTING.md` es explícito: *disponibilidad no
demuestra calidad*. Los tres están escritos y validados en `automation/tasks/queue/`.

| | Qué prueba | Por qué importa |
|---|---|---|
| **TASK-002** | glm-5.2 y deepseek-v4-flash como planner, builder y reviewer | es la línea base que nunca tomaste: `durationMin` es `null` en los ocho records |
| **TASK-003** | si `opencode-go/gpt-5.6-luna` **lee** imágenes | de eso depende si `img2threejs` tiene pipeline después de Claude |
| **TASK-001** | si Codex genera imágenes en tu cuenta | bloqueado hasta el 8/8; está en `waiting-provider/` |

Empezá por **TASK-003**. Es el que puede obligarte a cambiar de plan, y querés enterarte con Claude
todavía disponible para diagnosticar.

```bash
node automation/scripts/route.mjs automation/tasks/queue/TASK-003.json
```

---

## 5. Reglas que no se rompen

**Una sesión nueva por fase.** Sin excepción. Es la única defensa contra que el reviewer valide su
propio trabajo.

**El reviewer nunca usa el modelo del builder.** Hoy: builder `deepseek-v4-flash`, reviewer
`glm-5.2`. Si cambiás uno, revisá el otro.

**En Go el modelo es la tasa de quemado.** El límite es en dólares equivalentes, no en requests:
`deepseek-v4-flash` rinde ~31.650 requests por ventana de 5 h y `kimi-k3` unos 110. El volumen va a
flash. Los caros se reservan para lo que flash falla de verdad, medido, no sospechado.

**`Use balance` desactivado.** Si no, Go cae a tu saldo Zen al agotar el límite y el gasto deja de
ser previsible.

**La cuota de ChatGPT es para imágenes.** Es el único pool con `imagegen`. Cualquier otra cosa que Go
pueda hacer, la hace Go. Y ojo con el prefijo: `opencode-go/gpt-5.6-luna` no cuesta cuota de ChatGPT,
`openai/gpt-5.6-luna` sí — mismo modelo, factura distinta.

**Generar arte 2D es un paso tuyo.** Ningún modelo de OpenCode tiene `imagegen`. El pipeline de arte
se parte en tres: spec (agente barato) → **generación (vos, a mano)** → integración (agente barato).
Sólo el del medio depende de Codex.

**Claude no construye.** Cada ticket que construye Claude es un ticket que no prueba el pipeline que
sí va a quedar. Usalo para auditar, para diagnosticar por qué un modelo de Go falló, y para
decisiones de canon que queden escritas.

---

## 6. Qué está verificado y qué no

Verificado hoy contra esta máquina:

- `opencode models` devuelve 18 modelos `opencode-go/*`. Las siete rutas de `routing.json` existen.
- Los tres agentes de `.opencode/agents/` apuntan a modelos reales.
- Los scripts corren y la auditoría encuentra hallazgos reales.
- `npm run build`, `npm test`, `3d:validate-manifests`, `git diff --check`: PASS.

**No verificado** — no lo declares como funcionando hasta que lo corras:

- Ninguna de las siete rutas tiene smoke. `smokeStatus: not-run` en las siete.
- `vision` en Luna vía Go: es TASK-003.
- `imagegen` en Codex: es TASK-001.
- `opencode run --command arc-plan ARC1-008` para correr los comandos sin TUI: no probado. El camino
  seguro es el TUI.
- `browser`: Playwright se perdió cuando `git worktree remove --force` dañó `node_modules` en
  ARC1-007. Las capturas siguen `not-run` hasta reinstalarlo.

---

## 7. `CP-022` y las desviaciones históricas

**`CP-022` ya está escrita** en `DECISIONS.md` y `MODEL_ROUTING.md` ya no se contradice con los
agentes. Falta un solo paso, y es del cierre de ARC1-008: agregar `MODEL_ROUTING.md` a
`director/write` en `ownership.json`, porque la v11 no se lo asigna a nadie.

Las seis desviaciones de `ARC1-004` a `ARC1-006` —build y review con el mismo modelo— pasaron de
`FAIL` a `warn` vía `automation/known-deviations.json`. **No se ocultaron:** siguen imprimiéndose con
su motivo y con la decisión que las cierra. Lo que cambió es que ya no tapan un hallazgo nuevo.

Ese archivo tiene una regla que conviene respetar: **sólo se acepta una desviación que el Director ya
declaró por escrito**, y el `scope` es una lista cerrada de paquetes concretos, nunca un glob. Un
ejecutor que agregue su propio paquete ahí para silenciar un `FAIL` está haciendo exactamente lo
contrario de para lo que existe.

## 8. La pregunta que aparece siempre

**Ningún script de `automation/` ejecuta nada.** Ni `route.mjs`, ni `--queue`, ni la auditoría.
Imprimen texto y terminan. No abren sesiones, no llaman modelos, no gastan cuota.

Nada en este sistema corre N tareas solo. Cada modelo lo abrís vos, en una sesión que abrís vos, y
cada estado lo cambiás vos. Eso no es una limitación pendiente de resolver: es el diseño. Un
despachador automático borraría la frontera de sesión de `PACKETS.md`, que es justo lo que impide que
un modelo revise su propio trabajo.
