# Decisiones del control plane

| ID | Fecha | Decisión | Consecuencia |
|---|---|---|---|
| CP-001 | 2026-08-02 | Arco I usa `STRICT-SERIAL`, WIP 1 | Ningún sucesor antes de `DONE` |
| CP-002 | 2026-08-02 | Sólo el Director cambia estados | Modelos recomiendan; no promueven por sí solos |
| CP-003 | 2026-08-02 | Gate humano para cambios visibles | Reviewer auxiliar no decide calidad final |
| CP-004 | 2026-08-02 | Cámara casi ortográfica, 4 direcciones y Ohm sprite | Variantes H2 perdedoras quedan archivadas |
| CP-005 | 2026-08-02 | H3 y producción siguen sin autorización | `executionAuthorized=false`, `baseCommit=null` |
| CP-006 | 2026-08-02 | OpenCode ejecuta un ticket por ciclo | Se retiran agentes H1/H2 y se crean plan/builder/reviewer |
| CP-007 | 2026-08-02 | Routing basado en inventario local, no fama | Kimi no se configura hasta aparecer con ID real |
| CP-008 | 2026-08-02 | Assets pasan gates modulares y de procedencia | Meshy/generación paga presupuesto cero |
| CP-009 | 2026-08-02 | Esta rama consolida control y Director | No copiar archivos manualmente entre worktrees |
| CP-010 | 2026-08-02 | `ARC1-001` aprobado: la cámara corregida se acepta y el Arco I avanza | `ARC1-001` pasa a `DONE`; `ARC1-002` pasa a `READY` |
| CP-011 | 2026-08-02 | La equivalencia con *DQ3 HD-2D Remake* queda abierta, no bloqueante | Se re-evalúa en `ARC1-024` y `ARC1-030`, con materiales y luz presentes; no se reabre `ARC1-001` |
| CP-012 | 2026-08-02 | El layout/HUD mobile es deuda P2, no defecto de cámara | Se atiende en `ARC1-026`; no amplía el alcance de `ARC1-001` |
| CP-013 | 2026-08-02 | **H3 autorizado** con `baseCommit = b49b617` | `executionAuthorized = true`; `ARC1-003` pasa a `READY` |
| CP-014 | 2026-08-02 | Android físico diferido a `ARC1-060` (opción B) | Todo claim de rendimiento en Android físico es `not-run` hasta el QA de release |
| CP-015 | 2026-08-02 | Golden frames, identidad y límites legales **congelados** | Un ticket de escena no puede redefinirlos para que su resultado pase |
| CP-016 | 2026-08-02 | La unidad de ejecución pasa a ser el **paquete** `ARC1-NNN-X` | Una sesión nueva por fase; hallazgos ajenos a `OPEN_ISSUES.md`; cada fase emite telemetría |
| CP-017 | 2026-08-02 | Rotar `ownership.json` es parte del **cierre**; builder y reviewer obtienen append-only | `ARC1-003` verificado y congelado; `ARC1-004` desbloqueado; `OI-001` cerrado |
| CP-018 | 2026-08-02 | Color script y shot deck **congelados**; las safe areas son vinculantes | `CP-012` deja de ser cualitativo: mobile `FAIL` con número, destino `ARC1-026` |
| CP-019 | 2026-08-02 | Inventario de escenas y contenido V2 **congelados**: cinco escenas, tres actos causales, envolvente de duración por beat | `ARC1-006` presupuesta sobre esas cinco escenas; el mapa aporta <2 % de la duración; `OI-002` y `OI-003` abiertos |
| CP-020 | 2026-08-02 | Presupuesto por escena **congelado**: por frame son techos independientes, por descarga son partición; el overworld recibe línea propia | El Arco I completo proyecta ≈ 35 MiB de descarga; `ARC1-008` hereda el gate de fugas; `OI-004` y `OI-005` abiertos |
| CP-021 | 2026-08-03 | `ExperienceLocation.runtime` opcional: la ubicación puede nombrar qué runtime la sirve; ausente, gana el manifest | Ohmdal sostiene `topdown-phaser` y `hd2d-three` a la vez sin tocar el registro ni el juego publicado; el build gana dos chunks perezosos y abre `OI-007` |
| CP-022 | 2026-08-03 | El routing pasa a **OpenCode Go**; Claude sale del contrato y la cuota de ChatGPT se reserva para `imagegen` | Builder y reviewer son modelos distintos por configuración; generar arte 2D es paso manual del Director; ninguna ruta tiene smoke hasta `TASK-002` y `TASK-003` |
| CP-023 | 2026-08-03 | **Reconciliación de estado.** Se corrigen tres documentos que afirmaban un estado que el disco desmiente, y se le da dueño a lo que no lo tenía | `ownership.json` v12; `TASK-003` cerrada; la precedencia entre `MODEL_ROUTING.md` y `routing.json` se parte por tipo de afirmación; el auditor cubre `BACKLOG.md` y el directorio de cada tarea |

| CP-024 | 2026-08-03 | **`TASK-002` cerrada.** Las tres rutas de Go corrieron por Orca; sólo una hace lo que el routing dice | El pipeline automatizado sirve hoy para 1 de sus 3 roles, por plomería y no por calidad de modelo; se abren `OI-012`, `OI-013` y `OI-014`, los tres P1 |

| CP-025 | 2026-08-04 | **Plomería del pipeline corregida** para poder ejecutar el ciclo de `ARC1-008` sin Claude | `OI-012` y `OI-014` cerrados; `OI-013` mitigado y abierto; `reviewer.md` pasa a `mode: primary`; `director-plan` sube a 24 steps; build desatendido usa `--auto`; `.opencode/**` con dueño en `ownership.json` v13 |

| CP-026 | 2026-08-04 | **Método de medición de `ARC1-008`**: navegador embebido de Orca + sondas en la página; `RuntimeHost` gana `pause`/`resume` por delegación | Sin playwright (rechazado por el usuario en `ARC1-007`); el ciclo completo se ejercita por el host real; el gate de 512 kB se mide por primera vez |

| CP-027 | 2026-08-04 | **`ARC1-008-B` mide con el navegador embebido de Claude Code**, porque reproducir un digest exige viewport exacto y el driver de `CP-026` no lo controla | Los dos digests congelados reproducen exactos en los dos viewports; `CP-026` sigue rigiendo el paquete `A`; playwright sigue excluido; `OI-015` gana un cuarto camino y `OI-016` queda abierto |

| CP-028 | 2026-08-04 | **El Director ordena orquestar `ARC1-008` con Claude** (`sonnet` y `haiku` según la tarea). Contradice la línea «nunca builder» de `MODEL_ROUTING.md` y se aplica igual, porque la decisión de routing es del Director (`CP-002`) | `ARC1-008` cierra con la **primera fase `review` realmente ejecutada** de la corrida, pero **no independiente por modelo**: builder y reviewer fueron ambos `claude-sonnet-5` (`DEV-003`), y el chequeo que debía marcarlo falló (`OI-018`); `CP-022` no se revoca y `TASK-002` sigue siendo la línea base del pipeline sin Claude |

