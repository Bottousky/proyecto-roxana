# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1
**Ejecución autorizada:** **sí** — H3 golden slice, `CP-013`, contrato en `H3_CONTRACT.md`
**Base congelada:** `b49b617`
**Ticket activo:** `ARC1-008 — READY`
**Paquete activo:** ninguno — los define `/arc-plan ARC1-008` (`CP-016`)
**Anteriores:** `ARC1-001` … `ARC1-007`, todos `DONE`
**Siguiente:** `ARC1-009 — BLOCKED`

## Estado real

- `ARC1-001` cerrado con veredicto humano: aprobar y avanzar (`CP-010`). `CAM-FIX-001` aceptado.
- `ARC1-002` cerrado: el usuario autorizó H3 con base `b49b617` (`CP-013`).
- `ARC1-003` cerrado: canon visual congelado (`CP-015`), verificado condición por condición en
  `CP-017`.
- `ARC1-004` cerrado: color script y shot deck congelados (`CP-018`). Primer ticket con la capa de
  paquetes de `CP-016`.
- `ARC1-005` cerrado: escenas, beats, duración y fichas V2 congelados (`CP-019`).
- `ARC1-006` cerrado: presupuesto por escena congelado (`CP-020`). Dos paquetes, `ARC1-006-A`
  —medición— y `ARC1-006-B` —reparto—, ambos `DONE` en ronda 1.
- `ARC1-007` cerrado: el laboratorio se monta y se desmonta por `RuntimeHost` (`CP-021`). Primer
  ticket de esta corrida que cambió código ejecutable. Dos paquetes, ambos `DONE`.
- `ownership.json` v11 apunta a `ARC1-008`. La rotación es paso del cierre (`CP-017`), no del ticket
  siguiente.
- **`src/**` sigue globalmente protegido.** `ARC1-007` abrió nueve paths de a uno en su ficha y se
  cierran con él; `ARC1-008` tiene que abrir los suyos en su propio plan. `src/jugar/**` sigue
  prohibido de plano (`H3_CONTRACT.md` §3).
- **Lo que `ARC1-007` deja medido y `ARC1-008` no puede mover:** el recorrido determinista produce
  `db322500` en 1440×900 y `50543361` en 390×844, los mismos digests que `aeb9f70`. Si `ARC1-008`
  los ve cambiar, es una regresión de `ARC1-007`, no un artefacto de su medición.
- **Advertencia de método, `OI-006`.** Las fichas de los dos paquetes de `ARC1-007` declararon `DONE`
  el 2026-08-02 con evidencia que no existía, y `B` no tenía una sola línea implementada. El control
  plane resistió —`STATE.md` seguía en `READY` y `ownership.json` sin rotar— pero nada impidió que
  las fichas afirmaran lo contrario durante una sesión entera. Se corrigió y se ejecutó de verdad el
  2026-08-03. Ninguna ficha de esta corrida vale como evidencia por sí sola.
- H3 cubre `ARC1-003` … `ARC1-035`: golden slice Portal → Plaza → Taller → Puerta → Manantial.
- La autorización es de **alcance, no de resultado**. Cada ticket conserva sus gates, su evidencia y
  su aprobación humana cuando el cambio sea visible.
- La unidad de producción es la **escena causal completa**. Desde `CP-019` esa lista existe: son
  **cinco escenas**, de las cuales **tres** cargan un acto causal.
- Desde `CP-016` la unidad de **ejecución** es el paquete `ARC1-NNN-X` (30–90 min, una sesión
  nueva), no el ticket. Protocolo en `PACKETS.md`; hallazgos ajenos en `OPEN_ISSUES.md`; medición
  real de rutas, modelos y duraciones en `telemetry.json`.

## Canon congelado — no se redefine dentro de un ticket de escena

