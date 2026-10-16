ESTADO ACTUAL: DETENIDO en El Faro II · falta la manivela derecha («acopla el motor») y luego abrir la mesa II; bloqueo por Edda junto al barandal (cierre 08:40)

# Informe de playtest: Ohmdal, Arco I, retomar desde el Castillo de la Red (posta 30)

Jugador de prueba: chico/chica de 12 a 15 años, sin conocimientos de electricidad.
Tramo: http://localhost:4190/?tramo=cerod. Pestaña propia: seed (1280x800).
Inicio de sesión: 07:56 (hora local). Hora de este informe: 08:10.

Nota técnica general: al empezar, el panel del navegador no estaba abierto. tabs_create falló; navigate abrió la pestaña y dio el tabId «seed».
Nota técnica general: las capturas a veces van un paso atrasadas (la Guía y la Bitácora aparecían abiertas en la captura cuando ya estaban cerradas). Confirmé con read_page.

## Lugar 1: Castillo de la Red (07:56 a 08:10, unos 14 min)

### Lo que hice
- Elegí «Continuar el viaje». Carga lenta (unos 20 s, pasó por 33% y 100%).
- Abrí la Bitácora (leí la entrada «El farol de Tala», con dos lecturas de Tala) y la cerré con su ×. No toqué «Descargar» ni «Versión libro A5».
- Abrí la Guía: dice «Una red que se puede comprender» y que la marca dorada de la brújula orienta al siguiente encuentro. Cerré con su botón «Cerrar».
- Abrí el mapa: el «Siguiente paso» está en el Castillo, y el «Tablero de los servicios del Castillo» figura como «por restaurar». Cerré el mapa con «Cerrar».

### Mesa 1: tablero de los servicios del Castillo (Ivara) → «Dos luces, un refugio»
- Ivara dio la pista: dos cajas de manivela en el piso del patio, una a cada lado, con su disco ámbar. «Primero la de la izquierda: separa el archivo oeste». Después la de la derecha, «que conecta el troncal de servicio».
- Hice clic en la manivela de la izquierda. La flecha dorada me llevó hasta ella. Dice «Separar el archivo oeste». Quedó «✓ Hecho · deshacer: conectar el archivo oeste». La etiqueta «deshacer» es confusa: dice «conectar» aunque lo que hice fue «separar».
- Antes de la manivela de la derecha, la manivela que tenía al lado decía «Conectar los servicios del Castillo». Ivara había pedido la izquierda primero, así que caminé hasta la otra. Ese orden fue lo que más me costó entender: no hay indicación en la manivela de «cuál primero».
- La manivela de la derecha quedó «✓ Hecho · deshacer: desconectar el troncal sano». Me sonó raro: «desconectar el troncal sano» suena a algo malo, aunque lo que hice fue conectar.
- En el tablero: nos pidieron que «enfermería y cocina tengan cada una su propio camino». Paso 1: «Enfermería con luz plena».
  - Problema: el cable que yo tendí de Retorno − a Enfermería − no lo entendí de entrada. Tardé en encontrar que el camino de la enfermería pasaba por la cocina, y el cable que la conectaba a la cocina era uno del tablero que había que retirar. Lo retiré con «Retirar el cable entre Enfermería − y Cocina +».
  - Después Enfermería quedó «✓ Funciona».
- Paso 2: «Cocina con luz plena». La cocina seguía «○ Quieto». Ohm preguntó «¿Recibe su fuerza por su cuenta, o a través de la enfermería?». No supe cómo cablear la cocina; usé la Pista.
  - La pista dijo: «un cable tuyo une los dos lados de Cocina; si la corriente puede pasar por el cobre, ¿qué le queda para atravesar Cocina?». Es decir, había un cortocircuito en la cocina. Lo resolví tendiendo Fuente + a Cocina +. Quedó «✓ Funciona».