Una decisión nueva agrega `CP-029+`, motivo, evidencia, impacto y si requiere autorización o ADR.

## CP-028 — `ARC1-008` se orquesta con Claude por orden del Director, contra la línea del routing

**Motivo.** El Director instruyó, al retomar la rama: «continuá la orquestación de agentes, utilizá
sonnet y haiku cuando corresponda según la tarea». `MODEL_ROUTING.md` §«Pools» dice de Claude
«auditoría y diagnóstico; **nunca builder**», y `CP-022` lo había sacado del contrato. La orden es
posterior y es del Director, que es quien decide routing (`CP-002`); se aplica. Pero se **registra**,
porque un lector futuro leería «nunca builder» como canon y encontraría en `telemetry.json` un
builder Claude sin explicación.

**Evidencia.**

- `MODEL_ROUTING.md`, tabla de pools: «Claude | cuenta regresiva | auditoría y diagnóstico; **nunca
  builder**». Sigue escrito así; esta decisión no lo borra, lo acota.
- `CP-024` dejó medido que el pipeline sin Claude sirve hoy para 1 de sus 3 roles, y `CP-025` arregló
  la plomería de los otros dos sin llegar a ejercitarlos en un ticket real.
- Fases realmente ejecutadas en `ARC1-008`: el **plan** corrió con `opencode-go/glm-5.2` según
  `CP-026` —dos rondas, la primera muerta por presupuesto de steps (`automation/runs/ARC1-008/plan-session.log`)
  y la segunda completa (`plan-session-2.log`)—; el **build** del paquete `A` corrió con
  `claude-sonnet-5`; la **medición** de `A` y todo el paquete `B` los condujo el Orquestador; el
  **review** de `A` corrió con `claude-sonnet-5` en sesión y contexto separados.

**Decisiones.**

1. **`ARC1-008` se ejecuta con Claude** en build, medición y review. `CP-022` no se revoca: sigue
   siendo el plan de routing del proyecto y `TASK-002` sigue siendo su línea base.
2. **La propiedad que `CP-022` quería no se pierde del todo, pero se debilita y se dice.** Builder y
   reviewer fueron sesiones distintas, con contratos distintos y sin ver el trabajo del otro; el
   reviewer re-corrió los gates y recalculó los estimadores con su propio script en vez de creerle al
   builder. Lo que ya **no** son es proveedores distintos, que era la garantía estructural que
   `CP-022` compró. Un sesgo compartido entre builder y reviewer del mismo proveedor no lo detecta
   este arreglo.
3. **`ARC1-008` es el primer ticket de la corrida cuya fase `C` corrió de verdad.** `ARC1-004`,
   `ARC1-005`, `ARC1-006` y `ARC1-007` cerraron los cuatro declarando «no hubo review independiente»;
   acá la fase existió, produjo dos P2 y cero P0/P1, y verificó por su cuenta lo que el builder
   afirmó. **Lo que no es: independiente por modelo.** Builder y reviewer corrieron los dos con
   `claude-sonnet-5` —la condición exacta de `DEV-001`—, así que la mejora es de proceso, no
   estructural. Declarado como `DEV-003`. Peor todavía: el chequeo de `audit-control-plane.mjs` que
   debía marcarlo **pasó**, porque se queda con el último record de cada fase y el segundo `build`
   del paquete lo tapó (`OI-018`). La primera vez que este control plane tenía que atrapar una
   desviación propia, no la atrapó; la atrapó una lectura manual del script.
4. **Lo que esta decisión no resuelve:** si el pipeline sin Claude funciona de punta a punta. Sigue
   sin ejercitarse en un ticket real. Cuando el Director quiera esa evidencia, el camino es correr un
   ticket entero por las rutas de `MODEL_ROUTING.md`, no deducirlo de este.

**Impacto.** `telemetry.json` gana records con `route: claude` y `modelId: claude-sonnet-5`, que es lo
que realmente pasó. No cambia `routing.json`, ni `MODEL_ROUTING.md`, ni ningún documento congelado.
No requiere ADR.

## CP-027 — El driver de `CP-026` mide pero no controla la ventana: `ARC1-008-B` usa otro

**Motivo.** `CP-026` fijó el navegador embebido de Orca como driver de `ARC1-008`. Para el paquete `A`
alcanzó y sobró: condujo el ciclo completo por el host real, leyó el heap 17 veces y entregó la
consola. Para el paquete `B` **no alcanza**, y el motivo es del laboratorio, no del driver: `lab.ts`
deriva el perfil de `window.innerWidth <= 720` (línea 128) y la cámara y el renderer de
`window.innerWidth`/`innerHeight` (líneas 326-329). Un digest congelado en 1440×900 sólo reproduce con
la ventana en 1440×900. El CLI de Orca no tiene con qué fijarla: su sección `Browser Automation`
ofrece `set device` —dispositivos con nombre—, `screenshot`, `eval` y `goto`, y ninguna acepta ancho y
alto arbitrarios. La ventana estuvo en 1191×972 toda la medición del paquete `A`.

**Evidencia.**

- `orca --help`, sección `Browser Automation`: 40 subcomandos, ninguno de viewport.
- `OI-015`: el mismo driver tampoco captura pantalla sin la ventana al frente. Tres intentos, mismo
  error de CDP. Es la misma carencia —no controla la ventana— vista por otra cara.
- El driver elegido reprodujo **`db322500`** en 1440×900 DPR 1 y **`50543361`** en 390×844 DPR 2, dos
  corridas cada uno, con un ciclo `destroy → start` intercalado. Detalle en
  `evidence/ARC1-008/B/parity.json` y `commands.md`.

**Decisiones.**

1. **El paquete `B` se mide con el navegador embebido de Claude Code** (`resize_window` +
   `javascript_exec`). `CP-026` no se revoca: sigue rigiendo el paquete `A`, que ya cerró con él.
2. **Playwright sigue excluido.** Esta decisión no lo reabre y no instala nada.
3. **La validez del driver no se afirma, se demuestra.** Los dos valores que reproduce fueron
   congelados por otro driver, en otra sesión, dos tickets atrás; son 32 bits sobre 605.701 y 605.891
   caracteres. Un driver que midiera otra cosa no podría acertarlos. Ese es el argumento, y es
   verificable: cualquiera puede volver a correrlo.
4. **Qué driver queda como oficial para los gates visuales de `ARC1-011` en adelante no se decide
   acá.** Hoy conviven uno que mide y no captura y otro que hace las dos cosas. Elegir exige `CP`
   propia porque `CP-026` congeló la primera opción; queda anotado en `OI-015`.

**Impacto.** Ninguno sobre `src/**`, `ownership.json` ni ningún documento congelado: el paquete `B`
tiene diff vacío. `OI-016` queda abierto —`evidence/ARC1-007/parity.json` congela dos digests sin
dejar escrito el protocolo que los reproduce—. No requiere ADR.

## CP-026 — Método de medición de `ARC1-008`: Orca browser + sondas, sin playwright

