ESTADO ACTUAL: ARCO I · COMPLETO alcanzado (09:15). Mesas resueltas en El Faro: II (Tres voces en la torre) y III (La luz que sabe volver). Sesión terminada.

# Informe de playtest 31 (posta) — Ohmdal, Arco I desde El Faro

Inicio: 2026-10-16 08:52 (hora local). Pestaña: seed (tabs_create falló; se usó navigate).
Viewport: 1280x800.

## Bitácora de sesión (cronológica)

- 08:52 Abrí http://localhost:4190/?tramo=cerod. Menú principal visible.
- 08:53 Elegí «Continuar el viaje». Pantalla de carga «El Faro» (Ω) con fondo azul, unos segundos; luego mundo cargado.
- Objetivo visible (tarjeta arriba a la izquierda): «El Faro · II / III» — «Entre la mesa I y la mesa II hay dos manivelas: la izquierda aparta el puente gastado; la derecha acopla el motor. Después abrí la mesa II.»
- Abrí la Bitácora (J). Veo «El farol de Tala» (en estudio, el Manantial, circuito con cordón + farol 6 V). Hay índice de 11 hojas; la hoja 09 es «Faro · I. El primer escalón». La hoja tenía «Descargar la Bitácora» y «Versión libro A5» en la parte superior derecha: NO los toqué a propósito.
- Incidente (cerrado sin confirmar): al cerrar la Bitácora usé el ref «Cerrar» (ref_73) y el clic cayó en (1216,47), que en la vista quedó cerca del botón «Versión libro A5». La Bitácora se cerró y no vi ninguna descarga ni cambio visible; no puedo confirmar del todo que no fuera otro botón. Anotado para revisar: el botón × debería ser inequívoco y no estar pegado a los botones de exportación. Desde ahora cierro con × verificado en captura a escala completa.

## Mesa I (ya resuelta por otros) — no jugada.

## Faro · II (Tres voces en la torre) — 08:58 a 09:04 aprox.
- Manivela derecha «Acoplar el motor de la corona» (E): funcionó. Diálogo Ohm (aviso del puente aislado), Nereo, Vale, Edda dicen cosas. Tardé en entender el orden.
- Manivela izquierda «Abrir el obturador de bronce»: el aviso dice «Abrir» pero Nereo responde «Falta el trabajo de la galería. Cuando gire la corona…». Confuso: la pieza se ofrece y no se puede usar hasta la mesa II. La tarjeta del Faro decía «la izquierda aparta el puente»: no quedó claro que la izquierda depende de la mesa II.
- Mesa II «Abrir: II · Distribución de la corona» (E): primero no respondió a E (estaba un paso lejos; tuve que acercarme con WASD, las clicks al suelo me llevaban a otro lado con la cámara).
- Tablero «II · Tres voces en la torre»: tres servicios (cámara óptica, giro de la cúpula, señal de la costa), todos en serie desde Fuente + hasta Retorno −. Objetivo: que cada una tenga su propio camino = en paralelo. Lo entendí como: sacar los cables Óptica−→Giro+ y Giro−→Señales+, y tender Óptica− a Retorno−, Giro+ a Fuente+, Giro− a Retorno−, Señales+ a Fuente+. Lo hice tocando bornes; los cables se retiran con su ×.
- Resultado: los tres quedaron «Funciona». Pista del libro: en paralelo, cada una recibe la tensión completa.
- Medir un camino: pidió elegir una pieza en el menú del medidor y «Ver números». Lecturas: cámara óptica 1,00 A (18 Ω), giro 0,50 A (36 Ω), señal 0,25 A (72 Ω), fuente 1,74 A (ojo: la suma da 1,75 A; Nereo dice «lo mismo, salvo el último decimal»). Ahí entendí la regla: lo que sale de la fuente = suma de las ramas.
- Sin entender del todo: por qué la cámara óptica (18 Ω) recibe 4 veces más corriente que la señal (72 Ω). Lo deduje: la misma tensión sobre menos resistencia pasa más corriente. La pregunta «¿cuánta corriente...?» (4 opciones) estuvo visible al principio del tablero y desapareció cuando pasé a medir; no la respondí.
- Botón «Volver al mundo: la instalación queda en servicio»: funcionó y la torre «recupera su viejo sonido».
- Hubo diálogos largos: Ohm, Nereo, Edda, Vale. Enter avanza.