- Paso 3: «Ivara vio la enfermería encendida con la cocina aislada». Giré la «Llave de la cocina» a «Aislada». Ohm: «Con la cocina aislada, la enfermería siguió encendida. Ivara lo vio». Volví a conectar la llave, como pedía Ivara «antes de reabrir».
- Cartel final: «Todo el encargo está cumplido». Pantalla de éxito: «¡Funciona! La luz se sostiene, clara y pareja. LO QUE VIMOS: En paralelo, cada luz tiene su propio camino».
- Puse la mesa en servicio con «Volver al mundo: la instalación queda en servicio». Volví al mundo.

### Lo que entendí de los conceptos
- Entendí, con ayuda, la idea de camino propio para cada luz (paralelo). Tengo la intuición de «la corriente vuelve a la fuente» pero no la tengo clara sin el tablero delante.
- Entendí «aislar una sin apagar la otra» gracias al cartel final, no por mi cuenta.
- Hice varias cosas por tanteo (quitar cables, probar conexiones) más que por razonamiento. La pista (cortocircuito) fue lo que me desbloqueó.
- No entendí del todo qué significa «troncal sano» ni «archivo oeste». Ivara los nombra sin explicarlos.

### Dónde me trabé (y cuánto)
- Orden de las manivelas: unos 3 min porque Ivara pidió «la izquierda primero» y la manivela más cercana era la otra.
- Caminar en el patio: el clic en el suelo me llevaba por rutas raras (rodeaba la torre, me alejaba). Con las flechas doradas funcionó mejor.
- Cortocircuito de la cocina: unos 5 min hasta la pista.

### Bugs y observaciones de interfaz
1. Clic sobre opciones fuera de pantalla: a veces el «ref» de un botón del tablero o de un aviso «E» cae fuera del viewport y el clic no llega. Hay que volver a leer la página o usar la tecla E.
2. La tecla E a veces no abrió el tablero: repetía la línea de Ivara («Mirar: Tablero»). Al final el tablero se abrió con «Abrir: Tablero de los servicios del Castillo» al estar parado frente a él.
3. Un par de veces el personaje no llegó al tablero con clic en el suelo: quedaba junto al estandarte («E El reverso del estandarte»), y tuve que caminar con A/W.
4. La pista del tablero (botón «Pista») desaparece tras resolver el paso; después aparece «Otra pista». Ambas son útiles.
5. Captura: el tablero se ve cortado a la derecha en la captura reducida (como avisó el encargo). Read_page sí muestra todo.

### Textos que me confundieron
- «✓ Hecho · deshacer: desconectar el troncal sano» (manivela de la derecha).
- «✓ Hecho · deshacer: conectar el archivo oeste» (manivela de la izquierda, que yo separé).
- «Cables en la mano: 2 · tocá dos bornes para tender uno»: no me quedó claro al principio que hay que tocar dos bornes en orden. Sólo me enteré tocando.

### Lo que me gustó
- La flecha dorada y el aviso «Mirar: ...» dejan claro dónde ir.
- Ohm dice qué observar y, si me trabo, la pista es concreta.
- El cartel final «Lo que vimos» explica el concepto con una frase.

## Lugar 2: Las Terrazas (08:10 a 08:20, unos 10 min de juego + diálogos)

### Lo que hice
- Tras el Castillo, Ivara dice «Lo que compartimos» y Ohm marca «Hacia Las Terrazas». Salí por el portón (flecha dorada), seguí el sendero al noreste y llegué a Las Terrazas (hora cambia a «Atardecer»).
- Diálogos con la forjadora Yesca («Mi forja hace las herramientas») y la operadora Vega («Cuando sube tu horno, baja mi bomba»). Ohm: «Las dos tienen razón. El cable de la ladera es uno solo».
- Mesa-puente: «Abrir el canal de los bancales» (manivela junto a la casa): quedó «✓ Hecho · deshacer: cerrar el canal». Ohm: «El agua puede alcanzar los bancales cuando la bomba sostenga su trabajo».
- La flecha dorada me llevó a la forja: al llegar, el horno se usa solo («Hecho · deshacer: devolver el horno a su palanca propia»). Ohm dijo «el horno entra en el tablero de Vega». Este uso automático al llegar a la flecha me sorprendió: no pulsé E ahí.
- Mesa «Tablero de calor y riego» (bomba de Vega): «La paciencia del invernadero». Objetivo: repartir la línea entre raíces, riego y horno sin que el cable de la ladera se caliente.
  - Freno del calor 1/5 → 3/5: el lecho de raíces pasó a «Funciona» (paso 1: raíces tibias).
  - Freno del agua 1/5 → 3/5: la bomba de riego pasó a «Funciona».
  - Cable seguía «Se calienta». Ohm: «Si el cable sigue caliente, alguien tiene que ceder. ¿Quién toma más? El instrumento puede decirlo». Probé subir el freno del horno 1/4 → 2/4: el cable pasó a «Fresco» y el tablero se resolvió («¡Funciona!»). No usé «Medir un camino».
  - Puse la mesa en servicio con «Volver al mundo: la instalación queda en servicio».
