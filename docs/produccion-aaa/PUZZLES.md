# Fichas de los bancos

Generado con `node scripts/puzzle-sheet.mjs --md` desde `src/game/puzzle-model.js`,
`puzzles.js` y `content.js`: no se edita a mano. Cada intento equivocado se evalúa con el mismo
modelo que usa el juego y muestra lo que el banco le dice al jugador.

**Simplificaciones declaradas del modelo** (corriente continua resistiva, como en
[PEDAGOGIA.md](../../PEDAGOGIA.md)): cada receptor es una resistencia con una franja de trabajo
(tensión, corriente y, si corresponde, potencia). Lámparas, calefactores, el horno y las
bobinas comunes funcionan con cualquier sentido de corriente. Dependen del sentido sólo las
piezas que tienen un motivo físico declarado: los motores (giran al revés), el pestillo imantado
de la Puerta, el corazón de Ohm y el cristal activo de la lente. La protección corta la fuente
cuando la corriente pedida supera su límite. No se modelan arranques, inducción ni transitorios.

### Un pequeño latido (`awaken`)

- **Objetivo en pantalla:** Despertá a Ohm: cerrá el camino de su corazón.
- **Pasos y qué se puede tocar:**
  1. El corazón de Ohm late: Tenés un cable. Tocá un borne redondo y después otro para unirlos: el camino tiene que salir de la celda, pasar por Ohm y volver.
- **Lo que aprendiste (al resolver):** La energía necesita un camino completo: sale de la celda, atraviesa a Ohm y vuelve a la celda.
- **Comprensión buscada:** Un receptor necesita un camino completo: desde un borne de la fuente, a través de él, hasta el otro borne.
- **Pista observable:** Un filamento dorado tiembla bajo el vidrio. Todavía no hay latido.
- **Acción posible:** Despertá a Ohm. Su corazón necesita un camino que salga de la celda, lo atraviese y vuelva a ella. Tenés un cable.
- **Primera ayuda:** Ese cable sale de la celda y llega a Ohm. ¿Y después? Para volver, la energía necesita otro camino.
- **Descubrimiento (solución):** Corazón de Ohm: Una luz tibia late bajo el vidrio. El ojo se abre.
- **Consecuencia:** diálogo `awaken_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Corazón de Ohm: El ojo sigue cerrado. Bajo el vidrio no hay latido. |
| sin el cable heartOut↔negative | no | Corazón de Ohm: El ojo sigue cerrado. Bajo el vidrio no hay latido. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Corazón de Ohm al revés | no | Corazón de Ohm: Responde en el sentido contrario al marcado. |

### La costura invisible (`workshop`)

- **Objetivo en pantalla:** Encontrá el tramo cortado y puentealo con tu cable.
- **Pasos y qué se puede tocar:**
  1. Lumen vio dónde está el corte: Elegí “Comprobar el camino” y apoyá las puntas en A y B de cada tramo, uno por vez.
  2. La luz del banco se enciende: Con tu cable, uní A y B del tramo que no tiene camino.
- **Lo que aprendiste (al resolver):** Por fuera los tramos se ven iguales: la prueba de camino encuentra el corte que el ojo no ve.
- **Comprensión buscada:** Una cubierta sana puede esconder un conductor cortado. La continuidad se mide con la fuente apagada; midiendo tramo por tramo se encuentra dónde falta el camino.
- **Pista observable:** Lumen dejó una nota: «No culpes al vidrio antes de seguir el cobre».
- **Acción posible:** Encendé la luz del banco. Uno de los tres tramos esconde un corte y tenés un solo cable para puentearlo. Lumen no deja reparar a ciegas: quiere ver la medición que muestra dónde está el corte.
- **Comprobación pedida:** Lumen quiere ver, con la mesa apagada, la prueba de camino que falla justo en el tramo cortado.
- **Primera ayuda:** Por fuera los tres tramos son iguales. Mirarlos no alcanza: hay que preguntarle al cobre.
- **Descubrimiento (solución):** Luz del banco: La luz se sostiene, clara y pareja.
- **Consecuencia:** diálogo `workshop_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Luz del banco: No responde. Todo permanece quieto. |
| sin el cable s2a↔s2b | no | Luz del banco: No responde. Todo permanece quieto. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |

### El cerrojo que escucha (`gate`)

- **Objetivo en pantalla:** Que el cerrojo avance → con fuerza firme.
- **Pasos y qué se puede tocar:**
  1. Empuja hacia la marca de avance →: El sentido depende de por dónde entra la corriente a la bobina. Tocá sus cables para retirarlos y tendelos de nuevo.
  2. Con fuerza firme: ni tiembla ni golpea: La fuerza la da el freno de la bobina: probá de a una posición.
- **Lo que aprendiste (al resolver):** El sentido de la corriente decide hacia dónde empuja el cerrojo; el freno decide con cuánta fuerza.
- **Comprensión buscada:** El pestillo de este cerrojo es un imán: por eso el sentido de la corriente en la bobina decide si lo empuja o lo atrae. Una bobina que sólo mueve hierro atrae igual con cualquier sentido. La resistencia en serie regula la fuerza sin cambiar el camino.
- **Pista observable:** Las marcas del cerrojo dicen AVANCE →. Su pestillo es un imán, y ahora golpea hacia atrás.
- **Acción posible:** Hacé que el cerrojo avance hacia la marca → con fuerza firme. Podés mover los dos cables de la bobina y girar su freno. Sentido y fuerza son dos cosas distintas.
- **Primera ayuda:** El encargo tiene dos partes: hacia dónde empuja y con cuánta fuerza. Conviene resolverlas por separado.
- **Descubrimiento (solución):** Bobina del cerrojo: El cerrojo avanza sin golpear y deja libre el paso.
- **Consecuencia:** diálogo `gate_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Bobina del cerrojo: Se mueve hacia atrás, contra la marca de avance. |
| sin el cable latchIn↔trimB | no | Bobina del cerrojo: No responde. Todo permanece quieto. |
| sin el cable latchOut↔negative | no | Bobina del cerrojo: No responde. Todo permanece quieto. |
| Freno de la bobina en 0 Ω | no | Bobina del cerrojo: Golpea con fuerza. El metal empieza a calentarse. |
| Freno de la bobina en 20 Ω | no | Bobina del cerrojo: Tiembla, pero no consigue sostener el movimiento. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Bobina del cerrojo al revés | no | Bobina del cerrojo: Se mueve hacia atrás, contra la marca de avance. |

### Lo que se pierde en el camino (`pump`)

- **Objetivo en pantalla:** Encontrá el empalme que pierde fuerza y puentealo.
- **Pasos y qué se puede tocar:**
  1. Vega vio en qué empalme se pierde la fuerza: Elegí “Comparar dos puntos” y apoyá las puntas en A y B de cada empalme, con la bomba andando.
  2. La bomba recibe toda la fuerza: el agua sale plena: Con tu cable, uní A y B del empalme que pierde.
- **Lo que aprendiste (al resolver):** Un empalme puede conducir y aun así comerse la fuerza: se descubre comparando sus extremos con la bomba andando.
- **Comprensión buscada:** Un empalme puede tener continuidad y aun así perder tensión y calentarse bajo carga. Comparar los extremos de cada tramo con la carga trabajando localiza la pérdida.
- **Pista observable:** La rueda del generador gira, pero la bomba apenas impulsa agua. Uno de los empalmes está tibio.
- **Acción posible:** Devolvele la fuerza a la bomba. Uno de los tres empalmes pierde tensión cuando la bomba trabaja y tenés un cable para puentearlo. Vega quiere ver, con la bomba en marcha, en cuál se pierde.
- **Comprobación pedida:** Vega quiere ver, con la bomba trabajando, la comparación de los dos extremos del empalme que pierde.
- **Primera ayuda:** Los tres empalmes conducen: la prueba de camino diría que sí en los tres. La pérdida es otra cosa.
- **Descubrimiento (solución):** Bomba del manantial: Gira sin golpes. El agua sale pareja.
- **Consecuencia:** diálogo `pump_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Bomba del manantial: Se esfuerza, pero apenas mueve el agua. / La línea: Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde. |
| sin el cable e2a↔e2b | no | Bomba del manantial: Se esfuerza, pero apenas mueve el agua. / La línea: Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Bomba del manantial al revés | no | Bomba del manantial: Gira al revés de lo marcado: empuja hacia el otro lado. |

