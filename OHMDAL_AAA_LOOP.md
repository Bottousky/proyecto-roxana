OHMDAL — ARCO I: LOOP DE PRODUCCIÓN Y PULIDO

> Estado persistido de este loop: [docs/produccion-aaa/ESTADO.md](docs/produccion-aaa/ESTADO.md)
> (objetivo actual, hechos comprobados, backlog priorizado, evidencia y siguiente acción).

MISIÓN

Trabajá sobre el Ohmdal existente de Proyecto Roxana hasta obtener un Arco I completo, memorable y pulido, con ambición de acabado AAA dentro de su identidad y alcance. No quiero otro prototipo, una demo de una plaza, una colección de sistemas desconectados ni una presentación de lo que algún día podría ser.

Tenés autonomía para investigar, diseñar, implementar, crear e integrar assets, probar y corregir durante esta sesión y sus reanudaciones. No te detengas para pedir aprobación de decisiones ordinarias y reversibles. El tiempo disponible no es una invitación a inflar el alcance: dedicá las iteraciones a mejorar lo que experimenta el jugador.

Tu unidad de progreso es una experiencia jugable que funciona y se siente mejor. No son líneas de código, cantidad de archivos, cantidad de agentes ni horas consumidas.


1. PRIMERO ENTENDÉ Y JUGÁ EL PROYECTO REAL

Inspeccioná las instrucciones del repositorio, su estado Git, el canon, los documentos de diseño, los assets y la implementación activa. Leé AGENTS.md, CLAUDE.md y los documentos pertinentes que realmente existan. Identificá qué decisiones están aprobadas y cuáles eran propuestas o experimentos. No deduzcas el estado actual de resúmenes antiguos.

Respetá la rama de producción y los cambios ajenos. Aislá tu trabajo de manera reversible siguiendo el flujo del repositorio. No descartes modificaciones existentes, no hagas force-push y no publiques ni despliegues sin autorización explícita. No cambies motor, stack, cámara o dirección artística sólo porque quieras empezar de cero. Toda migración indispensable requiere demostrar el bloqueo y preservar lo que funciona.

Arrancá la build y recorré el juego mediante sus controles reales. Capturá el estado inicial de las escenas principales y registrá los bloqueos observados. No pases la primera sesión entera planificando: después del reconocimiento, implementá y verificá una mejora sustancial.


2. LO QUE OHMDAL DEBE SEGUIR SIENDO

Ohmdal es un reino medieval que perdió la comprensión de la electricidad. No es una ciudad destruida ni un parque temático de neón: es una sociedad detenida que todavía conserva oficios, cultura, vínculos, infraestructura y supersticiones. La electricidad debe sentirse como parte de su arquitectura y de su vida cotidiana.

El objetivo es explorar, comprender y devolver funciones al mundo. El olvido es el antagonista conceptual. No introduzcas combate, sistemas de supervivencia, economía de relleno o nuevas regiones para aparentar profundidad.

Respetá el canon vigente y completá su recorrido hasta el Faro. Como anclas de alcance: Portal Ω, encuentro con Edda, despertar de Ohm, reacción de la plaza, Maese Lumen y su taller, camino y Puerta de Ohm, Manantial, sectores del Castillo, galería y Faro. Conservá las etapas adicionales que el canon actual haya aprobado; no las inventes ni las elimines para simplificar la entrega.

El primer encendido de Ohm, la apertura de la Puerta, la recuperación del Manantial y el Faro deben ser momentos construidos: preparación, interacción, cambio audiovisual y consecuencias persistentes. No alcanza con cambiar un booleano y mostrar un mensaje.


3. DIRECCIÓN ARTÍSTICA ESTABLE, NO CAMBIOS DE ESTILO EN CADA PASADA

Conservá y elevá la dirección existente que funciona, incluida su afinidad con Pokémon de cuarta/quinta generación y el lenguaje 2.5D cuando corresponda. Busco claridad, encanto, profundidad y acabado; no fotorrealismo obligatorio.

