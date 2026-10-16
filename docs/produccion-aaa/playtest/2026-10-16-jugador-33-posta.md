ESTADO ACTUAL: FIN DE SESIÓN · Faro: mesa I resuelta; mesa II con la caja izquierda resuelta y la derecha trabada (no alcanzable a pie desde el césped del este) · pendiente: Faro II (caja derecha), Faro III y el resto del arco

# Informe de playtest 33 (posta): Arco I desde el Castillo de la Red

Tester: jugador de prueba (12-15 años, sin saber electricidad).
Punto de partida: http://localhost:4190/?tramo=cerof, opción «Continuar el viaje» (nunca se eligió «Comenzar otro viaje» ni «Cruzar el Portal»).
Pestaña: tabId "seed" (tabs_create falló: "Browser pane gone / gate off / tab cap"; se usó navigate, que abrió la pestaña "seed"). Viewport 1280x800.

## Tiempos aproximados
- Castillo de la Red: ~60 min (incluye pelea con el movimiento y la cámara).
- Las Terrazas: ~35 min.

## Lugar 1: Castillo de la Red (Loma de la Red) · Día 1 · Tarde

### Lo que vi al entrar
- Título: «Castillo de la Red · Tarde, día 1 · 4 de 9 luces encendidas · 47 min de viaje». Carga inicial de "Abriendo los caminos" ~25 s (11% a 100%).
- Guía (H): «Un paso a la vez», objetivo «Una red que se puede comprender» con «Ubicarme en el mapa». Texto claro: "Recorré el lugar / Observá lo que cambia / Probá una idea". Muy útil para un chico que no sabe nada.
- Hay una marca dorada de la brújula, pero NO vi una flecha dorada flotante sobre el personaje; la brújula + la marca dorada sobre el tablero fueron lo que orientó.

### Diálogos
- Consejera Ivara (CUSTODIA DE LA RED): «El agua entró por la rama del archivo oeste. Cerramos toda la red…». Explica "La Luz es una sola: lo que se le da a una casa, se le quita a otra" y da el ORDEN: primero la caja de manivela de la izquierda (separa el archivo oeste), después la de la derecha (une enfermería y cocina), y al final su tablero.
- Lu («¿Podemos mirar el tablero ahora?»), Edda («¿Nos pide que lo probemos?») y Ohm («Puede comprobarse.») son diálogos cortos, buen ritmo. Ohm en el tablero da pistas en forma de pregunta ("¿Tiene que atravesar la cocina?", "¿Y la cocina? ¿Recibe su fuerza por su cuenta, o a través de la enfermería?"): muy bien dirigidas.

### Manivelas del patio (E)
1. Caja IZQUIERDA ("Separar el archivo oeste"): costó. Varias veces el E no respondía porque el personaje quedaba a unos pasos (la caja está junto a un farol y un cordón amarillo; la cámara sigue al personaje, así que en pantalla parece más cerca de lo que está). Al fin funcionó con el prompt "E Separar el archivo oeste" en pantalla: «✓ Hecho · deshacer: conectar el archivo oeste», y la Consejera confirma.
   - «Mirar con Ohm» (Q) en esta caja NO abrió nada (probé dos veces). Tampoco el botón del prompt.
2. Caja DERECHA (junto a la torre, al sur del tablero): cuando llegué ya decía "✓ Hecho · deshacer: desconectar el troncal sano" y su disco estaba VERDE desde la primera captura de la partida, antes de tocar nada; la izquierda estaba ÁMBAR. La Consejera pidió justamente primero la izquierda. Posible estado heredado / bug de orden. Lo anoto como hallazgo importante (no toqué esta caja con E).

### Mesa «Dos luces, un refugio» (tablero de los servicios del Castillo)
- Abrir: el prompt «E Abrir: Tablero de los servicios del Castillo» aparece bien al frente del panel. Un E con el mapa abierto no hizo nada visible y el mapa quedó abierto (confuso).
- Tablero: 3 pasos en la barra superior: «1 Enfermería con luz plena», «2 Cocina con luz plena», «3 Ivara vio la enfermería encendida con la cocina aislada». Muy claro.
- Resolución:
  a. Retiré el cable Enfermería − ↔ Cocina + (Ohm: "Retiraste el cable…, vuelve a tus cables disponibles").
  b. Tendí Enfermería − → Retorno −: enfermería «✓ Funciona».
  c. Ohm preguntó "¿Y la cocina? ¿Recibe su fuerza por su cuenta…?" → tendí Fuente + → Cocina +: cocina «✓ Funciona».
  d. Llave de la cocina «conectada» → «aislada»: enfermería siguió encendida; Ohm/Ivara lo confirman.
  e. Al aislar, el paso 2 volvió a quedar abierto: hay que volver a conectar la llave. Cartel final: "Todo el encargo está cumplido."
