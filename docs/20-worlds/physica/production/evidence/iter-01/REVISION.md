# Iteración 01: revisión independiente y respuesta

La revisión la hizo un subagente con contexto separado. Recibió los criterios del contrato y la evidencia (`ev2`, anterior a las correcciones), no el relato del implementador. Además corrió simulaciones propias. Abajo, cada hallazgo y qué se hizo.

| # | Hallazgo | Respuesta | Estado |
|---|---|---|---|
| 1 | El agua dibuja la ruta ganadora; no hay anticipar, ni fallar sin castigo, ni modificar, ni transferir. | Es el mayor impedimento pedagógico del Hito A y pasa a ser el próximo resultado (A8 y A9). La escena tiene que pedir una predicción comprometida y separar «el agua enseña la regla» de «el agua enseña la ruta». | **pendiente**: próximo |
| 2 | Casi-bloqueo: al volver desde la Terraza, el explorador oscila pegado a la pared (3 de 7 tiempos de reacción). R no rescata al explorador. | **Agarre del borde**: ayuda declarada, dura 0,28 s y se activa si el borde está ≤ 0,45 m sobre los pies. **R en el aire** devuelve al último apoyo firme. Hay pruebas de regresión para los 7 tiempos y para R. Con teclado real, lo logra. | **corregido** |
| 3 | El avatar mira al fondo: se ve la nuca y la sorpresa nunca se lee. | El yaw ahora es −0,6 a la derecha y −(π−0,6) a la izquierda. La cara queda en 3/4 hacia la cámara (`00-inicio`, `03-cruce`). | **corregido** |
| 4 | Las anclas laten a ritmo fijo y casi no se ven; la oscilación sin pérdida se lee como movimiento perpetuo. | Propuesta adoptada para la próxima iteración: que la caída familiar mueva una rueda que alimente las anclas, con `power` modificable. Mientras tanto, la traza se cierra al completar una vuelta. | **parcial** |
| 5 | A y B difieren en lugar, altura y suelo, están a 11,45 m y nunca entran juntos en cuadro. | Ahora A y B sueltan a 1,8 m, separados por 2,95 m a ambos lados del borde, con la regla y el mástil graduado entre ambos. Las dos trazas quedan en el mismo cuadro (`02`). | **corregido** |
| 6 | La Bitácora usaba la altura del borde desde la configuración, un texto fijo («más de tres metros») y una ventana de ajuste basada en la zona. | El borde se detecta en las marcas (cambio de signo de la segunda diferencia). El ascenso del explorador se mide de su trayectoria. El ajuste usa la primera subida. Hay pruebas: −9,80 y +4,00. | **corregido** (falta el gráfico v–t) |
| 7 | No hay 60 FPS: p95 33 ms, p99 50 ms. | Causa medida: shader de roca con fbm por fragmento, más sombras. La lógica JS cuesta 0,25 ms. Se reemplazó por una textura de ruido y los muros del fondo dejaron de proyectar sombras. Las marcas pasaron a instancias. Resultado: p99 16,8 ms en reposo y en el cruce. | **corregido** (escritorio) |
| 8 | Arte: el arco es un tubo uniforme, los estratos son ruido borroso, la hierba son conos y el musgo va en zigzag. Ninguna toma reúne las tres aguas. | Musgo: amortiguación y rigidez de flexión; hebras continuas (`08`). El resto queda en el backlog (A10 y un plano de establecimiento nuevo). | **parcial** |
| 9 | Una plomada apunta horizontal por el viento, aunque el campo no tiene componente x. | Los instrumentos ya no reciben viento. | **corregido** |
| 10 | En táctil no se puede abrir la Bitácora; la leyenda tapa la ✕; el guardado no conserva la posición. | Botón táctil ✎. La leyenda se oculta con la Bitácora abierta. Se guarda el último apoyo firme y se retoma al recargar. | **corregido** (táctil sin probar en dispositivo) |

**Sin fallas, según el evaluador:** la velocidad es continua al cruzar el límite, y la condición pertenece al espacio (agua, esferas, musgo, bufanda y explorador).
