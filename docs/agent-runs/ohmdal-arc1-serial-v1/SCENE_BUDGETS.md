# Presupuesto por escena del slice — congelado

**Estado:** CONGELADO en `ARC1-006`, 2026-08-02
**Base:** `b49b617`
**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial, más el overworld de `ARC1-010`
**Cambiarlo:** requiere decisión `CP-0NN` propia. Un ticket de escena **no** puede ampliar su
presupuesto para que su resultado pase.

---

## 1. Para qué existe

`H3_CONTRACT.md` §5 fija el **techo global** de runtime —draw calls, triángulos, DPR, luces con
sombra— y remite explícitamente: *«El presupuesto por escena (JS, texturas, audio, memoria, draw
calls y tiempo) lo fija `ARC1-006`»*. `SCENE_INVENTORY.md` §6 repite la remisión desde el otro lado:
congeló qué escenas hay y cuánto dura cada beat, y dejó fuera el presupuesto técnico.

Un techo global no sirve para cerrar una escena. Dice cuándo el slice completo está roto; no dice si
`ARC1-016` puede gastar lo que quiere gastar en el Taller. Este documento reparte ese techo sobre las
**cinco escenas de `SCENE_INVENTORY.md` §2** y sobre el overworld, y fija la reserva que ninguna
escena puede tocar.

Fija seis dimensiones y nada más: **JS, texturas, audio, memoria, draw calls y tiempo de carga.**

---

## 2. Dos clases de presupuesto, y confundirlas invierte el signo

Las seis dimensiones no se comportan igual, y tratarlas por igual es el error que este documento
existe para evitar.

| Clase | Dimensiones | Cómo se suman | Por qué |
|---|---|---|---|
| **Por frame** | draw calls, triángulos, memoria residente | **no se suman**: son techos independientes | sólo una escena se dibuja a la vez |
| **Por descarga** | JS, texturas, audio, tiempo de carga | **se suman**: son una partición | todo el slice se descarga una vez |

Consecuencia práctica: que E3 tenga 120 draw calls y E4 tenga 110 **no** significa que el slice
gaste 230. Significa que ninguna de las dos puede pasar de su número cuando está en pantalla. En
cambio, que E3 tenga 1,00 MiB de textura y E4 0,75 MiB **sí** significa que entre las dos ocupan
1,75 MiB del techo de descarga.

### Regla de imputación

**Cada byte se imputa una sola vez, a la dimensión de su origen.** Hoy `vite` inlinea los dos atlas
SVG como `data:` URI dentro del chunk de JS —6.617 B, el 1,25 % del bundle, cero requests—. Esos
bytes se imputan a **textura**, no a JS. El presupuesto de JS se mide como *chunk menos data URIs*,
que es lo que hace `evidence/ARC1-006/js-budget.json`.

### Convención de bytes

El árbol de trabajo está en CRLF y los manifests registraron los tamaños en LF. La diferencia es
exactamente el número de líneas del archivo, verificada en los cuatro sidecars del slice. **Todo peso
de asset de este documento se declara en bytes LF**, y la discrepancia contra lo que sirve un HTTP
real —0,7 % en los atlas actuales— queda en `OI-004`.

Unidades: **`kB` = 1.000 B**, que es como los reporta `vite`, y **`MiB` = 1.048.576 B**. Se usan `kB`
para JS y `MiB` para assets porque así vienen de sus herramientas de medición respectivas; mezclarlas
en una misma suma es error de lectura, no del documento.

---

## 3. Lo medido: dónde está el slice hoy

Todo lo de esta sección es medición sobre `b49b617`, no estimación. Método y salidas completas en
`evidence/ARC1-006/js-budget.json` y `evidence/ARC1-006/runtime-budget.json`.

### 3.1 JS

Build de producción aislado del harness, 18 módulos, un solo chunk:

| Parte | Raw | gzip | % del raw |
|---|---:|---:|---:|
| `three` tras tree-shaking | 487.112 B | 122.069 B | 92,2 % |
| Código propio del slice | 34.474 B | — | 6,5 % |
| Atlas inlineados como data URI | 6.617 B | — | 1,3 % |
| **Total del chunk** | **528.540 B** | **135.900 B** | 100 % |

