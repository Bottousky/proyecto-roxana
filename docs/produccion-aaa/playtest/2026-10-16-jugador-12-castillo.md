# Playtest 12 · Tramo Castillo de la Red → Faro

Resultado: NO completado. El tramo no se pudo jugar. Causa: un error mío sobreescribió la partida del tramo.

Jugador de prueba: chico/chica 12-15 años, sin conocimientos de electricidad.
Pestaña propia: seed, 1280x800 (ya cerrada y viewport restablecido a desktop).
URL usada: http://localhost:4190/?tramo=castle

## Qué pasó, en orden

1. Abrí la pestaña con preview_start (el panel del navegador no estaba abierto; tabs_create falló). El título mostraba: «Castillo de la Red · Tarde, día 1 · 4 de 9 luces encendidas · 2 min de viaje».
2. Elegí «Continuar el viaje». Cargó el mundo en el Castillo de la Red (pregunta: «En el Castillo, buscá con la Consejera una forma de recuperar servicios sin poner en riesgo a sus vecinos»). Hasta ahí bien.
3. Pulsé la tecla «w» cinco veces (para caminar). Error mío: la página cambió a la URL raíz (sin ?tramo=castle) y apareció el diálogo «Volver a cruzar» («Un nuevo viaje reemplazará la bitácora de este navegador. Si quieres conservarla, guárdala antes»). No pulsé ninguna de sus opciones, pero el diálogo ya era de «Comenzar otro viaje».
4. En la URL raíz el título mostraba «16 min de viaje» y apareció el formulario de registro («Cruzar el Portal»). Lo cerré con «Cerrar», sin enviarlo.
5. Recargué ?tramo=castle y pulsé «Continuar el viaje». Esta vez no cargó el mundo: abrió de nuevo el formulario de registro (ahora el título decía «2 min de viaje»).
6. Cerré ese formulario con la X (coordenada 553,104 en la captura). Error mío: la X terminó cruzando el Portal. Ahora la pantalla dice «¡Cruzaste! ¡Alguien cruzó!» (Arco I, «???», «LA MUCHACHA DE LA ESCOBA»), y la Bitácora dice que está «todavía en blanco».
7. Conclusión: la partida del tramo del Castillo fue reemplazada por un viaje nuevo. Dejé de jugar para no seguir ensuciando el estado. No envié el formulario de nombre ni elegí ninguna opción del diálogo de nuevo viaje.

## Lo que pude observar antes del error (Castillo de la Red)

- Título: «El mundo no perdió su luz. Olvidó cómo encenderla.» Tres botones: Continuar el viaje, Comenzar otro viaje, Opciones. Bien claro.
- Pantalla de carga «Abriendo los caminos · 100%»: rápida, sin problemas.
- Mundo: HUD con brújula, tarjeta «Castillo de la Red / Tarde · Día 1», objetivo «Una red que se puede comprender» y «Tu pregunta está en este lugar». Controles visibles abajo: WASD caminar, Shift correr, E usar. Botones Ohm, Bitácora, Mapa, Guía, Pausa.
- Arte: caminos de piedra, río, setos, árboles; se ve bien y con buena luz de tarde.
- Me faltó llegar a la Consejera y al primer puzzle, así que no tengo opinión de mesas ni de puzzles del Castillo.

## Bugs y problemas detectados (para revisar)

1. **Diálogo de «Comenzar otro viaje» accesible por error desde el título con teclado.** Mientras la pantalla de título todavía tenía el foco en su botón, pulsar «w» abrió el diálogo «Volver a cruzar». Un jugador podría caer ahí igual. Sugerencia: que las teclas de movimiento no activen nada en el título, o que el diálogo de reemplazo pida confirmación explícita antes de aparecer.
2. **El botón «Continuar el viaje» no siempre continúa.** La primera vez cargó el mundo; la segunda, con la URL ?tramo=castle recargada, abrió el formulario de registro en vez de cargar la partida. El título mostraba el mismo resumen («4 de 9 luces», «2 min»), así que el jugador no tiene forma de saber que la partida no está.
3. **Cerrar el formulario de registro con la X lo envía.** Es el problema más serio: un jugador que quiera cerrar el formulario empieza un viaje nuevo sin querer. La X debería solo cerrar, sin crear personaje ni cruzar el Portal.
4. **El contador de viaje cambia entre pantallas.** Mismo tramo, en la URL raíz decía «16 min de viaje» y en ?tramo=castle «2 min». Confuso para el jugador.
5. **La URL pierde ?tramo=castle al pulsar teclas.** La página pasó a la raíz sin acción explícita del jugador.

## Qué le falta al jugador de prueba (sin partida del tramo)

No pude evaluar: mesas del Castillo, comprensión de electricidad, puzzles, uso de la Bitácora para ponerse al día, navegación del tramo, diálogos con la Consejera, ritmo hasta el Faro. Para el informe pedido sobre ese tramo, hay que restaurar la partida del Castillo y repetir la prueba.

## Lo que hace falta antes de repetir

- Restaurar la partida del tramo del Castillo (la que tenía «4 de 9 luces» y estaba en la Loma de la Red) desde una copia, o regenerarla con el script de tramos que la creó. Yo no leí ningún archivo del proyecto y no sé dónde está.
- Verificar que el viaje nuevo que se creó no pisó otra partida importante del usuario.
- Probar otra vez con cuidado: no pulsar teclas en el título y no cerrar formularios con la X.

## Top 10 a mejorar
(Solo corresponde a lo visto antes del error; lo demás no se pudo evaluar.)
1. Cerrar el formulario de registro con la X no debe crear personaje ni cruzar el Portal.
2. Las teclas de movimiento en el título no deben abrir diálogos de reemplazo de viaje.
3. «Continuar el viaje» debe cargar la partida del jugador siempre; hoy abrió el registro en vez de la partida.
4. El diálogo «Volver a cruzar» debe ofrecer un botón de cancelar claro, además de guardar copia o empezar.
5. El contador «min de viaje» debe ser el mismo en todas las pantallas.
6. La URL no debe cambiar a la raíz sin acción del jugador.
7. (Sin evaluar) Mesas del Castillo: concepto de red, entender la red sin electricidad previa.
8. (Sin evaluar) Pistas para llegar a la Consejera desde la flecha dorada.
9. (Sin evaluar) Ritmo del tramo completo.
10. (Sin evaluar) Bitácora como puesta al día: no pude probarla con el tramo.

## Top 5 de lo mejor (lo visto)
1. Título con tono claro y botones bien separados.
2. Carga rápida y sin errores visibles.
3. HUD con brújula, tarjeta de lugar y objetivo del momento.
4. Arte del Castillo: caminos de piedra, río y vegetación en buena luz.
5. Bitácora al día con texto corto y personal («El Portal te suelta sobre la piedra lisa»), al menos en el inicio del viaje nuevo.

## Tiempos
Aprox. 15 minutos entre la carga inicial y el cierre de la prueba, casi todo en el error y su recuperación. No hay tiempos de mesas: no llegué a ninguna.
