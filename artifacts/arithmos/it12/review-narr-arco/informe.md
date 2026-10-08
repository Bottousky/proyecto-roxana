# Arithmos — revisión narrativa del arco completo (caps. 1–12): qué queda alto

rev-narr-arco · 2026-10-07 · revisor independiente (subagente, sin navegador).

## Alcance, evidencia y advertencias

- **Leído:** `ARITHMOS_MASTER.md` (§4, §8, §13), `ARITHMOS_DESIGN.md` (premisa, personajes, recorrido, criterios de
  escena), `ARITHMOS_BACKLOG.json` (N2-R, N6-R, N7-R, N8-R, N9-R, N10-12), `ARITHMOS_REVIEW.md` (rev-narr-2, 4–8 y las
  revisiones de los ciclos 8 y 9 con su disposición), `ARITHMOS_STATE.md`, y los informes anteriores de rev-narr.
- **Código:** los doce capítulos (`experiments/arithmos/src/ch1` … `ch12`), escena por escena: guion
  (`say`/`think`/`choose`), interacciones (`d.interact`), menús evaluados, apariciones de la Marea y de Punto. Con
  scripts sobre el código conté: menús evaluados por escena, escenas sin `d.interact`, largo de las líneas del
  estudiante. Los números de línea son del árbol de trabajo del 2026-10-07 (HEAD `52f5ae9b` más los cambios sin
  commitear de la sesión principal en `ch6/scenes-a.js` y `ch7/scenes-*.js`, que no tocan lo que reporto).
- **Capturas mirada** (partidas reales del bot): `it12/full-tel-c9` (1.1→8.8, 844×390), `it12/full-tel-c9b` (8.7→12.8,
  844×390), `it12/c128-tel`, `it12/c12fin-watch-errores2`, `it12/c6-tel2`, `it12/c9-tel`, `it12/c81-tel`, `it12/c103-tel`,
  `it12/c114-tel5`, `it12/c114-directa`, `it12/c7-errores`.
- **No** abrí el navegador ni corrí el juego (pedido). No escuché el audio. Lo que digo del ritmo sale del código y
  de cuadros sueltos, no de una película. Nada de esto reemplaza un playtest con adolescentes.

**Severidad.** *Alta*: el paso decisivo de una escena que lleva la idea central del capítulo, o el clímax, lo da el
juego (o un menú que trae la respuesta escrita); o un hilo del arco se paga sin haberse tendido; o un criterio del
contrato (Punto personaje, la Marea) falla en un capítulo entero. *Media*: local, no rompe el arco. *Baja*: detalle.

## Qué funciona (para calibrar)

- El cap. 1 sigue siendo la referencia: cada escena tiene decisión y consecuencia, Punto actúa, la Marea es pérdida.
- Los cierres 2.8 y 3.7 ya tienen decisión; 4.1 tiene el inserto de la pizarra.
- La agencia mejoró de verdad en los ciclos 8–9: 7.5, 7.6, 8.1, 8.4, 8.5, 8.7, 8.8, 9.1, 9.2, 9.4, 9.8, 10.2, 10.3, 10.6,
  11.1, 11.4, 11.6, 12.5, 12.6 dejan probar, equivocarse y decidir cuándo alcanza.
- Punto se equivoca y se corrige solo en 2–5, 7 (7.4), 8 (8.5), 9 (9.2), 10 (10.7) y 12 (12.8).
- La promesa del nombre (1.2, `ch1/scenes.js:285`) se paga en 12.8 sin narrar el arco (`ch12/scenes-b.js:324-345`).
- El cap. 9 tiene un hilo (la sombra de Cornisa, de 8.8 a 9.1, 9.3 y 9.8) y un cierre que se anticipa y se comprueba.
- En teléfono, «ver la pizarra» permite mirar la evidencia antes de elegir.

---

## Hallazgos transversales del arco

### ARC-A1 (alta) — El deseo del protagonista y la puerta desaparecen entre 1.1 y 12.8: la última decisión no está preparada

- **Dónde.** Se tiende en `ch1/scenes.js:156` («…No hay vuelta. Por ahora.») y en las gradas (`ch1/scenes.js:1471`
  «¿Y para mí?», `:1678` «¿El que sobra es para mí?»). Se paga en `ch12/scenes-b.js:362-397`: «Una tiza que nadie
  sostiene dibuja… la puerta del primer día» (`:368`), «Aquel día no había vuelta; ahora sí» (`:369`), ¿volvés o te
  quedás? En el medio no hay ninguna línea del estudiante sobre volver, la puerta o lo que dejó: la única huella es
  `ch4/scenes-b.js:570` («Punto mira la rajadura como si fuera una puerta»). Las otras puertas son de vecinos (Oval
  `ch2/scenes.js:951`, Peldaño `ch7/scenes-a.js:168`, `ch8/scenes-a.js:254`).
- **La Ronda** (la familia de Punto) queda dormida en las gradas en 2.1 y vuelve recién en 12.8, con un fundido en las
  Terrazas (`ch12/scenes-b.js:346-357`); en el medio sólo existe como dato atípico de 11.2 (ver N11-M2). Nunca se
  pregunta por qué Punto deja a los suyos diez capítulos.
- **Problema.** Durante diez capítulos el protagonista no quiere nada propio: resuelve el problema de cada vecino. La
  puerta vuelve sola y «ahora sí» no se explica: nada de lo que hizo el jugador la trajo.
- **Por qué importa (12–16).** La última decisión del juego es sobre un deseo que el jugador no tuvo; volver o quedarse
  no pesa. El arco «llegar → pertenecer → poder volver» no se lee: se lee «un viaje de problemas con un epílogo».