Usá las referencias aprobadas disponibles. Cuando falte una decisión visual, investigá unas pocas referencias pertinentes y fijá criterios concretos: escala de personajes, cámara, siluetas, paleta, materiales, sombras, densidad de detalle, retratos, animación y UI. Compará composición con composición y escala con escala; no tomes una cinemática como estándar de una cámara jugable.

Los referentes son orientaciones de diseño, no paquetes para copiar: exploración legible, interacción significativa, descubrimiento por comprensión y close-ups táctiles. Toda combinación debe resolverse en una identidad de Ohmdal coherente.

Priorizá estos problemas cuando sigan presentes:

— El reino debe sentirse geográficamente continuo aunque internamente use rooms. Caminos, agua, alturas, arquitectura, entradas, salidas y landmarks deben coincidir entre zonas. Nada de teletransportes disfrazados de puertas ni transiciones que desorienten.

— El mapa necesita composición deliberada: recorridos, encuadres, desniveles, espacios de descanso y puntos de interés. La repetición procedural no debe decidir la identidad de cada lugar.

— El canal debe tener cauce, profundidad y bordes creíbles, puentes y apoyos coherentes, y estados visuales acordes al progreso. Corregí pilares sobre el agua sin sustento y elementos que se intersectan absurdamente. El agua detenida y la recuperada deben distinguirse sin contradecir la historia.

— La Puerta de Ohm y el Manantial deben existir como lugares accesibles y memorables, no sólo como nombres en un menú. El símbolo Ω debe ser legible.

— Piedra clara, cobre envejecido, cerámica, madera de taller y vidrio instrumental deben tener una gramática consistente con el canon. Evitá convertir todo el cobre en una superficie luminosa.

— Conservá los sprites que ya funcionan y alineá los retratos con sus proporciones, estilización y personalidad. No mezcles muñecos cartoon con retratos de otro universo visual.

— Reducí el protagonismo del HUD sin sacrificar legibilidad. La interfaz debe pertenecer a una aventura, no parecer un dashboard web superpuesto. No confundir menos interfaz con tipografía microscópica.

No te autoimpongas hacer todo con primitivas y código procedural. Usá assets existentes y herramientas de creación, edición, modelado o generación realmente disponibles y autorizadas. Verificá perspectiva, escala, transparencia, resolución, animación y licencia. No inventes integraciones ni actives servicios pagos sin permiso. Si falta una capacidad, continuá en tareas útiles y registrá qué aspecto queda bloqueado; no disfraces placeholders como arte final.

La calidad se evalúa dentro del juego y en movimiento. Ilustraciones o renders externos no reemplazan una escena integrada, navegable y con oclusión correcta.


4. GAMEPLAY Y APRENDIZAJE: COMPRENDER PARA ACTUAR

Los puzzles son el centro de Ohmdal. El jugador debe observar un problema, formar una hipótesis, intervenir, recibir feedback comprensible y usar ese conocimiento en otra situación. No quiero exámenes disfrazados, fórmulas obligatorias, combinaciones arbitrarias ni conectar colores sin entender qué cambia.

Trabajá las dos escalas: puzzles del mundo —infraestructura, recorridos, mecanismos y consecuencias— y puzzles de banco o close-up sobre el mismo objeto. La secuencia mundo → inspección cercana → intervención → cambio del mundo debe conservar estado y causalidad.

Para cada puzzle, identificá la comprensión buscada, la pista observable, la acción posible, la reacción a un intento incorrecto, el descubrimiento y su consecuencia. Esa ficha debe ser breve y servir a la implementación, no convertirse en un documento sustituto del juego.

Auditá la coherencia del modelo eléctrico que use cada sistema. Las simplificaciones pedagógicas deben declararse y sostenerse en casos nuevos; no enseñes reglas falsas sólo para conseguir una solución bonita. Agregá pruebas de las relaciones causales importantes.

El fracaso debe dar información y permitir reintentar. Incorporá ayudas graduales que empiecen orientando la observación, no revelando la respuesta. La bitácora puede nombrar y formalizar lo que ya se comprendió; no debe interrumpir cada descubrimiento con una clase.

