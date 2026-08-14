# PROYECTO ROXANA — ARITHMOS
## Game Design Document · Fundación v0.1 DRAFT

**Disciplina:** Matemática  
**Verbo rector:** TRANSFORMAR  
**Género:** aventura isométrica de puzzles matemáticos y espaciales  
**Estado:** propuesta nueva. No se encontró canon previo suficiente; todo lore específico es PROPOSED.

---

## 1. Resumen ejecutivo

Arithmos es un mundo donde cantidades, relaciones y formas son propiedades manipulables de la materia. Los números no aparecen como preguntas flotantes: alteran longitud, peso, duplicación, simetría, rutas, partición y geometría.

El jugador explora arquitectura imposible y resuelve el espacio **transformando relaciones matemáticas**.

### Fantasía
Descubrir que una idea abstracta puede cambiar físicamente el mundo.

### Promesa
Cada concepto matemático introduce una nueva operación sobre objetos, caminos o reglas.

---

## 2. Premisa de lore — PROPOSED

Arithmos fue utilizado para enseñar que una misma estructura puede representarse de muchas maneras. Con el tiempo, sus habitantes/guardianes empezaron a conservar símbolos sin conservar equivalencias.

Regiones que antes podían transformarse entre representaciones compatibles quedaron aisladas porque cada comunidad defendía una sola forma «correcta» de describirlas.

El deterioro de Arithmos no es falta de cálculo: es **pérdida de relación**.

### Tema
Comprender matemática no es recordar un símbolo, sino reconocer qué se conserva cuando una representación cambia.

### Frase guía
> Cambiar la forma no siempre cambia lo que es.

---

## 3. Acceso desde el Instituto — PROPOSED

El Aula de Matemática contiene un gran tablero de dibujo, instrumentos geométricos, ábacos, reglas, compases y modelos sólidos. Un mecanismo de proyección convierte un diagrama plano en un espacio isométrico navegable.

Artefacto protagonista posible:
- compás/astrolabio geométrico;
- regla plegable;
- prisma de transformación;
- tablero cuadriculado.

Decisión abierta: seleccionar uno que sea visualmente icónico y útil a varios arcos.

---

## 4. Género

Aventura isométrica 2.5D centrada en puzzles espaciales, lógicos y numéricos.

Microgéneros:
- Sokoban matemático;
- number puzzles;
- geometry construction;
- rule manipulation;
- pathfinding;
- graph puzzles;
- combinatoria;
- optimización;
- probabilidad;
- criptografía en contenido avanzado.

No usar combate convencional como estructura principal.

---

## 5. Core loop

**Observar relación → seleccionar operación → transformar objeto/espacio → comprobar invariantes → combinar → abrir nueva ruta → formalizar.**

El feedback es geométrico y físico: el mundo cambia ante los ojos del jugador.

---

## 6. Mecánica fundamental: entidades matemáticas como objetos

### Cantidades
Bloques con cantidad pueden:
- agruparse;
- separarse;
- duplicarse;
- compararse;
- factorizarse.

### Operaciones
Una operación no es una pregunta. Es una herramienta.

Ejemplos:
- ×2 duplica una longitud o cantidad;
- ÷2 divide un puente en dos tramos equivalentes;
- +3 agrega unidades físicas;
- −1 invierte o desplaza dentro de un eje definido;
- factorizar cambia una pieza en módulos compatibles.

### Igualdad
El signo = puede funcionar como vínculo de equivalencia: dos configuraciones diferentes pueden activar el mismo mecanismo si representan la misma cantidad/relación.

### Variables
Objetos desconocidos con restricciones observables. El jugador deduce qué transformación satisface varias condiciones.

---

## 7. Gramática de puzzles

### A. Cantidad y operaciones
- combinar recursos;
- formar objetivos;
- elegir descomposiciones;
- múltiples caminos equivalentes.

### B. Divisibilidad y factores
- puertas que aceptan particiones compatibles;
- construcción modular;
- primos como estructuras indivisibles dentro de una gramática específica.

### C. Fracciones y proporciones
- dividir superficies;
- mezclar proporciones;
- escalas;
- recetas estructurales;
- semejanza.

### D. Números negativos
- dirección;
- balance;
- deuda/crédito diegético;
- simetrías alrededor de origen.

### E. Geometría
- construir triángulos;
- ángulos;
- áreas;
- perímetros;
- congruencia;
- semejanza;
- transformaciones.

### F. Álgebra
- incógnitas como piezas;
- máquinas de función;
- equivalencias;
- sistemas simples.

### G. Funciones
Máquinas `x → f(x)` que transforman objetos. El desafío es inferir, componer o invertir transformaciones.

### H. Combinatoria
- rutas;
- configuraciones;
- permutaciones;
- conteo sin enumeración absurda.

### I. Probabilidad
- mecanismos estocásticos visibles;
- planificación de riesgo;
- frecuencia vs probabilidad;
- decisiones con información incompleta.

### J. Grafos
- conectar nodos;
- rutas mínimas;
- coloreo;
- flujo;
- redes.

### K. Teoría de números / criptografía
Contenido avanzado: restos, modularidad, primos, ciclos.

---

## 8. Regla de diseño: invariantes

Arithmos necesita una idea propia que una todo el juego:

> Cada transformación cambia algo y conserva algo.

