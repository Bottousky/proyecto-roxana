# Arithmos — revisión narrativa, de puesta en escena y accesibilidad (caps. 10, 11 y 12: el cierre)

Revisor independiente (rev-narr-8), 2026-10-06. No abrí navegador, no corrí el juego ni scripts de partida. Trabajé
con el código, los logs de partidas automáticas y las capturas PNG que ya existían.

## Alcance, evidencia y advertencias

- **El árbol cambió mientras revisaba.**
  - Al empezar, HEAD era `40ceece`, con cambios sin commit en ch10–ch12.
  - Esos cambios entraron en `f531c7d` (19:27).
  - Después llegaron:
    - `5d83eae` (19:30): 9.7 con puntos por día. No toca la costura 9.8 → 10.1.
    - `9d89e03` (19:35): 12.1 pasa a «tocar una forma y elegir la regla en el panel».
    - `a3cc472` (19:40): sólo `main.js` y `playthrough.mjs` (márgenes de cámara en teléfono).
  - Al cerrar este informe, `ch9/scenes-a.js` (9.1–9.4) tiene un cambio sin commit. No es de mi alcance.
  - **Los números de línea son de `a3cc472`.** Para ch10–ch12 coinciden con `9d89e03`.
- **Código revisado:**
  - `ch10/`, `ch11/` y `ch12/` completos.
  - Costura de entrada: `ch9/scenes-b.js` 240–303 y `ch9/chapter.js`.
  - Cierre: `ending.js`, `ch12/chapter.js`, `title.js` 60–77 y `main.js` 228–243.
  - Contexto:
    - `ch1/scenes.js` 156, 278–285, 433 y 655–659, 1471;
    - `ch1/common.js` 180;
    - `ch3/scenes-b.js` 510 y `ch4/common.js` 83–92 (`puntoArrow`);
    - `ch5/scenes-b.js` 40 (`puntoRewrites`);
    - `ch7/scenes-a.js` 10–22 (`studentWrites`) y 187;
    - `ch7/scenes-b.js` 498;
    - `ch9/scenes-a.js` 259–275.
- **Partidas** (todas de un bot, no de personas):

  | Carpeta (`artifacts/arithmos/…`) | Tamaño | Código | Para qué la usé |
  |---|---|---|---|
  | `it09/c10-directa2`, `c10-errores` | 1600×900 | anterior a `f531c7d` | lo visual que no cambió; tiene capturas a mitad de escena |
  | `it09/c11-directa`, `c11-errores2` | 1600×900 | anterior a `f531c7d` (11.7 tenía otros datos) | ídem |
  | `it10/c12-directa`, `c12-errores` | 1600×900 | anterior a `f531c7d` (cambió el texto de 12.8, no su dibujo) | el cierre con la Marea (029–034) |
  | `it10/fix2-c10-*`, `fix2-c11-*`, `fix2-c12-*` | 1600×900 | `f531c7d` | texto actual; cruzan las costuras 10→11 y 11→12; sólo capturan inicio y elección |
  | `it10/guard-c9` | 1600×900 | `5d83eae` | **la única que cruza la costura 9→10** (captura 016) |
  | `it10/tel-c10`, `tel-c11`, `tel-c12` | 844×390 táctil | `f531c7d` | teléfono; 12.1 viejo |
  | `it10/tel2-c12`, `c121-dir`, `c121-err` | 844×390 / 1600×900 | `9d89e03` | 12.1 nuevo |

  Las carpetas `it10/fix-c10 c10.rueda-*` arrancaron desde el cap. 1 y no llegaron al 10, así que no sirven.
- **Ritmo.** Los logs muestran qué se dice y en qué orden, no el ritmo. El bot recorre el cap. 12 entero en
  24–31 s.
- **Medidas.** Medí los tamaños a ojo, sobre las capturas y sobre recortes ampliados ×2 y ×4 (hechos con `sips` en
  mi carpeta temporal).
- **Lo matemático.** No repito lo que ya marcaron rev-mat-9 (`it10/review-mat/`) y rev-mat-10
  (`it10/review-mat-11-12/`). Lo cito sólo cuando cambia la lectura narrativa, y digo si sigue en el código.

## Qué funciona (para calibrar)

- **Una red de ecos con cuentas coherentes.** El final de Arithmos se apoya en todo el viaje:
  - la sombra de Cornisa (10.3: «Se parece a tu sombra en que vuelve, pero no es la misma regla»);
  - el tirante (10.2);
  - las copias de Cornisa (10.4);
  - la media vuelta × (−1) del pozo del cap. 4 (10.6);
  - el −4 de Oval (10.6);
  - las escaleras de Mara y de Punto, la huerta x · x y el reparto 1 ÷ (x − 2), todos en 12.1;
  - la caja (12.4);
  - la distancia al cero del pozo (12.7);
  - los 4 de 6 baldes de 10.8, que vuelven en 11.1;
  - el salto de Punto, de 12.3 a 12.5.
- **Seis gestos con decisión de verdad:**
  - 10.1: poner pedazos de soga hasta que el séptimo se pasa; el jugador decide cuándo parar, y el hueco queda en
    azul;
  - 10.5: elegir dos flechas, con una nota específica si no llegan;
  - 10.7: tocar el par que cumple las dos pistas;
  - 11.8: clasificar entre «exacto» y «sólo lo probable»;
  - 12.2: las perillas;
  - 12.3: tocar los ceros y el máximo.
- **La mejor imagen del arco de Punto.** En 12.3 Punto recorre su propio salto sobre el mapa
  (`ch12/scenes-a.js:158`). Es exactamente «el punto que termina recorriendo gráficos».
- **Una familia que usa el resultado: Rampa en 11.6.**
  - Tiene una creencia: «Yo voy siempre al 12, que es el más grande».
  - La pone a prueba con la tabla y con 360 tiradas.
  - Cambia de conducta sin exagerar: «Me paso al 7. Aunque el 12 puede salir igual: no es imposible, es raro».
  - Es el modelo para las demás escenas.
- **El error de Punto en 11.4 es el error del capítulo:** un gráfico de barras que no empieza en cero. Y la brisa se
  lleva el gráfico tramposo, que es la premisa bien aplicada.
- **Límites dichos con naturalidad:**
  - «Eso lo vimos, no está garantizado» (11.1);
  - «Pero son pocos días» (11.7);
  - «con cuatro noches no se puede estar seguro… Lo anotamos como suposición» (12.8).
- **10.8 premia la prudencia.** La opción buena es «No se sabe seguro; lo más probable, llena». Es lo contrario de
  lo que hacía 9.8 (M4 de rev-narr-7).
- **Menús bien hechos:**
  - 10.2: la correcta es la más corta, y la incorrecta trae una razón verosímil («30 es un tercio de 90»);
  - 12.4a: los dos órdenes, con el mismo largo;
  - 11.6.
