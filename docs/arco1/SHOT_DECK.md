# Shot deck del slice — congelado

**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial

**Es una decisión tomada.** Las safe areas no se reescriben para que un encuadre pase.

Es la «hoja de encuadres con safe areas desktop/mobile» que doc. 15 §«Golden slice antes de
campaña» exige antes de producir arte.

---

## 1. Frontera con los golden frames — leer primero

Es la línea que más fácil se cruza sin querer:

| Documento | Fija | Ejemplo |
|---|---|---|
| `GOLDEN_FRAMES.md` | **qué** debe ser legible | «sujeto, objetivo y consecuencia coexisten» |
| **Este documento** | **dónde** va en el cuadro | «y ninguno de los tres cae fuera de la zona crítica» |
| `COLOR_SCRIPT.md` | **con qué luz** y en qué punto | «GF-07 es el primer frame de crepúsculo» |
| `IDENTITY.md` | qué es y qué no es Ohmdal | «un Manantial impecable es fallo de identidad» |

**El shot deck no puede redefinir un golden frame.** Ante contradicción gana `GOLDEN_FRAMES.md` y se
abre `CP-0NN`. Este documento agrega precisión de encuadre; no reabre qué debe leerse.

---

## 2. Safe areas — vinculantes

Una safe area es la banda **reservada a la UI**. La **zona de acción crítica** es lo que queda: el
rectángulo donde el juego pasa.

| Viewport | Banda superior | Banda inferior | Márgenes laterales | Zona crítica |
|---|---:|---:|---:|---:|
| Desktop 1440×900 | 12 % · 108 px | 18 % · 162 px | 6 % · 86 px | 70,0 % alto × 88 % ancho |
| Mobile 390×844 | 14 % · 118 px | 26 % · 219 px | 5 % · 20 px | 60,1 % alto × 90 % ancho |

Rectángulo de la zona crítica, en píxeles de viewport:

- **desktop:** x ∈ [86 ; 1354], y ∈ [108 ; 738]
- **mobile:** x ∈ [20 ; 370], y ∈ [118 ; 625]

### Conversión a metros

Con el alto visible congelado en `GOLDEN_FRAMES.md` §3, la safe area deja de ser una intención y se
vuelve una distancia:

| Anclaje | Alto visible desktop | Zona crítica desktop | Alto visible mobile | Zona crítica mobile |
|---|---:|---:|---:|---:|
| `C1_PORTAL_PLAZA` | 13,5 m | **9,45 m** | 20,0 m | **12,01 m** |
| `C2_TALLER` | 9,0 m | **6,30 m** | 14,5 m | **8,71 m** |
| `C3_DOOR_SPRING` | 12,0 m | **8,40 m** | 18,0 m | **10,81 m** |

Fracciones exactas: desktop 630/900 = 0,70000; mobile 507/844 = 0,60071.

### Las dos reglas duras

1. **La UI no entra en la zona crítica.** Un overlay que la invade es un defecto medible, no una
   cuestión de gusto.
2. **Los sujetos protegidos no salen de la zona crítica.** Son los seis que `GF-05` ya declara —
   `player-feet`, `player-head`, `lumen-head`, `ohm-head`, `taller-measure`, `taller-response`— y
   deben proyectar dentro del rectángulo en **todas** las tomas, no sólo en GF-05. Se reutiliza esa
   lista a propósito: ya es verificable contra `snapshot().occlusion.blockedIds`.

Los márgenes laterales son de **composición**, no de ocupación: existen para que un sujeto no quede
pegado al borde. Que un panel de UI viva ahí es correcto — para eso está reservado.

Esto no afloja lo que ya fija el contrato visual: **la UI táctil no cubre pies, conectores ni puntos
de medición** (`GOLDEN_FRAMES.md` GF-04). La zona crítica es una condición adicional, no un
reemplazo.

---

## 3. Conformidad medida — 2026-08-02

Medición real por DOM (`getBoundingClientRect()`) sobre `/ohmdal`. Datos completos en
[`hud-rects.json`](hud-rects.json). Consola: 0 errores, 0 warnings.

