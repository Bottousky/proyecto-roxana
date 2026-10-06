# Iteración 13: revisión independiente de la transición 2.5D → 3D y respuesta

**Quién revisó:** un subagente con contexto separado, sobre la secuencia con teclado real, el código y las pruebas.

**Veredicto:** se cumple **en parte**.
- **Lo que está bien:**
  - una sola simulación con rangos de profundidad;
  - el explorador conserva su caminar y su gravedad;
  - las dos cámaras miran a −z, así que ◀▶ significan lo mismo;
  - la revelación a través del arco abierto es un momento real de «el mundo tenía profundidad».
- **Lo flojo:** tres de los cuatro puntos del §2.

| # | Hallazgo | Respuesta | Estado |
|---|---|---|---|
| 1 | En profundidad, los objetos no eran sólidos: el explorador atravesaba la fuente y los faroles. Era una regla más débil que aparecía con la cámara, el olor a «dos juegos». | **Obstáculos en profundidad:** la fuente, los faroles y la palanca con su eje.<br>**Canteros:** sólidos con rango de profundidad, que se suben como un escalón.<br>**Pruebas:** dos. | **corregido** |
| 2 | En la plaza, el ángulo cerrado (32°) sólo mostraba fachadas; no entraban la cúpula ni el horizonte. | El ángulo se abre con la profundidad (32° → 48°): la cúpula entra en el cuadro. | **parcial** (no hay toma alta que muestre la plaza entera, ni una torre de la ciudad pintada) |
| 3 | Fuera del eje, la cámara quedaba dentro de la roca del muro. | Dentro del pasaje, la cámara no sale de su ancho. | **corregido** |
| 4 | El cambio de cámara era brusco: ~0,6 s, con el explorador cuatro veces más grande de golpe. | La mezcla abarca todo el umbral (z de 0 a −3,6), suavizada: ~1 s a paso de caminata. Con movimiento reducido, sigue la posición. | **corregido** |
| 5 | El barrio aparecía de golpe al apretar E, con los techos sobre el muro: contradice «el mundo siempre tuvo profundidad». | **Por ahora:** el barrio se dibuja desde que el arco empieza a abrirse.<br>**Mejor, propuesto por el revisor:** dibujarlo siempre y diseñar lo que asoma sobre el muro (la cúpula en el eje del arco, techos en la bruma), como decorado antes del Mirador y pista después. | **pendiente** (próximo resultado) |
| 6 | Legibilidad: nada en el arco cambiaba después del Mirador; no había cómo saber volver; la barra seguía diciendo «▲▼ ajustar, trepar». | **Señales:**<br>· una nota de la Bitácora al ver la ciudad («El arco tapiado»);<br>· luz entre las juntas del relleno.<br>**Avisos:** «▲ Entrar» en el umbral; «▼ Volver» al quedarse quieto en la plaza.<br>**Bitácora en la plaza:** una nota al entrar («Detrás del muro»). | **parcial** (la luz entre las juntas se ve poco en la cámara de juego; la barra de ayuda no cambia en profundidad) |
| 7 | El eje del mecanismo era sólo nominal. La hoja giraba 100° y se metía en la pared, y «▲ Entrar» aparecía con la hoja casi cerrada. | **El mecanismo:** una manivela de latón en la Terraza, visible en la vista 2.5D, con un eje que corre en profundidad hasta el arco y un engranaje que gira el eje de la hoja.<br>**La hoja:** se detiene en 90°.<br>**Una sola autoridad:** la simulación lleva el tiempo de giro (1,6 s); la puerta es transitable recién al terminar y el dibujo sigue ese estado. | **corregido** |
| 8 | No se lee como la metrópolis: casa de muñecas, sin puertas ni habitantes y sin nada que hacer; las cajas con fachadas pintadas al lado de los estratos pintados parecen otro juego. | **Pendiente.** El próximo paso mínimo propuesto: un experimento cotidiano que reuse un instrumento del 2.5D («el mismo instrumento, otro lugar»), soportales, puertas y uno o dos habitantes. | **pendiente** (próximo resultado) |
| 9 | La fuente: la trayectoria es honesta (integrada en el campo, en su profundidad), pero el cuenco está seco y los chorros parecen caños grises. | Pendiente: un chorro central lanzado a la misma velocidad que la surgencia (2,95 m/s), que acá sube sólo 0,44 m; agua en el cuenco, salpicaduras. | **pendiente** |

**Hallado al corregir, no por el revisor:**
- **El defecto:** dos pruebas del recorrido 2.5D fallaron. Al agarrar el borde, el espacio libre se comprobaba contra todos los sólidos sin mirar la profundidad, y un cantero de la plaza (15 m detrás) caía justo en el lugar de llegada sobre la Terraza.
- **La corrección:** ahora toda consulta sobre sólidos pasa por `atDepth` (contactos, escalones, agarres y la validación del apoyo guardado en la Bitácora).