- Pantalla de éxito: «Volver al mundo: la instalación queda en servicio». Bitácora: «Las ventanas de la enfermería y la cocina encienden sus faroles por separado. El archivo clausurado permanece oscuro.»
- Sin la pista de Ohm, el circuito no se entiende: hay que ver que la enfermería no puede volver a la fuente pasando por la cocina. Con la pista quedó claro.

### Dónde me trabé (lugar 1)
- Movimiento: los clics en el suelo a veces llevaban al personaje hacia otro lado (sendero, alrededor de la torre). Las teclas WASD sí funcionan: pasos cortos y releer el prompt. Me costó ~10 min solo llegar a las cajas.
- Al hacer clic en el arco de la puerta norte, el personaje reabrió el tablero (en modo servicio): confuso.
- Guía de viaje: la × funcionó con ref (no con coordenadas).
- Mapa (M): se cierra con su «Cerrar» (ref). Ojo: el mapa tiene «El Manantial: viajar» muy visible (no lo toqué).

## Lugar 2: Las Terrazas (Ladera de los Bancales) · Atardecer · Día 1

### Diálogos y historia
- Al llegar al arco norte, objetivo «Lo que compartimos»: "Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar." Muy claro qué hay que hacer.
- Una mujer con goggles, «???» LA FORJADORA (Yesca), y Vega (OPERADORA DEL ACUEDUCTO). Mucho diálogo cruzado entre Yesca y Vega ("Cuando sube tu horno, Yesca, baja mi bomba"; "Y mi comida fabrica herreros"; Ohm: "Las dos tienen razón. El cable de la ladera es uno solo."). Es divertido pero largo: 10 Continuar seguidos. Se podría acortar.

### Mesas (3 cajas/tableros)
1. «Pasar el horno a la mesa compartida» (caja junto a la forja, E): «✓ Hecho · deshacer: devolver el horno a su palanca propia». Ohm: "El horno queda en el tablero de Vega: su calor se reparte junto con el riego."
   - Q «Mirar con Ohm» NO abrió la observación (probé con Q y luego clicando el prompt). Clicar el prompt además movió al personaje.
2. «Abrir el canal de los bancales» (caja junto a la casa de Vega, E): «✓ Hecho · deshacer: cerrar el canal de los bancales». Bitácora: "El horno baja, el canal se abre" y "El horno queda en el tablero compartido. La compuerta abre el camino a los bancales."
   - Ojo: entrar en la casa de Vega: un clic en el suelo me metió al interior (prompt «Entrar · Casa del molino» / «Salir»). No es un bug grave pero es confuso.
3. «Abrir: Tablero de calor y riego» (mesa azul junto a la bomba): tablero "La paciencia del invernadero", 4 pasos:
   1. Raíces tibias (Lecho de raíces: demasiada fuerza → subí «Freno del calor» dos veces, de 1/5 a 3/5: raíces «✓ Funciona»).
   2. Riego parejo (Bomba: demasiada fuerza → subí «Freno del agua» hasta 3/5: bomba «✓ Funciona»).
   3. Horno «✓ Funciona» (ya estaba).
   4. «El cable de la ladera no se calienta»: seguía «Se calienta» con todo a funcionar. Ohm: "¿Quién toma más? El instrumento puede decirlo." → usé «Medir un camino», elegí «Horno de Yesca» y la barra decía «Una buena parte». Subí «Freno del horno» de 1/4 a 2/4 → cable «✓ Fresco», todo ✓, Ohm: "Todo el encargo está cumplido."
   - Aclaración del juego (bien): «Freno del calor» afecta a las raíces, «Freno del agua» a la bomba, «Freno del horno» al horno. Por el nombre "calor" no lo asocié al cable al principio, pero la consigna lo explica.
   - Dificultad: el medidor es la mejor ayuda; sin él habría probado a ciegas. El texto "Ver números" no lo usé (no hacía falta).
   - Técnico: los refs de los botones «+» y «−» se vuelven "stale" después de cada clic (el tablero se re-renderiza). Hay que releer con read_page antes de cada paso.
   - Pantalla de éxito: «Volver al mundo: la instalación queda en servicio» → "Volviendo al viaje…" → dos o tres diálogos más (Yesca "Tandas grandes… te debo tomates", Vega "Las raíces van justas…", Yesca "Frenaron mi horno y las raíces ni se enteraron…").

