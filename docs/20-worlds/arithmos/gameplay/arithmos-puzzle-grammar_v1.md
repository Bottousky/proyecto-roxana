---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 7 — gramática de puzzles, sólo como insumo; reescrito y reclasificado)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ./arithmos-transformation-system_v1.md
  - ./arithmos-representation-system_v1.md
open_questions:
  - A-PG-Q1 — ¿Qué familias A1–A12 entran en campaña principal y cuáles quedan en mastery? (lista provisional: A1–A8 en principal; A9–A12 en mastery con escapes a principal)
  - A-PG-Q2 — ¿Las variables de dificultad se eligen por puzzle individual o por familia? (esta v1 propone por familia + ajuste individual)
  - A-PG-Q3 — ¿Una familia admite más de una propiedad activa simultánea? Esto cambia la complejidad de las precondiciones
  - A-PG-Q4 — ¿Las familias A11 (inversión) y A10 (máquina) son la misma familia vista desde dos lados? Decisión a tomar en prototipo
  - A-PG-Q5 — ¿Cómo se valida que un puzzle es "diversión" sin caer en métricas arbitrarias (DL-Q2)?
---

# ARITHMOS · PUZZLE GRAMMAR · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.
> Define las 12 familias de puzzle, sus precondiciones, sus
> poscondiciones y sus variables de dificultad.

> **Relación con el Transformation System.** Cada familia invoca
> una o más operaciones del catálogo cerrado (C1.1–C4.5). Las
> familias **no** redefinen operaciones; las combinan.

> **Relación con el Representation System.** Cada familia admite
> varias representaciones del mismo objeto. La "representación
> preferida" se documenta por familia; el jugador puede cambiarla
> si conserva el invariante.

---

## 1. La gramática en una página

| # | Familia | Idea jugable | Operación del sistema | Representación preferida |
|---|---|---|---|---|
| A1 | Conservación | Cambiar forma sin cambiar cantidad | C1.1 `agrupar`, C1.2 `separar` | R1 cantidad → R4 conjunto |
| A2 | Descomposición | Romper un valor o forma en partes útiles | C2.1 `factorizar`, C2.3 `fraccionar` | R6 factor, R7 fracción |
| A3 | Equivalencia | Encontrar otra representación del mismo objeto | C2.5 `sustituir` | cualquier par conmutable |
| A4 | Balance | Mantener igualdad mientras se transforma | C2.4 `balancear` | R8 razón |
| A5 | Escala | Razones, proporciones, semejanza | C2.2 `escalar` | R8 razón, R3 recta |
| A6 | Restricción geométrica | Área, perímetro, ángulo, encastre | C3.1 `rotar`, C3.5 `recomponer` | R5 área, R11 geometría |
| A7 | Patrón | Inferir regla y extender estructura | C1.5 `comparar` + reconocimiento | R4 conjunto, R11 geometría |
| A8 | Ruta óptima | Grafo, costos, caminos | C4.3 `grafo` | R11 grafo |
| A9 | Combinación | Construir configuraciones con restricciones | C1.1 `agrupar` + restricciones | R4 conjunto, R6 factor |
| A10 | Máquina | Una función transforma inputs en outputs | C4.1 `función` | R9 expresión → R1 cantidad |
| A11 | Inversión | Encontrar qué input produce un estado | inversa de C4.1 | R9 expresión |
| A12 | Generalización | Descubrir regla que funciona para familia de casos | composición abierta | cualquier par |

> **Cobertura de la DoD.** La sesión P5 exige ≥ 8 de 12 familias
> con variables de dificultad. Este documento cubre las 12. La
> decisión de cuáles entran en campaña principal y cuáles en
> mastery se delega al `arithmos-mechanics-progression_v1.md`
> (A-PG-Q1).

---

## 2. Anatomía de un puzzle de Arithmos

Todo puzzle de Arithmos tiene:

1. **Estado inicial.** Un conjunto de objetos matemáticos
   tangibles con propiedades observables.
