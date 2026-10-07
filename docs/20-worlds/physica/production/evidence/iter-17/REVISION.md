# Iteración 17 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, cinco simulaciones propias en Node y las imágenes. Dos pasadas.

## Primera pasada

**Veredicto:** el nombre «B3 en curso: el registrador» es honesto con condiciones. No lo era afirmar que el jugador lee los dos registros completos, porque el flujo de avisos borraba el registro del suelo antes de que se viera.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| A1 | alta | Al llegar, el único aviso era «Registrar el viaje», y armarlo borraba el registro: la tiza desaparecía a los 0,6 s sin que nadie la viera desde el andén. «▼ Bajar» no aparecía. | **Corregido:** el registro queda hasta que arranca el viaje nuevo, y el aviso dice «· ▼ bajar». Prueba nueva. |
| A2 | alta | La caminata duraba menos de 1 s, unas 1 o 2 marcas. El término del carro no tenía huella física. La suma sólo se leía en la Bitácora. | **Corregido:**<br>• una tercera huella: la muesca del carro en el cordón, en el cero de su cinta;<br>• las marcas emparejadas (ver la segunda pasada);<br>• a bordo, media marcha, a la velocidad del carro: contra la marcha, la tiza se apila (×4) mientras la tinta avanza. Es el espejo del viaje parado (`registro-15`, `16`). |
| M1 | media | La marca de llegada se duplicaba: «23 marcas», pero se veían 22. | **Corregido:** se reemplaza. Ahora son 22 marcas, y las pruebas verifican los intervalos y que no haya dos tizas en el mismo lugar. |
| M2 | media | Las notas se excluían entre sí, y el signo aparecía sin explicarse. | **Corregido:** las notas se componen por viaje, y la suma y el signo se explican la primera vez, en la nota que sea. Prueba con un primer viaje hacia el oeste y caminando. |
| M3 | media | La tinta parecía una raya de la regla, y 22 marcas se fundían en una barra. | **Corregido:** la tinta son puntos de color, con su cuenta ×N. |
| M4 | media | Los ceros no estaban rotulados, y la cinta estaba corrida 5 cm. | **Corregido:** los ceros están rotulados y la cinta tiene el largo completo. |
| M5 | media | La prueba de la caminata era una identidad. | **Corregido:** la prueba nueva comprueba que la tiza no se mueve y que la tinta retrocede 0,75 m por marca, contra las velocidades. |
| M6 | media | Un registro cortado se veía igual que uno completo. | **Corregido:** estado «cortado», con luz roja y su propio sonido (ver la segunda pasada). |
| B1–B6 | baja | Una carrera de un paso al rearmar; el tope de marcas fijo; la aguja y la luz; el sonido de inicio; «la tiza midió»; el redondeo. | **Corregidos.** |

## Segunda pasada

**Verificado:** A1, A2 (la muesca y el espejo), M1–M5, B2–B4.

| Severidad | Hallazgo | Respuesta |
|---|---|---|
| alta (nuevo) | El estado «cortado» no detenía el registrador. Disparaba `record-done` en cada paso, un zumbido continuo. Si el explorador volvía a subir, el registro se reanudaba y escribía notas con datos mezclados. Era falso lo que afirmaba D22. | **Corregido** en una línea, con prueba: un solo evento, y al volver a subir (en marcha o en una parada) el registro sigue cortado y no hay nota. Con la línea deshecha, la prueba falla. |
| media | El emparejamiento estaba sobreafirmado: dos colores sólo dan la paridad, y la muesca no tenía pareja visible. | **Corregido:** la marca n tiene el mismo color en tiza, tinta y muesca (seis colores en ciclo), más un hilo de color de cada muesca a su tiza. D22 lo describe así (`registro-16`, `vista-cordon-con-tiza`). |
| media | El explorador atravesaba la caja del registrador. | **Corregido:** la caja está al costado del banco. |
| media | La nota de la caminata no nombraba el ×4, y no decía que la coincidencia de velocidades es una ayuda. | **Corregido:** «Durante 1,5 s 4 marcas de tiza quedaron en el mismo lugar… Caminabas tan rápido como el carro, al revés» (`registro-24`). |
| media | Sólo la columna mayor llevaba su cuenta. | **Corregido:** se rotulan las dos mayores de la cinta (×12 y ×6). |
| baja | La tiza apilada se corría a lo largo de la regla; el redondeo de la primera nota; la marca de llegada no se redibujaba; «quedó −12,1 m». | **Corregidos:**<br>• la tiza se apila a lo ancho;<br>• las lecturas se redondean antes de restar;<br>• un contador de versión para redibujar;<br>• «respecto del andén, −12,1 m». |

**Veredicto de la segunda pasada:** con el arreglo del corte y la frase del emparejamiento resuelta, «B3 en curso: el registrador» describe bien lo que hay.

## Declarado como pendiente (README, D22, ESTADO)

- **El jalón:** hoy existe el cambio de marco, pero no el de origen.
- **Una tarea que exija predecir.**
- **La vista en tabla.**
- **Una persona en el andén como segundo observador.**
- **La transferencia del bote.**
- **El cero del cordón,** fuera de cuadro en las paradas.
- **Los registros** no se guardan al recargar.
- **La media marcha a bordo** es una ayuda que fabrica el caso «tiza quieta».
