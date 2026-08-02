# `ARC1-006` — trazabilidad del congelamiento

Qué se congeló, con qué número y de dónde salió cada número. Base `b49b617`, 2026-08-02.

## Condiciones del ticket, una por una

| Condición para `DONE` | Estado | Dónde se comprueba |
|---|---|---|
| `SCENE_BUDGETS.md` existe y es consistente | PASS | `SCENE_BUDGETS.md` |
| Cada cifra medida tiene método reproducible y evidencia | PASS | `commands.md`, `js-budget.json`, `runtime-budget.json` |
| Medido y contrato están distinguidos explícitamente | PASS | `SCENE_BUDGETS.md` §3 vs §4 |
| Las particiones cierran aritméticamente | PASS | 4,00 MiB / 3,00 MiB / 200 kB; ver abajo |
| Ninguna línea invade la reserva | PASS | E3 = 120/200 y 210k/490k, el máximo asignable exacto |
| El overworld de `ARC1-010` tiene resolución explícita | PASS | `SCENE_BUDGETS.md` §5 |
| Ningún ticket queda habilitado a declarar fps | PASS | §4 regla 4 y §7; `CP-014` |
| Hallazgos ajenos registrados y no corregidos | PASS | `OI-004`, `OI-005` |
| Desviación de review registrada | PASS | `telemetry.json` |
| Build, tests, manifests y `diff --check` PASS | PASS | `commands.md` |
| Diff dentro del ownership | PASS | ver abajo |
| `ownership.json` rotado a `ARC1-007` | PASS | `ownership.json` v10 |
| `ARC1-007` pasa a `READY` | PASS | `tasks.json` |

## Aritmética de las particiones

| Partición | Sumandos | Suma | Objetivo |
|---|---|---:|---:|
| Texturas | 0,80 + 0,25 + 1,00 + 0,75 + 0,70 + 0,35 + 0,15 | **4,00 MiB** | 4,00 MiB ✓ |
| Audio | 0,45 + 0,15 + 0,55 + 0,45 + 0,50 + 0,25 + 0,65 | **3,00 MiB** | 3,00 MiB ✓ |
| JS propio | 12 + 18 + 60 + 28 + 22 + 15 + 45 | **200 kB** | 200 kB ✓ |
| Descarga | 0,20 + 4,00 + 3,00 + 0,80 de reserva | **8,00 MiB** | 8,00 MiB ✓ |

Reserva contra el techo de `H3_CONTRACT.md` §5: 20 % de draw calls deja 120 mobile y 200 desktop;
30 % de triángulos deja 210.000 mobile y 490.000 desktop. **E3 recibe esos cuatro máximos exactos y
ninguna otra línea los alcanza.**

## Número por número — lo medido

| Número | Valor | Origen |
|---|---:|---|
| Chunk de producción del slice | 528.540 B | build aislado, chunk único |
| Idem, gzip | 135.900 B | reportado por `vite` |
| `three` tras tree-shaking | 487.112 B | `js-budget.json`, chunk `vendor-three` |
| Cuota de `three` sobre el raw | 92,2 % | 487.112 / 528.540 |
| Código propio del slice | 34.474 B | 41.091 − 6.617 de data URI |
| Módulos propios en el bundle | 12 | `js-budget.json` §`modules` |
| Módulo propio más pesado | 12.628 B, `main.ts` | ídem |
| Data URI inlineados | 6.617 B, 2 | conteo sobre el chunk emitido |
| Sobrecoste de percent-encoding | +23,2 % | 6.617 sobre 5.370 B LF |
| Módulos educativos fuera del bundle | 5, 35.706 B de fuente | `js-budget.json` §`notBundledYet` |
| Muestras del recorrido | 480, 23,95 s simulados | `runtime-budget.json` §`method` |
| Pico de draw calls del slice | 22, en E4 desktop | §`perScene` |
| Pico de triángulos del slice | 508, en E4 desktop | ídem |
| Cuota del techo de draw calls | 8,8 % | 22 / 250 |
| Cuota del techo de triángulos | 0,07 % | 508 / 700.000 |
| Consumo actual, draw calls mobile | 15,8 %–18,2 % | contra §4.2 de este ticket |
| Heap base / final, desktop | 8.752.610 / 10.265.142 B | §`memory` |
| Heap base / final, mobile | 13.735.198 / 14.312.434 B | ídem |
| Geometrías | 19–20 → 28 | ídem |
| Texturas | 2 → 3 | ídem |
| Atlas en GPU | 983.040 + 294.912 B RGBA | manifests `student-4` y `ohm-sprite` |
| Luces con sombra | 1 | `blockoutLighting.ts:42` |
| Shadow map | 1024² | `blockoutLighting.ts:43` |
| `loadEventEnd` | 100,4 ms | localhost, sin compresión ni latencia |
| Requests de arranque | 2 | §`load` |
| Bytes transferidos al arrancar | 534.702 B | ídem |
| CPU por frame forzado | 0,264 ms | 240 muestras; **no es fps** |
| Archivos de audio en el repositorio | 0 | `find assets` |
| Deriva LF/CRLF de los manifests | 0,7 % | 4/4 sidecars, = número de líneas |

