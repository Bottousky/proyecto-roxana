# Inventario de escenas del slice

**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial

**Es una decisión tomada.** El inventario no se redefine para que una escena pase: la unidad de
producción es la escena causal completa, y partirla al medio para entregar antes la rompe.

---

## 1. Para qué existe

`H3_CONTRACT.md` §2 declara que la unidad de producción es la **escena causal completa**. Nunca se
escribió cuáles son. Hoy conviven cuatro particiones del mismo slice y ninguna es la autoridad:

| Partición | Cuántas | Fuente |
|---|---:|---|
| Zonas de nivel | 3 | `levelData.ts:85-104` |
| Sets de producción | 3 | doc. 10 §«Tres sets, no una región completa» |
| Beats narrativos | 7 | doc. 10 §«Flujo jugable», líneas 60-107 |
| Golden frames | 8 | `GOLDEN_FRAMES.md` §4 |

Este documento fija tres cosas y nada más:

1. **qué escenas hay** y qué contiene cada una de las cuatro particiones anteriores;
2. **cuánto tiempo tiene asignado cada beat**, separando lo medido de lo fijado;
3. **cuáles de esas escenas cargan un acto causal** y cuáles no.

Lo que **no** fija: el presupuesto técnico por escena —JS, texturas, audio, memoria, draw calls y
tiempo de carga—. Eso vive en [`SCENE_BUDGETS.md`](SCENE_BUDGETS.md).

---

## 2. Las cinco escenas

La partición se **deriva**: cada escena es el tramo que comparte zona de nivel, anclaje de cámara y
acto causal. No se inventó un mapa nuevo.

| Escena | Zona `levelData` | Anclajes de ruta | Cámara | Golden frames | Beats | Hora | Acto causal |
|---|---|---|---|---|---|---|---|
| **E1 · Portal y Plaza** | `portal_plaza` | `R0` `R1` `R2` | C1 | GF-01, GF-02 | 1, 2 | tarde | — |
| **E2 · Activación de Ohm** | `portal_plaza` | **ninguno** ⚠ | C1 | **ninguno** ⚠ | 3 | tarde | el circuito se completa y Ohm despierta |
| **E3 · Taller de Lumen** | `taller` | `R3` `R4` `R5` `R6` | C2 | GF-03, GF-04, GF-05 | 4, 5 | tarde | se localiza el retorno abierto y el indicador responde |
| **E4 · Puerta de Ohm** | `puerta_manantial` | `R7` `R8` | C2→C3 | GF-06, GF-07 | 6 | tarde → crepúsculo | la Puerta abre por transferencia, no por fórmula nueva |
| **E5 · Manantial** | `puerta_manantial` | `R9` | C3 | GF-08 | 7 | crepúsculo | — (consecuencia de E4) |

Las cuatro particiones quedan cubiertas sin resto: 3 zonas → E1+E2 / E3 / E4+E5; 3 sets de doc. 10 →
las mismas tres agrupaciones; 7 beats → 2+1+2+1+1; 8 golden frames → 2+0+3+2+1.

**El único hueco es E2**, y es real: no tiene anclaje de ruta, ni golden frame, ni sujeto protegido
de cámara. Es el hueco conocido del inventario; ver §7.

### Sólo tres escenas cargan un acto causal

E1 orienta y E5 muestra consecuencia; ninguna de las dos contiene un acto del jugador que cambie el
mundo. Los actos causales del slice son **tres**: E2, E3 y E4.

Esto no es una sutileza de redacción. `H3_CONTRACT.md` §2 exige que cada escena causal recorra los
ocho pasos de la gramática de producción de doc. 15. **Esa gramática corre tres veces, no cinco.**
E1 y E5 se producen con los pasos de blockout, cámara, arte y audio, pero no tienen modelo
determinista propio ni ficha propia: E1 prepara y E5 cobra.

Un plan que agende cinco ciclos completos sobreestima el trabajo; uno que agende tres escenas y
olvide producir E1 y E5 subestima el arte.

---

## 3. Ficha por escena

### E1 · Portal y Plaza

- **Beats:** 1 (Llegada) y 2 (Edda pregunta) · **Hora:** tarde · **Mecanismo:** apagado
- **Anclajes:** `R0_PORTAL_SPAWN` (x = −18) → `R2_PLAZA_DIAGONAL` (x = −7,5; z = −2,5)
- **Recorrido medido:** 11,04 m, 5,52 s
- **Sujetos protegidos de C1:** `player-feet`, `player-head`, `portal-landmark`
  (`cameraConfig.ts:112`)
