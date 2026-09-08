# PROYECTO ROXANA — PHYSICA
## Master Game Design Document · AAA Quality Bar · v1

**Rama de producción:** `physica/aaa-gdd-clean`  
**Fecha:** 2026-09-08  
**Estado:** PREPRODUCTION MASTER / fuente de verdad de Physica para esta rama  
**Verbo nuclear:** **EXPERIMENTAR**  
**Disciplina:** Física  
**Plataforma objetivo:** Web PC + mobile/touch, con arquitectura compatible con el Instituto Roxana  
**Idioma base:** Español  
**Documento único de diseño agregado en esta rama:** sí  

> **North Star:** antes de poder escribir una ecuación, el jugador debe haber sentido la relación física con su cuerpo, un objeto, una máquina o un fenómeno del mundo.

> **Promesa:** Physica no es una colección de simuladores escolares ni un plataformas con preguntas. Es una aventura de exploración y puzzles sistémicos en la que comprender leyes locales vuelve transitable un mundo imposible.

---

# 0. Contrato de este documento

Este GDD consolida, eleva y cuando corresponde reabre las decisiones históricas de Physica. En la rama `physica/aaa-gdd-clean`, este archivo gobierna la producción de Physica salvo conflicto explícito con los pilares globales de Proyecto Roxana.

Los documentos previos de `docs/20-worlds/physica/**` son **material de investigación y trazabilidad**, no requisitos acumulativos. El código y los prototipos Babylon/Three existentes son **baselines de aprendizaje**, no deuda obligatoria que deba preservarse a costa de una mejor experiencia.

### 0.1 Decisiones que NO se reabren sin evidencia extraordinaria

- Physica debe ser un juego deseable aunque se elimine la palabra “educativo”.
- El conocimiento se demuestra actuando sobre el mundo.
- La secuencia pedagógica base es: **fenómeno → acción → consecuencia → hipótesis → nueva prueba → formalización → reutilización**.
- El fallo devuelve información observable; nunca un “incorrecto” vacío.
- La abstracción, el número y la fórmula se ganan después de la experiencia.
- El verbo nuclear es **EXPERIMENTAR**.
- No hay combate convencional como loop central.
- La Física pedagógica autoritativa no puede depender de comportamientos opacos o inestables de un motor de rigid bodies.
- La tercera dimensión se usa sólo cuando compra comprensión, diseño o espectáculo sin perjudicar legibilidad.
- El mundo puede ser extraño; la física que se pretende enseñar debe ser rigurosa y las excepciones ficticias deben estar explícitamente delimitadas.

### 0.2 Decisiones abiertas a Astra / dirección de producción

Astra tiene libertad para proponer mejoras de **motor, cámara, arte, representación del protagonista, companion, layout, pacing, shaders, pipeline y arquitectura**, siempre que conserve los invariantes anteriores y demuestre que la alternativa mejora calidad, comprensión, rendimiento o mantenibilidad.

Babylon.js + modelos analíticos + Havok es el **baseline actual**, no una religión. Cualquier cambio de motor debe justificar costo de migración, web delivery, determinismo, tooling, performance, accesibilidad y coexistencia con el Instituto.

---

# 1. Elevator pitch

El jugador atraviesa el Aula de Física del Instituto Roxana y llega a un valle monumental donde una cascada asciende hacia las nubes mientras una piedra, soltada a centímetros de ella, cae normalmente. Nada explota. Nadie grita. El mundo simplemente obedece dos configuraciones distintas.

Physica fue intervenido durante generaciones por docentes que necesitaban aislar variables, exagerar fenómenos y volver visible lo que en un aula real sería rápido, peligroso, invisible o costoso. El problema no es que Physica se haya roto: **funciona demasiado bien**. Sus configuraciones se superpusieron y ya nadie conserva un mapa fiable de las condiciones que gobiernan cada región.

El jugador reconstruye ese mapa experimentando. Aprende a observar antes de medir, a medir antes de nombrar, a predecir antes de tocar y a distinguir una regularidad local de una ley universal. Con cada región comprendida, el mundo no “se cura”: **se vuelve legible, seguro y reutilizable**.

La campaña culmina cuando el jugador ya no necesita que el juego le diga qué variable mirar: puede enfrentarse a una anomalía compuesta, diseñar un experimento, aislar causas y justificar una intervención. El premio final no es borrar las rarezas de Physica, sino convertirlas de nuevo en un laboratorio vivo.

---

# 2. Fantasía del jugador

> “Al principio parece magia. Después descubro un patrón. Pruebo una idea, me equivoco de una forma útil, ajusto una variable y termino pudiendo predecir qué va a pasar antes de tocar nada.”

La fantasía combina cinco identidades:

1. **Explorador:** llega por curiosidad, no por una lista de ejercicios.
2. **Experimentador:** modifica una variable y compara consecuencias.
3. **Ingeniero improvisado:** usa fuerzas, rampas, palancas, cuerdas, fluidos, lentes y ondas como herramientas.
4. **Arqueólogo operacional:** reconstruye configuraciones dejadas por generaciones anteriores.
5. **Restaurador:** el conocimiento deja cambios persistentes en el mundo.

La progresión dominante es **conocimiento + nuevas formas de leer y manipular**, no estadísticas de personaje.

---

# 3. Objetivos de producto

## 3.1 Quality bar “AAA”

“AAA” se usa como **barra de calidad**, no como promesa de presupuesto o volumen. Physica debe buscar:

- dirección artística propia y reconocible en una captura;
- animación, cámara, audio y feedback que hagan satisfactorio simplemente moverse;
- puzzles legibles y robustos, sin soluciones frágiles;
- producción audiovisual con encuadres autorales;
- estados de mundo persistentes y memorables;
- accesibilidad pensada desde diseño, no agregada al final;
- rendimiento web sólido;
- onboarding sin exposición escolar;
- pedagogía validada con playtests reales;
- cero sensación de “edutainment de premio consuelo”.

## 3.2 Scope recomendado

**Campaña principal:** 12–16 h.  
**Exploración + retos de maestría:** 20–30 h.  
**Gold/Vertical Slice:** 45–75 min.  
**Sesión cómoda:** 20–45 min.  

La campaña puede entregarse por arcos. Cada arco debe sentirse completo por sí mismo y dejar un cambio visible en Physica y en el Instituto.

## 3.3 Público

- Entrada: adolescentes y adultos desde cero.
- Núcleo curricular: secundaria argentina, con especial atención a Provincia de Buenos Aires y escuela técnica.
- Profundidad opcional: nivel cuantitativo suficiente para estudiantes que quieran usar ecuaciones, gráficos y optimización.
- El juego no presupone amor previo por la Física.

---

# 4. Pilares de experiencia

## P1 — Fenómeno antes que nombre

La cascada sube antes de que exista la palabra “aceleración”. Una cuerda vibra antes de que exista la palabra “frecuencia”. Un haz se desvía antes de que aparezca “refracción”.

## P2 — Cuerpo antes que fórmula

El jugador corre, cae, empuja, arrastra, lanza, balancea y escucha. La ecuación entra cuando ya tiene una intuición que formalizar.