- **Arreglo mínimo (sin sistemas nuevos).**
  1. La puerta como contorno de tiza en el fondo de cada capítulo (`art.doorFrame`, el mismo dibujo de 1.1 y 12.8) con
     `fade` que crece con los capítulos terminados (`g.flags`): «lo que se entiende, resiste» vale también para la
     puerta. En 12.8 no la dibuja «una tiza que nadie sostiene»: termina de aparecer porque se fue redibujando.
  2. Un latido de una línea en algunos capítulos: 2.1, el estudiante va adonde estaba la puerta («Sigue borrada.»);
     4.7 ya existe; 8.1 (Peldaño pinta √2 en su puerta, el estudiante mira la suya); 11.8 («¿Y la vuelta, se anticipa?»).
  3. Una escena breve con la Ronda en el medio (p. ej., la fiesta de 11.5 es de la Ronda, o Lino visita el depósito en
     5.1) y Punto mirándola una vez.

### ARC-A2 (alta) — La apuesta no crece: desde el cap. 5 la Marea es una brisa que corrige errores, no una amenaza, y varios capítulos terminan en un gancho en lugar de un clímax

- **Todas las apariciones.** 1.4 pérdida real. 2.5 los ceros resisten (`ch2/scenes.js:1017`). 3.1 brisa en la pizarrita
  (`ch3/scenes-a.js:116, 153`). 4.1 la escalera borroneada se redibuja al entender 4 × 3 (`ch4/common.js:57-58`) — es la
  última vez que algo del mundo está en juego y se ve. 5.1 brisa que borra una nota (`ch5/scenes-a.js:151`). 6.3 brisa
  que borra el renglón de Recta (`ch6/scenes-a.js:292`). 7.2 «La Marea se llevó entera la escalera del fondo: cien
  escalones» (`ch7/scenes-a.js:193`): dicho, nunca mostrado ni redibujado. 7.9 brisa que borra el «= 0» de Punto
  (`ch7/scenes-b.js:913`). 8.1 brisa que borra los dibujos de la prueba (`ch8/scenes-a.js:243`). 8.7 «La Marea borró el
  camino entre las casas» (`ch8/scenes-b.js:280`): dicho; en pantalla hay una cuadrícula. 9.3 brisa que borra la ola de
  Punto (`ch9/scenes-a.js:377`). **Cap. 10: ninguna.** 11.7 la Marea como columna de datos (`ch11/scenes-b.js:229`).
  12.8 «La Marea vuelve» (`ch12/scenes-b.js:236`).
- **Finales de capítulo.** El 7 termina en una restricción de una expresión racional y el gancho del 8
  (`ch7/scenes-b.js:972`); el 8 en una pregunta de Mara (`ch8/scenes-b.js:509`); el 10 y el 11 con Mara anunciando la
  idea del capítulo siguiente (`ch10/scenes-b.js:377`, `ch11/scenes-b.js:311`). Sus escenas son vecinos que traen un
  problema cada uno, frente a la pizarra.
- **Problema.** La Marea pasó a ser un corrector: borra lo equivocado y deja lo comprobado. Cumple la letra del
  criterio de escena 6, pero no amenaza nada que el jugador quiera y no sube. Cuando en 12.8 «vuelve», no hay
  acumulación que la haga temible.
- **Por qué importa.** «Lo que se entiende, resiste» queda como regla para corregir ejercicios, no como consecuencia en
  el mundo. Sin escalada, el clímax no carga (ver N12-A1) y los capítulos 7, 8, 10 y 11 se viven como guías de
  problemas con personajes (§2: «no una colección de minijuegos inconexos»).
- **Arreglo mínimo.** Al cierre del 6, 7, 8, 10 y 11 (el del 6 ya lo pide N6-R), una pasada de la Marea en el plano de
  las Terrazas con `mareaBand` de 1.4 (`ch1/scenes.js:433`; basta exportarla) que se lleva algo concreto que el capítulo
  dejó a medias y respeta lo que el jugador construyó: 7, la escalera del fondo, redibujada con el plan de Punto (lo
  que 7.2 promete en `ch7/scenes-a.js:297` y nunca muestra); 8, el camino entre las casas de 8.7; 10, la soga del pozo;
  11, Mara mide que cada noche llega un poco más alto (los datos de 11.7 pasan a ser la escalada que 12.8 retoma). Son
  cuatro o cinco planos de diez segundos con piezas que ya existen.

### ARC-M1 (media) — La evolución de Punto se detiene en el cap. 3 y reaparece, contada, en 12.8

- `flags.puntoArrow` (`ch3/scenes-b.js:481-510`) es el último cambio de estado de Punto; del 4 al 11 tiene la misma forma
  y la misma manera de expresarse. El DESIGN prevé para 7–11 «plano / curva: percibe dependencias, dibuja relaciones,
  anticipa con el jugador»; en el código Punto dibuja relaciones sólo para equivocarse (ola de 9.3, gráfico de 11.4,
  recta de 12.8) y la curva aparece por primera vez como su nombre (`ch12/scenes-b.js:342`).
- **Por qué importa.** La pregunta dramática («¿qué puede cambiar sin dejar de ser lo mismo?») la contesta Punto; si no
  cambia en el medio, el final la enuncia.
- **Arreglo.** Un acierto de Punto con una curva antes del 12 (en 9.7 reconoce su propia escalera como la que despega;
  o en 10.3 deja una estela ondulada al girar con la rueda) y ese rasgo guardado en `flags` como la flecha.

### ARC-M2 (media) — El estudiante pasa de lacónico a profesor

