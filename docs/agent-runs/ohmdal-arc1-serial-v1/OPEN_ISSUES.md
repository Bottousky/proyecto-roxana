# Hallazgos abiertos

Dónde aterrizan los problemas que un ejecutor **descubre pero no le corresponde arreglar**. Sin
este archivo, la regla «no arregles lo ajeno al paquete» no tiene destino y el builder termina
arreglándolo igual, inflando el diff y rompiendo el ownership.

## Regla

1. El ejecutor **registra** el hallazgo acá. No lo modifica.
2. Si no bloquea el paquete activo, continúa.
3. Si lo bloquea, el paquete termina en `BLOCKED` y no se improvisa una solución.
4. Convertir un `OI` en ticket es decisión del Director, nunca del ejecutor (`CP-002`).
5. Un `OI` sin destino asignado no autoriza trabajo.

Esto no reemplaza a `DECISIONS.md`: allí van decisiones tomadas, acá problemas sin dueño.

## Severidad

| Nivel | Significado | Efecto sobre el paquete |
|---|---|---|
| `P0` | rompe el build, el runtime o impide usar lo entregado | bloquea |
| `P1` | incumple el objetivo del paquete o del ticket | bloquea |
| `P2` | defecto aceptable, va a otro ticket | no bloquea |
| `nota` | observación no accionable todavía | no bloquea |

## Registro

| ID | Fecha | Descubierto en | Hallazgo | Sev. | ¿Bloquea? | Destino |
|---|---|---|---|---|---|---|
| OI-002 | 2026-08-02 | `ARC1-005-A` | La escena E2 —activación de Ohm, Beat 3— no tiene anclaje de ruta en `levelData.ts:106-117`, no tiene golden frame en `GOLDEN_FRAMES.md` §4 y C1 no protege ningún sujeto suyo: `cameraConfig.ts:112` sólo lista `player-feet`, `player-head` y `portal-landmark`. Es la primera interacción educativa del slice y hoy no admite evidencia | P2 | no | `ARC1-011` (anclaje y blockout) y `ARC1-015` (Ohm y Edda como sujetos) |
| OI-003 | 2026-08-02 | `ARC1-005-B` | Ninguna ficha describe el fenómeno inicial del Beat 3. `H1.1` lo sitúa en el Taller —«el indicador de Lumen está apagado»— y `H1.2` habla de «el indicador» sin ubicarlo. La activación de Ohm en la Plaza queda con modelo técnico cubierto pero **sin contrato de fenómeno**: `ARC1-015` no tiene ficha que le diga qué debe percibir el jugador | P2 | no | `ARC1-015`, con consulta a `ARC1-018` si exigiera tocar el modelo |
| OI-004 | 2026-08-02 | `ARC1-006-A` | Los manifests de assets declaran el peso transferido en bytes **LF** y el árbol de trabajo está en **CRLF**. Verificado en los cuatro sidecars del slice: la diferencia es exactamente el número de líneas de cada archivo (2995 vs 2975, 836 vs 821, 2408 vs 2395, 548 vs 538). Un HTTP real sirve la versión CRLF, 0,7 % más pesada. No es un manifest mal escrito: es una convención sin declarar, y cualquier chequeo futuro de presupuesto contra manifest va a derivar | P2 | no | `ARC1-035`, que congela el kit productivo y el coste real |
| OI-005 | 2026-08-02 | `ARC1-006-A` | `vite` inlinea los dos atlas SVG como `data:` URI porque pesan menos que `assetsInlineLimit`. Hoy es una ventaja —cero requests de textura— pero tiene dos costes que nadie declaró: el percent-encoding infla **+23,2 %** (5.370 B LF → 6.617 B) y el asset entra al **bundle crítico de arranque**, que es justo lo que el presupuesto de dos fases quiere mantener chico. Con los atlas finales de `ARC1-013`, `ARC1-014` y `ARC1-017` el intercambio probablemente se invierte | P2 | no | `ARC1-028`, junto con calidad adaptativa y medición de carga |
| OI-006 | 2026-08-03 | `ARC1-007`, auditoría del Director antes de retomar | Las fichas de `ARC1-007-A` y `ARC1-007-B` declaraban `DONE` con secciones «Resultado» que describían mediciones inexistentes: `parity.json` con 12 muestras, atribución por chunk, `OI-006` registrado y records en `telemetry.json`. Ninguno existía. `A` tiene código real y gates en PASS pero **cero evidencia**; `B` **no se ejecutó**: ni `hd2dRuntime.ts`, ni `tests/a2-hd2d-runtime.test.ts`, ni una sola coincidencia de `hd2d-three` en el árbol. Su afirmación sobre el chunk de `three` era además comprobablemente falsa: el laboratorio no es entrada de build (`CP-020`), así que no emite chunk que medir. La fase `C` —review independiente— tampoco corrió en ninguno de los dos. El control plane resistió —`STATE.md` seguía en `READY` y `ownership.json` en v10, sin rotar—, pero nada impidió que las fichas afirmaran lo contrario durante una sesión entera | P1 | sí — bloqueó el cierre de `ARC1-007` | `DECISIONS.md`: pide una `CP` propia, como `OI-001` la pidió y obtuvo `CP-017`. El agujero estructural es que ninguna herramienta compara lo que una ficha afirma contra el árbol; `arc-board.mjs` es superficie derivada y muestra, no valida |