### Dónde me trabé (lugar 2)
- La caja del horno: el primer E no tomó (el personaje se movió por un clic en el prompt). Reintenté con teclas: funcionó.
- Entrar sin querer a la casa de Vega (clic en el suelo cerca de la puerta).
- Ninguna flecha dorada; la marca dorada sobre la caja/tablero que hay que usar es lo que guió.

## Lugar 3: Lago de las Señales (Ribera de las Señales) · Crepúsculo · Día 1
Tiempo aprox.: ~25 min.
- Llegada: el objetivo fue «La orilla de la señal» → «Hacia Lago de las Señales». La marca dorada cambió varias veces y no quedó claro por dónde seguir: la marca estaba a veces delante, a veces detrás. Terminé usando «E Camino a: El Lago de las Señales» que apareció en el sendero (ahí sí quedó claro, y el personaje caminó solo).
- Nereo (FARERO MAYOR, EL VIEJO DEL MUELLE): diálogo muy bueno y con personalidad ("Llegaron tarde", "Cuarenta años…"), aunque largo (~15 Continuar). Ohm: "Nereo. Última visita registrada: hace cuatro años." Bien.
- Mesa: la caja "Conectar el retorno entre las cañas" (junto al muelle, en la orilla). Un E → «✓ Hecho · deshacer: desconectar el retorno de la orilla». Bitácora: "La línea sumergida vibra bajo el muelle. Tres balizas marcan el camino hacia el Faro." Nereo: "Ahora sí. Yo llevo la llave…"
- Me costó ubicar la caja: estaba entre las cañas y el cartel de prompt tapaba la marca; la cámara seguía al personaje y el alcance del E era corto.
- Claridad: con el diálogo de Nereo ("el retorno lo cerrás vos… y miren las balizas") el objetivo se entendió bien, pero no vi una pista visual de cuál era "la baliza que no contesta".
- Pasé a «El Faro · I / III»: "Abrí la Fuente del Faro, la primera mesa, al pie de la torre: el núcleo tiene que sostener su pulso." y el aviso «El Faro refleja luz aunque no la produzca. Parecer encendido y estar funcionando son cosas distintas.» (frase muy buena).

## Qué pasó con las herramientas (para el informe técnico)
- tabs_create falló ("Could not open a new tab (Browser pane gone...)"). navigate abrió la pestaña "seed" y la usé como mi pestaña.
- ref_N cambia al re-renderizar un tablero: hay que releer con read_page antes de cada clic.
- Las coordenadas de clic en el tablero no coincidían con la captura de 800x600 (el "+" del freno no respondió a (458,238)); el ref fue lo que funcionó.

## Lugar 4: El Faro (Espigón del Faro) · Noche · Día 1 (I/III resuelta, II/III trabada)
Tiempo aprox.: ~50 min (sobre todo navegación).
- Llegada: cruzar el puente desde el lago cuesta (la marca dorada te lleva a la entrada del puente y luego ya no hay marca clara). Ayudó «E Camino a: El Faro» en el sendero y luego caminar por el puente con clics.
- Mesa I «Fuente del Faro» (al pie de la torre, prompt «E Abrir: I · Fuente del Faro»): Nereo, Edda y Lu dan contexto (ritmo de la torre, "cobre que se queja, cobre que descansa"). Puzzle «I · El pulso del Faro»: "Dale fuerza al núcleo sin recalentar los tendidos". Lo que pasó:
  1. Regulador del generador: fui bajando el freno (de 4/6 a 2/6). El núcleo siguió en «Casi» y el tendido norte seguía «Se calienta».
  2. Pista 1 (de 4): "toda esa corriente pasa por el tendido norte". Pista 2: "en este tendido no hay posición buena: o el núcleo queda débil o el cobre se calienta".
  3. Solución: tendí Fuente + → Tendido sur A y Tendido sur B → Regulador A (2 cables). Ambos tendidos quedaron «✓ Fresco» y el núcleo «✓ Funciona». Ohm: "Todo el encargo está cumplido." — Bien pensado: la pista llevó a "dos tendidos en paralelo".
  - Ojo de diseño: la pista 1 y la 2 son bastante directas; el texto "un tendido por vez" de Ohm (y la frase de Nereo) sugería otra cosa, y lo que resolvió fue el paralelo. Me confundió un poco el mensaje de la fila de Ohm ("Frená menos…") que pide algo que no alcanza.
  - Pantalla de éxito → «Volver al mundo: la instalación queda en servicio». Diálogos siguientes: Edda ("Tenemos fuente. Todavía no una señal."), Nereo ("Ese sí es su sonido… la manivela izquierda lo aparta… la derecha une el motor con la corona."), Lu ("Seguimos hacia el ruido que falta.").
