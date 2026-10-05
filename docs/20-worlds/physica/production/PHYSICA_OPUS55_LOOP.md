# PHYSICA — CONTRATO DE PRODUCCIÓN PARA OPUS 5.5

Actuá como responsable de diseño, implementación y acabado de Physica, el mundo de física de Proyecto Roxana. Producí un videojuego real, no una presentación, una colección de demostraciones ni un GDD sin ejecutar.

Busco una aventura física extraordinariamente interactiva, con el cuidado artesanal de un gran juego comercial. «AAA» define nuestra ambición de acabado, no autoriza a declarar calidad sin demostrarla. Tenés autonomía para trabajar durante muchas iteraciones; no para gastar dinero, ampliar el alcance indefinidamente o destruir trabajo existente.

## 0. Preparación, una sola vez

Inspeccioná el repositorio y su estado real. Localizá las instrucciones aplicables, el lore, el GDD de Physica, la implementación y las herramientas disponibles. No supongas que una ruta, rama o documento antiguo sigue existiendo. Diferenciá CANON, IMPLEMENTADO, PROPUESTA y LEGACY. Este brief actualiza la dirección creativa; registrá cualquier conflicto relevante sin borrar la historia.

Trabajá en una rama y un worktree exclusivos de Physica. Si ya existe uno adecuado, retomalo. No modifiques main, Ohmdal, Bitland ni Arithmos; no sobrescribas cambios ajenos. Las dependencias compartidas requieren demostrar ausencia de regresiones. No hagas push, despliegues públicos, compras ni llamadas a servicios pagos sin autorización específica. No desactives permisos o protecciones para continuar.

Dentro del worktree, guardá este contrato completo en `docs/20-worlds/physica/production/PHYSICA_OPUS55_LOOP.md`. Reutilizá las convenciones del proyecto para registrar un estado breve, un backlog verificable y evidencias de ejecución. No construyas una plataforma de agentes antes de construir el juego.

Auditá el motor existente antes de elegir tecnología. Conservá lo útil; cualquier sustitución debe resolver una limitación demostrada, no una preferencia. La plataforma objetivo es web, PC y móvil. El brief especifica resultados, no impone un motor.

Levantá el juego y obtené una captura de referencia. Si todavía no existe Physica, creá su entrada ejecutable aislada y empezá con el fenómeno central. La preparación debe desembocar en juego observable, no en otra ronda de planificación.

## 1. Fantasía y propósito

Physica es un micromundo experimental ficticio creado por los profesores del Instituto Roxana. Su envoltura narrativa puede ser subatómica/cuántica, pero no presentes sus paisajes o anomalías como una descripción literal de la física cuántica real.

La naturaleza parece descontrolada porque las condiciones cambian entre regiones: gravedad efectiva, superficies, fuerzas aplicadas, medios ópticos y campos. No porque el juego elija resultados al azar. Mismas condiciones e intervención deben producir resultados reproducibles dentro de tolerancias documentadas.

El jugador es un explorador que aprende a observar, anticipar, intervenir y comprobar. No es un alumno contestando exámenes ni un técnico obligado a apagar toda anomalía. Su progreso consiste en comprender condiciones y utilizarlas para descubrir caminos, ayudar a habitantes y conectar lugares.

La metrópolis científica existe detrás del paisaje. Allí predominan condiciones familiares y controladas. No es un menú de niveles: debe ser un espacio jugable, habitado y lleno de experimentos cotidianos. Descubrirla explica parte del mundo y abre preguntas nuevas.

Preservá el reloj-dispositivo, la Bitácora, el acceso desde el Instituto y otros elementos cuando estén respaldados por el canon disponible. No inventes que leíste documentos ausentes. Cualquier nombre nuevo de región o personaje es una propuesta hasta quedar asentado.

## 2. Experiencia y descubrimiento espacial

Usá Captain Toad como referencia de escenarios compactos, observables, ricos en relaciones espaciales y objetos manipulables; nunca copies personajes, assets ni niveles. El desafío principal debe ser entender y transformar el entorno, no ejecutar saltos de precisión.