- **La tarjeta final resume la premisa en cinco palabras:** «Lo que se entiende, resiste».
- **Lo que se corrigió:**
  - las costuras ya no muestran «El capítulo N todavía se está dibujando» (`guard-c9`, `fix2-*`);
  - el rótulo «(−3, −1)» de 10.6, que en `c10-directa2/022` se mezclaba con los números del eje, ahora se lee
    (`fix2-c10-directa/012`);
  - los botones superpuestos de 12.1 en teléfono (`tel-c12/summary.json`) ya no están en `tel2-c12`.

## ¿Repiten los caps. 10–12 los problemas de rev-narr-7?

| Problema (rev-narr-7) | En los caps. 10–12 | Dónde |
|---|---|---|
| Plantilla; nada se acumula; sin clímax | **Sí.** 32 escenas seguidas abren con el mismo encuadre (9.1–12.8). Hay un clímax, pero no decide nada | A1, A3 |
| El juego da el paso decisivo; botón único | **Sí:** 9 escenas de botón único y 3 que son sólo un menú | A3 |
| Texto que contradice la imagen | **Sí,** en la tesis del 10 y del 11, y en el final | A1, A5 |
| Tamaños en teléfono | **Sí, en todas las elecciones.** Ahora también a 1600×900 | A4 |
| Punto sin error propio ni corrección | **Peor:** no se equivoca en el 10 ni en el 12, y en el 11 no se corrige | A2 |
| Marea sin apuesta | **Igual o peor:** no aparece en el 10, y en el 12 borra lo medido | A1, M2 |
| Vocativos | **Peor:** 24 de 27 líneas (antes, 10 de 12) | M1 |
| Mara cierra con el temario del capítulo siguiente | **Sí,** en el 10 y en el 11 | M1, M3 |
| Opciones que se delatan | **Sí:** 10 de 22, más 3 que ya están contestadas en pantalla | M5 |
| Hablante fuera de cuadro; sin primer plano | **Sí** | M7 |
| `studentWrites` mudo; amarillo para todo | **Sí:** 23 escrituras mudas | M6 |
| Bitácora como boletín, con contador | **Sí;** hay un contador en el 12 | M8 |
| Costura 9→10 (M6 de rev-narr-7) | **Sin cambios** | M3 |
| Aviso «Anotado en la Bitácora» y Ø | **Sí** | B1, B2 |

---

## Hallazgos ALTOS

### A1. El cierre no cierra: 12.8 deja la pregunta sin respuesta, la Marea grande borra lo medido y el final es una tarjeta de capítulo más

- **Dónde:**
  - Código: `ch12/scenes-b.js:178–252`, `ch12/chapter.js:12–13`, `ending.js:6–21`, `title.js:70–77` y
    `main.js:228–243`.
  - Capturas: `it10/c12-directa/028–034`, `it10/fix2-c12-directa/014–017`, `it10/tel-c12/033` e
    `it10/tel2-c12/020`.
- **Qué:**
  1. **La pregunta del cierre no se contesta.**
     - Mara pregunta: «¿Llegamos a terminar de redibujar?» (`:194`).
     - Nadie redibuja: ni el jugador, ni los ayudantes de Rampa de 11.3, ni el precio por escalón de 12.7. Esas dos
       escenas parecían preparar justamente este momento.
     - El estudiante dice «tenemos hasta la quinta» (`:227`) y en la línea siguiente pasa «la Marea grande»
       (`:236–242`), sin noches de por medio.
     - La predicción nunca se pone a prueba: la noche 4 no llega a confirmar el 16. El estudiante dice «miramos cada
       noche si se cumple», y el juego no mira ninguna.
  2. **La Marea grande borra lo medido y deja la suposición.**
     - El borrado usa `/^c12-(n\d|top|topl)$/` (`:240`): se lleva los cuatro puntos medidos (1, 2, 4 y 8) y la raya
       «escalera: 30».
     - Queda la curva que eligió el jugador (`c12-fit`). En `c12-directa/033` sólo hay ejes y curva.
     - Es lo contrario de 9.3, donde la ola inventada se borra y los puntos medidos quedan
       (`ch9/scenes-a.js:271–275`).
     - También contradice la línea del estudiante dos renglones antes: «Lo anotamos como suposición».
     - El describe dice que «la escalera, la pizarra y las cuentas entendidas quedan» (`:237`). Lo único que
       representaba la escalera en la pizarra era la raya, y la raya se borra. Después Mara dice «La escalera sigue
       ahí» (`:245`).
  3. **La Marea grande es más chica que la del cap. 1.**
     - En 1.4 la Marea tiene una banda de borrador propia (`mareaBand`, `ch1/scenes.js:433`), un plano propio
       (`SHOTS.marea`) y 7,5 s de sonido (`:655–659`).
     - En el clímax hay `SHOTS.board`, una sacudida de 0,3, 5 s de sonido y el fundido de seis objetos chicos.
     - No se ven ni las Terrazas ni la escalera.
  4. **En el clímax, el jugador sólo elige en dos menús.**
     - El primero, la familia (`:208–218`), se repite hasta acertar.
     - El segundo, la noche (`:220–224`), se contesta leyendo un cruce que ya está dibujado: en
       `fix2-c12-directa/016` la curva corta la raya del 30 justo en la noche 5.
     - Las perillas que el diseño ponía en 12.8 («elegir la familia y las perillas») no están.
     - En teléfono, los cuatro puntos sobre los que se elige la familia miden ≈ 3 px (`tel2-c12/020`; ver A4).
  5. **El final es un trámite.**
     - `chapterCard(d, g, 'Arithmos', 'Lo que se entiende, resiste.')` usa la misma rutina, cámara, sonido y espera
       que las once tarjetas de fin de capítulo.
     - Después habla el narrador: «Fin. Tu Bitácora queda guardada…» (`ch12/chapter.js:13`). La última frase del
       juego es un aviso de guardado.
     - Después vuelve el título con «Volver a jugar el capítulo 12» (`c12-directa/034`). Tras una partida completa
       serían doce botones así (`title.js:70–77` con `main.js:230`). Esto lo leí en el código; no hay captura.
     - `g.flags.gameDone` (`:251`) no lo lee nadie.
  6. **La escalera cambió de tamaño.** En 12.8, «La escalera grande tiene 30» (`:194`). En el cap. 7 la escalera del
     fondo tenía cien escalones (`ch7/scenes-a.js:187`) y Mara hablaba de «los mil de la escalera grande»
     (`ch7/scenes-b.js:498`).
- **Por qué importa:**
  - Contrato §7: «El cierre debe integrar lo anterior en la capacidad de interpretar y anticipar».
  - Contrato §4: un arco con cierre.
  - El diseño de 12.8: «Las Terrazas se salvan; Punto recorre el gráfico adelantándose; fin».
  - Criterios 1 y 5, y la premisa del mundo («lo comprendido resiste»).
  - Es lo último que el jugador recuerda del juego.
