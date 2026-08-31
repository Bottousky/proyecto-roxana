---
status: EXPERIMENTAL
authority: PROPOSED
---

# Apuesta de producción

## Recomendación

Apostar por **3D estilizado de baja complejidad geométrica, texturas pintadas, materiales compartidos y dirección de luz fuerte**, con personajes volumétricos de animación contenida.

La apuesta no es que “3D sea mejor”. Es que esta forma compra la combinación más difícil para Ohmdal:

- paseo libre;
- infraestructura que se sigue y rodea;
- estados eléctricos que cambian sin repintar un fondo completo;
- composición de diorama;
- personajes presentes;
- reutilización sistemática sin que cada lugar parezca una copia;
- acercamientos de inspección con el mismo mundo y los mismos objetos.

## Presupuesto visual: dónde gastar

### Alto

- siluetas de personajes principales;
- kit de infraestructura eléctrica y estados;
- iluminación y respuesta visual de cargas;
- una familia arquitectónica por territorio de prueba;
- animaciones de interacción de manos, herramientas y Ohm;
- soundscape causal;
- composición de lugares y rutas visuales.

### Medio

- props de oficio reutilizables;
- variaciones pintadas de piedra, madera, cerámica y metal;
- habitantes secundarios por familias de silueta;
- clima y vegetación que no oculten instalaciones;
- conversaciones con poses y cámaras simples.

### Bajo

- microdetalle invisible durante el juego;
- interiores sin función;
- multitudes;
- animación facial extensa;
- cinemáticas;
- física decorativa;
- materiales hiperrealistas;
- coleccionables sin función.

## Sistema de arte en principio

### 1. Biblia de formas

Definir pocas reglas antes de producir volumen:

- densidad geométrica máxima por escala;
- radios, biseles y proporciones recurrentes;
- familias de silueta para infraestructura;
- grosor visual mínimo de conductores;
- tamaños de manos, bornes y puntos de prueba;
- detalle permitido para fondo, interacción y personaje.

Un asset que necesita una excepción visual debe justificar qué comunica.

### 2. Biblioteca modular

Crear piezas que se combinan:

- arcos, pilares, escaleras, vigas, balcones y muros;
- barras, aisladores, conectores, interruptores y protecciones;
- cargas por oficio;
- reparaciones, lacres, marcas, abrazaderas y desgaste;
- ventanas, textiles, utensilios y mobiliario.

La modularidad se oculta con composición, color local, decals pintados, clutter funcional y reparaciones históricas. No con cientos de piezas únicas.

### 3. Materiales compartidos

Una paleta pequeña de materiales responde de forma coherente a luz, calor, humedad y abandono. Las variaciones proceden de máscaras pintadas y estados:

- normal;
- sin energía;
- caliente;
- actuado/protegido;
- reparado;
- abandonado.

Esto permite que el fenómeno sea consistente entre lugares y reduce la deriva visual de producción agentic.

### 4. Contratos de generación asistida

La IA puede acelerar:

- hojas de variaciones dentro de una silueta aprobada;
- bocetos de composición;
- propuestas de clutter por oficio;
- máscaras y motivos;
- thumbnails de luz;
- documentación y catalogación;
- validación automática de escala, nombres y materiales.

No debe decidir:

- lore;
- función eléctrica;
- silueta canónica;
- causalidad del desgaste;
- estado pedagógico;
- qué detalle entra al juego.

Cada asset generado necesita provenance, revisión humana y prueba dentro de una escena. La consistencia se protege con plantillas, semillas/referencias controladas y criterios visuales binarios; no con prompts aislados.

### 5. Un único ensamblaje observable

Arquitectura, infraestructura, personajes y luz se evalúan juntos desde el primer slice. Producir “fondos bonitos” por un lado y un sistema eléctrico por otro crea dos lenguajes incompatibles.

## Comparación de formas

### 3D estilizado ilustrado — recomendado

**Exploración:** alta; permite rodear, seguir, comparar y reencuadrar.

**Electrónica:** alta; topología y estado existen físicamente, con acercamientos precisos.

**Consistencia:** alta si la geometría, paleta y materiales están restringidos.

**Coste:** medio-alto al crear los primeros kits, luego amortizable.

**Riesgos:** animación de personajes, densidad de lugares y tentación de perseguir realismo.

**Mitigación:** animación de pose clara, lugares compactos, límites de detalle y una prueba vertical centrada en interacción.

### Cuadros 2D pintados

**Exploración:** media; excelente observación, menor continuidad espacial.

**Electrónica:** media; muy clara dentro de un encuadre, costosa para muchas variantes y rutas.

**Consistencia:** alta con un director visual fuerte; difícil con múltiples generadores o artistas.

**Coste:** bajo en ingeniería, alto y lineal en fondos, estados y animación.