- Escena posterior: «El agua alcanza el último bancal». Vega y Yesca se despiden; Yesca dice «Frenaron mi horno y las raíces ni se enteraron» (la queja me resultó fuerte para una escena de 'se resolvió').
- Siguiente paso: «La orilla de la señal» → Lago de las Señales.

### Lo que entendí de los conceptos
- Entendí, con las pistas de Ohm y el cartel «Fresco», la idea de «cable que se calienta si toma demasiada corriente». Probé frenos sin saber la fórmula.
- No entendí del todo por qué el freno del horno cambió el calor del cable: el cartel dice «alguien tiene que ceder» pero no dice que el horno es quien cede. Sentí que aprendí a repartir por tanteo.
- Lo que más se entiende es el "reparto": la línea tiene un límite y lo que toma uno no lo toman los otros (cartel final). Clarísimo al final, no antes.

### Dónde me trabé
- Ninguna mesa se me trabó más de 3 min. El cable caliente me llevó unos 2-3 min de prueba.
- Caminar al horno: la flecha dorada me hizo caminar en vuelta por la aldea. Hay que clicar varias veces la flecha.

### Bugs y observaciones de interfaz
1. Al llegar a una flecha dorada que está en un objeto usable (horno), el objeto se usa automáticamente sin pulsar E. Es confuso: no sabés qué pasó hasta que aparece «Hecho».
2. Un clic en «Continuar» de una conversación de la forja dejó abierta la observación «Régimen del horno de Yesca» a la derecha, cortada en pantalla. La cerré con su ×, con ref.
3. En el tablero de Terrazas, al tocar «Freno del calor: frenar más» la referencia quedó obsoleta tras cada clic (hay que releer la lista de controles). No es un bug de juego, pero sí molesta para un jugador que usa lector.

### Textos que me confundieron
- «Hecho · deshacer: devolver el horno a su palanca propia»: no entiendo qué significa «palanca propia».
- «Lo que compartimos»: el objetivo dice «Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar». Es claro.
- Cartel del tablero: «Repartí la línea: raíces, riego y horno, sin que el cable se caliente». Claro.

### Lo que me gustó
- Los carteles «Funciona», «Quieto», «Fresco», «Se calienta» son muy claros: se entiende el estado sin leer más.
- La escena final de Vega («Voy a anotar las alturas... si mañana cambian, tenemos con qué comparar») es lindo y da sentido al tablero.

## Lugar 3: Lago de las Señales (08:20 a 08:28, unos 8 min)

### Lo que hice
- La flecha dorada me llevó desde Las Terrazas por el sendero; llegué a la Ribera de las Señales («Crepúsculo»). Bitácora automática con diálogos (el Viejo del muelle, Vale, Ohm, Nereo).
- Nereo (Farero Mayor) está en el muelle. Hablé con él con E (la primera E sólo mostró su descripción, la segunda abrió el diálogo). Con Nereo: «Las uniones del muelle las hago yo». Dijo que el retorno, entre las cañas, lo cierro yo.
- Mesa: «Conectar el retorno entre las cañas» (manivela/caja de la orilla). Quedó «✓ Hecho · deshacer: desconectar el retorno de la orilla». Bitácora: «La línea del Faro está completa». Nereo: «Yo llevo la llave».
- Siguiente: «El Faro · I / III» (tres balizas). No empecé el Faro: el tiempo se me fue en el trabajo de caminar.