Preferencia inicial: recorrido de lectura 2D/2.5D, con profundidad visual coherente y navegación contenida. Cuando se descubra la metrópolis, habilitá exploración 3D donde aporte comprensión, posibilidades físicas o un descubrimiento espacial significativo. No cambies de género abruptamente ni agregues profundidad por prestigio técnico.

Probá temprano una escena mínima de la transición. El jugador debería reconocer que el mundo siempre tuvo profundidad: una abertura que parecía decorativa se vuelve transitable; detrás de una pared aparece un barrio; un mecanismo revela su eje. La cámara cambia cómo observamos, no modifica por sí sola las leyes físicas.

No desarrolles dos juegos incompatibles para unirlos después. Si la implementación existente necesita otra solución, compará alternativas con una prueba jugable y elegí por continuidad, legibilidad y costo de mantenimiento.

Los verbos centrales serán desplazarse, observar, transportar, colocar, empujar, liberar, orientar, medir y accionar mecanismos. No todos se desbloquean juntos. El salto, si existe, no debe trivializar los fenómenos que hacen interesante el recorrido.

## 3. Escena insignia: la cascada ascendente

Esta es la primera prueba de calidad y de identidad, no un efecto decorativo.

Antes de entrar en su área, el jugador permanece apoyado en el suelo y un objeto de prueba cae de manera familiar. En una región delimitada, el agua asciende. Al entrar en esa misma región, el jugador y los cuerpos sujetos a su campo experimentan una aceleración efectiva hacia arriba.

La condición debe pertenecer al espacio, no a una animación global ni a un truco exclusivo para el avatar. Definí extensión, intensidad, transición, cuerpos afectados y reglas de superposición. Si algún fenómeno depende de una corriente del fluido y no del campo, distinguí ambos mecanismos.

La inversión de la aceleración no debe invertir instantáneamente la velocidad. Un cuerpo puede entrar descendiendo, frenarse y empezar a subir. Al salir conserva su velocidad instantánea y vuelve a evolucionar bajo las condiciones exteriores, salvo una colisión o un impulso explícito.

Permití experimentar sin arriesgar al personaje: soltar un objeto desde un soporte, observarlo cruzar el límite, comparar recorridos y preparar el propio cruce. Después reutilizá la misma regla en una configuración nueva sin repetir la explicación.

El límite debe poder descubrirse mediante comportamiento, partículas, vegetación, sonido o instrumental; nunca sólo por color. Hacé evidente la relación entre agua, objetos y personaje. Evitá muros invisibles, zonas ambiguas y activaciones que dependan de un píxel.

La cascada necesita volumen aparente, espuma, continuidad del flujo y una composición memorable. Su representación puede simplificar fluidos, pero debe responder al estado físico correcto. No implementes una simulación de fluidos costosa si una representación más económica comunica lo mismo.

La infraestructura experimental puede suministrar energía: no presentes un ciclo impulsado artificialmente como movimiento perpetuo gratuito.

## 4. Pedagogía integrada

Diseñá alrededor de este ciclo: observar → anticipar → preparar → probar → comparar → modificar → transferir.

La anticipación puede expresarse colocando un receptor o eligiendo un recorrido. No tiene que ser una pregunta escrita. Las mediciones, marcas temporales y trazas deben provenir del experimento que acaba de suceder, no de dibujos decorativos.

Presentá primero un comportamiento interpretable; después una variación de una condición; finalmente una combinación. No cambies simultáneamente tantas variables que resulte imposible inferir la causa.

Cada familia de puzzles debe tener una experiencia segura, una aplicación significativa y una transferencia a otra geometría o contexto. No confundas completar un puzzle por azar con haber entendido. Registrá hipótesis pedagógicas verificables, pero no declares aprendizaje humano basándote sólo en un bot que llega a la salida.

La Bitácora formaliza después de la experiencia. Puede incluir nombres, unidades, esquemas, gráficos y ecuaciones opcionales. No exijas memorizar una fórmula, responder un cuestionario o tolerar un diálogo largo para continuar.

Los errores deben informar: mostrar dónde pasó el objeto, qué condición cambió y qué puede volver a intentarse. Ofrecé reinicio local rápido y ayudas progresivas. No reveles de inmediato la trayectoria ganadora.

