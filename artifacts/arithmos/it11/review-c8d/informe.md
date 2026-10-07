# Revisión c8d — matemática + narrativa/agencia (94aa491, 176c859, 1e052c2, f698e16, 138e1b0)

Evidencia: código en `experiments/arithmos/src`, logs de bot `it11/*.out` y las capturas indicadas (más recortes propios con `sips`).
Límites: no usé navegador ni escuché audio. Un bot no es un playtest humano. No hay captura de la grilla de 11.6 en teléfono (c116-tel no la tiene).

## Lo que está bien (verificado)
- Cuentas: 7 sale de 6 de 36 y 12 de 1 (`diceSums`). Con 360 tiradas se esperan 60 y 10, y salieron 58 y 6. (5, 2) suma 7 y el 5 le lleva 3 al 2. `1 + n` pasa por (0, 1) y (1, 2) y da 7 en n = 6. 4 y 8 quedan arriba de esa recta. 16 cae en x = 4 y 32 en x = 5. La recta `1 + 7n/3` no pasa por 2 ni 4.
- La pregunta del nombre cita bien a 1.1 (`ch1/scenes.js:285`: «Te voy a decir Punto. Hasta que me digas cómo te llamás»).
- Los visuales nuevos tienen `d.describe` (pozo, cada balde, dados, recta de Punto, borrado, dibujo del nombre, salto a (5, 2)). Las etiquetas nuevas se entienden: «El par a y b, que suma s», «Decir que ya están todos los que suman N» (se recalcula en cada `refresh`) y «Subir el balde».
- 12.8: que Punto corra con una regla que cumple sólo los datos que ya hay y la borre cuando llegan los nuevos muestra lo que después dice el estudiante («otra regla podría pasar por los mismos puntos»). La idea funciona. Los problemas están en cómo se ejecuta (abajo).

## ALTA

**A1. 12.8: «la cuarta noche» vale 8 y después vale 16.**
- Dónde: `src/ch12/scenes-b.js:256` («La tercera y la cuarta noche fueron 4 y 8») contra `:299` («Cuarta noche.», que dibuja 16 en x = 4) y `:295` («La cuarta llega a 16»). Se ve en el log `c128-directa.out` a 1,9 s y a 4,9 s.
- Qué: la línea nueva cuenta las noches como ordinales (la primera es x = 0). El resto de la escena usa el número del eje (x = 4 es «la cuarta»). El describe de `:319` («desde la primera noche hasta la quinta», n = 0…5) mezcla las dos cosas.
- Por qué importa: es el número del clímax del juego y en pantalla hay dos «cuartas» noches distintas. Choca con el contrato («ninguna afirmación más allá de lo que hay en pantalla»).
- Corrección (elegir una):
  - Eje desde noche 1: 1, 2, 4, 8 en las noches 1 a 4, 16 en la 5 y 32 en la 6. Hay que ajustar opciones, `think` y `xticks`.
  - Dejar el eje desde 0 y no usar ordinales: «Las noches 2 y 3: 4 y 8», «Noche 4.», «hasta la noche 5».
- Cómo comprobar: `grep -n "tercera\|cuarta\|quinta\|primera noche" src/ch12/scenes-b.js` → cada palabra corresponde a un solo valor. En el log, la noche que da 16 no se llama igual que la que dio 8.

**A2. 11.6: la consigna no está en pantalla y el cambio de 7 a 12 es invisible.**
- Dónde: `src/ch11/scenes-b.js:136-170`. Antes estaban los botones «marcar los 7 / marcar los 12». Ahora sólo queda «ya están todos» (`:139`) y la consigna vive en el «?», que sólo aparece si se pide (`main.js:323`). En `:163`, `target = 12` cambia sin texto, sin `say` y sin `describe`.
- Qué: en `c116-errores/004-c11.dados-interaccion.png` se ve la grilla y «ya están todos», y nada dice qué buscar. Después del primer «ya están todos» la pantalla queda igual, pero ahora hay que buscar el 12.
- Por qué importa: sin abrir la ayuda, el jugador no sabe qué marcar ni que cambió el objetivo. Con lector de pantalla, el cambio se nota sólo por la etiqueta del botón.
- Corrección:
  - Un rótulo en la pizarra: «los que suman 7». Al cerrar, se marca y aparece «ahora: los que suman 12».
  - Una línea de Rampa al pasar al 12 («¿Y el mío?») y un `describe` del cambio.
- Cómo comprobar: captura de la interacción antes y después del primer «ya están todos»: el objetivo se lee sin tocar «?». En el log aparece la línea de transición.

## MEDIA

