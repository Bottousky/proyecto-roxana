# Arco II · La Marea · diseño para revisar

Propuesta del Ciclo 25 (11 oct 2026). **No aprobada, no construida.** Números de los bancos revisados a mano. Nace de las semillas de
[OFICIO-DE-LA-LUZ.md](../OFICIO-DE-LA-LUZ.md) y del umbral ya construido en [MONTE-QUIETO.md](MONTE-QUIETO.md).
Sigue la forma de [PIEDRAS-DE-FRENO.md](PIEDRAS-DE-FRENO.md) y las lecciones de
[AUDITORIA-ARCO-1.md](AUDITORIA-ARCO-1.md) y [BANCOS-UX.md](BANCOS-UX.md): una idea por banco, pocas
piezas, el primer paso pregunta y el gesto queda para la pista.

## La idea en una línea

En la Casa de Compuertas la Luz **respira**: empuja, se detiene y empuja al revés. Los del monte creen
que es «otra Luz». El jugador la ve latir en una lámpara y la dibuja con un instrumento nuevo. Después la
ordena con piedras de una sola mano, la guarda en un aljibe y la manda al valle con dos anillos que se
hablan sin tocarse. Al final, la ladera deja de tener una sola Luz.

## Premisa y lugar

**Cómo se llega.** Hoy la casa no se abre, a propósito: según `src/quiet-mount-art.js`, «has no id: it
is not a door you can open yet». En el Arco II:
- La página abierta de la Bitácora, «Una luz en el Monte Quieto» (`src/content.js`), se vuelve el
  encargo. Tala lo pregunta: «¿Qué la alimenta allá arriba?».
- El paso es el desfiladero que sale del borde oeste del Manantial (`QUIET_MOUNT.gorge`). Lo cierra una
  reja con el sello del Consejo, puesto después de los incendios que cuenta Ivara. Ivara, que en el
  Castillo aprendió a pedir evidencia, lo levanta con una condición: «Tráiganme pruebas». Vega guía por
  el canal viejo (`QUIET_MOUNT.tailrace`), el mismo que vio volver a correr.

**Quién vive ahí.**
- **Orla, la compuertera** (nueva): la última de una familia que cuidaba la represa. Vive en una
  casilla sobre el coronamiento y gira las ruedas a mano cada estación, pero nunca entró a la sala de
  máquinas, que está sellada. Su dialecto del Oficio **cuenta alientos**: no cuánto empuja la lámpara,
  sino cuántas veces respira. Es el contrapunto de «la Luz se ofende si la cuentan».
- **Tala** acompaña y hace las preguntas que abren los bancos. **Ivara** sostiene el sello y la línea;
  **Vega** y **Yesca** reciben el final.

**Qué está roto y por qué importa.** La compuerta del medio lagrimea (`quietMountState().weeping`) y la
rueda grande gira con ese hilo de agua: por eso respira lento y la lámpara late a la vista. Las
compuertas grandes están trabadas y la línea alta al valle, cortada. Mientras tanto, el valle vive de
fuentes chicas: en las Terrazas, horno y riego comparten un cable de 2,2 A (`PUZZLES.irrigation`,
`src/puzzle-model.js`). **Si la Casa vuelve, la ladera tiene dos Luces.**

**Lo que avisaba la luz.** La lámpara de la casa era un aviso. Con el embalse alto, la rueda gira rápido
y la luz se ve firme; con el embalse bajo, gira lenta y la luz respira. El juego ya lo muestra
(`lamp: 'steady' | 'flicker'`); el arco le da la razón física y Edda entiende a su abuela.

## Lo que creen los herederos (el Oficio)

| Conjuro | Quién | Qué tiene de verdad | Dónde falla | Idea errónea | Banco |
|---|---|---|---|---|---|
| «La Luz del monte es otra Luz: no se mezcla con la del valle» | Orla | Hay cosas que se portan distinto | Mismas cargas, mismo cobre: sólo cambia el sentido | La alterna es otra electricidad; las cargas bajan desde la central | 1 |
| «La Luz del monte se mide por su tope» | Compuerteras | El tope existe | 17 de tope calienta como 12 de Luz quieta | El pico es lo que vale, o «va y viene: se anula» | 2 |
| «Piedra que deja pasar, piedra sana» | Orla | La piedra cortada no sirve | Si pasa para los dos lados, perdió la mano | Continuidad es salud (eco del Manantial) | Opc. |
| «Piedra de una sola mano ordena la marea» | Madre de Orla | La piedra deja pasar en un solo sentido | Una sola tira una de cada dos respiraciones | Rectificar es convertir sin perder | 3 |
| «El aljibe se vacía antes de abrirle la tapa» | Compuerteras | **Todo** | — | (Rito correcto: guarda Luz con la rueda quieta) | 4 |
| «Los anillos se hablan sin tocarse: a cualquier Luz le contestan» | Orla | Se hablan sin tocarse | A la Luz quieta no le contestan | El transformador anda con continua | 5 |
| «La Luz que viaja lejos llega cansada: cada casa, su rueda» | Ivara | Una línea larga se queda con Luz | Mandada alta y con poca corriente, llega casi entera | Las pérdidas son fijas | 6 |