- Mediana del largo de las líneas del estudiante y sus pensamientos (conteo sobre el código): cap. 1, 26 caracteres;
  cap. 5, 87; cap. 8, 147; cap. 10, 180; cap. 12, 154. Líneas de más de 200 caracteres: ninguna en 1–5; 6 en el 8; 8 en el
  10; 10 en el 12 (máx. 311). Ejemplos: cuatro líneas seguidas con la prueba de los 60°, seno y coseno
  (`ch10/scenes-a.js:232-246`); cinco seguidas con familias, simetría, discontinuidad, dos asíntotas y logaritmo
  (`ch12/scenes-a.js:71-82`). Y le habla a Punto como a un alumno: «Punto, más partes, más chicas.»
  (`ch5/scenes-b.js:106`), «Punto, el exponente cuenta…» (`ch7/scenes-b.js:140`), «Punto, los números eran
  ciertos…» (`ch11/scenes-a.js:290`).
- **Por qué importa.** Cambio de personalidad del protagonista (§13) y exposición; en 844×390 una línea de 300 caracteres
  ocupa cuatro o cinco renglones sobre la escena (el subtítulo no pagina, `engine/ui.js:196-236`). El jugador lee la
  conclusión en lugar de llegar a ella.
- **Arreglo.** Tope de unos 140 caracteres por línea (partir en dos), un solo «se llama…» por escena, las definiciones a
  la Bitácora (ya están casi todas); que una de cada tres veces el estudiante le pregunte a Punto en vez de explicarle.

### ARC-M3 (media; alta donde es el paso decisivo, ver N7-A1, N10-A1, N12-A1) — Opciones que se delatan

- En los caps. 7–12 la opción correcta suele traer su propia verificación o el mecanismo mientras las otras son eslóganes,
  o es la prudente («no se sabe», «hace falta una razón», «con el largo solo no se sabe»). De unos 62 menús evaluados
  en 7–12, cerca de 30 son así. Ejemplos: `ch7/scenes-b.js:228, 243, 258, 269` (7.3b), `ch8/scenes-a.js:75, 231, 328`,
  `ch8/scenes-b.js:244`, `ch9/scenes-a.js:75`, `ch9/scenes-b.js:95, 157`, `ch10/scenes-a.js:203, 416`,
  `ch10/scenes-b.js:193, 285, 369`, `ch11/scenes-a.js:42, 244`, `ch11/scenes-b.js:237`, `ch12/scenes-a.js:150, 243, 315`,
  `ch12/scenes-b.js:146, 186, 293`.
- **Por qué importa.** En dos capítulos un chico de 13 aprende a elegir «la que trae la cuenta que cierra» o «la más
  cauta» sin pensar, y la Bitácora lo anota como «anticipaste». Es el mecanismo de decisión más usado del juego.
- **Arreglo (sólo texto).** Opciones paralelas: todas con una razón plausible, o todas desnudas («13», «16», «8»); el
  porqué va en la devolución. Que la prudente sea a veces la equivocada (9.8 ya lo hace con «No se puede saber: es otro
  día»).

### ARC-M4 (media) — Mara cierra cada capítulo anunciando el siguiente

- `ch9/scenes-b.js:337` («…Para eso hay que medir ángulos de otra manera»), `ch10/scenes-b.js:377` («Lo que pasa a
  veces… también se puede contar, pero de otra manera»), `ch11/scenes-b.js:311` («¿Y si las pusiéramos juntas…?»);
  6→7, el pensamiento nombra el título («Hay que aprender a hacer crecer los números…», `ch6/scenes-b.js:331`); 7→8,
  Peldaño dice la misma línea dos veces seguidas (`ch7/scenes-b.js:972` y `ch8/scenes-a.js:31`), y es la tercera vez
  que pregunta por la diagonal.
- **Por qué importa.** Mara enuncia la tesis antes de que el jugador la descubra (criterio 3); la costura es un índice.
- **Arreglo.** Terminar con una imagen-problema sin enunciado (el balde que sube a medias, la sombra que vuelve) y
  cortar la repetición de 8.1.

### ARC-M5 (media) — En teléfono, las decisiones sobre la pizarra se toman sin verla

- Con el panel de opciones abierto, en 844×390 la pizarra queda a 6–8 px: 2.5, la mancha del cero
  (`full-tel-c9/052`); 7.3b (`full-tel-c9/219`); 10.4 (`full-tel-c9b/069`); 11.7 (`c114-tel5/012`); 12.8
  (`full-tel-c9b/150`). «ver la pizarra» lo resuelve si se toca, pero en 7.3b, 10.4 y 12.8 la respuesta está en la
  opción y no hace falta mirar: el teléfono amplifica ARC-M3.
- **Arreglo.** Cuando la pregunta depende de la pizarra, abrir con la pizarra a la vista y el panel plegado (el estado de
  «ver la pizarra» ya existe), o poner el dato en el enunciado.

---

## Capítulo por capítulo

### Cap. 1 — ¿Están todos?

Sin hallazgos altos ni medios nuevos. Es la referencia. Para el arco: 1.1 (`ch1/scenes.js:156`) y 1.9 (`:1471, 1678`)
son las promesas que ARC-A1 tiene que pagar.

### Cap. 2 — Demasiados para marcar (N2-R)

- **N2-M1 (media) 2.4: monotonía y regla antes de actuar.** Mara dice la regla («nunca más de nueve por cuarto. Con
  diez, se atan y pasan al de al lado», `ch2/scenes.js:666`) antes de la primera carga; siguen tres cargas de 10, 5 y 14
  objetos con dos toques cada uno, unos 58 toques (`:670-683`), y la idea nueva está en la carga 2. Para un chico,
  el «me llevo uno» llega como regla que se cumple, no como problema que aparece. *Arreglo:* que el décimo suelto no
  entre y Mara reaccione ahí; después del primer canje, «guardar todos los sueltos» de una vez, como «llenar el molde»
  de 2.3.