Ningún valor de esta tabla fue estimado.

## Número por número — lo fijado

Todo lo de §4 de `SCENE_BUDGETS.md` es contrato declarado, no medición. Las tres decisiones que el
reparto obligó a tomar están en `CP-020`:

| Decisión | Resolución |
|---|---|
| ¿Las seis dimensiones se presupuestan igual? | No: por frame son techos independientes; por descarga son partición |
| ¿El overworld de `ARC1-010` tiene línea propia? | Sí, fuera de las cinco escenas; su **duración** sigue sin asignar |
| ¿Dónde se imputan los assets inlineados? | A textura. Cada byte se imputa una sola vez |

## Lo que NO se congeló, y dónde vive

| Qué | Dónde |
|---|---|
| fps y frame time | `ARC1-028`, `ARC1-060` (`CP-014`) |
| TTI real sobre 4G y Android físico | `ARC1-028`, `ARC1-060` |
| Duración jugada real | `SCENE_INVENTORY.md` §4.3, falsable en `ARC1-030` |
| Duración del overworld | sin asignar; exige `CP-0NN` propia |
| Coste por minuto jugable | `ARC1-035` |
| Gate de fugas por ciclo `mount`→`destroy` | lo fija este documento, lo **mide** `ARC1-008` |
| Producción de cualquier asset | `ASSET_PIPELINE.md` más el ticket que corresponda |
| Escala del blockout | `ARC1-011`; si cambia, se vuelve a medir §3.2 |
| HUD mobile de `CP-012` | `ARC1-026` |
| Anclaje, encuadre y fenómeno de E2 | `OI-002`, `OI-003` → `ARC1-011`, `ARC1-015` |

## Diff del ticket

```text
docs/agent-runs/ohmdal-arc1-serial-v1/SCENE_BUDGETS.md                nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/tickets/ARC1-006.md             nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-006/ARC1-006-A.md  nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-006/ARC1-006-B.md  nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-006/*             nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/OPEN_ISSUES.md                  +2 filas
docs/agent-runs/ohmdal-arc1-serial-v1/telemetry.json                  +6 records
docs/agent-runs/ohmdal-arc1-serial-v1/ownership.json                  v8 → v10
docs/agent-runs/ohmdal-arc1-serial-v1/tasks.json                      ARC1-006 DONE, ARC1-007 READY
docs/agent-runs/ohmdal-arc1-serial-v1/DECISIONS.md                    +CP-020
docs/agent-runs/ohmdal-arc1-serial-v1/STATE.md                        actualizado
```

Sin cambios en `src/**`, `assets/**`, `tests/**`, `package*.json`, `vite.config.ts`,
`docs/ohmdal-biblia/**`, `docs/agent-runs/ohmdal-hd2d-preprod-v1/**` ni
`docs/agent-runs/ohmdal-arco1/**`.

`ownership.json` salta de v8 a v10: v9 fue el contrato de trabajo de `ARC1-006` —el que abría
`SCENE_BUDGETS.md` a escritura— y v10 es la rotación de cierre a `ARC1-007`. Sólo v10 se commitea,
igual que pasó con v5 y v7.

Los builds aislados y el servidor estático de medición escribieron **fuera del repositorio**, en el
scratchpad de la sesión. `git status` no los ve.

## Desviación declarada

Las fases de los dos paquetes corrieron en la misma sesión y con la misma ruta (`claude`), contra
`PACKETS.md` §«Frontera de sesión». Mismo criterio aceptado en `CP-018` y `CP-019`. Está en
`telemetry.json`. **No hubo review independiente y no se presenta como tal.**
