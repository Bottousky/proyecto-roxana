# Informe jugador 21 — Tramo Terrazas (terrazasd)

Estado: Terrazas completa; no llegué al Lago de las Señales ni al Faro.
Inicio: http://localhost:4190/?tramo=terrazasd, opción «Continuar el viaje».
Pantalla de inicio: «Las Terrazas · Atardecer, día 1 · 5 de 9 luces encendidas · 2 min de viaje».
Viewport: 1280x800.

## Bitácora de juego

- Inicio: «Continuar el viaje» (en el título) costó 2 intentos: el primer clic no entró (la pantalla cambió de tamaño). Carga ~20 s entre «Abriendo los caminos» 44% → 100%.
- Bitácora (J): 11 páginas, con tramos anteriores (El Manantial: «La cuenta del carro», dos faroles en serie/paralelo). Los botones de PDF (A4 / A5) del encabezado no los toqué (descarga).
- Mapa (M): muestra «Siguiente paso» (rombo dorado) dentro de Las Terrazas. El botón «Guía de viaje» queda tapado por el mapa; hay que cerrarlo o usar «Ver guía» dentro del mapa (ref confuso, no es bug grave).
- Guía (H): «Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar.» Cerrar con la X de arriba a la derecha.
- Diálogo inicial: Yesca («???», La Forjadora) + Nico + Ohm + Vega + Yesca. Dicen que el cable de la ladera es uno solo y que el horno de Yesca y la bomba de Vega comparten línea.
- Llegué a la forja de Yesca. Dos opciones junto al horno: «Devolver el horno a su palanca propia» (E) y «Mirar con Ohm» (Q).
- Mirar con Ohm: «Pasar el horno a la mesa compartida. El horno de Yesca entra en el tablero de Vega: su parte de la línea se reparte con el riego. Pasa corriente por acá.» Lecturas: 17,90 V y 0,75 A. Pero la tensión del horno es 17,9 V y la batería es 12 V: no me cierra y no lo entiendo.
- Pausa (Esc): al pulsar Escape con la observación abierta se abrió el menú de Pausa (no se cerró solo la observación). Confuso. El panel de Ohm queda cortado a la derecha del viewport de 1280x800 (sin botón visible para cerrar; se cierra con Esc y eso abre Pausa).

## Avance 1 (Terrazas resuelto)
- Mesa de la forja (E «Devolver el horno a su palanca propia») y luego (E «Pasar el horno a la mesa compartida») como si fueran opciones distintas: el texto de la acción cambia y es fácil confundirse. Ohm sólo explica «Pasa corriente por acá» y no dice si eso es bueno o malo. Confuso.
- Vega dice: «dos manivelas al fondo de las Terrazas: a la izquierda, junto a la forja de Yesca... a la derecha, junto a mi casa, la que abre el canal». Eso ayudó: encontré ambas. Pero la manivela de la casa de Vega estaba en el frente izquierdo de la casa, y al principio "Entrar · Casa del molino" tapaba el aro dorado. Pista visual poco clara.
- Tablero «Tablero de calor y riego» (La paciencia del invernadero): cuatro frenos y cuatro estados. Ohm dice: «Girá el freno del calor de a una posición y mirá las raíces» (lo hice: 3/5, lecho «Funciona»). Luego «Girá el freno del agua hasta que el riego salga parejo» (3/5, bomba «Funciona»). Y «Si el cable de la ladera sigue caliente, alguien tiene que ceder» (usé Medir un camino sobre el Horno: «Una buena parte»; subí el freno del horno 1/4 → 2/4; cable «Fresco»). Pantalla «¡Funciona!»: «Una línea compartida tiene un límite: lo que toma uno, no lo toman los otros. Elegir un reparto es decidir quién cede.» Muy buena lección.
- Problema: los botones «frenar más / menos» se re-renderizan y las referencias quedan obsoletas (ref stale), y el mismo botón aparece duplicado en el DOM (2 coincidencias). Como jugador lo noto solo como fricción, no lo vi en pantalla.
- Ojo: el texto del freno «frenar más» sube el número (2/5 → 3/5). En el panel dice «1/5» al inicio: la escala es 1 a 5 y no está claro si «más» significa más resistencia. Lo entendí probando.
- Escena final: Vega/Yesca/Ohm y el sendero del lago abierto («Nereo los espera»). El diálogo tiene mucho texto con «Continuar» (cada línea con Enter): un tramo largo sólo con Enter.
- Pantalla: en 1280x800 el panel de «Observación de Ohm» quedaba fuera del encuadre a la derecha, y el panel de tablero también; se ve completo sólo con read_page/get_page_text.

## Cierre (jugador 21, tramo Terrazas)

Estado final: Las Terrazas completa (forja, manivela del canal, tablero «La paciencia del invernadero» resuelto, escena de cierre). NO llegué al Lago de las Señales ni al Faro: el acceso no apareció tras ~25 min. Tiempo aproximado: carga y menú 5 min; exploración y diálogos 15 min; forja y manivelas 20 min; tablero 15 min; escena 5 min; búsqueda del lago 25 min sin resultado.