No repitas un mecanismo con otro color para inflar contenido. Construí progresión: descubrimiento, variación significativa, combinación y transferencia. No inventes mediciones de aprendizaje ni declares demostrado que un puzzle enseña sólo porque un bot lo resolvió.


5. PERSONAJES, CONTROLES Y SENSACIÓN DE JUEGO

Edda, Ohm y Maese Lumen deben tener voz, propósito y presencia. Respetá los demás personajes que existan en el canon. Sus diálogos deben reaccionar al estado del mundo y a las acciones relevantes; no ser carteles de instrucciones con nombres propios.

Todo NPC narrativamente interactuable debe poder alcanzarse y responder. Revisá distancia de interacción, orientación, bloqueo de controles, repetición de conversaciones, interrupciones y persistencia. Los personajes de ambientación deben distinguirse de los interlocutores; no prometas interacción que no existe.

Pulí movimiento, colisiones, cámara, transiciones, interacción, animaciones de espera y desplazamiento, respuesta de mecanismos y mezcla de audio. El personaje no debe engancharse en decoración, atravesar límites incoherentes ni perderse detrás de objetos sin solución visual.

El audio debe comunicar material, espacio y cambio de estado. Usá silencio, ambiente, motivos musicales y efectos con intención. No añadas bloom, partículas, vibración de cámara o sonidos a todo para aparentar acabado.

Mantené controles claros de teclado y táctiles conforme al alcance del proyecto. Verificá lectura, contraste, tamaños táctiles, pausa y opciones de volumen. No dependas exclusivamente de colores ni ocultes información esencial para conseguir una captura más limpia.


6. MÉTODO DE ITERACIÓN OBLIGATORIO

En cada ciclo retomá el estado real, detectá el problema de mayor impacto y cerrá una mejora coherente. El orden es: bloqueos de arranque o progresión; recorrido incompleto; navegación e interacciones; comprensión y ritmo de puzzles; dirección artística y presentación; rendimiento y detalles restantes. Dentro de ese orden atendé primero lo que más perjudica al jugador.

Ejecutá este ciclo:

1. Observá el defecto en la build y documentá una reproducción o evidencia concreta.
2. Definí qué cambio visible o jugable demostraría la mejora y qué no debe romperse.
3. Implementá una solución completa para ese objetivo, incluyendo contenido y presentación cuando corresponda.
4. Ejecutá verificaciones técnicas pertinentes y probá la experiencia por sus controles reales.
5. Compará antes/después con la misma cámara, resolución, estado de partida y recorrido cuando sean comparables.
6. Hacé una revisión crítica: qué empeoró, qué sigue pareciendo provisional y qué afirmación todavía no está demostrada.
7. Corregí, conservá o revertí según la evidencia; registrá el resultado y elegí el siguiente objetivo.

Un ciclo puede durar lo necesario para completar ese trabajo: el intervalo del scheduler no es un límite de implementación. No abras tareas duplicadas ni varios escritores sobre los mismos archivos.

Usá subagentes cuando aporten una investigación acotada o una revisión genuinamente separada. El revisor debe inspeccionar la build, capturas, pruebas y criterios, no limitarse a aceptar el relato del implementador. Si no hay subagentes disponibles, hacé una segunda pasada separada y declarala como autorrevisión.

No hagas una fábrica de agentes como proyecto paralelo. Reutilizá el harness, los scripts y las convenciones existentes. Cada herramienta nueva debe justificar cómo reduce una limitación real del juego o de su verificación.

Si dos intentos no corrigen el mismo defecto, investigá la causa o cambiá de enfoque. No repitas parches sin nueva evidencia. Si una versión empeora una dimensión importante sin beneficio justificado, recuperá la anterior. No confundas diferencia con mejora.


7. PRUEBAS JUGADAS, NO UNA VICTORIA EN LOS LOGS

Build y tests verdes son necesarios, pero no suficientes. Usá automatización de navegador o las herramientas adecuadas al runtime para probar movimiento, colisiones, diálogos, close-ups, puzzles, cambios de escena, guardado y recuperación.

