# Iteración 15 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, barridos en Node del regreso con ▼ (2.000 puntos) y las imágenes. Dos pasadas.

## Primera pasada

**Veredicto:** B2 todavía no se podía cerrar.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| 1 | alta | **Regresión:** el piso del pasaje era del barrio, y desde el lado 2.5D el portal lo ocultaba: se veía la roca lisa hasta que la cámara cruzaba el arco. | **Corregido:** el piso es de la escena y se muestra con el arco abierto (`secuencia-07`, `08`; antes, `intermedio-piso-del-pasaje-sin-losas`). |
| 2 | media | La silueta se leía en plano abierto, pero en la cámara de juego era una losa pálida sin volumen. | **Corregido:** sombreado del sol por cara y tonos medios de la bruma. Una paleta más clara quedó blanca (`intermedio-silueta-blanca`). |
| 3 | media | La plaza todavía no se leía como metrópolis: cerrada como un patio, sin escala ni vista de la ciudad, y el soportal era un relieve. | **Corregido:** una calle hacia el norte con reja y la torre del reloj al fondo; la fila norte un piso más alta; un soportal con galería y columnas sólidas. No agregué volúmenes altos detrás de las filas: desde la plaza el cuadro termina casi a la altura de la cornisa y no se verían. |
| 4 | media | **Costo de dibujo:** 949 y 827 llamadas con el arco abierto. El margen de `mouthSeen` dibujaba el barrio sin necesidad, y la mejora de las puertas fusionadas no estaba medida. | **Corregido:** margen de 5 cm con prueba de altura, galería en una malla y partes chicas sin sombra. Medido de nuevo: 930 y 796. La deuda estructural (unas 270 llamadas) queda para B5. |
| 5 | media | El fundido del corte era incompleto: el techo, las lámparas y las luces saltaban, y el fundido no se veía porque la cámara entraba en la roca enseguida. | **Corregido:** el techo es de la roca que se disuelve, las lámparas se desvanecen y las luces bajan en continuo. El corte empieza antes (`corte-01`). |
| 6 | media | `citySeen` no se restauraba al recargar: no había silueta y el arco no se podía abrir. | **Corregido:** se deriva de la Bitácora al cargar. |
| 7 | baja | Los ShaderMaterials compartidos no se clonaban. | **Corregido:** se clonan compartiendo los uniformes. |
| 8 | baja | Los vecinos se leían como muñecos de clavija: sin cuello ni manos, con el libro flotando. | **Corregido:** cuello, manos, el libro entre las manos, y miran al explorador cuando se acerca. Siguen siendo figuras simples. |
| 9 | baja | Los faroles del norte quedaban delante de puertas. | **Corregido:** van entre las puertas. |
| 10 | baja | Los escalones de 12 cm no estaban en la simulación y los pies se hundían. | **Corregido:** escalones de 5 cm. |
| 11 | baja | El descarte del fundido estaba activo siempre en los bloques del fondo. | **Corregido:** sólo mientras dura el corte. |
| 12 | baja | Las agujas del reloj estaban quietas. | **Corregido:** el reloj marcha, a velocidad real (ver la segunda pasada). |
| — | (mío) | La leyenda de las trazas aparecía en el lado 2.5D por una traza que sólo existe detrás del muro. | **Corregido.** |

## Segunda pasada

**Veredicto:** B2 se puede cerrar con honestidad una vez corregidos dos datos del README. No queda ningún bloqueo técnico ni visual.

**Verificado por el revisor:** los doce arreglos.
- **Barrido del regreso:** sin trampas. Los frenos nuevos son de frente, detrás del vecino y de las columnas, y un paso al costado alcanza para salir.
- **Pruebas:** 72/72.
- **Recorrido:** 22 pasos, 0 errores.

| Hallazgo | Respuesta |
|---|---|
| **Bloqueaba:** el README presentaba las 855 llamadas de la iteración 14 como comparación sin decir que la Terraza subió a 930. | **Corregido:** el README dice que subió y por qué. |
| **Bloqueaba:** las 796 llamadas del Mirador se habían tomado durante la vista abierta. | **Medido con la cámara de juego** (x 13,1) y el arco abierto: 796. La boca se ve por un borde del vano, así que la cifra es real. |
| El reloj corría 60 veces más rápido. Un reloj público no debería mentir en un juego que mide el tiempo. | **Corregido:** a velocidad real. |
| La secuencia 00→04 no probaba la ausencia de salto: la silueta se estaba apareciendo mientras se apretaba E. | **Recapturada** esperando 3,2 s después del Mirador, más la aparición de la silueta en el Mirador (`vista-2-mirador-*`). |
| Al volver, la ventana para deshacer el corte era de 0,1 m. | **Corregido:** el corte entra a 0,5 m de las paredes y sale a 0,55 m, así la ventana es de 0,5 m. |
| Un cuadro de atraso en `mouthSeen`. | **Corregido:** se aplica en el mismo cuadro. |
| La cabeza de la vecina giraba bruscamente cuando el explorador pasaba por detrás. | **Corregido:** detrás, vuelve a lo suyo. |
| La silueta en el plano bajo del umbral es una caja pálida. | **Abierto, como pulido.** |
| Faltaban papeles: D20 decía «color plano», y faltaban secciones del README y este archivo. | **Corregido.** |

**Estado de B2: cerrado.** Ver la decisión D20 y BACKLOG.
- **Cumplido:**
  - la transición mínima con la misma simulación;
  - el arco y su mecanismo;
  - el pasaje y la plaza;
  - el experimento cotidiano;
  - la fuente que contrasta;
  - lo que asoma sobre el muro, diseñado;
  - la plaza como nudo de una ciudad habitada;
  - el corte con fundido.
- **Pasa a B5:** el costo de dibujo del barrio y abrir la calle del norte.
