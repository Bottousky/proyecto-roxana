ESTADO ACTUAL: ARCO I · COMPLETO alcanzado (Día 2, El Faro). Mesas I (no revisada por mí), II y III resueltas. Sesión cerrada.

# Informe de playtest 34 (posta) · Arco I desde El Faro

Jugador de prueba: chico/chica 12-15 años, no sabe electricidad. Partida tomada en El Faro (Continuar el viaje). Sólo navegador integrado.

## Notas de la herramienta (no del juego)
- tabs_create falló; usé navigate y quedó mi pestaña con tabId "seed".
- La pestaña aparecía "hidden"; la traje al frente con tabs_select.
- Las capturas salen recortadas/escaladas: las coordenadas de clic de las capturas NO coinciden con el tablero. Lo que sí funciona de forma confiable: clic por ref (find → ref_N) sobre botones y bornes. Los clics por coordenada sobre las mesas muchas veces no registran.
- Caminar con clic es lento; el personaje queda casi fijo en el centro-derecha de la captura y la cámara se mueve. Con E aparece el cartel de la acción (ej. «Acoplar el motor de la corona») sólo cuando estoy al lado.
- Bitácora y Guía: se cierran con su «Cerrar» (find → ref). Mapa: también con «Cerrar». Nunca toqué Descargar/Versión libro.

## Cronología
- (inicio) Abro http://localhost:4190/?tramo=cerof y elijo «Continuar el viaje». Lugar: El Faro · II / III. Guía: «Entre la mesa I y la mesa II hay dos manivelas: la izquierda aparta el puente gastado; la derecha acopla el motor. Después abrí la mesa II.»
- Bitácora previa: entrada «El farol de Tala» (en estudio); página 09 «Faro · I. El primer escalón» escrita. Mapa: «I · Fuente del Faro» ya figura resuelta, «II · Distribución de la corona» es la siguiente.
- Manivela DERECHA «Acoplar el motor de la corona» (E): hecha sin problemas. Cartel «✓ Hecho · deshacer». Nereo: «Los dientes ya están juntos. Falta oírlos girar. El segundo tablero espera.»
  - Pensé: «acoplar el motor» suena a conectar; no entendí qué cambia en la electricidad, sólo seguí el cartel.
  - No pude confirmar si la manivela IZQUIERDA («aparta el puente gastado») estaba movida. La de «Abrir el obturador de bronce» (la que encontré cerca del faro) es de otra etapa («Faro III»): dice «Todavía no» y su observación con Ohm dice que la fuente todavía no da nada. Confusión: el nombre de la manivela izquierda en la Guía no coincide con ningún cartel que vi.
- Mesa II «Tres voces en la torre» (paso de la distribución). Ojo: aparece un tarjetón «Antes de tocar el tablero, anotemos qué esperás» con la pregunta «¿cuánta corriente va a tomar la óptica, comparada con la señal?» y botones (La misma / El doble / Cuatro veces más / Un cuarto / No sé todavía / Medir sin anotar). Yo había sacado un cable ANTES de contestar (no leí el tarjetón con atención; la pantalla lo cortaba). El juego lo acepta igual: al final me registró «Cuatro veces más».
  - Hipótesis que elegí: la óptica «frena» 18 Ω y la señal 72 Ω; si frena menos, deja pasar más corriente. Lo pensé como intuición, sin saber la ley.
  - Resultado: el board me dio la razón: «la óptica tomó 4 veces lo de la señal. Un cuarto del freno, cuatro veces la corriente».
  - Cambié la conexión: las tres cargas quedaron en serie (cable Óptica− a Giro+, Giro− a Señales+). Las quité (×) y tendí de nuevo desde Fuente+ y Retorno− a cada aparato. Quedó en paralelo: Cámara óptica ✔ Funciona, Señal de la costa ✔ Funciona, Giro de la cúpula ✔ Funciona.
  - Lo que me costó: con las capturas no veía bien los cables; sólo andaba bien con los refs (find → ref_N). Los clics por coordenadas sobre los × no hicieron nada.
