ESTADO ACTUAL: Castillo de la Red (05:14) · TRABADO en la mesa «Conectar los servicios del Castillo» (la del troncal). Sin cerrar el lugar; «Siguiente paso» sigue en el Castillo según el mapa. Sesión cortada por el jugador de prueba para no seguir a ciegas.

# Informe de playtest 25 (posta): Ohmdal · La Luz, Arco I desde el Castillo de la Red

Jugador de prueba: chico/a de 12 a 15 años, sin conocimientos de electricidad.
Inicio: 2026-10-16, 04:58 · Fin: 05:14 (hora de Buenos Aires). Unos 16 min reales de juego.
Pestaña: «seed» (tabs_create falló; se usó navigate + tabs_context). Viewport 1280x800.
Llegada: Arco I (Castillo de la Red, Tarde, Día 1). No se llegó a Lugar 2.

## Resumen
- Lugares resueltos: 0 de 4 (el Castillo no se cerró).
- Mesas resueltas: manivela «separar el archivo oeste» (figura «✓ Hecho» en el juego), troncal («✓ Hecho · desconectar el troncal sano»). La mesa «Conectar los servicios del Castillo» no dio el cierre: el mapa sigue marcando «Siguiente paso» en el Castillo.
- Tiempo: ~16 min reales. Ojo: lo de «tiempos» que suelo medir por pasos es engañoso acá; la mayor parte fue pelea con el movimiento y con el estado contradictorio.

## Lo que hice, en orden
1. Abrí http://localhost:4190/?tramo=cerob y elegí «Continuar el viaje». La carga pasó de 96% a 67% (retrocede) y luego entró.
2. Leí Bitácora, Guía y Mapa (ninguna descarga tocada). La Guía decía: «buscá con la Consejera una forma de recuperar servicios sin poner en riesgo a sus vecinos». La Bitácora mostraba dos intentos previos fallidos de «Conectar los servicios del Castillo» («se pedía demasiado», 0 V · 0 A).
3. Usé el tablero de los servicios (E): Ohm dijo «Saltó la protección. El archivo oeste, el que se mojó, sigue unido a la red». La Consejera Ivara: «No hace falta desunir los servicios: separen el archivo, con la manivela de la izquierda del patio».
4. Usé la manivela de la izquierda: quedó «✓ Hecho · deshacer: separar el archivo oeste».
5. Volví al tablero: Ivara repitió «El troncal ya está conectado. Falta separar el archivo oeste» (contradice el punto 4). «Ver las lecturas» del tablero: 0,00 V y 0,00 A; el texto dice «No cuenta la rama del archivo que quedó separada». Eso sugiere que el archivo sí está separado.
6. La mesa del troncal (la de piso cian en el centro del patio) dice «✓ Hecho · deshacer: desconectar el troncal sano». Usar E ahí deshace, así que no la toqué de nuevo.
7. Al usar la mesa «Conectar los servicios del Castillo» otra vez, aparecieron el diálogo de Ohm de la protección y de la Consejera, pero no se abrió ningún tablero con «Volver». El mapa sigue en «Siguiente paso».
8. Me quedé trabado: no sé si falta reconectar el troncal después de separar el archivo, o si el juego no registró la manivela. No encontré pista que lo aclare.

## Dónde me trabé
- Mesa «Conectar los servicios del Castillo» (troncal, piso cian en el centro): no cierra el lugar después de separar el archivo oeste.
- Dónde: Castillo de la Red, patio de la torre. El juego no dice qué paso falta después de «separar el archivo».
- Por qué: estado contradictorio (manivela «Hecho» vs. Consejera «Falta separar»; mesa de troncal «Hecho» vs. mapa «Siguiente paso»).
- Probé: tablero (E y Mirar con Ohm), manivela izquierda (una vez, luego viendo que decía Hecho), mesa del troncal (no la repetí, porque deshace), diálogos completos, Guía, Mapa, Bitácora.