**M1. 11.6: la marca se resuelve sin entender y el error típico nunca sale.**
- Dónde: `ch11/scenes-b.js:116` (cada casillero ya tiene su suma escrita), `:144-158`.
- Qué:
  - Marcar es buscar los «7» escritos.
  - Se puede forzar: tocar los 36 casilleros y apretar «ya están todos» no cuesta nada.
  - El error real del tema (contar 1-6 y 6-1 como uno solo, o sea 3 pares) no aparece. Si el jugador cierra con 3, la nota es genérica («forman una diagonal», `:158`), no responde a su error.
  - Los ejes no dicen qué dado es cada uno. Los dados de Rampa son iguales, así que «contamos cuál dado es cuál» (línea del estudiante) no tiene apoyo visual.
  - La predicción 7/12/«igual» (`:110`) no recibe respuesta propia: `pre` no se vuelve a usar.
- Por qué importa: §8 pide no acertar sin entender y que el error tenga una consecuencia comprensible.
- Corrección:
  - Que los casilleros muestren el par («1·6») o estén vacíos, y que la suma aparezca al tocar.
  - Antes de marcar, preguntar «¿cuántos pares suman 7?» (3 / 6 / 1).
  - Si el jugador marcó una sola mitad, nota específica: «6 y 1 es otro casillero: el primer dado 6, el segundo 1».
  - Rotular «primer dado / segundo dado», o diferenciar un dado de Rampa y su eje (no sólo por color).
  - Una línea que responda a `pre`.
- Cómo comprobar: ruta que marca (1, 6), (2, 5), (3, 4) y cierra. La nota tiene que hablar del orden.

**M2. 10.1–10.8: el pozo dibujado no cuenta la misma soga que el problema.**
- Dónde:
  - 10.1 pone pedazos de soga sobre el borde de la rueda (`ch10/scenes-a.js:46`, `:63-75`).
  - En el pozo, la soga cuelga del eje en el centro (`ch10/well.js:70`) y nunca toca la rueda (`:57`, rueda afuera del poste).
  - `pull` gira dos vueltas y sube 80 u (`well.js:79-83`). Si la soga se enrollara en la rueda (R = 38), dos vueltas serían unas 477 u.
  - 10.5: «Punto, traeme la soga. Estás en el pozo» (`ch10/scenes-b.js:46`) hace viajar la soga del pozo a la casa, al revés de la historia: el pozo no tiene soga hasta 10.8.
  - 10.2 «Ato el balde a la manija» (`scenes-a.js:139`) y 12.x «la canilla del pozo» (`ch12/scenes-b.js:103`) no se ven en el pozo nuevo.
- Por qué importa: el pozo se hizo para darle cuerpo al problema de 10.1, pero lo contradice. Además se pierde la oportunidad de usar los radianes (pendiente mat-9 M2).
- Corrección:
  - Rueda sobre la boca del pozo, con la soga enrollada en el borde y bajando tangente. Que cada vuelta suba 2π·R, y Balcón puede decirlo en 10.8 («cada vuelta, seis rayos y un poco de soga»).
  - O cambiar 10.1 a un aro de soga de la rueda.
  - En 10.5: «Punto, vení a buscar la soga a casa».
- Cómo comprobar: captura de 10.8 con la soga saliendo del borde de la rueda. La subida por vuelta coincide con 2πR a escala. En el log de 10.5 la soga va hacia el pozo.

**M3. 12.8: Punto se equivoca con «suma 1», pero el ×2 era suyo, y el error no tiene consecuencia dicha.**
- Dónde: `ch12/scenes-b.js:242-271`. En 7.2 Punto escribe «× 2 cada día» (`ch7/scenes-a.js:193-194`), y en 11.8 está «la de Punto se duplica».
- Qué:
  - El error es razonable con dos datos, pero nadie dice que Punto no reconoció su propia regla.
  - Nadie dice qué costaba: con su recta, la escalera aguantaba hasta la noche 29, «sobra tiempo».
  - El estudiante (`:296`) explica la idea sin atarla a lo que Punto acaba de hacer.
  - 10.7 y 12.8 repiten el mismo molde (se apura, llega el dato, se baja), lo que arriesga sonar a plantilla.
- Corrección:
  - Después de que el jugador elige «Duplica», Punto escribe «× 2» como en 7.2. Es un reconocimiento suyo que no le quita la decisión al jugador.
  - En `:296`: «Con dos noches también pasaba la recta de Punto, y con ella creíamos tener hasta la noche 29».
- Cómo comprobar: las líneas aparecen en el log de `c128-*`.

