# Playtest tramo Faro (faroc) - informe 15

Jugador de prueba: Nico, 12 a 15 años, no sabe electricidad. Jugado sólo con el navegador integrado (tabId "seed"; tabs_create falló, se usó navigate a http://localhost:4190/?tramo=faroc).

## Resumen de avance
- Llegué: Espigón del Faro, Fuente del Faro (I · La base recibe energía) abierta, diálogos con Nereo y Edda.
- Mesas resueltas: 0 de 3 (I, II, III). No resuelta ni la I.
- Final: no visto.
- Tiempo aproximado: unos 60 min de juego; más de 25 min trabado en la mesa de la Fuente.

## 1. Esperaba X y pasó Y
- Esperaba: al «Continuar el viaje» entrar al Faro con la pregunta clara. Pasó: entré a El Faro con la pregunta «Abrí la Fuente del Faro, la primera mesa», bien dicho. OK.
- Esperaba: al acercarme a la Fuente, que la mesa se pudiera usar. Pasó: el aviso «E» aparecía sólo a veces (sobre la manivela, sobre Nereo) y nunca sobre la mesa de los medidores.
- Esperaba: que al apretar E en la manivela de retorno quedara «conectada». Pasó: el texto cambió a «queda abierto» y el botón a «Cerrar el retorno de la base». Confuso (ver punto 3).

## 2. Comprensión de cada mesa
- Mesa I (Fuente, base recibe energía): no la entendí. Ohm dice que la manivela «está unida» y que «pasa corriente», con lecturas 0,09 V y 1,13 A, pero el juego pide otra cosa y no sé cuál. Probé la manivela (E, dos veces), leí las lecturas y no supe qué cambiar. No llegué a la mesa, así que no la probé.
- Lo que sí aprendí de la Bitácora (Marín, el carro): en una fila de elementos la misma corriente atraviesa todo; el que más «frena» se queda con más voltaje; la suma de las caídas da el voltaje de la batería. Eso me dio una idea, pero no sé cómo se aplica a la Fuente.

## 3. Puzzles
- Fácil: la guía de tres pasos (Recorré / Observá / Probá) y la frase de la flecha dorada.
- Confuso: manivela de retorno. «Abrir» pero el resultado dice «queda abierto» y la lectura de Ohm dice «unida». No se sabe si «abierto» es bueno o malo.
- Difícil: no encontré el banco (la mesa) ni supe a qué distancia/ángulo interactuar. Los discos de color del suelo (ámbar/verde) no me dieron pista clara sobre la mesa de la Fuente.
- Pistas: Ohm sólo describe lo que mide; no dice qué mesa tocar ni qué cambiar.

## 4. Bitácora
- Muy bonita y con narrativa, pero densa para 12 a 15 años: ecuaciones («4 V más 8 V dan 11,9 V»), símbolos (Σ), «0,5 A», diagramas «Así estaba / Así lo dejé».
- Buena idea: «Para pensar» al final (pregunta abierta) y «Lo que hay detrás lo que vio Ohm» en tres pasos.
- Cerrar la Bitácora con Escape funcionó.

## 5. Navegación
- WASD muy lento: hay que apretar muchas veces la tecla para ir a 20 m.
- Clic en el suelo (Caminar con clic) funcionó bien en los caminos de adoquines y fue más rápido.
- Me trabé contra la base de la Fuente: no pude rodearla ni llegar a la mesa; no había feedback de por qué no avanzaba (¿colisión? ¿cable?).
- El Mapa: el botón × visible no respondió en el primer intento; cerró con Escape. Lo mismo con la Guía: la × no respondió y cerró con Escape.
- Una vez, una pulsación de teclas abrió el menú «Tomá un respiro» (Pausa) sin que yo lo pidiera. Tras cerrarlo costó un rato (× no respondió al principio; con Escape y después con el botón Cerrar sí).

## 6. Arte y presentación
- La plaza del Faro (adoquines, arcos, faroles en discos ámbar/verde, la Fuente con cobre) se ve muy bien; el clima nocturno y el brillo de Nereo ayudan.
- El mapa de «Caminos de Ohmdal» es claro: el diamante dorado marca el siguiente paso.
- Los cables (amarillo/azul) y la flecha dorada se leen, pero la mesa no se distingue bien del resto de la base.

## 7. Diálogos e historia
- Nereo (farero mayor): cálido, con humor («Uno aprende a adornar las respuestas cuando envejece»). Explica la misión: «andá y abrila». Bien.
- Edda: «Una pregunta por vez. La torre no se va a ofender.» Buena frase.
- Nico (yo): monólogos internos que a veces no ayudan («¿No el mecanismo?»; «¿Cómo sabés cuándo corregir el ritmo?»). Frases sueltas, no se entiende a quién responde.
- Hay muchos diálogos antes de poder actuar (unos 15 toques de Enter). Demasiado para el primer paso.
- Final: no llegué.

## 8. Errores o bugs
- No pude llegar a la mesa de la Fuente (posible bug de colisión o de prompt de E). Es el bloqueo principal.
- El botón del Mapa y de la Guía: la × no responde al primer clic (posible bug de foco o de overlay).
- La Pausa se abrió sola tras una combinación de teclas.
- Los diálogos de Nico parecen sueltos (no quedó claro si respondían a algo).

## 9. Ritmo
- Mucho texto antes de tocar nada (Bitácora + Guía + 15 diálogos).
- Tras la primera manivela el ritmo se cortó: no supe qué hacer y la sensación fue de dar vueltas.

## 10. Top 10 a mejorar
1. Hacer visible y alcanzable la mesa de la Fuente: el aviso E debe aparecer al estar frente a la mesa, no sólo junto a la manivela.
2. Revisar la colisión de la base: no debe trabar al jugador sin aviso.
3. Unificar el lenguaje de la manivela: «Abrir/Cerrar», «unida», «queda abierto» confunden. Decir siempre «conectado / desconectado» o «el camino está cerrado/abierto».
4. Explicar en una frase, en la mesa, qué hay que conectar (la consigna) sin depender de la Bitácora densa.
5. Reducir los diálogos previos al primer acto (unos 15 toques).
6. Lectura de Ohm más simple: quitar «contacto de retorno respecto del terminal negativo» y usar palabras de 12 años.
7. Bitácora de Marín: menos ecuaciones y más dibujo; dejar la fórmula como «Para los que quieran más».
8. Botones × del Mapa, la Guía y la Pausa deben responder al primer clic.
9. Evitar que una combinación de teclas abra la Pausa.
10. Movimiento: WASD muy lento; sugerir o acelerar el movimiento y destacar «Caminar con clic».

## Top 5 de lo mejor
1. La Guía «Un paso a la vez» con tres pasos claros.
2. La Bitácora con la historia de Marín y la pregunta «Para pensar» al final.
3. La plaza del Faro: arte, clima nocturno, arcos y faroles.
4. Nereo: personaje cálido y con humor; la misión queda clara.
5. El mapa con el diamante de «siguiente paso».

## Estado de la sesión
- Pestaña integrada seed cerrada al terminar (ver última acción).
- Viewport 1280x800 emulado: resetear con preset "desktop".
