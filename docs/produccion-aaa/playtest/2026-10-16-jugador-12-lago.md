# Informe de prueba de jugador 12: tramo Lago de las Señales -> Faro

Estado: PARCIAL. Llegué al Faro (cap. "El Faro · I / III") pero no completé el tramo. Me detuve ahí por tiempo (~80 min de juego) y porque el primer panel del Faro me trabó más de 15 minutos.
Arranque: http://localhost:4190/?tramo=lake, «Continuar el viaje». Entró en "Lago de las Señales · Crepúsculo, día 1 · 6 de 9 luces encendidas".

Nota de pestañas: mi primer navigate sin tabId se ejecutó sobre la pestaña "seed" del panel (no tenía una propia), y después esa pestaña pasó sola a ?tramo=castle (otra persona la usa). No la volví a tocar. Mi pestaña es tab-1, que cerré al final.

## Recorrido (en orden)

Lago de las Señales:
1. Caminé por la orilla con clic en el suelo. Abrí la Bitácora para ponerme al día y leí «Gente que conocí».
2. Muelle: diálogos con el Viejo del muelle (???), Mateo, Ohm y Nereo. Nereo me manda a "mirar las balizas" y cerrar "el retorno entre las cañas".
3. Lámpara bajo el muelle (E): sólo muestra la placa y la Bitácora ("Para que el farero también encuentre su casa"). Repetí E y no cambió nada visible.
4. Baliza de la orilla: Q (Mirar con Ohm) dice que "el retorno entre las cañas está suelto". Ahí hice clic por error en el botón «Conectar el retorno entre las cañas» que aparecía junto a «Ver las lecturas» (ver nota de UX abajo). Quedó conectado. Ohm: "lo que va al Faro vuelve por acá".
5. Puente de cuerda hacia el Faro (el paso dorado del mapa).

El Faro (noche):
6. Llegada al Espigón. Diálogos: Bitácora ("Tres anillos de cobre"), Edda ("Una pregunta por vez"), Mateo ("Tres cosas que podemos mirar por separado"), Nereo ("Empezamos con las dos manivelas de abajo").
7. Mesa "Mirar: II · Distribución de la corona" (E): Ohm dice "Luz, giro y señal están en fila... La fuente de acá todavía no da nada." Lecturas: 0,00 V y 0,00 A. Nereo: "Primero tiene que sostenerse la base. Después, las manivelas del medio apartan el puente gastado y acoplan el motor."
8. Consigna que quedó: "Hablá con Nereo junto a la base y verificá la fuente en el primer panel". No logré resolver el panel de la fuente.

No llegué a: resolver la fuente, las manivelas, el motor, el cap. II-III del Faro, ni lo que viene después.

## Notas por categoría

### 1. Esperaba X y pasó Y
- Esperaba que Nereo me diera una tarea concreta. Me dio una charla larga y poética antes de la consigna real ("El retorno lo cerrás vos... miren las balizas"). La consigna llega al final del diálogo.
- Esperaba que la lámpara bajo el muelle fuera interactiva. Sólo repite la placa.
- Esperaba que "verificá la fuente en el primer panel" me llevara a un panel claro. No lo encontré: busqué en el muelle, el sendero y la plaza del Faro, y no apareció ningún aviso de E sobre el poste de luz junto al sendero ni sobre el de la baliza.
- En el Faro, el paso de "Hacia El Faro" a "El Faro · I / III" cambió sin aviso visible; pasé de "Hablá con Nereo..." a "Tu pregunta está en este lugar" sin entender bien qué mesa era el primer panel.

### 2. Comprensión de las mesas
- Baliza de la orilla (Q): entendí que "retorno suelto" = falta conectar; la conexión sí se entiende cuando la hacés. Pero la pantalla de "Ver las lecturas" no explica qué significa conectar.
- Mesa "Distribución de la corona" (Faro): Ohm dice que "luz, giro y señal están en fila" y que "la fuente todavía no da nada". No entendí qué tengo que cambiar. Las lecturas dicen 0,00 V y 0,00 A, pero la explicación dice que "una raya significa que Ohm no puede fijar esa lectura; no significa cero". Contradicción confusa: ¿es cero o no se puede medir?
- En ninguna mesa llegué a probar un cambio con el instrumento (no entendí qué mover primero).

### 3. Puzzles
- Confusos: el orden (base -> manivelas -> motor) sólo lo dice Nereo de pasada, y el primer paso ("sostener la base") no es un puzzle claro.
- Pista que sí ayudó: "Tres balizas marcan el camino hacia el Faro" (Bitácora, después de mirar el cable).
- Lo más difícil fue encontrar dónde estaba el "primer panel". Me faltó una marca en el suelo o un halo sobre ese objeto.

### 4. Bitácora
- La usé al principio para ponerme al día. "Gente que conocí" es útil: resume a cada personaje en 1-2 líneas.
- La hoja de "La cuenta del carro" (Manantial) está muy bien explicada, con dibujos y pasos. Es el modelo de lo que sería útil.
- Problema: al acercarme a la lámpara del muelle, la misma nota de la Bitácora se repite cada vez que pulso E o paso cerca. Se vuelve ruido.
- La Bitácora cuenta "Por dónde pasé" con "…un lugar más, según el mapa del Instituto". Me dejó sin saber si faltaba algo del lago.