2. **Invariante activo.** Una propiedad que el puzzle declara
   (cantidad, área, equivalencia, etc.). Se marca con la
   affordance tipo 3.
3. **Restricciones.** Lo que el jugador *no* puede hacer
   (mover un objeto pesado, atravesar un hueco incompatible,
   etc.).
4. **Operaciones disponibles.** Subset del catálogo cerrado
   (C1–C4).
5. **Condición de éxito.** Una o más consecuencias espaciales o
   sistémicas que, cuando se cumplen, declaran el puzzle como
   resuelto.
6. **Múltiples soluciones.** Al menos dos secuencias legales
   distintas llegan a la condición de éxito, salvo que la
   familia o el mastery declaren lo contrario (P07).

> **DoD literal.** Cero dependencia de cuestionarios o multiple
> choice. El jugador *transforma*, no contesta.

---

## 3. Familias A1–A12

### 3.1. A1 — Conservación

**Idea jugable.** Cambiar la forma de un objeto o configuración
sin cambiar la cantidad.

**Operación del sistema.** C1.1 `agrupar` y C1.2 `separar`
(cambio entre R1 cantidad y R4 conjunto).

**Precondiciones.**

- Existe al menos un objeto con cantidad explícita.
- La cantidad es pequeña (rango 1–24, ver
  `gameplay/arithmos-mechanics-progression_v1.md`).
- Existe al menos un mecanismo cuya condición de éxito es
  "cantidad total = N".

**Poscondiciones.**

- Se ha reorganizado la cantidad N en al menos dos
  configuraciones distintas.
- La cantidad total N no cambia.
- Un mecanismo espacial se activa.

**Variables de dificultad.**

- **D1.** Rango de N (más alto = más configuraciones posibles).
- **D2.** Cantidad de *configuraciones aceptadas* por el
  mecanismo (e.g. el puente acepta 4×3, 3×4, 6×2, 2×6, 12×1).
- **D3.** Restricciones de partición (e.g. sólo factores
  primos).
- **D4.** Número de mecanismos simultáneos que comparten la
  misma cantidad.

### 3.2. A2 — Descomposición

**Idea jugable.** Romper un valor o una forma en partes que
sirven para construir otra cosa.

**Operación del sistema.** C2.1 `factorizar` y C2.3 `fraccionar`
(cambio entre R1, R6 factor y R7 fracción).

**Precondiciones.**

- Existe un objeto con cantidad o área explícita.
- Existe un mecanismo que sólo acepta una *descomposición
  específica* del objeto.

**Poscondiciones.**

- El objeto se ha descompuesto en módulos o fracciones
  compatibles.
- La cantidad total o el área total se conserva.
- Un mecanismo modular se activa.

**Variables de dificultad.**

- **D1.** Granularidad de la descomposición (¿cuántas formas
  válidas hay?).
- **D2.** Exigencia de que la descomposición sea *única*
  (e.g. sólo 12 = 3·4 entra, no 2·6). Esto reduce la
  flexibilidad, no la ambigüedad.
- **D3.** Número de módulos independientes que se
  descomponen a la vez.
- **D4.** Apariencia de la fracción (homogénea, heterogénea,
  mixta).

### 3.3. A3 — Equivalencia

**Idea jugable.** Encontrar otra representación del mismo objeto
que abra una ruta antes cerrada.

**Operación del sistema.** C2.5 `sustituir` (cambio entre dos
representaciones conmutables, conservando la propiedad activa).

**Precondiciones.**

- Existe un objeto A con una representación visible.
- Existe un mecanismo que rechaza A pero aceptaría una
  representación B equivalente.
- El jugador conoce o puede inferir la propiedad activa.

**Poscondiciones.**

- El objeto A se sustituye por B (R_i → R_j).
- La propiedad activa se conserva.
- El mecanismo se activa.

**Variables de dificultad.**

- **D1.** Número de representaciones alternativas disponibles.
- **D2.** Cercanía visual entre A y B (e.g. una losa de
  área 6 vs. dos triángulos de área 3 cada uno: la
  equivalencia no es obvia).
