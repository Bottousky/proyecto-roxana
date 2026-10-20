ESTADO ACTUAL: CORTE en La Calzada (tramo 3 del arco). Pendiente: poste este (Unir el cierre) y «Primero la puerta» (la puerta de hierro con Ω). Sesión cerrada por el jugador de prueba.

# Informe de playtest 28 · Arco I desde cero (jugador solo)

Fecha: 2026-10-16. Pestaña: seed (tabs_create falló con «Browser pane gone, gate off, or tab cap reached»; se usó navigate y tabs_context). URL: http://localhost:4190/?tramo=cerod. Viewport 1280x800.
Personaje: Vale (nombre escrito; apariencia por defecto).
Resultado: NO llegó a «ARCO I · COMPLETO». Llegó a 2 lugares completos y a la mitad del tercero. Unas 2 h de juego real, la mayor parte peleando con movimiento y cámara.

## Lugar 1 · El umbral del valle (Portal Ω) · ~15 min · RESUELTO
- Registro: nombre + apariencia, OK. Carga «Tejiendo Ohmdal» → «Abriendo los caminos» (~20 s).
- Mesa «Un pequeño latido» (Corazón de bronce): pila Celda +/− y corazón Bronce +/−. Venía tendido Celda+ → Bronce+; había que tender Celda− → Bronce−.
- Entendí el circuito: hace falta cerrar la vuelta (pila → corazón → pila). Con un cable no pasa nada; lo dice el juego después.
- Trabas:
  1. Tocar el DIBUJO del borne Bronce − no respondió (varios intentos y refs). Funcionó tocar la ETIQUETA «Bronce −». Zona de toque chica o tapada por el corazón. Importante para táctil.
  2. En la escena de la luz hay que pulsar Enter para avanzar (no avanza solo).
- Placa «Una placa entre las raíces»: el globo se cerró antes de poder leerlo con get_page_text.

## Lugar 2 · Plaza de Ohm → taller de Lumen («El oficio de preguntar») · ~60 min · RESUELTO, con fricciones graves
- La flecha dorada a la Plaza funciona, pero el personaje a veces se detiene o da vueltas; hay que esperar y reclicar.
- Puerta del taller: la flecha «Camino a: Taller de Lumen» no responde al clic; hace falta E.
- Diálogos largos. El botón «Seguir» a veces queda fuera de pantalla a la derecha (ref fuera del viewport). Enter funciona como alternativa.
- Mesa de la lámpara (dos cierres: «Unir el cierre izquierdo» / «derecho»):
  1. El personaje se traba o queda detrás de estanterías y mesas del lado derecho. Los clics en el suelo y WASD a veces no lo mueven. Tardé mucho en llegar a los cierres.
  2. Cuidado: clicar la lámpara del banco separó el cierre derecho sin aviso (el prompt pasa de «Unir» a «✓ Hecho · deshacer»). E deshace, así que un E mal dado vuelve atrás.
  3. Al acercarse a un cierre, a veces el prompt aparece en el árbol de accesibilidad pero el E no hace nada (el ref queda fuera de pantalla). Lo que funcionó fue acercarse más y pulsar E.
- Banco de pruebas «La costura invisible» (tablero de continuidad): buen puzzle. «Comprobar el camino» con dos bornes da «✓ Hay camino» / «⚠ Sin camino». Tramo 1 OK, Tramo 2 cortado. Puentear con Cables (A2 → B2) → «✓ Funciona». Concepto entendido: se localiza el corte midiendo tramo por tramo y se puentea.
- Fricción: los refs de los bornes cambian tras cada toque; hay que buscarlos de nuevo.
- Éxito: «Volver al mundo: la instalación queda en servicio» funcionó bien.
- Diálogos de cierre de Lumen/Ohm: muy buenos (la «lámpara que no enciende» era un hilo cortado, no una maldición).

