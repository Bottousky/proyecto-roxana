# Informe playtest 29 (posta) — Arco I, continuar desde La Calzada

ESTADO ACTUAL: BLOQUEADO en Castillo de la Red (lugar 3 de ~6) · seccionadores del portón y tablero de servicios sin aviso de uso · lugares 1 y 2 resueltos · sesión cerrada 07:55.

Inicio: 2026-10-16 07:16 (hora local, -03). Pestaña: seed (localhost:4190, 1280x800).

## Lugar 1: La Calzada (punto de partida)

Tiempo aprox.: 07:16 a 07:25 (9 min: carga, controles y mesa).

Estado al entrar (sólo lo que muestra el juego): Bitácora con la hoja «La Calzada · EN ESTUDIO», la puerta sin cerrojo, «2 de 9 luces encendidas», objetivo «El otro lado de la puerta». Mapa y Guía no los leí a fondo (decidí ir por la Bitácora y los diálogos).

Pasos:
- Cierre bajo las hojas (E): el primer intento (E a distancia) no hizo nada; hizo falta acercarse hasta que apareció el aviso «Unir el cierre bajo las hojas». Diálogo: «Las balizas de la Calzada se encienden una tras otra…». Después Edda: «Llegó. Pero el cerrojo no levanta… abrilo y mirá su mesa».
- Mesa «El cerrojo que escucha» (regulador de la puerta de Ohm). Objetivos: (1) empujar hacia la marca de avance, (2) con fuerza firme, ni tiembla ni golpea.
  * Al principio el cerrojo empujaba para abajo. Ohm pidió revisar el sentido. Lo que hice: quité el cable Avance+ → Retorno−, tendí Retorno− → Avance−, y eso cortó la alimentación («Se oyó un clic… protección cortó la alimentación… un camino une + y − sin ningún receptor»). Lo entendí por la explicación de Ohm, bien dicha.
  * Después quité Freno B → Avance− y tendí Freno B → Avance+. El paso 1 quedó tildado.
  * Paso 2 pedía fuerza justa. La bobina decía «Demasiada fuerza» con el puente de cobre (0 Ω). Elegí la primera piedra de la lista (marrón, negro, negro y oro = 10 Ω) sin entender por qué; no abrí la Pista. Ohm dice «Del puente de cobre a la piedra de 10 Ω… 0,85 A a 0,50 A: más freno, menos corriente». Ganó, pero no fue una decisión razonada: ni sé qué es Ω ni por qué 10 y no 47.
  * Mesa resuelta, pantalla de éxito «¡Funciona!». Usé «Seguir la historia».
- Cutscene: Vale «¿Qué cambia entre empujar para arriba y para abajo?», Ohm (medidor), Edda («Cede a quien te da toda la Luz», «la bolsa de piedras de freno de mi abuela… por los anillos»). Vale: «Cambió el sentido… con la piedra justa en el zócalo». Sale «El cerrojo libera la Puerta de Ohm».

Estado al salir: La Calzada resuelta. Nuevo objetivo: «Donde empieza el agua · Hacia El Manantial». Ohm: «Distancia hasta la próxima pregunta: aproximadamente un camino».

Problemas técnicos (lugar 1):
- tabs_create falló («Browser pane gone, gate off, or tab cap reached»); usé navigate y la pestaña quedó con tabId «seed».
- Al entrar la pantalla de carga («Tejiendo Ohmdal 96%» luego «Abriendo los caminos 33%») tardó ~25 s. El primer clic en «Continuar el viaje» pudo caer en la carga; hubo que esperar.
- Movimiento: clic en el suelo o en un objeto a veces no caminaba; WASD sí, con repeat. Los avisos de uso sólo aparecen muy cerca del objeto; a distancia no pasa nada.
- Refs de read_page caducan después de cada clic («ref is stale») y algunos clics por coordenadas no se registraron en el tablero. Lo que funcionó bien fue leer con read_page(interactive) y clicar por ref, releyendo tras cada acción.
- El tablero es más ancho que la captura: la captura muestra la mitad derecha cortada. get_page_text y read_page sí muestran todo.
- Una captura tomada justo después de un clic mostró el estado anterior; hubo que esperar 2 s y repetir la captura.
- Clic en el × de la Bitácora (ref «Cerrar») cerró bien; no toqué ningún botón de descarga.
- Un clic a ciegas en la × de la Bitácora por coordenadas (1216,47) estuvo cerca de los botones de descarga. Sólo se cerró la Bitácora; no se descargó nada (no verifiqué archivos, no tengo permiso de red).
- Los diálogos de Edda se cortan a la derecha en la captura (el botón «Seguir» aparece recortado); se avanzó con Enter sin problema.
- Ohm dice «Puedo mostrar el sentido de la lectura» pero el tablero no explica por sí solo el sentido de la corriente; hacía falta leer el texto de la cabecera.

