# Arco II · La Marea · diseño para revisar

Propuesta del Ciclo 25 (11 oct 2026). **No aprobada, no construida.** Siembra:
[OFICIO-DE-LA-LUZ.md](../OFICIO-DE-LA-LUZ.md) («Semillas para los arcos que vienen») y el umbral ya
construido en [MONTE-QUIETO.md](MONTE-QUIETO.md). Sigue la forma de [PIEDRAS-DE-FRENO.md](PIEDRAS-DE-FRENO.md)
y las lecciones de [AUDITORIA-ARCO-1.md](AUDITORIA-ARCO-1.md) y [BANCOS-UX.md](BANCOS-UX.md): una idea
por banco, pocas piezas, el primer paso pregunta y el gesto queda para la pista.

## La idea en una línea

En la Casa de Compuertas la Luz **respira**: empuja, se detiene y empuja al revés. Los del monte creen
que es «otra Luz». El jugador la ve respirar en una lámpara, la dibuja con un instrumento nuevo, la
ordena con piedras de una sola mano, la guarda en un aljibe y la manda al valle con dos anillos que se
hablan sin tocarse. Al final, la Luz del monte llega a las Terrazas y la ladera deja de tener una sola Luz.

## Premisa y lugar

**Cómo se llega.** Hoy la casa no se puede abrir a propósito: en `src/quiet-mount-art.js` la casa «has
no id: it is not a door you can open yet». En el Arco II:
- Después de «Arco I · Completo», la página abierta de la Bitácora («Una luz en el Monte Quieto»,
  `src/content.js`) se vuelve el encargo. Tala la trae: «¿Qué la alimenta allá arriba?».
- El paso es el **desfiladero** que sale del borde oeste del Manantial (`QUIET_MOUNT.gorge`). Lo cierra
  una reja con el sello del Consejo, puesto después de los incendios que cuenta Ivara. Ivara, que en el
  Castillo aprendió a confiar en la evidencia, levanta el sello con una condición: «Tráiganme pruebas».
- Vega guía por la orilla del canal viejo (`QUIET_MOUNT.tailrace`), el que ella vio volver a correr.

**Quién vive ahí.** Una persona nueva y dos conocidas:
- **Orla, la compuertera** (nueva). Es la última de una familia que cuidaba las compuertas. Vive en una
  casilla sobre la represa y gira las ruedas a mano cada estación, pero nunca entró a la sala de máquinas
  porque está sellada. Su dialecto del Oficio **cuenta alientos**: no cuántos voltios, sino cuántas
  veces respira la lámpara. Es el contrapunto de «la Luz se ofende si la cuentan».
- **Tala** acompaña: hace las preguntas que abren cada banco. **Ivara** sostiene el sello y la línea.
  **Yesca** y **Vega** reciben el final.

**Qué está roto y por qué importa.** La casa funciona apenas: la compuerta del medio lagrimea
(`quietMountState().weeping`) y la rueda grande gira con ese hilo de agua. Por eso respira lento y la
lámpara se ve latir. Las compuertas grandes están trabadas y la línea alta al valle está cortada. En el
valle, todo vive de fuentes chicas: las Terrazas comparten un cable de 2,2 A (`PUZZLES.irrigation`,
`src/puzzle-model.js`), y el horno y el riego se disputan la Luz. **Si la Casa vuelve, la ladera tiene
dos Luces.**

**Lo que avisaba la luz** (la abuela de Edda). La lámpara de la casa es un aviso: con el embalse alto,
la rueda gira rápido y la luz se ve firme. Con el embalse bajo, la rueda va lenta y la luz respira a la
vista. Esto ya ocurre en el juego (`lamp: 'steady' | 'flicker'`); el arco le da sentido físico.

## Lo que creen los herederos (el Oficio)