**Motivo.** El plan de `ARC1-008` (fase A, 2026-08-04, `director-plan` sobre `glm-5.2`) identificó dos
bloqueos de método: la medición de fugas exige navegador con WebGL y heap real, y `playwright` —el
driver histórico— fue removido por `npm ci` en el cierre de `ARC1-007`, y **el usuario rechazó su
reinstalación** (`evidence/ARC1-007/runtime-mount.json` §`frameAtStep200`). Además `RuntimeHost` no
expone `pause`/`resume`: viven en el `RuntimeHandle`, así que el ciclo que nombra el ticket no se
puede ejercitar a través del host real sin una adición.

**Evidencia.**

- Sonda de factibilidad del Director, 2026-08-04, sobre el navegador embebido de Orca 1.4.167 y el
  servidor de desarrollo (puerto 5199): la página del laboratorio monta (`#app` con 1 hijo, 1 canvas),
  `window.render_game_to_text` y `window.advanceTime` son funciones, y `performance.memory` es legible
  (`usedJSHeapSize` 8.505.603 B al cargar). `orca eval` ejecuta JavaScript en el contexto de la página.
- `src/app/runtimeHost.ts` expone `start/travel/activeRuntime/lastSnapshot/destroy`; `pause`/`resume`
  existen sólo en el handle (`src/experiences/ohmdal/hd2dRuntime.ts`).
- El protocolo de medición de `ARC1-006` y `ARC1-007` ya era «sondas en la página + servidor de
  desarrollo»: cambia el driver (de playwright a Orca), no el método.

**Decisiones.**

1. **Driver:** navegador embebido de Orca (`orca goto/eval/console/screenshot`) contra `vite dev` en
   el puerto 5199. Playwright permanece excluido: la negativa del usuario durante `ARC1-007` sigue
   vigente; esta decisión no la reabre.
2. **`RuntimeHost` gana `pause()` y `resume()`** como delegación pura al handle activo (no-op sin
   runtime montado). Es aditivo: `tests/a1-runtime-host.test.ts` debe pasar sin tocarse. Sin esto el
   ticket no puede probar lo que su título nombra a través del host real.
3. **Sonda de control:** `src/labs/ohmdal-hd2d-preprod/main.ts` expone `window.labControl`
   (`start/pause/resume/destroy/status`) atado al host. Es la página dev del laboratorio; no es
   entrada del build de producción (`CP-020`), así que nada publicado cambia.
4. **Protocolo de fugas:** heap por `performance.memory.usedJSHeapSize` muestreado en el mismo punto
   de fase de cada ciclo (tras `destroy` + pausa fija), un ciclo de warmup, N ≥ 5 ciclos, crecimiento
   por ciclo ≤ 512 kB. Muestras crudas a `evidence/ARC1-008/A/lifecycle-leak.json`.
5. **Subdivisión:** `ARC1-008-A` — ciclo + gate de fugas; `ARC1-008-B` — paridad del recorrido
   determinista tras las sondas (título tentativo; su contrato se escribe al activarse, `PACKETS.md`).

**Impacto.** `ownership.json` v14 abre al builder dos paths de `src/**` para el paquete A:
`src/app/runtimeHost.ts` y `src/labs/ohmdal-hd2d-preprod/main.ts`. Si el navegador de Orca no pudiera
medir el heap en la página del laboratorio, el paquete termina `BLOCKED` en su primer tercio; no se
improvisa un segundo driver. No requiere ADR.

## CP-025 — Plomería del pipeline: reviewer invocable, planner con presupuesto, build desatendido con freno parcial

**Motivo.** `CP-024` dejó tres P1 sin asignar —`OI-012`, `OI-013`, `OI-014`— y `STATE.md` pide resolver
`OI-012` antes del primer review real de `ARC1-008`. El usuario autorizó orquestar el flujo serial
completo sin frenar la ejecución; sin estos arreglos las fases B y C de `ARC1-008` se rompen en
silencio. La primera corrida real de `/arc-plan` sobre CLI 1.18.13 agregó un cuarto defecto:
`director-plan` agotó su presupuesto de 12 steps explorando y murió sin emitir el plan.

**Evidencia.**

- `OI-012` reproducido en OpenCode 1.18.13: `opencode run --agent reviewer` imprime «agent "reviewer"
  is a subagent, not a primary agent. Falling back to default agent» y corre como `build` con el modelo
  default. Tras cambiar `reviewer.md` a `mode: primary`, el mismo comando corre `> reviewer · glm-5.2`
  (sesiones `OI-012-TEST` y `OI-012-VERIFY`, 2026-08-04). El contrato read-only no dependía del modo:
  vive en el bloque `permission` del agente (`edit: deny`, `bash "*": deny` con allowlist de lectura);
  el modo sólo decidía quién podía invocarlo por CLI.
- `director-plan`: `automation/runs/ARC1-008/plan-session.log` — 12 steps de exploración, cero salida
  final. `steps: 12` → `steps: 24`.
- Build desatendido: se usa `--auto` («auto-approve permissions that are not explicitly denied»),
  disponible en CLI 1.18.13. Los deny del builder —`git push*`, `external_directory`, `task`,
  `webfetch`, `websearch`— siguen vivos bajo `--auto`; con `--dangerously-skip-permissions` no.
  El contrato del agente builder no se modifica: `ask` sigue siendo su default interactivo.

**Decisiones.**

1. `OI-012` cerrado con el arreglo option-1: `reviewer.md` `mode: subagent` → `primary`. El flujo
   documentado —comando `/arc-review`, `dispatch.mjs`— ya invoca al reviewer real con su contrato.
2. `OI-014` cerrado para esta corrida: las fases de edición no interactivas se lanzan con `--auto`.
   Es el freno parcial de `FLUJO.md`: auto-aprueba lo no denegado, no elimina los deny.
3. `OI-013` sigue abierto y no bloquea `ARC1-008`: el review ocurre antes del commit del ticket, así
   que el diff del árbol de trabajo es el correcto. El Director verifica que el diff del packet
   coincida con `git status` antes de entregarlo al reviewer. El arreglo de fondo —que la ficha
   declare su commit— queda diferido.
4. `.opencode/**` deja de no tener dueño: entra en `director/write` en `ownership.json` v13.
   Corrección al estilo de `CP-023`, no rotación: ningún ticket avanza.

**Impacto.** Las fases A, B y C de `ARC1-008` pueden correr con los modelos ruteados en sesiones
nuevas. No autoriza commit sin review, no cambia presupuestos de rondas, no toca `routing.json`.
No requiere ADR.

## CP-024 — `TASK-002` cerrada: el pipeline funciona para un rol de tres

**Motivo.** `CP-022` cambió el routing a OpenCode Go sin una sola ruta con smoke, y `MODEL_ROUTING.md`
lo dejó escrito: *disponibilidad no demuestra calidad*. `TASK-002` era la línea base que nunca se tomó.
Importa ahora porque la suscripción de Claude no se renueva y los ocho records de `telemetry.json`
registran `route: claude` en el 100 % del trabajo hecho hasta acá.

**Evidencia.** `automation/runs/TASK-002/smoke.md` y `latencies.json`. Las tres rutas se lanzaron desde
Orca 1.4.167 con `orca terminal create` + `orca terminal send` → `opencode run`, y la salida se volcó a
archivo con `Tee-Object` porque en el primer intento los terminales murieron y se llevaron el error.