### 1. Esperaba X, pasó Y
- Esperaba que «Continuar el viaje» entrara directo. El primer clic no registró (la pantalla estaba cambiando de tamaño); el segundo abrió «Abriendo los caminos».
- Esperaba que la flecha dorada me llevara al acceso del lago. Me llevó en zigzag por el sendero de Terrazas hasta un cartel «El Lago de las Señales» que no responde a E. El mapa pone el rombo dorado al noreste, del otro lado del río. La flecha del mundo y el rombo del mapa no coinciden.

### 2. Mesas
- Forja (horno de Yesca): el concepto no quedó claro al principio. Usé «Mirar con Ohm» y leí «Pasa corriente por acá», sin decir si eso era bueno o malo. La acción del cartel alterna entre «Devolver el horno a su palanca propia» y «Pasar el horno a la mesa compartida». Sin el tablero no habría entendido qué estaba moviendo.
- Manivela del canal (casa de Vega): «Abrir el canal de los bancales». Vega dijo dónde estaban las dos manivelas; ayudó mucho. Un detalle: «Entrar · Casa del molino» tapa el aro dorado de la manivela cuando me acerco por la puerta.
- Tablero de calor y riego (La paciencia del invernadero): aquí aprendí. Freno del calor a 3/5 → lecho de raíces «Funciona»; freno del agua a 3/5 → bomba «Funciona»; «Medir un camino» sobre el horno dio «Una buena parte» → subí el freno del horno a 2/4 → cable «Fresco». Pantalla «¡Funciona!»: «Una línea compartida tiene un límite: lo que toma uno, no lo toman los otros. Elegir un reparto es decidir quién cede.»

### 3. Puzzles
- Tablero: medio. Las pistas de Ohm son concretas y en orden (una por paso). Confuso sólo el estado del horno (ver punto 2).
- Forja: confuso. No hay pista de qué significa «palanca propia».

### 4. Bitácora
- Abre con J y tiene 11 páginas. Muestra tramos anteriores (La cuenta del carro, con esquemas de cableado y tabla de mediciones). Me gustó que Edda y Marín dejen notas.
- Los botones de PDF (A4 y A5) están en el encabezado. No los toqué. Quedan muy cerca del borde superior derecho: riesgo de click accidental.

### 5. Navegación
- La cámara sigue al personaje; a veces el clic cae en otro lugar. Caminar con WASD casi no mueve (8 pulsaciones: apenas un paso). La navegación fue por clic.
- La flecha dorada avanza por tramos cortos y da la vuelta.
- El mapa tapa el botón «Guía de viaje» (H); hay que cerrar el mapa o usar «Ver guía» dentro del mapa.

### 6. Arte y presentación
- Muy buena atmósfera: el molino, los huertos en terrazas, el río, los sauces. Los personajes tienen silueta y expresión clara.
- El panel de Ohm y el tablero se cortan a la derecha en 1280x800 (sin botón visible para cerrar la observación).

### 7. Diálogos e historia
- Muy buenos: Yesca (la forjadora, con su «???» al principio), Vega (directa), Ohm (con humor, «Todavía no hemos determinado qué veníamos a decir»).
- Hay mucho texto línea por línea con Enter: en la escena final son unas 10 líneas seguidas. Se podría juntar.

### 8. Errores o bugs
- Esc con la observación de Ohm abierta abre el menú de Pausa en vez de cerrar sólo la observación.
- El panel de la observación queda fuera del viewport a la derecha.
- El primer clic en «Continuar el viaje» no registra durante el cambio de tamaño.
- El cartel «El Lago de las Señales» no responde a E: el acceso no se abre y el mapa dice «Buscá el acceso».
- En el tablero, los frenos se re-renderizan en cada clic (en mi herramienta las referencias quedaban obsoletas; como jugador no lo notaría).

### 9. Ritmo
- Terrazas, sin el tiempo perdido en el lago, se siente de 1 hora larga, con buen equilibrio entre diálogo, exploración y puzzle.
- El tramo del lago se corta por el acceso, y eso frena la sensación de progreso al final.

### 10. Top 10 a mejorar
1. Acceso al Lago de las Señales: el cartel no responde a E, la flecha del mundo da vueltas por Terrazas, y el rombo del mapa está al noreste del río.
2. Acción del horno: el texto cambia entre «Devolver…» y «Pasar…» sin decir qué significa «mesa compartida» ni si es bueno.
3. Observación de Ohm y tablero cortados en 1280x800; el botón de cerrar queda afuera.
4. Esc cierra por la pausa en vez de cerrar la observación.
5. Cámara y clics: el clic cae a veces en otro lugar; WASD casi no mueve.
6. Primer clic de «Continuar el viaje» sin feedback mientras cambia el tamaño.
7. El mapa tapa el botón de la Guía (H).
8. Botones de PDF A4/A5 cerca del borde superior de la Bitácora (riesgo de click accidental).
9. Diálogos con demasiados «Continuar» seguidos.
10. La casa del molino tapa la manivela del canal (prompt «Entrar» vs. «Abrir el canal»).

### Top 5 mejor
1. Tablero «La paciencia del invernadero»: la lección de línea compartida se entiende jugando (frenos + «Medir un camino» + «Una buena parte»).
2. Ohm en el tablero da pistas graduales y concretas (freno del calor → freno del agua → «alguien tiene que ceder»).
3. Vega orienta sobre las dos manivelas: pista clara sin spoilear.
4. Bitácora con tramos anteriores y esquemas de cableado y mediciones: refuerza lo aprendido.
5. Arte y personajes con identidad (Yesca, Vega, Ohm).