- Mesa II (cajas de manivela de la plaza): la caja IZQUIERDA «Aislar el puente de servicio gastado» funcionó con E («✓ Hecho · deshacer: reconectar el puente gastado»; Nereo/Edda: "El puente de mantenimiento queda fuera de la distribución."). Un E extra (sin querer, al seguir con el prompt activo) no cambió el estado: el texto siguió diciendo "Hecho", pero fue confuso.
- TRABA (sin resolver): la caja DERECHA («une el motor con la corona») está en el pasillo interior de la plaza, detrás de los rieles dorados curvos. Desde el césped del este no pude entrar: el personaje caminaba por fuera del muro y los clics llevaban a la nota de la placa («Una nota detrás de la placa») y a otras esquinas. Después de ~15 min de intentos con clics y teclas, lo dejé. Es el punto donde más se nota que falta una flecha o una guía de ruta dentro de la plaza.
- Ohm no abrió «Mirar con Ohm» (Q) en la caja del puente; el clic en el prompt sí disparó la acción.

## Balance de la sesión
- Lugares completos: 3 (Castillo, Terrazas, Lago) + 1 parcial (Faro: I/III resuelta; II/III sin terminar; III/III no vista).
- Mesas resueltas: Castillo 1 (3/3), Terrazas 2 (horno+canal) + tablero del invernadero (4/4), Lago 1 (retorno), Faro I (3/3 pasos: el núcleo) + Faro II, caja izquierda (1 de 2).
- No llegué a «ARCO I · COMPLETO». Quedan: Faro II (caja derecha), Faro III, y lo que sigue del arco (el mapa marca "Sin recorrer" en Casa de Compuertas, El Manantial, La Calzada, etc.).
- Tiempo total aproximado: ~3 h 15 min (muchos minutos en movimiento y pruebas con cámara, no en pensar los puzzles).

## 1. Bitácora
- La usé solo por inercia (la veo entre diálogos). Sin ella igual se entiende, pero las líneas de «Observaciones de viaje» son muy buenas para confirmar que una mesa quedó bien ("Las ventanas de la enfermería y la cocina encienden sus faroles por separado…"). No hacía falta abrirla para avanzar.
- No abrí los botones de descarga/exportar (cumplido).

## 2. Navegación
- Lo más flojo. Los clics en el suelo llevan a veces a lugares que no esperás (la casa de Vega, la nota de la placa, el pasillo de afuera del Faro). Las teclas WASD funcionan pero con la cámara que sigue al personaje cuesta leer las distancias.
- La marca dorada es útil, pero cambia sin aviso (en el lago y en el Faro dejó de estar donde esperaba) y no hay flecha flotante clara.
- El prompt «E Camino a: X» en el sendero es lo mejor de la navegación: caminar solo hasta el lugar. Debería aparecer más seguido.
- El mapa (M) con «Viajar a un lugar visitado» es cómodo, pero el botón del lugar actual puede confundir con "viajar" (ojo al «El Manantial: viajar»).

## 3. Arte y presentación
- Muy bonito: el Castillo con la luz del día, el Lago de noche con reflejos, el Faro con los rieles dorados. La paleta del tablero (madera, cobre, azul) se entiende como "instalación".
- Los paneles (tableros) son claros y legibles, con los bornes bien marcados y el texto de cada paso en la barra de arriba.
- Pero: los prompts flotantes tapan a veces la caja que hay que usar, y el texto "Ver números" o "Comparar dos puntos" aparece en el pie sin mucha explicación.