| Creencia (conjuro) | Quién | Qué tiene de verdad | Dónde falla | Idea errónea | Banco |
|---|---|---|---|---|---|
| «La Luz del monte es otra Luz: no se mezcla con la del valle» | Orla | Hay cosas que funcionan distinto con ella | Las mismas cargas, el mismo cobre: sólo cambia el sentido del empuje | La alterna es «otra electricidad»; las cargas viajan desde la central | 1 |
| «La Luz del monte se mide por su tope» | Compuerteras | El tope existe y importa | Calienta como 12 de la quieta, no como 17 | El pico es lo que vale; o «va y viene, se anula» | 2 |
| «Piedra de una sola mano ordena la marea» | La madre de Orla | La piedra deja pasar en un solo sentido | Una sola no ordena: tira una de cada dos respiraciones | Rectificar es «convertir» sin perder nada | 3 |
| «El aljibe se vacía antes de abrirle la tapa» | Compuerteras | **Todo:** el cobre le da la razón | — | (Rito correcto: guarda Luz con la rueda quieta) | 4 |
| «Los anillos se hablan sin tocarse: a cualquier Luz le contestan» | Orla | Se hablan sin tocarse, de verdad | Con Luz quieta callan; sólo hablan mientras la Luz cambia | El transformador funciona con continua | 5 |
| «La Luz que viaja lejos llega cansada: que cada casa tenga su rueda» | Ivara, el Consejo | Una línea larga se queda con Luz | Mandada alta y con poca corriente, llega casi entera | Las pérdidas son fijas; subir tensión es «más peligro y nada más» | 6 |
| «Piedra que deja pasar, piedra sana» | Orla (costurero) | Una piedra cortada no sirve | Si deja pasar para los dos lados, perdió la mano: está rota | Continuidad es salud (eco del Manantial) | Opc. |

El rito del aljibe es el primero del Oficio que el cobre confirma entero. Ohm: «Este verso no hay que
traducirlo: hay que cumplirlo». No todo lo heredado está equivocado.

## Qué se aprende (en orden)

1. **Alterna y continua** (banco 1). La Luz que respira empuja hacia un lado, se detiene y empuja al
   revés. La cadena de bicicleta del Portal sigue valiendo, pero se pedalea para adelante y para atrás:
   las cargas no viajan desde el monte, van y vienen en el cobre. A la lámpara no le importa el sentido,
   como ya enseñó la Calzada (`isPolarized`); al molinete, sí. **Frecuencia:** cuántas veces respira por
   segundo.
2. **Tope y lo que vale** (banco 2). La marea pasa poco tiempo en el tope y dos veces por vuelta por
   cero. Lo que calienta cuenta el empuje al cuadrado, así que las dos mitades suman y no se anulan.
   17 de tope calienta como 12 de la quieta: **valor eficaz = pico ÷ 1,41**, sólo para esta forma.
3. **Diodo y rectificación** (banco 3). Una piedra deja pasar media marea (media onda). Cuatro en rombo
   dan vuelta la otra mitad (onda completa, puente).
4. **Capacitor como reserva** (banco 4). El aljibe se llena en cada tope y entrega en el valle. Con uno
   más grande, o con menos consumo, baja menos. Se llena hasta **el tope**, no hasta el eficaz. Guarda
   Luz con la rueda quieta: es una regla de seguridad real.
5. **Transformador como proporción** (banco 5). El doble de vueltas da el doble de empuje y la mitad de
   corriente: no fabrica Luz. Sólo funciona con Luz que cambia. Se reutiliza el 4 : 2 : 1 del Faro II.
6. **Por qué se transmite en alta** (banco 6). La décima parte de corriente por la línea da la centésima
   parte de calor (I² × R, del Faro I). Lo que sube tiene que bajar en la misma proporción.

**Fuera de alcance, y dicho así:** fase, reactancia, factor de potencia, trifásica, el campo magnético
en detalle. Todas las cargas son resistivas, salvo el aljibe del rectificador.

## Cómo simula el cobre la marea (modelo mínimo que no miente)

**Hoy:** `solveDC` (`src/electrical.js`) resuelve una red **resistiva** por análisis nodal, con
fuentes de tensión ideales. No tiene tiempo, ni elementos no lineales, ni fuentes de corriente.
`evaluatePuzzle` (`src/puzzle-model.js`) resuelve una vez por cambio y aplica la protección por la
corriente de la fuente. Las piezas sin polaridad toman `Math.abs`.