### Dónde me trabé
- Dos a tres minutos de pelea con los arbustos de la orilla: el personaje quedó dentro de los arbustos (en silueta, sin poder llegar a la caja de la baliza). Con clics en el suelo no llegaba; con W/A/S/D se movía muy poco por tecla (un repeat de 10 apenas corrió 1-2 pasos). Lo desbloqueó un clic en el suelo fuera de los arbustos y después caminar con A.
- La tecla E para hablar con Nereo: la primera no abrió el diálogo, sólo la descripción.

### Bugs y observaciones de interfaz
1. Atasco en los arbustos de la orilla del lago (Ribera de las Señales). Hay que pulsar en varias direcciones para salir. Es un bug de colisiones / pathing y es grave para alguien que no tiene paciencia.
2. Movimiento por teclado lento: «repeat 10» de la tecla A movió el personaje muy poco. Quizá la tecla se procesa por cuadro, no por pulsación.
3. Ohm/Nereo se superponen con el personaje en la vista (algunas siluetas quedan detrás de los arbustos y no se ve dónde estás).

### Textos que me confundieron
- Nereo: «Las uniones del muelle las hago yo: las hice más veces que ustedes años». Me gustó, pero no supe qué era una «unión» al principio.
- «✓ Hecho · deshacer: desconectar el retorno de la orilla»: es el mismo patrón de los textos «deshacer» que ya vi. Confunde para un lector nuevo.

### Lo que me gustó
- Nereo y el muelle tienen personalidad: «Aprendí el ritmo del Faro antes que las letras».
- La Bitácora da contexto: «Nereo fija la bornera junto a las bobinas, sin mirar» y «las balizas no contestan», ayuda a entender el objetivo sin leer el manual.

## Lugar 4: El Faro (08:28 a 08:35 hasta el momento; faro I de III)

### Lo que hice
- Crucé el puente de la orilla (flecha dorada) y llegué al Espigón del Faro («Noche»). Bitácora y diálogos con Nereo y Edda.
- Primera mesa: «I · El pulso del Faro» (la «Fuente del Faro», al pie de la torre). Problema: «Tendido norte: Se calienta», con el «Regulador del generador» 4/6 → 2/6 para dar fuerza al núcleo.
- Pista 1 de 4 de Ohm: «Frenar menos con el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte». Yo ya lo había visto (el norte y el regulador van en serie).
- Solución que encontré: tender el «Tendido sur» en paralelo con el norte (bornes A con A y B con B), 4 cables, dos tendidos lado a lado. Quedó «✓ Fresco» en ambos y el núcleo «✓ Funciona». Cartel final: «Dos tendidos lado a lado se reparten la corriente: cada uno lleva la mitad y se calienta mucho menos».
- Puse la mesa en servicio. La Bitácora dice «La base responde con un acorde profundo» y Nereo: «la manivela izquierda lo aparta, la derecha une el motor con la corona».
- Siguiente: «El Faro · II / III».

### Lo que entendí
- Entendí el reparto en paralelo sólo al resolverlo; lo que se ve al final («cada uno lleva la mitad») es claro.
- Antes no tenía claro por qué frenar menos calentaba el norte. La pista 1 lo dijo bien.

### Bugs y observaciones
1. Al llegar a la flecha dorada de la fuente, la mesa de la base («abrir el retorno de la base») quedó «✓ Hecho» sin pulsar E. Es el mismo caso de la forja (Terrazas): al llegar a la flecha, el objeto se usa solo.
2. Dos botones con el mismo nombre en el HUD: «Cerrar el retorno de la base» (un botón de un objeto que puede deshacer lo hecho) y «Cerrar» (de la Guía). Al buscar «Cerrar» con find aparecieron ambos. Es fácil tocar el de la base sin querer.
3. «Pista» desaparece al resolver el paso y aparece «Otra pista». La pista 1 de 4 aparece en el recuadro de Ohm, no como un cartel.
4. Al hacer clic en el botón «Pista», la página no mostró la pista de inmediato: al volver a leer, la pista ya estaba en el recuadro de Ohm. Parece un retraso de un paso.

### Dónde me trabé
- Unos 4 minutos en el tablero I (el regulador y el norte). La pista 1 lo aclaró.