- **Propuesta** (reversible, con piezas que ya existen):
  - **Dos reglas en el mismo mapa,** como las escaleras de 9.7:
    - la Marea: 1, 2, 4 y 8;
    - lo que se redibuja por noche: los ayudantes de 11.3 («A hace 5 por día»), con la tiza que cobra Rampa en 12.7
      como límite.
    - La pregunta pasa a ser: «¿Alcanzamos a redibujar la escalera antes de que la Marea llegue arriba?».
  - **Anticipar antes de ver.** Antes de que se dibuje ninguna curva, el jugador toca en el mapa dónde va a estar la
    Marea en la noche 4 y en la 5. Recién después elige la familia y se dibuja la curva. Así la predicción no se lee
    en la pizarra: se hace.
  - **Las perillas de 12.2 para el redibujo:** cuántos ayudantes llamar (a) y desde cuántos escalones ya hechos (b).
    Es la decisión que cambia el mundo.
  - **Que llegue la noche 4.** Aparece un punto nuevo, en 16 (o en 15, y la suposición se revisa: «casi»). Así no
    hace falta que el estudiante diga «miramos cada noche»: se ve.
  - **La Marea grande con la banda del cap. 1 y un plano de las Terrazas** (`SHOTS.terr`, `ch4/common.js:33`):
    - borra lo descartado: la recta y la ola que no pasaban por los puntos;
    - deja los puntos medidos y la escalera redibujada, que se ve entera en el plano general.
  - **Una tarjeta final propia:**
    - otra cámara (de la pizarra a la puerta del cap. 1) y otra música;
    - sin «Fin. Tu Bitácora queda guardada»;
    - después, un título que muestre que el juego terminó (por ejemplo, «Volver a recorrer» y la Bitácora), no doce
      botones.
  - **Unificar la escalera:** cien, mil o explicar que es otra.
- **Cómo comprobarlo:**
  - una captura de 12.8 después de la Marea con los puntos medidos todavía en la pizarra;
  - una acción del jugador anterior al dibujo de la curva;
  - un plano de apertura o de cierre que no sea `board` ni `tiles`;
  - una captura de la tarjeta final;
  - un log del final sin «Fin. Tu Bitácora queda guardada».

### A2. El arco de Punto se cuenta en vez de mostrarse, y las promesas del cap. 1 quedan sin pagar

- **Dónde:**
  - Código: `ch12/scenes-b.js:231–248`, `ch12/scenes-a.js:142–158`, `ch11/scenes-a.js:204–251`,
    `ch10/scenes-b.js:43–92`, `ch1/scenes.js:156`, `285` y `1471`, y `ch4/common.js:88` con `ch3/scenes-b.js:510`.
  - Capturas: `it10/c12-directa/033` e `it10/tel-c12/033`.
- **Qué:**
  1. **El arco se cuenta, y la imagen lo contradice.**
     - La última línea del juego la dice el estudiante: «Punto: al principio eras un punto que contaba. Después
       tuviste un lado para ir, una flecha. Ahora corrés por un gráfico, un paso adelante.» (`:246`).
     - Pero `follow(p, s)` (`:243`) ya devolvió a Punto al lado del estudiante. En `c12-directa/033` y
       `tel-c12/033` Punto está quieto al lado del estudiante, y la curva está sola en la pizarra.
     - Además, el subtítulo del estudiante empieza con «—» y el vocativo lleva dos puntos. La línea se lee
       «—Punto: …», como si hablara Punto (ver M1).
  2. **Punto casi no actúa.**
     - En 16 de las 24 escenas no hace nada.
     - En otras 4 sólo late con un sonido: 10.6, 10.8, 11.7 y 11.8.
     - En 10.5 lo mueve el jugador.
     - Lo único que hace por su cuenta son tres cinemáticas: el gráfico tramposo (11.4), recorrer su salto (12.3) y
       correr por la curva de la Marea (12.8).
  3. **No se equivoca en el 10 ni en el 12, y en el 11 no se corrige él** (criterio 4):
     - Lo presenta Cornisa: «Punto hizo un gráfico» (`:204`).
     - Las barras aparecen de golpe: `barP` agrega la figura sin `d.draw` (`:210–212`), aunque el describe dice
       «Punto dibuja dos barras» (`:217`).
     - El jugador toca «desde cero», la brisa borra y el estudiante le explica a Punto qué pasó (`:251`).
     - Punto pasa de triste a contento en 1,2 s (`:241–249`).
  4. **No anticipa nunca.**
     - El diseño lo describe como «Plano / curva: dibuja relaciones, anticipa con el jugador», y en 12.8 como «el
       punto que… termina recorriendo gráficos, adelantándose».
     - En 12.8 corre después de que el jugador contestó (`:231–235`). No se adelanta a nadie.
  5. **Su dibujo se quedó en el cap. 3.**
     - La última evolución visual es `p.arrow = !!g.flags.puntoArrow` (`ch4/common.js:88`).
     - No hay ningún flag de Punto en los caps. 10–12. En `fix2-c12-directa/state.json` sólo están los `c12*`,
       `gameDone` y `chapterDone`.
  6. **Las promesas del cap. 1 quedan sin pagar:**
     - «Te voy a decir Punto. Hasta que me digas cómo te llamás.» (`ch1/scenes.js:285`). No vuelve nunca.
     - «…No hay vuelta. Por ahora.» (`:156`) y «¿Y para mí?» (`:1471`). El final no dice si el estudiante se queda
       o vuelve.
     - La Ronda, la familia de Punto, aparece en el 11 como una barra de 34 atados «que guarda los de todos»
       (`ch11/scenes-a.js:112`), y no está en el final.
  7. **«Eras un punto que contaba» no es lo que pasó.** En el cap. 1 contaba el estudiante; Punto marcaba («Punto
     no sabe qué es "doce"»). El resumen además se saltea al Punto que escribe (cap. 2).
- **Por qué importa:**
  - Contrato §4: el acompañante cambia cómo percibe, se expresa y se relaciona; el arco necesita un cierre.
  - Criterios 4 y 7.
  - El diseño: «Cierre del arco de Punto».
  - Es la sexta revisión que pide que Punto se corrija solo.
- **Propuesta:**
  - **Que Punto se adelante de verdad en 12.8.**
    - Antes de que el jugador elija, Punto corre por donde él cree que va a ir la Marea: por ejemplo, una recta.
      Ese es su error («sube parejo»).
    - El primer punto nuevo, el de la noche 4, lo desmiente.
    - Punto borra su recta y la rehace duplicando, con `puntoRewrites` (`ch5/scenes-b.js:40`). Es el «se corrige
      solo» del último capítulo, y el jugador decide si la segunda curva sirve.
  - **Mostrar en vez de decir.**
    - Sacar la línea del estudiante.
    - En un solo plano, Punto recorre los rastros de su viaje que la Marea no borró: la marca del cap. 1, el 14 del
      cap. 2, la flecha del pozo y la curva.
    - Si el estudiante dice algo, que sea la pregunta del cap. 1: «¿Ya me vas a decir cómo te llamás?». Punto
      contesta dibujando: su anillo o un nombre con su letra.
  - **Una decisión del estudiante sobre sí mismo:** volver a la puerta del cap. 1, que ya está dibujada
    (`art.doorFrame`, `ch1/common.js:180`), o quedarse. Punto se adelanta y llega a la puerta antes.
  - **La Ronda en la última imagen,** bailando en el plano general como en 1.10.
  - **Un flag de Punto por capítulo** (`g.flags.puntoGraph`, `puntoAhead`), y un cambio en su último estado: por
    ejemplo, que deje una estela curva en lugar de la flecha.