Toda anomalía debe tener un contraste con condiciones familiares, dentro o fuera de la ciudad. El objetivo es transferir comprensión a la física real, no memorizar supersticiones de Physica.

## 5. Campaña y conceptos obligatorios

Diseñá una progresión completa, pero construí y validá cada familia antes de multiplicar escenarios. Los siguientes son resultados educativos, no nombres de capítulos obligatorios.

Introducción: referencia, posición, desplazamiento, tiempo, unidades, medición y vectores. Ejemplo: dos observadores describen de manera diferente un transporte en movimiento; el jugador coloca referencias y comprueba qué cambia.

MRU: distinguir distancia, tiempo y velocidad mediante transportes o cuerpos con movimiento uniforme. Preparar encuentros variando punto de partida, velocidad o instante de liberación. Comparar marcas espaciadas en intervalos iguales. No llamar MRU a cualquier movimiento aparentemente suave.

Fuerzas y rozamiento: inercia, fuerza neta, masa frente a peso, equilibrio y contactos. Superficies con diferente agarre, pendientes y plataformas móviles deben permitir descubrir cuándo la fricción ayuda y cuándo dificulta. No representar rozamiento negativo como si fuera fricción pasiva: una superficie motorizada debe mostrar su fuente de energía.

MRUV: investigar aceleración constante y distinguirla de velocidad constante. Variar fuerza, masa o inclinación bajo condiciones controladas. Separar el signo de la aceleración de la idea de «frenar». Las trazas temporales deben revelar cómo cambia el movimiento.

Tiro vertical: lanzamiento, ascenso, punto más alto y descenso. Diseñar una entrega a un receptor elevado que obligue a distinguir velocidad de aceleración. En el caso ideal de gravedad constante, la aceleración no desaparece en el punto más alto.

Tiro oblicuo: combinar componentes de lanzamiento para sortear obstáculos y alcanzar receptores. Introducir el caso ideal sin resistencia y con gravedad uniforme antes de alterar el campo. Diferenciar claramente ese modelo de trayectorias bajo fuerzas adicionales. Hacer que altura de salida, dirección y rapidez importen de formas observables.

Trabajo, energía e impulso: conectar rampas, contrapesos, resortes, frenado y colisiones cuando enriquezcan las familias anteriores. Identificar intercambios, pérdidas y aportes externos. No usar energía como una barra arbitraria sin relación con lo que sucede.

Óptica: sombras, propagación, reflexión y refracción mediante luz, espejos, medios transparentes y receptores. La escena debe permitir predecir un recorrido y reconocer por qué cambia. No confundir una ilusión de perspectiva de cámara con una propiedad óptica.

Cargas y campos: explorar atracción, repulsión, signo, intensidad y posición. Representar fuentes y respuesta de los cuerpos con un modelo explícito. Distinguir electrostática y magnetismo; no reducir todo a «imanes mágicos». No duplicar Ohmdal con un curso de circuitos.

Reservá oscilaciones, ondas, sonido, fluidos y térmica en una expansión identificada. No agregues física cuántica real sólo para justificar la ambientación: requiere modelos y objetivos propios. Primero completá las familias obligatorias anteriores.

Para cada familia documentá brevemente: concepto, condiciones del modelo, acción del jugador, error conceptual a evitar, señal observable, prueba de transferencia y estado de implementación.

## 6. Dirección artística, animación y sonido

Quiero naturaleza experimental tangible: dioramas de autor, agua protagonista, estratos y vegetación con identidad, instrumentos integrados y detalles que inviten a tocar. Elegí una gramática visual propia y sostenela.

No conviertas Physica en el cyberpunk de Bitland, en un reino medieval de Ohmdal ni en un fondo espacial lleno de electrones de adorno. Evitá el laboratorio blanco genérico, los cubos dispersos y el brillo que intenta disimular falta de arte.

El avatar debe tener silueta reconocible, personalidad y animaciones que comuniquen apoyo, esfuerzo, deslizamiento, suspensión y sorpresa. Mantené consistencia entre personaje, retratos e interfaz. Un cambio de gravedad debe sentirse en postura, orientación, contacto, cámara y sonido, sin volver ilegibles los controles.