- **D3.** Cantidad de mecanismos que rechazan A
  simultáneamente.
- **D4.** Si la equivalencia se exige bajo más de una
  propiedad (área *y* perímetro), la familia se acerca a
  A4 (balance) y se documenta como variante.

### 3.4. A4 — Balance

**Idea jugable.** Mantener una igualdad entre dos lados mientras
se transforma uno o ambos.

**Operación del sistema.** C2.4 `balancear` (operación de
comparación encadenada con reorganización de ambos lados).

**Precondiciones.**

- Existe una estructura dual (plataforma basculante, puente
  doble, balanza).
- Ambos lados tienen una propiedad observable.
- La propiedad activa es la misma en ambos lados.

**Poscondiciones.**

- Ambos lados representan la misma cantidad bajo la
  propiedad activa.
- La estructura dual se nivela.
- Una consecuencia espacial o sistémica se activa.

**Variables de dificultad.**

- **D1.** Cantidad de elementos por lado.
- **D2.** Tipo de propiedad activa (cantidad, peso, área,
  perímetro, valor simbólico).
- **D3.** Si la igualdad se exige *antes* o *después* de una
  transformación.
- **D4.** Disponibilidad de "dummies" (objetos neutros que
  no alteran la propiedad pero cambian la silueta).

### 3.5. A5 — Escala

**Idea jugable.** Cambiar el tamaño de un objeto o
configuración sin cambiar sus proporciones internas.

**Operación del sistema.** C2.2 `escalar` (con factor k entero
o fraccionario).

**Precondiciones.**

- Existe un objeto con forma y tamaño explícitos.
- Existe un mecanismo que exige una escala específica (e.g.
  "esta columna es 3× más alta que ésa").

**Poscondiciones.**

- El objeto se ha escalado por k.
- La proporción interna se conserva.
- El mecanismo se activa o se libera espacio.

**Variables de dificultad.**

- **D1.** Rango de k (entero, fraccionario, mixto).
- **D2.** Cuántas dimensiones se escalan (lineal, área,
  volumen).
- **D3.** Restricción de escala máxima o mínima.
- **D4.** Composición: ¿se exige una *secuencia* de
  escalados, no uno solo?

### 3.6. A6 — Restricción geométrica

**Idea jugable.** Encajar una forma en un espacio con un
contorno, área o perímetro determinado.

**Operación del sistema.** C3.1 `rotar`, C3.2 `reflejar`,
C3.4 `teselar`, C3.5 `recomponer`.

**Precondiciones.**

- Existe un objeto con forma geométrica explícita.
- Existe un hueco con silueta, área o perímetro específico.
- La propiedad activa es geométrica (no numérica).

**Poscondiciones.**

- El objeto se ha transformado geométricamente.
- La propiedad geométrica activa se conserva.
- El objeto encaja y produce una consecuencia.

**Variables de dificultad.**

- **D1.** Cantidad de lados / vértices del objeto.
- **D2.** Libertad de operación: rotar, reflejar, ambas.
- **D3.** Si la teselación se exige *exacta* o
  *aproximada*.
- **D4.** Cantidad de objetos a encajar simultáneamente.

### 3.7. A7 — Patrón

**Idea jugable.** Reconocer una regla y extender una
estructura.

**Operación del sistema.** C1.5 `comparar` + identificación
visual de la regla; secundariamente C3.4 `teselar`.

**Precondiciones.**

- Existe una secuencia visible de objetos / formas / valores.
- La secuencia tiene una regla oculta (aritmética, geométrica,
  combinatoria).
- Existe un lugar donde la secuencia debe extenderse.

**Poscondiciones.**

- El jugador identifica la regla.
- La secuencia se extiende correctamente.
- Una consecuencia espacial o sistémica se activa.

**Variables de dificultad.**

- **D1.** Longitud de la secuencia previa (cuántas muestras
  hay).
- **D2.** Tipo de regla: aditiva, multiplicativa, geométrica,
  combinatoria, modular.