El aljibe es el primer rito que el cobre confirma entero. Ohm: «Este verso no hay que traducirlo: hay
que cumplirlo». No todo lo heredado está equivocado.

## Qué se aprende (en orden)

1. **Alterna y continua.** La Luz que respira empuja hacia un lado y después al revés. La cadena de
   bicicleta del Portal sigue valiendo, pedaleada para adelante y para atrás: las cargas no bajan del
   monte, van y vienen en el cobre. A la lámpara no le importa el sentido, como ya enseñó la Calzada
   (`isPolarized`); al molinete, sí. **Frecuencia:** cuántas veces respira por segundo.
2. **Tope y valor eficaz.** Lo que calienta cuenta el empuje al cuadrado: las dos mitades suman, no se
   anulan, y la marea pasa poco tiempo arriba. 17 de tope calienta como 12 de Luz quieta: pico ÷ 1,41,
   **sólo para esta forma**.
3. **Diodo y rectificación.** Una piedra deja pasar media marea; cuatro en rombo dan vuelta la otra mitad.
4. **Capacitor como reserva.** El aljibe se llena en cada tope y entrega entre uno y otro. Cuanto más
   grande, o cuanto menos se le pide, menos baja. Se llena hasta el tope, no hasta el eficaz. Guarda Luz
   con la rueda quieta: es una regla de seguridad real.
5. **Transformador como proporción.** El doble de vueltas da el doble de empuje y la mitad de corriente:
   no fabrica Luz. Sólo funciona con Luz que cambia. Retoma las proporciones del Faro II (4 : 2 : 1).
6. **Por qué se transmite en alta.** La décima parte de corriente da la centésima parte de calor
   (I² × R, del Faro I). Lo que sube tiene que bajar en la misma proporción.

**Fuera de alcance, dicho así:** fase, reactancia, factor de potencia, trifásica y el campo magnético en
detalle. Todas las cargas son resistivas, salvo el aljibe.

## Cómo simula el cobre la marea (el modelo mínimo que no miente)

**Hoy.** `solveDC` (`src/electrical.js`) resuelve una red **resistiva** por análisis nodal, con fuentes
de tensión ideales: sin tiempo, sin elementos no lineales y sin fuentes de corriente. `evaluatePuzzle`
(`src/puzzle-model.js`) resuelve una vez por cambio, corta por la corriente de la fuente y les aplica
`Math.abs` a las piezas sin polaridad.

**Propuesta: cuasi-estática por muestras.** Como las redes son resistivas, en cada instante vale el
cálculo de continua con la fuente en `v(t) = Vp · sen(2πft)`.
- **Fuente** `{ waveform: 'sine', peak, freq }`. Se toman 64 muestras por vuelta, durante tres vueltas,
  y cuenta la última, ya estable. De cada rama sale el tope, el eficaz, el promedio y el mínimo.
- **Criterio según la pieza.** Lo térmico (lámpara, calefactor, protección) usa el eficaz. Lo polarizado
  (motor, cerrojo) usa el promedio y no puede invertirse nunca. El torno pide además un mínimo, para
  que no tire a tirones.
- **Diodo:** ideal, con 0,7 V de caída, sin fuga ni ruptura. Con seis piedras o menos se prueban los
  estados posibles y se queda el que es consistente.
- **Aljibe:** modelo compañero de Euler implícito (C/Δt más una fuente de corriente). Hay que sumar
  fuentes de corriente al análisis nodal: es el cambio más delicado.
- **Anillos:** transformador ideal (dos filas más en la matriz), sin pérdidas ni corriente de
  magnetización. **Con continua** no acoplan: el primario queda como su bobinado, unos 2 Ω, y salta el
  «clic» del Arco I, que es lo que pasaría de verdad. El golpe al conectar se dibuja como una marca.