- **N2-M2 (media) Motivos débiles sin cambio.** 2.6 «Igual se lo voy a reclamar» (`:1073`); 2.7 «Todos devolvieron lo
  que les sobraba… acaban de traer un palito más» (`:1218-1219`). *Arreglo* (el de rev-narr-2): Curva cree que Recta
  tiene «el doble»; el palito número mil lo trae el estudiante, de su tiza.
- **N2-M3 (media) Composición de 2.1.** El «14» con su anillo amarillo queda sobre la cabeza de Mara y la pizarra del
  cap. 1 ocupa el fondo (`full-tel-c9/038`); en 2.5 la mancha entre el 3 y el 2 no se ve al elegir (`full-tel-c9/052`).
  *Arreglo:* atenuar la pizarra del cap. 1 desde 2.1, correr a Mara; mancha centrada o pregunta con la pizarra a la vista.
- La Ronda y el deseo del protagonista (M12 de rev-narr-2): ver ARC-A1.

### Cap. 3 — Menos que nada (N2-R)

- **N3-M1 (media) 3.5 es un cuestionario.** Cuatro menús evaluados en una escena (`ch3/scenes-b.js:185, 233, 254, 280`)
  además de las dos interacciones. Criterio 1: a lo sumo una predicción. *Arreglo:* «¿qué otra cosa la habría dejado
  igual?» se hace en la línea (mover a Curva) y «¿qué dice la rayita del medio?» pasa a la ayuda o a la Bitácora.
- **N3-M2 (media) Motivos de 3.4 y 3.6 sin cambio.** «Recta, ¿cuánto más que nosotros tenés?» (`:44`); «Puede subir cinco
  marcas» sin razón (`:389`, `:396`). *Arreglo:* la escalera del pozo tiene cinco peldaños dibujados; al salir, el
  estudiante recibe a Punto en la mano.

### Cap. 4 — Veces (N2-R)

- **N4-M1 (media) 4.5 «Medir» es un botón repetido.** «Tocá el montón para llenar una bolsa» cuatro veces; el tamaño de
  bolsa ya está dado y el jugador no decide nada (`ch4/scenes-b.js:234-262`); la transferencia (bolsas de 4) es un menú
  (`:272`). *Arreglo:* que el jugador elija el tamaño de la bolsa y llene; el segundo tamaño es la transferencia, hecha.
- **N4-M2 (media) 4.6: tres menús evaluados seguidos** (`:329, 387, 397`), y en los tres la correcta trae la razón («No
  hay a quién darle…», «Ninguna cantidad alcanza…», «Ninguno: todo por cero da cero»). *Arreglo:* dejar uno; el gesto de
  llenar bolsas de cero ya es la evidencia.

### Cap. 5 — Partes de algo

- **N5-M1 (media) 5.8 se resuelve con un menú y una cinemática** (`ch5/scenes-b.js:361-394`), y el estudiante dice la
  regla antes de elegir («Por ciento: de cada cien…», `:362`). Es el caso que §8 no acepta, en una escena chica.
  *Arreglo:* el jugador separa él 8 de cada 10 (un toque por grupo de diez) antes del resultado; la definición, después.
- **N5-M2 (media) 5.3, 5.5 y 5.6 abren con un toque único que hace la comparación** (`ch5/scenes-a.js:350-365`,
  `ch5/scenes-b.js:85-100, 177-197`). La segunda mitad (elegir la partición común) sí es decisión. Aceptable como
  «observar», pero tres seguidas.
- **N5-B1 (baja)** El error de Punto en 5.5 lo cuenta Rampa («Punto dice que…», `ch5/scenes-b.js:84`).

### Cap. 6 — Lo que no se ve (N6-R)

- **N6-A1 (alta) Punto es un cursor.**
  - *Dónde.* Punto salta al cero y el estudiante le asigna el papel: «Punto, vos hacés de lo que hay en la caja»
    (`ch6/scenes-a.js:102-106`). En las ocho escenas sólo se mueve adonde lo pone el jugador (`placeX`,
    `ch6/scenes-a.js:42-67`) y suena dos veces (`ch6/scenes-a.js:276`, `ch6/scenes-b.js:238, 327`). No propone, no
    escribe, no se equivoca, no se corrige: es el único capítulo del 2 al 12 que no cumple el criterio 4. Los cinco
    errores son de vecinos (Recta 6.3, `ch6/scenes-a.js:250`; Cuña 6.4, `:329`; Oval 6.5, `ch6/scenes-b.js:44`; Curva 6.6,
    `:92`; Cuña 6.7, `:138`) y el estudiante los corrige a todos.
  - *Por qué importa.* En el capítulo del caso obligatorio («pasa sumando»), el jugador queda en el lugar del que ya sabe
    y corrige a los demás; el error natural («el 3 pasa con el signo que tenía») lo comete un vecino con el que no hay
    vínculo. Si lo comete Punto y se corrige, el razonamiento queda modelado por el personaje que importa, y Punto deja
    de ser cursor sin dejar de ser la x.
  - *Arreglo mínimo.* En 6.3, Punto se adelanta (como en 10.7) y escribe en amarillo x = 5 + 3 = 8; el jugador lo pone
    en el 8, los marcadores se separan, y Punto borra y reescribe (helper `puntoRewrites`, `ch5/scenes-b.js:38-44`);
    Recta queda como el que pregunta. Un primer plano de Punto al caer en el 8 de 6.1.