## Navegación (importante, parte del problema)
- Clics en el suelo: el personaje a veces se queda parado junto al banner «El reverso del estandarte» o junto a la lámpara; otras veces rodea la torre sin motivo. Hay que hacer varios clics.
- Teclas WASD: sólo mueven con repeticiones largas (key repeat 15 a 40 de a poco); con 1 o 3 pulsaciones casi no se mueve. Un chico no hace eso: mantendría la tecla. Esto puede ser limitación de mi herramienta, no del juego, pero el borde del patio se siente como una pared invisible.
- Clic sobre Consejera Ivara: sólo habla si estás cerca; a veces el clic cerca del tablero abrió el mapa solo.
- Mapa: el botón «Mapa» alterna; a veces no cierra. Usé el botón «Cerrar» del panel (ref de read_page).

## Bitácora, Guía y Mapa
- Bitácora: la abrí y la leí. Sirve para ver intentos previos, pero no dice qué hacer. Tiene el botón «Descargar la Bitácora» y «Versión libro A5» (no los toqué).
- Guía: clara en el encabezado («Ubicarme en el mapa», «Abrir bitácora»), pero el texto de «Probá una idea» habla de «un banco» y no lo ubicó en el mapa. Eso confunde: tuve que deducir cuál mesa era el banco.
- Mapa: el marcador dorado «Siguiente paso» está sobre el Castillo, pero no indica la mesa. Sirve sólo para la zona.

## Arte y presentación
- Muy linda la ambientación (torres, banderas con Ω, piedra, arboleda). Los banners con Ω se ven bien.
- La luz del día y las sombras dan calidez.
- Los cables amarillos se ven, pero se confunden con el borde del patio.

## Diálogos e historia
- La Consejera Ivara es clara y cálida («Mi madre lo mandó bordar...»).
- Pero sus líneas se repiten y a veces contradicen el estado de las mesas.
- Ohm es útil: explica tensión y corriente en palabras simples.
- Observación «El reverso del estandarte»: plano bordado con hilo de cobre. Muy buena idea de historia, pero se dispara cada vez que pasás cerca y se repite.

## Errores o bugs
1. Estado contradictorio: manivela «archivo oeste» dice Hecho, pero el tablero/la Consejera dicen que falta separarlo.
2. El mapa sigue en «Siguiente paso» con el troncal «Hecho». No hay confirmación de que el lugar esté completo.
3. La carga muestra un 96% y luego baja a 67% antes de entrar.
4. Observación «El reverso del estandarte» se repite al pasar cerca y saca la Consejera de encima (dos diálogos seguidos).
5. El botón Mapa a veces no cierra; hay que usar el botón «Cerrar» del panel.
6. Dos mesas con etiqueta parecida («Conectar los servicios del Castillo» y el troncal) confunden: no está claro cuál es el banco.
7. El movimiento con clics se atasca en el borde del patio.

## Ritmo
- Lento en el Castillo: el primer lugar se volvió una búsqueda de la mesa correcta.
- Demasiadas líneas de diálogo repetidas.

## Top 10 a mejorar
1. Estado coherente en las mesas: la manivela y la Consejera deben decir lo mismo.
2. Confirmación clara cuando se cierra la mesa (y que el mapa marque el siguiente paso).
3. Nombrar la mesa del banco igual que en la Guía («el banco») y que su etiqueta coincida.
4. Evitar que el banner «El reverso del estandarte» frene al personaje o repita la observación.
5. Diálogo de la Consejera que no se repita si el paso ya está hecho.
6. Movimiento: que un clic cerca de un objeto no cierre el mapa ni deje el personaje trabado.
7. Botón Mapa que siempre cierra.
8. Carga sin retroceso de porcentaje.
9. La Guía debería decir qué mesa usar en cada paso, no sólo «un banco».
10. Que el borde del patio no se sienta como pared invisible.

## Top 5 de lo mejor
1. Ambientación y arte del Castillo (torres, banderas Ω, luz de la tarde).
2. La Bitácora con los intentos previos: explica qué se probó sin dar la respuesta.
3. Ohm explica tensión y corriente en palabras simples.
4. La Guía es clara en el encabezado y ofrece «Ubicarme en el mapa».
5. El banner de la observación del plano bordado: una buena idea de historia escondida a la vista.
