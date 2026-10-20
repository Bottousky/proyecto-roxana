ESTADO ACTUAL: Calzada del Agua (Edda) · cerrojo de la puerta sin resolver: el regulador de la puerta está junto a la puerta; al tocarlo Edda dice «El cerrojo hace fuerza… pero para abajo. ¿No tendría que levantar?». Partida cortada aquí (no se completó el arco).

# Informe de playtest 23 · Arco I desde cero

Jugador: chico/a 12-15 años, sin conocimientos de electricidad. Personaje: Vale (apariencia por defecto).
Pestaña: seed (http://localhost:4190/?tramo=cerob), viewport 1280x800. tabs_create falló; se usó navigate y el tabId seed.
Método: capturas de 800x600 (a veces cortan el lado derecho; el panel de Ohm queda fuera de cuadro). get_page_text y read_page fueron lo más útil. Los refs caducan después de cada acción: hay que volver a hacer find.

Progreso real: 3 lugares casi completos (Portal, Plaza de Ohm, Taller de Lumen) y el 4.º (Calzada) a medias. Luces del mapa al cortar: «2 de 9 luces encendidas». No llegué al final del arco.

## Lugar 1 · El umbral del valle (Portal Ω) · ~25 min
- Título: «Cruzar el Portal», nombre Vale. Carga de ~30 s («Tejiendo Ohmdal», «Abriendo los caminos»).
- Diálogos con Edda y Vale: largos, de a uno por Enter; unas 10 pulsaciones antes de la primera acción. Edda es cálida y el humor funciona («Mi abuela se moriría de envidia»).
- Objetivo «Una pequeña luz»: la flecha dorada está sobre el pedestal. Al clicarla, el personaje caminó hacia el lado opuesto (cajones junto al río) y se trabó. Lo resolví con WASD. ~8 min perdidos.
- Mesa «Un pequeño latido» (circuito): muy clara. Había un cable Celda+ → Bronce+ ya puesto; faltaba Celda− → Bronce−. El texto final explica el concepto: «Hizo falta una vuelta completa… Con una sola conexión, nada se movía.» Circuito cerrado = ida y vuelta: quedó claro.
- Ohm: analogía de la cadena de bicicleta, útil.
- Bitácora: se llena sola con cada hallazgo (texto corto, «Un recuerdo recuperado»). No hizo falta abrirla a mano.

## Lugar 2 · Plaza de Ohm · ~10 min
- Edda indica el camino norte. Al clicar la flecha, el personaje quedó tapado por un árbol (silueta oscura) y se trabó hasta que WASD lo sacó.
- Plaza: flecha a la puerta del taller de Lumen. Bien señalizado.

## Lugar 3 · Taller de Lumen («El oficio de preguntar») · ~50 min (el que más me costó)
- Cierre izquierdo: Ohm con Q dice «la ida no llega»; E lo une («✓ Hecho · deshacer»). Ohm: «le falta la vuelta». Claro.
- Cierre derecho: Lumen dice «al final del cable del piso». Llegar fue muy difícil: el personaje quedó atrapado entre mesas, cajones, estanterías y un barril; WASD y clics en el suelo casi no lo movían. Lo que funcionó fue ráfagas de tecla con esperas de 1 s. Pérdida de ~15 min. Al final el E salió bien y Ohm dijo «Pasa corriente por acá».
- Lámpara: Lumen: «dejemos quieta la lámpara por una vez». Ohm: «Primero hay que apagar el banco.» Me gustó que la lámpara sea el objetivo y la mesa el medio.
- Taza («La taza que espera»): tono bonito («Cinco tazas distintas, todas reparadas… «Para cuando vuelvas».»).
- Mesa 2 «La costura invisible» (banco de pruebas): objetivo claro («Encontrá el tramo cortado y puentealo con tu cable»). Pero medir es confuso para 12 años:
  · «Comprobar el camino» pone la mesa en modo medición; hay que tocar dos bornes. Arriba aparece «Unidos por cobre: …» con pares que no toqué, y no queda claro qué par se mide.
  · El resultado sí se entiende: «Hay camino» / «Sin camino».
  · Tramo 1 «Hay camino», Tramo 2 «Sin camino» → corte. Puenteado con el cable en Tramo 2 A y B → «Funciona», la luz del banco se enciende. Ohm: «Por fuera, los tres tramos son iguales» como pista: ayuda.
- Cierre: Lumen «Era un hilo cortado adentro de la tela», y Ohm guarda el tramo viejo «para comparar». Buen cierre.
- Salida: el botón «Salida: Volver a la Plaza» a veces no sacaba; hubo que volver a cerrar la mesa («Volver al mundo») y salir de nuevo.

## Lugar 4 · La Calzada del Agua (Edda) · ~45 min, sin terminar
- Objetivo: «Encontrá a Edda en la Calzada. Las balizas no responden…». Llegué bien siguiendo las flechas (plaza → camino → Calzada).
- Edda: «Cuatro cosas raras». Resueltas:
  1. Poste este: Q (Ohm: «desde la puerta no hay vuelta a la fuente») → E «Unir el cierre bajo las hojas» → «✓ Hecho».
  2. Puente de cobre que evita la puerta: Ohm lo explica como cortocircuito («un atajo así es un cortocircuito»). Lo abrí con E (la acción se hizo al acercarme; no lo vi venir y el texto no avisaba antes de hacerlo).
  3. Balizas: al prender la lámpara de la mesa pendiente, «Las balizas responden» y «algo responde con un golpe lento» dentro de la puerta.
- Cerrojo: Edda: «Llegó. Pero el cerrojo no levanta. Su regulador está junto a la puerta: abrilo y mirá su mesa.» Toqué el poste del regulador (E no apareció, solo diálogo) y Edda: «El cerrojo hace fuerza… pero para abajo. ¿No tendría que levantar?». NO lo pude resolver: no encontré la mesa del regulador (no quedó visible el prompt de E, y el movimiento no funcionó bien en ese momento).
- Aquí se cortó la partida por el problema de control descrito abajo.

## Problemas de control (lo más grave del playtest)
- Clic para caminar: a veces el personaje va a otro lado (Portal, Plaza) o se queda quieto (Calzada) aunque el clic sea sobre la flecha.
- Teclado: en varias partes de la Calzada y del taller, WASD no movía al personaje ni con 30 pulsaciones. Con ráfagas cortas y esperas de 1 s a veces sí.
- Bloqueo total durante ~15 min en la Calzada: ni teclado ni clic movían. Un Escape abrió el menú de pausa con botones «Exportar bitácora» y «Guardar y volver al inicio» (no los toqué). Después de «Continuar el viaje» del menú, el movimiento siguió igual de mal. Lo que lo destrabó fue volver al título y elegir «Continuar el viaje» (no «Comenzar otro viaje»): la partida se retomó en La Calzada, y desde ahí clic y teclado respondieron mejor.
- Sospecha (no confirmada): el panel «Observación de Ohm» que quedó abierto fuera de cuadro puede bloquear el movimiento. Lo cerré por referencia y no pude confirmarlo.
- Título: «4 min de viaje» cuando llevaba bastante más tiempo de juego real. Puede ser un contador de tiempo activo; para el jugador es confuso.

## 1. Bitácora
- La usé solo para mirar; no hacía falta abrirla: se llena sola con texto corto y «Un recuerdo recuperado · Bitácora [J]». Bien para un chico que se pierde (se puede releer). Sin uso del botón de exportar.

## 2. Navegación
- Mala en general. Flechas doradas que no siempre llevan al lugar correcto; personaje tapado por árboles y estanterías; atrapado entre muebles en el taller; clic que no mueve; teclas que se pierden. Es el primer problema a arreglar.

## 3. Arte y presentación
- Muy buena. Taller de Lumen con lámparas que se encienden (efecto de luz cálido), Plaza de Ohm con guirnaldas, la Calzada con su puerta y balizas. Las mesas de circuito se leen bien (bornes, cables, lámpara con glow).
- Mesas: los discos de color (ámbar/verde/azul) se entienden.
- El personaje se oculta a veces (silueta oscura detrás de un árbol) y en el taller se pierde entre los muebles.

## 4. Diálogos e historia
- Tono cálido y con humor (Edda, Lumen, Ohm). La historia de las tazas y la lámpara engancha.
- Demasiados Enter por diálogo. Para un chico de 12 años el ritmo de lectura es lento: falta saltar o acelerar el texto.

## 5. Errores o bugs
- Bloqueo de controles (ver arriba), reproducido varias veces.
- Clic por coordenadas sobre un borne falló una vez (puede ser escala de mi captura; no concluyente).
- El puente de cobre se abre al acercarse con E sin aviso previo claro.
- Panel de Ohm fuera de cuadro en algunas capturas (puede ser mi viewport).
- Flecha dorada a veces lleva a un punto que no es el objetivo (Portal, Plaza).

## 6. Ritmo
- El arco es largo: en 3 lugares y medio ya usé unas 2 horas reales, la mayor parte en pelear con el movimiento y no en el concepto.
- Las mesas en sí tienen buen ritmo (la de circuito 5 min; la de medir 10 min). El tiempo se fue en caminar.

## 7. Top 10 a mejorar
1. Movimiento y clic para caminar: la flecha dorada lleva a veces al lugar equivocado o no camina.
2. Teclado: pulsaciones seguidas se pierden; hace falta ráfagas con pausas para avanzar.
3. Bloqueo de controles (la Calzada, ~15 min) sin salida clara: añadir un «desatascar» o reaparecer en la última posición segura.
4. Personaje tapado por árboles, estanterías y muebles; atrapado en el taller.
5. Medición en el banco de pruebas: pares «Unidos por cobre» confusos; explicar en una línea el modo de medir antes de empezar.
6. Esc muestra «Exportar bitácora» y «Guardar y volver al inicio» casi juntos: riesgo de clic equivocado; separar o confirmar.
7. Diálogos: demasiados Enter; agregar saltar o velocidad de texto.
8. El puente de cobre se abre al acercarse sin aviso: mostrar la acción antes de hacerla.
9. Tiempo mostrado en el título («4 min de viaje») no coincide con el juego real.
10. Pista del regulador de la puerta: «abrilo y mirá su mesa» es poco concreto para llegar; señalar la mesa con la flecha.

## 8. Top 5 de lo mejor
1. Las mesas de circuito: feedback claro («Sin energía», «Hay camino», «Funciona», «Con una sola conexión, nada se movía») y «✓ Hecho · deshacer».
2. Personajes y tono: Edda, Lumen y Ohm tienen voz propia y humor cálido.
3. Bitácora automática con texto breve; ayuda a retomar sin perderse.
4. Arte: el taller de Lumen, la Plaza y la Calzada son muy lindos; las lámparas que se encienden son un gran premio visual.
5. Explicación de conceptos con analogías y con el resultado: circuito cerrado (ida y vuelta), cortocircuito, medir con el instrumento.

## Qué no llegué a probar
- El regulador del cerrojo, y todo lo que sigue hasta «ARCO I · COMPLETO». No llegué al final del arco.