| Ruta | Modelo | Agente pedido | Agente real | Resultado |
|---|---|---|---|---|
| planner | `glm-5.2` | `director-plan` | `director-plan` | **PASS** |
| builder | `deepseek-v4-flash` | `builder` | `builder` | **INCOMPLETO** |
| reviewer | `glm-5.2` | `reviewer` | **`build`** | **NO VÁLIDO** |

El planner leyó `STATE.md`, `ownership.json` y `tasks.json` **sin que se le nombrara un archivo**, y
sus nueve afirmaciones se verificaron una por una contra el árbol. Cero inventadas. Leyó
`ownership.json` **v12**, incluidas las rutas que agregó `CP-023`.

**Impacto — tres defectos de plomería, ninguno de calidad de modelo.**

1. **`OI-012`, P1.** `opencode run --agent reviewer` no invoca al reviewer: `reviewer.md` declara
   `mode: subagent` y opencode cae al agente `build`, que tiene `permission "*": allow`. El reviewer
   corre **sin su contrato read-only**. `CP-022` prometió builder y reviewer distintos «por
   configuración, no por disciplina», y por esta vía no se cumple — el modelo coincide por casualidad,
   el agente no. `dispatch.mjs` genera ese comando, así que su fase `review` está rota en silencio.
2. **`OI-013`, P1.** `review-packet.mjs:91` toma el diff del árbol con fallback a `HEAD`, nunca el
   commit del paquete. Al packet de `ARC1-007-B` le embebió el diff de `CP-023`. El reviewer emitió
   tres `P0` correctos sobre datos incorrectos y un `P1` que lista literalmente los archivos de
   `CP-023`. Para todo paquete ya cerrado este script entrega el diff equivocado.
3. **`OI-014`, P1.** El builder no completa en modo no interactivo: `bash: "*": ask` sin TTY que
   apruebe se auto-rechaza, y la corrida termina sin conclusión. `deepseek-v4-flash` leyó bien el diff,
   `parity.json` y el test, y se quedó sin emitir el análisis.

**Lo que esta decisión NO hace.** No cambia `routing.json`: la propia tarea lo prohíbe —«el smoke
informa, la ruta la decide el Director»—. No promueve ninguna ruta ni la degrada: `glm-5.2` como
planner es la única con evidencia local a favor, y de `deepseek-v4-flash` no se puede concluir nada
hasta resolver `OI-014`. No mide coste por ruta: los 0,27 USD de `opencode stats` son acumulados de
nueve sesiones y no son atribuibles. No mueve ningún ticket.

**Lo que conviene resolver antes del primer `review` real de `ARC1-008`:** `OI-012` y `OI-013`. Sin
ellos, la fase `C` de `EXECUTION_PROTOCOL.md` produce un veredicto que no vale, y lo produce sin
fallar — que es la peor forma de romperse.

No requiere ADR.

## CP-023 — Reconciliación de estado

**Motivo.** Una auditoría de dirección del 2026-08-03, pedida por el Director antes de montar ORCA,
encontró que tres documentos del control plane afirmaban un estado que el árbol desmiente. No son
erratas: los tres son la misma patología que `OI-006` —lo declarado no coincide con el disco—, pero
una capa más arriba, y en dos casos dentro de la capa que existe precisamente para detectarla.

| Dónde | Afirmaba | Era |
|---|---|---|
| `BACKLOG.md` | «Ejecución: no autorizada», «Ticket activo: `ARC1-001` — `HUMAN_REVIEW`» | `executionAuthorized: true` desde `CP-013`; activo `ARC1-008` |
| `MODEL_ROUTING.md` | «Ninguna de estas rutas tiene smoke», `reviewer-visual` = `mimo-v2.5-pro` | `TASK-003` cerró `vision` y bajó la revisión visual a `mimo-v2.5-free`, coste cero |
| `automation/tasks/queue/TASK-003.json` | `state: QUEUE` | corrió en tres passes, `PASS`, evidencia en `automation/runs/TASK-003/smoke.md` |

**Lo que hace grave a la segunda.** `MODEL_ROUTING.md` se declaraba ganador ante contradicción
—«manda este archivo y se corrige el otro»— sin distinguir qué tipo de afirmación estaba en juego.
La regla de precedencia le daba la razón al documento equivocado: un builder obediente habría
re-corrido un smoke ya pagado y enrutado la revisión visual a un modelo de Go teniendo uno gratuito
verificado.

**Lo que hace cara a la tercera.** Una tarea cerrada durmiendo en `queue/` es munición cargada:
`dispatch.mjs --queue --go` la habría vuelto a despachar y gastado la ventana de 5 h de Go repitiendo
un smoke que ya estaba pago.

**Evidencia.** `node automation/scripts/audit-control-plane.mjs` pasa de 20 ok · 11 warn a 22 ok ·
7 warn · 0 fail; los cuatro warns de ownership desaparecen porque se corrigieron, no porque se
silenciaran. Los siete que quedan son `DEV-001` y `DEV-002`, desviaciones históricas ya declaradas
por el Director, y deben seguir imprimiéndose. `validate-task.mjs` pasa a 5 checks en `TASK-003` con
0 fail. Los dos checks nuevos se probaron **en negativo**: revertir el ticket activo de `BACKLOG.md`
produce `FAIL`, y una tarea `DONE` colocada en `queue/` produce `FAIL`.

**Decisión.**

1. **La precedencia se parte por tipo de afirmación.** `MODEL_ROUTING.md` manda sobre el *criterio*
   —qué rol usa qué clase de modelo, qué se reserva para qué—; `routing.json` y `provider-health.json`
   mandan sobre el *hecho observado* —qué modelos existen, qué smoke pasó—. Una medición no se
   discute con prosa. Un hecho observado sólo entra al `.md` copiado, con fecha.
2. **`BACKLOG.md` se declara derivado** y el auditor comprueba que su ticket activo y su estado de
   autorización coincidan con `tasks.json`. Es la única defensa contra que vuelva a quedar seis
   tickets atrás, porque ningún paso del cierre lo tocaba.
3. **El directorio de una tarea es una afirmación de estado** y `validate-task.mjs` la verifica.
   `TASK-003` pasa a `DONE` en `tasks/done/`.
4. **Una Task Spec puede declarar su cierre.** El schema gana `closure` —`closedOn`, `closedBy`,
   `verdict` y `limits`—, obligatorio cuando `state` es `DONE`, simétrico de `blockedReport` y
   `waitingFor`. Hasta ahora una tarea podía cerrarse sin decir quién la cerró ni con qué veredicto.
   `closedBy` es una `CP` o el Director, nunca un ejecutor (`CP-002`).
5. **`ownership.json` v12** hace tres backfills: las fichas y evidencias de `ARC1-001` y `ARC1-002`
   pasan a `protected` —cerraron antes de que `CP-017` existiera y nunca se rotaron—; `BACKLOG.md` y
   `MODEL_ROUTING.md` reciben dueño por primera vez; y `automation/**` también.