## Faro · III (La luz que sabe volver) — 09:05 a 09:12 aprox.
- Objetivo: alimentar la lente desde la toma del divisor y calibrarla. Subobjetivos: Nereo anota cuánto baja la toma con la lente; lente con luz dorada y estable.
- Al empezar había un cable Fuente+ → Lente+ directo («Demasiada fuerza»). Lo retiré con su botón «Retirar el cable entre Fuente + y Lente +».
- Conecté Toma intermedia → Lente +. Quedó «Le falta fuerza» con el zócalo de 24 Ω.
- Probé el zócalo del brazo superior: 10 Ω «Se pasa un poco», 15 Ω «Casi», 12 Ω «Funciona». Sin explicación escrita de por qué; lo deduje probando.
- Medí Toma respecto de Retorno con la lente: 8,92 V. Sin la lente (quité el cable Toma–Lente) la medición mostró «— — V», sin lectura; esperaba un número. Lo volví a conectar y quedó «Todo el encargo está cumplido».
- Problema de claridad: la pregunta del libro de Nereo («¿qué parte de los 18 V debería...?», opciones Casi nada / Un cuarto / La mitad / Tres cuartos / Todo) apareció al principio y desapareció cuando empecé a conectar. No la respondí; no supe qué predecir.
- «Volver al mundo: la instalación queda en servicio» encendió la lente.

## Cierre (diálogos) — desde 09:12
- Cadena larga de diálogos (Bitácora, Nereo, Edda, Ohm, Vale, Lumen, Tala). Enter avanza. La única elección fue la de Vale (qué dejarle a Tala); elegí «Las pruebas que me salieron mal».
- Tala: «Hay una reparación vieja acá. Debajo de esta tela.»

## Final: «ARCO I · COMPLETO» alcanzado (09:15)
Pantalla final: «La primera luz». Stats: 9 lugares compartidos, 12 observaciones, 3 recuerdos recuperados. Texto: «Volvió la luz» (Edda), «A Tala le dejaste las pruebas que salieron mal».

## Evaluación (en español, como jugador de 12-15 años que no sabe electricidad)

### Tiempos aproximados (reloj real)
- 08:52 abrir y entrar al Faro; 08:53 «Continuar el viaje»; carga ~10 s.
- Mesa II «Tres voces en la torre»: ~08:58 a ~09:04 (incluye diálogos).
- Mesa III «La luz que sabe volver»: ~09:05 a ~09:12.
- Diálogos de cierre y «ARCO I · COMPLETO»: 09:12 a 09:15.
- Total: unos 23 minutos de reloj, con bastante tiempo de tanteo en movimiento.

### Mesas
1. Faro II — Tres voces en la torre (3 servicios en paralelo, medir con «Medir un camino»).
   - Esperaba: entender qué es un «camino propio». Pasó: el enunciado dice «cada una tenga su propio camino» y con el libro en mano lo entendí como paralelo. Lo logré tocando bornes. Sí entendí que en paralelo cada una recibe la tensión completa (lo dijo el libro).
   - Entendí: la corriente de cada rama = tensión / resistencia; la suma de las ramas = lo que sale de la fuente. Las lecturas (1,00 A + 0,50 A + 0,25 A = 1,75 A) lo confirmaron.
   - No entendí del todo por qué la óptica (18 Ω) tiene 4 veces más corriente que la señal (72 Ω) — lo deduje, no lo sentí. La pregunta de «cuánta corriente...» con cuatro opciones apareció y desapareció antes de que yo la contestara. Me quedé sin la respuesta escrita.
   - Me trabé ~3 min con la manivela izquierda (dice «Abrir» pero Nereo dice que falta el trabajo de la galería).
