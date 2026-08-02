# Game Design Document — Ohmdal

**Estado:** contrato canónico de diseño
**Producto base:** La Luz, RPG narrativo educativo gratuito para web/PWA
**Audiencia:** 13–18 años y adultos; no exige conocimientos previos

## Promesa

Explorar un mundo que olvidó por qué funciona, investigar sus fallas y devolverle la capacidad de
comprenderse. El progreso no mide fuerza: mide qué puede observar, medir, explicar, documentar y
transferir el estudiante.

## Pilares

1. **Fenómeno antes que fórmula.** El mundo muestra una consecuencia antes de nombrar la ley.
2. **Diagnóstico, no adivinanza.** Toda solución se justifica por topología, medición y evidencia.
3. **Error informativo.** Una intervención incorrecta revela estado y permite recuperarse.
4. **Restauración colectiva.** Un sistema no está resuelto hasta que sus habitantes pueden
   mantenerlo sin el protagonista.
5. **Viaje HD-2D.** Overworld explorable, dioramas densos, personajes pixel art y cámara autoral.
6. **Bitácora Roxana.** Lo vivido se transforma en lenguaje técnico después de comprenderlo.

## Anti-pilares

- combate, estadísticas de daño, enemigos derrotables o loot de poder;
- grind, energía de espera, vidas, gacha o microtransacciones;
- cuestionarios que abren puertas o fórmulas usadas como contraseña;
- ensayo ciego hasta coincidir con una solución oculta;
- exposición que resuelve el fenómeno antes de tocarlo;
- mapa abierto grande con contenido de relleno;
- evaluación formal dentro del camino crítico.

## Loops

### Loop de 30 segundos

Moverse → percibir una anomalía → inspeccionar una pista → comparar con el entorno → decidir si
seguir, hablar, medir o registrar.

### Loop de 5–15 minutos

1. Observar un sistema y su efecto comunitario.
2. Formular una hipótesis breve en la Bitácora o mediante una acción espacial.
3. Elegir instrumento, referencia o componente.
4. Intervenir y recibir respuesta física, sonora y social.
5. Verificar; si falla, aislar una variable y volver a medir.
6. Explicar la causa y transferirla a otra disposición.

### Loop de región

Llegar desde el overworld → conocer oficio/conflicto → recorrer infraestructura → resolver dos o
tres investigaciones encadenadas → afrontar un sistema integrado → documentar → volver a un
territorio transformado → desbloquear una nueva ruta/pregunta.

### Loop de campaña

Cada región amplía las herramientas epistemológicas del estudiante. La Luz termina cuando Edda y
los oficios pueden enseñar y mantener la red sin depender de quien cruzó el Portal.

## Progresión

No hay nivel de personaje. Las capacidades se desbloquean por comprensión demostrada:

| Capacidad | Desbloqueo observable | Uso posterior |
|---|---|---|
| Inspección | distinguir conexión, material y daño visible | elegir puntos de medición |
| Continuidad | recomponer y verificar una trayectoria | aislar ramas y falsos contactos |
| Medición DC | elegir magnitud, referencia y rango seguro | contrastar hipótesis |
| Modelado | relacionar tensión, corriente y resistencia | predecir antes de energizar |
| Lectura de red | reconocer serie, paralelo y subsistemas | diagnosticar distribución |
| Potencia/seguridad | anticipar calor, límite y protección | elegir una solución sostenible |
| Equivalencia | reemplazar una red por un modelo útil | simplificar sin perder comportamiento |
| Tiempo | observar carga/descarga y ritmo | preparar La Marea |
| Documentación | dejar esquema, valores, decisión y prueba | permitir mantenimiento local |

Ohm materializa instrumentos disponibles, pero no habilita una capacidad hasta que el jugador la
usó y explicó. Los instrumentos no son premios cosméticos: cada uno modifica qué evidencia puede
obtenerse.

## Mundo y viaje

### Overworld

- Mapa 3D explorable en miniatura, no selector de nodos.
- Muestra rutas, asentamientos, infraestructura mayor, clima y estados restaurados.
- Su escala es simbólica; no enseña topología eléctrica por distancia geográfica literal.
- Entrar a un landmark carga un diorama de región mediante `RuntimeHost` o transición interna.
- No contiene puzzles eléctricos complejos; sirve a viaje, orientación, anticipación y revisitas.

### Regiones

- Exteriores compactos con uno o dos interiores significativos.
- Cámara por volúmenes y encuadres; zoom limitado, sin rotación libre.
- Infraestructura visible conecta causa, punto de intervención y consecuencia.
- Tres estados: deteriorado, intervención y comprendido.
- Los habitantes cambian rutas, tareas, conversaciones y documentación después de restaurar.

## Exploración e interacción

- Movimiento directo por teclado; control táctil equivalente con stick/área virtual o destino
  accesible según el resultado del spike.
- Interacción contextual única para hablar, inspeccionar o accionar; la etiqueta nombra el verbo,
  no la solución.
- El mouse puede ayudar a UI/medición, pero no es obligatorio.
- Objetos importantes tienen lectura por silueta, contraste, sonido y texto; nunca sólo color.
- Ohm puede destacar puntos ya descubiertos, no hacer wallhack de evidencia desconocida.

## Conversación

- Diálogos breves durante exploración; escenas largas sólo en descansos o transformaciones.
- Los NPC describen observación, oficio, recuerdo y necesidad. No recitan teoría que no dominan.
- El protagonista habla poco, pero sus elecciones de hipótesis y la Bitácora construyen voz.
- Ohm responde con dato preciso y humor seco; si no hay medición válida, dice que no hay dato.
- Edda cuestiona modelos y puede llegar a otra región antes que el jugador.
- Las opciones de diálogo expresan enfoque o relación, no una respuesta correcta moral.

