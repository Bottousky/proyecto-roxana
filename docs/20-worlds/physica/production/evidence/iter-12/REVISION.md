# Iteración 12: revisión independiente de las opciones y respuesta

**Quién revisó:** un subagente con contexto separado, en dos pasadas. Agregó sus propias pruebas: táctil emulado y un mando simulado.

**Veredicto de la primera pasada:** A16 se cumplía **en parte**. Además, el cambio había empeorado tres cosas:
- en el teléfono, «Usar» quedaba fuera de la pantalla;
- `?reduced` y la preferencia del sistema dejaban de mandar;
- el foco podía salir del panel.

| # | Hallazgo | Respuesta | Estado tras la verificación |
|---|---|---|---|
| 1 | En un teléfono (390 px) «Usar» quedaba fuera de la pantalla; ya estaba recortado antes de agregar ⏸. | ⏸ va a su propia esquina; botones táctiles más chicos por debajo de 480 y 420 px. A 390 px todos quedan adentro, con 40 px entre los grupos. | **corregido** |
| 2 | El mando abría el panel pero no podía operarlo; Select abría la Bitácora detrás. | Con el mando en el panel:<br>· ▲▼ mueven el foco;<br>· ◀▶ cambian el valor;<br>· A activa, B cierra;<br>· ▼ sobre «Controles» abierto desplaza la tabla.<br>Select no llega a la Bitácora en pausa. | **corregido** (después de la segunda pasada: desplazamiento de 292 px hasta «Seguir», con todo visible) |
| 3 | El foco salía del diálogo y Tab terminaba abriendo la Bitácora. | **Trampa de foco:** en el documento mientras hay pausa.<br>**Lo de afuera:** todo lo que no es el panel queda `inert`.<br>**Teclas:** mientras el panel está abierto, el juego no las recibe. | **corregido** (después de la segunda pasada: ni un clic en el texto del panel seguido de Shift+Tab lo saca) |
| 4 | El movimiento reducido no cubría el inicio, las reapariciones ni la inclinación del Pozo. | **Cortes:** en cada cambio de plano y en cualquier salto de la cámara de más de 3 unidades.<br>**Pozo:** la inclinación pasa a ser continua en la posición, así no salta en el borde (lo encontró la segunda pasada). | **corregido** (inicio: 0 cuadros de viaje y 3 cortes, contra 168 cuadros de viaje sin la opción) |
| 5 | Guardar cualquier ajuste fijaba el movimiento reducido y le ganaba a `?reduced` y al sistema. | **Guardado:** `reduced` se guarda sólo si el jugador lo elige.<br>**Prioridad:** `?reduced` siempre gana, y la casilla dice por qué está desactivada. Se sigue el cambio del sistema.<br>**Pruebas:** `settings.test.js`. | **corregido** |
| 6 | Con texto a 1,5×, en un teléfono los avisos salían de la pantalla; la ayuda táctil tapaba el título. | Los avisos se mantienen dentro de la pantalla. Cada dispositivo tiene su propia ayuda (teclado, táctil, mando); la táctil va encima de la barra y la leyenda, debajo de ⏸. | **corregido** |
| 7 | Anillo de foco con contraste bajo (2,08:1). | Óxido sobre papel: 4,93:1. | **corregido** |
| 8 | **Detalles:**<br>· la casilla se achicaba;<br>· el nombre accesible incluía la descripción;<br>· el deslizador no tenía texto de valor;<br>· los tamaños no eran radios;<br>· el panel usaba `100vh`. | **Arreglos:**<br>· la casilla con `flex: none`;<br>· la descripción con `aria-describedby`;<br>· el deslizador con `aria-valuetext`;<br>· los tamaños como radios nativos;<br>· el panel con `100dvh`;<br>· «Seguir» pegado abajo. | **corregido** |

**Veredicto de la verificación:** A16 se cumple.

**Lo que queda menor:**
- Los botones ▲▼ táctiles miden 42 px, un poco menos de los 44 recomendados.
- Al ajustar la posición del aviso se usa el ancho del texto del cuadro anterior.