Los puzzles deben enseñar al jugador a preguntar:
- ¿qué se mantiene igual?;
- ¿qué cambia?;
- ¿qué representación es más útil?;
- ¿dos objetos son distintos o equivalentes?;

Esto diferencia Arithmos de una colección de minijuegos matemáticos.

---

## 9. Mundo y regiones — PROPOSED

### La Plaza de las Medidas
Introducción a cantidad, comparación y operaciones.

### Los Jardines Fraccionados
Superficies, proporciones, escalas y particiones.

### La Ciudad Espejo
Negativos, simetría, coordenadas y transformaciones.

### Los Talleres de Forma
Geometría, construcción, área, semejanza.

### El Distrito de las Incógnitas
Álgebra y equivalencias.

### Las Máquinas de Función
Composición, inversa y gráficos como paisaje.

### El Laberinto Combinatorio
Rutas, conteo, grafos.

### El Archivo Modular
Primos, restos y criptografía.

No todos deben existir en v1.

---

## 10. Personajes — PROPOSED

Arithmos puede tener habitantes ligados a escuelas de representación, evitando «sabios que enseñan fórmulas».

### Tessa — nombre provisional
Cartógrafa que cree que todo problema puede resolverse con una buena representación, pero a veces elige la incorrecta.

### Nodo — nombre provisional
Pequeña entidad geométrica que puede cambiar de forma conservando una propiedad central. Sirve como compañero y demostración viviente de equivalencia.

### Los Conservadores
No villanos: comunidades que aprendieron a preservar una representación porque en algún momento fue útil y dejaron de traducir entre lenguajes.

Nombres totalmente abiertos.

---

## 11. Arcos propuestos

### ARCO I — CANTIDAD
Naturales, operaciones, descomposición, divisibilidad básica.

### ARCO II — RELACIÓN
Fracciones, razones, proporciones, porcentajes, escala.

### ARCO III — ESPACIO
Geometría, coordenadas, transformaciones, área y semejanza.

### ARCO IV — DESCONOCIDO
Álgebra, ecuaciones, variables y funciones.

### ARCO V — ESTRUCTURA
Combinatoria, probabilidad, grafos y optimización.

### ARCO VI — CICLOS
Teoría de números y modularidad avanzada.

---

## 12. Vertical slice

### Duración
15–20 minutos.

### Objetivo
Demostrar que matemática puede ser una física de mundo, no una capa de preguntas.

### Secuencia
1. Aula de Matemática y tablero de proyección.
2. llegada a Plaza de las Medidas.
3. puente marcado 6: el jugador puede construirlo como 3+3, 2+2+2 o 2×3 con piezas compatibles.
4. puerta de equivalencia: dos lados deben representar la misma cantidad de forma distinta.
5. zona de partición: dividir una plataforma y redistribuir fracciones.
6. puzzle geométrico corto: transformar/rotar piezas conservando área para formar un camino.
7. prueba integradora con varias soluciones.
8. restauración de un mecanismo urbano.
9. Bitácora formaliza equivalencia, composición y fracción.
10. gancho: aparece una máquina `x → ?` que todavía no puede comprenderse.

---

## 13. Diseño de dificultad

Dificultad creciente por:
- número de relaciones simultáneas;
- libertad de representación;
- combinaciones posibles;
- restricciones;
- necesidad de reconocer invariantes.

Evitar cuentas grandes como falsa dificultad.

---

## 14. Dirección visual

### Cámara
Isométrica 2.5D.

### Mundo
- arquitectura geométrica;
- teselaciones;
- mosaicos;
- mecanismos;
- sólidos;
- puentes plegables;
- espacios que cambian de escala;
- simetrías y patrones;
- materiales físicos cálidos, no «pantalla de matemática».

### Principio
La belleza debe surgir del orden, la transformación y la sorpresa espacial.

---

## 15. UI

Las operaciones disponibles pueden vivir en un instrumento diegético.

El jugador debe ver:
- qué propiedad tiene un objeto;
- qué operación realizará;
- qué cambió;
- qué se conservó.

La UI no debe llenar la pantalla de ecuaciones salvo que el jugador active la capa académica.

---

## 16. Bitácora

Arithmos es ideal para mostrar múltiples representaciones de la misma experiencia:

- dibujo;
- manipulación realizada;
- expresión numérica;
- expresión algebraica;
- gráfico/diagrama;
- explicación verbal.

La Bitácora puede permitir cambiar entre representaciones para reforzar equivalencia.

---

## 17. Accesibilidad

- manipulación con snap;
- undo ilimitado;
- historial de transformaciones;
- pistas que señalan invariantes y no resultados;
- tamaños ajustables;
- lectura verbal de expresiones;
- evitar depender de color;
- capa concreta antes de símbolos.

---

## 18. Riesgos

1. convertirse en colección de acertijos → mantener verbo TRANSFORMAR y tema de invariantes;
2. abstracción temprana → comenzar con objetos físicos;
3. cuentas disfrazadas → operación siempre debe modificar mundo;
4. lore demasiado solemne → mantener personajes, humor y descubrimiento;
5. demasiados subcampos → definir un arco inicial compacto.

---

## 19. Criterio de éxito

Arithmos funciona cuando el jugador dice:

> «No resolví una cuenta para abrir la puerta; cambié la estructura hasta que dos cosas distintas significaron lo mismo.»