| Viewport | Franja libre real | Contrato | Veredicto |
|---|---:|---:|---|
| Desktop 1440×900 | 73,8 % · 6,64 m en C2 | 70,0 % · 6,30 m | **PASS** |
| Mobile 390×844 | 48,0 % · 6,96 m en C2 | 60,1 % · 8,71 m | **FAIL** — faltan 1,75 m |

### Los tres defectos de mobile, con número

| # | Defecto | Medida |
|---|---|---|
| 1 | `topbar` invade la zona crítica por arriba | 60 px de alto × 350 px de ancho |
| 2 | `diagnosis` invade la zona crítica por abajo | 42 px de alto × 350 px de ancho |
| 3 | el D-pad (`touch`) se solapa con el panel de estado (`hud`) | 40 × 66 px |

Los tres son exactamente lo que ya se sabía en prosa: «el panel superior recorta *Recorrido
automático*, la franja jugable queda comprimida y el D-pad pisa el estado». **Ahora tienen número.**

**Deuda abierta.** No se corrigen en este documento, que fija el contrato y no toca el HUD. Se
cierra cuando mobile pase contra la tabla de §2, medido con el mismo método.

### Qué mide y qué no

Se midió el HUD **de preproducción**, no el HUD final del slice. Sirve para poner número a la deuda
de mobile y para demostrar que el contrato es alcanzable en desktop; **no** aprueba el layout mobile
ni lo condena más allá de estos números.

---

## 4. Las ocho tomas

`x`/`z` de `src/labs/ohmdal-hd2d-preprod/architecture/levelData.ts:107-116`. Anclajes y altos
visibles de `GOLDEN_FRAMES.md` §3. Hora y estado de mecanismo de `COLOR_SCRIPT.md` §5.

### ST-01 · Llegada al Portal — GF-01

| Campo | Valor |
|---|---|
| Ruta | `R0_PORTAL_SPAWN` · x = −18 · z = 0 |
| Cámara | `C1_PORTAL_PLAZA` · 13,5 m desktop / 20,0 m mobile |
| Hora · mecanismo | tarde · apagado |
| Foco primario | el Portal como landmark dominante |
| Trayectoria de lectura | del estudiante al arco, y del arco a la dirección de avance |
| Tres planos | **fg** terreno de llegada · **jugable** estudiante · **landmark** `portal-arch` |

**Encuadre:** el estudiante entra por el borde izquierdo de la zona crítica; el Portal ocupa el
tercio superior de ella. La dirección de avance se lee por composición, sin cartel.

---

### ST-02 · Diagonal de la Plaza — GF-02

| Campo | Valor |
|---|---|
| Ruta | `R2_PLAZA_DIAGONAL` · x = −7,5 · z = −2,5 |
| Cámara | `C1_PORTAL_PLAZA` · 13,5 / 20,0 m |
| Hora · mecanismo | tarde · apagado |
| Foco primario | el estudiante en movimiento diagonal |
| Trayectoria de lectura | diagonal del recorrido, de abajo-izquierda a arriba-derecha |
| Tres planos | **fg** recortable de Plaza · **jugable** estudiante en diagonal · **landmark** Portal detrás |

**Encuadre:** el estudiante ocupa el centro de la zona crítica, con margen suficiente para que el
giro de 135° (`CANONICAL_ROUTE_ACTIONS`) se lea completo sin tocar el borde. Es el **juez del atlas
de 4 direcciones**: un encuadre que recorte el giro invalida el juicio.

---

### ST-03 · Umbral del Taller — GF-03

| Campo | Valor |
|---|---|
| Ruta | `R3_TALLER_THRESHOLD` · x = −3 · z = −2,5 |
| Cámara | transición `C1`→`C2`, 0,90 s, histéresis 0,75 m |
| Hora · mecanismo | tarde · apagado |
| Foco primario | el cambio de encuadre, sentido como intencional |
| Trayectoria de lectura | del vano del Taller hacia adentro |
| Tres planos | **fg** jamba del umbral · **jugable** estudiante cruzando · **landmark** `workshop-roof-high` |

**Encuadre:** durante los 0,90 s de transición el estudiante **no** puede salir de la zona crítica en
ningún fotograma intermedio. Es la exigencia que un encuadre estático no revela y que sólo se
verifica jugando.

