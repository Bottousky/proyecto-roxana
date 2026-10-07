# Iteración 14 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, simulaciones en Node y las imágenes de esta carpeta. Dos pasadas.

## Primera pasada

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| 1 | alta | Junto al muro, fuera de la boca, el centro del explorador llegaba a z −8,96, con 0,24 m del cuerpo dentro de la roca. Ahí la cámara seguía atada al pasaje y no había corte. Simulado: con ▼ desde (3,5; −11), 78 de 180 pasos tapados. Es el camino natural de vuelta desde el soporte C. | **Corregido.** El área del barrio empieza en z −9 y la del pasaje se extiende hasta −9,6, así se superponen. Prueba nueva: con las áreas viejas falla en 100 de 1080 pasos y con las nuevas pasa. |
| 2 | alta (B2) | Lo que asoma sobre el muro no estaba diseñado. Desde el Mirador aparecía de golpe una fachada cortada sobre el arco: «una casa encima del acantilado». | **Revertido a dibujar el barrio al abrir el arco.** Medí que costaba 195 llamadas de dibujo en cada cuadro de la Terraza. La silueta propia queda pedida para cerrar B2. |
| 3 | alta (B2) | La plaza no se lee como la metrópolis: un patio de casas de tres plantas, sin puertas, sin soportales, sin habitantes. | **Abierto:** es el próximo resultado (ESTADO). |
| 4 | media | El README contradecía sus archivos: tiempos de cuadro, la profundidad de la medición, la pausa descripta como si fuera la corrida actual. Omitía el p99 alto de la tanda A/B y faltaba este archivo. | **Corregido** el README con los números de `barrio.json` y `report.json`. El p99 alto de la tanda A/B queda descripto como sin explicar. Medí el costo de dibujo que el revisor sugería. |
| 5 | media | El contraste de la fuente no se veía: el chorro central, de 5 cm, apenas se distinguía y los derrames anchos dominaban. | **Corregido:** chorro de 11 a 13 cm con espuma en el ápice; derrames finos. Ver `fuente-cerca`. |
| 6 | media | La nota «plaza» afirmaba «es la caída de siempre» sin haber medido la del soporte A. Además podía imprimir «0,0 m/s²» si el ajuste fallaba. | **Corregido:** sin A, dice sólo lo medido. Si A se suelta después, su nota compara. No escribe nada si el ajuste falla. Prueba nueva con los dos órdenes. |
| 7 | media | El explorador tapaba la regla de C: se paraba justo delante. | **Corregido:** la regla va del otro lado de la esfera. Ver `secuencia-27`. |
| 8 | media-baja | «▼ Volver» tapaba la esfera de C y el chorro. | **Corregido:** el aviso va al costado del explorador. |
| 9 | baja | Desde el umbral del arco se ofrecía el soporte P, y ▲▼ movía su pinza mientras se caminaba. | **Corregido**, con prueba. |
| 10 | baja | Las lámparas del pasaje son discos blancos, y sus luces quedaban encendidas con el muro cortado. | **Corregidas las luces:** se apagan, sin ocultarse, para no recompilar los materiales. **Abierto:** el diseño de las lámparas. |
| 11 | baja | La nota decía que el chorro sale «a 2,95 m/s, como la surgencia», que en realidad va a 3,07 m/s, con componente horizontal. | **Corregido:** «la misma velocidad vertical». |
| 12 | baja | La esfera de C se dibujaba detrás del muro antes del Mirador. | **Corregido:** se dibuja sólo con el barrio. |
| 13 | baja | El deslizamiento a 45° llegaba a √2 veces la velocidad de caminata. | **Corregido.** |
| 14 | baja | La barra de ayuda decía «▲▼ ajustar, trepar» también en profundidad. | **Corregido:** en profundidad dice «caminar hacia el fondo y volver». |

**Veredicto del revisor:** B2 no se puede cerrar todavía.
- **Cumplidos:** el experimento cotidiano y la toma de la plaza entera.
- **Implementada pero ilegible:** la fuente (corregida después de la revisión).
- **No cumplidos:** lo que asoma sobre el muro y la identidad de metrópolis.

## Segunda pasada (verificación de las correcciones)

**Verificado por el revisor:**
- con ▼ desde (3,5; −11), 0 de 180 pasos con el cuerpo en el muro, contra 78 antes;
- en el umbral ya no se ofrece P;
- las áreas se superponen sin hueco;
- el deslizamiento es correcto y determinista;
- en los cuadros nuevos se leen la regla de C, el aviso al costado, el chorro y la barra.

Sin regresiones en la simulación.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| 1 | media | `report.json` era anterior a las correcciones. | **Corregido:** la ruta completa se corrió de nuevo después de las correcciones y pasa. Los dos cambios de interfaz posteriores se verificaron con `barrio.mjs`. |
| 2 | media-baja | Sin el soporte A, el título seguía diciendo «La misma caída…», aunque el cuerpo decía que faltaba comparar. | **Corregido:** «Una caída detrás del muro» hasta tener las dos medidas. La prueba cubre los dos títulos. |
| 3 | media | Al apretar E el barrio aparece de golpe sobre el muro, y con el arco abierto queda asomando en 2.5D. Es como en HEAD, pero el README no puede darlo por resuelto. | **Declarado abierto**, para la silueta (README, BACKLOG, ESTADO). |
| 4 | baja | La barra de ayuda nueva casi no se ve: se oculta a los 6 s del primer movimiento. | **Corregido:** vuelve unos segundos la primera vez que se pasa el arco. Ver `barra-de-ayuda-en-profundidad`. |
| 5 | baja | El corte instantáneo, la metrópolis y la silueta siguen pendientes. | **Declarados.** |

**Además, sin cambios:** el chorro de cerca (cuadro 30) se lee como un prisma de vidrio, no como agua, y la espuma del ápice no se distingue. Queda para pulir.

**Estado de B2: parcial.**
- **Cumplido:**
  - el experimento cotidiano, legible y con la comparación en los dos órdenes;
  - la fuente que contrasta;
  - la cámara con el corte;
  - la toma de la plaza entera.
- **Abierto:**
  - la silueta sobre el muro;
  - la identidad de metrópolis;
  - el corte suave.