**Lo que esta decisión NO hace.** No mueve ningún ticket: `activeIssueKey` sigue en `ARC1-008` y
`ARC1-009` sigue `BLOCKED`. No toca canon congelado, alcance ni presupuesto. No incorpora
`automation/` al flujo de la corrida: `automation/README.md` §7 sigue vigente y el veredicto de esos
scripts **no es vinculante para ningún gate** hasta que una `CP` propia lo decida. Darle dueño a un
directorio no es promoverlo a canon; sólo corrige que un builder pudiera haber editado el script que
audita builders. Y no cierra `TASK-002`, que sigue en `queue/` sin correr: es la línea base del
pipeline sin Claude y es lo único que separa al proyecto de tener evidencia local de que funciona.

**Precedente que conviene no repetir.** Ésta es la tercera vez que un contrato de ownership se
difiere «al cierre del ticket siguiente». La primera produjo `OI-001` y costó `CP-017`; la segunda
dejó `MODEL_ROUTING.md` sin dueño mientras `CP-022` lo editaba. Se corrigió acá en vez de diferirlo
otra vez.

No requiere ADR: no cambia arquitectura del producto, ni alcance, ni quién ejecuta.

## CP-022 — El routing pasa a OpenCode Go; Claude sale del contrato

**Motivo.** El Director contrató OpenCode Go el 2026-08-03 y declaró que **la suscripción de Claude
no se renueva**. Codex queda al 7 % de su límite semanal hasta el 2026-08-08. El routing vigente
apuntaba a modelos gratuitos y a Claude, y ninguna de las dos cosas describe ya el equipo real.

El problema de fondo no es el precio: los ocho records de `telemetry.json` registran `route: claude`,
`modelId: claude-opus-5` en **todas** las fases de `ARC1-004` a `ARC1-007`. El 100 % del trabajo lo
hizo el proveedor que se va, así que ninguna otra ruta tiene evidencia de funcionar.

**Evidencia.** `opencode models` del 2026-08-03 devuelve 18 modelos bajo el proveedor `opencode-go`,
7 gratuitos bajo `opencode` y 22 bajo `openai`. Inventario completo en
`automation/provider-health.json`, generado por `automation/scripts/providers.mjs`, no escrito a mano.

**Decisión.**

| Rol | Antes | Ahora |
|---|---|---|
| `director-plan` | `opencode/nemotron-3-ultra-free` | `opencode-go/glm-5.2` |
| `builder` | `opencode/north-mini-code-free` | `opencode-go/deepseek-v4-flash` |
| `reviewer` | `opencode/deepseek-v4-flash-free` | `opencode-go/glm-5.2` |
| revisión visual | `opencode/mimo-v2.5-free` | `opencode-go/mimo-v2.5-pro` |
| `img2threejs` | — | `opencode-go/gpt-5.6-luna` |

**Impacto.**

1. **Builder y reviewer son modelos distintos por configuración, no por disciplina.** La desviación
   que `ARC1-004` a `ARC1-006` declararon a mano —build y review con el mismo modelo— deja de
   depender de que alguien se acuerde.
2. **La cuota de ChatGPT queda reservada para `imagegen`.** Es la única capability que OpenCode no
   cubre con ningún modelo, tampoco `gpt-5.6-luna` ni `mimo-v2.5-pro`. Generar arte 2D vuelve a ser
   un paso manual del Director, exactamente como ya decía `ASSET_PIPELINE.md`; lo que cambia es que
   ahora está escrito en el routing en vez de sobreentendido.
3. **Cuidado con el prefijo.** `opencode-go/gpt-5.6-luna` no consume cuota de ChatGPT;
   `openai/gpt-5.6-luna` sí. Mismo modelo, factura distinta.
4. **En Go el modelo elegido es la tasa de quemado**: el límite es en dólares equivalentes, no en
   requests. El volumen va a `deepseek-v4-flash`; los caros se reservan para fallos medidos.
5. **Ninguna ruta tiene smoke al momento de esta decisión.** `TASK-002` y `TASK-003` de
   `automation/tasks/queue/` lo establecen antes del primer ticket real. `CP-007` sigue vigente:
   disponibilidad no demuestra calidad.
6. `MODEL_ROUTING.md` no tenía dueño en `ownership.json` v11. Se le asigna al Director en la
   rotación de cierre de `ARC1-008`.

No requiere ADR: no cambia arquitectura del producto, sólo quién ejecuta.

## CP-021 — El runtime lo puede nombrar la ubicación, no sólo el manifest

**Motivo.** `RuntimeHost` resolvía el runtime destino con `experienceById(destination.experienceId).runtime`:
**un runtime por experiencia**. El slice necesita **dos para Ohmdal a la vez** — el `topdown-phaser`
que hoy es el producto y el `hd2d-three` que todavía es laboratorio— y el canon pide exactamente eso:
*«cargado bajo demanda mediante `RuntimeHost` […] manteniendo Phaser como baseline»*.

**Decisión.** `ExperienceLocation` acepta `runtime?: ExperienceRuntime` opcional. Quien abre el viaje
puede nombrar qué gramática técnica debe servir esa ubicación; ausente, gana la del manifest.

**Por qué no las otras dos.** Repuntar `OHMDAL.runtime` sustituiría el juego jugable por un greybox, y
ese veredicto es de `ARC1-030`, no de este ticket. Agregar una experiencia `ohmdal-lab` metería un
mundo falso en un registro que modela los cinco lenguajes jugables, y además obligaría a editar el
assert de `tests/a0-experience-registry.test.ts` para que el cambio pasara — que es justo lo que los
gates prohíben.

**Es aditivo, no una enmienda.** Sin el campo, el comportamiento es idéntico al anterior. Verificado
por ejecución, no por lectura: `tests/a2-hd2d-runtime.test.ts` comprueba que `ohmdal` sin `runtime`
sigue montando `topdown-phaser`, y `tests/a1-runtime-host.test.ts` pasa **sin tocarse**.

**Evidencia.** `evidence/ARC1-007/runtime-mount.json`. El recorrido determinista de 480 muestras da
`db322500` en 1440×900, el mismo digest que `aeb9f70` y que `ARC1-007-A`: la cadena completa no movió
una cifra. `three` no aparece en ningún chunk de entrada del build.

**Consecuencia que no estaba prevista.** El bundle de producción gana dos chunks perezosos —
`hd2dRuntime` 46,84 kB y `three.module` 534,81 kB compartido—, porque rollup sigue el `import()` de
`loaders.ts`. Ninguna ubicación publicada pide `hd2d-three`, así que nadie los descarga, pero el
build ahora **publica código de prototipo** que `CP-020` había dejado fuera. Abierto en `OI-007`:
decidir antes de `ARC1-035` si el loader va detrás de `import.meta.env.DEV`.

**Alcance.** Extensión del contrato P1 (`docs/spec-p1-runtime-host.md`). No requiere ADR: no cambia de
motor, de save ni de arquitectura, y es reversible por ser opcional y aditivo.

## CP-020 — Presupuesto por escena congelado