- **D3.** Si la regla tiene una o varias variables ocultas.
- **D4.** Si la secuencia se extiende en 1D, 2D o 3D.

### 3.8. A8 — Ruta óptima

**Idea jugable.** Encontrar un camino en un grafo bajo una
función de costo.

**Operación del sistema.** C4.3 `grafo` (manipulación de
aristas; secundario: C1.5 `comparar` para evaluar costos).

**Precondiciones.**

- Existe un grafo visible con pesos o costos en aristas.
- Existe un origen y un destino.
- Existe una restricción (costo máximo, número de pasos,
  tiempo, etc.).

**Poscondiciones.**

- El jugador identifica o construye una ruta que cumple la
  restricción.
- La ruta produce una consecuencia (abre una región, libera
  un mecanismo).

**Variables de dificultad.**

- **D1.** Tamaño del grafo (nodos y aristas).
- **D2.** Si el costo es uniforme, ponderado, o cambia con
  el tiempo.
- **D3.** Si se exige *camino mínimo*, *camino único*, o
  *un camino dentro de un rango*.
- **D4.** Si el jugador puede *crear* o *eliminar* aristas
  (cambio de topología).

### 3.9. A9 — Combinación

**Idea jugable.** Construir una configuración que cumple
varias restricciones a la vez.

**Operación del sistema.** C1.1 `agrupar` + restricciones
múltiples; secundariamente C2.1 `factorizar`.

**Precondiciones.**

- Existe un conjunto de piezas con propiedades.
- Existen varias restricciones simultáneas (forma, área,
  cantidad, factor).

**Poscondiciones.**

- El jugador construye una configuración que cumple *todas*
  las restricciones.
- Una consecuencia se activa.

**Variables de dificultad.**

- **D1.** Cantidad de piezas disponibles.
- **D2.** Cantidad de restricciones simultáneas.
- **D3.** Si las restricciones son compatibles sólo bajo
  una representación específica.
- **D4.** Si las restricciones cambian con el tiempo o el
  contexto.

### 3.10. A10 — Máquina

**Idea jugable.** Una función `f` transforma inputs en
outputs; el jugador alimenta la máquina.

**Operación del sistema.** C4.1 `función`.

**Precondiciones.**

- Existe una máquina visible con un input y un output
  observables.
- La máquina ejecuta una función conocida o desconocida
  (e.g. `x → 2x + 1`).
- Existe un output deseado y, posiblemente, un input
  disponible.

**Poscondiciones.**

- El jugador alimenta la máquina con el input correcto.
- El output deseado se produce.
- Una consecuencia se activa.

**Variables de dificultad.**

- **D1.** Si la función es visible, parcial u oculta.
- **D2.** Tipo de función: lineal, afín, polinómica,
  compuesta.
- **D3.** Cantidad de inputs simultáneos.
- **D4.** Si la máquina es reversible (A11) o no.

### 3.11. A11 — Inversión

**Idea jugable.** Encontrar el input que produce un output
dado, sin ver la función.

**Operación del sistema.** Inversa de C4.1. En gameplay, el
jugador experimenta con inputs hasta inferir la función y
calcular el input objetivo.

**Precondiciones.**

- Existe una máquina que ejecuta una función desconocida.
- Existe un output objetivo explícito.

**Poscondiciones.**

- El jugador infiere la función y/o el input.
- La máquina produce el output objetivo.
- Una consecuencia se activa.

**Variables de dificultad.**

- **D1.** Cuán observable es la función (ver su forma vs.
  ver sólo inputs y outputs).
- **D2.** Si hay un menú finito de inputs posibles.
- **D3.** Si la función es inyectiva o no (ambigüedad de
  inversión).
- **D4.** Si el jugador debe descubrir la función o sólo el
  input (mastery opcional).

### 3.12. A12 — Generalización

**Idea jugable.** Descubrir una regla que funciona para una
familia de casos, no para uno solo.

**Operación del sistema.** Composición abierta de C1–C4; el
puzzle expone varios casos y exige una regla que los cubra
*todos*.

**Precondiciones.**

