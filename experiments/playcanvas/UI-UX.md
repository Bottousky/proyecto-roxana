# Interfaz de viaje

La interfaz conserva el instrumento de bronce, los paneles verdes y el atlas de papel. Los accesos del HUD tienen nombre y un área de interacción de al menos 44 px. La pregunta actual queda visible hasta que el jugador la pliega; la orientación de la brújula también aparece escrita.

- **Guía (H)**: pregunta pendiente, próximo acceso real, observación con Ohm según su disponibilidad y controles desplegables. Se conecta directamente con mapa y bitácora.
- **Mapa (M)**: abre la zona actual. La otra pestaña muestra el reino; las flechas del teclado, Inicio y Fin cambian de pestaña. El plano local encuadra el lugar y se amplía si el jugador está en un camino de enlace. Un rombo identifica el próximo encuentro o acceso. Los viajes a lugares ya visitados están agrupados en un desplegable explícito.
- **Lectura**: textos mayores en observaciones, conversaciones y bitácora; controles de cierre de 44 px; mapa ampliable con desplazamiento contenido.
- **Teclado**: los diálogos modales aíslan el juego mediante `inert`, incluyen el campo de notas en el recorrido del foco y devuelven el foco al control que los abrió. Escape cierra la página.
- **Táctil**: el botón de interacción indica cuándo acercarse y se deshabilita sin un objeto próximo. La cruceta libera la dirección si pierde la captura del puntero.

Los módulos compartidos viven en `src/journey-guide.js` y `src/journey-ui.css`, con su copia autónoma en `experiments/playcanvas/src/game`. `sync-game.mjs` incluye ambos archivos.

Validación: 259 pruebas del juego compartido y 75 de PlayCanvas, comprobación TypeScript y compilación de producción. Revisión de interfaz real a 1280 × 720 y 390 × 844, con partida de prueba en un origen local independiente para preservar el guardado habitual. El aviso de tamaño del paquete de PlayCanvas sigue presente.

Los cambios están preparados localmente; este trabajo no modifica el sitio publicado.