- **N6-M1 (media) Desfile de trucos sin necesidad.** Cuña multiplica por cero porque es «más rápido» (`:329`); Oval
  eleva al cuadrado porque «queda más lindo» (`ch6/scenes-b.js:44`). El jugador aprende que Oval es tonto, no que elevar
  es una movida natural que agrega soluciones. *Arreglo:* que cada transformación responda a una pregunta (Oval conoce
  el área de una caja cuadrada y quiere el lado), atada a los saldos del cap. 3 como pide el backlog.
- **N6-M2 (media) La lógica de la caja de 6.1.** «No la quiero abrir a la intemperie» (`ch6/scenes-a.js:96`) y la abre al
  final (`:121`). *Arreglo:* la caja está trabada o es de otro y se abre cuando llega su dueño.
- **N6-M3 (media) Puesta de diapositiva.** Dos planos para ocho escenas: la recta larga con los que hablan en los
  extremos (en 844×390 son figuras de 25 px en los bordes, `c6-tel2/012`), sin primer plano en ninguna revelación.
  *Arreglo:* un `d.shot` cercano sobre los marcadores cuando se separan o coinciden.
- **N6-M4 (media)** Falta la pasada grande de la Marea al cierre (backlog): ver ARC-A2.
- Resuelto y verificado: blancos táctiles de la recta en teléfono (`it12/c6-tel2`); 6.8 con paso inválido en mano y
  deshacer.

### Cap. 7 — Crecer (N7-R)

- **N7-A1 (alta) 7.3b es un cuestionario de cinco preguntas.**
  - *Dónde.* `ch7/scenes-b.js:195-345`. Mara pregunta y el estudiante enuncia la regla, cinco veces seguidas: producto
    (`:228`), potencia de potencia (`:243`), suma (`:258`), cociente (`:269`), cubo (`:286`). En cuatro, la correcta trae
    el mecanismo («2⁵: tres dos y dos dos más», «2³: cada 2 de 2² se va con un 2 de 2⁵») y las otras, un eslogan («tres
    por dos», «los exponentes se suman»). «desplegar» (`:212-220`) es un botón que escribe los factores solo, *después*
    de contestar; «otra capa» (`:311-331`) se toca cuatro veces y para solo en 64. Punto no aparece más que en la frase de
    Mara. Capturas: `it12/c7-errores/023`; en teléfono, `it12/full-tel-c9/219` (la pizarra no se lee, y no hace falta).
  - *Por qué importa.* Es la «clase grabada con botones» de §2 y la «plantilla educativa» de §13: el jugador no junta
    factores, elige la frase que los junta. La evidencia (`pow-product`, `pow-power`…) no distingue comprender de leer.
  - *Arreglo mínimo.* Primero desplegar: el jugador toca y cuenta los factores (la misma mecánica de contar ceros de 7.4,
    `ch7/scenes-b.js:384-419`); después elige el exponente entre números desnudos (5, 6, 9). Dejar en la escena el
    producto y la suma (el contraste) y pasar potencia de potencia y cociente a la ayuda o a la Bitácora. En el cubo, que
    el jugador diga cuándo es un cubo («ya es un cubo»; con tres capas, «es una caja de 4 por 4 por 3»).
- **N7-M1 (alta por ARC-A2) La apuesta de 7.2 no se paga.** «La Marea se llevó entera la escalera del fondo: cien
  escalones» (`ch7/scenes-a.js:193`), «Entonces la redibujamos a tu manera, Punto» (`:297`), y la escalera no vuelve a
  verse; 7.8 habla de «los mil de la escalera grande» (`ch7/scenes-b.js:789`), que es otra. El capítulo termina en 7.9.
  *Arreglo:* 7.8 termina con la escalera del fondo redibujada por duplicaciones y la pasada de la Marea que la respeta.
- **N7-M2 (media) Piezas que van solas en 7.1.** «Después tocá cada triángulo: se acomoda alrededor del centro»
  (`ch7/scenes-a.js:109-153`, `it12/c7-errores/008`): el armado que muestra que el lado es la diagonal lo hace el juego.
  *Arreglo:* marcar las cuatro esquinas del cuadrado grande y que el jugador elija dónde va cada triángulo (como 8.1).
- **N7-M3 (media) 7.7 tiene cuatro menús evaluados** (`ch7/scenes-b.js:694-698, 716-720, 750-754, 757-761`) y la esquina
  es el único lugar tocable. *Arreglo:* «¿qué le falta?» se contesta tocando (la esquina, una tira, nada); las dos
  preguntas finales (0 y −9) en una.
- **N7-M4 (media) Voces.** Mara aporta contenido («En la cuenta de Oval, x · x = 9 también daba −3»,
  `ch7/scenes-a.js:91`; «Al completar, siempre queda un cuadrado igual a un número», `ch7/scenes-b.js:748`) y el
  estudiante le explica a Punto siete veces (ARC-M2).
- **N7-B1 (baja)** Costuras 6→7 y 7→8 (ARC-M4).
- Resuelto y verificado: 7.1 vuelve a elegir filas; 7.5 elige el borde de cada tira (y en el árbol de trabajo, los
  lugares sólo se marcan si se pide ayuda); 7.6 comprueba que con cinco no se puede; Punto se equivoca y se corrige en
  7.4 (`ch7/scenes-b.js:420-430`).

### Cap. 8 — Formas (N8-R)