## P3 — Predecir es la verdadera maestría

Resolver una vez puede ser suerte. Comprender significa poder anticipar un resultado bajo una variación nueva.

## P4 — Fallar enseña

La solución incorrecta produce una trayectoria, oscilación, deformación, temperatura, sonido o distribución visible que explica el error sin verbalizarlo.

## P5 — Una anomalía es local

Cada excepción ficticia tiene frontera, sustancia, rango o condición. Se prohíben “leyes mágicas globales” no legibles.

## P6 — Varias soluciones cuando la Física lo permita

La validación es por condiciones finales y seguridad, no por secuencia exacta.

## P7 — El conocimiento transforma

Puentes se estabilizan, canales vuelven a fluir, estaciones recuperan función, rutas se abren, observatorios se calibran y el Aula de Física cambia.

## P8 — Belleza antes que deber

La primera razón para avanzar es “quiero ver qué hay ahí”, no “me falta completar movimiento rectilíneo”.

---

# 5. Anti-pilares

Physica **no** será:

- un Mario con fórmulas;
- una colección de minijuegos desconectados;
- un banco de laboratorio con botones UI como acción primaria;
- un quiz con skin de videojuego;
- un sandbox de física universal;
- un precision platformer;
- un juego de puntería fina;
- un simulador donde lo importante se oculta detrás de números;
- un museo donde NPCs recitan teoría;
- una cadena curricular trasladada uno-a-uno a niveles.

---

# 6. Core loop

**OBSERVAR → INTENTAR → ESTIMAR → MODIFICAR → EJECUTAR → COMPARAR → EXPLICAR → REUTILIZAR**

### 6.1 Loop de 20 segundos

1. El jugador ve un comportamiento extraño o un objetivo físico.
2. Manipula un objeto o su propio cuerpo.
3. El mundo responde inmediatamente.
4. El jugador ajusta una variable y reintenta.

### 6.2 Loop de 3–8 minutos

1. Descubre la variable relevante.
2. Formula una predicción implícita.
3. Ejecuta un experimento controlado.
4. Compara contra un caso anterior.
5. Resuelve por condiciones.
6. El entorno cambia y abre una nueva lectura.

### 6.3 Loop de arco

1. Fenómeno imposible.
2. Herramienta física nueva.
3. Uso intuitivo.
4. Variaciones y errores productivos.
5. Instrumentación opcional.
6. Formalización en Bitácora.
7. Puzzle de transferencia en contexto distinto.
8. Restauración persistente.

---

# 7. Verbos jugables

**Locomoción:** caminar, correr, saltar, caer, trepar, deslizar.  
**Manipulación:** agarrar, cargar, empujar, tirar, rotar, soltar, lanzar.  
**Construcción:** apoyar, calzar, acoplar, tensar, anclar, redirigir.  
**Experimentación:** observar, comparar, marcar, medir, repetir, cambiar una variable.  
**Fenómenos posteriores:** balancear, comprimir, bombear, reflejar, refractar, sintonizar, aislar, transferir calor.

Los controles motrices se diseñan con tolerancia generosa. La dificultad debe vivir en **qué hacer**, no en ejecutar un input perfecto.

---

# 8. Gramática de puzzles

Physica trabaja con familias combinables:

| ID | Familia | Acción dominante | Física principal |
|---|---|---|---|
| F1 | Alcanzar | mover el cuerpo | cinemática / gravedad |
| F2 | Lanzar | velocidad inicial | tiro / campos |
| F3 | Transportar | mover un cuerpo con restricciones | masa / fricción / estabilidad |
| F4 | Balancear | compensar acciones | resultante / torque |
| F5 | Deslizar | usar pendiente y superficie | componentes / fricción |
| F6 | Transferir | chocar / transmitir | impulso / cantidad de movimiento / energía |
| F7 | Almacenar | elevar / comprimir / tensar | energía potencial |
| F8 | Estabilizar | sostener frente a perturbación | equilibrio / centro de masa |
| F9 | Construir | combinar piezas | estática / función estructural |
| F10 | Redirigir | cambiar trayectoria o fuerza | vectores / reflexión mecánica |
| F11 | Resonancia | sintonizar | ondas / oscilaciones |
| F12 | Luz | encaminar haz | óptica geométrica |
| F13 | Flotar | modificar densidad/desplazamiento | Arquímedes / presión |
| F14 | Fluir | controlar canal/sección/presión | fluidos |
| F15 | Transferir calor | conectar/aislar fuentes | térmica |
| F16 | Rotar | cambiar brazo/inercia | torque / momento angular |

### 8.1 Anatomía mínima de un puzzle

Todo puzzle especifica:

- estado inicial observable;
- estado objetivo verificable;
- variables físicamente modificables;
- acciones disponibles;
- al menos un resultado de fallo informativo;
- validación por condiciones;
- reset rápido o reversibilidad;
- una transferencia o variación posterior que detecte comprensión real.

### 8.2 Dificultad legítima

Sube por:

- más variables relevantes;
- mayor distancia entre causa y efecto;
- necesidad de anticipación;
- sistemas simultáneos;
- restricciones de recursos;
- información incompleta pero inferible;
- combinación de conceptos;
- múltiples soluciones con trade-offs;
- optimización opcional.

No sube escondiendo información arbitrariamente ni reduciendo tolerancias de input.

---

# 9. Modelo pedagógico

## 9.1 Secuencia POE extendida

Physica adopta una variante jugable de **Predict–Observe–Explain**:

1. **Predict / Predecir:** el jugador se compromete con una expectativa mediante su acción, orientación, ubicación o configuración; no hace falta una pregunta textual.
2. **Observe / Observar:** el mundo ejecuta la consecuencia de manera legible.
3. **Explain / Explicar:** el jugador modifica su modelo mental y lo demuestra en una segunda situación.
4. **Transfer / Transferir:** una variante rompe la memorización superficial.
5. **Formalize / Formalizar:** la Bitácora nombra y representa lo ya vivido.

La literatura de educación científica reporta efectos positivos de POE, pero Physica no asume que la estrategia por sí sola garantice aprendizaje: cada concepto se valida con playtest y evaluación conceptual.

## 9.2 Interactive engagement

La interacción no es adorno: el estudiante/jugador debe decidir, predecir y comparar. Se privilegia actividad conceptual sobre exposición. Los puzzles deben producir conversaciones internas del tipo “si cambio esto, entonces…”.

## 9.3 Conceptual change

Cada unidad identifica concepciones alternativas frecuentes y construye **situaciones de contraste**. Ejemplos:

- “si no se mueve, no hay fuerzas” → objeto suspendido con acciones opuestas;
- “más pesado cae más rápido” → comparación de cuerpos en caída idealizada;
- “se necesita fuerza para mantener velocidad constante” → movimiento con fricción reducida;
- “la rampa reduce el trabajo total” → misma energía potencial, distinta fuerza/distancia;
- “el calor es una sustancia” → transferencia y equilibrio térmico;
- “el sonido viaja porque el objeto ‘manda’ sonido” → onda como perturbación del medio.

## 9.4 Cognitive load

