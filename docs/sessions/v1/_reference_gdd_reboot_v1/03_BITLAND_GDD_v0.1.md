# PROYECTO ROXANA — BITLAND
## Game Design Document · Fundación v0.1 DRAFT

**Disciplina:** Computación / Programación  
**Verbo rector:** PROGRAMAR  
**Género:** top-down programmable adventure + automation puzzles  
**Estado:** propuesta nueva. No se encontró canon previo suficiente; todo lore específico de este documento es PROPOSED.

---

## 1. Resumen ejecutivo

Bitland es una ciudad-mundo ejecutable. Sus calles, puertas, transportes, máquinas y habitantes artificiales funcionan mediante instrucciones, estados y mensajes. El problema no es que el sistema haya dejado de correr: **sigue ejecutando reglas cuyo propósito se perdió**.

El jugador explora desde una vista cenital legible y puede inspeccionar, encadenar y finalmente programar comportamientos. Al principio manipula bloques físicos; con el tiempo comprende pseudocódigo, lógica, estructuras de datos, procesos y arquitectura.

### Fantasía
Entrar en una máquina viva, entender qué está ejecutando y convertir el caos en sistemas elegantes.

### Promesa
Lo aprendido se ve inmediatamente en el comportamiento del mundo.

---

## 2. Premisa de lore — PROPOSED

El Instituto utilizaba Bitland para enseñar computación haciendo que algoritmos y arquitectura se volvieran espacios transitables. No todo el mundo era una simulación abstracta: era una infraestructura persistente que podía conservar procesos durante años.

Cuando cesó el mantenimiento, tareas automáticas continuaron ejecutándose:
- repartidores siguen llevando paquetes a destinos inexistentes;
- puertas esperan señales que nunca llegan;
- procesos se duplican;
- fábricas producen recursos que nadie consume;
- relojes de distrito quedaron desincronizados;
- protocolos antiguos bloquean rutas nuevas.

La ciudad no está «infectada por un virus malvado». Sufre **automatización sin comprensión**.

### Tema
Una instrucción correcta puede producir un sistema incorrecto si se ejecuta fuera del contexto para el que fue creada.

### Frase guía
> Que algo funcione no significa que haga lo que querías.

---

## 3. Acceso desde el Instituto — PROPOSED

El Aula/Laboratorio de Computación contiene un terminal o rack antiguo que continúa encendido. En lugar de abrir un portal visual convencional, el jugador inicia una sesión y el espacio del aula se reconfigura gradualmente hasta convertirse en Bitland.

El artefacto de acceso podría ser:
- terminal de fósforo;
- tablero de relés;
- consola modular;
- perforadora/tarjetas como referencia histórica.

Decisión abierta: elegir una única identidad visual que pueda evolucionar con el progreso.

---

## 4. Género

### Macro
Aventura cenital de exploración + programación diegética + automatización.

### Microgéneros
- robot programming;
- Sokoban lógico;
- factory/automation;
- state-machine puzzles;
- routing/networking;
- logic gates;
- debugging;
- stealth programable;
- desafíos de eficiencia.

El juego no debe convertirse en un editor de código con una animación al costado. El código modifica un espacio que el jugador puede recorrer.

---

## 5. Core loop

**Explorar → observar comportamiento → inspeccionar reglas → modificar secuencia/estado → ejecutar → observar traza → depurar → automatizar → formalizar.**

El feedback principal es temporal y espacial: el jugador ve al sistema correr.

---

## 6. Mecánica de programación progresiva

### Etapa 1 — Instrucciones físicas
Bloques:
- MOVE;
- TURN;
- TAKE;
- DROP;
- WAIT;
- ACTIVATE.

El jugador ordena piezas como tarjetas o módulos.

### Etapa 2 — Decisión
- IF;
- ELSE;
- sensores;
- comparadores;
- condiciones.

### Etapa 3 — Repetición
- LOOP;
- WHILE;
- contadores;
- condiciones de salida.

### Etapa 4 — Abstracción
- funciones;
- parámetros;
- reutilización;
- descomposición.

### Etapa 5 — Estado y memoria
- variables;
- registros;
- listas/colas conceptuales;
- máquinas de estado.

### Etapa 6 — Concurrencia
- múltiples agentes;
- sincronización;
- mensajes;
- race conditions representadas visualmente.

### Etapa 7 — Arquitectura
- lógica booleana;
- puertas;
- memoria;
- CPU conceptual;
- buses;
- protocolos.

No todo jugador debe llegar al nivel de arquitectura para completar el primer producto.

---

## 7. Mundo como computadora

Metáforas espaciales recomendadas:

- calles = rutas de datos;
- paquetes = mensajes;
- estaciones = funciones/servicios;
- depósitos = memoria;
- intersecciones = decisión/routing;
- barrios = módulos;
- fábricas = pipelines;
- ciudadanos artificiales = procesos/agentes;
- reloj central = sincronización;
- puentes = interfaces;
- distritos = subsistemas;
- permisos/llaves = control de acceso.

Estas equivalencias deben ser útiles, no decorativas.

---

## 8. Personajes — PROPOSED

Bitland puede evitar humanos permanentes y apoyarse en entidades funcionales.