ESTADO ACTUAL: BLOQUEADO en Castillo de la Red (lugar 3 de ~6) · seccionadores del portón y tablero de servicios sin aviso de uso · lugares 1 y 2 resueltos · sesión cerrada 07:55.

## Lugar 2: El Manantial (Cabecera del agua) · tarde, día 1
Tiempo aprox.: 07:25 a 07:40 (~15 min; lo que más tardó fue ubicar la bomba y las manivelas).

Entrada: viaje automático por el sendero (esperé ~8 s sin clicks, como indica la guía). Diálogos: Bitácora («La rueda está quieta…»), Vega («Soy Vega; cuido el agua…»), Vale («¿Vos apartaste el agua de la rueda?»).

Mesa 1 — «El farol de Tala» (Mostrale a Tala dónde está la fuerza de su farol):
- Concepto: comparar dos puntos (tensión). Tala/Ohm/Vale dicen «tensión» y «la fuerza se queda donde se trabaja».
- Lo que hice: apoyar puntas en Farol+ y Farol− (casi todo el empuje de la pila: «casi seis»); luego en Cordón A y Cordón B («casi nada»). Resuelta.
- Entendí la idea «se mide entre dos puntos». No entendí del todo por qué el cordón tiene casi cero: el texto dice «sólo conduce» pero no lo conecto con el cobre. Lo acepté como dato.
- Pantalla de éxito «¡Resuelto!» con «Seguir la historia».

Mesa 2 — «Lo que se pierde en el camino» (Bomba del manantial, Encontrá el empalme que pierde fuerza y puentealo):
- Tres empalmes en serie y la bomba. Medí A–B de cada empalme con «Comparar dos puntos»: Empalme 1 casi no pierde; Empalme 2 «Pierde fuerza»; Empalme 3 casi no pierde.
- Puenteé Empalme 2 (cable de A a B). Paso 1 y paso 2 ok.
- Pedía además «La cuenta de la vuelta»: retiré el puente un momento, medí E1 (0,08 V), E2 (7,06 V), E3 (0,08 V), Bomba (4,71 V); suma 11,93 V frente a 12 V de la fuente. Vega: «Ningún voltio se perdió». Volví a tender el puente. Ahí entendí algo de la suma de tramos: la fuente se reparte. Muy bien explicado en el texto de Vega.
- Problema: la pantalla de éxito tardó en mostrar «Seguir», no fue fácil saber que había un 2.º paso (la cuenta) después de «Funciona».

Incidentes de la mesa:
- Al poner Retorno− → Avance−/empalme, el juego cortó la alimentación con «Se oyó un clic: la protección cortó la alimentación…». Está bien explicado. (Lugar 1, no 2.)

Problemas técnicos (lugar 2):
- Al intentar usar «Tala» con E (estaba al lado de la bomba/manantial), el aviso decía «Tala» y E tocó una manivela: «Esto ya está como corresponde. Para deshacerlo, usalo otra vez.» El nombre del aviso no coincide con lo que activa E: confuso.
- El aviso «E ✓ Hecho · deshacer: separar el generador de la rueda» reaparece cerca del molino aunque ya lo hice; puede confundir si uno quiere volver a usarlo.
- Un clic en el suelo cerca de la bomba no caminó; lo hizo con WASD (ocho o más pulsaciones).
- Los diálogos de Vega/Vale/Tala se encadenan muy largos (6–8 Enter por escena). Sin «Saltar escena» hay que pulsar muchas veces.
- En «Comparar dos puntos» el mensaje de Ohm en la base («Apoyá las puntas…») es un buen hint.

Pistas que necesité: ninguna (no abrí «Pista»).

ESTADO ACTUAL: BLOQUEADO en Castillo de la Red (lugar 3 de ~6) · seccionadores del portón y tablero de servicios sin aviso de uso · lugares 1 y 2 resueltos · sesión cerrada 07:55.

## Lugar 3: Castillo de la Red (Loma de la Red) · tarde, día 1 — BLOQUEADO
Tiempo aprox.: 07:45 a 07:53 (~8 min de reloj; el bloqueo ocurrió en ese tramo).