**Propuesta: cuasi-estática por muestras.** Las redes son resistivas, así que en cada instante vale el
mismo cálculo de continua con la fuente en `v(t) = Vp · sen(2πft)`.
- **Fuente** `{ waveform: 'sine', peak, freq }`. Se resuelven 64 muestras por vuelta y tres vueltas (la
  última, ya estable, es la que cuenta). De cada rama sale: tope, eficaz, promedio y mínimo.
- **Criterios por tipo de pieza:** las térmicas (lámpara, calefactor, protección) usan el **eficaz**.
  Las polarizadas (motor, cerrojo) usan el **promedio** y exigen que nunca se inviertan. El torno exige
  además un **mínimo** («sin tirones»).
- **Diodo:** ideal con caída fija de 0,7 V, sin fuga ni ruptura. Con hasta seis piedras, se prueban las
  combinaciones de encendido y apagado y se elige la consistente.
- **Aljibe:** modelo compañero de Euler implícito (conductancia C/Δt más una fuente de corriente). Exige
  sumar fuentes de corriente al análisis nodal. Es el cambio más delicado del solver.
- **Anillos:** transformador ideal (dos filas más en la matriz), sin pérdidas ni corriente de
  magnetización. **Con continua** no acopla nada. El primario es su resistencia de bobinado, de unos
  2 Ω, y la protección salta: es el «clic» del Arco I, físicamente correcto. El golpe al conectar se
  dibuja en el tambor como una marca guionada.
- **Regulador:** el tope y la frecuencia de la rueda se fijan por separado (las centrales reales regulan
  velocidad y excitación). Simplificación declarada.

**Dos mareas.** Mientras la compuerta lagrimea, la rueda respira **lenta** (0,5 Hz: una vuelta cada 2 s
y la lámpara late una vez por segundo). Al abrir las compuertas (banco 4) pasa a **50 Hz**, como en una
casa del Río de la Plata. Los bancos 1 a 4 son lentos para que todo se vea; el 5 y el 6, rápidos. Así,
además, los anillos trabajan a una frecuencia en la que un transformador de verdad funciona.

## Instrumento nuevo: «Dibujar la marea» (el tambor de Ohm)

Ohm desenrolla una tira de papel y una pluma la recorre mientras pasa el tiempo. Se usa con dos
puntas, como «Comparar dos puntos», y la tira se ve **en vivo, sincronizada con la lámpara**.
- **Sin números, primero.** Una línea media dice «quieto»; arriba, «empuja hacia +»; abajo, «al
  revés». Ohm lo pone en palabras: *Empuja parejo* · *Va y viene* · *Sólo una mitad* · *Siempre para el
  mismo lado, a golpes* · *Casi parejo*.
- **Ver números:** tope, lo que vale (eficaz) y respiraciones por segundo. Se ofrece después del
  banco 2, cuando «lo que vale» ya tiene sentido (es la capa progresiva que propone
  [AUDITORIA-APRENDIZAJE.md](AUDITORIA-APRENDIZAJE.md)).
- **Estirar el papel:** sólo con la marea rápida. A 50 Hz la pluma dibuja una banda; estirada, se ve la
  misma onda. «Que no la veas respirar no quiere decir que no respire.»
- **Las tiras quedan en la Bitácora**, una por banco. El jugador produce dibujos, no sólo notas.
- **«Comparar dos puntos» con marea:** con la marea lenta, la barra oscila de un lado al otro. Con la
  rápida dice «Va y viene: tomá el tambor», porque un instrumento de aguja marcaría casi cero.

## Bancos

Seis en el camino principal y uno opcional. La rueda da 17 V de tope (12 V eficaces). Los números
son de partida y se ajustan al construir.

### 1 · La marea (sala de máquinas · Orla)
- **En el mundo:** la lámpara del aviso quedó atada a una celda del valle por el sello del Consejo.
  La rueda grande gira lenta, sin carga.
- **Piezas:** «Rueda ∼», «Celda del valle · 12 V», lámpara del aviso de 12 Ω, el molinete (motor
  polarizado), un cable y el tambor.
- **Primera pregunta:** «Orla dice que la Luz del monte es otra Luz. ¿En qué se diferencia de la del
  valle? El tambor puede dibujar las dos.»
- **Éxito:** Orla vio las dos Luces dibujadas, y la lámpara del aviso respira desde la rueda.
  El molinete se prueba: con la celda gira; con la rueda se mece.
