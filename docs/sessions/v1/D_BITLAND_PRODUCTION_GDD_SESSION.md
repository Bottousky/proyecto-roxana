# SESIÓN D — BITLAND FOUNDATION + PRODUCTION GDD
## PROGRAMAR un mundo ejecutable

**Misión:** construir la identidad de Bitland casi desde cero sin copiar un juego de programación existente.

**Fuente principal:** `03_BITLAND_GDD_v0.1.md`  
**Depende de:** Sesión A.

---

# 1. Documentos obligatorios

1. `BITLAND_VISION_v1.md`
2. `BITLAND_WORLD_METAPHOR_v1.md`
3. `BITLAND_PROGRAMMING_LANGUAGE_GAMEPLAY_v1.md`
4. `BITLAND_AUTOMATION_SYSTEM_v1.md`
5. `BITLAND_PUZZLE_GRAMMAR_v1.md`
6. `BITLAND_MECHANICS_PROGRESSION_v1.md`
7. `BITLAND_NARRATIVE_BIBLE_v1.md`
8. `BITLAND_ARC_01_v1.md`
9. `BITLAND_VERTICAL_SLICE_v1.md`
10. `BITLAND_PROTOTYPE_EVALUATION_v1.md`

---

# 2. North Star

> El jugador no responde qué hace un algoritmo: escribe o ensambla comportamiento y observa cómo el mundo lo ejecuta.

---

# 3. Player fantasy

> Puedo mirar una ciudad llena de rutinas incomprensibles, descubrir qué procesos la sostienen, reprogramarlos, automatizar tareas y construir sistemas cada vez más generales.

---

# 4. Verbo nuclear

**PROGRAMAR**

Primarios:
- ordenar;
- secuenciar;
- condicionar;
- iterar;
- abstraer;
- depurar;
- automatizar.

Secundarios:
- almacenar;
- comparar;
- enviar;
- recibir;
- sincronizar;
- paralelizar;
- enrutar;
- optimizar.

---

# 5. Metáfora del mundo

Bitland es una **ciudad ejecutable**.

Propuesta:
- ciudadanos/autómatas = procesos/agentes;
- calles = rutas de datos;
- estaciones = funciones/servicios;
- paquetes = datos;
- depósitos = memoria;
- señales = eventos;
- reloj urbano = clock;
- barrios = módulos;
- puentes = interfaces;
- archivos = persistencia;
- bugs = comportamientos emergentes/errores, no monstruos genéricos.

La metáfora no debe forzarse cuando un concepto necesita representación diferente.

---

# 6. Cámara y exploración

Top-down / isométrica ligera permite:
- ver flujos;
- observar varios agentes;
- editar rutas;
- anticipar estados;
- construir automatización.

El jugador se mueve como personaje y también entra en **modo de programación contextual**.

---

# 7. Lenguaje de programación jugable

## Etapa 1 — bloques físicos
`MOVE`, `PICK`, `DROP`, `TURN`.

## Etapa 2 — condiciones
`IF`, sensores, comparadores.

## Etapa 3 — loops
`REPEAT`, `WHILE`.

## Etapa 4 — memoria
variables / slots / estado.

## Etapa 5 — funciones
subrutinas, parámetros.

## Etapa 6 — concurrencia
varios procesos.

## Etapa 7 — comunicación
mensajes / eventos / colas.

## Etapa 8 — arquitectura
servicios, interfaces, recursos compartidos.

### Regla
La representación puede migrar:
piezas → pseudocódigo → código textual opcional/avanzado.

No obligar a escribir sintaxis antes de comprender semántica.

---

# 8. Ejecución visible

El tiempo de ejecución debe poder:
- reproducirse;
- pausarse;
- step-by-step;
- mostrar estado;
- resaltar instrucción actual;
- inspeccionar variables;
- visualizar mensajes.

**Debugging es gameplay**, no herramienta externa.

---

# 9. Puzzle Grammar

## B1 — Secuencia
Orden correcto de acciones.

## B2 — Generalización
La misma solución debe funcionar con inputs distintos.

