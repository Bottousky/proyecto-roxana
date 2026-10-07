# Iteración 19 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, tres simulaciones propias en Node y las imágenes. Dos pasadas.

## Primera pasada

**Veredicto:**
- **(a)** Honesto sólo como «en curso»: la evidencia no mostraba dos observadores legibles y D24 describía mal el redondeo.
- **(b)** Todavía no corresponde «pendiente de validación humana»: falta la transferencia.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| A1 | alta | No se leía quién hablaba: el chico quedaba detrás del globo de la pasajera y parecía parado sobre el carro. | **Corregido:** la pasajera va en la mitad este del banco y el chico en la vereda de enfrente, al oeste del carro (`registro-12`). En la segunda pasada lo corrí 1 m más al oeste, fuera de los postes del toldo. |
| A2 | alta | El mismo viaje daba números distintos según dónde se leyera: el globo, la nota y la tabla (al cm contra al dm). La tabla titilaba en los empates de redondeo. D24 lo describía mal. | **Corregido** con una sola regla (`rnd`, `lecturas`, `shownTry`): al decímetro, los empates siempre para el mismo lado, el cordón como suma del cero y la cinta. Tabla, notas, globos y encargo salen de ahí (`encargo-14`). Prueba nueva en cuatro posiciones. D24 reescrita. |
| A3 | alta | La pasajera decía «no te moviste» cuando se había caminado y vuelto, y en el mismo cuadro la vecina decía «caminaste». | **Corregido:** «caminaste, pero terminaste donde empezaste», con el mismo umbral que el encargo. Prueba nueva. |
| A4 | alta | Los globos repetían un viaje viejo después de un viaje sin registrar. | **Corregido:** hablan sólo del viaje que acaba de terminar, hasta que el carro sale de esa parada. |
| A5 | alta | El paquete de evaluación presentaba la familia como completa. | **Corregido:** declara el alcance real (sin transferencia, vectores sólo en una dimensión). |
| M1 | media | Después de un viaje hacia el oeste sólo habla la pasajera. | **Declarado.** |
| M2 | media | El aviso de la tabla tapaba el de la nota del viaje, y la nota reescrita quedaba arriba. | **Corregido:** el aviso es el de la nota del viaje, y la nota reescrita pasa al final. |
| M3 | media | La chapa «PARADA ESTE» en el poste de la parada oeste se leía como el nombre de esa parada, y quedaba cortada. | **Corregido:** la «LÍNEA DEL CARRO», con los dos números y el encargo, va en el carro, a la vista a bordo (`chapa-de-la-linea-a-bordo`). |
| M4 | media | Las cifras de los globos eran chicas. | **Corregido:** la cifra va en negrita en la primera línea, y los globos son más grandes. |
| M5 | media | El paquete tenía errores sobre `?fresh` y la partida guardada, y faltaban fallas conocidas. | **Corregido:** el arranque de evaluación `?avenida`, `?fresh` bien descripto, notas por primer viaje y fallas al día. |
| M6 | media | Los observadores describían sólo al explorador. | **Corregido:** la pasajera dice cuánto se fue la vereda; el chico, cuánto se movió el carro. |
| M7 | media | No hay ningún vector en el mundo. | **Pendiente:** va con la transferencia (próxima iteración). |
| M8 | media | La evidencia y los documentos estaban desactualizados. | **Corregido:** evidencia nueva, README, este archivo, FAMILIAS y ESTADO. |
| B1–B7 | baja | Un carro supuesto; las mallas de las personas; el encabezado de la tabla; vereda y andén como el mismo suelo; la fuente de los carteles; la tabla después de un corte; el cero del cordón. | **Corregidos** el largo en el evento, el encabezado («dónde está el 0 del carro») y «el mismo suelo». **Declarados** las mallas, la fuente y el cero. Para el cero, el paquete pregunta: «¿Desde dónde cuenta el cordón?». |

## Segunda pasada

**Verificado:** A1–A4 y M2–M6, en el código y en las capturas nuevas.

**Veredicto:**
- **(a)** Checkpoint honesto, con dos condiciones: mover el globo de la vecina o declararlo, y renovar la evidencia y los documentos.
- **(b)** No corresponde todavía «pendiente de validación humana». Antes hacen falta:
  - la transferencia, con al menos una representación de vectores;
  - la ruta completa en verde;
  - el paquete al día.

  Después, se declara una sola vez y se pasa a MRU sin suspender el loop.

| Severidad | Hallazgo | Respuesta |
|---|---|---|
| media | El globo de la vecina tapaba la cifra de la pasajera después de cada intento del encargo. | **Corregido:** su globo va más arriba y a su costado. |
| media-baja | Con el carro en la parada este, el chico puede leerse como subido al carro. | **Corregido:** 1 m al oeste. |
| baja | `?avenida` borraba lo guardado en cada recarga. | **Corregido:** borra sólo la primera vez en esa pestaña. El paquete lo explica. |
| baja | La plantilla del paquete; la nota del jalón con la lectura sin redondear. | **Corregidos.** |
| baja | La chapa de la línea desde la parada este queda chica. | **Aceptado:** desde ahí no hace falta. |