## 4. Diálogos e historia
- La voz de Ivara ("La Luz es una sola: lo que se le da a una casa, se le quita a otra") y la de Vega/Yesca (la discusión por el cable compartido) son de lo mejor: el conflicto es entendible para un chico.
- Nereo es un personaje con mucho carácter; las frases cortas funcionan.
- Exceso: en Terrazas hay ~10 Continuar seguidos entre Yesca y Vega; en el Lago ~15 con Nereo. Para un jugador de 12-15 años se hace largo; conviene poder saltar o acortar.
- Lo que más me gustó: las pistas de Ohm como preguntas ("¿Tiene que atravesar la cocina?").

## 5. Errores o bugs
1. [Orden / estado inicial] En el Castillo, la caja DERECHA aparecía ya resuelta («✓ Hecho · deshacer: desconectar el troncal sano») y verde desde la primera captura, antes de tocar la IZQUIERDA, que la Consejera pidió primero. Es o un estado heredado de la partida que me pasaron, o un bug de orden.
2. [Mesa Castillo] Al aislar la cocina el paso 2 volvió a "abierto"; hay que reconectar la llave para cerrarlo. Es correcto según el tablero, pero no está dicho en el cartel.
3. [Mirar con Ohm (Q)] No abrió la observación en las cajas del patio ni en el horno/Faro. Solo el clic en el prompt «Mirar con Ohm» hizo algo (y en un caso movió al personaje).
4. [Refs/clics] Los botones «+»/«−» de los frenos y los bornes se vuelven "stale" tras cada clic: hay que volver a leer.
5. [Entrar sin querer] Un clic en el suelo cerca de la puerta de la casa de Vega me metió al interior (prompt «Salir» / «Entrar · Casa del molino»).
6. [Faro II] Un E extra sobre la caja del puente cambió el texto a «✓ Hecho · deshacer…» como si se hubiera deshecho; el estado final siguió bien pero la lectura es confusa.
7. [Faro II, trabado] La caja derecha de la plaza está detrás de los rieles y no pude entrar caminando.
8. [Carga] "Abriendo los caminos" tarda ~25 s al inicio (11% → 100%).

## 6. Ritmo
- Ritmo bueno en las mesas (de 3 a 5 pasos, con pistas). Lento en el movimiento y en los diálogos largos. Las Terrazas (~35 min) y el Lago (~25 min) estuvieron bien; el Castillo (~60 min) lo alargó la pelea con las cajas y la cámara.
- Hay momentos "mirar y esperar" (los diálogos repetidos de Vega y Yesca) que cortan la tensión del puzzle.

## 7. Top 10 a mejorar
1. Navegación con clics: que el personaje no se mande a lugares incorrectos (casa de Vega, pasillos fuera de la plaza).
2. Flecha o ruta visible hasta la siguiente caja/mesa (la marca dorada cambia y desaparece).
3. Que la caja del Faro II no quede detrás de rieles inaccesibles; revisar colisiones de la plaza.
4. Prompt «Mirar con Ohm» (Q) que no responde al tecla: revisar la acción.
5. Diálogos largos (10-15 Continuar): poder saltar (o agrupar) entre Yesca/Vega y Nereo.
6. Estado inicial de la caja derecha del Castillo (ya resuelta antes de tiempo).
7. Mensaje de Ohm en el Faro I: "Frená menos…" no explica que hay que usar un tendido paralelo; las pistas 1 y 2 llevaron a la solución pero la primera sugiere otra cosa.
8. Re-activación accidental de cajas: un E extra cambia el texto a «deshacer…» sin claridad.
9. Carga inicial de 25 s sin indicación de qué espera.
10. Clics en botones que se vuelven "stale" (lectura y automatización; para jugadores casi no afecta, pero hay que cuidarlo).

## 8. Top 5 de lo mejor
1. Las mesas con pasos visibles en la barra superior («Cómo está» + ✓) y el cartel «Todo el encargo está cumplido».
2. Los diálogos de Ivara, Vega y Yesca: el conflicto del agua y el fuego se entiende sin saber electricidad.
3. Las pistas de Ohm como preguntas guiadas ("¿Tiene que atravesar la cocina?", "¿Quién toma más?").
4. El medidor «Medir un camino» con «Una buena parte ▮▮▮▮▯▯» (barras en lugar de números): muy claro para un chico.
5. El arte: la luz de día en el Castillo, los reflejos del lago de noche, la estética de instalación.

## Ruta de este informe
/private/tmp/claude-501/-Users-manuel-code-proyecto-roxana/1353e795-f196-482d-93ed-96f990ee0a3e/scratchpad/playtest/informe-33-posta.md