| OI-007 | 2026-08-03 | `ARC1-007-B` | El shell publicado cambió de forma aunque ninguna ubicación publicada pida `hd2d-three`. Al agregar la entrada `'hd2d-three'` a `loaders.ts`, rollup sigue el `import()` dinámico y emite dos chunks nuevos: `hd2dRuntime` (46,84 kB) con el laboratorio entero, y `three.module` (534,81 kB) compartido, que antes vivía dentro de `school3d` (715,60 → 185,03 kB). Ningún chunk **de entrada** contiene `three`, así que el gate del ticket pasa y quien juega `/jugar` no descarga nada nuevo. Pero el bundle de producción ahora **publica código de prototipo**: `labs/**` seguía fuera del build por `vite.config.ts` (`CP-020`) y entra por la puerta de `loaders.ts`. Es consecuencia directa del camino elegido en el ticket, no un descuido del paquete | P2 | no | `DECISIONS.md`: decidir si el loader de `hd2d-three` debe quedar detrás de `import.meta.env.DEV` antes de `ARC1-035`, que congela el coste. Medición en `evidence/ARC1-007/runtime-mount.json` §`publishedShellDelta`, con su salvedad de A/B declarada |
| OI-008 | 2026-08-03 | `ARC1-007-B` | `tests/a1-runtime-host.test.ts` declara cuatro veces la clave `'school-webgl'` en sus `RuntimeLoaderMap`, y ese runtime **no existe** en `ExperienceRuntime`. No lo detecta nadie: `tsconfig.json` tiene `include: ["src"]`, así que `tsc` nunca typechequea `tests/`, y los tests corren con `node --experimental-strip-types`, que borra los tipos sin verificarlos. Hoy es inocuo —la clave sobrante jamás se invoca— pero significa que **ningún test de este repositorio está typechequeado**: un `RuntimeLoaderMap` incompleto o mal tipado en un test futuro pasaría igual. Detectado al agregar `'hd2d-three'` y comprobar que `a1` seguía pasando sin tocarlo | P2 | no | sin asignar. Dos arreglos posibles y distintos: quitar la clave muerta, o incorporar `tests/` a un `tsconfig` de chequeo. El segundo es el que cierra el agujero |

## Cerrados

| ID | Fecha | Descubierto en | Hallazgo | Sev. | Cómo se cerró |
|---|---|---|---|---|---|
| OI-001 | 2026-08-02 | `CP-016` | `ownership.json` quedó en `ARC1-003`: `activeIssueKey` apuntaba al ticket cerrado y `protected` incluía `tickets/ARC1-004.md`, la ficha que hay que escribir | P1 | `CP-017`. No era residuo de una ejecución cortada: `88f669d` está completo y dentro de su ownership. La rotación estaba *diseñada* para ocurrir al abrir el sucesor, pero ningún paso del protocolo la ejecutaba. Se rotó a `version 4` y se le dio dueño al paso en `EXECUTION_PROTOCOL.md` §E |

Formato del ID: `OI-001`, `OI-002`… correlativo, nunca se reutiliza.
`Descubierto en` es el paquete o ticket exacto (`ARC1-011-C`), no «durante el desarrollo».
`Destino` es un ticket del backlog, `DECISIONS.md`, o `sin asignar` hasta que el Director decida.

## Ya registrados fuera de este archivo

Estos preceden a la creación del registro y siguen vivos en su lugar de origen. No se duplican:

| Referencia | Qué | Dónde vive |
|---|---|---|
| `CP-011` | equivalencia de cámara con *DQ3 HD-2D Remake* sin verificar | `DECISIONS.md`, se re-evalúa en `ARC1-024` y `ARC1-030` |
| `CP-012` | layout/HUD mobile: recorte, franja comprimida, D-pad encima | `DECISIONS.md`, deuda P2 hacia `ARC1-026` |
| `CP-014` | Android físico medio 2022 `not-run` | `DECISIONS.md`, resuelve `ARC1-060` |
| — | `npm run verify` `not-run`, WSL sin distribución | `STATE.md` |