---

### ST-04 · Lumen en el Taller — GF-04 · **la toma crítica**

| Campo | Valor |
|---|---|
| Ruta | `R4_LUMEN_STOP` · x = 0 · z = −2,5 |
| Cámara | `C2_TALLER` · 9,0 / 14,5 m — el encuadre **más cerrado** del slice |
| Hora · mecanismo | tarde · apagado |
| Foco primario | los tres a la vez: estudiante, Lumen, punto de medición |
| Trayectoria de lectura | estudiante → Lumen → punto de medición, en ese orden |
| Tres planos | **fg** banco de trabajo · **jugable** estudiante y Lumen · **landmark** silueta del Taller |

**Encuadre:** los tres sujetos y Ohm con sombra de contacto entran en **6,30 m** verticales en
desktop y **8,71 m** en mobile. Es el presupuesto espacial más ajustado del slice, y por eso la zona
crítica se decide acá y no más tarde, cuando ya haya arte que defender.

**No debe pasar:** que la UI táctil cubra pies, conectores o puntos de medición. Hoy en mobile el
panel `diagnosis` invade 42 px de la zona crítica por abajo — §3, defecto 2.

---

### ST-05 · Foreground y medición — GF-05

| Campo | Valor |
|---|---|
| Ruta | `R5_FOREGROUND_BYPASS` (x = 2,5 · z = 1,5) → `R6_TALLER_MEASURE` (x = 5 · z = 1) |
| Cámara | `C2_TALLER` · 9,0 / 14,5 m |
| Hora · mecanismo | tarde · apagado |
| Foco primario | el instrumento y su lectura |
| Trayectoria de lectura | del oclusor que se abre a la lectura del instrumento |
| Tres planos | **fg** oclusor que desvanece · **jugable** estudiante midiendo · **landmark** Taller |

**Encuadre:** el oclusor se desvanece **sin salto de exposición**. Los seis sujetos protegidos deben
quedar fuera de `snapshot().occlusion.blockedIds` **y** dentro de la zona crítica: son dos
condiciones distintas y ambas obligatorias.

---

### ST-06 · Aproximación a la Puerta — GF-06

| Campo | Valor |
|---|---|
| Ruta | `R7_DOOR_APPROACH` · x = 9,5 · z = 0 |
| Cámara | transición `C2`→`C3`, 1,10 s, histéresis 0,75 m |
| Hora · mecanismo | tarde · apagado — **la transición de hora empieza acá** |
| Foco primario | la Puerta como tercera silueta |
| Trayectoria de lectura | de los pilares hacia el vano |
| Tres planos | **fg** pilar más cercano · **jugable** estudiante · **landmark** `ohm-door-frame` |

**Encuadre — regresión conocida:** los pilares **no** se alinean con el estudiante. La ronda 1 de
H1/H2 falló exactamente acá; se corrigió reduciendo el componente lateral del view offset a 0,24.
Esta toma existe para que esa corrección no se pierda: el estudiante mantiene separación horizontal
visible respecto de todo pilar dentro de la zona crítica.

Acá arranca la interpolación tarde→crepúsculo del tramo x ∈ [9,5 ; 13,5] (`COLOR_SCRIPT.md` §5).
La toma sigue siendo de **tarde**.

---

### ST-07 · Medición en la Puerta — GF-07

| Campo | Valor |
|---|---|
| Ruta | `R8_DOOR_MEASURE` · x = 13,5 · z = −0,5 |
| Cámara | `C3_DOOR_SPRING` · 12,0 / 18,0 m |
| Hora · mecanismo | **crepúsculo** · apagado |
| Foco primario | la transferencia de lo aprendido en Lumen |
| Trayectoria de lectura | del conducto de cobre al punto de medición |
| Tres planos | **fg** umbral de la Puerta · **jugable** estudiante midiendo · **landmark** Puerta |

**Encuadre:** primer frame contractual de crepúsculo. La interpolación de hora **ya terminó** al
llegar a x = 13,5; si sigue corriendo, el frame no es determinista y su captura no es evidencia
(`COLOR_SCRIPT.md` §5, regla 3).