**Nueve de cada diez bytes de JS del slice son `three`.** El código propio de doce módulos son 34 kB
sin comprimir: menos que el `topdownRuntime` que el repositorio ya sirve. Optimizar el código del
slice no mueve la aguja; lo que la mueve es qué subsistemas de `three` se importan.

Cinco módulos de contenido educativo existen y **todavía no entran al bundle** porque `main.ts` no
los importa: `cards.ts` (23.432 B), `bitacoraModel.ts`, `instrumentModel.ts`, `circuitModel.ts` y
`types.ts`, 35.706 B de fuente en total. Entran con `ARC1-018`, `ARC1-019`, `ARC1-021` y `ARC1-022`.

### 3.2 Draw calls y triángulos por escena

480 muestras sobre el recorrido automático completo, una por cada 50 ms simulados, en ambos
viewports. Fronteras de escena por `x`, derivadas de `ROUTE_ANCHORS` y de `SCENE_INVENTORY.md` §2.

| Escena | Calls mobile (mediana / pico) | Calls desktop (mediana / pico) | Triángulos mobile (pico) | Triángulos desktop (pico) |
|---|---:|---:|---:|---:|
| E1 · Portal y Plaza | 12 / 15 | 16 / 19 | 358 | 400 |
| E2 · Activación de Ohm | 15 / 15 | 19 / 19 | 358 | 400 |
| E3 · Taller de Lumen | 18 / 19 | 17 / 19 | 424 | 424 |
| E4 · Puerta de Ohm | 18 / 20 | 17 / 22 | 448 | 508 |
| E5 · Manantial | 17 / 18 | 16 / 17 | 282 | 270 |
| **Recorrido completo** | **16 / 20** | **17 / 22** | **448** | **508** |

El pico del slice son **22 draw calls y 508 triángulos**, ambos en E4. Contra el techo global de
`H3_CONTRACT.md` §5 eso es el 8,8 % de los draw calls de desktop y el **0,07 %** de los triángulos.

**El blockout no gasta triángulos.** Gasta cero coma cero siete por ciento. Todo el presupuesto de
geometría de este documento es prospectivo: describe lo que `ARC1-024`, `ARC1-013`, `ARC1-014` y
`ARC1-017` todavía no pusieron.

### 3.3 Memoria

Protocolo: recarga → un frame → heap base → recorrido completo → heap final.

| Perfil | Heap base | Heap tras el recorrido | Crecimiento | Geometrías | Texturas |
|---|---:|---:|---:|---:|---:|
| desktop 1440×900 | 8.752.610 B | 10.265.142 B | 1.512.532 B | 20 → 28 | 2 → 3 |
| mobile 390×844 | 13.735.198 B | 14.312.434 B | 577.236 B | 19 → 28 | 2 → 3 |

Textura en GPU: atlas del estudiante 960×256 = 983.040 B RGBA, atlas de Ohm 288×256 = 294.912 B
RGBA, sin mipmaps y con filtro `Nearest`. Total 1.277.952 B, más **un** shadow map de 1024².

Luces: 1 hemisférica, 1 direccional con sombra, 2 puntuales sin sombra. **Un solo emisor de sombra**,
en ambos perfiles. Cumple `H3_CONTRACT.md` §5, y en mobile está ya en el tope de su rango 0–1.

> El heap de mobile mide **más** que el de desktop, no menos. No se interpreta acá: son dos
> mediciones de la misma página con DPR distinto y recolección no determinista. Se declara porque es
> lo medido.

### 3.4 Tiempo de carga

Build de producción aislado servido como estático, sin compresión y sin latencia:

| Marca | Valor |
|---|---:|
| `responseEnd` del documento | 13,1 ms |
| `domInteractive` | 30,3 ms |
| `loadEventEnd` | 100,4 ms |
| Requests totales | 2 |
| Bytes transferidos | 534.702 B |

**Dos requests para arrancar todo el slice**: el documento y el chunk. Los atlas no generan request
porque viajan inlineados.

### 3.5 Audio

**Cero.** No existe un solo archivo de audio en `assets/**`. La columna de audio de §4.4 es la única
del documento que no tiene ninguna medición debajo: es asignación pura hacia `ARC1-025`.

---