- **Regulador:** la rueda fija su tope y su frecuencia por separado, como regulan velocidad y excitación
  las centrales reales. Es una simplificación declarada.

**Dos mareas.** Mientras la compuerta lagrimea, la rueda va **lenta**: 0,5 Hz, una vuelta cada 2 s, y
la lámpara late una vez por segundo. Al abrir las compuertas (banco 4) pasa a **50 Hz**, como en una
casa del Río de la Plata. Los bancos 1 a 4 son lentos, para que todo se vea, y el 5 y el 6 son rápidos:
así los anillos trabajan a una frecuencia en la que un transformador real funciona.

## Instrumento nuevo: «Dibujar la marea» (el tambor de Ohm)

Ohm desenrolla una tira de papel y una pluma la recorre con el tiempo. Tiene dos puntas, como
«Comparar dos puntos», y dibuja **en vivo, al ritmo de la lámpara**.
- **Sin números, primero.** La línea media dice «quieto»; arriba, «empuja»; abajo, «al revés». Ohm
  nombra la forma: *Empuja parejo* · *Va y viene* · *Sólo una mitad* · *Siempre para el mismo lado, a
  golpes* · *Casi parejo*.
- **«Ver números»** muestra el tope, lo que vale y las respiraciones por segundo. Se ofrece desde el
  banco 2, cuando «lo que vale» ya significa algo: es la capa progresiva que propone
  [AUDITORIA-APRENDIZAJE.md](AUDITORIA-APRENDIZAJE.md).
- **«Estirar el papel»** sólo aparece con la marea rápida: la banda apretada se abre y deja ver la misma
  onda. Ohm: «Que no la veas respirar no quiere decir que no respire».
- **Cada tira queda pegada en la Bitácora.** El jugador produce dibujos, no sólo notas.
- **«Comparar dos puntos» con la marea lenta** oscila de un lado al otro. Con la rápida dice «Va y viene:
  tomá el tambor», porque una aguja marcaría casi cero.

## Bancos

Seis en el camino principal y uno opcional. La rueda da 17 V de tope (12 V eficaces). Los números son
de partida.

### 1 · La marea (sala de máquinas · Orla)
- **Situación y piezas:** el sello del Consejo dejó la lámpara del aviso atada a una celda del valle.
  En el banco hay una «Rueda ∼», una «Celda del valle · 12 V», la lámpara (12 Ω), el molinete (motor
  polarizado), un cable y el tambor.
- **Primera pregunta:** «Orla dice que la Luz del monte es otra Luz. ¿En qué se diferencia? El tambor
  puede dibujar las dos.»
- **Éxito:** Orla vio las dos Luces dibujadas y la lámpara respira desde la rueda. El molinete gira con
  la celda y se mece con la rueda.
- **Lo que vio Ohm:** «La pluma llegó a 17 de un lado y a 17 del otro, una vuelta cada 2 s. La lámpara
  latió dos veces por vuelta: el sentido no le importa. Las cargas no bajaron del monte: van y vienen,
  como la cadena si pedaleás para atrás. **Corriente alterna**; sus vueltas por segundo son la
  **frecuencia**: acá, 0,5 Hz. ¿Cuántas veces respira la Luz de tu casa?»
- **El cobre:** «Misma lámpara, mismo cobre. Cambia el sentido, no la Luz.»
- **Bitácora:** *La Luz que respira* → Corriente alterna. *Cuántas veces respira* → Frecuencia · Hz.

### 2 · El tope y lo que vale (la casilla de Orla)
- **Situación y piezas:** Orla usa «lámparas de tope», marcadas 17, y siempre le parecieron flojas.
  En el banco hay dos lámparas iguales de 12 Ω, cada una con un vidrio que se entibia. Una va en la
  rueda y la otra en un dial de Luz quieta (6 · 9 · 12 · 15 · 17 V).
- **Marca esperada** (cuaderno de Orla): «La pluma llega a 17. ¿A cuánta Luz quieta equivale?»
  Opciones: 17 · 12 · 8,5 (la mitad) · 0 (se anula).
- **Primera pregunta:** «¿Con cuánta Luz quieta se entibia igual que con la marea?»
- **Éxito:** los dos vidrios se entibian igual, con 12 V, y la lámpara de 12 da luz plena en la casilla.
- **Lo que vio Ohm:** «Tope, 17; se entibió como con 12. Lo que calienta cuenta el empuje al cuadrado:
  empujando al revés también calienta, por eso no da 0. Y arriba pasa poco tiempo, por eso no da 17.
  **Valor eficaz:** 17 ÷ 1,41 = 12. En tu casa dicen 220 V: es el eficaz, y el tope es 311.»