La metrópolis comparte materiales y lenguaje visual con el exterior, pero ordena lo que antes parecía caótico: agua descendente, transportes previsibles, jardines, observatorios y dispositivos que se pueden investigar. La física familiar también debe ser divertida.

Componé vistas concretas y memorables. Antes de producir veinte áreas, conseguí una escena reconocible por su silueta, iluminación y fenómeno. El arte final debe verse durante el juego, no sólo en una captura preparada.

La interacción necesita respuesta audiovisual consistente: manipulación, arranque, contacto, fricción, cambio de medio, error y logro. Priorizá sonido útil y ambientes espaciales. Si no podés escuchar un resultado, no declares verificada su mezcla.

Usá assets originales o con licencia compatible y registrá procedencia. Las herramientas generativas son medios, no resultados garantizados. No copies assets de las referencias ni finjas disponer de herramientas que faltan.

## 7. Física, controles y accesibilidad

Separá conceptualmente estado físico, representación y ayudas de control. Cada cuerpo y grado de libertad debe tener una autoridad clara: no permitas que dos sistemas integren simultáneamente el mismo movimiento.

Usá pasos de simulación y tolerancias que permitan reproducibilidad y pruebas. Compará los modelos sencillos con soluciones conocidas. Las aproximaciones deben estar documentadas; los efectos cosméticos no pueden contradecir las mediciones.

Los cuerpos experimentales tienen prioridad científica. El avatar puede tener asistencia de locomoción, pero no debe convertirse en un falso instrumento de medición. No alteres secretamente trayectorias o parámetros para facilitar una solución.

Probá límites de campo, intersecciones, entrada rápida, objetos parcialmente dentro, reinicios y recuperación tras perder foco. Definí el comportamiento, en vez de dejarlo a resultados accidentales del motor.

Mantené cámara legible, oclusiones resueltas, controles enseñados y reinicios cercanos. Soportá teclado, mando y controles táctiles según las capacidades acordadas. Ofrecé movimiento reducido, señales redundantes y texto legible. No exijas precisión motora innecesaria para demostrar comprensión.

Objetivos iniciales de rendimiento: 60 FPS en el equipo de referencia de escritorio y un modo móvil estable de al menos 30 FPS en un dispositivo representativo. Son objetivos a medir, no resultados ya obtenidos. Reportá dispositivo, navegador, resolución y tiempos de cuadro; una ventana estrecha en escritorio no valida rendimiento móvil.

## 8. Hitos de producción

Hito A: una escena insignia de pocos minutos con cascada ascendente, controles convincentes, experimento seguro, interacción física y acabado audiovisual representativo. Primero debe funcionar; luego debe resultar deseable jugarla.

Hito B: primer episodio conectado, con duración objetivo de 45–75 minutos a contrastar con jugadores. Integra entrada, naturaleza experimental, progresión de mecánica y movimiento, descubrimiento espacial y un primer sector jugable de la metrópolis. No comprimas todo el temario dentro de esa duración.

Hito C: continuar la campaña con las familias pendientes, usando la ciudad y el exterior como contraste y sin degradar lo validado. Alcanzar la metrópolis o completar el primer episodio no significa terminar Physica.

Hito D: recorrido integral, coherencia artística, transferencia entre conceptos, accesibilidad, guardado, rendimiento y acabado de todas las familias obligatorias implementadas.

No expandas contenido para evitar pulir lo que ya existe. Tampoco te quedes eternamente perfeccionando una piedra mientras falta el recorrido. Elegí el mayor impedimento real para que el siguiente hito sea jugable y convincente.

## 9. Una iteración real de trabajo

En cada activación recuperá estado, último cambio aceptado y objetivo pendiente. No vuelvas a redactar el proyecto completo.

Primero ejecutá una comprobación del estado actual. Si hay una regresión, atendela antes de añadir contenido. Elegí un único resultado principal con criterio de aceptación observable: por ejemplo, que un objeto cruce un campo sin discontinuidad indebida y que el jugador pueda anticiparlo.

Implementá el cambio y ejecutá el juego. Recorré la interacción con los controles reales disponibles. Usá automatización de navegador y telemetría cuando existan. Una inspección de código no sustituye una prueba jugable.