Cómo llegué: el objetivo «Una red que se puede comprender» (Manantial) pedía «Buscá el acceso a Castillo de la Red». La marca dorada estaba sobre el puente-acueducto; el personaje quedó oculto detrás de la arcada/puente varias veces. Lo que destrabó fue cruzar por el sendero de cuerda hasta el pin del camino de piedra y usar E en «Camino a: Castillo de la Red». Sin esa pista de la Guía/Mapa no lo habría encontrado a tiempo.

Lo que ocurrió (con el tiempo real, 07:45–07:53):
- Consejera Ivara («La Red permanece sellada», «Soy Ivara… la repararon. Tres días después ardieron dos distribuidores», «Traían números… La Luz no cumple promesas»). Vale y Edda también hablan. Diálogos muy largos.
- Ivara dice: «Dos seccionadores, uno a cada lado del patio. Primero el de la izquierda: separa el archivo oeste, que está dañado. Después el de la derecha… En ese orden; al revés, la protección salta.» Y luego: «Terminen el tablero y abriré el paso de servicio.»
- Encontré el objeto «El reverso del estandarte»: un recuerdo de la Bitácora («un plano de la red bordado con hilo de cobre»). Lo tomé con E.
- El «Tablero de los servicios del Castillo» (el panel de tres diales junto a la pared) muestra solo «Mirar: Tablero…». Pulsar E sólo repite la línea de Ivara; no abre ninguna mesa. Probé Q (Mirar con Ohm) con el mismo resultado: ningún cambio.
- Los dos seccionadores (engranajes sobre el muro, a cada lado del portón) no mostraron ningún aviso de «Abrir» en ninguno de los puntos en que me puse (frente al portón, al pie del muro a la izquierda, dentro del patio). No pude activarlos. Tampoco hay disco azul (mesa) visible en el Castillo.
- Hay un aviso «Camino a: Las Terrazas» justo en el portón; si uno pulsa E sin querer, se va y deja el Castillo sin resolver.

Dónde me trabé y por qué: no encuentro la forma de usar los seccionadores. Ivara pide que los use en orden, pero el juego no ofrece el aviso, y el tablero no se abre hasta que se hagan. Probé: acercarme al engranaje desde varios lados, E en el tablero, Q, leer Bitácora/Guía/Mapa. La Guía dice «buscá con la Consejera… la marca dorada te orienta» y el objetivo sigue igual. No abrí «Pista» porque no había mesa abierta donde esté el botón.

Pistas usadas: Guía y Mapa (sólo para orientarme). Ninguna pista de mesa.

Problemas técnicos (lugar 3):
- El personaje se oculta detrás del acueducto y de muros (oclusión): no se lo ve al caminar sobre el puente.
- El pin del objetivo puede quedar debajo de un arco: hay que dar la vuelta por el camino de cuerda para llegarle.
- Los diálogos de Ivara se repiten al volver a pulsar E en el tablero: parece un bucle de «Mirar» más que una mesa.
- Los avisos «E» en el portón mezclan «Camino a» con otras acciones: alto riesgo de salir sin querer.

ESTADO ACTUAL: BLOQUEADO en Castillo de la Red (lugar 3 de ~6) · seccionadores del portón y tablero de servicios sin aviso de uso · lugares 1 y 2 resueltos · sesión cerrada 07:55.

## Resumen final (playtest 29, posta)

Llegué a: La Calzada (1 mesa, «El cerrojo que escucha», resuelta), El Manantial (2 mesas: «El farol de Tala» y «Lo que se pierde en el camino» con la cuenta de la vuelta, resueltas), Castillo de la Red (bloqueado). Quedan sin recorrer: Terrazas, Lago de las Señales, El Faro, Casa de Compuertas, Monte Quieto y el cierre del arco.

Tiempos reales (reloj): inicio 07:16; La Calzada 07:16–07:25; El Manantial 07:25–07:40; Castillo 07:45–07:53.