- **El cobre:** «El tope existe, pero lo que calienta vale 12.»
- **Bitácora:** *El tope* → Valor pico. *Lo que vale* → Valor eficaz.

### Opcional · El costurero de Orla (antes del banco 3)
- **Situación y piezas:** las piedras de una sola mano son cuentas de vidrio negro con una raya
  plateada, y algunas tienen la raya gastada. Son seis, y la prueba de camino ahora **distingue la punta
  roja de la negra**: hay paso en un sentido y no en el otro. Una de las piedras está rota y pasa en los
  dos sentidos.
- **Acertijo:** en el rombo dibujado en el cuaderno de Orla falta una raya. ¿Hacia dónde va? Lo elegís
  y después lo probás. Es la misma mecánica que el acertijo de Lumen.
- **Lo que se aprende:** la raya marca por dónde **sale** la Luz (cátodo). Una piedra que pasa en los
  dos sentidos está rota. No bloquea nada: el banco 3 se puede resolver probando.
- **El cobre:** «Ésta deja pasar para los dos lados: perdió la mano.»

### 3 · Las piedras de una sola mano (cerrojo de la compuerta del medio)
- **Situación y piezas:** un cerrojo de imán, como el de la Calzada, traba la compuerta que lagrimea.
  Con la marea se sacude. En el banco están la rueda, el cerrojo (14 Ω, polarizado), un zócalo para una
  piedra y después el rombo. Orla recuerda medio dibujo: dos piedras ya están puestas y vos ponés las
  otras dos. De las cuatro combinaciones funciona una; las demás no dan nada o hacen «clic».
- **Primera pregunta:** «Un aliento empuja y el siguiente tira. ¿Qué haría falta para que todos
  empujen para el mismo lado?» **Después,** con una sola piedra: «Se pierde una mitad. ¿Hay que tirarla
  o se la puede dar vuelta?»
- **Éxito:** el cerrojo empuja siempre hacia la marca, nunca al revés, con un promedio firme de 0,55 a
  0,85 A.
- **Lo que vio Ohm:** «Con una piedra, 0,37 A de promedio, y la mitad del tiempo nada. Con el rombo,
  0,71 A: empujan las dos mitades. Cada piedra se quedó con 0,7 V. **Diodo**; al rombo le dicen
  **rectificador de onda completa**. Las piedras no ordenan la marea: le cierran una puerta.»
- **El cobre:** «Una sola tira la mitad. Cuatro dan vuelta la otra.»
- **Bitácora:** *Piedra de una sola mano* → Diodo. *El rombo* → Rectificador en puente.

### 4 · El aljibe de la Luz (el torno de las compuertas)
- **Situación y piezas:** el torno (motor polarizado, 12 Ω) levanta las compuertas grandes. Con el rombo
  solo, tira a tirones: se detiene dos veces por vuelta y la cadena salta. Hay un zócalo con tres
  opciones (sin aljibe, aljibe chico, aljibe grande) y, al costado, la piedra de vaciado.
- **Primera pregunta:** «Entre aliento y aliento, el torno se queda sin nada. ¿Qué podría guardar Luz
  en el tope para darla entre uno y otro?»
- **Éxito:** el torno tira sin tirones, sin bajar nunca de 12 V. Antes de abrir la tapa, Orla pide
  vaciarlo: con la rueda frenada y el torno suelto, el tambor todavía marca unos 15 V.
- **Lo que vio Ohm:** «Sin aljibe, de 0 a 15,6 V. Con el chico bajaba hasta 10,6; con el grande, sólo
  hasta 14,3. Se llena hasta el tope, no hasta el eficaz. **Capacitor.** ¿Qué haría el mismo aljibe con
  una marea cien veces más rápida?»
- **El cobre:** «Tenía razón. Con la rueda quieta, todavía guarda Luz.»
- **Consecuencia (escena central del arco):** las compuertas se abren, la rueda pasa a 50 Hz y la
  lámpara deja de latir a la vista.
- **Bitácora:** *El aljibe de la Luz* → Capacitor · faradio (F). No se da el valor del banco: a 0,5 Hz
  hace falta del orden de un faradio. Se dice, en cambio, que a 50 Hz alcanza con uno cien veces más
  chico.