### Dos luces, un refugio (`distribution`)

- **Objetivo en pantalla:** Que enfermería y cocina tengan cada una su propio camino.
- **Pasos y qué se puede tocar:**
  1. Enfermería con luz plena: Cada luz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −». Tocá un cable para retirarlo y tendelo de nuevo.
  2. Cocina con luz plena: La cocina también necesita su propia ida y su propia vuelta, sin pasar por la enfermería.
  3. Ivara vio la enfermería encendida con la cocina aislada: Ivara quiere verlo: aislá la cocina con su llave y mirá si la enfermería sigue encendida.
- **Lo que aprendiste (al resolver):** En paralelo, cada luz tiene su propio camino: se puede aislar una sin apagar la otra.
- **Comprensión buscada:** En paralelo, los servicios comparten los dos nodos de la fuente. Cada rama funciona de manera independiente; se puede aislar una falla sin interrumpir las otras.
- **Pista observable:** El archivo está aislado desde el patio. Los dos servicios sanos todavía se iluminan poco.
- **Acción posible:** Enfermería y cocina deben brillar a pleno, cada una por su cuenta. Tenés tres cables; los soldados son de la instalación. Ivara lo comprobará aislando la cocina.
- **Comprobación pedida:** Ivara quiere verlo antes de reabrir: la enfermería encendida mientras la cocina está aislada.
- **Primera ayuda:** Seguí el camino con el dedo: para volver a la fuente, la enfermería atraviesa la cocina.
- **Descubrimiento (solución):** Enfermería: La luz se sostiene, clara y pareja. / Cocina: La luz se sostiene, clara y pareja.
- **Consecuencia:** diálogo `distribution_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Enfermería: Hay un brillo débil. Apenas ilumina. / Cocina: Hay un brillo débil. Apenas ilumina. |
| sin el cable clinicOut↔negative | no | Enfermería: No responde. Todo permanece quieto. / Cocina: La luz se sostiene, clara y pareja. |
| sin el cable kitchenIn↔positive | no | Enfermería: La luz se sostiene, clara y pareja. / Cocina: No responde. Todo permanece quieto. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |

### La paciencia del invernadero (`irrigation`)

- **Objetivo en pantalla:** Repartí la línea: raíces, riego y horno, sin que el cable se caliente.
- **Pasos y qué se puede tocar:**
  1. Raíces tibias: las hojas se abren: Girá el freno del calor de a una posición y mirá las raíces.
  2. El riego sale parejo: Girá el freno del agua hasta que el riego salga parejo.
  3. Yesca puede forjar: El horno necesita fuerza para que Yesca pueda forjar.
  4. El cable de la ladera no se calienta: Si el cable de la ladera sigue caliente, alguien tiene que ceder: probá frenar un poco el horno.
- **Lo que aprendiste (al resolver):** Una línea compartida tiene un límite: lo que toma uno, no lo toman los otros. Elegir un reparto es decidir quién cede.
- **Comprensión buscada:** La potencia eléctrica se transforma en calor o trabajo. Una línea compartida tiene un límite: lo que toma una rama no lo toman las otras. Hay más de un reparto que funciona; elegir uno es decidir quién cede.
- **Pista observable:** Las hojas se repliegan con el calor. El agua golpea la tierra demasiado fuerte.
- **Acción posible:** Tres frenos y un solo cable de la ladera. Encontrá un reparto en el que las raíces estén tibias, el riego salga parejo y Yesca pueda forjar, sin que el cable se caliente. Hay más de un acuerdo posible.
- **Primera ayuda:** Cada freno cuida una sola cosa. El cable de la ladera, en cambio, lo sienten los tres.
- **Descubrimiento (solución):** Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Gira sin golpes. El agua sale pareja. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes.
- **Consecuencia:** diálogo `irrigation_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Lecho de raíces: El lecho está caliente. Las hojas se encogen. / Bomba de riego: Gira a los golpes. El agua sale demasiado fuerte. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. / El tendido de la ladera: El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder. |
| Freno del calor en 0 Ω | no | Lecho de raíces: El lecho está caliente. Las hojas se encogen. / Bomba de riego: Gira sin golpes. El agua sale pareja. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. / El tendido de la ladera: El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder. |
| Freno del calor en 24 Ω | no | Lecho de raíces: El lecho empieza a entibiarse; todavía le falta. / Bomba de riego: Gira sin golpes. El agua sale pareja. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. |
| Freno del agua en 0 Ω | no | Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Gira a los golpes. El agua sale demasiado fuerte. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. / El tendido de la ladera: El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder. |
| Freno del agua en 24 Ω | no | Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Casi alcanza: el agua sale, aunque sin fuerza pareja. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. |
| Freno del horno en 0 Ω | no | Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Gira sin golpes. El agua sale pareja. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. / El tendido de la ladera: El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder. |
| Freno del horno en 18 Ω | no | Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Gira sin golpes. El agua sale pareja. / Horno de Yesca: El horno apenas entibia el hierro. Así Yesca no puede trabajar. |
| Bomba de riego al revés | no | Lecho de raíces: El lecho está tibio. Las hojas vuelven a abrirse. / Bomba de riego: Gira al revés de lo marcado: empuja hacia el otro lado. / Horno de Yesca: El horno ruge parejo. Yesca puede forjar a tandas grandes. |