- **Fichas educativas:** ninguna, y es correcto — doc. 10 Beat 1 dice explícitamente «no hay
  exposición del currículo»
- **Juez del slice:** GF-02 decide el atlas de 4 direcciones. Si acá hay *moonwalk*, se reabre la
  decisión de 8 direcciones —y sólo entonces— (`GOLDEN_FRAMES.md` GF-02)

**Ni Edda ni Ohm son sujetos protegidos en C1.** Es coherente con el blockout —todavía no existen
como actores— y deja de serlo en cuanto se integren. Parte del hueco de E2, ver §7.

### E2 · Activación de Ohm

- **Beat:** 3 · **Hora:** tarde · **Mecanismo público:** apagado
- **Anclajes:** ninguno propio. Cae en el tramo `R2` → `R3`, 4,50 m y 2,25 s de tránsito
- **Fichas educativas:** `H1.1` (seguridad) y `H1.2` (circuito completo y continuidad)
- **Acto causal:** el estudiante identifica una interrupción visible, conecta el retorno y anticipa
  qué indicador cambia; Ohm despierta como autómata consciente, **no como premio ni propiedad**
  (doc. 10 Beat 3)

**Es la primera interacción educativa del slice y la peor equipada.** Sin anclaje, sin encuadre
contractual y sin sujeto protegido, hoy no hay forma de aprobarla por evidencia. Es el hueco de
E2; ver §7.

Que Ohm despierte acá **no** enciende el mecanismo público: el beat map de `COLOR_SCRIPT.md` §5
mantiene `apagado` hasta `R9_SPRING_EDGE`, y eso es correcto. Compañero activo y sistema restaurado
son cosas distintas.

### E3 · Taller de Lumen

- **Beats:** 4 (Lumen y el ritual) y 5 (Puzzle de Lumen) · **Hora:** tarde · **Mecanismo:** apagado
- **Anclajes:** `R3_TALLER_THRESHOLD` (x = −3) → `R6_TALLER_MEASURE` (x = 5)
- **Recorrido medido:** 10,27 m, 5,13 s
- **Sujetos protegidos de C2:** `player-feet`, `player-head`, `lumen-head`, `ohm-head`,
  `taller-measure`, `taller-response` (`cameraConfig.ts:124`)
- **Fichas educativas:** `H1.1`, `H1.2`, `H1.3` (instrumento), `H1.4` (diagnóstico), `H1.6`
  (Bitácora)
- **Escena más cara del slice:** contiene GF-04, «el frame más importante» —sujeto, objetivo y
  consecuencia en el mismo encuadre—, y el único puzzle de siete pasos de doc. 10 Beat 5

**Es la única escena donde la doctrina pedagógica completa de doc. 02 corre por primera vez**:
fenómeno, pregunta, hipótesis, intervención, medición, explicación, transferencia y comunicación.
Todo lo que E4 hace después es repetir esa estrategia bajo otros rótulos.

### E4 · Puerta de Ohm

- **Beat:** 6 · **Hora:** tarde → crepúsculo · **Mecanismo:** apagado
- **Anclajes:** `R7_DOOR_APPROACH` (x = 9,5) → `R8_DOOR_MEASURE` (x = 13,5)
- **Recorrido medido:** 8,64 m, 4,32 s
- **Sujetos protegidos de C3:** `player-feet`, `player-head`, `ohm-head`, `door-measure`,
  `spring-consequence` (`cameraConfig.ts:137`)
- **Fichas educativas:** `H1.5` (transferencia), con `H1.1` y `H1.3` vigentes sin cambios
- **Contiene la transición de hora completa:** x ∈ [9,5 ; 13,5], ligada a recorrer y no al reloj,
  y **debe terminar antes** de `R8_DOOR_MEASURE` (`COLOR_SCRIPT.md` §5)

**Regresión conocida:** la ronda 1 de H1/H2 falló acá por falta de separación entre estudiante y
pilares en C3 (`GOLDEN_FRAMES.md` GF-06). El encuadre existe para que esa corrección no se pierda.

Restricción de contenido que no puede aflojarse: **no admite un único orden de diagnóstico**. Doc. 10
Beat 6 exige al menos dos, y ninguna intervención insegura.

### E5 · Manantial

- **Beat:** 7 · **Hora:** crepúsculo · **Mecanismo:** **restaurado**
- **Anclaje:** `R9_SPRING_EDGE` (x = 16,5) · desde `R8`: 3,61 m, 1,80 s
- **Fichas educativas:** `H1.6` — la Bitácora reescribe vivencia como evidencia y formalización
- **Es el único punto del slice donde el mecanismo está restaurado**, y por eso el único donde
  se pueden demostrar los tres estados del mundo

