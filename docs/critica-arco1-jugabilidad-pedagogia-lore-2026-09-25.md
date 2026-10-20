# Ohmdal · Arco I: crítica de jugabilidad, pedagogía y lore

Recorrido iniciado el 25 de septiembre de 2026, hora de Buenos Aires. Versión local de PlayCanvas en `127.0.0.1:4190`. Evaluación del contenido disponible durante la iteración visual en curso.

**Diagnóstico:** Ohmdal consigue que importe devolverle la luz a una comunidad y contiene fenómenos eléctricos que vale la pena investigar. Sin embargo, con demasiada frecuencia el jugador ejecuta una explicación que los personajes ya formularon. El mayor salto de calidad vendría de hacer jugable el método que la historia defiende: observar, anticipar, intervenir, contrastar y transmitir.

## Qué recorrí y qué alcance tiene esta crítica

Completé una partida independiente desde el Portal hasta encender el Faro; jugué «La primera clase», regresé a los habitantes y comprobé el guardado al recargar. El estado final registra **9 zonas, 9 puzzles completados, 9 recuerdos, final visto y epílogo compartido**. Revisé las 11 hojas de la Bitácora y sus explicaciones desplegables. El registro contiene interacciones con 74 identificadores distintos, incluidos bancos, mandos, personajes, recuerdos y accesos.

Probé cortocircuito y recuperación, continuidad con alimentación encendida y apagada, polaridad invertida, pérdida de tensión bajo carga, separación de una rama, sobreajuste de reguladores, calentamiento del tendido y divisor con y sin carga. Salí de una reparación incompleta y comprobé que se conservaba; añadí una nota personal y verifiqué su persistencia. También recorrí mapas, guía y consulta de instalaciones terminadas.

Las acciones de juego se hicieron con teclado y mouse mediante Playwright. Utilicé información interna de sólo lectura para inventariar interacciones y asistir el desplazamiento; **no alteré posiciones, conexiones ni flags por código**. Al reutilizar la navegación del script existente también quedaron a la vista soluciones. Por eso esta evaluación no representa una resolución a ciegas ni una medición de dificultad con un principiante. La orientación sin ayuda y la comprensión de alumnos reales necesitan otra prueba.

Complementé el recorrido con la lectura de variantes de diálogo transitorias, repeticiones y bloqueos que no aparecieron en esa partida. No afirmo haber activado cada combinación de estados o cada variante mediante la interfaz. Tampoco evalué de oído la mezcla sonora. No modifiqué el juego ni los archivos de la iteración visual; esta entrega es una crítica con evidencias.

## Lo que funciona y conviene preservar

**Las reparaciones tienen destinatarios.** La fuente seca, las herramientas de Yesca, los cultivos, la enfermería y la casa de Nereo dan sentido a intervenir. Esto evita que los circuitos sean ejercicios aislados con una decoración encima.

**Hay respeto por el conocimiento de oficio.** Ivara recuerda incendios reales; Lumen reconoce materiales; Vega conoce el territorio; Nereo conserva un sonido. El visitante no llega a corregir a una comunidad de ignorantes. El diálogo final de Lumen es especialmente bueno: sigue haciendo tres vueltas porque le gustan, pero ya distingue una costumbre de una necesidad física.

**Los errores pueden informar.** El primer cortocircuito activa una protección, explica qué pasó y permite recuperarse. La continuidad energizada no entrega una lectura falsa: explica por qué hay que apagar. Las lecturas incluyen referencias y las explicaciones distinguen una lectura indeterminada de cero. Es una base pedagógica sólida.

**El Manantial y la lente contienen contrastes auténticos.** En el primero hay continuidad, pero el receptor no recibe suficiente tensión. En la lente, un ajuste correcto en vacío deja de serlo al conectar la carga. Son buenos problemas porque obligan a revisar una explicación insuficiente si el jugador efectivamente realiza las comparaciones.