- Estado tras tender: «Lo que dijo el cobre: En fila, ninguna voz recibía lo que necesitaba. Con su propio camino, cada una toma lo que su freno le deja...». Falta «Medir un camino» (regla de los nudos: Nereo).
- «Medir un camino»: Cámara óptica 1,00 A (18 V, 18 Ω); Giro 0,50 A (36 Ω); Señal 0,25 A (72 Ω); «Lo que sale de la fuente» 1,74 A. Nereo: «lo mismo, salvo el último decimal». Pantalla «¡Funciona!» y «En paralelo, cada voz recibe la misma tensión y toma la corriente que necesita.» Puse en servicio con «Seguir la historia →».
- Tiempo aprox. de la mesa II (desde que entré al tablero hasta «¡Funciona!»): unos 15–20 min de juego real, con mucho pelea con clics/capturas.
- Bitácora de la mesa II: «Lo que vi» muestra lectura bien hecha; la regla de los nudos se completa con las medidas.

## Mesa III · «La luz que sabe volver» (en la linterna)
- Para llegar: manivela izquierda del obturador (ya estaba hecha, «✓ Hecho · deshacer: cerrar el obturador de bronce») y la derecha de la lente. Entré con E a «III · La linterna».
- Tarjetón previo: «Para el libro del farero, antes de medir: los dos brazos del divisor frenan lo mismo. Sin la lente, ¿qué parte de los 18 V debería marcar…?» Elegí «La mitad» (dos brazos iguales → mitad). Quedó anotado: «marcó 9 V de 18 V: la mitad». Esta vez el tarjetón sí se leyó antes de tocar.
- Estado inicial: el cristal de la lente tenía 18 V directo desde Fuente+ («Demasiada fuerza»). Quité ese cable con su × (sólo visible al pasar el cursor) y tendí Toma intermedia → Lente +. Retorno − → Lente − ya estaba.
- Medí toma sin lente 9,00 V; con lente 6,00 V (la toma baja). Nereo: «Templada a oscuras no alcanzaba... hay que templarla con la lente puesta».
- Pista confusa: «Pista 1 de 4» dijo «La lente está unida directo a Fuente +» cuando al pasar el cursor el propio juego decía «Lente + está unido por cable con Toma intermedia». Una pista desactualizada o contradictoria. Bug.
- Solución: el zócalo del brazo superior tiene 4 «piedras» de repuesto (anillos). Probé marrón-negro-negro-oro (10 Ω): «La lente… Se pasa un poco». Probé marrón-rojo-negro-oro (12 Ω): «¡Funciona!». «La luz es dorada y se sostiene. Ya no encandila.» Seguí la historia.
- Las piedras de repuesto del zócalo no se ven bien en la captura (quedan cortadas a la derecha): tuve que leer el árbol de accesibilidad para elegirlas. Un jugador de carne y hueso probablemente no sabría cuál probar.
- Mesa III resuelta. Seguí la historia.

## Cierre del arco
- Tras la linterna: escena de la lente encendida, Ohm, Edda, Nereo, Lu y Tala. Hay un tramo largo de diálogo casi sin decisiones (Enter, Enter, Enter…). Lu me pregunta qué le deja a Tala: elegí «Las pruebas que me salieron mal» (la respuesta de Tala y la de Lu tienen sentido con el tema del arco, pero la elección no cambia nada visible salvo la línea final).
- Apareció «ARCO I · COMPLETO» (La primera luz). Resumen en pantalla: 9 lugares compartidos, 12 observaciones, 2 recuerdos recuperados. Frase final: «Tu viaje está guardado.» Botón «Seguir en Ohmdal».
- Intenté abrir la Bitácora desde la pantalla de cierre: la tapa del cierre tapa el HUD, no pude leer las páginas nuevas. Lo dejo como pendiente.