**Restaurar no vuelve perfecto el mundo.** Siguen existiendo sombras, desgaste y zonas sin servicio;
un Manantial impecable es fallo de identidad, no un logro (`GOLDEN_FRAMES.md` GF-08,
`COLOR_SCRIPT.md` §7.6).

---

## 4. Duración — qué está medido y qué está fijado

Ésta es la sección que más fácil se lee mal. **Una sola columna es una medición.**

### 4.1 Lo medido: el piso de recorrido

Calculado sobre `b49b617` a partir de `ROUTE_ANCHORS` (`levelData.ts:106-117`) y
`ROUTE_SPEED_METERS_PER_SECOND = 2` (`navigation.ts:15`). Todo en
[`route-timing.json`](route-timing.json).

| Escena | Distancia | Caminata | % del recorrido |
|---|---:|---:|---:|
| E1 | 11,04 m | 5,52 s | 29,0 % |
| E2 | 4,50 m | 2,25 s | 11,8 % |
| E3 | 10,27 m | 5,13 s | 27,0 % |
| E4 | 8,64 m | 4,32 s | 22,7 % |
| E5 | 3,61 m | 1,80 s | 9,5 % |
| **Total** | **38,05 m** | **19,03 s** | 100 % |

Más 4,50 s de esperas guionadas en `CANONICAL_ROUTE_ACTIONS` (`navigation.ts:39-48`): 1,5 s en el
spawn, 1 s ante Lumen y 2 s en el borde del Manantial. **Piso de recorrido: 23,53 s.**

`validateNavigation()` devuelve lista vacía: los diez anclajes son navegables y los nueve segmentos
entre ellos también. Hash canónico de ruta: `be242e48`.

**Dato de ritmo que pedía GF-02:** Portal → umbral del Taller son 15,54 m y **7,77 s**.

### 4.2 La consecuencia: el mapa no produce la duración

Doc. 10 §Objetivo fija la experiencia en **25–35 minutos**. El piso de recorrido es **23,53 s**:
entre **1,1 %** y **1,6 %** del objetivo.

> Las escenas causales cargan entre **24,6 y 34,6 minutos**. El mapa aporta menos de un 2 %.

Esto es un hecho del blockout, no una crítica: el harness fue construido para probar cámara y
oclusión, no ritmo. Pero fija una obligación hacia adelante:

1. **No se agranda el mapa para «llenar» la duración.** Caminar más no es jugar más; doc. 10 §Fuera
   de alcance descarta mundo abierto explícitamente.
2. **Si cambia la escala del blockout Portal–Plaza, hay que volver a medir contra este archivo** y
   declara la nueva cifra. El piso de recorrido es una medición de `b49b617`, no una constante.
3. **El playtest mide contra §4.3, no contra §4.1.** Confirmar los 19 s de caminata no
   confirma nada.

### 4.3 Lo fijado: envolvente de duración por beat

**Esto no es una medición. Es un objetivo de diseño, falsable jugando.**

Regla de reparto: el tiempo se asigna por **carga de aprendizaje nueva**, no por metros.

| Beat | Escena | Qué introduce | Mín | Máx |
|---|---|---|---:|---:|
| 1 · Llegada | E1 | nada; orientación y lectura del sistema apagado | 2,0 | 3,0 |
| 2 · Edda pregunta | E1 | nada; contraste de dos relatos locales | 2,0 | 3,0 |
| 3 · Activación de Ohm | E2 | primera microinteracción de circuito completo | 3,0 | 4,0 |
| 4 · Lumen y el ritual | E3 | tres piezas y un procedimiento heredado | 3,0 | 4,0 |
| 5 · Puzzle de Lumen | E3 | los siete pasos de diagnóstico, por primera vez | 8,0 | 11,0 |
| 6 · Puerta de Ohm | E4 | ninguna fórmula nueva; transferencia de la estrategia | 5,0 | 7,0 |
| 7 · Manantial | E5 | nada; consecuencia y reescritura de la Bitácora | 2,0 | 3,0 |
| **Total** | | | **25,0** | **35,0** |

Minutos. La suma coincide exactamente con el rango de doc. 10 §Objetivo: 2+2+3+3+8+5+2 = 25 y
3+3+4+4+11+7+3 = 35.

Por escena: E1 4–6, E2 3–4, E3 **11–15**, E4 5–7, E5 2–3.