**Motivo.** `H3_CONTRACT.md` §5 fija el techo global de runtime y remite explícitamente el reparto a
`ARC1-006`; `SCENE_INVENTORY.md` §6 remite desde el otro lado. Un techo global dice cuándo el slice
entero está roto, pero no dice si `ARC1-016` puede gastar lo que quiere gastar en el Taller. Sin
reparto, cada ticket de escena negocia su propio límite contra un número que sólo se viola al final,
cuando ya hay cinco escenas construidas y ninguna es la culpable.

**Evidencia.** `SCENE_BUDGETS.md`, `evidence/ARC1-006/js-budget.json` y
`evidence/ARC1-006/runtime-budget.json`. Todo medido, no citado:

- el chunk de producción del slice son **528.540 B**, de los cuales **487.112 B —el 92,2 %— son
  `three`**; el código propio de doce módulos son 34.474 B;
- 480 muestras del recorrido completo en ambos viewports: el pico del slice son **22 draw calls** y
  **508 triángulos**, ambos en E4;
- eso es el **8,8 %** del techo de draw calls de desktop y el **0,07 %** del de triángulos;
- heap 8,75 → 10,27 MB en desktop y 13,74 → 14,31 MB en mobile sobre el recorrido completo;
- **una** luz con sombra y un shadow map de 1024², en ambos perfiles;
- arranque en **dos requests** y 534.702 B, con `loadEventEnd` de 100,4 ms sobre localhost;
- **cero** archivos de audio en el repositorio.

**Impacto.**

1. `SCENE_BUDGETS.md` pasa a canon congelado; enmendarlo requiere `CP-0NN` propia. El canon congelado
   son ahora **ocho** documentos.
2. **Las seis dimensiones no se presupuestan igual.** Draw calls, triángulos y memoria son techos
   **independientes** por escena, porque sólo una escena se dibuja a la vez. JS, texturas, audio y
   tiempo de carga son una **partición**. Tratarlas por igual invierte el signo del cálculo.
3. Se aparta una **reserva** que ninguna escena puede gastar: 20 % de los draw calls y 30 % de los
   triángulos del techo global. E3 recibe el máximo asignable exacto —120/200 llamadas,
   210.000/490.000 triángulos— y ninguna otra escena lo alcanza. Es coherente con
   `SCENE_INVENTORY.md`, que ya la declaró la escena más cara.
4. **El overworld mínimo de `ARC1-010` recibe línea propia**, fuera de las cinco escenas.
   Financiarlo desde E1 empujaría a recortar la escena con la que `GOLDEN_FRAMES.md` GF-02 juzga el
   atlas de cuatro direcciones. Su **duración** sigue sin asignar: eso es `SCENE_INVENTORY.md` §4.4 y
   darle una exige `CP-0NN` propia.
5. **Cada byte se imputa una sola vez.** Los dos atlas que `vite` inlinea como `data:` URI —6.617 B,
   el 1,25 % del bundle— se imputan a textura, no a JS.
6. El arranque es de **dos fases**: el primer frame jugable espera JS y textura de E1, un mega en
   total; todo lo demás se descarga detrás. Una implementación que bloquee el primer frame hasta
   tener las cinco escenas incumple el presupuesto aunque el total esté dentro del techo.
7. **`ARC1-008` hereda un número:** el gate de fugas es ≤ 512 kB por ciclo `mount`→`destroy`. Este
   documento lo fija; `ARC1-008` lo mide por primera vez.
8. **Proyección obligada:** a este presupuesto, el Arco I completo pesa **≈ 35 MiB** de descarga. Ése
   es el número que `ARC1-027` tiene que sostener como PWA instalable offline y `ARC1-035` como
   coste. Si no es viable, se corrige ahora, mientras el slice todavía es barato de rehacer.
9. Se abren `OI-004` —los manifests declaran bytes en LF y el árbol está en CRLF— y `OI-005` —los
   atlas inlineados ahorran requests pero entran al bundle crítico con 23,2 % de sobrecoste—. Ambos
   P2. **No se corrigen acá.**

**Lo que esta decisión no hace.** No declara fps ni frame time: `CP-014` lo prohíbe hasta `ARC1-060`,
y el coste de CPU por frame forzado que se midió —0,264 ms— **no es frame time**. No mide TTI real
sobre 4G ni Android físico. No fija duración jugada, que es `SCENE_INVENTORY.md` §4.3. No fija coste
por minuto, que es `ARC1-035`. Y no autoriza producir un solo asset: tener presupuesto no es tener
permiso, y el orden de `ASSET_PIPELINE.md` sigue vigente.

**Desviación declarada.** Las fases de ambos paquetes corrieron en la misma sesión y con la misma
ruta, contra `PACKETS.md` §«Frontera de sesión». Mismo criterio que `CP-018` y `CP-019`, registrado
en `telemetry.json`. **No hubo review independiente.**

## CP-019 — Escenas, beats, duración y fichas V2 congelados

**Motivo.** `H3_CONTRACT.md` §2 declara que la unidad de producción es la escena causal completa,
pero nunca se escribió la lista. Convivían cuatro particiones del mismo slice —3 zonas de nivel,
3 sets de doc. 10, 7 beats y 8 golden frames— y ninguna era la autoridad. Sin reconciliarlas,
`ARC1-006` no puede presupuestar «por escena» y `ARC1-030` no tiene contra qué medir ritmo.

En paralelo, `ACCEPTANCE_GATES.md` §Educación exige ficha V2 antes de producir interacción final,
pero las fichas vivían sólo en `src/**` y en el run de preproducción: ningún documento del control
plane las declaraba canon ni decía qué beats quedan sin ficha y por qué.

**Evidencia.** `SCENE_INVENTORY.md`, `CONTENT_V2.md`, `evidence/ARC1-005/route-timing.json` y
`evidence/ARC1-005/cards-audit.json`. Todo calculado, no citado:

- recorrido completo **38,05 m**, **19,03 s** de caminata más 4,50 s de esperas guionadas;
- las cuatro particiones se reconcilian sin resto en **cinco escenas**, de las cuales sólo **tres**
  cargan un acto causal;
- las **seis** fichas verifican 30/30 campos, orden canónico, identificador `-v2` y `V2 CANON-EDU`
  por ejecución sobre `cards.ts`;
- el solver de la Puerta es **idéntico** al de Lumen, verificado por igualdad, no prometido;
- **88.044** órdenes de diagnóstico válidos de ≤12 acciones: 9 acciones el mínimo por continuidad,
  10 por tensión.

**Impacto.**

1. `SCENE_INVENTORY.md` y `CONTENT_V2.md` pasan a canon congelado; enmendarlos requiere `CP-0NN`
   propia. El canon congelado son ahora **siete** documentos.
2. `ARC1-006` presupuesta sobre las cinco escenas, no sobre zonas ni golden frames, y debe decidir
   si el overworld mínimo de `ARC1-010` recibe línea propia: hoy no tiene duración asignada.
3. **El mapa no produce la duración.** El piso de recorrido es 23,53 s, entre 1,1 % y 1,6 % del
   objetivo de 25–35 min. Las escenas causales cargan 24,6–34,6 min. No se agranda el mapa para
   llenar el tiempo: doc. 10 descarta mundo abierto explícitamente.