**M4. 12.8: el «nombre» no se lee como punto, flecha y curva.**
- Dónde: `ch12/scenes-b.js:326-333`. Punto se para en `nx - 14`, encima del punto que dibuja en `nx`. La punta de flecha (`:331-332`) es una muesca en medio de un trazo que sigue como curva.
- Qué: en el recorte de `c128b/004` se ve una línea que se curva con una marquita. Inmediatamente el estudiante dice «Un punto, una flecha, una curva».
- Por qué importa: el texto afirma más de lo que se ve, justo en el pago del arco.
- Corrección: que Punto se aparte, y dibujar en tres tiempos con pausa y separación: un punto marcado, una flecha con punta clara que nace de él y recién después la curva, desde la punta.
- Cómo comprobar: en capturas a 1600×900 y 844×390 se distinguen los tres elementos sin leer el subtítulo.

**M5. 12.8: Punto tapa el dato (3, 8) mientras el jugador elige familia.**
- Dónde: `ch12/scenes-b.js:267` (zip a `py(8) - 16`). Se ve en `c128-errores/003-c12.anticipar-eleccion.png`.
- Por qué importa: la decisión es si la curva pasa por los cuatro puntos, y el más alto queda debajo de Punto.
- Corrección: dejar a Punto arriba y afuera del gráfico, o encima a 40 u o más.
- Cómo comprobar: en las capturas de elección se ven los cuatro puntos azules.

**M6. 10.7: Punto «se adelanta» cuando ya tiene toda la información.**
- Dónde: `ch10/scenes-b.js:248-265`.
- Qué:
  - Salta a (5, 2) después de que la fila amarilla ya está dibujada (`:244-246`), así que se lee como descuido y no como anticipación.
  - El `think` de `:258` narra una mirada que no se anima.
  - Al final queda pegado a (7, 6), el último punto amarillo y tocable (`:262`; captura `r8-c107/003`), y parece sugerirlo.
- Corrección:
  - Mover el salto entre la primera y la segunda pista (antes de `:244`). Que se pare en (5, 2) con sólo la fila blanca, que aparezca la amarilla y que se baje él.
  - Animar el gesto: acercarse a la fila amarilla y volver.
  - Estacionarlo fuera de la grilla.
- Cómo comprobar: en el log, «Punto se paró…» va antes de «Segunda pista». En la captura de interacción, Punto no está sobre ningún punto tocable.

**M7. 10.8 en teléfono: no se lee nada de lo que el pozo agrega.**
- Dónde: `SHOT_WELL_BOARD` (`well.js:9`). Se ve en `well3-c108-tel/003-snap-c10.a-veces.png`.
- Qué: «1. llena» mide unos 8 px y el balde unos 15 px, así que lleno y a medias no se distinguen.
- Por qué importa: §9 (texto legible y escalable). En teléfono, la escena vuelve a ser «tocar seis veces».
- Corrección: en teléfono, subir el balde en `SHOT_WELL` y anotar en el plano de la pizarra (alternar), o agrandar balde y rótulos.
- Cómo comprobar: captura a 844×390 con el texto en 12 px o más y el nivel del agua visible.

## BAJA

- **B1. 11.6, dados de Rampa** (`ch11/scenes-b.js:94-103`).
  - Los puntos del dado no se leen: en el recorte de `c116c/002` son dos columnas de garabatos, y Rampa pregunta «¿Vieron?».
  - El describe dice «Al lado de Rampa», pero desde 1e052c2 están debajo de la pizarra, a unos 200 px.
  - No hay tirada: los dados aparecen ya en el piso.
  - Corrección: dados más grandes o un plano cercano, un rodar breve y corregir el describe.
- **B2. 10.8, el total se pega a un renglón.** «llena: 4 a medias: 2» (`ch10/scenes-b.js:367`, y0+70) cae en la misma línea que «2. a medias» (y0+71) y se lee como un solo renglón (`well4-c108/002`). Bajarlo debajo del 6 o separarlo con una raya.
- **B3. 10.1, dibujo del pozo** (`well.js:22`, `:49`, `:57`).
  - La manija amarilla queda pegada al poste y el alero toca la rueda (`well-c101/002`), justo cuando 10.2 trata de la altura de la manija.
  - Balcón habla con el pozo en cuadro, pero él no aparece.
  - Corrección: separar la rueda o girar la manija, y meter a Balcón en el plano.
- **B4. 10.7, falta el rótulo vertical.** No hay «Balcón ↑» (sólo «Cornisa →», `:238`). El describe del salto de Punto no dice de quién es cada número.
- **B5. Narración y cierre.**
  - Los `think` narran gestos que no se ven: «Punto la mira un rato» (`ch12:263`) y el de 10.7.
  - Al quitar `follow(p, s)`, la última imagen deja a Punto arriba de la pizarra y lejos del estudiante, justo en «no sos sólo un punto». Según REVIEW A2 es deliberado. Sugiero que baje junto al estudiante después de esa línea.
- **B6. 11.6 en teléfono: tamaño de toque sin verificar.** Las celdas miden 30 u. Falta una captura de la grilla en teléfono para confirmar que cada blanco sea de al menos ~44 px.