| Documento | Qué fija |
|---|---|
| `GOLDEN_FRAMES.md` | GF-01 … GF-08: qué debe ser legible en cada encuadre del slice |
| `IDENTITY.md` | seis materias, tiempo tarde→crepúsculo, 10 reglas verificables |
| `LEGAL_REFERENCES.md` | qué se toma de la referencia y qué no; 10 fuentes oficiales |
| `COLOR_SCRIPT.md` | con qué luz y en qué punto del recorrido: regla de intensidad, de valor, beat map y reserva del cian |
| `SHOT_DECK.md` | dónde va cada cosa en el cuadro: 8 tomas y safe areas desktop/mobile vinculantes |
| `SCENE_INVENTORY.md` | qué escenas hay, qué beat vive en cada una y cuánto dura cada beat |
| `CONTENT_V2.md` | qué se enseña, con qué ficha V2 y qué beats no llevan ficha |
| `SCENE_BUDGETS.md` | cuánto puede costar cada escena: JS, texturas, audio, memoria, draw calls y tiempo de carga |

Cada golden frame tiene contrato de **lectura** (captura) y de **recorrido** (jugando). Un frame
aprobado sólo por screenshot no está aprobado. Sólo GF-01 tiene capturas, y son de blockout.

**Orden de precedencia:** si `SHOT_DECK.md` contradice un golden frame, gana `GOLDEN_FRAMES.md`. En
general gana el documento congelado antes y se abre `CP-0NN`. `SCENE_INVENTORY.md` puede **señalar**
que el beat map de `COLOR_SCRIPT.md` no cubre un beat; no puede redefinirlo. `SCENE_BUDGETS.md` puede
**señalar** que una exigencia congelada no cabe bajo el techo de `H3_CONTRACT.md` §5; no puede bajar
la exigencia ni subir el techo.

## Las cinco escenas del slice (`CP-019`) y lo que puede gastar cada una (`CP-020`)

| Escena | Beats | Acto causal | Golden frames | Draw calls mobile/desktop | Textura + audio |
|---|---|---|---|---:|---:|
| E1 · Portal y Plaza | 1, 2 | — | GF-01, GF-02 | 85 / 145 | 0,80 + 0,45 MiB |
| E2 · Activación de Ohm | 3 | sí | **ninguno** (`OI-002`) | 90 / 150 | 0,25 + 0,15 MiB |
| E3 · Taller de Lumen | 4, 5 | sí | GF-03, GF-04, GF-05 | **120 / 200** | 1,00 + 0,55 MiB |
| E4 · Puerta de Ohm | 6 | sí | GF-06, GF-07 | 110 / 185 | 0,75 + 0,45 MiB |
| E5 · Manantial | 7 | — | GF-08 | 105 / 175 | 0,70 + 0,50 MiB |
| Overworld (`ARC1-010`) | — | — | — | 60 / 100 | 0,35 + 0,25 MiB |

**El mapa no produce la duración.** El recorrido completo son 38,05 m y 23,53 s: entre 1,1 % y 1,6 %
del objetivo de 25–35 min. Las escenas causales cargan 24,6–34,6 min. No se agranda el mapa para
llenar el tiempo.

**El blockout tampoco produce el coste.** El pico del slice son 22 draw calls y 508 triángulos: el
8,8 % del techo de llamadas y el **0,07 %** del de triángulos. Todo el presupuesto de geometría es
prospectivo.

## Consecuencias operativas del presupuesto

- Cada ticket de escena desde `ARC1-011` cierra con un barrido de `renderer.info` sobre **sus**
  anclajes, en 1440×900 y 390×844, con el protocolo de `evidence/ARC1-006/runtime-budget.json`. Sin
  esa medición no cierra.
- Draw calls, triángulos y memoria son **techos independientes**: no se suman y no son transferibles
  entre escenas. JS, texturas, audio y tiempo de carga **sí** son una partición.
- Reserva intocable: 20 % de los draw calls y 30 % de los triángulos del techo global. Una escena que
  cierra usando la reserva cierra en falso.
- `ARC1-008` hereda su gate de fugas: **≤ 512 kB por ciclo `mount`→`destroy`**. Lo mide por primera
  vez; no lo cambia.
- Techo de descarga del slice: **8 MiB**. Proyección del Arco I completo: **≈ 35 MiB**, que es lo que
  `ARC1-027` tiene que sostener como PWA offline y `ARC1-035` como coste.
- Arranque en **dos fases**: el primer frame jugable espera JS y textura de E1 —1 MiB— y nada más.