- una variable nueva importante por beat temprano;
- representaciones simultáneas sólo después de intuición;
- UI diegética opcional y progresiva;
- ejemplos trabajados sólo en Bitácora y después de experiencia;
- evitar texto + gráfico + voz diciendo exactamente lo mismo;
- segmentar puzzles compuestos en subsistemas visibles antes de combinarlos.

## 9.5 Retrieval + spacing sin quiz

La recuperación se integra mediante **reuso de una ley en un contexto diferente**. Una rampa aprendida en roca reaparece después en una balsa; resonancia reaparece en una torre; refracción reaparece en un canal con capas de fluido. No hace falta preguntarle al jugador “¿recordás la fórmula?”.

## 9.6 Universal Design for Learning

El diseño ofrece múltiples vías de:

- **representación:** animación, sonido, trayectoria, vibración, símbolo opcional;
- **acción/expresión:** distintas soluciones físicas y alternativas de control;
- **compromiso:** exploración, misterio, optimización, coleccionables de observación, objetivos opcionales.

Nunca depender exclusivamente del color, del audio, de un gesto fino o de tiempo de reacción para transmitir un concepto obligatorio.

---

# 10. Currículo objetivo y arquitectura académica

Physica toma como marco los **NAP nacionales de Ciencias Naturales**, los diseños curriculares bonaerenses de Física/Introducción a la Física y el currículo científico-tecnológico de Educación Secundaria Técnica. El currículo es **cobertura**, no orden de niveles.

## 10.1 Capas de profundidad

### Capa A — Intuición (obligatoria)

Reconocer patrones, predecir cualitativamente y actuar.

### Capa B — Representación (obligatoria liviana)

Trayectorias, flechas, escalas, gráficos simples, unidades y comparación.

### Capa C — Formalización (opcional para avanzar, disponible siempre después de experiencia)

Ecuaciones, despejes, proporcionalidad, unidades, gráficos cuantitativos.

### Capa D — Maestría (opcional)

Optimización, estimación, incertidumbre, combinación de modelos y problemas cercanos a situaciones reales.

---

# 11. Campaña completa: de principio a fin

## PRÓLOGO — “La caída imposible”

**Lugar:** Aula de Física → Cornisa del Valle Variable.  
**Duración:** 20–30 min.  
**Objetivo emocional:** asombro + curiosidad.  
**Concepto invisible:** observar no es explicar.

El jugador cruza desde el Instituto. La cámara revela una cascada ascendiendo hasta nubes bajas. Una piedra cae. Hojas caen. El agua sube. El jugador puede arrojar dos piedras, caminar hasta la frontera del fenómeno y descubrir que la anomalía afecta al agua, no al espacio entero.

No se normaliza inmediatamente. El premio es **delimitar** el comportamiento y abrir la primera entrada de campo.

**Aprendizaje:** identificar cuerpo, región, variable y referencia antes de nombrar una ley.

---

## ARCO I — MOVIMIENTO / “El Valle Variable”

**Conceptos:** posición, desplazamiento, trayectoria, rapidez, velocidad, aceleración, MRU, MRUV, caída, sistema de referencia.  
**Juguetes:** piedras, plataformas móviles, marcadores de trayectoria, cronómetro, huellas temporales.  
**Biomas:** cornisa, valle de plataformas, río persistente, canal de caída.

### Beats

1. Dos rutas a igual destino: tiempo vs distancia.
2. Plataformas que comparten velocidad: moverse “quieto” respecto de otra referencia.
3. Río que nunca desacelera en una región sin disipación visible.
4. Caída de objetos con comparación de tiempos.
5. Trayectoria fantasma activada sólo después de varios intentos.
6. Puzzle integrador: sincronizar una entrega entre dos referencias móviles.

**Concepción a desafiar:** reposo y movimiento son absolutos.  
**Restauración:** se fija una red de balizas móviles que vuelve navegable el Valle.

---

## ARCO II — FUERZAS / “Los Contrapesos”

**Conceptos:** fuerza como interacción, resultante, leyes de Newton, masa, peso, normal, tensión, rozamiento, equilibrio, plano inclinado.  
**Juguetes:** contrapesos, cuerdas, poleas fijas, rampas, superficies intercambiables, carros.

### Beats

1. INSTRUMENTO suspendido entre dos corrientes opuestas: quietud activa.
2. Carro que continúa al desaparecer fricción apreciable.
3. Mismo empuje sobre masas diferentes.
4. Comparar peso y masa en zonas con distinta `gLocal` ficticia y claramente delimitada.
5. Rampa: menor fuerza instantánea, mayor recorrido.
6. Construcción con tensión y normal visibles sólo a través del módulo de lectura ganado.

**Concepciones a desafiar:** “si está quieto no actúa nada”; “una fuerza sostiene necesariamente la velocidad”; “más masa implica más velocidad de caída”.  
**Restauración:** se reabre el paso al Desfiladero de los Contrapesos.

---

## ARCO III — TRABAJO Y ENERGÍA / “Jardines de Reserva”

**Conceptos:** trabajo, energía cinética, potencial gravitatoria, elástica, conservación, disipación, potencia, rendimiento.  
**Juguetes:** resortes, péndulos, pesos elevables, ruedas de inercia, compuertas, frenos.

### Beats

1. Un jardín mecánico sólo florece cuando un sistema recibe energía de manera adecuada.
2. Resorte visible y manipulable antes de mostrar `k`.
3. Misma energía potencial alcanzada por caminos con fuerza diferente.
4. Conversión altura ↔ velocidad.
5. Pérdidas por rozamiento que aparecen como calor/sonido, no como “energía desaparecida”.
6. Puzzle de potencia: misma tarea, diferente tiempo de transferencia.

**Restauración:** la Estación de Reserva vuelve a alimentar ascensores y canales del mundo.

---

## ARCO IV — IMPULSO, ROTACIÓN Y MÁQUINAS / “Las Canteras Orbitantes”

**Conceptos:** impulso, cantidad de movimiento, colisiones, torque, brazo de palanca, centro de masa, rotación, máquinas simples.  
**Juguetes:** carros acoplables, discos, palancas, poleas móviles, engranajes visuales no eléctricos, volantes.

### Beats

1. Choques de cuerpos con masas distintas y resultados legibles.
2. Colisión elástica vs inelástica mediante materiales.
3. Puerta imposible de mover desde cerca del eje y trivial desde lejos.
4. Centro de masa como criterio de estabilidad.
5. Polea que intercambia fuerza por recorrido.
6. Capstone: orientar un puente rotatorio con múltiples soluciones.

**Restauración:** las Canteras recuperan transporte mecánico seguro.

---

## ARCO V — FLUIDOS / “Los Canales Suspendidos”

**Conceptos:** densidad, presión, hidrostática, Pascal, Arquímedes, caudal, continuidad; Bernoulli sólo donde sea pedagógicamente claro.  
**Juguetes:** recipientes, compuertas, pistones, flotadores, lastres, sifones curados, canales.

### Beats

1. Un objeto enorme flota mientras uno pequeño se hunde: tamaño ≠ densidad.
2. Presión con profundidad mostrada por membranas equivalentes.
3. Prensa hidráulica corporal.
4. Flotabilidad por volumen desplazado.
5. Control de caudal con secciones visibles.
6. Capstone: estabilizar una ciudad flotante sin “agregar fuerza mágica”.