## 4. Lo fijado: el presupuesto

**Esto no es una medición. Es un contrato de producción, falsable escena por escena.**

### 4.1 Reserva — la parte que ninguna escena puede gastar

| Dimensión | Techo global (`H3_CONTRACT.md` §5) | Reserva mínima | Máximo asignable a una escena |
|---|---:|---:|---:|
| Draw calls mobile | < 150 | 20 % = 30 | **120** |
| Draw calls desktop | < 250 | 20 % = 50 | **200** |
| Triángulos mobile | ≤ 300.000 | 30 % = 90.000 | **210.000** |
| Triángulos desktop | ≤ 700.000 | 30 % = 210.000 | **490.000** |

La reserva no es holgura de cortesía: es lo que `ARC1-024` (materiales, DOF, agua, VFX), `ARC1-028`
(calidad adaptativa) y las cuatro regiones posteriores van a necesitar sobre una escena **ya
cerrada**. Una escena que cierra usando su reserva cierra en falso.

### 4.2 Draw calls y triángulos por escena

Techos independientes. No se suman.

| Línea | Calls mobile | Calls desktop | Triángulos mobile | Triángulos desktop |
|---|---:|---:|---:|---:|
| E1 · Portal y Plaza | 85 | 145 | 150.000 | 350.000 |
| E2 · Activación de Ohm | 90 | 150 | 155.000 | 360.000 |
| E3 · Taller de Lumen | **120** | **200** | **210.000** | **490.000** |
| E4 · Puerta de Ohm | 110 | 185 | 195.000 | 455.000 |
| E5 · Manantial | 105 | 175 | 185.000 | 430.000 |
| Overworld (`ARC1-010`) | 60 | 100 | 80.000 | 200.000 |

E3 recibe el máximo asignable de §4.1, exactamente. Es coherente con `SCENE_INVENTORY.md` §4.3, que
le da el 44 % del tiempo mínimo del slice y la llama la escena más cara: es la única donde la
doctrina pedagógica completa corre por primera vez, con tres actores, instrumento y siete pasos de
diagnóstico en el mismo encuadre.

**Consumo actual contra este presupuesto**, en draw calls mobile: E1 17,6 %, E2 16,7 %, E3 15,8 %,
E4 18,2 %, E5 17,1 %. El blockout ocupa alrededor de un sexto de lo que tiene asignado.

### 4.3 Memoria

| Dimensión | Mobile | Desktop |
|---|---:|---:|
| Heap JS residente, por escena | ≤ 48 MiB | ≤ 96 MiB |
| Crecimiento por recorrido completo | ≤ 4 MiB | ≤ 4 MiB |
| Crecimiento por ciclo `mount`→`destroy` | ≤ 512 kB | ≤ 512 kB |
| Textura residente en GPU, por escena | ≤ 24 MiB | ≤ 48 MiB |
| Luces con sombra | 1 | 1 |
| Resolución del shadow map | ≤ 1024² | ≤ 2048² |

El límite de 512 kB por ciclo `mount`→`destroy` es el gate de fugas de **`ARC1-008`**. Hoy no está
medido: `ARC1-008` es quien lo mide por primera vez.

### 4.4 Descarga — JS, texturas y audio

Partición. Estas líneas **sí** se suman.

| Línea | Texturas | Audio | JS propio (raw) |
|---|---:|---:|---:|
| E1 · Portal y Plaza | 0,80 MiB | 0,45 MiB | 12 kB |
| E2 · Activación de Ohm | 0,25 MiB | 0,15 MiB | 18 kB |
| E3 · Taller de Lumen | 1,00 MiB | 0,55 MiB | 60 kB |
| E4 · Puerta de Ohm | 0,75 MiB | 0,45 MiB | 28 kB |
| E5 · Manantial | 0,70 MiB | 0,50 MiB | 22 kB |
| Overworld (`ARC1-010`) | 0,35 MiB | 0,25 MiB | 15 kB |
| Transversal — actores, HUD, Bitácora, UI | 0,15 MiB | 0,65 MiB | 45 kB |
| **Total** | **4,00 MiB** | **3,00 MiB** | **200 kB** |

Y sobre el JS, que no se reparte por escena porque es un solo chunk:

