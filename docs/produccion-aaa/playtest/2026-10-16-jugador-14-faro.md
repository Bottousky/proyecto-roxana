# Informe playtest 14 - tramo Faro (?tramo=farob)

Jugador de prueba: chico/a de 12-15 años, no sabe electricidad.
Pestaña: tabId "seed" (tabs_create falló; se usó navigate a localhost:4190/?tramo=farob).
Viewport: pedí 1280x800; con esa medida la Bitácora no se podía cerrar (la × quedaba fuera de la pantalla). Volví a "desktop" (pane responsive).

## Resultado del tramo
- Mesa I "El pulso del Faro": RESUELTA (tras unos 40 min con confusión).
- Galería 2: Puente gastado aislado (E). Mesa II "Distribución de la corona": BLOQUEADA en mi intento (unos 15-20 min). No llegué a la luz del Faro ni al final.
- Tiempo aproximado jugado: ~1h 30 min (muchos de esos minutos en el tablero y en la pelea con las teclas/cámara).

## Cronología
1. Entré con "Continuar el viaje". Arranca en El Faro, noche, día 1, "1/3". Pista de inicio: "Abrí la Fuente del Faro, la primera mesa, al pie de la torre".
2. Bitácora: historia de Nico/Marín (La cuenta del carro, dos faroles). Es rica pero densa; la leí como contexto. Hay "Descargar la Bitácora" (no lo toqué: pide permiso).
3. Guía (H): clara; dice qué hacer y "la marca dorada de la brújula te orienta".
4. Caminar: WASD casi no movía al personaje en mi prueba (movía la cámara o un paso). Funcionó mejor el click en el suelo, pero el click me llevó sin querer a otra zona (Lago de las Señales).
5. Confusión: el disco dorado en el puente NO era la mesa. Lo usé con E y no pasó nada. La mesa está en la plaza del Faro: al acercarme al panel inferior de la Fuente aparece "E · Abrir: I · Fuente del Faro" y "Q · Mirar con Ohm". Bien marcado, pero el disco dorado en el suelo se parece a una mesa.
6. Diálogos con Nereo, Edda, Nico y Ohm. Entendibles. Nereo: "Lo tuyo es la primera mesa, la de la fuente, al pie de la torre: andá y abrila." Bien.
7. Mesa I resuelta (ver Puzzles). Al volver al mundo: "La base responde con un acorde profundo. Un ascenso de luz dibuja el contorno de la segunda galería."
8. Guía pasa a "El Faro · II / III": "Con Nereo, buscá el giro y las luces que faltan en la galería del medio." Otra vez Nereo vuelve a hablar tras la mesa I (Edda: "Tenemos fuente. Todavía no una señal.").
9. Galería 2: el "puente de servicio gastado" tiene E "Aislar"/"Reconectar". Ohm lo explica: "une las dos barras directamente: un atajo que evita a las tres voces... se pedía demasiado". Aislarlo: "por un contacto abierto no pasa nada". Lo dejé aislado. Bien explicado en la observación (con Q).
10. Mesa II "Distribución de la corona": E dispara SIEMPRE el diálogo de Nereo "Primero tiene que sostenerse la base. Después, las manivelas del medio apartan el puente gastado y acoplan el motor." No se abre la mesa. Lo intenté varias veces (E, Return, E, Q, caminar al frente y a los costados). Siempre vuelve el mismo diálogo o el prompt "Mirar: II". No encontré la "manivela del medio" como objeto interactuable. Bloqueo.

## Puzzles

### Mesa I - El pulso del Faro (la más difícil hasta ahora)
- Objetivo: "Dale fuerza al núcleo sin recalentar los tendidos". Dos pasos.
- Estado inicial: batería (Fuente +) → Tendido norte → Tendido norte 2 → Núcleo. Tendido sur suelto. Regulador en 4/6. El núcleo dice "Casi"; el Tendido norte "Se calienta".
- Hice "frenar menos" (regulador a 2/6): no cambió nada útil.
- Pista 1 de 4: "Aflojar el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte." Ahí entendí el problema (un solo tendido se calienta).
- Pista 2 de 4: "Con un solo tendido no hay posición buena: o el núcleo queda débil o el cobre se calienta." Me hizo pensar en usar los dos tendidos a la vez.
- Solución que encontré: el cable Fuente + → borne A del Tendido sur, y borne B del Tendido sur → borne B del Tendido norte. Resultado: los dos tendidos en paralelo, "Fresco" los dos, núcleo "Funciona", "Todo el encargo está cumplido".
- Lo que no entendí: cómo quitar un cable. Hay una × en el medio de los cables que TENDÍ yo (no la vi en los de fábrica). Al tocar el cable de fábrica Fuente + – Tendido norte A con la tecla Supr: "Ese cable está soldado: es parte de la instalación". Pero con un clic a veces sí se soltó y luego volvió. Mensajes contradictorios: "Esos bornes ya están unidos. Tocá su cable para retirarlo" / "Ese cable está soldado" / "Un cable de mano no llega tan lejos: esos bornes están en extremos distintos del tendido". No quedó claro el alcance de los cables ni cómo retirar uno.
- Tocar un borne "toma" un cable de la mano y tocar otro lo tiende; tocar el mismo lo suelta. Esto está bien, pero los clics a veces no registraban (tuve que usar el elemento de la lectura de la pantalla).
- Mi comprensión conceptual: entendí que "dos caminos en paralelo reparten la corriente", pero no lo puedo explicar con mis palabras. Probé con las pistas.
- Los discos ámbar en el piso me confundían con mesas a usar.