- **Cómo comprobarlo:**
  - una acción de Punto que el jugador no ordenó, en el cap. 10 y en el 12;
  - un `describe` de Punto borrando y rehaciendo;
  - en la última captura, Punto en otro lugar que al lado del estudiante;
  - el log del final sin «al principio eras un punto que contaba»;
  - en el cap. 12, «llamás» o un gesto equivalente.

### A3. La misma plantilla en 24 escenas: 22 menús evaluados, gestos de un botón y un mundo que nunca sale de la pizarra

- **Dónde:**
  - Las 24 escenas empiezan con `d.shot(SHOTS.board, 1)`.
  - Entre ch10 y ch12 hay 48 llamadas a `board` o `tiles`, y a ningún otro plano.
  - Con el cap. 9, son 32 escenas seguidas con la misma apertura (9.1–12.8). Es la misma pizarra vacía en
    `c10-directa2/001`, `guard-c9/016`, `fix2-c10-directa/017`, `fix2-c11-directa/016` y `c12-directa/028`.
- **Qué:**
  - **La misma secuencia en todas las escenas:**
    1. Una familia o Mara trae un problema.
    2. Plano `tiles`.
    3. Un menú.
    4. Un gesto.
    5. El estudiante concluye, con vocativo.
    6. `studentWrites`.

    Cada escena limpia la pizarra (`clean(g, /^c1x-/)`), así que nada se acumula: ni la rueda de 10.1 llega a
    10.2.
  - **22 menús evaluados en 24 escenas** (8 en el 10, 7 en el 11 y 7 en el 12). El cap. 10 tiene exactamente uno
    por escena.
  - **Nueve escenas se resuelven con un solo botón,** que se toca una o varias veces y no deja decidir cuándo parar:
    - 10.2: «girar 30°», tres veces;
    - 10.3: «una vuelta más», dos veces;
    - 10.6: «girar un cuarto», dos veces;
    - 10.8: «subir el balde», seis veces;
    - 11.1: «hasta 10», «hasta 100», «hasta 1000»;
    - 11.4: «desde cero»;
    - 11.6: «tirar 360 veces»;
    - 12.5: «tramo más corto», tres veces;
    - 12.6: «más fino», dos veces.
  - **Tres escenas piden tocar todos los botones, y el que calcula es el juego:** 11.2, 11.6 («marcar») y 12.4. El
    hint de 11.2 dice «Calculá los dos» (`ch11/scenes-a.js:126`).
  - **Tres escenas son sólo un menú:** 10.4, 11.3 y 12.7. El clímax (12.8) son dos menús y una cinemática.
  - **Siete gestos con decisión real** de 24 escenas: 10.1, 10.5, 10.7, 11.8, 12.1, 12.2 y 12.3.
  - **El lugar del cap. 10 no existe.**
    - El diseño lo sitúa en «el pozo de las Terrazas con su rueda y su balde».
    - Fuera de la pizarra nunca se dibujan pozo, rueda, balde ni soga.
    - Todo es texto: «Ato el balde a la manija» (`ch10/scenes-a.js:126`), «Punto, traeme la soga»
      (`ch10/scenes-b.js:43`), «Con la soga nueva» (`:287`), el botón «subir el balde» (`:294`).
    - Los caps. 11 y 12 tampoco salen de la pizarra.
  - **El ritmo no alterna.** No hay escenas de descanso, de humor o de emoción que rompan el molde. Las excepciones
    son líneas sueltas: Rampa y el 12 en 11.6, los sombreros de Cornisa en 11.5.
- **Por qué importa:**
  - Contrato §4: cada escena necesita un propósito dramático, y hay que alternar.
  - Contrato §8: no aceptar escenas que se resuelvan pulsando continuar; diferenciar observar, intentar y confirmar.
  - Contrato §13: buscar «momentos que parezcan una plantilla educativa».
  - Criterios 1 y 2.
  - Es la sexta revisión seguida que lo marca.
- **Propuesta:**
  - **Un lugar por capítulo, fuera de la pizarra,** al menos al abrir y al cerrar:
    - el pozo con su rueda en 10.1, 10.2 y 10.8: la manija gira de verdad, y el balde se ve subir lleno o a medias;
    - la fiesta de la escalera en 11.5 y 11.6: los dados se tiran en la fiesta;
    - las Terrazas de noche en 12.8.
  - **Juntar escenas de un solo botón:**
    - 10.2 + 10.3: girar la rueda y ver crecer la ola en un solo gesto continuo (arrastrar la manija, o ← → como
      alternativa);
    - 12.5 + 12.6: una escena de «qué tan rápido y cuánto se junta» con el mismo pozo.
  - **Cambiar los botones únicos por decisiones:**
    - 10.2: el jugador elige el ángulo (30°, 45°, 60°, 90°) y predice la altura antes de girar;
    - 12.5: el jugador elige el tramo y decide cuándo alcanza;
    - 11.1: el jugador decide cuántos baldes subir y cuándo dejar de subir.
  - **Un gesto en las tres escenas de sólo menú:**
    - 10.4: dibujar la rampa de 6 con la regla;
    - 11.3: marcar el peor día de cada ayudante;
    - 12.7: ubicar los 16 escalones en el gráfico de la tarifa.
  - **Usar `close` y `wide`** (ya existen en `ch7/common.js:15–16`) en los descubrimientos: el hueco azul de 10.1,
    i · i = −1 y el cruce de la Marea con el 30.
  - **A lo sumo cinco menús evaluados por capítulo.**
- **Cómo comprobarlo:**
  - al menos tres aperturas distintas por capítulo en la partida directa;
  - cinco o menos `evaluate: true` por capítulo;
  - ningún `wordSpot` único tocado más de dos veces seguidas;
  - una captura del pozo con su rueda.

### A4. Las decisiones se toman sobre gráficos que no se leen (a 1600×900 y, peor, en teléfono)