- **Lo que vio Ohm:** «La pluma llegó a 17 de un lado y a 17 del otro: una vuelta cada 2 s. La
  lámpara latió dos veces por vuelta: no le importa el sentido. Al molinete sí: se mecía. Las cargas
  no bajaron del monte: van y vienen en el cobre, como la cadena si pedaleás para atrás. Los del
  Instituto la llaman **corriente alterna**; las vueltas por segundo, **frecuencia**, en hercios: acá,
  0,5 Hz. ¿Cuántas veces respira la Luz de tu casa?»
- **Conjuro:** «La Luz del monte es otra Luz». **El cobre:** «Misma lámpara, mismo cobre. Cambia el
  sentido, no la Luz.»
- **Bitácora:** *La Luz que respira* → Corriente alterna; *Cuántas veces respira* → Frecuencia · Hz.

### 2 · El tope y lo que vale (la casilla de Orla)
- **En el mundo:** Orla pone en su casa «lámparas de tope», marcadas 17, y siempre le parecieron
  flojas. Cree que la Luz del monte es débil.
- **Piezas:** dos lámparas iguales de 12 Ω y el termómetro de vidrio («cuánto se entibia en una
  respiración»). Una está en la rueda y la otra en un dial de Luz quieta (6 · 9 · 12 · 15 · 17 V).
- **Marca esperada** (cuaderno de Orla): «La pluma llega a 17. ¿A cuánta Luz quieta equivale?»
  Opciones: 17 · 12 · 8,5 (la mitad) · 0 (va y viene, se anula).
- **Primera pregunta:** «¿Con cuánta Luz quieta se entibia igual que con la marea?»
- **Éxito:** los dos vidrios se entibian igual (12 V) y la lámpara de 12 da luz plena en la casilla.
- **Lo que vio Ohm:** «Tope, 17; se entibió como con 12. Lo que calienta cuenta el empuje al cuadrado:
  cuando empuja al revés también calienta, por eso no da 0. Y pasa poco tiempo arriba, por eso no da 17.
  **Valor eficaz:** 17 ÷ 1,41 = 12, para esta forma de onda. En tu casa dicen 220 V: es el eficaz; el
  tope es 311.»
- **Conjuro:** «La Luz del monte se mide por su tope». **El cobre:** «El tope existe, pero lo que
  calienta vale 12.»
- **Bitácora:** *El tope* → Valor pico; *Lo que vale* → Valor eficaz.

### Opcional · El costurero de Orla (antes del banco 3)
- **En el mundo:** las piedras de una sola mano son cuentas negras de vidrio con una raya plateada,
  guardadas en un costurero. Algunas tienen la raya gastada.
- **Piezas:** seis piedras y la prueba de camino, que **ahora distingue la punta roja de la negra**:
  hay paso en un sentido y no en el otro. Una piedra rota deja pasar en los dos sentidos.
- **El acertijo:** el dibujo del rombo en el cuaderno de Orla tiene una raya borrada. ¿Para qué lado
  va? Elegís, y después se prueba.
- **Lo que se aprende:** la raya marca por dónde **sale** la Luz (cátodo). Una piedra que pasa para
  los dos lados está rota. Sin bloqueo: el banco 3 se resuelve igual probando.
- **Conjuro:** «Piedra que deja pasar, piedra sana». **El cobre:** «Ésta deja pasar para los dos
  lados: perdió la mano.»

### 3 · Las piedras de una sola mano (cerrojo de la compuerta del medio)
- **En el mundo:** la compuerta que lagrimea está trabada por un cerrojo de imán, como el de la
  Calzada. Con la marea se sacude: un aliento lo empuja y el siguiente lo tira.
- **Piezas:** la rueda, el cerrojo (14 Ω, polarizado), un zócalo para una piedra y después el
  **rombo**. Orla recuerda medio dibujo: dos piedras ya están puestas y vos ponés dos. De las cuatro
  combinaciones funciona una; las otras no dan nada o hacen «clic».
- **Primera pregunta:** «Un aliento empuja y el siguiente tira. ¿Qué haría falta para que todos
  empujen para el mismo lado?»
- **Segunda pregunta:** con una piedra, el tambor dibuja *Sólo una mitad*. «¿Hay que tirar la otra
  mitad o se la puede dar vuelta?»