El estado eléctrico se comunica por **forma + animación + etiqueta + sonido**, nunca sólo por color
—aunque acá el conducto suba a 2,35 de intensidad, el único que gana presencia al crepúsculo.

---

### ST-08 · Borde del Manantial — GF-08

| Campo | Valor |
|---|---|
| Ruta | `R9_SPRING_EDGE` · x = 16,5 · z = 1,5 |
| Cámara | `C3_DOOR_SPRING` · 12,0 / 18,0 m |
| Hora · mecanismo | **crepúsculo** · **restaurado** |
| Foco primario | el agua pasando de detenida a flujo |
| Trayectoria de lectura | del acto del jugador a su consecuencia, sin texto |
| Tres planos | **fg** borde de piedra · **jugable** estudiante observando · **landmark** Manantial |

**Encuadre — cierre del slice.** La consecuencia se lee sin texto que la explique. Y **deben seguir
viéndose** sombras, desgaste y zonas sin servicio: restaurar no vuelve perfecto el mundo. Un
Manantial impecable es fallo de identidad, no un logro.

---

## 5. Tabla de referencia rápida

| Toma | GF | Anclaje ruta | x | Cámara | Hora | Mecanismo |
|---|---|---|---:|---|---|---|
| ST-01 | GF-01 | `R0_PORTAL_SPAWN` | −18,0 | C1 | tarde | apagado |
| ST-02 | GF-02 | `R2_PLAZA_DIAGONAL` | −7,5 | C1 | tarde | apagado |
| ST-03 | GF-03 | `R3_TALLER_THRESHOLD` | −3,0 | C1→C2 | tarde | apagado |
| ST-04 | GF-04 | `R4_LUMEN_STOP` | 0,0 | C2 | tarde | apagado |
| ST-05 | GF-05 | `R5`→`R6` | 2,5→5,0 | C2 | tarde | apagado |
| ST-06 | GF-06 | `R7_DOOR_APPROACH` | 9,5 | C2→C3 | tarde | apagado |
| ST-07 | GF-07 | `R8_DOOR_MEASURE` | 13,5 | C3 | crepúsculo | apagado |
| ST-08 | GF-08 | `R9_SPRING_EDGE` | 16,5 | C3 | crepúsculo | restaurado |

---

## 6. Lo que este documento deliberadamente NO aprueba

- **Ninguna toma está capturada.** `GOLDEN_FRAMES.md` §7 sigue vigente: sólo GF-01 tiene capturas y
  son de blockout (`8784206`). Este documento **especifica** encuadres; no los aprueba. Nunca
  inferir el resultado visual de una toma que no se miró.
- **El layout mobile.** Se mide y se declara `FAIL` en §3; corregirlo es trabajo aparte.
- **El ritmo entre tomas.** Tiempo entre focos, densidad causal y fatiga se miden jugando.
- **La equivalencia con la referencia de DQ III** — sin decidir, ver [`IDENTITY.md`](IDENTITY.md).
- **El HUD final del slice.** Lo medido es el HUD del harness de preproducción.

---

## 7. Trazabilidad

| Dato | Origen |
|---|---|
| anclajes R0…R9, `x` y `z` | `levelData.ts:107-116` |
| landmarks por zona | `levelData.ts:85-104` |
| giro de 135° en `R2` | `navigation.ts:38-47`, `CANONICAL_ROUTE_ACTIONS` |
| altos visibles C1/C2/C3 | `GOLDEN_FRAMES.md` §3 |
| duraciones 0,90 s y 1,10 s, histéresis 0,75 m | `GOLDEN_FRAMES.md` §3 y §4 |
| sujetos protegidos de oclusión | `GOLDEN_FRAMES.md` GF-05 |
| view offset lateral 0,24 | `GOLDEN_FRAMES.md` GF-06 |
| horas y estados de mecanismo | `COLOR_SCRIPT.md` §5 |
| rects del HUD, zona crítica y veredictos | [`hud-rects.json`](hud-rects.json) |

Ningún número de este documento fue estimado. El que no se pudo medir está declarado en §6.