- **Dónde y qué** (tamaños medidos sobre las capturas):
  - **A 1600×900**, los menús que se abren antes de `d.shot(SHOTS.tiles)` muestran la pizarra a 470–570 px de
    ancho. Son los de 10.1, 10.2, 10.4, 11.1, 11.4, 11.6, 11.7 y 12.3. Por ejemplo:
    - 11.4 (`c11-directa/012`): el «96», que es lo que decide la respuesta, mide ≈ 7 px; «Mara» y «Punto», ≈ 8 px;
    - 11.7 (`fix2-c11-directa/014`): «borrones» y «polvo» ≈ 8 px; los seis puntos, ≈ 6 px; los ejes no tienen
      números;
    - 10.4 (`c10-directa2/013`): «largo 2» y «sube 1» ≈ 8 px;
    - 10.1 (`c10-directa2/002`): «un rayo» ≈ 8 px.
  - **A 844×390** (`tel-c10`, `tel-c11`, `tel2-c12`), en todas las elecciones el panel ocupa más de la mitad de la
    pantalla y la pizarra queda a 90–290 px de ancho. Pasa incluso en las escenas que antes pasaron por `tiles`:
    - 11.7 (`tel-c11/028`): la pizarra mide ≈ 90 px; el gráfico de dispersión no se ve;
    - 11.4 (`tel-c11/012`): la pizarra mide ≈ 130 px; se ven las barras, no el 96;
    - 10.4 (`tel-c10/014`): las rampas son rayitas;
    - **12.8, la decisión del clímax** (`tel2-c12/020`): la pizarra mide ≈ 210 px, los cuatro puntos medidos ≈ 3 px
      y «escalera: 30» ≈ 4 px. Se elige la familia de la Marea sin ver los puntos;
    - 12.6 (`tel2-c12/016`): las sumas 6; 7,5 y 8,7 no se leen;
    - 12.1 nuevo (`tel2-c12/003`): cada forma mide ≈ 80 px; los nombres ya puestos, ≈ 3 px.
  - **Durante los gestos, en teléfono,** el subtítulo de tres renglones tapa la base del mapa de 10.7
    (`tel-c10/027`).
  - **10.7 a 1600×900** (`fix2-c10-directa/014`): desde que la corrección matemática de `f531c7d` sacó las rectas,
    los pares que suman 7 son puntitos blancos de ≈ 10 px que se confunden con los cruces de la cuadrícula (ver M6).
- **Por qué importa:**
  - Contrato §3: «ejes y etiquetas deben distinguirse sin esfuerzo».
  - Contrato §9: verificar la disposición táctil.
  - Criterio 8.
  - El cap. 11 enseña a «mirar dónde empieza el eje», y el 12 que «un gráfico se lee». Pero en la pantalla donde se
    decide, el gráfico no se lee.
  - Es la quinta revisión seguida (A4 de rev-narr-7).
- **Propuesta:**
  - Ningún menú sobre un gráfico fuera de `tiles`: mover `d.shot(SHOTS.tiles, 0.8)` antes del `choose` en esas ocho
    escenas.
  - En pantallas bajas, dos opciones:
    - el panel de elecciones en una columna lateral o en un renglón, con la cámara encuadrando el gráfico (no la
      pizarra entera) en el espacio que queda;
    - o las opciones como blancos sobre el mismo gráfico.
  - Un mínimo de 12 px para todo rótulo que intervenga en una decisión, medido en la captura de la elección. Que la
    guarda que ya detecta botones tapados también mida eso.
  - 10.7: volver a unir cada fila con una línea punteada fina, diciendo «los de en medio no son atados», como pedía
    rev-mat-9. O usar formas distintas (círculo y cruz).
- **Cómo comprobarlo:** capturas de elección de 11.4, 11.7 y 12.8 a 844×390, con los rótulos de 12 px o más y los
  puntos visibles.

### A5. Imagen y tesis se contradicen justo en las costuras de los caps. 10 y 11, y en otros cinco lugares

- **10.8: los baldes siguen un patrón** (`ch10/scenes-b.js:272`):
  - la secuencia es llena, llena, a medias, llena, llena, a medias;
  - en pantalla se lee un ciclo de tres, con «a medias» en amarillo en el 3 y en el 6 (`fix2-c10-directa/016`);
  - la escena viene justo después de 10.3, donde el jugador aprendió que lo que se repite se puede anticipar;
  - la respuesta buena («lo más probable, llena») coincide con el patrón: se puede acertar por periodicidad, que es
    justo lo que la escena quiere desarmar;
  - la línea de Mara que cierra el capítulo opone «lo que se repite» a «lo que pasa a veces», sobre una lista que se
    repite;
  - rev-mat-9 ya lo había marcado, y sigue igual.
- **11.1 y 11.4: el capítulo que enseña a desconfiar de los ejes usa uno logarítmico sin decirlo.**
  - El eje de 11.1 es logarítmico (`ch11/scenes-a.js:50`; en `c11-directa/004`, 1, 10, 100 y 1000 están a la misma
    distancia).
  - Tres escenas después, el estudiante dice «Si las barras no empiezan en cero, el alto no compara cantidades» y
    escribe «mirar dónde empieza el eje».
  - Es M2 de rev-mat-10, y sigue igual.
- **11.4:**
  - el describe dice «Punto dibuja dos barras» (`:217`), y las barras aparecen de golpe;
  - la brisa se lleva también los nombres «Mara» y «Punto» (el regex de `:246`), y el gráfico bueno queda sin decir
    de quién es cada barra (`c11-directa/014`).
- **10.7:** el pensamiento dice «Mara anota sólo los números de cada pista» (`ch10/scenes-b.js:262`), pero el que
  camina a la pizarra y escribe es el estudiante (`studentWrites`, `:260–261`).
- **12.1:** Mara dice «Dibujé cinco formas» (`ch12/scenes-a.js:43`) sobre la pizarra vacía (`c12-errores/002`). Las
  formas aparecen después.
- **12.7:** el estudiante dice «La distancia al cero… Un solo gráfico, dos reglas» (`ch12/scenes-b.js:168`), y la V
  no se dibuja.
- **12.8:** ver A1 (la escalera que «sigue ahí» se borra) y A2 (la última línea dice que Punto corre, y Punto está
  quieto).
- **Por qué importa:**
  - Criterios 5 y 8.
  - Contrato §2: «una metáfora visual debe aclarar una propiedad sin inventar otras».
  - Contrato §7 I: «distinguir una regularidad observada de una garantía».
  - Los dos primeros casos tocan la tesis de su capítulo, en el momento de la costura.
- **Propuesta:**
  - 10.8:
    - una secuencia sin ciclo visible, también con 4 llenos de 6, por ejemplo llena, a medias, llena, llena, llena,
      a medias;
    - y que el balde se vea subir (ver A3).
  - 11.1: dos opciones:
    - un eje común, lineal de 1 a 1000, con el tramo de 1 a 10 ampliado en un recuadro;
    - o decirlo en la pizarra: «cada marca, diez veces más baldes».
  - 11.4: Punto dibuja sus barras con `d.draw` y, después del error, las vuelve a dibujar él desde cero (ver A2).
    Los nombres quedan.
  - 10.7: «El estudiante anota…», o que escriba Mara.
  - 12.1: que Mara diga la línea después de dibujar las formas, o mientras las dibuja.
  - 12.7: la V en un recuadro chico, al lado.

---

## Hallazgos MEDIOS

### M1. Voces: «—Nombre:» hace que el estudiante parezca otro personaje; el estudiante da clases y Mara cierra con el temario siguiente

