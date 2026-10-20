ESTADO ACTUAL: ARCO I · COMPLETO alcanzado (06:27, Día 2, «La primera luz»). Mesas que resolví yo: II «Tres voces en la torre» y III «La luz que sabe volver». Partida terminada; pestaña cerrada.

# Informe playtest 27 posta: Arco I desde El Faro

Sesión: 06:04 a ~06:28 (unos 24 min de reloj, incluyendo cerca de 10 min de trámite con la cámara). Pestaña: `seed` (tabs_create falló; se usó navigate a http://localhost:4190/?tramo=cerob). Viewport 1280x800; la captura sale a 800x600 y las coordenadas de clic son ese marco.

## Resumen
- Llegué a «ARCO I · COMPLETO» (El Faro, Día 2, «La primera luz»). Cierre: 9 lugares compartidos, 12 observaciones, 2 recuerdos recuperados. Edda anotó en el libro de llegadas «Volvió la luz».
- Mesas: II resuelta (cableado + medición), III resuelta (divisor + calibración). Ninguna de las dos la entendí del todo antes de hacerla: en II llegué a la respuesta por las medidas; en III calibré por prueba y error.
- Nada de Manantial, Castillo, Terrazas, Lago, Calzada ni Monte Quieto (no exploré fuera de El Faro; el juego me dejó «Explorar los alrededores»).

## Tiempos aproximados
- Llegada y lectura de Guía/Bitácora/Mapa: 06:04 a 06:08.
- Mesa II, trámite para encontrar las manivelas de la II: 06:08 a 06:13 (la mayor pérdida de tiempo; ver bugs 1-3).
- Mesa II, cableado en paralelo: 06:13 a 06:16.
- Mesa II, medición de 4 piezas y cierre: 06:16 a 06:18.
- Diálogos post-II y mesa III, pregunta «La mitad», medición toma 9 V → 6 V: 06:18 a 06:21.
- Mesa III, calibración del zócalo (2 intentos) y cierre: 06:21 a 06:24.
- Diálogos finales hasta «ARCO I · COMPLETO»: 06:24 a 06:27.

## 1. Bitácora
- Muy buena como cuaderno: «Lo que hay detrás» (lo que vio Ohm), «Para pensar», «Pruebas que conservé» y «Todos mis intentos». Me ayudó a entender qué había pasado antes (la Bitácora del Faro I y el farol de Tala).
- Contradicción: la entrada «El farol de Tala» aparece «EN ESTUDIO», pero yo nunca tuve que volver a ese caso; no sé si el juego espera que vuelva.
- Pregunta abierta: la pregunta de Nereo de la mesa II («Cuatro veces más») no quedó registrada en ninguna página, porque nunca la respondí (ver bug 2).
- Riesgo (no confirmado): cuando cerré la Bitácora, el clic cayó en la zona del botón «Descargar la Bitácora», que está pegado a la X en la esquina superior derecha. El botón ya no aparecía en el DOM después; no vi aviso de descarga. No lo busqué a propósito. Si alguien ve un archivo de Bitácora nuevo en Descargas hacia las 06:10, es de esta sesión.

## 2. Navegación
- Caminar con clic en el suelo funciona, pero la cámara sigue al personaje y el objetivo se mueve: varias veces caminé a un lugar equivocado antes de corregirme.
- Los discos de color se entienden bien (ámbar falta, verde listo), pero los discos de los costados de la mesa II son de la linterna III («Abrir el obturador de bronce», Ohm: «Faro III · obturador de bronce»). La Guía dice «manivela izquierda» y «manivela derecha» a los lados de la mesa II y eso me hizo buscar en el lugar equivocado durante varios minutos.
- Nunca vi la flecha dorada flotante de «siguiente paso». Me guié por la Guía («Ubicarme en el mapa») y por el mapa (diamante en el Faro).
- El mapa es claro («Siguiente paso», «Restaurado», «Por restaurar») y la Guía dice lo que hay que hacer en una frase.
- Escenas de transición con «Volviendo al viaje…» tardan 3 a 5 s. Se puede saltar con Esc, pero el diálogo sigue con Enter, uno por uno.

## 3. Arte y presentación
- Tablero de mesa bien logrado: piezas redondas, cables con brillo, el cristal de la lente que se enciende. El estado de cada pieza (Quieto, Funciona, Se pasa un poco) se lee sin texto largo.
- Retratos de Nereo, Ohm, Vale, Edda, Tala y Lumen con buen contraste.
- Posible corte a la derecha: en mis capturas (800 px de ancho) el tablero y el panel de Nereo se cortan en el borde derecho. El texto completo sí aparece en el DOM, así que puede ser mi marco y no el juego. A verificar con 1280 real.
- La mesa tiene textos muy largos en una sola línea que se cortan («Lo que dijo el cobre: ... la óptica, cuatro veces lo de la señal»).

## 4. Diálogos e historia
- Nereo tiene una voz muy clara («Medido, no recordado», «Lo que no sé es qué luz va a dar»). Edda, Vale, Ohm, Tala y Lumen aportan contexto sin frenar.
- Muchos diálogos de Enter de una sola línea en seguidilla (decenas de pulsaciones seguidas en el cierre). Ritmo cansador en el final.
- Spoiler de la mesa II: en cuanto quedaron las tres piezas en «Funciona», el panel naranja decía «Lo que dijo el cobre: ... la óptica, cuatro veces lo de la señal». Eso revela la respuesta antes de que yo responda la pregunta.
- Mesa III: la pregunta «Sin la lente, ¿qué parte de los 18 V debería ...?» tiene opciones claras («La mitad»). La respuesta fue correcta y Nereo lo confirmó con la medida («esperábamos la mitad y marcó 9 V de 18 V»). Buen momento para aprender la idea de divisor.
- Opción de Vale al final («¿qué le dejo a Tala?»): elegí «Las pruebas que me salieron mal» porque la Bitácora decía «No borres lo que falló». Tala lo comentó bien.

## 5. Errores o bugs (todos observados; los de cámara se reproducen al caminar)
1. Mesa II: la pregunta de opción múltiple «Marca esperada» («La misma / El doble / Cuatro veces más / Un cuarto») desapareció al pasar a «Medir un camino». El éxito no la exigió. Ni la pregunta ni la respuesta quedaron anotadas. (En la mesa III sí se respondió y apareció la confirmación.)
2. Modo de la mesa: el botón «Cables» queda resaltado en azul y, al tocar bornes, interpreta cables aunque quiero medir. Me pasó dos veces hasta que volví a elegir «Comparar dos puntos». El aviso «No te quedan cables en la mano. Tocá uno de los que tendiste para retirarlo» confunde (no quería tender nada).
3. La «×» para retirar un cable solo aparece al entrar en modo «Cables». Un cable inicial que ya estaba en la mesa no tiene × a la vista en modo «Comparar»; hubo que cambiar de modo para verlo.
4. Clics en botones de la mesa a veces no hacen efecto en la primera pasada de captura (la pantalla va atrasada una acción). Se resolvió esperando 1 a 2 s y releyendo.
5. Accesibilidad: las piedras del zócalo aparecen duplicadas en el árbol (`radio … marrón, negro, negro y oro` dos veces). Probablemente un panel repetido.
6. Mesa III: calibré el zócalo por prueba (primero «Se pasa un poco», luego «Funciona») sin una explicación de los colores de las bandas en el juego. No hay forma de saber qué piedra corresponde sin probar.
7. La Pista de la mesa III no la usé; el mensaje de Ohm («probá las piedras de repuesto de Nereo hasta que la luz s…») ya me dio el camino.

## 6. Ritmo
- Llegar a la primera mesa (II) me costó casi la mitad del tiempo por la búsqueda de manivelas y la cámara.
- Mesas II y III, una vez encontrada la pieza, duran 3 a 5 minutos cada una. Se sienten bien dosificadas.
- El cierre tiene demasiados diálogos seguidos antes de «ARCO I · COMPLETO». El final emocional queda diluido por la cantidad de pulsaciones de Enter.

## 7. Top 10 a mejorar
1. Alinear el nombre de las manivelas de la mesa II con lo que el juego llama a esos discos (la Guía dice «manivela», el disco dice «obturador de bronce», y es de otra mesa).
2. No dejar que la pregunta «Marca esperada» de la mesa II desaparezca sin respuesta (ver bug 1).
3. No revelar la respuesta («cuatro veces lo de la señal») en el panel de cableado antes de que el jugador la conteste.
4. Dejar claro en la mesa en qué modo estoy (Cables o Medir) y que los bornes respondan al modo visible.
5. Mostrar la × de retiro también en modo Medir, o explicar que solo se retira lo que se tendió.
6. Corregir la cámara para que el personaje no se pierda al caminar hacia un disco (o un atajo para acercarse a un punto).
7. Dar una pista del zócalo de la mesa III (cómo leer las bandas) en vez de solo prueba y error.
8. Permitir saltar la conversación completa con un botón (no solo el Enter de cada línea) en el cierre.
9. Separar el botón «Descargar la Bitácora» de la X de cerrar, o dar más margen (riesgo de clic accidental).
10. Revisar el corte a la derecha de tablero y panel en 1280 px (verificar sin mi captura reducida).

## Top 5 de lo mejor
1. La voz de Nereo y el «libro del farero» («Medido, no recordado»): dan sentido a las mesas.
2. Feedback inmediato en el tablero (Quieto → Funciona, Demasiada fuerza, Se pasa un poco) y la regla de los nudos que se completa con las medidas.
3. Medir la toma sin lente y con lente (9,00 V → 6,00 V): la caída de tensión se vuelve tangible para alguien que no sabe electricidad.
4. La Bitácora como cuaderno de campo («Lo que hay detrás», «Pruebas que conservé», «Todos mis intentos»).
5. El cierre «ARCO I · COMPLETO» con estadísticas y la nota de Edda: se siente como un final.

## Notas de honestidad
- No miré código, documentación ni consola; solo lo que se ve en la pantalla y el texto de la página.
- Tuve que usar la lectura del DOM (texto de página y accesibilidad) para confirmar estados; eso es lo que un lector de pantalla vería, no lo que ve un jugador a simple vista. Aclaro para que se compare con la experiencia visual.
- Las dos mesas que resolví no las entendí en profundidad antes de resolverlas: en II la respuesta fue por medición (1,00 A vs 0,25 A) y en III por prueba del zócalo. Eso también es un dato del diseño: el jugador puede pasar sin entender la pregunta.
