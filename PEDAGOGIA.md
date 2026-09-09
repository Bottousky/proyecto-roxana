# Aprender en Ohmdal

## Propósito y experiencia

Ohmdal propone aprender electricidad y electrónica desde la experiencia, para
adolescentes y adultos que pueden empezar sin conocimientos previos. Comprender
permite observar mejor, tomar decisiones y cuidar lo que otras personas usan.

Una experiencia parte de un fenómeno perceptible y una pregunta auténtica. El
estudiante propone una explicación, anticipa un resultado, interviene, mide y
revisa su idea. Después la formaliza y la aplica en una situación diferente.
El ciclo admite volver atrás: una observación inesperada puede abrir otra pregunta.

La profundidad crece por capas. La intuición se relaciona con una medición;
la medición, con un esquema; el esquema, con magnitudes, unidades y relaciones.
Las fórmulas explican algo que el estudiante ya pudo experimentar.

Un error útil revela información y permite corregir. Una trayectoria sin
retorno, una lectura fuera de escala o una protección que actúa dicen cosas
distintas. Las ayudas dirigen la atención hacia evidencia disponible. Una
combinación arbitraria, un cuestionario que abre una puerta o una respuesta
memorizada no reemplazan ese razonamiento.

## Competencias que atraviesan el viaje

| Competencia | Evidencia de comprensión |
|---|---|
| Observación e hipótesis | Distinguir lo visto de lo supuesto y anticipar qué debería cambiar. |
| Seguridad y responsabilidad | Reconocer límites, condiciones de medición y consecuencias sobre otras personas. |
| Medición | Elegir magnitud, puntos o rama, referencia, conexión y rango; interpretar una lectura. |
| Representación y montaje | Relacionar un esquema con conexiones, materiales y componentes. |
| Modelado | Estimar, usar unidades, comparar magnitudes y reconocer los límites de una explicación. |
| Diagnóstico | Aislar partes de un sistema, contrastar hipótesis y verificar una reparación. |
| Diseño | Comparar alternativas según servicio, energía, protección y mantenimiento. |
| Comunicación | Dejar un esquema y una explicación que otra persona pueda utilizar. |
| Transferencia | Aplicar una relación conocida a otra topología, escala o necesidad. |

El contexto incluye uso de recursos, reparación, residuos y apropiación colectiva
del conocimiento. La comprensión puede expresarse mediante acciones, dibujos,
mediciones o palabras. Las pistas relevantes admiten más de una representación:
forma y posición además del color, y una alternativa visible a la información
sonora. La destreza motriz y la rapidez de lectura no son objetivos eléctricos.

## Contenidos de La Luz

| Momento | Contenido | Comprensión que se busca |
|---|---|---|
| Plaza y despertar de Ohm | Fuente, receptor, conductor, aislante, interruptor, circuito abierto y cerrado | Relacionar una trayectoria completa con el funcionamiento de un receptor. |
| Taller, Calzada y Manantial | Continuidad, tensión, corriente, resistencia, unidades e instrumentos | Diagnosticar una falla con evidencia y predecir el efecto de una modificación. |
| Castillo | Serie, paralelo, nodos, conservación y aislamiento | Explicar el reparto y contener una falla sin interrumpir servicios independientes. |
| Forja y Terrazas | Potencia, energía, calor, pérdidas, límites, protección y divisores | Comparar soluciones que satisfagan necesidades sin exceder las condiciones del sistema. |
| Lago y Faro | Redes combinadas, equivalentes, medición y calibración | Reunir lo aprendido en una instalación que otra persona pueda mantener. |
| Primera clase | Documentación y transferencia | Enseñar un método y reconocer cuándo sirve en otro contexto. |

El código de colores de resistencias puede introducir lectura de componentes,
unidades y tolerancia, siempre relacionado con su uso y una medición. Capacitores
y transitorios RC son una posible profundización del Faro; requieren distinguir
carga, energía y corriente y explicar una respuesta temporal real.

La variedad puede nacer de localizar una falla, comparar distribuciones,
dimensionar una carga, aislar un problema, calibrar o diseñar para varias
necesidades. La solución se justifica por sus consecuencias físicas y sociales.

## Fundamentos eléctricos

### Magnitudes y medición

- **Carga eléctrica, Q:** se mide en coulomb (C).
- **Corriente, I:** tasa de paso de carga por una sección; se mide en amperios
  (A). En régimen constante, I = ΔQ/Δt. Un receptor transforma energía; no
  consume corriente a lo largo de una trayectoria en serie.
- **Tensión, V:** diferencia de potencial entre dos puntos, medida en voltios
  (V). Una lectura necesita esos dos puntos y una polaridad de referencia.
- **Resistencia, R:** relación V/I de un elemento resistivo en sus condiciones
  de operación; se mide en ohmios (Ω). Para un resistor óhmico con R constante,
  V = I·R. Esa relación no describe con una R fija cualquier dispositivo.

El voltímetro se conecta entre puntos; el amperímetro mide la corriente de una
rama y se inserta en serie. La continuidad y la resistencia se comprueban con
el circuito desenergizado y las condiciones adecuadas del instrumento. Una
prueba de continuidad no garantiza buen funcionamiento bajo carga. La ausencia
de luz tampoco demuestra ausencia de tensión.

El rango, la resolución, la tolerancia y la incertidumbre dan contexto a una
medición. Ohm puede informar que una lectura no basta para decidir.

### Topología y conservación

En serie, sin derivaciones, circula la misma corriente por los elementos. En
paralelo, los elementos comparten los mismos dos nodos y la misma tensión. En
el modelo resistivo ideal:

- Serie: R_eq = R₁ + R₂ + …
- Paralelo: 1/R_eq = 1/R₁ + 1/R₂ + …
- En un nodo sin acumulación neta de carga, la suma de corrientes que entran
  coincide con la suma de las que salen.