## Lugar 4b: El Faro II / III (08:35 a 08:40; detenido)

### Lo que hice
- Flecha dorada → el puente de servicio, con Edda («La base responde. Ahora sigo los caminos que salen de ella...»). Edda repite sus líneas en cada E.
- Manivela izquierda (puente gastado): «✓ Hecho · deshacer: reconectar el puente gastado». Se hizo al pasar junto a ella; no sé con certeza si la activé con E o al caminar.
- Manivela derecha («acopla el motor»): NO la pude resolver. La Guía dice «Entre la mesa I y la mesa II hay dos manivelas... Después abrí la mesa II». Quedé trabado junto a Edda, con el barandal del Faro y el disco verde de la manivela del otro lado.

### Dónde me trabé (y por qué)
- Unos 15 minutos entre 08:25 y 08:40 para llegar a la manivela derecha. Edda se queda en el paso (las manivelas están junto al barandal) y el personaje queda pegado a ella: cada vez que me acerco aparece «E Edda» y el movimiento se traba. Rodear por norte o por sur con W/A/S/D no alcanzó de forma confiable.
- Cerré la prueba en este punto (no completé el Faro II/III ni el III; el Arco I no llegó a «ARCO I · COMPLETO»).

### Bugs y observaciones
1. Bloqueo por NPC: Edda ocupa el paso estrecho del Faro y el personaje no sale; el "E Edda" tapa el aviso de la manivela. Grave: no se puede avanzar sin reiniciar la posición.
2. Diálogo en bucle: cada E sobre Edda vuelve a repetir la misma línea («La base responde...» y «En el Castillo pudimos separar dos servicios...»). No hay forma de salir del bucle sin caminar.
3. El aviso «E Edda» tiene prioridad sobre las manivelas cercanas, incluso cuando la manivela queda más cerca.
4. Textos de la Guía: «Abrí la Fuente del Faro, la primera mesa, al pie de la torre» y «Entre la mesa I y la mesa II hay dos manivelas» son claros; el problema es el paso, no el texto.

### Lo que me gustó (Faro)
- El tablero del Faro: el paralelo entre el tendido norte y el sur se entiende bien al resolverlo. El cartel final lo resume de forma clara.
- Nereo: «Cobre que se queja, cobre que descansa» es una frase que se queda.

## Cierre del playtest
- Hora de cierre: 08:40 (unos 44 minutos de sesión). Pestaña: seed. Se cerró el panel y se restauró el viewport al final.
- Motivo de cierre: no se pudo avanzar a la manivela derecha del Faro II (bloqueo por Edda).

## Resumen por temas

### 1. Bitácora (¿la usaste? ¿hacía falta?)
- La usé al empezar (leí «El farol de Tala», el registro de lecturas de la posta anterior) y luego abrí la Guía y el mapa. La Bitácora no es obligatoria, pero el «Lo que hay detrás» con las lecturas de Ohm sí explica el concepto (tensión / corriente). Cerré todo con sus × (nunca toqué «Descargar» ni «Versión libro A5»).
- Las entradas automáticas («Bitácora: ...») durante la partida son buenas para contexto corto; a veces son demasiadas líneas seguidas.

### 2. Navegación
- Lo que mejor funcionó: la flecha dorada y el clic sobre ella. Llevó bien al portón, al sendero, al puente y a varias mesas.
- Lo que peor funcionó: el personaje se atasca en arbustos (orilla del Lago) y entre el NPC Edda y el barandal del Faro. El movimiento por teclado es lento (un «repeat 10» apenas mueve un paso).
- A veces el clic en el suelo lleva a un punto raro (rodea la torre, queda junto al estandarte).
- Captura reducida: el tablero se corta a la derecha; read_page sí muestra todo. Las capturas van, a veces, un paso atrasadas.

### 3. Arte y presentación
- Muy buen nivel: la torre del Castillo, la forja de las Terrazas con su horno, el muelle del Lago y el Faro de noche. Los tableros de estilo «cuaderno de campo» se leen bien.
- Los carteles de estado («Funciona», «Quieto», «Fresco», «Se calienta», «Casi») son claros y dan lectura rápida sin texto largo.
- La transición de día («Tarde», «Atardecer», «Crepúsculo», «Noche») se nota y ayuda.