1. Bitácora: la abrí al inicio (hoja «La Calzada · EN ESTUDIO», «Pruebas que conservé») y después sólo como observaciones de viaje. Me ubicó, pero la Guía y el Mapa fueron más útiles para saber el siguiente paso (el Mapa listó lugares y el texto «la marca dorada de la brújula…»). Un clic por coordenadas para cerrarla (1216,47) estuvo cerca de «Versión libro A5». La Bitácora se cerró y no vi ninguna descarga, pero no pude verificarlo: no tengo permiso de red ni de Descargas. Conviene revisar si apareció algún archivo nuevo en Descargas.
2. Navegación: WASD con repetición fue lo más fiable; el clic en el suelo a veces no caminaba. Los avisos de uso sólo aparecen a muy poca distancia (hay que acercarse hasta que aparezca el aviso). El personaje se oculta detrás del acueducto y de los muros. La marca dorada puede quedar bajo un arco y obligar a dar un rodeo por el camino de cuerda. «Camino a: …» se activa con E y el viaje es automático (esperar sin clics).
3. Arte y presentación: escenarios bonitos y legibles, personajes con carácter, la rueda y la bomba se animan cuando se acoplan. El tablero de mesa es más ancho que la captura (1280): se corta a la derecha y hay que confiar en read_page.
4. Diálogos e historia: tono cálido y con humor (Vega, Tala, Edda). Ohm explica bien lo que pasó (corte por cortocircuito, la «cuenta de la vuelta» con 12 V). Los diálogos son muy largos: en Manantial hubo 6–8 Enter por escena. Ivara es vaga («Terminen el tablero y abriré…») y no dice qué significa «el tablero» ni cómo se usa.
5. Errores o bugs:
   - tabs_create falló; navigate creó la pestaña (tabId «seed»).
   - Los refs de read_page caducan después de cada clic («ref is stale»); clics por coordenadas en el tablero a veces no se registran.
   - Una captura tomada justo después de un clic a veces muestra el estado anterior: hay que esperar 2 s.
   - En El Manantial, E con el aviso «Tala» activó una manivela de la bomba («Esto ya está como corresponde…»): el aviso no coincide con la acción.
   - El aviso «✓ Hecho · deshacer: separar el generador de la rueda» reaparece cerca del molino mucho después.
   - En el Castillo, E sobre «Mirar: Tablero de los servicios» sólo repite la línea de Ivara; Q (Mirar con Ohm) no cambia nada; los seccionadores no muestran ningún aviso (probé el pie del muro a izquierda y derecha, el patio y el portón). Bloqueo total de progreso sin causa visible.
   - En el portón aparece «Camino a: Las Terrazas» justo donde uno pasa; un E accidental salta el Castillo sin resolverlo.
   - Los diálogos de Edda y Vale se cortan a la derecha en la captura (el botón «Seguir» queda recortado); se avanza con Enter.
6. Ritmo: primer lugar lento por el aprendizaje de controles (9 min); segundo (15 min) con mucha búsqueda de mesas; tercero se trabó tras ~8 min de pruebas. El sistema de «Camino a…» y los diálogos encadenados alargan todo.
7. Top 10 a mejorar:
   1. Castillo de la Red: no se ve cómo usar los seccionadores ni cómo abrir el tablero (bloqueo total).
   2. Las mesas no se distinguen bien desde el mundo (el disco azul no aparece en el Castillo ni en el Manantial): cuesta encontrar qué es una mesa.
   3. El texto del aviso no coincide con lo que hace E (Tala vs manivela).
   4. Diálogos muy largos, sin «saltar» en las conversaciones normales (sólo en cutscenes).
   5. Caminar con clic poco fiable; hace falta WASD con repetición.
   6. Interacción sólo a muy poca distancia y sin ayuda de «acércate».
   7. Personaje oculto detrás de puentes y arcos.
   8. Jerga sin introducir para 12–15 años: «Ω», «A», «V», «tensión», «corriente», «resistencia». Elegí la piedra de 10 Ω por orden de la lista, sin entender por qué; la Pista no la abrí.
   9. Aviso «Camino a…» junto a la entrada de un lugar sin terminar: riesgo de salir por accidente.
   10. Tableros más anchos que una pantalla de 1280 px: se cortan a la derecha.
Top 5 a destacar:
   1. La mesa del cerrojo: el cortocircuito (+ unido a − sin receptor) muestra la protección y Ohm lo explica bien.
   2. «La cuenta de la vuelta» en el Manantial: 0,08 + 7,06 + 0,08 + 4,71 ≈ 12 V. Cierra el concepto con una suma clara.
   3. «Comparar dos puntos» como herramienta: medir entre dos bornes es intuitivo.
   4. Personajes y tono (Vega, Tala, Edda) con humor y sin moralina.
   5. Arte y animación de los mecanismos (rueda, bomba, farol, cerrojo).