## Prohibiciones vigentes

`src/jugar/**`, migración de runtime o de save, Meshy, generación paga, producción masiva de assets,
dependencias npm nuevas, regiones fuera del slice, `push`/`reset`/`rebase`/reescritura de historia,
`docs/agent-runs/ohmdal-arco1/**` y copiar IP de Dragon Quest.

Desde `CP-020`, `vite.config.ts` queda **protegido**: `ARC1-006` descubrió que el harness del slice
no es una de sus entradas de build, y tocarlo —para agregarlo o para que una medición salga mejor—
exige `CP-0NN` propia.

## `not-run` declarados — nunca se presentan como PASS

| Qué | Estado | Se resuelve en |
|---|---|---|
| Android físico medio 2022 | `not-run` (`CP-014`) | `ARC1-060` |
| `npm run verify` | `not-run`, WSL sin distribución | sustituido por build + test + manifests + diff-check |
| Safari / PWA / offline | `not-run` | `ARC1-027` y `ARC1-060` |
| Duración jugada real | `not-run` | `ARC1-030` |
| fps y frame time | `not-run`, `rAF` throttled en el panel | `ARC1-028` y `ARC1-060` |
| TTI sobre red real y 4G | `not-run`, sólo medido en localhost sin compresión | `ARC1-028` |