### Mesa II - Distribución de la corona (bloqueada en mi intento)
- Observación de Ohm: "Luz, giro y señal están en fila: cada una tiene que atravesar a la otra. Pasa corriente por acá."
- No la pude abrir. E muestra siempre el diálogo de Nereo. Probablemente falta activar las "manivelas del medio" (según Nereo), pero no las encontré en el mundo, o no tienen prompt visible.

## Bitácora (lo que muestra el juego)
- Rica, con cuentas, ejemplos y "Para pensar". Pero el texto es mucho para alguien que no sabe nada: "en fila", "se queda con el doble del empuje", "ningún voltio se pierde" lo leí sin entender.
- Se abre con J o el botón. Con la pantalla angosta la × no se ve y no se puede cerrar (ni Esc, ni J, ni clic afuera). Bug de layout, lo confirmé en el viewport 1280x800 emulado; al volver al tamaño normal se cerró con la ×.
- Las observaciones de Ohm (Q) son buenas: explican en una frase lo que pasa. La "×" para cerrar sí aparece ahí.

## Navegación
- Click-to-move funciona; WASD casi no mueve en mi prueba.
- Los discos dorados en el piso confunden: "marca de brújula" y "mesa" se parecen.
- Muchos diálogos al interactuar: E repite el diálogo del NPC cercano en vez de abrir la mesa (en mesa II).
- Diálogos con Enter/Continuar: bien.

## Errores o bugs observados
1. Bitácora no se cierra si la pantalla es angosta (×fuera de pantalla; Esc, J y clic fuera no la cierran).
2. Mesa II: E no abre la mesa; repite el diálogo de Nereo (posible gate sin indicación, o manivela sin prompt).
3. Cables: mensajes contradictorios sobre "soldado" vs "retirar", y la × sólo aparece en cables tendidos por mí.
4. WASD casi no desplaza el personaje en mi prueba (posible problema de foco del canvas).
5. Un clic en el puente me llevó a otra zona (Lago) sin aviso.

## Top 10 a mejorar
1. Mesa II: no se abre con E; no se entiende qué falta (manivelas). Dar una señal clara del paso que falta.
2. Cables: la × de retirar debería verse en todos los cables, y los mensajes "soldado" / "retirar" deben ser consistentes.
3. Alcance del cable de mano ("no llega tan lejos") explicado en la Guía o en la mesa.
4. Bitácora: la × debe quedar dentro de la pantalla y cerrar con Esc.
5. Distinguir visualmente el disco dorado del suelo (marca de brújula) de las mesas.
6. Movimiento con WASD: que el personaje se mueva de forma consistente.
7. Mesa I: la primera pista llega tarde; el concepto "dos caminos reparten la corriente" debería aparecer antes.
8. Bitácora: frases de ciencia densas para 12-15 años; poner una frase simple antes del texto técnico.
9. E repite el diálogo del NPC cercano en vez de la acción de la mesa: separar la interacción.
10. Mensajes de Ohm y Nereo repetidos sin progreso: cortarlos o mostrar la acción siguiente.

## Top 5 de lo mejor
1. Pistas graduales en la mesa I (4 pistas, cada una más concreta) y el feedback visual de "Fresco" / "Funciona" con los checks.
2. Observaciones de Ohm (Q): explican cada cosa en una frase clara ("un atajo que evita a las tres voces").
3. Guía de viaje con paso actual y "Ubicarme en el mapa": ayuda a no perderse.
4. Ambientación: la plaza del Faro, el color de la noche y los personajes son atractivos.
5. Diálogos cortos con personajes distinguibles (Nereo, Edda, Nico, Ohm) y el acorde/luz al completar una mesa como recompensa.

## Ritmo
- Mesa I: lenta por la confusión de cables, no por el contenido.
- Galería 2: rápida hasta que Nereo repitió diálogo sin abrir la mesa II.

## Pendiente (no jugado)
- Mesa II (bloqueada), mesa III, encendido de la luz del Faro, final de la historia.