### 4. Diálogos e historia
- Los personajes se entienden: Ivara (cuidadosa), Vega (práctica), Yesca (cansada), Nereo (chistoso y con respeto), Edda (tranquila).
- Lo que más me gustó: Nereo («Aprendí el ritmo del Faro antes que las letras») y Vega («si mañana cambian, tenemos con qué comparar»).
- Lo que me costó: muchas líneas muy cortas en secuencia («Continuar» uno tras otro). Con Edda el diálogo se repite en bucle. Ohm dice cosas como «Unidad no reconocida» que son graciosas pero no ayudan.
- Hay palabras que no entiendo sin explicación: «troncal», «archivo oeste», «unión», «palanca propia», «corona», «motor». Ohm las usa sin definirlas.

### 5. Errores o bugs
1. Atasco en arbustos del lago y entre Edda y el barandal del Faro (el peor: bloquea el avance).
2. Diálogo de Edda en bucle: cada E repite la misma línea.
3. Auto-uso al llegar a una flecha dorada: el objeto (horno, base, manivela del puente) se activa sin pulsar E. Queda como «✓ Hecho» sin que el jugador lo haya elegido.
4. «E Edda» tapa el aviso de la manivela cercana.
5. Textos de deshacer confusos: «✓ Hecho · deshacer: conectar el archivo oeste» (cuando lo que hice fue separar), «deshacer: desconectar el troncal sano» (suena a algo malo), «devolver el horno a su palanca propia».
6. Dos botones «Cerrar» con nombres parecidos en el HUD (el del tablero y el de la Guía). Con find aparecen juntos.
7. Pista: al pulsar «Pista» el texto no se ve de inmediato; hay que releer la página.

### 6. Ritmo
- Sesión: 07:56 a 08:40 (unos 44 min). Lugares: Castillo (14 min con 1 mesa de 4 pasos), Terrazas (10 min, 1 mesa de 2 pasos), Lago (8 min, 1 mesa), Faro I (8 min, 1 mesa). Faro II: 15 min sin terminar (bloqueo).
- El ritmo se siente bien en las mesas. Lo que frena es caminar: en cada lugar hay muchas pausas por clic-y-espera, y las escenas largas (Nereo, Ivara) tienen mucho «Continuar».
- Para llegar a «ARCO I · COMPLETO» haría falta resolver el Faro II y III, la Casa de Compuertas y las demás mesas del mapa (faltaron unos 3 lugares).

### 7. Top 10 a mejorar
1. Bloqueo por NPC (Edda en el paso del Faro): debería haber un paso libre o un empuje.
2. Atasco de movimiento en arbustos de la orilla del Lago.
3. Diálogo de Edda en bucle (cada E repite la misma línea).
4. Auto-uso al llegar a la flecha dorada (la mesa se activa sin E).
5. Aviso «E Edda» que tapa la manivela cercana (prioridad del NPC sobre el objeto).
6. Textos de «deshacer» confusos («desconectar el troncal sano», «conectar el archivo oeste» tras separar).
7. Movimiento por teclado lento o con poca respuesta (repeat de la tecla).
8. Dos botones «Cerrar» con nombres parecidos (el de un objeto puede deshacer algo).
9. Vocabulario sin definir (troncal, archivo oeste, unión, palanca propia, corona, motor).
10. Las capturas se atrasan un paso: el tester puede creer que un menú sigue abierto.

### Top 5 de lo mejor
1. Los carteles de estado («Funciona», «Fresco», «Se calienta», «Quieto») se leen de un vistazo.
2. Los tableros con cierre tipo «Lo que vimos» explican el concepto en una frase (paralelo, reparto de corriente, aislar una luz).
3. La pista de Ohm por niveles («Pista 1 de 4») llega al punto justo.
4. Nereo y Vega: personalidad clara y frases memorables.
5. Arte y transición de día (Tarde, Atardecer, Crepúsculo, Noche) con la torre del Faro y la aldea de las Terrazas.