- **Éxito:** el cerrojo empuja siempre hacia la marca, nunca al revés, con un promedio firme
  (0,55 a 0,85 A).
- **Lo que vio Ohm:** «Con una piedra: 0,37 A de promedio, y la mitad del tiempo nada. Con el rombo:
  0,71 A, y las dos mitades empujan. Cada piedra se quedó 0,7 V. Los del Instituto le dicen **diodo**;
  al rombo, **rectificador de onda completa**. Las piedras no ordenan la marea: le cierran una puerta.»
- **Conjuro:** «Piedra de una sola mano ordena la marea». **El cobre:** «Una sola tira la mitad.
  Cuatro dan vuelta la otra.»
- **Bitácora:** *Piedra de una sola mano* → Diodo; *El rombo* → Rectificador (puente).

### 4 · El aljibe de la Luz (el torno de las compuertas)
- **En el mundo:** el torno (motor polarizado de 12 Ω) levanta las compuertas grandes. Con el rombo
  solo, tira a tirones: se detiene dos veces por vuelta y la cadena salta.
- **Piezas:** el rombo armado, el torno y un zócalo con tres opciones: sin aljibe, aljibe chico y
  aljibe grande. Al costado, la piedra de vaciado.
- **Primera pregunta:** «Entre aliento y aliento, el torno se queda sin nada. ¿Qué podría guardar
  Luz en el tope para darla en el valle?»
- **Éxito:** el torno tira sin tirones (mínimo de 12 V o más). Antes de abrir la tapa, Orla pide
  vaciarlo: con la rueda frenada y el torno suelto, el tambor todavía marca unos 15 V en el aljibe.
- **Lo que vio Ohm:** «Sin aljibe, 0 a 15,6 V. Con el chico, bajaba hasta 10,6; con el grande, sólo
  hasta 14,3. Se llena hasta el tope, no hasta el eficaz. Los del Instituto lo llaman **capacitor**.
  ¿Qué pasaría con el mismo aljibe y una marea cien veces más rápida?»
- **Conjuro:** «El aljibe se vacía antes de abrirle la tapa». **El cobre:** «Tenía razón. Con la
  rueda quieta, todavía guarda Luz.»
- **Consecuencia:** las compuertas se abren y la rueda pasa a **50 Hz**. La lámpara deja de latir a
  la vista. Es la escena central del arco.
- **Bitácora:** *El aljibe de la Luz* → Capacitor · faradio (F). En la Bitácora no se da el valor del
  banco, porque a 0,5 Hz haría falta del orden de un faradio, un número raro. Se dice que a 50 Hz
  alcanza con uno cien veces más chico.

### 5 · Los anillos que se hablan (sala de los anillos)
- **En el mundo:** un anillo de hierro con dos bobinados, como el de Faraday en 1831. El de arriba
  tiene 20 vueltas; el de abajo tiene tomas en 10, 20, 40 y 100. El farol de Tala pide 6 V; la
  campana del aviso, 24 V.
- **Prueba del conjuro:** Vega trae su celda del valle. Con Luz quieta, los anillos callan: el tambor
  marca un golpe al conectar y nada más. Además salta el clic.
- **Marca esperada:** «Abajo, el doble de vueltas que arriba. ¿Qué empuje recibe la campana?» Opciones:
  la mitad · lo mismo · el doble · cuatro veces.
- **Primera pregunta:** «¿Qué toma le da a cada uno lo que pide?»
- **Éxito:** el farol encendido desde la toma de 10 vueltas y la campana desde la de 40.
- **Lo que vio Ohm:** «20 arriba, 40 abajo: el doble de vueltas dio 24 V, el doble. Para la campana sola,
  que tomó 0,5 A, la rueda entregó 1 A: el doble de empuje, la mitad de corriente. Los anillos no fabrican Luz.
  **Transformador, relación de vueltas.** Sólo se hablan mientras la Luz cambia.»
- **Conjuro:** «A cualquier Luz le contestan». **El cobre:** «Se hablan sin tocarse, sí. A la quieta
  no le contestan.»
- **Bitácora:** *Los anillos que se hablan* → Transformador · relación de vueltas.