### I · El pulso del Faro (`beacon_supply`)

- **Objetivo en pantalla:** Dale fuerza al núcleo sin recalentar los tendidos.
- **Pasos y qué se puede tocar:**
  1. El núcleo sostiene su pulso: Aflojá el regulador del generador para darle fuerza al núcleo, y mirá qué le pasa al tendido norte.
  2. Ningún tendido se calienta: Un solo tendido no alcanza. Con tus dos cables sumá el tendido sur: uno junto al generador y otro junto al núcleo.
- **Lo que aprendiste (al resolver):** Dos tendidos lado a lado se reparten la corriente: cada uno lleva la mitad y se calienta mucho menos.
- **Comprensión buscada:** Dos conductores en paralelo se reparten la corriente: cada uno lleva la mitad y se calienta mucho menos. Así la carga recibe más tensión sin castigar el tendido.
- **Pista observable:** Por debajo del piso, los cables esperan como raíces dormidas. Uno está tibio; el otro, suelto.
- **Acción posible:** El núcleo debe sostener su pulso sin que ningún tendido se caliente. Con un solo tendido no alcanza. Hay un tendido sur sin conectar y dos cables en la mano.
- **Primera ayuda:** Aflojar el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte.
- **Descubrimiento (solución):** Núcleo de alimentación: El pulso se sostiene sin sacudidas.
- **Consecuencia:** diálogo `beacon_supply_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Núcleo de alimentación: Casi se sostiene; le falta un poco de fuerza. / Tendido norte: El cobre se está calentando demasiado. Así no puede sostenerse. |
| sin el cable lineBa↔positive | no | Núcleo de alimentación: Casi se sostiene; le falta un poco de fuerza. / Tendido norte: El cobre se está calentando demasiado. Así no puede sostenerse. |
| sin el cable ballastA↔lineBb | no | Núcleo de alimentación: Casi se sostiene; le falta un poco de fuerza. / Tendido norte: El cobre se está calentando demasiado. Así no puede sostenerse. |
| Regulador del generador en 0 Ω | no | Núcleo de alimentación: Empuja un poco de más. |
| Regulador del generador en 5 Ω | no | Núcleo de alimentación: Casi se sostiene; le falta un poco de fuerza. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Núcleo de alimentación al revés | sí | Núcleo de alimentación: El pulso se sostiene sin sacudidas. |

### II · Tres voces en la torre (`beacon_network`)

- **Objetivo en pantalla:** Que luz, giro y campana tengan cada una su propio camino.
- **Pasos y qué se puede tocar:**
  1. La cámara óptica brilla: Cada voz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −», sin atravesar a las otras. Tocá los cables que pasan de una a otra para retirarlos.
  2. La cúpula gira: Cada voz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −», sin atravesar a las otras. Tocá los cables que pasan de una a otra para retirarlos.
  3. La señal de la costa suena: Cada voz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −», sin atravesar a las otras. Tocá los cables que pasan de una a otra para retirarlos.
- **Lo que aprendiste (al resolver):** En paralelo, cada voz recibe la misma tensión y toma la corriente que necesita.
- **Comprensión buscada:** Tres resistencias diferentes en paralelo reciben la misma tensión y conducen corrientes distintas. La corriente de la fuente es la suma de las corrientes de sus ramas.
- **Pista observable:** Una inscripción: «Que ninguna voz tenga que atravesar a las otras para llegar al mar».
- **Acción posible:** Luz, giro y campana deben funcionar cada una por su cuenta, sin atravesar a las otras. Tenés cuatro cables; los soldados son de la torre.
- **Primera ayuda:** Seguí los caminos: la corriente de la campana atraviesa la luz y el giro antes de volver.
- **Descubrimiento (solución):** Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula gira sin detenerse. / Señal de la costa: El pulso se sostiene sin sacudidas.
- **Consecuencia:** diálogo `beacon_network_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Cámara óptica: Hay un brillo débil. Apenas ilumina. / Giro de la cúpula: La cúpula apenas consigue moverse. / Señal de la costa: Tiembla, pero no consigue sostener el movimiento. |
| sin el cable negative↔opticOut | no | Cámara óptica: No responde. Todo permanece quieto. / Giro de la cúpula: La cúpula gira sin detenerse. / Señal de la costa: El pulso se sostiene sin sacudidas. |
| sin el cable bearingIn↔positive | no | Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula apenas consigue moverse. / Señal de la costa: El pulso se sostiene sin sacudidas. |
| sin el cable bearingOut↔negative | no | Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula apenas consigue moverse. / Señal de la costa: El pulso se sostiene sin sacudidas. |
| sin el cable positive↔signalIn | no | Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula gira sin detenerse. / Señal de la costa: No responde. Todo permanece quieto. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Giro de la cúpula · 36 Ω al revés | no | Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula gira al revés de lo marcado. / Señal de la costa: El pulso se sostiene sin sacudidas. |
| Señal de la costa · 72 Ω al revés | sí | Cámara óptica: La luz se sostiene, clara y pareja. / Giro de la cúpula: La cúpula gira sin detenerse. / Señal de la costa: El pulso se sostiene sin sacudidas. |