### 5. Navegación
- El clic en el suelo funciona muy bien.
- La cámara a veces se corre y el personaje queda tapado por arbustos.
- Los globos de "E Usar" aparecen sólo cuando estoy bien cerca; hay que pegarse al objeto.
- Muchas veces Nereo o el Viejo del muelle quedaban al lado mío y se reabría su diálogo cada vez que pasaba cerca (ver bugs).
- El mapa (Mapa) muestra "Siguiente paso" en el Faro, pero el texto de la guía dice otra cosa ("Hablá con Nereo junto a la base...") y el mapa dice "Buscá el acceso a El Faro". Inconsistencia de texto.

### 6. Arte y presentación
- Muy linda. La Ribera tiene agua animada, sauces, farolas con luz ámbar, el muelle con la luz de la lámpara. El cambio a noche en el Faro es muy bonito.
- El Faro (torre, anillos de cobre, plaza con máquinas) se ve impresionante desde el puente.
- Los discos del suelo (ámbar y verde) se leen, pero no tengo claro qué significa cada color sin leer la guía.

### 7. Diálogos e historia
- Tiene humor (Viejo del muelle: "pierdo prestigio") y personajes con personalidad (Ohm, Edda, Nereo).
- Mucha ambigüedad para alguien de 12-15 años: "Cuarenta, pequeño. A mí tampoco me gusta la diferencia." / "Lo que tiene que durar." / "Una vuelta. Una pausa." / "Lo imposible, parte por parte". No sé qué es lo importante.
- Varias líneas dan respuestas sin dar la tarea ("Nereo fija la bornera, sin mirar"). Sin la Bitácora no sabría qué es el Faro ni la bornera.

### 8. Errores o bugs
- Diálogo que se repite: al estar junto a Nereo o cerca de la lámpara del muelle, el diálogo "La hizo mi compañera..." reaparece cada vez que hago clic cerca o pulso E. Quedé en un bucle de 3-4 clics hasta que me alejé.
- Clic accidental: el botón "Conectar el retorno entre las cañas" queda justo en el lugar de "Ver las lecturas". Cliqueé ahí creyendo que abría las lecturas, y se ejecutó la acción de conectar. No pasa nada grave, pero es fácil de confundir y no hay confirmación.
- La consigna del Faro y el texto del mapa no coinciden (ver punto 5).
- Mi primer navigate tomó la pestaña "seed" compartida (ver nota de pestañas). Y tab-1 desapareció una vez al cambiar el panel a oculto.
- Un toast ("Nereo camina al ritmo de una máquina...") se quedó en pantalla bastante tiempo.
- La mesa "Distribución de la corona" dice 0,00 V / 0,00 A junto con "una raya significa que no puedo fijar la lectura": contradicción en el texto.

### 9. Ritmo
- Mucho diálogo antes de cualquier acción: cada personaje tiene 5-8 líneas con "Continuar". Sumando Bitácora y mapa, pasaron ~25 min sin tocar una mesa en el lago.
- En el Faro, después de la llegada, otra ronda larga de diálogos (Bitácora, Edda, Mateo, Nereo) antes de la primera mesa.
- Llegar al Faro fue lo más emocionante del tramo; el paso del puente funciona muy bien.

### 10. Top 10 a mejorar
1. Marca clara del "primer panel" (halo, flecha o texto en el mundo). Me perdí 15+ minutos buscándolo.
2. Consigna directa: "Conectá la fuente, después las manivelas" en vez de la charla antes de la tarea.
3. Corregir la contradicción 0,00 V / "una raya no significa cero" en las lecturas.
4. Diálogos que se repiten al pasar cerca (Nereo, lámpara del muelle). Mostrar una vez por sesión o por distancia.
5. Separar el botón de acción ("Conectar") del de "Ver las lecturas" o pedir confirmación para acciones que cambian el mundo.
6. Unificar el texto de "siguiente paso" entre mapa, guía y consigna.
7. Menos texto en la Bitácora para el lago; la Bitácora dice cosas que todavía no hice (p. ej. "…un lugar más").
8. Vocabulario: "bornera", "corona", "motor", "fuente", "puente gastado" sin explicación en el juego. Una mini-definición la primera vez.
9. Ritmo de diálogos: dejar botón "saltar" o acelerar la línea.
10. Cámara: evitar que el personaje quede tapado por arbustos en la orilla.

### Top 5 de lo mejor
1. Arte y ambiente: agua, sauces, luz de crepúsculo y la transición a la noche en el Faro.
2. La Bitácora con "Gente que conocí" y la hoja de "La cuenta del carro" (dibujos y explicación paso a paso).
3. Los personajes (Ohm, Nereo, Edda, Mateo) tienen voz propia y humor.
4. El puente de cuerda: se siente como una entrada grande al Faro.
5. El clic en el suelo para moverse es cómodo y el mapa (con "Siguiente paso" y "Restaurado / Por restaurar") se entiende bien.

## Ruta del informe
/private/tmp/claude-501/-Users-manuel-code-proyecto-roxana/1353e795-f196-482d-93ed-96f990ee0a3e/scratchpad/playtest/informe-12-lago.md