En recorridos de aceptación, avanzá desde una partida nueva sin teletransportes, flags desbloqueados, comandos de completar misión ni manipulación directa del estado. Los accesos de depuración pueden servir a pruebas locales, pero no cuentan como prueba del recorrido real.

Mantené checkpoints reproducibles del camino completo al Faro. Probá también regresar, equivocarse, abandonar un puzzle, abrir y cerrar interfaces, guardar y recargar, y repetir transiciones. Buscá softlocks, estados incompatibles, controles que quedan bloqueados y NPCs que dejan de responder.

Medí rendimiento en la build de producción y declarando dispositivo, navegador, resolución y configuración. Fijá objetivos antes de optimizar: como aspiración inicial, fluidez de 60 FPS en el escritorio objetivo y 30 FPS o más en un móvil de referencia, con tiempos de cuadro estables. No cambies umbrales retroactivamente para aprobar ni presentes emulación como prueba en hardware real.

Revisá tiempos de carga, tamaño de assets, errores de consola, recursos faltantes y crecimiento de memoria al recorrer zonas. Toda comprobación que no puedas ejecutar debe quedar como NO VERIFICADA, nunca PASS.


8. MEMORIA DURADERA Y EVIDENCIA HONESTA

Reutilizá los archivos de seguimiento existentes. Si no hay equivalentes, mantené un estado breve, un backlog priorizado y un índice de evidencia en una carpeta de producción del repositorio. Guardá objetivo actual, hechos comprobados, cambios, problemas pendientes, comandos útiles y siguiente acción. Relacioná pruebas y capturas con la revisión exacta de código que las produjo; una build modificada invalida evidencia afectada.

No reescribas el canon ni los criterios para justificar el resultado. No elimines tests, no silencies errores y no marques una tarea completa porque existe una función con el nombre esperado. Los tests obsoletos sólo se actualizan con una justificación que mantenga la intención del requisito.

Creá checkpoints Git pequeños y comprensibles según el flujo del proyecto, sin incluir cambios ajenos. Conservá una mejor versión conocida que se pueda arrancar. Antes de compactar o interrumpir, dejá un punto de reanudación preciso. No dependas de recordar toda la conversación.

Reportá brevemente al cerrar cada mejora: qué cambió para el jugador, cómo lo comprobaste, qué evidencia existe y cuál es el siguiente objetivo. No llenes el chat de planes repetidos ni de autoelogios.


9. CONDICIÓN DE CIERRE

No termines al conseguir una plaza bonita, un primer puzzle o una vertical slice. El alcance es el Arco I completo hasta su cierre en el Faro, respetando el canon aprobado.

Prepará un candidato a publicación sólo cuando el recorrido completo sea realizable desde cero, la progresión y los guardados se sostengan, no queden bloqueos críticos o fallos graves conocidos, los puzzles y NPCs cumplan su función y las escenas principales mantengan una calidad visual coherente. No puede haber placeholders críticos ocultos detrás de un cartel de próxima versión.

Antes de cerrar, realizá dos pasadas de aceptación con la misma build candidata: una de recorrido completo y otra adversarial con rutas, errores y recargas distintos. Incluí revisión visual tanto de las mejores escenas como de las menos logradas. Una nota subjetiva de 9/10 no sustituye esos controles.

Corregí los problemas detectados y repetí las verificaciones afectadas. Si queda trabajo accionable dentro del alcance, seguí iterando. Si sólo quedan bloqueos externos reales —permisos, cuota, herramientas o hardware no disponible—, dejá una entrega parcial exacta y reanudable, sin declarar cumplida la misión.

Cuando todos los criterios verificables estén satisfechos, entregá la build o su ubicación real, instrucciones para jugar, revisión Git, evidencia antes/después, resultados de pruebas y límites de verificación. Identificá la revisión humana de diversión y aprendizaje pendiente; no inventes una certificación AAA. Detené el loop de esta misión mediante las herramientas disponibles, sin afectar otros trabajos. No inventes cambios para mantenerte ocupado.

Empezá ahora por inspeccionar y jugar lo que existe, elegí el mayor obstáculo entre esa experiencia y esta misión, y corregilo de verdad.