### PATCH — nombre provisional
Pequeño agente de mantenimiento que puede mostrar trazas y estados. No conoce «la solución», solo observa ejecución.

### Los Operadores
Registros incompletos de antiguos estudiantes/docentes o avatares de mantenimiento. Funcionan como pistas históricas, no como profesores.

### Procesos locales
Entidades con rutinas específicas. Algunas parecen tener personalidad porque llevan décadas ejecutando un comportamiento.

Decisión abierta: cuánto antropomorfismo tendrá Bitland.

---

## 9. Gramática de puzzles

### Secuencia
Ordenar tareas para obtener un resultado.

### Condición
Reaccionar a estados del mundo.

### Bucle
Resolver rutas repetitivas sin programar cada paso.

### Función
Crear comportamiento reusable.

### Estado
Recordar información entre eventos.

### Routing
Enviar paquetes a destinos correctos.

### Concurrencia
Coordinar agentes sin bloquearse ni pisarse.

### Optimización
Reducir pasos, memoria, ciclos o recursos.

### Depuración
Partir de un sistema existente que «casi funciona» y encontrar una causa.

---

## 10. Dificultad y evaluación

Un puzzle puede aceptar muchas soluciones.

Métricas opcionales:
- cantidad de instrucciones;
- ciclos de ejecución;
- memoria;
- energía/recursos del sistema;
- robustez frente a inputs nuevos;
- legibilidad.

La campaña no debería castigar una solución larga si es correcta. La optimización pertenece a maestría.

---

## 11. Arcos propuestos

### ARCO I — INSTRUCCIÓN
Secuencia, orientación, acciones, ejecución y debugging básico.

### ARCO II — DECISIÓN
Condicionales, sensores, booleanos y loops.

### ARCO III — ABSTRACCIÓN
Funciones, parámetros, variables y descomposición.

### ARCO IV — SISTEMAS
Estado, estructuras simples, procesos múltiples y mensajes.

### ARCO V — MÁQUINA
Puertas lógicas, memoria, CPU conceptual y arquitectura.

### ARCO VI — RED
Protocolos, comunicación, distribución y seguridad conceptual.

### EMPALME CON OHMDAL
Control de robots reales del universo Roxana: sensores, actuadores y comportamiento.

---

## 12. Vertical slice

### Duración
15–20 minutos.

### Secuencia
1. Laboratorio de Computación.
2. Entrada a un distrito logístico detenido.
3. Robot repartidor con secuencia incompleta.
4. Primer programa de MOVE/TURN/TAKE/DROP.
5. ruta con obstáculo → IF.
6. depósito repetitivo → LOOP.
7. puzzle integrador con dos rutas posibles.
8. el jugador reactiva una estación y ve decenas de agentes ejecutar de forma coordinada.
9. Bitácora formaliza secuencia, condición y repetición.
10. gancho: al fondo se observa el reloj central desincronizado.

### North Star del slice
El jugador debe sentir satisfacción al **ver una conducta compleja emerger de pocas reglas**.

---

## 13. Dirección visual

### Cámara
Cenital o isométrica ligera, pensada para leer rutas y estados.

### Estética
No convertir todo en neón cyberpunk.

Propuesta:
- infraestructura modular;
- materiales técnicos y urbanos;
- señalética;
- cintas, rieles, compuertas, nodos;
- luz como estado;
- zonas antiguas de relés y zonas modernas progresivas;
- pixel/voxel/low-poly híbrido posible.

El mundo puede contar una historia de la computación mediante arquitectura, sin convertirse en museo literal.

---

## 14. UI y debugging

La UI debe responder preguntas del jugador:
- ¿qué instrucción se ejecuta ahora?;
- ¿qué condición fue verdadera?;
- ¿qué estado tiene esta entidad?;
- ¿por qué se detuvo?;
- ¿qué mensaje recibió?;

Herramientas:
- step;
- pause;
- rewind corto;
- highlight de instrucción;
- traza visual;
- breakpoint diegético en contenido avanzado.

---

## 15. Bitácora

Puede guardar programas reales del jugador y traducirlos:

**Vivencia:** secuencia de tarjetas.  
**Formalización:** algoritmo/pseudocódigo.  
**Extensión:** versión textual equivalente.  
**Maestría:** desafío de hacerlo más general.

El jugador debería poder ver que una misma idea existe como:
- bloques;
- diagrama;
- pseudocódigo;
- código real opcional.

---

## 16. Accesibilidad

- ejecución lenta x0.25/x0.5;
- step-by-step;
- iconos + texto;
- no depender solo del color;
- modo sin presión temporal;
- historial de estados;
- explicación de errores sin revelar solución.

---

## 17. Riesgos

1. sentirse como deber de programación → movimiento, exploración y consecuencias visuales deben tener peso propio;
2. editor demasiado complejo → revelar sintaxis gradualmente;
3. metáforas falsas → revisar cada equivalencia técnica;
4. optimización punitiva → separar completar de dominar;
5. mundo impersonal → procesos, historia ambiental y restauración deben aportar emoción.

---

## 18. Criterio de éxito

Bitland funciona cuando un jugador dice:

> «Programé el comportamiento de la ciudad y pude ver exactamente por qué mi idea fallaba.»