**La capa cualitativa facilita entrar.** «Empuja hacia atrás», «las hojas se encogen» y «el agua sale demasiado fuerte» relacionan la intervención con un fenómeno. Los números y explicaciones pueden profundizarlo. Conservaría esa entrada y evitaría convertir cada reparación en una cuenta obligatoria.

**Los mejores recuerdos hablan de personas.** La taza que espera, la lámpara orientada hacia la casa del farero y la barca con marcas de estaturas son sobresalientes. La bisagra de Nereo después del final convierte el éxito técnico en una vida cotidiana recuperada.

## Hallazgos prioritarios

### 1. La narración atribuye al jugador pruebas que no hizo

**Prioridad alta. Observado y confirmado en contenido.**

Abrí la Puerta de Ohm invirtiendo sus conexiones. El regulador quedó en su valor inicial, **8 Ω**. El diálogo posterior afirma: «Y al ajustar la rueda, levantó sin atascarse». La Bitácora va más lejos: «Ajustar la rueda permitió que levantara; llevarla al extremo no fue la solución». No hice ninguna de esas pruebas.

Esto no es solamente una frase desactualizada. Enseña a adjudicar un resultado a una intervención inexistente, mientras Edda insiste en registrar exactamente lo que se cambió. En el Portal, además, ya viene instalado el cable de alimentación, pero el texto de cierre presupone la experiencia «Con la primera conexión no pasó nada. Con la otra, sí».

**Propuesta:** escribir los cierres a partir de las intervenciones registradas. Si sólo cambié la polaridad, celebrar esa observación. Si también probé el regulador, describir ese contraste. Separar en la Bitácora «lo que hice», «lo que observamos» y «una explicación posible».

**Criterio de aceptación:** una partida que no toca el mando nunca afirma que lo ajustó ni que ensayó su extremo. Una partida que no midió no escribe una medición implícita en primera persona.

Referencias: [diálogo de la puerta](../experiments/playcanvas/src/game/content.js), líneas 157–159; entrada `operating_window`, línea 682; estado `gate.values.brake` en la [partida exportada](../output/playwright/critica/partida-final.json).

### 2. La Bitácora puede perder precisamente la prueba que explica la reparación

**Prioridad alta. Observado y confirmado en código.**

En la lente medí **9,00 V en la toma del divisor sin la lente como carga** (la lente seguía conectada directamente a la fuente), **5,99 V con la lente conectada** y finalmente **8,97 V** tras calibrar. Después de los movimientos del mando, la página mostraba principalmente los últimos ajustes y lecturas intermedias. La lectura original de 9 V ya había desaparecido incluso del historial conservado.

El banco registra eventos por cada cambio del regulador y mediciones sucesivas. El guardado limita cada historial a **40 eventos**; la Bitácora muestra únicamente los **12 últimos** de la lista combinada. «Comparar mis pruebas» recupera sólo los tres últimos eventos de ciertos tipos. Un experimento con bastante exploración puede conservar menos evidencia útil que una solución rápida.

La marginalia «No borres lo que falló» queda en contradicción con ese comportamiento. En mi partida escribí manualmente una nota para conservar el contraste fundamental, pero el sistema debería ayudar a preservarlo.

**Propuesta:** agrupar el movimiento continuo de un mando como una intervención; conservar estado inicial, pruebas significativas y estado final; permitir fijar una medición o comparación. Mantener un historial consultable y resumirlo sin destruirlo. Registrar valores y condiciones que permitan reconstruir la prueba, no sólo números de posición.

**Criterio de aceptación:** después de decenas de ajustes, siguen recuperables las dos lecturas que contradijeron la hipótesis inicial, con sus puntos de medida y condición de carga.

