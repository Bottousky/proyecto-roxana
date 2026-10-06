# Iteración 02: revisión independiente y respuesta

**Quién revisó:** un subagente con contexto separado. Recibió los criterios y la evidencia `ev4`, y corrió simulaciones propias sobre el `World` real.

| # | Hallazgo | Respuesta | Estado |
|---|---|---|---|
| 1 | Fuerza bruta: cualquier suelta a −0,7 m o más abajo gana; la cadena se ofrece antes de fallar; la campana no es necesaria; no hay transferencia. | La cadena se ofrece **recién después de un intento corto o de que suene la campana**. El objetivo con dos límites y la segunda configuración quedan para la próxima iteración (A9 y A20): cambian los umbrales y merecen su propio ciclo. | **parcial** |
| 2 | El agarre de 0,45 m corre la respuesta 1,1 m. Hay dos referencias: centro (riel y campana) y pies (tiza y notas). La transferencia natural «−1 en el riel → pies en −1» falla. | **Una sola referencia, el centro del cuerpo:**<br>• hebilla del explorador y argolla de la cadena a la altura del centro;<br>• números de la cadena y del riel en el mismo plano;<br>• tiza a la altura de la hebilla;<br>• línea de la campana pintada a 4,5 m.<br>La campana suena para centros ≥ 4,5. Un explorador cuya hebilla llega a 4,5 alcanza la Terraza con el agarre. «−1 en el riel» = «−1 en la cadena» (pruebas). | **corregido** |
| 3 | Bitácora: «misma altura» fijo; «4,40 m» es la Terraza después del agarre, no una cumbre; «más abajo… más alto» con un solo dato; «campana» compara sin dato previo. | **Notas:**<br>• «subida» usa la altura real de suelta y sólo dice «misma altura» si coincide con A;<br>• «cruce» usa la cumbre de la hebilla anterior al agarre y compara sólo si hubo un intento previo desde otro lugar;<br>• «campana» menciona el intento silencioso previo sólo si existió.<br>**Borde:** se mide al reentrar (antes faltaban marcas y el ajuste daba 3,9; ahora da 4,00). | **corregido** |
| 4 | Bug: al subir por la cadena el explorador quedaba sobre la sima. | Aparece en x = −(hw + 0,1). Prueba de regresión. | **corregido** |
| 5 | Movimiento perpetuo audible: la campana suena cada 4 s, sin fin. | La campana suena una vez por suelta (prueba). La oscilación sin pérdidas sigue: la amortiguación declarada es A20, junto con los umbrales nuevos. | **parcial** |
| 6 | El fallo informa poco: la tiza es pequeña y se borra; no deja marca si no se va hacia la pared; R confunde. | **Fallo:**<br>• tiza persistente por intento, rotulada con el lugar de partida, hasta el cruce;<br>• marca para todo intento en la sima;<br>• R en el aire, desde los 0,3 s, devuelve al último apoyo. | **corregido** |
| 7 | Hay un solo chorro y dicta «empezá en el fondo». | Pendiente: segunda surgencia que se quede corta (A21). | **pendiente** |
| 8 | Controles: el táctil ocultaba la pista; el stick no movía el riel; la cadena no se ofrece con una esfera en la mano. | **Controles:**<br>• la pista táctil se ve (arriba, 14 s);<br>• el stick mueve el riel de a un paso.<br>Lo de la esfera en la mano queda pendiente. | **parcial** |
| 9 | La surgencia atraviesa gravedad familiar sin una fuente visible. | Pendiente, junto con A21. | **pendiente** |
| 10 | Arte: escalas desalineadas, campana diminuta, mástil que parece escalera. | Escalas en el mismo plano. Campana 1,7 veces más grande. Lo del mástil queda pendiente. | **parcial** |

**Sin fallas, según el evaluador:**
- La autoridad de la cadena está limpia.
- La equivalencia se cumple centro a centro.
- No hay conflicto real con ▲▼.
- No hay bloqueos permanentes, salvo el bug 4, ya corregido.