## Diseño de puzzles

Todo puzzle declara en su ficha:

- fenómeno, pregunta y efecto comunitario;
- topología/modelo técnico puro;
- variables, unidades, supuestos y seguridad;
- hipótesis posibles y error productivo;
- puntos de medición e instrumentos;
- intervenciones válidas, consecuencias y múltiples órdenes cuando existan;
- pista 1 basada en observación, pista 2 basada en comparación y pista 3 explícita opcional;
- transferencia y entrada de Bitácora;
- tests deterministas y estado V0–V4.

Una solución se acepta por condición física/modelo, no por secuencia de clicks. Cableado libre se
reserva para laboratorios posteriores; el primer slice usa diagnóstico guiado auténtico.

## Fallas sistémicas y tensión

Sustituyen combate y daño. Ejemplos: calentamiento, protección que abre, oscilación, señal con
ruido, suministro inestable, ruta mecánica bloqueada o desacuerdo comunitario sobre prioridades.

Reglas:

- la falla nunca daña irreversiblemente la partida;
- antes de un riesgo debe existir evidencia perceptible;
- si una protección actúa, explica estado y permite reset seguro;
- no hay cronómetro obligatorio en contenido de razonamiento;
- una emergencia narrativa puede cambiar puesta en escena, no quitar tiempo de lectura;
- el fracaso añade una observación o descarta una hipótesis; no reduce recursos permanentes.

## Bitácora Roxana

Interfaz DOM común y accesible. Cada entrada contiene vivencia ilustrada, evidencia,
formalización y siguiente pregunta. Se desbloquea por comprensión, no por entrar a una sala.

El jugador participa mediante elecciones breves de hipótesis, selección de evidencia, orden de
croquis o una frase; no redacta texto requerido. La versión final conserva personalidad, tachones
y dibujos, y luego muestra traducción técnica rigurosa.

Cuando una entrada está formalizada puede mostrar un enlace externo: «Ya tenés las herramientas
para evaluar este tema en La Escuela». Abre pestaña nueva, es opcional y no modifica progreso.

## Matemática adaptativa

- Campaña: estimar signo, orden de magnitud, proporción y cálculo aritmético esencial.
- Ayuda: tabla, unidades, visualización y pasos opcionales; no sustituye la predicción.
- Laboratorio avanzado: derivaciones, incertidumbre, tolerancia, gráficos y problemas cuantitativos.
- El save registra nivel de ayuda por contenido para continuidad, no para puntuar al estudiante.
- Nunca se etiqueta al jugador como «básico» o «avanzado» dentro de la ficción.

## UI y UX

- HUD mínimo: interactuar, objetivo como pregunta, acceso a Bitácora y estado del instrumento.
- Mapa y objetivos son páginas/diagramas del estudiante, no lista de tareas administrativas.
- Texto escalable sin romper layout a 200%.
- Indicadores combinan forma, etiqueta, animación y sonido.
- Puzzles mantienen mundo visible siempre que la cámara lo permita; una lupa DOM no se convierte
  en banco modal aislado.
- Diálogo, Bitácora y medición pausan sólo la acción local necesaria, no el audio/vida del mundo.

## Accesibilidad obligatoria

- contraste y tamaño configurables;
- no depender del color ni de audio;
- subtítulos y etiquetas para todo dato sonoro relevante;
- reducción de movimiento, destellos y partículas;
- remapeo de teclado y controles táctiles ajustables;
- sin presión temporal obligatoria;
- modo de lectura para curvas, esquemas y mediciones;
- foco DOM, orden de tabulación y lector de pantalla en UI compartida.

Gamepad queda fuera del slice, pero la abstracción de acciones no debe impedir añadirlo.

## Audio

- Voces parciales: primeras líneas, escenas de transformación y momentos emocionales.
- Texto completo siempre disponible; ningún dato técnico depende de voz.
- Música de orquesta + electrónica: cada territorio tiene motivo acústico y capa técnica.
- El arreglo cambia al comprender el sistema; no recompensa sólo «encender».
- Sonido de instrumentos y mecanismos es informativo y dispone de equivalente visual/subtítulo.

## Guardado, PWA y sesiones

- Local-first, versionado y compatible con saves anteriores cuando exista migración.
- Autosave al cambiar región y después de una formalización; nunca durante una intervención
  peligrosa sin estado recuperable.
- Campañas descargables para offline; una actualización no elimina partida ni contenido activo.
- Sin cuenta obligatoria. Sincronización o vínculo con La Escuela son opt-in.
- Un fallo de red no bloquea campaña, Bitácora ni evaluación ya descargada.

## Métricas

Localmente: intentos, orden de pruebas, ayuda solicitada, tiempo activo aproximado y estado de
transferencia. Exportación anónima voluntaria; no incluye nombre, pronombres, texto libre ni ID
escolar. La métrica sirve para detectar confusión de diseño, no para calificar.

## Runtime y compatibilidad

- Vite + TypeScript + `RuntimeHost` y DOM compartido se preservan.
- Dirección futura: Three.js híbrido cargado bajo demanda.
- Reutilizar loader GLB/Draco existente antes de añadir otro.
- Modelos pedagógicos permanecen TypeScript puro.
- `destroy()` debe liberar escena, geometrías, materiales, texturas, audio y listeners.
- `/jugar` no cambia hasta un ADR después del slice.

## Definición de terminado por región

Una región necesita contenido V2, recorrido completo desktop/mobile, transformación visible y
social, Bitácora formalizada, evaluación opcional enlazada si existe, accesibilidad, tests de
modelo, consola limpia, captura comparada, métricas reales y prueba de que un habitante puede
mantener la solución. Build verde no equivale a terminar.