## Lugar 3 · La Calzada («El otro lado de la puerta») · ~35 min · INCOMPLETO
- Mapa: el camino a La Calzada es el norte del Pueblo. Hubo un problema de mapa: el overlay se cerró con retraso visible (la captura mostraba el mapa abierto varios segundos después) y un clic en el mundo lo volvió a abrir. Lo cerré con M.
- Guía de viaje (H): buena, dice qué hacer y dónde (el «Ahora» con la marca dorada).
- La flecha «Camino a: La Calzada» aparece junto al cartel del Pueblo; hay que pulsar E.
- Edda aparece en el centro de la Calzada; diálogo sobre «cuatro cosas raras».
- Puente de cobre: «Abrir el puente de cobre» (E) → Ohm explica el atajo («ya no hay atajo»). Entendido.
- Poste oeste: «Unir el cierre del poste oeste» (E) → «El contacto del poste oeste queda unido». OK.
- Luego aparece «Mirar: La baliza del costado»; Edda dice «Primero la puerta. La baliza esperó años».
- Trabas en este lugar:
  1. Movimiento: varias veces el personaje no se movió con clic en el suelo ni con W/A/S/D; un par de W/A/S sueltos lo destrabaron. La cámara lo sigue en el centro, así que cuando «no se mueve» parece que el mundo se corre.
  2. No encontré el «cierre del poste este» ni la «puerta» como prompt. Después de Edda, el objetivo sigue «Tu pregunta está en este lugar» y no hay flecha visible hacia la puerta. Ahí corté.
- Sin probar: la puerta de hierro con Ω (paso siguiente según Edda).

## Bitácora
- Aparecen notas automáticas al cerrar cada paso («Bitácora: …»). No abrí el libro completo; las notas bastaron.
- Observación de Ohm (botón «Mirar con Ohm» / Q): texto claro en cada punto (ej.: «Puente que evita la puerta… ya no hay atajo»).
- No la necesité para resolver; sí para entender el «por qué».

## Lugares 4 a 9: sin jugar.

## Pendientes / bugs observados
- Movimiento: el personaje se traba sin motivo claro en Taller y Calzada; falta feedback cuando el clic no llega.
- Hitboxes: bornes y cierres chicos; prompts que aparecen pero no responden.
- Mapa: retraso al cerrar y reapertura accidental por clic en el mundo.
- Prompts de «Hecho · deshacer» con la misma tecla que la acción: riesgo de deshacer por error.
- Diálogos: Seguir/Continuar fuera de viewport en pantallas angostas; Enter como salida.

## Ritmo
- Las mesas son cortas (2–5 min) pero el camino entre ellas consume más tiempo que el puzzle.
- Diálogos largos y bien escritos, pero con muchos pasos cuando el jugador ya entendió.

## Lo mejor (top 5)
1. Explicaciones del circuito en los diálogos y en Ohm («como la cadena de una bicicleta»).
2. Banco de pruebas de continuidad: concepto claro (medir tramo por tramo, puentear).
3. Lumen y Edda: personajes con carácter; el cierre del taller da gracia.
4. Guía de viaje y mapa con marca dorada: dan dirección.
5. Feedback visual en las mesas (✓ Funciona, ✓ Hay camino, glows verdes al unir).

## Top 10 a mejorar
1. Movimiento y cámara: el personaje se traba y se pierde detrás de muebles.
2. Hitbox de bornes y cierres (tocar la etiqueta funciona, el dibujo no).
3. Prompts: «Hecho · deshacer» con E: riesgo de deshacer por error.
4. Flecha dorada: a veces no señala el paso siguiente (Calzada, puerta).
5. Mapa: cierre con retraso y reapertura accidental.
6. Botón «Seguir» fuera de pantalla a la derecha en el diálogo.
7. Mesas que dependen de la proximidad sin feedback claro al estar cerca.
8. Tiempos de espera: la carga inicial es larga sin barra de progreso útil.
9. Tramo final sin pista de la puerta tras el diálogo de Edda.
10. Verificar que «Abrir/Unir/Mirar» no se disparen con clic en un objeto vecino.

## Ruta
Este informe: /private/tmp/claude-501/-Users-manuel-code-proyecto-roxana/1353e795-f196-482d-93ed-96f990ee0a3e/scratchpad/playtest/informe-28-cero.md