Evidencias: [divisor en vacío](../output/playwright/critica/43-lente-en-vacio.png), [divisor con carga](../output/playwright/critica/44-lente-bajo-carga.png), [Bitácora final](../output/playwright/critica/50-bitacora-final.png). Referencias: [bench-evidence.js](../experiments/playcanvas/src/game/bench-evidence.js), [journal.js](../experiments/playcanvas/src/game/journal.js), línea 63; [puzzles.js](../experiments/playcanvas/src/game/puzzles.js), línea 389.

### 3. Resolver no demuestra haber investigado ni comprendido

**Prioridad alta de diseño. Observado y confirmado en la condición de victoria.**

En el Castillo apareció «Dejar funcionando» antes de que yo comprobara la independencia de las ramas. Hice después la prueba: desconecté la cocina y la enfermería siguió iluminada. La simulación lo permite; el recorrido no lo necesita.

En Terrazas terminé con los dos mandos en **12 Ω**, guiándome por la respuesta favorable de raíces y bomba, sin utilizar instrumentos ni formular una predicción. La fuente del Faro también permite ajustar hasta que desaparezcan los síntomas adversos. Esto no es necesariamente malo para la primera aproximación, pero el cierre narra una comprensión más amplia que la evidencia de juego.

La condición `solved` comprueba alimentación, validez de la red, rangos de los receptores y restricciones físicas. No comprueba comparación, predicción o transferencia. Anotar una hipótesis sí existe, dentro de «Comparar mis pruebas», y hay notas personales en la Bitácora: el problema no es su ausencia, sino su escasa integración con la acción.

**Propuesta:** elegir dos o tres momentos importantes para que la necesidad del mundo demande una comprobación. Ivara puede pedir mantener la enfermería encendida mientras se interviene la cocina. Nereo puede conectar la lente después de una calibración en vacío y obligar a revisar la predicción. El jugador puede seleccionar puntos de medida o preparar una prueba para Tala. Evitar imponer formularios, palabras clave o un examen después de cada banco.

**Criterio de aceptación:** al menos una transferencia requiere elegir una prueba adecuada en una situación distinta; repetir la conexión anterior sin observar ya no basta para cumplir el encargo.

Referencia: [puzzle-model.js](../experiments/playcanvas/src/game/puzzle-model.js), líneas 131–150. Evidencias: [Castillo aceptado](../output/playwright/critica/27-castillo-acepta-sin-prueba.png) y [prueba posterior de independencia](../output/playwright/critica/28-castillo-rama-independiente.png).

### 4. Demasiadas hipótesis vienen resueltas en conversaciones obligatorias

**Prioridad alta de diseño.**

Antes de investigar la puerta, mi personaje propone que algo está conectado al revés. Antes del tablero del Castillo, propone darle a cada servicio su propio camino. En la distribución del Faro recuerda explícitamente esa solución. Antes de la lente, pregunta si el ajuste cambiará al conectarla. La progresión de ideas es buena, pero varias de esas ideas las expresa el protagonista automáticamente.

El jugador puede terminar representando una curiosidad que no tuvo ocasión de ejercer. La contradicción se vuelve muy visible cuando Edda reconoce en el epílogo que le costó no señalarle a Tala dónde estaba la reparación: el juego sí me la suele señalar a mí.

**Propuesta:** los diálogos obligatorios deberían establecer necesidad, síntoma, restricciones y conocimientos de oficio. Reservar las hipótesis de solución para ayuda solicitada o para reaccionar a una prueba del jugador. Las primeras dos pistas opcionales que usé en el Faro ya tienen el tono adecuado: preguntan por el recorrido y recuerdan una experiencia.

### 5. La estructura de cada zona se vuelve predecible

**Prioridad media-alta.**

La secuencia se repite: llegada narrada, hablar, operar mandos del escenario, ver una breve restauración parcial, abrir banco, reparar, ver restauración y escuchar un cierre. Los exteriores preparan al jugador para reconocer un patrón de producción más que una nueva clase de problema.