### 6 · La línea alta (de la Casa a las Terrazas · Ivara)
- **En el mundo:** 3 km de línea vieja por la ladera, con 6 Ω de ida y vuelta. Del otro lado, la toma
  nueva de las Terrazas pide 12 V y 2 A. El tablero tiene dos zonas, «Junto a la rueda» y «Junto a
  las Terrazas», como `zones` del Faro I.
- **Piezas:** anillos de subida y de bajada con tomas ×1, ×5 y ×10. La línea y la toma ya están.
- **Marca esperada:** «Si por la línea pasa la décima parte de corriente, ¿cuánto menos se calienta?»
  Opciones: la mitad · la décima · la centésima.
- **Primera pregunta:** «Mandada así, la toma recibe 6 V y la línea se queja. ¿Cómo llega entera?»
- **Física:** ×1/×1 da 6 V y la línea calienta 6 W. ×5/×5 da 11,5 V y 0,89 W. ×10/×10 da 11,9 V y
  0,24 W. Con proporciones distintas, ×10/×5 da 23 V (demasiada fuerza) y ×5/×10 da 5,9 V.
- **Éxito:** la toma recibe de 11 a 13 V y la línea calienta 1 W o menos. Sirven ×5 y ×10, como en
  las Terrazas, donde había más de un acuerdo.
- **Lo que vio Ohm:** «Subida ×10: 120 V por la línea y 0,2 A, la décima parte de lo que toma la toma.
  Calor: 0,24 W, la centésima parte de 24 W. Lo que sube baja en la misma proporción. **Transmisión
  en alta tensión.** Por eso va en postes altos y nadie la toca.»
- **Conjuro:** «La Luz que viaja lejos llega cansada». **El cobre:** «Llega cansada si viaja con
  mucha corriente. Alta y liviana, llega casi entera.»
- **Bitácora:** *La línea alta* → Transmisión en alta tensión.

## En la Bitácora

- **Una página por banco**, como en el Arco I: «Así estaba / Así lo dejé» con símbolos nuevos
  (fuente ∼, diodo, puente, capacitor, transformador), lo que vio Ohm y el conjuro con lo que dijo el
  cobre.
- **«El cuaderno de las mareas»:** las tiras del tambor que dibujó el jugador, pegadas en orden: Luz
  quieta, marea, media marea, rombo, rombo con aljibe chico y con aljibe grande, marea rápida estirada.
  Es la lámina imprimible del arco.
- **«El Oficio, traducido»** (propuesta de OFICIO-DE-LA-LUZ.md) suma las siete creencias del monte.
- **Palabras del oficio:** nueve entradas nuevas: dos en cada uno de los bancos 1 a 3 y una en cada
  uno de los otros tres.

## Cómo responde el reino

`quietMountState` (`src/quiet-mount.js`) ya lee el Arco I. Se le suman `gates` (cerradas o abiertas),
`tide` (lenta o rápida) y `line` (la línea alta en servicio).

| Lo que hizo el viajero | Lo que pasa |
|---|---|
| Levantar el sello (inicio) | La reja del desfiladero se abre; la puerta de la casa tiene id |
| Banco 1 | La lámpara del aviso respira desde la rueda, también vista desde el Manantial |
| Banco 4 | Las compuertas se abren y el canal viejo corre pleno. La lámpara deja de latir. Edda entiende el aviso: «Respiraba cuando faltaba agua» |
| Banco 6 | Postes con la línea alta bajan por la ladera. En las Terrazas, el límite de 2,2 A deja de ser el único: Yesca forja y el riego sale pleno |
| Arco I: embalse bajo (riego primero) | La rueda arranca más lenta y Orla lo comenta. Al final, Vega y Yesca reconocen que ese acuerdo ya no obliga a nadie a ceder. Los números de los bancos no cambian |
| Arco I: horno primero | El mismo final, dicho desde Yesca: «Ahora le devuelvo el agua a Vega» |

## Qué hace falta construir

