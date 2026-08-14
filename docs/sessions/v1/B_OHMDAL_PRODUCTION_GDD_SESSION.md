# SESIÓN B — OHMDAL PRODUCTION GDD
## CONECTAR como juego producible

**Misión:** transformar el GDD conceptual de Ohmdal en un diseño de producción y especificar un vertical slice que valide el verbo `CONECTAR`.

**Fuente principal:** `01_OHMDAL_GDD_REBOOT_v1.md`  
**Depende de:** resultados de la Sesión A.

---

# 1. Documentos obligatorios

1. `OHMDAL_VISION_v1.md`
2. `OHMDAL_CORE_GAMEPLAY_v1.md`
3. `OHMDAL_ELECTRICAL_SYSTEM_v1.md`
4. `OHMDAL_PUZZLE_GRAMMAR_v1.md`
5. `OHMDAL_MECHANICS_PROGRESSION_v1.md`
6. `OHMDAL_WORLD_STRUCTURE_v1.md`
7. `OHMDAL_NARRATIVE_BIBLE_v1.md`
8. `OHMDAL_ARC_01_v1.md`
9. `OHMDAL_VERTICAL_SLICE_v1.md`
10. `OHMDAL_PROTOTYPE_EVALUATION_v1.md`

---

# 2. North Star

> El jugador debe poder mirar una instalación de Ohmdal, formar un modelo mental de cómo circula y se controla la energía, intervenirla y observar al mundo reaccionar.

No es “un JRPG con preguntas de electrónica”.

---

# 3. Player fantasy

> Soy capaz de entender una civilización eléctrica que conservó procedimientos pero olvidó principios. Leo su infraestructura como otros leerían magia, la reparo, la rediseño y devuelvo funciones enteras a la vida.

---

# 4. Verbos

## Nuclear
**CONECTAR**

## Primarios
- observar;
- medir;
- conectar;
- regular;
- activar.

## Secundarios
- aislar;
- derivar;
- proteger;
- invertir polaridad;
- almacenar;
- descargar;
- temporizar;
- conmutar;
- sensar;
- accionar;
- automatizar;
- optimizar.

---

# 5. Interaction model — borrador

El jugador explora libremente. Los sistemas eléctricos no deberían abrir siempre una pantalla separada: en la medida posible, existen **en el escenario**.

### Modos
**Exploración**
- movimiento;
- inspección;
- diálogo;
- manipulación simple.

**Lectura de red**
- resalta nodos y conexiones relevantes;
- muestra estado cualitativo sin resolver el puzzle;
- permite sacar instrumentos.

**Intervención**
- conectar/desconectar;
- insertar componentes;
- seleccionar puntos de medición;
- cambiar configuración.

### Regla
La interfaz debe tender a **diegética + overlay técnico**, no a “minijuego desconectado del mundo”.

---

# 6. Sistema eléctrico jugable

No hace falta simular SPICE. Sí hace falta un sistema coherente.

## Nivel 0 — estado
- alimentado / no alimentado;
- continuidad;
- polaridad;
- carga activa.

## Nivel 1 — magnitudes
- tensión;
- corriente;
- resistencia;
- límites.

## Nivel 2 — topología
- serie;
- paralelo;
- nodos;
- reparto.

## Nivel 3 — potencia y protección
- potencia;
- calentamiento;
- fusibles/protecciones;
- dimensionamiento.

## Nivel 4 — comportamiento temporal
- capacitores;
- carga/descarga;
- retardo;
- pulsos.

## Nivel 5 — dirección/control
- diodo;
- transistor;
- conmutación;
- señal.

## Nivel 6 — sistema
- sensores;
- actuadores;
- motores;
- PWM;
- control lógico;
- cruces con Bitland.

### Principio
Cada capa nueva agrega **nuevas decisiones**, no solo números.

---

# 7. Feedback model

El jugador debe inferir estado sin abrir manual:

- iluminación;
- velocidad de giro;
- vibración;
- timbre/hum eléctrico;
- calor;
- cambio de color/material;
- protección disparada;
- respuesta de Ohm;
- instrumentos;
- actividad de NPCs;
- transformación ambiental.

Cuando sea necesaria precisión, aparece la medición numérica.

---

# 8. Failure model

Fallas útiles:
- circuito abierto;
- cortocircuito;
- caída excesiva;
- sobrecorriente;
- potencia insuficiente;
- polaridad incorrecta;
- carga saturada;
- secuencia temporal incorrecta;
- control inestable.

El fallo no mata arbitrariamente al jugador. **Expone comportamiento**.

---

# 9. Puzzle Grammar

## P1 — Continuidad
Encontrar/cerrar un camino completo.

Variables:
- cantidad de interrupciones;
- rutas alternativas;
- retornos ocultos;
- switches.

## P2 — Diagnóstico
El sistema debería funcionar y no funciona.

Herramientas:
- observación;
- continuidad;
- voltaje;
- aislamiento por tramos.

## P3 — Distribución
Varias cargas necesitan energía con restricciones distintas.

## P4 — Topología
Reconfigurar serie/paralelo para cambiar comportamiento.

## P5 — Dimensionamiento
Elegir componente/fuente/protección adecuada.

## P6 — Energía útil
Convertir energía eléctrica en luz, calor o movimiento con objetivos.

## P7 — Tiempo
Cargar/descargar/retardar/sincronizar.

## P8 — Dirección
Controlar por dónde y cuándo puede circular.

## P9 — Control
Una señal pequeña gobierna una acción mayor.

## P10 — Automatización
Sensores + lógica + actuadores.