4. La envolvente de duración por beat es **objetivo de diseño, no medición**, y `ARC1-030` la
   reporta por beat con mediana y dispersión. Un informe de duración total no cierra el gate.
5. `ARC1-018`, `ARC1-019`, `ARC1-021` y `ARC1-022` implementan las seis fichas y **no** las
   reinterpretan. Una discrepancia es P1 del ticket, no una corrección de la ficha.
6. Se abren `OI-002` y `OI-003`, ambos P2 y ambos sobre la escena E2 —activación de Ohm—: sin
   anclaje, sin golden frame, sin sujeto protegido de cámara y sin ficha que describa su fenómeno
   inicial. Destinos `ARC1-011` y `ARC1-015`. **No se corrigen acá**, y convertirlos en ticket es
   decisión del Director (`CP-002`).

**Lo que esta decisión no hace.** No repite la auditoría independiente V2: la hereda del run de
preproducción y lo declara (`CONTENT_V2.md` §3.2). No promueve nada a V3 —eso exige playtest,
`ARC1-030`— ni fija el presupuesto técnico por escena.

**Desviación declarada.** Las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
misma sesión y con la misma ruta, contra `PACKETS.md` §«Frontera de sesión». Mismo criterio que
`CP-018`, registrado en `telemetry.json`. **No hubo review independiente.**

## CP-018 — Color script y shot deck congelados; safe areas vinculantes

**Motivo.** El harness ya implementaba dos horas —`afternoon` y `twilight`— con valores concretos,
pero ninguna regla escrita explicaba qué comunican ni dónde cambia una por la otra. Sin eso,
`ARC1-024` habría tenido que decidir el lenguaje de color y la composición *dentro* de un ticket de
escena, y cualquier resultado habría sido defendible a posteriori — exactamente lo que `CP-015`
prohíbe.

Faltaba además la «hoja de encuadres con safe areas desktop/mobile» que doc. 15 §«Golden slice antes
de campaña» exige antes de producir arte.

**Evidencia.** El cálculo determinista sobre los valores reales del harness **confirmó** el patrón
que la Biblia declaraba en prosa, y aportó dos reglas que no estaban escritas:

- luz natural −29,8 % (principal) y −28,7 % (fill), oficio 0,0 %, y **la única que sube es la
  motivada por el sistema**: conducto de la Puerta **+51,6 %**;
- **el vidrio no cede valor** al crepúsculo (+0,6 % contra ≈ −31 % del resto) y el agua cede la mitad
  que la piedra: la infraestructura se lee *más*, no menos;
- el rango de luma entre familias **se ensancha** 0,267 → 0,291: el crepúsculo no comprime el
  contraste, y ahora no puede hacerlo;
- un solo color del slice supera el umbral de saturación 0,60 reservado al estado eléctrico, y es el
  correcto (`0x63dce8`, S = 0,743).

Medición del HUD por DOM sobre `/labs/ohmdal-hd2d-preprod/`, 0 errores y 0 warnings en consola:
desktop 1440×900 **PASS** (franja libre 73,8 % contra 70 % de contrato); mobile 390×844 **FAIL**
(48,0 % contra 60,1 %, faltan 1,75 m en C2).

Detalle en `evidence/ARC1-004/palette.json`, `hud-rects.json` y `freeze.md`.

**Impacto.** `COLOR_SCRIPT.md` y `SHOT_DECK.md` pasan a canon congelado, al mismo nivel que
`GOLDEN_FRAMES.md`, `IDENTITY.md` y `LEGAL_REFERENCES.md`: un ticket de escena no puede redefinirlos
para que su resultado pase. Ante contradicción entre el shot deck y un golden frame, **gana el
golden frame**.

`ARC1-024` reemplazará los valores de blockout por arte final, pero seguirá obligado por la regla de
intensidad, la de valor, el beat map y la reserva del cian, y deberá volver a medir contra
`palette.json`.

**`CP-012` queda reclasificado.** Deja de ser una observación cualitativa y pasa a ser
incumplimiento medible de `SHOT_DECK.md` §2, con tres defectos numerados: `topbar` invade 60 px,
`diagnosis` 42 px, y el D-pad se solapa con el panel de estado en 40 × 66 px. Sigue siendo P2 y sigue
resolviéndose en `ARC1-026`, que ahora tiene criterio de cierre en vez de un juicio de gusto. No se
corrigió acá: el HUD está fuera del ownership de un ticket de canon.

No cambia el backlog, el alcance autorizado por `CP-013` ni el canon de `ARC1-003`. No requiere ADR.

**Desviación declarada.** Las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
misma sesión y con la misma ruta (`claude`), contra `PACKETS.md` §«Frontera de sesión». El Director
lo decidió antes de empezar. Está registrado en `telemetry.json`, no simulado como review
independiente.

## CP-017 — La rotación de ownership pertenece al cierre

**Motivo.** `ownership.json` v3 seguía declarando `activeIssueKey: ARC1-003` y protegiendo
`tickets/ARC1-004.md`, justo la ficha que hay que escribir para abrir el sucesor. La causa no fue una
ejecución interrumpida: la nota del propio archivo difería el reemplazo a «cuando `ARC1-004` sea el
ticket activo», y ningún paso de `EXECUTION_PROTOCOL.md` era responsable de hacerlo. El defecto es
estructural y se habría repetido en los 58 tickets restantes.

**Evidencia.** `ARC1-003` verificado condición por condición antes de congelarlo, no por declaración:

- los nueve archivos de `88f669d` caen dentro del ownership declarado por la ficha;
- anclajes contra `evidence/ARC1-001/metrics.json` — C1 13,5/20 m, C2 9,0/14,5 m, C3 12,0/18,0 m,
  desktop y mobile, coincidencia exacta;
- histéresis 0,75 m en ambos cruces (`x = −3,0` y `x = 9,5`), `extraChanges = 0`;
- zona muerta declarada 16/10/4 % de 13,5 m = 2,16 / 1,35 / 0,54 m, idéntica a la medida;
- estado de captura declarado en `GOLDEN_FRAMES.md` §7, no inferido: sólo GF-01 tiene capturas y son
  de blockout;
- build, tests, manifests y `git diff --check` PASS;
- `ARC1-004` ya estaba `READY` en `tasks.json`.

**Impacto.** `ownership.json` pasa a v4: `activeIssueKey = ARC1-004`; los artefactos de `ARC1-003`
—`GOLDEN_FRAMES.md`, `IDENTITY.md`, `LEGAL_REFERENCES.md`, su ficha y su evidencia— pasan de
`director/write` a `protected`, coherente con `CP-015`; se libera `tickets/ARC1-004.md` y se protege
`tickets/ARC1-005.md`. `EXECUTION_PROTOCOL.md` §E incorpora la rotación como paso del cierre, con sus
cuatro movimientos explícitos.