| Parte del JS | Hoy (raw) | Presupuesto (raw) | Holgura |
|---|---:|---:|---:|
| `three` | 487.112 B | ≤ 560 kB | 13,0 % |
| Código propio del slice | 34.474 B | ≤ 200 kB | 82,8 % |
| **Total del chunk** | **528.540 B** | **≤ 760 kB** | **30,5 %** |

760 kB raw son aproximadamente **195 kB gzip** con el ratio medido hoy (3,89). Queda por debajo de
los dos chunks más pesados que el repositorio ya sirve: `tiles16` (385,64 kB gzip) y `school3d`
(209,05 kB gzip).

El presupuesto de `three` admite un 13 % de crecimiento y nada más. Eso alcanza para uno o dos
subsistemas —un loader, un pase de post-proceso—, no para tres. **Importar un subsistema nuevo de
`three` se declara en el ticket que lo importa**, con la cifra antes y después.

### 4.5 Techo de descarga y proyección del Arco I

| Concepto | Valor |
|---|---:|
| JS | 0,20 MiB |
| Texturas | 4,00 MiB |
| Audio | 3,00 MiB |
| **Asignado** | **7,20 MiB** |
| Reserva —HTML, CSS, service worker, fuentes | 0,80 MiB |
| **Techo de descarga del slice** | **8,00 MiB** |

Proyección obligada: el slice es **una** región de las cinco del Arco I. A este presupuesto, el arco
completo pesa ≈ **35 MiB** de descarga. Ése es el número que `ARC1-027` tiene que sostener como PWA
instalable offline y que `ARC1-035` tiene que sostener como coste. Si 35 MiB no es viable, se corrige
**acá**, mientras el slice todavía es barato de rehacer, no en `ARC1-059`.

### 4.6 Tiempo de carga

| Marca | Presupuesto |
|---|---:|
| Primer frame jugable, red local | ≤ 1 s |
| Primer frame jugable, 4G de referencia, desktop | ≤ 3 s |
| Primer frame jugable, 4G de referencia, mobile | ≤ 6 s |
| Transición entre escenas del slice | ≤ 400 ms, **sin pantalla de carga** |
| Overworld → Cuenca (`ARC1-010`) | ≤ 2 s, con transición explícita |

**4G de referencia:** 4 Mbit/s efectivos y 100 ms de RTT —el perfil «Fast 4G» de Chrome DevTools—.
Se declara acá para que dos tickets no midan contra perfiles distintos.

Los 8 MiB del techo no entran en 6 segundos a 4 Mbit/s: entran en ≈ 17. Por eso el arranque es de
**dos fases**. La primera espera exactamente dos cosas: el **JS** (0,20 MiB) y la **textura de E1**
(0,80 MiB). Un mega en total, ≈ 2,1 s de transferencia a 4 Mbit/s más el RTT. Todo lo demás —el audio
de E1 incluido— se descarga detrás del primer frame jugable.

Una implementación que bloquee el primer frame hasta tener las cinco escenas incumple este
presupuesto aunque el total esté dentro del techo. Y al revés: si la textura de E1 se pasa de
0,80 MiB, lo que se rompe no es el techo de descarga sino el tiempo de arranque.

Las cinco escenas comparten un mapa continuo y un solo mapa de nivel: entre E1 y E5 **no hay pantalla
de carga**, sólo cambio de anclaje de cámara. Introducir una es un cambio de diseño, no una
optimización, y necesita su `CP-0NN`.

---

## 5. El overworld de `ARC1-010` tiene línea propia

`SCENE_INVENTORY.md` §4.4 dejó su **duración** sin asignar y prohibió tomarla prestada de otro beat.
Quedaba abierto si además tenía presupuesto técnico propio o si se financiaba desde alguna escena.

**Decisión: línea propia, en §4.2 y §4.4, fuera de las cinco escenas.** Un overworld que se financie
desde E1 empuja a recortar la escena que `GOLDEN_FRAMES.md` GF-02 usa para juzgar el atlas de cuatro
direcciones, y ése es exactamente el intercambio que no se quiere hacer.

Su presupuesto es el más chico de la tabla y es deliberado: doc. 10 lo limita a demostrar viaje,
landmark y transición. **Su duración sigue sin asignar** —eso es `SCENE_INVENTORY.md`, no este
documento— y darle una exige `CP-0NN` propia.