### 5 · Los anillos que se hablan (sala de los anillos)
- **Situación y piezas:** un anillo de hierro con dos bobinados, como el de Faraday (1831). Arriba hay
  20 vueltas; abajo, tomas en 10, 20, 40 y 100. El farol de Tala pide 6 V y la campana del aviso, 24 V.
- **Prueba del conjuro:** Vega trae una celda del valle. Con Luz quieta, el tambor marca un golpe al
  conectar y después nada, y salta el clic.
- **Marca esperada:** «Abajo hay el doble de vueltas. ¿Qué empuje recibe la campana?» Opciones: la mitad
  · lo mismo · el doble · cuatro veces.
- **Primera pregunta:** «¿Qué toma le da a cada uno lo que pide?» **Éxito:** el farol en la toma de 10
  y la campana en la de 40.
- **Lo que vio Ohm:** «Con 20 arriba y 40 abajo, el doble de vueltas dio 24 V, el doble. La campana
  sola tomó 0,5 A y la rueda entregó 1 A: el doble de empuje, la mitad de corriente. Los anillos no
  fabrican Luz. **Transformador, relación de vueltas.**»
- **El cobre:** «Se hablan sin tocarse, sí. A la Luz quieta no le contestan.»
- **Bitácora:** *Los anillos que se hablan* → Transformador · relación de vueltas.

### 6 · La línea alta (de la Casa a las Terrazas · Ivara)
- **Situación y piezas:** una línea vieja de 3 km, con 6 Ω de ida y vuelta, lleva a la toma nueva de
  las Terrazas, que pide 12 V y 2 A. El banco tiene dos zonas, «Junto a la rueda» y «Junto a las
  Terrazas», como `zones` del Faro I. Hay anillos de subida y de bajada con tomas ×1, ×5 y ×10.
- **Marca esperada:** «Si por la línea pasa la décima parte de corriente, ¿cuánto menos se calienta?»
  Opciones: la mitad · la décima · la centésima.
- **Primera pregunta:** «Así, la toma recibe 6 V y la línea se queja. ¿Cómo llega entera?»
- **Física (toma · calor en la línea):** ×1/×1: 6 V · 6 W. ×5/×5: 11,5 V · 0,89 W. ×10/×10: 11,9 V ·
  0,24 W. ×10/×5: 23 V, demasiada fuerza. ×5/×10: 5,9 V, no alcanza.
- **Éxito:** la toma recibe entre 11 y 13 V y la línea calienta 1 W o menos. Sirven ×5 y ×10: hay
  más de un acuerdo, como en las Terrazas.
- **Lo que vio Ohm:** «Con ×10, la línea llevó 120 V y 0,2 A, la décima parte de los 2 A que toma la
  toma. Calor: 0,24 W. Si la línea llevara esos 2 A, se calentaría 24 W: con la décima parte de
  corriente, la centésima parte de calor. **Transmisión en alta tensión.** Por eso va en postes altos y
  nadie la toca.»
- **El cobre:** «Llega cansada si viaja con mucha corriente. Alta y liviana, llega casi entera.»
- **Bitácora:** *La línea alta* → Transmisión en alta tensión.

## En la Bitácora

- **Una página por banco**, como en el Arco I: el montaje dibujado como estaba y como quedó, con
  símbolos nuevos (fuente ∼, diodo, puente, capacitor, transformador), lo que vio Ohm y el conjuro.
- **«El cuaderno de las mareas»** junta las tiras del tambor en orden: Luz quieta, marea, media marea,
  rombo, rombo con aljibe chico y con aljibe grande, y marea rápida estirada. Es la lámina imprimible
  del arco.
- **«El Oficio, traducido»**, la página propuesta en OFICIO-DE-LA-LUZ.md, suma las siete creencias.
- **Palabras del oficio:** nueve nuevas.

## Cómo responde el reino

`quietMountState` (`src/quiet-mount.js`) ya lee el Arco I. Se le agregan `gates`, `tide` (`slow` o
`fast`) y `line`.