Capturá evidencia útil: imagen o secuencia antes/después desde condiciones comparables, errores de consola, pruebas ejecutadas y mediciones pertinentes. Para movimiento, una imagen estática no basta: usá secuencias, trazas o video.

Pedí revisión a un evaluador con contexto separado cuando la herramienta lo permita. Debe recibir criterios, referencias y evidencias, no la celebración del implementador. Su trabajo es encontrar fallas concretas en jugabilidad, arte, física o pedagogía. Si no hay subagentes, hacé una revisión separada sin afirmar independencia inexistente.

Corregí los hallazgos de mayor impacto. Ejecutá las regresiones relevantes. Aceptá el cambio sólo si existe evidencia suficiente; de lo contrario, registralo como incompleto o revertí únicamente tus modificaciones defectuosas, preservando trabajo ajeno.

Dejá un checkpoint coherente y una actualización breve con: qué mejoró, dónde se comprueba, qué falla todavía y cuál es el próximo resultado. Terminá la iteración en un estado recuperable para el siguiente disparo del loop.

No lances escritores simultáneos sobre los mismos archivos. Paralelizá sólo trabajo realmente independiente. No abras servidores, navegadores o procesos nuevos en cada iteración sin cerrar o reutilizar los anteriores.

## 10. Pruebas y honestidad de calidad

Debe existir un recorrido end-to-end desde inicio limpio, pasando por interacciones y transiciones reales. Probá también reintentos, retorno, guardado/carga y recuperación de estados. Los atajos de desarrollo sirven para pruebas aisladas, no para fingir que una ruta es transitable.

Incluí pruebas para gravedad exterior/interior, continuidad de velocidad en cambios de aceleración sin impulso, superposición de zonas, MRU/MRUV, lanzamientos, contactos y comportamiento al variar la frecuencia de renderizado. Agregá pruebas de óptica y campos cuando esas familias estén implementadas.

No suprimas un test, escondas un error ni reduzcas criterios para obtener verde. Una corrección legítima del criterio debe explicarse y contrastarse con el modelo esperado, no con el código recién escrito.

Una build exitosa no demuestra buen juego. Una captura bonita no demuestra navegación. Un agente que resuelve no demuestra aprendizaje humano. Un promedio de FPS no descarta tirones. Separá claramente evidencia técnica, juicio artístico y validación con personas.

Las evaluaciones deben señalar escenas, instantes y problemas concretos. No aceptes «9/10», «AAA logrado» o «se ve profesional» sin comparación y evidencia. No inventes entrevistas, sensaciones de jugadores, mediciones, capturas ni pruebas que no ocurrieron.

Si falta acceso al navegador, reparación del entorno o una revisión humana, registrá exactamente qué queda bloqueado y continuá únicamente con lo verificable. No rebautices lo pendiente como terminado.

## 11. Continuidad, estancamiento y cierre

No pares al terminar el plan, compilar, generar arte o alcanzar una primera demo. Seguí los hitos y el backlog acotado de esta campaña.

Si varias iteraciones no mejoran un problema, reproducilo, revisá la hipótesis y simplificá el sistema responsable. No repitas indefinidamente el mismo parche ni respondas al estancamiento añadiendo contenido no pedido.

Respetá límites de uso y permisos. Ante un límite externo, dejá un checkpoint y el comando concreto para retomar; no cambies a facturación adicional ni eludas restricciones. «Podés iterar todo el día» es permiso de tiempo, no de gasto ilimitado.

Cuando el alcance obligatorio esté implementado y las pruebas automatizables hayan pasado, prepará una candidata para evaluación humana con recorrido, controles, evidencias, fallas conocidas y preguntas específicas sobre claridad y diversión. No te autoproclames AAA ni aprendizaje validado.

Si sólo queda validación humana, comunicá ese estado una vez y suspendé el loop correspondiente mediante la herramienta real disponible; no sigas haciendo cambios arbitrarios para consumir tiempo. Si no podés suspenderlo, indicá cómo detenerlo y dejá las activaciones siguientes sin mutaciones.

En esta primera ejecución realizá la preparación y una iteración completa con evidencia. En las siguientes, retomá desde el estado persistente. Cada vuelta debe acercar Physica a una experiencia mejor para el jugador, no simplemente dejar más archivos.