- **Dónde y qué:**
  - **El formato confunde quién habla.**
    - De las 27 líneas del estudiante en los tres capítulos, 24 empiezan con un vocativo seguido de dos puntos.
    - En el subtítulo, el estudiante no tiene rótulo, y su línea empieza con «—».
    - Resultado: «—Cornisa: la ola se repite…», «—Rampa: con la misma inclinación…», «—Punto: los números eran
      ciertos…». Se lee como si hablara el nombrado (`c10-directa2/010` y `015`, `c11-directa/014`,
      `c12-directa/033`).
    - Con Punto, que no habla, es confuso. En la última línea del juego, además, es el cierre.
  - **Clases magistrales:**
    - Las líneas del estudiante llegan a unos 375 caracteres (12.1, `ch12/scenes-a.js:69`). Otros ejemplos:
      - 10.1, unos 270: 2π, π, diámetro, y «π no es una fracción… lo de √2»;
      - 12.5, unos 290: derivada y tangente;
      - 12.6, unos 300: integral, y «al revés de la derivada».
    - Define por decreto: «Se lo llama 2π», «se le dice seno… coseno», «le decimos i», «se llama rango», «que se
      llama mediana», «se llama derivada», «se llama tangente», «Eso se llama integral», «es una función por
      tramos».
    - Les explica a las familias su propio problema: «Rampa: tu precio es una función por tramos»
      (`ch12/scenes-b.js:168`).
  - **Mara cierra y adelanta:**
    - cierra el 10 y el 11 con el temario del capítulo siguiente (`ch10/scenes-b.js:319`,
      `ch11/scenes-b.js:272`);
    - abre el 12 con el trabajo ya hecho: «Dibujé cinco formas»;
    - el criterio 3 dice que Mara «no define ni cierra»;
    - es la quinta vez del gancho con temario (M6 de rev-narr-7).
  - **Las familias casi nunca usan el resultado.**
    - La excepción, muy buena, es Rampa en 11.6 (`ch11/scenes-b.js:159`).
    - No reaccionan Balcón en 10.1, Cornisa en 10.3, ni Rampa en 10.4, 11.3, 12.2 y 12.7.
  - **Personajes de relleno:**
    - Peldaño está al lado de la pizarra en 10.6, 11.2, 11.7, 12.1, 12.4 y 12.8, y no dice nada.
    - Oval sigue de segunda mano (10.6: «¿Y lo de Oval…?», `ch10/scenes-b.js:188`).
- **Por qué importa:**
  - Contrato §4: no un profesor omnisciente; un guion que no infantilice ni sermonee.
  - Criterio 3.
  - Es la cuarta revisión que lo marca, y empeoró: de 10 de 12 vocativos a 24 de 27.
- **Propuesta:**
  - Como mucho tres vocativos por capítulo.
  - Cuando haya vocativo, sin dos puntos («Mirá, Cornisa, …»). O darle al estudiante un rótulo propio en el
    subtítulo, para que no se confunda con el nombrado.
  - Líneas de 160 caracteres como máximo; lo demás, en `studentWrites` o en «Desplegar».
  - Una reacción de la familia en cada escena.
  - Las palabras nuevas, escritas debajo de lo que hizo el jugador, sin «se llama».
  - El gancho de fin de capítulo, en boca de alguien que no sea Mara y sin el contenido siguiente. En 10.8 alcanza
    con un balde que llega a medias y nadie lo explica.

### M2. La Marea: no aparece en el 10, se contradice en el 11 y es chica en el 12

- **Dónde y qué:**
  - **Cap. 10:** no aparece (criterio 6).
  - **Cap. 11:**
    - En 11.4, la brisa borra el gráfico tramposo después del veredicto: confirma, no hace decidir. Es M2 de
      rev-narr-7, sin cambios.
    - En 11.7 la Marea pasa a ser un dato. Mara cuenta «cuántos renglones borró la Marea», y la conclusión es que
      «el que acompaña a los borrones parece el viento» (`ch11/scenes-b.js:191–212`).
    - Eso choca con la premisa («Lo que nadie entiende, el borrador se lo lleva») y con 12.8 («lo que entendimos,
      la Marea no lo borra», `ch12/scenes-b.js:228`). El juego no dice cómo conviven el viento y la comprensión.
  - **Cap. 12:**
    - El clímax, ver A1.
    - «La Marea vuelve» (`:194`), pero estuvo en todos los capítulos.
    - «Y mientras, redibujamos lo que todavía no se entiende» (`:228`): si la Marea se lleva lo que no se entiende,
      redibujarlo sin entenderlo no lo salva. La frase confunde la tesis justo cuando debería quedar más clara.
- **Propuesta:**
  - **En 10.3 o 10.8, una pasada del borrador** que se lleve una tabla de alturas copiada de memoria y deje la ola
    dibujada desde la rueda, o al revés. Después, el jugador reconstruye una altura.
  - **En 11.7, que Mara diga qué se borró esas noches:** renglones que nadie había entendido. El viento sólo trae
    la Marea más seguido: «El viento la trae; lo que se lleva es lo que no se entiende».
  - **En 12.8:** «redibujamos y explicamos lo que todavía no se entiende». O, mejor, que el jugador elija qué
    redibujar primero (ver A1).

### M3. Costuras: 9→10 sin cambios, y en 10→11 y 11→12 Mara se contesta sola

- **9→10** (`guard-c9`, log y captura 016):
  - **Qué falla:**
    - Mara cierra con «la rueda del pozo da vueltas. Para eso hay que medir ángulos de otra manera»
      (`ch9/scenes-b.js:303`). Es el temario de 10.1.
    - La rueda no se vio nunca. 10.1 abre con la pizarra vacía, y la rueda es un dibujo en la pizarra
      (`c10-directa2/001`, `002`).
  - **A favor:**
    - ya no sale «El capítulo 10 todavía se está dibujando»;
    - 10.3 retoma la sombra de Cornisa, un buen eco.
- **10→11** (`fix2-c10-directa/017`):
  - **Qué falla:**
    - La lista de los seis baldes de 10.8 se borra (`g.world.clear()`, `ch11/scenes-a.js:32`), y 11.1 la retoma
      sólo de palabra.
    - El gráfico de 11.1 empieza con otra secuencia: llena, llena, a medias, a medias, llena, llena (`pulls` con
      semilla 7, `logic/chance.js:6`). También son 4 de 6, pero no son los baldes que el jugador vio.
    - Mara adelanta el capítulo.
  - **A favor:** Balcón y su balde siguen, y la pregunta de 11.1 sale de lo que pasó.
- **11→12** (`fix2-c11-directa/016`):
  - Mara pregunta «¿Y si las pusiéramos juntas…?» (`ch11/scenes-b.js:272`), y en 12.1 contesta ella misma:
    «Juntemos las reglas del viaje».
  - 11.8 ya había clasificado la escalera de Mara, la de Punto y la rueda; 12.1 vuelve a empezar con las mismas.
  - Lo que pasa a veces (el cap. 11) no entra en el cierre, salvo la línea prudente de 12.8.
- **En las tres costuras,** el aviso «Anotado en la Bitácora (≡)» queda sobre la apertura del capítulo siguiente
  (`guard-c9/016`, `fix2-c10-directa/017`, `fix2-c11-directa/016`).