No todos los mandos aportan lo mismo. Separar el archivo da sentido a la prudencia de Ivara; retirar el puente de la Calzada cambia una hipótesis sobre la red. Los dos cierres del taller o las dos uniones del muelle se acercan más al trámite. El Faro concentra **seis mandos y tres bancos** y estira ese patrón justo antes del clímax.

**Propuesta:** conservar los mandos cuya consecuencia ayude a razonar; permitir que las acciones preparatorias rutinarias las hagan los habitantes. Alternar diagnóstico en el escenario, reparación de banco, prueba conjunta, decisión de distribución y revisión de una reparación ajena. El Lago puede funcionar como pausa emocional y lugar donde reaparece una consecuencia, sin otra pareja obligatoria de conexiones.

### 6. Terrazas promete un conflicto de recursos que el banco no desarrolla

**Prioridad media-alta.**

Yesca necesita fabricar herramientas y Vega regar. El diálogo plantea quién soporta el coste de una decisión compartida. Sin embargo, la parte de Yesca queda resuelta al poner una palanca en régimen moderado. El banco posterior regula calor de raíces y bomba; no permite comparar varios acuerdos entre forja y riego.

Ambas ramas dan buena devolución cualitativa. Aun así, pasar de «mi forja sostiene tus herramientas» a «dejar dos mandos dentro de su franja» reduce la fuerza del conflicto. La potencia aparece bien explicada en la Bitácora, pero no tuve que utilizarla para elegir un acuerdo.

**Propuesta:** hacer perceptible una restricción compartida y permitir dos soluciones defendibles: regular ambas actividades, distribuir turnos o mejorar una pérdida. Mostrar qué gana y qué cede cada oficio. Si ese alcance no entra en esta iteración, alinear el encargo narrativo con el problema realmente jugable del invernadero.

Evidencias: [banco inicial](../output/playwright/critica/31-terrazas-banco.png) y [aceptación sin mediciones](../output/playwright/critica/32-terrazas-sin-mediciones.png).

### 7. Poner en servicio clausura demasiado pronto la experimentación

**Prioridad media.**

Al volver al pedestal y a la lente pude observar y medir tensión, pero no modificar el montaje. La interfaz sigue ofreciendo «Mover cables» y la instrucción «Tocá dos piezas redondas para unirlas con un cable». Al hacerlo responde que la instalación está en servicio. Los otros instrumentos también se restringen.

Proteger lo que usa la comunidad tiene sentido narrativo. El problema es que desaparece el espacio donde el jugador podría comparar después de leer la explicación. Los habitantes hablan de conservar piezas para el próximo aprendiz, pero ese siguiente experimento no está disponible como actividad propia.

La revisión de código añade un riesgo: `close()` da por completado cualquier montaje que en ese momento cumpla las condiciones, de modo que el cierre común del banco también sirve para ponerlo en servicio. No ensayé por separado todas las vías de cierre; esta última observación es de código.

**Propuesta:** ofrecer una copia de práctica en el taller o un modo de ensayo que preserve el servicio. Distinguir «volver» de «poner en servicio». Cambiar instrucciones y controles cuando la instalación sólo permite consulta.

Evidencia: [consulta de una instalación terminada](../output/playwright/critica/49-banco-completado-bloqueado.png). Referencias: [puzzles.js](../experiments/playcanvas/src/game/puzzles.js), líneas 118–128, 251, 501 y 518–544.

### 8. El cierre formal llega antes del cierre temático

**Prioridad media.**

Después de encender la lente aparece **«ARCO I · COMPLETO»** con estadísticas y «Seguir en Ohmdal». Todavía no ocurrió la primera clase. Un jugador tiene motivos para interpretar que todo lo importante terminó y que quedan sólo coleccionables.

La primera clase debería ser parte visible de la conclusión: allí se verifica narrativamente que la comunidad puede continuar aprendiendo. La escena está bien escrita, pero es enteramente dialogada; la transmisión sigue siendo una afirmación de los personajes.