**Restauración:** el sistema de canales conecta regiones antes aisladas.

---

## ARCO VI — ONDAS Y SONIDO / “Las Torres Resonantes”

**Conceptos:** oscilación, período, frecuencia, amplitud, longitud de onda, propagación, interferencia, resonancia, reflexión, sonido, intensidad, Doppler de forma cualitativa/medible.  
**Juguetes:** cuerdas, campanas, membranas, tubos, péndulos acoplados, emisores y receptores.

### Beats

1. Hacer visible una onda mediante material y partículas secundarias.
2. Misma frecuencia con amplitud distinta.
3. Cambiar tensión/longitud para sintonizar.
4. Interferencia como geometría observable.
5. Resonancia que abre una estructura sólo después de descubrir su respuesta natural.
6. Audio espacial como información, con alternativa visual/háptica completa.

**Restauración:** las Torres vuelven a comunicarse por señales acústicas/ondulatorias.

---

## ARCO VII — ÓPTICA / “El Distrito de Luz”

**Conceptos:** propagación rectilínea, reflexión, refracción, índice, lentes, formación de imagen, color y espectro.  
**Juguetes:** espejos, prismas, lentes, filtros, recipientes con medios diferentes, cámaras oscuras.

### Beats

1. Luz como haz espacial, no línea de libro.
2. Reflexión por orientación física.
3. Refracción al cruzar materiales.
4. Lentes convergentes/divergentes con focos descubiertos por experimentación.
5. Color/espectro mediante separación y recomposición.
6. Capstone: reconstruir una imagen a través de un sistema óptico incompleto.

**Cruce con Ohmdal:** la óptica puede tocar sensores, pero no enseña circuitos ni electrónica aquí.  
**Restauración:** observatorios y señalización de la Metrópoli vuelven a funcionar.

---

## ARCO VIII — TÉRMICA / “El Anillo Irreversible”

**Conceptos:** temperatura, equilibrio térmico, calor como transferencia, conducción, convección, radiación, cambios de fase, trabajo térmico, primera ley, irreversibilidad/segunda ley a nivel conceptual.  
**Juguetes:** bloques materiales, aislantes, radiadores, fluidos convectivos visibles, pistones, cámaras de fase.

### Beats

1. Dos cuerpos llegan a equilibrio sin “mezclar cantidades de calor” como sustancia.
2. Materiales con conductividad distinta.
3. Convección visible por trazadores.
4. Radiación sin contacto.
5. Cambio de fase con meseta térmica.
6. Sistema que puede volver a un estado energético similar pero no deshacer espontáneamente todo su historial.

**Restauración:** el Anillo Climático deja de oscilar peligrosamente y queda controlable.

---

## ARCO IX — CLÁSICA + MODERNA / “El Observatorio de Escalas”

**Conceptos:** límites de modelos clásicos, escalas, ondas electromagnéticas, introducción conceptual a modelos modernos; contenido avanzado opcional.  
**Objetivo:** enseñar que un modelo puede ser excelente en su dominio sin ser universal.

No se convierte en un curso de física cuántica. El arco existe para cerrar epistemológicamente la campaña: **modelar es elegir qué variables importan y declarar dónde el modelo deja de alcanzar**.

**Restauración:** el Atlas de Condiciones recupera sus escalas y dominios.

---

## FINAL — “La Metrópoli de las Condiciones”

El jugador entra por primera vez a una zona donde varias configuraciones conviven: un tren cruza referencias móviles; un canal cambia presión; una torre vibra; lentes redirigen una señal; un intercambiador térmico protege una estación.

No hay una secuencia única. El jugador debe:

1. observar el sistema completo;
2. elegir un subsistema;
3. aislar una variable;
4. diseñar un experimento;
5. predecir;
6. intervenir;
7. comprobar que la solución no rompe otra función.

El final revela la intención de los docentes: Physica nunca debía ser “normal”. Debía ser un lugar donde las leyes pudieran verse. El error histórico fue perder la trazabilidad.

**Decisión final del jugador:** no borrar las anomalías. Crear un **Atlas vivo de condiciones**, registrar fronteras y dejar cada región utilizable para quienes vengan después.

Al regresar al Instituto, el Aula de Física ya no muestra un portal averiado: contiene una maqueta viva de Physica y la Bitácora puede reproducir experimentos dominados. El mundo queda abierto para maestría y futuras integraciones interdisciplinarias.

---

# 12. Matriz curricular resumida

| Dominio | Intuición obligatoria | Representación | Formalización opcional | Puzzle de transferencia |
|---|---|---|---|---|
| Medición | comparar antes de nombrar | escala / incertidumbre cualitativa | unidades, error | elegir instrumento adecuado |
| Cinemática | cambio de posición en tiempo | trayectoria, x-t, v-t | MRU/MRUV | plataforma móvil |
| Referencia | movimiento depende del observador | ejes / velocidad relativa | resta vectorial simple | tren + carga |
| Dinámica | cambios de movimiento tienen causa | fuerzas sobre un cuerpo | ΣF = ma | carro con masa variable |
| Equilibrio | quietud puede ser activa | vectores opuestos | ΣF = 0 | suspensión múltiple |
| Fricción | superficie cambia respuesta | fuerza resistente | modelos simples | rampa + transporte |
| Energía | capacidad de producir cambios se transfiere | barras/flujo posterior | K, Ug, Ue, W | resorte + altura |
| Potencia | misma tarea, distinto ritmo | energía/tiempo | P = W/t | elevador |
| Momento | una colisión redistribuye movimiento | antes/después | p = mv, impulso | cadena de carros |
| Rotación | distancia al eje importa | brazo/torque | τ = r×F | puente rotatorio |
| Fluidos | flotar depende de densidad/desplazamiento | presión/profundidad | p, empuje | balsa con lastre |
| Ondas | perturbación se propaga | fase, amplitud, λ | v=fλ | resonancia remota |
| Óptica | dirección cambia en interfaces | rayos ganados | Snell/lentes simple | imagen óptica |
| Térmica | calor es transferencia | flujo térmico | Q, balances simples | aislamiento + tiempo |
| Modelos | toda ley tiene dominio | mapa de validez | aproximaciones | capstone multiescala |

---

# 13. La Bitácora

La Bitácora es un **cuaderno de campo**, no un manual.

Cada entrada puede atravesar estos estados:

1. **Observación:** “el agua sube; la piedra cae”.
2. **Comparación:** captura dos casos.
3. **Hipótesis:** formulada implícitamente o con tags simples, nunca examen.
4. **Prueba:** replay o mini-trayectoria del experimento.
5. **Síntesis:** frase conceptual posterior.
6. **Formalización:** nombre, unidades, gráfico, ecuación opcional.
7. **Transferencia:** dónde volvió a aparecer la idea.

### 13.1 Regla de oro

La Bitácora **no desbloquea la solución**. Desbloquea lenguaje para describir lo que el jugador ya logró observar.

### 13.2 Revisión espaciada