- **Propuesta:**
  - 9.8 termina con la imagen de la rueda (como proponía M6 de rev-narr-7), y 10.1 abre en el pozo.
  - 10.8 termina con un balde que llega a medias, sin que nadie lo explique; 11.1 abre con la misma lista.
  - 11.8 termina con Punto juntando la escalera, la rueda y el balde, y dudando con el balde. 12.1 abre con esa duda,
    no con Mara.
  - Ocultar el aviso antes de la tarjeta.

### M4. Cuentas que no coinciden entre escenas (criterio 5)

- **Balcón:** tiene 3 atados en 10.7 («Cornisa 4, Balcón 3», `ch10/scenes-b.js:241`) y 5 en 11.2
  (`ch11/scenes-a.js:112`).
- **La escalera grande:** 1000 escalones en el cap. 7, 30 en 12.8 (ver A1).
- **La soga:**
  - es del pozo de Balcón (10.1);
  - Rampa le pide a Punto que se la lleve a su casa (10.5);
  - en 10.8, «con la soga nueva, la rueda gira derecha»;
  - no se entiende quién la tiene ni para qué la quiere Rampa.
- **Los baldes:** los seis de 10.8 y los primeros seis de 11.1 no son la misma secuencia (ver M3).
- **La Ronda «guarda los de todos»** (11.2):
  - si guarda los atados de todos, los cuenta dos veces;
  - y es la familia de Punto, que en el resto del juego no tiene atados.
- **11.3:** «4 seguros», «siempre» y «nunca», con cinco días (`ch11/scenes-a.js:163`, `174`, `179`; Bitácora en
  `ch11/scenes-b.js:288`).
  - Es M3 de rev-mat-10, y sigue igual.
  - En lo narrativo, contradice lo que el estudiante dijo dos escenas antes: «Eso lo vimos, no está garantizado».
- **Propuesta:**
  - Balcón con 3 en 11.2, recalculando promedio y mediana.
  - Una sola escalera.
  - Para la soga: «Rampa: traeme un pedazo de soga para mi rampa», con la soga dibujada.
  - En 11.1, los mismos seis baldes de 10.8 al principio.
  - La Ronda con sus propios atados, o cambiarla por otra familia.
  - En 11.3, «casi seguro».

### M5. Opciones que se delatan, o que ya están contestadas en pantalla

- **La correcta es la más larga y trae el método** en 10 de los 22 menús evaluados:
  - 10.4;
  - 10.6, que además repite el verbo del botón: «el que gira un cuarto»;
  - 10.7;
  - 11.1;
  - 11.4: «Hay que mirar dónde empiezan las barras» es directamente la instrucción;
  - 11.5;
  - 11.7;
  - 12.4: «3 o −3: con el 9 solo no se sabe»;
  - 12.6: dos renglones contra uno (`c12-directa/021`);
  - 12.7.
- **La respuesta ya está a la vista** en tres:
  - 10.3: el punto de 390° está dibujado (`c10-directa2/009`), y la opción «No se sabe: no la pusimos» es falsa a la
    vista;
  - 12.3: antes de preguntar, Cornisa dice «tarda 6 en volver al piso» (`ch12/scenes-a.js:142`);
  - 12.8: el cruce con el 30 está dibujado (`fix2-c12-directa/016`).
- **Opciones de paja:**
  - «Más que 1: siguió girando», con un gráfico que nunca pasa de 1;
  - «En la noche 15, sumando de a dos», después de haber elegido «duplica»;
  - «No: Punto mintió con los números». Además pinta a Punto como mentiroso, y la escena no vuelve sobre eso.
- **Para imitar:** 10.2, 12.4a y 11.6.
- **Por qué importa:**
  - Una elección que se gana por la forma de las opciones mide lectura de menús (contrato §5).
  - Es M4 de rev-narr-7.
- **Propuesta:**
  - Opciones del mismo largo, todas con una razón verosímil.
  - Preguntar antes de dibujar: en 10.3, por los 390° antes de la segunda vuelta; en 12.8, antes de la curva.
  - Sacar las opciones de paja.

### M6. Accesibilidad

- **`studentWrites` sigue mudo** (`ch7/scenes-a.js:10–22`). Ninguna de las 23 escrituras de los caps. 10–12 llega
  al lector de pantalla. Entre ellas:
  - «i · i = −1»;
  - «360° = 2π radianes»;
  - «a + b = 7», «a − b = 1» y «→ (4, 3)»;
  - las filas de la matriz;
  - «juntas ≠ una causa la otra»;
  - «× 2 + 1 ↔ − 1, ÷ 2» y «x · x ↔ √ (si x ≥ 0)».

  Es la sexta revisión que lo marca.
- **12.1 (HEAD):**
  - los blancos dicen «La forma 1» … «La forma 5» (`ch12/scenes-a.js:57`), sin decir qué forma es cada una;
  - quien no ve tiene que recordar el orden del `describe` inicial;
  - un acierto no se describe: sólo aparece un rótulo.
- **10.7:** desde que se sacaron las rectas, las filas de pares se distinguen sólo por el color: blanco, amarillo y
  después azul (`ch10/scenes-b.js:220`, `224`, `253`). Contrato §3 y §9.
- **El amarillo de Punto sigue en todo:**
  - la barra del ayudante B (11.3);
  - la bufanda «roja» (11.5, `ch11/scenes-b.js:49`);
  - las máquinas de Mara (12.4);
  - la raya de la escalera y la curva de la Marea (12.8);
  - la ola de 10.3;
  - los «a medias» de 10.8.
- **12.3:** los aciertos (cero y máximo) no tienen `describe`. El rótulo de cada blanco ya trae la altura: está bien
  para el lector de pantalla, pero dice la respuesta.
- **Propuesta:**
  - `studentWrites` llama a `d.describe('El estudiante escribe: …')` con una versión leíble.
  - Blancos con descripción: «La forma 3: una curva cortada en dos».
  - En 10.7, formas distintas para cada fila.
  - El amarillo, sólo para Punto.

### M7. Composición: el que habla queda fuera de cuadro, los descubrimientos no tienen primer plano y hay rótulos pisados

- **El estudiante, cortado por el borde izquierdo mientras habla:** `c10-directa2/010`, `c11-directa/014`,
  `c12-directa/008`. Es M7 de rev-narr-7, sin cambios.
- **Sin primer plano en los descubrimientos:**
  - el hueco azul de 10.1, que mide ≈ 15 px (`c10-directa2/003`);
  - i · i = −1;
  - el cruce de la Marea con el 30.
- **Rótulos pisados:**
  - 11.2: la raya «del medio 4» pasa por encima de los números de las barras (`c11-directa/006`);
  - 12.3: «cero», «t» y Punto se pisan sobre el 6 (`c12-directa/008`);
  - 10.5: Punto tapa la casa de Rampa (`c10-directa2/017`; es una captura anterior, pero la posición no cambió en
    el código).