# Notas finales para el informe (sección por sección)

1. **Bitácora**: la entrada «El farol de Tala» quedaba «en estudio» al empezar; la página de la mesa II y III se escribe sola con lo que midí (Nereo anota). Las observaciones de Ohm (Q) son claras cuando las abrís en el momento. No pude revisar la Bitácora final porque la pantalla de cierre tapa el HUD.
2. **Navegación**: caminar con clic es lento y muchas veces el camino se traba en los rieles de piedra; la flecha dorada suele ayudar pero a veces no llega. Los clics sobre el tablero por coordenadas no siempre registran; los botones con ref sí. Encontré que el mapa muestra bien «Siguiente paso» y el orden de mesas.
3. **Arte y presentación**: el mundo se ve muy bien (faro, plaza, lago). Las piezas del tablero (lámparas, cúpulas, bobinas, lente) son legibles. El cartel «✓ Hecho · deshacer» y el tarjetón de Nereo ayudan.
4. **Diálogos e historia**: los personajes se entienden (Nereo y Ohm tienen voz propia). Algunos diálogos largos sin decisiones cansan. El final de la luz funciona como cierre emocional.
5. **Errores o bugs**: (a) Pista 1 de la mesa III dice «la lente está unida directo a Fuente +» mientras que al pasar el cursor el propio juego dice «unido por cable con Toma intermedia». (b) El tarjetón de predicción no bloquea el tablero: pude sacar un cable antes de responder. (c) Los clics por coordenadas sobre × de los cables no hacían nada; por ref sí. (d) La nota de la mesa II dice «cuatro veces más» y la Bitácora de la sesión dice «esperábamos cuatro veces más»: coherente. (e) Pantalla recortada a la derecha en capturas (puede ser sólo mi visor).
6. **Ritmo**: la parte del faro con caminar y clic gasta mucho tiempo. Mesa II y III son el corazón del arco: buen ritmo en el tablero. El final es largo.
7. **Top 10 a mejorar**: (1) Hacer el movimiento con teclas/clic más preciso (menos trabas en rieles). (2) Revisar la pista 1 de la mesa III (dice algo distinto a lo que se ve). (3) Bloquear el tablero hasta responder la predicción. (4) Mostrar siempre el ×/retirar del cable (hoy aparece sólo al pasar el cursor). (5) Explicar en el cartel de la manivela izquierda del faro qué hace (no encontré un cartel que coincida con «aparta el puente gastado»). (6) Las piedras del zócalo (III): tarjetas con su valor en ohm en vez de sólo bandas de color. (7) Pasar menos diálogos seguidos sin decisión en el cierre. (8) Que la Bitácora no quede tapada por la pantalla de cierre. (9) En la pregunta de Lu («¿qué le dejo a Tala?») las opciones no dicen qué cambia después; no vi efecto visible salvo una línea. (10) Confirmar en la mesa I que se puede ver si la manivela izquierda ya estaba hecha (hoy sólo lo sé por el color).
8. **Top 5 de lo mejor**: (1) La regla de los nudos y el «Medir un camino» con números claros (A, Ω, V). (2) Predicción antes de medir (Nereo/Libro del farero) y la respuesta «Anotado: esperábamos…». (3) Feedback inmediato en el tablero (Funciona / Quieto / Le falta fuerza / Se pasa un poco). (4) Ohm: observación con lecturas al lado de cada aparato. (5) El final: «ARCO I · COMPLETO» con resumen y tono de cierre.

## Lo que no hice (honesto)
- No visité otros lugares (Pueblo de Ohm, Manantial, Castillo, Terrazas, etc.).
- No abrí la Bitácora final ni el libro A5/A4 (prohibido, y no hacía falta).
- Mi jugada de la mesa II (cortar un cable antes de contestar la predicción) fue fuera del orden que el juego pedía: lo registro como observación, no como dato de dificultad.
