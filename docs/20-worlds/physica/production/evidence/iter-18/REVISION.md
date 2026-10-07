# Iteración 18 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, cinco simulaciones propias en Node y las imágenes. Dos pasadas.

## Primera pasada

**Veredicto:** honesto como avance de la mecánica, no como cumplimiento de los dos pendientes de la iteración 17. El jalón no tenía señal en el mundo y el encargo no exigía predecir.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| A1 | alta | **El encargo no exigía predecir.** Había tres atajos:<br>• caminar a ojo durante el viaje (3 de 5 aciertos con 0,15 s de reacción);<br>• alinearse con el carro en la parada;<br>• tantear con la corrección exacta que da la nota. | **Corregido en parte:**<br>• sólo cuenta un viaje hecho quieto (toda la tinta en una columna); si se camina, «así no vale»;<br>• al acertar, su jalón se corre a otro número (21,5 → 20,3).<br>**Declarado:** también se resuelve tanteando (D23). |
| A2 | alta | El jalón no se veía en el mundo: sus lecturas sólo existían en la Bitácora. | **Corregido:** clavado, despliega su propia cinta con signo (−5…+5 en el andén; sobre la cubierta, viaja con el carro). **Abierto:** rotular las lecturas de la primera y la última tiza desde el jalón. |
| A3 | alta | El encargo era sólo texto, y «Preguntarle a la vecina» no hacía nada. | **Corregido:**<br>• un globo en el mundo: el pedido, «Faltaron 0,7 m →», «así no vale», «¡Justo ahí!»;<br>• la bandera, que se agita;<br>• un recuadro punteado de tolerancia al pie de su jalón;<br>• volver a hablarle repite el estado. |
| M1 | media | Plantar el jalón donde uno se para dejaba el registrador inalcanzable. | **Corregido:** el jalón se clava en el lugar del explorador (a 0,1 m de su regla) y, con el carro esperando, E arma primero el registrador. |
| M2 | media | El encargo no se guardaba: se repetía y la nota contaba mal los intentos. | **Corregido:** el estado, la ronda, la posición de su jalón y los intentos se guardan y se restauran. El revisor lo verificó con tres sesiones y dos recargas. |
| M3 | media | El cartel y la chapa se leían mal. | **Corregido:** el poste está donde para el cero del carro, con el cartel «aquí para el 0 del carro: 19 m ↓», que apunta a una chapa amarilla con «0», del amarillo de la cinta. |
| M4 | media | El jalón se podía llevar fuera de la avenida. | **Corregido:** vuelve al soporte. No se puede llevar junto con una esfera. |
| M5 | media | El recorrido completo no incluía el encargo. | **Corregido:** el recorrido, desde un inicio limpio, habla con la vecina, va en 2,46 m de la cinta y cumple la ronda 1. |
| B1–B7 | baja | Redondeos entre notas, alturas, el título de los intentos, «×22» que se leía como lectura, el poste en la vecina, clavar fuera de los bordes. | **Corregidos**, salvo B6 («▲ Subir» tapado por otros avisos): **declarado**. |

## Segunda pasada

**Veredicto:** «B3 en curso: el jalón y el encargo» es un checkpoint honesto con lo declarado. El encargo **permite y recompensa** predecir; no lo **obliga**.

| Severidad | Hallazgo | Respuesta |
|---|---|---|
| media | En la ronda 2 su jalón se movía mientras el explorador seguía a bordo en la parada este: la posición nueva se leía alineándose. | **Corregido:** su jalón se corre recién cuando el carro sale de esa parada. Prueba nueva. |
| media | En la parada oeste, donde se elige el lugar, el globo no se veía, y el único cartel visible decía 4 m. | **Corregido en parte:** el globo se dibuja desde todo el andén y el carro («viajando quieto → parada este»), y la nota nombra «el cartel de la parada este». **Pero en la parada oeste el globo queda fuera de cuadro** (`encargo-23`): ahí el pedido sólo está en la Bitácora, y el 19 sólo en la parada este y en registros anteriores. **Declarado.** |
| media-baja | Con el carro esperando, parado sobre el jalón, E arma el registrador en vez de levantarlo. | **Declarado:** con una sola tecla de uso, el registrador va primero; el jalón se levanta una vez armado o con el carro andando. |
| baja | La cinta del jalón quedaba bajo el cordón si se clavaba en el borde, y ±3 m no alcanzaba. | **Corregido:** la cinta nunca queda bajo el cordón y mide ±5 m. Las lecturas del viaje pueden pasar de ±5: **declarado**. |
| baja | El jalón recién clavado queda tapado por el explorador; «Preguntarle» repite lo que el globo ya dice; queda una tiza en el recuadro nuevo; el nombre de una prueba sobreafirmaba. | El nombre de la prueba está **corregido** («rewards a prediction»). Lo demás, **declarado**. |

## Declarado (README, D23, ESTADO)

- **Cómo se resuelve:** el encargo se puede resolver tanteando, porque el globo dice cuánto faltó. Predecir ahorra viajes.
- **En la parada oeste,** donde se elige el lugar, el pedido y el 19 quedan fuera de cuadro: hay que recordarlos o leer la Bitácora.
- **Con el carro esperando,** E arma el registrador antes que levantar el jalón.
- **La cinta del jalón** es de ±5 m. Las lecturas de la primera y la última tiza desde el jalón no se rotulan en el mundo.
- **Avisos:** «▲ Subir al carro» puede quedar tapado por otros avisos.
- **Pendientes de la familia:**
  - la vista en tabla;
  - el segundo observador;
  - vectores más allá del desplazamiento con signo;
  - la transferencia del bote;
  - el cero del cordón, fuera de cuadro.
- **El recorrido completo** va en 2,5 m por guion: prueba que el recorrido funciona, no que se aprende.
- **Sin prueba con personas.** A preguntar:
  - qué pide la vecina;
  - qué cartel usaron;
  - si predijeron, alinearon o tantearon;
  - qué creyeron que hacía el jalón.