**Riesgos:** pipeline de pintura se vuelve cuello de botella; interacción parece point-and-click clásica y la conexión puede fragmentarse.

**Mejor uso potencial:** conversaciones, recuerdos o inserts de Bitácora, no lenguaje principal.

### Pixel-en-3D / HD-2D

**Exploración:** media-alta; buena claridad de diorama y nostalgia.

**Electrónica:** media; los sprites pequeños dificultan manos, bornes y gestos; el mundo 3D sí ayuda a rutas.

**Consistencia:** media; unir pixel, volumen, luz, sombras y profundidad exige una disciplina técnica y artística propia.

**Coste:** medio-alto; requiere dos pipelines y mucha iteración para que no parezca una mezcla.

**Riesgos:** asociar la propuesta con un JRPG de combate, exceso de desenfoque y menor expresividad de personajes.

**Conclusión:** las referencias demuestran que el encuadre funciona, pero la técnica no compra suficiente ventaja pedagógica frente al coste de coherencia.

### Primera persona estilizada

**Exploración:** muy alta en presencia y asombro.

**Electrónica:** muy alta en manipulación local; media en lectura global de ramas.

**Consistencia:** media-alta, pero la cámara cercana exige más detalle.

**Coste:** alto en entornos y animación de manos; menor en cuerpo del protagonista.

**Riesgos:** mareo, búsqueda visual, pérdida de presencia del estudiante y relaciones menos legibles.

**Mejor uso potencial:** modo breve de inspección corporal dentro de la dirección recomendada.

## Pipeline de validación propuesto

### Fase A — prueba visual de dos semanas

Producir el sector de Plaza definido en
[SLICE_PLAZA.md](SLICE_PLAZA.md), con:

- arquitectura modular;
- Portal, cobre, agua detenida y campana sin respuesta en una composición legible;
- un Camino seguro con ida, carga y retorno abierto;
- estados apagado, residual, estable y protección activa;
- estudiante, Edda y Ohm inerte/despierto como siluetas funcionales;
- tarde cálida;
- primer encuentro con Edda, conexión y acercamiento de continuidad con Ohm.

**Gate:** cinco observadores identifican sin texto la anomalía principal, el
Camino, la interrupción y qué estado cambió al despertar Ohm.

### Fase B — prueba de aprendizaje

Implementar el despertar de Ohm descrito en
[SLICE_PLAZA.md](SLICE_PLAZA.md): inspección, predicción, retorno abierto,
conexión y una comprobación inmediata de continuidad.

**Gate:** al menos 4 de 5 jugadores nuevos localizan el retorno sin un marcador
de solución y explican que una respuesta sostenida necesita un Camino completo;
usan luego a Ohm para contrastar dos puntos, no para barrer objetos.

### Fase C — prueba de producción

Crear un segundo lugar con el mismo kit eléctrico pero otra arquitectura y oficio.

Medir:

- horas por lugar;
- porcentaje de piezas reutilizadas;
- cantidad de excepciones;
- deriva de escala y material;
- tiempo de crear un nuevo estado;
- legibilidad con cámara de paseo;
- rendimiento en hardware objetivo por definir.

**Gate:** el segundo lugar se siente distinto, el sistema se reconoce y el coste baja de forma material.

## Riesgos agentic-art

### Deriva estilística

Un generador tiende a agregar detalle y cambiar proporciones. Se controla con turnarounds aprobados, paleta cerrada, renders de referencia y revisión comparativa.

### Belleza sin función

Los assets plausibles pueden no contar causalidad. Todo prop de infraestructura declara función, estado, puntos de conexión y señales de fallo.

### Variantes inconsistentes

Un objeto “encendido” no puede ser otra composición. Los estados derivan del mismo master geométrico y comparten cámara, proporción y puntos de anclaje.

### Volumen de revisión

Generar barato puede encarecer curación. Se limita el lote, se aprueba por familias y se descarta temprano.

## Stop conditions

Reconsiderar la apuesta si:

- la cámara no permite seguir una red sencilla sin ayudas invasivas;
- la interacción precisa se siente torpe tras dos iteraciones informadas;
- producir un segundo lugar no reutiliza de forma convincente;
- los personajes no son legibles sin subir mucho el coste;
- los playtests entienden mejor la instalación en un storyboard 2D que en el espacio interactivo;
- la dirección exige detalle cercano comparable a realismo para resultar agradable.

## Decisión humana necesaria después del spike

Manuel debería decidir con evidencia de tres cosas juntas, no con una captura:

1. ¿Da ganas de caminar y mirar?
2. ¿Se entiende una relación eléctrica sin explicación previa?
3. ¿El equipo puede producir un segundo lugar consistente a coste sostenible?

Si una falla, no hay dirección ganadora todavía.