- **N8-M1 (alta por ARC-A2) Hilo y clímax.** El hilo que viene del 7 (√2) se cierra en la primera escena, la mejor del
  capítulo (8.1). Del 8.2 al 8.8 son siete vecinos con un problema cada uno frente a la pizarra (tejas, ventana, huerta,
  cerca, tirante, camino, sombra) y el capítulo termina en una pregunta (`ch8/scenes-b.js:509`). La Marea sólo se nombra
  en 8.7 (`:280`) y no se ve lo borrado. *Arreglo:* que el camino entre las casas sea lo que la Marea borra al empezar el
  capítulo y lo que resiste al terminar; 8.4–8.6 (huerta, cerca, tirante de la escalera nueva) se nombran como piezas
  de esa reconstrucción, una línea por escena.
- **N8-M2 (media) Piezas que van solas y paralela trazada por el juego.** En 8.2 cada punta se recorta y va sola a la
  línea (`ch8/scenes-a.js:304-321`) y la paralela la traza el juego mientras el estudiante la describe (`:336-340`); en
  8.6 los triángulos se corren solos a su único lugar (`ch8/scenes-b.js:188-212`). El jugador decide después (ángulos
  iguales, partes libres), pero el paso del argumento es del juego. *Arreglo:* en 8.2, tocar dónde va cada punta en la
  línea y tocar la punta de arriba para trazar la paralela; en 8.6, elegir la esquina de cada triángulo.
- **N8-M3 (media) Menús que delatan en los pasos de alcance.** 8.1, «No para siempre: los enteros positivos llegan a 1 y
  no bajan más» (`ch8/scenes-a.js:231-235`), que es justo lo que cierra la prueba; 8.2, «…hace falta una razón»
  (`:328`); 8.6, «…el reacomodo no usó el 3 ni el 4» (`ch8/scenes-b.js:244-248`). *Arreglo:* ARC-M3.
- Resuelto y verificado: 8.1 con elecciones reales (esquinas, partes que valen lo mismo) y Peldaño pidiendo la acción;
  Punto escribe y borra su cartel en 8.5; 8.7 elige dónde dobla; 8.8 mide en la regla.

### Cap. 9 — Depende (N9-R)

Sin hallazgos altos. El capítulo tiene un hilo (la sombra de Cornisa) y un cierre con anticipación y comprobación
(9.8). Lo que N9-R pedía está en el código: tabla a la vista y flechas al revés (9.1), regla armada por el jugador (9.2),
recta parada movida por el jugador (9.4), 9.7 sólo con puntos y escala, 9.8 a escala, la máquina de Punto dibujada,
«ver la pizarra» en teléfono (`it12/c9-tel`).

- **N9-M1 (media) Mara da el método de la recta parada antes de que el jugador actúe** («Para mirar una entrada sola,
  poné una recta parada… y contá cuántas veces corta el dibujo», `ch9/scenes-a.js:441`), y el estudiante el criterio
  (`:440`). *Arreglo:* Mara pide «mirá una entrada sola»; la recta aparece cuando el jugador toca una entrada; el método se
  nombra después.
- **N9-M2 (media)** Conclusiones de 9.5 y 9.6 con la respuesta escrita en la opción (`ch9/scenes-b.js:95-99, 157-161`),
  después de probar números (ARC-M3).
- **N9-M3 (media)** Mara cierra anunciando el cap. 10 (`ch9/scenes-b.js:337`) (ARC-M4).
- **N9-M4 (media)** La Marea sólo como brisa que borra la ola de Punto (`ch9/scenes-a.js:377`) (ARC-A2).

### Cap. 10 — Vueltas y flechas (N10-12)

- **N10-A1 (alta) 10.4 se resuelve con dos menús y el estudiante dice que el jugador hizo lo que no hizo.**
  - *Dónde.* `ch10/scenes-a.js:369-433`: no hay `d.interact`. La segunda pregunta ofrece «Unos 3,5: 4 · sen 60°, y sen 60°
    es casi 0,87» contra «la mitad» y «el doble» (`:416-420`), y la escena cierra con «Rampa, con la rueda sabés cuánto
    sube una rampa de cualquier inclinación, sin construirla: girás hasta ese ángulo y leés el alto» (`:429`): el jugador
    no giró nada. La rueda de la pizarra con su manija y su regla es de 10.2 (`wheel`, `ch10/scenes-a.js:141`; el giro
    y la tabla, `:175-190`), y la elección «girar hasta…» también (`:189-216`); en 10.4 sólo está el pozo, sin soga
    (`:374`). En teléfono, las rampas no se leen al elegir (`full-tel-c9b/069`).
  - *Por qué importa.* Es la transferencia del capítulo (la razón de la rampa es el alto de la rueda); la decisión está
    escrita en la opción y el texto le atribuye al jugador un procedimiento que no hizo.
  - *Arreglo mínimo.* Volver a dibujar la rueda de 10.2 al costado de las rampas y reemplazar el menú de los 60° por su
    elección («girar hasta 60°»): el jugador lee 0,87 en la regla y el estudiante escribe 4 · 0,87 ≈ 3,5. La predicción
    de la rampa de 30° puede quedar.
- **N10-M1 (media)** La Marea no aparece en todo el capítulo (criterio 6; ARC-A2).
- **N10-M2 (media)** 10.2: cuatro líneas seguidas del estudiante con la prueba de los 60°, el seno y el coseno
  (`ch10/scenes-a.js:232-246`) (ARC-M2).
- **N10-M3 (media)** 10.6: «Uno nuevo, que no está en la recta: el que gira un cuarto» (`ch10/scenes-b.js:193-197`)
  contesta lo que acaba de verse (ARC-M3). Mara nombra una «Terraza de las Vueltas» que nunca se presentó (`:143`, baja).