**Propuesta:** enlazar el Faro con «A la mañana siguiente» y presentar el cierre de arco después de la clase. Darle al jugador una intervención breve: preparar los dos tramos que Tala va a comparar, señalar una prueba conservada o dejar el montaje documentado. Que el momento no se convierta en otro puzzle largo.

Evidencias: [pantalla de final](../output/playwright/critica/47-final-arco.png), [estado tras el epílogo](../output/playwright/critica/48-primera-clase.png). Referencia: [main.js](../experiments/playcanvas/src/game/main.js), `runFinale`, línea 367 y siguientes.

## Lectura del recorrido, lugar por lugar

| Lugar | Lo que se entiende y se aprende | Evaluación crítica |
|---|---|---|
| Portal Ω | Hay un ser que no responde; completar el retorno lo despierta. La placa opcional anticipa el camino de vuelta. | Buen comienzo pequeño y sin sobrecarga instrumental. El circuito ya trae una conexión; ajustar el cierre narrativo a esa situación. Falta un poco de motivación personal del visitante más allá de haber cruzado. |
| Plaza | Una comunidad conserva oficios y una fiesta pendiente. Fuente, horno, campana y estatua preparan agua, luz, Nereo e Instituto. | Es el mejor centro social. Los desvíos aportan motivos para reparar. Su restauración merece hacerse visible en el recorrido principal, no depender enteramente del regreso voluntario. |
| Taller | Una cubierta entera puede esconder un conductor abierto; el instrumento permite distinguir apariencia de continuidad. | Buen diagnóstico y buen retrato de Lumen. El puente de reparación se parece físicamente al cable del Portal, pero la pregunta sí cambia. Dar más espacio a escoger dónde comprobar, y recuperar después la comparación con el tramo sano. |
| Calzada | El puente indebido y la polaridad producen síntomas distintos. Medí −7,97 V en el cerrojo. | La relación sentido de movimiento/polaridad es legible. El mando introduce una segunda variable que no hizo falta tocar; el diálogo y la lección deben reconocerlo. |
| Manantial | La energía viene de una rueda y un generador. Un empalme de 18 Ω deja pasar, pero provoca una caída importante. | Uno de los mejores encuentros pedagógicos. Fuente 12,00 V, bomba 4,78 V y empalme 7,17 V: hay un contraste que explica el fallo. Conservar las mediciones y dejar que el jugador encuentre la necesidad de compararlas. |
| Castillo | Una rama dañada puede aislarse; cocina y enfermería pueden tener caminos independientes. | El conflicto de Ivara da peso a la topología. La simulación permitió apagar cocina y mantener enfermería. Convertir esa comprobación en parte del encargo y retrasar la sugerencia automática de paralelo. |
| Terrazas | Regular dos receptores cambia calor y caudal. Demasiado y demasiado poco son estados diferentes. | La devolución se entiende, pero el banco se resuelve por ajuste de franjas y desarrolla poco el acuerdo entre oficios. Buen lugar para introducir alternativas y costes. |
| Lago | El retorno reaparece a otra escala. Nereo pasa de figura anunciada a persona; su hogar importa. | Excelente pausa emocional y recuerdo opcional. La tarea de unir dos puntos repite demasiado una competencia ya ejercitada. Hay margen para más observación libre y menos preparación obligatoria. |
| Faro I | La fuente debe sostener la carga y respetar pérdidas en el cobre. A 0 Ω observé sobrecalentamiento; a 3 Ω se aceptó la instalación. | Buen límite funcional. Las marcas mostraron 5,8 W frente a un máximo de 5,2 W en el primer caso. Hacer que la comparación participe del diagnóstico, no sólo del ajuste por mensajes. |
| Faro II | Tres servicios pasan de un recorrido en serie a ramas propias. | Transferencia técnicamente coherente del Castillo. La solución llega demasiado anticipada por el protagonista. La autonomía del diagnóstico debería crecer a esta altura. |
| Faro III | La carga altera el divisor: 9,00 V con la toma del divisor sin carga, 5,99 V al conectar allí la lente, 8,97 V después de regular. | El problema más rico del cierre. Girar el mando mientras la lente seguía conectada directamente a la fuente no corregía el síntoma: hay que entender también el recorrido. La Bitácora debe conservar esa historia completa. |
| Primera clase y regreso | Tala observa una reparación; Edda se contiene; Lumen facilita; Nereo vuelve a casa. Los vecinos reconocen lo ocurrido. | Cierre humano logrado. Falta una pequeña acción de transmisión del jugador y darle a la clase su lugar antes de declarar completo el arco. |