### III · La luz que sabe volver (`beacon_lens`)

- **Objetivo en pantalla:** Alimentá la lente desde la toma del divisor y calibrala.
- **Pasos y qué se puede tocar:**
  1. Nereo anotó cuánto baja la toma con la lente: Elegí “Comparar dos puntos” y compará «Toma intermedia» con «Retorno −»: una vez así y otra con la lente conectada a la toma.
  2. La lente da una luz dorada y estable: Con el cable de la lente en la «Toma intermedia», girá el freno de la lente hasta que la luz sea dorada.
- **Lo que aprendiste (al resolver):** Al conectar una carga, la toma del divisor baja: por eso se calibra con la lente puesta.
- **Comprensión buscada:** La carga cambia un divisor: la lente y el brazo inferior quedan en paralelo. Calibrar con la carga conectada permite obtener la tensión que el sistema necesita en funcionamiento.
- **Pista observable:** La lente devuelve una luz blanca, demasiado dura. El mar espera una luz que pueda sostenerse.
- **Acción posible:** La lente debe dar una luz dorada y estable desde la toma del divisor. Tenés que mover su cable y calibrar el freno con la lente conectada. Nereo quiere anotar cuánto cambia la toma al conectarla.
- **Comprobación pedida:** Nereo quiere dejar escrito cuánto cambia la toma al conectar la lente: medila sin la lente y con la lente.
- **Primera ayuda:** La lente está unida directo a «Fuente +». El divisor está listo, pero nadie toma de su toma intermedia.
- **Descubrimiento (solución):** Cristal del horizonte: La luz es dorada y se sostiene. Ya no encandila.
- **Consecuencia:** diálogo `beacon_lens_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Cristal del horizonte: La luz blanca encandila; el cristal se calienta. |
| sin el cable lensIn↔tap | no | Cristal del horizonte: No responde. Todo permanece quieto. |
| Freno de la lente en 6 Ω | no | Cristal del horizonte: La luz blanca encandila; el cristal se calienta. |
| Freno de la lente en 36 Ω | no | Cristal del horizonte: La luz apenas atraviesa el cristal. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Cristal del horizonte · 24 Ω al revés | no | Cristal del horizonte: Responde en el sentido contrario al marcado. |