- **N10-M4 (media)** Mara cierra con la tesis del 11 (`ch10/scenes-b.js:377`) (ARC-M4).
- Resuelto y verificado: 10.2, 10.3 y 10.6 dejan decidir; Punto se adelanta y se baja solo en 10.7; el pozo es un lugar.

### Cap. 11 — Lo que pasa a veces (N10-12)

- **N11-A1 (alta) 11.7: el razonamiento que separa correlación de causa lo hace un pensamiento.**
  - *Dónde.* `ch11/scenes-b.js:216-256`: no hay interacción. El jugador elige, antes de ver el viento, entre tres opciones
    donde la correcta es la prudente («No se sabe: puede haber algo que cause las dos cosas», `:239`); Mara agrega el
    viento y el pensamiento compara por pares: «Mirando de a pares con el mismo viento: … Dentro del mismo viento, más
    polvo no trajo más borrones» (`:250`). La conclusión la dice el estudiante (`:251`).
  - *Por qué importa.* Es la idea contraintuitiva del bloque I (§7: «distinguir… una relación estadística de una
    explicación causal») y es exactamente la escena que §8 no acepta: el juego piensa por el jugador. El jugador sale con
    la frase, sin haber hecho la comparación que la justifica.
  - *Arreglo mínimo.* Cuando aparece el viento, el jugador toca los dos días de cada viento (tres pares, `rectSpot` sobre
    los puntos) y en cada par se dibuja una flecha del de menos polvo al de más: baja, baja, baja. Recién ahí la
    conclusión, dicha en una línea.
- **N11-M1 (media)** 11.3 es un menú y el estudiante calcula el rango (`ch11/scenes-a.js:172-189`). *Arreglo:* el
  jugador marca el día más bajo y el más alto de cada ayudante.
- **N11-M2 (media) La Ronda como dato atípico.** «…y la Ronda, que guarda los de todos, 34» (`ch11/scenes-a.js:121`),
  «aunque la Ronda tenga mil» (`:150`). Contradice 2.1 (Mara «guarda la tiza de todos», `ch2/scenes.js:240`) y convierte
  a la familia de Punto, que no se vio en nueve capítulos, en un valor extremo. *Arreglo:* el valor atípico es el
  depósito de Mara o la cosecha que guarda Balcón.
- **N11-M3 (media)** 11.4: Punto hace el gráfico engañoso y no se corrige; se lo explica el estudiante
  (`ch11/scenes-a.js:290`). *Arreglo:* cuando el jugador dice «así sirve», Punto redibuja él desde el cero.
- **N11-M4 (media)** Mara cierra con la pregunta del 12 (`ch11/scenes-b.js:311`) (ARC-M4).

### Cap. 12 — Anticipar (N10-12)

- **N12-A1 (alta) El clímax no pone nada en juego en pantalla y la anticipación no cambia nada.**
  - *La Marea grande no se ve.* Es sonido y una sacudida de cámara sobre la pizarra: `g.audio.marea?.(5);
    g.camera.shake = 0.3; await d.wait(2.2)` (`ch12/scenes-b.js:316-318`). No se dibuja nada que pase. La descripción
    dice lo contrario («Pasa la Marea grande, una brisa de borrador sobre las Terrazas, más alta que la escalera…»,
    `:315`): quien juega sin sonido y sin «describir acciones» ve temblar la pizarra. (La banda de 1.4 existe:
    `ch1/scenes.js:433`.)
  - *La escalera no está amenazada.* Está entera desde el cap. 4 (`ch4/common.js:57-58`, visible entera en
    `c12fin-watch-errores2/006`); «redibujamos la escalera esta noche… ¡A trabajar!» (`:311`) es un corte y el jugador no
    redibuja nada. Además contradice la regla que la misma Mara acaba de decir («lo que entendimos, la Marea no lo
    borra», `:301`): la escalera se entendió en 4.1. Y Mara le da 30 escalones (`:236`) a un dibujo que tiene cuatro
    (`ch4/art.js:12-26`).
  - *La anticipación.* La familia se elige en un menú que se repite hasta acertar (`:281-291`) y la noche, en un menú
    cuya correcta trae la cuenta («En la noche 5: 32 pasa los 30», `:293-297`). Elegir «la noche 15» lleva al mismo final
    («Hay que apurarse», `:299`).
  - *Por qué importa.* Es el final de doce capítulos y el verbo que les da título: anticipar. El jugador no anticipa nada
    que cambie el mundo, y la amenaza que justifica el viaje se oye pero no se ve.
  - *Arreglo mínimo, con piezas que existen.* (1) Que lo amenazado esté a medio redibujar: la escalera del fondo de 7.2
    o la escalera nueva de Balcón de 8.6, al costado de las Terrazas, borroneada (`fade` bajo, como la de 4.1), y el
    jugador la redibuja tocando escalones, como repasa a Lino en 1.7 (`ch1/scenes.js:1255-1259`). (2) La noche se marca
    tocando en el mapa dónde la curva cruza la raya (lugares en las noches 3 a 6, como 10.3 marca la altura): si marca
    una noche posterior a la 5, la Marea de la noche 5 se lleva los escalones que faltaban, se ve, y se vuelve a
    intentar sin castigo; si marca la 5, llegan. (3) La Marea grande con `mareaBand` cruzando las Terrazas y lo
    redibujado resistiendo, como las marcas de la piedra en 1.4. (4) Los escalones que se cuentan son los del dibujo.