Al volver a una idea en otro arco, la Bitácora no muestra la respuesta; recupera una captura vieja y deja que el jugador reconozca el patrón.

---

# 14. Reloj-dispositivo / instrumento de lectura

El reloj es una pieza física del Instituto y crece por módulos. Debe sentirse como una herramienta, no como HUD mágico.

Módulos posibles:

- cronómetro;
- distancia;
- trayectoria fantasma;
- vector relativo;
- aceleración cualitativa;
- anclaje de referencia;
- osciloscopio visual simplificado para ondas;
- termómetro / mapa térmico;
- lectura óptica de ángulos;
- presión / profundidad.

**Principio:** primero se ve el fenómeno a ojo. Después se gana el instrumento que permite medirlo mejor.

---

# 15. Companion — “INSTRUMENTO” (nombre final abierto)

## 15.1 Función

- acompaña emocionalmente;
- mide y reacciona;
- puede convertirse en objeto físico de algunos puzzles;
- nunca recita teoría;
- nunca resuelve un puzzle;
- puede equivocarse al extrapolar una medición local, mostrando que medir no equivale a comprender.

## 15.2 Silueta

Base recomendada:

- núcleo esférico;
- lente central;
- anillo giroscópico/astrolabio;
- aguja o contrapeso visible;
- piezas retráctiles;
- módulos acoplables sin perder lectura de silueta.

Debe funcionar en una tinta, icono pequeño, sprite/mesh y objeto imprimible.

## 15.3 Personalidad

Preciso, curioso, algo obsesivo con poder medir, pero no pedante. El humor nace de su relación literal con fenómenos físicos, no de burlarse del estudiante.

Ejemplo de tono permitido, posterior a una situación ya entendida:

> “Puedo confirmar que estamos quietos. Respecto de nosotros. Es un comienzo.”

Evitar chistes que introduzcan vocabulario antes de tiempo o que expliquen la mecánica.

---

# 16. Narrativa y tono

## 16.1 Tono dominante

- maravilla científica;
- serenidad contemplativa;
- misterio arqueológico;
- humor físico leve;
- emoción por restaurar algo útil, no por derrotar a alguien.

## 16.2 Antagonismo

No hay villano tradicional. El antagonismo es:

- opacidad de condiciones;
- generalización apresurada;
- configuraciones superpuestas;
- consecuencias sistémicas no previstas.

## 16.3 Reglas de escritura

- un personaje no explica lo que la animación puede mostrar;
- diálogo corto durante exploración;
- teoría sólo en capa formal posterior;
- el misterio global jamás interrumpe un experimento;
- la voz del Instituto aparece en cierres emocionales, no como profesor flotante.

---

# 17. Dirección artística — “Painterly Physical 2.5D”

Physica debe tener una identidad propia dentro de Roxana. La recomendación es una mezcla de **escenarios 3D curados, materiales pintados/estilizados, lectura gráfica fuerte y composición cinematográfica 2.5D**, con libertad para mantener personajes como sprites, meshes estilizados o una solución híbrida si el resultado es coherente.

La referencia a HD-2D es **técnica y compositiva**, no una orden de copiar el look de Square Enix.

## 17.1 Qué extraer de cada referencia

### OCTOPATH TRAVELER II

**Extraer:** combinación de elementos gráficos tradicionales con 3D, iluminación atmosférica, capas de profundidad, siluetas claras, miniaturas que se sienten dioramas vivos.  
**No copiar:** pixel scale, personajes, UI, paleta o arquitectura.

Referencia oficial:  
https://es.store.square-enix-games.com/octopath-traveler-ii

### DRAGON QUEST III HD-2D REMAKE

**Extraer:** legibilidad de mundo 3D con personajes estilizados, escala de pueblos/espacios, uso controlado de profundidad de campo. El propio equipo reportó que exceso de blur perjudicaba la lectura: en Physica el fenómeno pedagógico jamás puede quedar fuera de foco por estética.  
**No copiar:** framing JRPG, personajes, tiles o identidad visual.

Entrevista de producción:  
https://blog.playstation.com/?p=398105

### INSIDE

**Extraer:** iluminación puesta al servicio de cámara y gameplay, detalle controlado por distancia, escenas simples que parecen sofisticadas por composición y luz.  
**No copiar:** tono opresivo, monocromía, personaje o situaciones.

Referencia técnica:  
https://blog.playdead.com/articles/the_lighting_of_inside/lighting_of_inside.html

### Planet of Lana

**Extraer:** “painting in motion”, mezcla de elementos 2D/3D, textura pintada, foreground/background y personaje que siempre destaca del entorno.  
**No copiar:** paleta, companion, diseño de Lana ni composición de escenas.

Referencia de arte:  
https://www.gamedeveloper.com/business/exploring-the-art-and-animation-behind-hand-painted-odyssey-i-planet-of-lana-i-

Video de gameplay oficial Xbox:  
https://www.youtube.com/watch?v=N5pxbO1bxTM

### Trine 5

**Extraer:** staging 2.5D de puzzles, profundidad rica sin perder el plano de interacción, paisajes espectaculares, lectura de props interactivos.  
**No copiar:** fantasía, combate, héroes, magia o materiales.

Página oficial:  
https://www.frozenbyte.com/games/trine-5-a-clockwork-conspiracy/

Release trailer:  
https://youtu.be/ifQCsZyVeuE

### Outer Wilds

**Extraer:** curiosidad como motor, conocimiento como progresión, preguntas que nacen de observar el mundo.  
**No copiar:** loop temporal, astronomía, estética, estructura planetaria.

Entrevista de pilares de diseño:  
https://www.gameskinny.com/culture/interview-8-questions-with-creative-director-and-producer-of-mobius-games-developer-of-outer-wilds/

## 17.2 Materiales de Physica

**Naturaleza:** roca sedimentaria, agua, madera, arcilla, arena, hojas, niebla, cristales naturales.  
**Instrumentación:** cobre, latón, acero pavonado, vidrio, cerámica, papel, tinta, esmalte.  
**Tecnología del Instituto:** analógica legible, tornillos, escalas, anillos, marcas de calibración; evitar “holograma azul genérico”.

## 17.3 Paleta por función

No fijar colores absolutos hasta concept art. Sí fijar función:

- fondo atmosférico: saturación baja;
- elementos navegables: contraste medio;
- interactivos: lectura material + movimiento, no glow permanente;
- fenómeno activo: contraste local alto;
- overlays del reloj: alto contraste y redundancia de forma/patrón.

## 17.4 Escala visual

La cámara debe alternar:

- íntimo: manipulación y lectura corporal;
- medio: puzzle completo visible;
- monumental: recompensa/revelación.

La cascada ascendente debe ser el **key art vivo** de apertura.

---

# 18. Cámara y cinematografía

## 18.1 Regla dimensional

- **2.5D por defecto** cuando el fenómeno se entiende en un plano.
- carriles/profundidad limitada cuando agrega comparación espacial;
- 3D real sólo cuando la tercera dimensión sea parte material del concepto.

## 18.2 Cámara pedagógica

La cámara nunca puede ocultar:

- causa y efecto esenciales;
- frontera de una anomalía;
- punto de apoyo/fulcro;
- objeto de comparación;
- trayectoria que el jugador necesita leer.

## 18.3 Lenguaje de planos

- **Close gameplay:** avatar 25–35% de alto, manipulación fina.
- **Puzzle frame:** sistema completo entra en pantalla.
- **Discovery wide:** avatar 8–15%, revela escala.
- **Measurement hold:** cámara estable; evita movimientos que deformen percepción.
- **Success reveal:** dolly/pan suave mostrando transformación persistente.

`prefers-reduced-motion` reemplaza dolly y shake por transiciones estáticas equivalentes.

---

# 19. Animación y game feel

El movimiento debe ser bueno antes de cualquier puzzle.

- aceleración/desaceleración del avatar legible;
- coyote time y jump buffer generosos;
- agarrar/empujar con anticipaciones cortas y claras;
- objetos pedagógicos respetan el modelo físico, no animaciones predeterminadas que lo contradigan;
- partículas/VFX nunca alteran la lectura de trayectoria;
- los cuerpos que se comparan deben conservar escala y timing visual comparables.

### 19.1 Regla 60 Hz conceptual

Las variables pedagógicas se actualizan en un paso fijo determinista o solución analítica equivalente. La representación puede interpolar, pero nunca cambiar el resultado autoritativo.

---

# 20. Audio y música

## 20.1 Audio como información

- impacto comunica material/energía;
- fricción comunica superficie;
- frecuencia/pitch se usa en ondas de forma accesible;
- presión/flujo pueden tener capas sonoras;
- resonancia debe poder “sentirse” también visual/hápticamente.

## 20.2 Música

Dirección: acústica + texturas mecánicas + capas ambientales. La música se reorquesta al restaurar una región, de forma que conocimiento y transformación también se escuchen.

No usar música para indicar “respuesta correcta” antes que el mundo.

---

# 21. UI / UX

HUD mínimo. La UI permanente no debe cubrir el fenómeno.

### En pantalla

- prompt contextual cuando sea necesario;
- estado del objeto en mano;
- feedback accesible de interacción;
- reloj sólo cuando el jugador lo convoca o cuando un módulo exige lectura.

### Fuera de acción

- Bitácora;
- mapa de regiones/condiciones;
- accesibilidad;
- retos de maestría.

### Se prohíbe

- barra de “progreso de aprendizaje”;
- estrellas escolares;
- XP por responder teoría;
- popup de fórmula en medio de una acción inédita;
- colores rojo/verde como único feedback.

---

# 22. Accesibilidad

Objetivo: que la barrera de acceso nunca sea confundida con una barrera conceptual.

- remapeo completo;
- teclado/mouse, gamepad y touch;
- hold/toggle configurable;
- velocidad de juego reducida en secuencias de observación sin alterar modelo conceptual;
- control asistido de lanzamiento;
- auto-grab opcional;
- tamaño de texto y UI;
- contraste configurable;
- patrones + forma + animación además de color;
- subtítulos de sonido funcional;
- visualización de ondas para contenido acústico;
- alternativa sonora/háptica para información visual cuando sea viable;
- reducción de cámara;
- sin time pressure obligatorio en campaña;
- modo lectura de ecuaciones paso a paso;
- lenguaje claro y glosario posterior a experiencia.

---

# 23. Arquitectura técnica de referencia

## 23.1 Baseline

El repo ya contiene un runtime Babylon.js de Physica y modelos analíticos. Para esta nueva producción:

- conservar **TypeScript puro** para modelos pedagógicos;
- renderer/engine no es autoridad física;
- usar engine physics (Havok u otro) para colisiones, props secundarios, ragdoll no crítico y respuesta ambiental;
- no integrar dos veces el mismo grado de libertad;
- poder ejecutar modelos en tests sin canvas.

## 23.2 Contrato de simulación

Cada fenómeno pedagógico define:

```ts
interface PhysicalExperiment<State, Params> {
  initial: State;
  params: Params;
  stepOrSolve(t: number): State;
  observables(state: State): ObservableSet;
  validate(state: State): ValidationResult;
  assumptions: string[];
  domain: string;
}
```

El código real puede diferir; el principio no.

## 23.3 Rigor

Cada modelo documenta:

- variables;
- unidades SI;
- supuestos;
- dominio de validez;
- tolerancia numérica;
- qué parte es real y qué parte es anomalía ficticia;
- tests con casos conocidos.

### Ejemplo

La cascada ascendente **no demuestra** que la gravedad real pueda cambiar por sustancia. Es una configuración ficticia local usada para obligar al jugador a distinguir observación, cuerpo y condición. La Bitácora debe separar claramente “regla de esta región” de “modelo físico del mundo real”.

## 23.4 Motor

**Default:** continuar Babylon.js si satisface la Gold Slice.  
**Astra puede proponer cambio** sólo si presenta un spike comparable con:

- web bundle/streaming;
- performance desktop/mobile;
- deterministic integration;
- tooling de cámara/animación/VFX;
- GLB pipeline;
- input/touch;
- mantenimiento TypeScript;
- costo real de migración;
- coexistencia con landing/Instituto.

No cambiar motor por preferencia estética sin evidencia.

---

# 24. Pipeline de assets

**Concept → style frame → greybox → gameplay approval → art pass → lighting → VFX/audio → perf → final.**

Cada asset interactivo registra:

- escala SI aproximada;
- pivote;
- collider;
- masa física pedagógica si corresponde;
- material visual;
- material físico;
- estados;
- LOD;
- anchors/sockets;
- licencia/origen;
- versión.

Assets de referencia externos **no se copian** al repo. Se usan para dirección y se producen assets originales.

---

# 25. Rendimiento web y budgets

Metas iniciales, ajustables con medición:

- 60 fps desktop medio en Gold Slice;
- 30 fps mínimo estable en mobile medio, objetivo 60 donde sea razonable;
- frame pacing estable durante experimentos;
- no stutter al disparar un puzzle;
- assets por zonas con carga progresiva;
- primer render útil antes de descargar contenido lejano;
- texturas comprimidas GPU-friendly;
- LOD y culling compatibles con cámara curada;
- overlays pedagógicos baratos y desacoplados.

Rendimiento es parte de pedagogía: una trayectoria que salta frames altera la lectura.

---

# 26. Gold Slice — especificación de producción

**Duración objetivo:** 45–75 min.  
**Debe ser vendible por sí sola como demo.**  

## GS0 — Entrada

- Aula/portal puede usar integración mínima o stub elegante.
- transición sin pantalla tutorial.
- primer plano del valle.

## GS1 — Cascada ascendente

- locomoción impecable;
- piedra vs agua;
- frontera visible;
- primera observación de Bitácora;
- cámara monumental.

## GS2 — Plataforma relativa

- dos cuerpos con movimiento común;
- jugador comprende referencia por navegación;
- sin overlay en primera pasada;
- módulo de lectura entra después.

## GS3 — INSTRUMENTO suspendido

- equilibrio de acciones opuestas;
- jugador rompe el balance y observa consecuencia;
- companion se incorpora.

## GS4 — Corriente transversal / lanzamiento