Ningún ticket puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`, ni PASS de
ritmo antes de `ARC1-030`, ni fps en ningún punto antes de `ARC1-028`.

## Preguntas abiertas, no bloqueantes

- `CP-011` — equivalencia de cámara con *DQ3 HD-2D Remake*. Se re-evalúa en `ARC1-024` y `ARC1-030`.
  Si no sostiene la referencia, se abre ticket de corrección propio; no se reabre `ARC1-001`.
- `CP-012` — layout/HUD mobile. Desde `CP-018` es incumplimiento medible: mobile 390×844 **falla**
  las safe areas de `SHOT_DECK.md` §2 con 48,0 % de franja libre contra 60,1 % de contrato. Deuda P2
  hacia `ARC1-026`. **No se corrige oportunistamente.**
- `OI-002` y `OI-003` — la escena E2, activación de Ohm, no tiene anclaje de ruta, ni golden frame,
  ni sujeto protegido de cámara, ni ficha que describa su fenómeno inicial. Ambos P2, destinos
  `ARC1-011` y `ARC1-015`.
- `OI-004` — los manifests declaran bytes en LF y el árbol está en CRLF: 0,7 % de deriva, verificada
  en los cuatro sidecars. P2, destino `ARC1-035`.
- `OI-005` — los atlas SVG se inlinean como `data:` URI: cero requests, pero +23,2 % de
  percent-encoding dentro del bundle crítico de arranque. P2, destino `ARC1-028`.
- `OI-007` — **el bundle de producción ahora publica el laboratorio.** `loaders.ts` referencia
  `hd2dRuntime` por `import()`, así que rollup emite `hd2dRuntime` (46,84 kB) y `three.module`
  (534,81 kB compartido, antes dentro de `school3d`). Ningún chunk de entrada contiene `three` y
  ninguna ubicación publicada pide `hd2d-three`, así que nadie los descarga — pero `CP-020` había
  dejado `labs/**` fuera del build y entra por esta puerta. P2. Decisión pendiente: si el loader va
  detrás de `import.meta.env.DEV`. Conviene resolverlo antes de `ARC1-035`, que congela el coste.
- `OI-008` — **ningún test de este repositorio está typechequeado.** `tsconfig.json` tiene
  `include: ["src"]` y los tests corren con `--experimental-strip-types`. Por eso
  `a1-runtime-host.test.ts` puede nombrar cuatro veces un runtime `'school-webgl'` que no existe en
  `ExperienceRuntime` sin que nadie lo note. P2, sin asignar.

Convertir un `OI` en ticket es decisión del Director (`CP-002`).

## Última verificación

Sobre `aeb9f70`, 2026-08-03, al cerrar `ARC1-007`:

- `npm run build`: PASS, `✓ built in 4.97s`.
- `npm test`: PASS, exit 0, incluye `a2-hd2d-runtime` con 5 casos.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- **Paridad de comportamiento, medida contra un worktree real en `aeb9f70`:** el recorrido
  determinista de 480 muestras da `db322500` en 1440×900 y `50543361` en 390×844. Los mismos digests
  antes del traslado, después del traslado y después de montar por `RuntimeHost`. La serie completa
  es idéntica carácter por carácter: 605.701 y 605.891 chars. Detalle en `evidence/ARC1-007/parity.json`.
- La baseline reprodujo 22 draw calls y 508 triángulos de pico —las cifras que registró `ARC1-006`—,
  lo que confirma que el método de medición es el mismo y no uno más laxo.
- `desktop-1440x900.png` **pixel idéntico** a la baseline, mismo `sha256`. La diferencia de 48 B en
  mobile está demostrada como ruido de DPR 2: cada lado produce 3 hashes distintos en 4 corridas y
  ambas series comparten `0b0560b7896f17a5`.
- Ciclo `mount → destroy → mount` por el host real con `runtimeLoaders` de verdad: contenedor vacío
  tras `destroy`, `activeRuntime` `null`, segundo montaje sin excepciones. Consola con 0 errores.
- `three` **fuera de los tres chunks de entrada**. Emite dos chunks perezosos nuevos, registrados en
  `OI-007`.
- **Desviación declarada:** no hubo review técnico independiente en ninguno de los dos paquetes. El
  gate humano fue la única revisión, igual que en `ARC1-006`, `CP-018` y `CP-019`.
- **Desviación declarada:** `git worktree remove --force` siguió la junction de `node_modules` y dañó
  el `node_modules` real. Reparado con `npm ci`; `package.json` y `package-lock.json` intactos,
  verificado. Se perdió `playwright`, que era extraño al lock, y con él la posibilidad de escribir un
  PNG desde el arranque nuevo: `not-run` declarado.
- **fps no medido y no declarado**, `CP-014`. Gate de fugas de 512 kB: es de `ARC1-008`, no se
  adelantó.

## Verificación anterior

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-006`:

- `npm run build`: PASS, `✓ built in 6.91s`.
- `npm test`: PASS, `ℹ tests 4`, `ℹ pass 4`, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Peso del bundle **construido, no estimado**: `evidence/ARC1-006/js-budget.json`. 528.540 B, de los
  cuales 487.112 B —92,2 %— son `three`. Atribución por módulo vía `renderedLength` de rollup.
- Draw calls y triángulos por escena **muestreados, no estimados**:
  `evidence/ARC1-006/runtime-budget.json`. 480 muestras del recorrido completo en los dos viewports.
- Heap antes y después del recorrido, geometrías, texturas y luces con sombra: mismo archivo.
- Carga medida sobre el build de producción servido como estático: 2 requests, 534.702 B,
  `loadEventEnd` 100,4 ms —localhost, sin compresión ni latencia—.
- Aritmética de las tres particiones verificada por suma: 4,00 MiB, 3,00 MiB y 200 kB exactos.
- **Desviación declarada:** las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
  misma sesión y con la misma ruta (`claude`), contra `PACKETS.md` §«Frontera de sesión». Mismo
  criterio que `CP-018` y `CP-019`. **No hubo review independiente.**
- **fps no medido y no declarado:** `requestAnimationFrame` está throttled en el panel. Los 0,264 ms
  registrados son coste de CPU por frame forzado, **no** frame time.

## Verificación previa

Sobre `b49b617`, 2026-08-02, al cerrar `ARC1-005`:

- `npm run build`: PASS, `✓ built in 5.83s`. `npm test`: PASS, `ℹ pass 4`, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests. `git diff --check`: PASS.
- Recorrido calculado, no estimado: `evidence/ARC1-005/route-timing.json`. Hash `be242e48`,
  `validateNavigation()` sin errores.
- Fichas verificadas por ejecución: `evidence/ARC1-005/cards-audit.json`,
  `allCardsPassV2Contract: true`, 6 fichas × 30 campos.
- 88.044 órdenes de diagnóstico válidos de ≤12 acciones; mínimos 9 y 10.