## B3 — Condición
Responder a estado variable.

## B4 — Repetición
Eliminar trabajo redundante con loop.

## B5 — Memoria
Recordar información necesaria.

## B6 — Abstracción
Crear función reutilizable.

## B7 — Debugging
Encontrar el error en sistema existente.

## B8 — Automatización
Diseñar un proceso continuo.

## B9 — Concurrencia
Varios agentes interactúan.

## B10 — Sincronización
Evitar carrera / espera / conflicto.

## B11 — Routing
Mover datos/recursos por red.

## B12 — Optimización
menos pasos, menos memoria, más throughput, más robustez.

---

# 10. Cultura y conflicto

Propuesta fuerte:
Bitland siguió ejecutándose tras perder el vínculo con el Instituto.

Nadie “rompió” la ciudad. Su problema es que:
- procesos viejos siguen corriendo;
- optimizaciones locales chocan;
- rutinas se volvieron ritual;
- algunos servicios tienen consumidores que ya no existen;
- nadie conoce el sistema completo.

Tema:
> Una máquina puede seguir funcionando mucho después de que se pierda el motivo de su diseño.

Eso espeja Ohmdal sin repetirlo:
- Ohmdal pierde modelo de infraestructura física.
- Bitland pierde intención y arquitectura del comportamiento.

---

# 11. Progression proposal

## Arco I — Instrucciones
secuencia → condición → loop.

## Arco II — Estado
variables → memoria → máquinas de estado.

## Arco III — Abstracción
funciones → parámetros → módulos.

## Arco IV — Muchos a la vez
concurrencia → eventos → sincronización.

## Arco V — Ciudad conectada
redes → servicios → tolerancia a fallos → arquitectura.

---

# 12. Arco I propuesta

### Capítulo 0 — El mensajero
Programa un autómata con acciones directas.

### Capítulo 1 — La calle cambia
El camino no es siempre igual: aparece condición.

### Capítulo 2 — Cien cajas
La repetición manual se vuelve absurda: loop.

### Capítulo 3 — El error que vuelve
Debugging de una rutina heredada.

### Final — Terminal de reparto
Automatizar una pequeña instalación que recibe inputs variables.

El jugador debe sentir el salto:
“di instrucciones” → “construí comportamiento”.

---

# 13. Vertical Slice

1. llegada a un sector detenido;
2. robot ejecuta rutina defectuosa;
3. jugador ensambla 3–5 comandos;
4. ejecución visible;
5. input cambia y la solución rígida falla;
6. condición;
7. repetición;
8. pequeño debugging;
9. automatización estable;
10. ciudad reacciona y Bitácora traduce a pseudocódigo.

### Prueba
- ¿es divertido observar ejecución?;
- ¿el jugador comprende estado?;
- ¿programar se siente como poder sobre el mundo?;
- ¿se aprende generalización sin clase?;
- ¿debugging genera satisfacción?;
- ¿el sistema escala sin UI abrumadora?

---

# 14. Definition of Done

- metáfora de ciudad ejecutable estabilizada;
- lenguaje de bloques/pseudocódigo definido;
- ejecución/debugging diseñados;
- 8+ familias de puzzle;
- progression de conceptos;
- Arco I y slice;
- lore sigue PROPOSED hasta ratificación.

---

# 15. Prompt de arranque

> Actúa como Lead Game Designer + Programming Systems Designer para Bitland. El verbo nuclear es PROGRAMAR. Diseña una top-down/isometric programmable adventure, no una plataforma de ejercicios ni una copia de Human Resource Machine. Bitland debe sentirse como una ciudad ejecutable: procesos, datos, memoria, eventos, automatización y arquitectura son parte del mundo. El jugador empieza manipulando comportamiento con bloques físicos y puede progresar hacia pseudocódigo y representaciones más formales. Debugging y ejecución observable son parte central del gameplay. Produce World Metaphor, Programming Language Gameplay, Automation System, Puzzle Grammar, Mechanics Progression, Narrative Bible, Arco I, Vertical Slice y Prototype Evaluation. Marca todo lore nuevo como PROPOSED.