| Lo que hizo el viajero | Lo que pasa |
|---|---|
| Ivara levanta el sello | Se abre la reja del desfiladero y la casa tiene puerta |
| Banco 1 | La lámpara respira desde la rueda; se ve también desde el Manantial |
| Banco 4 | Las compuertas se abren y el canal viejo corre pleno. La lámpara deja de latir. Edda: «Respiraba cuando faltaba agua» |
| Banco 6 | Los postes de la línea alta bajan la ladera. En las Terrazas, los 2,2 A dejan de ser el único cable: Yesca forja y el riego sale pleno |
| En el Arco I, el agua primero (embalse bajo) | La rueda arranca más lenta y Orla lo nota. Al final, Vega dice que ese acuerdo ya no obliga a nadie a ceder. Los bancos no cambian |
| En el Arco I, el horno primero | El mismo final, desde Yesca: «Ahora le devuelvo el agua a Vega» |

## Qué hace falta construir

| Pieza | Tamaño | Nota |
|---|---|---|
| Solver por muestras: fuente senoidal; tope, eficaz, promedio y mínimo | Medio | Reutiliza `solveDC` en cada instante. El Arco I no debe cambiar |
| Diodo con búsqueda de estados | Medio | Seis piedras como máximo |
| Capacitor: fuentes de corriente y pasos de tiempo | Medio-alto | Lo más delicado del solver |
| Transformador ideal y su «clic» con continua | Medio | Dos filas en la matriz y un caso especial |
| `evaluatePuzzle` con criterio según la pieza | Medio | La protección mira el eficaz |
| Tambor: dibujo en vivo, estirar el papel, tiras guardadas | Alto | Los bancos hoy son estáticos: se precalcula una vuelta y sólo se anima |
| Prueba de camino con sentido | Bajo | `measureResistance` es simétrica, pero las puntas ya tienen color |
| Piezas nuevas en banco y esquema: rueda ∼, piedra con raya, rombo, aljibe, anillos, torno, molinete | Alto | También los símbolos de la Bitácora y del PDF |
| Seis bancos y el costurero: modelo, pasos, pistas, conjuros, marcas, revelaciones, palabras | Alto | Mismo formato que `PUZZLES`, `BENCH_GUIDANCE`, `CONJUROS` y `ESTIMATES` |
| Área «compuertas»: desfiladero, interior, coronamiento y casilla | Alto | La casa hoy no tiene interior. Revisar la cámara, como en MONTE-QUIETO.md |
| Orla: modelo, retrato y diálogos | Medio-alto | Prompts como en `docs/art-prompts-actors-*.md` |
| Postes de la línea alta y reacción de las Terrazas | Medio | Sin tapar al jugador |

**Pruebas.** Eficaz de la senoidal dentro del 1 % de pico ÷ √2; media onda ≈ (Vp − 0,7) ÷ π; rizado
≈ I ÷ (2 f C); los anillos conservan la potencia y hacen «clic» con continua; cada banco se resuelve
con `solve` y revela los números del montaje; estado del monte y `tests/playthrough.mjs`.

**Riesgos.**
- **Destellos:** la marea lenta late a 1 Hz, lejos de los 3 por segundo de WCAG 2.3.1; la rápida nunca
  se dibuja parpadeando.
- **Gráficos en el tiempo:** a los 12 años cuestan; el tambor va al ritmo de la lámpara: primero lo que
  se ve, después el número. **Carga:** seis ideas nuevas, sin fase, un instrumento por banco.
- **Solver:** el aljibe complica uno que hoy es simple y probado. **Prueba con personas:** no verificada.

## Para decidir

1. **¿Por qué la luz de la casa se enciende con el Faro?** Propuesta: **la excitación.** El imán de la
   rueda grande es una bobina, y la alimenta con Luz quieta la línea vieja del valle, que volvió con el
   Faro. Es física real y queda en el lore, sin banco. La alternativa es dejarlo como misterio.
2. **¿Dos mareas, 0,5 Hz y después 50 Hz?** Propuesta: **sí.** Sin la marea lenta no se ve nada, y el
   cambio explica por qué una casa no parpadea.
3. **¿Seis bancos y el costurero, o el 5 y el 6 juntos?** Propuesta: **seis.** Juntos mezclarían la
   proporción con las pérdidas.
4. **¿El embalse bajo del Arco I cambia los números de los bancos?** Propuesta: **no:** cambia el mundo
   y los diálogos. Dos versiones de cada banco serían caras.
5. **¿Personaje nuevo?** Propuesta: **Orla, con Tala de compañera.** Que Vega cuide la casa la sacaría
   del canal y repetiría su voz.
6. **¿Adónde llega la línea alta?** Propuesta: **a las Terrazas**, porque cierra el reparto que el
   jugador decidió en el Arco I. La Plaza es más vistosa, pero no cierra nada.