- **Propuesta:**
  - El plano `tiles` corrido para que entre el que habla, o el estudiante parado en el borde de la pizarra.
  - `close` en esos tres descubrimientos.
  - Separar los rótulos.

### M8. Bitácoras: sin historia, atribuyen de más y no hay una página de cierre

- **Ningún ítem de historia en las tres:** ni la soga, ni el gráfico de Punto, ni la Marea grande, ni Punto
  corriendo.
- **Atribuyen de más:**
  - 11.2, si el jugador eligió «Los dos…»: «elegiste el del medio, 4» (`ch11/scenes-b.js:286`);
  - 11.3, si eligió «Cualquiera…»: «pensaste en el otro» (`:288`);
  - 12.5, si eligió «A 3,99»: «…aunque con tramo cero no se pueda dividir» (`ch12/scenes-b.js:266`), una razón que
    el jugador no dio.
- **Un contador:** «una la probaste en otra familia primero» (`ch12/scenes-b.js:260`).
- **Una palabra vieja:** la Bitácora del 10 dice «las rectas son paralelas» (`ch10/scenes-b.js:343`), y la escena
  ahora dice «filas».
- **No hay página de cierre:** ninguna entrada junta el viaje, y 12.8 no es un momento que se pueda desplegar (en el
  cap. 12 sólo lo es 12.3).
- **Por qué importa:** criterio 10, y contrato §8 (repetir los momentos importantes).
- **Propuesta:**
  - Entre 3 y 5 ítems por Bitácora, al menos dos de historia.
  - Un texto por rama: «elegiste…» sólo para lo que el jugador eligió.
  - Sin contadores.
  - Una entrada final que junte el viaje con los dibujos que la Marea no borró, uno por capítulo, y 12.8 como
    momento.

### M9. El 12.1 nuevo: «esta forma» no se marca, y el último emparejamiento es un botón único

- **Dónde:** `ch12/scenes-a.js:52–68` (`9d89e03`); capturas `c121-dir/002–006` y `tel2-c12/003`.
- **Qué:**
  - El jugador toca una forma y aparece «¿Qué regla del viaje tiene esta forma?», pero la forma tocada no queda
    marcada.
  - El último emparejamiento es un menú de una sola opción: en `c121-dir/006` sólo está «huerta x · x». Criterio 2.
  - Con descarte, los dos últimos salen solos.
  - El gesto de emparejar quedó convertido en cinco menús seguidos.
- **Propuesta:**
  - Marcar la forma tocada, con un recuadro o con `close`.
  - Que la última se ubique sola, con un describe. O, mejor, cinco reglas para siete formas (las del diseño
    agregan la V y la curva que se aplana), así no hay descarte.

---

## Hallazgos BAJOS

- **B1. El aviso «Anotado en la Bitácora (≡)»** aparece sobre la apertura del capítulo siguiente (M3) y sobre el
  título final (`c12-directa/034`).
- **B2. Cero barrado:** «1Ø», «1ØØ», «3Ø» (`c11-directa/004`, `c12-directa/031`).
- **B3. «Como en el capítulo de la caja»** (`ch12/scenes-a.js:240`): el estudiante piensa en capítulos, y eso rompe
  la ficción. Mejor «como con la caja de Mara».
- **B4. «Punto salta de alegría»** (`ch12/scenes-a.js:142`), sin motivo. Mejor que salte por algo: llegó un balde
  lleno, creció la escalera.
- **B5. Nombres nuevos sin presentar:** «la Terraza de las Vueltas» (`ch10/scenes-b.js:135`) y «la canilla del pozo»
  (`ch12/scenes-b.js:86`).
- **B6. 12.6:** «¿Cuánta agua juntamos?», si el agua sale del pozo, ¿dónde se junta? Mejor nombrar el recipiente: la
  pileta de Balcón.
- **B7. Tres «Anticipar»:** se llaman igual la escena 11.8, el cap. 12 y la escena 12.8.
- **B8. 10.5 dice lo mismo pase lo que pase:** el estudiante dice «el camino cambia, (pero) el destino no» elija lo
  que elija. Quien pensó «a otro lugar» no recibe una línea que reconozca su idea.
- **B9. El título final:** ofrece «Volver a jugar el capítulo 12»; tras una partida completa serían doce botones
  (ver A1).

## Qué no pude verificar

- **Audio:** no escuché nada (la Marea, los sonidos de Punto, la tiza).
- **Ritmo y actuación:** sólo vi cuadros sueltos y logs de un bot que corre el cap. 12 entero en 24–31 s. No hay
  video. No vi:
  - la pasada de la Marea grande a mitad de animación;
  - Punto recorriendo su salto (sólo el final, `c12-directa/008`);
  - Punto corriendo por la curva;
  - la caminata del estudiante a la pizarra.
- **El final completo:**
  - la tarjeta «Arithmos / Lo que se entiende, resiste.» no aparece en ninguna captura;
  - el título después de una partida de doce capítulos lo deduje del código.
- **Los botones sobre la escena durante los gestos:** las capturas de mitad de escena se toman con subtítulo. No vi
  dónde quedan «otro pedazo» o «girar 30°», ni los blancos de 32 × 32 de 10.7 o de 36 × 36 de 12.3 en teléfono
  (calculo que quedan por debajo de 44 px, pero no lo medí).
- **Ramas sin partida** (lo que digo de ellas sale del código):
  - cap. 10: 10.1 «Seis justos»; 10.2 y 10.3 «No se puede saber» / «No se sabe»; 10.4 «Hay que construirla»;
    10.6 «Ninguno»; 10.7 «Muchos»; 10.8 «Llena, seguro»;
  - cap. 11: 11.1 «No se puede decir nada»; 11.2 «Los dos»; 11.3 «Cualquiera»; 11.4 «Punto mintió»; 11.5 «9»;
    11.6 «Todas igual»; 11.7 «casualidad»;
  - cap. 12: 12.3 «al segundo 1»; 12.4 «El doble menos uno» y «−3»; 12.5 «A nada»; 12.6 «Cada vez más»; 12.7 «8»;
    12.8 con la ola elegida primero y «noche 15».
- **Capturas con texto viejo:** las de `c10-*` y `c11-*` (it09) y las de `c12-*` (it10) son anteriores a
  `f531c7d`. Las usé sólo para lo visual que no cambió, y para el texto me fijé en los logs de `fix2-*`, `tel-*` y
  `tel2-*`.
- **El cambio de cámara de `a3cc472`** («la escena usa el lugar del texto mientras se toca»): entró después de las
  partidas en teléfono que miré. Puede mejorar los gestos; no cambia los menús, que es donde marco A4.
- **Lector de pantalla:** no probé «π», «²», «√», «≠», «↔», «÷», «≈» ni «°». Tampoco el texto grande, la lectura
  limpia ni el movimiento reducido.
- **Teléfono real:** todas las partidas de 844×390 son emulación.
- **Comprensión de personas:** nada de esto es un playtest. Que algo «se sienta plantilla», «delate la respuesta»
  o «no cierre» es una hipótesis que hay que comprobar con jugadores.