- **N12-M1 (media)** 12.7 es un menú cuya correcta trae la cuenta («13: los primeros 10 a uno, los otros 6 a medio»,
  `ch12/scenes-b.js:186-190`), y la V la dibuja el juego (`:196-210`). *Arreglo:* el jugador pone en el mapa los puntos de
  12, 14 y 16 escalones (como en 9.3) y ve el quiebre en el 10.
- **N12-M2 (media)** Otras decisiones con la respuesta escrita: la perilla de las U («a = 2: dos cuadrados de 2 por 2,
  2 · 4 = 8», `ch12/scenes-a.js:150`), la caja («x = 1: donde el gráfico está más alto, 16», `:243`), el área («9: lo que
  hay debajo de la recta, un triángulo de 3 por 6, a la mitad», `ch12/scenes-b.js:146`). Para las U ya existe la perilla
  interactiva de 12.2 (`ch12/scenes-a.js:120-129`): usarla.
- **N12-M3 (media)** 12.1: cinco líneas seguidas del estudiante con definiciones (`ch12/scenes-a.js:71-82`) (ARC-M2).
  *Arreglo:* una línea; el resto ya está en la Bitácora.
- Resuelto y verificado: Punto se adelanta con una recta y la borra él (`ch12/scenes-b.js:245-275`); el nombre; la Ronda
  baila; la decisión de la puerta existe (lo que le falta es ARC-A1).

---

## Tabla de cierre

| Ítem | Criterio de aceptación | ¿Se cierra? | Por qué |
|---|---|---|---|
| **N2-R** (caps. 2–4) | Cada punto resuelto o justificado en ARITHMOS_REVIEW.md, con capturas | **No** | M4–M7, M9 y M12 siguen «Pendiente» en ARITHMOS_REVIEW.md y el código lo confirma: 2.4 igual (N2-M1), 2.6, 2.7, 3.4 y 3.6 sin motivo (N2-M2, N3-M2), composición de 2.1 y 2.5 (N2-M3). M12 (deseo del protagonista, la Ronda) es parte de ARC-A1, alta. No hay altas propias de los caps. 2–4; con los medios resueltos o justificados y ARC-A1 tendido, se cierra. |
| **N6-R** | Revisión narrativa sin hallazgos altos | **No** | N6-A1 (Punto cursor, alta) y la pasada grande de la Marea al cierre (ARC-A2). Resueltos: blancos táctiles de la recta. Quedan medios: desfile (N6-M1), caja (N6-M2), puesta (N6-M3). |
| **N7-R** | Revisión narrativa sin hallazgos altos | **No** | N7-A1 (7.3b, cuestionario) y ARC-A2 en el cap. 7 (N7-M1: la escalera de 7.2 nunca se paga; sin clímax). Resuelto: el juego ya no da el paso en 7.5 ni en 7.6; 7.1 queda medio (N7-M2). |
| **N8-R** | Revisión narrativa sin hallazgos altos | **No** | ARC-A2 en el cap. 8 (N8-M1: hilo cerrado en la primera escena, sin clímax ni Marea visible). Lo demás es medio (8.2 y 8.6 con piezas que van solas; menús de alcance). |
| **N9-R** | Revisión sin hallazgos altos | **Sí** | Todos los pasos de agencia pedidos están en el código; el capítulo tiene hilo y cierre; teléfono resuelto con «ver la pizarra». Quedan medios (N9-M1 a M4) que conviene anotar, no bloquean. |
| **N10-12** | Revisión narrativa hecha y altas corregidas | **No** | De rev-narr-8: A1 corregida en el texto, pero el clímax sigue sin consecuencia (N12-A1); A2 resuelta salvo la puerta y la Ronda sin preparar (ARC-A1); A3 parcial: quedan escenas de menú donde el juego piensa (N10-A1, N11-A1; 11.3 y 12.7 medias); A4 mitigada con «ver la pizarra» (ARC-M5, media); A5 resuelta (baldes sin ciclo, eje dicho). Además ARC-A2 (la Marea falta en el 10). |

Sugerencia de backlog: un ítem nuevo **N-ARC** para los hilos transversales (la puerta y el deseo, la Marea que crece,
Punto entre el 4 y el 11, la voz del estudiante), porque no pertenecen a ningún capítulo y hoy quedan repartidos entre
N2-R y N10-12.

## Veredicto

El arco de doce capítulos se lee como una historia completa en sus extremos y todavía no en su medio. El cap. 1
(llegada, Punto, la Ronda, la pérdida y el reencuentro), la flecha del cap. 3 y el final (Punto que se adelanta y borra
su recta, el nombre que se paga, la Ronda que baila, la puerta) forman un principio y un fin reconocibles. Entre el
cap. 4 y el 12, en cambio, no hay apuesta que crezca ni deseo del protagonista: la Marea pasa a ser una brisa que
corrige ejercicios y en el cap. 10 desaparece, el estudiante resuelve el problema de cada vecino y explica cada vez
más largo, y Punto deja de cambiar después del cap. 3. Por eso el final, bien escrito, llega sin peso: la Marea grande
se oye pero no se ve, la anticipación del jugador no cambia nada en el mundo y la puerta vuelve sin que el jugador la
haya querido. No es un problema de escenas sueltas —la agencia mejoró mucho en los ciclos 8 y 9— sino de tres hilos
(la puerta, la Marea, Punto) que hay que tender por el medio con una línea o una imagen por capítulo, de un clímax en
12.8 que haga el jugador, y de tres escenas que todavía piensan por él (7.3b, 10.4, 11.7) más Punto como cursor en el
cap. 6. Con eso resuelto, el primer arco se puede cerrar; la comprensión y el ritmo siguen sin poder certificarse sin un
playtest humano.