## P11 — Optimización
Funciona, pero:
- usa demasiado;
- calienta;
- es frágil;
- desperdicia;
- no escala.

## P12 — Sistema abierto
Objetivo funcional con varias arquitecturas válidas.

---

# 10. Curva de dificultad

Aumentar por:
1. más elementos observables;
2. causa–efecto más distante;
3. más estados posibles;
4. restricciones;
5. combinación de ideas;
6. perturbaciones;
7. optimización.

Evitar introducir cinco componentes nuevos a la vez.

---

# 11. Progression proposal

## Arco I — La Red
continuidad → V/I/R → serie/paralelo → potencia/protección.

**Cambio de fantasía:** de “puedo encender algo” a “puedo diagnosticar y distribuir energía”.

## Arco II — El Tiempo
capacitores → pulsos → temporización → rectificación/dirección.

## Arco III — El Control
transistor → señal → sensores → actuadores → automatización.

## Arco IV — Los Sistemas
máquinas más abiertas; integración con Bitland/Physica.

---

# 12. Lore: qué conservar y qué reescribir

## Conservar como candidatos fuertes
- Edda;
- Maese Lumen;
- Ohm;
- cultura ritualizada;
- infraestructura histórica;
- Pacto de los Tres Signos;
- Instituto como origen/vínculo.

## Reescribir
La historia debe nacer de la infraestructura.

Ejemplo:
- un barrio idolatra “el orden correcto de las palancas” porque esa secuencia alguna vez protegía una red;
- un taller prohíbe conectar dos cargas en paralelo porque una instalación vieja estaba subdimensionada;
- Lumen posee procedimientos razonables pero generaliza de manera incorrecta.

Así las misconcepciones son cultura, no clase.

---

# 13. ARCO I — propuesta de estructura

## Capítulo 0 — La lámpara
Objetivo: entender que hace falta camino completo.
Sin fórmula.

## Capítulo 1 — El manantial
Introducir fuente/potencial de manera cualitativa.
Restauración: pequeña bomba / iluminación.

## Capítulo 2 — Tres signos
Medición de V/I/R.
Edda y Lumen interpretan evidencia de modo distinto.

## Capítulo 3 — Los dos caminos
Serie/paralelo y distribución.
La red del pueblo deja de depender de una receta ritual.

## Capítulo 4 — El taller caliente
Potencia, límites, protección.
El jugador descubre que “hacer que funcione” no es suficiente.

## Final de Arco — Plaza encendida
Desafío abierto: alimentar varias funciones con recursos y límites.
Debe admitir más de una solución segura.

---

# 14. Vertical Slice — 20 a 30 minutos

## VS-01 Portal / entrada
Objetivo: misterio y primera affordance eléctrica.

## VS-02 Edda + sistema apagado
El jugador ve causa material antes de teoría.

## VS-03 Ohm
Ohm reacciona a energía y ayuda a leer estado.

## VS-04 Primer circuito
Cerrar continuidad en el entorno.
Recompensa inmediata visible.

## VS-05 Manantial
Dos o tres rutas posibles; una solución “funciona” pero revela problema de carga.

## VS-06 Medición
Instrumento aparece porque la intuición ya no alcanza.

## VS-07 Puzzle integrador
Distinguir entre encender, alimentar bien y proteger.

## VS-08 Restauración
Plaza / taller / fuente cambia notablemente.
Bitácora formaliza.

### El slice debe probar
- ¿conectar es divertido?;
- ¿el sistema se entiende mirando?;
- ¿medir se siente como poder, no tarea escolar?;
- ¿la restauración emociona?;
- ¿Edda/Lumen/Ohm agregan valor sin explicar de más?;
- ¿el HD-2D soporta lectura de redes?;
- ¿varias soluciones son legibles?

---

# 15. Métricas de prototipo

No optimizar todavía retención comercial. Medir diseño:

- tiempo hasta primera hipótesis correcta;
- cantidad de intentos informativos;
- porcentaje que entiende continuidad sin texto;
- capacidad de explicar por qué una solución funciona;
- uso voluntario de medición;
- cantidad de soluciones distintas;
- cantidad de hints requeridos;
- percepción de “estoy reparando un lugar” vs “estoy haciendo ejercicios”.

---

# 16. Definition of Done

La sesión B termina cuando:
- existe un interaction model preciso;
- el sistema eléctrico abstracto está acotado;
- cada familia de puzzle tiene variables de dificultad;
- Arco I tiene progression coherente;
- el vertical slice tiene beats y criterios de éxito;
- se diferencia CANON de EXPERIMENTAL;
- no se eligió tecnología como sustituto de diseño.

---

# 17. Prompt de arranque

> Actúa como Lead Game Designer + Systems Designer de Ohmdal dentro de Proyecto Roxana. Parte del GDD Reboot y de la Design Constitution global. Tu misión es llevar Ohmdal de concepto a GDD de producción. El verbo nuclear es CONECTAR. Dragon Quest III HD-2D es referencia de lenguaje visual y sensación de mundo, no plantilla de combate. Prioriza aventura, lectura de infraestructura, circuit dungeons, medición, múltiples soluciones y restauración visible. Conserva Edda, Lumen y Ohm solo en la medida en que refuercen el gameplay. Diseña el sistema eléctrico a la fidelidad mínima necesaria para ser coherente y pedagógicamente transferible, sin caer en simulación innecesaria. Debes producir Core Gameplay, Electrical System, Puzzle Grammar, Mechanics Progression, World Structure, Narrative Bible, Arco I, Vertical Slice y Prototype Evaluation. Toda afirmación nueva de lore debe quedar PROPOSED salvo que ya sea CANON.