## Diálogos, personajes y lore

**Edda tiene voz y agencia reconocibles.** La competencia amable en la Calzada, sus dibujos a lápiz y su decisión de preguntar por las cartas la distinguen de una guía turística. Su arco hacia enseñar sin adelantar está bien elegido. Para que se sienta compañera, debería equivocarse en alguna predicción que el jugador pueda contrastar; hoy casi siempre acompaña la hipótesis que llevará al resultado correcto.

**Ohm combina precisión y afecto.** Distingue incertidumbre de fracaso y no reemplaza el oficio de los habitantes. Su error de cuatro frente a cuarenta años, la taza y su nota antigua sostienen la memoria fragmentada con detalles. El humor funciona especialmente cuando revela vínculo. La fórmula «[algo] registrado» es simpática, pero su frecuencia la vuelve previsible; algunos momentos ganarían con una respuesta sencilla o una pausa.

**Lumen, Ivara y Nereo tienen los arcos más completos.** Lumen transforma una receta sin renunciar a su identidad; Ivara aprende a compartir la responsabilidad en lugar de abandonarla; Nereo puede cuidar algo distinto del Faro. La bisagra que Yesca hace para él es una de las mejores recompensas del regreso.

**Vega y Yesca necesitan más acción compartida.** El diálogo caracteriza sus necesidades y el texto no ridiculiza su conflicto. Pero la reconciliación ocurre con poca deliberación jugable. Un pequeño desacuerdo comprobable, con más de un resultado aceptable, haría que el acuerdo perteneciera a ambas y al jugador.

**El Instituto funciona como deuda pendiente.** Las cartas establecen abandono y pérdida de continuidad sin recurrir a un villano mágico. La estatua, la inscripción y la firma conectan el viaje con Roxana. No hace falta resolver ese misterio en este arco. Sí ayudaría establecer al inicio, en muy poco texto, qué esperaba hacer el estudiante al cruzar y qué relación cree tener con el Instituto; el canon escrito contiene contexto que la apertura jugable no desarrolla.

**Hay exceso de reiteración del mismo principio pedagógico.** Guardar los errores, hacer una pregunta, no confundir observar con explicar y dejar un dibujo reaparecen en muchos diálogos, recuerdos, consignas y cierres. Cada frase aislada suele estar bien. Leídas seguidas, varias cumplen la misma función. Conviene reservar las formulaciones más memorables y permitir que las demás escenas demuestren el principio mediante acciones o necesidades cotidianas.

La taza, el pan y la bisagra muestran que el mundo puede hablar de algo más que su método educativo. Mantendría y ampliaría esa clase de detalles. No todos los habitantes ni todos los objetos necesitan terminar con una máxima sobre aprender.

## Orientación, espacio y sobrecarga

La brújula, el objetivo persistente, la guía y los mapas dan una dirección clara. El tiempo narrativo permite explorar sin reloj de castigo; al volver después de la clase se conserva el día 2. El viaje rápido hace viable revisar consecuencias. Son decisiones adecuadas para una aventura donde la destreza motriz no es el contenido.

Mi navegación estuvo asistida y no sirve para afirmar que una persona nueva nunca se perdería. Sí pude aproximarme a los puntos inventariados sin encontrar un bloqueo de progresión. Una próxima prueba debería observar cuánto tarda alguien en distinguir una instalación, un recuerdo y una fachada decorativa sin consultar el inventario interno.