| Pieza | Tamaño | Nota |
|---|---|---|
| Solver por muestras: fuente senoidal, tope, eficaz, promedio y mínimo | Medio | Reutiliza `solveDC` por instante. Hay que aislarlo del Arco I (sin regresión) |
| Diodo con caída fija y búsqueda de estados | Medio | Hasta seis piedras |
| Capacitor: fuentes de corriente en el análisis nodal y pasos de tiempo | Medio-alto | Lo más delicado; probar el estado estable |
| Transformador ideal y su caso de continua (clic) | Medio | Dos filas en la matriz más el caso especial |
| `evaluatePuzzle` con criterios por tipo: eficaz, promedio o mínimo | Medio | Protección por eficaz |
| Tambor «Dibujar la marea»: SVG en vivo, estirar el papel, tiras guardadas | Alto | Un bucle de animación en el banco, que hoy es estático. Se precalcula una vuelta y sólo se anima |
| Prueba de camino con sentido (para el diodo) | Bajo | `measureResistance` es simétrica; las puntas ya tienen color |
| Piezas en banco y esquema: rueda ∼, piedra con raya, rombo, aljibe, anillos con tomas, torno, molinete | Alto | Más símbolos en la Bitácora y el PDF |
| Seis bancos y el costurero: modelo, pasos, pistas, conjuros, marcas, revelaciones y palabras | Alto | Mismo formato que `PUZZLES`, `BENCH_GUIDANCE` y `CONJUROS` |
| Área nueva «compuertas»: desfiladero, interior de la casa, coronamiento y casilla | Alto | Hoy la casa no tiene interior. Hay que revisar la cámara, como en MONTE-QUIETO.md |
| Orla: modelo, animación, retrato y diálogos | Medio-alto | Prompts como `docs/art-prompts-actors-*.md` |
| Postes de la línea alta y reacción de las Terrazas | Medio | Con chequeo de que la cámara no quede tapada |
| Pruebas | Medio | Ver abajo |

**Pruebas.** El eficaz de una senoidal, dentro del 1 % de pico ÷ √2. El promedio de media onda,
≈ (Vp − 0,7) ÷ π. El rizado del aljibe, ≈ I ÷ (2 f C). El transformador debe conservar la potencia y
hacer «clic» con continua. Cada banco se resuelve con `solve` y la revelación usa los números del
montaje. Además, el estado del monte y una partida de punta a punta (`tests/playthrough.mjs`).

**Riesgos.**
- **Destellos:** la marea lenta late a 1 Hz y está lejos del límite de 3 destellos por segundo (WCAG
  2.3.1). La marea rápida **nunca** se dibuja como parpadeo: se ve firme.
- **Leer gráficos:** a esa edad cuesta leer gráficos que cambian en el tiempo. Por eso el tambor va
  sincronizado con la lámpara y la aguja: primero lo concreto, después el número.
- **Carga conceptual:** son seis ideas nuevas. Por eso no hay fase ni reactancia, y hay un instrumento
  por banco.
- **El aljibe complica el solver,** que hoy es simple y está probado.
- **Prueba con personas: no verificada,** como en el Arco I.

## Para decidir

1. **¿Por qué la luz de la casa se enciende con el Faro?** Propuesta: **por excitación.** El imán de
   la rueda grande es una bobina, y la línea vieja del valle la alimenta con Luz quieta; al encenderse
   el Faro, volvió a llegarle. Es física real y queda en el lore, sin banco. La otra opción es dejarlo
   como misterio.
2. **¿Dos mareas, 0,5 Hz y después 50 Hz?** Propuesta: **sí.** Sin la marea lenta no se ve respirar
   nada, y el paso a 50 Hz enseña por qué una casa no parpadea.
3. **¿Seis bancos y el costurero, o juntar el 5 y el 6?** Propuesta: **seis.** Juntarlos mezclaría la
   proporción con las pérdidas.
4. **¿El embalse bajo del Arco I cambia los números de los bancos?** Propuesta: **no.** Sólo cambia el
   mundo, el ritmo inicial de la rueda y el diálogo final; dos variantes de cada banco serían muy caras.
5. **¿Personaje nuevo?** Propuesta: **Orla, con Tala de compañera.** La otra opción es que Vega sea
   la cuidadora, pero eso le quita el canal y repite voz.
6. **¿Adónde llega la línea alta?** Propuesta: **a las Terrazas.** Resuelve el reparto que el jugador
   tuvo que decidir en el Arco I. La Plaza es más vistosa, pero no cierra nada.
