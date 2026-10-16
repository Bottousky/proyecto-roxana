# Informe jugador 22: tramo Lago de las Señales (y Faro)

Pestaña: tabId "seed" (tabs_create falló; se usó navigate a http://localhost:4190/?tramo=lagoa).
Viewport 1280x800 aplicado.

## Cronología (aprox.)

- Título: «Continuar el viaje» (no toqué «Comenzar otro viaje»). Carga lenta: ~25 s hasta ver el mundo (barra «Abriendo los caminos» 11% → 56% → listo).
- Guía de viaje abierta: dice «Encontrá a Nereo en el lago… mirá cómo responden las balizas». Nota: la guía y la Bitácora dicen «Nereo» pero el mapa y el HUD muestran «Nico» (ver punto 8).
- Mapa: el marcador dorado «Siguiente paso» está en la orilla del Lago. Se abre con M, se cierra con Escape (tardó unos segundos en cerrarse).
- Primer intento: hacer clic en el suelo y luego en la flecha dorada me llevó primero al borde del agua, no al muelle. Hizo falta seguir la flecha varias veces (≈6 clics) porque la cámara se movía.
- Llegué al muelle: diálogo con «El viejo del muelle» (nombre en ??? al principio), luego Nereo (FARERO MAYOR) y Ohm.
- Ohm: «Nereo. Última visita registrada: hace cuatro años.»
- Nereo: «Las uniones del muelle las hago yo». Bitácora: «Nereo fija la bornera junto a las bobinas… el retorno sigue suelto. Las balizas no contestan.»
- Pista: «El retorno lo cerrás vos, entre las cañas. Y miren las balizas, no a mí: si una no contesta, ahí está la pregunta.»
- Mesa del retorno (caja con anillo ámbar entre las cañas): hice clic en la caja y en la flecha. Tras el paso, el anillo pasó a turquesa/verde y una lámpara sobre la caja quedó encendida. Ohm dice: «Ahora sí. Yo llevo la llave. Ustedes, esa costumbre nueva de mirar dos veces.»
- Bitácora: «La línea sumergida vibra bajo el muelle. Tres balizas marcan el camino hacia el Faro.»
- Objetivo nuevo: «El Faro · I / III». «Abrí la Fuente del Faro, la primera mesa, al pie de la torre: el núcleo tiene que sostener su pulso.»

## Puntos sin resolver por mí (confusión)

- No entendí qué hice exactamente en la mesa del retorno: no vi ningún cable ni una consigna que yo tuviera que cerrar. El juego lo dio por resuelto solo, y no sé si fue por clic en la caja o por la flecha.
- Hubo un momento en que pulsé E junto a Nereo y solo reapareció la última línea del diálogo como subtítulo, sin nada más.

(continúa: camino al Faro)

## Faro (avance)

- Llegada al Espigón del Faro: el reloj pasó de «Crepúsculo» a «Noche» sin que yo hiciera nada (no sé si es intencional; la Bitácora anuncia «El Faro parece cercano»).
- Plaza del Faro: anillo de «Volver al lago» (salida) junto a la entrada. Me paré encima sin querer y el juego me ofreció «Volver al lago»; me alejé. Anotar: el anillo de salida se activa al pisarlo.
- Mesa I «Fuente del Faro» (paso I · El pulso del Faro): el tablero es un circuito con Fuente +, Tendido norte, Tendido sur, Regulador del generador (4/6), Núcleo de alimentación y Retorno −. Objetivos: «El núcleo sostiene su pulso» y «Ningún tendido se calienta».
  - Primer intento: el Tendido norte se calienta («Se calienta») y el Núcleo está «Casi». Bajé el regulador con su «−» (4/6 → 3/6); el Núcleo siguió «Casi» y el norte siguió caliente. No entendí de inmediato qué significa el número del regulador ni si «frenar menos» es el «−» o el «+».
  - Mis primeros toques con coordenadas sobre el tablero no hicieron nada (tuve que usar las referencias del navegador; es un problema de mi herramienta, no del juego, pero la captura se corta a la derecha).
  - Solución que encontré: tender el Tendido sur en paralelo con el norte (Fuente+ → Sur A; Sur B → Regulador A). Resultado: norte «Fresco», sur «Fresco», Núcleo «Funciona» y «Todo el encargo está cumplido». Lo que dijo el cobre: «Los dos tendidos juntos se reparten la corriente, y cada uno se calienta un cuarto de lo que se calentaba solo». Esto sí me hizo entender la idea de paralelo, pero fue casi por prueba y error, no porque lo supiera.
  - Pista: no la usé.
- Después de la mesa: Nereo y Ohm explican el puente de servicio y «la manivela izquierda lo aparta; la derecha une el motor con la corona». Nico: «Seguimos hacia el ruido que falta».
- Objetivo siguiente: «El Faro · II / III» — «Con Nereo, buscá el giro y las luces que faltan en la galería del medio.»

## Faro II (estado final de la sesión)

- Resuelto: el puente de mantenimiento (manivela izquierda, «Aislar el puente gastado»). Mirar con Ohm: 0,00 V / 0,00 A cuando quedó aislado.
- NO resuelto: la manivela derecha («une el motor con la corona») y «las luces que faltan» en la galería del medio. Recorrí la plaza: la mesa de la linterna («III · La linterna») está disponible pero Nereo dice que todavía no corresponde («Falta el trabajo de la galería»). Encontré una nota detrás de una placa (Ω: «Si mi memoria falla, pregúntenle al próximo aprendiz…») y Ohm la reconoce como suya. No encontré la manivela derecha ni las luces.
- Me trabé unos 15 minutos en esta búsqueda. No usé la Pista del tablero de la mesa I (sí tenía la pista de Ohm en la mesa I, sin abrirla).

## Resumen de la sesión

- Hasta dónde llegué: Lago de las Señales resuelto (retorno unido en la mesa de la caja entre las cañas). Faro: mesa I resuelta; mesa II parcialmente (puente aislado, falta la manivela derecha). No llegué al final del arco.
- Tiempos aproximados: carga inicial ~25 s; Lago ~20 min; Faro I ~20 min; Faro II ~25 min (incluida la búsqueda sin éxito).

## Qué anotar (por número)

1. Esperaba: que la flecha me llevara a la mesa. Pasó: el personaje caminaba hasta el borde del agua o se quedaba a mitad de camino; hizo falta hacer clic 5 o 6 veces sobre la flecha dorada.
2. Mesas: Lago (caja con anillo ámbar) — no entendí qué consigna cerraba; el juego lo dio por resuelto solo al hacer clic. Faro I — entendí la idea de paralelo sólo por prueba y error. Faro II — el primer E sobre el puente lo CONECTÓ (la etiqueta decía «Reconectar» al principio, después «Aislar»), y Ohm avisó «la aguja salta… se pedía demasiado». El segundo E lo aisló.
3. Puzzles: el regulador del generador muestra un número (4/6 → 3/6) sin explicar qué mide; bajarlo no alcanzó. Lo que resolvió fue el paralelo, con el mensaje final «Lo que dijo el cobre» (muy claro).
4. Bitácora: entradas cortas y con tono (ej. «Nereo fija la bornera… Las balizas no contestan»). Útil como resumen.
5. Navegación: el mapa es claro (diamante = siguiente paso). Problemas: la marca dorada de la brújula a veces apunta al suelo de la plaza y no al objeto; el anillo de salida «Volver al lago» se activa al pisarlo sin confirmar.
6. Arte: plaza del Faro nocturna muy bonita; la mesa de la Fuente se entiende visualmente.
7. Diálogos: Nereo tiene voz propia («Cobre que se queja, cobre que descansa»), pero las lecturas de Ohm usan jerga: «lado sumergido del contacto respecto del retorno de la fuente», «barras», «distribución», «protección». Para 12–15 años es demasiado.
8. Errores o bugs:
   - La hora cambió de Crepúsculo a Noche al llegar al Faro, sin aviso.
   - Paneles (Guía, Mapa, observación) tardan en cerrarse con Escape; a veces hay que repetir.
   - Dos Nicos/Nereos: el protagonista se llama «Nico» (no lo elegí; la partida ya lo tenía) y el farero «Nereo»; nombres casi iguales.
   - Al tocar los bornes con coordenadas no pasó nada; sólo funcionó con las referencias del navegador (puede ser mi herramienta, no el juego).
   - Captura reducida: el tablero de la mesa I se corta a la derecha (la cámara pide apaisado).
9. Ritmo: el Lago se sintió lento por el caminar y los clics repetidos; el Faro I fue más entretenido porque la mesa responde.
10. Top 10 a mejorar (orden de prioridad):
    1. Etiqueta del puente: «Reconectar» antes de que esté conectado; el primer toque lo conecta sin advertencia. Avisar antes de conectar o usar «Aislar/Conectar» de forma inequívoca.
    2. Paso II sin objeto claro: «buscá el giro» no dice cuál. Marcar la manivela derecha y las luces.
    3. Marca dorada que apunta al suelo y no al objeto; clics repetidos para llegar.
    4. Lenguaje de Ohm demasiado técnico para 12–15 años; glosar «barra», «distribución», «protección», «lado sumergido».
    5. Regulador 4/6: explicar qué mide el número y qué pasa al bajarlo.
    6. El anillo «Volver al lago» se activa al pisarlo: pedir confirmación.
    7. Cierre lento de paneles con Escape.
    8. Cambio de hora sin aviso al llegar al Faro.
    9. Carga inicial ~25 s sin dar un motivo claro.
    10. Nombres Nico / Nereo muy parecidos; el protagonista «Nico» sin haberlo elegido.
    Top 5 de lo mejor:
    1. La mesa I y su cierre: «Los dos tendidos juntos se reparten la corriente, y cada uno se calienta un cuarto» (aprendizaje concreto y retroalimentación clara).
    2. La frase de Nereo «Cobre que se queja, cobre que descansa» (memorable, pedagógica).
    3. Las observaciones de Ohm con lecturas en V y A para mirar y comparar.
    4. Ambiente visual del Lago y del Faro.
    5. La guía «Un paso a la vez» con «Ubicarme en el mapa».

Nota de método: tabs_create falló; usé la pestaña creada por navigate (tabId "seed") para todo el tramo. No toqué «Comenzar otro viaje», ni descargas/exportes, ni «Cruzar el Portal».