La geografía adquiere sentido mediante el agua, los caminos y el regreso. En el Faro hay una distancia entre el lenguaje de ascender a galerías y el recorrido que realicé entre puestos del exterior: convendría reforzar dónde está cada subsistema y por qué operar ese puesto afecta a esa parte de la torre. Esto es legibilidad espacial y causal, independientemente del acabado visual.

Los bancos arrancan con una jerarquía bastante clara, especialmente el Portal. La carga crece al acumular esquema, nombres de bornes, instrumentos, encendido, mandos, observaciones, pistas, números, marcas y pruebas. En Castillo y Terrazas el panel requiere desplazamiento interno; con apartados desplegados, controles y resultados pueden quedar separados. No hace falta eliminar información: conviene mantener visibles a la vez la variable que se toca y la consecuencia que se observa, y distinguir mejor el estado de consulta del de intervención.

La sobrecarga principal del arco no viene de fórmulas difíciles. Viene de la suma de mensajes, cambios entre mundo y banco, preparaciones repetidas y explicaciones que reaparecen. El jugador puede recibir mucha instrucción y aun así practicar poca decisión propia.

## Orden de trabajo recomendado

1. **Alinear relato y evidencia.** Corregir las afirmaciones de la puerta y revisar el resto de cierres en primera persona. Preservar comparaciones importantes en el historial. Son cambios que protegen la credibilidad de todo el aprendizaje.
2. **Devolver decisiones al jugador.** Revisar los diálogos que anticipan soluciones y convertir Castillo y lente en dos demostraciones claras de diagnóstico autónomo. Mantener ayuda graduada para quien la necesite.
3. **Revisar Terrazas y la repetición de mandos.** Elegir dónde hay una decisión y dónde sólo se está preparando otro panel. Dar al conflicto de recursos una consecuencia jugable o ajustar su promesa.
4. **Cerrar con transmisión.** Integrar la primera clase antes de la pantalla de arco completo y ofrecer una intervención breve. Abrir un banco de práctica para seguir comparando sin perjudicar a la comunidad.
5. **Hacer una prueba con principiantes.** Sin resolver por ellos, observar si pueden anticipar qué cambiará, elegir dónde medir y explicar por qué una lectura en vacío no garantiza funcionamiento. Registrar también cuándo el texto les dio la respuesta antes de que pudieran formular una pregunta.

No aumentaría la dificultad añadiendo más componentes ni más fórmulas antes de resolver estas cuestiones. Los fenómenos necesarios ya están implementados. El trabajo está en permitir que el jugador los descubra, conserve la evidencia y la use en una situación nueva.

## Evidencias y estado final

- [Partida final exportada](../output/playwright/critica/partida-final.json): nueve puzzles completados, nueve recuerdos y epílogo; recargada correctamente.
- [Registro legible de la sesión](../output/playwright/critica/evidencia-legible.txt): acciones, textos visibles, mediciones y observaciones de las herramientas. Contiene también capturas parciales del efecto de escritura.
- [Cobertura de interacciones](../output/playwright/critica/cobertura.json): inventario de identificadores visitados.
- [Variantes revisadas como complemento](../output/playwright/critica/variantes-complementarias.txt): lectura de contenido; no debe confundirse con activación de cada variante en la partida.
- [Plaza restaurada](../output/playwright/critica/53-plaza-restaurada.png), [mundo después de recargar](../output/playwright/critica/58-guardado-recargado.png) y resto de capturas en `output/playwright/critica/`.

No encontré un bloqueo que impidiera completar esta partida. Eso verifica el recorrido realizado, no todas las topologías posibles ni todos los estados alternativos. Los problemas principales documentados aquí son de correspondencia entre acciones y relato, conservación de evidencia, autonomía del aprendizaje, ritmo y alcance de las decisiones.