- En los circuitos concentrados considerados, la suma algebraica de tensiones
  alrededor de un lazo es cero, con referencias de signo consistentes.

Un cable ideal une puntos del mismo potencial. Un cable real puede tener
resistencia y caída de tensión. Un circuito abierto y un cortocircuito son
fallas diferentes; sus efectos dependen de dónde ocurren y de la fuente.

### Potencia, energía y calor

En corriente continua, P = V·I, con potencia en watts (W). Para potencia
constante durante un intervalo, E = P·t, con energía en joules (J) si el tiempo
está en segundos. Si la potencia cambia, la energía depende de su variación
durante todo el intervalo.

En un resistor, P = I²R = V²/R. Esa potencia se transforma en calor; la
temperatura también depende del tiempo, la capacidad térmica y la disipación.
Un mayor brillo o una mayor potencia no significan por sí solos una mejor
solución. Fuente, conductores y receptores tienen condiciones y límites.

Una protección limita consecuencias de una falla. Aumentar su umbral sin
resolver la causa puede dejar al resto del sistema sin protección adecuada.

### Divisores y equivalentes

Para dos resistencias en serie con salida sobre R₂ y sin carga adicional:
V_salida = V_entrada·R₂/(R₁ + R₂). Al conectar una carga, ésta cambia la red:
si queda en paralelo con R₂, el cálculo debe considerar esa combinación.

Un equivalente representa lo que se observa desde terminales determinados,
dentro de sus supuestos. Una lectura en vacío no garantiza el mismo resultado
cuando la instalación debe entregar corriente.

### Tiempo y almacenamiento

Un capacitor almacena energía en un campo eléctrico y separa carga: Q = C·V
y E = ½C·V² para capacitancia constante. C se mide en faradios (F).
El capacitor no «guarda corriente».

En una red RC de primer orden, la constante de tiempo es τ = R_eq·C, donde
R_eq es la resistencia que ve el capacitor según la topología y el estado de
las fuentes. Para una respuesta hacia un valor final constante:
V(t) = V_final + (V_inicial − V_final)·e^(−t/τ).

La curva depende de condiciones iniciales, conexiones y carga. Una cuenta
regresiva arbitraria no explica la carga y descarga. Una señal periódica
requiere, además, un mecanismo que produzca la repetición.

### Límites de las explicaciones

Las analogías hidráulicas pueden ayudar a imaginar ciertas relaciones, pero
la carga no es agua y la energía no se identifica con la cantidad de corriente.
La Bitácora distingue la metáfora de las magnitudes eléctricas.

Una descripción resistiva de corriente continua no basta para explicar el
arranque de un motor, su dinámica, inducción, alterna ni transitorios. Esos
fenómenos requieren sus propias relaciones cuando se estudien. La fantasía
del mundo puede simplificar la presentación conservando el significado físico.

## La Bitácora como aprendizaje

Cada tema puede dejar cuatro rastros relacionados:

1. **Vivencia:** qué ocurrió, con un croquis o detalle memorable.
2. **Evidencia:** qué se esperaba, dónde se midió, qué resultado y qué error hubo.
3. **Explicación:** concepto, esquema, variables, unidades, relación y límites.
4. **Nueva pregunta:** dónde podría volver a aplicarse y qué falta comprender.

La formalización llega después de la experiencia y puede revisarse. La
profundización matemática acompaña el interés y los conocimientos del estudiante.
Las evaluaciones formales, si existen, son opcionales y no bloquean la historia.

## Horizonte curricular

Los arcos organizan experiencias; los niveles de competencia describen lo que
una persona puede comprender y hacer. No corresponden automáticamente a años
escolares ni implican una acreditación.

| Nivel | Centro del aprendizaje |
|---|---|
| F0 — Cultura de taller | Materiales, magnitudes, herramientas, seguridad, representación, montaje y documentación. |
| F1 — Análisis electrónico | Redes, leyes, instrumental, componentes y diagnóstico mediante predicciones. |
| F2 — Señales y conversión | Tiempo, frecuencia, energía y transformación de señales entre etapas. |
| F3 — Sistemas integrados | Control, comunicaciones y proyectos con restricciones, verificación y mantenimiento. |

| Arco | Contenidos posibles después de los fundamentos |
|---|---|
| I — La Luz | Cultura de taller, medición, redes DC, potencia, diagnóstico y transmisión de conocimiento. |
| II — La Marea | Corriente alterna, frecuencia, magnetismo, transformadores y redes pasivas. |
| III — La Señal | Diodos, transistores, amplificación, fuentes, sensores y tratamiento analógico. |
| IV — Las Máquinas | Instalaciones, conversión, potencia, protección y motores. |
| V — La Decisión | Lógica, memoria, programación, sistemas embebidos, actuadores y control. |
| VI — La Voz | Modulación, radiofrecuencia, medios, redes, imagen y sonido. |
| VII — El Empalme | Integración, proyecto, diagnóstico, puesta en marcha y mantenimiento; encuentro entre disciplinas. |

Las fuentes curriculares de referencia son el [Primer Ciclo del Otto Krause](https://www.ottokrause.edu.ar/primer-ciclo/),
su [especialidad Electrónica](https://www.ottokrause.edu.ar/electronica/)
y el [perfil federal de Técnico en Electrónica, Resolución CFE 15/07, Anexo III](https://www.inet.edu.ar/wp-content/uploads/2013/04/15-07-anexo03.pdf).
Orientan la selección de contenidos. La Luz toma cultura de taller y fundamentos
seleccionados de análisis y laboratorio; no pretende cubrir una especialidad
completa ni sustituir sus prácticas.