E3 se lleva el 44 % del mínimo y el 43 % del máximo. Es deliberado y coherente con doc. 10, que la
llama «el puzzle principal de diagnóstico»: es la única escena donde la doctrina pedagógica completa
corre por primera vez.

### 4.4 Cómo se usa esta envolvente

- **Es techo y piso, no cronómetro.** Un jugador que resuelve el Beat 5 en 6 minutos no falla; el
  contrato falla si la **mediana** medida jugando cae fuera del rango.
- **Un beat que se desborda no se recorta con un salteo.** Se corrige la escena o se abre `CP-0NN`
  para mover la envolvente. Permitir saltear el diagnóstico contradice doc. 02 §Doctrina.
- **La Bitácora no suma tiempo aparte.** Vive dentro de los beats 3, 5, 6 y 7 y su tiempo está
  incluido en ellos.
- **El overworld mínimo está fuera de esta envolvente.** Doc. 10 lo limita a demostrar
  viaje, landmark y transición, y no le asigna beat. Su tiempo queda **sin asignar** hasta
  [`SCENE_BUDGETS.md`](SCENE_BUDGETS.md); su tiempo no se le roba a otro beat.

---

## 5. Lo que este documento obliga hacia adelante

1. **El presupuesto técnico se calcula sobre estas cinco escenas**, no sobre zonas ni sobre
   golden frames.
2. **No se produce una escena que no esté acá.** Abrir una sexta es una decisión aparte.
3. **Ningún beat cambia de escena** sin decisión propia: el mapeo beat → escena es contractual
   porque de él depende todo lo asignado en §3.
4. **El playtest reporta duración por beat**, con la mediana y la dispersión, contra §4.3. Un informe
   de duración total no cierra el gate.
5. **E2 no se produce hasta que tenga anclaje y encuadre.** Es la consecuencia práctica del hueco:
   sin ellos no hay evidencia posible, y `GOLDEN_FRAMES.md` §7 prohíbe inferir el resultado de un
   frame que no se capturó.

---

## 6. Lo que este documento deliberadamente NO aprueba

- **El ritmo real.** Se mide jugando ([`GOLDEN_FRAMES.md`](GOLDEN_FRAMES.md) §8). Todo §4.3 es objetivo.
- **La escala del blockout.** Puede cambiar; si cambia, hay que volver a medir §4.1.
- **El presupuesto técnico por escena.** Vive en [`SCENE_BUDGETS.md`](SCENE_BUDGETS.md).
- **El contenido educativo de cada beat.** Es [`CONTENT_V2.md`](CONTENT_V2.md).
- **El guion.** Las líneas de Edda, Lumen y Ohm no están escritas y este documento no las suple.
- **La duración del overworld** — sin asignar.

---

## 7. Pendiente

- **E2 · Activación de Ohm no tiene encuadre.** Es la única de las cinco escenas sin anclaje de
  ruta, sin golden frame y sin sujeto protegido. No es un olvido de forma: es el momento en que el
  circuito se completa y Ohm despierta, o sea el corazón emocional del slice, y nadie decidió
  todavía **dónde se para la cámara ni qué tiene que quedar legible** mientras ocurre.
  [`CONTENT_V2.md`](CONTENT_V2.md) §9 señala el mismo hueco desde el lado educativo: tampoco está
  escrito qué hace el jugador con las manos para que pase.
  **Mientras siga así, E2 no se produce.**
- **La duración del overworld mínimo** — sin asignar, y su tiempo no se le puede robar a otro beat.

---

## 8. Trazabilidad

| Dato | Origen |
|---|---|
| 3 zonas y sus propósitos | `levelData.ts:85-104` |
| 10 anclajes de ruta y sus x, z | `levelData.ts:106-117` |
| velocidad 2 m/s | `navigation.ts:15` |
| esperas guionadas 1,5 / 1 / 2 s | `navigation.ts:39-48` |
| sujetos protegidos por cámara | `cameraConfig.ts:112`, `:124`, `:137` |
| distancias, tiempos, hash y validación de navegación | [`route-timing.json`](route-timing.json) |
| 7 beats y sus contenidos | doc. 10 líneas 60-107 |
| objetivo 25–35 min | doc. 10 línea 8 |
| golden frames por escena y horas | `GOLDEN_FRAMES.md` §4 |
| tramo de transición x ∈ [9,5 ; 13,5] | `COLOR_SCRIPT.md` §5 |
| unidad = escena causal completa | `H3_CONTRACT.md` §2 |


Ningún número de §4.1 fue estimado. Todo §4.3 es objetivo declarado, no medición.