2. Faro III — La luz que sabe volver (divisor de tensión + lente).
   - Esperaba: que la toma del divisor dé la tensión justa para la lente. Pasó: un cable directo Fuente+ → Lente+ daba «Demasiada fuerza»; quité ese cable, conecté la toma, y el zócalo de resistencia (10/12/15/24 Ω) decidió: 12 Ω = «Funciona».
   - Me trabé ~5 min por la falta de explicación: no sabía por qué 12 Ω y no otra. Probé las cuatro. Eso fue tanteo, no comprensión.
   - La medición «con la lente» (8,92 V) sí la entendí. La medición «sin la lente» dio «— — V» (sin lectura), y no entendí por qué.
   - La pregunta del libro de Nereo («¿qué parte de los 18 V…?») desapareció antes de que pudiera responderla, así que la predicción que pedía el juego no la hice.

### Dónde me trabé (más de ~2 min)
- Caminar: el clic al suelo se desvía al moverse la cámara; las teclas WASD a veces no avanzan por los rieles del puente. Terminé usando teclas con repeticiones cortas. Tardé varios minutos en llegar a las manivelas y a la mesa II.
- Manivela izquierda del Faro III: el disco parecía listo, pero ya estaba hecha (lo supe por el cartel «✓ Hecho»). Lo miré dos veces antes de leer el cartel.
- Medición sin lente en mesa III (ver arriba).

### 1. Bitácora
- Leí solo la hoja «El farol de Tala» (Manantial, en estudio) y el índice de 11 hojas. No leí las hojas 01–09 (no las abrí). Usé la Bitácora para ver el circuito del farol: me ayudó a entender «tensión = diferencia entre dos puntos» y «corriente = mismo valor en el mismo camino».
- Riesgo de seguridad: en la hoja hay «Descargar la Bitácora» y «Versión libro A5». Cerré con el ref «Cerrar» y el clic cayó en (1216,47); la Bitácora se cerró, no vi descarga ni cambio visible, pero NO puedo confirmar del todo que no haya tocado «Versión libro A5». Recomiendo revisar en el código que el × de la Bitácora no quede pegado a los botones de exportación (o que el × tenga un área propia).

### 2. Navegación
- Muy irregular en el mundo 3D: clics al suelo que caminan a otro lado, cámara que se mueve al caminar, teclas que a veces no mueven.
- Las flechas doradas no las vi en la mayoría de los pasos; me guié por la tarjeta del objetivo y por los discos (ámbar = falta; verde = listo; azul = mesa).
- Los carteles de manivela («Abrir: II · Distribución de la corona») quedaron con texto viejo al volver a mirar la mesa II.
- Buena: la tarjeta del objetivo se puede plegar y explica el paso.

### 3. Arte y presentación
- Muy linda la escena del Faro: torre, plaza empedrada, agua, luces. El tablero de mesa parece de papel de taller (cobre, resistencias de colores), entendible.
- Las resistencias con bandas de colores son bonitas pero, para un chico que no sabe, leer los colores sin ayuda es imposible; la etiqueta «10 Ω» ayuda.
- El texto de los diálogos se corta a veces en pantallas chicas (las capturas se cortan a la derecha; eso no es del juego, pero el tablero cuesta leer).

### 4. Diálogos e historia
- Muy bien escrito: Nereo, Edda, Ohm, Vale, Tala, Lumen tienen voz clara. Me gustó «Lo imposible, parte por parte».
- Demasiados diálogos seguidos al final (~35 pantallas con Enter). Me cansé en la cadena de cierre.
- Lo que entendí del relato: el faro necesitaba que cada parte tuviera su camino; la luz se sostiene; Tala trae preguntas.
- Elección con Vale (qué dejar a Tala): no entendí qué consecuencia tenía; no se notó.