Además, `builder` y `reviewer` reciben acceso **append-only** a `OPEN_ISSUES.md` y `telemetry.json`.
Sin eso `CP-016` no puede funcionar: el ejecutor no podría registrar un hallazgo que tiene prohibido
arreglar, ni cerrar su propia fase. Append-only es agregar una fila o un record; nunca editar ni
borrar los existentes. No amplía el acceso a código, assets ni canon.

No cambia el backlog, el canon congelado ni el alcance autorizado por `CP-013`. No requiere ADR.

## CP-016 — El paquete es la unidad de ejecución

**Motivo.** El ticket describe qué queda cerrado, no qué cabe en una sesión. Faltaba esa segunda
capa: tickets como `ARC1-011` («cerrar escala, recorrido y blockout Portal–Plaza», estimado en un
día) se estaban entregando a un ejecutor como una sola instrucción. El resultado observado son
sesiones largas sin punto de evaluación, contexto contaminado y loops abiertos.

**Evidencia.** El control plane ya tenía WIP 1, gates, ownership, rondas acotadas y estados de
cierre — pero todos definidos a nivel de ticket. `tickets/` sólo admite el ticket activo y no existía
ningún artefacto entre «ficha del ticket» y «prompt de ejecución». `evidence/ARC1-001/metrics.json`
mide la cámara, no el proceso: no había ningún registro de qué modelo ejecutó qué, cuánto tardó ni
cuántas rondas consumió, con lo cual `CP-007` («routing por inventario, no por fama») no tenía datos
locales con los que decidir.

**Impacto.** Se agregan `PACKETS.md`, `packets/`, `OPEN_ISSUES.md` y `telemetry.json`, y se cablean
en `control` de `tasks.json`. El ciclo A–D de `EXECUTION_PROTOCOL.md` pasa a ejecutarse por paquete;
E sigue siendo por ticket, igual que el commit. Presupuesto de rondas: 2 por paquete y 4 por ticket
— la nueva capa no puede usarse para multiplicar correcciones. No cambia el backlog, ni los 62
issues, ni el canon congelado por `CP-015`, ni el alcance autorizado por `CP-013`. No requiere ADR.
`ARC1-004` es el primer ticket que ejecuta con esta capa.

## CP-015 — Canon visual congelado

**Motivo.** Doc. 15 registra que en DQIII la identidad precede al efecto, y que lo que no se debe
imitar es «aprobar planta por captura estática». Congelar los contratos de lectura antes de producir
arte evita construirlo alrededor de una escala o una cámara todavía inestables.

**Evidencia.** `GOLDEN_FRAMES.md`, `IDENTITY.md`, `LEGAL_REFERENCES.md` y
`evidence/ARC1-003/freeze.md`. Los parámetros de cámara citados salen de
`evidence/ARC1-001/metrics.json`; las rutas R0…R9 de `architecture/levelData.ts:107-116`.

**Impacto.** Cada golden frame tiene **dos** contratos: uno de lectura, verificable en captura, y uno
de recorrido, verificable sólo jugando. Un frame aprobado sólo por screenshot no está aprobado.

«Identidad propia / legal» es el único criterio de la quality bar que exige **5/5**; un fallo ahí es
P0 y bloquea el ticket sin importar la calidad visual alcanzada.

Sólo GF-01 tiene capturas reales, de blockout. GF-02 … GF-08 quedan especificados y **no capturados**;
se declara en vez de simularse. Ningún ticket puede inferir el resultado visual de un frame que no
capturó.

Enmendar cualquiera de los tres documentos requiere una decisión `CP-0NN` propia.

## CP-013 — Autorización de H3

**Motivo.** El usuario autorizó explícitamente el contrato `H3_CONTRACT.md` con las cuatro respuestas
que el propio contrato exigía: base en `b49b617`, presupuesto de §5, ownership de §4 y opción B de
Android.

**Evidencia.** `H3_CONTRACT.md` §8 y `evidence/ARC1-002/authorization.md`. Precondición de doc. 15
cumplida: `ARC1-001` quedó `DONE` en `b49b617` antes de autorizar.

**Impacto.** `executionAuthorized` pasa a `true` y `baseCommit` se congela en `b49b617`. Habilita la
cadena `ARC1-003` … `ARC1-035`. **No** levanta ninguna prohibición del §3: `src/jugar/**`, migración
de runtime, Meshy, generación paga, dependencias nuevas, regiones fuera del slice y la IP de Dragon
Quest siguen prohibidos.

La autorización es de alcance, no de resultado. Cada ticket conserva sus gates, su evidencia y su
aprobación humana cuando el cambio sea visible.

## CP-014 — Android físico diferido

**Motivo.** El informe final de H1/H2 condiciona H3 a medir en Android físico antes de reclamar
30 fps. No hay dispositivo medio de 2022 en este entorno. El usuario eligió avanzar difiriendo la
medición en vez de declarar un PASS emulado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/final-report.md` líneas 20-22 y 84-85.

**Impacto.** `ARC1-028` y `ARC1-029` miden desktop y mobile **emulado** únicamente. Ningún ticket
puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`; el que lo necesite lo
declara `not-run` y continúa. Si aparece un dispositivo antes, se puede adelantar la medición sin
cambiar esta decisión.

## CP-010 — Aprobación de `ARC1-001`

**Motivo.** El Director emitió veredicto explícito: «El resize está corregido como lo esperaba […]
Avancemos y veamos cómo evoluciona Ohmdal».

**Evidencia.** `evidence/ARC1-001/commands.md`, `metrics.json` y `review.md`. Distorsión 0.0e+0 en
cinco viewports; zona muerta que corrige exactamente el excedente; un solo cambio de anclaje por
cruce con jitter de ±0.30 m absorbido por la histéresis. Build, tests, manifests y `git diff --check`
PASS sobre `73fecae`.

**Impacto.** Habilita preparar `ARC1-002`. No autoriza H3 ni ninguna implementación:
`executionAuthorized` sigue en `false` hasta que el contrato de `ARC1-002` fije base, ownership,
presupuesto y autorización humana propia.

## CP-011 — Referencia DQ3 HD-2D pendiente de verificación

**Motivo.** El Director aprueba el comportamiento medido pero no confirma que el lenguaje de cámara
iguale la referencia de calidad. Decide resolverlo por evolución antes que bloquear.

**Evidencia.** El slice es hoy un greybox sin materiales, iluminación dirigida, profundidad de campo
ni VFX; los tres elementos que definen el look HD-2D. La comparación todavía no es justa.

**Impacto.** No es P0/P1 y no reabre `CAM-FIX-001`. Se re-evalúa en `ARC1-024` y `ARC1-030`. Si ahí
la cámara no sostiene la referencia, se abre un ticket de corrección propio.

## CP-012 — Layout/HUD mobile como deuda

**Motivo.** En `mobile-390x844` el panel superior recorta «Recorrido automático», la franja jugable
queda comprimida entre el panel y la tarjeta de diagnóstico, y el D-pad pisa el panel de estado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/mobile-390x844.png`.

**Impacto.** Es chrome de DOM, no proyección: la cámara mobile amplía el alto visible en vez de
estirar. Se atiende en `ARC1-026` (baseline de accesibilidad). No requiere autorización ni ADR.
