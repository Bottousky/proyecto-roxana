# Escenas de La Luz

Las escenas usan el mundo del juego, sus sprites y sus mecanismos. La exploración
conserva la cámara recta; los encuadres especiales aparecen una sola vez al dejar
en servicio seis instalaciones. No se reproducen por volver a entrar en un lugar.

| Momento | Plano | Duración, incluido el regreso |
| --- | --- | --- |
| Despertar de Ohm | Acercamiento a Ohm y su pedestal; apertura hacia el viajero. | 5,3 s |
| Lámpara de Lumen | Lámpara reparada, mesa y taller iluminado. | 5,2 s |
| Bomba | Bomba en servicio y agua recuperada. | 5,5 s |
| Riego | Tablero, canal y bancales que reciben agua. | 5,8 s |
| Corona del Faro | Engranajes y luces de la galería; todavía sin haz exterior. | 5,5 s |
| Primera luz | Óptica, ascenso de la torre y apertura diagonal hacia el haz. | 12 s |

El resultado físico se conserva desde que se termina el banco. Durante la escena
se detienen los desplazamientos, se retira la interfaz de exploración y aparece
una frase breve. Después del regreso de cámara comienza el diálogo existente.
La escena no añade una explicación técnica ni un paso necesario para resolver.

«Saltar escena», Escape, Enter o espacio inician un regreso de 0,7 segundos.
El salto conserva la conversación posterior y la restauración. «Movimiento suave»
omite el recorrido de cámara; entrega directamente el diálogo. Al ocultar la
pestaña se detiene el avance de la escena.

El guardado almacena una escena pendiente, sin tiempo de reproducción ni callbacks.
Recargar durante ella permite retomarla desde el comienzo con el mecanismo ya
reparado. Al terminar se guardan juntos la marca de escena vista y el diálogo que
sigue. Una recarga durante el diálogo final o su tarjeta conserva ese cierre.
Los guardados anteriores mantienen su progreso y no reciben retrospectivamente
las escenas de instalaciones ya reparadas; se conserva la recuperación del Faro
cuyo final aún estaba pendiente.

`scripts/qa-cinematics.html` sirve sólo en desarrollo. Prepara escenarios en el
origen de Vite y abre el juego real en un iframe; la partida de producción en 4180
queda separada. Su marco móvil permite revisar el encuadre y el botón de salto.
El reloj de revisión puede ralentizar los planos y detener el Faro en su
revelación; esos controles pertenecen sólo al visor, no al juego distribuido.

Implementación: `src/cinematics.js` define los planos, `src/world.js` aplica la
cámara y anima los mecanismos, `src/cinematic-progress.js` registra la continuación
y `src/main.js` integra controles, diálogo y guardado.