- composición de movimientos;
- lanzamiento asistido;
- varios ángulos/rutas válidos;
- fallo deja trayectoria visible.

## GS5 — Plano inclinado / superficie

- pieza frágil que no puede subir directo;
- dos pendientes/materiales;
- menor fuerza vs mayor recorrido;
- fricción observable.

## GS6 — Estación cinética

- mezcla de 2–3 ideas ya aprendidas;
- al menos dos soluciones válidas;
- restauración espectacular;
- formalización de Bitácora posterior;
- vista de Metrópoli como promesa.

### 26.1 Gate de la Gold Slice

No pasa a producción masiva hasta que:

- jugadores nuevos entiendan qué variable importa en cada puzzle;
- al menos la mayoría pueda predecir una variante sin pista explícita;
- los fallos se interpreten correctamente;
- el movimiento resulte agradable incluso sin objetivo;
- el key art se reconozca como Physica;
- desktop y touch sean jugables;
- el modelo físico pase tests;
- un docente/revisor de Física valide representaciones y lenguaje;
- un playtest sin mencionar “educativo” encuentre valor intrínseco.

---

# 27. Diseño de evaluación del aprendizaje

No convertir telemetría en examen. Se evalúa comprensión mediante comportamiento.

## 27.1 Evidencia fuerte

- predice correctamente una variante;
- cambia una variable relevante en vez de repetir igual;
- transfiere una idea a otro contexto;
- logra una solución no mostrada;
- explica verbalmente en playtest la relación causal con sus palabras.

## 27.2 Evidencia débil

- completó el puzzle;
- abrió una Bitácora;
- vio una fórmula;
- repitió una solución exacta.

## 27.3 Playtest pedagógico

Inspirado en prácticas de investigación de simulaciones interactivas:

- entrevistas think-aloud;
- observar dónde mira el jugador;
- registrar predicción antes del resultado cuando sea posible sin romper inmersión;
- variar una sola característica del puzzle entre cohortes cuando se testea legibilidad;
- revisar concepciones alternativas antes/después;
- separar problema de control de problema conceptual.

---

# 28. Telemetría responsable

Si existe telemetría, priorizar eventos anónimos de diseño:

- intentos por puzzle;
- variables tocadas;
- tiempo entre intento y modificación;
- uso de pistas;
- solución elegida;
- abandono;
- settings de accesibilidad agregados de forma respetuosa.

No construir perfiles escolares opacos ni convertir el juego en vigilancia educativa.

---

# 29. Diseño de pistas

Tres capas, sólo bajo demanda o estancamiento real:

1. **Reencuadre:** cámara/sonido resalta la consecuencia, no la respuesta.
2. **Contraste:** INSTRUMENTO sugiere comparar dos estados.
3. **Instrumentación:** reloj muestra una trayectoria, escala o lectura.

Nunca: “usá la fórmula X”, “poné la pieza acá”, flecha al lugar correcto como primera ayuda.

---

# 30. Modo Maestría

Contenido opcional para quien quiere profundidad:

- menor energía;
- menor tiempo;
- menos piezas;
- mayor robustez;
- tolerancias reales más exigentes;
- predicción numérica;
- incertidumbre de medición;
- datos exportables de algunos experimentos;
- variantes con parámetros distintos.

La campaña nunca exige esta capa.

---

# 31. Integración con otros mundos

## Ohmdal

Electricidad/electrónica pertenece prioritariamente a Ohmdal. Physica puede enseñar energía, campos, ondas electromagnéticas y óptica, pero no duplicar circuitos como identidad central.

## Bitland

Cruce futuro: automatizar una estación física sólo después de dominar sus leyes. Bitland programa; Physica modela.

## Arithmos

Cruce futuro: transformar representaciones y modelos matemáticos de datos observados. Arithmos transforma; Physica experimenta.

## Regla

Los cruces llegan **después** de que cada mundo sea autosuficiente.

---

# 32. Producción por hitos

## Fase A — Preproducción (2–4 semanas)

- validar GDD;
- 3–5 style frames;
- blockout de Gold Slice;
- spike cámara + cascada;
- spike de modelo analítico + render;
- playtest locomoción.

## Fase B — Gold Slice greybox (4–8 semanas)

- camino completo GS1–GS6;
- todos los puzzles funcionales;
- tests físicos;
- harness de gameplay;
- primera ronda think-aloud.

## Fase C — Gold Slice art/polish (6–12 semanas)

- art final de un bioma completo;
- animación;
- companion;
- lighting/VFX/audio;
- UI/Bitácora;
- touch/accessibility;
- performance.

## Fase D — Producción de campaña

Arco por arco, reutilizando juguetes y sistemas, no fabricando minijuegos aislados.

## Fase E — Alpha

Campaña completa jugable, arte parcial, currículo cubierto, final implementado.

## Fase F — Beta

Contenido lock, accesibilidad, performance, calibración pedagógica, localización.

## Fase G — Gold

Sin errores conceptuales conocidos, sin blockers, experiencia continua, documentación mínima suficiente.

---

# 33. QA

## Física

- tests dimensionales;
- casos analíticos conocidos;
- invariantes de energía/momento cuando corresponda;
- tolerancias explícitas;
- regresión por navegador.

## Gameplay

- softlocks;
- soluciones alternativas;
- resets;
- cámara;
- input;
- touch;
- save/load;
- velocidad reducida.

## Pedagogía

- concepto visible sin texto;
- fórmula posterior;
- fallo informativo;
- transferencia;
- concepción alternativa no reforzada accidentalmente.

## Arte

- interactivos legibles;
- no blur del fenómeno;
- contraste;
- escalas coherentes;
- VFX no engañosos.

---

# 34. Definition of Done por puzzle

Un puzzle sólo está terminado si:

1. es divertido de manipular;
2. comunica su estado sin tutorial expositivo;
3. el fallo produce evidencia;
4. puede reiniciarse/revertirse rápido;
5. valida condiciones, no receta;
6. tiene al menos una variante de transferencia;
7. su física autoritativa está testeada;
8. cámara y VFX no contradicen el modelo;
9. accesibilidad no elimina el concepto;
10. un jugador nuevo puede explicar qué cambió y por qué con lenguaje propio.

---

# 35. Bibliografía curricular y pedagógica

## Argentina / Provincia de Buenos Aires

- Ministerio de Educación — Núcleos de Aprendizajes Prioritarios (NAP):  
  https://www.argentina.gob.ar/nucleos-de-aprendizaje-prioritarios
- DGCyE Provincia de Buenos Aires — Introducción a la Física, 4º año:  
  https://servicios.abc.gov.ar/lainstitucion/organismos/consejogeneral/disenioscurriculares/secundaria/materias_comunes_a_todas_las_orientaciones_de_4anio/fisica_4.pdf
- DGCyE — Física (Ciclo Superior):  
  https://abc.gob.ar/secretarias/sites/default/files/2021-05/F%C3%ADsica.pdf
- DGCyE — Física clásica y moderna:  
  https://abc.gob.ar/secretarias/sites/default/files/2021-11/03-06-20.%20SECUNDARIA.DC28.ABC_.pdf