- Existen varios casos del mismo tipo de puzzle con
  parámetros distintos.
- Cada caso admite al menos dos soluciones.
- La regla no se da; el jugador debe inferirla.

**Poscondiciones.**

- El jugador articula (no contesta) la regla mediante
  manipulación o, opcionalmente, mediante la Bitácora (capa
  de formalización).
- La regla se aplica a casos nuevos.
- Una consecuencia se activa.

**Variables de dificultad.**

- **D1.** Número de casos a observar.
- **D2.** Heterogeneidad de los casos (parámetros más o
  menos amplios).
- **D3.** Si la regla se exige *operativa* (el jugador la
  ejecuta) o *expresiva* (la nombra).
- **D4.** Si la generalización admite excepciones
  (e.g. "funciona para todo N, salvo N = 0").

---

## 4. Validación por condiciones, no por solución fija

Siguiendo P07, los puzzles validan por **condición de éxito**,
no por *secuencia única*. Esto significa:

- Dos secuencias legales distintas que llegan a la misma
  condición son ambas correctas.
- Una secuencia más costosa (más operaciones, más tiempo) puede
  ser aceptable en campaña principal; en mastery se premia la
  optimización.
- Una secuencia "no óptima" no se rechaza: se devuelve el
  feedback "funciona, pero hay una forma más simple" sólo si
  la dificultad lo declara (DL §4).

---

## 5. Diseño de fallos

Siguiendo P05 y DL §6, el fallo de un puzzle **muestra por qué
la transformación no conservó lo necesario**. Esto produce cinco
familias de feedback observable:

- **FB1 — Desborde / hueco.** Sobra o falta cantidad, área,
  perímetro. La pieza suelta no encaja; el hueco queda vacío.
- **FB2 — Silueta incorrecta.** El objeto entra pero no cierra
  el contorno. Se ve un hueco entre el objeto y el marco.
- **FB3 — Igualdad rota.** La estructura dual no se nivela.
  Vibra, bascula, no entrega el recurso.
- **FB4 — Costo superado.** La ruta supera el costo máximo. El
  mecanismo no se activa.
- **FB5 — Patrón perdido.** La secuencia extendida rompe la
  simetría o la regla. La teselación se ve "rota".

> El feedback es siempre geométrico o físico. Nunca aparece
> "incorrecto" como texto principal (P05, DL §6). P11 refuerza:
> un NPC puede *reaccionar* al resultado, no *explicarlo*.

---

## 6. Variables de dificultad transversales

Las variables de dificultad D1–D4 listadas por familia son
**variables locales**. Arithmos reconoce además variables
**transversales** que aplican a cualquier familia:

- **VT1.** Cantidad de variables simultáneas (más elementos
  en escena).
- **VT2.** Distancia causa–efecto (cuántas operaciones
  separan la entrada de la salida).
- **VT3.** Simultaneidad (varios sistemas interactúan a la
  vez).
- **VT4.** Información incompleta pero inferible.
- **VT5.** Combinación de conceptos (más de una familia en el
  mismo puzzle).
- **VT6.** Cantidad de soluciones válidas.
- **VT7.** Optimización (mastery).

> Esto sigue DL §4. La dificultad debe crecer desde el
> sistema, no desde la opacidad.

---

## 7. Lo que el puzzle grammar NO hace

- No define puzzles concretos (eso es contenido de
  `content/arithmos-arc-01_v1.md` y del `vertical-slice`).
- No prescribe UI ni iconografía.
- No convierte ningún puzzle en un cuestionario.
- No acumula una "tabla de respuestas" ni compara el input
  del jugador contra una "respuesta modelo".
- No premia memorización de algoritmos sin lectura de
  estado (P04, P07).

---

## 8. Lo que este documento NO es

- No es un temario escolar. La cobertura curricular se
  evalúa en la bible de contenido.
- No prescribe motor ni framework.
- No prescribe estilo artístico ni paleta.
- No reemplaza a las bilias de Vision o World Rules. Las
  familias *operacionalizan* la identidad, no la sustituyen.