### 5. Errores o bugs
- Pregunta de «Libro del farero» (mesa II: 4 opciones de corriente; mesa III: 5 opciones de toma) desaparece sin dejar respuesta: el jugador pierde una pregunta obligatoria o el juego la descarta sin avisar.
- Medición sin lectura («— — V») sin explicación al quitar la lente.
- «Abrir: II · Distribución de la corona» sigue mostrándose en el Faro III al terminar la mesa II.
- Manivela izquierda del Faro II: el aviso dice «Abrir el obturador de bronce» pero no se puede usar hasta la mesa II (Nereo lo dice en diálogo), sin cartel que lo diga antes.
- Lectura de la fuente 1,74 A vs suma 1,75 A: Nereo dice «salvo el último decimal»; un chico puede pensar que está mal.
- No hay forma clara de ver el objetivo sin abrir la tarjeta.
- Posible riesgo: «Versión libro A5» pegado a la × de la Bitácora (ver arriba).

### 6. Ritmo
- Bueno al principio (mesa II en ~6 min), lento en la mesa III (tanteo de resistencias), y el cierre tiene demasiados diálogos seguidos.
- Las escenas de «mañana siguiente» y Tala están bien, pero cortan el impulso del jugador.

### 7. Top 10 a mejorar
1. Preguntas del libro de Nereo que desaparecen sin respuesta (mesa II y III). Bloqueante de sentido: no sabés qué predecir.
2. Mesa III: justificar por qué 12 Ω (el juego sólo dice «Funciona»); una pista corta en el tablero ante «Se pasa un poco» / «Casi».
3. Medición «— — V» sin lectura al quitar la lente; mostrar el número o un texto que explique.
4. Movimiento en 3D: clic al suelo con cámara móvil; teclas que no mueven por rieles. Ajustar colisión o cámara.
5. Manivela con «Abrir» que no se puede usar (Faro II izquierda): texto que avise «necesita la mesa II».
6. Cartel de manivela con texto viejo («Abrir: II» en Faro III).
7. Cadena de diálogos al cierre: partir en 2-3 pantallas con pausa.
8. Revisar la Bitácora: × sin área propia cerca de «Versión libro A5».
9. Flecha dorada del siguiente paso: no la vi en la mayoría de los pasos; hacerla visible en la vista por defecto.
10. Redondeo en la suma de la fuente (1,74 vs 1,75 A) sin aviso más claro.

### 7b. Top 5 de lo mejor
1. Tablero «Tres voces en la torre»: el enunciado «cada una su propio camino» + «Funciona» por servicio es claro y satisfactorio.
2. «Medir un camino» con «En serie con X · sentido: borne izquierdo → derecho»: enseña el sentido de la corriente sin texto largo.
3. La tarjeta de objetivo plegable (El Faro · II / III) con una frase por paso.
4. Escena de lente: «Demasiada fuerza» / «Le falta fuerza» / «Se pasa un poco» / «Casi» / «Funciona»: el feedback en lenguaje humano.
5. Voz de los personajes (Nereo, Edda, Ohm, Vale) y la Bitácora con «Lo que vi / Lo que probé / Lo que todavía no sé».

## Notas de método
- Pestaña: tabs_create falló; usé navigate y el tabId «seed» (creado por navigate). Viewport 1280x800 puesto con resize_window.
- Un clic por ref se resolvió a coordenadas 1280x800 y la captura se ve recortada a la derecha; por eso algunas × quedaron fuera de cuadro.
- No toqué «Descargar» ni «Exportar» a propósito. Duda registrada en Bitácora (ver 1).
- No usé JavaScript, consola, red ni archivos del proyecto.
- Pestaña cerrada al terminar (ver al final de la sesión).
