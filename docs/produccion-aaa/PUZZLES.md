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

- **Comprensión buscada:** Un empalme puede tener continuidad y aun así perder tensión y calentarse bajo carga. Comparar los extremos de cada tramo con la carga trabajando localiza la pérdida.
- **Pista observable:** La rueda del generador gira, pero la bomba apenas impulsa agua. Uno de los empalmes está tibio.
- **Acción posible:** Devolvele la fuerza a la bomba. Uno de los tres empalmes pierde tensión cuando la bomba trabaja y tenés un cable para puentearlo. Vega quiere ver, con la bomba en marcha, en cuál se pierde.
- **Comprobación pedida:** Vega quiere ver, con la bomba trabajando, la comparación de los dos extremos del empalme que pierde.
- **Primera ayuda:** Los tres empalmes conducen: la prueba de camino dice que sí en los tres. La pérdida es otra cosa.
- **Descubrimiento (solución):** Bomba del manantial: Gira sin golpes. El agua sale pareja.
- **Consecuencia:** diálogo `pump_complete` y restauración en el mundo.

| Intento equivocado | ¿Resuelve? | Lo que dice el banco |
|---|---|---|
| estado inicial | no | Bomba del manantial: Se esfuerza, pero apenas mueve el agua. / La línea: Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde. |
| sin el cable e2a↔e2b | no | Bomba del manantial: Se esfuerza, pero apenas mueve el agua. / La línea: Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde. |
| atajo de Fuente + a Retorno − | no · protección | Se oyó un clic: La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió. |
| Bomba del manantial al revés | no | Bomba del manantial: Gira al revés de lo marcado: empuja hacia el otro lado. |

### Dos luces, un refugio (`distribution`)

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