- DGCyE — Diseño Curricular de Educación Secundaria Técnica, Resolución 3828/09, Anexo 3:  
  https://servicios2.abc.gov.ar/lainstitucion/organismos/eductecnicaprofesional/direcciones/normativas/documentos/resolucion/3828-09_anexo_3.pdf

## Investigación de aprendizaje

- PhET Interactive Simulations — Research:  
  https://phet.colorado.edu/en/research
- CAST — Universal Design for Learning Guidelines 3.0:  
  https://udlguidelines.cast.org/
- Hake, R. R. (1998). *Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses*. American Journal of Physics, 66, 64–74.  
  https://doi.org/10.1119/1.18809
- Koyunlu Ünlü, Z. (2024). *Effect of the Predict-Observe-Explain (POE) Strategy on Achievement in Science Education: A Meta-Analysis Study*.  
  https://doi.org/10.33711/yyuefd.1570041
- Agarwal, P. K., Nunes, L. D., & Blunt, J. R. (2021). *Retrieval Practice Consistently Benefits Student Learning: a Systematic Review of Applied Research in Schools and Classrooms*. Educational Psychology Review, 33, 1409–1453.  
  https://doi.org/10.1007/s10648-021-09595-9

---

# 36. Referencias de producción visual y técnica

- Square Enix — OCTOPATH TRAVELER II / HD-2D:  
  https://es.store.square-enix-games.com/octopath-traveler-ii
- PlayStation Blog — DRAGON QUEST III HD-2D Remake production interview:  
  https://blog.playstation.com/?p=398105
- Playdead — *The Lighting of INSIDE*:  
  https://blog.playdead.com/articles/the_lighting_of_inside/lighting_of_inside.html
- Wishfully / Planet of Lana — official site:  
  https://www.planetoflana.com/
- GameDeveloper — Planet of Lana art & animation:  
  https://www.gamedeveloper.com/business/exploring-the-art-and-animation-behind-hand-painted-odyssey-i-planet-of-lana-i-
- Frozenbyte — Trine 5:  
  https://www.frozenbyte.com/games/trine-5-a-clockwork-conspiracy/
- Planet of Lana gameplay trailer (Xbox):  
  https://www.youtube.com/watch?v=N5pxbO1bxTM
- Trine 5 release trailer:  
  https://youtu.be/ifQCsZyVeuE
- Outer Wilds design-pillars interview (curiosity-driven exploration):  
  https://www.gameskinny.com/culture/interview-8-questions-with-creative-director-and-producer-of-mobius-games-developer-of-outer-wilds/

> **Uso de referencias:** estudiar principios de composición, legibilidad, iluminación, ritmo, profundidad, curiosidad y staging. No reproducir personajes, niveles, assets, UI, paletas ni layouts protegidos.

---

# 37. Shot list para concept art / generación de imágenes

Estas imágenes deben producirse originales para Physica durante preproducción:

### KEY-01 — “La cascada que sube”

Plano 16:9, avatar diminuto en cornisa, lago abajo, columna de agua ascendiendo a nubes, piedra cayendo en primer plano, materiales naturales + instrumentación de cobre tenue. Debe comunicar la premisa sin texto.

### KEY-02 — “Quietud activa”

INSTRUMENTO suspendido entre dos corrientes verticales opuestas, partículas mostrando fuerzas sin flechas UI, jugador al borde de un desfiladero.

### KEY-03 — “Valle Variable”

Tres capas de profundidad, plataformas a la deriva, río lateral, vegetación inclinada por corriente. Composición de puzzle legible.

### KEY-04 — “Jardines de Reserva”

Péndulos, resortes y contrapesos integrados a vegetación. Energía almacenada visible por deformación/altura, no barras UI.

### KEY-05 — “Canales Suspendidos”

Acueductos flotantes, cámaras transparentes, pistones y cuerpos de distinta densidad.

### KEY-06 — “Torres Resonantes”

Arquitectura que vibra en capas, membranas y cuerdas, ondas representadas por materia/partículas y luz sutil.

### KEY-07 — “Distrito de Luz”

Prismas, vidrio, agua y haces volumétricos controlados; foco en óptica, no cyberpunk.

### KEY-08 — “Metrópoli de las Condiciones”

Gran plano final con varias regiones físicas coexistiendo pero fronteras legibles. Debe sugerir complejidad sin parecer caos visual.

---

# 38. Video reference / animatic list

Durante preproducción se deben crear animatics propios de 8–20 s para:

1. entrada y reveal de cascada;
2. comparación piedra/agua;
3. dolly de equilibrio del INSTRUMENTO;
4. trayectoria bajo corriente;
5. plano inclinado + objeto frágil;
6. activación de Estación Cinética;
7. transformación persistente de región;
8. reveal final de Metrópoli.

Cada animatic responde: **¿qué ve el jugador primero, qué puede inferir y qué queda fuera de cuadro?**

---

# 39. Riesgos principales

## R1 — “Se siente educativo”

**Mitigación:** playtest sin mencionar objetivos académicos; eliminar todo texto no esencial; elevar movimiento, misterio y arte.

## R2 — Física correcta pero puzzle aburrido

**Mitigación:** el concepto no entra hasta tener un juguete y una decisión.

## R3 — Física divertida pero conceptualmente engañosa

**Mitigación:** modelo autoritativo + revisión docente + separar anomalía ficticia de ley real.

## R4 — Sobreuso de overlays

**Mitigación:** primera resolución siempre debe poder comenzar sin flechas ni números.

## R5 — 2.5D limita un concepto

**Mitigación:** spike 3D sólo en el concepto que realmente lo necesita.

## R6 — 3D perjudica lectura

**Mitigación:** volver a eje curado; profundidad es un recurso, no una obligación.

## R7 — Scope inmanejable

**Mitigación:** Gold Slice primero; sistema reusable por familia; un arco se produce sólo después de cerrar el anterior con calidad.

---

# 40. Preguntas que Astra puede resolver sin pedir permiso

Astra puede decidir de forma reversible:

- valores exactos de cámara;
- tamaño de áreas;
- orden micro de beats;
- shader/lighting implementation;
- estilo final del protagonista dentro de la dirección visual;
- nombre de archivos/componentes;
- distribución de props;
- VFX secundarios;
- layout de controles;
- algoritmo de hints.

Debe elevar antes de cambiar:

- verbo nuclear;
- secuencia fenómeno→acción→formalización;
- ausencia de quiz como loop;
- autoridad de modelos físicos;
- identidad curricular entre mundos;
- final temático de “hacer legible, no normalizar todo”;
- scope cross-world.

---

# 41. Criterio final de éxito

Physica está logrado cuando una persona puede decir, sin que el juego se lo haya preguntado:

> “Al principio pensé que el mundo hacía cualquier cosa. Después entendí que cada zona tenía condiciones. Empecé a probar una cosa por vez y terminé pudiendo anticipar qué iba a pasar.”

Y, al mismo tiempo, esa persona quiere seguir jugando porque el mundo es hermoso, extraño, divertido de manipular y todavía tiene preguntas por responder.

**Ese es el producto. La Física no es el examen. Es el lenguaje secreto que vuelve legible la aventura.**