---

## 6. Cómo se usa

1. **Cada ticket de escena cierra midiendo, no estimando.** La evidencia mínima es un barrido de
   `renderer.info` sobre los anclajes de su escena, en 1440×900 y 390×844, con el protocolo de
   `evidence/ARC1-006/runtime-budget.json`. Un ticket sin esa medición no cierra.
2. **El presupuesto es techo, no objetivo.** Gastar menos no es un defecto y no habilita a otra
   escena a gastar la diferencia: las líneas por frame no son transferibles.
3. **Pasarse no se arregla en otro ticket.** O la escena se optimiza dentro de su ronda, o se abre
   `CP-0NN` para mover la línea. Tomar prestado de la reserva de §4.1 no es una opción.
4. **Ningún ticket declara fps.** `CP-014` lo prohíbe hasta `ARC1-060`, y el coste de CPU por frame
   forzado que registra `runtime-budget.json` —0,264 ms— **no es frame time**: no incluye espera de
   GPU ni presentación, y `requestAnimationFrame` estaba throttled.
5. **Este documento no autoriza producir assets.** El orden de `ASSET_PIPELINE.md` sigue vigente:
   función, derechos, escala, blockout, aprobación humana de forma, y recién después material y
   textura. Tener presupuesto no es tener permiso.
6. **`ARC1-035` cierra contra §4.5.** El coste real por minuto jugable se compara con estas cifras,
   no con otras nuevas.

---

## 7. Lo que este documento deliberadamente NO aprueba

- **fps y frame time.** `not-run` hasta `ARC1-028` y `ARC1-060` (`CP-014`).
- **TTI real sobre 4G o Android físico.** Lo medido en §3.4 es localhost sin compresión ni latencia.
- **La duración jugada.** Es `SCENE_INVENTORY.md` §4.3 y se falsea en `ARC1-030`.
- **El coste por minuto.** Es `ARC1-035`.
- **La producción de cualquier asset.** Es `ASSET_PIPELINE.md` más el ticket que corresponda.
- **La escala del blockout.** Si `ARC1-011` la cambia, §3.2 se vuelve a medir; los techos de §4 no se
  mueven por eso.
- **El HUD mobile de `CP-012`.** Sigue siendo deuda de `ARC1-026` y no se corrige oportunistamente.

---

## 8. Trazabilidad

| Dato | Origen |
|---|---|
| techo global de draw calls, triángulos, DPR y luces | `H3_CONTRACT.md` §5 |
| las cinco escenas y sus fronteras por `x` | `SCENE_INVENTORY.md` §2, `levelData.ts:106-117` |
| E3 como escena más cara | `SCENE_INVENTORY.md` §3 y §4.3 |
| overworld sin duración asignada | `SCENE_INVENTORY.md` §4.4 |
| peso del chunk, de `three` y por módulo | `evidence/ARC1-006/js-budget.json` |
| data URI inlineados, 6.617 B y 1,25 % del bundle | `evidence/ARC1-006/js-budget.json` §`inlinedTextures` |
| módulos educativos todavía fuera del bundle | `evidence/ARC1-006/js-budget.json` §`notBundledYet` |
| draw calls y triángulos por escena, 480 muestras | `evidence/ARC1-006/runtime-budget.json` §`perScene` |
| heap, geometrías, texturas y crecimiento | `evidence/ARC1-006/runtime-budget.json` §`memory` |
| una sola luz con sombra, 1024² | `blockoutLighting.ts:35,39,42,50,53,57,60` |
| memoria RGBA de los atlas | manifests `ohmdal-hd2d-preprod-student-4.json` y `-ohm-sprite.json` |
| marcas de carga y bytes transferidos | `evidence/ARC1-006/runtime-budget.json` §`load` |
| ausencia total de audio | `evidence/ARC1-006/runtime-budget.json` §`assetsOnDisk` |
| chunks de referencia del repositorio | salida de `npm run build` sobre `b49b617` |
| gate de fugas de `ARC1-008` | este documento §4.3 |

Todo §3 es medición. Todo §4 es contrato declarado. Ninguna cifra de §4 se presenta como medición.
